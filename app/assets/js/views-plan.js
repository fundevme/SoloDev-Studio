/* ==========================================================================
   VIEW — PLAN (projects, steps, tasks, milestones, hours, timeline)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  App.views.plan = {
    render: function (root, params) {
      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Plan'),
          App.el('h1', { class: 'h1' }, 'Your projects')),
        App.el('div', { class: 'ph-actions' },
          App.el('button', { class: 'btn primary', onclick: function () { App.openNewGameDialog(null); } }, '+ New project'))
      ));

      if (params && params[0]) {
        var g = App.Store.game(params[0]);
        if (g) { renderDetail(root, g); return; }
      }
      root.append(renderWeek());
      if (!App.Store.data.games.length) {
        root.append(App.empty({
          title: 'No projects yet',
          body: 'Make one and it will walk you through the whole process, from picking the idea to supporting it after launch.',
          action: App.el('button', { class: 'btn primary', onclick: function () { App.openNewGameDialog(null); } }, '+ Create your first project')
        }));
        return;
      }
      root.append(renderGames());
      root.append(renderTimeline());
      root.append(renderReview());
    }
  };

  /* ============================ WEEK BAR ================================= */
  function renderWeek() {
    var d = App.Store.data;
    var host = App.el('div', { class: 'card pad', style: { marginBottom: '1.2rem' } });

    /* Repaint only this card when hours are logged, so tapping +1h does not
       rebuild the whole page. */
    function paint() {
      var week = App.hoursThisWeek();
      var ceiling = d.settings.workCeiling || 40;
      var target = d.settings.weeklyHoursTarget || 30;
      var days = App.lastNDays(14);
      var values = days.map(App.hoursOn);
      var maxH = Math.max.apply(null, values.concat([1]));

      App.clear(host);
      host.append(
        App.el('div', { class: 'row between' },
          App.el('div', {},
            App.el('div', { class: 'kicker' }, 'This week'),
            App.el('div', { class: 'row', style: { alignItems: 'baseline', gap: '.5rem' } },
              App.el('span', { class: 'num-lg' }, week + ' h'),
              App.el('span', { class: 'tiny muted' }, 'of ' + ceiling + ' h ceiling · target ' + target + ' h'))),
          App.el('div', { class: 'btn-row' },
            [1, 2, 4].map(function (n) {
              return App.el('button', { class: 'btn sm', onclick: function () {
                App.addHours(App.today(), n);
                paint();
                App.renderSideMini();
              } }, '+' + n + 'h');
            }),
            App.el('button', { class: 'btn sm ghost', onclick: function () {
              App.addHours(App.today(), -1);
              paint();
              App.renderSideMini();
            } }, '−1h')
          )
        ),
        App.el('div', { class: 'meter ' + (week > ceiling ? 'bad' : week > target ? 'warn' : ''), style: { margin: '.7rem 0' } },
          App.el('i', { style: { width: Math.min(100, (week / ceiling) * 100) + '%' } })),
        App.bars(values, { labels: days.map(function (x) { return App.fmtDate(x, 'short'); }), todayIndex: 13, over: 8, unit: 'h', height: 44, min: maxH }),
        App.el('div', { class: 'tiny muted', style: { marginTop: '.3rem' } }, 'Last 14 days · orange = today · red = over 8 hours')
      );
    }
    paint();
    return host;
  }

  /* =========================== PROJECTS GRID ============================= */
  function renderGames() {
    var d = App.Store.data;
    var grid = App.el('div', { class: 'grid g3' });
    d.games.forEach(function (g) {
      var L = App.data.labels[g.label];
      var tasks = g.tasks || [];
      var done = tasks.filter(function (t) { return t.status === 'done'; }).length;
      grid.append(App.el('div', { class: 'card hover card-top-bar ' + 'tier-' + g.label.toLowerCase() + (g.active ? ' accent-top' : ''), style: { cursor: 'pointer', borderTopColor: g.active ? 'var(--accent)' : null }, onclick: function (e) {
        if (e.target.closest('button, a')) return;
        App.navigate('#/plan/' + g.id);
      } },
        App.el('div', { class: 'row between', style: { alignItems: 'flex-start' } },
          App.el('span', { class: 'badge ' + L.color }, L.name),
          App.el('button', {
            class: 'icon-btn', title: g.active ? 'Stop working on this' : 'Work on this one',
            onclick: function () { App.activateGame(g.id); }
          }, App.svg(g.active ? 'M12 3 14.5 9h6l-4.8 3.6 1.8 6.4L12 15.4 6.5 19l1.8-6.4L3.5 9h6z' : 'M12 3 14.5 9h6l-4.8 3.6 1.8 6.4L12 15.4 6.5 19l1.8-6.4L3.5 9h6z'))),
        App.el('h3', { class: 'card-t', style: { marginTop: '.5rem' } }, g.title),
        g.codename ? App.el('div', { class: 'tiny muted' }, '“' + g.codename + '”') : null,
        App.el('div', { class: 'pip-track', style: { margin: '.7rem 0 .5rem' } }, App.data.stages.map(function (s) {
          return App.el('div', { class: 'pip ' + (s.n < g.stage ? 'done' : s.n === g.stage ? 'now' : ''), title: s.n + '. ' + s.name });
        })),
        App.el('div', { class: 'row between' },
          App.el('span', { class: 'tiny muted' }, 'Step ' + g.stage + ' · ' + App.data.stages[g.stage - 1].name),
          App.el('span', { class: 'tiny muted' }, done + '/' + tasks.length + ' tasks')),
        App.el('div', { class: 'btn-row', style: { marginTop: '.7rem' } },
          App.el('a', { class: 'btn sm', href: '#/design/' + g.id }, 'Design'),
          App.el('a', { class: 'btn sm ghost', href: '#/market/' + g.id }, 'Market'),
          App.el('a', { class: 'btn sm ghost', href: '#/marketing/' + g.id }, 'Marketing'))
      ));
    });
    return App.el('div', {}, App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Projects')), grid);
  }

  /* ============================== DETAIL ================================= */
  function renderDetail(root, g) {
    var L = App.data.labels[g.label];
    var st = App.data.stages[g.stage - 1];

    root.append(App.el('div', { class: 'card pad', style: { marginBottom: '1.2rem' } },
      App.el('div', { class: 'row between', style: { alignItems: 'flex-start' } },
        App.el('div', { style: { minWidth: 0 } },
          App.el('div', { class: 'kicker' }, L.name + ' · ' + App.stageStatus(g.stage)),
          App.el('h2', { class: 'h2' }, g.title),
          App.el('div', { class: 'row', style: { marginTop: '.3rem' } },
            App.el('span', { class: 'tiny muted' }, App.price(g.msrp) + ' planned'),
            App.el('span', { class: 'dot-sep' }),
            App.el('span', { class: 'tiny muted' }, g.targetWeeks + ' weeks planned'),
            g.targetRelease ? App.el('span', { class: 'dot-sep' }) : null,
            g.targetRelease ? App.el('span', { class: 'tiny muted' }, 'target ' + App.fmtDate(g.targetRelease, 'month')) : null,
            g.active ? App.el('span', { class: 'badge good', style: { marginLeft: '.4rem' } }, 'active') : null)),
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm' + (g.active ? '' : ' primary'), onclick: function () { App.activateGame(g.id); } }, g.active ? 'Stop working on this' : 'Work on this'),
          App.el('button', { class: 'btn sm ghost', onclick: function () { App.openNewGameDialog(g); } }, 'Edit'),
          App.el('button', { class: 'btn sm danger', onclick: function () { deleteGame(g); } }, 'Delete'))
      ),
      App.el('div', { class: 'btn-row', style: { marginTop: '.8rem' } },
        App.el('a', { class: 'btn sm', href: '#/design/' + g.id }, 'Design pages'),
        App.el('a', { class: 'btn sm ghost', href: '#/market/' + g.id }, 'Market research'),
        App.el('a', { class: 'btn sm ghost', href: '#/marketing/' + g.id }, 'Marketing plan'))
    ));

    /* ---- current step ---- */
    var cur = App.el('div', { class: 'card pad accent-top', style: { marginBottom: '1.2rem' } },
      App.el('div', { class: 'row between' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'You are on step ' + g.stage + ' of 10'),
          App.el('h3', { class: 'h2', style: { fontSize: '1.3rem' } }, st.name)),
        App.el('span', { class: 'badge info' }, App.stageStatus(g.stage))),
      App.el('p', { class: 'card-b', style: { marginTop: '.5rem' } }, st.goal),
      App.el('div', { class: 'callout plain', style: { marginBottom: '.6rem' } },
        App.el('div', { class: 'ct' }, 'Why this step matters'),
        App.el('p', {}, st.why)),
      App.el('div', { class: 'small' }, App.el('strong', {}, 'Finished when: '), st.deliverable),
      st.tips ? App.el('div', { style: { marginTop: '.7rem' } },
        App.el('div', { class: 'tiny', style: { fontWeight: '800', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '.3rem' } }, 'Tips'),
        App.el('ul', { class: 'tick small' }, st.tips.map(function (t) { return App.el('li', {}, t); }))) : null,
      App.el('div', { class: 'btn-row', style: { marginTop: '.9rem' } },
        g.stage > 1 ? App.el('button', { class: 'btn sm ghost', onclick: function () {
          g.stage -= 1; g.status = App.stageStatus(g.stage); App.Store.save(); App.renderRoute();
        } }, '← Previous step') : null,
        g.stage < 10 ? App.el('button', { class: 'btn sm primary', onclick: function () { tryAdvance(g); } }, 'Finish this step →') : App.el('span', { class: 'badge good' }, 'All ten steps done'))
    );
    root.append(cur);

    /* ---- step checklist ---- */
    var chkHost = App.el('div', {});
    App.bindChecklist(chkHost, 'game:' + g.id + ':stage:' + g.stage, 'Checklist for step ' + g.stage + ': ' + st.name, st.checklist, { celebrate: true });
    root.append(chkHost);

    /* ---- tasks ---- */
    root.append(tasksSection(g));

    /* ---- milestones ---- */
    root.append(milestonesSection(g));

    /* ---- all steps ---- */
    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'All ten steps')));
    var list = App.el('div', { class: 'stack', style: { gap: '.35rem' } });
    App.data.stages.forEach(function (s) {
      var cls = s.n < g.stage ? 'done' : s.n === g.stage ? 'now' : '';
      var state = App.Store.data.checklists['game:' + g.id + ':stage:' + s.n] || [];
      var doneN = state.filter(Boolean).length;
      list.append(App.el('div', {
        class: 'card', style: {
          padding: '.6rem .8rem', display: 'flex', gap: '.7rem', alignItems: 'center',
          opacity: cls === 'done' ? '.62' : '1',
          borderColor: cls === 'now' ? 'var(--accent)' : null,
          cursor: 'pointer'
        }, onclick: function () {
          g.stage = s.n; g.status = App.stageStatus(s.n); App.Store.save();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          App.renderRoute();
        } },
        App.el('span', { class: 'mono muted', style: { width: '1.6rem', flex: '0 0 1.6rem' } }, String(s.n).padStart(2, '0')),
        App.el('div', { style: { flex: '1', minWidth: 0 } },
          App.el('div', { class: 'small', style: { fontWeight: cls === 'now' ? '750' : '600', color: cls === 'now' ? 'var(--accent)' : null } }, s.name),
          App.el('div', { class: 'tiny muted' }, s.deliverable)),
        App.el('span', { class: 'tiny muted nowrap' }, doneN + '/' + s.checklist.length),
        cls === 'done' ? App.el('span', { class: 'badge good' }, 'done') : cls === 'now' ? App.el('span', { class: 'badge info' }, 'now') : null
      ));
    });
    root.append(list);

    /* ---- notes ---- */
    var notes = App.el('textarea', { style: { minHeight: '110px' } }, g.notes || '');
    notes.addEventListener('input', App.debounce(function () { g.notes = notes.value; App.Store.save(); }, 400));
    root.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Project notes')),
      App.el('div', { class: 'card pad' },
        App.el('p', { class: 'tiny muted' }, 'Anything that does not fit anywhere else. Decisions, links, things to remember.'),
        notes));
  }

  function tryAdvance(g) {
    var key = 'game:' + g.id + ':stage:' + g.stage;
    var state = App.Store.data.checklists[key] || [];
    var done = state.filter(Boolean).length;
    var total = App.data.stages[g.stage - 1].checklist.length;
    function advance() {
      g.stage = Math.min(10, g.stage + 1);
      g.status = App.stageStatus(g.stage);
      App.Store.save();
      App.confetti(30);
      App.toast('Step ' + (g.stage) + ': ' + App.data.stages[g.stage - 1].name, null, 3400);
      App.renderRoute();
    }
    if (done < total) {
      App.confirm({
        title: 'Some boxes are still unticked',
        body: done + ' of ' + total + ' are done. You can move on, but be honest about what is actually finished — pretending now costs you later.',
        confirmText: 'Move on anyway'
      }).then(function (ok) { if (ok) advance(); });
    } else advance();
  }

  function deleteGame(g) {
    App.confirm({
      title: 'Delete “' + g.title + '”?',
      body: 'This removes the project, its design pages, tasks, moodboard and marketing plan from this device. Save a backup first if you are unsure.',
      confirmText: 'Delete it',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      App.Store.data.games = App.Store.data.games.filter(function (x) { return x.id !== g.id; });
      App.Store.save();
      App.toast('Project deleted.');
      App.navigate('#/plan');
    });
  }

  /* =============================== TASKS ================================= */
  var COLS = [
    { id: 'todo', label: 'To do' },
    { id: 'doing', label: 'Doing' },
    { id: 'done', label: 'Done' }
  ];

  function tasksSection(g) {
    var wrap = App.el('div', { style: { marginTop: '2rem' } });
    var openCount = (g.tasks || []).filter(function (t) { return t.status !== 'done'; }).length;

    wrap.append(App.el('div', { class: 'section-head' },
      App.el('div', {},
        App.el('h2', { class: 'h2' }, 'Tasks'),
        App.el('p', { class: 'tiny muted' }, openCount + ' open. Drag them between columns.')),
      App.el('button', { class: 'btn sm primary', onclick: function () { addTask(g); } }, '+ Add task')));

    var board = App.el('div', { class: 'kanban' });
    COLS.forEach(function (col) {
      var items = (g.tasks || []).filter(function (t) { return t.status === col.id; });
      var colEl = App.el('div', { class: 'kb-col', dataset: { col: col.id } },
        App.el('div', { class: 'kb-head' }, App.el('h4', {}, col.label), App.el('span', { class: 'kb-count' }, String(items.length))));

      items.sort(function (a, b) {
        var o = { high: 0, medium: 1, low: 2 };
        return (o[a.priority] || 1) - (o[b.priority] || 1);
      }).forEach(function (t) {
        colEl.append(taskCard(g, t));
      });

      colEl.append(App.el('button', { class: 'kb-add', onclick: function () { addTask(g, col.id); } }, '+ Add'));
      wireDrop(colEl, g, col.id);
      board.append(colEl);
    });
    wrap.append(board);
    return wrap;
  }

  function taskCard(g, t) {
    var card = App.el('div', { class: 'kb-card' + (t.status === 'done' ? ' done' : ''), draggable: 'true' },
      App.el('div', { class: 'kb-t' }, t.title),
      App.el('div', { class: 'kb-meta' },
        t.priority === 'high' ? App.el('span', { class: 'badge bad' }, 'high') : null,
        t.priority === 'low' ? App.el('span', { class: 'badge gray' }, 'low') : null,
        t.due ? App.el('span', { class: 'badge ' + (t.due < App.today() && t.status !== 'done' ? 'bad' : 'gray') }, App.fmtDate(t.due, 'short')) : null,
        t.stage ? App.el('span', { class: 'badge gray' }, 'step ' + t.stage) : null)
    );
    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', t.id); } catch (err) {}
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
    card.addEventListener('click', function () { editTask(g, t); });
    return card;
  }

  function wireDrop(colEl, g, status) {
    colEl.addEventListener('dragover', function (e) { e.preventDefault(); colEl.classList.add('drop'); });
    colEl.addEventListener('dragleave', function () { colEl.classList.remove('drop'); });
    colEl.addEventListener('drop', function (e) {
      e.preventDefault();
      colEl.classList.remove('drop');
      var id;
      try { id = e.dataTransfer.getData('text/plain'); } catch (err) {}
      var t = (g.tasks || []).filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      t.status = status;
      if (status === 'done') { t.doneAt = App.today(); App.confetti(14); }
      App.Store.save();
      App.renderRoute();
    });
  }

  function addTask(g, status) {
    var title = App.el('input', { type: 'text', placeholder: 'What needs doing?' });
    var pr = App.el('select', {}, [['high', 'High'], ['medium', 'Normal'], ['low', 'Low']].map(function (p) {
      return App.el('option', { value: p[0], selected: p[0] === 'medium' ? 'selected' : null }, p[1]);
    }));
    var due = App.el('input', { type: 'date' });
    var m = App.modal({
      title: 'Add a task', narrow: true,
      body: App.el('div', {},
        App.field('Task', title),
        App.el('div', { class: 'field-row' }, App.field('Priority', pr), App.field('Due date', due)),
        App.el('p', { class: 'tiny muted' }, 'It will be tagged with step ' + g.stage + '.'),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            if (!title.value.trim()) { App.toast('Give it a name.', 'warn'); return; }
            g.tasks.push({ id: App.uid('t'), title: title.value.trim(), note: '', status: status || 'todo', priority: pr.value, due: due.value, created: App.today(), stage: g.stage });
            App.Store.save(); m.close(); App.renderRoute();
          } }, 'Add'))
      )
    });
  }

  function editTask(g, t) {
    var title = App.el('input', { type: 'text', value: t.title });
    var pr = App.el('select', {}, [['high', 'High'], ['medium', 'Normal'], ['low', 'Low']].map(function (p) {
      return App.el('option', { value: p[0], selected: t.priority === p[0] ? 'selected' : null }, p[1]);
    }));
    var status = App.el('select', {}, COLS.map(function (c) {
      return App.el('option', { value: c.id, selected: t.status === c.id ? 'selected' : null }, c.label);
    }));
    var due = App.el('input', { type: 'date', value: t.due || '' });
    var m = App.modal({
      title: 'Edit task', narrow: true,
      body: App.el('div', {},
        App.field('Task', title),
        App.el('div', { class: 'field-row' }, App.field('Column', status), App.field('Priority', pr)),
        App.field('Due date', due),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn danger', onclick: function () {
            g.tasks = g.tasks.filter(function (x) { return x.id !== t.id; });
            App.Store.save(); m.close(); App.renderRoute();
          } }, 'Delete'),
          App.el('button', { class: 'btn primary', onclick: function () {
            t.title = title.value.trim() || t.title;
            t.priority = pr.value;
            t.status = status.value;
            t.due = due.value;
            if (t.status === 'done' && !t.doneAt) t.doneAt = App.today();
            App.Store.save(); m.close(); App.renderRoute();
          } }, 'Save'))
      )
    });
  }

  /* ============================ MILESTONES =============================== */
  function milestonesSection(g) {
    var wrap = App.el('div', { style: { marginTop: '2rem' } });
    var ms = g.milestones || [];

    wrap.append(App.el('div', { class: 'section-head' },
      App.el('div', {},
        App.el('h2', { class: 'h2' }, 'Milestones'),
        App.el('p', { class: 'tiny muted' }, 'Dates you have promised yourself. A milestone is a promise, not a mood.')),
      App.el('button', { class: 'btn sm primary', onclick: function () { addMilestone(g); } }, '+ Add milestone')));

    if (!ms.length) {
      wrap.append(App.el('div', { class: 'card' },
        App.el('p', { class: 'card-s' }, 'No milestones yet.'),
        App.el('div', { class: 'btn-row' },
          App.el('button', { class: 'btn sm', onclick: function () { useSkeleton(g); } }, 'Use a starter set'))));
      return wrap;
    }

    ms.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    var host = App.el('div', { class: 'stack', style: { gap: '.4rem' } });
    ms.forEach(function (m2) {
      var days = m2.date ? App.daysBetween(App.today(), m2.date) : null;
      host.append(App.el('div', { class: 'card', style: { padding: '.65rem .85rem', display: 'flex', gap: '.7rem', alignItems: 'center', opacity: m2.done ? '.6' : '1' } },
        App.el('div', { class: 'chk-box' + (m2.done ? ' on' : ''), onclick: function () {
          m2.done = !m2.done;
          if (m2.done) App.confetti(20);
          App.Store.save(); App.renderRoute();
        } }),
        App.el('div', { style: { flex: '1', minWidth: 0 } },
          App.el('div', { class: m2.done ? 'strike small' : 'small', style: { fontWeight: '650' } }, m2.title),
          m2.note ? App.el('div', { class: 'tiny muted' }, m2.note) : null),
        m2.date ? App.el('span', { class: 'badge ' + (days < 0 && !m2.done ? 'bad' : days < 14 && !m2.done ? 'warn' : 'gray') },
          App.fmtDate(m2.date, 'short') + (m2.done ? '' : days >= 0 ? ' · ' + days + 'd' : ' · ' + Math.abs(days) + 'd late')) : null,
        App.el('button', { class: 'link-btn', onclick: function () {
          g.milestones = g.milestones.filter(function (x) { return x !== m2; });
          App.Store.save(); App.renderRoute();
        } }, 'Remove')
      ));
    });
    wrap.append(host);
    return wrap;
  }

  function addMilestone(g) {
    var title = App.el('input', { type: 'text', placeholder: 'e.g. Vertical slice finished' });
    var date = App.el('input', { type: 'date', value: App.addDays(App.today(), 28) });
    var note = App.el('input', { type: 'text', placeholder: 'What has to be true on that day?' });
    var m = App.modal({
      title: 'Add a milestone', narrow: true,
      body: App.el('div', {},
        App.field('What', title),
        App.field('When', date),
        App.field('Notes', note),
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn primary', onclick: function () {
            if (!title.value.trim()) { App.toast('Give it a name.', 'warn'); return; }
            g.milestones.push({ id: App.uid('m'), title: title.value.trim(), date: date.value, note: note.value, done: false });
            App.Store.save(); m.close(); App.renderRoute();
          } }, 'Add'))
      )
    });
  }

  function useSkeleton(g) {
    var L = App.data.labels[g.label];
    var sets = {
      A: [['Prototype is fun', 3], ['Vertical slice done', 6], ['All content in', 9], ['Polish and playtest', 12], ['Launch', 14]],
      B: [['Prototype is fun', 6], ['Vertical slice done', 14], ['Half the content in', 24], ['All content in', 32], ['Polish and playtest', 38], ['Launch', 42]],
      C: [['First episode prototyped', 20], ['First episode finished', 52], ['Second episode finished', 90], ['Final episode finished', 130], ['Launch', 140]]
    };
    var set = sets[g.label] || sets.A;
    set.forEach(function (s) {
      g.milestones.push({ id: App.uid('m'), title: s[0], date: App.addDays(App.today(), s[1] * 7), note: '', done: false });
    });
    App.Store.save();
    App.toast('Starter milestones added for a ' + L.name.toLowerCase() + '.');
    App.renderRoute();
  }

  /* ============================= TIMELINE ================================ */
  function renderTimeline() {
    var games = App.Store.data.games.filter(function (g) { return g.targetRelease; });
    var wrap = App.el('div', { style: { marginTop: '2.4rem' } });
    wrap.append(App.el('div', { class: 'section-head' }, App.el('h2', { class: 'h2' }, 'Release timeline')));

    if (!games.length) {
      wrap.append(App.el('div', { class: 'card' },
        App.el('p', { class: 'card-s' }, 'No target release months set yet. Edit a project to add one and it will show up here.')));
      return wrap;
    }
    wrap.append(App.el('p', { class: 'tiny muted', style: { marginBottom: '.8rem' } },
      'Leave four to six weeks between small game launches. Never overlap two projects that are both in full production.'));

    var years = {};
    games.forEach(function (g) {
      var y = String(g.targetRelease).slice(0, 4);
      (years[y] = years[y] || []).push(g);
    });

    Object.keys(years).sort().forEach(function (y) {
      var track = App.el('div', { class: 'tl-track' });
      years[y].forEach(function (g, i) {
        var start = g.startDate && String(g.startDate).slice(0, 4) === y
          ? new Date(g.startDate + 'T00:00:00')
          : new Date(y + '-01-01T00:00:00');
        var end = new Date(String(g.targetRelease) + '-01T00:00:00');
        var sM = start.getMonth() + (start.getDate() - 1) / 31;
        var eM = Math.min(12, end.getMonth() + 1);
        if (eM <= sM) eM = Math.min(12, sM + 1);
        var left = (sM / 12) * 100;
        var width = Math.max(7, ((eM - sM) / 12) * 100);
        track.append(App.el('div', {
          class: 'tl-block ' + g.label.toLowerCase(),
          style: { left: left + '%', width: width + '%', top: (6 + i * 0) + 'px' },
          title: g.title
        }, g.title));
      });
      wrap.append(App.el('div', {},
        App.el('div', { class: 'tl-row' }, App.el('div', { class: 'tl-year' }, y), track),
        App.el('div', { class: 'tl-row' }, App.el('div', {}),
          App.el('div', { class: 'tl-months' }, ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(function (m2) {
            return App.el('span', {}, m2);
          })))));
    });

    var activeCount = App.Store.data.games.filter(function (g) { return g.active; }).length;
    if (activeCount > 1) {
      wrap.append(App.el('div', { class: 'callout warn' },
        App.el('div', { class: 'ct' }, 'Two projects are marked active'),
        App.el('p', {}, activeCount + ' projects are in production at the same time. Pick one. This is the single most important rule in the whole app.')));
    }
    return wrap;
  }

  /* ============================ WEEKLY REVIEW ============================ */
  function renderReview() {
    var key = 'weekly:' + App.today().slice(0, 4) + '-' + weekNumber();
    var host = App.el('div', {});
    var ta = App.el('textarea', { placeholder: 'Two minutes. What did you finish, what got in the way, what is Monday?', style: { minHeight: '110px' } });
    var saved = App.Store.data.checklists[key];
    if (typeof saved === 'string') ta.value = saved;
    ta.addEventListener('input', App.debounce(function () {
      App.Store.data.checklists[key] = ta.value;
      App.Store.save();
      App.toast('Saved.');
    }, 900));

    host.append(App.el('div', { class: 'section-head' },
      App.el('div', {},
        App.el('h2', { class: 'h2' }, 'Weekly review'),
        App.el('p', { class: 'tiny muted' }, 'Word count: ' + (ta.value ? ta.value.trim().split(/\s+/).length : 0) + '. This is the habit that keeps a long project honest.')),
      App.el('button', { class: 'btn sm ghost', onclick: function () {
        App.presentExport('Weekly review', 'review-' + App.today() + '.md', '# Weekly review — ' + App.today() + '\n\n' + ta.value, 'text/markdown');
      } }, 'Export')));
    host.append(App.el('div', { class: 'card pad' }, ta));
    return host;
  }

  function weekNumber() {
    var d = new Date();
    var onejan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  }
})();
