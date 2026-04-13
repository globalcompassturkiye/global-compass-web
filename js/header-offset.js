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
 * Mobil içindekiler sabit ok: yalnızca sayfa bir miktar aşağı kaydırılınca görünür (üstte gizli).
 * Görünürlük: body.blog-icindekiler-sabit-ok-goster + blog.css
 */
(function () {
  var CLS = 'blog-icindekiler-sabit-ok-goster';
  var THRESHOLD_PX = 120;

  function isMobilIcerik() {
    return window.matchMedia('(max-width: 1179px)').matches;
  }

  function update() {
    if (!document.querySelector('.blog-mobil-icindekiler-sabit-cap')) return;
    if (!isMobilIcerik()) {
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
    if (!document.querySelector('.blog-mobil-icindekiler-sabit-cap')) return;
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
