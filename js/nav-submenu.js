/**
 * Ana menü: hamburger + ≤992px tıklamalı alt menü.
 * Aynı seviyede (kardeş li.has-dropdown) en fazla biri açık; üst menü kapanınca tüm altlar sıfırlanır.
 */
(function () {
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
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.navigasyon');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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
        } else {
          e.preventDefault();
          closeNestedDropdowns(parent);
          parent.classList.remove('submenu-open');
          this.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
