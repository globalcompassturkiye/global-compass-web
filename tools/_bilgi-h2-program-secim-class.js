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
let n = 0;
for (const f of walk(root)) {
  let s = fs.readFileSync(f, 'utf8');
  if (!s.includes('class="bilgi-form-bant-baslik"')) continue;
  const out = s.replace(/class="bilgi-form-bant-baslik"/g, 'class="program-secim-hub-baslik"');
  fs.writeFileSync(f, out, 'utf8');
  n++;
}
console.log('html files', n);
