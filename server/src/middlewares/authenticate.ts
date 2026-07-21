import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../errors';
import { Role } from '../constants';

declare module 'express-serve-static-core' {
  interface Request { user?: TokenPayload; }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new AuthenticationError('No token provided');
    const token = authHeader.split(' ')[1];
    req.user = verifyAccessToken(token);
    next();
  } catch (error) { next(error); }
};

export const authorize = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AuthenticationError());
    if (!roles.includes(req.user.role as Role)) return next(new AuthorizationError());
    next();
  };

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      req.user = verifyAccessToken(authHeader.split(' ')[1]);
    }
    next();
  } catch { next(); }
};
