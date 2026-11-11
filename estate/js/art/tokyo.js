(function (QT) {
  'use strict';
  var on = QT.Art.scope('tokyo');
  var W = QT.World, I = QT.Iso, A = I.A, B = I.B, T = W.TILE, L = QT.L;
  var WP = W.WORLD_PX_W;
  var SEA = -9;
  var RIVER_W = 7;
  var INK = '#2a2440';
  var FT = W.DIST.shibuya || W.DIST.futako, MN = W.DIST.minato, AR = W.DIST.ariake, IZ = W.DIST.inzai;
  var HG = W.DIST.hongo || { ix: 62, iy: 3, iw: 28, ih: 29 };
  var WT = W.WORLD_H;
  L.add({
    tokyo_bay: ['東京湾', 'TOKYO BAY'],
    tokyo_tama: ['多摩川', 'TAMA RIVER'],
    tokyo_haneda: ['羽田空港', 'HANEDA AIRPORT'],
    tokyo_fuji: ['富士山', 'MT. FUJI'],
    tokyo_tsukuba: ['筑波山', 'MT. TSUKUBA'],
    tokyo_ueno: ['上野の森', 'UENO PARK'],
    tokyo_skytree: ['東京スカイツリー', 'TOKYO SKYTREE'],
    tokyo_chiba: ['千葉', 'CHIBA']
  });
  if (!QT.Art.block) {
    QT.Art.blocks = QT.Art.blocks || {};
    QT.Art.blockVer = QT.Art.blockVer || 0;
    QT.Art.block = function (id, rects, tag) {
      var b = QT.Art.blocks[id] || (QT.Art.blocks[id] = {});
      b[tag || '_'] = (rects || []).map(function (q) { return { x: q.x, y: q.y, w: q.w, h: q.h, top: q.top }; });
      QT.Art.blockVer++;
    };
  }
  function X(x, y) { return (x - y) * A; }
  function Y(x, y, h) { return (x + y) * B - (h || 0); }
  function mv(c, x, y, h) { c.moveTo(X(x, y), Y(x, y, h)); }
  function ln(c, x, y, h) { c.lineTo(X(x, y), Y(x, y, h)); }
  function quad(c, x0, y0, x1, y1, h) { mv(c, x0, y0, h); ln(c, x1, y0, h); ln(c, x1, y1, h); ln(c, x0, y1, h); c.closePath(); }
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  var VW = { x0: 0, y0: 0, x1: 0, y1: 0 };
  function setView(H) {
    var hw = H.cssW / 2 / H.z, hh = H.cssH / 2 / H.z;
    VW.x0 = H.cam.x - hw; VW.x1 = H.cam.x + hw; VW.y0 = H.cam.y - hh; VW.y1 = H.cam.y + hh;
  }
  function vis(x0, y0, x1, y1) { return x1 >= VW.x0 && x0 <= VW.x1 && y1 >= VW.y0 && y0 <= VW.y1; }
  var SPR = {}, SPR_REGEN = 0, SPR_PX = 0, SPR_LIMIT = 1.6e6, SPR_FRAME = 0, SPR_ONE = 6e5;
  function sprite(c, key, bx, by, bw, bh, draw, ox, oy, cap) {
    var m = c.getTransform(), sc = Math.max(1, Math.min(cap || 3, Math.round(m.a * 2) / 2)), e = SPR[key];
    if (bw * bh * sc * sc > SPR_ONE) sc = Math.max(1, Math.floor(Math.sqrt(SPR_ONE / (bw * bh)) * 4) / 4);
    if (!e || e.sc !== sc) {
      SPR_REGEN++;
      if (e) SPR_PX -= e.px;
      var cv = (e && e.cv) || document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(bw * sc) + 2); cv.height = Math.max(1, Math.ceil(bh * sc) + 2);
      var g = cv.getContext('2d');
      g.setTransform(sc, 0, 0, sc, 1 - bx * sc, 1 - by * sc);
      g.lineJoin = 'round'; g.lineCap = 'round';
      draw(g);
      e = SPR[key] = { cv: cv, sc: sc, bx: bx, by: by, px: cv.width * cv.height, f: SPR_FRAME };
      SPR_PX += e.px;
      if (SPR_PX > SPR_LIMIT) sprEvict(key);
    }
    e.f = SPR_FRAME;
    c.drawImage(e.cv, e.bx + (ox || 0) - 1 / e.sc, e.by + (oy || 0) - 1 / e.sc, e.cv.width / e.sc, e.cv.height / e.sc);
  }
  function sprEvict(keep) {
    var keys = Object.keys(SPR).filter(function (k) { return k !== keep && SPR[k].f < SPR_FRAME - 1; });
    keys.sort(function (a, b) { return SPR[a].f - SPR[b].f; });
    for (var i = 0; i < keys.length && SPR_PX > SPR_LIMIT * 0.75; i++) { SPR_PX -= SPR[keys[i]].px; delete SPR[keys[i]]; }
  }
  var LBW = {};
  function label(c, key, x, y, size, col) {
    var s = L.t(key), k = 'lb:' + key + ':' + L.get(), w = LBW[k];
    if (w == null) { c.save(); c.font = '900 ' + size + 'px ' + FONT(); w = LBW[k] = c.measureText(s).width + 6; c.restore(); }
    sprite(c, k, -w / 2, -size, w, size * 2, function (g) {
      g.font = '900 ' + size + 'px ' + FONT(); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = size * 0.28; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.strokeText(s, 0, 0);
      g.fillStyle = col; g.fillText(s, 0, 0);
    }, x, y, 3);
  }
  function FONT() { return (QT.Render && QT.Render.H && QT.Render.H.FONT) || 'sans-serif'; }
  var KEEP = { key: '', foot: [], pts: [] };
  function keepData() {
    var G = QT.G, raw = G && G.PADS ? G.PADS() : [], n = raw.length;
    if (n && raw[n - 1].type === 'angel') n--;
    var key = n + '|' + W.PLOTS.length;
    if (KEEP.key === key) return KEEP;
    var pads = raw.filter(function (pd) { return pd.type !== 'angel'; });
    var foot = [], pts = [];
    function tile(x, y, tag, ref) {
      foot.push({ x: x * T, y: y * T, w: T, h: T, tag: tag });
      var cx = (x + 0.5) * T, cy = (y + 0.5) * T;
      pts.push({ x: X(cx, cy), y: Y(cx, cy, 0), tx: x + 0.5, ty: y + 0.5, tag: tag, ref: ref });
    }
    W.PLOTS.forEach(function (p) { foot.push({ x: p.x * T, y: p.y * T, w: p.w * T, h: p.h * T, tag: 'plot' }); });
    W.DISTRICTS.forEach(function (d) {
      if (d.center) tile(d.center.x, d.center.y, 'exit', { district: d.id });
      if (d.gatePad) tile(d.gatePad.x, d.gatePad.y, 'open', d);
    });
    pads.forEach(function (pd) { tile(pd.x, pd.y, 'pad', pd); });
    KEEP.key = key; KEEP.foot = foot; KEEP.pts = pts;
    return KEEP;
  }
  function hexOf(x, y, w, d, b, h) {
    return [X(x, y), Y(x, y, h), X(x + w, y), Y(x + w, y, h), X(x + w, y), Y(x + w, y, b),
            X(x + w, y + d), Y(x + w, y + d, b), X(x, y + d), Y(x, y + d, b), X(x, y + d), Y(x, y + d, h)];
  }
  function inHex(hx, px, py, m) {
    for (var i = 0; i < 12; i += 2) {
      var ax = hx[i], ay = hx[i + 1], bx = hx[(i + 2) % 12], by = hx[(i + 3) % 12], ex = bx - ax, ey = by - ay;
      var cr = (ex * (py - ay) - ey * (px - ax)) / (Math.sqrt(ex * ex + ey * ey) || 1);
      if (cr < -m) return false;
    }
    return true;
  }
  function keepCovers(sil, m) {
    var K = keepData(), out = [], hx = sil.map(function (q) { return hexOf(q[0], q[1], q[2], q[3], q[4], q[5]); });
    for (var i = 0; i < K.pts.length; i++) {
      var p = K.pts[i];
      for (var k = 0; k < hx.length; k++) if (inHex(hx[k], p.x, p.y, m == null ? 4 : m)) { out.push(p); break; }
    }
    return out;
  }
  function keepWhy(x, y, w, d, top, opt) {
    opt = opt || {};
    var K = keepData(), i;
    for (i = 0; i < K.foot.length; i++) {
      var f = K.foot[i];
      if (x < f.x + f.w && f.x < x + w && y < f.y + f.h && f.y < y + d) return 'on ' + f.tag;
    }
    if (opt.flat) return null;
    var cov = keepCovers(opt.sil || [[x, y, w, d, opt.base || 0, (opt.base || 0) + (top || 0)]], opt.m);
    return cov.length ? 'hides ' + cov[0].tag + ' ' + cov[0].tx + ',' + cov[0].ty : null;
  }
  var PLOT_COV = {}, PLOT_FADE = {};
  function plotCovers(p, top, sil) {
    var K = keepData(), key = top + '|' + (sil ? sil.length : 0) + '|' + K.key, e = PLOT_COV[p.id];
    if (!e || e.key !== key) {
      var cov = keepCovers(sil || [[p.x * T, p.y * T, p.w * T, p.h * T, 3, 3 + top]], 2).filter(function (q) { return q.tag === 'exit'; });
      e = PLOT_COV[p.id] = { key: key, cov: cov };
    }
    return e.cov;
  }
  function plotAlpha(p, S, top, sil) {
    var cov = plotCovers(p, top, sil), hit = false, R = QT.Render && QT.Render.H;
    if (cov.length && !(R && R.riding)) {
      var px = S.player.x / T, py = S.player.y / T;
      for (var i = 0; i < cov.length && !hit; i++) {
        var q = cov[i];
        if (Math.abs(q.tx - px) < 6 && Math.abs(q.ty - py) < 6 && keepLive(q)) hit = true;
      }
    }
    var k = PLOT_FADE[p.id] == null ? 1 : PLOT_FADE[p.id];
    k += ((hit ? 0.42 : 1) - k) * 0.2;
    if (Math.abs(k - 1) < 0.01) k = 1;
    PLOT_FADE[p.id] = k;
    return k;
  }
  function keepLive(p) {
    var G = QT.G;
    if (p.tag === 'pad' || p.tag === 'open') {
      if (p.tag === 'open') return !G.roomOpen(p.ref.id);
      return !!G.padActive(p.ref);
    }
    return !!G.roomOpen(p.ref.district);
  }
  var FAR = 120 * T;
  var LAND = -4;
  var XM = (MN ? MN.ix - 1.5 : 30.5) * T;
  var YC = (AR ? AR.iy - 1.5 : 62.5) * T;
  var XB = XM - 3 * T;
  var COL = {
    sea: '#5fb3dc', sea2: '#7cc6e6', river: '#6cbcdc', bank: '#bfd7a0', bankFar: '#cfe0b4', land: '#c9dfa9',
    quay: '#d9dde3', quayL: '#9aa3ae', quayR: '#b6bec8', promen: '#e8e3d6', grass: '#a9d58a', path: '#e9dfc3', dyke: '#8fbf6c'
  };
  function isWater(wx, wy, m) {
    if (wy > WP + m && !(wy > WP + RIVER_W * T - m && wx < XB + m)) return true;
    return wx > WP + m && wy > YC + m;
  }
  function drawWater(c) {
    c.fillStyle = COL.sea;
    c.beginPath();
    mv(c, -FAR, WP, SEA); ln(c, WP, WP, SEA); ln(c, WP, YC, SEA); ln(c, WP + FAR, YC, SEA);
    ln(c, WP + FAR, WP + FAR, SEA); ln(c, -FAR, WP + FAR, SEA); c.closePath();
    c.fill();
    var yb = WP + RIVER_W * T;
    c.fillStyle = COL.bankFar; c.beginPath(); quad(c, -FAR, yb, XB, WP + FAR, SEA + 1.5); c.fill();
    c.fillStyle = '#a9c58c'; c.beginPath(); mv(c, XB, yb, SEA + 1.5); ln(c, XB, WP + FAR, SEA + 1.5); ln(c, XB, WP + FAR, SEA); ln(c, XB, yb, SEA); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(70,110,60,0.35)'; c.lineWidth = 1.2;
    c.beginPath(); mv(c, -FAR, yb, SEA + 1.5); ln(c, XB, yb, SEA + 1.5); ln(c, XB, WP + FAR, SEA + 1.5); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); quad(c, XB - 3 * T, WP, XM + 2 * T, yb, SEA + 0.1); c.fill();
  }
  function drawLand(c) {
    var y0 = -6 * T;
    c.fillStyle = COL.land; c.beginPath(); quad(c, WP, y0, WP + FAR, YC, LAND); c.fill();
    for (var k = 0; k < 4; k++) {
      c.globalAlpha = 0.8 - k * 0.2;
      c.beginPath(); quad(c, WP, y0 - (k + 1) * 2 * T, WP + FAR, y0 - k * 2 * T, LAND); c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = COL.quayL; c.beginPath();
    mv(c, WP, YC, LAND); ln(c, WP + FAR, YC, LAND); ln(c, WP + FAR, YC, SEA); ln(c, WP, YC, SEA); c.closePath(); c.fill();
    c.fillStyle = COL.promen; c.beginPath(); quad(c, WP, YC - 0.8 * T, WP + FAR, YC, LAND + 0.05); c.fill();
  }
  function drawWaves(c, S) {
    var t = S.t, n = 0;
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1;
    c.beginPath();
    var gx0 = Math.floor((VW.x0) / 40) - 1, gx1 = Math.ceil(VW.x1 / 40) + 1;
    var gy0 = Math.floor(VW.y0 / 22) - 1, gy1 = Math.ceil(VW.y1 / 22) + 1;
    for (var gy = gy0; gy <= gy1 && n < 160; gy++) {
      for (var gx = gx0; gx <= gx1 && n < 160; gx++) {
        var k = rnd(gx * 31 + gy * 57);
        if (k > 0.45) continue;
        var sx = gx * 40 + k * 30, sy = gy * 22 + rnd(gx * 7 + gy) * 14;
        var wy = ((sy + SEA) / B - sx / A) / 2, wx = ((sy + SEA) / B + sx / A) / 2;
        if (!isWater(wx, wy, 6)) continue;
        var ph = Math.sin(t * 1.6 + k * 20), dx = 3 + ph * 1.5;
        c.moveTo(sx - dx, sy + ph * 0.6); c.quadraticCurveTo(sx, sy - 1.6 + ph * 0.6, sx + dx, sy + ph * 0.6);
        n++;
      }
    }
    c.stroke();
  }
  function drawShores(c) {
    var k;
    c.fillStyle = COL.dyke; c.beginPath();
    mv(c, WP, 0, 0); ln(c, WP, YC, 0); ln(c, WP, YC, LAND); ln(c, WP, 0, LAND); c.closePath(); c.fill();
    c.fillStyle = COL.quayR; c.beginPath();
    mv(c, WP, YC, 0); ln(c, WP, WP, 0); ln(c, WP, WP, SEA); ln(c, WP, YC, SEA); c.closePath(); c.fill();
    c.fillStyle = COL.dyke; c.beginPath();
    mv(c, 0, WP, 0); ln(c, XM, WP, 0); ln(c, XM, WP, SEA); ln(c, 0, WP, SEA); c.closePath(); c.fill();
    c.fillStyle = COL.quayL; c.beginPath();
    mv(c, XM, WP, 0); ln(c, WP, WP, 0); ln(c, WP, WP, SEA); ln(c, XM, WP, SEA); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,70,90,0.25)'; c.lineWidth = 0.8; c.beginPath();
    for (k = YC + 2 * T; k < WP; k += 3.4 * T) { mv(c, WP, k, 0); ln(c, WP, k, SEA); }
    for (k = XM + 2 * T; k < WP; k += 3.4 * T) { mv(c, k, WP, 0); ln(c, k, WP, SEA); }
    c.stroke();
    var r0 = (W.WORLD_W - W.RIM) * T;
    c.fillStyle = COL.promen; c.beginPath(); quad(c, r0, YC, WP, WP, 0.05); quad(c, XM, r0, WP, WP, 0.05); c.fill();
    c.fillStyle = COL.grass; c.beginPath(); quad(c, 0, r0, XM, WP, 0.05); quad(c, r0, 0, WP, YC, 0.05); c.fill();
    c.fillStyle = COL.path; c.beginPath();
    quad(c, 2 * T, r0 + 1.1 * T, XM - 2, r0 + 1.9 * T, 0.1); quad(c, r0 + 1.1 * T, 2 * T, r0 + 1.9 * T, YC - 2, 0.1); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.1; c.beginPath();
    mv(c, WP - 1, YC, 3); ln(c, WP - 1, WP - 1, 3); ln(c, XM, WP - 1, 3); c.stroke();
    c.strokeStyle = 'rgba(80,90,110,0.5)'; c.lineWidth = 0.6; c.beginPath();
    for (k = YC + T / 2; k < WP; k += T * 1.8) { mv(c, WP - 1, k, 0); ln(c, WP - 1, k, 3); }
    for (k = XM + T / 2; k < WP; k += T * 1.8) { mv(c, k, WP - 1, 0); ln(c, k, WP - 1, 3); }
    c.stroke();
  }
  function drawRoadEnds(c) {
    var lo = W.RIM * T, hi = (W.WORLD_W - W.RIM) * T;
    c.fillStyle = '#9aa0a8'; c.beginPath();
    W.ROADS.forEach(function (r) {
      if (r.dir === 'v') { quad(c, r.x * T, 0, (r.x + r.w) * T, lo, 0.05); quad(c, r.x * T, hi, (r.x + r.w) * T, WP, 0.05); }
      else { quad(c, 0, r.y * T, lo, (r.y + r.h) * T, 0.05); quad(c, hi, r.y * T, WP, (r.y + r.h) * T, 0.05); }
    });
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2; c.setLineDash([9, 8]); c.beginPath();
    W.ROADS.forEach(function (r) {
      var m = (r.dir === 'v' ? r.x + r.w / 2 : r.y + r.h / 2) * T;
      if (r.dir === 'v') { mv(c, m, 0, 0.2); ln(c, m, lo, 0.2); mv(c, m, hi, 0.2); ln(c, m, WP, 0.2); }
      else { mv(c, 0, m, 0.2); ln(c, lo, m, 0.2); mv(c, hi, m, 0.2); ln(c, WP, m, 0.2); }
    });
    c.stroke(); c.setLineDash([]);
  }
  var FUJI = { x: -20 * T, y: WP - 10 * T, w: 150, h: 118 };
  function fujiDraw(g) {
    var w = FUJI.w, h = FUJI.h;
    var gr = g.createLinearGradient(0, -h, 0, 0);
    gr.addColorStop(0, '#6f83b8'); gr.addColorStop(0.6, 'rgba(130,150,200,0.75)'); gr.addColorStop(1, 'rgba(170,190,230,0)');
    g.fillStyle = gr; g.beginPath();
    g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.45, -h * 0.35, -w * 0.16, -h * 0.94);
    g.lineTo(-w * 0.07, -h); g.lineTo(w * 0.07, -h); g.lineTo(w * 0.16, -h * 0.94);
    g.quadraticCurveTo(w * 0.45, -h * 0.35, w, 0); g.closePath(); g.fill();
    g.fillStyle = '#f4f7ff'; g.beginPath();
    g.moveTo(-w * 0.16, -h * 0.94); g.lineTo(-w * 0.07, -h); g.lineTo(w * 0.07, -h); g.lineTo(w * 0.16, -h * 0.94);
    g.lineTo(w * 0.27, -h * 0.7); g.lineTo(w * 0.19, -h * 0.74); g.lineTo(w * 0.13, -h * 0.66); g.lineTo(w * 0.05, -h * 0.75);
    g.lineTo(-w * 0.03, -h * 0.64); g.lineTo(-w * 0.11, -h * 0.74); g.lineTo(-w * 0.18, -h * 0.68); g.lineTo(-w * 0.27, -h * 0.7);
    g.closePath(); g.fill();
  }
  var TSUKUBA = { x: -20 * T, y: -20 * T, w: 92, h: 46 };
  function tsukubaDraw(g) {
    var w = TSUKUBA.w, h = TSUKUBA.h;
    var gr = g.createLinearGradient(0, -h, 0, 0);
    gr.addColorStop(0, '#7f8fc0'); gr.addColorStop(0.6, 'rgba(150,165,210,0.7)'); gr.addColorStop(1, 'rgba(170,185,225,0)');
    g.fillStyle = gr; g.beginPath();
    g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.5, -h * 0.35, -w * 0.18, -h * 0.92); g.lineTo(-w * 0.1, -h);
    g.quadraticCurveTo(-w * 0.02, -h * 0.72, w * 0.08, -h * 0.82); g.lineTo(w * 0.16, -h * 0.9);
    g.quadraticCurveTo(w * 0.5, -h * 0.3, w, 0); g.closePath(); g.fill();
  }
  var SKY = [];
  (function () {
    var SJ = W.DIST.shinjuku, OT = W.DIST.otemachi, i, d;
    for (i = 0; SJ && i < 9; i++) {
      d = SJ.iy + 1 + i * (SJ.ih - 2) / 8 + rnd(i + 40) * 1.5;
      SKY.push({ x: -1.2 * T, y: d * T, w: Math.round(10 + rnd(i + 3) * 9), h: Math.round(38 + rnd(i + 9) * 46), v: i % 3 });
    }
    for (i = 0; OT && i < 9; i++) {
      d = OT.ix + 1 + i * (OT.iw - 2) / 8 + rnd(i + 70) * 1.5;
      SKY.push({ x: d * T, y: -1.2 * T, w: Math.round(9 + rnd(i + 13) * 9), h: Math.round(28 + rnd(i + 19) * 40), v: (i + 1) % 3 });
    }
    SKY.forEach(function (b) {
      b.key = 'sky' + b.w + 'x' + b.h + b.v;
      b.fn = function (g) { skyDraw(g, b.w, b.h, b.v); };
    });
  })();
  function skyDraw(g, w, h, v) {
    var gr = g.createLinearGradient(0, -h, 0, 0);
    var top = ['rgba(150,165,205,0.9)', 'rgba(165,178,215,0.9)', 'rgba(140,156,198,0.9)'][v];
    gr.addColorStop(0, top); gr.addColorStop(0.75, 'rgba(165,180,220,0.65)'); gr.addColorStop(1, 'rgba(185,200,235,0)');
    g.fillStyle = gr; g.fillRect(-w / 2, -h, w, h);
    if (v === 1) { g.fillRect(-1, -h - 8, 2, 8); }
    g.fillStyle = 'rgba(255,255,255,0.25)';
    for (var yy = -h + 4; yy < -h * 0.45; yy += 4) g.fillRect(-w / 2 + 2, yy, w - 4, 1);
  }
  function drawFar(c, S) {
    var fx = X(FUJI.x, FUJI.y), fy = Y(FUJI.x, FUJI.y, 0);
    if (vis(fx - FUJI.w, fy - FUJI.h - 20, fx + FUJI.w, fy)) {
      sprite(c, 'fuji', -FUJI.w - 2, -FUJI.h - 22, FUJI.w * 2 + 4, FUJI.h + 24, fujiDraw, fx, fy, 2);
      label(c, 'tokyo_fuji', fx, fy - FUJI.h - 10, 7, 'rgba(70,80,120,0.75)');
    }
    var tx = X(TSUKUBA.x, TSUKUBA.y), ty = Y(TSUKUBA.x, TSUKUBA.y, 0);
    if (vis(tx - TSUKUBA.w, ty - TSUKUBA.h - 20, tx + TSUKUBA.w, ty)) {
      sprite(c, 'tsukuba', -TSUKUBA.w - 2, -TSUKUBA.h - 22, TSUKUBA.w * 2 + 4, TSUKUBA.h + 24, tsukubaDraw, tx, ty, 2);
      label(c, 'tokyo_tsukuba', tx, ty - TSUKUBA.h - 8, 6.5, 'rgba(70,80,120,0.7)');
    }
    for (var i = 0; i < SKY.length; i++) {
      var b = SKY[i], bx = X(b.x, b.y), by = Y(b.x, b.y, 0);
      if (!vis(bx - b.w, by - b.h - 10, bx + b.w, by)) continue;
      sprite(c, b.key, -b.w / 2 - 1, -b.h - 10, b.w + 2, b.h + 11, b.fn, bx, by, 2);
    }
  }
  var UENO = { x0: HG.ix + HG.iw - 12, x1: HG.ix + HG.iw - 6.5, f0: HG.ix + 15, f1: HG.ix + HG.iw - 0.5, y0: 0.4, y1: 2.6 };
  var STREE = { x: WP + 7 * T, y: -3 * T, h: 168 };
  function museumDraw(g) {
    var x = UENO.x0 * T, y = UENO.y0 * T, w = (UENO.x1 - UENO.x0) * T, d = (UENO.y1 - UENO.y0) * T;
    g.translate(-X(x + w, y + d), -Y(x + w, y + d, 0));
    g.fillStyle = 'rgba(40,40,70,0.16)'; I.facePath(g, x + 2, y + 2, w, d, 0); g.fill();
    I.box(g, x, y, w, d, 0, 2, '#d9d3c6', { left: '#a8a194', right: '#c0b9ab' });
    I.box(g, x + 2, y + 2, w - 4, d - 4, 2, 11, '#e9e2d2', { left: '#b9b09c', right: '#d2c9b6' });
    g.fillStyle = '#5d6676';
    for (var u = 5; u < w - 6; u += 6) {
      g.beginPath(); g.moveTo(X(x + 2 + u, y + d - 2), Y(x + 2 + u, y + d - 2, 4)); g.lineTo(X(x + 5 + u, y + d - 2), Y(x + 5 + u, y + d - 2, 4));
      g.lineTo(X(x + 5 + u, y + d - 2), Y(x + 5 + u, y + d - 2, 10)); g.lineTo(X(x + 2 + u, y + d - 2), Y(x + 2 + u, y + d - 2, 10)); g.closePath(); g.fill();
    }
    var b = 13, H = 21, xm0 = x + 8, xm1 = x + w - 8, ym = y + d / 2;
    function tri(pts, col) { g.fillStyle = col; g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(X(q[0], q[1]), Y(q[0], q[1], q[2])); else g.moveTo(X(q[0], q[1]), Y(q[0], q[1], q[2])); }); g.closePath(); g.fill(); }
    tri([[x, y, b], [x + w, y, b], [xm1, ym, H], [xm0, ym, H]], '#4f5f5c');
    tri([[x + w, y, b], [x + w, y + d, b], [xm1, ym, H]], '#3c4a48');
    tri([[x, y + d, b], [x + w, y + d, b], [xm1, ym, H], [xm0, ym, H]], '#5d6f6b');
    I.box(g, x + w / 2 - 6, y + d - 3, 12, 4, 2, 9, '#f2ece0', { left: '#c4bba8', right: '#d9d0bd' });
  }
  function skytreeDraw(g) {
    var h = STREE.h, gr = g.createLinearGradient(0, -h, 0, 0);
    gr.addColorStop(0, '#eef4ff'); gr.addColorStop(0.75, 'rgba(225,235,250,0.95)'); gr.addColorStop(1, 'rgba(200,215,240,0.6)');
    g.fillStyle = gr; g.beginPath();
    g.moveTo(-9, 0); g.lineTo(-3.2, -h * 0.55); g.lineTo(-2.2, -h * 0.86); g.lineTo(-1, -h * 0.97); g.lineTo(1, -h * 0.97);
    g.lineTo(2.2, -h * 0.86); g.lineTo(3.2, -h * 0.55); g.lineTo(9, 0); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,140,180,0.45)'; g.lineWidth = 0.5; g.beginPath();
    for (var k = 0.05; k < 0.8; k += 0.06) {
      var a = -h * k, b = -h * (k + 0.06), wa = 9 - 6 * (k / 0.6), wb = 9 - 6 * ((k + 0.06) / 0.6);
      wa = Math.max(2.4, wa); wb = Math.max(2.4, wb);
      g.moveTo(-wa, a); g.lineTo(wb, b); g.moveTo(wa, a); g.lineTo(-wb, b);
    }
    g.stroke();
    g.fillStyle = '#c9d6ec'; g.fillRect(-5.2, -h * 0.58, 10.4, 4.2); g.fillStyle = '#7fa6d8'; g.fillRect(-5.2, -h * 0.58 + 1, 10.4, 1.6);
    g.fillStyle = '#c9d6ec'; g.fillRect(-3.6, -h * 0.8, 7.2, 3); g.fillStyle = '#7fa6d8'; g.fillRect(-3.6, -h * 0.8 + 0.8, 7.2, 1.2);
    g.fillStyle = '#e8eef8'; g.fillRect(-0.6, -h * 1.02, 1.2, h * 0.08);
    g.fillStyle = 'rgba(200,210,226,0.9)'; g.fillRect(-16, -7, 32, 7);
    g.fillStyle = 'rgba(130,160,200,0.6)'; g.fillRect(-15, -5, 30, 1.4);
  }
  function drawUeno(c, S) {
    var x = UENO.x0 * T, y = UENO.y0 * T, w = (UENO.x1 - UENO.x0) * T, d = (UENO.y1 - UENO.y0) * T;
    var fx = X(x + w, y + d), fy = Y(x + w, y + d, 0);
    if (vis(fx - w * A - 6, fy - (w + d) * B - 28, fx + d * A + 6, fy + 6)) {
      sprite(c, 'ueno_museum', -w * A - 4, -(w + d) * B - 26, (w + d) * A + 8, (w + d) * B + 30, museumDraw, fx, fy, 2);
      label(c, 'tokyo_ueno', X(x + w / 2, y + d / 2), Y(x + w / 2, y + d / 2, 30), 6.5, 'rgba(60,80,70,0.8)');
    }
  }
  function drawSkytree(c, S) {
    var sx = X(STREE.x, STREE.y), sy = Y(STREE.x, STREE.y, LAND);
    if (vis(sx - 18, sy - STREE.h - 20, sx + 18, sy)) {
      sprite(c, 'skytree_far', -17, -STREE.h * 1.04 - 2, 34, STREE.h * 1.04 + 3, skytreeDraw, sx, sy, 2);
      var sn = QT.Sim && QT.Sim.sns, lk = sn && sn.lit ? sn.lit() : 0;
      if (lk > 0) {
        var hh = STREE.h, pul = 0.75 + 0.25 * Math.sin(S.t * 3);
        c.save();
        c.globalAlpha = 0.28 * lk * pul; c.fillStyle = '#b9a8ff';
        c.beginPath(); c.ellipse(sx, sy - hh * 0.55, 16, hh * 0.6, 0, 0, 7); c.fill();
        c.globalAlpha = 0.85 * lk; c.fillStyle = '#6f57e0';
        c.beginPath(); c.moveTo(sx - 7, sy); c.lineTo(sx - 2.2, sy - hh * 0.86); c.lineTo(sx + 2.2, sy - hh * 0.86); c.lineTo(sx + 7, sy); c.closePath(); c.fill();
        c.globalAlpha = lk * pul; c.fillStyle = '#e4dcff';
        c.fillRect(sx - 5.2, sy - hh * 0.58, 10.4, 2.4); c.fillRect(sx - 3.6, sy - hh * 0.8, 7.2, 2);
        c.restore();
      }
      if (Math.sin(S.t * 2) > 0) { c.fillStyle = '#ff3b4f'; c.fillRect(sx - 1, sy - STREE.h * 1.02 - 1, 2, 2); }
      if (LIT.k > 0) {
        var col = lk > 0 ? '#b9a8ff' : '#8fe0ff', hh2 = STREE.h;
        litGlow('pool', sx, sy - hh2 * 0.5, 13, hh2 * 0.55, col, 0.32);
        var rr = litRec('img', 1);
        if (rr) rr.fn = function (g) {
          g.strokeStyle = col; g.lineWidth = 1.1; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(sx - 8, sy); g.lineTo(sx - 3.2, sy - hh2 * 0.55); g.lineTo(sx - 1, sy - hh2 * 0.97);
          g.moveTo(sx + 8, sy); g.lineTo(sx + 3.2, sy - hh2 * 0.55); g.lineTo(sx + 1, sy - hh2 * 0.97); g.stroke();
          g.fillStyle = '#e8f8ff'; g.fillRect(sx - 5.2, sy - hh2 * 0.58 + 0.6, 10.4, 2); g.fillRect(sx - 3.6, sy - hh2 * 0.8 + 0.4, 7.2, 1.6);
          g.fillStyle = col; g.fillRect(sx - 0.6, sy - hh2 * 1.02, 1.2, hh2 * 0.08);
        };
      }
      label(c, 'tokyo_skytree', sx, sy - STREE.h * 1.04 - 8, 6.5, 'rgba(70,80,120,0.75)');
    }
  }
  var RIM_TREES = [];
  (function () {
    var ave = W.ROADS.map(function (r) { return r.dir === 'v' ? [r.x, r.x + r.w] : [r.y, r.y + r.h]; });
    function onAve(t) { for (var i = 0; i < ave.length; i++) if (t > ave[i][0] - 1 && t < ave[i][1] + 1) return true; return false; }
    for (var k = 2; k < W.WORLD_W - 1; k += 2.6) {
      if (onAve(k)) continue;
      var j = rnd(k * 3.3);
      RIM_TREES.push({ x: (1 + j * 1.2) * T, y: k * T, v: Math.floor(rnd(k) * 3) });
      if (k > UENO.x0 - 1 && k < UENO.x1 + 1) continue;
      RIM_TREES.push({ x: k * T, y: (1 + rnd(k * 5.1) * 1.2) * T, v: Math.floor(rnd(k + 7) * 3) });
    }
    for (var u = UENO.f0; u < UENO.f1; u += 1.7) {
      if (u > UENO.x0 - 1 && u < UENO.x1 + 1) continue;
      RIM_TREES.push({ x: u * T, y: (0.7 + rnd(u * 2.7) * 1.8) * T, v: rnd(u * 1.3) < 0.55 ? 3 : Math.floor(rnd(u) * 3) });
    }
    RIM_TREES.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); });
  })();
  var TREE_COL = [['#4fae5c', '#7fd07a'], ['#3f9a55', '#6cc46a'], ['#5bb86a', '#9adf88'], ['#f2a7c3', '#ffd3e2']];
  function treeDraw(g, v) {
    var col = TREE_COL[v];
    g.fillStyle = 'rgba(40,60,40,0.18)'; g.beginPath(); g.ellipse(1, 0.5, 6, 2.6, 0, 0, 7); g.fill();
    g.fillStyle = '#8a6448'; g.fillRect(-0.9, -11, 1.8, 11);
    g.fillStyle = col[0]; g.beginPath(); g.arc(0, -15, 6.4, 0, 7); g.arc(-3.6, -12, 4.4, 0, 7); g.arc(3.8, -12.4, 4.6, 0, 7); g.fill();
    g.fillStyle = col[1]; g.beginPath(); g.arc(-1.8, -17.4, 3.2, 0, 7); g.arc(2.6, -14.8, 2.4, 0, 7); g.fill();
    g.strokeStyle = 'rgba(42,36,64,0.35)'; g.lineWidth = 0.6; g.beginPath(); g.arc(0, -15, 6.4, Math.PI * 0.85, Math.PI * 2.15); g.stroke();
  }
  var TREE_KEY = [], TREE_FN = [];
  TREE_COL.forEach(function (col, v) { TREE_KEY[v] = 'tree' + v; TREE_FN[v] = function (g) { treeDraw(g, v); }; });
  function tree(c, wx, wy, v, base) {
    var sx = X(wx, wy), sy = Y(wx, wy, base || 0);
    if (!vis(sx - 9, sy - 24, sx + 9, sy + 3)) return;
    sprite(c, TREE_KEY[v], -9, -23, 18, 26, TREE_FN[v], sx, sy);
  }
  function drawRimTrees(c) {
    for (var i = 0; i < RIM_TREES.length; i++) { var t = RIM_TREES[i]; tree(c, t.x, t.y, t.v); }
  }
  var CH = { fields: [], trees: [], houses: [], pylons: [] };
  (function () {
    var yEnd = YC / T - 1.4, yTop = (IZ ? IZ.iy - 4 : 30), fx, fy, i;
    var FCOL = ['#b8d98a', '#cfe39a', '#e3d58c', '#c9b48a', '#a9d07e'];
    for (fy = yEnd; fy > yTop; fy -= 4.7) {
      for (fx = WT + 3; fx < WT + 40; fx += 5.8) {
        var r = rnd(fx * 3.1 + fy * 7.7), x0 = fx, y0 = fy - 4.1, w = 5.2, d = 4.1;
        if (r < 0.15) {
          for (i = 0; i < 5; i++) CH.trees.push({ x: (x0 + 0.8 + rnd(fx + i * 1.7 + fy) * (w - 1.6)) * T, y: (y0 + 0.8 + rnd(fy + i * 2.3 + fx) * (d - 1.6)) * T, v: 1 + (i % 2) });
          continue;
        }
        CH.fields.push({ x0: x0 * T, y0: y0 * T, x1: (x0 + w) * T, y1: (y0 + d) * T, col: FCOL[Math.floor(rnd(fx * 1.3 + fy) * FCOL.length)], rows: rnd(fx + fy * 0.7) < 0.5 });
        if (r > 0.9) CH.houses.push({ x: (x0 + 0.8) * T, y: (y0 + 0.6) * T, v: Math.floor(rnd(fx * 7 + fy) * 3) });
      }
    }
    for (var k = 1.5; k < yEnd; k += 2.3) {
      if (rnd(k * 4.3) < 0.25) continue;
      var sakura = HG && k < HG.iy + HG.ih;
      CH.trees.push({ x: (WT + 1.4 + rnd(k * 2.9) * 1.6) * T, y: k * T, v: sakura && rnd(k * 1.9) < 0.7 ? 3 : Math.floor(rnd(k) * 3) });
    }
    for (k = 2; HG && k < HG.iy + HG.ih - 2; k += 3.1) {
      CH.houses.push({ x: (WT + 4.5 + rnd(k * 5.3) * 2) * T, y: k * T, v: Math.floor(rnd(k * 3.7) * 3) });
      if (rnd(k * 6.1) < 0.6) CH.houses.push({ x: (WT + 8 + rnd(k * 2.1) * 3) * T, y: (k + 1.2) * T, v: Math.floor(rnd(k * 1.1) * 3) });
    }
    for (fy = yEnd - 2; fy > yTop - 12; fy -= 8.5) CH.pylons.push({ x: (WT + 13) * T, y: fy * T });
    CH.trees.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); });
    CH.houses.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); });
  })();
  function drawFields(c) {
    for (var i = 0; i < CH.fields.length; i++) {
      var f = CH.fields[i], l = X(f.x0, f.y1), r = X(f.x1, f.y0), t = Y(f.x0, f.y0, LAND), b = Y(f.x1, f.y1, LAND);
      if (!vis(l, t, r, b)) continue;
      c.fillStyle = f.col; c.beginPath(); quad(c, f.x0, f.y0, f.x1, f.y1, LAND + 0.05); c.fill();
      c.strokeStyle = 'rgba(90,110,60,0.25)'; c.lineWidth = 0.6; c.beginPath();
      if (f.rows) for (var u = f.x0 + 6; u < f.x1 - 2; u += 6) { mv(c, u, f.y0 + 2, LAND + 0.1); ln(c, u, f.y1 - 2, LAND + 0.1); }
      else for (var v = f.y0 + 6; v < f.y1 - 2; v += 6) { mv(c, f.x0 + 2, v, LAND + 0.1); ln(c, f.x1 - 2, v, LAND + 0.1); }
      c.stroke();
    }
  }
  var HOUSE_COL = [['#f1ece2', '#5f6f86'], ['#e9dcc6', '#8a4f3e'], ['#f4f1ea', '#4f6f5c']];
  function houseDraw(g, v) {
    var w = 18, d = 13, col = HOUSE_COL[v];
    g.fillStyle = 'rgba(40,50,40,0.18)'; I.facePath(g, -w / 2 + 2, -d / 2 + 2, w, d, 0); g.fill();
    I.box(g, -w / 2, -d / 2, w, d, 0, 7, col[0], { left: I.shade(col[0], -40), right: I.shade(col[0], -22) });
    I.box(g, -w / 2 - 1, -d / 2 - 1, w + 2, d + 2, 7, 3.4, col[1], { left: I.shade(col[1], -30), right: I.shade(col[1], -15) });
  }
  var HOUSE_FN = [0, 1, 2].map(function (v) { return function (g) { houseDraw(g, v); }; });
  var PY_H = 56, PY_ARM = [[PY_H - 4, 11], [PY_H - 13, 14], [PY_H - 22, 11]];
  function pylonDraw(g) {
    g.strokeStyle = '#8d96a6'; g.lineWidth = 0.9; g.beginPath();
    g.moveTo(-6, 0); g.lineTo(-1.6, -PY_H); g.moveTo(6, 0); g.lineTo(1.6, -PY_H);
    for (var k = 0; k < 8; k++) {
      var a = -PY_H * k / 8, b = -PY_H * (k + 1) / 8, wa = 6 - 4.4 * k / 8, wb = 6 - 4.4 * (k + 1) / 8;
      g.moveTo(-wa, a); g.lineTo(wb, b); g.moveTo(wa, a); g.lineTo(-wb, b);
    }
    g.stroke();
    g.lineWidth = 1.1; g.beginPath();
    PY_ARM.forEach(function (am) {
      g.moveTo(X(-am[1], 0), Y(-am[1], 0, am[0])); g.lineTo(X(am[1], 0), Y(am[1], 0, am[0]));
    });
    g.stroke();
    g.fillStyle = '#e2504a'; g.fillRect(-0.8, -PY_H - 3, 1.6, 3);
  }
  function drawChiba(c, S) {
    var i, k;
    drawFields(c);
    for (i = 0; i < CH.houses.length; i++) {
      var h = CH.houses[i], hx = X(h.x, h.y), hy = Y(h.x, h.y, LAND);
      if (!vis(hx - 18, hy - 22, hx + 18, hy + 8)) continue;
      sprite(c, 'chh' + h.v, -18, -22, 36, 30, HOUSE_FN[h.v], hx, hy);
    }
    for (i = 0; i < CH.trees.length; i++) { var t = CH.trees[i]; tree(c, t.x, t.y, t.v, LAND); }
    var P = CH.pylons;
    c.strokeStyle = 'rgba(70,78,96,0.55)'; c.lineWidth = 0.5; c.beginPath();
    for (i = 0; i + 1 < P.length; i++) {
      var a = P[i], b = P[i + 1];
      if (!vis(X(a.x, a.y) - 20, Y(b.x, b.y, LAND + PY_H + 4), X(b.x, b.y) + 20, Y(a.x, a.y, LAND))) continue;
      for (k = 0; k < PY_ARM.length; k++) {
        var hh = LAND + PY_ARM[k][0], aw = PY_ARM[k][1];
        [-aw, aw].forEach(function (o) {
          mv(c, a.x + o, a.y, hh);
          var mx = X(a.x + o, (a.y + b.y) / 2), my = Y(a.x + o, (a.y + b.y) / 2, hh - 7);
          c.quadraticCurveTo(mx, my, X(b.x + o, b.y), Y(b.x + o, b.y, hh));
        });
      }
    }
    c.stroke();
    for (i = 0; i < P.length; i++) {
      var p = P[i], px = X(p.x, p.y), py = Y(p.x, p.y, LAND);
      if (!vis(px - 16, py - PY_H - 6, px + 16, py + 2)) continue;
      sprite(c, 'pylon', -16, -PY_H - 6, 32, PY_H + 8, pylonDraw, px, py);
    }
  }
  var BOATS = [
    { along: 'y', a0: YC / T + 3, a1: WT + 10, at: WT + 16, sp: 0.9, k: 0 },
    { along: 'x', a0: (MN ? MN.ix : 32) + 2, a1: WT + 8, at: WT + 18, sp: 0.6, k: 1 }
  ];
  function drawBoats(c, S) {
    for (var i = 0; i < BOATS.length; i++) {
      var b = BOATS[i], span = (b.a1 - b.a0) * T, ph = (S.t * b.sp * 8 + i * 300) % (span * 2), fwd = ph < span;
      var u = b.a0 * T + (fwd ? ph : span * 2 - ph), ay = b.along === 'y';
      var wx = ay ? b.at * T : u, wy = ay ? u : b.at * T;
      var sx = X(wx, wy), sy = Y(wx, wy, SEA);
      if (!vis(sx - 20, sy - 14, sx + 20, sy + 8)) continue;
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; c.beginPath();
      var d = fwd ? -1 : 1;
      if (ay) { mv(c, wx - 3, wy + d * 6, SEA); ln(c, wx - 6, wy + d * 18, SEA); mv(c, wx + 3, wy + d * 6, SEA); ln(c, wx + 6, wy + d * 18, SEA); }
      else { mv(c, wx + d * 6, wy - 3, SEA); ln(c, wx + d * 18, wy - 6, SEA); mv(c, wx + d * 6, wy + 3, SEA); ln(c, wx + d * 18, wy + 6, SEA); }
      c.stroke();
      var bw = ay ? 7 : 16, bd = ay ? 16 : 7, cw = ay ? 5.2 : 10, cd = ay ? 10 : 5.2;
      I.box(c, wx - bw / 2, wy - bd / 2, bw, bd, SEA, 3, b.k ? '#8a2a3a' : '#e8edf4', { left: b.k ? '#5a1a26' : '#9aa7b8', right: b.k ? '#6e2230' : '#c2ccd8' });
      I.box(c, wx - cw / 2, wy - cd / 2, cw, cd, SEA + 3, b.k ? 3.4 : 2.6, b.k ? '#ffcf6b' : '#7fd3f5', { left: b.k ? '#c99a3a' : '#4a9ac0', right: b.k ? '#e0b050' : '#5fb6dc' });
    }
  }
  var HX = (MN ? MN.ix : 32) * T;
  var HND = { x0: HX - 2 * T, x1: HX + 30 * T, y0: WP + 2 * T, y1: WP + 12 * T };
  var RWY = { x0: HX, x1: HX + 28 * T, y0: WP + 6 * T, y1: WP + 9 * T };
  var DASH = [7, 6];
  function hanedaFlat(c) {
    var b0 = HND, sx0 = X(b0.x0, b0.y1), sx1 = X(b0.x1, b0.y0), sy0 = Y(b0.x0, b0.y0, 0), sy1 = Y(b0.x1, b0.y1, SEA);
    if (!vis(sx0, sy0, sx1, sy1)) return;
    (function (g) {
      I.box(g, b0.x0, b0.y0, b0.x1 - b0.x0, b0.y1 - b0.y0, SEA, 4 - SEA - 3.5, '#cfd6c4', { left: '#9aa38c', right: '#b3bca4' });
      var h = 0.6;
      g.fillStyle = '#5f6670'; g.beginPath(); quad(g, RWY.x0, RWY.y0, RWY.x1, RWY.y1, h); g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.setLineDash(DASH); g.beginPath();
      var my = (RWY.y0 + RWY.y1) / 2; mv(g, RWY.x0 + 30, my, h + 0.05); ln(g, RWY.x1 - 30, my, h + 0.05); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#ffffff'; g.beginPath();
      for (var k = 0; k < 6; k++) {
        var yy = RWY.y0 + 4 + k * 7;
        quad(g, RWY.x0 + 6, yy, RWY.x0 + 22, yy + 3, h + 0.05); quad(g, RWY.x1 - 22, yy, RWY.x1 - 6, yy + 3, h + 0.05);
      }
      g.fill();
      g.fillStyle = '#7d848e'; g.beginPath(); quad(g, HX + 3 * T, WP + 3 * T, HX + 25 * T, WP + 5.6 * T, h); g.fill();
      g.fillStyle = '#8e959e'; g.beginPath(); quad(g, HX + 9 * T, WP + 2.4 * T, HX + 21 * T, WP + 5 * T, h + 0.02); g.fill();
      g.strokeStyle = '#ffd23f'; g.lineWidth = 0.8; g.beginPath(); mv(g, HX + 3 * T, WP + 4.3 * T, h + 0.1); ln(g, HX + 25 * T, WP + 4.3 * T, h + 0.1); g.stroke();
    })(c);
    var lx = (b0.x0 + b0.x1) / 2, ly = b0.y1 + 2 * T;
    label(c, 'tokyo_haneda', X(lx, ly), Y(lx, ly, SEA) + 4, 6.5, 'rgba(40,60,90,0.8)');
  }
  function planeDraw(g, dir) {
    g.save(); g.rotate(dir > 0 ? Math.atan2(B, A) : Math.atan2(-B, -A));
    g.fillStyle = '#f4f6fb'; g.strokeStyle = INK; g.lineWidth = 0.9;
    g.beginPath(); g.ellipse(0, 0, 13, 2.6, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(2, 0); g.lineTo(-4, -10); g.lineTo(-7, -10); g.lineTo(-3, 0); g.lineTo(-7, 10); g.lineTo(-4, 10); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-10, 0); g.lineTo(-13, -4.5); g.lineTo(-14.4, -4.5); g.lineTo(-12.6, 0); g.closePath(); g.fillStyle = '#2b6fd6'; g.fill(); g.stroke();
    g.fillStyle = '#2b6fd6'; g.fillRect(-9, -0.6, 18, 1.2);
    g.restore();
  }
  var PLANE_KEY = ['planeX-1', 'planeX1'];
  var PLANE_FN = [function (g) { planeDraw(g, -1); }, function (g) { planeDraw(g, 1); }];
  function planeState(S, k) {
    var per = 26, t = ((S.t + k * 13) % per) / per, my = (RWY.y0 + RWY.y1) / 2;
    if (k === 0) {
      var u = Math.min(1, t / 0.35), x0 = RWY.x0 + 30, x1 = RWY.x1 - 60;
      if (t < 0.35) return { x: x0 + (x1 - x0) * u * u, y: my, h: 1, dir: 1, a: 1 };
      var f = (t - 0.35) / 0.65;
      return { x: x1 + f * 900, y: my + f * 60, h: 1 + f * f * 160 + f * 40, dir: 1, a: f > 0.85 ? (1 - f) / 0.15 : 1 };
    }
    var g2 = Math.min(1, t / 0.6), xA = RWY.x1 + 500, xB = RWY.x0 + 40;
    var xx = xA + (xB - xA) * (1 - (1 - g2) * (1 - g2));
    return { x: xx, y: my, h: 1 + Math.max(0, (xx - (RWY.x1 - 20)) * 0.22), dir: -1, a: t > 0.85 ? (1 - t) / 0.15 : (t < 0.04 ? t / 0.04 : 1) };
  }
  function drawPlane(c, S, p) {
    var sx = X(p.x, p.y), sy = Y(p.x, p.y, p.h);
    var gy = Y(p.x, p.y, p.h > 2 ? SEA : 0.8);
    c.globalAlpha = p.a * 0.25; c.fillStyle = '#1a2a40'; c.beginPath(); c.ellipse(sx, gy, 10, 3, 0, 0, 7); c.fill();
    c.globalAlpha = p.a;
    sprite(c, PLANE_KEY[p.dir > 0 ? 1 : 0], -16, -12, 32, 24, PLANE_FN[p.dir > 0 ? 1 : 0], sx, sy);
    c.globalAlpha = 1;
  }
  function hanedaTall(c, S) {
    var tx = HX + 5 * T, ty = WP + 3.6 * T, sx = X(tx, ty), sy = Y(tx, ty, 0);
    if (vis(sx - 30, sy - 62, sx + 120, sy + 40)) {
      sprite(c, 'hnd_bldX', -36, -62, 156, 100, function (g) {
        g.translate(-sx, -sy);
        I.box(g, HX + 9 * T, WP + 2.4 * T, 10 * T, 1.6 * T, 0.6, 14, '#e8edf4', { left: '#9aa7b8', right: '#c2ccd8' });
        I.box(g, HX + 9.2 * T, WP + 2.5 * T, 9.6 * T, 1.4 * T, 14.6, 2, '#7fd3f5', { left: '#4a9ac0', right: '#5fb6dc' });
        I.box(g, tx - 4, ty - 4, 8, 8, 0.6, 44, '#f4f6fb', { left: '#a3adbf', right: '#c7cfdb' });
        I.box(g, tx - 7, ty - 7, 14, 14, 44.6, 7, '#3f6ea8', { left: '#2b4f80', right: '#335e94' });
        I.box(g, tx - 7.5, ty - 7.5, 15, 15, 51.6, 1.6, '#ffffff');
      }, sx, sy);
      if (Math.sin(S.t * 4) > 0) { c.fillStyle = '#ff3b4f'; c.fillRect(sx - 1, Y(tx, ty, 55) - 1, 2, 2); }
    }
    for (var k = 0; k < 2; k++) {
      var px = HX + (11.5 + k * 5) * T, py = WP + 3.9 * T;
      var qx = X(px, py), qy = Y(px, py, 4);
      if (vis(qx - 16, qy - 12, qx + 16, qy + 12)) sprite(c, PLANE_KEY[0], -16, -12, 32, 24, PLANE_FN[0], qx, qy);
    }
    drawPlane(c, S, planeState(S, 0));
    drawPlane(c, S, planeState(S, 1));
  }
  var RBY = AR ? AR.iy + Math.round(AR.ih / 2) : WT - 16;
  var RB = { y: RBY * T, x0: WP - 2.2 * T, x1: WP + 46 * T, t1: WP + 10 * T, t2: WP + 30 * T, deck: 16, top: 62 };
  function cableH(x) {
    var d = RB.deck + 4;
    if (x < RB.t1) return d + (RB.top - d) * Math.pow((x - RB.x0) / (RB.t1 - RB.x0), 1.6);
    if (x > RB.t2) return d + (RB.top - d) * Math.pow((RB.x1 - x) / (RB.x1 - RB.t2), 1.6);
    var u = (x - RB.t1) / (RB.t2 - RB.t1);
    return RB.top - (RB.top - d - 4) * 4 * u * (1 - u);
  }
  function bridgeBody(g) {
    var y = RB.y, y2 = RB.y + 1.6 * T, i;
    I.box(g, WP - 2.2 * T, y - 3, 2.2 * T, 1.6 * T + 6, 0, RB.deck - 2, '#dfe3ea', { left: '#9aa3b2', right: '#bcc4d0' });
    I.box(g, WP, y - 3, 2.4 * T, 1.6 * T + 6, SEA, RB.deck - 2 - SEA, '#dfe3ea', { left: '#9aa3b2', right: '#bcc4d0' });
    [RB.t1, RB.t2].forEach(function (tx) { I.box(g, tx - 4, y - 2, 8, 1.6 * T + 4, SEA, RB.deck - SEA, '#e9edf3', { left: '#a9b2c0', right: '#c9d0da' }); });
    I.box(g, RB.x0, y, RB.x1 - RB.x0, 1.6 * T, RB.deck - 2, 3, '#d9dee6', { left: '#8d97a8', right: '#b3bbc8' });
    [RB.t1, RB.t2].forEach(function (tx) {
      I.box(g, tx - 3, y - 3, 6, 4, RB.deck, RB.top - RB.deck + 6, '#ffffff', { left: '#b9c1ce', right: '#dde2ea' });
      I.box(g, tx - 3, y2 - 1, 6, 4, RB.deck, RB.top - RB.deck + 6, '#ffffff', { left: '#b9c1ce', right: '#dde2ea' });
      I.box(g, tx - 3, y - 3, 6, y2 - y + 6, RB.top - 6, 4, '#ffffff', { left: '#b9c1ce', right: '#dde2ea' });
    });
    [y - 1, y2 + 1].forEach(function (cy) {
      g.strokeStyle = '#f4f6fb'; g.lineWidth = 1.3; g.beginPath();
      for (i = 0; i <= 60; i++) { var x = RB.x0 + (RB.x1 - RB.x0) * i / 60; if (i) ln(g, x, cy, cableH(x)); else mv(g, x, cy, cableH(x)); }
      g.stroke();
      g.strokeStyle = 'rgba(244,246,251,0.7)'; g.lineWidth = 0.5; g.beginPath();
      for (i = 1; i < 30; i++) { var x2 = RB.x0 + (RB.x1 - RB.x0) * i / 30; mv(g, x2, cy, RB.deck + 1); ln(g, x2, cy, cableH(x2)); }
      g.stroke();
    });
  }
  function bridgeBB() {
    var x0 = X(RB.x0, RB.y + 2 * T) - 4, x1 = X(RB.x1, RB.y - 4) + 4, y0 = Y(RB.x0, RB.y - 4, RB.top + 10), y1 = Y(RB.x1, RB.y + 2 * T, SEA) + 4;
    return [x0, y0, x1 - x0, y1 - y0];
  }
  function drawBridge(c, S) {
    var bb = bridgeBB();
    if (!vis(bb[0], bb[1], bb[0] + bb[2], bb[1] + bb[3])) return;
    sprite(c, 'rbridge', bb[0], bb[1], bb[2], bb[3], bridgeBody, 0, 0, 1.25);
    if (Math.sin(S.t * 3) > 0) {
      c.fillStyle = '#ff3b4f';
      [RB.t1, RB.t2].forEach(function (tx) { c.fillRect(X(tx, RB.y) - 1, Y(tx, RB.y, RB.top + 6) - 2, 2, 2); });
    }
  }
  on('backdrop', 'rim', function (r, S, H) {
    var c = H.ctx;
    litBegin(H);
    SPR_FRAME++;
    if (SPR_PX > SPR_LIMIT && SPR_FRAME % 15 === 0) sprEvict(null);
    setView(H);
    drawWater(c);
    drawWaves(c, S);
    drawLand(c);
    drawShores(c);
    drawRoadEnds(c);
    drawBoats(c, S);
    hanedaFlat(c);
    drawFar(c, S);
    drawUeno(c, S);
    drawRimTrees(c);
    drawChiba(c, S);
    drawSkytree(c, S);
    var bx = X(WP + 14 * T, WP + 14 * T), by = Y(WP + 14 * T, WP + 14 * T, SEA);
    if (vis(bx - 40, by - 10, bx + 40, by + 10)) label(c, 'tokyo_bay', bx, by, 9, 'rgba(30,80,130,0.55)');
    var rlx = FT ? FT.ix + FT.iw * 0.3 : 12;
    var rx = X(rlx * T, WP + 3.5 * T), ry = Y(rlx * T, WP + 3.5 * T, SEA);
    if (vis(rx - 40, ry - 10, rx + 40, ry + 10)) label(c, 'tokyo_tama', rx, ry, 8, 'rgba(30,80,130,0.55)');
    var cy = IZ ? IZ.iy + IZ.ih / 2 : 48, cxx = X((WT + 24) * T, cy * T), cyy = Y((WT + 24) * T, cy * T, LAND);
    if (vis(cxx - 40, cyy - 10, cxx + 40, cyy + 10)) label(c, 'tokyo_chiba', cxx, cyy, 8, 'rgba(70,100,50,0.6)');
  });
  var BAY_ITEMS = [
    { dist: 'ariake', x: RB.x0 + 2, y: RB.y, w: RB.x1 - RB.x0, h: 1.6 * T, draw: drawBridge },
    { dist: 'minato', x: HND.x0, y: HND.y0, w: HND.x1 - HND.x0, h: HND.y1 - HND.y0, draw: hanedaTall }
  ];
  var curS = null, curH = null;
  BAY_ITEMS.forEach(function (it) {
    it.e = { x: it.x, y: it.y, w: it.w, h: it.h, draw: function () { it.draw(curH.ctx, curS); } };
    on('scene', it.dist, function (r, S, H, push) {
      curS = S; curH = H; setView(H);
      var e = it.e; e.x = it.x; e.y = it.y; e.w = it.w; e.h = it.h;
      push(e);
    });
  });
  var SEGS = [];
  var CAR_COLS = ['#e2504a', '#2bb8d8', '#f5b21c', '#ffffff', '#3d4660', '#2fbf7a'];
  var ITEM_FN = {};
  function nearKeep(tx, ty, r) {
    var K = keepData();
    for (var i = 0; i < K.pts.length; i++) {
      var p = K.pts[i];
      if (p.tag !== 'pad' && Math.abs(p.tx - tx) < r && Math.abs(p.ty - ty) < r) return true;
    }
    return false;
  }
  var PARKED = [];
  W.BUCKETS.forEach(function (b) {
    if (b.kind !== 'ave') return;
    var v = b.dir === 'v', nb = v ? [[b.c, b.r], [b.c + 1, b.r]] : [[b.c, b.r], [b.c, b.r + 1]], ids = [];
    W.DISTRICTS.forEach(function (d) { nb.forEach(function (q) { if (d.col === q[0] && d.row === q[1]) ids.push(d.id); }); });
    SEGS.push({ b: b, items: [], ids: ids, frame: -1 });
  });
  var segKey = '';
  function buildSegs() {
    var K = keepData();
    if (segKey === K.key) return;
    segKey = K.key;
    PARKED.length = 0;
    SEGS.forEach(function (sg) {
      var b = sg.b, v = b.dir === 'v', items = [], a0 = v ? b.y0 : b.x0, a1 = (v ? b.y1 : b.x1) + 1;
      var sides = v ? [b.x0 + 0.28, b.x1 + 0.72] : [b.y0 + 0.28, b.y1 + 0.72];
      sides.forEach(function (sd, si) {
        for (var u = a0 + 2.5; u < a1 - 1.5; u += 3) {
          var tree = Math.round((u - a0 - 2.5) / 3) % 2 === 0;
          var tx = v ? sd : u, ty = v ? u : sd;
          if (nearKeep(tx, ty, 1.6)) continue;
          var hw = tree ? 6.5 : 5.5, top = tree ? 23 : 26;
          if (keepWhy(tx * T - hw, ty * T - hw, hw * 2, hw * 2, top, { base: 1.5 })) continue;
          items.push({ k: tree ? 'tree' : 'lamp', x: tx * T, y: ty * T, v: tree ? Math.floor(rnd(u * 3 + si) * 3) : si });
        }
      });
      if (rnd(b.i * 7.7) < 0.6) {
        var lo = v ? b.x0 : b.y0, cu = a0 + 8 + Math.floor(rnd(b.i * 3.1) * 12);
        var lane = lo + 1 + 0.25;
        var cx = v ? lane : cu + 0.5, cy = v ? cu + 0.5 : lane;
        var cw = v ? 7 : 12, cd = v ? 12 : 7;
        if (!nearKeep(cx, cy, 2.5) && !keepWhy(cx * T - cw / 2, cy * T - cd / 2, cw, cd, 7)) {
          items.push({ k: 'car', x: cx * T, y: cy * T, v: v ? 1 : 0, col: CAR_COLS[b.i % CAR_COLS.length] });
          PARKED.push({ x: cx, y: cy });
        }
      }
      items.forEach(function (it) {
        it.sx = X(it.x, it.y); it.sy = Y(it.x, it.y, 0);
        it.base = it.k === 'car' ? 0 : 1.5;
        var s = it.k === 'car' ? 14 : 5;
        it.e = { x: it.x - s / 2, y: it.y - s / 2, w: s, h: s, it: it, draw: drawAveItem };
        itemSprite(it);
      });
      sg.items = items;
    });
  }
  var SEG_BY = {};
  SEGS.forEach(function (sg) { sg.ids.forEach(function (id) { (SEG_BY[id] || (SEG_BY[id] = [])).push(sg); }); });
  function lampDraw(g, si) {
    var dx = si ? -1 : 1;
    g.fillStyle = 'rgba(40,40,60,0.18)'; g.beginPath(); g.ellipse(0, 0.4, 2.6, 1.2, 0, 0, 7); g.fill();
    g.fillStyle = '#5c6478'; g.fillRect(-0.7, -24, 1.4, 24);
    g.strokeStyle = '#5c6478'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -23); g.quadraticCurveTo(dx * 3, -26, dx * 5.5, -24.5); g.stroke();
    g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(dx * 5.5, -23.6, 2, 1, 0, 0, 7); g.fill();
  }
  function carDraw(g, along, col) {
    var w = along ? 7 : 12, d = along ? 12 : 7;
    I.box(g, -w / 2, -d / 2, w, d, 0, 4, col, { left: I.shade(col, -50), right: I.shade(col, -28) });
    var cw = along ? 6 : 6.4, cd = along ? 6.4 : 6;
    I.box(g, -cw / 2, -cd / 2, cw, cd, 4, 3, '#cfeaf7', { left: '#7fa8c4', right: '#a6c8de' });
  }
  function itemSprite(it) {
    var key = it.k === 'tree' ? 'tree' + it.v : it.k === 'lamp' ? 'lamp' + it.v : 'car' + it.v + it.col;
    if (!ITEM_FN[key]) {
      ITEM_FN[key] = it.k === 'tree' ? TREE_FN[it.v]
        : it.k === 'lamp' ? (function (v) { return function (g) { lampDraw(g, v); }; })(it.v)
        : (function (v, col) { return function (g) { carDraw(g, v, col); }; })(it.v, it.col);
    }
    it.key = key; it.fn = ITEM_FN[key];
  }
  var ITEM_S = null, ITEM_H = null;
  function drawAveItem(e) {
    var it = e.it;
    if (SIGN_ALL.length) { var bb = [it.sx - 13, it.sy - 32, it.sx + 13, it.sy + 7]; withSignHole(ITEM_H.ctx, null, bb, function () { drawAveItem0(it); }); return; }
    drawAveItem0(it);
  }
  function drawAveItem0(it) {
    var c = ITEM_H.ctx;
    if (it.k === 'tree') sprite(c, it.key, -9, -23, 18, 26, it.fn, it.sx, it.sy - it.base);
    else if (it.k === 'lamp') {
      sprite(c, it.key, -8, -28, 16, 30, it.fn, it.sx, it.sy - it.base);
      if (LIT.k > 0) {
        var lx = it.sx + (it.v ? -5.5 : 5.5), ly = it.sy - it.base - 23.6;
        litGlow('glow', lx, ly, 8, 8, '#ffe39a', 0.85);
        litGlow('pool', it.sx + (it.v ? -3 : 3), it.sy - it.base + 1.5, 15, 7, '#ffd27a', 0.55);
      }
    } else sprite(c, it.key, -12, -16, 24, 22, it.fn, it.sx, it.sy);
  }
  function aveScene(r, S, H, push) {
    var list = SEG_BY[r.id];
    if (!list) return;
    ITEM_S = S; ITEM_H = H;
    setView(H);
    for (var i = 0; i < list.length; i++) {
      var sg = list[i];
      if (sg.frame === frameNo) continue;
      sg.frame = frameNo;
      for (var k = 0; k < sg.items.length; k++) {
        var it = sg.items[k];
        if (!vis(it.sx - 14, it.sy - 30, it.sx + 14, it.sy + 8)) continue;
        var e = it.e; e.x = it.x - (it.k === 'car' ? 7 : 2.5); e.y = it.y - (it.k === 'car' ? 7 : 2.5);
        e.w = it.k === 'car' ? 14 : 5; e.h = e.w;
        push(e);
      }
    }
  }
  W.DISTRICTS.forEach(function (d) { on('scene', d.id, aveScene); });
  var frameNo = 0;
  on('ground', function (S, H) {
    frameNo++;
    buildSegs();
    setView(H);
    var c = H.ctx;
    c.fillStyle = 'rgba(110,86,60,0.55)';
    c.beginPath();
    for (var i = 0; i < SEGS.length; i++) {
      var items = SEGS[i].items;
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (it.k !== 'tree' || !vis(it.sx - 8, it.sy - 6, it.sx + 8, it.sy + 6)) continue;
        quad(c, it.x - 4, it.y - 4, it.x + 4, it.y + 4, 1.6);
      }
    }
    c.fill();
  });
  var FRONT = [];
  (function () {
    var r1 = W.WORLD_W - W.RIM;
    for (var k = 4; k < r1 - 1; k += 3.4) {
      var dSW = W.roomAt(k, r1 - 1), dSE = W.roomAt(r1 - 1, k);
      if (dSW && dSW !== 'ave') {
        if (k * T < XM) { if (rnd(k * 1.7) < 0.75) FRONT.push({ dist: dSW, k: 'tree', x: k * T, y: (r1 + 0.75) * T, v: rnd(k) < 0.6 ? 3 : 0 }); }
        else FRONT.push({ dist: dSW, k: 'lamp', x: k * T, y: (r1 + 2.3) * T, v: 0 });
      }
      if (dSE && dSE !== 'ave') {
        var onBridge = k * T > RB.y - 1.5 * T && k * T < RB.y + 3.2 * T;
        if (k * T > YC) { if (!onBridge) FRONT.push({ dist: dSE, k: 'lamp', x: (r1 + 2.3) * T, y: k * T, v: 1 }); }
        else if (rnd(k * 2.3) < 0.7) FRONT.push({ dist: dSE, k: 'tree', x: (r1 + 0.75) * T, y: k * T, v: dSE === 'hongo' && rnd(k * 1.1) < 0.6 ? 3 : Math.floor(rnd(k + 3) * 3) });
      }
    }
    FRONT.forEach(function (it) {
      it.sx = X(it.x, it.y); it.sy = Y(it.x, it.y, 0); it.base = 0;
      it.e = { x: it.x - 2.5, y: it.y - 2.5, w: 5, h: 5, it: it, draw: drawAveItem };
      itemSprite(it);
    });
  })();
  var FRONT_BY = {};
  FRONT.forEach(function (it) { (FRONT_BY[it.dist] || (FRONT_BY[it.dist] = [])).push(it); });
  Object.keys(FRONT_BY).forEach(function (id) {
    on('scene', id, function (r, S, H, push) {
      ITEM_S = S; ITEM_H = H; setView(H);
      var list = FRONT_BY[id];
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        if (!vis(it.sx - 14, it.sy - 30, it.sx + 14, it.sy + 8)) continue;
        var e = it.e; e.x = it.x - 2.5; e.y = it.y - 2.5; e.w = 5; e.h = 5;
        push(e);
      }
    });
  });
  var DFL = 3;
  var DECO = {}, DECO_E = {}, DECO_ASSIGN = {};
  var SYN = [
    [/hachi|statue|dog/, 'hachiko'], [/fashion|109|mode|boutique/, 'fashion'], [/neon|kabuki|game|arcade|club|karaoke/, 'neon'],
    [/sky|scraper|highrise|high_rise|tocho|twin/, 'sky'], [/tower|glass/, 'tower'], [/brick|station_bldg|classic/, 'brick'],
    [/office|bldg|biz|midrise|mid/, 'office'], [/apart|mansion|flat|condo|danchi/, 'apartment'], [/house|home|resi|jutaku/, 'houses'],
    [/shrine|jinja|temple|tera|torii/, 'shrine'], [/park|green|garden|koen|forest|tree/, 'park'], [/pond|lake|ike/, 'park'],
    [/plaza|square|hiroba/, 'plaza'], [/parking|lot|car/, 'parking'], [/shop|store|mall|retail|market|shotengai|cafe|food/, 'shops']
  ];
  function hashOf(s) { var h = 7; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; }
  function isDeco(p) { return !!p && (p.kind === 'deco' || p.deco === true); }
  function namedStyle(p, tbl) {
    var f = [p.variant, p.deco !== true ? p.deco : null, p.style, p.look, p.art, p.v, p.id];
    for (var i = 0; i < f.length; i++) {
      if (f[i] == null) continue;
      var s = String(f[i]).toLowerCase();
      if (tbl.styles[s]) return s;
      for (var k = 0; k < SYN.length; k++) if (SYN[k][0].test(s) && tbl.styles[SYN[k][1]]) return SYN[k][1];
    }
    return null;
  }
  function assign(dist) {
    var tbl = DECO[dist], out = {};
    var list = W.PLOTS.filter(function (p) { return p.room === dist && isDeco(p); });
    list.sort(function (a, b) { return (a.y - b.y) || (a.x - b.x); });
    var used = {};
    Object.keys(tbl.unique || {}).forEach(function (name) {
      var best = null, bs = -1;
      list.forEach(function (p) {
        if (out[p.id] || namedStyle(p, tbl)) return;
        var sc = tbl.unique[name](p);
        if (sc > bs) { bs = sc; best = p; }
      });
      if (best && bs >= 0) { out[best.id] = name; used[name] = 1; }
    });
    list.forEach(function (p) {
      if (out[p.id]) return;
      var named = namedStyle(p, tbl);
      if (named) { out[p.id] = named; return; }
      var a = p.w * p.h, sz = a <= 9 ? 's' : a <= 24 ? 'm' : 'l', cand = (tbl.pick[sz] || tbl.pick.m).slice();
      var hsh = hashOf(p.id + ':' + dist), pick = cand[hsh % cand.length];
      for (var t = 0; t < cand.length; t++) {
        var nm = cand[(hsh + t) % cand.length], same = false;
        list.forEach(function (q) {
          if (q === p || out[q.id] !== nm) return;
          if (q.x < p.x + p.w + 2 && p.x < q.x + q.w + 2 && q.y < p.y + p.h + 2 && p.y < q.y + q.h + 2) same = true;
        });
        if (!same) { pick = nm; break; }
      }
      out[p.id] = pick;
    });
    return out;
  }
  function coversKeep(p, h) {
    var cov = keepCovers([[p.x * T, p.y * T, p.w * T, p.h * T, DFL, DFL + h]], 2);
    for (var i = 0; i < cov.length; i++) if (cov[i].tag === 'pad' || cov[i].tag === 'slot' || cov[i].tag === 'exit' || cov[i].tag === 'open') return true;
    return false;
  }
  function capTop(p, want, min) {
    if (!coversKeep(p, want)) return want;
    if (coversKeep(p, min)) return -1;
    var lo = min, hi = want;
    while (hi - lo > 2) { var mid = Math.floor((lo + hi) / 2); if (coversKeep(p, mid)) hi = mid; else lo = mid; }
    return lo;
  }
  function decoOf(p) {
    var tbl = DECO[p.room];
    if (!tbl) return null;
    var kk = keepData().key + '|' + W.PLOTS.length, e = DECO_E[p.id];
    if (e && e.kk === kk) return e;
    if (!DECO_ASSIGN[p.room] || DECO_ASSIGN[p.room].kk !== kk) DECO_ASSIGN[p.room] = { kk: kk, map: assign(p.room) };
    var name = DECO_ASSIGN[p.room].map[p.id] || tbl.pick.m[0], st = tbl.styles[name], seed = hashOf(p.id);
    var v = seed % (st.nv || 3), want = st.want[0] + (seed % 7) / 6 * (st.want[1] - st.want[0]);
    if (st.grow) want = Math.min(st.want[1], want * (0.8 + 0.08 * Math.min(p.w, p.h)));
    var dd0 = W.DIST[p.room];
    if (st.front != null && dd0 && p.y - dd0.iy > dd0.ih * 0.66) want = Math.min(want, st.front);
    var top = capTop(p, Math.round(want), st.min);
    if (top < 0) {
      var lows = tbl.low || ['park'];
      for (var i = 0; i < lows.length && top < 0; i++) {
        var ls = tbl.styles[lows[(seed + i) % lows.length]];
        if (!ls) continue;
        name = lows[(seed + i) % lows.length]; st = ls; v = seed % (st.nv || 3);
        top = capTop(p, st.want[1], st.min);
      }
      if (top < 0) top = st.min;
    }
    var w = p.w * T, d = p.h * T, lift = st.over == null ? 26 : st.over;
    e = DECO_E[p.id] = {
      kk: kk, name: name, st: st, top: top, v: v, seed: seed, w: w, d: d,
      key: 'dco:' + p.room + ':' + name + ':' + p.w + 'x' + p.h + ':' + top + ':' + v + (st.keyed ? ':' + seed : ''),
      bb: [-d * A - 4, -(DFL + top + lift), (w + d) * A + 8, (w + d) * B + DFL + top + lift + 6],
      lit: st.lit !== false
    };
    var o = { w: w, d: d, top: top, v: v, seed: seed, pal: st.pal || {}, p: p, lit: false, dist: p.room, name: name };
    var oN = {}; Object.keys(o).forEach(function (k) { oN[k] = o[k]; }); oN.lit = true;
    var paint = PAINT[st.paint || name] || PAINT.office;
    e.fn = function (g) { paint(g, o); g.globalCompositeOperation = 'source-over'; };
    e.fnN = function (g) { paint(g, oN); g.globalCompositeOperation = 'source-over'; };
    return e;
  }
  function drawDeco(p, S, H) {
    var e = decoOf(p);
    if (!e) return false;
    setView(H);
    var x = p.x * T, y = p.y * T, ox = X(x, y), oy = Y(x, y, 0);
    if (!vis(ox + e.bb[0], oy + e.bb[1], ox + e.bb[0] + e.bb[2], oy + e.bb[1] + e.bb[3])) return true;
    var c = H.ctx, ga = c.globalAlpha;
    var a = e.top > 14 ? fade('dco' + p.id, S, x, y, x + e.w, y + e.d, e.top + DFL) : 1;
    c.globalAlpha = ga * a;
    var cap = e.st.cap || 2;
    sprite(c, e.key, e.bb[0], e.bb[1], e.bb[2], e.bb[3], e.fn, ox, oy, cap);
    var nt = Math.max(0, Math.min(1, +H.night || 0));
    if (nt > 0.02 && e.lit) { c.globalAlpha = ga * a * nt; sprite(c, e.key + ':n', e.bb[0], e.bb[1], e.bb[2], e.bb[3], e.fnN, ox, oy, 1); }
    if (LIT.crisp) {
      litSpr(SPR[e.key], ox, oy, a, true, x, y, e.w, e.d);
      if (e.lit) litSpr(SPR[e.key + ':n'], ox, oy, a, false, x, y, e.w, e.d);
    }
    if (e.top >= 60 && Math.sin(S.t * 2.2 + e.seed) > 0.25) {
      c.globalAlpha = ga * a;
      var bxh = X(x + e.w / 2, y + e.d / 2), byh = Y(x + e.w / 2, y + e.d / 2, DFL + e.top + 3);
      c.fillStyle = '#ff3b4f'; c.fillRect(bxh - 1, byh - 1, 2, 2);
      if (LIT.k > 0) litGlow('glow', bxh, byh, 5, 5, '#ff3b4f', 0.5 * a);
    }
    c.globalAlpha = ga;
    return true;
  }
  on('plot', 'deco', drawDeco);
  on('unowned', 'deco', drawDeco);
  function solid(g, o) { g.globalCompositeOperation = o.lit ? 'destination-out' : 'source-over'; }
  function bx(g, o, x, y, w, d, b, h, top, left, right) {
    if (w <= 0 || d <= 0 || h <= 0) return;
    solid(g, o);
    I.box(g, x, y, w, d, b, h, top, { left: left || I.shade(top, -46), right: right || I.shade(top, -24) });
  }
  function poly(g, pts) { g.beginPath(); for (var i = 0; i < pts.length; i++) { var q = pts[i]; if (i) g.lineTo(X(q[0], q[1]), Y(q[0], q[1], q[2])); else g.moveTo(X(q[0], q[1]), Y(q[0], q[1], q[2])); } g.closePath(); }
  function fillPoly(g, o, pts, col) { solid(g, o); poly(g, pts); g.fillStyle = col; g.fill(); }
  function fq(g, face, x, y, w, d, u0, u1, h0, h1) {
    if (face === 'L') {
      var yy = y + d;
      g.moveTo(X(x + u0, yy), Y(x + u0, yy, h1)); g.lineTo(X(x + u1, yy), Y(x + u1, yy, h1));
      g.lineTo(X(x + u1, yy), Y(x + u1, yy, h0)); g.lineTo(X(x + u0, yy), Y(x + u0, yy, h0));
    } else {
      var xx = x + w;
      g.moveTo(X(xx, y + u0), Y(xx, y + u0, h1)); g.lineTo(X(xx, y + u1), Y(xx, y + u1, h1));
      g.lineTo(X(xx, y + u1), Y(xx, y + u1, h0)); g.lineTo(X(xx, y + u0), Y(xx, y + u0, h0));
    }
    g.closePath();
  }
  function band(g, o, x, y, w, d, h0, h1, col, colR, lightUp) {
    g.globalCompositeOperation = o.lit && !lightUp ? 'destination-out' : 'source-over';
    if (o.lit && !lightUp) col = colR = '#000';
    g.beginPath(); fq(g, 'L', x, y, w, d, 0, w, h0, h1); g.fillStyle = col; g.fill();
    g.beginPath(); fq(g, 'R', x, y, w, d, 0, d, h0, h1); g.fillStyle = colR || col; g.fill();
  }
  function wins(g, o, x, y, w, d, h0, h1, q) {
    var lit = o.lit, n = 0;
    g.globalCompositeOperation = 'source-over';
    ['L', 'R'].forEach(function (face) {
      var len = face === 'L' ? w : d, k = Math.max(1, Math.round((len - 2) / q.cw)), cw = len / k;
      g.beginPath();
      for (var f = h0 + (q.b0 == null ? 2 : q.b0); f + q.wh <= h1 - 1; f += q.fh) {
        for (var i = 0; i < k; i++) {
          n++;
          if (lit && ((o.seed * 7 + n * 13 + Math.floor(f) * 3) % 100) >= (q.litK == null ? 55 : q.litK)) continue;
          if (!lit && q.col === 'none') continue;
          fq(g, face, x, y, w, d, i * cw + q.m, (i + 1) * cw - q.m, f, f + q.wh);
        }
      }
      g.fillStyle = lit ? (q.litCol || '#ffe7a0') : (face === 'L' ? q.col : (q.colR || q.col));
      g.fill();
    });
  }
  function hlines(g, o, x, y, w, d, h0, h1, step, col, lw) {
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = col; g.lineWidth = lw || 0.6; g.beginPath();
    for (var k = h0; k < h1 - 0.5; k += step) {
      g.moveTo(X(x, y + d), Y(x, y + d, k)); g.lineTo(X(x + w, y + d), Y(x + w, y + d, k)); g.lineTo(X(x + w, y), Y(x + w, y, k));
    }
    g.stroke();
  }
  function vlines(g, o, x, y, w, d, h0, h1, step, col, lw) {
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = col; g.lineWidth = lw || 0.5; g.beginPath();
    for (var k = step; k < w - 0.5; k += step) { g.moveTo(X(x + k, y + d), Y(x + k, y + d, h0)); g.lineTo(X(x + k, y + d), Y(x + k, y + d, h1)); }
    for (k = step; k < d - 0.5; k += step) { g.moveTo(X(x + w, y + k), Y(x + w, y + k, h0)); g.lineTo(X(x + w, y + k), Y(x + w, y + k, h1)); }
    g.stroke();
  }
  function sheen(g, o, x, y, w, d, h0, h1) {
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath();
    g.moveTo(X(x + w, y + d * 0.15), Y(x + w, y + d * 0.15, h1 - 2)); g.lineTo(X(x + w, y + d * 0.5), Y(x + w, y + d * 0.5, h1 - 2));
    g.lineTo(X(x + w, y + d * 0.9), Y(x + w, y + d * 0.9, h0 + (h1 - h0) * 0.4)); g.lineTo(X(x + w, y + d * 0.55), Y(x + w, y + d * 0.55, h0 + (h1 - h0) * 0.4));
    g.closePath(); g.fill();
  }
  function slab(g, o, col, h, inset) {
    var m = inset == null ? 1 : inset;
    solid(g, o); g.fillStyle = col; I.facePath(g, m, m, o.w - m * 2, o.d - m * 2, DFL + (h || 0.3)); g.fill();
  }
  function shadowOf(g, o, x, y, w, d) {
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(40,40,70,0.16)'; I.facePath(g, x + 3, y + 3, w, d, DFL); g.fill();
  }
  function treeAt(g, o, x, y, v, s) {
    solid(g, o);
    g.save(); g.translate(X(x, y), Y(x, y, DFL)); if (s) g.scale(s, s);
    treeDraw(g, v || 0);
    g.restore();
  }
  function bush(g, o, x, y, r, col) {
    solid(g, o);
    var sx = X(x, y), sy = Y(x, y, DFL);
    g.fillStyle = o.lit ? '#000' : (col || '#5fb86a'); g.beginPath(); g.ellipse(sx, sy - r * 0.6, r, r * 0.75, 0, 0, 7); g.fill();
    if (!o.lit) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(sx - r * 0.3, sy - r * 0.9, r * 0.4, r * 0.3, 0, 0, 7); g.fill(); }
  }
  function gable(g, o, x, y, w, d, hb, rh, wall, roof) {
    bx(g, o, x, y, w, d, DFL, hb, wall, I.shade(wall, -40), I.shade(wall, -20));
    var b = DFL + hb, H = b + rh, ov = 1.6, r2 = I.shade(roof, -30);
    if (w >= d) {
      var ym = y + d / 2;
      fillPoly(g, o, [[x - ov, y - ov, b], [x + w + ov, y - ov, b], [x + w + ov, ym, H], [x - ov, ym, H]], r2);
      fillPoly(g, o, [[x + w, y, b], [x + w, ym, H], [x + w, y + d, b]], I.shade(wall, -14));
      fillPoly(g, o, [[x - ov, ym, H], [x + w + ov, ym, H], [x + w + ov, y + d + ov, b], [x - ov, y + d + ov, b]], roof);
    } else {
      var xm = x + w / 2;
      fillPoly(g, o, [[x - ov, y - ov, b], [xm, y - ov, H], [xm, y + d + ov, H], [x - ov, y + d + ov, b]], r2);
      fillPoly(g, o, [[x, y + d, b], [xm, y + d, H], [x + w, y + d, b]], I.shade(wall, -34));
      fillPoly(g, o, [[xm, y - ov, H], [x + w + ov, y - ov, b], [x + w + ov, y + d + ov, b], [xm, y + d + ov, H]], roof);
    }
  }
  function glowRect(g, o, sx, sy, w, h, col) {
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = col; g.fillRect(sx, sy, w, h);
  }
  var POPC = ['#ff5a8a', '#2bb8d8', '#f5b21c', '#6f57e0', '#2fbf7a', '#ef7d2e', '#ff7eb6', '#34d6c0'];
  var NEONC = ['#ff3fa4', '#3ff0ff', '#b4ff3f', '#ffe93f', '#b77bff', '#ff8a3f'];
  var PAINT = {
    tower: function (g, o) {
      var w = o.w, d = o.d, pal = o.pal, top = o.top, glass = (pal.glass || ['#a7c8e8', '#6f97c4', '#94b8d6'])[o.v % 3];
      var pod = Math.min(10, top * 0.2), ix = Math.max(3, w * 0.14), iy = Math.max(3, d * 0.14);
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, pod, '#e9e4da', '#b9b2a4', '#d2ccbf');
      wins(g, o, 1, 1, w - 2, d - 2, DFL, DFL + pod, { fh: 20, wh: pod - 3, cw: 7, m: 0.6, col: '#7f9fbd', colR: '#9bb9d3', litK: 90, b0: 1.5 });
      var tx = ix, ty = iy, tw = w - ix * 2, td = d - iy * 2, b = DFL + pod, H1 = top - pod - (o.v === 2 ? 0 : 0);
      if (o.v === 1 && top > 50) {
        var h1 = H1 * 0.62;
        bx(g, o, tx, ty, tw, td, b, h1, pal.frame || '#ffffff', I.shade(glass, -38), glass);
        hlines(g, o, tx, ty, tw, td, b + 4, b + h1, 4.5, 'rgba(255,255,255,0.32)');
        wins(g, o, tx, ty, tw, td, b, b + h1, { fh: 4.5, wh: 2.6, cw: 4, m: 0.4, col: 'none', litK: 45, b0: 1 });
        var s = Math.min(tw, td) * 0.18;
        bx(g, o, tx + s, ty + s, tw - s * 2, td - s * 2, b + h1, H1 - h1, pal.frame || '#ffffff', I.shade(glass, -30), I.shade(glass, 8));
        hlines(g, o, tx + s, ty + s, tw - s * 2, td - s * 2, b + h1 + 4, DFL + top, 4.5, 'rgba(255,255,255,0.32)');
        wins(g, o, tx + s, ty + s, tw - s * 2, td - s * 2, b + h1, DFL + top, { fh: 4.5, wh: 2.6, cw: 4, m: 0.4, col: 'none', litK: 45, b0: 1 });
        sheen(g, o, tx + s, ty + s, tw - s * 2, td - s * 2, b + h1, DFL + top);
        bx(g, o, tx + s + 3, ty + s + 3, tw - s * 2 - 6, td - s * 2 - 6, DFL + top, 1, '#c9d1dc');
        return;
      }
      bx(g, o, tx, ty, tw, td, b, H1, pal.frame || '#ffffff', I.shade(glass, -38), glass);
      vlines(g, o, tx, ty, tw, td, b + 1, b + H1 - 1, 4, 'rgba(30,50,80,0.22)');
      hlines(g, o, tx, ty, tw, td, b + 4, b + H1, 4.5, 'rgba(255,255,255,0.32)');
      wins(g, o, tx, ty, tw, td, b, b + H1, { fh: 4.5, wh: 2.6, cw: 4, m: 0.4, col: 'none', litK: 45, b0: 1 });
      sheen(g, o, tx, ty, tw, td, b, b + H1);
      var crown = (pal.crown || ['#f5b21c', null, '#e2508a'])[o.v % 3];
      if (crown && o.v === 0) bx(g, o, tx - 0.5, ty - 0.5, tw + 1, td + 1, DFL + top - 5, 3, crown);
      bx(g, o, tx + 2, ty + 2, tw - 4, td - 4, DFL + top, 0.8, '#c9d1dc');
      if (o.v === 2) {
        bx(g, o, tx + tw / 2 - 3, ty + td / 2 - 3, 6, 6, DFL + top + 0.8, 5, '#e3e8ef');
        bx(g, o, tx + tw / 2 - 0.5, ty + td / 2 - 0.5, 1, 1, DFL + top + 5.8, 12, '#d9dde5');
      } else if (tw > 14 && td > 14) {
        bx(g, o, tx + 4, ty + 4, Math.min(9, tw - 8), Math.min(7, td - 8), DFL + top + 0.8, 4, '#e3e8ef', '#9aa6b6', '#c0c9d6');
      }
    },
    office: function (g, o) {
      var w = o.w, d = o.d, pal = o.pal, top = o.top;
      var wall = (pal.stone || ['#e7dfcf', '#d6d9de', '#efe6d2'])[o.v % 3];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, top, wall);
      band(g, o, 1, 1, w - 2, d - 2, DFL, DFL + 6, '#8fa3b8', '#a9bccd');
      wins(g, o, 1, 1, w - 2, d - 2, DFL + 6, DFL + top - 3, { fh: 5, wh: 2.8, cw: 5, m: 1.1, col: '#5d7590', colR: '#7790aa', litK: 50 });
      band(g, o, 1, 1, w - 2, d - 2, DFL + top - 2.4, DFL + top, I.shade(wall, -30), I.shade(wall, -14));
      if (w > 22 && d > 22) bx(g, o, w * 0.3, d * 0.3, w * 0.4, d * 0.35, DFL + top, 5, '#dfe3ea', '#9aa6b6', '#c0c9d6');
    },
    brick: function (g, o) {
      var w = o.w, d = o.d, top = Math.max(14, o.top), brick = '#c4553e', b2 = '#a4432f';
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, top - 6, brick, I.shade(brick, -40), b2);
      [0.33, 0.66].forEach(function (k) { band(g, o, 1, 1, w - 2, d - 2, DFL + (top - 6) * k, DFL + (top - 6) * k + 1.2, '#f4ede0', '#e6dccb'); });
      wins(g, o, 1, 1, w - 2, d - 2, DFL + 1, DFL + top - 7, { fh: (top - 6) / 3, wh: (top - 6) / 3 - 3.2, cw: 5, m: 1.3, col: '#f6f1e6', colR: '#e9e1d0', litK: 60, b0: 1.6 });
      band(g, o, 1, 1, w - 2, d - 2, DFL + top - 7, DFL + top - 6, '#f4ede0', '#e6dccb');
      var cx = w / 2, cy = d / 2, r = Math.min(w, d) * 0.2;
      bx(g, o, cx - r, cy - r, r * 2, r * 2, DFL + top - 6, 6, brick, I.shade(brick, -40), b2);
      var sx = X(cx, cy), sy = Y(cx, cy, DFL + top), rr = r * 1.15;
      solid(g, o); g.fillStyle = o.lit ? '#000' : '#5f9d89';
      g.beginPath(); g.ellipse(sx, sy, rr, rr * 0.5, 0, 0, Math.PI); g.ellipse(sx, sy, rr, rr * 0.95, 0, Math.PI, Math.PI * 2); g.closePath(); g.fill();
      if (!o.lit) {
        g.fillStyle = '#7fc2ad'; g.beginPath(); g.ellipse(sx - rr * 0.32, sy - rr * 0.42, rr * 0.34, rr * 0.42, -0.4, 0, 7); g.fill();
        g.strokeStyle = 'rgba(40,80,70,0.45)'; g.lineWidth = 0.5; g.beginPath();
        for (var k = -2; k <= 2; k++) { g.moveTo(sx + k * rr * 0.36, sy + Math.sqrt(1 - (k * 0.36) * (k * 0.36)) * rr * 0.5); g.quadraticCurveTo(sx + k * rr * 0.3, sy - rr * 0.6, sx, sy - rr * 0.95); }
        g.stroke();
      }
      solid(g, o); g.fillStyle = o.lit ? '#000' : '#e0b84a'; g.fillRect(sx - 0.6, sy - rr * 0.95 - 4, 1.2, 4);
    },
    shops: function (g, o) {
      var w = o.w, d = o.d, along = w >= d, len = along ? w : d, n = Math.max(1, Math.round(len / 22)), sl = len / n, top = o.top;
      var cols = o.pal.shops || POPC;
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      for (var i = 0; i < n; i++) {
        var hs = (o.seed + i * 17) % 7, h = Math.max(11, Math.min(top, 12 + hs * 2.5 + (o.v === 2 ? 6 : 0)));
        var wall = ['#f4efe6', '#fde8d8', '#e8f1f6', '#f7f0d5', '#efe2f2'][(o.seed + i) % 5], acc = cols[(o.seed + i * 3) % cols.length];
        var x = along ? 1 + i * sl : 1, y = along ? 1 : 1 + i * sl, bw = along ? sl - 0.6 : w - 2, bd = along ? d - 2 : sl - 0.6;
        bx(g, o, x, y, bw, bd, DFL, h, wall);
        g.globalCompositeOperation = 'source-over';
        g.beginPath(); fq(g, 'L', x, y, bw, bd, 1, bw - 1, DFL + 0.5, DFL + 6.5); fq(g, 'R', x, y, bw, bd, 1, bd - 1, DFL + 0.5, DFL + 6.5);
        g.fillStyle = o.lit ? '#ffe7a0' : '#9fd3ee'; g.fill();
        if (!o.lit) {
          g.beginPath(); fq(g, 'L', x, y + 1.5, bw, bd, 0, bw, DFL + 6.5, DFL + 8.6); fq(g, 'R', x + 1.5, y, bw, bd, 0, bd, DFL + 6.5, DFL + 8.6);
          g.fillStyle = acc; g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 0.9; g.beginPath();
          for (var k = 2; k < bw; k += 4) { g.moveTo(X(x + k, y + bd + 1.5), Y(x + k, y + bd + 1.5, DFL + 8.6)); g.lineTo(X(x + k, y + bd + 1.5), Y(x + k, y + bd + 1.5, DFL + 6.5)); }
          for (k = 2; k < bd; k += 4) { g.moveTo(X(x + bw + 1.5, y + k), Y(x + bw + 1.5, y + k, DFL + 8.6)); g.lineTo(X(x + bw + 1.5, y + k), Y(x + bw + 1.5, y + k, DFL + 6.5)); }
          g.stroke();
        }
        if (h > 14) wins(g, o, x, y, bw, bd, DFL + 9, DFL + h - 1, { fh: 5, wh: 2.6, cw: 5, m: 1, col: '#6d86a3', colR: '#86a0bb', litK: 60, b0: 1 });
        g.globalCompositeOperation = 'source-over';
        g.beginPath(); fq(g, 'L', x, y, bw, bd, bw * 0.15, bw * 0.85, DFL + h - 0.5, DFL + h + 3.5); g.fillStyle = o.lit ? acc : acc; g.fill();
        if (!o.lit) { g.beginPath(); fq(g, 'L', x, y + 0.2, bw, bd, bw * 0.22, bw * 0.78, DFL + h + 1, DFL + h + 2); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill(); }
      }
    },
    fashion: function (g, o) {
      var w = o.w, d = o.d, top = o.top, cx = w / 2, cy = d / 2, r = Math.min(w, d) / 2 - 2, n = 16;
      var body = ['#f2f2f6', '#ffe9f1', '#eef6ff'][o.v % 3], acc = ['#e2508a', '#7b5cff', '#2bb8d8'][o.v % 3];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, 6, '#f4efe6');
      g.globalCompositeOperation = 'source-over';
      g.beginPath(); fq(g, 'L', 1, 1, w - 2, d - 2, 1, w - 3, DFL + 0.6, DFL + 5); fq(g, 'R', 1, 1, w - 2, d - 2, 1, d - 3, DFL + 0.6, DFL + 5);
      g.fillStyle = o.lit ? '#ffe7a0' : '#9fd3ee'; g.fill();
      var b = DFL + 6, H = DFL + top;
      for (var i = 0; i < n; i++) {
        var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2, nx = Math.cos(am), ny = Math.sin(am);
        if (nx + ny <= -0.05) continue;
        var p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
        var k = (nx - ny + 1.5) / 3;
        fillPoly(g, o, [[p0[0], p0[1], H], [p1[0], p1[1], H], [p1[0], p1[1], b], [p0[0], p0[1], b]], I.shade(body, -40 + Math.round(k * 40)));
        if (!o.lit) {
          g.strokeStyle = 'rgba(80,90,120,0.25)'; g.lineWidth = 0.5; g.beginPath();
          for (var f = b + 5; f < H - 2; f += 5) { g.moveTo(X(p0[0], p0[1]), Y(p0[0], p0[1], f)); g.lineTo(X(p1[0], p1[1]), Y(p1[0], p1[1], f)); }
          g.stroke();
        } else if (i % 2 === 0) {
          g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffe7a0'; g.beginPath();
          for (var f2 = b + 2; f2 < H - 4; f2 += 5) if ((o.seed + i + f2) % 3) { poly(g, [[p0[0], p0[1], f2 + 2.4], [p1[0], p1[1], f2 + 2.4], [p1[0], p1[1], f2], [p0[0], p0[1], f2]]); g.fill(); }
        }
      }
      solid(g, o); g.fillStyle = I.shade(body, 10); g.beginPath();
      for (i = 0; i <= n; i++) { var a = i / n * Math.PI * 2; if (i) g.lineTo(X(cx + Math.cos(a) * r, cy + Math.sin(a) * r), Y(cx + Math.cos(a) * r, cy + Math.sin(a) * r, H)); else g.moveTo(X(cx + r, cy), Y(cx + r, cy, H)); }
      g.closePath(); g.fill();
      var fx = cx + r * 0.72, fy = cy + r * 0.72, sx = X(fx, fy), s0 = Y(fx, fy, H + 4), s1 = Y(fx, fy, b + 4);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = acc; g.fillRect(sx - 3.2, s0, 6.4, s1 - s0);
      g.fillStyle = o.lit ? '#ffffff' : 'rgba(255,255,255,0.9)';
      for (var y2 = s0 + 2.5; y2 < s1 - 3; y2 += 5.5) g.fillRect(sx - 1.8, y2, 3.6, 3.4);
    },
    neon: function (g, o) {
      var w = o.w, d = o.d, top = o.top, wall = ['#3a3152', '#2c3a52', '#4a2f4a'][o.v % 3];
      var c1 = NEONC[o.seed % NEONC.length], c2 = NEONC[(o.seed + 2) % NEONC.length];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, top, wall, I.shade(wall, -20), I.shade(wall, 14));
      band(g, o, 1, 1, w - 2, d - 2, DFL + 0.5, DFL + 6, '#ffd77a', '#ffe7a0', true);
      wins(g, o, 1, 1, w - 2, d - 2, DFL + 7, DFL + top - 2, { fh: 4.6, wh: 2.2, cw: 4, m: 0.7, col: '#5d5378', colR: '#6c6390', litK: 70, litCol: '#ffd2f0', b0: 1 });
      [[c1, 'L', w * 0.8], [c2, 'R', d * 0.25]].forEach(function (q, j) {
        var col = q[0], u = q[2], h0 = DFL + 8, h1 = DFL + Math.max(14, top - 4);
        g.globalCompositeOperation = 'source-over';
        g.beginPath(); fq(g, q[1], 1, 1, w - 2 + (q[1] === 'R' ? 2.2 : 0), d - 2 + (q[1] === 'L' ? 2.2 : 0), u - 2, u + 2, h0, h1);
        g.fillStyle = col; g.fill();
        g.fillStyle = o.lit ? '#ffffff' : 'rgba(255,255,255,0.75)'; g.beginPath();
        for (var f = h0 + 2; f < h1 - 2.5; f += 4.5) fq(g, q[1], 1, 1, w - 2 + (q[1] === 'R' ? 2.3 : 0), d - 2 + (q[1] === 'L' ? 2.3 : 0), u - 1, u + 1, f, f + 2.4);
        g.fill();
      });
      if (top >= 24) {
        var cx = w / 2, cy = d / 2, sx = X(cx, cy), sy = Y(cx, cy, DFL + top), bw2 = Math.min(30, (w + d) * A * 0.55);
        g.globalCompositeOperation = o.lit ? 'destination-out' : 'source-over';
        g.fillStyle = '#4a4560'; g.fillRect(sx - bw2 * 0.3, sy - 4, 1.2, 4); g.fillRect(sx + bw2 * 0.3, sy - 4, 1.2, 4);
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#1b1530'; g.fillRect(sx - bw2 / 2, sy - 14, bw2, 10);
        for (var k = 0; k < 4; k++) { g.fillStyle = NEONC[(o.seed + k) % NEONC.length]; g.fillRect(sx - bw2 / 2 + 1 + k * (bw2 - 2) / 4, sy - 13, (bw2 - 2) / 4 - 0.6, 8); }
      }
    },
    sky: function (g, o) {
      var w = o.w, d = o.d, top = o.top, pal = o.pal, glass = (pal.glass || ['#5f7fa8', '#7a95b8', '#4f6d96'])[o.v % 3];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      var pod = Math.min(9, top * 0.12);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, pod, '#dcd6cc', '#a9a294', '#c4bdb0');
      band(g, o, 1, 1, w - 2, d - 2, DFL + 0.8, DFL + pod - 1.5, '#7f9fbd', '#9bb9d3');
      var b = DFL + pod, H = DFL + top, ix = Math.max(2.5, w * 0.1), iy = Math.max(2.5, d * 0.1), tx = ix, ty = iy, tw = w - ix * 2, td = d - iy * 2;
      function shaft(x, y, ww, dd, h0, h1) {
        bx(g, o, x, y, ww, dd, h0, h1 - h0, '#e8edf4', I.shade(glass, -30), glass);
        vlines(g, o, x, y, ww, dd, h0 + 1, h1 - 1, 3.2, 'rgba(255,255,255,0.28)');
        hlines(g, o, x, y, ww, dd, h0 + 4, h1, 4.2, 'rgba(20,30,60,0.28)');
        wins(g, o, x, y, ww, dd, h0, h1, { fh: 4.2, wh: 2.3, cw: 3.4, m: 0.35, col: 'none', litK: 50, b0: 1 });
        sheen(g, o, x, y, ww, dd, h0, h1);
      }
      if (o.v === 0) {
        var hs = b + (H - b) * 0.62;
        shaft(tx, ty, tw, td, b, hs);
        var along = tw >= td, gap = 3;
        if (along) { var hw = (tw - gap) / 2; shaft(tx, ty + 1, hw, td - 2, hs, H); shaft(tx + hw + gap, ty + 1, hw, td - 2, hs, H - 4); }
        else { var hd = (td - gap) / 2; shaft(tx + 1, ty, tw - 2, hd, hs, H - 4); shaft(tx + 1, ty + hd + gap, tw - 2, hd, hs, H); }
      } else if (o.v === 1) {
        var steps = 4;
        for (var k = 0; k < steps; k++) {
          var s = k * Math.min(tw, td) * 0.07, h0 = b + (H - b) * k / steps, h1 = b + (H - b) * (k + 1) / steps;
          shaft(tx + s, ty + s, tw - s * 2, td - s * 2, h0, h1);
        }
        if (!o.lit) {
          g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 0.5; g.beginPath();
          for (var u = 0; u < tw; u += 6) { g.moveTo(X(tx + u, ty + td), Y(tx + u, ty + td, b)); g.lineTo(X(Math.min(tx + tw, tx + u + 6), ty + td), Y(tx + u + 6, ty + td, b + (H - b) * 0.3)); }
          g.stroke();
        }
        var sm = Math.min(tw, td) * 0.28;
        bx(g, o, tx + sm, ty + sm, tw - sm * 2, td - sm * 2, H, 3, '#d9dde5');
      } else {
        var hn = b + (H - b) * 0.82;
        shaft(tx, ty, tw, td, b, hn);
        var s2 = Math.min(tw, td) * 0.22;
        shaft(tx + s2, ty + s2, tw - s2 * 2, td - s2 * 2, hn, H);
        bx(g, o, tx + tw / 2 - 0.6, ty + td / 2 - 0.6, 1.2, 1.2, H, 14, '#d9dde5');
      }
      if (o.v !== 1) bx(g, o, tx + 3, ty + 3, Math.min(8, tw - 6), Math.min(6, td - 6), H, 3, '#dfe3ea');
    },
    apartment: function (g, o) {
      var w = o.w, d = o.d, top = o.top, wall = ['#f3ede2', '#e9eef2', '#f6e7d8'][o.v % 3];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1.5, 1.5, w - 3, d - 3, DFL, top, wall);
      var fh = 6;
      for (var f = DFL + 1.5; f + 4.5 < DFL + top; f += fh) {
        band(g, o, 1.5, 1.5, w - 3, d - 3, f + 1.8, f + 4.6, '#7f95ad', '#93a9c0');
        band(g, o, 1, 1, w - 2, d - 2, f, f + 2, '#ffffff', '#f2f4f7');
      }
      wins(g, o, 1.5, 1.5, w - 3, d - 3, DFL + 1.5, DFL + top, { fh: fh, wh: 2.8, cw: 6, m: 1.2, col: 'none', litK: 55, litCol: '#ffe2a0', b0: 1.8 });
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over';
        for (var k = 0; k < 6; k++) {
          var ff = DFL + 1.5 + ((o.seed + k * 3) % Math.max(1, Math.floor(top / fh))) * fh, u = ((o.seed * 7 + k * 11) % 90) / 100 * (w - 6) + 3;
          g.fillStyle = POPC[(o.seed + k) % POPC.length]; g.beginPath(); fq(g, 'L', 1, 1, w - 2, d - 2, u, u + 1.6, ff + 2, ff + 3.6); g.fill();
        }
      }
      bx(g, o, w * 0.6, d * 0.3, 5, 5, DFL + top, 4, '#d9dde5', '#9aa6b6', '#bcc4d0');
    },
    houses: function (g, o) {
      var w = o.w, d = o.d, nx = Math.max(1, Math.round(w / 30)), ny = Math.max(1, Math.round(d / 30)), lw = w / nx, ld = d / ny;
      slab(g, o, '#cfe4b4', 0.25, 0.5);
      var roofs = o.pal.roofs || ['#d2564a', '#4f6fa8', '#5d5a66', '#8a5a3c', '#2f8a7a'];
      var walls = ['#f6efe2', '#fff7e8', '#efe9f6', '#f3f0e8', '#e9f2ec'];
      for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
        var k = o.seed + i * 5 + j * 11, x = i * lw + 3, y = j * ld + 3, hw = lw - 8, hd = ld - 8;
        var hb = Math.min(o.top - 6, 9 + (k % 3)), rh = Math.min(7, Math.max(3, o.top - hb));
        if (hb < 5) { bush(g, o, x + hw / 2, y + hd / 2, 5); continue; }
        gable(g, o, x, y, hw - 3, hd - 3, hb, rh, walls[k % walls.length], roofs[k % roofs.length]);
        wins(g, o, x, y, hw - 3, hd - 3, DFL + 2, DFL + hb, { fh: 5, wh: 2.6, cw: 7, m: 2, col: '#8fb4d0', colR: '#a5c4dc', litK: 65, litCol: '#ffd98a', b0: 1.5 });
        if (o.top >= 18 && hw > 12) bush(g, o, x + hw - 1, y + hd - 1, 3.2, '#4fae5c');
      }
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#4f9a55'; g.lineWidth = 1.4; g.beginPath();
        g.moveTo(X(1, d - 1), Y(1, d - 1, DFL + 1.2)); g.lineTo(X(w - 1, d - 1), Y(w - 1, d - 1, DFL + 1.2)); g.lineTo(X(w - 1, 1), Y(w - 1, 1, DFL + 1.2));
        g.stroke();
      }
    },
    park: function (g, o) {
      var w = o.w, d = o.d, top = o.top;
      slab(g, o, '#a9d58a', 0.3, 0.5);
      solid(g, o); g.fillStyle = '#e9dfc3';
      I.facePath(g, w / 2 - 2.5, 1, 5, d - 2, DFL + 0.4); g.fill();
      I.facePath(g, 1, d / 2 - 2.5, w - 2, 5, DFL + 0.4); g.fill();
      var cx = w / 2, cy = d / 2;
      if (o.v === 0 && w >= 40 && d >= 40) {
        solid(g, o); g.fillStyle = '#6cbcdc'; I.facePath(g, cx - w * 0.22, cy - d * 0.22, w * 0.44, d * 0.44, DFL + 0.45); g.fill();
        if (!o.lit) {
          g.fillStyle = 'rgba(255,255,255,0.35)'; I.facePath(g, cx - w * 0.15, cy - d * 0.05, w * 0.12, 1.2, DFL + 0.5); g.fill();
          var sx = X(cx + 3, cy + 2), sy = Y(cx + 3, cy + 2, DFL + 1);
          g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(sx, sy, 3.6, 1.8, 0, 0, 7); g.fill();
          g.beginPath(); g.arc(sx + 2.4, sy - 2.6, 1.1, 0, 7); g.fill(); g.fillRect(sx + 1.9, sy - 2.6, 0.9, 2.4);
          g.fillStyle = '#f5b21c'; g.fillRect(sx + 3.2, sy - 2.9, 1.2, 0.7);
        }
      } else if (o.v === 1 && top >= 12) {
        bx(g, o, cx + 4, cy + 4, 4, 9, DFL, 8, '#ef7d2e');
        fillPoly(g, o, [[cx + 4, cy + 13, DFL + 8], [cx + 8, cy + 13, DFL + 8], [cx + 8, cy + 20, DFL + 0.5], [cx + 4, cy + 20, DFL + 0.5]], '#2bb8d8');
        bx(g, o, cx - 12, cy + 4, 1, 1, DFL, 9, '#5c6478'); bx(g, o, cx - 4, cy + 4, 1, 1, DFL, 9, '#5c6478');
        bx(g, o, cx - 12, cy + 4, 9, 1, DFL + 9, 1, '#e2504a');
      } else {
        bx(g, o, cx - 6, cy - 6, 12, 12, DFL, 2, '#dfe3ea', '#a3adbf', '#c7cfdb');
        solid(g, o); g.fillStyle = '#7cc6e6'; I.facePath(g, cx - 4.5, cy - 4.5, 9, 9, DFL + 2.05); g.fill();
        if (!o.lit) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(X(cx, cy), Y(cx, cy, DFL + 6), 1.2, 4, 0, 0, 7); g.fill(); }
      }
      var spots = [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8], [0.2, 0.5], [0.5, 0.2]];
      spots.forEach(function (s, i) {
        if (i >= 4 && (w < 48 || d < 48)) return;
        var x = s[0] * w, y = s[1] * d;
        if (top >= 24) treeAt(g, o, x, y, (o.seed + i) % 3); else bush(g, o, x, y, 4.2);
      });
      bx(g, o, cx + 5, d * 0.62, 6, 1.6, DFL, 2, '#a0714f');
    },
    plaza: function (g, o) {
      var w = o.w, d = o.d;
      slab(g, o, '#e6e0d2', 0.25, 0.5);
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.fillStyle = '#dcd5c5';
        for (var i = 0; i < w / 8; i++) for (var j = 0; j < d / 8; j++) if ((i + j) % 2 === 0) { I.facePath(g, i * 8 + 0.5, j * 8 + 0.5, 8, 8, DFL + 0.3); g.fill(); }
      }
      bx(g, o, 3, 3, w * 0.3, 4, DFL, 2, '#8fcf7a', '#5f9d55', '#78b866');
      bx(g, o, w - 10, d - 8, 6, 1.6, DFL, 2, '#a0714f');
      if (o.top >= 22) treeAt(g, o, w * 0.75, d * 0.3, 3);
      else bush(g, o, w * 0.75, d * 0.3, 4, '#f2a7c3');
    },
    parking: function (g, o) {
      var w = o.w, d = o.d, along = w >= d;
      slab(g, o, '#8e959e', 0.25, 0.5);
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.7; g.beginPath();
        var len = along ? w : d;
        for (var u = 4; u < len - 2; u += 9) {
          if (along) { g.moveTo(X(u, 2), Y(u, 2, DFL + 0.35)); g.lineTo(X(u, d * 0.45), Y(u, d * 0.45, DFL + 0.35)); }
          else { g.moveTo(X(2, u), Y(2, u, DFL + 0.35)); g.lineTo(X(w * 0.45, u), Y(w * 0.45, u, DFL + 0.35)); }
        }
        g.stroke();
      }
      var n = Math.max(1, Math.floor((along ? w : d) / 20));
      for (var k = 0; k < n; k++) {
        if ((o.seed + k) % 3 === 0) continue;
        var u2 = 8.5 + k * 18, col = CAR_COLS[(o.seed + k) % CAR_COLS.length];
        solid(g, o);
        g.save();
        if (along) g.translate(X(u2, d * 0.25), Y(u2, d * 0.25, DFL)); else g.translate(X(w * 0.25, u2), Y(w * 0.25, u2, DFL));
        if (o.lit) { g.fillStyle = '#000'; g.fillRect(-7, -9, 14, 13); } else carDraw(g, along ? 1 : 0, col);
        g.restore();
      }
    },
    shrine: function (g, o) {
      var w = o.w, d = o.d, top = o.top, cx = w / 2;
      slab(g, o, '#e7e2d6', 0.3, 0.5);
      solid(g, o); g.fillStyle = '#d6cdb8'; I.facePath(g, cx - 3, d * 0.35, 6, d * 0.65 - 1, DFL + 0.4); g.fill();
      if (top >= 24) { treeAt(g, o, w * 0.15, d * 0.18, 1); treeAt(g, o, w * 0.85, d * 0.18, 0); }
      var hw = Math.min(w * 0.5, 30), hd = Math.min(d * 0.32, 18), hx = cx - hw / 2, hy = 3;
      bx(g, o, hx - 1, hy - 1, hw + 2, hd + 2, DFL, 2, '#cfc8b8');
      bx(g, o, hx + 2, hy + 2, hw - 4, hd - 4, DFL + 2, Math.min(7, top - 8), '#b8452f', '#7e2a1c', '#9c3826');
      gable(g, o, hx + 2, hy + 2, hw - 4, hd - 4, Math.max(2, Math.min(7, top - 8)) + 2, Math.max(3, Math.min(8, top - 10)), '#b8452f', '#4a4a56');
      var ty = d - 5, th = Math.min(13, Math.max(8, top - 2));
      bx(g, o, cx - 6, ty, 1.4, 1.4, DFL, th, '#e04a2f', '#a8301c', '#c43b24');
      bx(g, o, cx + 4.6, ty, 1.4, 1.4, DFL, th, '#e04a2f', '#a8301c', '#c43b24');
      bx(g, o, cx - 7, ty - 0.2, 14, 1.8, DFL + th - 3, 1, '#e04a2f');
      bx(g, o, cx - 8.5, ty - 0.5, 17, 2.4, DFL + th, 1.6, '#2a2440', '#2a2440', '#3a3450');
      bx(g, o, cx - 9, d * 0.55, 2, 2, DFL, 5, '#bfbab0'); bx(g, o, cx + 7, d * 0.55, 2, 2, DFL, 5, '#bfbab0');
    },
    hachiko: function (g, o) {
      var w = o.w, d = o.d, cx = w / 2, cy = d / 2;
      slab(g, o, '#e8e2d4', 0.25, 0.5);
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.fillStyle = '#dcd3c0';
        for (var i = 0; i < w / 8; i++) for (var j = 0; j < d / 8; j++) if ((i + j) % 2 === 0) { I.facePath(g, i * 8 + 0.5, j * 8 + 0.5, 8, 8, DFL + 0.3); g.fill(); }
      }
      bx(g, o, 2, 2, w - 4, 4, DFL, 2.2, '#8fcf7a', '#5f9d55', '#78b866');
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over';
        for (var k = 0; k < (w - 6) / 4; k++) { g.fillStyle = POPC[k % POPC.length]; var fx = 4 + k * 4, fy = 4; g.fillRect(X(fx, fy) - 0.7, Y(fx, fy, DFL + 2.8) - 0.7, 1.4, 1.4); }
      }
      bx(g, o, cx - 4, cy - 4, 8, 8, DFL, 6, '#bdb6a8', '#8f897c', '#a8a194');
      var sx = X(cx, cy), sy = Y(cx, cy, DFL + 6);
      solid(g, o);
      g.fillStyle = o.lit ? '#000' : '#8a6a3c';
      g.beginPath(); g.ellipse(sx, sy - 3.2, 2.6, 3.4, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(sx + 1.2, sy - 7.4, 1.9, 0, 7); g.fill();
      g.beginPath(); g.moveTo(sx + 0.3, sy - 8.6); g.lineTo(sx + 0.8, sy - 10.6); g.lineTo(sx + 1.6, sy - 8.8); g.fill();
      g.beginPath(); g.ellipse(sx + 2.6, sy - 6.9, 1.3, 0.8, 0, 0, 7); g.fill();
      g.fillRect(sx - 2.2, sy - 1.6, 4.6, 1.6);
      if (!o.lit) { g.fillStyle = 'rgba(255,230,170,0.5)'; g.beginPath(); g.arc(sx + 0.6, sy - 8, 0.7, 0, 7); g.fill(); }
      if (o.top >= 22) treeAt(g, o, w * 0.82, d * 0.3, 0); else bush(g, o, w * 0.82, d * 0.3, 4);
      bx(g, o, 3, d - 6, 7, 1.6, DFL, 2, '#a0714f');
    },
    woods: function (g, o) {
      var w = o.w, d = o.d, top = o.top, i, j;
      slab(g, o, '#7fb862', 0.25, 0.5);
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.fillStyle = '#6aa652';
        for (i = 0; i < w / 12; i++) for (j = 0; j < d / 12; j++) if ((i * 3 + j + o.seed) % 4 === 0) { I.facePath(g, i * 12 + 1, j * 12 + 1, 10, 10, DFL + 0.35); g.fill(); }
      }
      var nx = Math.max(1, Math.floor((w - 4) / 11)), ny = Math.max(1, Math.floor((d - 4) / 11)), list = [];
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) list.push([i, j]);
      list.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
      list.forEach(function (q) {
        var k = o.seed + q[0] * 7 + q[1] * 13, x = 6 + q[0] * (w - 8) / nx + (k % 3), y = 6 + q[1] * (d - 8) / ny + ((k >> 2) % 3);
        if (top >= 24) treeAt(g, o, x, y, k % 9 === 0 ? 3 : k % 3, 0.9 + (k % 4) * 0.06); else bush(g, o, x, y, 4.4, k % 2 ? '#4fae5c' : '#3f9a55');
      });
    },
    palace: function (g, o) {
      var w = o.w, d = o.d, top = o.top, i, moat = Math.min(12, d * 0.36), wallH = 4;
      solid(g, o); g.fillStyle = o.lit ? '#000' : '#4f9fc9'; I.facePath(g, 0.5, d - moat, w - 1, moat - 0.5, DFL - 1.2); g.fill();
      if (!o.lit) {
        g.fillStyle = 'rgba(255,255,255,0.28)';
        for (i = 6; i < w - 12; i += 23) { I.facePath(g, i + (o.seed % 7), d - moat * 0.55, 8, 0.9, DFL - 1.1); g.fill(); }
        g.fillStyle = '#e4ded0'; I.facePath(g, 0.5, d - 1.6, w - 1, 1.1, DFL + 0.2); g.fill();
      }
      bx(g, o, 0.5, 0.5, w - 1, d - moat - 0.5, DFL - 1.2, wallH, '#a9d58a', '#8a8478', '#9c968a');
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(60,55,45,0.35)'; g.lineWidth = 0.4; g.beginPath();
        for (i = 3; i < w - 1; i += 4) { var yy = d - moat; g.moveTo(X(i, yy), Y(i, yy, DFL - 1.2)); g.lineTo(X(i + 1.5, yy), Y(i + 1.5, yy, DFL - 1.2 + wallH)); }
        g.stroke();
      }
      var fb = DFL - 1.2 + wallH, n = Math.max(2, Math.floor(w / 13));
      for (i = 0; i < n; i++) {
        var x = 6 + i * (w - 12) / Math.max(1, n - 1), y = d - moat - 4, sx = X(x, y), sy = Y(x, y, fb);
        solid(g, o);
        g.fillStyle = o.lit ? '#000' : '#6b4a32'; g.fillRect(sx - 0.6, sy - 6, 1.2, 6);
        g.fillStyle = o.lit ? '#000' : (i % 2 ? '#2f6f45' : '#3a7d4c');
        g.beginPath(); g.ellipse(sx, sy - 7, 5.4, 2.2, 0, 0, 7); g.ellipse(sx + 2.2, sy - 10, 3.8, 1.8, 0, 0, 7); g.ellipse(sx - 1.6, sy - 12.4, 2.8, 1.4, 0, 0, 7); g.fill();
      }
      if (d - moat > 18 && top >= 24) {
        for (i = 0; i < w / 14; i++) treeAt(g, o, 8 + i * 14 + (o.seed + i) % 4, 6 + (i % 2) * 3, (o.seed + i) % 3, 1);
      }
    },
    marunouchi: function (g, o) {
      var w = o.w, d = o.d, top = o.top, stone = (o.pal.stone || ['#e7dfcf', '#e2d6bf', '#c4553e'])[o.v % 3];
      var pod = Math.min(top, 20 + (o.seed % 3) * 2);
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, pod, stone);
      band(g, o, 1, 1, w - 2, d - 2, DFL, DFL + 5.5, '#4e5a6e', '#5f6b80');
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.fillStyle = '#f6f1e6'; g.beginPath();
        for (var u = 3; u < w - 3; u += 5) fq(g, 'L', 1, 1, w - 2, d - 2, u, u + 1.4, DFL, DFL + 5.5);
        for (u = 3; u < d - 3; u += 5) fq(g, 'R', 1, 1, w - 2, d - 2, u, u + 1.4, DFL, DFL + 5.5);
        g.fill();
      }
      if (o.v === 2) [0.45, 0.75].forEach(function (k) { band(g, o, 1, 1, w - 2, d - 2, DFL + pod * k, DFL + pod * k + 1, '#f4ede0', '#e6dccb'); });
      wins(g, o, 1, 1, w - 2, d - 2, DFL + 6.5, DFL + pod - 2.5, { fh: 4.2, wh: 2.6, cw: 4.2, m: 1, col: o.v === 2 ? '#f6f1e6' : '#566a84', colR: o.v === 2 ? '#e9e1d0' : '#6c809a', litK: 55, b0: 0.5 });
      bx(g, o, 0.3, 0.3, w - 0.6, d - 0.6, DFL + pod - 2, 1.4, I.shade(stone, 12), I.shade(stone, -38), I.shade(stone, -18));
      if (top - pod >= 16) {
        var s = Math.max(4, Math.min(w, d) * 0.2), tw = w - 2 * s, td = d - 2 * s, b = DFL + pod;
        bx(g, o, s, s, tw, td, b, top - pod, '#ffffff', '#6f97c4', '#a7c8e8');
        vlines(g, o, s, s, tw, td, b + 1, DFL + top - 1, 3.5, 'rgba(30,50,80,0.25)');
        hlines(g, o, s, s, tw, td, b + 4, DFL + top, 4.2, 'rgba(255,255,255,0.35)');
        wins(g, o, s, s, tw, td, b, DFL + top, { fh: 4.2, wh: 2.4, cw: 3.6, m: 0.4, col: 'none', litK: 45, b0: 1 });
        sheen(g, o, s, s, tw, td, b, DFL + top);
        bx(g, o, s + 2, s + 2, tw - 4, td - 4, DFL + top, 1, '#c9d1dc');
      } else if (w > 22 && d > 22) bx(g, o, w * 0.32, d * 0.32, w * 0.36, d * 0.3, DFL + pod, 4, '#dfe3ea', '#9aa6b6', '#c0c9d6');
    },
    farm: function (g, o) {
      var w = o.w, d = o.d, along = w >= d, len = along ? w : d, wid = along ? d : w, i;
      slab(g, o, '#b98e5e', 0.25, 0.5);
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over';
        var cols = ['#6cc04a', '#3f9a52', '#9ad04f'];
        for (i = 3; i < wid - 2; i += 3.2) {
          g.fillStyle = cols[Math.floor(i / 3.2 + o.seed) % 3]; g.beginPath();
          if (along) I.facePath(g, 2, i, len * 0.62 - 2, 1.5, DFL + 0.5); else I.facePath(g, i, 2, 1.5, len * 0.62 - 2, DFL + 0.5);
          g.fill();
        }
      }
      var hx = along ? len * 0.66 : 2, hy = along ? 2 : len * 0.66, hw = along ? len * 0.32 : wid - 4, hd = along ? wid - 4 : len * 0.32;
      if (o.top >= 8 && hw > 8 && hd > 8) {
        bx(g, o, hx, hy, hw, hd, DFL, 3, '#eef6f2', '#c9d8d0', '#dce8e2');
        var r = Math.min(5, Math.min(hw, hd) * 0.35);
        solid(g, o); g.fillStyle = o.lit ? '#000' : 'rgba(240,250,246,0.95)'; g.beginPath();
        if (along) { g.moveTo(X(hx, hy + hd), Y(hx, hy + hd, DFL + 3)); g.lineTo(X(hx + hw, hy + hd), Y(hx + hw, hy + hd, DFL + 3)); g.lineTo(X(hx + hw, hy + hd / 2), Y(hx + hw, hy + hd / 2, DFL + 3 + r)); g.lineTo(X(hx, hy + hd / 2), Y(hx, hy + hd / 2, DFL + 3 + r)); }
        else { g.moveTo(X(hx + hw, hy), Y(hx + hw, hy, DFL + 3)); g.lineTo(X(hx + hw, hy + hd), Y(hx + hw, hy + hd, DFL + 3)); g.lineTo(X(hx + hw / 2, hy + hd), Y(hx + hw / 2, hy + hd, DFL + 3 + r)); g.lineTo(X(hx + hw / 2, hy), Y(hx + hw / 2, hy, DFL + 3 + r)); }
        g.closePath(); g.fill();
        if (!o.lit) { g.strokeStyle = 'rgba(120,150,140,0.5)'; g.lineWidth = 0.4; g.stroke(); }
      }
      if (!o.lit) {
        var sx = X(len * 0.3, wid * 0.5), sy = Y(len * 0.3, wid * 0.5, DFL);
        if (!along) { sx = X(wid * 0.5, len * 0.3); sy = Y(wid * 0.5, len * 0.3, DFL); }
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#6f5a40'; g.lineWidth = 0.8;
        g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, sy - 8); g.moveTo(sx - 3, sy - 6); g.lineTo(sx + 3, sy - 6); g.stroke();
        g.fillStyle = '#e8c06a'; g.beginPath(); g.ellipse(sx, sy - 9, 2.6, 1, 0, 0, 7); g.fill();
      }
    },
    warehouse: function (g, o) {
      var w = o.w, d = o.d, top = Math.max(10, Math.min(o.top, 26)), wall = ['#e8ece6', '#e6e8ee', '#efe9de'][o.v % 3];
      var acc = (o.pal.acc || ['#2b6fd6', '#2fbf7a', '#ef7d2e'])[o.v % 3], m = 1.5, bw = w - 2 * m, bd = d - 2 * m - 6;
      slab(g, o, '#b9bcc2', 0.25, 0.5);
      shadowOf(g, o, m, m, bw, bd);
      bx(g, o, m, m, bw, bd, DFL, top, wall);
      band(g, o, m, m, bw, bd, DFL + top - 4, DFL + top - 1.5, acc, I.shade(acc, 18));
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.fillStyle = '#9aa3ae'; g.beginPath();
        for (var u = 3; u < bw - 6; u += 9) fq(g, 'L', m, m, bw, bd, u, u + 6, DFL, DFL + 7);
        g.fill();
        g.strokeStyle = 'rgba(60,70,90,0.35)'; g.lineWidth = 0.4; g.beginPath();
        for (u = 3; u < bw - 6; u += 9) for (var hh = DFL + 1.5; hh < DFL + 7; hh += 1.5) { g.moveTo(X(m + u, m + bd), Y(m + u, m + bd, hh)); g.lineTo(X(m + u + 6, m + bd), Y(m + u + 6, m + bd, hh)); }
        g.stroke();
        g.fillStyle = 'rgba(160,200,230,0.8)';
        for (var k = 4; k < bw - 4; k += 10) { I.facePath(g, m + k, m + 3, 3, bd - 6, DFL + top + 0.05); g.fill(); }
      } else {
        glowRect(g, o, X(m + bw * 0.5, m + bd) - 1.5, Y(m + bw * 0.5, m + bd, DFL + 9) - 1, 3, 2, '#fff2b0');
      }
      var nt = bw > 60 ? 2 : 1;
      for (var t = 0; t < nt; t++) {
        var tx = m + 6 + t * bw * 0.45, ty = d - 4;
        bx(g, o, tx, ty - 3, 12, 5, DFL, 6, '#ffffff', '#c4c8d2', '#d8dce4');
        bx(g, o, tx + 12, ty - 3, 4, 5, DFL, 4.5, acc);
      }
    },
    dc_shed: function (g, o) {
      var w = o.w, d = o.d, top = Math.max(12, Math.min(o.top, 34)), m = 2, bw = w - 2 * m, bd = d - 2 * m;
      var acc = ['#6f57e0', '#2bb8d8', '#2fbf7a'][o.v % 3];
      slab(g, o, '#d6d9de', 0.25, 0.5);
      shadowOf(g, o, m, m, bw, bd);
      bx(g, o, m, m, bw, bd, DFL, top, '#f4f6f9', '#c3cad6', '#dde2ea');
      vlines(g, o, m, m, bw, bd, DFL + 1, DFL + top - 1, 6, 'rgba(120,130,150,0.35)', 0.5);
      band(g, o, m, m, bw, bd, DFL + top - 5, DFL + top - 3, acc, I.shade(acc, 20));
      g.globalCompositeOperation = 'source-over';
      g.beginPath(); fq(g, 'L', m, m, bw, bd, bw * 0.15, bw * 0.15 + 5, DFL, DFL + 5); g.fillStyle = o.lit ? '#ffe7a0' : '#7fb3d6'; g.fill();
      var rx = Math.max(1, Math.floor((bw - 6) / 8)), ry = Math.max(1, Math.floor((bd - 6) / 8));
      for (var j = 0; j < ry; j++) for (var i = 0; i < rx; i++) {
        var ux = m + 3 + i * 8, uy = m + 3 + j * 8;
        bx(g, o, ux, uy, 6, 6, DFL + top, 2.4, '#c9ced8', '#9aa3b2', '#b4bcc8');
        if (!o.lit) { g.fillStyle = '#4a5160'; g.beginPath(); g.ellipse(X(ux + 3, uy + 3), Y(ux + 3, uy + 3, DFL + top + 2.45), 2.3, 1.15, 0, 0, 7); g.fill(); }
      }
      if (o.lit) { glowRect(g, o, X(m + bw, m) - 1, Y(m + bw, m, DFL + top + 1) - 1, 2, 2, '#ff6b6b'); glowRect(g, o, X(m + bw * 0.15 + 7, m + bd) - 1, Y(m + bw * 0.15 + 7, m + bd, DFL + 6) - 1, 2, 2, '#7dff9a'); }
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(110,120,140,0.6)'; g.lineWidth = 0.6; g.beginPath();
        g.moveTo(X(0.8, d - 0.8), Y(0.8, d - 0.8, DFL + 2.2)); g.lineTo(X(w - 0.8, d - 0.8), Y(w - 0.8, d - 0.8, DFL + 2.2)); g.lineTo(X(w - 0.8, 0.8), Y(w - 0.8, 0.8, DFL + 2.2));
        g.stroke();
      }
    },
    dept: function (g, o) {
      var w = o.w, d = o.d, top = o.top, wall = ['#efe6d6', '#f2eef2', '#e8eef4'][o.v % 3], acc = (o.pal.acc || ['#e2508a', '#2b6fd6', '#f5b21c'])[o.v % 3];
      shadowOf(g, o, 1, 1, w - 2, d - 2);
      bx(g, o, 1, 1, w - 2, d - 2, DFL, top, wall);
      band(g, o, 1, 1, w - 2, d - 2, DFL + 0.4, DFL + 6, o.lit ? '#ffe7a0' : '#9fd3ee', o.lit ? '#ffe7a0' : '#b6e0f4', true);
      band(g, o, 1, 1, w - 2, d - 2, DFL + 6, DFL + 7.2, acc, I.shade(acc, 18));
      wins(g, o, 1, 1, w - 2, d - 2, DFL + 9, DFL + top - 3, { fh: 6, wh: 2, cw: 7, m: 2, col: '#7f8ea4', colR: '#93a3b8', litK: 40, b0: 1 });
      g.globalCompositeOperation = 'source-over';
      [0.25, 0.7].forEach(function (k, i) {
        var u = (w - 2) * k;
        g.beginPath(); fq(g, 'L', 1, 1, w - 2, d - 2 + 0.3, u, u + 4, DFL + 8.5, DFL + Math.max(14, top - 3)); g.fillStyle = i ? acc : '#ffffff'; g.fill();
      });
      if (top >= 16) {
        var sx = X(w / 2, d / 2), sy = Y(w / 2, d / 2, DFL + top);
        g.fillStyle = o.lit ? acc : acc; g.fillRect(sx - 9, sy - 9, 18, 7);
        g.fillStyle = '#ffffff'; g.fillRect(sx - 7, sy - 7, 14, 1.2); g.fillRect(sx - 7, sy - 4.6, 9, 1.2);
      }
    },
    riverbank: function (g, o) {
      var w = o.w, d = o.d, along = w >= d, i;
      slab(g, o, '#a9d58a', 0.25, 0.5);
      solid(g, o); g.fillStyle = o.lit ? '#000' : '#ebe2c8';
      if (along) I.facePath(g, 0.5, 2.5, w - 1, 3, DFL + 0.35); else I.facePath(g, 2.5, 0.5, 3, d - 1, DFL + 0.35);
      g.fill();
      if (!o.lit) {
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 0.5; g.setLineDash([3, 3]); g.beginPath();
        if (along) { g.moveTo(X(1, 4), Y(1, 4, DFL + 0.4)); g.lineTo(X(w - 1, 4), Y(w - 1, 4, DFL + 0.4)); }
        else { g.moveTo(X(4, 1), Y(4, 1, DFL + 0.4)); g.lineTo(X(4, d - 1), Y(4, d - 1, DFL + 0.4)); }
        g.stroke(); g.setLineDash([]);
        var len = along ? w : d;
        if (len > 120) {
          var px = along ? w * 0.42 : w * 0.68, py = along ? d * 0.68 : d * 0.42;
          g.fillStyle = '#d9b98a'; g.beginPath(); g.ellipse(X(px, py), Y(px, py, DFL + 0.4), 12, 6, 0, 0, 7); g.fill();
          g.fillStyle = '#ffffff'; [[0, 3.5], [-6, 0], [0, -3.5], [6, 0]].forEach(function (q) { g.fillRect(X(px, py) + q[0] - 0.7, Y(px, py, DFL + 0.5) + q[1] - 0.7, 1.4, 1.4); });
        }
      }
      for (i = 0; i < Math.max(1, Math.floor((along ? w : d) / 70)); i++) {
        var u = 12 + i * 70 + (o.seed % 9), tx = along ? u : w * 0.7, ty = along ? d * 0.7 : u;
        if (along && u > w - 8) break;
        if (!along && u > d - 8) break;
        var sx = X(tx, ty), sy = Y(tx, ty, DFL);
        solid(g, o); g.fillStyle = o.lit ? '#000' : POPC[(o.seed + i) % POPC.length];
        g.beginPath(); g.moveTo(sx - 4, sy); g.lineTo(sx, sy - 6); g.lineTo(sx + 4, sy); g.closePath(); g.fill();
        if (o.top >= 22 && u + 30 < (along ? w : d) - 6) treeAt(g, o, along ? u + 30 : w * 0.35, along ? d * 0.35 : u + 30, (o.seed + i) % 4 === 0 ? 3 : (o.seed + i) % 3, 0.95);
      }
    }
  };
  var CL_CURB = 3, CL_FENCE = 17, SG_H = CL_CURB + CL_FENCE + 9;
  var SG_SHIFT = { N: 6, W: 6, S: -6, E: -6 };
  function signPts(d) {
    return (d.signs || []).map(function (sg) {
      var k = SG_SHIFT[sg.side] || 0, along = sg.side === 'N' || sg.side === 'S';
      var lo = (along ? d.ix : d.iy) + 2, hi = (along ? d.ix + d.iw : d.iy + d.ih) - 3;
      var u = Math.max(lo, Math.min(hi, (along ? sg.x : sg.y) + k));
      return { x: along ? u : sg.x, y: along ? sg.y : u, side: sg.side };
    });
  }
  var MEAS = {}, measC = null;
  function measure(s) {
    var k = s + '|' + FONT(), v = MEAS[k];
    if (v != null) return v;
    if (!measC) measC = document.createElement('canvas').getContext('2d');
    measC.font = '800 8.5px ' + FONT();
    return (MEAS[k] = measC.measureText(s).width);
  }
  function boardRect(cx, cy, lines, lock) {
    var w = 0, LK = lock ? 9 : 0;
    for (var i = 0; i < lines.length; i++) w = Math.max(w, measure(lines[i][0]) + (i ? 0 : LK));
    w += 12;
    return [cx - w / 2 - 1.5, cy - (5 + lines.length * 10.5) - 1.5, cx + w / 2 + 1.5, cy + 1.5];
  }
  var SIGN_NOW = {};
  var SIGN_ALL = [];
  function signFrame(S, H) {
    var G = QT.G, band = H.uiBand ? H.uiBand() : { top: 0, bottom: H.cssH }, best = null, bd = Infinity, all = [];
    var px = S.player.x / T, py = S.player.y / T;
    SIGN_NOW = {}; SIGN_ALL = [];
    for (var i = 0; i < W.DISTRICTS.length; i++) {
      var d = W.DISTRICTS[i];
      if (G.roomOpen(d.id)) continue;
      var sp = d._clSigns || (d._clSigns = signPts(d));
      for (var j = 0; j < sp.length; j++) {
        var sg = sp[j], wx = (sg.x + 0.5) * T, wy = (sg.y + 0.5) * T, s = H.toScreen(wx, wy, SG_H);
        var it = { d: d, sg: sg, cx: X(wx, wy), cy: Y(wx, wy, SG_H) };
        all.push(it);
        if (!(s.x > 24 && s.x < H.cssW - 24 && s.y - 22 * H.z > band.top && s.y < band.bottom)) continue;
        var dd = Math.hypot(sg.x + 0.5 - px, sg.y + 0.5 - py);
        if (dd < bd) { bd = dd; best = it; }
      }
    }
    var st = {};
    for (i = 0; i < all.length; i++) {
      var a = all[i];
      if (!vis(a.cx - 100, a.cy - 50, a.cx + 100, a.cy + 4)) continue;
      var s0 = st[a.d.id] || (st[a.d.id] = H.distSign ? H.distSign(a.d) : null);
      var r = s0 && (s0.ready || a === best) ? boardRect(a.cx, a.cy, s0.lines, !s0.ready) : boardRect(a.cx, a.cy, [[L.nm(a.d)]], true);
      SIGN_ALL.push(r);
      if (a.sg.side === 'N' || a.sg.side === 'W') (SIGN_NOW[a.d.id] || (SIGN_NOW[a.d.id] = [])).push(r);
    }
  }
  function withSignHole(c, did, bb, draw) {
    var rs = did ? SIGN_NOW[did] : SIGN_ALL, hit = null, i;
    if (rs) for (i = 0; i < rs.length; i++) { var r = rs[i]; if (!bb || (r[0] < bb[2] && bb[0] < r[2] && r[1] < bb[3] && bb[1] < r[3])) (hit || (hit = [])).push(r); }
    if (!hit) { draw(); return; }
    c.save();
    c.beginPath(); c.rect(-1e5, -1e5, 2e5, 2e5);
    for (i = 0; i < hit.length; i++) c.rect(hit[i][0], hit[i][1], hit[i][2] - hit[i][0], hit[i][3] - hit[i][1]);
    c.clip('evenodd');
    draw();
    c.restore();
  }
  var CL_PAL = {
    fab: ['#cfd6de', '#d9d3c7', '#c3cfda'], hongo: ['#dcc4b2', '#e6d8c4', '#e3d9ef'],
    shinjuku: ['#b9c2d6', '#c8cfdd', '#aab5cc'], ariake: ['#d3e6f0', '#e6eef3', '#c9dde9'],
    inzai: ['#e4e8ee', '#dfe4dc', '#ece8de'], otemachi: ['#d6d9de', '#e7dfcf', '#cfd6e0'], shibuya: ['#efe2f2', '#e8f1f6', '#f4efe6'],
    futako: ['#f2e6d4', '#e6eef0', '#efe0d8'], minato: ['#dfe8f0', '#e9e2d6', '#d6e2ec']
  };
  var CL_SAW = { line: 1, clean: 1, stage: 1, recv: 1, ship: 1, service: 1, helium: 1, upgrade: 1, foundry: 1, dc: 1, cooling: 1, substation: 1 };
  function frameLines(g, o, x, y, w, d, h0, h1, step, col) {
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = col; g.lineWidth = 0.8; g.beginPath();
    for (var k = h0; k <= h1 + 0.1; k += step) {
      g.moveTo(X(x, y), Y(x, y, k)); g.lineTo(X(x + w, y), Y(x + w, y, k)); g.lineTo(X(x + w, y + d), Y(x + w, y + d, k));
      g.lineTo(X(x, y + d), Y(x, y + d, k)); g.lineTo(X(x, y), Y(x, y, k));
    }
    var cols = [[x, y], [x + w, y], [x + w, y + d], [x, y + d], [x + w / 2, y + d], [x + w, y + d / 2]];
    for (k = 0; k < cols.length; k++) { g.moveTo(X(cols[k][0], cols[k][1]), Y(cols[k][0], cols[k][1], h0)); g.lineTo(X(cols[k][0], cols[k][1]), Y(cols[k][0], cols[k][1], h1)); }
    g.stroke();
  }
  function craneMast(g, o, x, y, h) {
    bx(g, o, x - 1.4, y - 1.4, 2.8, 2.8, DFL, h, '#f5b21c', '#b9801a', '#d99a20');
    if (!o.lit) {
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(90,60,10,0.55)'; g.lineWidth = 0.45; g.beginPath();
      for (var k = DFL + 3; k < DFL + h - 2; k += 4) {
        g.moveTo(X(x - 1.4, y + 1.4), Y(x - 1.4, y + 1.4, k)); g.lineTo(X(x + 1.4, y + 1.4), Y(x + 1.4, y + 1.4, k + 4));
        g.moveTo(X(x + 1.4, y + 1.4), Y(x + 1.4, y + 1.4, k)); g.lineTo(X(x + 1.4, y - 1.4), Y(x + 1.4, y - 1.4, k + 4));
      }
      g.stroke();
    }
    bx(g, o, x - 2.6, y - 2.6, 5.2, 5.2, DFL + h, 4, '#f5b21c', '#b9801a', '#d99a20');
    if (!o.lit) { g.fillStyle = '#9fd3ee'; g.beginPath(); fq(g, 'L', x - 2.6, y - 2.6, 5.2, 5.2, 1, 4.2, DFL + h + 1, DFL + h + 3); g.fill(); }
  }
  function craneArm(c, cx, hy, t, len) {
    var a = t * 0.25, ex2 = cx + Math.cos(a) * len, ey2 = hy + Math.sin(a) * len * 0.3;
    c.strokeStyle = '#f5b21c'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - Math.cos(a) * len / 3, hy - Math.sin(a) * len / 10); c.lineTo(ex2, ey2); c.stroke();
    c.fillStyle = '#7d8598'; c.fillRect(cx - Math.cos(a) * len / 3 - 2, hy - Math.sin(a) * len / 10 - 1.5, 4, 3);
    c.strokeStyle = 'rgba(60,60,80,0.7)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(ex2 - Math.cos(a) * 6, ey2 - Math.sin(a) * 2); c.lineTo(ex2 - Math.cos(a) * 6, ey2 + 22); c.stroke();
    c.fillStyle = '#8a92b0'; c.fillRect(ex2 - Math.cos(a) * 6 - 2, ey2 + 22, 4, 3);
  }
  PAINT.shell = function (g, o) {
    var w = o.w, d = o.d, top = o.top, walls = o.pal.wall || CL_PAL.otemachi, wall = walls[o.v % walls.length], m = 2;
    shadowOf(g, o, m, m, w - 2 * m, d - 2 * m);
    slab(g, o, '#ddd7ca', 0.25, 0.5);
    if (o.saw) {
      var along = w >= d, len = along ? w - 2 * m : d - 2 * m, n = Math.max(1, Math.round(len / 16)), sl = len / n;
      for (var i = 0; i < n; i++) {
        var x = along ? m + i * sl : m, y = along ? m : m + i * sl, ww = along ? sl - 0.8 : w - 2 * m, dd = along ? d - 2 * m : sl - 0.8;
        gable(g, o, x, y, ww, dd, Math.max(6, top - 7), Math.min(7, Math.max(3, top * 0.3)), wall, '#8d98a8');
        wins(g, o, x, y, ww, dd, DFL + 1, DFL + Math.max(6, top - 7) - 1, { fh: 6, wh: 2.6, cw: 6, m: 1.4, col: '#7f97b2', colR: '#93abc3', litK: 40, b0: 2 });
      }
      return;
    }
    bx(g, o, m, m, w - 2 * m, d - 2 * m, DFL, top, wall);
    band(g, o, m, m, w - 2 * m, d - 2 * m, DFL, DFL + 5, '#8fa3b8', '#a9bccd');
    wins(g, o, m, m, w - 2 * m, d - 2 * m, DFL + 5, DFL + top - 3, { fh: 5.5, wh: 2.8, cw: 5.5, m: 1.2, col: '#6f88a4', colR: '#87a0bb', litK: 50 });
    band(g, o, m, m, w - 2 * m, d - 2 * m, DFL + top - 2, DFL + top, I.shade(wall, -26), I.shade(wall, -12));
    if (w > 30 && d > 26) bx(g, o, w * 0.3, d * 0.3, Math.min(14, w * 0.3), Math.min(10, d * 0.3), DFL + top, 4, '#dfe3ea', '#9aa6b6', '#c0c9d6');
  };
  PAINT.site = function (g, o) {
    var w = o.w, d = o.d, top = o.top, m = 2, bw = w - 2 * m, bd = d - 2 * m, core = Math.max(8, Math.round(top * 0.6));
    slab(g, o, '#cfc3a8', 0.25, 0.5);
    shadowOf(g, o, m, m, bw, bd);
    bx(g, o, m + 1.5, m + 1.5, bw - 3, bd - 3, DFL, core, '#d3d0c8', '#a3a097', '#bdbab1');
    frameLines(g, o, m + 1.5, m + 1.5, bw - 3, bd - 3, DFL + core, DFL + top, 6, '#d0643f');
    solid(g, o);
    g.fillStyle = o.lit ? '#000' : 'rgba(76,164,112,0.86)'; g.beginPath(); fq(g, 'L', m, m, bw, bd, 0, bw, DFL, DFL + core + 2); fq(g, 'R', m, m, bw, bd, 0, bd, DFL, DFL + core + 2); g.fill();
    if (!o.lit) {
      g.fillStyle = 'rgba(58,138,92,0.9)'; g.beginPath(); fq(g, 'R', m, m, bw, bd, 0, bd, DFL, DFL + core + 2); g.fill();
      vlines(g, o, m, m, bw, bd, DFL, DFL + core + 2, 5, 'rgba(255,255,255,0.28)', 0.5);
      hlines(g, o, m, m, bw, bd, DFL + 4, DFL + core + 2, 5, 'rgba(255,255,255,0.22)', 0.5);
      g.fillStyle = '#f4f2eb'; g.beginPath(); fq(g, 'L', m, m, bw, bd, 0, bw, DFL + core + 2, DFL + core + 4.5); fq(g, 'R', m, m, bw, bd, 0, bd, DFL + core + 2, DFL + core + 4.5); g.fill();
    }
    if (o.lit) {
      glowRect(g, o, X(m + bw, m + bd) - 1.5, Y(m + bw, m + bd, DFL + top) - 1.5, 3, 3, '#fff2b0');
      glowRect(g, o, X(m + bw, m) - 1.5, Y(m + bw, m, DFL + top) - 1.5, 3, 3, '#fff2b0');
    }
    if (o.crane) craneMast(g, o, o.crane[0], o.crane[1], o.crane[2]);
  };
  PAINT.lot = function (g, o) {
    var w = o.w, d = o.d;
    slab(g, o, '#cfc3a8', 0.25, 0.5);
    var cw = Math.min(18, w * 0.5), cd = Math.min(9, d * 0.45);
    bx(g, o, 2, 2, cw, cd, DFL, 7, '#e8eef4', '#aab6c2', '#cdd6df');
    if (!o.lit) { g.fillStyle = '#4a7fc0'; g.beginPath(); fq(g, 'L', 2, 2, cw, cd, 0, cw, DFL + 5, DFL + 6.2); fq(g, 'R', 2, 2, cw, cd, 0, cd, DFL + 5, DFL + 6.2); g.fill(); }
    else glowRect(g, o, X(2 + cw * 0.5, 2 + cd) - 1.5, Y(2 + cw * 0.5, 2 + cd, DFL + 4) - 1, 3, 2, '#ffe7a0');
    if (w > 28) {
      bx(g, o, w - 14, 3, 10, 4, DFL, 2, '#b98a5a'); bx(g, o, w - 13, 3.5, 8, 3, DFL + 2, 2, '#c99a6a');
      bx(g, o, w - 15, d - 9, 6, 6, DFL, 3, '#8d98a8');
    }
    for (var i = 0; i < 3; i++) { var px = 4 + i * 6, py = d - 3; bx(g, o, px, py, 1.6, 1.6, DFL, 3, '#ff7a2f', '#c25418', '#e0661f'); }
    if (o.crane) craneMast(g, o, o.crane[0], o.crane[1], o.crane[2]);
  };
  var LOOKS = {}, CL_E = {}, CLOSED = {}, OPEN_SIG = '';
  function clKey() { return keepData().key + '|' + W.PLOTS.length + '|' + OPEN_SIG; }
  function openSig() { var s = ''; for (var i = 0; i < W.DISTRICTS.length; i++) s += QT.G.roomOpen(W.DISTRICTS[i].id) ? '1' : '0'; return s; }
  function realArt(p) { return isDeco(p) || p.kind === 'landmark' || p.kind === 'station'; }
  function liveNow(q) {
    var G = QT.G;
    if (q.tag === 'open') return !G.roomOpen(q.ref.id);
    if (q.tag === 'pad') { var rm = q.ref && q.ref.p ? q.ref.p.room : W.roomAt(q.tx, q.ty); return !rm || rm === 'ave' || !!G.roomOpen(rm); }
    return !!(q.ref && G.roomOpen(q.ref.district));
  }
  function coversLive(sil) {
    var cov = keepCovers(sil, 2);
    for (var i = 0; i < cov.length; i++) if (liveNow(cov[i])) return true;
    return false;
  }
  function capLive(p, want, min) {
    function hit(h) { return coversLive([[p.x * T, p.y * T, p.w * T, p.h * T, DFL, DFL + h]]); }
    if (!hit(want)) return want;
    if (hit(min)) return -1;
    var lo = min, hi = want;
    while (hi - lo > 2) { var mid = Math.floor((lo + hi) / 2); if (hit(mid)) hi = mid; else lo = mid; }
    return lo;
  }
  function closedOf(p, crane) {
    var kk = clKey(), lk = LOOKS[p.id] || LOOKS[p.kind] || null, extra = lk && lk.keyOf ? lk.keyOf(p) : '';
    var e = CL_E[p.id];
    if (e && e.kk === kk && e.extra === extra) return e;
    var seed = hashOf(p.id), a = Math.min(p.w, p.h), b = Math.max(p.w, p.h);
    var name, want, min;
    if (lk) { name = 'look'; want = lk.want[0] + (seed % 5) / 4 * (lk.want[1] - lk.want[0]); min = lk.min || 12; }
    else {
      name = crane || (p.reserve && seed % 3 === 0) ? 'site' : (seed % 4 === 0 ? 'site' : 'shell');
      want = Math.max(22, Math.min(64, 14 + 5 * a + 1.6 * b)); min = 12;
    }
    var top = capLive(p, Math.round(want), min);
    if (top < 0) { name = 'lot'; top = 8; }
    var w = p.w * T, d = p.h * T, cr = null;
    if (crane && (name === 'site' || name === 'lot' || (lk && lk.crane))) {
      var mast = top < 20 ? 46 : top + 30, mx = 5, my = 5;
      if (!coversLive([[p.x * T + mx - 8, p.y * T + my - 8, 16, 16, DFL, DFL + mast + 14]])) cr = [mx, my, mast];
    }
    var lift = cr ? Math.max(26, cr[2] + 14 - top) : 26;
    var pal = { wall: CL_PAL[p.room] || CL_PAL.otemachi };
    e = CL_E[p.id] = {
      kk: kk, extra: extra, name: name, top: top, w: w, d: d, crane: cr, seed: seed,
      key: 'cl:' + p.room + ':' + name + ':' + p.w + 'x' + p.h + ':' + top + ':' + (seed % 3) + (cr ? ':c' : '') + (CL_SAW[p.kind] ? ':s' : '') + (lk ? ':' + p.id + ':' + extra : ''),
      bb: [-d * A - 4, -(DFL + top + lift), (w + d) * A + 8, (w + d) * B + DFL + top + lift + 6],
      lit: !(lk && lk.lit === false)
    };
    var o = { w: w, d: d, top: top, v: seed % 3, seed: seed, pal: pal, p: p, lit: false, dist: p.room, name: name, saw: !!CL_SAW[p.kind], crane: cr };
    var oN = {}; Object.keys(o).forEach(function (k) { oN[k] = o[k]; }); oN.lit = true;
    var paint = lk ? lk.paint : PAINT[name];
    e.fn = function (g) { paint(g, o); g.globalCompositeOperation = 'source-over'; };
    e.fnN = function (g) { paint(g, oN); g.globalCompositeOperation = 'source-over'; };
    return e;
  }
  function runList(type, key, args) {
    var R = QT.Art.reg && QT.Art.reg[type], list = R && R[key], dis = QT.Art.disabled || {};
    if (!list) return null;
    var drew = false;
    for (var i = 0; i < list.length; i++) {
      var fn = list[i];
      if (fn.__scope && dis[fn.__scope]) continue;
      try { if (fn.apply(null, args) !== false) drew = true; }
      catch (er) {
        var tag = 'tokyo/closed:' + (fn.__scope || '') + ':' + type + ':' + key;
        if (QT.Art.errors && !QT.Art.errors[tag]) { QT.Art.errors[tag] = String((er && er.stack) || er); if (window.console) console.error('[art] ' + tag, er); }
      }
    }
    return drew;
  }
  function runArt(p, S, H) {
    var st = S.p && S.p[p.id], type = isDeco(p) || (st && st.owned) ? 'plot' : 'unowned', args = [p, S, H];
    var r = runList(type, p.id, args);
    if (r === null) r = runList(type, p.kind, args);
    if (r === null && type === 'unowned') { r = runList('plot', p.id, args); if (r === null) r = runList('plot', p.kind, args); }
    if (!r && isDeco(p) && H.decoStyle) r = runList('deco', H.decoStyle(p), args);
    return !!r;
  }
  var CUR = { S: null, H: null };
  function closedItems(d) {
    var kk = clKey(), e = CLOSED[d.id];
    if (e && e.kk === kk) return e.items;
    var list = W.PLOTS.filter(function (p) { return p.room === d.id; });
    (W.RESERVES || []).forEach(function (r) {
      if ((r.district || r.room) !== d.id || W.BY_ID[r.id]) return;
      list.push({ id: 'rsv_' + r.id, kind: 'reserve', room: d.id, x: r.x, y: r.y, w: r.w, h: r.h, reserve: true });
    });
    var big = list.filter(function (p) { return !realArt(p) && !(LOOKS[p.id] || LOOKS[p.kind]) || (LOOKS[p.id] || LOOKS[p.kind] || {}).crane; })
      .sort(function (a, b) { return b.w * b.h - a.w * a.h || a.x - b.x; });
    var cranes = {}, nc = list.length > 14 ? 2 : 1;
    for (var i = 0; i < big.length && i < nc; i++) cranes[big[i].id] = true;
    var items = list.map(function (p) {
      var x = p.x * T, y = p.y * T, w = p.w * T, dd = p.h * T, real = realArt(p) && !p.reserve;
      var it = { p: p, real: real, crane: !!cranes[p.id], sx: X(x, y), sy: Y(x, y, 0) };
      it.bb0 = [X(x, y + dd) - 6, Y(x, y, 260), X(x + w, y) + 6, Y(x + w, y + dd, 0) + 4];
      it.e = { x: x, y: y, w: w, h: dd, draw: function () { drawClosed(it); } };
      return it;
    });
    CLOSED[d.id] = { kk: kk, items: items };
    return items;
  }
  function drawClosed(it) {
    var S = CUR.S, H = CUR.H, c = H.ctx, p = it.p;
    if (it.real) { withSignHole(c, p.room, it.bb0, function () { runArt(p, S, H); }); return; }
    var e = closedOf(p, it.crane), x = p.x * T, y = p.y * T, ox = it.sx, oy = it.sy;
    var bb = [ox + e.bb[0], oy + e.bb[1], ox + e.bb[0] + e.bb[2], oy + e.bb[1] + e.bb[3]];
    if (!vis(bb[0], bb[1], bb[2], bb[3])) return;
    var ga = c.globalAlpha, a = e.top > 14 ? fade('cl' + p.id, S, x, y, x + e.w, y + e.d, e.top + DFL) : 1;
    withSignHole(c, p.room, bb, function () {
      c.globalAlpha = ga * a;
      sprite(c, e.key, e.bb[0], e.bb[1], e.bb[2], e.bb[3], e.fn, ox, oy, 2);
      var nt = Math.max(0, Math.min(1, +H.night || 0));
      if (nt > 0.02 && e.lit) { c.globalAlpha = ga * a * nt; sprite(c, e.key + ':n', e.bb[0], e.bb[1], e.bb[2], e.bb[3], e.fnN, ox, oy, 1); }
      if (e.crane) {
        var cx = x + e.crane[0], cy = y + e.crane[1], ht = DFL + e.crane[2] + 4;
        var hx = X(cx, cy), hy = Y(cx, cy, ht);
        c.globalAlpha = ga * a;
        craneArm(c, hx, hy, S.t + e.seed % 13, Math.min(34, 14 + e.w * 0.3));
        if (Math.sin(S.t * 2.4 + e.seed) > 0.2) { c.fillStyle = '#ff3b4f'; c.fillRect(hx - 1, hy - 4, 2, 2); }
      }
    });
    c.globalAlpha = ga;
  }
  W.DISTRICTS.forEach(function (d) {
    on('scene', d.id, function (r, S, H, push) {
      if (H.G.roomOpen(r.id)) return;
      CUR.S = S; CUR.H = H; setView(H);
      var items = closedItems(r);
      for (var i = 0; i < items.length; i++) {
        var it = items[i], bb = it.bb0;
        if (!vis(bb[0], bb[1], bb[2], bb[3])) continue;
        var e = it.e, p = it.p; e.x = p.x * T; e.y = p.y * T; e.w = p.w * T; e.h = p.h * T;
        push(e);
      }
    });
  });
  on('ground', function (S, H) {
    setView(H);
    OPEN_SIG = openSig();
    signFrame(S, H);
    var c = H.ctx;
    for (var i = 0; i < W.DISTRICTS.length; i++) {
      var d = W.DISTRICTS[i];
      if (H.G.roomOpen(d.id) || !d.roads || !d.roads.length) continue;
      var x0 = (d.ix + 1) * T, x1 = (d.ix + d.iw - 1) * T;
      if (!vis(X(x0, (d.iy + d.ih) * T), Y(x0, d.iy * T, 0) - 4, X(x1, d.iy * T), Y(x1, (d.iy + d.ih) * T, 0) + 4)) continue;
      c.fillStyle = '#cdc8bd'; c.beginPath();
      d.roads.forEach(function (rd) { quad(c, x0, rd.y * T, x1, (rd.y + rd.h) * T, DFL + 0.15); });
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.8; c.setLineDash([5, 5]); c.beginPath();
      d.roads.forEach(function (rd) { var ym = (rd.y + rd.h / 2) * T; mv(c, x0 + 4, ym, DFL + 0.2); ln(c, x1 - 4, ym, DFL + 0.2); });
      c.stroke(); c.setLineDash([]);
    }
  });
  var RSV = {};
  function rsvItems(dist) {
    var spec = RSV[dist], kk = keepData().key + '|' + W.PLOTS.length;
    if (!spec) return [];
    if (spec.kk === kk) return spec.items;
    spec.kk = kk; spec.items = [];
    (W.RESERVES || []).forEach(function (r) {
      var q = spec.ids[r.id];
      if (!q || W.BY_ID[r.id] || (r.district || r.room) !== dist) return;
      var p = { id: 'rsv_' + r.id, kind: 'reserve', room: dist, x: r.x, y: r.y, w: r.w, h: r.h, reserve: true };
      var big = q.crane && r.w * r.h >= 24, want = big ? Math.min(40, 10 + r.w * 3) : 8;
      var top = big ? capTop(p, want, 12) : 8, name = top < 0 || !big ? 'lot' : 'site';
      if (top < 0) top = 8;
      var w = r.w * T, d = r.h * T, cr = null;
      if (name === 'site' && !keepCovers([[r.x * T - 3, r.y * T - 3, 16, 16, DFL, DFL + top + 44]], 2).length) cr = [5, 5, top + 30];
      var o = { w: w, d: d, top: top, v: 0, seed: hashOf(r.id), pal: { wall: CL_PAL[dist] || CL_PAL.otemachi }, p: p, lit: false, dist: dist, name: name, crane: cr };
      var lift = cr ? cr[2] + 18 - top : 26, x = r.x * T, y = r.y * T;
      var it = { r: r, q: q, o: o, top: top, cr: cr, sx: X(x, y), sy: Y(x, y, 0), seed: o.seed,
                 key: 'rsv:' + r.id + ':' + name + ':' + top + (cr ? ':c' : ''),
                 bb: [-d * A - 4, -(DFL + top + lift), (w + d) * A + 8, (w + d) * B + DFL + top + lift + 6],
                 fn: function (g) { PAINT[name](g, o); rsvFence(g, o); g.globalCompositeOperation = 'source-over'; } };
      it.e = { x: x, y: y, w: w, h: d, draw: function () { drawRsv(it); } };
      spec.items.push(it);
    });
    return spec.items;
  }
  function rsvFence(g, o) {
    var w = o.w, d = o.d, fh = 7;
    bx(g, o, 1, 1, w - 2, 1.2, DFL, fh, '#f4f6fb', '#d8dce8', '#e6e9f2');
    bx(g, o, 1, 1, 1.2, d - 2, DFL, fh, '#f4f6fb', '#d8dce8', '#e6e9f2');
    bx(g, o, w - 2.2, 1, 1.2, d - 2, DFL, fh, '#f4f6fb', '#d8dce8', '#e6e9f2');
    if (o.lit) return;
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = '#2f6fe0'; g.lineWidth = 1; g.beginPath();
    g.moveTo(X(w - 1, 1), Y(w - 1, 1, DFL + fh - 2)); g.lineTo(X(w - 1, d - 1), Y(w - 1, d - 1, DFL + fh - 2));
    g.stroke();
    g.strokeStyle = 'rgba(230,233,242,0.95)'; g.lineWidth = 0.8; g.beginPath();
    g.moveTo(X(2, d - 1.5), Y(2, d - 1.5, DFL + 3)); g.lineTo(X(w - 2, d - 1.5), Y(w - 2, d - 1.5, DFL + 3));
    for (var k = 3; k < w - 3; k += 6) { g.moveTo(X(k, d - 1.5), Y(k, d - 1.5, DFL)); g.lineTo(X(k, d - 1.5), Y(k, d - 1.5, DFL + 3.5)); }
    g.stroke();
  }
  function drawRsv(it) {
    var S = CUR.S, H = CUR.H, c = H.ctx, r = it.r, ga = c.globalAlpha;
    var x = r.x * T, y = r.y * T;
    c.globalAlpha = ga * (it.top > 14 ? fade('rsv' + r.id, S, x, y, x + r.w * T, y + r.h * T, it.top + DFL) : 1);
    sprite(c, it.key, it.bb[0], it.bb[1], it.bb[2], it.bb[3], it.fn, it.sx, it.sy, 2);
    if (it.cr) {
      var cx = x + it.cr[0], cy = y + it.cr[1], hx = X(cx, cy), hy = Y(cx, cy, DFL + it.cr[2] + 4);
      craneArm(c, hx, hy, S.t + it.seed % 13, Math.min(34, 14 + r.w * 4));
      if (Math.sin(S.t * 2.4 + it.seed) > 0.2) { c.fillStyle = '#ff3b4f'; c.fillRect(hx - 1, hy - 4, 2, 2); }
    }
    if (it.q.label) {
      var mx = x + r.w * T * 0.5, my = y + r.h * T;
      label(c, it.q.label, X(mx, my), Y(mx, my, DFL + 10), 5.5, 'rgba(60,50,40,0.9)');
    }
    c.globalAlpha = ga;
  }
  function reserveLots(dist, ids) {
    var first = !RSV[dist];
    RSV[dist] = { ids: ids, kk: '', items: [] };
    if (!first) return;
    on('scene', dist, function (r, S, H, push) {
      if (!H.G.roomOpen(dist)) return;
      CUR.S = S; CUR.H = H; setView(H);
      var items = rsvItems(dist);
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!vis(it.sx + it.bb[0], it.sy + it.bb[1], it.sx + it.bb[0] + it.bb[2], it.sy + it.bb[1] + it.bb[3])) continue;
        var e = it.e, rr = it.r; e.x = rr.x * T; e.y = rr.y * T; e.w = rr.w * T; e.h = rr.h * T;
        push(e);
      }
    });
  }
  function decoDistrict(id, tbl) { DECO[id] = tbl; delete DECO_ASSIGN[id]; }
  function capApi() { return QT.Sim && QT.Sim.captable; }
  function sameVc(v, id) { if (v == null) return false; if (typeof v === 'object') v = v.id; return v === id || v === 'vc_' + id || 'vc_' + v === id; }
  var CAPP = {};
  var VCX = {
    mood: function (id) {
      var C = capApi(), m = null;
      try { m = C && (C.mood ? C.mood(id) : C.vcMood ? C.vcMood(id) : null); } catch (er) { m = null; }
      return typeof m === 'number' && isFinite(m) ? m : null;
    },
    sheet: function (id) {
      var C = capApi(), list = null;
      try { list = C && C.sheets ? C.sheets() : null; } catch (er) { list = null; }
      if (!list || !list.length) return null;
      for (var i = 0; i < list.length; i++) { var q = list[i]; if (q && (sameVc(q.vc, id) || sameVc(q.investor, id) || sameVc(q.firm, id) || sameVc(q.from, id))) return q; }
      return null;
    },
    rounds: function (S, id) {
      var r = S.cap && S.cap.rounds, n = 0;
      if (!r || !r.length) return 0;
      for (var i = 0; i < r.length; i++) if (r[i] && (sameVc(r[i].investor, id) || sameVc(r[i].vc, id))) n++;
      return n;
    },
    decor: function (c, S, id, lx, ly, rx, ry, sx, sy) {
      var m = VCX.mood(id), i;
      if (m != null && lx != null) {
        var k = Math.max(0, Math.min(1, (m - 0.8) / 0.45)), col = 'hsl(' + Math.round(k * 120) + ',85%,55%)';
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(lx, ly, 3.4, 0, 7); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(lx, ly, 2.1, 0, 7); c.fill();
        c.strokeStyle = INK; c.lineWidth = 0.5; c.stroke();
      }
      var n = Math.min(5, VCX.rounds(S, id));
      if (n && sx != null) {
        c.fillStyle = '#ffd23f'; c.strokeStyle = INK; c.lineWidth = 0.5;
        for (i = 0; i < n; i++) {
          var cx = sx + (i - (n - 1) / 2) * 6, cy = sy;
          c.beginPath();
          for (var j = 0; j < 10; j++) { var r = j % 2 ? 1.2 : 2.6, a = -Math.PI / 2 + j * Math.PI / 5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
          c.closePath(); c.fill(); c.stroke();
        }
      }
      if (rx != null && VCX.sheet(id)) {
        var bob = Math.abs(Math.sin(S.t * 4)) * 4, ex = rx, ey = ry - 6 - bob;
        c.fillStyle = 'rgba(255,215,80,0.35)'; c.beginPath(); c.arc(ex, ey, 9, 0, 7); c.fill();
        c.fillStyle = '#ffffff'; c.fillRect(ex - 6, ey - 4, 12, 8);
        c.strokeStyle = INK; c.lineWidth = 0.7; c.strokeRect(ex - 6, ey - 4, 12, 8);
        c.beginPath(); c.moveTo(ex - 6, ey - 4); c.lineTo(ex, ey + 1); c.lineTo(ex + 6, ey - 4); c.stroke();
        c.fillStyle = '#e2504a'; c.beginPath(); c.arc(ex, ey + 1, 1.6, 0, 7); c.fill();
      }
    }
  };
  var LIT = { k: 0, n: 0, recs: [], gn: 0, glows: [], cv: null, g: null, w: 0, h: 0, used: 0 };
  var LIT_PLOT_H = 64;
  function litQuality() {
    try { var q = window.QTDEBUG && window.QTDEBUG.quality && window.QTDEBUG.quality(); return q && typeof q.quality === 'number' ? q.quality : 1; }
    catch (e) { return 1; }
  }
  function litBegin(H) {
    LIT.n = 0; LIT.gn = 0;
    var nt = +H.night || 0;
    LIT.k = nt > 0.02 && LIT.mode !== 'off' ? Math.min(1, nt) : 0;
    var q = litQuality();
    LIT.crisp = LIT.k > 0 && LIT.mode !== 'glow' && q >= 0.8;
    LIT.lite = q < 0.8;
  }
  function litRec(kind, a, fx, fy, fw, fd) {
    if (!LIT.crisp || !(a > 0.01)) return null;
    var r = LIT.recs[LIT.n] || (LIT.recs[LIT.n] = {});
    LIT.n++;
    r.kind = kind; r.a = a; r.cv = null; r.fn = null; r.after = null;
    if (fx != null) { r.fx = fx; r.fy = fy; r.fw = fw; r.fd = fd; r.foot = true; } else r.foot = false;
    return r;
  }
  function litSpr(e, ox, oy, a, cut, fx, fy, fw, fd) {
    if (!e) return;
    var r = litRec(cut ? 'cut' : 'img', a, fx, fy, fw, fd);
    if (!r) return;
    r.cv = e.cv; r.dx = e.bx + ox - 1 / e.sc; r.dy = e.by + oy - 1 / e.sc; r.dw = e.cv.width / e.sc; r.dh = e.cv.height / e.sc;
  }
  function litGlow(kind, x, y, rx, ry, col, a) {
    if (!(LIT.k > 0) || !(a > 0.01) || (LIT.lite && kind === 'pool')) return;
    var r = LIT.glows[LIT.gn] || (LIT.glows[LIT.gn] = {});
    LIT.gn++;
    r.kind = kind; r.x = x; r.y = y; r.rx = rx; r.ry = ry; r.col = col; r.a = a;
  }
  var GLOW_SPR = {};
  function glowSprite(col) {
    var cv = GLOW_SPR[col];
    if (cv) return cv;
    cv = GLOW_SPR[col] = document.createElement('canvas');
    cv.width = cv.height = 64;
    var g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, col); gr.addColorStop(0.35, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.globalCompositeOperation = 'source-atop';
    var gr2 = g.createRadialGradient(32, 32, 0, 32, 32, 10);
    gr2.addColorStop(0, 'rgba(255,255,255,0.55)'); gr2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr2; g.fillRect(0, 0, 64, 64);
    return cv;
  }
  var LIT_PL = [];
  function litPlots(H, S) {
    LIT_PL.length = 0;
    var G = QT.G, x0 = VW.x0, x1 = VW.x1, y0 = VW.y0, y1 = VW.y1;
    for (var i = 0; i < W.PLOTS.length; i++) {
      var p = W.PLOTS[i];
      if (isDeco(p) || !G.roomOpen(p.room)) continue;
      var h = p.open ? 24 : (S.p[p.id] && S.p[p.id].owned ? LIT_PLOT_H : 0);
      if (!h) continue;
      var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
      var bx0 = X(x, y + d), bx1 = X(x + w, y), by0 = Y(x, y, DFL + h), by1 = Y(x + w, y + d, 0);
      if (bx1 < x0 || bx0 > x1 || by1 < y0 || by0 > y1) continue;
      LIT_PL.push({ x: x, y: y, w: w, d: d, h: DFL + h, bx0: bx0, bx1: bx1, by0: by0, by1: by1 });
    }
  }
  function litPrism(g, q) {
    g.beginPath();
    g.moveTo(X(q.x, q.y + q.d), Y(q.x, q.y + q.d, 0)); g.lineTo(X(q.x + q.w, q.y + q.d), Y(q.x + q.w, q.y + q.d, 0));
    g.lineTo(X(q.x + q.w, q.y), Y(q.x + q.w, q.y, 0)); g.lineTo(X(q.x + q.w, q.y), Y(q.x + q.w, q.y, q.h));
    g.lineTo(X(q.x, q.y), Y(q.x, q.y, q.h)); g.lineTo(X(q.x, q.y + q.d), Y(q.x, q.y + q.d, q.h));
    g.closePath(); g.fill();
  }
  function litReplay(S, H) {
    var k = LIT.k;
    if (!(k > 0)) return;
    var c = H.ctx, z = H.z, cam = H.cam, W2 = H.cssW, H2 = H.cssH, i, r;
    function sx(x) { return (x - cam.x) * z + W2 / 2; }
    function sy(y) { return (y - cam.y) * z + H2 / 2; }
    if (LIT.gn) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (i = 0; i < LIT.gn; i++) {
        r = LIT.glows[i];
        var gx = sx(r.x), gy = sy(r.y), rx = r.rx * z, ry = r.ry * z;
        if (gx + rx < 0 || gx - rx > W2 || gy + ry < 0 || gy - ry > H2) continue;
        c.globalAlpha = Math.min(1, r.a * k);
        c.drawImage(glowSprite(r.col), gx - rx, gy - ry, rx * 2, ry * 2);
      }
      c.restore();
    }
    if (!LIT.n) return;
    var LS = 0.5;
    var bw = Math.max(1, Math.ceil(W2 * LS)), bh = Math.max(1, Math.ceil(H2 * LS));
    if (!LIT.cv) { LIT.cv = document.createElement('canvas'); LIT.g = LIT.cv.getContext('2d'); }
    if (LIT.w !== bw || LIT.h !== bh) { LIT.cv.width = LIT.w = bw; LIT.cv.height = LIT.h = bh; }
    var g = LIT.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, bw, bh);
    g.setTransform(z * LS, 0, 0, z * LS, (W2 / 2 - cam.x * z) * LS, (H2 / 2 - cam.y * z) * LS);
    setView(H);
    litPlots(H, S);
    for (var p = 0; p < LIT_PL.length; p++) {
      var q = LIT_PL[p], at = -1;
      for (i = LIT.n - 1; i >= 0; i--) {
        r = LIT.recs[i];
        if (!r.foot || r.kind === 'cut') continue;
        if (!(q.x >= r.fx + r.fw - 0.5 || q.y >= r.fy + r.fd - 0.5)) continue;
        if (r.cv && (r.dx > q.bx1 || r.dx + r.dw < q.bx0 || r.dy > q.by1 || r.dy + r.dh < q.by0)) continue;
        at = i; break;
      }
      if (at >= 0) (LIT.recs[at].after || (LIT.recs[at].after = [])).push(q);
    }
    g.fillStyle = '#000';
    for (i = 0; i < LIT.n; i++) {
      r = LIT.recs[i];
      g.globalAlpha = Math.min(1, r.a);
      if (r.kind === 'cut') { g.globalCompositeOperation = 'destination-out'; if (r.cv) g.drawImage(r.cv, r.dx, r.dy, r.dw, r.dh); }
      else {
        g.globalCompositeOperation = 'source-over';
        if (r.cv) g.drawImage(r.cv, r.dx, r.dy, r.dw, r.dh);
        else if (r.fn) { g.save(); try { r.fn(g); } catch (er) { } g.restore(); }
      }
      if (r.after) {
        g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1;
        for (var a2 = 0; a2 < r.after.length; a2++) litPrism(g, r.after[a2]);
        r.after = null;
      }
    }
    g.setTransform(LS, 0, 0, LS, 0, 0);
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1;
    if (S.player && H.toScreen) {
      var ps = H.toScreen(S.player.x, S.player.y, 0), nc = S.player.carry ? S.player.carry.length : 0;
      var up = (nc ? 38 + (nc - 1) * 12 : 28) * z;
      g.fillRect(ps.x - 10 * z, ps.y - up - 2 * z, 20 * z, up + 7 * z);
    }
    g.globalCompositeOperation = 'source-over';
    c.save();
    c.globalAlpha = k;
    c.drawImage(LIT.cv, 0, 0, W2, H2);
    c.restore();
    LIT.used = LIT.n;
  }
  on('night', function (S, H) { litReplay(S, H); });
  QT.Art.lit = {
    k: function () { return LIT.k; },
    crisp: function () { return !!LIT.crisp; },
    fn: function (draw, a, foot) { var r = foot ? litRec('img', a == null ? 1 : a, foot[0], foot[1], foot[2], foot[3]) : litRec('img', a == null ? 1 : a); if (r) r.fn = draw; },
    cut: function (draw) {
      var r = litRec('cut', 1);
      if (!r) return;
      r.kind = 'img'; r.fn = function (g) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; draw(g); };
    },
    spr: function (key, ox, oy, a, cut) { if (LIT.crisp) litSpr(SPR[key], ox, oy, a == null ? 1 : a, !!cut); },
    glow: function (x, y, rr, col, a) { litGlow('glow', x, y, rr, rr, col, a); },
    pool: function (x, y, rx, ry, col, a) { litGlow('pool', x, y, rx, ry, col, a); },
    stats: function () { return { k: LIT.k, crisp: !!LIT.crisp, recs: LIT.used, glows: LIT.gn, board: LIT.w * LIT.h }; },
    mode: function (m) { LIT.mode = m || 'all'; }
  };
  var FADE = {};
  function behind(x0, y0, x1, y1, h, px, py, ph) {
    var lo = Math.max(x0 - 3 - px, y0 - 3 - py, 0.01), hi = Math.min(x1 + 3 - px, y1 + 3 - py, (h - ph) / (2 * B));
    return lo <= hi;
  }
  function fade(key, S, x0, y0, x1, y1, h) {
    var px = S.player.x, py = S.player.y;
    var hit = behind(x0, y0, x1, y1, h, px, py, 4) || behind(x0, y0, x1, y1, h, px, py, 22);
    var k = FADE[key] == null ? 1 : FADE[key];
    k += ((hit ? 0.32 : 1) - k) * 0.22;
    if (Math.abs(k - 1) < 0.01) k = 1;
    FADE[key] = k;
    return k;
  }
  QT.Art.tokyo = { sprite: sprite, fade: fade, tree: function (c, wx, wy, v, base) { setViewFromRender(); tree(c, wx, wy, v || 0, base == null ? 3 : base); }, treeDraw: treeDraw,
    keep: { why: keepWhy, covers: keepCovers, live: keepLive, data: keepData, hex: hexOf, inHex: inHex },
    plotAlpha: plotAlpha,
    deco: { district: decoDistrict, isDeco: isDeco, paint: PAINT,
      top: function (p) { var e = isDeco(p) ? decoOf(p) : null; return e ? e.top : null; },
      style: function (p) { var e = isDeco(p) ? decoOf(p) : null; return e ? e.name : null; },
      stats: function () { var n = 0, px = 0; Object.keys(SPR).forEach(function (k) { if (k.indexOf('dco:') === 0) { n++; px += SPR[k].px; } }); return { n: n, px: px }; } },
    reserve: reserveLots,
    closed: { look: function (key, spec) { LOOKS[key] = spec; CL_E = {}; CLOSED = {}; }, craneArm: craneArm,
      signs: function () { return SIGN_ALL; },
      hole: function (c, bb, draw) { withSignHole(c, null, bb, draw); },
      items: function (id) {
        var d = W.DIST[id]; if (!d) return [];
        return closedItems(d).map(function (it) {
          var e = it.real ? null : closedOf(it.p, it.crane);
          return { id: it.p.id, kind: it.p.kind, real: it.real, look: e ? e.name : 'art', top: e ? e.top : null, crane: !!(e && e.crane) };
        });
      } },
    vc: VCX,
    capPlot: function (p, hs) {
      var kd = keepData(), e = CAPP[p.id];
      if (e && e.key === kd.key && e.hs === hs) return e.top;
      var top = hs[hs.length - 1];
      for (var i = 0; i < hs.length; i++) {
        var cov = keepCovers([[p.x * T + 2, p.y * T + 2, p.w * T - 4, p.h * T - 4, 3, 3 + hs[i]]], 2);
        var bad = false;
        for (var j = 0; j < cov.length && !bad; j++) if (!(cov[j].tag === 'pad' && cov[j].ref && cov[j].ref.p === p)) bad = true;
        if (!bad) { top = hs[i]; break; }
      }
      CAPP[p.id] = { key: kd.key, hs: hs, top: top };
      return top;
    },
    parked: function () { buildSegs(); return PARKED; },
    aveItems: function () { buildSegs(); var n = 0; SEGS.forEach(function (sg) { n += sg.items.length; }); return n; },
    stats: function () {
      var n = 0, px = 0, by = {};
      Object.keys(SPR).forEach(function (k) {
        var a = SPR[k].cv.width * SPR[k].cv.height, g = k.replace(/[0-9.:x|]+.*$/, '');
        n++; px += a; by[g] = (by[g] || 0) + a;
      });
      return { n: n, px: px, regen: SPR_REGEN, by: by, limit: SPR_LIMIT };
    } };
  function setViewFromRender() { if (QT.Render && QT.Render.H) setView(QT.Render.H); }
})(window.QT || (window.QT = {}));
