import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { ExportSignerService } from "./export-signer.service";

@ApiTags("verify")
@Controller("verify")
export class VerifyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: ExportSignerService,
  ) {}

  @Get(":exportId")
  @ApiOperation({ summary: "Verify export signature (public)" })
  async verify(@Param("exportId") exportId: string) {
    const row = await this.prisma.export.findUnique({ where: { id: exportId } });
    if (!row || !row.signature || !row.payloadSnapshot) {
      throw new NotFoundException("Export not found");
    }

    const snapshot = row.payloadSnapshot as Record<string, unknown>;
    const { verificationUrl: _v, signature: _s, ...payload } = snapshot;
    const valid = this.signer.verify(exportId, payload, row.signature);

    return {
      exportId,
      valid,
      reason: valid ? "signature_match" : "signature_mismatch",
      exportedAt: snapshot.exportedAt ?? row.createdAt,
      scoringVersion: snapshot.scoringVersion ?? null,
    };
  }
}
