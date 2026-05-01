import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiLogDocument = HydratedDocument<ApiLog>;

@Schema({ timestamps: true })
export class ApiLog {
  @Prop({ type: String, default: null })
  userId!: string | null;

  @Prop({ type: String })
  endpoint!: string;

  @Prop({ type: String })
  method!: string;

  @Prop({ type: Number })
  status!: number;

  @Prop({ type: Number })
  duration!: number;

  @Prop({ type: String, default: null })
  ip!: string | null;

  @Prop({ type: String, default: null })
  error?: string;

  @Prop({ type: String, default: null })
  userAgent?: string;
}

export const ApiLogSchema = SchemaFactory.createForClass(ApiLog);