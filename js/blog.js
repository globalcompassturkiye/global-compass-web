/**
 * Global Compass Blog: eski sorgu/hash URL’lerinden pretty URL’e yönlendirme,
 * içindekiler (TOC) ve (isteğe bağlı) otomatik başlık ID.
 */
(function () {
  'use strict';

  /** /blog/{slug}/ ile eşleşen kategori segmentleri */
  var BLOG_KATEGORI_SLUGS = [
    'dil-okullari',
    'yaz-okullari',
    'lise',
    'universite',
    'yuksek-lisans-mba',
    'online-egitim',
    'burs-firsatlari',
    'vize-rehberi',
    'sehir-ulke-rehberi',
    'kariyer-yolculugu'
  ];

  var SLUG_SET = {};
  BLOG_KATEGORI_SLUGS.forEach(function (s) {
    SLUG_SET[s] = true;
  });

  /**
   * /blog/ veya /blog üzerinde ?kategori=… veya #kategori-… → /blog/{slug}/
   */
  function initBlogLegacyUrlRedirect() {
    try {
      var path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
      if (path !== '/blog') return;

      var u = new URL(window.location.href);
      var q = u.searchParams.get('kategori');

      if (q !== null && q !== '') {
        if (q === 'hepsi') {
          u.search = '';
          window.location.replace(u.pathname + (u.hash || ''));
          return;
        }
        if (SLUG_SET[q]) {
          window.location.replace('/blog/' + q + '/' + (u.hash || ''));
          return;
        }
      }

      var hash = window.location.hash || '';
      if (hash.indexOf('#kategori-') === 0) {
        var slug = hash.replace('#kategori-', '');
        if (slug && SLUG_SET[slug]) {
          window.location.replace('/blog/' + slug + '/');
        }
      }
    } catch (e) { /* ignore */ }
  }

  initBlogLegacyUrlRedirect();

  function slugifyHeading(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function initBlogTOC(container) {
    var navs = container.querySelectorAll('.blog-icindekiler-liste');
    if (!navs.length) return;
    var article = container.querySelector('.blog-yazi-icerik');
    if (!article) return;

    var items = [];
    article.querySelectorAll('h2[id], h3[id]').forEach(function (h) {
      if (h.closest('aside')) return;
      var id = h.getAttribute('id');
      if (!id) return;
      items.push({ el: h, id: id });
    });
    if (!items.length) return;

    navs.forEach(function (nav) {
      nav.innerHTML = '';
      items.forEach(function (item) {
        var h = item.el;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + item.id;
        a.textContent = h.textContent.trim();
        if (h.tagName === 'H3') {
          li.classList.add('blog-icindekiler-alt');
        }
        li.appendChild(a);
        nav.appendChild(li);
      });
    });
  }

  function initBlogTOCAuto(container) {
    var article = container.querySelector('.blog-yazi-icerik[data-blog-toc-auto]');
    if (!article) return;

    var headings = article.querySelectorAll('h2, h3');
    var used = {};
    headings.forEach(function (h) {
      var base = slugifyHeading(h.textContent || '');
      if (!base) return;
      var id = base;
      var n = 1;
      while (used[id]) {
        n += 1;
        id = base + '-' + n;
      }
      used[id] = true;
      h.setAttribute('id', id);
    });
    initBlogTOC(container);
  }

  function parseCardPublishedTs(card) {
    var iso = card.getAttribute('data-published') || '';
    if (!iso) {
      var t = card.querySelector('time[datetime]');
      if (t) iso = t.getAttribute('datetime') || '';
    }
    if (!iso) return 0;
    var ts = Date.parse(iso);
    return isNaN(ts) ? 0 : ts;
  }

  function initBlogListingSort() {
    var grids = document.querySelectorAll('.blog-yazi-grid');
    if (!grids.length) return;

    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .blog-yazi-karti'));
      if (cards.length < 2) return;

      var withMeta = cards.map(function (el, idx) {
        return { el: el, ts: parseCardPublishedTs(el), idx: idx };
      });

      withMeta.sort(function (a, b) {
        if (b.ts !== a.ts) return b.ts - a.ts; // yeni -> eski
        return a.idx - b.idx;
      });

      withMeta.forEach(function (item) {
        grid.appendChild(item.el);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBlogListingSort();

    var detail = document.querySelector('.blog-yazi-detay');
    if (detail) {
      if (detail.querySelector('.blog-yazi-icerik[data-blog-toc-auto]')) {
        initBlogTOCAuto(detail);
      } else {
        initBlogTOC(detail);
      }
    }
  });
})();
