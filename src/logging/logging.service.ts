import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiLog, ApiLogDocument } from './schemas/api-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(ApiLog.name)
    private readonly apiLogModel: Model<ApiLogDocument>,
  ) {}

  async log(data: Partial<ApiLog>) {
    try {
      await this.apiLogModel.create(data);
    } catch (err) {
      console.error('Failed to store log', err);
    }
  }
}