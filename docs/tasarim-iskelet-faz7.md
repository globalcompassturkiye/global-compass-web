# Tasarım iskeleti — Faz 7 (hub sayfalarında çekirdek + segment `body` sınıfları)

**Tarih:** 2026-04-14  
**Önceki:** [Faz 6](./tasarim-iskelet-faz6.md)

---

## 1. Amaç

[Faz 6](./tasarim-iskelet-faz6.md) ülke/şehir **hub** sayfalarını bilinçli olarak dışarıda bırakmıştı. Bu fazda:

1. **Yalnızca `sayfa-yurt-disi-yaz-okullari-{segment}`** taşıyan hub `index.html` dosyalarına **`sayfa-yurt-disi-yaz-okullari`** çekirdek sınıfı eklendi (segment sınıfları korunur).
2. **`body` üzerinde hiç sınıf olmayan** alt hub sayfalarına çekirdek + tutarlı **yeni segment** sınıfları verildi (Tokyo/Cambridge gibi `sayfa-yurt-disi-yaz-okullari-…` kalıbıyla hizalı).

Böylece tüm yaz okulları hub’ları ortak `body.sayfa-yurt-disi-yaz-okullari` seçicilerinden yararlanabilir; ülke/şehir özel kurallar `body.sayfa-yurt-disi-yaz-okullari-uk` vb. ile öncelikli kalmaya devam eder (daha yüksek özgüllük).

---

## 2. Çift sınıf alan hub’lar (mevcut segment + çekirdek)

| Dosya |
|-------|
| `yurt-disi-yaz-okullari/canada/index.html` |
| `yurt-disi-yaz-okullari/usa/index.html` |
| `yurt-disi-yaz-okullari/uk/index.html` |
| `yurt-disi-yaz-okullari/germany/index.html` |
| `yurt-disi-yaz-okullari/japan/index.html` |
| `yurt-disi-yaz-okullari/italy/index.html` |
| `yurt-disi-yaz-okullari/uk/cambridge/index.html` |
| `yurt-disi-yaz-okullari/uk/bournemouth/index.html` |
| `yurt-disi-yaz-okullari/uk/london/index.html` |
| `yurt-disi-yaz-okullari/uk/oxford/index.html` |
| `yurt-disi-yaz-okullari/japan/tokyo/index.html` |

**Örnek:**

```html
<body class="sayfa-yurt-disi-yaz-okullari sayfa-yurt-disi-yaz-okullari-uk">
```

---

## 3. Önceden sınıfsız `body` — çekirdek + yeni segment

| Dosya | Segment sınıfı |
|-------|----------------|
| `yurt-disi-yaz-okullari/switzerland/index.html` | `sayfa-yurt-disi-yaz-okullari-switzerland` |
| `yurt-disi-yaz-okullari/germany/freiburg/index.html` | `sayfa-yurt-disi-yaz-okullari-germany-freiburg` |
| `yurt-disi-yaz-okullari/germany/frankfurt/index.html` | `sayfa-yurt-disi-yaz-okullari-germany-frankfurt` |
| `yurt-disi-yaz-okullari/italy/milan/index.html` | `sayfa-yurt-disi-yaz-okullari-italy-milan` |
| `yurt-disi-yaz-okullari/canada/toronto/index.html` | `sayfa-yurt-disi-yaz-okullari-canada-toronto` |
| `yurt-disi-yaz-okullari/usa/new-york/index.html` | `sayfa-yurt-disi-yaz-okullari-usa-new-york` |

Bu segment sınıfları (2026-04-14 itibarıyla) `css/` içinde seçici olarak kullanılmıyor olabilir; amaç hiyerarşi ve ileride `body` kapsamlı stil için tutarlı isimlendirme.

---

## 4. Regresyon ve CSS notu

- `title` / `meta description` değiştirilmedi.
- `body.sayfa-yurt-disi-yaz-okullari-uk .yaz-okullari-secim-paneli …` gibi seçiciler, `body` üzerinde ek `sayfa-yurt-disi-yaz-okullari` olduğunda da eşleşir; ülke hub’larında kart ızgarası ülke kuralına göre kalır.
- Şehir hub’larında çoğunlukla `okul-listesi-*` bileşenleri kullanıldığı için `yaz-okullari-secim-paneli` tabanlı kurallar tetiklenmeyebilir — görsel değişiklik beklenmez.

---

*İlgili kural:* `.cursor/rules/tasarim-sablon-faz6-yaz-okulu-body-cekirdek.mdc` (Faz 7 ile güncellenen hub sözleşmesi)
