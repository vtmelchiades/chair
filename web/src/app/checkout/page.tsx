/**
 * Checkout (docs/03 §3.7.2): 1 coluna, zero banners promocionais,
 * Pix padrão com destaque, 6x sem juros, resumo sticky.
 * Em produção: iframe Vindi em container com altura contratada por
 * breakpoint (docs/02 §2.4). noindex.
 */
import type { Metadata } from "next";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
