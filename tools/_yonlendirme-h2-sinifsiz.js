/**
 * okul-liste-baslik + yonlendirme-karti-baslik h2 → sınıfsız h2, metin birleşik (tek satır)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir, out = []) {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        if (name.name === 'node_modules' || name.name === '.git') continue;
        const p = path.join(dir, name.name);
        if (name.isDirectory()) walk(p, out);
        else if (name.name.endsWith('.html')) out.push(p);
    }
    return out;
}

function innerToPlain(inner) {
    return inner
        .replace(/<span[^>]*>/gi, ' ')
        .replace(/<\/span>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const re = /<h2 class="okul-liste-baslik yonlendirme-karti-baslik">([\s\S]*?)<\/h2>/g;

let files = 0;
let replacements = 0;
for (const file of walk(root)) {
    let s = fs.readFileSync(file, 'utf8');
    let n = 0;
    s = s.replace(re, (_, inner) => {
        n++;
        return `<h2>${innerToPlain(inner)}</h2>`;
    });
    if (n) {
        fs.writeFileSync(file, s, 'utf8');
        files++;
        replacements += n;
    }
}
console.log(JSON.stringify({ filesUpdated: files, h2Replaced: replacements }, null, 0));
