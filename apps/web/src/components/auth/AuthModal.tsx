'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, UtensilsCrossed, User, ArrowRight,
  RotateCcw, CheckCircle2, Shield, Sparkles,
} from 'lucide-react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useAuthStore } from '@/store/authStore';
import api, { setAuthTokens } from '@/lib/api';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';

// ── Country codes ──────────────────────────────────────────────
const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1',  flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
];

// ── Spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ── OTP Input ─────────────────────────────────────────────────
function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); inputRefs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    if (!ch) return;
    const next = [...digits]; next[i] = ch;
    onChange(next.join(''));
    if (i < length - 1) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 sm:w-13 sm:h-15 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none
            ${d
              ? 'border-[#FF6B35] bg-gradient-to-b from-[#FF6B35]/10 to-[#FF6B35]/5 text-[#FF6B35] shadow-[inset_0_1px_3px_rgba(255,107,53,0.15),0_0_0_3px_rgba(255,107,53,0.12)]'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white'
            }
            focus:border-[#FF6B35] focus:shadow-[inset_0_1px_3px_rgba(255,107,53,0.15),0_0_0_3px_rgba(255,107,53,0.15)]`}
        />
      ))}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────
function CountdownTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const t = setInterval(() => {
      setRemaining((s) => { if (s <= 1) { clearInterval(t); onComplete(); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, onComplete]);
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return <span className="text-[#FF6B35] font-mono font-bold tabular-nums">{m}:{s}</span>;
}

// ── CTA Button ────────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, loading, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="relative w-full flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-base font-bold tracking-wide text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 60%, #FFB347 100%)',
        boxShadow: disabled ? 'none' : '0 6px 30px rgba(255,107,53,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {/* Shine sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {loading ? <Spinner /> : children}
    </button>
  );
}

// ── Step 1: Phone ─────────────────────────────────────────────
function PhoneStep() {
  const { phone, countryCode, setPhone, setCountryCode, setStep, setIsNewUser, setExistingUser } = useAuthModalStore();
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const selected = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handleContinue = async () => {
    const raw = phone.replace(/\D/g, '');
    if (raw.length < 7) { toast.error('Enter a valid mobile number'); return; }
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${raw}`;
      const { data } = await api.post('/auth/send-otp', { identifier: fullPhone });
      const isNew = data?.data?.isNewUser ?? data?.isNewUser ?? false;
      const existing = data?.data?.user ?? null;
      setIsNewUser(isNew);
      setExistingUser(existing ? { name: existing.name, avatar: existing.avatar, phone: fullPhone } : null);
      setStep(isNew ? 'otp_new' : 'otp_returning');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="phone" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-7">
      {/* Hero text */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
          Welcome to<br />
          <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF9A5C] bg-clip-text text-transparent">QuickBite</span>
        </h2>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
          Reserve tables, pre-order meals, and enjoy smarter dining with one secure verification.
        </p>
      </div>

      {/* Phone input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Mobile Number</label>
        <div className="flex rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-visible focus-within:border-[#FF6B35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.1)] transition-all bg-white dark:bg-gray-900/80">
          {/* Country selector */}
          <div className="relative shrink-0">
            <button type="button" onClick={() => setShowCountries(!showCountries)}
              className="flex items-center gap-1.5 px-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 whitespace-nowrap rounded-l-2xl"
            >
              <span className="text-xl">{selected.flag}</span>
              <span className="text-sm">{selected.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showCountries ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showCountries && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {COUNTRIES.map((c) => (
                    <button key={c.code} type="button" onClick={() => { setCountryCode(c.code); setShowCountries(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${c.code === countryCode ? 'bg-[#FF6B35]/8 text-[#FF6B35] font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="ml-auto text-gray-400 text-xs font-mono">{c.code}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Number */}
          <input
            type="tel"
            inputMode="numeric"
            placeholder="9999845888"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            className="flex-1 px-4 py-4 text-base font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
            maxLength={15}
            autoFocus
          />
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <Shield className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-xs text-green-700 dark:text-green-300 font-medium">We&apos;ll send a secure OTP via SMS. No spam, ever.</p>
      </div>

      <PrimaryBtn onClick={handleContinue} loading={loading} disabled={phone.replace(/\D/g, '').length < 7}>
        Continue <ArrowRight className="w-4 h-4" />
      </PrimaryBtn>

      <p className="text-center text-[11px] text-gray-400 leading-relaxed">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline underline-offset-2 hover:text-[#FF6B35] transition-colors">Terms</a>
        {' '}&amp;{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-[#FF6B35] transition-colors">Privacy Policy</a>
      </p>
    </motion.div>
  );
}

// ── Step 2a: OTP Returning User ───────────────────────────────
function OtpReturningStep() {
  const { phone, countryCode, existingUser, setStep, closeModal } = useAuthModalStore();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const fullPhone = `${countryCode}${phone}`;

  const handleVerify = async () => {
    if (otp.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { identifier: fullPhone, otp });
      const { user, tokens } = data.data;
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      toast.success(`Welcome back, ${user.name}! 👋`);
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await api.post('/auth/send-otp', { identifier: fullPhone }); toast.success('New OTP sent!'); setCanResend(false); }
    catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <motion.div key="otp_returning" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FF9A5C]/10 mb-4">
          <span className="text-3xl">👋</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">We found your account. Verify to continue.</p>
      </div>

      {/* Account card */}
      {existingUser && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-800/40 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
            {existingUser.avatar
              ? <img src={existingUser.avatar} alt={existingUser.name} className="w-full h-full rounded-2xl object-cover" />
              : getInitials(existingUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Your Account</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{existingUser.name}</p>
            <p className="text-xs text-gray-400 font-mono">{fullPhone}</p>
          </div>
          <button onClick={() => setStep('phone')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      )}

      {/* OTP */}
      <div className="space-y-4">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Enter Verification Code</p>
        <OtpInput value={otp} onChange={setOtp} />
        <div className="text-center text-xs text-gray-400">
          {canResend ? (
            <button onClick={handleResend} disabled={resending} className="inline-flex items-center gap-1.5 text-[#FF6B35] font-semibold hover:underline underline-offset-2 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />{resending ? 'Sending…' : 'Resend Code'}
            </button>
          ) : (
            <span>Resend in <CountdownTimer seconds={25} onComplete={() => setCanResend(true)} /></span>
          )}
        </div>
      </div>

      <PrimaryBtn onClick={handleVerify} loading={loading} disabled={otp.length < 6}>
        <CheckCircle2 className="w-4 h-4" /> Verify & Continue
      </PrimaryBtn>

      <p className="text-center text-[11px] text-gray-400">
        Having trouble?{' '}
        <a href="/help" className="underline underline-offset-2 hover:text-[#FF6B35] transition-colors">Contact Support</a>
      </p>
    </motion.div>
  );
}

// ── Step 2b: OTP New User ─────────────────────────────────────
function OtpNewStep() {
  const { phone, countryCode, setStep, closeModal } = useAuthModalStore();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const fullPhone = `${countryCode}${phone}`;

  const handleSubmit = async () => {
    if (otp.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const payload: { identifier: string; otp: string; name?: string } = { identifier: fullPhone, otp };
      if (name.trim()) payload.name = name.trim();
      const { data } = await api.post('/auth/verify-otp', payload);
      const { user, tokens } = data.data;
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      toast.success('Welcome to QuickBite! 🎉');
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await api.post('/auth/send-otp', { identifier: fullPhone }); toast.success('New OTP sent!'); setCanResend(false); }
    catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <motion.div key="otp_new" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wider">New Account</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Let&apos;s Get<br />Started
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Complete your verification in a few seconds.</p>
      </div>

      {/* Name (Optional) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-[#FF6B35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.1)] transition-all bg-white dark:bg-gray-900/80">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="John Mathew (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-base font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* OTP */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Verification Code</p>
          <p className="text-xs text-gray-400">Enter the 6-digit code sent to <span className="font-semibold text-gray-600 dark:text-gray-300 font-mono">{fullPhone}</span></p>
        </div>
        <OtpInput value={otp} onChange={setOtp} />
        <div className="text-center text-xs text-gray-400">
          {canResend ? (
            <button onClick={handleResend} disabled={resending} className="inline-flex items-center gap-1.5 text-[#FF6B35] font-semibold hover:underline underline-offset-2">
              <RotateCcw className="w-3.5 h-3.5" />{resending ? 'Sending…' : 'Resend Code'}
            </button>
          ) : (
            <span>Resend in <CountdownTimer seconds={59} onComplete={() => setCanResend(true)} /></span>
          )}
        </div>
      </div>

      <PrimaryBtn onClick={handleSubmit} loading={loading} disabled={otp.length < 6}>
        <CheckCircle2 className="w-4 h-4" /> Create Account
      </PrimaryBtn>

      <button onClick={() => setStep('phone')} className="text-center text-xs text-gray-400 hover:text-[#FF6B35] transition-colors">
        ← Change mobile number
      </button>

      <p className="text-center text-[11px] text-gray-400 leading-relaxed">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline underline-offset-2 hover:text-[#FF6B35] transition-colors">Terms</a>
        {' '}&amp;{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-[#FF6B35] transition-colors">Privacy Policy</a>
      </p>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────
export function AuthModal() {
  const { isOpen, step, closeModal, reset } = useAuthModalStore();

  const handleClose = useCallback(() => {
    closeModal();
    setTimeout(reset, 350);
  }, [closeModal, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const stepNum = step === 'phone' ? 1 : 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 32 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.35),0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden border border-white/10">

              {/* Top gradient bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#FF6B35] via-[#FF9A5C] to-[#FFB347]" />

              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-3">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF9A5C] flex items-center justify-center shadow-[0_4px_12px_rgba(255,107,53,0.4)]">
                    <UtensilsCrossed className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-[17px] text-gray-900 dark:text-white tracking-tight">
                    Quick<span className="text-[#FF6B35]">Bite</span>
                  </span>
                </div>

                {/* Step + close */}
                <div className="flex items-center gap-3">
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2].map((s) => (
                      <motion.div
                        key={s}
                        animate={{ width: s === stepNum ? 20 : 6 }}
                        className={`h-1.5 rounded-full transition-colors ${s === stepNum ? 'bg-[#FF6B35]' : s < stepNum ? 'bg-[#FF6B35]/40' : 'bg-gray-200 dark:bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{stepNum}/2</span>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors ml-1"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-7 pt-3 pb-8">
                <AnimatePresence mode="wait">
                  {step === 'phone' && <PhoneStep key="phone" />}
                  {step === 'otp_returning' && <OtpReturningStep key="otp_returning" />}
                  {step === 'otp_new' && <OtpNewStep key="otp_new" />}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
