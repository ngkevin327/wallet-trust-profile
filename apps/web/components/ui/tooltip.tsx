"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  content: string;
  children?: ReactNode;
};

export function Tooltip({ label, content, children }: Props) {
  return (
    <span className="group relative inline-flex items-center">
      {children ?? (
        <button
          type="button"
          className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={label}
        >
          i
        </button>
      )}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {content}
      </span>
    </span>
  );
}
