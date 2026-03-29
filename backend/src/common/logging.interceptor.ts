import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const { method, url, ip } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = http.getResponse();
          const statusCode = res.statusCode;
          this.logger.log(
            `${method} ${url} ${statusCode} - ${Date.now() - now}ms - ${ip || 'unknown'}`,
          );
        },
        error: (err) => {
          const statusCode = err.status ?? err.statusCode ?? 500;
          this.logger.warn(
            `${method} ${url} ${statusCode} - ${Date.now() - now}ms - ${ip || 'unknown'} - ${err.message}`,
          );
        },
      }),
    );
  }
}
