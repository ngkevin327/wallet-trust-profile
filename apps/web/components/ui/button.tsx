import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: "ui-btn ui-btn-primary",
  secondary: "ui-btn ui-btn-secondary",
  ghost: "ui-btn text-slate-700 hover:bg-slate-100",
};

export function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  return (
    <button type="button" className={`${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
