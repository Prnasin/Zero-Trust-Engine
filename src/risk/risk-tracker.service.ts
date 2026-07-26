import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RiskTrackerService {
  constructor(private readonly redisService: RedisService) {}

  // =====================================================
  // REQUEST RATE TRACKING
  // =====================================================

  async incrementRequestCount(userId: string, route: string) {
    const redis = this.redisService.getClient();

    const key = `req_count:${userId}:${route}`;

    const requestCount = await redis.incr(key);

    if (requestCount === 1) {
      // 60 second window
      await redis.expire(key, 300);
    }

    return requestCount;
  }
  async getRequestCount(userId: string, route: string) {
    const redis = this.redisService.getClient();

    const value = await redis.get(`req_count:${userId}:${route}`);

    return value ? Number(value) : 0;
  }

  // =====================================================
  // REQUEST RATE BLOCK
  // =====================================================

  // async blockRequests(
  //   userId: string,
  //   route: string,
  // ) {
  //   const redis = this.redisService.getClient();

  //   const key = `req_block:${userId}:${route}`;

  //   // block for 60 seconds
  //   await redis.set(key, 'true', 'EX', 60);
  // }

  async getRequestBlockTTL(userId: string, route: string) {
    const redis = this.redisService.getClient();

    return await redis.ttl(`req_block:${userId}:${route}`);
  }
  // =====================================================
  // RATE LIMIT STRIKES
  // =====================================================

  async incrementRateLimitStrike(userId: string, route: string) {
    const redis = this.redisService.getClient();

    const key = `rate_strike:${userId}:${route}`;

    const strikes = await redis.incr(key);

    if (strikes === 1) {
      await redis.expire(key, 86400);
    }

    return strikes;
  }

  // =====================================================
  // APPLY PROGRESSIVE PENALTY
  // =====================================================

  async applyRateLimitPenalty(userId: string, route: string) {
    const redis = this.redisService.getClient();

    const strikes = await this.incrementRateLimitStrike(userId, route);

    let duration = 60;

    // 2nd abuse
    if (strikes >= 2) {
      duration = 300;
    }

    // 3rd abuse
    if (strikes >= 3) {
      duration = 3600;
    }

    await redis.set(`req_block:${userId}:${route}`, 'true', 'EX', duration);

    return duration;
  }

  // =====================================================
  // FAILED LOGIN ATTEMPTS
  // =====================================================

  async incrementFailedAttempts(email: string) {
    const redis = this.redisService.getClient();

    const key = `fail:${email}`;

    const attempts = await redis.incr(key);
    if (attempts === 1) {
      await redis.expire(key, 300);
    }
    return attempts;
  }

  async getFailedAttempts(email: string) {
    const redis = this.redisService.getClient();

    const value = await redis.get(`fail:${email}`);

    return value ? Number(value) : 0;
  }

  // =====================================================
  // STRIKE TRACKING
  // =====================================================

  async incrementStrike(email: string) {
    const redis = this.redisService.getClient();

    const key = `strike:${email}`;

    const strike = await redis.incr(key);
    if (strike === 1) {
      await redis.expire(key, 86400);
    }
    return strike;
  }

  async getStrike(email: string) {
    const redis = this.redisService.getClient();

    const value = await redis.get(`strike:${email}`);

    return value ? Number(value) : 0;
  }

  // =====================================================
  // TEMPORARY LOGIN LOCK
  // =====================================================

  async lockUser(email: string) {
    const redis = this.redisService.getClient();

    // lock for 30 sec
    await redis.set(`lock:${email}`, 'true', 'EX', 30);

    // reset failed attempts
    await redis.del(`fail:${email}`);
  }

  async getLockTTL(email: string) {
    const redis = this.redisService.getClient();

    return await redis.ttl(`lock:${email}`);
  }

  // =====================================================
  // 1 HOUR ACCOUNT BLOCK
  // =====================================================

  async blockUser(email: string) {
    const redis = this.redisService.getClient();

    // block for 1 hour
    await redis.set(`blocked:${email}`, 'true', 'EX', 3600);
  }

  async getBlockTTL(email: string) {
    const redis = this.redisService.getClient();

    return await redis.ttl(`blocked:${email}`);
  }

  // =====================================================
  // CLEAR LOGIN RISK STATE
  // =====================================================

  async clearLoginRisk(email: string) {
    const redis = this.redisService.getClient();

    await redis.del(`fail:${email}`, `strike:${email}`, `lock:${email}`);
  }

  // =====================================================
  // CACHE RISK DATA
  // =====================================================

  async cacheRisk(userId: string, riskData: any) {
    const redis = this.redisService.getClient();

    await redis.set(`risk:${userId}`, JSON.stringify(riskData), 'EX', 300);
  }

  async getCachedRisk(userId: string) {
    const redis = this.redisService.getClient();

    const data = await redis.get(`risk:${userId}`);

    return data ? JSON.parse(data) : null;
  }

  // =====================================================
  // JWT TOKEN BLACKLISTING (REVOCATION)
  // =====================================================

  async blacklistToken(jti: string, ttlSeconds: number = 86400) {
    const redis = this.redisService.getClient();
    await redis.set(`blacklist:${jti}`, 'true', 'EX', ttlSeconds);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const redis = this.redisService.getClient();
    const result = await redis.get(`blacklist:${jti}`);
    return result === 'true';
  }
}
