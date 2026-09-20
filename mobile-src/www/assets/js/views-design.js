/* ==========================================================================
   VIEW — DESIGN (the design document, written for you)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  var current = 'pitch';

  var SECTIONS = [
    { id: 'pitch', label: 'The pitch', hint: 'The one-sentence version' },
    { id: 'rules', label: 'Three rules', hint: 'What the game must never break' },
    { id: 'loops', label: 'Core loops', hint: 'What the player does, over and over' },
    { id: 'numbers', label: 'Numbers', hint: 'Damage, costs, cooldowns' },
    { id: 'feel', label: 'Game feel', hint: 'Why it feels good to press buttons' },
    { id: 'world', label: 'World & characters', hint: 'Rules of the place, and who lives there' },
    { id: 'art', label: 'Art direction', hint: 'Colours, style, palette' },
    { id: 'mood', label: 'Moodboard', hint: 'Reference images you can zoom into' },
    { id: 'tech', label: 'Technical limits', hint: 'How much the hardware can take' },
    { id: 'balance', label: 'Balance', hint: 'How hard it is, and how it stays fair' },
    { id: 'plan', label: 'Build plan', hint: 'Weeks, buffers and risks' },
    { id: 'playtest', label: 'Playtests', hint: 'What real people did' },
    { id: 'cuts', label: 'Cut list', hint: 'The features you walked away from' }
  ];

  App.views.design = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Design'),
          App.el('h1', { class: 'h1' }, 'Write the game down')),
        App.el('div', { class: 'ph-actions' }, App.el('button', { class: 'btn', onclick: function () { window.print(); } }, 'Print / PDF'))
      ));

      var g = App.gamePicker(root, params, '#/design/');
      if (!g) return;

      var done = SECTIONS.filter(function (s) { return isDone(g, s.id); }).length;
      var pct = done / SECTIONS.length;

      root.append(App.el('div', { class: 'card pad', style: { marginBottom: '1rem' } },
        App.el('div', { class: 'row between' },
          App.el('div', {},
            App.el('div', { class: 'kicker' }, g.title),
            App.el('div', { class: 'small', style: { fontWeight: '700' } }, done + ' of ' + SECTIONS.length + ' parts filled in')),
          App.el('div', { class: 'btn-row' },
            App.el('button', { class: 'btn sm', onclick: function () { exportGDD(g); } }, 'Export as document'),
            App.el('button', { class: 'btn sm ghost', onclick: function () { resetSection(g); } }, 'Reset this part'))),
        App.el('div', { class: 'meter', style: { marginTop: '.6rem' } },
          App.el('i', { style: { width: (pct * 100) + '%' } }))
      ));

      var split = App.el('div', { class: 'split' });
      var menu = App.el('div', { class: 'side-menu' });
      SECTIONS.forEach(function (s) {
        menu.append(App.el('button', { class: current === s.id ? 'on' : '', onclick: function () { current = s.id; App.renderRoute(); } },
          App.el('span', {}, s.label),
          App.el('span', { class: 'dot' + (isDone(g, s.id) ? ' full' : ''), title: isDone(g, s.id) ? 'Filled in' : 'Not started' })));
      });
      menu.append(App.el('div', { style: { marginTop: '.8rem', padding: '0 .3rem' } },
        App.el('p', { class: 'tiny muted' }, 'Green dot means that part has something in it. Half-finished is fine — the point is to have it written down somewhere other than your head.')));

      var panel = App.el('div', {});
      renderSection(panel, g);
      split.append(menu, panel);
      root.append(split);
    }
  };

  function isDone(g, id) {
    var gd = g.gdd || {};
    switch (id) {
      case 'pitch': return !!(gd.concept.pitch && gd.concept.hook);
      case 'rules': return (gd.pillars || []).filter(function (p) { return p.t && p.d; }).length >= 3;
      case 'loops': return !!(gd.loops.micro && gd.loops.meso && gd.loops.macro);
      case 'numbers': return (gd.ledger || []).length >= 3;
      case 'feel': return !!(gd.feel.camera && gd.feel.feedback);
      case 'world': return !!(gd.world.rules || '').trim() || (gd.characters || []).length > 0;
      case 'art': return (gd.art.palette || []).length >= 3;
      case 'mood': return (g.mood && g.mood.tiles || []).length >= 3;
      case 'tech': return !!(gd.tech && gd.tech.drawCalls);
      case 'balance': return !!(gd.balance.economy || gd.balance.difficulty);
      case 'plan': return (gd.plan.milestones || []).length >= 2;
      case 'playtest': return (gd.playtest || []).length >= 1;
      case 'cuts': return (gd.cuts || []).length >= 1;
      default: return false;
    }
  }

  function bind(input, obj, key, opts) {
    opts = opts || {};
    input.value = obj[key] == null ? '' : obj[key];
    input.addEventListener('input', App.debounce(function () {
      obj[key] = opts.number ? Number(input.value) || 0 : input.value;
      App.Store.save();
    }, 350));
    return input;
  }

  function head(panel, n, title, sub, tip) {
    panel.append(
      App.el('div', { class: 'kicker' }, 'Part ' + String(n).padStart(2, '0') + ' of ' + SECTIONS.length),
      App.el('h2', { class: 'h2', style: { marginBottom: '.2rem' } }, title),
      sub ? App.el('p', { class: 'lead', style: { fontSize: '.95rem' } }, sub) : null,
      tip ? App.el('div', { class: 'callout info' }, App.el('div', { class: 'ct' }, 'What goes here'), App.el('p', {}, tip)) : null
    );
  }

  function renderSection(panel, g) {
    var gd = g.gdd;
    switch (current) {
      case 'pitch': return sPitch(panel, g, gd);
      case 'rules': return sRules(panel, g, gd);
      case 'loops': return sLoops(panel, g, gd);
      case 'numbers': return sNumbers(panel, g, gd);
      case 'feel': return sFeel(panel, g, gd);
      case 'world': return sWorld(panel, g, gd);
      case 'art': return sArt(panel, g, gd);
      case 'mood': return sMood(panel, g, gd);
      case 'tech': return sTech(panel, g, gd);
      case 'balance': return sBalance(panel, g, gd);
      case 'plan': return sPlan(panel, g, gd);
      case 'playtest': return sPlaytest(panel, g, gd);
      case 'cuts': return sCuts(panel, g, gd);
    }
  }

  /* ------------------------------- 1. pitch ------------------------------ */
  function sPitch(panel, g, gd) {
    var c = gd.concept;
    var L = App.data.labels[g.label];
    head(panel, 1, 'The pitch', 'If you cannot say it in one sentence, you cannot make it in one lifetime.',
      'Write it as “It is X meets Y, and the clever bit is Z”. Then describe the 3-second moment that would make someone stop scrolling.');
    panel.append(
      App.field('One sentence', bind(App.el('input', { type: 'text', placeholder: 'A survivors-like where deflecting lasers charges your sword.' }), c, 'pitch')),
      App.el('div', { class: 'field-row' },
        App.field('Kind of game', bind(App.el('input', { type: 'text', placeholder: 'Arena roguelite, run-based' }), c, 'genre')),
        App.field('Who plays it', bind(App.el('input', { type: 'text', placeholder: 'People who play survivors-likes and watch streamers' }), c, 'audience'))),
      App.field('The 3-second moment', bind(App.el('input', { type: 'text', placeholder: 'Deflect a laser → it charges the blade → teleport through the swarm.' }), c, 'hook')),
      App.field('What makes it different', bind(App.el('textarea', { placeholder: 'Not a list of features. One reason a person would pick this over the other games like it.' }), c, 'usp')),
      App.el('div', { class: 'callout plain' },
        App.el('div', { class: 'ct' }, 'The plan for this kind of game'),
        App.el('p', { class: 'small' }, App.frag(App.md('**' + L.name + '** — ' + L.summary + '. Usually about ' + L.cadence + '. Aim for ' + L.ratio + '.')))),
      App.el('div', { class: 'callout warn' },
        App.el('div', { class: 'ct' }, 'Watch out'),
        App.el('p', {}, L.watchOut))
    );
  }

  /* ------------------------------- 2. rules ------------------------------ */
  function sRules(panel, g, gd) {
    head(panel, 2, 'Three rules the game must never break', 'Three rules is the right number. Five is a wish list.',
      'Write them as player experiences, not features. “Every hit is felt” is a rule. “Add screen shake” is not.');
    panel.append(App.el('div', { class: 'grid g3' }, gd.pillars.map(function (p, i) {
      return App.el('div', { class: 'card', style: { borderTop: '3px solid var(--accent)' } },
        App.el('div', { class: 'kicker' }, 'Rule ' + (i + 1)),
        App.field('Name', bind(App.el('input', { type: 'text' }), p, 't')),
        App.field('What it means in practice', bind(App.el('textarea', { style: { minHeight: '120px' } }), p, 'd')));
    })));
    panel.append(App.el('div', { class: 'btn-row' },
      App.el('button', { class: 'btn sm', onclick: function () {
        var tpl = App.data.gddTemplates[g.label].pillars;
        gd.pillars = tpl.map(function (p) { return { t: p.t, d: p.d }; });
        App.Store.save(); App.renderRoute();
      } }, 'Fill with a starter set for a ' + App.data.labels[g.label].name.toLowerCase())));
  }

  /* ------------------------------- 3. loops ------------------------------ */
  function sLoops(panel, g, gd) {
    var tpl = App.data.gddTemplates[g.label].loops;
    head(panel, 3, 'Core loops', 'Three sizes: what happens in three seconds, in ten minutes, and across the whole game.',
      'Use actions, not adjectives. “Dodge, slash, draft, bank” — not “engaging combat experience”.');
    panel.append(
      App.field('Three seconds — the moment to moment', bind(App.el('textarea', { placeholder: tpl.micro }), gd.loops, 'micro'), 'This is what the player does hundreds of times. It has to feel good the hundredth time.'),
      App.field('Ten minutes — one session', bind(App.el('textarea', { placeholder: tpl.meso }), gd.loops, 'meso'), 'One complete thing that happens in a short sitting.'),
      App.field('The whole game — the long term', bind(App.el('textarea', { placeholder: tpl.macro }), gd.loops, 'macro'), 'What keeps someone coming back next week.'),
      App.el('div', { class: 'callout plain' },
        App.el('div', { class: 'ct' }, 'Starter loops for a ' + App.data.labels[g.label].name.toLowerCase()),
        App.el('p', { class: 'small' }, App.frag(App.md('**3 seconds:** ' + tpl.micro))),
        App.el('p', { class: 'small' }, App.frag(App.md('**10 minutes:** ' + tpl.meso))),
        App.el('p', { class: 'small' }, App.frag(App.md('**Long term:** ' + tpl.macro))))
    );
  }

  /* ------------------------------- 4. numbers ---------------------------- */
  function sNumbers(panel, g, gd) {
    head(panel, 4, 'The numbers', 'Every number you can write down is a number you can fix later. The ones you leave in your head become bugs.',
      'Write them as formulas. “damage = base × 1.32^(level − 1)” is worth more than a paragraph of description.');

    var rows = App.el('div', {});
    function draw() {
      App.clear(rows);
      if (!gd.ledger.length) {
        rows.append(App.el('p', { class: 'tiny muted' }, 'Nothing yet. Add the first one below.'));
      }
      gd.ledger.forEach(function (r, i) {
        rows.append(App.el('div', { class: 'field-row', style: { alignItems: 'end', marginBottom: '.5rem' } },
          bind(App.el('input', { type: 'text', placeholder: 'Name' }), r, 'name'),
          bind(App.el('input', { type: 'text', placeholder: 'Formula or value' }), r, 'formula'),
          bind(App.el('input', { type: 'text', placeholder: 'Notes, caps, edge cases' }), r, 'notes'),
          App.el('button', { class: 'btn sm ghost', style: { marginBottom: '.8rem' }, onclick: function () {
            gd.ledger.splice(i, 1); App.Store.save(); draw();
          } }, '✕')));
      });
    }
    draw();
    panel.append(rows,
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn sm primary', onclick: function () {
          gd.ledger.push({ name: '', formula: '', notes: '' }); App.Store.save(); draw();
        } }, '+ Add a number'),
        App.el('button', { class: 'btn sm ghost', onclick: function () {
          [['Base damage', 'damage = base × (1 + 0.12 × stacks)', 'Cap the stacks at 20'],
           ['Hit pause', '4–6 frames on a heavy hit', 'Shorter on weak hits'],
           ['Reroll cost', 'cost = 15 × 1.5^rerolls', 'Resets every run'],
           ['Unlock cost', 'cost = 120 × 1.32^(level − 1)', 'Four unlocks total']].forEach(function (r) {
            gd.ledger.push({ name: r[0], formula: r[1], notes: r[2] });
          });
          App.Store.save(); draw();
        } }, 'Add a starter set')),
      App.el('div', { class: 'callout good' },
        App.el('div', { class: 'ct' }, 'Why this matters more than it looks'),
        App.el('p', {}, 'Balancing by feel alone always drifts. If the numbers are written down, you can change one and immediately see what it does to everything else.')));
  }

  /* -------------------------------- 5. feel ------------------------------- */
  function sFeel(panel, g, gd) {
    head(panel, 5, 'Game feel', 'The difference between a game that works and a game people describe as “so satisfying”.',
      'Camera, feedback, controls, sound. None of it is gameplay, and all of it decides the review score.');
    panel.append(
      App.field('Camera', bind(App.el('textarea', { placeholder: 'Follow distance, height, how it frames combat, when it shakes, how it looks ahead when you run.' }), gd.feel, 'camera')),
      App.field('Feedback on every action', bind(App.el('textarea', { placeholder: 'Hit pause length, screen shake amount, damage flash, particles, controller rumble.' }), gd.feel, 'feedback')),
      App.field('Controls and forgiveness', bind(App.el('textarea', { placeholder: 'Input buffering length, coyote time, how generous the parry window is.' }), gd.feel, 'controls')),
      App.field('Sound', bind(App.el('textarea', { placeholder: 'What ducks when combat starts, how loud hits are, what the music does between fights.' }), gd.feel, 'audio')),
      App.el('div', { class: 'callout info' },
        App.el('div', { class: 'ct' }, 'Typical starting numbers'),
        App.el('p', { class: 'small' }, 'Input buffer 120–150 ms · coyote time 100–120 ms · hit pause 4–6 frames on heavy hits · shake based on hit size, never constant · combat sound ducks the music by about 4 dB for 80 ms.'))
    );
  }

  /* ------------------------------- 6. world ------------------------------ */
  function sWorld(panel, g, gd) {
    head(panel, 6, 'World and characters', 'The rules of the place, not the plot. And who lives in it.',
      'For a solo developer, world rules are more useful than lore. “Magic leaves scars you can see two episodes later” is a rule you can build on.');
    panel.append(
      App.field('World rules', bind(App.el('textarea', { placeholder: 'What is true here that is not true in the real world, and what does it cost?' }), gd.world, 'rules')),
      App.field('Groups and tensions', bind(App.el('textarea', { placeholder: 'Who wants what, and who is in the way.' }), gd.world, 'factions'))
    );

    var host = App.el('div', {});
    function drawChars() {
      App.clear(host);
      if (!gd.characters.length) host.append(App.el('p', { class: 'tiny muted' }, 'No characters yet.'));
      gd.characters.forEach(function (c, i) {
        host.append(App.el('div', { class: 'card', style: { marginBottom: '.5rem' } },
          App.el('div', { class: 'field-row' },
            bind(App.el('input', { type: 'text', placeholder: 'Name' }), c, 'name'),
            bind(App.el('input', { type: 'text', placeholder: 'Role' }), c, 'role'),
            App.el('div', { class: 'field' }, App.el('label', {}, 'Silhouette'),
              (function () {
                var s = App.el('select', {}, ['circle', 'square', 'triangle', 'other'].map(function (o) {
                  return App.el('option', { value: o, selected: c.shape === o ? 'selected' : null }, o);
                }));
                s.addEventListener('change', function () { c.shape = s.value; App.Store.save(); });
                return s;
              })())),
          App.el('div', { class: 'row between' },
            bind(App.el('input', { type: 'text', placeholder: 'What do they want, and what changes for them?' }), c, 'arc'),
            App.el('button', { class: 'btn sm ghost', onclick: function () {
              gd.characters.splice(i, 1); App.Store.save(); drawChars();
            } }, '✕'))));
      });
    }
    drawChars();

    panel.append(
      App.el('div', { class: 'section-head', style: { marginTop: '1rem' } },
        App.el('div', {},
          App.el('h3', { class: 'h3' }, 'Characters'),
          App.el('p', { class: 'tiny muted' }, 'The silhouette column is a real test: circle reads as friendly, square as solid, triangle as dangerous.')),
        App.el('button', { class: 'btn sm', onclick: function () {
          gd.characters.push({ name: '', role: '', shape: 'circle', arc: '' }); App.Store.save(); drawChars();
        } }, '+ Add character')),
      host,
      App.field('Other notes', bind(App.el('textarea', { placeholder: 'Anything else about the world worth remembering.' }), gd.world, 'notes'))
    );
  }

  /* -------------------------------- 7. art ------------------------------- */
  function sArt(panel, g, gd) {
    head(panel, 7, 'Art direction', 'Pick the colours once, then never think about it again.',
      'Sixty percent one main colour, thirty percent a supporting colour, ten percent a bright accent used only where you want the eye to go.');
    var sw = App.el('div', {});
    var colorInput = App.el('input', { type: 'color', value: '#2ee6a8' });
    function draw() {
      App.clear(sw);
      var row = App.el('div', { class: 'row', style: { gap: '.6rem', marginBottom: '1.6rem' } });
      gd.art.palette.forEach(function (hex, i) {
        row.append(App.el('div', { class: 'swatch-wrap' },
          App.el('div', { class: 'swatch', style: { background: hex }, title: hex + ' — click to copy', onclick: function () {
            App.copyText(hex); App.toast(hex + ' copied.');
          } }),
          App.el('div', { class: 'lab' }, hex),
          App.el('button', { class: 'btn sm ghost', style: { padding: '.05rem .35rem', fontSize: '.6rem' }, onclick: function () {
            gd.art.palette.splice(i, 1); App.Store.save(); draw();
          } }, '✕')));
      });
      sw.append(row);
    }
    draw();

    var presets = App.el('div', { class: 'grid g4' }, App.data.palettes.map(function (p) {
      return App.el('div', { class: 'palette-preset', title: p.source, onclick: function () {
        gd.art.palette = p.colors.slice();
        App.Store.save();
        App.toast('Palette applied.');
        App.renderRoute();
      } },
        App.el('div', { class: 'pp-name' }, p.name),
        App.el('div', { class: 'palette-mini' }, p.colors.map(function (c) { return App.el('i', { style: { background: c } }); })),
        App.el('div', { class: 'tiny muted', style: { marginTop: '.35rem' } }, p.source));
    }));

    panel.append(
      App.el('h3', { class: 'h3' }, 'Palette'),
      sw,
      App.el('div', { class: 'btn-row' }, colorInput,
        App.el('button', { class: 'btn sm', onclick: function () {
          if (gd.art.palette.length >= 8) { App.toast('Eight is plenty. Restraint is the discipline.', 'warn'); return; }
          gd.art.palette.push(colorInput.value); App.Store.save(); draw();
        } }, '+ Add colour'),
        App.el('button', { class: 'btn sm ghost', onclick: function () {
          gd.art.palette = surprisePalette(); App.Store.save(); App.renderRoute();
        } }, 'Surprise me')),
      App.el('div', { class: 'section-head' }, App.el('h3', { class: 'h3' }, 'Palette starters')),
      presets,
      App.field('Style notes', bind(App.el('textarea', { placeholder: 'Outlines, shading steps, lighting, how bright the highlights are.' }), gd.art, 'notes')),
      App.field('Shaders and effects', bind(App.el('textarea', { placeholder: 'Which effects need to exist, and what they should look like.' }), gd.art, 'shader')),
      App.el('p', { class: 'tiny muted' }, 'Tip: open the moodboard to pin references, images and colours on one page you can look at while you work.')
    );
  }

  function surprisePalette() {
    function hsl(h, s, l) {
      function f(n) { var k = (n + h / 30) % 12; var a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))))).toString(16).padStart(2, '0'); }
      return '#' + f(0) + f(8) + f(4);
    }
    var h = Math.floor(Math.random() * 360);
    return [hsl(h, 0.5, 0.14), hsl(h, 0.55, 0.36), hsl((h + 30) % 360, 0.6, 0.55), hsl(h, 0.25, 0.92), hsl((h + 200) % 360, 0.4, 0.2)];
  }

  /* ------------------------------- 8. mood ------------------------------- */
  var addKind = 'image';

  function sMood(panel, g, gd) {
    g.mood = g.mood || { tiles: [] };
    var tiles = g.mood.tiles;

    head(panel, 8, 'Moodboard', 'A wall of references you can look at while you work — and click to view full size.',
      'Pin images from your own device, colours you like, gradients for effects, and short written notes. Click any tile to open it full screen, then zoom with the wheel, the + and − buttons, or a pinch on a touch screen.');

    /* ------------------------------ add bar ----------------------------- */
    /* Kept in the document and merely moved off-screen: some Android WebViews
       refuse to open the picker for an input that is display:none. */
    var fileInput = App.el('input', {
      type: 'file', accept: 'image/*', multiple: true,
      'aria-hidden': 'true', tabindex: '-1',
      style: { position: 'fixed', left: '-9999px', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' }
    });
    function pickFiles() {
      fileInput.value = '';
      try { fileInput.click(); }
      catch (e) { App.toast('This device would not open a file picker.', 'bad'); }
    }
    var urlInput = App.el('input', { type: 'text', placeholder: 'https://… paste an image link' });
    var capInput = App.el('input', { type: 'text', placeholder: 'What does this reference teach?' });
    var colA = App.el('input', { type: 'color', value: '#2ee6a8' });
    var colB = App.el('input', { type: 'color', value: '#a78bfa' });
    var noteInput = App.el('input', { type: 'text', placeholder: 'Note, e.g. "silhouette test: angry triangle"' });
    var pending = [];
    var busy = 0;

    fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files || []);
      if (!files.length) return;
      pending = [];
      busy = files.length;
      App.toast('Storing ' + files.length + (files.length === 1 ? ' image at full size…' : ' images at full size…'));
      files.forEach(function (f) {
        App.Images.put(f, function (res, err) {
          busy--;
          if (res) pending.push(res);
          else if (err) App.toast('Could not store ' + f.name + ': ' + err, 'bad', 4200);
          if (busy === 0) {
            fileInput.value = '';
            drawControls();
            if (pending.length) App.toast(pending.length + ' ready. Add a caption, then press Pin.');
          }
        });
      });
    });

    var controls = App.el('div', {});
    function drawControls() {
      App.clear(controls);

      controls.append(App.el('div', { class: 'seg', style: { marginBottom: '.8rem' } },
        [['image', 'Image'], ['color', 'Colour'], ['gradient', 'Gradient'], ['note', 'Note']].map(function (k) {
          return App.el('button', { class: addKind === k[0] ? 'on' : '', onclick: function () { addKind = k[0]; drawControls(); } }, k[1]);
        })));

      if (addKind === 'image') {
        controls.append(
          App.el('div', { class: 'btn-row' },
            App.el('button', { class: 'btn sm primary', disabled: busy > 0, onclick: function () { pickFiles(); } },
              busy ? 'Storing…' : 'Choose from this device'),
            fileInput),
          App.el('p', { class: 'tiny muted', style: { margin: '.5rem 0 0' } },
            App.Images.available()
              ? 'Your images are kept exactly as they are — full resolution, original quality, no resizing and no re-compressing. Zoom in the viewer as far as the picture allows.'
              : 'This device will not let the app store image files, so only links, colours and notes can be pinned here.'),
          App.el('div', { class: 'field', style: { marginTop: '.7rem' } }, App.el('label', {}, 'Or paste a link'), urlInput),
          App.field('Caption', capInput));

        if (pending.length) {
          var prev = App.el('div', { class: 'row', style: { gap: '.5rem', flexWrap: 'wrap', margin: '.4rem 0' } });
          pending.forEach(function (p, i) {
            prev.append(App.el('div', { class: 'mood-pending' },
              App.el('img', { src: p.url, alt: '' }),
              App.el('div', { class: 'mp-meta' },
                App.el('div', { class: 'tiny', style: { fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '15ch' } }, p.name),
                App.el('div', { class: 'tiny muted' }, p.w + '×' + p.h + ' · ' + App.bytes(p.bytes))),
              App.el('button', { class: 'x', title: 'Remove', onclick: function () {
                App.Images.remove(p.id);
                pending.splice(i, 1);
                drawControls();
              } }, '✕')));
          });
          controls.append(prev);
        }
      }

      if (addKind === 'color') controls.append(App.el('div', { class: 'btn-row' }, colA, App.field('Caption', capInput)));
      if (addKind === 'gradient') controls.append(App.el('div', { class: 'btn-row' }, colA, App.el('span', { class: 'muted' }, '→'), colB, App.field('Caption', capInput)));
      if (addKind === 'note') controls.append(App.el('div', { class: 'btn-row' }, App.el('div', { style: { flex: '1', minWidth: '200px' } }, noteInput), App.field('Caption', capInput)));

      controls.append(App.el('div', { class: 'btn-row', style: { marginTop: '.4rem' } },
        App.el('button', { class: 'btn primary', onclick: function () {
          var cap = capInput.value.trim();
          if (addKind === 'image') {
            if (pending.length) {
              pending.forEach(function (p) {
                tiles.push({ id: App.uid('t'), type: 'image', imgId: p.id, name: p.name, w: p.w, h: p.h, bytes: p.bytes, caption: cap || p.name });
              });
              App.toast(pending.length + ' pinned to the board.');
            } else if (urlInput.value.trim()) {
              tiles.push({ id: App.uid('t'), type: 'image', url: urlInput.value.trim(), caption: cap });
            } else { App.toast('Choose an image from this device, or paste a link.', 'warn'); return; }
          } else if (addKind === 'color') {
            tiles.push({ id: App.uid('t'), type: 'color', a: colA.value, caption: cap });
          } else if (addKind === 'gradient') {
            tiles.push({ id: App.uid('t'), type: 'gradient', a: colA.value, b: colB.value, caption: cap });
          } else {
            if (!noteInput.value.trim()) { App.toast('Write the note first.', 'warn'); return; }
            tiles.push({ id: App.uid('t'), type: 'note', title: noteInput.value.trim(), caption: cap });
          }
          pending = [];
          capInput.value = ''; urlInput.value = ''; noteInput.value = '';
          fileInput.value = '';
          App.Store.save();
          App.confetti(10);
          App.renderRoute();
        } }, '+ Pin to board'),
        tiles.length ? App.el('button', { class: 'btn sm ghost', onclick: function () { openViewer(tiles, 0); } }, 'View the whole board') : null));
    }
    drawControls();

    /* --------------------------- board summary -------------------------- */
    var sizeBadge = App.el('span', { class: 'badge gray' }, '…');
    var storedBytes = App.sum(tiles, function (t) { return t.bytes || 0; });
    sizeBadge.textContent = App.bytes(storedBytes);
    sizeBadge.className = 'badge ' + (storedBytes > 52428800 ? 'warn' : 'gray');
    App.Images.total(function (bytes, count) {
      sizeBadge.textContent = App.bytes(bytes);
      sizeBadge.className = 'badge ' + (bytes > 52428800 ? 'warn' : 'gray');
      sizeBadge.title = count + ' stored image file' + (count === 1 ? '' : 's');
    });

    panel.append(App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Board for ' + g.title),
          App.el('div', { class: 'card-t' }, tiles.length + (tiles.length === 1 ? ' pinned reference' : ' pinned references')),
          App.el('div', { class: 'tiny muted' }, 'Everything is stored inside the app. Nothing you add from this device needs the internet.')),
        sizeBadge),
      controls));

    /* ------------------------------- the grid --------------------------- */
    if (!tiles.length) {
      panel.append(App.el('div', { style: { marginTop: '1rem' } }, App.empty({
        title: 'The board is empty',
        body: 'Pin at least: three colours, two atmosphere images, one typography note and one silhouette test. Start with a palette preset below if you are stuck.',
        ico: 'M3 4h18v16H3z|M3 15l5-5 5 5 3-3 5 5|M8.5 8.5h.01'
      })));
    } else {
      var grid = App.el('div', { class: 'tile-grid', style: { marginTop: '1rem' } });
      tiles.forEach(function (t, i) {
        var visual;
        if (t.type === 'color') visual = App.el('div', { class: 'tile-v', style: { background: t.a } });
        else if (t.type === 'gradient') visual = App.el('div', { class: 'tile-v', style: { background: 'linear-gradient(135deg,' + t.a + ',' + t.b + ')' } });
        else if (t.type === 'note') visual = App.el('div', { class: 'tile-v note', style: { background: 'linear-gradient(150deg, #26313f, #0e141b 70%)' } },
          App.el('div', { class: 'note-t' }, t.title || 'Note'));
        else {
          visual = App.el('div', { class: 'tile-v', style: { background: 'var(--surface-2)' } });
          var im = App.el('img', { alt: t.caption || t.name || 'reference', loading: 'lazy', decoding: 'async' });
          visual.append(im);
          resolveTile(t, function (url) {
            if (url) { im.src = url; }
            else {
              App.clear(visual);
              visual.append(App.el('div', { class: 'note-t', style: { color: 'var(--ink-3)', fontSize: '.78rem', padding: '1rem', textAlign: 'center' } },
                t.url ? 'this link needs the internet' : 'image not found'));
            }
          });
          visual.append(App.el('span', { class: 'tile-zoom' }, App.svg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14|M20 20l-3.5-3.5|M8.5 11h5|M11 8.5v5')));
        }

        var tile = App.el('div', { class: 'tile clickable', title: 'Click to view full size',
          onclick: function (e) { if (e.target.closest('.tile-act')) return; openViewer(tiles, i); } },
          visual,
          App.el('div', { class: 'tile-cap' },
            App.el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t.caption || t.name || t.type),
            App.el('div', { class: 'tile-act' },
              i > 0 ? App.el('button', { class: 'x', title: 'Move earlier', onclick: function () { tiles.splice(i - 1, 0, tiles.splice(i, 1)[0]); App.Store.save(); App.renderRoute(); } }, '‹') : null,
              i < tiles.length - 1 ? App.el('button', { class: 'x', title: 'Move later', onclick: function () { tiles.splice(i + 1, 0, tiles.splice(i, 1)[0]); App.Store.save(); App.renderRoute(); } }, '›') : null,
              t.type === 'color' ? App.el('button', { class: 'x', title: 'Copy the code', onclick: function () { App.copyText(t.a); App.toast(t.a + ' copied.'); } }, '⧉') : null,
              App.el('button', { class: 'x', title: 'Remove', onclick: function () {
                if (t.imgId) App.Images.remove(t.imgId);
                tiles.splice(i, 1);
                App.Store.save();
                App.renderRoute();
              } }, '✕'))));
        grid.append(tile);
      });
      panel.append(grid);

      var storedList = tiles.filter(function (t) { return t.imgId; });
      if (storedList.length) {
        var biggest = storedList.filter(function (t) { return t.w; }).sort(function (a, b) { return (b.w * b.h) - (a.w * a.h); })[0];
        panel.append(App.el('p', { class: 'tiny muted', style: { marginTop: '.6rem' } },
          storedList.length + ' image' + (storedList.length === 1 ? '' : 's') + ' stored at full size' +
          (biggest ? ', the largest being ' + biggest.w + '×' + biggest.h : '') +
          ' · ' + App.bytes(storedBytes) + ' on disk.'));
      }
    }

    /* ------------------------------ presets ----------------------------- */
    panel.append(
      App.el('div', { class: 'section-head' }, App.el('h3', { class: 'h3' }, 'Palette starters')),
      App.el('p', { class: 'tiny muted' }, 'Clicking one applies it to the Art direction palette and pins each colour to this board.'),
      App.el('div', { class: 'grid g4' }, App.data.palettes.map(function (p) {
        return App.el('div', { class: 'palette-preset', title: p.source, onclick: function () {
          gd.art.palette = p.colors.slice();
          p.colors.forEach(function (c) { tiles.push({ id: App.uid('t'), type: 'color', a: c, caption: p.name.split(' — ')[0] }); });
          App.Store.save();
          App.toast('Palette applied and pinned.');
          App.renderRoute();
        } },
          App.el('div', { class: 'pp-name' }, p.name),
          App.el('div', { class: 'palette-mini' }, p.colors.map(function (c) { return App.el('i', { style: { background: c } }); })),
          App.el('div', { class: 'tiny muted', style: { marginTop: '.35rem' } }, p.source));
      })));

    panel.append(App.el('div', { class: 'btn-row', style: { marginTop: '1.2rem' } },
      App.el('button', { class: 'btn sm', onclick: function () {
        tiles.push({ id: App.uid('t'), type: 'color', a: surprisePalette()[2], caption: 'random accent' });
        App.Store.save(); App.renderRoute();
      } }, 'Pin a random accent'),
      App.el('button', { class: 'btn sm ghost', onclick: function () {
        App.presentExport('Moodboard — ' + g.title, App.slug(g.title) + '_moodboard.md', exportBoard(g), 'text/markdown');
      } }, 'Export the board list'),
      App.el('button', { class: 'btn sm ghost', onclick: function () { saveAllImages(g); } }, 'Save images to files'),
      tiles.some(function (t) { return t.imgId; }) ? App.el('button', { class: 'btn sm ghost', onclick: function () {
        App.confirm({
          title: 'Delete every stored image?',
          body: 'This removes the picture files from the app and takes them off the board. Colours, gradients and notes stay.',
          confirmText: 'Delete them', danger: true
        }).then(function (ok) {
          if (!ok) return;
          tiles.forEach(function (t) { if (t.imgId) App.Images.remove(t.imgId); });
          g.mood.tiles = tiles.filter(function (t) { return !t.imgId; });
          App.Images.clear();
          App.Store.save();
          App.toast('Stored images deleted.');
          App.renderRoute();
        });
      } }, 'Delete stored images') : null));

    panel.append(App.el('div', { class: 'callout info' },
      App.el('div', { class: 'ct' }, 'How to use the viewer'),
      App.el('p', {}, 'Click any tile to open it full screen. Then: mouse wheel or pinch to zoom, drag to move around, double-click or double-tap to snap between fit and close-up, arrow keys to move between references, and Esc to close.'),
      App.el('p', { class: 'tiny muted' }, 'Because the originals are stored untouched, you can zoom right down to the actual pixels of the file.')));
  }

  /* Resolve a tile to something an <img> can show.
     The answer is deliberately NOT cached on the tile: tiles are the saved
     objects, so a cached blob: URL would be written to disk and would be dead
     the next time the app opens. App.Images keeps its own in-memory cache. */
  function resolveTile(t, cb) {
    if (t.imgId) App.Images.url(t.imgId, cb);
    else cb(t.url || null);
  }

  function saveAllImages(g) {
    var tiles = ((g.mood && g.mood.tiles) || []).filter(function (t) { return t.imgId; });
    if (!tiles.length) { App.toast('There are no stored images to save.', 'warn'); return; }
    App.toast('Saving ' + tiles.length + ' file' + (tiles.length === 1 ? '' : 's') + '…', null, 4000);
    tiles.forEach(function (t) {
      App.Images.url(t.imgId, function (url) {
        if (!url) return;
        var a = document.createElement('a');
        a.href = url;
        a.download = (t.name || App.slug(t.caption || 'image')) || 'image';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { a.remove(); }, 500);
      });
    });
  }

  function exportBoard(g) {
    var tiles = (g.mood && g.mood.tiles) || [];
    var out = ['# Moodboard — ' + g.title, '', '| # | Kind | Details | Caption |', '| --- | --- | --- | --- |'];
    tiles.forEach(function (t, i) {
      var detail = t.type === 'image'
        ? (t.imgId ? 'stored at full size' + (t.w ? ', ' + t.w + '×' + t.h : '') + (t.bytes ? ', ' + App.bytes(t.bytes) : '') : t.url)
        : t.type === 'gradient' ? t.a + ' → ' + t.b
        : t.type === 'color' ? t.a
        : t.title || '';
      out.push('| ' + (i + 1) + ' | ' + t.type + ' | ' + detail + ' | ' + (t.caption || '') + ' |');
    });
    out.push('');
    out.push('_Exported from SoloDev Studio — ' + App.today() + '_');
    out.push('');
    out.push('_Images are stored inside the app itself and are not part of this file._');
    return out.join('\n');
  }

  /* Open the viewer. Image tiles are resolved first, because the viewer needs
     a real URL up front; App.Images answers instantly for anything already on
     screen, so this is normally synchronous. */
  function openViewer(tiles, index) {
    var items = [];
    var waiting = 0;
    var opened = false;

    function open() {
      if (opened || waiting > 0) return;
      opened = true;
      App.lightbox(items, index);
    }

    tiles.forEach(function (t) {
      var item = {
        kind: t.type === 'image' ? 'image' : t.type === 'note' ? 'note' : 'fill',
        src: null,
        color: t.a, b: t.b, title: t.title,
        caption: (t.caption || t.name || '') + (t.w ? '  ·  ' + t.w + '×' + t.h : '')
      };
      items.push(item);
      if (t.type !== 'image') return;
      if (t.imgId) {
        waiting++;
        App.Images.url(t.imgId, function (url) {
          item.src = url;
          waiting--;
          open();
        });
      } else {
        item.src = t.url;
      }
    });

    open();
  }

  /* -------------------------------- 9. tech ------------------------------ */
  function sTech(panel, g, gd) {
    var tpl = App.data.gddTemplates[g.label].tech;
    head(panel, 9, 'Technical limits', 'Decide the budget on day one and build the first finished area to hit it.',
      'These are the numbers that stop a game from running badly. Set them before you have ten thousand assets that all break them.');
    var rows = [
      ['trisHero', 'Player character triangles', 'How detailed the main character model can be'],
      ['trisEnemy', 'Enemy triangles', 'Per enemy, at the closest view distance'],
      ['drawCalls', 'Draw calls per frame', 'How many separate things get drawn. Lower is faster.'],
      ['vramMB', 'Texture memory (MB)', 'How much video memory the textures can use'],
      ['fps', 'Target frame rate', 'What you are aiming for on the hardware you support']
    ];

    /* Targets start from the starter figures but are yours to change. */
    gd.techTargets = gd.techTargets || {};
    rows.forEach(function (r) { if (gd.techTargets[r[0]] == null) gd.techTargets[r[0]] = tpl[r[0]]; });

    panel.append(App.el('div', { class: 'field-row' }, rows.map(function (r) {
      var inp = App.el('input', { type: 'number', value: gd.tech[r[0]] == null ? '' : gd.tech[r[0]] });
      inp.addEventListener('change', function () { gd.tech[r[0]] = Number(inp.value) || 0; App.Store.save(); App.renderRoute(); });
      return App.field(r[1], inp, r[2]);
    })));

    var statusCell = {};
    function paint() {
      rows.forEach(function (r) {
        var cell = statusCell[r[0]];
        if (!cell) return;
        App.clear(cell);
        var over = Number(gd.tech[r[0]] || 0) > Number(gd.techTargets[r[0]] || 0);
        cell.append(over ? App.el('span', { class: 'badge warn' }, 'above target') : App.el('span', { class: 'badge good' }, 'within'));
      });
    }

    var tbody = App.el('tbody', {}, rows.map(function (r) {
      var targetInp = App.el('input', { type: 'number', value: gd.techTargets[r[0]] == null ? '' : gd.techTargets[r[0]], style: { width: '92px' } });
      targetInp.addEventListener('change', function () {
        gd.techTargets[r[0]] = Number(targetInp.value) || 0;
        App.Store.save();
        paint();
      });
      var cell = App.el('td', {});
      statusCell[r[0]] = cell;
      return App.el('tr', {},
        App.el('td', {}, r[1]),
        App.el('td', { class: 'num' }, App.num(Number(gd.tech[r[0]] || 0))),
        App.el('td', { class: 'num' }, targetInp),
        cell);
    }));
    paint();

    var tbl = App.el('div', { class: 'tbl-wrap' }, App.el('table', { class: 'tbl' },
      App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'Budget'), App.el('th', {}, 'Yours'), App.el('th', {}, 'Target value'), App.el('th', {}, 'Status'))),
      tbody));
    panel.append(tbl,
      App.el('div', { class: 'callout warn' },
        App.el('div', { class: 'ct' }, 'The test that matters'),
        App.el('p', {}, 'Native resolution, hardware power limit on, locked 60 FPS, and no frame substantially longer than the others, for fifteen minutes of the busiest combat you have. If the first finished area cannot do that, profile it before writing another feature.')));
  }

  /* ------------------------------- 9. balance ---------------------------- */
  function sBalance(panel, g, gd) {
    head(panel, 10, 'Balance', 'How hard it is, how it stays fair, and where the money comes from and goes.',
      'Write down what “too easy” and “too hard” look like for your game. Otherwise you will only find out from reviews.');
    panel.append(
      App.field('Economy', bind(App.el('textarea', { placeholder: 'Where does currency come from, and what is worth buying? How much should a player have after ten minutes, an hour, ten hours?' }), gd.balance, 'economy')),
      App.field('Difficulty curve', bind(App.el('textarea', { placeholder: 'What gets harder over time? What does the player gain at the same time? Where should it feel tightest?' }), gd.balance, 'difficulty')),
      App.field('Tuning rules', bind(App.el('textarea', { placeholder: 'Rules you will not break. “No enemy can kill a full-health player in under two seconds.” “Every upgrade must be pickable at least once per run.”' }), gd.balance, 'tuning')),
      App.el('div', { class: 'callout good' },
        App.el('div', { class: 'ct' }, 'A cheap way to check your balance'),
        App.el('p', {}, 'Watch someone play for ten minutes and count how many times they choose the same upgrade. If one option is picked every single time, the others are not interesting — that is a design problem, not a numbers problem.')));
  }

  /* ------------------------------- 10. plan ------------------------------ */
  function sPlan(panel, g, gd) {
    head(panel, 11, 'Build plan', 'Every estimate gets 25% added. The buffer is for things going wrong, not for extra features.',
      'Write it in weeks. If the total does not fit in the time you actually have, cut something now rather than discovering it in month eight.');
    var host = App.el('div', {});
    function draw() {
      App.clear(host);
      gd.plan.milestones.forEach(function (m2, i) {
        host.append(App.el('div', { class: 'field-row', style: { marginBottom: '.45rem', alignItems: 'end' } },
          bind(App.el('input', { type: 'text', placeholder: 'Milestone' }), m2, 'name'),
          (function () {
            var inp = App.el('input', { type: 'number', value: m2.weeks || '', placeholder: 'weeks' });
            inp.addEventListener('change', function () { m2.weeks = Number(inp.value) || 0; App.Store.save(); draw(); });
            return App.el('div', { class: 'field' }, App.el('label', {}, 'Weeks'), inp);
          })(),
          bind(App.el('input', { type: 'text', placeholder: 'What has to be true' }), m2, 'notes'),
          App.el('button', { class: 'btn sm ghost', style: { marginBottom: '.8rem' }, onclick: function () {
            gd.plan.milestones.splice(i, 1); App.Store.save(); draw();
          } }, '✕')));
      });
      var raw = App.sum(gd.plan.milestones, function (m2) { return m2.weeks; });
      host.append(App.el('div', { class: 'card pad', style: { background: 'var(--surface-2)', marginTop: '.6rem' } },
        App.outRow('Raw estimate', raw + ' weeks'),
        App.outRow('Plus 25% buffer', Math.ceil(raw * 1.25) + ' weeks'),
        App.outRow('Commit to this', Math.ceil(raw * 1.25) + ' weeks', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          'Your project is set to ' + g.targetWeeks + ' weeks. ' +
          (raw * 1.25 > g.targetWeeks ? 'That is more than planned — cut something or extend the plan.' : 'That fits.'))));
    }
    draw();
    panel.append(host,
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn sm primary', onclick: function () {
          gd.plan.milestones.push({ name: '', weeks: 0, notes: '' }); App.Store.save(); draw();
        } }, '+ Add a milestone'),
        App.el('button', { class: 'btn sm ghost', onclick: function () {
          gd.plan.milestones = [
            { name: 'Prototype is fun', weeks: 2, notes: 'Grey boxes, 10-minute test' },
            { name: 'First area finished', weeks: 3, notes: 'Hits the FPS target' },
            { name: 'All content in', weeks: 6, notes: 'The factory runs' },
            { name: 'Cut 30%, freeze', weeks: 1, notes: 'Nothing new after this' },
            { name: 'Polish and playtests', weeks: 2, notes: 'Feel pass' },
            { name: 'Launch preparation', weeks: 1, notes: 'Store, trailer, embargo' }
          ];
          App.Store.save(); draw();
        } }, 'Use a starter plan')),
      App.field('Risks', bind(App.el('textarea', { placeholder: 'What could kill this project? Name it before it names you.' }), gd.plan, 'risks')));
  }

  /* ----------------------------- 11. playtest ---------------------------- */
  function sPlaytest(panel, g, gd) {
    head(panel, 12, 'Playtests', 'What real people actually did — not what they said.',
      'Watch their hands and where they hesitate. Write down what happened, not your interpretation of it.');
    var host = App.el('div', {});
    function draw() {
      App.clear(host);
      if (!gd.playtest.length) host.append(App.el('p', { class: 'tiny muted' }, 'No playtests logged yet.'));
      gd.playtest.forEach(function (p, i) {
        var card = App.el('div', { class: 'card', style: { marginBottom: '.5rem' } },
          App.el('div', { class: 'row between' },
            App.el('div', { class: 'row', style: { gap: '.5rem', flex: '1' } },
              bind(App.el('input', { type: 'text', placeholder: 'Who / when' }), p, 'who'),
              bind(App.el('input', { type: 'text', placeholder: 'Build' }), p, 'build')),
            App.el('button', { class: 'link-btn', onclick: function () {
              gd.playtest.splice(i, 1); App.Store.save(); draw();
            } }, 'Remove')),
          App.field('What happened', bind(App.el('textarea', { style: { minHeight: '70px' }, placeholder: 'They died here. They never found the dodge. They skipped the tutorial text.' }), p, 'notes')),
          App.el('div', { class: 'field-row' },
            App.field('Top complaint', bind(App.el('input', { type: 'text' }), p, 'complaint')),
            App.field('What I will change', bind(App.el('input', { type: 'text' }), p, 'fix'))));
        host.append(card);
      });
    }
    draw();
    panel.append(host,
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn sm primary', onclick: function () {
          gd.playtest.unshift({ who: '', build: '', notes: '', complaint: '', fix: '' }); App.Store.save(); draw();
        } }, '+ Log a playtest')),
      App.el('div', { class: 'callout info' },
        App.el('div', { class: 'ct' }, 'The only rule of playtesting'),
        App.el('p', {}, 'Say nothing. Do not explain, do not hint, do not defend. Every time you explain something, you have found a bug in the game — not in the player.')));
  }

  /* ------------------------------- 12. cuts ------------------------------ */
  function sCuts(panel, g, gd) {
    head(panel, 13, 'Cut list', 'Features you decided not to build. This is progress, not failure.',
      'Keeping a written list stops cut features from sneaking back in three months later. It also gives you ideas for the next game.');
    var host = App.el('div', {});
    function draw() {
      App.clear(host);
      if (!gd.cuts.length) host.append(App.el('p', { class: 'tiny muted' }, 'Nothing cut yet — either you are very early, or you are about to make your life much harder than it needs to be.'));
      gd.cuts.forEach(function (c, i) {
        host.append(App.el('div', { class: 'card', style: { marginBottom: '.45rem', padding: '.6rem .8rem' } },
          App.el('div', { class: 'row', style: { gap: '.5rem' } },
            bind(App.el('input', { type: 'text', placeholder: 'The feature' }), c, 'what'),
            App.el('button', { class: 'link-btn', onclick: function () { gd.cuts.splice(i, 1); App.Store.save(); draw(); } }, 'Remove')),
          bind(App.el('input', { type: 'text', placeholder: 'Why it was cut' }), c, 'why')));
      });
    }
    draw();
    panel.append(host,
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn sm primary', onclick: function () {
          gd.cuts.unshift({ what: '', why: '' }); App.Store.save(); draw();
        } }, '+ Add a cut')),
      App.el('div', { class: 'callout good' },
        App.el('div', { class: 'ct' }, 'The 30% rule'),
        App.el('p', {}, 'When everything is finally in the game, cut the weakest 30% of it. Not because it is bad, but because half-finished features cost more to finish and polish than they add. Cutting is the highest-value thing a solo developer does.')));
  }

  /* ------------------------------- exports ------------------------------- */
  function resetSection(g) {
    var gd = g.gdd;
    App.confirm({ title: 'Clear this part?', body: 'This clears only the part you are looking at.', confirmText: 'Clear it', danger: true }).then(function (ok) {
      if (!ok) return;
      if (current === 'pitch') gd.concept = { pitch: '', genre: '', audience: '', hook: '', usp: '' };
      if (current === 'rules') gd.pillars = [{ t: '', d: '' }, { t: '', d: '' }, { t: '', d: '' }];
      if (current === 'loops') gd.loops = { micro: '', meso: '', macro: '' };
      if (current === 'numbers') gd.ledger = [];
      if (current === 'feel') gd.feel = { camera: '', feedback: '', controls: '', audio: '' };
      if (current === 'world') { gd.world = { rules: '', factions: '', notes: '' }; gd.characters = []; }
      if (current === 'art') gd.art = { palette: [], notes: '', shader: '' };
      if (current === 'mood') g.mood = { tiles: [] };
      if (current === 'tech') gd.tech = {};
      if (current === 'balance') gd.balance = { economy: '', difficulty: '', tuning: '' };
      if (current === 'plan') gd.plan = { milestones: [], risks: '' };
      if (current === 'playtest') gd.playtest = [];
      if (current === 'cuts') gd.cuts = [];
      App.Store.save();
      App.toast('Cleared.');
      App.renderRoute();
    });
  }

  function exportGDD(g) {
    var gd = g.gdd, c = gd.concept, L = App.data.labels[g.label];
    var out = [];
    out.push('# ' + g.title + (g.codename ? ' — “' + g.codename + '”' : ''));
    out.push('');
    out.push('*' + L.name + ' · ' + App.price(g.msrp) + ' · step ' + g.stage + ' of 10 (' + App.data.stages[g.stage - 1].name + ')*');
    out.push('');
    out.push('## The pitch');
    out.push('- **One sentence:** ' + (c.pitch || '—'));
    out.push('- **Kind of game:** ' + (c.genre || '—'));
    out.push('- **Who plays it:** ' + (c.audience || '—'));
    out.push('- **3-second moment:** ' + (c.hook || '—'));
    out.push('- **What makes it different:** ' + (c.usp || '—'));
    out.push('');
    out.push('## Three rules');
    gd.pillars.forEach(function (p, i) { out.push((i + 1) + '. **' + (p.t || '—') + '** — ' + (p.d || '')); });
    out.push('');
    out.push('## Core loops');
    out.push('- **3 seconds:** ' + (gd.loops.micro || '—'));
    out.push('- **10 minutes:** ' + (gd.loops.meso || '—'));
    out.push('- **Long term:** ' + (gd.loops.macro || '—'));
    out.push('');
    out.push('## Numbers');
    if (gd.ledger.length) {
      out.push('| Name | Formula | Notes |');
      out.push('| --- | --- | --- |');
      gd.ledger.forEach(function (r) { out.push('| ' + (r.name || '') + ' | ' + (r.formula || '') + ' | ' + (r.notes || '') + ' |'); });
    } else out.push('_nothing yet_');
    out.push('');
    out.push('## Game feel');
    out.push('- **Camera:** ' + (gd.feel.camera || '—'));
    out.push('- **Feedback:** ' + (gd.feel.feedback || '—'));
    out.push('- **Controls:** ' + (gd.feel.controls || '—'));
    out.push('- **Sound:** ' + (gd.feel.audio || '—'));
    out.push('');
    out.push('## World and characters');
    out.push('- **World rules:** ' + (gd.world.rules || '—'));
    out.push('- **Groups and tensions:** ' + (gd.world.factions || '—'));
    gd.characters.forEach(function (ch) { out.push('- **' + (ch.name || '?') + '** (' + (ch.role || '') + ', ' + (ch.shape || '') + '): ' + (ch.arc || '')); });
    out.push('');
    out.push('## Art direction');
    out.push('- **Palette:** ' + (gd.art.palette || []).join(', '));
    out.push('- **Style:** ' + (gd.art.notes || '—'));
    out.push('- **Shaders and effects:** ' + (gd.art.shader || '—'));
    out.push('');
    out.push('## Moodboard');
    var tiles = (g.mood && g.mood.tiles) || [];
    if (tiles.length) {
      tiles.forEach(function (t) {
        var detail = t.type === 'image'
          ? (t.imgId ? 'stored at full size' + (t.w ? ', ' + t.w + '×' + t.h : '') : t.url)
          : t.type === 'gradient' ? t.a + ' → ' + t.b
          : t.type === 'color' ? t.a
          : t.title || '';
        out.push('- _' + t.type + '_ — ' + detail + (t.caption ? '  (' + t.caption + ')' : ''));
      });
    } else out.push('_nothing pinned yet_');
    out.push('');
    out.push('## Technical limits');
    out.push('- Player triangles: ' + (gd.tech.trisHero || 0) + ' · Enemy triangles: ' + (gd.tech.trisEnemy || 0) +
      ' · Draw calls: ' + (gd.tech.drawCalls || 0) + ' · Texture memory: ' + (gd.tech.vramMB || 0) + ' MB · Target FPS: ' + (gd.tech.fps || 0));
    out.push('');
    out.push('## Balance');
    out.push('- **Economy:** ' + (gd.balance.economy || '—'));
    out.push('- **Difficulty:** ' + (gd.balance.difficulty || '—'));
    out.push('- **Tuning rules:** ' + (gd.balance.tuning || '—'));
    out.push('');
    out.push('## Build plan');
    gd.plan.milestones.forEach(function (m2) { out.push('- ' + (m2.name || '?') + ' — ' + (m2.weeks || 0) + ' weeks' + (m2.notes ? ' (' + m2.notes + ')' : '')); });
    out.push('- **Risks:** ' + (gd.plan.risks || '—'));
    out.push('');
    out.push('## Playtests');
    if (gd.playtest.length) {
      gd.playtest.forEach(function (p) {
        out.push('- **' + (p.who || '?') + '** (' + (p.build || '') + '): ' + (p.notes || '') +
          (p.complaint ? ' · Top complaint: ' + p.complaint : '') + (p.fix ? ' · Change: ' + p.fix : ''));
      });
    } else out.push('_nothing yet_');
    out.push('');
    out.push('## Cut list');
    if (gd.cuts.length) gd.cuts.forEach(function (c2) { out.push('- ' + (c2.what || '?') + ' — ' + (c2.why || '')); });
    else out.push('_nothing yet_');
    out.push('');
    out.push('---');
    out.push('_Made with SoloDev Studio — ' + App.today() + '_');

    App.presentExport('Design document — ' + g.title, App.slug(g.title) + '_design.md', out.join('\n'), 'text/markdown');
  }
})();
