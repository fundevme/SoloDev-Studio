/* ==========================================================================
   SoloDev Studio — core runtime
   DOM helpers, storage, routing, animated UI kit, charts.
   No dependencies. Runs from file:// and inside an Android WebView.
   ========================================================================== */
(function () {
  'use strict';

  var App = window.App = window.App || {};
  App.views = App.views || {};
  App.guides = App.guides || {};

  var HAS_DOM = typeof document !== 'undefined';

  /* ======================================================================== */
  /* DOM HELPERS                                                              */
  /* ======================================================================== */

  /* Genuinely boolean attributes. Without this, passing 0 (a perfectly
     reasonable "off" value) would set the attribute and switch the feature
     ON — `disabled: 0` would disable the button. */
  var BOOL_ATTRS = { disabled: 1, checked: 1, readonly: 1, hidden: 1, selected: 1, required: 1, multiple: 1, autofocus: 1, open: 1 };

  App.el = function el(tag, attrs) {
    var n = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (BOOL_ATTRS[k]) { if (v) n.setAttribute(k, ''); }
        else if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'style') {
          if (typeof v === 'string') n.setAttribute('style', v);
          else for (var s in v) {
            if (v[s] == null) continue;
            /* setProperty only understands real CSS names, so a key written as
               marginBottom has to become margin-bottom. Without this the style
               is silently dropped and nothing is applied at all. */
            var prop = s.indexOf('--') === 0 ? s : s.replace(/[A-Z]/g, function (m) {
              return '-' + m.toLowerCase();
            });
            try { n.style.setProperty(prop, String(v[s])); } catch (e) {}
          }
        }
        else if (k === 'dataset') { for (var d in v) n.dataset[d] = v[d]; }
        else if (k.indexOf('on') === 0 && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else if (v === true) n.setAttribute(k, '');
        else n.setAttribute(k, v);
      }
    }
    addKids(n, kids);
    return n;
  };

  function addKids(n, kids) {
    kids.forEach(function (kid) {
      if (kid == null || kid === false || kid === true) return;
      if (Array.isArray(kid)) { addKids(n, kid); return; }
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
  }
  App.addKids = addKids;

  App.svg = function (paths, attrs) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', (attrs && attrs.viewBox) || '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', (attrs && attrs.sw) || '1.7');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    if (attrs && attrs.class) s.setAttribute('class', attrs.class);
    String(paths).split('|').forEach(function (d) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d.trim());
      s.appendChild(p);
    });
    return s;
  };

  App.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* Very small markdown: **bold** *italic* `code` [text](url) */
  App.md = function (s) {
    var t = App.esc(s);
    t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    t = t.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
    return t;
  };

  App.frag = function (html) {
    var t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content;
  };

  App.clear = function (node) { while (node.firstChild) node.removeChild(node.firstChild); return node; };

  /* ======================================================================== */
  /* FORMATTING                                                               */
  /* ======================================================================== */

  App.money = function (n, opts) {
    opts = opts || {};
    if (!isFinite(n)) n = 0;
    var sign = n < 0 ? '-' : '';
    var v = Math.abs(n);
    var s;
    if (opts.exact) s = v.toFixed(2);
    else if (v >= 1e9) s = (v / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
    else if (v >= 1e6) s = (v / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
    else if (v >= 1e4) s = Math.round(v / 1e3) + 'k';
    else if (v >= 1e3) s = (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    else s = v.toFixed(v < 100 ? 2 : 0);
    return sign + '$' + s;
  };
  App.price = function (n) { return '$' + (Number(n) || 0).toFixed(2); };
  App.num = function (n) { return (Number(n) || 0).toLocaleString('en-US'); };
  App.compact = function (n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(Math.abs(n) % 1e3 === 0 ? 0 : 1) + 'k';
    return String(Math.round(n));
  };
  App.pct = function (n, d) { return (Number(n) || 0).toFixed(d == null ? 0 : d) + '%'; };
  App.uid = function (p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  App.today = function () { return new Date().toISOString().slice(0, 10); };
  App.dayName = function (d) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(d || new Date()).getDay()]; };
  App.fmtDate = function (iso, style) {
    if (!iso) return '—';
    var d = new Date(String(iso).length <= 7 ? iso + '-01T00:00:00' : iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    if (style === 'short') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (style === 'month') return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  App.daysBetween = function (a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  };
  App.addDays = function (iso, n) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  App.debounce = function (fn, ms) {
    var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms || 250); };
  };
  App.clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  App.sum = function (arr, fn) { return arr.reduce(function (a, x) { return a + (fn ? Number(fn(x)) || 0 : Number(x) || 0); }, 0); };
  App.median = function (arr) {
    var a = arr.map(Number).filter(function (x) { return isFinite(x); }).sort(function (x, y) { return x - y; });
    if (!a.length) return 0;
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  };
  App.slug = function (s) { return String(s || 'file').replace(/[^\w\-]+/g, '_').slice(0, 60); };
  App.hex2rgb = function (h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  App.luminance = function (h) {
    var c = App.hex2rgb(h);
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  };
  App.textOn = function (h) { return App.luminance(h) > 0.62 ? '#101418' : '#ffffff'; };

  /* ======================================================================== */
  /* STORAGE                                                                  */
  /* ======================================================================== */

  var KEY = 'solodev.studio.data.v2';
  var OLD_KEY = 'solodev.studio.data.v1';

  function defaults() {
    return {
      version: 2,
      theme: 'dark',
      settings: {
        skipSplash: false,
        studioName: '',
        weeklyHoursTarget: 30,
        workCeiling: 40,
        regionalBlend: 0.70,
        refundRate: 0.10,
        taxRate: 0.10,
        steamCut: 0.30,
        currency: 'USD',
        liteEffects: false
      },
      games: [],
      log: {},
      checklists: {},
      comps: [],
      ideas: [],
      notes: [],
      seeded: false,
      meta: { created: '', lastOpen: '' }
    };
  }

  App.Store = {
    data: defaults(),
    KEY: KEY,

    load: function () {
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) {}
      if (!raw) { try { raw = localStorage.getItem(OLD_KEY); } catch (e) {} }
      if (raw) {
        try {
          var parsed = JSON.parse(raw);
          this.data = migrate(parsed);
        } catch (e) { this.data = defaults(); }
      }
      if (!this.data.meta.created) this.data.meta.created = App.today();
      this.data.meta.lastOpen = App.today();
      return this.data;
    },

    save: App.debounce(function () {
      try { localStorage.setItem(KEY, JSON.stringify(App.Store.data)); }
      catch (e) { App.toast('Storage is full. Export a backup from the Vault to free space.', 'bad'); }
    }, 200),

    saveNow: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },

    game: function (id) {
      var g = this.data.games;
      for (var i = 0; i < g.length; i++) if (g[i].id === id) return g[i];
      return null;
    },
    activeGame: function () {
      var g = this.data.games.filter(function (x) { return x.active; });
      return g[0] || null;
    },
    primaryGame: function (id) {
      if (id) { var g = this.game(id); if (g) return g; }
      return this.activeGame() || this.data.games[0] || null;
    },
    reset: function () { this.data = defaults(); this.data.meta.created = App.today(); this.saveNow(); },
    exportJSON: function () { return JSON.stringify(this.data, null, 2); },
    importJSON: function (text) {
      var parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.games)) throw new Error('That does not look like a SoloDev Studio backup.');
      this.data = migrate(parsed);
      this.saveNow();
    },
    sizeKB: function () {
      try { return ((localStorage.getItem(KEY) || '').length / 1024).toFixed(1); } catch (e) { return '0'; }
    }
  };

  function migrate(old) {
    var base = defaults();
    var d = old || {};
    if (!d.version || d.version < 2) {
      /* v1 -> v2: keep everything that still exists, add the new containers. */
      d.version = 2;
      d.theme = d.theme === 'paper' ? 'paper' : (d.theme === 'light' ? 'light' : 'dark');
      d.meta = { created: App.today(), lastOpen: App.today() };
      d.ideas = d.ideas || [];
      d.notes = d.notes || [];
      d.settings = Object.assign({}, base.settings, d.settings || {});
      (d.games || []).forEach(function (g) { upgradeGame(g); });
    }
    ['games', 'comps', 'ideas', 'notes'].forEach(function (k) { if (!Array.isArray(d[k])) d[k] = base[k]; });
    d.settings = Object.assign({}, base.settings, d.settings || {});
    d.log = d.log || {};
    d.checklists = d.checklists || {};
    d.meta = Object.assign({}, base.meta, d.meta || {});
    /* backfill any v2 fields a game is missing */
    (d.games || []).forEach(function (g) { upgradeGame(g); });
    return d;
  }

  function upgradeGame(g) {
    g.tasks = g.tasks || [];
    g.milestones = g.milestones || [];
    g.stageChecks = g.stageChecks || {};
    g.tags = g.tags || [];
    g.links = g.links || [];
    g.mood = g.mood || { tiles: [] };
    g.mood.tiles = g.mood.tiles || [];
    /* Earlier builds cached a resolved blob: URL on the tile itself. Those are
       written to disk with everything else and are dead the next time the app
       opens, so the board would render blank. Clear them on the way in. */
    g.mood.tiles.forEach(function (t) {
      if (t && typeof t === 'object') { delete t._url; delete t._src; }
    });
    g.market = g.market || {};
    g.market.wishlists = g.market.wishlists || [];
    g.market.notes = g.market.notes || '';
    g.market.audience = g.market.audience || '';
    g.market.hooks = g.market.hooks || [];
    g.marketing = g.marketing || {};
    g.marketing.campaigns = g.marketing.campaigns || [];
    g.marketing.content = g.marketing.content || [];
    g.marketing.press = g.marketing.press || [];
    g.marketing.budget = g.marketing.budget || [];
    g.marketing.copy = g.marketing.copy || { short: '', long: '', features: '', tags: '' };
    g.marketing.channels = g.marketing.channels || [];
    g.gdd = g.gdd || {};
    g.gdd.concept = g.gdd.concept || { pitch: '', genre: '', audience: '', hook: '', usp: '' };
    g.gdd.pillars = g.gdd.pillars && g.gdd.pillars.length ? g.gdd.pillars : [{ t: '', d: '' }, { t: '', d: '' }, { t: '', d: '' }];
    g.gdd.loops = g.gdd.loops || { micro: '', meso: '', macro: '' };
    g.gdd.ledger = g.gdd.ledger || [];
    g.gdd.world = g.gdd.world || { rules: '', factions: '', notes: '' };
    g.gdd.characters = g.gdd.characters || [];
    g.gdd.art = g.gdd.art || { palette: [], notes: '', shader: '' };
    g.gdd.tech = g.gdd.tech || {};
    g.gdd.plan = g.gdd.plan || { milestones: [], risks: '' };
    g.gdd.feel = g.gdd.feel || { camera: '', feedback: '', controls: '', audio: '' };
    g.gdd.balance = g.gdd.balance || { economy: '', difficulty: '', tuning: '' };
    g.gdd.playtest = g.gdd.playtest || [];
    g.gdd.cuts = g.gdd.cuts || [];
    return g;
  }
  App.upgradeGame = upgradeGame;

  /* ======================================================================== */
  /* IMAGE STORE                                                              */
  /* Full-size image files live in IndexedDB, kept exactly as they came off   */
  /* the disk. They are never resized, re-encoded or compressed.             */
  /*                                                                          */
  /* They are not kept in the settings blob on purpose: that lives in         */
  /* localStorage, which browsers cap at about 5 MB, so a single photo would  */
  /* break every save in the app. IndexedDB has no practical limit, so a      */
  /* board can hold as many full-resolution images as you like.              */
  /* ======================================================================== */

  App.bytes = function (n) {
    n = Number(n) || 0;
    if (n >= 1073741824) return (n / 1073741824).toFixed(2) + ' GB';
    if (n >= 1048576) return (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + ' MB';
    if (n >= 1024) return Math.round(n / 1024) + ' KB';
    return Math.round(n) + ' B';
  };

  App.Images = (function () {
    var DB_NAME = 'solodev-media';
    var DB_VERSION = 1;
    var STORE = 'images';
    var dbPromise = null;
    var usable = true;
    var cache = {};      /* id -> object URL */
    var misses = {};     /* ids known not to resolve, so we stop retrying */

    function open() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise(function (resolve, reject) {
        if (!window.indexedDB) { usable = false; reject(new Error('This device will not let the app store images.')); return; }
        var req;
        try { req = indexedDB.open(DB_NAME, DB_VERSION); }
        catch (e) { usable = false; reject(e); return; }
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { usable = false; reject(req.error || new Error('Could not open the image store.')); };
        req.onblocked = function () { usable = false; reject(new Error('The image store is blocked by another window.')); };
      });
      return dbPromise;
    }

    function withStore(mode, fn) {
      return open().then(function (db) {
        return new Promise(function (resolve, reject) {
          var t = db.transaction(STORE, mode);
          var req;
          try { req = fn(t.objectStore(STORE)); } catch (e) { reject(e); return; }
          t.oncomplete = function () { resolve(req ? req.result : undefined); };
          t.onerror = function () { reject(t.error); };
          t.onabort = function () { reject(t.error); };
        });
      });
    }

    function objectUrlFor(rec) {
      if (cache[rec.id]) return cache[rec.id];
      var url = URL.createObjectURL(rec.blob);
      cache[rec.id] = url;
      return url;
    }

    /* Measure a file without changing a single pixel of it. */
    function measure(blob, cb) {
      if (window.createImageBitmap) {
        createImageBitmap(blob).then(function (bmp) {
          cb(bmp.width, bmp.height);
          if (bmp.close) bmp.close();
        }).catch(function () { measureViaImage(blob, cb); });
      } else measureViaImage(blob, cb);
    }
    function measureViaImage(blob, cb) {
      var url = URL.createObjectURL(blob);
      var im = new Image();
      im.onload = function () { cb(im.naturalWidth, im.naturalHeight); URL.revokeObjectURL(url); };
      im.onerror = function () { cb(0, 0); URL.revokeObjectURL(url); };
      im.src = url;
    }

    return {
      available: function () { return usable; },

      /* Store a File exactly as it is. No canvas, no resize, no re-encode. */
      put: function (file, cb) {
        measure(file, function (w, h) {
          var id = App.uid('img');
          var rec = {
            id: id, blob: file, name: file.name || 'image',
            type: file.type || 'image/jpeg',
            w: w, h: h, bytes: file.size || 0,
            added: new Date().toISOString()
          };
          withStore('readwrite', function (s) { return s.put(rec); }).then(function () {
            cache[id] = URL.createObjectURL(file);
            cb({ id: id, url: cache[id], name: rec.name, w: w, h: h, bytes: rec.bytes });
          }).catch(function (err) {
            cb(null, err && err.message);
          });
        });
      },

      /* Resolve an id to a usable URL. Cached, so this is cheap after the first call. */
      url: function (id, cb) {
        if (!id) { cb(null); return; }
        if (cache[id]) { cb(cache[id]); return; }
        if (misses[id]) { cb(null); return; }
        withStore('readonly', function (s) { return s.get(id); }).then(function (rec) {
          if (!rec || !rec.blob) { misses[id] = true; cb(null); return; }
          cb(objectUrlFor(rec));
        }).catch(function () { misses[id] = true; cb(null); });
      },

      meta: function (id, cb) {
        withStore('readonly', function (s) { return s.get(id); }).then(function (rec) {
          cb(rec ? { name: rec.name, w: rec.w, h: rec.h, bytes: rec.bytes, type: rec.type } : null);
        }).catch(function () { cb(null); });
      },

      remove: function (id) {
        if (!id) return;
        if (cache[id]) { try { URL.revokeObjectURL(cache[id]); } catch (e) {} delete cache[id]; }
        delete misses[id];
        withStore('readwrite', function (s) { return s.delete(id); }).catch(function () {});
      },

      /* Everything stored, so we can report the real total. */
      all: function (cb) {
        withStore('readonly', function (s) { return s.getAll(); }).then(function (recs) {
          cb(recs || []);
        }).catch(function () { cb([]); });
      },

      total: function (cb) {
        this.all(function (recs) {
          var bytes = 0;
          recs.forEach(function (r) { bytes += Number(r.bytes) || 0; });
          cb(bytes, recs.length);
        });
      },

      /* Delete every stored image. */
      clear: function (cb) {
        Object.keys(cache).forEach(function (k) { try { URL.revokeObjectURL(cache[k]); } catch (e) {} });
        cache = {}; misses = {};
        withStore('readwrite', function (s) { return s.clear(); }).then(function () { cb && cb(); })
          .catch(function () { cb && cb(); });
      },

      /* Older versions embedded images in the settings blob as data URLs.
         Move any of those into the image store, at full size, once. */
      migrate: function (done) {
        var d = App.Store.data;
        var queue = [];
        (d.games || []).forEach(function (g) {
          ((g.mood && g.mood.tiles) || []).forEach(function (t) {
            if (t.type === 'image' && t.local && typeof t.url === 'string' && t.url.indexOf('data:') === 0 && !t.imgId) {
              queue.push(t);
            }
          });
        });
        if (!queue.length) { done && done(0); return; }

        var left = queue.length;
        var moved = 0;
        queue.forEach(function (t) {
          var blob;
          try { blob = dataUrlToBlob(t.url); } catch (e) { blob = null; }
          if (!blob) { left--; if (!left) finish(); return; }
          measure(blob, function (w, h) {
            var id = App.uid('img');
            withStore('readwrite', function (s) {
              return s.put({ id: id, blob: blob, name: 'image', type: blob.type || 'image/jpeg', w: w, h: h, bytes: blob.size || 0, added: new Date().toISOString() });
            }).then(function () {
              t.imgId = id;
              t.bytes = blob.size || 0;
              t.w = w; t.h = h;
              delete t.url;
              delete t.local;
              moved++;
            }).catch(function () {}).then(function () {
              left--;
              if (!left) finish();
            });
          });
        });

        function finish() {
          if (moved) App.Store.saveNow();
          done && done(moved);
        }
      }
    };

    function dataUrlToBlob(dataUrl) {
      var parts = String(dataUrl).split(',');
      if (parts.length < 2) throw new Error('bad data url');
      var mime = /:(.*?);/.exec(parts[0]);
      var bin = atob(parts[1]);
      var u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Blob([u8], { type: mime ? mime[1] : 'image/jpeg' });
    }
  })();

  /* ======================================================================== */
  /* GAME FACTORY                                                             */
  /* ======================================================================== */

  App.newGame = function (fields) {
    var f = fields || {};
    var label = f.label || 'A';
    var tpl = (App.data && App.data.gddTemplates && App.data.gddTemplates[label]) || {};
    var g = {
      id: App.uid('g'),
      title: f.title || 'Untitled game',
      codename: f.codename || '',
      label: label,
      stage: 1,
      status: 'Idea',
      active: false,
      msrp: f.msrp != null ? f.msrp : (App.data ? App.data.labels[label].msrp : 6.99),
      targetWeeks: f.targetWeeks || 12,
      startDate: App.today(),
      targetRelease: f.targetRelease || '',
      notes: f.notes || '',
      tags: [],
      links: [],
      tasks: [],
      milestones: [],
      stageChecks: {},
      gdd: {
        concept: { pitch: '', genre: '', audience: '', hook: '', usp: '' },
        pillars: [{ t: '', d: '' }, { t: '', d: '' }, { t: '', d: '' }],
        loops: { micro: '', meso: '', macro: '' },
        ledger: [],
        world: { rules: '', factions: '', notes: '' },
        characters: [],
        art: { palette: ['#0f766e', '#f5f5f4', '#171c22', '#f59e0b', '#8b7cf6'], notes: '', shader: '' },
        tech: Object.assign({ trisHero: 9500, trisEnemy: 1800, drawCalls: 110, vramMB: 1200, fps: 60 }, (tpl.tech || {})),
        plan: { milestones: [], risks: '' },
        feel: { camera: '', feedback: '', controls: '', audio: '' },
        balance: { economy: '', difficulty: '', tuning: '' },
        playtest: [],
        cuts: []
      },
      mood: { tiles: [] },
      market: { tags: [], notes: '', audience: '', hooks: [], wishlists: [] },
      marketing: { campaigns: [], content: [], press: [], budget: [], channels: [], copy: { short: '', long: '', features: '', tags: '' } }
    };
    if (tpl.pillars) g.gdd.pillars = tpl.pillars.map(function (p) { return { t: p.t, d: p.d }; });
    if (tpl.loops) g.gdd.loops = Object.assign({}, tpl.loops);
    return g;
  };

  /* Seed a starter set of tasks for a freshly created project. */
  App.starterTasks = function (stage) {
    var packs = App.data && App.data.starterTasks;
    if (!packs) return [];
    var list = packs[String(stage || 1)] || [];
    return list.map(function (t) {
      return { id: App.uid('t'), title: t, note: '', status: 'todo', priority: 'medium', due: '', created: App.today(), stage: stage || 1 };
    });
  };

  /* ======================================================================== */
  /* HOURS LOG                                                                */
  /* ======================================================================== */

  App.hoursOn = function (date) { return Number(App.Store.data.log[date] || 0); };

  App.lastNDays = function (n, endDate) {
    var out = [];
    var base = endDate ? new Date(endDate + 'T00:00:00') : new Date();
    for (var i = n - 1; i >= 0; i--) {
      var dt = new Date(base.getTime() - i * 86400000);
      out.push(dt.toISOString().slice(0, 10));
    }
    return out;
  };

  App.hoursThisWeek = function () {
    return App.sum(App.lastNDays(7), App.hoursOn);
  };

  App.addHours = function (date, n) {
    var d = App.Store.data;
    var cur = Number(d.log[date] || 0);
    d.log[date] = Math.max(0, Math.round((cur + n) * 10) / 10);
    App.Store.save();
    return d.log[date];
  };

  /* ======================================================================== */
  /* CHECKLISTS                                                               */
  /* ======================================================================== */

  App.bindChecklist = function (host, listId, title, items, opts) {
    opts = opts || {};
    var data = App.Store.data;
    var state = data.checklists[listId];
    if (!Array.isArray(state) || state.length !== items.length) state = items.map(function () { return false; });
    data.checklists[listId] = state;

    var countEl = App.el('span', { class: 'chk-count' });
    var progEl = App.el('i');
    var rows = items.map(function (item, i) {
      var box = App.el('div', { class: 'chk-box' + (state[i] ? ' on' : ''), role: 'checkbox', tabindex: '0' });
      var lab = App.el('label', { class: state[i] ? 'done' : '' }, App.frag(App.md(item)));
      function toggle() {
        state[i] = !state[i];
        box.classList.toggle('on', state[i]);
        lab.classList.toggle('done', state[i]);
        App.Store.save();
        refresh();
        if (state.every(Boolean) && opts.celebrate !== false) App.confetti(16);
      }
      box.addEventListener('click', toggle);
      box.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
      lab.addEventListener('click', toggle);
      return App.el('div', { class: 'chk-row' }, box, lab);
    });

    function refresh() {
      var done = state.filter(Boolean).length;
      countEl.textContent = done + ' of ' + items.length;
      progEl.style.width = (items.length ? (done / items.length) * 100 : 0) + '%';
    }

    var wrap = App.el('div', { class: 'checklist' },
      App.el('div', { class: 'checklist-head' }, App.el('h4', { text: title }), countEl),
      App.el('div', { class: 'chk-prog' }, progEl)
    );
    rows.forEach(function (r) { wrap.append(r); });

    if (opts.resettable !== false) {
      wrap.append(App.el('button', { class: 'link-btn', style: { marginTop: '.5rem' }, onclick: function () {
        state.forEach(function (_, i) { state[i] = false; });
        App.Store.save();
        wrap.querySelectorAll('.chk-box').forEach(function (b) { b.classList.remove('on'); });
        wrap.querySelectorAll('label').forEach(function (l) { l.classList.remove('done'); });
        refresh();
      } }, 'Clear this list'));
    }
    refresh();
    if (host) host.append(wrap);
    return { node: wrap, state: state, refresh: refresh };
  };

  /* ======================================================================== */
  /* MODAL / SHEET / TOAST / CONFIRM                                          */
  /* ======================================================================== */

  var modalStack = [];

  App.modal = function (opts) {
    opts = opts || {};
    var root = document.getElementById('modal-root');
    var box = App.el('div', { class: 'modal' + (opts.wide ? ' wide' : '') + (opts.narrow ? ' narrow' : '') });
    var back = App.el('div', { class: 'modal-back' }, box);

    function close() {
      back.remove();
      document.removeEventListener('keydown', onKey);
      modalStack = modalStack.filter(function (m) { return m !== close; });
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape' && modalStack[modalStack.length - 1] === close) { e.stopPropagation(); close(); }
    }

    box.append(App.el('div', { class: 'modal-head' },
      App.el('div', {},
        opts.kicker ? App.el('div', { class: 'kicker' }, opts.kicker) : null,
        App.el('h3', {}, opts.title || '')
      ),
      App.el('button', { class: 'modal-x', onclick: close, title: 'Close', 'aria-label': 'Close' }, '✕')
    ));
    if (opts.body) box.append(opts.body);
    if (opts.footer) box.append(opts.footer);
    back.addEventListener('mousedown', function (e) { if (e.target === back && opts.dismissable !== false) close(); });
    document.addEventListener('keydown', onKey);
    root.append(back);
    modalStack.push(close);
    var first = box.querySelector('input,textarea,select,button.primary');
    if (first && !opts.noFocus) setTimeout(function () { try { first.focus(); } catch (e) {} }, 90);
    return { close: close, box: box };
  };

  /* Resolves true when the confirm button is pressed, false otherwise.
     The answer must be recorded before the dialog closes, because closing
     also runs the "dismissed" path — and a promise only settles once. */
  App.confirm = function (opts) {
    return new Promise(function (resolve) {
      var settled = false;
      function finish(answer) {
        if (settled) return;
        settled = true;
        resolve(answer);
      }
      var m;
      var body = App.el('div', {},
        opts.body ? App.el('p', {}, opts.body) : null,
        App.el('div', { class: 'modal-foot' },
          App.el('button', { class: 'btn', onclick: function () { finish(false); m.close(); } }, opts.cancelText || 'Cancel'),
          App.el('button', { class: 'btn ' + (opts.danger ? 'danger' : 'primary'), onclick: function () { finish(true); m.close(); } }, opts.confirmText || 'Confirm')
        )
      );
      m = App.modal({ title: opts.title || 'Are you sure?', body: body, narrow: true, onClose: function () { finish(false); } });
    });
  };

  App.toast = function (msg, kind, ms) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var t = App.el('div', { class: 'toast' + (kind ? ' ' + kind : '') },
      App.el('span', { class: 'tico' }),
      App.el('span', {}, msg)
    );
    root.append(t);
    var life = ms || 2800;
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 300);
    }, life);
  };

  /* ======================================================================== */
  /* IMAGE VIEWER                                                             */
  /* Full-screen viewer with wheel / pinch / button zoom and drag to pan.     */
  /* Items: { kind:'image'|'fill'|'note', src, color, b, title, caption }     */
  /* ======================================================================== */

  App.lightbox = function (items, startIndex) {
    items = (items || []).filter(Boolean);
    if (!items.length) return null;

    var idx = App.clamp(startIndex || 0, 0, items.length - 1);
    var scale = 1, tx = 0, ty = 0;
    var MIN = 0.15, MAX = 12;
    var ptrs = {};

    var pan = App.el('div', { class: 'viewer-pan' });
    var stage = App.el('div', { class: 'viewer-stage' }, pan);
    var zoomLabel = App.el('span', { class: 'viewer-pct' }, '100%');
    var counter = App.el('span', { class: 'viewer-count' });
    var captionEl = App.el('div', { class: 'viewer-caption' });
    var body = App.el('div', { class: 'viewer-body' }, stage);
    var zoomWrap = App.el('div', { class: 'viewer-zoomgroup' });

    /* The picture is resized in layout, not stretched with transform: scale().
       A scaled layer is rasterised once at its pre-zoom size and then blown up,
       which is what made the viewer look like a compressed image. Resizing the
       element makes the browser draw it at the size you are actually looking
       at, so full-resolution source files stay sharp at any zoom. */
    var imgEl = null;
    var fitW = 0, fitH = 0;

    /* ------------------------------ rendering ---------------------------- */
    function computeFit() {
      if (!imgEl || !imgEl.naturalWidth) return;
      var narrow = window.innerWidth <= 700;
      var availW = stage.clientWidth * (narrow ? 0.96 : 0.92);
      var availH = stage.clientHeight * (narrow ? 0.68 : 0.76);
      var f = Math.min(availW / imgEl.naturalWidth, availH / imgEl.naturalHeight, 1);
      fitW = Math.max(1, Math.round(imgEl.naturalWidth * f));
      fitH = Math.max(1, Math.round(imgEl.naturalHeight * f));
    }

    function paint() {
      App.clear(pan);
      imgEl = null; fitW = 0; fitH = 0;
      var it = items[idx];

      if (it.kind === 'image' || it.src) {
        var im = App.el('img', {
          class: 'viewer-img', src: it.src,
          alt: it.title || it.caption || 'reference', draggable: 'false'
        });
        imgEl = im;
        pan.append(im);
        var ready = function () {
          computeFit();
          scale = 1; tx = 0; ty = 0;
          apply(false);
        };
        if (im.complete && im.naturalWidth) ready();
        else {
          im.addEventListener('load', ready);
          im.addEventListener('error', function () {
            App.clear(pan);
            pan.append(App.el('div', { class: 'viewer-note' }, 'This picture could not be opened.'));
            zoomWrap.style.display = 'none';
          });
        }
      } else if (it.kind === 'fill') {
        pan.append(App.el('div', { class: 'viewer-fill', style: it.b ? { background: 'linear-gradient(135deg,' + it.color + ',' + it.b + ')' } : { background: it.color } }));
      } else {
        pan.append(App.el('div', { class: 'viewer-note' }, it.title || 'Note'));
      }

      var canZoom = !!(it.kind === 'image' || it.src);
      zoomWrap.style.display = canZoom ? '' : 'none';
      stage.style.cursor = canZoom ? 'grab' : 'default';
      captionEl.textContent = (it.caption || it.title || '') +
        (imgEl && imgEl.naturalWidth ? '   ·   showing 1:' + Math.round((fitW || imgEl.naturalWidth) / imgEl.naturalWidth * 100) + '% at 100%' : '');
      counter.textContent = items.length > 1 ? (idx + 1) + ' of ' + items.length : '';
      scale = 1; tx = 0; ty = 0;
      apply(false);
    }

    function apply(animate) {
      var ease = 'cubic-bezier(.22,.9,.28,1)';
      pan.style.transition = animate ? 'transform .22s ' + ease : 'none';
      pan.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
      if (imgEl && fitW) {
        var w = Math.max(1, Math.round(fitW * scale));
        var h = Math.max(1, Math.round(fitH * scale));
        imgEl.style.transition = animate ? 'width .22s ' + ease + ', height .22s ' + ease : 'none';
        imgEl.style.width = w + 'px';
        imgEl.style.height = h + 'px';
      }
      zoomLabel.textContent = Math.round(scale * 100) + '%';
    }

    function zoomAt(factor, cx, cy) {
      var r = stage.getBoundingClientRect();
      var px = (cx == null ? r.left + r.width / 2 : cx) - (r.left + r.width / 2);
      var py = (cy == null ? r.top + r.height / 2 : cy) - (r.top + r.height / 2);
      var ns = App.clamp(scale * factor, MIN, MAX);
      var k = ns / scale;
      tx = px - (px - tx) * k;
      ty = py - (py - ty) * k;
      scale = ns;
      apply(true);
    }

    function reset() { scale = 1; tx = 0; ty = 0; apply(true); }

    function go(delta) {
      idx = (idx + delta + items.length) % items.length;
      paint();
    }

    /* -------------------------------- close ------------------------------ */
    function close() {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      back.classList.add('out');
      setTimeout(function () { back.remove(); App.viewerOpen = false; }, 160);
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(1.3, null, null); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomAt(1 / 1.3, null, null); }
      else if (e.key === '0') { e.preventDefault(); reset(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    }

    /* ------------------------------- controls ---------------------------- */
    var btnOut = App.el('button', { class: 'viewer-btn', title: 'Zoom out (-)', 'aria-label': 'Zoom out', onclick: function () { zoomAt(1 / 1.35, null, null); } }, '−');
    var btnIn = App.el('button', { class: 'viewer-btn', title: 'Zoom in (+)', 'aria-label': 'Zoom in', onclick: function () { zoomAt(1.35, null, null); } }, '+');
    var btnFit = App.el('button', { class: 'viewer-btn wide', title: 'Fit to screen (0)', onclick: reset }, 'Fit');
    var btnClose = App.el('button', { class: 'viewer-btn wide', title: 'Close (Esc)', 'aria-label': 'Close', onclick: close }, '✕');

    zoomWrap.append(btnOut, zoomLabel, btnIn, btnFit);
    if (items.length > 1) {
      zoomWrap.append(
        App.el('button', { class: 'viewer-btn', title: 'Previous (←)', onclick: function () { go(-1); } }, '‹'),
        App.el('button', { class: 'viewer-btn', title: 'Next (→)', onclick: function () { go(1); } }, '›'));
    }

    var bar = App.el('div', { class: 'viewer-bar' },
      App.el('div', { class: 'viewer-info' }, captionEl, counter),
      App.el('div', { class: 'viewer-actions' }, zoomWrap, btnClose));

    var back = App.el('div', { class: 'viewer' }, bar, body);
    back.addEventListener('mousedown', function (e) { if (e.target === back || e.target === stage) { /* click on empty space closes only on double */ } });

    /* -------------------------------- wheel ------------------------------ */
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY);
    }, { passive: false });

    /* ------------------------------- pointer ----------------------------- */
    var dragging = false, lastX = 0, lastY = 0, pinchDist = 0, pinchMid = null, startTx = 0, startTy = 0;

    function pointerPair() {
      var ids = Object.keys(ptrs);
      if (ids.length < 2) return null;
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      return {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      };
    }

    stage.addEventListener('pointerdown', function (e) {
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      var pair = pointerPair();
      if (pair) { pinchDist = pair.dist; pinchMid = pair.mid; startTx = tx; startTy = ty; }
      else { dragging = true; lastX = e.clientX; lastY = e.clientY; stage.classList.add('grabbing'); }
    });

    stage.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var pair = pointerPair();
      if (pair && pinchDist > 0) {
        var f = pair.dist / pinchDist;
        zoomAt(f, pair.mid.x, pair.mid.y);
        tx += pair.mid.x - pinchMid.x;
        ty += pair.mid.y - pinchMid.y;
        pinchDist = pair.dist;
        pinchMid = pair.mid;
        apply(false);
        return;
      }
      if (!dragging) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      apply(false);
    });

    function endPointer(e) {
      delete ptrs[e.pointerId];
      var pair = pointerPair();
      if (pair) { pinchDist = pair.dist; pinchMid = pair.mid; }
      else { pinchDist = 0; dragging = false; stage.classList.remove('grabbing'); }
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    /* double click / double tap toggles zoom */
    stage.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (scale > 1.05) reset(); else zoomAt(2.6 / scale, e.clientX, e.clientY);
    });

    /* swipe between images when not zoomed */
    var swipeX = null;
    stage.addEventListener('touchstart', function (e) { if (e.touches.length === 1 && scale <= 1.02) swipeX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (swipeX == null) return;
      var dx = (e.changedTouches[0].clientX - swipeX);
      swipeX = null;
      if (Math.abs(dx) > 60 && items.length > 1) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', onKey);
    document.getElementById('modal-root').append(back);
    document.documentElement.style.overflow = 'hidden';
    App.viewerOpen = true;
    paint();

    /* Let the app re-fit the picture after a rotation. */
    App.refitViewer = function () {
      if (!App.viewerOpen) return;
      computeFit();
      scale = 1; tx = 0; ty = 0;
      apply(false);
    };

    return { close: close, next: function () { go(1); }, prev: function () { go(-1); } };
  };

  App.confetti = function (count) {
    if (App.Store && App.Store.data && App.Store.data.settings && App.Store.data.settings.liteEffects) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var root = document.getElementById('confetti-root');
    if (!root) return;
    var colors = ['#2ee6a8', '#a78bfa', '#ffb347', '#60a5fa', '#fb7185'];
    count = count || 26;
    for (var i = 0; i < count; i++) {
      var c = App.el('i');
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.35) + 's';
      c.style.animationDuration = (1.2 + Math.random() * 0.9) + 's';
      root.append(c);
      (function (node) { setTimeout(function () { node.remove(); }, 2600); })(c);
    }
  };

  /* ======================================================================== */
  /* CHART HELPERS                                                            */
  /* ======================================================================== */

  App.ring = function (pct, label, value, color) {
    var r = 46, c = 2 * Math.PI * r;
    var len = c;
    var off = c * (1 - App.clamp(pct, 0, 1));
    var gid = 'rg' + Math.random().toString(36).slice(2, 8);
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 116 116');
    var defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + (color || 'var(--accent)') + '"/>' +
      '<stop offset="100%" stop-color="var(--secondary)"/></linearGradient>';
    svg.appendChild(defs);
    var track = document.createElementNS(ns, 'circle');
    track.setAttribute('class', 'track'); track.setAttribute('cx', '58'); track.setAttribute('cy', '58'); track.setAttribute('r', String(r)); track.setAttribute('stroke-width', '9');
    var val = document.createElementNS(ns, 'circle');
    val.setAttribute('class', 'val'); val.setAttribute('cx', '58'); val.setAttribute('cy', '58'); val.setAttribute('r', String(r)); val.setAttribute('stroke-width', '9');
    val.setAttribute('stroke', 'url(#' + gid + ')');
    val.style.setProperty('--len', len);
    val.style.setProperty('--off', off);
    svg.appendChild(track); svg.appendChild(val);
    return App.el('div', { class: 'ring' }, svg,
      App.el('div', { class: 'ring-mid' },
        App.el('div', { class: 'ring-v' }, value != null ? value : Math.round(pct * 100) + '%'),
        label ? App.el('div', { class: 'ring-k' }, label) : null));
  };

  App.bars = function (values, opts) {
    opts = opts || {};
    var max = Math.max(opts.min || 1, Math.max.apply(null, values.concat([0])));
    var todayIdx = opts.todayIndex;
    return App.el('div', { class: 'bars', style: { height: (opts.height || 62) + 'px' } },
      values.map(function (v, i) {
        var h = v > 0 ? Math.max(4, (v / max) * 100) : 3;
        var cls = v <= 0 ? 'zero' : (opts.over && v > opts.over ? 'over' : '');
        if (i === todayIdx && v > 0) cls = 'today';
        return App.el('i', {
          class: cls, style: { height: h + '%', animationDelay: (i * 0.022) + 's' },
          title: (opts.labels && opts.labels[i] ? opts.labels[i] + ': ' : '') + v + (opts.unit || '')
        });
      })
    );
  };

  App.spark = function (values, opts) {
    opts = opts || {};
    var w = 100, h = 40;
    var max = Math.max.apply(null, values.concat([1]));
    var min = Math.min.apply(null, values.concat([0]));
    var span = (max - min) || 1;
    var pts = values.map(function (v, i) {
      var x = values.length < 2 ? 0 : (i / (values.length - 1)) * w;
      var y = h - ((v - min) / span) * (h - 6) - 3;
      return [x, y];
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join(' ');
    var area = d + ' L' + w + ' ' + h + ' L0 ' + h + ' Z';
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'spark');
    svg.setAttribute('viewBox', '0 0 100 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    var p1 = document.createElementNS(ns, 'path'); p1.setAttribute('class', 'area'); p1.setAttribute('d', area);
    var p2 = document.createElementNS(ns, 'path'); p2.setAttribute('class', 'line'); p2.setAttribute('d', d);
    p2.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(p1); svg.appendChild(p2);
    var last = pts[pts.length - 1];
    if (last) {
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', last[0]); dot.setAttribute('cy', last[1]); dot.setAttribute('r', '2.6');
      svg.appendChild(dot);
    }
    return svg;
  };

  /* Animated number that counts up when inserted. */
  App.countUp = function (to, opts) {
    opts = opts || {};
    var node = App.el('span', {}, opts.format ? opts.format(0) : '0');
    var from = opts.from || 0;
    var dur = opts.duration || 750;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = App.clamp((ts - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = from + (to - from) * eased;
      node.textContent = opts.format ? opts.format(v) : App.num(Math.round(v));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return node;
  };

  /* ======================================================================== */
  /* EXPORT / IMPORT                                                          */
  /* ======================================================================== */

  App.downloadText = function (filename, text, mime) {
    try {
      var blob = new Blob([text], { type: mime || 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
      return true;
    } catch (e) { return false; }
  };

  App.copyText = function (text) {
    var done = false;
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      done = document.execCommand('copy');
      ta.remove();
    } catch (e) {}
    if (navigator.clipboard) { try { navigator.clipboard.writeText(text); done = true; } catch (e) {} }
    return done;
  };

  App.presentExport = function (title, filename, text, mime, note) {
    var ta = App.el('textarea', { readonly: true, style: { minHeight: '260px', fontFamily: 'var(--f-mono)', fontSize: '.76rem' } });
    ta.value = text;
    var body = App.el('div', {},
      App.el('p', { class: 'small muted' }, note || 'Copy the text, or save it as a file. On Android, copying is the most reliable route.'),
      ta,
      App.el('div', { class: 'modal-foot' },
        App.el('button', { class: 'btn', onclick: function () {
          App.copyText(text);
          App.toast('Copied to clipboard.');
        } }, 'Copy'),
        App.el('button', { class: 'btn primary', onclick: function () {
          var ok = App.downloadText(filename, text, mime);
          App.toast(ok ? 'Saved ' + filename : 'Could not save — use Copy instead.', ok ? null : 'warn');
        } }, 'Save file')
      )
    );
    App.modal({ title: title, body: body, wide: true });
  };

  App.importViaDialog = function (cb) {
    var ta = App.el('textarea', { style: { minHeight: '180px', fontFamily: 'var(--f-mono)', fontSize: '.74rem' }, placeholder: 'Paste a SoloDev Studio backup here…' });
    var file = App.el('input', { type: 'file', accept: '.json,application/json' });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { ta.value = String(r.result); App.toast('File read. Press Restore to apply it.'); };
      r.readAsText(f);
    });
    var body = App.el('div', {},
      App.el('div', { class: 'field' }, App.el('label', { text: 'Pick the backup file' }), file),
      App.el('div', { class: 'field' }, App.el('label', { text: 'Or paste the text' }), ta),
      App.el('div', { class: 'modal-foot' },
        App.el('button', { class: 'btn primary', onclick: function () {
          try {
            App.Store.importJSON(ta.value);
            App.toast('Backup restored.', null, 3200);
            if (cb) cb();
          } catch (e) { App.toast('Could not restore: ' + e.message, 'bad'); }
        } }, 'Restore this backup')
      )
    );
    App.modal({ title: 'Restore from a backup', body: body, wide: true });
  };

  /* ======================================================================== */
  /* THEME                                                                    */
  /* ======================================================================== */

  var THEMES = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'paper', label: 'Paper' }
  ];
  App.THEMES = THEMES;

  App.setTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0a0e13' : (t === 'light' ? '#f4f7fa' : '#f6f1e7'));
    App.Store.data.theme = t;
    App.Store.save();
  };
  App.cycleTheme = function () {
    var cur = App.Store.data.theme || 'dark';
    var idx = 0;
    THEMES.forEach(function (t, i) { if (t.id === cur) idx = i; });
    var next = THEMES[(idx + 1) % THEMES.length];
    App.setTheme(next.id);
    App.toast('Theme: ' + next.label);
  };

  /* Optional fallback for slow machines: drops the translucent/blurred
     surfaces and the drifting background. Off unless you turn it on. */
  App.applyEffects = function () {
    var s = App.Store.data.settings || {};
    document.documentElement.classList.toggle('lite', !!s.liteEffects);
  };

  /* ======================================================================== */
  /* SPLASH                                                                   */
  /* ======================================================================== */

  App.runSplash = function (onDone) {
    var splash = document.getElementById('splash');
    if (!splash) { if (onDone) onDone(); return; }
    var fill = document.getElementById('splash-fill');
    var msg = document.getElementById('splash-msg');
    var enter = document.getElementById('splash-enter');
    var skip = document.getElementById('splash-skip');

    function dismiss() {
      if (splash.classList.contains('gone')) return;
      splash.classList.add('gone');
      setTimeout(function () { splash.remove(); if (onDone) onDone(); }, 560);
    }
    skip.addEventListener('click', function (e) {
      e.stopPropagation();
      App.Store.data.settings.skipSplash = true;
      App.Store.save();
      App.toast('Starting will skip this next time.');
      dismiss();
    });
    enter.addEventListener('click', dismiss);
    splash.addEventListener('click', function (e) { if (e.target !== skip && e.target !== enter) dismiss(); });

    if (App.Store.data.settings.skipSplash) { setTimeout(dismiss, 260); return; }

    var steps = [
      [18, 'Loading your projects…'],
      [42, 'Warming up the plan…'],
      [66, 'Checking the market tools…'],
      [88, 'Sharpening the marketing desk…'],
      [100, 'Ready.']
    ];
    var i = 0;
    var timer = setInterval(function () {
      if (i >= steps.length) { clearInterval(timer); return; }
      fill.style.width = steps[i][0] + '%';
      msg.textContent = steps[i][1];
      i++;
    }, 300);
    setTimeout(function () { enter.hidden = false; }, 1750);
    setTimeout(dismiss, 5600);
  };

  /* ======================================================================== */
  /* ROUTER                                                                   */
  /* ======================================================================== */

  App.NAV = [
    { group: 'Everyday', items: [
      { route: 'home', label: 'Home', ico: 'M3 10.5 12 3l9 7.5|M5.5 9.5V20h13V9.5', tab: true },
      { route: 'plan', label: 'Plan', ico: 'M4 5h16v14H4z|M4 10h16|M9 5v14', tab: true },
      { route: 'design', label: 'Design', ico: 'M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', tab: true }
    ] },
    { group: 'Getting it out there', items: [
      { route: 'market', label: 'Market', ico: 'M4 19V9|M10 19V4|M16 19v-7|M20 19H2', tab: true },
      { route: 'marketing', label: 'Marketing', ico: 'M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z|M15 8.5a4 4 0 0 1 0 7', tab: true },
      { route: 'toolbox', label: 'Toolbox', ico: 'M4 20v-6|M10 20V8|M16 20v-9|M20 20H2|M3 8h4|M9 5h4|M15 11h4', tab: true }
    ] },
    { group: 'Reference', items: [
      { route: 'learn', label: 'Learn', ico: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20|M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', tab: true },
      { route: 'vault', label: 'Vault', ico: 'M3 5h18v4H3z|M5 9v10h14V9|M10 13h4', tab: true }
    ] }
  ];

  App.navigate = function (hash) {
    if (window.location.hash === hash) { App.renderRoute(); return; }
    window.location.hash = hash;
  };

  App.navStack = [];
  App._goingBack = false;

  App.currentRoute = function () {
    var h = (window.location.hash || '#/home').replace(/^#\/?/, '');
    var parts = h.split('/');
    return { name: parts[0] || 'home', params: parts.slice(1).filter(Boolean) };
  };

  App.back = function () {
    if (App.navStack.length > 1) {
      App.navStack.pop();
      var prev = App.navStack[App.navStack.length - 1];
      var target = '#/' + prev;
      if (window.location.hash === target) App.renderRoute();
      else { App._goingBack = true; window.location.hash = target; }
      return true;
    }
    return false;
  };

  App.renderRoute = function () {
    var route = App.currentRoute();
    var view = App.views[route.name] || App.views.home;
    var root = document.getElementById('view-root');
    if (!root) return;

    var key = route.name + (route.params[0] ? '/' + route.params[0] : '');
    /* Re-rendering the page you are already on must keep your place. Only a
       move to a different page should jump back to the top. */
    var samePage = App.navStack[App.navStack.length - 1] === key;

    if (App._goingBack) App._goingBack = false;
    else if (!samePage) {
      App.navStack.push(key);
      if (App.navStack.length > 60) App.navStack.shift();
    }

    App.clear(root);
    document.querySelectorAll('.nav-item, .tab-item').forEach(function (n) {
      n.classList.toggle('active', n.dataset.route === route.name);
      n.classList.toggle('on', n.dataset.route === route.name);
    });
    var crumb = document.getElementById('crumb');
    if (crumb) {
      var def = null;
      App.NAV.forEach(function (g) { g.items.forEach(function (it) { if (it.route === route.name) def = it; }); });
      crumb.textContent = def ? def.label : 'Home';
    }
    App.closeSidebar();
    try {
      view.render(root, route.params);
    } catch (err) {
      root.append(App.el('div', { class: 'callout bad' },
        App.el('div', { class: 'ct' }, 'Something went wrong on this page'),
        App.el('p', {}, String(err && err.message || err)),
        App.el('button', { class: 'btn sm', onclick: function () { App.navigate('#/home'); } }, 'Back to Home')
      ));
      if (window.console) console.error(err);
    }
    if (!samePage) {
      root.scrollTop = 0;
      window.scrollTo(0, 0);
    }
    App.renderSideMini();
  };

  App.pick = function (which, id) {
    App.navigate('#/' + which + (id ? '/' + id : ''));
  };

  /* ======================================================================== */
  /* CHROME (nav, sidebar, mini panel)                                        */
  /* ======================================================================== */

  App.buildNav = function () {
    var host = document.getElementById('side-nav');
    if (!host) return;
    App.NAV.forEach(function (group) {
      var b = App.el('div', { class: 'nav-group' });
      if (group.group) b.append(App.el('div', { class: 'nav-group-title' }, group.group));
      group.items.forEach(function (it) {
        b.append(App.el('a', { class: 'nav-item', 'data-route': it.route, href: '#/' + it.route },
          App.el('span', { class: 'nav-ico' }, App.svg(it.ico)),
          App.el('span', {}, it.label)
        ));
      });
      host.append(b);
    });
  };

  App.buildTabbar = function () {
    var host = document.getElementById('tabbar');
    if (!host) return;
    var items = [];
    App.NAV.forEach(function (g) { g.items.forEach(function (it) { if (it.tab) items.push(it); }); });
    items.forEach(function (it) {
      host.append(App.el('a', { class: 'tab-item', 'data-route': it.route, href: '#/' + it.route },
        App.svg(it.ico), App.el('span', {}, it.label)));
    });
  };

  App.renderSideMini = function () {
    var mini = document.getElementById('side-mini');
    if (!mini) return;
    App.clear(mini);
    var d = App.Store.data;
    var active = App.Store.activeGame();
    var week = App.hoursThisWeek();
    var ceiling = d.settings.workCeiling || 40;
    mini.append(
      App.el('div', { class: 'mini-row' }, App.el('span', {}, 'Projects'), App.el('b', {}, String(d.games.length))),
      App.el('div', { class: 'mini-row' }, App.el('span', {}, 'This week'), App.el('b', { class: week > ceiling ? 'neg' : '' }, week + ' h')),
      active
        ? App.el('div', { class: 'mini-row' }, App.el('span', {}, 'In progress'), App.el('b', { style: { maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, active.title))
        : App.el('div', { class: 'mini-row' }, App.el('span', { class: 'muted' }, 'Nothing active yet'))
    );
  };

  App.openSidebar = function () {
    var sb = document.getElementById('sidebar');
    if (!sb) return;
    sb.classList.add('open');
    if (!document.querySelector('.scrim')) {
      var scrim = App.el('div', { class: 'scrim', onclick: App.closeSidebar });
      /* The dim layer has to live inside the same stacking context as the
         drawer it sits behind. .app-shell sets z-index, which starts a new
         stacking context, so attaching the scrim to <body> would put it above
         the whole shell — the drawer included — and the screen would just go
         blurry with nothing on top. */
      var shell = document.getElementById('app-shell');
      (shell || document.body).append(scrim);
    }
  };

  App.closeSidebar = function () {
    var sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('open');
    var sc = document.querySelector('.scrim');
    if (sc) sc.remove();
  };

  /* ======================================================================== */
  /* NEW PROJECT DIALOG                                                       */
  /* ======================================================================== */

  App.openNewGameDialog = function (game) {
    var isEdit = !!game;
    var g = game || null;
    var d = App.Store.data;

    var f = {};
    f.title = App.el('input', { type: 'text', placeholder: 'e.g. Aether Strike', value: g ? g.title : '' });
    f.codename = App.el('input', { type: 'text', placeholder: 'optional, e.g. Project Comet', value: g ? g.codename : '' });
    f.label = App.el('select', {}, ['A', 'B', 'C'].map(function (k) {
      var o = App.el('option', { value: k }, App.data.labels[k].name + ' — ' + App.data.labels[k].summary);
      if ((g ? g.label : 'A') === k) o.selected = true;
      return o;
    }));
    f.msrp = App.el('input', { type: 'number', step: '0.01', value: g ? g.msrp : App.data.labels.A.msrp });
    f.label.addEventListener('change', function () { f.msrp.value = App.data.labels[f.label.value].msrp; });
    f.weeks = App.el('input', { type: 'number', value: g ? g.targetWeeks : 12, min: 1 });
    f.release = App.el('input', { type: 'month', value: g ? (g.targetRelease || '') : '' });
    f.notes = App.el('textarea', { placeholder: 'One line about what makes it fun.', style: { minHeight: '70px' } }, g ? g.notes : '');

    var labelHint = App.el('p', { class: 'small muted' });
    function updHint() {
      var L = App.data.labels[f.label.value];
      labelHint.textContent = L.name + ': ' + L.summary + ' Usually takes ' + L.cadence + '.';
    }
    f.label.addEventListener('change', updHint);
    updHint();

    var body = App.el('div', {},
      App.el('div', { class: 'field' }, App.el('label', { text: 'Working title' }), f.title),
      App.el('div', { class: 'field' }, App.el('label', { text: 'Which kind of game is it?' }), f.label, labelHint),
      App.el('div', { class: 'field-row' },
        App.el('div', { class: 'field' }, App.el('label', { text: 'Selling price ($)' }), f.msrp),
        App.el('div', { class: 'field' }, App.el('label', { text: 'Planned weeks' }), f.weeks),
        App.el('div', { class: 'field' }, App.el('label', { text: 'Target month' }), f.release)
      ),
      App.el('div', { class: 'field' }, App.el('label', { text: 'Codename' }), f.codename),
      App.el('div', { class: 'field' }, App.el('label', { text: 'Notes' }), f.notes),
      isEdit ? null : App.el('p', { class: 'tiny muted' }, 'The design pages will start you off with a template for this kind of game.')
    );

    var m = App.modal({ title: isEdit ? 'Edit project' : 'New game project', body: body, wide: true });

    body.append(App.el('div', { class: 'modal-foot' },
      App.el('button', { class: 'btn primary', onclick: function () {
        var title = f.title.value.trim();
        if (!title) { App.toast('Give it a working title first.', 'warn'); return; }
        if (isEdit) {
          g.title = title;
          g.codename = f.codename.value.trim();
          g.label = f.label.value;
          g.msrp = Number(f.msrp.value) || g.msrp;
          g.targetWeeks = Number(f.weeks.value) || g.targetWeeks;
          g.targetRelease = f.release.value;
          g.notes = f.notes.value;
        } else {
          var ng = App.newGame({
            title: title, codename: f.codename.value.trim(), label: f.label.value,
            msrp: Number(f.msrp.value), targetWeeks: Number(f.weeks.value), targetRelease: f.release.value
          });
          ng.notes = f.notes.value;
          ng.tasks = App.starterTasks(1);
          if (!d.games.some(function (x) { return x.active; })) ng.active = true;
          d.games.push(ng);
          g = ng;
        }
        App.Store.save();
        m.close();
        App.toast(isEdit ? 'Project updated.' : '“' + title + '” created.', null, 3000);
        if (!isEdit) App.confetti(20);
        App.renderRoute();
      } }, isEdit ? 'Save changes' : 'Create project')
    ));
  };

  App.activateGame = function (id) {
    var d = App.Store.data;
    var target = App.Store.game(id);
    if (!target) return;
    var was = target.active;
    d.games.forEach(function (g) { g.active = (g.id === id) ? !was : false; });
    App.Store.save();
    if (!was) App.toast('Now working on: ' + target.title);
    App.renderRoute();
  };

  /* ======================================================================== */
  /* STAGE HELPERS                                                            */
  /* ======================================================================== */

  App.stageStatus = function (stage) {
    if (stage <= 2) return 'Idea';
    if (stage <= 4) return 'Prototype';
    if (stage <= 6) return 'Building';
    if (stage === 7) return 'Demo';
    if (stage === 8) return 'Polishing';
    if (stage === 9) return 'Ready to launch';
    return 'After launch';
  };

  App.stageProgress = function (g) {
    return App.clamp((g.stage - 1) / 9, 0, 1);
  };

  /* ======================================================================== */
  /* MISC UI BUILDERS SHARED BY VIEWS                                         */
  /* ======================================================================== */

  App.field = function (label, input, hint) {
    return App.el('div', { class: 'field' },
      label ? App.el('label', {}, label) : null,
      input,
      hint ? App.el('div', { class: 'hint' }, hint) : null);
  };

  App.numField = function (label, value, opts) {
    opts = opts || {};
    var i = App.el('input', { type: 'number', value: value, step: opts.step || 'any', min: opts.min, max: opts.max });
    return App.el('div', { class: 'field' }, App.el('label', {}, label), i, opts.hint ? App.el('div', { class: 'hint' }, opts.hint) : null);
  };

  App.outRow = function (k, v, total) {
    return App.el('div', { class: 'row between' + (total ? '' : ''), style: { padding: '.22rem 0', borderTop: total ? '1px solid var(--line-2)' : 'none', marginTop: total ? '.35rem' : '0', paddingTop: total ? '.5rem' : '.22rem', fontWeight: total ? '750' : '400', fontSize: '.86rem' } },
      App.el('span', { class: 'muted' }, k),
      App.el('span', { class: 'mono', style: { fontWeight: '700' } }, v));
  };

  App.empty = function (opts) {
    return App.el('div', { class: 'empty' },
      App.el('div', { class: 'e-ico' }, App.svg(opts.ico || 'M12 5v14|M5 12h14')),
      App.el('h3', {}, opts.title || 'Nothing here yet'),
      opts.body ? App.el('p', {}, opts.body) : null,
      opts.action || null
    );
  };

  App.gamePicker = function (root, params, routeBase) {
    var d = App.Store.data;
    if (!d.games.length) {
      root.append(App.empty({
        title: 'You have no projects yet',
        body: 'Create your first project and everything else here will fill in around it.',
        ico: 'M12 5v14|M5 12h14',
        action: App.el('button', { class: 'btn primary', onclick: function () { App.openNewGameDialog(null); } }, '+ New game project')
      }));
      return null;
    }
    var g = (params && params[0] && App.Store.game(params[0])) || App.Store.primaryGame();
    if (d.games.length > 1) {
      var row = App.el('div', { class: 'btn-row', style: { marginBottom: '1rem' } });
      d.games.forEach(function (x) {
        row.append(App.el('a', {
          class: 'chip click' + (x.id === g.id ? ' on' : ''),
          href: routeBase + x.id
        }, App.el('span', { class: 'badge ' + App.data.labels[x.label].color }, x.label), x.title));
      });
      root.append(row);
    }
    return g;
  };

  window.addEventListener('hashchange', function () { App.renderRoute(); });

})();
