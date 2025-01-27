"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";
import { LastUpdated } from "../../components/profile/last-updated";

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => setProfile(p as ProfileOwnerDto));
  }, []);

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-slate-500">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">{profile.displayName ?? profile.slug}</h1>
      <LastUpdated iso={profile.lastUpdatedAt ?? profile.lastUpdated} />
      <p className="mt-2 text-sm text-slate-600">Status: {profile.status}</p>
      <div className="mt-6 flex gap-4">
        <Link
          href={`/profiles/${profile.slug}`}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          View public profile
        </Link>
        <Link
          href="/settings/wallets"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Manage wallets
        </Link>
      </div>
    </main>
  );
}
