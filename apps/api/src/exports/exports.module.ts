import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { ExportsController } from "./exports.controller";
import { ExportsService } from "./exports.service";

@Module({
  imports: [BillingModule, ProfilesModule],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
