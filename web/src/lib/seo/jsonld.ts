/**
 * Builders de JSON-LD (docs/04). Objetos plain serializados pelo componente
 * <JsonLd/> com escape de <, >, & (segurança contra quebra de HTML/XSS por
 * conteúdo de catálogo).
 */
import { SITE_URL } from "../facets";
import { formatBRLNumber } from "../pricing";
import type { BreadcrumbItem } from "../breadcrumbs";
import type { ChairProduct, PartProduct, PriceTier, Product } from "../catalog";

const ORG_ID = `${SITE_URL}/#organization`;
const BRL = "BRL";
const yuan = (cents: number) => Number((cents / 100).toFixed(2));

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function priceValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return isoDate(d);
}

/* ------------------------------------------------------------------ */
/* Organization + LocalBusiness (docs/04 §4.4)                         */
/* ------------------------------------------------------------------ */

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Chair Cadeiras",
        legalName: "Chair Cadeiras Indústria e Comércio de Cadeiras Ltda",
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/img/logo-chair-cadeiras-512x512.png`,
          width: 512,
          height: 512,
        },
        brand: { "@type": "Brand", name: "Chair Cadeiras" },
        sameAs: [
          "https://www.instagram.com/chair.cadeiras",
          "https://www.facebook.com/chaircadeiras",
          "https://wa.me/5514996642123",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: "+55-14-99664-2123",
            email: "contato@chaircadeiras.com.br",
            areaServed: "BR",
            availableLanguage: "pt-BR",
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: "+55-14-99664-2123",
            email: "atacado@chaircadeiras.com.br",
            areaServed: "BR",
            availableLanguage: "pt-BR",
          },
        ],
      },
      {
        "@type": ["LocalBusiness", "FurnitureStore", "Manufacturer"],
        "@id": `${SITE_URL}/#localbusiness`,
        name: "Chair Cadeiras — Fábrica e Loja",
        parentOrganization: { "@id": ORG_ID },
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/img/fachada-fabrica-jau-1200x630.jpg`,
        telephone: "+55-14-99664-2123",
        email: "contato@chaircadeiras.com.br",
        priceRange: "$$",
        currenciesAccepted: "BRL",
        paymentAccepted: "Pix, Cartão de crédito, Boleto bancário",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Ana Claudina, 1000",
          addressLocality: "Jaú",
          addressRegion: "SP",
          postalCode: "17201-000",
          addressCountry: "BR",
        },
        geo: { "@type": "GeoCoordinates", latitude: -22.2955, longitude: -48.5584 },
        hasMap: "https://www.google.com/maps/search/?api=1&query=Chair+Cadeiras+Jau+SP",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "08:00",
            closes: "12:00",
          },
        ],
        areaServed: { "@type": "Country", name: "Brasil" },
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* BreadcrumbList (docs/04 §4.3)                                       */
/* ------------------------------------------------------------------ */

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: item.href.startsWith("http") ? item.href : SITE_URL + item.href } : {}),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Product + ProductGroup + AggregateOffer (docs/04 §4.2)              */
/* ------------------------------------------------------------------ */

const availabilityMap = {
  in_stock: "https://schema.org/InStock",
  low: "https://schema.org/LimitedAvailability",
  out: "https://schema.org/OutOfStock",
} as const;

function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "BR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
}

function shippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 0, currency: BRL },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "BR" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 12, unitCode: "DAY" },
    },
  };
}

function tierOffer(part: PartProduct, tier: PriceTier) {
  const name =
    tier.id === "unitario"
      ? "Unitário — 1 peça"
      : `Kit ${tier.quantity} peças — R$ ${formatBRLNumber(tier.unitPriceCents)} por unidade`;
  return {
    "@type": "Offer",
    name,
    url: `${SITE_URL}/produto/${part.slug}?tier=${tier.quantity}`,
    priceCurrency: BRL,
    price: yuan(tier.totalCents),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: yuan(tier.unitPriceCents),
      priceCurrency: BRL,
      unitText: "unidade",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "C62" },
    },
    availability: availabilityMap[part.stockStatus],
    itemCondition: "https://schema.org/NewCondition",
    eligibleQuantity: { "@type": "QuantitativeValue", value: tier.quantity, unitCode: "C62" },
  };
}

export function buildPartJsonLd(part: PartProduct) {
  const groupId = `${SITE_URL}/produto/${part.slug}#group`;
  const productId = `${SITE_URL}/produto/${part.slug}#product`;
  const unitTier = part.tiers.find((t) => t.id === "unitario")!;
  const unitPrices = part.tiers.map((t) => t.unitPriceCents);

  const variants = part.tiers.map((tier) => ({
    "@type": "Product",
    "@id": `${SITE_URL}/produto/${part.slug}#${tier.id}`,
    sku: `${part.id.toUpperCase()}-${String(tier.quantity).padStart(2, "0")}`,
    name:
      tier.id === "unitario"
        ? `${part.name} — Unitário`
        : `Kit ${tier.quantity} — ${part.name}`,
    isVariantOf: { "@id": groupId },
    size: `${tier.quantity} ${tier.quantity === 1 ? "unidade" : "unidades"}`,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProductGroup",
        "@id": groupId,
        name: part.name,
        productGroupID: part.slug,
        variesBy: ["https://schema.org/size"],
        hasVariant: variants,
      },
      {
        "@type": "Product",
        "@id": productId,
        sku: part.id.toUpperCase(),
        mpn: part.id.toUpperCase(),
        name: part.name,
        description: part.description,
        brand: { "@type": "Brand", name: "Chair Cadeiras" },
        manufacturer: { "@id": ORG_ID },
        category: part.category,
        image: [`${SITE_URL}/img/${part.slug}-1x1.jpg`, `${SITE_URL}/img/${part.slug}-4x3.jpg`],
        isVariantOf: { "@id": groupId },
        additionalProperty: buildAdditionalProperties(part),
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/produto/${part.slug}`,
          priceCurrency: BRL,
          price: yuan(unitTier.totalCents),
          priceValidUntil: priceValidUntil(),
          availability: availabilityMap[part.stockStatus],
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": ORG_ID },
          shippingDetails: shippingDetails(),
          hasMerchantReturnPolicy: returnPolicy(),
        },
        aggregateOffer: {
          "@type": "AggregateOffer",
          priceCurrency: BRL,
          lowPrice: yuan(Math.min(...unitPrices)),
          highPrice: yuan(Math.max(...unitPrices)),
          offerCount: part.tiers.length,
          availability: availabilityMap[part.stockStatus],
          offers: part.tiers.map((tier) => tierOffer(part, tier)),
        },
      },
    ],
  };
}

function buildAdditionalProperties(part: PartProduct) {
  const props: { "@type": string; name: string; value: string | number; unitCode?: string }[] = [];
  const s = part.specs;
  if (s.gasClass) props.push({ "@type": "PropertyValue", name: "Classe do pistão", value: `Classe ${s.gasClass}` });
  props.push({ "@type": "PropertyValue", name: "Carga máxima", value: s.maxLoadKg, unitCode: "KGM" });
  if (s.columnDiameterMm) props.push({ "@type": "PropertyValue", name: "Diâmetro da coluna", value: s.columnDiameterMm, unitCode: "MMT" });
  if (s.rodDiameterMm) props.push({ "@type": "PropertyValue", name: "Diâmetro da haste", value: s.rodDiameterMm, unitCode: "MMT" });
  if (s.strokeMm) props.push({ "@type": "PropertyValue", name: "Curso do pistão", value: s.strokeMm, unitCode: "MMT" });
  if (s.pinDiameterMm) props.push({ "@type": "PropertyValue", name: "Diâmetro do pino", value: s.pinDiameterMm, unitCode: "MMT" });
  if (s.material) props.push({ "@type": "PropertyValue", name: "Material", value: s.material.toUpperCase() });
  return props;
}

export function buildChairJsonLd(chair: ChairProduct) {
  const groupId = `${SITE_URL}/produto/${chair.slug}#group`;
  const activeVariants = chair.variants.filter((v) => v.available || v.availabilityNote);
  const offers = chair.variants.flatMap((v) =>
    v.colors.map((color) => ({
      "@type": "Offer" as const,
      url: `${SITE_URL}/produto/${chair.slug}?variante=${v.id}&cor=${encodeURIComponent(color)}`,
      priceCurrency: BRL,
      price: yuan(v.priceCents),
      priceValidUntil: priceValidUntil(),
      availability: v.available ? availabilityMap[chair.stockStatus] : ("https://schema.org/PreOrder" as const),
      itemCondition: "https://schema.org/NewCondition",
      color,
      size: `${v.weightCapacityKg} kg`,
      seller: { "@id": ORG_ID },
      shippingDetails: shippingDetails(),
      hasMerchantReturnPolicy: returnPolicy(),
    })),
  );
  const prices = offers.map((o) => o.price);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProductGroup",
        "@id": groupId,
        name: chair.name,
        productGroupID: chair.slug,
        variesBy: ["https://schema.org/color", "https://schema.org/size"],
        hasVariant: activeVariants.map((v) => ({
          "@type": "Product",
          "@id": `${SITE_URL}/produto/${chair.slug}#${v.id}`,
          sku: `${chair.id.toUpperCase()}-${v.id.toUpperCase()}`,
          name: `${chair.shortName} — ${v.weightCapacityKg} kg`,
          isVariantOf: { "@id": groupId },
          size: `${v.weightCapacityKg} kg`,
          color: v.colors.join(", "),
        })),
      },
      {
        "@type": "Product",
        "@id": `${SITE_URL}/produto/${chair.slug}#product`,
        sku: chair.id.toUpperCase(),
        mpn: chair.id.toUpperCase(),
        name: chair.name,
        description: chair.description,
        brand: { "@type": "Brand", name: "Chair Cadeiras" },
        manufacturer: { "@id": ORG_ID },
        category: chair.category,
        image: [`${SITE_URL}/img/${chair.slug}-1x1.jpg`],
        isVariantOf: { "@id": groupId },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Peso suportado", value: chair.maxLoadKg, unitCode: "KGM" },
          { "@type": "PropertyValue", name: "Classe do pistão", value: `Classe ${chair.gasClass}` },
          { "@type": "PropertyValue", name: "Material dos rodízios", value: chair.casterMaterial.toUpperCase() },
          ...(chair.nr17
            ? [{
                "@type": "PropertyValue",
                name: "Conformidade ergonômica",
                value: `NR-17${chair.nr17ReportId ? ` — laudo ${chair.nr17ReportId}` : ""}`,
              }]
            : []),
        ],
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: BRL,
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: offers.length,
          availability: availabilityMap[chair.stockStatus],
          offers,
        },
      },
    ],
  };
}

export function buildProductJsonLd(product: Product) {
  return product.kind === "chair" ? buildChairJsonLd(product) : buildPartJsonLd(product);
}

/* ------------------------------------------------------------------ */
/* ItemList (PLPs) e FAQPage (docs/04 §4.5)                            */
/* ------------------------------------------------------------------ */

export function buildItemListJsonLd(products: Product[], basePath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/produto/${p.slug}`,
      name: p.name,
    })),
    numberOfItems: products.length,
    url: SITE_URL + basePath,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Conteúdo FAQ do silo (docs/04 §4.5) — as perguntas devem estar visíveis na página. */
export const FAQ_LIBRARY: Record<string, FaqItem[]> = {
  nr17: [
    {
      question: "O que a NR-17 exige das cadeiras de escritório?",
      answer:
        "A NR-17 (ergonomia) exige que assentos de trabalho tenham altura ajustável à estatura do trabalhador e à natureza da função, encosto adaptado ao corpo com apoio lombar, borda frontal do assento arredondada, base estável com rodízios adequados ao piso e profundidade que não comprima a circulação das pernas. Cadeiras ergonômicas conformes, como os modelos NR-17 da Chair Cadeiras, oferecem regulagem de altura por pistão a gás, apoio lombar proeminente, encosto com inclinação ajustável e braços reguláveis. O laudo de conformidade do fabricante documenta cada requisito atendido.",
    },
  ],
  pistao: [
    {
      question: "Qual a diferença entre pistão classe 2 e pistão classe 3?",
      answer:
        "A classe indica a espessura da parede do tubo de aço do pistão a gás e sua capacidade de carga certificada. O pistão classe 2 tem parede de 1,5 mm e atende cadeiras de até aproximadamente 100-120 kg de carga de trabalho. O pistão classe 3 tem parede de 2,0 mm ou mais, passa por ensaios mais rigorosos (SGS/BIFMA) e é indicado para cadeiras reforçadas de até 150 kg, com maior durabilidade e menor taxa de perda de pressão (cadeira que desce sozinha). Para uso intenso, corporativo ou usuários acima de 100 kg, a especificação correta é classe 3. Ambos compartilham o cone padrão de 50 mm na maioria das bases estrela do mercado; ao substituir, confira o diâmetro da coluna e o curso.",
    },
    {
      question: "Como medir o pistão da minha cadeira para comprar a reposição certa?",
      answer:
        "Meça três dimensões com trena ou paquímetro: (1) o diâmetro da coluna externa do pistão (parte que entra na base estrela) — o padrão é 50 mm, com variantes de 45 mm; (2) o diâmetro da haste interna (parte que entra no mecanismo/flange) — geralmente 28 mm ou 25 mm; (3) o curso, distância entre a posição mais baixa e a mais alta do assento — comum de 80 a 120 mm. Use o Verificador de Compatibilidade na página do produto para confirmar o encaixe antes da compra. Em caso de dúvida, envie a foto das medidas pelo WhatsApp da fábrica.",
    },
  ],
  rodizio: [
    {
      question: "Rodízio de PU, silicone ou nylon: qual escolher?",
      answer:
        "O material da roda define o atrito com o piso, o ruído e o risco de marcas. Nylon (poliamida): mais rígido e barato, indicado para carpetes e pisos cimentados; pode marcar pisos frios polidos e é mais ruidoso. PU (poliuretano): roda macia com banda dupla, silencioso, não risca porcelanato, laminado e vinílico; é o padrão recomendado para home office e escritórios com piso frio. Silicone: comportamento semelhante ao PU com rodagem ainda mais macia e silenciosa, indicado para clínicas e consultórios. Todos os modelos da Chair Cadeiras usam pino de encaixe de 11 mm, compatível com bucha de 22x22 mm.",
    },
  ],
  atacado: [
    {
      question: "Os kits de atacado têm preço por unidade menor?",
      answer:
        "Sim. A Chair Cadeiras é fabricante e pratica preço regressivo por volume: kits de 5, 10 e 20 unidades reduzem o preço unitário em relação à compra de 1 peça (no pistão classe 3, de R$ 48,90 unitário até R$ 39,12 por unidade no kit 20, economia de 20%). A tabela completa de preço por unidade aparece no seletor de kits da página de cada peça. Para volumes acima de 20 unidades, clientes com CNPJ podem solicitar cotação de atacado pelo WhatsApp com condição específica de frete.",
    },
  ],
};
