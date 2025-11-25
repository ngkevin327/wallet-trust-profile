import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { UsersRepository } from "../users/users.repository";
import { WalletsRepository } from "../wallets/wallets.repository";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { EntitlementsService } from "../billing/entitlements.service";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@Controller("me/profile")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeProfileController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly usersRepo: UsersRepository,
    private readonly walletsRepo: WalletsRepository,
    private readonly entitlements: EntitlementsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated user profile" })
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.profilesService.getOwnerProfile(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: "Update owner profile fields" })
  updateMyProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateOwnerProfile(user.sub, dto);
  }

  @Get("slug/:slug/check")
  @ApiOperation({ summary: "Check slug availability" })
  checkSlug(@Param("slug") slug: string) {
    return this.profilesService.checkSlugAvailability(slug);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Trigger profile re-index (premium)" })
  async refreshProfile(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.usersRepo.findById(user.sub);
    const wallets = await this.walletsRepo.listByUserId(user.sub);
    const primary = wallets.find((w) => w.isPrimary) ?? wallets[0];
    if (!primary) {
      throw new NotFoundException("No wallet linked");
    }
    const chainId = primary.chainScope[0]?.includes("8453") ? 8453 : 1;
    await this.entitlements.assertRefreshAllowed(user.sub);
    void dbUser;
    return this.profilesService.triggerRefresh(user.sub, primary.id, chainId, true);
  }
}
