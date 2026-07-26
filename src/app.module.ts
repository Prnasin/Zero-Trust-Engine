import { Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from './gateway/gateway.module';
import { RequestContextMiddleware } from './gateway/middleware/request-context.middleware';
import { LoggingModule } from './logging/logging.module';
import { PolicyModule } from './policy/policy.module';
import { RiskModule } from './risk/risk.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RedisModule,
    GatewayModule,
    LoggingModule,
    ConfigModule.forRoot(), //to use env variables globally
    MongooseModule.forRoot(process.env.MONGODB_URL as string), LoggingModule, PolicyModule, RiskModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}




