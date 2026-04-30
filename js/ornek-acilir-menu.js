(() => {
    const data = {
        "Dil Okulları": {
            "İngiltere": {
                "Londra": [
                    { name: "Kings Education - Londra - 16+ Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/uk/london/kings-education/" }
                ],
                "Oxford": [
                    { name: "Kings Education - Oxford - 16+ Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/uk/oxford/kings-education/" }
                ],
                "Bournemouth": [
                    { name: "Kings Education - Bournemouth - +16 Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/uk/bournemouth/kings-education/" }
                ]
            },
            "Amerika": {
                "Los Angeles": [
                    { name: "Kings Education - Los Angeles - +16 Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/usa/los-angeles/kings-education/" }
                ],
                "Boston": [
                    { name: "Kings Education - Boston - +16 Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/usa/boston/kings-education/" }
                ],
                "New York": [
                    { name: "Kings Education - New York - +16 Yaş - Dil Okulu", url: "/yurt-disi-dil-okullari/usa/new-york/kings-education/" }
                ]
            }
        },
        "Yaz Okulları": {
            "İngiltere": {
                "Londra": [
                    { name: "Immerse Education Londra - 15-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/london/immerse-education/" },
                    { name: "InvestIN Londra - 12-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/london/investin/" }
                ],
                "Oxford": [
                    { name: "Immerse Education Oxford - 13-15  & 16-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/oxford/immerse-education/" }
                ],
                "Cambridge": [
                    { name: "Immerse Education Cambridge - 13-18 & 18-30 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/cambridge/immerse-education/" },
                    { name: "Oxford Royale Academy Cambridge 12-18 Yaş Arası Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/cambridge/oxford-royale-academy/" }
                ],
                "Bournemouth": [
                    { name: "Summer Boarding Courses (SBC) Canford 11-16 Yaş Arası Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/bournemouth/summer-boarding-courses-canford/" },
                    { name: "Kings Education Bournemouth - 12-17 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/uk/bournemouth/kings-education/" }
                ]
            },
            "İsviçre": {
                "İsviçre": [
                    { name: "Chantemerle - İsviçre - 6-11 & 12-16 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/switzerland/chantemerle/" },
                    { name: "Swiss Education Academy - İsviçre- 6-11 & 12-16 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/switzerland/swiss-education-academy/" },
                    { name: "Business Hotel Management School 16+ Yaş Yaz Okulu", url: "/yurt-disi-yaz-okullari/switzerland/business-hotel-management-school/" }
                ]
            },
            "Almanya": {
                "Frankfurt": [
                    { name: "Alpadia - Frankfurt Lahntal - 10-17 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/germany/frankfurt/alpadia/" }
                ],
                "Freiburg": [
                    { name: "Alpadia - Freiburg - 13-17 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/germany/freiburg/alpadia/" }
                ]
            },
            "Kanada": {
                "Toronto": [
                    { name: "Immerse Education - Toronto - 15-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/canada/toronto/immerse-education/" }
                ]
            },
            "İtalya": {
                "Milano": [
                    { name: "Sportech Academy - Milano - 8-16 Yaş - AC Milan Academy Elite Futbol Kampı", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/futbol/" },
                    { name: "Sportech Academy - Milano - Genç Tenis Kampı - 8-16 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/tenis/" },
                    { name: "Sportech Academy - Milano - 15-18 Yaş - IBEM İşletme Yaz Programı", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/isletme/" },
                    { name: "Sportech Academy - Milano - 15-18 Yaş - İtalya Tıp Yaz Okulu", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/tip/" },
                    { name: "Sportech Academy - Milano - 15-18 Yaş - Tasarım Yaz Programı", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/tasarim/" },
                    { name: "Sportech Academy - Milano - 15-18 Yaş - Moda Yaz Programı", url: "/yurt-disi-yaz-okullari/italy/milan/sportech-academy/moda/" }
                ]
            },
            "Japonya": {
                "Tokyo": [
                    { name: "Immerse Education - Tokyo - 15-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/japan/tokyo/immerse-education/" }
                ]
            },
            "Amerika": {
                "New York": [
                    { name: "Oxford Royale Academy - New York - 16-18 Yaş - Yaz Okulu", url: "/yurt-disi-yaz-okullari/usa/new-york/oxford-royale-academy/" }
                ]
            }
        },
        "Üniversite": {
            "İsviçre": {
                "İsviçre": [
                    { name: "BHMS — Business Hotel Management School — İsviçre lisans", url: "/yurt-disi-universite/switzerland/business-hotel-management-school/" }
                ]
            }
        }
    };

    const categorySelect = document.getElementById("ornek-kategori");
    const countrySelect = document.getElementById("ornek-ulke");
    const citySelect = document.getElementById("ornek-sehir");
    const cityRow = document.getElementById("ornek-sehir-satiri");
    const schoolCard = document.getElementById("ornek-okul-listesi-karti");
    const summary = document.getElementById("ornek-secim-ozeti");
    const list = document.getElementById("ornek-okul-listesi");

    if (!categorySelect || !countrySelect || !citySelect || !cityRow || !schoolCard || !summary || !list) {
        return;
    }

    function fillOptions(selectElement, placeholder, values) {
        const options = [`<option value="">${placeholder}</option>`]
            .concat(values.map((value) => `<option value="${value}">${value}</option>`))
            .join("");
        selectElement.innerHTML = options;
    }

    function resetList() {
        list.innerHTML = "";
        schoolCard.hidden = true;
    }

    function renderSchoolList(schools) {
        list.innerHTML = schools
            .map(
                (school, index) => `
                    <div class="premium-liste-kart glass-stil">
                        <div class="kart-sol-grup">
                            <span class="liste-index">#${index + 1}</span>
                            <div class="ayrac-dikey"></div>
                            <a href="${school.url}" class="okul-isim-link">${school.name}</a>
                        </div>
                    </div>
                `
            )
            .join("");
        schoolCard.hidden = false;
    }

    function isCitylessSwitzerland(country) {
        return country === "İsviçre";
    }

    fillOptions(categorySelect, "Kategori seçin", Object.keys(data));

    categorySelect.addEventListener("change", () => {
        const category = categorySelect.value;
        if (!category || !data[category]) {
            fillOptions(countrySelect, "Önce kategori seçin", []);
            countrySelect.disabled = true;
            fillOptions(citySelect, "Önce ülke seçin", []);
            citySelect.disabled = true;
            cityRow.hidden = false;
            resetList();
            summary.textContent = "Henüz seçim yapılmadı.";
            return;
        }

        const countries = Object.keys(data[category]);
        fillOptions(countrySelect, "Ülke seçin", countries);
        countrySelect.disabled = false;
        fillOptions(citySelect, "Önce ülke seçin", []);
        citySelect.disabled = true;
        cityRow.hidden = false;
        resetList();
        summary.textContent = `${category} kategorisi seçildi. Şimdi ülke seçin.`;
    });

    countrySelect.addEventListener("change", () => {
        const category = categorySelect.value;
        const country = countrySelect.value;
        if (!category || !country || !data[category] || !data[category][country]) {
            fillOptions(citySelect, "Önce ülke seçin", []);
            citySelect.disabled = true;
            cityRow.hidden = false;
            resetList();
            summary.textContent = "Henüz seçim yapılmadı.";
            return;
        }

        const cities = Object.keys(data[category][country]);

        if (isCitylessSwitzerland(country) && cities.length === 1) {
            const city = cities[0];
            const schools = data[category][country][city];
            fillOptions(citySelect, "İsviçre için şehir seçimi yok", []);
            citySelect.disabled = true;
            cityRow.hidden = true;
            resetList();
            renderSchoolList(schools);
            summary.textContent = `${category} / ${country} için ${schools.length} sonuç listelendi.`;
            return;
        }

        fillOptions(citySelect, "Şehir seçin", cities);
        citySelect.disabled = false;
        cityRow.hidden = false;
        resetList();
        summary.textContent = `${category} / ${country} seçildi. Şimdi şehir seçin.`;
    });

    citySelect.addEventListener("change", () => {
        const category = categorySelect.value;
        const country = countrySelect.value;
        const city = citySelect.value;

        if (!category || !country || !city || !data[category] || !data[category][country] || !data[category][country][city]) {
            resetList();
            summary.textContent = "Henüz seçim yapılmadı.";
            return;
        }

        const schools = data[category][country][city];
        renderSchoolList(schools);
        summary.textContent = `${category} / ${country} / ${city} için ${schools.length} sonuç listelendi.`;
    });
})();
