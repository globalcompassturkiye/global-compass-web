# Aşama 0 — Inline `<script>` envanteri (JSON-LD hariç)

Tarih: 2026-03-31. **Toplam çalıştırılabilir inline blok:** 55. **Benzersiz içerik:** 6 (SHA256 ilk 8 bayt hex).

## Yöntem

- Tüm `*.html` tarandı; `<script>...</script>` eşleşmeleri alındı.
- **Hariç tutulanlar:** `type="application/ld+json"` (SEO JSON-LD — dokunulmadı), `src=` ile harici dosya.
- Boş gövde atlandı. Gruplama: gövde metni normalize edilip (tek boşluk) SHA256 özeti.

## Sınıflandırma özeti

| Grup | Sayfa sayısı | Kısa tanım | Birleştirme (Aşama 1+) |
|------|----------------|------------|------------------------|
| **G1** | 30 | `iletisim-formu`, IIFE, `kimlik`: `input[name="kimlik"]:checked`, aynı Worker `.../iletisim` | Tek modül + evrensel `kimlik` seçici (radio) |
| **G2** | 21 | Aynı form/endpoint; `kimlik`: `input[type="radio"][name^="kimlik"]:checked` | G1 ile tek kod; seçici tek satırda birleştirilir |
| **G3** | 1 | Üniversite hub; G1 ile neredeyse aynı (küçük fark / trim) | G1 modülüne dahil |
| **G4** | 1 | İletişim sayfası; IIFE yok, `.trim()` kullanımı | G1 ile aynı mantık; tek API |
| **G5** | 1 | `payment/ru` — `odeme-formu`, sipariş/ödeme akışı | Ayrı `site-odeme.js` (veya ru/tr ortak parametre) |
| **G6** | 1 | `payment/tr` — G5 ile aynı aile, dil/yorum farkı | G5 ile birlikte |

**Dış script (bu envanterde yok):** `nav-submenu.js`, `header-offset.js`, `blog.js`, vb. zaten `src` + `defer`.

**Blog sayfaları:** Bu taramada inline `<script>` (ld+json dışı) çıkmadı; yalnızca harici script + JSON-LD.

## Grup G1 — hash `5fe3671becbdd504` — 30 sayfa

### Dosyalar
- yurt-disi-burs-firsatlari/index.html
- yurt-disi-dil-okullari/index.html
- yurt-disi-dil-okullari/uk/bournemouth/index.html
- yurt-disi-dil-okullari/uk/index.html
- yurt-disi-dil-okullari/uk/london/index.html
- yurt-disi-dil-okullari/uk/london/kings-education/index.html
- yurt-disi-dil-okullari/uk/oxford/index.html
- yurt-disi-dil-okullari/uk/oxford/kings-education/index.html
- yurt-disi-dil-okullari/usa/boston/index.html
- yurt-disi-dil-okullari/usa/boston/kings-education/index.html
- yurt-disi-dil-okullari/usa/index.html
- yurt-disi-dil-okullari/usa/los-angeles/index.html
- yurt-disi-dil-okullari/usa/los-angeles/kings-education/index.html
- yurt-disi-dil-okullari/usa/new-york/index.html
- yurt-disi-dil-okullari/usa/new-york/kings-education/index.html
- yurt-disi-online-egitim/index.html
- yurt-disi-yaz-okullari/index.html
- yurt-disi-yaz-okullari/japan/index.html
- yurt-disi-yaz-okullari/uk/bournemouth/index.html
- yurt-disi-yaz-okullari/uk/bournemouth/kings-education/index.html
- yurt-disi-yaz-okullari/uk/cambridge/immerse-education/index.html
- yurt-disi-yaz-okullari/uk/cambridge/index.html
- yurt-disi-yaz-okullari/uk/cambridge/oxford-royale-academy/index.html
- yurt-disi-yaz-okullari/uk/index.html
- yurt-disi-yaz-okullari/uk/london/immerse-education/index.html
- yurt-disi-yaz-okullari/uk/london/index.html
- yurt-disi-yaz-okullari/uk/london/investin/index.html
- yurt-disi-yaz-okullari/uk/oxford/immerse-education/index.html
- yurt-disi-yaz-okullari/uk/oxford/index.html
- yurt-disi-yuksek-lisans-mba/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
(function() { var form = document.getElementById('iletisim-formu'); if (!form) return; form.addEventListener('submit', function(e) { e.preventDefault(); var buton = form.querySelector('button[type="submit"]'); if (buton) buton.disabled = true; var payload = { ad: (form.querySelector('[name="ad"]') || {}).value || '', soyad: (form.querySelector('[name="soyad"]') || {}).value || '', email: (form.querySelector('[name="email"]') || {}).value || '', telefon: (form.querySelector('[name="telefon"]') || {}).value || '', kimlik: ((form.querySelector('input[name="kimlik"]:checked')) || {}).value || '', mesaj: (form.querySelector('[name="mesaj"]') || {}).value || '' }; fetch('https://global-compass-paytr.canmuratsubat.workers.dev/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/js
... [kesildi, toplam 1134 karakter]
```

## Grup G2 — hash `9cec3f574a5d918c` — 21 sayfa

### Dosyalar
- yurt-disi-dil-okullari/uk/bournemouth/kings-education/index.html
- yurt-disi-lise/degisim-programlari/index.html
- yurt-disi-lise/index.html
- yurt-disi-yaz-okullari/canada/index.html
- yurt-disi-yaz-okullari/canada/toronto/immerse-education/index.html
- yurt-disi-yaz-okullari/canada/toronto/index.html
- yurt-disi-yaz-okullari/germany/frankfurt/alpadia/index.html
- yurt-disi-yaz-okullari/germany/frankfurt/index.html
- yurt-disi-yaz-okullari/germany/freiburg/alpadia/index.html
- yurt-disi-yaz-okullari/germany/freiburg/index.html
- yurt-disi-yaz-okullari/germany/index.html
- yurt-disi-yaz-okullari/italy/index.html
- yurt-disi-yaz-okullari/italy/milan/index.html
- yurt-disi-yaz-okullari/italy/milan/sportech-academy/futbol/index.html
- yurt-disi-yaz-okullari/italy/milan/sportech-academy/index.html
- yurt-disi-yaz-okullari/switzerland/chantemerle/index.html
- yurt-disi-yaz-okullari/switzerland/index.html
- yurt-disi-yaz-okullari/switzerland/swiss-education-academy/index.html
- yurt-disi-yaz-okullari/usa/index.html
- yurt-disi-yaz-okullari/usa/new-york/index.html
- yurt-disi-yaz-okullari/usa/new-york/oxford-royale-academy/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
(function() { var form = document.getElementById('iletisim-formu'); if (!form) return; form.addEventListener('submit', function(e) { e.preventDefault(); var buton = form.querySelector('button[type="submit"]'); if (buton) buton.disabled = true; var payload = { ad: (form.querySelector('[name="ad"]') || {}).value || '', soyad: (form.querySelector('[name="soyad"]') || {}).value || '', email: (form.querySelector('[name="email"]') || {}).value || '', telefon: (form.querySelector('[name="telefon"]') || {}).value || '', kimlik: ((form.querySelector('input[type="radio"][name^="kimlik"]:checked')) || {}).value || '', mesaj: (form.querySelector('[name="mesaj"]') || {}).value || '' }; fetch('https://global-compass-paytr.canmuratsubat.workers.dev/iletisim', { method: 'POST', headers: { 'Content-Type': 
... [kesildi, toplam 1149 karakter]
```

## Grup G3 — hash `ccf90233dc990890` — 1 sayfa

### Dosyalar
- yurt-disi-universite/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
(function() { var form = document.getElementById('iletisim-formu'); if (!form) return; form.addEventListener('submit', function(e) { e.preventDefault(); var buton = form.querySelector('button[type="submit"]'); if (buton) buton.disabled = true; var payload = { ad: (form.querySelector('[name="ad"]') || {}).value || '', soyad: (form.querySelector('[name="soyad"]') || {}).value || '', email: (form.querySelector('[name="email"]') || {}).value || '', telefon: (form.querySelector('[name="telefon"]') || {}).value || '', kimlik: ((form.querySelector('[name="kimlik"]:checked')) || {}).value || '', mesaj: (form.querySelector('[name="mesaj"]') || {}).value || '' }; fetch('https://global-compass-paytr.canmuratsubat.workers.dev/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/json' }
... [kesildi, toplam 1129 karakter]
```

## Grup G4 — hash `5d9c40082e74358e` — 1 sayfa

### Dosyalar
- iletisim/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
document.getElementById('iletisim-formu').addEventListener('submit', function(e) { e.preventDefault(); var form = e.target; var buton = form.querySelector('button[type="submit"]'); buton.disabled = true; var payload = { ad: form.querySelector('[name="ad"]').value.trim(), soyad: form.querySelector('[name="soyad"]').value.trim(), email: form.querySelector('[name="email"]').value.trim(), telefon: form.querySelector('[name="telefon"]').value.trim(), kimlik: (form.querySelector('[name="kimlik"]:checked') || {}).value || '', mesaj: form.querySelector('[name="mesaj"]').value.trim() }; fetch('https://global-compass-paytr.canmuratsubat.workers.dev/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) .then(function(res) { if (!res.ok) throw n
... [kesildi, toplam 1035 karakter]
```

## Grup G5 — hash `764f178afecdf482` — 1 sayfa

### Dosyalar
- payment/ru/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
(function() { var form = document.getElementById('odeme-formu'); var hataKutusu = document.getElementById('odeme-hata'); var buton = document.getElementById('odeme-buton'); var tutarInput = document.getElementById('tutar'); var siparisInput = document.getElementById('siparis-id'); var siparisBilgi = document.getElementById('siparis-bilgi'); var tutarGorunum = document.getElementById('tutar-gorunum'); function gosterHata(mesaj) { if (!hataKutusu) return; hataKutusu.textContent = mesaj; hataKutusu.style.display = 'block'; } function temizleHata() { if (!hataKutusu) return; hataKutusu.textContent = ''; hataKutusu.style.display = 'none'; } // При загрузке страницы читаем id из URL и получаем данные заказа (function hazirlaSiparis() { var params = new URLSearchParams(window.location.search || '
... [kesildi, toplam 4158 karakter]
```

## Grup G6 — hash `8daf04a57658fd99` — 1 sayfa

### Dosyalar
- payment/tr/index.html

### İçerik özeti (ilk dosya, normalize boşluk)
```
(function() { var form = document.getElementById('odeme-formu'); var hataKutusu = document.getElementById('odeme-hata'); var buton = document.getElementById('odeme-buton'); var tutarInput = document.getElementById('tutar'); var siparisInput = document.getElementById('siparis-id'); var siparisBilgi = document.getElementById('siparis-bilgi'); var tutarGorunum = document.getElementById('tutar-gorunum'); function gosterHata(mesaj) { if (!hataKutusu) return; hataKutusu.textContent = mesaj; hataKutusu.style.display = 'block'; } function temizleHata() { if (!hataKutusu) return; hataKutusu.textContent = ''; hataKutusu.style.display = 'none'; } // Sayfa yüklenince URL'den id'yi oku ve siparişi getir (function hazirlaSiparis() { var params = new URLSearchParams(window.location.search || ''); var url
... [kesildi, toplam 4156 karakter]
```

## Aşama 1 (uygulandı — 2026-03-31)

- **`/js/iletisim-formu.js`:** G1–G4 iletişim formu tek dosyada; `kimlik` hem `input[type="radio"][name^="kimlik"]:checked` hem `input[name="kimlik"]:checked` ile okunur; metin alanları `.trim()` ile gönderilir; `DOMContentLoaded` ile güvenli bağlama.
- **53** sayfada inline `<script>` kaldırılıp `<script src="/js/iletisim-formu.js" defer></script>` eklendi (Aşama 0’daki G1–G4 listesi).
- **`yurt-disi-yaz-okullari/japan/tokyo/index.html`** ve **`.../tokyo/immerse-education/index.html`:** Form vardı, inline gönderim yoktu; aynı harici script eklendi (toplam **55** sayfa `iletisim-formu.js` kullanıyor).
- **JSON-LD** değiştirilmedi. Ödeme (G5/G6) Aşama 2’de harici dosyaya taşındı.

## Aşama 2 (uygulandı — 2026-03-31)

- **`/js/odeme-formu.js`:** `payment/ru/` ve `payment/tr/` inline ödeme akışı tek dosyada; dil metinleri ve `toLocaleString` locale’i `document.documentElement.lang` ile (`ru` / aksi halde `tr`) seçilir.
- **RU** istek gövdesinde `merchant_ok_url` / `merchant_fail_url` (önceki gibi) korunur; **TR** gövdesinde bu alanlar yoktur.
- **`payment/tr/index.html`:** footer KVKK/çerez link metinlerinde bozuk karakterler **Metni** olarak düzeltildi.
- **JSON-LD** ve **`title` / `meta description`** metinlerine dokunulmadı.

## JS inline taşıma — özet ve kalan iş

**Bu belgedeki “JS hattı” yalnızca çalıştırılabilir inline `<script>` kaldırma / harici dosyaya taşımadır.**

| Aşama | Kapsam | Durum |
|--------|--------|--------|
| **0** | Envanter (JSON-LD ve `src` hariç) | Tamam |
| **1** | İletişim formu → `/js/iletisim-formu.js` | Tamam |
| **2** | Ödeme → `/js/odeme-formu.js` | Tamam |
| **3+** (JS için) | — | **Kalan yok** |

**2026-03-31 doğrulama:** Tüm `*.html` içinde `fetch(` / `addEventListener` / `onclick` / `javascript:` ile çalışan gömülü kod yok; `<script>` yalnızca **`src`** (harici `.js`) ve **`type="application/ld+json"`** (SEO — bilerek aynı bırakıldı).

Aşağıdaki **Aşama 3** ve **Aşama 4** başlıkları **CSS/HTML** (başlık standardı, `site-odeme.css`, `baslik-iki-satir`) içindir; JS inline taşımanın devam aşaması değildir.

## Aşama 3 — CSS/HTML (uygulandı — 2026-03-31)

- **`h2.kutu-baslik` + `<br>`:** Repo tarandı; ikinci satırda `span.vurgu-renk` veya SSS için `h2.kutu-baslik .tts-alt-satir` ile eşleşen `span` (üç `s` önekli sınıf adı) kullanımı tutarlı, düzeltme gerektiren örnek yok. `css/style.css` içindeki `h2.kutu-baslik` blok yorumu güncellendi.
- **Ödeme sayfaları CSS:** `payment/tr/` ve `payment/ru/` içindeki `<head>` inline `<style>` kaldırıldı; stiller **`/css/site-odeme.css`**. Logo satırındaki `style=""` kaldırıldı (`.odeme-ust-logo-kapsayici`, `.odeme-ust-logo-img`). `title` / `description` / JSON-LD değişmedi.

## Aşama 4 — CSS/HTML (uygulandı — 2026-03-31)

- **`baslik-iki-satir`:** `h2.kutu-baslik` içinde `<br>` + `span.vurgu-renk` kullanan tüm ilgili **`cerceve-kutu`** kapsayıcılarına `baslik-iki-satir` eklendi (toplam **19** kutu, **13** HTML dosyası; daha önce yalnızca Frankfurt Alpadia, Sportech ve Immerse Cambridge’deki **5** kutuda vardı).
- **Stil kaynağı:** `css/style.css` içindeki `.cerceve-kutu.baslik-iki-satir` ve `.kutu-baslik + *` kuralları geçerli; `:has(h2.kutu-baslik br):not(.baslik-iki-satir)` yedek seçici yeni iki satırlı kutularda artık devreye girmez. SSS gri kutuları **`/css/sss.css`** ile uyumlu kalır.
- **`title` / `meta description` / JSON-LD** değiştirilmedi.

