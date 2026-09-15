/**
 * Página de guia spoke (docs/01 §1.5.2).
 * Termina com produtos relacionados (card com preço) e link para a
 * subcategoria — fluxo spoke → produto/hub. FAQPage JSON-LD quando o guia
 * tem FAQ correspondente, com as perguntas visíveis na página.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guideList } from "@/lib/guides";
import { getProductBySlug } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonClass } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqJsonLd, FAQ_LIBRARY } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guideList.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `${SITE_URL}/guias/${slug}` },
    openGraph: { type: "article", title: guide.metaTitle, description: guide.metaDescription },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const faqs = guide.faqKeys.flatMap((k) => FAQ_LIBRARY[k] ?? []);
  const relatedProducts = guide.relatedProductSlugs
    .map((s) => getProductBySlug(s))
    .filter((p) => Boolean(p));

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guias Técnicos", href: "/guias" },
          { name: guide.title },
        ]}
      />

      <article>
        <h1 className="text-2xl font-black leading-tight tracking-tight md:text-3xl">{guide.title}</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Conteúdo técnico da fábrica Chair Cadeiras · Jaú/SP · atualizado em setembro de 2026
        </p>

        <div className="mt-6 space-y-6">
          {guide.sections.map((section, i) => (
            <section key={i}>
              {section.heading && <h2 className="mb-2 text-lg font-bold">{section.heading}</h2>}
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="mb-3 text-sm leading-relaxed text-ink-muted md:text-base">
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted md:text-base">
                  {section.list.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Spoke → produtos e hub (docs/01 §1.4, regra 3) */}
        <aside aria-labelledby="produtos-guia" className="mt-10 rounded-xl bg-bg-subtle p-5">
          <h2 id="produtos-guia" className="mb-3 text-sm font-black tracking-wide uppercase">
            Produtos relacionados a este guia
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {relatedProducts.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
          <Link href={guide.relatedCategoryHref} className={`${buttonClass("secondary")} mt-4`}>
            {guide.relatedCategoryLabel} →
          </Link>
        </aside>

        {faqs.length > 0 && (
          <section aria-labelledby="faq-guia" className="mt-10">
            <h2 id="faq-guia" className="mb-3 text-lg font-bold">
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
      </article>

      {faqs.length > 0 && <JsonLd data={buildFaqJsonLd(faqs)} />}
    </div>
  );
}
