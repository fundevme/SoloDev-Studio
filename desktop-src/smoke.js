/* Headless smoke test — renders every view and reports any thrown errors.
   Run with:  npm run smoke        (electron smoke.js)
   Exits 0 when clean, 1 when the app reported problems. */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    show: false, x: -2400, y: 40, width: 1280, height: 900,
    webPreferences: { backgroundThrottling: false }
  });
  const logs = [];

  win.webContents.on('console-message', function () {
    var args = Array.prototype.slice.call(arguments);
    var msg = args.map(function (a) { return typeof a === 'string' ? a : (a && a.message) || ''; }).join(' | ');
    if (/error|uncaught|failed|cannot read/i.test(msg)) logs.push(msg);
  });

  win.webContents.on('did-fail-load', (e, code, desc) => {
    logs.push('did-fail-load: ' + code + ' ' + desc);
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  win.webContents.once('did-finish-load', () => {
    setTimeout(async () => {
      /* Nothing in this suite may hang: every injected script is raced against
         a deadline, and anything thrown comes back as a reported error rather
         than killing the run. */
      async function run(script, label, ms) {
        try {
          return await Promise.race([
            win.webContents.executeJavaScript(script),
            new Promise((_, reject) => setTimeout(
              () => reject(new Error('timed out after ' + Math.round(ms / 1000) + 's')), ms))
          ]);
        } catch (e) {
          return { errors: [label + ': ' + (e && e.message ? e.message : String(e))] };
        }
      }

      try {
        const result = await run(`(function () {
          var errs = [];

          function tryRender(name, fn) {
            try {
              var host = document.createElement('div');
              document.body.appendChild(host);
              fn(host);
              var txt = host.textContent || '';
              if (txt.indexOf('<span') !== -1 || txt.indexOf('<div') !== -1) {
                errs.push(name + ': raw HTML leaked into visible text');
              }
              if (/\\[object Object\\]/.test(txt)) errs.push(name + ': object rendered as text');
              host.remove();
            } catch (e) { errs.push(name + ': ' + (e && e.message ? e.message : String(e))); }
          }

          /* ---------- 1. empty state, every route ---------- */
          App.Store.data.games = [];
          App.Store.data.comps = [];
          App.Store.data.notes = [];
          App.Store.data.ideas = [];
          App.Store.saveNow();

          var routes = ['home', 'plan', 'design', 'market', 'marketing', 'learn', 'toolbox', 'vault'];
          routes.forEach(function (r) {
            if (!App.views[r]) { errs.push('missing view: ' + r); return; }
            tryRender('empty/' + r, function (h) { App.views[r].render(h, []); });
          });

          /* ---------- 1b. nothing in a view may be position:fixed ----------
             Only the app chrome is allowed to be fixed. A stylesheet class
             that collides with one used as data (for example the card badges
             'la' / 'lb' / 'lc') silently turns content into a full-screen
             overlay, so check every rendered view for it. */
          var FIXED_OK = /^(splash|sidebar|topbar|tabbar|toast-root|confetti-root|modal-back|modal|sheet|sheet-back|scrim|viewer|viewer-)/;
          function scoreFixed(name, host) {
            var all = host.querySelectorAll('*');
            for (var i = 0; i < all.length; i++) {
              var cls = all[i].className;
              if (typeof cls !== 'string' || !cls.trim()) continue;   /* only classes can collide */
              if (all[i].tagName === 'TH') continue;                  /* sticky table headers are deliberate */
              var cs = getComputedStyle(all[i]);
              if ((cs.position === 'fixed' || cs.position === 'sticky') && !FIXED_OK.test(cls.trim().split(/\s+/)[0])) {
                errs.push(name + ': "' + all[i].tagName.toLowerCase() + '.' + cls.trim() +
                  '" is ' + cs.position + ' (looks like a class-name collision)');
                return;
              }
            }
          }

          var guideIds = Object.keys(App.guides);
          if (guideIds.length < 3) errs.push('expected 3 guides, found ' + guideIds.length);
          guideIds.forEach(function (id) {
            tryRender('learn/' + id, function (h) { App.views.learn.render(h, [id]); });
            tryRender('learn-fixed/' + id, function (h) {
              App.views.learn.render(h, [id]);
              scoreFixed('learn/' + id, h);
            });
            (App.guides[id].sections || []).forEach(function (s) {
              tryRender('learn/' + id + '/' + s.id, function (h) { App.views.learn.render(h, [id, s.id]); });
            });
          });

          /* every guide section, scanned for stray fixed positioning */
          guideIds.forEach(function (id) {
            (App.guides[id].sections || []).forEach(function (s) {
              tryRender('learn-fixed/' + id + '/' + s.id, function (h) {
                App.views.learn.render(h, [id, s.id]);
                scoreFixed('learn/' + id + '/' + s.id, h);
              });
            });
          });

          ['money', 'scope', 'market', 'ads', 'lists'].forEach(function (g) {
            tryRender('toolbox/' + g, function (h) { App.views.toolbox.render(h, [g]); });
          });

          ['data', 'notes', 'templates', 'glossary', 'sources', 'settings'].forEach(function (t) {
            tryRender('vault/' + t, function (h) { App.views.vault.render(h, [t]); });
          });

          ['plan', 'calendar', 'press', 'budget', 'copy', 'assets', 'runbook'].forEach(function (t) {
            tryRender('marketing/' + t + ' (no project)', function (h) { App.views.marketing.render(h, [t]); });
          });

          ['summary', 'competitors', 'tags', 'price', 'wishlists', 'notes'].forEach(function (t) {
            tryRender('market/' + t + ' (no project)', function (h) { App.views.market.render(h, [t]); });
          });

          /* ---------- 2. with a project ---------- */
          var g = App.newGame({ title: 'Smoke Test Game', label: 'B' });
          g.tasks = App.starterTasks(1);
          App.Store.data.games.push(g);

          var g2 = App.newGame({ title: 'Second Game', label: 'C' });
          g2.active = false;
          App.Store.data.games.push(g2);
          App.Store.saveNow();

          routes.forEach(function (r) {
            tryRender('with-project/' + r, function (h) { App.views[r].render(h, [g.id]); });
          });
          tryRender('plan (list)', function (h) { App.views.plan.render(h, []); });
          tryRender('design (list)', function (h) { App.views.design.render(h, []); });

          /* every design section, including the moodboard */
          ['pitch', 'rules', 'loops', 'numbers', 'feel', 'world', 'art', 'mood', 'tech', 'balance', 'plan', 'playtest', 'cuts'].forEach(function (sec, si) {
            tryRender('design/' + sec, function (h) {
              App.views.design.render(h, [g.id]);
              var btns = h.querySelectorAll('.side-menu button');
              if (btns.length !== 13) errs.push('design menu should have 13 sections, found ' + btns.length);
              if (!btns[si]) { errs.push('design section missing at position ' + si + ': ' + sec); return; }
              btns[si].click();
              var h2 = document.createElement('div');
              document.body.appendChild(h2);
              App.views.design.render(h2, [g.id]);
              if (h2.textContent.indexOf('Part ') === -1) errs.push('design/' + sec + ' rendered nothing');
              h2.remove();
            });
          });

          /* ---------- 2b. moodboard + image viewer ---------- */
          try {
            var TINY = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            g.mood = g.mood || { tiles: [] };
            g.mood.tiles = [
              { id: 't1', type: 'image', url: TINY, local: true, caption: 'Test reference' },
              { id: 't2', type: 'color', a: '#2ee6a8', caption: 'Accent' },
              { id: 't3', type: 'gradient', a: '#2ee6a8', b: '#a78bfa', caption: 'Dash effect' },
              { id: 't4', type: 'note', title: 'Silhouette test', caption: 'reads in black fill' }
            ];
            App.Store.saveNow();

            tryRender('design/mood with tiles', function (h) {
              App.views.design.render(h, [g.id]);
              var btns = h.querySelectorAll('.side-menu button');
              for (var i = 0; i < btns.length; i++) if (btns[i].textContent.indexOf('Moodboard') === 0) btns[i].click();
              var h2 = document.createElement('div');
              document.body.appendChild(h2);
              App.views.design.render(h2, [g.id]);
              if (h2.querySelectorAll('.tile').length !== 4) {
                errs.push('moodboard expected 4 tiles, found ' + h2.querySelectorAll('.tile').length);
              }
              h2.remove();
            });

            /* open the viewer and exercise zoom, pan, next/prev, close */
            var lb = App.lightbox([
              { kind: 'image', src: TINY, caption: 'One' },
              { kind: 'image', src: TINY, caption: 'Two' },
              { kind: 'fill', color: '#a78bfa', caption: 'Three' }
            ], 0);
            if (!lb || !document.querySelector('.viewer')) errs.push('lightbox did not open');
            var stage = document.querySelector('.viewer-stage');
            var pct = document.querySelector('.viewer-pct');
            if (!stage || !pct) errs.push('lightbox is missing its stage or zoom readout');
            else {
              if (pct.textContent !== '100%') errs.push('lightbox should start at 100%, got ' + pct.textContent);

              /* wheel zoom in */
              stage.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, clientX: 600, clientY: 400, bubbles: true, cancelable: true }));
              var afterIn = parseFloat(pct.textContent);
              if (!(afterIn > 100)) errs.push('wheel zoom in did nothing (' + pct.textContent + ')');

              /* wheel zoom out past the start */
              stage.dispatchEvent(new WheelEvent('wheel', { deltaY: 900, clientX: 600, clientY: 400, bubbles: true, cancelable: true }));
              var afterOut = parseFloat(pct.textContent);
              if (!(afterOut < afterIn)) errs.push('wheel zoom out did nothing');

              /* the + and − buttons */
              var zoomBtns = document.querySelectorAll('.viewer-zoomgroup .viewer-btn');
              if (zoomBtns.length < 3) errs.push('expected at least 3 zoom buttons, found ' + zoomBtns.length);
              else {
                zoomBtns[1].click();  /* + */
                var afterPlus = parseFloat(pct.textContent);
                if (!(afterPlus > afterOut)) errs.push('the + button did nothing');
                zoomBtns[0].click();  /* − */
                if (!(parseFloat(pct.textContent) < afterPlus)) errs.push('the − button did nothing');
              }

              /* drag to pan */
              var pan = document.querySelector('.viewer-pan');
              var before = pan.style.transform;
              stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 400, clientY: 300, bubbles: true }));
              stage.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 480, clientY: 360, bubbles: true }));
              stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 480, clientY: 360, bubbles: true }));
              if (pan.style.transform === before) errs.push('dragging did not move the image');

              /* next / previous */
              var counter = document.querySelector('.viewer-count');
              if (counter && counter.textContent.indexOf('1 of 3') === -1) errs.push('counter wrong: ' + (counter && counter.textContent));
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
              if (counter && counter.textContent.indexOf('2 of 3') === -1) errs.push('arrow key did not advance: ' + (counter && counter.textContent));
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
              document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
              if (pct.textContent !== '100%') errs.push('pressing 0 did not reset the zoom');

              /* close */
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }

            /* the lightbox must not leak into the page after closing */
            setTimeout(function () {
              var stray = document.querySelector('.viewer');
              if (stray) stray.remove();
            }, 400);
          } catch (e) { errs.push('lightbox test threw: ' + e.message); }

          /* guard against a leftover viewer covering the app */
          Array.prototype.slice.call(document.querySelectorAll('.viewer')).forEach(function (n) { n.remove(); });

          ['plan', 'calendar', 'press', 'budget', 'copy', 'assets', 'runbook'].forEach(function (t) {
            tryRender('marketing/' + t, function (h) { App.views.marketing.render(h, [g.id, t]); });
          });
          ['summary', 'competitors', 'tags', 'price', 'wishlists', 'notes'].forEach(function (t) {
            tryRender('market/' + t, function (h) { App.views.market.render(h, [g.id, t]); });
          });

          /* ---------- 3. the example project ---------- */
          App.Store.data.games = [];
          App.Store.saveNow();
          tryRender('seed via vault click', function (h) {
            App.views.vault.render(h, ['data']);
            var btns = h.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
              if (/example project/i.test(btns[i].textContent)) { btns[i].click(); break; }
            }
          });
          if (!App.Store.data.games.length) errs.push('seed example did not create a project');
          else {
            var eg = App.Store.data.games[0];
            tryRender('example plan', function (h) { App.views.plan.render(h, [eg.id]); });
            tryRender('example design', function (h) { App.views.design.render(h, [eg.id]); });
            tryRender('example market', function (h) { App.views.market.render(h, [eg.id, 'summary']); });
            tryRender('example marketing', function (h) { App.views.marketing.render(h, [eg.id, 'plan']); });
            tryRender('example home', function (h) { App.views.home.render(h, []); });
          }

          /* ---------- 4. logic checks ---------- */
          var d = App.Store.data;
          if (!d.settings) errs.push('no settings object');
          if (typeof App.money(1234) !== 'string') errs.push('money() broken');
          if (App.stageStatus(5) !== 'Building') errs.push('stageStatus wrong: ' + App.stageStatus(5));
          if (App.data.stages.length !== 10) errs.push('stage count is ' + App.data.stages.length);
          if (!App.data.glossary.length) errs.push('glossary empty');
          if (!App.data.templates.length) errs.push('templates empty');
          if (!App.data.campaignTemplate.length) errs.push('campaign template empty');
          if (typeof App.Store.exportJSON() !== 'string') errs.push('export broken');

          try {
            App.Store.importJSON(App.Store.exportJSON());
          } catch (e) { errs.push('export/import round trip: ' + e.message); }

          /* ---------- 1c. the mobile tab bar must list every tabbable route,
             must fit on a narrow screen without sideways scrolling, and must
             be opaque enough to read over scrolling content. ---------- */
          (function () {
            var wanted = [];
            App.NAV.forEach(function (grp) {
              grp.items.forEach(function (it) { if (it.tab) wanted.push(it.route); });
            });
            if (wanted.length !== 8) errs.push('expected 8 tab routes, data has ' + wanted.length);
            ['learn', 'vault', 'home', 'plan', 'design', 'market', 'marketing', 'toolbox'].forEach(function (r) {
              if (wanted.indexOf(r) === -1) errs.push('tab bar is missing: ' + r);
            });

            var bar = document.getElementById('tabbar');
            if (!bar) { errs.push('no tab bar in the DOM'); return; }
            var links = bar.querySelectorAll('.tab-item');
            if (links.length !== wanted.length) {
              errs.push('tab bar shows ' + links.length + ' items, expected ' + wanted.length);
            }
            wanted.forEach(function (r) {
              if (!bar.querySelector('.tab-item[data-route="' + r + '"]')) {
                errs.push('tab bar has no button for ' + r);
              }
            });
          })();

          Object.keys(App.data.labels).forEach(function (k) {
            var L = App.data.labels[k];
            ['name', 'short', 'color', 'msrp', 'summary', 'cadence', 'ratio', 'focus', 'why', 'watchOut'].forEach(function (f) {
              if (L[f] == null) errs.push('label ' + k + ' missing ' + f);
            });
          });
          App.data.stages.forEach(function (s) {
            ['n', 'name', 'short', 'goal', 'why', 'deliverable', 'checklist'].forEach(function (f) {
              if (s[f] == null) errs.push('stage ' + s.n + ' missing ' + f);
            });
            if (!s.checklist.length) errs.push('stage ' + s.n + ' has an empty checklist');
          });
          ['A', 'B', 'C'].forEach(function (k) {
            if (!App.data.gddTemplates[k]) errs.push('gdd template missing ' + k);
          });

          /* leave storage empty so a real launch starts clean */
          App.Store.data.games = [];
          App.Store.saveNow();

          return {
            errors: errs,
            views: Object.keys(App.views),
            guides: Object.keys(App.guides),
            stages: App.data.stages.length,
            glossary: App.data.glossary.length
          };
})()`, 'main suite', 180000);
        console.log('SMOKE_RESULT ' + JSON.stringify(result));

        /* ---------- 5. the full-size image store (async) ---------- */
        const imgResult = await run(`(function () {
          return new Promise(function (finish) {
            var errs = [];

            function makeFile(w, h, name, cb) {
              var c = document.createElement('canvas');
              c.width = w; c.height = h;
              var x = c.getContext('2d');
              x.fillStyle = '#2ee6a8'; x.fillRect(0, 0, w, h);
              x.fillStyle = '#0a0e13'; x.fillRect(10, 10, w - 20, h - 20);
              c.toBlob(function (b) { cb(new File([b], name, { type: 'image/png' })); }, 'image/png');
            }

            function done() { finish({ errors: errs }); }

            if (!App.Images) { errs.push('image store missing'); return done(); }

            /* start from a clean store so the counts below are meaningful
               (a previous run, or the visual checks, may have left files) */
            App.Images.clear(function () {
              App.Images.total(function (baseBytes, baseCount) {
                if (baseCount !== 0 || baseBytes !== 0) {
                  errs.push('image store: could not empty it before the test');
                }
                runTests();
              });
            });

            function runTests() {
            /* a deliberately large image, to prove nothing is downscaled */
            makeFile(3200, 1800, 'big reference.png', function (f) {
              var originalBytes = f.size;
              App.Images.put(f, function (res, err) {
                if (!res) { errs.push('image store: put failed (' + err + ')'); return done(); }
                if (res.w !== 3200 || res.h !== 1800) {
                  errs.push('image store: dimensions changed, got ' + res.w + 'x' + res.h + ' (expected 3200x1800)');
                }
                if (res.bytes !== originalBytes) {
                  errs.push('image store: file was re-encoded (' + res.bytes + ' bytes vs ' + originalBytes + ')');
                }
                if (res.name !== 'big reference.png') errs.push('image store: filename lost');

                var id = res.id;
                App.Images.url(id, function (url) {
                  if (!url || url.indexOf('blob:') !== 0) errs.push('image store: no blob url back');

                  /* the bytes that come out must be identical to the bytes that went in */
                  fetch(url).then(function (r) { return r.blob(); }).then(function (back) {
                    if (back.size !== originalBytes) {
                      errs.push('image store: stored copy differs in size (' + back.size + ' vs ' + originalBytes + ')');
                    }
                    if (back.type !== 'image/png') errs.push('image store: mime type changed to ' + back.type);

                    App.Images.meta(id, function (m) {
                      if (!m || m.w !== 3200 || m.h !== 1800) errs.push('image store: meta is wrong');

                      App.Images.total(function (bytes, count) {
                        if (count !== 1) errs.push('image store: expected 1 file, got ' + count);
                        if (bytes !== originalBytes) errs.push('image store: reported size is wrong');

                        /* a tile referencing it must render a real picture */
                        var g = App.newGame({ title: 'Image Store Test', label: 'A' });
                        g.mood.tiles = [{ id: 'T1', type: 'image', imgId: id, name: res.name, w: 3200, h: 1800, bytes: res.bytes, caption: 'big' }];
                        App.Store.data.games = [g];
                        App.Store.saveNow();
                        location.hash = '#/design/' + g.id;

                        setTimeout(function () {
                          /* the design page is now on screen; open the moodboard part */
                          try {
                            var btns = document.querySelectorAll('.side-menu button');
                            if (!btns.length) errs.push('moodboard: the design page did not render');
                            for (var i = 0; i < btns.length; i++) {
                              if (btns[i].textContent.indexOf('Moodboard') === 0) { btns[i].click(); break; }
                            }
                          } catch (e) { errs.push('moodboard render: ' + e.message); }

                          setTimeout(function () {
                            var tileImg = document.querySelector('.tile img');
                            if (!tileImg) errs.push('moodboard: no image element for the stored picture');
                            else if (!tileImg.src || tileImg.src.indexOf('blob:') !== 0) {
                              errs.push('moodboard: tile did not resolve to the stored picture (src=' + tileImg.src.slice(0, 30) + ')');
                            } else if (tileImg.naturalWidth && tileImg.naturalWidth < 3200) {
                              errs.push('moodboard: displayed at reduced size (' + tileImg.naturalWidth + 'px wide)');
                            }

                            /* a stale blob: URL saved by an older build must be
                               ignored, not used — it is dead after a restart */
                            var savedWithStale = JSON.parse(App.Store.exportJSON());
                            if (/blob:/.test(JSON.stringify(savedWithStale))) {
                              errs.push('the saved store contains a blob: URL (it will be dead next launch)');
                            }
                            var gNow = App.Store.data.games[0];
                            gNow.mood.tiles[0]._url = 'blob:file:///stale-url-from-a-previous-session';
                            App.Store.saveNow();
                            App.Store.load();                       /* as if the app had been reopened */
                            try {
                              location.hash = '#/design/' + App.Store.data.games[0].id;
                            } catch (e) { errs.push('reopen: could not navigate: ' + e.message); }

                            setTimeout(function () {
                              try {
                                var b2 = document.querySelectorAll('.side-menu button');
                                if (!b2.length) errs.push('moodboard after reopen: the design page did not render');
                                for (var k = 0; k < b2.length; k++) {
                                  if (b2[k].textContent.indexOf('Moodboard') === 0) { b2[k].click(); break; }
                                }
                              } catch (e) { errs.push('moodboard after reopen: ' + e.message); }

                              setTimeout(function () {
                                try {
                                  var fresh = document.querySelector('.tile img');
                                  if (!fresh) errs.push('moodboard after reopen: no picture');
                                  else if (fresh.src.indexOf('stale-url') >= 0) {
                                    errs.push('moodboard after reopen: used the dead blob url from the last session');
                                  } else if (!fresh.complete || !fresh.naturalWidth) {
                                    errs.push('moodboard after reopen: the picture did not load');
                                  }
                                } catch (e) { errs.push('moodboard after reopen: ' + e.message); }

                                /* deleting the tile must delete the file */
                                App.Images.remove(id);
                                App.Images.total(function (b3, c3) {
                                  if (c3 !== 0) errs.push('image store: file still there after delete');
                                  App.Store.data.games = [];
                                  App.Store.saveNow();
                                  location.hash = '#/home';
                                  done();
                                });
                              }, 900);
                            }, 900);
                          }, 900);
                        }, 600);
                      });
                    });
                  }).catch(function (e) { errs.push('image store: could not read it back: ' + e.message); done(); });
                });
              });
            });
            }
          });
        })()`, 'image store test', 60000);
        result.errors = result.errors.concat(imgResult.errors);
        console.log('IMAGE_STORE ' + JSON.stringify(imgResult));

        /* ---------- 6. the tab bar at real phone widths ---------- */
        const MEASURE = `(function () {
          var bar = document.getElementById('tabbar');
          var links = bar.querySelectorAll('.tab-item');
          var barRect = bar.getBoundingClientRect();
          var cs = getComputedStyle(bar);
          var overflow = 0, narrowest = 9999, emptyLabels = 0, tops = {};
          Array.prototype.forEach.call(links, function (l) {
            var r = l.getBoundingClientRect();
            if (r.right > barRect.right + 1.5 || r.left < barRect.left - 1.5) overflow++;
            if (r.width < narrowest) narrowest = r.width;
            tops[Math.round(r.top)] = 1;
            var span = l.querySelector('span');
            if (!span || !span.textContent.trim() || span.getBoundingClientRect().width < 12) emptyLabels++;
          });
          return {
            tabs: links.length,
            overflow: overflow,
            rows: Object.keys(tops).length,
            narrowest: Math.round(narrowest),
            emptyLabels: emptyLabels,
            scrolls: bar.scrollWidth > bar.clientWidth + 1,
            barWidth: Math.round(barRect.width),
            viewport: window.innerWidth,
            background: cs.backgroundColor
          };
        })()`;

        const barSizes = [];
        for (const w of [320, 360, 393, 430, 540]) {
          win.setBounds({ x: -2400, y: 40, width: w, height: 780 });
          await new Promise(r => setTimeout(r, 420));
          const info = await win.webContents.executeJavaScript(MEASURE);
          info.asked = w;
          barSizes.push(info);

          /* if the window manager refused the resize, the numbers would be
             about a different width — say so rather than pass silently */
          const effective = Math.abs(info.viewport - w) <= 24;
          if (!effective) { info.skipped = true; continue; }

          if (info.overflow) result.errors.push(w + 'px: ' + info.overflow + ' tab(s) pushed off the edge');
          if (info.rows > 1) result.errors.push(w + 'px: the tab bar wrapped onto ' + info.rows + ' rows');
          if (info.tabs !== 8) result.errors.push(w + 'px: ' + info.tabs + ' tabs visible, expected 8');
          if (info.narrowest < 30) result.errors.push(w + 'px: narrowest tab is ' + info.narrowest + 'px');
          if (info.emptyLabels) result.errors.push(w + 'px: ' + info.emptyLabels + ' tab label(s) unreadable');
          if (info.scrolls) result.errors.push(w + 'px: the tab bar scrolls sideways');
          const transparent = /rgba\(\s*[^)]*,\s*0?\.\d+\s*\)/.test(info.background);
          if (transparent) result.errors.push(w + 'px: the tab bar is see-through (' + info.background + ')');
        }
        const checked = barSizes.filter(function (s) { return !s.skipped; }).map(function (s) { return s.viewport; });
        if (checked.length < 2) result.errors.push('tab bar: could not test enough screen widths');
        console.log('TABBAR ' + JSON.stringify(barSizes));
        win.setBounds({ x: -2400, y: 40, width: 380, height: 820 });
        await new Promise(r => setTimeout(r, 400));

        /* ---------- 7. nothing may spill sideways on a phone ----------
           A grid track of "1fr" is minmax(auto, 1fr); when an item's
           min-content is large the track blows past its container and pushes
           content off the right edge, where it is simply invisible. Check
           every page for anything wider than the screen. */
        const OVERFLOW = `(function () {
          var vw = document.documentElement.clientWidth;
          /* Only real scroll containers excuse a child that sticks out. A
             'clip' box does NOT: the content is still cut off and unreadable,
             which is just as broken as a sideways-scrolling page. */
          function insideScroller(el) {
            var p = el.parentElement;
            while (p && p !== document.body) {
              var ov = getComputedStyle(p).overflowX;
              if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') return true;
              p = p.parentElement;
            }
            return false;
          }
          var bad = [];
          var all = document.querySelectorAll('#view-root *, .topbar *, #tabbar *');
          for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.offsetParent === null && el.tagName !== 'BODY') continue;
            var r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            if (r.right > vw + 1.5 && !insideScroller(el)) {
              var name = el.tagName.toLowerCase() +
                (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : '');
              if (bad.indexOf(name) === -1) bad.push(name + ' (right edge ' + Math.round(r.right) + ' of ' + vw + ')');
            }
          }
          return {
            viewport: vw,
            offenders: bad.slice(0, 6),
            pageScrolls: document.documentElement.scrollWidth > vw + 1,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            tabbarWidth: Math.round(document.getElementById('tabbar').getBoundingClientRect().width)
          };
        })()`;

        const gameForViews = await win.webContents.executeJavaScript(`(function(){
          var g = App.newGame({ title: 'Overflow Check', label: 'B' });
          g.tasks = App.starterTasks(3);
          g.market.tags = [{ tag: 'Roguelite', heat: 'huge', mine: true }];
          g.market.wishlists = [{ date: '2026-09-01', count: 400 }, { date: '2026-09-08', count: 900 }];
          App.Store.data.games = [g];
          App.Store.saveNow();
          return g.id;
        })()`);

        /* the real Android shell sets these two classes; the layout rules
           they switch on have to be part of the overflow check too */
        await win.webContents.executeJavaScript(`(function(){
          document.documentElement.classList.add('android-app', 'e2e');
          return true;
        })()`);

        const phoneRoutes = [
          ['home', '#/home'], ['plan', '#/plan'], ['plan detail', '#/plan/' + gameForViews],
          ['design', '#/design/' + gameForViews], ['market', '#/market/' + gameForViews],
          ['marketing', '#/marketing/' + gameForViews], ['learn', '#/learn/roadmap'],
          /* every toolbox group, named explicitly: #/toolbox remembers the last
             one you looked at, so a bare '#/toolbox' is not always the first */
          ['toolbox money', '#/toolbox/money'], ['toolbox scope', '#/toolbox/scope'],
          ['toolbox market', '#/toolbox/market'], ['toolbox ads', '#/toolbox/ads'],
          ['toolbox lists', '#/toolbox/lists'],
          ['vault', '#/vault']
        ];
        for (const [name, hash] of phoneRoutes) {
          await win.webContents.executeJavaScript('location.hash = ' + JSON.stringify(hash));
          await new Promise(r => setTimeout(r, 800));
          const rep = await win.webContents.executeJavaScript(OVERFLOW);
          if (rep.pageScrolls) {
            result.errors.push(name + ' @phone: the page scrolls sideways (scrollWidth ' + rep.scrollWidth + ' vs ' + rep.viewport + ')');
          }
          if (rep.tabbarWidth > rep.viewport + 1) {
            result.errors.push(name + ' @phone: the tab bar is wider than the screen (' + rep.tabbarWidth + ' vs ' + rep.viewport + ')');
          }
          if (rep.offenders.length) {
            result.errors.push(name + ' @phone: content past the right edge -> ' + rep.offenders.join(' | '));
          }
          console.log('PHONE ' + name + ' ' + JSON.stringify(rep));
        }
        await win.webContents.executeJavaScript(`(function(){
          App.Store.data.games = [];
          App.Store.saveNow();
          /* back to the plain narrow layout: the Android shell hides the
             hamburger, and the drawer test needs it */
          document.documentElement.classList.remove('android-app', 'e2e');
          return true;
        })()`);

        /* ---------- 7b. the Design section menu must sit above the panel on a
              phone, not pin itself on top of it while you scroll ---------- */
        win.setBounds({ x: -2400, y: 40, width: 380, height: 820 });
        await new Promise(r => setTimeout(r, 500));
        const designMobile = await win.webContents.executeJavaScript(`(function(){
          var g = App.newGame({ title: 'Menu Check', label: 'A' });
          App.Store.data.games = [g];
          App.Store.saveNow();
          location.hash = '#/design/' + g.id;
          return g.id;
        })()`);
        await new Promise(r => setTimeout(r, 900));
        const menuTop = await win.webContents.executeJavaScript(`(function(){
          var m = document.querySelector('.side-menu');
          var p = document.querySelector('.split') ? document.querySelector('.split').children[1] : null;
          if (!m || !p) return { err: 'no side menu or panel' };
          return {
            viewport: window.innerWidth,
            position: getComputedStyle(m).position,
            scrollable: document.documentElement.scrollHeight - window.innerHeight,
            overflow: getComputedStyle(document.documentElement).overflow,
            menuBottom: Math.round(m.getBoundingClientRect().bottom),
            panelTop: Math.round(p.getBoundingClientRect().top),
            overlap: m.getBoundingClientRect().bottom > p.getBoundingClientRect().top + 1
          };
        })()`);
        if (menuTop.err) result.errors.push('design menu: ' + menuTop.err);
        else {
          if (menuTop.position === 'sticky' || menuTop.position === 'fixed') {
            result.errors.push('design menu @phone (' + menuTop.viewport + 'px): still ' + menuTop.position + ', so it can cover the panel');
          }
          if (menuTop.overlap) result.errors.push('design menu @phone: overlaps the panel before scrolling');
        }
        console.log('DESIGN_MENU_TOP ' + JSON.stringify(menuTop));

        await win.webContents.executeJavaScript('window.scrollTo(0, 700); true');
        await new Promise(r => setTimeout(r, 700));
        const menuScrolled = await win.webContents.executeJavaScript(`(function(){
          var m = document.querySelector('.side-menu');
          var p = document.querySelector('.split') ? document.querySelector('.split').children[1] : null;
          if (!m || !p) return { err: 'gone after scrolling' };
          var mr = m.getBoundingClientRect(), pr = p.getBoundingClientRect();
          return {
            scrollY: Math.round(window.scrollY),
            menu: { y: Math.round(mr.y), h: Math.round(mr.height) },
            panel: { y: Math.round(pr.y), h: Math.round(pr.height) },
            overlap: mr.bottom > pr.top + 1
          };
        })()`);
        if (menuScrolled.err) result.errors.push('design menu: ' + menuScrolled.err);
        else if (menuScrolled.overlap) {
          result.errors.push('design menu @phone: covers the panel after scrolling ' +
            JSON.stringify(menuScrolled.menu) + ' vs panel ' + JSON.stringify(menuScrolled.panel));
        }
        console.log('DESIGN_MENU_SCROLLED ' + JSON.stringify(menuScrolled));
        await win.webContents.executeJavaScript(`(function(){ App.Store.data.games = []; App.Store.saveNow(); window.scrollTo(0,0); return true; })()`);

        /* ---------- 7c. Learn section chips must stay pill sized ---------- */
        for (const guide of ['roadmap', 'rendering', 'marketing']) {
          await win.webContents.executeJavaScript('location.hash = "#/learn/' + guide + '"');
          await new Promise(r => setTimeout(r, 800));
          const chips = await win.webContents.executeJavaScript(`(function(){
            var row = document.querySelector('.pill-row');
            if (!row) return { err: 'no chip row' };
            var tallest = 0, widest = 0, count = 0;
            var names = [];
            Array.prototype.forEach.call(row.children, function (c) {
              var r = c.getBoundingClientRect();
              count++;
              if (r.height > tallest) tallest = r.height;
              if (r.width > widest) widest = r.width;
              if (r.height > 60) names.push(c.textContent.slice(0, 26) + '=' + Math.round(r.height) + 'px');
            });
            return { count: count, tallest: Math.round(tallest), widest: Math.round(widest),
                     rowHeight: Math.round(row.getBoundingClientRect().height), oversized: names };
          })()`);
          if (chips.err) { result.errors.push('learn/' + guide + ' chips: ' + chips.err); continue; }
          if (chips.tallest > 60) {
            result.errors.push('learn/' + guide + ': a section chip is ' + chips.tallest + 'px tall (' + chips.oversized.join(', ') + ')');
          }
          console.log('CHIPS ' + guide + ' ' + JSON.stringify(chips));
        }
        await win.webContents.executeJavaScript('window.scrollTo(0,0); true');

        win.setBounds({ x: -2400, y: 40, width: 1280, height: 900 });
        await new Promise(r => setTimeout(r, 300));

        /* ---------- 8. interaction bugs that are easy to reintroduce ---------- */

        /* a) boolean attributes: passing 0 must switch the feature OFF */
        const attrCheck = await win.webContents.executeJavaScript(`(function(){
          var e1 = App.el('button', { disabled: 0 }, 'x');
          var e2 = App.el('button', { disabled: 1 }, 'x');
          var e3 = App.el('button', { disabled: false }, 'x');
          var e4 = App.el('input', { type: 'checkbox', checked: 'checked' });
          var e5 = App.el('textarea', { readonly: 'readonly' });
          return {
            zero: e1.disabled, one: e2.disabled, no: e3.disabled,
            checked: e4.checked, readonly: e5.readOnly
          };
        })()`);
        if (attrCheck.zero !== false) result.errors.push('App.el: "disabled: 0" disabled the element');
        if (attrCheck.one !== true) result.errors.push('App.el: "disabled: 1" did not disable the element');
        if (attrCheck.no !== false) result.errors.push('App.el: "disabled: false" disabled the element');
        if (attrCheck.checked !== true) result.errors.push('App.el: "checked" did not check the box');
        if (attrCheck.readonly !== true) result.errors.push('App.el: "readonly" did not apply');
        console.log('ATTRS ' + JSON.stringify(attrCheck));

        /* b) the confirm dialog must be able to answer yes */
        const confirmCheck = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (resolve) {
            var p = App.confirm({ title: 'Test', body: 'yes or no', confirmText: 'Yes' });
            setTimeout(function () {
              var btns = document.querySelectorAll('.modal .modal-foot button');
              if (!btns.length) return resolve({ err: 'no buttons in the dialog' });
              btns[btns.length - 1].click();
            }, 150);
            p.then(function (answer) {
              var stillOpen = !!document.querySelector('.modal-back');
              resolve({ answer: answer, closed: !stillOpen });
            });
          });
        })()`);
        if (confirmCheck.answer !== true) {
          result.errors.push('App.confirm: pressing "yes" resolved ' + JSON.stringify(confirmCheck.answer) + ' instead of true');
        }
        if (confirmCheck.closed !== true) result.errors.push('App.confirm: the dialog stayed open after answering');
        console.log('CONFIRM ' + JSON.stringify(confirmCheck));

        /* the cancel path must still say no */
        const confirmNo = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (resolve) {
            var p = App.confirm({ title: 'Test', body: 'no thanks' });
            setTimeout(function () {
              var btns = document.querySelectorAll('.modal .modal-foot button');
              if (!btns.length) return resolve({ err: 'no buttons' });
              btns[0].click();
            }, 150);
            p.then(function (answer) { resolve({ answer: answer }); });
          });
        })()`);
        if (confirmNo.answer !== false) result.errors.push('App.confirm: cancel resolved ' + JSON.stringify(confirmNo.answer));
        console.log('CONFIRM_CANCEL ' + JSON.stringify(confirmNo));

        /* c) re-rendering the page you are on must not jump to the top,
              and moving to another page must. Uses a long page so the
              scroll position is real. */
        const scrollCheck = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (resolve) {
            location.hash = '#/learn/roadmap';
            setTimeout(function () {
              document.documentElement.style.scrollBehavior = 'auto';
              window.scrollTo(0, 900);
              var before = window.scrollY;
              if (before < 100) {
                document.documentElement.style.scrollBehavior = '';
                return resolve({ err: 'page too short to test scrolling', before: before });
              }
              App.renderRoute();                     /* same page again */
              var afterSame = window.scrollY;

              /* and a tile action, the way the moodboard does it */
              location.hash = '#/plan';
              setTimeout(function () {
                document.documentElement.style.scrollBehavior = '';
                resolve({ before: before, afterSame: afterSame, afterNav: window.scrollY });
              }, 800);
            }, 900);
          });
        })()`);
        if (scrollCheck.err) {
          result.errors.push('scroll test: ' + scrollCheck.err);
        } else {
          if (Math.abs(scrollCheck.afterSame - scrollCheck.before) > 8) {
            result.errors.push('re-rendering the same page moved the scroll from ' +
              scrollCheck.before + ' to ' + scrollCheck.afterSame);
          }
          if (scrollCheck.afterNav > 8) {
            result.errors.push('navigating to a new page left the scroll at ' + scrollCheck.afterNav);
          }
        }
        console.log('SCROLL ' + JSON.stringify(scrollCheck));

        /* d) the moodboard's file picker must be clickable and present */
        const pickerCheck = await win.webContents.executeJavaScript(`(function(){
          var g = App.newGame({ title: 'Picker Check', label: 'A' });
          App.Store.data.games = [g];
          App.Store.saveNow();
          location.hash = '#/design/' + g.id;
          return new Promise(function (resolve) {
            setTimeout(function () {
              var btns = document.querySelectorAll('.side-menu button');
              for (var i = 0; i < btns.length; i++) {
                if (btns[i].textContent.indexOf('Moodboard') === 0) { btns[i].click(); break; }
              }
              setTimeout(function () {
                var label = null;
                var all = document.querySelectorAll('#view-root button');
                for (var j = 0; j < all.length; j++) {
                  if (/choose from this device/i.test(all[j].textContent)) { label = all[j]; break; }
                }
                var input = document.querySelector('#view-root input[type="file"]');
                var res = {
                  buttonFound: !!label,
                  buttonDisabled: label ? label.disabled : null,
                  inputFound: !!input,
                  inputInDocument: input ? document.body.contains(input) : false,
                  inputMultiple: input ? input.multiple : null,
                  inputAccept: input ? input.accept : null,
                  storeAvailable: App.Images.available()
                };
                /* clicking must not throw */
                if (label) { try { label.click(); res.clicked = true; } catch (e) { res.clickError = e.message; } }
                App.Store.data.games = [];
                App.Store.saveNow();
                location.hash = '#/home';
                resolve(res);
              }, 700);
            }, 600);
          });
        })()`);
        if (!pickerCheck.buttonFound) result.errors.push('moodboard: no "Choose from this device" button');
        if (pickerCheck.buttonDisabled) result.errors.push('moodboard: the file picker button is disabled');
        if (!pickerCheck.inputFound) result.errors.push('moodboard: no file input on the page');
        if (!pickerCheck.inputInDocument) result.errors.push('moodboard: the file input is not in the document');
        if (pickerCheck.inputMultiple !== true) result.errors.push('moodboard: the file input does not allow several files');
        if (pickerCheck.clickError) result.errors.push('moodboard: clicking the picker threw ' + pickerCheck.clickError);
        console.log('PICKER ' + JSON.stringify(pickerCheck));

        /* e) end to end: the real "Delete everything" button must actually
              clear the data, and cancel must not. */
        const wipeCheck = await win.webContents.executeJavaScript(`(function(){
          function clickText(sel, re) {
            var all = document.querySelectorAll(sel);
            for (var i = 0; i < all.length; i++) { if (re.test(all[i].textContent)) return all[i]; }
            return null;
          }
          function pressConfirm() {
            var btns = document.querySelectorAll('.modal .modal-foot button');
            if (!btns.length) return false;
            btns[btns.length - 1].click();
            return true;
          }
          return new Promise(function (resolve) {
            var g = App.newGame({ title: 'Doomed Project', label: 'A' });
            App.Store.data.games = [g];
            App.Store.data.notes = [{ id: 'n1', title: 'keep me', body: '', updated: '2026-09-01' }];
            App.Store.saveNow();
            location.hash = '#/vault/data';

            setTimeout(function () {
              /* first: cancel must change nothing */
              var btn = clickText('#view-root button', /^delete everything$/i);
              if (!btn) return resolve({ err: 'no "Delete everything" button found' });
              btn.click();
              setTimeout(function () {
                if (!document.querySelector('.modal-back')) return resolve({ err: 'no dialog appeared' });
                var cancel = document.querySelectorAll('.modal .modal-foot button')[0];
                cancel.click();
                setTimeout(function () {
                  var survived = App.Store.data.games.length;
                  if (survived !== 1) {
                    return resolve({ err: 'cancel deleted the data', survived: survived });
                  }
                  /* now really do it */
                  var btn2 = clickText('#view-root button', /^delete everything$/i);
                  if (!btn2) return resolve({ err: 'button vanished after cancelling' });
                  btn2.click();
                  setTimeout(function () {
                    if (!pressConfirm()) return resolve({ err: 'no dialog the second time' });
                    setTimeout(function () {
                      resolve({
                        cancelledSafely: survived === 1,
                        gamesAfter: App.Store.data.games.length,
                        notesAfter: (App.Store.data.notes || []).length
                      });
                    }, 500);
                  }, 250);
                }, 300);
              }, 250);
            }, 800);
          });
        })()`);
        if (wipeCheck.err) {
          result.errors.push('delete everything: ' + wipeCheck.err);
        } else {
          if (wipeCheck.gamesAfter !== 0) result.errors.push('delete everything: projects survived (' + wipeCheck.gamesAfter + ')');
          if (wipeCheck.notesAfter !== 0) result.errors.push('delete everything: notes survived (' + wipeCheck.notesAfter + ')');
        }
        console.log('WIPE ' + JSON.stringify(wipeCheck));

        /* ---------- 9. pressing a control must not resize it ----------
              The ripple is inserted on pointerdown, so it never showed up in a
              synthetic .click(). Anything the ripple is added to has to stay
              exactly the size it was. */
        const pressCheck = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (finish) {
            var errs = [];
            location.hash = '#/learn/marketing';
            setTimeout(function () {
              var targets = [];
              var chip = document.querySelector('.pill-row .chip.click');
              if (chip) targets.push(['learn chip', chip]);
              var btn = document.querySelector('#view-root .btn');
              if (btn) targets.push(['learn button', btn]);
              var icon = document.querySelector('.icon-btn');
              if (icon) targets.push(['top bar icon', icon]);
              if (!targets.length) return finish({ errors: ['no controls found to press'] });

              var results = [];
              targets.forEach(function (t) {
                var el = t[1];
                var before = el.getBoundingClientRect();
                var r = el.getBoundingClientRect();
                el.dispatchEvent(new PointerEvent('pointerdown', {
                  bubbles: true, cancelable: true, pointerId: 1,
                  clientX: Math.round(r.left + r.width / 2),
                  clientY: Math.round(r.top + r.height / 2)
                }));
                var after = el.getBoundingClientRect();
                var ripples = el.querySelectorAll('.ripple').length;
                var cs = getComputedStyle(el);
                results.push({
                  name: t[0], ripples: ripples, position: cs.position,
                  wBefore: Math.round(before.width), hBefore: Math.round(before.height),
                  wAfter: Math.round(after.width), hAfter: Math.round(after.height),
                  overflows: el.scrollWidth > el.clientWidth + 2
                });
                if (after.width > before.width + 1.5) {
                  errs.push(t[0] + ': pressing it made it ' + Math.round(after.width - before.width) + 'px wider');
                }
                if (after.height > before.height + 1.5) {
                  errs.push(t[0] + ': pressing it made it ' + Math.round(after.height - before.height) + 'px taller');
                }
                if (cs.position === 'static') errs.push(t[0] + ': the ripple has no positioning context');
                if (el.scrollWidth > el.clientWidth + 2) errs.push(t[0] + ': content overflows the control after pressing');
              });
              finish({ errors: errs, results: results });
            }, 900);
          });
        })()`);
        result.errors = result.errors.concat(pressCheck.errors || []);
        console.log('PRESS ' + JSON.stringify(pressCheck));

        /* ---------- 10. the slide-out drawer must be above its own dim layer.
              Both have to sit in the same stacking context, or the scrim ends
              up pinning the whole app behind a blur with the drawer hidden. */
        win.setBounds({ x: -2400, y: 40, width: 900, height: 800 });
        await new Promise(r => setTimeout(r, 500));
        await win.webContents.executeJavaScript('location.hash = "#/home"; window.scrollTo(0,0); true');
        await new Promise(r => setTimeout(r, 700));

        const drawer = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (finish) {
            var errs = [];
            var menuBtn = document.getElementById('btn-menu');
            var sidebar = document.getElementById('sidebar');
            if (!menuBtn || !sidebar) return finish({ errors: ['no menu button or sidebar'] });

            var btnStyle = getComputedStyle(menuBtn);
            if (btnStyle.display === 'none') {
              return finish({ errors: ['the menu button is hidden, so this layout cannot be tested'] });
            }

            menuBtn.click();
            setTimeout(function () {
              var scrim = document.querySelector('.scrim');
              if (!scrim) return finish({ errors: ['clicking the menu button did not dim the page'] });
              if (!sidebar.classList.contains('open')) errs.push('the drawer did not open');

              var sb = sidebar.getBoundingClientRect();
              var cx = Math.round(sb.left + sb.width / 2);
              var cy = Math.round(sb.top + sb.height / 2);
              var hit = document.elementFromPoint(cx, cy);
              var insideDrawer = !!(hit && (sidebar === hit || sidebar.contains(hit)));
              if (!insideDrawer) {
                errs.push('the drawer is behind the dim layer — a click at its centre hits ' +
                  (hit ? hit.tagName.toLowerCase() + '.' + (hit.className || '') : 'nothing'));
              }

              /* the drawer must out-rank the scrim in the same context */
              var scrimZ = parseInt(getComputedStyle(scrim).zIndex, 10);
              var sideZ = parseInt(getComputedStyle(sidebar).zIndex, 10);
              if (scrim.parentElement !== sidebar.parentElement) {
                errs.push('the dim layer is attached to <' + scrim.parentElement.tagName.toLowerCase() +
                  '> but the drawer is in <' + sidebar.parentElement.tagName.toLowerCase() + '> — different stacking contexts');
              }
              if (!(sideZ > scrimZ)) errs.push('the drawer (z ' + sideZ + ') does not out-rank the dim layer (z ' + scrimZ + ')');

              /* and clicking the dim layer closes it */
              var sameParent = scrim.parentElement === sidebar.parentElement;
              scrim.click();
              setTimeout(function () {
                var gone = !document.querySelector('.scrim');
                var closed = !sidebar.classList.contains('open');
                if (!gone) errs.push('the dim layer stayed after clicking it');
                if (!closed) errs.push('the drawer stayed open after clicking the dim layer');
                finish({ errors: errs, insideDrawer: insideDrawer, sideZ: sideZ, scrimZ: scrimZ,
                         sameParent: sameParent });
              }, 350);
            }, 650);
          });
        })()`);
        result.errors = result.errors.concat(drawer.errors || []);
        console.log('DRAWER ' + JSON.stringify(drawer));

        /* ---------- 11. turning the phone must leave the layout sane -------- */
        const ROTATE_CHECK = `(function(){
          var vw = document.documentElement.clientWidth;
          var vh = document.documentElement.clientHeight;
          var bar = document.getElementById('tabbar');
          var all = document.querySelectorAll('#view-root *, .topbar *, #tabbar *');
          var over = 0;
          for (var i = 0; i < all.length; i++) {
            var r = all[i].getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            if (r.right > vw + 1.5) over++;
          }
          return {
            vw: vw, vh: vh,
            orientation: vw > vh ? 'landscape' : 'portrait',
            docScrollW: document.documentElement.scrollWidth,
            tabbarW: Math.round(bar.getBoundingClientRect().width),
            tabItems: bar.querySelectorAll('.tab-item').length,
            overflowing: over
          };
        })()`;

        const orientations = [[400, 800, 'portrait'], [800, 400, 'landscape'], [400, 800, 'portrait again']];
        for (const [w, h, label] of orientations) {
          win.setBounds({ x: -2400, y: 40, width: w, height: h });
          await new Promise(r => setTimeout(r, 900));
          await win.webContents.executeJavaScript('location.hash = "#/toolbox/money"; true');
          await new Promise(r => setTimeout(r, 700));
          const rot = await win.webContents.executeJavaScript(ROTATE_CHECK);
          console.log('ROTATE ' + label + ' ' + JSON.stringify(rot));
          if (rot.docScrollW > rot.vw + 1) {
            result.errors.push('after ' + label + ': the page scrolls sideways (' + rot.docScrollW + ' vs ' + rot.vw + ')');
          }
          if (rot.tabbarW > rot.vw + 1) {
            result.errors.push('after ' + label + ': the tab bar is wider than the screen (' + rot.tabbarW + ' vs ' + rot.vw + ')');
          }
          if (rot.overflowing) {
            result.errors.push('after ' + label + ': ' + rot.overflowing + ' element(s) past the right edge');
          }
          if (rot.tabItems !== 8) {
            result.errors.push('after ' + label + ': ' + rot.tabItems + ' tabs, expected 8');
          }
        }

        win.setBounds({ x: -2400, y: 40, width: 1280, height: 900 });
        await new Promise(r => setTimeout(r, 300));

        /* ---------- 12. the starter list is reference, not research --------
              Its entries must not be counted as games you have tracked, and
              must not skew the averages, until you actually add them. */
        const starterCheck = await win.webContents.executeJavaScript(`(function(){
          return new Promise(function (finish) {
            var errs = [];
            var g = App.newGame({ title: 'Starter Check', label: 'A' });
            g.msrp = 9.99;
            App.Store.data.games = [g];
            App.Store.data.comps = [];
            g.market.comps = [];
            App.Store.saveNow();
            location.hash = '#/market/' + g.id;

            function summaryNumbers() {
              var host = document.createElement('div');
              document.body.appendChild(host);
              App.views.market.render(host, [g.id, 'summary']);
              var stats = {};
              Array.prototype.forEach.call(host.querySelectorAll('.stat'), function (s) {
                var k = s.querySelector('.k'); var v = s.querySelector('.v');
                if (k && v) stats[k.textContent.trim()] = v.textContent.trim();
              });
              var text = host.textContent;
              host.remove();
              return { stats: stats, text: text };
            }

            setTimeout(function () {
              var empty = summaryNumbers();
              var tracked = empty.stats['Similar games tracked'];
              if (tracked !== '0') {
                errs.push('with nothing added, "Similar games tracked" says ' + JSON.stringify(tracked) + ' — the starter list is being counted');
              }
              if (empty.stats['Middle price'] !== '—') {
                errs.push('with nothing added, "Middle price" shows ' + JSON.stringify(empty.stats['Middle price']) + ' instead of a dash');
              }
              if (empty.stats['Middle review count'] !== '—') {
                errs.push('with nothing added, "Middle review count" shows ' + JSON.stringify(empty.stats['Middle review count']) + ' instead of a dash');
              }
              if (empty.text.indexOf('You have not added any similar games') === -1) {
                errs.push('with nothing added, the page does not say so');
              }

              /* now add one real comparable and check it is counted */
              g.market.comps.push({ title: 'My Comp', year: 2025, price: 12.99, reviews: 800, rating: 90, note: '' });
              App.Store.saveNow();
              var one = summaryNumbers();
              if (one.stats['Similar games tracked'] !== '1') {
                errs.push('after adding one game, "Similar games tracked" says ' + JSON.stringify(one.stats['Similar games tracked']));
              }
              if (one.stats['Middle price'] !== '$12.99') {
                errs.push('after adding one game, "Middle price" says ' + JSON.stringify(one.stats['Middle price']));
              }

              /* adding the whole starter list is a deliberate act, and then it counts */
              var before = one.stats['Similar games tracked'];
              finish({ errors: errs, emptyTracked: tracked, emptyMiddle: empty.stats['Middle price'], afterOne: before });
            }, 800);
          });
        })()`);
        result.errors = result.errors.concat(starterCheck.errors || []);
        console.log('STARTER ' + JSON.stringify(starterCheck));

        await win.webContents.executeJavaScript(`(function(){ App.Store.data.games = []; App.Store.data.comps = []; App.Store.saveNow(); return true; })()`);

        console.log('SMOKE_RESULT ' + JSON.stringify(result));
        console.log('CONSOLE_ERRORS ' + JSON.stringify(logs));
        app.exit(result.errors.length || logs.length ? 1 : 0);
      } catch (e) {
        console.log('SMOKE_FAIL ' + (e && e.message));
        app.exit(2);
      }
    }, 2000);
  });
});
