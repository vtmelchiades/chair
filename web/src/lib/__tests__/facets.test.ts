import { describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildQueryString,
  buildRobots,
  parseParams,
} from "../facets";

const PISTOES = "/pecas/pistoes-a-gas";
const GAMER = "/cadeiras/gamer";

describe("parseParams", () => {
  it("mantém apenas parâmetros conhecidos com valores do domínio", () => {
    const p = parseParams({ classe: "3", foo: "bar", material: "madeira", utm_source: "ig" });
    expect(p.facets).toEqual({ classe: ["3"] });
  });

  it("descarta valor fora do domínio", () => {
    const p = parseParams({ classe: "7" });
    expect(p.facets).toEqual({});
  });

  it("aceita múltiplos valores e ordena alfabeticamente", () => {
    const p = parseParams({ material: ["nylon", "pu"] });
    expect(p.facets.material).toEqual(["nylon", "pu"]);
  });

  it("pagina >= 2 é mantida; pagina=1 e inválidas caem para 1", () => {
    expect(parseParams({ pagina: "3" }).page).toBe(3);
    expect(parseParams({ pagina: "1" }).page).toBe(1);
    expect(parseParams({ pagina: "abc" }).page).toBe(1);
    expect(parseParams({ pagina: "-2" }).page).toBe(1);
  });

  it("ordenar inválido cai para relevancia", () => {
    expect(parseParams({ ordenar: "aleatorio" }).sort).toBe("relevancia");
    expect(parseParams({ ordenar: "preco-asc" }).sort).toBe("preco-asc");
  });
});

describe("buildQueryString — ordem alfabética estável", () => {
  it("ordena parâmetros e valores", () => {
    const qs = buildQueryString({ material: ["pu", "nylon"], classe: ["3"] }, "relevancia", 1);
    expect(qs).toBe("?classe=3&material=nylon&material=pu");
  });
});

describe("buildCanonicalUrl — matriz de decisão (docs/01 §1.6.2)", () => {
  it("categoria sem parâmetros → auto-canonical", () => {
    const c = buildCanonicalUrl(PISTOES, parseParams({}));
    expect(c).toBe("https://www.chaircadeiras.com.br/pecas/pistoes-a-gas");
  });

  it("faceta whitelist isolada → canonical própria", () => {
    const c = buildCanonicalUrl(PISTOES, parseParams({ classe: "3" }));
    expect(c).toBe("https://www.chaircadeiras.com.br/pecas/pistoes-a-gas?classe=3");
  });

  it("faceta fora da whitelist → colapsa para a base", () => {
    const c = buildCanonicalUrl(PISTOES, parseParams({ carga: "150kg" }));
    expect(c).toBe("https://www.chaircadeiras.com.br/pecas/pistoes-a-gas");
  });

  it("2 facetas combinadas (classe + carga) → colapsa para a base", () => {
    const c = buildCanonicalUrl(PISTOES, parseParams({ classe: "3", carga: "150kg" }));
    expect(c).toBe("https://www.chaircadeiras.com.br/pecas/pistoes-a-gas");
  });

  it("whitelist + ordenação → canonical sem ordenar", () => {
    const c = buildCanonicalUrl(PISTOES, parseParams({ classe: "3", ordenar: "preco-asc" }));
    expect(c).toBe("https://www.chaircadeiras.com.br/pecas/pistoes-a-gas?classe=3");
  });

  it("paginação mantém canonical própria e combina com whitelist", () => {
    expect(buildCanonicalUrl(PISTOES, parseParams({ pagina: "2" }))).toBe(
      "https://www.chaircadeiras.com.br/pecas/pistoes-a-gas?pagina=2",
    );
    expect(buildCanonicalUrl(PISTOES, parseParams({ classe: "3", pagina: "2" }))).toBe(
      "https://www.chaircadeiras.com.br/pecas/pistoes-a-gas?classe=3&pagina=2",
    );
  });

  it("whitelist vale por rota: classe=3 em /cadeiras/gamer NÃO indexa", () => {
    const c = buildCanonicalUrl(GAMER, parseParams({ classe: "3" }));
    expect(c).toBe("https://www.chaircadeiras.com.br/cadeiras/gamer");
  });
});

describe("buildRobots", () => {
  it("base e whitelist → index,follow", () => {
    expect(buildRobots(PISTOES, parseParams({}))).toBe("index, follow");
    expect(buildRobots(PISTOES, parseParams({ classe: "3" }))).toBe("index, follow");
    expect(buildRobots(GAMER, parseParams({ "peso-suportado": "150kg" }))).toBe("index, follow");
  });

  it("faceta combinada, fora da whitelist ou ordenada → noindex,follow", () => {
    expect(buildRobots(PISTOES, parseParams({ classe: "3", carga: "150kg" }))).toBe("noindex, follow");
    expect(buildRobots(PISTOES, parseParams({ carga: "150kg" }))).toBe("noindex, follow");
    expect(buildRobots(PISTOES, parseParams({ ordenar: "preco-desc" }))).toBe("noindex, follow");
  });
});
