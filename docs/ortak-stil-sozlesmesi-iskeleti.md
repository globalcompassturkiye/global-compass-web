# Ortak Stil Sozlesmesi Iskeleti (Asama 3)

Bu dokuman, override temizliginde kullanilacak ortak HTML->CSS baglanti sozlesmesini tanimlar.
Hedef: sayfa-ozel gorunumu degil, ortak bilesen kombinasyonlarini kullanmak.

## 1) Cekirdek Blok Sozlesmesi

- **Dis cerceve (zorunlu):** `cerceve-kutu`
- **Icerik karti (gerektiginde):** `icerik-kutusu`
- **Bolum basligi:** `h2.kutu-baslik` (alternatif: `h3.kutu-baslik`)
- **Liste:** `ul.kutu-liste`
- **Rozet alanı:** `div.rozet-grid`

### Standart blok kalibi

```html
<div class="cerceve-kutu icerik-kutusu">
  <h2 class="kutu-baslik">...</h2>
  <p>...</p>
  <div class="rozet-grid icerik-kutusu-grid yatay-2">
    <article class="rozet-kart">...</article>
  </div>
</div>
```

## 2) Grid Sozlesmesi

- **Temel grid:** `rozet-grid`
- **Icerik kutusu yardimcisi:** `icerik-kutusu-grid`
- **Kolon secimi:**
  - `yatay-1`
  - `yatay-2`
  - `yatay-3`
  - `yatay-4`
  - `yatay-5`
- **Tek kart ortalama (2 kolon + tek son kart):** `son-kart-ortala`

Kural: Kolon davranisi sayfa-ozel seciciyle degil, bu sinif kombinasyonlariyla verilir.

## 3) SSS Sozlesmesi

- Dis kutu: `div.cerceve-kutu`
- Baslik: `h2` (+ opsiyonel `.vurgu-satir`)
- Icerik: `div.sss-alani`
- Oge: `details.sss-item > summary + div.sss-icerik`

Kural: SSS kutusuna sayfa-ozel renk/spacing override eklenmez; ortak `sss.css` ve `style.css` kullanilir.

## 4) Iletisim Formu Sozlesmesi

- Bolum: `section.iletisim-form-alani`
- Ust bant: `.hizmet-alanlari-baslik.icerik-bilgi-form-bant`
- Beyaz kart: `.iletisim-form-beyaz-cerceve`
- Form: `#iletisim-formu` (davranissal ID korunabilir)

Kural: Formun gorunumu sinif tabanli; `body.sayfa-*` ile gorunum farki verilmez.

## 5) Yonlendirme/Kart Sozlesmesi

- Dis alan: `.okul-liste-kapsayici`
- Liste: `.modern-okul-listesi` veya `.alt-yonlendirme-alani`
- Kart: `.premium-liste-kart` veya `.yonlendirme-karti`

Kural: Kart cizgisi, golge, renk tek kaynak; sayfa bazli alternatif tema yok.

## 6) Yasakli Gorunum Kaliplari

- `body.sayfa-* ... { color/background/border/shadow/padding/margin ... }`
- `#tekil-id ... { gorunum stili ... }`
- Derin secici zinciriyle gorunum (`body.sayfa-x article.y .a .b .c`)
- Yeni `!important` kullanimi

Not: Davranissal ID secicileri (tab/acilir kapanir kontrolu vb.) yalniz davranis icin gecici tutulabilir.

## 7) Donusum Esleme Rehberi (Refaktor Sirasinda)

- `site-gri-cerceve-kutu` -> `cerceve-kutu` (gerekiyorsa `icerik-kutusu` eklenir)
- Sayfa-ozel grid secicisi -> `rozet-grid icerik-kutusu-grid yatay-*`
- Sayfa-ozel baslik sinifi -> `kutu-baslik`
- Sayfa-ozel madde listesi -> `kutu-liste` veya `yaz-konaklama-liste`

## 8) Kabul Kriterleri (Asama 3 Sonu)

- Yeni/duzenlenen bolumlerde bu sozlesme disinda gorunum sinifi yok.
- Ayni tip bloklar farkli sayfalarda ayni class kombinasyonunu kullaniyor.
- Gorunum degisikligi icin sayfa-ozel secici degil, ortak sinif kombinasyonu kullaniliyor.
