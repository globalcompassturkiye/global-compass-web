# Tasarım iskeleti — Faz 2 (token’lar + sözleşme)

**Tarih:** 2026-04-14  
**İlişki:** [Faz 1 envanteri](./tasarim-iskelet-envanter-faz1.md) üzerine inşa edilir.

---

## 1. `:root` tasarım token’ları (`css/style.css`)

Yeni içerik / refaktörde **önce bu değişkenler** kullanılmalı; mevcut sabitler kademeli olarak buraya bağlanır.

| Değişken | Değer / rol |
|----------|-------------|
| `--sayfa-zemin` | Sayfa arka planı |
| `--icerik-yan-gutter` | İçerik yatay boşluk |
| `--site-kart-kenar`, `--site-kart-golge` | Kart kenarlık + gölge |
| `--kirmizi-bant-ust-font-size`, `--kirmizi-bant-alt-font-size` | Kırmızı bant tipografi |
| `--bilgi-istek-form-metin-ust-bosluk` | Bilgi formu üst iç boşluk |
| **`--icerik-rozet-grid-gap`** | `article.icerik-alani .rozet-grid.icerik-kutusu-grid` satır/sütun aralığı (**14px**) |
| **`--icerik-rozet-kart-radius`** | Aynı grid içindeki `.rozet-kart` köşe yuvarlaklığı (**15px**) |
| **`--kutu-liste-marker-renk`** | Global `.kutu-liste li::before` ■ rengi (**#000080**) |

**Not:** Global madde işareti hâlâ `content: "■"` (sabit karakter). Rengi token’dan okur; şekil değişimi istisna bloklarda `::before` kapatılarak yapılır.

---

## 2. `kutu-liste` — varsayılan ve istisnalar

**Varsayılan (çoğu `article.icerik-alani`):** `list-style: none`, madde `li::before { content: "■"; color: var(--kutu-liste-marker-renk); }`.

| Kapsam (CSS seçici özeti) | Madde görünümü | Dosya / not |
|---------------------------|----------------|--------------|
| `.immerse-tokyo-branches-kutu .kutu-liste` | `list-style: disc`, `::before` kapalı | `style.css` — Immerse Tokyo branş |
| `.oxford-royale-ny-sayfa #ora-ny-program-detay .kutu-liste` | `list-style: disc outside`, `::before` kapalı | `style.css` — ORA New York program kutusu |
| `body.sayfa-kings-education-* .kutu-liste.kings-la-liste-sifir` (film / genel alt varyantlar) | Disk + özel padding | `style.css` — LA/NY Kings |
| `.sayfa-kings-education .immerse-detay-kart.kings-london-detay-liste-kart .kutu-liste` | Disk | `style.css` |
| `body.sayfa-kvkk-* .kvkk-metin-kutu .kutu-liste` | Metin sayfaları | `style.css` |
| `.lise-degisim-sol-kalin-liste .kutu-liste` | Özel çizgi / içerik | `style.css` |
| `.kings-oxford-beceri-kutu .kutu-liste` | Oxford beceri kutusu | `style.css` |
| `.almanya-kamp-deneyimi-kutu .kutu-liste` | Almanya kamp | `style.css` |
| `.hakkimizda-sayfa .hakkimizda-icerik-kutu .kutu-liste` | Hakkımızda | `style.css` |
| `ul.kutu-liste.yas-alan-etiketleri` | Etiket satırları | `style.css` |
| `body.sayfa-chantemerle … .kutu-liste li` | Chantemerle kart | `style.css` |

**Ayrı sınıf:** `kutu-liste-sirali` — numaralı / farklı düzen (burs, destinasyon hub); global ■ ile karıştırma.

Yeni istisna eklerken: mümkünse **mevcut bir istisna bloğunu genişlet**; yeni `body.sayfa-foo-bar-baz` zinciri üretme.

---

## 3. Blog / yaz okulu “detay” şablon sözleşmesi

### 3.1 Ortak omurga

- `main#icerik` → `article.icerik-alani` + (içerik tipine göre) `blog-yazi-detay`
- Breadcrumb: `nav.site-haritasi-yolu` + `ol.breadcrumb-kutu`
- Yaz okulu okul sayfaları (A/B ailesi): `blog-yazi-tek-sutun`, `blog-yazi-layout--yan-panel`, `blog-yazi-ana`, isteğe `blog-yan-panel`
- **Referans:** `/yurt-disi-yaz-okullari/japan/tokyo/immerse-education/`

### 3.2 Program detayı + rozet

- Dış: `div.cerceve-kutu.icerik-kutusu`
- Grid: `div.rozet-grid.icerik-kutusu-grid` + `yatay-2` / `dikey` vb.
- Kart: `article.rozet-kart`; ikon + başlık: `div.rozet-ikon.rozet-ikon-tick`, `h3.rozet-baslik`, `p.rozet-metin` veya `ul.kutu-liste`

### 3.3 Bilgi istek formu

- `section.iletisim-form-alani` (ör. `id="bilgi-istek"`)
- Üst bant: `div.kirmizi-kutu` → `h2.bilgi-form-bant-baslik` (`span.ust-satir`, `span.alt-satir-lacivert`)
- Form alanı stilleri: `/css/site-iletisim-form.css`

### 3.4 Program seçim bandı (şehir / ülke hub)

- Kurallar: `.cursor/rules/program-secim-bandi-standardi.mdc`  
- Referans: `yurt-disi-yaz-okullari/uk/london/index.html`

---

## 4. İsimlendirme (yeni sınıf)

- **Tercih:** Bileşen + görev (`program-detay-grid`, `bilgi-form-bant`) — mümkünse **ülke/şehir/marka** adını sınıfta taşıma.
- **Kapsam:** Sayfa özel görünüm için `body`’de tek kısa sınıf veya `#main` / `main[data-page="…"]` düşünün; uzun `sayfa-yurt-disi-yaz-okullari-…` zincirleri yeni sayfada üretilmesin (Faz 3 konusu).
- **Yeni sayfa CSS:** Yalnızca `/css` altında; sayfa klasöründe `.css` yok — mevcut `css-klasor-standardi` kuralı.

---

## 5. Faz 3 öncesi kontrol listesi

- [ ] Yeni rozet grid `gap` / kart `radius` için `:root` token kullanıldı mı?
- [ ] `kutu-liste` istisnası gerçekten gerekli mi, yoksa global + içerik kısaltması yeterli mi?
- [ ] Form markup `iletisim-form-alani` + `kirmizi-kutu` ile uyumlu mu?
- [ ] `title` / `meta description` metnine dokunulmadı mı? (proje kuralı)

---

*Faz 2 kapsamı: token ekleme + dokümantasyon + küçük güvenli refaktör (`icerik-kutusu-grid` ↔ token). Tüm `body` sınıflarının sadeleştirilmesi Faz 3’e bırakıldı.*

---

## Faz 3

- **Gövde sınıfı sadeleştirme ilkesi + Tokyo pilot:** [tasarim-iskelet-faz3.md](./tasarim-iskelet-faz3.md)
- **Cursor:** `.cursor/rules/tasarim-sablon-faz3-body-siniflari.mdc`

## Faz 4

- **Ölü `body` sınıfı temizliği + regresyon:** [tasarim-iskelet-faz4.md](./tasarim-iskelet-faz4.md)
- **Cursor:** `.cursor/rules/tasarim-sablon-faz4-olumsuz-body-sinif.mdc`

## Faz 5

- **SBC Canford uzun `body` → `sbc-canford-yaz-okulu-sayfa`:** [tasarim-iskelet-faz5.md](./tasarim-iskelet-faz5.md)
