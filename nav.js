(function () {
  function init() {
    var hamburgerOld = document.getElementById('hamburger');
    var sidebar = document.getElementById('sidebar');
    if (!hamburgerOld || !sidebar) return;

    // Strip existing event listeners by replacing node
    var hamburger = hamburgerOld.cloneNode(true);
    hamburgerOld.parentNode.replaceChild(hamburger, hamburgerOld);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('active');
      document.body.classList.add('menu-open');
      hamburger.classList.add('open');
    }

    function closeMenu() {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      document.body.classList.remove('menu-open');
      hamburger.classList.remove('open');
    }

    hamburger.addEventListener('click', function () {
      sidebar.classList.contains('mobile-open') ? closeMenu() : openMenu();
    });

    var closeBtn = document.getElementById('sidebar-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    overlay.addEventListener('click', closeMenu);

    // Auto-open group that contains the active link
    sidebar.querySelectorAll('.nav-group').forEach(function (group) {
      if (group.querySelector('a.active')) group.open = true;
    });

    // Close sidebar on link click (mobile)
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768) closeMenu();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
