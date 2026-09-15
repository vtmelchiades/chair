/**
 * Primitivos de UI no padrão shadcn/ui (docs/03 §3.1.3).
 * Alvos de toque >= 44px; badges nunca dependem só de cor.
 */
import type { ReactNode } from "react";
import Link from "next/link";

/* ------------------------------- Badge ------------------------------- */

type BadgeTone = "brand" | "b2b" | "success" | "danger" | "accent" | "neutral";

const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand border-brand/20",
  b2b: "bg-b2b-soft text-b2b-ink border-b2b/20",
  success: "bg-success-soft text-success-ink border-success/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  accent: "bg-accent/15 text-ink border-accent/30",
  neutral: "bg-bg-subtle text-ink-muted border-line",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Button ------------------------------ */

type ButtonVariant = "primary" | "b2b" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  b2b: "bg-b2b text-white hover:bg-b2b/90",
  secondary: "bg-white text-ink border border-line hover:bg-bg-subtle",
  ghost: "bg-transparent text-brand hover:bg-brand-soft",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export const buttonClass = (variant: ButtonVariant = "primary", size: "md" | "lg" = "md", disabled = false) =>
  `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ${
    size === "lg" ? "min-h-12 px-6 text-base" : "min-h-11 px-4 text-sm"
  } ${buttonVariants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

/* -------------------------------- Card ------------------------------- */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------ Section ------------------------------ */

export function SectionTitle({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <h2 id={id} className={`text-xl font-bold tracking-tight text-ink md:text-2xl ${className}`}>
      {children}
    </h2>
  );
}
