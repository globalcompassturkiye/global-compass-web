/**
 * Faz 2 devam: hizmet-tab kalıntıları, mega seçicide hizmet satırları,
 * dil/oxford konaklama, canada grid, yonlendirme cta-wrap, pasif kart, blog inner.
 */
import fs from 'fs';

const p = new URL('../css/style.css', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

/* --- hizmet-tab-alani satırları (:is listeleri) --- */
s = s.replace(/\n    \.hizmet-tab-alani,\r?\n/g, '\n');
s = s.replace(/\n        \.hizmet-tab-alani,\r?\n/g, '\n');

s = s.replace(/\n    article\.icerik-alani > \.hizmet-tab-alani,\r?\n/g, '\n');

s = s.replace(
  /body\.ana-sayfa :is\(\.icerik-alani, \.hizmet-tab-alani\)/g,
  'body.ana-sayfa .icerik-alani'
);

s = s.replace(
  /\nbody\.ana-sayfa \.hizmet-tab-alani > \.cerceve-kutu\.icerik-kutusu \{\n    margin-top: 0;\n\}\n/g,
  '\n'
);

/* --- display:block mega kuralı: iki hizmet satırını sil --- */
const startRem = s.indexOf(
  '\n#yaz-ing-londra:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-ing #okul-listesi-yaz-ing-londra,'
);
if (startRem !== -1) {
  const endMarker =
    '#yaz-almanya-freiburg:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-almanya #baslik-yaz-almanya-freiburg {';
  const endRem = s.indexOf(endMarker, startRem);
  if (endRem === -1) throw new Error('hizmet mega-rule end marker not found');
  const afterLine = s.indexOf('\n', endRem + endMarker.length);
  if (afterLine === -1) throw new Error('newline after hizmet mega-rule');
  s = s.slice(0, startRem) + s.slice(afterLine);
  /* svg), sonrası doğrudan display geliyorsa { ekle */
  s = s.replace(
    /(body\.sayfa-yurt-disi-yaz-okullari-uk-bournemouth-summer-boarding-courses-canford\n    :is\(\.sbc-course-card__spec-ikon svg, \.sbc-spor-akademi-kart__ikon svg\)),\r?\n    display: block;/g,
    '$1 {\n    display: block;'
  );
}

/* --- .icerik-alani .hizmet-tab-alani (1200px medya) --- */
s = s.replace(/\n    \.icerik-alani \.hizmet-tab-alani,\r?\n/g, '\n');

/* --- text-align ortak liste --- */
s = s.replace(
  /#sportech-tenis-giris-metni > h2:first-of-type,\n\.canada-secim-paneli > h2,\n\.chantemerle-ornek-kapsayici,\n\.sea-beslenme-kart\.sea-beslenme-kart-ortali,\nbody\.ana-sayfa \.hizmet-tab-alani,\nbody\.ana-sayfa \.hizmet-tab-alani \.tab-metin,\nbody\.kings-bournemouth-yaz-okulu-sayfa article\.icerik-alani h2 \{/g,
  '#sportech-tenis-giris-metni > h2:first-of-type,\n.canada-secim-paneli > h2,\n.chantemerle-ornek-kapsayici,\n.sea-beslenme-kart.sea-beslenme-kart-ortali,\nbody.kings-bournemouth-yaz-okulu-sayfa article.icerik-alani h2 {'
);

/* --- vismara ::before (hizmet ::before kaldır) --- */
s = s.replace(
  /\.vismara-konum-kutu \.vismara-tesis-oge h4::before,\n\.hizmet-tab-alani::before, \.hizmet-tab-alani::after \{/g,
  '.vismara-konum-kutu .vismara-tesis-oge h4::before {'
);

/* --- immerse/kings text-align --- */
s = s.replace(
  /\.immerse-detay-kart\.immerse-tokyo-detay-one-cikanlar,\n\.sayfa-kings-education \.immerse-detay-kart\.kings-london-detay-liste-kart,\n\.tab-metin,\nbody\.ana-sayfa \.hizmet-tab-alani \.tab-link-listesi li a,\nbody\.sayfa-yurt-disi-burs-firsatlari article\.icerik-alani \.cerceve-kutu p \{/g,
  '.immerse-detay-kart.immerse-tokyo-detay-one-cikanlar,\n.sayfa-kings-education .immerse-detay-kart.kings-london-detay-liste-kart,\nbody.sayfa-yurt-disi-burs-firsatlari article.icerik-alani .cerceve-kutu p {'
);

s = s.replace(
  /\.sayfa-kings-education \.kings-la-dahil-grid \.kings-la-dahil-kart-ortali \.kings-la-dahil-h4,\nbody\.ana-sayfa \.hizmet-tab-alani \.tab-link-listesi li \{/g,
  '.sayfa-kings-education .kings-la-dahil-grid .kings-la-dahil-kart-ortali .kings-la-dahil-h4 {'
);

/* --- canada-avantaj-grid-3-1 (yalnızca CSS'te, HTML yok) --- */
s = s.replace(
  /\n\.cerceve-kutu \.canada-avantaj-grid-3-1,\n    \.site-gri-cerceve-kutu \.canada-avantaj-grid-3-1 \{\n        grid-template-columns: 1fr;\n    \}\n    \.canada-avantaj-grid-3-1 > \.rozet-kart:nth-child\(4\) \{\n        grid-column: auto;\n        justify-self: stretch;\n        width: 100%;\n    \}\n\n    \.canada-program-sehir-grid \{/g,
  '\n\n    .canada-program-sehir-grid {'
);

s = s.replace(
  /\n\.cerceve-kutu \.canada-avantaj-grid-3-1,\n    \.site-gri-cerceve-kutu \.canada-avantaj-grid-3-1 \{\n        grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\n    \}\n    \.canada-avantaj-grid-3-1 > \.rozet-kart:nth-child\(4\) \{\n        grid-column: 1 \/ -1;\n        width: min\(100%, calc\(\(100% - var\(--icerik-rozet-grid-gap\)\) \/ 2\)\);\n    \}\n\n    \.canada-program-sehir-grid \{/g,
  '\n\n    .canada-program-sehir-grid {'
);

s = s.replace(
  /\n\.cerceve-kutu \.canada-avantaj-grid-3-1,\n\.site-gri-cerceve-kutu \.canada-avantaj-grid-3-1 \{\n    grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);\n    gap: var\(--icerik-rozet-grid-gap\);\n\}\n\n\.canada-avantaj-grid-3-1 > \.rozet-kart:nth-child\(4\) \{\n    grid-column: 1 \/ -1;\n    justify-self: center;\n    width: min\(100%, calc\(\(100% - 2 \* var\(--icerik-rozet-grid-gap\)\) \/ 3\)\);\n\}\n\n\.canada-program-sehir-grid \{/g,
  '\n\n.canada-program-sehir-grid {'
);

/* mobil medya içindeki canada-avantaj seçicileri */
s = s.replace(
  /\n    \.cerceve-kutu \.canada-avantaj-grid-3-1,\n    \.site-gri-cerceve-kutu \.canada-avantaj-grid-3-1,\n/g,
  '\n'
);
s = s.replace(/\n    \.canada-avantaj-grid-3-1 > \.rozet-kart:nth-child\(4\) \{\n        grid-column: auto;\n        width: 100%;\n        justify-self: stretch;\n    \}\n\n/g, '\n');

/* --- dil / oxford konaklama ölü blokları --- */
s = s.replace(
  /\n\.dil-okullari-konaklama-kutu \.konaklama-liste \{\n    display: flex;\n    flex-direction: column;\n    gap: 12px;\n    margin-top: 25px;\n\}\n\.dil-okullari-konaklama-kutu \.konaklama-oge \{\n    display: flex;\n    align-items: flex-start;\n    gap: 18px;\n    padding: 18px 20px;\n    background: #ffffff;\n    border-left: 0 solid transparent;\n    box-shadow: 0 2px 6px rgba\(0,0,128,0\.06\);\n\}\n\n/g,
  '\n'
);

s = s.replace(
  /\.dil-okullari-konaklama-kutu \.konaklama-ikon,\n\.icerik-kutusu \.yaz-konaklama-ikon \{/g,
  '.icerik-kutusu .yaz-konaklama-ikon {'
);

s = s.replace(
  /\.dil-okullari-konaklama-kutu \.konaklama-icerik h3,\n\.icerik-kutusu \.yaz-konaklama-icerik h3 \{/g,
  '.icerik-kutusu .yaz-konaklama-icerik h3 {'
);

s = s.replace(
  /\.dil-okullari-konaklama-kutu \.konaklama-icerik p,\n\.icerik-kutusu \.yaz-konaklama-icerik p \{/g,
  '.icerik-kutusu .yaz-konaklama-icerik p {'
);

s = s.replace(
  /\n\.dil-okullari-konaklama-kutu \.konaklama-oge \{\n        padding: 14px 16px;\n        gap: 14px;\n    \}\n    \.dil-okullari-konaklama-kutu \.konaklama-ikon \{\n        font-size: 24px;\n    \}\n\n/g,
  '\n'
);

s = s.replace(
  /\n\.oxford-konaklama-kutu \.konaklama-intro-panel \{\n    background: #ffffff;\n    border-left-color: #0f766e;\n    box-shadow: none;\n\}\n\n\.oxford-konaklama-kutu \.immerse-konaklama-grid \{\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: center;\n    gap: 20px;\n    max-width: 1000px;\n    margin-top: 22px;\n    margin-left: auto;\n    margin-right: auto;\n\}\n\n\.oxford-konaklama-kutu \.immerse-konaklama-kart \{\n    flex: 0 1 30%;\n    max-width: 300px;\n\}\n\n/g,
  '\n'
);

s = s.replace(
  /\n    \.oxford-konaklama-kutu \.immerse-konaklama-kart \{\n        flex: 0 1 100%;\n        max-width: none;\n    \}\n\n/g,
  '\n'
);

s = s.replace(
  /\n\.dil-okullari-konaklama-kutu \.konaklama-icerik h3 \{\n    font-size: var\(--h3-font-size\);\n    line-height: 1\.4;\n    font-weight: 700;\n\}\n\n\.dil-okullari-konaklama-kutu \.konaklama-oge \{\n    background: #ffffff;\n    border: 0 solid transparent;\n    box-shadow: 0 4px 12px rgba\(15, 23, 42, 0\.06\);\n    border-radius: 15px;\n\}\n\n/g,
  '\n'
);

/* --- blog pasif kart --- */
s = s.replace(
  /article\.icerik-alani\.blog-yazi-detay \.dil-okullari-secim-paneli span\.yaz-okullari-ulke-kart\.yaz-okullari-ulke-kart--pasif \{\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    justify-content: center;\n    min-height: 128px;\n    padding: 1\.1rem 1rem 1\.15rem;\n    text-align: center;\n    color: inherit;\n    background: #f1f5f9;\n    border: none;\n    box-shadow:\n        0 2px 6px rgba\(15, 23, 42, 0\.06\),\n        0 8px 20px rgba\(15, 23, 42, 0\.08\);\n    box-sizing: border-box;\n    overflow: hidden;\n    cursor: default;\n\}\n\narticle\.icerik-alani\.blog-yazi-detay \.dil-okullari-secim-paneli span\.yaz-okullari-ulke-kart\.yaz-okullari-ulke-kart--pasif:hover \{\n    transform: none;\n    box-shadow:\n        0 2px 6px rgba\(15, 23, 42, 0\.06\),\n        0 8px 20px rgba\(15, 23, 42, 0\.08\);\n    background: #f1f5f9;\n    z-index: 0;\n\}\n\n/g,
  ''
);

/* --- ana-sayfa-blog-ozeti-inner --- */
s = s.replace(
  /\n\.ana-sayfa-blog-ozeti-inner \{\n    border: 1px solid var\(--site-kart-kenar\);\n    border-radius: 15px;\n    padding: 0;\n    overflow: hidden;\n    background: var\(--site-kart-yuzey\);\n    background-image: none;\n    box-shadow: var\(--site-kart-golge\);\n\}\n\n/g,
  '\n'
);

/* --- yonlendirme-karti-cta-wrap --- */
s = s.replace(
  /\n\/\* İsteğe bağlı: birden fazla CTA'yı tek grupta tutmak için \(eski sayfalar\) \*\/\n\.yonlendirme-karti > \.yonlendirme-karti-cta-wrap \{\n    display: flex;\n    flex-wrap: wrap;\n    gap: 12px;\n    align-items: flex-start;\n    flex: 1 1 100%;\n    width: 100%;\n    min-width: 0;\n    box-sizing: border-box;\n\}\n\n/g,
  '\n'
);

s = s.replace(
  /\n    \.yonlendirme-karti:has\(> \.yonlendirme-karti-cta-wrap > a\.kart-link:nth-of-type\(3\)\) > \.yonlendirme-karti-cta-wrap > a\.kart-link,\n    \.yonlendirme-karti:has\(> \.yonlendirme-karti-cta-wrap > a\.kart-link:nth-of-type\(3\)\) > \.yonlendirme-karti-cta-wrap > \.vurgulu-incele-btn \{\n        flex: 1 1 0;\n        min-width: min-content;\n        max-width: none;\n        width: auto;\n        align-self: stretch;\n    \}\n\n    \.yonlendirme-karti:has\(> \.yonlendirme-karti-cta-wrap > a\.kart-link:nth-of-type\(3\)\) > \.yonlendirme-karti-cta-wrap \{\n        flex-wrap: wrap;\n    \}\n/g,
  ''
);

s = s.replace(
  /@media \(max-width: 640px\) \{\n    \.yonlendirme-karti > \.kart-link,\n    \.yonlendirme-karti > \.vurgulu-incele-btn,\n    \.yonlendirme-karti > \.yonlendirme-karti-cta-wrap \.kart-link,\n    \.yonlendirme-karti > \.yonlendirme-karti-cta-wrap \.vurgulu-incele-btn \{/g,
  '@media (max-width: 640px) {\n    .yonlendirme-karti > .kart-link,\n    .yonlendirme-karti > .vurgulu-incele-btn {'
);

s = s.replace(
  /\n    \.yonlendirme-karti > \.yonlendirme-karti-cta-wrap \{\n        flex-direction: column;\n    \}\n\}/g,
  '\n}'
);

/* --- display:none listesinden .tab-panel (HTML'de yok) --- */
s = s.replace(
  /\.global-mobil-cta-bar-wrap,\n\.tab-panel,\nsummary\.immerse-tokyo-devam-btn::-webkit-details-marker/g,
  '.global-mobil-cta-bar-wrap,\nsummary.immerse-tokyo-devam-btn::-webkit-details-marker'
);

fs.writeFileSync(p, s);
console.log('OK: faz2-rest cleanup');
