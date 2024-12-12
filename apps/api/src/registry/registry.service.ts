import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type CacheEntry<T> = { data: T; expiresAt: number };

@Injectable()
export class RegistryService {
  private protocolCache: CacheEntry<Awaited<ReturnType<RegistryService["loadProtocols"]>>> | null =
    null;
  private daoCache: CacheEntry<Awaited<ReturnType<RegistryService["loadDaos"]>>> | null = null;
  private readonly ttlMs = 60 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async getProtocols(chainId?: number) {
    if (this.protocolCache && this.protocolCache.expiresAt > Date.now()) {
      const data = this.protocolCache.data;
      return chainId ? data.filter((p) => p.chainId === chainId) : data;
    }
    const data = await this.loadProtocols();
    this.protocolCache = { data, expiresAt: Date.now() + this.ttlMs };
    return chainId ? data.filter((p) => p.chainId === chainId) : data;
  }

  async getDaos(chainId?: number) {
    if (this.daoCache && this.daoCache.expiresAt > Date.now()) {
      const data = this.daoCache.data;
      return chainId ? data.filter((d) => d.chainId === chainId) : data;
    }
    const data = await this.loadDaos();
    this.daoCache = { data, expiresAt: Date.now() + this.ttlMs };
    return chainId ? data.filter((d) => d.chainId === chainId) : data;
  }

  async findProtocolByContract(chainId: number, contract: string) {
    const normalized = contract.toLowerCase();
    const protocols = await this.getProtocols(chainId);
    return protocols.find((p) => p.contract?.toLowerCase() === normalized) ?? null;
  }

  async findDaoByTreasury(chainId: number, address: string) {
    const normalized = address.toLowerCase();
    const daos = await this.getDaos(chainId);
    return (
      daos.find(
        (d) =>
          d.treasury?.toLowerCase() === normalized ||
          d.tokenAddress?.toLowerCase() === normalized,
      ) ?? null
    );
  }

  private loadProtocols() {
    return this.prisma.protocol.findMany({ where: { active: true } });
  }

  private loadDaos() {
    return this.prisma.dao.findMany({ where: { active: true } });
  }

  invalidateCache() {
    this.protocolCache = null;
    this.daoCache = null;
  }
}
