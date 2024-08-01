import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@Controller("me/profile")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeProfileController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated user profile" })
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.profilesService.getOwnerProfile(user.sub);
  }
}

@ApiTags("profiles")
@Controller("profiles")
@UseGuards(RateLimitGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(":slug")
  @ApiOperation({ summary: "Get public profile by slug" })
  getPublicProfile(@Param("slug") slug: string) {
    return this.profilesService.getPublicProfile(slug);
  }
}
