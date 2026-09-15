#!/usr/bin/env node
/**
 * Check de encoding em CI (docs/02 §2.6.4).
 * Varre arquivos-fonte buscando: U+FFFD (replacement char), sequências de
 * mojibake comum (UTF-8 lido como Latin-1) e bytes não-UTF-8.
 * Falha com arquivo + linha. Uso: node scripts/check-encoding.mjs [dir]
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = process.argv[2] ?? new URL("../src", import.meta.url).pathname;
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".jsx", ".json", ".css", ".md", ".html"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);

// Sequências de mojibake (Windows-1252/UTF-8 dupla codificação)
const MOJIBAKE_PATTERNS = [
  { re: /\uFFFD/, label: "U+FFFD (caractere de substituição)" },
  { re: /Ã[©£¢áàâäçéèêëíìîïóòôöúùûü]/, label: "mojibake Latin-1 (Ã + vogal acentuada)" },
  { re: /â€™|â€œ|â€\u009d|â€“|â€”/, label: "mojibake CP1252 (aspas/travessões)" },
  { re: /Ã‡|Ã‘/, label: "mojibake Latin-1 (Ç/Ñ)" },
  { re: /Â[°§ªº]/, label: "mojibake Latin-1 (Â + símbolo)" },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) yield full;
  }
}

let failures = 0;
let checked = 0;

for await (const file of walk(ROOT)) {
  checked++;
  const buf = await readFile(file);

  // 1. Validação estrita de UTF-8 (TextDecoder fatal)
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    console.error(`✕ ${file}: bytes não-UTF-8 (arquivo não decodifica como UTF-8 válido)`);
    failures++;
    continue;
  }

  // 2. BOM
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    console.error(`✕ ${file}: BOM UTF-8 presente (proibido — .editorconfig charset=utf-8 sem BOM)`);
    failures++;
  }

  // 3. Padrões de mojibake por linha
  const text = buf.toString("utf-8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const { re, label } of MOJIBAKE_PATTERNS) {
      if (re.test(lines[i])) {
        console.error(`✕ ${file}:${i + 1}: ${label}\n  ${lines[i].trim().slice(0, 120)}`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-encoding: ${failures} problema(s) em ${checked} arquivo(s) verificados.`);
  process.exit(1);
}
console.log(`check-encoding: OK — ${checked} arquivo(s) verificados, UTF-8 estrito, zero mojibake.`);
