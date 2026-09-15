/**
 * PLP B2B/Reposição — /pecas/[categoria] (docs/01 §1.2).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { partCategories, parts, type PartCategory } from "@/lib/catalog";
import { parseParams, buildCanonicalUrl, buildRobots, isWhitelisted } from "@/lib/facets";
import { categoryBreadcrumb } from "@/lib/breadcrumbs";
import { CategoryListing, type FacetGroupDef } from "@/components/plp/CategoryListing";
import { FAQ_LIBRARY } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const validSlugs = partCategories.map((c) => c.slug);

export function generateStaticParams() {
  return partCategories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const sp = await searchParams;
  if (!validSlugs.includes(categoria as PartCategory)) return {};
  const meta = partCategories.find((c) => c.slug === categoria)!;
  const parsed = parseParams(sp);
  const pathname = `/pecas/${categoria}`;
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

const partFacetGroups: FacetGroupDef[] = [
  {
    param: "classe",
    label: "Classe do pistão",
    options: [
      { value: "2", label: "Classe 2 (até 100 kg)" },
      { value: "3", label: "Classe 3 (até 150 kg)" },
    ],
  },
  {
    param: "carga",
    label: "Carga suportada",
    options: [
      { value: "100kg", label: "100 kg" },
      { value: "120kg", label: "120 kg" },
      { value: "150kg", label: "150 kg" },
    ],
  },
  {
    param: "material",
    label: "Material",
    options: [
      { value: "pu", label: "PU (poliuretano)" },
      { value: "silicone", label: "Silicone" },
      { value: "nylon", label: "Nylon" },
      { value: "aco", label: "Aço" },
    ],
  },
  {
    param: "mecanismo",
    label: "Tipo de mecanismo",
    options: [
      { value: "relax", label: "Relax (balanço c/ trava)" },
      { value: "flange", label: "Flange fixa" },
      { value: "back-system", label: "Back system" },
    ],
  },
  {
    param: "diametro-pino",
    label: "Diâmetro do pino",
    options: [
      { value: "11mm", label: "11 mm (padrão)" },
      { value: "10mm", label: "10 mm (importadas)" },
    ],
  },
  {
    param: "kit",
    label: "Kits de atacado",
    options: [
      { value: "5x", label: "Kit 5 unidades" },
      { value: "10x", label: "Kit 10 unidades" },
      { value: "20x", label: "Kit 20 unidades" },
    ],
  },
];

const faqsByCategory: Record<string, typeof FAQ_LIBRARY.pistao> = {
  "pistoes-a-gas": [...FAQ_LIBRARY.pistao, ...FAQ_LIBRARY.atacado],
  rodizios: [...FAQ_LIBRARY.rodizio, ...FAQ_LIBRARY.atacado],
  "bases-estrela": FAQ_LIBRARY.atacado,
  mecanismos: FAQ_LIBRARY.pistao.slice(1),
  "kits-atacado": FAQ_LIBRARY.atacado,
};

export default async function PartCategoryPage({ params, searchParams }: Props) {
  const { categoria } = await params;
  if (!validSlugs.includes(categoria as PartCategory)) notFound();
  const meta = partCategories.find((c) => c.slug === categoria)!;
  const sp = await searchParams;
  const parsed = parseParams(sp);
  const pathname = `/pecas/${categoria}`;

  return (
    <CategoryListing
      pathname={pathname}
      breadcrumbItems={categoryBreadcrumb("pecas", categoria)}
      title={meta.name}
      description={meta.description}
      products={parts.filter((p) => p.category === categoria)}
      parsed={parsed}
      facetGroups={partFacetGroups}
      faqs={faqsByCategory[categoria]}
      tone="b2b"
      topCopy={
        <p>
          {meta.description}{" "}
          {categoria === "pistoes-a-gas" && (
            <>
              Na dúvida entre as classes, leia{" "}
              <Link href="/guias/diferenca-pistao-classe-2-e-classe-3" className="font-semibold text-b2b underline">
                pistão classe 2 vs classe 3
              </Link>{" "}
              e{" "}
              <Link href="/guias/como-medir-pistao-de-cadeira" className="font-semibold text-b2b underline">
                como medir o pistão da sua cadeira
              </Link>
              . Cada produto tem Verificador de Compatibilidade integrado.
            </>
          )}
          {categoria === "rodizios" && (
            <>
              Compare os materiais em{" "}
              <Link href="/guias/rodizio-pu-vs-silicone-vs-nylon" className="font-semibold text-b2b underline">
                rodízio PU vs silicone vs nylon
              </Link>
              . Pino 11 mm padrão; bases com furo de 22 mm usam{" "}
              <Link href="/produto/kit-5-buchas-22x22-pino-11mm" className="font-semibold text-b2b underline">
                buchas de redução
              </Link>
              .
            </>
          )}
          {categoria === "kits-atacado" && (
            <>
              Preço regressivo por volume: até 20% de desconto no unitário em kits de 20. Para volumes maiores,
              cotação direta com a fábrica pelo WhatsApp.
            </>
          )}
        </p>
      }
      guideLinks={[
        { href: "/guias/diferenca-pistao-classe-2-e-classe-3", label: "Classe 2 vs Classe 3" },
        { href: "/guias/rodizio-pu-vs-silicone-vs-nylon", label: "Rodízio PU vs Nylon" },
        { href: "/guias/como-medir-pistao-de-cadeira", label: "Como medir o pistão" },
        { href: "/guias/como-trocar-flange-relax", label: "Como trocar a flange relax" },
      ]}
    />
  );
}
