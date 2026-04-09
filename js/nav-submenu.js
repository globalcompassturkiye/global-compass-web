/**
 * Ana menü: hamburger + ≤992px tıklamalı alt menü.
 * 1. tıklama: aç | 2. tıklama: kapat (aynı başlığa tekrar basınca).
 * Aynı seviyede (kardeş li.has-dropdown) en fazla biri açık; üst menü kapanınca tüm altlar sıfırlanır.
 */
(function () {
  function initGlobalMobileCtaBar() {
    if (!document.body) return;
    if (document.querySelector('.blog-mobil-cta-bar-wrap, .global-mobil-cta-bar-wrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'global-mobil-cta-bar-wrap';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Hızlı iletişim');

    var link = document.createElement('a');
    link.className = 'global-mobil-cta-bar';
    link.href = '/iletisim/';

    var text = document.createElement('span');
    text.className = 'global-mobil-cta-bar-metin';
    text.textContent = 'Ücretsiz Danışmanlık Al';

    link.appendChild(text);
    wrap.appendChild(link);
    document.body.appendChild(wrap);
  }

  function applyMobileSubmenuLayout(nav) {
    if (!nav) return;
    /* Yalnızca hamburger çekmece (CSS: max-width 768px). 769–992 yatay üst menüde inline müdahale yok. */
    var isHamburgerDrawer = window.innerWidth <= 768;
    nav.querySelectorAll('.submenu').forEach(function (submenu) {
      if (isHamburgerDrawer) {
        submenu.style.position = 'static';
        submenu.style.left = 'auto';
        submenu.style.right = 'auto';
        submenu.style.top = 'auto';
        submenu.style.margin = '0';
        submenu.style.width = '100%';
        submenu.style.maxWidth = '100%';
        submenu.style.minWidth = '0';
        submenu.style.transform = 'none';
      } else {
        submenu.style.removeProperty('position');
        submenu.style.removeProperty('left');
        submenu.style.removeProperty('right');
        submenu.style.removeProperty('top');
        submenu.style.removeProperty('margin');
        submenu.style.removeProperty('width');
        submenu.style.removeProperty('max-width');
        submenu.style.removeProperty('min-width');
        submenu.style.removeProperty('transform');
      }
    });
  }

  function closeSiblingDropdowns(activeLi) {
    var ul = activeLi.parentElement;
    if (!ul) return;
    ul.querySelectorAll(':scope > li.has-dropdown').forEach(function (sibling) {
      if (sibling === activeLi) return;
      sibling.querySelectorAll('li.has-dropdown').forEach(function (li) {
        li.classList.remove('submenu-open');
      });
      sibling.classList.remove('submenu-open');
      sibling.querySelectorAll('li.has-dropdown > a').forEach(function (a) {
        a.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /** Kapatılırken iç içe açık alt menü sınıflarını da sıfırla */
  function closeNestedDropdowns(containerLi) {
    containerLi.querySelectorAll('li.has-dropdown').forEach(function (li) {
      li.classList.remove('submenu-open');
    });
    containerLi.querySelectorAll('li.has-dropdown > a').forEach(function (a) {
      a.setAttribute('aria-expanded', 'false');
    });
  }

  function init() {
    initGlobalMobileCtaBar();

    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.navigasyon');
    if (!toggle || !nav) return;
    applyMobileSubmenuLayout(nav);

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      applyMobileSubmenuLayout(nav);
      if (!open) {
        nav.querySelectorAll('li.has-dropdown').forEach(function (li) {
          li.classList.remove('submenu-open');
        });
        nav.querySelectorAll('li.has-dropdown > a').forEach(function (a) {
          a.setAttribute('aria-expanded', 'false');
        });
      }
    });

    document.querySelectorAll('.has-dropdown > a').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth > 992) return;
        var parent = this.closest('.has-dropdown');
        if (!parent) return;
        if (!parent.classList.contains('submenu-open')) {
          e.preventDefault();
          closeSiblingDropdowns(parent);
          parent.classList.add('submenu-open');
          this.setAttribute('aria-expanded', 'true');
          applyMobileSubmenuLayout(nav);
        } else {
          /* 2. tıklamada kapat (ülke hub’a gitme yok); iç içe altlar da sıfırlanır. */
          e.preventDefault();
          closeNestedDropdowns(parent);
          parent.classList.remove('submenu-open');
          this.setAttribute('aria-expanded', 'false');
          applyMobileSubmenuLayout(nav);
        }
      });
    });

    window.addEventListener('resize', function () {
      applyMobileSubmenuLayout(nav);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
