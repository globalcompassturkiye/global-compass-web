(function () {
    var KUTU = '.immerse-tokyo-branches-kutu';
    var GOVDE = '.immerse-tokyo-rozet-govde';
    var METIN = '.immerse-tokyo-rozet-accordion-metin';
    var BTN = '.immerse-tokyo-devam-btn';
    var CLS_GEN = 'immerse-tokyo-rozet-genisletilebilir';
    var CLS_ACIK = 'is-expanded';
    var ORAN = 0.25;
    var MIN_ONIZLEME = 96;
    var KISA_ESIK = 40;
    /* immerse-education.css: 640px altı tek sütun; üstü iki sütun */
    var IKI_SUTUN_MQ = '(min-width: 641px)';

    function ikiSutunLayout() {
        return window.matchMedia(IKI_SUTUN_MQ).matches;
    }

    /** İki sütunlu gridde aynı satırdaki diğer kart (.immerse-tokyo-rozet-govde) */
    function partnerGovde(govde) {
        var tumu = Array.prototype.slice.call(document.querySelectorAll(KUTU + ' ' + GOVDE));
        var i = tumu.indexOf(govde);
        if (i < 0) {
            return null;
        }
        var j = i % 2 === 0 ? i + 1 : i - 1;
        if (j < 0 || j >= tumu.length) {
            return null;
        }
        return tumu[j];
    }

    function syncButtonLabels(btn, acik) {
        var ac = btn.querySelector('.immerse-tokyo-devam-ac');
        var ka = btn.querySelector('.immerse-tokyo-devam-kapa');
        if (ac) {
            ac.hidden = !!acik;
        }
        if (ka) {
            ka.hidden = !acik;
        }
    }

    function measureGovde(govde, secenek) {
        secenek = secenek || {};
        var metin = govde.querySelector(METIN);
        var btn = govde.querySelector(BTN);
        if (!metin || !btn) {
            return;
        }

        var acik =
            typeof secenek.expanded === 'boolean'
                ? secenek.expanded
                : govde.classList.contains(CLS_ACIK);

        metin.style.maxHeight = 'none';
        var tamYukseklik = metin.scrollHeight;
        var onizleme = Math.max(MIN_ONIZLEME, Math.round(tamYukseklik * ORAN));

        if (tamYukseklik <= onizleme + KISA_ESIK) {
            govde.classList.remove(CLS_GEN);
            govde.classList.remove(CLS_ACIK);
            btn.hidden = true;
            metin.style.maxHeight = '';
            metin.removeAttribute('data-preview-height');
            syncButtonLabels(btn, false);
            btn.setAttribute('aria-expanded', 'false');
            return;
        }

        govde.classList.add(CLS_GEN);
        metin.setAttribute('data-preview-height', String(onizleme));
        btn.hidden = false;

        if (acik) {
            govde.classList.add(CLS_ACIK);
            metin.style.maxHeight = '';
            syncButtonLabels(btn, true);
            btn.setAttribute('aria-expanded', 'true');
        } else {
            govde.classList.remove(CLS_ACIK);
            metin.style.maxHeight = onizleme + 'px';
            syncButtonLabels(btn, false);
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    function tumunuOlc() {
        document.querySelectorAll(KUTU + ' ' + GOVDE).forEach(function (govde) {
            measureGovde(govde, { expanded: govde.classList.contains(CLS_ACIK) });
        });
    }

    function init() {
        var kutu = document.querySelector(KUTU);
        if (!kutu) {
            return;
        }

        tumunuOlc();

        kutu.addEventListener('click', function (e) {
            var btn = e.target.closest(BTN);
            if (!btn || btn.hidden || !kutu.contains(btn)) {
                return;
            }
            var govde = btn.closest(GOVDE);
            if (!govde) {
                return;
            }
            var acik = !govde.classList.contains(CLS_ACIK);
            if (ikiSutunLayout()) {
                var partner = partnerGovde(govde);
                if (partner) {
                    measureGovde(govde, { expanded: acik });
                    measureGovde(partner, { expanded: acik });
                    return;
                }
            }
            measureGovde(govde, { expanded: acik });
        });

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(tumunuOlc, 150);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
