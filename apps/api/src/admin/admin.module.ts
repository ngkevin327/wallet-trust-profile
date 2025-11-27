import { Module } from "@nestjs/common";
import { RegistryModule } from "../registry/registry.module";
import { AdminAuthGuard } from "./admin-auth.guard";
import { RegistryAdminController } from "./registry-admin.controller";
import { ScoringAdminController } from "./scoring-admin.controller";

@Module({
  imports: [RegistryModule],
  controllers: [RegistryAdminController, ScoringAdminController],
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class AdminModule {}
