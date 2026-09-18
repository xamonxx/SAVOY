# SAVOY - Full Production Readiness Audit

Tanggal audit: 2026-09-17 (Asia/Bangkok). Repository: `C:/laragon/www/SAVOY`.
Mode: analysis-first. Tidak ada implementasi perbaikan production source dalam fase ini.
Dokumen ini adalah snapshot working tree, bukan hanya commit terakhir. Semua rekomendasi adalah pekerjaan untuk fase setelah instruksi `IMPLEMENT FIX`.

## 1. Executive Summary

Status: **belum layak diberi persetujuan production readiness**. Quality gates final lulus, tetapi dua temuan P1 masih terbuka: perlindungan kiriman publik (SAV-001) dan potensi kehilangan data saat storage gagal dibaca (SAV-002).

Total 22 findings: P0 0, P1 2, P2 16, P3 2, INFO 2. Status temuan: 21 CONFIRMED, 1 PROBABLE. Hitungan ini tidak memasukkan sinyal scanner yang belum terbukti atau blocked checks sebagai bug.

Kekuatan yang terbukti: lint/typecheck/build lulus setelah recovery dependensi; 114 URL sitemap memberi 200 dan memiliki title, description, canonical serta satu H1; JSON-LD memakai escaping karakter <; admin page/action memiliki server auth; var rahasia tidak ditandai NEXT_PUBLIC; image variants tersedia; menu mobile menggunakan Radix.

Area yang masih BLOCKED: HTTP domain production/CDN, TLS/edge, field Core Web Vitals, real low-end devices, authenticated CMS HTTP mutations/uploads, pengiriman SMTP/webhook nyata, backup/restore deployment dan concurrent multi-process hosting. Hasil lokal tidak membuktikan area tersebut aman.

## 2. Audit Scope

Inventaris seluruh source tree, package/lock/config/env contract, app routes, server actions, JSON storage, public resources dan image pipeline. Automated source reviewer memindai 127 TS/JS files; a11y source scanner memindai 95 files. Manual review diprioritaskan pada boundary auth/storage/input/output, SEO routes, shared layout/motion dan komponen yang menimbulkan bukti runtime.

Runtime: Next production webpack build dan next start di localhost:3100; 114 route HTTP checks, metadata parse seluruh sitemap routes, 81 responsive checks (9 route x 9 width), lima axe route checks, menu keyboard smoke, lightbox focus, cold local performance dan scroll/image smoke.

Cakupan bukan klaim bahwa setiap kombinasi route/state/device atau setiap baris bebas bug. Untested states dan deployment-dependent controls ditulis eksplisit di bawah.

Skills: code-reviewer (universal + TypeScript), dependency-auditor, a11y-audit, security-best-practices (Next.js server + React/general frontend), webapp-testing. Rujukan framework utama berasal dari docs Next 16.3.4 yang terpasang.

## 3. Repository Baseline

- Branch: `master`.
- HEAD: `8d6edea36095b6485fc5d92993d7afb423f33122`.
- Working tree sudah dirty sebelum audit: 65 tracked files berubah, termasuk konfigurasi, data CMS, branding, motion dan layout; ada untracked komponen/AGENTS/CLAUDE. Perubahan pengguna dihormati.
- Package: savoy 0.1.0, private.
- Architecture: Next.js App Router, React 19, strict TypeScript, Tailwind 4; marketing SSG/static, admin dynamic, filesystem CMS/review, server actions.
- Storage: `src/data/custom-articles.json` (22 records), `src/data/public-reviews.json` (0 records); upload di `public/uploads/articles`.
- Runtime bookkeeping: `src/data/.rate-limit-state.json`; derived assets `public/v`, build `.next`, diignore.
- Tidak ada database adapter, payment, public registration, OAuth, service worker, atau public upload endpoint yang ditemukan. NOT_APPLICABLE untuk kategori tersebut.
- Hosting single-process hanya disebut dalam komentar helper. AGENTS yang diberikan tidak menetapkan konfigurasi hosting. Process topology aktual NEEDS_RUNTIME_VERIFICATION.

Route inventory (seluruh keluarga app):

| Family | Count/Shape | Rendering | Purpose |
| --- | --- | --- | --- |
| Public static pages | /, /about, /contact, /survey, /privacy, /services, /portfolio, /knowledge, /furniture-custom | static | Marketing/conversion |
| /portfolio/[slug] | 62 | SSG, dynamicParams false | Project detail |
| /portfolio/kategori/[slug] | 10 | SSG, dynamicParams false | Category pages |
| /services/[slug] | 6 | SSG with dynamicParams true | Service area |
| /furniture-custom/[slug] | 5 | SSG with dynamicParams true | Furniture category |
| /knowledge/[slug] | 22 at build; later params allowed | SSG/on-demand | CMS article |
| Admin | /admin, /admin/login, /admin/articles, /admin/articles/new, /admin/articles/[slug]/edit | dynamic | Protected CMS |
| Metadata/resources | /robots.txt, /sitemap.xml, /manifest.webmanifest, /opengraph-image, /icon.png, /apple-icon.png, /favicon.ico | static/generated | Crawling/previews |
| /llms.txt | static route handler | force-static | Brand summary |
| Missing/error | not-found, error, loading | framework boundaries | Recovery |

Public HTML URLs in sitemap total 114 (9+62+10+6+5+22). Build reports 128 static generation tasks including framework/metadata resources; angka itu bukan jumlah marketing pages.

## 4. Environment & Build Baseline

Windows PowerShell, Node.js v25.9.0. Build menggunakan .env.local yang sudah ada; secret values tidak dibaca/dicetak ke laporan. Env contract .env.example dibaca sebagai template.

`npm ci` gagal EPERM saat unlink lightningcss.win32-x64-msvc.node. Tidak ada proses pengguna dihentikan untuk membebaskan file. Recovery `npm install --ignore-scripts --package-lock=false` selesai, lockfile tidak berubah; ini **bukan pengganti bukti clean npm ci berhasil**. Native Sharp dapat berjalan sesudah recovery.

Percobaan gate awal saat node_modules parsial gagal: eslint/tsc tidak tersedia, Sharp module hilang; percobaan typecheck berikutnya sempat TS7016 Lucide saat dependensi belum stabil. Percobaan final typecheck/build lulus. Error transient ini tidak dipromosikan menjadi bug source.

Untuk reproduksi release: fresh checkout supported Node LTS, clean npm ci, konfigurasi env terverifikasi, semua final gates. Kompatibilitas Node/OS deployment target BLOCKED karena target tidak tersedia.

## 5. Audit Methodology

Prioritas bukti: source aktual, runtime production lokal, lockfile, manifest, docs versi terpasang, primary references. README/komentar tidak menggantikan bukti deployment.

CONFIRMED berarti perilaku/kontrol dibuktikan dalam source atau runtime/harness terisolasi; tidak selalu berarti eksploitasi remote sudah dijalankan. PROBABLE digunakan untuk duplicate webhook karena perilaku receiver belum diketahui. NEEDS_RUNTIME_VERIFICATION dan BLOCKED adalah batas verifikasi, bukan kelulusan. FALSE_POSITIVE tidak dihitung. NOT_APPLICABLE memerlukan alasan architecture.

Harness source mentranspile source TypeScript yang ada dengan TypeScript terpasang dan memakai filesystem virtual, auth stub terautentikasi serta fixture baseline. Harness membuktikan cabang business logic, bukan auth HTTP atau konfigurasi host. Tidak menulis ulasan/artikel fixture ke data SAVOY dan tidak mengirim email/webhook.

Scratch tools/screenshots berada di Windows Temp; satu-satunya artifact baru dalam repository adalah dokumen audit ini.

Primary references yang diperiksa:
- [OWASP HTML context encoding](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).
- [W3C Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- [Google robots meta rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).
- Local `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`.
- Local `.../03-file-conventions/01-metadata/sitemap.md` dan `.../04-functions/revalidatePath.md`.

## 6. Quality Gate Results

| Check | Final Result | Evidence / Limitation |
| --- | --- | --- |
| npm ci | BLOCKED / failed | EPERM locked Lightning CSS native binary |
| Recovery install | PASS | ignore-scripts, package-lock=false; completed, known audit vulnerabilities 0 |
| npm run lint | PASS | exit 0, eslint src |
| npm run typecheck | PASS | final exit 0, tsc --noEmit |
| npm run build | PASS | Next 16.3.4 webpack; compile 51s; TypeScript 10.4s; 128/128 generated |
| prepare:variants | PASS | 1512 current variants, 42.6MB distinct data, 3.6s |
| npm audit --json | PASS (known advisories) | 0 vulnerabilities; 509 lock-tree dependencies, including optional/platform entries |
| npm start -- --port 3100 | PASS | ready 288ms; audit-owned server |
| Sitemap HTTP / metadata | PASS snapshot | 114/114 200, title/description/canonical/one H1 |
| Viewport smoke | PARTIAL PASS | 79/81 no document overflow; / and /about fail 768px fine pointer |
| Axe | FAIL | color-contrast findings; gradients independently fail contrast calculation |
| Lightbox keyboard | FAIL | initial focus and next Tab remain outside dialog |
| Page errors | PASS sampled | [] during main browser route/viewport sweep |
| Storage/schema harness | FAIL business behavior | corrupt overwrite, baseline resurrection, rename duplication, impossible date accepted |

## 7. Findings Overview

| ID | Status | Severity | Priority | Category | Finding | Location |
| --- | --- | --- | --- | --- | --- | --- |
| SAV-001 | CONFIRMED | High | P1 | Security / abuse | Form publik tidak memiliki pembatasan kiriman | src/app/actions/submit-review.ts:39; src/app/actions/submit-survey.ts:29; src/lib/reviews.ts:96 |
| SAV-002 | CONFIRMED | High | P1 | Data integrity | Read error diperlakukan sebagai data kosong lalu ditimpa | src/lib/reviews.ts:19; src/lib/articles.ts:14 |
| SAV-003 | CONFIRMED | Medium | P2 | Injection / email | Konten pengulas diinterpolasi tanpa HTML encoding | src/lib/email.ts:41 |
| SAV-004 | CONFIRMED | Medium | P2 | HTTP headers | Baseline header keamanan absen pada server production lokal | next.config.mjs:76 |
| SAV-005 | CONFIRMED | Medium | P2 | CMS / uploads | Batas upload 10 MB bertentangan dengan limit Server Action 1 MB | src/components/admin/article-editor.tsx:93; src/app/actions/admin-articles.ts:143; next.config.mjs |
| SAV-006 | CONFIRMED | Medium | P2 | SEO / cache | Mutation artikel tidak menginvalidasi sitemap | src/app/sitemap.ts:40; src/app/actions/admin-articles.ts:61 |
| SAV-007 | CONFIRMED | Medium | P2 | CMS / runtime validation | Action simpan artikel memakai TypeScript sebagai kontrak runtime | src/app/actions/admin-articles.ts:15 |
| SAV-008 | CONFIRMED | Medium | P2 | CMS / routing | Mengubah slug saat edit membuat artikel baru dan menyisakan URL lama | src/components/admin/article-editor.tsx:256; src/lib/articles.ts:140 |
| SAV-009 | CONFIRMED | Medium | P2 | CMS / deletion | Menghapus override baseline menerbitkan kembali artikel baseline | src/lib/articles.ts:96; src/lib/articles.ts:221 |
| SAV-010 | CONFIRMED | Medium | P2 | Accessibility / dialogs | Lightbox dan modal ulasan tidak mengelola fokus modal | src/components/ui/image-lightbox.tsx:37; src/components/forms/review-form.tsx:40 |
| SAV-011 | CONFIRMED | Medium | P2 | Responsive / animation | Reveal gambar menyebabkan overflow horizontal pada 768px pointer fine | src/app/globals.css:570; src/components/sections/materials.tsx:50 |
| SAV-012 | CONFIRMED | Medium | P2 | Accessibility / contrast | Teks putih tombol sage dan count kategori tidak memenuhi kontras AA | src/components/ui/button.tsx:33; src/app/globals.css:88; src/components/portfolio/category-filter.tsx:63 |
| SAV-013 | CONFIRMED | Medium | P2 | Functional / review | Pengunjung tidak dapat mengirim ulasan pertama | src/components/sections/testimonials.tsx:38; src/components/sections/testimonials-motion.tsx:84 |
| SAV-014 | CONFIRMED | Medium | P2 | Business data / testimonials | Filtering testimoni dapat menampilkan quote placeholder dalam production | src/data/testimonials.ts:55 |
| SAV-015 | CONFIRMED | Medium | P2 | Privacy / public content | Kebijakan privasi tidak mencakup alur ulasan yang ada | src/app/privacy/page.tsx:55; src/app/actions/submit-review.ts:67; src/lib/email.ts:110 |
| SAV-016 | CONFIRMED | Medium | P2 | Cache / asset freshness | URL aset mutable diberi immutable selama satu tahun | next.config.mjs:79; src/lib/image-ladder.mjs:58 |
| SAV-017 | CONFIRMED | Medium | P2 | Input validation / survey | Tanggal kalender tidak valid diterima schema survey | src/lib/schemas/survey.ts:192 |
| SAV-018 | PROBABLE | Medium | P2 | Webhook / idempotency | Retry webhook dapat menggandakan event di penerima | src/lib/webhook.ts:56; src/app/actions/submit-survey.ts:68 |
| SAV-019 | CONFIRMED | Low | P3 | Forms / input ergonomics | Batas karakter schema tidak dicerminkan pada kontrol input | src/components/forms/review-form.tsx:207; src/components/forms/survey-form.tsx:368; src/components/admin/login-form.tsx:45 |
| SAV-020 | CONFIRMED | Low | P3 | Environment / notifications | Kontrak SMTP tidak dicantumkan dalam env template | .env.example; src/lib/email.ts:5 |
| SAV-021 | CONFIRMED | Info | INFO | Verification / technical debt | Tidak ada test suite atau CI quality gate dalam repository yang diinventaris | package.json:5; repository file inventory |
| SAV-022 | CONFIRMED | Info | INFO | Performance / measurement | Animasi global dan Three.js perlu budget terukur sebelum optimasi | src/components/motion/smooth-scroll.tsx:5; src/components/motion/use-wireframe-scene.ts:74; .next/static/chunks |

## 8. Critical Findings

Tidak ada P0 yang terbukti. Ini tidak menyatakan untested infrastructure bebas P0.

## 9. High Findings

### SAV-001 - Form publik tidak memiliki pembatasan kiriman

- **ID:** SAV-001
- **Status:** CONFIRMED
- **Severity:** High
- **Priority:** P1
- **Category:** Security / abuse
- **Location:** `src/app/actions/submit-review.ts:39; src/app/actions/submit-survey.ts:29; src/lib/reviews.ts:96`
- **Evidence:** Action langsung memvalidasi lalu menyimpan/mengirim. Tidak ada rate limiter, honeypot, idempotency key atau moderasi; review baru memakai isPublic: true.
- **Reproduction:** Trace dua action publik; bandingkan dengan limiter yang hanya diimpor admin-auth. Pengujian spam tidak dilakukan.
- **Current Behavior:** Setiap kiriman valid dapat menulis disk, memperbarui beranda dan memicu email/webhook.
- **Expected Behavior:** Kiriman publik dibatasi sebelum efek samping; review menunggu moderasi.
- **Root Cause:** Kontrol anti-abuse hanya dipasang pada login admin.
- **Impact:** Spam konten publik, pertumbuhan file JSON dan biaya email/webhook tanpa batas aplikasi.
- **Recommended Fix:** Tambahkan limiter persisten untuk kedua action dan alur review pending.
- **Suggested Implementation:** Buat helper submit limit dengan batas awal 5 kiriman/10 menit/IP yang dipercaya proxy dan batas global terpisah. Periksa sebelum save/email/webhook, tambahkan honeypot, deduplikasi event, ubah default isPublic menjadi false dan tambahkan aksi moderasi dengan auth. Jangan mengandalkan header IP mentah sebagai satu-satunya kontrol.
- **Files To Modify:** src/app/actions/submit-review.ts, src/app/actions/submit-survey.ts, src/lib/reviews.ts, src/lib/rate-limiter.ts, komponen admin moderasi
- **Verification:** Dalam fixture lokal: kiriman keenam ditolak sebelum efek samping; review pending tidak tampil; moderator saja dapat menerbitkan; proxy trust diuji.
- **Regression Risk:** Medium: jangan menolak pengguna bersama NAT tanpa pesan dan jalur kontak.
- **References:** Source action dan rate-limiter; OWASP Input Validation / abuse controls.

### SAV-002 - Read error diperlakukan sebagai data kosong lalu ditimpa

- **ID:** SAV-002
- **Status:** CONFIRMED
- **Severity:** High
- **Priority:** P1
- **Category:** Data integrity
- **Location:** `src/lib/reviews.ts:19; src/lib/articles.ts:14`
- **Evidence:** JSON.parse/readFile error ditangkap dan fungsi mengembalikan []; writer selanjutnya membangun ulang array dari hasil tersebut.
- **Reproduction:** Harness virtual filesystem memakai '{corrupt', lalu savePublicReview; output CORRUPT_REVIEW_OVERWRITTEN true. File riil tidak diubah.
- **Current Behavior:** Korupsi atau read error bisa menghilangkan semua rekaman lama pada save berikutnya.
- **Expected Behavior:** Read error selain file baru yang benar-benar belum ada menghentikan mutation.
- **Root Cause:** Tidak membedakan ENOENT, invalid JSON, invalid shape dan kegagalan akses.
- **Impact:** Kehilangan ulasan termasuk email pribadi atau artikel CMS; baseline bisa muncul kembali saat overlay tidak terbaca.
- **Recommended Fix:** Fail closed saat membaca data untuk mutation, log error dan lindungi salinan pemulihan.
- **Suggested Implementation:** Pisahkan readForDisplay dan readForMutation atau gunakan Result bertipe; validate array beserta setiap record. Hanya ENOENT pada provisioning yang boleh menghasilkan []. Jangan tulis data awal dari fungsi read. Simpan backup sebelum replace dan dokumentasikan restore; tampilkan error operator tanpa membocorkan path.
- **Files To Modify:** src/lib/reviews.ts, src/lib/articles.ts
- **Verification:** Fixture invalid JSON, EACCES, object non-array dan record malformed: semua save/delete/toggle gagal dan bytes lama tetap sama; ENOENT first-run tetap berfungsi.
- **Regression Risk:** Medium: UI harus menampilkan kegagalan penyimpanan dengan jelas.
- **References:** Source readers/writers; harness virtual filesystem.

## 10. Medium Findings

### SAV-003 - Konten pengulas diinterpolasi tanpa HTML encoding

- **ID:** SAV-003
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Injection / email
- **Location:** `src/lib/email.ts:41`
- **Evidence:** HTML email memakai ${review.author}, ${review.address}, ${review.email}, ${review.description} secara langsung; validasi Zod hanya string/email/length.
- **Reproduction:** Gunakan nama atau deskripsi fixture '<b>Audit fixture</b>' saat merender template terisolasi; markup menjadi elemen, bukan teks. Email eksternal tidak dikirim.
- **Current Behavior:** Pengulas dapat menyisipkan markup/link/image ke email tim.
- **Expected Behavior:** Semua input pengulas dirender sebagai teks literal dalam HTML email.
- **Root Cause:** Template string tidak memiliki auto-escaping React.
- **Impact:** Pemalsuan tampilan email, phishing atau tracking. Eksekusi script dalam email client belum terbukti dan tidak diklaim.
- **Recommended Fix:** Encode semua nilai dinamis pada konteks HTML.
- **Suggested Implementation:** Tambahkan helper escapeHtml yang mengencode &, <, >, double quote dan apostrophe; panggil pada semua string review dan konfigurasi recipient yang dirender. Pertahankan plainText; jangan menghapus karakter legal dari review hanya demi template.
- **Files To Modify:** src/lib/email.ts
- **Verification:** Uji payload tag, &, kutip dan newline; HTML memuat &lt;b&gt; dan plain text tetap terbaca; tidak ada outbound email dalam unit test.
- **Regression Risk:** Low: hindari double encoding.
- **References:** [Primary reference](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

### SAV-004 - Baseline header keamanan absen pada server production lokal

- **ID:** SAV-004
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** HTTP headers
- **Location:** `next.config.mjs:76`
- **Evidence:** GET / dan /admin/articles pada next start tidak memiliki CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy atau Permissions-Policy; config hanya menambah Cache-Control.
- **Reproduction:** Invoke-WebRequest http://localhost:3100/; periksa header yang sama pada login/admin.
- **Current Behavior:** Aplikasi lokal tidak melindungi framing admin atau menambahkan baseline browser hardening.
- **Expected Behavior:** Header dipasang pada aplikasi atau edge dengan bukti respons akhir.
- **Root Cause:** Tidak ada konfigurasi header global dalam repository.
- **Impact:** Clickjacking admin dan berkurangnya defense in depth. Header domain production/edge belum diverifikasi.
- **Recommended Fix:** Tambahkan nosniff, referrer dan framing policy; rollout CSP sesuai rendering Next.
- **Suggested Implementation:** Tambahkan aturan global nosniff dan Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy untuk fitur tidak digunakan, framing DENY atau frame-ancestors 'none'. Mulai script CSP report-only dan cocokkan inline RSC/JSON-LD, font self, image self, serta YouTube iframe; jangan langsung menambahkan unsafe-eval. Pilih hash/nonce sesuai kebutuhan static cache dan uji admin/public.
- **Files To Modify:** next.config.mjs dan konfigurasi edge jika tersedia
- **Verification:** GET public/login/admin dari aplikasi dan deployment final; iframe admin ditolak; navigasi/hydration/embed tetap bekerja tanpa CSP violation tak terduga.
- **Regression Risk:** Medium: CSP yang salah dapat mematikan hydration atau embed.
- **References:** Local production HTTP evidence; security skill Next.js/React guidance.

### SAV-005 - Batas upload 10 MB bertentangan dengan limit Server Action 1 MB

- **ID:** SAV-005
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** CMS / uploads
- **Location:** `src/components/admin/article-editor.tsx:93; src/app/actions/admin-articles.ts:143; next.config.mjs`
- **Evidence:** Client dan action menerima file hingga 10*1024*1024; tidak ada serverActions.bodySizeLimit. Guide Next 16.3.4 menyebut default raw body 1MB.
- **Reproduction:** Pada staging terautentikasi unggah JPEG 2MB; request multipart ditolak framework sebelum action. Runtime authenticated test BLOCKED karena sesi audit tidak digunakan.
- **Current Behavior:** UI menerima file yang transport Server Action tidak dapat terima.
- **Expected Behavior:** Batas UI, framework multipart dan pemeriksaan action konsisten.
- **Root Cause:** Batas file diterapkan setelah parsing body yang limitnya lebih kecil.
- **Impact:** Editor gagal mengunggah foto normal tanpa error ukuran yang tepat.
- **Recommended Fix:** Selaraskan limit; rekomendasi awal 10MB file dengan sedikit ruang multipart.
- **Suggested Implementation:** Konfigurasikan experimental.serverActions.bodySizeLimit menjadi '11mb' setelah menilai kapasitas host; tetap cek 10MB dalam action dan validasi File instance. Batasi decoded pixels Sharp secara eksplisit dan uji concurrency upload. Alternatif turunkan limit semua layer ke bawah 1MB bila kapasitas host tidak memadai.
- **Files To Modify:** next.config.mjs, src/app/actions/admin-articles.ts, kedua editor upload
- **Verification:** Fixture 0.9MB, 2MB, 9.9MB berhasil; >10MB gagal dengan pesan terkontrol; wrong MIME dan image rusak ditolak.
- **Regression Risk:** Medium: limit lebih tinggi menambah penggunaan memori parsing.
- **References:** node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md

### SAV-006 - Mutation artikel tidak menginvalidasi sitemap

- **ID:** SAV-006
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** SEO / cache
- **Location:** `src/app/sitemap.ts:40; src/app/actions/admin-articles.ts:61`
- **Evidence:** Build menandai /sitemap.xml static. Save/toggle/delete hanya revalidate /knowledge, detail, / dan /admin/articles; harness INVALIDATIONS tidak berisi /sitemap.xml.
- **Reproduction:** Buat/padamkan artikel di staging, lalu GET /sitemap.xml tanpa rebuild; bandingkan dengan /knowledge. Mutation HTTP belum dilakukan.
- **Current Behavior:** Sitemap bisa tertinggal setelah CMS menerbitkan atau menonaktifkan artikel.
- **Expected Behavior:** Sitemap mengikuti daftar artikel aktif sesudah mutation.
- **Root Cause:** Invalidasi hanya menarget halaman, bukan metadata route yang membaca file sendiri.
- **Impact:** Artikel baru lambat ditemukan; URL tidak aktif tertinggal dalam sitemap.
- **Recommended Fix:** Invalidasi /sitemap.xml pada semua mutation artikel.
- **Suggested Implementation:** Tambahkan revalidatePath('/sitemap.xml') setelah save/toggle/delete sukses; pastikan sitemap Date valid lewat schema. Jangan gunakan new Date() global untuk memalsukan lastmod. Uji perilaku Next 16.3.4 production.
- **Files To Modify:** src/app/actions/admin-articles.ts, src/app/sitemap.ts
- **Verification:** Publish/toggle/delete staging: sitemap berubah pada GET berikutnya, hanya URL aktif tercantum; lastmod tidak berubah tanpa perubahan konten.
- **Regression Risk:** Low: jangan invalidate sebelum write sukses.
- **References:** Local build route table; node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md

### SAV-007 - Action simpan artikel memakai TypeScript sebagai kontrak runtime

- **ID:** SAV-007
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** CMS / runtime validation
- **Location:** `src/app/actions/admin-articles.ts:15`
- **Evidence:** Hanya field wajib trim/body.length dicek; tidak ada schema untuk nested blocks, tanggal, status, URL atau panjang. Harness INVALID_DATE_SAVED menunjukkan success untuk publishedAt 'garbage'.
- **Reproduction:** Panggil action dalam harness auth stub dengan publishedAt 'garbage' atau block malformed. Jangan mengubah data production.
- **Current Behavior:** Data invalid tersimpan; .trim pada tipe salah dapat throw; tanggal invalid bisa merusak formatArticleDateShort/sitemap.
- **Expected Behavior:** Seluruh payload tervalidasi runtime sebelum mutation.
- **Root Cause:** KnowledgeArticle hanya tipe compile-time; action boundary mempercayai struktur client.
- **Impact:** Artikel rusak, error render/sitemap dan ukuran storage tidak terkontrol oleh field caps.
- **Recommended Fix:** Buat Zod schema artikel dengan discriminated union blocks.
- **Suggested Implementation:** Validate title<=200, slug<=120, summary<=500, seoTitle<=200, category<=80, alt/caption<=500, dates calendar-valid, readingMinutes int 1..120, status enum, body<=200 blocks dan text per block<=20000. Allowlist URL image/embed dan local prefixes; reject data URI. Return field errors sebelum fs write. Terapkan schema juga saat membaca JSON.
- **Files To Modify:** src/app/actions/admin-articles.ts, src/lib/articles.ts, src/types/index.ts, schema artikel baru
- **Verification:** Reject wrong types, invalid dates/status, data URI, oversized blocks, empty normalized slug; artikel yang ada lulus migration check.
- **Regression Risk:** Medium: batas perlu dicek terhadap 22 artikel saat ini.
- **References:** Source action; harness invalid-date fixture.

### SAV-008 - Mengubah slug saat edit membuat artikel baru dan menyisakan URL lama

- **ID:** SAV-008
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** CMS / routing
- **Location:** `src/components/admin/article-editor.tsx:256; src/lib/articles.ts:140`
- **Evidence:** Payload hanya mengirim slug baru; saveArticle mencari record berdasarkan slug itu, tanpa originalSlug. Harness SLUG_RENAME_BOTH_EXIST true.
- **Reproduction:** Simpan fixture old-slug, lalu edit dengan new-slug; kedua getArticleBySlug tetap ditemukan.
- **Current Behavior:** Rename menjadi create; URL lama dan record lama tidak dihapus/diarahkan.
- **Expected Behavior:** Slug edit dimodelkan eksplisit atau dibuat read-only.
- **Root Cause:** Identitas record artikel sama dengan slug yang boleh diubah UI.
- **Impact:** Duplikasi konten, artikel lama aktif dan sitemap ganda.
- **Recommended Fix:** Untuk perubahan minimal, kunci slug pada mode edit; jika rename dibutuhkan, dukung transaksi rename.
- **Suggested Implementation:** Jadikan input slug read-only ketika isEditing dan validasi originalSlug server-side. Bila bisnis membutuhkan rename, gunakan ID stabil, originalSlug tervalidasi, cek collision, ubah record dalam satu lock dan simpan redirect lama; invalidate kedua detail dan sitemap.
- **Files To Modify:** src/components/admin/article-editor.tsx, src/app/actions/admin-articles.ts, src/lib/articles.ts
- **Verification:** Edit konten tidak menciptakan record tambahan; rename tidak overwrite slug lain dan URL lama redirect sesuai kebijakan.
- **Regression Risk:** Medium: redirect perlu dipertahankan untuk tautan yang sudah tersebar.
- **References:** Harness source isolated; source editor/save.

### SAV-009 - Menghapus override baseline menerbitkan kembali artikel baseline

- **ID:** SAV-009
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** CMS / deletion
- **Location:** `src/lib/articles.ts:96; src/lib/articles.ts:221`
- **Evidence:** Public lookup fallback ke baselineArticles; delete menghapus custom record tanpa tombstone. Harness BASELINE_INACTIVE true lalu BASELINE_RESURRECTED true.
- **Reproduction:** Toggle baseline fixture menjadi tidak_aktif; delete custom override yang tercipta; getArticleBySlug mengembalikan baseline aktif.
- **Current Behavior:** Delete terlihat berhasil namun artikel muncul kembali.
- **Expected Behavior:** Delete/inactive tidak membatalkan kebijakan visibility baseline secara diam-diam.
- **Root Cause:** Larangan delete baseline hanya berlaku saat belum ada custom record.
- **Impact:** Konten yang sengaja ditarik kembali terbit; operator kehilangan kontrol publikasi.
- **Recommended Fix:** Tolak permanent delete untuk slug yang juga ada dalam baseline atau simpan tombstone.
- **Suggested Implementation:** Cek baseline sebelum cabang isCustom; arahkan operator ke tidak_aktif dan pertahankan overlay. Jika tombstone dipilih, public merger/lookup harus menghormatinya; invalidate sitemap/detail.
- **Files To Modify:** src/lib/articles.ts, src/components/admin/articles-list.tsx, src/app/actions/admin-articles.ts
- **Verification:** Baseline murni, baseline override aktif/inaktif dan custom-only: delete tidak pernah menghidupkan baseline; custom-only tetap dapat dihapus.
- **Regression Risk:** Low/Medium: label UI harus mengikuti kebijakan.
- **References:** Harness virtual baseline fixture.

### SAV-010 - Lightbox dan modal ulasan tidak mengelola fokus modal

- **ID:** SAV-010
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Accessibility / dialogs
- **Location:** `src/components/ui/image-lightbox.tsx:37; src/components/forms/review-form.tsx:40`
- **Evidence:** Efek hanya scroll lock/Escape; tidak ada initial focus, trap, inert background atau restore focus. Browser lightbox: LIGHTBOX_FOCUS dialog False; setelah Tab dialog False.
- **Reproduction:** Focus kartu gallery, buka, tekan Tab; fokus tetap pada tombol halaman di belakang dialog. Modal review diverifikasi dari source karena trigger tidak tampil dalam dataset kosong.
- **Current Behavior:** aria-modal true mengklaim modal, tetapi keyboard masih beroperasi di background.
- **Expected Behavior:** Focus masuk modal, Tab berputar di dalamnya, Escape menutup, fokus kembali ke pemicu.
- **Root Cause:** Dialog dibuat manual meski Radix Dialog tersedia.
- **Impact:** Pengguna keyboard/screen reader sulit menjangkau konten dan tombol tutup.
- **Recommended Fix:** Gunakan Radix Dialog sebagaimana mobile-menu.
- **Suggested Implementation:** Pindahkan kedua modal ke Dialog.Root/Portal/Overlay/Content/Title; controlled open dan currentIndex tetap di parent. Tentukan close button initial focus dan restore trigger; cegah ArrowLeft/Right global saat input review fokus; pastikan overlay data-lenis-prevent.
- **Files To Modify:** src/components/ui/image-lightbox.tsx, src/components/forms/review-form.tsx
- **Verification:** Keyboard-only: initial focus, Tab/Shift+Tab loop, Escape, restore; screen reader announcement; form pending tetap jelas.
- **Regression Risk:** Medium: pertahankan navigation index dan body-scroll cleanup.
- **References:** [Primary reference](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### SAV-011 - Reveal gambar menyebabkan overflow horizontal pada 768px pointer fine

- **ID:** SAV-011
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Responsive / animation
- **Location:** `src/app/globals.css:570; src/components/sections/materials.tsx:50`
- **Evidence:** document scrollWidth 777 pada innerWidth 768 untuk / dan /about. .reveal-image bounding box left -9/right 777; wrapper menscale 1.08 tanpa ancestor clip. Touch/reduced-motion: 768/768.
- **Reproduction:** Chromium 768x900, pointer fine, no-preference; buka /about sebelum scroll ke Materials.
- **Current Behavior:** Animasi offscreen memperlebar dokumen 9px dan dapat memunculkan scroll horizontal.
- **Expected Behavior:** Animasi tidak mengubah scrollable document width.
- **Root Cause:** Overscale diterapkan pada grid wrapper yang tidak memiliki clip ancestor.
- **Impact:** Layout tablet/laptop sempit bergeser horizontal. Tidak direproduksi pada tablet touch atau reduced motion.
- **Recommended Fix:** Clip overscale pada pembungkus foto yang stabil.
- **Suggested Implementation:** Tambahkan wrapper overflow-clip di sekitar Reveal image di Materials, atau pindahkan animasi scale ke image di dalam frame overflow-hidden. Pertahankan text/layout di luar clip. Jangan menutup overflow-x seluruh body untuk menyembunyikan penyebab.
- **Files To Modify:** src/components/sections/materials.tsx, src/app/globals.css
- **Verification:** 768px fine/coarse/reduced sebelum, selama dan setelah reveal: scrollWidth<=innerWidth; foto/focus outline tidak terpotong; 320..1920 tidak regresi.
- **Regression Risk:** Low: clip lokal dapat memotong shadow; periksa screenshot.
- **References:** Production Playwright bounds; reveal keyframes.

### SAV-012 - Teks putih tombol sage dan count kategori tidak memenuhi kontras AA

- **ID:** SAV-012
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Accessibility / contrast
- **Location:** `src/components/ui/button.tsx:33; src/app/globals.css:88; src/components/portfolio/category-filter.tsx:63`
- **Evidence:** Contrast checker white/#9ab279 = 2.33:1, white/#86a066 = 2.90:1; gradient primary memakai kedua warna itu. Axe /portfolio: #767676 di #e0e0e0 = 3.44:1 pada 12px.
- **Reproduction:** Jalankan contrast checker untuk dua gradient stop; axe pada portfolio setelah networkidle.
- **Current Behavior:** Button primary berteks putih pada sage terang; count kategori abu-abu terlalu muda.
- **Expected Behavior:** Teks ukuran normal >=4.5:1 pada seluruh gradient dan hover.
- **Root Cause:** Komentar button menyatakan sage cukup untuk putih, tetapi rasio hasil hitung bertentangan; token count dipakai di background abu-abu.
- **Impact:** CTA dan informasi kategori sulit dibaca pengguna low vision.
- **Recommended Fix:** Pakai teks gelap pada sage atau gelapkan semua gradient stops; gelapkan count kategori.
- **Suggested Implementation:** Ubah primary ke token on-primary-container yang teruji di kedua stops, termasuk hover, atau pilih stops yang >=4.5 dengan white. Category count nonaktif gunakan on-surface-variant gelap. Axe juga menandai warna alpha selama GSAP entrance pada beberapa route; retest setelah scroll dan settle sebelum menyatakan semua token gagal.
- **Files To Modify:** src/components/ui/button.tsx, src/app/globals.css, src/components/portfolio/category-filter.tsx
- **Verification:** Hitung seluruh pair normal/hover/focus; screenshot dan axe normal/reduced-motion; CTA >=4.5 dan category count >=4.5.
- **Regression Risk:** Low: pertahankan hierarchy visual tanpa mengorbankan rasio.
- **References:** Contrast checker output; axe-core 4.13.0 runtime.

### SAV-013 - Pengunjung tidak dapat mengirim ulasan pertama

- **ID:** SAV-013
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Functional / review
- **Location:** `src/components/sections/testimonials.tsx:38; src/components/sections/testimonials-motion.tsx:84`
- **Evidence:** public-reviews.json kosong; baseline placeholder disembunyikan production. Testimonials return null saat items kosong; ReviewForm hanya berada dalam TestimonialsMotion yang juga return null tanpa featured. HOME_BUTTONS tidak memuat trigger ulasan.
- **Reproduction:** next start dengan review kosong dan flag testimoni tidak diaktifkan; buka beranda.
- **Current Behavior:** Tidak ada tombol untuk memasukkan ulasan pertama.
- **Expected Behavior:** Form ulasan tetap tersedia meski daftar ulasan kosong.
- **Root Cause:** Trigger input bergantung pada adanya konten yang justru dibuat oleh input itu.
- **Impact:** Fitur review tidak dapat dimulai dari UI production.
- **Recommended Fix:** Pisahkan trigger ReviewForm dari kondisi daftar testimonial.
- **Suggested Implementation:** Render form/trigger di Testimonials empty state atau section lain yang tetap tersedia; hanya sembunyikan carousel kosong. Jangan menampilkan placeholder untuk membuka akses form.
- **Files To Modify:** src/components/sections/testimonials.tsx, src/components/sections/testimonials-motion.tsx
- **Verification:** 0/1/many review, baseline placeholder/verified: trigger tetap tersedia, empty carousel tidak dirender, layout dan dialog focus benar.
- **Regression Risk:** Low: jangan merender dua trigger ketika daftar terisi.
- **References:** Source empty branch; runtime home button inventory.

### SAV-014 - Filtering testimoni dapat menampilkan quote placeholder dalam production

- **ID:** SAV-014
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Business data / testimonials
- **Location:** `src/data/testimonials.ts:55`
- **Evidence:** testimonialsArePlaceholder memakai every(); bila satu testimonial nyata ditambahkan, visibleTestimonials mengembalikan semua termasuk placeholder. Flag showTestimonials juga mengembalikan seluruh array.
- **Reproduction:** Fixture dua quote, satu isPlaceholder false dan satu true: every false lalu seluruh array dikembalikan.
- **Current Behavior:** Filter bekerja pada tingkat array, bukan per-record.
- **Expected Behavior:** Production hanya mengeluarkan quote yang telah diverifikasi.
- **Root Cause:** Visibility flag/every digunakan sebagai pengganti filter individual.
- **Impact:** Quote sample dapat diterbitkan sebagai testimoni bisnis saat dataset bertambah.
- **Recommended Fix:** Filter isPlaceholder per testimonial di production.
- **Suggested Implementation:** Production: testimonials.filter(t=>!t.isPlaceholder), lalu terapkan flag hanya pada verified set bila dibutuhkan. Development boleh melihat samples dengan penandaan. Jangan membuat quote/nama/rating pengganti.
- **Files To Modify:** src/data/testimonials.ts, src/components/sections/testimonials.tsx
- **Verification:** All-placeholder, mixed dan all-verified: production tidak pernah mengandung placeholder; toggle flag tidak mengubah jaminan tersebut.
- **Regression Risk:** Low: section bisa kosong, selesaikan F13 bersamaan.
- **References:** Source visibleTestimonials; aturan data SAVOY dalam brief.

### SAV-015 - Kebijakan privasi tidak mencakup alur ulasan yang ada

- **ID:** SAV-015
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Privacy / public content
- **Location:** `src/app/privacy/page.tsx:55; src/app/actions/submit-review.ts:67; src/lib/email.ts:110`
- **Evidence:** Privacy mengatakan 'Satu-satunya data pribadi ... formulir survey', padahal review meminta nama, alamat/kota, email dan deskripsi, menyimpan email di disk, serta mengirim SMTP/webhook; fallback juga log email.
- **Reproduction:** Bandingkan privacy sections dengan reviewSchema/savePublicReview/email; tidak mengirim data nyata.
- **Current Behavior:** Halaman privacy menggambarkan alur survey saja.
- **Expected Behavior:** Pemberitahuan sesuai pengumpulan, publikasi, tujuan, penerima, retensi dan penghapusan review.
- **Root Cause:** Alur review ditambahkan tanpa pembaruan privacy contract.
- **Impact:** Pengunjung tidak memahami nama/lokasi/deskripsi akan dipublikasikan; email tersimpan/terkirim/logged.
- **Recommended Fix:** Perbarui disclosure dan consent publikasi review secara konkret.
- **Suggested Implementation:** Tambahkan bagian review yang menyebut field publik vs privat, storage file di host, notification email/webhook bila aktif, retensi dan cara meminta hapus. Tambahkan acknowledgement/link privacy dekat submit; jangan menyebut 'verified review' tanpa verifikasi. Kurangi logging email pada SMTP fallback.
- **Files To Modify:** src/app/privacy/page.tsx, src/components/forms/review-form.tsx, src/lib/email.ts
- **Verification:** Audit setiap field dari input sampai disk, email, webhook, UI/RSC dan log; email tidak terpapar public; notice konsisten ketika webhook off/on.
- **Regression Risk:** Medium: wording/policy retensi harus disetujui pemilik bisnis, bukan dikarang.
- **References:** Source privacy/actions/storage; review field trace.

### SAV-016 - URL aset mutable diberi immutable selama satu tahun

- **ID:** SAV-016
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Cache / asset freshness
- **Location:** `next.config.mjs:79; src/lib/image-ladder.mjs:58`
- **Evidence:** /brand dan /v diberi max-age=31536000, immutable. Variant URL berbasis nama+width, tanpa content hash. Working tree sudah memiliki perubahan savoy-mark.png dan process photos di path yang sama.
- **Reproduction:** Load aset/cache di browser, deploy bytes baru pada path sama lalu reload normal; browser boleh memakai cache lama setahun.
- **Current Behavior:** Konten baru dapat tetap ditampilkan sebagai aset lama setelah deployment.
- **Expected Behavior:** Immutable hanya untuk URL yang berubah ketika bytes berubah.
- **Root Cause:** Cache policy berbasis direktori sementara file names tidak content-addressed.
- **Impact:** Logo atau fotografi lama bertahan; branding/gambar beda antar pengunjung.
- **Recommended Fix:** Version/hash URL variant dan brand atau gunakan revalidation untuk path mutable.
- **Suggested Implementation:** Perubahan minimal: turunkan cache mutable brand/v menjadi public,max-age=0,must-revalidate atau TTL singkat terukur. Untuk immutable jangka panjang, manifest pipeline harus menerbitkan filename hash dan loader membaca mapping; deploy output baru sebelum HTML baru. Jangan menambah query acak per-render.
- **Files To Modify:** next.config.mjs, scripts/build-image-variants.mjs, src/lib/image-ladder.mjs, src/components/layout/brand-mark.tsx bila URL berubah
- **Verification:** Browser cache populated deployment A, ganti bytes deployment B: URL/hash berubah atau conditional request melihat bytes baru; tidak ada 404 variants.
- **Regression Risk:** Medium: hashing memengaruhi seluruh gambar; mulai dengan policy change terukur.
- **References:** Source cache header and variant URL; git dirty asset baseline.

### SAV-017 - Tanggal kalender tidak valid diterima schema survey

- **ID:** SAV-017
- **Status:** CONFIRMED
- **Severity:** Medium
- **Priority:** P2
- **Category:** Input validation / survey
- **Location:** `src/lib/schemas/survey.ts:192`
- **Evidence:** Validasi tanggal hanya regex YYYY-MM-DD dan perbandingan string >=jakartaToday. Harness IMPOSSIBLE_DATE_ACCEPTED true untuk 2099-99-99.
- **Reproduction:** safeParse lead fixture valid dengan surveyDate 2099-99-99; bypass browser date input.
- **Current Behavior:** Server menerima bulan/hari yang mustahil dan formatter melakukan rollover tanggal.
- **Expected Behavior:** Tanggal kalender valid dan batas booking yang jelas.
- **Root Cause:** Regex memeriksa bentuk, bukan validitas kalender.
- **Impact:** Jadwal lead salah dan webhook/WA menyampaikan tanggal berbeda dari input.
- **Recommended Fix:** Validate calendar round-trip dan horizon booking yang disetujui.
- **Suggested Implementation:** Parse year/month/day, buat Date.UTC, compare komponen kembali; reject overflow/leap-day invalid. Tetap gunakan Jakarta untuk today. Opsional max 365 hari setelah disetujui bisnis, bukan asumsi aturan operasional.
- **Files To Modify:** src/lib/schemas/survey.ts
- **Verification:** Reject 2099-99-99, 2027-02-29, 2026-09-31; accept leap-year 2028-02-29 jika dalam horizon; past/today timezone boundaries.
- **Regression Risk:** Low: data lama yang tidak valid perlu ditinjau tanpa mengubah otomatis.
- **References:** Harness survey fixture; formatSurveyDate Date.UTC implementation.

### SAV-018 - Retry webhook dapat menggandakan event di penerima

- **ID:** SAV-018
- **Status:** PROBABLE
- **Severity:** Medium
- **Priority:** P2
- **Category:** Webhook / idempotency
- **Location:** `src/lib/webhook.ts:56; src/app/actions/submit-survey.ts:68`
- **Evidence:** Sampai tiga POST dengan body sama; tidak ada event ID/idempotency header untuk survey. HMAC membuktikan integritas, bukan deduplikasi. Review punya id, tetapi kontrak dedup receiver tidak ada.
- **Reproduction:** Local HTTPS receiver menerima request pertama tetapi menunda response melewati 8 detik; client retry. Receiver fixture belum dijalankan; konfigurasi receiver eksternal BLOCKED.
- **Current Behavior:** Timeout setelah side effect receiver dapat diikuti POST kedua/ketiga.
- **Expected Behavior:** Satu kiriman logis menghasilkan satu lead/notification.
- **Root Cause:** Retry at-least-once tanpa kontrak idempotency.
- **Impact:** Kemungkinan duplicate lead/email; tergantung dedup penerima sehingga PROBABLE.
- **Recommended Fix:** Gunakan ID event stabil dan kontrak receiver dedup.
- **Suggested Implementation:** Buat submissionId sekali sebelum retry dan sertakan eventId/Idempotency-Key. Pertahankan ID saat browser retry kiriman yang sama; receiver simpan key dengan TTL. Retry hanya network/408/429/5xx, hormati Retry-After dan jangan retry permanent 4xx.
- **Files To Modify:** src/lib/webhook.ts, src/app/actions/submit-survey.ts, src/components/forms/survey-form.tsx, kontrak receiver
- **Verification:** Receiver terisolasi commit-then-timeout dan 500: satu efek samping setelah retries; 400 tidak retry; semua attempt memakai ID/signature konsisten.
- **Regression Risk:** Medium: receiver harus mengimplementasikan dedup untuk jaminan penuh.
- **References:** Source webhook loop; receiver behavior belum tersedia.

## 11. Low Findings

### SAV-019 - Batas karakter schema tidak dicerminkan pada kontrol input

- **ID:** SAV-019
- **Status:** CONFIRMED
- **Severity:** Low
- **Priority:** P3
- **Category:** Forms / input ergonomics
- **Location:** `src/components/forms/review-form.tsx:207; src/components/forms/survey-form.tsx:368; src/components/admin/login-form.tsx:45`
- **Evidence:** rg maxLength pada src tidak menemukan atribut. Review memiliki server limits 80/100/1000, survey shared schema 120/80/80/250/1000/80; login tidak memiliki caps explicit.
- **Reproduction:** Paste 81 karakter ke review name atau >1000 ke deskripsi; kontrol menerima sampai server mengembalikan error.
- **Current Behavior:** Pengguna dapat mengisi lebih panjang dari batas tanpa pencegahan/count; email/login raw caps tidak ada.
- **Expected Behavior:** Client memberi batas yang sama dan server tetap authoritative.
- **Root Cause:** Field caps hanya dipasang pada schema tertentu.
- **Impact:** Friction form; batas raw phone/email/admin perlu dibatasi sebelum parsing/crypto.
- **Recommended Fix:** Tambah maxLength dan counter hanya bila bermanfaat; raw server caps explicit.
- **Suggested Implementation:** Terapkan angka matrix pada review/survey; email max254 client/server, raw formatted phone max40 sebelum normalisasi, login username max80/password max1024 bytes tanpa trim password. Search query max200 hanya untuk ergonomi; tidak membutuhkan server validator.
- **Files To Modify:** src/components/forms/review-form.tsx, src/components/forms/survey-form.tsx, src/lib/schemas/survey.ts, src/app/actions/submit-review.ts, src/app/actions/admin-auth.ts, src/components/admin/login-form.tsx
- **Verification:** At-limit dan over-limit paste/HTTP fixtures, multibyte password dan formatted international phone; field errors terasosiasi dengan aria-describedby.
- **Regression Risk:** Low/Medium: jangan memotong password otomatis atau mengubah karakter legal.
- **References:** Source field definitions and schema caps.

### SAV-020 - Kontrak SMTP tidak dicantumkan dalam env template

- **ID:** SAV-020
- **Status:** CONFIRMED
- **Severity:** Low
- **Priority:** P3
- **Category:** Environment / notifications
- **Location:** `.env.example; src/lib/email.ts:5`
- **Evidence:** Email menggunakan SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM dan REVIEW_NOTIFICATION_EMAIL; keenamnya absen dalam .env.example.
- **Reproduction:** Provision environment hanya dari .env.example; review email memakai fallback karena SMTP tidak dikonfigurasi.
- **Current Behavior:** Onboarding operator tidak menyebut konfigurasi notification yang dipakai kode.
- **Expected Behavior:** Semua runtime env terdokumentasi dengan required/optional, format dan failure behavior.
- **Root Cause:** Environment contract tidak diperbarui bersama fitur review.
- **Impact:** Notifikasi review tidak terkirim dan email pengulas masuk fallback log; tidak berarti credential actual salah.
- **Recommended Fix:** Tambahkan variabel SMTP optional dan startup readiness check.
- **Suggested Implementation:** Dokumentasikan keenam vars tanpa secret values; jelaskan 465 TLS vs STARTTLS, target email harus diverifikasi pemilik bisnis. Tampilkan status notification dalam admin/log operator tanpa PII; bedakan result SMTP failure vs not configured.
- **Files To Modify:** .env.example, src/lib/email.ts, README.md
- **Verification:** Template inventory sama dengan process.env runtime references; test missing/valid/failed SMTP memakai mock transport.
- **Regression Risk:** Low: jangan commit SMTP credential.
- **References:** Env names inventory; source email.

## 12. SEO Audit

Snapshot public SEO valid pada 114 sitemap URLs, bukan janji ranking/search eligibility. Tidak ditemukan title/description/canonical kosong atau H1 count selain 1 pada snapshot.

SEO route matrix berikut memakai HTML HTTP produksi lokal, termasuk title/description lengkap. Indexable hanya berdasarkan meta; ranking/crawl/Search Console BLOCKED. Structured Data menunjukkan jumlah script, bukan validasi rich-result eligibility.

| URL | Status | Title | Description | H1 | Canonical | Indexable | Sitemap | Structured Data |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | SAVOY — Interior & Furniture Custom | Interior & furniture custom dirancang dari ukuran ruang dan kebutuhan Anda. Satu tim menangani konsultasi, survey, desain, produksi, sampai pemasangan. | Setiap sudut ruang, dirancang untuk cara Anda hidup. | https://savoyinterior.com | Yes (meta) | Yes | 2 script(s) |
| /portfolio | 200 | Portofolio Proyek — SAVOY | Dokumentasi 62 proyek furniture custom SAVOY: kitchen set, lemari pakaian, sampai interior rumah penuh di apartemen, perumahan, dan rumah subsidi. | Setiap proyek punya ukuran, kebutuhan, dan cerita yang berbeda. | https://savoyinterior.com/portfolio | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom | 200 | Furniture Custom Bandung & Jabodetabek - Workshop Presisi — SAVOY | Kitchen set, lemari custom, lemari bawah tangga, backdrop TV & furniture kamar tidur. Material Plywood & HMR anti lembab, finishing HPL rapi, edging presisi. | Furniture Custom Berkualitas: Desain Eksklusif, Presisi Milimeter & Bebas Rayap | https://savoyinterior.com/furniture-custom | Yes (meta) | Yes | 2 script(s) |
| /services | 200 | Layanan Furniture Custom — SAVOY | Kitchen set, lemari pakaian, lemari bawah tangga, backdrop TV, kamar tidur, hingga interior komersial — dirancang, diproduksi, dan dipasang satu tim. | Satu ruang atau satu rumah, dirancang sesuai kebutuhan Anda. | https://savoyinterior.com/services | Yes (meta) | Yes | 2 script(s) |
| /knowledge | 200 | Panduan Furniture Custom — SAVOY | Panduan praktis sebelum membuat custom furniture: pemilihan material, ergonomi dapur, perencanaan penyimpanan, dan persiapan sebelum renovasi. | Kenali apa yang akan menjadi bagian dari rumah Anda bertahun-tahun. | https://savoyinterior.com/knowledge | Yes (meta) | Yes | 2 script(s) |
| /about | 200 | Profil Studio & Workshop — SAVOY | Studio interior dan furniture custom dengan workshop sendiri. Merancang, memproduksi, dan memasang dengan satu tim, untuk klien di berbagai kota di Indonesia. | Studio yang merancang, memproduksi, dan memasang sendiri. | https://savoyinterior.com/about | Yes (meta) | Yes | 2 script(s) |
| /survey | 200 | Ajukan Survey & Estimasi — SAVOY | Isi empat langkah singkat tentang ruangan Anda. Kami balas dengan rekomendasi desain dan estimasi biaya, tanpa biaya konsultasi awal. | Ceritakan ruangan Anda, kami hitung estimasinya. | https://savoyinterior.com/survey | Yes (meta) | Yes | 2 script(s) |
| /contact | 200 | Kontak & Konsultasi — SAVOY | Hubungi SAVOY untuk konsultasi interior dan custom furniture. Konsultasi awal dan estimasi tidak dikenakan biaya. | Mulai dari percakapan, bukan dari katalog. | https://savoyinterior.com/contact | Yes (meta) | Yes | 2 script(s) |
| /privacy | 200 | Kebijakan Privasi — SAVOY | Data apa yang dikumpulkan formulir survey SAVOY, untuk apa digunakan, ke mana dikirim, dan bagaimana cara meminta penghapusannya. | Data yang Anda kirim, dan apa yang kami lakukan dengannya. | https://savoyinterior.com/privacy | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom/kitchen-set | 200 | Kitchen Set Custom Minimalis & Modern — SAVOY | Koleksi referensi desain kitchen set custom minimalis modern & semi klasik. Material HMR tahan lembab, tabletop solid surface, dan hardware slow-motion. | Kitchen Set Custom Presisi: Ergonomis, Higienis & Tahan Lembab | https://savoyinterior.com/furniture-custom/kitchen-set | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom/lemari-custom | 200 | Lemari Custom & Walk-in Closet Minimalis — SAVOY | Koleksi referensi lemari pakaian custom built-in, walk-in closet, dan lemari sliding full plafon. Pembagian kompartemen pas, bahan plywood kuat. | Lemari Pakaian & Wardrobe Custom: Maksimalkan Kapasitas & Estetika | https://savoyinterior.com/furniture-custom/lemari-custom | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom/lemari-bawah-tangga | 200 | Lemari Bawah Tangga Custom Minimalis — SAVOY | Koleksi referensi lemari bawah tangga custom. Pemanfaatan ruang mati di bawah tangga untuk rak sepatu tarik, gudang tertutup, dan rak display. | Lemari Bawah Tangga Custom: Ubah Ruang Mati Jadi Storage Multifungsi | https://savoyinterior.com/furniture-custom/lemari-bawah-tangga | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom/backdrop-tv | 200 | Backdrop TV Custom Minimalis & Modern — SAVOY | Koleksi referensi backdrop TV custom minimalis modern, panel kisi-kisi fluted wood, aksen marmer, dan floating credenza kabel tersembunyi. | Backdrop TV & Wall Paneling Custom: Focal Point Mewah Tanpa Kabel Menjuntai | https://savoyinterior.com/furniture-custom/backdrop-tv | Yes (meta) | Yes | 2 script(s) |
| /furniture-custom/furniture-kamar | 200 | Furniture Kamar Tidur Custom Minimalis — SAVOY | Koleksi referensi furniture kamar tidur custom. Ranjang platform dipan laci, headboard empuk berlampu, meja kerja sudut, dan meja rias built-in. | Furniture Kamar Tidur Custom: Ranjang Platform, Headboard & Meja Rias | https://savoyinterior.com/furniture-custom/furniture-kamar | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-bandung | 200 | Jasa Pembuatan Furniture Custom Bandung — SAVOY | Jasa kitchen set dan furniture custom di Bandung. Dikerjakan langsung di workshop sendiri dengan survey aktual, desain terukur, dan instalasi rapi. | Furniture custom presisi untuk hunian & ruang komersial di Bandung. | https://savoyinterior.com/services/furniture-custom-bandung | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-cimahi | 200 | Jasa Pembuatan Furniture Custom Cimahi — SAVOY | Pembuatan furniture custom dan interior di Cimahi: kitchen set, backdrop TV, lemari pakaian, dan partisi ruangan dengan pengerjaan rapi. | Layanan interior & furniture custom terdekat untuk area Cimahi. | https://savoyinterior.com/services/furniture-custom-cimahi | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-bandung-barat | 200 | Jasa Pembuatan Furniture Custom Bandung Barat — SAVOY | Jasa custom furniture dan kitchen set di Bandung Barat: Kotabaru Parahyangan, Padalarang, Lembang, dan sekitarnya. | Solusi furniture custom untuk kawasan Bandung Barat & sekitarnya. | https://savoyinterior.com/services/furniture-custom-bandung-barat | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-jakarta | 200 | Jasa Pembuatan Furniture Custom Jakarta — SAVOY | Jasa furniture custom Jakarta: kitchen set apartemen/rumah, walk-in closet, meja kerja, dan backdrop TV dengan desain modern minimalis. | Furniture custom berkualitas untuk rumah & apartemen di Jakarta. | https://savoyinterior.com/services/furniture-custom-jakarta | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-tangerang | 200 | Jasa Pembuatan Furniture Custom Tangerang & BSD — SAVOY | Spesialis custom furniture Tangerang dan BSD: kitchen set elegan, lemari pakaian custom, kabinet bawah tangga, dan interior kamar tidur. | Pembuatan furniture custom di Tangerang, BSD, & Gading Serpong. | https://savoyinterior.com/services/furniture-custom-tangerang | Yes (meta) | Yes | 2 script(s) |
| /services/furniture-custom-bekasi | 200 | Jasa Pembuatan Furniture Custom Bekasi — SAVOY | Jasa kitchen set dan furniture custom Bekasi: kualitas pengerjaan rapi, finishing HPL/duco premium, dan garansi instalasi. | Desain dan produksi furniture custom untuk kawasan Bekasi. | https://savoyinterior.com/services/furniture-custom-bekasi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/kitchen-set | 200 | Kitchen Set Custom — SAVOY | Dapur basah dan kering dengan ergonomi segitiga kerja, material tahan lembab, dan hardware tahan beban. 5 proyek nyata dari arsip SAVOY. | Kitchen set yang mengikuti alur memasak Anda. | https://savoyinterior.com/portfolio/kategori/kitchen-set | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/wardrobe | 200 | Lemari Pakaian & Wardrobe Custom — SAVOY | Lemari pakaian built-in, walk-in closet, dan meja rias terintegrasi dengan pembagian kompartemen sesuai isi. 10 proyek nyata dari arsip SAVOY. | Lemari pakaian yang dibagi sesuai isinya. | https://savoyinterior.com/portfolio/kategori/wardrobe | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/lemari-bawah-tangga | 200 | Lemari Bawah Tangga Custom — SAVOY | Ruang mati di bawah tangga diubah menjadi penyimpanan tertutup yang mengikuti kemiringan anak tangga. 12 proyek nyata dari arsip SAVOY. | Ruang bawah tangga yang akhirnya terpakai. | https://savoyinterior.com/portfolio/kategori/lemari-bawah-tangga | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/tv-backdrop | 200 | Backdrop TV & Rak Custom — SAVOY | Focal point ruang keluarga dengan wall paneling, kabinet floating, dan jalur kabel yang tersembunyi rapi. 1 proyek nyata dari arsip SAVOY. | Backdrop TV tanpa kabel yang terlihat. | https://savoyinterior.com/portfolio/kategori/tv-backdrop | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/bedroom | 200 | Interior Kamar Tidur Custom — SAVOY | Ranjang platform dengan penyimpanan bawah kasur, headboard bertekstur, dan meja kerja hemat ruang. 1 proyek nyata dari arsip SAVOY. | Kamar tidur dengan penyimpanan yang tidak memakan lantai. | https://savoyinterior.com/portfolio/kategori/bedroom | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/apartemen | 200 | Interior Apartemen Custom — SAVOY | Solusi ruang terbatas untuk unit apartemen: multifungsi, ringkas, dan tetap lapang secara visual. 6 proyek nyata dari arsip SAVOY. | Unit apartemen yang terasa lebih lapang. | https://savoyinterior.com/portfolio/kategori/apartemen | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/interior-komersial | 200 | Interior Toko & Kantor Custom — SAVOY | Display toko, counter, dan lemari arsip custom dengan durabilitas untuk pemakaian komersial harian. 1 proyek nyata dari arsip SAVOY. | Interior komersial yang tahan dipakai setiap hari. | https://savoyinterior.com/portfolio/kategori/interior-komersial | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/real-estate | 200 | Interior Rumah Real Estate & Cluster — SAVOY | Interior satu rumah penuh di kawasan real estate: dapur, ruang keluarga, bawah tangga, sampai kamar. 9 proyek nyata dari arsip SAVOY. | Rumah cluster yang berhenti terlihat seragam. | https://savoyinterior.com/portfolio/kategori/real-estate | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/perumahan | 200 | Interior Rumah Perumahan Custom — SAVOY | Penyesuaian interior rumah developer: penyimpanan ditambah dan tata ruang dirapikan tanpa bongkar struktur. 9 proyek nyata dari arsip SAVOY. | Rumah bawaan developer yang dibuat sesuai penghuninya. | https://savoyinterior.com/portfolio/kategori/perumahan | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kategori/rumah-subsidi | 200 | Interior Rumah Subsidi & Tipe Kecil — SAVOY | Interior rumah tipe kecil dengan furniture multifungsi, penyimpanan vertikal, dan biaya yang terkendali. 8 proyek nyata dari arsip SAVOY. | Rumah subsidi yang terasa jauh lebih lapang. | https://savoyinterior.com/portfolio/kategori/rumah-subsidi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/wardrobe-2026-03 | 200 | Lemari Pakaian Koleksi 2026 — SAVOY | Dokumentasi pengerjaan lemari pakaian custom. Diselesaikan pada 2026. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Lemari Pakaian Koleksi 2026 | https://savoyinterior.com/portfolio/wardrobe-2026-03 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-finta-jakarta-selatan | 200 | Apartemen Ibu Finta — SAVOY | Pengerjaan interior apartemen untuk Ibu Finta di Jakarta Selatan. Diselesaikan pada 2024. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Apartemen Ibu Finta | https://savoyinterior.com/portfolio/ibu-finta-jakarta-selatan | Yes (meta) | Yes | 2 script(s) |
| /portfolio/pak-yudi-jakarta-pusat | 200 | Apartemen Pak Yudi — SAVOY | Pengerjaan interior apartemen untuk Pak Yudi di Jakarta Pusat. Diselesaikan pada 2024. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Apartemen Pak Yudi | https://savoyinterior.com/portfolio/pak-yudi-jakarta-pusat | Yes (meta) | Yes | 2 script(s) |
| /portfolio/andri-padalarang | 200 | Bawah Tangga Andri — SAVOY | Pengerjaan lemari bawah tangga untuk Andri di Padalarang. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Andri | https://savoyinterior.com/portfolio/andri-padalarang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-asih-bojongsoang | 200 | Bawah Tangga Ibu Asih — SAVOY | Pengerjaan lemari bawah tangga untuk Ibu Asih di Bojongsoang. Diselesaikan pada 2024. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Bawah Tangga Ibu Asih | https://savoyinterior.com/portfolio/ibu-asih-bojongsoang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-yeni-rancaekek | 200 | Bawah Tangga Ibu Yeni — SAVOY | Pengerjaan lemari bawah tangga untuk Ibu Yeni di Rancaekek. Diselesaikan pada 2024. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Bawah Tangga Ibu Yeni | https://savoyinterior.com/portfolio/ibu-yeni-rancaekek | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bawah-tangga-2024-11 | 200 | Bawah Tangga Koleksi 2024 — SAVOY | Dokumentasi pengerjaan lemari bawah tangga. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Koleksi 2024 | https://savoyinterior.com/portfolio/bawah-tangga-2024-11 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/nining-cikutra | 200 | Bawah Tangga Nining — SAVOY | Pengerjaan lemari bawah tangga untuk Nining di Cikutra. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Nining | https://savoyinterior.com/portfolio/nining-cikutra | Yes (meta) | Yes | 2 script(s) |
| /portfolio/pak-yuki-soreang | 200 | Bawah Tangga Pak Yuki — SAVOY | Pengerjaan lemari bawah tangga untuk Pak Yuki di Soreang. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Pak Yuki | https://savoyinterior.com/portfolio/pak-yuki-soreang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/kitchen-set-2024-07 | 200 | Kitchen Set Koleksi 2024 — SAVOY | Dokumentasi pengerjaan kitchen set & pantry. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Kitchen Set Koleksi 2024 | https://savoyinterior.com/portfolio/kitchen-set-2024-07 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/wardrobe-2024-07 | 200 | Lemari Pakaian Koleksi 2024 — SAVOY | Dokumentasi pengerjaan lemari pakaian custom. Diselesaikan pada 2024. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Lemari Pakaian Koleksi 2024 | https://savoyinterior.com/portfolio/wardrobe-2024-07 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bpk-nofal-sariwangi | 200 | Bawah Tangga Bpk. Nofal — SAVOY | Pengerjaan lemari bawah tangga untuk Bpk. Nofal di Sariwangi dengan finishing minimalis. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Bawah Tangga Bpk. Nofal | https://savoyinterior.com/portfolio/bpk-nofal-sariwangi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/dara-arcamanik | 200 | Bawah Tangga Dara — SAVOY | Pengerjaan lemari bawah tangga untuk Dara di Arcamanik. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Dara | https://savoyinterior.com/portfolio/dara-arcamanik | Yes (meta) | Yes | 2 script(s) |
| /portfolio/herna-batujajar | 200 | Bawah Tangga Herna — SAVOY | Pengerjaan lemari bawah tangga untuk Herna di Batujajar dengan finishing finishing duco. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Bawah Tangga Herna | https://savoyinterior.com/portfolio/herna-batujajar | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-icha-sarijadi | 200 | Bawah Tangga Ibu Icha — SAVOY | Pengerjaan lemari bawah tangga untuk Ibu Icha di Sarijadi. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Ibu Icha | https://savoyinterior.com/portfolio/ibu-icha-sarijadi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-mega-cihanjuang | 200 | Bawah Tangga Ibu Mega — SAVOY | Pengerjaan lemari bawah tangga untuk Ibu Mega di Cihanjuang dengan finishing semi klasik. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Bawah Tangga Ibu Mega | https://savoyinterior.com/portfolio/ibu-mega-cihanjuang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bawah-tangga-2023-10 | 200 | Bawah Tangga Koleksi 2023 — SAVOY | Dokumentasi pengerjaan lemari bawah tangga. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Bawah Tangga Koleksi 2023 | https://savoyinterior.com/portfolio/bawah-tangga-2023-10 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-qisty-soreang | 200 | Kitchen Set Ibu Qisty — SAVOY | Pengerjaan kitchen set & pantry untuk Ibu Qisty di Soreang dengan finishing klasik. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Kitchen Set Ibu Qisty | https://savoyinterior.com/portfolio/ibu-qisty-soreang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-widya-soreang | 200 | Kitchen Set Ibu Widya — SAVOY | Pengerjaan kitchen set & pantry untuk Ibu Widya di Soreang dengan finishing klasik. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Kitchen Set Ibu Widya | https://savoyinterior.com/portfolio/ibu-widya-soreang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-maya-antapani | 200 | Komersial Ibu Maya — SAVOY | Pengerjaan interior toko & komersial untuk Ibu Maya di Antapani. Diselesaikan pada 2023. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Komersial Ibu Maya | https://savoyinterior.com/portfolio/ibu-maya-antapani | Yes (meta) | Yes | 2 script(s) |
| /portfolio/amie-cimahi | 200 | Lemari Pakaian Amie — SAVOY | Pengerjaan lemari pakaian custom untuk Amie di Cimahi. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Lemari Pakaian Amie | https://savoyinterior.com/portfolio/amie-cimahi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bpk-darwin-padalarang | 200 | Lemari Pakaian Bpk. Darwin — SAVOY | Pengerjaan lemari pakaian custom untuk Bpk. Darwin di Padalarang. Diselesaikan pada 2023. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Lemari Pakaian Bpk. Darwin | https://savoyinterior.com/portfolio/bpk-darwin-padalarang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bpk-tiar-banjarnegara | 200 | Lemari Pakaian Bpk. Tiar — SAVOY | Pengerjaan lemari pakaian custom untuk Bpk. Tiar di Banjarnegara. Diselesaikan pada 2023. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Lemari Pakaian Bpk. Tiar | https://savoyinterior.com/portfolio/bpk-tiar-banjarnegara | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-astuti-buah-batu-regensi | 200 | Lemari Pakaian Ibu Astuti — SAVOY | Pengerjaan lemari pakaian custom untuk Ibu Astuti di Buah Batu Regensi dengan finishing semi & full home. Diselesaikan pada 2023. | Lemari Pakaian Ibu Astuti | https://savoyinterior.com/portfolio/ibu-astuti-buah-batu-regensi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-lely-cisitu-lama | 200 | Lemari Pakaian Ibu Lely — SAVOY | Pengerjaan lemari pakaian custom untuk Ibu Lely di Cisitu Lama. Diselesaikan pada 2023. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Lemari Pakaian Ibu Lely | https://savoyinterior.com/portfolio/ibu-lely-cisitu-lama | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ibu-via-subang | 200 | Lemari Pakaian Ibu Via — SAVOY | Pengerjaan lemari pakaian custom untuk Ibu Via di Subang dengan finishing semi & full home. Diselesaikan pada 2023. Foto asli hasil pengerjaan, bukan render. | Lemari Pakaian Ibu Via | https://savoyinterior.com/portfolio/ibu-via-subang | Yes (meta) | Yes | 2 script(s) |
| /portfolio/ira-ciwastra | 200 | Lemari Pakaian Ira — SAVOY | Pengerjaan lemari pakaian custom untuk Ira di Ciwastra. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Lemari Pakaian Ira | https://savoyinterior.com/portfolio/ira-ciwastra | Yes (meta) | Yes | 2 script(s) |
| /portfolio/wardrobe-2023-09 | 200 | Lemari Pakaian Koleksi 2023 — SAVOY | Dokumentasi pengerjaan lemari pakaian custom. Diselesaikan pada 2023. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Lemari Pakaian Koleksi 2023 | https://savoyinterior.com/portfolio/wardrobe-2023-09 | Yes (meta) | Yes | 2 script(s) |
| /portfolio/apartemen-jakarta-residence | 200 | Apartemen Jakarta Residence — SAVOY | Pengerjaan interior apartemen di Jakarta Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Apartemen Jakarta Residence | https://savoyinterior.com/portfolio/apartemen-jakarta-residence | Yes (meta) | Yes | 2 script(s) |
| /portfolio/apartemen-kemang-village | 200 | Apartemen Kemang Village — SAVOY | Pengerjaan interior apartemen di Kemang Village, Jakarta Selatan. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Apartemen Kemang Village | https://savoyinterior.com/portfolio/apartemen-kemang-village | Yes (meta) | Yes | 2 script(s) |
| /portfolio/apartemen-landmark-residence | 200 | Apartemen Landmark Residence — SAVOY | Pengerjaan interior apartemen di Landmark Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Apartemen Landmark Residence | https://savoyinterior.com/portfolio/apartemen-landmark-residence | Yes (meta) | Yes | 2 script(s) |
| /portfolio/apartemen-pakuwon-residences-mall-bekasi | 200 | Apartemen Pakuwon Residences Mall Bekasi — SAVOY | Pengerjaan interior apartemen di Pakuwon Residences Mall Bekasi. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Apartemen Pakuwon Residences Mall Bekasi | https://savoyinterior.com/portfolio/apartemen-pakuwon-residences-mall-bekasi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/tv-backdrop | 200 | Backdrop TV & Rak Televisi — SAVOY | Dokumentasi pengerjaan backdrop tv & rak televisi. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Backdrop TV & Rak Televisi | https://savoyinterior.com/portfolio/tv-backdrop | Yes (meta) | Yes | 2 script(s) |
| /portfolio/bedroom | 200 | Interior Kamar Tidur — SAVOY | Dokumentasi pengerjaan interior kamar tidur. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Interior Kamar Tidur | https://savoyinterior.com/portfolio/bedroom | Yes (meta) | Yes | 2 script(s) |
| /portfolio/modern | 200 | Kitchen Set Modern — SAVOY | Dokumentasi pengerjaan kitchen set & pantry dengan finishing modern. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Kitchen Set Modern | https://savoyinterior.com/portfolio/modern | Yes (meta) | Yes | 2 script(s) |
| /portfolio/semi-classic | 200 | Kitchen Set Semi Classic — SAVOY | Dokumentasi pengerjaan kitchen set & pantry dengan finishing semi classic. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Kitchen Set Semi Classic | https://savoyinterior.com/portfolio/semi-classic | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-antapani-city | 200 | Perumahan Antapani City — SAVOY | Pengerjaan interior perumahan di Antapani City. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Antapani City | https://savoyinterior.com/portfolio/perumahan-antapani-city | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-bsd-city | 200 | Perumahan BSD City — SAVOY | Pengerjaan interior perumahan di BSD City, Tangerang Selatan. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan BSD City | https://savoyinterior.com/portfolio/perumahan-bsd-city | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-bumi-mas-kencana | 200 | Perumahan Bumi Mas Kencana — SAVOY | Pengerjaan interior perumahan di Bumi Mas Kencana. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Bumi Mas Kencana | https://savoyinterior.com/portfolio/perumahan-bumi-mas-kencana | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-cherryfield | 200 | Perumahan Cherryfield — SAVOY | Pengerjaan interior perumahan di Cherryfield. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Cherryfield | https://savoyinterior.com/portfolio/perumahan-cherryfield | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-graha-raya-bintaro | 200 | Perumahan Graha Raya Bintaro — SAVOY | Pengerjaan interior perumahan di Graha Raya Bintaro. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Graha Raya Bintaro | https://savoyinterior.com/portfolio/perumahan-graha-raya-bintaro | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-grand-depok-city | 200 | Perumahan Grand Depok City — SAVOY | Pengerjaan interior perumahan di Grand Depok City. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Grand Depok City | https://savoyinterior.com/portfolio/perumahan-grand-depok-city | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-griya-alamaya-pangalengan | 200 | Perumahan Griya Alamaya Pangalengan — SAVOY | Pengerjaan interior perumahan di Griya Alamaya Pangalengan. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Griya Alamaya Pangalengan | https://savoyinterior.com/portfolio/perumahan-griya-alamaya-pangalengan | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-kalibata-indah | 200 | Perumahan Kalibata Indah — SAVOY | Pengerjaan interior perumahan di Kalibata Indah, Jakarta Selatan. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Kalibata Indah | https://savoyinterior.com/portfolio/perumahan-kalibata-indah | Yes (meta) | Yes | 2 script(s) |
| /portfolio/perumahan-shila-at-sawangan | 200 | Perumahan Shila at Sawangan — SAVOY | Pengerjaan interior perumahan di Shila at Sawangan. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Perumahan Shila at Sawangan | https://savoyinterior.com/portfolio/perumahan-shila-at-sawangan | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-bali-garden-city-view | 200 | Real Estate Bali Garden City View — SAVOY | Pengerjaan interior rumah real estate di Bali Garden City View. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Real Estate Bali Garden City View | https://savoyinterior.com/portfolio/real-estate-bali-garden-city-view | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-jakarta-garden-city | 200 | Real Estate Jakarta Garden City — SAVOY | Pengerjaan interior rumah real estate di Jakarta Garden City, Jakarta Timur. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Real Estate Jakarta Garden City | https://savoyinterior.com/portfolio/real-estate-jakarta-garden-city | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-kota-bali-residence | 200 | Real Estate Kota Bali Residence — SAVOY | Pengerjaan interior rumah real estate di Kota Bali Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Real Estate Kota Bali Residence | https://savoyinterior.com/portfolio/real-estate-kota-bali-residence | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-kotabaru-parahyangan-bandung-tempoe-doeloe | 200 | Real Estate Kotabaru Parahyangan – Bandung Tempoe Doeloe — SAVOY | Pengerjaan interior rumah real estate di Kotabaru Parahyangan – Bandung Tempoe Doeloe, Padalarang. Foto asli hasil pengerjaan, bukan render. | Real Estate Kotabaru Parahyangan – Bandung Tempoe Doeloe | https://savoyinterior.com/portfolio/real-estate-kotabaru-parahyangan-bandung-tempoe-doeloe | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-kotabaru-parahyangan-tatar-naganingrum | 200 | Real Estate Kotabaru Parahyangan – Tatar Naganingrum — SAVOY | Pengerjaan interior rumah real estate di Kotabaru Parahyangan – Tatar Naganingrum, Padalarang. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Real Estate Kotabaru Parahyangan – Tatar Naganingrum | https://savoyinterior.com/portfolio/real-estate-kotabaru-parahyangan-tatar-naganingrum | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-kotabaru-parahyangan-tatar-spatirasmi | 200 | Real Estate Kotabaru Parahyangan – Tatar Spatirasmi — SAVOY | Pengerjaan interior rumah real estate di Kotabaru Parahyangan – Tatar Spatirasmi, Padalarang. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Real Estate Kotabaru Parahyangan – Tatar Spatirasmi | https://savoyinterior.com/portfolio/real-estate-kotabaru-parahyangan-tatar-spatirasmi | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-kotabaru-parahyangan-tatar-wangsakerta | 200 | Real Estate Kotabaru Parahyangan – Tatar Wangsakerta — SAVOY | Pengerjaan interior rumah real estate di Kotabaru Parahyangan – Tatar Wangsakerta, Padalarang. Dirancang, diproduksi, dan dipasang langsung oleh tim SAVOY. | Real Estate Kotabaru Parahyangan – Tatar Wangsakerta | https://savoyinterior.com/portfolio/real-estate-kotabaru-parahyangan-tatar-wangsakerta | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-podomoro-park | 200 | Real Estate Podomoro Park — SAVOY | Pengerjaan interior rumah real estate di Podomoro Park, Bandung. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Real Estate Podomoro Park | https://savoyinterior.com/portfolio/real-estate-podomoro-park | Yes (meta) | Yes | 2 script(s) |
| /portfolio/real-estate-summarecon-bandung | 200 | Real Estate Summarecon Bandung — SAVOY | Pengerjaan interior rumah real estate di Summarecon Bandung. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Real Estate Summarecon Bandung | https://savoyinterior.com/portfolio/real-estate-summarecon-bandung | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-bukit-cipageran-indah | 200 | Rumah Subsidi Bukit Cipageran Indah — SAVOY | Pengerjaan interior rumah subsidi di Bukit Cipageran Indah, Cimahi. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Bukit Cipageran Indah | https://savoyinterior.com/portfolio/rumah-subsidi-bukit-cipageran-indah | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-cileunyi-residence | 200 | Rumah Subsidi Cileunyi Residence — SAVOY | Pengerjaan interior rumah subsidi di Cileunyi Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Cileunyi Residence | https://savoyinterior.com/portfolio/rumah-subsidi-cileunyi-residence | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-ciparay-residence | 200 | Rumah Subsidi Ciparay Residence — SAVOY | Pengerjaan interior rumah subsidi di Ciparay Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Ciparay Residence | https://savoyinterior.com/portfolio/rumah-subsidi-ciparay-residence | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-griya-cinunuk-indah | 200 | Rumah Subsidi Griya Cinunuk Indah — SAVOY | Pengerjaan interior rumah subsidi di Griya Cinunuk Indah. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Griya Cinunuk Indah | https://savoyinterior.com/portfolio/rumah-subsidi-griya-cinunuk-indah | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-griya-padalarang-asri | 200 | Rumah Subsidi Griya Padalarang Asri — SAVOY | Pengerjaan interior rumah subsidi di Griya Padalarang Asri. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Griya Padalarang Asri | https://savoyinterior.com/portfolio/rumah-subsidi-griya-padalarang-asri | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-griya-setu-permai | 200 | Rumah Subsidi Griya Setu Permai — SAVOY | Pengerjaan interior rumah subsidi di Griya Setu Permai, Bekasi. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Griya Setu Permai | https://savoyinterior.com/portfolio/rumah-subsidi-griya-setu-permai | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-rancaekek-permai | 200 | Rumah Subsidi Rancaekek Permai — SAVOY | Pengerjaan interior rumah subsidi di Rancaekek Permai. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Rancaekek Permai | https://savoyinterior.com/portfolio/rumah-subsidi-rancaekek-permai | Yes (meta) | Yes | 2 script(s) |
| /portfolio/rumah-subsidi-star-parahyangan-residence | 200 | Rumah Subsidi Star Parahyangan Residence — SAVOY | Pengerjaan interior rumah subsidi di Star Parahyangan Residence. Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan. | Rumah Subsidi Star Parahyangan Residence | https://savoyinterior.com/portfolio/rumah-subsidi-star-parahyangan-residence | Yes (meta) | Yes | 2 script(s) |
| /knowledge/solusi-custom-furniture-rumah-dan-apartemen-bandung | 200 | Solusi Custom Furniture Bandung yang Awet & Presisi — SAVOY | Kenapa furniture pabrikan cepat rusak di Bandung? Solusi HMR tahan lembab, penyesuaian dinding miring, dan survey langsung dari workshop lokal kami. | Custom Furniture Bandung: Menjawab Masalah Lembab, Dinding Miring, & Ruang Sempit | https://savoyinterior.com/knowledge/solusi-custom-furniture-rumah-dan-apartemen-bandung | Yes (meta) | Yes | 2 script(s) |
| /knowledge/tips-furniture-custom-awet-bebas-rayap-cimahi | 200 | Tips Furniture Custom Cimahi Bebas Rayap & Awet — SAVOY | Solusi anti-rayap untuk hunian di Cimahi, pemanfaatan lemari bawah tangga tersembunyi, serta rahasia instalasi presisi mengikuti kontur dinding. | Furniture Custom Cimahi: Solusi Cerdas Hadapi Masalah Rayap & Ruang Terbuang | https://savoyinterior.com/knowledge/tips-furniture-custom-awet-bebas-rayap-cimahi | Yes (meta) | Yes | 2 script(s) |
| /knowledge/checklist-sebelum-mulai-custom | 200 | Checklist Sebelum Mulai Furniture Custom — SAVOY | Hal-hal esensial yang wajib dipastikan pada dinding dan lantai agar proses instalasi furnitur berjalan lancar dan rapi. | Checklist Sebelum Mulai Custom: Elektrikal, Pipa, hingga Level Lantai. | https://savoyinterior.com/knowledge/checklist-sebelum-mulai-custom | Yes (meta) | Yes | 2 script(s) |
| /knowledge/solusi-custom-furniture-hunian-modern-bandung-barat | 200 | Custom Furniture Bandung Barat: Plafon Tinggi — SAVOY | Menghadapi masalah proporsi dinding kosong pada rumah berplafon 4 meter di Kotabaru Parahyangan dan Padalarang dengan backdrop TV serta partisi built-in. | Furniture Custom Bandung Barat: Harmonisasi Plafon Tinggi & Ruang Terbuka | https://savoyinterior.com/knowledge/solusi-custom-furniture-hunian-modern-bandung-barat | Yes (meta) | Yes | 2 script(s) |
| /knowledge/solusi-custom-furniture-apartemen-dan-townhouse-jakarta | 200 | Custom Furniture Apartemen Jakarta: Solusi Compact — SAVOY | Mengatasi masalah ruang sempit unit studio & 2BR di Jakarta dengan smart storage multifungsi, ranjang laci sorong, dan kitchen set kompak bebas bau. | Custom Furniture Apartemen & Rumah Sempit di Jakarta | https://savoyinterior.com/knowledge/solusi-custom-furniture-apartemen-dan-townhouse-jakarta | Yes (meta) | Yes | 2 script(s) |
| /knowledge/panduan-custom-furniture-rumah-cluster-tangerang-bsd | 200 | Custom Furniture Tangerang & BSD: Rumah Cluster — SAVOY | Solusi mengatasi dapur terbuka yang terlihat dari pintu masuk, penutup meja cor semen standar developer, serta backdrop TV minimalis mewah di Tangerang. | Custom Furniture Rumah Cluster Tangerang & BSD: Dapur Terbuka | https://savoyinterior.com/knowledge/panduan-custom-furniture-rumah-cluster-tangerang-bsd | Yes (meta) | Yes | 2 script(s) |
| /knowledge/solusi-custom-furniture-tahan-panas-dan-lembab-bekasi | 200 | Custom Furniture Bekasi: Tahan Panas & Awet — SAVOY | Suhu ruangan tinggi di Bekasi kerap memicu perekat HPL terkelupas dan papan melendut. Simak teknik pelapisan mesin hot-melt dan sirkulasi lemari pakaian. | Custom Furniture Bekasi: Solusi HPL Mengelupas & Lemari Melengkung | https://savoyinterior.com/knowledge/solusi-custom-furniture-tahan-panas-dan-lembab-bekasi | Yes (meta) | Yes | 2 script(s) |
| /knowledge/perbandingan-lengkap-finishing-hpl-duco-dan-melamik | 200 | Perbandingan Finishing HPL, Cat Duco, dan Melamik — SAVOY | Panduan memilih jenis finishing custom furniture berdasarkan fungsi ruang, ketahanan gores, kelembaban, serta kemudahan perawatannya. | HPL vs Cat Duco vs Melamik: Panduan Memilih Finishing Custom Furniture | https://savoyinterior.com/knowledge/perbandingan-lengkap-finishing-hpl-duco-dan-melamik | Yes (meta) | Yes | 2 script(s) |
| /knowledge/prinsip-tata-letak-dan-sirkulasi-ruang-furniture-custom | 200 | Prinsip Sirkulasi & Tata Letak Furniture Custom — SAVOY | Mengapa ruangan terasa sesak meski luas? Pelajari aturan jarak sirkulasi 90 cm, swing door vs sliding door, serta penempatan titik stopkontak tanam. | Prinsip Sirkulasi & Tata Letak Furniture Custom yang Benar | https://savoyinterior.com/knowledge/prinsip-tata-letak-dan-sirkulasi-ruang-furniture-custom | Yes (meta) | Yes | 2 script(s) |
| /knowledge/cara-menghemat-budget-custom-furniture-tanpa-kurangi-kualitas | 200 | Tips Hemat Budget Custom Furniture Berkualitas — SAVOY | Tips praktis membagi alokasi biaya antara material inti, hardware engsel/rel berkualitas, dan efisiensi modul laci agar investasi interior Anda maksimal. | 5 Strategi Menghemat Anggaran Custom Furniture Tanpa Kurangi Kualitas | https://savoyinterior.com/knowledge/cara-menghemat-budget-custom-furniture-tanpa-kurangi-kualitas | Yes (meta) | Yes | 2 script(s) |
| /knowledge/renovasi-kitchen-set-anti-rayap-lembab-bandung | 200 | Renovasi Kitchen Set Bandung: Solusi Pipa & Rembes — SAVOY | Panduan teknis mengganti kitchen set lama yang lapuk di Bandung: relokasi sink, penanganan dinding lembab di musim hujan, dan pemilihan tabletop kuarsa. | Renovasi Kitchen Set Bandung: Solusi Pipa Bocor & Dinding Rembes | https://savoyinterior.com/knowledge/renovasi-kitchen-set-anti-rayap-lembab-bandung | Yes (meta) | Yes | 2 script(s) |
| /knowledge/desain-lemari-pakaian-walk-in-closet-cimahi | 200 | Walk-in Closet & Lemari Custom Cimahi — SAVOY | Cara cerdas menata lemari pakaian kaca tempered, meja rias gantung, dan laci aksesori pada kamar berukuran 3x3 meter di Cimahi. | Mewujudkan Walk-in Closet & Lemari Pakaian Custom di Kamar Tidur Sempit Cimahi | https://savoyinterior.com/knowledge/desain-lemari-pakaian-walk-in-closet-cimahi | Yes (meta) | Yes | 2 script(s) |
| /knowledge/pemanfaatan-ruang-bawah-tangga-rumah-bandung-barat | 200 | Custom Lemari Bawah Tangga Bandung Barat — SAVOY | Solusi mengatasi sudut miring bawah tangga yang kotor dan berantakan pada perumahan bertingkat di Batujajar dan Padalarang. | Mengubah Ruang Bawah Tangga Jadi Gudang Rapi & Rak Buku Mewah di Bandung Barat | https://savoyinterior.com/knowledge/pemanfaatan-ruang-bawah-tangga-rumah-bandung-barat | Yes (meta) | Yes | 2 script(s) |
| /knowledge/penataan-interior-kitchen-set-apartemen-studio-jakarta | 200 | Kitchen Set Apartemen Studio Jakarta — SAVOY | Solusi memasak tanpa asap dan tumpukan perabot di apartemen Jakarta: kompor induksi tanam, cooker hood slim ductless, dan rak bumbu dorong. | Kitchen Set Mini & Pantry Multifungsi untuk Apartemen Studio di Jakarta | https://savoyinterior.com/knowledge/penataan-interior-kitchen-set-apartemen-studio-jakarta | Yes (meta) | Yes | 2 script(s) |
| /knowledge/desain-backdrop-tv-modern-rumah-cluster-tangerang | 200 | Backdrop TV Custom Tangerang & BSD: Desain Mewah — SAVOY | Cara menyembunyikan colokan dan kabel TV yang ruwet pada dinding ruang keluarga rumah baru di BSD dan Gading Serpong. | Backdrop TV Modern & Lemari Pajang Terintegrasi untuk Rumah Cluster Tangerang | https://savoyinterior.com/knowledge/desain-backdrop-tv-modern-rumah-cluster-tangerang | Yes (meta) | Yes | 2 script(s) |
| /knowledge/ukuran-ideal-lemari-pakaian | 200 | Ukuran Ideal Lemari Pakaian Custom — SAVOY | Kedalaman 60cm vs 55cm, pembagian baju panjang (gamis/long coat) vs kemeja lipat agar lemari tidak cepat sesak. | Berapa Ukuran Ideal Kedalaman Lemari Pakaian & Pembagian Gantungan? | https://savoyinterior.com/knowledge/ukuran-ideal-lemari-pakaian | Yes (meta) | Yes | 2 script(s) |
| /knowledge/kitchen-set-tahan-panas-dan-anti-lembab-bekasi | 200 | Kitchen Set Custom Bekasi: Tahan Panas & Lembab — SAVOY | Tips memilih material kabinet dapur yang tidak memuai saat terkena uap kompor dan panas cuaca Bekasi, lengkap dengan sistem sirkulasi tabung gas. | Kitchen Set Tahan Panas & Bebas Lapuk untuk Dapur Rumah di Kawasan Bekasi | https://savoyinterior.com/knowledge/kitchen-set-tahan-panas-dan-anti-lembab-bekasi | Yes (meta) | Yes | 2 script(s) |
| /knowledge/cara-merawat-furniture-hpl-dan-duco-agar-tetap-mengkilap | 200 | Cara Merawat Furniture Custom HPL & Duco — SAVOY | Cairan pembersih yang aman untuk HPL, cara menghilangkan noda minyak dan spidol, serta pelumasan rel engsel agar tetap senyap bertahun-tahun. | Panduan Perawatan Furniture Custom: Cara Membersihkan HPL, Duco, & Rel Laci | https://savoyinterior.com/knowledge/cara-merawat-furniture-hpl-dan-duco-agar-tetap-mengkilap | Yes (meta) | Yes | 2 script(s) |
| /knowledge/desain-meja-kerja-built-in-dan-rak-buku-ergonomis | 200 | Meja Kerja Custom & Rak Buku Built-in Ergonomis — SAVOY | Standar ergonomi meja kerja 75 cm, manajemen kabel laptop, dan pencahayaan lampu task lighting agar tidak cepat lelah saat bekerja dari rumah. | Desain Meja Kerja Built-in & Rak Buku: Solusi WFH Efisien di Sudut Kamar | https://savoyinterior.com/knowledge/desain-meja-kerja-built-in-dan-rak-buku-ergonomis | Yes (meta) | Yes | 2 script(s) |
| /knowledge/alur-pemesanan-custom-furniture-dari-survey-hingga-pasang | 200 | Alur Pemesanan Custom Furniture: Survey ke Pasang — SAVOY | Ketahui proses transparan pembuatan interior custom: konsultasi awal, pengukuran laser 3D, revisi gambar kerja, produksi workshop, hingga instalasi rapi. | Alur Pemesanan Custom Furniture: Dari Survey Dimensi Hingga Pemasangan | https://savoyinterior.com/knowledge/alur-pemesanan-custom-furniture-dari-survey-hingga-pasang | Yes (meta) | Yes | 2 script(s) |
| /knowledge/ergonomi-dan-layout-kitchen | 200 | Ergonomi & Layout Kitchen Set yang Efisien — SAVOY | Cara menghitung ketinggian tabletop sesuai tinggi badan dan alur gerak natural saat mencuci, memotong, hingga memasak. | Bagaimana Menentukan Ergonomi & Layout Kitchen yang Efisien? | https://savoyinterior.com/knowledge/ergonomi-dan-layout-kitchen | Yes (meta) | Yes | 2 script(s) |
| /knowledge/plywood-mdf-atau-hmr | 200 | Plywood, MDF, atau HMR: Pilih yang Mana? — SAVOY | Panduan memahami mengapa kami merekomendasikan High Moisture Resistance (HMR) untuk area lembab dibanding MDF standar. | Plywood, MDF, atau HMR? Kenali karakter masing-masing material. | https://savoyinterior.com/knowledge/plywood-mdf-atau-hmr | Yes (meta) | Yes | 2 script(s) |

Non-sitemap exceptions: /admin/login memiliki noindex,nofollow dan tidak berada dalam sitemap; /knowledge/audit-nonexistent memiliki HTTP 200 streaming disertai noindex; /audit-nonexistent memberi 404. Tidak ada finding P0/P1 indexability terbukti.

## 13. robots.txt Audit

GET 200, 769 bytes. Wildcard/search/AI crawlers allow /. Sitemap host menggunakan canonical origin. Next assets tidak diblokir. Public admin login boleh dicrawl agar noindex terbaca; robots bukan auth control.

FALSE_POSITIVE: komentar lama mengklaim tidak ada admin area, tetapi implementation sekarang memiliki auth/noindex. Komentar perlu diperbarui sebagai maintenance ringan, bukan bukti admin bocor. Kebijakan AI crawler harus sesuai keputusan pemilik bisnis; tidak otomatis dinilai bug.

## 14. Sitemap Audit

GET 200, 21565 bytes, 114 URLs. Semua URL HTTP 200 saat snapshot. Admin dikecualikan, only active articles diambil. Static dates tidak berubah setiap request. F06 membahas freshness CMS. Image sitemap tidak ada; INFO optional karena image discoverability belum terbukti bermasalah.

Invalid CMS date dapat merusak serialisasi Date; ini bagian F07, tidak dihitung dua kali. Production origin correctness/CDN cache/Search Console submission BLOCKED.

## 15. Metadata & Canonical Audit

MetadataBase berasal dari site.url; helper menghasilkan canonical absolute, Open Graph, Twitter card dan robots. Canonical home runtime tanpa trailing slash tetap menunjuk origin yang sama. Redirect www ke bare host tersedia; HTTP www redirect di hosting final BLOCKED.

Admin mewarisi canonical home tetapi noindex,nofollow; bukan blocker indexing. Missing article memiliki beberapa robots meta termasuk index/follow dari metadata dan noindex dari framework. Google menerapkan rule yang lebih restriktif; [reference](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag). F07 wajib menjaga dates/URL content sebelum metadata.

## 16. Structured Data Audit

Global Organization/LocalBusiness + WebSite dan page graphs, breadcrumbs, service/article nodes ditemukan. JSON-LD serialisasi mengganti < menjadi unicode escape sebelum dangerouslySetInnerHTML. Tidak ditemukan aggregateRating fiktif pada global business schema. Logo source /brand/savoy-logo.jpg tersedia (166841 bytes).

Address/geo/hours memakai env kondisional; keberadaan field tidak membuktikan business verification. Koordinat/range/day values dan klaim material/proyek harus diverifikasi pemilik, BLOCKED. Rich Results Test/schema validator menyeluruh BLOCKED; script count di matrix bukan sertifikasi schema. Jangan menambah award/review/rating untuk mengejar rich results.

## 17. Performance Audit

Cold Chromium, localhost, production, tanpa throttling:

| Viewport | Observed LCP | Initial CLS | CLS After Scroll Smoke | JS Encoded Bytes | Resource Encoded Bytes | Document Encoded Bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 390x900 | 672ms | 0 | 0 | 385705 | 731456 | 59151 |
| 1440x900 | 704ms | 0.000354 | 0.075348 | 395453 | 999935 | 59151 |

Angka hanya satu lab run lokal: tidak mewakili 4G, CPU perangkat, origin latency, p75 atau real user metrics. Resource totals termasuk prefetch yang terjadi sebelum networkidle; tidak sama dengan disk size/bundle total. HTTP raw homepage 388095 bytes; compression menurunkan encoded document ke 59151 pada browser.

Tidak ada bottleneck produksi yang diklaim hanya dari localhost. F22 adalah measurement task. F01 dapat menambah runtime load; F16 mengorbankan freshness untuk cache.

## 18. Core Web Vitals Audit

LCP/CLS local sample di atas terukur; INP **BLOCKED** (tidak ada event timing suite/field traffic). Field LCP/INP/CLS p75, CrUX, RUM dan low-end device **BLOCKED**. Target verifikasi release: LCP<=2.5s, INP<=200ms, CLS<=0.1 di p75; target tersebut adalah acceptance criteria, bukan hasil audit production.

Desktop scroll smoke CLS 0.075348 tidak melampaui target 0.1 dalam satu run; penyebab masing-masing shift belum diprofile sehingga tidak menjadi finding tersendiri. Throttled repeated runs diperlukan untuk variasi pinned animation/layout.

## 19. Resource Optimization Audit

| Resource | Type | Size | Loaded On | Critical? | Problem | Recommendation |
| --- | --- | ---: | --- | --- | --- | --- |
| /v/images/portfolio/kitchen-set/modern-01-1600.webp | WebP hero | 137058 encoded bytes | / desktop sample | Yes | Belum ada bukti oversized LCP | Keep high fetch priority; measure device sizes |
| /v/images/process/01-konsultasi-640.webp | WebP | 48716 bytes | / | No | 640 and 1280 fetched pada sampled session | Trace responsive/mobile+desktop duplicated markup before optimization |
| /v/images/process/01-konsultasi-1280.webp | WebP | 125168 bytes | / | No | Responsive duplication needs trace | Verify hidden image loading, bukan langsung hapus |
| Manrope latin woff2 | Font | 24576 aggregate encoded | Root | Yes | No runtime font CDN request observed | Preserve self hosting |
| Initial JS aggregate | JS | 385705 /395453 encoded | / 390/1440 | Yes | CPU/device impact unknown | F22 profiling |
| bd904a5c.90c130a0395f68cc.js | JS chunk disk | 379910 uncompressed | Conditional/load mapping unverified | No evidence | Disk size tidak sama dengan initial transfer | Map chunk before splitting |
| b536a0f1.38a847592118e1c9.js | JS chunk disk | 368052 uncompressed | Conditional/load mapping unverified | No evidence | Same | Profile lazy dependency |
| /brand/savoy-brand-plate.png | PNG disk | 4670174 bytes | No source reference found in src sweep | No | Large disk file, no proven page load | Do not classify unused disk size as page weight |
| /brand/savoy-mark.png | PNG disk | 360550 bytes | Source for brand/variants | Brand | Mutable URL immutable policy | F16 |
| public/v tree | Derived WebP | 42.6MB distinct data | Selected URLs per route | Mixed | Not all downloaded per visit | Preserve pipeline, verify deployment output |
| Article upload | WebP, resize<=1600 | Per file | Article if supplied | Content | Not responsive variants, bounded output | Measure when real uploads exist |

81 first-screen checks and post-scroll home checks found no completed broken images. Lazy images not loaded in every route/state remain NEEDS_RUNTIME_VERIFICATION.

## 20. Image Pipeline Audit

Shared IMAGE_LADDER [256,384,640,960,1280,1600], loader prefix /images,/logo,/brand and build variants use same contract. Sharp webp pipeline honors withoutEnlargement; widths at/above WebP original are copied/hardlinked. Build script exits nonzero on failure and public/v is derived/gitignored.

F16: filenames mutable. The loader fallback only applies to unrecognized source prefixes; it does **not** check whether a recognized variant file exists at runtime. Build/deploy must ship public/v. No missing recognized variant observed during audit; missing-variant fallback claim in comment is not treated as proven runtime protection.

Upload pipeline rotates/resizes/converts to WebP, preventing raw active SVG/HTML storage through upload allowlist. F05 transport cap and F07 URL/schema contracts remain open. Public URL pasted in CMS can still fetch third-party media through plain img; privacy/performance policy should restrict or disclose approved hosts after operator decision.

## 21. JavaScript Bundle Audit

Root SmoothScroll statically imports Lenis, GSAP, ScrollTrigger; Motion used in route components; Three dynamically imported near section visibility. Two large disk chunks are listed as resources but mapping to dependencies was not established. No blanket claim all chunks ship on all routes.

Initial transfer ~386-395KB JS in cold homepage. Non-home bundle budget, long tasks and real INP BLOCKED. F22 recommends evidence before removing libraries or changing architecture.

## 22. Font & CSS Audit

Manrope next/font weight 400/500/600/700, latin, swap, self-hosted at runtime. Tailwind v4 via PostCSS, global semantic tokens, focus-visible ring and reduced-motion rules. F12 identifies concrete contrast failures, not an overall theme rewrite.

Build-time Google font network dependency exists via next/font/google; offline clean build portability NEEDS_RUNTIME_VERIFICATION. Font fallback CLS isolated measurement BLOCKED.

## 23. Animation Performance Audit

GSAP useGSAP scopes/revert, pointer/reduced-motion guards, requestAnimationFrame scheduling, offscreen observers and Three dispose/renderer.dispose are present. Scroll smoke mounted 2 canvases and found no broken images. Canvas pixel coverage, GPU resource leak profiling, WebGL context loss and repeated route transitions **BLOCKED**; mounted canvas is not proof every scene draws correctly.

F11 scale overflow and F12 alpha/contrast concerns need targeted fixes. SmoothScroll conditionally changes child wrapping after hydration; state preservation on pointer/reduced-motion changes NEEDS_RUNTIME_VERIFICATION, no confirmed lost form state claimed.

## 24. Mobile Layout Audit

Responsive matrix below: PASS means the sampled route at that width had no document-wide overflow or completed broken image after networkidle. It does **not** imply every menu/modal/wizard step fits or WCAG passes. Tests use Chromium desktop viewport unless explicit touch mode noted.

| Route | Component | 320 | 360 | 375 | 390 | 430 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | Main page, fine pointer | PASS | PASS | PASS | PASS | PASS | FAIL | PASS | PASS | PASS |
| /about | Main page, fine pointer | PASS | PASS | PASS | PASS | PASS | FAIL | PASS | PASS | PASS |
| /portfolio | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /furniture-custom/kitchen-set | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /knowledge | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /survey | First wizard step | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /contact | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /privacy | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /services | Main page | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| /survey | Steps 2-4, errors, success | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST |
| / | Review modal | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST |
| /furniture-custom/kitchen-set | Lightbox all heights | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST |
| Dynamic detail families | Full page long content | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST |
| /admin/* | Authenticated editor | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST | NEEDS_TEST |

Screenshot 390x844 first viewport examined: header/menu, hero text and CTAs render and fit. Mobile menu opens one dialog and Escape closes. Hardware keyboard, landscape/short viewport, iOS Safari safe area, browser toolbar resize, 200/400% zoom and sticky CTA overlap on real mobile **BLOCKED**.

## 25. Tablet Layout Audit

F11 reproduces at 768x900 fine pointer: scrollWidth 777. Explicit touch emulation and reduced-motion each produce scrollWidth 768. Ini masalah animation layout yang bergantung pointer, bukan klaim semua tablet touch gagal.

1024 sampled routes no document overflow. Cross-browser Safari/Firefox and resize-during-scroll behavior NEEDS_RUNTIME_VERIFICATION.

## 26. Desktop Layout Audit

1440/1920 main pages pass width/image smoke; 1440 screenshot shows header/nav/hero/CTAs readable in layout. F10 keyboard lightbox and F12 contrast tetap gagal meski tidak overflow.

Ultrawide di atas 1920, short laptop height, all pinned-gallery keyboard/focus scrolling, 4K image fidelity dan no-JS complete navigation **BLOCKED**.

## 27. Accessibility Audit

Source scanner raw 324 signals (230 serious,89 moderate,5 critical) **tidak** sama dengan 324 verified findings: scanner menilai page/components secara terpisah sehingga mengira main/nav/skip-link/H1 hilang meski tersedia dalam root layout/PageHeader. Signal tersebut FALSE_POSITIVE bila composed runtime membuktikan landmark/H1.

Axe 4.13.0 runtime tags wcag2a/wcag2aa/wcag21aa/wcag22aa pada /, /portfolio, /furniture-custom/kitchen-set, /survey menghasilkan color-contrast signals; /knowledge/checklist-sebelum-mulai-custom tidak memiliki violation pada run itu. Axe tidak membuktikan WCAG penuh.

Confirmed F10 modal focus dan F12 contrast. Root lang=id, main id=main, skip link dan focus-visible ring tersedia; Radix menu supplies focus semantics. Review stars role radio pada button belum diverifikasi arrow-key/roving tabindex dan focus outline; wajib masuk regression check.

Screen-reader NVDA/VoiceOver, full tab order, all labels/error announcements, touch targets across all states, semantic list decoration dan zoom **BLOCKED**. Search input /knowledge hanya placeholder, tanpa explicit label: NEEDS_RUNTIME_VERIFICATION accessible-name/visible-label usability, tidak ditambahkan sebagai bug terkonfirmasi hanya dari regex.

## 28. Source Code Audit

Reviewer raw 334 smells/2 SOLID signals, average score93.8; bukan verdict approval. Data fixture numbers/year/spec bukan otomatis magic-number bug, long components bukan otomatis alasan abstraksi. Tidak ditemukan eval/new Function/SQL command path dalam application source sweep; scratch harness new Function bukan production code.

F02/F07/F08/F09 adalah source behavior terverifikasi. Tidak dilakukan blind refactor atau library replacement. Manual suppression next/no-img untuk upload/pasted preview memiliki alasan source dan tidak dihitung bug.

## 29. Next.js Architecture Audit

App Router conventions, async params/headers/cookies, server action auth dan static params sesuai docs terpasang. Build webpack disengaja; Turbopack alternative tidak diuji, BLOCKED untuk klaim kompatibilitasnya.

F05 Server Action limit dan F06 metadata route cache. Root error tidak menangkap seluruh root layout failure; global-error tidak ada, INFO future recovery requirement bila root failure terukur. Tidak ada alasan memigrasikan architecture hanya karena filesystem digunakan pada single process.

## 30. React Audit

State/events berada pada client components; source reads/auth di server. Hooks lint lulus. F10 dialog semantics dan F13 empty state adalah bug spesifik. GSAP/Motion share visual responsibilities; actual conflicting transform paths harus diprofile sebelum refactor.

Review handler awaits email notification walaupun komentar menyebut background; pengiriman SMTP lambat dapat menahan pending state. Nodemailer default timeout bukan tanpa batas; custom shorter timeout/queue perlu didasarkan UX SLA, NEEDS_RUNTIME_VERIFICATION.

## 31. TypeScript Audit

strict true, moduleResolution bundler, noEmit, React JSX. Final typecheck lulus. F07 menunjukkan static type bukan runtime validator. File JSON reader memakai cast/shape minimal; F02 mencakup schema read.

Tidak direkomendasikan declare module lucide-react untuk membungkam TS7016 transient; declaration package akhirnya ada dan final compile lulus.

## 32. Tailwind Audit

V4 tokens/utilities compile lulus; logical container sizing tersedia. F11 animation overscale di luar clip dan F12 token contrast wajib ditarget. Arbitrary classes tidak otomatis bug. Class migration/border radius redesign tidak dibutuhkan dalam audit ini.

## 33. CMS Audit

Admin gates pada list/new/edit dan semua save/toggle/delete/upload actions. Filesystem write memakai temp+rename dan lock in-process; atomic rename tidak cukup untuk multi-process RMW. No evidence deployment multi-process; topology/persistent volumes/backup safety BLOCKED.

Verified F02 data read failure, F05 upload transport, F06 sitemap invalidation, F07 full schema, F08 rename, F09 resurrection. Admin user session tidak digunakan untuk mutation HTTP, jadi operator UI autosave/preview/undo/link insertion tests tetap BLOCKED.

## 34. Form Audit

Public forms: survey wizard dan review modal; client-only knowledge search; public admin login. Survey RHF+shared Zod validates both sides, consent enforced server. Review validates server strings/rating/email. No public file upload; photos requested later via WA.

F01 anti-abuse, F13 empty trigger, F15 privacy, F17 dates, F19 caps. Survey success without webhook intentionally offers WhatsApp; business acceptance when both verified WhatsApp and webhook absent NEEDS_RUNTIME_VERIFICATION. Jangan mengklaim lead persisted saat action hanya mengembalikan success tanpa outbound channel.

## 35. Input Validation Audit

Schema enum fields membuat panjang pilihan finite. Survey server parses FormData and returns field errors. Phone normalizes digits8..15 tetapi raw formatted string tidak diberi char cap. Review email memakai Zod email tanpa explicit max254; invalid field type return controlled error di Zod.

Admin login uses FormData casts and synchronous crypto, raw username/password caps/type guards absent (F19); rotating arbitrary username+IP still incurs password hashing. Tidak dilakukan load/DoS test. F07 juga harus reject malformed authenticated payload dengan controlled errors.

## 36. Input Character Limit Matrix

Client Limit memisahkan schema RHF dari HTML maxLength. Semua public input tercatat; admin CMS fields ditambah karena merupakan server mutation boundary. Proposed limits adalah starting contract yang perlu dibandingkan konten/aturan bisnis sebelum implementasi.

| Field | Location | Current Client Limit | Current Server Limit | Recommended Limit | Validation | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| projectType | survey | Enum RHF | Enum8 choices | Same | z.enum | Low |
| projectTypeOther | survey | RHF120; HTML none | 120 | 120 | Required when Other | Low |
| province | survey | Enum RHF | Enum38 choices | Same | z.enum | Low |
| city | survey | RHF80; HTML none | 80 | 80 | trim,min2,max80 | Low |
| district | survey | RHF80; HTML none | 80 optional | 80 | trim,max80 | Low |
| address | survey | RHF250; HTML none | 250 | 250 | trim,min10,max250 | Low |
| propertyType | survey | Enum RHF | Enum7 | Same | z.enum | Low |
| targetTimeline | survey | Enum RHF | Enum4 | Same | z.enum | Low |
| budgetRange | survey | Enum optional | Enum6 optional | Same | z.enum | Low |
| notes | survey | RHF1000; HTML none | 1000 optional | 1000 | trim,max1000 | Low |
| name | survey | RHF80; HTML none | 80 | 80 | trim,min2,max80 | Low |
| whatsapp | survey | RHF normalized8..15 digits | normalized8..15; raw no cap | raw40;digits<=15 | char allowlist+digit count | F19 |
| emergencyPhone | survey | Same optional | Same optional | raw40;digits<=15 | optional phone refine | F19 |
| surveyDate | survey | native date + shared regex | 10-char shape, future string | 10,calendar-valid | F17 | Wrong schedule |
| surveyTime | survey | native time | valid HH:mm | 5 | regex HH:mm | Low |
| consent | survey | checkbox/RHF boolean | true required | Boolean true | refine | Low |
| name | review | Required; no maxLength | 80 | 80 | min2,max80 | F19 |
| address | review | Required; no maxLength | 100 | 100 | min2,max100 | F19 |
| email | review | type=email; no maxLength | Zod email; no explicit cap | 254 | email+max254 | F19 |
| rating | review | UI1..5 | int1..5 | Same | coerce int | Low; keyboard test |
| description | review | Required; no maxLength | 1000 | 1000 | min5,max1000 | F19 |
| query | /knowledge search | None | N/A,client-only | 200 | local substring | Ergonomics only |
| username | /admin/login public | Required,no cap | no explicit cap/type schema | 80 | type,string,max | F19 |
| password | /admin/login public | Required,no cap | no explicit cap | 1024 bytes, no silent trim | type,bytes length | Crypto cost/F19 |
| title / seoTitle | CMS auth | no maxLength | no max | 200 each | F07 schema | Broken metadata/size |
| slug | CMS auth | no maxLength | normalize,no cap | 120 | valid nonempty normalized | F07/F08 |
| category | CMS auth | no cap | required trim | 80 | schema | F07 |
| summary | CMS auth | no cap | required trim | 500 | schema | F07 |
| readingMinutes | CMS auth | number field | Number(value)||5 | int1..120 | schema | F07 |
| status | CMS auth | radios | not enum-validated | aktif/tidak_aktif | enum | F07 |
| publishedAt / updatedAt | CMS payload | generated/client data | unchecked | YYYY-MM-DD valid | calendar schema | F07 |
| coverImage / block.src / video.url | CMS auth | URL/file UI | unchecked strings except upload | URL<=2048,approved schemes/hosts | F07 | Third-party fetch/content |
| coverImageAlt / caption / alt | CMS auth | no cap | no cap | 500 | string schema | F07 |
| body text / heading / callout | CMS auth | no cap | body.length only | <=200 blocks,text<=20000/block | discriminated union | F07 |
| list items | CMS auth | no cap | unchecked nested array | <=200 items,<=2000/item | schema | F07 |
| image file | CMS upload | JPG/PNG<=10MB | JPG/PNG<=10MB;framework1MB | align10MB+multipart transport | File+Sharp decode | F05 |
| route slug params | public details | N/A URL | portfolio static whitelist;others lookup | bounded by canonical schema;404 unknown | lookup/notFound | Missing path smoke |

## 37. API / Server Action Audit

No conventional public /api routes found. GET /llms.txt is static informational handler. Mutation surfaces: submitSurvey, submitReviewAction, login/logoutAdminAction, save/toggle/delete/uploadArticleImageAction.

Every admin content mutation checks isAdminAuthenticated server-side. Server Actions use Next same-origin validation; no allowedOrigins wildcard configured. CSRF absence from handwritten code **FALSE_POSITIVE** without checking framework protection. Cross-origin POST regression behind actual proxy still BLOCKED.

Response messages mostly controlled; article save can return underlying fs error string through saveArticle error, visible only authenticated operator. Avoid exposing infrastructure paths unnecessarily during F02 error redesign.

## 38. Security Audit

Top action: F01 anti-abuse and F02 data integrity. Public inputs reach disk/email/webhook after validation; validation is not quota/moderation. F03 email HTML injection is separate from DOM XSS. F04 local headers, F07 authenticated payload validity and F15 disclosure are open.

TLS termination/HTTP redirect, CDN request size, trusted proxy IP rewrite, backup encryption/access, file permission hardening, secret storage/rotation and logging retention **BLOCKED**. No secrets are reproduced in this artifact.

## 39. OWASP Mapping

Mapping uses risk families rather than claiming a version-specific compliance certification.

| OWASP Risk Family | SAVOY Surface | Evidence / Status |
| --- | --- | --- |
| Broken Access Control | Admin pages/actions | Gates present; authenticated HTTP tests BLOCKED |
| Cryptographic Failures | Auth HMAC/SMTP/webhook | HMAC and HTTPS webhook present; production TLS/secrets BLOCKED |
| Injection | HTML email | F03 CONFIRMED; DOM script execution not proven |
| Insecure Design | Public write/notification | F01 CONFIRMED abuse control absent; F18 PROBABLE duplicate event |
| Security Misconfiguration | Headers/upload cap | F04,F05; edge override BLOCKED |
| Vulnerable/Outdated Components | npm tree | Known advisory count0 snapshot; no guarantee future advisories |
| Authentication Failures | Single admin login/session | 3 attempts/10min IP+normalized username limiter; actual proxy/process tests BLOCKED |
| Data/Software Integrity Failures | JSON CMS/reviews | F02,F07,F09; package integrity lock present |
| Logging/Monitoring Failures | Review fallback/logs | F15 PII logging; alerting pipeline BLOCKED |
| SSRF / outbound trust | Operator webhook config | URL env-only,HTTPS enforced; user cannot select receiver. Redirect/private-host allowlist NEEDS_RUNTIME_VERIFICATION |

## 40. HTTP Security Header Audit

| Header | Current | Recommended | Status | Reason |
| --- | --- | --- | --- | --- |
| Content-Security-Policy | Absent local /,/admin | Report-only rollout,then tested hash/nonce policy | CONFIRMED local;edge BLOCKED | F04 defense in depth |
| X-Frame-Options / frame-ancestors | Absent local | DENY / 'none' if no embed requirement | CONFIRMED local;edge BLOCKED | Admin clickjacking |
| X-Content-Type-Options | Absent local | nosniff | CONFIRMED local;edge BLOCKED | Type hardening |
| Referrer-Policy | Absent local | strict-origin-when-cross-origin | CONFIRMED local;edge BLOCKED | Referrer minimization |
| Permissions-Policy | Absent local | Disable unneeded camera,microphone,geolocation | CONFIRMED local;edge BLOCKED | No app requirement observed |
| Strict-Transport-Security | Not verified on domain | Decide only after TLS/all-host verification | BLOCKED | Local HTTP cannot establish safe HSTS rollout |
| X-Powered-By | Disabled config | Keep disabled | CONFIRMED config | poweredByHeader false |
| Cache-Control admin | no-store,must-revalidate,no-cache,max-age0,private | Keep private/no-store | CONFIRMED HTTP | Protected response not public-cached |
| Cache-Control /brand,/v | 1year immutable config | Content version URL or revalidation | CONFIRMED config | F16 mutable path |
| Access-Control-Allow-Origin | No broad app policy found | Same-origin actions | CONFIRMED config;edge BLOCKED | No public cross-origin mutation requirement |

## 41. XSS / Injection Audit

All observed dangerouslySetInnerHTML application uses JSON-LD helper encoding <; automatic finding 'raw HTML XSS' **FALSE_POSITIVE** there. FormattedText renders React nodes and checks href protocols through isSafeHref; javascript URL filtered. CMS images render img/next Image, not raw HTML.

F03 template email bypasses React auto-escaping. Uploaded JPG/PNG are decoded/reencoded through Sharp; forged MIME decode errors caught. SQL/LDAP/shell user-input execution NOT_APPLICABLE in reviewed app surfaces. Arbitrary remote image URLs are content/privacy/network trust, not automatically SSRF (browser fetch) or script XSS.

## 42. Authentication & Authorization Audit

Single configured username, scrypt password hash preferred, plaintext fallback accepted by code, HMAC session secret >=32chars, timestamp validity bounded against future, lifetime7days. Cookie httpOnly, sameSite lax, secure in production, path /. Missing config denies admin rather than public fallback.

IP and normalized username limiter both checked; forged IP alone does not bypass known username cap. Counters disk-persist with debounce; multi-process lost update/fail-open corrupt state and proxy trust deployment tests BLOCKED. Global account lockout allows targeted 10-minute lockout as tradeoff; no DoS testing performed.

Logout deletes browser cookie; stateless copied session remains valid until expiry/ADMIN_SECRET rotation. Password change alone does not revoke tokens. INFO operational policy: rotate ADMIN_SECRET for incident/session invalidation. Do not claim future-token forgery fixed by security because secret compromised remains compromised.

## 43. Environment & Secret Audit

Only .env.example tracked under env inventory; .gitignore ignores other .env files, allows template. Template contains names/blank values. No auth secret value printed or inserted in report. No comprehensive git-history credential forensic scan performed, BLOCKED.

F20 missing SMTP names. Public business values are build-time env; changes require appropriate rebuild for statically emitted UI/metadata. Invalid NEXT_PUBLIC_SITE_URL can throw config startup; no invalid actual configuration observed, so deployment validation task, not additional confirmed bug.

Business contact/address/maps/hours/founded year are owner-verification requirements. Never fill blanks with guessed SAVOY facts.

## 44. Dependency / Supply Chain Audit

npm audit registry snapshot:0 info/low/moderate/high/critical. Lock manifest dependency map matches package.json. Below versions resolved from package-lock (not caret ranges).

| Package | Version | Client/Server | Used? | Security Risk | Bundle Risk | Action |
| --- | --- | --- | --- | --- | --- | --- |
| @gsap/react | 2.1.2 | Client | Yes | No known advisory snapshot | Shared motion | Keep;license verify |
| @hookform/resolvers | 5.9.1 | Client | Yes | None known | Form validation | Keep |
| @radix-ui/react-accordion | 1.2.20 | Client | Yes | None known | Scoped UI | Keep |
| @radix-ui/react-dialog | 1.1.23 | Client | Yes | None known | Scoped UI | Reuse for F10 |
| clsx | 2.1.1 | Both | Yes | None known | Small | Keep |
| embla-carousel-react | 8.6.0 | Client | Yes gallery/testimonials | None known | Scoped | Profile only |
| gsap | 3.15.0 | Client | Yes | None known | Global import | F22 |
| lenis | 1.3.26 | Client | Yes | None known | Global scroll | F22 |
| lucide-react | 1.41.0 | Both/rendered UI | Yes | None known | Tree-shaking budget | Final types passed |
| motion | 13.2.0 | Client | Yes | None known | Multiple components | F22 |
| next | 16.3.4 | Both | Yes | None known | Framework | Keep docs version aligned |
| nodemailer | 10.0.3 | Server | Yes | None known;F03 app sink | Not client bundle | F03,F20 |
| react/react-dom | 19.2.8 | Both | Yes | None known | Framework | Keep aligned |
| react-hook-form | 7.87.0 | Client | Yes | None known | Survey | Keep |
| sharp | 0.35.4 | Build/server | Yes | None known | Native deployment | Verify host binary |
| tailwind-merge | 3.6.0 | Both | Yes | None known | Small shared | Keep |
| three | 0.186.0 | Client lazy | Yes | None known | Large optional scene | F22 |
| zod | 4.5.4 | Both | Yes | None known | Shared schema | Extend F07/F17 |
| eslint/eslint-config-next | 9.39.5 /16.3.4 | Dev | Yes | Install warns ESLint9 unsupported | No public runtime | Maintenance verification |
| TypeScript | 5.9.3 | Dev | Yes | No audit advisory | No client runtime | Keep strict |
| tailwindcss/@tailwindcss/postcss | 4.3.3 /4.3.3 | Build | Yes | No audit advisory | CSS output | Keep |
| @types/node | 20.19.43 | Dev | Yes | None known | Type-only | Align target Node policy |
| @types/react/@types/react-dom | 19.2.18 /19.2.7 | Dev | Yes | None known | Type-only | Keep aligned |
| @types/nodemailer | 8.0.1 | Dev | Yes | None known | Type-only | Verify transport APIs used against Nodemailer10 |
| @types/three | 0.186.0 | Dev | Yes | None known | Type-only | Keep aligned |
| heic-convert/libheif-js | 2.1.0 /1.19.8 | Dev image tooling | Pipeline requirement | No audit advisory;LGPL notice | Not client runtime | License/distribution verify |

License metadata: GSAP/custom standard license, Sharp/libvips LGPL platform packages, libheif LGPL, axe/LightningCSS MPL, caniuse CC-BY and argparse Python-2.0. This inventory is not legal conclusion; obligations depend on actual deployed/distributed artifacts. No automatic 'GPL contamination' claim or upgrade required. Optional platform variants are not all installed in one deployment.

Install-time script/native binaries and target Linux/glibc compatibility require controlled clean install; BLOCKED. npm ci EPERM was local install environment issue, not CVE. No audit fix/upgrade performed.

## 45. Email / Webhook Audit

F03 encoding, F18 idempotency and F20 contract. SMTP transport only when host/user/pass provided; review save success intentionally survives notification failure. Notification is awaited (not detached job); timing and user message fidelity need staging verification.

Webhook env-only receiver, HTTPS guard, optional HMAC signature,8s per attempt,3 attempts+0.5/1s backoff (~25.5s worst timeout). Redirect final URL policy and receiver secret verification unknown. Receiver outbound delivery tests BLOCKED; no real mail/webhook sent by audit.

## 46. Cache Audit

Static/SSG marketing and article pages; explicit invalidation for knowledge/home/admin after mutations; F06 excludes sitemap. Admin response private/no-store proven local. F16 immutable mutable asset risk. HTTP sitemap max-age0 does not prove the underlying generated body recomputes; build cache must also be invalidated.

CDN rules/stale purges/static file serving for uploads created after startup **BLOCKED**. New public upload URLs during next start must be tested on actual hosting; local code write alone is not evidence public server will expose runtime-added assets.

## 47. Production Configuration Audit

Build script generates variants before next build webpack; start next start. poweredByHeader false, allowedDevOrigins only dev LAN entries; no evidence these broaden production CORS. Config derives canonical host from same env as UI. Env business placeholders respected unless F14 visibility bug.

No verified deploy pipeline, persistent runtime directories, process supervision, backup, permissions, runtime upload static serving, Node LTS target, alerting or CDN configuration available. All are BLOCKED readiness evidence, not assumed failures. Do not deploy a fresh source checkout over runtime content without a persistence/backup plan.

## 48. Runtime Bug Audit

No uncaught page errors in sampled route/viewport browser run. Concrete failures: F10 keyboard background focus, F11 overflow, F12 contrast, F13 missing review trigger. Source harness confirms CMS/data/schema bugs without production mutation.

Missing /knowledge path gives 200 plus noindex (Next streaming behavior), not a confirmed SEO bug. Unauthenticated /admin/articles browser lands login UI with noindex and private/no-store; HTTP client redirect-follow result200 is not evidence auth bypass.

## 49. Error Handling Audit

error.tsx gives reset/contact and digest without raw stack. not-found recovery navigation exists. Form action returns field errors. F02 swallowed filesystem/JSON errors are the important data handling bug.

Root layout failure coverage/global-error, chunk-load failures, offline upload, Slow SMTP, missing Sharp binary and invalid deployment env need regression fixtures. Logging/alert routing BLOCKED; production client errors are not sent to analytics because dispatcher is unset.

## 50. Dead Code / Technical Debt

### SAV-021 - Tidak ada test suite atau CI quality gate dalam repository yang diinventaris

- **ID:** SAV-021
- **Status:** CONFIRMED
- **Severity:** Info
- **Priority:** INFO
- **Category:** Verification / technical debt
- **Location:** `package.json:5; repository file inventory`
- **Evidence:** Scripts hanya dev/build/start/lint/typecheck/image/admin tools; inventory tidak menemukan test/spec suite atau .github workflow.
- **Reproduction:** Periksa package scripts dan daftar tracked files; scanner pattern test juga cocok filename testimonials sehingga hasil itu bukan test suite.
- **Current Behavior:** Gate dapat dijalankan manual, regressions CMS/SEO/focus tidak otomatis diuji.
- **Expected Behavior:** Suite fokus pada perilaku berisiko yang telah ditemukan.
- **Root Cause:** Belum ada infrastruktur regression test yang terlihat.
- **Impact:** Perbaikan F01..F20 rentan regresi; ini catatan INFO, bukan alasan refactor seluruh repo.
- **Recommended Fix:** Tambah tests perilaku saat fase IMPLEMENT FIX.
- **Suggested Implementation:** Mulai unit isolated storage/schema, production smoke sitemap, dan Playwright keyboard/viewport. CI gunakan npm ci lalu lint/typecheck/build/test pada clean supported Node. Jangan menulis snapshot yang hanya mencerminkan markup.
- **Files To Modify:** package.json, test files dan CI workflow pada fase implementasi
- **Verification:** Pipeline clean run; fixture gagal pada bug lama dan lulus setelah fix.
- **Regression Risk:** Low: penambahan tooling harus tetap kecil.
- **References:** Repository scripts/inventory.

### SAV-022 - Animasi global dan Three.js perlu budget terukur sebelum optimasi

- **ID:** SAV-022
- **Status:** CONFIRMED
- **Severity:** Info
- **Priority:** INFO
- **Category:** Performance / measurement
- **Location:** `src/components/motion/smooth-scroll.tsx:5; src/components/motion/use-wireframe-scene.ts:74; .next/static/chunks`
- **Evidence:** Root layout memuat SmoothScroll/GSAP pada seluruh route; Three diimport dinamis ketika section dekat viewport. Cold homepage JS encoded 385705 bytes (390) /395453 (1440), local no-throttle.
- **Reproduction:** Cold Chromium context, production /, Resource Timing; scroll 30x800px memount dua canvas, brokenImages kosong.
- **Current Behavior:** Budget JS dan offscreen GPU behavior sudah ada; dampak INP device lemah belum diukur.
- **Expected Behavior:** Budget awal/dynamic dan CPU/GPU dibuktikan pada device target.
- **Root Cause:** Tidak ada field/RUM performance evidence dalam audit ini.
- **Impact:** Potensi biaya CPU/network; tidak ada bukti bahwa mengganti animation library diperlukan.
- **Recommended Fix:** Profiling sebelum perubahan arsitektur.
- **Suggested Implementation:** Catat initial JS per route, lazy Three chunk dan long tasks pada Android kelas menengah dengan 4G/CPU slowdown; ukur route non-animated. Hanya split global GSAP bila profile menunjukkan biaya berarti; pertahankan guards/reduced-motion/dispose.
- **Files To Modify:** Tidak ada perubahan wajib; bila terukur: root motion boundary dan use-wireframe-scene
- **Verification:** Field LCP/INP/CLS p75 dan production throttled runs; check frame/disposal saat navigate/reduced-motion.
- **Regression Risk:** Medium untuk refactor yang belum dibutuhkan; tidak direkomendasikan blind refactor.
- **References:** Production Resource Timing; source lazy/disposal guards.

Additional non-findings: brand plate has no src reference in sweep but no proof it is unnecessary for business assets; do not remove. Comments in robots/Next image loader/Hostinger references lag implementation and should be updated only when related fixes are applied. File-lock map uses two stable data file keys, so growth is bounded here; generic unbounded-map warning FALSE_POSITIVE for that caller set.

## 51. Complete Bug Inventory

| ID | Type | Severity | Priority | Route | File | Problem | Root Cause | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SAV-001 | Security / abuse | High | P1 | Related public/admin surfaces | src/app/actions/submit-review.ts:39; src/app/actions/submit-survey.ts:29; src/lib/reviews.ts:96 | Form publik tidak memiliki pembatasan kiriman | Kontrol anti-abuse hanya dipasang pada login admin. | Tambahkan limiter persisten untuk kedua action dan alur review pending. |
| SAV-002 | Data integrity | High | P1 | Related public/admin surfaces | src/lib/reviews.ts:19; src/lib/articles.ts:14 | Read error diperlakukan sebagai data kosong lalu ditimpa | Tidak membedakan ENOENT, invalid JSON, invalid shape dan kegagalan akses. | Fail closed saat membaca data untuk mutation, log error dan lindungi salinan pemulihan. |
| SAV-003 | Injection / email | Medium | P2 | Related public/admin surfaces | src/lib/email.ts:41 | Konten pengulas diinterpolasi tanpa HTML encoding | Template string tidak memiliki auto-escaping React. | Encode semua nilai dinamis pada konteks HTML. |
| SAV-004 | HTTP headers | Medium | P2 | Related public/admin surfaces | next.config.mjs:76 | Baseline header keamanan absen pada server production lokal | Tidak ada konfigurasi header global dalam repository. | Tambahkan nosniff, referrer dan framing policy; rollout CSP sesuai rendering Next. |
| SAV-005 | CMS / uploads | Medium | P2 | Related public/admin surfaces | src/components/admin/article-editor.tsx:93; src/app/actions/admin-articles.ts:143; next.config.mjs | Batas upload 10 MB bertentangan dengan limit Server Action 1 MB | Batas file diterapkan setelah parsing body yang limitnya lebih kecil. | Selaraskan limit; rekomendasi awal 10MB file dengan sedikit ruang multipart. |
| SAV-006 | SEO / cache | Medium | P2 | /sitemap.xml | src/app/sitemap.ts:40; src/app/actions/admin-articles.ts:61 | Mutation artikel tidak menginvalidasi sitemap | Invalidasi hanya menarget halaman, bukan metadata route yang membaca file sendiri. | Invalidasi /sitemap.xml pada semua mutation artikel. |
| SAV-007 | CMS / runtime validation | Medium | P2 | /admin/articles | src/app/actions/admin-articles.ts:15 | Action simpan artikel memakai TypeScript sebagai kontrak runtime | KnowledgeArticle hanya tipe compile-time; action boundary mempercayai struktur client. | Buat Zod schema artikel dengan discriminated union blocks. |
| SAV-008 | CMS / routing | Medium | P2 | /admin/articles | src/components/admin/article-editor.tsx:256; src/lib/articles.ts:140 | Mengubah slug saat edit membuat artikel baru dan menyisakan URL lama | Identitas record artikel sama dengan slug yang boleh diubah UI. | Untuk perubahan minimal, kunci slug pada mode edit; jika rename dibutuhkan, dukung transaksi rename. |
| SAV-009 | CMS / deletion | Medium | P2 | /admin/articles | src/lib/articles.ts:96; src/lib/articles.ts:221 | Menghapus override baseline menerbitkan kembali artikel baseline | Larangan delete baseline hanya berlaku saat belum ada custom record. | Tolak permanent delete untuk slug yang juga ada dalam baseline atau simpan tombstone. |
| SAV-010 | Accessibility / dialogs | Medium | P2 | Related public/admin surfaces | src/components/ui/image-lightbox.tsx:37; src/components/forms/review-form.tsx:40 | Lightbox dan modal ulasan tidak mengelola fokus modal | Dialog dibuat manual meski Radix Dialog tersedia. | Gunakan Radix Dialog sebagaimana mobile-menu. |
| SAV-011 | Responsive / animation | Medium | P2 | /,/about | src/app/globals.css:570; src/components/sections/materials.tsx:50 | Reveal gambar menyebabkan overflow horizontal pada 768px pointer fine | Overscale diterapkan pada grid wrapper yang tidak memiliki clip ancestor. | Clip overscale pada pembungkus foto yang stabil. |
| SAV-012 | Accessibility / contrast | Medium | P2 | Related public/admin surfaces | src/components/ui/button.tsx:33; src/app/globals.css:88; src/components/portfolio/category-filter.tsx:63 | Teks putih tombol sage dan count kategori tidak memenuhi kontras AA | Komentar button menyatakan sage cukup untuk putih, tetapi rasio hasil hitung bertentangan; token count dipakai di background abu-abu. | Pakai teks gelap pada sage atau gelapkan semua gradient stops; gelapkan count kategori. |
| SAV-013 | Functional / review | Medium | P2 | / | src/components/sections/testimonials.tsx:38; src/components/sections/testimonials-motion.tsx:84 | Pengunjung tidak dapat mengirim ulasan pertama | Trigger input bergantung pada adanya konten yang justru dibuat oleh input itu. | Pisahkan trigger ReviewForm dari kondisi daftar testimonial. |
| SAV-014 | Business data / testimonials | Medium | P2 | / | src/data/testimonials.ts:55 | Filtering testimoni dapat menampilkan quote placeholder dalam production | Visibility flag/every digunakan sebagai pengganti filter individual. | Filter isPlaceholder per testimonial di production. |
| SAV-015 | Privacy / public content | Medium | P2 | /privacy | src/app/privacy/page.tsx:55; src/app/actions/submit-review.ts:67; src/lib/email.ts:110 | Kebijakan privasi tidak mencakup alur ulasan yang ada | Alur review ditambahkan tanpa pembaruan privacy contract. | Perbarui disclosure dan consent publikasi review secara konkret. |
| SAV-016 | Cache / asset freshness | Medium | P2 | Related public/admin surfaces | next.config.mjs:79; src/lib/image-ladder.mjs:58 | URL aset mutable diberi immutable selama satu tahun | Cache policy berbasis direktori sementara file names tidak content-addressed. | Version/hash URL variant dan brand atau gunakan revalidation untuk path mutable. |
| SAV-017 | Input validation / survey | Medium | P2 | /survey | src/lib/schemas/survey.ts:192 | Tanggal kalender tidak valid diterima schema survey | Regex memeriksa bentuk, bukan validitas kalender. | Validate calendar round-trip dan horizon booking yang disetujui. |
| SAV-018 | Webhook / idempotency | Medium | P2 | Related public/admin surfaces | src/lib/webhook.ts:56; src/app/actions/submit-survey.ts:68 | Retry webhook dapat menggandakan event di penerima | Retry at-least-once tanpa kontrak idempotency. | Gunakan ID event stabil dan kontrak receiver dedup. |
| SAV-019 | Forms / input ergonomics | Low | P3 | Related public/admin surfaces | src/components/forms/review-form.tsx:207; src/components/forms/survey-form.tsx:368; src/components/admin/login-form.tsx:45 | Batas karakter schema tidak dicerminkan pada kontrol input | Field caps hanya dipasang pada schema tertentu. | Tambah maxLength dan counter hanya bila bermanfaat; raw server caps explicit. |
| SAV-020 | Environment / notifications | Low | P3 | / review notification | .env.example; src/lib/email.ts:5 | Kontrak SMTP tidak dicantumkan dalam env template | Environment contract tidak diperbarui bersama fitur review. | Tambahkan variabel SMTP optional dan startup readiness check. |
| SAV-021 | Verification / technical debt | Info | INFO | Related public/admin surfaces | package.json:5; repository file inventory | Tidak ada test suite atau CI quality gate dalam repository yang diinventaris | Belum ada infrastruktur regression test yang terlihat. | Tambah tests perilaku saat fase IMPLEMENT FIX. |
| SAV-022 | Performance / measurement | Info | INFO | Related public/admin surfaces | src/components/motion/smooth-scroll.tsx:5; src/components/motion/use-wireframe-scene.ts:74; .next/static/chunks | Animasi global dan Three.js perlu budget terukur sebelum optimasi | Tidak ada field/RUM performance evidence dalam audit ini. | Profiling sebelum perubahan arsitektur. |

## 52. Remediation Roadmap

| Phase | Scope | IDs | Dependencies | Exit Criteria |
| --- | --- | --- | --- | --- |
| A Immediate Security / Production Blockers | Anti-abuse,write safety,output encoding,headers | 001,002,003,004 | Deployment proxy/storage facts | P1 closed;no write on storage error;encoding+header tests |
| B SEO / Indexability | CMS valid metadata,sitemap freshness,stable routes | 007,008,009,006,014 | Storage schema/identity policy | Publish/unpublish/delete updates detail/list/sitemap without phantom baseline or sample claims |
| C Functional / Responsive | Upload transport,modals,empty trigger,privacy,tablet,contrast | 005,010,013,015,011,012,017,019 | Auth staging,owner policy | Upload sizes,keyboard/viewport and field boundary fixtures pass |
| D Performance | Versioned cache,webhook dedup,actual device profiling | 016,018,022 | Pipeline/receiver contract | Fresh assets after deploy;single event;measured CWV/device evidence |
| E Code Quality | Env contract and tests/tooling | 020,021 | All fixes | Clean reproducible install and regression suite |

Fase adalah kelompok pengerjaan; risiko tiap finding tetap menentukan urutan. F003/F004 dapat dikerjakan paralel dengan storage setelah approval implementasi, bukan ditunda hanya karena P2.

## 53. Recommended Fix Order

1. F001 anti-abuse/moderasi dan F002 mutation read safety.
2. F003 email encoding dan F004 framing/nosniff/report-only CSP.
3. F007 schema sebagai fondasi F008/F009, lalu F006 sitemap.
4. F005 upload cap dan bukti persistent storage/runtime file serving.
5. F010 focus,F013 trigger,F014 placeholder filter,F015 disclosure.
6. F011 tablet,F012 contrast,F017 tanggal,F019 batas input.
7. F016 cache freshness,F018 webhook dedup,F020 SMTP contract.
8. F021 regression pipeline,F022 profiling; tests penting dibuat bersama tiap perbaikan, bukan menunggu akhir fase.

## 54. Verification Plan

Release gate dalam clean checkout: npm ci,npm run lint,npm run typecheck,npm run build,npm start. Gunakan Node target yang didukung deployment. EPERM saat audit perlu diulang pada lingkungan fresh; jangan menandai clean install lulus karena fallback install.

Staging owner-controlled: credentials/receiver config terverifikasi; fixtures test ditulis ke storage khusus, bukan SAVOY real records. Capture HTTP headers di edge final, cache behavior sebelum/setelah deployment, backup restore dan process topology.

Automasi: full 114 sitemap metadata checks (refresh count setelah CMS berubah), valid/missing route HTTP+noindex, publish/toggle/delete cache trace, multipart request limits, schema malformed types, storage failures, keyboard modals/menu, viewport widths dan touch/reduced-motion.

Performance: cold/warm,4G+CPU slowdown,multiple runs; real field data p75 untuk LCP/INP/CLS. Local timings di laporan tidak cukup untuk approval.

## 55. Regression Test Plan

| Test | Meaningful Assertion |
| --- | --- |
| Corrupt JSON/EACCES/non-array | Mutation rejected;existing bytes unchanged |
| Concurrent same-process saves | Both fixture records survive;queue recovers after rejection |
| Baseline overlay delete | Inactive article never resurrects |
| Slug edit | No duplicate old record;collision rejected;redirect policy if rename enabled |
| Invalid CMS payload | Reject invalid date,status,block shape,type,URL and caps before disk write |
| Sitemap mutation | Active set and dates match CMS after next GET without rebuild |
| Upload boundaries | 0.9/2/9.9MB accepted if policy10MB;>10MB rejected;fake/corrupt content rejected |
| Public submit limits | Over-quota has zero disk/email/webhook effects;pending review not public |
| Review privacy | Email absent HTML/RSC;publication consent text matches actual field destinations |
| Email encoding | Tags and entity characters appear literal in HTML mail |
| Retry timeout after commit | Receiver side effect exactly once via event ID dedup |
| Survey dates/phones | Calendar-valid/leap/timezone tests and raw length caps |
| Modal focus | Initial focus/trap/Escape/restore;background inert |
| Contrast | All primary gradient stops and category count>=4.5:1 |
| Tablet animation | scrollWidth<=innerWidth at768 fine/touch/reduced throughout reveal |
| Empty review dataset | Trigger exists;no placeholder quote rendered |
| Asset update | Deployment B bytes visible after deployment A cached |
| Auth | Every action rejects unauthenticated caller;cross-origin action blocked;private/no-store |
| Business data | No placeholder quote or invented business/schema fact production |
| Clean release | Install/lint/types/build/tests pass on actual supported host |

## 56. Production Readiness Checklist

| Requirement | Status |
| --- | --- |
| Source/config/routes inventoried | Done snapshot |
| Lint/typecheck/production build checked | PASS final |
| Clean npm ci | BLOCKED EPERM;fresh environment required |
| SEO metadata/robots/sitemap snapshot | PASS local;F006 freshness open |
| Canonical www redirect on final domain | BLOCKED |
| P1 anti-abuse/data safety | FAIL open |
| HTTP security baseline | FAIL local;edge BLOCKED |
| Public forms/input limits | Reviewed;F001/F017/F019 open |
| Authenticated CMS upload/mutations HTTP | BLOCKED;source harness reviewed |
| Runtime recovery/error states | PARTIAL |
| Mobile/tablet/desktop | PARTIAL;F011 open;all-state/real-device BLOCKED |
| Accessibility keyboard/contrast | FAIL F010/F012;screen reader BLOCKED |
| Known dependency advisories |0 snapshot;license/host compatibility review needed |
| CWV/device field evidence | BLOCKED |
| Email/webhook delivery/idempotency | BLOCKED receiver;F003/F018/F020 open |
| Persistent storage/backup/restore/process topology | BLOCKED |
| Remediation/regression plan | Done |
| Production source fix authorization | WAITING FOR IMPLEMENT FIX |

## 57. Final Conclusion

Audit menghasilkan 22 temuan prioritas dengan evidence dan strategi implementasi. Dua P1 menghalangi persetujuan production: public mutation tanpa kontrol abuse dan storage error yang dapat menyebabkan overwrite data lama. Build lulus dan SEO snapshot sehat, tetapi tidak menutup kedua risiko tersebut atau deployment checks yang BLOCKED.

Fase ini selesai sebagai dokumen analisis dengan batas bukti yang eksplisit. Tidak ada klaim seluruh aplikasi lolos production readiness atau seluruh checklist runtime telah diuji.

# Final Production Readiness

## Production Blockers

SAV-001 dan SAV-002 terbuka; clean install, persistence/backup deployment dan authenticated upload proof belum tersedia. Build failure awal berasal dari partial install dan sudah pulih pada final gates, bukan open source compilation blocker.

## Security Blockers

SAV-001 anti-abuse. SAV-003 dan SAV-004 harus ditutup untuk baseline release hardening; edge controls tidak diasumsikan ada. Runtime secret/proxy/TLS checks masih BLOCKED.

## SEO Blockers

Tidak ada P1 indexability terbukti pada snapshot. SAV-006 sitemap freshness dan SAV-007/008/009 mutation correctness harus diperbaiki sebelum CMS aktif di production. SAV-014 mencegah sample business claims.

## Performance Blockers

Tidak ada P1 performance terukur dari localhost. Field/device approval BLOCKED. SAV-016 asset freshness dan SAV-018 idempotency perlu kontrak yang benar; SAV-022 profiling sebelum optimasi besar.

## Responsive/UI Blockers

SAV-010 fokus modal,SAV-011 overflow pointer-fine768,SAV-012 contrast,SAV-013 review empty state. Real mobile/short landscape/all wizard/admin states belum lulus acceptance.

## Non-Blocking Improvements

SAV-019 limits UX,SAV-020 env contract,SAV-021 automated regression,SAV-022 measured budgets. Tidak ada rekomendasi redesign atau refactor menyeluruh tanpa kebutuhan yang terbukti.

## Recommended Implementation Order

1. Anti-abuse dan safe JSON mutations.
2. Email encoding,framing/security headers dan runtime payload schema.
3. CMS identity/deletion+sitemap invalidation.
4. Upload pipeline contract,persistent hosting proof dan privacy/moderation.
5. Modal focus,empty state,placeholder filtering,tablet overflow,contrast/date/input fixes.
6. Cache versioning,webhook dedup,SMTP contract dan performance profile.

## Required Regression Tests

Seluruh behavior assertions di bagian55; release mengharuskan final quality gates dan bukti deployment-specific blockers yang masih BLOCKED.

## Remaining Unknowns

Actual host/process/persistent directory policy; clean native install pada host; backup/restore; edge headers/TLS/canonical redirect; configured SMTP/receiver dedup; owner business facts; real screen-reader/device/CWV data; authenticated CMS flow; runtime-created upload static serving; cross-browser/ultrawide/full-state responsive checks.

**NEXT ACTION: WAITING FOR "IMPLEMENT FIX"**
