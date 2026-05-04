function truncStr(value, max) {
  if (value == null) return "";
  var t = String(value).trim();
  return t.length > max ? t.slice(0, max) : t;
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function handleSubmitForm(request, env) {
  var db = env.STUDENTS_DB;
  if (!db) {
    return jsonResponse({ ok: false, error: "Sunucu yapılandırması eksik (D1)." }, 503);
  }

  var body;
  try {
    var raw = await request.text();
    if (raw.length > 65536) {
      return jsonResponse({ ok: false, error: "İstek gövdesi çok büyük." }, 413);
    }
    body = JSON.parse(raw);
  } catch (e) {
    return jsonResponse({ ok: false, error: "Geçersiz JSON." }, 400);
  }

  var kvkk = body.kvkk_onay;
  if (!(kvkk === true || kvkk === 1 || kvkk === "1")) {
    return jsonResponse({ ok: false, error: "Kişisel verilerin işlenmesi için onay (KVKK) gerekli." }, 400);
  }

  var ad = truncStr(body.ad, 120);
  var soyad = truncStr(body.soyad, 120);
  var email = truncStr(body.email, 254);
  var telefon = truncStr(body.telefon, 64);
  var tip = truncStr(body.tip != null ? body.tip : body.kimlik, 64);
  var ilgilenilen_program = truncStr(
    body.ilgilenilen_program != null ? body.ilgilenilen_program : body.hangi_program,
    500
  );
  var mesaj = truncStr(body.mesaj, 8000);

  if (!ad || !soyad || !email || !telefon || !tip) {
    return jsonResponse({ ok: false, error: "Zorunlu alanlar eksik veya geçersiz." }, 400);
  }

  var kayit_tarihi = new Date().toISOString();

  try {
    await db
      .prepare(
        "INSERT INTO students (ad, soyad, email, telefon, tip, ilgilenilen_program, mesaj, kvkk_onay, kayit_tarihi, kaynak, durum) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)"
      )
      .bind(
        ad,
        soyad,
        email,
        telefon,
        tip,
        ilgilenilen_program,
        mesaj,
        kayit_tarihi,
        "web_site",
        "yeni"
      )
      .run();
  } catch (e) {
    console.error("submit-form D1:", e && e.message ? e.message : e);
    return jsonResponse({ ok: false, error: "Kayıt oluşturulamadı." }, 500);
  }

  return jsonResponse({ ok: true }, 201);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // URL normalize (çok kritik)
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.endsWith("/") && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }

    pathname = pathname.toLowerCase();

    // 410 listesi (normalize edilmiş)
    const expiredPaths = new Set([
      "/yurtdisi-yaz-okullari/ingiltere/cambridge",
      "/yabanci-dil-okullari/amerika/new-york",
      "/yabanci-dil-okullari/amerika/boston/kings-education-bos",
      "/yabanci-dil-okullari/ingiltere-dil-okullari",
      "/yabanci-dil-okullari/amerika",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/immerse-economics-13-15",
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
      "/yurt-disi-yaz-okullari/uk/bournemouth/immerse-education",
      "/blank-4",
      "/yabanci-dil-okullari/amerika-dil-okullari/boston-dil-okullari",
      "/blank-6",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas",
      "/yabanci-dil-okullari/amerika-dil-okullari/newyork-dil-okullari",
      "/yabanci-dil-okullari/amerika-dil-okullari/los-angeles-dil-okullari/kings-education-los-angeles",
      "/avusturya-yaz-okullari",
      "/portfolio-collections/my-portfolio/project-title-5",
      "/blank-5",
      "/lise-degisim-programlari",
      "/portfolio-collections/my-portfolio/project-title-4",
      "/i̇ade-politikası",
      "/erişilebilirlik-beyanı",
      "/saint-charles-yaz-kampi",
      "/gönderim-politikası",
      "/portfolio-collections/my-portfolio/project-title-3",
      "/portfolio-collections/my-portfolio/project-title-1",
      "/portfolio-collections/my-portfolio/project-title-2",
      "/italya-yaz-okullari",
      "/i̇talya-yaz-okullari",
      "/ispanya-yaz-okullari",
      "/fransa-yaz-okullari",
      "/i̇spanya-yaz-okullari",
      "/şartlar-ve-koşullar",
      "/portfolio-collections/my-portfolio",
      "/malta-yaz-okullari",
      "/portfolio-collections/my-portfolio/project-title-6",
      "/çerez-politikası",
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
      "/search",
      "/immerse-education",
      "/abbey-college-yaz-kampi",
      "/blog-feed.xml",
      "/yabanci-dil-okullari/ingiltere-dil-okullari/oxford-dil-okullari",
      "/yabanci-dil-okullari/amerika/boston",
      "/yabanci-dil-okullari",
      "/burs",
      "/yabanci-dil-okullari/amerika/new-york/kings-education-nyc",
      "/yabanci-dil-okullari/amerika-dil-okullari/los-angeles-dil-okullari",
      "/yabanci-dil-okullari/amerika/new-york/kings-education",
      "/yabanci-dil-kurslari",
      "/yabanci-dil-okullari/amerika-dil-okullari",
      "/blank",
      "/blank-1",
      "/yaz-okullari",
      "/yabanci-dil-okullari/amerika-dil-okullari/boston-dil-okullari/kings-education-boston",
      "/yurtdisi-yaz-okullari/isvicre-yaz-okullari",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu",
      "/blank-7",
      "/blank-2",
      "/ingiltere-yaz-okullari",
      "/general-clean",
      "/yaz-okulları",
      "/londra-yaz-okulları",
      "/kvkk",
      "/isvicre-yaz-programlari",
      "/sik-sorulan-sorular-sss",
      "/blog/felsted-summer-camp.amp",
      "/uc-berkeley-yaz-programlari",
      "/ecole-chantemerle-yaz-kampi",
      "/blog/felsted-summer-camp"
    ]);

    // 410 kontrolü
    if (expiredPaths.has(pathname)) {
      return new Response("410 Gone", {
        status: 410,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // Bilgi istek formu → D1 (students)
    if (pathname === "/api/submit-form") {
      if (request.method === "POST") {
        return handleSubmitForm(request, env);
      }
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST", "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // PAYTR yönlendirme
    if (pathname.startsWith("/api/paytr")) {
      const newUrl = request.url.replace(
        "https://www.globalcompass.com.tr/api/paytr",
        "https://global-compass-paytr.canmuratsubat.workers.dev"
      );
      return fetch(new Request(newUrl, request));
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }
};