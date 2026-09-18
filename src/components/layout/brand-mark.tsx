import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const SIZES = {
  // The header bar itself is `h-20` (80px) - at 72px tall the old mark left
  // only 4px of clearance top and bottom, which is why it read as oversized
  // rather than as a logo sitting inside a bar. Sized to roughly half the
  // bar's height instead, so it has real breathing room at every breakpoint.
  header: "h-9 w-28 object-contain sm:h-10 sm:w-32 lg:h-11 lg:w-36",
  footer: "h-16 w-48 object-contain sm:h-[72px] sm:w-56",
} as const;

type BrandMarkProps = {
  /** "dark" renders the charcoal wordmark for light surfaces. */
  tone?: "dark" | "light";
  size?: keyof typeof SIZES;
  className?: string;
  /** Omit the link when the mark sits inside another link or a heading. */
  asLink?: boolean;
  /**
   * Start the download immediately instead of lazily. For a mark that is on
   * screen at first paint.
   *
   * Paired with `fetchPriority="low"` below, which is what actually keeps the
   * mark out of the way. React 19 preloads every server-rendered <img> unless
   * it is lazy or explicitly low priority, so eager loading alone put two
   * <link rel=preload> tags in the head ahead of the hero photograph - the
   * page's real LCP element - and on throttled 4G the hero paid for it. Low
   * priority drops the preload and still starts the download immediately, so
   * the mark never flashes in but never jumps the queue either. It renders
   * fourteen pixels tall; it can afford to wait behind a full-screen photo.
   */
  eager?: boolean;
};

/**
 * Two distinct source files, not one recoloured programmatically: the studio
 * supplied a dedicated all-white mark (no gold) for use on dark grounds,
 * separate from the charcoal-and-gold mark used everywhere else. Each keeps
 * its own true intrinsic size below - they were cropped from different
 * canvases and don't share an aspect ratio.
 */
const SOURCES = {
  dark: { src: "/brand/savoy-logo-transparent.png", width: 760, height: 272 },
  light: { src: "/brand/savoy-logo-white.png", width: 919, height: 313 },
} as const;

/**
 * The SAVOY wordmark.
 *
 * Two variants: the charcoal-and-gold mark for the warm-white surface the
 * site mostly uses, and a plain white twin for the header while it floats
 * transparent over the hero photograph.
 */
export function BrandMark({
  tone = "dark",
  size = "header",
  className,
  asLink = true,
  eager = false,
}: BrandMarkProps) {
  const source = SOURCES[tone];
  const image = (
    <Image
      src={source.src}
      alt={site.name}
      width={source.width}
      height={source.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority="low"
      className={SIZES[size]}
    />
  );

  if (!asLink) {
    return <span className={cn("inline-flex items-center", className)}>{image}</span>;
  }

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label={`${site.name} - beranda`}
    >
      {image}
    </Link>
  );
}
