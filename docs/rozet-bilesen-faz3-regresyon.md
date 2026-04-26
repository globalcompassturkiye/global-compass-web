# Rozet Bilesen Donusumu - Faz 3 (Regresyon ve Kapanis)

**Tarih:** 2026-04-26  
**Amaç:** Faz 2 sonrasinda rozet yapisi ve ortak CSS sozlesmesinin kirik referans uretmedigini dogrulamak.

## 1) Otomatik kontrol (repo)

Asagidaki kontroller Faz 3 baslangicinda calistirildi:

- Kaldırılan miras sinif adlari HTML icinde aranir (bos sonuc beklenir).
- Ayni sinif adlari `css/style.css` icinde aranir (bos sonuc beklenir).

Kontrol edilen ornek siniflar:

- `usa-capraz-cerceve-grid`, `usa-capraz-cerceve-kart`
- `*-neden-rozet-grid` varyantlari (UK/USA)
- Italy/Milan/Sportech rozet varyantlari
- Kings `kings-la-kurs-rozet-grid`
- Toronto/Alpadia rozet varyantlari
- Kaldirilan premium/kart miras siniflari (`premium-okul-kart`, `kart-bg-no`, `kart-aksiyon`, `vurgu-kart`)

Bilinen istisna (Faz 2 sonrasi bilincli kalan hedefleme):

- `kings-la-program-detay-grid` hala Kings `Program Detaylari` rozet gridinde kullaniliyor; CSS tarafinda kurs bloklari icin kullanilan `:has(> .rozet-kart > .rozet-kart-icerik-blok)` secicisi bu gridde tetiklenmez (icerik yapisi farkli). Bu yuzden bu sinif Faz 3'te "yanlislikla silinmemesi gereken" bir isaretleyici olarak ele alinmalidir.

## 2) Manuel regresyon checklist (UI)

Asagidaki sayfalar en az bir breakpointte kontrol edilmelidir:

- `yurt-disi-dil-okullari/uk/` (hub + london + oxford + bournemouth)
- `yurt-disi-dil-okullari/usa/` (hub + sehirler + Kings sayfalari)
- `yurt-disi-yaz-okullari/italy/` (hub + milan + sportech + tasarim)
- `yurt-disi-universite/` (kok + switzerland)
- `yurt-disi-yaz-okullari/canada/toronto/`
- `yurt-disi-yaz-okullari/germany/frankfurt/alpadia/`

Kontrol noktalari:

- Rozet kartlari: baslik/metin hizasi, ikon konumu, kart yukseklikleri
- Grid kolonlari: `yatay-1/2/3` beklenen kolon davranisi
- `son-kart-ortala` kullanan bloklarda son kart hizasi
- Kings kurs bloklari: `rozet-kart-icerik-blok` iceren gridlerde baslik/metin kolonlari

Breakpoint hedefleri:

- 1920 / 1366 / 1179 / 900 / 768 / 501 / 390

## 3) Kabul kriterleri (Faz 3 kapanisi)

- [x] Kaldırilan sinif adlari HTML/CSS’te geri kalmamis
- [ ] Manuel checklist tamamlanmis
- [ ] Kullanici raporladigi sayfa/ekranlarda gorunum sapmasi yok

## 4) Sonraki adim (opsiyonel)

Faz 3 tamamlandiktan sonra:

- `style.css` icinde kalan buyuk tekrar bloklarinin birlestirilmesi (ayri PR/dalga)
- Kullanilmayan CSS envanterinin genisletilmesi (`reports/stage1-unused-candidates.txt` ile)

## 5) Faz 3 devam — kod tabani dogrulamalari (2026-04-26)

### Kings `:has(> .rozet-kart > .rozet-kart-icerik-blok)` kapsami

`css/style.css` icindeki ilgili kurallar yalnizca asagidaki koklar altinda:

- `.sayfa-kings-education ...`
- `body.sayfa-kings-education-los-angeles ...`

Bu sayede Kings disindaki sayfalardaki `rozet-grid.icerik-kutusu-grid.yatay-2` bloklari etkilenmez.

`:has(...)` kosulu, gridin **dogrudan cocugu** olan `article.rozet-kart` icinde yine **dogrudan cocuk** `div.rozet-kart-icerik-blok` bulunmasini ister. Ornek kontroller:

- Kurs / program ozeti bloklari: `article.rozet-kart` > `div.rozet-kart-icerik-blok` — kural **tetiklenir** (beklenen).
- Konaklama rozetleri (`rozet-ikon` + baslik + liste): `rozet-kart-icerik-blok` yok — kural **tetiklenmez** (ornek: `yurt-disi-dil-okullari/uk/bournemouth/kings-education/index.html` konaklama gridi).
- `kings-la-program-detay-grid` program detaylari: kartlar `kutu-liste` / ozel tam genis kart; `rozet-kart-icerik-blok` yok — kural **tetiklenmez**; bu grid ayri olarak `.kings-la-program-detay-grid` ile hedeflenmeye devam eder.

### Toronto konaklama miras sinifi

`toronto-konaklama-yurt-rozet-grid` ifadesi guncel `css/style.css` dosyasinda **bulunmuyor** (tamamen kaldirilmis). Eski rapor satirlari (`reports/stage1-*.txt`) gecmise ait envanter olabilir; temizlik kararinda `style.css` ve HTML esas alinmalidir.
