import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { MeProfileController } from "./profiles.controller";
import { PublicProfilesController } from "./public-profiles.controller";
import { ProjectionsRepository } from "./projections.repository";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";

@Module({
  imports: [BillingModule, IndexerApiModule, UsersModule, WalletsModule],
  controllers: [MeProfileController, PublicProfilesController],
  providers: [ProfilesRepository, ProjectionsRepository, ProfilesService],
  exports: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
