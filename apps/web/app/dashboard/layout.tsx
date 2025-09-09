"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { DashboardNav } from "../../components/dashboard/nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();

  return (
    <div className="min-h-screen md:flex">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <DashboardNav />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          {address ? (
            <p className="font-mono text-sm text-slate-500">
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          ) : (
            <Link href="/" className="text-sm text-brand-700 hover:underline">
              Connect wallet
            </Link>
          )}
        </header>
        <main id="dashboard-main" className="flex-1 bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
