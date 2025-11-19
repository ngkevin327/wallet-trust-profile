import { API_ROUTES } from "@onchain-reputation/shared";
import { apiFetch } from "./client";

export type ExportJobResponse = {
  exportId: string;
  format: "json" | "pdf";
  status: string;
  downloadUrl: string;
  verificationUrl: string;
  signature: string;
  payload?: unknown;
};

export async function createExport(format: "json" | "pdf"): Promise<ExportJobResponse> {
  return apiFetch(API_ROUTES.me.exports, {
    method: "POST",
    body: JSON.stringify({ format }),
  });
}

export async function getExportStatus(exportId: string): Promise<ExportJobResponse> {
  return apiFetch(`${API_ROUTES.me.exports}/${exportId}`);
}
