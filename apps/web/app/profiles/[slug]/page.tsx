"use client";

import type { ProfilePublicDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api/client";
import { LastUpdated } from "../../../components/profile/last-updated";
import { TrustSignalsPanel } from "../../../components/profile/trust-signals";

export default function PublicProfilePage() {
  const params = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfilePublicDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.slug) {
      return;
    }
    api
      .getPublicProfile(params.slug)
      .then((data) => setProfile(data as ProfilePublicDto))
      .catch((err) => setError(err instanceof Error ? err.message : "Profile not found"));
  }, [params.slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-brand-700">
          Home
        </Link>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-slate-500">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-brand-700 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">{profile.displayName ?? profile.slug}</h1>
      <p className="mt-2 text-slate-600">@{profile.slug}</p>
      <div className="mt-2">
        <LastUpdated iso={profile.lastUpdatedAt ?? profile.lastUpdated} />
      </div>
      <p className="mt-2 text-sm text-slate-500">Status: {profile.status}</p>
      {profile.reputationIndex != null ? (
        <p className="mt-6 text-4xl font-bold text-brand-700">{profile.reputationIndex}</p>
      ) : (
        <p className="mt-6 text-slate-500">Reputation score pending</p>
      )}
      {profile.badges.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <li
              key={badge.code}
              className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800"
            >
              {badge.title}
            </li>
          ))}
        </ul>
      ) : null}
      {profile.trustSignals && profile.trustSignals.length > 0 ? (
        <TrustSignalsPanel signals={profile.trustSignals} />
      ) : null}
    </main>
  );
}
