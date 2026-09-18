"use client";

import { useCallback, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import type { FurnitureReference } from "@/data/custom-furniture";

type ImageLightboxProps = {
  items: FurnitureReference[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/**
 * Audit SAV-010: this used to be a hand-built `role="dialog"` div with only
 * a scroll lock and a global `keydown` listener - `aria-modal="true"`
 * claimed modal behavior the markup never actually delivered (no initial
 * focus, no Tab trap, no focus restored to whatever opened it). Radix
 * Dialog supplies all of that; the visual chrome below is unchanged.
 */
export function ImageLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

  // There's no single `Dialog.Trigger` here - any of a whole grid of thumbnail
  // buttons in the parent gallery can open this one shared dialog at a
  // different index each time. Radix's own focus-restore-on-close calls a
  // trigger ref it only gets from `Dialog.Trigger`, so with none registered
  // it has nothing to return focus to. Capturing whichever element was
  // focused right as `isOpen` flips true, then restoring it via
  // `onCloseAutoFocus`, reproduces that behavior for this multi-trigger case.
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
  }, [isOpen]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const prev = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onNavigate(prev);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const next = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    onNavigate(next);
  }, [currentIndex, items.length, onNavigate]);

  // Radix already handles Escape/scroll-lock/focus trap on its own - this is
  // only for the gallery-specific Left/Right navigation, which Radix has no
  // opinion about. Scoped to while the dialog is open, same as before.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext]);

  if (!currentItem) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-scrim-black/92 backdrop-blur-md data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
        <Dialog.Content
          data-lenis-prevent
          aria-label={`Pratinjau ${currentItem.title}`}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastFocusedRef.current?.focus();
          }}
          className="fixed inset-0 z-[100] flex flex-col justify-between p-4 sm:p-6 md:p-8 focus:outline-none data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out"
        >
          <Dialog.Title className="sr-only">{currentItem.title}</Dialog.Title>
          <Dialog.Description className="sr-only">{currentItem.description}</Dialog.Description>

          {/* Top Bar: Counter & Close Button */}
          <div className="flex items-center justify-between text-pure-white/80 w-full max-w-6xl mx-auto z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-full bg-pure-white/10 text-pure-white font-medium">
                {currentItem.style}
              </span>
              <span className="text-xs text-pure-white/60">
                {currentIndex! + 1} / {items.length}
              </span>
            </div>
            <Dialog.Close
              aria-label="Tutup gambar"
              className="size-11 flex items-center justify-center rounded-full bg-pure-white/10 hover:bg-pure-white/20 text-pure-white transition-colors"
            >
              <X className="size-6" />
            </Dialog.Close>
          </div>

          {/* Main Content Area: Arrows + Image */}
          <div className="relative flex-1 flex items-center justify-center my-2 max-w-6xl w-full mx-auto overflow-hidden">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Gambar sebelumnya"
              className="absolute left-1 sm:left-3 z-10 size-11 sm:size-13 flex items-center justify-center rounded-full bg-scrim-black/60 hover:bg-scrim-black/90 text-pure-white border border-pure-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="size-6 sm:size-7" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Gambar selanjutnya"
              className="absolute right-1 sm:right-3 z-10 size-11 sm:size-13 flex items-center justify-center rounded-full bg-scrim-black/60 hover:bg-scrim-black/90 text-pure-white border border-pure-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="size-6 sm:size-7" />
            </button>

            {/* The Enlargeable Image */}
            <div className="relative w-full h-[60vh] sm:h-[68vh] flex items-center justify-center">
              <Image
                src={currentItem.src}
                alt={currentItem.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-contain drop-shadow-2xl rounded-lg select-none"
                priority
              />
            </div>
          </div>

          {/* Bottom Info Bar & Consultation CTA */}
          <div className="w-full max-w-6xl mx-auto bg-scrim-black/80 border border-pure-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-md text-pure-white z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-pure-white leading-tight">
                {currentItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-pure-white/70 line-clamp-2 max-w-2xl">
                {currentItem.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentItem.specs.map((spec) => (
                  <span
                    key={spec}
                    className="text-[11px] px-2 py-0.5 rounded bg-pure-white/10 text-pure-white/80"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <WhatsAppCta
                source="project_detail"
                context={`Model: ${currentItem.title} (${currentItem.style})`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-pure-white transition-colors"
              >
                <span>Konsultasi Model Ini</span>
              </WhatsAppCta>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
