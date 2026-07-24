'use client';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Dynamic API URL resolution based on environment and hostname
const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // In production domain, use relative /api/v1 so Nginx proxies directly to API backend
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api/v1';
    }
  }
  return 'http://localhost:3000/api/v1';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach appropriate access token (Admin vs Customer)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isPublicAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/send-otp') ||
      config.url?.includes('/auth/verify-otp') ||
      config.url?.includes('/auth/refresh');

    if (!isPublicAuthEndpoint) {
      // Check if request is an Admin endpoint or from an admin page
      const isAdminRoute =
        config.url?.includes('/admin') ||
        (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

      const token = isAdminRoute
        ? Cookies.get('adminAccessToken') || (typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null)
        : Cookies.get('accessToken') || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401 for protected APIs
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isPublicAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthEndpoint) {
      const isAdminRoute =
        originalRequest.url?.includes('/admin') ||
        (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshKey = isAdminRoute ? 'adminRefreshToken' : 'refreshToken';
      const refreshToken = Cookies.get(refreshKey) || localStorage.getItem(refreshKey);

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error);
        if (isAdminRoute) {
          clearAdminAuthTokens();
        } else {
          clearAuthTokens();
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        if (isAdminRoute) {
          setAdminAuthTokens(accessToken, newRefreshToken);
        } else {
          setAuthTokens(accessToken, newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (isAdminRoute) {
          clearAdminAuthTokens();
        } else {
          clearAuthTokens();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Customer Token Helpers
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1 / 96, sameSite: 'strict' });
  Cookies.set('refreshToken', refreshToken, { expires: 7, sameSite: 'strict' });
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearAuthTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Admin Token Helpers
export const setAdminAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('adminAccessToken', accessToken, { expires: 1 / 96, sameSite: 'strict' });
  Cookies.set('adminRefreshToken', refreshToken, { expires: 7, sameSite: 'strict' });
  localStorage.setItem('adminAccessToken', accessToken);
  localStorage.setItem('adminRefreshToken', refreshToken);
};

export const clearAdminAuthTokens = () => {
  Cookies.remove('adminAccessToken');
  Cookies.remove('adminRefreshToken');
  localStorage.removeItem('adminAccessToken');
  localStorage.removeItem('adminRefreshToken');
};

export default api;
