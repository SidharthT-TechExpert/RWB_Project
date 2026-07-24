'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  Globe,
  Shield,
  Bell,
  Smartphone,
  CheckCircle2,
  Save,
  Sliders,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  // Form State
  const [platformName, setPlatformName] = useState('QuickBite');
  const [supportEmail, setSupportEmail] = useState('support@qickbite.com');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Auth & Phone Validation Controls
  const [defaultCountryCode, setDefaultCountryCode] = useState('+91');
  const [phoneValidationMode, setPhoneValidationMode] = useState<'strict_india' | 'international'>('strict_india');
  const [maxDailyOtp, setMaxDailyOtp] = useState('40');
  const [allowDevOtp, setAllowDevOtp] = useState(true);

  // Security
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Platform & Authentication settings updated successfully!');
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6 font-sans select-none pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Platform & System Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Configure platform parameters, regional phone validation controllers, and security rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 shrink-0"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* ── CARD 1: AUTHENTICATION & PHONE VALIDATION CONTROLLER (REQUESTED BY USER) ── */}
      <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Authentication & Phone Validation Controller
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure country codes, phone validation strictness, and daily OTP caps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Country Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Default Country Code
            </label>
            <select
              value={defaultCountryCode}
              onChange={(e) => setDefaultCountryCode(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500"
            >
              <option value="+91">🇮🇳 India (+91) - Default</option>
              <option value="+1">🇺🇸 United States (+1)</option>
              <option value="+44">🇬🇧 United Kingdom (+44)</option>
              <option value="+971">🇦🇪 UAE (+971)</option>
              <option value="+65">🇸🇬 Singapore (+65)</option>
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              Primary country pre-selected for customer mobile login modal.
            </p>
          </div>

          {/* Validation Rule Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Phone Validation Strictness
            </label>
            <select
              value={phoneValidationMode}
              onChange={(e) => setPhoneValidationMode(e.target.value as any)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500"
            >
              <option value="strict_india">Strict 10-Digit Verification (India Only)</option>
              <option value="international">Allow International Formats (8-12 Digits)</option>
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              Enforces exact 10-digit numbers starting with 6-9 for India (+91).
            </p>
          </div>

          {/* Max Daily OTP Cap */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Daily OTP Rate Limit Cap
            </label>
            <input
              type="number"
              value={maxDailyOtp}
              onChange={(e) => setMaxDailyOtp(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Maximum total OTP requests allowed per day across production.
            </p>
          </div>

          {/* Dev Mode OTP Bypass Toggle */}
          <div className="space-y-1.5 flex flex-col justify-center">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Dev Mode Demo OTP (123456)
            </label>
            <div
              onClick={() => setAllowDevOtp(!allowDevOtp)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#060B18] cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Bypass SMS gateway in development mode
              </span>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  allowDevOtp ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    allowDevOtp ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: GENERAL PLATFORM SETTINGS ── */}
      <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              General Platform Identity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Basic brand metadata, support contact, and locale configurations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Default Currency
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Default Timezone
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 3: SECURITY & SESSION RULES ── */}
      <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Security & Session Policies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Session lifetimes and failed password lockout parameters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Max Failed Login Attempts
            </label>
            <input
              type="number"
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#060B18] text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
