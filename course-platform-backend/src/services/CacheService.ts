import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class CacheService {
  private client: Redis;
  private defaultTTL: number = 3600; // 1 hora

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  // ============================================
  // OPERACIONES BÁSICAS
  // ============================================

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  // ============================================
  // OPERACIONES CON HASHES
  // ============================================

  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const data = await this.client.hget(key, field);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache hGet error:', error);
      return null;
    }
  }

  async hSet(
    key: string,
    field: string,
    value: any
  ): Promise<void> {
    try {
      await this.client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache hSet error:', error);
    }
  }

  async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const data = await this.client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;
      
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      logger.error('Cache hGetAll error:', error);
      return null;
    }
  }

  async hDelete(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      logger.error('Cache hDelete error:', error);
    }
  }

  // ============================================
  // OPERACIONES CON LISTAS
  // ============================================

  async lPush(key: string, value: any): Promise<void> {
    try {
      await this.client.lpush(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache lPush error:', error);
    }
  }

  async rPush(key: string, value: any): Promise<void> {
    try {
      await this.client.rpush(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache rPush error:', error);
    }
  }

  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const data = await this.client.lrange(key, start, stop);
      return data.map(item => JSON.parse(item));
    } catch (error) {
      logger.error('Cache lRange error:', error);
      return [];
    }
  }

  async lTrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      logger.error('Cache lTrim error:', error);
    }
  }

  // ============================================
  // OPERACIONES CON SETS
  // ============================================

  async sAdd(key: string, value: any): Promise<void> {
    try {
      await this.client.sadd(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache sAdd error:', error);
    }
  }

  async sMembers<T>(key: string): Promise<T[]> {
    try {
      const data = await this.client.smembers(key);
      return data.map(item => JSON.parse(item));
    } catch (error) {
      logger.error('Cache sMembers error:', error);
      return [];
    }
  }

  async sRem(key: string, value: any): Promise<void> {
    try {
      await this.client.srem(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache sRem error:', error);
    }
  }

  // ============================================
  // OPERACIONES CON SORTED SETS
  // ============================================

  async zAdd(key: string, score: number, value: any): Promise<void> {
    try {
      await this.client.zadd(key, score, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache zAdd error:', error);
    }
  }

  async zRange<T>(
    key: string,
    start: number,
    stop: number,
    withScores: boolean = false
  ): Promise<T[] | { value: T; score: number }[]> {
    try {
      if (withScores) {
        const data = await this.client.zrange(key, start, stop, 'WITHSCORES');
        const result: { value: T; score: number }[] = [];
        for (let i = 0; i < data.length; i += 2) {
          result.push({
            value: JSON.parse(data[i]),
            score: parseFloat(data[i + 1])
          });
        }
        return result;
      } else {
        const data = await this.client.zrange(key, start, stop);
        return data.map(item => JSON.parse(item));
      }
    } catch (error) {
      logger.error('Cache zRange error:', error);
      return [];
    }
  }

  async zRevRange<T>(
    key: string,
    start: number,
    stop: number
  ): Promise<T[]> {
    try {
      const data = await this.client.zrevrange(key, start, stop);
      return data.map(item => JSON.parse(item));
    } catch (error) {
      logger.error('Cache zRevRange error:', error);
      return [];
    }
  }

  // ============================================
  // OPERACIONES CON TTL
  // ============================================

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error:', error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Cache ttl error:', error);
      return -1;
    }
  }

  // ============================================
  // OPERACIONES DE PATRÓN
  // ============================================

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Cache deletePattern error:', error);
    }
  }

  // ============================================
  // MÉTODOS ESPECÍFICOS DE LA APLICACIÓN
  // ============================================

  async getCourse(courseId: string): Promise<any | null> {
    return this.get(`course:${courseId}`);
  }

  async setCourse(courseId: string, data: any): Promise<void> {
    return this.set(`course:${courseId}`, data, 1800); // 30 minutos
  }

  async invalidateCourse(courseId: string): Promise<void> {
    await this.delete(`course:${courseId}`);
    await this.deletePattern(`course:${courseId}:*`);
  }

  async getUserSession(userId: string): Promise<any | null> {
    return this.get(`session:${userId}`);
  }

  async setUserSession(userId: string, data: any): Promise<void> {
    return this.set(`session:${userId}`, data, 86400); // 24 horas
  }

  async invalidateUserSession(userId: string): Promise<void> {
    await this.delete(`session:${userId}`);
  }

  async getPopularCourses(): Promise<any[] | null> {
    return this.get('popular:courses');
  }

  async setPopularCourses(courses: any[]): Promise<void> {
    return this.set('popular:courses', courses, 3600); // 1 hora
  }

  // ============================================
  // LIMPIEZA
  // ============================================

  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Exportar instancia singleton
export const cacheService = new CacheService();
