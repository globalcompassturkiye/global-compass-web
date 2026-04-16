/**
 * h2'den program-secim-hub-baslik kaldır; ilk satır span'den ust-satir kaldır.
 * İki satırlı başlık: h2:has(> .vurgu-satir) + CSS ile stil.
 */
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
const reH2 = /<h2\s+class="program-secim-hub-baslik"(\s|>)/gi;
const reSpan = /<span class="ust-satir">/gi;

let files = 0;
for (const f of walk(root)) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(reH2, '<h2$1');
  s = s.replace(reSpan, '<span>');
  if (s !== before) {
    fs.writeFileSync(f, s, 'utf8');
    files++;
  }
}
console.log('updated html files:', files);
