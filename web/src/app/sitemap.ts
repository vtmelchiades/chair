/**
 * sitemap.xml gerado por código (docs/01 §1.6.4, docs/04 §4.1).
 * Inclui apenas URLs index,follow: categorias, whitelist de facetas,
 * ambientes, guias e PDPs. Nunca combinações facetadas fora da whitelist.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/facets";
import { products, chairCategories, partCategories, environments } from "@/lib/catalog";
import { guideList } from "@/lib/guides";

/** Whitelist de facetas indexáveis (docs/01 §1.6.3) — espelha lib/facets.ts. */
const INDEXABLE_FACETS = [
  "/pecas/pistoes-a-gas?classe=3",
  "/pecas/pistoes-a-gas?classe=2",
  "/pecas/rodizios?material=pu",
  "/pecas/rodizios?material=silicone",
  "/pecas/kits-atacado?kit=10x",
  "/pecas/mecanismos?mecanismo=relax",
  "/cadeiras/gamer?peso-suportado=150kg",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/cadeiras`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pecas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/ambientes`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/guias`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...chairCategories.map((c) => ({
      url: `${SITE_URL}/cadeiras/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...partCategories.map((c) => ({
      url: `${SITE_URL}/pecas/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...INDEXABLE_FACETS.map((f) => ({
      url: `${SITE_URL}${f}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...environments.map((e) => ({
      url: `${SITE_URL}/ambientes/${e.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...guideList.map((g) => ({
      url: `${SITE_URL}/guias/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produto/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.stockStatus === "out" ? 0.3 : 0.9,
    })),
  ];
}
