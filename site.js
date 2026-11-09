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

  /* El correo se escribe por JavaScript para que no lo recojan los robots de spam. */
  var email = ['espis.es30', 'gmail.com'].join('@');
  document.querySelectorAll('[data-email]').forEach(function (a) { a.href = 'mailto:' + email; a.textContent = email; });

  var menu = document.getElementById('menu');
  if (menu) {
    document.querySelector('[data-menu-abrir]').addEventListener('click', function () { menu.showModal(); });
    menu.querySelector('[data-menu-cerrar]').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('click', function (e) {
      if (e.target === menu || (e.target.closest('a') && e.target.closest('a').hash)) menu.close();
    });
  }

  /* Instalar la app: botón visible en la barra y también en el menú. */
  var deferred = null;
  var menuInstall = document.getElementById('instalar');
  var barInstall = document.createElement('button');
  barInstall.type = 'button'; barInstall.className = 'bar-instalar'; barInstall.textContent = 'Instalar app'; barInstall.hidden = true;
  var menuBtn = document.querySelector('.bar-menu');
  if (menuBtn) menuBtn.parentNode.insertBefore(barInstall, menuBtn);

  var installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function offerInstall(on) {
    barInstall.hidden = !on;
    if (menuInstall) menuInstall.hidden = !on;
    document.body.classList.toggle('instalable', on);
  }

  function iosHelp() {
    var d = document.getElementById('ayuda-instalar');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'ayuda-instalar';
      d.innerHTML = '<h2>Instalar en iPhone o iPad</h2><ol><li>Pulsa el botón <strong>Compartir</strong> de tu navegador (el cuadrado con una flecha).</li>' +
        '<li>Elige <strong>Añadir a pantalla de inicio</strong>.</li></ol><button type="button">Entendido</button>';
      d.querySelector('button').addEventListener('click', function () { d.close(); });
      document.body.appendChild(d);
    }
    d.showModal();
  }

  function install() {
    if (menu && menu.open) menu.close();
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; offerInstall(false); });
    } else if (isIOS) {
      iosHelp();
    }
  }
  barInstall.addEventListener('click', install);
  if (menuInstall) menuInstall.addEventListener('click', install);

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e; offerInstall(true);
  });
  window.addEventListener('appinstalled', function () { deferred = null; offerInstall(false); });
  if (isIOS && !installed) offerInstall(true);

  /* En localhost no se registra, para que las pruebas no vean ficheros cacheados. */
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') navigator.serviceWorker.register('/sw.js');
})();
