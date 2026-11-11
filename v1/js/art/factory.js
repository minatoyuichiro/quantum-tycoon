(function (QT) {
  'use strict';
  var on = QT.Art.scope('factory');
  var W = QT.World, TILE = 16;
  var RX = Math.SQRT2 * 0.62, RY = Math.SQRT2 * 0.33;
  var INK = '#2a1a40';
  var H = null, c = null, T = 0;
  QT.L.add({
    factory_heEmpty: ['ヘリウム切れ', 'NO HELIUM'],
    factory_heLow: ['ヘリウム少', 'LOW He']
  });
  function begin(h, S) { H = h; c = h.ctx; T = S.t; }
  var SH = {}, RGBA = {};
  function hexv(col) {
    if (col.length === 4) col = '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
    var n = parseInt(col.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function sh(col, amt) {
    var k = col + '|' + amt;
    if (SH[k]) return SH[k];
    var v = hexv(col);
    var r = Math.max(0, Math.min(255, v[0] + amt)), g = Math.max(0, Math.min(255, v[1] + amt)),
        b = Math.max(0, Math.min(255, v[2] + amt));
    return (SH[k] = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1));
  }
  function mix(a, b, k) {
    var key = a + b + k;
    if (SH[key]) return SH[key];
    var u = hexv(a), v = hexv(b);
    var r = Math.round(u[0] + (v[0] - u[0]) * k), g = Math.round(u[1] + (v[1] - u[1]) * k),
        bl = Math.round(u[2] + (v[2] - u[2]) * k);
    return (SH[key] = '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1));
  }
  function rgba(col, a) {
    var k = col + '|' + a;
    if (RGBA[k]) return RGBA[k];
    var v = hexv(col);
    return (RGBA[k] = 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')');
  }
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function X(x, y) { return (x - y) * 0.62; }
  function Y(x, y, h) { return (x + y) * 0.33 - (h || 0); }
  function P(x, y, h) { return { x: (x - y) * 0.62, y: (x + y) * 0.33 - (h || 0) }; }
  function bx(x, y, w, d, base, hi, top, opt) { H.I.box(c, x, y, w, d, base, hi, top, opt); }
  function visible(x, y, w, d, top) {
    var l = H.toScreen(x, y + d, 0).x, r = H.toScreen(x + w, y, 0).x;
    var b = H.toScreen(x + w, y + d, 0).y, t = H.toScreen(x, y, top).y;
    var m = 30;
    return !(r < -m || l > H.cssW + m || b < -m || t > H.cssH + m);
  }
  function qL(x0, x1, y, h0, h1) { c.beginPath(); qLp(x0, x1, y, h0, h1); }
  function qR(x, y0, y1, h0, h1) { c.beginPath(); qRp(x, y0, y1, h0, h1); }
  function qLp(x0, x1, y, h0, h1) {
    c.moveTo(X(x0, y), Y(x0, y, h0)); c.lineTo(X(x1, y), Y(x1, y, h0));
    c.lineTo(X(x1, y), Y(x1, y, h1)); c.lineTo(X(x0, y), Y(x0, y, h1)); c.closePath();
  }
  function qRp(x, y0, y1, h0, h1) {
    c.moveTo(X(x, y0), Y(x, y0, h0)); c.lineTo(X(x, y1), Y(x, y1, h0));
    c.lineTo(X(x, y1), Y(x, y1, h1)); c.lineTo(X(x, y0), Y(x, y0, h1)); c.closePath();
  }
  function fill(col) { c.fillStyle = col; c.fill(); }
  var GR = {};
  function cylGrad(col) {
    var k = 'c' + col;
    if (GR[k]) return GR[k];
    var g = c.createLinearGradient(-1, 0, 1, 0);
    g.addColorStop(0, sh(col, -75)); g.addColorStop(0.28, sh(col, -28)); g.addColorStop(0.56, sh(col, 22));
    g.addColorStop(0.7, sh(col, 62)); g.addColorStop(0.84, sh(col, 8)); g.addColorStop(1, sh(col, -50));
    return (GR[k] = g);
  }
  function ballGrad(col) {
    var k = 'b' + col;
    if (GR[k]) return GR[k];
    var g = c.createRadialGradient(0.32, -0.42, 0.04, 0, 0, 1.05);
    g.addColorStop(0, mix(col, '#ffffff', 0.85)); g.addColorStop(0.3, sh(col, 30));
    g.addColorStop(0.75, col); g.addColorStop(1, sh(col, -60));
    return (GR[k] = g);
  }
  function fillSpan(g, sx, rx) {
    c.save(); c.translate(sx, 0); c.scale(rx, 1); c.fillStyle = g; c.fill(); c.restore();
  }
  function fillBox(g, sx, sy, rx, ry) {
    c.save(); c.translate(sx, sy); c.scale(rx, ry); c.fillStyle = g; c.fill(); c.restore();
  }
  var CACHE = {}, GLOW = {}, SC_MAX = 6, lastSc = 0;
  function sprite(key, sx, sy, x0, y0, w, h, draw) {
    var m = c.getTransform(), sc = Math.min(SC_MAX, m.a);
    if (Math.abs(sc - lastSc) > 1e-6 && c === H.ctx) { lastSc = sc; GLOW = {}; }
    var hp = key.indexOf('#'), slot = hp < 0 ? key : key.slice(0, hp);
    var ck = key + '@' + sc.toFixed(4);
    var e = CACHE[slot];
    if (!e || e.k !== ck) {
      var cv = (e && e.cv) || document.createElement('canvas');
      cv.width = Math.ceil(w * sc) + 4; cv.height = Math.ceil(h * sc) + 4;
      var g = cv.getContext('2d');
      g.setTransform(sc, 0, 0, sc, -x0 * sc + 2, -y0 * sc + 2);
      var main = c;
      c = g;
      var info = null;
      try { info = draw(); } finally { c = main; }
      e = CACHE[slot] = { cv: cv, k: ck, info: info };
    }
    if (m.b === 0 && m.c === 0 && Math.abs(m.a - sc) < 1e-6) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.imageSmoothingEnabled = false;
      c.drawImage(e.cv, Math.round(m.a * (sx + x0) + m.e) - 2, Math.round(m.d * (sy + y0) + m.f) - 2);
      c.imageSmoothingEnabled = true;
      c.setTransform(m);
    } else {
      c.drawImage(e.cv, sx + x0 - 2 / sc, sy + y0 - 2 / sc, e.cv.width / sc, e.cv.height / sc);
    }
    return e.info;
  }
  function blit(key, bx0, by0, bw, bh, draw) { return sprite(key, 0, 0, bx0, by0, bw, bh, draw); }
  function blitFoot(key, x, y, w, d, top, draw, below) {
    return blit(key, X(x, y + d) - 3, Y(x, y, top), (w + d) * 0.62 + 6, (w + d) * 0.33 + top + 4 + (below || 0), draw);
  }
  function glow(sx, sy, r, col, a) {
    if (DBG.noglow) return;
    r = Math.max(1, Math.round(r));
    var m = c.getTransform(), sc = Math.min(SC_MAX, m.a);
    var k = col + '|' + r, n = Math.max(2, Math.ceil(r * 2 * sc));
    var cv = GLOW[k];
    if (!cv || cv.width !== n) {
      cv = document.createElement('canvas'); cv.width = cv.height = n;
      var g = cv.getContext('2d'), gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      gr.addColorStop(0, rgba(col, 0.95)); gr.addColorStop(0.22, rgba(col, 0.6));
      gr.addColorStop(0.55, rgba(col, 0.18)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.fillRect(0, 0, n, n);
      GLOW[k] = cv;
    }
    var ga = c.globalAlpha;
    c.globalAlpha = ga * (a == null ? 1 : a);
    if (m.b === 0 && m.c === 0 && Math.abs(m.a - sc) < 1e-6) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(cv, Math.round(m.a * sx + m.e - n / 2), Math.round(m.d * sy + m.f - n / 2));
      c.setTransform(m);
    } else {
      c.drawImage(cv, sx - r, sy - r, r * 2, r * 2);
    }
    c.globalAlpha = ga;
  }
  function cyl(cx, cy, r, base, hi, col, top) {
    var sx = X(cx, cy), by = Y(cx, cy, base), ty = by - hi, rx = r * RX, ry = r * RY;
    c.beginPath();
    c.moveTo(sx - rx, ty); c.lineTo(sx - rx, by);
    c.ellipse(sx, by, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(sx + rx, ty); c.closePath();
    fillSpan(cylGrad(col), sx, rx);
    if (top !== false) { c.beginPath(); c.ellipse(sx, ty, rx, ry, 0, 0, 7); fill(top || sh(col, 34)); }
  }
  function cylFlat(cx, cy, r, base, hi, col, top) {
    var sx = X(cx, cy), by = Y(cx, cy, base), ty = by - hi, rx = r * RX, ry = r * RY;
    c.beginPath();
    c.moveTo(sx - rx, ty); c.lineTo(sx - rx, by);
    c.ellipse(sx, by, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(sx + rx, ty); c.closePath();
    fill(col);
    c.beginPath(); c.ellipse(sx, ty, rx, ry, 0, 0, 7); fill(top || sh(col, 34));
  }
  function dome(cx, cy, r, base, col, k) {
    var sx = X(cx, cy), by = Y(cx, cy, base), rx = r * RX, ry = r * RY, rh = r * (k || 0.8);
    c.beginPath();
    c.ellipse(sx, by, rx, ry, 0, 0, Math.PI);
    c.ellipse(sx, by, rx, rh, 0, Math.PI, Math.PI * 2);
    c.closePath();
    fillBox(ballGrad(col), sx, by, rx, rh);
  }
  function ball(sx, sy, r, col) {
    c.beginPath(); c.arc(sx, sy, r, 0, 7);
    fillBox(ballGrad(col), sx, sy, r, r);
  }
  function disc(cx, cy, r, h, col) {
    c.beginPath(); c.ellipse(X(cx, cy), Y(cx, cy, h), r * RX, r * RY, 0, 0, 7); fill(col);
  }
  function line(x0, y0, x1, y1, col, lw) {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1);
    c.strokeStyle = col; c.lineWidth = lw; c.stroke();
  }
  function fatLine(x0, y0, x1, y1, col, lw) {
    c.lineCap = 'round';
    line(x0, y0, x1, y1, INK, lw + 1.8);
    line(x0, y0, x1, y1, col, lw);
  }
  function face(x, y, w, d, lift) { H.I.facePath(c, x, y, w, d, lift); }
  function shadowF(x, y, w, d, a) { H.I.shadow(c, x, y, w, d, a); }
  function rrPath(x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function rrect(x, y, w, h, r, col) { rrPath(x, y, w, h, r); c.fillStyle = col; c.fill(); }
  function pop(s, x, y, size, fillCol, lw) {
    c.font = '900 ' + size + 'px ' + H.FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = lw || Math.max(1.4, size / 3.6); c.strokeStyle = INK; c.strokeText(s, x, y);
    c.fillStyle = fillCol; c.fillText(s, x, y);
  }
  function star(x, y, r, col) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr1 = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
      c.lineTo(x + Math.cos(a) * rr1, y + Math.sin(a) * rr1);
    }
    c.closePath(); c.fillStyle = col; c.fill();
    c.strokeStyle = INK; c.lineWidth = Math.max(0.8, r * 0.28); c.stroke();
  }
  function faceTxt(s, x, y, h, size, col, side, lw) {
    c.save();
    c.translate(X(x, y), Y(x, y, h));
    if (side === 'L') c.transform(0.883, 0.47, 0, 1, 0, 0);
    else c.transform(0.883, -0.47, 0, 1, 0, 0);
    pop(s, 0, 0, size, col, lw);
    c.restore();
  }
  var DBG = QT.Art.factoryDbg = {};
  function bulbs(ax, ay, bx2, by2, n, phase, colOn) {
    if (DBG.nobulbs) return;
    bulbsAt(ax, ay, bx2, by2, n, ((Math.floor(T * 7 + (phase || 0)) % 3) + 3) % 3, colOn);
  }
  function bulbsAt(ax, ay, bx2, by2, n, step, colOn) {
    var i, k, px, py;
    c.beginPath();
    for (i = 0; i < n; i++) {
      if ((i + step) % 3 === 0) continue;
      k = n > 1 ? i / (n - 1) : 0.5; px = ax + (bx2 - ax) * k; py = ay + (by2 - ay) * k;
      c.rect(px - 1, py - 1, 2, 2);
    }
    fill(sh(colOn, -45));
    c.beginPath();
    for (i = 0; i < n; i++) {
      if ((i + step) % 3 !== 0) continue;
      k = n > 1 ? i / (n - 1) : 0.5; px = ax + (bx2 - ax) * k; py = ay + (by2 - ay) * k;
      c.rect(px - 2.6, py - 2.6, 5.2, 5.2);
    }
    fill(rgba(colOn, 0.4));
    c.beginPath();
    for (i = 0; i < n; i++) {
      if ((i + step) % 3 !== 0) continue;
      k = n > 1 ? i / (n - 1) : 0.5; px = ax + (bx2 - ax) * k; py = ay + (by2 - ay) * k;
      c.rect(px - 1.5, py - 1.5, 3, 3);
    }
    fill('#fff6c8');
  }
  function bulbStrip(key, ax, ay, bx2, by2, n, phase, colOn) {
    if (DBG.nobulbs) return;
    var step = ((Math.floor(T * 7 + (phase || 0)) % 3) + 3) % 3, hp = key.indexOf('#');
    var k2 = hp < 0 ? key + ':' + step : key.slice(0, hp) + ':' + step + key.slice(hp);
    sprite('bulb:' + k2, 0, 0, Math.min(ax, bx2) - 3, Math.min(ay, by2) - 3, Math.abs(bx2 - ax) + 6, Math.abs(by2 - ay) + 6,
      function () { bulbsAt(ax, ay, bx2, by2, n, step, colOn); });
  }
  function puffs(sx, sy, n, rise, size, speed, col, a, seed) {
    if (DBG.nopuff) return;
    c.fillStyle = col;
    var ga = c.globalAlpha;
    for (var i = 0; i < n; i++) {
      var k = (T * speed + i / n + (seed || 0)) % 1;
      c.globalAlpha = ga * a * (1 - k) * Math.min(1, k * 5);
      c.beginPath();
      c.arc(sx + Math.sin(i * 2.3 + T * 0.9 + (seed || 0) * 7) * size * 0.5 * k + k * size * 0.6,
            sy - k * rise, size * (0.45 + k * 1.1), 0, 7);
      c.fill();
    }
    c.globalAlpha = ga;
  }
  function sparks(sx, sy, n, len, seed) {
    var f = Math.floor(T * 18);
    c.lineCap = 'round';
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (var i = pass; i < n; i += 2) {
        var r1 = rnd(f * 13 + i * 7 + seed), r2 = rnd(f * 31 + i * 3 + seed);
        var a = -Math.PI * (0.1 + 0.8 * r1), L = len * (0.4 + r2);
        c.moveTo(sx + Math.cos(a) * 1.5, sy + Math.sin(a) * 1.5);
        c.lineTo(sx + Math.cos(a) * L, sy + Math.sin(a) * L * 0.8 + L * 0.25);
      }
      c.strokeStyle = pass ? '#fff3a0' : '#ffb020'; c.lineWidth = 0.9; c.stroke();
    }
    glow(sx, sy, 6, '#ffcf40', 0.9);
  }
  function beacon(x, y, h, mode) {
    var sx = X(x, y), sy = Y(x, y, h);
    var col = mode === 'run' ? '#ffb020' : mode === 'stop' ? '#ff4a5a' : '#3be08f';
    var lit = mode === 'run' ? Math.sin(T * 11) > -0.2 : mode === 'stop' ? Math.sin(T * 7) > 0 : true;
    var cc = lit ? col : sh(col, -90);
    sprite('beacon:' + cc, sx, sy, -3.2, -6.4, 6.4, 7.6, function () {
      c.fillStyle = INK; c.fillRect(-2.6, -1.6, 5.2, 2.2);
      c.beginPath(); c.arc(0, -2, 2.6, Math.PI, 0); c.lineTo(2.6, -1.2); c.lineTo(-2.6, -1.2); c.closePath(); fill(INK);
      c.beginPath(); c.arc(0, -2, 1.9, Math.PI, 0); c.lineTo(1.9, -1.4); c.lineTo(-1.9, -1.4); c.closePath(); fill(cc);
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-1.2, -3.4, 0.9, 0.9);
    });
    if (lit && mode !== 'idle') {
      glow(sx, sy - 2.4, 8, col, 0.8);
      if (mode === 'run') {
        var a = T * 9, bl = 11;
        c.globalAlpha = 0.35; c.fillStyle = col;
        c.beginPath(); c.moveTo(sx, sy - 2.4);
        c.lineTo(sx + Math.cos(a - 0.25) * bl, sy - 2.4 + Math.sin(a - 0.25) * bl * 0.45);
        c.lineTo(sx + Math.cos(a + 0.25) * bl, sy - 2.4 + Math.sin(a + 0.25) * bl * 0.45);
        c.closePath(); c.fill(); c.globalAlpha = 1;
      }
    }
  }
  function plaqueR(fx, y0, y1, h0, h1, n, col) {
    qR(fx, y0 - 0.9, y1 + 0.9, h0 - 0.9, h1 + 0.9); fill(INK);
    qR(fx, y0, y1, h0, h1); fill(col);
    qR(fx, y0, y1, h1 - (h1 - h0) * 0.32, h1); fill('rgba(255,255,255,0.22)');
    faceTxt(String(n), fx, (y0 + y1) / 2, (h0 + h1) / 2 - 0.2, n >= 10 ? 8.4 : 10, '#ffffff', 'R', 2.2);
  }
  function tagSq(sx, sy, n, col) {
    rrect(sx - 5.8, sy - 5.8, 11.6, 11.6, 2.6, INK);
    rrect(sx - 4.7, sy - 4.7, 9.4, 9.4, 2, col);
    rrect(sx - 4.7, sy - 4.7, 9.4, 3.4, 2, 'rgba(255,255,255,0.25)');
    pop(String(n), sx, sy + 0.4, n >= 10 ? 6 : 7.4, '#ffffff', 1.6);
  }
  function marquee(sx, sy, w, h, text, size, bg, fg, bulbCol) {
    rrect(sx - w / 2 - 1.4, sy - h / 2 - 1.4, w + 2.8, h + 2.8, h / 2 + 1.4, INK);
    rrect(sx - w / 2, sy - h / 2, w, h, h / 2, bg);
    rrect(sx - w / 2 + 1, sy - h / 2 + 0.8, w - 2, h * 0.38, h * 0.2, 'rgba(255,255,255,0.28)');
    if (bulbCol) {
      var n = Math.max(3, Math.round(w / 4.2));
      bulbs(sx - w / 2 + h / 2, sy - h / 2 - 0.2, sx + w / 2 - h / 2, sy - h / 2 - 0.2, n, 0, bulbCol);
      bulbs(sx - w / 2 + h / 2, sy + h / 2 + 0.2, sx + w / 2 - h / 2, sy + h / 2 + 0.2, n, 1, bulbCol);
    }
    pop(text, sx, sy + 0.4, size, fg, Math.max(1.3, size / 3.4));
  }
  function barL(x0, x1, y, h0, h1, k, col, blink) {
    qL(x0, x1, y, h0, h1); fill('#2a2548');
    if (k > 0.005) {
      var xm = x0 + (x1 - x0) * k;
      qL(x0, xm, y, h0, h1); fill(blink && Math.sin(T * 9) < 0 ? '#ffffff' : col);
      qL(x0, xm, y, h1 - (h1 - h0) * 0.38, h1); fill('rgba(255,255,255,0.5)');
      if (!blink) {
        c.fillStyle = '#ffffff'; c.fillRect(X(xm, y) - 1, Y(xm, y, h1) - 0.4, 2, h1 - h0 + 0.8);
        glow(X(xm, y), Y(xm, y, (h0 + h1) / 2), 5, col, 0.9);
      }
    }
    c.strokeStyle = 'rgba(42,26,64,0.55)'; c.lineWidth = 0.5;
    c.beginPath();
    for (var i = 1; i < 4; i++) {
      var xt = x0 + (x1 - x0) * i / 4;
      c.moveTo(X(xt, y), Y(xt, y, h0)); c.lineTo(X(xt, y), Y(xt, y, h1));
    }
    c.stroke();
  }
  function awningL(x0, x1, y, h, out, col) {
    var n = Math.max(3, Math.round((x1 - x0) / 5)), sw = (x1 - x0) / n;
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (var i = pass; i < n; i += 2) {
        var a = x0 + i * sw, b = a + sw;
        c.moveTo(X(a, y), Y(a, y, h)); c.lineTo(X(b, y), Y(b, y, h));
        c.lineTo(X(b, y + out), Y(b, y + out, h - 2.2)); c.lineTo(X(a, y + out), Y(a, y + out, h - 2.2));
        c.closePath();
        var mx = a + sw / 2, sx = X(mx, y + out), sy = Y(mx, y + out, h - 2.2);
        c.moveTo(sx + sw * 0.36, sy); c.arc(sx, sy, sw * 0.36, 0, Math.PI);
      }
      fill(pass ? '#ffffff' : col);
    }
  }
  function rpoly(x, y, w, d, r) {
    var pts = [], n = 5;
    var cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + d - r, 0], [x + r, y + d - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    for (var i = 0; i < 4; i++)
      for (var j = 0; j <= n; j++) {
        var a = cs[i][2] + j / n * Math.PI / 2;
        pts.push([cs[i][0] + Math.cos(a) * r, cs[i][1] + Math.sin(a) * r]);
      }
    return pts;
  }
  function polyAt(pts, h) {
    c.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var q = pts[i];
      if (i) c.lineTo(X(q[0], q[1]), Y(q[0], q[1], h)); else c.moveTo(X(q[0], q[1]), Y(q[0], q[1], h));
    }
    c.closePath();
  }
  function rsides(pts, h0, h1, cL, cR, pick) {
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], nx = b[1] - a[1], ny = a[0] - b[0];
      if (nx + ny <= 0.001 || (pick && !pick(a, b))) continue;
      var t = Math.max(0, nx) / (Math.max(0, nx) + Math.max(0, ny) + 1e-9);
      var col = cR ? mix(cL, cR, Math.round(t * 6) / 6) : cL;
      c.beginPath();
      c.moveTo(X(a[0], a[1]), Y(a[0], a[1], h0)); c.lineTo(X(b[0], b[1]), Y(b[0], b[1], h0));
      c.lineTo(X(b[0], b[1]), Y(b[0], b[1], h1)); c.lineTo(X(a[0], a[1]), Y(a[0], a[1], h1)); c.closePath();
      c.fillStyle = col; c.fill();
      c.strokeStyle = col; c.lineWidth = 0.45; c.stroke();
    }
  }
  function rends(pts) {
    var iL = 0, iR = 0;
    for (var i = 1; i < pts.length; i++) {
      var v = pts[i][0] - pts[i][1];
      if (v < pts[iL][0] - pts[iL][1]) iL = i;
      if (v > pts[iR][0] - pts[iR][1]) iR = i;
    }
    return [iL, iR];
  }
  function rband(pts, h0, h1, closed) {
    var e = rends(pts), n = pts.length, i = e[1], idx = [i], k, q;
    while (i !== e[0]) { i = (i + 1) % n; idx.push(i); }
    c.beginPath();
    q = pts[idx[0]];
    c.moveTo(X(q[0], q[1]), Y(q[0], q[1], h1));
    for (k = 0; k < idx.length; k++) { q = pts[idx[k]]; c.lineTo(X(q[0], q[1]), Y(q[0], q[1], h0)); }
    c.lineTo(X(q[0], q[1]), Y(q[0], q[1], h1));
    if (closed) {
      for (k = idx.length - 2; k > 0; k--) { q = pts[idx[k]]; c.lineTo(X(q[0], q[1]), Y(q[0], q[1], h1)); }
      c.closePath();
    }
  }
  function rbox(x, y, w, d, h0, h1, r, cL, cR, cT, ink) {
    var pts = rpoly(x, y, w, d, r);
    rsides(pts, h0, h1, cL, cR);
    polyAt(pts, h1); c.fillStyle = cT; c.fill();
    if (ink) {
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.strokeStyle = ink; c.lineWidth = 0.9; c.stroke();
      rband(pts, h0, h1, false); c.stroke();
    }
    return pts;
  }
  function rstripes(pts, h0, h1, col, pitch) {
    var e = rends(pts), l = pts[e[0]], r = pts[e[1]];
    var sx0 = X(l[0], l[1]) - 2, sx1 = X(r[0], r[1]) + 2, top = Y(pts[0][0], pts[0][1], h1) - 40, bot = top + 120;
    c.save();
    rband(pts, h0, h1, true); c.clip();
    c.fillStyle = col;
    c.beginPath();
    for (var sx = sx0; sx < sx1; sx += pitch * 2) c.rect(sx, top, pitch, bot - top);
    c.fill();
    c.restore();
  }
  function crown(sx, sy, lv) {
    if (lv < 5) return;
    sprite('crown', sx, sy, -7, -9, 14, 10.5, function () {
      c.beginPath();
      c.moveTo(-5.5, 0); c.lineTo(-5.8, -5.2); c.lineTo(-2.8, -2.8); c.lineTo(0, -7.4);
      c.lineTo(2.8, -2.8); c.lineTo(5.8, -5.2); c.lineTo(5.5, 0); c.closePath();
      c.lineJoin = 'round'; c.lineWidth = 1.7; c.strokeStyle = INK; c.stroke(); fill('#ffd23f');
      c.fillStyle = '#ff5aa8'; c.fillRect(-1.1, -3.4, 2.2, 2.2);
      c.fillStyle = '#5fe0ff'; c.fillRect(-4.4, -2, 1.6, 1.6); c.fillRect(2.8, -2, 1.6, 1.6);
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-4.6, -1.1, 9.2, 0.8);
    });
    if (lv >= 6) twinkle(sx, sy - 4, 10, sx * 0.07);
  }
  function twinkle(sx, sy, r, seed) {
    var ga = c.globalAlpha;
    for (var i = 0; i < 3; i++) {
      var k = (T * 0.7 + i / 3 + seed) % 1, s = Math.sin(k * Math.PI);
      if (s < 0.15) continue;
      var a = seed * 3 + i * 2.1;
      c.globalAlpha = ga * s;
      sprite('twk', sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.55 - k * 3, -3.5, -3.5, 7, 7, function () {
        c.beginPath();
        c.moveTo(0, -3.2); c.quadraticCurveTo(0.4, -0.4, 3.2, 0); c.quadraticCurveTo(0.4, 0.4, 0, 3.2);
        c.quadraticCurveTo(-0.4, 0.4, -3.2, 0); c.quadraticCurveTo(-0.4, -0.4, 0, -3.2);
        fill('#fff6c8');
      });
    }
    c.globalAlpha = ga;
  }
  function roofSign(x, y, d, RF, s, col) {
    var fs = s.length > 5 ? 4.2 : 5.2;
    c.font = '900 ' + fs + 'px ' + H.FONT;
    var L = c.measureText(s).width * 1.424 + 8;
    var by = y + d - 4.6, b0 = x + 5.5, b1 = b0 + L, h0 = RF + 0.4, h1 = RF + 7.6;
    bx(b0 + 2, by - 2.4, 1.3, 1.3, RF, 5, '#3b3653'); bx(b1 - 3.3, by - 2.4, 1.3, 1.3, RF, 5, '#3b3653');
    face(b0 - 1, by - 1.2, L + 2, 1.2, h1 + 1); fill(INK);
    qL(b0 - 1, b1 + 1, by, h0 - 0.6, h1 + 1); fill(INK);
    qL(b0, b1, by, h0 + 0.3, h1); fill(sh(col, -60));
    qL(b0, b1, by, h1 - 2.4, h1); fill('rgba(255,255,255,0.13)');
    faceTxt(s, (b0 + b1) / 2, by, (h0 + h1) / 2 + 0.35, fs, '#fff4b8', 'L', 1.4);
    return { b0: b0, b1: b1, by: by, h1: h1 + 1.4 };
  }
  function stageNo(id) { var i = W.PIPELINE.indexOf(id); return i >= 0 ? i + 1 : 0; }
  function roofOf(lv) { return 19 + Math.min(5, Math.max(0, lv - 1)) * 1.2; }
  function geo(p, lv) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    return { x: x, y: y, w: w, d: d, lv: lv, col: p.color, id: p.id, cx: x + w * 0.68, cy: y + d * 0.57, roof: roofOf(lv) };
  }
  function shellStatic(p, g, o, propS) {
    var x = g.x, y = g.y, w = g.w, d = g.d, col = g.col, lv = g.lv, RF = g.roof, BH = RF - 3;
    var X0 = x + 3, Y0 = y + 3, FY = y + d - 3, FX = x + w - 3, i;
    shadowF(x, y, w, d, 0.24);
    rbox(x + 0.5, y + 0.5, w - 1, d - 1, 0, 2.6, 10, '#3b3653', '#524b74', '#6a6490');
    var body = rbox(X0, Y0, w - 6, d - 6, 2.6, BH, 8, mix(col, '#ffffff', 0.45), mix(col, '#ffffff', 0.7), '#ffffff', INK);
    var g0 = BH - 7.4, g1 = BH - 2.6, wx0 = X0 + 11, wx1 = FX - 8;
    function cornerFR(a, b) { return a[0] > FX - 8.1 && a[1] > FY - 8.1 && b[0] > FX - 8.1 && b[1] > FY - 8.1; }
    qL(wx0, wx1, FY, g0, g1); fill('#27305a');
    rsides(body, g0, g1, '#27305a', '#34457a', cornerFR);
    qL(wx0, wx1, FY, g0, g0 + 2.2); fill(rgba(col, 0.45));
    rsides(body, g0, g0 + 2.2, rgba(col, 0.45), null, cornerFR);
    c.beginPath();
    var pane = (wx1 - wx0) / 6;
    for (i = 0; i < 6; i++) if (rnd(p.x * 7 + i) < 0.2 + lv * 0.11) qLp(wx0 + i * pane + 0.6, wx0 + (i + 1) * pane - 0.6, FY, g0 + 2.6, g1 - 0.5);
    fill('#ffe9a0');
    qL(wx0 + 3, wx0 + 6, FY, g0, g1); fill('rgba(255,255,255,0.2)');
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.6;
    c.beginPath();
    for (i = 0; i <= 6; i++) { var mx = wx0 + i * pane; c.moveTo(X(mx, FY), Y(mx, FY, g0)); c.lineTo(X(mx, FY), Y(mx, FY, g1)); }
    for (i = 7; i <= 10; i++) { var q = body[i]; c.moveTo(X(q[0], q[1]), Y(q[0], q[1], g0)); c.lineTo(X(q[0], q[1]), Y(q[0], q[1], g1)); }
    c.stroke();
    qL(x + 13, x + 51, FY, 2.6, 8.5); fill(INK);
    var n = stageNo(p.id);
    if (n) plaqueR(FX, y + 11.8, y + 25, 3.6, BH - 3.9, n, col);
    qR(FX, y + 28, y + 36, 2.6, BH - 4.4); fill('#3b3653');
    qR(FX, y + 28, y + 36, BH - 5.4, BH - 4.4); fill(sh(col, 10));
    qR(FX, y + 11.2, y + 36.8, BH - 3.1, BH - 0.5); fill(INK);
    var ec = lv >= 6 ? '#e8b020' : col;
    var eave = rbox(x + 1.5, y + 1.5, w - 3, d - 3, BH, RF, 9.5, sh(ec, -28), ec, mix(col, '#ffffff', 0.6), INK);
    if (p.out) rstripes(eave, BH, RF, 'rgba(255,255,255,0.85)', 2.6);
    else { rband(eave, BH + 1.3, BH + 1.3, false); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.5; c.stroke(); }
    if (p.out) {
      c.save();
      polyAt(rpoly(x + 2.5, y + 2.5, w - 5, d - 5, 8.5), RF + 0.05); c.clip();
      c.fillStyle = rgba(col, 0.22);
      c.beginPath();
      for (var sI = -2; sI < 12; sI += 2) {
        c.moveTo(X(x + sI * 7, y), Y(x + sI * 7, y, RF)); c.lineTo(X(x + sI * 7 + 7, y), Y(x + sI * 7 + 7, y, RF));
        c.lineTo(X(x + sI * 7 + 7 - 40, y + d), Y(x + sI * 7 + 7 - 40, y + d, RF));
        c.lineTo(X(x + sI * 7 - 40, y + d), Y(x + sI * 7 - 40, y + d, RF));
        c.closePath();
      }
      c.fill();
      c.restore();
    }
    polyAt(rpoly(x + 2.4, y + 2.4, w - 4.8, d - 4.8, 8.6), RF + 0.05);
    c.lineJoin = 'round';
    c.strokeStyle = rgba(mix(col, '#ffffff', 0.3), 0.6); c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.7; c.stroke();
    if (propS) propS(g);
    var sg = o.sign ? roofSign(x, y, d, RF, o.sign, col) : null;
    if (lv >= 4 && sg) {
      var lp = [sg.b0 + 0.5, sg.b1 - 0.5], tops = [];
      for (i = 0; i < 2; i++) {
        var b = P(lp[i], sg.by, sg.h1 - 0.4), tp = { x: b.x, y: b.y - 7 };
        fatLine(b.x, b.y, tp.x, tp.y, '#e9e6f5', 0.9);
        tops.push(tp);
      }
      var PEN = ['#ff5aa8', '#ffd23f', '#5fe0ff', '#8cf08c', '#b28cff'];
      var ax = tops[0].x, ay = tops[0].y + 1, bxx = tops[1].x, byy = tops[1].y + 1, np = 9;
      c.strokeStyle = INK; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo((ax + bxx) / 2, (ay + byy) / 2 + 4, bxx, byy); c.stroke();
      for (i = 0; i < np; i++) {
        var u = (i + 0.5) / np, px = ax + (bxx - ax) * u, py = ay + (byy - ay) * u + 8 * u * (1 - u);
        c.beginPath(); c.moveTo(px - 1.3, py); c.lineTo(px + 1.3, py); c.lineTo(px, py + 3); c.closePath();
        fill(PEN[i % PEN.length]);
      }
      sg.lamps = tops;
    }
    return { sign: sg };
  }
  function stagePlot(o, propS, propD) {
    return function (p, S, h) {
      begin(h, S);
      var st = S.p[p.id], lv = st.level || 1;
      var g = geo(p, lv), x = g.x, y = g.y, w = g.w, d = g.d, col = g.col, RF = g.roof, BH = RF - 3;
      var top = RF + (o.propTop || 30) + 4;
      if (!visible(x, y, w, d, top + 16)) return true;
      var info = blitFoot('st:' + p.id + '#' + lv, x, y, w, d, top, function () { return shellStatic(p, g, o, propS); });
      g.st = st; g.work = !!st.working; g.k = g.work ? clamp01(st.prog) : 0; g.blocked = !!st.out;
      var FY = y + d - 3, FX = x + w - 3, wx0 = x + 14, wx1 = FX - 8;
      if (g.work) {
        qL(wx0, wx1, FY, BH - 7.4, BH - 5.2); fill(rgba(col, 0.6));
        var sp = wx0 + ((T * 22) % (wx1 - wx0 - 4));
        qL(sp, Math.min(wx1, sp + 5), FY, BH - 7.4, BH - 2.6); fill('rgba(255,255,255,0.35)');
      }
      barL(wx0, x + 50, FY, 3.3, 7.8, g.blocked ? 1 : g.k, g.blocked ? '#ff5a6a' : '#ffe94a', g.blocked);
      var q = Math.min(6, st.buf ? st.buf.length : 0);
      for (var pass = 0; pass < 2; pass++) {
        c.beginPath();
        for (var i = 0; i < 6; i++) {
          if ((i < q) !== !pass) continue;
          var ly = y + 11.9 + i * 4.2;
          qRp(FX, ly, ly + 3.3, BH - 2.6, BH - 1);
        }
        fill(pass ? '#5a5478' : '#ffd23f');
      }
      if (!DBG.nobulbs && lv >= 2) {
        var bc = o.bulb || '#ffd23f';
        bulbStrip('ce:' + p.id + '#' + lv, X(x + 11, y + d - 1.5), Y(x + 11, y + d - 1.5, RF - 1.5),
          X(x + w - 11, y + d - 1.5), Y(x + w - 11, y + d - 1.5, RF - 1.5), 11, 0, bc);
        bulbStrip('cr:' + p.id + '#' + lv, X(x + w - 1.5, y + 11), Y(x + w - 1.5, y + 11, RF - 1.5),
          X(x + w - 1.5, y + d - 11), Y(x + w - 1.5, y + d - 11, RF - 1.5), 7, 2, bc);
        var sg = info && info.sign;
        if (sg) bulbStrip('sg:' + p.id + '#' + lv, X(sg.b0, sg.by), Y(sg.b0, sg.by, sg.h1), X(sg.b1, sg.by), Y(sg.b1, sg.by, sg.h1),
          Math.max(4, Math.round((sg.b1 - sg.b0) / 3.4)), 1, '#ffd23f');
        if (sg && sg.lamps) for (var li = 0; li < 2; li++) {
          c.fillStyle = '#fff6c8'; c.fillRect(sg.lamps[li].x - 1.4, sg.lamps[li].y - 2.2, 2.8, 2.8);
          glow(sg.lamps[li].x, sg.lamps[li].y - 1, 5, '#ffd23f', 0.8);
        }
      }
      if (!DBG.noprop) propD(g, S);
      if (lv >= 5) { var cm = P(x + w - 1.2, y + 18.4, RF + 0.3); crown(cm.x, cm.y, lv); }
      beacon(x + 9, y + 9, RF, g.blocked ? 'stop' : g.work ? 'run' : 'idle');
      return true;
    };
  }
  var CIRCUIT = [
    [[0.08, 0.25], [0.3, 0.25], [0.3, 0.7], [0.55, 0.7], [0.55, 0.3], [0.8, 0.3], [0.8, 0.75], [0.93, 0.75]],
    [[0.08, 0.8], [0.2, 0.8], [0.2, 0.5], [0.42, 0.5], [0.42, 0.12], [0.68, 0.12], [0.68, 0.52], [0.93, 0.52]]
  ];
  var QUBITS = [[0.3, 0.25], [0.55, 0.7], [0.8, 0.3], [0.42, 0.5], [0.68, 0.12], [0.8, 0.75]];
  function circuitLen(path) {
    var L = 0;
    for (var i = 1; i < path.length; i++) L += Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]);
    return L;
  }
  function edaScreen(g) {
    var s = P(g.cx + 1, g.cy, g.roof + 3), mw = 34, mh = 22;
    return { x: s.x, y: s.y - 7 - mh / 2 + 1, w: mw, h: mh, base: s };
  }
  function monitor(sx, sy, mw, mh, col, standY) {
    c.fillStyle = '#6a6490'; c.fillRect(sx - 1.2, sy + mh / 2, 2.4, standY - sy - mh / 2);
    rrect(sx - mw / 2 - 1.6, sy - mh / 2 - 1.6, mw + 3.2, mh + 3.2, 3.6, INK);
    rrect(sx - mw / 2 - 0.5, sy - mh / 2 - 0.5, mw + 1, mh + 1, 3, col);
    rrect(sx - mw / 2 + 1, sy - mh / 2 + 1, mw - 2, mh - 2, 1.8, '#0c1a3a');
  }
  function designS(g) {
    var RF = g.roof, cx = g.cx + 1, cy = g.cy, m = edaScreen(g), i;
    if (g.lv >= 5) {
      var b2 = P(cx + 10, cy - 12, RF);
      bx(cx + 8, cy - 14, 5, 4, RF, 2, '#4f4970');
      var s2 = { x: b2.x, y: b2.y - 20 };
      monitor(s2.x, s2.y, 20, 13, '#ff5aa8', b2.y - 2);
      c.strokeStyle = '#ff9ad0'; c.lineWidth = 0.8; c.beginPath();
      for (i = 0; i <= 16; i++) { var u = i / 16, px = s2.x - 8 + u * 16, py = s2.y + Math.sin(u * 14) * 3.2 * Math.exp(-Math.pow((u - 0.5) * 3, 2)); if (i) c.lineTo(px, py); else c.moveTo(px, py); }
      c.stroke();
    }
    bx(cx - 4, cy - 3, 8, 6, RF, 3, '#4f4970');
    monitor(m.x, m.y, m.w, m.h, g.col, m.base.y);
    var x0 = m.x - m.w / 2 + 2.4, y0 = m.y - m.h / 2 + 2.6, ww = m.w - 4.8, hh = m.h - 5.4;
    c.fillStyle = 'rgba(120,200,255,0.22)';
    for (var gx = 0; gx <= 8; gx++) for (var gy = 0; gy <= 5; gy++) c.fillRect(x0 + gx * ww / 8 - 0.3, y0 + gy * hh / 5 - 0.3, 0.6, 0.6);
    c.fillStyle = 'rgba(255,255,255,0.08)';
    c.beginPath(); c.moveTo(m.x - m.w / 2 + 1.2, m.y - m.h / 2 + 1.2); c.lineTo(m.x - 2, m.y - m.h / 2 + 1.2);
    c.lineTo(m.x - m.w / 2 + 8, m.y + m.h / 2 - 1.2); c.lineTo(m.x - m.w / 2 + 1.2, m.y + m.h / 2 - 1.2); c.fill();
    if (g.lv >= 3) {
      var b1 = P(cx - 16, cy + 7, RF);
      bx(cx - 18, cy + 5, 5, 4, RF, 2, '#4f4970');
      var s1 = { x: b1.x, y: b1.y - 15 };
      monitor(s1.x, s1.y, 19, 13, '#ffd23f', b1.y - 2);
      var BARC = ['#5fe0ff', '#8cf08c', '#ffd23f', '#ff6fae', '#b28cff'];
      for (i = 0; i < 5; i++) {
        var bh = 2 + rnd(i * 3 + 1) * 6.5;
        c.fillStyle = BARC[i]; c.fillRect(s1.x - 7.2 + i * 3, s1.y + 4.6 - bh, 2.1, bh);
      }
    }
    marquee(m.x, m.y - m.h / 2 - 3.8, 18, 6.4, 'EDA', 4.8, '#ffffff', g.col);
  }
  function designD(g) {
    var m = edaScreen(g), x0 = m.x - m.w / 2 + 2.4, y0 = m.y - m.h / 2 + 2.6, w = m.w - 4.8, h = m.h - 5.4;
    var k = g.k, work = g.work;
    c.lineCap = 'butt'; c.lineJoin = 'miter';
    var heads = [];
    c.beginPath();
    for (var pi = 0; pi < CIRCUIT.length; pi++) {
      var path = CIRCUIT[pi], L = circuitLen(path), want = L * (work ? clamp01(k * 1.15 - pi * 0.1) : 1), acc = 0;
      c.moveTo(x0 + path[0][0] * w, y0 + path[0][1] * h);
      var hx = 0, hy = 0;
      for (var i = 1; i < path.length && acc < want; i++) {
        var a = path[i - 1], b = path[i], seg = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
        var f = Math.min(1, (want - acc) / seg);
        hx = x0 + (a[0] + (b[0] - a[0]) * f) * w; hy = y0 + (a[1] + (b[1] - a[1]) * f) * h;
        c.lineTo(hx, hy); acc += seg;
      }
      if (work && want < L) heads.push(hx, hy);
    }
    c.strokeStyle = work ? '#7df0ff' : 'rgba(125,240,255,0.5)'; c.lineWidth = 1.1; c.stroke();
    for (var q = 0; q < QUBITS.length; q++) {
      var lit = !work || k > (q + 1) / (QUBITS.length + 1);
      c.fillStyle = lit ? '#ffd23f' : '#6b5a2a';
      c.fillRect(x0 + QUBITS[q][0] * w - 1.5, y0 + QUBITS[q][1] * h - 1.5, 3, 3);
    }
    for (var j = 0; j < heads.length; j += 2) {
      c.fillStyle = '#ffffff'; c.fillRect(heads[j] - 1.2, heads[j + 1] - 1.2, 2.4, 2.4);
      glow(heads[j], heads[j + 1], 4, '#7df0ff', 0.9);
    }
    if (g.lv >= 5 && work && Math.sin(T * 8) > 0) {
      var b2 = P(g.cx + 11, g.cy - 12, g.roof);
      c.fillStyle = '#ffffff'; c.fillRect(b2.x + 5, b2.y - 17, 1.4, 2.2);
    }
  }
  function layoutLayers(g) { return 1 + Math.floor((g.lv - 1) / 2); }
  var LAYER = ['#1d2146', '#2b2f66', '#3b2f78'];
  var METAL = ['#ff5aa8', '#4fd8ff', '#ffd23f', '#8cf08c', '#b28cff'];
  function layoutS(g) {
    var cx = g.cx, cy = g.cy, n = layoutLayers(g);
    for (var L = 0; L < n; L++) {
      var ins = L * 3, h0 = g.roof + L * 2.6;
      bx(cx - 13 + ins, cy - 10 + ins, 26 - ins * 2, 20 - ins * 2, h0, 2.2, LAYER[L], { left: '#141733', right: '#20245a', top: LAYER[L] });
      for (var i = 0; i < 9; i++) {
        var rx0 = cx - 12 + ins + (i % 3) * (8 - ins * 0.6) + rnd(i + L * 9) * 2, ry0 = cy - 9 + ins + Math.floor(i / 3) * (6 - ins * 0.6) + rnd(i + 9 + L);
        face(rx0, ry0, 3 + rnd(i + 3 + L) * (4 - L), 1.6 + rnd(i + 5) * (3 - L * 0.6), h0 + 2.25); fill(METAL[(i + L * 2) % 5]);
      }
      for (var j = 0; j < 3; j++) { face(cx - 12 + ins, cy - 7 + j * 6, 24 - ins * 2, 0.8, h0 + 2.3); fill('rgba(255,255,255,0.45)'); }
    }
  }
  function layoutD(g) {
    var cx = g.cx, cy = g.cy, ht = g.roof + layoutLayers(g) * 2.6;
    var t = g.work ? T * 1.8 : T * 0.35;
    var lx = cx + Math.sin(t) * 7, ly = cy + Math.cos(t * 1.37) * 5;
    var spot = P(lx, ly, ht);
    glow(spot.x, spot.y, 8, '#ffffff', g.work ? 0.8 : 0.4);
    var L0 = P(lx, ly, ht + 13 + Math.sin(T * 3) * 1.2);
    fatLine(L0.x + 6.5, L0.y + 6.5, L0.x + 13, L0.y + 13, sh(g.col, -10), 3.2);
    c.beginPath(); c.arc(L0.x, L0.y, 9, 0, 7); fill('rgba(200,235,255,0.42)');
    c.lineWidth = 4.4; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 2.8; c.strokeStyle = g.col; c.stroke();
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.3;
    c.beginPath(); c.arc(L0.x, L0.y, 6, 3.5, 4.6); c.stroke();
    if (g.work && g.k > 0.7) {
      var ck = P(cx + 8, cy - 6, ht + 22 + Math.sin(T * 8));
      c.lineJoin = 'round';
      c.beginPath(); c.moveTo(ck.x - 4, ck.y); c.lineTo(ck.x - 1, ck.y + 3); c.lineTo(ck.x + 5, ck.y - 4);
      c.strokeStyle = INK; c.lineWidth = 4; c.stroke();
      c.strokeStyle = '#3be08f'; c.lineWidth = 2.4; c.stroke();
    }
  }
  function reelPos(g) { var s = P(g.cx + 3, g.cy + 1, g.roof + 2.5); return { x: s.x, y: s.y - 14.5, b: s, R: 11.5 }; }
  function reel2Pos(g) { var s = P(g.cx - 21, g.cy + 5, g.roof + 2.5); return { x: s.x, y: s.y - 9, b: s, R: 6.8 }; }
  function maskN(g) { return 3 + Math.floor((g.lv - 1) / 2); }
  function reelBody(r) {
    c.fillStyle = '#6a6490';
    c.beginPath(); c.moveTo(r.b.x - 4.4, r.b.y); c.lineTo(r.b.x, r.y); c.lineTo(r.b.x + 4.4, r.b.y); c.closePath(); c.fill();
    c.beginPath(); c.arc(r.x, r.y, r.R + 1.6, 0, 7); fill(INK);
    ball(r.x, r.y, r.R, '#f5b21c');
  }
  function maskPos(g) { return { x: g.x + 50, y: g.y + 30 }; }
  function tapeoutS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, r = reelPos(g), nm = maskN(g), mp = maskPos(g);
    bx(cx - 10, cy - 6, 20, 12, RF, 2.5, '#4f4970');
    if (g.lv >= 4) reelBody(reel2Pos(g));
    reelBody(r);
    deck(mp.x - 1, mp.y - 1, 10, 9, RF, 1.5, g.col);
    for (var i = 0; i < nm; i++) {
      bx(mp.x + i * 0.3, mp.y, 8, 7, RF + 1.5 + i * 1.6, 1.1, '#cfe9ff', { left: '#8fb8dd', right: '#a9d2f2' });
      face(mp.x + 1.5 + i * 0.3, mp.y + 1.5, 5, 4, RF + 2.62 + i * 1.6); fill('rgba(232,168,0,0.85)');
    }
  }
  function reelSpin(r, rot, k) {
    var R = r.R, tr = R * (0.45 + 0.4 * k);
    c.beginPath(); c.arc(r.x, r.y, tr, 0, 7); fill('#7a4a10');
    c.beginPath(); c.arc(r.x, r.y, tr - 1, 0, 7); fill('#9a6420');
    c.beginPath();
    for (var j = 0; j < 3; j++) {
      var a = rot + j * Math.PI * 2 / 3, hx = r.x + Math.cos(a) * R * 0.3, hy = r.y + Math.sin(a) * R * 0.3;
      c.moveTo(hx + R * 0.16, hy); c.arc(hx, hy, R * 0.16, 0, 6.2832);
    }
    fill('#f5b21c');
    c.fillStyle = INK; c.fillRect(r.x - 1.6, r.y - 1.6, 3.2, 3.2);
    return tr;
  }
  function tapeoutD(g) {
    var r = reelPos(g), rot = g.work ? T * 5 : T * 0.2, mp = maskPos(g), nm = maskN(g);
    var tr = reelSpin(r, rot, 1 - g.k), mt = P(mp.x + 4, mp.y + 3.5, g.roof + 2.7 + nm * 1.6);
    if (g.lv >= 4) {
      var r2 = reel2Pos(g), tr2 = reelSpin(r2, -rot * 1.4, g.k * 0.9);
      line(r2.x, r2.y - tr2, r.x - tr * 0.2, r.y - tr, '#9a6420', 1.1);
    }
    line(r.x + tr * 0.75, r.y + tr * 0.6, mt.x, mt.y, '#9a6420', 1.1);
    if (g.work) { var tp = { x: mt.x, y: mt.y }; glow(tp.x, tp.y, 5, '#ffd23f', 0.5 + 0.5 * Math.sin(T * 8)); }
    if (g.work && g.k > 0.85) {
      for (var st = 0; st < 3; st++) {
        var a2 = T * 3 + st * 2.1;
        star(r.x + Math.cos(a2) * (r.R + 6), r.y + Math.sin(a2) * (r.R + 4), 2.6, '#ffd23f');
      }
    }
  }
  function wafer(cx, cy, r, h) {
    var sx = X(cx, cy), sy = Y(cx, cy, h), rx = r * RX, ry = r * RY;
    c.beginPath(); c.ellipse(sx, sy + 0.8, rx, ry, 0, 0, 7); fill('#6a6490');
    c.beginPath(); c.ellipse(sx, sy, rx, ry, 0, 0, 7);
    fillBox(ballGrad('#b8c6e8'), sx, sy, rx, ry);
    c.save(); c.clip();
    c.strokeStyle = 'rgba(80,60,140,0.35)'; c.lineWidth = 0.45;
    c.beginPath();
    for (var i = -3; i <= 3; i++) {
      var a = P(cx + i * r / 3.5, cy - r, h), b = P(cx + i * r / 3.5, cy + r, h);
      c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
      a = P(cx - r, cy + i * r / 3.5, h); b = P(cx + r, cy + i * r / 3.5, h);
      c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
    }
    c.stroke();
    c.restore();
    c.beginPath(); c.ellipse(sx, sy, rx, ry, 0, 0, 7); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.6; c.stroke();
  }
  function deck(x, y, w, d, h, hi, col) {
    bx(x, y, w, d, h, hi, '#4a4468', { left: '#2f2a48', right: '#3b3560' });
    face(x + 1, y + 1, w - 2, d - 2, h + hi + 0.02); c.strokeStyle = col; c.lineWidth = 0.9; c.stroke();
  }
  function lithoLens(g) { return g.lv >= 5 ? [-4.5, 4.5] : [0]; }
  function lithoS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, L = lithoLens(g);
    deck(cx - 12, cy - 9, 24, 18, RF, 3, g.col);
    wafer(cx, cy, 8, RF + 3.1);
    bx(cx - 11, cy - 8, 3, 3, RF + 3, 17, '#f4f2fa', { left: sh(g.col, -20), right: g.col });
    bx(cx + 8, cy - 8, 3, 3, RF + 3, 17, '#f4f2fa', { left: sh(g.col, -20), right: g.col });
    bx(cx - 11.5, cy - 8.5, 23, 4, RF + 20, 3, g.col);
    if (g.lv >= 3) faceTxt('EUV', cx, cy - 4.5, RF + 21.6, 3.4, '#ffffff', 'L', 1.1);
    for (var i = 0; i < L.length; i++) {
      cyl(cx + L[i], cy - 5, 3.6, RF + 11, 9, '#e9e6f5', '#ffffff');
      var lens = P(cx + L[i], cy - 5, RF + 11);
      c.beginPath(); c.ellipse(lens.x, lens.y, 3.1, 1.7, 0, 0, 7); fill('#b28cff');
    }
    cyl(cx, cy - 5, L.length > 1 ? 7 : 4.8, RF + 20, 1.6, sh(g.col, 20));
  }
  function lithoD(g) {
    if (!g.work) return;
    var cx = g.cx, cy = g.cy, RF = g.roof, L = lithoLens(g);
    c.globalAlpha = 0.35; face(cx - 5.5, cy - 5.5, 11, 11 * g.k, RF + 3.15); fill('#e070ff'); c.globalAlpha = 1;
    for (var i = 0; i < L.length; i++) {
      var lens = P(cx + L[i], cy - 5, RF + 11);
      var ph = (T * 0.9 + i * 0.37) % 1, row = Math.floor(ph * 5), u = (ph * 5) % 1;
      if (row % 2) u = 1 - u;
      var sp = P(cx - 5.5 + u * 11, cy - 5 + row * 2.4, RF + 3.2);
      c.globalAlpha = 0.5; c.fillStyle = '#d88cff';
      c.beginPath(); c.moveTo(lens.x - 2.6, lens.y); c.lineTo(lens.x + 2.6, lens.y); c.lineTo(sp.x + 1, sp.y); c.lineTo(sp.x - 1, sp.y); c.closePath(); c.fill();
      c.globalAlpha = 1;
      glow(sp.x, sp.y, 6, '#e070ff', 1);
      c.fillStyle = '#ffffff'; c.fillRect(sp.x - 1, sp.y - 0.6, 2, 1.2);
    }
  }
  var ETCH_CH = [[-7, -5], [6, -6], [-6, 6], [7, 5]];
  var PLASMA = ['#ff5ac8', '#8c6bff', '#3be0b0', '#ff9a3c'];
  function etchN(g) { return Math.min(4, 1 + g.lv); }
  function etchH(g, i) { return 9 + (i % 2) * 3 + (g.lv >= 5 ? 3 : 0); }
  function etchS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, n = etchN(g);
    deck(cx - 12, cy - 10, 24, 20, RF, 2, g.col);
    cyl(cx, cy, 3, RF + 2, 3, '#8a84a8');
    for (var i = 0; i < n; i++) {
      var qx = cx + ETCH_CH[i][0], qy = cy + ETCH_CH[i][1], hh = etchH(g, i);
      cyl(qx, qy, 4.2, RF + 2, hh, '#e9e6f5', '#ffffff');
      if (g.lv >= 5) { c.beginPath(); c.ellipse(X(qx, qy), Y(qx, qy, RF + 2 + hh * 0.3), 4.2 * RX, 4.2 * RY, 0, 0.1, Math.PI - 0.1); c.strokeStyle = '#e8b020'; c.lineWidth = 1.2; c.stroke(); }
      dome(qx, qy, 4.2, RF + 2 + hh, PLASMA[i], 0.7);
      var vp = P(qx, qy + 4.2, RF + 2 + hh * 0.5);
      c.beginPath(); c.ellipse(vp.x, vp.y, 2.4, 2.2, 0, 0, 7); fill(INK);
      c.beginPath(); c.ellipse(vp.x, vp.y, 1.8, 1.6, 0, 0, 7); fill('#5a4a7a');
    }
  }
  function etchD(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, n = etchN(g);
    var ra = g.work ? T * 2.2 : 0.6;
    var hub = P(cx, cy, RF + 5.5), tip = P(cx + Math.cos(ra) * 6, cy + Math.sin(ra) * 6, RF + 5.5);
    fatLine(hub.x, hub.y, tip.x, tip.y, '#ffffff', 1.4);
    if (!g.work) return;
    for (var i = 0; i < n; i++) {
      var qx = cx + ETCH_CH[i][0], qy = cy + ETCH_CH[i][1], hh = etchH(g, i);
      var vp = P(qx, qy + 4.2, RF + 2 + hh * 0.5), pulse = 0.55 + 0.45 * Math.sin(T * 9 + i * 1.7);
      c.fillStyle = PLASMA[i]; c.fillRect(vp.x - 1.5, vp.y - 1.3, 3, 2.6);
      if (pulse > 0.5) glow(vp.x, vp.y, 6, PLASMA[i], pulse);
    }
  }
  var BEAM = [[-8.5, -2.5], [-2, 0], [4, 2.5], [9, 4.5]];
  function implantS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    deck(cx - 13, cy - 8, 26, 16, RF, 2, g.col);
    if (g.lv >= 3) {
      var rs = P(cx - 1, cy + 0.5, RF + 2.3);
      c.beginPath(); c.ellipse(rs.x, rs.y, 13.5 * RX, 13.5 * RY, 0, 0, 7);
      c.strokeStyle = INK; c.lineWidth = 3.6; c.stroke();
      c.strokeStyle = '#5fe0ff'; c.lineWidth = 2.2; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.6; c.stroke();
    }
    bx(cx - 12, cy - 6, 7, 7, RF + 2, 8, g.col);
    for (var i = 0; i < 3; i++) {
      var p0 = P(cx + BEAM[i][0], cy + BEAM[i][1], RF + 7), p1 = P(cx + BEAM[i + 1][0], cy + BEAM[i + 1][1], RF + 7);
      fatLine(p0.x, p0.y, p1.x, p1.y, '#e9e6f5', 3.2);
    }
    var mags = g.lv >= 5 ? [[-2, 0, 6.5], [4.5, 2.6, 5]] : [[-2, 0, 6.5]];
    for (var m = 0; m < mags.length; m++) {
      var mg = P(cx + mags[m][0], cy + mags[m][1], RF + 7), mr = mags[m][2];
      c.beginPath(); c.arc(mg.x, mg.y, mr, 0, 7); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 3.4; c.strokeStyle = m ? '#ffd23f' : g.col; c.stroke();
      c.beginPath(); c.arc(mg.x, mg.y, mr, 3.6, 4.8); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    }
    var tg = P(cx + 10, cy + 5, RF + 7);
    c.beginPath(); c.ellipse(tg.x, tg.y, 3.2, 5, 0, 0, 7); fill(INK);
    c.beginPath(); c.ellipse(tg.x, tg.y, 2.4, 4.2, 0, 0, 7); fill('#b8c6e8');
  }
  function implantD(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, pts = [], k;
    if (g.lv >= 3) {
      var rs = P(cx - 1, cy + 0.5, RF + 2.3), ra = T * (g.work ? 3 : 0.6);
      for (k = 0; k < 2; k++) {
        var ax = rs.x + Math.cos(ra + k * Math.PI) * 13.5 * RX, ay = rs.y + Math.sin(ra + k * Math.PI) * 13.5 * RY;
        c.fillStyle = '#ffffff'; c.fillRect(ax - 1.1, ay - 1.1, 2.2, 2.2);
        if (g.work) glow(ax, ay, 5, '#5fe0ff', 0.9);
      }
    }
    if (!g.work) return;
    c.beginPath();
    for (k = 0; k < 7; k++) {
      var u = (T * 1.6 + k / 7) % 1, seg = Math.min(2, Math.floor(u * 3)), f = u * 3 - seg;
      var a1 = BEAM[seg], b1 = BEAM[seg + 1];
      var pp = P(cx + a1[0] + (b1[0] - a1[0]) * f, cy + a1[1] + (b1[1] - a1[1]) * f, RF + 7);
      c.rect(pp.x - 1.8, pp.y - 1.8, 3.6, 3.6); pts.push(pp);
    }
    fill('rgba(255,154,60,0.45)');
    c.beginPath();
    for (k = 0; k < pts.length; k++) c.rect(pts[k].x - 0.9, pts[k].y - 0.9, 1.8, 1.8);
    fill('#fff2b0');
    var tg = P(cx + 10, cy + 5, RF + 7);
    glow(tg.x, tg.y, 9, '#ffb050', 0.9);
  }
  function cmpR(g) { return g.lv >= 5 ? 13.5 : 12; }
  function cmpS(g) {
    var cx = g.cx, cy = g.cy + 1, RF = g.roof, R = cmpR(g);
    cyl(cx, cy, R, RF, 4, g.lv >= 5 ? '#e8b020' : '#8a84a8', '#b9c3e6');
    c.beginPath(); c.ellipse(X(cx, cy), Y(cx, cy, RF + 4), R * RX * 0.93, R * RY * 0.93, 0, 0, 7);
    c.strokeStyle = g.col; c.lineWidth = 1.2; c.stroke();
    bx(cx - 12.5, cy - 12.5, 3, 3, RF, 12, g.col);
  }
  function cmpD(g) {
    var cx = g.cx, cy = g.cy + 1, RF = g.roof, R = cmpR(g);
    var sx = X(cx, cy), sy = Y(cx, cy, RF + 4), rx = R * RX, ry = R * RY;
    var rot = g.work ? T * 4 : T * 0.3;
    c.strokeStyle = 'rgba(80,90,140,0.45)'; c.lineWidth = 0.6;
    c.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = rot + i * Math.PI / 3;
      c.moveTo(sx + Math.cos(a) * rx * 0.2, sy + Math.sin(a) * ry * 0.2);
      c.lineTo(sx + Math.cos(a) * rx * 0.88, sy + Math.sin(a) * ry * 0.88);
    }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); c.ellipse(sx + Math.cos(rot * 0.5) * rx * 0.3, sy + Math.sin(rot * 0.5) * ry * 0.3, rx * 0.3, ry * 0.3, 0, 0, 7); c.fill();
    var arm0 = P(cx - 11, cy - 11, RF + 12), nh = g.lv >= 3 ? 2 : 1;
    for (var hI = 0; hI < nh; hI++) {
      var ha = (g.work ? T * 1.3 : 0.8) + hI * Math.PI, hx = cx + Math.cos(ha) * 6, hy = cy + Math.sin(ha) * 6;
      var armH = P(hx, hy, RF + 12);
      fatLine(arm0.x, arm0.y, armH.x, armH.y, '#ffffff', 1.8);
      cylFlat(hx, hy, 3.4, RF + 4, 8, hI ? '#ffd23f' : g.col, sh(hI ? '#ffd23f' : g.col, 40));
      if (g.work) glow(X(hx, hy), Y(hx, hy, RF + 4), 7, '#bfe8ff', 0.6);
    }
    if (g.work) {
      var nz = P(cx + 5, cy - 7, RF + 12);
      fatLine(arm0.x, arm0.y, nz.x, nz.y, '#e9e6f5', 1);
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (var dd = 0; dd < 3; dd++) c.fillRect(nz.x - 0.7, nz.y + ((T * 2 + dd / 3) % 1) * 8 - 0.7, 1.4, 1.4);
    }
  }
  function diceS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    deck(cx - 12, cy - 9, 24, 18, RF, 3, g.col);
    wafer(cx, cy + 1, 8.5, RF + 3.1);
    bx(cx - 13, cy - 10, 4, 4, RF + 3, 15, g.col);
  }
  function saw(bxw, cy, RF, R, rot, col, arm) {
    var base = P(bxw, cy, RF + 3.2), by = base.y - R + 2;
    if (arm) fatLine(arm.x, arm.y, base.x, by, '#e9e6f5', 2.2);
    c.beginPath();
    for (var t = 0; t < 32; t++) {
      var an = rot + t * Math.PI / 16, rr = t % 2 ? R : R + 1.8;
      c.lineTo(base.x + Math.cos(an) * rr, by + Math.sin(an) * rr);
    }
    c.closePath(); fill(INK);
    c.beginPath(); c.arc(base.x, by, R - 0.3, 0, 7); fill('#dfe4f2');
    c.beginPath(); c.arc(base.x, by, R - 0.3, 3.3, 4.6); c.strokeStyle = '#ffffff'; c.lineWidth = 1.4; c.stroke();
    c.beginPath();
    for (var sp = 0; sp < 4; sp++) {
      var a2 = rot + sp * Math.PI / 2, hx = base.x + Math.cos(a2) * R * 0.55, hy = by + Math.sin(a2) * R * 0.55;
      c.moveTo(hx + R * 0.16, hy); c.arc(hx, hy, R * 0.16, 0, 6.2832);
    }
    fill('#8a84a8');
    c.beginPath(); c.arc(base.x, by, R * 0.32, 0, 7); fill(col);
    c.fillStyle = INK; c.fillRect(base.x - 1.1, by - 1.1, 2.2, 2.2);
    return base;
  }
  function diceD(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    var cut = g.work ? g.k : 1;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.6;
    c.beginPath();
    for (var i = -2; i <= 2; i++) {
      var a = P(cx - 7, cy + 1 + i * 2.6, RF + 3.2), b = P(cx - 7 + 14 * cut, cy + 1 + i * 2.6, RF + 3.2);
      c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
    }
    c.stroke();
    var rot = g.work ? T * 14 : T * 0.3;
    if (g.lv >= 5) saw(cx - 3, cy - 6, RF, 7, -rot * 1.2, '#ffd23f', P(cx - 11, cy - 8, RF + 18));
    var bxw = g.work ? cx - 7 + 14 * g.k : cx + 7;
    var base = saw(bxw, cy + 1, RF, g.lv >= 3 ? 11.5 : 10, rot, g.col, P(cx - 11, cy - 8, RF + 18));
    if (g.work) sparks(base.x + 2, base.y - 0.5, 9, 9, 3);
  }
  function bondPads(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, pads = [];
    for (var i = 0; i < 8; i++) {
      var side = i < 4, u = (i % 4) / 3;
      var chip = side ? P(cx - 3 + u * 6, cy + 3, RF + 5) : P(cx + 4, cy - 2.4 + u * 5, RF + 5);
      var lead = side ? P(cx - 6 + u * 12, cy + 6, RF + 3) : P(cx + 8, cy - 5 + u * 10, RF + 3);
      pads.push([chip, lead]);
    }
    return pads;
  }
  function bondS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    deck(cx - 12, cy - 9, 24, 18, RF, 2, g.col);
    bx(cx - 8, cy - 6, 16, 12, RF + 2, 1, '#f5b21c', { top: '#ffd76a' });
    bx(cx - 4, cy - 3, 8, 6, RF + 3, 2, '#2d2a45', { top: '#3d3960' });
    cyl(cx - 10, cy - 7, 2.8, RF + 2, 4, g.col);
    if (g.lv >= 3) cyl(cx + 10, cy - 6, 2.6, RF + 2, 4, '#5fe0ff');
    if (g.lv >= 5) {
      cyl(cx - 9, cy + 6, 2.6, RF + 2, 5, '#e8b020', '#ffe08a');
      c.beginPath(); c.ellipse(X(cx - 9, cy + 6), Y(cx - 9, cy + 6, RF + 7), 1, 0.6, 0, 0, 7); fill(INK);
    }
  }
  function bondArm(base, tgt, bob, col, flip) {
    var sh0 = { x: base.x, y: base.y - 6 }, tip = { x: tgt.x, y: tgt.y - 2 - bob };
    var el = { x: (sh0.x + tip.x) / 2 + (flip ? 3 : -3), y: Math.min(sh0.y, tip.y) - 10 };
    fatLine(sh0.x, sh0.y, el.x, el.y, col, 2.4);
    fatLine(el.x, el.y, tip.x, tip.y, '#ffffff', 1.8);
    c.fillStyle = INK; c.fillRect(el.x - 1.6, el.y - 1.6, 3.2, 3.2); c.fillRect(sh0.x - 1.8, sh0.y - 1.8, 3.6, 3.6);
    return tip;
  }
  function bondD(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof, pads = bondPads(g);
    var n = g.work ? Math.floor(g.k * 8.99) : 8;
    c.lineWidth = 0.7; c.strokeStyle = '#ffe28a';
    c.beginPath();
    for (var j = 0; j < n; j++) {
      var a = pads[j][0], b = pads[j][1];
      c.moveTo(a.x, a.y); c.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 4, b.x, b.y);
    }
    c.stroke();
    var bob = g.work ? Math.abs(Math.sin(T * 12)) * 3 : 5;
    var tgt = pads[Math.min(7, n)][g.work && Math.sin(T * 12) > 0 ? 1 : 0];
    var tip = bondArm(P(cx - 10, cy - 7, RF + 2), tgt, bob, sh(g.col, 30), false);
    if (g.work && bob < 0.8) glow(tip.x, tip.y + 2, 5, '#ffe28a', 1);
    if (g.lv >= 3) {
      var bob2 = g.work ? Math.abs(Math.sin(T * 12 + 1.6)) * 3 : 5;
      var t2 = pads[(Math.min(7, n) + 4) % 8][g.work && Math.sin(T * 12 + 1.6) > 0 ? 1 : 0];
      var tip2 = bondArm(P(cx + 10, cy - 6, RF + 2), t2, bob2, '#5fe0ff', true);
      if (g.work && bob2 < 0.8) glow(tip2.x, tip2.y + 2, 5, '#ffe28a', 1);
    }
  }
  function pkgS(g) {
    deck(g.cx - 12, g.cy - 9, 24, 18, g.roof, 2, g.col);
  }
  var GIFT2 = ['#5fe0ff', '#ffd23f'];
  function pkgD(g) {
    var cx = g.cx, cy = g.cy, col = g.col, lv = g.lv;
    var bounce = g.work ? Math.abs(Math.sin(T * 5)) * 2.2 : 0;
    var an = P(cx, cy, g.roof + 2), h0 = g.roof + 2;
    var extra = lv >= 5 ? 2 : lv >= 3 ? 1 : 0;
    sprite('pkg:' + g.id + '#' + lv, an.x, an.y - bounce, -18, -26 - extra * 9, 36, 36 + extra * 9, function () {
      c.translate(-an.x, -an.y);
      for (var i = 0; i < 5; i++) {
        bx(cx - 8 + i * 3.6, cy + 6, 1.6, 2.4, h0 - 0.5, 2.5, '#f5b21c');
        bx(cx + 9, cy - 6 + i * 2.8, 2.4, 1.4, h0 - 0.5, 2.5, '#f5b21c');
      }
      bx(cx - 9, cy - 7, 18, 13, h0 + 1, 6, '#2d2a45', { top: '#3d3960' });
      face(cx - 1.5, cy - 7, 3, 13, h0 + 7.05); fill(col);
      face(cx - 9, cy - 2, 18, 3, h0 + 7.05); fill(col);
      qL(cx - 1.5, cx + 1.5, cy + 6, h0 + 1, h0 + 7); fill(sh(col, -30));
      qR(cx + 9, cy - 2, cy + 1, h0 + 1, h0 + 7); fill(sh(col, -15));
      var lg = P(cx - 4.5, cy + 3, h0 + 7.05);
      pop('Q', lg.x, lg.y, 4.6, '#ffd23f', 1.2);
      var hb = h0 + 7, bw = 10, bd = 8, ox = cx + 1, oy = cy - 4;
      for (var e = 0; e < extra; e++) {
        var gc = GIFT2[e], hh2 = 5.5 - e;
        bx(ox - bw / 2, oy - bd / 2, bw, bd, hb, hh2, gc, { left: sh(gc, -40), right: sh(gc, -18) });
        face(ox - 0.8, oy - bd / 2, 1.6, bd, hb + hh2 + 0.03); fill('#ff5aa8');
        face(ox - bw / 2, oy - 0.8, bw, 1.6, hb + hh2 + 0.03); fill('#ff5aa8');
        qL(ox - 0.8, ox + 0.8, oy + bd / 2, hb, hb + hh2); fill('#d8408a');
        hb += hh2; bw -= 2.6; bd -= 2; ox += 0.6; oy -= 0.4;
      }
      var kb = P(ox - 0.6, oy + 0.4 + (extra ? 0 : -0.1), hb);
      if (!extra) kb = P(cx, cy - 0.5, h0 + 7);
      for (var s = -1; s <= 1; s += 2) {
        c.beginPath(); c.ellipse(kb.x + s * 4.2, kb.y - 3.2, 4.2, 2.8, s * 0.5, 0, 7); fill(INK);
        c.beginPath(); c.ellipse(kb.x + s * 4.2, kb.y - 3.2, 3.2, 1.9, s * 0.5, 0, 7); fill(extra ? '#ff5aa8' : col);
      }
      c.beginPath(); c.arc(kb.x, kb.y - 2.2, 1.9, 0, 7); fill(sh(extra ? '#ff5aa8' : col, -20));
    });
    if (g.work) {
      var kb2 = P(cx, cy - 0.5, g.roof + 9 + bounce + extra * 5);
      for (var st = 0; st < 3; st++) {
        var a = T * 2.5 + st * 2.1;
        star(kb2.x + Math.cos(a) * 14, kb2.y - 6 + Math.sin(a) * 6, 1.8 + 0.6 * Math.sin(T * 6 + st), '#fff2a0');
      }
    }
  }
  function qaS(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    cyl(cx, cy + 1, 10, RF, 3.5, '#4a4468', '#cfd6ea');
    c.beginPath(); c.ellipse(X(cx, cy + 1), Y(cx, cy + 1, RF + 3.5), 9.3 * RX, 9.3 * RY, 0, 0, 7); c.strokeStyle = g.col; c.lineWidth = 1.1; c.stroke();
    bx(cx - 3.5, cy - 2.5, 7, 7, RF + 3.5, 1.4, '#2d2a45', { top: '#3d3960' });
    if (g.lv >= 3) bx(cx + 2.5, cy - 7.5, 5, 5, RF + 3.5, 1.2, '#2d2a45', { top: '#3d3960' });
    bx(cx - 13, cy - 11, 6, 6, RF, 19, g.col);
    bx(cx - 12, cy - 9, 12, 4, RF + 16, 3, '#ffffff', { left: '#dcd8ea', right: '#f4f2fa' });
    var lp = P(cx - 10, cy - 8, RF + 25);
    c.beginPath(); c.arc(lp.x, lp.y, 6.2, 0, 7); fill(INK);
  }
  function qaD(g) {
    var cx = g.cx, cy = g.cy, RF = g.roof;
    var down = g.work ? (Math.sin(T * 7) > 0 ? 0 : 2.5) : 4;
    bx(cx - 1, cy - 9, 3, 7, RF + 8 + down, 8, '#e9e6f5');
    bx(cx - 6, cy - 5, 12, 11, RF + 6 + down, 2.6, g.col);
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.6;
    c.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = P(cx - 3 + (i % 3) * 3, cy - 1 + Math.floor(i / 3) * 4, RF + 6 + down);
      c.moveTo(a.x, a.y); c.lineTo(a.x, a.y + 1.5 + down);
    }
    c.stroke();
    if (g.work && down === 0) glow(X(cx, cy + 1), Y(cx, cy + 1, RF + 5), 7, '#7df0ff', 0.9);
    var pass = !g.work || g.k > 0.6, col = pass ? '#3be08f' : '#ffb020';
    var lp = P(cx - 10, cy - 8, RF + 25);
    if (!g.work || Math.sin(T * 10) > -0.3) glow(lp.x, lp.y, 12, col, 0.55);
    sprite('qalamp:' + (pass ? 1 : 0), lp.x, lp.y, -6, -6, 12, 12, function () {
      c.beginPath(); c.arc(0, 0, 5.2, 0, 7); fill(col);
      c.beginPath(); c.arc(-1.6, -1.8, 1.8, 0, 7); fill('rgba(255,255,255,0.7)');
      pop(pass ? 'OK' : '...', 0, 0.3, 4.2, '#ffffff', 1.2);
    });
    if (g.lv >= 5 && !DBG.nobulbs) {
      var step = Math.floor(T * 8) % 3;
      sprite('qaring:' + step, lp.x, lp.y, -9.5, -9.5, 19, 19, function () {
        for (var pass2 = 0; pass2 < 2; pass2++) {
          c.beginPath();
          for (var b = 0; b < 12; b++) {
            var lit = (b + step) % 3 === 0;
            if (lit !== !!pass2) continue;
            var ba = b / 12 * Math.PI * 2, br = lit ? 1.3 : 0.8;
            c.rect(Math.cos(ba) * 8 - br, Math.sin(ba) * 8 - br, br * 2, br * 2);
          }
          fill(pass2 ? '#fff6c8' : '#8a6a20');
        }
      });
    }
  }
  function stageGhost(o, propS) {
    return function (p, S, h) {
      begin(h, S);
      var g = geo(p, 1), x = g.x, y = g.y, w = g.w, d = g.d;
      if (!visible(x, y, w, d, 80)) return true;
      face(x + 3, y + 3, w - 6, d - 6, 0.5);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
      c.setLineDash([7, 6]); c.lineDashOffset = -(T * 8) % 13;
      c.strokeStyle = g.col; c.lineWidth = 2; c.stroke();
      c.setLineDash([]);
      var ga = c.globalAlpha;
      c.globalAlpha = ga * 0.3;
      blitFoot('st:' + p.id + '#1', x, y, w, d, g.roof + (o.propTop || 30) + 4, function () { return shellStatic(p, g, o, propS); });
      c.globalAlpha = ga;
      var n = stageNo(p.id), FX = x + w - 3, BH = g.roof - 3;
      if (n) {
        var a0 = P(FX, y + 25, 2), a1 = P(FX, y + 11, BH);
        blit('gplq:' + p.id, a0.x - 2, a1.y - 2, a1.x - a0.x + 4, a0.y - a1.y + 4, function () {
          plaqueR(FX, y + 11.8, y + 25, 3.6, BH - 3.9, n, g.col);
        });
      }
      return true;
    };
  }
  function stage(id, o, propS, propD) {
    on('plot', id, stagePlot(o, propS, propD));
    on('unowned', id, stageGhost(o, propS));
  }
  stage('design',   { propTop: 38 }, designS, designD);
  stage('layout',   { sign: 'LAYOUT', propTop: 34 }, layoutS, layoutD);
  stage('tapeout',  { sign: 'TAPE-OUT', propTop: 32 }, tapeoutS, tapeoutD);
  stage('litho',    { sign: 'LITHO', propTop: 26 }, lithoS, lithoD);
  stage('depoetch', { sign: 'ETCH', propTop: 22 }, etchS, etchD);
  stage('implant',  { sign: 'IMPLANT', propTop: 18 }, implantS, implantD);
  stage('cmp',      { sign: 'CMP', propTop: 16 }, cmpS, cmpD);
  stage('dice',     { sign: 'DICE', propTop: 30 }, diceS, diceD);
  stage('bond',     { sign: 'BOND', propTop: 22 }, bondS, bondD);
  stage('pkg',      { sign: 'PKG', propTop: 30 }, pkgS, pkgD);
  stage('qa',       { sign: 'QA', propTop: 32 }, qaS, qaD);
  function chandelier(cx, cy, base, n, r0, shown, gap) {
    for (var i = 0; i < n; i++) {
      var hh = base + i * gap, r = r0 * (0.55 + 0.45 * i / Math.max(1, n - 1));
      if (i >= shown) { disc(cx, cy, r, hh + 1.2, 'rgba(255,255,255,0.3)'); continue; }
      if (i > 0) {
        var pr = r0 * (0.55 + 0.45 * (i - 1) / Math.max(1, n - 1)) * 0.6;
        c.strokeStyle = '#c8901a'; c.lineWidth = 0.7;
        c.beginPath();
        for (var a = 0; a < 3; a++) {
          var an = 0.6 + a * 1.0;
          var p0 = P(cx + Math.cos(an) * pr, cy + Math.sin(an) * pr, hh - gap + 1.2);
          c.moveTo(p0.x, p0.y); c.lineTo(p0.x, p0.y - gap + 1.2);
        }
        c.stroke();
      }
      cyl(cx, cy, r, hh, 1.2, '#e8b020', '#ffd76a');
    }
  }
  on('plot', 'asm', function (p, S, h) {
    begin(h, S);
    var st = S.p.asm, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var gh = 17 + Math.min(5, lv - 1) * 2.2, R = 15;
    if (!visible(x, y, w, d, gh + 30)) return true;
    var work = !!st.working, k = work ? clamp01(st.prog) : 0;
    var cx = x + 24, cy = y + 26;
    var plates = 4 + Math.floor(lv / 2), gap = Math.min(4.6, (gh - 6) / plates);
    var arms = [[cx - 12, cy + 7, 0], [cx + 9, cy - 10, 2]];
    if (lv >= 3) arms.push([cx + 13, cy + 5, 4]);
    var hb = P(x + w - 7, y + 8, 4.5);
    blitFoot('asm:back#' + lv, x, y, w, d, 30, function () {
      shadowF(x, y, w, d, 0.24);
      var pl = rbox(x + 0.5, y + 0.5, w - 1, d - 1, 0, 2.2, 10, '#3b3653', '#524b74', mix(col, '#ffffff', 0.72), INK);
      if (lv >= 4) rstripes(pl, 0, 2.2, 'rgba(255,255,255,0.5)', 2.4);
      cyl(cx, cy, R + 2.5, 2, 2.5, lv >= 4 ? '#e8b020' : '#4f4970', '#e9e6f5');
      disc(cx, cy, R, 4.55, '#f7f5ff');
      disc(cx, cy, R * 0.55, 4.6, rgba(col, 0.25));
      bx(cx - 1, cy - 1, 2, 2, 4.5, 4, '#8a84a8');
      for (var i = 0; i < arms.length; i++) cyl(arms[i][0], arms[i][1], 2.4, 4.5, 3, '#ffb020');
      cyl(x + w - 7, y + 8, 3.6, 2.2, 13, '#dff4ff', '#ffffff');
      dome(x + w - 7, y + 8, 3.6, 15.2, '#dff4ff', 0.6);
      rrect(hb.x - 1.3, hb.y - 11, 2.6, 9, 1.2, INK);
      pop('He', hb.x, hb.y - 15.2, 3.4, '#39c8f0', 1.1);
      var tp = P(x + w - 17, y + 15, 2.2);
      fatLine(tp.x, tp.y, tp.x, tp.y - 6, '#e9e6f5', 0.9);
      tagSq(tp.x, tp.y - 10.5, W.PIPELINE.length + 1, col);
    });
    var shown = work ? Math.max(1, Math.ceil(plates * k)) : plates;
    blitFoot('asm:ch:' + shown + '#' + lv, cx - 11, cy - 11, 22, 22, 8.5 + plates * gap + 4, function () {
      chandelier(cx, cy, 8, plates, 9.5, shown, gap);
    });
    for (var i = 0; i < arms.length; i++) {
      var a = arms[i];
      var bs = P(a[0], a[1], 7.5);
      var reach = work ? 0.5 + 0.5 * Math.sin(T * 4 + a[2]) : 0.2;
      var tgt = P(cx + (a[0] - cx) * 0.35, cy + (a[1] - cy) * 0.35, 8 + reach * plates * gap * 0.75);
      var el = { x: (bs.x + tgt.x) / 2 + (a[0] < cx ? -4 : 4), y: Math.min(bs.y, tgt.y) - 6 };
      fatLine(bs.x, bs.y, el.x, el.y, '#ffb020', 2);
      fatLine(el.x, el.y, tgt.x, tgt.y, '#ffffff', 1.5);
      c.fillStyle = INK; c.fillRect(el.x - 1.4, el.y - 1.4, 2.8, 2.8);
      if (work && Math.sin(T * 4 + a[2]) > 0.6) sparks(tgt.x, tgt.y, 5, 6, i * 5);
    }
    var sx = X(cx, cy), by = Y(cx, cy, 4.5), ty = by - gh, rx = R * RX, ry = R * RY;
    blitFoot('asm:front#' + lv, x, y, w, d, gh + 16, function () {
      c.beginPath();
      c.moveTo(sx - rx, ty); c.lineTo(sx - rx, by);
      c.ellipse(sx, by, rx, ry, 0, Math.PI, 0, true);
      c.lineTo(sx + rx, ty);
      c.ellipse(sx, ty, rx, ry, 0, 0, Math.PI, false);
      c.closePath();
      c.save(); c.globalAlpha = 0.28; fillSpan(cylGrad('#a8dcff'), sx, rx); c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.7;
      c.beginPath();
      for (var m = 1; m < 8; m++) {
        var an = m * Math.PI / 8, mx = sx + Math.cos(an) * rx, my = Math.sin(an) * ry;
        c.moveTo(mx, by + my); c.lineTo(mx, ty + my);
      }
      c.stroke();
      c.beginPath(); c.ellipse(sx, ty, rx, ry, 0, 0, 7); c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 2.2; c.strokeStyle = lv >= 6 ? '#e8b020' : col; c.stroke();
      c.save(); c.globalAlpha = 0.35;
      dome(cx, cy, R, 4.5 + gh, '#bfe8ff', 0.5);
      c.restore();
      c.beginPath(); c.ellipse(sx - rx * 0.3, ty - R * 0.3, rx * 0.35, R * 0.1, -0.3, 0, 7); fill('rgba(255,255,255,0.55)');
      var sy0 = Y(cx, cy, 3.2), prx = (R + 2.5) * RX, pry = (R + 2.5) * RY;
      c.lineCap = 'round';
      c.beginPath(); c.ellipse(sx, sy0, prx, pry, 0, Math.PI * 0.95, Math.PI * 0.05, true);
      c.strokeStyle = INK; c.lineWidth = 4.2; c.stroke();
      c.strokeStyle = '#433e62'; c.lineWidth = 2.6; c.stroke();
    });
    if (lv >= 2 && !DBG.nobulbs) {
      var step = Math.floor(T * 8) % 4;
      sprite('asmring:' + step + '#' + lv, 0, 0, sx - rx - 2, ty - ry - 2, rx * 2 + 4, ry * 2 + 4, function () {
        for (var pass = 0; pass < 2; pass++) {
          c.beginPath();
          for (var bI = 0; bI < 18; bI++) {
            var lit = (bI + step) % 4 === 0;
            if (lit !== !!pass) continue;
            var ba = bI / 18 * Math.PI * 2, br = lit ? 1.4 : 0.85;
            c.rect(sx + Math.cos(ba) * rx - br, ty + Math.sin(ba) * ry - br, br * 2, br * 2);
          }
          fill(pass ? '#fff6c8' : sh(col, -30));
        }
      });
    }
    if (lv >= 5) { var tq = P(x + w - 17, y + 15, 2.2); crown(tq.x, tq.y - 16.8, lv); }
    if (k > 0.01) {
      c.lineCap = 'round';
      c.beginPath(); c.ellipse(sx, Y(cx, cy, 3.2), (R + 2.5) * RX, (R + 2.5) * RY, 0, Math.PI * 0.95, Math.PI * 0.95 - Math.PI * 0.9 * k, true);
      c.strokeStyle = sh(col, 40); c.lineWidth = 2.6; c.stroke();
    }
    var low = S.he < (QT.G.CFG.hePerBuild || 1), fh = 8 * heRatio(S);
    c.fillStyle = low ? '#ff4a5a' : '#39c8f0'; c.fillRect(hb.x - 0.8, hb.y - 2.5 - fh, 1.6, fh + 0.5);
    if (low && Math.sin(T * 8) > 0) glow(hb.x, hb.y - 7, 10, '#ff4a5a', 0.9);
    beacon(x + 5, y + d - 5, 2.2, work ? 'run' : 'idle');
    return true;
  });
  function crownAt(cx, cy, h, lv) { var s = P(cx, cy, h); crown(s.x, s.y, lv); }
  function heRatio(S) { return clamp01(S.he / Math.max(1, S.heMax())); }
  var DOCK_H = 12;
  var CRATES = ['#e2508a', '#2bb8d8', '#f5b21c', '#6f57e0'];
  on('plot', 'ship', function (p, S, h) {
    begin(h, S);
    var st = S.p.ship, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var tx0 = x + w - 32, tw = 30, ty0 = y + 2, td = 20, th = 20 + Math.min(5, lv - 1) * 2, tTop = DOCK_H + th;
    if (!visible(x, y, w, d, tTop + 24)) return true;
    var here = !!(QT.G.truckHere && QT.G.truckHere());
    var fy = ty0 + td, dx0 = tx0 + 7, dx1 = tx0 + tw - 7;
    blitFoot('ship:' + (here ? 1 : 0) + '#' + lv, x, y, w, d, tTop + 14, function () {
      shadowF(x, y, w, d, 0.2);
      bx(x + 1, y + 1, w - 2, d - 2, 0, DOCK_H, '#cfc8dc', { top: '#e7e2ef', left: '#8d86a8', right: '#a39cbb' });
      face(x + 4, y + d - 12, w - 8, 1.2, DOCK_H + 0.05); fill('rgba(245,178,28,0.8)');
      var cs = [[x + 3, y + 3, 0, 0], [x + 3, y + 11, 0, 1], [x + 12, y + 3, 0, 2]];
      for (var ci = 0; ci < cs.length; ci++) {
        var cc = CRATES[cs[ci][3]], hc = DOCK_H + cs[ci][2] * 6;
        bx(cs[ci][0], cs[ci][1], 8, 7, hc, 6, cc, { left: sh(cc, -45), right: sh(cc, -20) });
        qL(cs[ci][0] + 1, cs[ci][0] + 7, cs[ci][1] + 7, hc + 1, hc + 5); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.5; c.stroke();
      }
      var wh = rbox(tx0, ty0, tw, td, DOCK_H, tTop, 6, mix(col, '#ffffff', 0.35), mix(col, '#ffffff', 0.62), mix(col, '#ffffff', 0.8), INK);
      for (var f = 0; DOCK_H + 3 + f * 5 + 3 < tTop - 1; f++) {
        var fh0 = DOCK_H + 3 + f * 5;
        qR(tx0 + tw, ty0 + 5, ty0 + td - 5, fh0, fh0 + 3); fill('#34457a');
        c.beginPath();
        for (var wi = 0; wi < 3; wi++) if (rnd(f * 5 + wi + lv) > 0.35) qRp(tx0 + tw, ty0 + 5.6 + wi * 3.3, ty0 + 8.2 + wi * 3.3, fh0 + 0.5, fh0 + 2.5);
        fill('#ffe9a0');
      }
      qL(dx0 - 1, dx1 + 1, fy, DOCK_H, DOCK_H + 12.4); fill(INK);
      qL(dx0, dx1, fy, DOCK_H, DOCK_H + 11.6); fill('#ffe9a8');
      if (here) glow(X((dx0 + dx1) / 2, fy), Y((dx0 + dx1) / 2, fy, DOCK_H + 4), 12, '#fff2c0', 0.8);
      var top = DOCK_H + 11.6, bot = DOCK_H + 11.6 * (here ? 0.62 : 0);
      qL(dx0, dx1, fy, bot, top); fill('#e2508a');
      c.strokeStyle = rgba('#ffffff', 0.45); c.lineWidth = 0.6;
      c.beginPath();
      for (var sl = bot + 2; sl < top; sl += 2.2) { c.moveTo(X(dx0, fy), Y(dx0, fy, sl)); c.lineTo(X(dx1, fy), Y(dx1, fy, sl)); }
      c.stroke();
      polyAt(rpoly(tx0 + 0.8, ty0 + 0.8, tw - 1.6, td - 1.6, 5.4), tTop + 0.05);
      c.strokeStyle = rgba('#8cf0b8', 0.6); c.lineWidth = 2.2; c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.stroke();
      var sp = P((dx0 + dx1) / 2, fy, DOCK_H + 17.5);
      rrect(sp.x - 16.5, sp.y - 4.6, 33, 9.2, 4.6, INK);
      rrect(sp.x - 15.5, sp.y - 3.7, 31, 7.4, 3.7, col);
      rrect(sp.x - 14.5, sp.y - 3.2, 29, 2.6, 1.3, 'rgba(255,255,255,0.28)');
      pop('SHIPPING', sp.x, sp.y + 0.3, 4.4, '#ffffff', 1.3);
      c.save();
      face(x + 1, y + d - 4, w - 2, 3, DOCK_H); fill('#f5b21c');
      c.clip();
      c.strokeStyle = '#3a3550'; c.lineWidth = 3;
      c.beginPath();
      for (var sI = -30; sI < w + 30; sI += 8) {
        var a = P(x + sI, y + d - 4, DOCK_H), b = P(x + sI + 10, y + d - 1, DOCK_H);
        c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
      }
      c.stroke(); c.restore();
      bx(x + 8, y + d - 1.5, 7, 1.5, DOCK_H - 7, 6, '#3a3550');
      bx(x + w - 15, y + d - 1.5, 7, 1.5, DOCK_H - 7, 6, '#3a3550');
      var sgx = x + w - 6, sgy = y + d - 8;
      bx(sgx, sgy, 1.6, 1.6, DOCK_H, 12, '#3b3653');
      var lamp = P(sgx + 0.8, sgy + 0.8, DOCK_H + 15);
      rrect(lamp.x - 2.6, lamp.y - 5, 5.2, 9, 2.2, INK);
      c.beginPath(); c.arc(lamp.x, lamp.y - 2.4, 1.7, 0, 7); fill(here ? '#5a2a30' : '#ff4a5a');
      c.beginPath(); c.arc(lamp.x, lamp.y + 1.8, 1.7, 0, 7); fill(here ? '#3be08f' : '#1f4a38');
      glow(lamp.x, here ? lamp.y + 1.8 : lamp.y - 2.4, 7, here ? '#3be08f' : '#ff4a5a', 0.8);
      if (lv >= 3) cyl(tx0 + tw / 2, ty0 + td / 2, 2.4, tTop, 3, '#3b3653');
    });
    if (lv >= 2) bulbStrip('ship#' + lv, X(tx0 + 6, fy + 0.6), Y(tx0 + 6, fy + 0.6, tTop - 1.2), X(tx0 + tw - 6, fy + 0.6), Y(tx0 + tw - 6, fy + 0.6, tTop - 1.2), 7, 0, '#ffd23f');
    if (lv >= 3) {
      var rc = P(tx0 + tw / 2, ty0 + td / 2, tTop + 3);
      line(rc.x, rc.y, rc.x, rc.y - 4, INK, 1.2);
      c.beginPath(); c.ellipse(rc.x, rc.y - 5, 6 * Math.abs(Math.cos(T * 2.5)) + 0.8, 3, 0, 0, 7); fill('#e9e6f5');
      c.strokeStyle = INK; c.lineWidth = 0.7; c.stroke();
      crown(X(tx0 + 7, ty0 + td - 4), Y(tx0 + 7, ty0 + td - 4, tTop), lv);
    }
    var wait = Math.min(4, S.player.carry.length);
    for (var q = 0; q < wait; q++) {
      sprite('pallet', X(x + 8 + q * 11, y + 16), Y(x + 8 + q * 11, y + 16, DOCK_H), -8, -16, 16, 24, function () {
        c.translate(-X(x + 8, y + 16), -Y(x + 8, y + 16, DOCK_H));
        bx(x + 8, y + 16, 8, 7, DOCK_H, 1.2, '#b0864a');
        bx(x + 8.5, y + 16.5, 7, 6, DOCK_H + 1.2, 6, '#f2a63b', { top: '#ffc766' });
        face(x + 11.5, y + 16.5, 1, 6, DOCK_H + 7.25); fill('#c8801a');
      });
    }
    beacon(x + 4, y + d - 5, DOCK_H, here ? 'run' : 'idle');
    return true;
  });
  function feederBase(p, col) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    shadowF(x, y, w, d, 0.22);
    var pl = rbox(x + 0.5, y + 0.5, w - 1, d - 1, 0, 3, 9, mix(col, '#2a1a40', 0.15), mix(col, '#ffffff', 0.25), '#eef8ff', INK);
    rstripes(pl, 0, 3, 'rgba(255,255,255,0.6)', 2.6);
    polyAt(rpoly(x + 2.2, y + 2.2, w - 4.4, d - 4.4, 7.4), 3.05); fill('rgba(170,215,240,0.45)');
    polyAt(rpoly(x + 3.5, y + 3.5, w - 7, d - 7, 6.2), 3.1);
    c.lineJoin = 'round';
    c.strokeStyle = rgba(mix(col, '#ffffff', 0.3), 0.6); c.lineWidth = 2.2; c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.stroke();
  }
  function feederBulbs(p, lv, col) {
    if (lv < 2 || DBG.nobulbs) return;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    bulbStrip('fd:' + p.id, X(x + 9, y + d - 0.5), Y(x + 9, y + d - 0.5, 3.3), X(x + w - 9, y + d - 0.5), Y(x + w - 9, y + d - 0.5, 3.3), 12, 0, col);
  }
  function readyLamps(x, y, w, d, n, col) {
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (var i = 0; i < 4; i++) {
        if ((i < n) !== !pass) continue;
        var lx = x + w * 0.2 + i * w * 0.14;
        qLp(lx, lx + w * 0.09, y + d - 0.5, 0.8, 2.4);
      }
      fill(pass ? '#b9c6d6' : col);
    }
  }
  function feederPhase(p, S) {
    var st = S.p[p.id], lv = st.level || 1, per = p.rate / (1 + 0.24 * (lv - 1));
    return clamp01(1 - (st.timer || 0) / per);
  }
  on('plot', 'fridge', function (p, S, h) {
    begin(h, S);
    var st = S.p.fridge, lv = st.level || 1, gold = '#e8b020';
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var Ht = 44 + Math.min(5, lv - 1) * 3;
    if (!visible(x, y, w, d, Ht + 30)) return true;
    var cx = x + w / 2, cy = y + d / 2;
    var pL = [x + 4, y + d - 8], pR = [x + w - 8, y + 4];
    var n = 3 + Math.ceil(lv / 2), base = 11, top = Ht - 7, gap = (top - base) / n;
    blitFoot('fridge#' + lv, x, y, w, d, Ht + 12, function () {
      feederBase(p, p.color);
      disc(cx, cy, 17, 3.1, 'rgba(160,220,255,0.55)');
      glow(X(cx, cy), Y(cx, cy, 8), 26, '#7fd6ff', 0.5);
      bx(pL[0], pL[1], 4, 4, 3, Ht + 4, '#5b5578', { top: '#8a84a8' });
      var radii = [], i;
      for (i = 0; i < n; i++) radii.push(5.5 + 8 * i / (n - 1));
      cyl(cx, cy, 2.6, base - 6, 6, gold, '#ffe08a');
      var chip = P(cx, cy, base - 7);
      c.fillStyle = '#6f57e0'; c.fillRect(chip.x - 2.2, chip.y - 1, 4.4, 2.2);
      for (i = 0; i < n; i++) {
        var hh = base + i * gap, r = radii[i], pr = r * 0.62;
        c.strokeStyle = '#b8801a'; c.lineWidth = 1.1;
        c.beginPath();
        for (var a = 0; a < 3; a++) {
          var an = 0.55 + a * 1.0;
          var q0 = P(cx + Math.cos(an) * pr, cy + Math.sin(an) * pr, hh + 2.4);
          c.moveTo(q0.x, q0.y); c.lineTo(q0.x, q0.y - gap + 2.4);
        }
        c.stroke();
        cyl(cx, cy, r, hh, 2.4, gold, '#ffe9a0');
        c.beginPath(); c.ellipse(X(cx, cy), Y(cx, cy, hh), r * RX, r * RY, 0, 0.15, Math.PI - 0.15);
        c.strokeStyle = 'rgba(120,70,0,0.6)'; c.lineWidth = 0.7; c.stroke();
        var gl = P(cx + r * 0.7, cy - r * 0.3, hh + 2.4);
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(gl.x - 1.2, gl.y - 0.3, 2.4, 0.6);
      }
      var angs = [1.05, 1.55, 2.05];
      for (var ci = 0; ci < angs.length; ci++) {
        c.beginPath();
        var m0 = P(cx + Math.cos(angs[ci]) * 14, cy + Math.sin(angs[ci]) * 14, Ht - 4);
        c.moveTo(m0.x, m0.y);
        for (i = n - 1; i >= 0; i--) {
          var rr = radii[i] * 0.92, q1 = P(cx + Math.cos(angs[ci]) * rr, cy + Math.sin(angs[ci]) * rr, base + i * gap + 1);
          c.lineTo(q1.x, q1.y);
        }
        c.strokeStyle = ci === 1 ? '#8fd8ff' : '#dfe6f7'; c.lineWidth = 0.8; c.stroke();
      }
      cyl(cx, cy, 16, Ht - 4, 3, '#c9cfe0', '#eef1fa');
      c.beginPath(); c.ellipse(X(cx, cy), Y(cx, cy, Ht - 1), 16 * RX, 16 * RY, 0, 0, 7);
      c.strokeStyle = gold; c.lineWidth = 1.2; c.stroke();
      bx(pR[0], pR[1], 4, 4, 3, Ht + 4, '#5b5578', { top: '#8a84a8' });
      bx(pL[0], pR[1], pR[0] - pL[0] + 4, 4, Ht + 4, 3, '#7a7498');
      bx(pL[0], pR[1] + 4, 4, pL[1] - pR[1] - 4, Ht + 4, 3, '#7a7498');
    });
    var chip2 = P(cx, cy, base - 7);
    glow(chip2.x, chip2.y, 10, '#b28cff', 0.75 + 0.25 * Math.sin(T * 5));
    var ph = feederPhase(p, S);
    if (ph > 0.7) {
      var pk = (ph - 0.7) / 0.3, gp = P(cx, cy, base + (n - 1) * gap * (1 - pk));
      glow(gp.x, gp.y, 16, '#fff2a0', 0.95 * Math.sin(pk * Math.PI));
    }
    bulbStrip('fr1#' + lv, X(pL[0] + 2, pL[1] + 4), Y(pL[0] + 2, pL[1] + 4, Ht + 7.5), X(pL[0] + 2, pR[1] + 2), Y(pL[0] + 2, pR[1] + 2, Ht + 7.5), 7, 0, '#7fd6ff');
    bulbStrip('fr2#' + lv, X(pL[0] + 2, pR[1] + 2), Y(pL[0] + 2, pR[1] + 2, Ht + 7.5), X(pR[0] + 4, pR[1] + 2), Y(pR[0] + 4, pR[1] + 2, Ht + 7.5), 8, 2, '#7fd6ff');
    crownAt(pL[0] + 2, pR[1] + 2, Ht + 7, lv);
    feederBulbs(p, lv, '#ffd23f');
    readyLamps(x, y, w, d, st.buf ? st.buf.length : 0, '#ffd23f');
    return true;
  });
  on('plot', 'cstage', function (p, S, h) {
    begin(h, S);
    var st = S.p.cstage, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var ch = 26 + Math.min(5, lv - 1) * 3;
    if (!visible(x, y, w, d, ch + 40)) return true;
    var cx = x + w / 2 - 4, cy = y + d / 2;
    var sx = X(cx, cy), rx = 13 * RX, ry = 13 * RY;
    var wp = P(cx + 3, cy + 12.5, 3 + ch * 0.35), fanc = P(x + w - 11.5, y + d - 7, 6.5);
    blitFoot('cstage#' + lv, x, y, w, d, ch + 14, function () {
      feederBase(p, col);
      disc(cx, cy, 15, 3.1, 'rgba(160,220,255,0.6)');
      cyl(cx, cy, 13, 3, ch, '#c9d3e8', '#eef3ff');
      dome(cx, cy, 13, 3 + ch, '#dfe7f7', 0.45);
      for (var b = 0; b < 3; b++) {
        c.beginPath(); c.ellipse(sx, Y(cx, cy, 5 + b * 3.5), rx, ry, 0, 0.05, Math.PI - 0.05);
        c.strokeStyle = 'rgba(255,255,255,' + (0.85 - b * 0.2) + ')'; c.lineWidth = 1.6; c.stroke();
      }
      c.beginPath(); c.ellipse(sx, Y(cx, cy, 3 + ch * 0.62), rx, ry, 0, 0.05, Math.PI - 0.05);
      c.strokeStyle = INK; c.lineWidth = 2.6; c.stroke();
      c.beginPath(); c.ellipse(wp.x, wp.y, 4.2, 4, 0, 0, 7); fill(INK);
      c.beginPath(); c.ellipse(wp.x, wp.y, 3.4, 3.2, 0, 0, 7); fill('#1d2146');
      bx(x + w - 17, y + d - 16, 11, 9, 3, 7, '#ef7d2e');
      c.beginPath(); c.ellipse(fanc.x, fanc.y, 2.6, 2.6, 0, 0, 7); fill(INK);
    });
    c.beginPath(); c.ellipse(sx, Y(cx, cy, 3 + ch * 0.62), rx, ry, 0, 0.05, Math.PI - 0.05);
    c.strokeStyle = mix('#2bb8d8', '#bff4ff', Math.round((0.5 + 0.5 * Math.sin(T * 3)) * 8) / 8); c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#ffd23f';
    for (var sI = 0; sI < 3; sI++) c.fillRect(wp.x - 2.4, wp.y - 1.8 + sI * 1.5 + Math.sin(T * 2 + sI) * 0.2, 4.8, 0.8);
    var fa = T * 8, fc = Math.cos(fa) * 2, fs = Math.sin(fa) * 2;
    c.strokeStyle = '#e9e6f5'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(fanc.x - fc, fanc.y - fs); c.lineTo(fanc.x + fc, fanc.y + fs);
    c.moveTo(fanc.x + fs, fanc.y - fc); c.lineTo(fanc.x - fs, fanc.y + fc); c.stroke();
    var top = P(cx, cy, 3 + ch + 6);
    puffs(top.x - 3, top.y, 3, 16, 2.4, 0.35, '#ffffff', 0.7, 0.1);
    crownAt(cx, cy, 3 + ch + 5.5, lv);
    feederBulbs(p, lv, '#7fd6ff');
    readyLamps(x, y, w, d, st.buf ? st.buf.length : 0, '#7fd6ff');
    return true;
  });
  on('plot', 'ctrl', function (p, S, h) {
    begin(h, S);
    var st = S.p.ctrl, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var rh = 22 + Math.min(5, lv - 1) * 3;
    if (!visible(x, y, w, d, rh + 40)) return true;
    var n = Math.min(4, 2 + Math.floor(lv / 2)), rw = (w - 10) / n;
    var os = P(x + w * 0.66, y + d * 0.72, 3);
    var mw = 28, mh = 17, mx = os.x, my = os.y - 6 - mh / 2;
    blitFoot('ctrl:back#' + lv, x, y, w, d, rh + 8, function () {
      feederBase(p, col);
      for (var i = 0; i < n; i++)
        bx(x + 4 + i * rw, y + 4, rw - 1.5, 12, 3, rh - (i % 2) * 3, '#2d2a45', { left: '#3b3860', right: '#4a4670', top: sh(col, 10) });
    });
    var LED = ['#3be08f', '#ffd23f', '#4fd8ff'], fr = Math.floor(T * 6);
    for (var cI = 0; cI < 3; cI++) {
      c.beginPath();
      for (var i = 0; i < n; i++) {
        var rows = Math.floor((rh - (i % 2) * 3 - 4) / 2.6);
        var lx = x + 4 + i * rw + 1.2 + cI * (rw - 3.5) / 3;
        for (var r = 0; r < rows; r++) {
          if (rnd(i * 97 + r * 13 + cI * 7 + fr + i) <= 0.45) continue;
          qLp(lx, lx + 1.6, y + 16, 5 + r * 2.6, 6.2 + r * 2.6);
        }
      }
      fill(LED[cI]);
    }
    var top0 = Y(x, y, rh + 8);
    blit('ctrl:front#' + lv, mx - mw / 2 - 4 - 30, top0, mw + 8 + 60, (my + mh / 2 + 10) - top0, function () {
      c.fillStyle = '#6a6490'; c.fillRect(os.x - 1.2, os.y - 6, 2.4, 6);
      rrect(mx - mw / 2 - 1.8, my - mh / 2 - 1.8, mw + 3.6, mh + 3.6, 3.6, INK);
      rrect(mx - mw / 2 - 0.6, my - mh / 2 - 0.6, mw + 1.2, mh + 1.2, 3, col);
      rrect(mx - mw / 2 + 1.2, my - mh / 2 + 1.2, mw - 2.4, mh - 2.4, 1.6, '#0b1f1a');
      c.strokeStyle = 'rgba(80,255,170,0.2)'; c.lineWidth = 0.4;
      c.beginPath(); c.moveTo(mx - mw / 2 + 2, my); c.lineTo(mx + mw / 2 - 2, my); c.stroke();
      var cols = ['#ef7d2e', '#2bb8d8', '#e2508a'];
      for (var k2 = 0; k2 < 3; k2++) {
        var a0 = P(x + 8 + k2 * rw, y + 10, 3 + rh - 2), a1 = { x: mx - mw / 2 + 4 + k2 * 5, y: my - mh / 2 - 1.8 };
        c.beginPath(); c.moveTo(a0.x, a0.y);
        c.quadraticCurveTo((a0.x + a1.x) / 2, Math.min(a0.y, a1.y) - 8, a1.x, a1.y);
        c.strokeStyle = cols[k2]; c.lineWidth = 0.9; c.stroke();
      }
    });
    c.beginPath();
    for (var sI = 0; sI <= 28; sI++) {
      var u = sI / 28, px = mx - mw / 2 + 2 + u * (mw - 4);
      var env = Math.exp(-Math.pow((u - ((T * 0.6) % 1)) * 6, 2));
      var py = my + Math.sin(u * 40 - T * 12) * (mh * 0.36) * env + Math.sin(u * 6 + T) * 0.6;
      if (sI === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.strokeStyle = '#5bffb0'; c.lineWidth = 0.9; c.stroke();
    if (feederPhase(p, S) > 0.8) glow(mx, my, 16, '#3be08f', 0.5);
    crownAt(x + 4 + rw / 2, y + 10, 3 + rh, lv);
    feederBulbs(p, lv, '#ffb020');
    readyLamps(x, y, w, d, st.buf ? st.buf.length : 0, '#ffb020');
    return true;
  });
  on('plot', 'helium', function (p, S, h) {
    begin(h, S);
    var st = S.p.helium, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var th = 18 + lv * 3;
    if (!visible(x, y, w, d, th + 50)) return true;
    var n = Math.min(4, 1 + Math.ceil(lv / 2));
    var spots = [[x + 13, y + 12], [x + 29, y + 10], [x + 12, y + 30], [x + 27, y + 27]];
    var order = [1, 0, 3, 2];
    var gp = P(x + w - 14, y + d - 12, 3);
    var gw = 11, gh = 30, gx = gp.x, gy = gp.y - gh / 2 - 4;
    blitFoot('helium#' + lv, x, y, w, d, th + 20, function () {
      feederBase(p, '#7fd6ff');
      for (var oi = 0; oi < order.length; oi++) {
        var i = order[oi];
        if (i >= n) continue;
        var sp = spots[i], hh = th - (i % 2) * 3;
        cyl(sp[0], sp[1], 6.5, 3, hh, '#e6f4ff', '#ffffff');
        dome(sp[0], sp[1], 6.5, 3 + hh, '#eef8ff', 0.5);
        var sx = X(sp[0], sp[1]), rx = 6.5 * RX, ry = 6.5 * RY;
        for (var b = 0; b < 2; b++) {
          c.beginPath(); c.ellipse(sx, Y(sp[0], sp[1], 5 + b * 3), rx, ry, 0, 0.05, Math.PI - 0.05);
          c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.8; c.stroke();
        }
        c.beginPath(); c.ellipse(sx, Y(sp[0], sp[1], 3 + hh * 0.6), rx, ry, 0, 0.05, Math.PI - 0.05);
        c.strokeStyle = col; c.lineWidth = 2.4; c.stroke();
        pop('He', sx, Y(sp[0], sp[1], 3 + hh * 0.42) + ry, 4.2, '#ffffff', 1.3);
        bx(sp[0] - 1, sp[1] - 1, 2, 2, 3 + hh + 2, 2.5, '#8a84a8');
      }
      c.fillStyle = '#6a6490'; c.fillRect(gx - 2, gp.y - 5, 4, 5);
      rrect(gx - gw / 2 - 1.8, gy - gh / 2 - 1.8, gw + 3.6, gh + 3.6, gw / 2 + 1.8, INK);
      rrect(gx - gw / 2, gy - gh / 2, gw, gh, gw / 2, 'rgba(225,240,255,0.95)');
      pop('He', gx, gy - gh / 2 - 5, 5, '#39c8f0', 1.5);
    });
    for (var j = 0; j < n; j++) {
      var vt = P(spots[j][0], spots[j][1], 3 + th - (j % 2) * 3 + 4);
      puffs(vt.x, vt.y - 2, 2, 12, 1.8, 0.4 + j * 0.07, '#ffffff', 0.65, j * 0.3);
    }
    var ratio = heRatio(S), empty = S.he <= 0.01, low = ratio < 0.25;
    var liq = empty ? '#ff4a5a' : low ? '#ffb020' : '#39c8f0';
    var fh = Math.max(0, (gh - 2) * ratio);
    if (fh > 0.5) {
      var lt = gy + gh / 2 - 1 - fh;
      rrect(gx - gw / 2 + 1, lt, gw - 2, fh, Math.min(fh / 2, gw / 2 - 1), liq);
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.fillRect(gx - gw / 2 + 2, lt, gw - 4, 1);
      c.beginPath();
      for (var bb = 0; bb < 4; bb++) {
        var bk = (T * 0.5 + bb / 4) % 1, byy = gy + gh / 2 - 2.5 - bk * (fh - 2);
        c.rect(gx - 2.6 + (bb % 2) * 4 + Math.sin(T * 3 + bb) * 0.6, byy, 1.4, 1.4);
      }
      c.fill();
    }
    c.strokeStyle = 'rgba(42,26,64,0.5)'; c.lineWidth = 0.6;
    c.beginPath();
    for (var tk = 1; tk < 4; tk++) { var ty2 = gy + gh / 2 - tk * gh / 4; c.moveTo(gx + gw / 2 - 3, ty2); c.lineTo(gx + gw / 2, ty2); }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(gx - gw / 2 + 1.5, gy - gh / 2 + 4, 1.4, gh - 9);
    if ((empty || low) && Math.sin(T * 8) > -0.2) {
      glow(gx, gy, 20, empty ? '#ff4a5a' : '#ffb020', 0.8);
      pop(H.L.t(empty ? 'factory_heEmpty' : 'factory_heLow'), gx, gy + gh / 2 + 6, 4.4, empty ? '#ff4a5a' : '#ffb020', 1.4);
    }
    crownAt(x + 29, y + 10, 3 + th + 6, lv);
    feederBulbs(p, lv, '#5fe0ff');
    return true;
  });
  function robot(sx, sy, s, col, t, armUp) {
    var bob = Math.sin(t * 6) * 0.6 * s;
    sprite('robot:' + col + ':' + s.toFixed(2), sx, sy + bob, -6 * s, -16 * s, 12 * s, 18 * s, function () {
      c.fillStyle = 'rgba(40,30,60,0.2)';
      c.beginPath(); c.ellipse(0, 0, 4.2 * s, 1.6 * s, 0, 0, 7); c.fill();
      rrect(-3.4 * s, -7.5 * s, 6.8 * s, 6.5 * s, 1.8 * s, INK);
      rrect(-2.8 * s, -7 * s, 5.6 * s, 5.5 * s, 1.4 * s, col);
      rrect(-3 * s, -12.5 * s, 6 * s, 5 * s, 2.2 * s, INK);
      rrect(-2.4 * s, -12 * s, 4.8 * s, 4 * s, 1.8 * s, '#f4f2fa');
      rrect(-1.9 * s, -11 * s, 3.8 * s, 1.8 * s, 0.9 * s, '#1d2146');
      c.fillStyle = '#5bf0ff';
      c.fillRect(-1.4 * s, -10.6 * s, 0.9 * s, 1 * s);
      c.fillRect(0.5 * s, -10.6 * s, 0.9 * s, 1 * s);
      line(0, -12.5 * s, 0, -14.5 * s, INK, 0.5 * s);
      c.beginPath(); c.arc(0, -14.8 * s, 0.8 * s, 0, 7); fill('#ff4a5a');
      fatLine(-3 * s, -5.5 * s, -5 * s, -3 * s, '#c9cfe0', 0.9 * s);
    });
    var aa = armUp ? Math.sin(t * 9) * 0.8 - 0.6 : 0.4;
    var ax = sx + 3 * s, ay = sy - 5.5 * s + bob;
    fatLine(ax, ay, ax + Math.cos(aa) * 4 * s, ay + Math.sin(aa) * 4 * s, '#c9cfe0', 0.9 * s);
    return { x: ax + Math.cos(aa) * 4 * s, y: ay + Math.sin(aa) * 4 * s };
  }
  function gearSign(sx, sy, rot) {
    c.beginPath();
    for (var t = 0; t < 16; t++) { var an = rot + t * Math.PI / 8, rr = t % 2 ? 6.2 : 8; c.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); }
    c.closePath(); fill(INK);
    c.beginPath(); c.arc(sx, sy, 6, 0, 7); fill('#8a84a8');
    c.fillStyle = INK; c.fillRect(sx - 2, sy - 2, 4, 4);
  }
  on('plot', 'svc', function (p, S, h) {
    begin(h, S);
    var st = S.p.svc, lv = st.level || 1, col = p.color;
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var bh = 22 + Math.min(5, lv - 1) * 2.4;
    if (!visible(x, y, w, d, bh + 50)) return true;
    var broken = S.brokenCount ? S.brokenCount() : 0;
    var gy = y + 3, gd = 13, fy = gy + gd;
    var mc = P(x + w * 0.5, y + d * 0.66, 2.6);
    var sg = P(x + w * 0.62, gy + gd / 2, 4.7 + bh + 9);
    blitFoot('svc#' + lv, x, y, w, d, bh + 24, function () {
      shadowF(x, y, w, d, 0.22);
      bx(x + 0.5, y + 0.5, w - 1, d - 1, 0, 2.5, '#6a6490', { left: '#3b3653', right: '#4f4970' });
      face(x + 3, y + 3, w - 6, d - 6, 2.55); fill('#e9e6f2');
      c.strokeStyle = '#f5b21c'; c.lineWidth = 1.4; c.setLineDash([2.5, 2.5]);
      face(x + 5, y + 18, w - 10, d - 22, 2.6); c.stroke(); c.setLineDash([]);
      rbox(x + 3, gy, w - 6, gd, 2.5, 2.5 + bh, 5, mix(col, '#ffffff', 0.4), mix(col, '#ffffff', 0.68), '#ffffff', INK);
      qL(x + 8, x + w - 20, fy, 2.5, 14); fill(INK);
      qL(x + 9, x + w - 21, fy, 2.5, 13); fill('#ffe9a8');
      qL(x + 7.5, x + w - 7.5, fy, 16, 21.6); fill(INK);
      qL(x + 8.1, x + w - 8.1, fy, 16.6, 21); fill(sh(col, -40));
      faceTxt('SERVICE', x + w / 2, fy, 18.4, 4.4, '#fff4b8', 'L', 1.3);
      for (var f = 0; 23 + f * 6 + 4 < 2.5 + bh; f++) {
        var fh0 = 23 + f * 6;
        qL(x + 8, x + w - 8, fy, fh0, fh0 + 3.6); fill('#34457a');
        qL(x + 9 + (f % 3) * 12, x + 17 + (f % 3) * 12, fy, fh0, fh0 + 3.6); fill('#ffe9a0');
      }
      var cap = rbox(x + 2.5, gy - 0.5, w - 5, gd + 1, 2.5 + bh, 4.7 + bh, 5.5, sh(col, -28), col, mix(col, '#ffffff', 0.55), INK);
      rstripes(cap, 2.5 + bh, 4.7 + bh, 'rgba(255,255,255,0.85)', 2.6);
      awningL(x + 7, x + w - 18, fy, 15, 2.6, col);
      rrect(mc.x - 8, mc.y - 1.5, 16, 3, 1.4, '#8a84a8');
      c.save(); c.translate(sg.x + 5, sg.y - 1); c.rotate(-0.7);
      rrect(-1.8, -2, 3.6, 13, 1.6, INK); rrect(-1.1, -1.4, 2.2, 11.8, 1, col);
      c.beginPath(); c.arc(0, -3.5, 4.2, 0, 7); fill(INK);
      c.beginPath(); c.arc(0, -3.5, 3.3, 0, 7); fill(col);
      c.beginPath(); c.arc(0, -5.4, 1.8, 0, 7); fill(INK);
      c.restore();
    });
    bulbStrip('svc', X(x + 7, fy), Y(x + 7, fy, 20.4), X(x + w - 7, fy), Y(x + w - 7, fy, 20.4), 12, 0, '#ffd23f');
    gearSign(sg.x - 9, sg.y, T * (broken ? 2 : 0.6));
    var lift = broken ? 3 + Math.abs(Math.sin(T * 2)) * 2 : 1;
    var bk = broken ? 1 : 0;
    sprite('svcmachine:' + bk, mc.x, mc.y - 9 - lift, -9, -13, 18, 24, function () {
      c.fillStyle = 'rgba(60,50,35,0.18)';
      c.beginPath(); c.ellipse(0, 9, 8, 3.2, 0, 0, 7); c.fill();
      rrect(-8, -12, 16, 21, 4.6, INK);
      rrect(-7, -11, 14, 19, 4, '#ffffff');
      rrect(-5, -9, 10, 7, 2, '#2bb8d8');
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-4, -8, 3, 1.4);
      c.fillStyle = 'rgba(80,70,110,0.32)';
      c.fillRect(-5, 0.5, 10, 1.3); c.fillRect(-5, 3.5, 6, 1.3);
      c.beginPath(); c.arc(3.6, 4.5, 1.9, 0, 7); fill(bk ? '#ff4a5a' : '#3be08f');
    });
    if (broken) {
      sparks(mc.x + 4, mc.y - 16 - lift, 6, 6, 9);
      puffs(mc.x - 2, mc.y - 22 - lift, 3, 12, 2, 0.5, '#8a8098', 0.55, 0.2);
    }
    var bots = Math.min(3, 1 + Math.floor(lv / 2));
    var bpos = [[-14, 2], [14, 3], [-3, 8]];
    for (var i = 0; i < bots; i++) {
      var tip = robot(mc.x + bpos[i][0], mc.y + bpos[i][1], 0.8, i % 2 ? '#2bb8d8' : col, T + i * 1.3, !!broken);
      if (broken && Math.sin(T * 9 + i) > 0.5) glow(tip.x, tip.y, 5, '#ffcf40', 0.9);
    }
    if (broken) {
      var sr = P(x + w - 8, gy + 4, 4.7 + bh);
      beacon(x + w - 8, gy + 4, 4.7 + bh, 'stop');
      var bn = Math.min(9, broken);
      sprite('broken:' + bn, sr.x + 7, sr.y - 4, -7, -5, 14, 10, function () { pop('!' + bn, 0, 0, 5.2, '#ff4a5a', 1.6); });
    }
    if (S.pendSvc >= 1) {
      var cp = P(x + w - 10, y + 10, 4.7 + bh + 11 + Math.abs(Math.sin(T * 4)) * 4);
      var sq = Math.round(Math.abs(Math.cos(T * 2.2)) * 5) / 5;
      glow(cp.x, cp.y, 14, '#ffd23f', 0.5);
      sprite('coin:' + sq, cp.x, cp.y, -9.5, -9.5, 19, 19, function () {
        var cw = 7 * (0.35 + 0.65 * sq);
        c.beginPath(); c.ellipse(0, 0, cw + 1.4, 8.4, 0, 0, 7); fill(INK);
        c.beginPath(); c.ellipse(0, 0, cw, 7, 0, 0, 7); fill('#f5b21c');
        c.beginPath(); c.ellipse(-cw * 0.25, -2.2, cw * 0.45, 2.6, 0, 0, 7); fill('#ffe08a');
        if (sq > 0.5) pop('¥', 0, 0.4, 7, '#ffffff', 1.6);
      });
    }
    return true;
  });
  function upBase(p, S, col, extra) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, d = p.h * TILE;
    var st = S.p[p.id], lv = st.level || 1, mx = p.maxLevel || 6;
    var cx = x + w / 2, cy = y + d / 2, b = { x: x, y: y, w: w, d: d, cx: cx, cy: cy, top: 7.5 + lv * 0.8, lv: lv, col: col };
    blitFoot('up:' + p.id + '#' + lv, x, y, w, d, 50, function () {
      shadowF(x, y, w, d, 0.22);
      bx(x + 0.5, y + 0.5, w - 1, d - 1, 0, 2.5, '#6a6490', { left: '#3b3653', right: '#4f4970', top: '#e9e6f2' });
      disc(cx, cy, 19, 2.55, rgba(col, 0.18));
      cyl(cx, cy, 13, 2.5, 3.5 + lv * 0.8, col, sh(col, 45));
      cyl(cx, cy, 10, 6 + lv * 0.8, 1.5, '#ffffff', '#f7f5ff');
      for (var i = 0; i < mx; i++) {
        var an = Math.PI * (0.18 + 0.64 * i / Math.max(1, mx - 1));
        var sp = P(cx + Math.cos(an) * 16.5, cy + Math.sin(an) * 16.5, 2.6);
        if (i < lv) star(sp.x, sp.y - 2.4, 2.4, '#ffd23f');
        else { c.beginPath(); c.arc(sp.x, sp.y - 2, 1.2, 0, 7); fill('#bdb6d4'); }
      }
      if (extra) extra(b);
    });
    return b;
  }
  on('plot', 'up_speed', function (p, S, h) {
    begin(h, S);
    var col = '#2bb8d8';
    if (!visible(p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE, 70)) return true;
    var b = upBase(p, S, col), lv = b.lv;
    var hop = Math.abs(Math.sin(T * (2 + lv * 0.5))) * (4 + lv);
    var s = P(b.cx, b.cy, b.top + 8 + hop), k = 1 + lv * 0.06;
    for (var i = 0; i < 3; i++) {
      var off = (T * 30 + i * 7) % 10;
      c.fillStyle = 'rgba(43,184,216,0.7)'; c.fillRect(s.x - 16 - off, s.y - 3.5 + i * 3, 5, 1);
    }
    var fl = (4 + Math.sin(T * 25) * 1.5) * k;
    c.beginPath(); c.moveTo(s.x - 8 * k, s.y + 1 * k); c.lineTo(s.x - 8 * k - fl * 1.6, s.y + 2.5 * k); c.lineTo(s.x - 8 * k, s.y + 4 * k); c.closePath(); fill('#ffb020');
    c.beginPath(); c.moveTo(s.x - 8 * k, s.y + 1.8 * k); c.lineTo(s.x - 8 * k - fl, s.y + 2.5 * k); c.lineTo(s.x - 8 * k, s.y + 3.2 * k); c.closePath(); fill('#fff2a0');
    sprite('shoe#' + lv, s.x, s.y, -20, -16, 34, 24, function () {
      c.scale(k, k);
      c.beginPath();
      c.moveTo(-8, -3); c.lineTo(-2, -3); c.quadraticCurveTo(1, -3, 3, 0); c.lineTo(8, 1);
      c.quadraticCurveTo(10, 2, 9, 4.5); c.lineTo(-8, 4.5); c.closePath();
      c.lineWidth = 2.6; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
      fill('#ff5a8a');
      c.fillStyle = '#ffffff'; c.fillRect(-8, 3, 17, 1.5);
      c.fillStyle = col; c.fillRect(-5, -1.5, 5, 1.2); c.fillRect(-4, 0.5, 5, 1.2);
      c.translate(-5, -3); c.rotate(-0.4);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -8, -9, -7); c.quadraticCurveTo(-6, -4, -7, -2);
      c.quadraticCurveTo(-4, -2, 0, 0); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); fill('#ffffff');
    });
    return true;
  });
  on('plot', 'up_carry', function (p, S, h) {
    begin(h, S);
    var col = '#ef7d2e';
    if (!visible(p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE, 70)) return true;
    var n = Math.min(5, S.p[p.id].level || 1);
    var b = upBase(p, S, col, function (bb) {
      bx(bb.cx - 6, bb.cy - 5, 12, 10, bb.top, 1.2, '#8a84a8');
      for (var i = 0; i < n; i++) {
        bx(bb.cx - 5, bb.cy - 4, 10, 8, bb.top + 1.2 + i * 5, 5, '#f2a63b', { top: '#ffc766' });
        face(bb.cx - 1, bb.cy - 4, 1.2, 8, bb.top + 6.25 + i * 5); fill('#c8801a');
      }
    });
    var lift = Math.abs(Math.sin(T * 2.4)) * 3;
    var bb = P(b.cx, b.cy, b.top + 1.2 + n * 5 + 5 + lift);
    sprite('barbell', bb.x, bb.y, -18, -8, 36, 16, function () {
      fatLine(-14, 0, 14, 0, '#c9cfe0', 1.4);
      for (var s = -1; s <= 1; s += 2) {
        rrect(s * 12 - 2.2, -6, 4.4, 12, 1.6, INK);
        rrect(s * 12 - 1.5, -5.3, 3, 10.6, 1.2, col);
        rrect(s * 15 - 1.6, -4.2, 3.2, 8.4, 1.2, INK);
        rrect(s * 15 - 1, -3.6, 2, 7.2, 0.8, '#ffd23f');
      }
    });
    return true;
  });
  on('plot', 'up_bot', function (p, S, h) {
    begin(h, S);
    var col = '#6f57e0';
    if (!visible(p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE, 80)) return true;
    var b = upBase(p, S, col), lv = b.lv;
    var n = Math.min(4, lv), mini = [], i;
    for (i = 0; i < n; i++) { var a = T * 0.9 + i * Math.PI * 2 / n; mini.push({ a: a, s: Math.sin(a) }); }
    mini.sort(function (u, v) { return u.s - v.s; });
    function drawMini(m) {
      var mp = P(b.cx + Math.cos(m.a) * 17, b.cy + Math.sin(m.a) * 13, 2.6);
      robot(mp.x, mp.y, 0.55, '#2bb8d8', T * 1.5 + m.a, false);
    }
    for (i = 0; i < mini.length; i++) if (mini[i].s < 0) drawMini(mini[i]);
    var s = P(b.cx, b.cy, b.top);
    robot(s.x, s.y, 1.6 + lv * 0.08, col, T, true);
    for (i = 0; i < mini.length; i++) if (mini[i].s >= 0) drawMini(mini[i]);
    return true;
  });
  var ISLE = {
    grass: { top: '#8fd16a', left: '#9a6a3c', right: '#b07c48', edge: '#6fb44f' },
    concrete: { top: '#d9d4e6', left: '#7a7498', right: '#9a94b8', edge: '#f5b21c' },
    frost: { top: '#e8f7ff', left: '#6f9cc0', right: '#8fb8d8', edge: '#bfe8ff' }
  };
  var SMOKE_COLS = ['#ff6fae', '#ffd23f', '#5fe0ff', '#8cf08c', '#b28cff'];
  function island(x, y, w, d, kind) {
    var k = ISLE[kind];
    bx(x, y, w, d, -7, 7, k.top, { left: k.left, right: k.right });
    bx(x + w * 0.2, y + d * 0.2, w * 0.6, d * 0.6, -13, 6, k.left, { left: sh(k.left, -20), right: k.left });
    c.strokeStyle = k.edge; c.lineWidth = 1.2;
    face(x + 1.5, y + 1.5, w - 3, d - 3, 0.05); c.stroke();
  }
  function smokestack(tx, ty, hi, seed) {
    var x = tx * TILE, y = ty * TILE, sx = X(x, y);
    blit('stack:' + tx + ':' + ty, sx - 16, Y(x, y, hi + 6) - 4, 32, hi + 32, function () {
      island(x - 12, y - 12, 24, 24, 'concrete');
      cyl(x, y, 6, 0, 6, '#8a84a8');
      var bands = 5, bh = hi / bands;
      for (var i = 0; i < bands; i++) {
        var r = 5 - i * 0.35;
        cyl(x, y, r, 6 + i * bh, bh, i % 2 ? '#ffffff' : '#e2504a', i === bands - 1 ? '#3b3653' : false);
      }
    });
    var top = P(x, y, 6 + hi);
    c.lineWidth = 1.8;
    for (var k = 0; k < 4; k++) {
      var u = (T * 0.22 + k / 4 + seed) % 1;
      var ry = top.y - u * 55, rr = 3 + u * 9;
      c.globalAlpha = (1 - u) * 0.85;
      c.beginPath(); c.ellipse(top.x + Math.sin(u * 5 + seed * 9) * 4 + u * 10, ry, rr, rr * 0.45, 0, 0, 7);
      c.strokeStyle = SMOKE_COLS[(k + Math.floor(seed * 7)) % SMOKE_COLS.length];
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  function gantry(tx, ty) {
    var x = tx * TILE, y = ty * TILE, span = 60, hi = 70;
    blitFoot('gantry:' + tx + ':' + ty, x - 12, y - 12, 24, span + 24, hi + 6, function () {
      island(x - 12, y - 12, 24, span + 24, 'concrete');
      bx(x - 3, y - 3, 6, 6, 0, hi, '#ffb020');
      bx(x - 3, y + span - 3, 6, 6, 0, hi, '#ffb020');
      bx(x - 4, y - 8, 8, span + 16, hi, 5, '#ffc640', { left: '#c98a10', right: '#e0a020' });
      var a0 = P(x, y + 3, 0), a1 = P(x, y + span - 3, hi);
      line(a0.x, a0.y, a1.x, a1.y, '#c98a10', 1.4);
    }, 16);
    var k = 0.5 + 0.45 * Math.sin(T * 0.35);
    var ty0 = y + 4 + (span - 8) * k;
    bx(x - 3, ty0 - 3, 6, 6, hi - 3, 3, '#3b3653');
    var hk = P(x, ty0, hi - 3), sw = Math.sin(T * 1.3) * 1.5;
    var drop = 26 + Math.sin(T * 0.5) * 6;
    line(hk.x, hk.y, hk.x + sw, hk.y + drop, INK, 0.7);
    var cc = ['#e2508a', '#2bb8d8', '#2fbf7a'][Math.floor(T / 18) % 3];
    bx(x - 6 + sw * 0.8, ty0 - 10, 12, 20, hi - 3 - drop - 10, 10, cc);
  }
  function coolingTower(tx, ty, r, hi) {
    var x = tx * TILE, y = ty * TILE, sx = X(x, y), by = Y(x, y, 0), tyy = by - hi;
    var rb = r * RX, rt = r * 0.72 * RX, rm = r * 0.6 * RX;
    blit('ctower:' + tx + ':' + ty, sx - rb - 16, tyy - 10, rb * 2 + 32, hi + r * RY + 34, function () {
      island(x - r - 4, y - r - 4, r * 2 + 8, r * 2 + 8, 'concrete');
      c.beginPath();
      c.moveTo(sx - rt, tyy);
      c.quadraticCurveTo(sx - rm * 0.9, by - hi * 0.45, sx - rb, by);
      c.ellipse(sx, by, rb, r * RY, 0, Math.PI, 0, true);
      c.quadraticCurveTo(sx + rm * 0.9, by - hi * 0.45, sx + rt, tyy);
      c.closePath();
      fillSpan(cylGrad('#dfe3ef'), sx, rb);
      c.strokeStyle = 'rgba(42,26,64,0.35)'; c.lineWidth = 0.8; c.stroke();
      c.beginPath(); c.ellipse(sx, by - hi * 0.82, rt * 1.02, r * 0.72 * RY, 0, 0, Math.PI);
      c.strokeStyle = '#e2508a'; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.ellipse(sx, by - hi * 0.66, rm * 1.1, r * 0.66 * RY, 0, 0, Math.PI);
      c.strokeStyle = '#2bb8d8'; c.lineWidth = 2.2; c.stroke();
      c.beginPath(); c.ellipse(sx, tyy, rt, r * 0.72 * RY, 0, 0, 7); fill('#8a84a8');
    });
    c.fillStyle = '#ffffff';
    for (var k = 0; k < 5; k++) {
      var u = (T * 0.12 + k / 5) % 1;
      c.globalAlpha = (1 - u) * 0.9 * Math.min(1, u * 6);
      c.beginPath(); c.arc(sx + Math.sin(k * 1.9) * 5 + u * 14, tyy - 4 - u * 44, rt * (0.55 + u * 0.8), 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  function waterTower(tx, ty) {
    var x = tx * TILE, y = ty * TILE, sx = X(x, y);
    blit('water:' + tx + ':' + ty, sx - 22, Y(x, y, 54) - 20, 44, 54 + 20 + 26, function () {
      island(x - 14, y - 14, 28, 28, 'grass');
      for (var i = 0; i < 4; i++) {
        var a = Math.PI / 4 + i * Math.PI / 2, lx = x + Math.cos(a) * 9, ly = y + Math.sin(a) * 9;
        var p0 = P(lx, ly, 0), p1 = P(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 40);
        fatLine(p0.x, p0.y, p1.x, p1.y, '#8a84a8', 1.6);
      }
      var s = P(x, y, 54);
      c.beginPath(); c.arc(s.x, s.y, 17, 0, 7); fill(INK);
      ball(s.x, s.y, 15.8, '#2bb8d8');
      c.fillStyle = INK;
      c.beginPath(); c.arc(s.x - 5, s.y - 3, 1.8, 0, 7); c.fill();
      c.beginPath(); c.arc(s.x + 5, s.y - 3, 1.8, 0, 7); c.fill();
      c.beginPath(); c.arc(s.x, s.y + 1, 7, 0.3, Math.PI - 0.3); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke();
      c.fillStyle = 'rgba(255,120,160,0.6)';
      c.beginPath(); c.ellipse(s.x - 9, s.y + 3, 2.4, 1.4, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(s.x + 9, s.y + 3, 2.4, 1.4, 0, 0, 7); c.fill();
      pop('QTYC', s.x, s.y + 11, 4.6, '#ffffff', 1.4);
    });
  }
  var WHEEL_COLS = ['#e2508a', '#2bb8d8', '#f5b21c', '#2fbf7a', '#6f57e0', '#ef7d2e'];
  function waferWheel(tx, ty) {
    var x = tx * TILE, y = ty * TILE, R = 40, s = P(x, y, R + 12);
    blit('wheel:' + tx + ':' + ty, s.x - R - 4, s.y - R - 4, R * 2 + 8, R * 2 + 44, function () {
      island(x - 14, y - 14, 28, 28, 'grass');
      var b0 = P(x - 8, y + 8, 0), b1 = P(x + 8, y - 8, 0);
      fatLine(b0.x, b0.y, s.x, s.y, '#8a84a8', 2.2);
      fatLine(b1.x, b1.y, s.x, s.y, '#8a84a8', 2.2);
      c.beginPath(); c.arc(s.x, s.y, R, 0, 7); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 2.6; c.strokeStyle = '#b8c6e8'; c.stroke();
    });
    var rot = T * 0.25, i, a;
    c.strokeStyle = 'rgba(184,198,232,0.85)'; c.lineWidth = 0.8;
    c.beginPath();
    for (i = 0; i < 12; i++) { a = rot + i * Math.PI / 6; c.moveTo(s.x, s.y); c.lineTo(s.x + Math.cos(a) * R, s.y + Math.sin(a) * R); }
    c.stroke();
    var step = Math.floor(T * 6);
    for (var ci = 0; ci < 4; ci++) {
      c.beginPath();
      for (i = ci; i < 24; i += 4) {
        a = rot + i * Math.PI / 12;
        var br = (i + step) % 4 === 0 ? 1.6 : 1;
        c.rect(s.x + Math.cos(a) * R - br, s.y + Math.sin(a) * R - br, br * 2, br * 2);
      }
      fill(SMOKE_COLS[ci]);
    }
    var gs = [];
    for (i = 0; i < 6; i++) { a = rot + i * Math.PI / 3; gs.push([s.x + Math.cos(a) * R, s.y + Math.sin(a) * R]); }
    c.beginPath();
    for (i = 0; i < 6; i++) { c.moveTo(gs[i][0], gs[i][1]); c.lineTo(gs[i][0], gs[i][1] + 3); }
    c.strokeStyle = INK; c.lineWidth = 0.8; c.stroke();
    c.beginPath();
    for (i = 0; i < 6; i++) c.rect(gs[i][0] - 4.4, gs[i][1] + 2.2, 8.8, 7.6);
    fill(INK);
    for (i = 0; i < 6; i++) { c.fillStyle = WHEEL_COLS[i]; c.fillRect(gs[i][0] - 3.6, gs[i][1] + 3, 7.2, 6); }
    c.beginPath();
    for (i = 0; i < 6; i++) c.rect(gs[i][0] - 1.6, gs[i][1] + 4.6, 3.2, 2.8);
    fill('#ffffff');
    sprite('wheelHub', s.x, s.y, -7, -7, 14, 14, function () {
      c.beginPath(); c.arc(0, 0, 6, 0, 7); fill(INK);
      ball(0, 0, 5, '#f5b21c');
      pop('FAB', 0, 0.3, 3.8, '#ffffff', 1.1);
    });
  }
  function exhaust(tx, ty, hi, col) {
    var x = tx * TILE, y = ty * TILE, sx = X(x, y);
    blit('exh:' + tx + ':' + ty, sx - 12, Y(x, y, hi) - 4, 24, hi + 26, function () {
      island(x - 9, y - 9, 18, 18, 'concrete');
      cyl(x, y, 5, 0, hi, '#eef1fa', '#3b3653');
      for (var i = 1; i < 4; i++) {
        c.beginPath(); c.ellipse(sx, Y(x, y, hi * i / 4), 5 * RX, 5 * RY, 0, 0.05, Math.PI - 0.05);
        c.strokeStyle = col; c.lineWidth = 2.4; c.stroke();
      }
    });
    var top = P(x, y, hi);
    puffs(top.x, top.y - 2, 3, 26, 3, 0.25, '#ffffff', 0.65, tx * 0.1);
    c.fillStyle = Math.sin(T * 3 + tx) > 0 ? '#ff4a5a' : '#7a2030'; c.fillRect(top.x - 1.3, top.y - 5.3, 2.6, 2.6);
  }
  function heSphere(tx, ty, r) {
    var x = tx * TILE, y = ty * TILE, s = P(x, y, r * 1.35);
    blit('hesph:' + tx + ':' + ty, s.x - r - 8, s.y - r - 3, r * 2 + 16, r * 1.35 + r + r * 0.6 + 24, function () {
      island(x - r, y - r, r * 2, r * 2, 'frost');
      for (var i = 0; i < 4; i++) {
        var a = Math.PI / 4 + i * Math.PI / 2;
        if (Math.sin(a) < 0) continue;
        var p0 = P(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 0);
        fatLine(p0.x, p0.y, p0.x, p0.y - r * 0.9, '#8a84a8', 1.6);
      }
      c.beginPath(); c.arc(s.x, s.y, r * 0.95 + 1.2, 0, 7); fill(INK);
      ball(s.x, s.y, r * 0.95, '#e6f4ff');
      c.beginPath(); c.ellipse(s.x, s.y + r * 0.1, r * 0.95, r * 0.3, 0, 0.1, Math.PI - 0.1);
      c.strokeStyle = '#2fbf7a'; c.lineWidth = 2.4; c.stroke();
      pop('He', s.x, s.y - r * 0.25, r * 0.38, '#39c8f0', 1.4);
    });
    puffs(s.x + r * 0.5, s.y - r * 0.85, 3, 16, 2.2, 0.3, '#ffffff', 0.6, tx * 0.2);
  }
  function rocket(tx, ty) {
    var x = tx * TILE, y = ty * TILE;
    var cyc = T % 24, lift = cyc > 20 ? Math.pow((cyc - 20) / 4, 2) * 30 : 0;
    blitFoot('pad:' + tx + ':' + ty, x - 26, y - 14, 40, 28, 102, function () {
      island(x - 26, y - 14, 40, 28, 'concrete');
      bx(x - 22, y - 5, 8, 8, 0, 96, '#e2504a', { left: '#a8302a', right: '#c8403a' });
      for (var i = 1; i < 8; i++) { qL(x - 22, x - 14, y + 3, i * 12, i * 12 + 1.5); fill('#ffffff'); }
      bx(x - 24, y - 7, 12, 12, 96, 3, '#3b3653');
      var arm = P(x - 14, y - 1, 72), ab = P(x - 4, y, 72);
      fatLine(arm.x, arm.y, ab.x, ab.y, '#e2504a', 1.8);
      bx(x - 10, y - 10, 20, 20, 0, 4, '#8a84a8');
    }, 16);
    var s0 = X(x, y), g0 = Y(x, y, 4), rxx = 6 * RX;
    sprite('rocket', s0, g0 - lift, -12, -84, 24, 90, function () {
      c.translate(-s0, -g0);
      cyl(x, y, 6, 4, 60, '#f4f2fa', '#ffffff');
      c.fillStyle = '#e2508a'; c.fillRect(s0 - rxx, Y(x, y, 44), rxx * 2, 4);
      c.fillStyle = '#2bb8d8'; c.fillRect(s0 - rxx, Y(x, y, 24), rxx * 2, 3);
      pop('Q', s0, Y(x, y, 34), 6, '#6f57e0', 1.6);
      var tp = Y(x, y, 64);
      c.beginPath(); c.moveTo(s0 - rxx, tp); c.quadraticCurveTo(s0 - rxx * 0.6, tp - 14, s0, tp - 20);
      c.quadraticCurveTo(s0 + rxx * 0.6, tp - 14, s0 + rxx, tp); c.ellipse(s0, tp, rxx, 6 * RY, 0, 0, Math.PI);
      c.closePath(); fillSpan(cylGrad('#e2508a'), s0, rxx);
      c.fillStyle = '#6f57e0';
      c.beginPath(); c.moveTo(s0 - rxx, g0 - 12); c.lineTo(s0 - rxx - 6, g0 + 2); c.lineTo(s0 - rxx, g0); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(s0 + rxx, g0 - 12); c.lineTo(s0 + rxx + 6, g0 + 2); c.lineTo(s0 + rxx, g0); c.closePath(); c.fill();
    });
    var fb2 = g0 - lift;
    if (cyc > 18) {
      var fl = 10 + Math.sin(T * 30) * 3 + (cyc > 20 ? 10 : 0);
      c.beginPath(); c.moveTo(s0 - 3, fb2 + 2); c.lineTo(s0, fb2 + 2 + fl); c.lineTo(s0 + 3, fb2 + 2); c.closePath(); fill('#ffb020');
      c.beginPath(); c.moveTo(s0 - 1.5, fb2 + 2); c.lineTo(s0, fb2 + 2 + fl * 0.6); c.lineTo(s0 + 1.5, fb2 + 2); c.closePath(); fill('#fff2a0');
      glow(s0, fb2 + 6, 16, '#ffb020', 0.9);
    }
    puffs(s0 - 10, g0, 3, 14, 4, cyc > 18 ? 0.8 : 0.2, '#ffffff', 0.7, 0.3);
    puffs(s0 + 10, g0, 3, 14, 4, cyc > 18 ? 0.8 : 0.2, '#ffffff', 0.7, 0.6);
    var lt = P(x - 18, y - 1, 99), lit = Math.sin(T * 4) > 0;
    c.fillStyle = lit ? '#ff4a5a' : '#7a2030'; c.fillRect(lt.x - 1.5, lt.y - 1.5, 3, 3);
    if (lit) glow(lt.x, lt.y, 6, '#ff4a5a', 0.8);
  }
  function vis(tx, ty, r, hi) {
    var x = tx * TILE, y = ty * TILE;
    return visible(x - r, y - r, r * 2, r * 2, hi);
  }
  function backdropAlpha(r) {
    if (QT.G.roomOpen(r.id)) return 1;
    var prev = W.ROOMS[r.index - 1];
    return prev && QT.G.roomOpen(prev.id) ? 0.5 : 0;
  }
  function backdrop(id, fn) {
    on('backdrop', id, function (r, S, h) {
      if (DBG.nobd) return;
      var a = backdropAlpha(r);
      if (!a) return;
      begin(h, S);
      var ga = c.globalAlpha;
      c.globalAlpha = ga * a;
      try { fn(); } finally { c.globalAlpha = ga; }
    });
  }
  backdrop('plant', function () {
    if (vis(4, 71, 14, 130)) smokestack(4, 71, 48, 0.1);
    if (vis(6.5, 76, 14, 110)) smokestack(6.5, 76, 38, 0.55);
    if (vis(37, 70, 40, 90)) gantry(37, 68);
  });
  backdrop('service', function () {
    if (vis(7, 60, 30, 120)) coolingTower(7, 60, 22, 62);
    if (vis(43, 58, 24, 90)) waterTower(43, 58);
  });
  backdrop('outsrc', function () {
    if (vis(2, 48, 60, 120)) waferWheel(2, 48);
    if (vis(45, 43, 12, 90)) exhaust(45, 43, 48, '#2bb8d8');
    if (vis(47.5, 47, 12, 90)) exhaust(47.5, 47, 36, '#e2508a');
  });
  backdrop('cryo', function () {
    if (vis(5, 32, 20, 60)) heSphere(5, 32, 18);
    if (vis(9.5, 37.5, 16, 50)) heSphere(9.5, 37.5, 13);
    if (vis(44, 30, 30, 190)) rocket(44, 30);
  });
  var FLOW_COLS = ['#ffd23f', '#ff6fae', '#5fe0ff'];
  function flowArrows(r, S) {
    var pts = [], i;
    W.PIPELINE.forEach(function (id) {
      if (S.p[id].owned && QT.G.roomOpen(W.BY_ID[id].room)) pts.push(W.center(W.BY_ID[id]));
    });
    if (QT.G.roomOpen('plant')) pts.push(W.center(W.BY_ID.asm));
    if (pts.length < 2) return;
    var x0 = r.ix * TILE, x1 = (r.ix + r.iw) * TILE, y0 = r.iy * TILE, y1 = (r.iy + r.ih) * TILE;
    if (!visible(x0, y0, x1 - x0, y1 - y0, 10)) return;
    var gap = 22, off = (T * 26) % gap, acc = 0;
    for (var pass = 0; pass < FLOW_COLS.length; pass++) {
      c.beginPath();
      acc = 0;
      var n = 0;
      for (i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy);
        if (L < 1) continue;
        var ux = dx / L, uy = dy / L;
        var sxv = (ux - uy) * 0.62, syv = (ux + uy) * 0.33, sl = Math.sqrt(sxv * sxv + syv * syv);
        sxv /= sl; syv /= sl;
        for (var dpos = ((off - acc) % gap + gap) % gap; dpos < L; dpos += gap) {
          var k = Math.round((acc + dpos - off) / gap) + 3000;
          if (k % FLOW_COLS.length !== pass) continue;
          var wx = a.x + ux * dpos, wy = a.y + uy * dpos;
          if (wx < x0 || wx > x1 || wy < y0 || wy > y1) continue;
          var sx = X(wx, wy), sy = Y(wx, wy, 4.2);
          c.moveTo(sx - sxv * 2.4 - syv * 2.2, sy - syv * 2.4 + sxv * 2.2);
          c.lineTo(sx + sxv * 1.2, sy + syv * 1.2);
          c.lineTo(sx - sxv * 2.4 + syv * 2.2, sy - syv * 2.4 - sxv * 2.2);
          n++;
        }
        acc += L;
      }
      if (n) { c.strokeStyle = FLOW_COLS[pass]; c.lineWidth = 1.6; c.lineCap = 'butt'; c.lineJoin = 'miter'; c.stroke(); }
    }
  }
  ['plant', 'service', 'outsrc'].forEach(function (rid) {
    on('floor', rid, function (r, S, h) { begin(h, S); flowArrows(r, S); });
  });
  function agvDraw(x, y, col, cargo) {
    var s = P(x, y, 0);
    sprite('agv:' + col + ':' + cargo, s.x, s.y, -9, -12, 18, 16, function () {
      c.translate(-s.x, -s.y);
      shadowF(x - 5, y - 4, 10, 8, 0.2);
      bx(x - 5, y - 3.5, 10, 7, 0.8, 3, col, { top: sh(col, 40) });
      bx(x - 4.6, y - 3.1, 9.2, 6.2, 3.8, 0.6, '#3b3653');
      if (cargo === 'crate') bx(x - 3.5, y - 2.5, 7, 5, 4.4, 4.5, '#f2a63b', { top: '#ffc766' });
      else if (cargo === 'foup') bx(x - 3, y - 2.2, 6, 4.4, 4.4, 4.2, '#ff8ac0', { top: '#ffc2dd' });
      else if (cargo === 'he') { cyl(x, y, 2.4, 4.4, 7, '#e6f4ff', '#ffffff'); }
    });
    var lit = Math.sin(T * 6 + x * 0.1) > 0;
    c.fillStyle = lit ? '#ffd23f' : '#7a6020';
    c.fillRect(s.x - 1, s.y - (cargo === 'he' ? 12.8 : 9.8), 2, 2);
  }
  function agvScene(push, r, lane, list) {
    var y = (lane.y + lane.h - 0.5) * TILE, xa = (r.ix + 1) * TILE, xb = (r.ix + r.iw - 1) * TILE, span = xb - xa;
    list.forEach(function (a) {
      var t = ((T * a.speed + a.phase * span * 2) % (span * 2) + span * 2) % (span * 2);
      var x = t < span ? xa + t : xb - (t - span);
      push({ x: x - 5, y: y - 4, w: 10, h: 8, draw: function () {
        if (a.robot) { var s = P(x, y, 0); robot(s.x, s.y, 0.7, a.col, T + a.phase * 9, false); }
        else agvDraw(x, y, a.col, a.cargo);
      } });
    });
  }
  on('scene', 'plant', function (r, S, h, push) {
    begin(h, S);
    if (!r.roads || !r.roads[0]) return;
    agvScene(push, r, r.roads[0], [{ speed: 18, phase: 0, col: '#2bb8d8', cargo: 'crate' },
                                   { speed: 14, phase: 0.55, col: '#ef7d2e', cargo: 'crate' }]);
  });
  on('scene', 'outsrc', function (r, S, h, push) {
    begin(h, S);
    if (!r.roads || !r.roads[0]) return;
    agvScene(push, r, r.roads[0], [{ speed: 20, phase: 0.1, col: '#6f57e0', cargo: 'foup' },
                                   { speed: 16, phase: 0.6, col: '#2fbf7a', cargo: 'foup' }]);
  });
  on('scene', 'service', function (r, S, h, push) {
    begin(h, S);
    if (!r.roads || !r.roads[0]) return;
    agvScene(push, r, r.roads[0], [{ speed: 10, phase: 0.3, col: '#ef7d2e', robot: true }]);
  });
  on('scene', 'cryo', function (r, S, h, push) {
    begin(h, S);
    if (!r.roads || !r.roads[0]) return;
    agvScene(push, r, r.roads[0], [{ speed: 12, phase: 0.2, col: '#2bb8d8', cargo: 'he' }]);
  });
})(window.QT || (window.QT = {}));
