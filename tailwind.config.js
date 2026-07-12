/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.{html,js}',
    '!./node_modules/**',
    '!./tools/**',
    '!./reports/**',
    '!./dev/**'
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
          muted: '#64748b',
          rozetTitle: '#111827',
          rozetBody: '#4b5563',
          rozetIconBg: '#fef2f2',
          rozetIcon: '#b91c1c'
        }
      },
      fontSize: {
        h1site: ['var(--h1-px, 28px)', { lineHeight: '1.6', fontWeight: '700' }],
        h2site: ['var(--h2-px, 22px)', { lineHeight: '1.35', fontWeight: '700' }],
        bolum: [
          'var(--sayfa-bolum-baslik-font-size, 22px)',
          { lineHeight: '1.35', fontWeight: '700' }
        ],
        rozet: ['15px', { lineHeight: '1.7' }],
        rozetTitle: ['14.5px', { lineHeight: '1.4', fontWeight: '700' }]
      },
      maxWidth: {
        site: '1200px'
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.07)',
        cardHover: '0 8px 24px rgba(15, 23, 42, 0.12)',
        ulkeKart:
          '0 2px 6px rgba(15, 23, 42, 0.07), 0 10px 24px rgba(15, 23, 42, 0.1)',
        ulkeKartHover:
          '0 10px 22px rgba(15, 23, 42, 0.13), 0 22px 46px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: []
};
