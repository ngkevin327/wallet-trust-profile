import { Module } from "@nestjs/common";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { ScoresModule } from "../scores/scores.module";
import { TrustModule } from "../trust/trust.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { MeProfileController, ProfilesController } from "./profiles.controller";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";

@Module({
  imports: [IndexerApiModule, UsersModule, WalletsModule, ScoresModule, TrustModule],
  controllers: [MeProfileController, ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
