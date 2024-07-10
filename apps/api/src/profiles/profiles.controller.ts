import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@Controller("me/profile")
export class MeProfileController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated user profile (stub)" })
  getMyProfile() {
    return this.profilesService.getOwnerProfile();
  }
}

@ApiTags("profiles")
@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(":slug")
  @ApiOperation({ summary: "Get public profile by slug" })
  getPublicProfile(@Param("slug") slug: string) {
    return this.profilesService.getPublicProfile(slug);
  }
}
