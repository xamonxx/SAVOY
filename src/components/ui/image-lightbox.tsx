"use client";

import { useEffect, useCallback } from "react";
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

export function ImageLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

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

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau ${currentItem.title}`}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-deep-black/92 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar: Counter & Close Button */}
      <div className="flex items-center justify-between text-pure-white/80 w-full max-w-6xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-full bg-pure-white/10 text-pure-white font-medium">
            {currentItem.style}
          </span>
          <span className="text-xs text-pure-white/60">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup gambar"
          className="size-11 flex items-center justify-center rounded-full bg-pure-white/10 hover:bg-pure-white/20 text-pure-white transition-colors"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Main Content Area: Arrows + Image */}
      <div className="relative flex-1 flex items-center justify-center my-2 max-w-6xl w-full mx-auto overflow-hidden">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Gambar sebelumnya"
          className="absolute left-1 sm:left-3 z-10 size-11 sm:size-13 flex items-center justify-center rounded-full bg-deep-black/60 hover:bg-deep-black/90 text-pure-white border border-pure-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="size-6 sm:size-7" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Gambar selanjutnya"
          className="absolute right-1 sm:right-3 z-10 size-11 sm:size-13 flex items-center justify-center rounded-full bg-deep-black/60 hover:bg-deep-black/90 text-pure-white border border-pure-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
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
      <div className="w-full max-w-6xl mx-auto bg-deep-black/80 border border-pure-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-md text-pure-white z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
    </div>
  );
}
