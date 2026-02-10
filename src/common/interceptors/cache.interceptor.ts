import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const TTL_MS = 60 * 1000; // 1 phút

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, CacheEntry>();

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method !== "GET") return next.handle();

    const key = this.getCacheKey(req);
    if (!key) return next.handle();

    this.cleanExpired();

    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return of(entry.data);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          expiresAt: Date.now() + TTL_MS,
        });
      }),
    );
  }

  private getCacheKey(req: Request): string | null {
    const path = req.path;
    if (!path.includes("/articles")) return null;
    if (/\/articles\/[^/?]+/.test(path)) return null;
    const query = (req.query as Record<string, string>) || {};
    const sorted = Object.keys(query)
      .sort()
      .map((k) => `${k}=${query[k]}`)
      .join("&");
    return `GET:${path}?${sorted}`;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (v.expiresAt <= now) this.cache.delete(k);
    }
  }
}
