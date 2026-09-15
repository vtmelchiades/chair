"use client";

/**
 * Calculadora de frete com prazos regionais (docs/03 §3.3.4).
 * Slot com min-height reservado (CLS zero, docs/02 §2.4).
 * Protótipo: tabela estática por região via prefixo de CEP.
 * Produção: API da transportadora/Correios com useDeferredValue.
 */
import { useState } from "react";
import { formatBRL, FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY } from "./freight-shared";

interface FreightOption {
  carrier: string;
  daysMin: number;
  daysMax: number;
  priceCents: number;
  free: boolean;
}

type Region = "sudeste" | "sul" | "nordeste" | "norte" | "centro-oeste";

const REGION_BY_PREFIX: [RegExp, Region][] = [
  [/^0|^1/, "sudeste"], // SP
  [/^2[0-8]/, "sudeste"], // RJ
  [/^29/, "sudeste"], // ES
  [/^3/, "sudeste"], // MG
  [/^4|^5[0-7]|^58|^59|^6[0-5]/, "nordeste"], // BA SE PE AL PB RN CE PI MA
  [/^6[6-9]|^76/, "norte"], // PA AP AM AC RR RO
  [/^7[0-5]/, "centro-oeste"], // DF GO
  [/^77|^78|^79/, "centro-oeste"], // TO MT MS
  [/^8|^9/, "sul"], // PR SC RS
];

function regionForCep(cep: string): Region | null {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  for (const [re, region] of REGION_BY_PREFIX) {
    if (re.test(digits)) return region;
  }
  return null;
}

const FREIGHT_TABLE: Record<Region, FreightOption> = {
  sudeste: { carrier: "Transportadora Chair (frota própria)", daysMin: 3, daysMax: 6, priceCents: 3990, free: false },
  sul: { carrier: "Transportadora parceira", daysMin: 4, daysMax: 7, priceCents: 4990, free: false },
  "centro-oeste": { carrier: "Transportadora parceira", daysMin: 7, daysMax: 12, priceCents: 6990, free: false },
  nordeste: { carrier: "Transportadora parceira", daysMin: 6, daysMax: 10, priceCents: 6990, free: false },
  norte: { carrier: "Transportadora parceira", daysMin: 7, daysMax: 12, priceCents: 8990, free: false },
};

const REGION_LABELS: Record<Region, string> = {
  sudeste: "Sudeste (SP, RJ, MG, ES)",
  sul: "Sul (PR, SC, RS)",
  nordeste: "Nordeste",
  norte: "Norte",
  "centro-oeste": "Centro-Oeste",
};

export function FreightCalculator({ subtotalCents }: { subtotalCents: number }) {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<{ region: Region; option: FreightOption } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
  };

  const calculate = () => {
    const region = regionForCep(cep);
    if (!region) {
      setError("CEP inválido. Use o formato 00000-000.");
      setResult(null);
      return;
    }
    const base = FREIGHT_TABLE[region];
    const free = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY;
    setError(null);
    setResult({ region, option: { ...base, free, priceCents: free ? 0 : base.priceCents } });
  };

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="mb-2 text-sm font-bold">Frete e prazo de entrega</p>
      <div className="flex gap-2">
        <label htmlFor="freight-cep" className="sr-only">
          CEP de entrega
        </label>
        <input
          id="freight-cep"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => formatCep(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          aria-describedby={error ? "freight-error" : "freight-help"}
          aria-invalid={error ? true : undefined}
          className="tnum h-11 w-36 rounded-lg border border-line px-3 text-sm focus:border-brand"
        />
        <button
          type="button"
          onClick={calculate}
          className="min-h-11 rounded-lg border border-brand px-4 text-sm font-bold text-brand hover:bg-brand-soft"
        >
          Calcular
        </button>
      </div>
      <p id="freight-help" className="mt-1 text-xs text-ink-muted">
        Frete grátis Sudeste em compras acima de {formatBRL(FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY)}.
      </p>
      {error && (
        <p id="freight-error" role="alert" className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}

      {/* Slot reservado — min-height 112px (docs/02 §2.4) */}
      <div className="mt-3 min-h-28" aria-live="polite">
        {result ? (
          <div className="rounded-lg bg-bg-subtle p-3 text-sm">
            <p className="font-semibold">
              {result.option.carrier} — {REGION_LABELS[result.region]}
            </p>
            <p className="tnum mt-1 text-ink-muted">
              Prazo: {result.option.daysMin}–{result.option.daysMax} dias úteis ·{" "}
              {result.option.free ? (
                <strong className="text-success">Grátis (acima de {formatBRL(FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY)})</strong>
              ) : (
                formatBRL(result.option.priceCents)
              )}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Despacho da fábrica em Jaú/SP em até 1 dia útil.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-ink-muted">
            <caption className="mb-1 text-left font-semibold text-ink">Prazos padrão por região</caption>
            <tbody className="tnum">
              {(Object.keys(FREIGHT_TABLE) as Region[]).map((r) => (
                <tr key={r} className="border-t border-line">
                  <td className="py-1 pr-2">{REGION_LABELS[r]}</td>
                  <td className="py-1 text-right">
                    {FREIGHT_TABLE[r].daysMin}–{FREIGHT_TABLE[r].daysMax} dias úteis
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
