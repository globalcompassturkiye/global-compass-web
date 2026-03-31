import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const oldStrip = `                    <ul>
                        <li><a href="/hizmetlerimiz/">hizmetlerimiz</a></li>`;
const newStrip = `                    <ul>
                        <li><a href="/blog/">Blog</a></li>
                        <li><a href="/hizmetlerimiz/">hizmetlerimiz</a></li>`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === ".git" || name === "node_modules") continue;
      walk(p, out);
    } else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function patchNav(html) {
  const re = /(<nav class="navigasyon" id="nav-menu"[^>]*>)([\s\S]*?)(<\/nav>)/;
  const m = re.exec(html);
  if (!m) return html;
  let inner = m[2];
  inner = inner.replace(/\r?\n\s*<li><a href="\/blog\/" class="aktif">Blog<\/a><\/li>\s*/g, "\n");
  inner = inner.replace(/\r?\n\s*<li><a href="\/blog\/">Blog<\/a><\/li>\s*/g, "\n");
  if (inner === m[2]) return html;
  return html.slice(0, m.index) + m[1] + inner + m[3] + html.slice(m.index + m[0].length);
}

let n = 0;
for (const file of walk(root)) {
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  if (c.includes("yardimci-menu") && !/yardimci-menu[\s\S]{0,600}<ul>\s*<li><a href="\/blog\/">Blog<\/a><\/li>/.test(c)) {
    if (c.includes(oldStrip)) c = c.replace(oldStrip, newStrip);
    else if (c.includes(oldStripAktif)) c = c.replace(oldStripAktif, newStripAktif);
    else if (c.includes(oldStripRu)) c = c.replace(oldStripRu, newStripRu);
  }
  c = patchNav(c);
  if (c !== orig) {
    fs.writeFileSync(file, c, "utf8");
    n++;
  }
}
console.log("patched", n, "files");
