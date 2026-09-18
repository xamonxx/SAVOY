"use client";

import {
  Building2,
  ClipboardCheck,
  DraftingCompass,
  House,
  RulerDimensionLine,
  Sofa,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/cn";

type DecorItem = {
  Icon: LucideIcon;
  className: string;
  iconClassName?: string;
  rotate: number;
  size: "sm" | "md" | "lg";
};

const sizeClass: Record<DecorItem["size"], string> = {
  sm: "size-12 lg:size-14",
  md: "size-16 lg:size-20",
  lg: "size-20 lg:size-24",
};

const iconSizeClass: Record<DecorItem["size"], string> = {
  sm: "size-5 lg:size-6",
  md: "size-7 lg:size-8",
  lg: "size-9 lg:size-10",
};

const decorItems: DecorItem[] = [
  {
    Icon: RulerDimensionLine,
    className: "left-[8%] top-[18%]",
    rotate: -10,
    size: "lg",
  },
  {
    Icon: House,
    className: "right-[12%] top-[15%]",
    rotate: 8,
    size: "md",
  },
  {
    Icon: Sofa,
    className: "left-[16%] bottom-[25%]",
    rotate: 7,
    size: "md",
  },
  {
    Icon: Building2,
    className: "right-[7%] bottom-[30%]",
    rotate: -7,
    size: "lg",
  },
  {
    Icon: DraftingCompass,
    className: "left-[30%] bottom-[14%]",
    rotate: -14,
    size: "sm",
  },
  {
    Icon: ClipboardCheck,
    className: "right-[29%] bottom-[13%]",
    rotate: 12,
    size: "sm",
  },
];

export function CtaBannerDecor() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [82, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.55, 1]);
  const y = useSpring(rawY, { stiffness: 90, damping: 24, mass: 0.4 });
  const opacity = useSpring(rawOpacity, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <BlueprintLines />
        <DecorGrid staticMode />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <BlueprintLines />
        <DecorGrid />
      </motion.div>
    </div>
  );
}

function DecorGrid({ staticMode = false }: { staticMode?: boolean }) {
  return (
    <div className="absolute inset-0 hidden md:block">
      {decorItems.map(({ Icon, className, iconClassName, rotate, size }, index) => (
        <motion.div
          key={`${className}-${rotate}`}
          className={cn("absolute grid place-items-center", sizeClass[size], className)}
          initial={false}
          style={{
            rotate,
            y: staticMode ? 0 : index % 2 === 0 ? -8 : 8,
          }}
        >
          {/*
            The badge's "thickness": a second, darker rounded shape sitting
            behind and offset down-right, so the face above it reads as a
            raised object with an edge rather than a flat translucent chip -
            the cheapest real approximation of a 3D icon without shipping a
            model or an icon-pack dependency.
          */}
          <span
            aria-hidden
            className="absolute inset-0 translate-x-1.5 translate-y-2 rounded-2xl bg-[color-mix(in_srgb,var(--color-deep-black)_55%,transparent)]"
          />
          <span className="relative grid size-full place-items-center rounded-2xl border border-pure-white/70 bg-gradient-to-b from-pure-white to-surface-container-low shadow-[0_20px_32px_-14px_rgba(9,11,13,0.45),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Icon
              aria-hidden="true"
              strokeWidth={2}
              className={cn("text-primary drop-shadow-[0_1px_1px_rgba(15,60,44,0.25)]", iconSizeClass[size], iconClassName)}
            />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function BlueprintLines() {
  // White-based, not `deep-black`: that token is the same dark forest green
  // the section's own background now is, so a dark line on a dark ground
  // simply didn't show up at all.
  return (
    <>
      <div className="absolute left-[6%] top-[13%] hidden h-[62%] w-px bg-pure-white/20 md:block">
        <span className="absolute -left-2 top-0 h-px w-4 bg-pure-white/28" />
        <span className="absolute -left-2 bottom-0 h-px w-4 bg-pure-white/28" />
      </div>
      <div className="absolute right-[6%] top-[16%] hidden h-[56%] w-px bg-pure-white/20 md:block">
        <span className="absolute -left-2 top-0 h-px w-4 bg-pure-white/28" />
        <span className="absolute -left-2 bottom-0 h-px w-4 bg-pure-white/28" />
      </div>
      {/* Full-width and at 50%, this sits right across the headline - kept
          near-invisible rather than boosted like the other blueprint marks,
          since raising it read as a stray line cutting through the copy. */}
      <div className="absolute left-[12%] right-[12%] top-[50%] hidden h-px bg-pure-white/8 lg:block" />
      <div className="absolute left-[18%] top-[22%] hidden h-28 w-28 rounded-md border border-dashed border-pure-white/18 lg:block" />
      <div className="absolute right-[18%] bottom-[18%] hidden h-24 w-36 rounded-md border border-dashed border-pure-white/18 lg:block" />
    </>
  );
}
