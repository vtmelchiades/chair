# Módulo 1 — Arquitetura de Informação e Siloing de SEO

## 1.1 Princípios

1. **Separação explícita de fluxos.** B2C (comprar cadeira) e B2B/Reposição (comprar peça/atacado) são silos de topo independentes: `/cadeiras` e `/pecas`. Nenhum produto pertence aos dois silos. Kits de atacado pertencem a `/pecas`.
2. **Um produto, uma URL canônica.** Todo produto tem exatamente um caminho `/produto/{slug}`. Categorias são visões (listagens) que apontam para essa URL; nunca o contrário (elimina o achado A4).
3. **Ambientes são hubs de navegação, não categorias.** `/ambientes/{ambiente}` agrega produtos de ambos os silos via curadoria e linka para as categorias canônicas. Não gera URL de produto alternativa.
4. **Siloing por proximidade semântica.** Cada silo tem seu próprio conteúdo de apoio (guias), seu próprio breadcrumb e sua própria malha de links internos. Link cross-silo apenas onde há intenção mista real (ex.: "cadeira gamer" ↔ "kit base reforçada 150 kg").
5. **Nenhum link interno aponta para página de busca interna.** Busca é utilitário (`noindex`), não destino de link (elimina o achado A2).

## 1.2 Árvore de categorias canônica

```
/ (home — hub de perfis)
│
├── /cadeiras                          [SILO B2C — hub]
│   ├── /cadeiras/ergonomicas-nr-17        Ergonômicas NR-17 (certificadas p/ norma)
│   ├── /cadeiras/presidente               Presidente
│   ├── /cadeiras/diretor                  Diretor
│   ├── /cadeiras/executiva                Executiva
│   ├── /cadeiras/gamer                    Gamer (todas)
│   │   └── facetas indexáveis: ?peso-suportado=120kg | 150kg (ver 1.6.3;
│   │       promoção futura a landing própria /cadeiras/gamer/150kg-reforcada
│   │       quando o volume justificar copy dedicada permanente)
│   └── /cadeiras/mochos                   Mochos (giratórios, clínicos)
│
├── /pecas                             [SILO B2B/REPOSIÇÃO — hub]
│   ├── /pecas/pistoes-a-gas               Pistões a gás
│   │   ├── filtro: classe=2 | classe=3    (facetado, ver 1.6)
│   │   └── filtro: carga=120kg | carga=150kg
│   ├── /pecas/rodizios                    Rodízios
│   │   └── filtro: material=pu | material=silicone | material=nylon
│   ├── /pecas/bases-estrela               Bases estrela (aço/nylon, 600–700 mm)
│   ├── /pecas/mecanismos                  Mecanismos
│   │   └── facetas indexáveis: ?mecanismo=relax | flange | back-system (1.6.3)
│   ├── /pecas/bracos                      Braços (fixo, digitador, regulável)
│   ├── /pecas/assentos-e-encostos         Assentos e encostos
│   ├── /pecas/buchas-e-acabamentos        Buchas, capas telescópicas, acabamentos
│   └── /pecas/kits-atacado                Kits 5x / 10x / 20x (B2B)
│
├── /ambientes                         [HUBS DE SEGMENTAÇÃO — cross-silo]
│   ├── /ambientes/home-office
│   ├── /ambientes/corporativo
│   ├── /ambientes/setup-gamer
│   ├── /ambientes/clinicas-e-consultorios   (mochos + rodízios silenciosos)
│   └── /ambientes/templos-e-igrejas         (longarinas, cadeiras empilháveis)
│
├── /guias                             [CONTEÚDO SPOKE — autoridade técnica]
│   ├── /guias/diferenca-pistao-classe-2-e-classe-3
│   ├── /guias/rodizio-pu-vs-silicone-vs-nylon
│   ├── /guias/nr-17-exigencia-cadeiras-escritorio
│   ├── /guias/como-medir-pistao-de-cadeira
│   ├── /guias/como-trocar-flange-relax
│   └── /guias/cadeira-reforcada-150kg-o-que-muda
│
└── /produto/{slug}                    [PDPs — folha de ambos os silos]
```

Regras de profundidade: máximo 2 níveis abaixo do hub de silo (`/pecas/mecanismos/relax` é o limite). Landings curadas de filtro (`/cadeiras/gamer/150kg-reforcada`) contam como nível e só existem quando há copy única e volume de busca que justifique; caso contrário o filtro vive apenas como faceta (1.6).

### 1.2.1 Mapeamento produto → categoria

Cada SKU tem **uma categoria primária** (determina o breadcrumb e a URL de listagem padrão) e até duas **secundárias** (o produto aparece na listagem, mas o breadcrumb e o canonical da PDP nunca mudam). Exemplo do achado A4: "Base Estrela Aço Cadeira Diretor com Capa Nylon" → primária `/pecas/bases-estrela`; secundárias `/pecas/kits-atacado` (por ser kit estrela+capa) e `/ambientes/corporativo`.

## 1.3 Hubs de ambiente (cross-silo sem duplicação)

| Hub | Composição | Links de saída principais |
|-----|-----------|---------------------------|
| `/ambientes/home-office` | Ergonômicas NR-17, executivas, pistão classe 3, braço digitador | `/cadeiras/ergonomicas-nr-17`, `/guias/nr-17-...` |
| `/ambientes/corporativo` | Presidente, diretor, kits 10x/20x para facilities | `/cadeiras/presidente`, `/pecas/kits-atacado` |
| `/ambientes/setup-gamer` | Gamer 120/150 kg, kit base estrela reforçada + rodízios PU | `/cadeiras/gamer/150kg-reforcada`, `/pecas/bases-estrela` |
| `/ambientes/clinicas-e-consultorios` | Mochos, rodízios silicone anti-risco | `/cadeiras/mochos`, `/pecas/rodizios?material=silicone` |
| `/ambientes/templos-e-igrejas` | Cadeiras empilháveis/longarinas, kits atacado | `/pecas/kits-atacado`, contato B2B |

Páginas de ambiente são indexáveis (`noindex` **não**), com H1 e copy próprios ("Cadeiras para Home Office com conformidade NR-17") e grade de produtos curada (não é resultado de filtro automático). A URL do produto permanece `/produto/{slug}`; a página de ambiente nunca reescreve a URL do produto.

## 1.4 Siloing e fluxo de link equity

```
                      HOME
              ┌────────┼────────────┐
         /cadeiras   /pecas    /ambientes/*
              │         │           │ (links cruzados curados,
     subcategorias  subcategorias    │  sempre para a categoria canônica
              │         │           │  ou para /produto/{slug})
     /guias/* ─┴─────────┴───────────┘
              │
        /produto/{slug}
```

Regras de linkagem interna:

1. **Vertical (obrigatória):** home → hub de silo → subcategoria → PDP. Breadcrumb em toda página (renderiza `BreadcrumbList`, Módulo 4).
2. **Horizontal:** subcategoria ↔ subcategoria irmã no mesmo silo (bloco "Categorias relacionadas", máx. 4 links).
3. **Spoke → hub/produto:** todo guia termina com bloco de produtos relacionados ao tema e link para a subcategoria correspondente (ex.: guia pistão classe 2 vs 3 → `/pecas/pistoes-a-gas?classe=3`).
4. **Cross-silo:** permitido apenas contextualmente no corpo da PDP e dos guias (ex.: PDP da Gamer 150 kg → "Kit base estrela reforçada 150 kg" em `/pecas/bases-estrela`).
5. **Densidade:** PDP tem no máximo 30 links internos; PLP no máximo 60 (produtos + facetas + navegação). Rodapé: máx. 24 links (1.5).
6. **Âncoras:** texto de âncora = termo técnico-alvo da página de destino, sem repetição exata em mais de 3 links por página. Proibido "clique aqui", "saiba mais" como única âncora.

## 1.5 Substituição do bloco "Palavras mais buscadas"

O bloco atual (achado A2) é removido. No lugar, três mecanismos:

### 1.5.1 Rodapé hub-and-spoke curado

```
CADEIRAS                    PEÇAS E ATACADO              GUIAS TÉCNICOS              ATENDIMENTO
Cadeira Ergonômica NR-17    Pistão a Gás Classe 3        Classe 2 vs Classe 3        WhatsApp / horários
Cadeira Presidente          Pistão a Gás Classe 2        Rodízio PU vs Nylon         Rastrear pedido
Cadeira Diretor             Rodízio PU Anti-risco        NR-17: o que exige          Trocas e devoluções
Cadeira Gamer 150 kg        Rodízio Silicone             Como medir o pistão         Fale com a fábrica (Jaú/SP)
Mocho Giratório             Base Estrela Aço             Como trocar a flange        CNPJ / dados da empresa
Cadeiras p/ Igrejas         Flange Relax                 Cadeira 150 kg: o que muda
                            Kits Atacado 10x/20x
```

Cada termo do rodapé aponta para **categoria curada, landing indexável ou guia** — nunca para busca interna. Os termos herdam a demanda real das "palavras mais buscadas" da Tray (pistao, flange, estrela, mocho, kit...) mas com destino que consolida autoridade em vez de diluí-la.

### 1.5.2 Links contextuais no corpo das páginas (in-content)

- PLPs ganham parágrafo de topo (80–150 palavras) com 2–3 links para guias: em `/pecas/pistoes-a-gas`, o texto "O pistão **classe 3** suporta cargas maiores que o classe 2 — veja a diferença completa" linka `/guias/diferenca-pistao-classe-2-e-classe-3`.
- PDPs ganham seção "Compatibilidade e peças relacionadas" com links para as peças que compõem o produto (cadeira gamer 150 kg → pistão classe 3 150 kg, base estrela reforçada, rodízio PU).
- Guias linkam de volta para PDPs com CTA de produto (card com preço, não apenas texto).

### 1.5.3 Busca preditiva com tolerância a erro (utilitário, não SEO)

O autocomplete do header (Módulo 3, seção 3.2) absorve as variações que hoje viravam links de rodapé: "pistao", "pistão", "pisto", "rodizio silicone", "flanje" → sugestões de **categoria/PDP** (nunca de página de busca). A rota `/buscar?q=` existe, responde 200 apenas para usuários e envia `X-Robots-Tag: noindex, follow`; zero links internos apontam para ela.

## 1.6 URLs canônicas para navegação facetada

### 1.6.1 Modelo de parâmetros

Facetas vivem em query string sobre a URL da categoria, com **ordenação alfabética fixa de parâmetros** e valores em slug lowercase sem acento:

```
/pecas/pistoes-a-gas?classe=3&carga=120kg&ordenar=preco-asc
/pecas/rodizios?material=pu&diametro-pino=11mm
/cadeiras/gamer?peso-suportado=150kg&cor=preto
```

Parâmetros reconhecidos por silo:

| Parâmetro | Domínio | Onde |
|-----------|---------|------|
| `classe` | `2`, `3` | `/pecas/pistoes-a-gas` |
| `carga`, `peso-suportado` | `100kg`, `120kg`, `150kg` | pistões, bases, cadeiras |
| `material` | `pu`, `silicone`, `nylon`, `aco` | rodízios, bases |
| `mecanismo` | `relax`, `flange`, `back-system` | mecanismos, cadeiras |
| `diametro-pino` | `11mm`, `10mm` | rodízios, buchas |
| `kit` | `5x`, `10x`, `20x` | kits-atacado |
| `ordenar` | `relevancia`, `preco-asc`, `preco-desc`, `novidades`, `mais-vendidos` | todas as PLPs |
| `pagina` | inteiro ≥ 2 | todas as PLPs |

Parâmetro desconhecido → ignorado no render e **removido da canonical**. Valor fora do domínio → idem.

### 1.6.2 Regra de canonical (matriz de decisão)

| Estado da URL | `<link rel=canonical>` | `robots` |
|---------------|------------------------|----------|
| Categoria sem parâmetros | ela mesma (auto-canonical) | `index, follow` |
| 1 faceta da **whitelist** (1.6.3) | ela mesma | `index, follow` |
| 1 faceta fora da whitelist | a categoria base sem parâmetros | `noindex, follow` |
| ≥ 2 facetas combinadas | a categoria base sem parâmetros | `noindex, follow` |
| Qualquer URL com `ordenar` ≠ relevancia | mesma URL sem `ordenar` | `noindex, follow` |
| Paginação `pagina=N` | ela mesma (cada página é coleção distinta de produtos) | `index, follow` |
| `pagina=N` combinada com facetas | categoria base paginada **ou** sem parâmetros se fora da whitelist | `noindex, follow` |
| `/buscar?q=` | sem canonical | `noindex, follow` (via X-Robots-Tag) |

Justificativa das exceções: ordenação não cria conteúdo novo (mesmos produtos) → canonical para a URL não ordenada. Paginação cria conjuntos distintos de produtos → indexável com canonical próprio; titles paginados ("Pistões a Gás Classe 3 — Página 2"). Facetas combinadas (peso × classe × mecanismo) são o caso clássico de explosão de conteúdo duplicado citado no escopo: todas colapsam para a base.

### 1.6.3 Whitelist de facetas indexáveis

Uma faceta isolada vira página indexável **apenas** quando atende aos três critérios: (a) volume de busca mensal ≥ 300 para o termo combinado; (b) ≥ 6 produtos no resultado; (c) H1 + parágrafo de topo próprios (template com copy por faceta, não apenas o nome do filtro).

Whitelist inicial:

| URL facetada indexável | Termo-alvo |
|------------------------|------------|
| `/pecas/pistoes-a-gas?classe=3` | pistão classe 3 |
| `/pecas/pistoes-a-gas?classe=2` | pistão classe 2 |
| `/pecas/rodizios?material=pu` | rodízio PU para cadeiras |
| `/pecas/rodizios?material=silicone` | rodízio silicone anti-risco |
| `/pecas/kits-atacado?kit=10x` | kit 10 pistões cadeira atacado |
| `/pecas/mecanismos?mecanismo=relax` | flange relax para cadeira |
| `/cadeiras/gamer?peso-suportado=150kg` | cadeira gamer 150 kg |

Preferência: quando uma faceta indexável tem demanda alta e permanente, **promover a landing curada** com caminho próprio (`/cadeiras/gamer/150kg-reforcada`), que recebe canonical de `/cadeiras/gamer?peso-suportado=150kg` (a query vira alias). Isso mantém a superfície indexável pequena e o conteúdo controlável.

### 1.6.4 Implementação

- Canonical sempre absoluta (`https://www.chaircadeiras.com.br/...`), gerada no servidor a partir dos `searchParams` normalizados (ordem alfabética, strip de vazios/desconhecidos) — função `buildCanonicalUrl()` implementada em `web/src/lib/facets.ts` e testada.
- Links de faceta no front-end usam `router.push` com `scroll: false` + `useTransition` (INP, Módulo 2); o `<link rel=canonical>` e o meta robots mudam junto no RSC payload.
- `sitemap.xml` (gerado em `app/sitemap.ts`) inclui apenas URLs `index,follow`: categorias, landings curadas, whitelist 1.6.3, ambientes, guias, PDPs em estoque. Nunca inclui combinações facetadas fora da whitelist.
- `robots.txt`: `Disallow: /buscar`, `Disallow: /checkout`, `Disallow: /carrinho`; `Allow` irrestrito nas PLPs (a exclusão de facetas é feita por canonical/noindex, não por disallow — disallow impediria o Google de ver o canonical).

## 1.7 Mapa de redirects 301 (migração Tray → nova estrutura)

| URL atual (amostra auditada) | Destino canônico |
|------------------------------|------------------|
| `/pecas-de-reposicao` | `/pecas` |
| `/pecas-de-reposicao/rodizios` | `/pecas/rodizios` |
| `/pecas-de-reposicao/rodizios/rodizio-nylon` | `/pecas/rodizios?material=nylon` |
| `/pecas-de-reposicao/rodizios/rodizio-nylon/kit-diretor-estrela-e-capa-nylon-preto` | `/produto/base-estrela-aco-diretor-capa-nylon` |
| `/pecas-de-reposicao/kits/{slug}` | `/produto/{slug}` |
| `/cadeiras/cadeiras-gamer` | `/cadeiras/gamer` |
| `/cadeiras/cadeira-presidente` | `/cadeiras/presidente` |
| `/cadeiras/cadeiras-ergonomicas` | `/cadeiras/ergonomicas-nr-17` |
| `/cadeiras/cadeiras-de-escritorio` | `/cadeiras` |
| `/ambientes/home-office` | `/ambientes/home-office` (mantida) |
| `/flange-aco-mecanismo-relax-cadeira-diretor-executiva` | `/produto/flange-aco-mecanismo-relax-diretor-executiva` |
| `/pistao-gas-universal-cadeira-escritorio-120kg` | `/produto/pistao-gas-classe-3-120kg` |
| `/kit-base-cadeira-gamer-premium-150kg-base-estrela-reforcada-5-rodizios-coloridos-capa` | `/produto/kit-base-gamer-150kg-estrela-reforcada-rodizios-pu` |
| `/1`, `/back`, `/braco`, `/bucha`, `/capa`, `/colmeia`, `/estrela`, `/kit`, `/kits`, ... (buscas do rodapé) | categoria correspondente (`/pecas/bases-estrela`, `/pecas/kits-atacado`, etc.) |
| PDPs de produto (todas) | `/produto/{slug-novo}` — slug novo = nome técnico normalizado |

Regras: 301 server-side (nunca meta refresh); cadeia máxima de 1 hop (URL antiga → URL final); slugs de produto novos são estáveis e derivados do nome técnico sem acento; o mapa completo é gerado a partir do export de produtos da Tray e versionado em `web/src/lib/redirects.csv` antes do cutover.

## 1.8 Templates de title e meta description

| Tipo | Title (≤ 60 chars) | Meta description (≤ 155 chars) |
|------|--------------------|-------------------------------|
| Home | `Chair Cadeiras: Cadeiras e Peças Direto da Fábrica em Jaú/SP` | Fabricante de cadeiras ergonômicas NR-17, gamer até 150 kg e peças de reposição: pistões classe 3, rodízios PU, bases estrela. Atacado e varejo. |
| Hub de silo | `Cadeiras de Escritório Ergonômicas \| Chair Cadeiras` | ... |
| Subcategoria | `{Categoria} — {diferencial} \| Chair Cadeiras` (ex.: `Pistões a Gás Classe 3 para Cadeiras até 150 kg`) | Copy com spec técnica + oferta (frete, parcelamento). |
| Faceta whitelist | `{Categoria}: {valor da faceta} \| Chair Cadeiras` | Específica do filtro. |
| Ambiente | `Cadeiras para {Ambiente} \| Chair Cadeiras` | Curadoria + benefício do ambiente. |
| PDP cadeira | `{Produto} — Suporta {peso} \| Chair Cadeiras` (ex.: `Cadeira Gamer GXF Base Metálica 150 kg Reforçada`) | Atributos-chave: peso suportado, classe do pistão, NR-17, preço Pix. |
| PDP peça | `{Peça} {spec} — Unitário e Kit Atacado \| Chair` | Espec. de encaixe + kits 5x/10x/20x com preço regressivo. |
| Guia | `{Dúvida real} — {resposta curta} \| Chair` (ex.: `Pistão Classe 2 vs Classe 3: Qual a Diferença?`) | Resumo da resposta + CTA. |

Sufixo de marca fixo `| Chair Cadeiras`; em PDPs de peça com title longo, sufixo reduzido `| Chair`. Sem acento em slugs, com acento em titles/descriptions (UTF-8, Módulo 2 §2.6).

## 1.9 Governança de categorização

1. Novos SKUs são criados com categoria primária obrigatória escolhida da árvore 1.2; sem primária, o SKU não publica.
2. Kits montados (estrela + rodízios + capa) classificam-se pelo **componente principal** (base estrela → `/pecas/bases-estrela`), com secundária `/pecas/kits-atacado`.
3. Revisão mensal de PDPs com bounce anormal e de termos de busca interna sem resultado → candidatos a novo guia ou nova faceta whitelist.
4. Proibido criar categoria nova sem: ≥ 6 SKUs, termo-alvo com volume ≥ 300/mês, copy própria. Caso contrário, usar faceta.
