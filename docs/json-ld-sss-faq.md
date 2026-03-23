# SSS (SSS) bölümü için JSON-LD (FAQPage) entegrasyonu

Sayfada **Sıkça Sorulan Sorular** blokları olduğunda (`.sss-alani`, `.sss-kutu` veya `details.thes-item` yapısı), arama motorları için **`FAQPage`** şeması eklenmelidir. Görünüm HTML ile aynı kalır; yapılandırılmış veri ayrı bir `<script type="application/ld+json">` içinde verilir.

## 1. HTML’de SSS nasıl tanınır?

Projede tipik yapı:

```html
<div class="gri-cerceve-kutu">
            <h2 class="kutu-baslik sss-baslik">…<span class="…">Sıkça Sorulan Sorular (SSS)</span></h2>
            <div class="sss-alani">
                <details class="sss-item">
                    <summary>Soru metni (tercihen görünen metinle birebir)</summary>
                    <div class="sss-icerik">
                        <p>Cevap metni…</p>
                    </div>
                </details>
                …
            </div>
```

Bazı sayfalarda sınıf `sss-kutu` / `sas-gri-kutu` ile de kullanılıyor; önemli olan **`details` + `summary` + cevap içeriği** aynı sayfada olmasıdır.

**Not:** `summary` içinde “1. …” gibi numara kullanıyorsanız, JSON-LD’deki `name` alanında da **aynı metni** kullanın (Londra örneğinde şu an numarasız; tutarlılık için ya HTML’den numarayı kaldırın ya da JSON’a ekleyin).

## 2. Hangi şema?

- **`@type`: `FAQPage`**
- **`mainEntity`**: dizisi; her eleman:
  - `@type`: `Question`
  - `name`: soru (düz metin, HTML etiketi yok)
  - `acceptedAnswer`: `{ "@type": "Answer", "text": "…" }` — cevap paragrafı (düz metin, HTML etiketi yok)

**Önemli:** Google yönergeleri gereği `name` ve `text` alanları, sayfada kullanıcıya gösterilen **görünür içerikle** uyumlu olmalı; kopya-soru/cevap eklemeyin.

## 3. Yerleştirme

- **Sayfa sonunda**, `</body>` öncesi, diğer inline script’lerden **önce veya sonra** (tercih: mevcut nav script’inden önce).
- Zaten **`@graph`** (WebPage, Organization, BreadcrumbList vb.) kullanılıyorsa iki seçenek:
  1. **`@graph` içine** ek bir nesne olarak `FAQPage` (önerilen: tek script, tek `@context`):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", ... },
    { "@type": "FAQPage",
      "@id": "https://www.globalcompass.com.tr/yol/sayfa/#faq",
      "url": "https://www.globalcompass.com.tr/yol/sayfa/",
      "mainEntity": [ ... ]
    }
  ]
}
```

  2. **Ayrı** bir `<script type="application/ld+json">` içinde sadece `FAQPage` (örnek: `yurt-disi-dil-okullari/uk/london/index.html`).

İkisi de geçerlidir; tek dosyada **`@graph` birleştirmek** bakımı kolaylaştırır.

## 4. Örnek minimal FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Soru tam metni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cevap tek paragraf olarak, sayfadaki metinle uyumlu."
      }
    }
  ]
}
```

Çok paragraflı cevaplar: `text` içinde tek string olarak birleştirilebilir (boşlukla veya `\n` ile).

## 5. Kontrol listesi (yeni sayfa veya SSS güncellemesi)

- [ ] Her `details` / soru için bir `Question` var mı?
- [ ] Soru/cevap sayfadaki metinle tutarlı mı?
- [ ] `canonical` URL ile `FAQPage` URL’si (veya `WebPage` `url`) aynı mı?
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) veya Schema validator ile doğrulama

## 6. Referans sayfa

- `yurt-disi-dil-okullari/uk/london/index.html` — SSS HTML + ayrı `FAQPage` JSON-LD örneği.

## 7. Cambridge / Oxford Royale gibi sayfalarda SSS yoksa

`FAQPage` **eklenmez**; yalnızca içerikte SSS bölümü olan sayfalarda kullanın.
