(() => {
  'use strict';

  /* ───── Контакты: меняются только здесь (ник без @ и без ссылки) ───── */
  const CONTACTS = {
    telegram: '',
    instagram: '',
    email: '',
    github: '',
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rnd = Math.random;

  const LINK = {
    telegram: v => 'https://t.me/' + v,
    instagram: v => 'https://instagram.com/' + v,
    email: v => 'mailto:' + v,
    github: v => 'https://github.com/' + v,
  };
  for (const a of $$('[data-contact]')) {
    const k = a.dataset.contact, v = CONTACTS[k].trim().replace(/^@/, '');
    if (!v) continue; // пусто — ссылка остаётся якорем на блок контактов, а не ведёт на чужой профиль
    a.href = LINK[k](v);
    if (k !== 'email') { a.target = '_blank'; a.rel = 'noopener'; }
    const h = $('[data-handle]', a);
    if (h) h.textContent = k === 'email' ? v : '@' + v;
  }
  $('#y').textContent = new Date().getFullYear();

  /* ───── Языки ───── */
  const dict = window.I18N || {};
  const tr = $$('[data-i18n]');
  const val = el => (el.dataset.i18nAttr ? el.getAttribute(el.dataset.i18nAttr) : el.innerHTML);
  dict.ru = Object.fromEntries(tr.map(el => [el.dataset.i18n, val(el)]));

  // Заголовок первого экрана режется на слова — они появляются по очереди
  function splitWords() {
    const walker = document.createTreeWalker($('.h1'), NodeFilter.SHOW_TEXT), texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    let i = 0;
    for (const t of texts) {
      const frag = document.createDocumentFragment();
      for (const part of t.textContent.split(/(\s+)/)) {
        if (!part.trim()) { if (part) frag.append(' '); continue; }
        const w = document.createElement('span');
        w.className = 'w'; w.style.setProperty('--w', i++); w.textContent = part;
        frag.append(w);
      }
      t.replaceWith(frag);
    }
  }

  function setLang(lang) {
    const d = dict[lang];
    for (const el of tr) {
      const v = d[el.dataset.i18n];
      if (v == null) continue;
      if (el.dataset.i18nAttr) el.setAttribute(el.dataset.i18nAttr, v); else el.innerHTML = v;
    }
    root.lang = lang;
    for (const b of $$('.lang button')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
    splitWords();
  }

  let saved; try { saved = localStorage.getItem('lang'); } catch {}
  const asked = new URLSearchParams(location.search).get('lang');
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  const auto = nav === 'pl' ? 'pl' : ['ru', 'uk', 'be', 'kk'].includes(nav) ? 'ru' : 'en';
  const has = l => ['ru', 'en', 'pl'].includes(l);
  setLang(has(asked) ? asked : has(saved) ? saved : auto);
  for (const b of $$('.lang button')) b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    try { localStorage.setItem('lang', b.dataset.lang); } catch {}
  });

  /* ───── Появление блоков при прокрутке ───── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(el => io.observe(el));

    const links = $$('.nav a');
    const spy = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) for (const a of links) {
        if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));
  } else $$('.rv').forEach(el => el.classList.add('in'));
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* ───── Прокрутка: шапка, полоса прогресса, линия кейса ───── */
  const hdr = $('.hdr'), bar = $('.progress'), line = $('.flow-line'), fill = $('.flow-fill'), steps = $$('.step');
  let ticking = false, lastKick = 0;
  function onScroll() {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', scrollY > 24);
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    // линия идёт от центра первого узла до центра последнего
    line.style.bottom = 'auto';
    line.style.height = steps[steps.length - 1].offsetTop + 'px';
    const r = line.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .62 - r.top) / r.height));
    fill.style.transform = `scaleY(${p})`;
    for (const s of steps) s.classList.toggle('lit', p > 0 && s.offsetTop <= p * r.height + 1);
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    const now = performance.now(); // пока листаешь, по сети бежит больше импульсов
    if (!reduced && now - lastKick > 240 && nodes.length) { lastKick = now; spawn(nodes[rnd() * nodes.length | 0], 2); }
  }, { passive: true });
  addEventListener('resize', onScroll);

  /* ───── Свет за курсором на карточках, «магнитные» кнопки, наклон панели ───── */
  const run = $('.run');
  if (fine) addEventListener('pointermove', e => {
    const c = e.target.closest?.('.spot');
    if (c) {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    }
    if (!reduced && scrollY < innerHeight) {
      run.style.setProperty('--ry', (-7 + (e.clientX / innerWidth - .5) * 12).toFixed(2) + 'deg');
      run.style.setProperty('--rx', (3 - (e.clientY / innerHeight - .5) * 9).toFixed(2) + 'deg');
    }
  }, { passive: true });
  if (fine && !reduced) for (const m of $$('.magnetic')) {
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .32).toFixed(1)}px)`;
    });
    m.addEventListener('pointerleave', () => { m.style.transform = ''; });
  }

  /* ───── Панель «прогон workflow»: шаги загораются по очереди ───── */
  const rows = $$('.run-steps li');
  if (reduced) rows.forEach(r => r.classList.add('is-done'));
  else {
    let i = 0;
    const tick = () => {
      if (i > 0) rows[i - 1].classList.replace('is-run', 'is-done');
      if (i === rows.length) {
        i = 0;
        return setTimeout(() => { rows.forEach(r => r.classList.remove('is-done')); tick(); }, 2600);
      }
      rows[i++].classList.add('is-run');
      setTimeout(tick, 1100);
    };
    tick();
  }

  /* ───── Фон: сеть узлов-workflow, реагирующая на курсор ───── */
  const cvs = $('#bg'), ctx = cvs.getContext('2d');
  const NEON = 'rgb(61,255,139)', R = 240; // R — радиус влияния курсора
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, on: false, k: 0 };
  let W = 0, H = 0, nodes = [], edges = [], pulses = [], rings = [], lastAmb = 0, last = 0;

  // заранее отрисованное свечение — дешевле, чем shadowBlur на каждом кадре
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 128;
  {
    const g = sprite.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(61,255,139,1)'); gr.addColorStop(.25, 'rgba(61,255,139,.35)'); gr.addColorStop(1, 'rgba(61,255,139,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  const glow = (x, y, size, a) => { ctx.globalAlpha = a; ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size); };
  const box = ctx.roundRect ? (x, y, s) => ctx.roundRect(x, y, s, s, 3) : (x, y, s) => ctx.rect(x, y, s, s);

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = W < 720 ? 118 : 164, cols = Math.ceil(W / cell) + 1, rowsN = Math.ceil(H / cell) + 1, grid = [];
    nodes = []; edges = []; pulses = [];
    for (let c = 0; c < cols; c++) {
      grid[c] = [];
      for (let r = 0; r < rowsN; r++) {
        if (rnd() < .3) continue;
        const n = { bx: (c + rnd() * .6) * cell, by: (r + rnd() * .6) * cell, x: 0, y: 0, ox: 0, oy: 0, e: 0, ph: rnd() * 6.28, hit: 0, out: [] };
        grid[c][r] = n; nodes.push(n);
      }
    }
    // связи идут слева направо, как в n8n: к соседу в следующей колонке, иногда с развилкой
    for (let c = 0; c < cols - 1; c++) for (let r = 0; r < rowsN; r++) {
      const a = grid[c][r];
      if (!a) continue;
      const next = [r, r - 1, r + 1].map(i => grid[c + 1][i]).filter(Boolean);
      for (const b of next.slice(0, rnd() < .35 ? 2 : 1)) { const e = { a, b }; edges.push(e); a.out.push(e); }
    }
  }

  function spawn(n, hops) {
    if (n.out.length && pulses.length < 90) pulses.push({ e: n.out[rnd() * n.out.length | 0], t: 0, v: .0007 + rnd() * .0006, hops });
  }

  // точка на кривой связи (кубический Безье с горизонтальными «усами»)
  function bez({ a, b }, t) {
    const mx = (a.x + b.x) / 2, u = 1 - t, c0 = u * u * u, c1 = 3 * u * u * t, c2 = 3 * u * t * t, c3 = t * t * t;
    return [c0 * a.x + (c1 + c2) * mx + c3 * b.x, (c0 + c1) * a.y + (c2 + c3) * b.y];
  }

  function draw(t, dt) {
    ctx.clearRect(0, 0, W, H);
    mouse.k += ((mouse.on ? 1 : 0) - mouse.k) * .06;
    mouse.sx += (mouse.x - mouse.sx) * .14; mouse.sy += (mouse.y - mouse.sy) * .14;

    for (const n of nodes) {
      const dx = mouse.sx - n.bx, dy = mouse.sy - n.by, d = Math.hypot(dx, dy) || 1;
      const near = d < R ? (1 - d / R) * mouse.k : 0, pull = near * near * 30;
      n.ox += (dx / d * pull - n.ox) * .08; n.oy += (dy / d * pull - n.oy) * .08;
      n.x = n.bx + Math.sin(t * .0004 + n.ph) * 7 + n.ox;
      n.y = n.by + Math.cos(t * .0005 + n.ph * 1.7) * 7 + n.oy;
      n.e = Math.max(n.e * .955, near);
      if (near > .5 && t - n.hit > 1200) { n.hit = t; spawn(n, 3); }
    }

    ctx.lineWidth = 1; ctx.strokeStyle = NEON;
    for (const { a, b } of edges) {
      const mx = (a.x + b.x) / 2;
      ctx.globalAlpha = .07 + .38 * Math.max(a.e, b.e);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y); ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';
    if (mouse.k > .01) glow(mouse.sx, mouse.sy, 620, .13 * mouse.k);
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.v * dt;
      if (p.t >= 1) { p.e.b.e = 1; if (p.hops > 0) spawn(p.e.b, p.hops - 1); pulses.splice(i, 1); continue; }
      for (let k = 0; k < 4 && p.t - k * .035 >= 0; k++) { const [x, y] = bez(p.e, p.t - k * .035); glow(x, y, 26 - k * 4, .9 - k * .22); }
    }
    for (const n of nodes) if (n.e > .03) glow(n.x, n.y, 70, n.e * .45);
    ctx.globalCompositeOperation = 'source-over';

    for (const n of nodes) {
      const s = 9 + n.e * 4;
      ctx.beginPath(); box(n.x - s / 2, n.y - s / 2, s);
      ctx.globalAlpha = 1; ctx.fillStyle = '#04100a'; ctx.fill();
      ctx.globalAlpha = .1 + .6 * n.e; ctx.fillStyle = NEON; ctx.fill();
      ctx.globalAlpha = .3 + .7 * n.e; ctx.stroke();
    }

    for (let i = rings.length - 1; i >= 0; i--) { // круги от клика
      const k = (t - rings[i].t) / 800;
      if (k >= 1) { rings.splice(i, 1); continue; }
      ctx.globalAlpha = (1 - k) * .6;
      ctx.beginPath(); ctx.arc(rings[i].x, rings[i].y, 12 + k * 220, 0, 6.2832); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ───── Курсор ───── */
  const dot = $('.cur-dot'), ring = $('.cur-ring');
  const useCursor = fine && !reduced;
  let rx = 0, ry = 0, rs = 1, hov = false, down = false;
  if (useCursor) {
    root.classList.add('has-cursor');
    addEventListener('pointerover', e => { hov = !!e.target.closest?.('a,button'); ring.classList.toggle('hov', hov); });
  }

  function frame(t) {
    const dt = Math.min(50, t - last); last = t;
    if (t - lastAmb > 650 && nodes.length) { lastAmb = t; spawn(nodes[rnd() * nodes.length | 0], 4); }
    draw(t, dt);
    if (useCursor) {
      rx += (mouse.x - rx) * .2; ry += (mouse.y - ry) * .2;
      rs += ((down ? .75 : hov ? 1.7 : 1) - rs) * .2;
      dot.style.transform = `translate3d(${mouse.x}px,${mouse.y}px,0)`;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0) scale(${rs.toFixed(3)})`;
    }
    requestAnimationFrame(frame);
  }

  build();
  onScroll();
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (cvs.clientWidth !== W || cvs.clientHeight !== H) { build(); if (reduced) draw(0, 0); } }, 150);
  });

  if (reduced) draw(0, 0); // один статичный кадр: без движения, без реакции на курсор
  else {
    const leave = () => { mouse.on = false; root.classList.remove('cur-on'); };
    addEventListener('pointermove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!mouse.on) { mouse.on = true; root.classList.add('cur-on'); if (mouse.k < .02) { mouse.sx = rx = mouse.x; mouse.sy = ry = mouse.y; } }
    }, { passive: true });
    addEventListener('pointerdown', e => {
      down = true;
      rings.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      for (const n of nodes) if (Math.hypot(n.x - e.clientX, n.y - e.clientY) < 260) { n.e = 1; spawn(n, 4); }
    }, { passive: true });
    addEventListener('pointerup', e => { down = false; if (e.pointerType !== 'mouse') leave(); });
    addEventListener('pointercancel', leave);
    root.addEventListener('mouseleave', leave);
    addEventListener('blur', leave);
    requestAnimationFrame(frame);
  }
  window.__ok = 1; // дошли до конца без ошибок — страховка в <head> не сработает
})();
