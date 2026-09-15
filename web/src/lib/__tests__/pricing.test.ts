import { describe, expect, it } from "vitest";
import {
  buildTierMatrix,
  customWholesaleTotalCents,
  formatBRL,
  installmentCents,
  maxInterestFreeInstallments,
  pixTotalCents,
  tierSavingCents,
  tierSavingRate,
  TIER_DISCOUNTS,
} from "../pricing";

describe("buildTierMatrix", () => {
  const matrix = buildTierMatrix(4890); // R$ 48,90 — pistão classe 3

  it("gera 4 tiers com quantidades 1/5/10/20", () => {
    expect(matrix.map((t) => t.quantity)).toEqual([1, 5, 10, 20]);
  });

  it("preço unitário é regressivo (monotonicamente não crescente)", () => {
    for (let i = 1; i < matrix.length; i++) {
      expect(matrix[i].unitPriceCents).toBeLessThanOrEqual(matrix[i - 1].unitPriceCents);
    }
  });

  it("total = unitPrice * quantity em todos os tiers (sem divergência de centavo)", () => {
    for (const t of matrix) {
      expect(t.totalCents).toBe(t.unitPriceCents * t.quantity);
    }
  });

  it("aplica os descontos progressivos padrão (0/8/14/20%)", () => {
    expect(matrix[0].unitPriceCents).toBe(4890);
    expect(matrix[1].unitPriceCents).toBe(Math.round(4890 * (1 - TIER_DISCOUNTS.kit5))); // 4499
    expect(matrix[2].unitPriceCents).toBe(Math.round(4890 * (1 - TIER_DISCOUNTS.kit10))); // 4205
    expect(matrix[3].unitPriceCents).toBe(Math.round(4890 * (1 - TIER_DISCOUNTS.kit20))); // 3912
  });

  it("todos os valores são inteiros (centavos)", () => {
    for (const t of matrix) {
      expect(Number.isInteger(t.unitPriceCents)).toBe(true);
      expect(Number.isInteger(t.totalCents)).toBe(true);
    }
  });

  it("marca kit20 como wholesaleOnly", () => {
    expect(matrix[3].wholesaleOnly).toBe(true);
    expect(matrix[0].wholesaleOnly).toBeFalsy();
  });
});

describe("economia no atacado", () => {
  it("calcula economia absoluta contra qty x unitário cheio", () => {
    const matrix = buildTierMatrix(4890);
    const kit10 = matrix[2];
    expect(tierSavingCents(4890, kit10)).toBe(4890 * 10 - kit10.totalCents);
  });

  it("percentual de economia do kit20 ≈ 20%", () => {
    const matrix = buildTierMatrix(4890);
    const rate = tierSavingRate(4890, matrix[3]);
    expect(rate).toBeGreaterThan(0.19);
    expect(rate).toBeLessThanOrEqual(0.21); // arredondamento por unidade
  });
});

describe("Pix e parcelamento", () => {
  it("Pix = 5% de desconto sobre o total", () => {
    expect(pixTotalCents(100000)).toBe(95000);
    expect(pixTotalCents(4890)).toBe(4646); // 4645,5 → round
  });

  it("parcelamento sem juros: máx 6x, parcela mínima R$ 50", () => {
    expect(maxInterestFreeInstallments(105990)).toBe(6); // 6x 176,65
    expect(maxInterestFreeInstallments(25990)).toBe(5); // 5x 51,98
    expect(maxInterestFreeInstallments(24000)).toBe(4);
    expect(maxInterestFreeInstallments(1000)).toBe(1);
  });

  it("parcela = total/n arredondado", () => {
    expect(installmentCents(105990, 6)).toBe(17665);
  });
});

describe("quantidade personalizada B2C/CNPJ", () => {
  it("qty >= 21 usa o unitário do tier 20", () => {
    const matrix = buildTierMatrix(4890);
    const kit20Unit = matrix[3].unitPriceCents;
    expect(customWholesaleTotalCents(4890, 25)).toBe(kit20Unit * 25);
  });
});

describe("formatBRL", () => {
  it("formata centavos como moeda brasileira", () => {
    expect(formatBRL(105990)).toMatch(/1\.059,90/);
    expect(formatBRL(4890)).toMatch(/48,90/);
  });
});
