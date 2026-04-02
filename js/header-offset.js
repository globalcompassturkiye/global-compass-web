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
