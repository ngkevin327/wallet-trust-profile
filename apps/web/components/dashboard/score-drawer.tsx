"use client";

import type { ScoreBreakdownDto } from "@onchain-reputation/shared";
import { useEffect, useRef, useState } from "react";
import { getScoreBreakdown } from "../../lib/api/scores";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ScoreDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ScoreBreakdownDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    setError(null);
    getScoreBreakdown()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load breakdown"))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-drawer-title"
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="score-drawer-title" className="text-lg font-semibold">
            Score breakdown
          </h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800">
            Close
          </button>
        </div>
        {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
        {data ? (
          <div className="mt-6 space-y-4">
            <p className="text-3xl font-bold text-brand-700">{data.reputationIndex}</p>
            <ul className="space-y-3">
              {data.dimensions.map((dim) => (
                <li key={dim.key} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium capitalize">{dim.key.replace(/_/g, " ")}</p>
                  <p className="text-sm text-slate-600">
                    Score {dim.score} · weight {(dim.weight * 100).toFixed(0)}%
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">
              Version {data.scoringVersion} · inputs {data.inputsHash.slice(0, 12)}…
            </p>
            <a
              href="/documentation/scoring-methodology"
              className="text-sm text-brand-700 hover:underline"
            >
              Read methodology
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
