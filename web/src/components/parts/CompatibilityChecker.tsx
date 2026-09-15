"use client";

/**
 * Verificador de Compatibilidade (docs/03 §3.6.1, docs/05).
 * Guia interativo de 3 passos que decide se a peça encaixa na cadeira do
 * cliente. Regras determinísticas em lib/compatibility.ts.
 * Lazy em produção (next/dynamic ao abrir) — fora do caminho de LCP/INP.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { PartProduct } from "@/lib/catalog";
import {
  checkCompatibility,
  whatsappLink,
  type ChairTypeAnswer,
  type CompatibilityAnswers,
  type CompatibilityResult,
} from "@/lib/compatibility";
import { getProductBySlug } from "@/lib/catalog";

const CHAIR_TYPES: { value: ChairTypeAnswer; label: string }[] = [
  { value: "giratoria-escritorio", label: "Giratória de escritório" },
  { value: "gamer", label: "Gamer" },
  { value: "presidente", label: "Presidente / diretor" },
  { value: "mocho", label: "Mocho" },
  { value: "outra", label: "Outra / não sei" },
];

interface Step2Config {
  label: string;
  help: string;
  guideHref?: string;
}

function step2Config(part: PartProduct): Step2Config | null {
  switch (part.category) {
    case "pistoes-a-gas":
      return {
        label: "Diâmetro da coluna do pistão atual (mm)",
        help: "A parte grossa que entra na base estrela. Padrão de mercado: 50 mm.",
        guideHref: "/guias/como-medir-pistao-de-cadeira",
      };
    case "rodizios":
      return {
        label: "Diâmetro do pino do rodízio atual (mm)",
        help: "O espeto metálico que encaixa na base. Padrão nacional: 11 mm.",
        guideHref: "/guias/como-medir-pistao-de-cadeira",
      };
    case "mecanismos":
      return {
        label: "Diâmetro da haste do pistão (mm)",
        help: "A haste fina que entra no mecanismo/flange. Padrão: 28 mm.",
        guideHref: "/guias/como-medir-pistao-de-cadeira",
      };
    default:
      return null;
  }
}

function step3Config(part: PartProduct): { legend: string; options: { value: string; label: string }[] } | null {
  switch (part.category) {
    case "rodizios":
      return {
        legend: "Furo da base e tipo de piso",
        options: [
          { value: "furo-11mm", label: "Furo de 11 mm (encaixe direto)" },
          { value: "furo-22mm", label: "Furo de 22 mm (precisa de bucha)" },
          { value: "piso-frio", label: "Uso em piso frio (porcelanato/laminado)" },
          { value: "piso-carpete", label: "Uso em carpete/cimentado" },
        ],
      };
    case "bases-estrela":
      return {
        legend: "Coluna do pistão da sua cadeira",
        options: [
          { value: "pistao-50mm", label: "50 mm (padrão nacional)" },
          { value: "pistao-45mm", label: "45 mm (importadas antigas)" },
        ],
      };
    case "mecanismos":
      return {
        legend: "Furação do assento",
        options: [
          { value: "furacao-padrao", label: "Padrão (4 furos, ~17×17 cm entre centros)" },
          { value: "furacao-diferente", label: "Diferente / não sei medir" },
        ],
      };
    default:
      return null;
  }
}

export function CompatibilityChecker({ part }: { part: PartProduct }) {
  const [chairType, setChairType] = useState<ChairTypeAnswer | null>(null);
  const [measurement, setMeasurement] = useState<string>("");
  const [secondary, setSecondary] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const s2 = step2Config(part);
  const s3 = step3Config(part);
  const steps = [1, s2 ? 2 : null, s3 ? 3 : null].filter((v) => v != null) as number[];
  const currentStep = !chairType ? 1 : s2 && !measurement && part.category !== "bases-estrela" ? 2 : s3 && !secondary ? (s2 ? 3 : 2) : steps.length + 1;

  const answers = useMemo<CompatibilityAnswers>(
    () => ({
      chairType: chairType ?? "outra",
      measurementMm: measurement ? Number(measurement) : undefined,
      secondary: secondary ?? undefined,
    }),
    [chairType, measurement, secondary],
  );

  const canSubmit = chairType != null && (!s2 || measurement !== "") && (!s3 || secondary != null);

  const result: CompatibilityResult | null = useMemo(() => {
    if (!showResult || !canSubmit) return null;
    return checkCompatibility(part, answers);
  }, [showResult, canSubmit, part, answers]);

  const tone =
    result?.status === "compatible"
      ? "border-success bg-success-soft/50 text-success-ink"
      : result?.status === "adapter_needed"
        ? "border-accent bg-accent/10 text-ink"
        : result?.status === "incompatible"
          ? "border-danger bg-danger-soft/60 text-ink"
          : "border-line bg-bg-subtle text-ink";

  return (
    <section
      aria-labelledby="compat-title"
      className="rounded-xl border-2 border-b2b/30 bg-white p-4 md:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="compat-title" className="text-sm font-black tracking-wide text-b2b uppercase">
          ✓ Verificador de Compatibilidade
        </h2>
        <p className="tnum text-xs text-ink-muted" aria-live="polite">
          Passo {Math.min(currentStep, steps.length)} de {steps.length}
        </p>
      </div>

      {/* Passo 1 — tipo de cadeira */}
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-semibold">1. Qual é a sua cadeira?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de cadeira">
          {CHAIR_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={chairType === t.value}
              onClick={() => {
                setChairType(t.value);
                setShowResult(false);
              }}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
                chairType === t.value
                  ? "border-b2b bg-b2b text-white"
                  : "border-line bg-white text-ink-muted hover:border-b2b"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Passo 2 — medida principal */}
      {s2 && (
        <fieldset className="mb-4">
          <label htmlFor="compat-measure" className="mb-1 block text-sm font-semibold">
            2. {s2.label}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="compat-measure"
              type="number"
              inputMode="numeric"
              min={5}
              max={120}
              step={1}
              value={measurement}
              onChange={(e) => {
                setMeasurement(e.target.value);
                setShowResult(false);
              }}
              aria-describedby="compat-measure-help"
              className="h-11 w-32 rounded-lg border border-line px-3 text-sm tnum focus:border-b2b"
              placeholder="ex.: 50"
            />
            <span className="text-sm text-ink-muted">mm</span>
          </div>
          <p id="compat-measure-help" className="mt-1 text-xs text-ink-muted">
            {s2.help}{" "}
            {s2.guideHref && (
              <Link href={s2.guideHref} className="font-semibold text-b2b underline">
                Como medir →
              </Link>
            )}
          </p>
        </fieldset>
      )}

      {/* Passo 3 — medida secundária específica da peça */}
      {s3 && (
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold">{steps.length === 3 ? "3" : "2"}. {s3.legend}</legend>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={s3.legend}>
            {s3.options.map((opt) => (
              <label
                key={opt.value}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${
                  secondary === opt.value ? "border-b2b bg-b2b-soft/40 font-semibold" : "border-line hover:border-b2b/50"
                }`}
              >
                <input
                  type="radio"
                  name="compat-secondary"
                  value={opt.value}
                  checked={secondary === opt.value}
                  onChange={() => {
                    setSecondary(opt.value);
                    setShowResult(false);
                  }}
                  className="h-4 w-4 accent-[#0F766E]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => setShowResult(true)}
        className={`min-h-12 w-full rounded-lg px-4 text-sm font-bold transition-colors ${
          canSubmit ? "bg-b2b text-white hover:bg-b2b/90" : "cursor-not-allowed bg-bg-subtle text-ink-muted"
        }`}
      >
        Verificar encaixe
      </button>

      {/* Resultado — nunca é beco sem saída (docs/03 §3.6.1) */}
      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-xl border-2 p-4 ${tone}`}
        >
          <p className="flex items-center gap-2 text-sm font-black">
            <span aria-hidden>
              {result.status === "compatible" ? "✓" : result.status === "adapter_needed" ? "⚠" : result.status === "incompatible" ? "✕" : "?"}
            </span>
            {result.status === "compatible" && "COMPATÍVEL"}
            {result.status === "adapter_needed" && "COMPATÍVEL COM RESSALVA"}
            {result.status === "incompatible" && "INCOMPATÍVEL"}
            {result.status === "unknown" && "FALTAM DADOS"}
            — {result.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{result.message}</p>

          {result.suggestionSlugs.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.suggestionSlugs.map((slug) => {
                const p = getProductBySlug(slug);
                if (!p) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/produto/${slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold hover:border-b2b"
                    >
                      {result.status === "incompatible" ? "Alternativa: " : "Item complementar: "}
                      {p.shortName} →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-3 text-xs">
            <a
              href={whatsappLink(result.whatsappContext)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-success underline"
            >
              Confirmar com a fábrica no WhatsApp (medidas já preenchidas)
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
