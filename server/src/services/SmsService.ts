import axios from 'axios';
import { logger } from '../config/logger';

export class SmsService {
  private apiKey: string;
  private templateName: string;

  constructor() {
    this.apiKey = process.env.TWOFACTOR_API_KEY || '';
    this.templateName = process.env.TWOFACTOR_OTP_TEMPLATE || '';
  }

  /**
   * Send OTP via 2Factor.in API
   * API Doc: https://2factor.in/v3/documentation
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    // Sanitize phone number (remove + and spaces)
    const cleanPhone = phone.replace(/\D/g, '');

    if (!this.apiKey) {
      logger.info(`[2FACTOR SMS MOCK] API Key missing. OTP for ${cleanPhone} is: ${otp}`);
      return true;
    }

    try {
      let url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${cleanPhone}/${otp}`;
      if (this.templateName) {
        url += `/${encodeURIComponent(this.templateName)}`;
      }

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data?.Status === 'Success') {
        logger.info(`[2FACTOR SMS] OTP sent successfully to ${cleanPhone}`);
        return true;
      } else {
        logger.error(`[2FACTOR SMS ERROR] Failed to send OTP to ${cleanPhone}:`, response.data);
        return false;
      }
    } catch (error: unknown) {
      const errMessage = (error as { message?: string })?.message || String(error);
      logger.error(`[2FACTOR SMS EXCEPTION] Error calling 2Factor API for ${cleanPhone}:`, errMessage);
      return false;
    }
  }
}

export const smsService = new SmsService();
