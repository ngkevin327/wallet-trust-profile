import { Module } from "@nestjs/common";
import { CacheModule } from "./cache/cache.module";
import { CommonModule } from "./common/common.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { V1Module } from "./v1/v1.module";

@Module({
  imports: [CacheModule, CommonModule, PrismaModule, HealthModule, V1Module],
})
export class AppModule {}
