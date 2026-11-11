(function (QT) {
  'use strict';
  var on = QT.Art.scope('biz');
  var I = QT.Iso, A = I.A, B = I.B, TILE = 16;
  var RX = A * Math.SQRT2, RY = B * Math.SQRT2;
  var FONT = '"Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI",system-ui,sans-serif';
  var INK = '#2a1a40';
  var c = null;
  var now = 0;
  QT.L.add({
    biz_news1: ['量子コンピュータ、ついに実用化へ', 'QUANTUM COMPUTING GOES MAINSTREAM'],
    biz_news2: ['新興企業の上場ラッシュ続く', 'STARTUP IPO BOOM CONTINUES'],
    biz_news3: ['株価、過去最高値を更新', 'STOCKS HIT RECORD HIGH'],
    biz_news4: ['クビット数、世界記録を更新', 'NEW QUBIT WORLD RECORD']
  });
  function P(x, y, h) { return { x: (x - y) * A, y: (x + y) * B - (h || 0) }; }
  function box(x, y, w, d, base, hi, top, opt) { I.box(c, x, y, w, d, base, hi, top, opt); }
  function sh(col, amt) { return I.shade(col, amt); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hash(a, b, k) { var s = Math.sin(a * 12.9898 + b * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); }
  var FADE = 1;
  function ga(a) { c.globalAlpha = a * FADE; }
  function hsl(hh, s, l) { return 'hsl(' + (((Math.round(hh) % 360) + 360) % 360) + ',' + s + '%,' + l + '%)'; }
  function prism(pts, base, hi, col, opt) {
    opt = opt || {};
    var n = pts.length, i, a, b, area = 0;
    for (i = 0; i < n; i++) { a = pts[i]; b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    var sg = area > 0 ? 1 : -1, top = base + hi;
    if (hi > 0.01) {
      for (i = 0; i < n; i++) {
        a = pts[i]; b = pts[(i + 1) % n];
        var nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg, len = Math.sqrt(nx * nx + ny * ny) || 1;
        nx /= len; ny /= len;
        if (nx + ny <= 0.02) continue;
        var k = clamp((ny - nx + 1) / 2, 0, 1);
        c.fillStyle = opt.side ? opt.side(k) : sh(col, Math.round(-22 - 24 * k));
        var p0 = P(a[0], a[1], base), p1 = P(b[0], b[1], base), p2 = P(b[0], b[1], top), p3 = P(a[0], a[1], top);
        c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y);
        c.closePath(); c.fill();
      }
    }
    if (opt.noTop) return;
    c.beginPath();
    for (i = 0; i < n; i++) { var q = P(pts[i][0], pts[i][1], top); if (i) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
    c.closePath(); c.fillStyle = opt.top || col; c.fill();
    if (opt.stroke) { c.strokeStyle = opt.stroke; c.lineWidth = opt.lw || 0.8; c.stroke(); }
  }
  function rrect(x0, y0, x1, y1, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    var out = [], cs = [[x0, y0, Math.PI], [x1, y0, -Math.PI / 2], [x1, y1, 0], [x0, y1, Math.PI / 2]];
    for (var i = 0; i < 4; i++) {
      var rr = r[i], cx = cs[i][0] + (i === 0 || i === 3 ? rr : -rr), cy = cs[i][1] + (i < 2 ? rr : -rr);
      if (rr <= 0) { out.push([cs[i][0], cs[i][1]]); continue; }
      for (var s = 0; s <= 3; s++) {
        var a = cs[i][2] + s / 3 * Math.PI / 2;
        out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
    }
    return out;
  }
  function ngon(cx, cy, r, n, rot) {
    var out = [];
    for (var i = 0; i < n; i++) { var a = (rot || 0) + i / n * Math.PI * 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  }
  var gradCache = {};
  function cylGrad(col, rx) {
    var key = 'c' + col + '|' + Math.round(rx * 2);
    var g = gradCache[key];
    if (!g) {
      g = c.createLinearGradient(-rx, 0, rx, 0);
      g.addColorStop(0, sh(col, -52)); g.addColorStop(0.45, sh(col, -26));
      g.addColorStop(0.78, sh(col, -4)); g.addColorStop(1, sh(col, -30));
      gradCache[key] = g;
    }
    return g;
  }
  function cyl(x, y, r, base, hi, col, topCol) {
    var o = P(x, y, base), rx = r * RX, ry = r * RY, ty = o.y - hi;
    c.save(); c.translate(o.x, 0);
    c.beginPath(); c.moveTo(-rx, ty); c.lineTo(-rx, o.y);
    c.ellipse(0, o.y, rx, ry, 0, Math.PI, 0, true); c.lineTo(rx, ty); c.closePath();
    c.fillStyle = cylGrad(col, rx); c.fill();
    if (topCol !== false) { c.beginPath(); c.ellipse(0, ty, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = topCol || col; c.fill(); }
    c.restore();
  }
  function cylBands(x, y, r, base, hi, step, col, lw) {
    var o = P(x, y, base), rx = r * RX, ry = r * RY;
    c.beginPath();
    for (var h = step; h < hi - 1; h += step) { c.moveTo(o.x + rx, o.y - h); c.ellipse(o.x, o.y - h, rx, ry, 0, 0, Math.PI, false); }
    c.strokeStyle = col; c.lineWidth = lw || 1.6; c.stroke();
  }
  function dome(x, y, r, base, col, hs) {
    var o = P(x, y, base), rx = r * RX, ry = r * RY, hh = r * (hs || 0.95);
    var key = 'd' + col + '|' + Math.round(rx * 2);
    var g = gradCache[key];
    if (!g) {
      g = c.createRadialGradient(rx * 0.35, -hh * 0.55, rx * 0.1, 0, -hh * 0.2, rx * 1.35);
      g.addColorStop(0, sh(col, 70)); g.addColorStop(0.35, col); g.addColorStop(1, sh(col, -55));
      gradCache[key] = g;
    }
    c.save(); c.translate(o.x, o.y);
    c.beginPath(); c.moveTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI, false);
    c.ellipse(0, 0, rx, hh, 0, Math.PI, Math.PI * 2, false); c.closePath();
    c.fillStyle = g; c.fill();
    c.restore();
    return { x: o.x, y: o.y - hh };
  }
  function faceL(x0, y1, h) { var o = P(x0, y1, h); c.save(); c.transform(A, B, 0, 1, o.x, o.y); }
  function faceR(x1, y1, h) { var o = P(x1, y1, h); c.save(); c.transform(A, -B, 0, 1, o.x, o.y); }
  function face(side, a, b, h) { if (side === 'L') faceL(a, b, h); else faceR(a, b, h); }
  function tx(s, x, y, size, col, align, weight, halo, hw) {
    c.font = (weight || 800) + ' ' + size + 'px ' + FONT;
    c.textAlign = align || 'center'; c.textBaseline = 'middle';
    if (halo) { c.lineJoin = 'round'; c.lineWidth = hw || Math.max(2, size / 3.2); c.strokeStyle = halo; c.strokeText(s, x, y); }
    c.fillStyle = col; c.fillText(s, x, y);
  }
  var neonCache = {};
  function rrPath(x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function neon(s, x, y, size, col, align, flick, plate) {
    var key = s + '|' + size + '|' + col, e = neonCache[key];
    if (!e) {
      var sc = 4, cv = document.createElement('canvas'), g = cv.getContext('2d');
      g.font = '900 ' + size * sc + 'px ' + FONT;
      var w = g.measureText(s).width + size * sc, h = size * sc * 1.7;
      cv.width = Math.ceil(w); cv.height = Math.ceil(h);
      g.font = '900 ' + size * sc + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.globalAlpha = 0.35; g.lineWidth = size * sc * 0.55; g.strokeStyle = col; g.strokeText(s, w / 2, h / 2);
      g.globalAlpha = 1; g.lineWidth = size * sc * 0.2; g.strokeText(s, w / 2, h / 2);
      g.fillStyle = '#ffffff'; g.fillText(s, w / 2, h / 2);
      e = neonCache[key] = { cv: cv, w: w / sc, h: h / sc };
    }
    var a = c.globalAlpha, x0 = align === 'left' ? x - size / 2 : x - e.w / 2;
    if (plate) {
      rrPath(x0 + size * 0.1, y - size * 0.75, e.w - size * 0.2, size * 1.5, size * 0.4);
      c.fillStyle = '#1c1530'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = col; c.stroke();
    }
    c.globalAlpha = a * (flick == null ? 1 : 0.7 + 0.3 * flick);
    c.drawImage(e.cv, x0, y - e.h / 2, e.w, e.h);
    c.globalAlpha = a;
  }
  function heartPath(x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.95);
    c.bezierCurveTo(x - s * 1.5, y + s * 0.05, x - s * 0.95, y - s * 1.05, x, y - s * 0.38);
    c.bezierCurveTo(x + s * 0.95, y - s * 1.05, x + s * 1.5, y + s * 0.05, x, y + s * 0.95);
    c.closePath();
  }
  function sparkle(x, y, r, col) {
    c.beginPath();
    c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
    c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r);
    c.fillStyle = col; c.fill();
  }
  function starPath(x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function bulbRow(pts, r, onCol, offCol, speed, glow) {
    var ph = Math.floor(now * (speed || 8)), i, q, d = r * 1.6;
    c.beginPath();
    for (i = 0; i < pts.length; i++) if ((i + ph) % 3 !== 0) { q = pts[i]; c.rect(q.x - d / 2, q.y - d / 2, d, d); }
    c.fillStyle = offCol; c.fill();
    if (glow) {
      c.beginPath();
      for (i = 0; i < pts.length; i++) if ((i + ph) % 3 === 0) { q = pts[i]; c.rect(q.x - r * 2, q.y - r * 2, r * 4, r * 4); }
      ga(0.3); c.fillStyle = glow; c.fill(); ga(1);
    }
    c.beginPath();
    for (i = 0; i < pts.length; i++) if ((i + ph) % 3 === 0) { q = pts[i]; c.rect(q.x - r, q.y - r, r * 2, r * 2); }
    c.fillStyle = onCol; c.fill();
  }
  function linePts(x0, y0, h0, x1, y1, h1, n) {
    var out = [];
    for (var i = 0; i <= n; i++) { var k = i / n; out.push(P(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, h0 + (h1 - h0) * k)); }
    return out;
  }
  function windows(side, a, b, base, len, hi, cw, fh, lit, seed, dark, light, ww, wh) {
    face(side, a, b, base);
    var cols = Math.max(1, Math.floor(len / cw)), rows = Math.max(1, Math.floor((hi - 2) / fh));
    ww = ww || cw - 2; wh = wh || fh - 3;
    var ox = (len - cols * cw) / 2 + (cw - ww) / 2;
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (var r = 0; r < rows; r++)
        for (var k = 0; k < cols; k++)
          if ((hash(seed + (side === 'L' ? 0 : 50), r * 7 + k, 0) < lit) === (pass === 1)) c.rect(ox + k * cw, -(2 + r * fh + wh), ww, wh);
      c.fillStyle = pass ? light : dark; c.fill();
    }
    c.restore();
  }
  function beam(x, y, h, col, len) {
    var o = P(x, y, h), key = 'b' + col + len, g = gradCache[key];
    if (!g) { g = c.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); gradCache[key] = g; }
    c.save(); c.translate(o.x, o.y);
    ga(0.28 + 0.18 * Math.sin(now * 5));
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(-11, -len); c.lineTo(11, -len); c.lineTo(6, 0); c.closePath(); c.fill();
    c.restore();
  }
  function arrow(x, y, h, col) {
    var o = P(x, y, h + 8 + Math.abs(Math.sin(now * 4)) * 6);
    c.beginPath(); c.moveTo(o.x - 7, o.y - 8); c.lineTo(o.x + 7, o.y - 8); c.lineTo(o.x, o.y + 1); c.closePath();
    c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke();
  }
  var tickCache = {};
  function tickerImg(key, parts, size) {
    var lang = QT.L.get(), k2 = key + '|' + lang, e = tickCache[k2];
    if (e) return e;
    var sc = 3, cv = document.createElement('canvas'), g = cv.getContext('2d');
    g.font = '900 ' + size * sc + 'px ' + FONT;
    var w = 0, i;
    for (i = 0; i < parts.length; i++) w += g.measureText(parts[i][0]).width + size * sc * 1.6;
    cv.width = Math.ceil(w); cv.height = Math.ceil(size * sc * 1.5);
    g.font = '900 ' + size * sc + 'px ' + FONT; g.textBaseline = 'middle';
    var x = 0;
    for (i = 0; i < parts.length; i++) {
      g.fillStyle = parts[i][1]; g.fillText(parts[i][0], x, cv.height / 2 + sc);
      x += g.measureText(parts[i][0]).width + size * sc * 1.6;
    }
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (var yy = 0; yy < cv.height; yy += sc * 1.2) g.fillRect(0, yy, cv.width, sc * 0.35);
    e = tickCache[k2] = { cv: cv, w: cv.width / sc, h: cv.height / sc };
    return e;
  }
  function scroll(img, u0, len, vBottom, bh, speed) {
    c.beginPath(); c.rect(u0, vBottom - bh, len, bh); c.clip();
    var iw = img.w * (bh / img.h), off = (now * speed) % iw;
    for (var x = u0 - off; x < u0 + len; x += iw) c.drawImage(img.cv, x, vBottom - bh, iw, bh);
  }
  var spriteCache = {}, cur = null;
  function sprite(slot, state, X, Y, W, D, top, fn) {
    var tr = c.getTransform(), sc = tr.a;
    if (!(sc > 0)) return;
    var ex0 = (X - Y - D) * A - 34, ex1 = (X + W - Y) * A + 34, ey0 = (X + Y) * B - top - 30, ey1 = (X + W + Y + D) * B + 10;
    var k = state + '|' + sc.toFixed(3), e = spriteCache[slot];
    if (!e || e.k !== k) {
      var cv = e ? e.cv : document.createElement('canvas');
      cv.width = Math.ceil((ex1 - ex0) * sc); cv.height = Math.ceil((ey1 - ey0) * sc);
      var g = cv.getContext('2d'), save = c, fade = FADE;
      g.setTransform(sc, 0, 0, sc, -ex0 * sc, -ey0 * sc);
      c = g; FADE = 1;
      try { fn(); } finally { c = save; FADE = fade; }
      e = spriteCache[slot] = { k: k, cv: cv, ex0: ex0, ey0: ey0, box: opaqueBox(g, cv.width, cv.height) };
    }
    var b = e.box;
    if (!b) return;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(e.cv, b[0], b[1], b[2], b[3], Math.round(tr.a * e.ex0 + tr.e) + b[0], Math.round(tr.d * e.ey0 + tr.f) + b[1], b[2], b[3]);
    c.restore();
  }
  function opaqueBox(g, w, h) {
    var d;
    try { d = g.getImageData(0, 0, w, h).data; } catch (err) { return [0, 0, w, h]; }
    var x0 = w, x1 = -1, y0 = h, y1 = -1, x, y, i;
    for (y = 0; y < h; y++) {
      i = y * w * 4 + 3;
      for (x = 0; x < w; x++, i += 4) if (d[i]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
    }
    if (x1 < 0) return null;
    return [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
  }
  function still(fn, h) { var u = cur; sprite(u.id + '#' + (u.n++), u.state, u.X, u.Y, u.W, u.D, h || u.top, fn); }
  function hides(v, X, Y, px, py, ph) {
    var x0 = X + v[0] - 3, y0 = Y + v[1] - 3, x1 = X + v[2] + 3, y1 = Y + v[3] + 3;
    var lo = Math.max(x0 - px, y0 - py, 0.01), hi = Math.min(x1 - px, y1 - py, (v[4] - ph) / (2 * B));
    return lo <= hi;
  }
  var fadeK = {};
  function fadeFor(id, vols, X, Y, S) {
    var px = S.player.x, py = S.player.y, hit = false;
    for (var i = 0; i < vols.length && !hit; i++)
      if (hides(vols[i], X, Y, px, py, 4) || hides(vols[i], X, Y, px, py, 22)) hit = true;
    var k = fadeK[id] == null ? 1 : fadeK[id];
    k += ((hit ? 0.32 : 1) - k) * 0.22;
    if (Math.abs(k - 1) < 0.01) k = 1;
    fadeK[id] = k;
    return k;
  }
  function paint(H, id, state, X, Y, W, D, top, alpha, fn) {
    var a = H.toScreen(X, Y + D, 0), b = H.toScreen(X + W, Y, 0), t = H.toScreen(X, Y, top), d = H.toScreen(X + W, Y + D, 0);
    var m = 50 * H.z;
    if (b.x < -m || a.x > H.cssW + m || d.y < -m || t.y > H.cssH + m) return;
    cur = { id: id, state: state, X: X, Y: Y, W: W, D: D, top: top, n: 0 };
    c = H.ctx; FADE = alpha; c.globalAlpha = alpha;
    try { fn(); } finally { FADE = 1; c.globalAlpha = 1; }
  }
  function relOf(S, id) { var k = S.corps && S.corps[id]; return k ? (k.rel || 0) : 0; }
  function plaza(X, Y, col, floorCol) {
    box(X + 1, Y + 1, 78, 62, 0, 2, floorCol || '#f4f1ea', { left: '#d9d2c4', right: '#e6e0d3' });
    c.beginPath();
    var a = P(X + 3, Y + 61, 2.05), b = P(X + 77, Y + 61, 2.05), d = P(X + 77, Y + 3, 2.05);
    c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(d.x, d.y);
    c.strokeStyle = col; c.lineWidth = 1.6; c.stroke();
  }
  function outlineBands(pts, base, hi, step, col, lw) {
    var n = pts.length, i, area = 0;
    for (i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    var sg = area > 0 ? 1 : -1;
    c.beginPath();
    for (var h = base + step; h < base + hi - 0.5; h += step) {
      var pen = false;
      for (i = 0; i < n; i++) {
        var a2 = pts[i], b2 = pts[(i + 1) % n];
        if ((b2[1] - a2[1]) * sg - (b2[0] - a2[0]) * sg <= 0.02) { pen = false; continue; }
        var p0 = P(a2[0], a2[1], h), p1 = P(b2[0], b2[1], h);
        if (!pen) c.moveTo(p0.x, p0.y);
        c.lineTo(p1.x, p1.y); pen = true;
      }
    }
    c.strokeStyle = col; c.lineWidth = lw || 1; c.stroke();
  }
  function edgeWindows(pts, base, hi, fh, cw, wh, lit, seed, col) {
    var n = pts.length, i, area = 0, k = 0;
    for (i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    var sg = area > 0 ? 1 : -1, rows = Math.max(1, Math.floor((hi - 3) / fh));
    c.beginPath();
    for (i = 0; i < n; i++) {
      var p0 = pts[i], p1 = pts[(i + 1) % n];
      if ((p1[1] - p0[1]) * sg - (p1[0] - p0[0]) * sg <= 0.02) continue;
      var dx = p1[0] - p0[0], dy = p1[1] - p0[1], m = Math.floor(Math.sqrt(dx * dx + dy * dy) / cw);
      for (var j = 0; j < m; j++) {
        var t0 = (j + 0.2) / m, t1 = (j + 0.8) / m;
        for (var r = 0; r < rows; r++) {
          k++;
          if (hash(seed, k, 3) >= lit) continue;
          var h0 = base + 2 + r * fh, h1 = h0 + wh;
          var q0 = P(p0[0] + dx * t0, p0[1] + dy * t0, h0), q1 = P(p0[0] + dx * t1, p0[1] + dy * t1, h0);
          c.moveTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); c.lineTo(q1.x, q1.y - wh); c.lineTo(q0.x, q0.y - wh); c.closePath();
        }
      }
    }
    c.fillStyle = col; c.fill();
  }
  var heartCache = {};
  function heartImg(kind, s, dpr) {
    var key = kind + '|' + s.toFixed(2) + '|' + dpr, e = heartCache[key];
    if (e) return e;
    var cv = document.createElement('canvas'), sz = Math.ceil(s * 3.6 * dpr), g = cv.getContext('2d'), save = c;
    cv.width = sz; cv.height = sz;
    g.setTransform(dpr, 0, 0, dpr, sz / 2, sz / 2 + s * 0.1 * dpr);
    c = g;
    heartPath(0, 0, s); c.lineJoin = 'round';
    c.lineWidth = 3.2; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.stroke();
    c.fillStyle = '#ffffff'; c.fill();
    c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
    if (kind !== 'empty') {
      heartPath(0, 0, s * 0.74); c.fillStyle = kind === 'gold' ? '#ffc81e' : '#ff4f8b'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-s * 0.72, -s * 0.5, s * 0.45, s * 0.4);
    }
    c = save;
    e = heartCache[key] = { cv: cv, sz: sz / dpr };
    return e;
  }
  function heartsRow(cx, cy, fs, rel, dpr, pop) {
    var max = rel >= 9.99, s = fs * 0.36, gap = fs * 0.98, last = Math.ceil(rel / 2 - 1e-6) - 1;
    for (var i = 0; i < 5; i++) {
      var f = clamp(rel / 2 - i, 0, 1);
      var x = cx + (i - 2) * gap, y = cy + (f >= 1 ? Math.sin(now * 3 + i * 0.7) * 0.8 : 0);
      var k = pop > 0 && i === last ? 1 + 0.6 * pop * Math.abs(Math.sin((1 - pop) * 14)) : 1;
      var em = heartImg('empty', s, dpr), half = em.sz / 2 * k, sz = em.sz * k;
      if (f < 1) c.drawImage(em.cv, x - half, y - half, sz, sz);
      if (f > 0) {
        var full = heartImg(max ? 'gold' : 'pink', s, dpr);
        if (f >= 1) c.drawImage(full.cv, x - half, y - half, sz, sz);
        else c.drawImage(full.cv, 0, 0, full.cv.width * (0.1 + 0.8 * f), full.cv.height, x - half, y - half, sz * (0.1 + 0.8 * f), sz);
      }
      if (pop > 0 && i === last) sparkle(x + half * 0.8, y - half * 0.7, 2 + pop * 4, '#fff6b0');
    }
    if (max) sparkle(cx + (Math.floor(now * 2) % 5 - 2) * gap + s, cy - s, s * (0.8 + 0.4 * Math.sin(now * 9)), '#ffe45e');
  }
  function heartChip(cx, cy, fs, rel, dpr) {
    var s = fs * 0.42, em = heartImg('empty', s, dpr), full = heartImg(rel >= 9.99 ? 'gold' : 'pink', s, dpr);
    var half = em.sz / 2, k = rel > 0 ? 0.15 + 0.85 * clamp(rel / 10, 0, 1) : 0, h = full.cv.height, y0 = Math.floor(h * (0.79 - 0.55 * k));
    c.drawImage(em.cv, cx - half, cy - half, em.sz, em.sz);
    if (h - y0 > 0) c.drawImage(full.cv, 0, y0, full.cv.width, h - y0, cx - half, cy - half + em.sz * y0 / h, em.sz, em.sz * (h - y0) / h);
    if (rel >= 9.99) sparkle(cx + half * 0.7, cy - half * 0.6, 1.5 + Math.abs(Math.sin(now * 4)) * 2, '#fff6b0');
  }
  var relSeen = {}, relPop = {};
  function drawHearts(S, H) {
    c = H.ctx; now = S.t;
    var dpr = Math.round(c.getTransform().a / H.z * 100) / 100 || 1;
    var top = H.hudBottom(), fs = Math.max(10, Math.min(14, 3.9 * H.z)), px = S.player.x, py = S.player.y;
    c.save(); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalAlpha = 1;
    for (var i = 0; i < H.W.CORPS.length; i++) {
      var p = H.W.BY_ID[H.W.CORPS[i]], id = p.id, rel = relOf(S, id);
      if (relSeen[id] != null && rel > relSeen[id] + 1e-4) relPop[id] = S.t;
      relSeen[id] = rel;
      var wx = (p.x + p.w / 2) * TILE, wy = (p.y + p.h / 2) * TILE;
      var sp = H.toScreen(wx, wy, H.H_PLOT + 18);
      if (sp.y < top || sp.y > H.cssH || sp.x < -130 || sp.x > H.cssW + 130) continue;
      var pop = relPop[id] != null ? 1 - (S.t - relPop[id]) / 2.5 : 0;
      var near = (px - wx) * (px - wx) + (py - wy) * (py - wy) < 110 * 110;
      var tgt = (S.mission && S.mission.corp === id) || (S.deliv && S.deliv.corp === id);
      if (near || tgt || pop > 0) heartsRow(sp.x, sp.y + fs * 1.05, fs, rel, dpr, pop);
      else if (rel > 0.01) heartChip(sp.x, sp.y + fs * 1.05, fs, rel, dpr);
    }
    c.restore();
  }
  on('scene', 'biz', function (r, S, H, push) {
    push({ x: (r.ix + r.iw) * TILE + 2, y: (r.iy + r.ih) * TILE + 2, w: 1, h: 1, draw: function () { drawHearts(S, H); } });
  });
  function glitter(x, y, h, rel, spread) {
    if (rel < 7.5) return;
    var n = rel >= 9.99 ? 6 : 3;
    for (var i = 0; i < n; i++) {
      var ph = now * 1.3 + i * 1.7, k = ph - Math.floor(ph);
      var o = P(x, y, h + 4 + (i % 3) * 7);
      var sx = o.x + Math.sin(i * 2.4 + Math.floor(ph) * 1.3) * spread, sy = o.y - k * 10;
      sparkle(sx, sy, (1 - Math.abs(k - 0.5) * 2) * 3.4 + 0.4, i % 2 ? '#fff6b0' : '#ffffff');
    }
  }
  function targetMark(S, p, x, y, h) {
    var col = null;
    if (S.mission && S.mission.corp === p.id) col = '#f2a63b';
    else if (S.deliv && S.deliv.corp === p.id) col = '#ffd23f';
    if (!col) return;
    beam(x, y, h, col, 110);
    arrow(x, y, h, col);
  }
  function pole(x, y, h0, h1, col, lw) {
    var b0 = P(x, y, h0), b1 = P(x, y, h1);
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(b0.x, b0.y); c.lineTo(b1.x, b1.y); c.stroke();
  }
  var CORP = {};
  function carShape(cx, cy, base, ang, col, k) {
    k = k || 1;
    var ca = Math.cos(ang) * k, sa = Math.sin(ang) * k;
    function R(u, v) { return [cx + u * ca - v * sa, cy + u * sa + v * ca]; }
    c.fillStyle = '#1d1e28';
    var wh = [[-7, -5.5], [7, -5.5], [7, 5.5], [-7, 5.5]], rx = 2.4 * k, ry = 1.8 * k;
    c.beginPath();
    for (var i = 0; i < 4; i++) { var q = R(wh[i][0], wh[i][1]), o = P(q[0], q[1], base + 1.6 * k); c.moveTo(o.x + rx, o.y); c.ellipse(o.x, o.y, rx, ry, 0, 0, 7); }
    c.fill();
    prism([R(-11, -5.5), R(11, -5.5), R(11, 5.5), R(-11, 5.5)], base + 1.2 * k, 3.4 * k, col);
    prism([R(-6, -4.5), R(4, -4.5), R(4, 4.5), R(-6, 4.5)], base + 4.6 * k, 3.2 * k, col,
          { side: function (kk) { return kk > 0.5 ? '#5d7ea8' : '#8fb6de'; } });
    if (k < 0.7) return;
    var h1 = R(11.2, -3.3), h2 = R(11.2, 3.3), o1 = P(h1[0], h1[1], base + 3.2), o2 = P(h2[0], h2[1], base + 3.2);
    c.fillStyle = '#fff6b0'; c.fillRect(o1.x - 1, o1.y - 0.8, 2, 1.6); c.fillRect(o2.x - 1, o2.y - 0.8, 2, 1.6);
  }
  function carBadge(x, y, r, spin, rel) {
    var sx = Math.cos(spin), back = sx < 0;
    if (rel >= 4) {
      c.save(); c.translate(x, y); c.rotate(now * 0.8);
      c.fillStyle = 'rgba(255,200,80,0.35)';
      c.beginPath();
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; c.moveTo(0, 0); c.arc(0, 0, r * 1.6, a, a + 0.16); }
      c.fill(); c.restore();
    }
    c.save(); c.translate(x, y); c.scale(Math.max(0.08, Math.abs(sx)), 1);
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = rel >= 9.99 ? hsl(now * 120, 90, 60) : '#ef7d2e'; c.fill();
    c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.74, 0, 7); c.fillStyle = back ? '#c85f18' : '#2b2d3a'; c.fill();
    if (!back) {
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(-r * 0.55, r * 0.12); c.lineTo(-r * 0.5, -r * 0.08); c.lineTo(-r * 0.22, -r * 0.14);
      c.lineTo(-r * 0.08, -r * 0.34); c.lineTo(r * 0.24, -r * 0.34); c.lineTo(r * 0.42, -r * 0.1);
      c.lineTo(r * 0.58, -r * 0.05); c.lineTo(r * 0.58, r * 0.12); c.closePath(); c.fill();
      c.fillStyle = '#2b2d3a';
      c.beginPath(); c.arc(-r * 0.3, r * 0.14, r * 0.13, 0, 7); c.arc(r * 0.34, r * 0.14, r * 0.13, 0, 7); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-r * 0.6, r * 0.32, r * 1.2, r * 0.08);
    }
    c.restore();
  }
  function checkerFlag(x, y, h, w, hh, ph) {
    var o = P(x, y, h), n = 5, m = 3, i, j;
    function wv(u) { return Math.sin(now * 6 + ph + u * 4) * 2 * u; }
    c.beginPath();
    c.moveTo(o.x, o.y);
    for (i = 1; i <= n; i++) c.lineTo(o.x + i / n * w, o.y + wv(i / n));
    for (i = n; i >= 0; i--) c.lineTo(o.x + i / n * w, o.y + wv(i / n) + hh);
    c.closePath(); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath();
    for (i = 0; i < n; i++)
      for (j = 0; j < m; j++) {
        if ((i + j) % 2) continue;
        var u0 = i / n, u1 = (i + 1) / n, w0 = wv(u0), w1 = wv(u1);
        c.moveTo(o.x + u0 * w, o.y + w0 + j * hh / m); c.lineTo(o.x + u1 * w, o.y + w1 + j * hh / m);
        c.lineTo(o.x + u1 * w, o.y + w1 + (j + 1) * hh / m); c.lineTo(o.x + u0 * w, o.y + w0 + (j + 1) * hh / m);
        c.closePath();
      }
    c.fillStyle = '#20212c'; c.fill();
  }
  var SILO_COLS = ['#e2504a', '#ffd23f', '#35c8ff', '#7dff8a', '#ff5fd8', '#ffffff', '#8f7fe8'];
  var SHOW = [34, 18, 76, 60];
  CORP.c_auto = {
    ht: function (rel) { return 50 + rel * 6; },
    lv: function (rel) { return 2 + Math.floor(rel / 2); },
    height: function (rel) { return 2 + this.ht(rel) + 3 + 12 + 24; },
    vols: function (rel) { return [[4, 8, 30, 34, this.height(rel)], [5, 37, 27, 59, 8 + this.lv(rel) * 9], [34, 18, 76, 60, 24]]; },
    draw: function (X, Y, rel, S, p) {
      var col = '#ef7d2e', Ht = this.ht(rel), top = 2 + Ht, n = this.lv(rel), hs = n * 9, sx = X + 16, sy = Y + 48;
      var sr = rrect(X + SHOW[0], Y + SHOW[1], X + SHOW[2], Y + SHOW[3], [0, 0, 12, 0]);
      still(function () {
        plaza(X, Y, col, '#f1ede6');
        pole(X + 44, Y + 7, 2, 30, '#8b8fa3', 1.2);
        if (rel >= 2) pole(X + 74, Y + 9, 2, 30, '#8b8fa3', 1.2);
        box(X + 4, Y + 8, 26, 26, 2, Ht, '#f7f7fb', { left: '#dcdde6', right: '#eceef4' });
        windows('L', X + 4, Y + 34, 2, 26, Ht - 2, 26, 8, 0.25 + rel * 0.06, 11, '#3a4660', '#ffe7a6', 24, 4);
        windows('R', X + 30, Y + 34, 2, 26, Ht - 2, 26, 8, 0.25 + rel * 0.06, 12, '#46526e', '#ffe7a6', 24, 4);
        faceL(X + 4, Y + 34, 2); c.fillStyle = col; c.fillRect(6, -Ht, 3.5, Ht); c.fillStyle = '#20212c'; c.fillRect(10.5, -Ht, 2, Ht); c.restore();
        faceR(X + 30, Y + 34, 2); c.fillStyle = sh(col, -20); c.fillRect(15, -Ht, 3.5, Ht); c.fillStyle = '#20212c'; c.fillRect(19.5, -Ht, 2, Ht); c.restore();
        box(X + 3, Y + 7, 28, 28, top, 3, col);
        box(X + 9, Y + 13, 16, 16, top + 3, 2, '#20212c', { top: '#3a3d4e' });
        pole(X + 17, Y + 21, top + 5, top + 12, '#8b8fa3', 2);
        cyl(sx, sy, 11.5, 2, 2, '#d8dce8', '#eef0f6');
        cyl(sx, sy, 10, 4, hs, '#9fd0ea', false);
        for (var i = 0; i < n; i++) {
          var hb = 4 + i * 9, fo = P(sx, sy, hb);
          c.beginPath(); c.ellipse(fo.x, fo.y, 9.6 * RX, 9.6 * RY, 0, 0, 7); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill();
          carShape(sx, sy, hb, i * 1.3 + 0.6, SILO_COLS[i % SILO_COLS.length], 0.46);
        }
        cylBands(sx, sy, 10, 4, hs, 9, 'rgba(255,255,255,0.95)', 1.3);
        var so = P(sx, sy, 4);
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(so.x + 10 * RX * 0.3, so.y - hs, 10 * RX * 0.18, hs);
        cyl(sx, sy, 11, 4 + hs, 2.5, col, '#ffffff');
        cyl(sx, sy, 2.6, 6.5 + hs, 2.5, '#c9d3e6', '#ffd23f');
        prism(sr, 2, 1, '#e9eef6');
        box(X + SHOW[0], Y + SHOW[1], SHOW[2] - SHOW[0], 2, 3, 17, '#ffe1c4', { left: '#f7c79d' });
        faceL(X + SHOW[0], Y + SHOW[1] + 2, 3); c.fillStyle = col; c.fillRect(2, -14, SHOW[2] - SHOW[0] - 4, 3); c.fillStyle = '#20212c'; c.fillRect(2, -10.5, SHOW[2] - SHOW[0] - 4, 1.4); c.restore();
        box(X + SHOW[0], Y + SHOW[1] + 2, 2, SHOW[3] - SHOW[1] - 2, 3, 17, '#ffe9d4');
        var tt = P(X + 56, Y + 42, 3);
        c.beginPath(); c.ellipse(tt.x, tt.y, 12 * RX, 12 * RY, 0, 0, 7); c.fillStyle = '#2b2d3a'; c.fill();
      });
      var lk = 0.5 + 0.5 * Math.sin(now * 0.9), lo = P(sx, sy, 5 + lk * (hs - 3));
      c.beginPath(); c.ellipse(lo.x, lo.y, 10.4 * RX, 10.4 * RY, 0, 0, Math.PI); c.lineWidth = 2;
      c.strokeStyle = rel >= 5 ? hsl(now * 90, 95, 62) : '#ffb45e'; c.stroke();
      var bc = P(sx, sy, 10 + hs), ba = now * 3;
      ga(0.35); c.fillStyle = rel >= 7 ? hsl(now * 90, 95, 65) : '#ffe07a'; c.beginPath();
      for (var bw = 0; bw < 2; bw++) { var b0a = ba + bw * Math.PI; c.moveTo(bc.x, bc.y); c.lineTo(bc.x + Math.cos(b0a - 0.2) * 16, bc.y + Math.sin(b0a - 0.2) * 5); c.lineTo(bc.x + Math.cos(b0a + 0.2) * 16, bc.y + Math.sin(b0a + 0.2) * 5); c.closePath(); }
      c.fill(); ga(1);
      c.beginPath(); c.arc(bc.x, bc.y, 1.8, 0, 7); c.fillStyle = '#fff6c8'; c.fill();
      var tt2 = P(X + 56, Y + 42, 3);
      c.beginPath(); c.ellipse(tt2.x, tt2.y, 12 * RX, 12 * RY, 0, 0, 7);
      c.lineWidth = 1.4; c.strokeStyle = rel >= 5 ? hsl(now * 90, 95, 62) : '#ffb45e'; c.stroke();
      c.beginPath();
      for (var li = 0; li < 8; li++) {
        var la = now * 0.9 + li / 8 * Math.PI * 2;
        c.rect(tt2.x + Math.cos(la) * 12 * RX * 0.92 - 0.8, tt2.y + Math.sin(la) * 12 * RY * 0.92 - 0.8, 1.6, 1.6);
      }
      c.fillStyle = '#ffe07a'; c.fill();
      carShape(X + 56, Y + 42, 3, now * 0.9, rel >= 9.99 ? '#ffc81e' : '#e2504a');
      still(function () {
        prism(sr, 3, 11, '#bfe8ff', { noTop: true, side: function (k) { return k > 0.5 ? 'rgba(170,220,250,0.3)' : 'rgba(150,205,240,0.36)'; } });
        faceL(X + SHOW[0], Y + SHOW[3], 3);
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.8; c.beginPath();
        for (var m = 0; m <= 30; m += 10) { c.moveTo(m, 0); c.lineTo(m, -11); }
        c.stroke(); c.restore();
        prism(sr, 14, 5, '#20212c', { side: function (k) { return k > 0.5 ? '#2b2d3a' : '#20212c'; }, noTop: true });
        prism(sr, 19, 2, col, { top: '#ffffff' });
        var tc = P(X + 55, Y + 39, 21.05);
        c.beginPath(); c.ellipse(tc.x, tc.y, 16.5 * RX, 16.5 * RY, 0, 0, 7); c.ellipse(tc.x, tc.y, 11.5 * RX, 11.5 * RY, 0, 0, 7);
        c.fillStyle = '#4a4d5e'; c.fill('evenodd');
        c.beginPath(); c.ellipse(tc.x, tc.y, 14 * RX, 14 * RY, 0, 0, 7); c.setLineDash([2, 2]); c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.stroke(); c.setLineDash([]);
        c.beginPath(); c.ellipse(tc.x, tc.y, 16.5 * RX, 16.5 * RY, 0, 0, 7); c.strokeStyle = '#e2504a'; c.lineWidth = 1; c.stroke();
        c.beginPath(); c.ellipse(tc.x, tc.y, 11.5 * RX, 11.5 * RY, 0, 0, 7); c.fillStyle = '#8fd46a'; c.fill();
        for (var q = 0; q < 5; q++) { var a0 = P(X + 55 + 11.5 + q, Y + 39, 21.1), a1 = P(X + 55 + 12.5 + q, Y + 39, 21.1); c.fillStyle = q % 2 ? '#ffffff' : '#20212c'; c.fillRect(a0.x, a0.y - 1, a1.x - a0.x, 2); }
      }, 26);
      var nc = rel >= 6 ? 2 : 1;
      for (var ci = 0; ci < nc; ci++) {
        var th = now * 1.7 + ci * Math.PI;
        carShape(X + 55 + Math.cos(th) * 14, Y + 39 + Math.sin(th) * 14, 21, th + Math.PI / 2, ci ? '#35c8ff' : (rel >= 9.99 ? '#ffc81e' : '#ffd23f'), 0.5);
      }
      faceL(X + SHOW[0], Y + SHOW[3], 3);
      var gl = (now * 14) % 60 - 12;
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.moveTo(gl, 0); c.lineTo(gl + 4, 0); c.lineTo(gl + 10, -11); c.lineTo(gl + 6, -11); c.closePath(); c.fill();
      c.restore();
      faceL(X + SHOW[0], Y + SHOW[3], 14);
      neon('QMOTORS', 18, -2.6, 5.2, '#ff7a1a', 'center', 0.8 + 0.2 * Math.sin(now * 7));
      c.restore();
      if (rel >= 3) bulbRow(linePts(X + 3, Y + 35, top + 1.5, X + 31, Y + 35, top + 1.5, 10)
                           .concat(linePts(X + 31, Y + 35, top + 1.5, X + 31, Y + 7, top + 1.5, 10)), 0.9, '#fff3b0', '#8a5a2c', 8, rel >= 6 ? '#ffd23f' : null);
      var e1 = P(X + 17, Y + 21, top + 12);
      carBadge(e1.x, e1.y - 9, 10 + rel * 0.35, now * 1.4, rel);
      checkerFlag(X + 44, Y + 7, 30, 13, 8, 0);
      if (rel >= 2) checkerFlag(X + 74, Y + 9, 30, 13, 8, 1.3);
      glitter(X + 17, Y + 21, top + 20, rel, 20);
      targetMark(S, p, X + 17, Y + 21, top + 30);
    }
  };
  function crystal(cx, cy, r, base, hi, col, tipK) {
    var pts = ngon(cx, cy, r, 6, Math.PI / 6);
    prism(pts, base, hi, col, { noTop: true, side: function (k) { return sh(col, Math.round(-8 - 34 * k)); } });
    var apex = P(cx, cy, base + hi + r * (tipK || 1.4)), top = base + hi, i, list = [];
    for (i = 0; i < 6; i++) {
      var a = pts[i], b = pts[(i + 1) % 6], mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy;
      if (mx + my < -r * 0.9) continue;
      list.push({ a: a, b: b, d: mx + my });
    }
    list.sort(function (p1, p2) { return p1.d - p2.d; });
    for (i = 0; i < list.length; i++) {
      var e = list[i], pa = P(e.a[0], e.a[1], top), pb = P(e.b[0], e.b[1], top);
      c.beginPath(); c.moveTo(pa.x, pa.y); c.lineTo(pb.x, pb.y); c.lineTo(apex.x, apex.y); c.closePath();
      c.fillStyle = sh(col, Math.round(40 - (e.d / r + 1) * 22)); c.fill();
    }
    var fr = P(cx + r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6), base);
    var fr2 = P(cx + r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6), top);
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(fr.x, fr.y); c.lineTo(fr2.x, fr2.y); c.lineTo(apex.x, apex.y); c.stroke();
    return apex;
  }
  var ATOMS = [[0, 0, 0, 4, '#2fbf7a'], [8, 0, 3, 3, '#ffffff'], [-4, 7, 3, 3, '#e2504a'], [-4, -7, 3, 3, '#4f8bff'], [0, 0, -8, 3, '#ffd23f']];
  function molecule(x, y, h, spin, scale) {
    var pts = [], ca = Math.cos(spin), sa = Math.sin(spin), i;
    for (i = 0; i < ATOMS.length; i++) {
      var a = ATOMS[i], u = (a[0] * ca - a[1] * sa) * scale, v = (a[0] * sa + a[1] * ca) * scale;
      var q = P(x + u, y + v, h + a[2] * scale);
      pts.push({ x: q.x, y: q.y, d: u + v, r: a[3] * scale, col: a[4] });
    }
    c.strokeStyle = '#cfd6e2'; c.lineWidth = 1.6 * scale; c.beginPath();
    for (i = 1; i < pts.length; i++) { c.moveTo(pts[0].x, pts[0].y); c.lineTo(pts[i].x, pts[i].y); }
    c.stroke();
    pts.sort(function (p1, p2) { return p1.d - p2.d; });
    for (i = 0; i < pts.length; i++) {
      var e = pts[i];
      c.beginPath(); c.arc(e.x, e.y, e.r, 0, 7); c.fillStyle = e.col; c.fill();
      c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(e.x - e.r * 0.6, e.y - e.r * 0.6, e.r * 0.5, e.r * 0.5);
    }
  }
  var MAT_CRYSTALS = [
    { x: 12, y: 7, r: 7, k: 0.62, cap: 999, col: '#39c6d6', need: 0 },
    { x: 62, y: 13, r: 8, k: 0.55, cap: 34, col: '#8f7fe8', need: 0 },
    { x: 26, y: 23, r: 11, k: 1, cap: 999, col: '#1fbf8f', need: 0 },
    { x: 8, y: 30, r: 6, k: 0.42, cap: 46, col: '#4fd6c0', need: 6 },
    { x: 45, y: 28, r: 6, k: 0.5, cap: 999, col: '#9be15d', need: 3 },
    { x: 69, y: 30, r: 5, k: 0.4, cap: 44, col: '#ff8ad8', need: 8 }
  ];
  function crystalH(e, Hm) { return Math.min(e.cap, Hm * e.k); }
  CORP.c_mat = {
    hm: function (rel) { return 44 + rel * 6.5; },
    height: function (rel) { return 2 + this.hm(rel) + 18 + 10; },
    vols: function (rel) { return [[15, 12, 37, 34, this.height(rel)], [5, 0, 19, 14, 2 + this.hm(rel) * 0.62 + 11], [6, 40, 74, 60, 14]]; },
    draw: function (X, Y, rel, S, p) {
      var Hm = this.hm(rel), tips = [], i;
      for (i = 0; i < MAT_CRYSTALS.length; i++) {
        var e = MAT_CRYSTALS[i];
        if (rel >= e.need) tips.push(P(X + e.x, Y + e.y, 2 + crystalH(e, Hm) + e.r * 1.5));
      }
      still(function () {
        plaza(X, Y, '#2fbf7a', '#eef4ee');
        for (var k = 0; k < MAT_CRYSTALS.length; k++) {
          var e2 = MAT_CRYSTALS[k];
          if (rel >= e2.need) crystal(X + e2.x, Y + e2.y, e2.r, 2, crystalH(e2, Hm), e2.col, 1.5);
        }
      });
      if (rel >= 4) {
        ga(0.2 * (0.5 + 0.5 * Math.sin(now * 2.2)));
        prism(ngon(X + 26, Y + 23, 11, 6, Math.PI / 6), 2, Hm, '#ffffff', { noTop: true, side: function () { return '#ffffff'; } });
        ga(1);
      }
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (var g = 0; g < 4; g++) {
        var kk = (now * 0.35 + g * 0.25) % 1, gp = P(X + 28 + (g - 1.5) * 3, Y + 30, 16 + kk * (Hm - 14));
        c.fillRect(gp.x - 0.8, gp.y - 0.8, 1.6, 1.6);
      }
      if (rel >= 5) {
        var ng = 3 + Math.floor((rel - 5) / 2), ctop = 2 + Hm + 6;
        for (var gi = 0; gi < ng; gi++) {
          var ga2 = now * 1.4 + gi / ng * Math.PI * 2, gpos = P(X + 26 + Math.cos(ga2) * 11, Y + 23 + Math.sin(ga2) * 11, ctop + Math.sin(ga2 * 2) * 2);
          var gs = 2.2;
          c.beginPath(); c.moveTo(gpos.x, gpos.y - gs * 1.3); c.lineTo(gpos.x + gs, gpos.y); c.lineTo(gpos.x, gpos.y + gs * 1.3); c.lineTo(gpos.x - gs, gpos.y); c.closePath();
          c.fillStyle = rel >= 9 ? hsl(now * 120 + gi * 60, 90, 62) : ['#ff5fd8', '#35f0ff', '#ffe45e'][gi % 3]; c.fill();
          c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
        }
      }
      still(function () {
        var lab = rrect(X + 6, Y + 40, X + 74, Y + 60, [0, 0, 7, 7]);
        prism(lab, 2, 3, '#ffffff');
        prism(rrect(X + 7, Y + 41, X + 73, Y + 59, [0, 0, 6, 6]), 5, 5, '#7fe0b8', { side: function (k) { return k > 0.5 ? 'rgba(60,170,130,0.95)' : 'rgba(110,210,170,0.95)'; } });
        prism(lab, 10, 2.2, '#2fbf7a', { top: '#ffffff' });
        pole(X + 60, Y + 50, 12.2, 22, '#b9c2d0', 1.4);
      }, 24);
      faceL(X + 6, Y + 60, 5);
      c.fillStyle = 'rgba(255,255,255,0.55)';
      var gl = (now * 12) % 100 - 20;
      c.beginPath(); c.moveTo(gl, 0); c.lineTo(gl + 4, 0); c.lineTo(gl + 9, -5); c.lineTo(gl + 5, -5); c.closePath(); c.fill();
      c.restore();
      faceL(X + 6, Y + 60, 12.2);
      neon('MATERIALS', 30, -5.2, 6.2, '#2fe39a', 'center', 0.85 + 0.15 * Math.sin(now * 5), true);
      c.restore();
      molecule(X + 60, Y + 50, 30 + Math.sin(now * 1.6) * 2, now * 1.2, 1 + rel * 0.03);
      for (var t2 = 0; t2 < tips.length; t2++) {
        var ph = now * 1.7 + t2 * 1.3, k2 = ph - Math.floor(ph);
        if (k2 < 0.5) sparkle(tips[t2].x, tips[t2].y - 1, (0.5 - Math.abs(k2 - 0.25) * 2) * 7 + 0.5, '#ffffff');
      }
      glitter(X + 26, Y + 23, 2 + Hm + 12, rel, 22);
      targetMark(S, p, X + 26, Y + 23, 2 + Hm + 18);
    }
  };
  var IT_T = [28, 4, 76, 38, 10];
  CORP.c_it = {
    ht: function (rel) { return 72 + rel * 5.5; },
    height: function (rel) { return 2 + this.ht(rel) + 5 + 22 + rel * 1.2 + 6; },
    vols: function (rel) { return [[28, 4, 76, 38, this.height(rel)], [6, 42, 74, 60, 22]]; },
    draw: function (X, Y, rel, S, p) {
      var Ht = this.ht(rel), top = 2 + Ht, col = '#3f86d6', hb = top - 17, mh = 22 + rel * 1.2;
      var x0 = X + IT_T[0], y0 = Y + IT_T[1], x1 = X + IT_T[2], y1 = Y + IT_T[3], rr = IT_T[4], cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var tw = rrect(x0, y0, x1, y1, rr);
      still(function () {
        plaza(X, Y, '#2bb8d8', '#eaf2f6');
        prism(tw, 2, Ht, col, { side: function (k) { return k > 0.5 ? '#2e5f9e' : '#4a8fd8'; }, top: '#9fd8ff' });
        outlineBands(tw, 2, Ht, 6, 'rgba(170,225,255,0.55)', 0.8);
        windows('L', x0 + rr, y1, 2, x1 - x0 - rr * 2, Ht - 2, 4, 6, 0.3 + rel * 0.055, 21, 'rgba(0,0,0,0)', '#fff1a8', 2.2, 2.6);
        windows('R', x1, y1 - rr, 2, y1 - y0 - rr * 2, Ht - 2, 4, 6, 0.3 + rel * 0.055, 22, 'rgba(0,0,0,0)', '#fff1a8', 2.2, 2.6);
        prism(rrect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, rr + 0.5), hb, 6, '#14172a', { top: '#2a2f4a' });
        prism(rrect(x0 + 6, y0 + 6, x1 - 6, y1 - 6, 6), top, 5, '#7fe7ff', { top: '#d8f8ff' });
        box(cx - 1.5, cy - 1.5, 3, 3, top + 5, mh, '#c9d3e6');
        box(cx - 3.5, cy - 3.5, 7, 7, top + 5 + mh * 0.45, 1.5, '#9aa6c0');
        var lb = rrect(X + 6, Y + 42, X + 74, Y + 60, [0, 0, 8, 8]);
        prism(lb, 2, 1.5, '#ffffff');
        prism(rrect(X + 7, Y + 42, X + 73, Y + 59, [0, 0, 7, 7]), 3.5, 8, '#8fe3f5',
              { side: function (k) { return k > 0.5 ? 'rgba(70,170,210,0.95)' : 'rgba(130,215,240,0.95)'; }, noTop: true });
        prism(lb, 11.5, 2.5, '#ffffff', { top: '#f4fbff' });
        faceL(X + 6, Y + 60, 3.5);
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.7; c.beginPath();
        for (var m = 10; m < 64; m += 9) { c.moveTo(m, 0); c.lineTo(m, -8); }
        c.stroke();
        c.restore();
        if (rel >= 6) pole(X + 64, Y + 51, 14, 20, '#8b8fa3', 1.2);
      });
      faceL(x0 + rr, y1, 2);
      c.beginPath(); c.rect(0, -hb + 2, x1 - x0 - rr * 2, hb - 14); c.clip();
      c.fillStyle = 'rgba(255,255,255,0.22)';
      var gy = -((now * 22) % (Ht + 60)) + 20;
      c.beginPath(); c.moveTo(0, gy); c.lineTo(28, gy - 16); c.lineTo(28, gy - 26); c.lineTo(0, gy - 10); c.closePath(); c.fill();
      c.restore();
      var cor = [[x0 + rr - rr * 0.707, y1 - rr + rr * 0.707], [x1 - rr + rr * 0.707, y1 - rr + rr * 0.707], [x1 - rr + rr * 0.707, y0 + rr - rr * 0.707]];
      c.lineWidth = 1.4;
      for (var ci = 0; ci < 3; ci++) {
        var b0 = P(cor[ci][0], cor[ci][1], 3), b1 = P(cor[ci][0], cor[ci][1], hb);
        c.strokeStyle = rel >= 3 ? hsl(now * 80 + ci * 120, 95, 66) : 'rgba(200,245,255,0.9)';
        c.beginPath(); c.moveTo(b0.x, b0.y); c.lineTo(b1.x, b1.y); c.stroke();
        if (rel >= 5) {
          for (var pk = 0; pk < 2; pk++) {
            var kq = (now * 0.45 + pk * 0.5 + ci * 0.21) % 1, pq = P(cor[ci][0], cor[ci][1], 3 + kq * (hb - 6));
            c.fillStyle = '#ffffff'; c.fillRect(pq.x - 1.2, pq.y - 3, 2.4, 6);
          }
        }
      }
      var img = tickerImg('it', [['Q-NET', '#35f0ff'], ['5G ▲', '#ff5fd8'], ['AI CLOUD', '#ffe45e'], ['QUANTUM ▲', '#7dff8a']], 6);
      faceL(x0 + rr - 0.5, y1 + 1, hb); scroll(img, 0, x1 - x0 - rr * 2 + 1, -0.5, 5, 18); c.restore();
      faceR(x1 + 1, y1 - rr + 0.5, hb); scroll(img, 0, y1 - y0 - rr * 2 + 1, -0.5, 5, 18); c.restore();
      var tip = P(cx, cy, top + 5 + mh + 2), blink = Math.sin(now * 5) > 0;
      c.beginPath(); c.arc(tip.x, tip.y, 2.2, 0, 7); c.fillStyle = blink ? '#ff3b4f' : '#7a2330'; c.fill();
      if (blink) { ga(0.35); c.beginPath(); c.arc(tip.x, tip.y, 5, 0, 7); c.fill(); ga(1); }
      c.lineCap = 'round'; c.lineWidth = 1.8;
      var nw = rel >= 4 ? 3 : 2;
      for (var wv = 0; wv < nw; wv++) {
        var k = (now * 0.8 + wv / nw) % 1, rw = 5 + k * 16;
        ga(1 - k);
        c.strokeStyle = rel >= 8 ? hsl(now * 150 + wv * 90, 95, 62) : (wv % 2 ? '#ff5fd8' : '#35f0ff');
        c.beginPath(); c.arc(tip.x, tip.y, rw, -Math.PI * 0.85, -Math.PI * 0.55);
        c.moveTo(tip.x + Math.cos(-Math.PI * 0.45) * rw, tip.y + Math.sin(-Math.PI * 0.45) * rw);
        c.arc(tip.x, tip.y, rw, -Math.PI * 0.45, -Math.PI * 0.15); c.stroke();
      }
      ga(1);
      if (rel >= 4) {
        var ro = P(cx, cy, top + 9 + Math.sin(now * 2) * 1.5);
        c.lineWidth = 2; c.strokeStyle = rel >= 8 ? hsl(now * 90, 95, 65) : '#ff5fd8';
        ga(0.85); c.beginPath(); c.ellipse(ro.x, ro.y, 21 * RX, 21 * RY, 0, 0, 7); c.stroke(); ga(1);
      }
      faceL(X + 6, Y + 60, 14);
      neon('Q-NET', 30, -5, 7, '#2bd8ff', 'center', 0.85 + 0.15 * Math.sin(now * 6), true);
      c.restore();
      if (rel >= 6) {
        var dp = P(X + 64, Y + 51, 20);
        c.save(); c.translate(dp.x, dp.y - 2); c.rotate(-0.5 + Math.sin(now * 0.7) * 0.3);
        c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fillStyle = '#eef3fb'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -5); c.stroke();
        c.restore();
      }
      glitter(cx, cy, top + 10, rel, 26);
      targetMark(S, p, cx, cy, top + 5 + mh);
    }
  };
  function hcylX(x0, x1, y, h, r, col, capCol) {
    var n = 14, i, a = [], b = [];
    for (i = 0; i < n; i++) { var f = i / n * Math.PI * 2; a.push(P(x0, y + r * Math.cos(f), h + r * Math.sin(f))); b.push(P(x1, y + r * Math.cos(f), h + r * Math.sin(f))); }
    var nx = -B, ny = A, hi = 0, lo = 0, dh = -1e9, dl = 1e9;
    for (i = 0; i < n; i++) { var d = a[i].x * nx + a[i].y * ny; if (d > dh) { dh = d; hi = i; } if (d < dl) { dl = d; lo = i; } }
    c.beginPath(); c.moveTo(a[hi].x, a[hi].y); c.lineTo(b[hi].x, b[hi].y); c.lineTo(b[lo].x, b[lo].y); c.lineTo(a[lo].x, a[lo].y); c.closePath();
    c.fillStyle = sh(col, -18); c.fill();
    c.beginPath(); for (i = 0; i < n; i++) { if (i) c.lineTo(b[i].x, b[i].y); else c.moveTo(b[i].x, b[i].y); } c.closePath();
    c.fillStyle = capCol || col; c.fill(); c.lineWidth = 0.8; c.strokeStyle = sh(col, -50); c.stroke();
  }
  function globe(x, y, r, rel) {
    c.save();
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = '#2f8fe0'; c.fill();
    c.clip();
    c.fillStyle = '#5fd07a';
    var off = (now * 6) % (r * 4);
    c.beginPath();
    for (var k = -1; k < 2; k++) {
      var bx = x - r * 2 + off + k * r * 4;
      c.moveTo(bx - r * 0.3 + r * 0.55, y - r * 0.35); c.ellipse(bx - r * 0.3, y - r * 0.35, r * 0.55, r * 0.35, 0.4, 0, 7);
      c.moveTo(bx + r * 0.2 + r * 0.3, y + r * 0.35); c.ellipse(bx + r * 0.2, y + r * 0.35, r * 0.3, r * 0.45, -0.2, 0, 7);
      c.moveTo(bx + r * 1.5 + r * 0.6, y - r * 0.15); c.ellipse(bx + r * 1.5, y - r * 0.15, r * 0.6, r * 0.3, 0.1, 0, 7);
      c.moveTo(bx + r * 1.7 + r * 0.25, y + r * 0.5); c.ellipse(bx + r * 1.7, y + r * 0.5, r * 0.25, r * 0.2, 0, 0, 7);
    }
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.4, r * 0.45, 0, 7); c.fill();
    c.restore();
    c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 2; c.strokeStyle = rel >= 7 ? hsl(now * 80, 90, 62) : '#ffc81e';
    c.beginPath(); c.ellipse(x, y, r * 1.55, r * 0.45, -0.25, 0, Math.PI); c.stroke();
  }
  var bladeCache = {};
  function bladeImg(s, size, col) {
    var key = s + '|' + size + '|' + col, e = bladeCache[key];
    if (e) return e;
    var sc = 4, n = s.length, w = size * 1.7, h = size * 1.12 * n + size * 0.9;
    var cv = document.createElement('canvas'), g = cv.getContext('2d');
    cv.width = Math.ceil(w * sc); cv.height = Math.ceil(h * sc);
    g.scale(sc, sc);
    g.fillStyle = '#1c1530'; g.strokeStyle = col; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(1, 1 + 2); g.arcTo(w - 1, 1, w - 1, h - 1, 2); g.arcTo(w - 1, h - 1, 1, h - 1, 2); g.arcTo(1, h - 1, 1, 1, 2); g.arcTo(1, 1, w - 1, 1, 2); g.closePath();
    g.fill(); g.stroke();
    g.font = '900 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (var i = 0; i < n; i++) {
      var y = size * 0.95 + i * size * 1.12;
      g.globalAlpha = 0.45; g.lineWidth = size * 0.45; g.strokeStyle = col; g.strokeText(s[i], w / 2, y);
      g.globalAlpha = 1; g.lineWidth = size * 0.16; g.strokeText(s[i], w / 2, y);
      g.fillStyle = '#ffffff'; g.fillText(s[i], w / 2, y);
    }
    e = bladeCache[key] = { cv: cv, w: w, h: h };
    return e;
  }
  CORP.c_news = {
    ht: function (rel) { return 44 + rel * 3.2; },
    height: function (rel) { return 2 + this.ht(rel) + 12 + 6 + 22; },
    vols: function (rel) { return [[30, 18, 76, 58, 22], [32, 50, 74, 58, 32], [4, 30, 28, 58, this.height(rel)]]; },
    draw: function (X, Y, rel, S, p) {
      var pink = '#e2508a', cream = '#f7ecd6', Ht = this.ht(rel), top = 2 + Ht;
      var tx0 = X + 4, ty0 = Y + 30, tw = 24, td = 28, gx = tx0 + 12, gy = ty0 + 14, gtop = top + 12;
      still(function () {
        plaza(X, Y, pink, '#f3ece6');
        box(X + 30, Y + 18, 46, 40, 2, 19, cream, { left: '#e2cfae', right: '#ecdcc0' });
        windows('L', X + 30, Y + 58, 2, 46, 10, 7.5, 10.5, 0.35 + rel * 0.05, 31, '#5a4a66', '#ffe39a', 4.5, 7);
        windows('R', X + 76, Y + 58, 2, 40, 10, 7.5, 10.5, 0.35 + rel * 0.05, 32, '#5a4a66', '#ffe39a', 4.5, 7);
        box(X + 29.5, Y + 17.5, 47, 41, 12.5, 6.5, '#191522', { top: '#2a2438' });
        box(X + 29, Y + 17, 48, 42, 19, 2.5, pink);
        box(tx0, ty0, tw, td, 2, Ht, '#fbf3e3', { left: '#e8d6b6', right: '#f1e4ca' });
        windows('L', tx0, ty0 + td, 2, tw, Ht, 6, 7, 0.3 + rel * 0.06, 33, '#4b3f5c', '#ffe39a', 3.5, 4);
        windows('R', tx0 + tw, ty0 + td, 2, td, Ht, 6.5, 7, 0.3 + rel * 0.06, 34, '#4b3f5c', '#ffe39a', 3.5, 4);
        faceL(tx0, ty0 + td, 2); c.fillStyle = pink;
        for (var pl = 0; pl <= tw; pl += 8) c.fillRect(pl - 1, -Ht, 2, Ht);
        c.restore();
        faceR(tx0 + tw, ty0 + td, 2); c.fillStyle = sh(pink, -15);
        for (var pr = 0; pr <= td; pr += 9.3) c.fillRect(pr - 1, -Ht, 2, Ht);
        c.restore();
        box(tx0 - 1, ty0 - 1, tw + 2, td + 2, top, 2.5, pink);
        box(tx0 + 3, ty0 + 4, tw - 6, td - 8, top + 2.5, 5, '#fbf3e3');
        box(tx0 + 2, ty0 + 3, tw - 4, td - 6, top + 7.5, 1.5, pink);
        box(tx0 + 7, ty0 + 8, tw - 14, td - 16, top + 9, 3, '#fbf3e3');
        box(gx - 1.5, gy - 1.5, 3, 3, gtop, 6, '#c9b48a');
        box(X + 32, Y + 51, 42, 5.5, 21.5, 3.5, '#7b7f93', { top: '#9aa0b5' });
        hcylX(X + 34, X + 72, Y + 53.75, 28.4, 3.4, '#d8dbe6', '#eef0f6');
        var sheet = [P(X + 34, Y + 57.2, 28.4), P(X + 72, Y + 57.2, 28.4), P(X + 72, Y + 59.1, 21.5), P(X + 34, Y + 59.1, 21.5)];
        c.beginPath(); c.moveTo(sheet[0].x, sheet[0].y); for (var s = 1; s < 4; s++) c.lineTo(sheet[s].x, sheet[s].y); c.closePath();
        c.fillStyle = '#fbfaf5'; c.fill();
      });
      var news = tickerImg('news', [[QT.L.t('biz_news1'), '#ffcf3a'], ['★', '#ff5f8f'], [QT.L.t('biz_news2'), '#ff8a3a'], ['★', '#ff5f8f'],
                                    [QT.L.t('biz_news3'), '#ffcf3a'], ['★', '#ff5f8f'], [QT.L.t('biz_news4'), '#7dff8a'], ['★', '#ff5f8f']], 6);
      faceL(X + 29.5, Y + 58.5, 12.5); scroll(news, 0, 47, -0.5, 5.4, 20); c.restore();
      faceR(X + 76.5, Y + 58.5, 12.5); scroll(news, 0, 41, -0.5, 5.4, 20); c.restore();
      var bl = bladeImg('QTIMES', 5.2, '#ff4f9a'), bo = P(tx0 + tw, ty0 + td, 8), bx = bo.x - 1, byy = bo.y - bl.h;
      c.drawImage(bl.cv, bx, byy, bl.w, bl.h);
      if (rel >= 4) {
        var bp = [], u;
        for (u = 1; u < bl.h - 1; u += 3) { bp.push({ x: bx - 0.6, y: byy + u }); }
        for (u = bl.h - 2; u > 1; u -= 3) { bp.push({ x: bx + bl.w + 0.6, y: byy + u }); }
        bulbRow(bp, 0.75, '#fff3b0', '#6a3a4a', 10, null);
      }
      ga(0.25 + 0.2 * Math.sin(now * 8)); c.fillStyle = '#ff4f9a'; c.fillRect(bx - 1.5, byy - 1.5, bl.w + 3, bl.h + 3); ga(1);
      var gp = P(gx, gy, gtop + 6 + 11);
      globe(gp.x, gp.y, 10 + rel * 0.25, rel);
      faceL(X + 34, Y + 59.1, 21.5);
      c.beginPath(); c.rect(0, -7, 38, 7); c.clip();
      var sc = (now * 10) % 3;
      c.beginPath();
      for (var ln = -3; ln < 8; ln += 3) { c.rect(3, -7 + ln + sc, 10, 0.9); c.rect(15, -7 + ln + sc, 9, 0.9); c.rect(26, -7 + ln + sc, 10, 0.9); }
      c.fillStyle = '#6d6a78'; c.fill();
      c.fillStyle = pink; c.fillRect(3, -7 + ((now * 10) % 10) - 2, 33, 1.4);
      c.restore();
      var hub = P(X + 72, Y + 53.75, 28.4), ang = -now * 6;
      c.strokeStyle = '#6b6f82'; c.lineWidth = 1; c.beginPath();
      for (var sp = 0; sp < 3; sp++) { var aa = ang + sp * 2.09; c.moveTo(hub.x, hub.y); c.lineTo(hub.x + Math.cos(aa) * 2.2, hub.y + Math.sin(aa) * 2.8); }
      c.stroke();
      var np = 1 + Math.floor(rel / 3);
      for (var q = 0; q < np; q++) {
        var kq = (now * 0.4 + q / np) % 1, pq = P(X + 30 + q * 6, Y + 60, 30 + kq * 30);
        c.save(); c.translate(pq.x + Math.sin(now * 2 + q) * 6, pq.y); c.rotate(Math.sin(now * 3 + q) * 0.6);
        ga(1 - kq);
        c.fillStyle = '#ffffff'; c.fillRect(-4, -3, 8, 6); c.strokeStyle = INK; c.lineWidth = 0.8; c.strokeRect(-4, -3, 8, 6);
        c.fillStyle = '#5a5566'; c.fillRect(-3, -1.8, 6, 0.9); c.fillRect(-3, 0, 4, 0.7); c.fillRect(-3, 1.4, 5, 0.7);
        c.restore();
      }
      ga(1);
      glitter(gx, gy, gtop + 18, rel, 22);
      targetMark(S, p, gx, gy, gtop + 30);
    }
  };
  function helix(cx, cy, r, base, hi, ph, cols) {
    var n = Math.max(6, Math.floor(hi / 4.2)), i, pts = [];
    for (i = 0; i <= n; i++) {
      var h = base + i * hi / n, a = ph + i * 0.62;
      for (var s = 0; s < 2; s++) {
        var aa = a + s * Math.PI, u = Math.cos(aa) * r, v = Math.sin(aa) * r, q = P(cx + u, cy + v, h);
        pts.push({ x: q.x, y: q.y, d: u + v, s: s });
      }
    }
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.2; c.beginPath();
    for (i = 0; i <= n; i++) { var p0 = pts[i * 2], p1 = pts[i * 2 + 1]; c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); }
    c.stroke();
    for (var pass = 0; pass < 2; pass++)
      for (var s2 = 0; s2 < 2; s2++) {
        c.beginPath();
        var rr = pass ? 2.3 : 1.8;
        for (i = 0; i < pts.length; i++) {
          var e = pts[i];
          if (e.s !== s2 || (e.d > 0) !== (pass === 1)) continue;
          c.moveTo(e.x + rr, e.y); c.arc(e.x, e.y, rr, 0, 7);
        }
        c.fillStyle = pass ? cols[s2] : sh(cols[s2], -40); c.fill();
        if (pass) { c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke(); }
      }
  }
  function crossSign(x, y, r, glow, rainbow) {
    var a = r * 0.36;
    if (glow > 0) {
      ga(0.3 * glow); c.fillStyle = '#7dff9a';
      c.beginPath(); c.arc(x, y, r * 1.3, 0, 7); c.fill(); ga(1);
    }
    c.beginPath();
    c.moveTo(x - a, y - r); c.lineTo(x + a, y - r); c.lineTo(x + a, y - a); c.lineTo(x + r, y - a); c.lineTo(x + r, y + a);
    c.lineTo(x + a, y + a); c.lineTo(x + a, y + r); c.lineTo(x - a, y + r); c.lineTo(x - a, y + a); c.lineTo(x - r, y + a);
    c.lineTo(x - r, y - a); c.lineTo(x - a, y - a); c.closePath();
    c.fillStyle = rainbow ? hsl(now * 100, 85, 55) : '#1fcf6a'; c.fill();
    c.lineWidth = 2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(x - a + 1, y - r + 1.5, a * 0.6, r * 0.9);
  }
  function capsule(x, y, len, r, colR) {
    c.save(); c.translate(x, y); c.rotate(Math.atan2(B, A));
    var hl = len / 2;
    c.beginPath(); c.arc(-hl + r, 0, r, Math.PI / 2, Math.PI * 1.5); c.lineTo(0, -r); c.lineTo(0, r); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.arc(hl - r, 0, r, -Math.PI / 2, Math.PI / 2); c.lineTo(0, r); c.lineTo(0, -r); c.closePath();
    c.fillStyle = colR; c.fill();
    c.beginPath(); c.arc(-hl + r, 0, r, Math.PI / 2, Math.PI * 1.5); c.lineTo(hl - r, -r); c.arc(hl - r, 0, r, -Math.PI / 2, Math.PI / 2); c.closePath();
    c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-hl + r * 0.8, -r * 0.62, len - r * 1.6, r * 0.34);
    c.restore();
  }
  var ECG = [[0, -5.5], [4, -5.5], [5, -7.5], [6, -5.5], [7.5, -5.5], [8.5, -1.5], [9.5, -10], [10.5, -4], [11.5, -5.5], [15, -5.5], [16, -7], [17, -5.5], [18, -5.5]];
  CORP.c_pharma = {
    hl: function (rel) { return 21 + rel * 0.5; },
    hd: function (rel) { return 22 + rel * 2.4; },
    height: function (rel) { return 5 + this.hl(rel) + 2 + this.hd(rel) + 8; },
    vols: function (rel) { var r = 5 + this.hl(rel); return [[8, 32, 72, 58, r], [52, 44, 68, 56, r + 10], [12, 48, 24, 60, r + 15], [39, 31, 49, 41, this.height(rel)]]; },
    draw: function (X, Y, rel, S, p) {
      var lime = '#8fd14f', Hl = this.hl(rel), roof = 5 + Hl, Hd = this.hd(rel);
      var pill = rrect(X + 8, Y + 32, X + 72, Y + 58, 13), hx = X + 44, hy = Y + 36;
      still(function () {
        plaza(X, Y, lime, '#f0f5ea');
        var gh = [[18, 13, 3], [62, 13, 6]];
        for (var gi = 0; gi < gh.length; gi++) {
          if (rel < gh[gi][2]) continue;
          var gx = X + gh[gi][0], gy = Y + gh[gi][1];
          cyl(gx, gy, 8.5, 2, 1.5, '#dfe6ee', '#eef3f7');
          var go = P(gx, gy, 3.5);
          c.fillStyle = '#4fae5a'; c.beginPath();
          for (var pl = 0; pl < 5; pl++) { var pa = pl * 1.3; c.moveTo(go.x + Math.cos(pa) * 4 + 2.2, go.y + Math.sin(pa) * 1.5 - 2); c.arc(go.x + Math.cos(pa) * 4, go.y + Math.sin(pa) * 1.5 - 2, 2.2, 0, 7); }
          c.fill();
          ga(0.55); dome(gx, gy, 8, 3.5, '#bff2e0', 0.8); ga(1);
          var gd = P(gx, gy, 3.5);
          c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.7; c.beginPath();
          c.moveTo(gd.x - 8 * RX, gd.y); c.quadraticCurveTo(gd.x, gd.y - 10, gd.x + 8 * RX, gd.y);
          c.moveTo(gd.x, gd.y + 8 * RY); c.lineTo(gd.x, gd.y - 6.4); c.stroke();
        }
        prism(pill, 2, 1.5, '#ffffff');
        prism(pill, 3.5, Hl, '#9fe3cc', { side: function (k) { return k > 0.5 ? '#6fcaa9' : '#a2e8d0'; }, noTop: true });
        edgeWindows(pill, 3.5, Hl - 7, 5.5, 4.5, 2.6, 0.35 + rel * 0.05, 61, '#fff6c0');
        outlineBands(pill, 3.5, Hl, 5.5, 'rgba(255,255,255,0.95)', 1.3);
        prism(pill, 3.5 + Hl, 1.5, '#ffffff', { top: '#f4fbf7' });
        prism(rrect(X + 12, Y + 35, X + 68, Y + 55, 10), roof, 0.01, '#e3f5ec');
        faceL(X + 21, Y + 58, 3.5);
        c.fillStyle = '#1c1530'; c.fillRect(0.5, -Hl + 0.5, 37, 6.5);
        c.strokeStyle = '#18b85a'; c.lineWidth = 1.1; c.lineJoin = 'round'; c.beginPath();
        for (var j = 0; j < ECG.length; j++) { if (j) c.lineTo(ECG[j][0] + 10, ECG[j][1] - 0.5); else c.moveTo(ECG[j][0] + 10, ECG[j][1] - 0.5); }
        c.stroke();
        c.restore();
        cyl(hx, hy, 5.5, roof, 2, '#dfe6ee', '#ffffff');
      }, roof + 10);
      helix(hx, hy, 4.6, roof + 2, Hd, now * 1.6, rel >= 9.99 ? ['#ffc81e', '#ff5fd8'] : rel >= 8 ? [hsl(now * 90, 90, 62), hsl(now * 90 + 180, 90, 62)] : ['#ff5fa2', '#4fb8ff']);
      var ht = P(hx, hy, roof + 2 + Hd + 3), pulse = 0.5 + 0.5 * Math.sin(now * 3);
      if (rel >= 4) { ga(0.3 * pulse); c.fillStyle = '#7dff9a'; c.beginPath(); c.arc(ht.x, ht.y, 6, 0, 7); c.fill(); ga(1); }
      c.beginPath(); c.arc(ht.x, ht.y, 2.8 + pulse * 0.6, 0, 7); c.fillStyle = rel >= 4 ? '#7dff9a' : '#c8ffd8'; c.fill();
      c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
      faceL(X + 21, Y + 58, 3.5);
      var ek = (now * 0.8) % 1, ei = Math.floor(ek * (ECG.length - 1)), ef = ek * (ECG.length - 1) - ei;
      var ex0 = ECG[ei][0] + (ECG[ei + 1][0] - ECG[ei][0]) * ef + 10, ey0 = ECG[ei][1] + (ECG[ei + 1][1] - ECG[ei][1]) * ef - 0.5;
      c.fillStyle = '#eaffef'; c.beginPath(); c.arc(ex0, ey0, 1.5, 0, 7); c.fill();
      neon('PHARMA', 19, -Hl + 3.8, 5.4, '#3dff8a', 'center', 0.85 + 0.15 * Math.sin(now * 4));
      c.restore();
      if (rel >= 2) {
        var cp = P(X + 60, Y + 50, roof + 5.5 + Math.sin(now * 2) * 1);
        ga(0.25); c.fillStyle = '#5a6a60'; c.beginPath(); var csh = P(X + 60, Y + 50, roof); c.ellipse(csh.x, csh.y, 7, 2.2, 0.49, 0, 7); c.fill(); ga(1);
        capsule(cp.x, cp.y, 16, 3.6, rel >= 9.99 ? '#ffc81e' : lime);
        if (Math.sin(now * 2.4) > 0.3) sparkle(cp.x - 3, cp.y - 3, 2, '#ffffff');
      }
      var cq = P(X + 18, Y + 55, roof);
      crossSign(cq.x, cq.y - 7, 6.2 + (rel >= 4 ? pulse * 0.5 : 0), rel >= 4 ? pulse * 0.8 : 0, rel >= 9.99);
      glitter(hx, hy, roof + Hd + 4, rel, 16);
      targetMark(S, p, hx, hy, roof + Hd + 12);
    }
  };
  function flagCloth(x, y, h, w, hh, cols, ph) {
    var o = P(x, y, h), n = 6;
    for (var j = 0; j < cols.length; j++) {
      c.beginPath();
      for (var i = 0; i <= n; i++) { var u = i / n, wv = Math.sin(now * 5 + ph + u * 4) * 2.2 * u; c.lineTo(o.x + u * w, o.y + wv + j * hh / cols.length); }
      for (var i2 = n; i2 >= 0; i2--) { var u2 = i2 / n, wv2 = Math.sin(now * 5 + ph + u2 * 4) * 2.2 * u2; c.lineTo(o.x + u2 * w, o.y + wv2 + (j + 1) * hh / cols.length); }
      c.closePath(); c.fillStyle = cols[j]; c.fill();
    }
  }
  function flagPoleStill(x, y, base, h) {
    pole(x, y, base, base + h, '#9aa0b5', 1.3);
    var b1 = P(x, y, base + h);
    c.fillStyle = '#ffc81e'; c.beginPath(); c.arc(b1.x, b1.y - 1, 1.5, 0, 7); c.fill();
  }
  function flagWave(x, y, base, h, cols, ph, star, w) {
    flagCloth(x, y, base + h - 1, w || 14, (w || 14) * 0.64, cols, ph);
    if (star) { var sp = P(x, y, base + h - 5.5); starPath(sp.x + 5, sp.y + Math.sin(now * 5 + ph + 1.4) * 0.8, 2.6); c.fillStyle = '#ffe45e'; c.fill(); }
  }
  var GOV_FLAGS = [['#2f6fe0', '#ffffff'], ['#e2504a', '#ffffff'], ['#2fbf7a', '#ffe45e'], ['#ffe45e', '#6f57e0']];
  var GOV_ROOF_FLAGS = [[10, 39], [66, 39], [17, 39], [72, 39]];
  var GOV_RING = (function () {
    var out = [];
    for (var k = 0; k < 14; k++) {
      var a = k / 14 * Math.PI * 2 + 0.11, u = Math.cos(a), v = Math.sin(a);
      if (u + v > -0.15) out.push({ u: u, v: v, d: u + v });
    }
    out.sort(function (p1, p2) { return p1.d - p2.d; });
    return out;
  })();
  CORP.c_gov = {
    sp: function (rel) { return 7 + rel * 1.5; },
    height: function (rel) { return 34 + 4 + this.sp(rel) + 8; },
    vols: function (rel) { return [[6, 18, 74, 40, 19], [34, 28, 62, 56, 34], [45, 39, 51, 45, this.height(rel)], [6, 58, 10, 62, 34], [70, 58, 74, 62, 34]]; },
    draw: function (X, Y, rel, S, p) {
      var marble = '#f7f4ee', slate = '#7d8fc4', f, sp = this.sp(rel);
      var dx = X + 48, dy = Y + 42, dr = 11.5, dtop = 24, apex = dtop + dr * 0.85;
      var nf = Math.min(4, Math.floor(rel / 2.5)), gold = rel >= 9.99, i;
      still(function () {
        plaza(X, Y, slate, '#eef0f6');
        box(X + 6, Y + 18, 68, 22, 2, 15, marble, { left: '#dcd8d0', right: '#e9e6df' });
        windows('L', X + 6, Y + 40, 2, 68, 14, 6.8, 9, 0.3 + rel * 0.06, 41, '#58627e', '#ffe7a0', 3, 6);
        windows('R', X + 74, Y + 40, 2, 22, 14, 6.8, 9, 0.3 + rel * 0.06, 42, '#58627e', '#ffe7a0', 3, 6);
        box(X + 5, Y + 17, 70, 24, 17, 2, slate, { top: '#e7e9f2' });
        for (var k0 = 0; k0 < nf; k0++) flagPoleStill(X + GOV_ROOF_FLAGS[k0][0], Y + GOV_ROOF_FLAGS[k0][1], 19, 10);
        cyl(dx, dy, 14.5, 2, 3, '#e7e9f2', '#f4f5fa');
        cyl(dx, dy, 10.5, 5, 16, '#e6e0d2', '#f7f4ee');
        for (i = 0; i < GOV_RING.length; i++) cyl(dx + GOV_RING[i].u * 12.4, dy + GOV_RING[i].v * 12.4, 1.35, 5, 16, '#ffffff', '#ffffff');
        cyl(dx, dy, 13.8, 21, 3, marble, '#eef0f6');
        var eb = P(dx, dy, 22.3);
        c.beginPath(); c.ellipse(eb.x, eb.y, 13.8 * RX, 13.8 * RY, 0, 0, Math.PI); c.strokeStyle = slate; c.lineWidth = 0.9; c.stroke();
        var dp = dome(dx, dy, dr, dtop, gold ? '#f2c230' : rel >= 7 ? '#5fc8b8' : '#57b6c9', 0.85);
        var dc = P(dx, dy, dtop), drx2 = dr * RX;
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.9; c.beginPath();
        for (var rb = -2; rb <= 2; rb++) { var kx = rb / 3; c.moveTo(dc.x + kx * drx2, dc.y + Math.sqrt(1 - kx * kx) * dr * RY * 0.9); c.quadraticCurveTo(dc.x + kx * drx2 * 1.05, dc.y - dr * 0.5, dp.x, dp.y); }
        c.stroke();
        cyl(dx, dy, 2.4, apex - 1, 4, '#ffffff', '#ffc81e');
        pole(dx, dy, apex + 3, apex + 3 + sp, '#c9a640', 1.6);
        box(X + 40, Y + 56, 16, 6, 2, 1.2, '#ecebe6');
        box(X + 42, Y + 56, 12, 3.5, 3.2, 1.2, '#f2f1ec');
        flagPoleStill(X + 8, Y + 60, 2, 30);
        flagPoleStill(X + 72, Y + 60, 2, 30);
      });
      if (rel >= 2) {
        for (i = 0; i < GOV_RING.length; i++) {
          if (GOV_RING[i].d < 0.2) continue;
          var lb = P(dx + GOV_RING[i].u * 12.4, dy + GOV_RING[i].v * 12.4, 5.2);
          ga(0.55); c.fillStyle = hsl(now * 70 + i * 40, 95, 62);
          c.beginPath(); c.ellipse(lb.x, lb.y, 2.6, 1.2, 0, 0, 7); c.fill();
          ga(0.22); c.beginPath(); c.moveTo(lb.x - 1.6, lb.y); c.lineTo(lb.x + 1.6, lb.y); c.lineTo(lb.x + 0.9, lb.y - 14); c.lineTo(lb.x - 0.9, lb.y - 14); c.closePath(); c.fill();
        }
        ga(1);
      }
      if (rel >= 3) {
        var bp = [];
        for (i = 0; i <= 16; i++) { var ba = -Math.PI / 4 + i / 16 * Math.PI; bp.push(P(dx + Math.cos(ba) * 13.9, dy + Math.sin(ba) * 13.9, 22.6)); }
        bulbRow(bp, 0.8, '#fff3b0', '#8a8aa0', 8, rel >= 6 ? '#ffd23f' : null);
      }
      for (f = 0; f < nf; f++) flagWave(X + GOV_ROOF_FLAGS[f][0], Y + GOV_ROOF_FLAGS[f][1], 19, 10, GOV_FLAGS[f], f * 0.9, false, 10);
      var st = P(dx, dy, apex + 3 + sp + 3), spin = Math.cos(now * 2);
      if (rel >= 4) { ga(0.3 + 0.2 * Math.sin(now * 3)); c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(st.x, st.y, 5.5, 0, 7); c.fill(); ga(1); }
      c.save(); c.translate(st.x, st.y); c.scale(Math.max(0.15, Math.abs(spin)), 1);
      starPath(0, 0, 4); c.fillStyle = gold ? hsl(now * 120, 90, 62) : '#ffc81e'; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
      c.restore();
      flagWave(X + 8, Y + 60, 2, 30, ['#2f6fe0', '#ffffff'], 0.5, true);
      flagWave(X + 72, Y + 60, 2, 30, ['#ffffff', '#e2504a', '#ffffff'], 1.7, false);
      glitter(dx, dy, apex + 6, rel, 20);
      targetMark(S, p, dx, dy, apex + sp + 12);
    }
  };
  on('plot', 'corp', function (p, S, H) {
    var d = CORP[p.id];
    if (!d) return false;
    now = S.t;
    var lv = Math.floor(relOf(S, p.id) + 1e-6), X = p.x * TILE, Y = p.y * TILE;
    var alpha = fadeFor(p.id, d.vols(lv), X, Y, S);
    paint(H, p.id, lv + '|' + QT.L.get(), X, Y, p.w * TILE, p.h * TILE, d.height(lv) + 10, alpha, function () {
      d.draw(X, Y, lv, S, p);
    });
    c = H.ctx;
  });
  var ipoCache = { t: -1, list: null };
  function ipoList(S) {
    if (!ipoCache.list || Math.abs(S.t - ipoCache.t) > 0.5) {
      ipoCache.t = S.t;
      try { ipoCache.list = QT.G.ipoChecks().map(function (e) { return !!e[1]; }); } catch (e) { ipoCache.list = [false, false, false, false]; }
    }
    return ipoCache.list;
  }
  function bull(x, y, s, shine) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath();
    c.moveTo(12, -4); c.bezierCurveTo(12, -11, 4, -12, -2, -11);
    c.bezierCurveTo(-6, -11, -9, -10, -11, -7);
    c.lineTo(-16, -4); c.lineTo(-17, 0); c.lineTo(-14, 1.5);
    c.lineTo(-10, 0); c.lineTo(-9, 5); c.lineTo(-11, 10); c.lineTo(-8.5, 10); c.lineTo(-6, 4);
    c.lineTo(-3, 5); c.lineTo(-1, 10); c.lineTo(1.5, 10); c.lineTo(1, 4);
    c.lineTo(7, 3); c.lineTo(9, 10); c.lineTo(11.5, 10); c.lineTo(11, 3);
    c.bezierCurveTo(13, 1, 13.5, -1, 12, -4);
    c.closePath();
    var g = gradCache.bull;
    if (!g) { g = c.createLinearGradient(-14, -12, 12, 10); g.addColorStop(0, '#fff2a8'); g.addColorStop(0.45, '#f2b62a'); g.addColorStop(1, '#b8780a'); gradCache.bull = g; }
    c.fillStyle = g; c.fill();
    c.lineWidth = 1.6; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    c.beginPath(); c.moveTo(-11, -7); c.quadraticCurveTo(-15, -10, -18, -13); c.moveTo(-9.5, -8.5); c.quadraticCurveTo(-11, -13, -8, -15);
    c.moveTo(12, -6); c.quadraticCurveTo(16, -9, 15, -13);
    c.strokeStyle = INK; c.lineWidth = 2.6; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = '#ffe07a'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(-12.5, -3.5, 0.9, 0, 7); c.fill();
    c.restore();
    if (shine) sparkle(x + (Math.sin(now * 1.3) * 10) * s, y - 8 * s, 2.5 + Math.abs(Math.sin(now * 4)) * 2, '#ffffff');
  }
  function searchlights(X, Y, top) {
    var g = gradCache.sl;
    if (!g) { g = c.createLinearGradient(0, 0, 0, -260); g.addColorStop(0, 'rgba(255,236,150,0.55)'); g.addColorStop(1, 'rgba(255,236,150,0)'); gradCache.sl = g; }
    var src = [[40, 30], [136, 30]];
    for (var i = 0; i < 2; i++) {
      var o = P(X + src[i][0], Y + src[i][1], top);
      c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(now * 0.9 + i * 2.1) * 0.55 + (i ? 0.2 : -0.2));
      c.fillStyle = g; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-24, -260); c.lineTo(24, -260); c.lineTo(3, 0); c.closePath(); c.fill();
      c.restore();
    }
  }
  function fountainStill(x, y) {
    cyl(x, y, 14, 3, 4, '#efe6cf', '#f7f1e2');
  }
  function fountain(x, y, ok) {
    var o = P(x, y, 7), rx = 12 * RX, ry = 12 * RY, j;
    c.beginPath(); c.ellipse(o.x, o.y, rx, ry, 0, 0, 7);
    c.fillStyle = ok ? hsl(now * 60 + 180, 80, 70) : '#8fd8f5'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.8;
    for (var r0 = 0; r0 < 2; r0++) { var k = (now * 0.7 + r0 * 0.5) % 1; ga(1 - k); c.beginPath(); c.ellipse(o.x, o.y, rx * (0.3 + k * 0.65), ry * (0.3 + k * 0.65), 0, 0, 7); c.stroke(); }
    ga(1);
    c.fillStyle = '#ffc81e'; c.beginPath();
    for (var g = 0; g < 5; g++) { var cang = g * 1.3 + 0.4; c.rect(o.x + Math.cos(cang) * rx * 0.6 - 1.4, o.y + Math.sin(cang) * ry * 0.6 - 0.7, 2.8, 1.4); }
    c.fill();
    var gi = Math.floor(now * 3) % 5, gga = gi * 1.3 + 0.4;
    sparkle(o.x + Math.cos(gga) * rx * 0.6, o.y + Math.sin(gga) * ry * 0.6 - 1, 2.4, '#ffffff');
    cyl(x, y, 2.6, 7, 11, '#f7f1e2', '#ffffff');
    var tp = P(x, y, 20);
    c.strokeStyle = 'rgba(190,235,255,0.9)'; c.lineWidth = 1.4; c.beginPath();
    var ends = [];
    for (j = 0; j < 4; j++) {
      var ang = j * Math.PI / 2 + Math.PI / 4, end = P(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9, 7);
      ends.push(end);
      c.moveTo(tp.x, tp.y); c.quadraticCurveTo((tp.x + end.x) / 2, tp.y - 8, end.x, end.y);
    }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath();
    for (j = 0; j < 4; j++)
      for (var d = 0; d < 3; d++) {
        var u = (now * 1.2 + d / 3 + j * 0.1) % 1, iu = 1 - u, e = ends[j];
        var qx = iu * iu * tp.x + 2 * iu * u * (tp.x + e.x) / 2 + u * u * e.x;
        var qy = iu * iu * tp.y + 2 * iu * u * (tp.y - 8) + u * u * e.y;
        c.rect(qx - 0.8, qy - 0.8, 1.6, 1.6);
      }
    c.fill();
    c.beginPath(); c.arc(tp.x, tp.y - 1, 1.8 + Math.sin(now * 10) * 0.4, 0, 7); c.fill();
  }
  var IPO_ICONS = ['¥', '★', '✎', 'Q'];
  var EX_FLAGS = [['#e2504a', '#ffffff'], ['#2f6fe0', '#ffffff'], ['#2fbf7a', '#ffe45e'], ['#ffe45e', '#e2508a'], ['#6f57e0', '#ffffff']];
  var EX_LAMPS = [[72, 116], [104, 116], [72, 134], [104, 134]];
  function drawExchange(X, Y, S, ok) {
    var gold = '#e8b100', marble = '#fbf7ec', checks = ipoList(S);
    var roof = 3 + 42, bTop = roof + 4 + 40, bx = X + 28, by = Y + 52, bw = 120, f;
    if (ok) searchlights(X, Y, roof + 4);
    still(function () {
      box(X + 1, Y + 1, 174, 142, 0, 3, '#f6f0df', { left: '#dcd2b8', right: '#e9e0c8' });
      c.beginPath(); var q0 = P(X + 4, Y + 140, 3.05), q1 = P(X + 172, Y + 140, 3.05), q2 = P(X + 172, Y + 4, 3.05);
      c.moveTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.strokeStyle = gold; c.lineWidth = 1.8; c.stroke();
      I.facePath(c, X + 80, Y + 108, 16, 36, 3.1); c.fillStyle = ok ? '#e8364f' : '#c8243a'; c.fill();
      c.beginPath(); var cl0 = P(X + 80, Y + 108, 3.15), cl1 = P(X + 80, Y + 144, 3.15), cr0 = P(X + 96, Y + 108, 3.15), cr1 = P(X + 96, Y + 144, 3.15);
      c.moveTo(cl0.x, cl0.y); c.lineTo(cl1.x, cl1.y); c.moveTo(cr0.x, cr0.y); c.lineTo(cr1.x, cr1.y); c.strokeStyle = '#ffd23f'; c.lineWidth = 1; c.stroke();
      box(X + 14, Y + 12, 148, 88, 3, 42, marble, { left: '#e6dcc2', right: '#f0e8d4' });
      windows('R', X + 162, Y + 100, 3, 88, 40, 11, 13, 0.55, 51, '#6b5a3a', '#ffe7a0', 5, 10);
      windows('L', X + 14, Y + 100, 3, 148, 40, 11, 13, 0.55, 52, '#6b5a3a', '#ffe7a0', 5, 10);
      box(X + 12, Y + 10, 152, 91, roof, 4, gold, { top: '#f4e3a8' });
      for (var k = 0; k < 5; k++) flagPoleStill(X + 160, Y + 18 + k * 16, roof + 4, 16);
      box(X + 40, Y + 54, 4, 4, roof + 4, 6, '#3a3550'); box(X + 132, Y + 54, 4, 4, roof + 4, 6, '#3a3550');
      box(bx, by, bw, 8, roof + 10, 36, '#2a2540', { left: '#171327', right: '#231e36', top: '#3a3452' });
      faceL(bx, by + 8, roof + 10); c.fillStyle = '#0b0a18'; c.fillRect(3, -33, bw - 6, 30); c.restore();
      var bell = P(bx + bw / 2, by + 4, bTop + 3);
      c.strokeStyle = '#8b7a4a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bell.x - 7, bell.y); c.lineTo(bell.x, bell.y - 12); c.lineTo(bell.x + 7, bell.y); c.stroke();
    });
    bulbRow(linePts(X + 12, Y + 101, roof + 2, X + 164, Y + 101, roof + 2, 38).concat(linePts(X + 164, Y + 101, roof + 2, X + 164, Y + 10, roof + 2, 22)),
            1, '#fff3b0', '#9a7a2a', ok ? 14 : 7, '#ffd23f');
    for (f = 0; f < 5; f++) flagCloth(X + 160, Y + 18 + f * 16, roof + 4 + 15, 14, 9, EX_FLAGS[f], f * 0.8);
    faceL(bx, by + 8, roof + 10);
    var n = 11, cw2 = 5.2;
    for (var pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (var k2 = 0; k2 < n; k2++) {
        var sidx = Math.floor(now * 1.2) + k2, up = hash(sidx, 3, 7) > 0.3;
        if (up !== (pass === 0)) continue;
        var lvl = k2 * 1.6 + hash(sidx, 1, 2) * 5, hh = 3 + hash(sidx, 2, 5) * 5;
        var yy = -7 - lvl - hh, xx = 6 + k2 * cw2 - (now * 1.2 % 1) * cw2;
        if (xx < 5) continue;
        c.rect(xx, yy, 3, hh); c.rect(xx + 1.1, yy - 1.5, 0.8, hh + 3);
      }
      c.fillStyle = pass === 0 ? '#2fe38a' : '#ff4f5f'; c.fill();
    }
    c.strokeStyle = '#ffd23f'; c.lineWidth = 1; c.beginPath(); c.moveTo(6, -9); c.lineTo(62, -28); c.stroke();
    if (ok) {
      var fl = Math.floor(now * 6) % 2;
      c.save(); c.translate(90, -19); c.scale(1 + 0.08 * Math.sin(now * 8), 1 + 0.08 * Math.sin(now * 8));
      tx('IPO!', 0, 0, 17, hsl(now * 200, 95, 60), 'center', 900, fl ? '#ffffff' : '#ffd23f', 3);
      c.restore();
    } else {
      tx('QTYC', 90, -26, 10, '#ffd23f', 'center', 900);
      for (var ci = 0; ci < 4; ci++) {
        var lx = 72 + ci * 12, ly = -13, lit = checks[ci];
        c.beginPath(); c.arc(lx, ly, 4.6, 0, 7); c.fillStyle = lit ? '#2fe38a' : '#3a3650'; c.fill();
        c.lineWidth = 1; c.strokeStyle = lit ? '#b8ffd8' : '#5a5570'; c.stroke();
        tx(IPO_ICONS[ci], lx, ly + 0.3, 5.5, lit ? '#0b3a22' : '#8a86a0', 'center', 900);
      }
    }
    var tick = tickerImg('ex', [['QTYC ▲', '#2fe38a'], ['AUTO ▲', '#2fe38a'], ['MAT ▼', '#ff4f5f'], ['NET ▲', '#2fe38a'], ['PRESS ▲', '#2fe38a'],
                                ['PHARMA ▼', '#ff4f5f'], ['GOV ▲', '#2fe38a'], ['NIKKQ ▲', '#ffd23f']], 6);
    c.save(); scroll(tick, 3, bw - 6, -3, 5.5, 16); c.restore();
    var bp = [], u;
    for (u = 0; u <= bw; u += 5) bp.push({ x: u, y: -36 });
    for (u = -36; u <= 0; u += 5) bp.push({ x: bw, y: u });
    for (u = bw; u >= 0; u -= 5) bp.push({ x: u, y: 0 });
    for (u = 0; u >= -36; u -= 5) bp.push({ x: 0, y: u });
    bulbRow(bp, 1.1, ok ? hsl(now * 150, 95, 70) : '#fff3b0', '#5a4a2a', ok ? 16 : 8, null);
    c.restore();
    var bell2 = P(bx + bw / 2, by + 4, bTop + 3);
    c.save(); c.translate(bell2.x, bell2.y - 11); c.rotate(ok ? Math.sin(now * 9) * 0.5 : 0);
    c.beginPath(); c.moveTo(-3, 1); c.quadraticCurveTo(-3.5, 7, -6.5, 9); c.lineTo(6.5, 9); c.quadraticCurveTo(3.5, 7, 3, 1); c.quadraticCurveTo(0, -2, -3, 1); c.closePath();
    c.fillStyle = '#ffc81e'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(0, 9.8, 1.4, 0, 7); c.fill();
    c.restore();
    if (ok) {
      c.strokeStyle = '#ffd23f'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (var w2 = 0; w2 < 3; w2++) {
        var kw = (now * 1.5 + w2 / 3) % 1;
        ga(1 - kw); c.beginPath(); c.arc(bell2.x, bell2.y - 6, 10 + kw * 14, -2.4, -0.7); c.stroke();
      }
      ga(1);
    }
    still(function () {
      box(X + 46, Y + 100, 84, 12, 3, 2, '#efe7d2');
      box(X + 50, Y + 100, 76, 8, 5, 2, '#f4eddb');
      box(X + 54, Y + 100, 68, 4.5, 7, 2, '#f8f2e3');
      for (var cc = 0; cc < 9; cc++) cyl(X + 46 + cc * 10.5, Y + 102.5, 2.4, 9, 32, '#ffffff', '#ffffff');
      box(X + 40, Y + 100, 96, 6.5, 41, 4.5, marble, { left: '#e9dfc6', right: '#efe6d0' });
      faceL(X + 40, Y + 106.5, 41); c.fillStyle = gold; c.fillRect(0, -1.6, 96, 1.2); c.restore();
      var t0 = P(X + 40, Y + 106.5, 45.5), t1 = P(X + 136, Y + 106.5, 45.5), t2 = P(X + 88, Y + 106.5, 59);
      var u0 = P(X + 40, Y + 100, 45.5), u1 = P(X + 136, Y + 100, 45.5), u2 = P(X + 88, Y + 100, 59);
      c.fillStyle = '#efe0b0';
      c.beginPath(); c.moveTo(t2.x, t2.y); c.lineTo(u2.x, u2.y); c.lineTo(u1.x, u1.y); c.lineTo(t1.x, t1.y); c.closePath(); c.fill();
      c.fillStyle = '#e3d19a';
      c.beginPath(); c.moveTo(t2.x, t2.y); c.lineTo(u2.x, u2.y); c.lineTo(u0.x, u0.y); c.lineTo(t0.x, t0.y); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.lineTo(t2.x, t2.y); c.closePath();
      c.fillStyle = marble; c.fill(); c.lineWidth = 1.6; c.strokeStyle = gold; c.stroke();
      var md0 = P(X + 88, Y + 106.5, 50.5);
      c.beginPath(); c.arc(md0.x, md0.y, 4.6, 0, 7); c.fillStyle = '#ffc81e'; c.fill();
      c.lineWidth = 1.2; c.strokeStyle = '#a8740a'; c.stroke();
      tx('¥', md0.x, md0.y + 0.3, 6, '#ffffff', 'center', 900);
      for (var li = 0; li < EX_LAMPS.length; li++) {
        var l1 = P(X + EX_LAMPS[li][0], Y + EX_LAMPS[li][1], 20);
        pole(X + EX_LAMPS[li][0], Y + EX_LAMPS[li][1], 3, 20, '#3a3550', 1.6);
        ga(0.3); c.fillStyle = '#ffe07a'; c.beginPath(); c.arc(l1.x, l1.y - 2, 5.5, 0, 7); c.fill(); ga(1);
        c.beginPath(); c.arc(l1.x, l1.y - 2, 2.6, 0, 7); c.fillStyle = '#fff6c8'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = '#b8942a'; c.stroke();
      }
      box(X + 128, Y + 116, 28, 18, 3, 7, '#d9cfb6', { top: '#ece4cf' });
      faceL(X + 128, Y + 134, 3); c.fillStyle = gold; c.fillRect(2, -5, 24, 1.2); c.restore();
      fountainStill(X + 30, Y + 124);
    }, 64);
    bulbRow(linePts(X + 40, Y + 106.5, 46, X + 88, Y + 106.5, 59.5, 10).concat(linePts(X + 88, Y + 106.5, 59.5, X + 136, Y + 106.5, 46, 10)),
            0.9, '#fff3b0', '#9a7a2a', ok ? 14 : 7, null);
    fountain(X + 30, Y + 124, ok);
    var bp2 = P(X + 142, Y + 125, 10);
    bull(bp2.x, bp2.y - 9 + (ok ? -Math.abs(Math.sin(now * 5)) * 2 : 0), 1.05, true);
    if (ok) {
      var gc = P(X + 88, Y + 56, roof + 4), pr = (now * 0.8) % 1;
      c.lineWidth = 3; c.strokeStyle = '#ffd23f';
      for (var ring = 0; ring < 2; ring++) {
        var kr = (pr + ring * 0.5) % 1;
        ga(0.6 * (1 - kr)); c.beginPath(); c.ellipse(gc.x, gc.y - 20, 60 + kr * 70, 30 + kr * 35, 0, 0, 7); c.stroke();
      }
      ga(1);
      for (var s = 0; s < 8; s++) {
        var ph = now * 1.1 + s * 0.8, kk = ph - Math.floor(ph);
        sparkle(gc.x + Math.sin(s * 2.3 + Math.floor(ph)) * 90, gc.y - 30 - kk * 40, (1 - Math.abs(kk - 0.5) * 2) * 5 + 0.5, s % 2 ? '#fff6b0' : '#ffffff');
      }
    }
  }
  var EX_TOP = 3 + 42 + 4 + 40 + 16;
  var EX_VOLS = [[14, 12, 162, 100, EX_TOP], [40, 100, 136, 107, 60]];
  on('plot', 'exchange', function (p, S, H) {
    now = S.t;
    var X = p.x * TILE, Y = p.y * TILE, ok = false;
    try { ok = !!S.canIPO(); } catch (e) { ok = false; }
    var alpha = fadeFor(p.id, EX_VOLS, X, Y, S);
    paint(H, p.id, (ok ? 'ok' : 'wait') + '|' + QT.L.get(), X, Y, p.w * TILE, p.h * TILE, EX_TOP + (ok ? 260 : 20), alpha, function () {
      cur.top = EX_TOP + 20;
      drawExchange(X, Y, S, ok);
    });
    c = H.ctx;
  });
  var BLIMP_SPEED = 11;
  function blimp(x, y, dir) {
    var g = gradCache.blimp;
    if (!g) {
      g = c.createLinearGradient(0, -16, 0, 16);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#e6e9f5'); g.addColorStop(1, '#9d8ee8');
      gradCache.blimp = g;
    }
    c.save(); c.translate(x, y); c.scale(dir, 1);
    c.fillStyle = '#ff4f9a'; c.strokeStyle = INK; c.lineWidth = 1.4; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-36, -4); c.lineTo(-50, -17); c.lineTo(-44, -2); c.closePath();
    c.moveTo(-36, 4); c.lineTo(-50, 17); c.lineTo(-44, 2); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, 0, 44, 15, 0, 0, 7); c.fillStyle = g; c.fill(); c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#ffd23f'; c.fillRect(-38, 8, 76, 2.2);
    c.fillStyle = '#ff4f9a'; c.fillRect(-32, 11, 64, 2);
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(6, -9, 22, 3, 0, 0, 7); c.fill();
    c.fillStyle = '#f2f3f8'; c.beginPath(); c.moveTo(-9, 14); c.lineTo(9, 14); c.lineTo(7, 20); c.lineTo(-7, 20); c.closePath(); c.fill();
    c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#35c8ff'; c.fillRect(-5.5, 15.5, 3, 2.5); c.fillRect(-1.5, 15.5, 3, 2.5); c.fillRect(2.5, 15.5, 3, 2.5);
    var pr = Math.abs(Math.sin(now * 25)) * 5 + 0.6;
    c.fillStyle = 'rgba(60,50,90,0.6)'; c.beginPath(); c.ellipse(-12, 17, 1.2, pr, 0, 0, 7); c.fill();
    if (Math.sin(now * 4) > 0) { c.fillStyle = '#ff3b4f'; c.fillRect(41, -1.5, 3, 3); }
    c.scale(dir, 1);
    c.beginPath(); c.moveTo(-28, -5); c.lineTo(28, -5); c.quadraticCurveTo(31, 0, 28, 5); c.lineTo(-28, 5); c.quadraticCurveTo(-31, 0, -28, -5); c.closePath();
    c.fillStyle = '#15122a'; c.fill();
    var img = tickerImg('blimp', [['QUANTUM TYCOON', '#ffe45e'], ['★', '#ff5fd8'], ['IPO!', '#35f0ff'], ['★', '#ff5fd8'], ['QTYC ▲', '#7dff8a'], ['★', '#ff5fd8']], 6);
    scroll(img, -28, 56, 4.5, 8.5, 22);
    c.restore();
  }
  var BAL_COLS = [['#ff4f9a', '#ffd23f'], ['#35c8ff', '#ffffff'], ['#7dff8a', '#8f7fe8'], ['#ff8a3a', '#ff4f9a']];
  function envelope(x, y, r) {
    c.beginPath(); c.moveTo(x - r * 0.42, y + r * 1.02);
    c.bezierCurveTo(x - r * 1.35, y + r * 0.25, x - r * 1.1, y - r * 1.2, x, y - r * 1.12);
    c.bezierCurveTo(x + r * 1.1, y - r * 1.2, x + r * 1.35, y + r * 0.25, x + r * 0.42, y + r * 1.02);
    c.closePath();
  }
  function balloon(x, y, r, cols, logo) {
    c.save();
    envelope(x, y, r);
    c.fillStyle = cols[0]; c.fill();
    c.save(); c.clip();
    c.fillStyle = cols[1]; c.beginPath();
    for (var i = -3; i <= 3; i += 2) { c.moveTo(x + i * r * 0.28 + r * 0.13, y); c.ellipse(x + i * r * 0.28, y, r * 0.13, r * 1.3, 0, 0, 7); }
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(x - r * 0.4, y - r * 0.5, r * 0.25, r * 0.45, -0.3, 0, 7); c.fill();
    c.restore();
    envelope(x, y, r);
    c.lineWidth = 1.4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    if (logo) tx(logo, x, y - r * 0.1, r * 0.55, '#ffffff', 'center', 900, INK, 2);
    c.strokeStyle = '#6b5a3a'; c.lineWidth = 0.8; c.beginPath();
    c.moveTo(x - r * 0.4, y + r * 1.02); c.lineTo(x - r * 0.25, y + r * 1.45); c.moveTo(x + r * 0.4, y + r * 1.02); c.lineTo(x + r * 0.25, y + r * 1.45); c.stroke();
    c.fillStyle = '#b07a3a'; c.fillRect(x - r * 0.3, y + r * 1.45, r * 0.6, r * 0.38);
    c.lineWidth = 1; c.strokeStyle = INK; c.strokeRect(x - r * 0.3, y + r * 1.45, r * 0.6, r * 0.38);
    if (Math.sin(now * 3 + x) > 0.6) { c.fillStyle = '#ffb02e'; c.beginPath(); c.ellipse(x, y + r * 1.25, r * 0.12, r * 0.22, 0, 0, 7); c.fill(); }
    c.restore();
  }
  var ADS = 4;
  function billboard(x0, y0, h, w, hh, side, seed) {
    var o = side === 'L' ? P(x0 + w / 2, y0, h) : P(x0, y0 - w / 2, h);
    var g = gradCache.pole;
    if (!g) { g = c.createLinearGradient(0, 0, 0, 170); g.addColorStop(0, '#7a7f9a'); g.addColorStop(1, 'rgba(122,127,154,0)'); gradCache.pole = g; }
    c.save(); c.translate(o.x, o.y); c.fillStyle = g; c.fillRect(-2.5, 0, 5, 170); c.restore();
    face(side, x0, y0, h);
    var len = w;
    c.fillStyle = '#1b1830'; c.fillRect(-2, -hh - 2, len + 4, hh + 4);
    var ad = (Math.floor(now / 3.2) + seed) % ADS, k = (now / 3.2) % 1;
    c.save(); c.beginPath(); c.rect(0, -hh, len, hh); c.clip();
    if (ad === 0) {
      c.fillStyle = '#0f2a1f'; c.fillRect(0, -hh, len, hh);
      c.strokeStyle = '#2fe38a'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
      for (var i = 0; i <= 8; i++) { var xx = i * len / 8, yy = -4 - (i / 8) * (hh - 12) - Math.sin(i * 1.7 + seed) * 3; if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
      c.stroke();
      tx('QTYC ▲', len * 0.3, -hh + 7, 7, '#ffe45e', 'center', 900);
    } else if (ad === 1) {
      for (var b = 0; b < 6; b++) { c.fillStyle = hsl(b * 60 + now * 90, 90, 60); c.fillRect(b * len / 6, -hh, len / 6 + 0.5, hh); }
      c.save(); c.translate(len / 2, -hh / 2); var sc = 1 + 0.12 * Math.sin(now * 7); c.scale(sc, sc);
      tx('IPO!', 0, 0, hh * 0.5, '#ffffff', 'center', 900, INK, 3); c.restore();
    } else if (ad === 2) {
      c.fillStyle = '#2a1f55'; c.fillRect(0, -hh, len, hh);
      var cs = Math.abs(Math.cos(now * 3));
      c.save(); c.translate(len / 2, -hh / 2); c.scale(Math.max(0.1, cs), 1);
      c.beginPath(); c.arc(0, 0, hh * 0.34, 0, 7); c.fillStyle = '#ffc81e'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#a8740a'; c.stroke();
      tx('¥', 0, 0.5, hh * 0.4, '#ffffff', 'center', 900);
      c.restore();
      for (var st = 0; st < 3; st++) sparkle(len * (0.2 + st * 0.3), -hh * (0.25 + (st % 2) * 0.5), 2 + Math.abs(Math.sin(now * 5 + st)) * 2, '#fff6b0');
    } else {
      c.fillStyle = '#101a3a'; c.fillRect(0, -hh, len, hh);
      c.save(); c.translate(len * 0.25, -hh / 2);
      c.strokeStyle = '#35f0ff'; c.lineWidth = 1.2;
      for (var e = 0; e < 3; e++) { c.save(); c.rotate(e * Math.PI / 3 + now); c.beginPath(); c.ellipse(0, 0, hh * 0.32, hh * 0.12, 0, 0, 7); c.stroke(); c.restore(); }
      c.fillStyle = '#ff5fd8'; c.beginPath(); c.arc(0, 0, 2.2, 0, 7); c.fill();
      c.restore();
      tx('QUANTUM', len * 0.64, -hh / 2, hh * 0.2, '#ffffff', 'center', 900);
    }
    if (k < 0.08) { c.fillStyle = 'rgba(255,255,255,' + (1 - k / 0.08) * 0.8 + ')'; c.fillRect(0, -hh, len, hh); }
    c.restore();
    var bp = [], u;
    for (u = 0; u <= len; u += 5) { bp.push({ x: u, y: -hh - 2 }); bp.push({ x: u, y: 2 }); }
    bulbRow(bp, 0.9, '#fff3b0', '#6a5a3a', 6, null);
    c.restore();
  }
  var coaster = { key: '', pts: null, len: 0, s: 0, last: -1 };
  function catmull(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t, out = [];
    for (var i = 0; i < 3; i++)
      out.push(0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3));
    return out;
  }
  function buildCoaster(cx, cy) {
    var cp = [
      [cx - 120, cy - 60, 20], [cx - 60, cy - 62, 62], [cx - 12, cy - 62, 100], [cx + 36, cy - 60, 28], [cx + 96, cy - 58, 52],
      [cx + 140, cy - 30, 40], [cx + 152, cy + 10, 30], [cx + 132, cy + 50, 24], [cx + 84, cy + 64, 18]
    ];
    var xc = cx + 24, R = 36, hc = 16 + R;
    for (var k = 1; k < 12; k++) {
      var f = k / 12 * Math.PI * 2;
      cp.push([xc - R * Math.sin(f), cy + 66 - k * 1.1, hc - R * Math.cos(f)]);
    }
    cp.push([cx - 44, cy + 52, 18]); cp.push([cx - 100, cy + 48, 44]); cp.push([cx - 148, cy + 20, 28]); cp.push([cx - 150, cy - 30, 18]);
    var pts = [], n = cp.length, SUB = 6, i, j;
    for (i = 0; i < n; i++)
      for (j = 0; j < SUB; j++) pts.push(catmull(cp[(i - 1 + n) % n], cp[i], cp[(i + 1) % n], cp[(i + 2) % n], j / SUB));
    var len = 0;
    for (i = 0; i < pts.length; i++) {
      var q = pts[(i + 1) % pts.length], p0 = pts[i];
      p0.push(len);
      len += Math.sqrt((q[0] - p0[0]) * (q[0] - p0[0]) + (q[1] - p0[1]) * (q[1] - p0[1]) + (q[2] - p0[2]) * (q[2] - p0[2]));
    }
    return { pts: pts, len: len };
  }
  function trackAt(s) {
    var pts = coaster.pts, n = pts.length, L = coaster.len;
    s = ((s % L) + L) % L;
    var lo = 0, hi = n - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (pts[mid][3] <= s) lo = mid; else hi = mid - 1; }
    var a = pts[lo], b = pts[(lo + 1) % n], seg = ((lo + 1 < n ? b[3] : L) - a[3]) || 1, k = (s - a[3]) / seg;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  function drawCoaster(cx, cy, S) {
    var key = cx + ',' + cy;
    if (coaster.key !== key) { var bc = buildCoaster(cx, cy); coaster.pts = bc.pts; coaster.len = bc.len; coaster.key = key; }
    var pts = coaster.pts, n = pts.length, i;
    var g = gradCache.sup;
    if (!g) { g = c.createLinearGradient(0, 0, 0, 130); g.addColorStop(0, 'rgba(111,87,224,0.75)'); g.addColorStop(1, 'rgba(111,87,224,0)'); gradCache.sup = g; }
    c.fillStyle = g;
    for (i = 0; i < n; i += 6) {
      var sp = P(pts[i][0], pts[i][1], pts[i][2]);
      c.save(); c.translate(sp.x, sp.y); c.fillRect(-1.3, 0, 2.6, 130); c.restore();
    }
    var l = [], rgt = [];
    for (i = 0; i < n; i++) {
      var p0 = pts[i], p1 = pts[(i + 1) % n], dx = p1[0] - p0[0], dy = p1[1] - p0[1], dl = Math.sqrt(dx * dx + dy * dy);
      var nx = dl > 0.3 ? -dy / dl : 0, ny = dl > 0.3 ? dx / dl : 1;
      l.push(P(p0[0] + nx * 2.6, p0[1] + ny * 2.6, p0[2])); rgt.push(P(p0[0] - nx * 2.6, p0[1] - ny * 2.6, p0[2]));
    }
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1; c.beginPath();
    for (i = 0; i < n; i += 2) { c.moveTo(l[i].x, l[i].y); c.lineTo(rgt[i].x, rgt[i].y); }
    c.stroke();
    c.lineJoin = 'round';
    c.beginPath();
    for (var side = 0; side < 2; side++) {
      var arr = side ? rgt : l;
      c.moveTo(arr[0].x, arr[0].y);
      for (i = 1; i <= n; i++) c.lineTo(arr[i % n].x, arr[i % n].y);
    }
    c.lineWidth = 3.8; c.strokeStyle = 'rgba(80,30,90,0.6)'; c.stroke();
    c.lineWidth = 2.4; c.strokeStyle = '#ff5fa8'; c.stroke();
    c.lineWidth = 0.8; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.stroke();
    var dt = coaster.last < 0 ? 0 : clamp(S.t - coaster.last, 0, 0.1);
    coaster.last = S.t;
    var here = trackAt(coaster.s);
    coaster.s += dt * (46 + Math.sqrt(Math.max(0, 100 - here[2])) * 9);
    var cols = ['#ffd23f', '#35c8ff', '#7dff8a', '#ff5fd8', '#ff8a3a'];
    for (var car = 4; car >= 0; car--) {
      var s0 = coaster.s - car * 11, a = trackAt(s0), b = trackAt(s0 + 3);
      var pa = P(a[0], a[1], a[2]), pb = P(b[0], b[1], b[2]);
      var ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
      c.save(); c.translate(pa.x, pa.y - 2); c.rotate(ang);
      c.fillStyle = '#ffe0bd'; c.beginPath(); c.arc(0, -5, 1.9, 0, 7); c.fill();
      c.strokeStyle = '#ffe0bd'; c.lineWidth = 1; c.beginPath(); c.moveTo(-1.5, -4); c.lineTo(-3, -8 - Math.sin(now * 12 + car)); c.moveTo(1.5, -4); c.lineTo(3, -8 - Math.cos(now * 12 + car)); c.stroke();
      c.beginPath(); c.moveTo(-5, -3); c.lineTo(5, -3); c.quadraticCurveTo(6, 1.5, 4, 2); c.lineTo(-4, 2); c.quadraticCurveTo(-6, 1.5, -5, -3); c.closePath();
      c.fillStyle = cols[car]; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
      c.restore();
    }
  }
  on('backdrop', 'biz', function (r, S, H) {
    now = S.t; c = H.ctx;
    var ox = (r.ix - 1) * TILE, oy = (r.iy - 1) * TILE, ow = (r.iw + 2) * TILE, oh = (r.ih + 2) * TILE, Ly = oy + oh;
    function seen(pt, rad) {
      var sx = (pt.x - H.cam.x) * H.z + H.cssW / 2, sy = (pt.y - H.cam.y) * H.z + H.cssH / 2, m = rad * H.z;
      return sx > -m && sx < H.cssW + m && sy > -m && sy < H.cssH + m;
    }
    if (seen(P(ox - 78, Ly - 58, 62), 130)) billboard(ox - 110, Ly - 58, 62, 64, 34, 'L', 0);
    var b1 = P(ox - 70, oy + 40, 118 + Math.sin(now * 0.7) * 6);
    if (seen(b1, 30)) balloon(b1.x, b1.y, 13, BAL_COLS[0], 'Q');
    var b3 = P(ox - 260, oy - 60, 110 + Math.sin(now * 0.55 + 1) * 7);
    if (seen(b3, 30)) balloon(b3.x, b3.y, 10, BAL_COLS[2], null);
    if (seen(P(ox + ow + 90, oy + 80, 60), 130)) billboard(ox + ow + 90, oy + 110, 60, 60, 32, 'R', 2);
    var b2 = P(ox + ow + 120, oy + 50, 92 + Math.sin(now * 0.6 + 2) * 5);
    if (seen(b2, 30)) balloon(b2.x, b2.y, 12, BAL_COLS[1], null);
    if (seen(P(ox + 700, Ly + 290, 50), 260)) drawCoaster(ox + 700, Ly + 290, S);
    else coaster.last = -1;
    var b4 = P(ox + 250, Ly + 250, 70 + Math.sin(now * 0.5 + 3) * 6);
    if (seen(b4, 30)) balloon(b4.x, b4.y, 11, BAL_COLS[3], null);
    var span = ow + 400, ph = (now * BLIMP_SPEED) % (span * 2), bx = ph < span ? ph : span * 2 - ph;
    var bp = P(ox + 150 + bx, Ly + 560, 40 + Math.sin(now * 0.9) * 3);
    if (seen(bp, 70)) blimp(bp.x, bp.y, ph < span ? 1 : -1);
  });
})(window.QT || (window.QT = {}));
