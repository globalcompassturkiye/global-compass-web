/**
 * css-html-usage-audit.js
 *
 * - Tüm kök altı *.html ve js/*.js içinde geçen class / id tokenlarını toplar.
 * - css/*.css içindeki seçici parçalarından .sınıf ve #id adaylarını çıkarır (yorum + string maskeli).
 * - Özet: CSS’te görünüp HTML/JS’te hiç geçmeyen sınıflar; HTML’de görünüp hiçbir CSS’te geçmeyen sınıflar.
 *
 * Sınırlamalar (raporda da yazılır):
 * - Dinamik birleştirme, şablon stringleri, harici script, SVG xlink tam kapsanmaz.
 * - #fff gibi renkler id olarak sayılmaz (saf hex uzunluk filtresi).
 *
 * Kullanım: node tools/css-html-usage-audit.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_JSON = path.join(__dirname, 'css-html-usage-report.json');
const OUT_MD = path.join(__dirname, 'css-html-usage-report.md');
const CSS_DIR = path.join(ROOT, 'css');
const JS_DIR = path.join(ROOT, 'js');

const SKIP_DIRS = new Set(['node_modules', '.git', '.cursor']);

/** @param {string} dir */
function walkFiles(dir, exts, acc = []) {
  let list;
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of list) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walkFiles(p, exts, acc);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (exts.has(ext)) acc.push(p);
    }
  }
  return acc;
}

function stripCssCommentsAndStrings(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  let state = 'code';
  let strQ = null;
  let esc = false;

  while (i < n) {
    const c = css[i];
    const next = i + 1 < n ? css[i + 1] : '';

    if (state === 'code') {
      if (c === '/' && next === '*') {
        out += ' ';
        i += 2;
        while (i < n && !(css[i] === '*' && i + 1 < n && css[i + 1] === '/')) i++;
        i = Math.min(i + 2, n);
        continue;
      }
      if (c === '"' || c === "'") {
        state = 'string';
        strQ = c;
        esc = false;
        out += ' ';
        i++;
        continue;
      }
      out += c;
      i++;
      continue;
    }

    if (state === 'string') {
      if (esc) {
        esc = false;
        i++;
        continue;
      }
      if (c === '\\') {
        esc = true;
        i++;
        continue;
      }
      if (c === strQ) {
        state = 'code';
        strQ = null;
        i++;
        continue;
      }
      i++;
      continue;
    }
  }
  return out;
}

function isLikelyHexColorId(ident) {
  if (!/^[0-9a-fA-F]+$/i.test(ident)) return false;
  return [3, 4, 6, 8].includes(ident.length);
}

/** @param {string} masked */
function extractCssClassTokens(masked) {
  const classes = new Set();
  const re = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)\b/g;
  let m;
  while ((m = re.exec(masked))) {
    classes.add(m[1]);
  }
  return classes;
}

/** @param {string} masked */
function extractCssIdTokens(masked) {
  const ids = new Set();
  const re = /#(-?[_a-zA-Z][_a-zA-Z0-9-]*)\b/g;
  let m;
  while ((m = re.exec(masked))) {
    const id = m[1];
    if (isLikelyHexColorId(id)) continue;
    ids.add(id);
  }
  return ids;
}

function collectFromHtml(html) {
  const classes = new Set();
  const ids = new Set();

  const reClass = /\bclass\s*=\s*["']([^"']*)["']/gi;
  let m;
  while ((m = reClass.exec(html))) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }

  const reId = /\bid\s*=\s*["']([^"']*)["']/gi;
  while ((m = reId.exec(html))) {
    const v = m[1].trim();
    if (v) ids.add(v);
  }

  return { classes, ids };
}

function collectFromJs(js) {
  const classes = new Set();
  const ids = new Set();

  const reGetId = /\bgetElementById\s*\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = reGetId.exec(js))) {
    if (m[1].trim()) ids.add(m[1].trim());
  }

  const reClassName = /\bclassName\s*=\s*["']([^"']+)["']/g;
  while ((m = reClassName.exec(js))) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }

  /* innerHTML / şablon: dosya içindeki tüm class="…" ve class='…' */
  const reClassAttr = /\bclass\s*=\s*["']([^"']*)["']/gi;
  while ((m = reClassAttr.exec(js))) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }

  /* Seçici stringleri: '.rozet-govde', ".immerse-tokyo-branches-kutu" */
  const reDotClassString = /["']\.([-_a-zA-Z][-_a-zA-Z0-9]*)["']/g;
  while ((m = reDotClassString.exec(js))) {
    classes.add(m[1]);
  }

  /* classList.add('a', 'b') — parantez içinde parantez yoksa tırnaklı argümanların hepsi */
  const reClassListCall = /classList\.(?:add|remove|toggle)\s*\(([^)]*)\)/g;
  while ((m = reClassListCall.exec(js))) {
    const inner = m[1].trim();
    if (/[()]/.test(inner)) continue;
    const reStr = /["']([^"']*)["']/g;
    let sm;
    while ((sm = reStr.exec(inner))) {
      sm[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
    }
  }

  const reClassListContains = /\bclassList\.contains\s*\(\s*["']([^"']+)["']/g;
  while ((m = reClassListContains.exec(js))) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }

  const reQS = /\bquerySelector(?:All)?\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = reQS.exec(js))) {
    const sel = m[1];
    const parts = sel.split(/[\s,>+~[\]()]+/).filter(Boolean);
    for (const p of parts) {
      if (p.startsWith('.')) {
        const c = p.slice(1).replace(/[:.].*$/, '');
        if (/^[_a-zA-Z][_a-zA-Z0-9-]*$/.test(c)) classes.add(c);
      } else if (p.startsWith('#')) {
        const id = p.slice(1).replace(/[:.].*$/, '');
        if (id && !isLikelyHexColorId(id) && /^[_a-zA-Z][_a-zA-Z0-9-]*$/.test(id)) ids.add(id);
      }
    }
  }

  return { classes, ids };
}

function mergeSets(a, b) {
  for (const x of b) a.add(x);
}

function main() {
  const htmlFiles = walkFiles(ROOT, new Set(['.html']));
  const jsFiles = fs.existsSync(JS_DIR) ? walkFiles(JS_DIR, new Set(['.js'])) : [];

  const htmlClasses = new Set();
  const htmlIds = new Set();
  const htmlClassFiles = new Map();
  const htmlIdFiles = new Map();

  function noteFile(map, token, file) {
    if (!map.has(token)) map.set(token, []);
    const arr = map.get(token);
    if (arr.length < 5) {
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      if (!arr.includes(rel)) arr.push(rel);
    }
  }

  for (const f of htmlFiles) {
    const raw = fs.readFileSync(f, 'utf8');
    const { classes, ids } = collectFromHtml(raw);
    for (const c of classes) {
      htmlClasses.add(c);
      noteFile(htmlClassFiles, c, f);
    }
    for (const id of ids) {
      htmlIds.add(id);
      noteFile(htmlIdFiles, id, f);
    }
  }

  const jsClasses = new Set();
  const jsIds = new Set();
  for (const f of jsFiles) {
    const raw = fs.readFileSync(f, 'utf8');
    const { classes, ids } = collectFromJs(raw);
    for (const c of classes) jsClasses.add(c);
    for (const id of ids) jsIds.add(id);
  }

  const usedClasses = new Set(htmlClasses);
  const usedIds = new Set(htmlIds);
  mergeSets(usedClasses, jsClasses);
  mergeSets(usedIds, jsIds);

  const cssFiles = fs.existsSync(CSS_DIR)
    ? fs.readdirSync(CSS_DIR).filter((n) => n.endsWith('.css')).map((n) => path.join(CSS_DIR, n))
    : [];

  const cssClasses = new Set();
  const cssIds = new Set();
  const cssClassSources = new Map();
  const cssIdSources = new Map();

  function noteCssSource(map, token, file) {
    if (!map.has(token)) map.set(token, new Set());
    map.get(token).add(path.basename(file));
  }

  for (const f of cssFiles) {
    const raw = fs.readFileSync(f, 'utf8');
    const masked = stripCssCommentsAndStrings(raw);
    for (const c of extractCssClassTokens(masked)) {
      cssClasses.add(c);
      noteCssSource(cssClassSources, c, f);
    }
    for (const id of extractCssIdTokens(masked)) {
      cssIds.add(id);
      noteCssSource(cssIdSources, id, f);
    }
  }

  const cssNeverUsed = [...cssClasses].filter((c) => !usedClasses.has(c)).sort();
  const htmlClassNotInCss = [...htmlClasses].filter((c) => !cssClasses.has(c)).sort();
  const htmlClassNotInCssButInJs = htmlClassNotInCss.filter((c) => jsClasses.has(c)).sort();
  const htmlClassNotInCssNorJs = htmlClassNotInCss.filter((c) => !jsClasses.has(c)).sort();
  const cssIdNeverUsed = [...cssIds].filter((id) => !usedIds.has(id)).sort();
  const htmlIdNotInCss = [...htmlIds].filter((id) => !cssIds.has(id)).sort();

  const payload = {
    schema: 'global-compass-css-html-usage/1',
    generated_at: new Date().toISOString(),
    summary: {
      html_files: htmlFiles.length,
      js_files: jsFiles.length,
      css_files: cssFiles.length,
      unique_classes_html: htmlClasses.size,
      unique_ids_html: htmlIds.size,
      unique_classes_css: cssClasses.size,
      unique_ids_css: cssIds.size,
      css_classes_never_in_html_or_js: cssNeverUsed.length,
      css_ids_never_in_html_or_js: cssIdNeverUsed.length,
      html_classes_never_in_any_css: htmlClassNotInCss.length,
      html_classes_never_in_css_but_in_js: htmlClassNotInCssButInJs.length,
      html_classes_never_in_css_nor_js: htmlClassNotInCssNorJs.length,
      html_ids_never_in_any_css: htmlIdNotInCss.length,
    },
    caveats: [
      'Sınıf/id yalnızca üretim dışı araçlarda, inline script veya harici CDN’de geçiyorsa “ölü” yanlış pozitif verir.',
      'querySelector / birleşik string ile üretilen seçiciler tam taranmaz; JS tarafı sınırlı kalıplarla taranır.',
      'SVG içi class veya <style> bloğu ayrıştırılmaz.',
      'HTML’de olup CSS’te çıkmayan sınıflar: gövde kancası (yalnızca body’de), ileride kullanılacak isim veya JS ile eklenen sınıf olabilir; otomatik silme önerilmez.',
      'CSS’te olup markup’ta çıkmayan sınıflar: dinamik DOM, şablon dışı sayfa veya yalnızca başka bir CSS dosyasından @import ile gelmeyen (bu tarama css/ kökündeki .css dosyalarını okur) durumlar için yanlış pozitif olabilir.',
      'js/*.js: innerHTML içindeki class="…", classList.add(…), querySelector(…), tırnak içi ".foo" seçici parçaları "kullanılmış" sayılır (ölü CSS sayısını düşürür).',
    ],
    samples: {
      css_classes_never_used_first_200: cssNeverUsed.slice(0, 200),
      html_classes_not_in_css_first_120: htmlClassNotInCss.slice(0, 120),
      html_classes_not_in_css_but_in_js_first_60: htmlClassNotInCssButInJs.slice(0, 60),
      html_classes_not_in_css_nor_js_first_120: htmlClassNotInCssNorJs.slice(0, 120),
      css_ids_never_used_first_80: cssIdNeverUsed.slice(0, 80),
      html_ids_not_in_css_first_80: htmlIdNotInCss.slice(0, 80),
    },
    lists: {
      css_classes_never_used: cssNeverUsed,
      html_classes_not_in_css: htmlClassNotInCss,
      html_classes_not_in_css_but_in_js: htmlClassNotInCssButInJs,
      html_classes_not_in_css_nor_js: htmlClassNotInCssNorJs,
      css_ids_never_used: cssIdNeverUsed,
      html_ids_not_in_css: htmlIdNotInCss,
    },
    html_class_example_files: Object.fromEntries(
      htmlClassNotInCssNorJs.slice(0, 80).map((c) => [c, htmlClassFiles.get(c) || []]),
    ),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');

  const md = [];
  md.push('# CSS–HTML kullanım denetimi');
  md.push('');
  md.push(`Oluşturulma: ${payload.generated_at}`);
  md.push('');
  md.push('## Özet');
  md.push('');
  md.push(`| Metrik | Değer |`);
  md.push(`| --- | ---: |`);
  md.push(`| Taranan HTML dosyası | ${payload.summary.html_files} |`);
  md.push(`| Taranan JS dosyası | ${payload.summary.js_files} |`);
  md.push(`| Taranan CSS dosyası | ${payload.summary.css_files} |`);
  md.push(`| HTML’de benzersiz class | ${payload.summary.unique_classes_html} |`);
  md.push(`| CSS’te benzersiz .class token | ${payload.summary.unique_classes_css} |`);
  md.push(`| **CSS’te var, HTML/JS’te yok** (olası ölü / dinamik) | **${payload.summary.css_classes_never_in_html_or_js}** |`);
  md.push(`| **HTML’de var, hiçbir CSS’te yok** (toplam) | **${payload.summary.html_classes_never_in_any_css}** |`);
  md.push(`| … bunlardan JS’te de kanca yok (CSS kuralı yazımı adayı) | **${payload.summary.html_classes_never_in_css_nor_js}** |`);
  md.push(`| … bunlardan JS’te kanca var (salt JS seçici / span) | ${payload.summary.html_classes_never_in_css_but_in_js} |`);
  md.push(`| CSS #id yok HTML/JS’te | ${payload.summary.css_ids_never_in_html_or_js} |`);
  md.push(`| HTML #id yok CSS’te | ${payload.summary.html_ids_never_in_any_css} |`);
  md.push('');
  md.push('## Bilinen HTML sadeleştirmesi');
  md.push('');
  md.push(
    '- `blog-icindekiler-liste--mobil` kaldırıldı: `css/*.css` içinde tanım yoktu; ilgili `<ul>` öğelerinde yalnızca `blog-icindekiler-liste` kullanılıyor.',
  );
  md.push('');
  md.push('## Dikkat');
  md.push('');
  for (const c of payload.caveats) md.push(`- ${c}`);
  md.push('');
  md.push('## Örnek: CSS’te görünüp markup’ta çıkmayan sınıflar (ilk 80)');
  md.push('');
  md.push('```');
  md.push(...cssNeverUsed.slice(0, 80));
  md.push('```');
  md.push('');
  md.push('## Örnek: HTML’de olup CSS’te yok, JS’te de yok (ilk 60 — yazım / legacy adayı)');
  md.push('');
  md.push('```');
  md.push(...htmlClassNotInCssNorJs.slice(0, 60));
  md.push('```');
  md.push('');
  md.push('## Örnek: HTML’de olup CSS’te yok ama JS’te kanca (ilk 40)');
  md.push('');
  md.push('```');
  md.push(...htmlClassNotInCssButInJs.slice(0, 40));
  md.push('```');
  md.push('');
  md.push(`Tam listeler: \`${path.basename(OUT_JSON)}\` içindeki \`lists\`.`);
  md.push('');

  fs.writeFileSync(OUT_MD, md.join('\n'), 'utf8');

  console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
  console.log(JSON.stringify(payload.summary, null, 2));
}

main();
