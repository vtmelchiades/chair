/**
 * Hub do silo B2B/Reposição — /pecas (docs/01 §1.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { partCategories, parts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle, Badge } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd, buildFaqJsonLd, FAQ_LIBRARY } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Peças de Reposição para Cadeiras — Unitário e Atacado",
  description:
    "Pistões a gás classe 2 e 3, rodízios PU/silicone/nylon, bases estrela, flanges relax, back system, braços e kits de atacado 5x/10x/20x com preço regressivo por unidade. Direto da fábrica em Jaú/SP.",
  alternates: { canonical: `${SITE_URL}/pecas` },
};

export default function PartsHubPage() {
  const bestSellers = parts.slice(0, 4);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Peças de Reposição e Atacado" },
        ]}
      />
      <header className="mb-8 max-w-3xl">
        <div className="mb-2">
          <Badge tone="b2b">B2B / Reposição — preços por unidade no atacado</Badge>
        </div>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          Peças de reposição para cadeiras — unitário e kits de atacado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Componentes com especificação técnica explícita: pistões <strong>classe 2</strong> (até 100 kg) e{" "}
          <Link href="/guias/diferenca-pistao-classe-2-e-classe-3" className="font-semibold text-b2b underline">
            classe 3
          </Link>{" "}
          (até 150 kg),{" "}
          <Link href="/guias/rodizio-pu-vs-silicone-vs-nylon" className="font-semibold text-b2b underline">
            rodízios PU, silicone e nylon
          </Link>{" "}
          com pino 11 mm padrão, bases estrela com furo cônico 50 mm e mecanismos relax/flange/back system.
          Toda PDP tem <strong>Verificador de Compatibilidade</strong> e kits 5x/10x/20x com preço regressivo.
        </p>
      </header>

      <nav aria-label="Categorias de peças" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {partCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/pecas/${c.slug}`}
            className="rounded-xl border border-b2b/20 bg-white p-5 hover:border-b2b hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
          >
            <p className="font-bold text-b2b">{c.name}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.description}</p>
          </Link>
        ))}
      </nav>

      <section aria-labelledby="mais-vendidos" className="mt-12">
        <SectionTitle id="mais-vendidos">Mais vendidos para manutenção</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <JsonLd data={buildItemListJsonLd(bestSellers, "/pecas")} />
      <JsonLd data={buildFaqJsonLd([...FAQ_LIBRARY.atacado])} />
    </div>
  );
}
