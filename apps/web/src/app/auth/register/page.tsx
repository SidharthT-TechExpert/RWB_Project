'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[^A-Za-z0-9]/, 'At least one special character'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'restaurant_owner']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { register: registerUser, isRegistering } = useAuth();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { role: (searchParams.get('role') as RegisterForm['role']) || 'customer' },
  });

  const role = watch('role');
  const onSubmit = (data: RegisterForm) => registerUser(data);

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-500 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative text-white text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto">
            <UtensilsCrossed className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-bold">Join QuickBite</h2>
          <p className="text-white/80 text-lg">Reserve tables, pre-order food, and skip the wait.</p>
          <div className="space-y-3 text-left">
            {['Free to join', 'Real-time booking updates', 'Pre-order from 1000+ restaurants', 'Exclusive member deals'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">✓</div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md space-y-6">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6 lg:hidden">
              <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              Quick<span className="text-brand-500">Bite</span>
            </Link>
            <h1 className="text-3xl font-bold">Create account</h1>
            <p className="text-muted-foreground mt-2">Already have one? <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">Sign in</Link></p>
          </div>

          {/* Role selection */}
          <div className="flex rounded-xl border overflow-hidden">
            {([['customer', '🍽️ I want to dine'], ['restaurant_owner', '🏪 I own a restaurant']] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setValue('role', v)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${role === v ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
            <Input label="Phone (optional)" type="tel" placeholder="+91 9876543210" leftIcon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              hint="8+ chars, uppercase, number, special character"
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-brand-500 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full" size="lg" isLoading={isRegistering}>
              Create Account
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
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
