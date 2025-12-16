import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { JsonLoggerService } from "./logger/logger.service";
import { RequestIdMiddleware } from "./middleware/request-id.middleware";
import { SecurityHeadersMiddleware } from "./middleware/security-headers.middleware";

@Module({
  providers: [JsonLoggerService, RequestIdMiddleware, SecurityHeadersMiddleware, RateLimitGuard],
  exports: [JsonLoggerService, RequestIdMiddleware, SecurityHeadersMiddleware, RateLimitGuard],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware, RequestIdMiddleware).forRoutes("*");
  }
}
