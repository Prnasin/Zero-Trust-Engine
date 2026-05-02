import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './gateway/interceptors/logging.interceptor';
import { ResponseInterceptor } from './gateway/interceptors/response.interceptor';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const loggingService = app.get(LoggingService);
  app.useGlobalFilters(new GlobalExceptionFilter(loggingService));
  app.useGlobalInterceptors(
    new LoggingInterceptor(loggingService),
    new ResponseInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


