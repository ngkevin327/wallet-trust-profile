import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NonceRequestDto } from "./dto/nonce.dto";
import { SiweService } from "./siwe.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly siwe: SiweService) {}

  @Post("nonce")
  @ApiOperation({ summary: "Issue a single-use SIWE nonce" })
  async issueNonce(@Body() body: NonceRequestDto) {
    return this.siwe.issueNonce(body.address, body.chainId);
  }
}
