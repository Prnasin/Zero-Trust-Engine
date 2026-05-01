import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggingService } from 'src/logging/logging.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const start = request.context?.requestTime
      ? new Date(request.context.requestTime).getTime()
      : Date.now();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const msg = (res as any).message;
        message = Array.isArray(msg) ? msg.join(', ') : msg;
      }
    }

    // 🔥 LOG TO DB
    this.loggingService.log({
      userId: request.user?.sub || null,
      endpoint: request.originalUrl || request.url,
      method: request.method,
      status,
      duration: Date.now() - start,
      ip: request.context?.ip || null,
      userAgent: request.headers['user-agent'],
      error: message,
    });

    response.status(status).json({
      success: false,
      data: {
        message,
        statusCode: status,
      },
    });
  }
}