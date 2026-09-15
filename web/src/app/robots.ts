/**
 * robots.txt (docs/01 §1.6.4).
 * Facetas são controladas por canonical/noindex — NÃO por Disallow
 * (Disallow impediria o Google de ver a canonical).
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/facets";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/buscar", "/checkout", "/carrinho", "/conta", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
