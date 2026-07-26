import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskTrackerService } from './risk-tracker.service';

@Module({
  providers: [RiskService, RiskTrackerService],
  exports: [RiskService, RiskTrackerService],
})
export class RiskModule {}
