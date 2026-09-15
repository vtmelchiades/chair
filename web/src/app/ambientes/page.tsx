/**
 * Hub de ambientes — /ambientes (docs/01 §1.3).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { environments } from "@/lib/catalog";
import { SITE_URL } from "@/lib/facets";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cadeiras e Peças por Ambiente",
  description:
    "Curadoria por ambiente: home office, corporativo, setup gamer, clínicas e consultórios, templos e igrejas. Cadeiras completas e peças de reposição especificadas para cada uso.",
  alternates: { canonical: `${SITE_URL}/ambientes` },
};

export default function EnvironmentsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Ambientes" },
        ]}
      />
      <h1 className="text-2xl font-black tracking-tight md:text-3xl">Comprar por ambiente</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink-muted">
        Cada ambiente tem requisitos técnicos diferentes de carga, piso e jornada. As páginas abaixo combinam
        cadeiras dos dois fluxos com as peças de reposição corretas para cada uso.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {environments.map((env) => (
          <Link
            key={env.slug}
            href={`/ambientes/${env.slug}`}
            className="rounded-xl border border-line bg-white p-6 hover:border-brand hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
          >
            <p className="text-lg font-bold text-brand">{env.name}</p>
            <p className="mt-1 text-sm text-ink-muted">{env.pitch}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
