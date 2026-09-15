"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatBRL, installmentCents, maxInterestFreeInstallments, pixTotalCents } from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY } from "@/components/product/freight-shared";

type PaymentMethod = "pix" | "cartao" | "boleto" | "faturado";

export function CheckoutView() {
  const { items, subtotalCents } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState(6);
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");

  const freteCents = useMemo(
    () => (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY ? 0 : 3990),
    [subtotalCents],
  );
  const discountCents = method === "pix" ? subtotalCents - pixTotalCents(subtotalCents) : 0;
  const totalCents = subtotalCents + freteCents - discountCents;
  const nMax = maxInterestFreeInstallments(totalCents);
  const effectiveInstallments = Math.min(installments, nMax);
  const savings = subtotalCents + freteCents - totalCents;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight md:text-2xl">
          Checkout seguro · <span className="text-brand">chair</span>cadeiras
        </h1>
        {/* Selos uma única vez (docs/03 §3.7.2, regra 5) */}
        <p className="text-xs text-ink-muted">🔒 Ambiente seguro · Vindi · CNPJ 00.000.000/0001-00</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Seu carrinho está vazio.</p>
          <Link href="/pecas" className="mt-2 inline-block text-sm font-bold text-b2b underline">
            Ver peças de reposição →
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* 1 IDENTIFICAÇÃO */}
            <section aria-labelledby="step1">
              <h2 id="step1" className="mb-3 text-sm font-black tracking-wide text-ink-muted uppercase">
                1 · Identificação
              </h2>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                E-mail (compra sem cadastro)
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                className="h-11 w-full max-w-md rounded-lg border border-line px-3 text-sm focus:border-brand"
              />
            </section>

            {/* 2 ENTREGA */}
            <section aria-labelledby="step2">
              <h2 id="step2" className="mb-3 text-sm font-black tracking-wide text-ink-muted uppercase">
                2 · Entrega
              </h2>
              <label htmlFor="cep" className="mb-1 block text-sm font-semibold">
                CEP de entrega
              </label>
              <input
                id="cep"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={cep}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
                }}
                placeholder="00000-000"
                className="tnum h-11 w-40 rounded-lg border border-line px-3 text-sm focus:border-brand"
              />
              <p className="mt-2 text-xs text-ink-muted">
                Despacho da fábrica (Jaú/SP) em 1 dia útil · Sudeste 3–6 dias · Sul 4–7 · NE 6–10 · N/CO 7–12.{" "}
                {subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY
                  ? "Frete grátis Sudeste aplicado."
                  : `Frete grátis Sudeste acima de ${formatBRL(FREE_SHIPPING_THRESHOLD_CENTS_DISPLAY)}.`}
              </p>
            </section>

            {/* 3 PAGAMENTO — slot do widget Vindi com altura contratada (CLS zero) */}
            <section aria-labelledby="step3">
              <h2 id="step3" className="mb-3 text-sm font-black tracking-wide text-ink-muted uppercase">
                3 · Pagamento
              </h2>
              <div className="min-h-[320px] rounded-xl border border-line bg-white p-4" role="radiogroup" aria-label="Forma de pagamento">
                <PaymentOption
                  id="pix"
                  checked={method === "pix"}
                  onChange={() => setMethod("pix")}
                  title="Pix à vista"
                  badge="−5% · aprovação imediata"
                  badgeTone="success"
                  detail={`${formatBRL(pixTotalCents(subtotalCents) + freteCents)} — QR Code gerado na confirmação`}
                />
                <PaymentOption
                  id="cartao"
                  checked={method === "cartao"}
                  onChange={() => setMethod("cartao")}
                  title="Cartão de crédito"
                  detail={`Até ${nMax}x sem juros`}
                >
                  <label htmlFor="installments" className="mt-2 block text-xs font-semibold text-ink-muted">
                    Parcelas
                  </label>
                  <select
                    id="installments"
                    value={effectiveInstallments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="tnum mt-1 h-11 rounded-lg border border-line bg-white px-3 text-sm focus:border-brand"
                    disabled={method !== "cartao"}
                  >
                    {Array.from({ length: nMax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(installmentCents(totalCents, n))} sem juros
                      </option>
                    ))}
                  </select>
                  {method === "cartao" && (
                    <p className="mt-2 text-xs text-ink-muted">
                      7x a 12x com juros exibidos com CET antes da confirmação (regra Vindi).
                    </p>
                  )}
                </PaymentOption>
                <PaymentOption
                  id="boleto"
                  checked={method === "boleto"}
                  onChange={() => setMethod("boleto")}
                  title="Boleto bancário"
                  detail="Compensação em 1–2 dias úteis"
                />
                <PaymentOption
                  id="faturado"
                  checked={method === "faturado"}
                  onChange={() => setMethod("faturado")}
                  title="Faturado para CNPJ (B2B)"
                  detail={
                    subtotalCents >= 100000
                      ? "Disponível para este pedido — 28 dias"
                      : `Disponível a partir de ${formatBRL(100000)} em produtos`
                  }
                  disabled={subtotalCents < 100000}
                />
                <p className="mt-3 border-t border-line pt-3 text-[11px] text-ink-muted">
                  Widget de pagamento Vindi (placeholder do protótipo — em produção, iframe em container com
                  altura contratada por breakpoint).
                </p>
              </div>
            </section>
          </div>

          {/* RESUMO sticky */}
          <aside aria-label="Resumo do pedido" className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-xl border border-line bg-bg-subtle p-4">
              <h2 className="mb-3 text-sm font-black tracking-wide uppercase">Resumo</h2>
              <ul className="mb-3 space-y-2">
                {items.map((item) => (
                  <li key={item.key} className="flex justify-between gap-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.name}</span>
                      <span className="block text-xs text-ink-muted">
                        {item.tierLabel} · qtd {item.quantity}
                      </span>
                    </span>
                    <span className="tnum shrink-0 font-semibold">{formatBRL(item.totalCents)}</span>
                  </li>
                ))}
              </ul>
              <dl className="tnum space-y-1 border-t border-line pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd>{formatBRL(subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Frete</dt>
                  <dd>{freteCents === 0 ? "Grátis" : formatBRL(freteCents)}</dd>
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Desconto Pix</dt>
                    <dd className="font-semibold">−{formatBRL(discountCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2 text-base font-black">
                  <dt>Total</dt>
                  <dd>{formatBRL(totalCents)}</dd>
                </div>
              </dl>
              {savings > 0 && (
                <p className="tnum mt-2 rounded-lg bg-success-soft px-3 py-2 text-center text-xs font-bold text-success-ink">
                  Você economiza {formatBRL(savings)} no Pix
                </p>
              )}
              <button
                type="button"
                className="mt-3 min-h-12 w-full rounded-xl bg-brand text-base font-black text-white hover:bg-brand/90"
                aria-label={`Pagar ${formatBRL(totalCents)} com ${method === "pix" ? "Pix" : method === "cartao" ? `cartão em ${effectiveInstallments}x` : method === "boleto" ? "boleto" : "faturamento"}`}
              >
                PAGAR {formatBRL(totalCents)}
              </button>
              <p className="mt-2 text-center text-[11px] text-ink-muted">
                Garantia 12 meses · devolução gratuita em 7 dias · fábrica em Jaú/SP
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function PaymentOption({
  id,
  checked,
  onChange,
  title,
  badge,
  badgeTone,
  detail,
  disabled,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  badge?: string;
  badgeTone?: "success";
  detail: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label
      htmlFor={`pay-${id}`}
      className={`mb-2 flex min-h-14 flex-col justify-center rounded-xl border-2 p-3 ${
        checked ? "border-brand bg-brand-soft/40" : "border-line bg-white hover:border-brand/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span className="flex flex-wrap items-center gap-2">
        <input
          id={`pay-${id}`}
          type="radio"
          name="payment"
          role="radio"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="h-4 w-4 accent-[#0B3C8C]"
        />
        <span className="text-sm font-bold">{title}</span>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              badgeTone === "success" ? "bg-success-soft text-success-ink" : "bg-bg-subtle text-ink-muted"
            }`}
          >
            {badge}
          </span>
        )}
        <span className="tnum w-full text-xs text-ink-muted sm:w-auto">{detail}</span>
      </span>
      {checked && children}
    </label>
  );
}
