import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      this.client = new Redis(redisUrl, this.getCommonRedisOptions());
      this.logger.log('Connecting to Redis with REDIS_URL');
    } else {
      this.client = new Redis(this.getRedisOptionsFromEnv());
      this.logger.log(
        `Connecting to Redis at ${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
      );
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
    const port = Number(this.configService.get('REDIS_PORT') || 6379);
    const useTls = this.configService.get('REDIS_TLS') === 'true';

    return {
      ...this.getCommonRedisOptions(),
      username: this.configService.get('REDIS_USERNAME'),
      host: this.configService.get('REDIS_HOST'),
      port,
      password: this.configService.get('REDIS_PASSWORD'),
      tls: useTls ? {} : undefined,
    };
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
