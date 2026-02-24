"use client";

import { ShareQr } from "../public/share-qr";

type Props = {
  open: boolean;
  slug: string;
  onClose: () => void;
};

export function ShareModal({ open, slug, onClose }: Props) {
  if (!open) {
    return null;
  }

  const url = typeof window !== "undefined" ? `${window.location.origin}/u/${slug}` : `/u/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="ui-card-elevated w-full max-w-md shadow-glow" role="dialog" aria-modal="true">
        <h3 className="section-title">Share profile</h3>
        <p className="mt-2 text-sm text-slate-600">Copy the link or scan the QR code at events.</p>
        <input readOnly value={url} className="input-field mt-4 font-mono" />
        <ShareQr url={url} />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="ui-btn ui-btn-primary flex-1"
          >
            Copy link
          </button>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
