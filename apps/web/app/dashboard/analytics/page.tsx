"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import { useEffect, useState } from "react";
import { UpgradePrompt } from "../../../components/billing/upgrade-prompt";
import { ScoreTrendChart } from "../../../components/analytics/score-trend-chart";
import { api } from "../../../lib/api/client";
import { getSubscriptionStatus } from "../../../lib/api/billing";
import { fetchScoreHistory } from "../../../lib/api/scores";
import { getAccessToken } from "../../../lib/auth/token";

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [history, setHistory] = useState<
    { createdAt: string; reputationIndex: number; scoringVersion: string }[]
  >([]);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => setProfile(p as ProfileOwnerDto));
    void getSubscriptionStatus()
      .then((s) => setIsPremium(s.plan === "premium"))
      .catch(() => setIsPremium(false));
  }, []);

  useEffect(() => {
    if (!isPremium) {
      return;
    }
    void fetchScoreHistory()
      .then((rows) => setHistory(rows))
      .catch(() => setHistory([]));
  }, [isPremium]);

  if (!profile) {
    return <p className="text-slate-500">Loading analytics…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Premium analytics
          {!isPremium ? (
            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
              Premium
            </span>
          ) : null}
        </h1>
        <a href="/dashboard" className="text-sm text-brand-700 hover:underline">
          Back to dashboard
        </a>
      </div>

      {!isPremium ? (
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm">
            <section className="ui-card h-48" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UpgradePrompt feature="Score history and private sub-scores" />
          </div>
        </div>
      ) : (
        <>
          {profile.privateMetrics ? (
            <section className="ui-card">
              <h2 className="text-lg font-semibold">Private sub-scores</h2>
              <ul className="mt-4 space-y-3">
                {profile.privateMetrics.dimensions.map((d) => (
                  <li key={d.key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{d.key}</span>
                    <span className="font-medium">{d.score}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="ui-card">
            <h2 className="text-lg font-semibold">Reputation trend (90 days)</h2>
            <div className="mt-4">
              <ScoreTrendChart points={history} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
