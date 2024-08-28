"use client";

import type { ProfileOwnerDto, ProfileStatusDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api/client";
import { getAccessToken } from "../../../lib/auth/token";

const STATUS_LABELS: Record<ProfileStatusDto, string> = {
  created: "Preparing your profile",
  indexing: "Indexing onchain activity",
  active: "Profile ready",
  failed: "Indexing failed",
};

const STATUS_HINTS: Record<ProfileStatusDto, string> = {
  created: "Your wallet is queued for analysis.",
  indexing: "We're scanning Ethereum and Base for contributions, governance, and payments.",
  active: "Your reputation profile is ready to view.",
  failed: "Something went wrong. Try again or contact support.",
};

export default function IndexingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ProfileStatusDto>("indexing");
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/");
      return;
    }

    let active = true;

    const poll = async () => {
      try {
        const profile = (await api.getMyProfile()) as ProfileOwnerDto;
        if (!active) {
          return;
        }
        setStatus(profile.status ?? "indexing");
        setSlug(profile.slug);
        setError(null);

        if (profile.status === "active") {
          router.replace(`/profiles/${profile.slug}`);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load profile status");
        }
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">{STATUS_LABELS[status]}</h1>
      <p className="mt-3 text-slate-600">{STATUS_HINTS[status]}</p>

      <div className="mt-8 flex items-center gap-3">
        {status === "indexing" || status === "created" ? (
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-700" />
        ) : null}
        <span className="text-sm font-medium uppercase tracking-wide text-brand-700">
          {status}
        </span>
      </div>

      {slug && status === "active" ? (
        <Link
          href={`/profiles/${slug}`}
          className="mt-8 text-sm font-medium text-brand-700 hover:underline"
        >
          View profile →
        </Link>
      ) : null}

      {status === "failed" ? (
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </Link>
      ) : null}

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
