import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.vindi.com.br",
  "frame-src 'self' https://checkout.vindi.com.br",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Política de LCP: AVIF com fallback WebP; ver docs/02, seção 2.3
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.tcdn.com.br" },
      { protocol: "https", hostname: "chaircadeiras.com.br" },
    ],
  },
  async headers() {
    return [
      {
        // Charset estrito em nível de cabeçalho HTTP (módulo 2, seção 2.6)
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: CSP },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Cache imutável para assets estáticos versionados
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // HTML sempre revalidado (catálogo com preços voláteis)
        source: "/:path((?!_next/static).*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
  async redirects() {
    // Migração: URLs legadas da Tray -> estrutura canônica nova (docs/01, seção 1.7)
    return [
      { source: "/cadeiras/cadeiras-gamer", destination: "/cadeiras/gamer", permanent: true },
      { source: "/cadeiras/cadeira-presidente", destination: "/cadeiras/presidente", permanent: true },
      { source: "/cadeiras/cadeiras-ergonomicas", destination: "/cadeiras/ergonomicas-nr-17", permanent: true },
      { source: "/cadeiras/cadeiras-de-escritorio", destination: "/cadeiras", permanent: true },
      { source: "/pecas-de-reposicao", destination: "/pecas", permanent: true },
      { source: "/pecas-de-reposicao/rodizios/:path*", destination: "/pecas/rodizios/:path*", permanent: true },
      { source: "/pecas-de-reposicao/kits/:path*", destination: "/pecas/kits-atacado/:path*", permanent: true },
      { source: "/ambientes/home-office", destination: "/ambientes/home-office", permanent: false },
    ];
  },
};

export default nextConfig;
