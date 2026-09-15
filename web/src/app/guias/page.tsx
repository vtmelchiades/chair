/**
 * Índice de guias técnicos (hub de conteúdo spoke).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { guideList } from "@/lib/guides";
import { SITE_URL } from "@/lib/facets";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Guias Técnicos de Cadeiras e Peças",
  description:
    "Conteúdo técnico da fábrica: diferença entre pistão classe 2 e 3, rodízio PU vs silicone vs nylon, requisitos da NR-17, como medir e trocar peças.",
  alternates: { canonical: `${SITE_URL}/guias` },
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guias Técnicos" },
        ]}
      />
      <h1 className="text-2xl font-black tracking-tight md:text-3xl">Guias técnicos da fábrica</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Especificação de componentes, ergonomia e manutenção — escritos pelo time de produção da Chair Cadeiras.
      </p>
      <div className="mt-6 grid gap-3">
        {guideList.map((g) => (
          <Link
            key={g.slug}
            href={`/guias/${g.slug}`}
            className="rounded-xl border border-line bg-white p-5 hover:border-brand hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
          >
            <p className="font-bold text-brand">{g.title}</p>
            <p className="mt-1 text-sm text-ink-muted">{g.metaDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
