# Faz 1 — `h2` sınıf envanteri ve risk haritası

**Kapsam:** Statik HTML + ortak CSS. **Blog makale gövdesi** (`.blog-yazi-icerik` içindeki `h2`) Faz 0’da ayrıldı; burada yine de **hub / liste** gibi blog şablonlarında geçen sınıflı `h2` sayılır.

**Tarih:** 2026-04-20 (repo taraması)

---

## 1. Özet

| Kaynak | Not |
|--------|-----|
| En sık tekil sınıf (oluşum sayısı) | `kutu-baslik` (~271 oluşum, çoklu `h2`/sayfa) |
| Çift sınıf (sık) | `okul-liste-baslik` + `yonlendirme-karti-baslik` (genelde aynı `h2` üzerinde) |
| Blog hub / kategori | `blog-kart-baslik` |
| Hukuki metinler | `kvkk-bolum-baslik` |
| Program / hero varyantları | `immerse-alt-baslik`, `kings-hero-alt-baslik`, `investin-alt-baslik`, … |

**Tekil `h2` `class` kombinasyonu** (tam `class="..."` dizesi): ~35 civarı; **ayrıştırılmış tekil sınıf adı** sayımı aşağıda.

---

## 2. HTML: tekil sınıf adı frekansı (oluşum)

Aynı sayfada birden fazla `h2` aynı sınıfı kullanabilir; sayı **toplam eşleşme**dır.

| Oluşum | Sınıf |
|--------|--------|
| 271 | `kutu-baslik` |
| 26 | `kvkk-bolum-baslik` |
| 19 | `okul-liste-baslik` |
| 19 | `yonlendirme-karti-baslik` |
| 14 | `blog-kart-baslik` |
| 7 | `immerse-alt-baslik` |
| 5 | `hakkimizda-section-baslik` |
| 4 | `kings-hero-alt-baslik` |
| 3 | `kings-la-baslik-zemin-lacivert` |
| 2 | `ana-sayfa-ortak-h2` |
| 2 | `kings-la-dahil-baslik` |
| 2 | `kings-oxford-kurs-baslik` |
| 1 | `alpadia-alt-baslik`, `ana-sayfa-blog-ozeti-baslik`, `ana-tab-cerceve-ust-bant-baslik`, `futbol-alt-baslik`, `hizmet-section-baslik`, `iletisim-section-baslik`, `investin-alt-baslik`, `isvicre-danisman-paneli-baslik`, `isvicre-strateji-baslik`, `kings-bos-konaklama-sr-only`, `kings-la-baslik-hollywood`, `kings-la-baslik-zemin-kirmizi`, `kings-la-baslik-zemin-turkuaz`, `kings-ny-konaklama-sr-only`, `ora-cam-hero-alt-baslik`, `sportech-academy-alt-baslik` |

**Not:** `kutu-baslik` ile **ikinci sınıf** birlikte kullanımı (`kings-la-dahil-baslik`, `kings-la-baslik-*`) ayrı kombinasyon olarak da geçer.

---

## 3. CSS eşlemesi (ana dosyalar)

### 3.1 `css/style.css`

| Kalıp | Rol |
|--------|-----|
| `h2` (genel) | Site geneli tipografi + `!important` (Faz 0) |
| `article.icerik-alani .cerceve-kutu > h2.kutu-baslik + …` | Rozet grid komşuluk / `:has` zincirleri — **yüksek risk** |
| `.kirmizi-kutu h2.program-secim-hub-baslik`, `h2.bilgi-form-bant-baslik` | Kırmızı bant / hub iki satır — **yüksek risk** |
| `body.sayfa-hizmetlerimiz … h2.hizmet-section-baslik` | Hizmetler sayfası |
| `h2.kings-oxford-kurs-baslik` | Kings Oxford / Bournemouth |
| `h2.sayfa-bolum-basligi.sss-baslik`, `h2.gri-cerceve-baslik.sss-baslik` | SSS ile ilişkili başlıklar |
| `.sayfa-kings-education .kings-london-toc-outer .blog-yazi-ana h2[id]:is(.gri-cerceve-baslik, .sayfa-bolum-basligi)` | **İçindekiler / kaydırma hedefi** — sınıf kalkınca seçici revizyonu şart |
| `body.ana-sayfa … h2.ana-sayfa-blog-ozeti-baslik` | Ana sayfa blog özeti |
| `article.icerik-alani h2.kutu-baslik.kutu-baslik-tick` | Özel liste başlığı |
| `.iletisim-section-baslik` | İletişim bölüm başlığı |

### 3.2 `css/blog.css`

| Kalıp | Rol |
|--------|-----|
| `.blog-yazi-icerik h2` | Makale gövdesi (Faz 0 muafiyeti) |
| `.blog-faq-bolumu h2` | Blog SSS bölümü |

### 3.3 `css/sss.css`

| Kalıp | Rol |
|--------|-----|
| `.sayfa-sss .sss-sss-kutu h2.sss-baslik` | SSS sayfası |

### 3.4 `css/site-iletisim-form.css`

| Kalıp | Rol |
|--------|-----|
| `.hizmet-alanlari-baslik … > h2:has(> .vurgu-satir)` | Bilgi formu bandı — **sınıfsız `h2` ile uyumlu** (zaten `:has` ile) |
| `.ielts-cta … h2`, `.blog-yazi-icerik .iletisim-form-alani … h2` | Dar form / IELTS |

### 3.5 `css/site-yonlendirme-kart.css`

| Kalıp | Rol |
|--------|-----|
| `.yonlendirme-karti h2`, `.okul-liste-kapsayici … h2` | Yönlendirme kartı içi başlıklar |

---

## 4. Risk sıralaması (Faz 2 öncesi)

1. **Kings London TOC:** `h2[id]:is(.gri-cerceve-baslik, .sayfa-bolum-basligi)` — sınıf kalkınca `h2[id]` veya `section[id] > h2` ile yeniden yazılmalı.
2. **`:has` + komşu kardeş:** `h2.kutu-baslik + p:has(+ .rozet-grid)` — `h2` sınıfsız olunca seçiciler `> h2 + p:has(+ .rozet-grid)` olmalı (aynı DOM yapısı şart).
3. **Kırmızı kutu:** `h2.program-secim-hub-baslik` / `h2.bilgi-form-bant-baslik` — üst `.kirmizi-kutu` veya `.hizmet-alanlari-baslik` üzerinden taşınmalı.
4. **Çift sınıf:** `okul-liste-baslik` + `yonlendirme-karti-baslik` — stil hangi bileşene aitse sınıf **`h2`’den** kart köküne alınmalı.
5. **SR-only başlıklar:** `kings-*-konaklama-sr-only` — erişilebilirlik sınıfı `h2`’de kalabilir veya `span`/`div` ile taşınır (ayrı karar).

---

## 5. Faz 2 için önerilen “hedef bağlam” (taslak)

| Mevcut sınıf (veya grup) | Olası yeni bağlam seçicisi (özet) |
|--------------------------|-----------------------------------|
| `kutu-baslik` | `.cerceve-kutu > h2`, `.site-gri-cerceve-kutu > h2` (ilk çocuk); istisnalar sayfa sınıfıyla |
| `kvkk-bolum-baslik` | `article … section h2` veya madde sarmalayıcı sınıfı |
| `blog-kart-baslik` | `.blog-yazi-karti h2` |
| `okul-liste-baslik` / `yonlendirme-karti-baslik` | `.okul-liste-kapsayici …` / `.yonlendirme-karti` (zaten kısmen var) |
| `hizmet-section-baslik` | `.hizmetlerimiz-sayfa section h2` |
| `iletisim-section-baslik` | `.iletisim-yontem-section h2` veya `#iletisim-yontem-baslik` |

---

## 6. Yeniden üretim

PowerShell (repo kökü):

```powershell
# Tekil sınıf adı frekansı
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  Select-String -Path $_.FullName -Pattern '<h2[^>]*class="([^"]+)"' -AllMatches
} | ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value -split '\s+' } |
  Where-Object { $_ } | Group-Object | Sort-Object Count -Descending
```

---

## 7. Faz 2 — tamamlandı (2026-04-20)

**`h2`:** Tüm statik `*.html` dosyalarında `<h2>` üzerinde **`class` yok**. `css/**/*.css` içinde **`h2.<sınıf>`** / **`h2:is(.…)`** seçici yok.

**`kutu-baslik` kaldırıldı (2026-04-20, devam):** `*.html` içinde **`kutu-baslik` sınıfı kullanılmıyor**. Rozet komşuluk zincirleri **`> h3 + p`** ile; Kings USA mini kutularda başlık **`.kings-mini-kutu > h3`** / **`.kings-mini-kutu-sik > h3`** (istisna: **`h3.kings-la-mini-baslik-kirmizi`**). Londra TOC kaydırma ofseti tüm **`h3[id]`** için geçerli.

**Doğrulama:** `node tools/h2-faz2-verify-no-class.mjs`, `node tools/kutu-baslik-verify-gone.mjs` (çıkış `0` = uygun).

---

*Bu belge: Faz 1 envanteri + Faz 2 / `kutu-baslik` temizliği notu. Diğer başlık yardımcı sınıfları (`rozet-baslik`, `kutu-baslik-tick` vb.) şablonda ayrı tutulur.*
