import Redis from 'ioredis';
import { createLogger } from '../logger';

const logger = createLogger('redis');

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379');
  const password = process.env.REDIS_PASSWORD || undefined;

  // Use TLS for known cloud Redis providers, non-default ports, or explicit flag
  const useTLS =
    process.env.REDIS_TLS === 'true' ||
    port === 6380 ||
    port !== 6379 ||
    host.includes('upstash') ||
    host.includes('redislabs') ||
    host.includes('.io') ||
    host.includes('.com');

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
    // REDIS_URL takes priority — detect TLS from rediss:// scheme or non-6379 port in URL
    const isTLSUrl = redisUrl.startsWith('rediss://') || process.env.REDIS_TLS === 'true' || useTLS;
    redisClient = new Redis(redisUrl, {
      ...commonOptions,
      tls: isTLSUrl ? {} : undefined,
    });
  } else {
    redisClient = new Redis({
      host,
      port,
      password,
      tls: useTLS ? {} : undefined,
      ...commonOptions,
    });
  }

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => {
    // Don't crash the service if Redis is unavailable
    if (process.env.NODE_ENV !== 'test') {
      logger.warn(`Redis error (non-fatal): ${err.message}`);
    }
  });
  redisClient.on('close', () => logger.warn('Redis connection closed'));

  // Try to connect but don't block startup
  redisClient.connect().catch(() => {
    logger.warn('Redis connection failed — cache disabled, services will still work');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) return createRedisClient();
  return redisClient;
};

// Safe cache helpers — silently fail if Redis is down
export const setCache = async (key: string, value: unknown, ttl?: number): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;
    const serialized = JSON.stringify(value);
    if (ttl) await client.setex(key, ttl, serialized);
    else await client.set(key, serialized);
  } catch {
    // cache miss is fine
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return null;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;
    await client.del(key);
  } catch {
    // ignore
  }
};

export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {
    // ignore
  }
};
