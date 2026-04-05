(function () {
  'use strict';

  var SIPARIS_URL = 'https://global-compass-paytr.canmuratsubat.workers.dev/siparis?id=';
  var PAY_URL = 'https://global-compass-paytr.canmuratsubat.workers.dev';

  var LOCALE = {
    tr: {
      invalidLink: 'Geçersiz ödeme bağlantısı.',
      amountPrefix: 'Ödenecek Tutar: ',
      orderPrefix: 'Sipariş: ',
      fillAll: 'Lütfen tüm alanları doldurun.',
      payServiceErr: function (status) {
        return 'Ödeme servisine ulaşılamadı. (' + status + ')';
      },
      unexpectedToken: 'Ödeme başlatılırken beklenmeyen bir cevap alındı.',
      payInitErr: function (msg) {
        return 'Ödeme başlatılırken bir hata oluştu: ' + msg;
      },
      modalClose: 'Kapat',
      localeNum: 'tr-TR',
      merchantOk: null,
      merchantFail: null
    },
    ru: {
      invalidLink: 'Недействительная ссылка для оплаты.',
      amountPrefix: 'Сумма к оплате: ',
      orderPrefix: 'Заказ: ',
      fillAll: 'Пожалуйста, заполните все поля.',
      payServiceErr: function (status) {
        return 'Платёжный сервис недоступен. (' + status + ')';
      },
      unexpectedToken: 'Неожиданный ответ при инициализации платежа.',
      payInitErr: function (msg) {
        return 'При инициализации платежа произошла ошибка: ' + msg;
      },
      modalClose: 'Закрыть',
      localeNum: 'ru-RU',
      merchantOk: '/payment-ok/ru/',
      merchantFail: '/payment-failed/ru/'
    }
  };

  function localeKey() {
    var lang = (document.documentElement.getAttribute('lang') || 'tr').toLowerCase();
    return lang.indexOf('ru') === 0 ? 'ru' : 'tr';
  }

  function bind() {
    var L = LOCALE[localeKey()];
    var form = document.getElementById('odeme-formu');
    var hataKutusu = document.getElementById('odeme-hata');
    var buton = document.getElementById('odeme-buton');
    var tutarInput = document.getElementById('tutar');
    var siparisInput = document.getElementById('siparis-id');
    var siparisBilgi = document.getElementById('siparis-bilgi');
    var tutarGorunum = document.getElementById('tutar-gorunum');

    function gosterHata(mesaj) {
      if (!hataKutusu) return;
      hataKutusu.textContent = mesaj;
      hataKutusu.style.display = 'block';
    }

    function temizleHata() {
      if (!hataKutusu) return;
      hataKutusu.textContent = '';
      hataKutusu.style.display = 'none';
    }

    (function hazirlaSiparis() {
      var params = new URLSearchParams(window.location.search || '');
      var urlId = params.get('id');
      if (!urlId) {
        gosterHata(L.invalidLink);
        if (buton) buton.disabled = true;
        return;
      }

      if (siparisInput) {
        siparisInput.value = urlId;
      }

      fetch(SIPARIS_URL + encodeURIComponent(urlId))
        .then(function (res) {
          if (!res.ok) {
            throw new Error('fetch_failed');
          }
          return res.json();
        })
        .then(function (data) {
          if (!data || typeof data.tutar === 'undefined') {
            throw new Error('no_amount');
          }
          if (tutarInput) {
            tutarInput.value = data.tutar;
          }
          if (tutarGorunum) {
            var sayi = Number(data.tutar);
            if (!isNaN(sayi)) {
              var formatted = sayi.toLocaleString(L.localeNum, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
              tutarGorunum.textContent = L.amountPrefix + formatted + ' TL';
            }
          }
          if (siparisBilgi && data.ad) {
            siparisBilgi.textContent = L.orderPrefix + data.ad;
          }
        })
        .catch(function (err) {
          console.error(err);
          gosterHata(L.invalidLink);
          if (buton) buton.disabled = true;
        });
    })();

    function olusturModal(token) {
      var kaplama = document.createElement('div');
      kaplama.className = 'odeme-modal-kaplama';

      var icerik = document.createElement('div');
      icerik.className = 'odeme-modal-icerik';

      var kapat = document.createElement('button');
      kapat.className = 'odeme-modal-kapat';
      kapat.type = 'button';
      kapat.textContent = L.modalClose;
      kapat.addEventListener('click', function () {
        document.body.removeChild(kaplama);
      });

      var iframe = document.createElement('iframe');
      iframe.className = 'odeme-modal-iframe';
      iframe.src = 'https://www.paytr.com/odeme/guvenli/' + encodeURIComponent(token);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'auto');
      iframe.setAttribute('allowfullscreen', 'true');

      icerik.appendChild(kapat);
      icerik.appendChild(iframe);
      kaplama.appendChild(icerik);
      document.body.appendChild(kaplama);
    }

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      temizleHata();

      if (!buton) return;
      buton.disabled = true;

      var ad = document.getElementById('ad').value.trim();
      var soyad = document.getElementById('soyad').value.trim();
      var email = document.getElementById('email').value.trim();
      var telefon = document.getElementById('telefon').value.trim();
      var tutar = tutarInput ? tutarInput.value.trim() : '';
      var siparisId = siparisInput ? siparisInput.value.trim() : '';

      if (!ad || !soyad || !email || !telefon || !tutar || !siparisId) {
        gosterHata(L.fillAll);
        buton.disabled = false;
        return;
      }

      var payload = {
        ad: ad,
        soyad: soyad,
        email: email,
        telefon: telefon,
        tutar: tutar,
        siparis_id: siparisId
      };
      if (L.merchantOk && L.merchantFail) {
        payload.merchant_ok_url = L.merchantOk;
        payload.merchant_fail_url = L.merchantFail;
      }

      fetch(PAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error(L.payServiceErr(res.status));
          }
          return res.json();
        })
        .then(function (data) {
          var token = data && (data.token || data.TOKEN || data.paytr_token);
          if (!token) {
            throw new Error(L.unexpectedToken);
          }
          olusturModal(token);
        })
        .catch(function (err) {
          console.error(err);
          gosterHata(L.payInitErr(err.message));
        })
        .finally(function () {
          buton.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
