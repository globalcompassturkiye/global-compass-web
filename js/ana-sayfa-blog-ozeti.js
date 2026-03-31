/**
 * Ana sayfa: json/blog-latest.json içinden en güncel 3 blog yazısını listeler.
 * Yeni yazı eklerken: JSON'a kayıt ekleyin; en son yayınlar published ISO tarihine göre seçilir.
 */
(function () {
  'use strict';

  var MAX = 3;
  var JSON_URL = '/json/blog-latest.json';

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function parseDate(str) {
    var t = Date.parse(str);
    return isNaN(t) ? 0 : t;
  }

  function formatDateTR(iso) {
    var ts = parseDate(iso);
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function render(root, posts) {
    var grid = root.querySelector('.ana-sayfa-blog-ozeti-grid');
    if (!grid) return;
    grid.innerHTML = '';
    posts.forEach(function (p) {
      var art = document.createElement('article');
      art.className = 'ana-sayfa-blog-kart';
      art.setAttribute('role', 'listitem');
      art.setAttribute('itemscope', '');
      art.setAttribute('itemtype', 'https://schema.org/BlogPosting');
      var img = '';
      if (p.image) {
        img =
          '<span class="ana-sayfa-blog-kart-gorsel" aria-hidden="true">' +
          '<img src="' +
          escapeHtml(p.image) +
          '" alt="' +
          escapeHtml(p.imageAlt || '') +
          '" width="400" height="250" loading="lazy" decoding="async" itemprop="image">' +
          '</span>';
      }
      var cat = '';
      if (p.category) {
        cat = '<span class="ana-sayfa-blog-kart-kategori">' + escapeHtml(p.category) + '</span>';
      }
      art.innerHTML =
        '<a class="ana-sayfa-blog-kart-tum-link" href="' +
        escapeHtml(p.href) +
        '" itemprop="url">' +
        img +
        '<div class="ana-sayfa-blog-kart-icerik">' +
        cat +
        '<h3 class="ana-sayfa-blog-kart-baslik" itemprop="headline">' +
        escapeHtml(p.title) +
        '</h3>' +
        '<p class="ana-sayfa-blog-kart-ozet" itemprop="description">' +
        escapeHtml(p.excerpt) +
        '</p>' +
        '<p class="ana-sayfa-blog-kart-meta">' +
        escapeHtml(formatDateTR(p.published)) +
        '</p>' +
        '</div>' +
        '</a>';
      grid.appendChild(art);
    });
  }

  function init() {
    var root = document.getElementById('ana-sayfa-blog-ozeti');
    if (!root) return;

    fetch(JSON_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('json');
        return r.json();
      })
      .then(function (data) {
        var list = (data && data.posts) || [];
        list.sort(function (a, b) {
          return parseDate(b.published) - parseDate(a.published);
        });
        var top = list.slice(0, MAX);
        if (!top.length) {
          root.classList.add('ana-sayfa-blog-ozeti--bos');
          return;
        }
        root.classList.remove('ana-sayfa-blog-ozeti--yukleniyor');
        render(root, top);
      })
      .catch(function () {
        root.classList.add('ana-sayfa-blog-ozeti--hata');
        root.classList.remove('ana-sayfa-blog-ozeti--yukleniyor');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
