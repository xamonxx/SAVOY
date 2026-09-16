import { BrandMark } from "@/components/layout/brand-mark";
import { navLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();
  const whatsapp = buildWhatsAppUrl({ source: "footer" });

  return (
    <footer id="studio" className="border-t border-border-soft bg-surface-muted">
      <div className="container-savoy grid gap-12 py-16 lg:grid-cols-[1.4fr_0.8fr_1fr]">
        <div className="space-y-5">
          <BrandMark />
          <p className="max-w-xl text-base leading-7 text-ink-muted">{site.description}</p>
          <p className="meta-savoy text-ink-muted">
            Contact: {site.email ?? "BUSINESS_DATA_REQUIRED"}
          </p>
          <p className="meta-savoy text-ink-muted">
            Location: {site.address?.addressLocality ?? "BUSINESS_DATA_REQUIRED"}
          </p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-3">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-savoy-ink">
              {link.label}
            </a>
          ))}
          <a href="/privacy" className="text-sm font-semibold text-savoy-ink">
            Privacy
          </a>
        </nav>
        <div className="space-y-5">
          <p className="heading-savoy text-[clamp(2rem,4vw,3rem)]">
            Mari mulai dari ruang yang Anda miliki.
          </p>
          <Button href={whatsapp ?? "#planner"}>Konsultasi Proyek</Button>
        </div>
      </div>
      <div className="container-savoy border-t border-border-soft py-5 text-sm text-ink-muted">
        © {year} {site.name}. BUSINESS_DATA_REQUIRED for legal entity details.
      </div>
    </footer>
  );
}
