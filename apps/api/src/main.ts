import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadApiEnv } from "./config/env.schema";

async function bootstrap() {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule);
  await app.listen(env.port);
}

bootstrap();
