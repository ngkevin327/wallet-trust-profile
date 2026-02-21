import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingModule } from "../billing/billing.module";
import { WalletsModule } from "../wallets/wallets.module";
import { MeScoresController } from "./me-scores.controller";
import { ScoresController } from "./scores.controller";
import { ScoresRepository } from "./scores.repository";
import { ScoresService } from "./scores.service";

@Module({
  imports: [AuthModule, BillingModule, WalletsModule],
  controllers: [ScoresController, MeScoresController],
  providers: [ScoresRepository, ScoresService],
  exports: [ScoresRepository, ScoresService],
})
export class ScoresModule {}
