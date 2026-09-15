/**
 * Breadcrumb visível — mesma fonte do JSON-LD BreadcrumbList (docs/04 §4.3).
 */
import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted md:text-sm">
          {items.map((item, i) => (
            <li key={item.name} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>›</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-brand hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={buildBreadcrumbJsonLd(items)} />
    </>
  );
}
