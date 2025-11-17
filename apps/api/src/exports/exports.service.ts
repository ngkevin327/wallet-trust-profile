import { Injectable, NotFoundException, TooManyRequestsException } from "@nestjs/common";
import { ExportFormat, ExportStatus } from "@prisma/client";
import { EntitlementsService } from "../billing/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProfilesService } from "../profiles/profiles.service";
import { ExportSignerService } from "./export-signer.service";
import { PdfGenerator } from "./pdf.generator";

const DAILY_EXPORT_LIMIT = Number(process.env.EXPORT_DAILY_LIMIT ?? 10);

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly entitlements: EntitlementsService,
    private readonly signer: ExportSignerService,
    private readonly pdf: PdfGenerator,
  ) {}

  async createExport(userId: string, format: "json" | "pdf") {
    if (format === "pdf") {
      await this.entitlements.assertEntitlement(userId, "export_pdf");
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const todayCount = await this.prisma.export.count({
      where: { userId, createdAt: { gte: startOfDay } },
    });
    if (todayCount >= DAILY_EXPORT_LIMIT) {
      throw new TooManyRequestsException("Daily export limit reached");
    }

    const profile = await this.profiles.getOwnerProfile(userId);
    const snapshot = {
      exportedAt: new Date().toISOString(),
      scoringVersion: profile.scoringVersion,
      reputationIndex: profile.reputationIndex,
      dimensions: profile.dimensions,
      badges: profile.badges,
      slug: profile.slug,
      displayName: profile.displayName,
    };

    const record = await this.prisma.export.create({
      data: {
        userId,
        format: format === "pdf" ? ExportFormat.pdf : ExportFormat.json,
        status: ExportStatus.pending,
        payloadSnapshot: snapshot,
      },
    });

    const baseUrl = process.env.PUBLIC_API_URL ?? "http://localhost:3001";
    const verificationUrl = `${baseUrl}/v1/verify/${record.id}`;
    const signature = this.signer.sign(record.id, snapshot);
    const payload = { ...snapshot, verificationUrl, signature };

    let artifactKey = `exports/${record.id}.json`;

    if (format === "pdf") {
      artifactKey = await this.pdf.generate({
        exportId: record.id,
        profile,
        verificationUrl,
      });
    }

    const updated = await this.prisma.export.update({
      where: { id: record.id },
      data: {
        status: ExportStatus.completed,
        artifactKey,
        verificationUrl,
        signature,
        payloadSnapshot: payload,
        completedAt: new Date(),
      },
    });

    return {
      exportId: updated.id,
      format: updated.format,
      status: updated.status,
      downloadUrl: `/v1/me/exports/${updated.id}/download`,
      verificationUrl,
      signature,
      payload: format === "json" ? payload : undefined,
    };
  }

  async getExportForUser(userId: string, exportId: string) {
    const row = await this.prisma.export.findFirst({
      where: { id: exportId, userId },
    });
    if (!row) {
      throw new NotFoundException("Export not found");
    }
    return row;
  }

  async getDownloadPayload(userId: string, exportId: string) {
    const row = await this.getExportForUser(userId, exportId);
    if (!row.payloadSnapshot) {
      throw new NotFoundException("Export not ready");
    }
    return row.payloadSnapshot;
  }
}
