import type { ProfileStatusDto } from "@onchain-reputation/shared";

type Props = {
  reputationIndex: number | null;
  status: ProfileStatusDto;
};

export function ScoreHero({ reputationIndex, status }: Props) {
  const showBanner = status !== "active";

  return (
    <section className="ui-card">
      {showBanner ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          Profile status: <strong>{status}</strong> — scores may update after indexing completes.
        </p>
      ) : null}
      <p className="text-sm font-medium text-slate-500">Reputation index</p>
      {reputationIndex != null ? (
        <p className="mt-2 text-5xl font-bold text-brand-700" aria-label={`Reputation index ${reputationIndex}`}>
          {reputationIndex}
        </p>
      ) : (
        <p className="mt-2 text-2xl text-slate-400">Pending</p>
      )}
    </section>
  );
}
