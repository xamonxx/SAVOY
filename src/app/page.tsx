import { SavoyHome } from "@/components/sections/savoy-home";
import { buildMetadata, jsonLdGraph, jsonLdScript, webPageJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Interior yang dirancang untuk cara Anda hidup",
  description: site.metaDescription,
  path: "/",
});

function homeJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/",
      name: `${site.name} — Interior Design & Custom Furniture`,
      description: site.metaDescription,
    })
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(homeJsonLd())}
      />
      <SavoyHome />
    </>
  );
}
