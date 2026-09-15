# Módulo 3 — UX/UI e Sistema de Design Orientado a Conversão

## 3.1 Sistema de design — tokens

### 3.1.1 Cor

| Token | Valor | Uso | Contraste sobre `bg` |
|-------|-------|-----|----------------------|
| `--bg` | `#FFFFFF` | fundo geral | — |
| `--bg-subtle` | `#F5F6F8` | faixas, rodapé, painéis | — |
| `--ink` | `#111827` | texto primário | 17,4:1 (AAA) |
| `--ink-muted` | `#4B5563` | texto secundário | 7,6:1 (AAA) |
| `--brand` | `#0B3C8C` (azul fábrica) | marca, links, foco | 9,1:1 (AAA) |
| `--brand-ink` | `#FFFFFF` | texto sobre brand | 9,1:1 |
| `--accent` | `#F59E0B` (âmbar) | badges de destaque/oferta | sobre `--ink`: OK; nunca como fundo de texto branco (2,1:1 — proibido) |
| `--success` | `#15803D` | Pix, economia, estoque | 4,9:1 (AA) |
| `--danger` | `#B91C1C` | erro, indisponível | 6,1:1 (AA) |
| `--b2b` | `#0F766E` (teal) | acentos do fluxo atacado/peças | 5,1:1 (AA) |

Par cromático de fluxo: B2C usa `--brand` (azul); B2B/peças usa `--b2b` (teal). O seletor de perfil do header, os hubs `/cadeiras` e `/pecas` e os badges de kit usam a cor do fluxo — sinal não-textual consistente de contexto. Todos os pares acima atendem WCAG 2.2 AA (≥ 4,5:1 para texto, ≥ 3:1 para UI/gráficos); valores de contraste medidos, não estimados, via ação de CI (`axe-core` em cada PR).

### 3.1.2 Tipografia e espaçamento

- Fonte: Inter variable (`next/font`), escala: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 44 px; line-height 1,2 (display) a 1,6 (corpo).
- Preço: tabular-nums (`font-variant-numeric`) — dígitos monoespaçados evitam shift ao trocar de tier.
- Espaçamento: base 4 px (4/8/12/16/24/32/48/64). Container: 1200 px máx., gutter 16 px mobile / 24 px desktop.
- Raio: 8 px (cards, inputs), 999 px (badges, pills). Sombra: `0 1px 2px rgb(0 0 0 / .06)` cards; `0 8px 24px rgb(0 0 0 / .12)` drawer/modal.
- Alvos de toque: mínimo 44×44 px (WCAG 2.2 Target Size AA); componentes shadcn/ui ajustados para esse mínimo.

### 3.1.3 Componentes base (shadcn/ui)

`Button` (primary/secondary/ghost/destructive, 3 tamanhos), `Badge` (oferta, NR-17, classe técnica, economia), `Card` (produto), `Tabs` (unitário/kit), `RadioGroup` (variações), `Dialog/Sheet` (carrinho, compatibilidade), `Input`, `Select`, `Table` (dimensões), `Skeleton`, `Accordion` (especificações/FAQ), `Breadcrumb`, `Toast`. Todos com estado de foco visível (`outline: 2px solid var(--brand); outline-offset: 2px`).

### 3.1.4 Hierarquia de preço (regra global — corrige achado A6)

Ordem e formato fixos em toda a loja:

```
R$ 1.059,90                     ← preço cheio, 24–30 px, --ink
R$ 1.006,91 no Pix (5% off)     ← à vista, --success, 16–18 px, ícone Pix
ou 6x de R$ 176,65 sem juros    ← parcelamento, --ink-muted, 14 px
de R$ 1.119,90                  ← riscado, apenas quando há oferta ativa, 12–14 px
```

Regras: parcelamento máximo 6x sem juros; exibir número de parcelas = `min(6, floor(preço/50))` com parcela ≥ R$ 50; **nunca** citar gateway ou bandeira ("Vindi", "MasterCard") em card/PLP/PDP — isso é detalhe do checkout; em peças B2B, a linha do Pix é substituída por "preço unitário do tier" (3.6).

## 3.2 Header e navegação

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Faixa topo — bg-subtle, 32px]  Frete grátis Sudeste acima de R$300 ·        │
│  Fábrica em Jaú/SP · Peças reforçadas até 150 kg · NR-17                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐   ┌───────────────────────────────────────────┐   ┌──┐ ┌──┐ ┌──┐ │
│ │ LOGO   │   │ (⌕) Buscar: cadeira, pistão classe 3...   │   │👤│ │♡ │ │🛒3 │ │
│ └────────┘   └───────────────────────────────────────────┘   └──┘ └──┘ └──┘ │
│                                                                              │
│  ┌───────────────────────────┐ ┌───────────────────────────┐                 │
│  │ ◉ COMPRAR CADEIRA  (B2C)  │ │ ○ PRECISO DE PEÇAS/ATACADO │  ← profile     │
│  └───────────────────────────┘ └───────────────────────────┘    toggle       │
│                                                                              │
│  Cadeiras ▾   Peças e Atacado ▾   Ambientes ▾   Guias Técnicos ▾   Fábrica   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2.1 Seletor rápido de perfil

- Segmented control de 2 opções: **"Comprar Cadeira"** (B2C, `--brand`) e **"Preciso de Peças / Atacado"** (B2B, `--b2b`).
- Comportamento: (a) reordena o menu primário (silo escolhido primeiro); (b) reordena sugestões da busca; (c) aplicado como boost de ranking no autocomplete; (d) persistido em cookie (não-bloqueante) — visitante recorrente de peças cai direto no contexto B2B.
- Estado padrão: neutro (ambos os silos com igual peso). O toggle nunca bloqueia navegação — é atalho, não muro.
- Acessibilidade: `role="radiogroup"` com `aria-label="Perfil de compra"`; setas mudam a opção; mudança anunciada (`aria-live="polite"`: "Navegação priorizando peças de reposição e atacado").

### 3.2.2 Busca preditiva com tolerância a erro

- Input único com `role="combobox"`, `aria-expanded`, `aria-controls` na lista; teclado completo (↑↓, Enter, Esc).
- Debounce 200 ms; resultados agrupados em 3 blocos máx.: **Produtos** (4, com miniatura 48×48, preço e badge), **Categorias** (3), **Guias** (2).
- Tolerância a erro (engine em `lib/search.ts`; em produção Typesense com a mesma configuração):
  1. Normalização: lowercase, remoção de diacríticos ("pistão"→"pistao"), NFC.
  2. Sinonímia/variante: `rodizio=rodízio=rodinhas=rodizios`; `pisto=pistao=pistão`; `estrela=base estrela=base-estrela`; `flange=flanje` (typo comum); `mecanismo=relax=back system` (relacionados).
  3. Distância de edição ≤ 2 para tokens ≥ 5 chars, ≤ 1 para tokens de 3–4 chars, prefix-match para tokens incompletos ("pist" → "pistão a gás").
  4. Casos de teste do escopo: **"rodizio silicone"** → PDP Rodízio Silicone + categoria `/pecas/rodizios?material=silicone`; **"pistao classe 3"** → PDP Pistão Classe 3 + `/pecas/pistoes-a-gas?classe=3`.
- Zero resultado: sugerir categorias próximas + link WhatsApp com o termo digitado pré-preenchido ("Não achou 'X'? Fale com a fábrica").
- Rota de resultado `/buscar?q=` é `noindex` (Módulo 1 §1.5.3).

### 3.2.3 Mega-menu

- "Cadeiras": colunas Ergonômicas NR-17 | Presidente/Diretor/Executiva | Gamer (120 kg, 150 kg) | Mochos + card de campanha.
- "Peças e Atacado": Pistões (classe 2, classe 3) | Rodízios (PU, silicone, nylon) | Bases estrela | Mecanismos (relax, flange, back system) | Braços | **Kits atacado** (destaque em `--b2b`: "Kit 10x — até 22% off").
- "Ambientes": os 5 hubs com ícone. "Guias Técnicos": 3 guias top + "ver todos".

## 3.3 PDP — Cadeira (ex.: Cadeira Gamer GXF 150 kg)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Home › Cadeiras › Gamer › Cadeira Gamer GXF 150 kg          [BreadcrumbList] │
├───────────────────────────────┬──────────────────────────────────────────────┤
│  GALERIA (RSC, aspect 1:1)    │  H1 Cadeira Gamer GXF Reforçada — 150 kg     │
│  ┌─────────────────────────┐  │  [NR-17 ✓] [150 kg] [Pistão Classe 3] [Fábrica]│
│  │  imagem principal       │  │                                              │
│  │  (priority, AVIF)       │  │  de R$ 1.119,90                              │
│  │                         │  │  R$ 1.059,90                                 │
│  └─────────────────────────┘  │  R$ 1.006,91 no Pix · ou 6x R$ 176,65 s/juros│
│  [▣][▣][▣][▣] thumb 96px      │                                              │
│                               │  PESO SUPORTADO  (RadioGroup, altura fixa)   │
│  ── abaixo da dobra ──        │  ( ● ) até 120 kg  — R$ 982,90               │
│  [Descrição] [Dimensões]      │  ( ○ ) até 150 kg (reforçada) — R$ 1.059,90  │
│  [NR-17] [Perguntas]          │  COR: ( ● )Preto ( ○ )Cinza ( ○ )Vermelho    │
│                               │                                              │
│                               │  FRETE (slot min-height 112px)               │
│                               │  [ CEP 00000-000 ] [Calcular]                │
│                               │   ↳ Transportadora · prazo por região:       │
│                               │     Sudeste 3–6 dias úteis · Sul 4–7 ·       │
│                               │     NE 6–10 · N/CO 7–12 · Grátis SE >R$300   │
│                               │                                              │
│                               │  [ ADICIONAR AO CARRINHO ] (48px, largura    │
│                               │  cheia)  [♡]  [ WhatsApp: dúvida técnica ]   │
│                               │  Selos: Pix 5% · 6x s/juros · Garantia 12m · │
│                               │  Devolução 7 dias · Fábrica Jaú/SP           │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

### 3.3.1 Tabela de dimensões antropométricas (aba "Dimensões")

Tabela `<table>` semântica, dados no RSC (nunca injetada por JS). Colunas: Dimensão | Medida (cm) | Faixa de ajuste | Referência ergonômica:

| Dimensão | Medida | Ajuste | Referência NR-17 |
|----------|--------|--------|------------------|
| Altura do assento (piso→assento) | 45–57 | pistão a gás | 37–45 cm (item 17.3.4 p/ estatura média; ajuste ±) |
| Profundidade do assento | 48 | fixa | 38–45 cm recomendada |
| Largura útil do assento | 52 | fixa | ≥ 40 cm |
| Altura do encosto | 68 | fixa | apoio lombar proeminente |
| Ajuste lombar | 6 posições | manual | exigido |
| Braços (altura do piso) | 66–73 | 5 posições | ombros relaxados, cotovelo ~90° |
| Diâmetro da base estrela | 70 | — | estabilidade c/ carga 150 kg |
| Peso suportado (carga máx.) | — | — | 150 kg (fator de segurança 1,5×) |
| Peso do produto | 21,3 kg | — | — |

Nota fixa abaixo da tabela: "Medidas conforme ensaio do fabricante e requisitos de assento/encosto da NR-17 (Portaria 3.751/90 e atualização Portaria MTP 423/2021). Laudo completo em PDF no selo NR-17."

### 3.3.2 Selo/laudo NR-17

- Badge `[NR-17 ✓]` ao lado do H1; clique abre `Dialog` com: resumo dos requisitos atendidos (regulagem de altura, apoio lombar, encosto, braços, rodízios, estabilidade), número do laudo, laboratório, data, e download do PDF (link direto, não modal-only).
- JSON-LD: `additionalProperty` no Product (Módulo 4).

### 3.3.3 Seletor de peso suportado (120/150 kg)

- `RadioGroup` vertical, altura fixa por opção (56 px) — CLS zero na troca.
- Trocar a opção atualiza no servidor (RSC action) preço, disponibilidade, specs do pistão e imagem principal.
- Regra de disponibilidade: combinação indisponível renderiza opção **desabilitada com motivo** ("150 kg: disponível em Preto — 5 dias"), nunca some da lista (evita shift e evita beco sem saída).
- Diferencial técnico visível na opção 150 kg: chip "pistão classe 3 · base aço reforçada · rodízio PU".

### 3.3.4 Calculadora de frete com prazos regionais

- Input CEP com máscara `00000-000` (somente dígitos, auto-hífen), botão "Calcular" (não submete form; `Enter` dispara).
- Consulta Via CEP (região/UF) + tabela de prazos por transportadora; resultado em slot reservado (112 px): até 3 linhas de opção (transportadora, prazo, preço) + linha "Frete grátis Sudeste acima de R$ 300" quando aplicável.
- Tabela pública de prazos (exibida também sem CEP consultado, por região) — reduz fricção de quem só quer estimar.
- Erro de CEP: mensagem inline `role="alert"`, foco retorna ao input.

## 3.4 PLP — listagem com facetas

```
┌──────────────┬───────────────────────────────────────────────────────────────┐
│ FILTROS      │  H1 Pistões a Gás                                             │
│ (sticky,     │  Copy topo 80–150 palavras c/ links p/ guias (hub-and-spoke)  │
│  280px)      │  ────────────────────────────────────────────────────────────│
│ Classe       │  [Relevância ▾]  24 produtos          ▦ grade │ ≣ lista       │
│  ☑ Classe 3  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│  ☐ Classe 2  │  │card  │ │card  │ │card  │ │card  │   card: imagem 4:5,      │
│ Carga        │  └──────┘ └──────┘ └──────┘ └──────┘   badges técnicos,       │
│  ☐ 120 kg    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   hierarquia de preço    │
│  ☑ 150 kg    │  │card  │ │card  │ │card  │ │card  │   (3.1.4) + preço/un     │
│ Kit          │  └──────┘ └──────┘ └──────┘ └──────┘   p/ peças, CTA rápido   │
│  ☐ 5x ☐ 10x  │  ────────────────────────────────────────────────────────────│
│ ─────────    │  [1] 2 3 ›  (paginação indexável, canonical próprio)          │
│ ✕ Limpar(2)  │  FAQ da categoria (Accordion, 3 itens, gera FAQPage)          │
└──────────────┴───────────────────────────────────────────────────────────────┘
```

- Chips de filtros ativos no topo da grade, removíveis individualmente (`aria-label="Remover filtro Classe 3"`).
- Card de peça exibe: nome, spec-chave ("haste 50 mm · classe 3"), preço unitário **e** "Kit 10x: R$ 32,70/un" quando houver tier; CTA "Comprar" adiciona o tier padrão (1 un) e abre o CartDrawer.
- Mobile: filtros em `Sheet` (botão fixo "Filtrar (2)"), grade 2 colunas, mesma URL/canonical.

## 3.5 PDP — Peça de reposição (ex.: Pistão a Gás Classe 3)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Home › Peças › Pistões a Gás › Pistão Classe 3 150 kg                        │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ GALERIA 1:1                   │  H1 Pistão a Gás Classe 3 — até 150 kg       │
│ (foto técnica + foto c/       │  [Classe 3] [Haste 50 mm] [Curso 100 mm]     │
│  medidas cotadas)             │  [Compatível: bases 600–700 mm]              │
│                               │                                              │
│ ┌───────────────────────────┐ │  ┌─ VERIFICADOR DE COMPATIBILIDADE ────────┐ │
│ │ ▸ Verificar compatibilidade│ │  │ 1. Sua cadeira: ( )Giratória escritório │ │
│ │   (abre o checker — 3.6.1) │ │  │    ( )Gamer ( )Presidente ( )Mocho      │ │
│ └───────────────────────────┘ │  │    ( )Outra / não sei                   │ │
│                               │  │ 2. Medida da coluna do pistão atual:    │ │
│  COMPRA (Tabs)                │  │    [___ mm] (ajuda: como medir ▸ guia)  │ │
│  ┌─────────┬──────────────┐   │  │ 3. Diâmetro do furo da base estrela:    │ │
│  │ Unitário│ Kits atacado │   │  │    ( )48–50 mm padrão ( )outro          │ │
│  ├─────────┴──────────────┤   │  │ [✓] COMPATÍVEL — encaixa na sua cadeira │ │
│  │ Qtd  [–] 1 [+]         │   │  │     ou [!] INCOMPATÍVEL — sugerimos:    │ │
│  │ R$ 48,90               │   │  │     Pistão Classe 3 haste 45 mm ▸ link  │ │
│  │ R$ 46,46 no Pix        │   │  └─────────────────────────────────────────┘ │
│  │ [ADICIONAR AO CARRINHO]│   │                                              │
│  └────────────────────────┘   │  Especificações (Accordion): material, curso,│
│  ┌ KIT MATRIX — ver 3.6.2 ───┐│  classe, carga, garantia, EAN                │
│  │ 1un · 5un · 10un · 20un   ││  "Quem comprou, levou junto": buchas 22×22,  │
│  │ preço/un regressivo +     ││  capa telescópica, base estrela (cross-link  │
│  │ badge ECONOMIA            ││  contextual hub-and-spoke)                   │
│  └───────────────────────────┘│  FAQ técnica (Accordion → FAQPage JSON-LD)   │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

### 3.6.1 Verificador de Compatibilidade (guia interativo)

Fluxo de 3 passos em `Sheet`/painel inline (implementado em `CompatibilityChecker.tsx`; regras em `lib/compatibility.ts`):

1. **Tipo de cadeira** (radio): giratória de escritório, gamer, presidente, mocho, outra/não sei. "Não sei" encaminha para o passo 2 sem bloqueio.
2. **Medidas-chave** conforme a peça:
   - Pistão: diâmetro da coluna/haste (mm) e curso aproximado; ajuda com foto cotada + link `/guias/como-medir-pistao-de-cadeira`.
   - Rodízio: diâmetro do pino de encaixe (10/11 mm) e se a base tem bucha.
   - Base estrela: diâmetro do furo central (48–50 mm padrão cone) e material do piso (define PU/silicone/nylon).
   - Flange/mecanismo: padrão de furação do assento (medida entre centros, mm) e se o pistão é fixado por cone.
3. **Resultado** com três estados visuais e textuais:
   - ✓ **Compatível** (`--success`): confirma e habilita CTA com foco.
   - ⚠ **Compatível com ressalva**: encaixa com bucha/adaptador — lista o item complementar com preço (upsell técnico legítimo).
   - ✕ **Incompatível** (`--danger`): motivo em linguagem direta ("sua coluna de 45 mm não encaixa neste pistão de 50 mm") + até 2 alternativas da loja + link WhatsApp com as medidas pré-preenchidas.

Regras de UX: progresso visível (1/2/3), nenhum passo exige cadastro, respostas anteriores editáveis (chips de resumo), resultado nunca é beco sem saída. O verificador é lazy (`next/dynamic`) — não afeta LCP/INP da PDP.

### 3.6.2 Seletor de quantidade fracionada/atacado com preço regressivo

Tabela de tiers (dados de exemplo do pistão classe 3; preços em centavos no backend):

| Tier | Preço/unid. | Total | Desconto vs unitário | Badge |
|------|------------|-------|----------------------|-------|
| 1 un | R$ 48,90 | R$ 48,90 | — | — |
| Kit 5 un | R$ 44,99 | R$ 224,95 | −8% | `ECONOMIZE 8%` |
| Kit 10 un | R$ 42,05 | R$ 420,50 | −14% | `ECONOMIZE 14%` |
| Kit 20 un | R$ 39,12 | R$ 782,40 | −20% | `MELHOR PREÇO −20%` |

Comportamento:
- Tabs "Unitário | Kits atacado"; no tab de kits, `RadioGroup` com 4 cards (5/10/20 + personalizado para clientes B2B com CNPJ: input de quantidade ≥ 21 com preço do tier 20).
- Cada card mostra: total, **preço unitário do tier** (o número que o comprador B2B compara), badge de economia e economia absoluta ("−R$ 195,60 vs 20× unitário").
- Trocar de tier **não faz fetch**: a matriz de preços vem pré-calculada no payload (INP < 50 ms na interação).
- Pix: 5% adicional exibido por tier ("R$ 37,15/un no Pix").
- Especificação do componente central (código completo): Módulo 5.

## 3.7 Carrinho (slide-over) e checkout

### 3.7.1 CartDrawer

- `Sheet` lateral direita (Radix Dialog), 420 px desktop / 100 vw mobile; abre em ação de adicionar (com foco no item novo e `aria-live` anunciando "Item adicionado, carrinho com 3 produtos").
- Conteúdo: itens (miniatura 64×64, nome, variação/tier, seletor de qtd, remover), barra de progresso de frete grátis ("Faltam R$ 40,10 para frete grátis Sudeste" — slot fixo 40 px), subtotal, linha Pix estimado, CTA "Finalizar compra" + link "Ver carrinho".
- Sem upsell pesado no drawer (1 bloco máx.: "Buchas compatíveis +R$ 10,90").

### 3.7.2 Checkout (página própria, 1 coluna, sem ruído)

```
┌───────────────────────────────────────────────┐
│ Checkout seguro · Chair Cadeiras    (selos)   │
│ ─────────────────────────────────────────────│
│ 1 IDENTIFICAÇÃO  [e-mail] (guest first)       │
│ 2 ENTREGA        [CEP → endereço auto]        │
│   ↳ opções de frete c/ prazo regional         │
│ 3 PAGAMENTO (Vindi — iframe em slot fixo)     │
│  ┌──────────────────────────────────────────┐ │
│  │ ( ● ) Pix à vista                        │ │
│  │     R$ 956,56 — 5% de desconto           │ │
│  │     aprovação imediata · QR Code         │ │
│  │ ( ○ ) Cartão de crédito                  │ │
│  │     até 6x de R$ 167,82 sem juros        │ │
│  │     [select parcelas: 1x..6x s/ juros,   │ │
│  │      7x–12x c/ juros exibidos c/ CET]    │ │
│  │ ( ○ ) Boleto (B2B) · ( ○ ) Faturado/CNPJ │ │
│  └──────────────────────────────────────────┘ │
│ ─────────────────────────────────────────────│
│ RESUMO (sticky): itens · frete · desconto Pix │
│ · total.  [PAGAR R$ 956,56]                   │
└───────────────────────────────────────────────┘
```

Regras (corrigem achados A3/A6):
1. **Zero banners promocionais no checkout.** Nenhum fullbanner, carrossel ou pop-up; a única comunicação é a economia já aplicada ("Você economiza R$ 50,34 no Pix").
2. **Pix é a opção padrão** visualmente destacada (badge "−5%", cor `--success`), pois é a oferta mais forte da loja; cartão com seletor de parcelas mostrando o valor exato por opção.
3. Fluxo B2B: pagamento faturado/boleto para CNPJ liberado a partir de pedido ≥ R$ 1.000 (regra exibida com transparência).
4. Guest checkout; cadastro opcional pós-compra. Máscara de CPF/CNPJ, validação inline sem bloquear digitação.
5. Confiança: selos (Vindi, site seguro, CNPJ, endereço de Jaú/SP) uma única vez, no rodapé do checkout; garantia 12 meses e devolução 7 dias em 1 linha.
6. Erros de pagamento: mensagem da Vindi traduzida para linguagem direta + retry sem perder o formulário.

## 3.8 Acessibilidade — WCAG 2.2 AA (checklist de aceite)

1. Contraste ≥ 4,5:1 (texto) e ≥ 3:1 (UI) — verificado por `axe-core` em CI (3.1.1).
2. Navegação 100% por teclado; ordem de foco = ordem visual; skip-link "Ir para o conteúdo" e "Ir para os filtros" nas PLPs.
3. Foco visível em todos os interativos (outline 2 px `--brand`, offset 2 px); gestão de foco em Dialog/Sheet (Radix) com retorno ao elemento de origem.
4. Alvos de toque ≥ 44×44 px (WCAG 2.2 Target Size).
5. Formulários: `label` explícito, erro com `role="alert"` + `aria-describedby`, autocomplete (`postal-code`, `email`, `tel`).
6. Imagens: `alt` descritivo para conteúdo, `alt=""` para decorativas; galeria com navegação por setas anunciada.
7. Tabelas de dimensões com `<th scope>`; preços com `tabular-nums`.
8. Estado de seleção nunca depende só de cor (badge de economia tem texto; compatibilidade tem ícone + texto).
9. `aria-live` discreto: carrinho, resultado de frete, resultado do verificador de compatibilidade (`polite`).
10. Movimento: carrosséis fora do hero podem ser pausados; `prefers-reduced-motion` desativa transições do drawer/tabs.
11. Idioma `lang="pt-BR"`; trechos em outro idioma marcados (`lang` local) — inexistente no catálogo, regra preventiva.
12. Zoom 200% e texto redimensionado sem perda de conteúdo/funcionalidade (grid fluido, sem overflow oculto).

## 3.9 Mobile (prioridade — maioria do tráfego B2C)

- Header colapsa: logo + busca (expandível) + carrinho; profile toggle vira `Sheet` "O que você procura hoje?" com 2 botões grandes (Cadeira / Peças) na primeira visita da sessão.
- PLP: filtros em `Sheet` full-height; grade 2 colunas; ordenação em `Select` nativo estilizado.
- PDP: galeria swipe 1:1; compra em **sticky bar inferior** (preço + CTA, altura fixa 64 px, reservada no layout — CLS zero); acordeões de specs abaixo.
- Verificador de compatibilidade e kit matrix funcionam em coluna única, cards empilhados, sem tabela horizontal (scroll-x apenas na tabela de dimensões com `tabindex="0"` e `aria-label`).
