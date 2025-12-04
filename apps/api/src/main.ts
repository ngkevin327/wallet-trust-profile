import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { loadApiEnv } from "./config/env.schema";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { initApiTelemetry } from "./telemetry/otel";

async function bootstrap() {
  await initApiTelemetry();
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Security headers applied via SecurityHeadersMiddleware (CommonModule)

  app.setGlobalPrefix("v1", { exclude: ["health", "ready"] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Onchain Reputation API")
    .setDescription("REST API for wallet reputation profiles and indexing")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("v1/docs", app, document);

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
