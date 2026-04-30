/**
 * Sync TOC ul lists to h2 headings in <main>.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TR_MAP = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function slugifyId(text) {
  let s = text.trim().replace(/\s+/g, " ");
  for (const [k, v] of Object.entries(TR_MAP)) {
    s = s.split(k).join(v);
  }
  s = s
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!s) s = "bolum";
  return s;
}

function stripTagsToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseClassFromTag(tagInner) {
  const m = tagInner.match(/\bclass\s*=\s*["']([^"']*)["']/i);
  return m ? m[1] : "";
}

function hasClass(classStr, token) {
  return new RegExp(`(?:^|\\s)${token}(?:\\s|$)`).test(classStr);
}

/** First `>` that closes the opening tag (not inside " or '). */
function findClosingAngleAfterOpenBracket(html, lt) {
  let i = lt + 1;
  let quote = null;
  while (i < html.length) {
    const c = html[i];
    if (quote) {
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      i++;
      continue;
    }
    if (c === ">") return i;
    i++;
  }
  return -1;
}

function findMainBounds(html) {
  const mainOpen = html.match(/<main\b[^>]*>/i);
  if (mainOpen) {
    const start = mainOpen.index + mainOpen[0].length;
    const close = html.toLowerCase().lastIndexOf("</main>");
    if (close !== -1 && close > start) return { start, end: close };
  }
  const artOpen = html.match(
    /<article\b[^>]*\bclass="[^"]*\bicerik-alani\b[^"]*"[^>]*>/i
  );
  if (artOpen) {
    const start = artOpen.index + artOpen[0].length;
    const close = html.toLowerCase().lastIndexOf("</article>");
    if (close !== -1 && close > start) return { start, end: close };
  }
  return null;
}

function extractH2InMain(html, main) {
  const out = [];
  const stack = []; // { tag, id, classes }
  let i = main.start;

  while (i < main.end) {
    const lt = html.indexOf("<", i);
    if (lt === -1 || lt >= main.end) break;
    if (html.slice(lt, lt + 4) === "<!--") {
      const ce = html.indexOf("-->", lt + 4);
      i = ce === -1 ? main.end : ce + 3;
      continue;
    }
    const gt = findClosingAngleAfterOpenBracket(html, lt);
    if (gt === -1 || gt > main.end) break;
    const inner = html.slice(lt + 1, gt);
    const rest = inner.trimStart();

    if (rest.startsWith("/")) {
      const name = rest.slice(1).split(/\s/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      while (stack.length) {
        if (stack[stack.length - 1].tag === name) {
          stack.pop();
          break;
        }
        stack.pop();
      }
      i = gt + 1;
      continue;
    }

    if (rest.startsWith("!") || rest.startsWith("?")) {
      i = gt + 1;
      continue;
    }

    const tagName = rest.split(/\s/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const voidTags = new Set([
      "area", "base", "br", "col", "embed", "hr", "img", "input",
      "link", "meta", "param", "source", "track", "wbr",
    ]);
    const selfClosing = /\/\s*$/.test(inner) || voidTags.has(tagName);
    const idM = inner.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const id = idM ? idM[1] : null;
    const classes = parseClassFromTag(inner);

    if (tagName === "h2" && !selfClosing) {
      const afterOpen = html.slice(gt + 1);
      const h2Close = afterOpen.match(/<\/h2>/i);
      if (!h2Close) break;
      const closeH2 = gt + 1 + h2Close.index;
      const closeEnd = gt + 1 + h2Close.index + h2Close[0].length;
      const innerH = html.slice(gt + 1, closeH2);
      const text = stripTagsToText(innerH);
      const idOnH2 = id;

      let excluded = false;
      for (const el of stack) {
        if (hasClass(el.classes, "blog-icindekiler-kutu")) excluded = true;
        if (hasClass(el.classes, "blog-mobil-icindekiler-wrap")) excluded = true;
        if (hasClass(el.classes, "navigasyon-icindekiler-kutu")) excluded = true;
        if (hasClass(el.classes, "alt-yonlendirme-alani")) excluded = true;
        if (hasClass(el.classes, "yonlendirme-karti")) excluded = true;
      }
      if (/^içindekiler$/i.test(text)) excluded = true;

      for (let si = stack.length - 1; si >= 0; si--) {
        const el = stack[si];
        if (hasClass(el.classes, "okul-liste-kapsayici")) {
          const divOpen = el.openIndex;
          const snippet = html.slice(divOpen, Math.min(html.length, divOpen + 8000));
          if (/<section[^>]*class="[^"]*alt-yonlendirme-alani/i.test(snippet)) {
            excluded = true;
          }
          break;
        }
      }

      out.push({
        openStart: lt,
        openEnd: gt + 1,
        closeEnd,
        idOnH2,
        innerH,
        text,
        excluded,
        stackCopy: stack.map((s) => ({ ...s })),
      });

      i = closeEnd;
      continue;
    }

    if (!selfClosing) {
      stack.push({
        tag: tagName,
        id,
        classes,
        openIndex: lt,
      });
    }
    i = gt + 1;
  }

  return out.filter((x) => !x.excluded);
}

function nearestAncestorId(stack) {
  for (let k = stack.length - 1; k >= 0; k--) {
    if (stack[k].id) return stack[k].id;
  }
  return null;
}

function allIdsInHtml(html) {
  const ids = new Set();
  const re = /\bid\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  return ids;
}

function insertIdOnH2Open(openTag, newId) {
  if (/\bid\s*=/i.test(openTag)) return openTag;
  return openTag.replace(/<h2\b/i, `<h2 id="${newId}"`);
}

function buildLiHtml(anchorId, linkText) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<li><a href="#${esc(anchorId)}">${esc(linkText)}</a></li>`;
}

function replaceTocUls(html, classToken, newInner) {
  const re = new RegExp(
    `(<ul\\s[^>]*\\bclass="[^"]*\\b${classToken}\\b[^"]*"[^>]*>)([\\s\\S]*?)(</ul>)`,
    "gi"
  );
  const matches = [...html.matchAll(re)];
  if (!matches.length) return html;
  let out = html;
  for (let m = matches.length - 1; m >= 0; m--) {
    const match = matches[m];
    out =
      out.slice(0, match.index) +
      match[1] +
      "\n" +
      newInner +
      "\n" +
      match[3] +
      out.slice(match.index + match[0].length);
  }
  return out;
}

function verifyTocHrefs(html) {
  const ids = allIdsInHtml(html);
  const problems = [];
  const re =
    /<ul\s[^>]*\bclass="[^"]*(?:blog-icindekiler-liste|navigasyon-icindekiler-liste)[^"]*"[^>]*>[\s\S]*?<\/ul>/gi;
  let um;
  while ((um = re.exec(html))) {
    const block = um[0];
    const ahrefs = [...block.matchAll(/href="#([^"]*)"/gi)];
    for (const a of ahrefs) {
      if (!ids.has(a[1])) problems.push(a[1]);
    }
  }
  return problems;
}

function applyH2IdPatches(html, blocks, usedIds) {
  let out = html;
  const patches = [];

  for (const b of blocks) {
    let anchorId = b.idOnH2;
    if (!anchorId) anchorId = nearestAncestorId(b.stackCopy);
    if (!anchorId) {
      const base = slugifyId(b.text);
      let cand = base;
      let n = 2;
      while (usedIds.has(cand)) cand = `${base}-${n++}`;
      usedIds.add(cand);
      const openSlice = html.slice(b.openStart, b.openEnd);
      const newOpen = insertIdOnH2Open(openSlice, cand);
      patches.push({
        at: b.openStart,
        len: b.openEnd - b.openStart,
        rep: newOpen,
      });
      anchorId = cand;
    } else {
      usedIds.add(anchorId);
    }
    b._resolvedId = anchorId;
  }

  patches.sort((a, b) => b.at - a.at);
  for (const p of patches) {
    out = out.slice(0, p.at) + p.rep + out.slice(p.at + p.len);
  }
  return { html: out, blocks };
}

function processFile(relPath) {
  const full = path.join(ROOT, relPath);
  let html = fs.readFileSync(full, "utf8");
  const orig = html;

  const main = findMainBounds(html);
  if (!main) return { relPath, status: "skip", reason: "no main" };

  let blocks = extractH2InMain(html, main);
  if (!blocks.length)
    return { relPath, status: "skip", reason: "no includable h2" };

  const usedIds = allIdsInHtml(html);
  const { html: html2, blocks: blocks2 } = applyH2IdPatches(html, blocks, usedIds);
  html = html2;
  blocks = blocks2;

  const anchors = [];
  const seenId = new Set();
  for (const b of blocks) {
    let id = b._resolvedId;
    if (!id) {
      id = b.idOnH2 || nearestAncestorId(b.stackCopy);
    }
    if (!id) continue;
    if (seenId.has(id)) continue;
    seenId.add(id);
    anchors.push({ id, text: b.text });
  }

  if (!anchors.length)
    return { relPath, status: "skip", reason: "no anchors" };

  const innerLines = anchors.map((a) => buildLiHtml(a.id, a.text)).join("\n");
  html = replaceTocUls(html, "blog-icindekiler-liste", innerLines);
  html = replaceTocUls(html, "navigasyon-icindekiler-liste", innerLines);

  const probs = verifyTocHrefs(html);
  if (probs.length) {
    return { relPath, status: "error", reason: "verify failed", probs };
  }

  if (html === orig) {
    return { relPath, status: "unchanged" };
  }

  fs.writeFileSync(full, html, "utf8");
  return { relPath, status: "ok", anchors: anchors.length };
}

function listTocHtmlFiles() {
  const acc = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === ".git") continue;
        walk(p);
      } else if (ent.isFile() && ent.name.endsWith(".html")) {
        const txt = fs.readFileSync(p, "utf8");
        if (
          txt.includes("blog-icindekiler-liste") ||
          txt.includes("navigasyon-icindekiler-liste")
        ) {
          acc.push(path.relative(ROOT, p).replace(/\\/g, "/"));
        }
      }
    }
  }
  walk(ROOT);
  return acc;
}

const files = listTocHtmlFiles();
const results = [];
for (const f of files) {
  results.push(processFile(f));
}

const summary = {
  ok: results.filter((r) => r.status === "ok"),
  unchanged: results.filter((r) => r.status === "unchanged"),
  skipped: results.filter((r) => r.status === "skip"),
  errors: results.filter((r) => r.status === "error"),
};
console.log(JSON.stringify(summary, null, 2));

const broken = [];
for (const f of listTocHtmlFiles()) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const p = verifyTocHrefs(html);
  if (p.length) broken.push({ file: f, missingIds: p });
}
if (broken.length) {
  console.error("TOC verify failed:", JSON.stringify(broken, null, 2));
  process.exitCode = 1;
} else {
  console.log("TOC href verify: OK (all fragment ids exist).");
}
