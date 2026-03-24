/**
 * Sabit üst şerit + menü (position: fixed) için body'ye üst boşluk verir.
 * Yükseklik font/responsive değişimlerinde güncellenir.
 * style.css içinde body { padding-top } için !important kullanılmamalı; aksi halde bu ölçüm ezilir.
 */
(function () {
  var resizeObserverAttached = false;

  function setHeaderOffset() {
    var el = document.querySelector('.sabit-ust-alan');
    if (!el) return;
    var h = el.offsetHeight;
    document.body.style.paddingTop = h + 'px';
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
