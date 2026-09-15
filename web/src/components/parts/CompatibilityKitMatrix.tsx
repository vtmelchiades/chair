"use client";

/**
 * ============================================================================
 * COMPONENTE CENTRAL — Matriz de Compatibilidade e Kits (Módulo 5)
 * docs/05-componente-matriz-compatibilidade-e-kits.md
 * ============================================================================
 * PDP de peça de reposição. Requisitos do escopo:
 *  1. Alternador unitário/kits com desconto progressivo (Radix Tabs + RadioGroup)
 *  2. Indicador visual de classe do pistão / especificação da base (badges + dl)
 *  3. Badge dinâmico de economia no atacado (% e valor absoluto)
 *  4. CTA acessível WCAG 2.2 AA integrado ao carrinho global
 *
 * INP: trocar de tier não faz fetch — a matriz de preços vem pré-calculada
 * no payload (lib/pricing.ts roda no servidor; o cliente apenas indexa).
 */
import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { PartProduct, PriceTier, PriceTierId } from "@/lib/catalog";
import {
  CUSTOM_WHOLESALE_MIN_QTY,
  formatBRL,
  installmentCents,
  maxInterestFreeInstallments,
  pixTotalCents,
  pixUnitCents,
  tierSavingCents,
  tierSavingRate,
} from "@/lib/pricing";
import { materialLabel } from "@/lib/compatibility";
import { useCart } from "@/components/cart/CartProvider";
import { Badge } from "@/components/ui/primitives";
import { CompatibilityChecker } from "./CompatibilityChecker";

const TIER_LABELS: Record<PriceTierId, string> = {
  unitario: "1 unidade",
  kit5: "Kit 5 unidades",
  kit10: "Kit 10 unidades",
  kit20: "Kit 20 unidades",
};

export function CompatibilityKitMatrix({ part }: { part: PartProduct }) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<"unitario" | "kits">("unitario");
  const [tierId, setTierId] = useState<PriceTierId>("kit10");
  const [multiplier, setMultiplier] = useState(1);
  const [customQty, setCustomQty] = useState("");
  const [customQtyError, setCustomQtyError] = useState<string | null>(null);

  const kitTiers = useMemo(() => part.tiers.filter((t) => t.quantity > 1), [part.tiers]);
  const activeTier: PriceTier =
    mode === "unitario" ? part.tiers.find((t) => t.id === "unitario")! : part.tiers.find((t) => t.id === tierId)!;

  const parsedCustomQty = parseInt(customQty, 10);
  const useCustomQty =
    mode === "kits" &&
    tierId === "kit20" &&
    !Number.isNaN(parsedCustomQty) &&
    parsedCustomQty >= CUSTOM_WHOLESALE_MIN_QTY;
  const totalCents = useCustomQty
    ? activeTier.unitPriceCents * parsedCustomQty
    : activeTier.totalCents * multiplier;
  const totalUnits = useCustomQty ? parsedCustomQty : activeTier.quantity * multiplier;

  const savingRate = tierSavingRate(part.baseUnitPriceCents, activeTier);
  const savingCents = tierSavingCents(part.baseUnitPriceCents, {
    ...activeTier,
    quantity: totalUnits,
    totalCents,
  });
  const nInstallments = maxInterestFreeInstallments(totalCents);

  const ctaLabel = `Adicionar ao carrinho — ${TIER_LABELS[activeTier.id]}${
    multiplier > 1 && !useCustomQty ? ` vezes ${multiplier}` : ""
  }${useCustomQty ? ` com ${parsedCustomQty} unidades` : ""}, ${formatBRL(totalCents)}`;

  const ctaDisabled = totalUnits <= 0 || part.stockStatus === "out";

  const handleAdd = () => {
    if (ctaDisabled) return;
    addItem({
      key: `${part.slug}-${activeTier.id}-${useCustomQty ? "custom" : multiplier}`,
      productId: part.id,
      slug: part.slug,
      name: part.name,
      tierLabel: useCustomQty
        ? `${parsedCustomQty} unidades (atacado CNPJ) — ${formatBRL(activeTier.unitPriceCents)}/un`
        : `${TIER_LABELS[activeTier.id]} — ${formatBRL(activeTier.unitPriceCents)}/un`,
      quantity: useCustomQty ? 1 : multiplier,
      unitsPerTier: useCustomQty ? parsedCustomQty : activeTier.quantity,
      unitPriceCents: activeTier.unitPriceCents,
      totalCents,
    });
  };

  const validateCustomQty = (value: string) => {
    setCustomQty(value);
    const n = parseInt(value, 10);
    if (value === "") {
      setCustomQtyError(null);
      return;
    }
    if (Number.isNaN(n) || n < CUSTOM_WHOLESALE_MIN_QTY) {
      setCustomQtyError(`Quantidade mínima para atacado personalizado: ${CUSTOM_WHOLESALE_MIN_QTY} unidades.`);
    } else {
      setCustomQtyError(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── 2. Indicador visual de classe/especificação (dl semântico) ── */}
      <SpecBadges part={part} />

      {/* ── Verificador de Compatibilidade (docs/03 §3.6.1) ── */}
      <CompatibilityChecker part={part} />

      {/* ── 1. Alternador Unitário / Kits com desconto progressivo ── */}
      <Tabs.Root
        value={mode}
        onValueChange={(v) => setMode(v as "unitario" | "kits")}
        className="rounded-xl border border-line bg-white"
        aria-label="Modalidade de compra"
      >
        <Tabs.List
          aria-label="Alternar entre compra unitária e kits de atacado"
          className="flex border-b border-line"
        >
          <TabTrigger value="unitario">Unitário</TabTrigger>
          <TabTrigger value="kits">
            Kits atacado
            <span className="ml-1.5 rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-black text-success-ink">
              até −20%
            </span>
          </TabTrigger>
        </Tabs.List>

        <Tabs.Content value="unitario" forceMount className="p-4 md:p-5 data-[state=inactive]:hidden">
          <p className="tnum text-3xl font-black">{formatBRL(part.baseUnitPriceCents)}</p>
          <p className="tnum mt-0.5 text-sm font-semibold text-success">
            {formatBRL(pixTotalCents(part.baseUnitPriceCents))} no Pix (−5%)
          </p>
          {nInstallments > 1 && (
            <p className="tnum text-xs text-ink-muted">
              ou {nInstallments}x de {formatBRL(installmentCents(part.baseUnitPriceCents, nInstallments))} sem juros
            </p>
          )}

          <QtyStepper
            label="Quantidade"
            value={multiplier}
            onChange={setMultiplier}
            min={1}
            max={99}
            unitLabel={multiplier > 1 ? "unidades" : "unidade"}
          />
        </Tabs.Content>

        <Tabs.Content value="kits" forceMount className="p-4 md:p-5 data-[state=inactive]:hidden">
          <RadioGroup.Root
            value={tierId}
            onValueChange={(v) => setTierId(v as PriceTierId)}
            aria-label="Selecionar kit de atacado"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {kitTiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                baseUnitPriceCents={part.baseUnitPriceCents}
                selected={tierId === tier.id}
                onSelect={() => setTierId(tier.id)}
              />
            ))}
          </RadioGroup.Root>

          {/* Quantidade personalizada B2B (>= 21, preço do tier 20) */}
          <div className="mt-4 rounded-lg border border-dashed border-b2b/40 bg-b2b-soft/30 p-3">
            <label htmlFor="custom-qty" className="block text-sm font-semibold text-b2b-ink">
              Atacado personalizado (CNPJ) — acima de 20 unidades
            </label>
            <p className="mt-0.5 text-xs text-ink-muted" id="custom-qty-help">
              Preço por unidade do kit 20 ({formatBRL(activeTier.id === "kit20" ? activeTier.unitPriceCents : kitTiers[kitTiers.length - 1].unitPriceCents)}/un).
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="custom-qty"
                type="number"
                inputMode="numeric"
                min={CUSTOM_WHOLESALE_MIN_QTY}
                step={1}
                value={customQty}
                onChange={(e) => validateCustomQty(e.target.value)}
                aria-describedby="custom-qty-help"
                aria-invalid={customQtyError ? true : undefined}
                placeholder="ex.: 40"
                className="tnum h-11 w-32 rounded-lg border border-line bg-white px-3 text-sm focus:border-b2b"
              />
              <span className="text-sm text-ink-muted">unidades</span>
            </div>
            {customQtyError && (
              <p role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                {customQtyError}
              </p>
            )}
          </div>

          <QtyStepper
            label="Quantidade de kits"
            value={useCustomQty ? 1 : multiplier}
            onChange={setMultiplier}
            min={1}
            max={20}
            unitLabel={activeTier.quantity > 1 ? `kits de ${activeTier.quantity}` : "kit"}
            disabled={useCustomQty}
            className="mt-4"
          />
        </Tabs.Content>
      </Tabs.Root>

      {/* ── Resumo de preço do tier selecionado ── */}
      <section
        aria-label="Resumo de preço"
        aria-live="polite"
        className="rounded-xl border border-line bg-bg-subtle p-4"
      >
        <dl className="tnum space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">
              {useCustomQty ? `${parsedCustomQty} unidades (atacado)` : TIER_LABELS[activeTier.id]}
              {multiplier > 1 && !useCustomQty ? ` × ${multiplier}` : ""}
            </dt>
            <dd className="font-black">{formatBRL(totalCents)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">Preço por unidade</dt>
            <dd className="font-bold text-b2b">{formatBRL(activeTier.unitPriceCents)}/un</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">No Pix à vista (−5%)</dt>
            <dd className="font-bold text-success">
              {formatBRL(pixTotalCents(totalCents))} · {formatBRL(pixUnitCents(activeTier.unitPriceCents))}/un
            </dd>
          </div>
          {savingRate > 0 && (
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Economia vs unitário</dt>
              <dd className="font-bold text-success">
                −{formatBRL(savingCents)} ({Math.round(savingRate * 100)}%)
              </dd>
            </div>
          )}
          {nInstallments > 1 && (
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Parcelamento</dt>
              <dd>
                {nInstallments}x de {formatBRL(installmentCents(totalCents, nInstallments))} sem juros
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── 4. CTA acessível integrado ao carrinho ── */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={ctaDisabled}
        aria-disabled={ctaDisabled}
        aria-label={ctaLabel}
        className={`min-h-12 w-full rounded-xl px-6 text-base font-black transition-colors ${
          ctaDisabled
            ? "cursor-not-allowed bg-bg-subtle text-ink-muted"
            : "bg-b2b text-white hover:bg-b2b/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        }`}
      >
        {part.stockStatus === "out"
          ? "Produto indisponível"
          : `ADICIONAR AO CARRINHO — ${formatBRL(totalCents)}`}
      </button>
      <p className="text-center text-xs text-ink-muted">
        Estoque: {part.stockQty} unidades na fábrica · envio em até 1 dia útil · garantia 12 meses
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1 border-b-2 border-transparent px-4 text-sm font-bold text-ink-muted transition-colors hover:text-ink data-[state=active]:border-b2b data-[state=active]:text-b2b-ink"
    >
      {children}
    </Tabs.Trigger>
  );
}

/**
 * Card de tier (RadioGroup.Item): total, preço/un, badge de economia (3)
 * e economia absoluta. Seleção nunca depende só de cor: borda + check + texto.
 */
function TierCard({
  tier,
  baseUnitPriceCents,
  selected,
  onSelect,
}: {
  tier: PriceTier;
  baseUnitPriceCents: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const rate = tierSavingRate(baseUnitPriceCents, tier);
  const saving = tierSavingCents(baseUnitPriceCents, tier);
  const isBest = rate >= 0.19;

  return (
    <RadioGroup.Item
      value={tier.id}
      onClick={onSelect}
      aria-label={`${TIER_LABELS[tier.id]}: total ${formatBRL(tier.totalCents)}, ${formatBRL(tier.unitPriceCents)} por unidade, economia de ${Math.round(rate * 100)} por cento`}
      className={`flex min-h-11 cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors ${
        selected ? "border-b2b bg-b2b-soft/40" : "border-line bg-white hover:border-b2b/50"
      }`}
    >
      <span className="flex w-full items-center justify-between">
        <span className="text-sm font-bold">
          {selected && (
            <span aria-hidden className="mr-1 text-b2b">
              ✓
            </span>
          )}
          {TIER_LABELS[tier.id]}
        </span>
      </span>
      <span className="tnum text-lg font-black">{formatBRL(tier.totalCents)}</span>
      <span className="tnum text-xs font-semibold text-b2b">{formatBRL(tier.unitPriceCents)} /unidade</span>
      {/* 3. Badge dinâmico de economia */}
      <Badge tone="success" className="mt-1">
        {isBest ? `MELHOR PREÇO −${Math.round(rate * 100)}%` : `ECONOMIZE ${Math.round(rate * 100)}%`}
        <span className="tnum font-normal">−{formatBRL(saving)}</span>
      </Badge>
      {tier.wholesaleOnly && (
        <span className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
          atacado · ideal p/ CNPJ
        </span>
      )}
    </RadioGroup.Item>
  );
}

function QtyStepper({
  label,
  value,
  onChange,
  min,
  max,
  unitLabel,
  disabled,
  className = "",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  unitLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span id={`${label}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <div
        className={`flex items-center rounded-lg border border-line ${disabled ? "opacity-50" : ""}`}
        role="group"
        aria-labelledby={`${label}-label`}
      >
        <button
          type="button"
          aria-label={`Diminuir ${label.toLowerCase()}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-11 w-11 items-center justify-center text-xl font-bold text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:text-ink-muted"
        >
          −
        </button>
        <span className="tnum w-10 text-center text-sm font-bold" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Aumentar ${label.toLowerCase()}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-11 w-11 items-center justify-center text-xl font-bold text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:text-ink-muted"
        >
          +
        </button>
      </div>
      <span className="text-xs text-ink-muted">{unitLabel}</span>
    </div>
  );
}

/** 2. Indicador visual de classe do pistão / especificação da base. */
function SpecBadges({ part }: { part: PartProduct }) {
  const s = part.specs;
  return (
    <dl className="flex flex-wrap gap-1.5" aria-label="Especificações técnicas">
      {s.gasClass && (
        <div>
          <dt className="sr-only">Classe do pistão</dt>
          <dd>
            <Badge tone={s.gasClass === 3 ? "brand" : "neutral"}>
              {s.gasClass === 3 ? "◆" : "◇"} Pistão Classe {s.gasClass}
            </Badge>
          </dd>
        </div>
      )}
      {s.columnDiameterMm > 0 && (
        <div>
          <dt className="sr-only">Diâmetro da coluna</dt>
          <dd>
            <Badge tone="neutral">Coluna {s.columnDiameterMm} mm</Badge>
          </dd>
        </div>
      )}
      {s.rodDiameterMm && (
        <div>
          <dt className="sr-only">Diâmetro da haste</dt>
          <dd>
            <Badge tone="neutral">Haste {s.rodDiameterMm} mm</Badge>
          </dd>
        </div>
      )}
      {s.strokeMm && (
        <div>
          <dt className="sr-only">Curso</dt>
          <dd>
            <Badge tone="neutral">Curso {s.strokeMm} mm</Badge>
          </dd>
        </div>
      )}
      {s.pinDiameterMm && (
        <div>
          <dt className="sr-only">Diâmetro do pino</dt>
          <dd>
            <Badge tone="neutral">Pino {s.pinDiameterMm} mm</Badge>
          </dd>
        </div>
      )}
      {s.material && (
        <div>
          <dt className="sr-only">Material</dt>
          <dd>
            <Badge tone="neutral">{materialLabel(s.material)}</Badge>
          </dd>
        </div>
      )}
      {s.baseType && (
        <div>
          <dt className="sr-only">Tipo de base</dt>
          <dd>
            <Badge tone="neutral">Base {s.baseType === "estrela-5" ? "estrela 5 hastes" : "estrela 6 hastes"}</Badge>
          </dd>
        </div>
      )}
      <div>
        <dt className="sr-only">Carga máxima</dt>
        <dd>
          <Badge tone="accent">até {s.maxLoadKg} kg</Badge>
        </dd>
      </div>
    </dl>
  );
}
