(function () {
  'use strict';
  var SUBMIT_URL = '/api/submit-form';
  var COUNTRIES_URL = '/api/countries';
  var countriesCache = null;
  var TURNSTILE_SCRIPT =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

  function turnstileSiteKey() {
    var k =
      typeof window !== 'undefined' && window.NEXT_PUBLIC_TURNSTILE_SITE_KEY != null
        ? String(window.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
        : '';
    return k.trim();
  }

  function loadScript(src, attrName, done) {
    if (document.querySelector('script[' + attrName + ']')) {
      done();
      return;
    }
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.setAttribute(attrName, '1');
    s.onload = function () {
      done();
    };
    s.onerror = function () {
      done();
    };
    document.head.appendChild(s);
  }

  function ensureTurnstileEnv(done) {
    loadScript('/js/turnstile-env.js', 'data-turnstile-env', done);
  }

  function ensureTurnstileApi(done) {
    if (window.turnstile && typeof window.turnstile.render === 'function') {
      done();
      return;
    }
    loadScript(TURNSTILE_SCRIPT, 'data-cf-turnstile-api', function () {
      var n = 0;
      function waitReady() {
        if (window.turnstile && typeof window.turnstile.render === 'function') {
          done();
          return;
        }
        n += 1;
        if (n > 50) {
          done();
          return;
        }
        setTimeout(waitReady, 50);
      }
      waitReady();
    });
  }

  function getTurnstileToken(form) {
    if (form && form._turnstileToken) return String(form._turnstileToken);
    var input =
      form &&
      (form.querySelector('input[name="cf-turnstile-response"]') ||
        form.querySelector('textarea[name="cf-turnstile-response"]'));
    return input && input.value ? String(input.value).trim() : '';
  }

  function resetTurnstile(form) {
    form._turnstileToken = '';
    if (
      form._turnstileWidgetId != null &&
      window.turnstile &&
      typeof window.turnstile.reset === 'function'
    ) {
      try {
        window.turnstile.reset(form._turnstileWidgetId);
      } catch (err) {
        /* widget yoksa yoksay */
      }
    }
  }

  function clearTurnstileError(form) {
    var wrap = form.querySelector('.turnstile-wrap');
    if (!wrap) return;
    var s = wrap.nextElementSibling;
    if (s && s.classList && s.classList.contains('iletisim-alan-hata')) {
      s.remove();
    }
  }

  function setTurnstileError(form, message) {
    clearTurnstileError(form);
    var wrap = form.querySelector('.turnstile-wrap');
    if (!wrap) return;
    var span = document.createElement('span');
    span.className = 'iletisim-alan-hata';
    span.setAttribute('role', 'alert');
    span.textContent = message;
    wrap.insertAdjacentElement('afterend', span);
  }

  function mountTurnstile(form) {
    ensureTurnstileEnv(function () {
      var key = turnstileSiteKey();
      if (!key) return;
      if (form.querySelector('.turnstile-wrap')) return;

      var wrap = document.createElement('div');
      wrap.className = 'turnstile-wrap';
      var slot = document.createElement('div');
      slot.className = 'cf-turnstile-slot';
      wrap.appendChild(slot);

      var kvkk = form.querySelector('.kvkk-satir');
      var btn = form.querySelector('button[type="submit"]');
      if (kvkk && kvkk.parentNode) {
        kvkk.parentNode.insertBefore(wrap, kvkk);
      } else if (btn && btn.parentNode) {
        btn.parentNode.insertBefore(wrap, btn);
      } else {
        form.appendChild(wrap);
      }

      ensureTurnstileApi(function () {
        if (!window.turnstile || typeof window.turnstile.render !== 'function') return;
        form._turnstileToken = '';
        form._turnstileWidgetId = window.turnstile.render(slot, {
          sitekey: key,
          callback: function (token) {
            form._turnstileToken = token || '';
            clearTurnstileError(form);
          },
          'expired-callback': function () {
            form._turnstileToken = '';
          },
          'error-callback': function () {
            form._turnstileToken = '';
          }
        });
      });
    });
  }

  function messageForValidity(el) {
    var v = el.validity;
    var label = fieldLabel(el);
    if (v.valueMissing) {
      if (el.type === 'checkbox') {
        return 'Devam etmek için onay kutusunu işaretlemeniz gerekir.';
      }
      if (label) {
        return label + ' alanı zorunludur.';
      }
      return 'Bu alan zorunludur.';
    }
    if (el.type === 'email' && (v.typeMismatch || v.badInput)) {
      return 'Geçerli bir e-posta adresi girin (örnek: ad@ornek.com).';
    }
    if (el.type === 'tel' && (v.typeMismatch || v.badInput)) {
      return 'Geçerli bir telefon numarası girin.';
    }
    if (v.typeMismatch || v.badInput) {
      return label ? label + ' için geçerli bir değer girin.' : 'Lütfen geçerli bir değer girin.';
    }
    return el.validationMessage || 'Geçersiz değer.';
  }

  function fieldLabel(el) {
    if (!el) return '';
    if (el.placeholder) return el.placeholder.replace(/\*+$/, '').trim();
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    return '';
  }

  function defaultHttpErrorMessage(status) {
    if (status === 400) {
      return 'Gönderdiğiniz bilgiler eksik veya hatalı. Lütfen formu kontrol edip tekrar deneyin.';
    }
    if (status === 413) {
      return 'Mesajınız çok uzun. Lütfen kısaltıp tekrar deneyin.';
    }
    if (status === 429) {
      return 'Bu e-posta veya telefon ile bugün en fazla 5 bilgi isteği gönderebilirsiniz. Lütfen yarın tekrar deneyin veya bizi arayın.';
    }
    if (status === 503) {
      return 'Form şu an hizmet dışı. Lütfen daha sonra tekrar deneyin veya telefonla bize ulaşın.';
    }
    if (status >= 500) {
      return 'Formunuz kaydedilemedi. Lütfen birkaç dakika sonra tekrar deneyin.';
    }
    return 'Form gönderilemedi. Lütfen tekrar deneyin.';
  }

  function parseSubmitErrorResponse(res, bodyText) {
    if (bodyText) {
      try {
        var j = JSON.parse(bodyText);
        if (j && typeof j.error === 'string' && j.error.length > 0) {
          return j.error;
        }
      } catch (parseErr) {
        /* sunucu JSON döndürmediyse varsayılan mesaj kullanılır */
      }
    }
    return defaultHttpErrorMessage(res && res.status ? res.status : 0);
  }

  function submitErrorMessage(err) {
    if (err && typeof err.message === 'string' && err.message.length > 0) {
      return err.message;
    }
    return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
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
            'Lütfen öğrenci veya veli seçeneklerinden birini işaretleyin.'
          );
          kimlikTouched = true;
        }
        return;
      }
      setFieldError(el, messageForValidity(el));
    });
    return false;
  }

  function hideIletiliyor() {
    var mevcut = document.querySelector(
      '.iletisim-form-bildirim-kaplama.iletisim-form-bildirim-kaplama--iletilyor'
    );
    if (mevcut && mevcut.parentNode) {
      mevcut.parentNode.removeChild(mevcut);
    }
    if (!document.querySelector('.iletisim-form-bildirim-kaplama')) {
      document.body.classList.remove('iletisim-form-bildirim-acik');
    }
  }

  function showIletiliyor() {
    hideIletiliyor();
    var kaplama = document.createElement('div');
    kaplama.className =
      'iletisim-form-bildirim-kaplama iletisim-form-bildirim-kaplama--iletilyor';
    kaplama.setAttribute('role', 'dialog');
    kaplama.setAttribute('aria-modal', 'true');
    kaplama.setAttribute('aria-busy', 'true');
    var baslikId = 'iletisim-bildirim-iletilyor-' + String(Date.now());
    kaplama.setAttribute('aria-labelledby', baslikId);

    var panel = document.createElement('div');
    panel.className =
      'iletisim-form-bildirim-panel iletisim-form-bildirim-panel--iletilyor';

    var spinner = document.createElement('div');
    spinner.className = 'iletisim-form-bildirim-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    var baslik = document.createElement('h3');
    baslik.id = baslikId;
    baslik.className = 'iletisim-form-bildirim-baslik';
    baslik.textContent = 'İletiliyor…';

    var duyuru = document.createElement('div');
    duyuru.className = 'iletisim-form-bildirim-duyuru';
    duyuru.setAttribute('aria-live', 'polite');
    duyuru.setAttribute('aria-atomic', 'true');
    duyuru.setAttribute('role', 'status');

    var paragraf = document.createElement('p');
    paragraf.className = 'iletisim-form-bildirim-metin';
    paragraf.textContent = 'Mesajınız gönderiliyor, lütfen bekleyin…';

    duyuru.appendChild(paragraf);
    panel.appendChild(spinner);
    panel.appendChild(baslik);
    panel.appendChild(duyuru);
    kaplama.appendChild(panel);
    document.body.classList.add('iletisim-form-bildirim-acik');
    document.body.appendChild(kaplama);
  }

  function showBildirim(tip, metin, onKapat) {
    hideIletiliyor();
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

  function hedefUlkeFromForm(form) {
    var sel = form.querySelector('select[name="hedef_ulke_country_id"]');
    if (!sel || !sel.value) {
      return { id: '', name: '' };
    }
    var opt = sel.options[sel.selectedIndex];
    var enName =
      (opt && opt.getAttribute('data-name')) ||
      (opt && opt.textContent) ||
      '';
    return {
      id: String(sel.value),
      name: String(enName).trim()
    };
  }

  function fillCountryOptions(select, list) {
    if (!select || !list || !list.length) return;
    var existing = {};
    Array.prototype.forEach.call(select.options, function (o) {
      if (o.value) existing[o.value] = true;
    });
    list.forEach(function (c) {
      var id = String(c.id);
      if (!id || existing[id]) return;
      var o = document.createElement('option');
      o.value = id;
      o.setAttribute('data-name', c.name || '');
      o.textContent = c.label || c.name || id;
      select.appendChild(o);
    });
  }

  function loadCountriesIntoSelect(select) {
    if (!select) return;
    if (countriesCache) {
      fillCountryOptions(select, countriesCache);
      return;
    }
    fetch(COUNTRIES_URL, { method: 'GET', headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('countries ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var list = data && data.countries ? data.countries : [];
        countriesCache = list;
        fillCountryOptions(select, list);
      })
      .catch(function () {
        /* liste yüklenemezse select boş kalır; gönderimde sunucu doğrular */
      });
  }

  /** Metin hedef_ulke alanını D1 ülkeleri select'ine çevirir (tüm form sayfaları). */
  function upgradeHedefUlkeField(form) {
    if (!form) return;
    if (form.querySelector('select[name="hedef_ulke_country_id"]')) {
      loadCountriesIntoSelect(form.querySelector('select[name="hedef_ulke_country_id"]'));
      return;
    }
    var input = form.querySelector('input[name="hedef_ulke"]');
    if (!input || !input.parentNode) return;

    var select = document.createElement('select');
    select.name = 'hedef_ulke_country_id';
    select.id = input.id || 'hedef-ulke';
    select.required = true;
    var aria = input.getAttribute('aria-label') || 'Hedeflediğiniz Ülke?';
    select.setAttribute('aria-label', aria);

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = input.getAttribute('placeholder') || 'Hedeflediğiniz Ülke?';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    input.parentNode.replaceChild(select, input);
    loadCountriesIntoSelect(select);
  }

  function kimlikValue(form) {
    var r =
      form.querySelector('input[type="radio"][name^="kimlik"]:checked') ||
      form.querySelector('input[name="kimlik"]:checked');
    return r && r.value ? r.value : '';
  }

  /** Öğrenciyim / Veliyim seçimini formun en başına taşır (HTML’e dokunmadan). */
  function moveKimlikToTop(form) {
    if (!form || form.getAttribute('data-kimlik-top') === '1') return;
    var radioGrup = form.querySelector('.radyo-grup');
    if (!radioGrup) return;
    var block = radioGrup.closest('.form-grup') || radioGrup;
    if (!block || !block.parentNode) return;
    form.insertBefore(block, form.firstChild);
    form.setAttribute('data-kimlik-top', '1');
  }

  /** GG.AA.YYYY / GG/AA/YYYY / YYYY-MM-DD veya düz yaş (1–120). */
  function parseDogumTarihiVeyaYas(raw) {
    var s = String(raw || '').trim();
    if (!s) {
      return { ok: false, error: 'Doğum tarihi veya yaş alanı zorunludur.' };
    }
    if (/^\d{1,3}$/.test(s)) {
      var ageNum = Number(s);
      if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
        return { ok: false, error: 'Geçerli bir yaş girin (1–120).' };
      }
      return {
        ok: true,
        age: ageNum,
        birthIso: '',
        isUnder18: ageNum < 18
      };
    }
    var m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    var y;
    var mo;
    var d;
    if (m) {
      d = Number(m[1]);
      mo = Number(m[2]);
      y = Number(m[3]);
    } else {
      m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) {
        return {
          ok: false,
          error: 'Doğum tarihi GG.AA.YYYY veya yaş (ör. 16) olarak girin.'
        };
      }
      y = Number(m[1]);
      mo = Number(m[2]);
      d = Number(m[3]);
    }
    if (!y || !mo || !d || mo < 1 || mo > 12 || d < 1 || d > 31) {
      return { ok: false, error: 'Geçerli bir doğum tarihi girin.' };
    }
    var birth = new Date(y, mo - 1, d);
    if (
      birth.getFullYear() !== y ||
      birth.getMonth() !== mo - 1 ||
      birth.getDate() !== d
    ) {
      return { ok: false, error: 'Geçerli bir doğum tarihi girin.' };
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (birth > today) {
      return { ok: false, error: 'Doğum tarihi gelecekte olamaz.' };
    }
    var age = today.getFullYear() - y;
    if (
      today.getMonth() + 1 < mo ||
      (today.getMonth() + 1 === mo && today.getDate() < d)
    ) {
      age -= 1;
    }
    if (age < 0 || age > 120) {
      return { ok: false, error: 'Geçerli bir doğum tarihi girin.' };
    }
    var mm = mo < 10 ? '0' + mo : String(mo);
    var dd = d < 10 ? '0' + d : String(d);
    return {
      ok: true,
      age: age,
      birthIso: y + '-' + mm + '-' + dd,
      isUnder18: age < 18
    };
  }

  function makeTextInput(opts) {
    var wrap = document.createElement('div');
    wrap.className = 'form-alan';
    var input = document.createElement('input');
    input.type = opts.type || 'text';
    input.name = opts.name;
    input.id = opts.id;
    input.maxLength = opts.maxLength || 120;
    if (opts.autocomplete) input.autocomplete = opts.autocomplete;
    input.placeholder = opts.placeholder;
    input.setAttribute('aria-label', opts.ariaLabel || opts.placeholder);
    input.disabled = true;
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  function ensureYasVeliUi(form) {
    if (!form) return null;
    var existing = form.querySelector('.iletisim-yas-veli-wrap');
    if (existing) {
      // Eski tek satırlı "adı soyadı" alanını yeni ad+soyad yapısına yükselt
      if (
        existing.querySelector('input[name="veli_ad_soyad"]') &&
        !existing.querySelector('input[name="veli_ad"]')
      ) {
        existing.parentNode.removeChild(existing);
      } else {
        return existing;
      }
    }

    var radioGrup = form.querySelector('.radyo-grup');
    if (!radioGrup || !radioGrup.parentNode) return null;
    var insertAfter = radioGrup.closest('.form-grup') || radioGrup;

    var wrap = document.createElement('div');
    wrap.className = 'iletisim-yas-veli-wrap';

    var yasBlok = document.createElement('div');
    yasBlok.className = 'form-grup iletisim-yas-blok';
    yasBlok.hidden = true;
    var yasField = makeTextInput({
      name: 'dogum_tarihi_veya_yas',
      id: 'dogum-tarihi-veya-yas',
      maxLength: 32,
      autocomplete: 'bday',
      placeholder: 'Doğum Tarihi (GG.AA.YYYY) veya Yaş',
      ariaLabel: 'Doğum Tarihi (GG.AA.YYYY) veya Yaş'
    });
    yasBlok.appendChild(yasField.wrap);

    var veliAdSoyadSatir = document.createElement('div');
    veliAdSoyadSatir.className = 'form-satir iletisim-veli-blok iletisim-veli-ad-soyad';
    veliAdSoyadSatir.hidden = true;
    var veliAd = makeTextInput({
      name: 'veli_ad',
      id: 'veli-ad',
      maxLength: 120,
      autocomplete: 'given-name',
      placeholder: 'Velinizin Adı*',
      ariaLabel: 'Velinizin Adı'
    });
    var veliSoyad = makeTextInput({
      name: 'veli_soyad',
      id: 'veli-soyad',
      maxLength: 120,
      autocomplete: 'family-name',
      placeholder: 'Velinizin Soyadı*',
      ariaLabel: 'Velinizin Soyadı'
    });
    veliAdSoyadSatir.appendChild(veliAd.wrap);
    veliAdSoyadSatir.appendChild(veliSoyad.wrap);

    var veliTelSatir = document.createElement('div');
    veliTelSatir.className = 'form-satir iletisim-veli-blok iletisim-veli-telefon';
    veliTelSatir.hidden = true;
    var veliTel = makeTextInput({
      type: 'tel',
      name: 'veli_telefon',
      id: 'veli-telefon',
      maxLength: 64,
      autocomplete: 'tel',
      placeholder: 'Velinizin Telefonu*',
      ariaLabel: 'Velinizin Telefonu'
    });
    veliTelSatir.appendChild(veliTel.wrap);

    wrap.appendChild(yasBlok);
    wrap.appendChild(veliAdSoyadSatir);
    wrap.appendChild(veliTelSatir);
    insertAfter.parentNode.insertBefore(wrap, insertAfter.nextSibling);
    return wrap;
  }

  function setVeliFieldsState(form, under18) {
    var veliAd = form.querySelector('input[name="veli_ad"]');
    var veliSoyad = form.querySelector('input[name="veli_soyad"]');
    var veliTel = form.querySelector('input[name="veli_telefon"]');
    var adSoyadBlok = form.querySelector('.iletisim-veli-ad-soyad');
    var telBlok = form.querySelector('.iletisim-veli-telefon');
    if (!veliAd || !veliSoyad || !veliTel || !adSoyadBlok || !telBlok) return;

    adSoyadBlok.hidden = !under18;
    telBlok.hidden = !under18;
    [veliAd, veliSoyad, veliTel].forEach(function (el) {
      el.disabled = !under18;
      el.required = under18;
      if (!under18) {
        el.value = '';
        clearFieldError(el);
      }
    });
  }

  function syncYasVeliFields(form) {
    ensureYasVeliUi(form);
    var kimlik = kimlikValue(form);
    var yasBlok = form.querySelector('.iletisim-yas-blok');
    var yasInput = form.querySelector('input[name="dogum_tarihi_veya_yas"]');
    if (!yasBlok || !yasInput) return;

    var isOgrenci = kimlik === 'ogrenci';
    yasBlok.hidden = !isOgrenci;
    yasInput.disabled = !isOgrenci;
    yasInput.required = isOgrenci;
    if (!isOgrenci) {
      yasInput.value = '';
      clearFieldError(yasInput);
      setVeliFieldsState(form, false);
      return;
    }

    var parsed = parseDogumTarihiVeyaYas(yasInput.value);
    var under18 = parsed.ok && parsed.isUnder18 === true;
    setVeliFieldsState(form, under18);
  }

  function readYasVeliState(form) {
    var kimlik = kimlikValue(form);
    if (kimlik !== 'ogrenci') {
      return {
        ok: true,
        isOgrenci: false,
        isUnder18: false,
        age: null,
        birthIso: '',
        veliAd: '',
        veliSoyad: '',
        veliTelefon: ''
      };
    }
    var yasInput = form.querySelector('input[name="dogum_tarihi_veya_yas"]');
    var parsed = parseDogumTarihiVeyaYas(yasInput ? yasInput.value : '');
    if (!parsed.ok) {
      return { ok: false, error: parsed.error, field: yasInput };
    }
    if (!parsed.isUnder18) {
      return {
        ok: true,
        isOgrenci: true,
        isUnder18: false,
        age: parsed.age,
        birthIso: parsed.birthIso,
        veliAd: '',
        veliSoyad: '',
        veliTelefon: ''
      };
    }
    var veliAdEl = form.querySelector('input[name="veli_ad"]');
    var veliSoyadEl = form.querySelector('input[name="veli_soyad"]');
    var veliTelEl = form.querySelector('input[name="veli_telefon"]');
    var veliAd = valTrim(veliAdEl);
    var veliSoyad = valTrim(veliSoyadEl);
    var veliTelefon = valTrim(veliTelEl);
    if (!veliAd) {
      return {
        ok: false,
        error: '18 yaş altı başvurularda velinizin adı zorunludur.',
        field: veliAdEl
      };
    }
    if (!veliSoyad) {
      return {
        ok: false,
        error: '18 yaş altı başvurularda velinizin soyadı zorunludur.',
        field: veliSoyadEl
      };
    }
    if (!veliTelefon) {
      return {
        ok: false,
        error: '18 yaş altı başvurularda velinizin telefonu zorunludur.',
        field: veliTelEl
      };
    }
    return {
      ok: true,
      isOgrenci: true,
      isUnder18: true,
      age: parsed.age,
      birthIso: parsed.birthIso,
      veliAd: veliAd,
      veliSoyad: veliSoyad,
      veliTelefon: veliTelefon
    };
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
      if (el.closest && el.closest('[hidden]')) return;
      el.required = true;
    });
  }

  /** Hata mesajlarının flex satırında input’u ezmemesi için her alanı sarar. */
  function wrapFormSatirFields(form) {
    if (!form) return;
    form.querySelectorAll('.form-satir').forEach(function (row) {
      var children = Array.prototype.slice.call(row.children);
      children.forEach(function (el) {
        if (!el || !el.tagName) return;
        if (el.classList && el.classList.contains('form-alan')) return;
        if (el.classList && el.classList.contains('iletisim-alan-hata')) return;
        var tag = el.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') return;
        var wrap = document.createElement('div');
        wrap.className = 'form-alan';
        row.insertBefore(wrap, el);
        wrap.appendChild(el);
      });
    });
  }

  function pageH1Text() {
    var h1 = document.querySelector('h1');
    if (!h1) return '';
    return (h1.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findIletisimForms() {
    var list = [];
    var seen = {};
    function add(f) {
      if (!f || !f.tagName || f.tagName.toLowerCase() !== 'form') return;
      var id = f.id || '';
      var key = id || String(list.length);
      if (seen[key]) return;
      seen[key] = true;
      list.push(f);
    }
    add(document.getElementById('iletisim-formu'));
    document.querySelectorAll('form[id^="iletisim-formu"]').forEach(add);
    return list;
  }

  function bindForm(form) {
    if (!form || form.getAttribute('data-iletisim-bound') === '1') return;
    form.setAttribute('data-iletisim-bound', '1');
    form.setAttribute('novalidate', 'novalidate');
    wireKvkkCheckbox(form);
    upgradeHedefUlkeField(form);
    wrapFormSatirFields(form);
    moveKimlikToTop(form);
    ensureYasVeliUi(form);
    syncYasVeliFields(form);
    enforceAllFieldsRequired(form);
    mountTurnstile(form);

    form.addEventListener('input', function (ev) {
      var t = ev.target;
      if (t && t.matches && t.matches('input:not([type="radio"]):not([type="checkbox"]), textarea, select')) {
        clearFieldError(t);
      }
      if (t && t.name === 'dogum_tarihi_veya_yas') {
        syncYasVeliFields(form);
      }
    });

    form.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t && t.type === 'radio' && t.name && t.name.indexOf('kimlik') === 0) {
        clearKimlikGroupErrors(form);
        syncYasVeliFields(form);
        enforceAllFieldsRequired(form);
      }
      if (t && (t.type === 'checkbox' || (t.tagName && t.tagName.toLowerCase() === 'select'))) {
        clearFieldError(t);
      }
      if (t && t.name === 'dogum_tarihi_veya_yas') {
        syncYasVeliFields(form);
        enforceAllFieldsRequired(form);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var buton = form.querySelector('button[type="submit"]');
      if (buton) buton.disabled = true;

      syncYasVeliFields(form);

      if (!validateAndShowErrors(form)) {
        if (buton) buton.disabled = false;
        var firstBad =
          form.querySelector(
            'input[aria-invalid="true"]:not([type="radio"]), select[aria-invalid="true"], textarea[aria-invalid="true"], input[type="checkbox"][aria-invalid="true"]'
          ) || form.querySelector('input[type="radio"][aria-invalid="true"]');
        if (firstBad && typeof firstBad.focus === 'function') {
          firstBad.focus();
        }
        return;
      }

      var kimlikVal = kimlikValue(form);
      if (kimlikVal !== 'ogrenci' && kimlikVal !== 'veli') {
        setKimlikGroupError(
          form,
          'Lütfen öğrenci veya veli seçeneklerinden birini işaretleyin.'
        );
        if (buton) buton.disabled = false;
        var kimlikBad = form.querySelector('input[type="radio"][name^="kimlik"]');
        if (kimlikBad && typeof kimlikBad.focus === 'function') {
          kimlikBad.focus();
        }
        return;
      }

      var yasVeli = readYasVeliState(form);
      if (!yasVeli.ok) {
        if (yasVeli.field) setFieldError(yasVeli.field, yasVeli.error);
        if (buton) buton.disabled = false;
        if (yasVeli.field && typeof yasVeli.field.focus === 'function') {
          yasVeli.field.focus();
        }
        return;
      }

      var siteKey = turnstileSiteKey();
      var turnstileToken = getTurnstileToken(form);
      if (siteKey && !turnstileToken) {
        setTurnstileError(form, 'Lütfen bot doğrulamasını tamamlayın.');
        if (buton) buton.disabled = false;
        return;
      }

      var ulke = hedefUlkeFromForm(form);
      if (!ulke.id) {
        var ulkeSel = form.querySelector('select[name="hedef_ulke_country_id"]');
        if (ulkeSel) setFieldError(ulkeSel, 'Lütfen listeden bir hedef ülke seçin.');
        if (buton) buton.disabled = false;
        if (ulkeSel && typeof ulkeSel.focus === 'function') ulkeSel.focus();
        return;
      }

      var submittedAt = new Date().toISOString();
      var payload = {
        ad: valField(form, 'ad'),
        soyad: valField(form, 'soyad'),
        email: valField(form, 'email'),
        telefon: valField(form, 'telefon'),
        lead_type: kimlikVal === 'veli' ? 'PARENT' : 'STUDENT',
        ilgilenilen_program: valField(form, 'hangi_program'),
        hedef_ulke: ulke.name,
        hedef_ulke_country_id: Number(ulke.id),
        mesaj: valField(form, 'mesaj'),
        landing_page: pageH1Text(),
        kvkk_onay: kvkkAccepted(form) ? 1 : 0,
        turnstile_token: turnstileToken,
        form_submitted_at: submittedAt,
        created_at: submittedAt,
        submitted_at: submittedAt,
        dogum_tarihi: yasVeli.birthIso || '',
        yas: yasVeli.age != null ? yasVeli.age : null,
        is_under_18: yasVeli.isUnder18 === true,
        veli_ad: yasVeli.veliAd || '',
        veli_soyad: yasVeli.veliSoyad || '',
        veli_telefon: yasVeli.veliTelefon || '',
        parent_name: yasVeli.veliAd || '',
        parent_surname: yasVeli.veliSoyad || '',
        parent_phone: yasVeli.veliTelefon || '',
        whatsapp_bulk_opt_out: yasVeli.isUnder18 ? 1 : 0,
        exclude_from_whatsapp_marketing: yasVeli.isUnder18 === true
      };
      var butonMetin = buton ? buton.textContent : '';
      if (buton) buton.textContent = 'İletiliyor…';
      showIletiliyor();
      postSubmit(payload)
        .then(function () {
          hideIletiliyor();
          if (buton) buton.textContent = butonMetin || 'Gönder';
          form.reset();
          clearFormErrors(form);
          wireKvkkCheckbox(form);
          upgradeHedefUlkeField(form);
          wrapFormSatirFields(form);
          moveKimlikToTop(form);
          ensureYasVeliUi(form);
          syncYasVeliFields(form);
          enforceAllFieldsRequired(form);
          resetTurnstile(form);
          showBildirim(
            'basari',
            'Mesajınız bize ulaştı. Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.',
            function () {
              if (buton) buton.disabled = false;
            }
          );
        })
        .catch(function (err) {
          hideIletiliyor();
          if (buton) buton.textContent = butonMetin || 'Gönder';
          resetTurnstile(form);
          showBildirim('hata', submitErrorMessage(err), function () {
            if (buton) buton.disabled = false;
          });
        });
    });
  }

  function bind() {
    findIletisimForms().forEach(bindForm);
  }

  function postSubmit(payload) {
    return fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            throw new Error(parseSubmitErrorResponse(res, t));
          });
        }
        return res;
      })
      .catch(function (err) {
        if (err && err.name === 'TypeError') {
          throw new Error('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
        }
        throw err;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
