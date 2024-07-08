import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadApiEnv } from "./config/env.schema";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(env.port);
}

bootstrap();
