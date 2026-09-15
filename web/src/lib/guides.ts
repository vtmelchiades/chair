/**
 * Conteúdo spoke dos guias técnicos (docs/01 §1.5.2).
 * Em produção: CMS headless (docs/02 §2.1); no protótipo, conteúdo tipado.
 */
export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  faqKeys: ("nr17" | "pistao" | "rodizio" | "atacado")[];
  relatedProductSlugs: string[];
  relatedCategoryHref: string;
  relatedCategoryLabel: string;
  sections: GuideSection[];
}

export const guideList: Guide[] = [
  {
    slug: "diferenca-pistao-classe-2-e-classe-3",
    title: "Pistão Classe 2 vs Classe 3: Qual a Diferença?",
    metaTitle: "Pistão Classe 2 vs Classe 3: Qual a Diferença?",
    metaDescription:
      "Classe 2 tem parede de 1,5 mm e atende até 100-120 kg; classe 3 tem parede de 2,0 mm, ensaio SGS e é indicado para cadeiras reforçadas de 150 kg. Veja quando cada um é a especificação correta.",
    faqKeys: ["pistao"],
    relatedProductSlugs: ["pistao-gas-classe-3-150kg", "pistao-gas-classe-2-100kg"],
    relatedCategoryHref: "/pecas/pistoes-a-gas",
    relatedCategoryLabel: "Ver todos os pistões a gás",
    sections: [
      {
        paragraphs: [
          "A classe de um pistão a gás indica a espessura da parede do tubo de aço e o regime de ensaio pelo qual o componente passou. É o dado técnico que define quanta carga o pistão suporta com segurança ao longo do tempo — e o motivo pelo qual uma cadeira 'desce sozinha' prematuramente é quase sempre um pistão de classe inferior ao uso real.",
        ],
      },
      {
        heading: "Pistão classe 2",
        paragraphs: ["Parede do tubo de 1,5 mm. Carga de trabalho de até 100–120 kg. É a especificação de cadeiras executivas, de secretaria e mochos com uso moderado."],
      },
      {
        heading: "Pistão classe 3",
        paragraphs: [
          "Parede de 2,0 mm ou mais, com ensaio SGS/BIFMA (ciclos de carga e perda de pressão). Indicado para cadeiras reforçadas de até 150 kg, uso intenso (8h+/dia), ambientes corporativos e cadeiras gamer.",
        ],
        list: [
          "Maior durabilidade: menor taxa de perda de pressão por ciclo;",
          "Carga certificada de 150 kg com fator de segurança 1,5x;",
          "Mesmo cone padrão de 50 mm do classe 2 na maioria das bases estrela — a substituição é direta quando a coluna confere.",
        ],
      },
      {
        heading: "Qual escolher na reposição",
        paragraphs: [
          "Regra prática: se a cadeira é usada mais de 6 horas por dia, ou por usuário acima de 100 kg, ou é uma cadeira gamer/reforçada, a especificação correta é classe 3. O classe 2 atende postos leves e uso doméstico moderado. Antes de comprar, meça o diâmetro da coluna e da haste — o guia 'como medir o pistão' mostra o passo a passo, e o Verificador de Compatibilidade de cada produto confirma o encaixe.",
        ],
      },
    ],
  },
  {
    slug: "rodizio-pu-vs-silicone-vs-nylon",
    title: "Rodízio PU vs Silicone vs Nylon: Qual Escolher?",
    metaTitle: "Rodízio PU vs Silicone vs Nylon: Qual Escolher?",
    metaDescription:
      "PU não risca porcelanato e é silencioso; silicone é a opção mais macia para clínicas; nylon é econômico para carpete. Compare materiais, piso e ruído antes de trocar os rodízios.",
    faqKeys: ["rodizio"],
    relatedProductSlugs: ["rodizio-pu-anti-risco-60mm", "rodizio-silicone-clinica-50mm", "rodizio-nylon-anti-ruido-50mm"],
    relatedCategoryHref: "/pecas/rodizios",
    relatedCategoryLabel: "Ver todos os rodízios",
    sections: [
      {
        paragraphs: [
          "O material da roda define três coisas: atrito com o piso, ruído de rodagem e risco de marcas. O pino de encaixe é padrão nacional de 11 mm nos três materiais (com bucha de redução 22x22 mm quando a base tem furo maior).",
        ],
      },
      {
        heading: "Comparativo por piso",
        list: [
          "PU (poliuretano): roda macia de banda dupla. Silencioso, não risca porcelanato, laminado e vinílico. Padrão para home office e escritórios com piso frio.",
          "Silicone: rodagem ainda mais macia e silenciosa que o PU. Especificação de clínicas, consultórios e ambientes que exigem silêncio.",
          "Nylon (poliamida): rígido e econômico. Indicado para carpete e piso cimentado; em piso frio polido pode marcar e é mais ruidoso.",
        ],
      },
      {
        heading: "Carga e durabilidade",
        paragraphs: [
          "Cadeiras reforçadas de 150 kg exigem rodízios com estrutura dimensionada para a carga (cada rodízio suporta ~40 kg no conjunto de 5). Ao trocar, substitua os 5 de uma vez: rodízios com desgastes diferentes sobrecarregam a base estrela.",
        ],
      },
    ],
  },
  {
    slug: "nr-17-exigencia-cadeiras-escritorio",
    title: "NR-17: O Que a Norma Exige das Cadeiras de Escritório",
    metaTitle: "NR-17: O Que a Norma Exige das Cadeiras de Escritório",
    metaDescription:
      "Checklist ergonômico da NR-17 para assentos de trabalho: altura ajustável, apoio lombar, borda arredondada, base estável e braços reguláveis. O que o laudo de conformidade documenta.",
    faqKeys: ["nr17"],
    relatedProductSlugs: ["cadeira-ergonomica-nr-17-apoio-lombar-home-office", "cadeira-presidente-ergonomica-nr-17"],
    relatedCategoryHref: "/cadeiras/ergonomicas-nr-17",
    relatedCategoryLabel: "Ver cadeiras ergonômicas NR-17",
    sections: [
      {
        paragraphs: [
          "A NR-17 (ergonomia) regulamenta as condições de trabalho, incluindo o mobiliário do posto de trabalho. Para assentos utilizados em trabalho de digitação e escritório, a norma estabelece requisitos que se traduzem em especificações objetivas de produto.",
        ],
      },
      {
        heading: "Checklist do assento conforme",
        list: [
          "Altura ajustável à estatura do trabalhador e à natureza da função (regulagem por pistão a gás);",
          "Encosto adaptado ao corpo, com apoio lombar proeminente;",
          "Borda frontal do assento arredondada (não comprimir a circulação das pernas);",
          "Base estável, com rodízios adequados ao piso;",
          "Pouca ou nenhuma conformação na base do assento (superfície que não prenda a postura);",
          "Braços reguláveis que permitam ombros relaxados e cotovelos a ~90°.",
        ],
      },
      {
        heading: "Laudo de conformidade",
        paragraphs: [
          "O fabricante documenta o atendimento de cada requisito em laudo técnico (dimensões antropométricas, ensaios de carga e estabilidade). Nas cadeiras NR-17 da Chair Cadeiras, o laudo é referenciado por número em cada PDP e acompanha o produto. Para adequação de postos de trabalho corporativos, o time de engenharia da fábrica atende por WhatsApp e e-mail.",
        ],
      },
    ],
  },
  {
    slug: "como-medir-pistao-de-cadeira",
    title: "Como Medir o Pistão da Sua Cadeira (Passo a Passo)",
    metaTitle: "Como Medir o Pistão da Cadeira para Comprar a Reposição",
    metaDescription:
      "Três medidas definem o pistão certo: diâmetro da coluna (padrão 50 mm), diâmetro da haste (28 ou 25 mm) e curso (80–120 mm). Passo a passo com trena ou paquímetro.",
    faqKeys: ["pistao"],
    relatedProductSlugs: ["pistao-gas-classe-3-150kg", "capa-telescopica-3-estagios-pistao"],
    relatedCategoryHref: "/pecas/pistoes-a-gas",
    relatedCategoryLabel: "Ver pistões a gás",
    sections: [
      {
        paragraphs: [
          "Três medidas identificam o pistão de reposição correto. Com trena (ou paquímetro, para precisão), meça com a cadeira virada de cabeça para baixo.",
        ],
        list: [
          "1. Diâmetro da coluna externa — a parte grossa que entra na base estrela. Padrão de mercado: 50 mm; cadeiras importadas antigas usam 45 mm;",
          "2. Diâmetro da haste interna — a parte fina que entra no mecanismo/flange. Geral: 28 mm; alguns mecanismos antigos: 25 mm;",
          "3. Curso — diferença de altura do assento entre a posição mais baixa e a mais alta. Comum: 80 a 120 mm.",
        ],
      },
      {
        paragraphs: [
          "Com as medidas em mãos, use o Verificador de Compatibilidade na página do pistão: ele confirma o encaixe e indica a classe adequada para a sua carga de uso. Se preferir, envie a foto das medidas pelo WhatsApp da fábrica — a resposta é do time técnico, não de bot.",
        ],
      },
    ],
  },
  {
    slug: "como-trocar-flange-relax",
    title: "Como Trocar a Flange Relax da Cadeira (Guia de Oficina)",
    metaTitle: "Como Trocar a Flange Relax — Guia Passo a Passo",
    metaDescription:
      "Troca da flange relax em 6 passos: remover assento, soltar os 4 parafusos, conferir furação 17x17 cm e haste do pistão, montar a nova flange e testar a trava de inclinação.",
    faqKeys: ["pistao"],
    relatedProductSlugs: ["flange-aco-mecanismo-relax-diretor-executiva", "pistao-gas-classe-3-150kg"],
    relatedCategoryHref: "/pecas/mecanismos?mecanismo=relax",
    relatedCategoryLabel: "Ver mecanismos relax",
    sections: [
      {
        paragraphs: ["A flange relax é o mecanismo de balanço fixado sob o assento. A troca é simples e leva 15 minutos com chave philips e um martelo de borracha."],
        list: [
          "1. Vire a cadeira e remova o assento soltando os 4 parafusos da furação padrão (17 x 17 cm entre centros);",
          "2. Desencaixe o pistão da flange antiga (pode exigir martelo de borracha na lateral do cone — nunca force a haste);",
          "3. Confira a furação do seu assento: 4 furos, 17 x 17 cm entre centros é o padrão diretor/executiva;",
          "4. Fixe a flange nova no assento com os parafusos (aperte em X, sem forçar);",
          "5. Encaixe o pistão no cone da flange nova — o próprio peso da cadeira trava o cone;",
          "6. Teste a alavanca de trava e o manípulo de tensão do balanço antes do uso.",
        ],
      },
      {
        paragraphs: [
          "Se a cadeira também 'desce sozinha', o pistão está no fim da vida útil: aproveite a desmontagem e substitua pelo pistão da classe correta (classe 3 para uso intenso). O kit flange + pistão classe 3 sai com desconto em relação à compra separada nos kits de atacado.",
        ],
      },
    ],
  },
  {
    slug: "cadeira-reforcada-150kg-o-que-muda",
    title: "Cadeira Reforçada 150 kg: O Que Muda de Verdade",
    metaTitle: "Cadeira Reforçada 150 kg — O Que Muda na Construção",
    metaDescription:
      "Base de aço com hastes mais espessas, pistão classe 3 com ensaio SGS, flange relax reforçada e rodízios dimensionados. As diferenças reais entre uma cadeira de 120 kg e uma de 150 kg.",
    faqKeys: ["atacado"],
    relatedProductSlugs: ["cadeira-gamer-gxf-base-metal-150kg", "kit-base-gamer-150kg-estrela-reforcada-rodizios-pu", "pistao-gas-classe-3-150kg"],
    relatedCategoryHref: "/cadeiras/gamer?peso-suportado=150kg",
    relatedCategoryLabel: "Ver cadeiras 150 kg",
    sections: [
      {
        paragraphs: [
          "'Suporta 150 kg' só é verdadeiro quando quatro componentes são redimensionados juntos. Cadeiras que declaram 150 kg mantendo componentes de 120 kg falham no ponto mais fraco — geralmente a base ou o pistão.",
        ],
        list: [
          "Pistão classe 3 com ensaio SGS: parede 2,0 mm, carga certificada com fator de segurança 1,5x;",
          "Base estrela de aço (não nylon): hastes mais espessas e furo central usinado no cone de 50 mm;",
          "Flange/mecanismo reforçado: chapas de aço mais espessas nos pontos de torque do balanço;",
          "Rodízios dimensionados: 40 kg por rodízio no conjunto de 5, com estrutura reforçada.",
        ],
      },
      {
        paragraphs: [
          "Na Chair Cadeiras, os modelos 150 kg (GXF base metálica e Gamer flange relax) saem de fábrica com os quatro componentes reforçados e a especificação é visível na PDP. Para quem já tem uma cadeira de 120 kg e quer reforçá-la, o kit base estrela reforçada + rodízios PU e a troca do pistão por classe 3 elevam a capacidade do conjunto.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guideList.find((g) => g.slug === slug);
}
