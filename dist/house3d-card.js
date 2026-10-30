/* House 3D card for Home Assistant: isometric house, scenes by time/season, lamp glow, weather. v1 */
const FR_W = 2400, FR_H = 1851;
const DEFAULT_BASE = '/local/house3d/';
const VER = '3';
const YARD = [[1500,245],[1780,65],[2378,432],[2378,552],[2066,740],[1992,704],[1770,586],[1645,505],[1645,410],[1560,350],[1500,322]];
const LAMPS = {
  torch: { entity: 'light.floor_lamp', name: 'Торшер', x: 1553, y: 560, dx: -10, dy: 62 },
  boho:  { entity: 'light.boho_lamp', name: 'Бохо', x: 1268, y: 740 },
  fire:  { entity: 'light.fireplace_lights', name: 'Гирлянда', x: 1470, y: 500, dx: -45, dy: 30 },
};
const PEOPLE = {"chair_a": {"x": 1077, "y": 511, "w": 129, "h": 120}, "chair_b": {"x": 1240, "y": 623, "w": 139, "h": 117}, "bed_both": {"x": 1655, "y": 996, "w": 222, "h": 152}, "bed_a": {"x": 1597, "y": 1005, "w": 221, "h": 122}, "bed_b": {"x": 1710, "y": 1045, "w": 193, "h": 130}};
const SEASONS = { winter: 'Зима', spring: 'Весна', summer: 'Лето', autumn: 'Осень' };
const TIMES = { dawn: 'Рассвет', day: 'День', sunset: 'Закат', night: 'Ночь' };
const WEATHERS = { sunny: 'Солнечно', cloudy: 'Облачно', rain: 'Дождь', wind: 'Ветер', snow: 'Снег' };
const MODES = [['light', 'Свет', 'mdi:lightbulb-on'], ['devices', 'Устройства', 'mdi:devices'], ['temp', 'Температура', 'mdi:thermometer']];

const CSS = `
:host { display:block; }
.outer { display:flex; justify-content:center; }
.outer { position:relative; width:100%; height:calc(100vh - 56px); height:calc(100dvh - 56px); min-height:320px; overflow:hidden; background:#1c2230; display:flex; align-items:center; justify-content:center; }
.wrap { position:relative; z-index:1; width:min(100%, calc((100vh - 56px) * ${FR_W} / ${FR_H})); aspect-ratio:${FR_W}/${FR_H}; overflow:hidden; user-select:none; -webkit-user-select:none; touch-action:none;
  background:transparent; container-type:inline-size; --z:1; }
.world { position:absolute; left:0; top:0; transform-origin:0 0; will-change:transform; }
@media (max-width:700px) { .wrap { width:100%; aspect-ratio:auto; height:100%; } }
.sky { position:absolute; inset:0; transition:background 2s; }
.scene { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; opacity:0; transition:opacity 1.2s ease; pointer-events:none; }
.scene.on { opacity:1; }
canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
canvas.glow { mix-blend-mode:screen; }
.tabs { position:absolute; top:2.2cqw; left:50%; transform:translateX(-50%); display:flex; gap:.6cqw; padding:.5cqw; border-radius:99px;
  background:rgba(20,24,34,.55); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.12); z-index:5; }
.tab { border:0; background:transparent; color:#cfd6e6; font:600 clamp(11px,1.9cqw,17px) system-ui,sans-serif; padding:.9cqw 2.2cqw; border-radius:99px; cursor:pointer; display:flex; align-items:center; gap:.7cqw; }
.tab.act { background:linear-gradient(135deg,#ffb454,#ff7a45); color:#241505; box-shadow:0 2px 14px rgba(255,150,70,.45); }
.tab ha-icon { --mdc-icon-size: clamp(14px,2.2cqw,20px); }
.hs { position:absolute; transform:translate(-50%,-50%); border:0; background:transparent; cursor:pointer; padding:0; z-index:4; display:none; }
.hs.vis { display:block; }
.hs .ring { width:calc(30px / var(--z)); height:calc(30px / var(--z)); border-radius:50%; border:calc(2px / var(--z)) solid rgba(255,255,255,.55); box-shadow:0 0 16px rgba(255,200,120,.5); animation:pulse 2.4s infinite; }
.hs.on .ring { border-color:rgba(255,200,110,.95); box-shadow:0 0 22px rgba(255,190,90,.9); }
@keyframes pulse { 0%,100%{transform:scale(.85);opacity:.7} 50%{transform:scale(1.05);opacity:1} }
.chip { position:absolute; left:50%; top:100%; transform:translate(calc(-50% + var(--dx,0) * var(--k,.4) * 1px), calc(var(--dy,0) * var(--k,.4) * 1px)); margin-top:calc(3px / var(--z)); white-space:nowrap; font:600 calc(12px / var(--z)) system-ui,sans-serif; color:#fff; background:rgba(20,24,34,.62); backdrop-filter:blur(6px); padding:calc(3px / var(--z)) calc(9px / var(--z)); border-radius:99px; border:1px solid rgba(255,255,255,.14); }
.chip i { display:inline-block; width:calc(8px / var(--z)); height:calc(8px / var(--z)); border-radius:50%; background:#6b7280; margin-right:calc(5px / var(--z)); vertical-align:middle; }
.hs.on .chip i { background:#ffc15a; box-shadow:0 0 8px #ffb347; }
.status { position:absolute; right:2cqw; top:2.2cqw; z-index:5; font:600 clamp(10px,1.6cqw,15px) system-ui,sans-serif; color:#e8edf8; background:rgba(20,24,34,.55); backdrop-filter:blur(10px); padding:.9cqw 1.6cqw; border-radius:99px; border:1px solid rgba(255,255,255,.12); }
.gear { position:absolute; right:2cqw; bottom:2cqw; z-index:6; width:4.4cqw; height:4.4cqw; min-width:30px; min-height:30px; border-radius:50%; border:1px solid rgba(255,255,255,.18); background:rgba(20,24,34,.55); color:#dfe6f5; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); }
.menu { position:absolute; right:2cqw; bottom:8cqw; z-index:6; background:rgba(18,22,32,.88); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.14); border-radius:14px; padding:1.2cqw 1.6cqw; color:#e8edf8; font:500 clamp(11px,1.6cqw,14px) system-ui,sans-serif; display:none; }
.menu.open { display:block; }
.menu label { display:flex; justify-content:space-between; align-items:center; gap:2cqw; margin:.7cqw 0; }
.menu select { background:#222a3b; color:#e8edf8; border:1px solid #3a4560; border-radius:8px; padding:.4cqw .8cqw; font:inherit; }

.stage { position:absolute; left:0; top:0; width:${FR_W}px; height:${FR_H}px; transform-origin:0 0; z-index:3; pointer-events:none; --s:.4; --m:1; --u:calc(1px * var(--m) / (var(--s) * var(--z))); }
.patch { position:absolute; opacity:0; transition:opacity .6s; }
.patch.on { opacity:1; }
.ppl { position:absolute; opacity:0; transition:opacity 1s; pointer-events:none; }
.ppl.on { opacity:1; }
.tv { position:absolute; left:0; top:0; width:960px; height:540px; transform-origin:0 0; opacity:0; transition:opacity .5s; overflow:hidden; }
.tv.on { opacity:1; }
.tv img { width:100%; height:100%; display:block; filter:saturate(1.05) contrast(1.05); }
.tv::after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 2px,transparent 2px 4px); mix-blend-mode:multiply; }
.vac { position:absolute; width:78px; height:46px; margin:-23px 0 0 -39px; transition:left .2s linear, top .2s linear; }
.vac .dock { position:absolute; left:2px; top:20px; width:74px; height:24px; border-radius:50%; background:rgba(10,12,18,.5); filter:blur(3px); }
.vac .body { position:absolute; left:6px; top:2px; width:66px; height:36px; border-radius:50%; background:radial-gradient(ellipse at 40% 30%,#6c7385,#2a2e3a 70%); box-shadow:0 5px 0 #14161d, 0 8px 10px rgba(0,0,0,.5); }
.vac .body::before { content:''; position:absolute; left:23px; top:8px; width:18px; height:14px; border-radius:50%; background:#191c25; box-shadow:inset 0 0 0 2px #444b5c; }
.vac .led { position:absolute; left:34px; top:11px; width:7px; height:7px; border-radius:50%; background:#5b6275; }
.vac.clean .led { background:#4dff9a; box-shadow:0 0 14px #4dff9a; animation:blink 1s infinite; }
.vac.err .led { background:#ff4d4d; box-shadow:0 0 14px #ff4d4d; }
@keyframes blink { 50% { opacity:.35 } }
.dev { position:absolute; transform:translate(-50%,-50%); pointer-events:auto; display:none; cursor:pointer; font:600 calc(15 * var(--u)) system-ui,sans-serif; color:#fff; white-space:nowrap; }
.dev.vis { display:block; }
.dev .pill { display:flex; align-items:center; gap:calc(8 * var(--u)); padding:calc(6 * var(--u)) calc(13 * var(--u)); border-radius:99px; background:rgba(20,24,34,.72); backdrop-filter:blur(8px); border:calc(1 * var(--u)) solid rgba(255,255,255,.16); box-shadow:0 calc(4 * var(--u)) calc(16 * var(--u)) rgba(0,0,0,.45); }
.dev .pill ha-icon { --mdc-icon-size: calc(20 * var(--u)); color:#cfd6e6; }
.dev.act .pill { border-color:rgba(255,190,100,.9); }
.dev.act .pill ha-icon { color:#ffc15a; }
.dev.warn .pill { border-color:#ff6b6b; } .dev.warn .pill ha-icon { color:#ff6b6b; }
.dev .sub { opacity:.75; font-weight:500; }
.dev .btn { margin-left:calc(4 * var(--u)); width:calc(30 * var(--u)); height:calc(30 * var(--u)); border-radius:50%; border:0; background:linear-gradient(135deg,#ffb454,#ff7a45); color:#241505; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; }
.dev .btn ha-icon { --mdc-icon-size: calc(18 * var(--u)); color:#241505; }
.modal { position:absolute; inset:0; z-index:20; display:none; align-items:center; justify-content:center; background:rgba(5,8,14,.6); backdrop-filter:blur(4px); }
.modal.open { display:flex; }
.dlg { background:#1b2130; border:1px solid rgba(255,255,255,.14); border-radius:18px; padding:2.4cqw 3cqw; color:#e8edf8; font:500 clamp(13px,1.9cqw,17px) system-ui,sans-serif; text-align:center; max-width:80%; }
.dlg h3 { margin:0 0 1cqw; font-size:clamp(16px,2.6cqw,24px); }
.dlg .row { display:flex; gap:1.4cqw; justify-content:center; margin-top:2cqw; }
.dlg button { border:0; border-radius:99px; padding:1cqw 3cqw; font:600 clamp(12px,1.8cqw,16px) system-ui,sans-serif; cursor:pointer; }
.dlg .ok { background:linear-gradient(135deg,#ffb454,#ff7a45); color:#241505; }
.dlg .no { background:#2b3348; color:#cfd6e6; }
.thm .pill { padding:calc(8 * var(--u)) calc(15 * var(--u)); }
.thm .big { font-size:calc(22 * var(--u)); font-weight:700; }
.thm.act .pill { border-color:#6ec6ff; } .thm.act .pill ha-icon { color:#6ec6ff; }
.thm.heat .pill { border-color:#ff9f5a; } .thm.heat .pill ha-icon { color:#ff9f5a; }
.thm .pulse { position:absolute; left:50%; top:50%; width:calc(60 * var(--u)); height:calc(60 * var(--u)); margin:calc(-30 * var(--u)) 0 0 calc(-30 * var(--u)); border-radius:50%; border:calc(2 * var(--u)) solid rgba(110,198,255,.7); animation:pulse 2s infinite; pointer-events:none; display:none; }
.thm.act .pulse { display:block; } .thm.heat .pulse { border-color:rgba(255,159,90,.8); }
@keyframes pulse { from { transform:scale(.6); opacity:1 } to { transform:scale(1.8); opacity:0 } }
.dlg.t { width:min(340px,86%); max-width:none; text-align:left; font:500 15px system-ui,sans-serif; padding:18px 20px; max-height:92%; overflow:auto; }
.dlg.t h3 { font-size:18px; margin:0 0 12px; text-align:center; }
.dlg.t .sp { display:flex; align-items:center; justify-content:center; gap:18px; margin:6px 0 2px; }
.dlg.t .sp b { font-size:44px; font-weight:700; min-width:90px; text-align:center; }
.dlg.t .sp button { width:46px; height:46px; padding:0; font-size:26px; background:#2b3348; color:#fff; border-radius:50%; }
.dlg.t .cur { text-align:center; opacity:.7; margin-bottom:12px; }
.dlg.t .lab { font-size:12px; opacity:.6; margin:12px 0 5px; text-transform:uppercase; letter-spacing:.06em; }
.dlg.t .seg { display:flex; gap:6px; } .dlg.t .seg button { flex:1; padding:9px 4px; font-size:13.5px; background:#2b3348; color:#cfd6e6; border-radius:12px; }
.dlg.t .seg button.on { background:linear-gradient(135deg,#ffb454,#ff7a45); color:#241505; }
.dlg.t .seg button.on.cool { background:linear-gradient(135deg,#7fd0ff,#4a8dff); } 
.dlg.t .sw { display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:10px 12px; background:#242b3d; border-radius:12px; }
.dlg.t .note { font-size:12px; opacity:.55; margin-top:6px; }
.dlg.t .row { margin-top:16px; gap:8px; } .dlg.t .row button { padding:10px 18px; font-size:14px; }
@container (max-width: 640px) {
  .tabs { top:8px; padding:3px; gap:2px; }
  .tab { font-size:12.5px; padding:7px 11px; gap:5px; }
  .tab ha-icon { --mdc-icon-size:16px; }
  .status { display:none; }
  .gear { right:10px; bottom:10px; width:36px; height:36px; }
  .menu { right:10px; bottom:54px; font-size:12.5px; padding:10px 12px; }
  .menu label { gap:12px; margin:8px 0; }
  .dlg:not(.t) { padding:18px 22px; font-size:15px; }
  .dlg h3 { font-size:18px; } .dlg button { padding:10px 22px; font-size:14px; }
  .stage { --m:.85; }
}
`;

class House3DCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._mode = 'light'; this._ov = this._loadOv(); this._lit = {}; this._t0 = performance.now(); this._cur = null; this._slot = 0; }
  setConfig(c) { this._config = c || {}; this._base = (c && c.base) || DEFAULT_BASE; this._build(); }
  getCardSize() { return 8; }
  set hass(h) { this._hass = h; if (this._built) this._update(); }
  _loadOv() { try { return JSON.parse(localStorage.getItem('house3d_ov') || '{}'); } catch (e) { return {}; } }
  _saveOv() { try { localStorage.setItem('house3d_ov', JSON.stringify(this._ov)); } catch (e) {} }

  _build() {
    if (this._built) return; this._built = true;
    const r = this.shadowRoot;
    r.innerHTML = `<style>${CSS}</style><div class="outer" id="outer"><div class="sky" id="sky"></div><div class="wrap" id="wrap">
      <div class="world" id="world">
      <img class="scene" id="s0"><img class="scene" id="s1">
      <canvas class="glow" id="glow" width="1200" height="926"></canvas>
      <canvas id="fx" width="1200" height="926"></canvas>
      <div class="stage" id="stage">
        <img class="patch" id="p_fridge"><img class="patch" id="p_freezer">
        <img class="ppl" id="pp_chair_a"><img class="ppl" id="pp_chair_b"><img class="ppl" id="pp_bed_both"><img class="ppl" id="pp_bed_a"><img class="ppl" id="pp_bed_b">
        <div class="tv" id="tv"><img id="tvimg"></div>
        <div class="vac" id="vac"><div class="dock"></div><div class="body"></div><div class="led"></div></div>
      </div>
      <div id="hs"></div>
      </div>
      <div class="tabs" id="tabs"></div>
      <div class="status" id="status"></div>
      <div class="menu" id="menu"></div>
      <div class="modal" id="modal"><div class="dlg" id="dlg"></div></div>
      <button class="gear" id="gear" title="Предпросмотр">⚙</button>
    </div></div>`;
    const tabs = r.getElementById('tabs');
    MODES.forEach(([k, label, icon]) => {
      const b = document.createElement('button'); b.className = 'tab' + (k === this._mode ? ' act' : ''); b.dataset.k = k;
      b.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span>${label}</span>`;
      b.onclick = () => { this._mode = k; tabs.querySelectorAll('.tab').forEach(x => x.classList.toggle('act', x.dataset.k === k)); this._applyMode(); };
      tabs.appendChild(b);
    });
    const hs = r.getElementById('hs');
    Object.entries(LAMPS).forEach(([k, L]) => {
      const b = document.createElement('button'); b.className = 'hs light'; b.dataset.k = k;
      b.style.left = (L.x / FR_W * 100) + '%'; b.style.top = (L.y / FR_H * 100) + '%';
      b.style.setProperty('--dx', L.dx || 0); b.style.setProperty('--dy', L.dy || 0); b.innerHTML = `<div class="ring"></div><div class="chip"><i></i>${L.name}</div>`;
      b.onclick = () => this._hass && this._hass.callService('light', 'toggle', { entity_id: L.entity });
      hs.appendChild(b);
    });
    const menu = r.getElementById('menu');
    const opt = (o, extra) => `<option value="">Авто</option>` + Object.entries(o).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    menu.innerHTML = `<b>Предпросмотр</b>
      <label>Время суток<select data-o="time">${opt(TIMES)}</select></label>
      <label>Сезон<select data-o="season">${opt(SEASONS)}</select></label>
      <label>Погода<select data-o="weather">${opt(WEATHERS)}</select></label>
      <label>Кто дома<select data-o="home">${opt({ both: "Оба", a: "Он", b: "Она", none: "Никого" })}</select></label>`;
    menu.querySelectorAll('select').forEach(s => { s.value = this._ov[s.dataset.o] || ''; s.onchange = () => { this._ov[s.dataset.o] = s.value; this._saveOv(); this._update(true); }; });
    r.getElementById('gear').onclick = () => menu.classList.toggle('open');
    this._buildDevices(); this._buildTemp();
    this._ro = new ResizeObserver(() => this._fit()); this._ro.observe(r.getElementById('wrap')); this._fit(); this._gestures();
    this._glow = r.getElementById('glow').getContext('2d'); this._fx = r.getElementById('fx').getContext('2d');
    this._parts = []; this._applyMode();
    this._timer = setInterval(() => this._frame(), 66);
  }
  disconnectedCallback() { clearInterval(this._timer); }
  connectedCallback() { if (this._built && !this._timer) this._timer = setInterval(() => this._frame(), 66); }

  _applyMode() {
    const r = this.shadowRoot;
    r.querySelectorAll('.hs.light').forEach(b => b.classList.toggle('vis', this._mode === 'light'));
    r.querySelectorAll('.dev[data-m]').forEach(b => b.classList.toggle('vis', b.dataset.m === this._mode));
  }
  _fit() {
    const r = this.shadowRoot, wr = r.getElementById('wrap'), rc = wr.getBoundingClientRect(); const w = rc.width, h = rc.height; if (!w) return;
    this._pad = w < 640 ? 0 : 64; this._vw = w; this._vh = h; this._bw = Math.min(w, (h - this._pad) * FR_W / FR_H); this._bh = this._bw * FR_H / FR_W;
    const world = r.getElementById('world'); world.style.setProperty('--k', this._bw / FR_W); world.style.width = this._bw + 'px'; world.style.height = this._bh + 'px';
    const k = this._bw / FR_W, st = r.getElementById('stage'); st.style.transform = `scale(${k})`; st.style.setProperty('--s', k);
    if (!this._view) {
      const narrow = w < 640; this._view = { z: narrow ? 1.9 : 1, tx: 0, ty: 0 };
      if (narrow) { this._view.tx = w / 2 - 1250 * k * 1.9; this._view.ty = h / 2 - 780 * k * 1.9; }
    }
    this._applyView();
  }
  _applyView() {
    const v = this._view, r = this.shadowRoot; if (!v || !this._bw) return;
    const sw = this._bw * v.z, sh = this._bh * v.z;
    v.tx = sw <= this._vw ? (this._vw - sw) / 2 : Math.min(0, Math.max(this._vw - sw, v.tx));
    const av = this._vh - this._pad; v.ty = sh <= av ? this._pad + (av - sh) / 2 : Math.min(0, Math.max(this._vh - sh, v.ty));
    r.getElementById('world').style.transform = `translate(${v.tx}px,${v.ty}px) scale(${v.z})`;
    r.getElementById('wrap').style.setProperty('--z', v.z);
  }
  _zoomAt(cx, cy, z) {
    const rc = this.shadowRoot.getElementById('wrap').getBoundingClientRect(), px = cx - rc.left, py = cy - rc.top, v = this._view;
    z = Math.max(1, Math.min(5, z)); const q = z / v.z; v.tx = px - (px - v.tx) * q; v.ty = py - (py - v.ty) * q; v.z = z; this._applyView();
  }
  _gestures() {
    const wr = this.shadowRoot.getElementById('wrap'), P = new Map(); let drag = false, pinch = null, lastTap = 0, lastPos = null;
    const skip = (e) => e.composedPath().some(n => n.classList && ['tabs', 'gear', 'menu', 'modal'].some(c => n.classList.contains(c)));
    wr.addEventListener('pointerdown', e => { if (skip(e)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }); if (P.size === 2) { const [a, b] = [...P.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = true; } });
    wr.addEventListener('pointermove', e => {
      const p = P.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (P.size === 1) { if (!drag && Math.hypot(p.x - p.sx, p.y - p.sy) > 8) { drag = true; try { wr.setPointerCapture(e.pointerId); } catch (x) {} } if (drag) { this._view.tx += dx; this._view.ty += dy; this._applyView(); } }
      else if (P.size === 2) { const [a, b] = [...P.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) this._zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, this._view.z * d / pinch); pinch = d; }
    });
    const up = e => {
      if (!P.delete(e.pointerId)) return; if (P.size < 2) pinch = null;
      if (!drag && P.size === 0 && e.type === 'pointerup') { const now = Date.now(); if (now - lastTap < 320 && lastPos && Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y) < 24) { this._zoomAt(e.clientX, e.clientY, this._view.z > 1.4 ? 1 : 2.6); lastTap = 0; } else { lastTap = now; lastPos = { x: e.clientX, y: e.clientY }; } }
      if (drag) this._dragUntil = Date.now() + 120; if (P.size === 0) drag = false;
    };
    wr.addEventListener('pointerup', up); wr.addEventListener('pointercancel', up);
    wr.addEventListener('click', e => { if (Date.now() < (this._dragUntil || 0)) { e.stopPropagation(); e.preventDefault(); } }, true);
    wr.addEventListener('wheel', e => { if (skip(e)) return; e.preventDefault(); this._zoomAt(e.clientX, e.clientY, this._view.z * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  }
  _more(id) { this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true })); }
  _buildDevices() {
    const st = this.shadowRoot.getElementById('stage');
    // TV quad (full-res coords): TL(1416,346) TR(1523,408) BL(1416,417)
    const tv = this.shadowRoot.getElementById('tv');
    tv.style.transform = `matrix(${(1523 - 1416) / 960},${(408 - 346) / 960},0,${(417 - 346) / 540},1416,346)`;
    this.shadowRoot.getElementById('tvimg').src = this._base + 'tv_cat.webp?v=' + VER;
    const defs = [
      ['tv', 1460, 545, () => this._more('media_player.living_room_tv')],
      ['fridge', 880, 192, () => this._more('sensor.kitchen_refrigerator_fridge_temperature')],
      ['washer', 1490, 1270, () => this._more('sensor.garage_washer_machine_state')],
      ['dryer', 1640, 1350, () => this._more('sensor.garage_dryer_machine_state')],
      ['vac', 715, 510, null],
      ['lock', 865, 975, () => this._lockTap()],
    ];
    defs.forEach(([k, x, y, fn]) => {
      const d = document.createElement('div'); d.className = 'dev'; d.dataset.k = k; d.dataset.m = 'devices'; d.style.left = x + 'px'; d.style.top = y + 'px';
      d.innerHTML = '<div class="pill"><ha-icon></ha-icon><span class="t"></span><span class="sub"></span></div>';
      if (fn) d.onclick = fn;
      st.appendChild(d);
    });
    const vb = document.createElement('button'); vb.className = 'btn'; vb.innerHTML = '<ha-icon></ha-icon>';
    vb.onclick = (e) => { e.stopPropagation(); this._vacToggle(); };
    this.shadowRoot.querySelector('.dev[data-k="vac"] .pill').appendChild(vb);
    this.shadowRoot.getElementById('modal').onclick = (e) => { if (e.target.id === 'modal') this._closeModal(); };
  }
  _buildTemp() {
    const st = this.shadowRoot.getElementById('stage');
    const mk = (k, x, y, fn, cls) => {
      const d = document.createElement('div'); d.className = 'dev ' + (cls || ''); d.dataset.k = k; d.dataset.m = 'temp'; d.style.left = x + 'px'; d.style.top = y + 'px';
      d.innerHTML = '<div class="pulse"></div><div class="pill"><ha-icon></ha-icon><span class="t"></span><span class="sub"></span></div>';
      if (fn) d.onclick = fn; st.appendChild(d); return d;
    };
    mk('thm', 1440, 800, () => this._thermoDlg(), 'thm');
    mk('out', 1930, 330, () => this._more('weather.forecast_home'));
  }
  _tempUpdate() {
    const c = this._st('climate.thermostat'); if (!c) return;
    const a = c.attributes || {}, act = a.hvac_action, mode = c.state;
    const cur = a.current_temperature ?? this._st('sensor.thermostat_indoor_temperature')?.state;
    const names = { cooling: 'охлаждение', heating: 'нагрев', idle: 'ожидание', off: 'выкл', fan: 'вентилятор' };
    const sp = mode === 'off' ? '' : ` → ${Math.round(a.temperature)}°`;
    const d = this._dev('thm');
    this._setDev('thm', 'mdi:thermostat', `${Math.round(cur)}°`, `${sp} · ${mode === 'off' ? 'выкл' : (names[act] || act || '')}`.replace(/^ · /, ''), act === 'cooling' || act === 'heating' ? 'act' : '');
    d.classList.toggle('heat', act === 'heating'); d.querySelector('.t').classList.add('big');
    const o = this._st('sensor.thermostat_outdoor_temperature')?.state, w = this._st('weather.forecast_home')?.state;
    const wi = { sunny: 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', partlycloudy: 'mdi:weather-partly-cloudy', rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', snowy: 'mdi:weather-snowy', windy: 'mdi:weather-windy', fog: 'mdi:weather-fog', lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy' };
    this._setDev('out', wi[w] || 'mdi:thermometer', 'Улица', o != null && !isNaN(o) ? `${Math.round(o)}°` : '—', '');
    if (this.shadowRoot.getElementById('modal').dataset.k === 'thermo' && this.shadowRoot.getElementById('modal').classList.contains('open')) this._thermoRender();
  }
  _thermoDlg() {
    const m = this.shadowRoot.getElementById('modal'); m.dataset.k = 'thermo'; this._thermoRender(); m.classList.add('open');
  }
  _thermoRender() {
    const r = this.shadowRoot, dlg = r.getElementById('dlg'), c = this._st('climate.thermostat'); if (!c) return;
    const a = c.attributes, sit = this._st('input_select.thermo_situation'), au = this._st('input_boolean.thermo_auto');
    const modes = { off: 'Выкл', heat: 'Тепло', cool: 'Холод' };
    const admin = this._hass?.user?.is_admin;
    dlg.className = 'dlg t';
    dlg.innerHTML = `<h3>Термостат · гостиная</h3>
      <div class="sp"><button id="dn">−</button><b>${c.state === 'off' ? '—' : Math.round(a.temperature) + '°'}</b><button id="up">+</button></div>
      <div class="cur">Сейчас в доме ${Math.round(a.current_temperature)}° · на улице ${Math.round(this._st('sensor.thermostat_outdoor_temperature')?.state)}°</div>
      <div class="lab">Режим</div><div class="seg">${(a.hvac_modes || []).map(k => `<button data-m="${k}" class="${k === c.state ? 'on ' + (k === 'cool' ? 'cool' : '') : ''}">${modes[k] || k}</button>`).join('')}</div>
      ${sit ? `<div class="lab">Режим дома</div><div class="seg">${sit.attributes.options.map(o => `<button data-s="${o}" class="${o === sit.state ? 'on' : ''}">${o}</button>`).join('')}</div>` : ''}
      ${au ? `<div class="sw"><span>Автопилот</span><button id="au" class="${au.state === 'on' ? 'ok' : 'no'}">${au.state === 'on' ? 'Вкл' : 'Выкл'}</button></div><div class="note">При включённом автопилоте автоматизации сами меняют уставку по режиму дома.</div>` : ''}
      <div class="row">${admin && this._config.auto_path ? '<button class="no" id="auto">Автоматизации</button>' : ''}<button class="ok" id="cl">Готово</button></div>`;
    const sp = (d) => { const v = Math.max(a.min_temp || 50, Math.min(a.max_temp || 90, Math.round(a.temperature) + d)); this._hass.callService('climate', 'set_temperature', { entity_id: 'climate.thermostat', temperature: v }); };
    dlg.querySelector('#dn').onclick = () => sp(-1); dlg.querySelector('#up').onclick = () => sp(1);
    dlg.querySelectorAll('[data-m]').forEach(b => b.onclick = () => this._hass.callService('climate', 'set_hvac_mode', { entity_id: 'climate.thermostat', hvac_mode: b.dataset.m }));
    dlg.querySelectorAll('[data-s]').forEach(b => b.onclick = () => this._hass.callService('input_select', 'select_option', { entity_id: 'input_select.thermo_situation', option: b.dataset.s }));
    const aub = dlg.querySelector('#au'); if (aub) aub.onclick = () => this._hass.callService('input_boolean', 'toggle', { entity_id: 'input_boolean.thermo_auto' });
    dlg.querySelector('#cl').onclick = () => this._closeModal();
    const ab = dlg.querySelector('#auto'); if (ab) ab.onclick = () => { this._closeModal(); history.pushState(null, '', this._config.auto_path || '/'); window.dispatchEvent(new CustomEvent('location-changed')); };
  }
  _peopleUpdate(t) {
    const r = this.shadowRoot;
    let a = this._st('person.resident_a')?.state === 'home', n = this._st('person.resident_b')?.state === 'home';
    const o = this._ov.home; if (o) { a = o === 'both' || o === 'a'; n = o === 'both' || o === 'b'; }
    const night = t === 'night', tt = ['dawn', 'day', 'sunset'].includes(t) ? t : 'day';
    const want = {};
    if (night) { want.bed_both = a && n; want.bed_a = a && !n; want.bed_b = n && !a; want.chair_a = false; want.chair_b = false; }
    else { want.chair_a = a; want.chair_b = n; want.bed_both = want.bed_a = want.bed_b = false; }
    Object.keys(PEOPLE).forEach(k => {
      const im = r.getElementById('pp_' + k), p = PEOPLE[k], src = `${this._base}${k}_${k.startsWith('bed') ? 'night' : tt}.webp?v=${VER}`;
      if (im.dataset.src !== src) { im.dataset.src = src; im.src = src; im.style.cssText = `left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px`; }
      im.classList.toggle('on', !!want[k]);
    });
  }
  _dev(k) { return this.shadowRoot.querySelector(`.dev[data-k="${k}"]`); }
  _setDev(k, icon, t, sub, cls) {
    const d = this._dev(k); if (!d) return; d.querySelector('ha-icon').setAttribute('icon', icon); d.querySelector('.t').textContent = t; d.querySelector('.sub').textContent = sub || '';
    d.classList.toggle('act', cls === 'act'); d.classList.toggle('warn', cls === 'warn');
  }
  _fmtMin(iso) { const ms = new Date(iso) - Date.now(); if (!(ms > 0)) return ''; const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m} мин`; }
  _vacToggle() {
    const v = this._st('vacuum.robot_vacuum'); if (!v) return;
    const busy = ['cleaning', 'returning'].includes(v.state);
    this._hass.callService('vacuum', busy ? 'return_to_base' : 'start', { entity_id: 'vacuum.robot_vacuum' });
  }
  _lockTap() {
    const l = this._st('lock.front_door_lock'); if (!l) return;
    if (l.state === 'unlocked') { this._hass.callService('lock', 'lock', { entity_id: l.entity_id }); return; }
    if (l.state === 'locked') {
      const dlg = this.shadowRoot.getElementById('dlg'); dlg.className = 'dlg'; this.shadowRoot.getElementById('modal').dataset.k = 'lock';
      dlg.innerHTML = '<h3>Открыть входную дверь?</h3><div>Замок сейчас закрыт.</div><div class="row"><button class="no" id="no">Отмена</button><button class="ok" id="ok">Открыть</button></div>';
      dlg.querySelector('#no').onclick = () => this._closeModal();
      dlg.querySelector('#ok').onclick = () => { this._hass.callService('lock', 'unlock', { entity_id: l.entity_id }); this._closeModal(); };
      this.shadowRoot.getElementById('modal').classList.add('open');
    }
  }
  _closeModal() { const m = this.shadowRoot.getElementById('modal'); m.classList.remove('open'); m.dataset.k = ''; }
  _devicesUpdate() {
    const r = this.shadowRoot, t = this._cond.t;
    // TV
    const tvOn = !['off', 'unavailable', 'unknown', undefined].includes(this._st('media_player.living_room_tv')?.state);
    this._tvOn = tvOn; r.getElementById('tv').classList.toggle('on', tvOn);
    this._setDev('tv', tvOn ? 'mdi:television-play' : 'mdi:television-off', 'ТВ', tvOn ? 'включён' : 'выключен', tvOn ? 'act' : '');
    // fridge
    const fd = this._st('binary_sensor.kitchen_refrigerator_fridge_door')?.state === 'on', zd = this._st('binary_sensor.kitchen_refrigerator_freezer_door')?.state === 'on';
    const ft = this._st('sensor.kitchen_refrigerator_fridge_temperature')?.state, zt = this._st('sensor.kitchen_refrigerator_freezer_temperature')?.state;
    const P = { p_fridge: [fd, 'fridge_open', 706, 195, 223, 180], p_freezer: [zd, 'freezer_open', 790, 291, 170, 155] };
    Object.entries(P).forEach(([id, [on, nm, x, y, w, h]]) => { const im = r.getElementById(id); const src = `${this._base}${nm}_${t}.webp?v=${VER}`; if (im.dataset.src !== src) { im.dataset.src = src; im.src = src; im.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`; } im.classList.toggle('on', on); });
    this._setDev('fridge', fd || zd ? 'mdi:fridge-alert' : 'mdi:fridge', `${ft ?? '—'}°`, `мороз. ${zt ?? '—'}°` + (fd ? ' · дверца!' : zd ? ' · ящик!' : ''), fd || zd ? 'warn' : '');
    // washer / dryer
    [['washer', 'mdi:washing-machine', 'Стиралка'], ['dryer', 'mdi:tumble-dryer', 'Сушилка']].forEach(([k, ic, nm]) => {
      const m = this._st(`sensor.garage_${k}_machine_state`)?.state, ct = this._st(`sensor.garage_${k}_completion_time`)?.state;
      const run = m === 'run'; const left = run ? this._fmtMin(ct) : '';
      this._setDev(k, ic, nm, run ? (left ? `ещё ${left}` : 'работает') : m === 'pause' ? 'пауза' : 'свободна', run ? 'act' : '');
    });
    // vacuum
    const v = this._st('vacuum.robot_vacuum')?.state; const names = { docked: 'на базе', cleaning: 'уборка', returning: 'едет на базу', paused: 'пауза', idle: 'ожидает', error: 'ошибка' };
    const busy = v === 'cleaning' || v === 'returning'; this._vac = v;
    this._setDev('vac', 'mdi:robot-vacuum', 'Пылесос', names[v] || v || '—', busy ? 'act' : v === 'error' ? 'warn' : '');
    this._dev('vac').querySelector('.btn ha-icon').setAttribute('icon', busy ? 'mdi:stop' : 'mdi:play');
    // lock
    const l = this._st('lock.front_door_lock')?.state;
    this._setDev('lock', l === 'locked' ? 'mdi:lock' : l === 'unlocked' ? 'mdi:lock-open-variant' : 'mdi:lock-alert', 'Входная дверь', l === 'locked' ? 'закрыта' : l === 'unlocked' ? 'ОТКРЫТА · нажми, чтобы закрыть' : (l || '—'), l === 'unlocked' || l === 'jammed' ? 'warn' : '');
  }
  _vacFrame(t) {
    const el = this.shadowRoot.getElementById('vac'); if (!el) return;
    const v = this._vac, cl = v === 'cleaning';
    let x = 735, y = 448;
    if (cl) { const a = t * .9; x = 735 + 24 * Math.cos(a) + 6 * Math.cos(a * 3); y = 444 + 11 * Math.sin(a) + 3 * Math.sin(a * 2); }
    else if (v === 'returning') { x = 735 + 20 * Math.abs(Math.sin(t)); y = 448 - 3 * Math.abs(Math.sin(t)); }
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.classList.toggle('clean', cl || v === 'returning'); el.classList.toggle('err', v === 'error');
  }

  // ---------- state helpers ----------
  _st(id) { return this._hass && this._hass.states[id]; }
  _time() {
    if (this._ov.time) return this._ov.time;
    const s = this._st('sun.sun'); if (!s) return 'day';
    const el = Number(s.attributes.elevation), rising = s.attributes.rising;
    if (el > 12) return 'day'; if (el <= -6) return 'night';
    return rising ? 'dawn' : 'sunset';
  }
  _season() {
    if (this._ov.season) return this._ov.season;
    const m = new Date().getMonth() + 1; return m <= 2 || m === 12 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
  }
  _weather() {
    if (this._ov.weather) return this._ov.weather;
    const w = this._st('weather.forecast_home'); if (!w) return 'sunny';
    const s = w.state, ws = Number(w.attributes.wind_speed || 0);
    if (/snow/.test(s)) return 'snow'; if (/rain|pour|lightning|hail/.test(s)) return 'rain';
    if (/windy/.test(s) || ws >= 18) return 'wind'; if (/cloud|fog/.test(s)) return 'cloudy'; return 'sunny';
  }
  _update(force) {
    const t = this._time(), s = this._season(), w = this._weather();
    this._cond = { t, s, w };
    const key = `${t}_${s}`;
    if (key !== this._cur) { this._swap(key); }
    const sky = { day: 'radial-gradient(circle at 50% 30%,#3a4f73,#1c2434)', dawn: 'radial-gradient(circle at 50% 30%,#5b4a6e,#241f33)', sunset: 'radial-gradient(circle at 50% 30%,#6a4a3c,#2a1d22)', night: 'radial-gradient(circle at 50% 30%,#141b2c,#080b13)' }[t];
    this.shadowRoot.getElementById('sky').style.background = sky;
    const temp = this._st('weather.forecast_home')?.attributes?.temperature;
    this.shadowRoot.getElementById('status').textContent = `${TIMES[t]} · ${SEASONS[s]} · ${WEATHERS[w]}` + (temp != null ? ` · ${Math.round(temp)}°` : '');
    this._devicesUpdate(); this._tempUpdate(); this._peopleUpdate(t);
    Object.entries(LAMPS).forEach(([k, L]) => {
      const on = this._st(L.entity)?.state === 'on'; this._lit[k] = on;
      const b = this.shadowRoot.querySelector(`.hs[data-k="${k}"]`); if (b) b.classList.toggle('on', on);
    });
  }
  _swap(key) {
    const r = this.shadowRoot, n = this._slot ^ 1, img = r.getElementById('s' + n), old = r.getElementById('s' + this._slot);
    const pre = new Image(); pre.onload = () => { img.src = pre.src; requestAnimationFrame(() => { img.classList.add('on'); if (this._cur) old.classList.remove('on'); }); this._slot = n; };
    pre.src = `${this._base}${key}.webp?v=${VER}`; this._cur = key;
  }

  // ---------- drawing ----------
  _blob(c, x, y, rx, ry, col, a) {
    if (a <= 0.003) return; const S = 0.5; c.save(); c.translate(x * S, y * S); c.scale(rx * S, ry * S);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.25, `rgba(${col},${a * .5})`); g.addColorStop(.55, `rgba(${col},${a * .16})`); g.addColorStop(.8, `rgba(${col},${a * .04})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 6.2832); c.fill(); c.restore();
  }
  _frame() {
    if (!this._cond) return;
    const t = (performance.now() - this._t0) / 1000, c = this._glow;
    c.clearRect(0, 0, 1200, 926);
    const k = { night: 1, dawn: .8, sunset: .55, day: .22 }[this._cond.t];
    const HOT = '255,214,150', WARM = '255,176,84';
    if (this._lit.torch) { this._blob(c, 1553, 540, 85, 85, HOT, .9 * k); this._blob(c, 1553, 600, 330, 250, WARM, .55 * k); this._blob(c, 1553, 700, 260, 130, WARM, .35 * k); }
    if (this._lit.boho) { this._blob(c, 1268, 725, 95, 90, HOT, .9 * k); this._blob(c, 1268, 790, 380, 280, WARM, .55 * k); this._blob(c, 1250, 880, 300, 140, WARM, .3 * k); }
    if (this._lit.fire) {
      for (let i = 0; i < 12; i++) {
        const u = (i + .5) / 12, fr = (u * 6) % 1, x = 1398 + 122 * u, y = 450 + 68 * u + 6 + 14 * Math.sin(Math.PI * fr);
        const tw = .78 + .22 * Math.sin(t * 2.3 + i * 1.7); this._blob(c, x, y, 11, 11, HOT, .95 * k * tw); this._blob(c, x, y + 4, 42, 34, WARM, .17 * k * tw);
      }
      for (let i = 0; i < 5; i++) { const tw = .78 + .22 * Math.sin(t * 2.1 + i * 2.3 + 9); const x = 1403 + 1.2 * i, y = 462 + 19 * i; this._blob(c, x, y, 11, 11, HOT, .95 * k * tw); this._blob(c, x, y + 4, 42, 34, WARM, .17 * k * tw); }
      this._blob(c, 1470, 545, 200, 130, WARM, .18 * k);
    }
    if (this._tvOn) this._blob(c, 1470, 480, 300, 190, '120,170,255', .26 * (k > .5 ? 1 : .6));
    this._vacFrame(t);
    this._weatherFx(t);
  }
  _weatherFx(t) {
    const c = this._fx, w = this._cond.w, S = .5; c.clearRect(0, 0, 1200, 926);
    c.save(); c.beginPath(); YARD.forEach(([x, y], i) => i ? c.lineTo(x * S, y * S) : c.moveTo(x * S, y * S)); c.closePath(); c.clip();
    const night = this._cond.t === 'night';
    if (w === 'cloudy' || w === 'rain' || w === 'snow') { c.fillStyle = `rgba(70,84,110,${w === 'cloudy' ? .22 : .3})`; c.fillRect(0, 0, 1200, 926);
      // drifting cloud shadows
      for (let i = 0; i < 3; i++) { const x = ((t * 14 + i * 420) % 1700) - 250; const g = c.createRadialGradient(x, 150 + i * 70, 10, x, 150 + i * 70, 180); g.addColorStop(0, 'rgba(20,28,44,.28)'); g.addColorStop(1, 'rgba(20,28,44,0)'); c.fillStyle = g; c.fillRect(x - 200, 0, 400, 500); } }
    if (w === 'sunny' && !night && this._cond.t === 'day') { const g = c.createLinearGradient(900, 40, 1200, 380); g.addColorStop(0, 'rgba(255,240,190,.16)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(700, 0, 500, 500); }
    const P = this._parts, want = w === 'rain' ? 140 : w === 'snow' ? 90 : w === 'wind' ? 26 : 0;
    while (P.length < want) P.push({ x: Math.random() * 1200, y: Math.random() * 600, v: .6 + Math.random(), p: Math.random() * 6 });
    while (P.length > want) P.pop();
    P.forEach(p => {
      if (w === 'rain') { p.y += 14 * p.v; p.x -= 3 * p.v; c.strokeStyle = 'rgba(190,210,255,.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 3, p.y - 12); c.stroke(); if (p.y > 640) { p.y = Math.random() * 100; p.x = Math.random() * 1250; } }
      else if (w === 'snow') { p.y += 1.3 * p.v; p.x += Math.sin(t + p.p) * .8; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(p.x, p.y, 1.6 + p.v, 0, 6.3); c.fill(); if (p.y > 640) { p.y = 0; p.x = Math.random() * 1250; } }
      else if (w === 'wind') { p.x += 9 * p.v; p.y += Math.sin(t * 3 + p.p) * 1.2 + .6; c.fillStyle = this._cond.s === 'autumn' ? 'rgba(210,110,40,.9)' : this._cond.s === 'winter' ? 'rgba(255,255,255,.8)' : 'rgba(120,170,70,.85)'; c.save(); c.translate(p.x, p.y); c.rotate(t * 3 + p.p); c.fillRect(-3, -1.5, 6, 3); c.restore(); if (p.x > 1250) { p.x = 700 + Math.random() * 100 - 100; p.y = 100 + Math.random() * 500; } }
    });
    if (w === 'wind') { c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const y = 140 + i * 80, x = ((t * 160 + i * 230) % 1500) - 150; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 40, y - 14, x + 80, y + 14, x + 140, y); c.stroke(); } }
    c.restore();
  }
}
customElements.define('house3d-card', House3DCard);
window.customCards = window.customCards || []; window.customCards.push({ type: 'house3d-card', name: 'House 3D', description: '3D дом' });
