'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, UtensilsCrossed, User, ArrowRight,
  RotateCcw, CheckCircle2, Shield, Sparkles, Phone,
  Search, Check,
} from 'lucide-react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useAuthStore } from '@/store/authStore';
import api, { setAuthTokens } from '@/lib/api';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';

// ── Extended Country list with search ──────────────────────────
const COUNTRIES = [
  { code: '+91',  flag: '🇮🇳', name: 'India',        digits: 10 },
  { code: '+1',   flag: '🇺🇸', name: 'United States',digits: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom',digits: 10 },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',    digits: 9  },
  { code: '+971', flag: '🇦🇪', name: 'UAE',          digits: 9  },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',    digits: 8  },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',     digits: 9  },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines',  digits: 10 },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',        digits: 10 },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',      digits: 11 },
];

// ── Loading Spinner ───────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);



// ── High performance OTP Input ────────────────────────────────
function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        onChange(next.join(''));
        inputRefs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    if (!ch) return;
    const next = [...digits];
    next[i] = ch;
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
    <div className="flex gap-2 sm:gap-3 justify-center my-1" onPaste={handlePaste}>
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
          className={`w-11 h-14 sm:w-13 sm:h-15 text-center text-xl font-black rounded-2xl border-2 transition-all duration-200 outline-none
            ${d
              ? 'border-[#FF6B35] bg-gradient-to-b from-[#FF6B35]/15 to-[#FF6B35]/5 text-[#FF6B35] shadow-[0_0_16px_rgba(255,107,53,0.25)] scale-[1.03]'
              : 'border-border/80 bg-muted/50 dark:bg-zinc-900/80 text-foreground'
            }
            focus:border-[#FF6B35] focus:shadow-[0_0_20px_rgba(255,107,53,0.3)] focus:bg-background`}
        />
      ))}
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────────
function CountdownTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const t = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) { clearInterval(t); onComplete(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, onComplete]);

  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return <span className="text-[#FF6B35] font-mono font-bold tabular-nums">{m}:{s}</span>;
}

// ── Upgraded Gradient CTA Button ──────────────────────────────
function PrimaryBtn({ onClick, disabled, loading, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-sm sm:text-base font-extrabold tracking-wide transition-all duration-300 active:scale-[0.98] cursor-pointer
        ${disabled
          ? 'bg-muted dark:bg-zinc-800 text-muted-foreground/60 border border-border/50 cursor-not-allowed shadow-none'
          : 'bg-gradient-to-r from-[#FF6B35] via-[#FF5520] to-[#FF8C5A] hover:from-[#e85a25] hover:to-[#ff7a40] text-white shadow-[0_8px_28px_rgba(255,107,53,0.42)] hover:shadow-[0_12px_36px_rgba(255,107,53,0.55)] hover:scale-[1.01]'
        }`}
    >
      {/* Dynamic shimmer */}
      {!disabled && !loading && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      )}
      {loading ? <Spinner /> : children}
    </button>
  );
}

// ── Step 1: Phone Step ────────────────────────────────────────
function PhoneStep() {
  const { phone, countryCode, setPhone, setCountryCode, setStep, setIsNewUser, setExistingUser, closeModal } = useAuthModalStore();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [search, setSearch] = useState('');
  const selected = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const rawPhone = phone.replace(/\D/g, '');
  const isValid = rawPhone.length >= 7;

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  const handleContinue = async () => {
    if (!isValid) { toast.error('Enter a valid mobile number'); return; }
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${rawPhone}`;
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
    <motion.div
      key="phone"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Top Tag & Hero Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[#FF6B35] font-extrabold text-[10px] uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#FF6B35]" />
          <span>Fast &amp; Secure Access</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
          Welcome to <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF5520] to-[#FF8C5A] bg-clip-text text-transparent">QuickBite</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
          Reserve tables, pre-order meals, and enjoy VIP dining rewards.
        </p>
      </div>



      {/* Phone Number Input */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground">Mobile Number</label>
        <div className="relative flex items-center rounded-2xl border-2 border-border/80 bg-card focus-within:border-[#FF6B35] focus-within:shadow-[0_0_20px_rgba(255,107,53,0.18)] transition-all">
          {/* Country selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowCountries(!showCountries)}
              className="flex items-center gap-1.5 px-3.5 py-3.5 text-xs font-bold text-foreground hover:bg-muted/50 transition-colors border-r border-border/80 whitespace-nowrap rounded-l-2xl"
            >
              <span className="text-base">{selected.flag}</span>
              <span className="font-mono text-xs">{selected.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showCountries ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown with Search */}
            <AnimatePresence>
              {showCountries && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 rounded-xl mb-1.5 border border-border/60">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent outline-none text-xs font-semibold w-full text-foreground placeholder:text-muted-foreground/60"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 no-scrollbar">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setCountryCode(c.code); setShowCountries(false); setSearch(''); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors ${c.code === countryCode ? 'bg-brand-500/10 text-brand-500 font-extrabold' : 'text-foreground hover:bg-muted'}`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="font-semibold truncate">{c.name}</span>
                        <span className="ml-auto text-muted-foreground font-mono text-[10px]">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Number Input */}
          <input
            type="tel"
            inputMode="numeric"
            placeholder="99998 45888"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            className="flex-1 px-3.5 py-3.5 text-sm sm:text-base font-bold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 font-mono tracking-wide"
            maxLength={15}
            autoFocus
          />

          {/* Validated Checkmark Icon */}
          {isValid && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="pr-3.5 shrink-0 text-green-500">
              <CheckCircle2 className="w-5 h-5 fill-green-500/20" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-green-500/8 dark:bg-green-500/12 border border-green-500/20">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse shrink-0" />
        <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-[11px] text-green-700 dark:text-green-300 font-semibold leading-tight">We&apos;ll send a secure 6-digit OTP via SMS. Zero spam.</p>
      </div>

      {/* Primary Action Button */}
      <PrimaryBtn onClick={handleContinue} loading={loading} disabled={!isValid}>
        <span>Continue</span>
        <ArrowRight className="w-4 h-4" />
      </PrimaryBtn>

      {/* Terms */}
      <p className="text-center text-[10px] sm:text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline underline-offset-2 hover:text-[#FF6B35] font-semibold transition-colors">Terms</a>
        {' '}&amp;{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-[#FF6B35] font-semibold transition-colors">Privacy Policy</a>
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
    try {
      await api.post('/auth/send-otp', { identifier: fullPhone });
      toast.success('New OTP sent!');
      setCanResend(false);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      key="otp_returning"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 mb-3 shadow-md">
          <span className="text-2xl">👋</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Welcome Back</h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">We found your QuickBite account. Verify to log in.</p>
      </div>

      {/* Existing Account Card */}
      {existingUser && (
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0">
            {existingUser.avatar
              ? <img src={existingUser.avatar} alt={existingUser.name} className="w-full h-full rounded-xl object-cover" />
              : getInitials(existingUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Account Verified</p>
            <p className="text-sm font-black text-foreground truncate">{existingUser.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{fullPhone}</p>
          </div>
          <button
            onClick={() => setStep('phone')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-muted text-xs font-bold text-brand-500 transition-colors shrink-0"
          >
            Edit
          </button>
        </div>
      )}

      {/* OTP Section */}
      <div className="space-y-3">
        <p className="text-center text-[11px] font-black uppercase tracking-widest text-muted-foreground">Enter 6-Digit Code</p>
        <OtpInput value={otp} onChange={setOtp} />
        <div className="text-center text-xs text-muted-foreground">
          {canResend ? (
            <button onClick={handleResend} disabled={resending} className="inline-flex items-center gap-1.5 text-[#FF6B35] font-bold hover:underline transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />{resending ? 'Sending…' : 'Resend Code'}
            </button>
          ) : (
            <span>Resend in <CountdownTimer seconds={30} onComplete={() => setCanResend(true)} /></span>
          )}
        </div>
      </div>

      <PrimaryBtn onClick={handleVerify} loading={loading} disabled={otp.length < 6}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Verify &amp; Continue</span>
      </PrimaryBtn>

      <p className="text-center text-[11px] text-muted-foreground font-medium">
        Need help?{' '}
        <a href="/help" className="underline underline-offset-2 hover:text-[#FF6B35] font-semibold transition-colors">Contact Support</a>
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
    try {
      await api.post('/auth/send-otp', { identifier: fullPhone });
      toast.success('New OTP sent!');
      setCanResend(false);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      key="otp_new"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[#FF6B35] font-extrabold text-[10px] uppercase tracking-widest mb-3">
          <Sparkles className="w-3 h-3 text-[#FF6B35]" />
          <span>Create Account</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
          Let&apos;s Get Started
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">Verify code sent to <span className="font-mono font-bold text-foreground">{fullPhone}</span></p>
      </div>

      {/* Name (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground">Full Name</label>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">Optional</span>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border-2 border-border/80 bg-card focus-within:border-[#FF6B35] focus-within:shadow-[0_0_20px_rgba(255,107,53,0.18)] transition-all">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-sm font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* OTP Section */}
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Verification Code</p>
        <OtpInput value={otp} onChange={setOtp} />
        <div className="text-center text-xs text-muted-foreground pt-1">
          {canResend ? (
            <button onClick={handleResend} disabled={resending} className="inline-flex items-center gap-1.5 text-[#FF6B35] font-bold hover:underline transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />{resending ? 'Sending…' : 'Resend Code'}
            </button>
          ) : (
            <span>Resend code in <CountdownTimer seconds={59} onComplete={() => setCanResend(true)} /></span>
          )}
        </div>
      </div>

      <PrimaryBtn onClick={handleSubmit} loading={loading} disabled={otp.length < 6}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Create Account</span>
      </PrimaryBtn>

      <button
        onClick={() => setStep('phone')}
        className="text-center text-xs font-bold text-muted-foreground hover:text-[#FF6B35] transition-colors"
      >
        ← Change mobile number
      </button>

      <p className="text-center text-[10px] sm:text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline underline-offset-2 hover:text-[#FF6B35] font-semibold transition-colors">Terms</a>
        {' '}&amp;{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-[#FF6B35] font-semibold transition-colors">Privacy Policy</a>
      </p>
    </motion.div>
  );
}

// ── Main Modal Container ──────────────────────────────────────
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md bg-card dark:bg-[#121110] rounded-[2.25rem] shadow-[0_32px_90px_rgba(0,0,0,0.5),0_0_50px_rgba(255,107,53,0.15)] overflow-hidden border border-white/20 dark:border-white/10 my-auto">

              {/* Ambient Top Glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent pointer-events-none" />

              {/* Top Gradient Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6B35] via-[#FF5520] to-[#FF8C5A]" />

              {/* Modal Header */}
              <div className="relative flex items-center justify-between px-6 pt-5 pb-2.5 z-10">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF4D0F] flex items-center justify-center shadow-[0_4px_16px_rgba(255,107,53,0.45)]">
                    <UtensilsCrossed className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-lg text-foreground tracking-tight">
                    Quick<span className="text-[#FF6B35]">Bite</span>
                  </span>
                </div>

                {/* Progress Indicators & Close */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2].map((s) => (
                      <motion.div
                        key={s}
                        animate={{ width: s === stepNum ? 20 : 6 }}
                        className={`h-1.5 rounded-full transition-colors ${s === stepNum ? 'bg-[#FF6B35]' : s < stepNum ? 'bg-[#FF6B35]/40' : 'bg-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">{stepNum}/2</span>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors cursor-pointer border border-border/60 ml-0.5"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <div className="relative px-6 pt-2 pb-7 z-10">
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
