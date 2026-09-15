# Módulo 2 — Stack Tecnológica e Otimização para Core Web Vitals

## 2.1 Stack definido

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | **Next.js 15 (App Router) + React 19** | RSC reduz JS no cliente (INP), ISR para catálogo, `next/image` para LCP, canonical/robots por rota |
| Linguagem | **TypeScript 5 strict** | Tipos de catálogo, preço (centavos inteiros) e variantes; zero `any` |
| Estilo | **Tailwind CSS v4** | CSS atômico, purge por conteúdo, zero CSS morto; tokens via `@theme` |
| Componentes | **shadcn/ui (primitivos Radix)** | Acessibilidade WCAG embutida (dialog, tabs, radio-group, popover); código versionado no repo, não dependência opaca |
| Validação | **Zod** | Schemas de searchParams de facetas (Módulo 1 §1.6), payloads de checkout e JSON-LD |
| Estado de carrinho | React Context + reducer (server actions p/ persistência) | Carrinho slide-over sem recarregar página |
| Busca | **Typesense** (self-hosted) ou Meilisearch | Tolerância a typo nativa (Levenshtein prefixal), sinônimos, facetagem; no protótipo, engine local em `lib/search.ts` com a mesma API comportamental |
| Pagamento | **Vindi** (mantida) | Pix com desconto à vista, parcelamento 6x sem juros já contratados |
| CMS/Conteúdo | Headless (Payload ou Sanity) para guias `/guias` e páginas de ambiente | Marketing publica spoke sem deploy |
| Catálogo/Pedido (backend) | API própria (Node/Nest ou Medusa) + Postgres; preços em **centavos (inteiro)** | Substitui a Tray; fonte única de verdade consumida por ISR |
| Imagens | Next/Image + loader de CDN (Cloudflare Images/Vercel) | AVIF/WebP responsivo no edge |
| RUM | `web-vitals` → endpoint próprio + Google Search Console/CrUX | Verificação contínua dos orçamentos abaixo |
| Testes | Vitest (unit), Playwright (fluxo compra), Lighthouse CI (orçamento) | Gates de merge |
| Hospedagem | Vercel (ou Node 22 + CDN na frente) | Edge cache de HTML ISR |

## 2.2 Orçamentos de performance (contrato, não aspiração)

| Métrica | Orçamento p75 campo (mobile 4G) | Gate Lighthouse CI (lab, mobile) |
|---------|--------------------------------|----------------------------------|
| LCP | **< 1,2 s** | < 1,5 s (margem de lab) |
| CLS | **= 0** | ≤ 0,01 |
| INP | **< 200 ms** | TBT < 150 ms (proxy de lab) |
| JS inicial (home) | ≤ 90 KB gzip | fail se > 110 KB |
| HTML inicial (PDP) | ≤ 60 KB gzip | — |
| Peso total inicial PDP | ≤ 350 KB | — |
| Tempo de build | ≤ 6 min | — |

O Lighthouse CI roda em todo PR com `assert` sobre os valores acima; regressão bloqueia merge. RUM em produção com `reportWebVitals` → `/api/vitals`, dashboard por rota (`/`, PLP, PDP-cadeira, PDP-peça, checkout).

## 2.3 LCP < 1,2 s — política de imagens e hero

### 2.3.1 Hero da home

1. **Sem carrossel no hero.** O carrossel atual (achado A3) é substituído por um único painel estático por segmento de campanha. Carrossel, se existir, fica abaixo da dobra e com `loading="lazy"`.
2. O hero é **uma imagem por viewport-class** (mobile ≤ 749 px, desktop ≥ 750 px) via `<picture>`+CSS ou `next/image` com `sizes="100vw"`. Nunca dois blocos (desktop+mobile) renderizados simultaneamente — o não exibido recebe `display:none` por media query **no CSS crítico**, não por JS pós-hidratação.
3. `next/image` com `priority` **somente** no hero e na primeira imagem da PDP. `priority` injeta `<link rel=preload>`; uso indiscriminado degrada o LCP ao competir por banda.
4. `fetchPriority="high"` + `decoding="async"` na imagem de LCP; `alt` descritivo (não vazio).
5. Formatos: AVIF (q≈50, effort 4) com fallback WebP (q≈72) e JPEG. Ganhos esperados: −50% vs JPEG no banner fotográfico.
6. Dimensões máximas de arte: hero 1600×500 desktop / 750×560 mobile (a arte atual é 1920×600 — redimensionar na origem, não só no CDN).

### 2.3.2 Imagens de produto

| Contexto | Formato | Tamanhos (`srcset`) | Loading |
|----------|---------|---------------------|---------|
| PDP — imagem principal (LCP) | AVIF/WebP | 480, 750, 1080, 1440 | `priority`, `sizes="(max-width:1024px) 100vw, 560px"` |
| PDP — miniaturas | AVIF/WebP | 96, 192 | lazy |
| PLP — card (6 por viewport) | WebP (AVIF opcional) | 240, 360, 480 | 2 primeiros eager, resto lazy |
| Home — vitrine | WebP | 240, 360 | lazy |
| Guia/CMS | AVIF/WebP | 640, 960 | lazy |

Regras adicionais:
- Toda imagem de produto é fotografada em fundo neutro com **aspect ratio fixo 4:5** (PLP) e **1:1** (PDP) — permite reserva estática de caixa (CLS) e recorte determinístico no CDN.
- `sizes` obrigatório em toda `next/image` (proibido default `100vw` fora do hero).
- LQIP inline (SVG blurhash de ~1 KB) como `placeholder="blur"` nos cards de PLP.
- Preconnect do domínio de imagens no `<head>` (`dns-prefetch` + `preconnect` para o CDN).

### 2.3.3 Fontes

`next/font` (self-hosted, zero layout request externo): Inter variable para UI, com `font-display: swap` e **`size-adjust`/fallback metric override** (`adjustFontFallback`) para que a fonte fallback tenha as mesmas métricas — elimina flash de reflow (contribuição zero ao CLS). Subsets `[latin]` apenas.

### 2.3.4 Cadeia crítica de rede (PDP)

```
HTML (ISR, edge cache) ──► preload imagem principal (inline no <head>)
        │
        ├─► CSS crítico inline (Tailwind, apenas classes da rota)
        ├─► JS: somente ilhas da PDP (gallery, kit selector, freight) — code-split por componente
        └─► JSON-LD inline no HTML (zero requests)
```

Nenhum script de terceiro bloqueia o parse: GTM/Vindi/Facebook carregam com `next/script` `strategy="lazyOnload"` (ou `afterInteractive` apenas para o pixel de conversão, nunca no caminho do LCP).

## 2.4 CLS = 0 — reservas de layout estáticas

Inventário de elementos que hoje causam shift e a contramedida:

| Elemento | Problema atual | Contramedida |
|----------|----------------|--------------|
| Hero/carrossel | altura definida por JS após init | caixa com `aspect-ratio` fixo no CSS crítico (16/5 desktop, 3/4 mobile) |
| Régua de vantagens (frete/parcelamento) | injectada por tema após load | slot estático no layout, altura fixa 48 px desktop / 2 linhas mobile |
| Seletores de variação (peso 120/150 kg, cor) | aparecem quando o JS de variante resolve | renderizados no RSC com altura conhecida; estado "indisponível" ocupa o mesmo espaço |
| Preço + parcelamento | texto cresce quando a oferta calcula | bloco com `min-height` por linha de preço (3 linhas reservadas: cheio, Pix, parcelado) |
| Calculadora de frete | resultado empurra o CTA | painel de resultado com `min-height: 112px` reservado antes da consulta |
| Widget de pagamento (Vindi) no checkout | iframe redimensiona | container com altura contratada por breakpoint; iframe só monta no container já dimensionado |
| Selos/badges (NR-17, "Destaque") | inseridos por condição assíncrona | badges são dados do produto renderizados no servidor; sem inserção client-side |
| Imagens de produto | sem width/height | width/height sempre explícitos (next/image exige) + aspect-ratio fixo 1.3.2 |
| Cookie banner | overlay aceitável, mas barra fixa empurra conteúdo | banner em overlay (`position: fixed`), nunca inline |
| Fonte web | reflow no FOUT | `adjustFontFallback` (2.3.3) |

Verificação contínua: teste Playwright que mede `layout-shift` acumulado por rota e falha se > 0,01, além do Lighthouse CI.

## 2.5 INP < 200 ms — isolamento de componentes interativos

Arquitetura: **padrão RSC-first**. Toda página é Server Component; interatividade confinada a ilhas `'use client'` code-splitadas. Inventário de ilhas:

| Ilha | Rota | Peso alvo (gzip) | Técnica |
|------|------|------------------|---------|
| `CartDrawer` + `CartProvider` | global | ≤ 12 KB | Radix Dialog; monta lazy via `next/dynamic` no primeiro `addToCart` (o botão existe sempre; o drawer não) |
| `FacetSidebar` (filtros facetados) | PLPs | ≤ 10 KB | `useTransition` + `router.replace` (URL é a fonte de verdade — deep-linkável e consistente com a canonical); `startTransition` mantém a UI responsiva enquanto o RSC re-renderiza |
| `KitMatrixPanel` (1 un/kit 5/10/20 + economia) | PDP peça | ≤ 8 KB | estado local puro; cálculo de preço já embutido nos dados (zero fetch ao trocar de tier) |
| `CompatibilityChecker` (verificador) | PDP peça | ≤ 10 KB | `next/dynamic`, só carrega ao abrir o painel ("Verificar compatibilidade") |
| `Gallery` (troca de imagem) | PDP | ≤ 6 KB | swap de `srcset` já baixado; sem reflow (caixa fixa) |
| `FreightCalculator` | PDP | ≤ 5 KB | fetch com `useDeferredValue`; resultado em slot reservado |
| `SearchBox` (autocomplete) | header | ≤ 9 KB | debounce 200 ms, `useDeferredValue` p/ lista, resultados pré-buscados no payload inicial p/ os 8 termos top |
| `ProfileToggle` (Comprar Cadeira / Preciso de Peças) | header | ≤ 2 KB | estado local; sem fetch |
| `CheckoutVindi` | /checkout | ≤ 15 KB | iframe Vindi em container dimensionado; comunicação por postMessage tipado |

Regras gerais de INP:
1. Handlers que disparam navegação usam `useTransition`; handlers de estado local nunca fazem `await` antes de pintar.
2. Long tasks: nada de loops de cálculo no clique — a matriz de preço por tier é pré-calculada no servidor (`lib/pricing.ts` roda no build/ISR) e o cliente apenas indexa o array.
3. Listas de faceta com > 40 itens usam `content-visibility: auto`; autocomplete renderiza no máx. 8 itens.
4. Zero jQuery/legacy. Bundle auditado com `@next/bundle-analyzer` em CI (alerta se ilha > alvo).
5. Hidratação: apenas as ilhas visíveis hidratam no primeiro paint; `CompatibilityChecker` e `CartDrawer` hidratam sob demanda.

## 2.6 Charset e encoding — erradicação de mojibake

Diagnóstico do achado A1: byte `0xEA`/`0xE9` (Latin-1) decodificado como UTF-8 inválido → U+FFFD. Correção em cinco camadas, todas obrigatórias:

### 2.6.1 Camada HTTP

```
Content-Type: text/html; charset=utf-8      # todas as respostas HTML (next.config.ts, já implementado)
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff             # proíbe sniffing que sobrescreve o charset
```

### 2.6.2 Camada HTML

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />   <!-- primeiro elemento do <head>, antes de qualquer título/texto -->
```

`lang="pt-BR"` correto também é requisito de acessibilidade (screen readers usam o idioma para pronúncia).

### 2.6.3 Camada de dados (fonte do problema atual)

1. Postgres: `CREATE DATABASE ... ENCODING 'UTF8' LC_COLLATE 'pt_BR.UTF-8'`; colunas `text` sem conversão implícita.
2. Clientes de banco/API: conexão com `client_encoding=UTF8`; `fetch`/axios assumem UTF-8 (padrão); proibido `Buffer.toString('latin1')` em qualquer ponto.
3. Normalização Unicode: nomes de produto normalizados para **NFC** na ingestão (`String.prototype.normalize('NFC')`) — evita que "ç" chegue como `c + U+0327` (NFD) e quebre slug/busca.
4. Slugs: gerados com transliteração explícita (`ç→c`, `ã→a`, `é→e`) — slug é ASCII, texto exibido mantém acento.
5. Migração do acervo Tray: export → detecção de encoding por amostragem (chardet) → conversão para UTF-8 → **quarentena**: script lista registros contendo U+FFFD ou sequências C1/ Latin-1 suspeitas para revisão manual antes da carga.

### 2.6.4 Camada de build/CI

1. Todos os arquivos-fonte são UTF-8 sem BOM; `.editorconfig` com `charset = utf-8`.
2. Check em CI (implementado em `web/scripts/check-encoding.mjs`): varre `src/**` e conteúdo renderizado das rotas críticas buscando U+FFFD, mojibake comum (`Ã©`, `Ã£`, `â€™`, `Ã‡`) e bytes não-UTF-8; falha o build com o arquivo e a linha.
3. Teste Playwright: snapshot de texto do banner de cookies e de 5 PDPs com acentos ("Peças", "Reposição", "Giratória") comparado byte a byte com o esperado.

### 2.6.5 Camada de runtime/monitoramento

1. `reportWebVitals`-style: listener de erros reporta `document.characterSet !== 'UTF-8'` como incidente.
2. Verificação semanal por crawl (script `check-encoding` contra produção) com alerta para o time.

## 2.7 Estratégia de renderização por rota

| Rota | Estratégia | Revalidação |
|------|-----------|-------------|
| Home | ISR | 300 s (campanhas) |
| PLP/categoria/faceta whitelist | ISR | 300 s |
| PDP | ISR + on-demand revalidate (webhook do catálogo) | preço/estoque: `dynamic = 'force-dynamic'` apenas no fragmento de preço via PPR, ou revalidate=60 |
| Guias/ambientes | SSG | deploy do CMS |
| Checkout/carrinho | CSR + server actions | — |
| Busca | CSR | — |

PPR (Partial Prerendering) habilitado: casco estático (header, breadcrumbs, JSON-LD, gallery) instantâneo no edge; furos dinâmicos (preço em promoção, estoque, frete) streamizados com slot reservado (CLS-safe).

## 2.8 Segurança e cabeçalhos (implementados em `next.config.ts`)

- `Content-Security-Policy` restritiva (allowlist Vindi para `connect-src`/`frame-src`); `frame-ancestors 'self'`.
- `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` mínimo.
- Cookies de carrinho: `Secure; HttpOnly; SameSite=Lax`.
- LGPD: banner de cookies em overlay com consentimento granular (analítico/marketing opt-in), texto em UTF-8 correto; `privacy` em rota própria indexável.
