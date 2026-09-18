"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Send,
  AlertCircle,
  X,
  Lock,
} from "lucide-react";

import { submitReviewAction, type SubmitReviewResult } from "@/app/actions/submit-review";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/forms/fields";
import { cn } from "@/lib/cn";

const RATING_LABELS: Record<number, string> = {
  1: "1 - Kurang Puas",
  2: "2 - Cukup",
  3: "3 - Baik",
  4: "4 - Puas",
  5: "5 - Sangat Puas!",
};

/**
 * Audit SAV-010: this used to be a hand-built `createPortal` div with only a
 * scroll lock and a global `keydown` listener for Escape - `aria-modal="true"`
 * claimed modal behavior the markup never delivered (no initial focus, no Tab
 * trap, no focus restored to the trigger button). Radix Dialog supplies all
 * of that; the visual chrome below is unchanged.
 */
export function ReviewForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitReviewResult | null>(null);

  const activeRating = hoverRating ?? rating;

  function closeModal() {
    setIsOpen(false);
    setResult(null);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", rating.toString());

    startTransition(async () => {
      const res = await submitReviewAction(formData);
      setResult(res);
      if (res.success) {
        form.reset();
        setRating(5);
      }
    });
  };

  const dialog = (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-scrim-black/60 backdrop-blur-sm data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
      <Dialog.Content
        data-lenis-prevent
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 py-8 focus:outline-none data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out sm:p-6"
      >
        <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-surface-container-lowest shadow-panel">
          <div className="flex items-start justify-between gap-space-md border-b border-border-hairline bg-surface-container-low/60 p-space-lg sm:p-space-xl">
            <div className="space-y-space-2xs">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-container/15 text-primary">
                <MessageSquarePlus aria-hidden className="size-4" />
              </span>
              <Dialog.Title className="text-headline-sm font-bold text-on-surface">
                Kirimkan Ulasan, Saran, atau Kritik Anda
              </Dialog.Title>
              <Dialog.Description className="text-body-sm text-on-surface-variant">
                Masukan Anda sangat berharga untuk terus menyempurnakan karya dan
                layanan kami.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 rounded-full p-1.5 text-muted-gray transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Tutup formulir ulasan"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-space-lg sm:p-space-xl">
          {result?.success ? (
            <div className="py-space-lg text-center" role="status">
              <div className="mx-auto mb-space-sm flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-label-lg font-bold text-on-surface">
                Ulasan Berhasil Terkirim
              </h3>
              <p className="mx-auto mt-1 max-w-md text-body-sm text-on-surface-variant">
                {result.message}
              </p>
              <div className="mt-space-lg flex items-center justify-center gap-space-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResult(null)}
                >
                  Tulis Ulasan Lain
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={closeModal}
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-space-lg">
              {/*
                Honeypot (audit SAV-001): invisible to a sighted visitor,
                skipped by keyboard/screen-reader users, but still a normal
                form field a bot's autofill will happily populate.
                `left:-9999px`, not `display:none` - some bots specifically
                skip fields with no rendered box.
              */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor="review-website">Website</label>
                <input
                  id="review-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {result && !result.success ? (
                <div className="flex items-start gap-space-xs rounded-lg border border-red-200 bg-red-50 p-space-sm text-body-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p className="font-semibold">{result.error}</p>
                </div>
              ) : null}

              {/* Rating Bintang */}
              <div className="space-y-space-2xs rounded-xl border border-border-hairline bg-surface-container-low/50 p-space-md text-center">
                <label className="block text-label-md font-semibold text-on-surface">
                  Rating Kepuasan Anda <span className="text-error">*</span>
                </label>
                <div
                  className="flex items-center justify-center gap-1"
                  onMouseLeave={() => setHoverRating(null)}
                  role="radiogroup"
                  aria-label="Pilih rating bintang dari 1 sampai 5"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`Beri ${star} bintang`}
                        role="radio"
                        aria-checked={rating === star}
                      >
                        <Star
                          className={cn(
                            "size-8 transition-colors",
                            isFilled
                              ? "fill-primary-container text-primary-container"
                              : "fill-transparent text-border-hairline-strong group-hover:text-primary-container"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="block text-label-md font-semibold text-primary-container-hover">
                  {RATING_LABELS[activeRating]}
                </span>
              </div>

              {/* Input Nama & Alamat */}
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <div className="space-y-space-2xs">
                  <label
                    htmlFor="review-name"
                    className="block text-label-md font-semibold text-on-surface"
                  >
                    Nama Lengkap / Panggilan <span className="text-error">*</span>
                  </label>
                  <input
                    id="review-name"
                    name="name"
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Contoh: Ibu Rina Paramita"
                    className={controlClasses}
                    disabled={isPending}
                  />
                  {result && !result.success && result.fieldErrors?.name ? (
                    <p className="text-body-sm text-error">
                      {result.fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-space-2xs">
                  <label
                    htmlFor="review-address"
                    className="block text-label-md font-semibold text-on-surface"
                  >
                    Alamat / Kota / Wilayah <span className="text-error">*</span>
                  </label>
                  <input
                    id="review-address"
                    name="address"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Contoh: Bandung atau Jakarta Selatan"
                    className={controlClasses}
                    disabled={isPending}
                  />
                  {result && !result.success && result.fieldErrors?.address ? (
                    <p className="text-body-sm text-error">
                      {result.fieldErrors.address}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Input Email (Private / Developer Data Only) */}
              <div className="space-y-space-2xs rounded-xl border border-border-hairline bg-surface-container-low/50 p-space-sm">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label
                    htmlFor="review-email"
                    className="block text-label-md font-semibold text-on-surface"
                  >
                    Alamat Email <span className="text-error">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-gray">
                    <Lock aria-hidden className="size-3" />
                    Privat, tidak dipublikasikan
                  </span>
                </div>
                <input
                  id="review-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="Contoh: nama@email.com"
                  className={cn(controlClasses, "bg-surface-container-lowest")}
                  disabled={isPending}
                />
                {result && !result.success && result.fieldErrors?.email ? (
                  <p className="text-body-sm text-error">
                    {result.fieldErrors.email}
                  </p>
                ) : null}
              </div>

              {/* Textarea Saran / Kritik / Ulasan */}
              <div className="space-y-space-2xs">
                <label
                  htmlFor="review-desc"
                  className="block text-label-md font-semibold text-on-surface"
                >
                  Ulasan, Saran, atau Kritik <span className="text-error">*</span>
                </label>
                <textarea
                  id="review-desc"
                  name="description"
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="Ceritakan pengalaman Anda bekerja sama dengan tim SAVOY, atau sampaikan kritik dan saran untuk perbaikan kami ke depan..."
                  className={cn(controlClasses, "resize-y")}
                  disabled={isPending}
                />
                {result && !result.success && result.fieldErrors?.description ? (
                  <p className="text-body-sm text-error">
                    {result.fieldErrors.description}
                  </p>
                ) : null}
              </div>

              <p className="text-body-sm text-on-surface-variant">
                Nama, wilayah, rating, dan ulasan akan ditampilkan secara publik setelah
                ditinjau tim kami; email Anda tetap privat. Selengkapnya di{" "}
                <a href="/privacy" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                  Kebijakan Privasi
                </a>
                .
              </p>

              {/* Form Actions */}
              <div className="flex flex-wrap items-center justify-end gap-space-sm border-t border-border-hairline pt-space-md">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="min-w-36 gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-deep-black border-t-transparent" />
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Kirim Ulasan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setIsOpen(true);
        else closeModal();
      }}
    >
      {/*
        A real `Dialog.Trigger`, not `Button` wrapped in `asChild`: Radix
        restores focus on close by calling the trigger's own ref directly
        (`context.triggerRef.current?.focus()`), not by generically restoring
        whatever was previously focused - so the trigger has to be a `Trigger`
        Radix knows about. `Button` isn't a `forwardRef` component, so `Slot`
        would get a null ref and that restoration would silently never fire.
        Matches `mobile-menu.tsx`, which hand-rolls its own classes on
        `Dialog.Trigger` for the same reason instead of nesting `Button`.
      */}
      <Dialog.Trigger
        className={cn(
          // Same four inputs `<Button variant="outline" size="sm">` would
          // compose, reproduced here (not imported - button.tsx only exports
          // `Button` itself) so `cn`'s tailwind-merge output is byte-identical.
          "inline-flex items-center justify-center gap-space-xs rounded-lg font-semibold " +
            "bg-[length:200%_200%] bg-[position:0%_0%] hover:bg-[position:100%_100%] " +
            "transition-[background-position,color,border-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] " +
            "hover:-translate-y-px active:translate-y-0 " +
            "disabled:pointer-events-none disabled:opacity-50",
          "border border-border-hairline-strong text-on-surface " +
            "bg-[linear-gradient(135deg,transparent_0%,var(--color-surface-container-low)_100%)] " +
            "hover:border-on-surface",
          "px-space-lg py-space-xs text-label-md pointer-coarse:min-h-11",
          "gap-2 border-primary-container bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-pure-white"
        )}
      >
        <MessageSquarePlus className="size-4 text-primary-container" />
        <span>Beri Ulasan / Saran</span>
      </Dialog.Trigger>

      {dialog}
    </Dialog.Root>
  );
}
