import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Custom font-size tokens that tailwind-merge should treat as type scale. */
const FONT_SIZES = [
  "display",
  "display-mobile",
  "headline-lg",
  "headline-lg-mobile",
  "headline-md",
  "headline-md-mobile",
  "headline-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-eyebrow",
] as const;

const SHADOWS = ["soft"] as const;

/** Custom spacing tokens used by the SAVOY layout. */
const SPACING = [
  "space-2xs",
  "space-xs",
  "space-sm",
  "space-md",
  "space-lg",
  "space-xl",
  "space-2xl",
  "space-3xl",
  "space-4xl",
  "space-5xl",
  "gutter",
] as const;

/**
 * Every group whose value is a spacing token. The group id doubles as the class
 * prefix for all of them, so one entry per group is enough.
 */
const SPACING_GROUPS = [
  "p", "px", "py", "pt", "pr", "pb", "pl",
  "m", "mx", "my", "mt", "mr", "mb", "ml",
  "gap", "gap-x", "gap-y",
] as const;

const spacingClassGroups = Object.fromEntries(
  SPACING_GROUPS.map((group) => [group, [{ [group]: [...SPACING] }]])
);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
      shadow: [{ shadow: [...SHADOWS] }],
      ...spacingClassGroups,
    },
  },
});

/** Compose conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
