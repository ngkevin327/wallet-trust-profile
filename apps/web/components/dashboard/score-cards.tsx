"use client";

import type { ProfileScoreDimensionsDto } from "@onchain-reputation/shared";
import { labelForDimension } from "../../lib/copy/scoring-labels";
import { Tooltip } from "../ui/tooltip";

type Props = {
  dimensions: ProfileScoreDimensionsDto | null;
  onSelectDimension?: (key: string) => void;
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
      {entries.map(([key, score]) => {
        const label = labelForDimension(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDimension?.(key)}
            className="ui-card text-left transition hover:border-brand-300 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
            aria-label={`${label.title}: ${score} out of 100`}
          >
            <div className="flex items-start gap-1">
              <p className="text-sm font-medium text-slate-900">{label.title}</p>
              <Tooltip label={`About ${label.title}`} content={label.tooltip} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{label.shortDescription}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{score}</p>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label.title} score`}
            >
              <div className={`h-full ${band(score)}`} style={{ width: `${score}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
