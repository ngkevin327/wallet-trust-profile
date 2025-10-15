"use client";

import Link from "next/link";

type Props = {
  profileSlug: string;
};

export function VisitorCta({ profileSlug }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm text-slate-700 sm:text-left">
          Build your onchain reputation — connect a wallet and get a shareable profile.
        </p>
        <Link
          href={`/?utm_source=public_profile&utm_medium=sticky_cta&utm_campaign=${profileSlug}`}
          className="ui-btn ui-btn-primary shrink-0"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
