import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { V1Module } from "./v1/v1.module";

@Module({
  imports: [PrismaModule, HealthModule, V1Module],
})
export class AppModule {}
