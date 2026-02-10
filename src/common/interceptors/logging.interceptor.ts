import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    const { method, url, ip } = req;
    const requestId = req.requestId ?? "-";
    const userAgent = req.get("user-agent") ?? "";
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          console.log(
            `[${new Date().toISOString()}] [${requestId}] ${method} ${url} ${res.statusCode} ${duration}ms - ${ip} ${userAgent.slice(0, 50)}`,
          );
        },
        error: () => {
          const duration = Date.now() - start;
          console.log(
            `[${new Date().toISOString()}] [${requestId}] ${method} ${url} ERROR ${duration}ms - ${ip}`,
          );
        },
      }),
    );
  }
}
