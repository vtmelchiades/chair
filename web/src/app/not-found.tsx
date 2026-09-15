/**
 * 404 customizado (docs/04 §4.1): busca + categorias top, nunca beco sem saída.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
      <p className="text-5xl font-black text-brand">404</p>
      <h1 className="mt-3 text-xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-sm text-ink-muted">
        O endereço pode ter mudado na migração da loja. Use a busca do topo ou vá direto às categorias:
      </p>
      <nav aria-label="Categorias principais" className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <Link href="/cadeiras/gamer" className="rounded-full border border-line px-4 py-2 font-semibold hover:border-brand">Cadeiras Gamer</Link>
        <Link href="/cadeiras/ergonomicas-nr-17" className="rounded-full border border-line px-4 py-2 font-semibold hover:border-brand">Ergonômicas NR-17</Link>
        <Link href="/pecas/pistoes-a-gas" className="rounded-full border border-line px-4 py-2 font-semibold hover:border-b2b">Pistões a Gás</Link>
        <Link href="/pecas/rodizios" className="rounded-full border border-line px-4 py-2 font-semibold hover:border-b2b">Rodízios</Link>
        <Link href="/pecas/kits-atacado" className="rounded-full border border-line px-4 py-2 font-semibold hover:border-b2b">Kits Atacado</Link>
      </nav>
      <p className="mt-6 text-sm">
        <a
          href="https://wa.me/5514996642123?text=Ol%C3%A1!%20Cheguei%20a%20um%20404%20no%20site."
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-success underline"
        >
          Falar com a fábrica no WhatsApp
        </a>
      </p>
    </div>
  );
}
