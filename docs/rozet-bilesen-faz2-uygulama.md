# Rozet Bilesen Donusumu - Faz 2 Uygulama Notu

**Tarih:** 2026-04-26  
**Kapsam (bu adim):** `yurt-disi-dil-okullari/uk/` + `yurt-disi-dil-okullari/usa/` + `yurt-disi-yaz-okullari/italy/` aileleri

## Uygulanan degisiklikler

### 1) HTML sinif sadeleme (UK ailesi)

Asagidaki sayfalarda sayfa-ozel `*-neden-rozet-grid` siniflari kaldirildi:

- `yurt-disi-dil-okullari/uk/london/index.html`
- `yurt-disi-dil-okullari/uk/oxford/index.html`
- `yurt-disi-dil-okullari/uk/bournemouth/index.html`

Hedef yapi korunarak standart sinifla devam edildi:

- `rozet-grid icerik-kutusu-grid yatay-*`
- `rozet-kart`
- `rozet-baslik`
- `rozet-metin`

### 2) CSS secici sertlestirme (ortak yapiya cekim)

`css/style.css` icinde bu eski ozel siniflara bagli seciciler, kapsayici + ortak rozet secicisine cevrildi:

- `.londra-neden-kutu .londra-neden-rozet-grid ...` -> `.londra-neden-kutu .rozet-grid ...`
- `.oxford-neden-kutu .oxford-neden-rozet-grid ...` -> `.oxford-neden-kutu .rozet-grid ...`
- `.bournemouth-neden-kutu .bournemouth-neden-rozet-grid ...` -> `.bournemouth-neden-kutu .rozet-grid ...`

Bu degisimle layout/ikon-baslik hizasi korunurken, sayfa-ozel grid sinifi bagimliligi azaltildi.

### 3) HTML sinif sadeleme (USA ailesi)

Asagidaki sayfalarda sayfa-ozel `*-neden-rozet-grid` siniflari kaldirildi:

- `yurt-disi-dil-okullari/usa/new-york/index.html`
- `yurt-disi-dil-okullari/usa/boston/index.html`
- `yurt-disi-dil-okullari/usa/los-angeles/index.html`

### 4) CSS secici sertlestirme (USA)

`css/style.css` icinde ozel sinifa bagli seciciler ortak rozet secicisine cekildi:

- `.new-york-neden-kutu .new-york-neden-rozet-grid ...` -> `.new-york-neden-kutu .rozet-grid ...`
- `.boston-neden-kutu .boston-neden-rozet-grid ...` -> `.boston-neden-kutu .rozet-grid ...`
- `.los-angeles-neden-kutu .los-angeles-neden-rozet-grid ...` -> `.los-angeles-neden-kutu .rozet-grid ...`

### 5) HTML sinif sadeleme (Italy ailesi)

Asagidaki noktalarda rozet-disi kart/grid siniflari kaldirildi ve ortak rozet yapisina cekildi:

- `yurt-disi-yaz-okullari/italy/index.html`
  - `italy-avantaj-rozet-grid` kaldirildi
  - `italy-program-grid` + `italy-program-kart` -> `rozet-grid icerik-kutusu-grid yatay-2` + `rozet-kart`
- `yurt-disi-yaz-okullari/italy/milan/index.html`
  - `milan-avantaj-rozet-grid` kaldirildi
- `yurt-disi-yaz-okullari/italy/milan/sportech-academy/index.html`
  - `sportech-program-detay-grid` kaldirildi

### 6) CSS secici sertlestirme (Italy)

`css/style.css` icindeki seciciler ortak yapiya cekildi:

- `.italy-avantaj-kutu .italy-avantaj-grid|italy-avantaj-rozet-grid ...` -> `.italy-avantaj-kutu .rozet-grid ...`
- `.milan-avantaj-kutu .milan-avantaj-grid|milan-avantaj-rozet-grid ...` -> `.milan-avantaj-kutu .rozet-grid ...`
- `.italy-program-kutu .italy-program-grid|italy-program-kart ...` -> `.italy-program-kutu .rozet-grid|.rozet-kart ...`
- `#yaz-programlari-detay .rozet-grid.sportech-program-detay-grid ...` -> `#yaz-programlari-detay .rozet-grid ...`

### 7) HTML sinif sadeleme (ek temizlik dalgasi)

Asagidaki aktif `*-rozet-grid` siniflari kaldirildi:

- `yurt-disi-dil-okullari/uk/oxford/index.html`
  - `oxford-egitim-rozet-grid`
- `yurt-disi-yaz-okullari/uk/oxford/index.html`
  - `oxford-program-rozet-grid`
  - `oxford-sosyal-rozet-grid`
- `yurt-disi-universite/index.html`
  - `universite-neden-rozet-grid`
- `yurt-disi-universite/switzerland/index.html`
  - `isvicre-populer-rozet-grid`

### 8) CSS secici sertlestirme (ek temizlik dalgasi)

`css/style.css` icindeki seciciler, kaldirilan siniflara bagli olmadan kapsayici + ortak rozet secicisine cekildi:

- `.oxford-egitim-kutu .oxford-egitim-rozet-grid ...` -> `.oxford-egitim-kutu .rozet-grid ...`
- `.oxford-program-rozet-kutu .oxford-program-rozet-grid ...` -> `.oxford-program-rozet-kutu .rozet-grid ...`
- `.oxford-sosyal-rozet-kutu .oxford-sosyal-rozet-grid ...` -> `.oxford-sosyal-rozet-kutu .rozet-grid ...`
- `body.sayfa-yurt-disi-universite .universite-neden-rozet-grid ...` -> `#uni-neden-yurt-disinda .rozet-grid ...`
- `body.sayfa-yurt-disi-universite-switzerland .isvicre-populer-rozet-grid ...` -> `#isvicre-universite-basvuru .rozet-grid ...`

### 9) HTML sinif sadeleme (kalan aktif rozet varyantlari)

Bu dalgada kaldirilan aktif varyantlar:

- `kings-la-kurs-rozet-grid`
  - `yurt-disi-dil-okullari/usa/los-angeles/kings-education/index.html`
  - `yurt-disi-dil-okullari/usa/new-york/kings-education/index.html`
  - `yurt-disi-dil-okullari/usa/boston/kings-education/index.html`
  - `yurt-disi-dil-okullari/uk/london/kings-education/index.html`
  - `yurt-disi-dil-okullari/uk/oxford/kings-education/index.html`
  - `yurt-disi-dil-okullari/uk/bournemouth/kings-education/index.html`
- `alpadia-neden-rozet-grid`
  - `yurt-disi-yaz-okullari/germany/frankfurt/alpadia/index.html`
- `toronto-aktivite-rozet-grid`
  - `yurt-disi-yaz-okullari/canada/toronto/index.html`

### 10) CSS secici sertlestirme (kalan aktif rozet varyantlari)

`css/style.css` guncellemeleri:

- `kings-la-kurs-rozet-grid` bagimliligi kaldirildi; kurs kartlari `:has(> .rozet-kart > .rozet-kart-icerik-blok)` ile ortak rozet-grid uzerinden hedefleniyor.
- `alpadia-neden-rozet-grid` -> `.alpadia-neden-kutu .rozet-grid`
- `toronto-aktivite-rozet-grid` -> `.toronto-aktivite-kutu .rozet-grid`

### 11) style.css boyut odakli temizlik

Koddan tamamen silinen (HTML'de kullanimi olmayan) miras seciciler:

- `milan-avantaj-kart` (ve turevleri)
- `italy-avantaj-kart` (ve turevleri)
- `toronto-konaklama-yurt-rozet-grid` (yalniz CSS'te kalan secici)
- `oxford-egitim-rozet-ikon` (yalniz CSS'te kalan secici)

Ek not:

- Bu adimda `style.css` boyutu **427145 B -> 425488 B** olacak sekilde dusuruldu.

### 12) style.css boyut odakli temizlik (devam)

Kaldirilan kullanimsiz miras bloklar:

- `.premium-okul-kart`
- `.kart-bg-no`
- `.kart-aksiyon`
- `.vurgu-kart`

Not:

- Bu temizlikte `style.css` boyutu **425279 B -> 423629 B** seviyesine indi.
- Toplam dusus (baslangic 427145 B'e gore): **3516 B** (~3.43 KB).

## Dogrulama

- Ilgili ozel rozet varyantlari kod tabaninda aktif HTML/CSS kullanimindan kaldirildi.
- Lint kontrolu temiz.
- Faz 0 sozlesmesine aykiri yeni sinif eklenmedi.

## Sonraki dalga (Faz 3)

Faz 3 basladi: `docs/rozet-bilesen-faz3-regresyon.md`

1. Faz 3 otomatik kontrol (kaldırilan sinif adlari HTML/CSS taramasi)  
2. Faz 3 manuel regresyon checklist (kritik sayfalar + breakpoint'ler)  
3. Faz 3 kapanis notu (bulunan sapmalar varsa kayit)
