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
    <nav className="flex flex-col gap-1 border-r border-slate-200 bg-white p-4 md:min-h-screen md:w-56">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Onchain Reputation
      </p>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {link.label}
            {link.badge ? (
              <span className="ml-2 text-xs text-slate-400">{link.badge}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
