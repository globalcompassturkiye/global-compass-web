(() => {
    const categorySelect = document.getElementById("ornek-kategori");
    const countrySelect = document.getElementById("ornek-ulke");
    const citySelect = document.getElementById("ornek-sehir");
    const cityRow = document.getElementById("ornek-sehir-satiri");
    const schoolCard = document.getElementById("ornek-okul-listesi-karti");
    const summary = document.getElementById("ornek-secim-ozeti");
    const list = document.getElementById("ornek-okul-listesi");

    const linkSource = document.getElementById("ornek-link-kaynagi");
    if (!categorySelect || !countrySelect || !citySelect || !cityRow || !schoolCard || !summary || !list || !linkSource) {
        return;
    }

    const data = {};
    const sourceLinks = Array.from(linkSource.querySelectorAll("a[data-kategori][data-ulke][data-sehir][href]"));
    sourceLinks.forEach((link) => {
        const category = link.dataset.kategori;
        const country = link.dataset.ulke;
        const city = link.dataset.sehir;
        if (!category || !country || !city) {
            return;
        }
        if (!data[category]) {
            data[category] = {};
        }
        if (!data[category][country]) {
            data[category][country] = {};
        }
        if (!data[category][country][city]) {
            data[category][country][city] = [];
        }
        data[category][country][city].push({
            name: link.textContent.trim(),
            url: link.getAttribute("href")
        });
    });

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
