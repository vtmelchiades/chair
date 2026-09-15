/**
 * Regras de preço centralizadas (docs/05 §5.2).
 * Dinheiro em CENTAVOS inteiros. Formatação BRL apenas na borda de exibição.
 */
import type { PriceTier, PriceTierId } from "./catalog";

export const PIX_DISCOUNT_RATE = 0.05;

/** Desconto progressivo padrão por tier de atacado. Configurável por categoria no backend. */
export const TIER_DISCOUNTS: Record<PriceTierId, number> = {
  unitario: 0,
  kit5: 0.08,
  kit10: 0.14,
  kit20: 0.2,
};

export const TIER_QUANTITIES: Record<PriceTierId, number> = {
  unitario: 1,
  kit5: 5,
  kit10: 10,
  kit20: 20,
};

export const TIER_ORDER: PriceTierId[] = ["unitario", "kit5", "kit10", "kit20"];

function roundUnitPrice(baseCents: number, discount: number): number {
  return Math.round(baseCents * (1 - discount));
}

/**
 * Constrói a matriz de tiers a partir do preço unitário cheio.
 * Arredondamento POR UNIDADE; total = unit * qty (nunca o inverso) —
 * evita divergência de 1 centavo entre PDP, carrinho e checkout.
 */
export function buildTierMatrix(baseUnitPriceCents: number): PriceTier[] {
  return TIER_ORDER.map((id) => {
    const quantity = TIER_QUANTITIES[id];
    const unitPriceCents = roundUnitPrice(baseUnitPriceCents, TIER_DISCOUNTS[id]);
    return {
      id,
      quantity,
      unitPriceCents,
      totalCents: unitPriceCents * quantity,
      wholesaleOnly: id === "kit20",
    };
  });
}

/** Economia absoluta (centavos) do tier contra qty × preço unitário cheio. */
export function tierSavingCents(baseUnitPriceCents: number, tier: PriceTier): number {
  return baseUnitPriceCents * tier.quantity - tier.totalCents;
}

/** Percentual de economia do tier (0–1) contra qty × preço unitário cheio. */
export function tierSavingRate(baseUnitPriceCents: number, tier: PriceTier): number {
  const full = baseUnitPriceCents * tier.quantity;
  if (full === 0) return 0;
  return (full - tier.totalCents) / full;
}

/** Total com desconto Pix à vista (5%). */
export function pixTotalCents(totalCents: number): number {
  return Math.round(totalCents * (1 - PIX_DISCOUNT_RATE));
}

/** Unitário com Pix. */
export function pixUnitCents(unitPriceCents: number): number {
  return Math.round(unitPriceCents * (1 - PIX_DISCOUNT_RATE));
}

/**
 * Parcelamento sem juros: máximo 6x, parcela mínima R$ 50 (docs/03 §3.1.4).
 * Retorna o número de parcelas exibível (>= 1).
 */
export function maxInterestFreeInstallments(totalCents: number): number {
  return Math.max(1, Math.min(6, Math.floor(totalCents / 5000)));
}

export function installmentCents(totalCents: number, n: number): number {
  return Math.round(totalCents / n);
}

/** Quantidade personalizada B2B (>= 21) usa o preço unitário do tier 20. */
export const CUSTOM_WHOLESALE_MIN_QTY = 21;

export function customWholesaleTotalCents(baseUnitPriceCents: number, qty: number): number {
  const matrix = buildTierMatrix(baseUnitPriceCents);
  const kit20 = matrix.find((t) => t.id === "kit20")!;
  return kit20.unitPriceCents * qty;
}

/* ------------------------------------------------------------------ */
/* Formatação (borda de exibição)                                      */
/* ------------------------------------------------------------------ */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** "R$ 42,05" sem o prefixo — para linhas "por unidade". */
export function formatBRLNumber(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
