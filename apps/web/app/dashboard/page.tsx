"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import { useEffect, useState } from "react";
import { BadgesGallery } from "../../components/dashboard/badges-gallery";
import { DaoSection } from "../../components/dashboard/dao-section";
import { IndexingStates } from "../../components/dashboard/indexing-states";
import { ResumeTimeline } from "../../components/dashboard/resume-timeline";
import { ScoreCards } from "../../components/dashboard/score-cards";
import { ScoreDrawer } from "../../components/dashboard/score-drawer";
import { ScoreHero } from "../../components/dashboard/score-hero";
import { ShareModal } from "../../components/dashboard/share-modal";
import { TrustSignalsPanel } from "../../components/profile/trust-signals";
import { api } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => setProfile(p as ProfileOwnerDto));
  }, []);

  if (!profile) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  const canShare = profile.visibility === "public" && profile.slug;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <IndexingStates status={profile.status} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-6">
          <ScoreHero reputationIndex={profile.reputationIndex} status={profile.status} />
          <ScoreCards dimensions={profile.dimensions} onSelectDimension={() => setDrawerOpen(true)} />
        </div>
        {canShare ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="ui-btn ui-btn-primary w-full shrink-0 lg:sticky lg:top-6 lg:w-auto"
          >
            Share profile
          </button>
        ) : null}
      </div>

      <section className="ui-card">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="mt-3">
          <BadgesGallery badges={profile.badges} />
        </div>
      </section>

      <DaoSection contributions={profile.daoContributions} />

      {profile.trustSignals?.length ? (
        <TrustSignalsPanel signals={profile.trustSignals} />
      ) : null}

      <ResumeTimeline
        events={profile.resumeTimeline}
        activitySummarized={profile.activitySummary?.activitySummarized}
      />

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        View full score breakdown
      </button>

      <ScoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ShareModal open={shareOpen} slug={profile.slug} onClose={() => setShareOpen(false)} />
    </div>
  );
}
