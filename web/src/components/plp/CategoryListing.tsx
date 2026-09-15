/**
 * Listagem de categoria facetada (docs/03 §3.4).
 * Server Component puro: facetas, ordenação e paginação são LINKS com a
 * URL como fonte de verdade — deep-linkáveis, consistentes com a canonical
 * (docs/01 §1.6) e com custo zero de INP (docs/02 §2.5).
 */
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import type { ParsedParams, SortKey } from "@/lib/facets";
import { buildQueryString, facetCount, SORT_DOMAIN } from "@/lib/facets";
import { filterAndSort, paginate } from "@/lib/filtering";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd, buildFaqJsonLd, type FaqItem } from "@/lib/seo/jsonld";

export interface FacetGroupDef {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

const SORT_LABELS: Record<SortKey, string> = {
  relevancia: "Relevância",
  "preco-asc": "Menor preço",
  "preco-desc": "Maior preço",
  novidades: "Novidades",
  "mais-vendidos": "Mais vendidos",
};

function facetHref(
  pathname: string,
  parsed: ParsedParams,
  param: string,
  value: string,
  active: boolean,
): string {
  const facets = { ...parsed.facets };
  const current = facets[param] ?? [];
  facets[param] = active ? current.filter((v) => v !== value) : [...current, value].sort();
  if (facets[param].length === 0) delete facets[param];
  return pathname + buildQueryString(facets, "relevancia", 1);
}

function sortHref(pathname: string, parsed: ParsedParams, sort: SortKey): string {
  return pathname + buildQueryString(parsed.facets, sort, 1);
}

function pageHref(pathname: string, parsed: ParsedParams, page: number): string {
  return pathname + buildQueryString(parsed.facets, parsed.sort, page);
}

export function CategoryListing({
  pathname,
  breadcrumbItems,
  title,
  description,
  topCopy,
  guideLinks,
  products,
  parsed,
  facetGroups,
  faqs,
  tone = "b2c",
}: {
  pathname: string;
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  description: string;
  /** Parágrafo de topo com links contextuais hub-and-spoke (docs/01 §1.5.2) */
  topCopy?: React.ReactNode;
  guideLinks?: { href: string; label: string }[];
  products: Product[];
  parsed: ParsedParams;
  facetGroups: FacetGroupDef[];
  faqs?: FaqItem[];
  tone?: "b2c" | "b2b";
}) {
  const filtered = filterAndSort(products, parsed);
  const { items, totalPages } = paginate(filtered, parsed.page);
  const activeCount = facetCount(parsed.facets);
  const accent = tone === "b2b" ? "text-b2b" : "text-brand";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs items={breadcrumbItems} />

      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        {topCopy ? (
          <div className="prose-sm mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{topCopy}</div>
        ) : (
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">{description}</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar de facetas — sticky, links (a11y: skip-link "Ir para os filtros") */}
        <aside id="filtros" aria-label="Filtros de produto" className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-xl border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold">Filtros</p>
              {activeCount > 0 && (
                <Link href={pathname + buildQueryString({}, "relevancia", 1)} className={`text-xs font-semibold underline ${accent}`}>
                  Limpar ({activeCount})
                </Link>
              )}
            </div>
            {facetGroups.map((group) => (
              <fieldset key={group.param} className="mb-4 border-t border-line pt-3 first:border-0 first:pt-0">
                <legend className="mb-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
                  {group.label}
                </legend>
                <ul className="space-y-1">
                  {group.options.map((opt) => {
                    const active = (parsed.facets[group.param] ?? []).includes(opt.value);
                    return (
                      <li key={opt.value}>
                        <Link
                          href={facetHref(pathname, parsed, group.param, opt.value, active)}
                          aria-pressed={active}
                          className={`flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm hover:bg-bg-subtle ${
                            active ? "font-bold text-ink" : "text-ink-muted"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                              active ? "border-brand bg-brand text-white" : "border-line bg-white"
                            }`}
                          >
                            {active ? "✓" : ""}
                          </span>
                          {opt.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>

          {guideLinks && guideLinks.length > 0 && (
            <div className="mt-4 rounded-xl bg-bg-subtle p-4">
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-muted uppercase">Guias relacionados</p>
              <ul className="space-y-1.5">
                {guideLinks.map((g) => (
                  <li key={g.href}>
                    <Link href={g.href} className={`text-sm font-medium hover:underline ${accent}`}>
                      {g.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div>
          {/* Barra de ordenação + contagem */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              <strong className="tnum text-ink">{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "produto" : "produtos"}
              {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? "filtro ativo" : "filtros ativos"}`}
            </p>
            <nav aria-label="Ordenar por" className="flex flex-wrap gap-1">
              {SORT_DOMAIN.map((s) => {
                const active = parsed.sort === s;
                return (
                  <Link
                    key={s}
                    href={sortHref(pathname, parsed, s)}
                    aria-current={active ? "true" : undefined}
                    className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                      active ? "border-brand bg-brand text-white" : "border-line bg-white text-ink-muted hover:border-brand hover:text-brand"
                    }`}
                  >
                    {SORT_LABELS[s]}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Chips de filtros ativos (removíveis individualmente) */}
          {activeCount > 0 && (
            <ul className="mb-4 flex flex-wrap gap-2" aria-label="Filtros ativos">
              {Object.entries(parsed.facets).flatMap(([param, values]) =>
                values.map((value) => (
                  <li key={`${param}-${value}`}>
                    <Link
                      href={facetHref(pathname, parsed, param, value, true)}
                      aria-label={`Remover filtro ${param} ${value}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-xs font-bold text-brand hover:bg-brand hover:text-white"
                    >
                      {facetValueLabel(facetGroups, param, value)} ✕
                    </Link>
                  </li>
                )),
              )}
            </ul>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-10 text-center">
              <p className="font-semibold">Nenhum produto com esses filtros.</p>
              <p className="mt-1 text-sm text-ink-muted">
                Remova filtros ou{" "}
                <a className="font-semibold text-success underline" href="https://wa.me/5514996642123?text=Ol%C3%A1!%20Procuro%20uma%20pe%C3%A7a%20que%20n%C3%A3o%20encontrei%20no%20site." target="_blank" rel="noopener noreferrer">
                  pergunte à fábrica no WhatsApp
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Paginação indexável (docs/01 §1.6.2) */}
          {totalPages > 1 && (
            <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-2">
              {parsed.page > 1 && (
                <Link href={pageHref(pathname, parsed, parsed.page - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold hover:border-brand">
                  ‹ Anterior
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(pathname, parsed, n)}
                  aria-current={n === parsed.page ? "page" : undefined}
                  className={`tnum inline-flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-semibold ${
                    n === parsed.page ? "border-brand bg-brand text-white" : "border-line hover:border-brand"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {parsed.page < totalPages && (
                <Link href={pageHref(pathname, parsed, parsed.page + 1)} className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold hover:border-brand">
                  Próxima ›
                </Link>
              )}
            </nav>
          )}

          {/* FAQ da categoria — visível na página (regra docs/04 §4.5) */}
          {faqs && faqs.length > 0 && (
            <section aria-labelledby="faq-categoria" className="mt-12">
              <h2 id="faq-categoria" className="mb-3 text-lg font-bold">
                Perguntas frequentes
              </h2>
              <div className="divide-y divide-line rounded-xl border border-line bg-white">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group p-4">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                      {faq.question}
                      <span aria-hidden className="text-brand transition-transform group-open:rotate-45">＋</span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <JsonLd data={buildItemListJsonLd(items, pathname)} />
      {faqs && faqs.length > 0 && <JsonLd data={buildFaqJsonLd(faqs)} />}
    </div>
  );
}

function facetValueLabel(groups: FacetGroupDef[], param: string, value: string): string {
  const group = groups.find((g) => g.param === param);
  return group?.options.find((o) => o.value === value)?.label ?? value;
}
