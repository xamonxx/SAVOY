import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "outline" | "quiet";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-savoy)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-savoy-ink text-savoy-ivory hover:bg-savoy-espresso",
  dark: "bg-savoy-obsidian text-savoy-ivory hover:bg-savoy-espresso",
  outline:
    "border border-border-soft bg-transparent text-savoy-ink hover:border-savoy-ink",
  quiet: "text-savoy-ink underline decoration-savoy-gold underline-offset-4 hover:text-savoy-espresso",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-6 py-3 text-sm",
};

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = StyleProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof StyleProps> & {
    href?: undefined;
  };

type ButtonAsLink = StyleProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof StyleProps> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    const { external, ...linkProps } = rest as Omit<ButtonAsLink, keyof StyleProps>;
    if (external) {
      return (
        <a {...linkProps} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link {...linkProps} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...(rest as Omit<ButtonAsButton, keyof StyleProps>)} className={classes}>
      {children}
    </button>
  );
}
