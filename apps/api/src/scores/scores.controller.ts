import { Controller, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { WalletsRepository } from "../wallets/wallets.repository";
import { ScoresService } from "./scores.service";

@ApiTags("scores")
@Controller("me/profile")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScoresController {
  constructor(
    private readonly scoresService: ScoresService,
    private readonly walletsRepo: WalletsRepository,
  ) {}

  @Get("scores/history")
  @ApiOperation({ summary: "Get score snapshot history (premium, legacy path)" })
  async getScoreHistory(@CurrentUser() user: JwtPayload) {
    const wallets = await this.walletsRepo.listByUserId(user.sub);
    const primary = wallets.find((w) => w.isPrimary) ?? wallets[0];
    if (!primary) {
      throw new NotFoundException("No wallet linked");
    }
    return this.scoresService.getHistoryForWallet(user.sub, primary.id);
  }

  @Get("score-breakdown")
  @ApiOperation({ summary: "Get detailed score breakdown for profile owner" })
  async getScoreBreakdown(@CurrentUser() user: JwtPayload) {
    const wallets = await this.walletsRepo.listByUserId(user.sub);
    const primary = wallets.find((w) => w.isPrimary) ?? wallets[0];
    if (!primary) {
      throw new NotFoundException("No wallet linked");
    }
    return this.scoresService.getBreakdownForWallet(primary.id);
  }
}
