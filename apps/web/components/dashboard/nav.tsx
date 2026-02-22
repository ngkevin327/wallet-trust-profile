"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/settings/profile", label: "Settings" },
  { href: "/settings/wallets", label: "Wallets" },
  { href: "/settings/profile", label: "Upgrade", badge: "Soon" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-r border-slate-200/80 bg-white p-4 md:min-h-screen md:w-60">
      <Link
        href="/"
        className="mb-6 font-display text-sm font-bold text-slate-900 hover:text-brand-700"
      >
        Onchain<span className="text-brand-600">Reputation</span>
      </Link>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {link.label}
            {link.badge ? (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {link.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
