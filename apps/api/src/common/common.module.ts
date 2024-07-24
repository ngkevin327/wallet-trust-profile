import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { JsonLoggerService } from "./logger/logger.service";
import { RequestIdMiddleware } from "./middleware/request-id.middleware";

@Module({
  providers: [JsonLoggerService, RequestIdMiddleware, RateLimitGuard],
  exports: [JsonLoggerService, RequestIdMiddleware, RateLimitGuard],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
