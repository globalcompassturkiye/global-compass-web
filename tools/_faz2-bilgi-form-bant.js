/**
 * Faz 2: Bilgi istek formu üst bant sarmalayıcısına `icerik-bilgi-form-bant` ekler
 * (yalnızca hemen ardından iki satırlı h2 gelen div'ler: h2 + .vurgu-satir).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith(".")) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (name.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const re =
  /<div class="hizmet-alanlari-baslik([^"]*)"\s*[^>]*>[\s\n]*<h2\b/g;

function patch(html) {
  return html.replace(re, (full, cls) => {
    if (String(cls).includes("icerik-bilgi-form-bant")) return full;
    return full.replace(
      `class="hizmet-alanlari-baslik${cls}"`,
      `class="hizmet-alanlari-baslik icerik-bilgi-form-bant${cls}"`
    );
  });
}

const files = walk(root).filter((p) => {
  const rel = path.relative(root, p).replace(/\\/g, "/");
  if (rel.startsWith("node_modules/")) return false;
  return true;
});

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  if (!before.includes("program-secim-hub-baslik")) continue;
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
    console.log(path.relative(root, file));
  }
}
console.error("Updated files:", changed);
