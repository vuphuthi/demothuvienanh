'use strict';

/* =========================================================
   Tiện ích
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } },
};

const PATHS = {
  heart: '<path d="M12 20.3s-7.4-4.5-9.1-9.1C1.7 7.9 3.8 4.6 7.2 4.6c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.5 3.3 4.3 6.6-1.7 4.6-9.1 9.1-9.1 9.1z"/>',
  download: '<path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/>',
  share: '<path d="M14 5l6 6-6 6M20 11h-7.5C8 11 5 13.5 4 18.5"/>',
  play: '<path d="M7.5 5v14l11.5-7z"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  phone: '<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.7 20 4 13.3 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
  map: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13"/>',
  arrowLeft: '<path d="M19 12H5m0 0l6-6m-6 6l6 6"/>',
  arrowUp: '<path d="M12 19V5m0 0l-6 6m6-6l6 6"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  facebook: '<path fill="currentColor" stroke="none" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/>',
  tiktok: '<path d="M14 3.5v11.2a3.7 3.7 0 1 1-3.7-3.7M14 3.5c.4 2.6 2.2 4.4 5 4.6"/>',
  upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 19.5h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
};
const ic = (name) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
const fillIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = ic(el.dataset.icon); });

/* =========================================================
   Dữ liệu mẫu (ảnh: Unsplash, miễn phí sử dụng)
   ========================================================= */
const STUDIO = {
  name: 'Phú Thi Dev',
  phone: '0900 000 000',
  address: 'Hà Nội: 12 Phố Mẫu, Hoàn Kiếm  ·  Hải Phòng: 88 Đường Mẫu, Lê Chân',
};

const CATS = {
  moi: 'Ảnh mới', tinh: 'Tịnh', black: 'Black', red: 'Red', nangtho: 'Nàng thơ – Công chúa', quyenru: 'Quyến rũ',
  sangchanh: 'Sang chảnh', cuoi: 'Cưới', basic: 'Basic concept',
};

// [mã, id Unsplash, nhóm, tỉ lệ khung (rộng/cao), đen trắng?]
const RAW = [
  ['22', '1492106087820-71f1a00d2b11', 'nangtho', 2 / 3],
  ['01', '1494790108377-be9c29b29330', 'red basic', 4 / 5],
  ['17', '1506863530036-1efeddceb993', 'black tinh', 4 / 5],
  ['24', '1483985988355-763728e1935b', 'sangchanh red', 2 / 3],
  ['18', '1500917293891-ef795e70e1f6', 'nangtho', 2 / 3],
  ['34', '1606216794074-735e91aa2c92', 'cuoi', 4 / 5],
  ['07', '1488426862026-3ee34a7d66df', 'quyenru', 4 / 5],
  ['03', '1534528741775-53994a69daeb', 'tinh', 4 / 5],
  ['06b', '1524504388940-b1c1722653e1', 'black', 2 / 3, true],
  ['12', '1509967419530-da38b4704bc6', 'nangtho', 4 / 5],
  ['21', '1503185912284-5271ff81b9a8', 'red', 2 / 3],
  ['27', '1487412947147-5cebf100ffc2', 'quyenru sangchanh', 4 / 5],
  ['04', '1517841905240-472988babdf9', 'basic', 2 / 3],
  ['35', '1591604466107-ec97de577aff', 'cuoi', 2 / 3],
  ['59', '1601412436009-d964bd02edbc', 'tinh', 4 / 5],
  ['10', '1519699047748-de8e457a634e', 'nangtho', 4 / 5],
  ['43', '1526510747491-58f928ec870f', 'red quyenru', 2 / 3],
  ['16', '1544005313-94ddf0286df2', 'tinh', 2 / 3],
  ['25', '1539109136881-3be0616acf4b', 'sangchanh', 2 / 3],
  ['14', '1485893086445-ed75865251e0', 'basic', 4 / 5],
  ['08', '1531746020798-e6953c6e8e04', 'nangtho', 4 / 5],
  ['38', '1460978812857-470ed1c77af0', 'cuoi black', 2 / 3],
  ['13', '1496440737103-cd596325d314', 'quyenru', 2 / 3],
  ['42', '1521146764736-56c929d59c83', 'tinh', 1],
  ['05', '1529626455594-4ff0802cfb7e', 'red nangtho', 4 / 5],
  ['19', '1513379733131-47fc74b45fc7', 'sangchanh', 4 / 5],
  ['16b', '1544005313-94ddf0286df2', 'black', 4 / 5, true],
  ['46', '1541823709867-1b206113eafd', 'nangtho basic', 2 / 3],
  ['44', '1516726817505-f5ed825624d8', 'quyenru', 2 / 3],
  ['33', '1494955870715-979ca4f13bf0', 'cuoi', 2 / 3],
  ['32', '1465495976277-4387d4b0b4c6', 'cuoi', 3 / 2],
  ['02', '1438761681033-6461ffad8d80', 'nangtho', 2 / 3],
  ['57', '1557296387-5358ad7997bb', 'sangchanh', 1],
  ['28', '1499952127939-9bbf5af6c51c', 'basic', 4 / 5],
  ['09', '1502823403499-6ccfcf4fb453', 'tinh', 2 / 3],
  ['23', '1469334031218-e382a71b716b', 'quyenru', 4 / 5],
  ['37', '1537633552985-df8429e8048b', 'cuoi', 4 / 5],
  ['45', '1504703395950-b89145a5425b', 'nangtho', 4 / 5],
  ['49', '1530785602389-07594beb8b73', 'sangchanh', 4 / 5],
  ['20', '1520813792240-56fc4a3765a7', 'basic', 1],
  ['52', '1512316609839-ce289d3eba0a', 'tinh', 4 / 5],
  ['40', '1518577915332-c2a19f149a75', 'quyenru', 4 / 5],
  ['30', '1519741497674-611481863552', 'cuoi tinh', 2 / 3],
  ['60', '1595959183082-7b570b7e08e2', 'nangtho', 3 / 2],
  ['48', '1546961329-78bef0414d7c', 'basic', 4 / 5],
  ['13b', '1496440737103-cd596325d314', 'black', 4 / 5, true],
  ['56', '1523264766116-1e09b3145b84', 'quyenru', 4 / 5],
  ['11', '1515886657613-9f3515b0c78f', 'basic', 2 / 3],
  ['29', '1525134479668-1bee5c7c6845', 'basic', 1],
  ['55', '1484399172022-72a90b12e3c1', 'basic', 4 / 5],
  ['50', '1514315384763-ba401779410f', 'basic', 3 / 2],
  ['51', '1542596594-649edbc13630', 'basic', 1],
  ['15', '1508214751196-bcfd4ca60f91', 'basic', 1],
];
const BASE = RAW.map(([code, id, cats, ar, bw]) => ({ code, id, cats: cats.split(' '), ar, bw: !!bw }));
let PHOTOS = BASE;
let BY_CODE = Object.fromEntries(BASE.map((p) => [p.code, p]));

const has = (...cs) => (p) => cs.some((c) => p.cats.includes(c));
const COLLS = [
  { slug: 'tong-hop', title: '0. Tổng hợp', file: 'Tong_hop', date: '19 · 07 · 2026', cover: ['18', '22', '10'], pick: () => true },
  { slug: 'khach-studio', title: '1. Khách Phú Thi Dev', file: 'Khach_studio', date: '02 · 08 · 2026', cover: ['16', '46', '52'], pick: has('basic', 'quyenru') },
  { slug: 'tinh', title: '2. Tịnh', file: 'Tinh', date: '14 · 08 · 2026', cover: ['59', '17', '42'], pick: has('tinh', 'black') },
  { slug: 'nang-tho', title: '3. Nàng thơ', file: 'Nang_tho', date: '28 · 08 · 2026', cover: ['12', '08', '02'], pick: has('nangtho') },
  { slug: 'sang-chanh', title: '4. Sang chảnh', file: 'Sang_chanh', date: '06 · 09 · 2026', cover: ['24', '27', '57'], pick: has('sangchanh', 'red') },
  { slug: 'cuoi', title: '5. Cưới', file: 'Cuoi', date: '21 · 09 · 2026', cover: ['34', '35', '38'], pick: has('cuoi') },
];
// Ảnh người dùng đăng (lấy từ server.py), luôn đứng đầu bộ ảnh
let UPLOADS = [];
let API_OK = false;
const upTokens = store.get('pt-upload-tokens', {});

function rebuild() {
  const ups = UPLOADS.map((u) => ({
    code: `u-${u.id}`, uid: u.id, src: u.url, name: u.name, coll: u.collection, uploaded: true,
    cats: ['moi', ...(u.cat && CATS[u.cat] ? [u.cat] : [])],
    ar: Math.min(2.5, Math.max(0.4, (u.w || 4) / (u.h || 5))),
  }));
  PHOTOS = [...ups, ...BASE];
  BY_CODE = Object.fromEntries(PHOTOS.map((p) => [p.code, p]));
  COLLS.forEach((c) => {
    c.photos = PHOTOS.filter((p) => (p.uploaded ? c.slug === 'tong-hop' || p.coll === c.slug : c.pick(p)));
    c.cats = Object.keys(CATS).filter((k) => c.photos.some((p) => p.cats.includes(k)));
  });
}
rebuild();

const UNS = 'https://images.unsplash.com/photo-';
const IMG = (p, w) => p.src || `${UNS}${p.id}?auto=format&fit=crop&crop=faces,center&w=${w}&h=${Math.round(w / p.ar)}&q=${w < 100 ? 30 : 78}${p.bw ? '&sat=-100' : ''}`;
const COVER = (p, w, h) => p.src || `${UNS}${p.id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}&crop=faces,center` : ''}&q=80${p.bw ? '&sat=-100' : ''}`;
const CARD_SRC = (p, i) => (i ? COVER(p, 450, 450) : COVER(p, 900, 900));
const HERO_SRC = (p, i) => (i ? COVER(p, 900, 760) : COVER(p, 1700, 1250));
const AVATAR = `${UNS}${BY_CODE['18'].id}?auto=format&fit=crop&crop=faces&w=180&h=180&q=80`;
const photoHash = (c, i) => `#/c/${c.slug}/${c.photos[i].code}`;
const fileName = (c, i) => c.photos[i]?.name || `${c.file}_Concept_19-7-2026_${String(i + 1).padStart(2, '0')}.jpg`;

/* =========================================================
   Trạng thái chung
   ========================================================= */
const app = $('#app');
let view = null;            // { type: 'home' } | { type: 'coll', c, cat, favOnly }
let viewAC = null;          // huỷ listener khi đổi trang
let observers = [];
let homeY = 0;
const favs = new Set(store.get('lumiere-favs', []));
const named = [];
let loaderDone;
const loaderPromise = new Promise((r) => { loaderDone = r; });

/* =========================================================
   Hiệu ứng dùng chung
   ========================================================= */
function splitText(el) {
  let i = 0;
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${Array.from(w).map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join(' ');
}

function reveal(els, { stagger = 90 } = {}) {
  const io = new IntersectionObserver((entries) => {
    let k = 0;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.setProperty('--d', `${(k++ * stagger) / 1000}s`);
      e.target.style.transitionDelay = e.target.classList.contains('tile') ? `${k * 55}ms` : '';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
  els.forEach((el) => io.observe(el));
  observers.push(io);
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3000);
}

function burst(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const colors = ['#ff4f6a', '#ff8fa3', '#e8c48f', '#ffd1dc'];
  for (let k = 0; k < 12; k++) {
    const s = document.createElement('i');
    s.className = 'spark';
    s.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[k % 4]}`;
    document.body.append(s);
    const a = (k / 12) * Math.PI * 2, d = 24 + Math.random() * 18;
    s.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(0)`, opacity: 0 },
    ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
  }
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
}

function smoothScrollTo(y, dur = 1100) {
  if (reduced) return window.scrollTo(0, y);
  const start = scrollY, diff = y - start, t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    window.scrollTo(0, start + diff * ease(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function waitImages(imgs, max = 700) {
  return Promise.race([
    Promise.all(imgs.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))),
    sleep(max),
  ]);
}

/* =========================================================
   Điều hướng + chuyển trang mượt
   ========================================================= */
function parse() {
  const m = location.hash.match(/^#\/c\/([\w-]+)(?:\/([\w-]+))?/);
  return m ? { slug: m[1], code: m[2] ?? null } : { home: true };
}

function go(hash, opts = {}) {
  history.pushState(null, '', hash);
  return route(opts);
}

async function route(opts = {}) {
  const r = parse();
  if (r.home) {
    if (lb.open) closeLb(true);
    if (view?.type !== 'home') await swap(renderHome, { toHome: true, from: view?.c?.slug });
    return;
  }
  const c = COLLS.find((x) => x.slug === r.slug);
  if (!c) { history.replaceState(null, '', '#/'); return route(); }
  if (view?.type !== 'coll' || view.c !== c) await swap((first) => renderColl(c, first), { toColl: c.slug });
  const idx = r.code ? c.photos.findIndex((p) => p.code === r.code) : -1;
  if (idx >= 0) openLb(idx, opts);
  else if (lb.open) closeLb();
}

function nameEls(els) {
  ['cv-a', 'cv-b', 'cv-c'].forEach((n, i) => {
    if (!els[i]) return;
    els[i].style.viewTransitionName = n;
    named.push(els[i]);
  });
}
function clearNames() { named.splice(0).forEach((el) => { el.style.viewTransitionName = ''; }); }
const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

async function swap(render, info) {
  const first = !view;
  const doRender = () => {
    if (view?.type === 'home') homeY = scrollY;
    observers.forEach((o) => o.disconnect());
    observers = [];
    viewAC?.abort();
    viewAC = new AbortController();
    render(first);
    window.scrollTo(0, info.toHome ? homeY : 0);
  };

  if (first || reduced) { doRender(); return; }

  if (!document.startViewTransition) {
    const out = app.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' });
    await out.finished;
    doRender();
    out.cancel();
    app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
    return;
  }

  if (info.toColl) nameEls($$(`.card[data-slug="${info.toColl}"] .ci`));
  else if (info.toHome) nameEls($$('.hi'));

  const vt = document.startViewTransition(async () => {
    clearNames();
    doRender();
    if (info.toColl) {
      nameEls($$('.hi'));
      await waitImages($$('.hi img'));
    } else if (info.toHome && info.from) {
      const cis = $$(`.card[data-slug="${info.from}"] .ci`);
      if (cis[0] && inView(cis[0])) nameEls(cis);
    }
  });
  try { await vt.finished; } catch { /* bỏ qua */ }
  clearNames();
}

/* =========================================================
   TRANG CHỦ
   ========================================================= */
function renderHome(first) {
  view = { type: 'home' };
  const sig = viewAC.signal;
  app.innerHTML = `
  <div class="view home">
    <header class="home-top">
      <div class="socials">
        <a class="icon-btn" href="#" data-soon aria-label="Facebook">${ic('facebook')}</a>
        <a class="icon-btn" href="#" data-soon aria-label="Instagram">${ic('instagram')}</a>
        <a class="icon-btn" href="#" data-soon aria-label="TikTok">${ic('tiktok')}</a>
      </div>
      <div class="home-actions">
        <button class="pill-btn" data-open-upload>${ic('upload')}<span>Đăng ảnh</span></button>
        <button class="icon-btn" data-open-search aria-label="Tìm kiếm">${ic('search')}</button>
      </div>
    </header>

    <section class="intro" id="intro">
      <div class="avatar fu" style="--d:0s"><img src="${AVATAR}" alt="${esc(STUDIO.name)}"></div>
      <h1 class="studio-name split">${esc(STUDIO.name)}</h1>
      <p class="welcome fu" style="--d:.55s">Chào mừng bạn ghé thăm thư viện ${esc(STUDIO.name)}, hy vọng bạn sẽ tìm được bộ ảnh ưng ý dành cho mình nha!</p>
      <ul class="contact fu" style="--d:.7s">
        <li>${ic('phone')}<a class="ulink" href="tel:0900000000">${STUDIO.phone}</a></li>
        <li>${ic('map')}<span>${esc(STUDIO.address)}</span></li>
      </ul>
    </section>

    <section class="collections">
      ${COLLS.map((c) => {
        const [a, b, d] = c.cover.map((k) => BY_CODE[k]);
        return `
        <a class="card reveal" href="#/c/${c.slug}" data-slug="${c.slug}" data-cursor="Xem">
          <div class="collage">
            <div class="ci a"><img src="${CARD_SRC(a, 0)}" alt="" loading="lazy"></div>
            <div class="ci b"><img src="${CARD_SRC(b, 1)}" alt="" loading="lazy"></div>
            <div class="ci c"><img src="${CARD_SRC(d, 2)}" alt="" loading="lazy"></div>
            <div class="card-hover"><span class="card-count"><b data-count="${c.slug}">${c.photos.length}</b> khoảnh khắc</span><span class="card-cta">Xem bộ ảnh</span></div>
          </div>
          <h2 class="card-title"><span>${esc(c.title)}</span></h2>
          <span class="card-meta">${c.date}</span>
        </a>`;
      }).join('')}
    </section>
    ${footerHTML()}
  </div>`;

  const intro = $('#intro');
  splitText($('.studio-name', intro));

  if (first) {
    loaderPromise.then(() => setTimeout(() => intro.classList.add('in'), 150));
    reveal($$('.reveal', app));
  } else {
    // Quay lại trang chủ: hiện ngay, không chạy lại hiệu ứng mở đầu
    app.classList.add('no-anim');
    intro.classList.add('in');
    $$('.reveal', app).forEach((el) => el.classList.add('in'));
    requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove('no-anim')));
  }

  $$('.card', app).forEach((card) => {
    const col = $('.collage', card);
    card.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      go(`#/c/${card.dataset.slug}`);
    }, { signal: sig });
    card.addEventListener('pointerenter', () => {
      // tải trước ảnh bìa lớn để chuyển trang mượt
      const c = COLLS.find((x) => x.slug === card.dataset.slug);
      c.cover.forEach((k, i) => { new Image().src = HERO_SRC(BY_CODE[k], i); });
    }, { signal: sig, once: true });
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      const r = col.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      col.style.setProperty('--ry', `${x * 7}deg`);
      col.style.setProperty('--rx', `${-y * 7}deg`);
    }, { signal: sig });
    card.addEventListener('pointerleave', () => {
      col.style.setProperty('--ry', '0deg');
      col.style.setProperty('--rx', '0deg');
    }, { signal: sig });
  });
}

const footerHTML = () => `<footer class="foot"><span class="sig">${esc(STUDIO.name)}</span>Bản demo giao diện · Ảnh mẫu từ Unsplash</footer>`;

/* =========================================================
   TRANG BỘ ẢNH
   ========================================================= */
function renderColl(c, first) {
  view = { type: 'coll', c, cat: 'all', favOnly: false };
  const sig = viewAC.signal;
  const cover = c.cover.map((k) => BY_CODE[k]);

  app.innerHTML = `
  <div class="view coll">
    <section class="hero" id="hero">
      <div class="hero-collage">
        ${cover.map((p, i) => `<div class="hi ${'abc'[i]}"><div class="px" data-speed="${[0.22, 0.1, 0.16][i]}"><img src="${HERO_SRC(p, i)}" alt=""></div></div>`).join('')}
      </div>
      <div class="hero-shade"></div>
      <div class="hero-grain"></div>
      <a class="hero-back" href="#/">${ic('arrowLeft')}<span>Thư viện</span></a>
      <div class="hero-content" id="heroContent">
        <p class="hero-kicker fu" style="--d:.1s"><span id="heroCount">${c.photos.length}</span> khoảnh khắc · ${c.date}</p>
        <h1 class="hero-title split">${esc(c.title)}</h1>
        <button class="btn-outline fu" style="--d:.6s" id="viewGallery"><span>View gallery</span></button>
      </div>
      <div class="hero-brand fu" style="--d:.8s"><img src="${AVATAR}" alt=""><span>${esc(STUDIO.name)}</span></div>
      <button class="scroll-hint" id="scrollHint" aria-label="Cuộn xuống"><span></span></button>
    </section>

    <div class="toolbar" id="toolbar">
      <div class="tb-inner">
        <div class="tb-title"><strong>${esc(c.title)}</strong><small>${esc(STUDIO.name)}</small></div>
        <nav class="tabs" id="tabs">${tabsHTML(c, 'all')}</nav>
        <div class="tb-actions">
          <button class="icon-btn" data-open-upload aria-label="Đăng ảnh">${ic('upload')}</button>
          <button class="icon-btn fav" id="favFilter" aria-label="Ảnh yêu thích">${ic('heart')}<span class="badge" id="favBadge"></span></button>
          <button class="icon-btn" id="dlAll" aria-label="Tải tất cả">${ic('download')}</button>
          <button class="icon-btn" id="shareColl" aria-label="Chia sẻ">${ic('share')}</button>
          <button class="icon-btn" id="playAll" aria-label="Trình chiếu">${ic('play')}</button>
        </div>
      </div>
      <div class="tb-progress"><i id="tbProg"></i></div>
    </div>

    <section class="grid" id="grid">${tilesHTML(c)}</section>
    <p class="grid-empty" id="gridEmpty" hidden>Bạn chưa thả tim ảnh nào trong bộ này — rê chuột lên ảnh và bấm ♡ nhé.</p>
    ${footerHTML()}
  </div>`;

  const hero = $('#hero');
  splitText($('.hero-title', hero));
  const showHero = () => hero.classList.add('in');
  if (first) loaderPromise.then(() => setTimeout(showHero, 150));
  else setTimeout(showHero, 420);

  hookTiles();
  layoutGrid();
  reveal($$('.tile', app));
  updateFavBadge();
  requestAnimationFrame(moveInk);

  // cuộn: parallax ảnh bìa + tiến độ
  const pxs = $$('.px', hero);
  const heroContent = $('#heroContent');
  const toolbar = $('#toolbar');
  const prog = $('#tbProg');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, h = hero.offsetHeight;
      if (y <= h && !reduced) {
        pxs.forEach((px) => { px.style.transform = `translate3d(0, ${y * px.dataset.speed}px, 0)`; });
        heroContent.style.transform = `translate3d(0, ${y * 0.38}px, 0)`;
        heroContent.style.opacity = Math.max(0, 1 - y / (h * 0.55));
      }
      toolbar.classList.toggle('stuck', y >= h - 1);
      const max = document.documentElement.scrollHeight - innerHeight - h;
      prog.style.setProperty('--p', Math.min(1, Math.max(0, (y - h) / Math.max(1, max))));
    });
  };
  addEventListener('scroll', onScroll, { passive: true, signal: sig });
  onScroll();

  const toGrid = () => smoothScrollTo(hero.offsetHeight);
  $('#viewGallery').addEventListener('click', toGrid, { signal: sig });
  $('#scrollHint').addEventListener('click', toGrid, { signal: sig });
  $('.hero-back', hero).addEventListener('click', (e) => { e.preventDefault(); go('#/'); }, { signal: sig });

  // tab lọc
  $('#tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    $$('.tab', app).forEach((x) => x.classList.toggle('active', x === t));
    view.cat = t.dataset.cat;
    moveInk();
    t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    applyFilter(true);
  }, { signal: sig });

  $('#favFilter').addEventListener('click', (e) => {
    view.favOnly = !view.favOnly;
    e.currentTarget.classList.toggle('on', view.favOnly);
    applyFilter(true);
    toast(view.favOnly ? 'Đang xem ảnh bạn đã thả tim' : 'Hiện lại tất cả ảnh');
  }, { signal: sig });
  $('#dlAll').addEventListener('click', () => toast(`Demo: tải ${visibleIdx().length} ảnh (.zip) sẽ do máy chủ xử lý`), { signal: sig });
  $('#shareColl').addEventListener('click', () => share(location.href.split('#')[0] + `#/c/${c.slug}`, c.title), { signal: sig });
  $('#playAll').addEventListener('click', () => {
    const list = visibleIdx();
    if (list.length) go(photoHash(c, list[0]), { fromEl: tileEl(list[0]), play: true });
  }, { signal: sig });

  // nút trên từng ảnh
  $('#grid').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const i = +tile.dataset.i, p = c.photos[i];
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'fav') toggleFav(p, e.target.closest('button'));
    else if (act === 'dl') download(p, fileName(c, i));
    else if (act === 'share') share(location.href.split('#')[0] + photoHash(c, i), fileName(c, i));
    else if (act === 'del') deleteUpload(p, tile);
    else go(photoHash(c, i), { fromEl: tile });
  }, { signal: sig });
}

function tabsHTML(c, active) {
  const ink = '<span class="tab-ink" id="tabInk"></span>';
  if (c.cats.length < 2) return ink;
  const count = (k) => c.photos.filter((p) => p.cats.includes(k)).length;
  return `<button class="tab ${active === 'all' ? 'active' : ''}" data-cat="all">Tất cả<span class="tab-n">${c.photos.length}</span></button>` +
    c.cats.map((k) => `<button class="tab ${active === k ? 'active' : ''}" data-cat="${k}">${CATS[k]}<span class="tab-n">${count(k)}</span></button>`).join('') + ink;
}

function tilesHTML(c) {
  return c.photos.map((p, i) => `
    <figure class="tile" data-i="${i}" data-code="${p.code}" data-cursor="Mở">
      <div class="tile-media">
        ${p.src ? '' : `<img class="lqip" src="${IMG(p, 24)}" alt="" aria-hidden="true">`}
        <img class="full" loading="lazy" decoding="async" src="${IMG(p, 600)}"
             ${p.src ? '' : `srcset="${IMG(p, 400)} 400w, ${IMG(p, 600)} 600w, ${IMG(p, 900)} 900w" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 22vw"`}
             alt="${esc(fileName(c, i))}">
      </div>
      ${p.uploaded ? '<span class="tile-new">Mới</span>' : ''}
      <div class="tile-ui">
        <button class="fav ${favs.has(p.code) ? 'on' : ''}" data-act="fav" aria-label="Yêu thích">${ic('heart')}</button>
        <button data-act="dl" aria-label="Tải ảnh">${ic('download')}</button>
        <button data-act="share" aria-label="Chia sẻ">${ic('share')}</button>
        ${p.uploaded && upTokens[p.uid] ? `<button data-act="del" aria-label="Xoá ảnh">${ic('trash')}</button>` : ''}
      </div>
    </figure>`).join('');
}

// ảnh mờ → ảnh nét
function hookTiles() {
  $$('.tile .full', app).forEach((img) => {
    if (img.complete && img.naturalWidth) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'), { once: true, signal: viewAC.signal });
  });
}

// Vẽ lại lưới + tab sau khi đăng/xoá ảnh (không chạy lại ảnh bìa)
function refreshView() {
  if (view?.type === 'home') {
    $$('[data-count]', app).forEach((b) => { b.textContent = COLLS.find((c) => c.slug === b.dataset.count).photos.length; });
    return;
  }
  if (view?.type !== 'coll') return;
  const c = view.c;
  if (view.cat !== 'all' && !c.cats.includes(view.cat)) view.cat = 'all';
  $('#tabs').innerHTML = tabsHTML(c, view.cat);
  $('#grid').innerHTML = tilesHTML(c);
  $('#heroCount').textContent = c.photos.length;
  hookTiles();
  applyFilter(false);
  reveal($$('.tile', app));
  updateFavBadge();
  moveInk();
}

const tileEl = (i) => $(`.tile[data-i="${i}"]`);
const matches = (p) => (view.cat === 'all' || p.cats.includes(view.cat)) && (!view.favOnly || favs.has(p.code));
const visibleIdx = () => $$('.tile', app).filter((t) => !t.hidden).map((t) => +t.dataset.i);

function layoutGrid() {
  const grid = $('#grid');
  if (!grid || view?.type !== 'coll') return;
  const cs = getComputedStyle(grid);
  const w = grid.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const cols = w > 1500 ? 5 : w > 1080 ? 4 : w > 680 ? 3 : 2;
  const gap = cols === 2 ? 6 : 10;
  grid.style.setProperty('--cols', cols);
  grid.style.setProperty('--gap', `${gap}px`);
  const colW = (w - gap * (cols - 1)) / cols;
  $$('.tile', grid).forEach((t) => {
    const p = view.c.photos[t.dataset.i];
    t.style.gridRowEnd = `span ${Math.round((colW / p.ar + gap) / 2)}`;
  });
}

// Lọc ảnh với hiệu ứng FLIP: ảnh cũ trượt tới chỗ mới, ảnh mới nở ra
function applyFilter(animate) {
  const tiles = $$('.tile', app);
  const before = new Map(tiles.filter((t) => !t.hidden).map((t) => [t, t.getBoundingClientRect()]));
  tiles.forEach((t) => { t.hidden = !matches(view.c.photos[t.dataset.i]); });
  layoutGrid();
  $('#gridEmpty').hidden = tiles.some((t) => !t.hidden);
  if (!animate || reduced) return;
  let n = 0;
  tiles.forEach((t) => {
    if (t.hidden) return;
    t.classList.add('in');
    const r = t.getBoundingClientRect();
    if (r.top > innerHeight + 200 || r.bottom < -200) return;
    const f = before.get(t);
    if (f) {
      const dx = f.left - r.left, dy = f.top - r.top;
      if (dx || dy || f.height !== r.height) {
        t.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${f.width / r.width}, ${f.height / r.height})`, transformOrigin: '0 0' },
          { transform: 'none', transformOrigin: '0 0' },
        ], { duration: 750, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    } else {
      t.animate([{ opacity: 0, transform: 'scale(.88) translateY(20px)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: Math.min(n++ * 40, 400), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    }
  });
}

function moveInk() {
  const ink = $('#tabInk'), t = $('.tab.active');
  if (!ink || !t) return;
  ink.style.width = `${t.offsetWidth - 22}px`;
  ink.style.transform = `translateX(${t.offsetLeft + 11}px)`;
}

/* =========================================================
   Yêu thích, tải, chia sẻ
   ========================================================= */
function toggleFav(p, btn) {
  const on = !favs.has(p.code);
  on ? favs.add(p.code) : favs.delete(p.code);
  store.set('lumiere-favs', [...favs]);
  $$(`.tile[data-code="${p.code}"] .fav`).forEach((b) => b.classList.toggle('on', on));
  if (lb.open && currentPhoto()?.code === p.code) $('#lbFav').classList.toggle('on', on);
  updateFavBadge();
  if (on && btn) burst(btn);
  if (view?.favOnly && !on) applyFilter(true);
}

function updateFavBadge() {
  const b = $('#favBadge');
  if (!b || view?.type !== 'coll') return;
  const n = view.c.photos.filter((p) => favs.has(p.code)).length;
  b.textContent = n;
  b.classList.toggle('show', n > 0);
}

async function download(p, name) {
  toast('Đang tải ảnh…');
  const url = IMG(p, 2000);
  try {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

async function share(url, title) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); toast('Đã sao chép liên kết ✓'); } catch { toast(url); }
}

/* =========================================================
   XEM ẢNH LỚN
   ========================================================= */
const lb = { open: false, list: [], pos: 0, playing: false, timer: 0, token: 0, pushed: false };
const lbEl = $('#lb'), lbImg = $('#lbImg'), lbStage = $('#lbStage');
const currentPhoto = () => view?.c?.photos[lb.list[lb.pos]];
const SLIDE_MS = 4200;

function sizeLbImg() {
  const p = currentPhoto();
  if (!p || !lb.open) return;
  const cs = getComputedStyle(lbStage);
  const W = lbStage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const H = lbStage.clientHeight - 8;
  const w = Math.min(W, H * p.ar);
  lbImg.style.width = `${w}px`;
  lbImg.style.height = `${w / p.ar}px`;
}

function buildStrip() {
  const c = view.c;
  $('#lbStrip').innerHTML = lb.list.map((i, k) => `<button data-k="${k}" aria-label="Ảnh ${k + 1}"><img src="${IMG(c.photos[i], 120)}" alt="" loading="lazy"></button>`).join('');
}

function openLb(idx, opts = {}) {
  const c = view.c;
  if (!lb.open) {
    lb.list = visibleIdx();
    if (!lb.list.includes(idx)) lb.list = c.photos.map((_, i) => i);
    lb.pos = lb.list.indexOf(idx);
    lb.open = true;
    lb.pushed = !!opts.fromEl;
    lbEl.hidden = false;
    document.body.classList.add('lock');
    buildStrip();
    show(0, opts.fromEl && !opts.fromEl.hidden ? opts.fromEl : null);
    if (!reduced) $$('.lb-fade', lbEl).forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' }));
    if (opts.play) togglePlay(true);
  } else {
    const k = lb.list.indexOf(idx);
    if (k >= 0 && k !== lb.pos) { const d = k > lb.pos ? 1 : -1; lb.pos = k; show(d); }
  }
}

function show(dir = 0, fromEl = null) {
  const c = view.c, i = lb.list[lb.pos], p = c.photos[i];
  const token = ++lb.token;
  lbImg.src = IMG(p, 600);
  lbImg.alt = fileName(c, i);
  sizeLbImg();
  const big = new Image();
  big.src = IMG(p, 1600);
  big.decode().then(() => { if (token === lb.token) lbImg.src = big.src; }).catch(() => {});

  $('#lbAmbient').src = IMG(p, 60);
  $('#lbCount').textContent = `${lb.pos + 1} / ${lb.list.length}`;
  $('#lbCaption').textContent = fileName(c, i);
  $('#lbFav').classList.toggle('on', favs.has(p.code));
  $$('#lbStrip button').forEach((b, k) => b.classList.toggle('on', k === lb.pos));
  $(`#lbStrip button[data-k="${lb.pos}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: dir ? 'smooth' : 'auto' });

  if (!reduced) {
    if (fromEl) {
      const r1 = fromEl.getBoundingClientRect(), r2 = lbImg.getBoundingClientRect();
      lbImg.animate([
        { transformOrigin: '0 0', transform: `translate(${r1.left - r2.left}px, ${r1.top - r2.top}px) scale(${r1.width / r2.width}, ${r1.height / r2.height})` },
        { transformOrigin: '0 0', transform: 'none' },
      ], { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)' });
    } else if (dir) {
      lbImg.animate([
        { opacity: 0, transform: `translateX(${dir * 70}px) scale(.96)`, filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }

  // tải trước ảnh kế bên
  [1, -1].forEach((d) => {
    const n = c.photos[lb.list[(lb.pos + d + lb.list.length) % lb.list.length]];
    new Image().src = IMG(n, 1600);
  });
  if (lb.playing) schedule();
}

function step(d) {
  if (!lb.open || lb.list.length < 2) return;
  lb.pos = (lb.pos + d + lb.list.length) % lb.list.length;
  history.replaceState(null, '', photoHash(view.c, lb.list[lb.pos]));
  show(d);
}

function schedule() {
  clearTimeout(lb.timer);
  const bar = $('#lbProg');
  bar.getAnimations().forEach((a) => a.cancel());
  bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: SLIDE_MS, easing: 'linear', fill: 'forwards' });
  lb.timer = setTimeout(() => step(1), SLIDE_MS);
}

function togglePlay(force) {
  lb.playing = force ?? !lb.playing;
  lbEl.classList.toggle('playing', lb.playing);
  $('#lbPlay').innerHTML = ic(lb.playing ? 'pause' : 'play');
  clearTimeout(lb.timer);
  if (lb.playing) schedule();
  else $('#lbProg').getAnimations().forEach((a) => a.cancel());
}

function requestCloseLb() {
  if (lb.pushed) history.back();
  else { history.replaceState(null, '', `#/c/${view.c.slug}`); closeLb(); }
}

async function closeLb(immediate) {
  if (!lb.open) return;
  lb.open = false;
  togglePlay(false);
  const tile = view?.type === 'coll' ? tileEl(lb.list[lb.pos]) : null;
  if (!immediate && !reduced) {
    const fades = $$('.lb-fade', lbEl).map((x) => x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' }));
    let anim;
    if (tile && !tile.hidden) {
      tile.scrollIntoView({ block: 'center' });
      const r1 = lbImg.getBoundingClientRect(), r2 = tile.getBoundingClientRect();
      anim = lbImg.animate([
        { transformOrigin: '0 0', transform: 'none' },
        { transformOrigin: '0 0', transform: `translate(${r2.left - r1.left}px, ${r2.top - r1.top}px) scale(${r2.width / r1.width}, ${r2.height / r1.height})` },
      ], { duration: 620, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    } else {
      anim = lbImg.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.94)' }], { duration: 380, fill: 'forwards' });
    }
    await Promise.all([anim, ...fades].map((a) => a.finished)).catch(() => {});
    if (lb.open) return; // đã mở lại trong lúc đóng
    [anim, ...fades].forEach((a) => a.cancel());
  }
  lbEl.hidden = true;
  document.body.classList.remove('lock');
}

function initLightbox() {
  $('#lbClose').addEventListener('click', requestCloseLb);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  $('#lbPlay').addEventListener('click', () => togglePlay());
  $('#lbFav').addEventListener('click', (e) => toggleFav(currentPhoto(), e.currentTarget));
  $('#lbDl').addEventListener('click', () => download(currentPhoto(), fileName(view.c, lb.list[lb.pos])));
  $('#lbShare').addEventListener('click', () => share(location.href, fileName(view.c, lb.list[lb.pos])));
  $('#lbStrip').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const k = +b.dataset.k;
    if (k === lb.pos) return;
    const d = k > lb.pos ? 1 : -1;
    lb.pos = k;
    history.replaceState(null, '', photoHash(view.c, lb.list[k]));
    show(d);
  });

  // vuốt / kéo để chuyển ảnh
  let sx = 0, dx = 0, dragging = false;
  lbStage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lb-nav') || e.button > 0) return;
    dragging = true; sx = e.clientX; dx = 0;
    lbStage.setPointerCapture(e.pointerId);
  });
  lbStage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - sx;
    lbImg.style.transform = `translateX(${dx}px) rotate(${dx / 80}deg)`;
    lbImg.style.opacity = 1 - Math.min(0.5, Math.abs(dx) / 600);
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    const from = lbImg.style.transform;
    lbImg.style.transform = '';
    lbImg.style.opacity = '';
    if (Math.abs(dx) > 70) step(dx < 0 ? 1 : -1);
    else if (dx) lbImg.animate([{ transform: from }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  lbStage.addEventListener('pointerup', end);
  lbStage.addEventListener('pointercancel', end);
  lbStage.addEventListener('dblclick', () => requestCloseLb());
}

/* =========================================================
   Tìm kiếm
   ========================================================= */
function openSearch() {
  const s = $('#search'), inp = $('#searchInput');
  s.hidden = false;
  document.body.classList.add('lock');
  inp.value = '';
  renderResults('');
  setTimeout(() => inp.focus(), 60);
}
function closeSearch() {
  $('#search').hidden = true;
  if (!lb.open) document.body.classList.remove('lock');
}
function renderResults(q) {
  const nq = norm(q.trim());
  const list = COLLS.filter((c) => norm(`${c.title} ${c.cats.map((k) => CATS[k]).join(' ')}`).includes(nq));
  $('#searchResults').innerHTML = list.length
    ? list.map((c, i) => `
      <a class="sr" href="#/c/${c.slug}" data-slug="${c.slug}" style="--i:${i}">
        <img src="${COVER(BY_CODE[c.cover[0]], 160, 160)}" alt="">
        <div><strong>${esc(c.title)}</strong><small>${c.photos.length} ảnh · ${c.cats.map((k) => CATS[k]).slice(0, 3).join(', ')}</small></div>
      </a>`).join('')
    : `<p class="sr-empty">Không tìm thấy bộ ảnh nào cho “${esc(q)}”.</p>`;
}
function initSearch() {
  $('#searchInput').addEventListener('input', (e) => renderResults(e.target.value));
  $('#searchClose').addEventListener('click', closeSearch);
  $('#searchResults').addEventListener('click', (e) => {
    const a = e.target.closest('.sr');
    if (!a) return;
    e.preventDefault();
    closeSearch();
    go(`#/c/${a.dataset.slug}`);
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-search]')) openSearch();
    const soon = e.target.closest('[data-soon]');
    if (soon) { e.preventDefault(); toast('Demo: liên kết mạng xã hội'); }
  });
}

/* =========================================================
   Màn chờ, con trỏ, nút lên đầu, phím tắt
   ========================================================= */
function initLoader() {
  const l = $('#loader');
  $('#loaderName').innerHTML = Array.from(STUDIO.name).map((ch, i) => (ch === ' ' ? ' ' : `<span class="ch" style="--i:${i}">${esc(ch)}</span>`)).join('');
  const t0 = performance.now();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setTimeout(() => {
      l.classList.add('done');
      loaderDone();
      setTimeout(() => l.remove(), 1200);
    }, Math.max(0, (reduced ? 0 : 1500) - (performance.now() - t0)));
  };
  if (document.readyState === 'complete') finish();
  else addEventListener('load', finish, { once: true });
  setTimeout(finish, 3200);
}

function initCursor() {
  if (!matchMedia('(pointer: fine)').matches || reduced) return;
  document.documentElement.classList.add('has-cursor');
  const cur = $('#cursor'), ring = $('.cursor-ring', cur), dot = $('.cursor-dot', cur), label = $('.cursor-label', cur);
  let mx = -100, my = -100, rx = mx, ry = my;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    cur.style.opacity = 1;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { cur.style.opacity = 0; });
  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('a:not([data-cursor]), button, input');
    const zone = e.target.closest('[data-cursor]');
    const showLabel = zone && !btn;
    cur.classList.toggle('label', !!showLabel);
    cur.classList.toggle('hover', !!btn);
    if (showLabel) label.textContent = zone.dataset.cursor;
  });
}

function initToTop() {
  const b = $('#toTop');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      b.classList.toggle('show', scrollY > 700);
      b.style.setProperty('--off', 138.2 * (1 - Math.min(1, scrollY / Math.max(1, max))));
    });
  }, { passive: true });
  b.addEventListener('click', () => smoothScrollTo(0, 1200));
}

function initKeys() {
  addEventListener('keydown', (e) => {
    if (!upEl.hidden) {
      if (e.key === 'Escape') closeUpload();
      return;
    }
    if (!$('#search').hidden) {
      if (e.key === 'Escape') closeSearch();
      if (e.key === 'Enter') $('.sr')?.click();
      return;
    }
    if (lb.open) {
      if (e.key === 'Escape') requestCloseLb();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key.toLowerCase() === 'f') toggleFav(currentPhoto(), $('#lbFav'));
      return;
    }
    if (e.key === '/' && !e.target.closest('input')) { e.preventDefault(); openSearch(); }
  });
}

/* =========================================================
   Đăng ảnh (cần chạy server.py)
   ========================================================= */
const UP_MAX = 20 * 1024 * 1024;
const UP_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const session = {
  get(k) { try { return sessionStorage.getItem(k) || ''; } catch { return ''; } },
  set(k, v) { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch { /* bỏ qua */ } },
};
// mật khẩu chỉ nhớ trong phiên (đóng tab là quên)
const up = { items: [], busy: false, needPass: false, pass: session.get('pt-up-pass') };
const upEl = $('#up');

function setLocked(locked, err = '') {
  $('.up-panel', upEl).classList.toggle('locked', locked);
  $('#upLockErr').textContent = err;
  if (locked) {
    if (err) {
      const f = $('#upLock');
      f.classList.remove('shake');
      void f.offsetWidth;
      f.classList.add('shake');
    }
    setTimeout(() => $('#upPass').focus(), 80);
  }
}

async function unlock(e) {
  e.preventDefault();
  const pass = $('#upPass').value.trim();
  if (!pass) { setLocked(true, 'Bạn chưa nhập mật khẩu'); return; }
  const btn = $('#upUnlock');
  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra…';
  try {
    const r = await fetch('api/auth', { method: 'POST', headers: { 'X-Upload-Password': pass } });
    if (r.ok) {
      up.pass = pass;
      session.set('pt-up-pass', pass);
      $('#upPass').value = '';
      setLocked(false);
      toast('Đã mở khoá đăng ảnh');
    } else {
      const body = await r.json().catch(() => ({}));
      setLocked(true, body.error || 'Sai mật khẩu');
      $('#upPass').select();
    }
  } catch {
    setLocked(true, 'Mất kết nối, thử lại nhé');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Mở khoá';
  }
}
const fmtSize = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');

async function loadUploads() {
  try {
    const r = await fetch('api/uploads', { cache: 'no-store' });
    if (!r.ok) throw new Error();
    UPLOADS = await r.json();
    API_OK = true;
    const cfg = await fetch('api/config', { cache: 'no-store' }).then((x) => x.json()).catch(() => ({}));
    up.needPass = !!cfg.passwordRequired;
  } catch {
    API_OK = false;
  }
  // bản tĩnh (vd. Cloudflare Pages) không có server nhận ảnh → ẩn nút đăng ảnh
  document.documentElement.classList.toggle('no-upload', !API_OK);
  rebuild();
}

function openUpload() {
  if (!API_OK) { toast('Cần chạy server.py để đăng ảnh'); return; }
  if (lb.open || !upEl.hidden) return;
  const cur = view?.type === 'coll' ? view.c.slug : 'tong-hop';
  $('#upColl').innerHTML = COLLS.map((c) => `<option value="${c.slug}" ${c.slug === cur ? 'selected' : ''}>${esc(c.title)}</option>`).join('');
  $('#upCat').innerHTML = '<option value="">Không chọn</option>' +
    Object.keys(CATS).filter((k) => k !== 'moi').map((k) => `<option value="${k}">${CATS[k]}</option>`).join('');
  upEl.hidden = false;
  document.body.classList.add('lock');
  renderUpList();
  setLocked(up.needPass && !up.pass);
}

function closeUpload() {
  if (up.busy) { toast('Đang đăng ảnh, đợi chút nhé…'); return; }
  upEl.hidden = true;
  up.items.forEach((it) => URL.revokeObjectURL(it.url));
  up.items = [];
  if (!lb.open && $('#search').hidden) document.body.classList.remove('lock');
}

function addFiles(files) {
  let skipped = 0;
  [...files].forEach((f) => {
    if (!UP_TYPES.includes(f.type) || f.size > 60 * 1024 * 1024) { skipped++; return; }
    up.items.push({ key: Math.random().toString(36).slice(2), file: f, url: URL.createObjectURL(f), status: 'ready', progress: 0, msg: '' });
  });
  if (skipped) toast(`Bỏ qua ${skipped} file (chỉ nhận ảnh JPG, PNG, WEBP, GIF)`);
  renderUpList();
}

function stateIcon(it) {
  if (it.status === 'done') return ic('check');
  if (it.status === 'error') return ic('close');
  return '<i class="spin"></i>';
}

function renderUpList() {
  $('#upList').innerHTML = up.items.map((it) => `
    <div class="up-item ${it.status}" data-key="${it.key}">
      <img src="${it.url}" alt="">
      <div class="up-info">
        <div class="up-name">${esc(it.file.name)}</div>
        <div class="up-meta">${esc(it.msg || fmtSize(it.file.size))}</div>
        <div class="up-bar"><i style="width:${it.progress * 100}%"></i></div>
      </div>
      ${it.status === 'ready'
        ? `<button class="icon-btn up-x" data-remove="${it.key}" aria-label="Bỏ ảnh này">${ic('close')}</button>`
        : `<span class="up-state">${stateIcon(it)}</span>`}
    </div>`).join('');
  const ready = up.items.filter((i) => i.status === 'ready').length;
  const send = $('#upSend');
  send.disabled = up.busy || !ready;
  send.textContent = up.busy ? 'Đang đăng…' : ready ? `Đăng ${ready} ảnh` : 'Đăng ảnh';
  $('#upSummary').textContent = up.items.length
    ? `${up.items.length} ảnh · ${fmtSize(up.items.reduce((s, i) => s + i.file.size, 0))}`
    : 'Chưa chọn ảnh nào';
}

function updateItem(it) {
  const el = $(`.up-item[data-key="${it.key}"]`, upEl);
  if (!el) return;
  el.className = `up-item ${it.status}`;
  $('.up-bar i', el).style.width = `${it.progress * 100}%`;
  $('.up-meta', el).textContent = it.msg || fmtSize(it.file.size);
  el.lastElementChild.outerHTML = `<span class="up-state">${stateIcon(it)}</span>`;
}

// Thu nhỏ ảnh lớn còn tối đa 2000px trước khi gửi (nhanh hơn khi đi qua tunnel)
async function prepare(file) {
  const bmp = await createImageBitmap(file);
  const W = bmp.width, H = bmp.height;
  if (file.type === 'image/gif' || (Math.max(W, H) <= 2000 && file.size <= 2.5 * 1024 * 1024)) {
    bmp.close?.();
    return { blob: file, w: W, h: H, name: file.name };
  }
  const s = Math.min(1, 2000 / Math.max(W, H));
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * s);
  cv.height = Math.round(H * s);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close?.();
  const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.88));
  return { blob, w: cv.width, h: cv.height, name: file.name.replace(/\.[^.]+$/, '') + '.jpg' };
}

function sendFile(blob, params, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', `api/upload?${new URLSearchParams(params)}`);
    x.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
    if (up.pass) x.setRequestHeader('X-Upload-Password', up.pass);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    x.onload = () => {
      let body = {};
      try { body = JSON.parse(x.responseText); } catch { /* bỏ qua */ }
      if (x.status === 200) return resolve(body);
      const err = new Error(body.error || `Lỗi máy chủ (${x.status})`);
      err.status = x.status;
      reject(err);
    };
    x.onerror = () => reject(new Error('Mất kết nối, thử lại nhé'));
    x.send(blob);
  });
}

async function startUpload() {
  if (up.busy) return;
  const todo = up.items.filter((i) => i.status === 'ready');
  if (!todo.length) return;
  const coll = $('#upColl').value, cat = $('#upCat').value;
  up.busy = true;
  renderUpList();
  let ok = 0;
  let authErr = '';
  for (const it of todo) {
    it.status = 'uploading';
    it.msg = 'Đang xử lý ảnh…';
    updateItem(it);
    try {
      const prep = await prepare(it.file);
      if (prep.blob.size > UP_MAX) throw new Error('Ảnh quá lớn (tối đa 20MB)');
      const item = await sendFile(prep.blob, { collection: coll, cat, name: prep.name, w: prep.w, h: prep.h }, (p) => {
        it.progress = p;
        it.msg = `Đang tải lên… ${Math.round(p * 100)}%`;
        updateItem(it);
      });
      upTokens[item.id] = item.token;
      delete item.token;
      UPLOADS.unshift(item);
      it.status = 'done';
      it.progress = 1;
      it.msg = `Đã đăng · ${fmtSize(prep.blob.size)}`;
      ok++;
    } catch (e) {
      if (e.status === 401 || e.status === 429) {
        // mật khẩu sai/hết hạn: trả ảnh về hàng chờ, hỏi lại mật khẩu
        it.status = 'ready';
        it.progress = 0;
        it.msg = '';
        authErr = e.message;
        break;
      }
      it.status = 'error';
      it.msg = e.message || 'Có lỗi xảy ra';
    }
    updateItem(it);
  }
  store.set('pt-upload-tokens', upTokens);
  up.busy = false;
  renderUpList();
  if (authErr) {
    up.pass = '';
    session.set('pt-up-pass', '');
    setLocked(true, authErr);
  }
  if (!ok) return;

  rebuild();
  const c = COLLS.find((x) => x.slug === coll);
  toast(`Đã đăng ${ok} ảnh vào “${c.title}”`);
  await sleep(700);
  const failed = up.items.some((i) => i.status === 'error');
  if (failed) {
    up.items = up.items.filter((i) => { if (i.status === 'done') URL.revokeObjectURL(i.url); return i.status !== 'done'; });
    renderUpList();
  } else {
    closeUpload();
  }
  if (view?.type === 'coll' && view.c === c) {
    refreshView();
    smoothScrollTo($('#hero').offsetHeight, 900);
  } else {
    if (view?.type === 'home') refreshView();
    if (!failed) {
      await go(`#/c/${coll}`);
      await sleep(900);
      smoothScrollTo($('#hero').offsetHeight, 1100);
    }
  }
}

async function deleteUpload(p, tile) {
  if (!confirm('Xoá ảnh này khỏi thư viện?')) return;
  try {
    const r = await fetch(`api/uploads/${p.uid}`, { method: 'DELETE', headers: { 'X-Delete-Token': upTokens[p.uid] || '' } });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Không xoá được ảnh');
    delete upTokens[p.uid];
    store.set('pt-upload-tokens', upTokens);
    UPLOADS = UPLOADS.filter((u) => u.id !== p.uid);
    if (tile && !reduced) {
      await tile.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.85)' }], { duration: 380, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).finished;
    }
    rebuild();
    refreshView();
    toast('Đã xoá ảnh');
  } catch (e) {
    toast(e.message);
  }
}

function initUpload() {
  fillIcons(upEl);
  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
  $('#upInput').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
  $('#upSend').addEventListener('click', startUpload);
  $('#upLock').addEventListener('submit', unlock);
  $('#upList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    const it = up.items.find((i) => i.key === b.dataset.remove);
    URL.revokeObjectURL(it.url);
    up.items = up.items.filter((i) => i !== it);
    renderUpList();
  });
  upEl.addEventListener('click', (e) => { if (e.target.closest('[data-up-close]')) closeUpload(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-upload]')) openUpload(); });

  // kéo ảnh thả vào bất kỳ đâu trên trang → mở hộp đăng ảnh
  addEventListener('dragover', (e) => {
    if (!hasFiles(e) || !API_OK) return;
    e.preventDefault();
    if (upEl.hidden && !lb.open) openUpload();
  });
  addEventListener('drop', (e) => {
    if (!hasFiles(e) || !API_OK || e.target.closest?.('#drop')) return;
    e.preventDefault();
    if (!upEl.hidden) addFiles(e.dataTransfer.files);
  });
  // dán ảnh (Ctrl+V) khi hộp đang mở
  addEventListener('paste', (e) => {
    if (upEl.hidden) return;
    const files = [...(e.clipboardData?.files || [])];
    if (files.length) addFiles(files);
  });
}

/* =========================================================
   Khởi động
   ========================================================= */
history.scrollRestoration = 'manual';
fillIcons();
initLoader();
initCursor();
initLightbox();
initSearch();
initToTop();
initKeys();
initUpload();
addEventListener('popstate', () => route());
let rz;
addEventListener('resize', () => {
  cancelAnimationFrame(rz);
  rz = requestAnimationFrame(() => { layoutGrid(); sizeLbImg(); moveInk(); });
});
loadUploads().then(() => route());
