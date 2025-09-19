"use client";

import type { ResumeEventDto } from "@onchain-reputation/shared";
import { useState } from "react";

type Props = {
  events: ResumeEventDto[] | undefined;
  activitySummarized?: boolean;
};

const PAGE = 10;

export function ResumeTimeline({ events, activitySummarized }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (!events?.length) {
    return <p className="text-sm text-slate-500">No timeline events yet.</p>;
  }

  const visible = showAll ? events : events.slice(0, PAGE);

  return (
    <section className="ui-card">
      <h2 className="text-lg font-semibold text-slate-900">On-chain résumé</h2>
      {activitySummarized ? (
        <p className="mt-1 text-sm text-amber-700">
          High-volume wallet — timeline shows the most recent indexed events.
        </p>
      ) : null}
      <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
        {visible.map((event, i) => (
          <li key={`${event.date}-${i}`} className="relative">
            <span className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-700" />
            <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
            <p className="font-medium text-slate-900">{event.label}</p>
            {event.explorerUrl ? (
              <a
                href={event.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-700 hover:underline"
              >
                View transaction
              </a>
            ) : null}
          </li>
        ))}
      </ol>
      {events.length > PAGE && !showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm font-medium text-brand-700 hover:underline"
        >
          Show more ({events.length - PAGE} remaining)
        </button>
      ) : null}
    </section>
  );
}
