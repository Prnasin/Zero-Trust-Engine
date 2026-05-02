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

@Module({
  imports: [
    AuthModule,
    UserModule,
    GatewayModule,
    LoggingModule,
    ConfigModule.forRoot(), //to use env variables globally
    MongooseModule.forRoot(process.env.MONGODB_URL as string), LoggingModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}




