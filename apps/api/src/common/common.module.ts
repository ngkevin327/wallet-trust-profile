import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { JsonLoggerService } from "./logger/logger.service";
import { RequestIdMiddleware } from "./middleware/request-id.middleware";

@Module({
  providers: [JsonLoggerService, RequestIdMiddleware],
  exports: [JsonLoggerService, RequestIdMiddleware],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
