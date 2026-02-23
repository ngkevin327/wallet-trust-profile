import type { ReactNode } from "react";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./site-header";

/** Centered single-column flows: onboarding, auth-adjacent screens */
type Props = {
  children: ReactNode;
};

export function CenteredFlowPage({ children }: Props) {
  return (
    <div className="mesh-hero flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
