import { Injectable, Logger } from '@nestjs/common';
import { ApiLog } from './schemas/api-log.schema';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  constructor(private readonly redisService: RedisService) {}

  async log(data: Partial<ApiLog>) {
    try {
      const redis = this.redisService.getClient();
      // Push to Redis Stream asynchronously
      await redis.xadd('audit_logs', '*', 'payload', JSON.stringify(data));
    } catch (err) {
      this.logger.error('Failed to push log to Redis Stream', err);
    }
  }
}
