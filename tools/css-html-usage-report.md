# CSS–HTML kullanım denetimi

Oluşturulma: 2026-04-27T20:58:17.441Z

## Özet

| Metrik | Değer |
| --- | ---: |
| Taranan HTML dosyası | 98 |
| Taranan JS dosyası | 8 |
| Taranan CSS dosyası | 20 |
| HTML’de benzersiz class | 853 |
| CSS’te benzersiz .class token | 1187 |
| **CSS’te var, HTML/JS’te yok** (olası ölü / dinamik) | **395** |
| **HTML’de var, hiçbir CSS’te yok** (toplam) | **86** |
| … bunlardan JS’te de kanca yok (CSS kuralı yazımı adayı) | **83** |
| … bunlardan JS’te kanca var (salt JS seçici / span) | 3 |
| CSS #id yok HTML/JS’te | 17 |
| HTML #id yok CSS’te | 877 |

## Bilinen HTML sadeleştirmesi

- `blog-icindekiler-liste--mobil` kaldırıldı: `css/*.css` içinde tanım yoktu; ilgili `<ul>` öğelerinde yalnızca `blog-icindekiler-liste` kullanılıyor.

## Dikkat

- Sınıf/id yalnızca üretim dışı araçlarda, inline script veya harici CDN’de geçiyorsa “ölü” yanlış pozitif verir.
- querySelector / birleşik string ile üretilen seçiciler tam taranmaz; JS tarafı sınırlı kalıplarla taranır.
- SVG içi class veya <style> bloğu ayrıştırılmaz.
- HTML’de olup CSS’te çıkmayan sınıflar: gövde kancası (yalnızca body’de), ileride kullanılacak isim veya JS ile eklenen sınıf olabilir; otomatik silme önerilmez.
- CSS’te olup markup’ta çıkmayan sınıflar: dinamik DOM, şablon dışı sayfa veya yalnızca başka bir CSS dosyasından @import ile gelmeyen (bu tarama css/ kökündeki .css dosyalarını okur) durumlar için yanlış pozitif olabilir.
- js/*.js: innerHTML içindeki class="…", classList.add(…), querySelector(…), tırnak içi ".foo" seçici parçaları "kullanılmış" sayılır (ölü CSS sayısını düşürür).

## Örnek: CSS’te görünüp markup’ta çıkmayan sınıflar (ilk 80)

```
ac-milan-avantaj-baslik--numarali
ac-milan-avantaj-icerik
ac-milan-avantaj-kart
ac-milan-avantaj-kutu
ac-milan-avantaj-listesi
ac-milan-avantaj-numara
ac-milan-avantaj-numara--mini
ac-milan-avantaj-numarasiz
ak
akademik-ak
alan-en
almanya-avantaj-grid-3-2
alpadia-h3
alt-satir
alt-satir-lacivert
ana-buton
ana-marka-baslik
ana-sayfa-blog-ozeti-baslik-wrap
ana-sayfa-blog-ozeti-kirmizi-bant
ana-tab-cerceve-ust-bant
avantaj-grid
avantaj-kart
blog-ai-ozet-baslik
blog-ai-ozet-kutu
blog-ai-ozet-liste
blog-buton-ikincil
blog-cta-aksiyonlar
blog-cta-baslik
blog-cta-bolumu
blog-cta-metin
blog-etiket
blog-faq-bolumu
blog-faq-cevap
blog-faq-item
blog-faq-soru
blog-icindekiler-sabit-ok-goster
blog-ilgili-baslik
blog-ilgili-liste
blog-ilgili-programlar
blog-ozne-baslik
blog-ozne-cta
blog-ozne-gorsel-wrap
blog-ozne-icerik
blog-ozne-meta
blog-ozne-ozet
blog-ozne-yazi
blog-sayfa-alt
blog-yan-hizmet-gorsel-wrap
blog-yan-hizmet-karti
blog-yazi-detay-kisa
blog-yazi-kapak-gorsel
blog-yazi-meta-satir
blok-yan-bosluk-15
blue
boston-okul-foto
boston-okul-foto-img
bournemouth-form-alt-satir
bournemouth-form-bant
breadcrumb-ayrac
cambridge-form-alt-satir
canada-avantaj-grid-3-1
cerceve-icerik
cizgi-ustu-baslik
dahil-ana-baslik
dahil-grid
dahil-kart
dahil-olanlar-konteyner
egitim-blok
egitim-bloklar
egitim-ikon
egitim-ikon-ozel
egitim-ozet
frankfurt-avantaj-baslik-satir
frankfurt-avantaj-grid
frankfurt-avantaj-ikon
frankfurt-avantaj-kart
frankfurt-avantaj-kutu
frankfurt-dil-program-bolumu
frankfurt-dil-program-ic-kart
frankfurt-dil-program-ic-kart-baslik
```

## Örnek: HTML’de olup CSS’te yok, JS’te de yok (ilk 60 — yazım / legacy adayı)

```
aktiviteler-tabs-kapsayici
blog-yazi-isvicre-ib
blog-yazi-okuma-blok--ikon-son
cambridge-mobil-icindekiler-giris-alti
detay-kart-grid
gezi-bern-icerik
gezi-cailler-icerik
gezi-olimpiyat-icerik
iletisim-icindekiler-kutu
iletisim-sss-kutu
immerse-oxford-neden
immerse-tokyo-giris-kategori-kartlar-kutu
investin-mobil-icindekiler-giris-alti
investin-program-ozeti-grid
isvicre-form-bant
kings-bournemouth-foto
kings-ielts-alt-ikili
kings-ielts-cerceve-satiri
kings-oxford-giris-kapanis-metni
kutu-icerik
kvkk-sayfa-ust-alan
kvkk-sayfa-ust-menu
london-mobil-icindekiler-giris-alti
okul-gorsel-alani
okul-logo-alani
onemli-intro
ora-cambridge-mobil-icindekiler-giris-alti
oxford-mobil-icindekiler-giris-alti
program-detay-kutu
program-detay-ozet-grid
rozet-kart--detay
rozet-kart-icerik
rozet-liste-kutu
sayfa-alpadia-frankfurt-icerik
sayfa-alpadia-freiburg-icerik
sayfa-blog
sayfa-blog-kategori
sayfa-burs-firsatlari-icerik
sayfa-chantemerle-icerik
sayfa-kvkk-icerik
sayfa-sbc-canford-icerik
sayfa-tokyo-immerse-icerik
sayfa-toronto-immerse-icerik
sayfa-yurt-disi-dil-okullari-uk-bournemouth
sayfa-yurt-disi-dil-okullari-uk-oxford
sayfa-yurt-disi-dil-okullari-usa-boston
sayfa-yurt-disi-dil-okullari-usa-los-angeles
sayfa-yurt-disi-dil-okullari-usa-new-york
sayfa-yurt-disi-lise-degisim
sayfa-yurt-disi-yaz-okullari-canada-toronto
sayfa-yurt-disi-yaz-okullari-germany-frankfurt
sayfa-yurt-disi-yaz-okullari-germany-freiburg
sayfa-yurt-disi-yaz-okullari-japan-tokyo
sayfa-yurt-disi-yaz-okullari-switzerland
sayfa-yurt-disi-yaz-okullari-uk-bournemouth
sayfa-yurt-disi-yaz-okullari-uk-cambridge
sayfa-yurt-disi-yaz-okullari-uk-london
sayfa-yurt-disi-yaz-okullari-uk-oxford
sayfa-yurt-disi-yaz-okullari-usa-new-york
sayfa-yurt-disi-yuksek-lisans-mba
```

## Örnek: HTML’de olup CSS’te yok ama JS’te kanca (ilk 40)

```
immerse-tokyo-devam-ac
immerse-tokyo-devam-kapa
rozet-govde
```

Tam listeler: `css-html-usage-report.json` içindeki `lists`.
