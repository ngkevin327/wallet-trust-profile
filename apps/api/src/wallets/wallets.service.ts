import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SubscriptionTier } from "@prisma/client";
import { SiweMessage } from "siwe";
import { WalletConflictError } from "../common/errors/wallet-conflict.error";
import { JsonLoggerService } from "../common/logger/logger.service";
import { SiweService } from "../auth/siwe.service";
import { UsersRepository } from "../users/users.repository";
import { WalletsRepository } from "./wallets.repository";

const FREE_WALLET_LIMIT = 1;

@Injectable()
export class WalletsService {
  constructor(
    private readonly wallets: WalletsRepository,
    private readonly users: UsersRepository,
    private readonly siwe: SiweService,
    private readonly logger: JsonLoggerService,
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

    try {
      return await this.wallets.linkToUser(userId, dto.address, chainScope, isPrimary);
    } catch (error) {
      if (error instanceof WalletConflictError) {
        this.logger.warn("Wallet link conflict", "WalletsService", {
          userId,
          address: dto.address.toLowerCase(),
          event: "wallet_link_conflict",
        });
      }
      throw error;
    }
  }

  async unlinkWallet(userId: string, walletId: string) {
    const wallet = await this.wallets.findById(walletId);
    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException("Wallet not found");
    }

    const all = await this.wallets.listByUserId(userId);
    if (all.length <= 1) {
      throw new BadRequestException(
        "Cannot remove your only wallet. Contact support to close your account.",
      );
    }

    const wasPrimary = wallet.isPrimary;
    await this.wallets.delete(walletId);

    if (wasPrimary) {
      const remaining = await this.wallets.listByUserId(userId);
      if (remaining[0]) {
        await this.wallets.setPrimary(remaining[0].id, userId);
      }
    }
  }
}
