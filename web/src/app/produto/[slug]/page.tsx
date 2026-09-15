/**
 * PDP única — /produto/{slug} (docs/01 §1.1, regra 2: um produto, uma URL).
 * Renderiza o layout de cadeira (docs/03 §3.3) ou de peça (docs/03 §3.5)
 * conforme o tipo. JSON-LD: Product/ProductGroup(/AggregateOffer) + FAQPage.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, products, type Product } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { formatBRL, pixTotalCents } from "@/lib/pricing";
import { productBreadcrumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/primitives";
import { ChairPurchasePanel } from "@/components/product/ChairPurchasePanel";
import { DimensionTable, Nr17Seal } from "@/components/product/DimensionTable";
import { CompatibilityKitMatrix } from "@/components/parts/CompatibilityKitMatrix";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProductJsonLd, buildFaqJsonLd, FAQ_LIBRARY, type FaqItem } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const title =
    product.kind === "chair"
      ? `${product.name} — Suporta ${product.maxLoadKg} kg`
      : `${product.name} — Unitário e Kit Atacado`;
  const description =
    product.kind === "chair"
      ? `${product.shortName}: peso suportado ${product.maxLoadKg} kg, pistão classe ${product.gasClass}${product.nr17 ? ", conformidade NR-17" : ""}. ${formatBRL(pixTotalCents(Math.min(...product.variants.map((v) => v.priceCents))))} no Pix ou 6x sem juros. Direto da fábrica em Jaú/SP.`
      : `${product.shortName}: ${describeSpec(product)} Unitário ${formatBRL(product.baseUnitPriceCents)} e kits 5x/10x/20x com preço regressivo por unidade. Verificador de compatibilidade integrado.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/produto/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/produto/${slug}`,
      images: [{ url: `${SITE_URL}/img/${slug}-1200x630.jpg`, width: 1200, height: 630, alt: product.name }],
    },
  };
}

function describeSpec(p: Extract<Product, { kind: "part" }>): string {
  const bits: string[] = [];
  if (p.specs.gasClass) bits.push(`classe ${p.specs.gasClass}`);
  if (p.specs.columnDiameterMm > 0) bits.push(`coluna ${p.specs.columnDiameterMm} mm`);
  if (p.specs.pinDiameterMm) bits.push(`pino ${p.specs.pinDiameterMm} mm`);
  if (p.specs.material) bits.push(p.specs.material.toUpperCase());
  bits.push(`até ${p.specs.maxLoadKg} kg`);
  return bits.join(", ") + ".";
}

function faqsFor(product: Product): FaqItem[] {
  if (product.kind === "chair") {
    return [...FAQ_LIBRARY.nr17, ...FAQ_LIBRARY.pistao.slice(1, 2), ...FAQ_LIBRARY.atacado];
  }
  switch (product.category) {
    case "pistoes-a-gas":
      return [...FAQ_LIBRARY.pistao, ...FAQ_LIBRARY.atacado];
    case "rodizios":
      return [...FAQ_LIBRARY.rodizio, ...FAQ_LIBRARY.atacado];
    default:
      return [...FAQ_LIBRARY.atacado, ...FAQ_LIBRARY.pistao.slice(1)];
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const faqs = faqsFor(product);
  const related = product.relatedPartSlugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs items={productBreadcrumb(product)} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Galeria — caixa 1:1 reservada; imagem principal seria next/image priority */}
        <div>
          <ProductImage name={product.name} category={product.category} ratio="square" priority />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[2, 3, 4, 5].map((i) => (
              <ProductImage key={i} name={`${product.shortName} — vista ${i}`} category={product.category} ratio="square" className="opacity-80" />
            ))}
          </div>

          {product.kind === "chair" && (
            <div className="mt-6 space-y-4">
              <Nr17Seal chair={product} />
              <DimensionTable chair={product} />
            </div>
          )}

          {product.kind === "part" && (
            <details className="mt-6 rounded-xl border border-line p-4">
              <summary className="min-h-11 cursor-pointer text-sm font-bold">Especificações técnicas completas</summary>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries({
                  "Carga máxima": `${product.specs.maxLoadKg} kg`,
                  ...(product.specs.gasClass ? { "Classe do pistão": `Classe ${product.specs.gasClass} (ensaio SGS)` } : {}),
                  ...(product.specs.columnDiameterMm > 0 ? { "Diâmetro da coluna": `${product.specs.columnDiameterMm} mm (cone padrão)` } : {}),
                  ...(product.specs.rodDiameterMm ? { "Diâmetro da haste": `${product.specs.rodDiameterMm} mm` } : {}),
                  ...(product.specs.strokeMm ? { "Curso": `${product.specs.strokeMm} mm` } : {}),
                  ...(product.specs.pinDiameterMm ? { "Pino de encaixe": `${product.specs.pinDiameterMm} mm (padrão nacional)` } : {}),
                  ...(product.specs.material ? { Material: product.specs.material.toUpperCase() } : {}),
                  ...(product.specs.baseType ? { Base: product.specs.baseType === "estrela-5" ? "estrela 5 hastes" : "estrela 6 hastes" } : {}),
                  Garantia: "12 meses (fabricante)",
                  Origem: "Fábrica Chair Cadeiras — Jaú/SP",
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-ink-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>

        {/* Coluna de compra */}
        <div>
          <header className="mb-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {product.kind === "chair" && product.nr17 && <Badge tone="brand">NR-17 ✓</Badge>}
              {product.kind === "chair" && <Badge tone="neutral">{product.maxLoadKg} kg</Badge>}
              {product.kind === "chair" && <Badge tone="neutral">Pistão classe {product.gasClass}</Badge>}
              {product.kind === "part" && <Badge tone="b2b">Peça de reposição · direto da fábrica</Badge>}
              {product.stockStatus === "in_stock" && <Badge tone="success">Em estoque</Badge>}
              {product.stockStatus === "low" && <Badge tone="accent">Últimas unidades</Badge>}
              {product.stockStatus === "out" && <Badge tone="danger">Esgotado</Badge>}
            </div>
            <h1 className="text-xl font-black leading-snug tracking-tight md:text-2xl">{product.name}</h1>
          </header>

          {product.kind === "chair" ? (
            <ChairPurchasePanel chair={product} />
          ) : (
            <CompatibilityKitMatrix part={product} />
          )}

          <p className="mt-5 text-sm leading-relaxed text-ink-muted">{product.description}</p>

          {/* Links contextuais hub-and-spoke (docs/01 §1.5.2) */}
          {product.kind === "chair" && related.length > 0 && (
            <section aria-labelledby="pecas-compat" className="mt-6 rounded-xl border border-b2b/30 bg-b2b-soft/30 p-4">
              <h2 id="pecas-compat" className="text-sm font-black tracking-wide text-b2b-ink uppercase">
                Peças de reposição desta cadeira
              </h2>
              <ul className="mt-2 space-y-1.5">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/produto/${r.slug}`} className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-white px-3 text-sm font-semibold hover:border-b2b border border-transparent">
                      {r.shortName}
                      <span className="tnum text-b2b">{r.kind === "part" ? formatBRL(r.baseUnitPriceCents) : ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.kind === "part" && product.compatibleChairSlugs.length > 0 && (
            <section aria-labelledby="cadeiras-compat" className="mt-6 rounded-xl bg-bg-subtle p-4">
              <h2 id="cadeiras-compat" className="text-sm font-black tracking-wide uppercase">
                Usa esta peça de fábrica
              </h2>
              <ul className="mt-2 space-y-1.5">
                {product.compatibleChairSlugs.map((s) => {
                  const c = getProductBySlug(s);
                  if (!c) return null;
                  return (
                    <li key={s}>
                      <Link href={`/produto/${s}`} className="flex min-h-11 items-center rounded-lg border border-transparent bg-white px-3 text-sm font-semibold hover:border-brand">
                        {c.shortName} →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* FAQ — visível na página, mesmo conteúdo do FAQPage JSON-LD (docs/04 §4.5) */}
      <section aria-labelledby="faq-produto" className="mx-auto mt-12 max-w-3xl">
        <h2 id="faq-produto" className="mb-3 text-lg font-bold">
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

      <JsonLd data={buildProductJsonLd(product)} />
      <JsonLd data={buildFaqJsonLd(faqs)} />
    </div>
  );
}
