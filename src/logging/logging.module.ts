import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiLog, ApiLogSchema } from './schemas/api-log.schema';
import { LoggingService } from './logging.service';
import { LogConsumerService } from './log-consumer.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiLog.name, schema: ApiLogSchema }]),
    RedisModule,
  ],
  providers: [LoggingService, LogConsumerService],
  exports: [LoggingService],
})
export class LoggingModule {}
