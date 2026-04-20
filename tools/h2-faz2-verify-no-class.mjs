/**
 * Faz 2 doğrulama: hiçbir HTML'de <h2 … class="…"> olmamalı.
 * Başarı: çıkış 0. İhlal: stderr + çıkış 1.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const re = /<h2\b([^>]*)>/gi;
const violations = [];
for (const f of walk(root)) {
  const s = fs.readFileSync(f, "utf8");
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(s)) !== null) {
    const attrs = m[1];
    if (!/\bclass\s*=\s*["'][^"']*["']/i.test(attrs)) continue;
    const rel = path.relative(root, f).replace(/\\/g, "/");
    const cm = attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i);
    violations.push({ file: rel, class: (cm && cm[1]) || "" });
  }
}

if (violations.length === 0) {
  console.log("h2-faz2-verify: OK (no h2 with class)");
  process.exit(0);
}

console.error("h2-faz2-verify: FAIL — h2 must not use class attribute:\n");
for (const v of violations) console.error(`  ${v.file}  class="${v.class}"`);
process.exit(1);
