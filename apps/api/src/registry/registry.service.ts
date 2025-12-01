import { Injectable, NotFoundException } from "@nestjs/common";
import { RiskLabelSeverity } from "@prisma/client";
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

  async createProtocol(data: {
    slug: string;
    name: string;
    chainId: number;
    contract?: string;
    category: string;
  }) {
    const row = await this.prisma.protocol.create({
      data: {
        slug: data.slug,
        name: data.name,
        chainId: data.chainId,
        contract: data.contract,
        category: data.category,
        active: true,
      },
    });
    this.invalidateCache();
    return row;
  }

  async updateProtocol(
    id: string,
    data: { name?: string; category?: string; active?: boolean },
  ) {
    await this.assertProtocol(id);
    const row = await this.prisma.protocol.update({ where: { id }, data });
    this.invalidateCache();
    return row;
  }

  async deactivateProtocol(id: string) {
    return this.updateProtocol(id, { active: false });
  }

  async createDao(data: {
    slug: string;
    name: string;
    chainId: number;
    treasury?: string;
    tokenAddress?: string;
  }) {
    const row = await this.prisma.dao.create({
      data: {
        slug: data.slug,
        name: data.name,
        chainId: data.chainId,
        treasury: data.treasury,
        tokenAddress: data.tokenAddress,
        active: true,
      },
    });
    this.invalidateCache();
    return row;
  }

  async updateDao(
    id: string,
    data: { name?: string; treasury?: string; active?: boolean },
  ) {
    await this.assertDao(id);
    const row = await this.prisma.dao.update({ where: { id }, data });
    this.invalidateCache();
    return row;
  }

  async deactivateDao(id: string) {
    return this.updateDao(id, { active: false });
  }

  async createRiskLabel(data: {
    code: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
  }) {
    const row = await this.prisma.riskLabel.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        severity: data.severity as RiskLabelSeverity,
        active: true,
      },
    });
    return row;
  }

  async updateRiskLabel(
    id: string,
    data: {
      title?: string;
      description?: string;
      severity?: "low" | "medium" | "high";
      active?: boolean;
    },
  ) {
    await this.assertRiskLabel(id);
    const row = await this.prisma.riskLabel.update({
      where: { id },
      data: {
        ...data,
        severity: data.severity as RiskLabelSeverity | undefined,
      },
    });
    return row;
  }

  async deactivateRiskLabel(id: string) {
    return this.updateRiskLabel(id, { active: false });
  }

  private async assertProtocol(id: string) {
    const row = await this.prisma.protocol.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException("Protocol not found");
    }
  }

  private async assertDao(id: string) {
    const row = await this.prisma.dao.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException("DAO not found");
    }
  }

  private async assertRiskLabel(id: string) {
    const row = await this.prisma.riskLabel.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException("Risk label not found");
    }
  }
}
