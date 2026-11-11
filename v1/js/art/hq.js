(function (QT) {
  'use strict';
  var on = QT.Art.scope('hq');
  var Iso = QT.Iso, A = Iso.A, B = Iso.B, T = 16;
  var H = null, ctx = null, FONT = 'system-ui,sans-serif';
  function begin(h) { H = h; ctx = h.ctx; FONT = h.FONT; }
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function cl(v) { return Math.max(0, Math.min(255, Math.round(v))); }
  function hex(r, g, b) { return '#' + ((1 << 24) | (cl(r) << 16) | (cl(g) << 8) | cl(b)).toString(16).slice(1); }
  function mix(a, b, k) { var p = rgb(a), q = rgb(b); return hex(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k); }
  function sh(h, amt) { var p = rgb(h); return hex(p[0] + amt, p[1] + amt, p[2] + amt); }
  function rgba(h, a) { var p = rgb(h); return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + a + ')'; }
  function hsl(hh, s, l) { return 'hsl(' + Math.round(((hh % 360) + 360) % 360) + ',' + s + '%,' + l + '%)'; }
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function E(x, y, h) { return [(x - y) * A, (x + y) * B - (h || 0)]; }
  function mv(c, p) { c.moveTo(p[0], p[1]); }
  function ln(c, p) { c.lineTo(p[0], p[1]); }
  function box(c, x, y, w, d, base, hi, top, opt) { Iso.box(c, x, y, w, d, base, hi, top, opt); }
  function face(c, x, y, w, d, h) { Iso.facePath(c, x, y, w, d, h); }
  function quadL(c, x0, x1, y, h0, h1) {
    c.beginPath(); mv(c, E(x0, y, h0)); ln(c, E(x1, y, h0)); ln(c, E(x1, y, h1)); ln(c, E(x0, y, h1)); c.closePath();
  }
  function quadR(c, x, y0, y1, h0, h1) {
    c.beginPath(); mv(c, E(x, y0, h0)); ln(c, E(x, y1, h0)); ln(c, E(x, y1, h1)); ln(c, E(x, y0, h1)); c.closePath();
  }
  function faceL(c, x0, yF, hTop) { var o = E(x0, yF, hTop); c.transform(1, B / A, 0, 1, o[0], o[1]); }
  function faceR(c, xF, yF, hTop) { var o = E(xF, yF, hTop); c.transform(1, -B / A, 0, 1, o[0], o[1]); }
  function rrPts(x, y, w, d, r, seg) {
    r = Math.max(0, Math.min(r, w / 2, d / 2)); seg = seg || 5;
    var cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + d - r, 0], [x + r, y + d - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    var pts = [];
    for (var k = 0; k < 4; k++)
      for (var i = 0; i <= seg; i++) {
        var a = cs[k][2] + (Math.PI / 2) * i / seg;
        pts.push([cs[k][0] + Math.cos(a) * r, cs[k][1] + Math.sin(a) * r]);
      }
    return pts;
  }
  function prism(c, pts, base, hi, colL, colR, colTop) {
    var top = base + hi, n = pts.length;
    c.lineWidth = 0.6;
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      var nx = b[1] - a[1], ny = -(b[0] - a[0]), L = Math.sqrt(nx * nx + ny * ny);
      if (L < 1e-6) continue;
      nx /= L; ny /= L;
      if (nx + ny <= 0.02) continue;
      var k = Math.max(0, Math.min(1, (nx - ny + 1) / 2));
      var col = mix(colL, colR, k), gl = Math.max(0, 1 - Math.abs(k - 0.62) * 3.4);
      if (gl > 0) col = mix(col, '#ffffff', gl * 0.14);
      c.fillStyle = col; c.strokeStyle = col;
      c.beginPath(); mv(c, E(a[0], a[1], base)); ln(c, E(b[0], b[1], base)); ln(c, E(b[0], b[1], top)); ln(c, E(a[0], a[1], top)); c.closePath();
      c.fill(); c.stroke();
    }
    if (colTop) { topPath(c, pts, top); c.fillStyle = colTop; c.fill(); }
  }
  function topPath(c, pts, h) {
    c.beginPath();
    for (var i = 0; i < pts.length; i++) { var p = E(pts[i][0], pts[i][1], h); if (i) ln(c, p); else mv(c, p); }
    c.closePath();
  }
  function frontEdge(pts, h) {
    var out = [], n = pts.length, run = [];
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      var nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx + ny > 0.02 * Math.sqrt(nx * nx + ny * ny)) {
        if (!run.length) run.push([a[0], a[1], h]);
        run.push([b[0], b[1], h]);
      } else if (run.length) { out.push(run); run = []; }
    }
    if (run.length) out.push(run);
    if (out.length > 1 && out[0][0][0] === out[out.length - 1][out[out.length - 1].length - 1][0] &&
        out[0][0][1] === out[out.length - 1][out[out.length - 1].length - 1][1]) {
      var last = out.pop(); out[0] = last.concat(out[0].slice(1));
    }
    return out;
  }
  function windows(c, x, y, w, d, h0, h1, o) {
    var fh = o.fh || 7, cw = o.cw || 6, m = o.m == null ? 3 : o.m, seed = o.seed || 1;
    var wr = o.wr || 0.55, hr = o.hr || 0.6;
    var cols = o.cols || ['#ffd86b', '#fff1b8', '#9fe8ff'], off = o.off || 'rgba(10,8,30,0.55)';
    for (var hh = h0 + 2; hh + fh * hr <= h1 - 1; hh += fh) {
      for (var u = x + m; u + cw * wr <= x + w - m + 0.01; u += cw) {
        var r = rnd(seed + u * 3.1 + hh * 7.7);
        c.fillStyle = r < (o.lit || 0.72) ? cols[Math.floor(r * 97) % cols.length] : off;
        quadL(c, u, u + cw * wr, y + d, hh, hh + fh * hr); c.fill();
      }
      for (var v = y + d - m; v - cw * wr >= y + m - 0.01; v -= cw) {
        var r2 = rnd(seed + 50 + v * 3.3 + hh * 5.1);
        c.fillStyle = r2 < (o.lit || 0.72) ? cols[Math.floor(r2 * 89) % cols.length] : off;
        quadR(c, x + w, v, v - cw * wr, hh, hh + fh * hr); c.fill();
      }
    }
  }
  function glowStroke(c, col, lw, blur) {
    c.save(); c.shadowColor = col; c.shadowBlur = blur || 6; c.strokeStyle = col; c.lineWidth = lw || 1; c.stroke(); c.restore();
  }
  function neonText(c, s, x, y, size, col, core, blur, weight) {
    c.save();
    c.font = (weight || 900) + ' ' + size + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = col; c.shadowBlur = blur == null ? 7 : blur;
    c.fillStyle = col; c.fillText(s, x, y); c.fillText(s, x, y);
    c.shadowBlur = 0; c.fillStyle = core || '#ffffff'; c.fillText(s, x, y);
    c.restore();
  }
  function popText(c, s, x, y, size, fill, stroke, lw) {
    c.save();
    c.font = '900 ' + size + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = lw || 2.4; c.strokeStyle = stroke; c.strokeText(s, x, y);
    c.fillStyle = fill; c.fillText(s, x, y);
    c.restore();
  }
  function sparkle(c, x, y, r, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
    c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
  }
  function rrect(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  var SPR = {};
  function sprite(key, ver, bb, draw) {
    var m = ctx.getTransform(), s = m.a, e = SPR[key];
    if (!e || e.s !== s || e.ver !== ver) {
      var cv = (e && e.c) || document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(bb.w * s) + 2); cv.height = Math.max(1, Math.ceil(bb.h * s) + 2);
      var oc = cv.getContext('2d');
      oc.setTransform(s, 0, 0, s, 1 - bb.x * s, 1 - bb.y * s);
      oc.lineJoin = 'round'; oc.lineCap = 'round';
      draw(oc);
      e = SPR[key] = { c: cv, s: s, ver: ver };
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(e.c, Math.round(m.a * bb.x + m.e - 1), Math.round(m.d * bb.y + m.f - 1));
    ctx.restore();
  }
  var TXT = {};
  function tImg(text, size, col, weight) {
    var s = ctx.getTransform().a, key = text + '|' + size + '|' + col + '|' + (weight || 800), e = TXT[key];
    if (!e || e.s !== s) {
      var cv = (e && e.c) || document.createElement('canvas'), c2 = cv.getContext('2d');
      var font = (weight || 800) + ' ' + size + 'px ' + FONT;
      c2.font = font;
      var w = Math.ceil(c2.measureText(text).width) + 2, h = size + 2;
      cv.width = Math.max(1, Math.ceil(w * s)); cv.height = Math.max(1, Math.ceil(h * s));
      c2 = cv.getContext('2d'); c2.setTransform(s, 0, 0, s, 0, 0);
      c2.font = font; c2.textBaseline = 'middle'; c2.textAlign = 'left'; c2.fillStyle = col; c2.fillText(text, 1, h / 2 + 0.3);
      e = TXT[key] = { c: cv, s: s, w: w, h: h };
    }
    return e;
  }
  function tDraw(c, text, x, y, size, col, weight) {
    var e = tImg(text, size, col, weight);
    c.drawImage(e.c, x - e.w / 2, y - e.h / 2, e.w, e.h);
    return e;
  }
  function ticker(c, text, size, col, t, speed, y) {
    var e = tImg(text, size, col, 800), off = -((t * speed) % e.w);
    c.drawImage(e.c, off, y - e.h / 2, e.w, e.h); c.drawImage(e.c, off + e.w, y - e.h / 2, e.w, e.h);
    return off;
  }
  function visible(bb) {
    var z = H.z, cam = H.cam, hw = H.cssW / 2 / z + 6, hh = H.cssH / 2 / z + 6;
    return bb.x < cam.x + hw && bb.x + bb.w > cam.x - hw && bb.y < cam.y + hh && bb.y + bb.h > cam.y - hh;
  }
  function plotBB(g, hTop, pad) {
    var l = (g.x - g.y - g.d) * A - pad, r = (g.x + g.w - g.y) * A + pad;
    var t = (g.x + g.y) * B - hTop - pad, b = (g.x + g.w + g.y + g.d) * B + pad;
    return { x: l, y: t, w: r - l, h: b - t };
  }
  var B_ON = [], B_OFF = [], GLOW = {};
  function bulbs(c, lines, step, t, colOn, colOff, sz, speed) {
    sz = sz || 1.1;
    var k = Math.floor(t * (speed || 9)), idx = 0, nOn = 0, nOff = 0;
    for (var li = 0; li < lines.length; li++) {
      var pts = lines[li];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], ah = a[2] || 0;
        var dx = b[0] - a[0], dy = b[1] - a[1], dh = (b[2] || 0) - ah;
        var L = Math.sqrt(dx * dx + dy * dy + dh * dh), n = Math.max(1, Math.round(L / step));
        for (var j = 0; j < n; j++) {
          var f = j / n, wx = a[0] + dx * f, wy = a[1] + dy * f;
          var sx = (wx - wy) * A, sy = (wx + wy) * B - ah - dh * f;
          if ((idx + k) % 3 === 0) { B_ON[nOn++] = sx; B_ON[nOn++] = sy; } else { B_OFF[nOff++] = sx; B_OFF[nOff++] = sy; }
          idx++;
        }
      }
    }
    var i2, h1 = sz * 0.5, h2 = sz * 1.3, h3 = sz * 0.6;
    c.fillStyle = colOff; c.beginPath();
    for (i2 = 0; i2 < nOff; i2 += 2) c.rect(B_OFF[i2] - h1, B_OFF[i2 + 1] - h1, sz, sz);
    c.fill();
    c.fillStyle = GLOW[colOn] || (GLOW[colOn] = rgba(colOn, 0.28)); c.beginPath();
    for (i2 = 0; i2 < nOn; i2 += 2) c.rect(B_ON[i2] - h2, B_ON[i2 + 1] - h2, h2 * 2, h2 * 2);
    c.fill();
    c.fillStyle = colOn; c.beginPath();
    for (i2 = 0; i2 < nOn; i2 += 2) c.rect(B_ON[i2] - h3, B_ON[i2 + 1] - h3, h3 * 2, h3 * 2);
    c.fill();
  }
  var MEMO = {};
  function memo(key, fn) { return MEMO[key] || (MEMO[key] = fn()); }
  function rimLines(x, y, w, d, h, all) {
    var l = [[[x, y + d, h], [x + w, y + d, h], [x + w, y, h]]];
    if (all) l.push([[x + w, y, h], [x, y, h], [x, y + d, h]]);
    return l;
  }
  function volHit(v, gx, gy, sx, sy) {
    if (v.length === 4) {
      var e = E(gx + v[0], gy + v[1], v[2]), dx = sx - e[0], dy = sy - e[1];
      return dx * dx + dy * dy < v[3] * v[3];
    }
    var X0 = gx + v[0], Y0 = gy + v[1], X1 = gx + v[2], Y1 = gy + v[3], d = sx / A;
    if (d < X0 - Y1 || d > X1 - Y0) return false;
    var yb = Math.max(Y0, X0 - d), yf = Math.min(Y1, X1 - d);
    return sy > (2 * yb + d) * B - v[4] && sy < (2 * yf + d) * B;
  }
  function volsHit(vols, g, sx, sy) {
    for (var i = 0; i < vols.length; i++) if (volHit(vols[i], g.x, g.y, sx, sy)) return true;
    return false;
  }
  function padHidden(vols, g, pad) {
    var wx = (pad.x + 0.5) * T, wy = (pad.y + 0.5) * T, sx = (wx - wy) * A, sy = (wx + wy) * B;
    return volsHit(vols, g, sx, sy) || volsHit(vols, g, sx - 7, sy) || volsHit(vols, g, sx + 7, sy);
  }
  var OCC = {};
  function occluded(id, p, g, lv, vols) {
    var pads = H.G.PADS(), key = lv + ':' + pads.length, e = OCC[id];
    if (e && e.key === key) return e.list;
    var list = [];
    for (var i = 0; i < pads.length; i++) {
      var pad = pads[i];
      if (!pad.p || pad.p === p || pad.p.room !== 'hq') continue;
      if (padHidden(vols, g, pad)) list.push({ pad: pad, x: (pad.x + 0.5) * T, y: (pad.y + 0.5) * T });
    }
    OCC[id] = { key: key, list: list };
    return list;
  }
  var FADE = {};
  function fadeFor(p, S, g, vols, occ) {
    var pl = S.player, target = 1, hr = hqRoom();
    if (pl.y > (hr.iy - 1) * T && pl.y < hr.wallBottom * T) {
      if (pl.x < g.x + g.w && pl.y < g.y + g.d && volsHit(vols, g, (pl.x - pl.y) * A, (pl.x + pl.y) * B - 10)) target = 0.38;
      for (var i = 0; i < occ.length; i++) {
        var o = occ[i];
        if (Math.abs(pl.x - o.x) + Math.abs(pl.y - o.y) < 60 && H.G.padActive(o.pad)) { target = Math.min(target, 0.42); break; }
      }
    }
    var cur = FADE[p.id] == null ? 1 : FADE[p.id];
    cur += (target - cur) * 0.18;
    if (Math.abs(cur - target) < 0.01) cur = target;
    FADE[p.id] = cur;
    return cur;
  }
  function geo(p) { return { x: p.x * T, y: p.y * T, w: p.w * T, d: p.h * T }; }
  function plinth(c, g, col, h, inset) {
    var i = inset == null ? 2 : inset;
    c.fillStyle = rgba(col, 0.18); face(c, g.x + 1, g.y + 1, g.w - 2, g.d - 2, 0.2); c.fill();
    box(c, g.x + i, g.y + i, g.w - i * 2, g.d - i * 2, 0, h || 3, '#2a2250', { left: '#141029', right: '#1d1738' });
    face(c, g.x + i, g.y + i, g.w - i * 2, g.d - i * 2, h || 3);
    glowStroke(c, col, 0.9, 5);
  }
  var DEF = {};
  DEF.pharma = {
    hb: function (lv) { return 26 + 9 * lv; },
    top: function (lv) { return this.hb(lv) + 40 + 3 * lv; },
    vol: function (lv) { return [[6, 5, 38, 35, 3 + this.hb(lv) + 2], [38, 16, 60, 42, 3 + 12 + 2 * lv + 12]]; },
    body: function (c, g, lv, col) {
      var hb = this.hb(lv);
      plinth(c, g, col);
      var wp = rrPts(g.x + 38, g.y + 16, 22, 26, 6);
      prism(c, wp, 3, 12 + 2 * lv, '#b9d6cb', '#e6f7ef', '#f4fffa');
      prism(c, wp, 7, 4, '#1e7a57', '#3fd69a', null);
      if (lv >= 3) prism(c, wp, 13 + 2 * lv - 5, 3, '#1e7a57', '#3fd69a', null);
      var tp = rrPts(g.x + 6, g.y + 5, 32, 30, 13, 7);
      prism(c, tp, 3, hb, '#d4efe4', '#f4fffa', null);
      for (var f = 0, hh = 6; hh + 6 < hb; hh += 8, f++) {
        var lit = rnd(f * 3 + lv) < 0.8;
        prism(c, tp, hh, 5.5, lit ? '#1f8a62' : '#123d33', lit ? '#62f0b8' : '#1d5a48', null);
      }
      topPath(c, tp, 3 + hb); c.fillStyle = '#eafff6'; c.fill();
      var rc = E(g.x + 22, g.y + 20, 3 + hb);
      c.fillStyle = 'rgba(160,255,215,0.35)';
      c.beginPath(); c.ellipse(rc[0], rc[1], 11, 6, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(rc[0], rc[1] - 1, 9, 9, 0, Math.PI, 0); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.7;
      c.beginPath(); c.ellipse(rc[0], rc[1] - 1, 9, 9, 0, Math.PI, 0); c.stroke();
      var cc = E(g.x + 49, g.y + 29, 3 + 12 + 2 * lv + 9);
      c.save(); c.shadowColor = '#3dff9e'; c.shadowBlur = 8; c.fillStyle = '#3dff9e';
      c.fillRect(cc[0] - 1.8, cc[1] - 6, 3.6, 12); c.fillRect(cc[0] - 6, cc[1] - 1.8, 12, 3.6);
      c.restore();
      c.fillStyle = '#eafff4'; c.fillRect(cc[0] - 0.9, cc[1] - 5, 1.8, 10); c.fillRect(cc[0] - 5, cc[1] - 0.9, 10, 1.8);
      c.strokeStyle = '#8aa'; c.lineWidth = 0.8; var cb = E(g.x + 49, g.y + 29, 15 + 2 * lv);
      c.beginPath(); c.moveTo(cb[0], cb[1]); c.lineTo(cc[0], cc[1] + 6); c.stroke();
    },
    live: function (c, g, lv, t) {
      var hb = this.hb(lv);
      bulbs(c, memo('ph' + lv, function () { return frontEdge(rrPts(g.x + 6, g.y + 5, 32, 30, 13, 7), 3 + hb + 0.5); }), 4, t, '#fffbe0', 'rgba(90,70,40,0.9)', 1.1);
      var b0 = E(g.x + 22, g.y + 20, 3 + hb + 4), len = 26 + 3 * lv, n = 16, i;
      var gA = [], gB = [];
      c.strokeStyle = 'rgba(180,255,230,0.45)'; c.lineWidth = 0.8; c.beginPath();
      for (i = 0; i < n; i++) {
        var v = i / (n - 1), y = b0[1] - v * len, ph = t * 2.2 + v * 7.5;
        var xa = b0[0] + Math.sin(ph) * 6.5, xb = b0[0] - Math.sin(ph) * 6.5;
        if (i % 2 === 0) { c.moveTo(xa, y); c.lineTo(xb, y); }
        gA.push(xa, y, Math.cos(ph)); gB.push(xb, y, -Math.cos(ph));
      }
      c.stroke();
      c.fillStyle = 'rgba(61,255,158,0.25)'; c.beginPath(); c.ellipse(b0[0], b0[1] - len / 2, 11, len / 2 + 5, 0, 0, Math.PI * 2); c.fill();
      function strand(arr, col) {
        c.fillStyle = col; c.beginPath();
        for (var k = 0; k < arr.length; k += 3) { var r = 1.3 + 0.6 * arr[k + 2]; c.moveTo(arr[k] + r, arr[k + 1]); c.arc(arr[k], arr[k + 1], r, 0, Math.PI * 2); }
        c.fill();
      }
      strand(gA, '#3dff9e'); strand(gB, '#7fe8ff');
      var m0 = E(g.x + 22, g.y + 20, 3 + hb + 4 + len * 0.55);
      c.fillStyle = '#ffffff';
      for (i = 0; i < 3; i++) {
        var a = t * (1.6 + i * 0.4) + i * 2.1;
        c.beginPath(); c.arc(m0[0] + Math.cos(a) * 15, m0[1] + Math.sin(a) * 5, 1.4, 0, Math.PI * 2); c.fill();
      }
    }
  };
  DEF.fin = {
    hh: function (lv) { return 19 + Math.round(lv * 0.8); },
    hb: function (lv) { return 40 + 7 * lv; },
    h1: function (lv) { return this.hh(lv) + 16; },
    top: function (lv) { return 3 + this.hb(lv) + 34; },
    vol: function (lv) {
      var hh = this.hh(lv);
      return [[6, 20, 62, 38, 3 + hh + 1], [45, 2, 62, 16, 3 + this.hb(lv) + 16], [36, 40, 54, 47, 13], [12, 29, 3 + hh + 7, 5.5]];
    },
    body: function (c, g, lv, col) {
      var hh = this.hh(lv), hb = this.hb(lv), h1 = this.h1(lv), h2 = Math.round(h1 + (hb - h1) * 0.55), tb = 3 + hb, i;
      var gold = '#e8b422', x = g.x, y = g.y;
      plinth(c, g, col);
      var win = { fh: 5.5, cw: 4.5, m: 2, wr: 0.5, cols: ['#ffd86b', '#fff1b8', '#ffc44a'], off: 'rgba(15,10,30,0.7)' };
      box(c, x + 45, y + 2, 17, 14, 3, h1, '#2e2444', { left: '#1a1428', right: '#241b38' });
      win.seed = 11; windows(c, x + 45, y + 2, 17, 14, 3 + hh - 3, 3 + h1 - 1, win);
      box(c, x + 46.5, y + 3.5, 14, 11, 3 + h1, h2 - h1, '#342a4c', { left: '#1d1630', right: '#2a2042' });
      box(c, x + 45, y + 2, 17, 14, 3 + h1 - 0.6, 1.4, gold, { top: '#ffd85a' });
      win.seed = 23; windows(c, x + 46.5, y + 3.5, 14, 11, 3 + h1, 3 + h2, win);
      box(c, x + 48, y + 5, 11, 8, 3 + h2, hb - h2, '#3a2f54', { left: '#201934', right: '#30254a' });
      box(c, x + 46.5, y + 3.5, 14, 11, 3 + h2 - 0.6, 1.4, gold, { top: '#ffd85a' });
      win.seed = 37; windows(c, x + 48, y + 5, 11, 8, 3 + h2, tb, win);
      c.strokeStyle = 'rgba(255,212,90,0.8)'; c.lineWidth = 0.6;
      for (i = 0; i < 3; i++) { c.beginPath(); mv(c, E(x + 50 + i * 3.2, y + 13, 3 + h2)); ln(c, E(x + 50 + i * 3.2, y + 13, tb)); c.stroke(); }
      c.beginPath();
      [[x + 45, y + 16, 3 + hh, 3 + h1], [x + 62, y + 16, 3 + hh - 2, 3 + h1], [x + 62, y + 2, 3, 3 + h1],
       [x + 46.5, y + 14.5, 3 + h1, 3 + h2], [x + 60.5, y + 14.5, 3 + h1, 3 + h2], [x + 60.5, y + 3.5, 3 + h1, 3 + h2],
       [x + 48, y + 13, 3 + h2, tb], [x + 59, y + 13, 3 + h2, tb], [x + 59, y + 5, 3 + h2, tb]].forEach(function (e2) {
        mv(c, E(e2[0], e2[1], e2[2])); ln(c, E(e2[0], e2[1], e2[3]));
      });
      glowStroke(c, '#ffd85a', 0.8, 5);
      box(c, x + 47, y + 4, 13, 10, tb, 2.2, gold, { top: '#ffd85a' });
      box(c, x + 49, y + 6, 9, 6, tb + 2.2, 4, '#c8901a', { top: '#ffcf4a' });
      box(c, x + 51, y + 7, 5, 4, tb + 6.2, 4, '#b07c10', { top: '#ffc93a' });
      var s0 = E(x + 53.5, y + 9, tb + 10), s1 = E(x + 53.5, y + 9, tb + 22 + (lv >= 5 ? 4 : 0));
      c.strokeStyle = '#ffd85a'; c.lineWidth = 1.5; c.beginPath(); mv(c, s0); ln(c, s1); c.stroke();
      c.fillStyle = '#07070f'; quadL(c, x + 46.5, x + 60.5, y + 16, 3 + hh + 1.5, 3 + h1 - 2); c.fill();
      c.strokeStyle = gold; c.lineWidth = 0.7; quadL(c, x + 46.5, x + 60.5, y + 16, 3 + hh + 1.5, 3 + h1 - 2); c.stroke();
      box(c, x + 6, y + 20, 56, 18, 3, hh, '#241c38', { left: '#17112a', right: '#221a3a' });
      c.fillStyle = '#ffcf6a'; quadL(c, x + 8, x + 60, y + 38, 4, 3 + hh - 9); c.fill();
      c.fillStyle = 'rgba(40,20,10,0.35)'; quadL(c, x + 8, x + 60, y + 38, 4, 7); c.fill();
      for (i = 0; i < 8; i++) {
        var cx0 = x + 8 + i * 7.2;
        c.fillStyle = '#f4d27a'; quadL(c, cx0, cx0 + 2.2, y + 38, 3, 3 + hh - 8); c.fill();
        c.fillStyle = '#b8861a'; quadL(c, cx0 + 1.5, cx0 + 2.2, y + 38, 3, 3 + hh - 8); c.fill();
      }
      c.fillStyle = gold; quadL(c, x + 6, x + 62, y + 38, 3 + hh - 8.5, 3 + hh - 7.5); c.fill();
      windows(c, x + 6, y + 20, 56, 18, 3, 3 + hh - 8, { fh: 6, cw: 5, m: 3, wr: 0.45, cols: ['#ffd86b', '#fff1b8'], off: 'rgba(15,10,30,0.7)', seed: 51, lit: 0.8 });
      c.fillStyle = '#07060e'; quadL(c, x + 6, x + 62, y + 38, 3 + hh - 7, 3 + hh - 1); c.fill();
      quadR(c, x + 62, y + 38, y + 20, 3 + hh - 7, 3 + hh - 1); c.fill();
      box(c, x + 5.5, y + 19.5, 57, 19, 3 + hh - 0.8, 1.6, gold, { top: '#3a2f54' });
      face(c, x + 5.5, y + 19.5, 57, 19, 3 + hh + 0.8); c.strokeStyle = '#ffd85a'; c.lineWidth = 0.8; c.stroke();
      box(c, x + 10, y + 27, 4, 4, 3 + hh + 0.8, 2, '#c8901a', { top: '#ffcf4a' });
      box(c, x + 36, y + 41, 18, 6, 3, 3, '#f0ecf4', { left: '#a8a2b8', right: '#cfc8dc' });
      var bp = E(x + 45, y + 44, 6);
      c.save(); c.translate(bp[0], bp[1]);
      c.fillStyle = '#8a5a08';
      [[-5, -3.2], [-2.6, -3.2], [2.6, -3.4], [5, -3.4]].forEach(function (l, k) { c.fillRect(l[0] + (k > 1 ? 0.6 : 0), l[1], 1.4, 3.4); });
      c.fillStyle = '#e8b422';
      c.beginPath(); c.ellipse(0, -5.2, 6.5, 3.2, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(3.2, -6.4, 3.6, 3.1, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(7.2, -4, 2.4, 1.9, 0.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffe28a'; c.beginPath(); c.ellipse(1.5, -7, 4, 1.2, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#fff1b8'; c.lineWidth = 0.9; c.lineCap = 'round';
      c.beginPath(); c.moveTo(6.6, -5.6); c.quadraticCurveTo(8.2, -8.6, 10.2, -8.4); c.moveTo(6, -5.8); c.quadraticCurveTo(5.6, -9, 7.2, -9.8); c.stroke();
      c.strokeStyle = '#b8861a'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(-6.2, -6); c.quadraticCurveTo(-8.6, -6.6, -9, -9); c.stroke();
      c.restore();
    },
    live: function (c, g, lv, t) {
      var hh = this.hh(lv), hb = this.hb(lv), h1 = this.h1(lv), h2 = Math.round(h1 + (hb - h1) * 0.55), tb = 3 + hb, x = g.x, y = g.y, i;
      var msg = '  QTYC ▲ 12.8%   NIKKEI ▲ 1.2%   Q-BOND ▼ 0.3%   YEN ▲ 0.4%   ';
      c.save(); quadL(c, x + 6, x + 62, y + 38, 3 + hh - 7, 3 + hh - 1); c.clip();
      faceL(c, x + 6, y + 38, 3 + hh - 1); ticker(c, msg, 5, '#6dff8a', t, 14, 3);
      c.restore();
      c.save(); quadR(c, x + 62, y + 38, y + 20, 3 + hh - 7, 3 + hh - 1); c.clip();
      faceR(c, x + 62, y + 38, 3 + hh - 1); ticker(c, msg, 5, '#ffd24a', t + 56 * A / 14, 14, 3);
      c.restore();
      c.save(); faceL(c, x + 46.5, y + 16, 3 + h1 - 2);
      var cw = 14 * A, chh = h1 - hh - 3.5, step = Math.floor(t * 1.5);
      for (i = 0; i < 5; i++) {
        var k = i + step, o = rnd(k) * 0.5 + i * 0.09, up = rnd(k + 9) > 0.35;
        var y0 = chh * (0.9 - o * 0.9), hgt = 1.5 + rnd(k + 3) * chh * 0.35;
        c.fillStyle = up ? '#4dff88' : '#ff4d6a';
        c.fillRect(0.8 + i * (cw - 1.6) / 5, Math.max(0.6, y0 - hgt), 1.3, hgt);
      }
      c.restore();
      bulbs(c, rimLines(x + 5.5, y + 19.5, 57, 19, 3 + hh + 1), 4, t, '#fff4c0', 'rgba(110,80,20,0.9)', 1.1);
      if (lv >= 2) {
        bulbs(c, rimLines(x + 45, y + 2, 17, 14, 3 + h1 + 1), 3.2, t + 0.3, '#fff4c0', 'rgba(110,80,20,0.9)', 1);
        bulbs(c, rimLines(x + 46.5, y + 3.5, 14, 11, 3 + h2 + 1), 3.2, t + 0.6, '#fff4c0', 'rgba(110,80,20,0.9)', 1);
      }
      var cc = E(x + 12, y + 29, 3 + hh + 8.5 + Math.sin(t * 2) * 0.8), sx = Math.cos(t * 2.4);
      var rx = Math.max(0.9, Math.abs(sx) * 5);
      c.fillStyle = 'rgba(255,210,60,0.22)'; c.beginPath(); c.arc(cc[0], cc[1], 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#b07c10'; c.beginPath(); c.ellipse(cc[0] + (sx > 0 ? 0.6 : -0.6), cc[1], rx, 5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = sx > 0 ? '#ffd24a' : '#f0b020'; c.beginPath(); c.ellipse(cc[0], cc[1], rx, 5, 0, 0, Math.PI * 2); c.fill();
      if (Math.abs(sx) > 0.4) { c.save(); c.translate(cc[0], cc[1]); c.scale(sx, 1); tDraw(c, '¥', 0, 0.5, 6.5, '#9a6a08', 900); c.restore(); }
      var tip = E(x + 53.5, y + 9, tb + 10);
      if (lv >= 3) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (i = 0; i < (lv >= 5 ? 2 : 1); i++) {
          var a = Math.sin(t * 0.7 + i * 2.4) * 0.6 + (i ? 0.25 : -0.25);
          c.save(); c.translate(tip[0], tip[1]); c.rotate(a);
          c.fillStyle = 'rgba(255,230,150,0.13)'; c.beginPath(); c.moveTo(-1.5, 0); c.lineTo(1.5, 0); c.lineTo(9, -110); c.lineTo(-9, -110); c.closePath(); c.fill();
          c.restore();
        }
        c.restore();
      }
      var sp = E(x + 53.5, y + 9, tb + 22 + (lv >= 5 ? 4 : 0));
      c.fillStyle = Math.sin(t * 3.5) > 0 ? '#ff3a3a' : '#661818'; c.beginPath(); c.arc(sp[0], sp[1], 1.3, 0, Math.PI * 2); c.fill();
      if (lv >= 6) {
        c.fillStyle = '#ffd24a'; c.beginPath();
        for (i = 0; i < 10; i++) {
          var f = (t * 0.5 + i / 10) % 1, cxw = x + 42 + rnd(i) * 22, cyw = y + 18 + rnd(i + 5) * 4;
          var q = E(cxw, cyw, tb + 16 - f * (tb - hh));
          c.rect(q[0] - 1, q[1] - 0.6 + Math.sin(t * 8 + i) * 0.3, 2, 1.2);
        }
        c.fill();
      }
      if (lv >= 4 && Math.sin(t * 3) > 0.3) { var bs = E(x + 48, y + 44, 14); sparkle(c, bs[0], bs[1], 3.2, '#fff8d8'); }
    }
  };
  function tubePts(g, lv) {
    var R = 11 + (lv >= 4 ? 1 : 0), yc = g.y + 30, hc = 3 + R + 3, x0 = g.x + 2, x1 = g.x + 42;
    return { R: R, yc: yc, hc: hc, x0: x0, x1: x1, th: 18 + 8 * lv };
  }
  function tubeRing(c, tu, x, r, a0, a1, n) {
    for (var j = 0; j <= n; j++) {
      var a = a0 + (a1 - a0) * j / n, p = E(x, tu.yc + r * Math.cos(a), tu.hc + r * Math.sin(a));
      if (j) ln(c, p); else mv(c, p);
    }
  }
  var TRACK = null;
  function trackPts(g) {
    if (!TRACK || TRACK.gx !== g.x) TRACK = { gx: g.x, o: rrPts(g.x + 1.5, g.y + 1.5, 61, 45, 12, 5), m: rrPts(g.x + 3.2, g.y + 3.2, 57.6, 41.6, 10.5, 5) };
    return TRACK;
  }
  function trackAt(pts, s) {
    var n = pts.length, tot = 0, i, L = [];
    for (i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n]; L.push(Math.hypot(b[0] - a[0], b[1] - a[1])); tot += L[i]; }
    s = ((s % tot) + tot) % tot;
    for (i = 0; i < n; i++) {
      if (s <= L[i]) { var p = pts[i], q = pts[(i + 1) % n], f = s / (L[i] || 1); return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, Math.atan2(q[1] - p[1], q[0] - p[0])]; }
      s -= L[i];
    }
    return [pts[0][0], pts[0][1], 0];
  }
  function carAt(c, cx, cy, h, ang, len, wid, colBody, colTop) {
    var ca = Math.cos(ang), sa = Math.sin(ang), hl = len / 2, hw = wid / 2;
    function pts(l, w2) { return [[cx + ca * l - sa * -w2, cy + sa * l + ca * -w2], [cx + ca * l - sa * w2, cy + sa * l + ca * w2], [cx - ca * l - sa * w2, cy - sa * l + ca * w2], [cx - ca * l - sa * -w2, cy - sa * l + ca * -w2]]; }
    var p = pts(hl, hw);
    var cross = (p[1][0] - p[0][0]) * (p[2][1] - p[1][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[1][0]);
    if (cross < 0) p.reverse();
    prism(c, p, h, 2.6, sh(colBody, -70), colBody, colBody);
    var q = pts(hl * 0.45, hw * 0.8);
    var cr2 = (q[1][0] - q[0][0]) * (q[2][1] - q[1][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[1][0]);
    if (cr2 < 0) q.reverse();
    prism(c, q, h + 2.6, 2, '#1a2240', '#5a8ad0', colTop || '#2a3560');
    var hlp = E(cx + ca * hl, cy + sa * hl, h + 1.6);
    c.fillStyle = '#fff6c0'; c.fillRect(hlp[0] - 0.8, hlp[1] - 0.6, 1.6, 1.2);
  }
  DEF.cae = {
    top: function (lv) { var tu = tubePts({ x: 0, y: 0 }, lv); return 3 + tu.th + 26; },
    vol: function (lv) {
      var tu = tubePts({ x: 0, y: 0 }, lv);
      return [[2, 30 - tu.R * 0.4, 44, 30 + tu.R, tu.hc + tu.R], [45, 1, 60, 15, 3 + tu.th + 12]];
    },
    body: function (c, g, lv, col) {
      var tu = tubePts(g, lv), R = tu.R, yc = tu.yc, hc = tu.hc, N = 24, i;
      plinth(c, g, col);
      if (lv >= 3) {
        var tr = trackPts(g);
        c.fillStyle = '#26222e'; topPath(c, tr.o, 3.15); c.fill();
        c.fillStyle = '#3a2a3a'; topPath(c, rrPts(g.x + 5, g.y + 5, 54, 38, 9, 5), 3.2); c.fill();
        c.save(); c.setLineDash([2.2, 2.2]); c.lineWidth = 0.9;
        c.strokeStyle = '#ffffff'; topPath(c, tr.o, 3.3); c.stroke();
        c.lineDashOffset = 2.2; c.strokeStyle = '#ff3b3b'; topPath(c, tr.o, 3.3); c.stroke();
        c.restore();
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.4; c.setLineDash([1.5, 2.5]); topPath(c, tr.m, 3.3); c.stroke(); c.setLineDash([]);
      }
      var th = tu.th, cp = rrPts(g.x + 47, g.y + 3, 11, 10, 4);
      prism(c, cp, 3, th - 8, '#c8c2c8', '#f4f0f2', null);
      for (var hh = 7; hh + 3 < th - 8; hh += 6) prism(c, cp, hh, 2.6, '#b8612a', '#ffb070', null);
      var cab = rrPts(g.x + 45, g.y + 1, 15, 14, 6);
      prism(c, cab, 3 + th - 8, 7, '#1a2a4a', '#3a6aa0', '#f4f0f2');
      prism(c, cab, 3 + th - 7, 4, '#ff9a4a', '#ffd0a0', null);
      box(c, g.x + 51.5, g.y + 7, 2, 2, 3 + th - 1, 5, '#8a8290');
      if (lv >= 2) {
        var tt = rrPts(g.x + 44.5, g.y + 27.5, 14, 14, 7, 6);
        prism(c, tt, 3, 1.8, '#3a3452', '#8a86b0', '#d8d4ee');
        topPath(c, tt, 4.8); glowStroke(c, '#ff9a3c', 0.8, 5);
      }
      [g.x + 8, g.x + 22, g.x + 36].forEach(function (sx) { box(c, sx - 2, yc - 3, 4, 6, 3, hc - R - 2, '#5a4a52'); });
      for (i = N - 1; i >= 0; i--) {
        var a0 = -Math.PI * 0.5 + (i / N) * Math.PI * 1.6, a1 = -Math.PI * 0.5 + ((i + 1) / N) * Math.PI * 1.6;
        var am = (a0 + a1) / 2, ny = Math.cos(am), nz = Math.sin(am);
        if (ny + nz * 2 * B <= 0) continue;
        var cf = mix('#b24a16', '#ffb070', Math.max(0, Math.min(1, nz * 0.75 + 0.25)));
        c.fillStyle = cf; c.strokeStyle = cf; c.lineWidth = 0.5;
        c.beginPath();
        mv(c, E(tu.x0, yc + R * Math.cos(a0), hc + R * Math.sin(a0))); ln(c, E(tu.x1, yc + R * Math.cos(a0), hc + R * Math.sin(a0)));
        ln(c, E(tu.x1, yc + R * Math.cos(a1), hc + R * Math.sin(a1))); ln(c, E(tu.x0, yc + R * Math.cos(a1), hc + R * Math.sin(a1)));
        c.closePath(); c.fill(); c.stroke();
      }
      c.strokeStyle = '#fff0e0'; c.lineWidth = 1.3;
      [tu.x0 + 3, tu.x1 - 3].forEach(function (rx) { c.beginPath(); tubeRing(c, tu, rx, R + 0.3, -0.3, Math.PI * 1.05, 12); c.stroke(); });
      var wx0 = g.x + 9, wx1 = g.x + 35, w0 = -0.35, w1 = 1.2;
      c.beginPath(); tubeRing(c, tu, wx0, R, w0, w1, 8);
      for (i = 8; i >= 0; i--) { var ab = w0 + (w1 - w0) * i / 8; ln(c, E(wx1, yc + R * Math.cos(ab), hc + R * Math.sin(ab))); }
      c.closePath(); c.fillStyle = '#0d1838'; c.fill();
      c.save(); c.clip();
      var fl = hc - R * 0.62;
      c.fillStyle = '#23345e'; face(c, wx0, yc - 10, wx1 - wx0, 20, fl); c.fill();
      c.strokeStyle = 'rgba(120,200,255,0.35)'; c.lineWidth = 0.4; c.beginPath();
      for (i = 0; i < 7; i++) { mv(c, E(wx0 + i * 4, yc - 10, fl)); ln(c, E(wx0 + i * 4, yc + 10, fl)); }
      c.stroke();
      var cx = g.x + 22, cy = yc + 1;
      box(c, cx - 8, cy - 4, 16, 8, fl + 1.2, 3, '#ff4040', { left: '#a3141f', right: '#d8232e' });
      box(c, cx - 3, cy - 3.4, 7, 6.8, fl + 4.2, 2.6, '#20284a', { left: '#1a2240', right: '#3a5a9a', top: '#2a3560' });
      c.fillStyle = '#111018';
      [[cx - 5, cy + 4], [cx + 5, cy + 4]].forEach(function (w) { var q = E(w[0], w[1], fl + 1.6); c.beginPath(); c.ellipse(q[0], q[1], 2, 1.6, 0, 0, Math.PI * 2); c.fill(); });
      var hl = E(cx + 8, cy + 2.5, fl + 3); c.fillStyle = '#fff6c0'; c.fillRect(hl[0] - 0.8, hl[1] - 0.8, 1.6, 1.3);
      c.restore();
      c.strokeStyle = '#ffe0c0'; c.lineWidth = 1;
      c.beginPath(); tubeRing(c, tu, wx0, R, w0, w1, 8);
      for (i = 8; i >= 0; i--) { var ad = w0 + (w1 - w0) * i / 8; ln(c, E(wx1, yc + R * Math.cos(ad), hc + R * Math.sin(ad))); }
      c.closePath(); c.stroke();
      c.beginPath(); tubeRing(c, tu, tu.x1 + 1, R + 1.8, 0, Math.PI * 2, 26); c.closePath(); c.fillStyle = '#ff9a4a'; c.fill();
      c.beginPath(); tubeRing(c, tu, tu.x1 + 1.2, R - 1.2, 0, Math.PI * 2, 26); c.closePath(); c.fillStyle = '#1a1020'; c.fill();
      if (lv >= 5) {
        [[g.x + 3, g.y + 45], [g.x + 61, g.y + 45]].forEach(function (q) {
          var b0 = E(q[0], q[1], 3), b1 = E(q[0], q[1], 19);
          c.strokeStyle = '#e8e8f0'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.stroke();
          for (var fy = 0; fy < 3; fy++) for (var fx = 0; fx < 4; fx++) {
            c.fillStyle = (fx + fy) % 2 ? '#111' : '#fff';
            c.fillRect(b1[0] + fx * 2, b1[1] + fy * 2 + fx * 0.4, 2, 2);
          }
        });
      }
    },
    live: function (c, g, lv, t) {
      var tu = tubePts(g, lv), R = tu.R, yc = tu.yc, hc = tu.hc, i;
      var fc = E(tu.x1 + 1.3, yc, hc);
      c.save(); c.translate(fc[0], fc[1]); c.transform(1, -B / A, 0, 1, 0, 0);
      c.fillStyle = '#c8d0e0'; c.beginPath();
      for (i = 0; i < 5; i++) {
        var a = t * 9 + i * Math.PI * 0.4;
        c.moveTo(0, 0); c.lineTo(Math.cos(a) * (R - 2) * A, -Math.sin(a) * (R - 2)); c.lineTo(Math.cos(a + 0.45) * (R - 2) * A, -Math.sin(a + 0.45) * (R - 2)); c.closePath();
      }
      c.fill();
      c.fillStyle = '#ff9a4a'; c.beginPath(); c.arc(0, 0, 1.8, 0, Math.PI * 2); c.fill();
      c.restore();
      var wx0 = g.x + 9, wx1 = g.x + 35, fl = hc - R * 0.62, cx = g.x + 22;
      c.strokeStyle = 'rgba(120,235,255,0.95)'; c.lineWidth = 0.8; c.beginPath();
      for (var s = 0; s < 4; s++) {
        var baseH = fl + 2.5 + s * 2.2, yy = yc + 6 - s * 1.2, amp = 4.5 - s * 0.8;
        for (var d = 0; d < 3; d++) {
          var x = wx0 + ((t * 28 + d * 9 + s * 4) % (wx1 - wx0 - 5));
          var q0 = (x - cx) / 8, q1 = (x + 4 - cx) / 8;
          var p0 = E(x, yy, baseH + Math.max(0, 1 - q0 * q0) * amp), p1 = E(x + 4, yy, baseH + Math.max(0, 1 - q1 * q1) * amp);
          c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]);
        }
      }
      c.stroke();
      bulbs(c, [[[tu.x0 + 2, yc, hc + R + 0.6], [tu.x1 - 1, yc, hc + R + 0.6]]], 3.6, t, '#fff0c8', 'rgba(120,60,20,0.9)', 1.1);
      var th = tu.th, rd = E(g.x + 52.5, g.y + 8, 3 + th + 4.5), ra = t * 2.2;
      c.strokeStyle = '#e8e8f0'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(rd[0] - Math.cos(ra) * 5, rd[1] - Math.sin(ra) * 1.6); c.lineTo(rd[0] + Math.cos(ra) * 5, rd[1] + Math.sin(ra) * 1.6); c.stroke();
      c.fillStyle = '#ff9a4a'; c.beginPath(); c.arc(rd[0], rd[1], 1.1, 0, Math.PI * 2); c.fill();
      if (Math.sin(t * 3) > 0) { var bl = E(g.x + 52.5, g.y + 8, 3 + th + 7); c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(bl[0], bl[1], 1.3, 0, Math.PI * 2); c.fill(); }
      if (lv >= 3) bulbs(c, memo('caeCab' + lv, function () { return frontEdge(rrPts(g.x + 45, g.y + 1, 15, 14, 6), 3 + th - 0.6); }), 3, t, '#ffe0b0', 'rgba(120,60,20,0.9)', 1);
      if (lv >= 2) {
        var ang = t * 0.6;
        if (lv >= 6) {
          c.save(); c.globalCompositeOperation = 'lighter';
          var src = E(g.x + 52.5, g.y + 8, 3 + th - 4), tg = E(g.x + 51.5, g.y + 34.5, 5);
          c.fillStyle = 'rgba(255,240,200,0.16)'; c.beginPath(); c.moveTo(src[0], src[1]); c.lineTo(tg[0] - 10, tg[1]); c.lineTo(tg[0] + 10, tg[1]); c.closePath(); c.fill();
          c.beginPath(); c.ellipse(tg[0], tg[1], 11, 5.5, 0, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        carAt(c, g.x + 51.5, g.y + 34.5, 4.8, ang, 11, 5.5, lv >= 4 ? '#ffd24a' : '#50dcff', null);
      }
      if (lv >= 3) {
        var tr = trackPts(g);
        for (var k = 0; k < (lv >= 5 ? 2 : 1); k++) {
          var pp = trackAt(tr.m, t * 60 - k * 70);
          if (pp[1] < g.y + 40 && pp[0] < g.x + 58) continue;
          carAt(c, pp[0], pp[1], 3.3, pp[2], 7, 3.6, k ? '#50dcff' : '#ff3b3b', k ? '#f0ffff' : '#fff0f0');
        }
      }
    }
  };
  DEF.opt = {
    hb: function (lv) { return 30 + 8 * lv; },
    top: function (lv) { return 3 + this.hb(lv) + 52; },
    racks: function (lv) { return Math.min(4, 1 + Math.ceil(lv / 2)); },
    vol: function (lv) { return [[4, 24, 36, 46, 3 + this.hb(lv) + 2], [30, 4, 62, 20, 14], [44, 30, 58, 42, 20]]; },
    body: function (c, g, lv, col) {
      var hb = this.hb(lv), x = g.x, y = g.y, tp = rrPts(x + 4, y + 24, 32, 22, 9, 5), i;
      plinth(c, g, col);
      for (i = 0; i < this.racks(lv); i++) {
        var rx = x + 31 + i * 8;
        box(c, rx, y + 5, 6, 13, 3, 11, '#1c1a30', { left: '#0c0b18', right: '#15132a', top: '#2a2748' });
        c.strokeStyle = 'rgba(120,110,200,0.5)'; c.lineWidth = 0.4;
        for (var s = 0; s < 4; s++) { c.beginPath(); mv(c, E(rx, y + 18, 5 + s * 2.4)); ln(c, E(rx + 6, y + 18, 5 + s * 2.4)); c.stroke(); }
        box(c, rx + 1, y + 8, 4, 4, 14, 1.5, '#3a3858');
        var fp = E(rx + 3, y + 10, 15.6); c.fillStyle = '#10101c'; c.beginPath(); c.ellipse(fp[0], fp[1], 1.8, 1, 0, 0, Math.PI * 2); c.fill();
      }
      prism(c, tp, 3, hb, '#191238', '#2f2470', '#3b2d86');
      for (var hh = 9; hh < hb; hh += 8) prism(c, tp, hh, 1.1, '#6f57e0', '#c3b4ff', null);
      c.strokeStyle = 'rgba(140,240,255,0.75)'; c.lineWidth = 0.7;
      [[x + 6, y + 40], [x + 16, y + 46], [x + 30, y + 44], [x + 36, y + 30]].forEach(function (q, k) {
        c.beginPath(); mv(c, E(q[0], q[1], 5 + k * 3)); ln(c, E(q[0], q[1], 3 + hb - 4 - k * 5)); c.stroke();
      });
      var rc = E(x + 20, y + 35, 3 + hb);
      c.fillStyle = '#2a2060'; c.beginPath(); c.ellipse(rc[0], rc[1], 10, 5.5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(rc[0], rc[1], 10, 5.5, 0, 0, Math.PI * 2); glowStroke(c, '#b8a6ff', 1, 6);
      c.save(); faceL(c, x + 12, y + 46, 3 + Math.round(hb * 0.45));
      c.fillStyle = 'rgba(20,10,50,0.85)'; rrect(c, 0.5, -1, 9.5, 9, 2); c.fill();
      c.strokeStyle = '#b8a6ff'; c.lineWidth = 0.6; rrect(c, 0.5, -1, 9.5, 9, 2); c.stroke();
      neonText(c, 'AI', 5.2, 3.6, 6.4, '#c9b8ff', '#ffffff', 6);
      c.restore();
      c.strokeStyle = '#2a2458'; c.lineWidth = 1.6; c.beginPath(); mv(c, E(x + 34, y + 19, 3.3)); ln(c, E(x + 34, y + 30, 3.3)); ln(c, E(x + 36, y + 32, 3.3)); c.stroke();
      if (lv >= 3) {
        var bpts = rrPts(x + 46, y + 32, 10, 10, 5, 4);
        prism(c, bpts, 3, 3, '#8a86a8', '#e8e4f8', '#f4f2ff');
        box(c, x + 44, y + 40, 6, 3, 3, 2.5, '#50dcff', { left: '#1a6a8a', right: '#2a90b0' });
      }
    },
    live: function (c, g, lv, t) {
      var hb = this.hb(lv), x = g.x, y = g.y, i;
      bulbs(c, memo('op' + lv, function () { return frontEdge(rrPts(x + 4, y + 24, 32, 22, 9, 5), 3 + hb + 0.4); }), 3.6, t, '#efe8ff', 'rgba(60,40,110,0.95)', 1.1);
      var nr = this.racks(lv);
      c.fillStyle = '#6dff8a'; c.beginPath();
      for (i = 0; i < nr * 8; i++) {
        var r = i >> 3, k = i & 7, on = rnd(i * 3 + Math.floor(t * 6 + r)) > 0.45;
        if (!on) continue;
        var lp = E(x + 32 + r * 8 + (k % 4) * 1.3, y + 18, 5.8 + Math.floor(k / 4) * 4.8);
        c.rect(lp[0] - 0.45, lp[1] - 0.45, 0.9, 0.9);
      }
      c.fill();
      if (lv >= 2) {
        c.fillStyle = '#9ff4ff'; c.beginPath();
        for (i = 0; i < 3; i++) {
          var f = (t * 0.8 + i / 3) % 1, pp = f < 0.85 ? E(x + 34, y + 19 + f / 0.85 * 11, 3.4) : E(x + 34 + (f - 0.85) / 0.15 * 2, y + 30 + (f - 0.85) / 0.15 * 2, 3.4);
          c.moveTo(pp[0] + 1.1, pp[1]); c.arc(pp[0], pp[1], 1.1, 0, Math.PI * 2);
        }
        c.fill();
      }
      if (lv >= 3) {
        var b0 = E(x + 51, y + 37, 6), sw = Math.sin(t * 1.2), lift = Math.max(0, Math.sin(t * 2.4)) * 3;
        var j1 = [b0[0] + sw * 2, b0[1] - 7], j2 = [j1[0] + 4 + sw * 3, j1[1] - 2 + lift];
        c.strokeStyle = '#f4f2ff'; c.lineWidth = 2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(j1[0], j1[1]); c.lineTo(j2[0], j2[1]); c.stroke();
        c.strokeStyle = '#6f57e0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(j1[0], j1[1]); c.stroke();
        c.fillStyle = '#50dcff'; c.fillRect(j2[0] - 1.5, j2[1] + 0.5, 3, 3);
        c.fillStyle = '#ff5aa6'; c.beginPath(); c.arc(j1[0], j1[1], 1, 0, Math.PI * 2); c.fill();
      }
      var net = memo('nn' + lv, function () {
        var L0 = lv >= 5 ? [3, 5, 5, 3] : lv >= 3 ? [3, 4, 4, 2] : [2, 3, 2], W0 = 40, H0 = 30, nodes = [], byL = [], a, b;
        for (a = 0; a < L0.length; a++)
          for (b = 0; b < L0[a]; b++) nodes.push(-W0 / 2 + a * W0 / (L0.length - 1), -H0 / 2 + (b + 0.5) * H0 / L0[a] - 4, a);
        for (a = 0; a < L0.length - 1; a++) byL.push([]);
        for (a = 0; a < nodes.length; a += 3)
          for (b = 0; b < nodes.length; b += 3)
            if (nodes[b + 2] === nodes[a + 2] + 1) byL[nodes[a + 2]].push(nodes[a], nodes[a + 1], nodes[b], nodes[b + 1]);
        return { nodes: nodes, byL: byL, layers: L0.length };
      });
      var c0 = E(x + 20, y + 35, 3 + hb + 24), nd = net.nodes;
      c.save(); c.translate(c0[0], c0[1]);
      c.fillStyle = 'rgba(111,87,224,0.16)'; c.beginPath(); c.moveTo(-10, 22); c.lineTo(10, 22); c.lineTo(23, -4); c.lineTo(-23, -4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(170,150,255,0.35)'; c.lineWidth = 0.5; c.beginPath();
      for (i = 0; i < net.byL.length; i++)
        for (var e = 0; e < net.byL[i].length; e += 4) { c.moveTo(net.byL[i][e], net.byL[i][e + 1]); c.lineTo(net.byL[i][e + 2], net.byL[i][e + 3]); }
      c.stroke();
      c.fillStyle = '#9ff4ff'; c.beginPath();
      for (i = 0; i < 9; i++) {
        var ph = t * 1.4 + i * 0.37, lay = Math.floor(ph) % (net.layers - 1), f2 = ph - Math.floor(ph), ed = net.byL[lay];
        var q = Math.floor(rnd(i * 13 + Math.floor(ph) * 7) * ed.length / 4) * 4;
        var px = ed[q] + (ed[q + 2] - ed[q]) * f2, py = ed[q + 1] + (ed[q + 3] - ed[q + 1]) * f2;
        c.moveTo(px + 1.3, py); c.arc(px, py, 1.3, 0, Math.PI * 2);
      }
      c.fill();
      var pulse = 0.5 + 0.5 * Math.sin(t * 4);
      c.fillStyle = 'rgba(160,130,255,' + (0.25 + 0.2 * pulse).toFixed(2) + ')'; c.beginPath();
      for (i = 0; i < nd.length; i += 3) { c.moveTo(nd[i] + 3.4, nd[i + 1]); c.arc(nd[i], nd[i + 1], 3.4, 0, Math.PI * 2); }
      c.fill();
      c.fillStyle = '#efeaff'; c.beginPath();
      for (i = 0; i < nd.length; i += 3) { c.moveTo(nd[i] + 1.7, nd[i + 1]); c.arc(nd[i], nd[i + 1], 1.7, 0, Math.PI * 2); }
      c.fill();
      c.restore();
    }
  };
  DEF.crypto = {
    hb: function (lv) { return 26 + 8 * lv; },
    top: function (lv) { return 3 + this.hb(lv) + 46; },
    vol: function (lv) { var tb = 3 + this.hb(lv); return [[4, 22, 36, 46, tb + 7], [38, 4, 60, 22, 14], [40, 26, 58, 36, 11], [20, 34, tb + 24, 16]]; },
    body: function (c, g, lv, col) {
      var hb = this.hb(lv), tb = 3 + hb, x = g.x + 4, y = g.y + 22, w = 32, d = 24, i;
      plinth(c, g, col);
      box(c, g.x + 38, g.y + 5, 22, 16, 3, 8, '#efe6f2', { left: '#9a8aa8', right: '#c8b8d6', top: '#d8cce2' });
      c.fillStyle = '#e0aa2a'; quadL(c, g.x + 38, g.x + 60, g.y + 21, 9.5, 11); c.fill(); quadR(c, g.x + 60, g.y + 21, g.y + 5, 9.5, 11); c.fill();
      for (i = 0; i < 3; i++) { c.fillStyle = '#6a5a78'; quadL(c, g.x + 41 + i * 6.5, g.x + 44 + i * 6.5, g.y + 21, 3, 8); c.fill(); }
      for (i = 0; i < Math.min(6, lv); i++) {
        var row = i < 3 ? 0 : 1, k = row ? i - 3 : i;
        box(c, g.x + 40 + k * 6.5, g.y + 8 + row * 6, 5.5, 3.5, 11 + row * 0, 2.4, '#ffd24a', { left: '#b8861a', right: '#e0a82a', top: '#ffe28a' });
        if (i >= 3) box(c, g.x + 41 + k * 6.5, g.y + 9 + row * 6, 3.5, 2, 13.4, 2, '#ffd24a', { left: '#b8861a', right: '#e0a82a', top: '#ffe28a' });
      }
      if (lv >= 3) {
        box(c, g.x + 40, g.y + 27, 13, 8, 3.8, 7, '#e8ecf4', { left: '#8a92a8', right: '#b8c0d0', top: '#f4f6fb' });
        box(c, g.x + 53, g.y + 27.5, 5, 7, 3.8, 5, '#d8dee8', { left: '#7a8298', right: '#a8b0c0', top: '#eef0f6' });
        c.fillStyle = '#1a2440'; quadR(c, g.x + 58, g.y + 34, g.y + 28.5, 6, 8.5); c.fill();
        c.fillStyle = '#e2508a'; quadL(c, g.x + 40, g.x + 53, g.y + 35, 6.5, 8); c.fill();
        c.fillStyle = '#111018';
        [[g.x + 43, g.y + 35], [g.x + 55, g.y + 34.5]].forEach(function (q) { var p = E(q[0], q[1], 4); c.beginPath(); c.ellipse(p[0], p[1], 1.8, 1.4, 0, 0, Math.PI * 2); c.fill(); });
        var lg = E(g.x + 46.5, g.y + 35, 7.5); tDraw(c, 'Q', lg[0], lg[1], 4.2, '#ffd24a', 900);
      }
      box(c, x, y, w, d, 3, hb, '#5a2448', { left: '#2c0f24', right: '#44183a' });
      for (i = 0; i < 5; i++) {
        if (i === 2) continue;
        var ux = x + 2 + i * 6.8;
        c.fillStyle = '#d9a426'; quadL(c, ux, ux + 2.2, y + d, 5, tb - 4); c.fill();
      }
      for (i = 0; i < 3; i++) { c.fillStyle = '#b8861a'; quadR(c, x + w, y + d - 4 - i * 8, y + d - 6.2 - i * 8, 5, tb - 4); c.fill(); }
      [[tb - 3.5, tb], [3, 5]].forEach(function (bd) {
        c.fillStyle = '#e0aa2a'; quadL(c, x, x + w, y + d, bd[0], bd[1]); c.fill();
        c.fillStyle = '#ffcf4a'; quadR(c, x + w, y + d, y, bd[0], bd[1]); c.fill();
      });
      face(c, x, y, w, d, tb); c.strokeStyle = '#ffcf4a'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#6a2a56'; face(c, x + 6, y + 6, w - 12, d - 12, tb); c.fill();
      windows(c, x, y, w, d, 32, tb - 5, { fh: 7, cw: 6.8, m: 3.4, wr: 0.3, hr: 0.7, cols: ['#ffb8e0', '#ffd86b'], off: 'rgba(20,5,20,0.6)', seed: 91, lit: 0.65 });
      var vc = [x + w / 2, y + d], vh = 16, R = 10;
      function ring(r, colr, fill) {
        c.beginPath();
        for (var j = 0; j <= 28; j++) { var a = j / 28 * Math.PI * 2, p = E(vc[0] + Math.cos(a) * r, vc[1] + 0.2, vh + Math.sin(a) * r); if (j) ln(c, p); else mv(c, p); }
        c.closePath(); if (fill) { c.fillStyle = colr; c.fill(); } else { c.strokeStyle = colr; c.stroke(); }
      }
      ring(R + 2.4, '#8a6a1a', true); ring(R + 1, '#ffd24a', true); ring(R - 1, '#b9c1d6', true); ring(R - 3.5, '#8d96b0', true);
      c.lineWidth = 0.8; ring(R - 1, '#ffffff', false);
      c.fillStyle = '#4a5270';
      for (i = 0; i < 12; i++) { var a2 = i / 12 * Math.PI * 2, bp = E(vc[0] + Math.cos(a2) * (R - 0.2), vc[1] + 0.3, vh + Math.sin(a2) * (R - 0.2)); c.beginPath(); c.arc(bp[0], bp[1], 0.7, 0, Math.PI * 2); c.fill(); }
      [[x + 1, y + 1], [x + w - 6, y + 1], [x + 1, y + d - 6], [x + w - 6, y + d - 6]].forEach(function (q) {
        box(c, q[0], q[1], 5, 5, tb, 5, '#7a3060', { left: '#3a1030', right: '#5a2048' });
        box(c, q[0] - 0.5, q[1] - 0.5, 6, 6, tb + 5, 1.2, '#ffcf4a');
      });
      if (lv >= 5) {
        var dc = E(x + w / 2, y + d / 2, tb);
        c.fillStyle = '#e0aa2a'; c.beginPath(); c.ellipse(dc[0], dc[1], 8, 4.4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffd24a'; c.beginPath(); c.ellipse(dc[0], dc[1] - 1, 7, 7, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#fff1b8'; c.beginPath(); c.ellipse(dc[0] - 2.4, dc[1] - 4.5, 1.6, 2.4, -0.4, 0, Math.PI * 2); c.fill();
      }
    },
    live: function (c, g, lv, t) {
      var hb = this.hb(lv), tb = 3 + hb, x = g.x + 4, y = g.y + 22, w = 32, d = 24, i;
      var R = 10, cc = E(x + w / 2, y + d + 0.4, 16);
      c.save(); c.translate(cc[0], cc[1]); c.transform(1, B / A, 0, 1, 0, 0);
      c.strokeStyle = '#ffe28a'; c.lineWidth = 1.3; c.beginPath();
      for (i = 0; i < 3; i++) { var a = t * 0.9 + i * 2.094; c.moveTo(0, 0); c.lineTo(Math.cos(a) * (R - 5) * A, Math.sin(a) * (R - 5)); }
      c.stroke();
      c.beginPath(); c.ellipse(0, 0, (R - 5) * A, R - 5, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(0, 0, 1.6, 0, Math.PI * 2); c.fill();
      c.restore();
      bulbs(c, rimLines(x, y, w, d, tb + 0.2), 3.6, t, '#ffe9f6', 'rgba(110,30,80,0.95)', 1.1);
      bulbs(c, rimLines(g.x + 38, g.y + 5, 22, 16, 11.2), 3.6, t + 0.4, '#fff4c0', 'rgba(110,80,20,0.9)', 1);
      if (lv >= 4) {
        c.strokeStyle = 'rgba(255,40,60,0.75)'; c.lineWidth = 0.5; c.beginPath();
        for (i = 0; i < 3; i++) {
          var hh = 4.5 + i * 2.2 + Math.sin(t * 2 + i) * 0.8;
          mv(c, E(g.x + 37, g.y + 22.5, hh)); ln(c, E(g.x + 61, g.y + 22.5, hh + Math.sin(t * 1.3 + i) * 1.5));
        }
        c.stroke();
      }
      var pc = E(g.x + 20, g.y + 34, tb + 22 + Math.sin(t * 1.8) * 1.2), cyc = t % 4, lift = 0;
      if (cyc > 2.8 && cyc < 3.4) lift = (cyc - 2.8) / 0.6 * 5; else if (cyc >= 3.4 && cyc < 3.55) lift = 5 * (1 - (cyc - 3.4) / 0.15);
      var flash = cyc >= 3.55 && cyc < 3.9 ? 1 - (cyc - 3.55) / 0.35 : 0;
      c.fillStyle = 'rgba(226,80,138,' + (0.18 + flash * 0.4) + ')'; c.beginPath(); c.arc(pc[0], pc[1] - 3, 15 + flash * 6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#ffd24a'; c.lineWidth = 2.6; c.lineCap = 'butt';
      c.beginPath(); c.arc(pc[0], pc[1] - 6 - lift, 5.5, Math.PI, 0);
      c.lineTo(pc[0] + 5.5, pc[1] - 1 - lift * (lift > 0 ? 0 : 1)); c.moveTo(pc[0] - 5.5, pc[1] - 6 - lift); c.lineTo(pc[0] - 5.5, pc[1] - 1); c.stroke();
      c.lineCap = 'round';
      rrect(c, pc[0] - 8.5, pc[1] - 2, 17, 13, 3); c.fillStyle = '#ff5aa6'; c.fill();
      rrect(c, pc[0] - 8.5, pc[1] - 2, 17, 4, 2); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
      c.lineWidth = 1; c.strokeStyle = '#ffd24a'; rrect(c, pc[0] - 8.5, pc[1] - 2, 17, 13, 3); c.stroke();
      c.fillStyle = '#4a0f30'; c.beginPath(); c.arc(pc[0], pc[1] + 3.2, 1.9, 0, Math.PI * 2); c.fill(); c.fillRect(pc[0] - 0.8, pc[1] + 3.2, 1.6, 4);
      c.strokeStyle = 'rgba(255,170,220,0.85)'; c.lineWidth = 0.8; c.beginPath();
      for (i = 0; i < 8; i++) {
        var f = (t * 0.35 + i / 8) % 1, bx = pc[0] + (rnd(i) - 0.5) * 36, by = pc[1] + 14 - f * 36;
        if (f < 0.08 || f > 0.9) continue;
        if (rnd(i * 7 + Math.floor(t * 2)) > 0.5) { c.moveTo(bx, by - 2); c.lineTo(bx, by + 2); }
        else { c.moveTo(bx + 1.2, by); c.ellipse(bx, by, 1.2, 2, 0, 0, Math.PI * 2); }
      }
      c.stroke();
      if (Math.sin(t * 2.7) > 0.3) { var gl = E(g.x + 44 + (Math.floor(t) % 3) * 6.5, g.y + 10, 14); sparkle(c, gl[0], gl[1], 2.8, '#fff8d8'); }
    }
  };
  DEF.sns = {
    hb: function (lv) { return 38 + 9 * lv; },
    top: function (lv) { return this.hb(lv) + 26; },
    vol: function (lv) { return [[12, 19, 52, 29, 3 + this.hb(lv) + 4]]; },
    body: function (c, g, lv, col) {
      var hb = this.hb(lv), ph = rrPts(g.x + 12, g.y + 19, 40, 10, 4, 4);
      var base = rrPts(g.x + 3, g.y + 4, 58, 40, 14, 6);
      c.fillStyle = rgba(col, 0.2); topPath(c, rrPts(g.x + 1, g.y + 2, 62, 44, 16, 6), 0.3); c.fill();
      prism(c, base, 0, 3, '#101a36', '#1c2d58', '#22335e');
      topPath(c, base, 3); glowStroke(c, col, 0.9, 6);
      prism(c, ph, 3, hb, '#8e9ab6', '#e8eef8', '#f6f9ff');
      c.save(); faceL(c, g.x + 12, g.y + 29, 3 + hb);
      var sw = 40 * A;
      rrect(c, 2.2, 3, sw - 4.4, hb - 6, 3.2); c.fillStyle = '#0a0f26'; c.fill();
      c.fillStyle = '#10182e'; rrect(c, sw / 2 - 4, 4, 8, 2.2, 1.1); c.fill();
      c.restore();
      c.fillStyle = '#6f7a96'; quadR(c, g.x + 52, g.y + 25, g.y + 22, 3 + hb - 14, 3 + hb - 22); c.fill();
      var cm = E(g.x + 44, g.y + 23, 3 + hb);
      c.fillStyle = '#20263a'; c.beginPath(); c.ellipse(cm[0], cm[1], 2.6, 1.5, 0, 0, Math.PI * 2); c.fill();
    },
    live: function (c, g, lv, t, S) {
      var hb = this.hb(lv), sw = 40 * A, i;
      c.save(); faceL(c, g.x + 12, g.y + 29, 3 + hb);
      rrect(c, 2.2, 7, sw - 4.4, hb - 10, 3); c.clip();
      var ph = 13, sp = t * 9, top = 7, cols = ['#ff5aa6', '#2bb8d8', '#ffd24a', '#6f57e0', '#3dd68c'];
      var first = Math.floor(sp / ph);
      for (i = -1; i < Math.ceil((hb - 10) / ph) + 1; i++) {
        var k = first + i, y0 = top + i * ph - (sp % ph);
        var cy = hb - 4 - (y0 - top) - ph;
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(3.5, cy, sw - 7, ph - 2.5);
        c.fillStyle = cols[((k % 5) + 5) % 5]; c.beginPath(); c.arc(7, cy + 4, 2.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(11, cy + 2.5, 8 + rnd(k) * 6, 1.2);
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(11, cy + 5.5, 5 + rnd(k + 1) * 9, 1);
        if (rnd(k + 5) > 0.3) heart(c, sw - 8, cy + 6.5, 1.5, '#ff4d8d');
      }
      c.restore();
      c.save(); faceL(c, g.x + 12, g.y + 29, 3 + hb);
      c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.moveTo(3, 3); c.lineTo(sw * 0.55, 3); c.lineTo(3, hb * 0.5); c.closePath(); c.fill();
      c.restore();
      bulbs(c, memo('snsb', function () { return frontEdge(rrPts(g.x + 3, g.y + 4, 58, 40, 14, 6), 3.3); }), 4, t, '#e8fbff', 'rgba(20,70,90,0.95)', 1.1);
      var tp = E(g.x + 32, g.y + 24, 3 + hb);
      for (i = 0; i < 6; i++) {
        var f = (t * 0.45 + i / 6) % 1, x = tp[0] + Math.sin(f * 6 + i) * 7 + (rnd(i) - 0.5) * 16, y = tp[1] - 4 - f * 26;
        var ga = c.globalAlpha;
        c.globalAlpha = ga * Math.min(1, (1 - f) * 2);
        heart(c, x, y, 2 + f * 1.5 + (i % 2), i % 3 === 0 ? '#ffd24a' : '#ff4d8d');
        c.globalAlpha = ga;
      }
      var bc = E(g.x + 52, g.y + 20, 3 + hb + 2), n = Math.max(1, Math.round((S.pop || 0) * 3 + lv * 9));
      var s = n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
      var bw = Math.max(7, s.length * 3.6 + 3), bounce = Math.abs(Math.sin(t * 3)) * 1.5;
      c.fillStyle = '#ff3355'; rrect(c, bc[0] - bw / 2, bc[1] - 4 - bounce, bw, 8, 4); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke();
      c.font = '900 5.5px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ffffff'; c.fillText(s, bc[0], bc[1] - bounce + 0.3);
    }
  };
  function heart(c, x, y, r, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x, y + r * 1.1);
    c.bezierCurveTo(x - r * 2.2, y - r * 0.4, x - r * 0.9, y - r * 1.9, x, y - r * 0.6);
    c.bezierCurveTo(x + r * 0.9, y - r * 1.9, x + r * 2.2, y - r * 0.4, x, y + r * 1.1);
    c.fill();
  }
  DEF.tube = {
    hs: function (lv) { return 14 + 4 * lv; },
    sh: function (lv) { return 22 + 2 * lv; },
    top: function (lv) { return 3 + this.hs(lv) + 5 + this.sh(lv) + 8; },
    vol: function (lv) { var hs = this.hs(lv); return [[4, 12, 60, 44, 3 + hs + 1], [7, 20, 57, 25, 3 + hs + 5 + this.sh(lv) + 1]]; },
    body: function (c, g, lv, col) {
      var hs = this.hs(lv), sh2 = this.sh(lv), x = g.x + 4, y = g.y + 12, w = 56, d = 32;
      plinth(c, g, col);
      box(c, x, y, w, d, 3, hs, '#5a2a3a', { left: '#2a121c', right: '#3e1a28' });
      c.fillStyle = '#e2504a'; quadL(c, x, x + w, y + d, 3 + hs - 4, 3 + hs - 2); c.fill();
      quadR(c, x + w, y + d, y, 3 + hs - 4, 3 + hs - 2); c.fill();
      windows(c, x, y, w, d, 4, 3 + hs - 5, { fh: 6, cw: 7, m: 3, cols: ['#ffd0c8', '#ffe9a8', '#9fe8ff'], seed: 71, lit: 0.8 });
      var dc = E(x + w - 10, y + 6, 3 + hs + 7);
      c.strokeStyle = '#cfd6e6'; c.lineWidth = 1; c.beginPath(); c.moveTo(dc[0], dc[1] + 7); c.lineTo(dc[0], dc[1]); c.stroke();
      c.fillStyle = '#e8eef8'; c.beginPath(); c.ellipse(dc[0], dc[1], 6, 3.4, -0.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#b8c2d6'; c.beginPath(); c.ellipse(dc[0] + 0.6, dc[1] + 0.4, 4.4, 2.3, -0.5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#8a94aa'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(dc[0], dc[1]); c.lineTo(dc[0] - 3, dc[1] - 4); c.stroke();
      if (lv >= 4) {
        var d2 = E(x + w - 22, y + 4, 3 + hs + 5);
        c.fillStyle = '#e8eef8'; c.beginPath(); c.ellipse(d2[0], d2[1], 4, 2.3, -0.5, 0, Math.PI * 2); c.fill();
      }
      var sb = 3 + hs + 5, sx0 = g.x + 7, sx1 = g.x + 57, sy = g.y + 22;
      box(c, g.x + 14, sy - 1, 3, 3, 3 + hs, 5, '#2a2030');
      box(c, g.x + 47, sy - 1, 3, 3, 3 + hs, 5, '#2a2030');
      box(c, sx0, sy - 2, sx1 - sx0, 3, sb, sh2, '#402838', { left: '#1a0e16', right: '#301a26' });
      c.fillStyle = '#0a0610'; quadL(c, sx0 + 1.5, sx1 - 1.5, sy + 1, sb + 1.5, sb + sh2 - 1.5); c.fill();
      c.fillStyle = '#1a0a10'; quadL(c, x + 6, x + 22, y + d, 3 + hs - 12, 3 + hs - 6); c.fill();
    },
    live: function (c, g, lv, t) {
      var hs = this.hs(lv), sh2 = this.sh(lv), x = g.x + 4, y = g.y + 12, w = 56, d = 32;
      var sb = 3 + hs + 5, sx0 = g.x + 7, sx1 = g.x + 57, sy = g.y + 22, sw = (sx1 - sx0 - 3) * A, shh = sh2 - 3;
      c.save(); faceL(c, sx0 + 1.5, sy + 1, sb + sh2 - 1.5);
      var scene = Math.floor(t / 5) % 3;
      if (scene === 2) {
        c.fillStyle = '#1a0a2a'; c.fillRect(0, 0, sw, shh);
        c.fillStyle = '#ff5a8a';
        for (var i = 0; i < 12; i++) { var hh = 2 + Math.abs(Math.sin(t * 6 + i * 0.9)) * (shh * 0.6); c.fillRect(2 + i * (sw - 4) / 12, shh / 2 - hh / 2, (sw - 4) / 12 - 1, hh); }
      } else {
        c.fillStyle = scene ? '#c8203a' : '#e2504a'; c.fillRect(0, 0, sw, shh);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, 0, sw, shh * 0.45);
        var pr = 1 + 0.08 * Math.sin(t * 5), cx = sw / 2, cy = shh / 2 - 1.5;
        c.fillStyle = '#ffffff'; rrect(c, cx - 9 * pr, cy - 6 * pr, 18 * pr, 12 * pr, 4); c.fill();
        c.fillStyle = '#e2504a'; c.beginPath(); c.moveTo(cx - 2.6 * pr, cy - 3.6 * pr); c.lineTo(cx + 4 * pr, cy); c.lineTo(cx - 2.6 * pr, cy + 3.6 * pr); c.closePath(); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(2, shh - 3, sw - 4, 1.2);
      c.fillStyle = '#ffffff'; c.fillRect(2, shh - 3, (sw - 4) * ((t / 15) % 1), 1.2);
      c.fillStyle = '#ff2040'; c.fillRect(2, 1.5, 11, 4.4);
      tDraw(c, 'LIVE', 7.5, 3.8, 3.6, '#ffffff', 900);
      c.restore();
      bulbs(c, [[[sx0, sy + 1, sb], [sx1, sy + 1, sb], [sx1, sy + 1, sb + sh2], [sx0, sy + 1, sb + sh2], [sx0, sy + 1, sb]]], 3.6, t, '#fff6d8', 'rgba(110,40,40,0.95)', 1.1);
      var onA = 0.55 + 0.45 * Math.sin(t * 3);
      c.save(); faceL(c, x + 6, y + d, 3 + hs - 6);
      c.fillStyle = 'rgba(255,40,60,' + (0.25 + onA * 0.3) + ')'; c.fillRect(-1.5, -1.5, 16 * A + 3, 9);
      c.fillStyle = 'rgb(' + Math.round(150 + 105 * onA) + ',30,50)'; c.fillRect(0.5, 0.5, 16 * A - 1, 5);
      tDraw(c, 'ON AIR', 8 * A, 3.2, 3.8, '#ffffff', 900);
      c.restore();
      bulbs(c, rimLines(x, y, w, d, 3 + hs + 0.3), 4.5, t, '#ffe6e0', 'rgba(90,30,40,0.95)', 1);
    }
  };
  DEF.press = {
    hb: function (lv) { return 18 + 5 * lv; },
    ht: function (lv) { return 34 + 10 * lv; },
    top: function (lv) { return 3 + this.hb(lv) + this.ht(lv) + 14; },
    vol: function (lv) { var tb = 3 + this.hb(lv); return [[6, 8, 56, 40, tb], [24, 17, 38, 31, tb + this.ht(lv) + 10]]; },
    body: function (c, g, lv, col) {
      var hb = this.hb(lv), ht = this.ht(lv), x = g.x + 6, y = g.y + 8, w = 50, d = 32, tb = 3 + hb, i;
      plinth(c, g, col);
      box(c, x, y, w, d, 3, hb, '#4b3068', { left: '#1f1430', right: '#2e1f48' });
      windows(c, x, y, w, d, 4, tb - 8, { fh: 6, cw: 6, m: 3, cols: ['#dfe8ff', '#9fe8ff', '#ffe9a8'], seed: 131, lit: 0.75 });
      c.fillStyle = '#0a0612'; quadL(c, x, x + w, y + d, tb - 7, tb - 1); c.fill(); quadR(c, x + w, y + d, y, tb - 7, tb - 1); c.fill();
      c.save(); faceR(c, x + w, y + d - 4, tb - 9);
      c.fillStyle = '#e2508a'; rrect(c, 1, 0, 17, 8, 2); c.fill();
      c.font = '900 6px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText('NEWS', 9.5, 4.3);
      c.restore();
      var cx = x + w / 2, cy = y + d / 2, legs = [[-7, -7], [7, -7], [7, 7], [-7, 7]], seg = 6;
      function at(k, s) { var sc = 1 - 0.8 * s; return E(cx + legs[k][0] * sc, cy + legs[k][1] * sc, tb + ht * s); }
      c.lineWidth = 1;
      for (i = 0; i < seg; i++) {
        var s0 = i / seg, s1 = (i + 1) / seg;
        c.strokeStyle = i % 2 ? '#f4f4f8' : '#ff3b3b';
        c.beginPath();
        for (var k = 0; k < 4; k++) { mv(c, at(k, s0)); ln(c, at(k, s1)); }
        mv(c, at(0, s1)); ln(c, at(1, s1)); ln(c, at(2, s1)); ln(c, at(3, s1)); ln(c, at(0, s1));
        mv(c, at(3, s0)); ln(c, at(2, s1)); mv(c, at(2, s0)); ln(c, at(3, s1));
        mv(c, at(1, s0)); ln(c, at(2, s1)); mv(c, at(2, s0)); ln(c, at(1, s1));
        c.stroke();
      }
      var ob = E(cx, cy, tb + ht * 0.55);
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ob[0], ob[1], 6, 2.6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#9fe8ff'; c.fillRect(ob[0] - 5, ob[1] - 2.8, 10, 2);
      var a0 = E(cx, cy, tb + ht), a1 = E(cx, cy, tb + ht + 10);
      c.strokeStyle = '#f4f4f8'; c.lineWidth = 0.9; c.beginPath(); mv(c, a0); ln(c, a1); c.stroke();
    },
    live: function (c, g, lv, t) {
      var hb = this.hb(lv), ht = this.ht(lv), x = g.x + 6, y = g.y + 8, w = 50, d = 32, tb = 3 + hb, i;
      var msg = ' ◆ BREAKING NEWS ◆ QTYC QUANTUM SUPREMACY ◆ STOCK HITS RECORD HIGH ◆ ';
      c.save(); quadL(c, x, x + w, y + d, tb - 7, tb - 1); c.clip();
      faceL(c, x, y + d, tb - 1);
      ticker(c, msg, 5, '#ffffff', t, 16, 3);
      c.restore();
      c.save(); quadR(c, x + w, y + d, y, tb - 7, tb - 1); c.clip();
      faceR(c, x + w, y + d, tb - 1);
      ticker(c, msg, 5, '#ffd24a', t + w * A / 16, 16, 3);
      c.restore();
      var tp = E(x + w / 2, y + d / 2, tb + ht + 9);
      c.lineWidth = 1.1;
      for (i = 0; i < 3; i++) {
        var f = (t * 0.7 + i / 3) % 1;
        c.strokeStyle = 'rgba(255,120,190,' + (1 - f) * 0.8 + ')';
        c.beginPath(); c.arc(tp[0], tp[1], 3 + f * 22, -Math.PI * 0.85, -Math.PI * 0.15); c.stroke();
        c.beginPath(); c.arc(tp[0], tp[1], 3 + f * 22, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
      }
      var blink = Math.sin(t * 4) > 0.2;
      c.fillStyle = blink ? '#ff3030' : '#661010';
      [tb + ht + 10, tb + ht * 0.55 + 3].forEach(function (hh) { var q = E(x + w / 2, y + d / 2, hh); c.beginPath(); c.arc(q[0], q[1], 1.5, 0, Math.PI * 2); c.fill(); });
      if (blink) { c.fillStyle = 'rgba(255,60,60,0.3)'; var q2 = E(x + w / 2, y + d / 2, tb + ht + 10); c.beginPath(); c.arc(q2[0], q2[1], 4, 0, Math.PI * 2); c.fill(); }
      bulbs(c, rimLines(x, y, w, d, tb + 0.3), 4.5, t, '#ffe9f4', 'rgba(90,30,70,0.95)', 1);
    }
  };
  DEF.seminar = {
    JB: 50,
    sh: function (lv) { return 22 + 4 * lv; },
    top: function (lv) { return this.JB + this.sh(lv) + 22; },
    lamps: function (lv) { return 2 + Math.floor(lv / 2); },
    vol: function (lv) {
      return [[4, 4, 60, 28, 10], [7, 1, 57, 7, this.JB + this.sh(lv) + 16], [3, 29, 7, 33, 33], [57, 29, 61, 33, 33]];
    },
    body: function (c, g, lv, col) {
      var sh2 = this.sh(lv), JB = this.JB, top = JB + sh2, x = g.x, y = g.y, i;
      plinth(c, g, col);
      c.fillStyle = '#1b1631'; face(c, x + 3, y + 30, 58, 16, 3.1); c.fill();
      box(c, x + 4, y + 4, 56, 24, 3, 6, '#3a3552', { left: '#15121f', right: '#221d33' });
      c.fillStyle = '#2a2640'; face(c, x + 4, y + 4, 56, 24, 9); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 0.5;
      for (i = 1; i < 7; i++) { c.beginPath(); mv(c, E(x + 4 + i * 8, y + 4, 9)); ln(c, E(x + 4 + i * 8, y + 28, 9)); c.stroke(); }
      quadL(c, x + 4, x + 60, y + 28, 3.3, 8.7); glowStroke(c, '#3dff9e', 0.7, 5);
      function truss(px, py, h0, h1, w) {
        w = w || 2.6;
        box(c, px - w / 2, py - w / 2, w, w, h0, h1 - h0, '#9aa2bc', { left: '#5a6078', right: '#7a829c' });
        c.strokeStyle = 'rgba(210,220,240,0.75)'; c.lineWidth = 0.4; c.beginPath();
        for (var hh = h0; hh < h1 - 4; hh += 4) {
          mv(c, E(px - w / 2, py + w / 2, hh)); ln(c, E(px + w / 2, py + w / 2, hh + 4));
          mv(c, E(px + w / 2, py + w / 2, hh)); ln(c, E(px + w / 2, py - w / 2, hh + 4));
        }
        c.stroke();
      }
      truss(x + 8, y + 3.5, 9, top + 6, 3); truss(x + 56, y + 3.5, 9, top + 6, 3);
      box(c, x + 10, y + 2, 44, 4, JB, sh2, '#262236', { left: '#0f0d18', right: '#1a1726' });
      c.fillStyle = '#05040a'; quadL(c, x + 11.5, x + 52.5, y + 6, JB + 1.5, top - 1.5); c.fill();
      box(c, x + 6.5, y + 2, 51, 3, top + 3, 3, '#b8c0d8', { left: '#6a7088', right: '#8a92ac' });
      c.strokeStyle = 'rgba(210,220,240,0.6)'; c.lineWidth = 0.4; c.beginPath();
      for (i = 0; i < 12; i++) { mv(c, E(x + 8 + i * 4, y + 5, top + 3)); ln(c, E(x + 10 + i * 4, y + 5, top + 6)); }
      c.stroke();
      var n = this.lamps(lv);
      for (i = 0; i < n; i++) {
        var lx = x + 14 + i * (36 / Math.max(1, n - 1)), lp = E(lx, y + 6, JB - 1);
        c.fillStyle = '#16161e'; rrect(c, lp[0] - 2, lp[1] - 1, 4, 4.5, 1.2); c.fill();
        c.fillStyle = '#fff6c0'; c.beginPath(); c.ellipse(lp[0], lp[1] + 3.5, 1.6, 0.9, 0, 0, Math.PI * 2); c.fill();
      }
      [x + 5, x + 52].forEach(function (sx) {
        for (var k = 0; k < 2 + (lv >= 3 ? 1 : 0); k++) {
          box(c, sx, y + 8, 7, 7, 9 + k * 7, 7, '#2a2a36', { left: '#101016', right: '#1c1c26' });
          var sp = E(sx + 3.5, y + 15, 9 + k * 7 + 3.5);
          c.fillStyle = '#44445a'; c.beginPath(); c.ellipse(sp[0], sp[1], 2, 2.4, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#0a0a10'; c.beginPath(); c.ellipse(sp[0], sp[1], 1, 1.2, 0, 0, Math.PI * 2); c.fill();
        }
      });
      box(c, x + 18, y + 19, 5, 4, 9, 6, '#e8e4f4', { left: '#8a86a8', right: '#b8b4d0' });
      c.fillStyle = '#3dff9e'; quadL(c, x + 18.5, x + 22.5, y + 23, 11, 13.5); c.fill();
      truss(x + 5, y + 31, 3, 30, 2.4); truss(x + 59, y + 31, 3, 30, 2.4);
      var sg = E(x + 32, y + 3.5, top + 13);
      c.fillStyle = 'rgba(8,20,16,0.88)'; rrect(c, sg[0] - 17, sg[1] - 5, 34, 10, 3); c.fill();
      c.strokeStyle = '#3dff9e'; c.lineWidth = 0.8; rrect(c, sg[0] - 17, sg[1] - 5, 34, 10, 3); c.stroke();
      neonText(c, 'Q-SUMMIT', sg[0], sg[1] + 0.4, 6.4, '#3dff9e', '#eafff4', 6);
    },
    live: function (c, g, lv, t, S, p) {
      var sh2 = this.sh(lv), JB = this.JB, top = JB + sh2, x = g.x, y = g.y, i, j;
      var info = H.padInfo({ p: p, type: 'seminar' }), can = info && info.can;
      c.save(); faceL(c, x + 11.5, y + 6, top - 1.5);
      var sw = 41 * A, shh = sh2 - 3, sc = Math.floor(t / 4) % 3;
      c.fillStyle = sc === 1 ? '#081a14' : '#0c0a24'; c.fillRect(0, 0, sw, shh);
      if (sc === 0) {
        tDraw(c, 'QUANTUM', sw / 2, shh * 0.36, 6.4, '#3dff9e', 900); tDraw(c, 'SUMMIT', sw / 2, shh * 0.36 + 7.5, 6.4, '#ffffff', 900);
        c.fillStyle = '#ffd24a'; c.fillRect(sw / 2 - 9, shh * 0.36 + 12.5, 18 * ((t % 4) / 4), 1.1);
      } else if (sc === 1) {
        for (i = 0; i < 4; i++) {
          var k = Math.min(1, (t % 4) * 0.8), bh = (shh - 6) * (0.3 + i * 0.2) * k;
          c.fillStyle = ['#3dff9e', '#2bb8d8', '#ffd24a', '#ff5aa6'][i];
          c.fillRect(3 + i * (sw - 6) / 4, shh - 2 - bh, (sw - 6) / 4 - 2, bh);
        }
      } else {
        var cx = sw / 2, cy = shh / 2;
        c.strokeStyle = '#7fe8ff'; c.lineWidth = 0.8;
        for (i = 0; i < 3; i++) { c.beginPath(); c.ellipse(cx, cy, shh * 0.42, shh * 0.14, t + i * 1.05, 0, Math.PI * 2); c.stroke(); }
        tDraw(c, 'Q', cx, cy + 0.5, Math.round(shh * 0.4), '#ffffff', 900);
      }
      if (can && Math.sin(t * 6) > -0.3) {
        c.fillStyle = '#ff2040'; c.fillRect(1.5, 1.5, 12, 4.6);
        tDraw(c, 'LIVE', 7.5, 3.9, 3.6, '#ffffff', 900);
      }
      c.restore();
      bulbs(c, [[[x + 10, y + 6, JB], [x + 54, y + 6, JB], [x + 54, y + 6, top], [x + 10, y + 6, top], [x + 10, y + 6, JB]]], 3.6, t, '#eafff4', 'rgba(20,80,50,0.95)', 1.1);
      var n = this.lamps(lv);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (i = 0; i < n + 2; i++) {
        var lp = i < n ? E(x + 14 + i * (36 / Math.max(1, n - 1)), y + 6, JB - 1) : E(i === n ? x + 5 : x + 59, y + 31, 31);
        var tx = x + 26 + Math.sin(t * (0.9 + i * 0.23) + i * 1.7) * 18, ty = y + 16 + Math.cos(t * 0.7 + i) * 6;
        var f0 = E(tx - 6, ty, 9), f1 = E(tx + 6, ty, 9), fc = E(tx, ty, 9);
        c.fillStyle = hsl((t * 40 + i * 70) % 360, 90, 60).replace('hsl', 'hsla').replace('%)', '%,0.18)');
        c.beginPath(); c.moveTo(lp[0], lp[1] + 3); c.lineTo(f0[0], f0[1] + 2); c.lineTo(f1[0], f1[1] - 2); c.closePath(); c.fill();
        c.beginPath(); c.ellipse(fc[0], fc[1], 7, 3.5, 0, 0, Math.PI * 2); c.fill();
      }
      if (lv >= 5) {
        c.lineWidth = 0.6;
        var o = E(x + 32, y + 6, JB);
        for (i = 0; i < 8; i++) {
          var a = -Math.PI / 2 + Math.sin(t * 1.3 + i) * 1.3;
          c.strokeStyle = i % 2 ? 'rgba(80,255,160,0.7)' : 'rgba(255,80,200,0.7)';
          c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(o[0] + Math.cos(a) * 80, o[1] + Math.sin(a) * 80); c.stroke();
        }
      }
      c.restore();
      [x + 5, x + 59].forEach(function (lx2, k) {
        var hp = E(lx2, y + 31, 31), sw2 = Math.sin(t * 2 + k * 2) * 1.5;
        c.fillStyle = '#16161e'; rrect(c, hp[0] - 2.4 + sw2 * 0.3, hp[1] - 3, 4.8, 4, 1.4); c.fill();
        c.fillStyle = hsl(t * 60 + k * 120, 95, 70); c.beginPath(); c.arc(hp[0] + sw2, hp[1] - 0.6, 1.3, 0, Math.PI * 2); c.fill();
      });
      var pc = E(x + 20.5, y + 17, 9), arm = Math.sin(t * 3) * 3;
      c.fillStyle = '#20263a'; rrect(c, pc[0] - 2.2, pc[1] - 8, 4.4, 8, 1.5); c.fill();
      c.fillStyle = '#ffd9b8'; c.beginPath(); c.arc(pc[0], pc[1] - 10, 2.2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#20263a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(pc[0] + 1.8, pc[1] - 6.5); c.lineTo(pc[0] + 5, pc[1] - 8 - arm); c.stroke();
      var rows = 3, per = 4 + lv, shirt = ['#e2508a', '#2bb8d8', '#ffd24a', '#8a6cff'];
      for (j = 0; j < rows; j++) {
        var bodies = [[], [], [], []], heads = [], sticks = [];
        for (i = 0; i < per; i++) {
          var ax = x + 7 + (i + (j % 2) * 0.5) * (50 / per), ay = y + 34 + j * 4.2;
          var bob = Math.max(0, Math.sin(t * 5 + i * 1.3 + j * 2)) * 1.4;
          var q = E(ax, ay, 3);
          bodies[(i + j) % 4].push(q[0], q[1] - bob);
          heads.push(q[0], q[1] - 5.2 - bob);
          if ((i + j * 2) % 3 === 0) sticks.push(q[0], q[1] - bob, Math.sin(t * 6 + i + j) * 0.7);
        }
        for (var s = 0; s < 4; s++) {
          if (!bodies[s].length) continue;
          c.fillStyle = shirt[s]; c.beginPath();
          for (var b = 0; b < bodies[s].length; b += 2) c.rect(bodies[s][b] - 1.6, bodies[s][b + 1] - 3.8, 3.2, 3.8);
          c.fill();
        }
        c.fillStyle = '#3a2a30'; c.beginPath();
        for (i = 0; i < heads.length; i += 2) { c.moveTo(heads[i] + 1.5, heads[i + 1]); c.arc(heads[i], heads[i + 1], 1.5, 0, Math.PI * 2); }
        c.fill();
        c.strokeStyle = hsl(t * 90 + j * 60, 95, 65); c.lineWidth = 0.9; c.beginPath();
        for (i = 0; i < sticks.length; i += 3) {
          c.moveTo(sticks[i] + 1.4, sticks[i + 1] - 3.5);
          c.lineTo(sticks[i] + 1.4 + Math.sin(sticks[i + 2]) * 4, sticks[i + 1] - 3.5 - Math.cos(sticks[i + 2]) * 4);
        }
        c.stroke();
      }
      bulbs(c, [[[x + 4, y + 28, 9.4], [x + 60, y + 28, 9.4], [x + 60, y + 4, 9.4]]], 3.6, t, '#eafff4', 'rgba(20,80,50,0.95)', 1);
      if (lv >= 4) {
        var ck = t % 6;
        if (ck < 2.2) {
          var cols = ['#ff5aa6', '#ffd24a', '#50dcff', '#8cf08c'];
          for (var cI = 0; cI < 4; cI++) {
            c.fillStyle = cols[cI]; c.beginPath();
            for (i = cI; i < 24; i += 4) {
              var fx = x + 8 + rnd(i) * 48, fy = y + 8 + rnd(i + 30) * 24, fh = JB - 2 - ck * (JB - 12) * (0.6 + rnd(i + 7) * 0.4);
              if (fh < 9) continue;
              var cp = E(fx + Math.sin(t * 4 + i) * 2, fy, fh);
              c.rect(cp[0] - 0.8, cp[1] - 0.5, 1.6, 1);
            }
            c.fill();
          }
        }
      }
      if (lv >= 6) {
        var fk = (t % 3);
        if (fk < 0.8) {
          [x + 8, x + 56].forEach(function (fx) {
            var fb = E(fx, y + 26, 9), hgt = 14 * Math.sin(fk / 0.8 * Math.PI);
            c.fillStyle = 'rgba(255,160,40,0.85)'; c.beginPath(); c.moveTo(fb[0] - 2.5, fb[1]); c.quadraticCurveTo(fb[0], fb[1] - hgt * 1.4, fb[0] + 2.5, fb[1]); c.fill();
            c.fillStyle = 'rgba(255,240,160,0.9)'; c.beginPath(); c.moveTo(fb[0] - 1.2, fb[1]); c.quadraticCurveTo(fb[0], fb[1] - hgt, fb[0] + 1.2, fb[1]); c.fill();
          });
        }
      }
    }
  };
  DEF.lounge = {
    ch: function (lv) { return 19 + lv; },
    top: function (lv) { return this.ch(lv) + (lv >= 5 ? 72 : 14); },
    vol: function (lv) {
      var ch = this.ch(lv), v = [[36, 10, 52, 34, ch + 3], [32, 14, 56, 30, ch + 3], [2, 55, 9, 62, 30]];
      if (lv >= 3) v.push([15, 35, 23, 43, 26]);
      return v;
    },
    sofas: function (lv) { return lv >= 3 ? [[6, 44], [6, 54], [30, 50]] : [[6, 46], [30, 50]]; },
    body: function (c, g, lv, col) {
      var x = g.x, y = g.y, ch = this.ch(lv), i;
      plinth(c, g, col);
      for (var ty = 0; ty < 7; ty++)
        for (var tx = 0; tx < 9; tx++) {
          c.fillStyle = (tx + ty) % 2 ? '#4a3380' : '#5a3f9a';
          face(c, x + 4 + tx * 8, y + 4 + ty * 8, 8, 8, 3.05); c.fill();
        }
      c.fillStyle = '#2a1850'; topPath(c, rrPts(x + 27, y + 5, 34, 34, 17, 6), 3.1); c.fill();
      topPath(c, rrPts(x + 27, y + 5, 34, 34, 17, 6), 3.1); glowStroke(c, '#ff5ac8', 0.6, 4);
      if (lv >= 4) {
        var pp = rrPts(x + 54, y + 38, 22, 22, 8, 5);
        prism(c, pp, 3, 2.2, '#d8d2f0', '#f4f0ff', '#f8f6ff');
        c.fillStyle = '#29b6e8'; topPath(c, rrPts(x + 56, y + 40, 18, 18, 6.5, 5), 5.25); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.25)'; topPath(c, rrPts(x + 58, y + 42, 9, 6, 3, 4), 5.3); c.fill();
        box(c, x + 57, y + 61, 7, 2.5, 3, 1.5, '#ffffff'); box(c, x + 66, y + 61, 7, 2.5, 3, 1.5, '#ffffff');
      }
      if (lv >= 3) {
        var aq = rrPts(x + 15, y + 35, 8, 8, 4, 5);
        prism(c, aq, 3, 2, '#c8b8e8', '#f4f0ff', null);
        prism(c, aq, 5, 18, '#0b3a6a', '#2a90d0', null);
        prism(c, aq, 23, 2, '#c8b8e8', '#f4f0ff', '#f8f6ff');
      }
      var gl = rrPts(x + 31, y + 9, 26, 26, 13, 8), n = gl.length;
      function glass(front) {
        for (var k = 0; k < n; k++) {
          var a0 = gl[k], a1 = gl[(k + 1) % n], nx = a1[1] - a0[1], ny = -(a1[0] - a0[0]);
          if ((nx + ny > 0) !== front) continue;
          c.fillStyle = front ? 'rgba(160,230,255,0.13)' : 'rgba(120,90,200,0.35)';
          c.beginPath(); mv(c, E(a0[0], a0[1], 3)); ln(c, E(a1[0], a1[1], 3)); ln(c, E(a1[0], a1[1], ch)); ln(c, E(a0[0], a0[1], ch)); c.closePath(); c.fill();
          if (k % 2 === 0) { c.strokeStyle = front ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'; c.lineWidth = front ? 0.6 : 0.4; c.beginPath(); mv(c, E(a0[0], a0[1], 3)); ln(c, E(a0[0], a0[1], ch)); c.stroke(); }
        }
      }
      glass(false);
      var bar = rrPts(x + 36, y + 14, 16, 16, 8, 7);
      prism(c, bar, 3, 8, '#c8c0dc', '#f8f6ff', '#e0b050');
      prism(c, bar, 5, 1.2, '#ff5ac8', '#ff9ae0', null);
      c.fillStyle = '#2a1f4c'; topPath(c, rrPts(x + 39, y + 17, 10, 10, 5, 6), 11.05); c.fill();
      var col2 = rrPts(x + 42, y + 20, 4, 4, 2, 5);
      prism(c, col2, 11, ch - 11, '#8a6ad0', '#e8dcff', null);
      var bcols = ['#7fd6ff', '#ffd23f', '#ff8ad8', '#8cf08c', '#ff8a3d', '#b89cff'];
      for (var sr = 0; sr < 2; sr++)
        for (i = 0; i < 5; i++) {
          var a = Math.PI * (0.05 + i * 0.22), bp = E(x + 44 + Math.cos(a) * 3, y + 22 + Math.sin(a) * 3, 13 + sr * 4);
          c.fillStyle = bcols[(i + sr * 2) % bcols.length]; c.fillRect(bp[0] - 0.5, bp[1] - 2.6, 1, 2.6);
        }
      [[36, 31], [42, 33.5], [48, 32]].forEach(function (q) {
        var sp = E(x + q[0], y + q[1], 3), st = E(x + q[0], y + q[1], 8);
        c.strokeStyle = '#d8d4e8'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(sp[0], sp[1]); c.lineTo(st[0], st[1]); c.stroke();
        c.fillStyle = '#ff5ac8'; c.beginPath(); c.ellipse(st[0], st[1], 1.8, 0.9, 0, 0, Math.PI * 2); c.fill();
      });
      glass(true);
      var roof = rrPts(x + 29, y + 7, 30, 30, 15, 8);
      prism(c, roof, ch, 2.2, '#ff3aa8', '#ff9ae0', '#f8f6ff');
      c.fillStyle = 'rgba(255,255,255,0.95)'; topPath(c, rrPts(x + 32, y + 10, 24, 24, 12, 8), ch + 2.25); c.fill();
      c.fillStyle = 'rgba(160,230,255,0.45)'; topPath(c, rrPts(x + 38, y + 16, 12, 12, 6, 6), ch + 2.3); c.fill();
      box(c, x + 71, y + 61, 1.6, 1.6, 3, 14, '#d8d4e8', { left: '#8a86a8', right: '#b8b4d0' });
      if (lv >= 5) {
        box(c, x + 36, y + 17, 4, 4, ch + 2.2, 7, '#1c1c28', { left: '#0c0c14', right: '#16161e' });
        box(c, x + 49, y + 17, 4, 4, ch + 2.2, 7, '#1c1c28', { left: '#0c0c14', right: '#16161e' });
        box(c, x + 41, y + 24, 7, 3, ch + 2.2, 3.4, '#1a1030', { top: '#50dcff', left: '#10081e', right: '#180e2a' });
      }
      this.sofas(lv).forEach(function (q) {
        box(c, x + q[0], y + q[1], 18, 7, 3, 3.6, '#e2508a', { left: '#8a1f4a', right: '#b42c62' });
        box(c, x + q[0], y + q[1], 18, 2.4, 6.6, 4.4, '#ff6aa6', { left: '#9a2a58', right: '#c23a74' });
        box(c, x + q[0] + 6.5, y + q[1] + 9, 5, 4, 3, 4.5, '#e0b050', { left: '#7a5a20', right: '#a07a30' });
      });
      box(c, x + 4.5, y + 57.5, 2, 2, 3, 16, '#d8d4e8', { left: '#8a86a8', right: '#b8b4d0' });
      var ms = E(x + 5.5, y + 58.5, 27);
      c.fillStyle = 'rgba(20,6,30,0.92)'; c.beginPath(); c.arc(ms[0], ms[1], 8.5, 0, Math.PI * 2); c.fill();
      c.lineJoin = 'round';
      c.beginPath(); c.moveTo(ms[0] - 5, ms[1] - 4.5); c.lineTo(ms[0] + 5, ms[1] - 4.5); c.lineTo(ms[0], ms[1] + 0.8); c.closePath();
      c.moveTo(ms[0], ms[1] + 0.8); c.lineTo(ms[0], ms[1] + 4.6); c.moveTo(ms[0] - 2.6, ms[1] + 4.8); c.lineTo(ms[0] + 2.6, ms[1] + 4.8);
      glowStroke(c, '#50dcff', 1.1, 5);
      c.beginPath(); c.moveTo(ms[0] + 2, ms[1] - 7); c.lineTo(ms[0] - 1, ms[1] - 2); glowStroke(c, '#ffd24a', 0.8, 4);
    },
    live: function (c, g, lv, t) {
      var x = g.x, y = g.y, ch = this.ch(lv), i;
      bulbs(c, memo('lgR' + lv, function () { return frontEdge(rrPts(x + 29, y + 7, 30, 30, 15, 8), ch + 2.6); }), 3.2, t, '#fff0f8', 'rgba(90,30,80,0.95)', 1.1);
      var ms = E(x + 5.5, y + 58.5, 27), k = Math.floor(t * 10), on = [], off = [];
      for (i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2; ((i + k) % 3 === 0 ? on : off).push(ms[0] + Math.cos(a) * 9.6, ms[1] + Math.sin(a) * 9.6); }
      c.fillStyle = 'rgba(90,30,80,0.95)'; c.beginPath(); for (i = 0; i < off.length; i += 2) c.rect(off[i] - 0.6, off[i + 1] - 0.6, 1.2, 1.2); c.fill();
      c.fillStyle = '#ffe6f6'; c.beginPath(); for (i = 0; i < on.length; i += 2) { c.moveTo(on[i] + 1.1, on[i + 1]); c.arc(on[i], on[i + 1], 1.1, 0, Math.PI * 2); } c.fill();
      var ol = E(x + 5.5, y + 58.5, 27);
      c.fillStyle = '#8cf08c'; c.beginPath(); c.arc(ol[0] - 1 + Math.sin(t * 2) * 0.4, ol[1] - 2.2, 1.1, 0, Math.PI * 2); c.fill();
      var bt = E(x + 44, y + 23, 3), bb = Math.sin(t * 4) * 0.8;
      c.fillStyle = '#ffffff'; rrect(c, bt[0] - 2, bt[1] - 13 + bb, 4, 6, 1.4); c.fill();
      c.fillStyle = '#1a1030'; c.fillRect(bt[0] - 0.6, bt[1] - 12.4 + bb, 1.2, 1);
      c.fillStyle = '#ffd9b8'; c.beginPath(); c.arc(bt[0], bt[1] - 15 + bb, 2, 0, Math.PI * 2); c.fill();
      var sk = E(x + 46, y + 24, 14 + Math.sin(t * 12) * 1.2); c.fillStyle = '#e8e8f0'; c.fillRect(sk[0] - 0.8, sk[1] - 2, 1.6, 3);
      this.sofas(lv).forEach(function (q, j) {
        var cp = E(x + q[0] + 9, y + q[1] + 11, 8), fl = 0.7 + 0.3 * Math.sin(t * 17 + j * 3);
        c.fillStyle = 'rgba(255,200,80,' + (0.25 * fl) + ')'; c.beginPath(); c.arc(cp[0], cp[1] - 1, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(cp[0], cp[1] - 1, 0.9 * fl + 0.3, 0, Math.PI * 2); c.fill();
      });
      var fest = memo('lgF' + lv, function () {
        var out = [], segs = [[[x + 5.5, y + 58.5, 19], [x + 34, y + 33, ch + 0.5]], [[x + 55, y + 32, ch + 0.5], [x + 71.8, y + 61.8, 16.5]]];
        segs.forEach(function (sg) {
          for (var q = 0; q <= 12; q++) {
            var f = q / 12, hh = sg[0][2] + (sg[1][2] - sg[0][2]) * f - Math.sin(f * Math.PI) * 6;
            out.push(E(sg[0][0] + (sg[1][0] - sg[0][0]) * f, sg[0][1] + (sg[1][1] - sg[0][1]) * f, hh));
          }
        });
        return out;
      });
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.4; c.beginPath();
      for (i = 0; i < fest.length; i++) { if (i % 13 === 0) c.moveTo(fest[i][0], fest[i][1]); else c.lineTo(fest[i][0], fest[i][1]); }
      c.stroke();
      var fcols = ['#ff5ac8', '#ffd24a', '#50dcff', '#8cf08c'], fk = Math.floor(t * 4);
      for (var cI = 0; cI < 4; cI++) {
        c.fillStyle = fcols[cI]; c.beginPath();
        for (i = 0; i < fest.length; i++) if ((i + fk) % 4 === cI) { c.moveTo(fest[i][0] + 1, fest[i][1] + 0.8); c.arc(fest[i][0], fest[i][1] + 0.8, 1, 0, Math.PI * 2); }
        c.fill();
      }
      c.save(); c.globalCompositeOperation = 'lighter';
      for (i = 0; i < 3; i++) {
        var ang = t * 0.9 + i * 2.1, fp = E(x + 44 + Math.cos(ang) * 13, y + 22 + Math.sin(ang) * 13, 3.2);
        c.fillStyle = ['rgba(255,90,200,0.2)', 'rgba(80,220,255,0.2)', 'rgba(255,210,80,0.2)'][i];
        c.beginPath(); c.ellipse(fp[0], fp[1], 6, 3, 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();
      if (lv >= 2) {
        var mb = E(x + 53, y + 31, ch - 6);
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(mb[0], mb[1] - 6); c.lineTo(mb[0], mb[1] - 3); c.stroke();
        c.fillStyle = '#c8c8e0'; c.beginPath(); c.arc(mb[0], mb[1], 3.2, 0, Math.PI * 2); c.fill();
        for (i = 0; i < 6; i++) {
          var a2 = t * 2 + i * 1.05;
          c.fillStyle = Math.cos(a2) > 0 ? '#ffffff' : '#8080a0';
          c.fillRect(mb[0] + Math.sin(a2) * 2.3 - 0.5, mb[1] - 2 + (i % 3) * 1.6, 1, 1);
        }
        c.save(); c.globalCompositeOperation = 'lighter'; c.beginPath();
        for (i = 0; i < 14; i++) {
          var sa = t * 0.8 + i * 0.45, rr2 = 8 + (i % 4) * 6;
          var sp = E(x + 50 + Math.cos(sa) * rr2, y + 44 + Math.sin(sa) * rr2 * 0.6, 3.2);
          c.rect(sp[0] - 0.9, sp[1] - 0.5, 1.8, 1);
        }
        c.fillStyle = hsl(t * 60, 90, 75); c.fill(); c.restore();
      }
      if (lv >= 3) {
        var fc = ['#ff8a3d', '#ffd23f', '#ff5ac8', '#7fe8ff'];
        for (i = 0; i < 4; i++) {
          var fa = t * (1 + i * 0.3) + i * 1.6, fh = 8 + (i % 3) * 4.5 + Math.sin(t * 2 + i) * 1.2;
          if (Math.sin(fa) < -0.2) continue;
          var fp2 = E(x + 19 + Math.cos(fa) * 3, y + 39 + Math.sin(fa) * 3, fh);
          c.fillStyle = fc[i]; c.beginPath(); c.ellipse(fp2[0], fp2[1], 1.5, 0.9, 0, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = 'rgba(200,240,255,0.7)'; var bub = E(x + 19, y + 39, 6 + (t * 6) % 16); c.fillRect(bub[0] - 0.4, bub[1] - 0.4, 0.8, 0.8);
      }
      if (lv >= 4) {
        var fl2 = E(x + 64 + Math.sin(t * 0.6) * 3, y + 49 + Math.cos(t * 0.5) * 3, 5.3 + Math.sin(t * 2) * 0.3);
        c.fillStyle = '#ff8ac8'; c.beginPath(); c.ellipse(fl2[0], fl2[1], 3.4, 1.8, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#ff8ac8'; c.lineWidth = 1; c.beginPath(); c.moveTo(fl2[0] + 2, fl2[1] - 0.5); c.quadraticCurveTo(fl2[0] + 3.6, fl2[1] - 5, fl2[0] + 1.8, fl2[1] - 5.6); c.stroke();
        c.fillStyle = '#ffd24a'; c.fillRect(fl2[0] + 0.8, fl2[1] - 6, 1.2, 0.8);
        c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.5; c.beginPath();
        for (i = 0; i < 3; i++) { var wp = E(x + 58 + i * 5, y + 44 + ((t * 4 + i * 5) % 12), 5.3); c.moveTo(wp[0] - 2, wp[1]); c.lineTo(wp[0] + 2, wp[1]); }
        c.stroke();
      }
      if (lv >= 5) {
        var dp = E(x + 44.5, y + 22.5, ch + 2.2), bob = Math.abs(Math.sin(t * 6)) * 1.2;
        c.fillStyle = '#ff5ac8'; rrect(c, dp[0] - 2, dp[1] - 8 - bob, 4, 5.5, 1.4); c.fill();
        c.fillStyle = '#ffd9b8'; c.beginPath(); c.arc(dp[0], dp[1] - 9.8 - bob, 1.9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#1a1030'; c.lineWidth = 0.8; c.beginPath(); c.arc(dp[0], dp[1] - 10 - bob, 2.3, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
        var dj = E(x + 44.5, y + 21.5, ch + 12);
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 0.6;
        for (i = 0; i < 6; i++) {
          var la = -Math.PI / 2 + Math.sin(t * 1.5 + i * 1.1) * 1.2;
          c.strokeStyle = i % 2 ? 'rgba(80,220,255,0.6)' : 'rgba(255,90,200,0.6)';
          c.beginPath(); c.moveTo(dj[0], dj[1]); c.lineTo(dj[0] + Math.cos(la) * 60, dj[1] + Math.sin(la) * 60); c.stroke();
        }
        c.restore();
        var ct = E(x + 47, y + 29, 11.1);
        for (var lvl = 0; lvl < 4; lvl++)
          for (var kk = 0; kk <= 3 - lvl; kk++) {
            c.fillStyle = 'rgba(255,230,140,0.95)';
            c.beginPath(); c.moveTo(ct[0] - 5 + lvl * 1.3 + kk * 2.6, ct[1] - lvl * 2.6);
            c.lineTo(ct[0] - 3.6 + lvl * 1.3 + kk * 2.6, ct[1] - lvl * 2.6); c.lineTo(ct[0] - 4.3 + lvl * 1.3 + kk * 2.6, ct[1] - lvl * 2.6 - 2.2); c.closePath(); c.fill();
          }
      }
    }
  };
  DEF.arcade = {
    wh: function (lv) { return 16 + 2 * lv; },
    pyH: function (lv) { return 40 + 4 * lv; },
    top: function (lv) { return this.pyH(lv) + 20; },
    cabs: function (lv) { return Math.min(7, 2 + lv); },
    vol: function (lv) {
      var v = [[2, 50, 14, 62, this.pyH(lv) + 4], [38, 2, 78, 6, 3 + this.wh(lv) + 2], [46, 7, 78, 15, 28]];
      if (lv >= 2) v.push([4, 28, 18, 40, 31]);
      if (lv >= 3) v.push([46, 22, 78, 30, 26]);
      if (lv >= 5) v.push([21, 41, 39, 59, 29]);
      return v;
    },
    body: function (c, g, lv, col) {
      var x = g.x, y = g.y, wh = this.wh(lv), i;
      plinth(c, g, col);
      c.fillStyle = '#141a44'; face(c, x + 3, y + 3, 74, 58, 3.05); c.fill();
      c.save(); face(c, x + 3, y + 3, 74, 58, 3.1); c.clip();
      c.strokeStyle = 'rgba(80,220,255,0.4)'; c.lineWidth = 0.6; c.beginPath();
      for (var gx = 0; gx <= 80; gx += 8) { mv(c, E(x + gx, y, 3.1)); ln(c, E(x + gx, y + 64, 3.1)); }
      for (var gy = 0; gy <= 64; gy += 8) { mv(c, E(x, y + gy, 3.1)); ln(c, E(x + 80, y + gy, 3.1)); }
      c.stroke(); c.restore();
      box(c, x + 38, y + 2, 40, 4, 3, wh, '#1c2250', { left: '#0c1030', right: '#161c44' });
      c.fillStyle = '#50dcff'; quadL(c, x + 38, x + 78, y + 6, 3 + wh - 4, 3 + wh - 3); c.fill();
      quadL(c, x + 38, x + 78, y + 6, 3 + wh - 4, 3 + wh - 3); glowStroke(c, '#50dcff', 0.4, 5);
      var cc = ['#e2508a', '#2bb8d8', '#f5b21c', '#8a6cff', '#3dd68c', '#ff7a3d', '#ff5ac8'], n = this.cabs(lv);
      for (i = 0; i < n; i++) {
        var row = i < 4 ? 0 : 1, k = row ? i - 4 : i, cx0 = x + 46.5 + k * 8, cy0 = y + (row ? 22 : 7);
        box(c, cx0, cy0, 7, 8, 3, 20, cc[i], { left: sh(cc[i], -70), right: sh(cc[i], -40) });
        box(c, cx0, cy0, 7, 3, 23, 4, sh(cc[i], 30));
        c.fillStyle = '#05060f'; quadL(c, cx0 + 1, cx0 + 6, cy0 + 8, 13, 20.5); c.fill();
        c.fillStyle = '#2a2a3a'; face(c, cx0 + 0.5, cy0 + 8, 6, 2.6, 11); c.fill();
      }
      if (lv >= 2) {
        box(c, x + 4, y + 28, 14, 12, 3, 8, '#e2508a', { left: '#8a1f4a', right: '#b42c62' });
        var toys = ['#ffd24a', '#7fe8ff', '#ff8ad8', '#8cf08c', '#ffffff'];
        for (i = 0; i < 7; i++) {
          var tp = E(x + 6 + (i % 4) * 3.2, y + 31 + Math.floor(i / 4) * 4.5, 12.5);
          c.fillStyle = toys[i % 5]; c.beginPath(); c.arc(tp[0], tp[1], 1.8, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = 'rgba(180,230,255,0.22)';
        quadL(c, x + 4, x + 18, y + 40, 11, 27); c.fill(); quadR(c, x + 18, y + 40, y + 28, 11, 27); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.5;
        quadL(c, x + 4, x + 18, y + 40, 11, 27); c.stroke(); quadR(c, x + 18, y + 40, y + 28, 11, 27); c.stroke();
        box(c, x + 4, y + 28, 14, 12, 27, 3, '#ff5aa6');
      }
      if (lv >= 3) { c.fillStyle = '#222a60'; face(c, x + 22, y + 12, 14, 14, 3.2); c.fill(); }
      if (lv >= 4) {
        for (i = 0; i < 2; i++) {
          var sx = x + 50 + i * 10, sy = y + 34;
          box(c, sx, sy, 8, 6, 3, 17, '#ffd24a', { left: '#a07a10', right: '#d8a420' });
          box(c, sx, sy, 8, 2.5, 20, 3, '#ff3b3b', { top: '#ff7a7a' });
          c.fillStyle = '#fff'; quadL(c, sx + 1, sx + 7, sy + 6, 10, 16); c.fill();
        }
      }
      var tx = x + 50, ty = y + 43;
      box(c, tx, ty, 26, 15, 3, 7, '#6b3f1f', { top: '#2e8b57', left: '#3a2010', right: '#55301a' });
      c.fillStyle = '#26764a'; face(c, tx + 2, ty + 2, 22, 11, 10.05); c.fill();
      box(c, x + 6, y + 54, 4, 4, 3, this.pyH(lv) - 4, '#2a2050', { left: '#141030', right: '#201844' });
    },
    sign: function (c, g, lv, t) {
      var base = E(g.x + 8, g.y + 56, 0), H0 = this.pyH(lv), bw = 13, bh = H0 - 16, by = base[1] - H0 + 2, bx = base[0] - bw / 2;
      c.fillStyle = '#12081e'; rrect(c, bx, by, bw, bh, 4); c.fill();
      c.lineWidth = 1.2; c.strokeStyle = '#50dcff'; rrect(c, bx, by, bw, bh, 4); c.stroke();
      var L0 = ['G', 'A', 'M', 'E'], cols = ['#ff5ac8', '#ffd24a', '#50dcff', '#8cf08c'], stepY = bh / 4;
      var li = Math.floor(t * 3) % 5;
      for (var i = 0; i < 4; i++) {
        var cy = by + stepY * (i + 0.5);
        if (li === i) { c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(base[0], cy, 6, 0, Math.PI * 2); c.fill(); }
        tDraw(c, L0[i], base[0], cy + 0.4, 9, cols[i], 900);
      }
      var k = Math.floor(t * 10), on = [], off = [], n = 26;
      for (i = 0; i < n; i++) {
        var f = i / n, px, py, per = 2 * (bw + bh);
        var d = f * per;
        if (d < bw) { px = bx + d; py = by - 1.5; }
        else if (d < bw + bh) { px = bx + bw + 1.5; py = by + d - bw; }
        else if (d < 2 * bw + bh) { px = bx + bw - (d - bw - bh); py = by + bh + 1.5; }
        else { px = bx - 1.5; py = by + bh - (d - 2 * bw - bh); }
        ((i + k) % 3 === 0 ? on : off).push(px, py);
      }
      c.fillStyle = 'rgba(40,70,110,0.95)'; c.beginPath(); for (i = 0; i < off.length; i += 2) c.rect(off[i] - 0.6, off[i + 1] - 0.6, 1.2, 1.2); c.fill();
      c.fillStyle = '#e8fbff'; c.beginPath(); for (i = 0; i < on.length; i += 2) { c.moveTo(on[i] + 1.2, on[i + 1]); c.arc(on[i], on[i + 1], 1.2, 0, Math.PI * 2); } c.fill();
      var py0 = by + bh + 2.5, px0 = base[0] - 7;
      c.beginPath(); c.moveTo(px0, py0); c.lineTo(px0 + 21, py0); c.lineTo(px0 + 25, py0 + 3.6); c.lineTo(px0 + 21, py0 + 7.2); c.lineTo(px0, py0 + 7.2); c.closePath();
      c.fillStyle = '#ffd24a'; c.fill(); c.lineWidth = 0.9; c.strokeStyle = '#b01838'; c.stroke();
      tDraw(c, 'CENTER', px0 + 11, py0 + 3.8, 4.6, '#b01838', 900);
      var st = E(g.x + 8, g.y + 56, H0 + 2);
      starPath(c, st[0], st[1], 5, 2.2, 5); c.fillStyle = Math.sin(t * 4) > 0 ? '#ffd24a' : '#ffe88a'; c.fill();
      c.strokeStyle = '#b01838'; c.lineWidth = 0.7; c.stroke();
    },
    live: function (c, g, lv, t) {
      var x = g.x, y = g.y, wh = this.wh(lv), i;
      var n = this.cabs(lv);
      for (i = 0; i < n; i++) {
        var row = i < 4 ? 0 : 1, k = row ? i - 4 : i, cx0 = x + 46.5 + k * 8, cy0 = y + (row ? 22 : 7);
        c.fillStyle = hsl(t * 200 + i * 120, 90, 55 + 15 * Math.sin(t * 13 + i));
        quadL(c, cx0 + 1.6, cx0 + 5.4, cy0 + 8, 14, 19.8); c.fill();
      }
      bulbs(c, [[[x + 38, y + 6.2, 3 + wh + 0.4], [x + 78, y + 6.2, 3 + wh + 0.4], [x + 78, y + 2, 3 + wh + 0.4]]], 3.4, t, '#e8fbff', 'rgba(20,50,90,0.95)', 1);
      bulbs(c, rimLines(x + 3, y + 3, 74, 58, 3.4), 5, t, '#fff4c0', 'rgba(90,70,40,0.8)', 1.1);
      var tx = x + 50, ty = y + 43, balls = ['#ffffff', '#f5b21c', '#e2504a', '#2b7fe0', '#2a1a40', '#8a3cff'];
      balls.forEach(function (bc, bi) {
        var bp = E(tx + 5 + ((bi * 3.6 + t * (bi === 0 ? 6 : 1.5)) % 16), ty + 4 + (bi % 3) * 3.4, 11);
        c.fillStyle = bc; c.beginPath(); c.arc(bp[0], bp[1], 1.5, 0, Math.PI * 2); c.fill();
      });
      if (lv >= 2) {
        var ax = x + 7 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 8, ay = y + 31 + (Math.cos(t * 0.7) * 0.5 + 0.5) * 6;
        var drop = Math.max(0, Math.sin(t * 1.3)) * 10, a0 = E(ax, ay, 26), a1 = E(ax, ay, 25 - drop);
        c.strokeStyle = '#e8e8f0'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.stroke();
        c.lineWidth = 0.9; c.beginPath(); c.moveTo(a1[0] - 2, a1[1] + 2.5); c.lineTo(a1[0], a1[1]); c.lineTo(a1[0] + 2, a1[1] + 2.5); c.stroke();
        bulbs(c, rimLines(x + 4, y + 28, 14, 12, 30.2), 3, t, '#ffe6f6', 'rgba(90,30,80,0.95)', 0.9);
      }
      if (lv >= 3) {
        for (i = 0; i < 4; i++) {
          var lit = Math.floor(t * 4 + i * 1.7) % 4 === i;
          c.fillStyle = lit ? ['#ff5aa6', '#50dcff', '#ffd24a', '#8cf08c'][i] : 'rgba(120,130,200,0.35)';
          var ox = [5, 0, 10, 5][i], oy = [0, 5, 5, 10][i];
          face(c, x + 22 + ox + 0.5, y + 12 + oy + 0.5, 3.5, 3.5, 3.4); c.fill();
        }
        var dp = E(x + 29, y + 19, 3.4), jump = Math.abs(Math.sin(t * 8)) * 2.5;
        c.fillStyle = '#50dcff'; rrect(c, dp[0] - 1.8, dp[1] - 7 - jump, 3.6, 5, 1.2); c.fill();
        c.fillStyle = '#ffd9b8'; c.beginPath(); c.arc(dp[0], dp[1] - 8.6 - jump, 1.7, 0, Math.PI * 2); c.fill();
      }
      if (lv >= 4) {
        var sym = ['#ff2040', '#ff8ad8', '#ffd24a', '#2a2a3a', '#50dcff'];
        for (i = 0; i < 2; i++) {
          var sx = x + 50 + i * 10, sy = y + 34, win = (t + i * 2.3) % 6 > 5;
          c.save(); faceL(c, sx + 1, sy + 6, 16);
          for (var r = 0; r < 3; r++) {
            c.fillStyle = win ? '#ff2040' : sym[(Math.floor(t * 12) + r * 2 + i) % sym.length];
            c.fillRect(0.4 + r * 1.2, 1.6, 0.9, 3.4);
          }
          c.restore();
          if (win) { var wp = E(sx + 4, sy + 6, 22); c.fillStyle = 'rgba(255,220,80,0.5)'; c.beginPath(); c.arc(wp[0], wp[1], 5 + Math.sin(t * 20) * 1.5, 0, Math.PI * 2); c.fill(); }
        }
      }
      if (lv >= 5) this.carousel(c, x + 30, y + 50, t);
      this.sign(c, g, lv, t);
    },
    carousel: function (c, cx, cy, t) {
      var R = 9, i, n = 8, rot = t * 0.8;
      var base = rrPts(cx - R, cy - R, R * 2, R * 2, R, 6);
      prism(c, base, 3, 2, '#b8a0d8', '#f4ecff', '#e8dcff');
      var order = [];
      for (i = 0; i < n; i++) { var a = rot + i / n * Math.PI * 2; order.push({ a: a, s: Math.sin(a), i: i }); }
      order.sort(function (p, q) { return p.s - q.s; });
      var hc = ['#ffffff', '#ffd24a', '#ff8ac8', '#7fe8ff'];
      var ctr = E(cx, cy, 5);
      var pole = E(cx, cy, 26);
      c.strokeStyle = '#ffd24a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ctr[0], ctr[1]); c.lineTo(pole[0], pole[1] + 4); c.stroke();
      for (var k = 0; k < order.length; k++) {
        var o = order[k], hx = cx + Math.cos(o.a) * (R - 3), hy = cy + Math.sin(o.a) * (R - 3), bob = Math.sin(t * 3 + o.i * 1.3) * 1.6;
        var p0 = E(hx, hy, 5), p1 = E(hx, hy, 18);
        c.strokeStyle = '#e8d8a0'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
        var hp = E(hx, hy, 9 + bob), dir = -Math.sin(o.a) >= 0 ? 1 : -1;
        c.fillStyle = hc[o.i % 4];
        c.beginPath(); c.ellipse(hp[0], hp[1], 2.4, 1.3, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(hp[0] + dir * 2.2, hp[1] - 1.6, 1, 1.4, dir * 0.5, 0, Math.PI * 2); c.fill();
        c.fillRect(hp[0] - 1.8, hp[1], 0.8, 2); c.fillRect(hp[0] + 1, hp[1], 0.8, 2);
      }
      var rc = E(cx, cy, 20), rx = R * 1.02 * 1.24, ry = R * 1.02 * 0.66, tip = E(cx, cy, 27);
      for (i = 0; i < 12; i++) {
        var a0 = i / 12 * Math.PI * 2 + rot * 0.3, a1 = (i + 1) / 12 * Math.PI * 2 + rot * 0.3;
        if (Math.sin((a0 + a1) / 2) < -0.2) continue;
        c.fillStyle = i % 2 ? '#ff5aa6' : '#ffffff';
        c.beginPath(); c.moveTo(tip[0], tip[1]);
        c.lineTo(rc[0] + Math.cos(a0) * rx, rc[1] + Math.sin(a0) * ry); c.lineTo(rc[0] + Math.cos(a1) * rx, rc[1] + Math.sin(a1) * ry); c.closePath(); c.fill();
      }
      var k2 = Math.floor(t * 8), on = [];
      for (i = 0; i < 16; i++) { var a3 = i / 16 * Math.PI * 2; if (Math.sin(a3) < -0.3) continue; if ((i + k2) % 2 === 0) on.push(rc[0] + Math.cos(a3) * rx, rc[1] + Math.sin(a3) * ry); }
      c.fillStyle = '#fff4c0'; c.beginPath(); for (i = 0; i < on.length; i += 2) { c.moveTo(on[i] + 1.1, on[i + 1]); c.arc(on[i], on[i + 1], 1.1, 0, Math.PI * 2); } c.fill();
      c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(tip[0], tip[1] - 1, 1.6, 0, Math.PI * 2); c.fill();
    }
  };
  var SPH_FONT = { Q: ['01110', '10001', '10001', '10101', '10010', '01101'], T: ['11111', '00100', '00100', '00100', '00100', '00100'],
                   Y: ['10001', '01010', '00100', '00100', '00100', '00100'], C: ['01111', '10000', '10000', '10000', '10000', '01111'],
                   ' ': ['00000', '00000', '00000', '00000', '00000', '00000'] };
  function sphereColor(mode, u, v, t) {
    if (mode === 0) return hsl(Math.round((v * 120 + t * 90) / 12) * 12, 95, 58);
    if (mode === 1) {
      var fx = u / 1.2, fy = -v / 1.2;
      var eye = (Math.hypot(fx + 0.35, fy - 0.3) < 0.13 || Math.hypot(fx - 0.35, fy - 0.3) < 0.13) && Math.sin(t * 3) > -0.9;
      var mouth = Math.abs(Math.hypot(fx, fy + 0.05) - 0.5) < 0.07 && fy < -0.1;
      return eye || mouth ? '#2a1a40' : '#ffd23f';
    }
    if (mode === 2) {
      var lu = u + t * 0.6, land = Math.sin(lu * 3) * Math.cos(v * 4) + Math.sin(lu * 5 + 1) * 0.5 > 0.45;
      return Math.abs(v) > 1.25 ? '#ffffff' : land ? '#3fbf5f' : '#2b7fe0';
    }
    if (mode === 3) {
      var text = 'QTYC ', cols = text.length * 6;
      var cx = Math.floor(((u + Math.PI) / (Math.PI * 2) * 40 + t * 8) % cols), cy = Math.floor((0.55 - v / 1.4) * 6 * 1.4 - 1);
      var ch = SPH_FONT[text[Math.floor(cx / 6)]], col = cx % 6;
      var onn = ch && cy >= 0 && cy < 6 && col < 5 && ch[cy][col] === '1';
      return onn ? '#ffffff' : '#e2508a';
    }
    if (mode === 4) {
      var ex = u - Math.sin(t * 1.3) * 0.35, ey = v - Math.cos(t * 0.9) * 0.2, dd = Math.hypot(ex, ey);
      return dd < 0.28 ? '#10081a' : dd < 0.55 ? '#2bb8d8' : Math.hypot(u, v) < 1.25 ? '#ffffff' : '#ff9ab8';
    }
    var d = Math.hypot(u * 0.9, v), ring = (d * 3 - t * 2) % 1;
    return ring < 0.18 ? hsl(Math.round((d * 200 + t * 60) / 30) * 30, 95, 62) : null;
  }
  var SPH = { c: null, s: 0, t: -9, R: 0, lv: 0, shade: null };
  function sphereFace(R, t, lv) {
    var m = ctx.getTransform(), s = m.a, size = Math.ceil((R * 2 + 4) * s);
    if (!SPH.c) SPH.c = document.createElement('canvas');
    var c = SPH.c.getContext('2d');
    if (SPH.s !== s || SPH.R !== R || SPH.lv !== lv) {
      SPH.c.width = size; SPH.c.height = size; SPH.s = s; SPH.R = R; SPH.lv = lv; SPH.t = -9;
      SPH.shade = c.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.2, 0, 0, R);
      SPH.shade.addColorStop(0, 'rgba(255,255,255,0.10)'); SPH.shade.addColorStop(0.55, 'rgba(10,5,30,0)'); SPH.shade.addColorStop(1, 'rgba(10,5,30,0.6)');
    }
    if (t - SPH.t >= 1 / 10 || t < SPH.t) {
      SPH.t = t;
      c.setTransform(s, 0, 0, s, size / 2, size / 2);
      c.clearRect(-R - 2, -R - 2, R * 2 + 4, R * 2 + 4);
      c.fillStyle = '#120d2a'; c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
      var mode = Math.floor(t / 6) % 6, rows = Math.round(R * 0.6), colsN = Math.round(R * 0.66), bk = {}, keys = [];
      var boost = lv >= 3 ? 1.18 : lv >= 2 ? 1.08 : 1;
      for (var i = 0; i < rows; i++) {
        var v = -Math.PI / 2 + (i + 0.5) * Math.PI / rows, ry = Math.sin(v), rr1 = Math.cos(v);
        var n = Math.max(3, Math.round(colsN * rr1));
        for (var j = 0; j < n; j++) {
          var u = -Math.PI / 2 + (j + 0.5) * Math.PI / n, dz = Math.cos(u) * rr1;
          var col = sphereColor(mode, u, -v, t);
          if (!col) continue;
          var sz = (1.6 + dz * 1.2) * boost, list = bk[col];
          if (!list) { list = bk[col] = []; keys.push(col); }
          list.push(Math.sin(u) * rr1 * R - sz / 2, ry * R - sz / 2, sz);
        }
      }
      for (var k = 0; k < keys.length; k++) {
        var L = bk[keys[k]]; c.fillStyle = keys[k]; c.beginPath();
        for (var q = 0; q < L.length; q += 3) c.rect(L[q], L[q + 1], L[q + 2], L[q + 2]);
        c.fill();
      }
      c.fillStyle = SPH.shade; c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.stroke();
    }
    return SPH;
  }
  var SPC = { x: 84, y: 76, ped: 8 };
  DEF.sphere = {
    R: function (lv) { return 25 + 2 * (lv - 1); },
    top: function (lv) { return 3 + SPC.ped + this.R(lv) * 2 + (lv >= 3 ? 90 : 16); },
    vol: function (lv) { var R = this.R(lv); return [[SPC.x, SPC.y, 3 + SPC.ped + R, R], [SPC.x - 14, SPC.y - 14, SPC.x + 14, SPC.y + 14, 3 + SPC.ped]]; },
    body: function (c, g, lv, col) {
      var x = g.x, y = g.y, ped = SPC.ped, i;
      var pl = rrPts(x + 4, y + 4, 104, 88, 40, 8);
      c.fillStyle = rgba('#e2508a', 0.2); topPath(c, rrPts(x + 1, y + 1, 110, 94, 44, 8), 0.2); c.fill();
      prism(c, pl, 0, 3, '#1a1236', '#2a1f52', '#2a2350');
      topPath(c, pl, 3); glowStroke(c, '#ff5ac8', 1, 6);
      var cc = E(x + SPC.x, y + SPC.y, 3.1);
      c.strokeStyle = 'rgba(255,90,200,0.35)'; c.lineWidth = 0.8;
      for (i = 1; i <= 3; i++) { c.beginPath(); c.ellipse(cc[0], cc[1], 12 * i * A * 1.6, 12 * i * B * 1.6, 0, 0, Math.PI * 2); c.stroke(); }
      for (i = 0; i < lv; i++) {
        var sp = E(x + 30 + i * 16, y + 26 + (i % 2) * 10, 3.1);
        c.save(); c.translate(sp[0], sp[1]); c.scale(1, 0.55);
        starPath(c, 0, 0, 7, 3, 5); glowStroke(c, ['#ffd24a', '#50dcff', '#8cf08c'][i % 3], 0.9, 5);
        c.restore();
      }
      var pd = rrPts(x + SPC.x - 14, y + SPC.y - 14, 28, 28, 14, 8);
      prism(c, pd, 3, ped, '#241a4a', '#4a3a8a', '#3a3170');
      topPath(c, pd, 3 + ped); glowStroke(c, '#7fe8ff', 0.8, 5);
      if (lv >= 2) {
        [[-20, -6], [-6, -20], [20, 4], [4, 20]].forEach(function (o) {
          var pp = rrPts(x + SPC.x + o[0] - 2.5, y + SPC.y + o[1] - 2.5, 5, 5, 2.5, 4);
          prism(c, pp, 3, 10 + lv * 2, '#3a2a70', '#b8a6ff', '#ffffff');
        });
      }
    },
    live: function (c, g, lv, t) {
      var x = g.x, y = g.y, R = this.R(lv), i;
      var cen = E(x + SPC.x, y + SPC.y, 3 + SPC.ped + R), mode = Math.floor(t / 6) % 6;
      var g0 = E(x + SPC.x, y + SPC.y, 3.2);
      c.fillStyle = sphereColor(mode, 0, 0, t) || '#e2508a'; c.globalAlpha *= 0.25;
      c.beginPath(); c.ellipse(g0[0], g0[1], R * 1.4, R * 0.7, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha /= 0.25;
      bulbs(c, memo('sphb', function () { return frontEdge(rrPts(x + 4, y + 4, 104, 88, 40, 8), 3.3); }), 4.5, t, '#ffe6f6', 'rgba(90,30,80,0.95)', 1.1);
      if (lv >= 2) {
        c.fillStyle = hsl(t * 90, 95, 70); c.beginPath();
        [[-20, -6], [-6, -20], [20, 4], [4, 20]].forEach(function (o, k) {
          var tp = E(x + SPC.x + o[0], y + SPC.y + o[1], 3 + 10 + lv * 2 + 1.5 + Math.sin(t * 4 + k) * 0.6);
          c.moveTo(tp[0] + 1.8, tp[1]); c.arc(tp[0], tp[1], 1.8, 0, Math.PI * 2);
        });
        c.fill();
      }
      if (lv >= 3) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (i = 0; i < 4; i++) {
          var ang = Math.sin(t * 0.6 + i * 2.1) * 0.35 + (i - 1.5) * 0.28;
          c.save(); c.translate(cen[0], cen[1]); c.rotate(ang);
          c.fillStyle = i % 2 ? 'rgba(255,150,230,0.14)' : 'rgba(200,170,255,0.15)';
          c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.lineTo(12, -R * 3.6); c.lineTo(-12, -R * 3.6); c.closePath(); c.fill();
          c.restore();
        }
        c.restore();
      }
      if (lv >= 2) ring(c, cen, R, t, true, -0.18);
      if (lv >= 3) ring(c, cen, R, t + 1.3, true, 0.32);
      var sp = sphereFace(R, t, lv), m = ctx.getTransform();
      if (c === ctx) {
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
        c.drawImage(sp.c, Math.round(m.a * cen[0] + m.e - sp.c.width / 2), Math.round(m.d * cen[1] + m.f - sp.c.height / 2));
        c.restore();
      }
      if (lv >= 2) ring(c, cen, R, t, false, -0.18);
      if (lv >= 3) ring(c, cen, R, t + 1.3, false, 0.32);
      if (lv >= 3) {
        var cr = E(x + SPC.x, y + SPC.y, 3 + SPC.ped + R * 2 + 3), n = 7;
        c.fillStyle = '#ffd24a'; c.beginPath();
        for (i = 0; i < n; i++) {
          var a = i / n * Math.PI * 2 + t * 1.2, px = cr[0] + Math.cos(a) * 9, py = cr[1] + Math.sin(a) * 2.6;
          if (Math.sin(a) < -0.2) continue;
          var hgt = 3 + (i % 2) * 2;
          c.moveTo(px - 1.2, py); c.lineTo(px, py - hgt); c.lineTo(px + 1.2, py); c.closePath();
        }
        c.fill();
      }
    }
  };
  function ring(c, cen, R, t, back, tilt) {
    var rx = R * 1.26, ry = R * 0.38, n = 40, k = Math.floor(t * 10), on = [], off = [];
    c.strokeStyle = back ? 'rgba(255,120,210,0.35)' : 'rgba(255,150,220,0.75)'; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(cen[0], cen[1], rx, ry, tilt, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI); c.stroke();
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, isBack = Math.sin(a) < 0;
      if (isBack !== back) continue;
      var px = cen[0] + Math.cos(a) * rx * Math.cos(tilt) - Math.sin(a) * ry * Math.sin(tilt);
      var py = cen[1] + Math.cos(a) * rx * Math.sin(tilt) + Math.sin(a) * ry * Math.cos(tilt);
      ((i + k) % 4 === 0 ? on : off).push(px, py);
    }
    c.fillStyle = back ? 'rgba(160,110,190,0.6)' : '#c890ff'; c.beginPath();
    for (i = 0; i < off.length; i += 2) c.rect(off[i] - 0.7, off[i + 1] - 0.7, 1.4, 1.4);
    c.fill();
    c.fillStyle = '#ffffff'; c.beginPath();
    for (i = 0; i < on.length; i += 2) { c.moveTo(on[i] + 1.5, on[i + 1]); c.arc(on[i], on[i + 1], 1.5, 0, Math.PI * 2); }
    c.fill();
  }
  function drawPlot(id, p, S) {
    var d = DEF[id], st = S.p[p.id], lv = Math.max(1, st.level || 1), g = geo(p);
    var col = p.color || (p.domain ? H.W.DOMAINS[p.domain].color : '#6f57e0');
    var top = d.top(lv), bb = plotBB(g, top, 6);
    if (!visible(bb)) return true;
    var vols = memo('vol:' + id + lv, function () { return d.vol(lv); });
    var a = fadeFor(p, S, g, vols, occluded(id, p, g, lv, vols));
    ctx.save();
    ctx.globalAlpha = a;
    sprite('p:' + id, String(lv), bb, function (oc) { d.body(oc, g, lv, col, S); });
    d.live(ctx, g, lv, S.t, S, p);
    ctx.restore();
    return true;
  }
  ['pharma', 'fin', 'cae', 'opt', 'crypto', 'sns', 'tube', 'press', 'seminar', 'lounge', 'arcade', 'sphere'].forEach(function (id) {
    on('plot', id, function (p, S, h) { begin(h); return drawPlot(id, p, S); });
  });
  QT.ArtHQ = {
    check: function () {
      var out = [], W = QT.World, pads = QT.G.PADS();
      Object.keys(DEF).forEach(function (id) {
        var p = W.BY_ID[id], g = geo(p);
        for (var lv = 1; lv <= (p.maxLevel || 6); lv++) {
          var vols = DEF[id].vol(lv);
          pads.forEach(function (pad) {
            if (pad.p && pad.p !== p && pad.p.room === 'hq' && padHidden(vols, g, pad)) out.push(id + ' Lv.' + lv + ' -> ' + pad.p.id + ':' + pad.type);
          });
        }
      });
      return out;
    }
  };
  var HQR = null;
  function hqRoom() {
    if (!HQR) H.W.ROOMS.forEach(function (r) { if (r.id === 'hq') HQR = r; });
    return HQR;
  }
  function wallTopAt(ex) {
    var r = hqRoom(), x0 = (r.ix - 1) * T, y0 = (r.iy - 1) * T, x1 = (r.ix + r.iw + 1) * T, y1 = (r.iy + r.ih + 1) * T;
    var cx = (x0 - y0) * A;
    if (ex >= cx && ex <= (x1 - y0) * A) { var xx = ex / A + y0; return (xx + y0) * B - 24; }
    if (ex < cx && ex >= (x0 - y1) * A) { var yy = x0 - ex / A; return (x0 + yy) * B - 24; }
    return Infinity;
  }
  var TW = { x: 250, y: -60 };
  function winPrism(c, pts, h0, h1, fh, seed, dark, cols) {
    prism(c, pts, h0, h1 - h0, dark[0], dark[1], null);
    var n = pts.length, f = 0;
    for (var hh = h0 + 2; hh + fh * 0.55 < h1; hh += fh, f++) {
      for (var i = 0; i < n; i++) {
        var a = pts[i], b = pts[(i + 1) % n], nx = b[1] - a[1], ny = -(b[0] - a[0]), L = Math.sqrt(nx * nx + ny * ny);
        if (L < 1e-6 || (nx + ny) / L <= 0.05) continue;
        var cells = Math.max(1, Math.round(L / 4.5));
        for (var k = 0; k < cells; k++) {
          var r0 = rnd(seed + f * 31.7 + i * 7.3 + k * 1.9);
          if (r0 > 0.62) continue;
          var u0 = (k + 0.15) / cells, u1 = (k + 0.85) / cells;
          var p0 = [a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], p1 = [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1];
          var shd = (nx / L - ny / L + 1) / 2;
          c.fillStyle = mix(cols[Math.floor(r0 * 50) % cols.length], '#ffffff', shd * 0.25);
          c.beginPath(); mv(c, E(p0[0], p0[1], hh)); ln(c, E(p1[0], p1[1], hh)); ln(c, E(p1[0], p1[1], hh + fh * 0.55)); ln(c, E(p0[0], p0[1], hh + fh * 0.55)); c.closePath(); c.fill();
        }
      }
    }
  }
  var TOWER_H = 250;
  function towerBB() { var l = (TW.x - 46 - TW.y - 42) * A - 20, r = (TW.x + 46 - TW.y + 42) * A + 20; return { x: l, y: (TW.x + TW.y - 84) * B - TOWER_H - 70, w: r - l, h: TOWER_H + 150 }; }
  function towerBody(c) {
    var x = TW.x, y = TW.y, i;
    var pod = rrPts(x - 44, y - 40, 88, 80, 20, 6);
    prism(c, pod, 0, 28, '#2a1a3a', '#4a3060', '#3a2a50');
    topPath(c, pod, 28); glowStroke(c, '#ffd24a', 1, 6);
    var s1 = rrPts(x - 26, y - 24, 52, 48, 16, 6), s2 = rrPts(x - 21, y - 19, 42, 38, 13, 6), s3 = rrPts(x - 15, y - 14, 30, 28, 10, 6);
    var warm = ['#ffd86b', '#fff1b8', '#ffe08a', '#9fe8ff', '#ffb8e0'];
    winPrism(c, s1, 28, 150, 6, 11, ['#141236', '#2a2866'], warm);
    topPath(c, s1, 150); c.fillStyle = '#ffcf4a'; c.fill();
    winPrism(c, s2, 150, 205, 6, 29, ['#151338', '#2c2a6a'], warm);
    topPath(c, s2, 205); c.fillStyle = '#ffcf4a'; c.fill();
    winPrism(c, s3, 205, 238, 6, 47, ['#16143a', '#2e2c70'], warm);
    prism(c, rrPts(x - 17, y - 16, 34, 32, 12, 6), 238, 8, '#b8861a', '#ffd24a', '#ffe28a');
    prism(c, rrPts(x - 10, y - 9, 20, 18, 8, 6), 246, 6, '#b8861a', '#ffd24a', '#ffe28a');
    var sp0 = E(x, y, 252), sp1 = E(x, y, TOWER_H + 48);
    c.strokeStyle = '#ffe28a'; c.lineWidth = 2; c.beginPath(); mv(c, sp0); ln(c, sp1); c.stroke();
    c.strokeStyle = '#fff6d0'; c.lineWidth = 0.8; c.beginPath(); mv(c, sp0); ln(c, sp1); c.stroke();
    var bl = E(x + 18, y + 24, 140), bw = 17, bh = 86;
    c.fillStyle = '#12081e'; rrect(c, bl[0] - bw / 2, bl[1], bw, bh, 5); c.fill();
    c.lineWidth = 1.4; rrect(c, bl[0] - bw / 2, bl[1], bw, bh, 5); glowStroke(c, '#ff5ac8', 1.4, 8);
    var letters = ['Q', 'T', 'Y', 'C'];
    for (i = 0; i < 4; i++) neonText(c, letters[i], bl[0], bl[1] + 12 + i * 20.5, 17, ['#ffd24a', '#50dcff', '#ff5ac8', '#8cf08c'][i], '#ffffff', 9);
    var ps = E(x + 44, y + 10, 18);
    c.save(); faceR(c, x + 44, y + 38, 24);
    c.fillStyle = 'rgba(20,8,30,0.9)'; rrect(c, 4, 0, 40, 10, 3); c.fill();
    neonText(c, 'QTYC TOWER', 24, 5.2, 6.5, '#ffd24a', '#fff6d0', 6);
    c.restore();
    return ps;
  }
  function towerLive(c, t) {
    var x = TW.x, y = TW.y, i;
    var bl = E(x + 18, y + 24, 140), bw = 17, bh = 86;
    var k = Math.floor(t * 10), n = 34, on = [], off = [];
    for (i = 0; i < n; i++) {
      var f = i / n, px, py;
      if (f < 0.4) { px = bl[0] - bw / 2 - 2; py = bl[1] + bh * (f / 0.4); }
      else if (f < 0.5) { px = bl[0] - bw / 2 - 2 + (bw + 4) * ((f - 0.4) / 0.1); py = bl[1] + bh + 2; }
      else if (f < 0.9) { px = bl[0] + bw / 2 + 2; py = bl[1] + bh * (1 - (f - 0.5) / 0.4); }
      else { px = bl[0] + bw / 2 + 2 - (bw + 4) * ((f - 0.9) / 0.1); py = bl[1] - 2; }
      ((i + k) % 3 === 0 ? on : off).push(px, py);
    }
    c.fillStyle = 'rgba(120,60,40,0.9)'; c.beginPath(); for (i = 0; i < off.length; i += 2) c.rect(off[i] - 0.7, off[i + 1] - 0.7, 1.4, 1.4); c.fill();
    c.fillStyle = '#fff4c0'; c.beginPath(); for (i = 0; i < on.length; i += 2) { c.moveTo(on[i] + 1.3, on[i + 1]); c.arc(on[i], on[i + 1], 1.3, 0, Math.PI * 2); } c.fill();
    var li = Math.floor(t * 2.5) % 6;
    if (li < 4) {
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(bl[0], bl[1] + 12 + li * 20.5, 10, 0, Math.PI * 2); c.fill();
    }
    bulbs(c, memo('twc', function () { return frontEdge(rrPts(x - 17, y - 16, 34, 32, 12, 6), 246.4); }), 3.2, t, '#fff4c0', 'rgba(110,80,20,0.9)', 1.2);
    bulbs(c, memo('twp', function () { return frontEdge(rrPts(x - 44, y - 40, 88, 80, 20, 6), 28.5); }), 5, t + 0.2, '#ffe6f6', 'rgba(90,30,70,0.9)', 1.2);
    var top = E(x, y, 256), a = t * 1.6;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (i = 0; i < 2; i++) {
      var aa = a + i * Math.PI, dx = Math.cos(aa), sy = Math.sin(aa) * 0.3;
      c.fillStyle = 'rgba(255,240,180,' + (0.10 + 0.12 * Math.max(0, Math.sin(aa))) + ')';
      c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(top[0] + dx * 120, top[1] + sy * 120 - 10); c.lineTo(top[0] + dx * 120, top[1] + sy * 120 + 10); c.closePath(); c.fill();
    }
    c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(top[0], top[1], 2.4, 0, Math.PI * 2); c.fill();
    c.restore();
    var sp = E(x, y, TOWER_H + 48);
    if (Math.sin(t * 3.5) > 0) { c.fillStyle = 'rgba(255,50,50,0.35)'; c.beginPath(); c.arc(sp[0], sp[1], 4, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = Math.sin(t * 3.5) > 0 ? '#ff3a3a' : '#661818'; c.beginPath(); c.arc(sp[0], sp[1], 1.6, 0, Math.PI * 2); c.fill();
  }
  var HOT = { x: 410, y: -84 }, PYR = { x: 540, y: -56 };
  function hotelBB() { return { x: (HOT.x - 40 - HOT.y - 24) * A - 10, y: (HOT.x + HOT.y - 64) * B - 210, w: 130 * A + 30, h: 280 }; }
  function hotelBody(c) {
    var x = HOT.x, y = HOT.y;
    var pts = rrPts(x - 40, y - 22, 80, 44, 22, 8);
    winPrism(c, pts, 0, 180, 5, 71, ['#3a2410', '#8a5a20'], ['#ffd27a', '#ffe9b8', '#ffc050']);
    topPath(c, pts, 180); c.fillStyle = '#6a4418'; c.fill();
    prism(c, rrPts(x - 34, y - 18, 68, 36, 18, 8), 180, 6, '#b8861a', '#ffd24a', '#ffe28a');
    var sg = E(x, y + 2, 200);
    c.fillStyle = 'rgba(20,8,10,0.9)'; rrect(c, sg[0] - 26, sg[1] - 8, 52, 16, 4); c.fill();
    neonText(c, 'HOTEL Q', sg[0], sg[1] + 0.5, 10, '#ffb84a', '#fff4d8', 8);
    box(c, x - 30, y + 16, 60, 10, 0, 16, '#ffd24a', { left: '#8a6414', right: '#c8921e' });
  }
  function pyrBB() { return { x: (PYR.x - 50 - PYR.y - 50) * A - 10, y: -800, w: 100 * A * 2 + 20, h: 800 + (PYR.x + PYR.y + 60) * B }; }
  function pyrBody(c) {
    var x = PYR.x, y = PYR.y, h = 78, r = 48;
    var ap = E(x, y, h), p1 = E(x - r, y + r, 0), p2 = E(x + r, y + r, 0), p3 = E(x + r, y - r, 0);
    c.fillStyle = '#10101e'; c.beginPath(); mv(c, ap); ln(c, p1); ln(c, p2); c.closePath(); c.fill();
    c.fillStyle = '#1c1c34'; c.beginPath(); mv(c, ap); ln(c, p2); ln(c, p3); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,210,120,0.55)'; c.lineWidth = 0.6;
    for (var i = 1; i < 9; i++) {
      var f = i / 9, a = E(x - r * (1 - f), y + r * (1 - f), h * f), b = E(x + r * (1 - f), y + r * (1 - f), h * f), cc = E(x + r * (1 - f), y - r * (1 - f), h * f);
      c.beginPath(); mv(c, a); ln(c, b); ln(c, cc); c.stroke();
    }
    c.strokeStyle = 'rgba(255,230,160,0.9)'; c.lineWidth = 0.8; c.beginPath(); mv(c, p2); ln(c, ap); c.stroke();
  }
  function pyrLive(c, t) {
    var ap = E(PYR.x, PYR.y, 78);
    c.save(); c.globalCompositeOperation = 'lighter';
    var w = 5 + Math.sin(t * 2) * 0.8;
    c.fillStyle = 'rgba(200,225,255,0.2)'; c.fillRect(ap[0] - w * 2, ap[1] - 800, w * 4, 800);
    c.fillStyle = 'rgba(230,240,255,0.35)'; c.fillRect(ap[0] - w, ap[1] - 800, w * 2, 800);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(ap[0] - w * 0.3, ap[1] - 800, w * 0.6, 800);
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(ap[0], ap[1], 3, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  var FW0 = { x: 40, y: -24, R: 56, hub: 72 };
  function wheelBB() {
    var o = E(FW0.x, FW0.y, 0);
    return { x: o[0] - FW0.R - 16, y: o[1] - FW0.hub - FW0.R - 16, w: FW0.R * 2 + 32, h: FW0.hub + FW0.R + 30 };
  }
  var WX = 0.877;
  function wheelBody(c) {
    var o = E(FW0.x, FW0.y, 0), hc = [o[0], o[1] - FW0.hub], R = FW0.R, i;
    c.fillStyle = '#2a2244'; rrect(c, o[0] - 26, o[1] - 6, 52, 10, 3); c.fill();
    c.strokeStyle = '#ff5ac8'; c.lineWidth = 0.8; rrect(c, o[0] - 26, o[1] - 6, 52, 10, 3); c.stroke();
    [[-1, '#8a86a8', 3.2], [1, '#d8dcef', 3.6]].forEach(function (lg) {
      var dy = lg[0] * 2.5;
      c.strokeStyle = lg[1]; c.lineWidth = lg[2];
      c.beginPath(); c.moveTo(o[0] - R * WX * 0.5, o[1] - 2 + dy); c.lineTo(hc[0], hc[1] + dy); c.lineTo(o[0] + R * WX * 0.5, o[1] - 2 + dy); c.stroke();
      c.lineWidth = 1; c.beginPath(); c.moveTo(o[0] - R * WX * 0.28, o[1] - FW0.hub * 0.42 + dy); c.lineTo(o[0] + R * WX * 0.28, o[1] - FW0.hub * 0.42 + dy); c.stroke();
    });
    c.fillStyle = '#3a2a70'; rrect(c, o[0] - 12, o[1] - 14, 24, 10, 3); c.fill();
    c.fillStyle = '#ffd86b'; for (i = 0; i < 4; i++) c.fillRect(o[0] - 9 + i * 5, o[1] - 11, 3, 3);
    neonText(c, 'Q-WHEEL', o[0], o[1] - 0.6, 6, '#50dcff', '#e8fbff', 5);
    return hc;
  }
  function wheelLive(c, t) {
    var o = E(FW0.x, FW0.y, 0), cx = o[0], cy = o[1] - FW0.hub, R = FW0.R, rot = t * 0.12, i, n = 16;
    c.strokeStyle = '#1c1636'; c.lineWidth = 4.6; c.beginPath(); c.ellipse(cx, cy, R * WX, R, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#e8e4f8'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cx, cy, R * WX, R, 0, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.9; c.beginPath(); c.ellipse(cx, cy, R * WX * 0.86, R * 0.86, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(232,228,248,0.55)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 0; i < n; i++) { var a = rot + i / n * Math.PI * 2; c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * WX, cy + Math.sin(a) * R); }
    c.stroke();
    var nL = 48, band = Math.floor(t * 2) % 3;
    for (var pass = 0; pass < 4; pass++) {
      c.fillStyle = ['#ff5ac8', '#ffd24a', '#50dcff', '#8cf08c'][pass]; c.beginPath();
      for (i = 0; i < nL; i++) {
        var k = band === 0 ? Math.floor(i / 3 + t * 6) : band === 1 ? Math.floor(t * 3) + (i % 2) : Math.floor(i / 12 + t * 2);
        if (((k % 4) + 4) % 4 !== pass) continue;
        var b = -rot * 0.5 + i / nL * Math.PI * 2, px = cx + Math.cos(b) * R * WX, py = cy + Math.sin(b) * R;
        c.moveTo(px + 1.5, py); c.arc(px, py, 1.5, 0, Math.PI * 2);
      }
      c.fill();
    }
    var gc = ['#ff5ac8', '#50dcff', '#ffd24a', '#8cf08c'], j;
    for (j = 0; j < 5; j++) {
      c.fillStyle = j < 4 ? gc[j] : 'rgba(255,255,255,0.75)'; c.beginPath();
      for (i = j < 4 ? j : 0; i < n; i += j < 4 ? 4 : 1) {
        var a2 = rot + (i + 0.5) / n * Math.PI * 2, gx = cx + Math.cos(a2) * R * WX, gy = cy + Math.sin(a2) * R;
        if (j < 4) { c.moveTo(gx + 3.2, gy + 4.2); c.ellipse(gx, gy + 4.2, 3.2, 4.2, 0, 0, Math.PI * 2); }
        else { c.moveTo(gx + 0.2, gy + 3.2); c.ellipse(gx - 0.9, gy + 3.2, 1.1, 2, 0, 0, Math.PI * 2); }
      }
      c.fill();
    }
    c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(cx, cy, 4.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ff5ac8'; c.beginPath(); c.arc(cx, cy, 2, 0, Math.PI * 2); c.fill();
    if (Math.sin(t * 3.5) > 0) { c.fillStyle = '#ff3a3a'; c.beginPath(); c.arc(cx, cy - R - 3, 1.6, 0, Math.PI * 2); c.fill(); }
  }
  var CO = null;
  function coaster() {
    if (CO) return CO;
    var P = [], i, f;
    function add(x, y, h, lift) { P.push({ x: x, y: y, h: h, lift: !!lift }); }
    function cosi(a, b, k) { return a + (b - a) * (0.5 - 0.5 * Math.cos(Math.PI * k)); }
    for (i = 0; i < 26; i++) add(80, 400 - i * 6, 30);
    for (i = 0; i <= 40; i++) { f = i / 40 * Math.PI * 2; add(80 - 18 * i / 40, 250 - 40 * Math.sin(f), 30 + 40 * (1 - Math.cos(f))); }
    for (i = 1; i <= 40; i++) { f = i / 40; add(62, 250 - 180 * f, cosi(30, 132, f), true); }
    for (i = 1; i <= 24; i++) { f = -i / 24 * Math.PI; add(12 + 50 * Math.cos(f), 70 + 50 * Math.sin(f), 132 + 6 * Math.sin(-f)); }
    var keys = [[70, 132], [170, 12], [240, 72], [300, 16], [350, 44], [400, 20]];
    for (var k = 0; k < keys.length - 1; k++)
      for (i = 1; i <= 16; i++) { f = i / 16; add(-38, keys[k][0] + (keys[k + 1][0] - keys[k][0]) * f, cosi(keys[k][1], keys[k + 1][1], f)); }
    for (i = 1; i <= 24; i++) { f = Math.PI - i / 24 * Math.PI; add(21 + 59 * Math.cos(f), 400 + 59 * Math.sin(f), 20 + 10 * (i / 24)); }
    var len = 0, sx = [], sy = [], ss = [];
    for (i = 0; i < P.length; i++) {
      var q = P[i], e = E(q.x, q.y, q.h);
      if (i) { var o = P[i - 1]; len += Math.sqrt((q.x - o.x) * (q.x - o.x) + (q.y - o.y) * (q.y - o.y) + (q.h - o.h) * (q.h - o.h)); }
      sx.push(e[0]); sy.push(e[1]); ss.push(len);
    }
    var o2 = P[P.length - 1], q0 = P[0];
    len += Math.sqrt((q0.x - o2.x) * (q0.x - o2.x) + (q0.y - o2.y) * (q0.y - o2.y) + (q0.h - o2.h) * (q0.h - o2.h));
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (i = 0; i < sx.length; i++) { minx = Math.min(minx, sx[i]); maxx = Math.max(maxx, sx[i]); miny = Math.min(miny, sy[i]); maxy = Math.max(maxy, sy[i] + P[i].h); }
    CO = { P: P, sx: sx, sy: sy, ss: ss, len: len, s: 0, loop0: 26, loop1: 66, bb: { x: minx - 10, y: miny - 16, w: maxx - minx + 20, h: maxy - miny + 26 } };
    return CO;
  }
  function coasterAt(co, s) {
    s = ((s % co.len) + co.len) % co.len;
    var lo = 0, hi = co.ss.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (co.ss[mid] <= s) lo = mid; else hi = mid - 1; }
    var i1 = (lo + 1) % co.ss.length, seg = (i1 ? co.ss[i1] : co.len) - co.ss[lo], f = seg > 0 ? (s - co.ss[lo]) / seg : 0;
    return { i: lo, x: co.sx[lo] + (co.sx[i1] - co.sx[lo]) * f, y: co.sy[lo] + (co.sy[i1] - co.sy[lo]) * f, h: co.P[lo].h, lift: co.P[lo].lift };
  }
  function coasterDraw(c, t, dt) {
    var co = coaster(), P = co.P, i, n = P.length;
    var cur = coasterAt(co, co.s), v = cur.lift ? 30 : 36 + 8 * Math.sqrt(Math.max(0, 140 - cur.h));
    co.s = (co.s + v * Math.min(dt, 0.1)) % co.len;
    if (!co.rail && typeof Path2D !== 'undefined') {
      co.posts = new Path2D(); co.rail = new Path2D();
      for (i = 0; i < n; i += 5) { if (P[i].h < 8) continue; co.posts.moveTo(co.sx[i], co.sy[i] + 1); co.posts.lineTo(co.sx[i], co.sy[i] + P[i].h); }
      co.rail.moveTo(co.sx[0], co.sy[0]);
      for (i = 1; i < n; i++) co.rail.lineTo(co.sx[i], co.sy[i]);
      co.rail.closePath();
    }
    if (co.rail) {
      c.strokeStyle = 'rgba(200,190,240,0.55)'; c.lineWidth = 1; c.stroke(co.posts);
      c.strokeStyle = '#2a1850'; c.lineWidth = 4.8; c.stroke(co.rail);
      c.strokeStyle = '#ff4fa3'; c.lineWidth = 2.4; c.stroke(co.rail);
      c.strokeStyle = 'rgba(255,220,240,0.7)'; c.lineWidth = 0.7; c.stroke(co.rail);
    }
    var k = Math.floor(t * 12), onP = [];
    for (i = 0; i < n; i += 3) if (((i / 3) + k) % 4 === 0) onP.push(co.sx[i], co.sy[i]);
    c.fillStyle = '#fff4c0'; c.beginPath();
    for (i = 0; i < onP.length; i += 2) c.rect(onP[i] - 1, onP[i + 1] - 1, 2, 2);
    c.fill();
    var cols = ['#ffd24a', '#50dcff', '#ff5ac8'];
    for (var j = 0; j < 3; j++) {
      var a = coasterAt(co, co.s - j * 9), b = coasterAt(co, co.s - j * 9 + 4);
      var tx = b.x - a.x, ty = b.y - a.y, tl = Math.sqrt(tx * tx + ty * ty) || 1; tx /= tl; ty /= tl;
      var ux = 0, uy = -1;
      if (a.i >= co.loop0 && a.i < co.loop1) {
        var ph = (a.i - co.loop0) / (co.loop1 - co.loop0) * Math.PI * 2;
        ux = -A * Math.sin(ph); uy = B * Math.sin(ph) - Math.cos(ph); var ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
      }
      var cx = a.x + ux * 2.4, cy = a.y + uy * 2.4;
      c.fillStyle = cols[j]; c.beginPath();
      c.moveTo(cx - tx * 4.8 - ux * 2, cy - ty * 4.8 - uy * 2); c.lineTo(cx + tx * 4.8 - ux * 2, cy + ty * 4.8 - uy * 2);
      c.lineTo(cx + tx * 4.8 + ux * 2.4, cy + ty * 4.8 + uy * 2.4); c.lineTo(cx - tx * 4.8 + ux * 2.4, cy - ty * 4.8 + uy * 2.4); c.closePath(); c.fill();
      c.fillStyle = '#ffd9b8'; c.strokeStyle = '#ffd9b8'; c.lineWidth = 0.7;
      for (var r = -1; r <= 1; r += 2) {
        var hx = cx + tx * r * 1.8 + ux * 3.8, hy = cy + ty * r * 1.8 + uy * 3.8;
        c.beginPath(); c.arc(hx, hy, 1.3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + ux * 3 + tx * 1.2, hy + uy * 3 + ty * 1.2); c.moveTo(hx, hy); c.lineTo(hx + ux * 3 - tx * 1.2, hy + uy * 3 - ty * 1.2); c.stroke();
      }
    }
    var sg = E(96, 330, 58);
    c.fillStyle = 'rgba(20,8,30,0.9)'; rrect(c, sg[0] - 18, sg[1] - 5, 36, 10, 3); c.fill();
    tDraw(c, 'Q-COASTER', sg[0], sg[1] + 0.4, 6, '#ff8ad8', 900);
  }
  var BEAM = { c: null, s: 0 };
  function beamImg() {
    var m = ctx.getTransform(), s = m.a;
    if (BEAM.s !== s) {
      var W0 = 44, L0 = 420, cv = BEAM.c || document.createElement('canvas');
      cv.width = Math.ceil(W0 * s); cv.height = Math.ceil(L0 * s);
      var c = cv.getContext('2d'); c.setTransform(s, 0, 0, s, 0, 0);
      var gr = c.createLinearGradient(0, L0, 0, 0);
      gr.addColorStop(0, 'rgba(210,225,255,0.34)'); gr.addColorStop(0.5, 'rgba(190,210,255,0.12)'); gr.addColorStop(1, 'rgba(190,210,255,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(W0 / 2 - 2, L0); c.lineTo(W0 / 2 + 2, L0); c.lineTo(W0, 0); c.lineTo(0, 0); c.closePath(); c.fill();
      BEAM.c = cv; BEAM.s = s;
    }
    return BEAM.c;
  }
  var LIGHTS = [[160, -34, 0.0], [330, -26, 1.7], [470, -46, 3.1], [-50, 120, 4.4], [-60, 330, 5.3]];
  function searchlights(c, t) {
    var img = beamImg();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < LIGHTS.length; i++) {
      var L0 = LIGHTS[i], b = E(L0[0], L0[1], 0), a = Math.sin(t * 0.35 + L0[2]) * 0.55 + (i % 2 ? 0.12 : -0.12);
      c.save(); c.translate(b[0], b[1]); c.rotate(a); c.drawImage(img, -22, -420, 44, 420); c.restore();
    }
    c.restore();
  }
  var FW = [], fwNext = 0, FW_COLS = ['#ff5ac8', '#ffd24a', '#50dcff', '#8cf08c', '#ff7a3d', '#b89cff', '#ffffff'];
  function fwSpawn(t) {
    var z = H.z, cam = H.cam, top = H.hudBottom ? H.hudBottom() : 150;
    for (var tries = 0; tries < 4; tries++) {
      var sx = 20 + Math.random() * (H.cssW - 40), wx = (sx - H.cssW / 2) / z + cam.x;
      var ymin = (top + 24 - H.cssH / 2) / z + cam.y;
      var ymax = Math.min(wallTopAt(wx) - 26, (H.cssH * 0.72 - H.cssH / 2) / z + cam.y);
      if (ymax - ymin < 20) continue;
      var c1 = FW_COLS[Math.floor(Math.random() * FW_COLS.length)], c2 = FW_COLS[Math.floor(Math.random() * FW_COLS.length)];
      FW.push({ x: wx, y: ymin + Math.random() * (ymax - ymin), t0: t, c1: c1, c2: c2, n: 30 + Math.floor(Math.random() * 12),
                R: 28 + Math.random() * 20, rise: 0.5 + Math.random() * 0.3, seed: Math.random() * 100,
                heart: Math.random() < 0.25 });
      return true;
    }
    return false;
  }
  function fireworks(c, t) {
    if (t > fwNext || t < fwNext - 10) { fwSpawn(t); fwNext = t + 0.45 + Math.random() * 0.8; if (FW.length > 6) FW.shift(); }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = FW.length - 1; i >= 0; i--) {
      var f = FW[i], tau = t - f.t0;
      if (tau < 0 || tau > f.rise + 1.8) { FW.splice(i, 1); continue; }
      if (tau < f.rise) {
        var k = tau / f.rise, yy = f.y + 70 * (1 - k) * (1 - k);
        c.fillStyle = 'rgba(255,230,180,0.9)'; c.fillRect(f.x - 0.8, yy - 0.8, 1.6, 1.6);
        c.fillStyle = 'rgba(255,200,120,0.35)'; c.fillRect(f.x - 0.5, yy, 1, 10);
        continue;
      }
      var tb = tau - f.rise, r = f.R * (1 - Math.exp(-4 * tb)), al = Math.max(0, 1 - tb / 1.8), drop = 9 * tb * tb;
      if (tb < 0.15) { c.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - tb / 0.15)).toFixed(3) + ')'; c.beginPath(); c.arc(f.x, f.y, f.R * 0.7, 0, Math.PI * 2); c.fill(); }
      for (var pass = 0; pass < 2; pass++) {
        c.strokeStyle = pass ? f.c2 : f.c1; c.fillStyle = c.strokeStyle; c.globalAlpha = al; c.lineWidth = 1.4;
        c.beginPath();
        for (var j = pass; j < f.n; j += 2) {
          var a = j / f.n * Math.PI * 2 + rnd(f.seed + j) * 0.2, cs = Math.cos(a), sn = Math.sin(a);
          if (f.heart) { var hx = Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16; cs = hx; sn = hy; }
          var px = f.x + cs * r, py = f.y + sn * r * 0.9 + drop;
          c.moveTo(f.x + cs * r * 0.72, f.y + sn * r * 0.65 + drop * 0.6); c.lineTo(px, py);
        }
        c.stroke();
        c.beginPath();
        for (j = pass; j < f.n; j += 2) {
          if (tb > 1 && Math.sin(t * 40 + j * 3) < 0) continue;
          var a2 = j / f.n * Math.PI * 2 + rnd(f.seed + j) * 0.2, cx2 = Math.cos(a2), cy2 = Math.sin(a2);
          if (f.heart) { cx2 = Math.pow(Math.sin(a2), 3); cy2 = -(13 * Math.cos(a2) - 5 * Math.cos(2 * a2) - 2 * Math.cos(3 * a2) - Math.cos(4 * a2)) / 16; }
          c.rect(f.x + cx2 * r - 1.4, f.y + cy2 * r * 0.9 + drop - 1.4, 2.8, 2.8);
        }
        c.fill();
      }
      c.globalAlpha = 1;
    }
    c.restore();
  }
  var lastT = null;
  on('backdrop', 'hq', function (r, S, h) {
    begin(h);
    var t = S.t, dt = lastT == null ? 0 : Math.max(0, Math.min(0.1, t - lastT)); lastT = t;
    var open = H.G.roomOpen('hq');
    var all = { x: -360, y: -560, w: 800, h: 780 };
    if (!visible(all)) return;
    if (open) { searchlights(ctx, t); fireworks(ctx, t); }
    ctx.save();
    if (!open) { var dusk = Math.max(0, Math.min(1, (H.skyAlt - 4.5) / 1.5)); if (dusk <= 0) { ctx.restore(); return; } ctx.globalAlpha = 0.55 * dusk; }
    var wb = wheelBB(); if (visible(wb)) { sprite('bg:wheel', 1, wb, wheelBody); wheelLive(ctx, open ? t : 0); }
    var tb = towerBB(); if (visible(tb)) { sprite('bg:tower', 1, tb, towerBody); if (open) towerLive(ctx, t); }
    var hb = hotelBB(); if (visible(hb)) sprite('bg:hotel', 1, hb, hotelBody);
    var pb = pyrBB(); if (visible(pb)) { if (open) pyrLive(ctx, t); sprite('bg:pyr', 1, { x: pb.x, y: (PYR.x + PYR.y) * B - 100, w: pb.w, h: 140 }, pyrBody); }
    if (open) { var co = coaster(); if (visible(co.bb)) coasterDraw(ctx, t, dt); }
    ctx.restore();
  });
  on('floor', 'hq', function (r, S, h) {
    begin(h);
    var x0 = r.ix * T, x1 = (r.ix + r.iw) * T, lines = [];
    (r.roads || []).forEach(function (rd) {
      var yy = (rd.y + rd.h / 2) * T;
      if (visible({ x: (x0 - yy) * A, y: (x0 + yy) * B - 10, w: (x1 - x0) * A * 2, h: (x1 - x0) * B + 20 })) lines.push([[x0 + 4, yy, 4.4], [x1 - 4, yy, 4.4]]);
    });
    if (lines.length) bulbs(ctx, lines, 7, S.t, '#ffe28a', 'rgba(120,90,40,0.55)', 1.3, 7);
  });
  function spriteAt(key, ver, bb, draw, ox, oy) {
    var m = ctx.getTransform(), s = m.a, e = SPR[key];
    if (!e || e.s !== s || e.ver !== ver) {
      var cv = (e && e.c) || document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(bb.w * s) + 2); cv.height = Math.max(1, Math.ceil(bb.h * s) + 2);
      var oc = cv.getContext('2d');
      oc.setTransform(s, 0, 0, s, 1 - bb.x * s, 1 - bb.y * s); oc.lineJoin = 'round'; oc.lineCap = 'round';
      draw(oc);
      e = SPR[key] = { c: cv, s: s, ver: ver };
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(e.c, Math.round(m.a * (bb.x + ox) + m.e - 1), Math.round(m.d * (bb.y + oy) + m.f - 1));
    ctx.restore();
  }
  var PALM_BB = { x: -26, y: -64, w: 52, h: 72 };
  function palmBody(c, glow) {
    c.fillStyle = rgba(glow, 0.35); c.beginPath(); c.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2); c.fill();
    box(c, -4, -4, 8, 8, 0, 4, '#e8d8f0', { left: '#8a7aa0', right: '#b8a8d0' });
    var pts = [];
    for (var i = 0; i <= 8; i++) { var f = i / 8; pts.push([Math.sin(f * 1.6) * 5, -4 - f * 44]); }
    c.strokeStyle = '#6a4424'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.stroke();
    c.strokeStyle = '#9a6a3a'; c.lineWidth = 1.2; c.beginPath();
    for (i = 1; i < pts.length; i++) { c.moveTo(pts[i][0] - 1.6, pts[i][1] + 1); c.lineTo(pts[i][0] + 1.6, pts[i][1] - 0.5); }
    c.stroke();
    var lc = ['#ff5ac8', '#ffd24a', '#50dcff', '#8cf08c'];
    for (i = 0; i < 14; i++) {
      var k = i / 14, px = Math.sin(k * 1.6) * 5 + Math.sin(k * 22) * 2, py = -6 - k * 40;
      c.fillStyle = lc[i % 4]; c.beginPath(); c.arc(px, py, 0.9, 0, Math.PI * 2); c.fill();
    }
    var top = pts[pts.length - 1], tx = top[0], ty = top[1];
    for (i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + (i - 3.5) * 0.52 + (i % 2) * 0.1, L = 17 + (i % 3) * 3;
      var ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.55 + 8;
      var mx = tx + Math.cos(a) * L * 0.55, my = ty + Math.sin(a) * L * 0.4 - 5;
      c.fillStyle = i % 2 ? '#1f9c56' : '#2fc46e';
      c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx - 2, my - 3, ex, ey); c.quadraticCurveTo(mx + 2, my + 3, tx, ty + 1.5); c.fill();
    }
    c.fillStyle = '#6a4424';
    [[-1.6, 1.5], [1.8, 1.8], [0, 3.2]].forEach(function (o) { c.beginPath(); c.arc(tx + o[0], ty + o[1], 1.5, 0, Math.PI * 2); c.fill(); });
  }
  var SIGN_BB = { x: -36, y: -90, w: 72, h: 96 };
  function signBody(c) {
    c.fillStyle = 'rgba(255,90,200,0.28)'; c.beginPath(); c.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2); c.fill();
    box(c, -9, -3, 3, 3, 0, 36, '#f4f0f8', { left: '#9a94b0', right: '#c8c2da' });
    box(c, 6, -3, 3, 3, 0, 36, '#f4f0f8', { left: '#9a94b0', right: '#c8c2da' });
    var cy = -52;
    c.beginPath(); c.moveTo(0, cy - 23); c.lineTo(31, cy); c.lineTo(0, cy + 23); c.lineTo(-31, cy); c.closePath();
    c.fillStyle = '#fff8e8'; c.fill();
    c.lineWidth = 2.2; c.strokeStyle = '#e2204a'; c.stroke();
    c.font = '800 3.7px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#e2204a'; c.fillText('WELCOME TO', 0, cy - 10);
    popText(c, 'QTYC', 0, cy + 0.5, 11.5, '#ffd24a', '#b01838', 2.4);
    c.fillStyle = '#2b7fe0'; c.font = '800 3.5px ' + FONT; c.fillText('QUANTUM CITY', 0, cy + 10.5);
    c.strokeStyle = '#f4f0f8'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, cy - 23); c.lineTo(0, cy - 28); c.stroke();
    starPath(c, 0, cy - 31, 5.5, 2.4, 8); c.fillStyle = '#ffd24a'; c.fill(); c.strokeStyle = '#e2204a'; c.lineWidth = 0.8; c.stroke();
  }
  function starPath(c, x, y, r1, r2, n) {
    c.beginPath();
    for (var i = 0; i < n * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; if (i) c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    c.closePath();
  }
  function signLive(c, o, t) {
    var cy = o[1] - 52, cx = o[0], n = 32, k = Math.floor(t * 10), onP = [], offP = [];
    for (var i = 0; i < n; i++) {
      var f = i / n * 4, seg = Math.floor(f), u = f - seg;
      var P0 = [[0, -23], [31, 0], [0, 23], [-31, 0]][seg], P1 = [[31, 0], [0, 23], [-31, 0], [0, -23]][seg];
      ((i + k) % 3 === 0 ? onP : offP).push(cx + (P0[0] + (P1[0] - P0[0]) * u) * 1.12, cy + (P0[1] + (P1[1] - P0[1]) * u) * 1.12);
    }
    c.fillStyle = 'rgba(150,60,40,0.9)'; c.beginPath(); for (i = 0; i < offP.length; i += 2) c.rect(offP[i] - 0.8, offP[i + 1] - 0.8, 1.6, 1.6); c.fill();
    c.fillStyle = '#fff4c0'; c.beginPath(); for (i = 0; i < onP.length; i += 2) { c.moveTo(onP[i] + 1.4, onP[i + 1]); c.arc(onP[i], onP[i + 1], 1.4, 0, Math.PI * 2); } c.fill();
    if (Math.sin(t * 5) > 0.3) { c.fillStyle = 'rgba(255,240,150,0.45)'; c.beginPath(); c.arc(cx, cy - 31, 8, 0, Math.PI * 2); c.fill(); }
  }
  var FOUNT = { x: 28.5 * T, y: 21.5 * T, w: 5 * T, d: 5 * T };
  function fountBody(c) {
    var f = FOUNT, pts = rrPts(f.x, f.y, f.w, f.d, 36, 8);
    c.fillStyle = 'rgba(80,200,255,0.18)'; topPath(c, rrPts(f.x - 2, f.y - 2, f.w + 4, f.d + 4, 38, 8), 0.2); c.fill();
    prism(c, pts, 0, 5, '#8a86a8', '#e8e4f8', '#f4f2ff');
    var wp = rrPts(f.x + 4, f.y + 4, f.w - 8, f.d - 8, 32, 8);
    topPath(c, wp, 5.05); c.fillStyle = '#1a5aa8'; c.fill();
    topPath(c, rrPts(f.x + 12, f.y + 12, f.w - 24, f.d - 24, 24, 8), 5.1); c.fillStyle = '#2a7ad0'; c.fill();
    var cc = E(f.x + f.w / 2, f.y + f.d / 2, 5);
    box(c, f.x + f.w / 2 - 5, f.y + f.d / 2 - 5, 10, 10, 5, 4, '#f4f2ff', { left: '#8a86a8', right: '#c8c4e0' });
    return cc;
  }
  function fountLive(c, t) {
    var f = FOUNT, cx = f.x + f.w / 2, cy = f.y + f.d / 2, i, pat = Math.floor(t / 4) % 3;
    var hue = (t * 50) % 360;
    c.save(); c.globalCompositeOperation = 'lighter';
    var w0 = E(cx, cy, 5.2);
    c.fillStyle = hsl(hue, 90, 55).replace('hsl', 'hsla').replace('%)', '%,0.25)');
    c.beginPath(); c.ellipse(w0[0], w0[1], 30, 15, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(200,240,255,0.85)'; c.lineWidth = 1.3; c.beginPath();
    var tips = [];
    for (i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2, rr = 26, jx = cx + Math.cos(a) * rr, jy = cy + Math.sin(a) * rr, hgt;
      if (pat === 0) hgt = 10 + 20 * Math.abs(Math.sin(t * 2 + i * 0.63));
      else if (pat === 1) hgt = 8 + 26 * Math.max(0, Math.sin(t * 3 - i * 0.9));
      else hgt = 14 + 12 * (i % 2 ? Math.abs(Math.sin(t * 2.5)) : Math.abs(Math.cos(t * 2.5)));
      var b0 = E(jx, jy, 5), b1 = E(jx + (cx - jx) * 0.25, jy + (cy - jy) * 0.25, 5 + hgt);
      c.moveTo(b0[0], b0[1]); c.quadraticCurveTo(b0[0], b1[1], b1[0], b1[1]);
      tips.push(b1[0], b1[1]);
    }
    var ch = 28 + 8 * Math.sin(t * 1.7), m0 = E(cx, cy, 9), m1 = E(cx, cy, 9 + ch);
    c.moveTo(m0[0], m0[1]); c.lineTo(m1[0], m1[1]);
    c.stroke();
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(220,250,255,0.35)'; c.beginPath(); c.moveTo(m0[0], m0[1]); c.lineTo(m1[0], m1[1]); c.stroke();
    c.fillStyle = 'rgba(230,250,255,0.8)'; c.beginPath();
    for (i = 0; i < tips.length; i += 2) { var sp = (t * 3 + i) % 1; c.rect(tips[i] - 1 + Math.sin(i + t * 5) * 1.5, tips[i + 1] + sp * 4 - 1, 1.6, 1.6); }
    for (i = 0; i < 6; i++) { var a2 = t * 2 + i * 1.05, r2 = 3 + ((t * 2 + i * 0.3) % 1) * 7; c.rect(m1[0] + Math.cos(a2) * r2 - 0.8, m1[1] + Math.abs(Math.sin(a2)) * r2 * 0.8 + ((t * 2 + i * 0.3) % 1) * 8 - 0.8, 1.6, 1.6); }
    c.fill();
    c.restore();
  }
  var PALMS = [[9.3, 19.8, '#ff5ac8'], [9.3, 26.8, '#50dcff'], [16.4, 27.3, '#ffd24a'], [34.4, 20.6, '#8cf08c'], [9, 7.2, '#ffd24a'], [9, 13.2, '#ff5ac8']];
  var SIGN_AT = [12.6, 23.4];
  on('scene', 'hq', function (r, S, h, push) {
    begin(h);
    PALMS.forEach(function (pp, i) {
      var wx = pp[0] * T, wy = pp[1] * T, o = E(wx, wy, 0);
      if (!visible({ x: o[0] + PALM_BB.x, y: o[1] + PALM_BB.y, w: PALM_BB.w, h: PALM_BB.h })) return;
      push({ x: wx - 4, y: wy - 4, w: 8, h: 8, draw: function () { spriteAt('palm' + (i % 4), 1, PALM_BB, function (c) { palmBody(c, pp[2]); }, o[0], o[1]); } });
    });
    var so = E(SIGN_AT[0] * T, SIGN_AT[1] * T, 0);
    if (visible({ x: so[0] + SIGN_BB.x, y: so[1] + SIGN_BB.y, w: SIGN_BB.w, h: SIGN_BB.h }))
      push({ x: SIGN_AT[0] * T - 12, y: SIGN_AT[1] * T - 4, w: 24, h: 8, draw: function () {
        spriteAt('wsign', 1, SIGN_BB, signBody, so[0], so[1]); signLive(ctx, so, S.t);
      } });
    var f = FOUNT, fbb = plotBB({ x: f.x, y: f.y, w: f.w, d: f.d }, 50, 6);
    if (visible(fbb))
      push({ x: f.x, y: f.y, w: f.w, h: f.d, draw: function () {
        sprite('fount', 1, plotBB({ x: f.x, y: f.y, w: f.w, d: f.d }, 12, 4), fountBody); fountLive(ctx, S.t);
      } });
  });
  function unowned(id, p, S) {
    var g = geo(p), col = p.color || (p.domain ? H.W.DOMAINS[p.domain].color : '#6f57e0');
    var vols = memo('vol:' + id + 1, function () { return DEF[id].vol(1); });
    var bb = plotBB(g, 70, 6);
    if (!visible(bb)) return true;
    var t = S.t, c = ctx, i;
    c.save();
    c.fillStyle = rgba(col, 0.12); face(c, g.x + 2, g.y + 2, g.w - 4, g.d - 4, 0.5); c.fill();
    c.setLineDash([5, 4]); c.lineDashOffset = -(t * 10) % 9;
    c.strokeStyle = col; c.lineWidth = 1.4; face(c, g.x + 2, g.y + 2, g.w - 4, g.d - 4, 0.5); c.stroke();
    c.setLineDash([]);
    var k = 0.5 + 0.5 * Math.sin(t * 2 + p.x), scan = (t * 0.5 + p.x * 0.1) % 1;
    for (i = 0; i < vols.length; i++) {
      var v = vols[i];
      if (v.length === 4) {
        var e = E(g.x + v[0], g.y + v[1], v[2]);
        c.globalAlpha = 0.14 + 0.06 * k; c.fillStyle = col; c.beginPath(); c.arc(e[0], e[1], v[3], 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.8; c.strokeStyle = col; c.lineWidth = 0.9; c.beginPath(); c.arc(e[0], e[1], v[3], 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.ellipse(e[0], e[1], v[3], v[3] * 0.3, 0, 0, Math.PI * 2); c.stroke();
        var yy = e[1] + v[3] - scan * v[3] * 2, hw = Math.sqrt(Math.max(0, v[3] * v[3] - (yy - e[1]) * (yy - e[1])));
        c.strokeStyle = '#ffffff'; c.globalAlpha = 0.6; c.beginPath(); c.moveTo(e[0] - hw, yy); c.lineTo(e[0] + hw, yy); c.stroke();
        continue;
      }
      var x = g.x + v[0], y = g.y + v[1], w = v[2] - v[0], d = v[3] - v[1], hh = Math.max(6, Math.min(44, v[4]));
      c.globalAlpha = 0.14 + 0.06 * k;
      box(c, x, y, w, d, 0.5, hh, col);
      c.globalAlpha = 0.75;
      c.strokeStyle = col; c.lineWidth = 0.8; c.beginPath();
      [[x, y + d], [x + w, y + d], [x + w, y]].forEach(function (q) { mv(c, E(q[0], q[1], 0.5)); ln(c, E(q[0], q[1], hh + 0.5)); });
      mv(c, E(x, y + d, hh + 0.5)); ln(c, E(x + w, y + d, hh + 0.5)); ln(c, E(x + w, y, hh + 0.5)); ln(c, E(x, y, hh + 0.5)); ln(c, E(x, y + d, hh + 0.5));
      c.stroke();
      var sc = scan * hh;
      c.strokeStyle = '#ffffff'; c.globalAlpha = 0.6; c.lineWidth = 1; c.beginPath();
      mv(c, E(x, y + d, sc)); ln(c, E(x + w, y + d, sc)); ln(c, E(x + w, y, sc)); c.stroke();
    }
    c.globalAlpha = 1;
    var ic = E(g.x + g.w / 2, g.y + g.d / 2, 46);
    H.icon2d(ic[0], ic[1] + Math.sin(t * 2 + p.y) * 1.5, p.kind === 'software' ? 'software' : (p.kind === 'lounge' || p.kind === 'arcade' || p.kind === 'sphere') ? 'media' : p.kind, col, S);
    c.restore();
    return true;
  }
  ['pharma', 'fin', 'cae', 'opt', 'crypto', 'sns', 'tube', 'press', 'seminar', 'lounge', 'arcade', 'sphere'].forEach(function (id) {
    on('unowned', id, function (p, S, h) { begin(h); return unowned(id, p, S); });
  });
})(window.QT || (window.QT = {}));
