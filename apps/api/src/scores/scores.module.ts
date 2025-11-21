import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { WalletsModule } from "../wallets/wallets.module";
import { MeScoresController } from "./me-scores.controller";
import { ScoresController } from "./scores.controller";
import { ScoresRepository } from "./scores.repository";
import { ScoresService } from "./scores.service";

@Module({
  imports: [BillingModule, WalletsModule],
  controllers: [ScoresController, MeScoresController],
  providers: [ScoresRepository, ScoresService],
  exports: [ScoresRepository, ScoresService],
})
export class ScoresModule {}
