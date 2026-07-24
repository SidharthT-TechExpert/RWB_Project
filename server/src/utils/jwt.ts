import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'dev-quickbite-jwt-access-secret-key-321';
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-quickbite-jwt-refresh-secret-key-321';
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload & { iat: number; exp: number } => {
  const secret = process.env.JWT_ACCESS_SECRET || 'dev-quickbite-jwt-access-secret-key-321';
  return jwt.verify(token, secret) as TokenPayload & { iat: number; exp: number };
};

export const verifyRefreshToken = (token: string): TokenPayload & { iat: number; exp: number } => {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-quickbite-jwt-refresh-secret-key-321';
  return jwt.verify(token, secret) as TokenPayload & { iat: number; exp: number };
};
