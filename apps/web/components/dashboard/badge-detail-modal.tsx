"use client";

import type { BadgeDto } from "@onchain-reputation/shared";

type Props = {
  badge: BadgeDto | null;
  onClose: () => void;
};

export function BadgeDetailModal({ badge, onClose }: Props) {
  if (!badge) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold">{badge.title}</h3>
        <p className="mt-2 text-sm text-slate-600">Code: {badge.code}</p>
        <p className="mt-1 text-sm text-slate-500">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </p>
        <p className="mt-4 text-sm text-slate-600">
          Criteria are defined in the badge catalog and evaluated after each index run.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="ui-btn ui-btn-secondary mt-6 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
