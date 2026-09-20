/* ==========================================================================
   VIEW — LEARN (the guides, written in plain language)
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  App.views.learn = {
    render: function (root, params) {
      var ids = Object.keys(App.guides);
      var volId = (params && params[0]) || ids[0];
      var vol = App.guides[volId];
      if (!vol) { volId = ids[0]; vol = App.guides[ids[0]]; }

      root.append(App.el('div', { class: 'page-head' },
        App.el('div', {},
          App.el('div', { class: 'kicker' }, 'Learn'),
          App.el('h1', { class: 'h1' }, 'Three guides')),
        App.el('div', { class: 'ph-actions' },
          App.el('button', { class: 'btn', onclick: function () { window.print(); } }, 'Print / PDF'))));

      /* volume picker */
      root.append(App.el('div', { class: 'grid g3', style: { marginBottom: '1.4rem' } }, ids.map(function (id) {
        var g = App.guides[id];
        var on = id === volId;
        return App.el('div', {
          class: 'card hover', style: {
            cursor: 'pointer',
            borderColor: on ? 'var(--accent)' : null,
            background: on ? 'var(--accent-soft)' : null
          },
          onclick: function () { App.navigate('#/learn/' + id); }
        },
          App.el('div', { class: 'row between' },
            App.el('span', { class: 'badge ' + (on ? 'good' : 'gray') }, on ? 'reading' : 'open'),
            App.el('span', { class: 'tiny muted' }, g.sections.length + ' sections')),
          App.el('h3', { class: 'card-t', style: { marginTop: '.5rem' } }, g.label),
          App.el('p', { class: 'card-s' }, g.tag));
      })));

      root.append(App.el('div', { class: 'hero', style: { marginBottom: '1.2rem' } },
        App.el('h2', { class: 'h2', style: { fontSize: 'clamp(1.4rem,2.6vw,1.9rem)' } }, vol.title),
        App.el('p', { class: 'lead', style: { marginTop: '.4rem' } }, vol.deck)));

      /* section chip nav */
      root.append(App.el('div', { class: 'pill-row', style: { marginBottom: '1.4rem' } }, vol.sections.map(function (s) {
        return App.el('a', { class: 'chip click', href: '#/learn/' + volId + '/' + s.id, onclick: function (e) {
          e.preventDefault();
          var el = document.getElementById(s.id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } }, s.title);
      })));

      vol.sections.forEach(function (s, i) {
        var sec = App.el('section', { class: 'guide-section', id: s.id, style: { marginBottom: '2.4rem', scrollMarginTop: '80px' } });
        sec.append(
          App.el('div', { class: 'kicker' }, 'Section ' + String(i + 1).padStart(2, '0')),
          App.el('h2', { class: 'h2', style: { marginBottom: '.6rem' } }, s.title));
        s.blocks.forEach(function (b) { sec.append(renderBlock(b)); });
        root.append(sec);
      });

      root.append(App.el('hr', {}));
      root.append(App.el('p', { class: 'tiny muted' },
        'Cross-checked against public reporting from September 2026. Every number used in these guides is listed with its source in the Vault.'));
    }
  };

  /* ------------------------------ block renderer -------------------------- */
  function renderBlock(b) {
    switch (b.t) {
      case 'p': return App.el('p', {}, App.frag(App.md(b.x)));
      case 'lead': return App.el('p', { class: 'lead' }, App.frag(App.md(b.x)));
      case 'h': return App.el('h3', { class: 'h3', style: { marginTop: '1.5rem', marginBottom: '.4rem' } }, App.frag(App.md(b.x)));
      case 'list': return App.el('ul', { class: 'tick' }, b.items.map(function (it) { return App.el('li', {}, App.frag(App.md(it))); }));
      case 'ol': return App.el('ol', { class: 'tick' }, b.items.map(function (it) { return App.el('li', {}, App.frag(App.md(it))); }));
      case 'table':
        return App.el('div', { class: 'tbl-wrap' },
          App.el('table', { class: 'tbl' },
            App.el('thead', {}, App.el('tr', {}, b.head.map(function (h) { return App.el('th', {}, h); }))),
            App.el('tbody', {}, b.rows.map(function (r) {
              return App.el('tr', {}, r.map(function (cell) { return App.el('td', {}, App.frag(App.md(String(cell)))); }));
            }))));
      case 'callout':
        return App.el('div', { class: 'callout ' + (b.kind || '') },
          b.title ? App.el('div', { class: 'ct' }, b.title) : null,
          App.el('p', {}, App.frag(App.md(b.x))));
      case 'quote':
        return App.el('blockquote', { class: 'quote' },
          App.el('p', {}, App.frag(App.md(b.x))),
          b.cite ? App.el('div', { class: 'tiny muted' }, '— ' + b.cite) : null);
      case 'verdict':
        return App.el('div', { class: 'verdict' }, App.el('div', { class: 'vt' }, b.tag), App.el('p', {}, App.frag(App.md(b.x))));
      case 'pins':
        return App.el('div', { class: 'row', style: { gap: '.6rem', margin: '.8rem 0' } },
          App.el('div', { class: 'meter', style: { maxWidth: '180px', flex: '1' } },
            App.el('i', { style: { width: ((b.score / (b.max || 10)) * 100) + '%' } })),
          App.el('span', { class: 'tiny muted' }, b.label || ''));
      case 'stats':
        return App.el('div', { class: 'grid g4', style: { margin: '1rem 0' } }, b.items.map(function (s) {
          return App.el('div', { class: 'stat accent' },
            App.el('div', { class: 'k' }, s.k),
            App.el('div', { class: 'v' }, s.v),
            s.s ? App.el('div', { class: 's' }, s.s) : null);
        }));
      case 'cards':
        return App.el('div', { class: 'grid g3', style: { margin: '1rem 0' } }, b.items.map(function (c) {
          return App.el('div', { class: 'card card-top-bar ' + (c.badge || '') },
            App.el('h3', { class: 'card-t' }, c.title),
            App.el('p', { class: 'card-body' }, App.frag(App.md(c.x))));
        }));
      case 'academic':
        return App.el('div', { class: 'card pad', style: { margin: '1.2rem 0' } },
          App.el('h3', { class: 'card-t' }, b.title),
          App.el('p', { class: 'card-body' }, App.frag(App.md(b.summary))),
          App.el('div', { class: 'stack', style: { gap: '.5rem', marginTop: '.8rem' } }, b.rows.map(function (r) {
            return App.el('div', {},
              App.el('div', { class: 'row', style: { gap: '.5rem' } },
                App.el('div', { class: 'meter sm', style: { maxWidth: '90px', flex: '0 0 90px' } },
                  App.el('i', { style: { width: ((r.score / 10) * 100) + '%' } })),
                App.el('span', { class: 'tiny', style: { fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' } }, r.label)),
              App.el('p', { class: 'small', style: { margin: '.2rem 0 0' } }, App.frag(App.md(r.claim))));
          })));
      case 'code': return codeBlock(b.title, b.code);
      case 'ascii': return App.el('div', { class: 'codeblock' }, App.el('pre', {}, b.x));
      default: return App.el('p', {}, b.x || '');
    }
  }

  function codeBlock(title, code) {
    var btn = App.el('button', { class: 'copy-btn' }, 'Copy');
    btn.addEventListener('click', function () {
      App.copyText(code);
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
    });
    return App.el('div', { class: 'codeblock' },
      App.el('div', { class: 'codeblock-head' }, App.el('span', {}, title || 'code'), btn),
      App.el('pre', {}, App.el('code', {}, code)));
  }
})();
