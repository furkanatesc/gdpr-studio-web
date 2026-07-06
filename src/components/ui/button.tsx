import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 font-medium transition-[color,background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast hover:bg-accent-strong",
  secondary: "border border-border-strong text-ink hover:bg-surface-2",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-2",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-[13px]",
};

/** Paylaşılan buton sınıfları — hem <button> (Button) hem <Link> (ButtonLink) kullanır. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
