import { Module } from "@nestjs/common";
import { MeProfileController, ProfilesController } from "./profiles.controller";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesService } from "./profiles.service";

@Module({
  controllers: [MeProfileController, ProfilesController],
  providers: [ProfilesRepository, ProfilesService],
  exports: [ProfilesRepository, ProfilesService],
})
export class ProfilesModule {}
