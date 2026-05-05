(function () {
  'use strict';
  var SUBMIT_URL = '/api/submit-form';

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

  function wireKvkkCheckbox(form) {
    if (form.querySelector('input[name="kvkk_onay"]')) return;
    var cb =
      form.querySelector('.kvkk-alani input[type="checkbox"]') ||
      form.querySelector('input[type="checkbox"][id^="kvkk-onay"]') ||
      form.querySelector('#kvkk-onay');
    if (cb) {
      cb.name = 'kvkk_onay';
      if (!cb.getAttribute('value')) cb.setAttribute('value', '1');
      cb.required = true;
      return;
    }
    injectKvkkRow(form);
  }

  function injectKvkkRow(form) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn || !btn.parentNode) return;
    var id = 'iletisim-kvkk-' + String(Date.now());
    var row = document.createElement('div');
    row.className = 'kvkk-satir';
    var alan = document.createElement('div');
    alan.className = 'kvkk-alani';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'kvkk_onay';
    cb.id = id;
    cb.value = '1';
    cb.required = true;
    var lab = document.createElement('label');
    lab.setAttribute('for', id);
    var a = document.createElement('a');
    a.href = '/kvkk-aydinlatma-metni/';
    a.className = 'kvkk-link';
    a.textContent = 'KVKK Aydınlatma Metnini';
    lab.appendChild(a);
    lab.appendChild(document.createTextNode(' Okudum*'));
    alan.appendChild(cb);
    alan.appendChild(lab);
    row.appendChild(alan);
    btn.parentNode.insertBefore(row, btn);
  }

  function kvkkAccepted(form) {
    var el = form.querySelector('input[name="kvkk_onay"]');
    return !!(el && el.checked);
  }

  function enforceAllFieldsRequired(form) {
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (!el || el.disabled || el.readOnly) return;
      var t = (el.type || '').toLowerCase();
      if (t === 'hidden' || t === 'submit' || t === 'button' || t === 'reset') return;
      el.required = true;
    });
  }

  function pageH1Text() {
    var h1 = document.querySelector('h1');
    if (!h1) return '';
    return (h1.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function bind() {
    var form = document.getElementById('iletisim-formu');
    if (!form) return;
    form.setAttribute('novalidate', 'novalidate');
    wireKvkkCheckbox(form);
    enforceAllFieldsRequired(form);

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
            'input[aria-invalid="true"]:not([type="radio"]), textarea[aria-invalid="true"], input[type="checkbox"][aria-invalid="true"]'
          ) || form.querySelector('input[type="radio"][aria-invalid="true"]');
        if (firstBad && typeof firstBad.focus === 'function') {
          firstBad.focus();
        }
        return;
      }

      var tipVal = kimlikValue(form);
      var payload = {
        ad: valField(form, 'ad'),
        soyad: valField(form, 'soyad'),
        email: valField(form, 'email'),
        telefon: valField(form, 'telefon'),
        tip: tipVal,
        ilgilenilen_program: valField(form, 'hangi_program'),
        hedef_ulke: valField(form, 'hedef_ulke'),
        mesaj: valField(form, 'mesaj'),
        landing_page: pageH1Text(),
        kvkk_onay: kvkkAccepted(form) ? 1 : 0
      };
      postSubmit(payload)
        .then(function () {
          form.reset();
          clearFormErrors(form);
          wireKvkkCheckbox(form);
          enforceAllFieldsRequired(form);
          showBildirim(
            'basari',
            'Mesajınız iletildi, teşekkür ederiz.',
            function () {
              if (buton) buton.disabled = false;
            }
          );
        })
        .catch(function (err) {
          var msg =
            err && typeof err.message === 'string' && err.message.length > 0
              ? err.message
              : 'Bir hata oluştu, lütfen tekrar deneyin.';
          showBildirim('hata', msg, function () {
            if (buton) buton.disabled = false;
          });
        });
    });
  }

  function postSubmit(payload) {
    return fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var msg = 'Bir hata oluştu, lütfen tekrar deneyin.';
          if (t) {
            try {
              var j = JSON.parse(t);
              if (j && typeof j.error === 'string' && j.error.length > 0) {
                msg = j.error;
                if (typeof j.detail === 'string' && j.detail.length > 0) {
                  msg = msg + ' (' + j.detail + ')';
                }
              }
            } catch (parseErr) {
              if (t.length < 200) msg = t;
            }
          }
          throw new Error(msg);
        });
      }
      return res;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
