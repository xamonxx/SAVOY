import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — Interior & Custom Furniture`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social card.
 *
 * Drawn with the brand tokens rather than a photograph so it stays legible at
 * thumbnail size and never misrepresents a specific project.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F4EE",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              backgroundColor: "#D79D00",
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#4F3B38",
            }}
          >
            {site.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#1A1716",
            }}
          >
            Ruang yang dirancang untuk cara Anda hidup.
          </div>
          <div style={{ fontSize: 28, color: "#4F3B38" }}>
            Interior &amp; custom furniture — dirancang, diproduksi, dan dipasang
            oleh satu tim.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: "#766B66",
          }}
        >
          <div
            style={{
              backgroundColor: "#D79D00",
              color: "#0B0A09",
              padding: "10px 22px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            {site.tagline}
          </div>
          <div>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size
  );
}
