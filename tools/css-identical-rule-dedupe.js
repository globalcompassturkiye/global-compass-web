/**
 * css-identical-rule-dedupe.js
 *
 * Aynı kapsamda (TOP veya tek bir @media / @supports bloğunun içi) birebir aynı
 * seçici metni + aynı bildirim gövdesi (özellik sırasından bağımsız normalize)
 * olan kurallardan yalnızca SON tekrarı bırakır. @keyframes vb. iç içe at-kurallar
 * korunur; yorumlar korunur.
 *
 * Kullanım:
 *   node tools/css-identical-rule-dedupe.js --dry-run
 *   node tools/css-identical-rule-dedupe.js --write
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CSS_FILE = path.join(ROOT, 'css', 'style.css');

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run') || !args.has('--write');

function normalizeDecl(decl) {
  const parts = decl.split(';');
  const pairs = [];
  for (const part of parts) {
    const line = part.trim();
    if (!line || line.indexOf(':') < 0) continue;
    const idx = line.indexOf(':');
    const prop = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).replace(/\s+/g, ' ').trim();
    pairs.push(`${prop}:${val}`);
  }
  pairs.sort();
  return pairs.join('|');
}

function normalizeSel(sel) {
  return sel.replace(/\s+/g, ' ').trim();
}

function ruleKey(sel, decl) {
  return `${normalizeSel(sel)}\0${normalizeDecl(decl)}`;
}

/**
 * s[start] === '{'; döndürür: kapanan '}' indeksinin hemen sonrası (exclusive end).
 */
function scanClosingBrace(s, start) {
  let i = start;
  let depth = 1;
  let state = 'code';
  let strQuote = null;
  let escape = false;

  while (i < s.length && depth > 0) {
    const c = s[i];
    const next = i + 1 < s.length ? s[i + 1] : '';

    if (state === 'code') {
      if (c === '/' && next === '*') {
        state = 'block_comment';
        i += 2;
        continue;
      }
      if (c === '"' || c === "'") {
        state = 'string';
        strQuote = c;
        escape = false;
        i++;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
      continue;
    }

    if (state === 'block_comment') {
      if (c === '*' && next === '/') {
        state = 'code';
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (state === 'string') {
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (c === '\\') {
        escape = true;
        i++;
        continue;
      }
      if (c === strQuote) {
        state = 'code';
        strQuote = null;
        i++;
        continue;
      }
      i++;
      continue;
    }
  }

  if (depth !== 0) {
    throw new Error(`Unbalanced braces while scanning from index ${start}`);
  }
  return i;
}

function skipWs(s, i) {
  while (i < s.length && /\s/.test(s[i])) i++;
  return i;
}

function startsWithAt(s, i, name) {
  return s.slice(i, i + name.length) === name;
}

function scanAtRuleOrStatement(s, i) {
  if (startsWithAt(s, i, '@import')) {
    const semi = s.indexOf(';', i);
    if (semi < 0) throw new Error('@import without ;');
    return semi + 1;
  }
  const open = s.indexOf('{', i);
  if (open < 0) {
    const semi = s.indexOf(';', i);
    if (semi < 0) throw new Error(`@rule without { or ; at ${i}`);
    return semi + 1;
  }
  return scanClosingBrace(s, open + 1);
}

/**
 * inner: süslü dış parantezler OLMADAN, bir blok gövdesi (ör. @media içi).
 */
function dedupeQualifiedRulesInBlock(inner) {
  const segments = [];
  let k = 0;
  const n = inner.length;

  while (k < n) {
    const gapStart = k;
    k = skipWs(inner, k);
    const gap = inner.slice(gapStart, k);
    if (k >= n) {
      if (gap) segments.push({ type: 'raw', text: gap });
      break;
    }

    if (inner[k] === '@') {
      const end = scanAtRuleOrStatement(inner, k);
      segments.push({ type: 'opaque', gap, text: inner.slice(k, end) });
      k = end;
      continue;
    }

    const selEnd = inner.indexOf('{', k);
    if (selEnd < 0) {
      const tail = inner.slice(k);
      if (tail.trim()) {
        throw new Error(`Trailing non-rule content in block: ${tail.slice(0, 80)}...`);
      }
      if (gap) segments.push({ type: 'raw', text: gap });
      break;
    }

    const sel = inner.slice(k, selEnd).trim();
    if (sel.startsWith('@')) {
      const end = scanAtRuleOrStatement(inner, k);
      segments.push({ type: 'opaque', gap, text: inner.slice(k, end) });
      k = end;
      continue;
    }

    const bodyStart = selEnd + 1;
    const ruleEnd = scanClosingBrace(inner, bodyStart);
    const decl = inner.slice(bodyStart, ruleEnd - 1);
    segments.push({ type: 'rule', gap, selStart: k, ruleEnd, sel, decl });
    k = ruleEnd;
  }

  const ruleIndices = [];
  segments.forEach((s, idx) => {
    if (s.type === 'rule') ruleIndices.push(idx);
  });

  const lastIdxByKey = new Map();
  for (const idx of ruleIndices) {
    const r = segments[idx];
    lastIdxByKey.set(ruleKey(r.sel, r.decl), idx);
  }

  let out = '';
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (s.type === 'raw') {
      out += s.text;
      continue;
    }
    if (s.type === 'opaque') {
      out += s.gap + s.text;
      continue;
    }
    const key = ruleKey(s.sel, s.decl);
    const keep = lastIdxByKey.get(key) === i;
    if (keep) out += s.gap + inner.slice(s.selStart, s.ruleEnd);
  }
  return out;
}

function processMediaLikeBlock(blockText) {
  const open = blockText.indexOf('{');
  if (open < 0) return blockText;
  const header = blockText.slice(0, open + 1);
  const inner = blockText.slice(open + 1, blockText.length - 1);
  const inner2 = dedupeQualifiedRulesInBlock(inner);
  return `${header}${inner2}}`;
}

function dedupeTopLevel(css) {
  const segments = [];
  let k = 0;
  const n = css.length;

  while (k < n) {
    const gapStart = k;
    k = skipWs(css, k);
    const gap = css.slice(gapStart, k);
    if (k >= n) {
      if (gap) segments.push({ type: 'raw', text: gap });
      break;
    }

    if (css[k] === '@') {
      if (startsWithAt(css, k, '@import')) {
        const end = scanAtRuleOrStatement(css, k);
        segments.push({ type: 'opaque', gap, text: css.slice(k, end) });
        k = end;
        continue;
      }

      const open = css.indexOf('{', k);
      if (open < 0) {
        const end = scanAtRuleOrStatement(css, k);
        segments.push({ type: 'opaque', gap, text: css.slice(k, end) });
        k = end;
        continue;
      }

      const hdr = css.slice(k, open).trim();
      const blockEnd = scanClosingBrace(css, open + 1);
      const fullBlock = css.slice(k, blockEnd);
      const lower = hdr.toLowerCase();
      if (lower.startsWith('@media') || lower.startsWith('@supports')) {
        segments.push({ type: 'media', gap, text: processMediaLikeBlock(fullBlock) });
        k = blockEnd;
        continue;
      }

      segments.push({ type: 'opaque', gap, text: fullBlock });
      k = blockEnd;
      continue;
    }

    const selEnd = css.indexOf('{', k);
    if (selEnd < 0) {
      const tail = css.slice(k);
      if (tail.trim()) {
        throw new Error(`Trailing content at end of stylesheet: ${tail.slice(0, 80)}...`);
      }
      if (gap) segments.push({ type: 'raw', text: gap });
      break;
    }

    const sel = css.slice(k, selEnd).trim();
    if (sel.startsWith('@')) {
      const end = scanAtRuleOrStatement(css, k);
      segments.push({ type: 'opaque', gap, text: css.slice(k, end) });
      k = end;
      continue;
    }

    const bodyStart = selEnd + 1;
    const ruleEnd = scanClosingBrace(css, bodyStart);
    const decl = css.slice(bodyStart, ruleEnd - 1);
    segments.push({ type: 'rule', gap, selStart: k, ruleEnd, sel, decl });
    k = ruleEnd;
  }

  const ruleIndices = [];
  segments.forEach((s, idx) => {
    if (s.type === 'rule') ruleIndices.push(idx);
  });

  const lastIdxByKey = new Map();
  for (const idx of ruleIndices) {
    const r = segments[idx];
    lastIdxByKey.set(ruleKey(r.sel, r.decl), idx);
  }

  let out = '';
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (s.type === 'raw') {
      out += s.text;
      continue;
    }
    if (s.type === 'opaque' || s.type === 'media') {
      out += s.gap + s.text;
      continue;
    }
    const key = ruleKey(s.sel, s.decl);
    const keep = lastIdxByKey.get(key) === i;
    if (keep) out += s.gap + css.slice(s.selStart, s.ruleEnd);
  }
  return out;
}

function main() {
  const raw = fs.readFileSync(CSS_FILE, 'utf8');
  const before = Buffer.byteLength(raw, 'utf8');
  const afterStr = dedupeTopLevel(raw);
  const after = Buffer.byteLength(afterStr, 'utf8');
  const removedChars = raw.length - afterStr.length;

  if (raw !== afterStr) {
    console.log(`Identical-rule dedupe: changed (${removedChars} chars fewer)`);
    console.log(`  bytes: ${before} -> ${after}`);
  } else {
    console.log('Identical-rule dedupe: no duplicate (selector+body) rules found.');
  }

  if (DRY) {
    console.log('Dry-run: no write. Pass --write to apply.');
    return;
  }

  fs.writeFileSync(CSS_FILE, afterStr, 'utf8');
  console.log(`Wrote: ${CSS_FILE}`);
}

main();
