import { Module } from "@nestjs/common";
import { EntitlementsGuard } from "./entitlements.guard";
import { EntitlementsService } from "./entitlements.service";

@Module({
  providers: [EntitlementsService, EntitlementsGuard],
  exports: [EntitlementsService, EntitlementsGuard],
})
export class BillingModule {}
