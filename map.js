/* Tu mapa de Google My Maps es el mapa. Esto solo añade "el más cercano" y lo centra. */
(function () {
  'use strict';
  var CITIES = [['Madrid',40.4168,-3.7038],['Barcelona',41.3874,2.1686],['Valencia',39.4699,-0.3763],['Sevilla',37.3891,-5.9845],['Zaragoza',41.6488,-0.8891],['Málaga',36.7213,-4.4214],['Murcia',37.9922,-1.1307],['Palma',39.5696,2.6502],['Las Palmas de Gran Canaria',28.1235,-15.4363],['Bilbao',43.263,-2.935],['Alicante',38.3452,-0.481],['Córdoba',37.8882,-4.7794],['Valladolid',41.6523,-4.7245],['Vigo',42.2406,-8.7207],['Gijón',43.5322,-5.6611],['Hospitalet de Llobregat',41.3662,2.1169],['A Coruña',43.3623,-8.4115],['Vitoria-Gasteiz',42.8467,-2.6716],['Granada',37.1773,-3.5986],['Elche',38.2669,-0.6983],['Oviedo',43.3614,-5.8494],['Santa Cruz de Tenerife',28.4636,-16.2518],['Badalona',41.4469,2.2474],['Cartagena',37.6257,-0.9966],['Terrassa',41.5632,2.0089],['Jerez de la Frontera',36.6866,-6.1367],['Sabadell',41.5463,2.1086],['Móstoles',40.3223,-3.8649],['Alcalá de Henares',40.4818,-3.3635],['Pamplona',42.8125,-1.6458],['Almería',36.834,-2.4637],['Getafe',40.3083,-3.7329],['Leganés',40.3272,-3.7635],['San Sebastián',43.3183,-1.9812],['Donostia',43.3183,-1.9812],['Burgos',42.3439,-3.6969],['Santander',43.4623,-3.81],['Castellón de la Plana',39.9864,-0.0513],['Albacete',38.9943,-1.8585],['Logroño',42.4627,-2.4449],['Badajoz',38.8794,-6.9707],['Salamanca',40.9701,-5.6635],['Huelva',37.2614,-6.9447],['Lleida',41.6176,0.62],['Tarragona',41.1189,1.2445],['Marbella',36.5101,-4.8824],['León',42.5987,-5.5671],['Cádiz',36.5271,-6.2886],['Jaén',37.7796,-3.7849],['Ourense',42.3358,-7.8639],['Girona',41.9794,2.8214],['Lugo',43.0097,-7.556],['Cáceres',39.4753,-6.3724],['Melilla',35.2923,-2.9381],['Ceuta',35.8894,-5.3213],['Guadalajara',40.6337,-3.1667],['Toledo',39.8628,-4.0273],['Pontevedra',42.4336,-8.6475],['Palencia',42.0097,-4.5288],['Santiago de Compostela',42.8782,-8.5448],['Ciudad Real',38.986,-3.9273],['Zamora',41.5033,-5.7446],['Ávila',40.6565,-4.6818],['Cuenca',40.0704,-2.1374],['Huesca',42.1401,-0.4089],['Segovia',40.9429,-4.1088],['Soria',41.7666,-2.4792],['Teruel',40.344,-1.1069],['Ibiza',38.9067,1.4206],['Benidorm',38.5411,-0.1225]];
  var EMBED = 'https://www.google.com/maps/d/embed?mid=1YRT_X5tf7YNgvNL7ubI6jaO1EoAFxlM&ehbc=2E312F&noprof=1';
  var HOME = EMBED + '&ll=40.2,-3.6&z=6';
  var CONTACT = ['espis.es30', 'gmail.com'].join('@');

  var $ = function (id) { return document.getElementById(id); };
  var panelStart = $('p-inicio'), panelRes = $('p-res'), status = $('estado'), cards = $('tarjetas'), resTitle = $('res-titulo'), far = $('lejos'), nearBtn = $('cerca');
  var points = [], me = null, shown = [], current = HOME;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function norm(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-'); }
  function dist(a, lat, lng) {
    var R = 6371000, r = Math.PI / 180, dLa = (lat - a[0]) * r, dLn = (lng - a[1]) * r;
    var h = Math.pow(Math.sin(dLa / 2), 2) + Math.cos(a[0] * r) * Math.cos(lat * r) * Math.pow(Math.sin(dLn / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmt(m) { return m < 950 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toLocaleString('es-ES', { maximumFractionDigits: m < 9500 ? 1 : 0 }) + ' km'; }
  function say(text, isError) { status.textContent = text; status.hidden = !text; status.classList.toggle('error', !!isError); }
  function zoomFor(m) { return m < 800 ? 16 : m < 3000 ? 14 : m < 15000 ? 12 : 9; }

  /* Se sustituye el iframe entero para no llenar el historial del botón Atrás. */
  function showMap(url) {
    if (url === current) return;
    current = url;
    var old = $('gmapa'), f = old.cloneNode(false);
    f.src = url;
    old.replaceWith(f);
  }
  function center(lat, lng, z) { showMap(EMBED + '&ll=' + lat + ',' + lng + '&z=' + z); }

  function nearest(origin, n) {
    return points.map(function (p) { return Object.assign({ d: dist(origin, p.lat, p.lng) }, p); })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, n);
  }

  function cardHtml(p, i, mode) {
    var walk = mode === 'yo' && p.d < 2500 ? ' · ' + Math.max(1, Math.round(p.d / 80)) + ' min a pie' : '';
    var distTxt = '<span class="t-dist">' + fmt(p.d) + (mode === 'ciudad' ? ' del centro' : '') + walk + '</span>';
    var tag = p.tag ? '<span class="t-et' + (p.tag === 'De pago' ? ' pago' : '') + '">' + esc(p.tag) + '</span>' : '';
    var note = p.note ? '<p class="t-nota">' + esc(p.note) + '</p>' : '';
    var route = 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng + '&travelmode=walking';
    var mail = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('Error en el mapa: ' + p.name) + '&body=' +
      encodeURIComponent('Punto: ' + p.name + ' (' + p.lat + ', ' + p.lng + ')\n\n¿Qué has visto? (cerrado, no existe, de pago, horario…):\n');
    return '<li class="tarjeta" data-i="' + i + '"><h3>' + esc(p.name) + '</h3><div class="t-datos">' + distTxt + tag + '</div>' + note +
      '<div class="t-acc"><a class="t-ir" target="_blank" rel="noopener" href="' + route + '">Cómo llegar</a><a class="t-err" href="' + mail + '">Avisar de un error</a></div></li>';
  }

  function mark(i) { [].forEach.call(cards.children, function (c, n) { c.classList.toggle('sel', n === i); }); }

  function showResults(list, title, mode) {
    shown = list;
    resTitle.textContent = title;
    cards.innerHTML = list.map(function (p, i) { return cardHtml(p, i, mode); }).join('');
    cards.scrollLeft = 0;
    panelStart.hidden = true; panelRes.hidden = false;
    mark(0);
  }

  function reset() {
    panelRes.hidden = true; panelStart.hidden = false; far.hidden = true; shown = []; cards.innerHTML = '';
    showMap(HOME);
    history.replaceState(null, '', location.pathname + location.search);
  }

  function locate() {
    if (!window.isSecureContext) { say('Esta conexión no es segura (https) y el navegador no permite pedir tu ubicación. Escribe tu ciudad.', true); return; }
    if (!navigator.geolocation) { say('Tu navegador no permite localizarte. Escribe tu ciudad.', true); return; }
    nearBtn.setAttribute('aria-busy', 'true');
    say('Buscando tu posición…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      nearBtn.removeAttribute('aria-busy');
      say('');
      me = [pos.coords.latitude, pos.coords.longitude];
      var list = nearest(me, 10);
      far.hidden = list[0].d < 15000;
      if (!far.hidden) {
        far.innerHTML = 'El más cercano del mapa está lejos. <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/aseos+p%C3%BAblicos/@' + me[0] + ',' + me[1] + ',14z">Prueba en Google Maps</a> o mira la <a href="/aseos-emergencia-espana.html">guía de emergencia</a>.';
      }
      showResults(list, 'Los más cercanos a ti', 'yo');
      center(me[0], me[1], zoomFor(list[0].d));
      history.replaceState(null, '', location.pathname + location.search);
    }, function (err) {
      nearBtn.removeAttribute('aria-busy');
      say(err.code === 1 ? 'Tu navegador o tu móvil tienen bloqueada la ubicación para esta web. Actívala en sus ajustes o escribe tu ciudad.' : 'No hemos podido localizarte. Escribe tu ciudad.', true);
      $('q').focus();
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  function goCity(city) {
    var list = nearest([city[1], city[2]], 10);
    far.hidden = list[0].d < 15000;
    if (!far.hidden) far.innerHTML = 'Todavía no tenemos aseos cerca de ' + esc(city[0]) + '. ¿Conoces alguno? <a href="/contribuir.html">Añádelo</a>.';
    showResults(list, 'Cerca de ' + city[0], 'ciudad');
    center(city[1], city[2], 13);
    history.replaceState(null, '', '#' + slug(city[0]));
  }

  function findCity(text) {
    var q = norm(text);
    if (!q) return null;
    return CITIES.filter(function (c) { return norm(c[0]) === q; })[0] ||
      CITIES.filter(function (c) { return norm(c[0]).indexOf(q) === 0; })[0] || null;
  }

  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    var c = CITIES.filter(function (x) { return slug(x[0]) === h; })[0];
    if (c) { window.scrollTo(0, 0); goCity(c); }
  }

  nearBtn.addEventListener('click', locate);
  $('cerrar').addEventListener('click', reset);
  $('busca').addEventListener('submit', function (e) {
    e.preventDefault();
    var c = findCity($('q').value);
    if (!c) { say('No encontramos esa ciudad. Prueba con otra cercana o pulsa el botón.', true); return; }
    $('q').value = ''; $('q').blur(); say(''); goCity(c);
  });
  $('ciudades-lista').innerHTML = CITIES.map(function (c) { return '<option value="' + esc(c[0]) + '">'; }).join('');
  window.addEventListener('hashchange', fromHash);

  cards.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var li = e.target.closest('.tarjeta');
    if (!li) return;
    var p = shown[+li.dataset.i];
    mark(+li.dataset.i);
    center(p.lat, p.lng, 17);
  });

  fetch('/data/aseos.json').then(function (r) { return r.json(); }).then(function (rows) {
    points = rows.map(function (r) { return { lat: r[0], lng: r[1], name: r[2], note: r[3], tag: r[4] }; });
    document.querySelectorAll('[data-ciudad]').forEach(function (a) {
      var c = CITIES.filter(function (x) { return slug(x[0]) === a.dataset.ciudad; })[0];
      if (!c) return;
      var n = points.filter(function (p) { return dist([c[1], c[2]], p.lat, p.lng) < 12000; }).length;
      a.querySelector('small').textContent = n ? String(n) : '';
    });
    fromHash();
  }).catch(function () { say('No se ha podido cargar la lista de cercanos. El mapa sigue disponible.', true); });
})();
