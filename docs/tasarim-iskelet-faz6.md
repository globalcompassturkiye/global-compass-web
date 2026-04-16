# Tasarım iskeleti — Faz 6 (yaz okulu içerik sayfalarında `sayfa-yurt-disi-yaz-okullari` çekirdeği)

**Tarih:** 2026-04-14  
**Önceki:** [Faz 5](./tasarim-iskelet-faz5.md)

---

## 1. Amaç

`/yurt-disi-yaz-okullari/…` altında yer alan **okul / program detay** sayfalarında `body`, site geneli yaz okulları bağlamını taşıyan **`sayfa-yurt-disi-yaz-okullari`** sınıfını da içermelidir. Birkaç sayfa yalnızca sayfa özel sınıf + `blog-yazi-sayfa-mobil-ux` ile kalmıştı; `style.css` ve ortak bileşenlerde `body.sayfa-yurt-disi-yaz-okullari` ile eşleşen kurallar bu sayfalarda uygulanmıyordu.

---

## 2. Güncellenen sayfalar

| Dosya | Eklenen sınıf |
|-------|----------------|
| `yurt-disi-yaz-okullari/switzerland/swiss-education-academy/index.html` | `sayfa-yurt-disi-yaz-okullari` |
| `yurt-disi-yaz-okullari/switzerland/chantemerle/index.html` | `sayfa-yurt-disi-yaz-okullari` |
| `yurt-disi-yaz-okullari/germany/freiburg/alpadia/index.html` | `sayfa-yurt-disi-yaz-okullari` |
| `yurt-disi-yaz-okullari/germany/frankfurt/alpadia/index.html` | `sayfa-yurt-disi-yaz-okullari` |

**Örnek:**

```html
<body class="sayfa-alpadia-freiburg blog-yazi-sayfa-mobil-ux sayfa-yurt-disi-yaz-okullari">
```

Sayfa özel sınıflar (`sayfa-swiss-education-academy`, `sayfa-chantemerle`, `sayfa-alpadia-*`) aynen korunur; yalnızca çekirdek bağlam sınıfı eklenir.

---

## 3. Hub sayfaları

Ülke / şehir **hub** sayfaları için çekirdek + segment birlikte kullanımı **[Faz 7](./tasarim-iskelet-faz7.md)** ile uygulandı (bu fazda yalnızca okul detay sayfaları güncellenmişti).

---

## 4. Regresyon

- `title` / `meta description` değiştirilmedi.
- Gövde sınıf listesinde Türkçe karakter ve mevcut sıra korundu; yalnızca `sayfa-yurt-disi-yaz-okullari` eklendi.

---

*Cursor kuralı:* `.cursor/rules/tasarim-sablon-faz6-yaz-okulu-body-cekirdek.mdc`
