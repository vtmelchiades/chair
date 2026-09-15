# Módulo 0 — Diagnóstico do Site Atual

Auditoria executada em 2026-09-15 sobre https://www.chaircadeiras.com.br/ (HTML público renderizado pela plataforma Tray, tema 21). Cada achado lista a evidência observada e o impacto. Os achados alimentam as decisões dos Módulos 1 a 4.

## 0.1 Plataforma e stack atual

| Item | Estado atual |
|------|--------------|
| Plataforma | Tray (Loja Integrada/TCDN — imagens em `images.tcdn.com.br`) |
| Tema | Tema 21 da Tray, customização limitada |
| Pagamento | Vindi (Pix com desconto à vista e parcelamento sem juros já configurados) |
| Atendimento | WhatsApp `5514996642123`, Instagram `@chair.cadeiras` |
| Rastreamento | Facebook Conversions Console 2.1.0 |

Limitação central: o tema Tray não permite controle fino de Core Web Vitals (carrosséis de banner no hero, scripts de terceiros bloqueantes, sem `fetchpriority`, sem reservas de layout), nem de estrutura de URL (filtros geram caminhos profundos indexáveis). A migração para stack próprio é pré-requisito dos Módulos 2 e 4.

## 0.2 Achados críticos

### A1. Caracteres corrompidos (mojibake) em produção

Evidência: o banner de cookies renderiza "Ao usar esta loja virtual, voc\uFFFD aceita automaticamente o uso de cookies. Atrav\uFFFDs dos cookies..." — caracteres `ê` e `é` substituídos pelo byte de substituição.

Causa provável: conteúdo armazenado ou transmitido em Windows-1252/Latin-1 e decodificado como UTF-8 (ou dupla codificação) no pipeline do tema. O problema é de encoding em alguma camada (banco, template ou cabeçalho HTTP sem `charset=utf-8`).

Impacto: credibilidade (texto visivelmente corrompido), risco de o Google interpretar a página com encoding errado (todo o conteúdo acentuado do catálogo — "Cadeiras", "Peças", "Reposição" — depende de acentuação correta para matching de busca). Tratamento completo no Módulo 2, seção 2.6.

### A2. Bloco "Palavras mais buscadas" no rodapé

Evidência: o rodapé lista 20 links para URLs de busca interna: `/1`, `/assentos-e-encostos`, `/back`, `/bases`, `/braco`, `/bucha`, `/cadeira`, `/cadeira giratoria`, ..., `/pistao`.

Problemas:
1. `/1` é um link sem significado (resíduo de configuração) — provável soft 404.
2. Termos truncados e sem acento (`braco`, `pistao`) apontam para páginas de busca com conteúdo fino/duplicado, não para categorias curadas.
3. 20 links de rodapé de baixo valor diluem o PageRank interno que deveria fluir para categorias e páginas de produto.
4. Páginas de resultado de busca interna não devem ser indexáveis; hoje competem com as categorias.

Substituição: estratégia hub-and-spoke de links contextuais (Módulo 1, seção 1.5).

### A3. Banners duplicados e carrossel no hero

Evidência: a home repete o mesmo conjunto de banners duas vezes (bloco desktop + bloco mobile renderizados simultaneamente no HTML; "Banner-Lançamento" e "Fullbanner1920x600" aparecem em dobro). Um dos banners ("Mês dos Pais") aponta para `/pecas-de-reposicao`, outro para sorteio no Instagram, outro para `wa.me`.

Impacto: peso de DOM e de imagens em dobro; LCP indeterminado (carrossel — o Google mede o primeiro quadro, mas o usuário vê rotação); banners sazonais vencidos ("Mês dos Pais", "Sorteio") ainda no ar em produção; chamada de banner → WhatsApp sem rastreio de campanha.

### A4. Estrutura de URL inconsistente e miscategorização

Evidências:
- O mesmo produto aparece com caminhos diferentes: `kit-diretor-estrela-e-capa-nylon-preto` é servido sob `/pecas-de-reposicao/rodizios/rodizio-nylon/...` (uma **base estrela** categorizada dentro de **rodízios/nylon**).
- Produtos de peças convivem na raiz (`/flange-aco-mecanismo-relax-cadeira-diretor-executiva`) e em subcaminhos (`/pecas-de-reposicao/kits/kit-10-unidades-...`).
- `base-estrela-cadeira-escritorio-gamer-150kg-nylon-rodizios` tem título "Estrela Giratória Cadeira Gamer Presidente + Rodizios Nylon" (sem acento no título).

Impacto: conteúdo duplicado (múltiplas URLs para o mesmo item), arquitetura de categoria não confiável, dificuldade de siloing. Correção no Módulo 1 (árvore canônica + redirects 301, seção 1.7).

### A5. Ausência de segmentação B2B/atacado

Evidência: kits de atacado ("Kit 10 unidades Pistão a Gás e Flange", "Kit 5 unid Base Flange") são produtos avulsos misturados aos unitários na mesma listagem, sem preço por unidade, sem seletor de quantidade fracionada (1/5/10/20), sem área ou comunicação de atacado. O único sinal B2B é um banner genérico de "Peças de reposição".

Impacto: perda do fluxo de compra do cliente de reposição (oficinas, revendas, facilities), que precisa comparar preço unitário regressivo por volume. Correção nos Módulos 3 (PDP de peças) e 5 (componente central).

### A6. Apresentação de preço e pagamento verbosa e inconsistente

Evidência: cards de produto renderizam "R$ 933,76 à vista com desconto Pix - Vindi ou 6x de R$ 163,82 Sem juros MasterCard - Vindi". O nome do gateway ("Vindi") e a bandeira ("MasterCard") aparecem no preço do card; em itens baratos, apenas o Pix aparece; o número de parcelas varia (3x, 5x, 6x) sem regra visível.

Impacto: poluição visual nos cards, exposição de detalhe de meio de pagamento irrelevante na grade (o cliente não escolhe bandeira para saber o preço), inconsistência de oferta. Correção no Módulo 3 (hierarquia de preço: preço cheio → Pix → parcelamento, com regras fixas).

### A7. Filtros geram navegação facetada não controlada

Evidência: a PLP `/pecas-de-reposicao` expõe "Subcategorias / Escolha / Rodízios / Pistões a Gás / Bases / Mecanismos / Braços / Assentos e Encostos / Kits" e ordenação ("Nome, Menor Preço, Maior Preço, Mais Vendido, Destaque, Lançamento") sem política de canonical/robots visível no HTML.

Impacto: combinações de filtro + ordenação produzem URLs indexáveis com conteúdo duplicado. Correção no Módulo 1, seção 1.6.

### A8. Régua de vantagens genérica

Evidência: "Frete Grátis Região Sudeste em compras acima de R$300 / Parcelamento Até 6x sem juros / Envio Rápido Entregamos para todo o Brasil / Segurança Ambiente 100% seguro".

Problema: "Envio Rápido" e "Ambiente 100% seguro" são claims sem substância; os diferenciais reais (fabricante direto, peças reforçadas 150 kg, pistão classe 3, conformidade NR-17) não aparecem na régua. Correção no Módulo 3 (nova régua de valor).

## 0.3 O que deve ser preservado

1. Integração Vindi com Pix à vista descontado e parcelamento sem juros — já funciona; manter a oferta, mudar a apresentação.
2. Nomenclatura técnica dos produtos existente ("Pistão a Gás Classe 3 ... 120kg", "Flange Relax em Aço") — boa aderência a termos de busca; manter nos títulos canônicos.
3. WhatsApp como canal de venda assistida — manter, com tracking de campanha e contexto (produto) na mensagem.
4. URLs de produto existentes com tração — migrar via 301 (mapa no Módulo 1, seção 1.7), nunca abandonar.

## 0.4 Métricas de saída (definição de pronto da migração)

| Indicador | Atual (estimado) | Meta pós-migração |
|-----------|------------------|-------------------|
| LCP (p75, mobile) | > 3,5 s (carrossel + imagens não otimizadas) | < 1,2 s |
| CLS (p75, mobile) | > 0,25 (banners e widgets sem reserva) | 0 |
| INP (p75) | > 300 ms (jQuery de tema + filtros full-reload) | < 200 ms |
| Mojibake visível | presente (banner de cookies) | zero ocorrências (verificação em CI) |
| URLs de busca indexadas | 20+ no rodapé | zero (todas `noindex` ou 301) |
| Conteúdo duplicado por filtro | sem controle | canonical + whitelist (seção 1.6) |
| Links de rodapé de baixo valor | 20 | 0 (substituídos por hub-and-spoke contextual) |
