import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ProfileVisibility } from "@prisma/client";
import { SiweMessage } from "siwe";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { UsersRepository } from "../users/users.repository";
import { WalletsRepository } from "../wallets/wallets.repository";
import { JwtService } from "./jwt.service";
import { SiweService } from "./siwe.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly siwe: SiweService,
    private readonly jwt: JwtService,
    private readonly users: UsersRepository,
    private readonly wallets: WalletsRepository,
    private readonly profiles: ProfilesRepository,
  ) {}

  async verifySignature(message: string, signature: string) {
    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
    } catch {
      throw new BadRequestException("Invalid SIWE message");
    }

    const fields = await siweMessage.verify({
      signature,
      domain: this.siwe.getDomain(),
      nonce: siweMessage.nonce,
    });

    const stored = await this.siwe.consumeNonce(siweMessage.nonce);
    if (!stored) {
      throw new UnauthorizedException("Nonce expired or already used");
    }

    const address = fields.data.address.toLowerCase();
    if (address !== stored.address) {
      throw new UnauthorizedException("Address does not match nonce");
    }

    const chainId = Number(siweMessage.chainId);
    if (chainId !== stored.chainId) {
      throw new UnauthorizedException("Chain ID does not match nonce");
    }

    const chainScope = [`eip155:${chainId}`];
    let wallet = await this.wallets.findByAddress(address, chainScope);
    let userId: string;

    if (wallet) {
      userId = wallet.userId;
    } else {
      const user = await this.users.create({});
      userId = user.id;
      wallet = await this.wallets.linkToUser(userId, address, chainScope, true);

      const slug = `user-${address.slice(2, 10)}`;
      await this.profiles.create({
        userId,
        slug,
        displayName: null,
        visibility: ProfileVisibility.public,
      });
    }

    const { token, expiresIn } = await this.jwt.signAccessToken({
      sub: userId,
      walletAddress: address,
    });

    return {
      accessToken: token,
      expiresIn,
      userId,
    };
  }
}
