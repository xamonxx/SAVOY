export const trustPoints = [
  "Dirancang berdasarkan ukuran aktual",
  "Material dispesifikasikan sebelum produksi",
  "Fabrikasi terkontrol",
  "Instalasi & handover terstruktur",
] as const;

export const featuredProjects = [
  {
    name: "PROJECT_DATA_REQUIRED",
    location: "PROJECT_DATA_REQUIRED",
    category: "Kitchen & Pantry",
    challenge: "PROJECT_DATA_REQUIRED",
    intervention: "PROJECT_DATA_REQUIRED",
    materials: "PROJECT_DATA_REQUIRED",
    orientation: "landscape",
  },
  {
    name: "PROJECT_DATA_REQUIRED",
    location: "PROJECT_DATA_REQUIRED",
    category: "Wardrobe",
    challenge: "PROJECT_DATA_REQUIRED",
    intervention: "PROJECT_DATA_REQUIRED",
    materials: "PROJECT_DATA_REQUIRED",
    orientation: "portrait",
  },
  {
    name: "PROJECT_DATA_REQUIRED",
    location: "PROJECT_DATA_REQUIRED",
    category: "Full Home",
    challenge: "PROJECT_DATA_REQUIRED",
    intervention: "PROJECT_DATA_REQUIRED",
    materials: "PROJECT_DATA_REQUIRED",
    orientation: "panorama",
  },
] as const;

export const services = [
  {
    name: "Kitchen & Pantry",
    description:
      "Area kerja dapur dirancang dari alur memasak, tinggi pengguna, sirkulasi, dan kebiasaan penyimpanan.",
  },
  {
    name: "Wardrobe",
    description:
      "Lemari built-in untuk pola simpan harian, pakaian panjang, aksesori, koper, dan ritme penggunaan kamar.",
  },
  {
    name: "Bedroom",
    description:
      "Komposisi ranjang, headboard, meja rias, dan penyimpanan agar kamar terasa tenang dan proporsional.",
  },
  {
    name: "Living",
    description:
      "Backdrop, cabinet, display, dan storage ruang keluarga yang menjaga visual tetap rapi.",
  },
  {
    name: "Full Home",
    description:
      "Perencanaan menyeluruh untuk beberapa ruang dengan bahasa material dan detail yang konsisten.",
  },
  {
    name: "Commercial",
    description:
      "Interior komersial yang mempertimbangkan traffic, durabilitas, identitas brand, dan kemudahan operasional.",
  },
] as const;

export const processSteps = [
  ["01", "Konsultasi", "Kebutuhan, kebiasaan, dan prioritas ruang dipetakan terlebih dahulu."],
  ["02", "Survey", "Ukuran aktual, titik utilitas, dan kondisi bangunan diverifikasi di lokasi."],
  ["03", "Design", "Proporsi, fungsi, dan bahasa material diterjemahkan ke rancangan yang dapat dieksekusi."],
  ["04", "RAB", "Ruang lingkup, material, dan biaya dibuat jelas sebelum produksi berjalan."],
  ["05", "Produksi", "Panel, finishing, hardware, dan detail dibuat dalam kontrol kerja yang rapi."],
  ["06", "Instalasi & Handover", "Pemasangan, penyesuaian akhir, dan serah terima diselesaikan terstruktur."],
] as const;

export const materials = [
  {
    name: "Core",
    description:
      "Struktur panel dipilih berdasarkan kelembapan, beban, bentang, dan area pemakaian.",
    detail: "MATERIAL_DATA_REQUIRED",
  },
  {
    name: "Finish",
    description:
      "Finishing menentukan rasa visual ruang sekaligus kebutuhan perawatan jangka panjang.",
    detail: "MATERIAL_DATA_REQUIRED",
  },
  {
    name: "Hardware",
    description:
      "Engsel, rel, dan mekanisme menentukan kenyamanan pemakaian setiap hari.",
    detail: "MATERIAL_DATA_REQUIRED",
  },
  {
    name: "Edge",
    description:
      "Detail tepi menjaga panel terlihat bersih dan lebih tahan terhadap aktivitas ruang.",
    detail: "MATERIAL_DATA_REQUIRED",
  },
  {
    name: "Stone / Surface",
    description:
      "Permukaan kerja dipilih dari kebutuhan panas, noda, benturan, dan karakter visual.",
    detail: "MATERIAL_DATA_REQUIRED",
  },
] as const;

export const assuranceRows = [
  ["Measurement", "Dimensi aktual menjadi dasar rancangan, bukan asumsi ukuran katalog."],
  ["Design Approval", "Produksi dimulai setelah layout, proporsi, dan detail disetujui."],
  ["Material Specification", "Material utama, finishing, hardware, dan surface harus tertulis jelas."],
  ["RAB / Scope", "Lingkup pekerjaan dipisahkan dari hal yang belum termasuk agar tidak kabur."],
  ["Timeline & Handover", "Tahapan kerja dan serah terima dibahas sebelum pekerjaan berjalan."],
] as const;

export const faqs = [
  {
    question: "Apakah SAVOY bisa langsung memberi harga dari foto?",
    answer:
      "Estimasi awal bisa dibahas dari foto dan ukuran kasar, tetapi angka yang layak dipakai untuk keputusan produksi membutuhkan ukuran aktual, material, dan lingkup pekerjaan yang jelas.",
  },
  {
    question: "Apakah saya harus sudah punya desain?",
    answer:
      "Tidak. Konsultasi dimulai dari kebutuhan ruang, kebiasaan penggunaan, dan referensi visual. Rancangan teknis dibangun setelah kondisi ruang dipahami.",
  },
  {
    question: "Apakah SAVOY mengerjakan satu ruangan saja?",
    answer:
      "Bisa. Satu area seperti kitchen, wardrobe, bedroom, atau living dapat dikerjakan terpisah selama lingkupnya jelas.",
  },
  {
    question: "Apa yang belum bisa ditampilkan di website ini?",
    answer:
      "Data proyek, testimonial, alamat, dan kontak resmi SAVOY masih menunggu verifikasi. Bagian tersebut sengaja ditandai sebagai data required agar tidak ada klaim palsu.",
  },
] as const;
