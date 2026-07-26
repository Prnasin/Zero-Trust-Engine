import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis Connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('❌ Redis Error:', err);
    });
  }

  getClient() {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
