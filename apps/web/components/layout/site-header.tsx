import Link from "next/link";

type Props = {
  variant?: "light" | "transparent";
};

/** Matches fixed header block (py-4 + single-line nav). */
export const SITE_HEADER_OFFSET_CLASS = "h-[4.5rem]";

export function SiteHeader({ variant = "light" }: Props) {
  const shell =
    variant === "transparent"
      ? "border-slate-200/60 bg-white/85 shadow-sm backdrop-blur-md"
      : "border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md";

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 border-b ${shell}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-brand-700"
          >
            Onchain<span className="text-brand-600">Reputation</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <Link href="/how-it-works" className="transition-colors hover:text-brand-700">
              How it works
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-brand-700">
              Pricing
            </Link>
            <Link href="/faq" className="transition-colors hover:text-brand-700">
              FAQ
            </Link>
          </nav>
          <Link href="/#connect" className="ui-btn ui-btn-primary text-sm">
            Get started
          </Link>
        </div>
      </header>
      <div className={SITE_HEADER_OFFSET_CLASS} aria-hidden />
    </>
  );
}
