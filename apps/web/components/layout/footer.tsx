import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-sm text-slate-600 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Onchain Reputation</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/how-it-works" className="hover:text-brand-700">
            How it works
          </Link>
          <Link href="/faq" className="hover:text-brand-700">
            FAQ
          </Link>
          <Link href="/documentation/scoring-methodology" className="hover:text-brand-700">
            Scoring
          </Link>
          <Link href="/legal/privacy" className="hover:text-brand-700">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:text-brand-700">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
