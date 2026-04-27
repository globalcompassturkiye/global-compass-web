const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const targets = [
  "css/style.css",
  "css/blog.css",
  "css/site-iletisim-form.css",
];

function readLines(filePath) {
  const full = path.join(projectRoot, filePath);
  const text = fs.readFileSync(full, "utf8");
  return text.split(/\r?\n/);
}

function isBreakpointHeader(line) {
  return /@media\s*\(max-width:\s*(1200|768|501)px\)/.test(line);
}

function extractBreakpoint(line) {
  const match = line.match(/@media\s*\(max-width:\s*(1200|768|501)px\)/);
  return match ? Number(match[1]) : null;
}

function auditFile(filePath) {
  const lines = readLines(filePath);
  const issues = [];
  let mediaStack = [];
  let selectorBuffer = [];

  const pushIssue = (line, rule, details) => {
    issues.push({ file: filePath, line, rule, details });
  };

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      continue;
    }

    if (isBreakpointHeader(line)) {
      mediaStack.push(extractBreakpoint(line));
      selectorBuffer = [];
      continue;
    }

    if (line.includes("{") && !line.startsWith("@media")) {
      selectorBuffer.push(line.replace("{", "").trim());
      if (selectorBuffer.length > 4) {
        selectorBuffer.shift();
      }
    }

    if (line.includes("}")) {
      // Rough media block tracking for plain CSS structure.
      if (mediaStack.length > 0 && line === "}") {
        mediaStack.pop();
      }
      selectorBuffer = [];
      continue;
    }

    const activeBp = mediaStack[mediaStack.length - 1];
    const selectorHint = selectorBuffer.join(" ");

    if (
      activeBp &&
      /(padding-left|padding-right)\s*:/.test(line) &&
      /icerik-alani/.test(selectorHint) &&
      !/var\(--site-cerceve-gutter\)/.test(line)
    ) {
      pushIssue(
        lineNo,
        "breakpoint-gutter-mismatch",
        `Breakpoint <=${activeBp}px icinde .icerik-alani satirinda 15px global gutter yerine farkli deger var: ${line}`
      );
    }

    if (
      /(max-width)\s*:\s*1200px/.test(line) &&
      filePath !== "css/style.css"
    ) {
      pushIssue(
        lineNo,
        "hardcoded-max-width",
        `1200px sabit deger bulundu; sozlesme degiskeni tercih edilmeli: ${line}`
      );
    }

    if (
      /(margin-left|margin-right)\s*:/.test(line) &&
      /!important/.test(line) &&
      /article\.icerik-alani/.test(selectorHint)
    ) {
      pushIssue(
        lineNo,
        "important-alignment-override",
        `article.icerik-alani alaninda !important margin override bulundu: ${line}`
      );
    }
  }

  return issues;
}

const allIssues = targets.flatMap(auditFile);

const summary = {
  generatedAt: new Date().toISOString(),
  totalIssues: allIssues.length,
  filesScanned: targets,
  issueCounts: allIssues.reduce((acc, item) => {
    acc[item.rule] = (acc[item.rule] || 0) + 1;
    return acc;
  }, {}),
  issues: allIssues,
};

const outputPath = path.join(projectRoot, "tools/frame-alignment-report.json");
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(`Frame alignment audit complete. Issues: ${allIssues.length}`);
console.log(`Report: ${outputPath}`);
