"use client";

import type { ProfileOwnerDto, ProfileStatusDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CenteredFlowPage } from "../../../components/layout/centered-flow-page";
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

        if (profile.status === "active" && profile.slug) {
          router.replace(`/u/${profile.slug}`);
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
    <CenteredFlowPage>
      <div className="ui-card-elevated text-center">
        <h1 className="page-title">{STATUS_LABELS[status]}</h1>
        <p className="page-lead">{STATUS_HINTS[status]}</p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {status === "indexing" || status === "created" ? (
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-brand-600" />
          ) : null}
          <span className="page-eyebrow">{status}</span>
        </div>

        {slug && status === "active" ? (
          <Link href={`/u/${slug}`} className="link-brand mt-8 inline-block">
            View profile →
          </Link>
        ) : null}

        {status === "failed" ? (
          <Link href="/#connect" className="ui-btn ui-btn-primary mt-8 inline-flex">
            Try again
          </Link>
        ) : null}

        {error ? <p className="alert alert-error mt-6">{error}</p> : null}
      </div>
    </CenteredFlowPage>
  );
}
