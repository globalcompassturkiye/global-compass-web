# Tasarım iskeleti — Faz 1 envanteri

**Tarih:** 2026-04-14  
**Kapsam:** Depodaki tüm `index.html` dosyaları (ödeme sayfaları dahil).  
**Yöntem:** Otomatik tarama (`<body class="…">` sıklığı, `blog-yazi-detay` / `icerik-alani` metin araması) + manuel şablon eşlemesi.

---

## 1. Özet sayılar

| Metrik | Değer |
|--------|------:|
| Toplam `index.html` | **89** |
| `article` / içerik alanında `icerik-alani` geçen sayfa | **89** (tümü) |
| `blog-yazi-detay` kullanan sayfa | **23** |
| `blog-yazi-sayfa-mobil-ux` (`body`) | **23** |
| `immerse-education-page` (`body`) | **6** |

---

## 2. Şablon aileleri ve referans sayfalar

Aynı “blog yazı detay” iskeletini paylaşan içerikler için **tek referans** seçimi; yeni sayfa / konsolidasyon için bu URL’ler kullanılabilir.

| Aile | Yaklaşık kapsam | Referans sayfa (URL yolu) | Not |
|------|-----------------|---------------------------|-----|
| **A — Yaz okulu okul (Immerse)** | Program rozetleri, `cerceve-kutu` + `icerik-kutusu`, sekmeler, form | `/yurt-disi-yaz-okullari/japan/tokyo/immerse-education/` | `immerse-education-page` + uzun `sayfa-yurt-disi-yaz-okullari-…-immerse-education` gövde sınıfı |
| **B — Yaz okulu okul (varyant)** | Investin, Kings Yaz, ORA, Alpadia, Sportech, Chantemerle, Swiss… | `/yurt-disi-yaz-okullari/uk/london/investin/` (örnek) | A ile aynı ana omurga; `body`’de marka/şehir önekli sınıflar çeşitli |
| **C — Blog yazısı (standart)** | Breadcrumb, `blog-yazi-detay`, içindekiler / yönlendirme kuralları | Kurallardaki `blog-yazi-detay-standardi` ile uyumlu örnek yazılar | 8 yazı `blog-yazi-detay` taşıyor |
| **D — Hizmet / kurumsal** | Ana metin + bazen form | `/iletisim/`, `/hakkimizda/` | Genelde tek sütun `icerik-alani` |
| **E — Ülke / şehir hub** | Kart listeleri, `okul-liste-kapsayici`, `yonlendirme-karti` | `/yurt-disi-yaz-okullari/uk/` | `sayfa-yurt-disi-yaz-okullari-uk` tipi `body` |
| **F — Dil okulları (Kings vb.)** | Okul sayfası, sık `sayfa-kings-education` + şube | `/yurt-disi-dil-okullari/uk/london/kings-education/` | `body`’de `sayfa-kings-education` + lokasyon modifier |
| **G — Ödeme / sonuç** | Minimal | `payment/`, `payment-ok/`, `payment-failed/` | İçerik iskeleti diğerlerinden ayrı |

---

## 3. Ortak bileşen envanteri (tekrar eden bloklar)

Projede zaten kurallarla tanımlı veya çok sayfada geçen yapılar:

| Bileşen | Tipik sınıflar / kalıp | Konsolidasyon notu |
|---------|-------------------------|---------------------|
| Ana içerik sarmalayıcı | `article.icerik-alani` | Tüm `index.html` — zaten küresel |
| Blog yazı düzeni | `blog-yazi-detay`, `blog-yazi-layout`, `blog-yazi-ana`, yan panel | 23 sayfa — **A/B/C** ailesi |
| Çerçeve + rozet | `cerceve-kutu`, `icerik-kutusu`, `rozet-grid`, `icerik-kutusu-grid`, `yatay-*`, `rozet-kart` | `style.css` içinde ortak grid kuralları |
| Madde listesi | `kutu-liste` | Global `■` + sayfa istisnaları (disk vb.) — birleştirme adayı |
| Bilgi formu | `iletisim-form-alani`, `kirmizi-kutu`, `bilgi-form-bant-baslik` | Form + bant tekrarı |
| Program seçim bandı | `kirmizi-kutu`, `okul-liste-kapsayici`, `modern-okul-listesi`, `premium-liste-kart` | `program-secim-bandi-standardi` kuralı |
| Alt yönlendirme | `section.alt-yonlendirme-alani`, `div.yonlendirme-karti`, `a.kart-link` | `yonlendirme-karti-teklik` kuralı |
| Mobil içindekiler | `blog-mobil-icindekiler-wrap`, `london-mobil-icindekiler-giris-alti` (örnek) | İsim çeşitliliği — Faz 2’de tek isim |

---

## 4. `body` sınıfları — sınıflandırma

### 4.1 Yüksek tekrar (küresel veya yarı küresel)

| Sınıf | Sayfa sayısı | Rol |
|-------|---------------|-----|
| `sayfa-blog` | 19 | Blog kökü / kategori / yazı |
| `sayfa-blog-kategori` | 11 | Kategori indeksleri |
| `sayfa-yurt-disi-yaz-okullari` | 12 | Yaz okulları ağacı |
| `blog-yazi-sayfa-mobil-ux` | 23 | Mobil TOC / UX |
| `sayfa-kings-education` | 6 | Dil okulları Kings şablonu |

### 4.2 Tek veya çok nadir (sayfa / marka özel — birleştirme adayı veya gerçek istisna)

`body` üzerinde **yaklaşık 50+ farklı** ek sınıf var; çoğu `sayfa-yurt-disi-*` veya `sayfa-kings-education-*` gibi **konum/marka** önekli. Örnekler:

- `sayfa-yurt-disi-yaz-okullari-uk-london-immerse-education`, `…-japan-tokyo-immerse-education`, …
- `sayfa-kings-education-boston`, `…-new-york`, …
- `oxford-royale-ny-sayfa`, `oxford-royale-cambridge-sayfa`, `investin-page`, `sportech-academy-page`, `sayfa-chantemerle`, …

**Yorum:** Aynı HTML iskeletinde farklı `body` sınıfları yalnızca **scoped CSS** için kullanılıyor. Faz 2–3’te hedef: gerçekten gerekli olanları **modifier** veya **data-** attribute / üst kapsayıcı ile sadeleştirmek.

---

## 5. Sayfa özel sınıflar — üç kova (manuel)

| Kova | Anlam | Örnek | Aksiyon (sonraki fazlar) |
|------|--------|-------|---------------------------|
| **Gerekli** | Tek sayfaya özgü içerik veya ölçü | `oxford-royale-ny-sayfa` altındaki `#ora-ny-program-detay` | Koru veya `data-program="ora-ny"` gibi semantik isim |
| **Varyant** | Aynı bileşenin 2–3 görünümü | `immerse-education-page` vs düz yaz okulu | Tek `body` sınıfı + BEM modifier |
| **Miras / gereksiz** | Kopyala-yapıştır, artık kullanılmayan | Eski uzun `sayfa-*` zincirleri | Ölü CSS taraması ile kaldır |

---

## 6. Faz 2 için önerilen öncelik sırası

1. **`blog-yazi-detay` ailesi (23 sayfa):** HTML yapı eşlemesi + gereksiz `body` sınıfı azaltma.  
2. **`kutu-liste` + liste işareti:** Global kural + istisnalar tek tabloda.  
3. **Form + kırmızı bant:** `iletisim-form-alani` tek markup; `site-iletisim-form.css` ile hizalama.  
4. **`sayfa-yurt-disi-yaz-okullari-*` gövde sınıfları:** Aynı şablonda tek `sayfa-yurt-disi-yaz-okullari` + alt `data-page` veya `main` id.

---

## 7. Envanteri yenileme

PowerShell (repo kökünde):

```powershell
$files = Get-ChildItem -Recurse -Filter index.html | Where-Object { $_.FullName -notmatch 'node_modules' }
$freq = @{}
foreach ($f in $files) {
  $t = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
  if ($t -match '<body[^>]*class="([^"]*)"') {
    foreach ($c in ($Matches[1] -split '\s+')) { if ($c) { if ($null -eq $freq[$c]) { $freq[$c] = 0 }; $freq[$c]++ } }
  }
}
$freq.GetEnumerator() | Sort-Object { -$_.Value }, Name | Select-Object -First 50
```

---

*Bu doküman Faz 1 “envanter ve sınıflandırma” çıktısıdır; kod değişikliği gerektirmez.*

---

## Faz 2 tamamlandı

- **Token’lar + `kutu-liste` istisna tablosu + şablon sözleşmesi:** [tasarim-iskelet-faz2.md](./tasarim-iskelet-faz2.md)
- **Cursor kuralı:** `.cursor/rules/tasarim-sablon-faz2-sozlesme.mdc`
- **Kod:** `style.css` içinde `:root` genişletildi; `article.icerik-alani .rozet-grid.icerik-kutusu-grid` ve global `.kutu-liste li::before` rengi bu token’lara bağlandı.

### Faz 3 tamamlandı (pilot)

- [tasarim-iskelet-faz3.md](./tasarim-iskelet-faz3.md) — Tokyo Immerse `body` uzun sınıfı kaldırıldı; ilgili CSS `body.immerse-education-page` + Tokyo’ya özgü `#id` / sınıflarla güncellendi.

### Faz 4 tamamlandı

- [tasarim-iskelet-faz4.md](./tasarim-iskelet-faz4.md) — `css/` içinde referansı olmayan uzun `body` sınıfları 6 sayfada kaldırıldı; regresyon kontrol listesi eklendi.

### Faz 5 tamamlandı

- [tasarim-iskelet-faz5.md](./tasarim-iskelet-faz5.md) — SBC Canford: uzun `body` sınıfı `sbc-canford-yaz-okulu-sayfa` + `sayfa-yurt-disi-yaz-okullari`; `style.css` seçicileri güncellendi.
