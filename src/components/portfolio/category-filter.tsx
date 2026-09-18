import Link from "next/link";

import { cn } from "@/lib/cn";
import { populatedCategories, projectCount } from "@/data/projects";
import { getProjectsByCategory } from "@/data/projects";

/**
 * Category filter.
 *
 * These are real links to real pages, not a client-side filter. A visitor
 * looking for "kitchen set custom" should be able to land on, share and have
 * Google index that shelf directly - none of which a `useState` filter allows.
 * It also keeps the whole portfolio listing on the server.
 */
export function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  const pills = [
    { slug: undefined, label: "Semua", href: "/portfolio", count: projectCount },
    ...populatedCategories.map((category) => ({
      slug: category.slug,
      label: category.short,
      href: `/portfolio/kategori/${category.slug}`,
      count: getProjectsByCategory(category.slug).length,
    })),
  ];

  return (
    <nav aria-label="Kategori portfolio">
      {/*
        A single scrolling row instead of a wrap: at eleven pills of uneven
        length, wrapping wound up as a staircase of mismatched row widths
        rather than a tidy block. A row a visitor can drag past reads as one
        control; `[scrollbar-width:none]` (and the Webkit equivalent) hides
        the bar itself, since the pills are the scroll affordance.
      */}
      <ul
        className={cn(
          "flex gap-space-2xs overflow-x-auto pb-space-2xs pointer-coarse:gap-space-xs",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {pills.map((pill) => {
          const active = pill.slug === activeSlug;
          return (
            <li key={pill.href} className="shrink-0">
              <Link
                href={pill.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-space-2xs whitespace-nowrap rounded-lg px-space-md py-space-2xs text-label-md transition-colors pointer-coarse:min-h-11",
                  active
                    ? "bg-deep-black text-pure-white"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                {pill.label}
                <span
                  className={cn(
                    "text-label-eyebrow",
                    // `text-muted-gray` (#767676) on this pill's background
                    // measured 3.44:1 (audit SAV-012) - `on-surface-variant`
                    // is the same darker gray this file already uses one
                    // line up for the inactive label text.
                    active ? "text-primary-container" : "text-on-surface-variant"
                  )}
                >
                  {pill.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
