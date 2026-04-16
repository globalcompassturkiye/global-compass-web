# Tasarım iskeleti — Faz 5 (SBC Canford: uzun `body` → kısa scope sınıfı)

**Tarih:** 2026-04-14  
**Önceki:** [Faz 4](./tasarim-iskelet-faz4.md)

---

## 1. Amaç

`summer-boarding-courses-canford` sayfasında `body` üzerinde **60+ karakterlik** `sayfa-yurt-disi-yaz-okullari-uk-bournemouth-summer-boarding-courses-canford` sınıfı, `style.css` içinde **100+ seçicide** tekrarlanıyordu. Faz 4’te ertelenen bu refaktör, **tek kısa anlamsal sınıf** ile değiştirildi.

---

## 2. Yeni sözleşme

| Eski | Yeni |
|------|------|
| `body.sayfa-yurt-disi-yaz-okullari-uk-bournemouth-summer-boarding-courses-canford` | `body.sbc-canford-yaz-okulu-sayfa` |

**HTML** (`yurt-disi-yaz-okullari/uk/bournemouth/summer-boarding-courses-canford/index.html`):

```html
<body class="sbc-canford-yaz-okulu-sayfa sayfa-yurt-disi-yaz-okullari">
```

- `sayfa-yurt-disi-yaz-okullari`: site geneli yaz okulları bağlamı korunur.
- `sbc-canford-yaz-okulu-sayfa`: SBC Canford’a özel stillerin kapsayıcısı (`sbc-canford-*` ile uyumlu önek).

**CSS:** `css/style.css` içinde ilgili tüm seçiciler `body.sbc-canford-yaz-okulu-sayfa` olacak şekilde toplu güncellendi.

---

## 3. Regresyon

- Eski uzun sınıf adı `css` / `html` / `js` içinde kalmamalı (`rg` ile doğrulandı).
- Sayfada: giriş, program grid’leri, gezi kartları, kurs kartları, spor akademileri, SSS listesi, alt form bandı hızlı kontrol.

---

## 4. Sonraki adaylar (hub / diğer uzun gövde sınıfları)

- ~~Eksik `sayfa-yurt-disi-yaz-okullari` çekirdeği (Swiss, Chantemerle, Alpadia)~~ — **[Faz 6](./tasarim-iskelet-faz6.md)** ile tamamlandı.
- ~~Hub sayfalarında yalnızca uzun segment sınıfı / sınıfsız `body`~~ — **[Faz 7](./tasarim-iskelet-faz7.md)** ile çekirdek + segment hizalandı.
- Ülke ve şehir **hub** sayfalarında segment sınıfları (`sayfa-yurt-disi-yaz-okullari-uk`, …) kart/bayrak seçicileri için gereklidir; kaldırmadan önce `grep` ile `css/` taraması şarttır.

---

*İlgili kurallar:* [Faz 4](./tasarim-iskelet-faz4.md) · `.cursor/rules/tasarim-sablon-faz4-olumsuz-body-sinif.mdc` · [Faz 6](./tasarim-iskelet-faz6.md)
