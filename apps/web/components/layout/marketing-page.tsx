import type { ReactNode } from "react";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./site-header";

type Props = {
  children: ReactNode;
  /** narrow = prose/FAQ; content = pricing-width; full = max container */
  width?: "narrow" | "content" | "full";
  className?: string;
};

const widthClass: Record<NonNullable<Props["width"]>, string> = {
  narrow: "page-narrow py-12 md:py-16",
  content: "page-content py-12 md:py-16",
  full: "page-container py-12 md:py-16",
};

export function MarketingPage({ children, width = "narrow", className = "" }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className={`flex-1 ${widthClass[width]} ${className}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}
