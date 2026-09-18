/**
 * Next config as plain JS, not TypeScript, on purpose.
 *
 * Next compiles `next.config.ts` with the native SWC binary before it can read
 * it. Hostinger's shared hosting runs a glibc older than 2.29, so that binary
 * refuses to load, the TS compile step dies, and the build fails at
 * "Cannot find module ...next.config" before a single page is built. A plain
 * .mjs config needs no compile step, so it loads on any host.
 *
 * @type {import("next").NextConfig}
 */

import { IMAGE_LADDER } from "./src/lib/image-ladder.mjs";

/**
 * Canonical host, derived from the same env var the rest of the site uses so
 * the two can never disagree. Falls back to the production domain.
 *
 * `||`, not `??`: `.env.example`'s own header says "fill only verified
 * values", so every var ships blank by design, and a fresh `.env.local`
 * copied from it sets this to `""` rather than leaving it unset. `??` only
 * catches `null`/`undefined` and let `new URL("")` throw at startup; `||`
 * treats the blank string the same as never having set it at all.
 */
const canonicalHost = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://savoyinterior.com"
).host;

const nextConfig = {
  // Dev-only: allow the LAN and Tailscale hosts to request /_next assets and the
  // HMR socket, so the dev server can be opened from a phone on the same network.
  allowedDevOrigins: ["192.168.1.*", "192.168.1.110", "100.105.166.15"],
  experimental: {
    /*
      Server Actions cap their own request body well below 10MB by default
      (audit SAV-005). The article-image upload action already checks a 10MB
      file limit itself; without this, the framework rejected the multipart
      request before that check ever ran. 11mb, not 10mb, for multipart
      framing overhead around the raw file bytes.
    */
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  /*
    The built-in optimiser is off.

    All project photography is pre-optimised into /public by
    `npm run prepare:images`, and every width the site can ask for is then
    pre-rendered into /public/v by `npm run prepare:variants`, which the build
    runs. A custom loader turns a requested width into one of those files, so
    `sharp` never runs while a visitor is waiting.

    That is worth more here than the format negotiation it gives up. On this
    shared plan a cold /_next/image request measured 1.8-2.8s of TTFB, and the
    cache behind it lives in `.next/cache/images`, which every rebuild wipes -
    so the first visitor after each deploy paid it again. See the header of
    scripts/build-image-variants.mjs for why the output is WebP rather than
    AVIF.

    No remote hosts are allowed either way (pasal 31).
  */
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Split so the union is exactly IMAGE_LADDER: whatever Next puts in a
    // srcset, the build has written a file for.
    imageSizes: IMAGE_LADDER.slice(0, 1),
    deviceSizes: IMAGE_LADDER.slice(1),
  },
  poweredByHeader: false,

  /**
   * Fold www into the bare domain.
   *
   * Fold www into the canonical host so every public URL has one version.
   *
   * Skipped when the canonical host is already a www one, so this stays
   * correct if NEXT_PUBLIC_SITE_URL ever changes.
   */
  /**
   * Long-lived caching for the pre-built photography.
   *
   * Files under /brand are committed source assets. /v holds the widths derived
   * from them at build time.
   * `immutable` stops the revalidation round trip entirely.
   */
  async headers() {
    return [
      {
        source: "/:dir(brand|v)/:path*",
        headers: [
          {
            key: "Cache-Control",
            // Immutable filenames are name+width based, not content-hashed
            // (pasal 16 / audit SAV-016), so a replaced photo at the same
            // path can otherwise stay "current" for a returning visitor for
            // up to a year. A short revalidate window is the safe minimal
            // fix; a content-hash pipeline is the real long-term one.
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Baseline hardening (audit SAV-004). CSP ships report-only for now:
        // this app relies on RSC's own inline bootstrap script and embeds
        // YouTube videos in knowledge articles, and getting either wrong in
        // an *enforced* policy breaks hydration or a working embed outright.
        // Report-only lets real violations surface first.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Admin has no legitimate reason to be framed by anything.
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline'",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async redirects() {
    if (canonicalHost.startsWith("www.")) return [];

    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${canonicalHost}` }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
