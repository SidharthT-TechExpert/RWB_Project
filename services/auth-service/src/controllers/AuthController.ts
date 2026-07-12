import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import {
  sendSuccess,
  sendCreated,
  HTTP_STATUS,
  createLogger,
} from '@quickbite/shared';

const logger = createLogger('auth-controller');

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, 'Registration successful. Please verify your email.', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user!.userId;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      sendSuccess(res, 'Tokens refreshed', tokens);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query as { token: string };
      await authService.verifyEmail(token);
      sendSuccess(res, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async sendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.body;
      await authService.sendOTP(identifier);
      sendSuccess(res, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, otp } = req.body;
      const result = await authService.verifyOTP(identifier, otp);
      sendSuccess(res, 'OTP verified successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      sendSuccess(res, 'If that email exists, a reset link has been sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      sendSuccess(res, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);
      sendSuccess(res, 'User retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = (req.user as unknown) as {
        googleId: string;
        email: string;
        name: string;
        avatar?: string;
      };
      const result = await authService.googleAuth(profile);
      // In production, redirect to frontend with tokens
      sendSuccess(res, 'Google authentication successful', result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
