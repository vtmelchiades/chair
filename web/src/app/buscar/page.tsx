/**
 * Resultado de busca interna — utilitário, NÃO destino de SEO (docs/01 §1.5.3).
 * noindex, follow. Em produção, reforçar com X-Robots-Tag no edge.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Resultados da busca",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-ink-muted">Carregando busca…</p>}>
      <SearchResults />
    </Suspense>
  );
}
