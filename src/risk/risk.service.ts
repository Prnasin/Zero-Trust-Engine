import { Injectable } from '@nestjs/common';
import { RiskInput } from './risk.constants';
import { RiskLevel, RISK_WEIGHTS, RISK_THRESHOLDS } from './risk.constants';
import { RedisService } from 'src/redis/redis.service';
import { RiskTrackerService } from './risk-tracker.service';

@Injectable()
export class RiskService {
  constructor(private readonly redisService: RedisService, private readonly riskTracker: RiskTrackerService) {}

  calculateRiskScore(input: RiskInput) {
  let score = 0;

  // 1. IP Change
  if (
    input.previousIp &&
    input.ip !== input.previousIp
  ) {
    score += RISK_WEIGHTS.IP_CHANGE;
  }

  // 2. Request Rate
  if (input.requestCount > 5) {
    score += RISK_WEIGHTS.HIGH_REQUEST_RATE;
  }

  // 3. Geo Anomaly
  if (
    input.geoLocation &&
    input.previousGeo &&
    input.geoLocation !== input.previousGeo
  ) {
    score += RISK_WEIGHTS.GEO_ANOMALY;
  }

  console.log(score, 'score');

  return score;
}

  getRiskLevel(score: number): RiskLevel {
    if (score < RISK_THRESHOLDS.LOW) return RiskLevel.LOW;
    if (score < RISK_THRESHOLDS.MEDIUM) return RiskLevel.MEDIUM;
    return RiskLevel.HIGH;
  }
  evaluateRisk(input: RiskInput) {
    const score = this.calculateRiskScore(input);
    const level = this.getRiskLevel(score);

    let action = 'ALLOW';

    if (level === 'MEDIUM') action = 'LOG';
    if (level === 'HIGH') action = 'BLOCK';

    return { score, level, action };
  }
}
