'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const { login, isLoggingIn, sendOTP, isSendingOTP, verifyOTP, isVerifyingOTP } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: LoginForm) => login(data);

  const handleSendOTP = () => {
    if (!identifier) return;
    sendOTP(identifier, { onSuccess: () => setOtpSent(true) });
  };

  const handleVerifyOTP = () => {
    verifyOTP({ identifier, otp });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative text-white text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto">
            <UtensilsCrossed className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-bold">Welcome back</h2>
          <p className="text-white/80 text-lg">Sign in to manage your bookings and orders.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8 lg:hidden">
              <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              Quick<span className="text-brand-500">Bite</span>
            </Link>
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="text-muted-foreground mt-2">New here? <Link href="/auth/register" className="text-brand-500 font-medium hover:underline">Create an account</Link></p>
          </div>

          {/* Toggle login mode */}
          <div className="flex rounded-xl border overflow-hidden">
            <button onClick={() => setOtpMode(false)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!otpMode ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>Password</button>
            <button onClick={() => setOtpMode(true)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${otpMode ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>OTP Login</button>
          </div>

          {!otpMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-brand-500 hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoggingIn}>Sign In</Button>
            </form>
          ) : (
            <div className="space-y-5">
              {!otpSent ? (
                <>
                  <Input
                    label="Email or Phone"
                    placeholder="Enter your email or phone"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <Button className="w-full" size="lg" onClick={handleSendOTP} isLoading={isSendingOTP} disabled={!identifier}>
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">OTP sent to <span className="font-medium text-foreground">{identifier}</span></p>
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newOtp = otp.split('');
                          newOtp[i] = val;
                          setOtp(newOtp.join(''));
                          if (val && e.target.nextSibling) (e.target.nextSibling as HTMLInputElement).focus();
                        }}
                        className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 border-input focus:border-brand-500 focus:outline-none bg-background"
                      />
                    ))}
                  </div>
                  <Button className="w-full" size="lg" onClick={handleVerifyOTP} isLoading={isVerifyingOTP} disabled={otp.length < 6}>
                    Verify OTP
                  </Button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}

          {/* Google OAuth */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>
          <Button variant="outline" className="w-full gap-3" size="lg" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
