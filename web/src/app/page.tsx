/**
 * Home — hub de perfis (docs/01 §1.2, docs/03 §3.2).
 * Hero estático com caixa reservada (sem carrossel — corrige achado A3).
 * ISR 300s em produção (docs/02 §2.7).
 */
import Link from "next/link";
import { chairs, parts, environments } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle, ButtonLink, Badge } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 300;

const featuredChairs = chairs.filter((c) =>
  ["cadeira-gamer-gxf-base-metal-150kg", "cadeira-ergonomica-nr-17-apoio-lombar-home-office", "cadeira-presidente-ergonomica-nr-17"].includes(c.slug),
);
const featuredParts = parts.filter((p) =>
  ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm", "flange-aco-mecanismo-relax-diretor-executiva", "kit-base-gamer-150kg-estrela-reforcada-rodizios-pu"].includes(p.slug),
);

export default function HomePage() {
  return (
    <>
      {/* HERO estático — caixa aspect reservada no CSS crítico (docs/02 §2.3.1).
          Em produção: next/image priority + AVIF/WebP, sizes="100vw". */}
      <section aria-label="Destaque" className="relative">
        <div className="mx-auto max-w-[1200px] px-4 pt-4">
          <div className="relative flex aspect-[16/7] w-full items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand to-[#123a75] px-6 text-white md:aspect-[16/5] md:px-12">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-bold tracking-widest uppercase opacity-80">Direto da fábrica — Jaú/SP</p>
              <h1 className="text-2xl leading-tight font-black md:text-4xl">
                Cadeiras reforçadas até 150 kg e peças de reposição com preço de fabricante
              </h1>
              <p className="mt-3 hidden text-sm opacity-90 md:block md:text-base">
                Ergonomia NR-17, pistão classe 3, rodízios anti-risco em PU. Varejo para seu escritório e
                atacado para oficinas, revendas e facilities.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/cadeiras"
                  className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 text-sm font-bold text-brand hover:bg-brand-soft"
                >
                  Comprar cadeira
                </Link>
                <Link
                  href="/pecas"
                  className="inline-flex min-h-11 items-center rounded-lg border-2 border-white/70 px-5 text-sm font-bold text-white hover:bg-white/10"
                >
                  Preciso de peças / atacado
                </Link>
              </div>
            </div>
            <span aria-hidden className="absolute right-6 bottom-4 text-7xl opacity-25 md:right-16 md:text-9xl">🪑</span>
          </div>
        </div>
      </section>

      {/* Dois fluxos explícitos B2C / B2B */}
      <section aria-label="Fluxos de compra" className="mx-auto mt-6 grid max-w-[1200px] gap-4 px-4 md:grid-cols-2">
        <FlowPanel
          href="/cadeiras"
          tone="b2c"
          title="Comprar Cadeira"
          text="Ergonômicas NR-17, presidente, diretor, gamer 120/150 kg e mochos. Montada, testada e enviada da fábrica."
          links={[
            { href: "/cadeiras/ergonomicas-nr-17", label: "Ergonômicas NR-17" },
            { href: "/cadeiras/gamer", label: "Gamer" },
            { href: "/cadeiras/presidente", label: "Presidente" },
            { href: "/cadeiras/mochos", label: "Mochos" },
          ]}
        />
        <FlowPanel
          href="/pecas"
          tone="b2b"
          title="Preciso de Peças / Atacado"
          text="Pistões classe 2 e 3, rodízios PU/silicone/nylon, bases estrela, flanges e kits 5x/10x/20x com preço regressivo por unidade."
          links={[
            { href: "/pecas/pistoes-a-gas", label: "Pistões" },
            { href: "/pecas/rodizios", label: "Rodízios" },
            { href: "/pecas/mecanismos", label: "Mecanismos" },
            { href: "/pecas/kits-atacado", label: "Kits atacado" },
          ]}
        />
      </section>

      {/* Vitrine B2C */}
      <section aria-labelledby="destaques-cadeiras" className="mx-auto mt-12 max-w-[1200px] px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionTitle id="destaques-cadeiras">Cadeiras em destaque</SectionTitle>
          <Link href="/cadeiras" className="shrink-0 text-sm font-semibold text-brand hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featuredChairs.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Vitrine B2B */}
      <section aria-labelledby="destaques-pecas" className="mx-auto mt-12 max-w-[1200px] px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionTitle id="destaques-pecas">Peças de reposição — unitário e atacado</SectionTitle>
          <Link href="/pecas" className="shrink-0 text-sm font-semibold text-b2b hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredParts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Ambientes (hubs cross-silo) */}
      <section aria-labelledby="ambientes" className="mx-auto mt-12 max-w-[1200px] px-4">
        <SectionTitle id="ambientes">Comprar por ambiente</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {environments.map((env) => (
            <Link
              key={env.slug}
              href={`/ambientes/${env.slug}`}
              className="rounded-xl border border-line bg-white p-4 hover:border-brand hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
            >
              <p className="text-sm font-bold text-brand">{env.name}</p>
              <p className="mt-1 text-xs text-ink-muted">{env.pitch}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Spoke content — hub-and-spoke no corpo da home (docs/01 §1.5.2) */}
      <section aria-labelledby="guias" className="mx-auto mt-12 max-w-[1200px] px-4">
        <SectionTitle id="guias">Guias técnicos da fábrica</SectionTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/guias/diferenca-pistao-classe-2-e-classe-3" className="rounded-xl bg-bg-subtle p-5 hover:bg-brand-soft">
            <p className="font-bold">Pistão classe 2 vs classe 3</p>
            <p className="mt-1 text-sm text-ink-muted">
              Espessura de parede, carga certificada e quando o <strong>classe 3</strong> é obrigatório (150 kg e uso intenso).
            </p>
          </Link>
          <Link href="/guias/rodizio-pu-vs-silicone-vs-nylon" className="rounded-xl bg-bg-subtle p-5 hover:bg-brand-soft">
            <p className="font-bold">Rodízio PU vs silicone vs nylon</p>
            <p className="mt-1 text-sm text-ink-muted">
              Qual roda não risca porcelanato, qual é silenciosa para clínicas e qual é a econômica para carpete.
            </p>
          </Link>
          <Link href="/guias/nr-17-exigencia-cadeiras-escritorio" className="rounded-xl bg-bg-subtle p-5 hover:bg-brand-soft">
            <p className="font-bold">NR-17: o que a norma exige</p>
            <p className="mt-1 text-sm text-ink-muted">
              Altura ajustável, apoio lombar, base estável — o checklist ergonômico do posto de trabalho.
            </p>
          </Link>
        </div>
      </section>

      <JsonLd data={buildItemListJsonLd([...featuredChairs, ...featuredParts], "/")} />
    </>
  );
}

function FlowPanel({
  href,
  title,
  text,
  links,
  tone,
}: {
  href: string;
  title: string;
  text: string;
  links: { href: string; label: string }[];
  tone: "b2c" | "b2b";
}) {
  const isB2b = tone === "b2b";
  return (
    <div className={`rounded-2xl border-2 p-5 md:p-6 ${isB2b ? "border-b2b/30 bg-b2b-soft/40" : "border-brand/20 bg-brand-soft/40"}`}>
      <div className="flex items-center gap-2">
        {isB2b && <Badge tone="b2b">B2B / Reposição</Badge>}
        {!isB2b && <Badge tone="brand">B2C</Badge>}
      </div>
      <h2 className={`mt-2 text-lg font-bold md:text-xl ${isB2b ? "text-b2b-ink" : "text-brand"}`}>{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold ${
              isB2b ? "border-b2b/30 text-b2b hover:bg-b2b-soft" : "border-brand/30 text-brand hover:bg-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <ButtonLink href={href} variant={isB2b ? "b2b" : "primary"} className="mt-4 w-full md:w-auto">
        {isB2b ? "Ver peças e kits de atacado" : "Ver cadeiras"}
      </ButtonLink>
    </div>
  );
}
