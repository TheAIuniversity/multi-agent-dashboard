import Redis from 'ioredis';
import { logger } from '@/utils/logger';

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
  keyPrefix: 'task-mgmt:',
  family: 4, // IPv4
  keepAlive: 60000,
  db: 0,
};

// Create Redis client for general use
export const redis = new Redis(redisConfig.url, {
  ...redisConfig,
  keyPrefix: 'task-mgmt:main:',
});

// Create Redis client for sessions
export const sessionRedis = new Redis(redisConfig.url, {
  ...redisConfig,
  keyPrefix: 'task-mgmt:session:',
  db: 1,
});

// Create Redis client for rate limiting
export const rateLimitRedis = new Redis(redisConfig.url, {
  ...redisConfig,
  keyPrefix: 'task-mgmt:ratelimit:',
  db: 2,
});

// Create Redis client for pub/sub (WebSocket)
export const pubSubRedis = new Redis(redisConfig.url, {
  ...redisConfig,
  keyPrefix: 'task-mgmt:pubsub:',
  db: 3,
});

// Create Redis client for Bull queue
export const queueRedis = new Redis(redisConfig.url, {
  ...redisConfig,
  keyPrefix: 'task-mgmt:queue:',
  db: 4,
});

// Setup event listeners for main Redis client
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (error) => {
  logger.error('Redis client error', error);
});

redis.on('close', () => {
  logger.warn('Redis client connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

// Setup event listeners for session Redis client
sessionRedis.on('connect', () => {
  logger.info('Session Redis client connected');
});

sessionRedis.on('error', (error) => {
  logger.error('Session Redis client error', error);
});

// Setup event listeners for rate limit Redis client
rateLimitRedis.on('connect', () => {
  logger.info('Rate limit Redis client connected');
});

rateLimitRedis.on('error', (error) => {
  logger.error('Rate limit Redis client error', error);
});

// Setup event listeners for pub/sub Redis client
pubSubRedis.on('connect', () => {
  logger.info('Pub/Sub Redis client connected');
});

pubSubRedis.on('error', (error) => {
  logger.error('Pub/Sub Redis client error', error);
});

// Setup event listeners for queue Redis client
queueRedis.on('connect', () => {
  logger.info('Queue Redis client connected');
});

queueRedis.on('error', (error) => {
  logger.error('Queue Redis client error', error);
});

// Redis utility functions
export class RedisService {
  /**
   * Set a key-value pair with optional TTL
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }
  }

  /**
   * Get a value by key
   */
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Delete a key
   */
  static async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  /**
   * Set TTL for a key
   */
  static async expire(key: string, ttlSeconds: number): Promise<void> {
    await redis.expire(key, ttlSeconds);
  }

  /**
   * Get TTL for a key
   */
  static async ttl(key: string): Promise<number> {
    return await redis.ttl(key);
  }

  /**
   * Increment a numeric value
   */
  static async increment(key: string, amount = 1): Promise<number> {
    return await redis.incrby(key, amount);
  }

  /**
   * Add to a set
   */
  static async addToSet(key: string, ...values: string[]): Promise<void> {
    await redis.sadd(key, ...values);
  }

  /**
   * Get all members of a set
   */
  static async getSetMembers(key: string): Promise<string[]> {
    return await redis.smembers(key);
  }

  /**
   * Remove from a set
   */
  static async removeFromSet(key: string, ...values: string[]): Promise<void> {
    await redis.srem(key, ...values);
  }

  /**
   * Check if a value is in a set
   */
  static async isInSet(key: string, value: string): Promise<boolean> {
    const result = await redis.sismember(key, value);
    return result === 1;
  }

  /**
   * Add to a sorted set with score
   */
  static async addToSortedSet(key: string, score: number, value: string): Promise<void> {
    await redis.zadd(key, score, value);
  }

  /**
   * Get sorted set members by score range
   */
  static async getSortedSetByScore(
    key: string, 
    min: number | string = '-inf', 
    max: number | string = '+inf'
  ): Promise<string[]> {
    return await redis.zrangebyscore(key, min, max);
  }

  /**
   * Remove from sorted set
   */
  static async removeFromSortedSet(key: string, ...values: string[]): Promise<void> {
    await redis.zrem(key, ...values);
  }

  /**
   * Publish a message to a channel
   */
  static async publish(channel: string, message: any): Promise<void> {
    await pubSubRedis.publish(channel, JSON.stringify(message));
  }

  /**
   * Subscribe to a channel
   */
  static async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await pubSubRedis.subscribe(channel);
    pubSubRedis.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch {
          callback(message);
        }
      }
    });
  }

  /**
   * Unsubscribe from a channel
   */
  static async unsubscribe(channel: string): Promise<void> {
    await pubSubRedis.unsubscribe(channel);
  }
}

// Health check function
export async function redisHealthCheck(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', error);
    return false;
  }
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    await Promise.all([
      redis.connect(),
      sessionRedis.connect(),
      rateLimitRedis.connect(),
      pubSubRedis.connect(),
      queueRedis.connect(),
    ]);
    logger.info('All Redis clients connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    await Promise.all([
      redis.disconnect(),
      sessionRedis.disconnect(),
      rateLimitRedis.disconnect(),
      pubSubRedis.disconnect(),
      queueRedis.disconnect(),
    ]);
    logger.info('All Redis clients disconnected successfully');
  } catch (error) {
    logger.error('Failed to disconnect from Redis', error);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRedis();
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
});

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPermissions: (userId: string) => `user:permissions:${userId}`,
  project: (projectId: string) => `project:${projectId}`,
  projectMembers: (projectId: string) => `project:members:${projectId}`,
  tasks: (projectId: string) => `tasks:project:${projectId}`,
  task: (taskId: string) => `task:${taskId}`,
  taskComments: (taskId: string) => `task:comments:${taskId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  search: (query: string, filters?: string) => `search:${query}:${filters || 'all'}`,
  analytics: (projectId: string, period: string) => `analytics:${projectId}:${period}`,
  
  // Session keys
  session: (sessionId: string) => `session:${sessionId}`,
  refreshToken: (tokenId: string) => `refresh:${tokenId}`,
  
  // Rate limiting keys
  rateLimit: (identifier: string, endpoint: string) => `rate:${identifier}:${endpoint}`,
  
  // Real-time keys
  userPresence: (userId: string) => `presence:${userId}`,
  projectPresence: (projectId: string) => `presence:project:${projectId}`,
};