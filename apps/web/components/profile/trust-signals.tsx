"use client";

import { useState } from "react";
import type { TrustSignalDto } from "@onchain-reputation/shared";

type Props = {
  signals: TrustSignalDto[];
  variant?: "owner" | "public";
};

const severityIcon: Record<TrustSignalDto["severity"], string> = {
  low: "○",
  medium: "◐",
  high: "●",
};

export function TrustSignalsPanel({ signals, variant = "owner" }: Props) {
  const [expandedHigh, setExpandedHigh] = useState(false);

  if (!signals.length) {
    return null;
  }

  const highSeverity = signals.filter((s) => s.severity === "high");
  const visibleSignals =
    variant === "public" && !expandedHigh
      ? signals.filter((s) => s.severity !== "high")
      : signals;

  const hiddenHighCount =
    variant === "public" && !expandedHigh ? highSeverity.length : 0;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium text-slate-900">Trust signals</h2>
      <p className="mt-1 text-sm text-slate-600">
        {variant === "public"
          ? "Neutral, explainable indicators derived from indexed on-chain activity. Use alongside other hiring signals."
          : "Explainable risk and trust indicators derived from indexed on-chain activity."}
      </p>
      <ul className="mt-4 space-y-3">
        {visibleSignals.map((signal) => (
          <li
            key={signal.code}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-slate-500" aria-hidden>
                {severityIcon[signal.severity]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{signal.label}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {signal.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{signal.reason}</p>
                {variant === "owner" ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Confidence: {Math.round(signal.confidence * 100)}%
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {hiddenHighCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpandedHigh(true)}
          className="mt-3 text-sm font-medium text-brand-700 hover:underline"
        >
          View details ({hiddenHighCount} additional signal
          {hiddenHighCount === 1 ? "" : "s"})
        </button>
      ) : null}
    </section>
  );
}
