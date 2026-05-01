import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiLog, ApiLogSchema } from './schemas/api-log.schema';
import { LoggingService } from './logging.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiLog.name, schema: ApiLogSchema }]),
  ],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}