# Tasarım iskeleti — Faz 3 (gövde sınıfı sadeleştirme)

**Tarih:** 2026-04-14  
**Önceki:** [Faz 2](./tasarim-iskelet-faz2.md), [Faz 1](./tasarim-iskelet-envanter-faz1.md)

---

## 1. İlke

- **`body` üzerindeki uzun `sayfa-yurt-disi-yaz-okullari-…` zinciri**, yalnızca `style.css` (veya diğer `/css` dosyalarında) **gerçekten seçici olarak kullanılıyorsa** anlamlıdır.
- Seçici zaten sayfaya özgü **`#id`** veya **` .sayfa-ozel-sinif`** ile tekilleştirilmişse, aynı kural **`body.immerse-education-page`** veya `body.sayfa-yurt-disi-yaz-okullari` gibi **kısa ortak sınıflar** + o `#id` ile yazılabilir; uzun gövde sınıfı **kaldırılabilir**.

---

## 2. Pilot (tamamlandı): Tokyo Immerse Education

| Önce | Sonra |
|------|--------|
| `body` … `sayfa-yurt-disi-yaz-okullari-japan-tokyo-immerse-education` + `immerse-education-page` + … | `immerse-education-page` + `blog-yazi-sayfa-mobil-ux` + `sayfa-yurt-disi-yaz-okullari` |

**Dosyalar**

- `yurt-disi-yaz-okullari/japan/tokyo/immerse-education/index.html` — uzun sınıf kaldırıldı.
- `css/style.css` — aşağıdaki kurallar `body.immerse-education-page` + `#tokyo-immerse-*` / `.immerse-tokyo-ornek-program-kutu` ile güncellendi:
  - İçindekiler `scroll-margin-top`
  - Tokyo kampüs / örnek program görsel boyutu

**Gerekçe:** `#tokyo-immerse-mobil-icindekiler-kutu`, `#tokyo-immerse-masaustu-icindekiler-baslik`, `#tokyo-immerse-kampus` ve `.immerse-tokyo-ornek-program-kutu` yalnızca bu sayfada vardır; diğer Immerse şehir sayfalarıyla çakışmaz.

---

## 3. Sonraki adaylar (manuel denetim)

Aşağıdaki `body` sınıfları **grep** ile `css/` içinde aranıp** tek tek** değerlendirilmelidir; çoğu yalnızca hub veya tek sayfaya özel uzun isimdir:

- `sayfa-yurt-disi-yaz-okullari-uk-bournemouth-summer-boarding-courses-canford` — `style.css` içinde çok sayıda seçici (SBC Canford); kaldırmak için seçicilerin `#id` / `.sbc-canford-*` ile yeterince tekilleştiğinden emin olunmalı.
- `sayfa-yurt-disi-yaz-okullari-uk-london-immerse-education` vb. — şu an **CSS’te bu tam string yok**; HTML’de kalması yalnızca “gelecekte scope” için; istenirse `data-page` veya kısa `body` sınıfına migrasyon ayrı iş paketi.
- Ülke/şehir hub sayfaları (`sayfa-yurt-disi-yaz-okullari-italy`, …) — çoğu kart/bayrak seçicisi için gerekli.

**Öneri:** Her migrasyonda (1) `css` seçicilerini güncelle, (2) `body` sınıfını kısalt, (3) bir sayfada görsel/regresyon kontrolü yap.

---

## 4. Yeni sayfa kuralı

- Yeni yaz okulu okul sayfasında **varsayılan** gövde çekirdeği: `sayfa-yurt-disi-yaz-okullari` (+ şablon gerekiyorsa `blog-yazi-sayfa-mobil-ux`, `immerse-education-page` vb.).
- **`sayfa-yurt-disi-yaz-okullari-ülke-şehir-kurum-…` uzun zinciri eklemeden önce:** ilgili stillerin `#ana-icerik-id` veya tek bir `data-*` ile çözülüp çözülemeyeceğini kontrol et.

---

*Cursor kuralı:* `.cursor/rules/tasarim-sablon-faz3-body-siniflari.mdc`

---

## Faz 4

- **Ölü `body` sınıfı temizliği (UK Immerse, Investin, ORA Cambridge, Bournemouth Kings) + regresyon listesi:** [tasarim-iskelet-faz4.md](./tasarim-iskelet-faz4.md)

## Faz 5

- **SBC Canford `body` refaktörü:** [tasarim-iskelet-faz5.md](./tasarim-iskelet-faz5.md)
