'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ResetPasswordPage() {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data: z.infer<typeof schema>) => {
    resetPassword({ token, password: data.password, confirmPassword: data.confirmPassword });
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg font-semibold mb-2">Invalid reset link</p>
        <Link href="/auth/forgot-password" className="text-brand-500 hover:underline text-sm">Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-brand-50 via-white to-orange-50 dark:from-brand-950 dark:via-background dark:to-background">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          Quick<span className="text-brand-500">Bite</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-muted-foreground mt-2">Create a strong new password for your account.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="New Password"
            type={show ? 'text' : 'password'}
            placeholder="Create a strong password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={<button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
            error={errors.password?.message}
            hint="8+ chars, uppercase, number, special character"
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type={show ? 'text' : 'password'}
            placeholder="Repeat your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Reset Password</Button>
        </form>
      </div>
    </div>
  );
}
