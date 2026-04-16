# Tasarım iskeleti — Faz 4 (ölü `body` sınıfı temizliği + regresyon)

**Tarih:** 2026-04-14  
**Önceki:** [Faz 3](./tasarim-iskelet-faz3.md) · [Faz 2](./tasarim-iskelet-faz2.md) · [Faz 1](./tasarim-iskelet-envanter-faz1.md)

---

## 1. Amaç

`body` üzerindeki **uzun `sayfa-yurt-disi-yaz-okullari-…` zincirlerinden** kurtulmak için önce **ölü sınıf** avı:

1. `css/` ve (varsa) `js/` içinde **tam string** aranır.
2. **Eşleşme yoksa** → sınıf yalnızca tarihsel/tekrar kalıntısıdır; güvenle kaldırılabilir (sayfa özelinde `immerse-education-page`, `oxford-royale-cambridge-sayfa`, `investin-page` vb. **korunur** — bunlar CSS’te kullanılıyor olabilir).

**Risk:** Bazı sınıflar yalnızca harici analitikte kullanılıyorsa repo içi arama yetmez; canlıda özel script yoksa bu yaklaşım güvenlidir.

---

## 2. Bu turda kaldırılan sınıflar (2026-04-14)

| Kaldırılan `body` sınıfı | Sayfa |
|--------------------------|--------|
| `sayfa-yurt-disi-yaz-okullari-uk-london-immerse-education` | `yurt-disi-yaz-okullari/uk/london/immerse-education/` |
| `sayfa-yurt-disi-yaz-okullari-uk-cambridge-immerse-education` | `yurt-disi-yaz-okullari/uk/cambridge/immerse-education/` |
| `sayfa-yurt-disi-yaz-okullari-uk-oxford-immerse-education` | `yurt-disi-yaz-okullari/uk/oxford/immerse-education/` |
| `sayfa-yurt-disi-yaz-okullari-uk-london-investin` | `yurt-disi-yaz-okullari/uk/london/investin/` |
| `sayfa-yurt-disi-yaz-okullari-uk-cambridge-oxford-royale-academy` | `yurt-disi-yaz-okullari/uk/cambridge/oxford-royale-academy/` |
| `sayfa-yurt-disi-yaz-okullari-uk-bournemouth-kings-education` | `yurt-disi-yaz-okullari/uk/bournemouth/kings-education/` |

**Korunan çekirdek:** `sayfa-yurt-disi-yaz-okullari`, `blog-yazi-sayfa-mobil-ux`, şablona göre `immerse-education-page`, `investin-page`, `oxford-royale-cambridge-sayfa` vb.

---

## 3. Regresyon kontrol listesi (şablon değişikliği sonrası)

- [ ] `rg 'kaldırılan-sınıf-adı' css js` → **0** sonuç (veya yalnızca doküman/rapor).
- [ ] İlgili sayfada: üst menü, içerik kutuları, form bandı, mobil içindekiler (varsa) hızlı görsel kontrol.
- [ ] `title` / `meta description` metnine dokunulmadı.

---

## 4. Sonraki adaylar

- ~~`sayfa-yurt-disi-yaz-okullari-uk-bournemouth-summer-boarding-courses-canford`~~ — **Faz 5’te** `body.sbc-canford-yaz-okulu-sayfa` olarak sadeleştirildi ([tasarim-iskelet-faz5.md](./tasarim-iskelet-faz5.md)).
- Ülke/şehir **hub** sayfaları — bayrak/kart seçicileri `body` uzun sınıfına bağlı olabilir; önce `grep` zorunlu.

---

*Cursor kuralı:* `.cursor/rules/tasarim-sablon-faz4-olumsuz-body-sinif.mdc`
