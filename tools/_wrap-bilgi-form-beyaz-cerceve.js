/**
 * Bilgi istek formunda: h2 dışında, p+form (+ varsa aynı bloktaki script) beyaz çerçeve div içinde.
 * Tek seferlik; zaten .iletisim-form-beyaz-cerceve varsa atlanır.
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

function extractIletisimSectionBlock(html) {
  const lower = html.toLowerCase();
  const re = /<section\s+[^>]*class="[^"]*iletisim-form-alani[^"]*"[^>]*>/i;
  const m = html.match(re);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  const openEnd = html.indexOf('>', start) + 1;
  let depth = 1;
  let i = openEnd;
  while (i < html.length && depth > 0) {
    const nextOpen = lower.indexOf('<section', i);
    const nextClose = lower.indexOf('</section>', i);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 8;
    } else {
      depth--;
      if (depth === 0) {
        return { start, openEnd, innerEnd: nextClose, afterSection: nextClose + 10 };
      }
      i = nextClose + 10;
    }
  }
  return null;
}

function wrapInner(inner) {
  if (inner.includes('iletisim-form-beyaz-cerceve')) return inner;
  const key = 'icerik-bilgi-form-bant';
  const idx = inner.indexOf(key);
  if (idx === -1) return inner;
  const closeDiv = inner.indexOf('</div>', idx);
  if (closeDiv === -1) return inner;
  const afterClose = closeDiv + '</div>'.length;
  const rest = inner.slice(afterClose);
  const indMatch = rest.match(/^\n(\s*)/);
  const ind = indMatch ? indMatch[1] : '            ';
  const content = rest.trim();
  return (
    inner.slice(0, afterClose) +
    `\n${ind}<div class="iletisim-form-beyaz-cerceve">\n` +
    content +
    `\n${ind}</div>\n`
  );
}

const root = path.join(__dirname, '..');
const files = walk(root);
let n = 0;
for (const f of files) {
  let s;
  try {
    s = fs.readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  if (!s.includes('iletisim-form-alani')) continue;
  const block = extractIletisimSectionBlock(s);
  if (!block) continue;
  const inner = s.slice(block.openEnd, block.innerEnd);
  const newInner = wrapInner(inner);
  if (newInner === inner) continue;
  const out =
    s.slice(0, block.openEnd) + newInner + s.slice(block.innerEnd);
  fs.writeFileSync(f, out, 'utf8');
  n++;
  console.log(path.relative(root, f).replace(/\\/g, '/'));
}
console.log('wrapped', n);
