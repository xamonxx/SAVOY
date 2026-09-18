import { Button } from "@/components/ui/button";
import { HorizontalGallery } from "@/components/motion/horizontal-gallery";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/ui/project-card";
import { Eyebrow } from "@/components/ui/typography";
import {
  featuredProjects,
  getProjectsByCategory,
  heroProjects,
  photoCount,
  projectCount,
} from "@/data/projects";

/*
 * Slot widths for the mobile/tablet grid - the `lg:hidden` fallback below the
 * pinned gallery, which only takes over from `lg` up.
 */
const GRID_SIZES = [
  "(min-width: 640px) calc((100vw - 72px) / 2)",
  "calc((100vw - 52px) / 2)",
].join(", ");

/**
 * Section 04 - Selected portfolio.
 *
 * One project per category so the selection demonstrates range. The counts
 * in the call to action come from the data itself rather than a rounded-up
 * claim. Capped at eight cards: past that the pinned scroll on desktop runs
 * long enough to feel like a detour rather than a preview, and the full set
 * is one tap away on /portfolio regardless.
 *
 * The horizontal, GSAP-pinned gallery is a desktop effect - it needs the
 * scroll room a `lg` viewport has to spend and a mouse or trackpad to drive
 * it comfortably. Below `lg` it is not present at all, not just hidden: the
 * same eight projects render as a plain two-column grid, no horizontal
 * scrolling, no pin.
 */
export function PortfolioPreview() {
  // The hero already shows these projects in full bleed; swap each out here
  // so the same photograph does not appear twice on one page.
  const heroSlugs = new Set(heroProjects.map((project) => project.slug));
  const selection = featuredProjects
    .map((project) => {
      if (!heroSlugs.has(project.slug)) return project;
      const alternative = getProjectsByCategory(project.categorySlug).find(
        (candidate) => !heroSlugs.has(candidate.slug)
      );
      return alternative ?? project;
    })
    .slice(0, 8);

  return (
    <section id="portfolio" className="bg-surface-container-low py-space-4xl">
      <Reveal className="container-editorial">
        <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="max-w-2xl space-y-space-xs">
            <Eyebrow>Portofolio terpilih</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Lihat bagaimana sebuah kebutuhan berubah menjadi ruang.
            </h2>
          </div>
          <p className="shrink-0 text-body-sm text-on-surface-variant">
            {projectCount} proyek • {photoCount} foto pengerjaan
          </p>
        </div>
      </Reveal>

      <div className="hidden lg:block">
        <HorizontalGallery projects={selection} />
      </div>

      <RevealGroup
        as="ul"
        className="container-editorial grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:hidden"
      >
        {selection.map((project, index) => (
          <RevealItem as="li" key={project.slug}>
            <ProjectCard
              project={project}
              ratio={index === 0 ? "tall" : "standard"}
              sizes={GRID_SIZES}
            />
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="container-editorial mt-space-2xl text-center">
        <Button href="/portfolio" variant="surface">
          Jelajahi Semua Proyek
        </Button>
      </Reveal>
    </section>
  );
}
