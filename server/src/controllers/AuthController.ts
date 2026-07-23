import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { sendSuccess, sendCreated } from '../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Registration successful. Please verify your email.', await authService.register(req.body)); }
    catch (error) { next(error); }
  }
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Login successful', await authService.login(req.body)); }
    catch (error) { next(error); }
  }
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await authService.logout(req.user!.userId, req.body.refreshToken); sendSuccess(res, 'Logged out successfully'); }
    catch (error) { next(error); }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Tokens refreshed', await authService.refreshTokens(req.body.refreshToken)); }
    catch (error) { next(error); }
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await authService.verifyEmail(req.query.token as string); sendSuccess(res, 'Email verified successfully'); }
    catch (error) { next(error); }
  }
  async sendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'OTP sent successfully', await authService.sendOTP(req.body.identifier)); }
    catch (error) { next(error); }
  }
  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'OTP verified', await authService.verifyOTP(req.body.identifier, req.body.otp, req.body.name)); }
    catch (error) { next(error); }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await authService.forgotPassword(req.body.email); sendSuccess(res, 'If that email exists, a reset link has been sent'); }
    catch (error) { next(error); }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await authService.resetPassword(req.body.token, req.body.password); sendSuccess(res, 'Password reset successfully'); }
    catch (error) { next(error); }
  }
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword); sendSuccess(res, 'Password changed successfully'); }
    catch (error) { next(error); }
  }
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'User retrieved', await authService.getMe(req.user!.userId)); }
    catch (error) { next(error); }
  }
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = req.user as unknown as { googleId: string; email: string; name: string; avatar?: string };
      sendSuccess(res, 'Google authentication successful', await authService.googleAuth(profile));
    } catch (error) { next(error); }
  }
}

export const authController = new AuthController();
