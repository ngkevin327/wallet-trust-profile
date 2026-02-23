import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
};

export function Card({ title, children, className = "", highlight = false }: Props) {
  return (
    <div className={`${highlight ? "ui-card-highlight" : "ui-card"} ${className}`}>
      {title ? <h3 className="section-title">{title}</h3> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}
