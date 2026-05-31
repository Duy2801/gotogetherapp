import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.getEnv('REDIS_URL');

    if (redisUrl) {
      this.client = new Redis(redisUrl, this.getCommonRedisOptions());
      this.logger.log(`Connecting to Redis with REDIS_URL (${this.getSafeRedisTarget(redisUrl)})`);
    } else {
      const options = this.getRedisOptionsFromEnv();
      this.assertNotLocalRedis(options.host);
      this.logger.log(
        `Connecting to Redis with REDIS_HOST (${options.host}:${options.port})`,
      );
      this.client = new Redis(options);
    }

    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });

    await this.client.ping();
    this.logger.log('Redis connected');
  }

  onModuleDestroy() {
    return this.client?.quit();
  }

  private getCommonRedisOptions(): RedisOptions {
    return {
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    };
  }

  private getRedisOptionsFromEnv(): RedisOptions {
    const host = this.getEnv('REDIS_HOST');
    const password = this.getEnv('REDIS_PASSWORD');
    const port = Number(this.getEnv('REDIS_PORT') || 6379);
    const useTls = this.getEnv('REDIS_TLS') === 'true' || host?.includes('upstash.io');

    if (!host) {
      throw new Error('Missing Redis config: set REDIS_URL or REDIS_HOST.');
    }

    if (!Number.isInteger(port)) {
      throw new Error('Invalid Redis config: REDIS_PORT must be a number.');
    }

    return {
      ...this.getCommonRedisOptions(),
      username: this.getEnv('REDIS_USERNAME'),
      host,
      port,
      password,
      tls: useTls ? {} : undefined,
    };
  }

  private getEnv(key: string): string | undefined {
    const value = this.configService.get<string>(key)?.trim();
    return value || undefined;
  }

  private assertNotLocalRedis(host?: string) {
    const allowLocal = this.getEnv('REDIS_ALLOW_LOCAL') === 'true';
    const isLocal = host === '127.0.0.1' || host === 'localhost' || host === '::1';

    if (isLocal && !allowLocal) {
      throw new Error(
        'Redis is configured to use local Redis. Set REDIS_URL to your Upstash rediss:// URL, or set REDIS_HOST to your Upstash host.',
      );
    }
  }

  private getSafeRedisTarget(redisUrl: string): string {
    try {
      const url = new URL(redisUrl);
      return `${url.protocol}//${url.hostname}:${url.port || 6379}`;
    } catch {
      return 'configured URL';
    }
  }

  /* ========================
      BASIC HELPERS
     ======================== */

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }
}
