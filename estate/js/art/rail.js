(function (QT) {
  'use strict';
  var on = QT.Art.scope('rail');
  var W = QT.World, I = QT.Iso, A = I.A, B = I.B, T = W.TILE;
  function X(x, y) { return (x - y) * A; }
  function Y(x, y, h) { return (x + y) * B - (h || 0); }
  function sprite() { return QT.Art.tokyo.sprite.apply(null, arguments); }
  function KEEP() { return QT.Art.tokyo.keep; }
  var LINE = '#2fbf7a';
  var RH = 40, DECK_T = 5, DECK_W = 0.85, TRACK_OFF = 0.38, GAUGE = 0.12;
  var CAR_L = 2.3, CAR_GAP = 0.25, CAR_W = 0.62, CAR_H = 9, NCAR = 3;
  var TRAIN_L = NCAR * CAR_L + (NCAR - 1) * CAR_GAP;
  var LOOP = W.RAIL.loop, LEN = W.RAIL.len, EDGE = [];
  (function () {
    var s = 0;
    for (var i = 0; i < LOOP.length; i++) {
      var a = LOOP[i], b = LOOP[(i + 1) % LOOP.length], len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      EDGE.push({ i: i, s0: s, len: len, ax: a[0], ay: a[1], dx: (b[0] - a[0]) / len, dy: (b[1] - a[1]) / len });
      s += len;
    }
  })();
  function wrap(s) { s %= LEN; return s < 0 ? s + LEN : s; }
  function edgeAt(s) {
    s = wrap(s);
    for (var i = EDGE.length - 1; i >= 0; i--) if (s >= EDGE[i].s0) return EDGE[i];
    return EDGE[0];
  }
  function onEdge(e, s, o) { var k = s - e.s0; return { x: e.ax + e.dx * k - e.dy * o, y: e.ay + e.dy * k + e.dx * o }; }
  function pt(s, off) { var e = edgeAt(s), p = onEdge(e, wrap(s), off || 0); p.dx = e.dx; p.dy = e.dy; return p; }
  function piecesOf(a0, b0, wd) {
    var out = [];
    EDGE.forEach(function (e) {
      var a = Math.max(a0, e.s0), b = Math.min(b0, e.s0 + e.len);
      if (b - a < 0.01) return;
      var p0 = onEdge(e, a, 0), p1 = onEdge(e, b, 0);
      var x0 = Math.min(p0.x, p1.x), x1 = Math.max(p0.x, p1.x), y0 = Math.min(p0.y, p1.y), y1 = Math.max(p0.y, p1.y);
      var c0 = Math.abs(a - e.s0) < 0.01, c1 = Math.abs(b - e.s0 - e.len) < 0.01;
      var ext0 = c0 ? wd : 0, ext1 = c1 ? wd : 0;
      if (e.dx) { x0 -= (e.dx > 0 ? ext0 : ext1); x1 += (e.dx > 0 ? ext1 : ext0); y0 -= wd; y1 += wd; }
      else { y0 -= (e.dy > 0 ? ext0 : ext1); y1 += (e.dy > 0 ? ext1 : ext0); x0 -= wd; x1 += wd; }
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, e: e, a: a, b: b, c0: c0, c1: c1 });
    });
    return out;
  }
  function chunksOf(a0, b0, wd) {
    var out = [];
    for (var a = a0; a < b0 - 0.01; a += 2) out = out.concat(piecesOf(a, Math.min(b0, a + 2), wd));
    return out;
  }
  function band(q, o1, o2) {
    var e = q.e, s0 = q.a, s1 = q.b;
    function at(s, o, shift) { var p = onEdge(e, s + shift, o); return [p.x * T, p.y * T]; }
    return [at(s0, o1, q.c0 ? o1 : 0), at(s1, o1, q.c1 ? -o1 : 0), at(s1, o2, q.c1 ? -o2 : 0), at(s0, o2, q.c0 ? o2 : 0)];
  }
  function prism(g, pts, b, h, top, side, ox, oy) {
    var n = pts.length, cx = 0, cy = 0, i;
    for (i = 0; i < n; i++) { cx += pts[i][0]; cy += pts[i][1]; }
    cx /= n; cy /= n;
    for (i = 0; i < n; i++) {
      var p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy;
      var nx = q[1] - p[1], ny = -(q[0] - p[0]);
      if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
      if (nx + ny <= 0.001) continue;
      g.fillStyle = nx > ny ? side[1] : side[0];
      g.beginPath();
      g.moveTo(X(p[0] - ox, p[1] - oy), Y(p[0] - ox, p[1] - oy, h)); g.lineTo(X(q[0] - ox, q[1] - oy), Y(q[0] - ox, q[1] - oy, h));
      g.lineTo(X(q[0] - ox, q[1] - oy), Y(q[0] - ox, q[1] - oy, b)); g.lineTo(X(p[0] - ox, p[1] - oy), Y(p[0] - ox, p[1] - oy, b));
      g.closePath(); g.fill();
    }
    g.fillStyle = top; g.beginPath();
    for (i = 0; i < n; i++) { var r = pts[i]; if (i) g.lineTo(X(r[0] - ox, r[1] - oy), Y(r[0] - ox, r[1] - oy, h)); else g.moveTo(X(r[0] - ox, r[1] - oy), Y(r[0] - ox, r[1] - oy, h)); }
    g.closePath(); g.fill();
  }
  function bbOf(x, y, w, d, b, h) {
    var l = X(x, y + d), r = X(x + w, y), t = Y(x, y, h), bt = Y(x + w, y + d, b);
    return [l - 2, t - 2, r - l + 4, bt - t + 4];
  }
  function unionBB(a, b) {
    var l = Math.min(a[0], b[0]), t = Math.min(a[1], b[1]), r = Math.max(a[0] + a[2], b[0] + b[2]), bt = Math.max(a[1] + a[3], b[1] + b[3]);
    return [l, t, r - l, bt - t];
  }
  function trackLines(g, q, ox, oy) {
    [TRACK_OFF, -TRACK_OFF].forEach(function (o) {
      var bed = band(q, o - 0.24, o + 0.24);
      prism(g, bed, RH, RH + 0.3, '#9c9a96', ['#8a8884', '#8a8884'], ox, oy);
      g.strokeStyle = '#6f5b4a'; g.lineWidth = 1.1; g.beginPath();
      var e = q.e, s0 = q.a + (q.c0 ? o : 0), s1 = q.b - (q.c1 ? o : 0);
      for (var s = Math.ceil(s0 * 4) / 4 + 0.125; s < s1; s += 0.25) {
        var p0 = onEdge(e, s, o - 0.2), p1 = onEdge(e, s, o + 0.2);
        g.moveTo(X(p0.x * T - ox, p0.y * T - oy), Y(p0.x * T - ox, p0.y * T - oy, RH + 0.4));
        g.lineTo(X(p1.x * T - ox, p1.y * T - oy), Y(p1.x * T - ox, p1.y * T - oy, RH + 0.4));
      }
      g.stroke();
      g.strokeStyle = '#e9ecf2'; g.lineWidth = 0.55; g.beginPath();
      [o - GAUGE, o + GAUGE].forEach(function (oo) {
        var a = onEdge(e, q.a + (q.c0 ? oo : 0), oo), b = onEdge(e, q.b - (q.c1 ? oo : 0), oo);
        g.moveTo(X(a.x * T - ox, a.y * T - oy), Y(a.x * T - ox, a.y * T - oy, RH + 0.6));
        g.lineTo(X(b.x * T - ox, b.y * T - oy), Y(b.x * T - ox, b.y * T - oy, RH + 0.6));
      });
      g.stroke();
    });
  }
  function deckDraw(g, q) {
    var ox = q.x * T, oy = q.y * T, w = q.w * T, d = q.h * T;
    I.box(g, 0, 0, w, d, RH - DECK_T, DECK_T, '#b9bcc4', { left: '#a3a8b4', right: '#bcc1cb' });
    g.fillStyle = LINE;
    I.leftFacePath(g, 0, 0, w, d, RH - 1.2, RH - 2.4); g.fill();
    I.rightFacePath(g, 0, 0, w, d, RH - 1.2, RH - 2.4); g.fill();
    trackLines(g, q, ox, oy);
  }
  function pierDraw(g, alongX) {
    var c = 0.27 * T, top = RH - DECK_T - 3;
    g.fillStyle = 'rgba(40,40,60,0.16)'; I.facePath(g, -c + 2, -c + 2, c * 2, c * 2, 0); g.fill();
    I.box(g, -c, -c, c * 2, c * 2, 0, top, '#c3c6ce', { left: '#9ea3ae', right: '#b3b7c1' });
    var lw = (alongX ? 0.32 : DECK_W * 0.95) * T, ld = (alongX ? DECK_W * 0.95 : 0.32) * T;
    I.box(g, -lw, -ld, lw * 2, ld * 2, top, 3, '#c9ccd4', { left: '#a3a8b4', right: '#b8bcc6' });
  }
  var PIER_BB = bbOf(-0.95 * T, -0.95 * T, 1.9 * T, 1.9 * T, 0, RH);
  var PIER_FN = [function (g) { pierDraw(g, true); }, function (g) { pierDraw(g, false); }];
  function carDraw(g, alongX, night) {
    var w = (alongX ? CAR_L : CAR_W) * T, d = (alongX ? CAR_W : CAR_L) * T, b = RH + 0.6;
    I.box(g, 0, 0, w, d, b, CAR_H, '#e3e8ee', { left: '#c3cad4', right: '#d3d9e1', top: '#eef1f5' });
    g.fillStyle = night ? '#ffe7a3' : '#3a4658';
    I.leftFacePath(g, 0, 0, w, d, b + 7.4, b + 4.9); g.fill();
    I.rightFacePath(g, 0, 0, w, d, b + 7.4, b + 4.9); g.fill();
    g.fillStyle = LINE;
    I.leftFacePath(g, 0, 0, w, d, b + 3.6, b + 1.8); g.fill();
    I.rightFacePath(g, 0, 0, w, d, b + 3.6, b + 1.8); g.fill();
    var aw = alongX ? w * 0.3 : w * 0.6, ad = alongX ? d * 0.6 : d * 0.3;
    I.box(g, (w - aw) / 2, (d - ad) / 2, aw, ad, b + CAR_H, 1.4, '#cfd5dd', { left: '#aab2bd', right: '#bcc3cd' });
    g.strokeStyle = 'rgba(42,36,64,0.35)'; g.lineWidth = 0.5;
    I.facePath(g, 0, 0, w, d, b + CAR_H); g.stroke();
  }
  var CAR_KEY = [], CAR_FN = [];
  [0, 1].forEach(function (ax) { [0, 1].forEach(function (n) {
    var i = ax * 2 + n; CAR_KEY[i] = 'rcar' + ax + n;
    CAR_FN[i] = function (g) { carDraw(g, !!ax, !!n); };
  }); });
  var CAR_BB = [bbOf(0, 0, CAR_W * T, CAR_L * T, RH, RH + CAR_H + 2.5), bbOf(0, 0, CAR_L * T, CAR_W * T, RH, RH + CAR_H + 2.5)];
  var PIECES = null, builtKey = '';
  function inRanges(rs, s) {
    s = wrap(s);
    for (var i = 0; i < rs.length; i++) if (s >= rs[i][0] && s < rs[i][1]) return true;
    return false;
  }
  function overlapsRanges(rs, a, b) {
    for (var k = -1; k <= 1; k++) {
      var a2 = a + k * LEN, b2 = b + k * LEN;
      for (var i = 0; i < rs.length; i++) if (b2 > rs[i][0] && a2 < rs[i][1]) return true;
    }
    return false;
  }
  function build() {
    var K = KEEP(), kd = K.data();
    if (PIECES && builtKey === kd.key) return PIECES;
    builtKey = kd.key;
    var parked = QT.Art.tokyo.parked ? QT.Art.tokyo.parked() : [];
    var byB = {}, list = [], STEP = 0.25, prevB = -1, cur = null;
    for (var s = 0; s < LEN; s += STEP) {
      var p = pt(s), b = W.bucketAt(p.x * T, p.y * T);
      if (b !== prevB) {
        var it = byB[b] || (byB[b] = { b: b, ranges: [], x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
        if (!it.ranges.length) list.push(it);
        cur = [s, s + STEP]; it.ranges.push(cur); prevB = b;
      } else cur[1] = s + STEP;
      var r = byB[b];
      r.x0 = Math.min(r.x0, p.x - DECK_W); r.x1 = Math.max(r.x1, p.x + DECK_W);
      r.y0 = Math.min(r.y0, p.y - DECK_W); r.y1 = Math.max(r.y1, p.y + DECK_W);
    }
    PIECES = list.map(function (r) {
      var slabs = [], piers = [];
      r.ranges.forEach(function (rg) { chunksOf(rg[0], rg[1], DECK_W).forEach(function (q) { slabs.push(q); }); });
      for (var ps = 0; ps < LEN; ps += 6) {
        if (!inRanges(r.ranges, ps)) continue;
        var q = pt(ps), bad = false;
        for (var i = 0; i < parked.length; i++) if (Math.abs(parked[i].x - q.x) < 1.2 && Math.abs(parked[i].y - q.y) < 1.2) bad = true;
        if (bad) continue;
        var cx = q.x * T, cy = q.y * T, hw = 0.3 * T;
        if (K.covers([[cx - hw, cy - hw, hw * 2, hw * 2, 0, RH - DECK_T]], 2).length) continue;
        piers.push({ x: q.x, y: q.y, fn: q.dx ? PIER_FN[0] : PIER_FN[1], key: q.dx ? 'rpier0' : 'rpier1', sx: X(cx, cy), sy: Y(cx, cy, 0) });
      }
      slabs.sort(function (a, b) { return (a.x + a.w / 2 + a.y + a.h / 2) - (b.x + b.w / 2 + b.y + b.h / 2); });
      piers.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); });
      slabs.forEach(function (q) {
        var x = q.x * T, y = q.y * T, w = q.w * T, d = q.h * T;
        q.bb0 = bbOf(x, y, w, d, RH - DECK_T, RH + 1);
        q.lbb = bbOf(0, 0, w, d, RH - DECK_T, RH + 1);
        q.ox = X(x, y); q.oy = Y(x, y, 0);
        q.key = 'rdk' + q.e.i + (q.c0 ? 1 : 0) + (q.c1 ? 1 : 0) + ':' + q.w.toFixed(2) + 'x' + q.h.toFixed(2);
        q.fn = (function (qq) { return function (g) { deckDraw(g, qq); }; })(q);
        q.cov = K.covers([[x, y, w, d, RH - DECK_T, RH + 1]], 3);
      });
      var piece = { b: r.b, ranges: r.ranges, slabs: slabs, piers: piers,
                    x: r.x0 * T, y: r.y0 * T, w: (r.x1 - r.x0) * T, h: (r.y1 - r.y0) * T };
      piece.e = { x: piece.x, y: piece.y, w: piece.w, h: piece.h, draw: function () { drawPiece(piece); } };
      return piece;
    });
    return PIECES;
  }
  var AMB_V = 6.5;
  var AMB = [{ ph: 0, dir: 1 }, { ph: 0.5, dir: 1 }, { ph: 0.27, dir: -1 }];
  function ambCenter(t, a) { return wrap(a.dir * t * AMB_V + a.ph * LEN); }
  var TRAINS = [];
  function updateTrains(S) {
    TRAINS.length = 0;
    for (var k = 0; k < AMB.length; k++) TRAINS.push({ c: ambCenter(S.t, AMB[k]), dir: AMB[k].dir });
  }
  var VW = { x0: 0, y0: 0, x1: 0, y1: 0 }, CUR = { S: null, H: null };
  function setView(H) {
    var hw = H.cssW / 2 / H.z, hh = H.cssH / 2 / H.z;
    VW.x0 = H.cam.x - hw; VW.x1 = H.cam.x + hw; VW.y0 = H.cam.y - hh; VW.y1 = H.cam.y + hh;
  }
  function visBB(bb) { return bb[0] + bb[2] >= VW.x0 && bb[0] <= VW.x1 && bb[1] + bb[3] >= VW.y0 && bb[1] <= VW.y1; }
  function alphaOf(x, y, w, h, cov, S, H) {
    if (H.riding) return 1;
    var px = S.player.x / T, py = S.player.y / T, a = 1;
    if (px > x - 3.4 && px < x + w + 0.8 && py > y - 3.4 && py < y + h + 0.8) a = 0.38;
    if (a > 0.45 && cov && cov.length) {
      var live = KEEP().live;
      for (var i = 0; i < cov.length; i++) {
        var q = cov[i], r = q.tag === 'pad' ? 6 : 9;
        if (Math.abs(q.tx - px) < r && Math.abs(q.ty - py) < r && live(q)) { a = 0.45; break; }
      }
    }
    return a;
  }
  function drawPiece(pc) {
    var TC = QT.Art.tokyo && QT.Art.tokyo.closed;
    if (TC && TC.signs().length) { TC.hole(CUR.H.ctx, null, function () { drawPiece0(pc); }); return; }
    drawPiece0(pc);
  }
  var CARS = [];
  function drawPiece0(pc) {
    var S = CUR.S, H = CUR.H, c = H.ctx, i, q, LT = QT.Art.lit;
    for (i = 0; i < pc.piers.length; i++) {
      var pr = pc.piers[i];
      if (!visBB([pr.sx + PIER_BB[0], pr.sy + PIER_BB[1], PIER_BB[2], PIER_BB[3]])) continue;
      c.globalAlpha = alphaOf(pr.x - 0.3, pr.y - 0.3, 0.6, 0.6, null, S, H);
      sprite(c, pr.key, PIER_BB[0], PIER_BB[1], PIER_BB[2], PIER_BB[3], pr.fn, pr.sx, pr.sy);
    }
    for (i = 0; i < pc.slabs.length; i++) {
      q = pc.slabs[i];
      if (!visBB(q.bb0)) continue;
      c.globalAlpha = alphaOf(q.x, q.y, q.w, q.h, q.cov, S, H);
      sprite(c, q.key, q.lbb[0], q.lbb[1], q.lbb[2], q.lbb[3], q.fn, q.ox, q.oy, 2);
      if (LT && LT.crisp()) LT.spr(q.key, q.ox, q.oy, c.globalAlpha, true);
    }
    c.globalAlpha = 1;
    var cars = CARS; cars.length = 0;
    for (i = 0; i < TRAINS.length; i++) {
      var tr = TRAINS[i], off = tr.dir > 0 ? TRACK_OFF : -TRACK_OFF, head = tr.c + tr.dir * TRAIN_L / 2;
      for (var k = 0; k < NCAR; k++) {
        var sc = head - tr.dir * (k * (CAR_L + CAR_GAP) + CAR_L / 2);
        if (!overlapsRanges(pc.ranges, wrap(sc) - CAR_L / 2, wrap(sc) + CAR_L / 2)) continue;
        var cp = pt(sc, off), ax = cp.dx ? 1 : 0;
        var x0 = (cp.x - (ax ? CAR_L : CAR_W) / 2) * T, y0 = (cp.y - (ax ? CAR_W : CAR_L) / 2) * T;
        cars.push({ x0: x0, y0: y0, ax: ax, head: k === 0, cp: cp, dir: tr.dir, d: cp.x + cp.y });
      }
    }
    cars.sort(function (a, b) { return a.d - b.d; });
    var night = (H.night || 0) > 0.4 ? 1 : 0;
    for (i = 0; i < cars.length; i++) {
      var cr = cars[i], ox = X(cr.x0, cr.y0), oy = Y(cr.x0, cr.y0, 0), bb = CAR_BB[cr.ax], ki = cr.ax * 2 + night;
      if (!visBB([ox + bb[0], oy + bb[1], bb[2], bb[3]])) continue;
      sprite(c, CAR_KEY[ki], bb[0], bb[1], bb[2], bb[3], CAR_FN[ki], ox, oy);
      if (night && LT && LT.k() > 0) {
        var mx = cr.cp.x * T, my = cr.cp.y * T;
        LT.pool(X(mx, my), Y(mx, my, RH + 0.6 + CAR_H * 0.55), 11, 5, '#ffe9a8', 0.45);
      }
      if (cr.head) {
        var hx = (cr.cp.x + cr.cp.dx * cr.dir * (CAR_L / 2 - 0.15)) * T, hy = (cr.cp.y + cr.cp.dy * cr.dir * (CAR_L / 2 - 0.15)) * T;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(X(hx, hy), Y(hx, hy, RH + 0.6 + CAR_H * 0.55), 1.3, 0, 7); c.fill();
        if (night && LT && LT.k() > 0) LT.glow(X(hx, hy), Y(hx, hy, RH + 0.6 + CAR_H * 0.55), 6, '#ffffff', 0.8);
      }
    }
  }
  on('rail', function (S, H, push) {
    if (H.rail && H.rail.H && H.rail.H !== RH) RH = H.rail.H;
    CUR.S = S; CUR.H = H;
    setView(H);
    var list = build();
    updateTrains(S);
    for (var i = 0; i < list.length; i++) {
      var pc = list[i], e = pc.e;
      e.x = pc.x; e.y = pc.y; e.w = pc.w; e.h = pc.h;
      push(e);
    }
  });
  QT.Art.rail = {
    pieces: function () { return build(); },
    trains: function () { return TRAINS; },
    hiding: function () {
      var out = [];
      build().forEach(function (pc) {
        pc.slabs.forEach(function (q) { if (q.cov.length) out.push('deck@' + q.a.toFixed(1) + ' hides ' + q.cov.map(function (p) { return p.tag + ' ' + p.tx + ',' + p.ty; }).join(' ')); });
      });
      return out;
    }
  };
})(window.QT || (window.QT = {}));
