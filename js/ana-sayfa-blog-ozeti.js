/**
 * Ana sayfa: json/blog-latest.json içinden en güncel 3 blog yazısını listeler.
 * Yeni yazı eklerken: JSON'a kayıt ekleyin; en son yayınlar published ISO tarihine göre seçilir.
 * Ana sayfa blog kartlarında görsel kullanılmaz (yalnız metin: kategori, başlık, özet, tarih).
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
      art.className =
        'ana-sayfa-blog-kart flex h-full flex-col overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-card transition-shadow hover:shadow-cardHover';
      art.setAttribute('role', 'listitem');
      art.setAttribute('itemscope', '');
      art.setAttribute('itemtype', 'https://schema.org/BlogPosting');
      var cat = '';
      if (p.category) {
        cat =
          '<span class="ana-sayfa-blog-kart-kategori mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-brand-redDark">' +
          escapeHtml(p.category) +
          '</span>';
      }
      art.innerHTML =
        '<a class="ana-sayfa-blog-kart-tum-link block h-full p-4 text-inherit no-underline md:p-5" href="' +
        escapeHtml(p.href) +
        '" itemprop="url">' +
        '<div class="ana-sayfa-blog-kart-icerik flex h-full flex-col gap-2">' +
        cat +
        '<h3 class="ana-sayfa-blog-kart-baslik m-0 text-[15px] font-bold leading-snug text-brand-ink" itemprop="headline">' +
        escapeHtml(p.title) +
        '</h3>' +
        '<p class="ana-sayfa-blog-kart-ozet m-0 flex-1 text-[14px] leading-[1.6] text-brand-muted" itemprop="description">' +
        escapeHtml(p.excerpt) +
        '</p>' +
        '<p class="ana-sayfa-blog-kart-meta m-0 mt-auto text-xs font-medium text-slate-500">' +
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
