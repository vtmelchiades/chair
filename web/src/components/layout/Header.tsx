"use client";

/**
 * Header (docs/03 §3.2): faixa de valor, logo, busca preditiva com
 * tolerância a erro, seletor de perfil B2C/B2B (radiogroup), carrinho.
 * Ilha client única do topo; menus são <details> nativos (zero JS extra).
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { searchSuggestions } from "@/lib/search";
import { formatBRL } from "@/lib/pricing";
import { chairCategories, partCategories, environments } from "@/lib/catalog";
import { guides } from "@/lib/search";

type Profile = "neutro" | "cadeiras" | "pecas";

const PROFILE_COOKIE = "chair-profile";

export function Header() {
  const { count, setOpen } = useCart();
  const [profile, setProfile] = useState<Profile>("neutro");
  const [query, setQuery] = useState("");
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Perfil persistido (cookie não-bloqueante, docs/03 §3.2.1)
  useEffect(() => {
    const saved = document.cookie.split("; ").find((c) => c.startsWith(`${PROFILE_COOKIE}=`))?.split("=")[1];
    if (saved === "cadeiras" || saved === "pecas") setProfile(saved);
  }, []);

  const applyProfile = (p: Profile) => {
    setProfile(p);
    document.cookie = `${PROFILE_COOKIE}=${p}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Debounce 200ms + useDeferredValue-equivalente via transition (INP < 200ms)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => startTransition(() => setDebouncedQuery(query)), 200);
    return () => clearTimeout(t);
  }, [query]);

  const suggestions = useMemo(
    () => searchSuggestions(debouncedQuery, profile, 4),
    [debouncedQuery, profile],
  );
  const hasSuggestions =
    suggestions.products.length + suggestions.categories.length + suggestions.guides.length > 0;

  // Fecha ao clicar fora / navegar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpenSuggestions(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => setOpenSuggestions(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      {/* Faixa de valor — slot fixo 32px, dados reais (corrige achado A8) */}
      <div className="flex h-8 items-center justify-center gap-4 overflow-hidden bg-bg-subtle px-4 text-[11px] font-medium text-ink-muted md:text-xs">
        <span className="hidden md:inline">Fábrica em Jaú/SP — direto do fabricante</span>
        <span className="hidden md:inline" aria-hidden>·</span>
        <span>Peças reforçadas até 150 kg</span>
        <span aria-hidden>·</span>
        <span className="hidden sm:inline">Pistão classe 3</span>
        <span className="hidden sm:inline" aria-hidden>·</span>
        <span>Frete grátis Sudeste acima de R$ 300</span>
      </div>

      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 md:gap-6">
        <Link href="/" aria-label="Chair Cadeiras — página inicial" className="shrink-0">
          <span className="flex items-baseline gap-1 text-xl font-black tracking-tight text-brand md:text-2xl">
            chair<span className="text-ink">cadeiras</span>
          </span>
        </Link>

        {/* Busca preditiva (combobox ARIA completo) */}
        <div ref={boxRef} className="relative min-w-0 flex-1">
          <div className="flex items-center rounded-lg border border-line bg-white focus-within:border-brand">
            <span aria-hidden className="pl-3 text-ink-muted">⌕</span>
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={openSuggestions && (hasSuggestions || query.length > 0)}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-label="Buscar produtos, peças e guias"
              placeholder={profile === "pecas" ? "Buscar peça: pistão classe 3, rodízio silicone…" : "Buscar: cadeira gamer 150 kg, pistão…"}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenSuggestions(true);
              }}
              onFocus={() => setOpenSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenSuggestions(false);
                if (e.key === "Enter" && query.trim()) {
                  window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`;
                }
              }}
              className="h-11 w-full bg-transparent px-2 text-sm outline-none placeholder:text-ink-muted/70"
            />
          </div>

          {openSuggestions && query.trim().length > 0 && (
            <div
              id="search-suggestions"
              role="listbox"
              aria-label="Sugestões de busca"
              className="absolute top-full right-0 left-0 z-40 mt-1 max-h-[420px] overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
            >
              {isPending && <p className="px-3 py-2 text-xs text-ink-muted">Buscando…</p>}
              {!isPending && !hasSuggestions && (
                <div className="px-3 py-3 text-sm">
                  <p className="font-semibold">Nenhum resultado para “{query}”.</p>
                  <p className="mt-1 text-ink-muted">
                    Não achou?{" "}
                    <a
                      className="font-semibold text-success underline"
                      href={`https://wa.me/5514996642123?text=${encodeURIComponent(`Olá! Procurei "${query}" no site e não encontrei. Podem me ajudar?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fale com a fábrica no WhatsApp
                    </a>
                  </p>
                </div>
              )}
              {suggestions.products.length > 0 && (
                <SuggestionGroup label="Produtos">
                  {suggestions.products.map((p) => (
                    <Link
                      key={p.id}
                      role="option"
                      aria-selected="false"
                      href={`/produto/${p.slug}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-bg-subtle"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block text-xs text-ink-muted">
                          {p.kind === "part" ? "Peça de reposição" : "Cadeira"}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-sm font-bold">
                        {p.kind === "part" ? formatBRL(p.baseUnitPriceCents) : formatBRL(Math.min(...p.variants.map((v) => v.priceCents)))}
                      </span>
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {suggestions.categories.length > 0 && (
                <SuggestionGroup label="Categorias">
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.href}
                      role="option"
                      aria-selected="false"
                      href={c.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
                    >
                      {c.name} →
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {suggestions.guides.length > 0 && (
                <SuggestionGroup label="Guias técnicos">
                  {suggestions.guides.map((g) => (
                    <Link
                      key={g.href}
                      role="option"
                      aria-selected="false"
                      href={g.href}
                      className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-bg-subtle"
                    >
                      {g.title}
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Abrir carrinho, ${count} itens`}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-xl hover:bg-bg-subtle"
        >
          🛒
          {count > 0 && (
            <span className="tnum absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* Seletor de perfil + navegação primária */}
      <div className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
          <div
            role="radiogroup"
            aria-label="Perfil de compra"
            className="flex shrink-0 overflow-hidden rounded-lg border border-line text-xs font-semibold md:text-sm"
          >
            <ProfileOption active={profile === "cadeiras"} onClick={() => applyProfile("cadeiras")} label="Comprar Cadeira" tone="b2c" />
            <ProfileOption active={profile === "pecas"} onClick={() => applyProfile("pecas")} label="Preciso de Peças / Atacado" tone="b2b" />
          </div>

          <nav aria-label="Navegação principal" className="-mx-1 flex gap-1 overflow-x-auto px-1 text-sm font-medium">
            <NavMenu
              label="Cadeiras"
              href="/cadeiras"
              items={chairCategories.map((c) => ({ href: `/cadeiras/${c.slug}`, label: c.name }))}
            />
            <NavMenu
              label="Peças e Atacado"
              href="/pecas"
              tone="b2b"
              items={[
                ...partCategories.map((c) => ({ href: `/pecas/${c.slug}`, label: c.name })),
                { href: "/guias/como-medir-pistao-de-cadeira", label: "Como medir o pistão (guia)" },
              ]}
            />
            <NavMenu
              label="Ambientes"
              href="/ambientes"
              items={environments.map((e) => ({ href: `/ambientes/${e.slug}`, label: e.name }))}
            />
            <NavMenu label="Guias Técnicos" href="/guias" items={guides.map((g) => ({ href: g.href, label: g.title }))} />
          </nav>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {profile === "pecas"
          ? "Navegação priorizando peças de reposição e atacado."
          : profile === "cadeiras"
            ? "Navegação priorizando cadeiras."
            : ""}
      </div>
    </header>
  );
}

function ProfileOption({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "b2c" | "b2b";
}) {
  const activeClass = tone === "b2c" ? "bg-brand text-white" : "bg-b2b text-white";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-1.5 px-3 py-2 transition-colors md:px-4 ${
        active ? activeClass : "bg-white text-ink hover:bg-bg-subtle"
      }`}
    >
      <span aria-hidden>{active ? "◉" : "○"}</span>
      {label}
    </button>
  );
}

function SuggestionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide text-ink-muted uppercase">{label}</p>
      {children}
    </div>
  );
}

function NavMenu({
  label,
  href,
  items,
  tone = "b2c",
}: {
  label: string;
  href: string;
  items: { href: string; label: string }[];
  tone?: "b2c" | "b2b";
}) {
  return (
    <details className="group relative shrink-0">
      <summary
        className={`flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg px-3 hover:bg-bg-subtle ${
          tone === "b2b" ? "text-b2b" : "text-ink"
        }`}
      >
        {label} <span aria-hidden className="text-xs">▾</span>
      </summary>
      <div className="absolute top-full left-0 z-40 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-[0_8px_24px_rgb(0_0_0/0.12)]">
        <Link
          href={href}
          className={`block rounded-lg px-3 py-2 text-sm font-bold ${tone === "b2b" ? "text-b2b hover:bg-b2b-soft" : "text-brand hover:bg-brand-soft"}`}
        >
          Ver tudo em {label} →
        </Link>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-bg-subtle">
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
