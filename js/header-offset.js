/**
 * Sabit üst şerit + menü (position: fixed) için html --site-header-offset güncellenir.
 * body { padding-top: var(--site-header-offset) } ile tek kaynak; inline body padding yazılmaz (CLS önlemi).
 */
(function () {
  var resizeObserverAttached = false;

  function setHeaderOffset() {
    var el = document.querySelector('.sabit-ust-alan');
    if (!el) return;
    var h = el.offsetHeight;
    document.documentElement.style.setProperty('--site-header-offset', h + 'px');
  }

  function run() {
    setHeaderOffset();
    requestAnimationFrame(setHeaderOffset);
    if (!resizeObserverAttached && typeof ResizeObserver !== 'undefined') {
      var el = document.querySelector('.sabit-ust-alan');
      if (el) {
        resizeObserverAttached = true;
        new ResizeObserver(setHeaderOffset).observe(el);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  window.addEventListener('resize', setHeaderOffset);
  window.addEventListener('load', setHeaderOffset);
})();

/**
 * Mobil sabit ok (≤501px): içindekiler hedefine veya sayfa başına; yoksa DOM’a eklenir.
 * Görünürlük: body.blog-icindekiler-sabit-ok-goster + style.css @media (max-width: 501px)
 */
(function () {
  var CLS = 'blog-icindekiler-sabit-ok-goster';
  var THRESHOLD_PX = 120;
  var MQ_CAP = '(max-width: 501px)';

  function isMobilCap() {
    return window.matchMedia(MQ_CAP).matches;
  }

  function resolveCapHref() {
    var byId = document.getElementById('blog-mobil-icindekiler-hedef');
    if (byId) return '#blog-mobil-icindekiler-hedef';
    var wrap = document.querySelector('.blog-mobil-icindekiler-wrap');
    if (wrap && wrap.id) return '#' + wrap.id;
    return '#';
  }

  function resolveCapAriaLabel() {
    if (document.getElementById('blog-mobil-icindekiler-hedef') || document.querySelector('.blog-mobil-icindekiler-wrap')) {
      return 'İçindekiler bölümüne git';
    }
    return 'Sayfa başına git';
  }

  function ensureSabitCap() {
    if (document.querySelector('.blog-mobil-icindekiler-sabit-cap')) return;
    var a = document.createElement('a');
    a.className = 'blog-mobil-icindekiler-sabit-cap';
    a.href = resolveCapHref();
    a.setAttribute('aria-label', resolveCapAriaLabel());
    var span = document.createElement('span');
    span.className = 'blog-mobil-icindekiler-sabit-cap-ok';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = '\u2191';
    a.appendChild(span);
    a.addEventListener('click', function (e) {
      var raw = a.getAttribute('href') || '';
      if (raw === '' || raw === '#') {
        var wrapOnly = document.querySelector('.blog-mobil-icindekiler-wrap');
        if (wrapOnly) {
          e.preventDefault();
          wrapOnly.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (raw.charAt(0) !== '#') return;
      var id = raw.slice(1);
      if (!id) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!document.getElementById(id)) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    document.body.appendChild(a);
  }

  function update() {
    ensureSabitCap();
    if (!document.querySelector('.blog-mobil-icindekiler-sabit-cap')) return;
    if (!isMobilCap()) {
      document.body.classList.remove(CLS);
      return;
    }
    if (window.scrollY > THRESHOLD_PX) {
      document.body.classList.add(CLS);
    } else {
      document.body.classList.remove(CLS);
    }
  }

  function wire() {
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('hashchange', update, { passive: true });
    window.addEventListener('load', update, { passive: true });
    update();
    requestAnimationFrame(function () {
      update();
      requestAnimationFrame(update);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
