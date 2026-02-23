import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  lead?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, lead, backHref, backLabel = "← Back", actions }: Props) {
  return (
    <header className="mb-8">
      {backHref ? (
        <Link href={backHref} className="link-brand">
          {backLabel}
        </Link>
      ) : null}
      <div className={backHref ? "mt-4" : ""}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title md:text-4xl">{title}</h1>
            {lead ? <p className="page-lead">{lead}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
