import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/facets";

/**
 * Layout raiz (docs/02 §2.6.2): lang pt-BR, charset UTF-8 (Next injeta
 * <meta charset="utf-8"> como primeiro elemento do head; o header HTTP
 * Content-Type: text/html; charset=utf-8 vem do next.config.ts).
 * Fonte: Inter Variable self-hosted via @fontsource (zero request externo,
 * font-display: swap — CLS, docs/02 §2.3.3).
 */

/**
 * Fonte Inter Variable SELF-HOSTED (docs/02 §2.3.3): zero request externo,
 * font-display: swap, subset latin. Em produção no host com acesso à rede,
 * pode-se trocar por next/font/google (Inter + adjustFontFallback) para
 * métricas de fallback automáticas; o contrato de CLS é o mesmo.
 */
import "@fontsource-variable/inter";
const fontClass = "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chair Cadeiras: Cadeiras e Peças Direto da Fábrica em Jaú/SP",
    template: "%s | Chair Cadeiras",
  },
  description:
    "Fabricante de cadeiras ergonômicas NR-17, gamer até 150 kg e peças de reposição: pistões classe 3, rodízios PU, bases estrela. Varejo e atacado para todo o Brasil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Chair Cadeiras",
    title: "Chair Cadeiras: Cadeiras e Peças Direto da Fábrica",
    description:
      "Cadeiras ergonômicas NR-17, gamer 120/150 kg e peças de reposição com preço de atacado. Fábrica em Jaú/SP.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={fontClass}>
      <head>
        <meta charSet="utf-8" />
        {/* Preconnect do CDN de imagens (docs/02 §2.3.2) */}
        <link rel="preconnect" href="https://images.chaircadeiras.com.br" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.chaircadeiras.com.br" />
      </head>
      <body className="min-h-screen antialiased">
        {/* Skip links (WCAG 2.4.1) */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Ir para o conteúdo
        </a>
        <CartProvider>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
        </CartProvider>
        <JsonLd data={buildOrganizationJsonLd()} />
      </body>
    </html>
  );
}
