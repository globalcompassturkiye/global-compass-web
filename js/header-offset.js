/**
 * Sabit üst şerit + menü (position: fixed) için body'ye üst boşluk verir.
 * Yükseklik font/responsive değişimlerinde güncellenir.
 */
(function () {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  window.addEventListener('resize', setHeaderOffset);
  window.addEventListener('load', setHeaderOffset);
})();
