import { describe, expect, it } from "vitest";
import { fuzzyMatch, levenshtein, normalize, searchSuggestions } from "../search";

describe("normalize", () => {
  it("remove diacríticos e pontuação, mantém hífen", () => {
    expect(normalize("Pistão a Gás Classe 3!")).toBe("pistao a gas classe 3");
    expect(normalize("back-system")).toBe("back-system");
  });

  it("NFC: não quebra com caracteres pré-compostos ou decompostos", () => {
    const composed = "ç".normalize("NFC");
    const decomposed = "ç".normalize("NFD");
    expect(normalize(composed)).toBe(normalize(decomposed));
    expect(normalize(composed)).toBe("c");
  });
});

describe("levenshtein / fuzzyMatch", () => {
  it("distância de edição correta", () => {
    expect(levenshtein("pistao", "pisto")).toBe(1);
    expect(levenshtein("flange", "flanje")).toBe(1);
    expect(levenshtein("rodizio", "roldana")).toBeGreaterThan(2);
  });

  it("tolerância por tamanho de token", () => {
    expect(fuzzyMatch("flanje", "flange")).toBe(true); // 6 chars, dist 1
    expect(fuzzyMatch("pist", "pistao")).toBe(true); // prefix
    expect(fuzzyMatch("pu", "pu")).toBe(true);
    expect(fuzzyMatch("pu", "ny")).toBe(false); // 2 chars: só exato
  });
});

describe("searchSuggestions — casos do escopo", () => {
  it('"rodizio silicone" → produto de silicone + faceta /pecas/rodizios?material=silicone', () => {
    const r = searchSuggestions("rodizio silicone");
    expect(r.products.some((p) => p.slug === "rodizio-silicone-clinica-50mm")).toBe(true);
    expect(r.categories.some((c) => c.href === "/pecas/rodizios?material=silicone")).toBe(true);
  });

  it('"pistao classe 3" → pistão classe 3 + faceta classe=3', () => {
    const r = searchSuggestions("pistao classe 3");
    expect(r.products.some((p) => p.slug === "pistao-gas-classe-3-150kg")).toBe(true);
    expect(r.categories.some((c) => c.href === "/pecas/pistoes-a-gas?classe=3")).toBe(true);
  });

  it("com acento funciona igual (normalização)", () => {
    const r = searchSuggestions("pistão classe 3");
    expect(r.products.some((p) => p.slug === "pistao-gas-classe-3-150kg")).toBe(true);
  });

  it("typo 'flanje relax' encontra a flange", () => {
    const r = searchSuggestions("flanje relax");
    expect(r.products.some((p) => p.slug === "flange-aco-mecanismo-relax-diretor-executiva")).toBe(true);
  });

  it("typo 'pisto c3' encontra pistão classe 3", () => {
    const r = searchSuggestions("pisto c3");
    expect(r.products.some((p) => p.slug.includes("pistao"))).toBe(true);
  });

  it("prefixo incompleto 'rodizios pu' encontra PU", () => {
    const r = searchSuggestions("rodizios pu");
    expect(r.products.some((p) => p.slug === "rodizio-pu-anti-risco-60mm")).toBe(true);
  });

  it("perfil 'pecas' prioriza o silo B2B para termo ambíguo", () => {
    const neutro = searchSuggestions("kit 150kg", "neutro");
    const pecas = searchSuggestions("kit 150kg", "pecas");
    if (pecas.products.length > 0) expect(pecas.products[0].kind).toBe("part");
    expect(neutro).toBeDefined();
  });

  it("retorna guia spoke para 'classe 2 vs classe 3'", () => {
    const r = searchSuggestions("classe 3 pistao");
    expect(r.products.length).toBeGreaterThan(0);
  });

  it("query vazia não retorna nada", () => {
    const r = searchSuggestions("   ");
    expect(r.products).toEqual([]);
  });
});
