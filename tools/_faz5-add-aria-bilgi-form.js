/**
 * Faz 5 tamamlama: hub ile aynı erişilebilirlik sözleşmesi — section aria-labelledby + h2 id.
 * Tek seferlik; id yolu dosya yolundan türetilir (benzersiz).
 */
const fs = require('fs');
const path = require('path');

function ariaIdForRel(rel) {
  const norm = rel.replace(/\\/g, '/');
  const base = norm.replace(/\/index\.html$/i, '').replace(/\.html$/i, '');
  const parts = base.split('/').filter(Boolean);
  return (
    parts
      .join('-')
      .replace(/[^a-z0-9-]+/gi, '')
      .toLowerCase() + '-bilgi-form-baslik'
  );
}

function patch(html, id) {
  if (
    /<section\s+[^>]*class="[^"]*iletisim-form-alani[^"]*"[^>]*aria-labelledby/i.test(
      html
    )
  ) {
    return { html, changed: false, reason: 'already_has_aria' };
  }
  let s = html;
  const secRe =
    /(<section\s+class="iletisim-form-alani"\s+id="bilgi-istek")(\s*>)/i;
  if (!secRe.test(s)) {
    return { html, changed: false, reason: 'section_pattern_not_found' };
  }
  s = s.replace(secRe, `$1 aria-labelledby="${id}"$2`);
  const h2Re = /(<h2)(?![^>]*\bid=)([^>]*>)/i;
  if (!h2Re.test(s)) {
    return { html, changed: false, reason: 'h2_pattern_not_found' };
  }
  s = s.replace(h2Re, `<h2 id="${id}"$2`);
  return { html: s, changed: s !== html, reason: null };
}

const root = path.join(__dirname, '..');
const reportPath = path.join(__dirname, '_faz5-bilgi-form-audit-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const toFix = (report.issues || []).filter((e) =>
  (e.issues || []).some((i) => i.code === 'MISSING_ARIA_LABELLEDBY')
);

const log = [];
for (const { file } of toFix) {
  const abs = path.join(root, file);
  let raw;
  try {
    raw = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    log.push({ file, error: String(e) });
    continue;
  }
  const id = ariaIdForRel(file);
  const { html, changed, reason } = patch(raw, id);
  if (changed) {
    fs.writeFileSync(abs, html, 'utf8');
    log.push({ file, id, ok: true });
  } else {
    log.push({ file, id, ok: false, reason });
  }
}

console.log(JSON.stringify({ count: log.length, log }, null, 2));
