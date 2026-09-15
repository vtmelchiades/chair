/**
 * Filtragem e ordenação de catálogo para PLPs facetadas (docs/01 §1.6).
 * Função pura executada no servidor (RSC/ISR) — zero JS de filtro no cliente.
 */
import type { Product } from "./catalog";
import type { ParsedParams, SortKey } from "./facets";

export function productMatchesFacets(p: Product, facets: Record<string, string[]>): boolean {
  for (const [key, values] of Object.entries(facets)) {
    switch (key) {
      case "classe": {
        const cls = p.kind === "part" ? p.specs.gasClass : p.gasClass;
        if (cls == null || !values.includes(String(cls))) return false;
        break;
      }
      case "material": {
        if (p.kind === "chair") {
          if (!values.includes(p.casterMaterial)) return false;
        } else {
          if (!p.specs.material || !values.includes(p.specs.material)) return false;
        }
        break;
      }
      case "mecanismo": {
        if (p.kind !== "part" || !p.specs.mechanism || !values.includes(p.specs.mechanism)) return false;
        break;
      }
      case "diametro-pino": {
        if (p.kind !== "part" || !p.specs.pinDiameterMm || !values.includes(`${p.specs.pinDiameterMm}mm`)) return false;
        break;
      }
      case "kit": {
        if (p.kind !== "part" || !p.tiers.length) return false;
        const qty = values.map((v) => parseInt(v, 10));
        if (!p.tiers.some((t) => qty.includes(t.quantity) && t.quantity > 1)) return false;
        break;
      }
      case "carga":
      case "peso-suportado": {
        const kg = values.map((v) => parseInt(v, 10));
        if (p.kind === "chair") {
          // Cadeira atende se possui variante com a capacidade solicitada
          if (!p.variants.some((v) => kg.includes(v.weightCapacityKg))) return false;
        } else {
          if (!kg.some((k) => p.specs.maxLoadKg >= k)) return false;
        }
        break;
      }
      case "cor": {
        if (p.kind !== "chair") return false;
        const colors = p.variants.flatMap((v) => v.colors.map((c) => c.toLowerCase()));
        if (!values.some((v) => colors.includes(v))) return false;
        break;
      }
    }
  }
  return true;
}

export function productPriceCents(p: Product): number {
  return p.kind === "chair"
    ? Math.min(...p.variants.map((v) => v.priceCents))
    : p.baseUnitPriceCents;
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const out = [...list];
  switch (sort) {
    case "preco-asc":
      return out.sort((a, b) => productPriceCents(a) - productPriceCents(b));
    case "preco-desc":
      return out.sort((a, b) => productPriceCents(b) - productPriceCents(a));
    case "novidades":
      return out.sort((a, b) => Number(b.kind === "chair" ? b.nr17 : false) - Number(a.kind === "chair" ? a.nr17 : false));
    case "mais-vendidos":
      return out.sort((a, b) => (b.kind === "part" ? b.stockQty : 0) - (a.kind === "part" ? a.stockQty : 0));
    default:
      return out;
  }
}

export function filterAndSort(list: Product[], parsed: ParsedParams): Product[] {
  return sortProducts(list.filter((p) => productMatchesFacets(p, parsed.facets)), parsed.sort);
}

export const PAGE_SIZE = 12;

export function paginate(list: Product[], page: number): { items: Product[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const clamped = Math.min(Math.max(1, page), totalPages);
  return { items: list.slice((clamped - 1) * PAGE_SIZE, clamped * PAGE_SIZE), totalPages };
}
