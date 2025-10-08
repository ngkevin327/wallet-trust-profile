import type { ProfilePublicDto } from "@onchain-reputation/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import { LastUpdated } from "../profile/last-updated";

type Props = {
  profile: ProfilePublicDto;
  children?: ReactNode;
  footer?: ReactNode;
};

export function PublicProfileLayout({ profile, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">
            Onchain Reputation
          </Link>
          <Link href="/?utm_source=public_profile&utm_medium=header" className="ui-btn ui-btn-primary text-sm">
            Connect wallet
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            {profile.displayName ?? profile.slug}
          </h1>
          <p className="mt-1 text-slate-600">@{profile.slug}</p>
          <div className="mt-2">
            <LastUpdated iso={profile.lastUpdatedAt ?? profile.lastUpdated} />
          </div>
        </div>
        {children}
      </main>

      {footer}
    </div>
  );
}
