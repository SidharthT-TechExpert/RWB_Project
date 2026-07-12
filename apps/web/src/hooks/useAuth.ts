'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api, { setAuthTokens, clearAuthTokens } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();

  const { data: me, isLoading: isMeLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await api.post('/auth/register', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success('Welcome to QuickBite!');
      router.push('/');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    },
    onSettled: () => {
      clearAuthTokens();
      clearUser();
      queryClient.clear();
      router.push('/');
      toast.success('Logged out successfully');
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (identifier: string) => {
      const res = await api.post('/auth/send-otp', { identifier });
      return res.data;
    },
    onSuccess: () => toast.success('OTP sent!'),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ identifier, otp }: { identifier: string; otp: string }) => {
      const res = await api.post('/auth/verify-otp', { identifier, otp });
      return res.data.data;
    },
    onSuccess: (data) => {
      const { user, tokens } = data;
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    },
    onSuccess: () => toast.success('Password reset link sent to your email'),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }) => {
      const res = await api.post('/auth/reset-password', { token, password, confirmPassword });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      router.push('/auth/login');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    user: me || user,
    isAuthenticated,
    isMeLoading,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    sendOTP: sendOTPMutation.mutate,
    isSendingOTP: sendOTPMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    isVerifyingOTP: verifyOTPMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
  };
}
