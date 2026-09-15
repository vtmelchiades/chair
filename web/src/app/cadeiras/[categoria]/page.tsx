/**
 * PLP B2C — /cadeiras/[categoria] (docs/01 §1.2).
 * Canonical/robots derivados da matriz de decisão (docs/01 §1.6.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chairCategories, chairs, type ChairCategory } from "@/lib/catalog";
import { parseParams, buildCanonicalUrl, buildRobots, isWhitelisted } from "@/lib/facets";
import { categoryBreadcrumb } from "@/lib/breadcrumbs";
import { CategoryListing, type FacetGroupDef } from "@/components/plp/CategoryListing";
import { FAQ_LIBRARY } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const validSlugs = chairCategories.map((c) => c.slug);

export function generateStaticParams() {
  return chairCategories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const sp = await searchParams;
  if (!validSlugs.includes(categoria as ChairCategory)) return {};
  const meta = chairCategories.find((c) => c.slug === categoria)!;
  const parsed = parseParams(sp);
  const pathname = `/cadeiras/${categoria}`;
  const canonical = buildCanonicalUrl(pathname, parsed);
  const robots = buildRobots(pathname, parsed);
  const facetNote = isWhitelisted(pathname, parsed)
    ? ` — ${Object.values(parsed.facets).flat().join(", ")}`
    : "";

  return {
    title: `${meta.name}${facetNote}`,
    description: meta.description,
    alternates: { canonical },
    robots,
    openGraph: { title: `${meta.name} | Chair Cadeiras`, description: meta.description, url: canonical },
  };
}

const chairFacetGroups: FacetGroupDef[] = [
  {
    param: "peso-suportado",
    label: "Peso suportado",
    options: [
      { value: "100kg", label: "até 100 kg" },
      { value: "120kg", label: "até 120 kg" },
      { value: "150kg", label: "até 150 kg (reforçada)" },
    ],
  },
  {
    param: "material",
    label: "Rodízios",
    options: [
      { value: "pu", label: "PU anti-risco" },
      { value: "silicone", label: "Silicone" },
      { value: "nylon", label: "Nylon" },
    ],
  },
  {
    param: "classe",
    label: "Classe do pistão",
    options: [
      { value: "2", label: "Classe 2" },
      { value: "3", label: "Classe 3 (reforçado)" },
    ],
  },
  {
    param: "cor",
    label: "Cor",
    options: [
      { value: "preto", label: "Preto" },
      { value: "cinza", label: "Cinza" },
      { value: "branco", label: "Branco" },
      { value: "vermelho", label: "Vermelho" },
    ],
  },
];

export default async function ChairCategoryPage({ params, searchParams }: Props) {
  const { categoria } = await params;
  if (!validSlugs.includes(categoria as ChairCategory)) notFound();
  const meta = chairCategories.find((c) => c.slug === categoria)!;
  const sp = await searchParams;
  const parsed = parseParams(sp);
  const pathname = `/cadeiras/${categoria}`;

  return (
    <CategoryListing
      pathname={pathname}
      breadcrumbItems={categoryBreadcrumb("cadeiras", categoria)}
      title={meta.name}
      description={meta.description}
      products={chairs.filter((c) => c.category === categoria)}
      parsed={parsed}
      facetGroups={chairFacetGroups}
      faqs={FAQ_LIBRARY.nr17}
      tone="b2c"
      topCopy={
        <p>
          {meta.description}{" "}
          {categoria === "gamer" && (
            <>
              Modelos reforçados usam <strong>pistão classe 3</strong> e base de aço — veja{" "}
              <Link href="/guias/cadeira-reforcada-150kg-o-que-muda" className="font-semibold text-brand underline">
                o que muda numa cadeira de 150 kg
              </Link>
              . Para reposição futura: <Link href="/pecas/pistoes-a-gas?classe=3" className="font-semibold text-b2b underline">pistões classe 3</Link>{" "}
              e <Link href="/pecas/rodizios?material=pu" className="font-semibold text-b2b underline">rodízios PU</Link> da mesma especificação.
            </>
          )}
          {categoria === "ergonomicas-nr-17" && (
            <>
              {" "}Conformidade documentada por laudo:{" "}
              <Link href="/guias/nr-17-exigencia-cadeiras-escritorio" className="font-semibold text-brand underline">
                o que a NR-17 exige das cadeiras de escritório
              </Link>
              .
            </>
          )}
          {categoria === "mochos" && (
            <>
              {" "}Para clínicas, combine com{" "}
              <Link href="/pecas/rodizios?material=silicone" className="font-semibold text-b2b underline">
                rodízios de silicone silenciosos
              </Link>
              .
            </>
          )}
        </p>
      }
      guideLinks={[
        { href: "/guias/nr-17-exigencia-cadeiras-escritorio", label: "NR-17: o que a norma exige" },
        { href: "/guias/cadeira-reforcada-150kg-o-que-muda", label: "Cadeira 150 kg: o que muda" },
        { href: "/guias/como-medir-pistao-de-cadeira", label: "Como medir o pistão" },
      ]}
    />
  );
}
