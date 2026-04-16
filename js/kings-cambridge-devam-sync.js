(function () {
    var GRUP = '[data-kings-cambridge-sync="fce-cae"]';
    var METIN = '.rozet-accordion-metin';
    var BTN = '.immerse-tokyo-devam-btn';

    function etiketleriAyarla(btn, acik) {
        var ac = btn.querySelector('.immerse-tokyo-devam-ac');
        var ka = btn.querySelector('.immerse-tokyo-devam-kapa');
        if (ac) {
            ac.hidden = !!acik;
        }
        if (ka) {
            ka.hidden = !acik;
        }
    }

    function grubuAyarla(acik) {
        var govdeList = Array.prototype.slice.call(document.querySelectorAll(GRUP));
        govdeList.forEach(function (govde) {
            var metin = govde.querySelector(METIN);
            var btn = govde.querySelector(BTN);
            if (!metin || !btn) {
                return;
            }
            metin.hidden = !acik;
            btn.setAttribute('aria-expanded', acik ? 'true' : 'false');
            etiketleriAyarla(btn, acik);
        });
    }

    var govdeList = Array.prototype.slice.call(document.querySelectorAll(GRUP));
    if (govdeList.length < 2) {
        return;
    }

    govdeList.forEach(function (govde) {
        var btn = govde.querySelector(BTN);
        if (!btn) {
            return;
        }
        btn.addEventListener('click', function () {
            var acik = btn.getAttribute('aria-expanded') !== 'true';
            grubuAyarla(acik);
        });
    });
})();
