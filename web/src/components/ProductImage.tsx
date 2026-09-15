/**
 * Placeholder de imagem CLS-safe do protótipo (docs/02 §2.4).
 * Caixa com aspect-ratio fixo reservado no CSS crítico — shift zero.
 * Em produção: next/image com priority (hero/1ª imagem PDP), AVIF/WebP,
 * sizes explícito, LQIP blur (docs/02 §2.3.2).
 */
const categoryIcons: Record<string, string> = {
  gamer: "🎮",
  presidente: "👔",
  diretor: "💼",
  executiva: "🗂️",
  "ergonomicas-nr-17": "🧍",
  mochos: "🩺",
  "pistoes-a-gas": "⬍",
  rodizios: "◍",
  "bases-estrela": "✳",
  mecanismos: "⚙",
  bracos: "〣",
  "assentos-e-encostos": "▤",
  "buchas-e-acabamentos": "◎",
  "kits-atacado": "📦",
};

export function ProductImage({
  name,
  category,
  ratio = "square",
  priority = false,
  className = "",
}: {
  name: string;
  category: string;
  /** square = PDP (1:1), card = PLP (4:5) — dims/02 §2.3.2 */
  ratio?: "square" | "card" | "hero";
  priority?: boolean;
  className?: string;
}) {
  const aspect = ratio === "square" ? "aspect-square" : ratio === "card" ? "aspect-[4/5]" : "aspect-[16/5]";
  return (
    <div
      role="img"
      aria-label={`Foto do produto ${name}`}
      data-priority={priority ? "high" : undefined}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-bg-subtle ${aspect} ${className}`}
    >
      <span aria-hidden className="text-5xl opacity-60 md:text-6xl">
        {categoryIcons[category] ?? "🪑"}
      </span>
      <span className="absolute bottom-2 left-2 right-2 truncate text-[11px] font-medium text-ink-muted">
        {name}
      </span>
    </div>
  );
}
