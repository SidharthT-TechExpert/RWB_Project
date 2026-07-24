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
    // Read & sanitize API key / template name (strip quotes and whitespace)
    const apiKey = (process.env.TWOFACTOR_API_KEY || this.apiKey).trim().replace(/^["']|["']$/g, '');
    const templateName = (process.env.TWOFACTOR_OTP_TEMPLATE || this.templateName).trim().replace(/^["']|["']$/g, '');

    // Extract 10-digit mobile number (remove country code +91 or non-digits)
    const digits = phone.replace(/\D/g, '');
    const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;

    // In development mode (NODE_ENV !== 'production') or if mock key, bypass real SMS API call to save credits
    if (process.env.NODE_ENV !== 'production' || !apiKey || apiKey === 'mock_api_key' || apiKey === 'YOUR_2FACTOR_API_KEY') {
      logger.info(`[DEV MODE SMS MOCK] Real SMS skipped in development mode. Demo OTP for ${cleanPhone} is: ${otp} (or use test code: 123456)`);
      return true;
    }

    try {
      let url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}`;
      if (templateName) {
        url += `/${encodeURIComponent(templateName)}`;
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
