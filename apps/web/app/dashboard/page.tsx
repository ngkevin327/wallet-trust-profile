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
import { ExportModal } from "../../components/dashboard/export-modal";
import { ShareModal } from "../../components/dashboard/share-modal";
import { getSubscriptionStatus } from "../../lib/api/billing";
import { ProfileFooter } from "../../components/profile/profile-footer";
import { TrustSignalsPanel } from "../../components/profile/trust-signals";
import { api } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => setProfile(p as ProfileOwnerDto));
    void getSubscriptionStatus()
      .then((s) => setIsPremium(s.plan === "premium"))
      .catch(() => setIsPremium(false));
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
          <ScoreCards
            dimensions={profile.dimensions}
            onSelectDimension={() => setDrawerOpen(true)}
          />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 lg:sticky lg:top-6 lg:w-auto">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="ui-btn ui-btn-secondary w-full"
          >
            Export
          </button>
          {canShare ? (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="ui-btn ui-btn-primary w-full"
            >
              Share profile
            </button>
          ) : null}
        </div>
      </div>

      <section className="ui-card">
        <h2 className="section-title">Badges</h2>
        <div className="mt-3">
          <BadgesGallery badges={profile.badges} />
        </div>
      </section>

      <DaoSection contributions={profile.daoContributions} />

      {profile.trustSignals?.length ? <TrustSignalsPanel signals={profile.trustSignals} /> : null}

      <ResumeTimeline
        events={profile.resumeTimeline}
        activitySummarized={profile.activitySummary?.activitySummarized}
      />

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => setDrawerOpen(true)} className="link-brand">
          View full score breakdown
        </button>
        <a href="/dashboard/analytics" className="link-brand">
          Premium analytics
          {!isPremium ? (
            <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-800">
              Premium
            </span>
          ) : null}
        </a>
      </div>

      <ProfileFooter
        scoringVersion={profile.scoringVersion}
        lastUpdated={profile.lastUpdated}
        lastUpdatedAt={profile.lastUpdatedAt}
        hideWhenIndexingFailed={profile.status === "failed"}
      />

      <ScoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ShareModal open={shareOpen} slug={profile.slug} onClose={() => setShareOpen(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} isPremium={isPremium} />
    </div>
  );
}
