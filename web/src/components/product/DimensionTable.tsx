/**
 * Tabela de dimensões antropométricas (docs/03 §3.3.1).
 * Server Component — <table> semântica com <th scope>, nunca injetada por JS.
 */
import type { ChairProduct } from "@/lib/catalog";

export function DimensionTable({ chair }: { chair: ChairProduct }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label="Tabela de dimensões (rolagem horizontal)">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="bg-bg-subtle px-4 py-3 text-left text-sm font-bold">
            Dimensões antropométricas — {chair.shortName}
          </caption>
          <thead>
            <tr className="border-b border-line bg-white text-left text-xs tracking-wide text-ink-muted uppercase">
              <th scope="col" className="px-4 py-2.5">Dimensão</th>
              <th scope="col" className="px-4 py-2.5">Medida</th>
              <th scope="col" className="px-4 py-2.5">Ajuste</th>
              <th scope="col" className="px-4 py-2.5">Referência ergonômica</th>
            </tr>
          </thead>
          <tbody>
            {chair.dimensions.map((d) => (
              <tr key={d.label} className="border-b border-line last:border-0 odd:bg-white even:bg-bg-subtle/50">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {d.label}
                </th>
                <td className="tnum px-4 py-2.5 font-semibold">{d.value}</td>
                <td className="px-4 py-2.5 text-ink-muted">{d.adjustment}</td>
                <td className="px-4 py-2.5 text-ink-muted">{d.nr17Ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Medidas conforme ensaio do fabricante e requisitos de assento/encosto da NR-17 (Portaria 3.751/90 e
        atualização Portaria MTP 423/2021).{" "}
        {chair.nr17ReportId && <>Laudo {chair.nr17ReportId} disponível no selo NR-17.</>}
      </p>
    </div>
  );
}

/** Selo/laudo NR-17 (docs/03 §3.3.2) — details/summary nativo, conteúdo acessível sem JS. */
export function Nr17Seal({ chair }: { chair: ChairProduct }) {
  if (!chair.nr17) return null;
  return (
    <details className="rounded-xl border border-brand/30 bg-brand-soft/40 p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-bold text-brand">
        <span aria-hidden>✓</span> Conformidade ergonômica NR-17
        {chair.nr17ReportId && <span className="text-xs font-medium text-ink-muted">(laudo {chair.nr17ReportId})</span>}
        <span aria-hidden className="ml-auto">▾</span>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-ink-muted">
        <p>Requisitos da NR-17 atendidos por este modelo, documentados em laudo do fabricante:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Altura do assento ajustável à estatura do trabalhador (pistão a gás classe {chair.gasClass});</li>
          <li>Encosto com apoio lombar proeminente e inclinação ajustável;</li>
          <li>Borda frontal do assento arredondada;</li>
          <li>Braços com regulagem de altura;</li>
          <li>Base estável com {chair.casterMaterial === "nylon" ? "rodízios adequados" : "rodízios anti-risco"} e carga certificada de {chair.maxLoadKg} kg (fator de segurança 1,5x).</li>
        </ul>
        <p>
          <a
            href="#"
            className="font-semibold text-brand underline"
            aria-label="Baixar laudo NR-17 em PDF (placeholder do protótipo)"
          >
            Baixar laudo completo (PDF)
          </a>{" "}
          · dúvidas de adequação do posto de trabalho: WhatsApp (14) 99664-2123.
        </p>
      </div>
    </details>
  );
}
