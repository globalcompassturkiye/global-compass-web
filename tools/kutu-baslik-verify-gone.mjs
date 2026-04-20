/**
 * kutu-baslik sınıfı projede kullanılmamalı (h2/h3 bağlam seçicilere taşındı).
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

const bad = [];
for (const f of walk(root)) {
  const s = fs.readFileSync(f, "utf8");
  if (/\bkutu-baslik\b/.test(s)) bad.push(path.relative(root, f).replace(/\\/g, "/"));
}

if (bad.length === 0) {
  console.log("kutu-baslik-verify: OK (no kutu-baslik in HTML)");
  process.exit(0);
}
console.error("kutu-baslik-verify: FAIL\n", bad.join("\n"));
process.exit(1);
