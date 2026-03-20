# TAKİP: Okul listesi çerçevesinde kartlar arası boşluk (~25px hedef)

**Durum:** Çözülmedi — sonra tekrar bakılacak.

## Sorun

- `#okul-liste-kapsayici` / `.modern-okul-listesi` içinde **iki (veya daha fazla)** `.premium-liste-kart` varken, satırlar arası boşluk **~25px** olmalı; ekranda **çok daha fazla** (~70–80px) görünüyordu.
- Kullanıcı: global CSS ile düzeltme denendi, **görünürde değişiklik olmadı**.

## Olası nedenler (özet)

1. **`style.css` içinde** aynı dosyada **tekrarlayan** `.modern-okul-listesi { margin; padding }` blokları (~2716, ~2817) çakışma yaratıyor olabilir.
2. **`margin: 0 !important` kısaltması** bir süre `margin-top: 25px` kuralını eziyordu; sonra kısaltma kaldırılıp kenarlar ayrı yazıldı.
3. Flex/grid + HTML’deki **satır sonları** bazen ekstra “metin düğümü” ile **çift gap** hissi (HTML’de kartlar bitişik yapıldı).
4. **Önbellek / canlıda eski CSS** — `?v=` query veya deploy kontrolü gerekebilir.
5. **Sonradan yüklenen CSS** (`yurt-disi-yaz-okullari.css`, `switzerland.css`, `london.css`, vb.) sırası önemli; bu dosyaların sonuna **panel + `.okul-liste-kapsayici` + `.modern-okul-listesi`** ile `margin-top: 25px !important` override’ları eklendi.

## HTML (İsviçre örneği)

- `section.modern-okul-listesi` içinde **doğrudan** iki `div.premium-liste-kart`; kartlar arası **bitişik** (`</div><div`), `</div></section>` bitişik — **yapı doğru**, ekstra section-level metin düğümü yok.

## Dokunulan / ilgili dosyalar

- `css/style.css` — `.okul-liste-kapsayici .modern-okul-listesi`, kart margin kuralları, dosya **sonu** tekrar override bloğu
- `css/yurt-disi-yaz-okullari.css` — `.yaz-okullari-secim-paneli` ile aynı mantık
- `css/switzerland.css` — `.isvicre-secim-paneli` ile aynı mantık
- `css/london.css` — `.london-secim-paneli`
- `css/yurt-disi-dil-okullari.css`, `css/yurt-disi-dil-okullari-usa.css`
- `yurt-disi-yaz-okullari/switzerland/index.html` — CSS linklerine `?v=okul-liste-2025` (önbellek kırma denemesi)

## Sonraki adımlar (tekrar açıldığında)

1. Canlıda **F12 → ikinci `.premium-liste-kart` → Computed**: `margin-top`, `padding`, üstte hangi kural **strike-through**?
2. **Gizli pencere** veya **cache devre dışı** ile test.
3. Geçici test: ikinci karta **`style="margin-top:25px"`** — görünürse sorun büyük olasılıkla **CSS sunucuya gitmiyor / cache**; görünmezse başka **layout** (transform, zoom, farklı şablon).
4. İstenirse **sadece bu blok** için küçük bir **`okul-liste-ozel.css`** tek dosyada toplanıp **en son** link olarak eklenir.

---

*Not tarihi: 2025-03*
