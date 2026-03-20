/**
 * Redis Cache Client
 * Cache-aside pattern implementation for menu caching and session storage
 */

import Redis from 'ioredis';
import config from '../../core/config/index.js';
import logger, { logCache } from '../../core/utils/logger.js';

/**
 * Redis client instance
 */
let redisClient: Redis | null = null;

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const options: Redis.RedisOptions = {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      keyPrefix: config.redis.keyPrefix,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: false,
    };

    if (config.redis.password) {
      options.password = config.redis.password;
    }

    redisClient = new Redis(options);

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error', error);
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  return redisClient;
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  menu: (restaurantSlug: string) => `menu:${restaurantSlug}`,
  menuById: (restaurantId: string) => `menu:id:${restaurantId}`,
  table: (qrToken: string) => `table:${qrToken}`,
  session: (sessionToken: string) => `session:${sessionToken}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
  order: (orderId: string) => `order:${orderId}`,
  restaurantSettings: (restaurantId: string) => `settings:${restaurantId}`,
};

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  MENU: 3600, // 1 hour
  TABLE: 86400, // 24 hours
  SESSION: 7200, // 2 hours
  REFRESH_TOKEN: 604800, // 7 days
  ORDER: 1800, // 30 minutes
  SETTINGS: 300, // 5 minutes
};

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (value === null) {
      logCache('miss', key);
      return null;
    }
    
    logCache('hit', key);
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error('Cache get error', error as Error, { metadata: { key } });
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.MENU
): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
    logCache('set', key);
    return true;
  } catch (error) {
    logger.error('Cache set error', error as Error, { metadata: { key } });
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    logCache('delete', key);
    return true;
  } catch (error) {
    logger.error('Cache delete error', error as Error, { metadata: { key } });
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(`${config.redis.keyPrefix}${pattern}`);
    
    if (keys.length === 0) {
      return 0;
    }
    
    // Remove the prefix from keys for the del command
    const keysWithoutPrefix = keys.map(key => key.replace(config.redis.keyPrefix, ''));
    await client.del(keysWithoutPrefix);
    
    logger.debug('Cache pattern deleted', {
      metadata: { pattern, count: keys.length },
    });
    
    return keys.length;
  } catch (error) {
    logger.error('Cache pattern delete error', error as Error, {
      metadata: { pattern },
    });
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Cache exists error', error as Error, { metadata: { key } });
    return false;
  }
}

/**
 * Set cache only if key doesn't exist (NX)
 */
export async function setCacheNX<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.SESSION
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.set(key, JSON.stringify(value), 'EX', ttl, 'NX');
    return result === 'OK';
  } catch (error) {
    logger.error('Cache set NX error', error as Error, { metadata: { key } });
    return false;
  }
}

/**
 * Get TTL of a key
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    logger.error('Cache TTL error', error as Error, { metadata: { key } });
    return -1;
  }
}

/**
 * Refresh TTL of a key
 */
export async function refreshCacheTTL(key: string, ttl: number): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.expire(key, ttl);
    return result === 1;
  } catch (error) {
    logger.error('Cache refresh TTL error', error as Error, { metadata: { key } });
    return false;
  }
}

/**
 * Increment a counter in cache
 */
export async function incrementCache(key: string, by: number = 1): Promise<number> {
  try {
    const client = getRedisClient();
    return await client.incrby(key, by);
  } catch (error) {
    logger.error('Cache increment error', error as Error, { metadata: { key } });
    throw error;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', error as Error);
    return false;
  }
}

export default {
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  cacheExists,
  setCacheNX,
  getCacheTTL,
  refreshCacheTTL,
  incrementCache,
  closeRedis,
  checkRedisHealth,
  CacheKeys,
  CacheTTL,
};
