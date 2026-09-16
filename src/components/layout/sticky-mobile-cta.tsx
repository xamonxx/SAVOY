"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function StickyMobileCta() {
  const [shown, setShown] = useState(false);
  const whatsapp = buildWhatsAppUrl({ source: "sticky_mobile" });

  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.65);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-savoy-ivory px-4 py-3 transition-transform lg:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!shown}
    >
      <a
        href={whatsapp ?? "#planner"}
        className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-savoy-obsidian px-4 text-sm font-semibold text-savoy-ivory"
        tabIndex={shown ? undefined : -1}
      >
        <MessageCircle aria-hidden className="size-4" />
        Konsultasi Proyek
      </a>
    </div>
  );
}
