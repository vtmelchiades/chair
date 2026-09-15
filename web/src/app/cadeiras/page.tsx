/**
 * Hub do silo B2C — /cadeiras (docs/01 §1.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { chairCategories, chairs } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Cadeiras de Escritório Ergonômicas, Gamer e Presidente",
  description:
    "Cadeiras direto da fábrica em Jaú/SP: ergonômicas com conformidade NR-17, presidente, diretor, executiva, gamer reforçadas até 150 kg e mochos. 6x sem juros e 5% off no Pix.",
  alternates: { canonical: `${SITE_URL}/cadeiras` },
};

export default function ChairsHubPage() {
  const top = chairs.filter((c) => c.nr17).slice(0, 6);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cadeiras" },
        ]}
      />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">Cadeiras direto da fábrica</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Fabricante de cadeiras em Jaú/SP: modelos ergonômicos com laudo de conformidade{" "}
          <Link href="/guias/nr-17-exigencia-cadeiras-escritorio" className="font-semibold text-brand underline">
            NR-17
          </Link>
          , pistões <strong>classe 3</strong> nos modelos reforçados e{" "}
          <Link href="/guias/cadeira-reforcada-150kg-o-que-muda" className="font-semibold text-brand underline">
            cargas de até 150 kg
          </Link>{" "}
          com fator de segurança 1,5x. Precisa só de uma peça? Veja{" "}
          <Link href="/pecas" className="font-semibold text-b2b underline">
            peças de reposição e atacado
          </Link>
          .
        </p>
      </header>

      <nav aria-label="Categorias de cadeiras" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {chairCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/cadeiras/${c.slug}`}
            className="rounded-xl border border-line bg-white p-5 hover:border-brand hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
          >
            <p className="font-bold text-brand">{c.name}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.description}</p>
          </Link>
        ))}
      </nav>

      <section aria-labelledby="conformes" className="mt-12">
        <SectionTitle id="conformes">Conformes com a NR-17</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          {top.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <JsonLd data={buildItemListJsonLd(top, "/cadeiras")} />
    </div>
  );
}
