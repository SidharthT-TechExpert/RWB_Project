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
    // Sanitize phone number (remove + and non-digits)
    const cleanPhone = phone.replace(/\D/g, '');

    if (!this.apiKey || this.apiKey === 'mock_api_key' || this.apiKey === 'YOUR_2FACTOR_API_KEY') {
      logger.info(`[2FACTOR SMS MOCK] API Key missing or mock. OTP for ${cleanPhone} is: ${otp}`);
      return true;
    }

    try {
      let url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${cleanPhone}/${otp}`;
      if (this.templateName) {
        url += `/${encodeURIComponent(this.templateName)}`;
      }

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data?.Status === 'Success') {
        logger.info(`[2FACTOR SMS SUCCESS] OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[2FACTOR SMS WARNING] Gateway response for ${cleanPhone}:`, response.data);
        return false;
      }
    } catch (error: unknown) {
      const errMessage = (error as { message?: string; response?: { data?: unknown } })?.response?.data || (error as { message?: string })?.message || String(error);
      logger.error(`[2FACTOR SMS EXCEPTION] Error calling 2Factor API for ${cleanPhone}:`, errMessage);
      return false;
    }
  }
}

export const smsService = new SmsService();
