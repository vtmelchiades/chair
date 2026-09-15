# Módulo 5 — Componente Central: Matriz de Compatibilidade e Kits

Código-fonte: [`web/src/components/parts/CompatibilityKitMatrix.tsx`](../web/src/components/parts/CompatibilityKitMatrix.tsx)
Apoio: [`web/src/lib/pricing.ts`](../web/src/lib/pricing.ts) (tiers), [`web/src/lib/compatibility.ts`](../web/src/lib/compatibility.ts) (regras), [`web/src/lib/search.ts`](../web/src/lib/search.ts), usados na PDP `/produto/[slug]` para peças.

## 5.1 Responsabilidade

Componente `'use client'` único da zona de compra da PDP de peça de reposição. Reúne os quatro requisitos do escopo:

1. **Alternador unitário/kits** com desconto progressivo (Tabs + RadioGroup de tiers).
2. **Indicador visual de especificação técnica** — classe do pistão (badge colorido por classe, com ícone e texto), material/diâmetro da base, curso, diâmetro da coluna.
3. **Badge dinâmico de economia** no atacado — percentual e valor absoluto calculados contra o preço unitário × quantidade do tier.
4. **CTA acessível (WCAG 2.2 AA)** integrado ao carrinho global (`CartProvider`).

O `CompatibilityChecker` (verificador de compatibilidade do Módulo 3 §3.6.1) vive ao lado, no mesmo painel, e seu resultado alimenta o estado do CTA.

## 5.2 Contrato de dados (props)

```ts
type PartProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;              // ex.: "pistoes-a-gas"
  specs: {
    gasClass?: 2 | 3;            // classe do pistão
    columnDiameterMm: number;    // diâmetro da coluna (cone da base)
    rodDiameterMm?: number;      // haste (flange/mecanismo)
    strokeMm?: number;           // curso
    maxLoadKg: number;           // carga máxima
    pinDiameterMm?: number;      // pino de rodízio
    material?: "pu" | "silicone" | "nylon" | "aco";
    baseType?: "estrela-5" | "estrela-6";
    wheelSetSize?: number;       // rodízios por cadeira (5 ou 6)
  };
  tiers: PriceTier[];            // matriz de preço pré-calculada no servidor
  baseUnitPriceCents: number;    // preço cheio de 1 unidade
  stock: { status: "in_stock" | "low" | "out"; qty: number };
};

type PriceTier = {
  id: "unitario" | "kit5" | "kit10" | "kit20";
  quantity: number;              // 1 | 5 | 10 | 20
  unitPriceCents: number;        // preço POR UNIDADE do tier (inteiros, centavos)
  totalCents: number;            // unitPriceCents * quantity
  wholesaleOnly?: boolean;       // tier 20 pode exigir CNPJ (regra de negócio)
};
```

Regras de preço centralizadas em `lib/pricing.ts`:
- `buildTierMatrix(baseUnitPriceCents, discounts)` — descontos progressivos padrão `[0%, 8%, 14%, 20%]` configuráveis por categoria; arredondamento **por unidade** para o centavo mais próximo, total = `unit * qty` (nunca o inverso — evita divergência de 1 centavo entre card e checkout).
- `PIX_DISCOUNT = 0.05` aplicado sobre o total do tier; exibido por unidade e total.
- Dinheiro sempre em centavos inteiros (`number` inteiro); formatação BRL apenas na borda (`formatBRL`).

## 5.3 Estado e interações

```
estado local do componente:
  mode: "unitario" | "kits"            (Tabs)
  tierId: PriceTier["id"]              (RadioGroup; default = maior tier não-wholesaleOnly)
  customQty: number | null             (input ≥ 21 p/ CNPJ, preço do tier 20)
  checkerOpen: boolean                 (Sheet do verificador)
  checkerResult: CompatibilityResult | null
consumido do contexto global:
  cart.addItem({ productId, tierId, quantity, unitPriceCents })
```

- Trocar tier não dispara rede: a matriz vem no payload (INP alvo < 50 ms).
- `customQty` com debounce de validação (≥ 21, inteiro); preço exibido = tier 20.
- Resultado do verificador:
  - `compatible` → CTA normal + linha de confirmação verde.
  - `compatible_with_adapter` → CTA normal + upsell do adaptador (buchas) com `aria-describedby`.
  - `incompatible` → CTA desabilitado com motivo (`aria-disabled` + tooltip/explicação visível) e links das alternativas; **nunca** some o botão (estabilidade de layout e clareza).
- `aria-live="polite"` na região de preço: anuncia "Kit 10 unidades, 42 reais e 5 centavos por unidade, economia de 14 por cento" ao trocar de tier.

## 5.4 Acessibilidade (mapeamento WCAG 2.2 AA)

| Requisito | Implementação |
|-----------|---------------|
| 1.3.1 Info and Relationships | Tabs/RadioGroup Radix (roles ARIA corretos); specs em `<dl>`; preço em estrutura semântica |
| 1.4.3 Contrast | badge de economia: texto `#052e16` sobre `#bbf7d0` (7,9:1); classe 3: branco sobre `#0B3C8C` (9,1:1) |
| 1.4.11 Non-text Contrast | bordas de tier selecionado 2 px `--brand` (≥ 3:1) |
| 2.1.1/2.1.2 Keyboard | setas navegam tiers (RadioGroup), Tab sai do grupo (roving tabindex do Radix), sem armadilha de foco |
| 2.4.7 Focus Visible | outline 2 px `--brand`, offset 2 px em todos os interativos |
| 2.5.8 Target Size | cards de tier ≥ 44 px de altura; botão de quantidade 44×44 |
| 3.3.2 Labels | input de quantidade personalizada com `<label>` e `aria-describedby` de erro |
| 4.1.3 Status Messages | região de preço e resultado do verificador em `aria-live="polite"`; erro de quantidade em `role="alert"` |
| Estado não só por cor | badge de economia inclui texto ("ECONOMIZE 14%"); compatibilidade inclui ícone + texto ("✓ Compatível") |

O CTA é um `<button type="button">` real (não `<div onClick>`), com nome acessível estável "Adicionar ao carrinho — {nome do tier}" (`aria-label` composto), e o CartDrawer confirma via `aria-live` global.

## 5.5 Visual (especificação de aparência)

```
┌ PAINEL (border --line, radius 12, p-6, bg white) ─────────────────────────┐
│ [Classe 3] [Coluna 50 mm] [Curso 100 mm] [150 kg]   ← dl de specs, badges │
│                                                                            │
│ ┌ Tabs ────────────────────────────────────────────────────────────────┐   │
│ │ [ Unitário ] [ Kits atacado ● ]                    ● = badge de oferta │   │
│ ├ RadioGroup de tiers (grid 2x2 mobile / 4x1 desktop) ─────────────────┤   │
│ │ ┌ 5 un ─────────┐ ┌ 10 un ────────┐ ┌ 20 un ──────────────┐          │   │
│ │ │ R$ 224,95     │ │ R$ 420,50     │ │ R$ 782,40           │          │   │
│ │ │ R$ 44,99/un   │ │ R$ 42,05/un   │ │ R$ 39,12/un         │          │   │
│ │ │ [ECONOMIZE 8%]│ │[ECONOMIZE 14%]│ │[MELHOR PREÇO −20%]  │          │   │
│ │ └───────────────┘ └───────────────┘ └─────────────────────┘          │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│ Total R$ 420,50 · R$ 399,48 no Pix · unid. R$ 42,05 (tabular-nums)        │
│ Qtd kits: [–] 10 [+] (múltiplos do tier)                                   │
│ ┌ ✓ Verificador: compatível com sua cadeira (resumo do checker) ┐          │
│ [ ADICIONAR AO CARRINHO — KIT 10 UN · R$ 420,50 ]  (48px, full width)     │
└────────────────────────────────────────────────────────────────────────────┘
```

Detalhes: badge do tier vencedor ("MELHOR PREÇO") em `--success`; tier selecionado com borda 2 px `--brand` + check; preços com `tabular-nums`; economia absoluta exibida no detalhe do tier ("−R$ 68,50 vs unitário").

## 5.6 Testes (Vitest + Testing Library — implementados)

1. `pricing.test.ts`: matriz de tiers (arredondamento por unidade, total = unit × qty, monotonicidade regressiva), Pix 5%, preço por unidade de customQty ≥ 21 = tier 20.
2. `compatibility.test.ts`: regra por peça (coluna 50 mm ↔ furo 48–50 mm; pino 11 mm; classe vs carga; ressalva com bucha; incompatível com alternativas).
3. `search.test.ts`: "rodizio silicone" e "pistao classe 3" (com e sem acento, com typo "flanje", "pisto c3") retornam o destino correto.
4. `facets.test.ts`: canonicalização (ordem alfabética de parâmetros, remoção de desconhecidos, regra noindex de ≥ 2 facetas, whitelist).
5. Componente (smoke em build): render server-side da PDP de peça contém o painel e o JSON-LD agregado.
