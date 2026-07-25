import axios from 'axios';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

/**
 * SMS Service — Multi-provider OTP delivery
 *
 * Priority order:
 *   1. Fast2SMS Quick OTP (text-only, no DLT needed, no voice)  SMS_PROVIDER=fast2sms
 *   2. MSG91 (text-only, DLT required)                          SMS_PROVIDER=msg91
 *   3. 2Factor.in (may have voice fallback)                     SMS_PROVIDER=2factor
 *
 * Fast2SMS (current default):
 *   FAST2SMS_API_KEY=<your api key from fast2sms.com/dev/api>
 *   SMS_PROVIDER=fast2sms
 */
export class SmsService {

  /**
   * Send OTP via SMS (text-only, no voice call)
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    // Extract 10-digit number
    const digits = phone.replace(/\D/g, '');
    const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;
    const formattedPhone = `+91${cleanPhone}`;

    const provider = (process.env.SMS_PROVIDER || 'fast2sms').trim().toLowerCase();

    const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const msg91AuthKey = (process.env.MSG91_AUTH_KEY || '').trim().replace(/^["']|["']$/g, '');
    const twoFactorApiKey = (process.env.TWOFACTOR_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    const hasRealProvider =
      (provider === 'fast2sms' && fast2smsKey) ||
      (provider === 'msg91' && msg91AuthKey && msg91AuthKey !== 'YOUR_MSG91_AUTH_KEY') ||
      (provider === '2factor' && twoFactorApiKey && twoFactorApiKey !== 'YOUR_2FACTOR_API_KEY');

    if (!isProduction() || !hasRealProvider) {
      logger.info(`[DEV MODE SMS MOCK] OTP for ${cleanPhone}: ${otp} (test code: 123456)`);
      return true;
    }

    // ── Provider: Fast2SMS (No DLT, Text-only, Recommended) ──────
    if (provider === 'fast2sms') {
      return this.sendViaFast2SMS(cleanPhone, otp, fast2smsKey);
    }

    // ── Provider: MSG91 ───────────────────────────────────────────
    if (provider === 'msg91') {
      return this.sendViaMSG91(cleanPhone, otp, msg91AuthKey);
    }

    // ── Provider: 2Factor ─────────────────────────────────────────
    return this.sendVia2Factor(cleanPhone, otp, twoFactorApiKey);
  }

  /**
   * Fast2SMS Quick OTP — No DLT registration needed, text SMS only
   * Docs: https://www.fast2sms.com/dev/api
   * Uses the "otp" route which sends: "Your OTP is {otp}"
   */
  private async sendViaFast2SMS(cleanPhone: string, otp: string, apiKey: string): Promise<boolean> {
    try {
      const res = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'otp',
          variables_values: otp,
          flash: 0,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (res.data?.return === true || res.data?.status_code === 200) {
        logger.info(`[FAST2SMS OTP SUCCESS] Text SMS OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[FAST2SMS OTP WARNING] Response for ${cleanPhone}:`, res.data);
        return false;
      }
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: unknown }; message?: string })?.response?.data ||
        (error as { message?: string })?.message ||
        String(error);
      logger.error(`[FAST2SMS OTP EXCEPTION] Error for ${cleanPhone}:`, errMsg);
      return false;
    }
  }

  /**
   * MSG91 — Flow-based DLT SMS (text only, no voice)
   * Docs: https://docs.msg91.com/reference/send-sms
   */
  private async sendViaMSG91(cleanPhone: string, otp: string, authKey: string): Promise<boolean> {
    const templateId = (process.env.MSG91_TEMPLATE_ID || '').trim().replace(/^["']|["']$/g, '');

    if (!templateId) {
      logger.error('[MSG91] MSG91_TEMPLATE_ID not set. Cannot send SMS.');
      return false;
    }

    try {
      const res = await axios.post(
        'https://control.msg91.com/api/v5/flow',
        {
          template_id: templateId,
          short_url: '0',
          recipients: [{ mobiles: `91${cleanPhone}`, otp, var1: otp }],
        },
        {
          headers: { authkey: authKey, 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      if (res.data?.type === 'success') {
        logger.info(`[MSG91 SMS SUCCESS] OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[MSG91 SMS WARNING] Response for ${cleanPhone}:`, res.data);
        return false;
      }
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: unknown }; message?: string })?.response?.data ||
        (error as { message?: string })?.message ||
        String(error);
      logger.error(`[MSG91 SMS EXCEPTION] Error for ${cleanPhone}:`, errMsg);
      return false;
    }
  }

  /**
   * 2Factor — Transactional SMS
   * NOTE: Contact support@2factor.in to disable voice OTP fallback on your API key.
   */
  private async sendVia2Factor(cleanPhone: string, otp: string, apiKey: string): Promise<boolean> {
    const templateName = (process.env.TWOFACTOR_OTP_TEMPLATE || '').trim().replace(/^["']|["']$/g, '');
    const senderId = (process.env.TWOFACTOR_SENDER_ID || 'QKBITE').trim().replace(/^["']|["']$/g, '');

    try {
      if (templateName) {
        try {
          const tsmsRes = await axios.post(
            `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`,
            { From: senderId, To: cleanPhone, TemplateName: templateName, VAR1: otp },
            { timeout: 8000 }
          );
          if (tsmsRes.data?.Status === 'Success') {
            logger.info(`[2FACTOR TSMS SUCCESS] Text SMS OTP sent to ${cleanPhone}`);
            return true;
          }
        } catch {
          logger.warn(`[2FACTOR TSMS] Falling back to standard SMS endpoint...`);
        }
      }

      let url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${cleanPhone}/${otp}`;
      if (templateName) url += `/${encodeURIComponent(templateName)}`;

      const res = await axios.get(url, { timeout: 10000 });
      if (res.data?.Status === 'Success') {
        logger.info(`[2FACTOR SMS SUCCESS] OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[2FACTOR SMS WARNING] Response for ${cleanPhone}:`, res.data);
        return false;
      }
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: unknown }; message?: string })?.response?.data ||
        (error as { message?: string })?.message ||
        String(error);
      logger.error(`[2FACTOR SMS EXCEPTION] Error for ${cleanPhone}:`, errMsg);
      return false;
    }
  }
}

export const smsService = new SmsService();
