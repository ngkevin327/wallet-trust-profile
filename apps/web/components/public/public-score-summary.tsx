import type { ProfilePublicDto } from "@onchain-reputation/shared";
import { labelForDimension } from "../../lib/copy/scoring-labels";
import { BadgesGallery } from "../dashboard/badges-gallery";
import { DaoSection } from "../dashboard/dao-section";
import { ResumeTimeline } from "../dashboard/resume-timeline";
import { TrustSignalsPanel } from "../profile/trust-signals";
import { InsufficientHistoryExplainer } from "./insufficient-history";

type Props = {
  profile: ProfilePublicDto;
};

function dimensionBand(score: number): string {
  if (score >= 70) {
    return "bg-emerald-500";
  }
  if (score >= 40) {
    return "bg-amber-500";
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
      <section className="ui-card text-center">
        <p className="text-sm font-medium text-slate-500">Reputation index</p>
        {profile.reputationIndex != null ? (
          <p className="mt-2 text-5xl font-bold text-brand-700">{profile.reputationIndex}</p>
        ) : (
          <p className="mt-2 text-lg text-slate-500">Score pending — indexing in progress</p>
        )}
      </section>

      {insufficient ? <InsufficientHistoryExplainer /> : null}

      {dimensions ? (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Dimension summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(dimensions)
              .filter(([, v]) => v != null)
              .map(([key, score]) => {
                const label = labelForDimension(key);
                return (
                  <div key={key} className="ui-card">
                    <p className="text-sm font-medium text-slate-900">{label.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{label.shortDescription}</p>
                    <p className="mt-1 text-2xl font-semibold">{score as number}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${dimensionBand(score as number)}`}
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
        <section className="ui-card">
          <h2 className="text-lg font-semibold">Badges</h2>
          <div className="mt-3">
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
