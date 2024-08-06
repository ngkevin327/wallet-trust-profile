import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { LinkWalletDto } from "./dto/link-wallet.dto";
import { WalletsService } from "./wallets.service";

@ApiTags("wallets")
@Controller("me/wallets")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: "List linked wallets" })
  list(@CurrentUser() user: JwtPayload) {
    return this.walletsService.listForUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: "Link a wallet with SIWE signature" })
  link(@CurrentUser() user: JwtPayload, @Body() body: LinkWalletDto) {
    return this.walletsService.linkWallet(user.sub, body);
  }
}
