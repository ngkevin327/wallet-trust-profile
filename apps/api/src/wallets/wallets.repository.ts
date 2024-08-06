import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma, Wallet } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({ where: { id } });
  }

  findByAddress(address: string, chainScope: string[]): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: {
        address_chainScope: {
          address: address.toLowerCase(),
          chainScope,
        },
      },
    });
  }

  listByUserId(userId: string): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { linkedAt: "desc" },
    });
  }

  async create(data: Prisma.WalletCreateInput): Promise<Wallet> {
    try {
      return await this.prisma.wallet.create({
        data: {
          ...data,
          address:
            typeof data.address === "string" ? data.address.toLowerCase() : data.address,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Wallet is already linked to another account");
      }
      throw error;
    }
  }

  async linkToUser(
    userId: string,
    address: string,
    chainScope: string[],
    isPrimary = false,
  ): Promise<Wallet> {
    const existing = await this.findByAddress(address, chainScope);
    if (existing && existing.userId !== userId) {
      throw new ConflictException("Wallet is already linked to another account");
    }
    if (existing) {
      return existing;
    }

    return this.create({
      address: address.toLowerCase(),
      chainScope,
      isPrimary,
      user: { connect: { id: userId } },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({ where: { id } });
  }

  async setPrimary(walletId: string, userId: string): Promise<Wallet> {
    await this.prisma.wallet.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isPrimary: true },
    });
  }
}
