// policy.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Policy {
  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  resource!: string;

  @Prop({ required: true })
  action!: string;

  @Prop()
  condition?: string;

  @Prop({ required: true })
  allow!: boolean;
}

// THIS IS WHAT YOU WERE MISSING
export const PolicySchema = SchemaFactory.createForClass(Policy);
