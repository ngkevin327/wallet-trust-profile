import type { ProfilePublicDto } from "@onchain-reputation/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import { LastUpdated } from "../profile/last-updated";

type Props = {
  profile: ProfilePublicDto;
  children?: ReactNode;
  footer?: ReactNode;
};

function initials(displayName: string | null | undefined, slug: string): string {
  const source = displayName?.trim() || slug;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function PublicProfileLayout({ profile, children, footer }: Props) {
  const name = profile.displayName ?? profile.slug;
  const avatarInitials = initials(profile.displayName, profile.slug);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="page-container flex items-center justify-between py-4">
          <Link
            href="/"
            className="font-display text-sm font-bold tracking-tight text-slate-900 hover:text-brand-700"
          >
            Onchain<span className="text-brand-600">Reputation</span>
          </Link>
          <Link
            href="/?utm_source=public_profile&utm_medium=header"
            className="ui-btn ui-btn-primary text-sm"
          >
            Connect wallet
          </Link>
        </div>
      </header>

      <div className="border-b border-slate-200/60 bg-gradient-to-br from-brand-50 via-white to-cyan-50/40">
        <div className="page-content py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 font-display text-2xl font-bold text-white shadow-lg ring-4 ring-white"
              aria-hidden
            >
              {avatarInitials}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {name}
              </h1>
              <p className="mt-1 font-medium text-brand-700">@{profile.slug}</p>
              <div className="mt-2">
                <LastUpdated iso={profile.lastUpdatedAt ?? profile.lastUpdated} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="page-content py-10">{children}</main>

      {footer}
    </div>
  );
}
