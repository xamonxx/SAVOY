"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-savoy-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm leading-6 text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(
    Boolean
  );
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export const controlClasses =
  "w-full rounded-md border border-border-soft bg-surface-inset px-4 py-3 text-base text-savoy-ink placeholder:text-ink-muted transition-colors focus:border-savoy-espresso focus:outline-none aria-[invalid=true]:border-error";

export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"select">) {
  return (
    <div className="relative">
      <select className={cn(controlClasses, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}

export function OptionCard({
  name,
  value,
  checked,
  onChange,
  onBlur,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-3 border-b border-border-soft py-3 text-sm transition-colors",
        checked ? "text-savoy-ink" : "text-ink-muted hover:text-savoy-ink"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        onBlur={onBlur}
        className="size-4 shrink-0 accent-savoy-gold"
      />
      <span className="font-medium">{children}</span>
      {checked ? <span aria-hidden className="ml-auto h-px w-8 bg-savoy-gold" /> : null}
    </label>
  );
}
