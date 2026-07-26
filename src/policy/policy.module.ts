import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { PolicyEngineService } from './policy-engine.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from './schemas/policy.schema';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }]),
    RiskModule,
  ],
  controllers: [PolicyController],
  providers: [PolicyService, PolicyEngineService],
  exports: [
    PolicyEngineService, // ✅ so other modules can use it
  ],
})
export class PolicyModule {}
