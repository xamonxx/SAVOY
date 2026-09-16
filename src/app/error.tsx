"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <section className="container-savoy grid min-h-[70svh] place-items-center py-32 text-center">
      <div className="max-w-2xl space-y-6">
        <p className="meta-savoy text-savoy-gold">Terjadi kesalahan</p>
        <h1 className="heading-savoy">Halaman ini gagal dimuat.</h1>
        <p className="text-lg leading-8 text-ink-muted">
          Silakan coba muat ulang. Jika masih bermasalah, hubungi SAVOY lewat kanal resmi yang sudah diverifikasi.
        </p>
        {error.digest ? <p className="text-sm text-ink-muted">Kode: {error.digest}</p> : null}
        <Button type="button" onClick={reset}>
          Coba Lagi
        </Button>
      </div>
    </section>
  );
}
