
(function () {
    const COOKIE_DECISION_KEY = 'cookiesDecision';
    const ADSENSE_PUB_ID = 'ca-pub-0180568308288225';

    function loadAdSense() {
        // Just load the script once. AdSense Auto-ads will handle the rest.
        if (!document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
    }

    function initCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;

        const btnAceptar = document.getElementById('btnAceptarCookies');
        const btnRechazar = document.getElementById('btnRechazarCookies');

        const decision = localStorage.getItem(COOKIE_DECISION_KEY);

        if (decision === 'accepted') {
            banner.style.display = 'none';
            loadAdSense();
        } else if (decision === 'rejected') {
            banner.style.display = 'none';
        } else {
            banner.style.display = 'block';
        }

        if (btnAceptar) {
            btnAceptar.addEventListener('click', () => {
                localStorage.setItem(COOKIE_DECISION_KEY, 'accepted');
                banner.style.display = 'none';
                loadAdSense();
            });
        }

        if (btnRechazar) {
            btnRechazar.addEventListener('click', () => {
                localStorage.setItem(COOKIE_DECISION_KEY, 'rejected');
                banner.style.display = 'none';
            });
        }
    }

    // Public method to reset consent (for policy page)
    window.resetCookieConsent = function () {
        localStorage.removeItem(COOKIE_DECISION_KEY);
        location.reload();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }
})();
