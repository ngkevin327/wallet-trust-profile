import { Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Handlebars from "handlebars";
import type { ProfileOwnerDto } from "@onchain-reputation/shared";

@Injectable()
export class PdfGenerator {
  private readonly template = Handlebars.compile(
    readFileSync(join(process.cwd(), "templates/export-profile.hbs"), "utf8"),
  );

  async generate(params: {
    exportId: string;
    profile: ProfileOwnerDto;
    verificationUrl: string;
  }): Promise<string> {
    const html = this.template({
      displayName: params.profile.displayName ?? params.profile.slug,
      slug: params.profile.slug,
      scoringVersion: params.profile.scoringVersion ?? "1.0.0",
      reputationIndex: params.profile.reputationIndex ?? "—",
      badges: params.profile.badges,
      verificationUrl: params.verificationUrl,
      generatedAt: new Date().toISOString(),
    });

    const PDFDocument = (await import("pdfkit")).default;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve());
      doc.on("error", reject);

      doc.fontSize(20).text(params.profile.displayName ?? params.profile.slug);
      doc.moveDown();
      doc.fontSize(12).fillColor("#64748b").text(`@${params.profile.slug}`);
      doc.fillColor("#000000");
      doc.moveDown();
      doc.fontSize(36).fillColor("#4f46e5").text(String(params.profile.reputationIndex ?? "—"));
      doc.fontSize(12).fillColor("#000000").text("Reputation index");
      doc.moveDown();
      doc.text("Badges:");
      for (const badge of params.profile.badges) {
        doc.text(`• ${badge.title}`);
      }
      doc.moveDown();
      doc.fontSize(10).fillColor("#94a3b8").text(`Generated at ${new Date().toISOString()}`);
      doc.text(`Verify: ${params.verificationUrl}`);
      doc.text(`HTML snapshot length: ${html.length} bytes`);
      doc.end();
    });

    const artifactKey = `exports/${params.exportId}.pdf`;
    return artifactKey;
  }
}
