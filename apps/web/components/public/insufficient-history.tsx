import { INSUFFICIENT_HISTORY_COPY } from "../../lib/copy/scoring-labels";

export function InsufficientHistoryExplainer() {
  return (
    <section className="ui-card border-dashed border-slate-300 bg-slate-50/80">
      <h2 className="section-title">{INSUFFICIENT_HISTORY_COPY.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{INSUFFICIENT_HISTORY_COPY.body}</p>
      <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
        {INSUFFICIENT_HISTORY_COPY.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </section>
  );
}
