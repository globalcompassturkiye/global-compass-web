export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. ADIM: 410 GONE - Silinen Sayfalar Listesi
    const expiredPaths = [
      "/yurtdisi-yaz-okullari/ingiltere/cambridge",
      "/yabanci-dil-okullari/amerika/new-york",
      "/yabanci-dil-okullari/amerika/boston/kings-education-bos",
      "/yabanci-dil-okullari/ingiltere-dil-okullari",
      "/yabanci-dil-okullari/amerika",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/immerse-economics-13-15",
      "/yurt-disinda-yuksek-lisans-mba",
      "/yabanci-dil-okullari/amerika/los-angeles/kings-education-la",
      "/almanya-yaz-okullari",
      "/yurt-disinda-lise",
      "/yurtdisi-yaz-okullari/ingiltere",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/history",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/nanotechnology",
      "/yabanci-dil-okullari/amerika/los-angeles/kings-education-los-angeles-ingilizce-dil-okulu",
      "/yabanci-dil-okullari/amerika-dil-okullari/newyork-dil-okullari/kings-education-newyork",
      "/yuksek-lisans-mba",
      "/ingiltere-yaz-okullari/immerse-education-oxford-yaz-okulu-1",
      "/yurtdisi-dil-okullari/ingiltere-dil-okullari/bournemouth-dil-okullari/kings-education-bournemouth-ingilizce-dil-okulu",
      "/online-egitim",
      "/yurt-disi-yaz-okullari/uk/bournemouth/immerse-education/",
      "/blank-4",
      "/yabanci-dil-okullari/amerika-dil-okullari/boston-dil-okullari",
      "/blank-6",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas",
      "/yabanci-dil-okullari/amerika-dil-okullari/newyork-dil-okullari",
      "/yabanci-dil-okullari/amerika-dil-okullari/los-angeles-dil-okullari/kings-education-los-angeles",
      "/avusturya-yaz-okullari",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/doga-bilimleri",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/uluslararasi-iliskiler",
      "/portfolio-collections/my-portfolio/project-title-5",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/muhendislik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/computer-science",
      "/blank-5",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/philosophy",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/creative-ındustries",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/english-literature",
      "/lise-degisim-programlari",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/tip",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/planetin-crisis",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/bilgisayar-bilimleri",
      "/portfolio-collections/my-portfolio/project-title-4",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/criminology",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/fizik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/fizik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/consciousness-the-mind",
      "/i̇ade-politikası",
      "/erişilebilirlik-beyanı",
      "/saint-charles-yaz-kampi",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/international-relations",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/geopolitics-global-conflict",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/coding",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biotechnology",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biology",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/global-leadership",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/mathematics",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/philosophy-politics-economics",
      "/gönderim-politikası",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biotechnology-society",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/human-cultures",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/muhendislik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/artificial-intelligence",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/hukuk",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/mimarlik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/isletme-yonetimi",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/yaratici-yazarlik",
      "/portfolio-collections/my-portfolio/project-title-3",
      "/portfolio-collections/my-portfolio/project-title-1",
      "/portfolio-collections/my-portfolio/project-title-2",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/hukuk",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/female-future-leaders",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/ai-ethics",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/chemistry",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/mimarlik",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/tip",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/uluslararasi-iliskiler",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/doga-bilimleri",
      "/product-page/engineering2",
      "/italya-yaz-okullari",
      "/i̇talya-yaz-okullari",
      "/ispanya-yaz-okullari",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/isletme-yonetimi",
      "/fransa-yaz-okullari",
      "/i̇spanya-yaz-okullari",
      "/product-page/im-a-product-3",
      "/şartlar-ve-koşullar",
      "/product-page/im-a-product-7",
      "/portfolio-collections/my-portfolio",
      "/product-page/im-a-product-5",
      "/malta-yaz-okullari",
      "/product-page/im-a-product-4",
      "/portfolio-collections/my-portfolio/project-title-6",
      "/product-page/im-a-product-11",
      "/product-page/im-a-product-9",
      "/product-page/im-a-product-1",
      "/product-page/im-a-product-6",
      "/product-page/im-a-product-2",
      "/çerez-politikası",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/yaratici-yazarlik",
      "/product-page/im-a-product",
      "/yurtdisi-universite-programlari-copy",
      "/service-page/ücretsi̇z-danişmanlik",
      "/amerika-yaz-okullari",
      "/about-4",
      "/açik-riza-metni̇",
      "/ucl-kariyer-yaz-programlari",
      "/amerika-yaz-okulları",
      "/xxx",
      "/pricing-plans/list",
      "/portfolio",
      "/lise-programlari-copy-1",
      "/recipes",
      "/language-courses",
      "/product-page/im-a-product-10",
      "/search",
      "/immerse-education",
      "/abbey-college-yaz-kampi",
      "/yaz-okulları",
      "/londra-yaz-okulları",
      "/kvkk",
      "/product-page/im-a-product-8",
      "/isvicre-yaz-programlari",
      "/sik-sorulan-sorular-sss",
      "/blog/felsted-summer-camp.amp",
      "/uc-berkeley-yaz-programlari",
      "/ecole-chantemerle-yaz-kampi",
      "/blog/felsted-summer-camp"
    ];

    // URL sonundaki "/" işaretini dikkate almadan kontrol et
    const normalizedPath = pathname.endsWith('/') && pathname.length > 1 
      ? pathname.slice(0, -1) 
      : pathname;

    if (expiredPaths.includes(normalizedPath) || expiredPaths.includes(pathname)) {
      return new Response("Bu sayfa kalıcı olarak kaldırılmıştır (410 Gone).", {
        status: 410,
        statusText: "Gone",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 2. ADIM: PAYTR YÖNLENDİRMESİ
    if (pathname.startsWith("/api/paytr")) {
      const newUrl = request.url.replace(
        "https://www.globalcompass.com.tr/api/paytr",
        "https://global-compass-paytr.canmuratsubat.workers.dev"
      );
      return fetch(new Request(newUrl, request));
    }

    // 3. ADIM: NORMAL AKIŞ VE CACHE KONTROLÜ
    const response = await env.ASSETS.fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    
    return newResponse;
  }
};