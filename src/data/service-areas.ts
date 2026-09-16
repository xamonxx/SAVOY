/**
 * Service areas data for SAVOY.
 *
 * Each area corresponds to an article category that developers can assign articles to.
 * Slugs provide clean URL endpoints under `/services/[slug]`.
 */

export interface ServiceArea {
  slug: string;
  name: string;
  city: string;
  seoTitle: string;
  headline: string;
  lead: string;
  seoDescription: string;
  coverageAreas: string[];
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "furniture-custom-bandung",
    name: "Furniture Custom Bandung",
    city: "Bandung",
    seoTitle: "Jasa Pembuatan Furniture Custom Bandung",
    headline: "Furniture custom presisi untuk hunian & ruang komersial di Bandung.",
    lead: "Workshop langsung di Bandung dengan jangkauan survey ke seluruh Kota Bandung. Mulai dari kitchen set, lemari pakaian built-in, lemari bawah tangga, hingga interior ruang kerja.",
    seoDescription: "Jasa kitchen set dan furniture custom di Bandung. Dikerjakan langsung di workshop sendiri dengan survey aktual, desain terukur, dan instalasi rapi.",
    coverageAreas: [
      "Bandung Kota",
      "Dago & Setiabudi",
      "Buahbatu & Batununggal",
      "Antapani & Arcamanik",
      "Kopo & Cibaduyut",
      "Sukajadi & Pasteur",
    ],
  },
  {
    slug: "furniture-custom-cimahi",
    name: "Furniture Custom Cimahi",
    city: "Cimahi",
    seoTitle: "Jasa Pembuatan Furniture Custom Cimahi",
    headline: "Layanan interior & furniture custom terdekat untuk area Cimahi.",
    lead: "Survey langsung ke lokasi dan konsultasi tata letak di seluruh area Cimahi. Desain disesuaikan dengan dimensi aktual ruangan Anda dan diproduksi dengan material berkualitas.",
    seoDescription: "Pembuatan furniture custom dan interior di Cimahi: kitchen set, backdrop TV, lemari pakaian, dan partisi ruangan dengan pengerjaan rapi.",
    coverageAreas: [
      "Cimahi Utara",
      "Cimahi Tengah",
      "Cimahi Selatan",
      "Cihanjuang",
      "Baros & Leuwigajah",
    ],
  },
  {
    slug: "furniture-custom-bandung-barat",
    name: "Furniture Custom Bandung Barat",
    city: "Bandung Barat",
    seoTitle: "Jasa Pembuatan Furniture Custom Bandung Barat",
    headline: "Solusi furniture custom untuk kawasan Bandung Barat & sekitarnya.",
    lead: "Melayani pembuatan furniture custom untuk perumahan, vila, dan apartemen di Bandung Barat seperti Padalarang, Kotabaru Parahyangan, hingga Lembang.",
    seoDescription: "Jasa custom furniture dan kitchen set di Bandung Barat: Kotabaru Parahyangan, Padalarang, Lembang, dan sekitarnya.",
    coverageAreas: [
      "Kotabaru Parahyangan",
      "Padalarang",
      "Ngamprah",
      "Lembang & Parongpong",
      "Cisarua",
    ],
  },
  {
    slug: "furniture-custom-jakarta",
    name: "Furniture Custom Jakarta",
    city: "Jakarta",
    seoTitle: "Jasa Pembuatan Furniture Custom Jakarta",
    headline: "Furniture custom berkualitas untuk rumah & apartemen di Jakarta.",
    lead: "Tim SAVOY melayani survey, pengiriman, dan pemasangan langsung di wilayah DKI Jakarta. Pilihan material tahan lembab (HMR), plywood pilihan, serta hardware awet.",
    seoDescription: "Jasa furniture custom Jakarta: kitchen set apartemen/rumah, walk-in closet, meja kerja, dan backdrop TV dengan desain modern minimalis.",
    coverageAreas: [
      "Jakarta Selatan",
      "Jakarta Barat",
      "Jakarta Pusat",
      "Jakarta Timur",
      "Jakarta Utara",
    ],
  },
  {
    slug: "furniture-custom-tangerang",
    name: "Furniture Custom Tangerang",
    city: "Tangerang",
    seoTitle: "Jasa Pembuatan Furniture Custom Tangerang & BSD",
    headline: "Pembuatan furniture custom di Tangerang, BSD, & Gading Serpong.",
    lead: "Pengerjaan furniture custom terukur untuk hunian baru maupun renovasi di wilayah Tangerang, Tangerang Selatan, BSD City, Bintaro, dan Alam Sutera.",
    seoDescription: "Spesialis custom furniture Tangerang dan BSD: kitchen set elegan, lemari pakaian custom, kabinet bawah tangga, dan interior kamar tidur.",
    coverageAreas: [
      "BSD City & Serpong",
      "Gading Serpong",
      "Alam Sutera",
      "Bintaro & Ciputat",
      "Tangerang Kota & Karawaci",
    ],
  },
  {
    slug: "furniture-custom-bekasi",
    name: "Furniture Custom Bekasi",
    city: "Bekasi",
    seoTitle: "Jasa Pembuatan Furniture Custom Bekasi",
    headline: "Desain dan produksi furniture custom untuk kawasan Bekasi.",
    lead: "Layanan konsultasi, survey presisi, dan instalasi furniture custom untuk rumah tinggal dan komersial di area Bekasi Barat, Bekasi Timur, hingga Grand Galaxy dan Harapan Indah.",
    seoDescription: "Jasa kitchen set dan furniture custom Bekasi: kualitas pengerjaan rapi, finishing HPL/duco premium, dan garansi instalasi.",
    coverageAreas: [
      "Summarecon Bekasi",
      "Harapan Indah",
      "Grand Galaxy & Pekayon",
      "Bekasi Barat & Timur",
      "Tambun & Cikarang",
    ],
  },
];

export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return serviceAreas.find((area) => area.slug === slug);
}

export function getAllServiceAreaSlugs(): string[] {
  return serviceAreas.map((area) => area.slug);
}
