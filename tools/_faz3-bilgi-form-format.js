/**
 * Faz 3: Bilgi istek formu — form action/method/id sırası (hub ile aynı),
 * üst bant (div + h2 + /div) girintisi, div/h2 aynı girinti düzeltmesi.
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

function patch(html) {
  let h = html;

  /* 1) Hub sırası: action, method, id */
  h = h.replace(
    /<form\s+id="iletisim-formu"\s+action="#"\s+method="POST">/g,
    '<form action="#" method="POST" id="iletisim-formu">'
  );

  /* 2) Sıkışık bant: section satırından hemen sonra, girintisiz <div ... icerik-bilgi-form-bant ...> */
  h = h.replace(
    /^(\s*)(<section class="iletisim-form-alani"[^>]*>)\s*\n<div class="(hizmet-alanlari-baslik icerik-bilgi-form-bant[^"]*)"\s*>\s*\n<h2([^>]*)>([\s\S]*?)<\/h2>\s*\n<\/div>/gm,
    (full, indent, secOpen, divClasses, h2Attrs, h2Inner) => {
      const i1 = indent + "    ";
      const i2 = indent + "        ";
      return `${indent}${secOpen}\n${i1}<div class="${divClasses}">\n${i2}<h2${h2Attrs}>${h2Inner}</h2>\n${i1}</div>`;
    }
  );

  /* 3) div ile h2 aynı girintide (h2 bir seviye içeride olmalı); kapanış </div> hizası */
  h = h.replace(
    /(\s+)(<div class="hizmet-alanlari-baslik icerik-bilgi-form-bant[^"]*">)\s*\n\1(<h2 class="program-secim-hub-baslik"[^>]*>)([\s\S]*?)(<\/h2>)\s*\n(\s*)<\/div>/g,
    (full, ind, div, h2Open, mid, h2Close, closeDiv) => {
      const h2Indent = ind + "    ";
      return `${ind}${div}\n${h2Indent}${h2Open}${mid}${h2Close}\n${ind}</div>`;
    }
  );

  /* 4) Fazla boş satırlar (section–div, div–h2, h2–kapanış div) */
  h = h.replace(
    /(<section class="iletisim-form-alani"[^>]*>)\s*\n(?:\s*\n)+(\s+<div class="hizmet-alanlari-baslik icerik-bilgi-form-bant)/g,
    "$1\n$2"
  );
  h = h.replace(
    /(<div class="hizmet-alanlari-baslik icerik-bilgi-form-bant[^"]*">)\s*\n(?:\s*\n)+(\s+<h2\b)/g,
    "$1\n$2"
  );
  h = h.replace(
    /(<h2[^>]*>[\s\S]*?<\/h2>)\s*\n(?:\s*\n)+(\s+<\/div>)/g,
    "$1\n$2"
  );

  return h;
}

const files = walk(root).filter((p) => !p.includes("node_modules"));
let changed = 0;
for (const file of files) {
  let before = fs.readFileSync(file, "utf8");
  if (!before.includes("iletisim-form-alani") && !before.includes('id="iletisim-formu"')) continue;
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
    console.log(path.relative(root, file));
  }
}
console.error("Faz3 updated files:", changed);
