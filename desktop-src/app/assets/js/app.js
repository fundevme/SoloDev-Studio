/* ==========================================================================
   SoloDev Studio — boot
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  function boot() {
    App.Store.load();
    App.setTheme(App.Store.data.theme || 'dark');
    App.applyEffects();
    App.buildNav();
    App.buildTabbar();

    /* ---------------------------- top bar ------------------------------- */
    var menu = document.getElementById('btn-menu');
    if (menu) menu.addEventListener('click', function (e) {
      e.stopPropagation();
      var sb = document.getElementById('sidebar');
      if (sb && sb.classList.contains('open')) App.closeSidebar(); else App.openSidebar();
    });

    document.getElementById('btn-theme').addEventListener('click', App.cycleTheme);
    document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
    document.getElementById('btn-backup').addEventListener('click', function () {
      App.presentExport('Save a backup', 'solodev-backup-' + App.today() + '.json', App.Store.exportJSON(), 'application/json',
        'Save this somewhere safe. Restoring from it puts everything back exactly as it was.');
    });
    document.getElementById('btn-new-game-side').addEventListener('click', function () {
      App.closeSidebar();
      App.openNewGameDialog(null);
    });

    /* ripple on every button */
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn, .icon-btn, .chip.click');
      if (!b) return;
      /* The ripple is absolutely positioned, so its host has to be a positioning
         context that clips it. Force that here as well as in the stylesheet:
         get it wrong and the span becomes a real box and stretches the control. */
      var cs = getComputedStyle(b);
      if (cs.position === 'static') b.style.position = 'relative';
      if (cs.overflow === 'visible') b.style.overflow = 'hidden';

      var r = b.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.width = rip.style.height = size + 'px';
      rip.style.left = (e.clientX - r.left - size / 2) + 'px';
      rip.style.top = (e.clientY - r.top - size / 2) + 'px';
      b.appendChild(rip);
      setTimeout(function () { rip.remove(); }, 620);
    }, { passive: true });

    /* --------------------------- Android shell --------------------------- */
    var androidVer = /Android (\d+)/.exec(navigator.userAgent);
    if (androidVer && Number(androidVer[1]) >= 15) document.documentElement.classList.add('e2e');

    function tagNativePlatform() {
      try {
        var C = window.Capacitor;
        if (!C || !C.getPlatform) return;
        var native = (typeof C.isNativePlatform === 'function') ? C.isNativePlatform() : true;
        if (native && C.getPlatform() === 'android') document.documentElement.classList.add('android-app');
      } catch (e) {}
    }
    tagNativePlatform();
    setTimeout(tagNativePlatform, 1200);

    var backWired = false;
    function wireBackButton() {
      var Cap = window.Capacitor;
      if (backWired || !Cap || !Cap.Plugins || !Cap.Plugins.App || !Cap.Plugins.App.addListener) return;
      backWired = true;
      Cap.Plugins.App.addListener('backButton', function () {
        if (document.querySelector('.modal-back')) {
          var last = document.querySelectorAll('.modal-back');
          last[last.length - 1].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          return;
        }
        if (App.back()) return;
        if (App.currentRoute().name !== 'home') { App.navigate('#/home'); return; }
        try { Cap.Plugins.App.exitApp(); } catch (e) {}
      });
    }
    wireBackButton();
    setTimeout(wireBackButton, 1200);
    setTimeout(wireBackButton, 3000);

    /* ------------------------------- start ------------------------------- */
    App.renderRoute();

    /* Images used to be embedded in the settings blob at a reduced size.
       Move any of those into the image store, at full size, once. */
    App.Images.migrate(function (moved) {
      if (moved) {
        App.toast('Moved ' + moved + ' moodboard image' + (moved === 1 ? '' : 's') + ' to full-size storage.', null, 4000);
        if (App.currentRoute().name === 'design') App.renderRoute();
      }
    });

    App.runSplash(function () {
      if (!App.Store.data.games.length) {
        App.toast('Welcome. Start with “Plan” to set up your first project.', null, 5200);
      }
    });

    window.addEventListener('storage', function (e) {
      if (e.key === App.Store.key) {
        App.Store.load();
        App.renderRoute();
      }
    });

    /* ---------------------------- rotation -------------------------------- */
    /* Turning the phone changes the viewport under us. Anything measured in
       JavaScript — the image viewer's fit, sticky offsets — has to be worked
       out again, and the page needs a reflow so nothing keeps a stale width. */
    var lastW = window.innerWidth;
    var lastH = window.innerHeight;

    function handleViewportChange(force) {
      var w = window.innerWidth;
      var h = window.innerHeight;
      if (!force && w === lastW && h === lastH) return;
      var turned = (w > h) !== (lastW > lastH);
      lastW = w;
      lastH = h;
      /* a reflow nudge, in case the WebView kept the old layout width */
      document.documentElement.style.height = '';
      void document.documentElement.offsetHeight;
      if (App.refitViewer) App.refitViewer();
      if (turned) App.renderRoute();
      else App.renderSideMini();
    }

    var onViewportChange = App.debounce(function () { handleViewportChange(false); }, 180);
    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('orientationchange', function () {
      /* Android reports the old size for a moment after the event */
      setTimeout(function () { handleViewportChange(true); }, 60);
      setTimeout(function () { handleViewportChange(true); }, 400);
    }, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange, { passive: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
