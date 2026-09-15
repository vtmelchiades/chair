/**
 * Página de ambiente (docs/01 §1.3): curadoria cross-silo.
 * Indexável; nunca reescreve a URL do produto (/produto/{slug}).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { environments, getProductsByEnvironment, type Environment } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { environmentBreadcrumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemListJsonLd } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ ambiente: string }>;
}

const validSlugs = environments.map((e) => e.slug);

export function generateStaticParams() {
  return environments.map((e) => ({ ambiente: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ambiente } = await params;
  const env = environments.find((e) => e.slug === ambiente);
  if (!env) return {};
  return {
    title: `Cadeiras e Peças para ${env.name}`,
    description: env.pitch,
    alternates: { canonical: `${SITE_URL}/ambientes/${ambiente}` },
  };
}

const copyByEnv: Record<string, React.ReactNode> = {
  "home-office": (
    <p>
      Para jornada de 8 horas em casa, a especificação correta é cadeira com conformidade{" "}
      <Link href="/guias/nr-17-exigencia-cadeiras-escritorio" className="font-semibold text-brand underline">
        NR-17
      </Link>
      : altura de assento ajustável, apoio lombar e braços reguláveis. Em piso frio (porcelanato/laminado),
      use <Link href="/pecas/rodizios?material=pu" className="font-semibold text-b2b underline">rodízios de PU anti-risco</Link> —
      os de nylon marcam o piso. Manutenção preventiva: pistão{" "}
      <Link href="/pecas/pistoes-a-gas?classe=3" className="font-semibold text-b2b underline">classe 3</Link> dura mais em uso diário intenso.
    </p>
  ),
  corporativo: (
    <p>
      Frota corporativa se mantém com padrão: cadeiras diretor/presidente com pistão classe 3 e, para
      facilities, <Link href="/pecas/kits-atacado" className="font-semibold text-b2b underline">kits de atacado 10x e 20x</Link>{" "}
      com preço regressivo por unidade. O kit 10 pistões + flanges cobre a manutenção anual de escritórios de
      médio porte. Condições para CNPJ e pagamento faturado a partir de R$ 1.000.
    </p>
  ),
  "setup-gamer": (
    <p>
      Setup gamer pede cadeira reforçada: acima de 100 kg de usuário ou uso intenso, a especificação é{" "}
      <Link href="/cadeiras/gamer?peso-suportado=150kg" className="font-semibold text-brand underline">
        150 kg com pistão classe 3 e base de aço
      </Link>
      . Upgrade comum: trocar a base original pelo{" "}
      <Link href="/produto/kit-base-gamer-150kg-estrela-reforcada-rodizios-pu" className="font-semibold text-b2b underline">
        kit base estrela reforçada + rodízios PU
      </Link>{" "}
      — silencia o deslizamento e protege o piso.
    </p>
  ),
  "clinicas-e-consultorios": (
    <p>
      Consultórios usam <Link href="/cadeiras/mochos" className="font-semibold text-brand underline">mochos giratórios</Link>{" "}
      com regulagem de altura e rodízios de{" "}
      <Link href="/pecas/rodizios?material=silicone" className="font-semibold text-b2b underline">silicone</Link>:
      rodagem macia, silenciosa e que não marca piso frio — requisito em ambientes clínicos.
    </p>
  ),
  "templos-e-igrejas": (
    <p>
      Para templos e auditórios: cadeiras empilháveis e longarinas com condição de atacado direto da fábrica.
      Quantidades acima de 20 unidades têm cotação específica — fale com o comercial pelo WhatsApp
      (14) 99664-2123 informando a quantidade e a cidade de entrega.
    </p>
  ),
};

export default async function EnvironmentPage({ params }: Props) {
  const { ambiente } = await params;
  if (!validSlugs.includes(ambiente as Environment)) notFound();
  const env = environments.find((e) => e.slug === ambiente)!;
  const list = getProductsByEnvironment(ambiente as Environment);
  const chairsList = list.filter((p) => p.kind === "chair");
  const partsList = list.filter((p) => p.kind === "part");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs items={environmentBreadcrumb(env.name)} />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          Cadeiras e peças para {env.name}
        </h1>
        <div className="mt-2 text-sm leading-relaxed text-ink-muted">{copyByEnv[ambiente]}</div>
      </header>

      {chairsList.length > 0 && (
        <section aria-labelledby="cadeiras-ambiente" className="mb-10">
          <h2 id="cadeiras-ambiente" className="mb-4 text-lg font-bold">Cadeiras indicadas</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {chairsList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {partsList.length > 0 && (
        <section aria-labelledby="pecas-ambiente">
          <h2 id="pecas-ambiente" className="mb-4 text-lg font-bold text-b2b">Peças de reposição para este ambiente</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {partsList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <JsonLd data={buildItemListJsonLd(list, `/ambientes/${ambiente}`)} />
    </div>
  );
}
