"use client";

import type { BadgeDto } from "@onchain-reputation/shared";
import { useState } from "react";
import { BadgeDetailModal } from "./badge-detail-modal";

type Props = {
  badges: BadgeDto[];
};

export function BadgesGallery({ badges }: Props) {
  const [selected, setSelected] = useState<BadgeDto | null>(null);

  if (!badges.length) {
    return (
      <p className="text-sm text-slate-500">
        No badges yet. Participate in governance or DAO programs to earn your first badge.
      </p>
    );
  }

  const sorted = [...badges].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {sorted.map((badge) => (
          <button
            key={badge.code}
            type="button"
            onClick={() => setSelected(badge)}
            className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800 hover:bg-brand-100"
          >
            {badge.title}
          </button>
        ))}
      </div>
      <BadgeDetailModal badge={selected} onClose={() => setSelected(null)} />
    </>
  );
}
