"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { navLinks } from "@/components/layout/nav-links";
import { isActivePath } from "@/components/layout/is-active";

type HeaderNavProps = {
  /** Set while the bar floats over the hero photograph, on a dark ground. */
  inverse?: boolean;
};

/** Desktop navigation. Client-side only because it highlights the active route. */
export function HeaderNav({ inverse = false }: HeaderNavProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
  }
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [marker, setMarker] = useState<{ left: number; width: number } | null>(null);

  const activeHref = navLinks.find((link) => isActivePath(pathname, link.href))?.href;

  /*
   * The active-page underline is measured, not shared-layout-animated.
   *
   * It used to be one `motion.span` carried between buttons with a Framer
   * Motion `layoutId`, which hands the transition to Motion's layout
   * projection system - a system that also tries to compensate for the page
   * scrolling underneath it while it runs. This header is `position: fixed`
   * and never actually moves with the page, but Lenis (`smooth-scroll.tsx`)
   * smooth-scrolls the window back to the top over about a second on every
   * route change, and Motion's scroll compensation cannot tell a fixed
   * ancestor is exempt from that - it folded the whole scroll distance into
   * the FLIP, which is what read as the bar getting yanked up from the bottom
   * of the page on navigation.
   *
   * Measuring the target link's own position with `getBoundingClientRect` and
   * driving a plain CSS transition from the result has no scroll term to get
   * wrong: it only ever reads two rects and writes two numbers.
   */
  useLayoutEffect(() => {
    const list = listRef.current;
    const active = activeHref ? itemRefs.current.get(activeHref) : undefined;
    if (!list || !active) {
      setMarker(null);
      return;
    }

    const measure = () => {
      const listRect = list.getBoundingClientRect();
      const itemRect = active.getBoundingClientRect();
      const style = getComputedStyle(active);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;

      const left = itemRect.left - listRect.left + padLeft;
      const width = itemRect.width - padLeft - padRight;

      // The very first measurement on a route change can land a frame before
      // the browser has finished laying out the newly-active link (observed
      // producing a `NaN` width that only corrected itself on the next resize
      // event) - never commit a value that would render as invalid CSS and
      // leave the bar sized `0` indefinitely.
      if (!Number.isFinite(left) || !Number.isFinite(width)) return;
      setMarker({ left, width });
    };

    measure();
    // A second pass one frame later catches exactly that race without
    // guessing at its cause - by the next paint the layout has always
    // settled.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [activeHref]);

  // Handle clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul ref={listRef} className="relative flex items-center gap-space-sm">
        {/* The one active-page marker, floated over whichever link is current. */}
        {marker ? (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 h-[3px] rounded-full bg-primary-container transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(${marker.left}px)`, width: `${marker.width}px` }}
          />
        ) : null}

        {navLinks.map((link) => {
          const hasChildren = Boolean(link.children && link.children.length > 0);
          const active = isActivePath(pathname, link.href);
          const isOpen = openDropdown === link.label;

          if (hasChildren && link.children) {
            return (
              <li
                key={link.href}
                className="relative"
                ref={isOpen ? dropdownRef : null}
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  ref={(el) => {
                    if (el) itemRefs.current.set(link.href, el);
                    else itemRefs.current.delete(link.href);
                  }}
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={cn(
                    "group relative inline-flex min-h-10 items-center gap-1.5 rounded-md px-space-sm text-label-lg [letter-spacing:0] transition-[color,background-color,translate] duration-200 active:translate-y-px",
                    active && "font-semibold",
                    inverse
                      ? active
                        ? "text-inverse-on-surface"
                        : "text-inverse-on-surface/70 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                      : active
                        ? "text-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  )}
                >
                  {!active ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-transparent transition-colors duration-200",
                        inverse
                          ? "group-hover:bg-inverse-on-surface/18"
                          : "group-hover:bg-border-hairline-strong"
                      )}
                    />
                  ) : null}
                  <span>{link.label}</span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-3.5 transition-transform duration-200 opacity-70 group-hover:opacity-100",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div
                    className={cn(
                      "animate-menu-in absolute left-0 top-full z-50 mt-2 w-72 origin-top-left overflow-hidden rounded-xl border p-2 shadow-panel backdrop-blur-xl focus:outline-none motion-reduce:animate-none",
                      inverse
                        ? "border-border-hairline-dark bg-scrim-black/95 text-inverse-on-surface"
                        : "border-border-hairline-bold bg-surface/98 text-on-surface"
                    )}
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* Thin gold edge, echoing the active-link underline
                        below it - the dropdown reads as this nav's own
                        surface rather than a generic Radix-style popover. */}
                    <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-primary-container" />
                    <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-gray">
                      {link.label === "Furniture Custom" ? "Kategori Custom" : "Wilayah Jangkauan"}
                    </div>

                    {/* Featured "see all" row, set apart as its own tinted
                        card rather than just the first list item with a
                        rule under it - the one link every visitor to this
                        menu should notice first. */}
                    <Link
                      href={link.href}
                      role="menuitem"
                      className={cn(
                        "group mb-1.5 flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-label-md font-semibold transition-colors duration-150",
                        pathname === link.href
                          ? inverse
                            ? "bg-pure-white/15 text-inverse-on-surface"
                            : "bg-primary-container/16 text-primary"
                          : inverse
                            ? "bg-pure-white/8 text-inverse-on-surface hover:bg-pure-white/14"
                            : "bg-primary-container/10 text-on-surface hover:bg-primary-container/16"
                      )}
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span>Semua {link.label}</span>
                      <ArrowRight
                        aria-hidden
                        className="size-4 shrink-0 text-primary-container transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>

                    <ul className="space-y-0.5">
                      {link.children.map((child) => {
                        const childActive = pathname === child.href;
                        const Icon = child.icon ?? MapPin;
                        return (
                          <li key={child.href} role="none">
                            <Link
                              href={child.href}
                              role="menuitem"
                              className={cn(
                                "group flex items-center gap-2.5 rounded-md px-2 py-2 text-label-md transition-[background-color,color,translate] duration-150",
                                childActive
                                  ? inverse
                                    ? "bg-pure-white/15 font-semibold text-inverse-on-surface"
                                    : "bg-surface-container-low font-semibold text-primary"
                                  : inverse
                                    ? "text-inverse-on-surface/80 hover:translate-x-0.5 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                                    : "text-on-surface-variant hover:translate-x-0.5 hover:bg-surface-container-low hover:text-on-surface"
                              )}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
                                  childActive
                                    ? "bg-primary-container text-primary"
                                    : inverse
                                      ? "bg-pure-white/10 text-inverse-on-surface/70 group-hover:bg-pure-white/16"
                                      : "bg-surface-container-low text-on-surface-variant group-hover:bg-primary-container/16 group-hover:text-primary"
                                )}
                              >
                                <Icon aria-hidden className="size-4" strokeWidth={1.8} />
                              </span>
                              <span className="min-w-0 flex-1 truncate">{child.label}</span>
                              {childActive ? (
                                <span
                                  aria-hidden
                                  className="size-1.5 shrink-0 rounded-full bg-primary-container"
                                />
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          }

          // Regular navigation item
          return (
            <li key={link.href}>
              <Link
                ref={(el) => {
                  if (el) itemRefs.current.set(link.href, el);
                  else itemRefs.current.delete(link.href);
                }}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex min-h-10 items-center rounded-md px-space-sm text-label-lg [letter-spacing:0] transition-[color,background-color,translate] duration-200 active:translate-y-px",
                  active && "font-semibold",
                  inverse
                    ? active
                      ? "text-inverse-on-surface"
                      : "text-inverse-on-surface/70 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                    : active
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                {!active ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-transparent transition-colors duration-200",
                      inverse
                        ? "group-hover:bg-inverse-on-surface/18"
                        : "group-hover:bg-border-hairline-strong"
                    )}
                  />
                ) : null}
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
