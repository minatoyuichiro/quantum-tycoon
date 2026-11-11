(function (QT) {
  'use strict';
  var W = QT.World, TILE = W.TILE, L = QT.L, I = QT.Iso;
  var VIEW_W = 330;
  var cam = { x: 0, y: 0 };
  var z = 1, cssW = 0, cssH = 0, dpr = 1;
  var ctx = null;
  var shownCash = 0, shownValue = 0;
  var C = {
    sky1: '#bfe4ff', sky2: '#eaf6ff', sky3: '#fdf7ec',
    floor: '#fff8ea', floor2: '#f6e7cc', grid: 'rgba(185,155,110,0.28)',
    wall: '#f4e0bd', card: '#ffffff',
    ink: '#2f2c46', inkSoft: '#7d788f',
    gold: '#f5b21c', green: '#2fbf7a', red: '#e2504a', blue: '#2bb8d8',
    violet: '#6f57e0', pink: '#e2508a', orange: '#ef7d2e'
  };
  var FONT = '"Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI",system-ui,sans-serif';
  var H_WALL = 20, H_PLOT = 22, H_LOW = 9;
  var ART = QT.Art = QT.Art || {};
  ART.reg = ART.reg || {};
  ART.errors = ART.errors || {};
  ART.disabled = ART.disabled || {};
  ART.on = function (type, key, fn) {
    if (typeof key === 'function') { fn = key; key = '*'; }
    var t = ART.reg[type] || (ART.reg[type] = {});
    (t[key] || (t[key] = [])).push(fn);
  };
  ART.scope = function (name) {
    return function (type, key, fn) {
      if (typeof key === 'function') { fn = key; key = '*'; }
      fn.__scope = name;
      ART.on(type, key, fn);
    };
  };
  function artList(type, key) { var t = ART.reg[type]; return (t && t[key]) || null; }
  function artFor(type, p) { return artList(type, p.id) || artList(type, p.kind); }
  function artCall(tag, fn, args) {
    if (fn.__scope && ART.disabled[fn.__scope]) return false;
    if (fn.__scope) tag = fn.__scope + '/' + tag;
    try { return fn.apply(null, args); }
    catch (e) {
      if (!ART.errors[tag]) { ART.errors[tag] = String((e && e.stack) || e); console.error('[art] ' + tag, e); }
      return undefined;
    }
  }
  function artRun(type, key, args) {
    var list = artList(type, key);
    if (!list) return false;
    var drew = false;
    for (var i = 0; i < list.length; i++) if (artCall(type + ':' + key, list[i], args) !== false) drew = true;
    return drew;
  }
  function artRunPlot(type, p, args) {
    return artList(type, p.id) ? artRun(type, p.id, args) : artRun(type, p.kind, args);
  }
  var ex = I.ex, ey = I.ey, shade = I.shade;
  function resize(canvas, w, h, d) {
    cssW = w; cssH = h; dpr = d;
    z = w / VIEW_W;
    if (h < w) z = h / 300;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(h * d);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  function toScreen(x, y, h) {
    return { x: (ex(x, y) - cam.x) * z + cssW / 2, y: (ey(x, y, h) - cam.y) * z + cssH / 2 };
  }
  function P(x, y, h) { return { x: ex(x, y), y: ey(x, y, h) }; }
  function worldTransform() {
    ctx.setTransform(z * dpr, 0, 0, z * dpr,
      (cssW / 2 - cam.x * z) * dpr, (cssH / 2 - cam.y * z) * dpr);
  }
  function uiTransform() { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fillRR(c, x, y, w, h, r, f) { rr(c, x, y, w, h, r); c.fillStyle = f; c.fill(); }
  function strokeRR(c, x, y, w, h, r, s, lw) { rr(c, x, y, w, h, r); c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); }
  var emojiOk = null;
  var EMOJI_RE = /(?:\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|\ud83e[\udc00-\udfff])️?(?:‍(?:\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|\ud83e[\udc00-\udfff])️?)*\s?/g;
  function canEmoji() {
    if (emojiOk !== null) return emojiOk;
    emojiOk = true;
    try {
      var cv = document.createElement('canvas'); cv.width = cv.height = 24;
      var cx = cv.getContext('2d');
      cx.textBaseline = 'middle'; cx.font = '18px sans-serif'; cx.fillStyle = '#000';
      cx.fillText('🧪', 2, 12);
      var d = cx.getImageData(0, 0, 24, 24).data, col = false;
      for (var i = 0; i < d.length; i += 4) if (d[i + 3] > 40 && (Math.abs(d[i] - d[i + 1]) > 24 || Math.abs(d[i + 1] - d[i + 2]) > 24)) { col = true; break; }
      emojiOk = col;
    } catch (e) { emojiOk = true; }
    return emojiOk;
  }
  function plain(s) {
    s = String(s);
    if (!/[\ud83c-\ud83e]/.test(s) || canEmoji()) return s;
    return s.replace(EMOJI_RE, '').replace(/（\s+/g, '（').replace(/\(\s+/g, '(').replace(/^\s+/, '');
  }
  function txt(c, s, x, y, size, color, align, weight, halo) {
    s = plain(s);
    c.font = (weight || 700) + ' ' + size + 'px ' + FONT;
    c.textAlign = align || 'left';
    c.textBaseline = 'middle';
    if (halo) { c.lineWidth = Math.max(2.5, size / 3.5); c.strokeStyle = halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color; c.fillText(s, x, y);
  }
  function fitTxt(c, s, x, y, size, maxW, color, weight, min) {
    var fs = size;
    s = plain(s);
    c.font = (weight || 700) + ' ' + fs + 'px ' + FONT;
    while (fs > (min || 9) && c.measureText(s).width > maxW) {
      fs -= 0.5; c.font = (weight || 700) + ' ' + fs + 'px ' + FONT;
    }
    if (c.measureText(s).width > maxW) {
      while (s.length > 1 && c.measureText(s + '…').width > maxW) s = s.slice(0, -1);
      s += '…';
    }
    txt(c, s, x, y, fs, color, 'left', weight);
  }
  var CAM_MARGIN = 40 / I.A;
  var camReady = false, snapNext = false;
  var RIDE = { on: false, ride: null, fade: 0, to: null };
  function travelApi() { return QT.Sim && QT.Sim.travel; }
  function readRide() {
    var tv = travelApi(), on = false, ride = null, fa = 0, to = null;
    try {
      on = !!(tv && tv.riding && tv.riding());
      if (on) ride = tv.ride || null;
      if (!on) { var lzr = QT.Sim && QT.Sim.leisure; on = !!(lzr && lzr.riding && lzr.riding()); }
      var f = tv && typeof tv.fade === 'function' ? tv.fade() : 0;
      if (f && typeof f === 'object') { to = f.to || f.dest || f.district || null; f = f.a != null ? f.a : f.alpha != null ? f.alpha : f.k; }
      fa = +f || 0;
    } catch (e) { on = false; fa = 0; }
    RIDE.on = on; RIDE.ride = ride; RIDE.fade = Math.max(0, Math.min(1, fa)); RIDE.to = to;
  }
  if (QT.G && QT.G.on) {
    ['rideEnd', 'travelArrive', 'arrive', 'warp'].forEach(function (ev) {
      QT.G.on(ev, function () {
        if (cam.lock) return;
        snapNext = true;
      });
    });
  }
  L.add({
    render_tripTo:   ['{n}へ', 'To {n}'],
    render_tripOpen: ['{n}を開通', 'Open {n}']
  });
  function tripHere(S) {
    var id = W.roomAtPx(S.player.x, S.player.y);
    return id && id !== 'ave' ? id : null;
  }
  function tripCan(id) {
    var tv = travelApi(), d = W.DIST[id], G = QT.G;
    if (!d) return null;
    if (tv && typeof tv.canGo === 'function') {
      try { var r = tv.canGo(id); if (r) return r; } catch (e) { console.error('[render] travel.canGo', e); }
    }
    var open = G.roomOpen(id), go = !!(tv && typeof tv.goTo === 'function');
    return { ok: go && open && tripHere(G.S) !== id, ready: go && !open && !!(G.distReady && G.distReady(id)),
             why: null, fare: 0 };
  }
  function tripGo(id, why) {
    var tv = travelApi(), S = QT.G.S;
    if (!tv || typeof tv.goTo !== 'function' || RIDE.fade > 0 || S.won) return false;
    try { return tv.goTo(id, why) !== false; } catch (e) { console.error('[render] travel.goTo', e); return false; }
  }
  function tripOpen(why) {
    var tv = travelApi();
    if (tv && typeof tv.openSheet === 'function') {
      try { tv.openSheet(why); return true; } catch (e) { console.error('[render] travel.openSheet', e); }
    }
    var ph = QT.UI && QT.UI.get('phone');
    if (ph && ph.open) { ph.open('map'); return true; }
    return false;
  }
  function shortDist(d) {
    return d ? String(L.nm(d, 'short') || L.nm(d)).split(/[・·\/&,]| and /)[0].trim() : '';
  }
  var tripNx = { at: -9, res: null };
  function tripNext(S) {
    if (S.t >= tripNx.at && S.t - tripNx.at < 0.3) return tripNx.res;
    tripNx.at = S.t; tripNx.res = null;
    var n = QT.Guide && QT.Guide.next ? QT.Guide.next() : null, pt = null;
    if (n && n.pt) pt = n.pt;
    else if (n && n.pad) pt = { x: (n.pad.x + 0.5) * TILE, y: (n.pad.y + 0.5) * TILE };
    if (!pt) return null;
    var id = W.roomAtPx(pt.x, pt.y);
    if (!id || id === 'ave' || !W.DIST[id] || id === tripHere(S)) return null;
    var c = tripCan(id);
    if (!c || !(c.ok || c.ready)) return null;
    return (tripNx.res = { id: id, d: W.DIST[id], fare: c.fare || 0, ready: !c.ok && !!c.ready });
  }
  function tramGlyph(c, x, y, s, col) {
    c.save();
    c.translate(x, y); c.scale(s, s);
    c.fillStyle = col;
    rr(c, -8, -10, 16, 17, 4); c.fill();
    c.fillRect(-3, -13, 6, 2.4);
    c.fillStyle = '#ffffff';
    rr(c, -5.6, -7.4, 11.2, 6.4, 1.6); c.fill();
    c.beginPath(); c.arc(-4.4, 3, 1.5, 0, 7); c.arc(4.4, 3, 1.5, 0, 7); c.fill();
    c.fillStyle = col;
    c.fillRect(-0.6, -7.4, 1.2, 6.4);
    c.beginPath(); c.arc(-4.6, 9.6, 2.1, 0, 7); c.arc(4.6, 9.6, 2.1, 0, 7); c.fill();
    c.restore();
  }
  function drawTripBtn(S, r, base) {
    if (S.won || !r) return;
    var tv = travelApi(), sh = QT.UI && QT.UI.get('tripsheet');
    var on = !!(sh && sh.isOpen && sh.isOpen());
    base(r);
    if (on) fillRR(ctx, r.x, r.y, r.w, r.h, 15, C.green);
    tramGlyph(ctx, r.x + r.w / 2, r.y + r.h / 2 + 0.5, Math.min(1, r.w / 42), on ? '#ffffff' : C.green);
    var gold = false;
    if (!on && tv) W.DISTRICTS.forEach(function (d) { if (!gold && !QT.G.roomOpen(d.id) && QT.G.distReady && QT.G.distReady(d.id)) gold = true; });
    if (gold) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(r.x + r.w - 6, r.y + 6, 6.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#f5b21c'; ctx.beginPath(); ctx.arc(r.x + r.w - 6, r.y + 6, 4.8, 0, 7); ctx.fill();
    }
    if (!QT.UI) return;
    var gx = Math.max(0, (44 - r.w) / 2), gy = Math.max(0, (44 - r.h) / 2);
    QT.UI.tapRect({ x: r.x - gx, y: r.y - gy, w: r.w + gx * 2, h: r.h + gy }, function () {
      if (RIDE.fade > 0) return true;
      if (on && sh.close) sh.close(); else tripOpen('hud');
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      return true;
    });
  }
  function drawTripChip(S, r) {
    if (RIDE.on || S.won) return 0;
    var tn = tripNext(S);
    if (!tn) return 0;
    var label = L.t(tn.ready ? 'render_tripOpen' : 'render_tripTo', { n: shortDist(tn.d) });
    ctx.font = '900 10.5px ' + FONT;
    var w = Math.min(Math.max(64, r.w * 0.42), ctx.measureText(label).width + 30), h = r.h - 4;
    var x = r.x + r.w - w - 2, y = r.y + 2, col = tn.ready ? '#e8a800' : C.green;
    fillRR(ctx, x, y, w, h, h / 2, col);
    tramGlyph(ctx, x + 11, y + h / 2, 0.62, '#ffffff');
    fitTxt(ctx, label, x + 20, y + h / 2, 10.5, w - 24, '#ffffff', 900, 8);
    if (QT.UI) QT.UI.tapRect({ x: x - 2, y: r.y - 8, w: w + 4, h: Math.max(44, r.h + 16) }, function () {
      if (tripGo(tn.id, 'next') && QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      tripNx.at = -9;
      return true;
    });
    return w + 4;
  }
  function clampCam() {
    var w = I.toWorld(cam.x, cam.y), m = CAM_MARGIN;
    var x = Math.max(-m, Math.min(W.WORLD_PX_W + m, w.x)), y = Math.max(-m, Math.min(W.WORLD_PX_H + m, w.y));
    if (x !== w.x || y !== w.y) { cam.x = ex(x, y); cam.y = ey(x, y, 0); }
  }
  function camBias() {
    if (!cssH || !QT.G || !QT.G.S) return 0;
    var top = 8 + hudH() + 4 + OBJ_H + 4 + CHIP_H + 4, bot = cssH - 66;
    if (bot < top + 60) return 0;
    return ((top + bot) / 2 + 14 * Math.min(1.4, z) - cssH / 2) / z;
  }
  function snapCamera(S) {
    S = S || QT.G.S;
    cam.x = ex(S.player.x, S.player.y); cam.y = ey(S.player.x, S.player.y, 0) - camBias();
    clampCam();
    camReady = true; skySnap = true;
  }
  var JUMP = 3 * TILE, lastPl = { x: NaN, y: NaN };
  function updateCamera(S) {
    var jumped = Math.abs(S.player.x - lastPl.x) > JUMP || Math.abs(S.player.y - lastPl.y) > JUMP;
    lastPl.x = S.player.x; lastPl.y = S.player.y;
    if (snapNext || (jumped && camReady)) { snapNext = false; snapCamera(S); return; }
    var tx = ex(S.player.x, S.player.y), ty = ey(S.player.x, S.player.y, 0) - camBias();
    if (!camReady || Math.abs(tx - cam.x) > 700 || Math.abs(ty - cam.y) > 520) { snapCamera(S); return; }
    cam.x += (tx - cam.x) * 0.16;
    cam.y += (ty - cam.y) * 0.16;
    clampCam();
  }
  var SKY_BY = {
    biz:     ['#bfe4ff', '#eaf6ff', '#fdf7ec'],
    town:    ['#bfe4ff', '#eaf6ff', '#fdf7ec'],
    sw:      ['#a9d8ff', '#e3f2ff', '#fff4e0'],
    plant:   ['#8fc3f5', '#ffe3c2', '#ffd6a8'],
    service: ['#7aa7e8', '#ffc9a3', '#ffb38a'],
    outsrc:  ['#5a74c8', '#f59aa0', '#ffb38a'],
    cryo:    ['#34407e', '#7d5fb0', '#e88fa8'],
    hq:      ['#0d1030', '#23195a', '#4a2a6e']
  };
  var SKY_ALT = { biz: 0, town: 1, sw: 2, plant: 3, service: 4, outsrc: 5, cryo: 6, hq: 7 };
  function mixCol(a, b, k) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = ((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * k;
    var g = ((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k;
    var bl = (pa & 255) + ((pb & 255) - (pa & 255)) * k;
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(bl) + ')';
  }
  function rgbOf(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  var SKY_RGB = {};
  Object.keys(SKY_BY).forEach(function (k) { SKY_RGB[k] = SKY_BY[k].map(rgbOf); });
  var timeNight = 0;
  var NIGHT_LEN = 12, DUSK = 3, DAWN = 1.5;
  function nightOf(S) {
    if (S.won) return 1;
    var f = S.fin, tm = f && f.tMonth, M = W.MONTH || 60;
    NIGHT_LEN = Math.min(12, M * 0.2); DUSK = Math.min(3, M * 0.06); DAWN = Math.min(1.5, M * 0.05);
    if (typeof tm !== 'number' || !isFinite(tm)) return 0;
    if (tm >= M - NIGHT_LEN) return Math.min(1, (tm - (M - NIGHT_LEN)) / DUSK);
    if (tm < DAWN && S.t > M) return 1 - tm / DAWN;
    return 0;
  }
  var NIGHT_SKY = ['#0b1030', '#1c1f55', '#3b2c6a'].map(function (h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
  var NIGHT_TINT = '#7a80c4';
  var nightTintKey = -1, nightTintCol = '';
  function drawNightTint(S) {
    var q = Math.round(timeNight * 32);
    if (q <= 0) return;
    if (q !== nightTintKey) { nightTintKey = q; nightTintCol = mixCol('#ffffff', NIGHT_TINT, q / 32); }
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = nightTintCol; ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
    artRun('night', '*', [S, H]);
  }
  var skyNow = null, skyAlt = 0, skySnap = true, starsArr = null;
  var skyGrad = null, skyGradKey = '';
  var SKY_FALL = 6 * TILE;
  function skyTarget(S) {
    var px = S.player.x, py = S.player.y, tot = 0, rgb = [0, 0, 0, 0, 0, 0, 0, 0, 0], alt = 0;
    W.DISTRICTS.forEach(function (d) {
      var x0 = d.ix * TILE, y0 = d.iy * TILE, x1 = (d.ix + d.iw) * TILE, y1 = (d.iy + d.ih) * TILE;
      var dx = Math.max(x0 - px, 0, px - x1), dy = Math.max(y0 - py, 0, py - y1);
      var w = Math.exp(-(dx + dy) / SKY_FALL);
      if (w < 0.004) return;
      var th = SKY_RGB[d.theme] ? d.theme : 'biz', c = SKY_RGB[th];
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) rgb[i * 3 + j] += c[i][j] * w;
      alt += (SKY_ALT[th] || 0) * w;
      tot += w;
    });
    if (tot <= 0) return { rgb: SKY_RGB.biz[0].concat(SKY_RGB.biz[1], SKY_RGB.biz[2]), alt: 0 };
    for (var k = 0; k < 9; k++) rgb[k] /= tot;
    return { rgb: rgb, alt: alt / tot };
  }
  function rgbStr(a, i) { return 'rgb(' + Math.round(a[i]) + ',' + Math.round(a[i + 1]) + ',' + Math.round(a[i + 2]) + ')'; }
  function drawSky(S) {
    var tg = skyTarget(S);
    if (!skyNow || skySnap) { skyNow = tg.rgb.slice(); skyAlt = tg.alt; skySnap = false; }
    else {
      for (var q = 0; q < 9; q++) skyNow[q] += (tg.rgb[q] - skyNow[q]) * 0.05;
      skyAlt += (tg.alt - skyAlt) * 0.05;
    }
    var nq = Math.round(timeNight * 24) / 24, sky = skyNow;
    if (nq > 0) {
      sky = [];
      for (var ni = 0; ni < 9; ni++) sky.push(skyNow[ni] + (NIGHT_SKY[(ni / 3) | 0][ni % 3] - skyNow[ni]) * nq * 0.9);
    }
    var key = cssH + ':' + sky.map(function (v) { return v | 0; }).join(',');
    if (key !== skyGradKey) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, cssH);
      skyGrad.addColorStop(0, rgbStr(sky, 0));
      skyGrad.addColorStop(0.55, rgbStr(sky, 3));
      skyGrad.addColorStop(1, rgbStr(sky, 6));
      skyGradKey = key;
    }
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, cssW, cssH);
    var night = Math.max(timeNight, Math.max(0, Math.min(1, (skyAlt - 5.2) / 1.6)));
    if (night > 0) {
      if (!starsArr) { starsArr = []; for (var si = 0; si < 90; si++) starsArr.push([Math.random(), Math.random() * 0.7, Math.random() * 6]); }
      starsArr.forEach(function (st) {
        ctx.globalAlpha = night * (0.4 + 0.6 * Math.abs(Math.sin(S.t * 1.5 + st[2])));
        ctx.fillStyle = '#ffffff'; ctx.fillRect(st[0] * cssW, st[1] * cssH, 1.6, 1.6);
      });
      ctx.globalAlpha = 1;
    }
    var base = cssH * 0.98, off = -(cam.x * 0.12) % 90;
    for (var bi = -1; bi < cssW / 30 + 2; bi++) {
      var seed = Math.abs(Math.sin((bi + Math.floor(-cam.x * 0.12 / 90) * 3) * 12.9898) * 43758.5453) % 1;
      var bw = 14 + seed * 14, bh = cssH * (0.04 + seed * 0.1);
      var bx = bi * 34 + off;
      ctx.fillStyle = mixCol('#c9d8ea', '#2a2160', Math.min(1, Math.max(skyAlt / 7, nq)));
      ctx.globalAlpha = 0.28;
      ctx.fillRect(bx, base - bh, bw, bh);
      var lit = Math.max(nq, Math.max(0, Math.min(1, (skyAlt - 3.5) / 2.5)));
      if (lit > 0) {
        ctx.globalAlpha = 0.55 * lit;
        for (var wy = base - bh + 4; wy < base - 4; wy += 7)
          for (var wx = bx + 3; wx < bx + bw - 3; wx += 5)
            if (Math.sin(wx * 3.1 + wy * 1.7 + bi) > 0.1) { ctx.fillStyle = (wx + wy) % 3 < 1 ? '#ffd86b' : '#9fe8ff'; ctx.fillRect(wx, wy, 2, 3); }
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - night)) + ')';
    for (var i = 0; i < 5; i++) {
      var cx = ((i * 151 + S.t * 5) % (cssW + 260)) - 130;
      var cy = (i * 173 + 70) % (cssH + 140) - 70;
      var r = 14 + (i % 3) * 9;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 7);
      ctx.arc(cx + r * 0.9, cy + 4, r * 0.75, 0, 7);
      ctx.arc(cx - r * 0.9, cy + 5, r * 0.65, 0, 7);
      ctx.fill();
    }
  }
  function floorSlab(x, y, w, h, base, col, col2, gridOn) {
    I.facePath(ctx, x, y, w, h, base);
    ctx.fillStyle = col; ctx.fill();
    if (!col2) return;
    ctx.save();
    I.facePath(ctx, x, y, w, h, base); ctx.clip();
    ctx.fillStyle = col2;
    var cols = Math.ceil(w / TILE), rows = Math.ceil(h / TILE);
    for (var ty = 0; ty < rows; ty++)
      for (var tx = 0; tx < cols; tx++)
        if (((tx + ty) & 1) === 0) {
          I.facePath(ctx, x + tx * TILE, y + ty * TILE, TILE, TILE, base);
          ctx.fill();
        }
    if (gridOn) {
      ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (var gx = 0; gx <= cols; gx++) {
        ctx.moveTo(ex(x + gx * TILE, y), ey(x + gx * TILE, y, base));
        ctx.lineTo(ex(x + gx * TILE, y + h), ey(x + gx * TILE, y + h, base));
      }
      for (var gy = 0; gy <= rows; gy++) {
        ctx.moveTo(ex(x, y + gy * TILE), ey(x, y + gy * TILE, base));
        ctx.lineTo(ex(x + w, y + gy * TILE), ey(x + w, y + gy * TILE, base));
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  var THEME = {
    town:    { walk: '#e2ddcf', floor: '#eceadf', floor2: '#e4e1d3', lane: '#dcd6c6' },
    biz:     { walk: '#dfdcd3', floor: '#eeece5', floor2: '#e6e3da', lane: '#d9d5ca' },
    sw:      { walk: '#e6dfcf', floor: '#fbf3e4', floor2: '#f1e3c8', lane: '#e9dcc2' },
    plant:   { walk: '#cfd3d9', floor: '#e2e5ea', floor2: '#d6dae1', lane: '#c9ced6', hazard: true },
    service: { walk: '#d3dae4', floor: '#e7eef7', floor2: '#dae4f0', lane: '#cfd9e6' },
    outsrc:  { walk: '#d8dfeb', floor: '#f3f7fe', floor2: '#e7eef9', lane: '#dbe3f0' },
    cryo:    { walk: '#cde2ec', floor: '#e2f6ff', floor2: '#cdeefc', lane: '#c4e4f2', frost: true },
    hq:      { walk: '#4a4270', floor: '#2b2456', floor2: '#251f4c', lane: '#352d62', spots: true }
  };
  function themeOf(d) { return THEME[d && d.theme] || THEME.town; }
  var THEME_LOCKED = { walk: '#dcd7ca' };
  var CURB = 3;
  var FENCE_H = 17;
  var RIM_THICK = 14;
  function drawDistrict(d, S) {
    var open = QT.G.roomOpen(d.id), th = open ? themeOf(d) : THEME_LOCKED;
    var x0 = d.ix * TILE, y0 = d.iy * TILE, w = d.iw * TILE, h = d.ih * TILE;
    I.box(ctx, x0, y0, w, h, 0, CURB, th.walk, { left: shade(th.walk, -40), right: shade(th.walk, -22) });
    ctx.strokeStyle = 'rgba(90,80,60,0.12)'; ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (var k = 1; k < d.iw; k++) {
      var a = P(x0 + k * TILE, y0, CURB), b = P(x0 + k * TILE, y0 + TILE, CURB);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      a = P(x0 + k * TILE, y0 + h - TILE, CURB); b = P(x0 + k * TILE, y0 + h, CURB);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      a = P(x0, y0 + k * TILE, CURB); b = P(x0 + TILE, y0 + k * TILE, CURB);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      a = P(x0 + w - TILE, y0 + k * TILE, CURB); b = P(x0 + w, y0 + k * TILE, CURB);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    var ix = x0 + TILE, iy = y0 + TILE, iw = w - 2 * TILE, ih = h - 2 * TILE;
    if (!open) {
      I.facePath(ctx, ix, iy, iw, ih, CURB + 0.1); ctx.fillStyle = '#d8cbb0'; ctx.fill();
      ctx.fillStyle = 'rgba(120,100,70,0.18)';
      for (var g = 0; g < 140; g++) {
        var gx = ix + ((g * 97) % 113) / 113 * iw, gy = iy + ((g * 61) % 127) / 127 * ih;
        var gp = P(gx, gy, CURB + 0.2);
        ctx.fillRect(gp.x - 1.2, gp.y - 0.6, 2.4, 1.2);
      }
      ctx.strokeStyle = 'rgba(120,100,70,0.16)'; ctx.lineWidth = 2.2;
      ctx.beginPath();
      [0.35, 0.42].forEach(function (f) {
        var a1 = P(ix + iw * 0.1, iy + ih * f, CURB + 0.2), b1 = P(ix + iw * 0.9, iy + ih * (f + 0.2), CURB + 0.2);
        ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y);
      });
      ctx.stroke();
      return;
    }
    floorSlab(ix, iy, iw, ih, CURB, th.floor, th.floor2, false);
    I.facePath(ctx, ix, iy, iw, ih, CURB);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = th.lane;
    (d.roads || []).forEach(function (rd) {
      I.facePath(ctx, ix, rd.y * TILE, iw, rd.h * TILE, CURB + 0.1); ctx.fill();
    });
    (d.plots || []).forEach(function (id) {
      var p = W.BY_ID[id];
      if (!p || p.open) return;
      var own = isDeco(p) || (S.p[id] && S.p[id].owned);
      I.facePath(ctx, p.x * TILE - 2, p.y * TILE - 2, p.w * TILE + 4, p.h * TILE + 4, CURB + 0.2);
      ctx.fillStyle = own ? 'rgba(60,50,35,0.07)' : 'rgba(150,125,80,0.12)'; ctx.fill();
    });
    if (th.hazard) {
      ctx.save(); I.facePath(ctx, ix, iy + ih - 6, iw, 6, CURB + 0.3); ctx.clip();
      for (var i = -2; i < iw / 8 + 2; i++) {
        I.facePath(ctx, ix + i * 8, iy + ih - 6, 4, 6, CURB + 0.3); ctx.fillStyle = i % 2 ? '#2f2c46' : '#f5b21c'; ctx.fill();
      }
      ctx.restore();
    }
    if (W.BY_ID.ship && W.BY_ID.ship.room === d.id) drawYard(S);
    [[x0 + 3, y0 + 3], [x0 + w - 11, y0 + 3], [x0 + 3, y0 + h - 11], [x0 + w - 11, y0 + h - 11]].forEach(function (q) {
      I.box(ctx, q[0], q[1], 8, 8, CURB, 3, '#b7cf9a');
      I.box(ctx, q[0] + 1.5, q[1] + 1.5, 5, 5, CURB + 3, 3, '#7fb069');
    });
  }
  var CACHE_MAX = 6, CACHE_PX = 3.9e6, CACHE_ONE = 0.95e6;
  var FT_W = 96, FT_H = 64, FT_PAD = 2;
  var floorCache = {}, cacheFrame = 0, spareCanvas = [], floorBakes = 0;
  function distBounds(d) {
    var x0 = d.ix * TILE, y0 = d.iy * TILE, x1 = (d.ix + d.iw) * TILE, y1 = (d.iy + d.ih) * TILE;
    var top = ey(x0, y0, CURB + 8) - 2, bot = ey(x1, y1, 0) + 3, H8 = CURB + 8;
    var hull = [[ex(x0, y0), ey(x0, y0, H8)], [ex(x1, y0), ey(x1, y0, H8)], [ex(x1, y0), ey(x1, y0, 0)],
                [ex(x1, y1), ey(x1, y1, 0)], [ex(x0, y1), ey(x0, y1, 0)], [ex(x0, y1), ey(x0, y1, H8)]];
    return { x: ex(x0, y1) - 3, y: top, w: ex(x1, y0) - ex(x0, y1) + 6, h: bot - top, hull: hull };
  }
  function rectHitsHull(rx, ry, rw, rh, hull) {
    var m = 3, x0 = rx - m, y0 = ry - m, x1 = rx + rw + m, y1 = ry + rh + m, i, k;
    var cs = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (i = 0; i < hull.length; i++) {
      var a = hull[i], b = hull[(i + 1) % hull.length], nx = a[1] - b[1], ny = b[0] - a[0];
      if (!nx && !ny) continue;
      var pmin = Infinity, pmax = -Infinity, qmin = Infinity, qmax = -Infinity, v;
      for (k = 0; k < hull.length; k++) { v = hull[k][0] * nx + hull[k][1] * ny; if (v < pmin) pmin = v; if (v > pmax) pmax = v; }
      for (k = 0; k < 4; k++) { v = cs[k][0] * nx + cs[k][1] * ny; if (v < qmin) qmin = v; if (v > qmax) qmax = v; }
      if (qmax < pmin || qmin > pmax) return false;
    }
    return true;
  }
  function distSig(d, S) {
    var s = QT.G.roomOpen(d.id) ? 'o' : 'c', ids = d.plots || [];
    for (var i = 0; i < ids.length; i++) s += S.p[ids[i]] && S.p[ids[i]].owned ? '1' : '0';
    return s;
  }
  function freeTiles(e) {
    e.tiles.forEach(function (t) { if (t.cv && spareCanvas.length < 12) spareCanvas.push(t.cv); t.cv = null; });
    e.px = 0;
  }
  function evictFor(px) {
    for (var guard = 0; guard < 12; guard++) {
      var n = 0, tot = px, old = null;
      for (var k in floorCache) {
        var e = floorCache[k];
        n++; tot += e.px;
        if (e.used !== cacheFrame && (!old || e.used < old.used)) old = e;
      }
      if (n <= CACHE_MAX && tot <= CACHE_PX) return;
      if (!old) return;
      freeTiles(old);
      delete floorCache[old.id];
    }
  }
  function floorEntry(d, S) {
    var b = DIST_BOX[d.id];
    var sc = z * Math.min(dpr, 1.5);
    if (b.w * b.h * sc * sc > CACHE_ONE) sc = Math.sqrt(CACHE_ONE / (b.w * b.h));
    var key = sc.toFixed(3), sig = distSig(d, S), e = floorCache[d.id];
    if (!e) {
      var cols = Math.max(1, Math.ceil(b.w / FT_W)), rows = Math.max(1, Math.ceil(b.h / FT_H)), tw = b.w / cols, th = b.h / rows, tiles = [];
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var tx = b.x + i * tw, ty = b.y + j * th;
        if (rectHitsHull(tx, ty, tw, th, b.hull)) tiles.push({ x: tx, y: ty, w: tw, h: th, cv: null });
      }
      e = floorCache[d.id] = { id: d.id, b: b, tiles: tiles, px: 0, key: key, sig: sig, sc: sc, used: cacheFrame };
      evictFor(0);
    } else if (e.key !== key || e.sig !== sig) {
      freeTiles(e);
      e.key = key; e.sig = sig; e.sc = sc;
    }
    e.used = cacheFrame;
    return e;
  }
  function bakeTile(d, S, e, t) {
    var sc = e.sc, cw = Math.ceil(t.w * sc) + FT_PAD * 2, ch = Math.ceil(t.h * sc) + FT_PAD * 2;
    evictFor(cw * ch);
    var cv = spareCanvas.pop() || document.createElement('canvas');
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    var c2 = cv.getContext('2d');
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.clearRect(0, 0, cw, ch);
    c2.setTransform(sc, 0, 0, sc, -t.x * sc + FT_PAD, -t.y * sc + FT_PAD);
    var saved = ctx;
    ctx = c2;
    try { drawDistrict(d, S); }
    catch (err) { console.error('[render] floor ' + d.id, err); }
    finally { ctx = saved; }
    t.cv = cv; e.px += cw * ch; floorBakes++;
  }
  function drawFloor(d, S) {
    var e = floorEntry(d, S), sc = e.sc;
    for (var i = 0; i < e.tiles.length; i++) {
      var t = e.tiles[i];
      if (t.x + t.w < view.x0 || t.x > view.x1 || t.y + t.h < view.y0 || t.y > view.y1) continue;
      if (!t.cv) bakeTile(d, S, e, t);
      ctx.drawImage(t.cv, t.x - FT_PAD / sc, t.y - FT_PAD / sc, t.cv.width / sc, t.cv.height / sc);
    }
  }
  function floorStats() {
    var n = 0, px = 0, nd = 0;
    for (var k in floorCache) { nd++; px += floorCache[k].px; floorCache[k].tiles.forEach(function (t) { if (t.cv) n++; }); }
    return { districts: nd, tiles: n, px: px, bakes: floorBakes };
  }
  function drawLiveDeco(d, S) {
    var th = themeOf(d);
    var x = (d.ix + 1) * TILE, y = (d.iy + 1) * TILE, w = (d.iw - 2) * TILE, h = (d.ih - 2) * TILE;
    if (th.spots) {
      ctx.save();
      I.facePath(ctx, x, y, w, h, CURB + 0.2); ctx.clip();
      var cols = ['rgba(255,80,160,0.22)', 'rgba(80,200,255,0.22)', 'rgba(255,210,60,0.2)', 'rgba(140,90,255,0.22)'];
      for (var k = 0; k < 4; k++) {
        var px = x + w * (0.5 + 0.4 * Math.sin(S.t * (0.4 + k * 0.13) + k * 2));
        var py = y + h * (0.5 + 0.4 * Math.cos(S.t * (0.33 + k * 0.1) + k));
        var c = P(px, py, CURB + 0.3);
        ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.ellipse(c.x, c.y, 54, 28, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    if (th.frost) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (var f = 0; f < 40; f++) {
        var fx = x + ((f * 97 + S.t * 9) % w), fy = y + ((f * 53 + S.t * 14) % h);
        var fc = P(fx, fy, 6 + (f % 5) * 5 + Math.sin(S.t * 2 + f) * 3);
        ctx.fillRect(fc.x - 1, fc.y - 1, 2.2, 2.2);
      }
    }
  }
  var AVE_COL = { walk: '#dcd8cc', walkL: '#b9b4a6', walkR: '#cbc6b9', asphalt: '#8f959d' };
  var AVE_WALKS = [], AVE_LINES = [], AVE_ZEBRA = [];
  function screenBox(x, y, w, h, top) {
    var x0 = x * TILE, y0 = y * TILE, x1 = (x + w) * TILE, y1 = (y + h) * TILE;
    return { x0: ex(x0, y1), x1: ex(x1, y0), y0: ey(x0, y0, top || 0), y1: ey(x1, y1, 0) };
  }
  (function buildAvenues() {
    var lo = W.RIM, hi = W.WORLD_W - W.RIM, A4 = W.AVE;
    var bands = W.ROADS.filter(function (r) { return r.dir === 'v'; }).map(function (r) { return r.x; }).sort(function (a, b) { return a - b; });
    var spans = [], s = lo;
    bands.forEach(function (b) { spans.push([s, b]); s = b + A4; });
    spans.push([s, hi]);
    W.ROADS.forEach(function (r) {
      var v = r.dir === 'v', a = v ? r.x : r.y;
      spans.forEach(function (sp) {
        [a, a + A4 - 1].forEach(function (t) {
          var q = v ? { x: t, y: sp[0], w: 1, h: sp[1] - sp[0] } : { x: sp[0], y: t, w: sp[1] - sp[0], h: 1 };
          q.box = screenBox(q.x, q.y, q.w, q.h, 2);
          AVE_WALKS.push(q);
        });
        var ln = v ? { x: a + A4 / 2, y: sp[0] + 0.6, x2: a + A4 / 2, y2: sp[1] - 0.6 }
                   : { x: sp[0] + 0.6, y: a + A4 / 2, x2: sp[1] - 0.6, y2: a + A4 / 2 };
        ln.box = screenBox(Math.min(ln.x, ln.x2) - 0.5, Math.min(ln.y, ln.y2) - 0.5,
                           Math.abs(ln.x2 - ln.x) + 1, Math.abs(ln.y2 - ln.y) + 1, 1);
        AVE_LINES.push(ln);
      });
    });
    W.BUCKETS.forEach(function (b) {
      if (b.kind !== 'cross') return;
      var x = b.x0, y = b.y0, e = A4 - 1;
      [[x, y], [x + e, y], [x, y + e], [x + e, y + e]].forEach(function (c) {
        AVE_WALKS.push({ x: c[0], y: c[1], w: 1, h: 1, box: screenBox(c[0], c[1], 1, 1, 2) });
      });
      AVE_ZEBRA.push({ c: b.i, box: screenBox(x, y, A4, A4, 1),
        rects: [{ x: x, y: y + 1, w: 1, h: A4 - 2, along: 'y' }, { x: x + e, y: y + 1, w: 1, h: A4 - 2, along: 'y' },
                { x: x + 1, y: y, w: A4 - 2, h: 1, along: 'x' }, { x: x + 1, y: y + e, w: A4 - 2, h: 1, along: 'x' }] });
    });
  })();
  function quadTo(x, y, w, h, lift) {
    ctx.moveTo(ex(x, y), ey(x, y, lift)); ctx.lineTo(ex(x + w, y), ey(x + w, y, lift));
    ctx.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift)); ctx.lineTo(ex(x, y + h), ey(x, y + h, lift)); ctx.closePath();
  }
  function leftTo(x, y, w, h, lift) {
    ctx.moveTo(ex(x, y + h), ey(x, y + h, lift)); ctx.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift));
    ctx.lineTo(ex(x + w, y + h), ey(x + w, y + h, 0)); ctx.lineTo(ex(x, y + h), ey(x, y + h, 0)); ctx.closePath();
  }
  function rightTo(x, y, w, h, lift) {
    ctx.moveTo(ex(x + w, y), ey(x + w, y, lift)); ctx.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift));
    ctx.lineTo(ex(x + w, y + h), ey(x + w, y + h, 0)); ctx.lineTo(ex(x + w, y), ey(x + w, y, 0)); ctx.closePath();
  }
  function drawMapBase() {
    var Wp = W.WORLD_PX_W, Hp = W.WORLD_PX_H;
    I.box(ctx, 0, 0, Wp, Hp, -RIM_THICK, RIM_THICK, '#cfe2bd', { left: '#a99a7c', right: '#bcae90' });
    ctx.fillStyle = AVE_COL.asphalt;
    ctx.beginPath();
    W.ROADS.forEach(function (r) { quadTo(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE, 0); });
    ctx.fill();
  }
  function drawAvenues() {
    var WALK_H = 1.5, list = [], i;
    for (i = 0; i < AVE_WALKS.length; i++) if (boxOnView(AVE_WALKS[i].box)) list.push(AVE_WALKS[i]);
    ctx.fillStyle = AVE_COL.walkL; ctx.beginPath();
    list.forEach(function (q) { leftTo(q.x * TILE, q.y * TILE, q.w * TILE, q.h * TILE, WALK_H); }); ctx.fill();
    ctx.fillStyle = AVE_COL.walkR; ctx.beginPath();
    list.forEach(function (q) { rightTo(q.x * TILE, q.y * TILE, q.w * TILE, q.h * TILE, WALK_H); }); ctx.fill();
    ctx.fillStyle = AVE_COL.walk; ctx.beginPath();
    list.forEach(function (q) { quadTo(q.x * TILE, q.y * TILE, q.w * TILE, q.h * TILE, WALK_H); }); ctx.fill();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4; ctx.setLineDash([9, 8]);
    ctx.beginPath();
    for (i = 0; i < AVE_LINES.length; i++) {
      var ln = AVE_LINES[i];
      if (!boxOnView(ln.box)) continue;
      var a = P(ln.x * TILE, ln.y * TILE, 0.2), b = P(ln.x2 * TILE, ln.y2 * TILE, 0.2);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.beginPath();
    for (i = 0; i < AVE_ZEBRA.length; i++) {
      var zb = AVE_ZEBRA[i];
      if (!boxOnView(zb.box)) continue;
      zb.rects.forEach(function (r) {
        var x0 = r.x * TILE, y0 = r.y * TILE, n = 5;
        for (var k = 0; k < n; k++) {
          if (r.along === 'y') quadTo(x0 + 2, y0 + (k + 0.2) * (r.h * TILE / n), TILE - 4, r.h * TILE / n * 0.55, 0.3);
          else quadTo(x0 + (k + 0.2) * (r.w * TILE / n), y0 + 2, r.w * TILE / n * 0.55, TILE - 4, 0.3);
        }
      });
    }
    ctx.fill();
  }
  L.add({
    distCanOpen: ['開通できます!', 'Ready to open!'],
    distCost: ['開通 ¥{v}', 'Open: ¥{v}'],
    distSoon: ['準備中', 'Coming soon'],
    rsvLabel_bigsight: ['有明の展示場', 'Ariake expo hall'],
    rsvLabel_svc_bay: ['湾岸サービス拠点', 'Bayside service base'],
    rsvLabel_tvst: ['テレビ局', 'TV station'],
    rsvSub_tvst:   ['テレビ出演（フォロワー1万人から）', 'Go on TV (from 10k followers)'],
    distCond_hongo: ['会社を設立すると開通', 'Opens once you found the company'],
    distCond_campus: ['事務所を借りてソフトを1件納めると開く', 'Opens after renting an office and delivering 1 software job'],
    distCond_denki: ['どれかの方式の研究Lv1で開く', 'Opens at R&D Lv1 in any modality'],
    distCond_shinjuku: ['ライバルが現れると開通', 'Opens once a rival appears'],
    distCond_fab: ['研究Lv2＋法人口座で開通', 'Needs R&D Lv2 and a bank account'],
    distCond_inzai: ['工場から初めて出荷すると開通', 'Opens after your first factory shipment'],
    distCond_minato: ['DCが稼働すると開通', 'Opens once your data center is running'],
    distCond_ariake: ['シリーズB かフォロワー5,000で開通', 'Opens at Series B or 5,000 followers']
  });
  function openPadOf(d) {
    var all = QT.G.PADS();
    for (var i = 0; i < all.length; i++) if (all[i].type === 'open' && all[i].district === d) return all[i];
    return null;
  }
  function condText(d) {
    if (d.reqText) return L.nm(d, 'reqText');
    var k = 'distCond_' + d.id, s = L.t(k);
    return s === k ? L.t('distSoon') : s;
  }
  function condOf(d, info) {
    if (info && info.cond) return info.cond;
    var sub = info && info.sub, dsub = L.nm(d, 'sub') || '';
    if (sub && !(dsub && sub.indexOf(dsub) === 0)) return sub;
    return condText(d);
  }
  function signState(d, S) {
    var pad = openPadOf(d), info = pad ? QT.G.padInfo(pad) : null, act = !!pad && QT.G.padActive(pad);
    var cost = info ? info.cost : d.cost, fmt = QT.G.fmt;
    var name = [L.nm(d), C.ink];
    if (act && info && info.can)
      return { lines: [name, [L.t('distCanOpen') + (cost ? '  ¥' + fmt(cost) : ''), '#c98f0f']], col: '#e8a800',
               glow: 0.3 + 0.25 * Math.sin(S.t * 5), ready: true };
    if (act && cost > 0 && S.coins < cost) return { lines: [name, [L.t('distCost', { v: fmt(cost) }), C.red]], col: '#b9b3c8', glow: 0 };
    var l = [name, [condOf(d, info), C.inkSoft]];
    if (cost && !d.noOpen) l.push([L.t('distCost', { v: fmt(cost) }), '#9a94ad']);
    return { lines: l, col: '#b9b3c8', glow: 0 };
  }
  var SIGN_SHIFT = { N: 6, W: 6, S: -6, E: -6 };
  function signsOf(d) {
    return (d.signs || []).map(function (sg) {
      var k = SIGN_SHIFT[sg.side] || 0, along = sg.side === 'N' || sg.side === 'S';
      var lo = (along ? d.ix : d.iy) + 2, hi = (along ? d.ix + d.iw : d.iy + d.ih) - 3;
      var u = Math.max(lo, Math.min(hi, (along ? sg.x : sg.y) + k));
      return { x: along ? u : sg.x, y: along ? sg.y : u, side: sg.side };
    });
  }
  function fenceSegs(d) {
    if (d._fence) return d._fence;
    var out = [], gp = d.gatePad;
    W.FENCE(d).forEach(function (r) {
      var along = r.w > 1, side = along ? (r.y === d.iy ? 'N' : 'S') : (r.x === d.ix ? 'W' : 'E');
      var t0 = along ? r.x : r.y, len = along ? r.w : r.h, cut = -1;
      if (gp) {
        var outside = side === 'N' ? gp.y === r.y - 1 : side === 'S' ? gp.y === r.y + 1
                    : side === 'W' ? gp.x === r.x - 1 : gp.x === r.x + 1;
        var at = along ? gp.x : gp.y;
        if (outside && at >= t0 && at < t0 + len) cut = at;
      }
      var parts = cut < 0 ? [[t0, len, false]]
        : [[t0, Math.max(0, cut - 1 - t0), false], [Math.max(t0, cut - 1), Math.min(3, t0 + len - Math.max(t0, cut - 1)), true],
           [cut + 2, Math.max(0, t0 + len - cut - 2), false]];
      parts.forEach(function (q) {
        if (q[1] <= 0) return;
        var rr2 = along ? { x: q[0], y: r.y, w: q[1], h: 1 } : { x: r.x, y: q[0], w: 1, h: q[1] };
        var signs = signsOf(d).filter(function (sg) {
          var u = along ? sg.x : sg.y;
          return sg.side === side && u >= q[0] && u < q[0] + q[1];
        });
        out.push({ r: rr2, side: side, low: q[2], signs: signs });
      });
    });
    d._fence = out;
    return out;
  }
  function drawFence(e, S) {
    var r = e.r, along = e.side === 'N' || e.side === 'S';
    var x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
    var bx = along ? x : x + TILE / 2 - 1.5, by = along ? y + TILE / 2 - 1.5 : y;
    var bw = along ? w : 3, bh = along ? 3 : h, top = CURB + FENCE_H - 4;
    if (e.low) {
      I.box(ctx, bx, by, bw, bh, CURB, 5, '#f5c230', { left: '#d9a514', right: '#e3ae1a' });
      ctx.save();
      if (along) I.leftFacePath(ctx, bx, by, bw, bh, CURB + 5, CURB); else I.rightFacePath(ctx, bx, by, bw, bh, CURB + 5, CURB);
      ctx.clip();
      ctx.strokeStyle = 'rgba(40,35,50,0.75)'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (var q = -1; q < (along ? r.w : r.h) * 2 + 1; q++) {
        var p1 = along ? P(bx + q * 8, by + bh, CURB) : P(bx + bw, by + q * 8, CURB);
        var p2 = along ? P(bx + q * 8 + 8, by + bh, CURB + 6) : P(bx + bw, by + q * 8 + 8, CURB + 6);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke(); ctx.restore();
      return;
    }
    I.box(ctx, bx, by, bw, bh, CURB, FENCE_H - 4, '#f4f2eb', { left: '#e6e2d6', right: '#dad5c7' });
    I.box(ctx, bx, by, bw, bh, top, 4, '#5cb37f', { left: '#4a9c6b', right: '#53a874' });
    ctx.strokeStyle = 'rgba(80,70,50,0.16)'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (var k = 2; k < (along ? r.w : r.h); k += 2) {
      var a, b;
      if (along) { a = P(bx + k * TILE, by + bh, CURB); b = P(bx + k * TILE, by + bh, top); }
      else { a = P(bx + bw, by + k * TILE, CURB); b = P(bx + bw, by + k * TILE, top); }
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    var d = e.d;
    e.signs.forEach(function (sg) {
      var pk = signPick[d.id];
      if (!pk || pk.x !== sg.x || pk.y !== sg.y || pk.side !== sg.side) return;
      var st = signState(d, S);
      var cx = (sg.x + 0.5) * TILE, cy = (sg.y + 0.5) * TILE;
      I.box(ctx, cx - 9, cy - 1, 2, 2, CURB, FENCE_H + 6, '#8a8296');
      I.box(ctx, cx + 7, cy - 1, 2, 2, CURB, FENCE_H + 6, '#8a8296');
      var sp = P(cx, cy, CURB + FENCE_H + 9);
      var full = st.ready || (nearSign && nearSign.x === sg.x && nearSign.y === sg.y && nearSign.side === sg.side);
      if (full) gateSign(sp.x, sp.y, st.lines, st.col, st.glow, !st.ready);
      else gateSign(sp.x, sp.y, [[L.nm(d), '#7d788f']], '#cfc9db', 0, true);
    });
  }
  var gateRects = [];
  var nearSign = null;
  var signPick = {};
  function gateSign(cx, cy, lines, col, glow, lock) {
    ctx.font = '800 8.5px ' + FONT;
    var w = 0, LK = lock ? 9 : 0;
    lines.forEach(function (l, i) { w = Math.max(w, ctx.measureText(l[0]).width + (i ? 0 : LK)); });
    w += 12;
    var h = 5 + lines.length * 10.5;
    var sl = (cx - w / 2 - 3 - cam.x) * z + cssW / 2, sr = (cx + w / 2 + 3 - cam.x) * z + cssW / 2;
    if (sl < 6) cx += (6 - sl) / z;
    else if (sr > cssW - 6) cx -= (sr - cssW + 6) / z;
    gateRects.push({ l: (cx - w / 2 - 3 - cam.x) * z + cssW / 2, r: (cx + w / 2 + 3 - cam.x) * z + cssW / 2,
                     t: (cy - h - 3 - cam.y) * z + cssH / 2, b: (cy + 3 - cam.y) * z + cssH / 2 });
    if (glow) {
      ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = col;
      rr(ctx, cx - w / 2 - 3, cy - h - 3, w + 6, h + 6, 6); ctx.fill(); ctx.restore();
    }
    fillRR(ctx, cx - w / 2, cy - h, w, h, 4, '#ffffff');
    strokeRR(ctx, cx - w / 2, cy - h, w, h, 4, col, 1.4);
    lines.forEach(function (l, i) {
      txt(ctx, l[0], cx + (i ? 0 : LK / 2), cy - h + 8 + i * 10.5, 8.5, l[1] || C.ink, 'center', 800);
    });
    if (lock) {
      ctx.font = '800 8.5px ' + FONT;
      var lx = cx + LK / 2 - ctx.measureText(lines[0][0]).width / 2 - 7, ly = cy - h + 8;
      ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(lx, ly - 1.4, 1.9, Math.PI, 0); ctx.stroke();
      fillRR(ctx, lx - 2.8, ly - 1.4, 5.6, 4.4, 1, '#b08a2a');
    }
  }
  function icon2d(x0, y0, kind, col, S) {
    ctx.save();
    ctx.translate(x0, y0);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = col; ctx.fillStyle = col;
    switch (kind) {
      case 'stage':
        ctx.fillRect(-7, -7, 14, 14);
        ctx.fillStyle = '#fff'; ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.fillStyle = col;
        for (var k = 0; k < 3; k++) { ctx.fillRect(-10.5, -5 + k * 5, 3, 2); ctx.fillRect(7.5, -5 + k * 5, 3, 2); }
        break;
      case 'feeder':
        rr(ctx, -5, -8, 10, 16, 5); ctx.fill(); ctx.fillRect(-2, -11, 4, 4); break;
      case 'assembly':
        ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-2, -2); ctx.lineTo(7, -7); ctx.stroke();
        ctx.beginPath(); ctx.arc(-8, 8, 3, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(7, -7, 3.5, 0, 7); ctx.fill(); break;
      case 'ship':
        ctx.fillRect(-11, -5, 12, 9);
        ctx.beginPath(); ctx.moveTo(1, -1); ctx.lineTo(8, -1); ctx.lineTo(11, 4); ctx.lineTo(1, 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#4a4560';
        ctx.beginPath(); ctx.arc(-6, 6, 2.8, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(6, 6, 2.8, 0, 7); ctx.fill(); break;
      case 'service':
        ctx.beginPath(); ctx.moveTo(-7, 7); ctx.lineTo(4, -4); ctx.stroke();
        ctx.beginPath(); ctx.arc(6, -6, 4.2, 0.6, 5.4); ctx.stroke(); break;
      case 'dc':
        for (var d = 0; d < 3; d++) {
          ctx.fillStyle = col; ctx.fillRect(-11 + d * 8, -8, 6, 16);
          ctx.fillStyle = '#fff'; ctx.fillRect(-10 + d * 8, -6 + ((Math.floor(S.t * 3) + d) % 3) * 4, 4, 2);
        } break;
      case 'software':
        ctx.beginPath(); ctx.moveTo(-9, 6); ctx.lineTo(-3, -2); ctx.lineTo(2, 2); ctx.lineTo(9, -7); ctx.stroke(); break;
      case 'news':
        ctx.fillRect(-10, -8, 20, 16);
        ctx.fillStyle = 'rgba(80,70,110,0.45)';
        ctx.fillRect(-8, -6, 8, 5);
        for (var n0 = 0; n0 < 3; n0++) ctx.fillRect(-8, 1 + n0 * 3, 8, 1.6);
        for (var n1 = 0; n1 < 5; n1++) ctx.fillRect(1.5, -6 + n1 * 3, 7, 1.6);
        break;
      case 'acct':
        ctx.fillRect(-9, -9, 18, 18);
        ctx.fillStyle = '#fff'; ctx.fillRect(-6.5, -6.5, 13, 5);
        ctx.fillStyle = col;
        for (var a0 = 0; a0 < 3; a0++)
          for (var b0 = 0; b0 < 3; b0++) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-6.5 + b0 * 5, 0 + a0 * 3.2, 3.2, 2.2);
          }
        break;
      case 'corp':
        ctx.fillRect(-9, -6, 8, 15); ctx.fillRect(1, -10, 8, 19);
        ctx.fillStyle = 'rgba(80,70,110,0.45)';
        for (var q0 = 0; q0 < 3; q0++) {
          ctx.fillRect(-7.5, -4 + q0 * 4.5, 5, 2.4);
          ctx.fillRect(2.5, -8 + q0 * 4.5, 5, 2.4);
        } break;
      case 'media':
        ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(-2.5, -4.5); ctx.lineTo(5, 0); ctx.lineTo(-2.5, 4.5); ctx.closePath(); ctx.fill(); break;
      case 'sales':
        ctx.beginPath(); ctx.moveTo(-9, 7); ctx.lineTo(-1, -1); ctx.lineTo(9, -7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(9, -7); ctx.lineTo(4, -7); ctx.moveTo(9, -7); ctx.lineTo(9, -2); ctx.stroke(); break;
      case 'seminar':
        ctx.fillRect(-10, -9, 20, 10);
        ctx.fillStyle = '#fff'; ctx.fillRect(-8, -7, 16 * (0.4 + 0.3 * Math.sin(S.t * 2)), 6);
        ctx.fillStyle = col;
        for (var s2 = 0; s2 < 3; s2++) { ctx.beginPath(); ctx.arc(-6 + s2 * 6, 6, 2.4, 0, 7); ctx.fill(); } break;
      case 'vc':
        ctx.fillRect(-9, -5, 18, 11);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0.5, 3.6, 0, 7); ctx.fill(); break;
      case 'upgrade':
        ctx.beginPath();
        ctx.moveTo(0, -9); ctx.lineTo(7, -1); ctx.lineTo(3, -1); ctx.lineTo(3, 8);
        ctx.lineTo(-3, 8); ctx.lineTo(-3, -1); ctx.lineTo(-7, -1); ctx.closePath(); ctx.fill(); break;
      case 'gate':
        ctx.fillRect(-11, -4, 4, 14); ctx.fillRect(7, -4, 4, 14); ctx.fillRect(-12, -9, 24, 5); break;
      case 'notary':
        ctx.fillRect(-3.5, -9, 7, 9);
        ctx.beginPath(); ctx.arc(0, 4, 5.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(L.get() === 'ja' ? '印' : 'S', 0, 4.5);
        break;
      case 'registry':
        ctx.fillRect(-6, -8, 12, 16);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var r1 = 0; r1 < 3; r1++) { ctx.moveTo(-3.5, -4 + r1 * 4.5); ctx.lineTo(3.5, -4 + r1 * 4.5); }
        ctx.stroke();
        break;
      case 'bank':
        ctx.beginPath(); ctx.moveTo(-11, -3); ctx.lineTo(0, -11); ctx.lineTo(11, -3); ctx.closePath(); ctx.fill();
        ctx.fillRect(-9.5, -1, 3, 10); ctx.fillRect(-1.5, -1, 3, 10); ctx.fillRect(6.5, -1, 3, 10);
        ctx.fillRect(-11, 9, 22, 2.5);
        break;
      case 'qcloud':
        for (var q0 = 0; q0 < 3; q0++) {
          ctx.fillStyle = col; ctx.fillRect(-10 + q0 * 7, -8, 5, 16);
          ctx.fillStyle = '#fff'; ctx.fillRect(-9 + q0 * 7, -6 + ((Math.floor(S.t * 3) + q0) % 3) * 4, 3, 2);
        }
        break;
      case 'staff':
        ctx.beginPath(); ctx.arc(-5, -3, 3.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(5, -3, 3.4, 0, 7); ctx.fill();
        rr(ctx, -9, 2, 8, 7, 3); ctx.fill();
        rr(ctx, 1, 2, 8, 7, 3); ctx.fill();
        break;
      case 'desk':
        ctx.fillRect(-9, -2, 18, 10);
        ctx.fillStyle = '#fff'; ctx.fillRect(-7, 0, 14, 6);
        ctx.strokeStyle = col; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(-2, 1); ctx.lineTo(2, 3); ctx.lineTo(6, -1); ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(-4, -8, 3.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(4, -8, 3.4, 0, 7); ctx.fill();
        break;
    }
    ctx.restore();
  }
  function custPos(p, i) {
    var c = p.counterAt;
    return { x: (p.x + c[0] + 0.6 + i * 1.0) * TILE, y: (p.y + c[1] + 1.5) * TILE };
  }
  function drawStoreBase(p, S) {
    if (!artRunPlot('base', p, [p, S, H])) drawStoreBase0(p, S);
    padRingsOn(p, S);
  }
  function drawStoreBase0(p, S) {
    if (p.kind === 'devdesk' || p.kind === 'hwlab') {
      var lab = p.kind === 'hwlab';
      var ox2 = p.x * TILE, oy2 = p.y * TILE, ow2 = p.w * TILE, oh2 = p.h * TILE;
      I.shadow(ctx, ox2, oy2, ow2, oh2, 0.14);
      I.box(ctx, ox2, oy2, ow2, oh2, 0, 2, '#ffffff');
      floorSlab(ox2 + 1, oy2 + 1, ow2 - 2, oh2 - 2, 2, '#f4f6fb', '#eaeef7', false);
      I.box(ctx, ox2, oy2, ow2, 3, 2, 12, lab ? '#f6e6d6' : '#dfe6f5',
        { top: lab ? '#fdf2e6' : '#eef2fb' });
      I.box(ctx, ox2, oy2 - 1, ow2, 3, 14, 3, lab ? '#ef7d2e' : '#2bb8d8');
      return;
    }
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.16);
    I.box(ctx, x, y, w, h, 0, 2, '#ffffff');
    floorSlab(x + 1, y + 1, w - 2, h - 2, 2, '#f3f7fc', '#e8eff8', false);
    I.box(ctx, x, y, w, 3, 2, H_LOW + 8, '#d9eef9', { top: '#ecf8ff' });
    I.box(ctx, x, y + 3, 3, h - 3, 2, H_LOW + 8, '#d9eef9', { top: '#ecf8ff' });
    I.box(ctx, x, y - 1, w, 3, 2 + H_LOW + 8, 4, '#2fbf7a');
    I.box(ctx, x, y - 1, w, 3, 2 + H_LOW + 12, 3, '#f2a63b');
  }
  function drawFixture(p, i, S) {
    if (artRunPlot('fixture', p, [p, i, S, H])) return;
    if (p.kind === 'devdesk') return drawDeskFixture(p, i, S);
    if (p.kind === 'hwlab') return drawLabFixture(p, i, S);
    var b = p.blocks[i];
    var x = (p.x + b[0]) * TILE, y = (p.y + b[1]) * TILE;
    var w = b[2] * TILE, h = b[3] * TILE;
    var isParcel = p.parcelAt && b[0] === p.parcelAt[0] && b[1] === p.parcelAt[1];
    var isCounter = p.counterAt && b[0] === p.counterAt[0] && b[1] === p.counterAt[1];
    var mAt = brewAtOf(p), isMachine = mAt && b[0] === mAt[0] && b[1] === mAt[1];
    var sv = S.store;
    if (isMachine) return drawBrewFixture(x, y, w, h, S);
    if (isCounter) {
      I.box(ctx, x + 1, y + 3, w - 2, h - 6, 2, 11, '#e8dcc6');
      I.box(ctx, x + 4, y + 4, 9, 5, 13, 6, '#33304a');
      return;
    }
    if (isParcel) {
      I.box(ctx, x + 1, y + 3, w - 2, h - 6, 2, 10, '#b79a76');
      var ready = !S.deliv;
      I.box(ctx, x + 3, y + 4, 6, 4, 12, 6, ready ? '#f2a63b' : '#cbbfae');
      I.box(ctx, x + 3, y + 4, 6, 4, 18, 0.8, ready ? '#fff0d0' : '#ddd4c6');
      I.box(ctx, x + 12, y + 4, 5, 4, 12, 4.5, '#c8a878');
      return;
    }
    I.box(ctx, x + 1, y + 3, w - 2, h - 6, 2, 10, '#cfd8e8');
    var n = Math.round(sv.stock / 100 * (w / TILE));
    for (var c0 = 0; c0 < n; c0++) {
      var col = ['#e2504a', '#f2a63b', '#2fbf7a', '#2bb8d8', '#e2508a'][c0 % 5];
      I.box(ctx, x + 3 + c0 * 5, y + 4, 4, 4, 12, 4, col);
    }
  }
  function brewAtOf(p) { return p.brewAt || p.machineAt || p.coffeeAt || null; }
  function drawBrewFixture(x, y, w, h, S) {
    var cf = S.cafe || {}, TOP = 10;
    I.box(ctx, x + 1, y + 3, w - 2, h - 6, 2, TOP, '#7a4f36');
    I.box(ctx, x + 0.4, y + 2.4, w - 0.8, h - 4.8, 2 + TOP, 1.4, '#a5764f');
    I.box(ctx, x + 3, y + 3.5, 11, 6, 3.4 + TOP, 13, '#d7dbe4');
    I.box(ctx, x + 4, y + 4.5, 9, 3, 16.4 + TOP, 1.2, ((Math.floor(S.t * 2)) % 2) ? '#e2504a' : '#f6c27a');
    var n = Math.min((QT.G.CFG && QT.G.CFG.cupsMax) || 4, cf.cups || 0);
    for (var c = 0; c < n; c++)
      I.box(ctx, x + 18 + (c % 2) * 6, y + 5, 4.5, 3.5, 3.4 + TOP + Math.floor(c / 2) * 5, 4.6, '#ffffff');
  }
  function custCoffee(x, y, has) {
    fillRR(ctx, x - 3, y - 3, 6, 5, 1.4, has ? '#ffffff' : '#f3d2d0');
    ctx.strokeStyle = has ? '#8a5a3c' : '#e2504a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + 3.4, y - 0.6, 1.5, -1.4, 1.4); ctx.stroke();
    fillRR(ctx, x - 2.2, y - 2.4, 4.4, 1.4, 0.6, has ? '#8a5a3c' : '#e2504a');
  }
  function drawDeskFixture(p, i, S) {
    var b = p.blocks[i];
    var x = (p.x + b[0]) * TILE, y = (p.y + b[1]) * TILE;
    var w = b[2] * TILE, h = b[3] * TILE;
    I.box(ctx, x + 1, y + 2, w - 2, h - 4, 2, 9, '#e8dcc6');
    I.box(ctx, x + 4, y + 3, w - 12, 3, 11, 9, '#3a3550');
    var on = QT.G.S.jobs.some(function (j) { return j.kind === 'sw' && j.done < j.work; });
    I.box(ctx, x + 5, y + 3.6, w - 14, 2, 19, 0.5, on ? '#2bb8d8' : '#8a93a8');
    I.box(ctx, x + w - 7, y + 5, 4, 3, 11, 1.5, '#cfd8e8');
  }
  var LAB_SEATS = [{ x: 1, y: 2 }, { x: 4, y: 2 }];
  function staffSeat(p, i) {
    var q = p.kind === 'hwlab' ? LAB_SEATS[i] : p.padsLocal[i];
    return { x: (p.x + q.x + 0.5) * TILE, y: (p.y + q.y + 0.5) * TILE };
  }
  var STAFF_COLS = ['#2bb8d8', '#e2508a', '#f2a63b', '#6f57e0', '#2fbf7a', '#e2504a'];
  function drawStaff(p, i, S) {
    if (artRunPlot('staff', p, [p, i, S, H])) return;
    var lab = p.kind === 'hwlab';
    var q = staffSeat(p, i);
    var s2 = P(q.x, q.y, 2);
    var busy = lab ? QT.G.S.rdLevel() < QT.G.rdCap()
                   : S.jobs.some(function (j) { return j.kind === 'sw' && j.done < j.work; });
    var tap = busy ? Math.abs(Math.sin(S.t * 7 + i)) * 1.4 : 0;
    ctx.fillStyle = 'rgba(60,50,35,0.18)';
    ctx.beginPath(); ctx.ellipse(s2.x, s2.y, 5, 2.2, 0, 0, 7); ctx.fill();
    fillRR(ctx, s2.x - 4.5, s2.y - 7, 9, 6, 2.5, '#8f93a8');
    fillRR(ctx, s2.x - 4, s2.y - 13 - tap, 8, 8, 3,
      lab ? '#f2f4f8' : STAFF_COLS[i % STAFF_COLS.length]);
    if (lab) fillRR(ctx, s2.x - 4, s2.y - 13 - tap, 8, 2.4, 1.2, '#ef7d2e');
    fillRR(ctx, s2.x - 3, s2.y - 19 - tap, 6, 6.5, 2.6, '#ffd9b8');
    if (!busy) txt(ctx, 'zzz', s2.x + 7, s2.y - 19, 8, '#a9a3bb', 'left', 700);
  }
  function drawLabFixture(p, i, S) {
    var b = p.blocks[i];
    var x = (p.x + b[0]) * TILE, y = (p.y + b[1]) * TILE;
    var w = b[2] * TILE, h = b[3] * TILE;
    I.box(ctx, x + 1, y + 2, w - 2, h - 4, 2, 9, '#e5e0d2');
    if (i === 0) {
      for (var k = 0; k < 3; k++) {
        I.box(ctx, x + 4 + k * 12, y + 3, 8, 4, 11, 10, '#5c5470');
        I.box(ctx, x + 5 + k * 12, y + 4, 6, 2, 21, 0.6,
          ((Math.floor(S.t * 3) + k) % 3) ? '#ef7d2e' : '#f6c27a');
      }
    } else {
      I.box(ctx, x + 5, y + 3, 8, 4, 11, 3, '#2bb8d8');
      I.box(ctx, x + 7, y + 4, 4, 2, 14, 1.2, '#ffffff');
    }
  }
  var CUST_COLS = ['#e2504a', '#2bb8d8', '#6f57e0', '#2fbf7a', '#e2508a'];
  var HAIR = ['#3a2a1f', '#8a5a3c', '#f2c96b', '#e2508a', '#2b2b2b', '#7fd6ff'];
  function drawCustomer(p, i, cu, S) {
    var q = custPos(p, i);
    var s2 = P(q.x, q.y, 2);
    var seed = cu.k, wait = QT.G.CFG.custWait;
    var left = 1 - cu.t / wait;
    var bounce = left < 0.3 ? Math.abs(Math.sin(S.t * 14 + seed * 9)) * 2.2
               : Math.abs(Math.sin(S.t * 3 + seed * 9)) * 0.9;
    ctx.fillStyle = 'rgba(60,50,35,0.2)';
    ctx.beginPath(); ctx.ellipse(s2.x, s2.y, 5, 2.2, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(s2.x, s2.y - bounce);
    fillRR(ctx, -4, -11, 8, 8.5, 3, CUST_COLS[Math.floor(seed * 5) % 5]);
    fillRR(ctx, -3, -17.5, 6, 7, 2.6, '#ffd9b8');
    var hair = HAIR[Math.floor(seed * 37) % HAIR.length], style = Math.floor(seed * 91) % 4;
    ctx.fillStyle = hair;
    if (style === 0) { ctx.beginPath(); ctx.arc(0, -16.5, 3.4, Math.PI, 0); ctx.fill(); }
    else if (style === 1) { ctx.beginPath(); ctx.arc(0, -16.5, 3.4, Math.PI, 0); ctx.fill(); ctx.fillRect(-3.6, -16.5, 1.6, 5); ctx.fillRect(2, -16.5, 1.6, 5); }
    else if (style === 2) { ctx.fillRect(-4, -19.5, 8, 2); ctx.fillRect(-2.6, -21.5, 5.2, 2.4); }
    else { ctx.beginPath(); ctx.arc(0, -17, 3.6, Math.PI * 1.05, -0.05); ctx.fill(); ctx.beginPath(); ctx.arc(2.8, -19.5, 1.6, 0, 7); ctx.fill(); }
    if (Math.floor(seed * 13) % 3 === 0) {
      ctx.strokeStyle = '#2a1a40'; ctx.lineWidth = 0.7;
      ctx.strokeRect(-2.6, -15.4, 2, 1.5); ctx.strokeRect(0.6, -15.4, 2, 1.5);
    }
    ctx.restore();
    if (cu.coffee) custCoffee(s2.x - 6, s2.y - 23 - bounce, !!(S.cafe && S.cafe.cups > 0));
    var mx = s2.x + 5, my = s2.y - 24 - bounce;
    if (left > 0.7) {
      ctx.fillStyle = '#ff5a8a';
      ctx.beginPath(); ctx.arc(mx - 1.3, my, 1.6, 0, 7); ctx.arc(mx + 1.3, my, 1.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(mx - 2.8, my + 0.5); ctx.lineTo(mx, my + 3.6); ctx.lineTo(mx + 2.8, my + 0.5); ctx.fill();
    } else if (left > 0.3) {
      ctx.fillStyle = '#7fd6ff';
      ctx.beginPath(); ctx.arc(mx, my + 1, 1.7, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(mx - 1.5, my + 0.6); ctx.lineTo(mx, my - 2.5); ctx.lineTo(mx + 1.5, my + 0.6); ctx.fill();
    } else {
      ctx.strokeStyle = '#e2504a'; ctx.lineWidth = 1.3;
      var a0 = 1.6 + Math.sin(S.t * 10) * 0.4;
      ctx.beginPath();
      ctx.moveTo(mx - a0, my - 2.5); ctx.lineTo(mx - a0, my - 0.5); ctx.lineTo(mx - 2.5, my - 0.5);
      ctx.moveTo(mx + a0, my - 2.5); ctx.lineTo(mx + a0, my - 0.5); ctx.lineTo(mx + 2.5, my - 0.5);
      ctx.moveTo(mx - a0, my + 2.5); ctx.lineTo(mx - a0, my + 0.5); ctx.lineTo(mx - 2.5, my + 0.5);
      ctx.moveTo(mx + a0, my + 2.5); ctx.lineTo(mx + a0, my + 0.5); ctx.lineTo(mx + 2.5, my + 0.5);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(s2.x - 4.5, s2.y - 22 - bounce, 9, 2.4);
    ctx.fillStyle = left < 0.3 ? '#e2504a' : '#2fbf7a';
    ctx.fillRect(s2.x - 4, s2.y - 21.6 - bounce, 8 * Math.max(0, left), 1.6);
  }
  function drawSmallOffice(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var col = p.color;
    var done = p.kind === 'notary' ? S.co.certified : S.co.founded;
    I.shadow(ctx, x, y, w, h, 0.16);
    I.box(ctx, x, y, w, h, 0, 2, '#ffffff');
    I.box(ctx, x + 2, y + 2, w - 4, h - 8, 2, 17, '#f0f2f8');
    I.box(ctx, x + 1, y + 1, w - 2, h - 6, 19, 3.5, col);
    I.box(ctx, x + w / 2 - 4, y + h - 8, 8, 3, 2, 9, '#e8dcc6');
    I.box(ctx, x + w - 8, y + 3, 4, 3, 22.5, 2, done ? '#2fbf7a' : '#d9d2e4');
    var c = P(x + w / 2, y + h * 0.4, 22.5);
    icon2d(c.x, c.y, p.kind, shade(col, -46), S);
  }
  function drawBank(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, '#f2f8f4', null, false);
    I.box(ctx, x + 3, y + 3, w - 6, h * 0.5, 3, H_PLOT + 8, '#eef4f0');
    for (var i = 0; i < 5; i++)
      I.box(ctx, x + 5 + i * ((w - 14) / 4), y + h * 0.5 + 2, 3.5, 3.5, 3, H_PLOT + 2, '#ffffff');
    I.box(ctx, x + 2, y + 2, w - 4, h * 0.5 + 2, 3 + H_PLOT + 8, 5, '#2fbf7a');
    I.box(ctx, x + 6, y + 1, w - 12, 3, 3 + H_PLOT + 13, 3.5, '#26a066');
    I.box(ctx, x + w / 2 - 6, y + h - 10, 12, 4, 3, 10, '#e8dcc6');
    I.box(ctx, x + w / 2 - 8, y + h - 6, 16, 3, 3, 1.5, '#dfe6e2');
    var c = P(x + w / 2, y + h * 0.32, 3 + H_PLOT + 10);
    icon2d(c.x, c.y, 'bank', '#1f8f5a', S);
    if (S.co.bank) {
      var lc = P(x + w - 7, y + 5, 3 + H_PLOT + 16);
      ctx.fillStyle = '#2fbf7a';
      ctx.beginPath(); ctx.arc(lc.x, lc.y, 4, 0, 7); ctx.fill();
    }
  }
  function drawQCloud(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var lv = QT.G.S.qcLv();
    I.shadow(ctx, x, y, w, h, 0.2);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, '#f1eefc', null, false);
    var cx0 = x + w / 2 - 5, cy0 = y + h / 2 - 5;
    var tiers = 2 + lv;
    for (var i = 0; i < tiers; i++) {
      var ww = 12 - i * 1.1;
      I.box(ctx, cx0 + (10 - ww) / 2 - 5 + 5, cy0 + (10 - ww) / 2, ww, ww, 3 + i * 5, 3.4,
        i === tiers - 1 ? '#6f57e0' : '#cfc6f5');
    }
    for (var r0 = 0; r0 < 3; r0++) {
      var rx = x + 5 + r0 * 7;
      I.box(ctx, rx, y + h - 12, 5, 8, 3, 12, '#5c5470');
      for (var b0 = 0; b0 < 3; b0++) {
        var on = ((Math.floor(S.t * 3) + r0 + b0) % 4) < lv;
        I.box(ctx, rx + 1, y + h - 11 + b0 * 2.2, 3, 1.2, 6 + b0 * 3, 0.6, on ? '#8f7fe8' : '#3f3a55');
      }
    }
    var dc = QT.G.S.dc;
    for (var d0 = 0; d0 < Math.min(8, dc.length); d0++) {
      var dx = x + 4 + (d0 % 4) * 5, dy = y + 3 + Math.floor(d0 / 4) * 4;
      I.box(ctx, dx, dy, 3.6, 3, 3, 8 + (d0 % 2), '#8f7fe8');
      I.box(ctx, dx, dy, 3.6, 3, 11 + (d0 % 2), 1, '#f5b21c');
    }
    for (var l0 = 0; l0 < 6; l0++)
      I.box(ctx, x + w - 12 + (l0 % 3) * 3.5, y + 3 + Math.floor(l0 / 3) * 3, 2.5, 2,
        3 + 4, 1.2, l0 < lv ? '#f5b21c' : '#ddd8ea');
  }
  function drawYard(S) {
    var sp = W.BY_ID.ship, dk = W.DOCK;
    if (!sp || !S.p.ship || !S.p.ship.owned) return;
    var x = (sp.x - 1) * TILE, y = (sp.y + sp.h) * TILE;
    var w = (sp.w + 2) * TILE, h = 7 * TILE;
    I.box(ctx, x, y, w, h, 4, 0.6, '#9aa0a6');
    var b = dk.bay;
    ctx.save();
    I.facePath(ctx, b.x, b.y, b.w, b.h, 4.6);
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    I.box(ctx, b.x + 2, b.y + b.h - 2, b.w - 4, 1.6, 4.6, 0.3, '#f5b21c');
    ctx.save();
    ctx.globalAlpha = 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8;
    for (var a = 0; a < 3; a++) {
      var ax = x + w - 14 - a * 16, ay = dk.laneY;
      var p0 = P(ax + 5, ay - 4, 4.6), p1 = P(ax, ay, 4.6), p2 = P(ax + 5, ay + 4, 4.6);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    ctx.restore();
  }
  function truckPos(S) {
    var tk = S.truck, dk = W.DOCK;
    if (!tk || tk.state === 'away') return null;
    switch (tk.state) {
      case 'arrive': return { x: dk.inX + (dk.bayX - dk.inX) * tk.k, y: dk.laneY, axis: 'x' };
      case 'back':   return { x: dk.bayX, y: dk.laneY + (dk.bayY - dk.laneY) * tk.k, axis: 'y' };
      case 'dock':   return { x: dk.bayX, y: dk.bayY, axis: 'y' };
      case 'pull':   return { x: dk.bayX, y: dk.bayY + (dk.laneY - dk.bayY) * tk.k, axis: 'y' };
      case 'leave':  return { x: dk.bayX + (dk.outX - dk.bayX) * tk.k, y: dk.laneY, axis: 'x' };
    }
    return null;
  }
  function truckBox(t) {
    return t.axis === 'y' ? { x: t.x - 9, y: t.y - 27, w: 18, h: 54 }
                          : { x: t.x - 27, y: t.y - 9, w: 54, h: 18 };
  }
  function drawTruck(S) {
    var t = truckPos(S), tk = S.truck;
    if (!t) return;
    var LEN = 52, WID = 17, CAB = 15;
    var vert = t.axis === 'y';
    var x = t.x - (vert ? WID : LEN) / 2, y = t.y - (vert ? LEN : WID) / 2;
    var bx = x, by = y;
    var bw = vert ? WID : LEN - CAB, bh = vert ? LEN - CAB : WID;
    I.shadow(ctx, x + 1, y + 1, (vert ? WID : LEN) - 2, (vert ? LEN : WID) - 2, 0.16);
    I.box(ctx, bx, by, bw, bh, 1.5, 24, '#f4f6fb', { top: '#ffffff' });
    I.box(ctx, bx, by, bw, bh, 25.5, 2.4, '#2bb8d8');
    if (vert) {
      I.box(ctx, x + 1.2, y + LEN - CAB + 1, WID - 2.4, CAB - 2, 1.5, 17, '#2bb8d8');
      I.box(ctx, x + 2, y + LEN - 6, WID - 4, 5, 12, 5, '#cfeaf6');
    } else {
      I.box(ctx, x + LEN - CAB + 1, y + 1.2, CAB - 2, WID - 2.4, 1.5, 17, '#2bb8d8');
      I.box(ctx, x + LEN - CAB + 2, y + 2, 5, WID - 4, 12, 5, '#cfeaf6');
    }
    var wheels = vert ? [[-1, 5], [WID - 2, 5], [-1, LEN - 13], [WID - 2, LEN - 13]]
                      : [[5, -1], [5, WID - 2], [LEN - 13, -1], [LEN - 13, WID - 2]];
    wheels.forEach(function (o) {
      I.box(ctx, x + o[0], y + o[1], vert ? 3 : 5.5, vert ? 5.5 : 3, 0, 4.5, '#3a3550');
    });
    if (tk.state === 'dock') {
      I.box(ctx, bx + 1, by - 2.5, bw - 2, 3, 1.5, 1.2, '#c9d2e0');
      I.box(ctx, bx - 1, by, 2.5, bh * 0.45, 3, 20, '#dfe6f2');
      I.box(ctx, bx + bw - 1.5, by, 2.5, bh * 0.45, 3, 20, '#dfe6f2');
      for (var i = 0; i < Math.min(6, tk.load || 0); i++)
        I.box(ctx, bx + 3 + (i % 2) * 6, by + 4 + Math.floor(i / 2) * 7, 5, 5, 2, 5, '#f2a63b');
    }
    if ((tk.state === 'dock' || tk.state === 'back') && Math.floor(S.t * 3) % 2 === 0) {
      var c = vert ? P(t.x, by - 1, 13) : P(bx - 1, t.y, 13);
      ctx.fillStyle = tk.state === 'back' ? '#ffffff' : '#f5b21c';
      ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, 7); ctx.fill();
    }
  }
  var DOCK_H = 12;
  function drawDock(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var lv = S.p.ship.level;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x + 1, y + 1, w - 2, h - 2, 0, DOCK_H, '#ddd8cc', { top: '#efebe0' });
    I.box(ctx, x + 1, y + 1, w - 2, 2.5, DOCK_H, 20, '#eef1f7', { top: '#f8fafd' });
    I.box(ctx, x, y, w, 3.5, DOCK_H + 20, 3.5, '#2fbf7a');
    var doors = Math.min(3, 1 + Math.floor(lv / 2));
    var pitch = (w - 10) / doors;
    for (var d = 0; d < doors; d++) {
      var dx = x + 5 + d * pitch + pitch * 0.12, dw2 = pitch * 0.76;
      I.box(ctx, dx, y + 1.2, dw2, 1.2, DOCK_H, 15, '#8f96a8');
      for (var s = 0; s < 3; s++)
        I.box(ctx, dx, y + 1.2, dw2, 1.2, DOCK_H + 3 + s * 4, 1.2, '#c3c9d6');
    }
    ctx.save();
    I.facePath(ctx, x + 1, y + h - 4, w - 2, 3, DOCK_H);
    ctx.fillStyle = '#f5b21c'; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = '#3a3550'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (var i = -30; i < w + 30; i += 8) {
      var a = P(x + i, y + h - 4, DOCK_H), b = P(x + i + 10, y + h - 1, DOCK_H);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke(); ctx.restore();
    I.box(ctx, x + 8, y + h - 1.5, 7, 1.5, DOCK_H - 7, 6, '#3a3550');
    I.box(ctx, x + w - 15, y + h - 1.5, 7, 1.5, DOCK_H - 7, 6, '#3a3550');
    var wait = Math.min(4, S.player.carry.length);
    for (var q = 0; q < wait; q++)
      I.box(ctx, x + 7 + q * 9, y + 5.5, 6, 5, DOCK_H, 5, '#f2a63b');
  }
  function drawVC(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    I.box(ctx, x + 3, y + 3, w - 10, h - 12, 3, H_PLOT + 22, '#e6e2fb');
    for (var f = 0; f < 5; f++)
      I.box(ctx, x + 4, y + 4, w - 12, h - 14, 3 + 8 + f * 8, 1.6, '#8f7fe8');
    I.box(ctx, x + w - 9, y + 4, 6, h - 12, 3, H_PLOT, '#f0eefb');
    I.box(ctx, x + 2, y + 2, w - 8, h - 10, 3 + H_PLOT + 22, 3.5, '#6f57e0');
    I.box(ctx, x + 5, y + h - 9, w - 14, 4, 3, 8, '#e8dcc6');
    var c = P(x + (w - 6) / 2, y + h * 0.35, 3 + H_PLOT + 26);
    icon2d(c.x, c.y, 'vc', '#4a37b8', S);
    for (var r0 = 0; r0 < S.rounds; r0++)
      I.box(ctx, x + 4 + r0 * 4, y + 1, 2.5, 2, 3 + H_PLOT + 26, 4, '#f5b21c');
  }
  function drawCorp(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var col = p.color || C.violet;
    var c0 = (QT.G.S.corps && QT.G.S.corps[p.id]) || { rel: 0, jobs: 0 };
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, '#f2f4fa', null, false);
    I.box(ctx, x + 3, y + h - 12, w - 8, 9, 3, H_PLOT - 6, '#f7f7fc');
    I.box(ctx, x + 6, y + h - 8, w - 18, 3.5, 3, 8, '#e8dcc6');
    var bh = H_PLOT + 14 + Math.min(20, c0.rel * 2);
    I.box(ctx, x + 4, y + 3, w - 12, h - 15, 3, bh, I.shade(col, 26));
    I.box(ctx, x + 5, y + 4, w - 14, h - 17, 3 + bh * 0.55, 2.4, '#ffffff');
    I.box(ctx, x + 3, y + 2, w - 10, h - 13, 3 + bh, 3.5, col);
    var c = P(x + (w - 10) / 2, y + (h - 13) / 2, 3 + bh + 5);
    icon2d(c.x, c.y, p.news ? 'news' : 'corp', '#ffffff', S);
    for (var i = 0; i < 5; i++)
      I.box(ctx, x + 5 + i * 4, y + h - 3.5, 2.6, 2, 3, 3.5,
            c0.rel >= (i + 1) * 2 ? '#2fbf7a' : '#d8d6e4');
  }
  function drawExchange(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var gold = '#e8a800', ok = QT.G.S.canIPO();
    I.shadow(ctx, x, y, w, h, 0.2);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, '#f6f2e6', null, false);
    for (var s0 = 0; s0 < 4; s0++)
      I.box(ctx, x + 12 + s0 * 4, y + h - 17 + s0 * 2, w - 24 - s0 * 8, 3.2, 3 + s0 * 2.5, 2.5, '#efeade');
    var base = 13, bh = H_PLOT + 26;
    I.box(ctx, x + 9, y + 7, w - 26, h - 28, base, bh, '#fbfaf4');
    for (var i = 0; i < 7; i++)
      I.box(ctx, x + 12 + i * ((w - 34) / 7), y + h - 24, 3.2, 3.2, base, bh - 8, '#ffffff');
    I.box(ctx, x + 7, y + 5, w - 22, h - 24, base + bh, 4, gold);
    I.box(ctx, x + 15, y + 11, w - 38, h - 36, base + bh + 4, 12, '#fbfaf4');
    I.box(ctx, x + 13, y + 10, w - 34, h - 34, base + bh + 16, 3, gold);
    var tw2 = 10;
    I.box(ctx, x + (w - tw2) / 2, y + (h - 26) / 2 + 2, tw2, 5, base + bh + 19, 16, '#fbfaf4');
    I.box(ctx, x + (w - tw2) / 2 - 1, y + (h - 26) / 2 + 1, tw2 + 2, 7, base + bh + 35, 3.5, gold);
    I.box(ctx, x + w / 2 - 1, y + (h - 26) / 2 + 3, 2, 2, base + bh + 38, 9, gold);
    var bx = x + 10, by = y + h - 19;
    I.box(ctx, bx, by, 3, 4, 3, 20, '#cfcabb');
    I.box(ctx, bx - 0.5, by - 0.5, 22, 5, 23, 12, '#2b2740');
    for (var t = 0; t < 5; t++) {
      var on = (Math.floor(S.t * 2) + t) % 3 !== 2;
      I.box(ctx, bx + 1 + t * 4, by + 0.5, 3, 4, 26 + (t % 2) * 3, 1.6, on ? '#2fbf7a' : '#e2504a');
    }
    for (var f = 0; f < 3; f++) {
      var fx = x + w - 20 + f * 6;
      I.box(ctx, fx, y + h - 20, 1.4, 1.4, 3, 24, '#cfcabb');
      I.box(ctx, fx, y + h - 20, 5, 1.4, 23, 3.2, f === 1 ? gold : '#ffffff');
    }
    var c = P(x + w / 2 - 4, y + (h - 26) / 2 + 4, base + bh + 26);
    icon2d(c.x, c.y, 'gate', ok ? gold : '#b9b3c8', S);
    if (ok) {
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.22 * Math.sin(S.t * 3);
      I.facePath(ctx, x + 7, y + 5, w - 22, h - 24, base + bh + 4);
      ctx.fillStyle = gold; ctx.fill();
      ctx.restore();
    }
  }
  function drawLease(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var on = QT.G.S.p.office.owned;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, on ? '#fdf3e2' : '#f2f1f6', null, false);
    I.box(ctx, x + 3, y + 3, w - 6, h - 8, 3, H_PLOT + 6, on ? '#fbf6ea' : '#f0eef4');
    for (var i = 0; i < 3; i++)
      I.box(ctx, x + 5 + i * ((w - 12) / 3), y + h - 9, 3.4, 3.4, 3 + 8, 6,
            on ? '#cfeaf6' : '#e2e0ea');
    I.box(ctx, x + 2, y + 2, w - 4, h - 6, 3 + H_PLOT + 6, 3.5, on ? '#f2a63b' : '#b9b3c8');
    I.box(ctx, x + w / 2 - 3, y + h - 6, 6, 3, 3, 8, '#e8dcc6');
    if (!on) {
      I.box(ctx, x + w - 7, y + 3, 1.4, 1.4, 3, 14, '#cfcabb');
      I.box(ctx, x + w - 9, y + 3, 6, 1.4, 13, 5, '#ffffff');
    }
  }
  function drawHouse(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 2, '#ffffff');
    floorSlab(x + 1, y + 1, w - 2, h - 2, 2, '#dfe7d6', '#d6e0cb', false);
    var bx = x + 3, by = y + 2, bw = w - 10, bh = h - 12;
    I.box(ctx, bx, by, bw, bh, 2, H_PLOT - 2, p.color);
    for (var r0 = 0; r0 < 4; r0++)
      I.box(ctx, bx - 3 + r0 * 2.2, by - 3 + r0 * 1.6, bw + 6 - r0 * 4.4, bh + 6 - r0 * 3.2,
        2 + H_PLOT - 2 + r0 * 3, 3.2, r0 ? shade(p.roof, -r0 * 5) : p.roof);
    I.box(ctx, bx + 3, by + bh - 1, 6, 1.5, 2 + 5, 6, '#fdf3d8');
    I.box(ctx, bx + bw - 11, by + bh - 1, 6, 1.5, 2 + 5, 6, '#fdf3d8');
    I.box(ctx, bx + bw / 2 - 3, by + bh - 1, 6, 1.5, 2, 8, '#8a6a3c');
    var bal = S.loans[p.id] || 0, mx = QT.G.loanMax(p.id);
    var lit = Math.min(3, Math.ceil(bal / Math.max(1, mx) * 3));
    for (var i = 0; i < 3; i++)
      I.box(ctx, bx + bw / 2 - 7 + i * 6, by + bh + 1, 3, 2, 9, 3.5,
        i < lit ? '#e2504a' : '#efe7d6');
    I.box(ctx, x + 2, y + h - 6, 4, 4, 2, 4, '#7fb069');
    I.box(ctx, x + w - 7, y + h - 6, 4, 4, 2, 4, '#7fb069');
    for (var s0 = 0; s0 < 3; s0++)
      I.box(ctx, x + w / 2 - 2, y + h - 4 - s0 * 3.5, 4, 2.4, 2, 0.4, '#cfc7b4');
  }
  function drawBuilding(p, st, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var col = p.color || (p.domain ? W.DOMAINS[p.domain].color : C.violet);
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x + 1, y + 1, w - 2, h - 2, 0, H_PLOT, '#ffffff');
    I.box(ctx, x + 1, y + 1, w - 2, h - 2, H_PLOT, 3, col);
    if (p.out) {
      ctx.save();
      I.facePath(ctx, x + 1, y + 1, w - 2, h - 2, H_PLOT + 3); ctx.clip();
      ctx.globalAlpha = 0.3; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
      ctx.beginPath();
      for (var i = -40; i < 90; i += 9) {
        var a = P(x + i, y, H_PLOT + 3), b = P(x + i + 40, y + h, H_PLOT + 3);
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      }
      ctx.stroke(); ctx.restore();
    }
    var c = P(x + w / 2, y + h / 2, H_PLOT + 3);
    icon2d(c.x, c.y, p.kind, shade(col, -46), S);
    if (p.kind === 'stage' || p.kind === 'assembly') {
      var b0 = P(x + 7, y + h - 5, H_PLOT + 3), b1 = P(x + w - 7, y + h - 5, H_PLOT + 3);
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke();
      if (st.prog > 0) {
        var k = Math.min(1, st.prog);
        ctx.strokeStyle = shade(col, -34); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(b0.x + (b1.x - b0.x) * k, b0.y + (b1.y - b0.y) * k); ctx.stroke();
      }
    }
    if (p.kind === 'helium' && typeof S.heMax === 'function') {
      var hc = P(x + w / 2, y + h / 2, H_PLOT + 3);
      var ratio = Math.max(0, Math.min(1, S.he / S.heMax()));
      fillRR(ctx, hc.x - 7, hc.y - 12, 14, 24, 6, '#eef4ee');
      ctx.save(); rr(ctx, hc.x - 7, hc.y - 12, 14, 24, 6); ctx.clip();
      ctx.fillStyle = S.he <= 0 ? C.red : C.green;
      ctx.fillRect(hc.x - 7, hc.y + 12 - 24 * ratio, 14, 24 * ratio);
      ctx.restore();
      strokeRR(ctx, hc.x - 7, hc.y - 12, 14, 24, 6, 'rgba(90,75,55,0.25)', 1);
    }
    if ((p.kind === 'service' && S.pendSvc >= 1) || (p.kind === 'qcloud' && S.pendDc >= 1)) {
      var mc = P(x + w - 8, y + 8, H_PLOT + 15 + Math.sin(S.t * 5) * 2);
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(mc.x, mc.y, 6, 0, 7); ctx.fill();
      txt(ctx, '¥', mc.x, mc.y + 0.5, 8, '#fff', 'center', 800);
    }
  }
  function isDeco(p) { return !!p && (p.kind === 'deco' || p.deco === true || typeof p.deco === 'string'); }
  var DECO_ALIAS = {
    tower: 'tower', highrise: 'tower', skyscraper: 'tower', office: 'office', building: 'office', biz: 'office', bldg: 'office',
    shop: 'shop', shops: 'shop', store: 'shop', retail: 'shop', shotengai: 'shop',
    apartment: 'apartment', apt: 'apartment', mansion: 'apartment', flat: 'apartment', condo: 'apartment',
    house: 'house', home: 'house', houses: 'house', wood: 'house', residential: 'house',
    shrine: 'shrine', temple: 'shrine', jinja: 'shrine', park: 'park', garden: 'park', green: 'park', trees: 'park', plaza: 'park',
    denki: 'denki', electric: 'denki', neon: 'denki', arcade: 'denki',
    warehouse: 'warehouse', factory: 'warehouse', depot: 'warehouse', storage: 'warehouse', port: 'warehouse',
    campus: 'campus', lab: 'campus', univ: 'campus', school: 'campus',
    office_tower: 'tower', hotel: 'tower', old_bldg: 'office', dept_store: 'office', works: 'warehouse', gas_tank: 'warehouse',
    akiba_bldg: 'denki', akiba_shop: 'denki', shita_shop: 'shop', shita_house: 'house', museum: 'campus',
    woods: 'park', farm: 'park', parking: 'park',
    dc_shed: 'dc', dc: 'dc', datacenter: 'dc'
  };
  var DECO_BY = {
    futako: ['house', 'apartment', 'shop', 'park'], shibuya: ['shop', 'office', 'shop', 'tower'],
    otemachi: ['tower', 'office', 'tower'], hongo: ['campus', 'shop', 'denki', 'house'],
    inzai: ['dc', 'warehouse', 'park'], fab: ['warehouse', 'warehouse', 'office'],
    ariake: ['warehouse', 'park', 'tower'], shinjuku: ['tower', 'tower', 'office'],
    minato: ['tower', 'office', 'warehouse', 'park']
  };
  var DECO_PAL = {
    tower: ['#9fb6d6', '#a9a6cf', '#8fc2c8', '#b9c3cf'], office: ['#e9e2d4', '#d9dfe9', '#efe6da', '#d5d9cf'],
    shop: ['#f7c8a0', '#f3a7a0', '#f6dc8e', '#a8d8c8', '#c9b8ef'], apartment: ['#f1eadf', '#e6efe9', '#f3e2d6', '#e2e6f2'],
    house: ['#f4e3c4', '#e9d5bf', '#f1ead8'], denki: ['#f4f1ea', '#e9eef6', '#f6e9e4'],
    warehouse: ['#c8ccd3', '#d6cbb7', '#b9c6c9'], campus: ['#c9785a', '#b9694f', '#d18c6c'],
    dc: ['#f4f6f8', '#eef1f4', '#f7f7f4']
  };
  function decoHash(id) { var h = 7; id = String(id); for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff; return h; }
  function decoStyle(p) {
    if (p._ds) return p._ds;
    var raw = String(p.style || p.look || (typeof p.deco === 'string' ? p.deco : '') || p.variant || '').toLowerCase();
    var st = DECO_ALIAS[raw];
    if (!st) {
      var d = W.DIST[p.room], list = DECO_BY[p.room] || DECO_BY[d && d.theme] || DECO_BY.shibuya;
      st = list[decoHash(p.id) % list.length];
      if (p.w * p.h <= 2 && (st === 'tower' || st === 'campus')) st = 'shop';
      if (st === 'shrine' && (p.w < 3 || p.h < 3)) st = 'house';
    }
    return (p._ds = st);
  }
  function decoHeight(p) {
    var st = decoStyle(p), k = decoHash(p.id), a = Math.min(p.w, p.h);
    if (st === 'tower') return 64 + (k % 5) * 12 + Math.min(24, a * 4);
    if (st === 'office') return 34 + (k % 4) * 6;
    if (st === 'apartment') return 30 + (k % 3) * 8;
    if (st === 'denki') return 36 + (k % 4) * 7;
    if (st === 'campus') return 30 + (k % 2) * 8;
    if (st === 'warehouse') return 18 + (k % 2) * 4;
    if (st === 'dc') return 24 + (k % 2) * 4;
    if (st === 'shop') return 18 + (k % 3) * 4;
    if (st === 'house') return 22;
    if (st === 'shrine') return 24;
    return 6;
  }
  function decoPick(p, st) { var pal = DECO_PAL[st] || DECO_PAL.office; return pal[(decoHash(p.id) >> 3) % pal.length]; }
  function faceBands(x, y, w, h, lo, hi, step, th, col) {
    ctx.fillStyle = col;
    for (var b = lo; b + th <= hi; b += step) {
      I.leftFacePath(ctx, x, y, w, h, b + th, b); ctx.fill();
      I.rightFacePath(ctx, x, y, w, h, b + th, b); ctx.fill();
    }
  }
  function decoTree(wx, wy, base, k) {
    var c = P(wx, wy, base);
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(c.x - 0.8, c.y - 6, 1.6, 6);
    ctx.fillStyle = k % 2 ? '#6fae5c' : '#7fbf69';
    ctx.beginPath(); ctx.arc(c.x, c.y - 9, 5.2, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.arc(c.x - 1.6, c.y - 10.6, 2, 0, 7); ctx.fill();
  }
  function drawDecoDefault(p, S) {
    var st = decoStyle(p), k = decoHash(p.id), b = CURB;
    var x = p.x * TILE + 1.5, y = p.y * TILE + 1.5, w = p.w * TILE - 3, h = p.h * TILE - 3;
    var col = decoPick(p, st), hi = decoHeight(p), i;
    if (st === 'park') {
      floorSlab(x, y, w, h, b, '#b9d99a', '#a9cf88', false);
      I.facePath(ctx, x + w / 2 - 2.5, y, 5, h, b + 0.3); ctx.fillStyle = '#e6dcc4'; ctx.fill();
      var n = Math.max(2, Math.min(6, Math.round(p.w * p.h / 3)));
      for (i = 0; i < n; i++) {
        var tx = x + 5 + ((i * 37 + k) % Math.max(1, Math.round(w - 10))), ty = y + 5 + ((i * 53 + (k >> 2)) % Math.max(1, Math.round(h - 10)));
        if (Math.abs(tx - (x + w / 2)) < 5) tx += 7;
        decoTree(Math.min(x + w - 3, tx), ty, b, i + k);
      }
      return;
    }
    I.shadow(ctx, x, y, w, h, 0.16);
    if (st === 'shrine') {
      floorSlab(x, y, w, h, b, '#e9e2d0', '#e0d7c2', false);
      var sx = x + w * 0.22, sy = y + 3, sw = w * 0.56, sd = h * 0.5;
      I.box(ctx, sx, sy, sw, sd, b, 2, '#d8cdb5');
      I.box(ctx, sx + 2, sy + 2, sw - 4, sd - 4, b + 2, 10, '#f3ece0', { left: '#c8433a', right: '#d9564a' });
      for (i = 0; i < 3; i++)
        I.box(ctx, sx - 2 + i * 2, sy - 2 + i * 1.5, sw + 4 - i * 4, sd + 4 - i * 3, b + 12 + i * 3, 3, i ? '#4d4a5c' : '#3e3b4c');
      var gx = x + w / 2, gy = y + h - 3;
      var l = P(gx - 5, gy, b), r = P(gx + 5, gy, b);
      ctx.fillStyle = '#d9483c';
      ctx.fillRect(l.x - 1, l.y - 14, 2, 14); ctx.fillRect(r.x - 1, r.y - 14, 2, 14);
      ctx.strokeStyle = '#d9483c'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(l.x - 3, l.y - 14); ctx.lineTo(r.x + 3, r.y - 14); ctx.stroke();
      ctx.strokeStyle = '#3e3b4c'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(l.x - 4, l.y - 16.5); ctx.lineTo(r.x + 4, r.y - 16.5); ctx.stroke();
      decoTree(x + 3, y + h - 4, b, k); decoTree(x + w - 3, y + 4, b, k + 1);
      return;
    }
    if (st === 'house') {
      var two = p.w >= 4 || p.h >= 4, hw = two ? w / 2 - 1.5 : w - 3, roof = ['#b0574a', '#56657e', '#8a6a3c'][k % 3];
      for (i = 0; i < (two ? 2 : 1); i++) {
        var hx = x + 1.5 + i * (hw + 3), hy = y + 1.5, hd = h - 3;
        I.box(ctx, hx, hy, hw, hd, b, 13, col);
        for (var r0 = 0; r0 < 3; r0++)
          I.box(ctx, hx - 1 + r0 * 1.8, hy - 1 + r0 * 1.4, hw + 2 - r0 * 3.6, hd + 2 - r0 * 2.8, b + 13 + r0 * 3, 3, r0 ? shade(roof, -r0 * 6) : roof);
        I.box(ctx, hx + hw / 2 - 2, hy + hd - 0.6, 4, 1, b, 7, '#8a6a3c');
      }
      return;
    }
    if (st === 'dc') {
      I.box(ctx, x, y, w, h, b, hi, col, { left: shade(col, -14), right: shade(col, -5) });
      faceBands(x, y, w, h, b + hi - 6, b + hi - 3, 8, 2, ['rgba(43,184,216,0.55)', 'rgba(111,87,224,0.45)', 'rgba(47,191,122,0.5)'][k % 3]);
      var nu = Math.max(1, Math.min(6, Math.floor(p.w * p.h / 4)));
      for (i = 0; i < nu; i++) {
        var ux = x + 3 + (i % 3) * Math.max(6, (w - 10) / 3), uy = y + 3 + Math.floor(i / 3) * Math.max(6, (h - 10) / 2);
        if (ux + 5 > x + w || uy + 5 > y + h) continue;
        I.box(ctx, ux, uy, 5, 5, b + hi, 3.5, '#c9ced6');
        var fc = P(ux + 2.5, uy + 2.5, b + hi + 3.6);
        ctx.fillStyle = '#7d8696'; ctx.beginPath(); ctx.ellipse(fc.x, fc.y, 1.8, 0.9, 0, 0, 7); ctx.fill();
      }
      return;
    }
    if (st === 'warehouse') {
      I.box(ctx, x, y, w, h, b, hi, col);
      ctx.strokeStyle = 'rgba(70,80,95,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 3; i < w; i += 4) { var a0 = P(x + i, y, b + hi), a1 = P(x + i, y + h, b + hi); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); }
      ctx.stroke();
      var nd = Math.max(1, Math.floor(p.w / 2)), dw = (w - 6) / nd;
      ctx.fillStyle = 'rgba(80,85,100,0.35)';
      for (i = 0; i < nd; i++) { I.leftFacePath(ctx, x + 3 + i * dw, y, Math.min(9, dw - 2), h, b + hi * 0.7, b); ctx.fill(); }
      return;
    }
    if (st === 'shop') {
      I.box(ctx, x, y, w, h, b, hi, '#f6f1e8', { left: shade(col, -18), right: shade(col, -4) });
      var aw = ['#e2504a', '#2bb8d8', '#f5b21c', '#2fbf7a', '#e2508a'][k % 5];
      ctx.fillStyle = 'rgba(60,70,95,0.35)';
      I.leftFacePath(ctx, x + 2, y, w - 4, h, b + 8, b + 1); ctx.fill();
      I.box(ctx, x - 1, y + h - 0.5, w + 2, 2.5, b + 9, 2.2, aw);
      I.box(ctx, x + w - 0.5, y - 1, 2.5, h + 2, b + 9, 2.2, aw);
      I.box(ctx, x + w * 0.2, y + h * 0.3, w * 0.6, 1.5, b + hi, 6, '#ffffff', { left: aw, right: aw });
      return;
    }
    if (st === 'campus') {
      I.box(ctx, x, y, w, h, b, hi, col);
      faceBands(x, y, w, h, b + 5, b + hi - 3, 8, 3, 'rgba(250,240,220,0.75)');
      I.box(ctx, x - 0.5, y - 0.5, w + 1, h + 1, b + hi, 2.5, '#8a5a44');
      if (p.w >= 3 && p.h >= 3) {
        I.box(ctx, x + w / 2 - 4, y + h / 2 - 4, 8, 8, b + hi + 2.5, 14, col);
        var cc = P(x + w / 2, y + h / 2 + 4, b + hi + 11);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cc.x, cc.y, 2.4, 0, 7); ctx.fill();
      }
      return;
    }
    var glass = st === 'tower';
    I.box(ctx, x, y, w, h, b, hi, col, glass ? { left: shade(col, -40), right: shade(col, -18), top: shade(col, 12) } : null);
    if (glass) faceBands(x, y, w, h, b + 4, b + hi - 2, 7, 3.4, 'rgba(255,255,255,0.32)');
    else if (st === 'apartment') faceBands(x, y, w, h, b + 6, b + hi - 2, 7, 1.6, 'rgba(110,100,130,0.38)');
    else faceBands(x, y, w, h, b + 5, b + hi - 2, 7, 3, 'rgba(70,95,140,0.42)');
    if (st === 'denki') {
      var cols = ['#e2504a', '#2bb8d8', '#f5b21c', '#e2508a', '#2fbf7a', '#6f57e0'];
      for (i = 0; i < Math.max(1, Math.floor(p.w / 1.5)); i++) {
        var vx = x + 2 + i * 11;
        if (vx + 7 > x + w) break;
        ctx.fillStyle = cols[(k + i) % cols.length];
        I.leftFacePath(ctx, vx, y, 7, h + 0.8, b + hi - 2, b + hi * 0.3); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (var dy2 = b + hi * 0.38; dy2 < b + hi - 5; dy2 += 5) { I.leftFacePath(ctx, vx + 2.2, y, 2.6, h + 0.9, dy2 + 2.4, dy2); ctx.fill(); }
      }
      ctx.fillStyle = cols[(k + 3) % cols.length];
      I.rightFacePath(ctx, x, y + 2, w + 0.8, Math.min(8, h - 4), b + hi - 2, b + hi * 0.4); ctx.fill();
      I.box(ctx, x + w * 0.15, y + h * 0.45, w * 0.7, 1.6, b + hi, 9, cols[(k + 1) % cols.length]);
    }
    if (glass) {
      I.box(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, b + hi, 5, col);
      var an = P(x + w / 2, y + h / 2, b + hi + 5);
      ctx.strokeStyle = '#7d788f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(an.x, an.y); ctx.lineTo(an.x, an.y - 9); ctx.stroke();
      ctx.fillStyle = '#e2504a'; ctx.beginPath(); ctx.arc(an.x, an.y - 9.5, 1.3, 0, 7); ctx.fill();
    } else if (p.w >= 2 && p.h >= 2) {
      I.box(ctx, x + 3, y + 3, Math.min(8, w * 0.35), Math.min(8, h * 0.35), b + hi, 4, '#d9d6e2');
    }
  }
  function drawDecoPlot(p, S) {
    if (artRunPlot('plot', p, [p, S, H])) return;
    if (artRun('deco', decoStyle(p), [p, S, H])) return;
    drawDecoDefault(p, S);
  }
  var BLOCK_LIFT = 1.4, blockLift = {};
  if (QT.G && QT.G.on) QT.G.on('blockOpened', function (id) {
    var bid = id && typeof id === 'object' ? id.id : id, S = QT.G.S;
    if (!bid) return;
    blockLift[bid] = S ? S.t : 0;
    var bl = W.BLOCKS && W.BLOCKS[bid], r = bl ? blockRect(bl) : null;
    if (r && cssW) {
      var sc = toScreen((r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE, 20);
      if (sc.x > -40 && sc.x < cssW + 40 && sc.y > -40 && sc.y < cssH + 40) confettiBurst(50, sc.x, sc.y, Math.PI * 1.2);
    }
  });
  function blockClosed(p) {
    if (!p || !p.block) return false;
    var G = QT.G;
    if (typeof G.blockOpen !== 'function') return false;
    try { return !G.blockOpen(p.block); } catch (e) { return false; }
  }
  function blockRect(bl) {
    if (bl._r !== undefined) return bl._r;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    (bl.plots || []).forEach(function (id) {
      var q = W.BY_ID[id];
      if (!q) return;
      x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x + q.w); y1 = Math.max(y1, q.y + q.h);
    });
    return (bl._r = isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null);
  }
  function drawShutter(p, S, lift) {
    var x = p.x * TILE + 2, y = p.y * TILE + 2, w = p.w * TILE - 4, h = p.h * TILE - 4, b = CURB;
    var hi = 26 * (1 - (lift || 0));
    if (hi < 1) return;
    if (!lift) {
      I.shadow(ctx, x, y, w, h, 0.12);
      floorSlab(x, y, w, h, b, '#e4e1ea', '#d9d5e1', false);
    }
    var top = b + 26, lo = top - hi;
    I.box(ctx, x, y, w, h, lo, hi, '#c9c6d2', { left: '#b4b0c0', right: '#c1bdcb', top: '#dcd9e3' });
    ctx.fillStyle = 'rgba(90,85,110,0.18)';
    for (var k = 3; k < w - 1; k += 4) { I.leftFacePath(ctx, x + k, y, 1.2, h, top, lo); ctx.fill(); }
    for (var k2 = 3; k2 < h - 1; k2 += 4) { I.rightFacePath(ctx, x, y + k2, w, 1.2, top, lo); ctx.fill(); }
    if (!lift) {
      I.box(ctx, x - 0.5, y + h - 1.5, w + 1, 2, b, 3, '#f5c230');
      I.box(ctx, x + w - 1.5, y - 0.5, 2, h + 1, b, 3, '#f5c230');
    }
  }
  function drawClosedPlot(p, S) {
    if (artRunPlot('closed', p, [p, S, H])) return;
    if (artRun('block', p.block, [p, S, H])) return;
    drawShutter(p, S, 0);
  }
  function drawPlot(p, S) {
    if (isDeco(p)) { drawDecoPlot(p, S); return; }
    if (blockClosed(p)) { drawClosedPlot(p, S); return; }
    drawPlotOpen(p, S);
    var t0 = p.block != null ? blockLift[p.block] : null;
    if (t0 != null) {
      var k = (S.t - t0) / BLOCK_LIFT;
      if (k >= 0 && k < 1) drawShutter(p, S, ease(k));
      else if (k >= 1) delete blockLift[p.block];
    }
  }
  function drawPlotOpen(p, S) {
    var st = S.p[p.id];
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    var col = p.color || (p.domain ? W.DOMAINS[p.domain].color : C.violet);
    if (!st.owned && artRunPlot('unowned', p, [p, S, H])) return;
    if (st.owned && artRunPlot('plot', p, [p, S, H])) return;
    if (!st.owned) {
      ctx.save();
      I.facePath(ctx, x + 3, y + 3, w - 6, h - 6, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.fill();
      ctx.setLineDash([7, 6]); ctx.lineDashOffset = -(S.t * 8) % 13;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
      ctx.setLineDash([]);
      var c = P(x + w / 2, y + h / 2, 12);
      ctx.globalAlpha = 0.85;
      icon2d(c.x, c.y, p.kind, col, S);
      ctx.restore();
      return;
    }
    if (p.kind === 'notary' || p.kind === 'registry') drawSmallOffice(p, S);
    else if (p.kind === 'bank') drawBank(p, S);
    else if (p.kind === 'vc') drawVC(p, S);
    else if (p.kind === 'corp') drawCorp(p, S);
    else if (p.kind === 'exchange') drawExchange(p, S);
    else if (p.kind === 'office') drawLease(p, S);
    else if (p.kind === 'qcloud') drawQCloud(p, S);
    else if (p.kind === 'ship') drawDock(p, S);
    else if (p.kind === 'house') drawHouse(p, S);
    else if (p.kind === 'gacha') drawGachaMachine(p, S);
    else if (p.kind === 'sphere') drawSphere(p, S);
    else if (p.kind === 'lounge') drawLounge(p, S);
    else if (p.kind === 'arcade') drawArcade(p, S);
    else drawBuilding(p, st, S);
  }
  var SPH_FONT = { Q: ['01110', '10001', '10001', '10101', '10010', '01101'], T: ['11111', '00100', '00100', '00100', '00100', '00100'],
                   Y: ['10001', '01010', '00100', '00100', '00100', '00100'], C: ['01111', '10000', '10000', '10000', '10000', '01111'],
                   ' ': ['00000', '00000', '00000', '00000', '00000', '00000'] };
  function sphereColor(mode, u, v, t) {
    if (mode === 0) return 'hsl(' + Math.round(((v * 120 + t * 90) % 360 + 360) % 360) + ',95%,58%)';
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
      var text = 'ESTATE ', cols = text.length * 6;
      var cx = Math.floor(((u + Math.PI) / (Math.PI * 2) * 40 + t * 8) % cols), cy = Math.floor((0.55 - v / 1.4) * 6 * 1.4 - 1);
      var ch = SPH_FONT[text[Math.floor(cx / 6)]], col = cx % 6;
      var on = ch && cy >= 0 && cy < 6 && col < 5 && ch[cy][col] === '1';
      return on ? '#ffffff' : '#e2508a';
    }
    var d = Math.hypot(u * 0.9, v), ring = (d * 3 - t * 2) % 1;
    return ring < 0.18 ? 'hsl(' + Math.round((d * 200 + t * 60) % 360) + ',95%,62%)' : '#120d2a';
  }
  function drawSphere(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.25);
    I.box(ctx, x + 2, y + 2, w - 4, h - 4, 0, 4, '#2a2350');
    I.box(ctx, x + w / 2 - 14, y + h / 2 - 14, 28, 28, 4, 10, '#3a3170');
    var c = P(x + w / 2, y + h / 2, 4 + 10 + 34), R = 36;
    var g0 = P(x + w / 2, y + h / 2, 4.5);
    var mode = Math.floor(S.t / 6) % 5, t = S.t;
    ctx.fillStyle = sphereColor(mode, 0, 0, t); ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.ellipse(g0.x, g0.y, 52, 26, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#120d2a'; ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, 7); ctx.fill();
    var rows = 16, colsN = 22;
    for (var i = 0; i < rows; i++) {
      var v = -Math.PI / 2 + (i + 0.5) * Math.PI / rows;
      var ry = Math.sin(v), rr1 = Math.cos(v);
      var n = Math.max(3, Math.round(colsN * rr1));
      for (var j = 0; j < n; j++) {
        var u = -Math.PI / 2 + (j + 0.5) * Math.PI / n;
        var px = c.x + Math.sin(u) * rr1 * R, py = c.y + ry * R;
        var dz = Math.cos(u) * rr1;
        ctx.fillStyle = sphereColor(mode, u, -v, t);
        ctx.globalAlpha = 0.45 + 0.55 * dz;
        ctx.fillRect(px - 1.3 - dz * 0.6, py - 1.3 - dz * 0.6, 2.6 + dz * 1.2, 2.6 + dz * 1.2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, 7); ctx.stroke();
  }
  function drawLounge(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.2);
    I.box(ctx, x + 1, y + 1, w - 2, h - 2, 0, 3, '#3a2a62');
    floorSlab(x + 3, y + 3, w - 6, h - 6, 3, '#4a3380', '#553a92', false);
    I.box(ctx, x + 2, y + 2, w - 4, 4, 3, 26, '#2b1f4c');
    var on = Math.sin(S.t * 5) > -0.95;
    var n1 = P(x + w / 2, y + 5, 3 + 20);
    ctx.save();
    if (on) { ctx.shadowColor = '#ff5ac8'; ctx.shadowBlur = 10; }
    ctx.font = '900 italic 10px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = on ? '#ff8ad8' : '#6a4a80'; ctx.fillText('LOUNGE', n1.x, n1.y);
    ctx.restore();
    I.box(ctx, x + 8, y + 12, w - 16, 7, 3, 12, '#1f1638', { top: '#c89b3c' });
    for (var i = 0; i < 6; i++) {
      var bp = P(x + 12 + i * ((w - 24) / 5), y + 8, 3 + 13);
      ctx.fillStyle = ['#7fd6ff', '#ffd23f', '#ff8ad8', '#8cf08c', '#ff8a3d', '#b89cff'][i];
      ctx.fillRect(bp.x - 1.5, bp.y - 7, 3, 7);
    }
    [[x + 8, y + h - 20], [x + w - 30, y + h - 20]].forEach(function (q) {
      I.box(ctx, q[0], q[1], 22, 10, 3, 5, '#e2508a');
      I.box(ctx, q[0], q[1] + 8, 22, 3, 3 + 5, 6, '#c23a74');
    });
    for (var k = 0; k < 3; k++) {
      var lp = P(x + w * (0.25 + k * 0.25), y + h * 0.5, 3 + 34 + Math.sin(S.t * 1.5 + k) * 1.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(lp.x, lp.y - 10); ctx.lineTo(lp.x, lp.y); ctx.stroke();
      ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(lp.x, lp.y + 2, 3, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,233,168,0.15)'; ctx.beginPath(); ctx.arc(lp.x, lp.y + 2, 9, 0, 7); ctx.fill();
    }
  }
  function drawArcade(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.2);
    I.box(ctx, x + 1, y + 1, w - 2, h - 2, 0, 3, '#141a3a');
    floorSlab(x + 3, y + 3, w - 6, h - 6, 3, '#1b2250', null, false);
    ctx.save(); I.facePath(ctx, x + 3, y + 3, w - 6, h - 6, 3.1); ctx.clip();
    ctx.strokeStyle = 'rgba(80,220,255,0.35)'; ctx.lineWidth = 0.8;
    for (var gx = 0; gx <= w; gx += 8) { var a1 = P(x + gx, y, 3.1), b1 = P(x + gx, y + h, 3.1); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
    for (var gy = 0; gy <= h; gy += 8) { var a2 = P(x, y + gy, 3.1), b2 = P(x + w, y + gy, 3.1); ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); }
    ctx.restore();
    for (var i = 0; i < 3; i++) {
      var cx0 = x + 6 + i * 14;
      I.box(ctx, cx0, y + 5, 11, 8, 3, 24, ['#e2508a', '#2bb8d8', '#f5b21c'][i]);
      var sc = P(cx0 + 5.5, y + 13, 3 + 18);
      ctx.fillStyle = 'hsl(' + Math.round((S.t * 200 + i * 120) % 360) + ',90%,' + (55 + 15 * Math.sin(S.t * 13 + i)) + '%)';
      ctx.fillRect(sc.x - 4, sc.y - 4, 8, 6);
    }
    var tx = x + w - 30, ty = y + h - 22;
    I.box(ctx, tx, ty, 24, 14, 3, 7, '#6b3f1f', { top: '#2e8b57' });
    var balls = ['#ffffff', '#f5b21c', '#e2504a', '#2b7fe0', '#2a1a40'];
    balls.forEach(function (bc, bi) {
      var bp = P(tx + 5 + bi * 3.6 + Math.sin(S.t + bi) * 1.2, ty + 4 + (bi % 2) * 5, 3 + 7.5);
      ctx.fillStyle = bc; ctx.beginPath(); ctx.arc(bp.x, bp.y, 1.6, 0, 7); ctx.fill();
    });
    var sg = P(x + w / 2, y + h / 2, 3 + 40);
    ctx.save();
    ctx.shadowColor = '#50dcff'; ctx.shadowBlur = 8;
    popTxt(ctx, 'GAME', sg.x, sg.y, 11, 'hsl(' + Math.round(S.t * 90 % 360) + ',95%,65%)', '#141a3a', 3);
    ctx.restore();
  }
  var CAPS = ['#e2508a', '#2bb8d8', '#f5b21c', '#2fbf7a', '#6f57e0', '#ef7d2e'];
  function drawGachaMachine(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x + 2, y + 2, w - 4, h - 4, 0, 3, '#ffe3f0');
    I.box(ctx, x + 8, y + 8, w - 16, h - 14, 3, 18, '#e2508a');
    I.box(ctx, x + 14, y + h - 8, 12, 2, 7, 6, '#7a1f4a');
    var c = P(x + w / 2, y + h / 2 - 2, 3 + 18 + 12);
    ctx.save();
    ctx.beginPath(); ctx.arc(c.x, c.y, 13, 0, 7);
    ctx.fillStyle = 'rgba(220,240,255,0.65)'; ctx.fill();
    ctx.clip();
    for (var i = 0; i < 9; i++) {
      var a = i * 2.4 + Math.sin(S.t * 1.5 + i) * 0.2;
      var r = 3 + (i % 3) * 3.2;
      var cx = c.x + Math.cos(a) * r, cy = c.y + 4 + Math.sin(a) * r * 0.6;
      ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, 7); ctx.fillStyle = CAPS[i % CAPS.length]; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 3.4, Math.PI, 0); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(c.x, c.y, 13, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(c.x - 4, c.y - 5, 4, 3.6, 4.6); ctx.stroke();
    var info = QT.G.padInfo({ p: p, type: 'gacha' });
    var hc = P(x + w / 2 + 6, y + h - 9, 12), ang = info && info.can ? S.t * 4 : 0;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(hc.x, hc.y, 3.2, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7a1f4a'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hc.x - Math.cos(ang) * 4, hc.y - Math.sin(ang) * 2);
    ctx.lineTo(hc.x + Math.cos(ang) * 4, hc.y + Math.sin(ang) * 2); ctx.stroke();
    if (info && info.can) {
      var tc = P(x + w / 2, y + h / 2, 3 + 18 + 30);
      ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(S.t * 6);
      txt(ctx, 'GACHA', tc.x, tc.y, 8, '#e2508a', 'center', 900, '#ffffff');
      ctx.restore();
    }
  }
  var PAD_COL = {
    expand: '#f5b21c', open: '#f5b21c', buy: '#e2508a', reg: '#2bb8d8', stock: '#f2a63b', rd: '#ef7d2e',
    brew: '#c89b6a', pickup: '#f2a63b', drop: '#f2a63b',
    borrow: '#2fbf7a', repay: '#f2a63b',
    found: '#7d8fc4', accept: '#2fbf7a', skip: '#b9b3c8',
    ship: '#2fbf7a', dcdrop: '#6f57e0', collectDc: '#f5b21c', collectSvc: '#f5b21c',
    angel: '#f5b21c', sales: '#f2a63b', cvc: '#6f57e0', mission: '#f2a63b', collectSales: '#f5b21c', press2: '#e2508a', fix: '#e2504a', promo: '#e2508a', seminar: '#2fbf7a', vc: '#6f57e0', ipo: '#f5b21c', gacha: '#e2508a'
  };
  function padCol(pad, info) {
    return PAD_COL[pad.type] || C.violet;
  }
  function padRoom(pad) {
    if (pad.type === 'angel') return pad.room;
    if (pad.district) return pad.district.id;
    if (pad.p) return pad.p.room;
    return W.roomAt(pad.x + 0.5, pad.y + 0.5);
  }
  function drawPads(S) {
    QT.G.PADS().forEach(function (pad) {
      var x = pad.x * TILE, y = pad.y * TILE;
      if (!onView(ex(x + 8, y + 8), ey(x + 8, y + 8, 0), 24)) return;
      if (!QT.G.padActive(pad)) return;
      var info = QT.G.padInfo(pad);
      if (!info) return;
      var lf = W.roomAt(pad.x + 0.5, pad.y + 0.5) === 'ave' ? 2 : 4.5;
      var base = (pad.type === 'buy' && pad.p && S.p[pad.p.id].owned) ? '#9aa3c4' : (PAD_COL[pad.type] || C.violet);
      ctx.save();
      if (info.can) {
        var pl = 0.5 + 0.5 * Math.sin(S.t * 4);
        ctx.globalAlpha = 0.20 + 0.30 * pl;
        I.facePath(ctx, x - 5 - pl * 3, y - 5 - pl * 3, TILE + 10 + pl * 6, TILE + 10 + pl * 6, lf);
        ctx.fillStyle = base; ctx.fill();
      }
      ctx.globalAlpha = info.can ? 1 : 0.35;
      I.facePath(ctx, x - 1, y - 1, TILE + 2, TILE + 2, lf);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      I.facePath(ctx, x + 1, y + 1, TILE - 2, TILE - 2, lf + 0.1);
      ctx.fillStyle = base; ctx.fill();
      I.facePath(ctx, x + 4.5, y + 4.5, TILE - 9, TILE - 9, lf + 0.3);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
      ctx.restore();
      padRing(pad, info, S, 0);
    });
  }
  var LINE_COL = '#2fbf7a';
  function padRing(pad, info, S, lift) {
    var cxw = (pad.x + 0.5) * TILE, cyw = (pad.y + 0.5) * TILE;
    if (info.can) {
      var rc = P(cxw, cyw, lift);
      ctx.save();
      ctx.strokeStyle = padCol(pad, info); ctx.lineWidth = 2.2 / z;
      ctx.globalAlpha = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(S.t * 4));
      ctx.beginPath(); ctx.ellipse(rc.x, rc.y, TILE * 0.72, TILE * 0.40, 0, 0, 7); ctx.stroke();
      ctx.restore();
    }
    if (S.heldPad === pad && info.can && info.hold > 0) {
      var c = P(cxw, cyw, lift + 5);
      ctx.save();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, TILE * 0.78, TILE * 0.44, 0, -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * Math.min(1, S.holdT / info.hold));
      ctx.stroke();
      ctx.restore();
    }
  }
  function padRingsOn(p, S) {
    QT.G.PADS().forEach(function (pad) {
      if (pad.p !== p || pad.x < p.x || pad.y < p.y || pad.x >= p.x + p.w || pad.y >= p.y + p.h) return;
      if (!QT.G.padActive(pad)) return;
      var info = QT.G.padInfo(pad);
      if (info) padRing(pad, info, S, 2);
    });
  }
  function machineIcon(x0, y0, m) {
    ctx.save();
    ctx.translate(x0, y0);
    ctx.fillStyle = 'rgba(60,50,35,0.18)';
    ctx.beginPath(); ctx.ellipse(0, 9, 8, 3.2, 0, 0, 7); ctx.fill();
    fillRR(ctx, -7, -11, 14, 19, 4, '#ffffff');
    strokeRR(ctx, -7, -11, 14, 19, 4, 'rgba(90,75,55,0.28)', 1);
    fillRR(ctx, -5, -9, 10, 7, 2, C.blue);
    var md = m && m.mod && QT.Data && QT.Data.mods && QT.Data.mods[m.mod];
    ctx.fillStyle = md ? md.color : (m && m.q < 55) ? C.red : C.green;
    ctx.beginPath(); ctx.arc(3.6, 4.5, 1.8, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(80,70,110,0.32)';
    ctx.fillRect(-5, 0.5, 10, 1.3); ctx.fillRect(-5, 3.5, 6, 1.3);
    ctx.restore();
  }
  function drawAngel(S) {
    var a = S.angel, s2 = P(a.x, a.y, 0);
    var bob = Math.abs(Math.sin(a.walk)) * 1.8;
    ctx.save();
    ctx.fillStyle = 'rgba(60,50,35,0.24)';
    ctx.beginPath(); ctx.ellipse(s2.x, s2.y, 7, 3.2, 0, 0, 7); ctx.fill();
    for (var i = 0; i < 4; i++) {
      var th = S.t * 2 + i * 1.57;
      var sx0 = s2.x + Math.cos(th) * 15, sy0 = s2.y - 14 + Math.sin(th) * 7;
      ctx.fillStyle = 'rgba(245,178,28,' + (0.35 + 0.35 * Math.sin(S.t * 5 + i)).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(sx0, sy0, 2.2, 0, 7); ctx.fill();
    }
    ctx.translate(s2.x, s2.y - bob);
    var lw = Math.sin(a.walk) * 2.2;
    fillRR(ctx, -3.6, -6, 3.1, 6 + lw, 1.5, '#3a3550');
    fillRR(ctx, 0.5, -6, 3.1, 6 - lw, 1.5, '#3a3550');
    fillRR(ctx, -5.6, -15, 11.2, 10, 3.4, a.who.color);
    fillRR(ctx, -1.2, -15, 2.4, 8, 1, '#ffffff');
    fillRR(ctx, -4, -23, 8, 8.6, 3.4, '#ffd9b8');
    ctx.fillStyle = '#33304a';
    fillRR(ctx, -6.4, -24.5, 12.8, 2, 1, '#33304a');
    fillRR(ctx, -4.4, -28.5, 8.8, 5, 2, '#33304a');
    ctx.fillStyle = '#3a3550';
    ctx.beginPath(); ctx.arc(-1.8, -18.5, 1.05, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(1.8, -18.5, 1.05, 0, 7); ctx.fill();
    fillRR(ctx, 5.5, -9, 5, 4.5, 1.2, '#8a6a3c');
    ctx.restore();
  }
  function drawPlayer(S) {
    var pl = S.player, s = P(pl.x, pl.y, 0);
    var bob = Math.abs(Math.sin(pl.walk)) * 1.8;
    ctx.save();
    ctx.fillStyle = 'rgba(60,50,35,0.24)';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, 7, 3.2, 0, 0, 7); ctx.fill();
    ctx.translate(s.x, s.y - bob);
    var lw = Math.sin(pl.walk) * 2.4;
    fillRR(ctx, -3.6, -6, 3.1, 6 + lw, 1.5, '#3c4767');
    fillRR(ctx, 0.5, -6, 3.1, 6 - lw, 1.5, '#3c4767');
    fillRR(ctx, -5.4, -14, 10.8, 9.5, 3.6, C.blue);
    fillRR(ctx, -5.4, -14, 10.8, 3, 1.5, 'rgba(255,255,255,0.5)');
    fillRR(ctx, -4, -22, 8, 8.6, 3.4, '#ffd9b8');
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.arc(0, -20.5, 5.1, Math.PI, 0); ctx.fill();
    ctx.fillRect(-6.2, -21, 12.4, 1.9);
    ctx.fillStyle = '#3a3550';
    if (pl.dir === 1) { ctx.beginPath(); ctx.arc(1.9, -17.5, 1.05, 0, 7); ctx.fill(); }
    else if (pl.dir === 3) { ctx.beginPath(); ctx.arc(-1.9, -17.5, 1.05, 0, 7); ctx.fill(); }
    else if (pl.dir !== 2) {
      ctx.beginPath(); ctx.arc(-1.8, -17.5, 1.05, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(1.8, -17.5, 1.05, 0, 7); ctx.fill();
    }
    if (S.deliv) {
      var late = (S.deliv.due - S.t) < 20;
      fillRR(ctx, -8.5, -18, 5.5, 9, 1.6, late ? '#e2504a' : '#2fbf7a');
      fillRR(ctx, -7.6, -16.6, 3.7, 3, 1, 'rgba(255,255,255,0.85)');
    }
    ctx.restore();
    for (var i = 0; i < pl.carry.length; i++) machineIcon(s.x, s.y - 30 - bob - i * 12, pl.carry[i]);
  }
  function drawItem(it, wx, wy) {
    var s = P(wx, wy, 10);
    ctx.fillStyle = 'rgba(60,50,35,0.16)';
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 10, 5, 2.2, 0, 0, 7); ctx.fill();
    fillRR(ctx, s.x - 4.5, s.y - 5, 9, 9, 2.4, it.color);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(s.x - 3.4, s.y - 4, 6.8, 1.7);
  }
  function drawFx(S) {
    S.fx.forEach(function (f) {
      var s = P(f.x, f.y, 12);
      var a = Math.max(0, 1 - f.t / f.life);
      ctx.globalAlpha = a; ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.6 * a + 0.6, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  var RAIL_H = 40, DECK_T = 4, DECK_W = 0.85, TRACK_OFF = 0.38, CAR_L = 2.3, CAR_GAP = 0.25, CAR_W = 0.62, CAR_H = 9;
  var RLOOP = W.RAIL.loop, RLEN = W.RAIL.len, REDGE = [];
  (function () {
    var s = 0;
    for (var i = 0; i < RLOOP.length; i++) {
      var a = RLOOP[i], b = RLOOP[(i + 1) % RLOOP.length], len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      REDGE.push({ s0: s, len: len, ax: a[0], ay: a[1], dx: (b[0] - a[0]) / len, dy: (b[1] - a[1]) / len });
      s += len;
    }
  })();
  function wrapS(s) { s %= RLEN; return s < 0 ? s + RLEN : s; }
  function edgeAt(s) {
    s = wrapS(s);
    for (var i = REDGE.length - 1; i >= 0; i--) if (s >= REDGE[i].s0) return REDGE[i];
    return REDGE[0];
  }
  function railPt(s, off) {
    var e = edgeAt(s), k = wrapS(s) - e.s0, o = off || 0;
    return { x: e.ax + e.dx * k - e.dy * o, y: e.ay + e.dy * k + e.dx * o, dx: e.dx, dy: e.dy };
  }
  function railProject(px, py) {
    var x = px / TILE, y = py / TILE, best = 1e9, bs = 0;
    REDGE.forEach(function (e) {
      var k = Math.max(0, Math.min(e.len, (x - e.ax) * e.dx + (y - e.ay) * e.dy));
      var d = Math.hypot(e.ax + e.dx * k - x, e.ay + e.dy * k - y);
      if (d < best) { best = d; bs = e.s0 + k; }
    });
    return { s: bs, d: best };
  }
  var RAIL_ITEMS = (function () {
    var byB = {}, list = [], STEP = 0.25, prevB = -1, cur = null;
    for (var s = 0; s < RLEN; s += STEP) {
      var p = railPt(s), b = W.bucketAt(p.x * TILE, p.y * TILE);
      if (b !== prevB) {
        var it = byB[b] || (byB[b] = { b: b, ranges: [], x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
        if (byB[b].ranges.length === 0) list.push(it);
        cur = [s, s + STEP]; it.ranges.push(cur); prevB = b;
      } else cur[1] = s + STEP;
      var r = byB[b];
      r.x0 = Math.min(r.x0, p.x - DECK_W); r.x1 = Math.max(r.x1, p.x + DECK_W);
      r.y0 = Math.min(r.y0, p.y - DECK_W); r.y1 = Math.max(r.y1, p.y + DECK_W);
    }
    return list.map(function (r) {
      var slabs = [], plats = [];
      r.ranges.forEach(function (rg) {
        slabs = slabs.concat(chunksOf(rg[0], rg[1], DECK_W));
      });
      function byDepth(a, b) { return (a.x + a.y) - (b.x + b.y); }
      slabs.sort(byDepth); plats.sort(byDepth);
      var piers = [];
      for (var ps = 0; ps < RLEN; ps += 6) {
        if (inRanges(r.ranges, ps)) piers.push(railPt(ps));
      }
      return { b: r.b, x: r.x0 * TILE, y: r.y0 * TILE, w: (r.x1 - r.x0) * TILE, h: (r.y1 - r.y0) * TILE,
               rail: true, ranges: r.ranges, slabs: slabs, piers: piers, plats: plats };
    });
  })();
  function piecesOf(a0, b0, wd) {
    var out = [];
    REDGE.forEach(function (e) {
      var a = Math.max(a0, e.s0), b = Math.min(b0, e.s0 + e.len);
      if (b - a < 0.01) return;
      var p0 = railPt(a), p1 = railPt(b - 0.0001);
      var x0 = Math.min(p0.x, p1.x), x1 = Math.max(p0.x, p1.x), y0 = Math.min(p0.y, p1.y), y1 = Math.max(p0.y, p1.y);
      var ext0 = Math.abs(a - e.s0) < 0.01 ? wd : 0, ext1 = Math.abs(b - e.s0 - e.len) < 0.3 ? wd : 0;
      if (e.dx) { x0 -= (e.dx > 0 ? ext0 : ext1); x1 += (e.dx > 0 ? ext1 : ext0); y0 -= wd; y1 += wd; }
      else { y0 -= (e.dy > 0 ? ext0 : ext1); y1 += (e.dy > 0 ? ext1 : ext0); x0 -= wd; x1 += wd; }
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    });
    return out;
  }
  function chunksOf(a0, b0, wd) {
    var out = [];
    for (var a = a0; a < b0 - 0.01; a += 2) out = out.concat(piecesOf(a, Math.min(b0, a + 2), wd));
    return out;
  }
  function railAlpha(r, S) {
    if (RIDE.on) return 1;
    var px = S.player.x / TILE, py = S.player.y / TILE;
    if (px > r.x - 3.2 && px < r.x + r.w + 0.8 && py > r.y - 3.2 && py < r.y + r.h + 0.8) return 0.38;
    return 1;
  }
  function inRanges(rs, s) {
    s = wrapS(s);
    for (var i = 0; i < rs.length; i++) if (s >= rs[i][0] && s < rs[i][1]) return true;
    return false;
  }
  function overlapsRanges(rs, a, b) {
    for (var k = -1; k <= 1; k++) {
      var a2 = a + k * RLEN, b2 = b + k * RLEN;
      for (var i = 0; i < rs.length; i++) if (b2 > rs[i][0] && a2 < rs[i][1]) return true;
    }
    return false;
  }
  var AMB_V = 6.5, AMB_DWELL = 1.2, AMB_SEG = 17;
  var AMB_LAP = (RLEN / AMB_SEG) * (AMB_SEG / AMB_V + AMB_DWELL);
  var AMB = [{ off: 0, dir: 1 }, { off: AMB_LAP / 2, dir: 1 }, { off: AMB_LAP / 3, dir: -1 }];
  function ambientS(t, off) {
    var u = (t + off) % AMB_LAP, segT = AMB_SEG / AMB_V + AMB_DWELL;
    var seg = Math.floor(u / segT), r = u - seg * segT;
    return seg * AMB_SEG + Math.max(0, r - AMB_DWELL) * AMB_V;
  }
  var railTrains = [];
  function updateTrains(S) {
    railTrains.length = 0;
    for (var i = 0; i < AMB.length; i++) {
      var s = ambientS(S.t, AMB[i].off);
      railTrains.push({ s: AMB[i].dir > 0 ? s : RLEN - s, dir: AMB[i].dir, mine: false });
    }
  }
  function drawCar(sc, off, mine, head) {
    var p = railPt(sc, off), hx = p.dx ? CAR_L / 2 : CAR_W / 2, hy = p.dx ? CAR_W / 2 : CAR_L / 2;
    var x = (p.x - hx) * TILE, y = (p.y - hy) * TILE, w = hx * 2 * TILE, h = hy * 2 * TILE, b = RAIL_H;
    I.box(ctx, x, y, w, h, b, CAR_H, '#dfe4ea', { left: '#c3cad3', right: '#d2d8df', top: '#eef1f5' });
    var band = mine ? C.gold : '#2fbf7a';
    ctx.fillStyle = '#3a4658';
    I.leftFacePath(ctx, x, y, w, h, b + 7.6, b + 5); ctx.fill();
    I.rightFacePath(ctx, x, y, w, h, b + 7.6, b + 5); ctx.fill();
    ctx.fillStyle = band;
    I.leftFacePath(ctx, x, y, w, h, b + 3.6, b + 1.6); ctx.fill();
    I.rightFacePath(ctx, x, y, w, h, b + 3.6, b + 1.6); ctx.fill();
    if (head) {
      var q = P((p.x + p.dx * (CAR_L / 2 - 0.25) * head) * TILE, (p.y + p.dy * (CAR_L / 2 - 0.25) * head) * TILE, b + CAR_H + 0.5);
      ctx.fillStyle = mine ? '#fff3c4' : '#ffffff';
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.6, 0, 7); ctx.fill();
    }
  }
  function drawRailItem(e, S) {
    var i;
    for (i = 0; i < e.piers.length; i++) {
      var pp = e.piers[i];
      ctx.globalAlpha = railAlpha({ x: pp.x - 0.3, y: pp.y - 0.3, w: 0.6, h: 0.6 }, S);
      I.box(ctx, (pp.x - 0.3) * TILE, (pp.y - 0.3) * TILE, 0.6 * TILE, 0.6 * TILE, 0, RAIL_H - DECK_T, '#b8bcc6');
    }
    for (i = 0; i < e.slabs.length; i++) {
      var sl = e.slabs[i];
      ctx.globalAlpha = railAlpha(sl, S);
      I.box(ctx, sl.x * TILE, sl.y * TILE, sl.w * TILE, sl.h * TILE, RAIL_H - DECK_T, DECK_T, '#c9ccd4',
            { top: '#a9adb8', left: '#8f94a1', right: '#a2a7b3' });
    }
    for (i = 0; i < e.plats.length; i++) {
      var pl = e.plats[i];
      ctx.globalAlpha = railAlpha(pl, S);
      I.box(ctx, pl.x * TILE, pl.y * TILE, pl.w * TILE, pl.h * TILE, RAIL_H - 1, 1.2,
            QT.G.roomOpen(pl.st.district) ? '#f1ece0' : '#cfcbd6');
    }
    ctx.globalAlpha = 1;
    var cars = [];
    for (i = 0; i < railTrains.length; i++) {
      var tr = railTrains[i], off = tr.dir > 0 ? TRACK_OFF : -TRACK_OFF;
      for (var k = 0; k < 3; k++) {
        var sc = tr.s - tr.dir * (k * (CAR_L + CAR_GAP) + CAR_L / 2);
        if (!overlapsRanges(e.ranges, sc - CAR_L / 2, sc + CAR_L / 2)) continue;
        var cp = railPt(sc, off);
        cars.push({ s: sc, off: off, mine: tr.mine, head: k === 0 ? tr.dir : 0, d: cp.x + cp.y });
      }
    }
    cars.sort(function (a, b) { return a.d - b.d; });
    for (i = 0; i < cars.length; i++) drawCar(cars[i].s, cars[i].off, cars[i].mine, cars[i].head);
  }
  function inFront(a, b) {
    if (a.base || b.base) {
      var ov = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      if (ov && b.base && !a.base) return true;
      if (ov && a.base && !b.base) return false;
    }
    if (a.x + a.w - a.y <= b.x - b.y - b.h || b.x + b.w - b.y <= a.x - a.y - a.h) return false;
    if (a.x >= b.x + b.w) return true;
    if (a.y >= b.y + b.h) return true;
    return false;
  }
  function sortByDepth(list) {
    var n = list.length, i, j;
    for (i = 0; i < n; i++) { list[i].behind = 0; list[i].done = false; }
    var order = [];
    for (var pass = 0; pass < n; pass++) {
      var pick = -1;
      for (i = 0; i < n; i++) {
        if (list[i].done) continue;
        var isFarthest = true;
        for (j = 0; j < n; j++) {
          if (i === j || list[j].done) continue;
          if (inFront(list[i], list[j])) { isFarthest = false; break; }
        }
        if (isFarthest) { pick = i; break; }
      }
      if (pick < 0) {
        var best = -1, bd = Infinity;
        for (i = 0; i < n; i++) {
          if (list[i].done) continue;
          var d = list[i].x + list[i].y;
          if (d < bd) { bd = d; best = i; }
        }
        pick = best;
      }
      if (pick < 0) break;
      list[pick].done = true;
      order.push(list[pick]);
    }
    for (i = 0; i < order.length; i++) list[i] = order[i];
    list.length = order.length;
    return list;
  }
  var view = { x0: 0, y0: 0, x1: 0, y1: 0 };
  function setView() {
    var hw = cssW / 2 / z, hh = cssH / 2 / z;
    view.x0 = cam.x - hw; view.x1 = cam.x + hw; view.y0 = cam.y - hh; view.y1 = cam.y + hh;
  }
  function boxOnView(b) { return b.x1 >= view.x0 && b.x0 <= view.x1 && b.y1 >= view.y0 && b.y0 <= view.y1; }
  function onView(sx, sy, m) { return sx >= view.x0 - m && sx <= view.x1 + m && sy >= view.y0 - m && sy <= view.y1 + m; }
  var NB = W.BUCKETS.length;
  var BK_BOX = W.BUCKETS.map(function (b) {
    var bx = screenBox(b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1, 220);
    bx.y1 += 8;
    return bx;
  });
  var bkList = [], bkVis = new Uint8Array(NB);
  for (var bki = 0; bki < NB; bki++) bkList.push([]);
  var DIST_BK = {}, DIST_BOX = {};
  W.BUCKETS.forEach(function (b, i) { if (b.kind === 'district') DIST_BK[b.id] = i; });
  W.DISTRICTS.forEach(function (d) { DIST_BOX[d.id] = distBounds(d); });
  var RIM_R = { id: 'rim', rim: true, index: -1, ix: 0, iy: 0, iw: W.WORLD_W, ih: W.WORLD_H, roads: [], plots: [] };
  function bucketOf(px, py) {
    var b = W.bucketAt(px, py);
    if (b !== 255) return b;
    var lo = W.RIM * TILE, hi = (W.WORLD_W - W.RIM) * TILE - 1;
    return W.bucketAt(Math.max(lo, Math.min(hi, px)), Math.max(lo, Math.min(hi, py)));
  }
  function pushTo(e) {
    var b = bucketOf(e.x + (e.w || 0) / 2, e.y + (e.h || 0) / 2);
    if (b < NB && bkVis[b]) bkList[b].push(e);
  }
  function pushRailArt(e) {
    if (e && e.draw) e.railArt = true;
    pushScene(e);
  }
  function pushScene(e) {
    if (!e || !e.draw) return;
    if (e.w == null) e.w = 0;
    if (e.h == null) e.h = 0;
    pushTo(e);
  }
  function drawEntry(e, S) {
    if (e.draw) artCall('scene-item', e.draw, [e]);
    else if (e.p) drawPlot(e.p, S);
    else if (e.base) drawStoreBase(e.base, S);
    else if (e.fixture) drawFixture(e.fixture, e.fi, S);
    else if (e.cust) drawCustomer(e.plot, e.ci, e.cust, S);
    else if (e.staff != null) drawStaff(e.plot, e.staff, S);
    else if (e.pl) { drawPlayer(S); ghost.s = P(S.player.x, S.player.y, 0); }
    else if (e.rail) drawRailItem(e, S);
    else if (e.angel) drawAngel(S);
    else if (e.truck) drawTruck(S);
    else if (e.fence) drawFence(e, S);
    else if (e.o) { var s = P(e.o.x, e.o.y, 0); machineIcon(s.x, s.y - 8, e.o.m); }
    else if (e.it) drawItem(e.it, e.wx, e.wy);
  }
  function signVisible(sg, band) {
    var s = toScreen((sg.x + 0.5) * TILE, (sg.y + 0.5) * TILE, CURB + FENCE_H + 9);
    return s.x > 24 && s.x < cssW - 24 && s.y - 22 * z > band.top && s.y < band.bottom;
  }
  function drawScene(S) {
    setView();
    gateRects.length = 0;
    ghost.s = null; ghost.hid = false;
    cacheFrame++;
    var i, j, d;
    for (i = 0; i < NB; i++) { bkVis[i] = boxOnView(BK_BOX[i]) ? 1 : 0; bkList[i].length = 0; }
    var visD = [];
    W.DISTRICTS.forEach(function (dd) { if (bkVis[DIST_BK[dd.id]]) visD.push(dd); });
    nearSign = null; signPick = {};
    var nsd = Infinity, ptx = S.player.x / TILE, pty = S.player.y / TILE, band = H.uiBand();
    for (i = 0; i < visD.length; i++) {
      if (QT.G.roomOpen(visD[i].id)) continue;
      var bestSg = null, bestD = Infinity, rawD = Infinity;
      signsOf(visD[i]).forEach(function (sg) {
        if (!signVisible(sg, band)) return;
        var dd2 = Math.hypot(sg.x + 0.5 - ptx, sg.y + 0.5 - pty);
        var sp2 = toScreen((sg.x + 0.5) * TILE, (sg.y + 0.5) * TILE, CURB + FENCE_H + 9);
        var edge = Math.min(sp2.x, cssW - sp2.x), pen = edge < 90 ? (90 - edge) / 6 : 0;
        if (dd2 + pen < bestD) { bestD = dd2 + pen; rawD = dd2; bestSg = sg; }
      });
      if (!bestSg) continue;
      signPick[visD[i].id] = bestSg;
      if (rawD < nsd) { nsd = rawD; nearSign = bestSg; }
    }
    drawMapBase();
    artRun('backdrop', 'rim', [RIM_R, S, H]);
    artRun('backdrop', '*', [RIM_R, S, H]);
    for (i = 0; i < visD.length; i++) artRun('backdrop', visD[i].id, [visD[i], S, H]);
    drawAvenues();
    for (i = 0; i < visD.length; i++) if (floorCache[visD[i].id]) floorCache[visD[i].id].used = cacheFrame;
    for (i = 0; i < visD.length; i++) {
      var fb = DIST_BOX[visD[i].id];
      if (fb.x + fb.w < view.x0 || fb.x > view.x1 || fb.y + fb.h < view.y0 || fb.y > view.y1) continue;
      drawFloor(visD[i], S);
    }
    for (i = 0; i < visD.length; i++) {
      d = visD[i];
      if (!QT.G.roomOpen(d.id)) continue;
      drawLiveDeco(d, S);
      artRun('floor', d.id, [d, S, H]);
    }
    artRun('ground', '*', [S, H]);
    drawPads(S);
    W.PLOTS.forEach(function (p) {
      var bi = DIST_BK[p.room];
      if (bi == null || !bkVis[bi] || !QT.G.roomOpen(p.room)) return;
      var list = bkList[bi];
      if (p.open) {
        list.push({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: p.h * TILE, base: p });
        (p.blocks || []).forEach(function (b, bi2) {
          list.push({ x: (p.x + b[0]) * TILE, y: (p.y + b[1]) * TILE, w: b[2] * TILE, h: b[3] * TILE, fixture: p, fi: bi2 });
        });
        if (p.kind === 'store') {
          S.store.cust.forEach(function (cu, ci) {
            var q = custPos(p, ci);
            list.push({ x: q.x - 4, y: q.y - 4, w: 8, h: 8, cust: cu, ci: ci, plot: p });
          });
        }
        if (p.kind === 'devdesk' || p.kind === 'hwlab') {
          var seats = (p.padsLocal || []).length, first = p.kind === 'devdesk' ? 1 : 0;
          var n = p.kind === 'hwlab' ? Math.min(seats, QT.G.S.rdStaff())
                : (S.p.staff.owned ? Math.min(S.p.staff.level, seats - first) : 0);
          for (var si = 0; si < n; si++) {
            var q2 = staffSeat(p, si + first);
            list.push({ x: q2.x - 4, y: q2.y - 4, w: 8, h: 8, staff: si + first, plot: p });
          }
        }
        return;
      }
      list.push({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: p.h * TILE, p: p });
    });
    if (!RIDE.on) pushTo({ x: S.player.x - 4, y: S.player.y - 4, w: 8, h: 8, pl: true });
    if (artList('rail', '*')) artRun('rail', '*', [S, H, pushRailArt]);
    else {
      updateTrains(S);
      for (i = 0; i < RAIL_ITEMS.length; i++) if (bkVis[RAIL_ITEMS[i].b]) bkList[RAIL_ITEMS[i].b].push(RAIL_ITEMS[i]);
    }
    if (S.angel) pushTo({ x: S.angel.x - 4, y: S.angel.y - 4, w: 8, h: 8, angel: true });
    if (W.BY_ID.ship && QT.G.roomOpen(W.BY_ID.ship.room)) {
      var tp = truckPos(S);
      if (tp) { var tb = truckBox(tp); tb.truck = true; pushTo(tb); }
    }
    S.outputs.forEach(function (o) { pushTo({ x: o.x - 5, y: o.y - 5, w: 10, h: 10, o: o }); });
    S.items.forEach(function (it) {
      var k = Math.max(0, Math.min(1, it.t / it.dur));
      var wx = it.x0 + (it.x1 - it.x0) * k, wy = it.y0 + (it.y1 - it.y0) * k;
      pushTo({ x: wx - 4, y: wy - 4, w: 8, h: 8, it: it, wx: wx, wy: wy });
    });
    for (i = 0; i < visD.length; i++) {
      d = visD[i];
      if (QT.G.roomOpen(d.id)) {
        artRun('scene', d.id, [d, S, H, pushScene]);
        artRun('scene', '*', [d, S, H, pushScene]);
      } else {
        artRun('scene', d.id, [d, S, H, pushScene]);
        var fl = bkList[DIST_BK[d.id]];
        fenceSegs(d).forEach(function (f) {
          var r = f.r;
          fl.push({ x: r.x * TILE, y: r.y * TILE, w: r.w * TILE, h: r.h * TILE, fence: f.side, low: f.low,
                    signs: f.signs, side: f.side, d: d, r: r });
        });
      }
    }
    for (i = 0; i < NB; i++) {
      var list2 = bkList[i];
      if (!bkVis[i] || !list2.length) continue;
      sortByDepth(list2);
      for (j = 0; j < list2.length; j++) {
        var e = list2[j];
        ctx.save();
        drawEntry(e, S);
        ctx.restore();
        if (ghost.s && !ghost.hid && !e.pl && occludes(e, ghost.s, S)) ghost.hid = true;
      }
    }
    if (ghost.hid && !RIDE.on) drawGhost(S);
    drawFx(S);
  }
  var ghost = { s: null, hid: false };
  var GHOST_SKIP = { cust: 1, staff: 1, angel: 1, it: 1, o: 1 };
  function occH(e, S) {
    if (e.p) {
      if (isDeco(e.p)) { var dh = decoHeight(e.p); return dh > 14 ? [0, dh] : null; }
      return S.p[e.p.id] && S.p[e.p.id].owned ? [0, 64] : null;
    }
    if (e.base) return [0, H_WALL];
    if (e.fixture) return [0, 24];
    if (e.fence) return e.low ? null : [0, CURB + FENCE_H];
    if (e.rail) return null;
    if (e.truck) return [0, 30];
    if (e.draw) return (e.w || 0) * (e.h || 0) >= TILE * TILE ? [0, 40] : null;
    return null;
  }
  function insideBox(sx, sy, e, lo, hi) {
    var f = I.toWorld(sx, sy), k = 1 / (2 * I.B);
    var u0 = Math.max(e.x - f.x, e.y - f.y, lo * k), u1 = Math.min(e.x + e.w - f.x, e.y + e.h - f.y, hi * k);
    return u1 >= u0;
  }
  function occludes(e, s, S) {
    for (var key in GHOST_SKIP) if (e[key] != null && e[key] !== false) return false;
    var hh = occH(e, S);
    if (!hh || !(e.w > 0) || !(e.h > 0)) return false;
    return insideBox(s.x, s.y - 20, e, hh[0], hh[1]) || insideBox(s.x, s.y - 9, e, hh[0], hh[1]);
  }
  function ghostOverUi(S) {
    if (!plR || RIDE.on) return;
    var gh = QT.Guide && QT.Guide.hits ? QT.Guide.hits() : null;
    if (!gh) return;
    var hit = false;
    [gh.next, gh.mark].forEach(function (r) { if (r && onPlayer(r.x, r.y, r.x + r.w, r.y + r.h, 0)) hit = true; });
    if (!hit) return;
    worldTransform();
    drawGhost(S, 0.9);
    uiTransform();
  }
  function drawGhost(S, alpha) {
    var pl = S.player, s = P(pl.x, pl.y, 0), bob = Math.abs(Math.sin(pl.walk)) * 1.8;
    ctx.save();
    ctx.translate(s.x, s.y - bob);
    ctx.globalAlpha = alpha || 0.62;
    ctx.lineWidth = 1.1; ctx.strokeStyle = '#ffffff';
    rr(ctx, -3.6, -6, 7.2, 6, 1.5); ctx.fillStyle = '#3c4767'; ctx.fill(); ctx.stroke();
    rr(ctx, -5.4, -14, 10.8, 9.5, 3.6); ctx.fillStyle = C.blue; ctx.fill(); ctx.stroke();
    rr(ctx, -4, -22, 8, 8.6, 3.4); ctx.fillStyle = '#ffd9b8'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -20.5, 5.1, Math.PI, 0); ctx.closePath();
    ctx.fillStyle = C.gold; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function glass(x, y, w, h, r) {
    ctx.save();
    ctx.shadowColor = 'rgba(50,40,80,0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    fillRR(ctx, x, y, w, h, r || 16, 'rgba(255,255,255,0.95)');
    ctx.restore();
    strokeRR(ctx, x, y, w, h, r || 16, 'rgba(120,110,160,0.16)', 1);
  }
  function bar(x, y, w, h, ratio, col) {
    fillRR(ctx, x, y, w, h, h / 2, '#ebe7f3');
    var ww = Math.max(0, Math.min(1, ratio)) * w;
    if (ww > 2) fillRR(ctx, x, y, ww, h, h / 2, col);
  }
  var HUD_H = 84, HUD_S = 44, OBJ_H = 22, EV_H = 38, CHIP_H = 28, MM_W = 72, MM_H = 40;
  var OFFER_W = 172, JOBS_W = 82, EVC_W = 108;
  function evActive() { var S = QT.G.S; return !!(S.ev && S.ev.until > S.t && S.ev.until - S.ev.at > 7); }
  var HUD_MAXW = 420;
  function hudW() { return Math.min(cssW - 20, HUD_MAXW); }
  var hudOpen = false;
  try { hudOpen = window.localStorage.getItem('re_hudOpen') === '1'; } catch (e) { }
  function setHudOpen(v) {
    hudOpen = !!v;
    try { window.localStorage.setItem('re_hudOpen', hudOpen ? '1' : '0'); } catch (e) { }
  }
  function hudH() { return hudOpen ? HUD_H : HUD_S; }
  function layout() {
    var S = QT.G.S, pad = 10, top = 8, w = hudW(), hh = hudH();
    var o = { hud: { x: pad, y: top, w: w, h: hh }, chips: [], ev: null };
    var wide = cssW - 20 - w >= MM_W + 8 + 150;
    var oy = top + hh + 4;
    o.wide = wide;
    if (wide) {
      o.mm = { x: cssW - 10 - MM_W, y: top, w: MM_W, h: MM_H };
      var ex0 = pad + w + 8;
      if (evActive()) o.ev = { x: ex0, y: top, w: Math.min(320, o.mm.x - 8 - ex0), h: EV_H };
      o.obj = { x: pad, y: oy, w: w, h: OBJ_H };
    } else {
      o.mm = { x: cssW - 10 - MM_W, y: oy, w: MM_W, h: MM_H };
      o.obj = { x: pad, y: oy, w: Math.max(120, o.mm.x - 6 - pad), h: OBJ_H };
    }
    var list = [];
    if (S.offer && !S.won) list.push({ k: 'offer', w: OFFER_W });
    if (S.jobs.length && !S.won) list.push({ k: 'jobs', w: JOBS_W });
    if (!wide && evActive()) list.push({ k: 'ev', w: EVC_W, flex: true });
    var fxc = QT.FX && QT.FX.chips && !S.won ? QT.FX.chips(S) : null;
    if (fxc) fxc.forEach(function (c) { if (c.first) list.unshift(c); else list.push(c); });
    var cy = oy + OBJ_H + 4, cx = pad, bottom = oy + OBJ_H;
    function rowR(y) { return !wide && y < o.mm.y + o.mm.h + 2 ? o.mm.x - 6 : pad + w; }
    list.forEach(function (c) {
      var r = rowR(cy);
      if (cx > pad && (cx + c.w > r || c.full)) { cy += CHIP_H + 4; cx = pad; r = rowR(cy); }
      var cw = c.full ? r - cx : c.flex ? Math.max(c.w, Math.min(240, r - cx)) : c.w;
      c.x = cx; c.y = cy; c.w = Math.min(cw, r - cx); c.h = CHIP_H;
      o.chips.push(c);
      cx += c.w + 6;
      if (c.full) { cy += CHIP_H + 4; cx = pad; }
      bottom = Math.max(bottom, c.y + CHIP_H);
    });
    if (!wide) bottom = Math.max(bottom, o.mm.y + o.mm.h);
    o.bottom = bottom + 4;
    return o;
  }
  function hudBottom() { return layout().bottom; }
  function currentRoom(S) { return W.roomAtPx(S.player.x, S.player.y); }
  function clearOfGates(x, y, hw, hb) {
    for (var i = 0; i < gateRects.length; i++) {
      var g = gateRects[i];
      if (x + hw - 4 > g.l && x - hw + 4 < g.r && y + hb - 3 > g.t && y - hb + 3 < g.b) y = g.t - hb - 2;
    }
    return y;
  }
  var NEAR_LABEL = 8, NEAR_PRICE = 6, NEAR_PILL = 9, NEAR_ALERT = 16, MAX_PILLS = 4;
  var plR = null;
  function playerRect(S) {
    if (RIDE.on || !S || !S.player) return null;
    var s = toScreen(S.player.x, S.player.y, 0), n = S.player.carry ? S.player.carry.length : 0;
    var up = (n ? 38 + (n - 1) * 12 : 28) * z;
    return { x0: s.x - 9 * z, x1: s.x + 9 * z, y0: s.y - up, y1: s.y + 4 * z, cx: s.x, cy: s.y };
  }
  function onPlayer(x0, y0, x1, y1, m) {
    var r = plR;
    if (!r) return false;
    m = m || 0;
    return x1 > r.x0 - m && x0 < r.x1 + m && y1 > r.y0 - m && y0 < r.y1 + m;
  }
  function tilesTo(S, x, y, w, h) {
    var px = S.player.x / TILE, py = S.player.y / TILE;
    return Math.hypot(Math.max(x - px, 0, px - (x + w)), Math.max(y - py, 0, py - (y + h)));
  }
  var nextT = { at: -1, plot: null, x: 0, y: 0, on: false };
  function nextTarget(S) {
    if (nextT.at === S.t) return nextT;
    nextT.at = S.t; nextT.plot = null; nextT.on = false;
    var n = QT.Guide && QT.Guide.next ? QT.Guide.next() : null;
    if (!n) return nextT;
    if (n.pad) {
      nextT.on = true; nextT.x = (n.pad.x + 0.5) * TILE; nextT.y = (n.pad.y + 0.5) * TILE;
      nextT.plot = n.pad.p || null;
    } else if (n.pt) { nextT.on = true; nextT.x = n.pt.x; nextT.y = n.pt.y; }
    if (nextT.on && !nextT.plot) {
      var tx = nextT.x / TILE, ty = nextT.y / TILE;
      for (var i = 0; i < W.PLOTS.length; i++) {
        var p = W.PLOTS[i];
        if (!isDeco(p) && tx >= p.x && tx < p.x + p.w && ty >= p.y && ty < p.y + p.h) { nextT.plot = p; break; }
      }
    }
    return nextT;
  }
  function labelShown(S, p) {
    var nt = nextTarget(S);
    if (isDeco(p) || p.kind === 'station') return false;
    return (nt.plot === p) || tilesTo(S, p.x, p.y, p.w, p.h) <= NEAR_LABEL;
  }
  var labelBoxes = [];
  function drawWorldLabels(S) {
    var top = hudBottom(), nt = nextTarget(S);
    labelBoxes.length = 0;
    gateRects.forEach(function (g) { labelBoxes.push({ x0: g.l, x1: g.r, y0: g.t, y1: g.b }); });
    W.PLOTS.forEach(function (p) {
      if (!QT.G.roomOpen(p.room) || isDeco(p)) return;
      if (p.kind === 'station') return;
      if (blockClosed(p)) return;
      var st = S.p[p.id];
      if (!st) return;
      var isNext = nt.plot === p, dist = tilesTo(S, p.x, p.y, p.w, p.h);
      if (!isNext && dist > NEAR_LABEL) return;
      var fs = Math.max(10, Math.min(14, 3.9 * z));
      var hh = st.owned ? (p.kind === 'store' || p.kind === 'office'
                           ? H_PLOT + 14 : p.kind === 'myhome' ? H_PLOT + 44 : H_PLOT + 18) : 22;
      var s = toScreen((p.x + p.w / 2) * TILE, (p.y + p.h / 2) * TILE, hh);
      var two = !st.owned && p.cost && (isNext || dist <= NEAR_PRICE);
      var name = st.owned ? L.nm(p, 'short') + (p.cost && st.level ? '  Lv.' + st.level : '') : L.nm(p, 'short');
      var cost = two ? QT.G.costOf(p) : 0;
      ctx.font = '800 ' + fs + 'px ' + FONT;
      var lw = ctx.measureText(name).width;
      if (two) lw = Math.max(lw, ctx.measureText('-¥' + QT.G.fmt(cost)).width);
      var hb = two ? fs * 0.75 + fs * 0.65 : fs * 0.65;
      s.y = clearOfGates(s.x, s.y, lw / 2 + 3, hb);
      if (s.y < top || s.y > cssH || s.x < -130 || s.x > cssW + 130) return;
      var lb = { x0: s.x - lw / 2 - 3, x1: s.x + lw / 2 + 3,
                 y0: s.y - (two ? fs * 1.4 : fs * 0.65), y1: s.y + (two ? fs * 1.4 : fs * 0.65) };
      labelBoxes.push(lb);
      var fade = onPlayer(lb.x0, lb.y0, lb.x1, lb.y1, 4);
      if (fade) { ctx.save(); ctx.globalAlpha = 0.22; }
      if (!two) {
        txt(ctx, name, s.x, s.y, fs, '#3b3757', 'center', 800, 'rgba(255,255,255,0.95)');
      } else {
        var ok = S.coins >= cost;
        txt(ctx, name, s.x, s.y - fs * 0.75, fs, ok ? '#3b3757' : '#9a94ad', 'center', 800, 'rgba(255,255,255,0.95)');
        txt(ctx, '-¥' + QT.G.fmt(cost), s.x, s.y + fs * 0.75, fs, ok ? '#c98f0f' : '#c07a86', 'center', 800, 'rgba(255,255,255,0.95)');
      }
      if (fade) ctx.restore();
    });
    drawBlockLabels(S, top);
    drawReserveLabels(S, top);
  }
  var RSV_NAMED = { bigsight: { at: 'expo_out', h: 62 }, svc_bay: { h: 4 },
                    tvst: { h: 20, sub: function () {
                      var sn = QT.Sim && QT.Sim.sns;
                      if (!sn || !sn.tvShow) return L.t('distSoon');
                      var on = sn.tvOnAir ? sn.tvOnAir() : 0;
                      return on > 0 ? L.t('sns_tvOnAir', { n: Math.ceil(on) }) : L.t('rsvSub_tvst');
                    } } };
  function drawReserveLabels(S, top) {
    var byId = {};
    (W.RESERVES || []).forEach(function (r) { byId[r.id] = r; });
    (W.RESERVES || []).forEach(function (r0) {
      var nm0 = RSV_NAMED[r0.id];
      if (!nm0 || !QT.G.roomOpen(r0.district)) return;
      if (W.BY_ID[r0.id]) return;
      if (QT.Art && QT.Art.rsvBuilt && QT.Art.rsvBuilt(r0.id)) return;
      var r = (nm0.at && byId[nm0.at]) || r0, hh = nm0.h;
      var bsa = QT.Art && QT.Art.ariakeBS;
      if (r0.id === 'bigsight' && bsa) { r = { x: bsa.x / TILE, y: bsa.y / TILE, w: bsa.w / TILE, h: bsa.d / TILE }; hh = bsa.top + 8; }
      if (r0.id === 'svc_bay' && bsa && bsa.x < (r0.x + r0.w) * TILE && bsa.x + bsa.w > r0.x * TILE &&
          bsa.y < (r0.y + r0.h) * TILE && bsa.y + bsa.d > r0.y * TILE) return;
      if (tilesTo(S, r.x, r.y, r.w, r.h) > NEAR_LABEL) return;
      var s = toScreen((r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE, hh);
      var fs = Math.max(9, Math.min(13, 3.6 * z)), name = L.t('rsvLabel_' + r0.id), sub = nm0.sub ? nm0.sub() : L.t('distSoon');
      ctx.font = '800 ' + fs + 'px ' + FONT;
      var lw = Math.max(ctx.measureText(name).width, ctx.measureText(sub).width * 0.85);
      s.y = clearOfGates(s.x, s.y, lw / 2 + 3, fs * 1.4);
      if (s.y < top || s.y > cssH || s.x < -130 || s.x > cssW + 130) return;
      var lb = { x0: s.x - lw / 2 - 3, x1: s.x + lw / 2 + 3, y0: s.y - fs * 1.4, y1: s.y + fs * 1.4 };
      for (var i = 0; i < labelBoxes.length; i++) {
        var o = labelBoxes[i];
        if (lb.x0 < o.x1 && lb.x1 > o.x0 && lb.y0 < o.y1 && lb.y1 > o.y0) return;
      }
      labelBoxes.push(lb);
      var fade = onPlayer(lb.x0, lb.y0, lb.x1, lb.y1, 4);
      if (fade) { ctx.save(); ctx.globalAlpha = 0.22; }
      txt(ctx, name, s.x, s.y - fs * 0.75, fs, '#5b5670', 'center', 800, 'rgba(255,255,255,0.95)');
      txt(ctx, sub, s.x, s.y + fs * 0.75, fs * 0.85, '#8a849c', 'center', 700, 'rgba(255,255,255,0.95)');
      if (fade) ctx.restore();
    });
  }
  function drawBlockLabels(S, top) {
    var B = W.BLOCKS;
    if (!B) return;
    Object.keys(B).forEach(function (id) {
      var bl = B[id], r = blockRect(bl);
      if (!r || !QT.G.roomOpen(bl.district) || !blockClosed({ block: id })) return;
      if (tilesTo(S, r.x, r.y, r.w, r.h) > NEAR_LABEL + 4) return;
      var s = toScreen((r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE, 34);
      if (s.y < top || s.y > cssH || s.x < -160 || s.x > cssW + 160) return;
      var fs = Math.max(10, Math.min(14, 3.9 * z)), name = L.nm(bl), cond = condText(bl);
      ctx.font = '800 ' + fs + 'px ' + FONT;
      var lw = Math.max(ctx.measureText(name).width, ctx.measureText(cond).width * 0.85);
      var lb = { x0: s.x - lw / 2 - 3, x1: s.x + lw / 2 + 3, y0: s.y - fs * 1.4, y1: s.y + fs * 1.4 };
      if (plR && onPlayer(lb.x0, lb.y0, lb.x1, lb.y1, 4)) {
        var pcx = (plR.x0 + plR.x1) / 2, dx = s.x < pcx ? plR.x0 - 8 - lb.x1 : plR.x1 + 8 - lb.x0;
        if (lb.x0 + dx > 4 && lb.x1 + dx < cssW - 4) { s.x += dx; lb.x0 += dx; lb.x1 += dx; }
      }
      labelBoxes.push(lb);
      var fade = onPlayer(lb.x0, lb.y0, lb.x1, lb.y1, 4);
      if (fade) { ctx.save(); ctx.globalAlpha = 0.22; }
      fillRR(ctx, lb.x0 - 4, lb.y0 - 1, lb.x1 - lb.x0 + 8, lb.y1 - lb.y0 + 2, 6, 'rgba(255,255,255,0.88)');
      strokeRR(ctx, lb.x0 - 4, lb.y0 - 1, lb.x1 - lb.x0 + 8, lb.y1 - lb.y0 + 2, 6, '#cfc9db', 1.2);
      txt(ctx, name, s.x, s.y - fs * 0.75, fs, '#5b5670', 'center', 800, 'rgba(255,255,255,0.95)');
      txt(ctx, cond, s.x, s.y + fs * 0.75, fs * 0.85, '#6d6880', 'center', 700, 'rgba(255,255,255,0.95)');
      if (fade) ctx.restore();
    });
  }
  function bubble(x, y, text, col, sub, tail, prog) {
    ctx.font = '800 11.5px ' + FONT;
    var tw = ctx.measureText(text).width;
    var sw = 0;
    if (sub) { ctx.font = '700 10px ' + FONT; sw = ctx.measureText(sub).width; }
    var w = Math.max(tw, sw, prog != null ? 76 : 0) + 22;
    var h = (sub ? 34 : 24) + (prog != null ? 10 : 0);
    var bx = x - w / 2, by = y - h;
    ctx.save();
    ctx.shadowColor = 'rgba(50,40,80,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    rr(ctx, bx, by, w, h, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill();
    ctx.restore();
    if (tail !== false) {
      ctx.beginPath();
      ctx.moveTo(x - 5, by + h - 1); ctx.lineTo(x, by + h + 6); ctx.lineTo(x + 5, by + h - 1);
      ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill();
    }
    strokeRR(ctx, bx, by, w, h, 9, prog != null ? col : 'rgba(120,110,160,0.18)', prog != null ? 1.8 : 1);
    var ty = sub ? by + 12 : by + (prog != null ? 13 : h / 2);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(bx + 9, ty, 3.4, 0, 7); ctx.fill();
    txt(ctx, text, bx + 16, ty, 11.5, C.ink, 'left', 800);
    if (sub) txt(ctx, sub, bx + 16, by + 25, 10, C.inkSoft, 'left');
    if (prog != null) bar(bx + 10, by + h - 9, w - 20, 5, prog, col);
    return w;
  }
  function miniPill(x, y, text, col, tail) {
    if (text === '!') {
      var r0 = 11;
      ctx.save();
      ctx.shadowColor = 'rgba(50,40,80,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      ctx.beginPath(); ctx.arc(x, y - r0, r0, 0, 7);
      ctx.fillStyle = col; ctx.fill();
      ctx.restore();
      txt(ctx, '!', x, y - r0, 14, '#ffffff', 'center', 900);
      return 2 * r0;
    }
    ctx.font = '800 11.5px ' + FONT;
    var w = ctx.measureText(text).width + 18, h = 21;
    var bx = x - w / 2, by = y - h;
    ctx.save();
    ctx.shadowColor = 'rgba(50,40,80,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    rr(ctx, bx, by, w, h, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill();
    ctx.restore();
    if (tail !== false) {
      ctx.beginPath();
      ctx.moveTo(x - 4, by + h - 1); ctx.lineTo(x, by + h + 5); ctx.lineTo(x + 4, by + h - 1);
      ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill();
    }
    strokeRR(ctx, bx, by, w, h, 10, 'rgba(120,110,160,0.18)', 1);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(bx + 8, by + h / 2, 3.2, 0, 7); ctx.fill();
    txt(ctx, text, bx + 14, by + h / 2, 11.5, C.ink, 'left', 800);
    return w;
  }
  function drawGoal(S) {
    var g = S.player.goal;
    if (!g) return;
    var s = toScreen(g.x, g.y, 0), k = 0.5 + 0.5 * Math.sin(S.t * 8);
    ctx.save();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.6 + 0.4 * k;
    ctx.beginPath(); ctx.ellipse(s.x, s.y, (7 + 3 * k) * z / 3, (4 + 1.5 * k) * z / 3, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function findPad(type, plotId) {
    var all = QT.G.PADS();
    for (var i = 0; i < all.length; i++) {
      var q = all[i];
      if (q.type === type && (!plotId || (q.p && q.p.id === plotId))) return q;
    }
    return null;
  }
  function collectBubbles(S) {
    var out = [], alerted = [];
    alertList(S).forEach(function (e) {
      var tp = e.tap || e.pad;
      out.push({ wx: e.x, wy: e.y, h: e.h || (H_PLOT + 26), mini: true,
                 text: /^[+]?¥/.test(e.text) ? e.text : '!', col: e.col, pri: 0,
                 gx: tp ? (tp.x + 0.5) * TILE : e.x, gy: tp ? (tp.y + 0.5) * TILE : e.y,
                 d: Math.hypot(e.x - S.player.x, e.y - S.player.y), plot: e.plot || (tp && tp.p) || null });
      if (e.pad) alerted.push(e.pad);
    });
    var pads = [], held = null, seen = {};
    var hp = S.heldPad, hk = hp && hp.p && hp.p.padsLocal ? hp.p.id + '|' + hp.type : null;
    QT.G.PADS().forEach(function (pad) {
      if (!QT.G.padActive(pad)) return;
      var info = QT.G.padInfo(pad);
      if (!info || !info.can) return;
      if (info.quiet && S.heldPad !== pad) return;
      if (S.heldPad !== pad && (pad.type === 'collectSvc' || pad.type === 'collectDc')) return;
      var wx = (pad.x + 0.5) * TILE, wy = (pad.y + 0.5) * TILE;
      var e = {
        wx: wx, wy: wy, h: 4, text: info.label, col: padCol(pad, info), pri: 1,
        sub: info.gain ? '+¥' + QT.G.fmt(info.gain) : (info.cost ? '-¥' + QT.G.fmt(info.cost) : null),
        d: Math.hypot(wx - S.player.x, wy - S.player.y), gx: wx, gy: wy, plot: pad.p || null
      };
      if (S.heldPad === pad) {
        e.pri = -1;
        e.prog = info.hold > 0 ? Math.min(1, S.holdT / info.hold) : 1;
        held = e;
      } else {
        var gk = pad.p && pad.p.padsLocal ? pad.p.id + '|' + pad.type : null;
        if (gk) { if (gk === hk || seen[gk]) return; seen[gk] = true; }
        e.mini = true;
        e.text = e.sub || '!';
        e.sub = null;
        if (e.text === '!' && alerted.indexOf(pad) >= 0) return;
        if (pad.type === 'buy' && pad.p) {
          var pp = pad.p, own = S.p[pp.id] && S.p[pp.id].owned;
          if (!own && pp.cost) return;
          e.wx = (pp.x + pp.w / 2) * TILE; e.wy = (pp.y + pp.h / 2) * TILE;
          e.h = (pp.kind === 'store' || pp.kind === 'office') ? H_PLOT + 14 : H_PLOT + 18;
        }
        pads.push(e);
      }
    });
    var nt = nextTarget(S), lim = NEAR_PILL * TILE, limA = NEAR_ALERT * TILE;
    out.forEach(function (e) { e.al = 1; });
    var minis = out.concat(pads).filter(function (e) {
      e.nx = nt.on && ((nt.plot && e.plot === nt.plot) || Math.hypot(e.gx - nt.x, e.gy - nt.y) < TILE * 0.6) ? 1 : 0;
      return e.nx || e.d <= (e.al ? limA : lim);
    });
    minis.sort(function (a, b) { return (b.nx - a.nx) || ((b.al || 0) - (a.al || 0)) || (a.d - b.d); });
    return (held ? [held] : []).concat(minis.slice(0, MAX_PILLS));
  }
  var bubHits = [], bubHitAt = 0;
  var uiCovers = [];
  function drawBubbles(S) {
    bubHits = []; bubHitAt = performance.now();
    var band0 = hudBottom() + 20, band1 = cssH - 96;
    var list = collectBubbles(S).filter(function (e) {
      var s = toScreen(e.wx, e.wy, e.h);
      e.tx = s.x; e.ty = s.y;
      return e.pri === -1 || !(s.x < 0 || s.x > cssW || s.y < 0 || s.y > cssH);
    });
    if (!list.length) return;
    list.forEach(function (e) {
      if (e.mini) {
        e.hh = e.text === '!' ? 22 : 21;
        ctx.font = '800 11.5px ' + FONT;
        e.bw = e.text === '!' ? 22 : ctx.measureText(e.text).width + 18;
      } else {
        e.hh = (e.sub ? 34 : 24) + (e.prog != null ? 10 : 0);
        e.bw = 150;
      }
      var m = e.bw / 2 + 6;
      e.bx = Math.max(m, Math.min(cssW - m, e.tx));
      e.by = e.ty - 20;
      e.bob = Math.sin(S.t * 3 + e.wx * 0.05) * 2;
    });
    list.sort(function (a, b) { return (a.pri - b.pri) || (a.by - b.by); });
    if (band1 < band0 + 40) band1 = band0 + 40;
    var used = [];
    list.forEach(function (e) {
      e.by = Math.max(band0 + e.hh, Math.min(band1, e.by));
      var y0 = e.by, found = null;
      for (var k = 0; k <= 80 && found == null; k++) {
        var dn = y0 + k * 1.5, upy = y0 - k * 3;
        if (k * 1.5 <= 10 && spotFree(e, dn, used, band0, band1)) found = dn;
        else if (spotFree(e, upy, used, band0, band1)) found = upy;
        else if (spotFree(e, dn, used, band0, band1)) found = dn;
      }
      if (found != null) e.by = found;
      else {
        for (var pass = 0; pass < 8; pass++) {
          var hit = false;
          for (var i = 0; i < used.length; i++) {
            var u = used[i];
            if (Math.abs(u.bx - e.bx) < (u.bw + e.bw) / 2 + 8 && Math.abs(u.by - e.by) < e.hh + 6) {
              e.by = u.by + e.hh + 6; hit = true; break;
            }
          }
          if (!hit) break;
          if (e.by > band1) { e.by = band1; break; }
        }
      }
      used.push(e);
    });
    list.forEach(function (e) {
      var moved = Math.abs(e.by - (e.ty - 20)) > 14 || Math.abs(e.bx - e.tx) > 6;
      e.by += e.bob;
      var cross = moved && (e.pri === -1 || onPlayer(Math.min(e.bx, e.tx), Math.min(e.by, e.ty), Math.max(e.bx, e.tx), Math.max(e.by, e.ty), 2));
      var fade = onPlayer(e.bx - e.bw / 2, e.by - e.hh, e.bx + e.bw / 2, e.by + 3, 2);
      if (fade) { ctx.save(); ctx.globalAlpha = 0.3; }
      if (moved && !cross) {
        ctx.save();
        ctx.strokeStyle = e.col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(e.bx, e.by + 4); ctx.lineTo(e.tx, e.ty);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = e.col; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(e.tx, e.ty, 3, 0, 7); ctx.fill();
        ctx.restore();
      }
      var bw = e.mini ? miniPill(e.bx, e.by, e.text, e.col, !moved)
                      : bubble(e.bx, e.by, e.text, e.col, e.sub, !moved, e.prog);
      if (fade) ctx.restore();
      if (e.gx != null) bubHits.push({ x: e.bx - bw / 2, y: e.by - e.hh, w: bw, h: e.hh, gx: e.gx, gy: e.gy });
    });
  }
  function spotFree(e, y, used, band0, band1) {
    if (y - e.hh < band0 - 0.5 || y > band1 + 0.5) return false;
    if (onPlayer(e.bx - e.bw / 2, y - e.hh, e.bx + e.bw / 2, y + 6, 6)) return false;
    if (e.mini && labelAt(e.bx, e.bw, y, e.hh)) return false;
    for (var i = 0; i < used.length; i++) {
      var u = used[i];
      if (Math.abs(u.bx - e.bx) < (u.bw + e.bw) / 2 + 8 && y > u.by - u.hh - 6 && y - e.hh < u.by + 6) return false;
    }
    return true;
  }
  function labelAt(x, w, y, h) {
    for (var i = 0; i < labelBoxes.length; i++) {
      var b = labelBoxes[i];
      if (x + w / 2 > b.x0 - 2 && x - w / 2 < b.x1 + 2 && y + 3 > b.y0 - 2 && y - h < b.y1 + 2) return b;
    }
    return null;
  }
  function inR(p, r) { return !!r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  ART.on('tap', function (p, S) {
    if (S.won || S.showFinance || S.gacha) return false;
    if (performance.now() - bubHitAt > 500) return false;
    var Gd = QT.Guide;
    if (Gd && Gd.shown && Gd.shown()) return false;
    var gh = Gd && Gd.hits && Gd.hits();
    if (gh && (inR(p, gh.next) || inR(p, gh.q))) return false;
    for (var c = 0; c < uiCovers.length; c++) if (inR(p, uiCovers[c])) return false;
    var best = null, bd = 7;
    for (var i = bubHits.length - 1; i >= 0; i--) {
      var h = bubHits[i];
      var dx = Math.max(h.x - p.x, 0, p.x - (h.x + h.w)), dy = Math.max(h.y - p.y, 0, p.y - (h.y + h.h));
      var dd = Math.hypot(dx, dy);
      if (dd < bd) { bd = dd; best = h; }
    }
    if (!best) return false;
    var go = function () {
      QT.G.goTo(best.gx, best.gy);
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
    };
    if (!(QT.Input && QT.Input.deferTap && QT.Input.deferTap(go, true))) go();
    return true;
  });
  function alertList(S) {
    var a = [];
    function add(id, text, col, tapType) {
      var p = W.BY_ID[id];
      if (!p || !QT.G.roomOpen(p.room)) return;
      a.push({ x: (p.x + p.w / 2) * TILE, y: (p.y + p.h / 2) * TILE, h: H_PLOT + 26, text: text, col: col,
               tap: tapType ? findPad(tapType, id) : null, plot: p });
    }
    function addPad(type, text, col) {
      var pad = findPad(type);
      if (!pad || !QT.G.roomOpen(pad.p.room)) return;
      a.push({ x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE, h: 4, text: text, col: col, pad: pad });
    }
    (QT.G.alertHooks || []).forEach(function (fn) { try { fn(S, add, addPad, a); } catch (e) { } });
    return a;
  }
  function popTxt(c, s, x, y, size, fill, stroke, lw) {
    c.font = '900 ' + size + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = lw || Math.max(3, size / 4.2); c.strokeStyle = stroke || '#2a1a40'; c.strokeText(s, x, y);
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  var TOAST_MAX = 2;
  function drawToasts(S) {
    var n0 = Math.max(0, S.toasts.length - TOAST_MAX), lastT = null;
    S.toasts.forEach(function (t, ti) {
      if (ti < n0) return;
      var k = t.t / t.life;
      var pop = k < 0.12 ? 0.4 + (k / 0.12) * 0.95 : k < 0.25 ? 1.35 - ((k - 0.12) / 0.13) * 0.35 : 1;
      var s = toScreen(t.x, t.y, 24);
      var money = /^\+/.test(t.text);
      var size = Math.max(13, 4.4 * z) * (t.crit ? 1.7 : t.big ? 1.35 : money ? 1.15 : 1);
      var hw = t.text.length * size * 0.32;
      if (onPlayer(s.x - hw, s.y - size * 0.6, s.x + hw, s.y + size * 0.6, 4)) s.y = plR.y0 - size * 0.6 - 4;
      if (lastT && s.x + hw > lastT.x0 && s.x - hw < lastT.x1 && s.y + size * 0.6 > lastT.y0 && s.y - size * 0.6 < lastT.y1)
        s.y = lastT.y0 - size * 0.6 - 2;
      lastT = { x0: s.x - hw, x1: s.x + hw, y0: s.y - size * 0.6 - k * 18, y1: s.y + size * 0.6 - k * 18 };
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - Math.pow(k, 4));
      ctx.translate(s.x, s.y - k * 18); ctx.rotate(t.rot || 0); ctx.scale(pop, pop);
      popTxt(ctx, t.text, 0, 0, size, money ? (t.crit ? '#ffd23f' : '#ffe66b') : t.c, '#2a1a40');
      if (t.crit) {
        ctx.rotate(-0.12);
        popTxt(ctx, 'CRITICAL!!', 0, size * 0.95, size * 0.62, '#ff4d6d', '#ffffff', 4);
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
  var coins = [], hudBump = 0, coinSnd = 0;
  function spawnCoins(S) {
    var q = S.coinFx;
    if (!q || !q.length) return;
    if (QT.FX && QT.FX.jaraRecent && QT.FX.jaraRecent()) { q.length = 0; return; }
    q.forEach(function (e) {
      var s0 = toScreen(e.x, e.y, 24);
      for (var i = 0; i < e.n; i++)
        coins.push({ x0: s0.x + (Math.random() - 0.5) * 30, y0: s0.y + (Math.random() - 0.5) * 20,
                     t: -i * 0.045, dur: 0.55 + Math.random() * 0.25, lift: 40 + Math.random() * 60 });
    });
    q.length = 0;
  }
  function drawCoins(S, dt) {
    spawnCoins(S);
    var tx = coinAt.x, ty = coinAt.y;
    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      c.t += dt;
      if (c.t < 0) continue;
      var k = Math.min(1, c.t / c.dur), e = k * k;
      var x = c.x0 + (tx - c.x0) * e, y = c.y0 + (ty - c.y0) * e - Math.sin(k * Math.PI) * c.lift;
      var w = Math.abs(Math.cos(c.t * 14)) * 6 + 1.5;
      ctx.fillStyle = '#b97e00'; ctx.beginPath(); ctx.ellipse(x, y + 1, w, 7, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y, w, 7, 0, 0, 7); ctx.fill();
      if (k >= 1) {
        coins.splice(i, 1); hudBump = 1;
        if (S.t - coinSnd > 0.06) { coinSnd = S.t; QT.Sfx.play('tick', 1.2 + Math.random() * 0.3); }
      }
    }
    hudBump = Math.max(0, hudBump - dt * 4);
  }
  function drawCombo(S) {
    if ((S.combo || 0) < 2 || S.t - (S.comboAt || -99) > 3) return;
    var s = { x: cssW - 86, y: hudBottom() + 46 };
    var k = Math.min(1, (S.t - S.comboAt) / 0.18), sc = 1.5 - 0.5 * k;
    var fade = Math.max(0, 1 - Math.max(0, S.t - S.comboAt - 2.2) / 0.8);
    var col = S.combo >= 10 ? rainbow(S.t, 0) : S.combo >= 5 ? '#ff4d6d' : '#ffd23f';
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(s.x + 30, s.y - 6); ctx.rotate(-0.1); ctx.scale(sc, sc);
    popTxt(ctx, 'COMBO', 0, -9, 11, '#ffffff', '#2a1a40', 3.5);
    popTxt(ctx, '×' + S.combo, 0, 9, 20 + Math.min(14, S.combo), col, '#2a1a40', 5);
    ctx.restore();
  }
  var BANNER_LIFE = 1.5;
  function drawBanner(S, dt) {
    var q = S.banners;
    if (!q || !q.length) return;
    var b = q[0];
    if (b.at == null) {
      b.at = S.t;
      if (b.kind === 'area' || b.kind === 'mission') confettiBurst(b.kind === 'area' ? 80 : 40, cssW / 2, cssH * 0.34, 6.3);
    }
    var e = S.t - b.at;
    if (e > BANNER_LIFE) { q.shift(); return; }
    var cy = cssH * 0.33, cx = cssW / 2;
    if (plR && cy - 40 < plR.y1 && cy + 62 > plR.y0) cy = Math.max(hudBottom() + 44, plR.y0 - 66);
    var inK = Math.min(1, e / 0.18), out = e > BANNER_LIFE - 0.3 ? (e - (BANNER_LIFE - 0.3)) / 0.3 : 0;
    ctx.save();
    ctx.globalAlpha = 1 - out;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(S.t * 0.8);
    for (var i = 0; i < 18; i++) {
      ctx.rotate(Math.PI * 2 / 18);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, -cssW); ctx.lineTo(14, -cssW); ctx.closePath();
      ctx.fillStyle = i % 2 ? b.c : '#ffffff'; ctx.globalAlpha = (1 - out) * 0.22 * inK; ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.06);
    var bw = cssW * 1.2 * inK;
    ctx.fillStyle = '#2a1a40'; ctx.fillRect(-bw / 2, -34, bw, 68);
    ctx.fillStyle = b.c; ctx.fillRect(-bw / 2, -30, bw, 60);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    for (var j = 0; j < 7; j++) {
      var ly = -24 + j * 8, lx = ((S.t * 900 + j * 137) % (cssW * 1.4)) - cssW * 0.7;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 60, ly); ctx.stroke();
    }
    ctx.restore();
    var sc = e < 0.14 ? 2.4 - (e / 0.14) * 1.55 : e < 0.26 ? 0.85 + ((e - 0.14) / 0.12) * 0.15 : 1;
    var fs = Math.min(46, cssW / (b.text.length * 0.62));
    if (b.fs == null) {
      ctx.font = '900 ' + fs + 'px ' + FONT;
      var tw0 = ctx.measureText(b.text).width, maxW = cssW - 28;
      if (tw0 + 8 > maxW) fs *= (maxW - 8) / tw0;
      b.fs = fs;
    }
    fs = b.fs;
    ctx.save();
    ctx.translate(cx, cy - 4); ctx.rotate(-0.06); ctx.scale(sc, sc);
    popTxt(ctx, b.text, 0, 0, fs, '#ffffff', '#2a1a40', 8);
    ctx.restore();
    if (QT.FX && QT.FX.bannerDeco && b.kind) {
      try { QT.FX.bannerDeco(b, e, H, cx, cy); } catch (err) { console.error('[render] bannerDeco', err); }
    }
    if (b.sub) {
      ctx.font = '900 14px ' + FONT;
      var sub = b.sub, sw = ctx.measureText(sub).width;
      var ssz = sw > cssW - 40 ? 14 * (cssW - 40) / sw : 14;
      popTxt(ctx, sub, cx, cy + 52, ssz, '#ffffff', '#2a1a40', 4);
    }
    for (var k2 = 0; k2 < 6; k2++) {
      var a2 = k2 * 1.05 + e * 3, r2 = 70 + k2 * 18;
      star(cx + Math.cos(a2) * r2 * 1.4, cy + Math.sin(a2) * r2 * 0.5, 5 + (k2 % 3) * 2, k2 % 2 ? '#ffd23f' : '#ffffff');
    }
    ctx.restore();
  }
  function star(x, y, r, col) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr1 = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
      ctx.lineTo(x + Math.cos(a) * rr1, y + Math.sin(a) * rr1);
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#2a1a40'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  var shownHeMax = 0, heGrow = 0;
  var coinAt = { x: 30, y: 25 };
  L.add({
    render_jobsChip: ['依頼 {n}', 'Jobs {n}'],
    render_newShort: ['新規', 'New'],
    render_ovsShort: ['海外', 'INTL'],
    render_cantShort: ['作れない', "Can't do"],
    render_sampleShort: ['見本', 'Sample'],
    render_sampleBtn: ['理由', 'Why'],
    hudDate: ['{y}年目 {m}月・{a}歳', 'Yr {y} · M{m} · age {a}'],
    hudRate: ['金利 {r}%', 'Rate {r}%'],
    hudCF:   ['手取り {v} / {n}', 'Net {v} / {n}'],
    hudRent: ['家賃 {r}・返済 {p}（月）', 'Rent {r} · Loans {p} /mo'],
    hudNet:  ['純資産 {v}・借入 {d}', 'Net worth {v} · Debt {d}'],
    hudFree: ['自由 {p}%', 'Freedom {p}%']
  });
  var odo = { v: null, cells: [], wall: 0, dir: 1 };
  var ODO_ROLL = 0.16, odoW = {};
  function odoTarget(S) {
    var FX = QT.FX;
    if (FX && FX.cash) { try { var v = FX.cash(S); if (typeof v === 'number' && isFinite(v)) return v; } catch (e) { } }
    return S.coins;
  }
  function odoStep(S) {
    var now = performance.now() / 1000, dt = Math.max(0, Math.min(0.1, now - (odo.wall || now)));
    odo.wall = now;
    var tg = odoTarget(S);
    if (odo.v == null || !isFinite(odo.v)) odo.v = tg;
    else {
      var d = tg - odo.v;
      odo.dir = d >= 0 ? 1 : -1;
      odo.v = Math.abs(d) < 1 ? tg : odo.v + d * Math.min(1, dt * 12);
    }
    shownCash = odo.v;
    var str = '¥' + QT.G.fmt(odo.v), n = str.length, cells = odo.cells;
    var plain = n !== cells.length || str.replace(/[0-9]/g, '#') !== (odo.shape || '');
    odo.shape = str.replace(/[0-9]/g, '#');
    if (plain) cells.length = 0;
    for (var i = 0; i < n; i++) {
      var ch = str.charAt(n - 1 - i), c = cells[i];
      if (!c) { cells[i] = { ch: ch, from: null, k: 1 }; continue; }
      if (c.ch !== ch) {
        c.from = c.k < 0.5 && c.from != null ? c.from : c.ch;
        c.ch = ch; c.k = 0; c.dir = odo.dir;
      } else if (c.k < 1) c.k = Math.min(1, c.k + dt / ODO_ROLL);
    }
    cells.length = n;
    return str;
  }
  function charW(ch, size) {
    var key = size + ch;
    if (odoW[key] == null) odoW[key] = ctx.measureText(ch).width;
    return odoW[key];
  }
  function drawOdometer(str, x, y, size, col) {
    ctx.font = '800 ' + size + 'px ' + FONT;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    var n = str.length, cells = odo.cells, w = 0, ws = [];
    for (var i = 0; i < n; i++) { ws.push(charW(str.charAt(i), size)); w += ws[i]; }
    var rolling = false;
    for (var r = 0; r < n; r++) if (cells[r] && cells[r].k < 1) { rolling = true; break; }
    if (rolling) { ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - size * 0.62, w + 4, size * 1.24); ctx.clip(); }
    ctx.fillStyle = col;
    var cx = x, lh = size * 1.05;
    for (var j = 0; j < n; j++) {
      var ch = str.charAt(j), c = cells[n - 1 - j];
      if (c && c.k < 1 && c.from != null) {
        var e = 1 - (1 - c.k) * (1 - c.k), dir = c.dir || 1;
        ctx.fillText(c.from, cx, y - dir * e * lh);
        ctx.fillText(ch, cx, y + dir * (1 - e) * lh);
      } else ctx.fillText(ch, cx, y);
      cx += ws[j];
    }
    if (rolling) ctx.restore();
    return w;
  }
  var popAt = null;
  function drawCash(S, x, y, size, str, later) {
    var sc = 1 + hudBump * 0.18;
    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);
    var w = drawOdometer(str, 0, 0, size, hudBump > 0.3 ? '#c98f0f' : C.ink);
    ctx.restore();
    popAt = { x: x + w * sc + 6, y: y };
    if (!later) cashPop();
    return w * sc;
  }
  function cashPop() {
    if (!popAt || !(QT.FX && QT.FX.drawCashPop)) return;
    try { QT.FX.drawCashPop(H, popAt.x, popAt.y); } catch (e) { console.error('[render] cashPop', e); }
  }
  function drawHUD(S) {
    var lay = layout(), r = lay.hud;
    if (QT.FX && QT.FX.hudBump) hudBump = Math.max(hudBump, QT.FX.hudBump() || 0);
    var cashStr = odoStep(S);
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: Math.max(0, r.y - 8), w: r.w, h: Math.max(44, r.h + 8) }, function () {
      setHudOpen(!hudOpen);
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      return true;
    });
    if (hudOpen) drawHudFull(S, r, cashStr); else drawHudSlim(S, r, cashStr);
    uiCovers.push({ x: r.x, y: r.y, w: r.w, h: r.h });
    drawObjective(S, lay.obj);
    if (lay.ev) drawNewsCard(S, lay.ev);
  }
  function chevron(x, y, up, col) {
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (up) { ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y - 2); ctx.lineTo(x + 4, y + 2); }
    else { ctx.moveTo(x - 4, y - 2); ctx.lineTo(x, y + 2); ctx.lineTo(x + 4, y - 2); }
    ctx.stroke(); ctx.restore();
  }
  function hudCoin(x, y, r) {
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(160,110,0,0.45)';
    ctx.beginPath(); ctx.arc(x, y, r * 0.57, 0, 7); ctx.fill();
    coinAt.x = x; coinAt.y = y;
  }
  function feverRim(S, x, y, w, h, rad) {
    if (S.t >= (S.feverUntil || 0)) return;
    ctx.save();
    ctx.lineWidth = 3; ctx.strokeStyle = rainbow(S.t, 0);
    rr(ctx, x - 1, y - 1, w + 2, h + 2, rad + 1); ctx.stroke();
    ctx.restore();
    var fl = Math.ceil(S.feverUntil - S.t);
    fillRR(ctx, x + w / 2 - 62, y + h - 10, 124, 20, 10, rainbow(S.t, 2));
    popTxt(ctx, L.t('fever') + ' ' + fl + 's', x + w / 2, y + h, 11, '#ffffff', '#2a1a40', 3);
  }
  function hudInfo() {
    var G = QT.G, h = null;
    try { h = G.hudInfo ? G.hudInfo() : null; } catch (e) { h = null; }
    return h || { cf: 0, need: 1, ratio: 0, age: 0, year: 1, mon: 1, rate: 0, rateDir: 0, net: 0, debt: 0, rent: 0, pay: 0 };
  }
  function seasonTag() { return ''; }
  function dateStr(h) { return L.t('hudDate', { y: h.year, m: h.mon, a: h.age }); }
  function rateChip(h, x, cy, size) {
    var s = L.t('hudRate', { r: (h.rate * 100).toFixed(2) }) + (h.rateDir > 0 ? ' ▲' : h.rateDir < 0 ? ' ▼' : '');
    ctx.font = '800 ' + size + 'px ' + FONT;
    var w = ctx.measureText(s).width + 12;
    fillRR(ctx, x, cy - 8, w, 16, 8, h.rateDir > 0 ? 'rgba(226,80,74,0.13)' : 'rgba(111,87,224,0.10)');
    txt(ctx, s, x + 6, cy, size, h.rateDir > 0 ? C.red : C.violet, 'left', 800);
    return w;
  }
  function freedomBar(S, h, x, y, w, ht) {
    var k = Math.max(0, Math.min(1, h.ratio));
    bar(x, y, w, ht, k, k >= 1 ? C.gold : h.cf < 0 ? C.red : C.green);
  }
  function drawHudSlim(S, r, cashStr) {
    var G = QT.G, x = r.x, top = r.y, w = r.w, RX = x + w, h = hudInfo();
    glass(x, top, w, r.h, 14);
    hudCoin(x + 19, top + 16, 9);
    drawCash(S, x + 33, top + 16, 17, cashStr, true);
    txt(ctx, dateStr(h), RX - 25, top + 16, 10.5, C.inkSoft, 'right', 700);
    chevron(RX - 14, top + 16, false, '#9a94ad');
    cashPop();
    var rw = rateChip(h, x + 8, top + 32, 9.5);
    var vs = L.t('hudCF', { v: (h.cf < 0 ? '-' : '') + G.fmt(Math.abs(h.cf)), n: G.fmt(h.need) });
    ctx.font = '800 9.5px ' + FONT;
    var vw = ctx.measureText(vs).width;
    txt(ctx, vs, RX - 12, top + 33, 9.5, h.ratio >= 1 ? '#c98f0f' : h.cf < 0 ? C.red : C.green, 'right', 800);
    var bx0 = x + 8 + rw + 6;
    freedomBar(S, h, bx0, top + 31, Math.max(30, RX - 12 - vw - 8 - bx0), 5);
    feverRim(S, x, top, w, r.h, 14);
  }
  function drawHudFull(S, r, cashStr) {
    var G = QT.G, pad = r.x, top = r.y, w = r.w, RX = pad + w, hh = r.h, h = hudInfo();
    glass(pad, top, w, hh, 18);
    hudCoin(pad + 22, top + 22, 10.5);
    drawCash(S, pad + 38, top + 22, 19, cashStr);
    txt(ctx, dateStr(h), RX - 12, top + 15, 10.5, C.inkSoft, 'right', 700);
    rateChip(h, RX - 12 - 92, top + 32, 9.5);
    var row = L.t('hudRent', { r: G.fmt(h.rent), p: G.fmt(h.pay) });
    txt(ctx, row, pad + 12, top + 46, 10, C.inkSoft, 'left', 700);
    var vs = L.t('hudCF', { v: (h.cf < 0 ? '-' : '') + G.fmt(Math.abs(h.cf)), n: G.fmt(h.need) });
    txt(ctx, vs, RX - 12, top + 46, 10, h.ratio >= 1 ? '#c98f0f' : h.cf < 0 ? C.red : C.green, 'right', 800);
    freedomBar(S, h, pad + 12, top + 53, w - 24, 6);
    txt(ctx, L.t('hudNet', { v: (h.net < 0 ? '-' : '') + G.fmt(Math.abs(h.net)), d: G.fmt(h.debt) }), pad + 12, top + 70, 10,
      h.net >= 0 ? C.ink : C.red, 'left', 800);
    txt(ctx, L.t('hudFree', { p: Math.round(Math.max(0, h.ratio) * 100) }), RX - 12, top + 70, 10, '#c98f0f', 'right', 800);
    chevron(pad + w / 2, top + hh - 6, true, '#c4bfd3');
    feverRim(S, pad, top, w, hh, 18);
  }
  var objOpenAt = -99, evOpenAt = -99;
  function drawObjective(S, r) {
    var G = QT.G, pad = r.x, oy = r.y, w = r.w, h = r.h;
    glass(pad, oy, w, h, 10);
    ctx.save(); rr(ctx, pad, oy, w, h, 10); ctx.clip();
    ctx.fillStyle = C.gold; ctx.fillRect(pad, oy, 4, h);
    ctx.restore();
    var warn = G.cashWarn(), text = G.objText(), col = C.ink;
    if (warn && Math.floor(S.t / 4) % 2 === 0) {
      ctx.save(); rr(ctx, pad, oy, w, h, 10); ctx.clip();
      ctx.fillStyle = 'rgba(226,80,74,0.12)'; ctx.fillRect(pad, oy, w, h);
      ctx.fillStyle = C.red; ctx.fillRect(pad, oy, 4, h);
      ctx.restore();
      text = warn; col = C.red;
    }
    uiCovers.push({ x: pad, y: oy, w: w, h: h });
    if (QT.UI) QT.UI.tapRect({ x: pad, y: oy - 3, w: w, h: Math.max(30, h + 6) }, function () {
      var nx = QT.Guide && QT.Guide.next ? QT.Guide.next() : null;
      if (nx && nx.pad) {
        var gx = (nx.pad.x + 0.5) * TILE, gy = (nx.pad.y + 0.5) * TILE, did = W.roomAtPx(gx, gy);
        if (did && did !== 'ave' && did !== tripHere(S)) tripGo(did, 'next');
        else QT.G.goTo(gx, gy);
      }
      objOpenAt = S.t - objOpenAt < 6 ? -99 : S.t;
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      return true;
    });
    var cw = drawTripChip(S, r);
    fitTxt(ctx, text, pad + 12, oy + h / 2, 11, w - 20 - cw, col, col === C.red ? 800 : 700, 10);
    var objT = G.objText();
    ctx.font = '700 10px ' + FONT;
    var cut = ctx.measureText(objT).width > w - 20 - cw || (warn && ctx.measureText(warn).width > w - 20 - cw);
    objFull = (cut || warn) && S.t >= objOpenAt && S.t - objOpenAt < 6
      ? { text: objT, col: C.ink, sub: warn || null, x: pad, y: oy + h + 4, w: Math.max(w, Math.min(cssW - 20, 340)) } : null;
  }
  var objFull = null;
  function drawFullText(text, col, x, y, w, onClose, sub, subCol) {
    ctx.font = '800 11.5px ' + FONT;
    var lines = wrapLines(text, w - 24), subL = [];
    if (sub) { ctx.font = '700 10.5px ' + FONT; subL = wrapLines(sub, w - 24); }
    var h = 14 + lines.length * 16 + subL.length * 15;
    glass(x, y, w, h, 12);
    lines.forEach(function (ln, i) { txt(ctx, ln, x + 12, y + 15 + i * 16, 11.5, col, 'left', 800); });
    subL.forEach(function (ln, i) { txt(ctx, ln, x + 12, y + 15 + lines.length * 16 + i * 15, 10.5, subCol || C.inkSoft, 'left', 700); });
    uiCovers.push({ x: x, y: y, w: w, h: h });
    if (QT.UI) QT.UI.tapRect({ x: x, y: y, w: w, h: h }, function () { onClose(); return true; });
  }
  function wrapLines(s, maxW) {
    var out = [], cur = '', parts = String(s).match(/[\x21-\x7e¥]+|\s+|[^\s]/g) || [];
    for (var i = 0; i < parts.length && out.length < 6; i++) {
      var t = cur + parts[i];
      if (cur && ctx.measureText(t).width > maxW) {
        out.push(cur.replace(/\s+$/, ''));
        cur = parts[i].replace(/^\s+/, '');
        while (cur && ctx.measureText(cur).width > maxW && cur.length > 1 && out.length < 6) {
          var k = cur.length - 1;
          while (k > 1 && ctx.measureText(cur.slice(0, k)).width > maxW) k--;
          out.push(cur.slice(0, k)); cur = cur.slice(k);
        }
      } else cur = t;
    }
    if (cur && out.length < 6) out.push(cur);
    return out;
  }
  function newsInfo(S) {
    var ev = S.ev, good = ev.good != null ? !!ev.good : ev.id !== 'parts' && ev.id !== 'helium';
    return { ev: ev, good: good, left: Math.max(0, ev.until - S.t), col: good ? C.green : C.red };
  }
  function drawNewsCard(S, r) {
    var n = newsInfo(S), ex2 = r.x, ey2 = r.y, ew = r.w;
    glass(ex2, ey2, ew, r.h, 12);
    ctx.save(); rr(ctx, ex2, ey2, ew, r.h, 12); ctx.clip();
    ctx.fillStyle = n.good ? 'rgba(47,191,122,0.10)' : 'rgba(226,80,74,0.10)';
    ctx.fillRect(ex2, ey2, ew * n.left / (n.ev.until - n.ev.at), r.h);
    ctx.restore();
    fitTxt(ctx, (n.good ? '▲ ' : '▼ ') + L.t('ev_' + n.ev.id), ex2 + 12, ey2 + 12, 11.5, ew - 60, n.col, 800);
    fitTxt(ctx, L.t('evd_' + n.ev.id), ex2 + 26, ey2 + 27, 10, ew - 38, C.inkSoft, 700);
    txt(ctx, Math.ceil(n.left) + 's', ex2 + ew - 12, ey2 + 12, 10.5, n.col, 'right', 800);
    uiCovers.push({ x: ex2, y: ey2, w: ew, h: r.h });
  }
  function drawPerf(S, x, y, w, h) {
    var G = QT.G, ser = (S.fin.series || []).slice(-12);
    var lw = 58;
    txt(ctx, L.t('perfLbl'), x, y + 7, 9, C.inkSoft, 'left', 700);
    var last = ser.length ? ser[ser.length - 1] : null;
    if (last) {
      txt(ctx, '¥' + G.fmt(last.r), x, y + 20, 10.5, C.ink, 'left', 800);
    }
    var gx = x + lw, gw = w - lw - 70, gh = h;
    fillRR(ctx, gx, y, gw, gh, 6, '#f6f4fb');
    if (ser.length) {
      var mx = 1, mn = 0;
      ser.forEach(function (e) { mx = Math.max(mx, e.r, e.p); mn = Math.min(mn, e.p); });
      var span = mx - mn, bw = gw / 12;
      var y0 = y + gh - 2 - (0 - mn) / span * (gh - 4);
      ser.forEach(function (e, i) {
        var bx = gx + (12 - ser.length + i) * bw + 1.5;
        var bh = e.r / span * (gh - 4);
        fillRR(ctx, bx, y0 - bh, bw - 3, Math.max(1, bh), 2, i === ser.length - 1 ? '#f5b21c' : '#f7d98a');
      });
      ctx.beginPath();
      ser.forEach(function (e, i) {
        var px = gx + (12 - ser.length + i + 0.5) * bw, py = y0 - e.p / span * (gh - 4);
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      });
      ctx.strokeStyle = last.p >= 0 ? C.green : C.red; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(120,110,160,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx + gw, y0); ctx.stroke();
    }
    if (last) {
      var prev = ser.length > 1 ? ser[ser.length - 2].p : null;
      txt(ctx, (last.p >= 0 ? '+' : '') + G.fmt(last.p), x + w, y + 7, 11, last.p >= 0 ? C.green : C.red, 'right', 800);
      var mo = momLabel(last.p, prev);
      if (mo) txt(ctx, mo.s, x + w, y + 20, 9.5, mo.up ? C.green : C.red, 'right', 800);
    }
  }
  function momLabel(cur, prev) {
    if (prev == null || !prev || !cur) return null;
    if ((cur < 0) !== (prev < 0)) return null;
    var ch = Math.round((cur - prev) / Math.abs(prev) * 100);
    return { s: (ch >= 0 ? '▲' : '▼') + (Math.abs(ch) > 999 ? '999%+' : Math.abs(ch) + '%'), up: ch >= 0 };
  }
  var REPORT_LIFE = 4.2, REPORT_H = 48;
  function reportRect() {
    var w = Math.min(cssW - 20, 236), y = hudBottom() + 42;
    return { x: cssW - w - 10, y: y, w: w, h: REPORT_H };
  }
  function reportOn(S) { return !!(S.report && S.t - S.report.at <= REPORT_LIFE && !S.showFinance && !S.won && !S.gacha); }
  function drawReport(S) {
    var r = S.report, G = QT.G;
    if (!r) return;
    var e = S.t - r.at;
    if (e > REPORT_LIFE) { S.report = null; return; }
    if (e < 0.3 && S.banners && S.banners.length && S.banners[0].at != null && (r.waited || 0) < 8) {
      r.waited = (r.waited || 0) + Math.max(0, S.t - (r.at || S.t)); r.at = S.t; return;
    }
    var R = reportRect(), w = R.w, h = R.h, x0 = R.x;
    var slide = e < 0.3 ? 1 - ease(e / 0.3) : e > REPORT_LIFE - 0.35 ? ease((e - (REPORT_LIFE - 0.35)) / 0.35) : 0;
    var x = x0 + slide * (w + 20), y = R.y;
    var k = ease(Math.min(1, (e - 0.2) / 0.9));
    glass(x, y, w, h, 14);
    ctx.save(); rr(ctx, x, y, w, h, 14); ctx.clip();
    ctx.fillStyle = r.profit >= 0 ? C.green : C.red; ctx.fillRect(x, y, 5, h);
    ctx.restore();
    var right = x + w - 12, sign = r.profit >= 0 ? '+¥' : '-¥';
    var pcol = r.profit >= 0 ? '#2fbf7a' : '#e2504a';
    var ps = sign + G.fmt(Math.abs(r.profit) * k);
    ctx.font = '900 15px ' + FONT;
    var pw = ctx.measureText(ps).width, pwF = ctx.measureText(sign + G.fmt(Math.abs(r.profit))).width;
    fitTxt(ctx, L.t('monthReport', { n: r.month }), x + 14, y + 15, 11.5, Math.max(40, w - 14 - 12 - pwF - 10), C.violet, 900, 8.5);
    popTxt(ctx, ps, right - pw / 2, y + 16, 15, pcol, '#ffffff', 4);
    var mo = e > 1.0 ? momLabel(r.profit, r.prevProfit) : null, mw = 0;
    if (mo) {
      ctx.font = '900 11px ' + FONT;
      mw = ctx.measureText(mo.s).width;
      popTxt(ctx, mo.s, right - mw / 2, y + 35, 11, mo.up ? '#2fbf7a' : '#e2504a', '#ffffff', 3);
    }
    var line2 = L.t('revenue') + ' ¥' + G.fmt(r.rev * k) + '   ' + L.t('expenses') + ' -¥' + G.fmt(Math.abs(r.exp) * k);
    fitTxt(ctx, line2, x + 14, y + 35, 10, w - 14 - 12 - (mw ? mw + 8 : 0), C.inkSoft, 700, 8);
    uiCovers.push({ x: x, y: y, w: w, h: h });
  }
  function minimapRect(S) { return layout().mm; }
  L.add({
    render_take: ['受注', 'Accept']
  });
  function acceptNow(S) {
    if (!S.offer || !QT.G.acceptOffer) return false;
    QT.G.acceptOffer();
    return true;
  }
  function openJobs() {
    var ph = QT.UI && QT.UI.get('phone');
    if (ph && ph.open) ph.open('jobs');
    if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
    return true;
  }
  function chipTap(c, fn) {
    if (!QT.UI) return;
    QT.UI.tapRect({ x: c.x, y: c.y - 6, w: c.w, h: c.h + 12 }, fn);
  }
  function chipBase(c, accent) {
    glass(c.x, c.y, c.w, c.h, 10);
    if (accent) {
      ctx.save(); rr(ctx, c.x, c.y, c.w, c.h, 10); ctx.clip();
      ctx.fillStyle = accent; ctx.fillRect(c.x, c.y, 4, c.h);
      ctx.restore();
    }
    uiCovers.push({ x: c.x, y: c.y, w: c.w, h: c.h });
  }
  function jobsGlyph(x, y, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x - 5.5, y - 6, 11, 13);
    ctx.fillRect(x - 2.5, y - 8, 5, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3.5, y - 2.5, 7, 1.4); ctx.fillRect(x - 3.5, y + 0.5, 7, 1.4); ctx.fillRect(x - 3.5, y + 3.5, 4.5, 1.4);
  }
  function drawChips(S) {
    var lay = layout();
    lay.chips.forEach(function (c) {
      if (c.k === 'jobs') drawJobsChip(S, c);
      else if (c.k === 'offer') drawOfferChip(S, c);
      else if (c.k === 'ev') drawNewsChip(S, c);
      else if (c.k === 'fx' && c.draw) {
        uiCovers.push({ x: c.x, y: c.y, w: c.w, h: c.h });
        try { c.draw(S, H, c); } catch (e) { console.error('[render] fx chip', e); }
      }
    });
    if (objFull) drawFullText(objFull.text, objFull.col, objFull.x, objFull.y, objFull.w, function () { objOpenAt = -99; }, objFull.sub, C.red);
    else if (evActive() && !lay.wide && S.t >= evOpenAt && S.t - evOpenAt < 6) {
      var n = newsInfo(S), w = Math.min(cssW - 20, 340);
      drawFullText((n.good ? '▲ ' : '▼ ') + L.t('ev_' + n.ev.id) + '  ' + Math.ceil(n.left) + 's', n.col,
                   10, lay.bottom, w, function () { evOpenAt = -99; }, L.t('evd_' + n.ev.id));
    }
  }
  function drawJobsChip(S, c) {
    var urgent = false;
    S.jobs.forEach(function (j) { if (j.due - S.t < 30) urgent = true; });
    chipBase(c, null);
    jobsGlyph(c.x + 15, c.y + c.h / 2, '#6f57e0');
    fitTxt(ctx, L.t('render_jobsChip', { n: S.jobs.length }), c.x + 26, c.y + c.h / 2, 11.5, c.w - 32, C.ink, 800, 9);
    if (urgent) {
      var k = 0.5 + 0.5 * Math.sin(S.t * 8);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c.x + c.w - 5, c.y + 5, 5.5, 0, 7); ctx.fill();
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(c.x + c.w - 5, c.y + 5, 3.4 + k, 0, 7); ctx.fill();
    }
    chipTap(c, openJobs);
  }
  var offerSeen = null, offerAt = 0;
  function drawOfferChip(S, c) {
    var o = S.offer, G = QT.G;
    var lock = !!o.lock;
    var cant = !lock && o.kind === 'hw' && G.canFulfill && !G.canFulfill(o);
    var tg = !lock && !cant && G.offerTag ? G.offerTag(o) : null;
    var tmd = tg && tg.mod && QT.Data && QT.Data.mods && QT.Data.mods[tg.mod];
    var rem = Math.max(0, Math.ceil(o.life || 0)), life = rem / (o.big ? 39 : 26);
    if (offerSeen !== o) { offerSeen = o; offerAt = S.t; }
    var age = S.t - offerAt, pop = age >= 0 && age < 0.6 ? 1 + 0.12 * Math.sin(age / 0.6 * Math.PI) : 1;
    ctx.save();
    if (pop !== 1) { ctx.translate(c.x + c.w / 2, c.y + c.h / 2); ctx.scale(pop, pop); ctx.translate(-(c.x + c.w / 2), -(c.y + c.h / 2)); }
    chipBase(c, o.client.color);
    var bw = 52, bx = c.x + c.w - bw - 3, by = c.y + 3, bh = c.h - 6;
    var bid = tg && tg.bid;
    var lead = (o.big ? '★' : '') + (lock ? L.t('render_sampleShort')
             : cant ? L.t('render_cantShort')
             : bid ? tg.bidShort
             : tg && tg.name && tg.fit ? tg.name + ' ' + '★★★★★'.slice(0, tg.fit) : L.t('render_newShort')) + ' ';
    var rew = '+¥' + G.fmt(bid ? bid.reward : o.reward);
    var x0 = c.x + 10;
    if (o.abroad) {
      var ot = L.t('render_ovsShort');
      ctx.font = '900 9.5px ' + FONT;
      var otw = ctx.measureText(ot).width + 8;
      fillRR(ctx, x0 - 3, c.y + c.h / 2 - 8, otw, 15, 7.5, '#2bb8d8');
      txt(ctx, ot, x0 - 3 + otw / 2, c.y + c.h / 2 - 0.5, 9.5, '#ffffff', 'center', 900);
      x0 += otw + 1;
    }
    ctx.font = '800 11.5px ' + FONT;
    var room = bx - x0 - 4, rw = Math.min(ctx.measureText(rew).width, room * 0.62);
    fitTxt(ctx, lead, x0, c.y + c.h / 2 - 1, 11.5, room - rw - 3,
           lock ? '#8a84a0' : cant ? '#d9761a' : bid ? (bid.win ? '#2a9d63' : '#d9761a') : o.big ? '#c98f0f' : tmd && tg.fit ? tmd.color : C.ink, 800, 8.5);
    var lw = ctx.measureText(lead).width;
    fitTxt(ctx, rew, x0 + Math.min(lw, room - rw - 3) + 3, c.y + c.h / 2 - 1, 11.5, rw, '#c98f0f', 800, 9);
    ctx.save(); rr(ctx, c.x, c.y, c.w, c.h, 10); ctx.clip();
    ctx.fillStyle = rem < 8 ? C.red : C.violet;
    ctx.fillRect(c.x, c.y + c.h - 2.5, (bx - c.x - 4) * Math.max(0, Math.min(1, life)), 2.5);
    ctx.restore();
    fillRR(ctx, bx, by, bw, bh, 9, lock ? '#b7b1c8' : cant ? '#f2a63b' : C.green);
    var tk = L.t(lock ? 'render_sampleBtn' : 'render_take'), tfs = 12.5;
    ctx.font = '900 ' + tfs + 'px ' + FONT;
    while (tfs > 9 && ctx.measureText(tk).width > bw - 8) { tfs -= 0.5; ctx.font = '900 ' + tfs + 'px ' + FONT; }
    txt(ctx, tk, bx + bw / 2, by + bh / 2, tfs, '#ffffff', 'center', 900);
    ctx.restore();
    chipTap({ x: c.x, y: c.y, w: bx - c.x - 2, h: c.h }, openJobs);
    if (QT.UI) QT.UI.tapRect({ x: bx - 2, y: c.y - 8, w: bw + 5, h: c.h + 16 }, function () { return acceptNow(QT.G.S); });
  }
  function drawNewsChip(S, c) {
    var n = newsInfo(S);
    chipBase(c, n.col);
    ctx.save(); rr(ctx, c.x, c.y, c.w, c.h, 10); ctx.clip();
    ctx.fillStyle = n.good ? 'rgba(47,191,122,0.10)' : 'rgba(226,80,74,0.10)';
    ctx.fillRect(c.x, c.y, c.w * n.left / (n.ev.until - n.ev.at), c.h);
    ctx.restore();
    var ts = Math.ceil(n.left) + 's';
    ctx.font = '800 10.5px ' + FONT;
    var tw = ctx.measureText(ts).width;
    fitTxt(ctx, (n.good ? '▲ ' : '▼ ') + L.t('ev_' + n.ev.id), c.x + 10, c.y + c.h / 2, 11, c.w - tw - 24, n.col, 800, 9);
    txt(ctx, ts, c.x + c.w - 8, c.y + c.h / 2, 10.5, n.col, 'right', 800);
    chipTap(c, function () {
      evOpenAt = S.t - evOpenAt < 6 ? -99 : S.t;
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      return true;
    });
  }
  function drawPadPrompt(S) {
    var pad = S.heldPad;
    if (!pad) return;
    var info = QT.G.padInfo(pad);
    if (!info) return;
    var w = Math.min(cssW - 24, 340), x = (cssW - w) / 2;
    var maxW = w - 36, showNE = !info.can && info.cost && S.coins < info.cost, neW = 0;
    if (showNE) { ctx.font = '700 10px ' + FONT; neW = ctx.measureText(L.t('notEnough')).width; }
    ctx.font = '700 10.5px ' + FONT;
    var sub = info.sub || '', lines = [sub];
    if (sub && ctx.measureText(sub).width > maxW) lines = splitLine(sub, maxW);
    var h = lines.length > 1 ? 72 : 58, y = cssH - h - 68;
    uiCovers.push({ x: x, y: y, w: w, h: h });
    glass(x, y, w, h, 17);
    ctx.save(); rr(ctx, x, y, w, h, 17); ctx.clip();
    ctx.fillStyle = info.can ? C.gold : '#c9c3d8'; ctx.fillRect(x, y, 6, h);
    ctx.restore();
    txt(ctx, info.label, x + 18, y + 20, 14, C.ink, 'left', 800);
    lines.forEach(function (ln, i) {
      var lm = showNE && i === lines.length - 1 ? maxW - neW - 10 : maxW;
      fitTxt(ctx, ln, x + 18, lines.length > 1 ? y + 38 + i * 15 : y + 40, 10.5, lm, C.inkSoft, 700, 8.5);
    });
    if (info.cost) txt(ctx, '-¥' + QT.G.fmt(info.cost), x + w - 14, y + 22, 15, info.can ? '#c98f0f' : C.red, 'right', 800);
    else if (info.gain) txt(ctx, '+¥' + QT.G.fmt(info.gain), x + w - 14, y + 22, 15, C.green, 'right', 800);
    if (showNE) txt(ctx, L.t('notEnough'), x + w - 14, y + h - 14, 10, C.red, 'right');
  }
  function splitLine(s, maxW) {
    function fits(t) { return ctx.measureText(t).width <= maxW; }
    var i3 = s.indexOf('   ');
    if (i3 > 0 && fits(s.slice(0, i3).trim())) return [s.slice(0, i3).trim(), s.slice(i3).trim()];
    var seps = ['  ', ' '];
    for (var k = 0; k < seps.length; k++) {
      var sep = seps[k], parts = s.split(sep).map(function (t) { return t.trim(); }).filter(function (t) { return t; });
      if (parts.length < 2) continue;
      var l1 = parts[0], n = 1;
      while (n < parts.length && fits(l1 + sep + parts[n])) { l1 += sep + parts[n]; n++; }
      if (fits(l1) && n < parts.length) return [l1, parts.slice(n).join(sep)];
    }
    var c = s.length;
    while (c > 1 && !fits(s.slice(0, c))) c--;
    return [s.slice(0, c), s.slice(c).trim()];
  }
  var BTN_N = 6, BTN_LEFT = 60;
  function btnRects() {
    var avail = cssW - 12 - BTN_LEFT, s = 42, g = 9;
    if (BTN_N * s + (BTN_N - 1) * g > avail) {
      g = Math.max(6, (avail - BTN_N * s) / (BTN_N - 1));
      if (BTN_N * s + (BTN_N - 1) * g > avail) s = Math.max(32, Math.floor((avail - (BTN_N - 1) * g) / BTN_N));
    }
    var y = cssH - s - 12;
    function at(k) { return { x: cssW - 12 - s * (k + 1) - g * k, y: y, w: s, h: s }; }
    return {
      phone: at(0),
      trip: at(1),
      mute: at(2), lang: { x: -999, y: -999, w: 0, h: 0 }, fin: at(3), share: at(4),
      acct: at(5)
    };
  }
  function drawButtons(S) {
    var b = btnRects();
    function base(r) {
      ctx.save();
      ctx.shadowColor = 'rgba(50,40,80,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
      fillRR(ctx, r.x, r.y, r.w, r.h, 15, '#ffffff');
      ctx.restore();
      strokeRR(ctx, r.x, r.y, r.w, r.h, 15, 'rgba(120,110,160,0.18)', 1);
    }
    base(b.fin);
    var fx = b.fin.x + b.fin.w / 2, fy = b.fin.y + b.fin.h / 2;
    ctx.strokeStyle = C.green; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(fx - 8, fy + 6); ctx.lineTo(fx - 2, fy - 2);
    ctx.lineTo(fx + 2, fy + 2); ctx.lineTo(fx + 8, fy - 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx + 8, fy - 7); ctx.lineTo(fx + 3, fy - 7);
    ctx.moveTo(fx + 8, fy - 7); ctx.lineTo(fx + 8, fy - 2); ctx.stroke();
    if (QT.me && QT.me()) {
      base(b.acct);
      var ax = b.acct.x + b.acct.w / 2, ay = b.acct.y + b.acct.h / 2;
      ctx.fillStyle = C.inkSoft;
      ctx.beginPath(); ctx.arc(ax, ay - 5, 5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(ax, ay + 10, 10, Math.PI, 0); ctx.fill();
    }
    base(b.share);
    var sx = b.share.x + b.share.w / 2, sy = b.share.y + b.share.h / 2;
    ctx.strokeStyle = C.pink; ctx.fillStyle = C.pink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy - 7); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy + 7); ctx.stroke();
    [[sx - 6, sy], [sx + 6, sy - 7], [sx + 6, sy + 7]].forEach(function (q) {
      ctx.beginPath(); ctx.arc(q[0], q[1], 3.6, 0, 7); ctx.fill();
    });
    drawTripBtn(S, b.trip, base);
    base(b.mute);
    var mc = QT.Sfx.isMuted() ? '#b9b3c8' : C.gold;
    var cx = b.mute.x + b.mute.w / 2 - 2, cy = b.mute.y + b.mute.h / 2;
    ctx.fillStyle = mc;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx - 3, cy - 3); ctx.lineTo(cx + 1, cy - 7);
    ctx.lineTo(cx + 1, cy + 7); ctx.lineTo(cx - 3, cy + 3); ctx.lineTo(cx - 7, cy + 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = mc; ctx.lineWidth = 1.9;
    if (QT.Sfx.isMuted()) {
      ctx.beginPath(); ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx + 10, cy + 4);
      ctx.moveTo(cx + 10, cy - 4); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(cx + 2, cy, 4.5, -0.9, 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 2, cy, 8, -0.9, 0.9); ctx.stroke();
    }
  }
  var RANK_COL = { S: '#e8a800', A: C.pink, B: C.blue, C: C.green };
  var confs = [];
  function confettiBurst(n, x, y, spread) {
    var cols = [C.gold, C.pink, C.blue, C.green, C.violet, C.orange, '#ffffff'];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      var sp = 160 + Math.random() * 320;
      confs.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                   r: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
                   w: 4 + Math.random() * 5, h: 7 + Math.random() * 6,
                   c: cols[i % cols.length], life: 3.5 + Math.random() * 2, t: 0 });
    }
  }
  function drawConfetti(dt) {
    for (var i = confs.length - 1; i >= 0; i--) {
      var p = confs[i];
      p.t += dt;
      p.vy += 420 * dt; p.vx *= Math.pow(0.35, dt); p.vy = Math.min(p.vy, 170);
      p.x += p.vx * dt + Math.sin(p.t * 5 + i) * 0.6; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.t > p.life || p.y > cssH + 20) { confs.splice(i, 1); continue; }
      var fa = !QT.G.S.won && !QT.G.S.gacha && p.y > cssH * 0.72 ? Math.max(0, 1 - (p.y - cssH * 0.72) / (cssH * 0.08)) : 1;
      if (fa <= 0) { confs.splice(i, 1); continue; }
      ctx.save();
      if (fa < 1) ctx.globalAlpha *= fa;
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.scale(1, Math.abs(Math.cos(p.t * 7 + i)) * 0.8 + 0.2);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
  function ease(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  function yen(v) { return '¥' + QT.G.fmt(v); }
  function comma(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function mmss(sec) {
    sec = Math.max(0, +sec || 0);
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return L.t('playTime', { m: m, s: (s < 10 ? '0' : '') + s });
  }
  function ceremony() { return QT.UI && QT.UI.get ? QT.UI.get('ceremony') : null; }
  function drawIpo(S) { var c = ceremony(); if (c && c.drawIpo) c.drawIpo(S); }
  function ipoSkip(S, p) { var c = ceremony(); return c && c.skip ? c.skip(S, p) : true; }
  function drawOffline(S) {
    var w = Math.min(cssW - 40, 300), x = (cssW - w) / 2, y = cssH / 2 - 62, h = 126;
    glass(x, y, w, h, 20);
    txt(ctx, L.t('welcomeBack'), x + w / 2, y + 28, 17, '#c98f0f', 'center', 800);
    txt(ctx, L.t('awayFor', { n: Math.round(S.offline.sec / 60) }), x + w / 2, y + 56, 12, C.inkSoft, 'center');
    txt(ctx, L.t('earned', { v: '¥' + QT.G.fmt(S.offline.amount) }), x + w / 2, y + 80, 14, C.ink, 'center', 800);
    txt(ctx, L.t('collectAt'), x + w / 2, y + 105, 10.5, C.violet, 'center');
  }
  var tutPick = { t: -99, pad: null };
  function tutTarget(S, cardY) {
    if (Math.abs(S.t - tutPick.t) > 1) {
      tutPick.t = S.t; tutPick.pad = null;
      var bd = Infinity;
      QT.G.PADS().forEach(function (pad) {
        if (QT.G.padActive && !QT.G.padActive(pad)) return;
        var info = QT.G.padInfo(pad);
        if (!info || !info.can || info.quiet) return;
        if (handOnPlayer(toScreen((pad.x + 0.5) * TILE, (pad.y + 0.5) * TILE, 0))) return;
        var d = Math.hypot((pad.x + 0.5) * TILE - S.player.x, (pad.y + 0.5) * TILE - S.player.y);
        if (d < bd) { bd = d; tutPick.pad = pad; }
      });
    }
    var pd = tutPick.pad;
    if (pd) {
      var s = toScreen((pd.x + 0.5) * TILE, (pd.y + 0.5) * TILE, 0);
      if (s.x > 24 && s.x < cssW - 24 && s.y > hudBottom() + 30 && s.y < cardY - 20 && !handOnPlayer(s)) return s;
    }
    return null;
  }
  function handOnPlayer(s) { return onPlayer(s.x - 12, s.y - 12, s.x + 26, s.y + 34, 4); }
  var HAND = [[-4.5, -1, 9, 21, 4.5], [-6.5, 13, 21, 19, 7], [-10.5, 16, 7, 12, 3.5]];
  function handGlyph(c) {
    c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = C.ink;
    HAND.forEach(function (q) { rr(c, q[0], q[1], q[2], q[3], q[4]); c.stroke(); });
    c.fillStyle = '#ffffff';
    HAND.forEach(function (q) { rr(c, q[0], q[1], q[2], q[3], q[4]); c.fill(); });
    c.strokeStyle = 'rgba(47,44,70,0.35)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-3, 9); c.lineTo(3, 9); c.stroke();
  }
  function drawTutorial(S) {
    var step = S.tut || 0;
    var w = Math.min(cssW - 40, 270), h = 46, x = (cssW - w) / 2, y = cssH - 66 - h - 8;
    if (onPlayer(x, y, x + w, y + h, 8)) y = hudBottom() + 8;
    ctx.save();
    ctx.globalAlpha = 0.9 + 0.1 * Math.sin(S.t * 4);
    glass(x, y, w, h, 14);
    ctx.restore();
    fitTxt(ctx, L.t(step ? 'tut2' : 'tut1'), x + 14, y + 16, 12.5, w - 28, C.ink, 800, 10);
    fitTxt(ctx, L.t(step ? 'tut2b' : 'tut1b'), x + 14, y + 33, 10, w - 28, C.inkSoft, 700, 8);
    var pt = tutTarget(S, y > cssH / 2 ? y : cssH - 66), k = (S.t % 1.3) / 1.3;
    if (!pt) return;
    ctx.save();
    if (k > 0.35) {
      for (var ri = 0; ri < 2; ri++) {
        var rk = (k - 0.35 - ri * 0.15) / 0.65;
        if (rk <= 0) continue;
        ctx.globalAlpha = Math.max(0, 1 - rk) * (ri ? 0.5 : 0.9);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 6 + rk * 26, 0, 7); ctx.stroke();
      }
    }
    var off = k < 0.25 ? 1 : k < 0.35 ? 1 - ease((k - 0.25) / 0.1) : k < 0.45 ? 0 : ease((k - 0.45) / 0.55);
    var press = k >= 0.35 && k < 0.45 ? 0.9 : 1;
    if (off < 0.2) {
      ctx.globalAlpha = 0.25; ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(pt.x, pt.y + 2, 6, 2.5, 0, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.translate(pt.x + off * 10, pt.y - off * 10 + 2);
    ctx.rotate(-0.35); ctx.scale(press, press);
    handGlyph(ctx);
    ctx.restore();
  }
  var GA_OPEN = 1.9, GA_CARD = 2.1;
  var RAR = {
    N:   { col: '#9aa3c4', glow: '#dfe3f0', label: 'N' },
    R:   { col: '#2bb8d8', glow: '#bfefff', label: 'R' },
    SR:  { col: '#f5b21c', glow: '#fff0b3', label: 'SR' },
    SSR: { col: '#e2508a', glow: '#ffffff', label: 'SSR', rainbow: true }
  };
  var gaFx = { key: null, fired: {}, last: 0 };
  function gachaElapsed(S) { return S.gacha ? S.t - S.gacha.at : 99; }
  function gachaTap(S) {
    if (!S.gacha) return;
    if (gachaElapsed(S) < GA_CARD) { S.gacha.at = S.t - GA_CARD; gaFx.fired.drop = gaFx.fired.shake = 1; return; }
    S.gacha = null;
  }
  function rainbow(t, k) { return 'hsl(' + Math.round((t * 240 + k * 60) % 360) + ',90%,60%)'; }
  function gachaText(g) {
    var tl = QT.Sim && QT.Sim.talent, tt = tl && tl.gachaText ? tl.gachaText(g) : null;
    if (tt) return tt;
    if (g.kind === 'cash') return [g.rar === 'SSR' ? L.t('gachaInvestor') : L.t('gachaCash'), '+¥' + QT.G.fmt(g.v)];
    if (g.kind === 'fever') return [L.t('gachaFever', { n: g.sec }), ''];
    if (g.kind === 'level') return [L.t('gachaLevel', { n: g.name, lv: g.lv }), ''];
    if (g.kind === 'genius') return [L.t('gachaGenius', { n: g.n }), ''];
    return ['', ''];
  }
  function drawGacha(S) {
    var g = S.gacha;
    if (!g) return;
    if (gaFx.key !== g.at) gaFx = { key: g.at, fired: {}, last: S.t };
    var e = gachaElapsed(S), rr0 = RAR[g.rar] || RAR.N;
    var cx = cssW / 2, cy = cssH * 0.45;
    ctx.save();
    ctx.fillStyle = 'rgba(20,14,40,' + Math.min(0.78, e * 1.5) + ')'; ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
    if (e < GA_OPEN) {
      var yDrop = e < 0.9 ? cy - 260 * Math.pow(1 - Math.min(1, e / 0.5), 2) + (e > 0.5 ? -Math.abs(Math.sin((e - 0.5) * 12)) * 30 * (0.9 - e) : 0) : cy;
      var shake = e > 0.9 ? Math.sin(e * 60) * Math.min(1, (e - 0.9) * 1.5) * 7 : 0;
      if (e > 0.9) ipoOnceG('shake', function () { QT.Sfx.play('tick'); });
      var hint = e > 1.3 ? (e - 1.3) / 0.6 : 0;
      if (hint > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.8, hint);
        var gr = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
        gr.addColorStop(0, rr0.rainbow ? rainbow(S.t, 0) : rr0.glow); gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr; ctx.fillRect(cx - 130, cy - 130, 260, 260);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(cx + shake, yDrop); ctx.rotate(shake * 0.03);
      var top = rr0.rainbow && hint > 0.5 ? rainbow(S.t, 1) : (hint > 0.5 ? rr0.col : '#e2508a');
      ctx.beginPath(); ctx.arc(0, 0, 46, Math.PI, 0); ctx.fillStyle = top; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-46, -3, 92, 6);
      ctx.beginPath(); ctx.arc(-16, -22, 10, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
      ctx.restore();
    } else {
      ipoOnceG('crack', function () {
        QT.Sfx.play('crack');
        QT.Sfx.play(g.rar === 'SSR' ? 'ipo' : g.rar === 'SR' ? 'winSR' : g.rar === 'R' ? 'winR' : 'winN');
        if (g.rar === 'SSR' || g.rar === 'SR') {
          confettiBurst(g.rar === 'SSR' ? 140 : 70, cx, cy, 6.3);
          shakeScreen(g.rar === 'SSR' ? 12 : 6, 0.6);
        }
      });
      var k = Math.min(1, (e - GA_OPEN) / 0.3);
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(S.t * 0.6);
      var rays = g.rar === 'N' ? 8 : 16;
      for (var i = 0; i < rays; i++) {
        ctx.rotate(Math.PI * 2 / rays);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -cssH); ctx.lineTo(18, -cssH); ctx.closePath();
        ctx.fillStyle = rr0.rainbow ? rainbow(S.t, i) : rr0.glow;
        ctx.globalAlpha = 0.18 * k; ctx.fill();
      }
      ctx.restore();
      drawConfetti(Math.max(0, Math.min(0.05, S.t - gaFx.last)));
      gaFx.drawn = true;
      var cw = Math.min(cssW - 40, 300), ch = 200, cxx = cx - cw / 2, cyy = cy - ch / 2;
      var sc = e < GA_CARD + 0.25 ? 0.6 + 0.4 * ease((e - GA_OPEN) / 0.45) : 1;
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
      fillRR(ctx, cxx - 4, cyy - 4, cw + 8, ch + 8, 26, rr0.rainbow ? rainbow(S.t, 2) : rr0.col);
      glass(cxx, cyy, cw, ch, 22);
      txt(ctx, rr0.label, cx, cyy + 48, rr0.label.length > 2 ? 46 : 52,
          rr0.rainbow ? rainbow(S.t, 3) : rr0.col, 'center', 900, '#ffffff');
      var lines = gachaText(g);
      var fs0 = 15;
      ctx.font = '800 ' + fs0 + 'px ' + FONT;
      while (fs0 > 10 && ctx.measureText(lines[0]).width > cw - 28) { fs0 -= 0.5; ctx.font = '800 ' + fs0 + 'px ' + FONT; }
      txt(ctx, lines[0], cx, cyy + 106, fs0, C.ink, 'center', 800);
      var fs1 = 22;
      ctx.font = '900 ' + fs1 + 'px ' + FONT;
      while (lines[1] && fs1 > 11 && ctx.measureText(lines[1]).width > cw - 28) { fs1 -= 0.5; ctx.font = '900 ' + fs1 + 'px ' + FONT; }
      if (lines[1]) txt(ctx, lines[1], cx, cyy + 136, fs1, '#c98f0f', 'center', 900);
      txt(ctx, L.t('gachaTap'), cx, cyy + ch - 20, 11, C.inkSoft, 'center', 700);
      ctx.restore();
    }
    if (!gaFx.drawn) drawConfetti(Math.max(0, Math.min(0.05, S.t - gaFx.last)));
    gaFx.drawn = false;
    gaFx.last = S.t;
  }
  function ipoOnceG(k, fn) { if (!gaFx.fired[k]) { gaFx.fired[k] = 1; fn(); } }
  var FADE_COL = '#141a3a';
  var fadeFx = { on: false, jumped: false, x: 0, y: 0, to: null };
  function drawTravelFade(S) {
    var a = RIDE.fade;
    if (!(a > 0.002)) { fadeFx.on = false; return; }
    if (!fadeFx.on) { fadeFx.on = true; fadeFx.jumped = false; fadeFx.x = S.player.x; fadeFx.y = S.player.y; fadeFx.to = null; }
    if (!fadeFx.jumped && (Math.abs(S.player.x - fadeFx.x) > JUMP || Math.abs(S.player.y - fadeFx.y) > JUMP)) fadeFx.jumped = true;
    ctx.save();
    ctx.globalAlpha = a; ctx.fillStyle = FADE_COL; ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
    var id = RIDE.to || (fadeFx.jumped ? W.roomAtPx(S.player.x, S.player.y) : null), d = id && id !== 'ave' ? W.DIST[id] : null;
    if (!d || a < 0.35) return;
    var nm = L.nm(d), fs = Math.max(18, Math.min(28, cssW / 14));
    ctx.save();
    ctx.globalAlpha = Math.min(1, (a - 0.35) / 0.4);
    ctx.font = '900 ' + fs + 'px ' + FONT;
    var w = Math.min(cssW - 40, ctx.measureText(nm).width + 56), h = fs + 26, x = (cssW - w) / 2, y = cssH * 0.56 - h / 2;
    fillRR(ctx, x, y, w, h, 10, '#ffffff');
    ctx.fillStyle = LINE_COL; ctx.fillRect(x, y + h - 9, w, 5);
    tramGlyph(ctx, x + 22, y + (h - 9) / 2 + 1, fs * 0.034, LINE_COL);
    fitTxt(ctx, nm, x + 40, y + (h - 9) / 2 + 1, fs, w - 52, C.ink, 900, 12);
    ctx.restore();
  }
  var shakeFx = { amp: 0, until: 0, dur: 1 };
  function shakeScreen(amp, sec) { shakeFx = { amp: amp, until: performance.now() + sec * 1000, dur: sec * 1000 }; }
  var vigGrad = null, vigKey = '', lastFrameT = 0;
  function draw(c, S, d, stick) {
    ctx = c; dpr = d;
    readRide();
    HUD_H = S.co.founded && cssH >= 500 ? 116 : 84;
    if (!cam.lock) updateCamera(S);
    timeNight = cam.bare ? 0 : nightOf(S);
    uiTransform();
    ctx.clearRect(0, 0, cssW, cssH);
    drawSky(S);
    var shk = shakeFx.until - performance.now(), sox = 0, soy = 0;
    if (shk > 0) {
      var sa = shakeFx.amp * shk / shakeFx.dur;
      sox = (Math.random() - 0.5) * 2 * sa / z; soy = (Math.random() - 0.5) * 2 * sa / z;
      cam.x += sox; cam.y += soy;
    }
    worldTransform();
    drawScene(S);
    cam.x -= sox; cam.y -= soy;
    uiTransform();
    if (timeNight > 0) drawNightTint(S);
    var vk = cssW + 'x' + cssH;
    if (vk !== vigKey) {
      vigGrad = ctx.createRadialGradient(cssW / 2, cssH * 0.45, cssH * 0.35, cssW / 2, cssH * 0.45, cssH * 0.85);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)'); vigGrad.addColorStop(1, 'rgba(35,25,60,0.15)');
      vigKey = vk;
    }
    ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, cssW, cssH);
    var UI = QT.UI;
    if (UI) UI.begin();
    if (cam.bare) { if (S.won) drawIpo(S); return; }
    uiCovers = [];
    plR = playerRect(S);
    if (!RIDE.on) drawWorldLabels(S); else labelBoxes.length = 0;
    artRun('labels', '*', [S, H]);
    if (!RIDE.on) drawGoal(S);
    drawToasts(S);
    drawCombo(S);
    if (!RIDE.on) drawBubbles(S);
    artRun('ui', '*', [S, H]);
    ghostOverUi(S);
    drawTravelFade(S);
    drawHUD(S);
    if (UI) UI.draw('hud', S, H);
    drawChips(S);
    if (!RIDE.on && !(RIDE.fade > 0.05)) drawPadPrompt(S);
    if (!S.showFinance && !S.won && !S.gacha) drawReport(S);
    drawButtons(S);
    if (UI) UI.draw('btn', S, H);
    artRun('uiTop', '*', [S, H]);
    if (UI) UI.draw('sheet', S, H);
    if (stick && stick.active && !RIDE.on) {
      ctx.save();
      ctx.globalAlpha = 0.18; ctx.fillStyle = C.violet;
      ctx.beginPath(); ctx.arc(stick.ox, stick.oy, 48, 0, 7); ctx.fill();
      ctx.globalAlpha = 0.95; ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(stick.ox + stick.dx * 34, stick.oy + stick.dy * 34, 19, 0, 7); ctx.fill();
      ctx.restore();
    }
    var fdt = Math.max(0, Math.min(0.05, S.t - (lastFrameT || S.t))); lastFrameT = S.t;
    drawCoins(S, fdt);
    var cardUp = !!(QT.Guide && QT.Guide.shown && QT.Guide.shown());
    var sheetUp = !!(UI && UI.open && UI.open());
    var fxUp = !!(QT.FX && QT.FX.busy && QT.FX.busy());
    var repUp = reportOn(S) && !(S.banners && S.banners.length && S.banners[0].at != null);
    if (!S.won && !S.gacha && !cardUp && !sheetUp && !fxUp && !repUp) { drawConfetti(fdt); drawBanner(S, fdt); }
    else if (repUp && !fxUp && !S.won && !S.gacha) drawConfetti(fdt);
    else if (fxUp && !S.won && !S.gacha) drawConfetti(fdt);
    if (S.tut < 2 && !S.won && !S.showFinance && !S.gacha && !RIDE.on && !sheetUp) drawTutorial(S);
    if (S.gacha) drawGacha(S);
    if (S.showFinance && UI) { UI.begin(); UI.draw('finance', S, H); }
    if (S.offline) drawOffline(S);
    if (S.won) drawIpo(S);
    if (UI && (S.gacha || S.offline || S.won || cardUp)) UI.begin();
  }
  var H = {
    get ctx() { return ctx; }, get z() { return z; }, get dpr() { return dpr; },
    get cssW() { return cssW; }, get cssH() { return cssH; },
    get cam() { return cam; }, get skyAlt() { return skyAlt; },
    get night() { return timeNight; },
    hudCoin: function () { return coinAt; },
    get here() { return currentRoom(QT.G.S); }, padRoom: padRoom, bucketOf: bucketOf,
    get riding() { return RIDE.on; }, get ride() { return RIDE.ride; },
    get travelFade() { return RIDE.fade; },
    tramGlyph: function (x, y, s, col, c) { tramGlyph(c || ctx, x, y, s, col || LINE_COL); }, LINE_COL: LINE_COL,
    isDeco: isDeco, decoStyle: decoStyle, decoHeight: decoHeight,
    rail: { pt: railPt, project: railProject, trains: function () { return railTrains; }, update: function (S) { updateTrains(S); },
            H: RAIL_H, len: RLEN },
    onView: function (sx, sy, m) { return onView(sx, sy, m || 0); }, CURB: CURB,
    minimapRect: function () { return minimapRect(QT.G.S); }, btnRects: function () { return btnRects(); },
    playerRect: function () { return plR; },
    onPlayer: function (x0, y0, x1, y1, m) { return onPlayer(x0, y0, x1, y1, m); },
    labelShown: function (p) { return labelShown(QT.G.S, p); },
    uiBand: function () { return { top: hudBottom(), bottom: cssH - 66 }; },
    distSign: function (d) { return signState(d, QT.G.S); },
    tripCan: tripCan, tripGo: tripGo, tripOpen: tripOpen,
    tripHere: function () { return tripHere(QT.G.S); }, shortDist: shortDist,
    blockClosed: blockClosed,
    fitTxt: function (s, x, y, size, maxW, color, weight, min) { fitTxt(ctx, s, x, y, size, maxW, color, weight, min); },
    plain: plain, canEmoji: canEmoji,
    I: I, W: W, L: L, get G() { return QT.G; }, TILE: TILE, C: C, FONT: FONT, H_PLOT: H_PLOT, H_WALL: H_WALL, H_LOW: H_LOW,
    P: P, ex: ex, ey: ey, shade: shade, toScreen: toScreen, hudBottom: function () { return hudBottom(); },
    rr: function (x, y, w, h, r) { rr(ctx, x, y, w, h, r); },
    fillRR: function (x, y, w, h, r, f) { fillRR(ctx, x, y, w, h, r, f); },
    strokeRR: function (x, y, w, h, r, s, lw) { strokeRR(ctx, x, y, w, h, r, s, lw); },
    txt: function (s, x, y, size, color, align, weight, halo) { txt(ctx, s, x, y, size, color, align, weight, halo); },
    popTxt: function (s, x, y, size, fill, stroke, lw) { popTxt(ctx, s, x, y, size, fill, stroke, lw); },
    box: function (x, y, w, h, base, hi, top, opt) { I.box(ctx, x, y, w, h, base, hi, top, opt); },
    shadow: function (x, y, w, h, a) { I.shadow(ctx, x, y, w, h, a); },
    face: function (x, y, w, h, lift) { I.facePath(ctx, x, y, w, h, lift); },
    floorSlab: floorSlab, icon2d: icon2d, star: star, rainbow: rainbow, mixCol: mixCol, ease: ease,
    machineIcon: machineIcon, confetti: function (n, x, y, sp) { confettiBurst(n, x, y, sp); },
    shake: function (a, s) { shakeScreen(a, s); }, glass: glass, bar: bar,
    padInfo: function (pad) { return QT.G.padInfo(pad); }, staffSeat: staffSeat, custPos: custPos,
    drawBuilding: function (p, S) { drawBuilding(p, S.p[p.id], S); },
    drawStaffDefault: null
  };
  QT.Render = {
    H: H,
    resize: resize, draw: draw, cam: cam,
    zoom: function (v) { if (v) z = v; return z; },
    gachaTap: gachaTap, shake: shakeScreen,
    toWorld: function (sx, sy) { return I.toWorld((sx - cssW / 2) / z + cam.x, (sy - cssH / 2) / z + cam.y); }, btnRects: btnRects, ipoSkip: ipoSkip,
    size: function () { return { w: cssW, h: cssH }; },
    floorStats: floorStats,
    snap: function () { snapCamera(QT.G.S); },
    kit: {
      drawConfetti: function (dt) { drawConfetti(dt); }, clearConfetti: function () { confs.length = 0; },
      fitTxt: function (s, x, y, size, maxW, color, weight, min) { fitTxt(ctx, s, x, y, size, maxW, color, weight, min); },
      yen: yen, comma: comma, mmss: mmss, RANK_COL: RANK_COL
    }
  };
})(window.QT || (window.QT = {}));
