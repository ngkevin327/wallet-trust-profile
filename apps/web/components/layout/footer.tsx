import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-slate-900">
            Onchain<span className="text-brand-600">Reputation</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Portable professional reputation built from verifiable wallet activity.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            © {new Date().getFullYear()} Onchain Reputation
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
          <Link href="/how-it-works" className="transition-colors hover:text-brand-700">
            How it works
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-brand-700">
            Pricing
          </Link>
          <Link href="/faq" className="transition-colors hover:text-brand-700">
            FAQ
          </Link>
          <Link href="/u/demo-builder" className="transition-colors hover:text-brand-700">
            Demo profile
          </Link>
          <Link href="/legal/privacy" className="transition-colors hover:text-brand-700">
            Privacy
          </Link>
          <Link href="/legal/terms" className="transition-colors hover:text-brand-700">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
