# Especificação Técnica — Novo E-commerce Chair Cadeiras

Loja: Chair Cadeiras (fabricante e distribuidora de cadeiras e peças de reposição, Jaú/SP).
Site atual: https://www.chaircadeiras.com.br/ (plataforma Tray, tema 21, pagamento Vindi).
Data da especificação: 2026-09-15.

## Índice de módulos

| # | Documento | Conteúdo |
|---|-----------|----------|
| 0 | [00-diagnostico-site-atual.md](./00-diagnostico-site-atual.md) | Auditoria do site atual com evidências coletadas |
| 1 | [01-arquitetura-informacao-e-siloing-seo.md](./01-arquitetura-informacao-e-siloing-seo.md) | Árvore de categorias B2C/B2B, hub-and-spoke, URLs canônicas de navegação facetada |
| 2 | [02-stack-tecnologico-e-core-web-vitals.md](./02-stack-tecnologico-e-core-web-vitals.md) | Stack front-end, orçamentos de LCP/CLS/INP, política de charset UTF-8 |
| 3 | [03-ux-ui-e-sistema-de-design.md](./03-ux-ui-e-sistema-de-design.md) | Wireframes textuais (header, PLP, PDP cadeira, PDP peça, checkout), design system, WCAG 2.2 AA |
| 4 | [04-seo-tecnico-e-schemas-json-ld.md](./04-seo-tecnico-e-schemas-json-ld.md) | SEO técnico e código JSON-LD completo (Product/AggregateOffer, BreadcrumbList, Organization/LocalBusiness, FAQPage) |
| 5 | [05-componente-matriz-compatibilidade-e-kits.md](./05-componente-matriz-compatibilidade-e-kits.md) | Especificação do componente central React/TypeScript |

## Protótipo executável

O código-fonte do protótipo funcional está em [`web/`](../web/) — Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, primitivos Radix (padrão shadcn/ui), Vitest.

Comandos:

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run test     # testes de pricing, compatibilidade, busca e facetas
npm run build    # build de produção
```

Rotas implementadas no protótipo:

- `/` — home com hub de perfis (B2C/B2B)
- `/cadeiras/[categoria]` — PLP B2C com navegação facetada canônica
- `/pecas/[categoria]` — PLP B2B/Reposição
- `/ambientes/[ambiente]` — hubs de ambiente (home-office, corporativo, setup-gamer, clinicas, templos-igrejas)
- `/produto/[slug]` — PDP de cadeira e PDP de peça (com `CompatibilityKitMatrix`)
- `/guias/[slug]` — conteúdo spoke (pistão classe 2 vs 3, rodízio PU vs nylon, NR-17)
- `/checkout` — bloco de pagamento Vindi (Pix à vista, 6x sem juros)
- `/sitemap.xml` e `/robots.txt` gerados por código
