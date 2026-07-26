import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    this.redis.on('error', (err) => {
      console.error('❌ Redis Error:', err);
    });
  }

  getClient() {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}