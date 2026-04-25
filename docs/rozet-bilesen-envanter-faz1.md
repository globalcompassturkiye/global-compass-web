# Rozet Bilesen Donusumu - Faz 1 Envanteri

**Tarih:** 2026-04-26  
**Referans sozlesme:** `docs/rozet-bilesen-sozlesmesi-faz0.md`  
**Kapsam:** Tum `index.html` ve ortak sinif envanteri (`reports/stage1-html-classes.txt`, `reports/stage1-css-classes.txt`)

---

## 1) Faz 1 Ciktisi

Bu fazda:

- Kart benzeri yapilar envanterlendi.
- Sinif aileleri **A / B / C** kovalarina ayrildi.
- Sonraki donusumlerde kullanilacak **esleme kurallari** donduruldu.

---

## 2) Kova Tanimlari

- **A (Dogrudan donusebilir):** Mevcut yapi zaten `rozet-grid`/`rozet-kart` omurgasina cok yakin.
- **B (Kismi donusebilir):** Kart yapisi var, fakat HTML semantigi veya alt siniflarin sadelemesi gerekiyor.
- **C (Kapsam disi):** Kart gorunumlu olsa da farkli bilesen sozlesmesine ait (program listesi, SSS, galeri, yonlendirme vb.).

---

## 3) Envanter - A (Dogrudan donusebilir)

Bu grupta cok sayida sayfa zaten hedef yapiyi kullaniyor veya cok kucuk dokunusla tam uyuma geliyor:

- `rozet-grid`, `icerik-kutusu-grid`, `yatay-*`
- `rozet-kart`
- `rozet-baslik`
- `rozet-metin`
- `rozet-ikon`, `rozet-ikon-tick`

Temsilci dosyalar:

- `yurt-disi-yuksek-lisans-mba/index.html`
- `yurt-disi-dil-okullari/usa/index.html`
- `yurt-disi-dil-okullari/uk/index.html`
- `yurt-disi-universite/index.html`
- `yurt-disi-yaz-okullari/canada/index.html`

Faz 2'de aksiyon:

- Bu sayfalarda yeni kart ihtiyaclari sadece Faz 0 sozlesmesiyle acilacak.
- A grubunda yeni page-specific kart sinifi uretilmeyecek.

---

## 4) Envanter - B (Kismi donusebilir)

Bu grupta kart/grid semantigi guclu ama sinif isimleri marka/lokasyon odakli. Donusumde once HTML eslemesi, sonra CSS sadeleme gerekecek.

### B1 - Rozet varyanti kullanan alt gridler

- `*-neden-rozet-grid`
- `*-program-rozet-grid`
- `*-sosyal-rozet-grid`
- `*-avantaj-rozet-grid`

Ornek aileler:

- `londra-neden-rozet-grid`, `oxford-neden-rozet-grid`, `bournemouth-neden-rozet-grid`
- `italy-avantaj-rozet-grid`, `milan-avantaj-rozet-grid`
- `toronto-aktivite-rozet-grid`, `japan-tercih-grid`

### B2 - Kart ama rozet-disinda adlandirma

- `*-program-kart`, `*-avantaj-kart`, `*-detay-kart`, `*-konaklama-kart`
- `hizmet-adim-kart`, `burs-program-kart`, `kings-*-kart`, `sbc-*-kart`

Temsilci dosyalar:

- `yurt-disi-yaz-okullari/germany/frankfurt/alpadia/index.html`
- `yurt-disi-yaz-okullari/uk/bournemouth/summer-boarding-courses-canford/index.html`
- `yurt-disi-dil-okullari/usa/los-angeles/kings-education/index.html`
- `yurt-disi-yaz-okullari/switzerland/swiss-education-academy/index.html`

Faz 2-3'te aksiyon:

- Kart kapsayicilari `rozet-kart`a eslenecek.
- Basliklar `h3.rozet-baslik`, aciklamalar `p.rozet-metin`a cekilecek.
- Sadece davranissal/gorsel zorunluluklar icin minimum modifier tutulacak.

---

## 5) Envanter - C (Kapsam disi)

Bu yapilar kart gorunumlu olsa da rozet sozlesmesiyle birlestirilmeyecek:

- `premium-liste-kart` / `modern-okul-listesi` (program secim bandi)
- `yonlendirme-karti` / `kart-link` (alt yonlendirme)
- `sss-item` / `sss-alani` (SSS)
- Galeri kartlari (`*-galeri-*`, `figure` tabanli bloklar)
- Form kartlari (`iletisim-form-beyaz-cerceve`, odeme/form ozel bloklari)

Not: C grubundaki bilesenler kendi standartlariyla devam eder; rozet donusum kapsaminda degildir.

---

## 6) Faz 1 Esleme Kurali (Donusum Tablosu)

- `X-grid` (kart amacli) -> `rozet-grid icerik-kutusu-grid yatay-*`
- `X-kart` (icerik karti) -> `rozet-kart`
- `X-kart-baslik` / `X-baslik` -> `rozet-baslik`
- `X-kart-metin` / `X-metin` -> `rozet-metin`
- Numara/tik ikonlari -> `rozet-ikon` veya `rozet-ikon rozet-ikon-tick`

Ek kural:

- Kartta baslik+metin tek paragrafta birlestirilmeyecek.
- Sira: ikon (opsiyonel) -> baslik -> metin.

---

## 7) Faz 2 Hazir Backlog (Ilk Donusum Dalgasi)

1. `yurt-disi-dil-okullari/uk/` ailesi (`uk`, `london`, `oxford`, `bournemouth`)
2. `yurt-disi-dil-okullari/usa/` ailesi (hub + sehirler)
3. `yurt-disi-yaz-okullari/italy/` ailesi (milan + sportech altlari)
4. `yurt-disi-yaz-okullari/switzerland/` ailesi (swiss + chantemerle + bhms yaz)

Her dalgada hedef:

- Once HTML sinif eslemesi
- Sonra gereksiz page-specific kart CSS temizligi
- Son adimda responsive regressyon kontrolu

---

## 8) Faz 1 Kabul Durumu

- [x] Kart/grid siniflari A/B/C olarak siniflandirildi
- [x] Rozet sozlesmesine gore esleme kurali yazildi
- [x] Faz 2 icin oncelikli donusum backlogu cikarildi

Bu dokuman Faz 1 envanter cikti dosyasidir; kod refaktoru Faz 2 ile baslar.

Faz 2 uygulama notu: `docs/rozet-bilesen-faz2-uygulama.md`.
