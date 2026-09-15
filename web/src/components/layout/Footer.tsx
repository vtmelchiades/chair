/**
 * Rodapé hub-and-spoke (docs/01 §1.5.1) — substitui o bloco
 * "Palavras mais buscadas" do site atual (achado A2).
 * Todo link aponta para categoria curada, landing indexável ou guia.
 * Máx. 24 links de navegação (docs/01 §1.4, regra 5).
 */
import Link from "next/link";

const columns = [
  {
    title: "Cadeiras",
    links: [
      { href: "/cadeiras/ergonomicas-nr-17", label: "Cadeira Ergonômica NR-17" },
      { href: "/cadeiras/presidente", label: "Cadeira Presidente" },
      { href: "/cadeiras/diretor", label: "Cadeira Diretor" },
      { href: "/cadeiras/gamer?peso-suportado=150kg", label: "Cadeira Gamer 150 kg" },
      { href: "/cadeiras/mochos", label: "Mocho Giratório" },
      { href: "/ambientes/templos-e-igrejas", label: "Cadeiras para Igrejas" },
    ],
  },
  {
    title: "Peças e Atacado",
    tone: "b2b" as const,
    links: [
      { href: "/pecas/pistoes-a-gas?classe=3", label: "Pistão a Gás Classe 3" },
      { href: "/pecas/pistoes-a-gas?classe=2", label: "Pistão a Gás Classe 2" },
      { href: "/pecas/rodizios?material=pu", label: "Rodízio PU Anti-risco" },
      { href: "/pecas/rodizios?material=silicone", label: "Rodízio de Silicone" },
      { href: "/pecas/bases-estrela", label: "Base Estrela em Aço" },
      { href: "/pecas/mecanismos?mecanismo=relax", label: "Flange Relax" },
      { href: "/pecas/kits-atacado", label: "Kits Atacado 10x / 20x" },
    ],
  },
  {
    title: "Guias Técnicos",
    links: [
      { href: "/guias/diferenca-pistao-classe-2-e-classe-3", label: "Classe 2 vs Classe 3" },
      { href: "/guias/rodizio-pu-vs-silicone-vs-nylon", label: "Rodízio PU vs Nylon" },
      { href: "/guias/nr-17-exigencia-cadeiras-escritorio", label: "NR-17: o que exige" },
      { href: "/guias/como-medir-pistao-de-cadeira", label: "Como medir o pistão" },
      { href: "/guias/cadeira-reforcada-150kg-o-que-muda", label: "Cadeira 150 kg: o que muda" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { href: "https://wa.me/5514996642123?text=Vim%20pelo%20site", label: "WhatsApp (14) 99664-2123" },
      { href: "/ambientes/corporativo", label: "Atacado e corporativo" },
      { href: "/checkout", label: "Formas de pagamento" },
      { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
      { href: "/privacidade", label: "Política de privacidade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-bg-subtle">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-4">
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className={`mb-3 text-sm font-bold tracking-wide uppercase ${col.tone === "b2b" ? "text-b2b" : "text-brand"}`}>
              {col.title}
            </h2>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted hover:text-ink hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-5 text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            <strong className="text-ink">Chair Cadeiras</strong> — fabricante e distribuidora · Jaú/SP ·
            CNPJ 00.000.000/0001-00 · atendimento seg–sex 8h–18h, sáb 8h–12h
          </p>
          <p className="flex items-center gap-3">
            <span>Pix · Cartão 6x sem juros · Boleto</span>
            <a
              href="https://www.instagram.com/chair.cadeiras"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand hover:underline"
            >
              Instagram
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
