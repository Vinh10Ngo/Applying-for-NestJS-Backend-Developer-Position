import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ArticlesModule } from "./articles/articles.module";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./audit/audit.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { validateEnv } from "./common/config/env.validation";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    HealthModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
