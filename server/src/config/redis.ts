import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379');
  const password = process.env.REDIS_PASSWORD || undefined;

  const tlsExplicit = process.env.REDIS_TLS;
  const autoTLS = port === 6380 || host.includes('upstash') || host.includes('redislabs');
  const useTLS =
    tlsExplicit === 'false' ? false :
    tlsExplicit === 'true' ? true :
    autoTLS;

  const commonOptions = {
    retryStrategy: (times: number) => {
      if (times > 5) {
        logger.warn('Redis unavailable after 5 retries — continuing without cache');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  };

  if (redisUrl) {
    const isTLSUrl =
      tlsExplicit === 'false' ? false :
      tlsExplicit === 'true' ? true :
      redisUrl.startsWith('rediss://');
    redisClient = new Redis(redisUrl, { ...commonOptions, tls: isTLSUrl ? {} : undefined });
  } else {
    redisClient = new Redis({ host, port, password, tls: useTLS ? {} : undefined, ...commonOptions });
  }

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') logger.warn(`Redis error (non-fatal): ${err.message}`);
  });

  redisClient.connect().catch(() => {
    logger.warn('Redis connection failed — cache disabled');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) return createRedisClient();
  return redisClient;
};

export const setCache = async (key: string, value: unknown, ttl?: number): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;
    const serialized = JSON.stringify(value);
    if (ttl) await client.setex(key, ttl, serialized);
    else await client.set(key, serialized);
  } catch { /* cache miss ok */ }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return null;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch { return null; }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;
    await client.del(key);
  } catch { /* ignore */ }
};
