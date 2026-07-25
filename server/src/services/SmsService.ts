import axios from 'axios';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

/**
 * SMS Service — Multi-provider OTP delivery
 *
 * Priority order:
 *   1. MSG91 (text-only, no voice fallback) — recommended for India
 *   2. 2Factor.in TSMS (transactional text SMS with DLT template)
 *   3. 2Factor.in standard SMS endpoint
 *
 * To use MSG91:
 *   MSG91_AUTH_KEY=<your msg91 auth key>
 *   MSG91_TEMPLATE_ID=<your approved DLT flow template ID>
 *   SMS_PROVIDER=msg91
 *
 * To use 2Factor:
 *   TWOFACTOR_API_KEY=<your 2factor api key>
 *   TWOFACTOR_OTP_TEMPLATE=<template name>   (optional)
 *   SMS_PROVIDER=2factor
 */
export class SmsService {

  /**
   * Send OTP via SMS (text-only, no voice call)
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    // Extract 10-digit number
    const digits = phone.replace(/\D/g, '');
    const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;

    // Dev/test mode — skip real API calls
    const provider = (process.env.SMS_PROVIDER || 'msg91').trim().toLowerCase();
    const msg91AuthKey = (process.env.MSG91_AUTH_KEY || '').trim().replace(/^["']|["']$/g, '');
    const twoFactorApiKey = (process.env.TWOFACTOR_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    const hasRealProvider =
      (provider === 'msg91' && msg91AuthKey && msg91AuthKey !== 'YOUR_MSG91_AUTH_KEY') ||
      (provider === '2factor' && twoFactorApiKey && twoFactorApiKey !== 'YOUR_2FACTOR_API_KEY');

    if (!isProduction() || !hasRealProvider) {
      logger.info(`[DEV MODE SMS MOCK] OTP for ${cleanPhone}: ${otp} (test code: 123456)`);
      return true;
    }

    // ── Provider: MSG91 (Text SMS only, no voice) ────────────────
    if (provider === 'msg91') {
      return this.sendViaMSG91(cleanPhone, otp, msg91AuthKey);
    }

    // ── Provider: 2Factor ─────────────────────────────────────────
    return this.sendVia2Factor(cleanPhone, otp, twoFactorApiKey);
  }

  /**
   * MSG91 — Flow-based DLT SMS (text only, no voice)
   * Docs: https://docs.msg91.com/reference/send-sms
   */
  private async sendViaMSG91(cleanPhone: string, otp: string, authKey: string): Promise<boolean> {
    const templateId = (process.env.MSG91_TEMPLATE_ID || '').trim().replace(/^["']|["']$/g, '');
    const senderId = (process.env.MSG91_SENDER_ID || 'QKBITE').trim().replace(/^["']|["']$/g, '');

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
          recipients: [
            {
              mobiles: `91${cleanPhone}`,
              otp: otp,
              var1: otp,
            }
          ]
        },
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (res.data?.type === 'success' || res.data?.message === 'Message sent successfully') {
        logger.info(`[MSG91 SMS SUCCESS] OTP sent to ${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[MSG91 SMS WARNING] Gateway response for ${cleanPhone}:`, res.data);
        return false;
      }
    } catch (error: unknown) {
      const errMsg = (error as { response?: { data?: unknown }; message?: string })?.response?.data
        || (error as { message?: string })?.message
        || String(error);
      logger.error(`[MSG91 SMS EXCEPTION] Error calling MSG91 API for ${cleanPhone}:`, errMsg);
      return false;
    }
  }

  /**
   * 2Factor — Transactional text SMS (TSMS first, standard fallback)
   * NOTE: Voice call fallback MUST be disabled in your 2Factor account settings.
   * Contact support@2factor.in to disable voice OTP on your API key.
   */
  private async sendVia2Factor(cleanPhone: string, otp: string, apiKey: string): Promise<boolean> {
    const templateName = (process.env.TWOFACTOR_OTP_TEMPLATE || '').trim().replace(/^["']|["']$/g, '');
    const senderId = (process.env.TWOFACTOR_SENDER_ID || 'QKBITE').trim().replace(/^["']|["']$/g, '');

    try {
      // Try TSMS (text-only) endpoint if template is configured
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

      // Standard SMS endpoint
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
      const errMsg = (error as { response?: { data?: unknown }; message?: string })?.response?.data
        || (error as { message?: string })?.message
        || String(error);
      logger.error(`[2FACTOR SMS EXCEPTION] Error for ${cleanPhone}:`, errMsg);
      return false;
    }
  }
}

export const smsService = new SmsService();
