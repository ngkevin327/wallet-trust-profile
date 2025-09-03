import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@Controller("profiles")
@UseGuards(RateLimitGuard)
export class PublicProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get("by-wallet/:address")
  @ApiOperation({ summary: "Resolve profile by wallet address" })
  async getByWallet(
    @Param("address") address: string,
    @Query("redirect") redirect: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { profile, cacheVersion, canonicalSlug } =
      await this.profilesService.getPublicProfileByWallet(address);
    if (cacheVersion != null) {
      res.setHeader("X-Profile-Cache-Version", String(cacheVersion));
    }
    res.setHeader("X-Canonical-Slug", canonicalSlug);
    if (redirect === "true") {
      const base = process.env.PUBLIC_WEB_URL ?? "http://localhost:3000";
      res.redirect(302, `${base}/u/${canonicalSlug}`);
      return;
    }
    return profile;
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get public profile by slug from materialized projection" })
  async getPublicProfile(@Param("slug") slug: string, @Res({ passthrough: true }) res: Response) {
    const { profile, cacheVersion } =
      await this.profilesService.getPublicProfileFromProjection(slug);
    if (cacheVersion != null) {
      res.setHeader("X-Profile-Cache-Version", String(cacheVersion));
    }
    return profile;
  }
}
