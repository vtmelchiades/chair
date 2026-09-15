/**
 * Catálogo estático do protótipo — espelha produtos reais da Chair Cadeiras.
 * Em produção: API própria + Postgres (docs/02 §2.1), consumido via ISR.
 * Dinheiro sempre em CENTAVOS (inteiro). Nunca float.
 */

export type GasClass = 2 | 3;
export type CasterMaterial = "pu" | "silicone" | "nylon";
export type ChairCategory =
  | "ergonomicas-nr-17"
  | "presidente"
  | "diretor"
  | "executiva"
  | "gamer"
  | "mochos";
export type PartCategory =
  | "pistoes-a-gas"
  | "rodizios"
  | "bases-estrela"
  | "mecanismos"
  | "bracos"
  | "assentos-e-encostos"
  | "buchas-e-acabamentos"
  | "kits-atacado";
export type Environment =
  | "home-office"
  | "corporativo"
  | "setup-gamer"
  | "clinicas-e-consultorios"
  | "templos-e-igrejas";

export type PriceTierId = "unitario" | "kit5" | "kit10" | "kit20";

export interface PriceTier {
  id: PriceTierId;
  quantity: number;
  /** preço POR UNIDADE do tier, em centavos */
  unitPriceCents: number;
  /** unitPriceCents * quantity */
  totalCents: number;
  wholesaleOnly?: boolean;
}

export interface PartSpecs {
  gasClass?: GasClass;
  columnDiameterMm: number;
  rodDiameterMm?: number;
  strokeMm?: number;
  maxLoadKg: number;
  pinDiameterMm?: number;
  material?: CasterMaterial | "aco";
  baseType?: "estrela-5" | "estrela-6";
  wheelSetSize?: number;
  mechanism?: "relax" | "flange" | "back-system";
}

export interface ChairVariant {
  id: string;
  weightCapacityKg: number;
  colors: string[];
  priceCents: number;
  compareAtCents?: number;
  available: boolean;
  availabilityNote?: string;
}

export interface ChairProduct {
  kind: "chair";
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: ChairCategory;
  environments: Environment[];
  description: string;
  nr17: boolean;
  nr17ReportId?: string;
  gasClass: GasClass;
  maxLoadKg: number;
  casterMaterial: CasterMaterial;
  dimensions: {
    label: string;
    value: string;
    adjustment: string;
    nr17Ref: string;
  }[];
  variants: ChairVariant[];
  stockStatus: "in_stock" | "low" | "out";
  relatedPartSlugs: string[];
}

export interface PartProduct {
  kind: "part";
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: PartCategory;
  environments: Environment[];
  description: string;
  specs: PartSpecs;
  baseUnitPriceCents: number;
  compareAtCents?: number;
  tiers: PriceTier[];
  stockStatus: "in_stock" | "low" | "out";
  stockQty: number;
  relatedPartSlugs: string[];
  /** cadeiras que usam esta peça de fábrica */
  compatibleChairSlugs: string[];
}

export type Product = ChairProduct | PartProduct;

/* ------------------------------------------------------------------ */
/* Cadeiras (dados de preço auditados do site atual em 2026-09)        */
/* ------------------------------------------------------------------ */

export const chairs: ChairProduct[] = [
  {
    kind: "chair",
    id: "ch-gxf-150",
    slug: "cadeira-gamer-gxf-base-metal-150kg",
    name: "Cadeira Gamer GXF Reforçada com Base Metálica — 150 kg",
    shortName: "Gamer GXF 150 kg",
    category: "gamer",
    environments: ["setup-gamer", "home-office"],
    description:
      "Cadeira gamer reforçada para até 150 kg, com base estrela metálica, pistão a gás classe 3, mecanismo relax com trava e rodízios PU anti-risco. Estrutura testada com fator de segurança 1,5x.",
    nr17: true,
    nr17ReportId: "LAUDO-ERG-2026-014",
    gasClass: 3,
    maxLoadKg: 150,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento (piso → assento)", value: "47–57 cm", adjustment: "Pistão a gás classe 3", nr17Ref: "Altura ajustável à estatura" },
      { label: "Profundidade do assento", value: "50 cm", adjustment: "Fixa", nr17Ref: "38–45 cm recomendada" },
      { label: "Largura útil do assento", value: "54 cm", adjustment: "Fixa", nr17Ref: "≥ 40 cm" },
      { label: "Altura total do encosto", value: "76 cm", adjustment: "Inclinação relax c/ trava", nr17Ref: "Apoio lombar proeminente" },
      { label: "Altura dos braços (piso)", value: "66–73 cm", adjustment: "5 posições", nr17Ref: "Cotovelo ~90°, ombros relaxados" },
      { label: "Diâmetro da base estrela", value: "70 cm (aço)", adjustment: "—", nr17Ref: "Estabilidade com carga 150 kg" },
      { label: "Carga máxima suportada", value: "150 kg", adjustment: "—", nr17Ref: "Fator de segurança 1,5x" },
      { label: "Peso do produto", value: "23,4 kg", adjustment: "—", nr17Ref: "—" },
    ],
    variants: [
      { id: "v120-preto", weightCapacityKg: 120, colors: ["Preto", "Cinza"], priceCents: 98290, compareAtCents: 106590, available: true },
      { id: "v150-preto", weightCapacityKg: 150, colors: ["Preto", "Vermelho"], priceCents: 105990, compareAtCents: 111990, available: true },
      { id: "v150-branco", weightCapacityKg: 150, colors: ["Branco"], priceCents: 105990, available: false, availabilityNote: "Branco 150 kg: sob encomenda — 15 dias úteis" },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "kit-base-gamer-150kg-estrela-reforcada-rodizios-pu", "rodizio-pu-anti-risco-60mm"],
  },
  {
    kind: "chair",
    id: "ch-gxf-120",
    slug: "cadeira-gamer-gxf-base-metal-120kg",
    name: "Cadeira Gamer GXF Premium com Base Metálica — 120 kg",
    shortName: "Gamer GXF 120 kg",
    category: "gamer",
    environments: ["setup-gamer", "home-office"],
    description:
      "Cadeira gamer premium para até 120 kg com base metálica, pistão classe 3, mecanismo relax e revestimento em couro PU de acabamento premium.",
    nr17: true,
    gasClass: 3,
    maxLoadKg: 120,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento", value: "46–56 cm", adjustment: "Pistão a gás", nr17Ref: "Altura ajustável" },
      { label: "Largura útil do assento", value: "52 cm", adjustment: "Fixa", nr17Ref: "≥ 40 cm" },
      { label: "Carga máxima", value: "120 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v120", weightCapacityKg: 120, colors: ["Preto", "Azul"], priceCents: 98290, compareAtCents: 106590, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm"],
  },
  {
    kind: "chair",
    id: "ch-gamer-ergo-120",
    slug: "cadeira-gamer-ergonomica-120kg-base-aco",
    name: "Cadeira Gamer Ergonômica Premium até 120 kg — Base de Aço",
    shortName: "Gamer Ergonômica 120 kg",
    category: "gamer",
    environments: ["setup-gamer"],
    description:
      "Cadeira gamer ergonômica direto da fábrica, base de aço, apoio lombar ajustável e braços 4D. Suporta até 120 kg.",
    nr17: true,
    gasClass: 3,
    maxLoadKg: 120,
    casterMaterial: "nylon",
    dimensions: [
      { label: "Altura do assento", value: "45–55 cm", adjustment: "Pistão a gás", nr17Ref: "Altura ajustável" },
      { label: "Carga máxima", value: "120 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v120", weightCapacityKg: 120, colors: ["Preto"], priceCents: 89990, compareAtCents: 103990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["pistao-gas-classe-3-150kg"],
  },
  {
    kind: "chair",
    id: "ch-gamer-150-flange",
    slug: "cadeira-gamer-150kg-base-aco-flange-relax",
    name: "Cadeira Gamer Premium Reforçada até 150 kg — Flange Relax",
    shortName: "Gamer Reforçada 150 kg",
    category: "gamer",
    environments: ["setup-gamer", "corporativo"],
    description:
      "Cadeira gamer reforçada 150 kg com base de aço, flange relax (mecanismo de balanço com trava), pistão classe 3 e rodízios premium.",
    nr17: true,
    gasClass: 3,
    maxLoadKg: 150,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento", value: "47–57 cm", adjustment: "Pistão classe 3", nr17Ref: "Altura ajustável" },
      { label: "Carga máxima", value: "150 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v150", weightCapacityKg: 150, colors: ["Preto", "Vermelho"], priceCents: 87190, compareAtCents: 105290, available: true },
    ],
    stockStatus: "low",
    relatedPartSlugs: ["flange-aco-mecanismo-relax-diretor-executiva", "pistao-gas-classe-3-150kg"],
  },
  {
    kind: "chair",
    id: "ch-presidente-nr17",
    slug: "cadeira-presidente-ergonomica-nr-17",
    name: "Cadeira Presidente Ergonômica NR-17 com Apoio Lombar",
    shortName: "Presidente NR-17",
    category: "presidente",
    environments: ["corporativo", "home-office"],
    description:
      "Cadeira presidente com certificação de conformidade NR-17: encosto alto com apoio lombar proeminente, braços reguláveis, mecanismo back system e pistão classe 3.",
    nr17: true,
    nr17ReportId: "LAUDO-ERG-2026-002",
    gasClass: 3,
    maxLoadKg: 150,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento", value: "45–57 cm", adjustment: "Pistão classe 3", nr17Ref: "37–45 cm + ajuste" },
      { label: "Altura do encosto", value: "72 cm", adjustment: "Back system", nr17Ref: "Apoio lombar exigido" },
      { label: "Carga máxima", value: "150 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v150", weightCapacityKg: 150, colors: ["Preto"], priceCents: 114990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["mecanismo-back-system-presidente", "pistao-gas-classe-3-150kg"],
  },
  {
    kind: "chair",
    id: "ch-diretor-tela",
    slug: "cadeira-diretor-tela-mesh-ergonomica",
    name: "Cadeira Diretor Tela Mesh Ergonômica — Flange Relax",
    shortName: "Diretor Mesh",
    category: "diretor",
    environments: ["corporativo", "home-office"],
    description:
      "Cadeira diretor com encosto em tela mesh respirável, apoio lombar, flange relax em aço e braços reguláveis. Conformidade NR-17.",
    nr17: true,
    gasClass: 3,
    maxLoadKg: 120,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento", value: "45–55 cm", adjustment: "Pistão a gás", nr17Ref: "Altura ajustável" },
      { label: "Carga máxima", value: "120 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v120", weightCapacityKg: 120, colors: ["Preto", "Cinza"], priceCents: 68990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["flange-aco-mecanismo-relax-diretor-executiva", "base-estrela-aco-diretor-capa-nylon"],
  },
  {
    kind: "chair",
    id: "ch-executiva-secretaria",
    slug: "cadeira-executiva-giratoria-secretaria",
    name: "Cadeira Executiva Giratória para Escritório e Secretaria",
    shortName: "Executiva Giratória",
    category: "executiva",
    environments: ["corporativo"],
    description:
      "Cadeira executiva giratória com flange fixa, pistão classe 2 e rodízios nylon. Indicada para postos de atendimento e secretaria.",
    nr17: false,
    gasClass: 2,
    maxLoadKg: 100,
    casterMaterial: "nylon",
    dimensions: [
      { label: "Altura do assento", value: "44–54 cm", adjustment: "Pistão classe 2", nr17Ref: "Altura ajustável" },
      { label: "Carga máxima", value: "100 kg", adjustment: "—", nr17Ref: "—" },
    ],
    variants: [
      { id: "v100", weightCapacityKg: 100, colors: ["Preto"], priceCents: 42990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["pistao-gas-classe-2-100kg", "rodizio-nylon-anti-ruido-50mm"],
  },
  {
    kind: "chair",
    id: "ch-mocho-giratorio",
    slug: "mocho-giratorio-escritorio-clinica",
    name: "Mocho Giratório com Regulagem de Altura — Escritório e Clínicas",
    shortName: "Mocho Giratório",
    category: "mochos",
    environments: ["clinicas-e-consultorios", "corporativo"],
    description:
      "Mocho giratório com revestimento em courino, regulagem de altura por pistão a gás e rodízios anti-risco. Ideal para consultórios, clínicas e postos técnicos.",
    nr17: false,
    gasClass: 2,
    maxLoadKg: 120,
    casterMaterial: "nylon",
    dimensions: [
      { label: "Altura do assento", value: "48–62 cm", adjustment: "Pistão a gás", nr17Ref: "Altura ajustável" },
      { label: "Carga máxima", value: "120 kg", adjustment: "—", nr17Ref: "—" },
    ],
    variants: [
      { id: "v120", weightCapacityKg: 120, colors: ["Preto", "Branco"], priceCents: 25990, compareAtCents: 27990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["rodizio-nylon-anti-ruido-50mm", "pistao-gas-classe-2-100kg"],
  },
  {
    kind: "chair",
    id: "ch-ergo-nr17-lombar",
    slug: "cadeira-ergonomica-nr-17-apoio-lombar-home-office",
    name: "Cadeira Ergonômica NR-17 com Apoio Lombar Ajustável — Home Office",
    shortName: "Ergonômica NR-17",
    category: "ergonomicas-nr-17",
    environments: ["home-office", "corporativo"],
    description:
      "Cadeira ergonômica projetada para jornada de 8h em conformidade com a NR-17: apoio lombar com ajuste de profundidade, braços 3D, assento com borda arredondada e pistão classe 3.",
    nr17: true,
    nr17ReportId: "LAUDO-ERG-2026-001",
    gasClass: 3,
    maxLoadKg: 130,
    casterMaterial: "pu",
    dimensions: [
      { label: "Altura do assento", value: "44–54 cm", adjustment: "Pistão classe 3", nr17Ref: "37–45 cm + ajuste" },
      { label: "Profundidade do assento", value: "46 cm", adjustment: "Fixa, borda arredondada", nr17Ref: "38–45 cm" },
      { label: "Apoio lombar", value: "4 posições de profundidade", adjustment: "Manual", nr17Ref: "Exigido" },
      { label: "Carga máxima", value: "130 kg", adjustment: "—", nr17Ref: "Fator 1,5x" },
    ],
    variants: [
      { id: "v130", weightCapacityKg: 130, colors: ["Preto", "Grafite"], priceCents: 109990, available: true },
    ],
    stockStatus: "in_stock",
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm"],
  },
];

/* ------------------------------------------------------------------ */
/* Peças de reposição                                                  */
/* ------------------------------------------------------------------ */

export const parts: PartProduct[] = [
  {
    kind: "part",
    id: "pt-pistao-c3",
    slug: "pistao-gas-classe-3-150kg",
    name: "Pistão a Gás Classe 3 para Cadeira de Escritório — até 150 kg",
    shortName: "Pistão Classe 3",
    category: "pistoes-a-gas",
    environments: ["home-office", "corporativo", "setup-gamer"],
    description:
      "Pistão a gás classe 3 (parede 2,0 mm, ensaio SGS) para cadeiras de escritório e gamer. Coluna de 50 mm no cone padrão de mercado, curso de 100 mm, carga máxima de 150 kg com fator de segurança 1,5x. Venda unitária e kits de atacado com preço regressivo.",
    specs: { gasClass: 3, columnDiameterMm: 50, rodDiameterMm: 28, strokeMm: 100, maxLoadKg: 150 },
    baseUnitPriceCents: 4890,
    compareAtCents: 5890,
    tiers: [], // preenchido por buildTierMatrix em getPartBySlug
    stockStatus: "in_stock",
    stockQty: 340,
    relatedPartSlugs: ["kit-5-buchas-22x22-pino-11mm", "capa-telescopica-3-estagios-pistao", "base-estrela-aco-diretor-capa-nylon"],
    compatibleChairSlugs: ["cadeira-gamer-gxf-base-metal-150kg", "cadeira-presidente-ergonomica-nr-17"],
  },
  {
    kind: "part",
    id: "pt-pistao-c2",
    slug: "pistao-gas-classe-2-100kg",
    name: "Pistão a Gás Classe 2 para Cadeira de Escritório — até 100 kg",
    shortName: "Pistão Classe 2",
    category: "pistoes-a-gas",
    environments: ["corporativo", "home-office"],
    description:
      "Pistão a gás classe 2 (parede 1,5 mm) para cadeiras executivas, secretária e mochos. Coluna 50 mm, curso 100 mm, carga de trabalho até 100 kg. Opção econômica para reposição em cadeiras leves.",
    specs: { gasClass: 2, columnDiameterMm: 50, rodDiameterMm: 28, strokeMm: 100, maxLoadKg: 100 },
    baseUnitPriceCents: 3490,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 520,
    relatedPartSlugs: ["kit-5-buchas-22x22-pino-11mm", "capa-telescopica-3-estagios-pistao"],
    compatibleChairSlugs: ["cadeira-executiva-giratoria-secretaria", "mocho-giratorio-escritorio-clinica"],
  },
  {
    kind: "part",
    id: "pt-rod-pu-60",
    slug: "rodizio-pu-anti-risco-60mm",
    name: "Rodízio PU Anti-risco 60 mm — Pino 11 mm (par de roda dupla)",
    shortName: "Rodízio PU 60 mm",
    category: "rodizios",
    environments: ["home-office", "setup-gamer", "corporativo"],
    description:
      "Rodízio de PU (poliuretano) com roda dupla de 60 mm, pino de encaixe 11 mm padrão com bucha 22x22 mm. Silencioso e anti-risco para porcelanato, laminado e vinílico. Carga por rodízio: 40 kg.",
    specs: { material: "pu", pinDiameterMm: 11, maxLoadKg: 150, wheelSetSize: 5, columnDiameterMm: 0 },
    baseUnitPriceCents: 1890,
    compareAtCents: 2490,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 1200,
    relatedPartSlugs: ["kit-5-buchas-22x22-pino-11mm", "rodizio-silicone-clinica-50mm", "rodizio-nylon-anti-ruido-50mm"],
    compatibleChairSlugs: ["cadeira-gamer-gxf-base-metal-150kg", "cadeira-ergonomica-nr-17-apoio-lombar-home-office"],
  },
  {
    kind: "part",
    id: "pt-rod-silicone-50",
    slug: "rodizio-silicone-clinica-50mm",
    name: "Rodízio de Silicone para Clínicas 50 mm — Pino 11 mm",
    shortName: "Rodízio Silicone",
    category: "rodizios",
    environments: ["clinicas-e-consultorios"],
    description:
      "Rodízio com banda de silicone: rodagem macia, silenciosa e que não marca piso frio. Indicado para clínicas, consultórios e ambientes hospitalares. Pino 11 mm com bucha padrão.",
    specs: { material: "silicone", pinDiameterMm: 11, maxLoadKg: 120, wheelSetSize: 5, columnDiameterMm: 0 },
    baseUnitPriceCents: 2190,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 800,
    relatedPartSlugs: ["rodizio-pu-anti-risco-60mm", "kit-5-buchas-22x22-pino-11mm"],
    compatibleChairSlugs: ["mocho-giratorio-escritorio-clinica"],
  },
  {
    kind: "part",
    id: "pt-rod-nylon-50",
    slug: "rodizio-nylon-anti-ruido-50mm",
    name: "Rodízio Nylon Anti-risco Anti-ruído 50 mm — Pino 11 mm",
    shortName: "Rodízio Nylon",
    category: "rodizios",
    environments: ["corporativo", "templos-e-igrejas"],
    description:
      "Rodízio de nylon (poliamida) 50 mm para carpetes e pisos cimentados. Econômico e resistente; em piso frio polido recomenda-se PU ou silicone.",
    specs: { material: "nylon", pinDiameterMm: 11, maxLoadKg: 100, wheelSetSize: 5, columnDiameterMm: 0 },
    baseUnitPriceCents: 990,
    compareAtCents: 1590,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 2100,
    relatedPartSlugs: ["rodizio-pu-anti-risco-60mm", "kit-5-buchas-22x22-pino-11mm"],
    compatibleChairSlugs: ["cadeira-executiva-giratoria-secretaria", "mocho-giratorio-escritorio-clinica"],
  },
  {
    kind: "part",
    id: "pt-base-estrela-diretor",
    slug: "base-estrela-aco-diretor-capa-nylon",
    name: "Base Estrela em Aço para Cadeira Diretor com Capa Nylon — 640 mm",
    shortName: "Base Estrela Aço",
    category: "bases-estrela",
    environments: ["corporativo", "home-office"],
    description:
      "Base estrela de aço com 5 hastes (640 mm de diâmetro), furo central cônico de 50 mm para pistão padrão e capa de acabamento em nylon. Suporta cadeiras de até 150 kg.",
    specs: { material: "aco", baseType: "estrela-5", columnDiameterMm: 50, maxLoadKg: 150 },
    baseUnitPriceCents: 8990,
    compareAtCents: 10990,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 180,
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm", "kit-5-buchas-22x22-pino-11mm"],
    compatibleChairSlugs: ["cadeira-diretor-tela-mesh-ergonomica"],
  },
  {
    kind: "part",
    id: "pt-flange-relax",
    slug: "flange-aco-mecanismo-relax-diretor-executiva",
    name: "Flange Relax em Aço — Mecanismo de Balanço para Diretor e Executiva",
    shortName: "Flange Relax",
    category: "mecanismos",
    environments: ["corporativo", "home-office"],
    description:
      "Mecanismo relax (flange de balanço) em aço com trava de inclinação e manípulo de tensão. Furação padrão de 4 furos (17 x 17 cm entre centros) para assentos de cadeira diretor/executiva. Recebe pistão com haste de 28 mm.",
    specs: { mechanism: "relax", rodDiameterMm: 28, columnDiameterMm: 0, maxLoadKg: 130 },
    baseUnitPriceCents: 8090,
    compareAtCents: 9990,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 260,
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "base-estrela-aco-diretor-capa-nylon"],
    compatibleChairSlugs: ["cadeira-diretor-tela-mesh-ergonomica", "cadeira-gamer-150kg-base-aco-flange-relax"],
  },
  {
    kind: "part",
    id: "pt-back-system",
    slug: "mecanismo-back-system-presidente",
    name: "Mecanismo Back System para Cadeira Presidente — Regulagem de Encosto",
    shortName: "Back System",
    category: "mecanismos",
    environments: ["corporativo"],
    description:
      "Back system em aço com regulagem de altura e inclinação do encosto por manivela. Compatível com encostos de cadeira presidente com tubo de 3/4 pol.",
    specs: { mechanism: "back-system", columnDiameterMm: 0, maxLoadKg: 150 },
    baseUnitPriceCents: 6590,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 95,
    relatedPartSlugs: ["flange-aco-mecanismo-relax-diretor-executiva"],
    compatibleChairSlugs: ["cadeira-presidente-ergonomica-nr-17"],
  },
  {
    kind: "part",
    id: "pt-braco-digitador",
    slug: "braco-digitador-regulavel-5-niveis",
    name: "Par de Braço Digitador Regulável 5 Níveis para Cadeira de Escritório",
    shortName: "Braço Digitador",
    category: "bracos",
    environments: ["corporativo", "home-office"],
    description:
      "Par de braços digitador com regulagem de altura em 5 níveis (botão lateral), apoio em PU. Furação padrão para assentos de cadeira executivo/diretor.",
    specs: { columnDiameterMm: 0, maxLoadKg: 120 },
    baseUnitPriceCents: 6490,
    compareAtCents: 8990,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 210,
    relatedPartSlugs: ["flange-aco-mecanismo-relax-diretor-executiva"],
    compatibleChairSlugs: ["cadeira-diretor-tela-mesh-ergonomica"],
  },
  {
    kind: "part",
    id: "pt-buchas-22x22",
    slug: "kit-5-buchas-22x22-pino-11mm",
    name: "Kit 5 Buchas para Cadeira de Escritório 22x22 mm — Encaixe Pino 11 mm",
    shortName: "Buchas 22x22",
    category: "buchas-e-acabamentos",
    environments: ["corporativo", "home-office"],
    description:
      "Bucha de redução 22x22 mm para bases com furo de 22 mm receberem rodízios com pino de 11 mm. Nylon reforçado. Kit com 5 unidades (jogo completo para base estrela de 5 hastes).",
    specs: { pinDiameterMm: 11, material: "nylon", columnDiameterMm: 0, maxLoadKg: 120 },
    baseUnitPriceCents: 1090,
    compareAtCents: 1390,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 900,
    relatedPartSlugs: ["rodizio-pu-anti-risco-60mm", "rodizio-nylon-anti-ruido-50mm"],
    compatibleChairSlugs: [],
  },
  {
    kind: "part",
    id: "pt-capa-telescopica",
    slug: "capa-telescopica-3-estagios-pistao",
    name: "Capa Telescópica 3 Estágios para Pistão de Cadeira",
    shortName: "Capa Telescópica",
    category: "buchas-e-acabamentos",
    environments: ["corporativo", "home-office"],
    description:
      "Capa telescópica de 3 estágios que reveste a coluna do pistão a gás, protegendo contra poeira e melhorando o acabamento. Compatível com pistões de coluna 50 mm, curso de até 100 mm.",
    specs: { columnDiameterMm: 50, maxLoadKg: 150 },
    baseUnitPriceCents: 1190,
    compareAtCents: 1490,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 640,
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "pistao-gas-classe-2-100kg"],
    compatibleChairSlugs: [],
  },
  {
    kind: "part",
    id: "pt-kit-base-gamer-150",
    slug: "kit-base-gamer-150kg-estrela-reforcada-rodizios-pu",
    name: "Kit Base Cadeira Gamer 150 kg — Estrela Reforçada + 5 Rodízios PU Coloridos + Capa",
    shortName: "Kit Base Gamer 150 kg",
    category: "kits-atacado",
    environments: ["setup-gamer"],
    description:
      "Kit completo de base para cadeira gamer reforçada 150 kg: base estrela de aço, 5 rodízios PU coloridos anti-risco e capa telescópica. Componente principal: base estrela.",
    specs: { material: "aco", baseType: "estrela-5", columnDiameterMm: 50, maxLoadKg: 150 },
    baseUnitPriceCents: 15990,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 60,
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "rodizio-pu-anti-risco-60mm"],
    compatibleChairSlugs: ["cadeira-gamer-gxf-base-metal-150kg"],
  },
  {
    kind: "part",
    id: "pt-kit10-pistao-flange",
    slug: "kit-10-pistao-gas-flange-cadeira-giratoria",
    name: "Kit 10 unidades — Pistão a Gás + Flange para Cadeira Giratória (atacado)",
    shortName: "Kit 10x Pistão + Flange",
    category: "kits-atacado",
    environments: ["corporativo"],
    description:
      "Kit atacado com 10 pistões a gás classe 3 e 10 flanges para manutenção de frota de cadeiras giratórias em escritórios e facilities. Preço por conjunto 16% abaixo do unitário.",
    specs: { gasClass: 3, columnDiameterMm: 50, rodDiameterMm: 28, maxLoadKg: 150 },
    baseUnitPriceCents: 61990,
    compareAtCents: 73990,
    tiers: [],
    stockStatus: "in_stock",
    stockQty: 25,
    relatedPartSlugs: ["pistao-gas-classe-3-150kg", "flange-aco-mecanismo-relax-diretor-executiva"],
    compatibleChairSlugs: [],
  },
];

/* ------------------------------------------------------------------ */
/* Matriz de tiers de atacado (docs/05 §5.2) — pré-calculada no módulo */
/* ------------------------------------------------------------------ */

import { buildTierMatrix } from "./pricing";

for (const part of parts) {
  part.tiers = buildTierMatrix(part.baseUnitPriceCents);
}

/* ------------------------------------------------------------------ */
/* Acessadores                                                         */
/* ------------------------------------------------------------------ */

export const products: Product[] = [...chairs, ...parts];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getChairBySlug(slug: string) {
  return chairs.find((c) => c.slug === slug);
}

export function getPartBySlug(slug: string) {
  return parts.find((p) => p.slug === slug);
}

export function getChairsByCategory(category: ChairCategory) {
  return chairs.filter((c) => c.category === category);
}

export function getPartsByCategory(category: PartCategory) {
  return parts.filter((p) => p.category === category);
}

export function getProductsByEnvironment(env: Environment): Product[] {
  return products.filter((p) => p.environments.includes(env));
}

/* Metadados de navegação */

export const chairCategories: { slug: ChairCategory; name: string; description: string }[] = [
  { slug: "ergonomicas-nr-17", name: "Cadeiras Ergonômicas NR-17", description: "Cadeiras com laudo de conformidade ergonômica NR-17: altura ajustável, apoio lombar e braços reguláveis para jornada de 8 horas." },
  { slug: "presidente", name: "Cadeiras Presidente", description: "Encosto alto, back system e acabamento premium para salas de direção." },
  { slug: "diretor", name: "Cadeiras Diretor", description: "Tela mesh ou revestida, flange relax e ergonomia para uso prolongado." },
  { slug: "executiva", name: "Cadeiras Executiva", description: "Giratórias compactas para postos de atendimento, secretaria e estações de trabalho." },
  { slug: "gamer", name: "Cadeiras Gamer", description: "Modelos reforçados direto da fábrica: 120 kg com base metálica ou 150 kg com flange relax e pistão classe 3." },
  { slug: "mochos", name: "Mochos Giratórios", description: "Mochos com regulagem de altura para clínicas, consultórios, laboratórios e postos técnicos." },
];

export const partCategories: { slug: PartCategory; name: string; description: string }[] = [
  { slug: "pistoes-a-gas", name: "Pistões a Gás", description: "Pistões classe 2 (até 100 kg) e classe 3 (até 150 kg), coluna 50 mm padrão, com ensaio SGS. Unitário e kits de atacado com preço regressivo." },
  { slug: "rodizios", name: "Rodízios", description: "Rodízios PU anti-risco, silicone para clínicas e nylon econômico. Pino 11 mm padrão com bucha 22x22 mm." },
  { slug: "bases-estrela", name: "Bases Estrela", description: "Bases de aço e nylon, 5 hastes, furo cônico 50 mm, para cadeiras de até 150 kg." },
  { slug: "mecanismos", name: "Mecanismos", description: "Flange relax, flange fixa e back system em aço para cadeiras diretor, executiva e presidente." },
  { slug: "bracos", name: "Braços", description: "Braços fixos, digitador e reguláveis com furação padrão." },
  { slug: "assentos-e-encostos", name: "Assentos e Encostos", description: "Assentos e encostos injetados com espuma de alta densidade." },
  { slug: "buchas-e-acabamentos", name: "Buchas e Acabamentos", description: "Buchas de redução 22x22 mm, capas telescópicas e acabamentos." },
  { slug: "kits-atacado", name: "Kits Atacado 5x / 10x / 20x", description: "Kits para oficinas, revendas e facilities com preço por unidade regressivo." },
];

export const environments: { slug: Environment; name: string; pitch: string }[] = [
  { slug: "home-office", name: "Home Office", pitch: "Ergonomia NR-17 para jornada de 8h em casa: cadeiras ajustáveis e peças para manutenção." },
  { slug: "corporativo", name: "Corporativo", pitch: "Presidente, diretor e executivas + kits de atacado para facilities manterem a frota." },
  { slug: "setup-gamer", name: "Setup Gamer", pitch: "Cadeiras reforçadas 120/150 kg e kits base estrela + rodízios PU para upgrades." },
  { slug: "clinicas-e-consultorios", name: "Clínicas e Consultórios", pitch: "Mochos giratórios e rodízios de silicone silenciosos que não marcam o piso." },
  { slug: "templos-e-igrejas", name: "Templos e Igrejas", pitch: "Cadeiras empilháveis, longarinas e condições de atacado para grandes quantidades." },
];
