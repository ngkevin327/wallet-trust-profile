"use client";

type Props = {
  open: boolean;
  slug: string;
  onClose: () => void;
};

export function ShareModal({ open, slug, onClose }: Props) {
  if (!open) {
    return null;
  }

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${slug}`
      : `/u/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" role="dialog" aria-modal="true">
        <h3 className="text-lg font-semibold">Share profile</h3>
        <p className="mt-2 text-sm text-slate-600">
          Public URL — link previews use Open Graph metadata (Stage 8).
        </p>
        <input
          readOnly
          value={url}
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
        />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => void copy()} className="ui-btn ui-btn-primary flex-1">
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
