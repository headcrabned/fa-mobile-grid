// ==UserScript==
// @name         FA Mobile Grid
// @namespace    https://github.com/headcrabned/fa-mobile-grid
// @homepageURL  https://github.com/headcrabned/fa-mobile-grid
// @supportURL   https://github.com/headcrabned/fa-mobile-grid/issues
// @version      0.1.4
// @description  Unofficial: gap-free masonry grid (1-4 columns), larger thumbnails and a quick fave heart for Fur Affinity galleries on phones and tablets (modern theme).
// @match        https://www.furaffinity.net/gallery/*
// @match        https://www.furaffinity.net/scraps/*
// @match        https://www.furaffinity.net/favorites/*
// @match        https://www.furaffinity.net/msg/submissions/*
// @match        https://www.furaffinity.net/browse/*
// @match        https://www.furaffinity.net/search/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ---- settings --------------------------------------------------------
  const KEY = 'fmg-columns';
  const store = {
    get(k, d) {
      try { if (typeof GM_getValue === 'function') return GM_getValue(k, d); } catch (e) { /* fall through */ }
      try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { if (typeof GM_setValue === 'function') return GM_setValue(k, v); } catch (e) { /* fall through */ }
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ }
    },
  };
  const defaultCols = () => (innerWidth < 600 ? 2 : innerWidth < 1100 ? 3 : 4);
  let cols = Number(store.get(KEY, 0)) || defaultCols();

  // ---- find tiles; do nothing if the page isn't what we expect -----------
  const sections = [...document.querySelectorAll('section.gallery')]
    .filter((s) => s.querySelector(':scope > figure[id^="sid-"]'));
  if (!sections.length) return;

  const onFeed = !!document.querySelector('form#messages-form');
  const me = (document.querySelector('#my-username')?.textContent || '').trim().toLowerCase();
  const ownFaves = /^\/favorites\/([^/]+)/.test(location.pathname) &&
    me && decodeURIComponent(RegExp.$1).toLowerCase() === me;

  // ---- styles ----------------------------------------------------------
  const css = document.createElement('style');
  css.textContent = `
    section.gallery.fmg { display:block !important; padding:0 4px !important; margin:0 !important; width:auto !important; max-width:none !important; }
    .fmg-cols { display:flex; gap:6px; align-items:flex-start; width:100%; }
    .fmg-col { flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:6px; }
    section.gallery.fmg figure { position:relative !important; display:block !important; float:none !important; width:100% !important;
      height:auto !important; margin:0 !important; padding:0 !important; border-radius:6px; overflow:hidden; background:#222; }
    section.gallery.fmg figure > b, section.gallery.fmg figure > b > u { display:block !important; width:100% !important; height:auto !important; margin:0 !important; padding:0 !important; }
    section.gallery.fmg figure > b a { display:block; }
    section.gallery.fmg figure img { width:100% !important; height:auto !important; display:block !important; max-width:none !important; }
    section.gallery.fmg figure i[title] { display:none !important; }
    section.gallery.fmg figure figcaption { position:absolute !important; width:auto !important; max-width:none !important; box-sizing:border-box !important;
      left:0; right:0; bottom:0; margin:0 !important; padding:14px 0 6px !important; background:linear-gradient(transparent, rgba(0,0,0,.65));
      color:#fff; text-align:center !important; --fmg-fs:clamp(14px, 1.6vw, 17px); line-height:1.35; text-shadow:0 1px 2px #000; pointer-events:none; }
    section.gallery.fmg figure figcaption p { margin:0 !important; padding:0 !important; line-height:1.35 !important; text-align:center !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    section.gallery.fmg figure figcaption p a, section.gallery.fmg figure figcaption p i { display:inline !important; float:none !important;
      position:static !important; width:auto !important; font-size:1em !important; font-style:normal !important; margin:0 !important;
      padding:0 !important; text-align:center !important; line-height:inherit !important; }
    section.gallery.fmg figure figcaption p { display:block !important; }
    section.gallery.fmg figure figcaption p i { opacity:.8; margin-right:.3em; }
    section.gallery.fmg figure figcaption p:first-of-type { font-weight:600; font-size:var(--fmg-fs) !important; }
    section.gallery.fmg figure figcaption p:nth-of-type(2) { font-size:calc(var(--fmg-fs) * .85) !important; opacity:.9; }
    section.gallery.fmg figure figcaption a, section.gallery.fmg figure figcaption i { color:#fff !important; pointer-events:auto; }
    section.gallery.fmg figure figcaption label { width:auto !important; max-width:none !important; box-sizing:border-box !important; display:block; pointer-events:auto; margin:0 !important; padding:0 38px !important; min-height:0 !important; height:auto !important; }
    section.gallery.fmg figure figcaption label > div { position:absolute; right:6px; bottom:6px; margin:0 !important; }
    section.gallery.fmg figure figcaption input[type=checkbox] { width:24px; height:24px; margin:0; }
    .fmg-heart { position:absolute; top:6px; right:6px; z-index:3; width:46px; height:36px; border:0; border-radius:18px;
      background:rgba(0,0,0,.5); color:#fff; padding:0; cursor:pointer; display:flex; align-items:center; justify-content:center; font:bold 18px/1 sans-serif; }
    .fmg-heart svg { width:26px; height:24px; fill:none; stroke:currentColor; stroke-width:2; stroke-linejoin:round; }
    .fmg-heart.on { color:#ff5a7a; }
    .fmg-heart.on svg { fill:currentColor; }
    .fmg-heart.busy { opacity:.5; }
    .fmg-bar { position:fixed; left:8px; bottom:8px; z-index:9999; display:flex; gap:2px; padding:3px; border-radius:20px; background:rgba(0,0,0,.65); }
    .fmg-bar button { width:34px; height:34px; border:0; border-radius:50%; background:transparent; color:#fff; font-size:15px; }
    .fmg-bar button.sel { background:#4a8cff; }
  `;
  document.head.appendChild(css);

  // ---- masonry ---------------------------------------------------------
  const ratio = (f) => {
    const img = f.querySelector('img');
    const w = parseFloat(img?.dataset.width), h = parseFloat(img?.dataset.height);
    return w > 0 && h > 0 ? h / w : 1;
  };

  function thumbFor(n) { return n <= 1 ? 600 : n === 2 ? 400 : 300; }

  function layout() {
    for (const s of sections) {
      if (!s._fmgFigs) {
        s._fmgFigs = [...s.querySelectorAll('figure[id^="sid-"]')];
        s._fmgFigs.forEach(addHeart);
      }
      s.classList.add('fmg');
      let wrap = s.querySelector(':scope > .fmg-cols');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'fmg-cols'; s.appendChild(wrap); }
      wrap.textContent = '';
      // plain loop: FA loads Prototype.js, which replaces Array.from and ignores its map function
      const colEls = [];
      for (let i = 0; i < cols; i++) { const c = document.createElement('div'); c.className = 'fmg-col'; wrap.appendChild(c); colEls.push(c); }
      const heights = new Array(cols).fill(0);
      for (const f of s._fmgFigs) {
        const r = ratio(f);
        let k = 0;
        for (let i = 1; i < cols; i++) if (heights[i] < heights[k]) k = i;
        colEls[k].appendChild(f);
        heights[k] += r + 0.02;
        upgrade(f);
      }
    }
  }

  function upgrade(f) {
    const img = f.querySelector('img');
    if (!img) return;
    const want = thumbFor(cols);
    const m = img.src.match(/@(\d+)-/);
    if (!m || Number(m[1]) === want) return;
    if (!img.dataset.fmgOrig) img.dataset.fmgOrig = img.src;
    img.onerror = () => { img.onerror = null; img.src = img.dataset.fmgOrig; };
    const url = img.dataset.fmgOrig.replace(/@\d+-/, `@${want}-`);
    img.removeAttribute('srcset');
    img.src = url;
  }

  // ---- fave heart ------------------------------------------------------
  const HEART = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5C5 15 1.5 11.5 1.5 7.2 1.5 4.3 3.7 2 6.6 2c2 0 3.8 1.1 5.4 3.2C13.6 3.1 15.4 2 17.4 2c2.9 0 5.1 2.3 5.1 5.200 0 4.3-3.5 7.8-10.500 13.3z"/></svg>';
  // Tiles carry no fave state or key, so a tap reads the submission page (as opening it would),
  // then follows whichever of its +Fav / -Fav links is present. Requests run one at a time.
  let queue = Promise.resolve();
  function addHeart(f) {
    const id = f.id.replace('sid-', '');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fmg-heart' + (ownFaves ? ' on' : '');
    b.innerHTML = HEART;
    b.title = 'Fave / unfave';
    b.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (b.classList.contains('busy')) return;
      b.classList.add('busy');
      queue = queue.then(() => toggle(id, b)).catch(() => {}).then(() => b.classList.remove('busy'));
    });
    f.appendChild(b);
  }

  async function toggle(id, b) {
    const prev = b.innerHTML;
    try {
      const page = await (await fetch(`/view/${id}/`, { credentials: 'same-origin' })).text();
      const doc = new DOMParser().parseFromString(page, 'text/html');
      const a = doc.querySelector(`a[href^="/fav/${id}/"], a[href^="/unfav/${id}/"]`);
      if (!a) throw new Error('no fav link');
      const adding = a.getAttribute('href').startsWith('/fav/');
      const r = await fetch(a.getAttribute('href'), { credentials: 'same-origin' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      b.classList.toggle('on', adding);
      await new Promise((res) => setTimeout(res, 1000)); // be gentle between toggles
    } catch (e) {
      b.textContent = '!';
      setTimeout(() => { b.innerHTML = prev; }, 1500);
    }
  }

  // ---- column control --------------------------------------------------
  const bar = document.createElement('div');
  bar.className = 'fmg-bar';
  for (let n = 1; n <= 4; n++) {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.dataset.n = n;
    btn.addEventListener('click', () => { cols = n; store.set(KEY, n); mark(); layout(); });
    bar.appendChild(btn);
  }
  const mark = () => bar.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', Number(x.dataset.n) === cols));
  document.body.appendChild(bar);
  mark();
  layout();
})();
