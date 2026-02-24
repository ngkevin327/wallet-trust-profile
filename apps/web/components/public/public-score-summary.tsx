import type { ProfilePublicDto } from "@onchain-reputation/shared";
import { labelForDimension } from "../../lib/copy/scoring-labels";
import { BadgesGallery } from "../dashboard/badges-gallery";
import { DaoSection } from "../dashboard/dao-section";
import { ResumeTimeline } from "../dashboard/resume-timeline";
import { TrustSignalsPanel } from "../profile/trust-signals";
import { ScoreDisplay } from "../ui/score-display";
import { InsufficientHistoryExplainer } from "./insufficient-history";

type Props = {
  profile: ProfilePublicDto;
};

function dimensionBand(score: number): string {
  if (score >= 70) {
    return "bg-gradient-to-r from-emerald-500 to-emerald-400";
  }
  if (score >= 40) {
    return "bg-gradient-to-r from-amber-500 to-amber-400";
  }
  return "bg-slate-400";
}

function hasInsufficientHistory(profile: ProfilePublicDto): boolean {
  if (profile.reputationIndex == null) {
    return true;
  }
  return profile.trustSignals?.some((s) => s.code === "insufficient_history") ?? false;
}

export function PublicScoreSummary({ profile }: Props) {
  const dimensions = profile.dimensions;
  const insufficient = hasInsufficientHistory(profile);

  return (
    <div className="space-y-8">
      <section className="ui-card-elevated bg-gradient-to-b from-brand-50/40 to-white">
        <ScoreDisplay
          score={profile.reputationIndex}
          pendingLabel="Score pending — indexing in progress"
        />
      </section>

      {insufficient ? <InsufficientHistoryExplainer /> : null}

      {dimensions ? (
        <section>
          <h2 className="section-title">Dimension summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Explainable breakdown of indexed onchain activity
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Object.entries(dimensions)
              .filter(([, v]) => v != null)
              .map(([key, score]) => {
                const label = labelForDimension(key);
                return (
                  <div key={key} className="ui-card transition-shadow hover:shadow-card">
                    <p className="text-sm font-semibold text-slate-900">{label.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{label.shortDescription}</p>
                    <p className="mt-2 font-display text-2xl font-bold tabular-nums text-brand-800">
                      {score as number}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${dimensionBand(score as number)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ) : null}

      {profile.badges.length > 0 ? (
        <section className="ui-card-elevated">
          <h2 className="section-title">Badges</h2>
          <p className="mt-1 text-sm text-slate-500">Earned from verifiable onchain milestones</p>
          <div className="mt-4">
            <BadgesGallery badges={profile.badges} />
          </div>
        </section>
      ) : null}

      <DaoSection contributions={profile.daoContributions} />

      {profile.trustSignals?.length ? (
        <TrustSignalsPanel signals={profile.trustSignals} variant="public" />
      ) : null}

      <ResumeTimeline
        events={profile.resumeTimeline}
        activitySummarized={profile.activitySummary?.activitySummarized}
      />
    </div>
  );
}
