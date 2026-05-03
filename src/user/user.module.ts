import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyModule } from 'src/policy/policy.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PolicyModule, // Importing PolicyModule to use PolicyEngineService in UserService
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], //exporting UserService so that it can be used in AuthModule
})
export class UserModule {}
