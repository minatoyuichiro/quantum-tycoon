(function (QT) {
  'use strict';
  var on = QT.Art.scope('town');
  var Iso = QT.Iso, A = Iso.A, B = Iso.B, shade = Iso.shade;
  var T = 16;
  var KX = Math.SQRT2 * A, KY = Math.SQRT2 * B;
  var INK = '#2a1a40';
  var RH = QT.Render && QT.Render.H;
  var FONT = (RH && RH.FONT) || 'system-ui,sans-serif';
  var PI = Math.PI, TAU = Math.PI * 2;
  var RAINBOW = ['#ff4d5e', '#ff9f1c', '#ffd23f', '#3fd9a8', '#4cc9f0', '#7b5cff', '#ff5fa2'];
  function X(x, y) { return (x - y) * A; }
  function Y(x, y, h) { return (x + y) * B - (h || 0); }
  function mv(c, x, y, h) { c.moveTo((x - y) * A, (x + y) * B - h); }
  function ln(c, x, y, h) { c.lineTo((x - y) * A, (x + y) * B - h); }
  function poly(c, a) {
    c.beginPath();
    for (var i = 0; i < a.length; i += 3) (i ? ln : mv)(c, a[i], a[i + 1], a[i + 2]);
    c.closePath();
  }
  function fillPoly(c, a, col) { poly(c, a); c.fillStyle = col; c.fill(); }
  function box(c, x, y, w, d, base, hi, top, opt) { Iso.box(c, x, y, w, d, base, hi, top, opt); }
  function edge(c, x, y, w, d, base, hi, lw, col) {
    var t = base + hi;
    poly(c, [x, y, t, x + w, y, t, x + w, y, base, x + w, y + d, base, x, y + d, base, x, y + d, t]);
    c.lineWidth = lw || 1; c.strokeStyle = col || INK; c.lineJoin = 'round'; c.stroke();
  }
  function obox(c, x, y, w, d, base, hi, top, opt, lw) {
    box(c, x, y, w, d, base, hi, top, opt); edge(c, x, y, w, d, base, hi, lw || 1);
  }
  function onFaceY(c, x, y, h) { c.save(); c.transform(A, B, 0, 1, X(x, y), Y(x, y, h)); }
  function onFaceX(c, x, y, h) { c.save(); c.transform(A, -B, 0, 1, X(x, y), Y(x, y, h)); }
  function onTop(c, x, y, h) { c.save(); c.transform(A, B, -A, B, X(x, y), Y(x, y, h)); }
  function rrect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function pop(c, s, x, y, size, fill, stroke, lw, weight) {
    c.font = (weight || 900) + ' ' + size + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    if (stroke) { c.lineWidth = lw || Math.max(1, size / 4); c.strokeStyle = stroke; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  function starPath(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, a = -PI / 2 + i * PI / 5;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function yen(c, x, y, s, col, under) {
    c.beginPath();
    c.moveTo(x - s * 0.7, y - s); c.lineTo(x, y - s * 0.05); c.lineTo(x + s * 0.7, y - s);
    c.moveTo(x, y - s * 0.05); c.lineTo(x, y + s);
    c.moveTo(x - s * 0.55, y + s * 0.15); c.lineTo(x + s * 0.55, y + s * 0.15);
    c.moveTo(x - s * 0.55, y + s * 0.55); c.lineTo(x + s * 0.55, y + s * 0.55);
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (under) { c.lineWidth = s * 0.62; c.strokeStyle = under; c.stroke(); }
    c.lineWidth = s * 0.34; c.strokeStyle = col; c.stroke();
  }
  function sparkle(c, x, y, s, col) {
    c.beginPath(); c.moveTo(x, y - s);
    c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s);
    c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s);
    c.fillStyle = col; c.fill();
  }
  function blink(t, seed, per) {
    var k = ((t + seed * 7.13) % per) / per;
    return k < 0.18 ? Math.sin(k / 0.18 * PI) : 0;
  }
  function blob(c, a, col, lw) {
    c.beginPath();
    for (var i = 0; i < a.length; i += 3) { c.moveTo(a[i] + a[i + 2], a[i + 1]); c.arc(a[i], a[i + 1], a[i + 2], 0, TAU); }
    c.lineWidth = (lw || 0.9) * 2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = col; c.fill();
  }
  function chase(c, x0, y0, x1, y1, h, n, t, cols, rad, h1) {
    var m = cols.length, ph = Math.floor(t * 8), k, i;
    if (h1 == null) h1 = h;
    for (k = 0; k < m; k++) {
      c.beginPath();
      for (i = 0; i < n; i++) {
        if ((i + ph) % m !== k) continue;
        var f = (i + 0.5) / n, px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f;
        var sx = X(px, py), sy = Y(px, py, h + (h1 - h) * f);
        c.moveTo(sx + rad, sy); c.arc(sx, sy, rad, 0, TAU);
      }
      c.fillStyle = cols[k]; c.fill();
    }
  }
  var CHASE_GOLD = ['#fff27a', '#ffb31c', '#ffffff'];
  var CHASE_RB = ['#ff4d5e', '#ffd23f', '#3fd9a8', '#4cc9f0', '#ff5fa2'];
  function spinCube(c, cx, cy, h0, s, rot, faces) {
    var r = s / Math.SQRT2, P = [], k;
    for (k = 0; k < 4; k++) { var a = rot + k * PI / 2 + PI / 4; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    for (k = 0; k < 4; k++) {
      var a0 = P[k], a1 = P[(k + 1) % 4], mx = (a0[0] + a1[0]) / 2 - cx, my = (a0[1] + a1[1]) / 2 - cy;
      if (mx + my <= 0.01) continue;
      var sx0 = X(a0[0], a0[1]), sy0 = Y(a0[0], a0[1], h0 + s), ux = (X(a1[0], a1[1]) - sx0) / s, uy = (Y(a1[0], a1[1], h0 + s) - sy0) / s;
      c.save(); c.transform(ux, uy, 0, 1, sx0, sy0);
      var f = faces[k % faces.length], lit = 0.75 + 0.25 * Math.min(1, (mx + my) / r);
      c.fillStyle = f[0]; c.fillRect(0, 0, s, s);
      if (lit < 0.97) { c.fillStyle = 'rgba(20,10,40,' + ((1 - lit) * 0.9).toFixed(2) + ')'; c.fillRect(0, 0, s, s); }
      f[1](c, s);
      c.lineWidth = 1; c.strokeStyle = INK; c.strokeRect(0, 0, s, s);
      c.restore();
    }
    c.beginPath();
    for (k = 0; k < 4; k++) { var q = P[k]; if (k) c.lineTo(X(q[0], q[1]), Y(q[0], q[1], h0 + s)); else c.moveTo(X(q[0], q[1]), Y(q[0], q[1], h0 + s)); }
    c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
  }
  function cylGrad(c, col, rx) {
    var g = c.__tg || (c.__tg = {}), k = col + '|' + rx.toFixed(1);
    if (!g[k]) {
      var gr = c.createLinearGradient(-rx, 0, rx, 0);
      gr.addColorStop(0, shade(col, -55)); gr.addColorStop(0.42, shade(col, -10));
      gr.addColorStop(0.6, shade(col, 26)); gr.addColorStop(0.8, shade(col, -6));
      gr.addColorStop(1, shade(col, -34));
      g[k] = gr;
    }
    return g[k];
  }
  function cyl(c, x, y, r, base, hi, col, top, lw) {
    var rx = r * KX, ry = r * KY;
    c.save(); c.translate(X(x, y), Y(x, y, base));
    c.beginPath(); c.moveTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, PI);
    c.lineTo(-rx, -hi); c.lineTo(rx, -hi); c.closePath();
    c.fillStyle = cylGrad(c, col, rx); c.fill();
    c.beginPath(); c.ellipse(0, -hi, rx, ry, 0, 0, TAU);
    c.fillStyle = top || shade(col, 22); c.fill();
    if (lw) {
      c.beginPath(); c.moveTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, PI);
      c.lineTo(-rx, -hi); c.ellipse(0, -hi, rx, ry, 0, PI, TAU); c.closePath();
      c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
  }
  function dome(c, x, y, r, base, hh, col, lw) {
    var rx = r * KX, ry = r * KY;
    c.save(); c.translate(X(x, y), Y(x, y, base));
    c.beginPath(); c.moveTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, PI);
    c.ellipse(0, 0, rx, hh, 0, PI, TAU); c.closePath();
    c.fillStyle = cylGrad(c, col, rx); c.fill();
    if (lw) { c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); c.ellipse(rx * 0.25, -hh * 0.55, rx * 0.22, hh * 0.18, -0.5, 0, TAU); c.fill();
    c.restore();
  }
  function rrOutline(x, y, w, d, r, n) {
    var p = [], cs = [[x + w - r, y + r, -PI / 2], [x + w - r, y + d - r, 0], [x + r, y + d - r, PI / 2], [x + r, y + r, PI]];
    for (var k = 0; k < 4; k++)
      for (var i = 0; i <= n; i++) {
        var a = cs[k][2] + i / n * PI / 2;
        p.push(cs[k][0] + Math.cos(a) * r, cs[k][1] + Math.sin(a) * r);
      }
    return p;
  }
  function rprism(c, x, y, w, d, r, base, hi, col, top, lw) {
    var o = rrOutline(x, y, w, d, r, 4), n = o.length / 2, i, j, k;
    var sx = [], sy = [], iL = 0, iR = 0;
    for (i = 0; i < n; i++) {
      sx.push(X(o[2 * i], o[2 * i + 1])); sy.push(Y(o[2 * i], o[2 * i + 1], 0));
      if (sx[i] < sx[iL]) iL = i;
      if (sx[i] > sx[iR]) iR = i;
    }
    var fwd = [], bwd = [];
    for (i = iL; i !== iR; i = (i + 1) % n) fwd.push(i);
    fwd.push(iR);
    for (i = iR; i !== iL; i = (i + 1) % n) bwd.push(i);
    bwd.push(iL);
    var front = sy[fwd[fwd.length >> 1]] > sy[bwd[bwd.length >> 1]] ? fwd : bwd;
    var back = front === fwd ? bwd : fwd, t = base + hi;
    c.beginPath();
    for (k = 0; k < front.length; k++) { j = front[k]; if (k) c.lineTo(sx[j], sy[j] - base); else c.moveTo(sx[j], sy[j] - base); }
    for (k = front.length - 1; k >= 0; k--) { j = front[k]; c.lineTo(sx[j], sy[j] - t); }
    c.closePath();
    var g = c.createLinearGradient(sx[iL], 0, sx[iR], 0);
    g.addColorStop(0, shade(col, -55)); g.addColorStop(0.45, shade(col, -16));
    g.addColorStop(0.64, shade(col, 18)); g.addColorStop(0.82, shade(col, -8)); g.addColorStop(1, shade(col, -30));
    c.fillStyle = g; c.fill();
    c.beginPath();
    for (i = 0; i < n; i++) { if (i) c.lineTo(sx[i], sy[i] - t); else c.moveTo(sx[i], sy[i] - t); }
    c.closePath(); c.fillStyle = top || shade(col, 20); c.fill();
    if (lw) {
      c.beginPath();
      for (k = 0; k < front.length; k++) { j = front[k]; if (k) c.lineTo(sx[j], sy[j] - base); else c.moveTo(sx[j], sy[j] - base); }
      for (k = 0; k < back.length; k++) { j = back[k]; c.lineTo(sx[j], sy[j] - t); }
      c.closePath(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
    }
    return { sx: sx, sy: sy, front: front, o: o };
  }
  var SPR = {};
  function sprite(ctx, id, key, b, draw) {
    var ws = ctx.getTransform ? Math.abs(ctx.getTransform().a) : ((RH ? RH.z : 1) * (window.devicePixelRatio || 1));
    var sc = Math.min(6, Math.max(2, Math.ceil(ws * 2) / 2));
    var s = SPR[id];
    if (!s || s.key !== key || s.sc !== sc) {
      var w = Math.max(1, Math.ceil((b[2] - b[0]) * sc)), h = Math.max(1, Math.ceil((b[3] - b[1]) * sc));
      var cv = s ? s.cv : document.createElement('canvas');
      cv.width = w; cv.height = h;
      var c = cv.getContext('2d');
      c.setTransform(sc, 0, 0, sc, -b[0] * sc, -b[1] * sc);
      c.lineJoin = 'round'; c.lineCap = 'round';
      draw(c);
      s = SPR[id] = { cv: cv, key: key, sc: sc, x: b[0], y: b[1], w: w / sc, h: h / sc };
    }
    ctx.drawImage(s.cv, s.x, s.y, s.w, s.h);
  }
  function bbox(x, y, w, d, hTop, m, ml, mr) {
    return [X(x, y + d) - (ml == null ? m : ml), Y(x, y, hTop) - m, X(x + w, y) + (mr == null ? m : mr), Y(x + w, y + d, 0) + m];
  }
  function seen(H, b) {
    var z = H.z, cam = H.cam, w2 = H.cssW / 2, h2 = H.cssH / 2;
    return (b[2] - cam.x) * z + w2 > -8 && (b[0] - cam.x) * z + w2 < H.cssW + 8 &&
           (b[3] - cam.y) * z + h2 > -8 && (b[1] - cam.y) * z + h2 < H.cssH + 8;
  }
  function lvOf(S, p) { var st = S.p[p.id]; return st ? Math.max(1, st.level || 1) : 1; }
  function prosper(S, p, served) {
    return Math.max(lvOf(S, p), Math.min(6, 1 + Math.floor(Math.log(1 + (served || 0) / 6) / Math.LN2)));
  }
  function balloon(c, x, y, col, ax, ay) {
    c.strokeStyle = 'rgba(60,40,80,0.6)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(x, y + 4.2); c.stroke();
    c.beginPath(); c.ellipse(x, y, 3, 3.8, 0, 0, TAU); c.fillStyle = col; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.ellipse(x - 1, y - 1.3, 0.8, 1.2, -0.4, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.65)'; c.fill();
  }
  function firework(c, t, x, y, seed, period) {
    var k = ((t + seed * 1.37) % period) / period;
    if (k > 0.45) return;
    var f = k / 0.45, r = 4 + f * 14, n = 10;
    c.globalAlpha = 1 - f;
    for (var i = 0; i < n; i++) {
      var a = i / n * TAU + seed;
      c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9 + f * f * 4, 1.3 * (1 - f * 0.5), 0, TAU);
      c.fillStyle = RAINBOW[(i + Math.floor(seed * 3)) % RAINBOW.length]; c.fill();
    }
    c.globalAlpha = 1;
  }
  function bulbs(c, x, y, w, h, n, t, on, off, rad) {
    var per = 2 * (w + h), ph = Math.floor(t * 7), pass, i;
    for (pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (i = 0; i < n; i++) {
        if (((i + ph) % 3 === 0) !== (pass === 0)) continue;
        var dd = i / n * per, px, py;
        if (dd < w) { px = x + dd; py = y; }
        else if (dd < w + h) { px = x + w; py = y + dd - w; }
        else if (dd < 2 * w + h) { px = x + w - (dd - w - h); py = y + h; }
        else { px = x; py = y + h - (dd - 2 * w - h); }
        c.moveTo(px + rad, py); c.arc(px, py, rad, 0, TAU);
      }
      c.fillStyle = pass === 0 ? on : off; c.fill();
    }
  }
  var PADC = { reg: '#2bb8d8', stock: '#f2a63b', pickup: '#ff8a3d', brew: '#c89b6a', cserve: '#e2508a' };
  var padCache = { first: null, len: -1, by: {} };
  function padsOf(H, p) {
    var all = H.G.PADS();
    if (padCache.first !== all[0] || padCache.len !== all.length) {
      padCache.first = all[0]; padCache.len = all.length; padCache.by = {};
      all.forEach(function (pd) {
        if (!pd.p) return;
        (padCache.by[pd.p.id] || (padCache.by[pd.p.id] = [])).push(pd);
      });
    }
    return padCache.by[p.id] || [];
  }
  function padMarks(c, H, S, p, base) {
    var list = padsOf(H, p);
    for (var i = 0; i < list.length; i++) {
      var pad = list[i];
      if (pad.type === 'buy' || !H.G.padActive(pad)) continue;
      var info = H.G.padInfo(pad), can = !!(info && info.can);
      var px = pad.x * T, py = pad.y * T, col = PADC[pad.type] || '#7b5cff';
      var k = 0.5 + 0.5 * Math.sin(S.t * 4 + i);
      if (can) {
        c.globalAlpha = 0.25 + 0.3 * k;
        Iso.facePath(c, px - 2 - k * 2, py - 2 - k * 2, T + 4 + k * 4, T + 4 + k * 4, base + 0.2);
        c.fillStyle = col; c.fill();
      }
      c.globalAlpha = can ? 1 : 0.5;
      Iso.facePath(c, px + 0.5, py + 0.5, T - 1, T - 1, base + 0.3); c.fillStyle = '#ffffff'; c.fill();
      Iso.facePath(c, px + 2, py + 2, T - 4, T - 4, base + 0.35); c.fillStyle = col; c.fill();
      Iso.facePath(c, px + 5.5, py + 5.5, T - 11, T - 11, base + 0.4); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
      c.globalAlpha = 1;
    }
  }
  var CV_WALL = 9;
  var CV_SIGN = 58;
  var CV_BIG = 1.22;
  function cvPole(p) { return { x: p.x * T + 7, y: p.y * T + p.h * T - 8 }; }
  function conveniStatic(c, p, big) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.2);
    box(c, x, y, w, d, 0, 2, '#ffffff', { left: '#cfd9e6', right: '#e3eaf3' });
    for (var ty = 0; ty < p.h; ty++)
      for (var tx = 0; tx < p.w; tx++) {
        Iso.facePath(c, x + tx * T + 0.4, y + ty * T + 0.4, T - 0.8, T - 0.8, 2);
        c.fillStyle = ((tx + ty) & 1) ? '#dff7ec' : '#ffffff'; c.fill();
      }
    edge(c, x, y, w, d, 0, 2, 1);
    box(c, x, y, w, 3, 2, CV_WALL, '#ffffff', { left: '#bfeaff', right: '#a6dcf5' });
    [[2, 3.8, '#1fb56a'], [3.8, 4.9, '#ff9f1c'], [4.9, 6, '#ff4d5e']].forEach(function (bd) {
      Iso.leftFacePath(c, x, y, w, 3, bd[1], bd[0]); c.fillStyle = bd[2]; c.fill();
    });
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.7; c.beginPath();
    for (i = 16; i < w; i += 16) { mv(c, x + i, y + 3, 6.2); ln(c, x + i, y + 3, 2 + CV_WALL); }
    c.stroke();
    edge(c, x, y, w, 3, 2, CV_WALL, 0.9);
    var AW = 8;
    for (i = 0; i < w / AW; i++) {
      var ax = x + i * AW;
      fillPoly(c, [ax, y + 1, 14, ax + AW, y + 1, 14, ax + AW, y + 10, 11, ax, y + 10, 11], i % 2 ? '#ffffff' : '#1fb56a');
    }
    poly(c, [x, y + 1, 14, x + w, y + 1, 14, x + w, y + 10, 11, x, y + 10, 11]);
    c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    onFaceY(c, x, y + 10, 11);
    for (i = 0; i < w / AW; i++) {
      c.beginPath(); c.moveTo(i * AW, 0); c.arc(i * AW + AW / 2, 0, AW / 2, PI, 0, true); c.closePath();
      c.fillStyle = i % 2 ? '#ffffff' : '#1fb56a'; c.fill();
      c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
    box(c, x, y + 3, 3, 29, 2, CV_WALL, '#ffffff', { right: '#a6dcf5', left: '#bfeaff' });
    edge(c, x, y + 3, 3, 29, 2, CV_WALL, 0.9);
    var LW = 28;
    box(c, x, y + 32, 3, d - 32, 2, LW, '#ffffff', { right: '#8fd3f5', left: '#bfeaff' });
    onFaceX(c, x + 3, y + d, 2 + LW);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 0, d - 32, 2);
    rrect(c, 4, 3.5, 24, 14, 2); c.fillStyle = '#ff4d5e'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    c.save(); c.scale(1.15, 1); pop(c, '24H', 16 / 1.15, 10.5, 8.5, '#ffffff', INK, 1.8); c.restore();
    rrect(c, 33, 3.5, 26, 14, 2); c.fillStyle = '#ffd23f'; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(46, 5.5); c.quadraticCurveTo(53, 15, 46, 15.5); c.quadraticCurveTo(39, 15, 46, 5.5);
    c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 0.7; c.stroke();
    c.fillStyle = '#2a2a3a'; c.fillRect(43.4, 11.5, 5.2, 4);
    c.fillStyle = '#1fb56a'; c.fillRect(0, LW - 8, d - 32, 2.2);
    c.fillStyle = '#ff9f1c'; c.fillRect(0, LW - 5.8, d - 32, 1.4);
    c.fillStyle = '#ff4d5e'; c.fillRect(0, LW - 4.4, d - 32, 1.4);
    c.restore();
    edge(c, x, y + 32, 3, d - 32, 2, LW, 1);
    c.strokeStyle = INK; c.lineWidth = 0.6; c.beginPath();
    mv(c, x + 1.5, y + 33, 2 + LW + 1);
    for (i = 1; i <= 8; i++) ln(c, x + 1.5, y + 33 + i * (d - 35) / 8, 2 + LW + 1 - Math.sin(i / 8 * PI) * 3);
    c.stroke();
    for (i = 0; i < 8; i++) {
      var fy = y + 33 + (i + 0.5) * (d - 35) / 8, fh = 2 + LW + 1 - Math.sin((i + 0.5) / 8 * PI) * 3;
      fillPoly(c, [x + 1.5, fy - 2.6, fh + 0.3, x + 1.5, fy + 2.6, fh + 0.3, x + 1.5, fy, fh - 5], RAINBOW[i % RAINBOW.length]);
    }
    var pp = cvPole(p), sc = big ? CV_BIG : 1;
    cyl(c, pp.x, pp.y, 3.2, 2, 2.5, '#dfe6ef', '#f4f7fb', 0.8);
    cyl(c, pp.x, pp.y, 1.5, 4.5, CV_SIGN - 4.5, '#c9d3e0', null, 0.7);
    c.save(); c.translate(X(pp.x, pp.y), Y(pp.x, pp.y, CV_SIGN)); c.scale(sc, sc);
    c.save();
    c.shadowColor = 'rgba(255,255,255,0.9)'; c.shadowBlur = 6;
    rrect(c, -24, -15, 48, 30, 6); c.fillStyle = '#ffffff'; c.fill();
    c.restore();
    c.save(); rrect(c, -24, -15, 48, 30, 6); c.clip();
    c.fillStyle = '#1fb56a'; c.fillRect(-24, -15, 48, 17);
    c.fillStyle = '#ff9f1c'; c.fillRect(-24, 2, 48, 3);
    c.fillStyle = '#ff4d5e'; c.fillRect(-24, 5, 48, 3);
    c.restore();
    rrect(c, -24, -15, 48, 30, 6); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    pop(c, 'CONVENI', 0, -6.4, 8.8, '#ffffff', INK, 2);
    c.save(); c.scale(1.12, 1); pop(c, 'OPEN 24H', 0, 11.7, 5.8, '#138a50', null, 0, 900); c.restore();
    c.restore();
  }
  function crown(c, x, y) {
    c.beginPath(); c.moveTo(x - 7, y + 4); c.lineTo(x - 7.5, y - 3); c.lineTo(x - 3.5, y + 0.5); c.lineTo(x, y - 5);
    c.lineTo(x + 3.5, y + 0.5); c.lineTo(x + 7.5, y - 3); c.lineTo(x + 7, y + 4); c.closePath();
    c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#ff4d5e'; c.beginPath(); c.arc(x, y + 1.2, 1.2, 0, TAU); c.fill();
  }
  function heartPath(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y + 3 * s);
    c.bezierCurveTo(x - 5 * s, y - 0.5 * s, x - 2.6 * s, y - 4.6 * s, x, y - 1.8 * s);
    c.bezierCurveTo(x + 2.6 * s, y - 4.6 * s, x + 5 * s, y - 0.5 * s, x, y + 3 * s);
  }
  var CUBE_FACES = [
    ['#1fb56a', function (c, s) { pop(c, '24', s / 2, s / 2 + 0.4, s * 0.6, '#ffffff', INK, 1.5); }],
    ['#ff9f1c', function (c, s) { starPath(c, s / 2, s / 2 + 0.3, s * 0.36); c.fillStyle = '#fff27a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke(); }],
    ['#ff4d5e', function (c, s) { heartPath(c, s / 2, s / 2 - 0.4, s * 0.11); c.fillStyle = '#ffffff'; c.fill(); }],
    ['#4cc9f0', function (c, s) { yen(c, s / 2, s / 2, s * 0.26, '#ffffff', INK); }]
  ];
  function conveniFloorFx(c, S, p, tr) {
    if (tr < 5) return;
    var x = p.x * T, y = p.y * T, w = p.w * T, ph = Math.floor(S.t * 6), tx, ty, i;
    c.globalAlpha = 0.45;
    for (ty = 0; ty < p.h; ty++)
      for (tx = 0; tx < p.w; tx++) {
        if ((tx + ty + 40 - ph) % 4) continue;
        Iso.facePath(c, x + tx * T + 1, y + ty * T + 1, T - 2, T - 2, 2.05);
        c.fillStyle = RAINBOW[(tx + 2 * ty + (ph >> 2)) % 7]; c.fill();
      }
    c.globalAlpha = 1;
    var AW = 8;
    ph = Math.floor(S.t * 5);
    for (i = 0; i < w / AW; i += 2) {
      var ax = x + i * AW;
      fillPoly(c, [ax, y + 1, 14, ax + AW, y + 1, 14, ax + AW, y + 10, 11, ax, y + 10, 11], RAINBOW[(i / 2 + ph) % 7]);
    }
    onFaceY(c, x, y + 10, 11);
    c.lineWidth = 0.7; c.strokeStyle = INK;
    for (i = 0; i < w / AW; i += 2) {
      c.beginPath(); c.moveTo(i * AW, 0); c.arc(i * AW + AW / 2, 0, AW / 2, PI, 0, true); c.closePath();
      c.fillStyle = RAINBOW[(i / 2 + ph) % 7]; c.fill(); c.stroke();
    }
    c.restore();
  }
  function conveniDyn(c, S, p, tr) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    var big = tr >= 4, sc = big ? CV_BIG : 1;
    var pp = cvPole(p), sx = X(pp.x, pp.y), sy = Y(pp.x, pp.y, CV_SIGN);
    if (tr >= 3) {
      c.strokeStyle = tr >= 6 ? 'rgba(255,120,200,0.5)' : 'rgba(255,214,70,0.6)'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath();
      mv(c, x + 3, y + d, 1); ln(c, x + w, y + d, 1); ln(c, x + w, y, 1); c.stroke();
      var cols = tr >= 6 ? CHASE_RB : CHASE_GOLD;
      chase(c, x + 3, y + d, x + w, y + d, 1, 34, S.t, cols, 1);
      chase(c, x + w, y + d, x + w, y, 1, 24, S.t, cols, 1);
    }
    if (tr >= 2) {
      var bx0 = sx - 1, by0 = Y(pp.x, pp.y, 15);
      for (i = 0; i < Math.min(5, tr); i++)
        balloon(c, bx0 - 8 - i * 4.6 + Math.sin(S.t * 1.4 + i) * 1.1, by0 - 11 - (i % 2) * 4.5 + Math.sin(S.t * 1.9 + i * 2) * 1, RAINBOW[(i * 2) % 7], bx0, by0);
    }
    bulbs(c, sx - 26 * sc, sy - 17 * sc, 52 * sc, 34 * sc, big ? 32 : 28, S.t * (tr >= 3 ? 1.6 : 1), tr >= 6 ? H0rainbow(S.t) : '#fff27a', '#ff9f1c', 1.05);
    var top = sy - 17 * sc;
    if (big) {
      var ch = CV_SIGN + 17 * sc + 2, cy = Y(pp.x, pp.y, ch);
      c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(sx, top); c.lineTo(sx, cy + 3); c.stroke();
      c.strokeStyle = '#c9d3e0'; c.lineWidth = 1; c.stroke();
      spinCube(c, pp.x, pp.y, ch, 12, S.t * 1.2, CUBE_FACES);
      if (tr >= 5) crown(c, sx, Y(pp.x, pp.y, ch + 12) - 7 + Math.sin(S.t * 3) * 1.2);
    } else {
      var sp = 1 + 0.12 * Math.sin(S.t * 5);
      c.save(); c.translate(sx, top - 6); c.rotate(Math.sin(S.t * 1.5) * 0.35); c.scale(sp, sp);
      starPath(c, 0, 0, 6); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
      c.restore();
      if (tr >= 3) crown(c, sx, top - 15 + Math.sin(S.t * 3) * 1.2);
    }
    var k = blink(S.t, 1, 2.6);
    if (k > 0) sparkle(c, sx + 22 * sc, sy - 16 * sc, 2 + 4 * k, 'rgba(255,255,255,' + (0.4 + 0.6 * k) + ')');
    k = blink(S.t, 3, 3.1);
    if (k > 0) sparkle(c, sx - 23 * sc, sy + 11 * sc, 1.5 + 3 * k, 'rgba(255,250,200,' + k + ')');
  }
  function H0rainbow(t) { return 'hsl(' + Math.round((t * 200) % 360) + ',95%,70%)'; }
  var cvTier = 1, cfTier = 1;
  on('base', 'conveni', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var tr = cvTier = prosper(S, p, S.store.served);
    var b = bbox(x, y, w, d, CV_SIGN + 32, 4, 34, 4);
    if (!seen(H, b)) return true;
    sprite(c, 'conveni', 'v2|' + (tr >= 4 ? 1 : 0), b, function (g) { conveniStatic(g, p, tr >= 4); });
    conveniFloorFx(c, S, p, tr);
    padMarks(c, H, S, p, 2);
    conveniDyn(c, S, p, tr);
    return true;
  });
  var GOODS = [
    ['#4cc9f0', '#3fd9a8', '#ffffff', '#ff5fa2', '#7b5cff', '#4cc9f0', '#ffd23f'],
    ['#ff4d5e', '#ff9f1c', '#ffd23f', '#ff5fa2', '#ff9f1c', '#ff4d5e', '#3fd9a8'],
    ['#ffffff', '#3fd9a8', '#ffd23f', '#ff9f1c', '#ffffff', '#ff5fa2', '#1fb56a']
  ];
  function cvShelf(c, S, x, y, w, si) {
    sprite(c, 'cvshelf' + si, 'v1', bbox(x, y, w, T, 22, 3), function (g) {
      Iso.shadow(g, x + 1, y + 3, w - 2, 10, 0.14);
      box(g, x + 1, y + 3, w - 2, 10, 2, 14, '#ffffff', { left: '#434c68', right: '#dfe6f0' });
      box(g, x + 1, y + 3, w - 2, 10, 16, 1.6, '#1fb56a', { left: '#15935a', right: '#1aa563' });
      Iso.leftFacePath(g, x + 1, y + 3, w - 2, 10, 9.4, 8.6); g.fillStyle = '#ffd23f'; g.fill();
      edge(g, x + 1, y + 3, w - 2, 10, 2, 15.6, 1);
    });
    var st = S.store.stock, n = Math.round(st / 100 * 14), yf = y + 13.05, gw = (w - 8) / 7;
    for (var k = 0; k < n; k++) {
      var row = k < 7 ? 1 : 0, col = k % 7;
      var u = x + 4 + col * gw, h0 = row ? 9.6 : 3.2, hh = (si === 0 ? 4.8 : 3.8) - ((col + si) % 3 === 0 ? 0.8 : 0);
      poly(c, [u + 0.4, yf, h0, u + gw - 0.4, yf, h0, u + gw - 0.4, yf, h0 + hh, u + 0.4, yf, h0 + hh]);
      c.fillStyle = GOODS[si][(col + row * 3) % 7]; c.fill();
    }
    if (st < 30 && Math.sin(S.t * 8) > 0) {
      var e = { x: X(x + w - 6, y + 8), y: Y(x + w - 6, y + 8, 24) };
      c.beginPath(); c.arc(e.x, e.y, 3.6, 0, TAU); c.fillStyle = '#ff4d5e'; c.fill();
      c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
      pop(c, '!', e.x, e.y + 0.2, 5, '#ffffff', null, 0);
    }
  }
  function cvParcel(c, S, x, y, w) {
    sprite(c, 'cvparcel', 'v1', bbox(x, y, w, T, 26, 3), function (g) {
      Iso.shadow(g, x + 1, y + 3, w - 2, 10, 0.14);
      box(g, x + 1, y + 3, w - 2, 10, 2, 10, '#d99a5b', { left: '#9c6434', right: '#b97a42' });
      edge(g, x + 1, y + 3, w - 2, 10, 2, 10, 1);
      obox(g, x + 17, y + 4.5, 7, 6, 12, 4.5, '#e2b27a', { left: '#b88450', right: '#cc9862' }, 0.8);
      obox(g, x + 24.5, y + 5, 5, 5, 12, 3.2, '#e2b27a', { left: '#b88450', right: '#cc9862' }, 0.8);
      obox(g, x + 18.5, y + 5.5, 5, 4, 16.5, 3, '#d9a066', { left: '#ae7a45', right: '#c38c55' }, 0.8);
    });
    var bx = x + 4, by = y + 4.2;
    if (!S.deliv) {
      var bob = Math.abs(Math.sin(S.t * 4)) * 2.2, k = 0.5 + 0.5 * Math.sin(S.t * 6);
      c.save(); c.globalAlpha = 0.35 + 0.35 * k;
      var gc = { x: X(bx + 4.5, by + 3.5), y: Y(bx + 4.5, by + 3.5, 12.2) };
      c.beginPath(); c.ellipse(gc.x, gc.y, 11 + k * 2, 5.5 + k, 0, 0, TAU); c.fillStyle = '#ffd23f'; c.fill();
      c.restore();
      obox(c, bx, by, 9, 7, 12 + bob, 7, '#ffd23f', { left: '#e8a800', right: '#f5b21c' }, 0.9);
      c.strokeStyle = '#ff4d5e'; c.lineWidth = 1.2; c.beginPath();
      mv(c, bx + 4.5, by, 19 + bob); ln(c, bx + 4.5, by + 7, 19 + bob); ln(c, bx + 4.5, by + 7, 12 + bob);
      mv(c, bx, by + 3.5, 19 + bob); ln(c, bx + 9, by + 3.5, 19 + bob); ln(c, bx + 9, by + 3.5, 12 + bob);
      c.stroke();
      var tp = { x: X(bx + 4.5, by + 3.5), y: Y(bx + 4.5, by + 3.5, 19 + bob) };
      c.beginPath(); c.ellipse(tp.x - 1.6, tp.y - 1.2, 1.8, 1.1, -0.4, 0, TAU); c.ellipse(tp.x + 1.6, tp.y - 1.2, 1.8, 1.1, 0.4, 0, TAU);
      c.fillStyle = '#ff4d5e'; c.fill();
      var s1 = blink(S.t, 0.3, 1.1), s2 = blink(S.t, 0.8, 1.3);
      if (s1 > 0) sparkle(c, tp.x + 6, tp.y - 3, 1.5 + 2.5 * s1, '#ffffff');
      if (s2 > 0) sparkle(c, tp.x - 7, tp.y + 2, 1.2 + 2 * s2, '#fff6b0');
    } else {
      c.save(); c.setLineDash([1.6, 1.4]); Iso.facePath(c, bx, by, 9, 7, 12.1);
      c.strokeStyle = 'rgba(120,80,40,0.7)'; c.lineWidth = 0.8; c.stroke(); c.restore();
    }
  }
  function cvCounter(c, S, x, y, w) {
    sprite(c, 'cvcounter', 'v1', bbox(x, y, w, T, 30, 3), function (g) {
      Iso.shadow(g, x + 1, y + 3, w - 2, 10, 0.14);
      box(g, x + 1, y + 3, w - 2, 10, 2, 12, '#f6ead2', { left: '#ffffff', right: '#e7edf5' });
      [[3, 5.2, '#1fb56a'], [5.2, 6.6, '#ff9f1c'], [6.6, 8, '#ff4d5e']].forEach(function (bd) {
        Iso.leftFacePath(g, x + 1, y + 3, w - 2, 10, bd[1], bd[0]); g.fillStyle = bd[2]; g.fill();
      });
      edge(g, x + 1, y + 3, w - 2, 10, 2, 12, 1);
      obox(g, x + 6, y + 4.5, 11, 7, 14, 4, '#4a4466', { left: '#2f2a45', right: '#3b3555' }, 0.8);
      obox(g, x + 8, y + 5, 7, 2, 18, 5, '#3a3550', { left: '#262238', right: '#302b45' }, 0.7);
      obox(g, x + 22, y + 4, 15, 7.5, 14, 8, '#ffe2a8', { left: 'rgba(255,196,110,0.95)', right: '#ffd08a' }, 0.8);
      for (var i = 0; i < 3; i++) {
        var nx = x + 25 + i * 4, pt = { x: X(nx, y + 11.6), y: Y(nx, y + 11.6, 17.5) };
        g.beginPath(); g.ellipse(pt.x, pt.y, 1.8, 1.3, 0, 0, TAU); g.fillStyle = '#c9772a'; g.fill();
      }
      obox(g, x + 44, y + 4.5, 8, 6, 14, 11, '#eef2f7', { left: '#c2cad6', right: '#d8dee8' }, 0.8);
      obox(g, x + 45, y + 4.8, 6, 5.4, 25, 1.4, '#ff4d5e', null, 0.6);
      obox(g, x + 58, y + 4.5, 15, 7, 14, 5, '#fff3dc', { left: '#ffe3b5', right: '#fbe9c9' }, 0.8);
      for (i = 0; i < 3; i++) {
        var dp = { x: X(x + 61 + i * 4.5, y + 8), y: Y(x + 61 + i * 4.5, y + 8, 19.3) };
        g.beginPath(); g.ellipse(dp.x, dp.y, 2.1, 1.2, 0, 0, TAU); g.fillStyle = ['#ff5fa2', '#8a5a3c', '#ffd23f'][i]; g.fill();
        g.beginPath(); g.ellipse(dp.x, dp.y, 0.7, 0.4, 0, 0, TAU); g.fillStyle = '#fff3dc'; g.fill();
      }
    });
    var wait = S.store.cust.length > 0, k = 0.5 + 0.5 * Math.sin(S.t * 7);
    Iso.leftFacePath(c, x + 8.6, y + 5, 5.8, 2, 22.4, 18.6);
    c.fillStyle = wait ? (k > 0.5 ? '#7dff9a' : '#2fbf7a') : '#35507a'; c.fill();
    if (wait) {
      var rp = { x: X(x + 11.5, y + 6), y: Y(x + 11.5, y + 6, 30 + k * 2) };
      c.beginPath(); c.arc(rp.x, rp.y, 3.8, 0, TAU); c.fillStyle = '#ffd23f'; c.fill();
      c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
      yen(c, rp.x, rp.y + 0.2, 2.4, '#ffffff');
    }
    var st = { x: X(x + 48, y + 7), y: Y(x + 48, y + 7, 27) };
    c.globalAlpha = 0.5; c.strokeStyle = '#ffffff'; c.lineWidth = 1.1; c.beginPath();
    c.moveTo(st.x, st.y); c.quadraticCurveTo(st.x + 2 * Math.sin(S.t * 3), st.y - 3, st.x, st.y - 6);
    c.stroke(); c.globalAlpha = 1;
    if (cvTier >= 3) chase(c, x + 1.5, y + 13, x + w - 1.5, y + 13, 12.4, 22, S.t + 0.3, cvTier >= 6 ? CHASE_RB : CHASE_GOLD, 0.85);
  }
  on('fixture', 'conveni', function (p, i, S, H) {
    var c = H.ctx, b = p.blocks[i];
    var x = (p.x + b[0]) * T, y = (p.y + b[1]) * T, w = b[2] * T;
    if (!seen(H, bbox(x, y, w, T, 40, 4))) return true;
    var isParcel = p.parcelAt && b[0] === p.parcelAt[0] && b[1] === p.parcelAt[1];
    var isCounter = p.counterAt && b[0] === p.counterAt[0] && b[1] === p.counterAt[1];
    if (isCounter) cvCounter(c, S, x, y, w);
    else if (isParcel) cvParcel(c, S, x, y, w);
    else cvShelf(c, S, x, y, w, i % 3);
    return true;
  });
  var CF_WALL = 18;
  function cfBoard(p) { var bx = p.x * T + 50, by = p.y * T + 5; return { x: X(bx, by), y: Y(bx, by, 17.5) }; }
  function cafeBoardStatic(c, p) {
    var bp = cfBoard(p);
    c.strokeStyle = INK; c.lineWidth = 0.6; c.beginPath();
    c.moveTo(bp.x - 14, bp.y - 9); c.lineTo(bp.x - 14, bp.y - 13.5); c.moveTo(bp.x + 14, bp.y - 9); c.lineTo(bp.x + 14, bp.y - 13.5); c.stroke();
    c.save(); c.shadowColor = '#ff5fa2'; c.shadowBlur = 7;
    rrect(c, bp.x - 21, bp.y - 9, 42, 18, 5); c.fillStyle = '#3a1f3a'; c.fill();
    c.restore();
    rrect(c, bp.x - 21, bp.y - 9, 42, 18, 5); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke();
    rrect(c, bp.x - 19.4, bp.y - 7.4, 38.8, 14.8, 3.8); c.lineWidth = 0.8; c.strokeStyle = '#ff5fa2'; c.stroke();
    c.save(); c.shadowColor = '#ff5fa2'; c.shadowBlur = 4;
    pop(c, 'CAFE', bp.x + 4, bp.y - 2.4, 9, '#fff0f7', '#ff5fa2', 1.6);
    c.restore();
    c.save(); c.shadowColor = '#ffd23f'; c.shadowBlur = 3; c.strokeStyle = '#ffd23f'; c.lineWidth = 1;
    var ix = bp.x - 14, iy = bp.y - 2.6;
    c.beginPath(); c.moveTo(ix - 3.4, iy - 2); c.lineTo(ix - 2.6, iy + 2.6); c.lineTo(ix + 2.6, iy + 2.6); c.lineTo(ix + 3.4, iy - 2); c.closePath(); c.stroke();
    c.beginPath(); c.arc(ix + 4.1, iy + 0.2, 1.4, -PI / 2, PI / 2); c.stroke();
    c.beginPath(); c.moveTo(ix - 1, iy - 3.2); c.quadraticCurveTo(ix + 0.4, iy - 4.6, ix - 0.6, iy - 6); c.moveTo(ix + 1.4, iy - 3.2); c.quadraticCurveTo(ix + 2.8, iy - 4.6, ix + 1.8, iy - 6); c.stroke();
    c.restore();
  }
  function cafeStatic(c, p) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i, r;
    Iso.shadow(c, x, y, w, d, 0.2);
    box(c, x, y, w, d, 0, 2, '#fff7ea', { left: '#e2cfb2', right: '#efe0c8' });
    Iso.facePath(c, x + 0.5, y + 0.5, w - 1, d - 1, 2); c.fillStyle = '#e8c79c'; c.fill();
    c.strokeStyle = 'rgba(140,90,50,0.22)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 6; i < d; i += 6) { mv(c, x + 0.5, y + i, 2); ln(c, x + w - 0.5, y + i, 2); }
    for (r = 0; r < d / 6; r++) for (i = (r % 3) * 11 + 5; i < w; i += 33) { mv(c, x + i, y + r * 6, 2); ln(c, x + i, y + r * 6 + 6, 2); }
    c.stroke();
    edge(c, x, y, w, d, 0, 2, 1);
    onTop(c, x + 50, y + 40, 2.05);
    c.beginPath(); c.ellipse(0, 0, 38, 11, 0, 0, TAU); c.fillStyle = '#d2573f'; c.fill();
    c.lineWidth = 1.6; c.strokeStyle = '#ffe3b8'; c.stroke();
    c.beginPath(); c.ellipse(0, 0, 30, 7, 0, 0, TAU); c.lineWidth = 0.8; c.setLineDash([2, 2]); c.stroke(); c.setLineDash([]);
    c.restore();
    box(c, x, y, w, 3, 2, CF_WALL, '#6b3a2a', { left: '#b5543a', right: '#8f412c' });
    onFaceY(c, x, y + 3, 2);
    c.strokeStyle = 'rgba(255,220,190,0.28)'; c.lineWidth = 0.5; c.beginPath();
    for (r = 1; r < 6; r++) { c.moveTo(0, -r * 3); c.lineTo(w, -r * 3); }
    for (r = 0; r < 6; r++) for (i = (r % 2) * 4 + 2; i < w; i += 8) { c.moveTo(i, -r * 3); c.lineTo(i, -r * 3 - 3); }
    c.stroke();
    c.restore();
    edge(c, x, y, w, 3, 2, CF_WALL, 1);
    var SW = 6;
    box(c, x, y + 3, 3, d - 3, 2, SW, '#6b3a2a', { right: '#f3e2c8', left: '#b5543a' });
    onFaceX(c, x + 3, y + d, 2 + SW);
    c.fillStyle = '#ff5fa2'; c.fillRect(0, 0.8, d - 3, 1.3);
    c.restore();
    edge(c, x, y + 3, 3, d - 3, 2, SW, 1);
    var FL = ['#ff5fa2', '#ffd23f', '#ff4d5e', '#ffffff', '#3fae5b', '#ff9f1c'];
    for (i = 0; i < 14; i++) {
      var fy = y + 6 + i * (d - 8) / 14, fp = { x: X(x + 1.5, fy), y: Y(x + 1.5, fy, 2 + SW + 1.2) };
      c.beginPath(); c.ellipse(fp.x, fp.y + 0.8, 2.3, 1.3, 0, 0, TAU); c.fillStyle = '#2f8f4a'; c.fill();
      c.beginPath(); c.arc(fp.x, fp.y, 1.7, 0, TAU); c.fillStyle = FL[i % FL.length]; c.fill();
      c.lineWidth = 0.5; c.strokeStyle = INK; c.stroke();
    }
    var AW = 8, AH0 = 2 + CF_WALL + 3, AH1 = 2 + CF_WALL, AD = 6;
    for (i = 0; i < w / AW; i++) {
      var ax = x + i * AW;
      fillPoly(c, [ax, y + 0.5, AH0, ax + AW, y + 0.5, AH0, ax + AW, y + AD, AH1, ax, y + AD, AH1], i % 2 ? '#fff4dc' : '#e2503f');
    }
    poly(c, [x, y + 0.5, AH0, x + w, y + 0.5, AH0, x + w, y + AD, AH1, x, y + AD, AH1]);
    c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    onFaceY(c, x, y + AD, AH1);
    for (i = 0; i < w / AW; i++) {
      c.beginPath(); c.moveTo(i * AW, 0); c.ellipse(i * AW + AW / 2, 0, AW / 2, 2.6, 0, PI, 0, true); c.closePath();
      c.fillStyle = i % 2 ? '#fff4dc' : '#e2503f'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
    var cx = x + 84, cy = y + 9;
    onTop(c, cx, cy, 2.1); c.beginPath(); c.ellipse(0, 0, 9, 9, 0, 0, TAU); c.fillStyle = '#fff4dc'; c.fill();
    c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke(); c.restore();
    var hp = { x: X(cx, cy) + 6.5, y: Y(cx, cy, 11) };
    c.beginPath(); c.ellipse(hp.x, hp.y, 3.4, 4, 0, -PI / 2, PI / 2); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = '#ffffff'; c.stroke();
    cyl(c, cx, cy, 6.5, 3, 14, '#ffffff', '#6b3a22', 1);
    cyl(c, cx, cy, 6.6, 8, 3.5, '#ff5fa2', '#6b3a22');
    var lp = { x: X(cx, cy), y: Y(cx, cy, 17) };
    c.beginPath(); c.moveTo(lp.x, lp.y + 1.4); c.bezierCurveTo(lp.x - 3, lp.y - 0.6, lp.x - 1.2, lp.y - 2.4, lp.x, lp.y - 0.8);
    c.bezierCurveTo(lp.x + 1.2, lp.y - 2.4, lp.x + 3, lp.y - 0.6, lp.x, lp.y + 1.4); c.fillStyle = '#fff4dc'; c.fill();
    cyl(c, x + 7, y + d - 7, 3, 2, 3.4, '#e2503f', '#6b4630', 0.8);
    var tp = { x: X(x + 7, y + d - 7), y: Y(x + 7, y + d - 7, 8.6) };
    blob(c, [tp.x, tp.y, 3.8, tp.x - 2.4, tp.y + 1.2, 2.6, tp.x + 2.4, tp.y + 1.2, 2.6], '#3fae5b', 0.8);
    c.beginPath(); c.arc(tp.x - 1.2, tp.y - 1.5, 1.4, 0, TAU); c.fillStyle = '#7ad98a'; c.fill();
    var ax0 = x + w - 9, ay0 = y + d - 7;
    fillPoly(c, [ax0, ay0, 2, ax0 + 6, ay0, 2, ax0 + 6, ay0, 12, ax0, ay0, 12], '#8a5a3c');
    fillPoly(c, [ax0 + 0.8, ay0, 3, ax0 + 5.2, ay0, 3, ax0 + 5.2, ay0, 11.2, ax0 + 0.8, ay0, 11.2], '#2f4a3a');
    poly(c, [ax0, ay0, 2, ax0 + 6, ay0, 2, ax0 + 6, ay0, 12, ax0, ay0, 12]); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    var ap = { x: X(ax0 + 3, ay0), y: Y(ax0 + 3, ay0, 7.5) };
    c.beginPath(); c.arc(ap.x, ap.y, 1.6, 0, TAU); c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.stroke();
  }
  function poolGrad(c, col) {
    var g = c.__pool || (c.__pool = {});
    if (!g[col]) {
      var gr = c.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, col); gr.addColorStop(0.55, col.replace(/[\d.]+\)$/, '0.25)')); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
      g[col] = gr;
    }
    return g[col];
  }
  var POOL_COLS = ['rgba(255,95,162,0.55)', 'rgba(76,201,240,0.55)', 'rgba(255,210,63,0.6)'];
  function cafeFloorFx(c, S, p, tr) {
    if (tr < 5) return;
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    for (var i = 0; i < (tr >= 6 ? 3 : 2); i++) {
      var a = S.t * (0.6 + i * 0.17) + i * 2.1;
      var px = x + w * (0.5 + 0.34 * Math.sin(a)), py = y + 8 + (d - 14) * (0.5 + 0.45 * Math.sin(a * 1.3 + i));
      onTop(c, px, py, 2.1);
      c.scale(15, 15); c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fillStyle = poolGrad(c, POOL_COLS[i]); c.fill();
      c.restore();
    }
  }
  function cafeBoardDyn(c, S, p, tr) {
    var bp = cfBoard(p), i;
    sprite(c, 'cafeboard', 'v1', [bp.x - 30, bp.y - 22, bp.x + 30, bp.y + 18], function (g) { cafeBoardStatic(g, p); });
    if (tr >= 4) {
      bulbs(c, bp.x - 23, bp.y - 10.3, 46, 20.8, 26, S.t * 1.4, tr >= 6 ? H0rainbow(S.t) : '#fff27a', '#fff0f7', 1.15);
      var cxp = bp.x - 28, cyp = bp.y + 0.5, sw = Math.cos(S.t * 2.6), aw = Math.abs(sw);
      c.save(); c.translate(cxp, cyp); c.scale(Math.max(0.12, aw), 1);
      c.beginPath(); c.ellipse(sw > 0 ? 4.6 : -4.6, -0.6, 2.2, 2.6, 0, 0, TAU); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = '#ffffff'; c.stroke();
      c.beginPath(); c.moveTo(-4.6, -4.4); c.lineTo(4.6, -4.4); c.lineTo(3.6, 3.6); c.quadraticCurveTo(0, 5.4, -3.6, 3.6); c.closePath();
      c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
      c.fillStyle = '#ff5fa2'; c.fillRect(-4.2, -1.6, 8.4, 1.8);
      c.restore();
      c.beginPath(); c.ellipse(cxp, cyp - 4.4, 4.6 * Math.max(0.12, aw), 1.2, 0, 0, TAU); c.fillStyle = '#6b3a22'; c.fill();
      c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
      c.globalAlpha = 0.6; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath();
      c.moveTo(cxp, cyp - 6); c.quadraticCurveTo(cxp + 2 * Math.sin(S.t * 4), cyp - 8.5, cxp, cyp - 11); c.stroke(); c.globalAlpha = 1;
    }
    var stars = Math.max(1, Math.min(5, Math.round(S.cafe.rep * 5)));
    for (i = 0; i < 5; i++) {
      starPath(c, bp.x - 11 + i * 5.5, bp.y + 4.6, 2.2);
      c.fillStyle = i < stars ? '#ffd23f' : 'rgba(255,255,255,0.22)'; c.fill();
    }
    if (tr >= 3) {
      var hb = 1 + 0.15 * Math.sin(S.t * 6);
      c.save(); c.translate(bp.x + 29, bp.y - 6); c.scale(hb, hb);
      heartPath(c, 0, 0, 1); c.fillStyle = '#ff5fa2'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
      c.restore();
    }
    if (tr >= 5) {
      var s1 = blink(S.t, 0.7, 1.5), s2 = blink(S.t, 1.9, 1.8);
      if (s1 > 0) sparkle(c, bp.x - 22, bp.y - 9, 1.5 + 3 * s1, '#ffffff');
      if (s2 > 0) sparkle(c, bp.x + 20, bp.y + 8, 1.5 + 3 * s2, '#fff6b0');
    }
  }
  function cafeDyn(c, S, p, tr) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    if (tr >= 5) {
      var AW = 8, AH0 = 2 + CF_WALL + 3, AH1 = 2 + CF_WALL, AD = 6, ph = Math.floor(S.t * 5);
      for (i = 0; i < w / AW; i += 2) {
        var ax = x + i * AW;
        fillPoly(c, [ax, y + 0.5, AH0, ax + AW, y + 0.5, AH0, ax + AW, y + AD, AH1, ax, y + AD, AH1], RAINBOW[(i / 2 + ph) % 7]);
      }
      onFaceY(c, x, y + AD, AH1);
      c.lineWidth = 0.7; c.strokeStyle = INK;
      for (i = 0; i < w / AW; i += 2) {
        c.beginPath(); c.moveTo(i * AW, 0); c.ellipse(i * AW + AW / 2, 0, AW / 2, 2.6, 0, PI, 0, true); c.closePath();
        c.fillStyle = RAINBOW[(i / 2 + ph) % 7]; c.fill(); c.stroke();
      }
      c.restore();
    }
    var cols = ['#fff27a', '#ffb3d9', '#ffd23f', '#b8f3ff'];
    c.beginPath();
    for (i = 0; i < 12; i++) {
      var bx = x + 4 + i * 8, sag = Math.sin((i % 3 + 0.5) / 3 * PI) * 1.2;
      var q = { x: X(bx, y + 2), y: Y(bx, y + 2, 2 + CF_WALL + 3.6 - sag) };
      if (Math.sin(S.t * 3 + i * 1.7) > -0.3) { c.moveTo(q.x + 1, q.y); c.arc(q.x, q.y, 1, 0, TAU); }
    }
    c.fillStyle = cols[Math.floor(S.t * 2) % 4]; c.fill();
    if (tr >= 3) {
      c.strokeStyle = tr >= 6 ? 'rgba(255,120,200,0.5)' : 'rgba(255,214,70,0.6)'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath();
      mv(c, x + 3, y + d, 1); ln(c, x + w, y + d, 1); ln(c, x + w, y, 1); c.stroke();
      var cc = tr >= 6 ? CHASE_RB : ['#ffb3d9', '#fff27a', '#ffffff'];
      chase(c, x + 3, y + d, x + w, y + d, 1, 24, S.t, cc, 1);
      chase(c, x + w, y + d, x + w, y, 1, 20, S.t, cc, 1);
    }
    var cp = { x: X(x + 84, y + 9), y: Y(x + 84, y + 9, 20) };
    if (tr >= 2) {
      var hf = (S.t * 0.5) % 1;
      c.globalAlpha = 1 - hf;
      heartPath(c, cp.x + Math.sin(S.t * 2) * 2, cp.y - 6 - hf * 12, 0.8);
      c.fillStyle = '#ff7eb6'; c.fill();
      c.globalAlpha = 1;
    }
    c.globalAlpha = 0.55; c.strokeStyle = '#ffffff'; c.lineWidth = 1.4; c.beginPath();
    for (i = 0; i < 2; i++) {
      var ox = cp.x - 2 + i * 4, ph2 = S.t * 2.5 + i * 2;
      c.moveTo(ox, cp.y); c.bezierCurveTo(ox + 2 * Math.sin(ph2), cp.y - 3, ox - 2 * Math.sin(ph2), cp.y - 5, ox + Math.sin(ph2), cp.y - 7.5);
    }
    c.stroke(); c.globalAlpha = 1;
  }
  on('base', 'cafe', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var tr = cfTier = prosper(S, p, S.cafe.served);
    var b = bbox(x, y, w, d, 32, 4);
    if (!seen(H, b)) return true;
    sprite(c, 'cafe', 'v6', b, function (g) { cafeStatic(g, p); });
    cafeFloorFx(c, S, p, tr);
    padMarks(c, H, S, p, 2);
    cafeDyn(c, S, p, tr);
    return true;
  });
  function cfBar(c, S, x, y, w) {
    sprite(c, 'cfbar', 'v1', bbox(x, y, w, T, 30, 3), function (g) {
      var i;
      Iso.shadow(g, x + 2, y + 3, w - 4, 11, 0.14);
      box(g, x + 2, y + 3, w - 4, 11, 2, 9, '#f2e6d6', { left: '#5a3424', right: '#6f4230' });
      edge(g, x + 2, y + 3, w - 4, 11, 2, 9, 1);
      obox(g, x + 4, y + 4, 17, 8, 11, 10, '#e9edf3', { left: '#b3bccb', right: '#cdd4df' }, 0.9);
      obox(g, x + 4, y + 4, 17, 8, 21, 1.6, '#e2503f', { left: '#b53a2b', right: '#c94434' }, 0.8);
      for (i = 0; i < 2; i++) cyl(g, x + 8 + i * 8, y + 12.5, 1.4, 13, 3, '#4a4466');
      var gp = { x: X(x + 12.5, y + 12), y: Y(x + 12.5, y + 12, 18.5) };
      g.beginPath(); g.arc(gp.x, gp.y, 1.6, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 0.5; g.strokeStyle = INK; g.stroke();
      cyl(g, x + 10, y + 7, 1.3, 22.6, 2, '#ffffff'); cyl(g, x + 15, y + 7, 1.3, 22.6, 2, '#ffffff');
      cyl(g, x + 26, y + 8, 2.6, 11, 7, '#3a3550', null, 0.7);
      cyl(g, x + 26, y + 8, 2.2, 18, 4, '#a5764f', '#c89b6a', 0.6);
      box(g, x + 31, y + 4, 18, 8, 11, 1, '#ffffff');
      var cakes = ['#ff9fc8', '#fff0c2', '#8a5a3c', '#ffd23f', '#b8f3ff'];
      for (i = 0; i < 5; i++) {
        var kp = { x: X(x + 33.5 + i * 3.3, y + 8), y: Y(x + 33.5 + i * 3.3, y + 8, 13.8) };
        g.beginPath(); g.ellipse(kp.x, kp.y, 1.6, 1.2, 0, 0, TAU); g.fillStyle = cakes[i]; g.fill();
        g.beginPath(); g.arc(kp.x, kp.y - 1.3, 0.6, 0, TAU); g.fillStyle = '#ff4d5e'; g.fill();
      }
      box(g, x + 31, y + 4, 18, 8, 12, 6, 'rgba(225,245,255,0.35)', { left: 'rgba(200,235,255,0.35)', right: 'rgba(190,225,250,0.35)' });
      edge(g, x + 31, y + 4, 18, 8, 11, 7, 0.8);
      for (i = 0; i < 3; i++) {
        cyl(g, x + 53 + i * 4, y + 8, 1.7, 11, 5.5, '#c9e9f5', '#e6f6fc', 0.6);
        cyl(g, x + 53 + i * 4, y + 8, 1.5, 11.2, 3.2, ['#6b3a22', '#a5764f', '#3a2418'][i]);
      }
    });
    var brewing = S.heldPad && S.heldPad.type === 'brew';
    var sp = { x: X(x + 12.5, y + 8), y: Y(x + 12.5, y + 8, 25) };
    var n = brewing ? 3 : 1;
    c.globalAlpha = brewing ? 0.75 : 0.45; c.strokeStyle = '#ffffff'; c.lineWidth = 1.3; c.beginPath();
    for (var i = 0; i < n; i++) {
      var ox = sp.x - 3 + i * 3, ph = S.t * 3 + i * 1.7, top = brewing ? 10 : 6;
      c.moveTo(ox, sp.y); c.bezierCurveTo(ox + 2 * Math.sin(ph), sp.y - top * 0.4, ox - 2 * Math.sin(ph), sp.y - top * 0.7, ox, sp.y - top);
    }
    c.stroke(); c.globalAlpha = 1;
    var lp = { x: X(x + 19, y + 12), y: Y(x + 19, y + 12, 19) };
    c.beginPath(); c.arc(lp.x, lp.y, 1, 0, TAU);
    c.fillStyle = brewing ? (Math.sin(S.t * 12) > 0 ? '#7dff9a' : '#2fbf7a') : '#ffd23f'; c.fill();
  }
  function cfCounter(c, S, x, y, w) {
    var MAX = (QT.G && QT.G.CFG && QT.G.CFG.cupsMax) || 6, i;
    var slotX = function (k) { return x + 7 + k * (w - 14) / (MAX - 1); };
    sprite(c, 'cfcounter', 'v1|' + MAX, bbox(x, y, w, T, 24, 3), function (g) {
      Iso.shadow(g, x + 1, y + 4, w - 2, 9, 0.14);
      box(g, x + 1, y + 4, w - 2, 9, 2, 10, '#a86f47', { left: '#fff1dd', right: '#e9d3b6' });
      g.strokeStyle = 'rgba(140,90,50,0.35)'; g.lineWidth = 0.6; g.beginPath();
      for (i = 5; i < w - 2; i += 5) { mv(g, x + 1 + i, y + 13, 2.5); ln(g, x + 1 + i, y + 13, 8); }
      g.stroke();
      Iso.leftFacePath(g, x + 1, y + 4, w - 2, 9, 9.8, 8.8); g.fillStyle = '#ff5fa2'; g.fill();
      edge(g, x + 1, y + 4, w - 2, 9, 2, 10, 1);
      for (i = 0; i < MAX; i++) {
        var sp = { x: X(slotX(i), y + 8.5), y: Y(slotX(i), y + 8.5, 12.05) };
        g.beginPath(); g.ellipse(sp.x, sp.y, 3.3, 1.8, 0, 0, TAU); g.fillStyle = 'rgba(255,241,221,0.55)'; g.fill();
      }
    });
    if (cfTier >= 3) chase(c, x + 1.5, y + 13, x + w - 1.5, y + 13, 10.6, 18, S.t + 0.3, cfTier >= 6 ? CHASE_RB : ['#ffb3d9', '#fff27a', '#ffffff'], 0.8);
    var n = Math.min(MAX, S.cafe.cups);
    if (n === 0) {
      var k = 0.5 + 0.5 * Math.sin(S.t * 6);
      c.save(); c.globalAlpha = 0.4 + 0.5 * k; c.setLineDash([1.4, 1.2]); c.lineWidth = 0.9; c.strokeStyle = '#ff5fa2';
      for (i = 0; i < MAX; i++) {
        var e = { x: X(slotX(i), y + 8.5), y: Y(slotX(i), y + 8.5, 12.1) };
        c.beginPath(); c.ellipse(e.x, e.y, 3, 1.6, 0, 0, TAU); c.stroke();
      }
      c.restore();
    }
    for (i = 0; i < n; i++) {
      var cx = slotX(i), cy = y + 8.5;
      var hp = { x: X(cx, cy) + 2.6, y: Y(cx, cy, 15.4) };
      c.beginPath(); c.ellipse(hp.x, hp.y, 1.4, 1.7, 0, -PI / 2, PI / 2); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 0.8; c.strokeStyle = '#ffffff'; c.stroke();
      cyl(c, cx, cy, 2.8, 12, 6.2, '#ffffff', '#7a4a2a', 0.7);
      cyl(c, cx, cy, 2.85, 13.6, 1.6, '#ff5fa2', '#7a4a2a');
      var tp = { x: X(cx, cy), y: Y(cx, cy, 18.2) };
      c.beginPath(); c.ellipse(tp.x, tp.y, 1, 0.55, 0, 0, TAU); c.fillStyle = '#fff4dc'; c.fill();
      var ph = S.t * 3 + i * 1.3;
      c.globalAlpha = 0.45 + 0.2 * Math.sin(ph); c.strokeStyle = '#ffffff'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(tp.x, tp.y - 1.5); c.quadraticCurveTo(tp.x + 1.8 * Math.sin(ph), tp.y - 4, tp.x, tp.y - 6.5); c.stroke();
      c.globalAlpha = 1;
    }
  }
  on('fixture', 'cafe', function (p, i, S, H) {
    var c = H.ctx, b = p.blocks[i];
    var x = (p.x + b[0]) * T, y = (p.y + b[1]) * T, w = b[2] * T;
    if (!seen(H, bbox(x, y, w, T, 34, 4))) return true;
    var isCounter = p.counterAt && b[1] === p.counterAt[1];
    if (isCounter) cfCounter(c, S, x, y, w); else { cfBar(c, S, x, y, w); cafeBoardDyn(c, S, p, cfTier); }
    return true;
  });
  function medal(c, x, y, done) {
    var i;
    if (done) {
      c.fillStyle = '#e2503f';
      c.beginPath(); c.moveTo(x - 3.5, y + 2); c.lineTo(x - 6, y + 11); c.lineTo(x - 3.4, y + 9.6); c.lineTo(x - 1.6, y + 12); c.lineTo(x, y + 3); c.closePath(); c.fill();
      c.fillStyle = '#4a63e8';
      c.beginPath(); c.moveTo(x + 3.5, y + 2); c.lineTo(x + 6, y + 11); c.lineTo(x + 3.4, y + 9.6); c.lineTo(x + 1.6, y + 12); c.lineTo(x, y + 3); c.closePath(); c.fill();
      c.beginPath();
      for (i = 0; i < 20; i++) { var a = i / 20 * TAU, rr = i % 2 ? 6.4 : 7.6; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.closePath(); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(x, y, 4.9, 0, TAU); c.fillStyle = '#2fbf7a'; c.fill();
      c.beginPath(); c.moveTo(x - 2.5, y + 0.1); c.lineTo(x - 0.6, y + 2); c.lineTo(x + 2.7, y - 2);
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.stroke();
    } else {
      c.beginPath(); c.arc(x, y, 5.4, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
      c.save(); c.setLineDash([1.8, 1.4]); c.strokeStyle = '#8e87a8'; c.lineWidth = 1.1; c.stroke(); c.restore();
      pop(c, '?', x, y + 0.3, 6, '#8e87a8', null, 0);
    }
  }
  var NT_TOP = 51;
  function notaryStatic(c, p, done, ja) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.22);
    obox(c, x + 1, y + 1, w - 2, d - 2, 0, 3, '#ffffff', { left: '#d6dcea', right: '#e8ecf5' }, 1);
    obox(c, x + 3, y + 41, 8, 5, 3, 2.5, '#6fcf6f', { left: '#b88450', right: '#cc9862' }, 0.7);
    obox(c, x + 37, y + 41, 8, 5, 3, 2.5, '#6fcf6f', { left: '#b88450', right: '#cc9862' }, 0.7);
    for (i = 0; i < 4; i++) {
      var fp = { x: X(x + 4.5 + i * 2, y + 43.5), y: Y(x + 4.5 + i * 2, y + 43.5, 6.3) };
      var fq = { x: X(x + 38.5 + i * 2, y + 43.5), y: Y(x + 38.5 + i * 2, y + 43.5, 6.3) };
      c.fillStyle = ['#ff5fa2', '#ffd23f', '#ff4d5e', '#ffffff'][i];
      c.beginPath(); c.arc(fp.x, fp.y, 1.1, 0, TAU); c.arc(fq.x, fq.y, 1.1, 0, TAU); c.fill();
    }
    rprism(c, x + 5, y + 5, 38, 35, 8, 3, 24, '#fff1d6', '#fff8ea', 1.1);
    onFaceY(c, x + 13, y + 40, 3);
    for (i = 0; i < 2; i++) {
      rrect(c, 1 + i * 16, -19, 6, 9, 3); c.fillStyle = '#9fd2ff'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    }
    rrect(c, 8.5, -12, 5, 12, 2.5); c.fillStyle = '#4a63e8'; c.fill(); c.stroke();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(12.2, -5.5, 0.7, 0, TAU); c.fill();
    c.restore();
    onFaceX(c, x + 43, y + 32, 3);
    for (i = 0; i < 3; i++) {
      rrect(c, 1 + i * 6.5, -19, 4.2, 9, 2); c.fillStyle = '#9fd2ff'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
    rprism(c, x + 4.5, y + 4.5, 39, 36, 8.5, 27, 3, '#4a63e8', '#6f86ff', 1);
    rprism(c, x + 10, y + 10, 28, 27, 7, 30, 19, '#4a63e8', '#7b90ff', 1.1);
    onFaceY(c, x + 17, y + 37, 30);
    for (i = 0; i < 3; i++) { rrect(c, i * 5.5, -16, 2.6, 13, 1.3); c.fillStyle = 'rgba(210,235,255,0.95)'; c.fill(); }
    c.restore();
    onFaceX(c, x + 38, y + 30, 30);
    for (i = 0; i < 3; i++) { rrect(c, i * 5.5, -16, 2.6, 13, 1.3); c.fillStyle = 'rgba(190,220,255,0.9)'; c.fill(); }
    c.restore();
    rprism(c, x + 9, y + 9, 30, 29, 8, 49, 2.2, '#ffffff', '#f4f1ff', 1);
    onTop(c, x + 16, y + 16, NT_TOP + 0.3);
    c.fillStyle = '#fffdf5'; c.fillRect(0, 0, 16, 16); c.lineWidth = 0.6; c.strokeStyle = 'rgba(80,60,90,0.5)'; c.strokeRect(0, 0, 16, 16);
    c.beginPath(); c.arc(8, 8, 5.2, 0, TAU); c.lineWidth = 1.1; c.strokeStyle = '#e2403a'; c.stroke();
    c.save(); c.translate(8, 8); c.rotate(-PI / 4);
    pop(c, ja ? '印' : '✓', 0, 0.3, 6, '#e2403a', null, 0);
    c.restore();
    c.restore();
    onFaceX(c, x + 38, y + 30, 30);
    c.beginPath(); c.arc(6.5, -9.5, 6.4, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(6.5, -9.5, 5, 0, TAU); c.fillStyle = '#e2403a'; c.fill();
    c.save(); c.scale(1.2, 1); pop(c, ja ? '印' : 'N', 6.5 / 1.2, -9.1, 6.2, '#ffffff', null, 0); c.restore();
    c.restore();
    medal(c, X(x + 42, y + 37), Y(x + 42, y + 37, 29), done);
  }
  function hankoLift(t) {
    var k = (t % 3.2) / 3.2;
    if (k < 0.16) { var e = k / 0.16; return 13 * (1 - (1 - e) * (1 - e)); }
    if (k < 0.7) return 13 + Math.sin(k * 30) * 0.6;
    if (k < 0.77) { var f = (k - 0.7) / 0.07; return 13 * (1 - f * f); }
    return 0;
  }
  function notaryDyn(c, S, p, H) {
    var x = p.x * T, y = p.y * T, cx = x + 24, cy = y + 24, base = NT_TOP + 0.4;
    var k = (S.t % 3.2) / 3.2, lift = hankoLift(S.t);
    if (k > 0.77 && k < 0.95) {
      var f = (k - 0.77) / 0.18;
      onTop(c, cx, cy, base);
      c.globalAlpha = 1 - f; c.beginPath(); c.arc(0, 0, 8 + f * 12, 0, TAU);
      c.lineWidth = 1.6; c.strokeStyle = '#ff4d5e'; c.stroke(); c.globalAlpha = 1;
      c.restore();
    }
    onTop(c, cx, cy, base);
    c.beginPath(); c.arc(0, 0, 7.5 - lift * 0.15, 0, TAU); c.fillStyle = 'rgba(40,20,60,' + (0.28 - lift * 0.012) + ')'; c.fill();
    c.restore();
    var sq = lift < 0.5 && k > 0.77 && k < 0.82 ? 0.85 : 1;
    cyl(c, cx, cy, 6.8, base + lift, 3.6 * sq, '#b8322c', '#d64a3f', 1);
    cyl(c, cx, cy, 4.2, base + lift + 3.6 * sq, 10 * sq, '#e0483f', '#ff6a5c', 1);
    var kp = { x: X(cx, cy), y: Y(cx, cy, base + lift + 3.6 * sq + 10 * sq + 4.2) };
    c.beginPath(); c.arc(kp.x, kp.y, 5.2, 0, TAU); c.fillStyle = '#e0483f'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(kp.x + 1.6, kp.y - 1.8, 1.6, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
    c.fillStyle = '#ffd23f'; c.fillRect(kp.x - 5, kp.y + 4.1, 10, 1.4);
    if (S.co.certified) {
      var s = blink(S.t, 2, 1.7);
      if (s > 0) sparkle(c, X(x + 42, y + 37) + 7, Y(x + 42, y + 37, 29) - 6, 1.5 + 3 * s, '#fff6b0');
    }
  }
  on('plot', 'notary', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, NT_TOP + 36, 4);
    if (!seen(H, b)) return true;
    var ja = H.L.get() === 'ja';
    sprite(c, 'notary', 'v2|' + (S.co.certified ? 1 : 0) + ja, b, function (g) { notaryStatic(g, p, S.co.certified, ja); });
    notaryDyn(c, S, p, H);
    return true;
  });
  var RG_TOWER = 56;
  function registryStatic(c, p, done) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    var tx = x + 12, ty = y + 11;
    Iso.shadow(c, x, y, w, d, 0.22);
    obox(c, x + 1, y + 1, w - 2, d - 2, 0, 3, '#ffffff', { left: '#d6dcea', right: '#e8ecf5' }, 1);
    cyl(c, tx, ty, 8.5, 3, RG_TOWER - 3, '#efe9ff', '#ffffff', 1.1);
    cyl(c, tx, ty, 8.8, 30, 2.4, '#7b5cff', '#9d86ff');
    cyl(c, tx, ty, 8.8, RG_TOWER - 4, 3, '#7b5cff', '#9d86ff', 0.9);
    dome(c, tx, ty, 8, RG_TOWER - 1, 10, '#ffc53d', 1);
    var sp = { x: X(tx, ty), y: Y(tx, ty, RG_TOWER + 9) };
    c.fillStyle = '#5a4a2a'; c.fillRect(sp.x - 0.5, sp.y - 10, 1, 10);
    obox(c, x + 5, y + 16, 38, 22, 3, 20, '#f4efff', { left: '#ddd3fb', right: '#e9e2ff' }, 1);
    onFaceX(c, x + 43, y + 36, 3);
    for (i = 0; i < 3; i++) { rrect(c, 2 + i * 6.5, -16, 4, 10, 2); c.fillStyle = '#b9a8ff'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke(); }
    c.restore();
    box(c, x + 5, y + 38, 38, 8, 3, 1, '#ffffff');
    for (i = 0; i < 4; i++) cyl(c, x + 9 + i * 10, y + 43, 1.8, 4, 19, '#ffffff', null, 0.7);
    obox(c, x + 4, y + 15, 40, 32, 23, 2.6, '#7b5cff', { left: '#5a3fd8', right: '#6a4ee6' }, 1);
    fillPoly(c, [x + 4, y + 47, 25.6, x + 44, y + 47, 25.6, x + 24, y + 47, 34], '#f4efff');
    fillPoly(c, [x + 4, y + 39, 25.6, x + 24, y + 39, 34, x + 24, y + 47, 34, x + 4, y + 47, 25.6], '#6a4ee6');
    fillPoly(c, [x + 24, y + 39, 34, x + 44, y + 39, 25.6, x + 44, y + 47, 25.6, x + 24, y + 47, 34], '#8b70ff');
    poly(c, [x + 4, y + 47, 25.6, x + 24, y + 47, 34, x + 44, y + 47, 25.6, x + 44, y + 39, 25.6, x + 24, y + 39, 34, x + 4, y + 39, 25.6]);
    c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    var ep = { x: X(x + 24, y + 47), y: Y(x + 24, y + 47, 28.6) };
    rrect(c, ep.x - 4, ep.y - 2, 8, 4, 1.2); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#e8a800'; c.fillRect(ep.x - 5, ep.y - 2.4, 1.6, 4.8); c.fillRect(ep.x + 3.4, ep.y - 2.4, 1.6, 4.8);
    medal(c, X(x + 42, y + 32), Y(x + 42, y + 32, 29), done);
  }
  function registryDyn(c, S, p) {
    var x = p.x * T, y = p.y * T, tx = x + 12, ty = y + 11;
    var cp = { x: X(tx, ty), y: Y(tx, ty, 44) + 8.8 * KY * 0.8 };
    c.beginPath(); c.ellipse(cp.x, cp.y, 5.6, 6, 0, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
    c.lineWidth = 1.2; c.strokeStyle = '#7b5cff'; c.stroke();
    c.fillStyle = '#7b5cff';
    for (var i = 0; i < 4; i++) { var a = i * PI / 2; c.fillRect(cp.x + Math.cos(a) * 4.3 - 0.4, cp.y + Math.sin(a) * 4.6 - 0.4, 0.8, 0.8); }
    var m = S.t / 60 * TAU, hr = m / 12;
    c.strokeStyle = INK; c.lineCap = 'round';
    c.lineWidth = 0.8; c.beginPath(); c.moveTo(cp.x, cp.y); c.lineTo(cp.x + Math.sin(m) * 4.2, cp.y - Math.cos(m) * 4.5); c.stroke();
    c.lineWidth = 1.1; c.beginPath(); c.moveTo(cp.x, cp.y); c.lineTo(cp.x + Math.sin(hr) * 2.6, cp.y - Math.cos(hr) * 2.8); c.stroke();
    var fp = { x: X(tx, ty), y: Y(tx, ty, RG_TOWER + 19) };
    c.beginPath(); c.moveTo(fp.x + 0.5, fp.y);
    for (i = 1; i <= 4; i++) c.lineTo(fp.x + 0.5 + i * 2.2, fp.y + Math.sin(S.t * 6 + i) * 0.9 + i * 0.2);
    for (i = 4; i >= 0; i--) c.lineTo(fp.x + 0.5 + i * 2.2, fp.y + 4 + Math.sin(S.t * 6 + i) * 0.9);
    c.closePath(); c.fillStyle = '#ff4d5e'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    if (S.co.founded) {
      var s = blink(S.t, 5, 1.9);
      if (s > 0) sparkle(c, X(x + 42, y + 32) + 7, Y(x + 42, y + 32, 29) - 6, 1.5 + 3 * s, '#fff6b0');
    }
  }
  on('plot', 'registry', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, RG_TOWER + 30, 4);
    if (!seen(H, b)) return true;
    sprite(c, 'registry', 'v2|' + (S.co.founded ? 1 : 0), b, function (g) { registryStatic(g, p, S.co.founded); });
    registryDyn(c, S, p);
    return true;
  });
  function bankTier(S, p) {
    var t = 1 + (S.co.bank ? 1 : 0) + ((S.loans && S.loans.bankp) > 0 ? 1 : 0);
    var mx = QT.G.loanMax ? QT.G.loanMax('bankp') : 0;
    if (mx > 3e6) t += Math.min(3, Math.floor(Math.log(mx / 3e6) / Math.log(2)) + 1);
    return Math.max(lvOf(S, p), Math.min(6, t));
  }
  function bankStatic(c, p, tier, open) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.22);
    obox(c, x + 1, y + 1, w - 2, d - 2, 0, 2, '#eef0f4', { left: '#c9ceda', right: '#dde1ea' }, 1);
    obox(c, x + 3, y + 3, w - 6, d - 6, 2, 2, '#ffffff', { left: '#d8dce6', right: '#e8ebf1' }, 0.9);
    obox(c, x + 6, y + 5, 68, 29, 4, 24, '#fff8e6', { left: '#f1dfb8', right: '#f8ebcd' }, 1);
    onFaceY(c, x + 6, y + 34, 4);
    for (i = 0; i < 5; i++) {
      rrect(c, 5 + i * 13, -19, 6, 13, 3); c.fillStyle = i === 2 ? '#1f7a52' : '#bfe8ff'; c.fill();
      c.lineWidth = 0.8; c.strokeStyle = '#e8a800'; c.stroke();
    }
    c.restore();
    onFaceX(c, x + 74, y + 34, 4);
    c.fillStyle = '#f1dfb8'; c.fillRect(0, -24, 29, 24);
    c.restore();
    obox(c, x + 5, y + 4, 70, 31, 28, 3, '#1faa70', { left: '#e8a800', right: '#f5b21c' }, 1);
    var bars = Math.min(12, tier * 2);
    for (i = 0; i < bars; i++) {
      var col = i % 4, row = Math.floor(i / 4), lay = row >= 2 ? 1 : 0;
      var gx = x + 44 + col * 6 + lay * 3, gy = y + 9 + (row % 2) * 5;
      obox(c, gx, gy, 5, 3.2, 31 + lay * 2.2, 2.2, '#ffd23f', { left: '#d99a00', right: '#f5b21c' }, 0.6);
    }
    box(c, x + 6, y + 34, 68, 11, 4, 0.8, '#ffffff');
    for (i = 0; i < 6; i++) cyl(c, x + 11 + i * 11.6, y + 40, 2.4, 4.8, 22.4, '#ffc53d', '#ffe27a', 0.9);
    obox(c, x + 5, y + 34, 70, 11, 27.2, 4, '#fff1c9', { left: '#ffd98a', right: '#ffe4a6' }, 1);
    fillPoly(c, [x + 5, y + 45, 31.2, x + 75, y + 45, 31.2, x + 40, y + 45, 45], '#fff8e6');
    fillPoly(c, [x + 5, y + 36, 31.2, x + 40, y + 36, 45, x + 40, y + 45, 45, x + 5, y + 45, 31.2], '#1a9463');
    fillPoly(c, [x + 40, y + 36, 45, x + 75, y + 36, 31.2, x + 75, y + 45, 31.2, x + 40, y + 45, 45], '#22b879');
    poly(c, [x + 5, y + 45, 31.2, x + 40, y + 45, 45, x + 75, y + 45, 31.2, x + 75, y + 36, 31.2, x + 40, y + 36, 45, x + 5, y + 36, 31.2]);
    c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = '#f5b21c'; c.lineWidth = 0.8; c.beginPath();
    mv(c, x + 6, y + 45, 32); ln(c, x + 40, y + 45, 44.2); ln(c, x + 74, y + 45, 32); c.stroke();
    onFaceY(c, x + 40, y + 45, 34.6);
    c.scale(1.3, 1);
    pop(c, 'BANK', 0, 0, 6.2, '#ffd23f', INK, 1.5);
    c.restore();
    if (open) {
      c.strokeStyle = '#fff27a'; c.lineWidth = 0.7; c.beginPath();
      mv(c, x + 5, y + 45, 27.2); ln(c, x + 75, y + 45, 27.2); c.stroke();
    }
    if (tier >= 3) {
      Iso.facePath(c, x + 6.2, y + 5.2, 67.6, 28.6, 31.05); c.lineWidth = 1.3; c.strokeStyle = '#ffd23f'; c.stroke();
    }
    if (tier >= 4) {
      for (i = 0; i < 6; i++) {
        cyl(c, x + 11 + i * 11.6, y + 40, 2.9, 4.8, 1.8, '#ffe27a', '#fff3b0', 0.6);
        cyl(c, x + 11 + i * 11.6, y + 40, 2.9, 24.6, 2.2, '#ffe27a', '#fff3b0', 0.6);
      }
    }
  }
  function bankDyn(c, S, p, tier) {
    var x = p.x * T, y = p.y * T, i;
    var vx = x + 74, vy = y + 19.5, vh = 15;
    onFaceX(c, vx, vy, vh);
    var r = 10;
    c.beginPath(); c.arc(0, 0, r + 1.2, 0, TAU); c.fillStyle = INK; c.fill();
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#ffc53d'; c.fill();
    c.beginPath(); c.arc(0, 0, r - 2.2, 0, TAU); c.fillStyle = '#8e97ab'; c.fill();
    c.beginPath(); c.arc(0, 0, r - 3.4, 0, TAU); c.fillStyle = '#b9c1d1'; c.fill();
    for (i = 0; i < 8; i++) {
      var a0 = i / 8 * TAU;
      c.beginPath(); c.arc(Math.cos(a0) * (r - 1.1), Math.sin(a0) * (r - 1.1), 0.6, 0, TAU); c.fillStyle = '#e8a800'; c.fill();
    }
    var sp = S.t * (S.co.bank ? 1.4 : 0.5);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath();
    for (i = 0; i < 3; i++) { var a = sp + i * PI / 3; c.moveTo(-Math.cos(a) * 5, -Math.sin(a) * 5); c.lineTo(Math.cos(a) * 5, Math.sin(a) * 5); }
    c.stroke();
    c.beginPath(); c.arc(0, 0, 1.8, 0, TAU); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    c.restore();
    if (tier >= 3) {
      var bc = tier >= 6 ? CHASE_RB : CHASE_GOLD;
      chase(c, x + 5, y + 45.4, x + 40, y + 45.4, 31.6, 13, S.t, bc, 0.95, 45.4);
      chase(c, x + 40, y + 45.4, x + 75, y + 45.4, 45.4, 13, S.t + 0.5, bc, 0.95, 31.6);
      chase(c, x + 5, y + 45.4, x + 75, y + 45.4, 28.4, 22, S.t, bc, 0.8);
    }
    if (tier >= 4) {
      c.fillStyle = 'rgba(255,255,230,0.85)';
      c.beginPath();
      for (i = 0; i < 6; i++) {
        var pk = (S.t * 0.9 + i * 0.12) % 1, px = x + 11 + i * 11.6, py = y + 40;
        var q = { x: X(px, py) + 0.6, y: Y(px, py, 6 + pk * 17) + 2.4 * KY };
        c.moveTo(q.x + 1.1, q.y); c.ellipse(q.x, q.y, 1.1, 2.6, 0, 0, TAU);
      }
      c.fill();
    }
    var cx = x + 16, cy = y + 16, cp = { x: X(cx, cy), y: Y(cx, cy, 44) };
    var sz = 7.5 + Math.min(3, tier * 0.5);
    if (tier >= 5) {
      var ra = S.t * 0.8, nr = 10, rl = sz + 7 + (tier >= 6 ? 3 : 0);
      c.globalAlpha = 0.5; c.beginPath();
      for (i = 0; i < nr; i++) {
        var a1 = ra + i / nr * TAU, a2 = a1 + TAU / nr * 0.45;
        c.moveTo(cp.x, cp.y); c.lineTo(cp.x + Math.cos(a1) * rl, cp.y + Math.sin(a1) * rl); c.lineTo(cp.x + Math.cos(a2) * rl, cp.y + Math.sin(a2) * rl); c.closePath();
      }
      c.fillStyle = '#fff27a'; c.fill(); c.globalAlpha = 1;
    }
    c.strokeStyle = INK; c.lineWidth = 1; c.fillStyle = '#c9ceda';
    c.fillRect(cp.x - 0.8, cp.y + sz - 1, 1.6, Y(cx, cy, 31) - cp.y - sz + 1);
    var sw = Math.cos(S.t * 2.2), aw = Math.abs(sw);
    c.beginPath(); c.ellipse(cp.x, cp.y, Math.max(0.8, sz * aw), sz, 0, 0, TAU);
    c.fillStyle = '#e8a800'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(cp.x + (sw > 0 ? -0.8 : 0.8) * (1 - aw), cp.y, Math.max(0.5, (sz - 1.3) * aw), sz - 1.3, 0, 0, TAU);
    c.fillStyle = '#ffd23f'; c.fill();
    if (aw > 0.35) {
      c.save(); c.translate(cp.x, cp.y); c.scale(aw, 1);
      yen(c, 0, 0.2, sz * 0.62, '#fff6b0', '#c98f0f');
      c.restore();
    }
    var k = blink(S.t, 4, 1.6);
    if (k > 0) sparkle(c, cp.x + sz * 0.7, cp.y - sz * 0.8, 1.5 + 3 * k, '#ffffff');
    if (tier >= 6) {
      for (i = 0; i < 3; i++) {
        var fk = (S.t * 0.8 + i / 3) % 1, gx0 = x + 50 + i * 7, gy0 = y + 12;
        var gq = { x: X(gx0, gy0) + fk * 6 * (i - 1), y: Y(gx0, gy0, 34) - Math.sin(fk * PI) * 14 };
        c.globalAlpha = fk < 0.8 ? 1 : (1 - fk) * 5;
        c.beginPath(); c.ellipse(gq.x, gq.y, 2.4 * Math.abs(Math.cos(S.t * 6 + i)) + 0.5, 2.4, 0, 0, TAU);
        c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = '#b07a00'; c.stroke();
      }
      c.globalAlpha = 1;
    }
    if (S.co.bank) {
      for (i = 0; i < 3; i++) {
        var f = (S.t * 0.6 + i / 3) % 1, gx = x + 48 + i * 8, gy = y + 12;
        var q = { x: X(gx, gy), y: Y(gx, gy, 34 + f * 14) };
        c.globalAlpha = 1 - f; sparkle(c, q.x, q.y, 1.2 + 1.8 * (1 - f), '#ffe27a'); c.globalAlpha = 1;
      }
    }
  }
  on('plot', 'bankp', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, 60, 4);
    if (!seen(H, b)) return true;
    var tier = bankTier(S, p);
    sprite(c, 'bankp', 'v2|' + tier + '|' + (S.co.bank ? 1 : 0), b, function (g) { bankStatic(g, p, tier, S.co.bank); });
    bankDyn(c, S, p, tier);
    return true;
  });
  function vcTier(S, p) { return Math.max(Math.min(5, S.rounds || 0), Math.min(5, lvOf(S, p) - 1)); }
  function vcRocket(p) { return { x: p.x * T + 57, y: p.y * T + 14 }; }
  function vcSign(p) { var sx = p.x * T + 24, sy = p.y * T + 44; return { x: X(sx, sy), y: Y(sx, sy, 21) }; }
  function vcStatic(c, p, tier) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.24);
    obox(c, x + 1, y + 1, w - 2, d - 2, 0, 3, '#2d2350', { left: '#1c1535', right: '#251c44' }, 1);
    Iso.facePath(c, x + 25, y + 42, 10, 6, 3.05); c.fillStyle = '#e2403a'; c.fill();
    var rk = vcRocket(p);
    cyl(c, rk.x, rk.y, 7.6, 3, 3, '#8e97ab', '#c9ceda', 0.9);
    var gl = rprism(c, x + 4, y + 9, 44, 35, 11, 3, 29, '#9fb4ff', '#ffffff', 1.1);
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 0; i < gl.front.length; i += 2) { var j = gl.front[i]; c.moveTo(gl.sx[j], gl.sy[j] - 4); c.lineTo(gl.sx[j], gl.sy[j] - 30); }
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.1;
    [12, 21.5].forEach(function (fh) {
      c.beginPath();
      for (var k = 0; k < gl.front.length; k++) { var jj = gl.front[k]; if (k) c.lineTo(gl.sx[jj], gl.sy[jj] - fh); else c.moveTo(gl.sx[jj], gl.sy[jj] - fh); }
      c.stroke();
    });
    onFaceY(c, x + 22, y + 44, 3);
    rrect(c, 0, -9, 12, 9, 1.5); c.fillStyle = '#e7f4ff'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(6, -9); c.lineTo(6, 0); c.stroke();
    c.restore();
    rprism(c, x + 3, y + 8, 46, 37, 12, 32, 2.6, '#ffffff', '#f3f0ff', 1);
    onTop(c, x + 20, y + 22, 34.7); c.beginPath(); c.ellipse(0, 0, 8, 7, 0, 0, TAU); c.fillStyle = '#6fcf6f'; c.fill(); c.restore();
    var bp = { x: X(x + 20, y + 22), y: Y(x + 20, y + 22, 38) };
    blob(c, [bp.x, bp.y, 3.4, bp.x + 3, bp.y + 1.5, 2.6], '#3fae5b', 0.7);
    var sp = vcSign(p);
    c.save(); c.shadowColor = '#ff5fa2'; c.shadowBlur = 6;
    rrect(c, sp.x - 13, sp.y - 7.5, 26, 15, 5); c.fillStyle = '#2d2350'; c.fill();
    c.restore();
    rrect(c, sp.x - 13, sp.y - 7.5, 26, 15, 5); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke();
    rrect(c, sp.x - 11.5, sp.y - 6, 23, 12, 4); c.lineWidth = 0.8; c.strokeStyle = '#ff5fa2'; c.stroke();
    pop(c, 'VC', sp.x - 2.6, sp.y + 0.5, 9.5, '#ffffff', '#ff5fa2', 1.6);
    c.save(); c.translate(sp.x + 8.2, sp.y + 0.2);
    rrect(c, -1.5, -4.6, 3, 6.6, 1.5); c.fillStyle = '#ffffff'; c.fill();
    c.fillStyle = '#ff4d5e'; c.beginPath(); c.moveTo(-1.5, 0.4); c.lineTo(-2.9, 2.6); c.lineTo(2.9, 2.6); c.lineTo(1.5, 0.4); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(-1, 2.6); c.lineTo(0, 4.8); c.lineTo(1, 2.6); c.fill();
    c.restore();
    for (i = 0; i < 5; i++) {
      var stx = x + 8 + i * 7, sty = y + 46, st = { x: X(stx, sty), y: Y(stx, sty, 5.5) };
      starPath(c, st.x, st.y, 2.7); c.fillStyle = i < tier ? '#ffd23f' : 'rgba(255,255,255,0.25)'; c.fill();
      if (i < tier) { c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke(); }
    }
  }
  function booster(c, rx, ry, base, hi) {
    cyl(c, rx, ry, 2.7, base, hi, '#f3f3f8', '#ffffff', 0.9);
    cyl(c, rx, ry, 2.8, base + hi * 0.35, 1.8, '#ff4d5e');
    var tp = { x: X(rx, ry), y: Y(rx, ry, base + hi) }, r = 2.7 * KX;
    c.beginPath(); c.moveTo(tp.x - r, tp.y); c.ellipse(tp.x, tp.y, r, 2.7 * KY, 0, PI, 0, true);
    c.lineTo(tp.x, tp.y - 7); c.closePath(); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
  }
  function flame(c, x, y, w, len) {
    c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y + len * 1.4, x + w, y); c.closePath();
    c.fillStyle = '#ff9f1c'; c.fill();
    c.beginPath(); c.moveTo(x - w * 0.55, y); c.quadraticCurveTo(x, y + len * 0.9, x + w * 0.55, y); c.closePath();
    c.fillStyle = '#fff6b0'; c.fill();
  }
  function drawRocket(c, S, rx, ry, tier) {
    var st = Math.min(3, tier), body = 22 + st * 10, flying = tier >= 5, i;
    var hk = (S.t % 3.6) / 3.6, hop = flying && hk < 0.4 ? Math.sin(hk / 0.4 * PI) * 5 : 0;
    var shake = flying && hop === 0 ? Math.sin(S.t * 40) * 0.35 : 0;
    var base = 6 + hop;
    var bx = X(rx, ry) + shake, by = Y(rx, ry, base);
    if (flying) {
      for (i = 0; i < 6; i++) {
        var f = (S.t * 0.7 + i / 6) % 1, px = X(rx, ry) + 3 + f * 30, py = Y(rx, ry, 4) - f * 7 + Math.sin(i * 2.3) * 2;
        c.globalAlpha = 0.75 * (1 - f); c.beginPath(); c.arc(px, py, 2.6 + f * 5.5, 0, TAU);
        c.fillStyle = i % 2 ? '#ffffff' : '#e9e4f5'; c.fill();
      }
      c.globalAlpha = 1;
      flame(c, bx, by, 4.2, 14 + 5 * Math.abs(Math.sin(S.t * 17)) + hop * 0.8);
    } else if (tier >= 3) flame(c, bx, by, 3.6, 3 + 1.5 * Math.abs(Math.sin(S.t * 13)));
    if (tier >= 4) {
      if (flying) { flame(c, bx - 7.4, by - 1, 2.2, 8 + 3 * Math.abs(Math.sin(S.t * 19))); flame(c, bx + 7.4, by - 1, 2.2, 8 + 3 * Math.abs(Math.sin(S.t * 21 + 1))); }
      booster(c, rx - 6, ry + 6, base + 1, 26);
      booster(c, rx + 6, ry - 6, base + 1, 26);
    }
    var fo = tier >= 4 ? 5.2 : 0;
    c.fillStyle = '#ff4d5e'; c.strokeStyle = INK; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(bx - 4.4 - fo, by - 10); c.lineTo(bx - 8.5 - fo, by + 1.5); c.lineTo(bx - 4.4 - fo, by - 1); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(bx + 4.4 + fo, by - 10); c.lineTo(bx + 8.5 + fo, by + 1.5); c.lineTo(bx + 4.4 + fo, by - 1); c.closePath(); c.fill(); c.stroke();
    cyl(c, rx, ry, 5.2, base, body, '#ffffff', '#f3f3f8', 1);
    for (i = 1; i <= st; i++) cyl(c, rx, ry, 5.3, base + body - i * 10 - 1, 2, tier >= 5 ? '#ffd23f' : '#ff4d5e');
    var wp = { x: bx + 0.8, y: Y(rx, ry, base + body - 7) + 2.2 };
    c.beginPath(); c.arc(wp.x, wp.y, 2.4, 0, TAU); c.fillStyle = '#4cc9f0'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(wp.x + 0.8, wp.y - 0.8, 0.8, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
    var tp = { x: bx, y: Y(rx, ry, base + body) }, rrx = 5.2 * KX, rry = 5.2 * KY;
    c.beginPath(); c.moveTo(tp.x - rrx, tp.y); c.ellipse(tp.x, tp.y, rrx, rry, 0, PI, 0, true);
    c.lineTo(tp.x + 0.4, tp.y - 13); c.lineTo(tp.x - 0.4, tp.y - 13); c.closePath();
    c.fillStyle = '#ff4d5e'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(tp.x + 1.2, tp.y - 2); c.lineTo(tp.x + 0.3, tp.y - 9.5); c.lineWidth = 0.8; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    if (flying) {
      var k = blink(S.t, 1.5, 1.2);
      if (k > 0) sparkle(c, tp.x + 7, tp.y - 10, 2 + 3 * k, '#fff6b0');
    }
  }
  function vcDyn(c, S, p, tier) {
    var x = p.x * T, y = p.y * T;
    var o = rrOutline(x + 4, y + 9, 44, 35, 11, 4), n = o.length / 2, i;
    c.lineWidth = 1.3; c.lineCap = 'round';
    for (i = 0; i < n - 1; i++) {
      var a = { x: X(o[2 * i], o[2 * i + 1]), y: Y(o[2 * i], o[2 * i + 1], 30) };
      var b = { x: X(o[2 * i + 2], o[2 * i + 3]), y: Y(o[2 * i + 2], o[2 * i + 3], 30) };
      if (a.y + b.y < 2 * Y(x + 26, y + 26, 30)) continue;
      c.strokeStyle = 'hsl(' + Math.round((i * 18 + S.t * 160) % 360) + ',95%,65%)';
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }
    var sp = vcSign(p);
    bulbs(c, sp.x - 14.5, sp.y - 9, 29, 18, 18, S.t, '#fff27a', '#7b5cff', 0.9);
    var rk = vcRocket(p);
    drawRocket(c, S, rk.x, rk.y, tier);
  }
  on('plot', 'vc', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, 130, 6);
    if (!seen(H, b)) return true;
    var tier = vcTier(S, p);
    sprite(c, 'vc', 'v3|' + tier, bbox(x, y, w, d, 60, 4), function (g) { vcStatic(g, p, tier); });
    vcDyn(c, S, p, tier);
    return true;
  });
  function loanLit(S, p) {
    var bal = (S.loans && S.loans[p.id]) || 0, mx = QT.G.loanMax ? QT.G.loanMax(p.id) : 1;
    return bal > 0 ? Math.max(1, Math.min(3, Math.ceil(bal / Math.max(1, mx) * 3))) : 0;
  }
  function tree(c, x, y, base, hi, r, col) {
    cyl(c, x, y, 1.3, base, hi * 0.45, '#8a5a3c', null, 0.6);
    var tp = { x: X(x, y), y: Y(x, y, base + hi * 0.45 + r * 0.8) };
    blob(c, [tp.x, tp.y, r, tp.x - r * 0.6, tp.y + r * 0.35, r * 0.7, tp.x + r * 0.6, tp.y + r * 0.35, r * 0.7], col, 0.9);
    c.beginPath(); c.arc(tp.x - r * 0.3, tp.y - r * 0.35, r * 0.35, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fill();
  }
  var HM = { X0: 8, X1: 66, Y0: 17, Y1: 56, WH: 17, RH: 35 };
  function homeStatic(c, p) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.2);
    obox(c, x + 0.5, y + 0.5, w - 1, d - 1, 0, 2, '#9fdc6a', { left: '#6fa844', right: '#84be52' }, 1);
    for (i = 0; i < 3; i++) { onTop(c, x + 40, y + 57 + i * 2.6 - 4, 2.05); c.beginPath(); c.ellipse(0, 0, 3.4, 1.4, 0, 0, TAU); c.fillStyle = '#efe6d2'; c.fill(); c.restore(); }
    for (i = 0; i < 9; i++) {
      var fq = { x: X(x + 70 + (i % 3) * 2.6, y + 20 + Math.floor(i / 3) * 5), y: Y(x + 70 + (i % 3) * 2.6, y + 20 + Math.floor(i / 3) * 5, 3.2) };
      c.beginPath(); c.arc(fq.x, fq.y, 1.4, 0, TAU); c.fillStyle = RAINBOW[(i * 3) % 7]; c.fill();
    }
    obox(c, x + 2.5, y + 58.5, 5, 4, 2, 2.4, '#d8d2c2', { left: '#a9a292', right: '#c0b9a8' }, 0.7);
    var X0 = x + HM.X0, X1 = x + HM.X1, Y0 = y + HM.Y0, Y1 = y + HM.Y1, WH = HM.WH;
    obox(c, X0, Y0, X1 - X0, Y1 - Y0, 2, WH, '#fff0d6', { left: '#ffe2b3', right: '#ffd79a' }, 1);
    var ym = (Y0 + Y1) / 2, RH = HM.RH;
    fillPoly(c, [X1, Y0, 2 + WH, X1, ym, RH, X1, Y1, 2 + WH], '#ffd79a');
    onFaceX(c, X1, Y1, 2);
    c.fillStyle = '#f2b66a'; c.fillRect(0, -4, Y1 - Y0, 4);
    c.strokeStyle = 'rgba(150,90,40,0.35)'; c.lineWidth = 0.5; c.beginPath();
    for (i = 3; i < Y1 - Y0; i += 3) { c.moveTo(i, -4); c.lineTo(i, 0); }
    c.stroke();
    rrect(c, 20, -15, 14, 9.5, 2); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    rrect(c, 21.3, -13.7, 11.4, 6.9, 1.2); c.fillStyle = '#ffe98a'; c.fill();
    c.fillStyle = '#ffffff'; c.fillRect(26.6, -13.7, 0.8, 6.9);
    c.fillStyle = '#ff9fc8'; c.fillRect(21.3, -13.7, 2.6, 6.9); c.fillRect(30.1, -13.7, 2.6, 6.9);
    c.fillStyle = '#b86a3a'; c.fillRect(19.5, -6, 15, 2.4);
    for (i = 0; i < 6; i++) {
      c.beginPath(); c.arc(20.6 + i * 2.6, -6.4, 1.4, 0, TAU);
      c.fillStyle = ['#ff5fa2', '#ffd23f', '#ff4d5e', '#ffffff', '#ff5fa2', '#ff9f1c'][i]; c.fill();
    }
    c.restore();
    onFaceX(c, X1, ym, 2 + WH + 11);
    heartPath(c, 0, -0.4, 0.95); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    heartPath(c, 0, -0.4, 0.7); c.fillStyle = '#ff7eb6'; c.fill();
    c.restore();
    onFaceY(c, X0, Y1, 2);
    [[6, 13], [42, 13]].forEach(function (wn) {
      rrect(c, wn[0], -14, wn[1], 8.5, 1.5); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
      rrect(c, wn[0] + 1.2, -12.8, wn[1] - 2.4, 6.1, 1); c.fillStyle = '#ffe98a'; c.fill();
      c.fillStyle = '#b86a3a'; c.fillRect(wn[0] - 0.5, -5.5, wn[1] + 1, 2.4);
    });
    rrect(c, 25, -13, 8, 13, 3.5); c.fillStyle = '#e2403a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    c.restore();
    obox(c, x + 12, y + 26, 6, 5, 22, 18, '#c0503a', { left: '#8f3a2a', right: '#a8432f' }, 0.9);
    var e0 = X0 - 3, e1 = X1 + 3, yb = Y0 - 3, yf = Y1 + 3, hb = 2 + WH - 1, TH = 2.4;
    var hf = RH - (RH - hb) * (yf - ym) / (ym - yb);
    fillPoly(c, [e1, yb, hb, e1, ym, RH, e1, yf, hf, e1, yf, hf - TH, e1, ym, RH - TH, e1, yb, hb - TH], '#a8432f');
    fillPoly(c, [e0, ym, RH, e1, ym, RH, e1, yf, hf, e0, yf, hf], '#e8553a');
    c.strokeStyle = 'rgba(120,30,20,0.35)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 1; i < 5; i++) { var yy = ym + (yf - ym) * i / 5, hh = RH - (RH - hf) * i / 5; mv(c, e0, yy, hh); ln(c, e1, yy, hh); }
    for (i = 1; i < 12; i++) { var xx = e0 + (e1 - e0) * i / 12; mv(c, xx, ym, RH); ln(c, xx, yf, hf); }
    c.stroke();
    fillPoly(c, [e0, yf, hf, e1, yf, hf, e1, yf, hf - TH, e0, yf, hf - TH], '#c0503a');
    poly(c, [e0, ym, RH, e1, ym, RH, e1, yb, hb, e1, yb, hb - TH, e1, ym, RH - TH, e1, yf, hf - TH, e0, yf, hf - TH, e0, yf, hf]);
    c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath();
    mv(c, e1 + 0.2, yb + 1, hb - TH + 0.3); ln(c, e1 + 0.2, ym, RH - TH + 0.3); ln(c, e1 + 0.2, yf - 1, hf - TH + 0.3); c.stroke();
    obox(c, e0, ym - 1.2, e1 - e0, 2.4, RH - 0.6, 1.6, '#c0503a', { left: '#8f3a2a', right: '#a8432f' }, 0.8);
    obox(c, x + 12, y + 26, 6, 5, RH - 2, 6, '#c0503a', { left: '#8f3a2a', right: '#a8432f' }, 0.9);
    var dx = x + 68.5, dy = y + 44;
    obox(c, dx, dy, 8, 9, 2, 6, '#ffe2b3', { left: '#f2c98a', right: '#e8b870' }, 0.8);
    onFaceX(c, dx + 8, dy + 7, 2);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -3); c.arc(2.5, -3, 2.5, PI, 0); c.lineTo(5, 0); c.closePath(); c.fillStyle = '#3a2418'; c.fill();
    c.restore();
    fillPoly(c, [dx - 1, dy - 1, 8, dx + 9, dy - 1, 8, dx + 9, dy + 4.5, 12, dx - 1, dy + 4.5, 12], '#e2403a');
    fillPoly(c, [dx + 9, dy - 1, 8, dx + 9, dy + 4.5, 12, dx + 9, dy + 10, 8], '#ffd29a');
    fillPoly(c, [dx - 1, dy + 4.5, 12, dx + 9, dy + 4.5, 12, dx + 9, dy + 10, 8, dx - 1, dy + 10, 8], '#ff5a4a');
    poly(c, [dx - 1, dy + 10, 8, dx + 9, dy + 10, 8, dx + 9, dy - 1, 8, dx + 9, dy + 4.5, 12, dx - 1, dy + 4.5, 12]);
    c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    cyl(c, x + 9, y + 60, 0.8, 2, 6, '#ffffff');
    obox(c, x + 7, y + 58.5, 4.5, 3, 8, 3.2, '#e2403a', { left: '#b53a2b', right: '#c94434' }, 0.7);
    cyl(c, x + 5, y + 60.5, 1, 4.4, HM_POLE - 4.4, '#ffffff', null, 0.7);
    c.beginPath();
    for (i = 0; i < 20; i++) {
      var fx = x + 2 + i * 3.4;
      if (fx > x + 13 && fx < x + 67) continue;
      mv(c, fx, y + 62, 2); ln(c, fx, y + 62, 8);
    }
    mv(c, x + 2, y + 62, 6); ln(c, x + 13, y + 62, 6); mv(c, x + 67, y + 62, 6); ln(c, x + 78, y + 62, 6);
    c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 2.3; c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.stroke();
  }
  var HM_POLE = 66;
  function carp(c, x0, y0, len, r, col, belly, t, ph) {
    var n = 8, i, top = [], bot = [];
    for (i = 0; i <= n; i++) {
      var f = i / n, px = x0 - f * len;
      var wv = Math.sin(t * 5 - f * 4.5 + ph) * (0.4 + f * 2.6);
      var rr = r * (f < 0.2 ? 0.82 + f : 1.02 - (f - 0.2) * 0.55);
      top.push(px, y0 + wv - rr); bot.push(px, y0 + wv + rr);
    }
    var tx = top[2 * n], tyT = top[2 * n + 1], tyB = bot[2 * n + 1], tw = Math.sin(t * 5 - 4.5 + ph) * 2.6;
    c.beginPath(); c.moveTo(top[0], top[1]);
    for (i = 1; i <= n; i++) c.lineTo(top[2 * i], top[2 * i + 1]);
    c.lineTo(tx - 5, tyT - 3 + tw); c.lineTo(tx - 2.2, (tyT + tyB) / 2 + tw * 0.5); c.lineTo(tx - 5, tyB + 3 + tw);
    for (i = n; i >= 0; i--) c.lineTo(bot[2 * i], bot[2 * i + 1]);
    c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(bot[0], bot[1] - r * 0.5);
    for (i = 1; i < n; i++) c.lineTo(bot[2 * i], bot[2 * i + 1] - r * 0.45);
    for (i = n - 1; i >= 0; i--) c.lineTo(bot[2 * i], bot[2 * i + 1]);
    c.closePath(); c.fillStyle = belly; c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.7; c.beginPath();
    for (i = 2; i < n - 1; i += 1) {
      var sx = top[2 * i], sy = (top[2 * i + 1] + bot[2 * i + 1]) / 2 - r * 0.15;
      c.moveTo(sx + 1.4, sy - 1.4); c.quadraticCurveTo(sx - 0.6, sy, sx + 1.4, sy + 1.4);
    }
    c.stroke();
    var ex = x0 - len * 0.1, ey = (top[1] + bot[1]) / 2 - r * 0.15;
    c.beginPath(); c.arc(ex, ey, r * 0.42, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(ex - 0.2, ey, r * 0.2, 0, TAU); c.fillStyle = INK; c.fill();
  }
  function homeDyn(c, S, p, lit) {
    var x = p.x * T, y = p.y * T, i;
    var sp = { x: X(x + 15, y + 28.5), y: Y(x + 15, y + 28.5, 41) };
    for (i = 0; i < 3; i++) {
      var f = (S.t * 0.35 + i / 3) % 1;
      c.globalAlpha = 0.55 * (1 - f);
      c.beginPath(); c.arc(sp.x + Math.sin(S.t + i * 2) * 2 - f * 4, sp.y - f * 16, 1.8 + f * 3, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
    }
    c.globalAlpha = 1;
    var X1 = x + HM.X1, Y0 = y + HM.Y0, Y1 = y + HM.Y1, hs = 2 + HM.WH + 3.2;
    c.strokeStyle = INK; c.lineWidth = 0.6; c.beginPath();
    for (i = 0; i <= 8; i++) {
      var gu = Y1 - 4 - (Y1 - Y0 - 8) * i / 8, gh = hs + 1.6 - Math.sin(i / 8 * PI) * 2.2;
      if (i) ln(c, X1 + 0.6, gu, gh); else mv(c, X1 + 0.6, gu, gh);
    }
    c.stroke();
    for (i = 0; i < 3; i++) {
      var ly = Y1 - 4 - (Y1 - Y0 - 8) * (i + 0.5) / 3, lh = hs - 0.6 - Math.sin((i + 0.5) / 3 * PI) * 2.2;
      var lp = { x: X(X1 + 1.2, ly), y: Y(X1 + 1.2, ly, lh) + Math.sin(S.t * 1.8 + i) * 0.4 };
      var on = i < lit;
      if (on) {
        c.globalAlpha = 0.35 + 0.15 * Math.sin(S.t * 4 + i); c.beginPath(); c.arc(lp.x, lp.y, 6, 0, TAU); c.fillStyle = '#ffd23f'; c.fill(); c.globalAlpha = 1;
      }
      c.beginPath(); c.ellipse(lp.x, lp.y, 2.9, 3.3, 0, 0, TAU); c.fillStyle = on ? '#fff27a' : '#f4ecd8'; c.fill();
      c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
      c.fillStyle = on ? '#ff9f1c' : '#c9bfa6'; c.fillRect(lp.x - 1.6, lp.y - 3.9, 3.2, 1); c.fillRect(lp.x - 1.6, lp.y + 2.9, 3.2, 1);
      if (on) { c.beginPath(); c.arc(lp.x - 0.9, lp.y - 1, 0.9, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); }
    }
    var dg = { x: X(x + 74.5, y + 56.5), y: Y(x + 74.5, y + 56.5, 2) };
    c.save(); c.translate(dg.x, dg.y);
    var wag = Math.sin(S.t * 12) * 0.5;
    c.beginPath(); c.moveTo(3.2, -4.2); c.quadraticCurveTo(5.8, -6 + wag * 3, 4.2, -8.2 + wag * 2);
    c.lineWidth = 2.2; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = 1.1; c.strokeStyle = '#e8a25a'; c.stroke();
    c.beginPath(); c.ellipse(0.8, -3.6, 3.6, 2.5, 0, 0, TAU); c.fillStyle = '#e8a25a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.fillRect(-2, -1.6, 1, 1.6); c.fillRect(2.6, -1.6, 1, 1.6);
    var bob = Math.abs(Math.sin(S.t * 3)) * 0.6;
    c.beginPath(); c.arc(-2.4, -6.6 - bob, 2.7, 0, TAU); c.fillStyle = '#e8a25a'; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-4.4, -8 - bob); c.lineTo(-4, -10.6 - bob); c.lineTo(-2.6, -8.9 - bob); c.moveTo(-1.8, -9 - bob); c.lineTo(-0.6, -10.7 - bob); c.lineTo(-0.3, -8.2 - bob);
    c.fillStyle = '#e8a25a'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-3, -5.8 - bob, 1.5, 1, 0, 0, TAU); c.fillStyle = '#fff4e0'; c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(-3.7, -6 - bob, 0.45, 0, TAU); c.arc(-1.6, -7.2 - bob, 0.45, 0, TAU); c.fill();
    c.restore();
    var pt = { x: X(x + 5, y + 60.5), y: Y(x + 5, y + 60.5, HM_POLE) };
    var cols = ['#ff4d5e', '#ffd23f', '#3fd9a8', '#4cc9f0', '#7b5cff'];
    for (i = 0; i < 5; i++) {
      c.beginPath(); c.moveTo(pt.x - 0.8, pt.y + 3.5 + i * 1.3);
      for (var k = 1; k <= 5; k++) c.lineTo(pt.x - 0.8 - k * 3.2, pt.y + 3.5 + i * 1.3 + Math.sin(S.t * 6 - k * 0.9) * (0.3 + k * 0.4) + k * 0.25);
      c.lineWidth = 1.4; c.strokeStyle = cols[i]; c.stroke();
    }
    carp(c, pt.x - 1, pt.y + 14, 25, 3.8, '#34457a', '#8fa6e8', S.t, 0);
    carp(c, pt.x - 1, pt.y + 25, 21, 3.3, '#ff4d5e', '#ffb3b8', S.t, 1.3);
    carp(c, pt.x - 1, pt.y + 34.5, 16, 2.7, '#4cc9f0', '#c6f1ff', S.t, 2.6);
    c.save(); c.translate(pt.x, pt.y - 2); c.rotate(S.t * 4);
    for (i = 0; i < 6; i++) {
      c.rotate(TAU / 6);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(4.2, -1.2); c.lineTo(4.2, 1.2); c.closePath();
      c.fillStyle = cols[i % 5]; c.fill(); c.lineWidth = 0.4; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
    c.beginPath(); c.arc(pt.x, pt.y - 7.5, 1.8, 0, TAU); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
  }
  var KN = { X0: 10, X1: 64, Y0: 18, Y1: 50, WH: 17 };
  function kinStatic(c, p) {
    var x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T, i;
    Iso.shadow(c, x, y, w, d, 0.2);
    obox(c, x + 0.5, y + 0.5, w - 1, d - 1, 0, 2, '#b8d98a', { left: '#86a85c', right: '#9dbf6f' }, 1);
    Iso.facePath(c, x + 22, y + 55, 40, 8, 2.05); c.fillStyle = '#ece7d9'; c.fill();
    c.strokeStyle = 'rgba(150,140,120,0.35)'; c.lineWidth = 0.4; c.beginPath();
    for (i = 0; i < 4; i++) { mv(c, x + 23, y + 56.5 + i * 1.8, 2.1); ln(c, x + 61, y + 56.5 + i * 1.8, 2.1); }
    c.stroke();
    for (i = 0; i < 3; i++) { onTop(c, x + 40, y + 61 - i * 2.8, 2.1); c.beginPath(); c.ellipse(0, 0, 3.2, 1.5, 0, 0, TAU); c.fillStyle = '#b9b3a3'; c.fill(); c.restore(); }
    onTop(c, x + 9, y + 55, 2.1); c.beginPath(); c.ellipse(0, 0, 6.5, 5, 0, 0, TAU); c.fillStyle = '#6fc6f0'; c.fill();
    c.lineWidth = 1.4; c.strokeStyle = '#9a9384'; c.stroke(); c.restore();
    var X0 = x + KN.X0, X1 = x + KN.X1, Y0 = y + KN.Y0, Y1 = y + KN.Y1, WH = KN.WH;
    obox(c, X0, Y0, X1 - X0, Y1 - Y0, 2, WH, '#fbf7ee', { left: '#fbf6ea', right: '#ece3d0' }, 1);
    Iso.leftFacePath(c, X0, Y0, X1 - X0, Y1 - Y0, 6, 2); c.fillStyle = '#6b4630'; c.fill();
    Iso.rightFacePath(c, X0, Y0, X1 - X0, Y1 - Y0, 6, 2); c.fillStyle = '#5a3b28'; c.fill();
    c.strokeStyle = '#5a3b28'; c.lineWidth = 1.1; c.beginPath();
    for (i = 0; i <= 6; i++) { var px = X0 + (X1 - X0) * i / 6; mv(c, px, Y1, 2); ln(c, px, Y1, 2 + WH); }
    for (i = 0; i <= 3; i++) { var py = Y0 + (Y1 - Y0) * i / 3; mv(c, X1, py, 2); ln(c, X1, py, 2 + WH); }
    mv(c, X0, Y1, 2 + WH - 0.6); ln(c, X1, Y1, 2 + WH - 0.6); ln(c, X1, Y0, 2 + WH - 0.6);
    c.stroke();
    onFaceY(c, X0, Y1, 2);
    [[2.5, 13], [38.5, 13]].forEach(function (wn) {
      c.fillStyle = '#fffbe8'; c.fillRect(wn[0], -15, wn[1], 8.5);
      c.strokeStyle = '#8a6a4a'; c.lineWidth = 0.45; c.beginPath();
      for (var g = 1; g < 4; g++) { c.moveTo(wn[0] + wn[1] * g / 4, -15); c.lineTo(wn[0] + wn[1] * g / 4, -6.5); }
      c.moveTo(wn[0], -10.8); c.lineTo(wn[0] + wn[1], -10.8); c.stroke();
    });
    c.fillStyle = '#3a2418'; c.fillRect(19.5, -14, 15, 14);
    c.fillStyle = '#34457a'; c.fillRect(19.8, -14, 7, 8); c.fillRect(27.2, -14, 7, 8);
    c.beginPath(); c.arc(27, -10.2, 2, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
    c.restore();
    onFaceX(c, X1, Y1, 2);
    c.fillStyle = '#fffbe8'; c.fillRect(8, -15, 16, 8.5);
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 0.45; c.beginPath();
    for (i = 1; i < 4; i++) { c.moveTo(8 + i * 4, -15); c.lineTo(8 + i * 4, -6.5); }
    c.moveTo(8, -10.8); c.lineTo(24, -10.8); c.stroke();
    c.restore();
    obox(c, X0 + 2, Y1, X1 - X0 - 4, 4.5, 2, 3, '#d9aa72', { left: '#8a5a3c', right: '#a5764f' }, 0.8);
    var e0 = X0 - 3, e1 = X1 + 3, yb = Y0 - 3, yf = Y1 + 3, he = 2 + WH + 1.5, RH = 33, TH = 2.4;
    var ym = (Y0 + Y1) / 2, r0 = X0 + 13, r1 = X1 - 13;
    fillPoly(c, [e1, yf, he, e1, yb, he, r1, ym, RH], '#2b3a68');
    fillPoly(c, [e0, yf, he, e1, yf, he, r1, ym, RH, r0, ym, RH], '#3b4d86');
    c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 1; i < 14; i++) { var xx = e0 + (e1 - e0) * i / 14, rx2 = r0 + (r1 - r0) * i / 14; mv(c, xx, yf, he); ln(c, rx2, ym, RH); }
    for (i = 1; i < 5; i++) { var yy2 = yb + (yf - yb) * i / 5; mv(c, e1, yy2, he); ln(c, r1, ym, RH); }
    c.stroke();
    fillPoly(c, [e0, yf, he, e1, yf, he, e1, yf, he - TH, e0, yf, he - TH], '#1f2a4d');
    fillPoly(c, [e1, yb, he, e1, yf, he, e1, yf, he - TH, e1, yb, he - TH], '#1a2442');
    poly(c, [e0, yf, he - TH, e1, yf, he - TH, e1, yb, he - TH, e1, yb, he, r1, ym, RH, r0, ym, RH, e0, yf, he]);
    c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
    obox(c, r0 - 1, ym - 1.4, r1 - r0 + 2, 2.8, RH - 0.8, 2, '#1f2a4d', { left: '#141c36', right: '#1a2442' }, 0.8);
    obox(c, r0 - 2.5, ym - 1.6, 2.4, 3.2, RH - 0.5, 4, '#1f2a4d', null, 0.7);
    obox(c, r1 + 0.1, ym - 1.6, 2.4, 3.2, RH - 0.5, 4, '#1f2a4d', null, 0.7);
    var lx = x + 17, ly = y + 60;
    obox(c, lx - 2, ly - 2, 4, 4, 2, 2, '#b9b3a3', null, 0.6);
    cyl(c, lx, ly, 1, 4, 5, '#b9b3a3');
    obox(c, lx - 2.2, ly - 2.2, 4.4, 4.4, 9, 3, '#d8d2c2', null, 0.6);
    var tp = { x: X(lx, ly), y: Y(lx, ly, 12) };
    c.beginPath(); c.moveTo(tp.x - 4.4, tp.y + 1); c.lineTo(tp.x, tp.y - 3); c.lineTo(tp.x + 4.4, tp.y + 1); c.closePath();
    c.fillStyle = '#b9b3a3'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
    var tx = x + 71, ty = y + 55;
    cyl(c, tx, ty, 1.4, 2, 11, '#6b4630', null, 0.6);
    var mp = { x: X(tx, ty), y: Y(tx, ty, 19) };
    blob(c, [mp.x, mp.y - 2, 5.2, mp.x - 4.4, mp.y + 1.2, 3.8, mp.x + 4.4, mp.y + 1.2, 3.8,
             mp.x - 1.5, mp.y + 3, 3.4, mp.x + 2, mp.y + 3.2, 3.2], '#ff5a3c', 0.9);
    c.fillStyle = '#ff9f1c';
    c.beginPath(); c.arc(mp.x - 1.6, mp.y - 3.2, 2.2, 0, TAU); c.arc(mp.x + 3.2, mp.y + 0.2, 1.6, 0, TAU); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(mp.x - 2.4, mp.y - 4, 0.9, 0, TAU); c.fill();
  }
  function kinDyn(c, S, p, lit) {
    var x = p.x * T, y = p.y * T, i;
    var lg = { x: X(x + 17, y + 60), y: Y(x + 17, y + 60, 10.5) };
    c.fillStyle = 'rgba(255,200,90,' + (0.7 + 0.3 * Math.sin(S.t * 5)) + ')'; c.fillRect(lg.x - 1, lg.y - 1, 2, 2);
    onTop(c, x + 9, y + 55, 2.15);
    var f = (S.t * 0.7) % 1;
    c.globalAlpha = 1 - f; c.beginPath(); c.ellipse(-1, 0.5, 1 + f * 4, 0.8 + f * 3, 0, 0, TAU);
    c.lineWidth = 0.5; c.strokeStyle = '#ffffff'; c.stroke(); c.globalAlpha = 1;
    c.fillStyle = '#ff9f1c'; c.beginPath(); c.ellipse(Math.cos(S.t * 0.8) * 3, Math.sin(S.t * 0.8) * 2.2, 1.4, 0.7, S.t * 0.8 + PI / 2, 0, TAU); c.fill();
    c.restore();
    for (i = 0; i < 3; i++) {
      var lx = x + 22 + i * 16, ly = y + KN.Y1 + 4, lp = { x: X(lx, ly), y: Y(lx, ly, 13.5) };
      var sw = Math.sin(S.t * 1.8 + i) * 0.6;
      c.strokeStyle = INK; c.lineWidth = 0.5; c.beginPath(); c.moveTo(lp.x, lp.y - 6); c.lineTo(lp.x + sw, lp.y - 3.4); c.stroke();
      if (i < lit) {
        c.globalAlpha = 0.35 + 0.15 * Math.sin(S.t * 4 + i); c.beginPath(); c.arc(lp.x + sw, lp.y, 5.5, 0, TAU); c.fillStyle = '#ff9f5c'; c.fill(); c.globalAlpha = 1;
      }
      c.beginPath(); c.ellipse(lp.x + sw, lp.y, 2.5, 3.1, 0, 0, TAU); c.fillStyle = i < lit ? '#ff4d3e' : '#fff1e0'; c.fill();
      c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
      c.fillStyle = '#2a1a1a'; c.fillRect(lp.x + sw - 1.5, lp.y - 3.5, 3, 0.9); c.fillRect(lp.x + sw - 1.5, lp.y + 2.6, 3, 0.9);
      if (i >= lit) { c.fillStyle = 'rgba(226,64,58,0.55)'; c.fillRect(lp.x + sw - 2.4, lp.y - 0.4, 4.8, 0.8); }
    }
  }
  on('plot', 'home', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, 72, 4, 44, 4);
    if (!seen(H, b)) return true;
    sprite(c, 'home', 'v3', bbox(x, y, w, d, 50, 4), function (g) { homeStatic(g, p); });
    homeDyn(c, S, p, loanLit(S, p));
    return true;
  });
  on('plot', 'kin', function (p, S, H) {
    var c = H.ctx, x = p.x * T, y = p.y * T, w = p.w * T, d = p.h * T;
    var b = bbox(x, y, w, d, 44, 4);
    if (!seen(H, b)) return true;
    sprite(c, 'kin', 'v2', b, function (g) { kinStatic(g, p); });
    kinDyn(c, S, p, loanLit(S, p));
    return true;
  });
  var PARK_L = { x0: 0.6 * T, y0: 112.6 * T, x1: 7.7 * T, y1: 132.4 * T };
  var PARK_R = { x0: 35.3 * T, y0: 112.6 * T, x1: 42.6 * T, y1: 132.4 * T };
  var FW = { x: 4.3 * T, y: 118.2 * T, hub: 64, R: 50 };
  function island(c, P, grass) {
    var x = P.x0, y = P.y0, w = P.x1 - P.x0, d = P.y1 - P.y0;
    box(c, x, y, w, d, 0, 3, grass, { left: '#b8a58a', right: '#cbb99c' });
    edge(c, x, y, w, d, 0, 3, 1);
    var mx = x + w / 2 - 9;
    Iso.facePath(c, mx, y + 2, 18, d - 4, 3); c.fillStyle = '#ffe9c2'; c.fill();
    c.fillStyle = '#ffd08a';
    for (var k = 0; k < (d - 4) / 12; k++) { Iso.facePath(c, mx + 2, y + 4 + k * 12, 14, 6, 3.05); c.fill(); }
  }
  function flowerBed(c, x, y, n, seed) {
    for (var i = 0; i < n; i++) {
      var fx = x + (i % 4) * 3.2, fy = y + Math.floor(i / 4) * 3.2, q = { x: X(fx, fy), y: Y(fx, fy, 4) };
      c.beginPath(); c.arc(q.x, q.y, 1.3, 0, TAU); c.fillStyle = RAINBOW[(i + seed) % RAINBOW.length]; c.fill();
    }
  }
  function parkLeftStatic(c) {
    island(c, PARK_L, '#a8e07a');
    onTop(c, FW.x, FW.y, 3.1);
    c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.fillStyle = '#ffb3d1'; c.fill();
    c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    for (var i = 0; i < 12; i++) {
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 34, i / 12 * TAU, (i + 0.5) / 12 * TAU); c.closePath();
      c.fillStyle = '#ffd6e6'; c.fill();
    }
    c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); c.stroke();
    c.restore();
    fwFrame(c, -6);
    tree(c, PARK_L.x0 + 18, PARK_L.y0 + 12, 3, 22, 7, '#4fbf5f');
    tree(c, PARK_L.x0 + 90, PARK_L.y0 + 150, 3, 20, 6.5, '#3fae5b');
    tree(c, PARK_L.x0 + 30, PARK_L.y1 - 20, 3, 24, 7.5, '#6fcf6f');
    flowerBed(c, PARK_L.x0 + 80, PARK_L.y0 + 20, 12, 0);
    flowerBed(c, PARK_L.x0 + 10, PARK_L.y0 + 190, 12, 3);
    var bx = PARK_L.x0 + 78, by = PARK_L.y1 - 58;
    obox(c, bx, by, 18, 14, 3, 14, '#ffffff', { left: '#ffd6e6', right: '#ffe9f1' }, 1);
    onFaceY(c, bx, by + 14, 3);
    rrect(c, 4, -12, 10, 6, 1); c.fillStyle = '#4cc9f0'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    c.save(); c.scale(1.2, 1); pop(c, 'TICKET', 9 / 1.2, -3, 3, '#ff4d5e', null, 0); c.restore();
    c.restore();
    for (i = 0; i < 4; i++) {
      var sx0 = bx - 2 + i * 5.5;
      fillPoly(c, [sx0, by - 2, 22, sx0 + 5.5, by - 2, 22, sx0 + 5.5, by + 17, 17, sx0, by + 17, 17], i % 2 ? '#ffffff' : '#ff4d5e');
    }
    poly(c, [bx - 2, by - 2, 22, bx + 20, by - 2, 22, bx + 20, by + 17, 17, bx - 2, by + 17, 17]); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke();
    var gx = PARK_L.x1 - 6, gy0 = PARK_L.y1 - 40, gy1 = PARK_L.y1 - 10;
    cyl(c, gx, gy0, 2.4, 3, 30, '#ff5fa2', null, 0.9);
    cyl(c, gx, gy1, 2.4, 3, 30, '#ff5fa2', null, 0.9);
    onFaceX(c, gx + 2, gy1 + 2, 44);
    c.beginPath(); c.moveTo(-2, 16); c.quadraticCurveTo(18, -6, 38, 16); c.lineTo(38, 10); c.quadraticCurveTo(18, -12, -2, 10); c.closePath();
    c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    c.save(); c.scale(1.2, 1); pop(c, 'FUN PARK', 18 / 1.2, 5.5, 5.4, '#ff4d5e', '#ffffff', 1.3); c.restore();
    c.restore();
  }
  function fwFrame(c, off) {
    var e = off / Math.SQRT2, hx = FW.x + e, hy = FW.y + e;
    var hub = { x: X(hx, hy), y: Y(hx, hy, FW.hub) };
    var L = 36 / Math.SQRT2;
    var fa = { x: X(hx - L, hy + L), y: Y(hx - L, hy + L, 3) }, fb = { x: X(hx + L, hy - L), y: Y(hx + L, hy - L, 3) };
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 4.2; c.beginPath();
    c.moveTo(fa.x, fa.y); c.lineTo(hub.x, hub.y); c.lineTo(fb.x, fb.y); c.stroke();
    c.strokeStyle = off < 0 ? '#c9d3e0' : '#ffffff'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath();
    c.moveTo(fa.x + (hub.x - fa.x) * 0.35, fa.y + (hub.y - fa.y) * 0.35); c.lineTo(fb.x + (hub.x - fb.x) * 0.35, fb.y + (hub.y - fb.y) * 0.35); c.stroke();
    c.strokeStyle = off < 0 ? '#c9d3e0' : '#ffffff'; c.lineWidth = 1.2; c.stroke();
  }
  var GONDOLA = ['#ff4d5e', '#ff9f1c', '#ffd23f', '#3fd9a8', '#4cc9f0', '#7b5cff', '#ff5fa2', '#ffffff'];
  function ferris(c, S) {
    var hub = { x: X(FW.x, FW.y), y: Y(FW.x, FW.y, FW.hub) }, R = FW.R, rx = R * KX, i, a;
    var rot = S.t * 0.22, N = 12;
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 3.4;
    c.beginPath(); c.ellipse(hub.x, hub.y, rx, R, 0, 0, TAU); c.stroke();
    c.strokeStyle = '#ff5fa2'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.9;
    c.beginPath(); c.ellipse(hub.x, hub.y, rx * 0.72, R * 0.72, 0, 0, TAU);
    for (i = 0; i < N * 2; i++) {
      a = rot + i / (N * 2) * TAU;
      c.moveTo(hub.x, hub.y); c.lineTo(hub.x + Math.cos(a) * rx, hub.y + Math.sin(a) * R);
    }
    c.stroke();
    var ph = Math.floor(S.t * 6);
    for (var pass = 0; pass < 3; pass++) {
      c.beginPath();
      for (i = 0; i < 36; i++) {
        if ((i + ph) % 3 !== pass) continue;
        a = rot + i / 36 * TAU;
        var bx = hub.x + Math.cos(a) * rx, by = hub.y + Math.sin(a) * R;
        c.moveTo(bx + 1.1, by); c.arc(bx, by, 1.1, 0, TAU);
      }
      c.fillStyle = ['#fff27a', '#7df9ff', '#ffb3d9'][pass]; c.fill();
    }
    for (i = 0; i < N; i++) {
      a = rot + i / N * TAU;
      var gx = hub.x + Math.cos(a) * rx, gy = hub.y + Math.sin(a) * R, sw = Math.sin(S.t * 2 + i) * 0.08;
      c.save(); c.translate(gx, gy); c.rotate(sw);
      c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 2.5); c.stroke();
      rrect(c, -4.6, 2.2, 9.2, 8.6, 3); c.fillStyle = GONDOLA[i % GONDOLA.length]; c.fill();
      c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
      rrect(c, -3.2, 4, 6.4, 3.2, 1.2); c.fillStyle = 'rgba(220,245,255,0.95)'; c.fill();
      c.restore();
    }
    fwFrame(c, 6);
    c.save(); c.translate(hub.x, hub.y); c.rotate(-rot * 2);
    starPath(c, 0, 0, 6.5); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
    c.restore();
    var k = blink(S.t, 0.5, 2.2);
    if (k > 0) sparkle(c, hub.x + rx * 0.7, hub.y - R * 0.7, 2 + 4 * k, '#ffffff');
  }
  var BALLOON = ['#ff4d5e', '#ffd23f', '#4cc9f0', '#ff5fa2', '#3fd9a8', '#7b5cff', '#ff9f1c'];
  function balloonCart(c, S, x, y) {
    obox(c, x - 7, y - 4, 14, 8, 5, 7, '#ffffff', { left: '#ff5fa2', right: '#ffb3d1' }, 0.9);
    [[x - 5, y + 4], [x + 5, y + 4]].forEach(function (wv) {
      var q = { x: X(wv[0], wv[1]), y: Y(wv[0], wv[1], 3.2) };
      c.beginPath(); c.arc(q.x, q.y, 2.4, 0, TAU); c.fillStyle = '#4a4466'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    });
    var top = { x: X(x, y), y: Y(x, y, 13) };
    for (var i = 0; i < 7; i++) {
      var bx = top.x + (i - 3) * 4.2 + Math.sin(S.t * 1.3 + i) * 1.2, by = top.y - 22 - (i % 2) * 5 - Math.abs(i - 3) * -1.2 + Math.sin(S.t * 1.7 + i * 2) * 1.2;
      c.strokeStyle = 'rgba(60,40,80,0.6)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(top.x, top.y); c.lineTo(bx, by + 4.5); c.stroke();
      c.beginPath(); c.ellipse(bx, by, 3.2, 4, 0, 0, TAU); c.fillStyle = BALLOON[i]; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.ellipse(bx - 1, by - 1.4, 0.8, 1.2, -0.4, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.65)'; c.fill();
    }
  }
  var MG = { x: 38.7 * T, y: 122.4 * T };
  var HORSE = ['#ffffff', '#ffc4de', '#bdf2ff', '#fff3a8', '#e0d2ff', '#c8f7d8'];
  function horse(c, x, y, col, face, gal) {
    c.save(); c.translate(x, y); c.scale(face * 1.3, 1.3);
    c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 0.75; c.lineJoin = 'round'; c.lineCap = 'round';
    var g = gal * 1.2;
    c.beginPath();
    c.moveTo(2.4, 1.2); c.lineTo(3.8 + g, 3.2); c.lineTo(3.2 + g, 4.6);
    c.moveTo(-2.6, 1.2); c.lineTo(-4 - g, 3.4); c.lineTo(-3.6 - g, 4.7);
    c.lineWidth = 2.1; c.stroke(); c.strokeStyle = col; c.lineWidth = 1; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 0.75;
    c.beginPath(); c.moveTo(-4, -0.6); c.quadraticCurveTo(-6.6, -0.4, -6.2, 2.6); c.lineWidth = 1.8; c.strokeStyle = '#ff5fa2'; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 0.75;
    c.beginPath(); c.ellipse(0, 0, 4.4, 2.3, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(2, -1.6); c.lineTo(3.6, -5.2); c.lineTo(5.6, -4.6); c.lineTo(4.4, -0.6); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(5.6, -5, 2.3, 1.3, 0.45, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(3.9, -6); c.lineTo(4.2, -7.6); c.lineTo(5, -6.3); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(3.4, -6.2); c.quadraticCurveTo(1.8, -4.6, 1.6, -1.8); c.lineWidth = 1.6; c.strokeStyle = '#ff5fa2'; c.stroke();
    c.fillStyle = '#ff4d5e'; c.beginPath(); c.ellipse(-0.4, -2, 1.9, 0.9, 0, 0, TAU); c.fill();
    c.fillStyle = '#ffd23f'; c.fillRect(-0.7, -1.3, 0.9, 2.4);
    c.fillStyle = INK; c.beginPath(); c.arc(5.9, -5.4, 0.45, 0, TAU); c.fill();
    c.restore();
  }
  function carousel(c, S) {
    var cx = MG.x, cy = MG.y, rot = S.t * 0.7, i, a;
    cyl(c, cx, cy, 30, 3, 4, '#ff5fa2', '#ffe9f1', 1);
    onTop(c, cx, cy, 7.1);
    for (i = 0; i < 12; i++) {
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 28, rot + i / 12 * TAU, rot + (i + 0.5) / 12 * TAU); c.closePath();
      c.fillStyle = '#ffd6e6'; c.fill();
    }
    c.restore();
    var hs = [];
    for (i = 0; i < 6; i++) {
      a = rot + i / 6 * TAU;
      hs.push({ a: a, i: i, dep: Math.cos(a) + Math.sin(a) });
    }
    hs.sort(function (p1, p2) { return p1.dep - p2.dep; });
    function drawHorse(hh) {
      var hx = cx + Math.cos(hh.a) * 21, hy = cy + Math.sin(hh.a) * 21;
      var bob = 14 + 3.5 * Math.sin(S.t * 3 + hh.i * 1.3);
      var pole0 = { x: X(hx, hy), y: Y(hx, hy, 7) }, pole1 = { x: X(hx, hy), y: Y(hx, hy, 37) };
      c.strokeStyle = '#ffd23f'; c.lineWidth = 1; c.beginPath(); c.moveTo(pole0.x, pole0.y); c.lineTo(pole1.x, pole1.y); c.stroke();
      var tdx = (-Math.sin(hh.a) - Math.cos(hh.a));
      horse(c, pole0.x, Y(hx, hy, bob), HORSE[hh.i], tdx > 0 ? 1 : -1, Math.sin(S.t * 6 + hh.i));
    }
    for (i = 0; i < 6; i++) if (hs[i].dep < 0) drawHorse(hs[i]);
    cyl(c, cx, cy, 5, 7, 31, '#ffd23f', '#fff3a8', 0.9);
    for (i = 0; i < 6; i++) if (hs[i].dep >= 0) drawHorse(hs[i]);
    var apex = { x: X(cx, cy), y: Y(cx, cy, 54) }, RR = 30, rim = 38;
    var segs = [];
    for (i = 0; i < 16; i++) {
      var a0 = -rot * 0.5 + i / 16 * TAU, a1 = a0 + TAU / 16;
      segs.push({ a0: a0, a1: a1, i: i, dep: Math.cos((a0 + a1) / 2) + Math.sin((a0 + a1) / 2) });
    }
    segs.sort(function (p1, p2) { return p1.dep - p2.dep; });
    for (i = 0; i < 16; i++) {
      var sg = segs[i];
      var p0 = { x: X(cx + Math.cos(sg.a0) * RR, cy + Math.sin(sg.a0) * RR), y: Y(cx + Math.cos(sg.a0) * RR, cy + Math.sin(sg.a0) * RR, rim) };
      var p1 = { x: X(cx + Math.cos(sg.a1) * RR, cy + Math.sin(sg.a1) * RR), y: Y(cx + Math.cos(sg.a1) * RR, cy + Math.sin(sg.a1) * RR, rim) };
      c.beginPath(); c.moveTo(apex.x, apex.y); c.lineTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.closePath();
      c.fillStyle = sg.i % 2 ? '#ffffff' : (sg.i % 4 ? '#ff4d5e' : '#4cc9f0'); c.fill();
      if (sg.dep > -0.2) {
        var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
        c.beginPath(); c.moveTo(p0.x, p0.y); c.quadraticCurveTo(mx, my + 5.5, p1.x, p1.y); c.closePath();
        c.fillStyle = sg.i % 2 ? '#ffd23f' : '#ff5fa2'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
      }
    }
    c.beginPath(); c.ellipse(apex.x, Y(cx, cy, rim), RR * KX, RR * KY, 0, 0, PI);
    c.lineTo(apex.x, apex.y); c.closePath(); c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke();
    var ph = Math.floor(S.t * 8);
    c.beginPath();
    for (i = 0; i < 20; i++) {
      if ((i + ph) % 2) continue;
      a = i / 20 * PI;
      var bx = apex.x + Math.cos(a) * RR * KX, by = Y(cx, cy, rim) + Math.sin(a) * RR * KY;
      c.moveTo(bx + 1, by); c.arc(bx, by, 1, 0, TAU);
    }
    c.fillStyle = '#fff27a'; c.fill();
    c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(apex.x, apex.y); c.lineTo(apex.x, apex.y - 9); c.stroke();
    c.beginPath(); c.moveTo(apex.x, apex.y - 9);
    c.quadraticCurveTo(apex.x + 3, apex.y - 9 + Math.sin(S.t * 6), apex.x + 6, apex.y - 8); c.lineTo(apex.x, apex.y - 5.5); c.closePath();
    c.fillStyle = '#ffd23f'; c.fill(); c.stroke();
  }
  var SW = { x: 39.6 * T, y: 115.4 * T };
  function swingRide(c, S) {
    var cx = SW.x, cy = SW.y, rot = S.t * 1.5, i;
    cyl(c, cx, cy, 11, 3, 4, '#7b5cff', '#b9a8ff', 0.9);
    var chairs = [];
    for (i = 0; i < 8; i++) { var a = rot + i / 8 * TAU; chairs.push({ a: a, i: i, dep: Math.cos(a) + Math.sin(a) }); }
    chairs.sort(function (p1, p2) { return p1.dep - p2.dep; });
    function chair(ch) {
      var r0 = 13, r1 = 26, top = 52;
      var t0 = { x: X(cx + Math.cos(ch.a) * r0, cy + Math.sin(ch.a) * r0), y: Y(cx + Math.cos(ch.a) * r0, cy + Math.sin(ch.a) * r0, top) };
      var q = { x: X(cx + Math.cos(ch.a) * r1, cy + Math.sin(ch.a) * r1), y: Y(cx + Math.cos(ch.a) * r1, cy + Math.sin(ch.a) * r1, 30) };
      c.strokeStyle = 'rgba(60,40,80,0.7)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(q.x, q.y); c.stroke();
      rrect(c, q.x - 2.4, q.y, 4.8, 2.6, 1); c.fillStyle = RAINBOW[ch.i % RAINBOW.length]; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(q.x, q.y - 1.4, 1.5, 0, TAU); c.fillStyle = '#ffd9b8'; c.fill();
    }
    for (i = 0; i < 8; i++) if (chairs[i].dep < 0) chair(chairs[i]);
    cyl(c, cx, cy, 2.6, 7, 48, '#ffffff', null, 0.9);
    for (i = 0; i < 8; i++) if (chairs[i].dep >= 0) chair(chairs[i]);
    var ap = { x: X(cx, cy), y: Y(cx, cy, 62) }, rr = 15, rh = 53;
    c.beginPath(); c.ellipse(ap.x, Y(cx, cy, rh), rr * KX, rr * KY, 0, 0, PI); c.lineTo(ap.x, ap.y); c.closePath();
    c.fillStyle = '#ffd23f'; c.fill();
    for (i = 0; i < 8; i++) {
      var b0 = -rot + i / 8 * TAU, b1 = b0 + TAU / 16;
      if (Math.sin(b0) < -0.2 && Math.sin(b1) < -0.2) continue;
      var q0 = { x: ap.x + Math.cos(b0) * rr * KX, y: Y(cx, cy, rh) + Math.max(0, Math.sin(b0)) * rr * KY };
      var q1 = { x: ap.x + Math.cos(b1) * rr * KX, y: Y(cx, cy, rh) + Math.max(0, Math.sin(b1)) * rr * KY };
      c.beginPath(); c.moveTo(ap.x, ap.y); c.lineTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); c.closePath(); c.fillStyle = '#7b5cff'; c.fill();
    }
    c.beginPath(); c.ellipse(ap.x, Y(cx, cy, rh), rr * KX, rr * KY, 0, 0, PI); c.lineTo(ap.x, ap.y); c.closePath();
    c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
    starPath(c, ap.x, ap.y - 3, 3.4); c.fillStyle = '#ff5fa2'; c.fill(); c.lineWidth = 0.8; c.stroke();
  }
  var POST_Y = [113.6, 119.6, 125.6, 131.3];
  var POST_X = [9.45, 33.55];
  function lampPost(c, S, x, y, k) {
    cyl(c, x, y, 2, 3, 2, '#7b5cff', '#9d86ff', 0.7);
    cyl(c, x, y, 0.9, 5, 25, '#ffffff', null, 0.6);
    var q = { x: X(x, y), y: Y(x, y, 33) }, pl = 0.6 + 0.4 * Math.sin(S.t * 3 + k);
    c.globalAlpha = 0.25 * pl; c.beginPath(); c.arc(q.x, q.y, 6, 0, TAU); c.fillStyle = '#fff27a'; c.fill(); c.globalAlpha = 1;
    c.beginPath(); c.arc(q.x, q.y, 3, 0, TAU); c.fillStyle = '#fff6b0'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.fillRect(q.x - 2.2, q.y + 2.4, 4.4, 1.2);
    var fb = Y(x, y, 24), sw = Math.sin(S.t * 2.2 + k) * 0.8;
    c.beginPath(); c.moveTo(q.x + 0.8, fb - 8); c.lineTo(q.x + 6 + sw, fb - 7.4); c.lineTo(q.x + 6 + sw * 1.4, fb + 1.2); c.lineTo(q.x + 3.4 + sw, fb - 0.6); c.lineTo(q.x + 0.8, fb + 0.6); c.closePath();
    c.fillStyle = k % 2 ? '#ff5fa2' : '#4cc9f0'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    starPath(c, q.x + 3.6 + sw * 0.8, fb - 3.8, 1.5); c.fillStyle = '#ffd23f'; c.fill();
  }
  function buntingY(c, S, x, y0, y1, k) {
    var n = 7, h0 = 29, i;
    c.strokeStyle = INK; c.lineWidth = 0.5; c.beginPath();
    for (i = 0; i <= 12; i++) {
      var f = i / 12, yy = y0 + (y1 - y0) * f, hh = h0 - Math.sin(f * PI) * 5;
      if (i) ln(c, x, yy, hh); else mv(c, x, yy, hh);
    }
    c.stroke();
    for (i = 0; i < n; i++) {
      var f0 = (i + 0.25) / n, f1 = (i + 0.75) / n, fm = (i + 0.5) / n;
      var a = { x: X(x, y0 + (y1 - y0) * f0), y: Y(x, y0 + (y1 - y0) * f0, h0 - Math.sin(f0 * PI) * 5) };
      var b = { x: X(x, y0 + (y1 - y0) * f1), y: Y(x, y0 + (y1 - y0) * f1, h0 - Math.sin(f1 * PI) * 5) };
      var m = { x: X(x, y0 + (y1 - y0) * fm) + Math.sin(S.t * 3 + i + k) * 0.7, y: Y(x, y0 + (y1 - y0) * fm, h0 - Math.sin(fm * PI) * 5) + 5.5 };
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(m.x, m.y); c.closePath();
      c.fillStyle = RAINBOW[(i + k) % RAINBOW.length]; c.fill();
    }
  }
  var CROSS = [[31.7, 117, 1.8], [29.4, 125, 2.4]];
  on('floor', 'town', function (r, S, H) {
    var c = H.ctx, i, j;
    for (j = 0; j < CROSS.length; j++) {
      var x0 = CROSS[j][0] * T, y0 = CROSS[j][1] * T + 2, cw = CROSS[j][2] * T;
      if (!seen(H, bbox(x0, y0, cw, 28, 4, 4))) continue;
      for (i = 0; i < 6; i++) {
        Iso.facePath(c, x0, y0 + i * 5, cw, 3, 3.65);
        c.fillStyle = RAINBOW[i]; c.fill();
      }
    }
  });
  on('backdrop', 'town', function (r, S, H) {
    var c = H.ctx;
    var bl = [X(PARK_L.x0, PARK_L.y1) - 6, Y(PARK_L.x0, PARK_L.y0, 0) - FW.hub - FW.R - 20, X(PARK_L.x1, PARK_L.y0) + 6, Y(PARK_L.x1, PARK_L.y1, 0) + 6];
    if (seen(H, bl)) {
      sprite(c, 'parkL', 'v1', [bl[0], Y(FW.x, FW.y, FW.hub) - 6, bl[2], bl[3]], parkLeftStatic);
      ferris(c, S);
    }
    var br = [X(PARK_R.x0, PARK_R.y1) - 6, Y(PARK_R.x0, PARK_R.y0, 0) - 10, X(PARK_R.x1, PARK_R.y0) + 6, Y(PARK_R.x1, PARK_R.y1, 0) + 6];
    if (seen(H, br)) {
      sprite(c, 'parkR', 'v2', br, function (g) {
        island(g, PARK_R, '#a8e07a');
        tree(g, PARK_R.x1 - 12, PARK_R.y0 + 60, 3, 20, 6.5, '#4fbf5f');
        flowerBed(g, PARK_R.x0 + 10, PARK_R.y1 - 20, 12, 2);
        flowerBed(g, PARK_R.x1 - 30, PARK_R.y0 + 8, 8, 5);
        flowerBed(g, PARK_R.x0 + 14, PARK_R.y1 - 68, 16, 4);
        flowerBed(g, PARK_R.x1 - 24, PARK_R.y1 - 52, 16, 1);
        flowerBed(g, PARK_R.x1 - 30, PARK_R.y1 - 16, 12, 6);
      });
    }
  });
  var SCENE_ITEMS = null;
  function sceneItems() {
    if (SCENE_ITEMS) return SCENE_ITEMS;
    var items = [
      { x: MG.x - 34, y: MG.y - 34, w: 68, h: 68, top: 60, fn: carousel },
      { x: SW.x - 28, y: SW.y - 28, w: 56, h: 56, top: 66, fn: swingRide },
      { x: 35.6 * T, y: 124.7 * T, w: 1.6 * T, h: 1.2 * T, top: 50, fn: function (c2, S2) { balloonCart(c2, S2, 36.4 * T, 125.3 * T); } }
    ];
    POST_X.forEach(function (px, side) {
      POST_Y.forEach(function (py, k) {
        var wx = px * T, wy = py * T;
        items.push({ x: wx - 2, y: wy - 2, w: 4, h: 4, top: 40, fn: function (c2, S2) { lampPost(c2, S2, wx, wy, k + side); } });
        if (k < POST_Y.length - 1 && !(side === 1 && k === 0)) {
          var ny = POST_Y[k + 1] * T;
          items.push({ x: wx - 0.5, y: wy + 2.5, w: 1, h: ny - wy - 5, top: 34,
                       fn: function (c2, S2) { buntingY(c2, S2, wx, wy + 1, ny - 1, k * 2 + side); } });
        }
      });
    });
    items.forEach(function (it) {
      it.b = bbox(it.x, it.y, it.w, it.h, it.top, 20);
      it.e = { x: it.x, y: it.y, w: it.w, h: it.h, draw: null };
    });
    return (SCENE_ITEMS = items);
  }
  var sceneS = null, sceneH = null;
  function drawItem(e) { e.it.fn(sceneH.ctx, sceneS); }
  on('scene', 'town', function (r, S, H, push) {
    var items = sceneItems();
    sceneS = S; sceneH = H;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!seen(H, it.b)) continue;
      var e = it.e; e.x = it.x; e.y = it.y; e.w = it.w; e.h = it.h; e.it = it; e.draw = drawItem;
      push(e);
    }
  });
})(window.QT || (window.QT = {}));
