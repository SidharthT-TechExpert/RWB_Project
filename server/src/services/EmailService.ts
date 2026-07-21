import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `QuickBite <${process.env.EMAIL_FROM || 'noreply@quickbite.com'}>`,
        to, subject, html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    await this.send(email, 'Verify your QuickBite account', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#FF6B35;">Welcome to QuickBite, ${name}!</h1>
        <p>Please verify your email address to get started.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:16px 0;">Verify Email</a>
        <p style="color:#666;">This link expires in 24 hours.</p>
      </div>`);
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    await this.send(email, 'Reset your QuickBite password', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#FF6B35;">Password Reset</h1>
        <p>Hi ${name}, you requested to reset your password.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:16px 0;">Reset Password</a>
        <p style="color:#666;">This link expires in 1 hour.</p>
      </div>`);
  }

  async sendOTPEmail(email: string, name: string, otp: string): Promise<void> {
    await this.send(email, 'Your QuickBite OTP', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#FF6B35;">Your OTP Code</h1>
        <p>Hi ${name}, here is your one-time password:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#FF6B35;padding:16px;background:#FFF3EE;border-radius:8px;text-align:center;margin:16px 0;">${otp}</div>
        <p style="color:#666;">This OTP expires in 10 minutes. Never share it with anyone.</p>
      </div>`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send(email, 'Welcome to QuickBite!', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#FF6B35;">You're all set, ${name}! 🎉</h1>
        <p>Welcome to QuickBite – the smartest way to dine out.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:16px 0;">Start Exploring</a>
      </div>`);
  }
}

export const emailService = new EmailService();
