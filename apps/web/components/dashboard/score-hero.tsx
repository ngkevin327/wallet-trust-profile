import type { ProfileStatusDto } from "@onchain-reputation/shared";
import { ScoreDisplay } from "../ui/score-display";

type Props = {
  reputationIndex: number | null;
  status: ProfileStatusDto;
};

export function ScoreHero({ reputationIndex, status }: Props) {
  const showBanner = status !== "active";

  return (
    <section className="ui-card-elevated">
      {showBanner ? (
        <p
          className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100"
          role="status"
        >
          Profile status: <strong>{status}</strong> — scores may update after indexing completes.
        </p>
      ) : null}
      <ScoreDisplay score={reputationIndex} pendingLabel="Pending" />
    </section>
  );
}
