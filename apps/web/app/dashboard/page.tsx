"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import { useEffect, useState } from "react";
import { ScoreCards } from "../../components/dashboard/score-cards";
import { ScoreHero } from "../../components/dashboard/score-hero";
import { api } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => setProfile(p as ProfileOwnerDto));
  }, []);

  if (!profile) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ScoreHero reputationIndex={profile.reputationIndex} status={profile.status} />
      <ScoreCards dimensions={profile.dimensions} />
    </div>
  );
}
