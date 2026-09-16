import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-savoy grid min-h-[70svh] place-items-center py-32 text-center">
      <div className="max-w-2xl space-y-6">
        <p className="meta-savoy text-savoy-gold">Error 404</p>
        <h1 className="heading-savoy">Halaman yang Anda cari tidak ditemukan.</h1>
        <p className="text-lg leading-8 text-ink-muted">
          Tautan mungkin sudah berubah. Kembali ke beranda untuk memulai lagi.
        </p>
        <Button href="/">Kembali ke Beranda</Button>
      </div>
    </section>
  );
}
