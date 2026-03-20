# Yönlendirme kartı (sayfa sonu CTA) — global standart

## HTML

```
div.okul-liste-kapsayici
  h2.okul-liste-baslik   ← ana mesaj (mavi bant)
  section.alt-yonlendirme-alani
    div.yonlendirme-karti
      p
      a.kart-link | a.vurgulu-incele-btn
```

- **Başlık yalnızca** `okul-liste-baslik` üzerinde; `yonlendirme-karti` içinde **`h2` kullanılmaz**.
- Birden fazla kart gerekiyorsa (ör. lise değişim): her kart için **ayrı** `okul-liste-kapsayici` + kendi `okul-liste-baslik` metni.
- `section.alt-yonlendirme-alani` tek başına kullanılıyorsa, dışarı **mutlaka** `okul-liste-kapsayici` ile sarılmalı (bkz. `yurt-disi-dil-okullari/usa/index.html`).

## CSS (global)

`css/style.css`

- `.okul-liste-kapsayici:has(> .alt-yonlendirme-alani) .okul-liste-baslik` — uzun başlıklar (`text-transform: none`, `white-space: normal`).
- Dış çerçeve: üstte bilgi istek formu ile **`margin-top: 50px`**; `padding: 20px 25px 16px 25px` — metnin gri çerçeve sol iç kenarından uzaklığı **25px** (yatay tek katman); iç beyaz kartta **yatay padding yok** (`padding: 12px 0 16px 0`); paragraf–CTA `gap` ile.
- `.okul-liste-kapsayici:has(> .alt-yonlendirme-alani) .yonlendirme-karti { margin-top: 0 }` — kartın üstünde fazladan boşluk yok.

Immerse sayfalarına özel sınıf **gerekmez**; aynı yapı tüm sitede geçerlidir.

## Cursor kuralı

`.cursor/rules/yonlendirme-karti-standardi.mdc`
