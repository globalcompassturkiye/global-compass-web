/**
 * Phase 1: class tokens in css/style.css vs html/js/other css
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STYLE = join(ROOT, "css", "style.css");

function readText(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function walkFiles(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      walkFiles(p, acc);
    } else {
      acc.push(p);
    }
  }
  return acc;
}

const styleText = readText(STYLE);
const classRe = /\.([a-zA-Z_][\w-]*)/g;
const classes = new Set();
let m;
while ((m = classRe.exec(styleText)) !== null) {
  classes.add(m[1]);
}

let corpus = "";
for (const p of walkFiles(ROOT)) {
  if (!/\.(html|js|json)$/i.test(p)) continue;
  corpus += readText(p);
}

const cssDir = join(ROOT, "css");
for (const name of readdirSync(cssDir)) {
  if (!name.endsWith(".css") || name === "style.css") continue;
  corpus += readText(join(cssDir, name));
}

function usedAsToken(name, text) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[\\s"'\\\`=])${esc}(?:$|[\\s"'\\\`=])`);
  return re.test(text);
}

const unused = [];
const maybe = [];
for (const c of [...classes].sort()) {
  if (usedAsToken(c, corpus)) continue;
  if (corpus.includes(c)) maybe.push(c);
  else unused.push(c);
}

const outDir = join(ROOT, "docs");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "style-css-unused-class-candidates-phase1.txt");
const lines = [
  `style.css unique class tokens: ${classes.size}`,
  `not found as token in html/js/other-css: ${unused.length}`,
  `substring exists but token regex failed (manual check): ${maybe.length}`,
  "",
  "=== UNUSED CANDIDATES (verify before delete) ===",
  ...unused,
  "",
  "=== NEED MANUAL CHECK ===",
  ...maybe,
];
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
console.log(`classes=${classes.size} unused=${unused.length} maybe=${maybe.length}`);
