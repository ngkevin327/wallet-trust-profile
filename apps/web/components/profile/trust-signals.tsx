import type { TrustSignalDto } from "@onchain-reputation/shared";

type Props = {
  signals: TrustSignalDto[];
};

const severityStyles: Record<TrustSignalDto["severity"], string> = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-800",
};

export function TrustSignalsPanel({ signals }: Props) {
  if (!signals.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium">Trust signals</h2>
      <p className="mt-1 text-sm text-slate-500">
        Explainable risk and trust indicators derived from indexed on-chain activity. Confidence
        reflects how strongly the signal applies to your wallet.
      </p>
      <ul className="mt-4 space-y-3">
        {signals.map((signal) => (
          <li
            key={signal.code}
            className={`rounded-lg border px-4 py-3 ${severityStyles[signal.severity]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{signal.label}</span>
              <span className="text-xs uppercase tracking-wide">{signal.severity}</span>
            </div>
            <p className="mt-1 text-sm">{signal.reason}</p>
            <p className="mt-2 text-xs opacity-80">
              Confidence: {Math.round(signal.confidence * 100)}%
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
