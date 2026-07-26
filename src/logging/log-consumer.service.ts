import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiLog, ApiLogDocument } from './schemas/api-log.schema';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LogConsumerService implements OnModuleInit {
  private readonly logger = new Logger(LogConsumerService.name);
  private readonly streamName = 'audit_logs';
  private readonly groupName = 'audit_group';
  private readonly consumerName = 'consumer1';

  constructor(
    @InjectModel(ApiLog.name)
    private readonly apiLogModel: Model<ApiLogDocument>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.initConsumerGroup();
    // Start listening asynchronously without blocking the startup
    this.listenForLogs();
  }

  private async initConsumerGroup() {
    const redis = this.redisService.getClient();
    try {
      // Create group, MKSTREAM ensures the stream is created if it doesn't exist
      await redis.xgroup('CREATE', this.streamName, this.groupName, '$', 'MKSTREAM');
      this.logger.log(`Created Redis Stream Consumer Group: ${this.groupName}`);
    } catch (err: any) {
      // BUSYGROUP means the group already exists, which is fine
      if (!err.message.includes('BUSYGROUP')) {
        this.logger.error('Failed to create consumer group', err);
      }
    }
  }

  private async listenForLogs() {
    const redis = this.redisService.getClient();

    while (true) {
      try {
        // Block for 5 seconds waiting for new logs, fetch up to 100 at a time
        const streamResults = await redis.xreadgroup(
          'GROUP',
          this.groupName,
          this.consumerName,
          'COUNT',
          100,
          'BLOCK',
          5000,
          'STREAMS',
          this.streamName,
          '>'
        ) as any;

        if (streamResults && streamResults.length > 0) {
          const stream = streamResults[0];
          const messages = stream[1]; // Array of [id, ['payload', jsonString]]

          if (messages && messages.length > 0) {
            const logsToInsert: Partial<ApiLog>[] = [];
            const messageIds: string[] = [];

            for (const msg of messages) {
              const id = msg[0];
              const fields = msg[1];
              
              // Find 'payload' index (ioredis returns array of [key, val, key, val])
              const payloadIndex = fields.indexOf('payload');
              if (payloadIndex !== -1) {
                const logData = JSON.parse(fields[payloadIndex + 1]);
                logsToInsert.push(logData);
              }
              messageIds.push(id);
            }

            if (logsToInsert.length > 0) {
              // Bulk insert into MongoDB (Extremely fast compared to 1x1)
              await this.apiLogModel.insertMany(logsToInsert);
              this.logger.log(`Bulk inserted ${logsToInsert.length} audit logs`);
            }

            // Acknowledge messages so they are removed from PEL
            if (messageIds.length > 0) {
              await redis.xack(this.streamName, this.groupName, ...messageIds);
            }
          }
        }
      } catch (err) {
        this.logger.error('Error while consuming audit logs', err);
        // Add a small delay on error to prevent CPU spinning
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}
