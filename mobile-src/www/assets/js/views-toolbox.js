/* ==========================================================================
   VIEW — TOOLBOX (ten calculators + the standing checklists)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  var GROUPS = [
    { id: 'money', label: 'Money' },
    { id: 'scope', label: 'Time and scope' },
    { id: 'market', label: 'Price and market' },
    { id: 'ads', label: 'Advertising' },
    { id: 'lists', label: 'Checklists' }
  ];
  var group = 'money';

  App.views.toolbox = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Toolbox'),
          App.el('h1', { class: 'h1' }, 'Check the numbers')),
        App.el('div', { class: 'ph-actions' },
          App.el('button', { class: 'btn', onclick: function () { window.print(); } }, 'Print / PDF'))));

      if (params && params[0] && GROUPS.some(function (g) { return g.id === params[0]; })) group = params[0];

      root.append(App.el('div', { class: 'tabs' }, GROUPS.map(function (g) {
        return App.el('button', { class: group === g.id ? 'on' : '', onclick: function () { group = g.id; App.renderRoute(); } }, g.label);
      })));

      var body = App.el('div', { class: 'grid g2' });
      if (group === 'money') { body.append(netRevenue(), breakEven(), runway(), discountLadder()); }
      if (group === 'scope') { body.append(scopeCheck(), timeToFinish(), featureValue()); }
      if (group === 'market') { body.append(compSales(), pricePicker(), wishlistFunnel(), tagSaturation()); }
      if (group === 'ads') { body.append(adReturn(), cpmToSales()); }
      root.append(body);

      if (group === 'lists') {
        App.clear(body);
        body.className = '';
        body.append(App.el('div', { class: 'callout info' },
          App.el('div', { class: 'ct' }, 'These stay ticked between sessions'),
          App.el('p', {}, 'They apply to every project. Each project also has its own checklist on the Plan page.')));
        App.data.globalChecklists.forEach(function (c) {
          App.bindChecklist(body, 'global:' + c.id, c.title, c.items);
        });
      }

      root.append(App.el('div', { class: 'callout warn', style: { marginTop: '1.4rem' } },
        App.el('div', { class: 'ct' }, 'These are estimates, not promises'),
        App.el('p', {}, 'Every calculator here is a planning model built from historical ranges and public platform data. Change the numbers to run a pessimistic and an optimistic version. Never bet money on a single estimate — especially not the good one.')));
    }
  };

  /* ------------------------------ helpers -------------------------------- */
  function card(kicker, title, sub, fields, out) {
    return App.el('div', { class: 'card pad' },
      App.el('div', { class: 'kicker' }, kicker),
      App.el('h3', { class: 'card-t' }, title),
      App.el('p', { class: 'card-s', style: { marginBottom: '.8rem' } }, sub),
      fields, out);
  }
  function out() { return App.el('div', { class: 'card', style: { background: 'var(--surface-2)', marginTop: '.6rem', padding: '.85rem 1rem' } }); }
  function num(v, step, min) { return App.el('input', { type: 'number', value: v, step: step || 'any', min: min }); }
  function wire(inputs, fn) { inputs.forEach(function (i) { i.addEventListener('input', fn); i.addEventListener('change', fn); }); fn(); }
  function settings() { return App.Store.data.settings; }

  /* ============================ 1. NET REVENUE =========================== */
  function netRevenue() {
    var s = settings();
    var msrp = num(6.99, '0.01'), units = num(5000, '1');
    var geo = num(s.regionalBlend, '0.01'), refund = num(s.refundRate, '0.01');
    var tax = num(s.taxRate, '0.01'), valve = num(s.steamCut, '0.01');
    var o = out();
    wire([msrp, units, geo, refund, tax, valve], function () {
      var per = (Number(msrp.value) || 0) * Number(geo.value) * (1 - Number(refund.value)) * (1 - Number(tax.value)) * (1 - Number(valve.value));
      var total = per * (Number(units.value) || 0);
      App.clear(o);
      o.append(
        App.outRow('You keep per copy', App.money(per, { exact: true })),
        App.outRow('Of the price, that is', (Number(msrp.value) ? Math.round((per / Number(msrp.value)) * 100) : 0) + '%'),
        App.outRow('Net from ' + App.num(Number(units.value)) + ' copies', App.money(total, { exact: true })),
        App.outRow('Net from 10,000 copies', App.money(per * 10000), true));
    });
    return card('Money 1', 'What you keep from each sale',
      'The price on the page is not what reaches you. This is the real number.',
      App.el('div', { class: 'field-row' },
        App.field('Price', msrp), App.field('Copies sold', units),
        App.field('Regional blend', geo, '0.68–0.72 is typical'),
        App.field('Refunds', refund, '0.08–0.12'),
        App.field('Tax', tax, '0.08–0.12'),
        App.field('Platform cut', valve, '0.30 is standard')),
      o);
  }

  /* ============================= 2. BREAK-EVEN =========================== */
  function breakEven() {
    var goal = num(15000, '100'), msrp = num(6.99, '0.01'), other = num(0, '100');
    var o = out();
    wire([goal, msrp, other], function () {
      var s = settings();
      var per = (Number(msrp.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var need = (Number(goal.value) || 0) + (Number(other.value) || 0);
      var copies = per > 0 ? Math.ceil(need / per) : 0;
      App.clear(o);
      o.append(
        App.outRow('You keep per copy', App.money(per, { exact: true })),
        App.outRow('Total you need', App.money(need, { exact: true })),
        App.outRow('Copies to break even', App.num(copies) + ' copies', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          copies > 10000 ? 'That is a lot for a small game. Consider a smaller goal, a higher price, or a cheaper project.' :
          copies > 3000 ? 'Realistic for a small game with a decent launch and a festival.' :
          'Very achievable if the game gets any traction at all.'));
    });
    return card('Money 2', 'How many copies to break even',
      'Set what you need to earn, including anything you have already spent.',
      App.el('div', { class: 'field-row' },
        App.field('What you need to earn', goal, 'Your target profit'),
        App.field('Price', msrp),
        App.field('Already spent', other, 'Software, assets, festival fees')),
      o);
  }

  /* ============================== 3. RUNWAY ============================== */
  function runway() {
    var savings = num(6000, '100'), monthly = num(1500, '50'), income = num(0, '100');
    var weeks = num(30, '1');
    var o = out();
    wire([savings, monthly, income, weeks], function () {
      var net = (Number(monthly.value) || 0) - (Number(income.value) || 0);
      var months = net > 0 ? (Number(savings.value) || 0) / net : Infinity;
      var weeksAvailable = months === Infinity ? Infinity : Math.floor(months * 4.33);
      var needed = Number(weeks.value) || 0;
      App.clear(o);
      o.append(
        App.outRow('Money going out each month', App.money(Number(monthly.value) || 0, { exact: true })),
        App.outRow('Money coming in each month', App.money(Number(income.value) || 0, { exact: true })),
        App.outRow('Months of runway', months === Infinity ? 'No limit' : months.toFixed(1) + ' months'),
        App.outRow('Weeks you can work', weeksAvailable === Infinity ? 'No limit' : weeksAvailable + ' weeks', true),
        App.el('div', { class: 'callout ' + (weeksAvailable >= needed * 1.25 ? 'good' : weeksAvailable >= needed ? 'warn' : 'bad'), style: { marginTop: '.6rem', marginBottom: 0 } },
          App.el('div', { class: 'ct' }, weeksAvailable >= needed * 1.25 ? 'You have room' : weeksAvailable >= needed ? 'Very tight' : 'This does not fit'),
          App.el('p', {}, weeksAvailable === Infinity
            ? 'You have other income covering your costs, so time is the only constraint.'
            : 'You need ' + needed + ' weeks and you have about ' + weeksAvailable + '. ' +
              (weeksAvailable >= needed * 1.25 ? 'The 25% buffer is intact. Good.'
                : weeksAvailable >= needed ? 'There is no buffer. One delay and you are in trouble.'
                : 'That is a shortfall of about ' + (needed - weeksAvailable) + ' weeks. Cut the scope or extend the runway before you start.'))));
    });
    return card('Money 3', 'How long can you keep going?',
      'The most important number in solo development, and the one nobody works out first.',
      App.el('div', { class: 'field-row' },
        App.field('Savings you can spend', savings),
        App.field('Costs each month', monthly, 'Rent, food, bills'),
        App.field('Other income each month', income, 'Day job, freelance, other games'),
        App.field('Weeks the project needs', weeks)),
      o);
  }

  /* ========================== 4. DISCOUNT LADDER ========================= */
  function discountLadder() {
    var msrp = num(9.99, '0.01'), launch = num(10, '1');
    var o = out();
    wire([msrp, launch], function () {
      var s = settings();
      function netAt(disc) {
        var p = (Number(msrp.value) || 0) * (1 - disc / 100);
        return p * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      }
      var rows = [
        ['Launch', Number(launch.value) || 0],
        ['Month 3', 20], ['Month 6', 25], ['Month 12', 33], ['Month 18', 50], ['Year 2+', 66]
      ];
      App.clear(o);
      o.append(App.el('table', { class: 'tbl', style: { minWidth: '0' } },
        App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'When'), App.el('th', {}, 'Off'), App.el('th', {}, 'They pay'), App.el('th', {}, 'You get'))),
        App.el('tbody', {}, rows.map(function (r) {
          return App.el('tr', {},
            App.el('td', { class: 'strong' }, r[0]),
            App.el('td', { class: 'num' }, r[1] + '%'),
            App.el('td', { class: 'num' }, App.money((Number(msrp.value) || 0) * (1 - r[1] / 100), { exact: true })),
            App.el('td', { class: 'num' }, App.money(netAt(r[1]), { exact: true })));
        }))));
      o.append(App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
        'Steam will not allow a discount within 30 days of your last one. Plan the whole ladder before launch — the table above is the standard shape.'));
    });
    return card('Money 4', 'The discount ladder',
      'Decide all your discounts now, so you never panic-discount later.',
      App.el('div', { class: 'field-row' }, App.field('Price', msrp), App.field('Launch discount (%)', launch)),
      o);
  }

  /* =========================== 5. SCOPE CHECK ============================ */
  function scopeCheck() {
    var playtime = num(20, '1'), authored = num(4, '0.5'), weeks = num(10, '1'), weekly = num(30, '1'), effort = num(140, '5');
    var o = out();
    wire([playtime, authored, weeks, weekly, effort], function () {
      var ratio = (Number(authored.value) || 0) > 0 ? (Number(playtime.value) || 0) / Number(authored.value) : 0;
      var capacity = (Number(weeks.value) || 0) * (Number(weekly.value) || 0);
      var needed = (Number(effort.value) || 0) * 1.25;
      var fits = needed <= capacity;
      App.clear(o);
      o.append(
        App.outRow('Hours of play per hour built', ratio.toFixed(1) + '×'),
        App.outRow('Verdict', ratio >= 3 ? 'Systems-driven — good for one person' : ratio >= 1.5 ? 'Workable, but watch it' : 'Hand-made content heavy — risky alone'),
        App.outRow('Hours you need (with 25% buffer)', Math.round(needed) + ' h'),
        App.outRow('Hours you have', Math.round(capacity) + ' h'),
        App.outRow(fits ? 'It fits ✓' : 'It does not fit ✗', '', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          fits ? 'There is about ' + Math.round(capacity - needed) + ' hours of slack.' : 'Cut about ' + Math.round(needed - capacity) + ' hours of work, or add ' + Math.ceil((needed - capacity) / (Number(weekly.value) || 30)) + ' weeks.'));
    });
    return card('Scope 1', 'Will it fit in the time I have?',
      'The content ratio plus the 25% buffer. If it does not fit here, it will not fit in real life.',
      App.el('div', { class: 'field-row' },
        App.field('Hours of play you are promising', playtime),
        App.field('Hours of content you must build', authored, 'Levels, cutscenes, hand-made set pieces'),
        App.field('Weeks available', weeks),
        App.field('Hours you work a week', weekly),
        App.field('Your effort estimate', effort, 'Everything, in hours')),
      o);
  }

  /* ========================= 6. TIME TO FINISH =========================== */
  function timeToFinish() {
    var features = App.el('textarea', { placeholder: 'One feature per line. e.g.\nSave system\n4 enemy types\nBoss fight\nShop UI', style: { minHeight: '110px' } });
    var slower = num(1.4, '0.1');
    var daysPerFeature = num(4, '0.5');
    var hoursWeek = num(20, '1');
    var o = out();
    function calc() {
      var lines = features.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var n = lines.length;
      var fastest = n * (Number(daysPerFeature.value) || 0) * 8;
      var realistic = fastest * (Number(slower.value) || 1.4);
      var weeks = (Number(hoursWeek.value) || 1) > 0 ? realistic / Number(hoursWeek.value) : 0;
      App.clear(o);
      o.append(
        App.outRow('Features listed', String(n)),
        App.outRow('Best case (your estimate)', Math.round(fastest) + ' hours'),
        App.outRow('Realistic (×' + slower.value + ')', Math.round(realistic) + ' hours'),
        App.outRow('That is about', weeks.toFixed(1) + ' weeks at ' + hoursWeek.value + ' h/week', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } }, 'The multiplier matters more than the estimate. Things always take longer than you think — the question is how much longer, and whether you have planned for it.'));
    }
    wire([slower, daysPerFeature, hoursWeek], calc);
    features.addEventListener('input', App.debounce(calc, 300));
    calc();
    return card('Scope 2', 'How long will this actually take?',
      'List every feature, one per line. Then multiply your estimate by how optimistic you usually are.',
      App.el('div', {},
        App.field('Features', features),
        App.el('div', { class: 'field-row' },
          App.field('Optimism multiplier', slower, '1 = you are always right'),
          App.field('Days per feature', daysPerFeature),
          App.field('Hours a week', hoursWeek))),
      o);
  }

  /* ========================== 7. FEATURE VALUE =========================== */
  function featureValue() {
    var host = App.el('div', {});
    var rows = [];
    function draw() {
      App.clear(host);
      rows.forEach(function (r, i) {
        host.append(App.el('div', { class: 'field-row tight', style: { marginBottom: '.4rem', alignItems: 'end' } },
          App.el('div', { class: 'field', style: { gridColumn: 'span 2' } }, App.el('label', {}, 'Feature'),
            (function () { var inp = App.el('input', { type: 'text', value: r.name, placeholder: 'e.g. Boss fights' }); inp.addEventListener('input', function () { r.name = inp.value; calc(); }); return inp; })()),
          App.el('div', { class: 'field' }, App.el('label', {}, 'Fun added'),
            (function () { var inp = App.el('input', { type: 'number', value: r.value, step: '1' }); inp.addEventListener('input', function () { r.value = Number(inp.value) || 0; calc(); }); return inp; })()),
          App.el('div', { class: 'field' }, App.el('label', {}, 'Weeks'),
            (function () { var inp = App.el('input', { type: 'number', value: r.weeks, step: '0.5' }); inp.addEventListener('input', function () { r.weeks = Number(inp.value) || 0; calc(); }); return inp; })()),
          App.el('button', { class: 'btn sm ghost', style: { marginBottom: '.8rem' }, onclick: function () { rows.splice(i, 1); draw(); calc(); } }, '✕')));
      });
    }
    var o = out();
    function calc() {
      var scored = rows.map(function (r) {
        return { name: r.name, score: r.weeks > 0 ? r.value / r.weeks : 0, r: r };
      }).filter(function (x) { return x.name; }).sort(function (a, b) { return a.score - b.score; });
      App.clear(o);
      if (!scored.length) { o.append(App.el('p', { class: 'tiny muted' }, 'Add features above to rank them.')); return; }
      scored.forEach(function (x) {
        o.append(App.el('div', { class: 'row between', style: { padding: '.25rem 0' } },
          App.el('span', { class: 'small' }, x.name),
          App.el('span', { class: 'mono small' }, x.score.toFixed(1) + ' fun per week')));
      });
      var cut = scored.slice(0, Math.max(1, Math.round(scored.length * 0.3)));
      o.append(App.el('div', { class: 'callout warn', style: { marginTop: '.7rem', marginBottom: 0 } },
        App.el('div', { class: 'ct' }, 'The 30% to cut'),
        App.el('p', {}, cut.map(function (x) { return x.name; }).join(', ') + '. These give you the least fun for the time they cost.')));
    }
    if (!rows.length) {
      [['Boss fights', 8, 3], ['Save system', 2, 1.5], ['Localisation', 1, 2], ['Photo mode', 3, 2], ['Crafting', 5, 4]].forEach(function (r) {
        rows.push({ name: r[0], value: r[1], weeks: r[2] });
      });
    }
    draw();
    calc();
    return card('Scope 3', 'Which features earn their place?',
      'Score every feature by how much fun it adds and how long it takes. Cut the bottom 30%.',
      App.el('div', {},
        host,
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm', onclick: function () { rows.push({ name: '', value: 5, weeks: 1 }); draw(); calc(); } }, '+ Add a feature'),
          App.el('button', { class: 'btn sm ghost', onclick: function () {
            rows = []; draw(); calc();
          } }, 'Clear'))),
      o);
  }

  /* ========================== 8. COMP SALES ============================== */
  function compSales() {
    var reviews = num(500, '1');
    var mult = App.el('select', {}, App.data.reviewMultipliers.map(function (m) {
      return App.el('option', { value: m.mult }, m.label + ' — ' + m.mult + '×');
    }));
    var price = num(9.99, '0.01');
    var rating = num(92, '1');
    var o = out();
    wire([reviews, price, rating], function () {
      var s = settings();
      var u = (Number(reviews.value) || 0) * Number(mult.value);
      var per = (Number(price.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var found = App.data.reviewMultipliers.filter(function (m) { return String(m.mult) === String(mult.value); })[0];
      App.clear(o);
      o.append(
        App.outRow('Estimated copies sold', App.num(Math.round(u))),
        App.outRow('Estimated net revenue', App.money(u * per)),
        App.outRow('Why this multiplier', found ? found.why : ''),
        App.outRow('Rating signal', (Number(rating.value) || 0) >= 90 ? 'Very strong — good sign' : (Number(rating.value) || 0) >= 80 ? 'Strong' : 'Weak — discoverability risk', true));
    });
    mult.addEventListener('change', function () { });
    return card('Market 1', 'Guess how many copies a similar game sold',
      'Reviews × a multiplier ≈ lifetime sales. Only ever a guess, so do this for eight to fifteen games and take the middle.',
      App.el('div', { class: 'field-row' },
        App.field('How many reviews it has', reviews),
        App.field('Kind of game', mult),
        App.field('Price', price),
        App.field('Rating (%)', rating)),
      o);
  }

  /* =========================== 9. PRICE PICKER =========================== */
  function pricePicker() {
    var comps = App.el('textarea', { placeholder: 'One price per line, from your similar games. e.g.\n6.99\n9.99\n14.99\n12.99\n9.99', style: { minHeight: '100px' } });
    var mine = num(9.99, '0.01');
    var o = out();
    function calc() {
      var prices = comps.value.split('\n').map(function (l) { return parseFloat(l.replace(/[^0-9.]/g, '')); }).filter(function (n) { return isFinite(n) && n > 0; }).sort(function (a, b) { return a - b; });
      App.clear(o);
      if (prices.length < 3) { o.append(App.el('p', { class: 'tiny muted' }, 'Put in at least three prices.')); return; }
      var q1 = prices[Math.floor(prices.length * 0.25)];
      var q3 = prices[Math.floor(prices.length * 0.75)];
      var med = App.median(prices);
      var me = Number(mine.value) || 0;
      var band = me >= q3 ? 'top quarter' : me >= med ? 'upper half' : me >= q1 ? 'lower half' : 'bottom quarter';
      o.append(
        App.outRow('Cheapest', App.price(prices[0])),
        App.outRow('Lower quarter', App.price(q1)),
        App.outRow('Middle', App.price(med)),
        App.outRow('Top quarter', App.price(q3)),
        App.outRow('Most expensive', App.price(prices[prices.length - 1])),
        App.outRow('Your price sits in the', band, true),
        App.el('div', { class: 'callout ' + (me >= q3 ? 'good' : 'warn'), style: { marginTop: '.6rem', marginBottom: 0 } },
          App.el('div', { class: 'ct' }, me >= q3 ? 'Priced confidently' : 'There is room to charge more'),
          App.el('p', {}, me >= q3
            ? 'You are in the top quarter. That is where indie games should be — as long as the game looks like it belongs there.'
            : 'Games of similar quality are selling for up to ' + App.price(q3) + '. Pricing below that leaves money on the table and can make the game look cheaper than it is.')));
    }
    comps.addEventListener('input', App.debounce(calc, 350));
    mine.addEventListener('input', calc);
    calc();
    return card('Market 2', 'What should I charge?',
      'Paste the prices of your similar games and see where your price sits.',
      App.el('div', {},
        App.field('Prices of similar games', comps),
        App.el('div', { class: 'field-row' }, App.field('Your price', mine))),
      o);
  }

  /* ========================= 10. WISHLIST FUNNEL ========================= */
  function wishlistFunnel() {
    var wish = num(3000, '100'), conv = num(12, '1'), price = num(6.99, '0.01');
    var fest = App.el('select', {}, [
      ['0', 'No festival'], ['0.25', 'A modest festival (+25%)'],
      ['0.6', 'A good festival, demo well received (+60%)'], ['1.0', 'Festival plus a creator breakout (+100%)']
    ]);
    var o = out();
    wire([wish, conv, price], function () {
      var s = settings();
      var first = (Number(wish.value) || 0) * (1 + Number(fest.value)) * ((Number(conv.value) || 0) / 100);
      var per = (Number(price.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var band = App.data.marketBands;
      App.clear(o);
      o.append(
        App.outRow('Projected first-week copies', App.num(Math.round(first))),
        App.outRow('Projected first-week net', App.money(first * per, { exact: true })),
        App.outRow('Wishlist health', Number(wish.value) >= band.strong ? 'Strong — you will be shown to people' : Number(wish.value) >= band.healthy ? 'A real launch' : Number(wish.value) >= band.invisible ? 'Below the visibility line' : 'Too early to launch', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          'A festival does not create an audience — it amplifies one. Going in with ' + App.num(Number(wish.value)) + ' wishlists is very different to going in with 400.'));
    });
    fest.addEventListener('change', function () {
      App.clear(o);
      var s = settings();
      var first = (Number(wish.value) || 0) * (1 + Number(fest.value)) * ((Number(conv.value) || 0) / 100);
      var per = (Number(price.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      o.append(
        App.outRow('Projected first-week copies', App.num(Math.round(first))),
        App.outRow('Projected first-week net', App.money(first * per, { exact: true })));
    });
    return card('Market 3', 'Wishlists to first-week sales',
      'Roughly 8 to 15% of wishlists buy in the first week. Festivals add a multiplier on top.',
      App.el('div', { class: 'field-row' },
        App.field('Wishlists at launch', wish),
        App.field('First-week buy rate (%)', conv, '8–15% is normal'),
        App.field('Price', price),
        App.field('Festival', fest)),
      o);
  }

  /* ========================= 11. TAG SATURATION ========================== */
  function tagSaturation() {
    var tag = num(5000, '100');
    var add = App.el('input', { type: 'text', placeholder: 'Your tag, e.g. Action Roguelike' });
    var o = out();
    function calc() {
      var t = add.value.trim().toLowerCase();
      var known = App.data.steamTags.filter(function (s) { return s.tag.toLowerCase() === t; })[0];
      App.clear(o);
      if (!known) {
        o.append(App.el('p', { class: 'tiny muted' }, 'Type one of the tags from the Market page to see how crowded it is.'));
        return;
      }
      var reviewsNum = parseFloat(known.reviews.replace(/[^0-9.]/g, '')) * (known.reviews.indexOf('M') >= 0 ? 1e6 : known.reviews.indexOf('k') >= 0 ? 1e3 : 1);
      var share = reviewsNum > 0 ? ((Number(tag.value) || 0) / reviewsNum) * 100 : 0;
      o.append(
        App.outRow('Approximate total reviews in this tag', known.reviews),
        App.outRow('Approximate total games... ', 'hundreds — see SteamDB for the live count'),
        App.outRow('Your review count would be', App.pct(share, 3) + ' of the tag'),
        App.outRow('Crowding', known.heat === 'huge' ? 'Very crowded — needs a strong hook' : known.heat === 'high' ? 'Busy but workable' : 'Room to be noticed', true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          'Big tags are easier to be found in and harder to stand out in. Small tags are the opposite.' + (share < 0.001 ? ' At this size you would be invisible in the big tag — the smaller tags in your set are doing the work.' : '')));
    }
    add.addEventListener('input', App.debounce(calc, 300));
    tag.addEventListener('input', calc);
    calc();
    return card('Market 4', 'How crowded is my tag?',
      'A quick sense of how much attention is already in the tag you are aiming at.',
      App.el('div', { class: 'field-row' },
        App.field('Your expected review count', tag),
        App.field('Tag to check', add, 'Copied from the Market page')),
      o);
  }

  /* ============================ 12. AD RETURN ============================ */
  function adReturn() {
    var spend = num(200, '10'), wish = num(120, '10');
    var conv = num(12, '1'), price = num(9.99, '0.01');
    var o = out();
    wire([spend, wish, conv, price], function () {
      var s = settings();
      var per = (Number(price.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var cpw = (Number(wish.value) || 0) > 0 ? (Number(spend.value) || 0) / Number(wish.value) : 0;
      var sales = (Number(wish.value) || 0) * ((Number(conv.value) || 0) / 100);
      var revenue = sales * per;
      var profit = revenue - (Number(spend.value) || 0);
      var maxCpw = per * ((Number(conv.value) || 0) / 100);
      App.clear(o);
      o.append(
        App.outRow('Cost per wishlist', App.money(cpw, { exact: true })),
        App.outRow('Cost per sale', sales > 0 ? App.money((Number(spend.value) || 0) / sales, { exact: true }) : '—'),
        App.outRow('Net revenue', App.money(revenue, { exact: true })),
        App.outRow('Your break-even cost per wishlist', App.money(maxCpw, { exact: true }), true),
        App.el('div', { class: 'callout ' + (profit >= 0 ? 'good' : 'bad'), style: { marginTop: '.6rem', marginBottom: 0 } },
          App.el('div', { class: 'ct' }, profit >= 0 ? 'This would pay for itself' : 'This would lose money'),
          App.el('p', {}, profit >= 0
            ? 'About ' + App.money(profit, { exact: true }) + ' profit, assuming ' + conv.value + '% of wishlists buy in the first month.'
            : 'About ' + App.money(Math.abs(profit), { exact: true }) + ' lost. For a ' + App.price(price.value) + ' game, you can pay up to roughly ' + App.money(maxCpw, { exact: true }) + ' per wishlist before it stops making sense.')));
    });
    return card('Ads 1', 'Will advertising pay for itself?',
      'Work this out before spending anything. Most paid campaigns do not pass this test — that is useful to know early.',
      App.el('div', { class: 'field-row' },
        App.field('What you would spend', spend),
        App.field('Wishlists you expect', wish),
        App.field('Buy rate (%)', conv),
        App.field('Price', price)),
      o);
  }

  /* =========================== 13. CPM TO SALES ========================== */
  function cpmToSales() {
    var budget = num(500, '50'), cpm = num(8, '0.5'), ctr = num(0.8, '0.1');
    var visitToWish = num(15, '1'), wishToSale = num(12, '1'), price = num(9.99, '0.01');
    var o = out();
    wire([budget, cpm, ctr, visitToWish, wishToSale, price], function () {
      var s = settings();
      var views = (Number(cpm.value) || 0) > 0 ? ((Number(budget.value) || 0) / Number(cpm.value)) * 1000 : 0;
      var clicks = views * ((Number(ctr.value) || 0) / 100);
      var wishes = clicks * ((Number(visitToWish.value) || 0) / 100);
      var sales = wishes * ((Number(wishToSale.value) || 0) / 100);
      var per = (Number(price.value) || 0) * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var rev = sales * per;
      App.clear(o);
      o.append(
        App.outRow('Views', App.num(Math.round(views))),
        App.outRow('Clicks', App.num(Math.round(clicks))),
        App.outRow('Wishlists', App.num(Math.round(wishes))),
        App.outRow('Sales', App.num(Math.round(sales))),
        App.outRow('Cost per wishlist', wishes > 0 ? App.money((Number(budget.value) || 0) / wishes, { exact: true }) : '—'),
        App.outRow('Net revenue', App.money(rev, { exact: true })),
        App.outRow('Profit', App.money(rev - (Number(budget.value) || 0), { exact: true }), true),
        App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } },
          'The click-through rate is where most campaigns die. Anything under 0.5% on a cold audience is normal and unprofitable.'));
    });
    return card('Ads 2', 'From ad views all the way to sales',
      'The full funnel. Change one number at a time and watch which one actually matters.',
      App.el('div', { class: 'field-row' },
        App.field('Budget', budget),
        App.field('Cost per 1,000 views', cpm, 'CPM'),
        App.field('Click-through rate (%)', ctr, 'Usually 0.5–1.5%'),
        App.field('Visits that wishlist (%)', visitToWish),
        App.field('Wishlists that buy (%)', wishToSale),
        App.field('Price', price)),
      o);
  }
})();
