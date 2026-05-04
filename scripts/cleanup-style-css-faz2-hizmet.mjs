/**
 * Faz 2: Remove dead ana sayfa hizmet-tab CSS blocks (verified unused in HTML).
 */
import fs from 'fs';

const p = new URL('../css/style.css', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

const markerBig =
  '.hizmet-tab-alani {\n' +
  '    max-width: 1200px;\n' +
  '    width: 100%;\n' +
  '    margin: 25px auto; \n' +
  '    background: transparent;\n' +
  '    padding: 22px 10px 22px;';

const blockSmall =
  '\n\n.hizmet-tab-alani {\n' +
  '    max-width: 1200px;\n' +
  '    margin: 40px auto;\n' +
  '    padding: 25px 20px 0 20px;\n' +
  '}\n\n' +
  '.hizmet-tab-alani input[type="radio"],\n' +
  '.alt-panel {\n' +
  '    display: none;\n' +
  '}\n' +
  '#tab-dil:checked ~ .hizmet-tab-panelleri-kapsayici #panel-dil, #tab-yaz:checked ~ .hizmet-tab-panelleri-kapsayici #panel-yaz, #tab-uni:checked ~ .hizmet-tab-panelleri-kapsayici #panel-uni,\n' +
  '#dil-ing:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-dil-ing, #dil-usa:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-dil-usa,\n' +
  '#yaz-ing:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-ing, #yaz-isvicre:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-isvicre, #yaz-almanya:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-almanya, #yaz-kanada:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-kanada, #yaz-italya:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-italya, #yaz-japonya:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-japonya, #yaz-amerika:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-yaz-amerika,\n' +
  '#uni-isvicre:checked ~ .hizmet-tab-ana-icerik-cerceve #panel-uni-isvicre,\n' +
  '#yas-13-15:checked ~ #panel-yas-13-15, #yas-16-18:checked ~ #panel-yas-16-18 {\n' +
  '    display: block;\n' +
  '}\n\n' +
  'input:checked + .alt-tab-etiket,\n' +
  'input:checked + .ana-tab-etiket {\n' +
  '    background: #e74c3c;\n' +
  '    color: #fff;\n' +
  '    border-color: transparent;\n' +
  '}\n';

let i = s.indexOf(markerBig);
if (i === -1) throw new Error('markerBig not found');
let j = s.indexOf('\n.cerceve-kutu.toronto-aktivite-kutu .rozet-grid {', i);
if (j === -1) throw new Error('toronto aktivite marker not found');
s = s.slice(0, i) + s.slice(j);

i = s.indexOf(blockSmall);
if (i === -1) throw new Error('blockSmall not found');
s = s.slice(0, i) + s.slice(i + blockSmall.length);

const mediaHizmet =
  '\n.hizmet-tab-alani { padding: 14px 10px; margin: 20px 0; }\n' +
  '    .tab-ic-icerik { flex-direction: column; padding: 20px; gap: 20px; }\n\n' +
  '    .ana-tab-etiket {\n' +
  '        width: auto;\n' +
  '        padding: 9px 16px;\n' +
  '        font-size: 14px;\n' +
  '        margin-right: 8px;\n' +
  '        margin-bottom: 8px;\n' +
  '    }\n' +
  '    .alt-tab-etiket { font-size: 12px; padding: 6px 12px; }\n' +
  '    .tab-aksiyon {\n' +
  '        width: 100%;\n' +
  '        align-items: center;\n' +
  '    }\n' +
  '    .ana-buton { width: 100%; }\n' +
  '    .sehir-buton { width: auto; max-width: none; }\n';

i = s.indexOf(mediaHizmet);
if (i === -1) throw new Error('mediaHizmet block not found');
s = s.slice(0, i) + s.slice(i + mediaHizmet.length);

fs.writeFileSync(p, s);
console.log('OK: hizmet-tab blocks removed');
