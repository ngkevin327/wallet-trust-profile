import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { ExportSignerService } from "./export-signer.service";
import { PdfGenerator } from "./pdf.generator";
import { ExportsController } from "./exports.controller";
import { ExportsService } from "./exports.service";
import { VerifyController } from "./verify.controller";

@Module({
  imports: [BillingModule, ProfilesModule],
  controllers: [ExportsController, VerifyController],
  providers: [ExportsService, ExportSignerService, PdfGenerator],
  exports: [ExportsService, ExportSignerService],
})
export class ExportsModule {}
