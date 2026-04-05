(function () {
  'use strict';
  var ENDPOINT = 'https://global-compass-paytr.canmuratsubat.workers.dev/iletisim';

  function messageForValidity(el) {
    var v = el.validity;
    if (v.valueMissing) {
      if (el.type === 'checkbox') {
        return 'Devam etmek için onay kutusunu işaretlemeniz gerekir.';
      }
      return 'Bu alan zorunludur.';
    }
    if (el.type === 'email' && (v.typeMismatch || v.badInput)) {
      return 'Geçerli bir e-posta adresi girin.';
    }
    if (v.typeMismatch || v.badInput) {
      return 'Lütfen geçerli bir değer girin.';
    }
    return el.validationMessage || 'Geçersiz değer.';
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.iletisim-alan-hata').forEach(function (s) {
      s.remove();
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('[aria-describedby^="iletisim-err-"]').forEach(function (el) {
      el.removeAttribute('aria-describedby');
    });
  }

  function removeInlineErrorAfter(field) {
    var s = field.nextElementSibling;
    if (s && s.classList && s.classList.contains('iletisim-alan-hata')) {
      s.remove();
    }
  }

  function clearFieldError(field) {
    if (!field || !field.getAttribute) return;
    removeInlineErrorAfter(field);
    field.removeAttribute('aria-invalid');
    var db = field.getAttribute('aria-describedby');
    if (db && db.indexOf('iletisim-err-') === 0) {
      field.removeAttribute('aria-describedby');
    }
  }

  function clearKimlikGroupErrors(form) {
    var graf = form.querySelector('.radyo-grup');
    if (!graf) return;
    var s = graf.nextElementSibling;
    if (s && s.classList && s.classList.contains('iletisim-alan-hata')) {
      s.remove();
    }
    form.querySelectorAll('input[type="radio"][name^="kimlik"]').forEach(function (r) {
      r.removeAttribute('aria-invalid');
      var db = r.getAttribute('aria-describedby');
      if (db && db.indexOf('iletisim-err-kimlik') === 0) {
        r.removeAttribute('aria-describedby');
      }
    });
  }

  function setFieldError(field, message) {
    removeInlineErrorAfter(field);
    field.setAttribute('aria-invalid', 'true');
    var span = document.createElement('span');
    span.className = 'iletisim-alan-hata';
    span.setAttribute('role', 'alert');
    var eid = 'iletisim-err-' + (field.name || field.id || 'alan') + '-' + String(Date.now());
    span.id = eid;
    span.textContent = message;
    field.setAttribute('aria-describedby', eid);
    field.insertAdjacentElement('afterend', span);
  }

  function setKimlikGroupError(form, message) {
    clearKimlikGroupErrors(form);
    var graf = form.querySelector('.radyo-grup');
    if (!graf) return;
    var span = document.createElement('span');
    span.className = 'iletisim-alan-hata';
    span.setAttribute('role', 'alert');
    var eid = 'iletisim-err-kimlik-' + String(Date.now());
    span.id = eid;
    span.textContent = message;
    graf.insertAdjacentElement('afterend', span);
    form.querySelectorAll('input[type="radio"][name^="kimlik"]').forEach(function (r) {
      r.setAttribute('aria-invalid', 'true');
      r.setAttribute('aria-describedby', eid);
    });
  }

  function trimTextFields(form) {
    form
      .querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea')
      .forEach(function (el) {
        el.value = typeof el.value === 'string' ? el.value.trim() : el.value;
      });
  }

  function validateAndShowErrors(form) {
    clearFormErrors(form);
    trimTextFields(form);
    if (form.checkValidity()) {
      return true;
    }
    var invalids = Array.prototype.slice.call(form.querySelectorAll(':invalid'));
    var kimlikTouched = false;
    invalids.forEach(function (el) {
      if (el.type === 'radio' && el.name && el.name.indexOf('kimlik') === 0) {
        if (!kimlikTouched) {
          setKimlikGroupError(
            form,
            'Lütfen öğrenci, veli veya diğer seçeneklerinden birini işaretleyin.'
          );
          kimlikTouched = true;
        }
        return;
      }
      setFieldError(el, messageForValidity(el));
    });
    return false;
  }

  function showBildirim(tip, metin, onKapat) {
    var kaplama = document.createElement('div');
    kaplama.className = 'iletisim-form-bildirim-kaplama';
    kaplama.setAttribute('role', 'dialog');
    kaplama.setAttribute('aria-modal', 'true');
    var baslikId = 'iletisim-bildirim-baslik-' + String(Date.now());
    kaplama.setAttribute('aria-labelledby', baslikId);

    var panel = document.createElement('div');
    panel.className =
      'iletisim-form-bildirim-panel iletisim-form-bildirim-panel--' + tip;

    var baslik = document.createElement('h3');
    baslik.id = baslikId;
    baslik.className = 'iletisim-form-bildirim-baslik';
    baslik.textContent = tip === 'basari' ? 'Teşekkürler' : 'Gönderilemedi';

    var duyuru = document.createElement('div');
    duyuru.className = 'iletisim-form-bildirim-duyuru';
    duyuru.setAttribute('aria-live', tip === 'hata' ? 'assertive' : 'polite');
    duyuru.setAttribute('aria-atomic', 'true');
    duyuru.setAttribute('role', tip === 'hata' ? 'alert' : 'status');

    var paragraf = document.createElement('p');
    paragraf.className = 'iletisim-form-bildirim-metin';
    paragraf.textContent = metin;

    duyuru.appendChild(paragraf);

    var tamam = document.createElement('button');
    tamam.type = 'button';
    tamam.className = 'ana-buton-light';
    tamam.textContent = 'Tamam';

    function kapat() {
      document.body.classList.remove('iletisim-form-bildirim-acik');
      document.removeEventListener('keydown', escKapat);
      if (kaplama.parentNode) {
        kaplama.parentNode.removeChild(kaplama);
      }
      if (typeof onKapat === 'function') {
        onKapat();
      }
    }

    function escKapat(ev) {
      if (ev.key === 'Escape') {
        kapat();
      }
    }

    tamam.addEventListener('click', kapat);
    kaplama.addEventListener('click', function (ev) {
      if (ev.target === kaplama) {
        kapat();
      }
    });

    panel.appendChild(baslik);
    panel.appendChild(duyuru);
    panel.appendChild(tamam);
    kaplama.appendChild(panel);
    document.body.classList.add('iletisim-form-bildirim-acik');
    document.addEventListener('keydown', escKapat);
    document.body.appendChild(kaplama);
    tamam.focus();
  }

  function valTrim(el) {
    if (!el || typeof el.value !== 'string') return '';
    return el.value.trim();
  }

  function valField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return valTrim(el);
  }

  function kimlikValue(form) {
    var r =
      form.querySelector('input[type="radio"][name^="kimlik"]:checked') ||
      form.querySelector('input[name="kimlik"]:checked');
    return r && r.value ? r.value : '';
  }

  function bind() {
    var form = document.getElementById('iletisim-formu');
    if (!form) return;
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('input', function (ev) {
      var t = ev.target;
      if (t && t.matches && t.matches('input:not([type="radio"]):not([type="checkbox"]), textarea')) {
        clearFieldError(t);
      }
    });

    form.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t && t.type === 'radio' && t.name && t.name.indexOf('kimlik') === 0) {
        clearKimlikGroupErrors(form);
      }
      if (t && t.type === 'checkbox') {
        clearFieldError(t);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var buton = form.querySelector('button[type="submit"]');
      if (buton) buton.disabled = true;

      if (!validateAndShowErrors(form)) {
        if (buton) buton.disabled = false;
        var firstBad =
          form.querySelector(
            'input[aria-invalid="true"]:not([type="radio"]), textarea[aria-invalid="true"]'
          ) || form.querySelector('input[type="radio"][aria-invalid="true"]');
        if (firstBad && typeof firstBad.focus === 'function') {
          firstBad.focus();
        }
        return;
      }

      var payload = {
        ad: valField(form, 'ad'),
        soyad: valField(form, 'soyad'),
        email: valField(form, 'email'),
        telefon: valField(form, 'telefon'),
        kimlik: kimlikValue(form),
        mesaj: valField(form, 'mesaj')
      };
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Hata');
          form.reset();
          clearFormErrors(form);
          showBildirim(
            'basari',
            'Mesajınız iletildi, en kısa sürede sizinle iletişime geçeceğiz.',
            function () {
              if (buton) buton.disabled = false;
            }
          );
        })
        .catch(function () {
          showBildirim(
            'hata',
            'Bir hata oluştu, lütfen tekrar deneyin.',
            function () {
              if (buton) buton.disabled = false;
            }
          );
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
