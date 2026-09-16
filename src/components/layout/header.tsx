"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import { navLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Header() {
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const whatsapp = buildWhatsAppUrl({ source: "header" });

  useEffect(() => {
    const update = () => setSettled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        settled ? "border-border-soft bg-savoy-ivory" : "border-transparent bg-transparent"
      )}
    >
      <div className="container-savoy flex h-20 items-center justify-between gap-6">
        <BrandMark eager />
        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-savoy-ink transition-colors hover:text-savoy-espresso"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button href={whatsapp ?? "#planner"} size="sm">
            Konsultasi Proyek
          </Button>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md border border-border-soft lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border-soft bg-savoy-ivory lg:hidden">
          <nav className="container-savoy grid gap-1 py-5" aria-label="Navigasi mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border-b border-border-soft py-4 text-lg font-semibold"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href={whatsapp ?? "#planner"} className="mt-4" onClick={() => setOpen(false)}>
              Konsultasi Proyek
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
