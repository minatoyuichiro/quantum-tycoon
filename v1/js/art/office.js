(function (QT) {
  'use strict';
  var on = QT.Art.scope('office');
  var I = QT.Iso, W = QT.World, A = I.A, B = I.B, T = 16;
  var FL = 4;
  var RX = A * Math.SQRT2, RY = B * Math.SQRT2;
  QT.L.add({
    office_yourDesk: ['あなたの席', 'YOUR DESK'],
    office_forRent:  ['テナント募集', 'FOR RENT'],
    office_closed:   ['準備中', 'CLOSED']
  });
  function cl(v) { return v < 0 ? 0 : v > 255 ? 255 : Math.round(v); }
  function rgb(c) { var n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hex3(r, g, b) { return '#' + ((1 << 24) | (cl(r) << 16) | (cl(g) << 8) | cl(b)).toString(16).slice(1); }
  function mix(a, b, k) {
    var p = rgb(a), q = rgb(b);
    return hex3(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k);
  }
  function sh(a, d) { var p = rgb(a); return hex3(p[0] + d, p[1] + d, p[2] + d); }
  function rgba(a, al) { var p = rgb(a); return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + al + ')'; }
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function sx(x, y) { return (x - y) * A; }
  function sy(x, y, h) { return (x + y) * B - h; }
  function frac(v) { return v - Math.floor(v); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  var GEO = {}, gid = 0;
  function geo(x, y, w, h, r) {
    var key = Math.round(x * 4) + ',' + Math.round(y * 4) + ',' + Math.round(w * 4) + ',' + Math.round(h * 4) + ',' + Math.round(r * 4);
    var g = GEO[key];
    if (g) return g;
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    var cs = [[x + r, y + r, 1], [x + w - r, y + r, 1.5], [x + w - r, y + h - r, 0], [x + r, y + h - r, 0.5]];
    var X = [], Y = [], WX = [], WY = [], i;
    for (var ci = 0; ci < 4; ci++) {
      for (var k = 0; k <= 4; k++) {
        var a = (cs[ci][2] + k / 8) * Math.PI;
        var wx = cs[ci][0] + Math.cos(a) * r, wy = cs[ci][1] + Math.sin(a) * r;
        WX.push(wx); WY.push(wy); X.push((wx - wy) * A); Y.push((wx + wy) * B);
      }
    }
    var seg = [], tot = 0;
    for (i = 7; i < 17; i++) { var d = Math.hypot(WX[i + 1] - WX[i], WY[i + 1] - WY[i]); seg.push(d); tot += d; }
    var LX = [], LY = [], n = Math.max(2, Math.round(tot / 5.5));
    for (var j = 0; j <= n; j++) {
      var s = tot * j / n, si = 0;
      while (si < seg.length - 1 && s > seg[si]) { s -= seg[si]; si++; }
      var f = seg[si] ? Math.min(1, s / seg[si]) : 0;
      var px = WX[7 + si] + (WX[8 + si] - WX[7 + si]) * f, py = WY[7 + si] + (WY[8 + si] - WY[7 + si]) * f;
      LX.push((px - py) * A); LY.push((px + py) * B);
    }
    g = { id: ++gid, X: X, Y: Y, LX: LX, LY: LY, x: x, y: y, w: w, h: h, r: r, cx: x + w / 2, cy: y + h / 2 };
    GEO[key] = g;
    return g;
  }
  function inset(g, d) { return geo(g.x + d, g.y + d, g.w - d * 2, g.h - d * 2, Math.max(0, g.r - d)); }
  function side(c, g, h0, h1) {
    var X = g.X, Y = g.Y, i;
    c.beginPath(); c.moveTo(X[7], Y[7] - h0);
    for (i = 8; i <= 17; i++) c.lineTo(X[i], Y[i] - h0);
    for (i = 17; i >= 7; i--) c.lineTo(X[i], Y[i] - h1);
    c.closePath();
  }
  function top(c, g, h) {
    var X = g.X, Y = g.Y;
    c.beginPath(); c.moveTo(X[0], Y[0] - h);
    for (var i = 1; i < 20; i++) c.lineTo(X[i], Y[i] - h);
    c.closePath();
  }
  function chain(c, g, h) {
    var X = g.X, Y = g.Y;
    c.moveTo(X[7], Y[7] - h);
    for (var i = 8; i <= 17; i++) c.lineTo(X[i], Y[i] - h);
  }
  var GR = {};
  function sgrad(c, g, cL, cR) {
    var key = 's' + g.id + cL + cR, gr = GR[key];
    if (gr) return gr;
    var x0 = g.X[17], x1 = g.X[7], sp = (x1 - x0) || 1;
    var tA = clamp01((g.X[14] - x0) / sp), tB = Math.max(tA, clamp01((g.X[10] - x0) / sp));
    gr = c.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, sh(cL, -22));
    gr.addColorStop(tA * 0.55, cL);
    gr.addColorStop(tA, sh(cL, 12));
    gr.addColorStop(tB, cR);
    gr.addColorStop(tB + (1 - tB) * 0.4, sh(cR, 24));
    gr.addColorStop(1, sh(cR, -6));
    GR[key] = gr;
    return gr;
  }
  function vgrad(c, key, y0, y1, stops) {
    var gr = GR[key];
    if (gr) return gr;
    gr = c.createLinearGradient(0, y0, 0, y1);
    for (var i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]);
    GR[key] = gr;
    return gr;
  }
  function rgrad(c, key, x, y, r, stops) {
    var gr = GR[key];
    if (gr) return gr;
    gr = c.createRadialGradient(x, y, 0, x, y, r);
    for (var i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]);
    GR[key] = gr;
    return gr;
  }
  function prism(c, g, h0, h1, cL, cR, cTop) {
    c.fillStyle = sgrad(c, g, cL, cR); side(c, g, h0, h1); c.fill();
    if (cTop) { c.fillStyle = cTop; top(c, g, h1); c.fill(); }
  }
  function shadowAt(c, x, y, w, h, r, a) {
    c.fillStyle = 'rgba(46,40,78,' + a + ')'; top(c, geo(x + 3, y + 3, w - 2, h - 2, r), FL + 0.05); c.fill();
  }
  function vqY(c, x0, x1, y, h0, h1) {
    c.beginPath();
    c.moveTo(sx(x0, y), sy(x0, y, h0)); c.lineTo(sx(x1, y), sy(x1, y, h0));
    c.lineTo(sx(x1, y), sy(x1, y, h1)); c.lineTo(sx(x0, y), sy(x0, y, h1)); c.closePath();
  }
  function vqX(c, x, y0, y1, h0, h1) {
    c.beginPath();
    c.moveTo(sx(x, y0), sy(x, y0, h0)); c.lineTo(sx(x, y1), sy(x, y1, h0));
    c.lineTo(sx(x, y1), sy(x, y1, h1)); c.lineTo(sx(x, y0), sy(x, y0, h1)); c.closePath();
  }
  function disc(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 7); }
  function twinkle(c, x, y, r, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
    c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r);
    c.fill();
  }
  function pill(c, x, y, w, h, fill, stroke, lw) {
    var r = Math.min(h / 2, w / 2);
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function font(c, px, H, w) { c.font = (w || 900) + ' ' + px + 'px ' + H.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; }
  var SPR = {}, SPR_N = 0;
  function sprScale(H, cap) {
    var s = H.z * (window.devicePixelRatio || 1);
    return Math.max(1.5, Math.min(cap || 4.5, Math.round(s * 2) / 2));
  }
  function cached(c, H, key, X0, Y0, X1, Y1, draw, ox, oy, cap) {
    var sc = sprScale(H, cap), k = key + '@' + sc, cv = SPR[k];
    if (!cv) {
      if (SPR_N > 160) { SPR = {}; SPR_N = 0; }
      cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil((X1 - X0) * sc)); cv.height = Math.max(1, Math.ceil((Y1 - Y0) * sc));
      var g = cv.getContext('2d');
      g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc);
      draw(g);
      SPR[k] = cv; SPR_N++;
    }
    c.drawImage(cv, X0 + (ox || 0), Y0 + (oy || 0), cv.width / sc, cv.height / sc);
  }
  function tree(c, wx, wy, s, t, seed, H) {
    var ss = Math.round(s * 20) / 20;
    cached(c, H, 'tree' + ss, -12 * ss, -30 * ss, 12 * ss, 3.5 * ss + 4, function (g) { treeDraw(g, 0, 0, ss, 0, 0); },
      sx(wx, wy), sy(wx, wy, 0), 4);
  }
  function treeDraw(c, wx, wy, s, t, seed) {
    var g = geo(wx - 5 * s, wy - 5 * s, 10 * s, 10 * s, 5 * s);
    shadowAt(c, wx - 5 * s, wy - 5 * s, 10 * s, 10 * s, 5 * s, 0.12);
    prism(c, g, FL, FL + 4.5 * s, '#d9dee8', '#ffffff', null);
    c.fillStyle = '#7a634a'; top(c, inset(g, 0.9), FL + 4.5 * s); c.fill();
    var bx = sx(wx, wy), by = sy(wx, wy, FL + 4.5 * s);
    c.fillStyle = '#8a6a48'; c.fillRect(bx - 0.9 * s, by - 11 * s, 1.8 * s, 11 * s);
    var sw = Math.sin(t * 1.1 + seed) * 0.6 * s, cy = by - 16 * s;
    c.fillStyle = '#3f9a55'; disc(c, bx + sw, cy, 7.2 * s); c.fill();
    c.fillStyle = '#56b765'; disc(c, bx - 2.6 * s + sw, cy - 1.8 * s, 5 * s); c.fill();
    disc(c, bx + 3 * s + sw, cy + 0.6 * s, 4.6 * s); c.fill();
    c.fillStyle = '#86d676'; disc(c, bx - 2.4 * s + sw, cy - 3.6 * s, 2.6 * s); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; disc(c, bx + 1.5 * s + sw, cy - 4.4 * s, 1.3 * s); c.fill();
  }
  var OFFICE_ONLY = { swjob: 1, acct: 1, hwasm: 1, pc: 1, desk: 1, hwlab: 1, staff: 1, qcloud: 1, supply: 1 };
  var PW = { last: null, seen: -1, t0: -1e9, first: 0 };
  function powerTick(S) {
    var onNow = !!(S.officeOn && S.officeOn());
    if (S.t < PW.seen - 0.5) PW.last = null;
    PW.seen = S.t;
    if (PW.last === false && onNow && S.t - PW.first > 3) PW.t0 = S.t;
    else if (PW.last === null) { PW.t0 = -1e9; PW.first = S.t; }
    PW.last = onNow;
    return onNow;
  }
  function powerDelay(p) {
    var o = W.BY_ID.office;
    return Math.hypot(p.x + p.w / 2 - o.x - o.w / 2, p.y + p.h / 2 - o.y - o.h / 2) * 0.09;
  }
  function isLit(S, p) {
    if (!OFFICE_ONLY[p.id]) return true;
    if (!powerTick(S)) return false;
    return S.t >= PW.t0 + powerDelay(p);
  }
  function flashK(S, p) {
    var d = S.t - PW.t0 - powerDelay(p);
    return d >= 0 && d < 1 ? d : -1;
  }
  function powerFlash(c, p, S, k, redraw) {
    var x = (p.x + p.w / 2) * T, y = (p.y + p.h / 2) * T, px = sx(x, y), py = sy(x, y, FL);
    if (redraw) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = (1 - k) * 0.6; redraw(); c.restore();
    }
    var rr = 12 + k * 42;
    c.strokeStyle = 'rgba(255,236,150,' + (1 - k).toFixed(2) + ')'; c.lineWidth = 0.6 + 2.6 * (1 - k);
    c.beginPath(); c.ellipse(px, py, rr * RX, rr * RY, 0, 0, 7); c.stroke();
    for (var i = 0; i < 5; i++) {
      c.globalAlpha = 1 - k;
      twinkle(c, px + (hash(p.x * 3 + i) - 0.5) * 40, py - 12 - k * 46 - i * 7, 2.8, i % 2 ? '#fff6c8' : '#ffffff');
    }
    c.globalAlpha = 1;
  }
  var BLD = {
    swjob: { acc: '#12b06a', glass: '#96efc8', crown: 'code', face: 'code', tower: [0.4, 0.25, 2.2, 1.85], r: 0.55,
             th: [30, 44], door: 2.6, sign: [1.5, 2.45], icon: 'code' },
    acct:  { acc: '#6c56f0', glass: '#cfc4ff', crown: 'yen', face: 'vault', tower: [0.2, 0.55, 2.3, 2.3], r: 1,
             th: [27, 7], door: 2.85, sign: [4.3, 2.2], icon: 'yen' },
    hwasm: { acc: '#ea3f86', glass: '#ffbcd9', crown: 'chip', face: 'circuit', tower: [1.45, 0.3, 2.1, 1.75], r: 0.2,
             th: [32, 42], door: 0.3, sign: [1.15, 2.4], icon: 'chip' },
    desk:  { acc: '#f7860e', glass: '#ffd9a6', crown: 'talk', face: 'lights', tower: [1.4, 0.4, 1.2, 1.2], r: 1,
             th: [30, 44], drum: [0.3, 0.9, 3.3, 1.95], drumH: 15, door: 1.55, sign: [0.55, 2.55], icon: 'talk' },
    staff: { acc: '#0ea5d8', glass: '#a4ebfb', crown: 'wheel', face: 'people', tower: [0.15, 1.0, 1.75, 1.75], r: 1,
             th: [36, 42], door: 2.75, sign: [1.5, 2.5], icon: 'people' },
    supply: { acc: '#f08a24', glass: '#ffe3b8', tower: [3.6, 0.2, 1.3, 1.2], r: 1, sign: [4.3, 2.5], icon: 'box' }
  };
  function pal(sp) {
    if (sp.pal) return sp.pal;
    var a = sp.acc;
    sp.pal = {
      acc: a, accD: sh(a, -52), accL: mix(a, '#ffffff', 0.45), band: sh(a, -80),
      gL: mix(sp.glass, '#3f4a6c', 0.3), gR: mix(sp.glass, '#ffffff', 0.15),
      mull: rgba(sh(a, -70), 0.3), roof: '#eef1f6', glow: rgba(a, 0.3),
      plaza: mix(a, '#ffffff', 0.8), stripe: 'rgba(255,255,255,0.3)', on: true
    };
    return sp.pal;
  }
  function palOff(sp) {
    if (sp.palOff) return sp.palOff;
    var a = mix(sp.acc, '#8a8fa3', 0.72);
    sp.palOff = {
      acc: a, accD: sh(a, -42), accL: mix(a, '#ffffff', 0.35), band: sh(a, -70),
      gL: '#565c74', gR: '#8990a8', mull: 'rgba(30,34,52,0.35)', roof: '#c6c9d3', glow: 'rgba(0,0,0,0)',
      plaza: '#d9dae1', stripe: 'rgba(255,255,255,0.12)', on: false
    };
    return sp.palOff;
  }
  function levelK(p, S) {
    var st = S.p[p.id], mx = p.maxLevel || 6, lv = Math.max(1, st.level || 1);
    return mx > 1 ? Math.min(1, (lv - 1) / (mx - 1)) : 1;
  }
  function rrect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function towerGeo(p, S, sp) {
    var k = levelK(p, S), tr = sp.tower, x = p.x * T, y = p.y * T;
    var tx = x + tr[0] * T, ty = y + tr[1] * T, tw = tr[2] * T, td = tr[3] * T;
    var TH = sp.th[0] + k * sp.th[1], pt = FL + 7;
    var gt = geo(tx, ty, tw, td, Math.min(tw, td) * 0.5 * sp.r);
    var step = k > 0.5 && sp.crown !== 'yen' && sp.crown !== 'talk';
    return { k: k, gt: gt, gTop: step ? inset(gt, 3.2) : gt, pt: pt, h1: pt + TH, hs: pt + TH * 0.58, step: step };
  }
  function drumGeo(p, sp) {
    var d = sp.drum, x = p.x * T, y = p.y * T;
    return geo(x + d[0] * T, y + d[1] * T, d[2] * T, d[3] * T, Math.min(d[2], d[3]) * T * 0.5);
  }
  function crownBox(sp, k) {
    if (sp.crown === 'code') return { top: 3 + 14 + 5 * k + 1.5, hw: 11 + 4 * k + 1.5 };
    if (sp.crown === 'yen') return { top: 3 + 2 * (6 + 2 * k) + 3, hw: 6 + 2 * k + 1.5 };
    if (sp.crown === 'talk') return { top: 4 + 10 + 3 * k + 3.2, hw: (15 + 3 * k) / 2 + 1.5 };
    if (sp.crown === 'wheel') return { top: 2 + 2 * (7 + 4 * k) + 4, hw: 7 + 4 * k + 2.6 };
    return { top: 3 * (1 + Math.round(k * 2)) + 2, hw: 0 };
  }
  function podium(g, gp, pt, pl) {
    prism(g, gp, FL, pt - 2.2, pl.accD, pl.acc, null);
    var L = gp.LX, M = gp.LY;
    g.fillStyle = pl.stripe; g.beginPath();
    for (var i = 0; i < L.length - 1; i += 2) {
      g.moveTo(L[i], M[i] - FL - 1); g.lineTo(L[i + 1], M[i + 1] - FL - 1);
      g.lineTo(L[i + 1], M[i + 1] - pt + 2.2); g.lineTo(L[i], M[i] - pt + 2.2); g.closePath();
    }
    g.fill();
    g.fillStyle = pl.band; side(g, gp, FL, FL + 1); g.fill();
    g.fillStyle = pl.on ? '#ffffff' : '#c9ccd6'; side(g, gp, pt - 2.2, pt - 1); g.fill();
    prism(g, gp, pt - 1, pt, pl.accD, pl.acc, pl.plaza);
  }
  function glassBody(c, g, h0, h1, pl, face, seed) {
    prism(c, g, h0, h1, pl.gL, pl.gR, null);
    c.fillStyle = pl.on ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)';
    side(c, g, h1 - Math.min(9, (h1 - h0) * 0.35), h1); c.fill();
    if (face && pl.on) facade(c, g, h0, h1, face, seed || 0);
    c.beginPath();
    for (var fh = h0 + 4.6; fh < h1 - 1.5; fh += 4.6) chain(c, g, fh);
    c.strokeStyle = pl.on ? 'rgba(255,255,255,0.85)' : 'rgba(210,215,230,0.3)'; c.lineWidth = 0.75; c.stroke();
    c.beginPath();
    for (var i = 1; i < g.LX.length - 1; i++) { c.moveTo(g.LX[i], g.LY[i] - h0); c.lineTo(g.LX[i], g.LY[i] - h1); }
    c.strokeStyle = pl.mull; c.lineWidth = 0.45; c.stroke();
  }
  var FACE_COLS = ['#8dff9e', '#7fe3ff', '#ffe27a', '#ff9ec9', '#c9b6ff'];
  function facade(c, g, h0, h1, face, seed) {
    var n = g.LX.length, i, fh, r;
    if (face === 'circuit') {
      c.strokeStyle = 'rgba(255,210,74,0.75)'; c.lineWidth = 0.55; c.beginPath();
      for (i = 2; i < n - 1; i += 3) { c.moveTo(g.LX[i], g.LY[i] - h0 - 1); c.lineTo(g.LX[i], g.LY[i] - h1 + 2); }
      c.stroke();
      c.fillStyle = '#ffd24a';
      for (i = 2; i < n - 1; i += 3) for (fh = h0 + 3; fh < h1 - 2; fh += 6.9)
        if (hash(seed + i * 5 + fh) < 0.6) c.fillRect(g.LX[i] - 0.9, g.LY[i] - fh - 0.9, 1.8, 1.8);
      return;
    }
    for (fh = h0 + 2.3; fh < h1 - 2; fh += 4.6) {
      for (i = 1; i < n - 1; i++) {
        r = hash(seed * 1.7 + fh * 3.1 + i * 7.3);
        var X = g.LX[i], Y = g.LY[i] - fh;
        if (face === 'code') {
          if (r > 0.5) continue;
          c.fillStyle = FACE_COLS[Math.floor(r * 10) % 5];
          c.fillRect(X - 1.6, Y - 0.5, 1 + r * 5, 0.9);
        } else if (face === 'lights') {
          if (r > 0.45) continue;
          c.fillStyle = r < 0.12 ? 'rgba(255,255,255,0.9)' : 'rgba(255,236,160,0.85)';
          c.fillRect(X - 1.5, Y - 1.3, 3, 2.2);
        } else if (face === 'people') {
          if (r > 0.3) continue;
          c.fillStyle = FACE_COLS[Math.floor(r * 30) % 5];
          c.fillRect(X - 1.1, Y + 0.1, 2.2, 1.4);
          c.fillStyle = '#ffd9b0'; disc(c, X, Y - 0.7, 0.8); c.fill();
        }
      }
    }
  }
  function vaultBody(g, gt, h0, h1, pl) {
    var on = pl.on, i;
    prism(g, gt, h0, h1, on ? '#4a38b8' : '#555a70', on ? '#a292ff' : '#8a8fa3', null);
    g.fillStyle = on ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'; side(g, gt, h1 - 5, h1); g.fill();
    g.beginPath();
    for (var fh = h0 + 3; fh < h1 - 1; fh += 3.6) chain(g, gt, fh);
    g.strokeStyle = on ? '#ffd24a' : '#a8a594'; g.lineWidth = 0.9; g.stroke();
    g.beginPath();
    for (i = 1; i < gt.LX.length - 1; i++) { g.moveTo(gt.LX[i], gt.LY[i] - h0); g.lineTo(gt.LX[i], gt.LY[i] - h1); }
    g.strokeStyle = 'rgba(30,16,80,0.25)'; g.lineWidth = 0.5; g.stroke();
    var dx = gt.X[12], dy = gt.Y[12] - (h0 + (h1 - h0) * 0.45), r = Math.min(7.5, (h1 - h0) * 0.3);
    g.fillStyle = '#2f2c46'; disc(g, dx, dy, r + 1.1); g.fill();
    g.fillStyle = on ? '#f5b21c' : '#9a968a'; disc(g, dx, dy, r); g.fill();
    g.fillStyle = on ? '#ffe07a' : '#b8b4a8'; disc(g, dx - 0.5, dy - 0.5, r * 0.72); g.fill();
    g.strokeStyle = on ? '#9a6a00' : '#6b6a60'; g.lineWidth = 0.9; g.beginPath();
    for (i = 0; i < 6; i++) {
      var a = i * Math.PI / 3 + 0.3;
      g.moveTo(dx, dy); g.lineTo(dx + Math.cos(a) * r * 0.62, dy + Math.sin(a) * r * 0.62);
    }
    g.stroke();
    g.fillStyle = '#2f2c46'; disc(g, dx, dy, 1.3); g.fill();
    g.fillStyle = on ? '#ffcf3f' : '#b0ad9f'; top(g, gt, h1); g.fill();
    g.fillStyle = on ? '#6b58e6' : '#7a7f94'; top(g, inset(gt, 1.6), h1 + 0.1); g.fill();
  }
  function roofDeco(g, gt, h1, k, pl, seed, vault) {
    if (!vault) { g.fillStyle = pl.roof; top(g, gt, h1); g.fill(); }
    if (k > 0.15 && !vault) {
      g.fillStyle = pl.on ? '#8ccf6e' : '#8d9a88'; top(g, inset(gt, 1.3), h1 + 0.2); g.fill();
      for (var i = 0; i < 2; i++) {
        var bx = gt.x + gt.w * (0.25 + i * 0.5) * 0.6 + 2, by = gt.y + 2.5 + i * 1.5;
        var px = sx(bx, by), py = sy(bx, by, h1 + 2.2);
        g.fillStyle = pl.on ? '#3f9a55' : '#6b7c68'; disc(g, px, py, 2.4); g.fill();
        g.fillStyle = pl.on ? '#6cc46a' : '#86957f'; disc(g, px - 0.7, py - 0.8, 1.4); g.fill();
      }
    }
    if (k > 0.35) {
      top(g, gt, h1 + 0.4);
      g.strokeStyle = pl.glow; g.lineWidth = 3; g.stroke();
      g.strokeStyle = pl.acc; g.lineWidth = 1.2; g.stroke();
    }
    if (k > 0.55) {
      var ax = sx(gt.x + gt.w * 0.22, gt.y + gt.h * 0.22), ay = sy(gt.x + gt.w * 0.22, gt.y + gt.h * 0.22, h1), ah = 8 + k * 8;
      g.strokeStyle = '#8d94a8'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, ay - ah); g.stroke();
      g.beginPath(); g.moveTo(ax - 2, ay - ah * 0.45); g.lineTo(ax + 2, ay - ah * 0.45); g.stroke();
    }
  }
  function roofDyn(c, gt, h1, k, pl, t, seed) {
    if (k >= 1) {
      top(c, gt, h1 + 0.4);
      c.strokeStyle = 'hsl(' + Math.round((t * 90 + seed * 40) % 360) + ',95%,62%)'; c.lineWidth = 1.3; c.stroke();
    }
    if (k > 0.55 && Math.sin(t * 5 + seed) > 0) {
      var ax = sx(gt.x + gt.w * 0.22, gt.y + gt.h * 0.22), ay = sy(gt.x + gt.w * 0.22, gt.y + gt.h * 0.22, h1) - (8 + k * 8);
      c.fillStyle = 'rgba(255,59,92,0.3)'; disc(c, ax, ay, 3); c.fill();
      c.fillStyle = '#ff3b5c'; disc(c, ax, ay, 1.3); c.fill();
    }
  }
  function crownXY(tg) { return { x: sx(tg.gTop.cx, tg.gTop.cy), y: sy(tg.gTop.cx, tg.gTop.cy, tg.h1) }; }
  function crownCodeS(g, tg, H) {
    var k = tg.k, o = crownXY(tg), cx = o.x, by = o.y - 3, w2 = 11 + 4 * k, hh = 14 + 5 * k, on = tg.pl.on;
    g.fillStyle = '#3a3550';
    g.fillRect(cx - w2 * 0.55, by - 0.5, 1.8, 3.8); g.fillRect(cx + w2 * 0.55 - 1.8, by - 0.5, 1.8, 3.8);
    rrect(g, cx - w2 - 1.3, by - hh - 1.3, w2 * 2 + 2.6, hh + 2.6, 4); g.fillStyle = '#2f2c46'; g.fill();
    rrect(g, cx - w2, by - hh, w2 * 2, hh, 3); g.fillStyle = on ? tg.pl.acc : '#7d8296'; g.fill();
    rrect(g, cx - w2 + 1.5, by - hh + 1.5, w2 * 2 - 3, hh - 3, 2); g.fillStyle = on ? '#0b1a2c' : '#262a3a'; g.fill();
    if (on) {
      for (var j = 0; j < 2; j++) {
        var ind = (j % 2) * 2.6;
        g.fillStyle = FACE_COLS[(j * 2 + 1) % 5];
        g.fillRect(cx - w2 + 3.2 + ind, by - 3.2 - j * 1.9, (w2 * 2 - 9 - ind) * (0.55 + hash(j + 3) * 0.45), 1);
      }
    }
    var fs = 7.5 + 3 * k, ty = by - hh + 1.8 + fs * 0.5;
    font(g, fs, H, 900);
    g.lineJoin = 'round'; g.lineWidth = 2.4; g.strokeStyle = '#0b1a2c'; g.strokeText('</>', cx, ty);
    g.fillStyle = on ? '#8dff9e' : '#6b7085'; g.fillText('</>', cx, ty);
  }
  function crownCodeD(c, tg, t, active) {
    var k = tg.k, o = crownXY(tg), cx = o.x, by = o.y - 3, w2 = 11 + 4 * k, hh = 14 + 5 * k;
    if (Math.sin(t * 6) > 0) { c.fillStyle = '#8dff9e'; c.fillRect(cx + w2 - 5.5, by - 4.9, 2.4, 1.1); }
    if (active) {
      c.fillStyle = 'rgba(141,255,158,0.28)';
      c.fillRect(cx - w2 + 1.5, by - 2 - frac(t * 0.9) * (hh - 3.5), w2 * 2 - 3, 1.3);
    }
    if (k >= 1) {
      rrect(c, cx - w2, by - hh, w2 * 2, hh, 3);
      c.strokeStyle = 'hsl(' + Math.round(t * 110 % 360) + ',95%,62%)'; c.lineWidth = 1.3; c.stroke();
    }
  }
  function crownYenS(g, tg) {
    var k = tg.k, gt = tg.gt, o = crownXY(tg), on = tg.pl.on, i;
    var n = Math.round(k * 4);
    for (i = 0; i < n; i++) {
      var a = Math.PI * (1.05 + i * 0.3), rr = Math.min(gt.w, gt.h) * 0.3;
      var bx = gt.cx + Math.cos(a) * rr - rr * 0.35, by = gt.cy + Math.sin(a) * rr - rr * 0.35, hh = 2.4 + (i % 2) * 1.8;
      var px = sx(bx, by), py = sy(bx, by, tg.h1 + 0.2);
      g.fillStyle = on ? '#c98f0f' : '#8d8a80'; g.fillRect(px - 2.4, py - hh, 4.8, hh);
      g.beginPath(); g.ellipse(px, py, 2.4, 1.1, 0, 0, Math.PI); g.fill();
      g.fillStyle = on ? '#ffd95a' : '#b8b4a8'; g.beginPath(); g.ellipse(px, py - hh, 2.4, 1.1, 0, 0, 7); g.fill();
    }
    g.fillStyle = on ? '#c98f0f' : '#8d8a80';
    g.beginPath(); g.ellipse(o.x, o.y, 4.6, 2, 0, 0, 7); g.fill();
    g.fillRect(o.x - 1.1, o.y - 3.2, 2.2, 3.2);
  }
  function crownYenD(c, tg, t, H, ready) {
    var k = tg.k, o = crownXY(tg), on = tg.pl.on, r = 6 + 2 * k;
    var cy = o.y - 3 - r - (ready ? Math.abs(Math.sin(t * 4)) * 2.2 : 0);
    var cs = on ? Math.cos(t * 2.2) : 1, a = Math.max(0.14, Math.abs(cs));
    c.save(); c.translate(o.x, cy); c.scale(a, 1);
    c.fillStyle = '#2f2c46'; disc(c, 0, 0, r + 1.2); c.fill();
    c.fillStyle = on ? (cs > 0 ? '#f5b21c' : '#e0940a') : '#9a968a'; disc(c, 0, 0, r); c.fill();
    c.fillStyle = on ? '#ffd95a' : '#b8b4a8'; disc(c, -0.4, -0.4, r * 0.74); c.fill();
    if (a > 0.4) { font(c, r * 1.25, H, 900); c.fillStyle = on ? '#9a6a00' : '#6b6a60'; c.fillText('¥', 0, 0.5); }
    c.restore();
    if (on && (ready || k >= 1)) {
      for (var i = 0; i < 3; i++) {
        var ph = frac(t * 0.9 + i / 3);
        c.globalAlpha = Math.sin(ph * Math.PI);
        twinkle(c, o.x + Math.cos(i * 2.1 + t) * (r + 5), cy + Math.sin(i * 2.1 + t) * (r + 2) - ph * 4, 2, '#fff6c8');
      }
      c.globalAlpha = 1;
    }
  }
  function crownChipS(g, tg) {
    var k = tg.k, gt = tg.gTop, h = tg.h1, n = 1 + Math.round(k * 2), on = tg.pl.on, gi = gt, i, j;
    var gold = on ? '#f5c542' : '#9a968a', goldR = on ? '#c99a1a' : '#7d7a70';
    for (i = 0; i < n; i++) {
      var d = 2.2 + i * 3.2;
      gi = geo(gt.x + d, gt.y + d, gt.w - d * 2, gt.h - d * 2, 1.2);
      var yf = gi.y + gi.h, xr = gi.x + gi.w;
      for (j = gi.x + 1.5; j < xr - 1; j += 2.6) I.box(g, j, yf - 0.4, 1, 1.9, h + 0.7, 0.8, gold, { left: goldR, right: gold });
      for (j = gi.y + 1.5; j < yf - 1; j += 2.6) I.box(g, xr - 0.4, j, 1.9, 1, h + 0.7, 0.8, gold, { left: goldR, right: gold });
      prism(g, gi, h, h + 2.6, '#221c38', '#463c6c', '#312a50');
      h += 2.6;
    }
    var gd = inset(gi, Math.max(1, Math.min(gi.w, gi.h) * 0.24));
    g.fillStyle = on ? '#ffcf3f' : '#8d8a80'; top(g, gd, h + 0.05); g.fill();
    g.strokeStyle = on ? 'rgba(255,210,74,0.7)' : 'rgba(150,150,140,0.5)'; g.lineWidth = 0.5; g.beginPath();
    g.moveTo(sx(gi.x + 1, gi.cy), sy(gi.x + 1, gi.cy, h + 0.05)); g.lineTo(sx(gd.x, gd.cy), sy(gd.x, gd.cy, h + 0.05));
    g.moveTo(sx(gi.cx, gi.y + 1), sy(gi.cx, gi.y + 1, h + 0.05)); g.lineTo(sx(gd.cx, gd.y), sy(gd.cx, gd.y, h + 0.05));
    g.stroke();
    return h;
  }
  function crownChipD(c, tg, t, active) {
    var k = tg.k, n = 1 + Math.round(k * 2), gt = tg.gTop, d = 2.2 + (n - 1) * 3.2;
    var gi = geo(gt.x + d, gt.y + d, gt.w - d * 2, gt.h - d * 2, 1.2), h = tg.h1 + n * 2.6;
    var gd = inset(gi, Math.max(1, Math.min(gi.w, gi.h) * 0.24));
    var pl = active ? 0.55 + 0.45 * Math.sin(t * 6) : 0.25 + 0.15 * Math.sin(t * 2);
    c.fillStyle = 'rgba(255,255,255,' + (pl * 0.75).toFixed(2) + ')'; top(c, gd, h + 0.1); c.fill();
    if (active) {
      var px = sx(gd.cx, gd.cy), py = sy(gd.cx, gd.cy, h);
      c.fillStyle = 'rgba(255,120,190,' + (pl * 0.35).toFixed(2) + ')'; disc(c, px, py - 1, 6 + pl * 3); c.fill();
    }
  }
  function crownTalkD(c, tg, t, H, offer) {
    var k = tg.k, o = crownXY(tg), on = tg.pl.on, bw = 15 + 3 * k, bh = 10 + 3 * k, by = o.y - 4;
    var bob = on ? Math.abs(Math.sin(t * (offer ? 6 : 2.4))) * (offer ? 3 : 1.2) : 0;
    var st = on ? (offer ? 2 : 1) : 0;
    cached(c, H, 'bub|' + st + '|' + Math.round(k * 5), o.x - bw / 2 - 3, by - bh - 3, o.x + bw / 2 + 3, by + 4, function (g) {
      var x0 = o.x - bw / 2, y0 = by - bh;
      g.fillStyle = '#2f2c46';
      rrect(g, x0 - 1.3, y0 - 1.3, bw + 2.6, bh + 2.6, 4.5); g.fill();
      g.beginPath(); g.moveTo(o.x - 3.4, by); g.lineTo(o.x - 4.6, by + 3.6); g.lineTo(o.x + 1.4, by); g.fill();
      rrect(g, x0, y0, bw, bh, 3.6); g.fillStyle = on ? '#ffffff' : '#b9bdc9'; g.fill();
      g.strokeStyle = on ? tg.pl.acc : '#8d94a8'; g.lineWidth = 1.1; g.stroke();
      g.fillStyle = on ? '#ffffff' : '#b9bdc9';
      g.beginPath(); g.moveTo(o.x - 2.8, by - 0.6); g.lineTo(o.x - 3.8, by + 2); g.lineTo(o.x + 0.6, by - 0.6); g.fill();
      if (st === 2) { font(g, bh * 0.85, H, 900); g.fillStyle = '#e8364f'; g.fillText('!', o.x, y0 + bh / 2 + 0.4); }
      if (st === 0) { font(g, bh * 0.6, H, 900); g.fillStyle = '#6b7085'; g.fillText('z z', o.x, y0 + bh / 2 + 0.3); }
    }, 0, -bob);
    if (st === 1) {
      var ph = Math.floor(t * 3) % 3;
      for (var i = 0; i < 3; i++) {
        c.fillStyle = i === ph ? tg.pl.acc : '#c3c8d4';
        disc(c, o.x + (i - 1) * bw * 0.22, by - bh / 2 - bob, 1.1 + k * 0.3); c.fill();
      }
    }
    if (offer && on) {
      c.strokeStyle = tg.pl.acc; c.lineWidth = 1;
      for (var j = 0; j < 2; j++) {
        var q = frac(t * 1.5 + j * 0.5), rr = bw * 0.6 + q * 8;
        c.globalAlpha = 1 - q;
        c.beginPath(); c.arc(o.x, by - bh / 2 - bob, rr, -0.9, -0.1); c.stroke();
        c.beginPath(); c.arc(o.x, by - bh / 2 - bob, rr, Math.PI + 0.1, Math.PI + 0.9); c.stroke();
      }
      c.globalAlpha = 1;
    }
  }
  var GONDOLA = ['#ff5aa5', '#ffd23f', '#3ddc84', '#2bb8d8', '#8a6cff', '#ff9a3c', '#ff5aa5', '#7fe3ff'];
  function crownWheelS(g, tg) {
    var k = tg.k, R = 7 + 4 * k, o = crownXY(tg), hy = o.y - 2 - R, on = tg.pl.on;
    g.fillStyle = on ? tg.pl.acc : '#8d94a8';
    rrect(g, o.x - R * 0.75, o.y - 1.6, R * 1.5, 2.2, 1); g.fill();
    g.strokeStyle = on ? '#f4f7fb' : '#9aa0b0'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(o.x - R * 0.62, o.y - 0.8); g.lineTo(o.x, hy); g.lineTo(o.x + R * 0.62, o.y - 0.8); g.stroke();
  }
  function crownWheelD(c, tg, t, nStaff) {
    var k = tg.k, R = 7 + 4 * k, o = crownXY(tg), hy = o.y - 2 - R, on = tg.pl.on, i;
    var a0 = on ? t * 0.45 : 0.25;
    c.strokeStyle = on ? tg.pl.acc : '#8d94a8'; c.lineWidth = 1.3; disc(c, o.x, hy, R); c.stroke();
    c.lineWidth = 0.5; c.beginPath();
    for (i = 0; i < 8; i++) {
      var a = a0 + i * Math.PI / 4;
      c.moveTo(o.x, hy); c.lineTo(o.x + Math.cos(a) * R, hy + Math.sin(a) * R);
    }
    c.stroke();
    if (on) {
      var ph = Math.floor(t * 4) % 2;
      c.fillStyle = '#fff4b0'; c.beginPath();
      for (i = 0; i < 16; i++) if (i % 2 === ph) { var b = a0 + i * Math.PI / 8; c.rect(o.x + Math.cos(b) * R - 0.6, hy + Math.sin(b) * R - 0.6, 1.2, 1.2); }
      c.fill();
    }
    for (i = 0; i < 8; i++) {
      var ag = a0 + i * Math.PI / 4, gx = o.x + Math.cos(ag) * R, gy = hy + Math.sin(ag) * R;
      c.fillStyle = '#2f2c46'; c.fillRect(gx - 2.1, gy + 0.2, 4.2, 3.6);
      c.fillStyle = i < nStaff && on ? GONDOLA[i] : (on ? '#ffffff' : '#a8adbb'); c.fillRect(gx - 1.6, gy + 0.6, 3.2, 2.8);
      if (i < nStaff && on) { c.fillStyle = '#ffd9b0'; disc(c, gx, gy + 0.4, 0.95); c.fill(); }
    }
    c.fillStyle = on ? '#ffd24a' : '#9a968a'; disc(c, o.x, hy, 1.6); c.fill();
  }
  function badge(c, wx, wy, h, icon, pl, t, active, H, S, extra, off) {
    var bx = sx(wx, wy), by = sy(wx, wy, h);
    c.strokeStyle = '#aab2c4'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - 6); c.stroke();
    var bob = active && !off ? Math.abs(Math.sin(t * 5)) * 1.8 : 0, cy = by - 12 - bob;
    if (active && !off) {
      c.fillStyle = rgba(pl.acc, 0.22 + 0.18 * Math.sin(t * 6)); disc(c, bx, cy, 10); c.fill();
    }
    c.fillStyle = '#2f2c46'; disc(c, bx, cy, 7.4); c.fill();
    c.fillStyle = off ? '#9aa0b0' : pl.acc; disc(c, bx, cy, 6.5); c.fill();
    c.fillStyle = off ? '#d9dce4' : '#ffffff'; disc(c, bx, cy, 5.1); c.fill();
    icon2(c, bx, cy, icon, off ? '#8d94a8' : pl.acc, t, active && !off, H, S);
    if (extra && !off) {
      font(c, 4.2, H, 900);
      var tw = c.measureText(extra).width + 3.6;
      pill(c, bx + 3, cy + 3, tw, 5.4, '#2f2c46', null);
      c.fillStyle = '#ffffff'; c.fillText(extra, bx + 3 + tw / 2, cy + 5.8);
    }
  }
  function icon2(c, x, y, kind, col, t, active, H, S) {
    var i;
    if (kind === 'code') {
      font(c, 5.4, H, 900); c.fillStyle = col; c.fillText('</>', x, y + 0.3);
    } else if (kind === 'yen') {
      var sc = active ? Math.abs(Math.cos(t * 4)) * 0.8 + 0.2 : 1;
      c.save(); c.translate(x, y); c.scale(sc, 1);
      c.fillStyle = '#f5b21c'; disc(c, 0, 0, 3.9); c.fill();
      c.fillStyle = '#ffd95a'; disc(c, -0.3, -0.3, 3); c.fill();
      font(c, 4.4, H, 900); c.fillStyle = '#9a6a00'; c.fillText('¥', 0, 0.3);
      c.restore();
    } else if (kind === 'chip') {
      c.strokeStyle = '#3a3350'; c.lineWidth = 0.7; c.beginPath();
      for (i = -1; i <= 1; i++) {
        c.moveTo(x - 4.2, y + i * 1.6); c.lineTo(x + 4.2, y + i * 1.6);
        c.moveTo(x + i * 1.6, y - 4.2); c.lineTo(x + i * 1.6, y + 4.2);
      }
      c.stroke();
      c.fillStyle = '#3a3350'; c.fillRect(x - 2.8, y - 2.8, 5.6, 5.6);
      c.fillStyle = active ? (Math.sin(t * 8) > 0 ? '#ffffff' : col) : col; c.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
    } else if (kind === 'talk') {
      pill(c, x - 4, y - 3.4, 8, 5.6, col, null);
      c.beginPath(); c.moveTo(x - 1.6, y + 2); c.lineTo(x - 3, y + 4.2); c.lineTo(x + 0.4, y + 2); c.fill();
      c.fillStyle = '#ffffff';
      if (active) { font(c, 5, H, 900); c.fillText('!', x, y - 0.5); }
      else for (i = -1; i <= 1; i++) { disc(c, x + i * 2, y - 0.6, 0.75); c.fill(); }
    } else if (kind === 'people') {
      c.fillStyle = col;
      disc(c, x - 1.9, y - 1.7, 1.45); c.fill(); disc(c, x + 1.9, y - 1.7, 1.45); c.fill();
      c.beginPath(); c.ellipse(x - 1.9, y + 1.8, 2, 1.7, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.ellipse(x + 1.9, y + 1.8, 2, 1.7, 0, Math.PI, 0); c.fill();
    } else if (kind === 'box') {
      c.fillStyle = '#c98a4a'; c.fillRect(x - 3.6, y - 0.4, 3.4, 3.2); c.fillRect(x + 0.2, y - 0.4, 3.4, 3.2);
      c.fillStyle = '#e0a664'; c.fillRect(x - 1.7, y - 3.6, 3.4, 3.2);
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.fillRect(x - 2.2, y - 0.4, 0.5, 3.2); c.fillRect(x + 1.6, y - 0.4, 0.5, 3.2); c.fillRect(x - 0.25, y - 3.6, 0.5, 3.2);
    }
  }
  function chase(c, g, h, t, colA, colB, rainbow) {
    var n = g.LX.length, ph = Math.floor(t * 7), i;
    c.fillStyle = colB; c.beginPath();
    for (i = 0; i < n; i++) if ((i + ph) % 3) c.rect(g.LX[i] - 0.7, g.LY[i] - h - 0.7, 1.4, 1.4);
    c.fill();
    if (rainbow) {
      for (i = 0; i < n; i++) if (!((i + ph) % 3)) {
        c.fillStyle = 'hsl(' + ((i * 40 + ph * 20) % 360) + ',95%,62%)';
        c.fillRect(g.LX[i] - 1.3, g.LY[i] - h - 1.3, 2.6, 2.6);
      }
      return;
    }
    c.fillStyle = colA; c.beginPath();
    for (i = 0; i < n; i++) if (!((i + ph) % 3)) c.rect(g.LX[i] - 1.2, g.LY[i] - h - 1.2, 2.4, 2.4);
    c.fill();
  }
  function entrance(c, yf, x0, x1, h0, pl, H) {
    c.fillStyle = pl.on ? '#2d3550' : '#262a3a'; vqY(c, x0, x1, yf + 0.05, h0, h0 + 4.8); c.fill();
    c.fillStyle = pl.on ? 'rgba(255,236,170,0.8)' : 'rgba(110,120,150,0.35)';
    vqY(c, x0 + 0.6, (x0 + x1) / 2 - 0.3, yf + 0.1, h0, h0 + 4.2); c.fill();
    vqY(c, (x0 + x1) / 2 + 0.3, x1 - 0.6, yf + 0.1, h0, h0 + 4.2); c.fill();
    I.box(c, x0 - 1, yf - 0.5, x1 - x0 + 2, 2.2, h0 + 4.8, 0.9, pl.acc);
    if (pl.on) return;
    c.beginPath();
    c.moveTo(sx(x0 - 0.5, yf + 0.3), sy(x0 - 0.5, yf + 0.3, h0 + 0.5)); c.lineTo(sx(x1 + 0.5, yf + 0.3), sy(x1 + 0.5, yf + 0.3, h0 + 4.4));
    c.moveTo(sx(x0 - 0.5, yf + 0.3), sy(x0 - 0.5, yf + 0.3, h0 + 4.4)); c.lineTo(sx(x1 + 0.5, yf + 0.3), sy(x1 + 0.5, yf + 0.3, h0 + 0.5));
    c.strokeStyle = '#f5c542'; c.lineWidth = 1.4; c.stroke();
    c.setLineDash([1, 1.3]); c.strokeStyle = '#2f2c46'; c.lineWidth = 1.4; c.stroke(); c.setLineDash([]);
    var mx = sx((x0 + x1) / 2, yf), my = sy((x0 + x1) / 2, yf, h0 + 9.6);
    font(c, 3.8, H, 900);
    var lab = H.L.t('office_closed'), lw = c.measureText(lab).width + 3.6;
    pill(c, mx - lw / 2, my - 2.7, lw, 5.4, '#e2504a', '#ffffff', 0.6);
    c.fillStyle = '#ffffff'; c.fillText(lab, mx, my + 0.2);
  }
  function towerBld(p, S, H, sp, active, extra) {
    var c = H.ctx, t = S.t, lv = S.p[p.id].level || 1, on = isLit(S, p);
    var pl = on ? pal(sp) : palOff(sp);
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T, seed = p.x * 7 + p.y;
    var tg = towerGeo(p, S, sp), k = tg.k, pt = tg.pt, h1 = tg.h1, gt = tg.gt;
    tg.pl = pl;
    var gp = geo(x + 2, y + 2, w - 4, h - 4, 9);
    var key = 'twr|' + p.id + '|' + lv + '|' + (on ? 1 : '0' + H.L.get());
    var X0 = sx(x, y + h) - 4, Y0 = sy(x, y, h1 + 40), X1 = sx(x + w, y) + 4, Y1 = sy(x + w, y + h, FL) + 6;
    function paint(g) {
      shadowAt(g, x + 2, y + 2, w - 4, h - 4, 9, 0.15);
      podium(g, gp, pt, pl);
      g.fillStyle = 'rgba(46,40,78,0.12)'; top(g, geo(gt.x + 3, gt.y + 3, gt.w, gt.h, gt.r), pt + 0.1); g.fill();
      if (sp.drum) {
        var gd = drumGeo(p, sp), dh = pt + sp.drumH;
        glassBody(g, gd, pt, dh, pl, 'lights', seed);
        g.fillStyle = sgrad(g, gd, pl.accD, pl.acc); side(g, gd, dh - 1.8, dh); g.fill();
        g.fillStyle = pl.roof; top(g, gd, dh); g.fill();
        if (k > 0.15) { g.fillStyle = pl.on ? '#8ccf6e' : '#8d9a88'; top(g, inset(gd, 1.6), dh + 0.2); g.fill(); }
        entrance(g, gd.y + gd.h, x + sp.door * T, x + sp.door * T + 11, pt, pl, H);
        glassBody(g, gt, dh, h1, pl, 'lights', seed);
        g.beginPath();
        for (var rg = 0; rg < 1 + Math.round(k * 3); rg++) chain(g, gt, dh + 8 + rg * 11);
        g.strokeStyle = pl.acc; g.lineWidth = 1.6; g.stroke();
      } else {
        entrance(g, gp.y + gp.h, x + sp.door * T, x + sp.door * T + 11, FL, pl, H);
        if (sp.face === 'vault') vaultBody(g, gt, pt, h1, pl);
        else if (tg.step) {
          glassBody(g, gt, pt, tg.hs, pl, sp.face, seed);
          g.fillStyle = pl.roof; top(g, gt, tg.hs); g.fill();
          g.fillStyle = pl.on ? '#8ccf6e' : '#8d9a88'; top(g, inset(gt, 1), tg.hs + 0.2); g.fill();
          glassBody(g, tg.gTop, tg.hs, h1, pl, sp.face, seed + 5);
        } else glassBody(g, gt, pt, h1, pl, sp.face, seed);
      }
      if (sp.face !== 'vault') { g.fillStyle = sgrad(g, tg.gTop, pl.accD, pl.acc); side(g, tg.gTop, h1 - 1.8, h1); g.fill(); }
      roofDeco(g, tg.gTop, h1, k, pl, seed, sp.face === 'vault');
      if (sp.crown === 'code') crownCodeS(g, tg, H);
      else if (sp.crown === 'yen') crownYenS(g, tg);
      else if (sp.crown === 'chip') crownChipS(g, tg);
      else if (sp.crown === 'wheel') crownWheelS(g, tg);
    }
    cached(c, H, key, X0, Y0, X1, Y1, paint);
    if (on) roofDyn(c, tg.gTop, h1, k, pl, t, seed);
    if (sp.crown === 'code') crownCodeD(c, tg, t, on && active);
    else if (sp.crown === 'yen') crownYenD(c, tg, t, H, on && active);
    else if (sp.crown === 'chip') crownChipD(c, tg, t, on && active);
    else if (sp.crown === 'talk') crownTalkD(c, tg, t, H, on && !!S.offer);
    else if (sp.crown === 'wheel') crownWheelD(c, tg, t, S.p.staff.owned ? S.p.staff.level || 0 : 0);
    badge(c, x + sp.sign[0] * T, y + sp.sign[1] * T, pt, sp.icon, pl, t, active, H, S, extra, !on);
    if (on) chase(c, gp, pt, t, '#fff4b0', rgba(pl.acc, 0.6), k >= 1);
    var fk = on ? flashK(S, p) : -1;
    if (fk >= 0) powerFlash(c, p, S, fk, function () { cached(c, H, key, X0, Y0, X1, Y1, paint); });
  }
  function ghost(p, S, H, sp) {
    var c = H.ctx, t = S.t, pl = pal(sp);
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T;
    var gp = geo(x + 2, y + 2, w - 4, h - 4, 9);
    c.save();
    top(c, gp, FL + 0.3); c.fillStyle = rgba(pl.acc, 0.08); c.fill();
    c.setLineDash([4, 3]); c.lineDashOffset = -(t * 8) % 7;
    c.strokeStyle = rgba(pl.acc, 0.85); c.lineWidth = 1.2; c.stroke();
    c.setLineDash([]);
    var tr = sp.tower, gt = geo(x + tr[0] * T, y + tr[1] * T, tr[2] * T, tr[3] * T, Math.min(tr[2], tr[3]) * T * 0.5 * sp.r);
    var h0 = FL + 7, h1 = h0 + 16;
    c.globalAlpha = 0.55 + 0.15 * Math.sin(t * 3);
    side(c, gt, h0, h1); c.fillStyle = rgba(pl.acc, 0.14); c.fill();
    c.strokeStyle = pl.acc; c.lineWidth = 0.7; c.stroke();
    top(c, gt, h1); c.stroke();
    c.beginPath();
    for (var i = 1; i < gt.LX.length - 1; i += 2) { c.moveTo(gt.LX[i], gt.LY[i] - h0); c.lineTo(gt.LX[i], gt.LY[i] - h1); }
    c.lineWidth = 0.4; c.stroke();
    var sc = h0 + frac(t * 9 / 16) * 16;
    c.beginPath(); chain(c, gt, sc); c.strokeStyle = '#ffffff'; c.lineWidth = 1.1; c.stroke();
    c.globalAlpha = 0.8;
    badge(c, x + sp.sign[0] * T, y + sp.sign[1] * T, FL + 1, sp.icon, pl, t, false, H, S);
    c.restore();
  }
  function swActive(S) {
    for (var i = 0; i < S.jobs.length; i++) if (S.jobs[i].kind === 'sw' && S.jobs[i].done < S.jobs[i].work) return true;
    return false;
  }
  on('plot', 'swjob', function (p, S, H) {
    towerBld(p, S, H, BLD.swjob, swActive(S) && S.swStock > 0, S.swStock > 0 ? '×' + S.swStock : null);
  });
  on('plot', 'acct', function (p, S, H) {
    var ready = S.pendSales >= 1;
    towerBld(p, S, H, BLD.acct, ready, null);
    if (isLit(S, p)) acctExtras(p, S, H, ready);
  });
  on('plot', 'hwasm', function (p, S, H) {
    var G = QT.G, can = S.parts >= G.CFG.partsPerBuild && S.rdLevel() >= 1;
    towerBld(p, S, H, BLD.hwasm, can, can ? G.hwasmQ() + 'q' : null);
  });
  on('plot', 'desk', function (p, S, H) {
    towerBld(p, S, H, BLD.desk, !!S.offer, S.jobs.length ? '×' + S.jobs.length : null);
  });
  on('plot', 'staff', function (p, S, H) {
    towerBld(p, S, H, BLD.staff, false, '×' + (S.p.staff.level || 0));
  });
  on('plot', 'supply', function (p, S, H) { supplyArt(p, S, H); });
  ['swjob', 'acct', 'hwasm', 'desk', 'staff', 'supply'].forEach(function (id) {
    on('unowned', id, function (p, S, H) { ghost(p, S, H, BLD[id]); });
  });
  function acctExtras(p, S, H, ready) {
    var c = H.ctx, t = S.t, x = p.x * T, y = p.y * T, pt = FL + 7;
    var nb = Math.min(3, S.ar.length);
    for (var i = 0; i < nb; i++) {
      var bx = x + (2.7 + i * 0.4) * T, by = y + 0.6 * T;
      I.box(c, bx, by, 5, 6.5, pt, 0.8 + i * 0.3, '#ffffff', { stroke: 'rgba(90,90,130,0.35)', lw: 0.4 });
    }
    if (!ready) return;
    for (var s = 0; s < 3; s++) {
      var cx = x + (3.75 + (s % 2) * 0.5) * T, cy = y + (0.55 + s * 0.4) * T;
      var hh = 2 + ((s * 3) % 4);
      I.box(c, cx, cy, 4.5, 4.5, pt, hh, '#ffd24a', { left: '#d99a10', right: '#f0b52a' });
    }
    var cp = { x: sx(x + 4.1 * T, y + 1.0 * T), y: sy(x + 4.1 * T, y + 1.0 * T, pt + 12 + Math.sin(t * 4) * 2) };
    var sc = Math.abs(Math.cos(t * 3));
    c.save(); c.translate(cp.x, cp.y); c.scale(0.25 + sc * 0.75, 1);
    c.fillStyle = '#c98f0f'; disc(c, 0, 0, 4.2); c.fill();
    c.fillStyle = '#ffd24a'; disc(c, 0, 0, 3.4); c.fill();
    c.restore();
    twinkle(c, cp.x + 4, cp.y - 3, 1.6 + Math.abs(Math.sin(t * 5)) * 1.2, '#ffffff');
  }
  var CONT = ['#e2508a', '#2bb8d8', '#f5b21c', '#2fbf7a', '#8a6cff', '#ef7d2e'];
  function supplyGeo(p, S) {
    var sp = BLD.supply, k = levelK(p, S), tr = sp.tower, x = p.x * T, y = p.y * T, F = FL + 1.4;
    var gt = geo(x + tr[0] * T, y + tr[1] * T, tr[2] * T, tr[3] * T, 8), h1 = F + 20 + k * 26;
    return { k: k, gt: gt, gc: geo(gt.x - 1.5, gt.y - 1.5, gt.w + 3, gt.h + 3, 9), h1: h1, F: F };
  }
  function supplyArt(p, S, H) {
    var c = H.ctx, t = S.t, sp = BLD.supply, on = isLit(S, p), pl = on ? pal(sp) : palOff(sp);
    var lv = S.p.supply.level || 1, G = QT.G, sg = supplyGeo(p, S), k = sg.k, F = sg.F, h1 = sg.h1;
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T;
    var gp = geo(x + 1.5, y + 1.5, w - 3, h - 3, 7);
    var wx0 = x + 1.75 * T, wy0 = y + 0.3 * T, ww = 1.7 * T, wd = 2.45 * T, BH = 11 + k * 6;
    var yx0 = x + 0.12 * T, yx1 = x + 1.58 * T, yy0 = y + 0.2 * T, yy1 = y + 2.8 * T, GH = F + 15 + k * 8;
    var cap = G.CFG.stockCap + (lv - 1) * 4;
    var nBox = Math.min(12, Math.ceil(Math.min(1, S.parts / Math.max(1, cap)) * 12));
    var open = on ? Math.round(Math.min(1, S.parts / Math.max(1, cap)) * 4) / 4 : 0;
    var key = 'sup|' + lv + '|' + nBox + '|' + open + '|' + (on ? 1 : '0' + H.L.get());
    var X0 = sx(x, y + h) - 4, Y0 = sy(x, y, h1 + 30), X1 = sx(x + w, y) + 4, Y1 = sy(x + w, y + h, FL) + 6;
    function paint(g) {
      shadowAt(g, x + 2, y + 2, w - 4, h - 4, 7, 0.15);
      prism(g, gp, FL, F, pl.accD, pl.acc, on ? '#ece6dc' : '#d9d9de');
      g.fillStyle = pl.band; side(g, gp, FL, FL + 0.5); g.fill();
      g.strokeStyle = on ? '#f5c542' : '#b9b39c'; g.lineWidth = 0.8; g.setLineDash([2.5, 2]); g.beginPath();
      g.moveTo(sx(yx0, yy1 + 2), sy(yx0, yy1 + 2, F + 0.05)); g.lineTo(sx(x + w - 3, yy1 + 2), sy(x + w - 3, yy1 + 2, F + 0.05));
      g.stroke(); g.setLineDash([]);
      var list = [];
      for (var b = 0; b < nBox; b++) {
        var lay = b >= 6 ? 1 : 0, bi = b % 6, row = 2 - Math.floor(bi / 2), col = 1 - bi % 2;
        list.push({ x: yx0 + 1.2 + col * 11.6, y: yy0 + 1 + row * 13.2, lay: lay, c: CONT[(b * 5 + lv) % 6] });
      }
      list.sort(function (a, b2) { return a.lay - b2.lay || (a.x + a.y) - (b2.x + b2.y); });
      list.forEach(function (o) {
        var col2 = on ? o.c : mix(o.c, '#8a8fa3', 0.7);
        I.box(g, o.x, o.y, 10, 11.5, F + o.lay * 5.4, 5.2, col2, { stroke: 'rgba(255,255,255,0.45)', lw: 0.4 });
        g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 0.4; g.beginPath();
        for (var rb = 2; rb < 10; rb += 2) {
          g.moveTo(sx(o.x + rb, o.y + 11.5), sy(o.x + rb, o.y + 11.5, F + o.lay * 5.4 + 0.5));
          g.lineTo(sx(o.x + rb, o.y + 11.5), sy(o.x + rb, o.y + 11.5, F + o.lay * 5.4 + 4.7));
        }
        g.stroke();
      });
      var legs = [[yx0, yy0], [yx1, yy0], [yx0, yy1], [yx1, yy1]];
      legs.forEach(function (lg) { I.box(g, lg[0] - 0.6, lg[1] - 0.6, 1.2, 1.2, F, GH - F, on ? '#f5b21c' : '#a8a594'); });
      I.box(g, yx0 - 0.6, yy0 - 0.6, 1.2, yy1 - yy0 + 1.2, GH, 1.3, on ? '#f5b21c' : '#a8a594');
      I.box(g, yx1 - 0.6, yy0 - 0.6, 1.2, yy1 - yy0 + 1.2, GH, 1.3, on ? '#f5b21c' : '#a8a594');
      var gb = geo(wx0, wy0, ww, wd, 4);
      prism(g, gb, F, F + BH, on ? '#e9dcc8' : '#b9b5ae', on ? '#fbf4ea' : '#d4d2cd', null);
      prism(g, gb, F + BH - 2.2, F + BH, pl.accD, pl.acc, on ? '#f1ece4' : '#cfcdc8');
      var bays = 1 + Math.round(k * 2);
      for (var i = 0; i < 3; i++)
        I.box(g, wx0 + 3, wy0 + 3 + i * (wd - 6) / 3, ww - 6, (wd - 6) / 3 - 2.5, F + BH, 0.9, i < bays && on ? '#9fd4f0' : '#cfcac0');
      for (var d = 0; d < 2; d++) {
        var dx0 = wx0 + 3 + d * 13, dx1 = dx0 + 10;
        g.fillStyle = '#4a3a2c'; vqY(g, dx0, dx1, wy0 + wd + 0.05, F, F + 8.5); g.fill();
        g.fillStyle = on ? '#e3dccf' : '#bdb9b2'; vqY(g, dx0, dx1, wy0 + wd + 0.1, F + 8.5 * (0.12 + open * 0.62), F + 8.5); g.fill();
        g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 0.4; g.beginPath();
        for (var sl = 0; sl < 3; sl++) {
          var hh = F + 8.5 - sl * 1.6;
          g.moveTo(sx(dx0, wy0 + wd + 0.1), sy(dx0, wy0 + wd + 0.1, hh)); g.lineTo(sx(dx1, wy0 + wd + 0.1), sy(dx1, wy0 + wd + 0.1, hh));
        }
        g.stroke();
        I.box(g, dx0 - 1, wy0 + wd - 0.5, 12, 2, F + 8.7, 0.8, pl.acc);
      }
      var nx = sx(wx0 + ww / 2, wy0 + wd - 3), ny = sy(wx0 + ww / 2, wy0 + wd - 3, F + BH + 4.2);
      g.fillStyle = '#3a3550'; g.fillRect(nx - 7, ny + 2.2, 1, 2.6); g.fillRect(nx + 6, ny + 2.2, 1, 2.6);
      rrect(g, nx - 11, ny - 3.6, 22, 6.8, 3.4); g.fillStyle = '#2f2c46'; g.fill();
      font(g, 4.8, H, 900); g.fillStyle = on ? '#ffb347' : '#8d94a8'; g.fillText('PARTS', nx, ny + 0.2);
      glassBody(g, sg.gt, F, h1, pl, 'lights', 11);
      prism(g, sg.gc, h1, h1 + 5, pl.accD, pl.acc, null);
      g.fillStyle = on ? 'rgba(200,240,255,0.85)' : 'rgba(120,130,150,0.6)'; side(g, sg.gc, h1 + 1.2, h1 + 3.8); g.fill();
      g.fillStyle = pl.roof; top(g, sg.gc, h1 + 5); g.fill();
      roofDeco(g, sg.gc, h1 + 5, Math.min(0.7, k), pl, 5, false);
      I.box(g, x + 3.55 * T, y + 1.75 * T, 1.3 * T, 7, F, 2.4, '#5c5470');
    }
    cached(c, H, key, X0, Y0, X1, Y1, paint);
    var u = on ? 0.5 + 0.5 * Math.sin(t * 0.7) : 0.3, by2 = yy0 + u * (yy1 - yy0);
    I.box(c, yx0 - 0.8, by2 - 0.8, yx1 - yx0 + 1.6, 1.6, GH + 0.2, 1.3, on ? '#ffcf3f' : '#b8b4a8');
    var hx = (yx0 + yx1) / 2, hp = sx(hx, by2), hq = sy(hx, by2, GH);
    c.strokeStyle = '#6b6a78'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(hp, hq); c.lineTo(hp, hq + 5); c.stroke();
    c.fillStyle = on ? CONT[(lv + 2) % 6] : '#a8adbb'; c.fillRect(hp - 3.2, hq + 5, 6.4, 3.4);
    var rx = sx(sg.gc.cx, sg.gc.cy), ry = sy(sg.gc.cx, sg.gc.cy, h1 + 5), ra = on ? Math.cos(t * 3) : 0.6;
    c.strokeStyle = '#8d94a8'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx, ry - 3.5); c.stroke();
    c.fillStyle = on ? '#f4f7fb' : '#b9bdc9'; c.beginPath(); c.ellipse(rx, ry - 4.5, 3.6 * Math.max(0.15, Math.abs(ra)), 1.6, 0, 0, 7); c.fill();
    if (on) {
      roofDyn(c, sg.gc, h1 + 5, Math.min(0.7, k), pl, t, 5);
      var mv = frac(t * 0.8) * (1.3 * T - 5);
      I.box(c, x + 3.55 * T + mv, y + 1.75 * T + 1.5, 4, 4, F + 2.4, 2.6, '#e0a664');
      if (Math.sin(t * 1.7) > 0.93) {
        var nx = sx(wx0 + ww / 2, wy0 + wd - 3), ny = sy(wx0 + ww / 2, wy0 + wd - 3, F + BH + 4.2);
        c.fillStyle = 'rgba(255,255,255,0.35)'; rrect(c, nx - 11, ny - 3.6, 22, 6.8, 3.4); c.fill();
      }
    }
    badge(c, x + sp.sign[0] * T, y + sp.sign[1] * T, F, sp.icon, pl, t, false, H, S, S.parts + '/' + cap, !on);
    if (on) chase(c, gp, F, t, '#fff4b0', rgba(sp.acc, 0.5), k >= 1);
    var fk = on ? flashK(S, p) : -1;
    if (fk >= 0) powerFlash(c, p, S, fk, function () { cached(c, H, key, X0, Y0, X1, Y1, paint); });
  }
  var LED_COLS = ['#7ff0ff', '#a98bff', '#8dff9e'];
  on('plot', 'qcloud', function (p, S, H) {
    var c = H.ctx, t = S.t, lv = S.qcLv(), lit = isLit(S, p);
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T;
    var F = FL + 3;
    var gp = geo(x + 1.5, y + 1.5, w - 3, h - 3, 14);
    var X0 = sx(x, y + h) - 4, Y0 = sy(x, y, 30), X1 = sx(x + w, y) + 4, Y1 = sy(x + w, y + h, FL) + 6;
    function paint(g) {
      shadowAt(g, x + 1.5, y + 1.5, w - 3, h - 3, 14, 0.18);
      prism(g, gp, FL, F, '#cfd4e2', '#f4f6fb', null);
      g.fillStyle = '#231c48'; top(g, gp, F); g.fill();
      var gi = inset(gp, 2.5);
      g.fillStyle = lit ? '#30256a' : '#27223f'; top(g, gi, F + 0.05); g.fill();
      g.save(); top(g, gi, F + 0.05); g.clip();
      g.strokeStyle = lit ? 'rgba(160,130,255,0.28)' : 'rgba(140,130,180,0.1)'; g.lineWidth = 0.5; g.beginPath();
      for (var gx = x + 8; gx < x + w; gx += 8) { g.moveTo(sx(gx, y), sy(gx, y, F)); g.lineTo(sx(gx, y + h), sy(gx, y + h, F)); }
      for (var gy = y + 8; gy < y + h; gy += 8) { g.moveTo(sx(x, gy), sy(x, gy, F)); g.lineTo(sx(x + w, gy), sy(x + w, gy, F)); }
      g.stroke(); g.restore();
      top(g, gp, F + 0.1); g.strokeStyle = lit ? 'rgba(169,139,255,0.9)' : 'rgba(120,115,150,0.6)'; g.lineWidth = 0.9; g.stroke();
      for (var ry = 0; ry < 3; ry++) for (var rx = 0; rx < 3; rx++)
        rack(g, x + (5.15 + rx * 0.82) * T, y + (1.5 + ry * 1.05) * T, 11.5, 9, F, 15, lit);
    }
    cached(c, H, 'qc|' + (lit ? 1 : 0), X0, Y0, X1, Y1, paint);
    var chx = x + 4.0 * T, chy = y + 3.05 * T;
    if (lit) {
      var ring = frac(t * 0.6);
      c.strokeStyle = 'rgba(127,240,255,' + (0.5 * (1 - ring)) + ')'; c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(sx(chx, chy), sy(chx, chy, F), (16 + ring * 8) * RX, (16 + ring * 8) * RY, 0, 0, 7); c.stroke();
    }
    var cap = S.dcCapacity(), n = S.dc.length;
    var order = dcSlots();
    for (var si = 0; si < 15; si++) {
      var sl = DC_DRAW[si];
      var rank = order.indexOf(si);
      if (rank >= cap) continue;
      var mx = x + (0.55 + sl[0] * 0.78) * T, my = y + (0.75 + sl[1] * 0.76) * T;
      if (rank < n) dcMachine(c, mx, my, F, S.dc[rank], t, rank);
      else {
        c.strokeStyle = !lit ? 'rgba(140,130,180,0.35)' : rank === n ? 'rgba(127,240,255,' + (0.5 + 0.4 * Math.sin(t * 5)) + ')' : 'rgba(169,139,255,0.45)';
        c.lineWidth = 0.7; top(c, geo(mx - 4.5, my - 4.5, 9, 9, 3), F + 0.2); c.stroke();
      }
    }
    if (lit) {
      var busy = Math.min(1, S.users / 4000), ph = Math.floor(t * (3 + busy * 6));
      if (lv >= 4) {
        c.strokeStyle = 'hsl(' + Math.round(t * 80 % 360) + ',90%,65%)'; c.lineWidth = 0.7; c.beginPath();
        for (var ry2 = 0; ry2 < 3; ry2++) for (var rx3 = 0; rx3 < 3; rx3++) {
          var kx = x + (5.15 + rx3 * 0.82) * T, fy2 = y + (1.5 + ry2 * 1.05) * T + 9.05;
          c.moveTo(sx(kx, fy2), sy(kx, fy2, F + 15)); c.lineTo(sx(kx + 11.5, fy2), sy(kx + 11.5, fy2, F + 15));
        }
        c.stroke();
      }
      for (var ci = 0; ci < 3; ci++) {
        c.fillStyle = LED_COLS[ci]; c.beginPath();
        for (var rx2 = 0; rx2 < 3; rx2++) {
          var lx0 = x + (5.15 + rx2 * 0.82) * T, fy = y + (1.5 + 2 * 1.05) * T + 9.05;
          for (var row = 0; row < 5; row++) {
            var id = rx2 * 31 + row * 7 + ci * 3;
            if (hash(id + ph * 0.37) > 0.35 + busy * 0.45) continue;
            var lx = lx0 + 2 + ci * 3.2, lh = F + 2.5 + row * 2.4;
            c.rect(sx(lx, fy) - 0.6, sy(lx, fy, lh) - 0.5, 1.3, 1);
          }
        }
        c.fill();
      }
    }
    chandelier(c, chx, chy, F, F + 22 + lv * 3.6, 2 + Math.ceil(lv / 2), t, lit && S.he > 0, lit);
    var lx2 = x + 1.9 * T, ly = y + h - 1;
    var px = sx(lx2, ly), py = sy(lx2, ly, F + 6);
    font(c, 5, H, 900);
    var label = n + '/' + cap, tw = c.measureText(label).width + 12;
    pill(c, px - tw / 2, py - 4, tw, 8, '#2f2c46', lit ? '#a98bff' : '#6b7085', 0.8);
    c.fillStyle = lit ? '#7ff0ff' : '#6b7085'; c.fillRect(px - tw / 2 + 2.6, py - 1.8, 3, 3.6);
    c.fillStyle = '#ffffff'; c.fillText(label, px + 2.5, py + 0.3);
    if (lit && S.pendDc >= 1) {
      var cxp = sx(x + 6.6 * T, y + 4.2 * T), cyp = sy(x + 6.6 * T, y + 4.2 * T, F + 26 + Math.sin(t * 4) * 2);
      var sc = Math.abs(Math.cos(t * 3));
      c.save(); c.translate(cxp, cyp); c.scale(0.25 + sc * 0.75, 1);
      c.fillStyle = '#2f2c46'; disc(c, 0, 0, 6); c.fill();
      c.fillStyle = '#f5b21c'; disc(c, 0, 0, 5); c.fill();
      font(c, 6, H, 900); c.fillStyle = '#ffffff'; c.fillText('¥', 0, 0.4);
      c.restore();
    }
    var fk = lit ? flashK(S, p) : -1;
    if (fk >= 0) powerFlash(c, p, S, fk, function () { cached(c, H, 'qc|1', X0, Y0, X1, Y1, paint); });
  });
  var DC_DRAW = [], DC_ORDER = null;
  (function () {
    for (var r = 0; r < 5; r++) for (var cc = 0; cc < 3; cc++) DC_DRAW.push([cc, r]);
    DC_DRAW.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
  })();
  function dcSlots() {
    if (DC_ORDER) return DC_ORDER;
    var idx = DC_DRAW.map(function (s, i) { return i; });
    idx.sort(function (a, b) { return (DC_DRAW[b][1] * 3 + DC_DRAW[b][0]) - (DC_DRAW[a][1] * 3 + DC_DRAW[a][0]); });
    DC_ORDER = idx;
    return idx;
  }
  function dcMachine(c, wx, wy, F, m, t, i) {
    var px = sx(wx, wy), py = sy(wx, wy, F), r = 4.2, rx = r * RX, ry = r * RY, hh = 10;
    var gold = m && m.qubits >= 128;
    c.fillStyle = 'rgba(127,240,255,0.25)'; c.beginPath(); c.ellipse(px, py, rx + 2, ry + 1.2, 0, 0, 7); c.fill();
    c.fillStyle = '#c9cedb'; c.fillRect(px - rx, py - hh, rx * 2, hh);
    c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#eef1f7'; c.fillRect(px - rx * 0.2, py - hh, rx * 1.2, hh);
    c.fillStyle = gold ? '#f5b21c' : '#a98bff'; c.fillRect(px - rx, py - hh * 0.62, rx * 2, 1.4);
    c.fillStyle = gold ? '#ffd95a' : '#ffffff'; c.beginPath(); c.ellipse(px, py - hh, rx, ry, 0, 0, 7); c.fill();
    c.fillStyle = (Math.sin(t * 4 + i) > -0.3) ? '#7ff0ff' : '#3f7a9a'; c.fillRect(px - 0.8, py - hh * 0.35, 1.6, 1.2);
  }
  function rack(c, x, y, w, d, h0, hh, lit) {
    I.box(c, x, y, w, d, h0, hh, '#3a3358', { left: '#1d1933', right: '#2c2748', top: '#4a4270' });
    var fy = y + d + 0.05;
    c.strokeStyle = lit === false ? '#5c5870' : '#a98bff'; c.lineWidth = 0.7; c.beginPath();
    c.moveTo(sx(x, fy), sy(x, fy, h0 + hh)); c.lineTo(sx(x + w, fy), sy(x + w, fy, h0 + hh)); c.stroke();
  }
  function plateR(i, n) { return 10 - 6.2 * i / Math.max(1, n - 1); }
  function chandelier(c, cx, cy, h0, h1, tiers, t, cold, lit) {
    var px = sx(cx, cy), pb = sy(cx, cy, 0), R = 13, rx = R * RX, ry = R * RY, i;
    var gD = lit ? '#a8760a' : '#7d7466', gM = lit ? '#ffd24a' : '#b3a98f', gT = lit ? '#ffe07a' : '#c2b9a2', gE = lit ? '#c98f0f' : '#8f866f';
    if (lit) {
      c.fillStyle = rgrad(c, 'chglow' + Math.round(px) + ',' + Math.round(pb), px, pb - h0, rx * 2.2,
        [0, 'rgba(127,240,255,0.55)', 0.5, 'rgba(169,139,255,0.25)', 1, 'rgba(169,139,255,0)']);
      c.beginPath(); c.ellipse(px, pb - h0, rx * 2.2, ry * 2.2, 0, 0, 7); c.fill();
    }
    c.strokeStyle = lit ? '#e8a800' : '#8f866f'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(px, pb - h0 - 0.3, rx + 4.5, ry + 2.4, 0, 0, 7); c.stroke();
    c.fillStyle = lit ? 'rgba(200,230,255,0.16)' : 'rgba(150,160,190,0.14)';
    c.beginPath(); c.moveTo(px - rx, pb - h1);
    c.ellipse(px, pb - h1, rx, ry, 0, Math.PI, Math.PI * 2);
    c.lineTo(px + rx, pb - h0);
    c.ellipse(px, pb - h0, rx, ry, 0, 0, Math.PI);
    c.closePath(); c.fill();
    var hTop = h1 - 4, hLow = h0 + 9, gap = (hTop - hLow) / Math.max(1, tiers - 1);
    if (lit) {
      var pulse = 0.6 + 0.4 * Math.sin(t * 4);
      c.globalAlpha = cold ? pulse : 0.25;
      c.fillStyle = rgrad(c, 'chip' + Math.round(px) + ',' + Math.round(pb - hLow), px, pb - hLow + 6, 8,
        [0, 'rgba(255,255,255,1)', 0.3, 'rgba(127,240,255,0.8)', 1, 'rgba(169,139,255,0)']);
      disc(c, px, pb - hLow + 6, 8); c.fill();
      c.globalAlpha = 1;
    }
    c.fillStyle = lit ? '#d9a21e' : gE; c.fillRect(px - 1.4, pb - hLow, 2.8, 4.6);
    c.fillStyle = cold ? '#7ff0ff' : '#6c7aa0'; c.fillRect(px - 2.2, pb - hLow + 4.4, 4.4, 2.2);
    for (i = tiers - 1; i >= 0; i--) {
      var hp = hTop - i * gap, erx = plateR(i, tiers) * RX, ery = plateR(i, tiers) * RY;
      if (i < tiers - 1) {
        var rl = plateR(i + 1, tiers) * RX * 0.75, hb = hp - gap;
        c.strokeStyle = gE; c.lineWidth = 0.7; c.beginPath();
        c.moveTo(px - rl, pb - hb); c.lineTo(px - rl, pb - hp + ery * 0.2);
        c.moveTo(px + rl, pb - hb); c.lineTo(px + rl, pb - hp + ery * 0.2);
        c.moveTo(px, pb - hb + ery * 0.9); c.lineTo(px, pb - hp + ery);
        c.stroke();
        c.strokeStyle = 'rgba(205,215,235,0.95)'; c.lineWidth = 0.45; c.beginPath();
        c.moveTo(px - rl * 0.45, pb - hb + ery * 0.6); c.quadraticCurveTo(px - rl * 0.2, pb - hb - gap * 0.5, px - rl * 0.4, pb - hp + ery * 0.7);
        c.moveTo(px + rl * 0.45, pb - hb + ery * 0.6); c.quadraticCurveTo(px + rl * 0.2, pb - hb - gap * 0.5, px + rl * 0.4, pb - hp + ery * 0.7);
        c.stroke();
      }
      c.fillStyle = gD;
      c.beginPath(); c.ellipse(px, pb - hp + 1.3, erx, ery, 0, 0, Math.PI); c.fill();
      c.fillRect(px - erx, pb - hp, erx * 2, 1.3);
      c.fillStyle = i === 0 ? gT : gM;
      c.beginPath(); c.ellipse(px, pb - hp, erx, ery, 0, 0, 7); c.fill();
      c.strokeStyle = gE; c.lineWidth = 0.35; c.stroke();
      c.fillStyle = lit ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)';
      c.beginPath(); c.ellipse(px - erx * 0.35, pb - hp - ery * 0.25, erx * 0.3, ery * 0.28, 0, 0, 7); c.fill();
    }
    c.strokeStyle = 'rgba(205,215,235,0.9)'; c.lineWidth = 0.45; c.beginPath();
    for (i = -1; i <= 1; i++) { c.moveTo(px + i * rx * 0.3, pb - h1 + 0.5); c.lineTo(px + i * rx * 0.42, pb - hTop + 0.5); }
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(px - rx, pb - h1); c.lineTo(px - rx, pb - h0);
    c.moveTo(px + rx, pb - h1); c.lineTo(px + rx, pb - h0); c.stroke();
    c.beginPath(); c.ellipse(px, pb - h0, rx, ry, 0, 0, Math.PI); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.2)';
    c.fillRect(px - rx * 0.78, pb - h1 + ry * 0.6, rx * 0.2, h1 - h0 - ry * 0.6);
    c.fillStyle = 'rgba(255,255,255,0.1)';
    c.fillRect(px + rx * 0.5, pb - h1 + ry, rx * 0.12, h1 - h0 - ry);
    c.strokeStyle = '#3a3358'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(px, pb - h1, rx, ry, 0, 0, 7); c.stroke();
    c.strokeStyle = lit ? '#e8a800' : '#8f866f'; c.lineWidth = 0.6; c.stroke();
    c.fillStyle = gE; c.beginPath(); c.ellipse(px, pb - h1 + 0.8, rx * 0.5, ry * 0.5, 0, 0, 7); c.fill();
    c.fillStyle = gM; c.beginPath(); c.ellipse(px, pb - h1, rx * 0.5, ry * 0.5, 0, 0, 7); c.fill();
    if (cold) for (var q = 0; q < 4; q++) {
      var ph = frac(t * 0.5 + q / 4);
      c.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
      twinkle(c, px + Math.sin(q * 2.1 + t) * rx * 0.8, pb - h0 - 6 - ph * (h1 - h0), 1.6, q % 2 ? '#7ff0ff' : '#ffffff');
    }
    c.globalAlpha = 1;
  }
  var OFF = { cx: 19.2, cy: 107.2, r: 1.05, h1: FL + 89, b0: FL + 44, b1: FL + 85, bw: 8, cr: 7 };
  function officeGeo() {
    var cx = OFF.cx * T, cy = OFF.cy * T, R = OFF.r * T, f = R * 0.7071;
    return { gt: geo(cx - R, cy - R, R * 2, R * 2, R), cx: cx, cy: cy, fx: cx + f, fy: cy + f };
  }
  function bladeText(st, H) {
    return st === 2 ? ['Q', 'T', 'Y', 'C'] : H.L.t('office_forRent').split('');
  }
  function officeArt(p, S, H) {
    powerTick(S);
    var c = H.ctx, t = S.t, lit = !!S.p.office.owned, can = !lit && !!S.co.bank;
    var st = lit ? 2 : can ? 1 : 0;
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T, i;
    var F = FL + 1.6, PH = 12, h1 = OFF.h1;
    var gv = geo(x + 3, y + 4, w - 8, h - 14, 12), gr = geo(x + 1.8, y + 2.8, w - 5.6, h - 11.6, 13);
    var og = officeGeo(), gt = og.gt;
    var dx0 = x + 21, dx1 = x + 33, dy = gv.y + gv.h + 0.05;
    var bx = sx(og.fx, og.fy), bb = sy(og.fx, og.fy, 0), bw = OFF.bw;
    var ctop = sy(og.cx, og.cy, h1);
    var X0 = sx(x, y + h) - 4, Y0 = sy(x, y, h1 + 30), X1 = sx(x + w, y) + 4, Y1 = sy(x + w, y + h, FL) + 6;
    var ph = st === 2 ? Math.floor(t * 3) % 6 : st === 1 ? Math.floor(t * 2.5) % 2 : 0;
    var key = 'off|' + st + '|' + ph + '|' + H.L.get();
    function paint(g) {
      shadowAt(g, x + 1, y + 1, w - 2, h - 2, 12, 0.16);
      prism(g, geo(x + 1, y + 1, w - 2, h - 2, 12), FL, F, '#d8dce6', '#f5f6fa', lit ? '#f7f3ea' : '#e9e8ee');
      if (lit) {
        g.fillStyle = rgrad(g, 'offglow' + x, sx(gv.cx, gv.cy), sy(gv.cx, gv.cy, F), 46,
          [0, 'rgba(255,214,120,0.6)', 1, 'rgba(255,214,120,0)']);
        g.beginPath(); g.ellipse(sx(gv.cx, gv.cy), sy(gv.cx, gv.cy, F) + 6, 46 * RX, 46 * RY, 0, 0, 7); g.fill();
      }
      prism(g, gv, F, F + PH, lit ? '#f2c472' : '#5d6680', lit ? '#fff1c8' : '#95a0b8', null);
      g.fillStyle = 'rgba(255,255,255,0.3)'; side(g, gv, F + PH * 0.6, F + PH); g.fill();
      g.beginPath();
      for (var m = 1; m < gv.LX.length - 1; m++) { g.moveTo(gv.LX[m], gv.LY[m] - F); g.lineTo(gv.LX[m], gv.LY[m] - F - PH); }
      g.strokeStyle = lit ? 'rgba(255,255,255,0.85)' : 'rgba(210,218,235,0.45)'; g.lineWidth = 0.5; g.stroke();
      g.fillStyle = lit ? 'rgba(255,255,255,0.9)' : '#434b66'; vqY(g, dx0, dx1, dy, F, F + 8); g.fill();
      g.strokeStyle = lit ? '#e8a800' : '#2f3550'; g.lineWidth = 0.6; vqY(g, dx0, dx1, dy, F, F + 8); g.stroke();
      g.beginPath(); g.moveTo(sx((dx0 + dx1) / 2, dy), sy((dx0 + dx1) / 2, dy, F)); g.lineTo(sx((dx0 + dx1) / 2, dy), sy((dx0 + dx1) / 2, dy, F + 8)); g.stroke();
      prism(g, gr, F + PH, F + PH + 1.8, '#cfd5e1', '#ffffff', lit ? '#ffffff' : '#c9cdd8');
      g.fillStyle = lit ? '#8ccf6e' : '#8fa08a'; top(g, inset(gr, 3), F + PH + 2); g.fill();
      for (var b0 = 0; b0 < 3; b0++) {
        var bx0 = gr.x + 10 + b0 * 17, by0 = gr.cy - 2 + (b0 % 2) * 5;
        if (b0 === 1) continue;
        g.fillStyle = lit ? '#3f9a55' : '#6b7c68'; disc(g, sx(bx0, by0), sy(bx0, by0, F + PH + 4.5), 3); g.fill();
        g.fillStyle = lit ? '#6cc46a' : '#86957f'; disc(g, sx(bx0, by0) - 0.9, sy(bx0, by0, F + PH + 5.3), 1.7); g.fill();
      }
      var tpl = lit ? { gL: '#9fb8d6', gR: '#f4fbff', mull: 'rgba(90,110,150,0.3)', on: true }
                    : { gL: '#4a5270', gR: '#7f89a3', mull: 'rgba(30,34,52,0.35)', on: false };
      glassBody(g, gt, F + PH + 1.8, h1 - 3, tpl, 'lights', 41);
      prism(g, gt, h1 - 3, h1, lit ? '#c98f0f' : '#6b6f80', lit ? '#ffd24a' : '#9aa0b0', lit ? '#fff6d8' : '#c3c6d0');
      var cpx = sx(og.cx, og.cy);
      g.fillStyle = '#3a3550'; g.fillRect(cpx - 0.9, ctop - 4, 1.8, 4);
      var yT = bb - OFF.b1, yB = bb - OFF.b0;
      rrect(g, bx - bw - 1.4, yT - 1.4, bw * 2 + 2.8, yB - yT + 2.8, 4); g.fillStyle = '#2f2c46'; g.fill();
      rrect(g, bx - bw, yT, bw * 2, yB - yT, 3);
      g.fillStyle = st === 2 ? '#e2508a' : st === 1 ? '#ffffff' : '#9aa0b0'; g.fill();
      rrect(g, bx - bw + 2.2, yT + 2.2, bw * 2 - 4.4, yB - yT - 4.4, 2);
      g.fillStyle = st === 2 ? '#2a1640' : st === 1 ? (ph ? '#e8364f' : '#fff4f4') : '#5d6378'; g.fill();
      var chars = bladeText(st, H), n = chars.length, step = Math.min(10, (yB - yT - 7) / n);
      font(g, step * 0.92, H, 900); g.lineJoin = 'round';
      for (i = 0; i < n; i++) {
        var cyy = yT + 3.5 + step * (i + 0.5);
        if (chars[i] === ' ') continue;
        var col = st === 2 ? LOGO_COLS[(i + ph) % 6] : st === 1 ? (ph ? '#ffffff' : '#e8364f') : '#c3c6d0';
        g.lineWidth = 2; g.strokeStyle = st === 2 ? '#1b1030' : st === 1 ? (ph ? '#9a1428' : '#ffffff') : '#4a4f63';
        g.strokeText(chars[i], bx, cyy);
        g.fillStyle = col; g.fillText(chars[i], bx, cyy);
      }
      var qy = ctop - 4 - OFF.cr;
      g.fillStyle = '#2f2c46'; disc(g, cpx, qy, OFF.cr + 1.3); g.fill();
      g.fillStyle = lit ? '#e2508a' : '#8d94a8'; disc(g, cpx, qy, OFF.cr); g.fill();
      g.fillStyle = lit ? '#ffffff' : '#c3c6d0'; disc(g, cpx, qy, OFF.cr - 1.8); g.fill();
      font(g, OFF.cr * 1.4, H, 900); g.fillStyle = lit ? '#e2508a' : '#8d94a8'; g.fillText('Q', cpx, qy + 0.5);
      var gm = geo(x + 3.0 * T, y + 2.3 * T, 0.7 * T, 0.55 * T, 3);
      prism(g, gm, F, F + 10, '#dfe3ec', '#ffffff', '#f4f6fa');
      var mpx = sx(gm.cx, gm.y + gm.h), mpy = sy(gm.cx, gm.y + gm.h, F + 6);
      g.fillStyle = lit ? '#f5b21c' : '#b9bfcc'; disc(g, mpx - 1, mpy, 3.2); g.fill();
      g.fillStyle = '#ffffff'; font(g, 4.2, H, 900); g.fillText('Q', mpx - 1, mpy + 0.3);
      if (lit) {
        var gc = geo(dx0 + 1, dy + 0.3, dx1 - dx0 - 2, y + h - 1.5 - dy, 1);
        g.fillStyle = '#d8344f'; top(g, gc, F + 0.1); g.fill();
        g.strokeStyle = '#f5c542'; g.lineWidth = 0.5; top(g, gc, F + 0.15); g.stroke();
      }
    }
    cached(c, H, key, X0, Y0, X1, Y1, paint);
    var yT2 = bb - OFF.b1, yB2 = bb - OFF.b0;
    if (st > 0) bladeBulbs(c, bx, yT2, yB2, bw, t, st);
    if (!lit) return;
    var qx = sx(og.cx, og.cy), qy2 = ctop - 4 - OFF.cr, a0 = t * 2.4;
    c.lineWidth = 1.2;
    for (i = 0; i < 3; i++) {
      c.strokeStyle = LOGO_COLS[i * 2];
      c.beginPath(); c.arc(qx, qy2, OFF.cr + 2.4, a0 + i * 2.09, a0 + i * 2.09 + 1.2); c.stroke();
    }
    for (i = 0; i < 3; i++) {
      var u = frac(t * 0.07 + i / 3), ix = gv.x + 8 + u * (gv.w - 16), iy = gv.y + gv.h - 3;
      var qx2 = sx(ix, iy), qy3 = sy(ix, iy, F);
      pill(c, qx2 - 1.8, qy3 - 8, 3.6, 6, 'rgba(120,80,40,0.28)');
      c.fillStyle = 'rgba(120,80,40,0.28)'; disc(c, qx2, qy3 - 9.4, 1.5); c.fill();
    }
    chase(c, gr, F + PH + 1.8, t, '#fff4b0', 'rgba(255,126,182,0.7)', false);
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,236,170,0.1)';
    for (var s2 = 0; s2 < 2; s2++) {
      var ang = -Math.PI / 2 + (s2 ? 0.45 : -0.45) + Math.sin(t * 0.7 + s2 * 2) * 0.3;
      var ox = qx, oy = ctop - 2;
      var L2 = 70, ddx = Math.cos(ang) * L2, ddy = Math.sin(ang) * L2, nx = -ddy / L2 * 7, ny = ddx / L2 * 7;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + ddx + nx, oy + ddy + ny); c.lineTo(ox + ddx - nx, oy + ddy - ny); c.closePath(); c.fill();
    }
    c.restore();
    for (var k2 = 0; k2 < 3; k2++) {
      var ph2 = frac(t * 0.7 + k2 / 3);
      c.globalAlpha = Math.sin(ph2 * Math.PI);
      twinkle(c, qx + (hash(k2 + Math.floor(t * 0.7 + k2 / 3)) - 0.5) * 30, qy2 - 4 - ph2 * 10, 2, '#fff6c8');
    }
    c.globalAlpha = 1;
    var fk = flashK(S, p);
    if (fk >= 0) powerFlash(c, p, S, fk, function () { cached(c, H, key, X0, Y0, X1, Y1, paint); });
  }
  function bladeBulbs(c, bx, yT, yB, bw, t, st) {
    var pts = BLADE_PTS[Math.round(yB - yT) + '|' + bw];
    if (!pts) {
      pts = [];
      var hgt = yB - yT, nV = Math.max(2, Math.round(hgt / 4)), nH = Math.max(1, Math.round(bw * 2 / 4)), i;
      for (i = 0; i < nH; i++) pts.push(-bw + (i + 0.5) * bw * 2 / nH, 0);
      for (i = 0; i < nV; i++) pts.push(bw, (i + 0.5) * hgt / nV);
      for (i = nH - 1; i >= 0; i--) pts.push(-bw + (i + 0.5) * bw * 2 / nH, hgt);
      for (i = nV - 1; i >= 0; i--) pts.push(-bw, (i + 0.5) * hgt / nV);
      BLADE_PTS[Math.round(yB - yT) + '|' + bw] = pts;
    }
    var n = pts.length / 2, ph = Math.floor(t * (st === 2 ? 9 : 6)), j;
    c.fillStyle = st === 2 ? 'rgba(255,210,74,0.55)' : 'rgba(255,255,255,0.6)'; c.beginPath();
    for (j = 0; j < n; j++) if ((j + ph) % 3) c.rect(bx + pts[j * 2] - 0.7, yT + pts[j * 2 + 1] - 0.7, 1.4, 1.4);
    c.fill();
    c.fillStyle = st === 2 ? '#fff4b0' : '#ffe27a'; c.beginPath();
    for (j = 0; j < n; j++) if (!((j + ph) % 3)) c.rect(bx + pts[j * 2] - 1.2, yT + pts[j * 2 + 1] - 1.2, 2.4, 2.4);
    c.fill();
  }
  var BLADE_PTS = {};
  on('plot', 'office', function (p, S, H) { officeArt(p, S, H); });
  on('unowned', 'office', function (p, S, H) { officeArt(p, S, H); });
  var CAPS = ['#e2508a', '#2bb8d8', '#f5b21c', '#2fbf7a', '#6f57e0', '#ef7d2e'];
  on('plot', 'gacha', function (p, S, H) {
    var c = H.ctx, t = S.t;
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T;
    var info = QT.G.padInfo({ p: p, type: 'gacha' }), can = !!(info && info.can);
    var gp = geo(x + 1.5, y + 1.5, w - 3, h - 3, 12);
    var bx = x + 0.3 * T, by = y + 0.9 * T, bw = 2.1 * T, bd = 1.9 * T;
    var gb = geo(bx, by, bw, bd, 7), hb = FL + 2.4 + 15;
    cached(c, H, 'gch', sx(x, y + h) - 3, sy(x, y, hb + 2), sx(x + w, y) + 3, sy(x + w, y + h, FL) + 6, function (g) {
      shadowAt(g, x + 1.5, y + 1.5, w - 3, h - 3, 12, 0.16);
      prism(g, gp, FL, FL + 2.4, '#e2508a', '#ff8fc0', '#ffe3f0');
      prism(g, gb, FL + 2.4, hb, '#c2306e', '#ff6fae', null);
      g.fillStyle = 'rgba(255,255,255,0.95)'; side(g, gb, hb - 6, hb - 4.4); g.fill();
      g.fillStyle = '#ffd24a'; top(g, gb, hb); g.fill();
      g.fillStyle = '#5a1535'; vqY(g, bx + 8, bx + 18, by + bd + 0.05, FL + 4.5, FL + 10); g.fill();
      g.fillStyle = '#ffd24a'; vqY(g, bx + 24, bx + 26, by + bd + 0.05, FL + 11, FL + 14); g.fill();
    });
    chase(c, gp, FL + 2.4, t, '#fff4b0', 'rgba(255,255,255,0.7)', true);
    var hx = sx(bx + bw + 0.5, by + bd * 0.55), hy = sy(bx + bw + 0.5, by + bd * 0.55, FL + 11);
    var ang = can ? t * 5 : 0.4;
    c.fillStyle = '#ffffff'; disc(c, hx, hy, 3.4); c.fill();
    c.strokeStyle = '#7a1f4a'; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(hx - Math.cos(ang) * 4.2, hy - Math.sin(ang) * 2.4); c.lineTo(hx + Math.cos(ang) * 4.2, hy + Math.sin(ang) * 2.4); c.stroke();
    c.lineCap = 'butt';
    var dx = sx(gb.cx, gb.cy), dy = sy(gb.cx, gb.cy, hb + 11), R = 12.5;
    c.fillStyle = 'rgba(225,244,255,0.7)'; disc(c, dx, dy, R); c.fill();
    c.save(); disc(c, dx, dy, R); c.clip();
    for (var i = 0; i < 11; i++) {
      var a = i * 2.3 + Math.sin(t * (can ? 3 : 1.2) + i) * 0.25, rr = 2.5 + (i % 3) * 3.1;
      var ccx = dx + Math.cos(a) * rr, ccy = dy + 4.5 + Math.sin(a) * rr * 0.55 - (i > 7 ? 5 : 0);
      c.fillStyle = CAPS[i % 6]; disc(c, ccx, ccy, 3.3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(ccx, ccy, 3.3, Math.PI, 0); c.fill();
    }
    c.restore();
    c.strokeStyle = '#2f2c46'; c.lineWidth = 1.4; disc(c, dx, dy, R); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.3;
    c.beginPath(); c.arc(dx - 3.5, dy - 4.5, 5, 3.5, 4.7); c.stroke();
    var ph = Math.floor(t * 8);
    for (var bl = 0; bl < 12; bl++) {
      var ab = bl / 12 * Math.PI * 2;
      c.fillStyle = (bl + ph) % 2 ? '#fff4b0' : CAPS[bl % 6];
      disc(c, dx + Math.cos(ab) * (R + 2.2), dy + Math.sin(ab) * (R + 2.2), 1.1); c.fill();
    }
    c.fillStyle = '#e8a800'; c.beginPath(); c.ellipse(dx, dy + R - 1.5, R * 0.75, 2.6, 0, 0, 7); c.fill();
    var gy2 = dy - R - 5.5 - (can ? Math.abs(Math.sin(t * 5)) * 1.6 : 0);
    font(c, 7, H, 900);
    c.lineJoin = 'round'; c.lineWidth = 2.6; c.strokeStyle = '#2f2c46'; c.strokeText('GACHA', dx, gy2);
    c.fillStyle = can ? 'hsl(' + Math.round(t * 120 % 360) + ',95%,65%)' : '#ff7eb6';
    c.fillText('GACHA', dx, gy2);
    if (can) for (var k = 0; k < 3; k++) {
      var ph2 = frac(t * 1.2 + k / 3);
      c.globalAlpha = Math.sin(ph2 * Math.PI);
      twinkle(c, dx + Math.cos(k * 2.1 + t) * (R + 8), dy + Math.sin(k * 2.1 + t) * (R + 4) - 4, 2.4, '#fff6c8');
    }
    c.globalAlpha = 1;
  });
  var PADCACHE = {};
  function padsOf(id, type) {
    var k = id + type;
    if (PADCACHE[k]) return PADCACHE[k];
    var out = [];
    QT.G.PADS().forEach(function (pd) { if (pd.p && pd.p.id === id && pd.type === type) out.push(pd); });
    PADCACHE[k] = out;
    return out;
  }
  function seatPads(c, id, type, F, t, col) {
    var list = padsOf(id, type);
    if (!list.length || !QT.G.padActive(list[0])) return;
    var info = QT.G.padInfo(list[0]), can = !!(info && info.can);
    for (var i = 0; i < list.length; i++) {
      var pd = list[i], x = pd.x * T, y = pd.y * T;
      c.globalAlpha = can ? 1 : 0.4;
      if (can) {
        var pl = 0.5 + 0.5 * Math.sin(t * 4);
        c.fillStyle = rgba(col, 0.25 + 0.25 * pl); I.facePath(c, x - 2 - pl * 2, y - 2 - pl * 2, T + 4 + pl * 4, T + 4 + pl * 4, F + 0.1); c.fill();
      }
      c.fillStyle = '#ffffff'; I.facePath(c, x, y, T, T, F + 0.15); c.fill();
      c.fillStyle = col; I.facePath(c, x + 1.6, y + 1.6, T - 3.2, T - 3.2, F + 0.2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)'; I.facePath(c, x + 5, y + 5, T - 10, T - 10, F + 0.25); c.fill();
    }
    c.globalAlpha = 1;
  }
  on('base', 'pc', function (p, S, H) {
    var c = H.ctx, t = S.t, lv = S.p.pc.level || 1;
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T, F = FL + 0.8;
    cached(c, H, 'pcb', sx(x, y + h) - 3, sy(x, y, F + 30), sx(x + w, y) + 3, sy(x + w, y + h, FL - 1) + 5, function (g) {
      shadowAt(g, x, y, w, h, 8, 0.14);
      var gf = geo(x + 0.5, y + 0.5, w - 1, h - 1, 8);
      prism(g, gf, FL - 1, F, '#d6dbe5', '#f6f8fb', null);
      g.fillStyle = vgrad(g, 'pcfloor', sy(x, y, F), sy(x + w, y + h, F), [0, '#f6e6c9', 1, '#e9d2ad']);
      top(g, gf, F); g.fill();
      g.strokeStyle = 'rgba(160,120,70,0.16)'; g.lineWidth = 0.5; g.beginPath();
      for (var j = 1; j < h / 5; j++) { var yy = y + j * 5; g.moveTo(sx(x + 1, yy), sy(x + 1, yy, F)); g.lineTo(sx(x + w - 1, yy), sy(x + w - 1, yy, F)); }
      g.stroke();
      var q = p.padsLocal[0], gr = geo(x + q.x * T + 0.5, y + q.y * T - 3.5, 3 * T - 1, T + 7, 5);
      g.fillStyle = '#c92f49'; top(g, gr, F + 0.05); g.fill();
      g.strokeStyle = '#f5c542'; g.lineWidth = 1; top(g, inset(gr, 1.5), F + 0.1); g.stroke();
      g.fillStyle = 'rgba(205,232,250,0.55)'; vqY(g, x + 1, x + w - 1, y + 2.5, F, F + 8); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)'; vqY(g, x + 1, x + w - 1, y + 2.5, F + 5, F + 6); g.fill();
      var notes = ['#ffe27a', '#ff9ec9', '#7fe3ff', '#8dff9e', '#ffb347'];
      for (var nt = 0; nt < 14; nt++) {
        var nx = x + 4 + hash(nt + 7) * (w - 10), nh = F + 2 + hash(nt + 31) * 4.5;
        g.fillStyle = notes[nt % 5]; vqY(g, nx, nx + 1.8, y + 2.45, nh, nh + 1.8); g.fill();
      }
      I.box(g, x + 1, y + 1, w - 2, 1.5, F + 8, 1, '#2bb8d8');
      tree(g, x + w - 5, y + 5.5, 0.55, 0, 3, H);
    });
    seatPads(c, p.id, 'dev', F, t, '#6f57e0');
    if (lv >= 5 && isLit(S, p)) I.box(c, x + 1, y + 1, w - 2, 1.5, F + 8, 1, 'hsl(' + Math.round(t * 60 % 360) + ',80%,60%)');
    var fk = isLit(S, p) ? flashK(S, p) : -1;
    if (fk >= 0) powerFlash(c, p, S, fk, null);
  });
  var CODE_COLS = ['#ff7eb6', '#7fe3ff', '#ffe27a', '#8dff9e', '#c9b6ff', '#ffffff'];
  var CODE_Q = [[], [], [], [], [], []];
  function screenFace(c, x0, x1, yf, h0, h1, active, t, seed, off) {
    c.fillStyle = off ? '#161a26' : active ? '#0e1830' : '#232a52';
    vqY(c, x0, x1, yf, h0, h1); c.fill();
    if (off) {
      c.fillStyle = 'rgba(255,255,255,0.08)'; vqY(c, x0, x0 + (x1 - x0) * 0.35, yf, h0 + (h1 - h0) * 0.5, h1); c.fill();
      return;
    }
    if (!active) {
      c.fillStyle = 'rgba(140,120,255,' + (0.3 + 0.15 * Math.sin(t * 1.5 + seed)) + ')';
      vqY(c, x0, x1, yf, h0, h0 + (h1 - h0) * 0.45); c.fill();
      return;
    }
    var lh = 1.35, sc = t * 2.6 + seed * 3.7, base = Math.floor(sc), fr = sc - base;
    var rows = Math.floor((h1 - h0 - 0.8) / lh);
    for (var j = 0; j <= rows; j++) {
      var hh = h1 - 0.8 - j * lh + fr * lh;
      if (hh > h1 - 0.5 || hh < h0 + 0.5) continue;
      var id = base + j + seed * 31;
      var ind = Math.floor(hash(id) * 3) * 1.2, len = 1.5 + hash(id + 0.5) * Math.max(1, x1 - x0 - 2.5 - ind);
      var xa = x0 + 0.8 + ind, xb = xa + len;
      CODE_Q[Math.floor(hash(id + 0.25) * 6)].push(sx(xa, yf), sy(xa, yf, hh), sx(xb, yf), sy(xb, yf, hh));
    }
  }
  function flushCode(c) {
    c.lineWidth = 0.7;
    for (var k = 0; k < 6; k++) {
      var q = CODE_Q[k];
      if (!q.length) continue;
      c.strokeStyle = CODE_COLS[k]; c.beginPath();
      for (var i = 0; i < q.length; i += 4) { c.moveTo(q[i], q[i + 1]); c.lineTo(q[i + 2], q[i + 3]); }
      c.stroke();
      q.length = 0;
    }
  }
  function monitorFrames(c, xa, xb, yb, h0, n, mh, bezel) {
    var gap = 1.4, mw = (xb - xa - gap * (n - 1)) / n;
    var bz = bezel || '#e3e6ec', bo = { left: bezel ? sh(bz, -20) : '#262b3a', right: sh(bz, -30), top: sh(bz, 20) };
    for (var m = 0; m < n; m++) {
      var mx = xa + m * (mw + gap);
      I.box(c, mx + mw / 2 - 1, yb + 0.3, 2, 2.2, h0, 2.2, '#c3c9d6');
      I.box(c, mx - 0.4, yb, mw + 0.8, 1.2, h0 + 2 - 0.4, mh + 0.8, bz, bo);
    }
  }
  function monitorScreens(c, xa, xb, yb, h0, n, active, t, seed, mh, off) {
    var gap = 1.4, mw = (xb - xa - gap * (n - 1)) / n;
    for (var m = 0; m < n; m++) {
      var mx = xa + m * (mw + gap);
      screenFace(c, mx + 0.6, mx + mw - 0.6, yb + 1.25, h0 + 2.6, h0 + 2 + mh - 0.6, active, t, seed * 7 + m, off);
    }
  }
  on('fixture', 'pc', function (p, i, S, H) {
    var c = H.ctx, t = S.t, lv = S.p.pc.level || 1, b = p.blocks[i];
    var x = (p.x + b[0]) * T, y = (p.y + b[1]) * T, w = b[2] * T, h = b[3] * T, F = FL + 0.8;
    var off = !isLit(S, p), active = !off && swActive(S);
    var X0 = sx(x, y + h) - 3, Y0 = sy(x, y, F + 32), X1 = sx(x + w, y) + 3, Y1 = sy(x + w, y + h, FL) + 5;
    if (i === 0) return ceoDesk(c, x, y, w, h, F, lv, active, t, H, X0, Y0, X1, Y1, off);
    var n = lv >= 5 ? 3 : lv >= 3 ? 2 : 1;
    var gt = geo(x + 1.5, y + 2, w - 3, h - 4, 3);
    cached(c, H, 'dsk|' + i + '|' + n, X0, Y0, X1, Y1, function (g) {
      shadowAt(g, x + 1, y + 1.5, w - 2, h - 3, 3, 0.12);
      I.box(g, x + 3, y + 3, 1.3, h - 6, F, 7, '#c9cfdb');
      I.box(g, x + w - 4.3, y + 3, 1.3, h - 6, F, 7, '#c9cfdb');
      prism(g, gt, F + 7, F + 8.3, '#cfd5e1', '#eef1f6', '#fbfcfe');
      monitorFrames(g, x + 4, x + w - 4, y + 3, F + 8.3, n, 8.5);
      I.box(g, x + 9, y + 8.5, 12, 3, F + 8.3, 0.6, '#e4e8ef');
      I.box(g, x + 23, y + 9, 2, 2.6, F + 8.3, 0.7, '#e4e8ef');
      if (i % 2) I.box(g, x + 5, y + 9.5, 2.4, 2.4, F + 8.3, 3, ['#ff7eb6', '#7fe3ff', '#ffe27a'][i % 3]);
      else { var pp = { x: sx(x + 6, y + 10), y: sy(x + 6, y + 10, F + 8.3) };
        g.fillStyle = '#e0e4ec'; g.fillRect(pp.x - 1.4, pp.y - 2.5, 2.8, 2.5);
        g.fillStyle = '#56b765'; disc(g, pp.x, pp.y - 4, 2.4); g.fill(); }
    });
    if (lv >= 4 && !off) {
      c.strokeStyle = 'hsl(' + Math.round((t * 70 + i * 90) % 360) + ',90%,62%)'; c.lineWidth = 0.8;
      c.beginPath(); chain(c, gt, F + 6.8); c.stroke();
    }
    monitorScreens(c, x + 4, x + w - 4, y + 3, F + 8.3, n, active, t, i, 8.5, off);
    flushCode(c);
  });
  function ceoDesk(c, x, y, w, h, F, lv, active, t, H, X0, Y0, X1, Y1, off) {
    var ht = F + 9.4, side2 = lv >= 3;
    var tp = { x: sx(x + w - 4, y + 10), y: sy(x + w - 4, y + 10, ht) };
    cached(c, H, 'ceo|' + (side2 ? 1 : 0), X0, Y0, X1, Y1, function (g) {
      shadowAt(g, x + 0.5, y + 1, w - 1, h - 2, 3, 0.16);
      var gb = geo(x + 1, y + 1.8, w - 2, h - 3.6, 3);
      prism(g, gb, F, F + 7.4, '#5b3a26', '#86603f', null);
      g.beginPath(); chain(g, gb, F + 1.2); g.lineWidth = 0.6; g.strokeStyle = '#f5c542'; g.stroke();
      prism(g, gb, F + 7.4, F + 8.4, '#c98f0f', '#ffd24a', null);
      var gt = geo(x + 0.6, y + 1.2, w - 1.2, h - 2.4, 3.5);
      prism(g, gt, F + 8.4, ht, '#e3ded4', '#fbf8f2', '#fffdf8');
      monitorFrames(g, x + 3.5, x + w - (side2 ? 9.5 : 4.5), y + 2.4, ht, 1, 10.5, '#f5b21c');
      if (side2) I.box(g, x + w - 8, y + 2.6, 5, 1.1, ht + 2, 13, '#2f2c46', { left: '#262b3a', right: '#3f3a58', top: '#4a4570' });
      g.fillStyle = '#c98f0f'; g.fillRect(tp.x - 2, tp.y - 1.4, 4, 1.4);
      g.fillStyle = '#f5b21c'; g.fillRect(tp.x - 0.6, tp.y - 4, 1.2, 2.8);
      g.beginPath(); g.moveTo(tp.x - 3, tp.y - 8.5); g.lineTo(tp.x + 3, tp.y - 8.5); g.quadraticCurveTo(tp.x + 2.6, tp.y - 3.6, tp.x, tp.y - 3.8);
      g.quadraticCurveTo(tp.x - 2.6, tp.y - 3.6, tp.x - 3, tp.y - 8.5); g.fill();
      g.fillStyle = '#ffe07a'; g.fillRect(tp.x - 2, tp.y - 8.2, 1.2, 3);
      I.box(g, x + 9, y + 8.5, 13, 3, ht, 0.6, '#3a3550');
      var cp = { x: sx(x + 4, y + 10.5), y: sy(x + 4, y + 10.5, ht) };
      g.fillStyle = '#ffffff'; g.fillRect(cp.x - 1.5, cp.y - 2.2, 3, 2.2);
      pill(g, cp.x - 1, cp.y - 6.5, 2, 4.6, '#3f9a55'); g.fillRect(cp.x - 2.4, cp.y - 5, 1.4, 1);
      var np = { x: sx(x + w / 2 + 1, y + h - 1.8), y: sy(x + w / 2 + 1, y + h - 1.8, F + 4) };
      pill(g, np.x - 7.5, np.y - 3, 15, 6, '#2f2c46', null);
      pill(g, np.x - 6.8, np.y - 2.4, 13.6, 4.8, '#ffd24a', null);
      font(g, 4.2, H, 900); g.fillStyle = '#5a3b00'; g.fillText('CEO', np.x, np.y + 0.2);
    });
    monitorScreens(c, x + 3.5, x + w - (side2 ? 9.5 : 4.5), y + 2.4, ht, 1, active, t, 0, 10.5, off);
    if (side2) screenFace(c, x + w - 7.5, x + w - 3.5, y + 3.75, ht + 2.6, ht + 14.4, active, t, 5, off);
    flushCode(c);
    twinkle(c, tp.x + 2.5, tp.y - 9, 1.2 + Math.abs(Math.sin(t * 3)) * 1.2, '#ffffff');
  }
  function ceoChair(c, wx, wy, F, t) {
    var px = sx(wx, wy), py = sy(wx, wy, F);
    c.fillStyle = 'rgba(46,40,78,0.2)'; c.beginPath(); c.ellipse(px, py, 5.5, 2.6, 0, 0, 7); c.fill();
    c.strokeStyle = '#3a3550'; c.lineWidth = 0.9; c.beginPath();
    c.moveTo(px - 3.8, py - 0.4); c.lineTo(px + 3.8, py + 0.4); c.moveTo(px - 1.6, py + 1.6); c.lineTo(px + 1.6, py - 1.6); c.stroke();
    c.fillStyle = '#8d94a8'; c.fillRect(px - 0.6, py - 5, 1.2, 5);
    var bx = px - 2.6, by = py - 6.8;
    pill(c, bx - 4.6, by - 13.5, 9.2, 15, '#2f2c46', null);
    pill(c, bx - 3.9, by - 12.8, 7.8, 13.6, '#f5b21c', null);
    pill(c, bx - 2.8, by - 11.4, 5.6, 10.4, '#d8344f', null);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(bx - 2.2, by - 10.4, 1, 7);
    pill(c, px - 5.2, py - 8.6, 10.4, 4.6, '#2f2c46', null);
    pill(c, px - 4.6, py - 8.2, 9.2, 3.8, '#c98f0f', null);
    pill(c, px - 3.9, py - 8.4, 7.8, 2.6, '#e8405c', null);
    c.fillStyle = '#ffd24a'; c.fillRect(px - 5.6, py - 11, 1.6, 4); c.fillRect(px + 4, py - 10, 1.6, 4);
    var cx = bx, cy = by - 21 - Math.sin(t * 2.5) * 1.5;
    c.fillStyle = '#2f2c46';
    c.beginPath(); c.moveTo(cx - 5.2, cy + 3); c.lineTo(cx - 5.2, cy - 3.2); c.lineTo(cx - 2.6, cy - 0.5); c.lineTo(cx, cy - 4.6);
    c.lineTo(cx + 2.6, cy - 0.5); c.lineTo(cx + 5.2, cy - 3.2); c.lineTo(cx + 5.2, cy + 3); c.closePath(); c.fill();
    c.fillStyle = '#ffd24a';
    c.beginPath(); c.moveTo(cx - 4.2, cy + 2.2); c.lineTo(cx - 4.2, cy - 1.6); c.lineTo(cx - 2.4, cy + 0.6); c.lineTo(cx, cy - 3);
    c.lineTo(cx + 2.4, cy + 0.6); c.lineTo(cx + 4.2, cy - 1.6); c.lineTo(cx + 4.2, cy + 2.2); c.closePath(); c.fill();
    c.fillStyle = '#e2508a'; disc(c, cx, cy + 0.8, 0.9); c.fill();
    twinkle(c, cx + 4.5, cy - 4, 1 + Math.abs(Math.sin(t * 4)) * 1.4, '#ffffff');
  }
  on('base', 'hwlab', function (p, S, H) {
    var c = H.ctx, t = S.t, own = S.p.hwlab.owned;
    var x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T, F = FL + 0.8;
    cached(c, H, 'hlb|' + (own ? 1 : 0), sx(x, y + h) - 3, sy(x, y, F + 30), sx(x + w, y) + 3, sy(x + w, y + h, FL - 1) + 5, function (g) {
      shadowAt(g, x, y, w, h, 8, 0.14);
      var gf = geo(x + 0.5, y + 0.5, w - 1, h - 1, 8);
      prism(g, gf, FL - 1, F, '#d6dbe5', '#f6f8fb', own ? '#eef5fb' : '#e9e9ee');
      g.strokeStyle = own ? 'rgba(120,160,200,0.22)' : 'rgba(150,150,160,0.2)'; g.lineWidth = 0.5; g.beginPath();
      for (var gx = x + 8; gx < x + w - 1; gx += 8) { g.moveTo(sx(gx, y + 1), sy(gx, y + 1, F)); g.lineTo(sx(gx, y + h - 1), sy(gx, y + h - 1, F)); }
      for (var gy = y + 8; gy < y + h - 1; gy += 8) { g.moveTo(sx(x + 1, gy), sy(x + 1, gy, F)); g.lineTo(sx(x + w - 1, gy), sy(x + w - 1, gy, F)); }
      g.stroke();
      g.strokeStyle = '#ef7d2e'; g.lineWidth = 0.8; top(g, inset(gf, 2.5), F + 0.05); g.stroke();
      if (own) {
        var cab = ['#2bb8d8', '#e2508a', '#f5b21c'];
        g.lineWidth = 0.8;
        for (var cb = 0; cb < 3; cb++) {
          var ax0 = x + 30 + cb * 10, ay0 = y + 26, bx1 = x + 22 + cb * 3, by1 = y + 50;
          g.strokeStyle = cab[cb]; g.beginPath();
          g.moveTo(sx(ax0, ay0), sy(ax0, ay0, F + 0.1));
          g.quadraticCurveTo(sx(ax0 - 14, ay0 + 14), sy(ax0 - 14, ay0 + 14, F + 0.1), sx(bx1, by1), sy(bx1, by1, F + 0.1));
          g.stroke();
        }
      }
      g.fillStyle = 'rgba(205,232,250,0.55)'; vqY(g, x + 1, x + w - 1, y + 2.5, F, F + 8); g.fill();
      for (var s0 = 0; s0 < (w - 2) / 5; s0++) {
        var v0 = x + 1 + s0 * 5, v1 = Math.min(x + w - 1, v0 + 2.5);
        g.fillStyle = s0 % 2 ? '#2f2c46' : '#f5c542'; vqY(g, v0, v1, y + 2.45, F + 5.2, F + 6.6); g.fill();
      }
      I.box(g, x + 1, y + 1, w - 2, 1.5, F + 8, 1, '#ef7d2e');
      if (!own) {
        var yt = y + h - 1.5;
        for (var s = -2; s < w / 5 + 2; s++) {
          var u0 = Math.max(x + 2, x + s * 5), u1 = Math.min(x + w - 2, x + s * 5 + 2.5);
          if (u1 <= u0) continue;
          g.fillStyle = s % 2 ? '#2f2c46' : '#f5c542';
          vqY(g, u0, u1, yt, F, F + 2.4); g.fill();
        }
      }
    });
    seatPads(c, p.id, 'rd', F, t, '#ef7d2e');
  });
  on('fixture', 'hwlab', function (p, i, S, H) {
    var c = H.ctx, t = S.t, own = S.p.hwlab.owned, lv = own ? S.p.hwlab.level : 0;
    var b = p.blocks[i], x = (p.x + b[0]) * T, y = (p.y + b[1]) * T, w = b[2] * T, h = b[3] * T, F = FL + 0.8;
    var busy = own && S.rdLevel() < QT.G.rdCap();
    var ht = F + 8.2, tiers = 1 + Math.ceil(lv / 2), nIns = Math.min(4, 1 + Math.floor(lv / 2));
    var fx = sx(x + 8, y + 8), fy = sy(x + 8, y + 8, ht);
    cached(c, H, 'hlf|' + i + '|' + (own ? lv : 0), sx(x, y + h) - 3, sy(x, y, F + 30), sx(x + w, y) + 3, sy(x + w, y + h, FL) + 5, function (g) {
      shadowAt(g, x + 1, y + 1.5, w - 2, h - 3, 3, 0.12);
      if (!own) {
        I.box(g, x + 2, y + 2.5, w - 4, h - 5, F, 8, '#dfe3ea', { stroke: 'rgba(255,255,255,0.8)', lw: 0.5 });
        g.fillStyle = 'rgba(255,255,255,0.4)'; top(g, geo(x + 2, y + 2.5, w - 4, h - 5, 2), F + 8.2); g.fill();
        return;
      }
      I.box(g, x + 2, y + 3, 1.3, h - 6, F, 7, '#c0c6d2');
      I.box(g, x + w - 3.3, y + 3, 1.3, h - 6, F, 7, '#c0c6d2');
      prism(g, geo(x + 1, y + 1.8, w - 2, h - 3.6, 2.5), F + 7, ht, '#b9c1cf', '#e3e8f0', '#f4f6fa');
      if (i === 0) {
        for (var k = tiers - 1; k >= 0; k--) {
          var rr = 4.6 - k * 0.8, hh = 12 - k * 2.6;
          g.fillStyle = '#b8860b'; g.fillRect(fx - rr, fy - hh, rr * 2, 1);
          g.fillStyle = '#ffd24a'; g.beginPath(); g.ellipse(fx, fy - hh, rr, rr * 0.5, 0, 0, 7); g.fill();
          g.strokeStyle = '#d9a21e'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(fx - rr * 0.6, fy - hh); g.lineTo(fx - rr * 0.6, fy - hh + 2.6); g.moveTo(fx + rr * 0.6, fy - hh); g.lineTo(fx + rr * 0.6, fy - hh + 2.6); g.stroke();
        }
        pill(g, fx - 6, fy - 16, 12, 16, 'rgba(210,235,255,0.28)', 'rgba(255,255,255,0.8)', 0.5);
        for (var m0 = 0; m0 < nIns; m0++) {
          var ix0 = x + 16 + m0 * 11.5;
          I.box(g, ix0, y + 2.5, 10, 7, ht, 8 + (m0 % 2) * 2, '#3a3350', { left: '#2b2640', right: '#4a4270', top: '#5c5480' });
          g.fillStyle = '#0b1f1a'; vqY(g, ix0 + 1, ix0 + 7.2, y + 9.55, ht + 1.6, ht + 6.8 + (m0 % 2) * 2); g.fill();
        }
      } else if (i === 1) {
        var mx0 = sx(x + 6, y + 7), my0 = sy(x + 6, y + 7, ht);
        g.fillStyle = '#e9ecf2'; g.fillRect(mx0 - 3, my0 - 1.2, 6, 1.2);
        g.fillStyle = '#5c5480'; g.fillRect(mx0 + 1.2, my0 - 9, 1.6, 8);
        g.save(); g.translate(mx0 - 0.5, my0 - 8.5); g.rotate(-0.5); g.fillStyle = '#3a3350'; g.fillRect(-1.2, -4, 2.4, 6); g.restore();
      } else {
        var ax0 = sx(x + 7, y + 8), ay0 = sy(x + 7, y + 8, ht);
        g.fillStyle = '#ef7d2e'; g.fillRect(ax0 - 2.5, ay0 - 3, 5, 3);
      }
    });
    if (!own) return;
    if (i === 0) {
      c.fillStyle = busy && Math.sin(t * 6) > 0 ? '#7ff0ff' : '#a98bff'; c.fillRect(fx - 1, fy - 2.6, 2, 1.6);
      for (var m = 0; m < nIns; m++) {
        var ix = x + 16 + m * 11.5;
        var yf = y + 9.55, h0 = ht + 1.6, h1 = ht + 6.8 + (m % 2) * 2;
        c.strokeStyle = m % 2 ? '#7ff0ff' : '#8dff9e'; c.lineWidth = 0.6; c.beginPath();
        for (var s = 0; s <= 10; s++) {
          var u = ix + 1.3 + s * 0.56, v = (h0 + h1) / 2 + Math.sin(s * 0.9 + t * (busy ? 8 : 2) + m) * (h1 - h0) * 0.32;
          if (!s) c.moveTo(sx(u, yf), sy(u, yf, v)); else c.lineTo(sx(u, yf), sy(u, yf, v));
        }
        c.stroke();
        c.fillStyle = (Math.floor(t * 3) + m) % 3 ? '#ef7d2e' : '#ffe27a';
        c.fillRect(sx(ix + 8.6, yf) - 0.6, sy(ix + 8.6, yf, h0 + 1.5) - 0.6, 1.2, 1.2);
      }
    } else if (i === 1) {
      var cpx = sx(x + 11, y + 9), cpy = sy(x + 11, y + 9, ht);
      var gl = busy ? 0.55 + 0.45 * Math.sin(t * 5) : 0.3;
      c.fillStyle = 'rgba(127,240,255,' + (gl * 0.5) + ')'; disc(c, cpx, cpy - 1, 4.5); c.fill();
      c.fillStyle = '#2bb8d8'; c.fillRect(cpx - 2, cpy - 2, 4, 2);
      c.fillStyle = '#ffffff'; c.fillRect(cpx - 0.8, cpy - 1.6, 1.6, 1);
      if (busy) {
        var hx = cpx, hy = cpy - 13 + Math.sin(t * 2) * 0.8, a = t * 1.6, hr = 4.2;
        c.strokeStyle = 'rgba(127,240,255,0.85)'; c.lineWidth = 0.6; c.beginPath();
        for (var v = 0; v <= 4; v++) {
          var av = a + v * Math.PI / 2, vx = hx + Math.cos(av) * hr, vy = hy + Math.sin(av) * hr * 0.5;
          if (!v) c.moveTo(vx, vy); else c.lineTo(vx, vy);
        }
        for (var v2 = 0; v2 < 4; v2++) {
          var aw = a + v2 * Math.PI / 2;
          c.moveTo(hx + Math.cos(aw) * hr, hy + Math.sin(aw) * hr * 0.5); c.lineTo(hx + Math.cos(aw) * hr, hy + Math.sin(aw) * hr * 0.5 + 2.4);
        }
        c.stroke();
        c.fillStyle = 'rgba(127,240,255,0.18)';
        c.beginPath(); c.moveTo(cpx - 2, cpy - 2); c.lineTo(hx - hr, hy + 1); c.lineTo(hx + hr, hy + 1); c.lineTo(cpx + 2, cpy - 2); c.fill();
      }
    } else {
      var ax = sx(x + 7, y + 8), ay = sy(x + 7, y + 8, ht);
      var a1 = -1.2 + Math.sin(t * (busy ? 2.2 : 0.6)) * 0.4, a2 = a1 + 1.3 + Math.sin(t * (busy ? 3 : 0.8) + 1) * 0.5;
      var j1x = ax + Math.cos(a1) * 7, j1y = ay - 3 + Math.sin(a1) * 7, j2x = j1x + Math.cos(a2) * 6, j2y = j1y + Math.sin(a2) * 6;
      c.strokeStyle = '#ef7d2e'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ax, ay - 3); c.lineTo(j1x, j1y); c.stroke();
      c.strokeStyle = '#f7a45e'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(j1x, j1y); c.lineTo(j2x, j2y); c.stroke();
      c.lineCap = 'butt';
      c.fillStyle = '#3a3350'; disc(c, j1x, j1y, 1.2); c.fill();
      if (busy && Math.sin(t * 9) > 0.3) { c.fillStyle = '#fff6c8'; disc(c, j2x, j2y, 1.4); c.fill(); twinkle(c, j2x, j2y, 2.6, 'rgba(255,240,180,0.9)'); }
    }
  });
  on('floor', 'sw', function (r, S, H) {
    var c = H.ctx, t = S.t;
    var x0 = r.ix * T, y0 = r.iy * T, w = r.iw * T, h = r.ih * T;
    c.fillStyle = '#f6f4f0';
    I.facePath(c, x0, y0, w, h, FL); c.fill();
    c.strokeStyle = 'rgba(150,140,125,0.16)'; c.lineWidth = 0.6; c.beginPath();
    for (var gx = x0 + 2 * T; gx < x0 + w; gx += 2 * T) { c.moveTo(sx(gx, y0), sy(gx, y0, FL)); c.lineTo(sx(gx, y0 + h), sy(gx, y0 + h, FL)); }
    for (var gy = y0 + 2 * T; gy < y0 + h; gy += 2 * T) { c.moveTo(sx(x0, gy), sy(x0, gy, FL)); c.lineTo(sx(x0 + w, gy), sy(x0 + w, gy, FL)); }
    c.stroke();
    var up = W.ROOMS[r.index + 1];
    var gx0 = up ? (up.door.x - 1) * T - 3 : x0 + w, gx1 = up ? (up.door.x + up.door.w + 1) * T + 8 : x0 + w;
    var wx0 = (r.ix - 1) * T + 2, wx1 = (r.ix + r.iw + 1) * T - 2;
    glassWall(c, wx0, gx0, y0, t, 'L');
    glassWall(c, gx1, wx1, y0, t, 'R');
    var pw = 3 * T, yy, y2;
    c.fillStyle = '#b3d7ee'; c.beginPath();
    for (yy = y0 + 1; yy < y0 + h - 4; yy += pw) { y2 = Math.min(y0 + h - 2, yy + pw - 1.2); vqXadd(c, x0 + 0.05, yy, y2, FL + 3, FL + 18.5); }
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath();
    for (yy = y0 + 1; yy < y0 + h - 4; yy += pw) {
      y2 = Math.min(y0 + h - 2, yy + pw - 1.2); vqXadd(c, x0 + 0.06, yy, y2, FL + 13, FL + 18.5);
      c.moveTo(sx(x0, yy + 4), sy(x0, yy + 4, FL + 13)); c.lineTo(sx(x0, yy + 13), sy(x0, yy + 13, FL + 13));
      c.lineTo(sx(x0, yy + 4), sy(x0, yy + 4, FL + 4)); c.closePath();
    }
    c.fill();
    atomScreen(c, (r.ix + 2.5) * T, y0 - 0.5, FL + H.H_WALL * 0.55, t, H);
    neonLogo(c, x0 + 1, y0 + 4.1 * T, FL + 13, t, H);
    ticker(c, (r.ix + r.iw - 6.2) * T, (r.ix + r.iw - 0.6) * T, y0 + 0.02, FL + 12.5, FL + 19, t, S, H);
    devBoard(c, S, H, t, x0 + 0.12);
    tree(c, x0 + 0.9 * T, y0 + 0.9 * T, 0.95, t, 1, H);
    tree(c, x0 + w - 0.9 * T, y0 + 0.9 * T, 0.95, t, 2, H);
  });
  var DEVB = { y0: 94.7, y1: 98.3, h0: FL + 6, h1: FL + 28 };
  function devBoard(c, S, H, t, xw) {
    var y0 = DEVB.y0 * T, y1 = DEVB.y1 * T, L = y1 - y0, HH = DEVB.h1 - DEVB.h0;
    var on = isLit(S, W.BY_ID.pc), G = QT.G, cap = G.CFG.stockCap, sN = Math.min(cap, S.swStock);
    var ox = sx(xw, y1), oy = sy(xw, y1, DEVB.h1);
    var cw = (L - 6 - 5 * 1.2) / 6;
    cached(c, H, 'devb|' + (on ? 1 : 0), sx(xw, y1) - 2, sy(xw, y0, DEVB.h1) - 2, sx(xw, y0) + 2, sy(xw, y1, DEVB.h0) + 2, function (g) {
      g.transform(A, -B, 0, 1, ox, oy);
      rrect(g, -1.2, -1.2, L + 2.4, HH + 2.4, 2.5); g.fillStyle = '#2f2c46'; g.fill();
      rrect(g, 0, 0, L, HH, 2); g.fillStyle = on ? '#2bb8d8' : '#6b7085'; g.fill();
      rrect(g, 1.3, 1.3, L - 2.6, HH - 2.6, 1.5); g.fillStyle = on ? '#0b0f24' : '#1c1f2c'; g.fill();
      font(g, 5.2, H, 900); g.textAlign = 'left';
      g.fillStyle = on ? '#8dff9e' : '#6b7085'; g.fillText('</>', 3, 4.6);
      g.fillStyle = on ? '#ffffff' : '#6b7085'; g.fillText('DEV', 14, 4.6);
      g.fillStyle = on ? 'rgba(80,110,160,0.45)' : 'rgba(80,90,110,0.35)'; g.beginPath();
      for (var s0 = 0; s0 < cap && s0 < 12; s0++) g.rect(3 + (s0 % 6) * (cw + 1.2), 8.2 + Math.floor(s0 / 6) * 4.4, cw, 3.4);
      g.fill();
      g.fillStyle = 'rgba(80,110,160,0.35)'; g.fillRect(3, 17.4, L - 6, 2.4);
    });
    if (!on) return;
    var job = null;
    for (var ji = 0; ji < S.jobs.length; ji++) if (S.jobs[ji].kind === 'sw' && S.jobs[ji].done < S.jobs[ji].work) { job = S.jobs[ji]; break; }
    c.save();
    c.transform(A, -B, 0, 1, ox, oy);
    c.fillStyle = '#2bd8f0'; c.beginPath();
    for (var s1 = 0; s1 < sN; s1++) c.rect(3 + (s1 % 6) * (cw + 1.2), 8.2 + Math.floor(s1 / 6) * 4.4, cw, 3.4);
    c.fill();
    if (sN > 0) {
      var ls = sN - 1;
      c.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(t * 5)).toFixed(2) + ')';
      c.fillRect(3 + (ls % 6) * (cw + 1.2), 8.2 + Math.floor(ls / 6) * 4.4, cw, 1.2);
    }
    if (job) { c.fillStyle = '#8dff9e'; c.fillRect(3, 17.4, (L - 6) * Math.min(1, job.done / job.work), 2.4); }
    else { c.fillStyle = 'rgba(141,255,158,0.35)'; c.fillRect(3 + frac(t * 0.4) * (L - 12), 17.4, 6, 2.4); }
    font(c, 5.2, H, 900); c.textAlign = 'right';
    c.fillStyle = '#7fe3ff'; c.fillText(sN + '/' + cap, L - 3, 4.6);
    c.restore();
  }
  var RDB = { x: 26.2, y: 96.6, hw: 15, h0: FL + 12, h1: FL + 40 };
  function rdBoard(c, S, H, t) {
    var G = QT.G, own = S.p.hwlab.owned, lvR = own ? S.rdLevel() : 0, cap = own ? G.rdCap() : 0, per = G.CFG.rdPerLevel;
    var prog = own && lvR < cap ? clamp01((S.rd - lvR * per) / per) : 0;
    var X = sx(RDB.x * T, RDB.y * T), Yb = sy(RDB.x * T, RDB.y * T, 0), hw = RDB.hw;
    var yT = Yb - RDB.h1, yB = Yb - RDB.h0;
    var bx0 = X - 12.7, bw = 3.4, bgap = 4.4, bBot = yB - 3;
    cached(c, H, 'rdb|' + (own ? 1 : 0) + '|' + lvR + '|' + cap, X - hw - 3, yT - 3, X + hw + 3, Yb + 2, function (g) {
      g.fillStyle = '#8d94a8';
      g.fillRect(X - 9, yB, 1.6, sy(26.05 * T, 96.95 * T, FL) - yB);
      g.fillRect(X + 7.4, yB, 1.6, sy(26.8 * T, 96.0 * T, FL) - yB);
      rrect(g, X - hw - 1.4, yT - 1.4, hw * 2 + 2.8, yB - yT + 2.8, 4); g.fillStyle = '#2f2c46'; g.fill();
      rrect(g, X - hw, yT, hw * 2, yB - yT, 3); g.fillStyle = own ? '#ef7d2e' : '#8d94a8'; g.fill();
      rrect(g, X - hw + 1.5, yT + 1.5, hw * 2 - 3, yB - yT - 3, 2); g.fillStyle = own ? '#1a1230' : '#262a3a'; g.fill();
      font(g, 4.8, H, 900); g.textAlign = 'left';
      g.fillStyle = own ? '#ffb070' : '#8d94a8'; g.fillText('R&D', X - hw + 2.6, yT + 5);
      g.textAlign = 'right'; g.fillStyle = '#ffffff'; g.fillText(own ? lvR + '/' + cap : '-', X + hw - 2.6, yT + 5);
      for (var i = 0; i < 6; i++) {
        var bh = 4 + i * 2.3, bx = bx0 + i * bgap;
        if (i < lvR) {
          g.fillStyle = '#ffc94a'; g.fillRect(bx, bBot - bh, bw, bh);
          g.fillStyle = '#fff2c0'; g.fillRect(bx, bBot - bh, bw, 1);
        } else if (i < cap) {
          g.fillStyle = 'rgba(239,125,46,0.25)'; g.fillRect(bx, bBot - bh, bw, bh);
          g.strokeStyle = '#ef7d2e'; g.lineWidth = 0.6; g.strokeRect(bx + 0.3, bBot - bh + 0.3, bw - 0.6, bh - 0.6);
        } else {
          g.fillStyle = 'rgba(140,140,170,0.35)'; g.fillRect(bx, bBot - bh, bw, bh);
          if (i === cap) {
            var lx = bx + bw / 2, ly = bBot - bh / 2 - 1;
            g.strokeStyle = '#c3c8d4'; g.lineWidth = 0.7; g.beginPath(); g.arc(lx, ly - 0.6, 1.3, Math.PI, 0); g.stroke();
            g.fillStyle = '#c3c8d4'; g.fillRect(lx - 1.8, ly - 0.6, 3.6, 2.6);
          }
        }
      }
    });
    if (!own) return;
    if (lvR < cap) {
      var i2 = lvR, bh2 = 4 + i2 * 2.3, bx2 = bx0 + i2 * bgap;
      if (prog > 0) { c.fillStyle = '#ef7d2e'; c.fillRect(bx2, bBot - bh2 * prog, bw, bh2 * prog); }
      if (Math.sin(t * 5) > 0) { c.strokeStyle = '#ffe27a'; c.lineWidth = 0.7; c.strokeRect(bx2 - 0.4, bBot - bh2 - 0.4, bw + 0.8, bh2 + 0.8); }
    } else if (lvR >= 6) {
      var ph = frac(t * 0.8);
      c.globalAlpha = Math.sin(ph * Math.PI);
      twinkle(c, bx0 + 5 * bgap + bw / 2, bBot - 15.5 - ph * 4, 2.2, '#fff6c8');
      c.globalAlpha = 1;
    }
  }
  function glassWall(c, xa, xb, y, t, tag) {
    if (xb - xa < 8) return;
    var pw = 3 * T, x, x2;
    c.fillStyle = '#bfe0f3'; c.beginPath();
    for (x = xa; x < xb - 4; x += pw) { x2 = Math.min(xb, x + pw - 1.2); vqYadd(c, x, x2, y - 0.05, FL + 3, FL + 18.5); }
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath();
    for (x = xa; x < xb - 4; x += pw) {
      x2 = Math.min(xb, x + pw - 1.2); vqYadd(c, x, x2, y - 0.06, FL + 13, FL + 18.5);
      c.moveTo(sx(x + 5, y), sy(x + 5, y, FL + 13)); c.lineTo(sx(x + 14, y), sy(x + 14, y, FL + 13));
      c.lineTo(sx(x + 5, y), sy(x + 5, y, FL + 4)); c.closePath();
    }
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.8; c.beginPath();
    c.moveTo(sx(xa, y), sy(xa, y, FL + 11)); c.lineTo(sx(xb, y), sy(xb, y, FL + 11)); c.stroke();
  }
  function vqYadd(c, x0, x1, y, h0, h1) {
    c.moveTo(sx(x0, y), sy(x0, y, h0)); c.lineTo(sx(x1, y), sy(x1, y, h0));
    c.lineTo(sx(x1, y), sy(x1, y, h1)); c.lineTo(sx(x0, y), sy(x0, y, h1)); c.closePath();
  }
  function vqXadd(c, x, y0, y1, h0, h1) {
    c.moveTo(sx(x, y0), sy(x, y0, h0)); c.lineTo(sx(x, y1), sy(x, y1, h0));
    c.lineTo(sx(x, y1), sy(x, y1, h1)); c.lineTo(sx(x, y0), sy(x, y0, h1)); c.closePath();
  }
  var LOGO_COLS = ['#ff5aa5', '#ff9a3c', '#ffd23f', '#3ddc84', '#2bb8d8', '#8a6cff', '#ff5aa5'];
  var LOGO_W = null;
  function logoW(c, H) {
    if (!LOGO_W) {
      c.font = '900 11px ' + H.FONT; var old = c.measureText('QUANTUM').width;
      c.font = '900 12.5px ' + H.FONT; LOGO_W = [old, c.measureText('QUANTUM').width];
    }
    return LOGO_W;
  }
  function atomScreen(c, wx, wy, h, t, H) {
    var lw = logoW(c, H), px = sx(wx, wy) + lw[0] / 2, py = sy(wx, wy, h), w2 = lw[1] / 2 + 9;
    pill(c, px - w2, py - 13, w2 * 2, 26, '#1b1830', null);
    pill(c, px - w2 + 1.6, py - 11.4, w2 * 2 - 3.2, 22.8, '#271f52', null);
    var ax = px - w2 + 16, i;
    c.lineWidth = 0.9;
    for (i = 0; i < 3; i++) {
      c.strokeStyle = LOGO_COLS[i * 2];
      c.beginPath(); c.ellipse(ax, py, 10, 3.6, i * Math.PI / 3 + t * 0.3, 0, 7); c.stroke();
      var a = t * (2 + i * 0.7) + i * 2, ca = Math.cos(i * Math.PI / 3 + t * 0.3), sa = Math.sin(i * Math.PI / 3 + t * 0.3);
      var ex = Math.cos(a) * 10, ey = Math.sin(a) * 3.6;
      c.fillStyle = '#ffffff'; disc(c, ax + ex * ca - ey * sa, py + ex * sa + ey * ca, 1.2); c.fill();
    }
    c.fillStyle = '#ff5aa5'; disc(c, ax, py, 2.4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; disc(c, ax - 0.7, py - 0.7, 0.8); c.fill();
    var bx0 = ax + 16, n = 11, bw = (px + w2 - 6 - bx0) / n;
    for (i = 0; i < n; i++) {
      var bh = 3 + 12 * Math.abs(Math.sin(t * (2.2 + (i % 4) * 0.5) + i * 1.3));
      c.fillStyle = LOGO_COLS[i % 6];
      c.fillRect(bx0 + i * bw, py + 8 - bh, bw * 0.7, bh);
    }
  }
  function neonLogo(c, wx, wy, h, t, H) {
    var s = 'QUANTUM', i;
    var px = sx(wx, wy), py = sy(wx, wy, h), tw = logoW(c, H)[1];
    pill(c, px - tw / 2 - 9, py - 13, tw + 18, 26, '#2f2c46', null);
    var gl = GR.logoRim;
    if (!gl) {
      gl = c.createLinearGradient(px - tw / 2 - 9, 0, px + tw / 2 + 9, 0);
      for (i = 0; i < LOGO_COLS.length; i++) gl.addColorStop(i / (LOGO_COLS.length - 1), LOGO_COLS[i]);
      GR.logoRim = gl;
    }
    pill(c, px - tw / 2 - 7.2, py - 11.2, tw + 14.4, 22.4, null, gl, 1.6);
    var k = Math.floor(frac(t * 0.8) * 6), key = 'logo' + k, gt = GR[key];
    if (!gt) {
      var x0 = px - tw / 2 - tw * k / 6;
      gt = c.createLinearGradient(x0, 0, x0 + tw * 2, 0);
      for (i = 0; i <= 12; i++) gt.addColorStop(i / 12, LOGO_COLS[i % 6]);
      GR[key] = gt;
    }
    font(c, 12.5, H, 900);
    c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = 'rgba(255,255,255,0.18)'; c.strokeText(s, px, py + 0.6);
    c.fillStyle = Math.sin(t * 1.3) > 0.97 ? '#ffffff' : gt;
    c.fillText(s, px, py + 0.6);
    for (var q = 0; q < 2; q++) {
      var ph = frac(t * 0.9 + q * 0.5);
      c.globalAlpha = Math.sin(ph * Math.PI);
      twinkle(c, q ? px + tw / 2 + 5 : px - tw / 2 - 5, py - 10, 2.8, '#fff6c8');
    }
    c.globalAlpha = 1;
  }
  var TICK = { v: null, msg: '', w: 0 };
  function ticker(c, xa, xb, y, h0, h1, t, S, H) {
    c.fillStyle = '#1b1830'; vqY(c, xa - 1, xb + 1, y, h0 - 1, h1 + 1); c.fill();
    c.fillStyle = '#0c0a18'; vqY(c, xa, xb, y, h0, h1); c.fill();
    var v = 0;
    try { v = S.marketCap(); } catch (e) { v = 0; }
    var vk = Math.round(v / 1e4);
    if (vk !== TICK.v) { TICK.v = vk; TICK.msg = 'QTYC  ¥' + QT.G.fmt(v) + ' ▲   QUANTUM TYCOON ★   '; TICK.w = 0; }
    var msg = TICK.msg;
    c.save();
    vqY(c, xa, xb, y, h0, h1); c.clip();
    c.transform(A, B, 0, 1, sx(xa, y), sy(xa, y, (h0 + h1) / 2));
    font(c, 4.8, H, 900); c.textAlign = 'left';
    if (!TICK.w) TICK.w = c.measureText(msg).width;
    var mw = TICK.w, len = xb - xa, off = frac(t * 12 / mw) * mw;
    c.fillStyle = '#ffd23f';
    c.fillText(msg, len - off, 0.3);
    if (len - off > 0) c.fillText(msg, len - off - mw, 0.3);
    c.restore();
  }
  var DECOR = null;
  function decorList(r) {
    if (DECOR) return DECOR;
    var x0 = r.ix, y0 = r.iy;
    DECOR = [
      { k: 'tree', x: x0 + 0.8, y: y0 + 15.8, s: 0.85 },
      { k: 'tree', x: x0 + r.iw - 0.8, y: y0 + 3.2, s: 0.85 },
      { k: 'tree', x: x0 + r.iw - 0.8, y: y0 + 9.5, s: 0.9 },
      { k: 'tree', x: x0 + r.iw - 0.8, y: y0 + 15.8, s: 0.85 },
      { k: 'fountain', x: x0 + 2.6, y: y0 + 21.3 },
      { k: 'flowers', x: x0 + r.iw - 3.2, y: y0 + 22.2 },
      { k: 'balloons', x: x0 + r.iw - 0.8, y: y0 + 24.1 }
    ];
    return DECOR;
  }
  on('scene', 'sw', function (r, S, H, push) {
    var t = S.t;
    decorList(r).forEach(function (d, i) {
      var wx = d.x * T, wy = d.y * T;
      if (d.k === 'tree') push({ x: wx - 5, y: wy - 5, w: 10, h: 10, draw: function () { tree(H.ctx, wx, wy, d.s, t, i + 4, H); } });
      else if (d.k === 'fountain') push({ x: wx - 22, y: wy - 22, w: 44, h: 44, draw: function () { fountain(H.ctx, wx, wy, t, H); } });
      else if (d.k === 'flowers') push({ x: wx - 20, y: wy - 12, w: 40, h: 24, draw: function () { flowers(H.ctx, wx, wy, t); } });
      else if (d.k === 'balloons') push({ x: wx - 3, y: wy - 3, w: 6, h: 6, draw: function () { balloons(H.ctx, wx, wy, t); } });
    });
    var pc = W.BY_ID.pc, q = pc.padsLocal[0];
    var cx = (pc.x + q.x + 0.5) * T, cy = (pc.y + q.y + 0.5) * T;
    push({ x: cx - 8, y: cy - 4, w: 3.5, h: 8, draw: function () { ceoChair(H.ctx, cx - 1.5, cy - 0.5, FL + 0.8, t); } });
    push({ x: 26 * T, y: 95.8 * T, w: 0.95 * T, h: 1.15 * T, draw: function () { rdBoard(H.ctx, S, H, t); } });
  });
  function fountain(c, wx, wy, t, H) {
    var R = 20, g = geo(wx - R, wy - R, R * 2, R * 2, R);
    cached(c, H, 'fnt', sx(wx - R, wy + R) - 2, sy(wx - R, wy - R, 6), sx(wx + R, wy - R) + 2, sy(wx + R, wy + R, FL) + 5, function (q) {
      shadowAt(q, wx - R, wy - R, R * 2, R * 2, R, 0.12);
      prism(q, g, FL, FL + 3.5, '#d3d8e2', '#ffffff', '#f4f6fa');
      q.fillStyle = '#7fd3f5'; top(q, inset(g, 2.5), FL + 2.8); q.fill();
    });
    var px = sx(wx, wy), py = sy(wx, wy, FL + 3);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.6;
    for (var k = 0; k < 2; k++) {
      var rr = (frac(t * 0.5 + k * 0.5)) * R * 0.85;
      c.beginPath(); c.ellipse(px, py, rr * RX, rr * RY, 0, 0, 7); c.stroke();
    }
    var ph = Math.floor(t * 6);
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath();
    for (var b = 0; b < 16; b++) {
      var a = b / 16 * Math.PI * 2, bx = wx + Math.cos(a) * (R - 1.2), by = wy + Math.sin(a) * (R - 1.2);
      if ((b + ph) % 4) c.rect(sx(bx, by) - 0.8, sy(bx, by, FL + 3.6) - 0.8, 1.6, 1.6);
    }
    c.fill();
    c.fillStyle = LOGO_COLS[ph % 6]; c.beginPath();
    for (var b2 = 0; b2 < 16; b2++) {
      var a2 = b2 / 16 * Math.PI * 2, bx2 = wx + Math.cos(a2) * (R - 1.2), by2 = wy + Math.sin(a2) * (R - 1.2);
      if (!((b2 + ph) % 4)) c.rect(sx(bx2, by2) - 1, sy(bx2, by2, FL + 3.6) - 1, 2, 2);
    }
    c.fill();
    var hue = Math.round(t * 50 % 360);
    for (var j = 0; j < 5; j++) {
      var jx = j ? wx + Math.cos(j * Math.PI / 2 + 0.785) * 9 : wx, jy = j ? wy + Math.sin(j * Math.PI / 2 + 0.785) * 9 : wy;
      var jh = j ? 7 + 5 * Math.abs(Math.sin(t * 2 + j)) : 18 + 3 * Math.sin(t * 3);
      var qx = sx(jx, jy), qy = sy(jx, jy, FL + 3);
      c.fillStyle = 'hsla(' + ((hue + j * 50) % 360) + ',90%,70%,0.55)';
      c.beginPath(); c.moveTo(qx - (j ? 0.9 : 1.6), qy); c.quadraticCurveTo(qx, qy - jh * 1.3, qx + (j ? 0.9 : 1.6), qy); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)';
      disc(c, qx + Math.sin(t * 7 + j) * 1.5, qy - jh * 0.7, 0.8); c.fill();
    }
  }
  function flowers(c, wx, wy, t) {
    var g = geo(wx - 18, wy - 10, 36, 20, 10);
    prism(c, g, FL, FL + 2.5, '#d3d8e2', '#ffffff', '#6cbf5d');
    var cols = ['#ff5aa5', '#ffd23f', '#ffffff', '#ff9a3c', '#8a6cff'];
    for (var i = 0; i < 22; i++) {
      var fx = wx - 14 + hash(i) * 28, fy = wy - 7 + hash(i + 50) * 14;
      var px = sx(fx, fy), py = sy(fx, fy, FL + 3.2 + Math.sin(t * 2 + i) * 0.3);
      c.fillStyle = cols[i % 5]; disc(c, px, py, 1.1); c.fill();
    }
  }
  function balloons(c, wx, wy, t) {
    var px = sx(wx, wy), py = sy(wx, wy, FL);
    c.fillStyle = '#8d94a8'; c.fillRect(px - 0.6, py - 6, 1.2, 6);
    var cols = ['#ff5aa5', '#ffd23f', '#2bb8d8', '#3ddc84', '#8a6cff'];
    c.strokeStyle = 'rgba(90,90,120,0.6)'; c.lineWidth = 0.4;
    for (var i = 0; i < 5; i++) {
      var bx = px + (i - 2) * 4.2 + Math.sin(t * 1.4 + i) * 1.2, by = py - 26 - (i % 2) * 5 - Math.abs(i - 2) * -1.5;
      c.beginPath(); c.moveTo(px, py - 6); c.quadraticCurveTo(px + (bx - px) * 0.3, by + 10, bx, by + 3.6); c.stroke();
    }
    for (var j = 0; j < 5; j++) {
      var bx2 = px + (j - 2) * 4.2 + Math.sin(t * 1.4 + j) * 1.2, by2 = py - 26 - (j % 2) * 5 - Math.abs(j - 2) * -1.5;
      c.fillStyle = cols[j]; c.beginPath(); c.ellipse(bx2, by2, 3.2, 3.8, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(bx2 - 1, by2 - 1.4, 0.9, 1.3, 0, 0, 7); c.fill();
    }
  }
  on('ui', function (S, H) {
    if (!S.officeOn || !S.officeOn()) return;
    if (S.gacha || S.showFinance || S.won) return;
    var pc = W.BY_ID.pc, q = pc.padsLocal[0];
    var wx = (pc.x + q.x + 0.5) * T, wy = (pc.y + q.y + 0.5) * T;
    if (S.swDev >= 30) return;
    if (S.heldPad && S.heldPad.type !== 'dev') return;
    var nx = QT.Guide && QT.Guide.next && QT.Guide.next();
    if (nx && nx.pad && nx.pad.type !== 'dev') return;
    var d = Math.hypot(S.player.x - wx, S.player.y - wy) / T;
    if (d < 1.3 || d > 7) return;
    var c = H.ctx, s = H.toScreen(wx - 6, wy - 1, 22);
    if (s.y < H.hudBottom() + 10 || s.y > H.cssH - 60) return;
    var ls = H.toScreen((pc.x + pc.w / 2) * T, (pc.y + pc.h / 2) * T, H.H_PLOT + 18);
    var lfs = Math.max(10, Math.min(14, 3.9 * H.z));
    c.font = '800 ' + lfs + 'px ' + H.FONT;
    var st = S.p.pc, ltxt = H.L.nm(pc, 'short') + (pc.cost && st && st.level ? '  Lv.' + st.level : '');
    var lLeft = ls.x - c.measureText(ltxt).width / 2;
    var lab = H.L.t('office_yourDesk');
    c.font = '900 11px ' + H.FONT;
    var bob = Math.sin(S.t * 4) * 2;
    var tip = Math.min(s.x - 3, lLeft - 4);
    var tw = c.measureText(lab).width + 26, bh = 20, bx = tip - 9 - tw + bob, by = s.y - bh / 2;
    pill(c, bx - 1.5, by - 1.5, tw + 3, bh + 3, '#2f2c46', null);
    pill(c, bx, by, tw, bh, '#ffd24a', null);
    c.fillStyle = '#2f2c46'; c.beginPath(); c.moveTo(bx + tw, by + 3); c.lineTo(bx + tw + 9, by + bh / 2); c.lineTo(bx + tw, by + bh - 3); c.fill();
    c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(bx + tw - 1, by + 5); c.lineTo(bx + tw + 5.5, by + bh / 2); c.lineTo(bx + tw - 1, by + bh - 5); c.fill();
    var kx = bx + 10, ky = by + bh / 2;
    c.fillStyle = '#c92f49';
    c.beginPath(); c.moveTo(kx - 5, ky + 3.5); c.lineTo(kx - 5, ky - 3); c.lineTo(kx - 2.5, ky); c.lineTo(kx, ky - 4.5);
    c.lineTo(kx + 2.5, ky); c.lineTo(kx + 5, ky - 3); c.lineTo(kx + 5, ky + 3.5); c.closePath(); c.fill();
    c.fillStyle = '#2f2c46'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(lab, bx + 18, by + bh / 2 + 0.5);
  });
  function onScreen(H, wx, wy, h, mx, my) {
    var cam = H.cam, z = H.z;
    return Math.abs(sx(wx, wy) - cam.x) < H.cssW / 2 / z + mx && Math.abs(sy(wx, wy, h) - cam.y) < H.cssH / 2 / z + my;
  }
  on('backdrop', 'sw', function (r, S, H) {
    var c = H.ctx, t = S.t;
    var Lx = 0.6 * T, Ly = (r.iy - 0.6) * T, Lw = (r.ix - 1.6) * T, Lh = (r.ih + 1.2) * T;
    if (onScreen(H, Lx + Lw, Ly + Lh / 2, 10, 140, 200))
      cached(c, H, 'bkL', sx(Lx, Ly + Lh) - 6, sy(Lx, Ly, 45), sx(Lx + Lw, Ly) + 6, sy(Lx + Lw, Ly + Lh, -8) + 12,
        function (g) { leftTerrace(g, Lx, Ly, Lw, Lh, 0, H); }, 0, 0, 3);
    var Rx = (r.ix + r.iw + 1.8) * T, Ry = (r.iy + 7) * T, Rw = 5.4 * T, Rh = 13 * T;
    if (onScreen(H, Rx, Ry + Rh / 2, 30, 140, 200)) rightTerrace(c, Rx, Ry, Rw, Rh, t, H);
  });
  function terraceSlab(c, x, y, w, h) {
    var g = geo(x, y, w, h, 18);
    c.fillStyle = 'rgba(40,40,80,0.1)'; top(c, geo(x + 6, y + 6, w, h, 18), -6); c.fill();
    prism(c, g, -8, FL, '#c9c2b5', '#e6dfd2', null);
    c.fillStyle = '#9ed98a'; top(c, g, FL); c.fill();
    c.fillStyle = '#b5e3a0'; top(c, inset(g, 4), FL + 0.05); c.fill();
    return g;
  }
  function leftTerrace(c, x, y, w, h, t, H) {
    terraceSlab(c, x, y, w, h);
    for (var k = 0; k < 2; k++) tree(c, x + w - 1.1 * T, y + (2.2 + k * 3.2) * T, 1, t, 20 + k, H);
    for (k = 0; k < 2; k++) tree(c, x + w - 1.1 * T, y + h - (2.2 + k * 3.2) * T, 1, t, 22 + k, H);
    tree(c, x + 1.4 * T, y + 2 * T, 0.9, t, 24, H);
    donut(c, x + w / 2 + 0.3 * T, y + h / 2, 3.1 * T, 1.95 * T, 13, t, H);
  }
  function donut(c, cx, cy, R1, R0, HH, t, H) {
    var px = sx(cx, cy), pb = sy(cx, cy, 0), r1x = R1 * RX, r1y = R1 * RY, r0x = R0 * RX, r0y = R0 * RY;
    var hb = FL, ht = FL + HH, i;
    c.fillStyle = 'rgba(46,40,78,0.14)'; c.beginPath(); c.ellipse(px + 3, pb - hb + 2, r1x, r1y, 0, 0, 7); c.fill();
    var gr = GR.donut;
    if (!gr) {
      gr = c.createLinearGradient(px - r1x, 0, px + r1x, 0);
      gr.addColorStop(0, '#8fb4cf'); gr.addColorStop(0.55, '#d3ecfa'); gr.addColorStop(0.8, '#f2fbff'); gr.addColorStop(1, '#a9cde3');
      GR.donut = gr;
    }
    c.fillStyle = gr;
    c.beginPath(); c.moveTo(px - r1x, pb - ht); c.lineTo(px - r1x, pb - hb);
    c.ellipse(px, pb - hb, r1x, r1y, 0, Math.PI, 0, true);
    c.lineTo(px + r1x, pb - ht); c.ellipse(px, pb - ht, r1x, r1y, 0, 0, Math.PI, false); c.closePath(); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.3; c.beginPath();
    for (var f = 1; f <= 2; f++) c.ellipse(px, pb - hb - f * 4.4, r1x + 0.6, r1y + 0.3, 0, 0, Math.PI);
    c.stroke();
    c.fillStyle = '#f7f8fa';
    c.beginPath(); c.ellipse(px, pb - ht, r1x + 1.5, r1y + 0.8, 0, 0, 7); c.ellipse(px, pb - ht, r0x - 1, r0y - 0.5, 0, 0, 7); c.fill('evenodd');
    c.strokeStyle = '#8196c6'; c.lineWidth = 2.2;
    c.beginPath(); c.ellipse(px, pb - ht - 0.1, (r1x + r0x) / 2, (r1y + r0y) / 2, 0, 0, 7); c.stroke();
    c.save();
    c.beginPath(); c.ellipse(px, pb - ht, r0x - 1, r0y - 0.5, 0, 0, 7); c.clip();
    c.fillStyle = '#9fc6de'; c.fillRect(px - r0x, pb - ht - r0y, r0x * 2, r0y * 2 + HH);
    c.fillStyle = '#7cc86a'; c.beginPath(); c.ellipse(px, pb - hb, r0x, r0y, 0, 0, 7); c.fill();
    for (i = 0; i < 5; i++) {
      var a = i * 1.26 + 0.4, tx = px + Math.cos(a) * r0x * 0.45, ty = pb - hb + Math.sin(a) * r0y * 0.45;
      c.fillStyle = '#3f9a55'; disc(c, tx, ty - 4, 3.6); c.fill();
      c.fillStyle = '#6cc46a'; disc(c, tx - 1, ty - 5, 2); c.fill();
    }
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.6;
    c.beginPath(); c.ellipse(px, pb - ht, r0x - 1, r0y - 0.5, 0, 0, 7); c.stroke();
  }
  function rightTerrace(c, x, y, w, h, t, H) {
    var pl = pal(BLD.staff);
    var g1 = geo(x + 1.1 * T, y + 4 * T, 3 * T, 3 * T, 20), g2 = inset(g1, 5), g3 = inset(g1, 10);
    cached(c, H, 'bkR', sx(x, y + h) - 6, sy(x, y, FL + 100), sx(x + w, y) + 6, sy(x + w, y + h, -8) + 12, function (g) {
      terraceSlab(g, x, y, w, h);
      tree(g, x + 0.9 * T, y + 1.2 * T, 1, 0, 40, H);
      tree(g, x + 4.4 * T, y + 2.2 * T, 0.9, 0, 41, H);
      glassBody(g, g1, FL, FL + 34, pl);
      g.fillStyle = '#eef1f6'; top(g, g1, FL + 34); g.fill();
      g.fillStyle = '#8ccf6e'; top(g, inset(g1, 1.5), FL + 34.2); g.fill();
      glassBody(g, g2, FL + 34, FL + 56, pl);
      g.fillStyle = '#eef1f6'; top(g, g2, FL + 56); g.fill();
      glassBody(g, g3, FL + 56, FL + 70, pl);
      top(g, g3, FL + 70); g.fillStyle = '#2f2c46'; g.fill();
      var px0 = sx(g3.cx, g3.cy), py0 = sy(g3.cx, g3.cy, FL + 70);
      g.strokeStyle = '#8d94a8'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(px0, py0); g.lineTo(px0, py0 - 22); g.stroke();
      tree(g, x + 4.4 * T, y + h - 1.3 * T, 1.1, 0, 42, H);
      tree(g, x + 1 * T, y + h - 1.1 * T, 0.9, 0, 43, H);
    }, 0, 0, 3);
    var hue = Math.round(t * 60 % 360);
    top(c, g1, FL + 34.3); c.strokeStyle = 'hsl(' + hue + ',90%,62%)'; c.lineWidth = 1.2; c.stroke();
    top(c, g2, FL + 56.3); c.stroke();
    var px = sx(g3.cx, g3.cy), py = sy(g3.cx, g3.cy, FL + 70);
    if (Math.sin(t * 4) > 0) { c.fillStyle = '#ff3b5c'; disc(c, px, py - 22, 1.5); c.fill(); }
    font(c, 7, H, 900);
    c.lineWidth = 2; c.strokeStyle = '#2f2c46'; c.strokeText('Q', px, py - 6);
    c.fillStyle = 'hsl(' + hue + ',90%,65%)'; c.fillText('Q', px, py - 6);
  }
  QT.Art._officeTall = function (S) {
    var out = [];
    ['swjob', 'acct', 'hwasm', 'desk', 'staff'].forEach(function (id) {
      var p = W.BY_ID[id], sp = BLD[id], tg = towerGeo(p, S, sp), cb = crownBox(sp, tg.k);
      out.push({ id: id, g: tg.gt, h0: FL, h1: tg.h1 + (sp.crown === 'chip' ? cb.top : 0) });
      if (cb.hw) out.push({ id: id + '.crown', rect: { cx: tg.gTop.cx, cy: tg.gTop.cy, hw: cb.hw, h0: tg.h1, h1: tg.h1 + cb.top } });
      if (tg.k > 0.55) {
        var ax = tg.gTop.x + tg.gTop.w * 0.22, ay = tg.gTop.y + tg.gTop.h * 0.22;
        out.push({ id: id + '.antenna', rect: { cx: ax, cy: ay, hw: 3.2, h0: tg.h1, h1: tg.h1 + 8 + tg.k * 8 + 3 } });
      }
      if (sp.drum) out.push({ id: id + '.drum', g: drumGeo(p, sp), h0: FL, h1: FL + 7 + sp.drumH });
    });
    var sg = supplyGeo(W.BY_ID.supply, S);
    out.push({ id: 'supply.tower', g: sg.gc, h0: FL, h1: sg.h1 + 5 });
    out.push({ id: 'supply.radar', rect: { cx: sg.gc.cx, cy: sg.gc.cy, hw: 4, h0: sg.h1 + 5, h1: sg.h1 + 12 } });
    var og = officeGeo();
    out.push({ id: 'office.tower', g: og.gt, h0: FL, h1: OFF.h1 });
    out.push({ id: 'office.blade', rect: { cx: og.fx, cy: og.fy, hw: OFF.bw + 1.4, h0: OFF.b0 - 1.4, h1: OFF.b1 + 1.4 } });
    out.push({ id: 'office.crown', rect: { cx: og.cx, cy: og.cy, hw: OFF.cr + 3.6, h0: OFF.h1, h1: OFF.h1 + 4 + OFF.cr * 2 + 3.6 } });
    out.push({ id: 'hwlab.board', rect: { cx: RDB.x * T, cy: RDB.y * T, hw: RDB.hw + 1.4, h0: RDB.h0 - 1.4, h1: RDB.h1 + 1.4 } });
    return out;
  };
})(window.QT || (window.QT = {}));
