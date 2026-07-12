import { v4 as uuidv4 } from 'uuid';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP,
  addHours,
  addMinutes,
  publishEvent,
  EVENTS,
  ROLES,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
  AppError,
  HTTP_STATUS,
  setCache,
  getCache,
  deleteCache,
  createLogger,
} from '@quickbite/shared';
import { AuthRepository } from '../repositories/AuthRepository';
import { emailService } from './EmailService';
import { IUser } from '../models/User';

const logger = createLogger('auth-service');
const authRepo = new AuthRepository();

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: unknown;
  tokens: AuthTokens;
}

export class AuthService {
  private generateTokens(user: IUser): AuthTokens {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: uuidv4(),
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    if (data.phone) {
      const existingPhone = await authRepo.findUserByPhone(data.phone);
      if (existingPhone) {
        throw new ConflictError('An account with this phone number already exists');
      }
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateToken();

    const user = await authRepo.createUser({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: (data.role as IUser['role']) || ROLES.CUSTOMER,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: addHours(new Date(), 24),
    });

    // Send verification email (non-blocking)
    emailService
      .sendVerificationEmail(user.email, user.name, verificationToken)
      .catch((err) => logger.error('Failed to send verification email:', err));

    // Publish event
    publishEvent('user', EVENTS.USER_REGISTERED, {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }).catch((err) => logger.error('Failed to publish user.registered event:', err));

    const tokens = this.generateTokens(user);
    await authRepo.addRefreshToken(user._id.toString(), tokens.refreshToken);

    logger.info(`User registered: ${user.email}`);

    return { user: user.toJSON(), tokens };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await authRepo.findUserByEmail(data.email, true);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.isSuspended) {
      throw new AppError('Your account has been suspended. Contact support.', HTTP_STATUS.FORBIDDEN);
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        `Account locked. Try again in ${minutesLeft} minutes.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    if (!user.password) {
      throw new AuthenticationError('Please use Google or Apple sign-in');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      if (user.loginAttempts >= 4) {
        await authRepo.incrementLoginAttempts(user._id.toString());
        throw new AppError(
          'Account locked due to too many failed attempts. Try again in 30 minutes.',
          HTTP_STATUS.TOO_MANY_REQUESTS
        );
      }
      await authRepo.incrementLoginAttempts(user._id.toString());
      throw new AuthenticationError('Invalid email or password');
    }

    await authRepo.resetLoginAttempts(user._id.toString());

    const tokens = this.generateTokens(user);
    await authRepo.addRefreshToken(user._id.toString(), tokens.refreshToken);

    logger.info(`User logged in: ${user.email}`);

    return { user: user.toJSON(), tokens };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await authRepo.removeRefreshToken(userId, refreshToken);
    // Blacklist access token (simplified – in prod store in Redis with TTL)
    await setCache(`blacklist:${refreshToken}`, true, 7 * 24 * 60 * 60);
    logger.info(`User logged out: ${userId}`);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const isBlacklisted = await getCache(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been revoked');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await authRepo.findUserByEmail(decoded.email, true);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Rotate refresh token
    await authRepo.removeRefreshToken(user._id.toString(), refreshToken);
    const tokens = this.generateTokens(user);
    await authRepo.addRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await authRepo.findUserByEmailVerificationToken(token);
    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    await authRepo.updateUser(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiry: undefined,
    });

    emailService
      .sendWelcomeEmail(user.email, user.name)
      .catch((err) => logger.error('Failed to send welcome email:', err));

    publishEvent('user', EVENTS.USER_VERIFIED, {
      userId: user._id.toString(),
      email: user.email,
    }).catch((err) => logger.error('Failed to publish user.verified event:', err));
  }

  async sendOTP(identifier: string): Promise<void> {
    const otp = generateOTP();
    await authRepo.createOTP(identifier, otp, 'login', 10);

    // Determine if email or phone
    if (identifier.includes('@')) {
      const user = await authRepo.findUserByEmail(identifier);
      const name = user?.name || 'there';
      await emailService.sendOTPEmail(identifier, name, otp);
    }
    // SMS implementation would go here for phone numbers
    logger.info(`OTP sent to ${identifier}`);
  }

  async verifyOTP(identifier: string, otp: string): Promise<AuthResponse> {
    const otpRecord = await authRepo.findValidOTP(identifier, otp, 'login');
    if (!otpRecord) {
      throw new AuthenticationError('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= 5) {
      throw new AppError('Too many OTP attempts', HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    await authRepo.markOTPUsed(otpRecord._id.toString());

    let user = await authRepo.findUserByEmail(identifier);
    if (!user) {
      // Auto-register user with OTP login
      user = await authRepo.createUser({
        email: identifier,
        name: identifier.split('@')[0],
        isEmailVerified: true,
        role: ROLES.CUSTOMER,
      });
    }

    const tokens = this.generateTokens(user);
    await authRepo.addRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user: user.toJSON(), tokens };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepo.findUserByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = generateToken();
    await authRepo.updateUser(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpiry: addHours(new Date(), 1),
    });

    emailService
      .sendPasswordResetEmail(user.email, user.name, resetToken)
      .catch((err) => logger.error('Failed to send password reset email:', err));
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await authRepo.findUserByPasswordResetToken(token);
    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepo.updateUser(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    // Invalidate all sessions
    await authRepo.removeAllRefreshTokens(user._id.toString());
  }

  async googleAuth(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    let user = await authRepo.findUserByGoogleId(profile.googleId);

    if (!user) {
      user = await authRepo.findUserByEmail(profile.email);
      if (user) {
        await authRepo.updateUser(user._id.toString(), { googleId: profile.googleId });
      } else {
        user = await authRepo.createUser({
          name: profile.name,
          email: profile.email.toLowerCase(),
          googleId: profile.googleId,
          avatar: profile.avatar,
          isEmailVerified: true,
          role: ROLES.CUSTOMER,
        });
      }
    }

    const tokens = this.generateTokens(user);
    await authRepo.addRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user: user.toJSON(), tokens };
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await authRepo.findUserById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await authRepo.findUserByEmail(
      (await authRepo.findUserById(userId))!.email,
      true
    );

    if (!user?.password) {
      throw new AppError('No password set for this account', HTTP_STATUS.BAD_REQUEST);
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepo.updateUser(userId, { password: hashedPassword });
    await authRepo.removeAllRefreshTokens(userId);
  }
}

export const authService = new AuthService();
