import { ImageResponse } from "next/og";

import { articleSeoTitle } from "@/data/knowledge";
import { getArticleBySlug } from "@/lib/articles";
import { site } from "@/lib/site";

export const alt = `${site.name} — Artikel Edukasi`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-article social card (audit follow-up: sharing an article link showed
 * no preview at all on WhatsApp). The site's photography is `.webp`, and
 * Meta's link-preview crawler - which WhatsApp shares - has long had
 * unreliable WebP support for `og:image`; a failed fetch there can blank out
 * the whole card, not just the image. `ImageResponse` always renders PNG, so
 * routing every article through one sidesteps the format entirely instead of
 * pointing `og:image` at the raw cover photo.
 */
export default async function ArticleOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article ? articleSeoTitle(article) : site.name;
  const summary = article?.summary ?? site.description;
  const category = article?.category ?? site.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
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
              backgroundColor: "#9AB279",
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0F3C2C",
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
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 52,
              lineHeight: 1.15,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#333333",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.4, color: "#767676" }}>
            {summary}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: "#767676",
          }}
        >
          <div
            style={{
              backgroundColor: "#9AB279",
              color: "#1A1A1A",
              padding: "10px 22px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            {category}
          </div>
          <div>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size
  );
}
