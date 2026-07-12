import { User, IUser } from '../models/User';
import { OTP, IOTP, OTPPurpose } from '../models/OTP';
import { NotFoundError } from '@quickbite/shared';

export class AuthRepository {
  // User methods
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async findUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password +refreshTokens');
    }
    return query.exec();
  }

  async findUserByPhone(phone: string): Promise<IUser | null> {
    return User.findOne({ phone });
  }

  async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  async findUserByAppleId(appleId: string): Promise<IUser | null> {
    return User.findOne({ appleId });
  }

  async findUserByEmailVerificationToken(token: string): Promise<IUser | null> {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');
  }

  async findUserByPasswordResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry +password');
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async addRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: token },
    });
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token },
    });
  }

  async removeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
    await User.findByIdAndUpdate(userId, {
      $inc: { loginAttempts: 1 },
      $set: { lockUntil },
    });
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });
  }

  // OTP methods
  async createOTP(
    identifier: string,
    otp: string,
    purpose: OTPPurpose,
    expiresInMinutes = 10
  ): Promise<IOTP> {
    // Invalidate existing OTPs for this identifier & purpose
    await OTP.updateMany(
      { identifier, purpose, isUsed: false },
      { isUsed: true }
    );

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    return OTP.create({ identifier, otp, purpose, expiresAt });
  }

  async findValidOTP(
    identifier: string,
    otp: string,
    purpose: OTPPurpose
  ): Promise<IOTP | null> {
    return OTP.findOne({
      identifier,
      otp,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async markOTPUsed(otpId: string): Promise<void> {
    await OTP.findByIdAndUpdate(otpId, { isUsed: true });
  }

  async incrementOTPAttempts(otpId: string): Promise<void> {
    await OTP.findByIdAndUpdate(otpId, { $inc: { attempts: 1 } });
  }
}
