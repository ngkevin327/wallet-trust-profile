"use client";

import { useState } from "react";
import { createExport, getExportStatus } from "../../lib/api/exports";
import { ApiError } from "../../lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
};

export function ExportModal({ open, onClose, isPremium }: Props) {
  const [loading, setLoading] = useState<"json" | "pdf" | null>(null);
  const [verifyLink, setVerifyLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function runExport(format: "json" | "pdf") {
    setError(null);
    setLoading(format);
    try {
      let result = await createExport(format);
      if (result.status === "pending") {
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          result = await getExportStatus(result.exportId);
          if (result.status === "completed") {
            break;
          }
        }
      }
      setVerifyLink(result.verificationUrl);
      if (format === "json" && result.payload) {
        const blob = new Blob([JSON.stringify(result.payload, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reputation-export-${result.exportId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed");
    } finally {
      setLoading(null);
    }
  }

  async function copyVerify() {
    if (verifyLink) {
      await navigator.clipboard.writeText(verifyLink);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="ui-card-elevated w-full max-w-md shadow-glow" role="dialog" aria-modal="true">
        <h3 className="text-lg font-semibold">Export reputation</h3>
        <p className="mt-2 text-sm text-slate-600">
          JSON includes scores, badges, and a verification link recipients can validate without an
          account.
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => void runExport("json")}
            className="ui-btn ui-btn-primary"
          >
            {loading === "json" ? "Generating…" : "Download JSON"}
          </button>
          <button
            type="button"
            disabled={!!loading || !isPremium}
            onClick={() => void runExport("pdf")}
            className="ui-btn ui-btn-secondary"
          >
            {loading === "pdf" ? "Generating PDF…" : isPremium ? "Download PDF" : "PDF (Premium)"}
          </button>
        </div>
        {verifyLink ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-700">Verification link</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600">{verifyLink}</p>
            <button type="button" onClick={() => void copyVerify()} className="link-brand mt-2">
              Copy link
            </button>
          </div>
        ) : null}
        <button type="button" onClick={onClose} className="ui-btn ui-btn-secondary mt-4 w-full">
          Close
        </button>
      </div>
    </div>
  );
}
