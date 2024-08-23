import { Module } from "@nestjs/common";
import { IndexerModule } from "../indexer/indexer.module";
import { MeProfileController, ProfilesController } from "./profiles.controller";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";

@Module({
  imports: [IndexerModule],
  controllers: [MeProfileController, ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
