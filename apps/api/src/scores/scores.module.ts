import { Module } from "@nestjs/common";
import { WalletsModule } from "../wallets/wallets.module";
import { ScoresController } from "./scores.controller";
import { ScoresRepository } from "./scores.repository";
import { ScoresService } from "./scores.service";

@Module({
  imports: [WalletsModule],
  controllers: [ScoresController],
  providers: [ScoresRepository, ScoresService],
  exports: [ScoresRepository, ScoresService],
})
export class ScoresModule {}
