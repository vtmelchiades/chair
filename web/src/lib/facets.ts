/**
 * Facetas e canonicalização de URLs (docs/01 §1.6).
 * Regras: ordem alfabética de parâmetros, valores em slug lowercase sem
 * acento, parâmetro/valor desconhecido é descartado, canonical absoluta,
 * política de indexação por matriz de decisão.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chaircadeiras.com.br";

/** Domínio de valores por parâmetro (docs/01 §1.6.1). */
export const FACET_DOMAINS: Record<string, string[]> = {
  classe: ["2", "3"],
  carga: ["100kg", "120kg", "150kg"],
  "peso-suportado": ["100kg", "120kg", "150kg"],
  material: ["pu", "silicone", "nylon", "aco"],
  mecanismo: ["relax", "flange", "back-system"],
  "diametro-pino": ["10mm", "11mm"],
  kit: ["5x", "10x", "20x"],
  cor: ["preto", "cinza", "branco", "vermelho", "azul", "grafite"],
};

export const SORT_DOMAIN = ["relevancia", "preco-asc", "preco-desc", "novidades", "mais-vendidos"];

export type SortKey = (typeof SORT_DOMAIN)[number];

export interface ParsedParams {
  facets: Record<string, string[]>;
  sort: SortKey;
  page: number;
}

/** Whitelist de facetas indexáveis isoladas (docs/01 §1.6.3). */
const INDEXABLE_WHITELIST: { path: string; param: string; value: string }[] = [
  { path: "/pecas/pistoes-a-gas", param: "classe", value: "3" },
  { path: "/pecas/pistoes-a-gas", param: "classe", value: "2" },
  { path: "/pecas/rodizios", param: "material", value: "pu" },
  { path: "/pecas/rodizios", param: "material", value: "silicone" },
  { path: "/pecas/kits-atacado", param: "kit", value: "10x" },
  { path: "/pecas/mecanismos", param: "mecanismo", value: "relax" },
  { path: "/cadeiras/gamer", param: "peso-suportado", value: "150kg" },
];

export function slugifyParam(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Parse + validação de searchParams. Descarta parâmetros desconhecidos e
 * valores fora do domínio. Múltiplos valores por faceta são permitidos.
 */
export function parseParams(sp: Record<string, string | string[] | undefined>): ParsedParams {
  const facets: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(sp)) {
    if (!(key in FACET_DOMAINS)) continue;
    const values = (Array.isArray(raw) ? raw : [raw])
      .filter((v): v is string => typeof v === "string")
      .map(slugifyParam)
      .filter((v) => FACET_DOMAINS[key].includes(v));
    if (values.length > 0) facets[key] = [...new Set(values)].sort();
  }

  const rawSort = typeof sp.ordenar === "string" ? slugifyParam(sp.ordenar) : "relevancia";
  const sort = (SORT_DOMAIN as string[]).includes(rawSort) ? (rawSort as SortKey) : "relevancia";

  const rawPage = typeof sp.pagina === "string" ? parseInt(sp.pagina, 10) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 2 ? rawPage : 1;

  return { facets, sort, page };
}

export function facetCount(facets: Record<string, string[]>): number {
  return Object.values(facets).reduce((acc, v) => acc + v.length, 0);
}

/**
 * Serializa params de volta para query string com ordem alfabética estável.
 */
export function buildQueryString(facets: Record<string, string[]>, sort: SortKey, page: number): string {
  const usp = new URLSearchParams();
  for (const key of Object.keys(facets).sort()) {
    for (const value of [...facets[key]].sort()) usp.append(key, value);
  }
  if (sort !== "relevancia") usp.set("ordenar", sort);
  if (page >= 2) usp.set("pagina", String(page));
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Canonical absoluta conforme matriz de decisão (docs/01 §1.6.2):
 * - base sem parâmetros → ela mesma
 * - 1 faceta whitelist → ela mesma
 * - 1 faceta fora da whitelist OU ≥2 facetas → categoria base
 * - ordenar ≠ relevancia → mesma URL sem ordenar
 * - pagina=N → mantida (coleção distinta)
 */
export function buildCanonicalUrl(pathname: string, parsed: ParsedParams): string {
  const { facets, sort, page } = parsed;
  const nFacets = facetCount(facets);
  const base = SITE_URL + pathname;

  if (nFacets === 0) {
    // Sem facetas: ordenação colapsa; paginação mantém canonical própria
    if (page >= 2) return base + buildQueryString({}, "relevancia", page);
    return base;
  }

  const singleWhitelisted =
    nFacets === 1 &&
    INDEXABLE_WHITELIST.some(
      (w) =>
        w.path === pathname &&
        Object.entries(facets).some(([k, vals]) => k === w.param && vals.length === 1 && vals[0] === w.value),
    );

  if (singleWhitelisted) {
    // Faceta indexável: canonical própria, sem ordenar (ordenação nunca indexa)
    return base + buildQueryString(facets, "relevancia", page);
  }

  // Fora da whitelist ou combinada: colapsa para a base (mantendo paginação)
  return base + buildQueryString({}, "relevancia", page);
}

/** Meta robots derivado da mesma matriz. */
export function buildRobots(pathname: string, parsed: ParsedParams): "index, follow" | "noindex, follow" {
  const { facets, sort } = parsed;
  const nFacets = facetCount(facets);
  if (sort !== "relevancia") return "noindex, follow";
  if (nFacets === 0) return "index, follow";
  if (nFacets === 1) {
    const whitelisted = INDEXABLE_WHITELIST.some(
      (w) =>
        w.path === pathname &&
        Object.entries(facets).some(([k, vals]) => k === w.param && vals.length === 1 && vals[0] === w.value),
    );
    return whitelisted ? "index, follow" : "noindex, follow";
  }
  return "noindex, follow";
}

export function isWhitelisted(pathname: string, parsed: ParsedParams): boolean {
  const { facets } = parsed;
  return (
    facetCount(facets) === 1 &&
    INDEXABLE_WHITELIST.some(
      (w) =>
        w.path === pathname &&
        Object.entries(facets).some(([k, vals]) => k === w.param && vals.length === 1 && vals[0] === w.value),
    )
  );
}
