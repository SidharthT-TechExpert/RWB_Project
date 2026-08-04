// ── 1. Load .env files first (so INFISICAL_* vars are available) ──
import './config/env';

import app from './app';
import { loadSecretsFromInfisical } from './config/infisical';
import { connectDatabase } from './config/database';
import { createRedisClient } from './config/redis';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '3000');

const start = async () => {
  // ── 2. Pull secrets from Infisical (before DB connect) ────────
  await loadSecretsFromInfisical();

  // ── 3. Connect to MongoDB ──────────────────────────────────────
  await connectDatabase();

  // ── 4. Connect to Redis (non-blocking) ────────────────────────
  createRedisClient();

  // ── 5. Start HTTP server ───────────────────────────────────────
  const server = app.listen(PORT, () => {
    logger.info(`🚀 QuickBite API running on port ${PORT}`);
    logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔐 Secrets: ${process.env.INFISICAL_PROJECT_ID ? 'Infisical' : 'local .env'}`);
    logger.info(`🌐 Health: http://localhost:${PORT}/health`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use by another process.`);
      logger.info(`👉 Tip: Stop any existing backend server or run "npx kill-port ${PORT}".`);
      process.exit(1);
    }
  });

  // ── 6. Graceful shutdown ───────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
};

start();
