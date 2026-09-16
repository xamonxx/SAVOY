import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — Interior Design & Custom Furniture`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          color: "#1A1716",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 28,
              height: 28,
              transform: "rotate(45deg)",
              border: "3px solid #D79D00",
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "0.08em" }}>
            {site.name}
          </div>
        </div>
        <div
          style={{
            maxWidth: 890,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 72, lineHeight: 0.98, fontWeight: 600 }}>
            Interior yang dirancang untuk cara Anda hidup.
          </div>
          <div style={{ marginTop: 28, fontSize: 26, lineHeight: 1.45, color: "#4F3B38" }}>
            Quiet spatial luxury for interior design and custom furniture.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#6A605C" }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size
  );
}
