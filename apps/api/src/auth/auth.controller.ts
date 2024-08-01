import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { NonceRequestDto } from "./dto/nonce.dto";
import { VerifyRequestDto } from "./dto/verify.dto";
import { SiweService } from "./siwe.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly siwe: SiweService,
    private readonly auth: AuthService,
  ) {}

  @Post("nonce")
  @HttpCode(201)
  @ApiOperation({ summary: "Issue a single-use SIWE nonce" })
  async issueNonce(@Body() body: NonceRequestDto) {
    return this.siwe.issueNonce(body.address, body.chainId);
  }

  @Post("verify")
  @ApiOperation({ summary: "Verify SIWE signature and issue JWT" })
  async verify(@Body() body: VerifyRequestDto) {
    return this.auth.verifySignature(body.message, body.signature);
  }
}
