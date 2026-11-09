/* Menú, consentimiento, instalación y service worker: compartido por todas las páginas. */
(function () {
  'use strict';
  /* Pon esto a true cuando actives el mensaje de Google en AdSense >
     Privacidad y mensajes: entonces este banner propio deja de mostrarse. */
  var USE_GOOGLE_CMP = false;
  var KEY = 'cookiesDecision';

  function store(v) {
    try {
      if (v === undefined) return localStorage.getItem(KEY);
      if (v === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v);
    } catch (e) { return null; }
  }

  function applyConsent(value) {
    var s = value === 'accepted' ? 'granted' : 'denied';
    if (window.gtag) gtag('consent', 'update', { ad_storage: s, ad_user_data: s, ad_personalization: s, analytics_storage: s });
  }

  function showBanner() {
    if (document.getElementById('cookies')) return;
    var box = document.createElement('section');
    box.id = 'cookies';
    box.setAttribute('aria-label', 'Preferencias de cookies');
    box.innerHTML = '<p>Usamos cookies de Google para medir visitas y mostrar anuncios. Tú decides. <a href="/politica-cookies.html">Más información</a>.</p>' +
      '<div><button type="button" data-v="rejected">Rechazar</button><button type="button" data-v="accepted">Aceptar</button></div>';
    box.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      store(v); applyConsent(v); box.remove();
    });
    document.body.appendChild(box);
  }

  function openConsent() {
    if (USE_GOOGLE_CMP && window.googlefc && googlefc.showRevocationMessage) { googlefc.showRevocationMessage(); return; }
    store(null); applyConsent('rejected'); showBanner();
  }
  window.resetCookieConsent = openConsent;

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookies]');
    if (t) { e.preventDefault(); openConsent(); }
  });
  if (!USE_GOOGLE_CMP && !store()) showBanner();

  var menu = document.getElementById('menu');
  if (menu) {
    document.querySelector('[data-menu-abrir]').addEventListener('click', function () { menu.showModal(); });
    menu.querySelector('[data-menu-cerrar]').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('click', function (e) {
      if (e.target === menu || (e.target.closest('a') && e.target.closest('a').hash)) menu.close();
    });
  }

  var deferred, install = document.getElementById('instalar');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e; if (install) install.hidden = false;
  });
  if (install) install.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; install.hidden = true; });
  });

  /* En localhost no se registra, para que las pruebas no vean ficheros cacheados. */
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') navigator.serviceWorker.register('/sw.js');
})();
