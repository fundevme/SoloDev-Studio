/* ==========================================================================
   VIEW — MARKET (is there an audience, and what should it cost?)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  var tabs = ['summary', 'competitors', 'tags', 'price', 'wishlists', 'notes'];
  var currentTab = 'summary';

  App.views.market = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Market'),
          App.el('h1', { class: 'h1' }, 'Who else is out there')),
        App.el('div', { class: 'ph-actions' },
          App.el('button', { class: 'btn', onclick: function () { window.print(); } }, 'Print / PDF'))
      ));

      var g = App.gamePicker(root, params, '#/market/');
      if (!g) return;
      if (params && params[1] && tabs.indexOf(params[1]) >= 0) currentTab = params[1];

      root.append(App.el('div', { class: 'tabs' }, tabs.map(function (t) {
        return App.el('button', { class: currentTab === t ? 'on' : '', onclick: function () { currentTab = t; App.renderRoute(); } },
          { summary: 'Overview', competitors: 'Similar games', tags: 'Tags & keywords', price: 'Price', wishlists: 'Wishlists', notes: 'Notes' }[t]);
      })));

      var body = App.el('div', {});
      ({
        summary: tabSummary, competitors: tabCompetitors, tags: tabTags,
        price: tabPrice, wishlists: tabWishlists, notes: tabNotes
      }[currentTab])(body, g);
      root.append(body);
    }
  };

  /* ============================== SUMMARY ================================ */
  function tabSummary(root, g) {
    /* Only the games you added. The starter list is reference material. */
    var comps = trackedComps(g);
    var mine = g.market.tags || [];

    var prices = comps.map(function (c) { return Number(c.price) || 0; }).filter(Boolean);
    var reviews = comps.map(function (c) { return Number(c.reviews) || 0; }).filter(Boolean);
    var medPrice = App.median(prices);
    var medReviews = App.median(reviews);
    var est = estimateUnits(medReviews, g);
    var enough = comps.length >= 8;

    var wish = g.market.wishlists || [];
    var latestWish = wish.length ? wish[wish.length - 1].count : 0;
    var band = App.data.marketBands;

    root.append(App.el('div', { class: 'grid g4' },
      stat('Similar games tracked', String(comps.length),
        comps.length === 0 ? 'None added yet' : enough ? 'Good sample size' : 'Aim for 8 to 15', enough),
      stat('Middle price', medPrice ? App.price(medPrice) : '—', comps.length ? 'Half of them are cheaper' : 'Nothing to compare yet', false),
      stat('Middle review count', medReviews ? App.num(Math.round(medReviews)) : '—', comps.length ? 'The typical competitor' : 'Nothing to compare yet', false),
      stat('Wishlists now', latestWish ? App.num(latestWish) : '—',
        latestWish >= band.healthy ? 'Looking healthy' : latestWish >= band.invisible ? 'Below the visibility line' : 'Start building early', latestWish >= band.invisible)
    ));

    /* verdict */
    var verdicts = [];
    if (!comps.length) {
      verdicts.push({
        k: 'warn',
        t: 'You have not added any similar games yet',
        d: 'Numbers below come from your own research only — the starter list is there to copy from, not to count towards it. ' +
           'Open the Similar games tab and add the 8 to 15 games you would actually be compared to' +
           (hasStarterList(g) ? '.' : ', or start from the starter list and edit it.')
      });
    } else if (!enough) {
      verdicts.push({
        k: 'warn',
        t: 'You have not looked at enough similar games',
        d: 'You have added ' + comps.length + '. Eight to fifteen is the useful range. Fewer than that and you are guessing.'
      });
    }
    if (medReviews && medReviews > 0) {
      verdicts.push({ k: 'info', t: 'A typical competitor has around ' + App.num(Math.round(medReviews)) + ' reviews', d: 'At the middle multiplier for this genre that is roughly ' + App.num(Math.round(est.units)) + ' copies, or about ' + App.money(est.net) + ' after fees. Your realistic target is somewhere around there — not the top of the list.' });
    }
    if (medPrice && Number(g.msrp) > medPrice * 1.35) verdicts.push({ k: 'warn', t: 'You are priced well above the middle', d: 'Your price is ' + App.price(g.msrp) + ' and the middle of your comps is ' + App.price(medPrice) + '. That is allowed — but only if the game clearly looks better than they do.' });
    if (medPrice && Number(g.msrp) < medPrice * 0.7) verdicts.push({ k: 'warn', t: 'You may be undercharging', d: 'Indie games are usually priced too low, not too high. Consider whether ' + App.price(medPrice) + ' is a fairer reflection of your work.' });
    if (!mine.length) verdicts.push({ k: 'warn', t: 'No tags chosen yet', d: 'Tags decide which recommendation lists you can appear in. Go to the Tags tab.' });
    if (verdicts.length === 0) verdicts.push({ k: 'good', t: 'This looks like a reasonable position', d: 'Keep the comparison table updated as you learn more.' });

    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'What the numbers say')));
    verdicts.forEach(function (v) {
      root.append(App.el('div', { class: 'callout ' + (v.k === 'good' ? 'good' : v.k === 'warn' ? 'warn' : 'info') },
        App.el('div', { class: 'ct' }, v.t),
        App.el('p', {}, v.d)));
    });

    /* quick "should I make this" score */
    root.append(scoreCard(g, comps, medReviews));

    root.append(App.el('div', { class: 'callout plain' },
      App.el('div', { class: 'ct' }, 'How to use this page honestly'),
      App.el('ul', { class: 'tick small' },
        App.el('li', {}, 'Use the middle number, not the average. One hit can make the average meaningless.'),
        App.el('li', {}, 'Write down where every number came from. A number you cannot source is a wish.'),
        App.el('li', {}, 'Check the release year. Data from a quieter market is not evidence about today.'),
        App.el('li', {}, 'Read their bad reviews. That is where your opportunity is.'))));
  }

  function stat(k, v, s, good) {
    return App.el('div', { class: 'stat' + (good ? ' accent' : '') },
      App.el('div', { class: 'k' }, k),
      App.el('div', { class: 'v' }, v),
      App.el('div', { class: 's' }, s));
  }

  function scoreCard(g, comps, medReviews) {
    var trackedPrices = comps.map(function (c) { return Number(c.price) || 0; }).filter(Boolean);
    var middle = trackedPrices.length ? App.median(trackedPrices) : 0;
    var checks = [
      { t: 'At least 8 similar games tracked', ok: comps.length >= 8 },
      { t: 'The typical one has over 100 reviews', ok: medReviews >= 100 },
      { t: 'The typical one costs at least $4.99', ok: middle >= 4.99 },
      { t: 'At least 5 tags chosen', ok: (g.market.tags || []).length >= 5 },
      /* with nothing tracked yet there is no "lowest" to be above */
      { t: 'A price that is not the lowest', ok: trackedPrices.length > 0 && Number(g.msrp) >= middle },
      { t: 'The 3-second hook written down', ok: !!(g.gdd.concept.hook || '').trim() }
    ];
    var passed = checks.filter(function (c) { return c.ok; }).length;
    return App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Should you commit to this?'),
          App.el('p', { class: 'card-s' }, passed + ' of ' + checks.length + ' boxes ticked')),
        App.ring(passed / checks.length, 'ready', null, passed === checks.length ? 'var(--accent)' : 'var(--warn)')),
      App.el('div', { class: 'stack', style: { gap: '.35rem', marginTop: '.6rem' } }, checks.map(function (c) {
        return App.el('div', { class: 'row', style: { gap: '.5rem' } },
          App.el('span', { style: { color: c.ok ? 'var(--good)' : 'var(--ink-3)', fontWeight: '800' } }, c.ok ? '✓' : '○'),
          App.el('span', { class: 'small' }, c.t));
      })));
  }

  /* ============================ COMPETITORS ============================== */

  /* Only games you actually added. The starter list is a reference you can
     copy from — it is not your research, so it must not count towards how many
     comparable games you have looked at, or skew the averages. */
  function trackedComps(g) {
    var mine = (App.Store.data.comps || []).map(function (c) { return Object.assign({ seed: false }, c); });
    var gameSpecific = (g && g.market.comps)
      ? g.market.comps.map(function (c) { return Object.assign({ seed: false, mine: true }, c); })
      : [];
    return gameSpecific.concat(mine);
  }

  function hasStarterList(g) {
    return (g && g.market.comps || []).some(function (c) {
      return App.data.comps.some(function (s) { return s.title === c.title; });
    });
  }

  function tabCompetitors(root, g) {
    g.market.comps = g.market.comps || [];
    var host = App.el('div', {});

    function draw() {
      App.clear(host);
      var list = g.market.comps;

      host.append(App.el('div', { class: 'row between', style: { marginBottom: '.8rem', flexWrap: 'wrap' } },
        App.el('div', {},
          App.el('h2', { class: 'h2' }, 'Similar games'),
          App.el('p', { class: 'tiny muted' }, 'Only the ones you added for this project are listed. The starter list is below.')),
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm primary', onclick: function () { addComp(g, draw); } }, '+ Add a game'),
          App.el('button', { class: 'btn sm ghost', onclick: function () { importSeeds(g, draw); } }, 'Add the starter list'))));

      if (!list.length) {
        host.append(App.empty({
          title: 'No similar games yet',
          body: 'Add the 8 to 15 games you would be compared to. Look at their price, review count and the year they released.',
          action: App.el('button', { class: 'btn primary', onclick: function () { addComp(g, draw); } }, '+ Add the first one')
        }));
      } else {
        var wrap = App.el('div', { class: 'tbl-wrap' });
        var prices = list.map(function (c) { return Number(c.price) || 0; });
        var medPrice = App.median(prices);
        wrap.append(App.el('table', { class: 'tbl' },
          App.el('thead', {}, App.el('tr', {},
            App.el('th', {}, 'Game'), App.el('th', {}, 'Year'), App.el('th', {}, 'Price'),
            App.el('th', {}, 'Reviews'), App.el('th', {}, 'Rating'), App.el('th', {}, 'Est. sales'), App.el('th', {}, 'What it teaches'), App.el('th', {}, ''))),
          App.el('tbody', {}, list.map(function (c) {
            var est = estimateUnits(Number(c.reviews) || 0, g);
            return App.el('tr', {},
              App.el('td', { class: 'strong' }, c.title),
              App.el('td', {}, c.year || '—'),
              App.el('td', { class: Number(c.price) > medPrice ? 'num pos' : 'num' }, App.price(c.price)),
              App.el('td', { class: 'num' }, App.num(c.reviews)),
              App.el('td', { class: 'num' }, c.rating ? c.rating + '%' : '—'),
              App.el('td', { class: 'num' }, App.compact(est.units)),
              App.el('td', { style: { fontSize: '.78rem', maxWidth: '230px' } }, c.note || ''),
              App.el('td', {}, App.el('button', { class: 'link-btn', onclick: function () {
                g.market.comps = g.market.comps.filter(function (x) { return x !== c; });
                App.Store.save(); draw();
              } }, '✕')));
          }))));
        host.append(wrap);

        host.append(App.el('div', { class: 'grid g3', style: { marginTop: '1rem' } },
          stat('Middle price', App.price(App.median(prices)), 'Half are cheaper, half dearer', false),
          stat('Middle reviews', App.num(Math.round(App.median(list.map(function (c) { return c.reviews; })))), 'The typical competitor', false),
          stat('Your price', App.price(g.msrp), Number(g.msrp) >= App.median(prices) ? 'At or above the middle' : 'Below the middle — consider raising it', Number(g.msrp) >= App.median(prices))));

        var totalEst = list.reduce(function (a, c) { return a + estimateUnits(Number(c.reviews) || 0, g).units; }, 0);
        var top3 = list.slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 3);
        var top3share = totalEst ? top3.reduce(function (a, c) { return a + estimateUnits(Number(c.reviews) || 0, g).units; }, 0) / totalEst : 0;
        host.append(App.el('div', { class: 'callout ' + (top3share > 0.7 ? 'warn' : 'info') },
          App.el('div', { class: 'ct' }, 'How concentrated is this market?'),
          App.el('p', {}, 'The three biggest games here are about ' + Math.round(top3share * 100) + '% of all the estimated sales in your set. ' +
            (top3share > 0.7 ? 'That is very concentrated — a few games take almost everything. You need a clear reason to exist.' : 'That is reasonably spread out. There is room for a new game with a good hook.'))));
      }

      /* seed list */
      host.append(App.el('div', { class: 'section-head', style: { marginTop: '2rem' } },
        App.el('div', {},
          App.el('h2', { class: 'h2' }, 'Starter list'),
          App.el('p', { class: 'tiny muted' }, 'Well-known games with public numbers. Copy any that are relevant into your own list so you can add your own notes.')),
        App.el('button', { class: 'btn sm', onclick: function () { importSeeds(g, draw); } }, 'Add all of them')));

      var seedHost = App.el('div', { class: 'tbl-wrap' });
      seedHost.append(App.el('table', { class: 'tbl' },
        App.el('thead', {}, App.el('tr', {},
          App.el('th', {}, 'Game'), App.el('th', {}, 'Year'), App.el('th', {}, 'Tags'),
          App.el('th', {}, 'Price'), App.el('th', {}, 'Reviews'), App.el('th', {}, 'Team'), App.el('th', {}, 'What it teaches'))),
        App.el('tbody', {}, App.data.comps.map(function (c) {
          return App.el('tr', {},
            App.el('td', { class: 'strong' }, c.title),
            App.el('td', {}, c.year),
            App.el('td', { style: { fontSize: '.78rem' } }, c.tags),
            App.el('td', { class: 'num' }, App.price(c.price)),
            App.el('td', { class: 'num' }, App.num(c.reviews)),
            App.el('td', { style: { fontSize: '.78rem' } }, c.team),
            App.el('td', { style: { fontSize: '.78rem', maxWidth: '250px' } }, c.note));
        }))));
      host.append(seedHost);
    }
    draw();
    root.append(host);
  }

  function addComp(g, redraw) {
    var title = App.el('input', { type: 'text', placeholder: 'Game name' });
    var year = App.el('input', { type: 'number', placeholder: '2024', value: new Date().getFullYear() });
    var price = App.el('input', { type: 'number', step: '0.01', placeholder: '9.99' });
    var reviews = App.el('input', { type: 'number', placeholder: '1200' });
    var rating = App.el('input', { type: 'number', placeholder: '92' });
    var note = App.el('input', { type: 'text', placeholder: 'What does it teach you? Where is its weak spot?' });

    var m = App.modal({
      title: 'Add a similar game', wide: true,
      body: App.el('div', {},
        App.el('div', { class: 'field-row' }, App.field('Name', title), App.field('Year', year)),
        App.el('div', { class: 'field-row' }, App.field('Price', price), App.field('Reviews', reviews, 'The number on the store page'), App.field('Rating %', rating)),
        App.field('What it teaches', note),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            if (!title.value.trim()) { App.toast('Give it a name.', 'warn'); return; }
            g.market.comps.push({
              title: title.value.trim(), year: Number(year.value) || '', price: Number(price.value) || 0,
              reviews: Number(reviews.value) || 0, rating: Number(rating.value) || 0, note: note.value
            });
            App.Store.save(); m.close(); redraw();
          } }, 'Add'))
      )
    });
  }

  function importSeeds(g, redraw) {
    g.market.comps = g.market.comps || [];
    App.data.comps.forEach(function (c) {
      if (g.market.comps.some(function (x) { return x.title === c.title; })) return;
      g.market.comps.push({ title: c.title, year: c.year, price: c.price, reviews: c.reviews, rating: c.rating, note: c.note });
    });
    App.Store.save();
    App.toast('Added.');
    redraw();
  }

  /* ================================ TAGS ================================= */
  function tabTags(root, g) {
    g.market.tags = g.market.tags || [];
    var input = App.el('input', { type: 'text', placeholder: 'Type a tag and press Enter' });
    var heat = App.el('select', {}, [['huge', 'Huge audience'], ['high', 'Big audience'], ['medium', 'Medium'], ['niche', 'Small but keen']].map(function (h) {
      return App.el('option', { value: h[0] }, h[1]);
    }));

    function add() {
      var v = input.value.trim();
      if (!v) return;
      if (g.market.tags.length >= 10) { App.toast('Steam only shows five. Ten is already more than you need.', 'warn'); return; }
      if (!g.market.tags.some(function (t) { return t.tag.toLowerCase() === v.toLowerCase(); })) {
        g.market.tags.push({ tag: v, heat: heat.value, mine: true });
        App.Store.save();
      }
      input.value = '';
      App.renderRoute();
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });

    root.append(
      App.el('div', { class: 'callout info' },
        App.el('div', { class: 'ct' }, 'Why tags decide everything'),
        App.el('p', {}, 'Steam uses your tags to decide which lists to put you in, and those lists are most of your discoverability. Pick the five tags your direct competitors use — not the ones that describe the game best.')),
      App.el('div', { class: 'card pad' },
        App.el('h3', { class: 'card-t' }, 'Your five tags'),
        App.el('p', { class: 'card-s', style: { marginBottom: '.7rem' } }, 'Put the most important one first. Copy them straight into Steamworks in this order.'),
        App.el('div', { class: 'pill-row', style: { marginBottom: '.8rem', minHeight: '2rem' } },
          g.market.tags.length ? g.market.tags.map(function (t, i) {
            var known = App.data.steamTags.filter(function (s) { return s.tag.toLowerCase() === String(t.tag).toLowerCase(); })[0];
            return App.el('span', { class: 'chip' },
              App.el('span', { class: 'badge gray' }, String(i + 1)),
              t.tag,
              known ? App.el('span', { class: 'tiny muted' }, known.reviews + ' reviews') : null,
              App.el('button', { class: 'link-btn', style: { marginLeft: '.3rem' }, onclick: function () {
                g.market.tags.splice(i, 1); App.Store.save(); App.renderRoute();
              } }, '✕'));
          }) : App.el('span', { class: 'tiny muted' }, 'No tags yet.')),
        App.el('div', { class: 'btn-row' }, input, heat, App.el('button', { class: 'btn primary', onclick: add }, 'Add tag')),
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm ghost', onclick: function () {
            var common = App.data.steamTags.slice(0, 5).map(function (s) { return { tag: s.tag, heat: s.heat, mine: true }; });
            g.market.tags = common; App.Store.save(); App.renderRoute();
          } }, 'Use the most popular five'))),
      App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'What people search for')),
      App.el('p', { class: 'tiny muted' }, 'Approximate total reviews in each tag — a rough measure of how many players are already there. Bigger is easier to be found in, and harder to stand out in.'),
      tagTable(g)
    );
  }

  function tagTable(g) {
    var mine = (g.market.tags || []).map(function (t) { return String(t.tag).toLowerCase(); });
    var wrap = App.el('div', { class: 'tbl-wrap' });
    wrap.append(App.el('table', { class: 'tbl' },
      App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'Tag'), App.el('th', {}, 'Approx. reviews'), App.el('th', {}, 'Size'), App.el('th', {}, ''))),
      App.el('tbody', {}, App.data.steamTags.map(function (s) {
        var has = mine.indexOf(s.tag.toLowerCase()) >= 0;
        return App.el('tr', { style: has ? { background: 'var(--accent-soft)' } : null },
          App.el('td', { class: 'strong' }, s.tag),
          App.el('td', { class: 'num' }, s.reviews),
          App.el('td', {}, App.el('span', { class: 'badge ' + (s.heat === 'huge' ? 'lc' : s.heat === 'high' ? 'lb' : s.heat === 'medium' ? 'la' : 'gray') }, s.heat)),
          App.el('td', {}, has
            ? App.el('span', { class: 'badge good' }, 'chosen')
            : App.el('button', { class: 'link-btn', onclick: function () {
              g.market.tags = g.market.tags || [];
              g.market.tags.push({ tag: s.tag, heat: s.heat, mine: true });
              App.Store.save(); App.renderRoute();
            } }, 'Use')));
      }))));
    return wrap;
  }

  /* =============================== PRICE ================================= */
  function tabPrice(root, g) {
    /* your own research only */
    var comps = trackedComps(g).filter(function (c) { return Number(c.price) > 0; });
    var prices = comps.map(function (c) { return Number(c.price); }).sort(function (a, b) { return a - b; });

    var mineInput = App.el('input', { type: 'number', step: '0.01', value: g.msrp });
    var units = App.el('input', { type: 'number', value: 3000, step: '100' });
    var out = App.el('div', { class: 'card pad', style: { background: 'var(--surface-2)' } });

    function calc() {
      var price = Number(mineInput.value) || 0;
      var s = App.Store.data.settings;
      var net = price * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var u = Number(units.value) || 0;
      App.clear(out);
      out.append(
        App.outRow('You keep per copy', App.money(net, { exact: true })),
        App.outRow('Net from ' + App.num(u) + ' copies', App.money(net * u)),
        App.outRow('Copies for $15,000', net > 0 ? App.num(Math.ceil(15000 / net)) : '—', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          'Using regional pricing ' + s.regionalBlend + ', refunds ' + s.refundRate + ', tax ' + s.taxRate + ' and the platform cut ' + s.steamCut + '. Change these in the Vault.')
      );
    }
    mineInput.addEventListener('input', calc);
    units.addEventListener('input', calc);

    var band = App.el('div', {});
    function bandDraw() {
      App.clear(band);
      if (!prices.length) { band.append(App.el('p', { class: 'tiny muted' }, 'Add some similar games first.')); return; }
      var lo = prices[Math.floor(prices.length * 0.75)];
      var hi = prices[prices.length - 1];
      var me = Number(mineInput.value) || 0;
      band.append(
        App.el('div', { class: 'row between' }, App.el('span', { class: 'tiny muted' }, App.price(prices[0])), App.el('span', { class: 'tiny muted' }, App.price(prices[prices.length - 1]))),
        App.el('div', { style: { position: 'relative', height: '40px', margin: '.4rem 0 .6rem' } },
          App.el('div', { style: { position: 'absolute', top: '14px', left: '0', right: '0', height: '10px', background: 'var(--surface-3)', borderRadius: '99px' } }),
          App.el('div', { style: {
            position: 'absolute', top: '14px', height: '10px', borderRadius: '99px', background: 'var(--accent-soft)',
            left: ((prices[0] / prices[prices.length - 1]) * 100) + '%',
            width: (((lo - prices[0]) / (prices[prices.length - 1] - prices[0] || 1)) * 100) + '%'
          } }),
          App.el('div', { style: {
            position: 'absolute', top: '6px', width: '3px', height: '26px', background: 'var(--warm)', borderRadius: '2px',
            left: App.clamp((me / (prices[prices.length - 1] || 1)) * 100, 0, 100) + '%'
          } }),
          prices.map(function (p) {
            return App.el('div', {
              title: App.price(p),
              style: {
                position: 'absolute', bottom: '0', width: '7px', height: '7px', borderRadius: '50%',
                background: 'var(--ink-3)', left: App.clamp((p / (prices[prices.length - 1] || 1)) * 100, 0, 100) + '%', transform: 'translateX(-50%)'
              }
            });
          })),
        App.el('div', { class: 'row between', style: { marginTop: '.2rem' } },
          App.el('span', { class: 'small' }, 'Your price: ' + App.price(me)),
          App.el('span', { class: 'small muted' }, 'Top quarter starts at ' + App.price(lo))),
        App.el('div', { class: 'callout ' + (me >= lo ? 'good' : 'warn') },
          App.el('div', { class: 'ct' }, me >= lo ? 'Priced at the top end' : 'Priced below the top end'),
          App.el('p', {}, me >= lo
            ? 'You are in the top quarter of similar games. Good — as long as it looks like it belongs there.'
            : 'Most indie games are underpriced. You could charge ' + App.price(lo) + ' and still be in the top quarter of your comparable games.'))
      );
    }
    bandDraw();
    mineInput.addEventListener('input', bandDraw);

    root.append(
      App.el('div', { class: 'grid g2' },
        App.el('div', { class: 'card pad' },
          App.el('div', { class: 'kicker' }, 'Price check'),
          App.el('h3', { class: 'card-t' }, 'Where your price sits'),
          App.el('p', { class: 'card-s', style: { marginBottom: '.8rem' } }, 'Compared with every similar game in the tracker.'),
          App.field('Your price', mineInput),
          band),
        App.el('div', { class: 'card pad' },
          App.el('div', { class: 'kicker' }, 'What you keep'),
          App.el('h3', { class: 'card-t' }, 'Price to money'),
          App.el('p', { class: 'card-s', style: { marginBottom: '.8rem' } }, 'The headline price is not what you get.'),
          App.field('Copies sold', units),
          out)),
      App.el('div', { class: 'callout info', style: { marginTop: '1rem' } },
        App.el('div', { class: 'ct' }, 'The pricing rule that works'),
        App.el('p', {}, 'Price at the top of games of similar quality, never the bottom. Then earn it by making the game feel deep. A $6.99 game that looks like a $6.99 game always loses to a $14.99 game that looks like a $14.99 game.')));
  }

  /* ============================== WISHLISTS ============================== */
  function tabWishlists(root, g) {
    g.market.wishlists = g.market.wishlists || [];
    var count = App.el('input', { type: 'number', placeholder: 'Current wishlist total', step: '1' });
    var date = App.el('input', { type: 'date', value: App.today() });

    function add() {
      var c = Number(count.value);
      if (!c) { App.toast('Enter the number first.', 'warn'); return; }
      var d = date.value || App.today();
      g.market.wishlists = g.market.wishlists.filter(function (w) { return w.date !== d; });
      g.market.wishlists.push({ date: d, count: c });
      g.market.wishlists.sort(function (a, b) { return a.date.localeCompare(b.date); });
      count.value = '';
      App.Store.save();
      App.renderRoute();
    }

    var list = g.market.wishlists;
    var latest = list.length ? list[list.length - 1] : null;
    var band = App.data.marketBands;

    var body = App.el('div', {});
    if (list.length >= 2) {
      var first = list[0], last = list[list.length - 1];
      var days = Math.max(1, App.daysBetween(first.date, last.date));
      var perDay = (last.count - first.count) / days;
      var last7 = null;
      for (var i = list.length - 1; i >= 0; i--) {
        if (App.daysBetween(list[i].date, last.date) >= 7) { last7 = (last.count - list[i].count) / Math.max(1, App.daysBetween(list[i].date, last.date)); break; }
      }
      body.append(App.el('div', { class: 'grid g4' },
        stat('Wishlists now', App.num(last.count), latest.date, last.count >= band.invisible),
        stat('Per day since the start', (perDay >= 0 ? '+' : '') + perDay.toFixed(1), days + ' days recorded', perDay > 0),
        last7 != null ? stat('Per day, last week', (last7 >= 0 ? '+' : '') + last7.toFixed(1), last7 >= perDay ? 'Speeding up' : 'Slowing down', last7 >= 0) : null,
        stat('Distance to 7,000', last.count >= band.invisible ? 'Past it' : App.num(band.invisible - last.count), 'The rough visibility line', last.count >= band.invisible)));

      body.append(App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('div', { class: 'row between' },
          App.el('h3', { class: 'card-t' }, 'Growth'),
          App.el('span', { class: 'tiny muted' }, list.length + ' entries')),
        App.spark(list.map(function (w) { return w.count; }), {}),
        App.el('div', { class: 'row between', style: { marginTop: '.4rem' } },
          App.el('span', { class: 'tiny muted' }, App.fmtDate(first.date, 'short')),
          App.el('span', { class: 'tiny muted' }, App.fmtDate(last.date, 'short')))));

      var health = last.count >= band.strong ? { k: 'good', t: 'Strong position', d: 'You are well past the point where the platform will show you to people.' }
        : last.count >= band.healthy ? { k: 'info', t: 'A real launch', d: 'Keep the momentum. Festivals and creator coverage are worth chasing now.' }
        : last.count >= band.invisible ? { k: 'warn', t: 'Below the visibility line', d: 'Launching now would probably be quiet. Keep building the audience and consider delaying.' }
        : { k: 'bad', t: 'Very early', d: 'That is fine — but do not launch yet. Getting the store page in front of the right people is the whole job right now.' };
      body.append(App.el('div', { class: 'callout ' + health.k }, App.el('div', { class: 'ct' }, health.t), App.el('p', {}, health.d)));

      /* simple projection */
      var target = App.data.marketBands.healthy;
      if (last.count < target && perDay > 0) {
        var daysToTarget = Math.ceil((target - last.count) / perDay);
        body.append(App.el('div', { class: 'callout plain' },
          App.el('div', { class: 'ct' }, 'At this speed'),
          App.el('p', {}, 'You would reach ' + App.num(target) + ' wishlists in about ' + daysToTarget + ' days (' + App.fmtDate(App.addDays(App.today(), daysToTarget), 'month') + ') — if nothing changes. Festivals, a good clip or creator coverage will change it. Nothing is guaranteed.')));
      }
    } else {
      body.append(App.empty({
        title: 'Track your wishlists',
        body: 'Write the number down once a week. The total matters far less than whether it is going up.',
        ico: 'M12 3v18|M5 10l7-7 7 7'
      }));
    }

    body.append(App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
      App.el('h3', { class: 'card-t' }, 'Add this week'),
      App.el('div', { class: 'btn-row' }, App.field('Total wishlists', count, 'From the Steamworks wishlist report'), App.field('Date', date),
        App.el('button', { class: 'btn primary', style: { marginBottom: '.8rem' }, onclick: add }, 'Save'))));

    if (list.length) {
      var wrap = App.el('div', { class: 'tbl-wrap', style: { marginTop: '1rem' } });
      wrap.append(App.el('table', { class: 'tbl', style: { minWidth: '300px' } },
        App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'Date'), App.el('th', {}, 'Wishlists'), App.el('th', {}, 'Change'), App.el('th', {}, ''))),
        App.el('tbody', {}, list.slice().reverse().map(function (w, i, arr) {
          var prev = arr[i + 1];
          var delta = prev ? w.count - prev.count : null;
          return App.el('tr', {},
            App.el('td', {}, App.fmtDate(w.date)),
            App.el('td', { class: 'num' }, App.num(w.count)),
            App.el('td', { class: 'num ' + (delta == null ? '' : delta >= 0 ? 'pos' : 'neg') }, delta == null ? '—' : (delta >= 0 ? '+' : '') + App.num(delta)),
            App.el('td', {}, App.el('button', { class: 'link-btn', onclick: function () {
              g.market.wishlists = g.market.wishlists.filter(function (x) { return x !== w; });
              App.Store.save(); App.renderRoute();
            } }, '✕')));
        }))));
      body.append(wrap);
    }

    root.append(body);
  }

  /* ================================ NOTES ================================ */
  function tabNotes(root, g) {
    var notes = App.el('textarea', { style: { minHeight: '200px' }, placeholder: 'What did you learn? Who is the audience? What are they complaining about in the games that already exist? What can you do better?' }, g.market.notes || '');
    notes.addEventListener('input', App.debounce(function () { g.market.notes = notes.value; App.Store.save(); }, 400));
    var audience = App.el('input', { type: 'text', value: g.market.audience || '', placeholder: 'e.g. People who play survivors-likes on a Steam Deck after work' });
    audience.addEventListener('input', App.debounce(function () { g.market.audience = audience.value; App.Store.save(); }, 400));

    var hookHost = App.el('div', {});
    function drawHooks() {
      App.clear(hookHost);
      (g.market.hooks || []).forEach(function (h, i) {
        hookHost.append(App.el('div', { class: 'row between', style: { padding: '.35rem 0', borderBottom: '1px dashed var(--line)', gap: '.5rem' } },
          App.el('span', { class: 'small' }, h.text),
          App.el('div', { class: 'row', style: { gap: '.3rem' } },
            App.el('span', { class: 'badge ' + (h.rating === 'good' ? 'good' : h.rating === 'bad' ? 'bad' : 'gray') }, h.rating || 'untested'),
            App.el('button', { class: 'link-btn', onclick: function () {
              h.rating = h.rating === 'good' ? 'bad' : h.rating === 'bad' ? 'good' : 'good';
              App.Store.save(); drawHooks();
            } }, 'Toggle'),
            App.el('button', { class: 'link-btn', onclick: function () {
              g.market.hooks.splice(i, 1); App.Store.save(); drawHooks();
            } }, '✕'))));
      });
      if (!(g.market.hooks || []).length) hookHost.append(App.el('p', { class: 'tiny muted' }, 'No hooks written down yet.'));
    }
    drawHooks();

    var hookInput = App.el('input', { type: 'text', placeholder: 'Write a hook line as you would post it' });
    hookInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var v = hookInput.value.trim();
      if (!v) return;
      g.market.hooks = g.market.hooks || [];
      g.market.hooks.push({ text: v, rating: 'good' });
      hookInput.value = '';
      App.Store.save(); drawHooks();
    });

    root.append(
      App.el('div', { class: 'card pad' },
        App.el('h3', { class: 'card-t' }, 'Who this is for'),
        App.el('p', { class: 'card-s' }, 'One sentence. If it is everyone, it is no one.'),
        audience),
      App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('h3', { class: 'card-t' }, 'Hook lines'),
        App.el('p', { class: 'card-s' }, 'Write the line you would post. Then mark the ones that feel true.'),
        hookInput, hookHost),
      App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('h3', { class: 'card-t' }, 'Research notes'),
        App.el('p', { class: 'card-s' }, 'Reviews of similar games are the most useful research you can do. Read the negative ones first.'),
        notes));
  }

  /* ============================== HELPERS ================================ */
  function estimateUnits(reviews, g) {
    var mult = 34;
    var found = App.data.reviewMultipliers.filter(function (m) { return m.id === 'roguelite'; })[0];
    if (found) mult = found.mult;
    /* nudge by the game's own tag choices if any */
    var tags = ((g && g.market.tags) || []).map(function (t) { return String(t.tag).toLowerCase(); });
    if (tags.indexOf('turn-based tactics') >= 0 || tags.indexOf('tactical rpg') >= 0) mult = 24;
    else if (tags.indexOf('story rich') >= 0 || tags.indexOf('jrpg') >= 0) mult = 30;
    else if (tags.indexOf('visual novel') >= 0) mult = 40;
    else if (tags.indexOf('idler') >= 0 || tags.indexOf('rhythm') >= 0) mult = 50;
    var units = reviews * mult;
    var s = App.Store.data.settings;
    var netPer = (Number(g && g.msrp) || 9.99) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
    return { units: units, net: units * netPer, mult: mult };
  }
})();
