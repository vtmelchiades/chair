# chair — Especificação e protótipo do novo e-commerce Chair Cadeiras

Repositório com a especificação técnica completa do novo e-commerce da **Chair Cadeiras**
(fabricante de cadeiras e peças de reposição, Jaú/SP — site atual: chaircadeiras.com.br, plataforma Tray)
e um protótipo executável da interface.

## `docs/` — Especificação (5 módulos)

| Módulo | Arquivo |
|--------|---------|
| 0. Diagnóstico do site atual | [docs/00-diagnostico-site-atual.md](docs/00-diagnostico-site-atual.md) |
| 1. Arquitetura de informação e siloing de SEO | [docs/01-arquitetura-informacao-e-siloing-seo.md](docs/01-arquitetura-informacao-e-siloing-seo.md) |
| 2. Stack tecnológica e Core Web Vitals | [docs/02-stack-tecnologico-e-core-web-vitals.md](docs/02-stack-tecnologico-e-core-web-vitals.md) |
| 3. UX/UI e sistema de design | [docs/03-ux-ui-e-sistema-de-design.md](docs/03-ux-ui-e-sistema-de-design.md) |
| 4. SEO técnico e schemas JSON-LD | [docs/04-seo-tecnico-e-schemas-json-ld.md](docs/04-seo-tecnico-e-schemas-json-ld.md) |
| 5. Componente Matriz de Compatibilidade e Kits | [docs/05-componente-matriz-compatibilidade-e-kits.md](docs/05-componente-matriz-compatibilidade-e-kits.md) |

## `web/` — Protótipo executável

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Radix UI (padrão shadcn/ui) · Vitest.

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run test       # 54 testes: pricing, compatibilidade, busca, facetas
npm run build      # build de produção
node scripts/check-encoding.mjs   # gate de charset UTF-8 (docs/02 §2.6.4)
```

Destaques implementados:

- **Árvore B2C/B2B separada** — `/cadeiras/*`, `/pecas/*`, hubs `/ambientes/*`, guias `/guias/*` (hub-and-spoke no lugar do bloco "Palavras mais buscadas").
- **Facetas canônicas** — `lib/facets.ts`: ordem alfabética de parâmetros, whitelist indexável, canonical + robots por matriz de decisão (testado).
- **Busca preditiva tolerante a erro** — `lib/search.ts`: "rodizio silicone", "pistao classe 3", "flanje" (Levenshtein + sinonímia + normalização NFC, testado).
- **PDP de peça** com o componente central `CompatibilityKitMatrix` (unitário/kits 5x/10x/20x com preço regressivo por unidade, badge de economia, Verificador de Compatibilidade em 3 passos, CTA WCAG 2.2 AA).
- **PDP de cadeira** com tabela antropométrica, selo/laudo NR-17, seletor de peso 120/150 kg e calculadora de frete com prazos regionais.
- **JSON-LD completo** — `lib/seo/jsonld.ts`: Product+ProductGroup+AggregateOffer (kits com faixa de/para), BreadcrumbList, Organization+LocalBusiness (Jaú/SP), FAQPage.
- **Checkout Vindi-like** — Pix padrão (−5%), 6x sem juros, faturado CNPJ ≥ R$ 1.000, zero banners.
- **Carrinho slide-over** — Radix Dialog, lazy no primeiro add, barra de frete grátis.
- **Charset UTF-8 estrito** — meta + headers HTTP + script de CI `check-encoding.mjs` (erradica o mojibake do site atual).
