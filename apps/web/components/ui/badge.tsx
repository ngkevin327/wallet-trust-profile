import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "brand" | "neutral" | "success" | "warning";
};

const toneClass = {
  brand: "bg-brand-50 text-brand-800",
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
};

export function Badge({ children, tone = "neutral" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
