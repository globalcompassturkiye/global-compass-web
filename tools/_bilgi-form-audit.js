const fs = require('fs');
const path = require('path');

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') walk(p, acc);
    else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const root = path.join(__dirname, '..');
const files = walk(root);

const withWrap = [];
const noWrap = [];
const multi = [];
const anomalies = [];

for (const f of files) {
  let s;
  try {
    s = fs.readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  const reSection = /class="iletisim-form-alani"/g;
  const matches = [...s.matchAll(reSection)];
  if (matches.length === 0) continue;
  if (matches.length > 1) {
    multi.push({ file: path.relative(root, f).replace(/\\/g, '/'), count: matches.length });
    continue;
  }

  const idx = s.indexOf('class="iletisim-form-alani"');
  const afterOpen = s.indexOf('>', idx) + 1;
  const head = s.slice(afterOpen, afterOpen + 600);
  const hasWrap =
    head.includes('class="hizmet-alanlari-baslik icerik-bilgi-form-bant"') ||
    head.includes("class='hizmet-alanlari-baslik icerik-bilgi-form-bant'");

  const rel = path.relative(root, f).replace(/\\/g, '/');
  if (hasWrap) withWrap.push(rel);
  else {
    noWrap.push(rel);
    // note oddities
    if (!/\bvurgu-satir\b/.test(head)) anomalies.push({ file: rel, note: 'no vurgu-satir in first 600' });
  }
}

console.log(JSON.stringify({ withWrap, noWrap, multi, anomalies }, null, 2));
