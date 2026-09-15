/**
 * Motor de regras do Verificador de Compatibilidade (docs/03 §3.6.1, docs/05).
 * Regras determinísticas por categoria de peça; nunca bloqueia sem saída
 * (alternativas ou WhatsApp com medidas pré-preenchidas).
 */
import type { PartProduct } from "./catalog";

export type ChairTypeAnswer =
  | "giratoria-escritorio"
  | "gamer"
  | "presidente"
  | "mocho"
  | "outra";

export interface CompatibilityAnswers {
  chairType: ChairTypeAnswer;
  /** Medida principal em mm (coluna do pistão, pino do rodízio, haste da flange). */
  measurementMm?: number;
  /** Medida secundária específica da peça. */
  secondary?: string;
}

export type CompatibilityStatus = "compatible" | "adapter_needed" | "incompatible" | "unknown";

export interface CompatibilityResult {
  status: CompatibilityStatus;
  title: string;
  message: string;
  /** slugs de peças complementares (adapter) ou alternativas (incompatible) */
  suggestionSlugs: string[];
  /** mensagem pré-preenchida para o WhatsApp da fábrica */
  whatsappContext: string;
}

const WHATSAPP_NUMBER = "5514996642123";

export function whatsappLink(context: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(context)}`;
}

/**
 * Verifica compatibilidade entre as respostas do usuário e a spec da peça.
 * Tolerância dimensional: ±2 mm na coluna do pistão (cone padrão 48–50 mm).
 */
export function checkCompatibility(
  part: PartProduct,
  answers: CompatibilityAnswers,
): CompatibilityResult {
  const { specs } = part;
  const ctx = `Olá! Vim pelo Verificador de Compatibilidade. Peça: ${part.name}. Minhas medidas: ${describeAnswers(answers)}. Podem confirmar o encaixe?`;

  switch (part.category) {
    case "pistoes-a-gas": {
      const column = answers.measurementMm;
      if (column == null) {
        return {
          status: "unknown",
          title: "Falta uma medida",
          message:
            "Informe o diâmetro da coluna do pistão atual (a parte grossa que entra na base estrela). Veja como medir no guia.",
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      if (Math.abs(column - specs.columnDiameterMm) <= 2) {
        // Verificação de carga: cadeira gamer/presidente costuma exigir classe 3
        if (answers.chairType === "gamer" && specs.gasClass === 2) {
          return {
            status: "incompatible",
            title: "Classe insuficiente para cadeira gamer",
            message:
              "O encaixe físico de 50 mm está correto, mas pistão classe 2 (até 100 kg) não é indicado para cadeiras gamer reforçadas. Use classe 3.",
            suggestionSlugs: ["pistao-gas-classe-3-150kg"],
            whatsappContext: ctx,
          };
        }
        return {
          status: "compatible",
          title: "Compatível",
          message: `Coluna de ${column} mm encaixa no cone padrão de ${specs.columnDiameterMm} mm desta base. Classe ${specs.gasClass} suporta até ${specs.maxLoadKg} kg.`,
          suggestionSlugs: ["kit-5-buchas-22x22-pino-11mm", "capa-telescopica-3-estagios-pistao"],
          whatsappContext: ctx,
        };
      }
      return {
        status: "incompatible",
        title: "Incompatível",
        message: `Sua coluna de ${column} mm não encaixa neste pistão de ${specs.columnDiameterMm} mm. O padrão de mercado é 50 mm; colunas de 45 mm existem em cadeiras importadas antigas.`,
        suggestionSlugs: specs.columnDiameterMm === 50 ? ["pistao-gas-classe-2-100kg"] : ["pistao-gas-classe-3-150kg"],
        whatsappContext: ctx,
      };
    }

    case "rodizios": {
      const pin = answers.measurementMm;
      if (pin == null) {
        return {
          status: "unknown",
          title: "Falta uma medida",
          message: "Informe o diâmetro do pino de encaixe do rodízio atual (o espeto que entra na base).",
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      if (pin !== specs.pinDiameterMm) {
        return {
          status: "incompatible",
          title: "Pino incompatível",
          message: `Seu pino de ${pin} mm não encaixa neste rodízio de ${specs.pinDiameterMm} mm. O padrão nacional é 11 mm; pinos de 10 mm aparecem em cadeiras importadas.`,
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      // Furo da base: 11 mm direto, 22 mm exige bucha de redução
      if (answers.secondary === "furo-22mm") {
        return {
          status: "adapter_needed",
          title: "Compatível com bucha de redução",
          message:
            "O pino de 11 mm encaixa, mas sua base tem furo de 22 mm: é necessário o kit de buchas de redução 22x22 mm (5 unidades por cadeira).",
          suggestionSlugs: ["kit-5-buchas-22x22-pino-11mm"],
          whatsappContext: ctx,
        };
      }
      // Adequação ao piso
      if (answers.secondary === "piso-frio" && specs.material === "nylon") {
        return {
          status: "adapter_needed",
          title: "Compatível, mas não ideal para seu piso",
          message:
            "Nylon funciona, porém em porcelanato/laminado ele pode marcar e faz mais ruído. Para piso frio, PU ou silicone são a especificação correta.",
          suggestionSlugs: ["rodizio-pu-anti-risco-60mm", "rodizio-silicone-clinica-50mm"],
          whatsappContext: ctx,
        };
      }
      return {
        status: "compatible",
        title: "Compatível",
        message: `Pino ${specs.pinDiameterMm} mm padrão nacional, encaixe direto em base com furo de 11 mm (com bucha, em furo de 22 mm). Material ${materialLabel(specs.material)} — carga por rodízio dentro da faixa da sua cadeira.`,
        suggestionSlugs: [],
        whatsappContext: ctx,
      };
    }

    case "bases-estrela": {
      if (answers.secondary === "pistao-45mm") {
        return {
          status: "incompatible",
          title: "Furo central incompatível",
          message:
            "Esta base tem furo cônico de 50 mm. Se o pistão da sua cadeira tem coluna de 45 mm, ele não firma nesta base.",
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      return {
        status: "compatible",
        title: "Compatível",
        message: `Furo central cônico de ${specs.columnDiameterMm} mm — padrão nacional. Recebe pistões classe 2 e 3 com coluna de 48–50 mm. Carga máxima da base: ${specs.maxLoadKg} kg.`,
        suggestionSlugs: ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm"],
        whatsappContext: ctx,
      };
    }

    case "mecanismos": {
      const rod = answers.measurementMm;
      if (rod != null && specs.rodDiameterMm != null && Math.abs(rod - specs.rodDiameterMm) > 2) {
        return {
          status: "incompatible",
          title: "Haste incompatível",
          message: `A haste do seu pistão mede ${rod} mm; esta flange recebe hastes de ${specs.rodDiameterMm} mm.`,
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      if (answers.secondary === "furacao-diferente") {
        return {
          status: "adapter_needed",
          title: "Verifique a furação do assento",
          message:
            "O mecanismo usa furação padrão de 4 furos a 17 x 17 cm entre centros. Se o seu assento tem outra furação, é possível adaptar com furação nova — fale com a fábrica enviando a medida entre centros.",
          suggestionSlugs: [],
          whatsappContext: ctx,
        };
      }
      return {
        status: "compatible",
        title: "Compatível",
        message: `Furação padrão 17 x 17 cm, recebe pistão com haste de ${specs.rodDiameterMm ?? 28} mm. Carga máxima do mecanismo: ${specs.maxLoadKg} kg.`,
        suggestionSlugs: ["pistao-gas-classe-3-150kg"],
        whatsappContext: ctx,
      };
    }

    default:
      return {
        status: "compatible",
        title: "Item universal",
        message:
          "Este item usa medidas padrão de mercado (pino 11 mm / coluna 50 mm). Em caso de dúvida, envie uma foto da sua cadeira pelo WhatsApp.",
        suggestionSlugs: [],
        whatsappContext: ctx,
      };
  }
}

function describeAnswers(a: CompatibilityAnswers): string {
  const parts: string[] = [`cadeira ${a.chairType}`];
  if (a.measurementMm != null) parts.push(`medida ${a.measurementMm} mm`);
  if (a.secondary) parts.push(a.secondary);
  return parts.join(", ");
}

export function materialLabel(m?: string): string {
  switch (m) {
    case "pu":
      return "PU (poliuretano) anti-risco";
    case "silicone":
      return "silicone silencioso";
    case "nylon":
      return "nylon econômico";
    case "aco":
      return "aço";
    default:
      return "—";
  }
}
