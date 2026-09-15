/**
 * Card de produto (docs/03 §3.1.4 — hierarquia de preço fixa).
 * Server Component. Nunca cita gateway/bandeira (corrige achado A6).
 * Peças exibem preço unitário + gancho de kit (docs/03 §3.4).
 */
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatBRL, maxInterestFreeInstallments, installmentCents, pixTotalCents } from "@/lib/pricing";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/primitives";

export function ProductCard({ product }: { product: Product }) {
  const href = `/produto/${product.slug}`;

  if (product.kind === "chair") {
    const cheapest = [...product.variants].sort((a, b) => a.priceCents - b.priceCents)[0];
    const compare = product.variants.find((v) => v.compareAtCents)?.compareAtCents;
    const n = maxInterestFreeInstallments(cheapest.priceCents);
    return (
      <CardShell href={href}>
        <ProductImage name={product.shortName} category={product.category} ratio="card" />
        <CardBody>
          <Badges>
            {product.nr17 && <Badge tone="brand">NR-17 ✓</Badge>}
            <Badge tone="neutral">{product.maxLoadKg} kg</Badge>
            <Badge tone="neutral">Pistão classe {product.gasClass}</Badge>
          </Badges>
          <ProductName>{product.name}</ProductName>
          <PriceBlock
            compareAtCents={compare}
            priceCents={cheapest.priceCents}
            installments={n > 1 ? { n, valueCents: installmentCents(cheapest.priceCents, n) } : undefined}
          />
        </CardBody>
      </CardShell>
    );
  }

  const unit = product.baseUnitPriceCents;
  const kit10 = product.tiers.find((t) => t.id === "kit10");
  return (
    <CardShell href={href}>
      <ProductImage name={product.shortName} category={product.category} ratio="card" />
      <CardBody>
        <Badges>
          {product.specs.gasClass && <Badge tone={product.specs.gasClass === 3 ? "brand" : "neutral"}>Classe {product.specs.gasClass}</Badge>}
          {product.specs.material && <Badge tone="neutral">{product.specs.material.toUpperCase()}</Badge>}
          {product.specs.pinDiameterMm && <Badge tone="neutral">Pino {product.specs.pinDiameterMm} mm</Badge>}
          <Badge tone="neutral">{product.specs.maxLoadKg} kg</Badge>
        </Badges>
        <ProductName>{product.name}</ProductName>
        <p className="tnum text-sm text-b2b">
          <strong>{formatBRL(unit)}</strong> /un · kit 10x {kit10 ? formatBRL(kit10.unitPriceCents) : "—"}
          /un
        </p>
        <p className="text-xs text-ink-muted">No Pix: {formatBRL(pixTotalCents(unit))}</p>
      </CardBody>
    </CardShell>
  );
}

function CardShell({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-shadow hover:shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
    >
      {children}
    </Link>
  );
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col gap-2 p-4">{children}</div>;
}

function Badges({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function ProductName({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold group-hover:text-brand">{children}</h3>
  );
}

/**
 * Hierarquia de preço (docs/03 §3.1.4): cheio → Pix → parcelamento → riscado.
 * Bloco com min-height reservado (3 linhas) — CLS zero.
 */
export function PriceBlock({
  priceCents,
  compareAtCents,
  installments,
  size = "md",
}: {
  priceCents: number;
  compareAtCents?: number;
  installments?: { n: number; valueCents: number };
  size?: "md" | "lg";
}) {
  return (
    <div className="mt-auto flex min-h-16 flex-col justify-end gap-0.5">
      {compareAtCents && compareAtCents > priceCents && (
        <p className="tnum text-xs text-ink-muted">
          de <s>{formatBRL(compareAtCents)}</s>
        </p>
      )}
      <p className={`tnum font-bold ${size === "lg" ? "text-2xl md:text-3xl" : "text-lg"}`}>
        {formatBRL(priceCents)}
      </p>
      <p className="tnum text-sm font-semibold text-success">
        {formatBRL(pixTotalCents(priceCents))} no Pix (5% off)
      </p>
      {installments && (
        <p className="tnum text-xs text-ink-muted">
          ou {installments.n}x de {formatBRL(installments.valueCents)} sem juros
        </p>
      )}
    </div>
  );
}
