/**
 * Busca preditiva com tolerância a erro (docs/03 §3.2.2).
 * Engine local do protótipo com a mesma API comportamental do Typesense
 * em produção: normalização, sinonímia, distância de edição, prefix-match.
 * Destinos: produtos, categorias e guias — NUNCA página de busca interna.
 */
import {
  chairs,
  parts,
  chairCategories,
  partCategories,
  type Product,
} from "./catalog";

export interface CategoryHit {
  name: string;
  href: string;
  kind: "chair-category" | "part-category";
}

export interface GuideHit {
  title: string;
  href: string;
}

export interface SearchSuggestion {
  products: Product[];
  categories: CategoryHit[];
  guides: GuideHit[];
}

export const guides: GuideHit[] = [
  { title: "Pistão classe 2 vs classe 3: qual a diferença?", href: "/guias/diferenca-pistao-classe-2-e-classe-3" },
  { title: "Rodízio PU vs silicone vs nylon: qual escolher?", href: "/guias/rodizio-pu-vs-silicone-vs-nylon" },
  { title: "NR-17: o que a norma exige das cadeiras", href: "/guias/nr-17-exigencia-cadeiras-escritorio" },
  { title: "Como medir o pistão da sua cadeira", href: "/guias/como-medir-pistao-de-cadeira" },
  { title: "Como trocar a flange relax", href: "/guias/como-trocar-flange-relax" },
  { title: "Cadeira reforçada 150 kg: o que muda", href: "/guias/cadeira-reforcada-150kg-o-que-muda" },
];

/** Normalização: NFC, lowercase, remoção de diacríticos (docs/02 §2.6.3). */
export function normalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "") // combinações (após NFD, se houver)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim();
}

/** Sinônimos e variantes de grafia (inclui typos comuns documentados). */
const SYNONYMS: Record<string, string[]> = {
  rodizio: ["rodizios", "rodinhas", "rodinha", "roda", "rodas", "roldana"],
  pistao: ["pisto", "pistoes", "piston", "amortecedor", "coluna"],
  flange: ["flanje", "franje", "mecanismo", "placa"],
  estrela: ["base estrela", "base-estrela", "aranha", "base giratoria"],
  bucha: ["buchas", "adaptador", "reducao"],
  mocho: ["mochos", "banqueta giratoria", "tamborete"],
  gamer: ["game", "gamers", "jogo"],
  presidente: ["presidencial", "ceo"],
  ergonomico: ["ergonomica", "ergonomicas", "ergonomia", "nr17", "nr 17"],
  braco: ["bracos", "apoiador"],
  capa: ["telescopica", "telescopio", "revestimento do pistao"],
};

function expandToken(token: string): string[] {
  const out = [token];
  for (const [key, variants] of Object.entries(SYNONYMS)) {
    if (variants.includes(token) || token === key) {
      out.push(key, ...variants);
    }
  }
  return [...new Set(out)];
}

/** Distância de Levenshtein (limite de memória: tokens curtos). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Tolerância a erro por tamanho de token (docs/03 §3.2.2, regra 3). */
export function fuzzyMatch(queryToken: string, targetToken: string): boolean {
  if (targetToken.startsWith(queryToken) || queryToken.startsWith(targetToken)) return true;
  const dist = levenshtein(queryToken, targetToken);
  if (queryToken.length >= 5) return dist <= 2;
  if (queryToken.length >= 3) return dist <= 1;
  return dist === 0;
}

interface SearchableDoc {
  product: Product;
  haystack: string[]; // tokens normalizados de nome + specs + categoria
}

function buildDocs(): SearchableDoc[] {
  const doc = (p: Product): SearchableDoc => {
    const specWords: string[] = [];
    if (p.kind === "part") {
      if (p.specs.gasClass) specWords.push(`classe${p.specs.gasClass}`, `classe${p.specs.gasClass}`);
      if (p.specs.material) specWords.push(p.specs.material);
      if (p.specs.mechanism) specWords.push(p.specs.mechanism.replace("-", ""));
      if (p.specs.maxLoadKg) specWords.push(`${p.specs.maxLoadKg}kg`);
      if (p.specs.pinDiameterMm) specWords.push(`${p.specs.pinDiameterMm}mm`, "pino");
      if (p.specs.columnDiameterMm) specWords.push(`${p.specs.columnDiameterMm}mm`, "coluna");
      if (p.specs.baseType) specWords.push("estrela", "base");
    } else {
      specWords.push(`classe${p.gasClass}`, p.casterMaterial, `${p.maxLoadKg}kg`);
      if (p.nr17) specWords.push("nr17", "ergonomica");
    }
    const text = normalize(
      [p.name, p.shortName, p.category, p.kind === "chair" ? p.category : p.category, ...specWords].join(" "),
    );
    return { product: p, haystack: text.split(/[\s-]+/).filter(Boolean) };
  };
  return [...chairs, ...parts].map(doc);
}

const DOCS = buildDocs();

/**
 * Busca principal. `profile` aplica boost do seletor de perfil do header:
 * "cadeiras" prioriza o silo B2C, "pecas" o silo B2B (docs/03 §3.2.1).
 */
export function searchSuggestions(
  query: string,
  profile: "neutro" | "cadeiras" | "pecas" = "neutro",
  limit = 4,
): SearchSuggestion {
  const q = normalize(query);
  if (!q) return { products: [], categories: [], guides: [] };

  const queryTokens = q.split(/\s+/).filter(Boolean);
  const expanded = queryTokens.flatMap(expandToken);

  const scored = DOCS.map(({ product, haystack }) => {
    let score = 0;
    const nameNorm = normalize(product.name + " " + product.shortName);
    for (const t of expanded) {
      if (t.length < 2) continue;
      if (nameNorm.includes(t)) score += 6; // match em nome vale mais
      for (const h of haystack) {
        if (h === t) score += 4;
        else if (fuzzyMatch(t, h)) score += 2;
      }
    }
    // todos os tokens originais precisam ter ao menos um match fuzzy
    const allCovered = queryTokens.every((qt) =>
      haystack.some((h) => fuzzyMatch(expandToken(qt)[0] ?? qt, h) || expanded.some((e) => fuzzyMatch(e, h))),
    );
    if (!allCovered) score = Math.min(score, 2);
    // boost de perfil
    if (profile === "cadeiras" && product.kind === "chair") score += 1.5;
    if (profile === "pecas" && product.kind === "part") score += 1.5;
    return { product, score };
  })
    .filter((s) => s.score >= 4)
    .sort((a, b) => b.score - a.score);

  // Categorias: match direto ou fuzzy no nome/slug
  const categories: CategoryHit[] = [];
  for (const c of chairCategories) {
    const target = normalize(`${c.name} ${c.slug}`);
    if (expanded.some((t) => target.includes(t))) {
      categories.push({ name: c.name, href: `/cadeiras/${c.slug}`, kind: "chair-category" });
    }
  }
  for (const c of partCategories) {
    const target = normalize(`${c.name} ${c.slug}`);
    if (expanded.some((t) => target.includes(t))) {
      categories.push({ name: c.name, href: `/pecas/${c.slug}`, kind: "part-category" });
    }
  }
  // Facetas de alta intenção como "destino de categoria" (docs/03 §3.2.2):
  // tokens podem vir juntos ("classe3") ou separados ("classe 3").
  const joined = expanded.filter(Boolean);
  if (joined.includes("silicone")) {
    categories.push({ name: "Rodízios de silicone", href: "/pecas/rodizios?material=silicone", kind: "part-category" });
  }
  if (joined.includes("pu")) {
    categories.push({ name: "Rodízios de PU", href: "/pecas/rodizios?material=pu", kind: "part-category" });
  }
  for (const n of ["2", "3"] as const) {
    if (joined.includes(`classe${n}`) || (joined.includes("classe") && joined.includes(n))) {
      categories.push({
        name: `Pistões classe ${n}`,
        href: `/pecas/pistoes-a-gas?classe=${n}`,
        kind: "part-category",
      });
    }
  }
  for (const kg of ["120kg", "150kg"] as const) {
    if (joined.includes(kg) && (joined.includes("gamer") || joined.some((t) => fuzzyMatch(t, "cadeira")))) {
      categories.push({ name: `Cadeiras gamer ${kg}`, href: `/cadeiras/gamer?peso-suportado=${kg}`, kind: "chair-category" });
    }
  }

  const guideHits = guides.filter((g) => {
    const target = normalize(g.title + " " + g.href);
    return expanded.some((t) => t.length >= 3 && target.includes(t));
  });

  if (profile === "cadeiras") categories.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "chair-category" ? -1 : 1));
  if (profile === "pecas") categories.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "part-category" ? -1 : 1));

  return {
    products: scored.slice(0, limit).map((s) => s.product),
    categories: categories.slice(0, 3),
    guides: guideHits.slice(0, 2),
  };
}
