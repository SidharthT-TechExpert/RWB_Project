import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);
export const comparePassword = async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);

export const generateOTP = (length = 6): string =>
  crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

export const generateToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const generateSlug = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export const getPaginationParams = (page?: string | number, limit?: string | number) => {
  const p = Math.max(1, parseInt(String(page || 1)));
  const l = Math.min(100, Math.max(1, parseInt(String(limit || 20))));
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const buildPaginationMeta = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

export const addHours = (date: Date, hours: number): Date =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
