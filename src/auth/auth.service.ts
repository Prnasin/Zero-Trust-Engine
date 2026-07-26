import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RiskTrackerService } from 'src/risk/risk-tracker.service';
import { RiskService } from 'src/risk/risk.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly riskTracker: RiskTrackerService,
    
    private readonly riskService: RiskService,
  ) {}
  /*
    1. check if email already exists //user service will get import in auth service
    2. hash the password
    3. store the user in the database //user
    4. generate jwt token
    5. send token in response
    */
  async registerUser(createAuthData: CreateAuthDto) {
    console.log('registerDto', createAuthData);

    const saltRounds = 10; //number of rounds to generate salt, higher the rounds more secure but slower
    const hash = await bcrypt.hash(createAuthData.password, saltRounds);
    const user = await this.userService.createUser({
      ...createAuthData,
      password: hash,
    });
    return {
      message: 'User registered successfully',
      userId: user._id,
    };
  }

  async loginUser(loginData: LoginDto) {
    const user = await this.userService.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // blocked for 1 hour
const blockedTTL =
  await this.riskTracker.getBlockTTL(
    loginData.email,
  );

if (blockedTTL > 0) {
  throw new ForbiddenException(
    `Account blocked. Try again after ${blockedTTL} seconds`,
  );
}

// temporary lock
const lockTTL =
  await this.riskTracker.getLockTTL(
    loginData.email,
  );

if (lockTTL > 0) {
  throw new ForbiddenException(
    `Too many attempts. Try again after ${lockTTL} seconds`,
  );
}

    // const requestCount = await this.riskTracker.incrementRequestCount(String(user._id));
    // const failedAttempts = await this.riskTracker.getFailedAttempts(loginData.email);

    // const riskResult = this.riskService.evaluateRisk({
    //   userId: String(user._id),
    //   ip: loginData.ip || '',
    //   previousIp: user.lastIp || undefined,
    //   requestCount,
    //   failedAttempts,
    // });

    // await this.riskTracker.cacheRisk(String(user._id), riskResult);

    // if (riskResult.action === 'BLOCK') {
    //   throw new ForbiddenException('High risk login blocked');
    // }

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      const attempts = await this.riskTracker.incrementFailedAttempts(loginData.email);

      console.log('ATTEMPTS:', attempts);

      if (attempts >= 5) {
        await this.riskTracker.lockUser(loginData.email);

        const strike = await this.riskTracker.incrementStrike(loginData.email);

        if (strike >= 2) {
          await this.riskTracker.blockUser(loginData.email);
          throw new ForbiddenException('Account blocked for 1 hour');
        }

        throw new ForbiddenException('Too many failed attempts. Wait 30 seconds');
      }

      throw new UnauthorizedException(`Invalid credentials. Attempts left: ${5 - attempts}`);
    }
await this.riskTracker.clearLoginRisk(
  loginData.email,
);
    // await this.riskTracker.resetFailedAttempts(loginData.email);
    const payload = { sub: user._id, role: user.role, email: user.email, jti: randomUUID() };
    if(loginData.ip) {
      await this.userService.updateUserIp(String(user._id), loginData.ip);
    }
    
    const token = await this.jwtService.signAsync(payload);
    
    return { access_token: token };
  }
}
