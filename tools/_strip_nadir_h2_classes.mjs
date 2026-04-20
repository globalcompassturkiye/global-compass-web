/**
 * Remove known decorative classes from <h2> opening tags (Faz: nadir h2).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const REMOVE = new Set([
  "immerse-alt-baslik",
  "kings-hero-alt-baslik",
  "kings-oxford-kurs-baslik",
  "futbol-alt-baslik",
  "alpadia-alt-baslik",
  "investin-alt-baslik",
  "sportech-academy-alt-baslik",
  "ora-cam-hero-alt-baslik",
  "kings-la-baslik-zemin-lacivert",
  "kings-la-baslik-zemin-kirmizi",
  "kings-la-baslik-zemin-turkuaz",
  "kings-la-baslik-hollywood",
  "kings-la-dahil-baslik",
  "kings-bos-konaklama-sr-only",
  "kings-ny-konaklama-sr-only",
  "ana-tab-cerceve-ust-bant-baslik",
  "ana-sayfa-ortak-h2",
  "ana-sayfa-blog-ozeti-baslik",
  "isvicre-strateji-baslik",
  "isvicre-danisman-paneli-baslik",
]);

function processH2Open(attrs) {
  let out = attrs;
  const dq = out.match(/\sclass\s*=\s*"([^"]*)"/i);
  const sq = !dq && out.match(/\sclass\s*=\s*'([^']*)'/i);
  const m = dq || sq;
  if (!m) return out;
  const quote = dq ? '"' : "'";
  const parts = m[1].split(/\s+/).filter(Boolean).filter((c) => !REMOVE.has(c));
  const full = m[0];
  if (parts.length === 0) {
    out = out.replace(full, "");
  } else {
    out = out.replace(full, ` class=${quote}${parts.join(" ")}${quote}`);
  }
  return out.replace(/\s{2,}/g, " ").replace(/^\s+/, " ").trimEnd();
}

function processFile(fp) {
  let s = fs.readFileSync(fp, "utf8");
  const orig = s;
  s = s.replace(/<h2\b([^>]*)>/gi, (_, attrs) => {
    const na = processH2Open(attrs);
    return na.trim() ? `<h2 ${na.trim()}>` : "<h2>";
  });
  s = s.replace(/<h2\s+>/g, "<h2>");
  if (s !== orig) fs.writeFileSync(fp, s, "utf8");
  return s !== orig;
}

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "node_modules") continue;
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp, acc);
    else if (name.endsWith(".html")) acc.push(fp);
  }
}

const files = [];
walk(root, files);
let n = 0;
for (const fp of files) {
  if (processFile(fp)) {
    n++;
    console.log(path.relative(root, fp));
  }
}
console.log("updated", n);
