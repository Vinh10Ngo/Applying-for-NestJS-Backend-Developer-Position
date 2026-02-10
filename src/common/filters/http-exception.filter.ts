import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = "Lỗi không xác định";
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message =
        typeof res === "object" && res !== null && "message" in res
          ? (res as { message: string | string[] }).message
          : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error: exception instanceof HttpException ? exception.name : "Error",
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    };

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(status).json(responseBody);
  }
}
