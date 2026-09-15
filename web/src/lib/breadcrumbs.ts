/**
 * Fonte única de breadcrumbs: alimenta o <nav> visível e o JSON-LD
 * BreadcrumbList (docs/04 §4.3 — zero divergência entre markup e schema).
 */
import { SITE_URL } from "./facets";
import type { Product } from "./catalog";

export interface BreadcrumbItem {
  name: string;
  href?: string; // ausente no último item (página atual)
}

export function homeBreadcrumb(): BreadcrumbItem[] {
  return [{ name: "Home" }];
}

export function productBreadcrumb(product: Product): BreadcrumbItem[] {
  if (product.kind === "chair") {
    return [
      { name: "Home", href: "/" },
      { name: "Cadeiras", href: "/cadeiras" },
      { name: categoryLabel(product.category, "chair"), href: `/cadeiras/${product.category}` },
      { name: product.name },
    ];
  }
  return [
    { name: "Home", href: "/" },
    { name: "Peças de Reposição e Atacado", href: "/pecas" },
    { name: categoryLabel(product.category, "part"), href: `/pecas/${product.category}` },
    { name: product.name },
  ];
}

export function categoryBreadcrumb(silo: "cadeiras" | "pecas", categorySlug: string): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: silo === "cadeiras" ? "Cadeiras" : "Peças de Reposição e Atacado", href: `/${silo}` },
    { name: categoryLabel(categorySlug, silo === "cadeiras" ? "chair" : "part") },
  ];
}

export function environmentBreadcrumb(envName: string): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Ambientes", href: "/ambientes" },
    { name: envName },
  ];
}

function categoryLabel(slug: string, kind: "chair" | "part"): string {
  const chairLabels: Record<string, string> = {
    "ergonomicas-nr-17": "Cadeiras Ergonômicas NR-17",
    presidente: "Cadeiras Presidente",
    diretor: "Cadeiras Diretor",
    executiva: "Cadeiras Executiva",
    gamer: "Cadeiras Gamer",
    mochos: "Mochos Giratórios",
  };
  const partLabels: Record<string, string> = {
    "pistoes-a-gas": "Pistões a Gás",
    rodizios: "Rodízios",
    "bases-estrela": "Bases Estrela",
    mecanismos: "Mecanismos",
    bracos: "Braços",
    "assentos-e-encostos": "Assentos e Encostos",
    "buchas-e-acabamentos": "Buchas e Acabamentos",
    "kits-atacado": "Kits Atacado",
  };
  return (kind === "chair" ? chairLabels : partLabels)[slug] ?? slug;
}

export function absoluteUrl(href: string): string {
  return href.startsWith("http") ? href : SITE_URL + href;
}
