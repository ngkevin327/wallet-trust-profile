import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: Props) {
  return (
    <div className={`ui-card ${className}`}>
      {title ? <h3 className="text-sm font-medium text-slate-500">{title}</h3> : null}
      <div className={title ? "mt-2" : ""}>{children}</div>
    </div>
  );
}
