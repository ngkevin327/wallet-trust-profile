import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SubscriptionTier } from "@prisma/client";
import { SiweMessage } from "siwe";
import { UsersRepository } from "../users/users.repository";
import { SiweService } from "../auth/siwe.service";
import { WalletsRepository } from "./wallets.repository";

const FREE_WALLET_LIMIT = 1;

@Injectable()
export class WalletsService {
  constructor(
    private readonly wallets: WalletsRepository,
    private readonly users: UsersRepository,
    private readonly siwe: SiweService,
  ) {}

  private async verifyWalletSignature(message: string, signature: string, expectedAddress: string) {
    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
    } catch {
      throw new BadRequestException("Invalid SIWE message");
    }

    await siweMessage.verify({
      signature,
      domain: this.siwe.getDomain(),
      nonce: siweMessage.nonce,
    });

    const stored = await this.siwe.consumeNonce(siweMessage.nonce);
    if (!stored) {
      throw new BadRequestException("Nonce expired or already used");
    }

    const address = siweMessage.address.toLowerCase();
    if (address !== expectedAddress.toLowerCase()) {
      throw new BadRequestException("Signature address mismatch");
    }

    return { address, chainId: Number(siweMessage.chainId) };
  }

  async listForUser(userId: string) {
    return this.wallets.listByUserId(userId);
  }

  async linkWallet(
    userId: string,
    dto: {
      address: string;
      chainId: number;
      message: string;
      signature: string;
      isPrimary?: boolean;
    },
  ) {
    await this.verifyWalletSignature(dto.message, dto.signature, dto.address);

    const user = await this.users.findWithWallets(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const chainScope = [`eip155:${dto.chainId}`];
    const limit = user.subscriptionTier === SubscriptionTier.premium ? 3 : FREE_WALLET_LIMIT;

    if (user.wallets.length >= limit) {
      throw new ForbiddenException(
        `Wallet limit reached (${limit}). Upgrade to premium to link more wallets.`,
      );
    }

    const hasPrimary = user.wallets.some((w) => w.isPrimary);
    const isPrimary = dto.isPrimary ?? !hasPrimary;

    return this.wallets.linkToUser(userId, dto.address, chainScope, isPrimary);
  }
}
