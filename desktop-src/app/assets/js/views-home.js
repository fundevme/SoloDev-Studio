/* ==========================================================================
   VIEW — HOME (what to do today)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  App.views.home = {
    render: function (root) {
      var d = App.Store.data;
      var active = App.Store.activeGame();

      root.append(hero(active));

      if (!d.games.length) {
        root.append(startHere());
        root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'What is inside')));
        root.append(whatsInside());
        return;
      }

      root.append(topRow(active));
      root.append(App.el('div', { class: 'grid g2', style: { marginTop: '1rem' } }, doNext(active), progressCard(active)));
      root.append(quickActions(active));
      if (!active) root.append(noActive());
      root.append(ideasCard());
    }
  };

  /* --------------------------------- hero -------------------------------- */
  function hero(active) {
    var d = App.Store.data;
    var hour = new Date().getHours();
    var greet = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    var name = d.settings.studioName;

    var sub;
    if (active) {
      sub = App.el('p', { class: 'lead' },
        'You are working on ',
        App.el('strong', {}, active.title),
        '. Step ' + active.stage + ' of 10: ' + App.data.stages[active.stage - 1].name + '.'
      );
    } else if (d.games.length) {
      sub = App.el('p', { class: 'lead' }, 'Nothing is marked as being worked on. Pick one project below so the app knows what to show you.');
    } else {
      sub = App.el('p', { class: 'lead' }, 'Let us set up your first project. It takes a minute and everything else fills in around it.');
    }

    var actions = App.el('div', { class: 'btn-row', style: { marginTop: '1rem' } });
    if (active) {
      actions.append(
        App.el('a', { class: 'btn primary', href: '#/plan/' + active.id }, 'Open the plan'),
        App.el('a', { class: 'btn', href: '#/design/' + active.id }, 'Design work')
      );
    } else {
      actions.append(App.el('button', { class: 'btn primary', onclick: function () { App.openNewGameDialog(null); } }, '+ New game project'));
    }

    return App.el('div', { class: 'hero' },
      App.el('div', { class: 'kicker' }, App.dayName() + ' · ' + App.fmtDate(App.today())),
      App.el('h1', {}, greet + (name ? ', ' + name : '') + '.'),
      sub,
      actions
    );
  }

  /* ------------------------------ today row ------------------------------ */
  function topRow(active) {
    var d = App.Store.data;
    var week = App.hoursThisWeek();
    var target = d.settings.weeklyHoursTarget || 30;
    var ceiling = d.settings.workCeiling || 40;
    var pct = ceiling ? week / ceiling : 0;
    var days = App.lastNDays(14);
    var values = days.map(App.hoursOn);
    var todayIdx = days.length - 1;

    var ringCard = App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row', style: { gap: '1.1rem', alignItems: 'center' } },
        App.ring(pct, 'of ceiling', String(week) + 'h'),
        App.el('div', { style: { flex: '1', minWidth: '150px' } },
          App.el('div', { class: 'kicker' }, 'This week'),
          App.el('h3', { class: 'card-t', style: { marginBottom: '.2rem' } },
            week <= target ? 'On track' : week <= ceiling ? 'Slightly over target' : 'Over the ceiling'),
          App.el('p', { class: 'card-s' },
            'Target ' + target + ' h · ceiling ' + ceiling + ' h. ' +
            (week > ceiling ? 'Stop. Long weeks cost more than they give.' : 'Long weeks cost more than they give.')),
          App.el('div', { class: 'btn-row', style: { marginTop: '.6rem' } },
            [1, 2, 4].map(function (n) {
              return App.el('button', { class: 'btn sm', onclick: function () {
                App.addHours(App.today(), n);
                App.toast('+' + n + ' h logged for today.');
                App.renderRoute();
              } }, '+' + n + 'h');
            }),
            App.el('button', { class: 'btn sm ghost', onclick: function () {
              App.addHours(App.today(), -1);
              App.renderRoute();
            } }, '−1h')
          )
        )
      ),
      App.el('div', { style: { marginTop: '.9rem' } },
        App.bars(values, { labels: days.map(function (x) { return App.fmtDate(x, 'short'); }), todayIndex: todayIdx, over: 8, unit: 'h', height: 46 })),
      App.el('div', { class: 'tiny muted', style: { marginTop: '.35rem' } }, 'Last 14 days. Orange is today, red means over 8 hours.')
    );

    var streakCard = App.el('div', { class: 'card pad' },
      App.el('div', { class: 'kicker' }, 'Worked on'),
      App.el('div', { class: 'row', style: { alignItems: 'baseline', gap: '.4rem' } },
        App.el('span', { class: 'h1', style: { fontSize: '2.4rem' } }, String(activeCount(d))),
        App.el('span', { class: 'muted' }, activeCount(d) === 1 ? 'project' : 'projects')),
      App.el('div', { class: 'stack', style: { marginTop: '.7rem', gap: '.45rem' } },
        (d.games.length ? d.games : []).slice(0, 4).map(function (g) {
          return App.el('div', { class: 'row between', style: { gap: '.5rem', cursor: 'pointer' }, onclick: function () { App.navigate('#/plan/' + g.id); } },
            App.el('div', { class: 'row', style: { gap: '.45rem', minWidth: 0 } },
              App.el('span', { class: 'badge ' + App.data.labels[g.label].color }, g.label),
              App.el('span', { class: 'small', style: { fontWeight: g.active ? '750' : '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, g.title),
              g.active ? App.el('span', { class: 'badge good' }, 'active') : null),
            App.el('span', { class: 'tiny muted nowrap' }, App.stageStatus(g.stage)));
        })),
      d.games.length > 4 ? App.el('p', { class: 'tiny muted', style: { marginTop: '.5rem' } }, '+' + (d.games.length - 4) + ' more in Plan') : null
    );

    return App.el('div', { class: 'grid g2' }, ringCard, streakCard);
  }

  function activeCount(d) { return d.games.length; }

  /* ------------------------------ do next -------------------------------- */
  function doNext(active) {
    var card = App.el('div', { class: 'card pad' },
      App.el('div', { class: 'row between' },
        App.el('h3', { class: 'card-t' }, 'Do next'),
        active ? App.el('a', { class: 'link-btn', href: '#/plan/' + active.id }, 'All tasks →') : null)
    );

    if (!active) {
      card.append(App.el('p', { class: 'card-s' }, 'Mark a project as active and its tasks will appear here.'));
      return card;
    }

    var tasks = (active.tasks || []).filter(function (t) { return t.status !== 'done'; });
    var order = { high: 0, medium: 1, low: 2 };
    tasks.sort(function (a, b) {
      var d1 = a.due && a.due < App.today() ? -1 : 0;
      var d2 = b.due && b.due < App.today() ? -1 : 0;
      if (d1 !== d2) return d1 - d2;
      return (order[a.priority] || 1) - (order[b.priority] || 1);
    });

    if (!tasks.length) {
      card.append(App.el('p', { class: 'card-s' }, 'No open tasks for this project. Add some on the Plan page, or move to the next step.'));
      return card;
    }

    tasks.slice(0, 5).forEach(function (t) {
      var overdue = t.due && t.due < App.today();
      card.append(App.el('div', { class: 'chk-row' },
        App.el('div', { class: 'chk-box', onclick: function () {
          t.status = 'done';
          t.doneAt = App.today();
          App.Store.save();
          App.toast('Nice.');
          App.confetti(12);
          App.renderRoute();
        } }),
        App.el('div', { style: { flex: '1', minWidth: 0 } },
          App.el('div', { class: 'small', style: { fontWeight: '600' } }, t.title),
          App.el('div', { class: 'tiny muted' },
            (t.priority === 'high' ? 'High priority' : t.priority === 'low' ? 'Low priority' : 'Normal'),
            t.due ? ' · ' + (overdue ? 'was due ' : 'due ') + App.fmtDate(t.due, 'short') : '')
        ),
        overdue ? App.el('span', { class: 'badge bad' }, 'late') : null
      ));
    });
    return card;
  }

  /* ----------------------------- progress -------------------------------- */
  function progressCard(active) {
    var card = App.el('div', { class: 'card pad' });
    if (!active) {
      card.append(App.el('h3', { class: 'card-t' }, 'Where you are'),
        App.el('p', { class: 'card-s' }, 'No active project yet.'));
      return card;
    }
    var st = App.data.stages[active.stage - 1];
    var doneTasks = (active.tasks || []).filter(function (t) { return t.status === 'done'; }).length;
    var allTasks = (active.tasks || []).length;

    card.append(
      App.el('div', { class: 'row between' },
        App.el('h3', { class: 'card-t' }, 'Where you are'),
        App.el('a', { class: 'link-btn', href: '#/plan/' + active.id }, 'Open →')),
      App.el('div', { class: 'pip-track', style: { margin: '.7rem 0 .5rem' } }, App.data.stages.map(function (s) {
        return App.el('div', { class: 'pip ' + (s.n < active.stage ? 'done' : s.n === active.stage ? 'now' : ''), title: s.n + '. ' + s.name });
      })),
      App.el('div', { class: 'row between', style: { marginBottom: '.6rem' } },
        App.el('span', { class: 'small', style: { fontWeight: '700' } }, 'Step ' + active.stage + ': ' + st.name),
        App.el('span', { class: 'tiny muted' }, Math.round(App.stageProgress(active) * 100) + '% of the way')),
      App.el('p', { class: 'card-s' }, st.goal),
      App.el('div', { class: 'divider', style: { margin: '.8rem 0' } }),
      App.el('div', { class: 'row between' },
        App.el('span', { class: 'small muted' }, 'Tasks done'),
        App.el('span', { class: 'mono' }, doneTasks + ' / ' + allTasks)),
      App.el('div', { class: 'meter sm', style: { marginTop: '.35rem' } },
        App.el('i', { style: { width: (allTasks ? (doneTasks / allTasks) * 100 : 0) + '%' } })),
      App.el('div', { class: 'btn-row', style: { marginTop: '.9rem' } },
        App.el('a', { class: 'btn sm', href: '#/design/' + active.id }, 'Open the design pages'),
        App.el('a', { class: 'btn sm ghost', href: '#/market/' + active.id }, 'Check the market'))
    );
    return card;
  }

  /* ---------------------------- quick actions ---------------------------- */
  function quickActions(active) {
    var qa = [
      { t: 'Add a task', s: 'Something you will actually do', ico: 'M12 5v14|M5 12h14', go: function () { addTaskDialog(active); } },
      { t: 'Log hours', s: 'Keep the week honest', ico: 'M12 7v5l3 2|M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', go: function () { logHoursDialog(); } },
      { t: 'Write the pitch', s: 'One sentence, no waffle', ico: 'M4 6h16|M4 12h10|M4 18h7', go: function () { if (active) App.navigate('#/design/' + active.id); else App.toast('Create a project first.', 'warn'); } },
      { t: 'Find similar games', s: 'See what you are up against', ico: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14|M20 20l-3.5-3.5', go: function () { if (active) App.navigate('#/market/' + active.id); else App.toast('Create a project first.', 'warn'); } },
      { t: 'Plan the marketing', s: 'Six phases, in order', ico: 'M3 11v2h2l4 4V6L6 10H4a1 1 0 0 0-1 1|M15 8.5a4 4 0 0 1 0 7', go: function () { App.navigate('#/marketing' + (active ? '/' + active.id : '')); } },
      { t: 'Open the toolbox', s: 'Check the numbers first', ico: 'M4 20v-6|M10 20V8|M16 20v-9|M20 20H2', go: function () { App.navigate('#/toolbox'); } }
    ];
    return App.el('div', {},
      App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Jump in')),
      App.el('div', { class: 'grid g3' }, qa.map(function (q) {
        return App.el('div', { class: 'card hover', style: { cursor: 'pointer' }, onclick: q.go },
          App.el('div', { class: 'row', style: { gap: '.6rem', alignItems: 'flex-start' } },
            App.el('div', { class: 'e-ico', style: { width: '34px', height: '34px', margin: '0', borderRadius: '10px' } }, App.svg(q.ico)),
            App.el('div', { style: { minWidth: 0 } },
              App.el('div', { class: 'card-t', style: { fontSize: '.92rem' } }, q.t),
              App.el('div', { class: 'tiny muted' }, q.s))));
      }))
    );
  }

  function addTaskDialog(active) {
    if (!active) { App.toast('Create a project first.', 'warn'); return; }
    var title = App.el('input', { type: 'text', placeholder: 'What needs doing?' });
    var pr = App.el('select', {}, [['high', 'High'], ['medium', 'Normal'], ['low', 'Low']].map(function (p) {
      return App.el('option', { value: p[0], selected: p[0] === 'medium' ? 'selected' : null }, p[1]);
    }));
    var due = App.el('input', { type: 'date', value: App.addDays(App.today(), 3) });
    var m = App.modal({
      title: 'Add a task to ' + active.title,
      narrow: true,
      body: App.el('div', {},
        App.field('Task', title),
        App.el('div', { class: 'field-row' }, App.field('Priority', pr), App.field('Due', due)),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            if (!title.value.trim()) { App.toast('Give it a name.', 'warn'); return; }
            active.tasks.push({ id: App.uid('t'), title: title.value.trim(), note: '', status: 'todo', priority: pr.value, due: due.value, created: App.today(), stage: active.stage });
            App.Store.save();
            m.close();
            App.toast('Task added.');
            App.renderRoute();
          } }, 'Add task'))
      )
    });
  }

  function logHoursDialog() {
    var d = App.Store.data;
    var days = App.lastNDays(7).reverse();
    var inputs = {};
    var body = App.el('div', {});
    days.forEach(function (day) {
      var inp = App.el('input', { type: 'number', step: '0.5', value: App.hoursOn(day) || '' });
      inputs[day] = inp;
      body.append(App.el('div', { class: 'row between', style: { padding: '.3rem 0' } },
        App.el('span', { class: 'small', style: { minWidth: '140px' } }, App.dayName(new Date(day + 'T00:00:00')) + ', ' + App.fmtDate(day, 'short')),
        App.el('div', { style: { width: '110px' } }, inp)));
    });
    var m = App.modal({
      title: 'Hours this week',
      narrow: true,
      body: App.el('div', {},
        App.el('p', { class: 'small muted' }, 'Type the hours you worked each day. Honest numbers make the buffer work.'),
        body,
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            days.forEach(function (day) {
              var v = Number(inputs[day].value) || 0;
              if (v > 0) d.log[day] = Math.round(v * 10) / 10; else delete d.log[day];
            });
            App.Store.save();
            m.close();
            App.toast('Week updated.');
            App.renderRoute();
          } }, 'Save'))
      )
    });
  }

  /* ------------------------------ empty state ---------------------------- */
  function startHere() {
    var steps = [
      { t: 'Make a project', s: 'Give it a name and pick what kind of game it is.', go: function () { App.openNewGameDialog(null); }, b: 'Start' },
      { t: 'Read the short guide', s: 'Fifteen minutes that will save you months.', go: function () { App.navigate('#/learn/roadmap'); }, b: 'Read' },
      { t: 'Check the numbers', s: 'See how many copies you would need to break even.', go: function () { App.navigate('#/toolbox'); }, b: 'Open' },
      { t: 'Plan the marketing', s: 'Six phases from today to launch and beyond.', go: function () { App.navigate('#/marketing'); }, b: 'Plan' }
    ];
    return App.el('div', {},
      App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Start here')),
      App.el('div', { class: 'grid g4' }, steps.map(function (s, i) {
        return App.el('div', { class: 'card hover' },
          App.el('div', { class: 'kicker' }, 'Step ' + (i + 1)),
          App.el('h3', { class: 'card-t' }, s.t),
          App.el('p', { class: 'card-s', style: { minHeight: '2.6em' } }, s.s),
          App.el('button', { class: 'btn sm primary', onclick: s.go, style: { marginTop: '.5rem' } }, s.b));
      }))
    );
  }

  function whatsInside() {
    var items = [
      { t: 'Plan', s: 'Projects, tasks, milestones, weekly hours and a release timeline that warns you about overlaps.' },
      { t: 'Design', s: 'A design document that starts half-filled so you never stare at a blank page. Pillars, core loops, numbers, art, playtests.' },
      { t: 'Market', s: 'Track similar games, estimate their sales, check whether your tags have players, watch your wishlists.' },
      { t: 'Marketing', s: 'A six-phase campaign, a content calendar, a press and creator tracker, a budget, and store page copy.' },
      { t: 'Toolbox', s: 'Ten calculators: revenue, break-even, price, runways, ad returns, discount ladders and more.' },
      { t: 'Learn', s: 'Three plain-language guides: making games solo, making them run fast, and getting people to play them.' },
      { t: 'Vault', s: 'Backups, notes, reusable document templates, a glossary and settings.' }
    ];
    return App.el('div', { class: 'grid g3' }, items.map(function (i) {
      return App.el('div', { class: 'card' },
        App.el('h3', { class: 'card-t' }, i.t),
        App.el('p', { class: 'card-s' }, i.s));
    }));
  }

  function noActive() {
    return App.el('div', { class: 'callout warn', style: { marginTop: '1rem' } },
      App.el('div', { class: 'ct' }, 'Pick one project to be active'),
      App.el('p', {}, 'Working on two games at once is the most reliable way to finish neither. Pick one — the others stay safe until it is done.'),
      App.el('div', { class: 'btn-row' }, App.Store.data.games.map(function (g) {
        return App.el('button', { class: 'btn sm' + (g.active ? ' primary' : ''), onclick: function () { App.activateGame(g.id); } }, g.title);
      }))
    );
  }

  /* -------------------------------- ideas -------------------------------- */
  function ideasCard() {
    var d = App.Store.data;
    var input = App.el('input', { type: 'text', placeholder: 'Got an idea while you were working? Park it here.' });
    var tag = App.el('select', {}, App.data.ideaTags.map(function (t) { return App.el('option', { value: t }, t); }));

    function add() {
      var v = input.value.trim();
      if (!v) return;
      d.ideas.unshift({ id: App.uid('i'), text: v, tag: tag.value, created: App.today(), done: false });
      App.Store.save();
      input.value = '';
      App.toast('Parked. Back to work.');
      App.renderRoute();
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });

    var open = (d.ideas || []).filter(function (i) { return !i.done; });

    return App.el('div', { class: 'card pad', style: { marginTop: '1rem' } },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('h3', { class: 'card-t' }, 'Idea parking lot'),
          App.el('p', { class: 'card-s' }, 'Every idea you have mid-project goes here instead of into the game. Look at it when the current one ships.')),
        App.el('span', { class: 'badge gray' }, String(open.length) + ' parked')),
      App.el('div', { class: 'btn-row', style: { margin: '.8rem 0' } }, input, tag,
        App.el('button', { class: 'btn primary', onclick: add }, 'Park it')),
      open.length ? App.el('div', { class: 'stack', style: { gap: '.35rem' } }, open.slice(0, 6).map(function (i) {
        return App.el('div', { class: 'row between', style: { gap: '.5rem', padding: '.3rem 0', borderBottom: '1px dashed var(--line)' } },
          App.el('div', { class: 'row', style: { gap: '.5rem', minWidth: 0 } },
            App.el('span', { class: 'badge gray' }, i.tag),
            App.el('span', { class: 'small' }, i.text)),
          App.el('div', { class: 'row', style: { gap: '.2rem' } },
            App.el('button', { class: 'link-btn', onclick: function () {
              App.openNewGameDialog(null);
            } }, 'Use'),
            App.el('button', { class: 'link-btn', onclick: function () {
              i.done = true; App.Store.save(); App.renderRoute();
            } }, 'Done'),
            App.el('button', { class: 'link-btn', onclick: function () {
              d.ideas = d.ideas.filter(function (x) { return x.id !== i.id; });
              App.Store.save(); App.renderRoute();
            } }, 'Delete'))
        );
      })) : App.el('p', { class: 'tiny muted' }, 'Nothing parked. Good.')
    );
  }
})();
