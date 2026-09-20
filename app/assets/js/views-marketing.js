/* ==========================================================================
   VIEW — MARKETING (plan, calendar, outreach, budget, store copy)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  var TABS = ['plan', 'calendar', 'press', 'budget', 'copy', 'assets', 'runbook'];
  var tab = 'plan';

  App.views.marketing = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Marketing'),
          App.el('h1', { class: 'h1' }, 'Getting people to play it')),
        App.el('div', { class: 'ph-actions' },
          App.el('button', { class: 'btn', onclick: function () { window.print(); } }, 'Print / PDF'))
      ));

      var g = App.gamePicker(root, params, '#/marketing/');
      if (params && params[1] && TABS.indexOf(params[1]) >= 0) tab = params[1];

      /* If there is no project at all, still show the general pages that do not need one. */
      var generalOnly = ['assets', 'runbook'];
      if (!g) {
        root.append(App.el('div', { class: 'tabs' }, ['assets', 'runbook'].map(function (t) {
          return App.el('button', { class: tab === t ? 'on' : '', onclick: function () { tab = t; App.renderRoute(); } },
            { assets: 'Launch assets', runbook: 'Launch runbook' }[t]);
        })));
        var b = App.el('div', {});
        (tab === 'runbook' ? tabRunbook : tabAssets)(b, null);
        root.append(b);
        return;
      }

      root.append(App.el('div', { class: 'tabs' }, TABS.map(function (t) {
        return App.el('button', { class: tab === t ? 'on' : '', onclick: function () { tab = t; App.renderRoute(); } },
          { plan: 'Campaign', calendar: 'Content', press: 'Outreach', budget: 'Budget', copy: 'Store page', assets: 'Launch assets', runbook: 'Launch runbook' }[t]);
      })));

      var body = App.el('div', {});
      ({
        plan: tabPlan, calendar: tabCalendar, press: tabPress,
        budget: tabBudget, copy: tabCopy, assets: tabAssets, runbook: tabRunbook
      }[tab])(body, g);
      root.append(body);
    }
  };

  /* =============================== CAMPAIGN ============================== */
  function tabPlan(root, g) {
    g.marketing.campaigns = g.marketing.campaigns || [];

    if (!g.marketing.campaigns.length) {
      root.append(App.empty({
        title: 'No campaign yet',
        body: 'A campaign is six phases that take you from today to a month after launch. Each one has a single job. Start from the template and delete what does not apply.',
        action: App.el('button', { class: 'btn primary', onclick: function () {
          g.marketing.campaigns = App.data.campaignTemplate.map(function (c, i) {
            return { id: App.uid('c'), phase: c.phase, when: c.when, goal: c.goal, done: false, open: i <= 1 };
          });
          g.marketing.tasks = g.marketing.tasks || {};
          App.data.campaignTemplate.forEach(function (c) {
            g.marketing.tasks[c.phase] = c.tasks.map(function () { return false; });
          });
          App.Store.save();
          App.confetti(20);
          App.renderRoute();
        } }, 'Start from the template')
      }));
      return;
    }

    g.marketing.tasks = g.marketing.tasks || {};

    root.append(App.el('div', { class: 'callout info' },
      App.el('div', { class: 'ct' }, 'Do them in order'),
      App.el('p', {}, 'Each phase has one job. Doing phase four before phase two is how launch week becomes a panic.')),
      App.el('div', { class: 'stack' }, g.marketing.campaigns.map(function (c, i) {
        var tpl = App.data.campaignTemplate.filter(function (x) { return x.phase === c.phase; })[0];
        var tasks = tpl ? tpl.tasks : [];
        var state = g.marketing.tasks[c.phase] || tasks.map(function () { return false; });
        g.marketing.tasks[c.phase] = state;
        var done = state.filter(Boolean).length;

        var card = App.el('div', { class: 'card' + (c.done ? ' tint' : '') });
        var head = App.el('div', { class: 'row between', style: { cursor: 'pointer' }, onclick: function () {
          c.open = !c.open;
          App.Store.save();
          body.hidden = !c.open;
        } },
          App.el('div', { class: 'row', style: { gap: '.6rem', minWidth: 0 } },
            App.el('span', { class: 'badge ' + (done === tasks.length && tasks.length ? 'good' : c.done ? 'good' : 'gray') }, done === tasks.length && tasks.length ? 'done' : 'phase ' + (i + 1)),
            App.el('div', { style: { minWidth: 0 } },
              App.el('div', { class: 'card-t' }, c.phase),
              App.el('div', { class: 'tiny muted' }, c.when))),
          App.el('div', { class: 'row', style: { gap: '.5rem' } },
            App.el('span', { class: 'tiny muted' }, done + '/' + tasks.length),
            App.el('span', { class: 'muted' }, c.open ? '▾' : '▸')));

        var body = App.el('div', { class: 'stack', style: { marginTop: '.7rem', display: c.open ? '' : 'none' } },
          App.el('p', { class: 'card-s' }, c.goal));

        tasks.forEach(function (t, ti) {
          body.append(App.el('div', { class: 'chk-row' },
            App.el('div', { class: 'chk-box' + (state[ti] ? ' on' : ''), onclick: function () {
              state[ti] = !state[ti];
              App.Store.save();
              App.renderRoute();
            } }),
            App.el('label', { class: state[ti] ? 'done' : '' }, t)));
        });

        card.append(head, body,
          App.el('div', { class: 'btn-row', style: { marginTop: '.6rem' } },
            App.el('button', { class: 'btn sm' + (c.done ? ' ghost' : ' primary'), onclick: function () {
              c.done = !c.done;
              App.Store.save();
              if (c.done) App.confetti(18);
              App.renderRoute();
            } }, c.done ? 'Reopen this phase' : 'Mark this phase finished')));
        return card;
      })));

    root.append(App.el('div', { class: 'btn-row', style: { marginTop: '1rem' } },
      App.el('button', { class: 'btn sm', onclick: function () {
        addPhase(g);
      } }, '+ Add your own phase'),
      App.el('button', { class: 'btn sm ghost', onclick: function () {
        App.presentExport('Marketing plan — ' + g.title, App.slug(g.title) + '_marketing.md', exportPlan(g), 'text/markdown');
      } }, 'Export the plan')));
  }

  function addPhase(g) {
    var name = App.el('input', { type: 'text', placeholder: 'e.g. The launch stream' });
    var when = App.el('input', { type: 'text', placeholder: 'e.g. Launch day' });
    var goal = App.el('input', { type: 'text', placeholder: 'What is the one job of this phase?' });
    var m = App.modal({
      title: 'Add a phase', narrow: true,
      body: App.el('div', {},
        App.field('Name', name), App.field('When', when), App.field('Job', goal),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            if (!name.value.trim()) { App.toast('Give it a name.', 'warn'); return; }
            g.marketing.campaigns.push({ id: App.uid('c'), phase: name.value.trim(), when: when.value, goal: goal.value, done: false, open: true });
            App.Store.save(); m.close(); App.renderRoute();
          } }, 'Add')))
    });
  }

  function exportPlan(g) {
    var out = ['# Marketing plan — ' + g.title, ''];
    (g.marketing.campaigns || []).forEach(function (c) {
      var tpl = App.data.campaignTemplate.filter(function (x) { return x.phase === c.phase; })[0];
      var tasks = tpl ? tpl.tasks : [];
      var state = (g.marketing.tasks || {})[c.phase] || [];
      out.push('## ' + c.phase + '  (' + (c.when || '') + ')');
      out.push(c.goal || '');
      tasks.forEach(function (t, i) { out.push('- [' + (state[i] ? 'x' : ' ') + '] ' + t); });
      out.push('');
    });
    return out.join('\n');
  }

  /* =============================== CALENDAR ============================== */
  function tabCalendar(root, g) {
    g.marketing.content = g.marketing.content || [];
    var list = g.marketing.content.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });

    var date = App.el('input', { type: 'date', value: App.today() });
    var type = App.el('select', {}, ['Clip', 'Devlog', 'Image', 'Post', 'Video', 'Email', 'Other'].map(function (t) {
      return App.el('option', { value: t }, t);
    }));
    var title = App.el('input', { type: 'text', placeholder: 'What are you posting?' });
    var channel = App.el('input', { type: 'text', placeholder: 'Where? (Shorts, Discord, email…)' });

    root.append(App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Content calendar'),
          App.el('p', { class: 'card-s' }, 'Post something every week, even when nothing has happened. Silence is the only real mistake.')),
        App.el('span', { class: 'badge gray' }, list.length + ' planned')),
      App.el('div', { class: 'field-row', style: { marginTop: '.7rem' } },
        App.field('Date', date), App.field('Kind', type), App.field('What', title), App.field('Where', channel)),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn primary', onclick: function () {
          if (!title.value.trim()) { App.toast('What are you posting?', 'warn'); return; }
          g.marketing.content.push({ id: App.uid('p'), date: date.value || App.today(), type: type.value, title: title.value.trim(), channel: channel.value, done: false });
          App.Store.save(); App.renderRoute();
        } }, 'Add to the calendar'),
        App.el('button', { class: 'btn ghost', onclick: function () { pickIdea(g); } }, 'Use a content idea'))));

    if (!list.length) {
      root.append(App.el('div', { style: { marginTop: '1rem' } }, App.empty({
        title: 'Nothing planned',
        body: 'Even four posts a month is enough to keep people interested. Plan them out and you will actually do them.'
      })));
      root.append(ideaList(g));
      return root;
    }

    var byMonth = {};
    list.forEach(function (c) { var m = String(c.date).slice(0, 7); (byMonth[m] = byMonth[m] || []).push(c); });

    Object.keys(byMonth).sort().forEach(function (m) {
      root.append(App.el('div', { class: 'section-head' }, App.el('h3', { class: 'h3' }, App.fmtDate(m, 'month'))));
      var stack = App.el('div', { class: 'stack', style: { gap: '.4rem' } });
      byMonth[m].forEach(function (c) {
        var before = c.date < App.today() && !c.done;
        stack.append(App.el('div', { class: 'card', style: { padding: '.55rem .8rem', display: 'flex', gap: '.6rem', alignItems: 'center', opacity: c.done ? '.6' : '1' } },
          App.el('div', { class: 'chk-box' + (c.done ? ' on' : ''), onclick: function () {
            c.done = !c.done;
            if (c.done) App.confetti(14);
            App.Store.save(); App.renderRoute();
          } }),
          App.el('span', { class: 'badge gray nowrap' }, App.fmtDate(c.date, 'short')),
          App.el('span', { class: 'badge info' }, c.type),
          App.el('div', { style: { flex: '1', minWidth: 0 } },
            App.el('div', { class: c.done ? 'strike small' : 'small', style: { fontWeight: '600' } }, c.title),
            c.channel ? App.el('div', { class: 'tiny muted' }, c.channel) : null),
          before ? App.el('span', { class: 'badge warn' }, 'overdue') : null,
          App.el('button', { class: 'link-btn', onclick: function () {
            g.marketing.content = g.marketing.content.filter(function (x) { return x !== c; });
            App.Store.save(); App.renderRoute();
          } }, '✕')));
      });
      root.append(stack);
    });

    root.append(ideaList(g));
  }

  function ideaList(g) {
    var host = App.el('div', { style: { marginTop: '2rem' } });
    host.append(App.el('div', { class: 'section-head' },
      App.el('div', {},
        App.el('h2', { class: 'h2' }, 'Ideas you can steal'),
        App.el('p', { class: 'tiny muted' }, 'Click one to put it on the calendar next week.'))));
    host.append(App.el('div', { class: 'grid g3' }, App.data.contentIdeas.map(function (i) {
      return App.el('div', { class: 'card hover', style: { cursor: 'pointer' }, onclick: function () {
        g.marketing.content.push({ id: App.uid('p'), date: App.addDays(App.today(), 7), type: i.type, title: i.title, channel: '', done: false });
        App.Store.save();
        App.toast('Added to next week.');
        App.renderRoute();
      } },
        App.el('span', { class: 'badge gray' }, i.type),
        App.el('div', { class: 'card-t', style: { marginTop: '.4rem' } }, i.title),
        App.el('p', { class: 'card-s' }, i.note));
    })));
    return host;
  }

  function pickIdea(g) {
    g.marketing.content.push({ id: App.uid('p'), date: App.addDays(App.today(), 7), type: 'Clip', title: 'The 5-second hook clip', channel: '', done: false });
    App.Store.save();
    App.toast('Added an idea for next week.');
    App.renderRoute();
  }

  /* =============================== OUTREACH ============================== */
  var PRESS_STATUS = ['Not contacted', 'Drafted', 'Sent', 'Replied', 'Covered', 'Declined'];

  function tabPress(root, g) {
    g.marketing.press = g.marketing.press || [];

    var name = App.el('input', { type: 'text', placeholder: 'Name of the person or channel' });
    var kind = App.el('select', {}, App.data.pressTypes.map(function (p) { return App.el('option', { value: p.type }, p.type); }));
    var contact = App.el('input', { type: 'text', placeholder: 'Email or link' });
    var when = App.el('input', { type: 'date' });

    root.append(App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Who you are contacting'),
          App.el('p', { class: 'card-s' }, 'Twenty personal messages beat five hundred copy-pasted ones.')),
        App.el('span', { class: 'badge gray' }, g.marketing.press.length + ' tracked')),
      App.el('div', { class: 'field-row', style: { marginTop: '.7rem' } },
        App.field('Who', name), App.field('Kind', kind), App.field('Contact', contact), App.field('Date', when)),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn primary', onclick: function () {
          if (!name.value.trim()) { App.toast('Who are you contacting?', 'warn'); return; }
          g.marketing.press.push({ id: App.uid('r'), name: name.value.trim(), type: kind.value, contact: contact.value, date: when.value, status: 'Not contacted', note: '' });
          App.Store.save(); App.renderRoute();
        } }, '+ Add to the list'),
        App.el('button', { class: 'btn ghost', onclick: function () { fillPressTypes(g); } }, 'Add one of each kind'))));

    if (!g.marketing.press.length) {
      root.append(App.el('div', { style: { marginTop: '1rem' } },
        App.el('div', { class: 'grid g2' }, App.data.pressTypes.map(function (p) {
          return App.el('div', { class: 'card' },
            App.el('div', { class: 'row between' }, App.el('h3', { class: 'card-t' }, p.type), App.el('span', { class: 'badge info' }, p.when)),
            App.el('p', { class: 'card-s' }, p.who),
            App.el('p', { class: 'card-s' }, p.note));
        }))));
      return;
    }

    var counts = {};
    PRESS_STATUS.forEach(function (s) { counts[s] = 0; });
    g.marketing.press.forEach(function (p) { counts[p.status] = (counts[p.status] || 0) + 1; });

    root.append(App.el('div', { class: 'grid g4', style: { marginTop: '1rem' } },
      App.el('div', { class: 'stat' }, App.el('div', { class: 'k' }, 'Sent'), App.el('div', { class: 'v' }, String(counts['Sent'] + counts['Replied'] + counts['Covered']))),
      App.el('div', { class: 'stat accent' }, App.el('div', { class: 'k' }, 'Covered'), App.el('div', { class: 'v' }, String(counts['Covered']))),
      App.el('div', { class: 'stat' }, App.el('div', { class: 'k' }, 'Waiting'), App.el('div', { class: 'v' }, String(counts['Sent']))),
      App.el('div', { class: 'stat' }, App.el('div', { class: 'k' }, 'Still to do'), App.el('div', { class: 'v' }, String(counts['Not contacted'] + counts['Drafted'])))));

    var wrap = App.el('div', { class: 'tbl-wrap', style: { marginTop: '1rem' } });
    wrap.append(App.el('table', { class: 'tbl' },
      App.el('thead', {}, App.el('tr', {},
        App.el('th', {}, 'Who'), App.el('th', {}, 'Kind'), App.el('th', {}, 'Contact'), App.el('th', {}, 'Date'), App.el('th', {}, 'Status'), App.el('th', {}, 'Notes'), App.el('th', {}, ''))),
      App.el('tbody', {}, g.marketing.press.map(function (p) {
        return App.el('tr', {},
          App.el('td', { class: 'strong' }, p.name),
          App.el('td', { style: { fontSize: '.78rem' } }, p.type),
          App.el('td', { style: { fontSize: '.78rem' } }, p.contact || '—'),
          App.el('td', { style: { fontSize: '.78rem' } }, p.date ? App.fmtDate(p.date, 'short') : '—'),
          App.el('td', {}, (function () {
            var s = App.el('select', {}, PRESS_STATUS.map(function (x) {
              return App.el('option', { value: x, selected: p.status === x ? 'selected' : null }, x);
            }));
            s.style.fontSize = '.76rem';
            s.addEventListener('change', function () { p.status = s.value; App.Store.save(); App.renderRoute(); });
            return s;
          })()),
          App.el('td', {}, (function () {
            var i = App.el('input', { type: 'text', value: p.note || '', placeholder: '…' });
            i.style.fontSize = '.78rem';
            i.style.minWidth = '120px';
            i.addEventListener('input', App.debounce(function () { p.note = i.value; App.Store.save(); }, 400));
            return i;
          })()),
          App.el('td', {}, App.el('button', { class: 'link-btn', onclick: function () {
            g.marketing.press = g.marketing.press.filter(function (x) { return x !== p; });
            App.Store.save(); App.renderRoute();
          } }, '✕')));
      }))));
    root.append(wrap);

    root.append(App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
      App.el('div', { class: 'row between' },
        App.el('div', {}, App.el('h3', { class: 'card-t' }, 'The email'), App.el('p', { class: 'card-s' }, 'Short, personal, one link, no attachments.')),
        App.el('button', { class: 'btn sm', onclick: function () {
          App.presentExport('Outreach email', 'press-email.txt', App.data.pressEmail.replace(/\[Game name\]/g, g.title), 'text/plain');
        } }, 'Open the template')),
      App.el('div', { class: 'codeblock' },
        App.el('div', { class: 'codeblock-head' }, App.el('span', {}, 'press email'), App.el('button', { class: 'copy-btn', onclick: function () {
          App.copyText(App.data.pressEmail.replace(/\[Game name\]/g, g.title));
          App.toast('Copied.');
        } }, 'Copy')),
        App.el('pre', {}, App.data.pressEmail.replace(/\[Game name\]/g, g.title)))));

    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Who to contact')));
    root.append(App.el('div', { class: 'grid g2' }, App.data.pressTypes.map(function (p) {
      return App.el('div', { class: 'card' },
        App.el('div', { class: 'row between' }, App.el('h3', { class: 'card-t' }, p.type), App.el('span', { class: 'badge info' }, p.when)),
        App.el('p', { class: 'card-s' }, p.who),
        App.el('p', { class: 'card-s' }, p.note));
    })));
  }

  function fillPressTypes(g) {
    App.data.pressTypes.forEach(function (p) {
      g.marketing.press.push({ id: App.uid('r'), name: '', type: p.type, contact: '', date: '', status: 'Not contacted', note: p.note });
    });
    App.Store.save();
    App.toast('Added one row of each kind — fill in the names.');
    App.renderRoute();
  }

  /* ================================ BUDGET =============================== */
  function tabBudget(root, g) {
    g.marketing.budget = g.marketing.budget || [];
    var name = App.el('input', { type: 'text', placeholder: 'What are you paying for?' });
    var amount = App.el('input', { type: 'number', step: '0.01', placeholder: '0.00' });
    var kind = App.el('select', {}, ['Advertising', 'Festival fee', 'Art or audio', 'Trailer', 'Tools', 'Music', 'Other'].map(function (k) {
      return App.el('option', { value: k }, k);
    }));

    var spent = App.sum(g.marketing.budget, function (b) { return b.amount; });

    root.append(App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Money spent on getting the game out'),
          App.el('p', { class: 'card-s' }, 'Advertising, festival fees, art you outsourced, the trailer. Not development costs.')),
        App.el('span', { class: 'num-lg' }, App.money(spent, { exact: true }))),
      App.el('div', { class: 'field-row', style: { marginTop: '.7rem' } },
        App.field('What', name), App.field('How much', amount), App.field('Kind', kind)),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn primary', onclick: function () {
          var v = Number(amount.value);
          if (!name.value.trim() || !v) { App.toast('Fill in what and how much.', 'warn'); return; }
          g.marketing.budget.push({ id: App.uid('b'), name: name.value.trim(), amount: v, kind: kind.value, date: App.today() });
          App.Store.save(); App.renderRoute();
        } }, 'Add'),
        App.el('button', { class: 'btn ghost', onclick: function () { budgetStarter(g); } }, 'Add the usual five'))));

    if (g.marketing.budget.length) {
      var wrap = App.el('div', { class: 'tbl-wrap', style: { marginTop: '1rem' } });
      wrap.append(App.el('table', { class: 'tbl' },
        App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'What'), App.el('th', {}, 'Kind'), App.el('th', {}, 'Date'), App.el('th', {}, 'Amount'), App.el('th', {}, ''))),
        App.el('tbody', {}, g.marketing.budget.map(function (b) {
          return App.el('tr', {},
            App.el('td', { class: 'strong' }, b.name),
            App.el('td', {}, App.el('span', { class: 'badge gray' }, b.kind)),
            App.el('td', { style: { fontSize: '.78rem' } }, App.fmtDate(b.date, 'short')),
            App.el('td', { class: 'num' }, App.money(b.amount, { exact: true })),
            App.el('td', {}, App.el('button', { class: 'link-btn', onclick: function () {
              g.marketing.budget = g.marketing.budget.filter(function (x) { return x !== b; });
              App.Store.save(); App.renderRoute();
            } }, '✕')));
        }))));
      root.append(wrap);
    }

    /* ROI calculator */
    var spend = App.el('input', { type: 'number', value: spent || 200, step: '10' });
    var wish = App.el('input', { type: 'number', value: 120, step: '10' });
    var conv = App.el('input', { type: 'number', value: 12, step: '1' });
    var price = App.el('input', { type: 'number', value: g.msrp, step: '0.01' });
    var out = App.el('div', { class: 'card pad', style: { background: 'var(--surface-2)' } });

    function calc() {
      var s = App.Store.data.settings;
      var spentV = Number(spend.value) || 0;
      var wishV = Number(wish.value) || 0;
      var convV = (Number(conv.value) || 0) / 100;
      var priceV = Number(price.value) || 0;
      var netPer = priceV * s.regionalBlend * (1 - s.refundRate) * (1 - s.taxRate) * (1 - s.steamCut);
      var cpw = wishV > 0 ? spentV / wishV : 0;
      var sales = wishV * convV;
      var revenue = sales * netPer;
      var profit = revenue - spentV;
      var maxCpw = netPer * convV;
      App.clear(out);
      out.append(
        App.outRow('Cost per wishlist', App.money(cpw, { exact: true }) + ' per wishlist'),
        App.outRow('Wishlists needed to break even', cpw > 0 ? App.num(Math.ceil(spentV / cpw)) : '—'),
        App.outRow('Expected first-month sales', App.num(Math.round(sales)) + ' copies'),
        App.outRow('Expected net revenue', App.money(revenue, { exact: true })),
        App.outRow('Your break-even cost per wishlist', App.money(maxCpw, { exact: true }) + ' per wishlist', true),
        App.el('div', { class: 'callout ' + (profit >= 0 ? 'good' : 'bad'), style: { marginBottom: 0 } },
          App.el('div', { class: 'ct' }, profit >= 0 ? 'This pays for itself' : 'This loses money'),
          App.el('p', {}, profit >= 0
            ? 'You would make about ' + App.money(profit) + ' on this spend, assuming ' + conv.value + '% of wishlists buy in the first month.'
            : 'You would lose about ' + App.money(Math.abs(profit)) + '. For a ' + App.price(priceV) + ' game you can usually pay up to about ' + App.money(maxCpw, { exact: true }) + ' per wishlist before it stops being worth it. Most paid campaigns come in well above that.'))
      );
    }
    [spend, wish, conv, price].forEach(function (i) { i.addEventListener('input', calc); });
    calc();

    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Should you pay for advertising?')));
    root.append(App.el('div', { class: 'grid g2' },
      App.el('div', { class: 'card pad' },
        App.el('h3', { class: 'card-t' }, 'Run the numbers first'),
        App.el('p', { class: 'card-s', style: { marginBottom: '.7rem' } }, 'Put in what you are thinking of spending, and what you expect to get back. Be pessimistic.'),
        App.el('div', { class: 'field-row' }, App.field('Spend', spend), App.field('Wishlists gained', wish)),
        App.el('div', { class: 'field-row' }, App.field('Buy rate (%)', conv, 'Usually 8–15%'), App.field('Price', price)),
        App.el('p', { class: 'tiny muted' }, 'Wishlists needed to break even tells you how many people have to wishlist before you get your money back. If that number feels unrealistic, it is.')),
      out));

    root.append(App.el('div', { class: 'callout warn', style: { marginTop: '1rem' } },
      App.el('div', { class: 'ct' }, 'The honest answer'),
      App.el('p', {}, 'For a game under about $15, paid advertising almost never pays for itself directly. It can still be worth doing to build wishlists during a festival — but treat it as spending on awareness, not as an investment with a return. Test with a small amount, work out your cost per wishlist, and stop immediately if it is above your break-even.')));
  }

  function budgetStarter(g) {
    [['Festival entry', 0, 'Festival fee'],
     ['Trailer music licence', 0, 'Music'],
     ['Store capsule art', 0, 'Art or audio'],
     ['Festival ad test', 0, 'Advertising'],
     ['Press kit hosting', 0, 'Tools']].forEach(function (b) {
      g.marketing.budget.push({ id: App.uid('b'), name: b[0], amount: b[1], kind: b[2], date: App.today() });
    });
    App.Store.save();
    App.toast('Rows added — put the real numbers in.');
    App.renderRoute();
  }

  /* =============================== STORE COPY ============================ */
  function tabCopy(root, g) {
    var c = g.marketing.copy;
    var shortIn = App.el('textarea', { style: { minHeight: '80px' }, placeholder: 'What you do + what kind of game + the twist. One breath.' }, c.short || '');
    var counter = App.el('div', { class: 'tiny ' + ((c.short || '').length > 300 ? 'neg' : 'muted') });
    function upd() {
      var n = shortIn.value.length;
      counter.textContent = n + ' of 300 characters' + (n > 300 ? ' — too long' : n > 240 ? ' — cutting it fine' : '');
      counter.className = 'tiny ' + (n > 300 ? 'neg' : 'muted');
    }
    upd();
    shortIn.addEventListener('input', App.debounce(function () { c.short = shortIn.value; App.Store.save(); upd(); }, 300));

    root.append(
      App.el('div', { class: 'callout info' },
        App.el('div', { class: 'ct' }, 'Write the short description last'),
        App.el('p', {}, 'It is the hardest thing on the page and the most important. It appears in search results, in recommendation rows and on every wishlist email. Around 260 characters is the sweet spot.')),
      App.el('div', { class: 'card pad' },
        App.el('h3', { class: 'card-t' }, 'Short description'),
        App.el('p', { class: 'card-s' }, 'The one Steam uses everywhere.'),
        shortIn, counter),
      App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('h3', { class: 'card-t' }, 'Feature bullets'),
        App.el('p', { class: 'card-s' }, 'Five to seven short lines. Start each one with a verb. No walls of text.'),
        (function () {
          var t = App.el('textarea', { style: { minHeight: '130px' }, placeholder: '• Deflect anything — every projectile you parry charges your blade\n• Draft 80 upgrades — combinations matter more than stats\n• Run it in eight minutes — instant restarts, no loading' }, c.features || '');
          t.addEventListener('input', App.debounce(function () { c.features = t.value; App.Store.save(); }, 400));
          return t;
        })()),
      App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('h3', { class: 'card-t' }, 'Long description'),
        App.el('p', { class: 'card-s' }, 'Short paragraphs with headers and gifs. Three or four blocks is enough.'),
        (function () {
          var t = App.el('textarea', { style: { minHeight: '180px' }, placeholder: 'Paragraph 1: what the game is, in two sentences.\n\nParagraph 2: what you actually do, described as actions.\n\nParagraph 3: what makes it different.' }, c.long || '');
          t.addEventListener('input', App.debounce(function () { c.long = t.value; App.Store.save(); }, 400));
          return t;
        })()),
      App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
        App.el('h3', { class: 'card-t' }, 'Tags for the store page'),
        App.el('p', { class: 'card-s' }, 'Copy these into Steamworks in the same order as the Market page.'),
        App.el('div', { class: 'codeblock' },
          App.el('div', { class: 'codeblock-head' }, App.el('span', {}, 'tags'), App.el('button', { class: 'copy-btn', onclick: function () {
            App.copyText((g.market.tags || []).map(function (t) { return t.tag; }).join(', '));
            App.toast('Copied.');
          } }, 'Copy')),
          App.el('pre', {}, ((g.market.tags || []).map(function (t) { return t.tag; }).join(', ') || 'No tags chosen yet — go to Market → Tags.')))),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn', onclick: function () {
          App.presentExport('Store page copy — ' + g.title, App.slug(g.title) + '_store.md',
            '# ' + g.title + '\n\n## Short description\n\n' + (c.short || '') +
            '\n\n## Feature bullets\n\n' + (c.features || '') +
            '\n\n## Long description\n\n' + (c.long || '') +
            '\n\n## Tags\n\n' + ((g.market.tags || []).map(function (t) { return t.tag; }).join(', ')),
            'text/markdown');
        } }, 'Export the copy')));
  }

  /* ============================ LAUNCH ASSETS ============================ */
  function tabAssets(root) {
    var host = App.el('div', {});
    App.bindChecklist(host, 'global:launchassets', 'Everything you need ready before launch', App.data.launchAssets.map(function (a) { return '**' + a.item + '** — ' + a.why; }));
    root.append(
      App.el('div', { class: 'callout info' },
        App.el('div', { class: 'ct' }, 'The capsule image is the most important thing on this list'),
        App.el('p', {}, 'It gets seen more than your trailer, your screenshots and your description combined. Make it read at one centimetre tall.')),
      App.el('div', { class: 'tbl-wrap' },
        App.el('table', { class: 'tbl' },
          App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'Thing'), App.el('th', {}, 'Why it matters'))),
          App.el('tbody', {}, App.data.launchAssets.map(function (a) {
            return App.el('tr', {}, App.el('td', { class: 'strong' }, a.item), App.el('td', {}, a.why));
          })))),
      App.el('div', { style: { marginTop: '1rem' } }, host));
  }

  /* ============================= LAUNCH RUNBOOK ========================== */
  function tabRunbook(root) {
    root.append(App.el('div', { class: 'callout info' },
      App.el('div', { class: 'ct' }, 'Launch week is not when you work hardest'),
      App.el('p', {}, 'It is when you reply fastest. Everything on this list should be done before the day arrives.')));
    root.append(App.el('div', { class: 'tbl-wrap' },
      App.el('table', { class: 'tbl' },
        App.el('thead', {}, App.el('tr', {}, App.el('th', {}, 'When'), App.el('th', {}, 'What'), App.el('th', {}, 'Why'))),
        App.el('tbody', {}, App.data.launchRunbook.map(function (r) {
          return App.el('tr', {},
            App.el('td', { class: 'strong nowrap' }, r.time),
            App.el('td', {}, r.what),
            App.el('td', { style: { fontSize: '.8rem' } }, r.why));
        })))));
    root.append(App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
      App.el('h3', { class: 'card-t' }, 'After it is all over'),
      App.el('p', { class: 'card-s' }, 'Write the post-mortem within a week, while you still remember things clearly. It is the single most useful document you will make all year.'),
      App.el('div', { class: 'btn-row' },
        App.el('button', { class: 'btn', onclick: function () {
          var t = App.data.templates.filter(function (x) { return x.id === 'postmortem'; })[0];
          App.presentExport(t.title, 'postmortem.md', t.body, 'text/markdown');
        } }, 'Open the post-mortem template'))));
  }
})();
