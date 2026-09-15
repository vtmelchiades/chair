"use client";

/**
 * Painel de compra da PDP de cadeira (docs/03 §3.3).
 * Seletor de peso suportado (RadioGroup, altura fixa — CLS zero),
 * cor dependente da capacidade, preço hierarquizado (docs/03 §3.1.4),
 * calculadora de frete e CTA integrado ao carrinho.
 * Combinação indisponível renderiza desabilitada COM MOTIVO (docs/03 §3.3.3).
 */
import { useMemo, useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ChairProduct } from "@/lib/catalog";
import {
  formatBRL,
  installmentCents,
  maxInterestFreeInstallments,
  pixTotalCents,
} from "@/lib/pricing";
import { useCart } from "@/components/cart/CartProvider";
import { Badge } from "@/components/ui/primitives";
import { FreightCalculator } from "./FreightCalculator";

export function ChairPurchasePanel({ chair }: { chair: ChairProduct }) {
  const { addItem } = useCart();

  const capacities = useMemo(
    () => [...new Set(chair.variants.map((v) => v.weightCapacityKg))].sort((a, b) => a - b),
    [chair.variants],
  );

  const firstAvailable =
    chair.variants.find((v) => v.available) ?? chair.variants[0];

  const [capacity, setCapacity] = useState(firstAvailable.weightCapacityKg);
  const [color, setColor] = useState(firstAvailable.colors[0]);

  const variantsForCapacity = useMemo(
    () => chair.variants.filter((v) => v.weightCapacityKg === capacity),
    [chair.variants, capacity],
  );
  const activeVariant =
    variantsForCapacity.find((v) => v.colors.includes(color) && v.available) ??
    variantsForCapacity.find((v) => v.available) ??
    variantsForCapacity[0];
  const activeColor = activeVariant.colors.includes(color) ? color : activeVariant.colors[0];

  const n = maxInterestFreeInstallments(activeVariant.priceCents);
  const unavailableReason = !activeVariant.available ? activeVariant.availabilityNote : null;

  const ctaLabel = `Adicionar ao carrinho — ${chair.shortName}, ${activeVariant.weightCapacityKg} quilos, cor ${activeColor}, ${formatBRL(activeVariant.priceCents)}`;

  const handleAdd = () => {
    if (!activeVariant.available) return;
    addItem({
      key: `${chair.slug}-${activeVariant.id}-${activeColor}`,
      productId: chair.id,
      slug: chair.slug,
      name: chair.name,
      tierLabel: `${activeVariant.weightCapacityKg} kg · ${activeColor}`,
      quantity: 1,
      unitsPerTier: 1,
      unitPriceCents: activeVariant.priceCents,
      totalCents: activeVariant.priceCents,
    });
  };

  return (
    <div className="space-y-5">
      {/* Preço — hierarquia fixa, bloco com altura reservada (docs/03 §3.1.4) */}
      <div className="flex min-h-24 flex-col justify-center gap-0.5">
        {activeVariant.compareAtCents && (
          <p className="tnum text-sm text-ink-muted">
            de <s>{formatBRL(activeVariant.compareAtCents)}</s>
          </p>
        )}
        <p className="tnum text-3xl font-black md:text-4xl">{formatBRL(activeVariant.priceCents)}</p>
        <p className="tnum text-base font-bold text-success">
          {formatBRL(pixTotalCents(activeVariant.priceCents))} no Pix à vista (−5%)
        </p>
        {n > 1 && (
          <p className="tnum text-sm text-ink-muted">
            ou {n}x de {formatBRL(installmentCents(activeVariant.priceCents, n))} sem juros
          </p>
        )}
      </div>

      {/* Seletor de peso suportado — altura fixa por opção (56px), CLS zero */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold tracking-wide uppercase">Peso suportado</legend>
        <RadioGroup.Root
          value={String(capacity)}
          onValueChange={(v) => setCapacity(Number(v))}
          aria-label="Peso suportado"
          className="flex flex-col gap-2"
        >
          {capacities.map((cap) => {
            const capVariants = chair.variants.filter((v) => v.weightCapacityKg === cap);
            const cheapest = Math.min(...capVariants.map((v) => v.priceCents));
            const anyAvailable = capVariants.some((v) => v.available);
            const selected = capacity === cap;
            return (
              <RadioGroup.Item
                key={cap}
                value={String(cap)}
                className={`flex min-h-14 cursor-pointer items-center justify-between rounded-xl border-2 px-4 text-left transition-colors ${
                  selected ? "border-brand bg-brand-soft/50" : "border-line bg-white hover:border-brand/40"
                } ${!anyAvailable ? "opacity-70" : ""}`}
              >
                <span>
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {selected && (
                      <span aria-hidden className="text-brand">
                        ●
                      </span>
                    )}
                    até {cap} kg{cap >= 150 && " (reforçada)"}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {cap >= 150
                      ? "pistão classe 3 · base aço reforçada · rodízio PU"
                      : `pistão classe ${capVariants[0] ? (chair.gasClass ?? 3) : 3} · a partir de ${formatBRL(cheapest)}`}
                  </span>
                  {!anyAvailable && capVariants[0]?.availabilityNote && (
                    <span className="mt-0.5 block text-xs font-semibold text-danger">
                      {capVariants[0].availabilityNote}
                    </span>
                  )}
                </span>
              </RadioGroup.Item>
            );
          })}
        </RadioGroup.Root>
      </fieldset>

      {/* Cor */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold tracking-wide uppercase">Cor</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor">
          {variantsForCapacity.flatMap((v) => v.colors).filter((c, i, arr) => arr.indexOf(c) === i).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={activeColor === c}
              onClick={() => setColor(c)}
              className={`min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                activeColor === c ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Frete — slot reservado (docs/03 §3.3.4) */}
      <FreightCalculator subtotalCents={activeVariant.priceCents} />

      {/* CTA + confiança */}
      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!activeVariant.available}
          aria-disabled={!activeVariant.available}
          aria-label={ctaLabel}
          className={`min-h-12 w-full rounded-xl px-6 text-base font-black transition-colors ${
            activeVariant.available
              ? "bg-brand text-white hover:bg-brand/90"
              : "cursor-not-allowed bg-bg-subtle text-ink-muted"
          }`}
        >
          {activeVariant.available ? `ADICIONAR AO CARRINHO — ${formatBRL(activeVariant.priceCents)}` : "INDISPONÍVEL"}
        </button>
        {unavailableReason && (
          <p role="status" className="mt-1.5 text-center text-xs font-semibold text-danger">
            {unavailableReason}
          </p>
        )}
        <a
          href={`https://wa.me/5514996642123?text=${encodeURIComponent(`Olá! Tenho uma dúvida técnica sobre a ${chair.name}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-success/40 text-sm font-bold text-success hover:bg-success-soft/40"
        >
          💬 Dúvida técnica? Fale com a fábrica no WhatsApp
        </a>
      </div>

      {/* Selos — dados do produto renderizados no servidor; sem inserção client-side */}
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Garantias">
        <Badge tone="success">Pix −5%</Badge>
        <Badge tone="neutral">6x sem juros</Badge>
        <Badge tone="neutral">Garantia 12 meses</Badge>
        <Badge tone="neutral">Devolução 7 dias</Badge>
        <Badge tone="brand">Fábrica Jaú/SP</Badge>
      </ul>
    </div>
  );
}
