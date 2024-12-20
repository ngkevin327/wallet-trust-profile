import { Module } from "@nestjs/common";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { MeProfileController, ProfilesController } from "./profiles.controller";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";

@Module({
  imports: [IndexerApiModule],
  controllers: [MeProfileController, ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
