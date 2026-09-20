/* ==========================================================================
   VIEW — VAULT (backups, notes, templates, glossary, sources, settings)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  var TABS = ['data', 'notes', 'templates', 'glossary', 'sources', 'settings'];
  var tab = 'data';

  App.views.vault = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Vault'),
          App.el('h1', { class: 'h1' }, 'Your stuff, safely'))));

      if (params && params[0] && TABS.indexOf(params[0]) >= 0) tab = params[0];

      root.append(App.el('div', { class: 'tabs' }, TABS.map(function (t) {
        return App.el('button', { class: tab === t ? 'on' : '', onclick: function () { tab = t; App.renderRoute(); } },
          { data: 'Backups', notes: 'Notes', templates: 'Templates', glossary: 'Glossary', sources: 'Sources', settings: 'Settings' }[t]);
      })));

      var body = App.el('div', {});
      ({ data: tabData, notes: tabNotes, templates: tabTemplates, glossary: tabGlossary, sources: tabSources, settings: tabSettings }[tab])(body);
      root.append(body);
    }
  };

  /* ================================= DATA ================================ */
  function tabData(root) {
    var d = App.Store.data;
    var tasks = App.sum(d.games, function (g) { return (g.tasks || []).length; });
    var logged = Object.keys(d.log).length;

    root.append(App.el('div', { class: 'grid g2' },
      App.el('div', { class: 'card pad' },
        App.el('div', { class: 'kicker' }, 'Backups'),
        App.el('h3', { class: 'card-t' }, 'Save everything to a file'),
        App.el('p', { class: 'card-s' }, 'One file with every project, design document, task, moodboard, note and marketing plan.'),
        App.el('div', { class: 'grid g3', style: { marginTop: '.8rem', gap: '.5rem' } },
          miniStat('Projects', String(d.games.length)),
          miniStat('Tasks', String(tasks)),
          miniStat('Days logged', String(logged)),
          miniStat('Wishlist records', String(App.sum(d.games, function (g) { return (g.market.wishlists || []).length; }))),
          miniStat('Notes', String((d.notes || []).length)),
          miniStat('Settings size', App.Store.sizeKB() + ' KB')),
        App.el('div', { class: 'btn-row', style: { marginTop: '1rem' } },
          App.el('button', { class: 'btn primary', onclick: function () {
            App.presentExport('Save a backup', 'solodev-backup-' + App.today() + '.json', App.Store.exportJSON(), 'application/json',
              'Save this file somewhere safe — a cloud folder, a USB stick, or email it to yourself. Restoring from it puts everything back exactly as it was.');
          } }, 'Save a backup'),
          App.el('button', { class: 'btn', onclick: function () { App.importViaDialog(function () { App.renderRoute(); }); } }, 'Restore from a backup')),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.6rem' } },
          'Moodboard images are stored separately, at full size, and are not included in this file. Use “Save images to files” on the moodboard to copy them out.'),

        App.el('div', { class: 'divider' }),
        App.el('div', { class: 'kicker' }, 'Images'),
        App.el('div', { class: 'row between', style: { gap: '.6rem' } },
          App.el('div', {},
            App.el('h3', { class: 'card-t' }, 'Stored image files'),
            App.el('div', { class: 'tiny muted' }, 'Kept at full resolution, exactly as you picked them.')),
          App.el('span', { class: 'badge gray', id: 'img-total' }, '…')),
        App.el('div', { class: 'btn-row', style: { marginTop: '.6rem' } },
          App.el('button', { class: 'btn sm ghost', onclick: function () {
            App.confirm({
              title: 'Delete every stored image?',
              body: 'Every moodboard picture held in the app will be removed, and the tiles that showed them will go too. Colours, gradients and notes stay.',
              confirmText: 'Delete them all', danger: true
            }).then(function (ok) {
              if (!ok) return;
              d.games.forEach(function (g) {
                if (!g.mood || !g.mood.tiles) return;
                g.mood.tiles = g.mood.tiles.filter(function (t) {
                  if (t.imgId) { App.Images.remove(t.imgId); return false; }
                  return true;
                });
              });
              App.Images.clear();
              App.Store.save();
              App.toast('Stored images deleted.');
              App.renderRoute();
            });
          } }, 'Delete stored images'))),
      App.el('div', { class: 'card pad' },
        App.el('div', { class: 'kicker' }, 'Example project'),
        App.el('h3', { class: 'card-t' }, 'See a filled-in project'),
        App.el('p', { class: 'card-s' }, 'This adds a worked example — a small arena game with a filled design document, tasks, market research and a marketing plan — so you can see what "done" looks like before you start your own.'),
        App.el('div', { class: 'btn-row', style: { marginTop: '.8rem' } },
          App.el('button', { class: 'btn', onclick: function () {
            seedExample();
            App.toast('Example project added.');
            App.navigate('#/plan');
          } }, 'Add the example project')),
        App.el('div', { class: 'divider' }),
        App.el('div', { class: 'kicker' }, 'Careful'),
        App.el('h3', { class: 'card-t' }, 'Start over'),
        App.el('p', { class: 'card-s' }, 'Deletes everything on this device. Save a backup first.'),
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn danger', onclick: function () {
            App.confirm({
              title: 'Delete everything?',
              body: 'Every project, design document, moodboard, task, note and marketing plan on this device. There is no undo.',
              confirmText: 'Delete it all', danger: true
            }).then(function (ok) {
              if (!ok) return;
              App.Store.reset();
              App.setTheme('dark');
              App.toast('Everything cleared.');
              App.navigate('#/home');
            });
          } }, 'Delete everything')))));

    root.append(App.el('div', { class: 'callout info', style: { marginTop: '1rem' } },
      App.el('div', { class: 'ct' }, 'Save a backup after every milestone'),
      App.el('p', {}, 'This app stores everything on this device only. There is no account and no cloud. That is good for privacy and bad for accidents — clearing your browser data or uninstalling the app takes everything with it. One backup file a month is enough.')));
  }

  function miniStat(k, v) {
    return App.el('div', { class: 'stat', style: { padding: '.55rem .7rem' } },
      App.el('div', { class: 'k' }, k),
      App.el('div', { class: 'v', style: { fontSize: '1.05rem' } }, v));
  }

  /* ================================ NOTES ================================ */
  function tabNotes(root) {
    var d = App.Store.data;
    d.notes = d.notes || [];
    var host = App.el('div', { class: 'grid g2' });

    var title = App.el('input', { type: 'text', placeholder: 'Title' });
    var body = App.el('textarea', { placeholder: 'Anything. Links, ideas, things to remember.', style: { minHeight: '100px' } });

    root.append(App.el('div', { class: 'card pad', style: { marginBottom: '1rem' } },
      App.el('h3', { class: 'card-t' }, 'Quick notes'),
      App.el('p', { class: 'card-s' }, 'A scratchpad that lives outside any project.'),
      App.el('div', { class: 'field-row' }, App.field('Title', title), App.field('Note', body)),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn primary', onclick: function () {
          if (!title.value.trim() && !body.value.trim()) { App.toast('Write something first.', 'warn'); return; }
          d.notes.unshift({ id: App.uid('n'), title: title.value.trim() || 'Note', body: body.value, updated: App.today() });
          App.Store.save();
          App.renderRoute();
        } }, 'Save note'),
        App.el('button', { class: 'btn ghost', onclick: function () {
          title.value = ''; body.value = '';
        } }, 'Clear'))));

    if (!d.notes.length) {
      root.append(App.empty({ title: 'No notes yet', body: 'Use this for things that do not belong to any one project.' }));
      return;
    }

    d.notes.forEach(function (n) {
      var ta = App.el('textarea', { style: { minHeight: '90px' } }, n.body);
      ta.addEventListener('input', App.debounce(function () { n.body = ta.value; n.updated = App.today(); App.Store.save(); }, 400));
      host.append(App.el('div', { class: 'card' },
        App.el('div', { class: 'row between' },
          App.el('h3', { class: 'card-t' }, n.title),
          App.el('div', { class: 'row', style: { gap: '.2rem' } },
            App.el('span', { class: 'tiny muted' }, n.updated),
            App.el('button', { class: 'link-btn', onclick: function () {
              App.presentExport(n.title, App.slug(n.title) + '.md', '# ' + n.title + '\n\n' + n.body, 'text/markdown');
            } }, 'Export'),
            App.el('button', { class: 'link-btn', onclick: function () {
              d.notes = d.notes.filter(function (x) { return x.id !== n.id; });
              App.Store.save(); App.renderRoute();
            } }, 'Delete'))),
        ta));
    });
    root.append(host);
  }

  /* ============================== TEMPLATES ============================== */
  function tabTemplates(root) {
    root.append(App.el('div', { class: 'callout info' },
      App.el('div', { class: 'ct' }, 'Documents you can copy'),
      App.el('p', {}, 'These are starting points, not rules. Open one, copy it out, and fill it in.')));
    root.append(App.el('div', { class: 'grid g2' }, App.data.templates.map(function (t) {
      var body = App.el('textarea', { readonly: true, style: { minHeight: '170px', fontFamily: 'var(--f-mono)', fontSize: '.74rem' } });
      body.value = t.body;
      return App.el('div', { class: 'card pad' },
        App.el('h3', { class: 'card-t' }, t.title),
        App.el('p', { class: 'card-s' }, t.use),
        body,
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm primary', onclick: function () {
            App.copyText(t.body);
            App.toast('Copied to the clipboard.');
          } }, 'Copy'),
          App.el('button', { class: 'btn sm', onclick: function () {
            App.downloadText(App.slug(t.title) + '.txt', t.body, 'text/plain');
            App.toast('Saved.');
          } }, 'Save as file')));
    })));
  }

  /* =============================== GLOSSARY ============================== */
  function tabGlossary(root) {
    var q = App.el('input', { type: 'text', placeholder: 'Search the words…', style: { maxWidth: '340px' } });
    var list = App.el('div', { class: 'stack', style: { gap: '.4rem', marginTop: '1rem' } });

    function draw() {
      App.clear(list);
      var term = q.value.trim().toLowerCase();
      var items = App.data.glossary.filter(function (g) {
        return !term || g.term.toLowerCase().indexOf(term) >= 0 || g.means.toLowerCase().indexOf(term) >= 0;
      });
      if (!items.length) { list.append(App.el('p', { class: 'tiny muted' }, 'Nothing matches that.')); return; }
      items.forEach(function (g) {
        list.append(App.el('div', { class: 'card', style: { padding: '.6rem .85rem' } },
          App.el('div', { class: 'card-t', style: { fontSize: '.92rem' } }, g.term),
          App.el('p', { class: 'card-s', style: { margin: 0 } }, g.means)));
      });
    }
    q.addEventListener('input', draw);
    draw();

    root.append(App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Plain English'),
          App.el('p', { class: 'card-s' }, 'Every word this app uses, explained without jargon.')),
        q)));
    root.append(list);
  }

  /* =============================== SOURCES =============================== */
  function tabSources(root) {
    root.append(App.el('div', { class: 'callout info' },
      App.el('div', { class: 'ct' }, 'Where the numbers come from'),
      App.el('p', {}, 'Every factual claim used in the guides and calculators, with its source. Anything that is a model rather than a fact is labelled as one. Nothing here is invented.')));
    root.append(App.el('div', { class: 'stack', style: { gap: '.4rem' } }, App.data.sources.map(function (s) {
      return App.el('div', { class: 'card', style: { padding: '.7rem .9rem' } },
        App.el('div', { class: 'row between', style: { gap: '.7rem', alignItems: 'flex-start' } },
          App.el('div', { style: { flex: '1', minWidth: 0 } },
            App.el('div', { class: 'small' }, s.claim),
            App.el('div', { class: 'tiny muted', style: { marginTop: '.2rem' } }, 'Source: ' + s.src)),
          App.el('div', { style: { textAlign: 'right', flex: '0 0 auto' } },
            App.el('span', { class: 'badge ' + (s.status.indexOf('Verified') === 0 ? 'good' : s.status === 'Corroborated' ? 'warn' : 'gray') }, s.status),
            App.el('div', { class: 'mono tiny muted', style: { marginTop: '.25rem' } }, s.value))));
    })));

    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'The starter comparison list')));
    root.append(App.el('p', { class: 'tiny muted' }, 'Review counts are approximate and change daily. Check them live before you decide anything important.'));
    var wrap = App.el('div', { class: 'tbl-wrap' });
    wrap.append(App.el('table', { class: 'tbl' },
      App.el('thead', {}, App.el('tr', {},
        App.el('th', {}, 'Game'), App.el('th', {}, 'Year'), App.el('th', {}, 'Style'),
        App.el('th', {}, 'Price'), App.el('th', {}, 'Reviews'), App.el('th', {}, 'Rating'), App.el('th', {}, 'Made by'), App.el('th', {}, 'Why it matters'))),
      App.el('tbody', {}, App.data.comps.map(function (c) {
        return App.el('tr', {},
          App.el('td', { class: 'strong' }, c.title),
          App.el('td', {}, c.year),
          App.el('td', { style: { fontSize: '.78rem' } }, c.tags),
          App.el('td', { class: 'num' }, App.price(c.price)),
          App.el('td', { class: 'num' }, App.num(c.reviews)),
          App.el('td', { class: 'num' }, c.rating + '%'),
          App.el('td', { style: { fontSize: '.78rem' } }, c.team),
          App.el('td', { style: { fontSize: '.78rem', maxWidth: '250px' } }, c.note));
      }))));
    root.append(wrap);
  }

  /* =============================== SETTINGS ============================== */
  function tabSettings(root) {
    var s = App.Store.data.settings;

    function field(label, input, hint) { return App.field(label, input, hint); }
    function bindNum(obj, key, step, hint) {
      var i = App.el('input', { type: 'number', value: obj[key], step: step || 'any' });
      i.addEventListener('change', function () { obj[key] = Number(i.value) || 0; App.Store.save(); App.toast('Saved.'); });
      return field(key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }), i, hint);
    }

    root.append(App.el('div', { class: 'grid g2' },
      App.el('div', { class: 'card pad' },
        App.el('div', { class: 'kicker' }, 'You'),
        App.el('h3', { class: 'card-t' }, 'Name and hours'),
        (function () {
          var i = App.el('input', { type: 'text', value: s.studioName || '', placeholder: 'Your name or studio name' });
          i.addEventListener('input', App.debounce(function () { s.studioName = i.value; App.Store.save(); }, 400));
          return field('What should the app call you?', i, 'Used in the greeting on the Home page.');
        })(),
        (function () {
          var i = App.el('input', { type: 'number', value: s.weeklyHoursTarget, step: '1' });
          i.addEventListener('change', function () { s.weeklyHoursTarget = Number(i.value) || 30; App.Store.save(); App.toast('Saved.'); });
          return field('Hours a week you aim for', i, 'The realistic number, not the heroic one.');
        })(),
        (function () {
          var i = App.el('input', { type: 'number', value: s.workCeiling, step: '1' });
          i.addEventListener('change', function () { s.workCeiling = Number(i.value) || 40; App.Store.save(); App.toast('Saved.'); });
          return field('Hard ceiling', i, 'Go over this and the app warns you. Long weeks cost more than they give.');
        })(),
        App.el('div', { class: 'divider' }),
        App.el('h3', { class: 'card-t' }, 'Theme'),
        App.el('div', { class: 'btn-row' }, App.THEMES.map(function (t) {
          return App.el('button', {
            class: 'chip click' + (App.Store.data.theme === t.id ? ' on' : ''),
            onclick: function () { App.setTheme(t.id); App.renderRoute(); }
          }, t.label);
        }))),

      App.el('div', { class: 'card pad' },
        App.el('div', { class: 'kicker' }, 'Money assumptions'),
        App.el('h3', { class: 'card-t' }, 'Used by every calculator'),
        App.el('p', { class: 'card-s' }, 'Change these if your situation differs. The defaults are conservative.'),
        bindNum(s, 'regionalBlend', '0.01', 'People in poorer countries pay less. Usually 0.68–0.72.'),
        bindNum(s, 'refundRate', '0.01', 'How many buyers ask for their money back. Usually 0.08–0.12.'),
        bindNum(s, 'taxRate', '0.01', 'VAT and sales tax. Usually 0.08–0.12.'),
        bindNum(s, 'steamCut', '0.01', 'The platform\'s share. 0.30 is standard.'),
        App.el('div', { class: 'divider' }),
        App.el('h3', { class: 'card-t' }, 'The splash screen'),
        App.el('label', { class: 'switch' },
          (function () {
            var i = App.el('input', { type: 'checkbox' });
            i.checked = !!s.skipSplash;
            i.addEventListener('change', function () { s.skipSplash = i.checked; App.Store.save(); App.toast(i.checked ? 'Splash will be skipped.' : 'Splash will show.'); });
            return i;
          })(),
          App.el('span', { class: 'track' }),
          App.el('span', {}, 'Skip it on launch'))),

      App.el('div', { class: 'card pad' },
        App.el('div', { class: 'kicker' }, 'About'),
        App.el('h3', { class: 'card-t' }, 'What this is'),
        App.el('p', { class: 'card-body' }, App.frag(App.md('**SoloDev Studio** is a planning, design, market research and marketing companion for one person making games. It started as a strategy document and grew into a tool. Everything runs offline, nothing is uploaded, and there is no account.'))),
        App.el('p', { class: 'card-body' }, App.frag(App.md('The guides are condensed from the original studio documents and cross-checked against public reporting from September 2026. Every factual claim is listed in the Sources tab with where it came from. The calculators are planning models, not promises.'))),
        App.el('div', { class: 'grid g3', style: { marginTop: '.8rem' } },
          miniStat('Version', '2.3.1'),
          miniStat('Projects', String(App.Store.data.games.length)),
          miniStat('Running since', App.Store.data.meta.created || App.today())),
        App.el('div', { class: 'btn-row', style: { marginTop: '.8rem' } },
          App.el('button', { class: 'btn sm', onclick: function () { window.print(); } }, 'Print everything'),
          App.el('button', { class: 'btn sm ghost', onclick: function () { App.runSplash(function () {}); } }, 'Show the intro again'))),

      performanceCard()));
  }

  /* ============================= PERFORMANCE ============================= */
  function performanceCard() {
    var card = App.el('div', { class: 'card pad' },
      App.el('div', { class: 'kicker' }, 'Performance'),
      App.el('h3', { class: 'card-t' }, 'Smoothness'),
      App.el('p', { class: 'card-s' }, 'This app uses soft shadows, translucency and moving backgrounds. On a machine with graphics acceleration they cost nothing. Without it, they are drawn by the processor and everything feels sticky.'));

    var modeRow = App.el('div', { class: 'row between', style: { marginTop: '.8rem', gap: '.6rem' } });
    card.append(modeRow);

    var effectsRow = App.el('div', { style: { marginTop: '.9rem' } });
    card.append(effectsRow);

    var note = App.el('p', { class: 'tiny muted', style: { marginTop: '.7rem' } });
    card.append(note);

    /* ---- rendering mode ---- */
    var desktop = window.solodevDesktop;
    if (desktop && desktop.status) {
      desktop.status().then(function (st) {
        App.clear(modeRow);
        modeRow.append(
          App.el('div', { style: { minWidth: 0 } },
            App.el('div', { class: 'small', style: { fontWeight: '700' } }, 'Graphics acceleration'),
            App.el('div', { class: 'tiny muted' },
              st.software ? 'Off — being drawn by the processor, which is why it can feel slow' : 'On — everything is drawn by the graphics chip')),
          App.el('button', { class: 'btn sm', onclick: function () {
            App.confirm({
              title: st.software ? 'Turn graphics acceleration back on?' : 'Switch to software rendering?',
              body: st.software
                ? 'The app will restart. If your graphics driver is fine, this makes everything noticeably smoother.'
                : 'The app will restart and draw everything with the processor. Only do this if the app has been crashing or showing graphical glitches.',
              confirmText: 'Restart now'
            }).then(function (ok) {
              if (!ok) return;
              App.toast('Restarting…');
              desktop.setSoftwareRendering(!st.software);
            });
          } }, st.software ? 'Try hardware again' : 'Switch to software'));
        note.textContent = 'Electron ' + st.electron + ' · Chromium ' + st.chrome +
          (st.crashes ? ' · ' + st.crashes + ' graphics hiccup' + (st.crashes === 1 ? '' : 's') + ' this session' : '');
      }).catch(function () {
        App.clear(modeRow);
        modeRow.append(App.el('div', { class: 'small muted' }, 'Could not read the graphics status.'));
      });
    } else {
      modeRow.append(
        App.el('div', { style: { minWidth: 0 } },
          App.el('div', { class: 'small', style: { fontWeight: '700' } }, 'Graphics acceleration'),
          App.el('div', { class: 'tiny muted' }, 'Handled by your browser. If it feels slow, check that hardware acceleration is enabled in the browser settings.')),
        App.el('span', { class: 'badge gray' }, 'Browser'));
    }

    /* ---- optional effects reduction ---- */
    var s = App.Store.data.settings;
    effectsRow.append(
      App.el('label', { class: 'switch' },
        (function () {
          var i = App.el('input', { type: 'checkbox' });
          i.checked = !!s.liteEffects;
          i.addEventListener('change', function () {
            s.liteEffects = i.checked;
            App.Store.save();
            App.applyEffects();
            App.toast(i.checked ? 'Effects reduced.' : 'Full effects restored.');
          });
          return i;
        })(),
        App.el('span', { class: 'track' }),
        App.el('span', {}, 'Reduce visual effects')),
      App.el('p', { class: 'tiny muted', style: { marginTop: '.4rem' } },
        'Off by default. Turning it on removes the blurred translucent bars and the drifting background. Only worth it on an old machine where the app still feels slow with graphics acceleration on.'));

    return card;
  }

  /* ============================ EXAMPLE PROJECT ========================== */
  function seedExample() {
    var d = App.Store.data;
    if (d.games.some(function (g) { return g.title === 'Aether Strike'; })) {
      App.toast('The example is already here.', 'warn');
      return;
    }
    var g = App.newGame({ title: 'Aether Strike', codename: 'Project Comet', label: 'A', msrp: 6.99, targetWeeks: 14, targetRelease: nextMonth(5) });
    /* A new project now starts blank; the worked example fills in the starter
       design content on purpose. */
    var tpl = App.data.gddTemplates.A;
    g.gdd.pillars = tpl.pillars.map(function (p) { return { t: p.t, d: p.d }; });
    g.gdd.loops = Object.assign({}, tpl.loops);
    g.gdd.art.palette = ['#0f766e', '#f5f5f4', '#171c22', '#f59e0b', '#8b7cf6'];
    g.gdd.tech = Object.assign({}, tpl.tech);
    g.stage = 4;
    g.status = App.stageStatus(4);
    g.active = !d.games.some(function (x) { return x.active; });
    g.notes = 'The core idea: deflecting is both your defence and your damage. Everything else is built around that one verb.';
    g.gdd.concept = {
      pitch: 'A survivors-like where deflecting lasers charges your sword and teleports you through the swarm.',
      genre: '3D arena roguelite, run-based',
      audience: 'People who play survivors-likes, watch streamers, and like anime action',
      hook: 'Deflect a laser → it charges the blade → teleport-strike through the whole group.',
      usp: 'Deflection is the only verb. Staying alive and dealing damage come from the same button press, so every fight is a rhythm rather than a stat check.'
    };
    g.gdd.ledger = [
      { name: 'Base damage', formula: 'damage = weapon × (1 + 0.12 × mightStacks)', notes: 'Cap the stacks at 20' },
      { name: 'Deflect window', formula: '8 frames (133 ms)', notes: 'Enemies telegraph 400–800 ms before attacking' },
      { name: 'Reroll cost', formula: 'cost = 15 × 1.5 ^ rerolls', notes: 'Resets every run' },
      { name: 'Unlock cost', formula: 'cost = 120 × 1.32 ^ (level − 1)', notes: 'Four characters in total' }
    ];
    g.gdd.feel = {
      camera: 'Follows at 6 m, height 2.4 m, looks 3 m ahead when running. Shakes on every deflect, scaled by the size of what was deflected.',
      feedback: 'Four frames of hit pause on a heavy hit, white flash on damage, sparks on every deflect, controller rumble: low motor for weight, high motor for the snap.',
      controls: '140 ms input buffer, 110 ms coyote time, 133 ms deflect window that starts on press rather than release.',
      audio: 'Combat sound ducks the music by 4 dB for 80 ms. Music layers in when the group of enemies gets bigger.'
    };
    g.gdd.characters = [
      { name: 'Yuki-9', role: 'Main character', shape: 'triangle', arc: 'Learns that reflecting something is not the same as avoiding it.' },
      { name: 'Ferro', role: 'Heavy companion', shape: 'square', arc: 'Gives up his armour one piece at a time.' }
    ];
    g.gdd.balance = {
      economy: 'Shards drop from kills and are spent on upgrades during a run. Meta currency is banked at the end. A player should have about 3 upgrade choices by minute 3 and 12 by minute 15.',
      difficulty: 'Enemy count rises every two minutes. New enemy types at minutes 4, 8 and 12. The run should feel comfortable for four minutes, tight at nine, and desperate at fourteen.',
      tuning: 'No enemy can kill a full-health player in under two seconds. Every upgrade must be pickable at least once per run.'
    };
    g.gdd.plan.milestones = [
      { id: App.uid('m'), title: 'Prototype is fun', date: App.addDays(App.today(), 14), note: 'Grey boxes, 10-minute test', done: true },
      { id: App.uid('m'), title: 'First area finished', date: App.addDays(App.today(), 35), note: 'Hits 60 FPS on the Deck', done: false },
      { id: App.uid('m'), title: 'All content in', date: App.addDays(App.today(), 70), note: 'The factory runs without new code', done: false },
      { id: App.uid('m'), title: 'Cut 30% and freeze', date: App.addDays(App.today(), 84), note: 'Nothing new after this', done: false },
      { id: App.uid('m'), title: 'Launch', date: App.addDays(App.today(), 98), note: '', done: false }
    ];
    g.tasks = [
      { id: App.uid('t'), title: 'Get the deflect window feeling right', note: '', status: 'doing', priority: 'high', due: App.addDays(App.today(), 2), created: App.today(), stage: 3 },
      { id: App.uid('t'), title: 'Model the first three enemies', note: '', status: 'todo', priority: 'high', due: App.addDays(App.today(), 6), created: App.today(), stage: 4 },
      { id: App.uid('t'), title: 'Write the arena lighting setup', note: '', status: 'todo', priority: 'medium', due: '', created: App.today(), stage: 4 },
      { id: App.uid('t'), title: 'Set up the Steam page', note: 'Six to nine months before launch', status: 'todo', priority: 'medium', due: App.addDays(App.today(), 21), created: App.today(), stage: 5 },
      { id: App.uid('t'), title: 'Prototype movement and camera', note: '', status: 'done', priority: 'high', due: '', created: App.today(), stage: 3, doneAt: App.today() }
    ];
    g.mood.tiles = [
      { id: App.uid('t'), type: 'color', a: '#0c3b27', caption: 'Deep green base' },
      { id: App.uid('t'), type: 'gradient', a: '#a78bfa', b: '#22d3ee', caption: 'Teleport dash effect' },
      { id: App.uid('t'), type: 'note', title: 'Yuki-9 reads as a triangle in pure black', caption: 'Silhouette test' },
      { id: App.uid('t'), type: 'color', a: '#ffd9e8', caption: 'Soft accent for the UI' }
    ];
    g.market.audience = 'People who play survivors-likes for 30 hours and watch streamers doing challenge runs.';
    g.market.tags = [
      { tag: 'Action Roguelike', heat: 'high', mine: true },
      { tag: 'Roguelite', heat: 'huge', mine: true },
      { tag: 'Bullet Heaven', heat: 'high', mine: true },
      { tag: 'Fast-Paced', heat: 'medium', mine: true },
      { tag: 'Anime', heat: 'high', mine: true }
    ];
    g.market.notes = 'Looking at the bad reviews of the big survivors-likes: almost all of them complain about runs getting boring after 20 hours because the upgrades stop mattering. Our deflect mechanic has a skill ceiling that pure stat upgrades do not, so that is where we can win.';
    g.market.hooks = [
      { text: 'Every laser you deflect makes your sword stronger.', rating: 'good' },
      { text: 'A survivors-like where the parry is the whole game.', rating: 'good' }
    ];
    g.market.wishlists = App.lastNDays(42).filter(function (_, i) { return i % 7 === 0; }).map(function (day, i) {
      return { date: day, count: Math.round(180 + i * i * 34 + i * 90) };
    });
    g.marketing.campaigns = App.data.campaignTemplate.map(function (c, i) {
      return {
        id: App.uid('c'), phase: c.phase, when: c.when, goal: c.goal,
        done: i === 0, open: i <= 1,
        tasks: c.tasks.map(function (t, ti) { return { text: t, done: i === 0 && ti < 3 }; })
      };
    });
    g.marketing.content = [
      { id: App.uid('p'), date: App.addDays(App.today(), -6), type: 'Clip', title: 'Deflect chain into a teleport strike', channel: 'Shorts', done: true },
      { id: App.uid('p'), date: App.addDays(App.today(), 2), type: 'Devlog', title: 'Why the parry window is 8 frames', channel: 'YouTube', done: false },
      { id: App.uid('p'), date: App.addDays(App.today(), 9), type: 'Clip', title: 'Funniest physics bugs so far', channel: 'Shorts', done: false }
    ];
    g.marketing.copy.short = 'Deflect everything. Every laser you parry charges your blade and flings you through the swarm. Eight-minute runs, 80 upgrades, no loading screens.';
    g.marketing.copy.features = '• Deflect anything — parrying is both your defence and your damage\n• Draft 80 upgrades — combinations matter more than stats\n• Eight-minute runs with instant restarts\n• Four characters, each with their own deflect timing';

    d.games.push(g);
    App.Store.save();
  }

  function nextMonth(n) {
    var d = new Date();
    d.setMonth(d.getMonth() + n);
    return d.toISOString().slice(0, 7);
  }
})();
