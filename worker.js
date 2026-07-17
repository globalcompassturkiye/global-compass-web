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

  var crmLeadsUrl = truncStr(
    env.CRM_WEB_FORM_LEADS_URL || "https://crm.globalcompass.com.tr/api/web-form/leads",
    500
  );
  var crmApiKey = truncStr(env.COMMUNICATIONS_API_SECRET || "", 500);
  if (!crmApiKey) {
    logSubmitError("config", "COMMUNICATIONS_API_SECRET missing");
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
  var turnstile_token = truncStr(
    body.turnstile_token != null
      ? body.turnstile_token
      : body["cf-turnstile-response"] != null
        ? body["cf-turnstile-response"]
        : "",
    2048
  );

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

  var countryIdNum = Number(
    body.hedef_ulke_country_id != null ? body.hedef_ulke_country_id : body.country_id
  );
  if (!Number.isFinite(countryIdNum) || countryIdNum < 1 || Math.floor(countryIdNum) !== countryIdNum) {
    return jsonResponse(
      { ok: false, error: "Lütfen listeden bir hedef ülke seçin." },
      400
    );
  }

  var countryRow;
  try {
    countryRow = await db
      .prepare("SELECT id, name FROM countries WHERE id = ? AND is_active = 1")
      .bind(countryIdNum)
      .first();
  } catch (countryErr) {
    var countryTech = "";
    if (countryErr && typeof countryErr.message === "string") countryTech = countryErr.message;
    else countryTech = String(countryErr || "");
    logSubmitError("country lookup", countryTech);
    return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(countryTech) }, 500);
  }
  if (!countryRow || !countryRow.name) {
    return jsonResponse(
      { ok: false, error: "Seçilen ülke geçersiz. Lütfen listeden tekrar seçin." },
      400
    );
  }
  var hedef_ulke = truncStr(countryRow.name, 120);

  var dayStart = istanbulDayStartIso();
  try {
    var countRow = await db
      .prepare(
        "SELECT COUNT(*) AS c FROM students WHERE kayit_tarihi >= ? AND ((student_email != '' AND student_email = ?) OR (parent_email != '' AND parent_email = ?) OR (student_phone != '' AND student_phone = ?) OR (parent_phone != '' AND parent_phone = ?))"
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

  var crmPayload = {
    ad: adRaw,
    soyad: soyadRaw,
    email: emailRaw,
    telefon: telefonRaw,
    lead_type: lead_type,
    ilgilenilen_program: ilgilenilen_program,
    mesaj: mesaj,
    hedef_ulke: hedef_ulke,
    hedef_ulke_country_id: Number(countryRow.id),
    landing_page: landing_page,
    kvkk_onay: 1,
    submitted_at: new Date().toISOString(),
    turnstile_token: turnstile_token || undefined,
    raw_payload: body
  };

  try {
    var crmRes = await fetch(crmLeadsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Communications-Api-Key": crmApiKey
      },
      body: JSON.stringify(crmPayload)
    });
    var crmText = await crmRes.text();
    var crmJson = null;
    try {
      crmJson = crmText ? JSON.parse(crmText) : null;
    } catch (parseErr) {
      crmJson = null;
    }

    if (!crmRes.ok || !crmJson || crmJson.success !== true) {
      var crmErr =
        crmJson && typeof crmJson.error === "string" && crmJson.error.trim()
          ? crmJson.error.trim()
          : "CRM lead kaydı başarısız (HTTP " + crmRes.status + ").";
      logSubmitError("crm leads", {
        status: crmRes.status,
        error: crmErr,
        body: crmText ? crmText.slice(0, 500) : ""
      });
      if (crmRes.status === 429) {
        return jsonResponse({ ok: false, error: DAILY_SUBMIT_LIMIT_MSG }, 429);
      }
      // CRM'nin net hata metnini kullanıcıya ilet (400/422/5xx)
      if (crmJson && typeof crmJson.error === "string" && crmJson.error.trim()) {
        return jsonResponse(
          { ok: false, error: crmErr },
          crmRes.status === 400 ? 400 : 502
        );
      }
      return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(crmErr) }, 502);
    }

    console.log("submit-form crm ok", {
      student_id: crmJson.student_id,
      submission_id: crmJson.submission_id,
      created_student: crmJson.created_student
    });
  } catch (e) {
    var tech = "";
    if (e && typeof e.message === "string") tech = e.message;
    else tech = String(e || "");
    logSubmitError("crm fetch", tech);
    return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(tech) }, 502);
  }

  return jsonResponse({ ok: true }, 201);
}

/** D1 countries.name (EN) → formda görünen Türkçe etiket. D1 değeri değişmez. */
var COUNTRY_LABEL_TR = {
  Australia: "Avustralya",
  Austria: "Avusturya",
  Azerbaijan: "Azerbaycan",
  Belgium: "Belçika",
  Bulgaria: "Bulgaristan",
  Canada: "Kanada",
  China: "Çin",
  Cyprus: "Kıbrıs",
  Czechia: "Çekya",
  Denmark: "Danimarka",
  Estonia: "Estonya",
  Finland: "Finlandiya",
  France: "Fransa",
  Germany: "Almanya",
  Greece: "Yunanistan",
  Hungary: "Macaristan",
  India: "Hindistan",
  Ireland: "İrlanda",
  Italy: "İtalya",
  Japan: "Japonya",
  Kazakhstan: "Kazakistan",
  Kyrgyzstan: "Kırgızistan",
  Latvia: "Letonya",
  Lithuania: "Litvanya",
  Luxembourg: "Lüksemburg",
  Malta: "Malta",
  Netherlands: "Hollanda",
  "New Zealand": "Yeni Zelanda",
  Norway: "Norveç",
  Poland: "Polonya",
  Portugal: "Portekiz",
  Romania: "Romanya",
  Russia: "Rusya",
  Singapore: "Singapur",
  Slovakia: "Slovakya",
  Slovenia: "Slovenya",
  "South Korea": "Güney Kore",
  Spain: "İspanya",
  Sweden: "İsveç",
  Switzerland: "İsviçre",
  Turkey: "Türkiye",
  Ukraine: "Ukrayna",
  "United Kingdom": "Birleşik Krallık",
  "United States": "Amerika Birleşik Devletleri"
};

function countryLabelTr(englishName) {
  var n = String(englishName || "").trim();
  return COUNTRY_LABEL_TR[n] || n;
}

async function handleCountries(env) {
  var db = env.STUDENTS_DB;
  if (!db) {
    return jsonResponse(
      { ok: false, error: "Ülke listesi şu an kullanılamıyor." },
      503
    );
  }
  try {
    var result = await db
      .prepare(
        "SELECT id, name, is_popular FROM countries WHERE is_active = 1"
      )
      .all();
    var rows = result && result.results ? result.results : [];
    var countries = rows.map(function (r) {
      var name = String(r.name || "");
      var pop = r.is_popular;
      var isPopular =
        pop === 1 || pop === true || pop === "1" || Number(pop) === 1 ? 1 : 0;
      return {
        id: Number(r.id),
        name: name,
        label: countryLabelTr(name),
        is_popular: isPopular
      };
    });
    countries.sort(function (a, b) {
      if (b.is_popular !== a.is_popular) return b.is_popular - a.is_popular;
      return String(a.label).localeCompare(String(b.label), "tr");
    });
    return new Response(
      JSON.stringify({
        ok: true,
        countries: countries.map(function (c) {
          return { id: c.id, name: c.name, label: c.label };
        })
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (e) {
    var tech = e && typeof e.message === "string" ? e.message : String(e || "");
    logSubmitError("countries", tech);
    return jsonResponse({ ok: false, error: mapDbErrorToUserMessage(tech) }, 500);
  }
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
      "/blog/felsted-summer-camp",
      // GSC 404 (2026-07-12) — listede olmayanlar
      "/yurt-disi-yabanci-dil-okullari",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/bilgisayar-bilimleri",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/fizik",
      "/ingiltere-yaz-okullari/immerse-education-13-15-yas/muhendislik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biology",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biotechnology",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/biotechnology-society",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/coding",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/computer-science",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/consciousness-the-mind",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/creative-ındustries",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/creative-industries",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/criminology",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/doga-bilimleri",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/english-literature",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/fizik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/geopolitics-global-conflict",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/global-leadership",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/human-cultures",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/international-relations",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/mathematics",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/muhendislik",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/philosophy",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/philosophy-politics-economics",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/planetin-crisis",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/tip",
      "/ingiltere-yaz-okullari/immerse-education-cambridge-yaz-okulu/uluslararasi-iliskiler"
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

    if (pathname === "/api/countries") {
      if (request.method === "GET" || request.method === "HEAD") {
        return handleCountries(env);
      }
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" }
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