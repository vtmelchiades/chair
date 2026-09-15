"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { searchSuggestions } from "@/lib/search";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function SearchResults() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const results = useMemo(() => searchSuggestions(q, "neutro", 12), [q]);
  const total = results.products.length + results.categories.length + results.guides.length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: `Busca: ${q || "—"}` }]} />
      <h1 className="text-2xl font-black tracking-tight">
        Resultados para “{q}”{" "}
        <span className="text-sm font-medium text-ink-muted">
          ({total} {total === 1 ? "resultado" : "resultados"})
        </span>
      </h1>

      {total === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">Não encontramos “{q}”.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Verifique a grafia ou{" "}
            <a
              className="font-semibold text-success underline"
              href={`https://wa.me/5514996642123?text=${encodeURIComponent(`Olá! Procurei "${q}" no site e não encontrei. Podem me ajudar?`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              pergunte à fábrica no WhatsApp
            </a>
            .
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/pecas/pistoes-a-gas?classe=3" className="rounded-full border border-line px-3 py-1.5 hover:border-b2b">Pistão classe 3</Link>
            <Link href="/pecas/rodizios?material=silicone" className="rounded-full border border-line px-3 py-1.5 hover:border-b2b">Rodízio silicone</Link>
            <Link href="/cadeiras/gamer?peso-suportado=150kg" className="rounded-full border border-line px-3 py-1.5 hover:border-brand">Cadeira gamer 150 kg</Link>
          </div>
        </div>
      )}

      {results.categories.length > 0 && (
        <section aria-label="Categorias" className="mt-6">
          <h2 className="mb-2 text-sm font-black tracking-wide text-ink-muted uppercase">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((c) => (
              <Link key={c.href} href={c.href} className="inline-flex min-h-11 items-center rounded-full bg-brand-soft px-4 text-sm font-bold text-brand hover:bg-brand hover:text-white">
                {c.name} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.products.length > 0 && (
        <section aria-label="Produtos" className="mt-8">
          <h2 className="mb-3 text-sm font-black tracking-wide text-ink-muted uppercase">Produtos</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {results.guides.length > 0 && (
        <section aria-label="Guias" className="mt-8">
          <h2 className="mb-2 text-sm font-black tracking-wide text-ink-muted uppercase">Guias técnicos</h2>
          <ul className="space-y-1.5">
            {results.guides.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline">
                  {g.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
