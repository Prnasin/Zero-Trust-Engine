import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly loggingService: LoggingService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const log = {
          userId: req.user?.sub || null,
          endpoint: req.originalUrl || req.url,
          method: req.method,
          timestamp: new Date(),
          status: res.statusCode,
          duration: Date.now() - start,
          ip: req.context?.ip || null,
        };
        
        this.loggingService.log(log); 
      }),
    );
  }
}