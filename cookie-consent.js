
(function () {
    const COOKIE_DECISION_KEY = 'cookiesDecision';

    function dismiss(banner) {
        banner.style.display = 'none';
        document.body.classList.remove('banner-visible');
    }

    function initCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;

        const btnAceptar = document.getElementById('btnAceptarCookies');
        const btnRechazar = document.getElementById('btnRechazarCookies');
        const decision = localStorage.getItem(COOKIE_DECISION_KEY);

        if (decision === 'accepted') {
            banner.style.display = 'none';
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        } else if (decision === 'rejected') {
            banner.style.display = 'none';
        } else {
            banner.style.display = 'block';
            document.body.classList.add('banner-visible');
        }

        if (btnAceptar) {
            btnAceptar.addEventListener('click', () => {
                localStorage.setItem(COOKIE_DECISION_KEY, 'accepted');
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
                dismiss(banner);
            });
        }

        if (btnRechazar) {
            btnRechazar.addEventListener('click', () => {
                localStorage.setItem(COOKIE_DECISION_KEY, 'rejected');
                dismiss(banner);
            });
        }
    }

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
