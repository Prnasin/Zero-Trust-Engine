import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { RiskService } from 'src/risk/risk.service';
import { RiskTrackerService } from 'src/risk/risk-tracker.service';
import { UserService } from 'src/user/user.service';
import { ROUTE_RATE_LIMITS } from 'src/risk/risk.constants';

@Injectable()
export class RiskGuard implements CanActivate {
  constructor(
    private readonly riskService: RiskService,
    private readonly riskTracker: RiskTrackerService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const email = request.user?.email || request.body?.email || '';
    const ip = request.context?.ip || '';
    const resolvedUserId = userId ? String(userId) : '';
    const route = request.route?.path || request.url;

    const blockedTTL = await this.riskTracker.getRequestBlockTTL(
      resolvedUserId || email,
      route,
    );

    if (blockedTTL > 0) {
      throw new ForbiddenException(
        `Too many requests. Try again after ${blockedTTL} seconds`,
      );
    }

    const [user, requestCount] = await Promise.all([
      resolvedUserId
        ? this.userService.getUserById(resolvedUserId)
        : Promise.resolve(null),

      this.riskTracker.incrementRequestCount(resolvedUserId || email, route),
    ]);

    const limit = ROUTE_RATE_LIMITS[route] || 20;

    if (requestCount > limit) {
      const blockDuration = await this.riskTracker.applyRateLimitPenalty(
        resolvedUserId || email,
        route,
      );

      throw new ForbiddenException(
        `Rate limit exceeded. Blocked for ${blockDuration} seconds`,
      );
    }

    const riskResult = this.riskService.evaluateRisk({
      userId: resolvedUserId,
      ip,
      previousIp: user?.lastIp || undefined,
      requestCount,
    });

    request.risk = riskResult;
    if (resolvedUserId) {
      await this.riskTracker.cacheRisk(resolvedUserId, riskResult);
    }

    if (riskResult.action === 'BLOCK') {
      const jti = request.user?.jti;
      if (jti) {
        // Blacklist this specific compromised token
        await this.riskTracker.blacklistToken(jti);
      }
      throw new ForbiddenException('High risk request blocked');
    }
    if (riskResult.level === 'MEDIUM') {
      console.warn('⚠️ Medium Risk Activity:', riskResult);
    }

    return true;
  }
}
