import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

const HEADER = "x-request-id";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers[HEADER] as string) || randomUUID();
    (req as Request & { requestId: string }).requestId = id;
    res.setHeader(HEADER, id);
    next();
  }
}
