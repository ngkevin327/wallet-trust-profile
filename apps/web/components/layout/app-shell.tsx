"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { DashboardNav } from "../dashboard/nav";

type Props = {
  children: ReactNode;
  title?: string;
};

export function AppShell({ children, title = "Dashboard" }: Props) {
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-md"
      >
        Skip to content
      </a>
      <DashboardNav />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-md">
          <h1 className="font-display text-lg font-semibold text-slate-900">{title}</h1>
          {address ? (
            <p className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-600">
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          ) : (
            <Link href="/#connect" className="link-brand">
              Connect wallet
            </Link>
          )}
        </header>
        <main id="app-main" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
