import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyModule } from 'src/policy/policy.module';
import { RiskModule } from 'src/risk/risk.module';
import { RiskGuard } from 'src/common/guards/risk.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PolicyModule, // Importing PolicyModule to use PolicyEngineService in UserService
    RiskModule,
  ],
  controllers: [UserController],
  providers: [UserService, RiskGuard],
  exports: [UserService], //exporting UserService so that it can be used in AuthModule
})
export class UserModule {}
