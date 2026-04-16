/**
 * h2 içindeki span.vurgu-renk → span.vurgu-satir (yalnızca <h2>...</h2> blokları)
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
let n = 0;
for (const f of walk(root)) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi, (block) =>
    block.replace(/class="vurgu-renk"/g, 'class="vurgu-satir"')
  );
  if (s !== before) {
    fs.writeFileSync(f, s, 'utf8');
    n++;
  }
}
console.log('html files updated (h2 vurgu-renk→vurgu-satir):', n);
