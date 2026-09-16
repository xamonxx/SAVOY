import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy",
  description:
    "Kebijakan privasi singkat untuk formulir konsultasi proyek SAVOY.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="container-savoy max-w-3xl py-32">
      <p className="meta-savoy text-savoy-gold">Privacy</p>
      <h1 className="heading-savoy mt-4">Kebijakan Privasi</h1>
      <div className="mt-10 space-y-6 text-base leading-8 text-ink-muted">
        <p>
          Formulir konsultasi {site.name} mengumpulkan nama, nomor WhatsApp,
          lokasi proyek, ruang yang ingin dikerjakan, timeline, lingkup
          kebutuhan, dan catatan opsional.
        </p>
        <p>
          Data digunakan hanya untuk menindaklanjuti konsultasi proyek. Jika
          webhook atau WhatsApp dikonfigurasi, data akan dikirim ke kanal
          operasional yang ditentukan oleh pemilik situs.
        </p>
        <p>
          Alamat bisnis, email resmi, dan kontak produksi masih berstatus
          BUSINESS_DATA_REQUIRED sampai diverifikasi.
        </p>
      </div>
    </main>
  );
}
