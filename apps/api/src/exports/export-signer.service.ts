import { Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";

@Injectable()
export class ExportSignerService {
  private readonly secret = process.env.EXPORT_SIGNING_SECRET ?? "dev-export-secret";

  sign(exportId: string, payload: unknown): string {
    return createHmac("sha256", this.secret)
      .update(`${exportId}:${JSON.stringify(payload)}`)
      .digest("hex");
  }

  verify(exportId: string, payload: unknown, signature: string): boolean {
    const expected = this.sign(exportId, payload);
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
