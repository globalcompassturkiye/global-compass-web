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
const bad = [];
for (const f of walk(root)) {
  if (f.includes("node_modules")) continue;
  const h = fs.readFileSync(f, "utf8");
  if (!h.includes("program-secim-hub-baslik")) continue;
  let m;
  const r = new RegExp(re.source, "g");
  while ((m = r.exec(h))) {
    if (!String(m[1]).includes("icerik-bilgi-form-bant")) {
      bad.push(path.relative(root, f));
    }
  }
}
console.log("Unpatched form-band div+h2 pairs:", bad.length);
if (bad.length) console.log([...new Set(bad)].join("\n"));
