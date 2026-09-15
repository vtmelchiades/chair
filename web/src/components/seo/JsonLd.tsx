/**
 * Injeção server-side de JSON-LD (docs/04 §4.6).
 * Serialização com escape de <, >, & para impedir quebra de HTML/XSS
 * por conteúdo de catálogo.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
