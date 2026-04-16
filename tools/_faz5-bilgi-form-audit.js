/**
 * Faz 5: Bilgi istek formu bölümü tutarlılık denetimi.
 * Çıktı: konsol özeti + tools/_faz5-bilgi-form-audit-report.json (UTF-8, BOM yok)
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

function extractFirstIletisimSection(html) {
  const openRe =
    /<section\s+[^>]*class="[^"]*iletisim-form-alani[^"]*"[^>]*>/i;
  const m = html.match(openRe);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  const openEnd = html.indexOf('>', start) + 1;
  const openTag = html.slice(start, openEnd);
  let depth = 1;
  let i = openEnd;
  const lower = html.toLowerCase();
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
        return {
          openTag,
          inner: html.slice(openEnd, nextClose),
        };
      }
      i = nextClose + 10;
    }
  }
  return null;
}

function countOccurrences(hay, needle) {
  let c = 0;
  let i = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) {
    c++;
    i += needle.length;
  }
  return c;
}

function auditFile(absPath, root) {
  const rel = path.relative(root, absPath).replace(/\\/g, '/');
  let s;
  try {
    s = fs.readFileSync(absPath, 'utf8');
  } catch {
    return { rel, skip: true };
  }

  const sectionMatches = [...s.matchAll(/class="[^"]*iletisim-form-alani[^"]*"/g)];
  if (sectionMatches.length === 0) return null;

  const issues = [];
  if (sectionMatches.length > 1) {
    issues.push({ code: 'MULTIPLE_ILETISIM_SECTIONS', detail: sectionMatches.length });
  }

  const block = extractFirstIletisimSection(s);
  if (!block) {
    issues.push({ code: 'PARSE_SECTION_FAILED' });
    return { rel, issues };
  }

  const { openTag, inner } = block;

  if (!/id\s*=\s*["']bilgi-istek["']/i.test(openTag)) {
    issues.push({ code: 'MISSING_SECTION_ID_BILGI_ISTEK' });
  }

  if (!inner.includes('icerik-bilgi-form-bant')) {
    issues.push({ code: 'MISSING_ICERIK_BILGI_FORM_BANT' });
  }
  if (!/<h2\b[^>]*>[\s\S]*?\bvurgu-satir\b/.test(inner)) {
    issues.push({ code: 'MISSING_H2_VURGU_SATIR' });
  }
  if (!/id\s*=\s*["']iletisim-formu["']/i.test(inner)) {
    issues.push({ code: 'MISSING_FORM_ID_ILETISIM_FORMU' });
  }

  const nested = countOccurrences(inner, '<section');
  if (nested > 0) {
    issues.push({ code: 'NESTED_SECTION_INSIDE_ILETISIM', detail: nested });
  }

  const ariaM = openTag.match(/aria-labelledby\s*=\s*["']([^"']+)["']/i);
  const h2M = inner.match(/<h2\b[^>]*>/i);
  let h2Id = null;
  if (h2M) {
    const idM = h2M[0].match(/\bid\s*=\s*["']([^"']+)["']/i);
    h2Id = idM ? idM[1] : null;
  }

  if (!ariaM) {
    issues.push({ code: 'MISSING_ARIA_LABELLEDBY' });
  } else if (!h2Id) {
    issues.push({ code: 'ARIA_BUT_H2_NO_ID', detail: ariaM[1] });
  } else if (ariaM[1].trim() !== h2Id) {
    issues.push({
      code: 'ARIA_H2_ID_MISMATCH',
      detail: { aria: ariaM[1], h2Id },
    });
  }

  return { rel, issues, ok: issues.length === 0 };
}

const root = path.join(__dirname, '..');
const files = walk(root);
const results = [];
let withForm = 0;
let okCount = 0;

for (const f of files) {
  const r = auditFile(f, root);
  if (r === null) continue;
  if (r.skip) continue;
  withForm++;
  if (r.ok) okCount++;
  if (r.issues && r.issues.length) {
    results.push({ file: r.rel, issues: r.issues });
  }
}

const summary = {
  generated: new Date().toISOString(),
  totalHtmlScanned: files.length,
  filesWithIletisimFormAlani: withForm,
  filesPassingAllChecks: okCount,
  filesWithIssues: results.length,
};

const out = { summary, issues: results };

const outPath = path.join(__dirname, '_faz5-bilgi-form-audit-report.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

console.log('Faz 5 bilgi form audit');
console.log(JSON.stringify(summary, null, 2));
if (results.length) {
  console.log('\nİlk 30 sorun kaydı:');
  console.log(JSON.stringify(results.slice(0, 30), null, 2));
  if (results.length > 30) console.log(`... ve ${results.length - 30} dosya daha (tam liste JSON’da).`);
}
