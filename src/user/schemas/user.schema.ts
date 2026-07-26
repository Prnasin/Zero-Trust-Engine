import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from './user.types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: Role.USER, enum: Role })
  role!: Role;

  @Prop({ type: String, default: null })
  lastIp!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
