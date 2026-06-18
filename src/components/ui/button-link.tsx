import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonVariant, type ButtonSize } from "./button";

/** Buton görünümlü Next <Link> — pill CTA'ları tek yerden tutmak için. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
