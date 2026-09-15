# Módulo 4 — SEO Técnico e Schemas JSON-LD

## 4.1 SEO técnico — implementação por rota

| Item | Implementação |
|------|---------------|
| `metadataBase` | `new URL('https://www.chaircadeiras.com.br')` em `app/layout.tsx` |
| Titles/descriptions | Templates do Módulo 1 §1.8 via Metadata API por rota; canonical absoluta gerada por `buildCanonicalUrl()` (`lib/facets.ts`) |
| Robots por página | `index,follow` padrão; `noindex,follow` para facetas fora da whitelist, ordenações, `/buscar`, `/checkout`, `/carrinho`, `/conta` |
| `robots.txt` | `app/robots.ts`: Disallow `/buscar`, `/checkout`, `/carrinho`, `/conta`, `/api`; Sitemap apontado |
| `sitemap.xml` | `app/sitemap.ts`: categorias, landings, ambientes, guias, PDPs em estoque (`lastmod` = data de alteração de preço/estoque); nunca URLs facetadas não-whitelist |
| Paginação | indexável com canonical próprio e title "— Página N" (Módulo 1 §1.6.2) |
| 301 | `next.config.ts redirects` + mapa completo de migração (Módulo 1 §1.7) |
| Open Graph/Twitter | `og:title`, `og:description`, `og:image` (1200×630, arte por categoria e foto real por PDP), `og:locale=pt_BR`, `og:type=website|product` |
| Erros | 404 customizado com busca + categorias top; 410 para produtos descontinuados sem substituto; produto esgotado mantém 200 + `availability: BackorderLevel/OutOfStock` e sugere substituto |
| Performance de crawl | HTML ISR ≤ 60 KB, `Cache-Control` correto (Módulo 2), links internos ≤ 60/PLP |
| Indexação de assets | imagens de produto nomeadas `{slug-produto}-{n}.avif` com `alt` = nome técnico |
| Hreflang | não aplicável (apenas pt-BR); `lang="pt-BR"` declarado |

Validação contínua: (1) `JsonLd` renderizado no servidor e validado em CI com schema.org via `vitest` (snapshot + checagem de campos obrigatórios do Google); (2) Rich Results Test manual por template a cada release; (3) crawl semanal (Screaming Frog/Ahrefs) comparando canonical declarado vs servido; (4) Search Console: monitorar "Duplicado sem canonical" e "Páginas com noindex" como KPIs de saúde da facetagem.

## 4.2 JSON-LD 1 — `Product` com variantes e `AggregateOffer` (PDP de peça com kits de atacado)

Caso coberto: Pistão a Gás Classe 3 vendido unitário e em kits 5x/10x/20x. Estrutura: `Product` pai com `isVariantOf` (ProductGroup) para variantes de spec, `offers` unitário e `aggregateOffer` com faixa de/para dos kits, todos `InStock`. Renderizado em `lib/seo/jsonld.ts → buildProductJsonLd()` e injetado via `<JsonLd>` na PDP.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProductGroup",
      "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group",
      "name": "Pistão a Gás Classe 3 para Cadeira de Escritório — até 150 kg",
      "productGroupID": "pistao-gas-classe-3-150kg",
      "variesBy": [
        "https://schema.org/size",
        "https://schema.org/itemCondition"
      ],
      "hasVariant": [
        {
          "@type": "Product",
          "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#unitario",
          "sku": "CHA-PIS-C3-150-01",
          "gtin": "7890000000017",
          "name": "Pistão a Gás Classe 3 para Cadeira de Escritório 150 kg — Unitário",
          "isVariantOf": {
            "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group"
          },
          "size": "1 unidade",
          "image": [
            "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-150kg-1x1.jpg",
            "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-150kg-4x3.jpg",
            "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-150kg-16x9.jpg"
          ],
          "offers": {
            "@type": "Offer",
            "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg",
            "priceCurrency": "BRL",
            "price": 48.9,
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@id": "https://www.chaircadeiras.com.br/#organization"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": 0,
                "currency": "BRL"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "BR"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 3,
                  "maxValue": 12,
                  "unitCode": "DAY"
                }
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "BR",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 7,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn"
            }
          }
        },
        {
          "@type": "Product",
          "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#kit5",
          "sku": "CHA-PIS-C3-150-K05",
          "gtin": "7890000000024",
          "name": "Kit 5 Pistões a Gás Classe 3 para Cadeira de Escritório 150 kg",
          "isVariantOf": {
            "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group"
          },
          "size": "5 unidades",
          "image": [
            "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-kit5-1x1.jpg"
          ]
        },
        {
          "@type": "Product",
          "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#kit10",
          "sku": "CHA-PIS-C3-150-K10",
          "gtin": "7890000000031",
          "name": "Kit 10 Pistões a Gás Classe 3 para Cadeira de Escritório 150 kg",
          "isVariantOf": {
            "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group"
          },
          "size": "10 unidades"
        },
        {
          "@type": "Product",
          "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#kit20",
          "sku": "CHA-PIS-C3-150-K20",
          "gtin": "7890000000048",
          "name": "Kit 20 Pistões a Gás Classe 3 para Cadeira de Escritório 150 kg",
          "isVariantOf": {
            "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group"
          },
          "size": "20 unidades"
        }
      ]
    },
    {
      "@type": "Product",
      "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#product",
      "sku": "CHA-PIS-C3-150",
      "mpn": "PIS-C3-150",
      "name": "Pistão a Gás Classe 3 para Cadeira de Escritório — até 150 kg",
      "description": "Pistão a gás classe 3 (SGS) para cadeiras de escritório e gamer, coluna de 50 mm, curso de 100 mm, carga máxima de 150 kg com fator de segurança 1,5x. Venda unitária e kits de atacado com preço regressivo por unidade.",
      "brand": {
        "@type": "Brand",
        "name": "Chair Cadeiras"
      },
      "manufacturer": {
        "@id": "https://www.chaircadeiras.com.br/#organization"
      },
      "category": "Pistões a Gás para Cadeiras",
      "image": [
        "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-150kg-1x1.jpg",
        "https://www.chaircadeiras.com.br/img/pistao-gas-classe-3-150kg-4x3.jpg"
      ],
      "isVariantOf": {
        "@id": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg#group"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Classe do pistão",
          "value": "Classe 3"
        },
        {
          "@type": "PropertyValue",
          "name": "Carga máxima",
          "value": "150",
          "unitCode": "KGM"
        },
        {
          "@type": "PropertyValue",
          "name": "Diâmetro da coluna",
          "value": "50",
          "unitCode": "MMT"
        },
        {
          "@type": "PropertyValue",
          "name": "Curso do pistão",
          "value": "100",
          "unitCode": "MMT"
        },
        {
          "@type": "PropertyValue",
          "name": "Compatibilidade",
          "value": "Bases estrela com furo central de 48 a 50 mm (cone padrão BIFMA)"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg",
        "priceCurrency": "BRL",
        "price": 48.9,
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://www.chaircadeiras.com.br/#organization"
        }
      },
      "aggregateOffer": {
        "@type": "AggregateOffer",
        "priceCurrency": "BRL",
        "lowPrice": 39.12,
        "highPrice": 48.9,
        "offerCount": 4,
        "availability": "https://schema.org/InStock",
        "offers": [
          {
            "@type": "Offer",
            "name": "Unitário — 1 peça",
            "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg?tier=1",
            "priceCurrency": "BRL",
            "price": 48.9,
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": 48.9,
              "priceCurrency": "BRL",
              "unitText": "unidade",
              "referenceQuantity": {
                "@type": "QuantitativeValue",
                "value": 1,
                "unitCode": "C62"
              }
            },
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "eligibleQuantity": {
              "@type": "QuantitativeValue",
              "value": 1,
              "unitCode": "C62"
            }
          },
          {
            "@type": "Offer",
            "name": "Kit 5 peças — R$ 44,99 por unidade",
            "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg?tier=5",
            "priceCurrency": "BRL",
            "price": 224.95,
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": 44.99,
              "priceCurrency": "BRL",
              "unitText": "unidade",
              "referenceQuantity": {
                "@type": "QuantitativeValue",
                "value": 1,
                "unitCode": "C62"
              }
            },
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "eligibleQuantity": {
              "@type": "QuantitativeValue",
              "value": 5,
              "unitCode": "C62"
            }
          },
          {
            "@type": "Offer",
            "name": "Kit 10 peças — R$ 42,05 por unidade",
            "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg?tier=10",
            "priceCurrency": "BRL",
            "price": 420.5,
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": 42.05,
              "priceCurrency": "BRL",
              "unitText": "unidade",
              "referenceQuantity": {
                "@type": "QuantitativeValue",
                "value": 1,
                "unitCode": "C62"
              }
            },
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "eligibleQuantity": {
              "@type": "QuantitativeValue",
              "value": 10,
              "unitCode": "C62"
            }
          },
          {
            "@type": "Offer",
            "name": "Kit 20 peças — R$ 39,12 por unidade (atacado)",
            "url": "https://www.chaircadeiras.com.br/produto/pistao-gas-classe-3-150kg?tier=20",
            "priceCurrency": "BRL",
            "price": 782.4,
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": 39.12,
              "priceCurrency": "BRL",
              "unitText": "unidade",
              "referenceQuantity": {
                "@type": "QuantitativeValue",
                "value": 1,
                "unitCode": "C62"
              }
            },
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "eligibleQuantity": {
              "@type": "QuantitativeValue",
              "value": 20,
              "unitCode": "C62"
            }
          }
        ]
      }
    }
  ]
}
```

Notas de conformidade:
- `aggregateOffer.lowPrice/highPrice` = preço **por unidade** mínimo e máximo entre os tiers (39,12 no kit 20x; 48,90 no unitário); `offerCount` = número de tiers de compra (4). A faixa de/para exige `lowPrice ≤ highPrice`; a inversão é erro de validação.
- `priceValidUntil` obrigatório para rich result de produto; renovado automaticamente (+90 dias) no ISR.
- PDPs de cadeira com variantes de peso/cor usam o mesmo padrão `ProductGroup`+`hasVariant` (variesBy `color`/`size`), sem `aggregateOffer` (uma Offer por variante, `price` da variante).
- `aggregateRating` só é emitido quando há ≥ 5 avaliações reais do produto — nunca inventado (política antispam).

## 4.3 JSON-LD 2 — `BreadcrumbList`

Gerado dinamicamente por nível de rota (home → silo → subcategoria → produto). Exemplo para a PDP do pistão:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.chaircadeiras.com.br/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Peças de Reposição e Atacado",
      "item": "https://www.chaircadeiras.com.br/pecas"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Pistões a Gás",
      "item": "https://www.chaircadeiras.com.br/pecas/pistoes-a-gas"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Pistão a Gás Classe 3 — até 150 kg"
    }
  ]
}
```

Regras: o último item não recebe `item` (página atual); em facetas whitelist, o breadcrumb usa a categoria base (posição 3) e omite o parâmetro; em páginas de ambiente, posição 2 = "Ambientes". O mesmo array alimenta o `<nav aria-label="Breadcrumb">` visível — uma única fonte (`lib/breadcrumbs.ts`), zero divergência entre markup e JSON-LD.

## 4.4 JSON-LD 3 — `Organization` + `LocalBusiness` (fábrica Jaú/SP)

Emitido globalmente em `app/layout.tsx`. `LocalBusiness` (subtipo `FurnitureStore` + `Manufacturer`) referencia a `Organization` por `@id`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.chaircadeiras.com.br/#organization",
      "name": "Chair Cadeiras",
      "legalName": "Chair Cadeiras Indústria e Comércio de Cadeiras Ltda",
      "url": "https://www.chaircadeiras.com.br/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.chaircadeiras.com.br/img/logo-chair-cadeiras-512x512.png",
        "width": 512,
        "height": 512
      },
      "brand": {
        "@type": "Brand",
        "name": "Chair Cadeiras"
      },
      "sameAs": [
        "https://www.instagram.com/chair.cadeiras",
        "https://www.facebook.com/chaircadeiras",
        "https://wa.me/5514996642123"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+55-14-99664-2123",
          "email": "contato@chaircadeiras.com.br",
          "areaServed": "BR",
          "availableLanguage": "pt-BR",
          "contactOption": "TollFree"
        },
        {
          "@type": "ContactPoint",
          "contactType": "sales",
          "telephone": "+55-14-99664-2123",
          "email": "atacado@chaircadeiras.com.br",
          "areaServed": "BR",
          "availableLanguage": "pt-BR"
        }
      ]
    },
    {
      "@type": ["LocalBusiness", "FurnitureStore", "Manufacturer"],
      "@id": "https://www.chaircadeiras.com.br/#localbusiness",
      "name": "Chair Cadeiras — Fábrica e Loja",
      "parentOrganization": {
        "@id": "https://www.chaircadeiras.com.br/#organization"
      },
      "url": "https://www.chaircadeiras.com.br/",
      "image": "https://www.chaircadeiras.com.br/img/fachada-fabrica-jau-1200x630.jpg",
      "telephone": "+55-14-99664-2123",
      "email": "contato@chaircadeiras.com.br",
      "priceRange": "$$",
      "currenciesAccepted": "BRL",
      "paymentAccepted": "Pix, Cartão de crédito, Boleto bancário",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Ana Claudina, 1000",
        "addressLocality": "Jaú",
        "addressRegion": "SP",
        "postalCode": "17201-000",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -22.2955,
        "longitude": -48.5584
      },
      "hasMap": "https://www.google.com/maps/search/?api=1&query=Chair+Cadeiras+Jau+SP",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "08:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "08:00",
          "closes": "12:00"
        }
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Brasil"
      }
    }
  ]
}
```

Nota: endereço, CNPJ, telefone fixo e horários acima são placeholders coerentes com Jaú/SP (geocoordenadas reais da cidade: -22.2955, -48.5584) — **substituir pelos dados cadastrais reais antes do deploy** (fonte: cartão CNPJ e Google Business Profile; os dois devem coincidir exatamente, requisito de NAP consistency para SEO local).

## 4.5 JSON-LD 4 — `FAQPage`

Emitido nas PDPs (FAQ do produto), nas PLPs (FAQ da categoria) e nos guias. Exemplo completo com as dúvidas exigidas no escopo (NR-17, pistão classe 2 vs 3, rodízio PU vs nylon):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que a NR-17 exige das cadeiras de escritório?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A NR-17 (ergonomia) exige que assentos de trabalho tenham altura ajustável à estatura do trabalhador e à natureza da função, encosto adaptado ao corpo com apoio lombar, borda frontal do assento arredondada, base estável (rodízios adequados ao piso) e profundidade que não comprima a circulação das pernas. Cadeiras ergonômicas conformes, como os modelos NR-17 da Chair Cadeiras, oferecem regulagem de altura por pistão a gás, apoio lombar proeminente, encosto com inclinação ajustável e braços reguláveis. A norma trata do mobiliário do posto de trabalho; o laudo de conformidade do fabricante documenta cada requisito atendido."
      }
    },
    {
      "@type": "Question",
      "name": "Qual a diferença entre pistão classe 2 e pistão classe 3?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A classe indica a espessura da parede do tubo de aço do pistão a gás e sua capacidade de carga certificada. O pistão classe 2 tem parede de 1,5 mm e atende cadeiras de até aproximadamente 100-120 kg de carga de trabalho. O pistão classe 3 tem parede de 2,0 mm (ou mais), passa por ensaios mais rigorosos (SGS/BIFMA) e é indicado para cadeiras reforçadas de até 150 kg, com maior durabilidade e menor taxa de perda de pressão (cadeira que 'desce' sozinha). Para uso intenso, corporativo ou usuários acima de 100 kg, a especificação correta é classe 3. Ambos compartilham o cone padrão de 50 mm na maioria das bases estrela do mercado; ao substituir, confira o diâmetro da coluna e o curso (altura de regulagem)."
      }
    },
    {
      "@type": "Question",
      "name": "Rodízio de PU, silicone ou nylon: qual escolher?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O material da roda define o atrito com o piso, o ruído e o risco de marcas. Nylon (poliamida): mais rígido e barato, indicado para carpetes e pisos cimentados; pode marcar pisos frios polidos e é mais ruidoso. PU (poliuretano): roda macia com banda dupla, silencioso, não risca porcelanato, laminado e vinílico; é o padrão recomendado para home office e escritórios com piso frio. Silicone: comportamento semelhante ao PU com rodagem ainda mais macia e silenciosa, indicado para clínicas e consultórios. Todos os modelos da Chair Cadeiras usam pino de encaixe de 11 mm (padrão de mercado, compatível com bucha de 22x22 mm) e são especificados para a carga da cadeira — rodízios para cadeiras de 150 kg recebem estrutura reforçada."
      }
    },
    {
      "@type": "Question",
      "name": "Como medir o pistão da minha cadeira para comprar a reposição certa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Meça três dimensões com trena ou paquímetro: (1) o diâmetro da coluna externa do pistão (parte que entra na base estrela) — o padrão é 50 mm, com variantes de 45 mm; (2) o diâmetro da haste interna (parte que entra no mecanismo/flange) — geralmente 28 mm ou 25 mm; (3) o curso, distância entre a posição mais baixa e a mais alta do assento — comum de 80 a 120 mm. Use o Verificador de Compatibilidade na página do produto para confirmar o encaixe antes da compra. Em caso de dúvida, envie a foto das medidas pelo WhatsApp da fábrica."
      }
    },
    {
      "@type": "Question",
      "name": "Os kits de atacado têm preço por unidade menor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. A Chair Cadeiras é fabricante e pratica preço regressivo por volume: kits de 5, 10 e 20 unidades reduzem o preço unitário em relação à compra de 1 peça (no pistão classe 3, de R$ 48,90 unitário até R$ 39,12 por unidade no kit 20, economia de 20%). A tabela completa de preço por unidade aparece no seletor de kits da página de cada peça. Para volumes acima de 20 unidades, clientes com CNPJ podem solicitar cotação de atacado pelo WhatsApp com condição específica de frete."
      }
    }
  ]
}
```

Regras do FAQ:
1. Toda pergunta do JSON-LD **deve estar visível na página** (Accordion renderizado com o mesmo conteúdo) — FAQ invisível é violação das diretrizes do Google.
2. Respostas com 60–300 palavras, texto técnico direto, sem markup dentro de `text` além do permitido (HTML básico é aceito; manter texto puro).
3. FAQ por página é limitado ao escopo da página: PDP do pistão recebe as perguntas 2, 4 e 5; PLP `/pecas/rodizios` recebe a 3; guia NR-17 recebe a 1. O bloco acima é o template completo do silo.
4. Desde 2023 o Google exibe rich results de FAQ apenas para sites governamentais/saúde de forma garantida; o schema permanece correto e útil para assistentes/IA (AI Overviews, Gemini) — o valor principal é elegibilidade de snippet e extração por LLMs, não a serpentina azul.

## 4.6 Pontos de injeção (mapa de implementação)

| Schema | Arquivo | Onde renderiza |
|--------|---------|----------------|
| Organization + LocalBusiness | `lib/seo/jsonld.ts → buildOrganizationJsonLd()` | `app/layout.tsx` (todas as páginas) |
| BreadcrumbList | `buildBreadcrumbJsonLd()` | cada rota com breadcrumb (mesmo array do `<nav>`) |
| Product/ProductGroup/AggregateOffer | `buildProductJsonLd()` | `app/produto/[slug]/page.tsx` (RSC, dados do catálogo) |
| ItemList | `buildItemListJsonLd()` | PLPs (produtos da página 1) |
| FAQPage | `buildFaqJsonLd()` | PDPs, PLPs, guias |
| WebSite + SearchAction | `buildWebSiteJsonLd()` | `app/layout.tsx` (sitelinks searchbox descontinuado pelo Google em 2024 — mantido apenas `WebSite` sem SearchAction; decisão: omitir SearchAction) |

Componente `<JsonLd data={...} />` serializa com `JSON.stringify` escapado (`<`, `>`, `&` → `\u003c` etc.) para impedir quebra de HTML/XSS por conteúdo de catálogo. Testes em `lib/seo/__tests__/jsonld.test.ts` validam estrutura obrigatória por tipo (camados exigidos do Google: `name`, `image`, `offers.price`, `offers.availability`, etc.).
