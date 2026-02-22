"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { DashboardNav } from "../../components/dashboard/nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <DashboardNav />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-md">
          <h1 className="font-display text-lg font-semibold text-slate-900">Dashboard</h1>
          {address ? (
            <p className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-600">
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          ) : (
            <Link href="/" className="text-sm font-medium text-brand-700 hover:text-brand-600">
              Connect wallet
            </Link>
          )}
        </header>
        <main id="dashboard-main" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
