import { describe, expect, it } from "vitest";
import { checkCompatibility, whatsappLink } from "../compatibility";
import { getPartBySlug } from "../catalog";

const pistaoC3 = getPartBySlug("pistao-gas-classe-3-150kg")!;
const pistaoC2 = getPartBySlug("pistao-gas-classe-2-100kg")!;
const rodizioPu = getPartBySlug("rodizio-pu-anti-risco-60mm")!;
const rodizioNylon = getPartBySlug("rodizio-nylon-anti-ruido-50mm")!;
const flange = getPartBySlug("flange-aco-mecanismo-relax-diretor-executiva")!;

describe("pistões", () => {
  it("coluna 50 mm em base padrão → compatível", () => {
    const r = checkCompatibility(pistaoC3, { chairType: "giratoria-escritorio", measurementMm: 50 });
    expect(r.status).toBe("compatible");
  });

  it("tolerância ±2 mm: coluna 49 mm → compatível", () => {
    const r = checkCompatibility(pistaoC3, { chairType: "gamer", measurementMm: 49 });
    expect(r.status).toBe("compatible");
  });

  it("coluna 45 mm → incompatível com motivo dimensional", () => {
    const r = checkCompatibility(pistaoC3, { chairType: "giratoria-escritorio", measurementMm: 45 });
    expect(r.status).toBe("incompatible");
    expect(r.message).toContain("45 mm");
  });

  it("classe 2 em cadeira gamer → incompatível por classe (encaixe ok, carga não)", () => {
    const r = checkCompatibility(pistaoC2, { chairType: "gamer", measurementMm: 50 });
    expect(r.status).toBe("incompatible");
    expect(r.suggestionSlugs).toContain("pistao-gas-classe-3-150kg");
  });

  it("sem medida → estado 'unknown' pedindo a medida (nunca beco sem saída)", () => {
    const r = checkCompatibility(pistaoC3, { chairType: "outra" });
    expect(r.status).toBe("unknown");
    expect(r.whatsappContext.length).toBeGreaterThan(10);
  });
});

describe("rodízios", () => {
  it("pino 11 mm + furo 11 mm → compatível", () => {
    const r = checkCompatibility(rodizioPu, { chairType: "giratoria-escritorio", measurementMm: 11, secondary: "furo-11mm" });
    expect(r.status).toBe("compatible");
  });

  it("pino 11 mm + base com furo 22 mm → compatível com bucha (adapter)", () => {
    const r = checkCompatibility(rodizioPu, { chairType: "giratoria-escritorio", measurementMm: 11, secondary: "furo-22mm" });
    expect(r.status).toBe("adapter_needed");
    expect(r.suggestionSlugs).toContain("kit-5-buchas-22x22-pino-11mm");
  });

  it("pino 10 mm → incompatível", () => {
    const r = checkCompatibility(rodizioPu, { chairType: "giratoria-escritorio", measurementMm: 10 });
    expect(r.status).toBe("incompatible");
  });

  it("nylon em piso frio → ressalva com alternativa PU/silicone", () => {
    const r = checkCompatibility(rodizioNylon, { chairType: "giratoria-escritorio", measurementMm: 11, secondary: "piso-frio" });
    expect(r.status).toBe("adapter_needed");
    expect(r.suggestionSlugs).toContain("rodizio-pu-anti-risco-60mm");
  });
});

describe("mecanismos", () => {
  it("haste 28 mm → compatível com flange relax", () => {
    const r = checkCompatibility(flange, { chairType: "presidente", measurementMm: 28 });
    expect(r.status).toBe("compatible");
  });

  it("haste 25 mm → incompatível", () => {
    const r = checkCompatibility(flange, { chairType: "presidente", measurementMm: 25 });
    expect(r.status).toBe("incompatible");
  });

  it("furação diferente → adapter com orientação de medida", () => {
    const r = checkCompatibility(flange, { chairType: "giratoria-escritorio", secondary: "furacao-diferente" });
    expect(r.status).toBe("adapter_needed");
  });
});

describe("whatsappLink", () => {
  it("pré-preenche o contexto com as medidas (URL-encoded, UTF-8)", () => {
    const link = whatsappLink("coluna 50 mm, cadeira gamer");
    expect(link.startsWith("https://wa.me/5514996642123?text=")).toBe(true);
    expect(decodeURIComponent(link)).toContain("coluna 50 mm");
  });
});
