"use client";

/**
 * Carrinho slide-over (docs/03 §3.7.1). Radix Dialog: foco gerenciado,
 * Esc fecha, retorno de foco ao elemento de origem. Confirmação de adição
 * via aria-live (WCAG 4.1.3).
 */
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useCart, freeShippingProgress } from "./CartProvider";
import { formatBRL } from "@/lib/pricing";
import { PIX_DISCOUNT_RATE } from "@/lib/pricing";
import { buttonClass } from "@/components/ui/primitives";

export function CartDrawer() {
  const { items, open, setOpen, setQty, removeItem, subtotalCents, count, lastAddedName } = useCart();
  const shipping = freeShippingProgress(subtotalCents);
  const pixTotal = Math.round(subtotalCents * (1 - PIX_DISCOUNT_RATE));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
        >
          <Dialog.Title className="flex items-center justify-between border-b border-line px-5 py-4 text-lg font-bold">
            Seu carrinho
            <span className="tnum text-sm font-medium text-ink-muted">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          </Dialog.Title>
          <Dialog.Close
            aria-label="Fechar carrinho"
            className="absolute top-4 right-14 flex h-11 w-11 items-center justify-center rounded-lg text-ink-muted hover:bg-bg-subtle"
          >
            ✕
          </Dialog.Close>

          {/* Confirmação de adição — status message (WCAG 4.1.3) */}
          <div aria-live="polite" className="sr-only">
            {open && lastAddedName ? `Item adicionado: ${lastAddedName}. Carrinho com ${count} itens.` : ""}
          </div>

          {/* Barra de progresso de frete — slot fixo 40px (CLS zero) */}
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-bg-subtle px-5 text-xs font-medium text-ink-muted">
            <span aria-hidden>{shipping.eligible ? "✓" : "🚚"}</span>
            {shipping.label}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-muted">
                Carrinho vazio.{" "}
                <Dialog.Close asChild>
                  <Link href="/pecas" className="font-semibold text-brand underline">
                    Ver peças de reposição
                  </Link>
                </Dialog.Close>
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3 rounded-lg border border-line p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-bg-subtle text-2xl" aria-hidden>
                      🪑
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-ink-muted">{item.tierLabel}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-line">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center text-lg font-bold text-brand hover:bg-brand-soft"
                            onClick={() => setQty(item.key, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="tnum w-8 text-center text-sm font-semibold" aria-label="Quantidade">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center text-lg font-bold text-brand hover:bg-brand-soft"
                            onClick={() => setQty(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="tnum text-sm font-bold">{formatBRL(item.totalCents)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="mt-1 text-xs text-danger underline hover:no-underline"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="shrink-0 border-t border-line px-5 py-4">
              <dl className="tnum space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-bold">{formatBRL(subtotalCents)}</dd>
                </div>
                <div className="flex justify-between text-success">
                  <dt>No Pix à vista (−{Math.round(PIX_DISCOUNT_RATE * 100)}%)</dt>
                  <dd className="font-semibold">{formatBRL(pixTotal)}</dd>
                </div>
              </dl>
              <Dialog.Close asChild>
                <Link href="/checkout" className={`${buttonClass("primary", "lg")} mt-3 w-full`}>
                  Finalizar compra
                </Link>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
