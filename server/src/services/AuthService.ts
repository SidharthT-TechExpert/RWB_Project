import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../models/User';
import { OTP } from '../models/OTP';
import { DailyOTPCount } from '../models/DailyOTPCount';
import { UserProfile } from '../models/UserProfile';
import { emailService } from './EmailService';
import { smsService } from './SmsService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword, generateToken, generateOTP, addHours } from '../utils';
import { setCache, getCache } from '../config/redis';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError, AppError } from '../errors';
import { ROLES } from '../constants';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

export class AuthService {
  private generateTokens(user: IUser) {
    const payload = { userId: user._id.toString(), email: user.email, role: user.role, sessionId: uuidv4() };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) throw new ConflictError('An account with this email already exists');

    if (data.phone) {
      const existingPhone = await User.findOne({ phone: data.phone });
      if (existingPhone) throw new ConflictError('An account with this phone number already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateToken();

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: (data.role as IUser['role']) || ROLES.CUSTOMER,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: addHours(new Date(), 24),
    });

    // Create user profile
    await UserProfile.create({ userId: user._id.toString(), name: user.name, email: user.email, phone: user.phone });

    emailService.sendVerificationEmail(user.email, user.name, verificationToken)
      .catch((err) => logger.error('Failed to send verification email:', err));

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });

    logger.info(`User registered: ${user.email}`);
    return { user: user.toJSON(), tokens };
  }

  async login(data: { email: string; password: string }) {
    const email = (data.email || '').trim().toLowerCase();
    const password = (data.password || '').trim();
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) throw new AuthenticationError('Invalid email or password');

    if (user.isSuspended) throw new AppError('Your account has been suspended.', 403);

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutesLeft} minutes.`, 429);
    }

    if (!user.password) throw new AuthenticationError('Please use Google sign-in');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      if (user.loginAttempts >= 4) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { loginAttempts: 1 },
          $set: { lockUntil: new Date(Date.now() + 30 * 60 * 1000) },
        });
        throw new AppError('Account locked due to too many failed attempts. Try again in 30 minutes.', 429);
      }
      await User.findByIdAndUpdate(user._id, {
        $inc: { loginAttempts: 1 },
      });
      throw new AuthenticationError('Invalid email or password');
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });

    logger.info(`User logged in: ${user.email}`);
    return { user: user.toJSON(), tokens };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: refreshToken } });
    await setCache(`blacklist:${refreshToken}`, true, 7 * 24 * 60 * 60);
    logger.info(`User logged out: ${userId}`);
  }

  async refreshTokens(refreshToken: string) {
    const isBlacklisted = await getCache(`blacklist:${refreshToken}`);
    if (isBlacklisted) throw new AuthenticationError('Token has been revoked');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({ email: decoded.email }).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) throw new AuthenticationError('Invalid refresh token');

    await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: refreshToken } });
    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });
    return tokens;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');
    if (!user) throw new ValidationError('Invalid or expired verification token');

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      $unset: { emailVerificationToken: 1, emailVerificationExpiry: 1 },
    });
    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});
  }

  async sendOTP(identifier: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const maxDailyLimit = parseInt(process.env.MAX_DAILY_OTP || '40', 10);

    const dailyLog = await DailyOTPCount.findOne({ date: todayStr });
    if (dailyLog && dailyLog.count >= maxDailyLimit) {
      throw new AppError(`Daily limit of ${maxDailyLimit} OTPs reached for today. Please try again tomorrow.`, 429);
    }

    const otp = generateOTP();
    await OTP.updateMany({ identifier, isUsed: false }, { isUsed: true });
    await OTP.create({
      identifier, otp, purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const isEmail = identifier.includes('@');
    if (!isEmail) {
      const digits = identifier.replace(/\D/g, '');
      if (digits.length < 10) {
        throw new ValidationError('Please enter a valid 10-digit mobile number');
      }
    }

    let existingUser = null;

    if (isEmail) {
      existingUser = await User.findOne({ email: identifier.toLowerCase() });
      await emailService.sendOTPEmail(identifier, existingUser?.name || 'there', otp);
    } else {
      existingUser = await User.findOne({ phone: identifier });
      const smsSent = await smsService.sendOTP(identifier, otp);
      if (!smsSent) {
        logger.warn(`[SMS GATEWAY NOTICE] Could not send SMS via 2Factor to ${identifier}. Test OTP 123456 or DB OTP enabled.`);
      }
    }

    await DailyOTPCount.findOneAndUpdate(
      { date: todayStr },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    logger.info(`OTP generated for ${identifier}: ${otp}`);
    return {
      isNewUser: !existingUser,
      user: existingUser ? { name: existingUser.name, avatar: existingUser.avatar } : null,
    };
  }

  async verifyOTP(identifier: string, otp: string, name?: string) {
    let otpRecord = await OTP.findOne({
      identifier, otp, purpose: 'login', isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    // Fallback: allow demo OTP "123456" ONLY in non-production environments
    if (!otpRecord && !isProduction() && (otp === '123456' || process.env.ENABLE_DEMO_OTP === 'true')) {
      otpRecord = await OTP.findOne({
        identifier, purpose: 'login', isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });
    }

    if (!otpRecord) throw new AuthenticationError('Invalid or expired OTP');
    if (otpRecord.attempts >= 5) throw new AppError('Too many OTP attempts', 429);

    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    const isEmail = identifier.includes('@');
    let user = isEmail
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ phone: identifier });

    if (!user) {
      const cleanPhone = identifier.replace(/\D/g, '');
      const userEmail = isEmail ? identifier.toLowerCase() : `${cleanPhone}@user.quickbite.com`;
      const userName = name?.trim() || (isEmail ? identifier.split('@')[0] : 'Customer');

      user = await User.create({
        email: userEmail,
        phone: isEmail ? undefined : identifier,
        name: userName,
        isEmailVerified: isEmail,
        isPhoneVerified: !isEmail,
        role: ROLES.CUSTOMER,
      });
      await UserProfile.create({ userId: user._id.toString(), name: user.name, email: user.email, phone: user.phone });
    } else if (name?.trim() && user.name !== name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });
    return { user: user.toJSON(), tokens };
  }

  async truecallerLogin(data: { payload?: string; signature?: string; signatureAlgorithm?: string; phone: string; name?: string }) {
    const { phone, name } = data;
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;

    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      const userEmail = `${cleanPhone.replace(/\D/g, '')}@user.quickbite.com`;
      const userName = name?.trim() || 'Customer';

      user = await User.create({
        email: userEmail,
        phone: cleanPhone,
        name: userName,
        isEmailVerified: false,
        isPhoneVerified: true,
        role: ROLES.CUSTOMER,
      });
      await UserProfile.create({ userId: user._id.toString(), name: user.name, email: user.email, phone: user.phone });
    } else if (name?.trim() && user.name !== name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });
    return { user: user.toJSON(), tokens };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return; // prevent email enumeration
    const resetToken = generateToken();
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: addHours(new Date(), 1),
    });
    emailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch(() => {});
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry');
    if (!user) throw new ValidationError('Invalid or expired reset token');

    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, {
      password: hashed,
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
      $set: { refreshTokens: [] },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user?.password) throw new AppError('No password set for this account', 400);
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new AuthenticationError('Current password is incorrect');
    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashed, $set: { refreshTokens: [] } });
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async googleAuth(profile: { googleId: string; email: string; name: string; avatar?: string }) {
    let user = await User.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await User.findOne({ email: profile.email.toLowerCase() });
      if (user) {
        await User.findByIdAndUpdate(user._id, { googleId: profile.googleId });
      } else {
        user = await User.create({
          name: profile.name,
          email: profile.email.toLowerCase(),
          googleId: profile.googleId,
          avatar: profile.avatar,
          isEmailVerified: true,
          role: ROLES.CUSTOMER,
        });
        await UserProfile.create({ userId: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar });
      }
    }
    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });
    return { user: user.toJSON(), tokens };
  }
}

export const authService = new AuthService();
