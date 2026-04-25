# Rozet Bilesen Sozlesmesi (Faz 0 - Dondurulmus)

Bu dokuman, tum sayfalarda kart benzeri iceriklerin ortak yapiya alinmasi icin
zorunlu HTML/CSS sozlesmesini tanimlar.

Amac: `rozet-grid / rozet-kart / rozet-baslik / rozet-metin` yapisini tek kaynak
haline getirmek ve sayfa-ozel kart stillerini sonlandirmak.

Faz 1 envanteri ve A/B/C siniflandirmasi: `docs/rozet-bilesen-envanter-faz1.md`.

## 1) Zorunlu Yapi

- Grid kapsayici: `div.rozet-grid`
- Grid yardimcisi: `icerik-kutusu-grid`
- Kart: `article.rozet-kart`
- Baslik: `h3.rozet-baslik`
- Metin: `p.rozet-metin`

Opsiyonel ikon:

- `div.rozet-ikon` (numara/tik/ikon)
- `div.rozet-ikon rozet-ikon-tick` (tik varyanti)

## 2) Zorunlu Siralama (Kart Ici)

Her `article.rozet-kart` icinde sira su sekilde olmalidir:

1. `div.rozet-ikon` (opsiyonel)
2. `h3.rozet-baslik` (zorunlu)
3. `p.rozet-metin` (zorunlu)

Not: Baslik ve metin ayni `p` icinde birlestirilmez.

## 3) Grid Varyantlari

Sadece asagidaki varyantlar kullanilir:

- `yatay-1`
- `yatay-2`
- `yatay-3`
- `yatay-4`
- `yatay-5`
- `son-kart-ortala` (yalniz gerekli oldugunda)

Kural: Kolon davranisi yeni sayfa-ozel kart sinifi ile degil, bu varyantlarla verilir.

## 4) Tipografi Sozlesmesi

Projedeki global tipografi standardi gecerlidir:

- `h3.rozet-baslik`: `14.5px`, `line-height: 1.4`, `font-weight: 700`
- `p.rozet-metin`: `15px`, `line-height: 1.7`

Ek kural:

- Kart metinlerinde farkli font ailesi kullanilmaz.
- Baslik vurgu ihtiyacinda yeni sinif yerine mevcut tipografi standardi kullanilir.

## 5) Yasaklar (Faz 0'dan itibaren)

- Yeni kart bileseni icin sayfa-ozel grid/kart sinifi acmak
  - Ornek: `*-card-grid`, `*-feature-card`, `*-capraz-cerceve-*`
- `body.sayfa-*` veya `#tekil-id` ile kart gorunumu override etmek
- Kart gorunumu icin yeni `!important` eklemek
- Baslik/metin ayirimini bozacak sekilde tek paragraf kullanimina donmek

## 6) Istisna Kapsami (Faz 0)

Asagidaki yapilar rozet sozlesmesi kapsaminda degildir:

- `premium-liste-kart` tabanli program secim listeleri
- `yonlendirme-karti` alt yonlendirme bloklari
- `sss-item` SSS bileseni
- `iletisim-form-beyaz-cerceve` form bileseni
- Gorsel agirlikli galeri kutulari (`figure` tabanli gridler)

Bu istisnalar kart gibi gorunse de farkli bilesen sozlesmesine tabidir.

## 7) Donusum Esleme Kurali (Sonraki Fazlar Icin)

Refaktor sirasinda eski siniflar su hedefe cekilir:

- Eski grid sinifi -> `rozet-grid icerik-kutusu-grid yatay-*`
- Eski kart sinifi -> `rozet-kart`
- Eski baslik sinifi -> `rozet-baslik`
- Eski metin sinifi -> `rozet-metin`

## 8) Faz 0 Kabul Kriterleri

- Yeni gelistirmelerde kart bileseni sadece rozet yapisiyla acilir.
- Kart yapi kararlarinda bu dokuman tek referans kabul edilir.
- Sonraki fazlarda envanter ve donusum listesi bu sozlesmeye gore yapilir.
