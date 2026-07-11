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

function logSubmitError(context, detail) {
  if (detail) {
    console.error("submit-form " + context + ":", detail);
  }
}

function mapDbErrorToUserMessage(tech) {
  var t = String(tech || "").toLowerCase();
  if (!t) {
    return "Formunuz kaydedilemedi. Lütfen birkaç dakika sonra tekrar deneyin.";
  }
  if (t.indexOf("unique") !== -1 || t.indexOf("constraint") !== -1) {
    return "Bu bilgilerle daha önce başvuru yapılmış olabilir. Farklı bir e-posta deneyin veya bizi arayın.";
  }
  if (t.indexOf("no column") !== -1 || t.indexOf("sqlite_error") !== -1 || t.indexOf("d1_error") !== -1) {
    return "Form geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin veya telefonla bize ulaşın.";
  }
  if (t.indexOf("timeout") !== -1 || t.indexOf("timed out") !== -1) {
    return "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.";
  }
  return "Formunuz kaydedilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
}

var DAILY_SUBMIT_LIMIT = 5;
var DAILY_SUBMIT_LIMIT_MSG =
  "Bu e-posta veya telefon ile bugün en fazla 5 bilgi isteği gönderebilirsiniz. Lütfen yarın tekrar deneyin veya bizi arayın.";

/** İstanbul takvim gününün 00:00:00 anı (UTC ISO). TR kalıcı UTC+3. */
function istanbulDayStartIso(date) {
  var d = date || new Date();
  var parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);
  var y = "";
  var m = "";
  var day = "";
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].type === "year") y = parts[i].value;
    else if (parts[i].type === "month") m = parts[i].value;
    else if (parts[i].type === "day") day = parts[i].value;
  }
  return new Date(y + "-" + m + "-" + day + "T00:00:00+03:00").toISOString();
}

async function handleSubmitForm(request, env) {
  var db = env.STUDENTS_DB;
  if (!db) {
    logSubmitError("config", "STUDENTS_DB binding missing");
    return jsonResponse(
      {
        ok: false,
        error: "Form şu an hizmet dışı. Lütfen daha sonra tekrar deneyin veya telefonla bize ulaşın."
      },
      503
    );
  }

  var body;
  try {
    var raw = await request.text();
    if (raw.length > 65536) {
      return jsonResponse(
        { ok: false, error: "Mesajınız çok uzun. Lütfen kısaltıp tekrar deneyin." },
        413
      );
    }
    body = JSON.parse(raw);
  } catch (e) {
    logSubmitError("json", e && e.message ? e.message : e);
    return jsonResponse(
      { ok: false, error: "Form verisi gönderilemedi. Sayfayı yenileyip tekrar deneyin." },
      400
    );
  }

  var kvkk = body.kvkk_onay;
  if (!(kvkk === true || kvkk === 1 || kvkk === "1")) {
    return jsonResponse(
      { ok: false, error: "Devam etmek için KVKK onay kutusunu işaretlemeniz gerekir." },
      400
    );
  }

  var adRaw = truncStr(body.ad, 120);
  var soyadRaw = truncStr(body.soyad, 120);
  var emailRaw = truncStr(body.email, 254);
  var telefonRaw = truncStr(body.telefon, 64);
  var lead_type = truncStr(
    body.lead_type != null
      ? body.lead_type
      : body.tip != null
        ? body.tip
        : body.kimlik,
    64
  ).toUpperCase();
  if (lead_type === "OGRENCI" || lead_type === "ÖĞRENCİ") lead_type = "STUDENT";
  if (lead_type === "VELI" || lead_type === "VELİ") lead_type = "PARENT";
  var ilgilenilen_program = truncStr(
    body.ilgilenilen_program != null ? body.ilgilenilen_program : body.hangi_program,
    500
  );
  var mesaj = truncStr(body.mesaj, 8000);
  var landing_page = truncStr(
    body.landing_page != null ? body.landing_page : body.h1,
    500
  );
  var hedef_ulke = truncStr(body.hedef_ulke, 120);
  if (!hedef_ulke) {
    hedef_ulke = "Belirtilmedi";
  }

  if (lead_type !== "STUDENT" && lead_type !== "PARENT") {
    return jsonResponse(
      {
        ok: false,
        error: "Lütfen öğrenci veya veli seçeneklerinden birini işaretleyin."
      },
      400
    );
  }

  if (!adRaw || !soyadRaw || !emailRaw || !telefonRaw) {
    return jsonResponse(
      {
        ok: false,
        error: "Lütfen ad, soyad, e-posta ve telefon alanlarını doldurun."
      },
      400
    );
  }

  var dayStart = istanbulDayStartIso();
  try {
    var countRow = await db
      .prepare(
        "SELECT COUNT(*) AS c FROM students WHERE kayit_tarihi >= ? AND ((email != '' AND email = ?) OR (veli_email != '' AND veli_email = ?) OR (telefon != '' AND telefon = ?) OR (veli_telefon != '' AND veli_telefon = ?))"
      )
      .bind(dayStart, emailRaw, emailRaw, telefonRaw, telefonRaw)
      .first();
    var todayCount = countRow && countRow.c != null ? Number(countRow.c) : 0;
    if (todayCount >= DAILY_SUBMIT_LIMIT) {
      return jsonResponse({ ok: false, error: DAILY_SUBMIT_LIMIT_MSG }, 429);
    }
  } catch (limitErr) {
    var limitTech = "";
    if (limitErr && typeof limitErr.message === "string") limitTech = limitErr.message;
    else if (limitErr && limitErr.cause && typeof limitErr.cause.message === "string") {
      limitTech = limitErr.cause.message;
    } else limitTech = String(limitErr || "");
    logSubmitError("daily limit", limitTech);
    return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(limitTech) }, 500);
  }

  var ad = "";
  var soyad = "";
  var email = "";
  var telefon = "";
  var veli_ad = "";
  var veli_soyad = "";
  var veli_telefon = "";
  var veli_email = "";

  if (lead_type === "STUDENT") {
    ad = adRaw;
    soyad = soyadRaw;
    email = emailRaw;
    telefon = telefonRaw;
  } else {
    veli_ad = adRaw;
    veli_soyad = soyadRaw;
    veli_telefon = telefonRaw;
    veli_email = emailRaw;
  }

  var kayit_tarihi = new Date().toISOString();

  try {
    var result = await db
      .prepare(
        "INSERT INTO students (ad, soyad, email, telefon, veli_ad, veli_soyad, veli_telefon, veli_email, lead_type, ilgilenilen_program, mesaj, kvkk_onay, kayit_tarihi, kaynak, status_id, hedef_ulke, landing_page) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 1, ?, ?)"
      )
      .bind(
        ad,
        soyad,
        email,
        telefon,
        veli_ad,
        veli_soyad,
        veli_telefon,
        veli_email,
        lead_type,
        ilgilenilen_program,
        mesaj,
        kayit_tarihi,
        "web_site",
        hedef_ulke,
        landing_page
      )
      .run();

    if (result && result.success === false) {
      var runErr =
        result.error != null
          ? typeof result.error === "string"
            ? result.error
            : JSON.stringify(result.error)
          : "D1 sorgusu başarısız.";
      logSubmitError("D1 run", runErr);
      return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(runErr) }, 500);
    }
  } catch (e) {
    var tech = "";
    if (e && typeof e.message === "string") tech = e.message;
    else if (e && e.cause && typeof e.cause.message === "string") tech = e.cause.message;
    else tech = String(e || "");
    logSubmitError("D1", tech);
    return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(tech) }, 500);
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
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "noindex"
        }
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