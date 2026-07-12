/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './yurt-disi-lise/index.html',
    './yurt-disi-universite/index.html',
    './js/ana-sayfa-blog-ozeti.js',
    './js/ornek-acilir-menu.js',
    './js/header-offset.js',
    './js/nav-submenu.js'
  ],
  // Site-wide style.css + Poppins reset korunur; Preflight diğer sayfaları bozmasın.
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      colors: {
        brand: {
          red: '#e30613',
          redDark: '#bd0505',
          navy: '#000080',
          ink: '#1e293b',
          muted: '#64748b'
        }
      },
      maxWidth: {
        site: '1200px'
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.07)',
        cardHover: '0 8px 24px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
