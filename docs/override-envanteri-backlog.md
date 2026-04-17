# Override Envanteri ve Risk Etiketli Backlog (Aşama 2)

Bu dokuman, projedeki override adaylarini tarayip `sil`, `ortaklastir`, `gecici-tut`, `karar` etiketleriyle uygulanabilir backlog'a cevirir.

## Tarama Ozeti (css/)

- `!important` gecen dosya sayisi: **12**
- `body.sayfa-*` gecen dosya sayisi: **5**
- `#id` / ID referansi gecen dosya sayisi: **16**
- En yuksek yogunluk: `css/style.css` (hem `!important`, hem `body.sayfa-*`, hem cok sayida ID)

## Dosya Bazli Yogunluk (Oncelik Sirasi)

1. `css/style.css`
   - `!important`: 100
   - `body.sayfa-*`: 100
   - `#id`/ID referansi: 697
2. `css/blog.css`
   - `!important`: 21
   - `body.sayfa-*`: 2
   - `#id`/ID referansi: 51
3. `css/site-iletisim-form.css`
   - `!important`: 35
   - `body.sayfa-*`: 1
   - `#id`/ID referansi: 16
4. `css/sss.css`
   - `!important`: 21
   - `body.sayfa-*`: 6
   - `#id`/ID referansi: 15
5. `css/site-ustmenu.css`
   - `!important`: 100
   - `#id`/ID referansi: 38

> Not: `style.css` ve `site-ustmenu.css` kritik oldugu icin burada "ilk 100" limitiyle tarandi; gercek adet daha yuksek olabilir.

## Etiket Sistemi

- `sil`: Ortak stile gecisle etkisiz veya tekrar eden override.
- `ortaklastir`: Sayfa-ozel degil, birden fazla yerde ayni ihtiyac var; ortak sinifa tasinacak.
- `gecici-tut`: Islevsel bagimlilik var (menu davranisi, checkbox tab mekanigi gibi); sonraki fazda azaltilacak.
- `karar`: Tasarim/urun karari gerektiriyor (blog temasinin marka farki gibi).

## Risk Etiketli Backlog

## P0 — Hemen Ele Alinacaklar (Yuksek Etki)

- `css/style.css` — `body.sayfa-*` ile gelen gorunum kurallari
  - Etiket: `ortaklastir` / `sil`
  - Ornek alanlar: yaz okulu detay bloklari, kampus kartlari, kvkk/gizlilik sayfa-ozel tipografi/spacing.
  - Hedef: ortak bilesen siniflarina tasiyip `body.sayfa-*` bagimliligini kaldirmak.

- `css/style.css` — yaygin `!important` kullanimlari
  - Etiket: `sil` / `ortaklastir`
  - Hedef: ozgulluk yarismasi yerine bilesen-katman duzeni kurmak.

- `css/style.css` — ID tabanli seciciler (`#...`) ile stil verme
  - Etiket: `sil` / `ortaklastir`
  - Hedef: yapisal class tabanli secicilere donus.

## P1 — Ikinci Dalga

- `css/site-iletisim-form.css`
  - Etiket: `ortaklastir`, kismen `gecici-tut`
  - Neden: form bileseni ortak ama halen `body.sayfa-*` ve cok sayida `!important` var.
  - Hedef: form bilesenini tek kaynak yapip sayfa-ozel bosluk/renk farklarini sifirlamak.

- `css/sss.css`
  - Etiket: `ortaklastir`, kismen `gecici-tut`
  - Neden: tab/accordion davranisinda ID bagimliligi var (`#sss-genel` vb.), ama gorunum tarafi ortaklastirilabilir.
  - Hedef: davranis secicilerini koruyup gorunumu class tabanina cekmek.

- `css/blog.css`
  - Etiket: `karar` + `ortaklastir`
  - Neden: blog temasi farkli renk dili kullaniyor; "fark istemiyoruz" politikasina alinacaksa tasarim karari gerekir.
  - Hedef: karar sonrasi blogu da ayni cerceve/renk standardina cekmek.

## P2 — Ustmenu ve Yardimci Dosyalar

- `css/site-ustmenu.css`
  - Etiket: `gecici-tut` -> sonra `ortaklastir`
  - Neden: responsive menu davranisinda `!important` yogun; direkt silme riski yuksek.
  - Hedef: once davranis korunarak ozgulluk sadeletme.

- `css/site-breadcrumb.css`, `css/site-yonlendirme-kart.css`
  - Etiket: `sil` / `ortaklastir`
  - Neden: daha dar kapsam, hizli kazanım.

## Ilk 50-100 Aday Icin Uygulama Kurali

1. `body.sayfa-*` ile gelen gorunum stilleri once incelenir.
2. Ayni desen birden fazla sayfada varsa ortak class'a tasinir (`ortaklastir`).
3. Tekil ve gereksiz kalanlar silinir (`sil`).
4. Davranis bagimliligi olan ID seciciler gecici tutulur (`gecici-tut`), sonraki fazda class tabanina cevrilir.

## Faz 3'e Hazir Dosya Listesi (Dalga 1 Adaylari)

- `css/style.css`
- `css/site-iletisim-form.css`
- `css/sss.css`
- `css/site-yonlendirme-kart.css`
- `css/site-breadcrumb.css`

## Takip Metriği

- `body.sayfa-*` secici sayisi (hedef: dalga dalga dusus)
- `!important` sayisi (hedef: her dalgada net azalis)
- ID ile gorunum stili veren secici sayisi (hedef: davranis disinda sifira yaklastirma)
