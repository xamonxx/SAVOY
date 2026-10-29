export interface LocationBranch {
  id: "bandung" | "depok";
  name: string;
  shortLabel: string;
  badge: string;
  city: string;
  address: string;
  hours: string;
  description: string;
  embedUrl: string;
  mapsUrl: string;
}

export const BRANCHES: readonly LocationBranch[] = [
  {
    id: "bandung",
    name: "Kantor Pusat (Bandung Barat)",
    shortLabel: "Kantor Pusat",
    badge: "Kantor Pusat",
    city: "Bandung Barat",
    address:
      "Jl. Nasional III, Citatah, Kec. Cipatat, Kabupaten Bandung Barat, Jawa Barat 40554",
    hours: "Senin – Minggu, 08:00 – 17:00 WIB",
    description:
      "Kantor pusat konsultasi Savoy Interior untuk perancangan desain, konsultasi material, dan koordinasi pengerjaan wilayah Bandung Raya dan sekitarnya.",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.4682072794594!2d107.4214432!3d-6.8343303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68fde32bb30861%3A0xc6787320da591122!2sSavoy%20interior!5e0!3m2!1sid!2sid!4v1793264688951!5m2!1sid!2sid",
    mapsUrl: "https://maps.app.goo.gl/6VuCQWVSYrvs1wtaA",
  },
  {
    id: "depok",
    name: "Kantor Cabang Depok",
    shortLabel: "Cabang Depok",
    badge: "Kantor Cabang",
    city: "Kota Depok",
    address:
      "Jl. Grafika No.1, Tirtajaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16412",
    hours: "Senin – Minggu, 08:00 – 17:00 WIB",
    description:
      "Kantor cabang untuk konsultasi langsung, survey ukuran aktual ruangan, dan koordinasi pengerjaan interior untuk wilayah Depok dan Jabodetabek.",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.872693695945!2d106.828836!3d-6.410395399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ebdab83fac87%3A0x20ac9f9e4dfc380c!2sJl.%20Grafika%20No.1%2C%20Tirtajaya%2C%20Kec.%20Sukmajaya%2C%20Kota%20Depok%2C%20Jawa%20Barat%2016412!5e0!3m2!1sid!2sid!4v1793264988474!5m2!1sid!2sid",
    mapsUrl:
      "https://maps.google.com/?q=Jl.+Grafika+No.1,+Tirtajaya,+Kec.+Sukmajaya,+Kota+Depok,+Jawa+Barat+16412",
  },
] as const;
