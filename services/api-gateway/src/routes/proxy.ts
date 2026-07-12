import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services';
import { authenticate } from '@quickbite/shared';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { createLogger } from '@quickbite/shared';

const logger = createLogger('api-gateway-proxy');
const router = Router();

for (const service of services) {
  const proxy = createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout,
    on: {
      error: (err, req, res) => {
        logger.error(`Proxy error for ${service.name}:`, err);
        (res as Response).status(503).json({
          success: false,
          message: `${service.name} service is currently unavailable`,
        });
      },
      proxyReq: (proxyReq, req) => {
        // req here is IncomingMessage, not Express Request
        const socket = req.socket;
        const ip = (req.headers['x-forwarded-for'] as string) || socket?.remoteAddress || '';
        const host = req.headers['host'] || '';
        proxyReq.setHeader('x-forwarded-for', ip);
        proxyReq.setHeader('x-forwarded-host', host);
        proxyReq.setHeader('x-gateway', 'quickbite-api-gateway');
      },
    },
  });

  const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  // Apply auth rate limiter for auth routes
  if (service.name === 'auth') {
    middlewares.push(authRateLimiter);
  }

  // Apply authentication for protected routes
  if (service.requiresAuth) {
    middlewares.push(authenticate);
  }

  router.use(service.prefix, ...middlewares, proxy);

  logger.info(`Registered proxy: ${service.prefix} -> ${service.url}`);
}

export default router;
