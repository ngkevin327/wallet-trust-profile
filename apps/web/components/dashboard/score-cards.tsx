"use client";

import type { ProfileScoreDimensionsDto } from "@onchain-reputation/shared";

type Props = {
  dimensions: ProfileScoreDimensionsDto | null;
  onSelectDimension?: (key: string) => void;
};

const labels: Record<string, string> = {
  governance: "Governance",
  contribution: "Contribution",
  paymentReliability: "Payment reliability",
  protocolParticipation: "Protocol participation",
};

function band(score: number): string {
  if (score >= 70) {
    return "bg-emerald-500";
  }
  if (score >= 40) {
    return "bg-amber-500";
  }
  return "bg-slate-400";
}

export function ScoreCards({ dimensions, onSelectDimension }: Props) {
  if (!dimensions) {
    return <p className="text-sm text-slate-500">Dimension scores not available yet.</p>;
  }

  const entries = Object.entries(dimensions).filter(([, v]) => v != null) as [string, number][];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([key, score]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelectDimension?.(key)}
          className="ui-card text-left transition hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label={`${labels[key] ?? key}: ${score} out of 100`}
        >
          <p className="text-sm font-medium text-slate-600">{labels[key] ?? key}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{score}</p>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${labels[key] ?? key} score`}
          >
            <div className={`h-full ${band(score)}`} style={{ width: `${score}%` }} />
          </div>
        </button>
      ))}
    </div>
  );
}
