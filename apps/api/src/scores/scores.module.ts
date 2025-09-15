import { Module } from "@nestjs/common";
import { WalletsModule } from "../wallets/wallets.module";
import { MeScoresController } from "./me-scores.controller";
import { ScoresController } from "./scores.controller";
import { ScoresRepository } from "./scores.repository";
import { ScoresService } from "./scores.service";

@Module({
  imports: [WalletsModule],
  controllers: [ScoresController, MeScoresController],
  providers: [ScoresRepository, ScoresService],
  exports: [ScoresRepository, ScoresService],
})
export class ScoresModule {}
