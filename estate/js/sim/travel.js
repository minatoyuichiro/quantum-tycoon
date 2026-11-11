(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, W = QT.World, L = QT.L;
  var TILE = W.TILE;
  var Sim = QT.Sim || (QT.Sim = {});
  function T(k, v) { return L.t(k, v); }
  L.add({
    travelNoCash:    ['運賃が足りません', 'Not enough cash for the fare'],
    travelFreeRide:  ['運賃はおまけ（手元が足りないので）', 'Free ride (not enough cash)'],
    travelArrive:    ['{n}に着いた', 'Arrived at {n}'],
    travelHere:      ['いまここにいます', 'You are already here'],
    travelBusy:      ['いまは移動できません', 'You cannot travel right now'],
    travelChip:      ['🚃 {n}へ', '🚃 To {n}']
  });
  var K = {
    fare0: 180,
    fareStep: 65,
    fareMax: 310,
    fade: 0.4,
    pick: 1.0,
    pickChip: 0.3,
    hopTiles: 8,
    hurry: 2
  };
  var DCOL = { futako: '#86c46a', shibuya: '#f2b45a', otemachi: '#7f97e0', hongo: '#d9a24c', shinjuku: '#a989e6',
               fab: '#97a3b3', inzai: '#5fb9e4', minato: '#e98d86', ariake: '#4fc2bb' };
  var LINE_COL = '#2fbf7a';
  function centerTile(id) {
    var d = W.DIST[id];
    if (!d) return null;
    if (d.center && isFinite(d.center.x) && isFinite(d.center.y)) return { x: d.center.x, y: d.center.y };
    return { x: d.ix + Math.floor(d.iw / 2), y: d.iy + Math.floor(d.ih / 2) };
  }
  function tPx(q) { return { x: (q.x + 0.5) * TILE, y: (q.y + 0.5) * TILE }; }
  function centerPx(id) { var q = centerTile(id); return q ? tPx(q) : null; }
  function distOrder() {
    if (W.ORDER && W.ORDER.length) return W.ORDER.filter(function (id) { return !!W.DIST[id]; });
    return W.DISTRICTS.map(function (d) { return d.id; });
  }
  function distAt(px, py) {
    var id = W.roomAt(Math.floor(px / TILE), Math.floor(py / TILE));
    return id && id !== 'ave' && W.DIST[id] ? id : null;
  }
  function nearDist(px, py) {
    var id = distAt(px, py);
    if (id) return id;
    var tx = px / TILE, ty = py / TILE, best = null, bd = Infinity;
    W.DISTRICTS.forEach(function (d) {
      var c = centerTile(d.id), m = Math.abs(c.x + 0.5 - tx) + Math.abs(c.y + 0.5 - ty);
      if (m < bd) { bd = m; best = d.id; }
    });
    return best;
  }
  function here() { return distAt(S.player.x, S.player.y); }
  function hops(a, b) {
    var da = W.DIST[a], db = W.DIST[b];
    if (!da || !db) return 0;
    return Math.abs(da.col - db.col) + Math.abs(da.row - db.row);
  }
  function fareOfHops(h) {
    if (!(h > 0)) return 0;
    return Math.min(K.fareMax, K.fare0 + K.fareStep * (h - 1));
  }
  function canPay(v) { return v <= 0 || S.coins >= v; }
  function nominal(to, from) {
    if (!from || !to || from === to) return 0;
    return fareOfHops(hops(from, to));
  }
  function passFree(to, from) {
    var O = Sim.offices; if (O && typeof O.passFree === 'function' && O.passFree(to)) return true;
    var H = Sim.home;
    if (!H || typeof H.passFree !== 'function') return false;
    try { return !!H.passFree(to, from); } catch (e) { return false; }
  }
  function fareInfo(to, from) {
    var n = nominal(to, from), pass = n > 0 && passFree(to, from), f = pass ? 0 : n;
    var free = f > 0 && !canPay(f);
    return { nominal: n, fare: free ? 0 : f, free: free, pass: pass };
  }
  function pay(v) {
    if (!(v > 0)) return;
    G.spend(v, 'travel');
    if (S.tv) S.tv.fares += v;
  }
  var BLOCK_PANELS = ['termsheet', 'ceremony'];
  function busy() {
    if (riding() || S.won || S.gacha || S.showFinance) return true;
    if (G.frozen && G.frozen()) return true;
    var U = QT.UI;
    if (U && U.get) {
      for (var i = 0; i < BLOCK_PANELS.length; i++) {
        var p = U.get(BLOCK_PANELS[i]);
        try { if (p && p.isOpen && p.isOpen()) return true; } catch (e) { }
      }
    }
    return false;
  }
  function ready(id) {
    var d = W.DIST[id];
    if (!d || G.roomOpen(id)) return false;
    if (G.distReady) { try { return !!G.distReady(d); } catch (e) { return false; } }
    try { return !!(d.req && d.req(S, G)); } catch (e2) { return false; }
  }
  function canGo(id) {
    var d = W.DIST[id], from = nearDist(S.player.x, S.player.y);
    if (!d) return { ok: false, ready: false, why: 'unknown', fare: 0 };
    var opn = G.roomOpen(id), rd = !opn && ready(id), fi = fareInfo(id, from);
    var out = { ok: false, ready: rd, why: '', fare: fi.fare, nominal: fi.nominal, free: fi.free, pass: fi.pass,
                hops: from ? hops(from, id) : 0 };
    if (here() === id) out.why = 'here';
    else if (!opn && !rd) out.why = 'locked';
    else if (busy()) out.why = 'busy';
    out.ok = !out.why;
    return out;
  }
  function fareTo(id, from) {
    var f = typeof from === 'string' && W.DIST[from] ? from : nearDist(S.player.x, S.player.y);
    return fareInfo(id, f).fare;
  }
  function condText(id) {
    var d = W.DIST[id];
    if (!d) return '';
    if (d.reqText) return L.nm(d, 'reqText');
    return '';
  }
  function openDist(id) {
    if (G.roomOpen(id)) return true;
    if (typeof G.openDist === 'function') G.openDist(id);
    else {
      var ps = G.PADS();
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        if (p.type === 'open' && p.district && p.district.id === id) { G.doPad(p); break; }
      }
    }
    return G.roomOpen(id);
  }
  function riding() { return !!(S.tv && S.tv.fade); }
  function toast(txt, col) { G.toast({ x: S.player.x, y: S.player.y - 10 }, txt, col || '#e2504a'); }
  function distOf(dest) {
    if (dest == null) return null;
    if (typeof dest === 'object') dest = dest.dist || dest.district || dest.dest || dest.id;
    if (typeof dest === 'object' && dest) dest = dest.id;
    return typeof dest === 'string' && W.DIST[dest] ? dest : null;
  }
  function goTo(dest, why, opt) {
    opt = opt || {};
    var id = distOf(dest);
    if (!id) return false;
    var cg = canGo(id);
    if (!cg.ok) {
      if (why === 'bot') return false;
      if (cg.why === 'locked') { toast(condText(id) || T('travelBusy')); if (QT.Sfx) QT.Sfx.play('error'); }
      else if (cg.why === 'here') toast(T('travelHere'), '#7d788f');
      return false;
    }
    if (!opt.now && why !== 'bot' && !opt.instant && QT.Input && QT.Input.deferTap &&
        QT.Input.deferTap(function () { opt.now = true; goTo(dest, why, opt); }, false)) return true;
    var from = nearDist(S.player.x, S.player.y), fromIn = here();
    if (cg.ready && !openDist(id)) return false;
    var fi = fareInfo(id, from);
    pay(fi.fare);
    if (fi.free && why !== 'bot') toast(T('travelFreeRide'), '#2fbf7a');
    var tv = S.tv;
    tv.n.train = (tv.n.train || 0) + 1;
    tv.n.trip = (tv.n.trip || 0) + 1;
    var r = { mode: 'train', instant: true, from: from, to: id, dist: id, fromDist: fromIn, path: [], legs: [],
              fare: fi.fare, hops: hops(from, id), t: 0, dur: K.fade, speed: 1, label: '', why: why || '' };
    var f = { t: 0, from: fromIn, to: id, why: why || '', warped: false, anchor: { x: S.player.x, y: S.player.y },
              goal: opt.goal && isFinite(opt.goal.x) ? { x: opt.goal.x, y: opt.goal.y } : null, r: r };
    S.player.path = null; S.player.goal = null; S.player.walk = 0;
    if (opt.instant) { warp(f); finish(f, true); return true; }
    tv.fade = f;
    return true;
  }
  function warp(f) {
    f.warped = true;
    var p = centerPx(f.to);
    if (G.warp) G.warp(p.x, p.y, { from: f.from, to: f.to, why: 'trip' });
    else { S.player.x = p.x; S.player.y = p.y; }
    S.player.path = null; S.player.goal = null; S.player.walk = 0;
    G.emit('rideEnd', f.r);
    G.emit('trip', { from: f.from, to: f.to, why: f.why });
  }
  function finish(f, quiet) {
    if (S.tv) S.tv.fade = null;
    var d = W.DIST[f.to];
    if (!quiet) G.toast({ x: S.player.x, y: S.player.y - 14 }, T('travelArrive', { n: d ? L.nm(d) : f.to }), '#2fbf7a');
    if (f.goal) G.goTo(f.goal.x, f.goal.y);
  }
  function fade() {
    var f = S.tv && S.tv.fade;
    if (!f) return 0;
    var h = K.fade / 2, u = f.t < h ? f.t / h : 1 - (f.t - h) / h;
    u = Math.max(0, Math.min(1, u));
    return u * u * (3 - 2 * u);
  }
  function objDist() {
    var o = G.objective ? G.objective() : null, w = o && o.where;
    if (typeof w === 'function') { try { w = w(S, G); } catch (e) { w = null; } }
    if (!w) return null;
    if (W.DIST[w]) return w;
    if (W.BY_ID[w]) return W.BY_ID[w].room;
    if (W.BLOCKS && W.BLOCKS[w]) return W.BLOCKS[w].district;
    return null;
  }
  function nextDist() {
    var Gd = QT.Guide, id = null;
    try {
      var rd = Gd && Gd.rideDest ? Gd.rideDest() : null;
      if (rd && W.DIST[rd]) id = rd;
      if (!id && Gd && Gd.goal) {
        var gd = Gd.goal(), q = gd && (gd.pt || (gd.pad ? tPx(gd.pad) : null));
        if (q) id = distAt(q.x, q.y);
      }
    } catch (e) { id = null; }
    if (!id) id = objDist();
    return id && W.DIST[id] ? id : null;
  }
  function shortName(d) {
    var s = L.nm(d, 'short');
    if (s) return s;
    s = L.nm(d) || '';
    return s.split(/[・,&／\/]| and /)[0].trim() || s;
  }
  function nextTrip() {
    var id = nextDist();
    if (!id || id === here()) return null;
    var cg = canGo(id);
    if (!cg.ok && cg.why !== 'busy') return null;
    var d = W.DIST[id];
    return { dist: id, name: L.nm(d), label: T('travelChip', { n: shortName(d) }),
             fare: cg.fare, free: cg.free, ready: cg.ready, ok: cg.ok, color: DCOL[id] || LINE_COL };
  }
  function tripList() {
    var nd = nextDist(), h = here(), out = [];
    distOrder().forEach(function (id, i) {
      var d = W.DIST[id], cg = canGo(id);
      out.push({ dist: id, name: L.nm(d), color: DCOL[id] || LINE_COL, fare: cg.fare, nominal: cg.nominal,
                 free: cg.free, pass: cg.pass, hops: cg.hops,
                 here: id === h, open: G.roomOpen(id), ready: cg.ready, ok: cg.ok, why: cg.why,
                 cond: cg.why === 'locked' ? condText(id) : '', next: id === nd && id !== h, can: cg.ok, order: i });
    });
    function rank(e) { return e.next && (e.ok || e.ready) ? 0 : e.ready ? 1 : 2; }
    out.sort(function (a, b) { return rank(a) - rank(b) || a.order - b.order; });
    return out;
  }
  function sheet() { return QT.UI && QT.UI.get ? QT.UI.get('tripsheet') : null; }
  function openSheet(why) {
    var sh = sheet();
    if (!sh || !sh.open || riding()) return false;
    sh.open(why || 'hud');
    return true;
  }
  function speedT() { return G.playerSpeed() / TILE; }
  function destOf(tx, ty) {
    var id = distAt(tx, ty);
    if (id) return id;
    var best = null, bd = Infinity;
    W.DISTRICTS.forEach(function (d) {
      if (!G.roomOpen(d.id)) return;
      var c = centerPx(d.id), n = G.pathLen(tx, ty, c.x, c.y);
      if (n < bd) { bd = n; best = d.id; }
    });
    return best;
  }
  function plan(fromPx, fromPy, toPx, toPy) {
    var v = speedT(), walkTiles = G.pathLen(fromPx, fromPy, toPx, toPy);
    var fromD = distAt(fromPx, fromPy), dest = destOf(toPx, toPy);
    var out = { walk: walkTiles / v, walkTiles: walkTiles, train: null, taxi: null, car: null,
                fare: 0, taxiFare: 0, route: null, best: 'walk', detail: {},
                same: !!fromD && fromD === dest, pick: K.pick, fade: K.fade, walkOutTiles: Infinity, dest: dest };
    if (!dest || out.same || !G.roomOpen(dest)) return out;
    var c = centerPx(dest), wo = G.pathLen(toPx, toPy, c.x, c.y);
    if (!isFinite(wo)) return out;
    var origin = fromD || nearDist(fromPx, fromPy), fi = fareInfo(dest, origin);
    out.walkOutTiles = wo; out.fare = fi.fare;
    out.train = K.pick + K.fade + wo / v;
    out.route = [origin, dest];
    out.detail.train = { from: origin, to: dest, dest: dest, origin: origin, pad: null, hops: hops(origin, dest),
                         walkInTiles: 0, walkOutTiles: wo, ride: K.fade, pick: K.pick, fare: fi.fare, free: fi.free,
                         legs: [], mode: 'train', instant: true };
    if (out.train < out.walk) out.best = 'train';
    return out;
  }
  function tripTiles(fx, fy, tx, ty) {
    var n = G.pathLen(fx, fy, tx, ty), fromD = distAt(fx, fy), dest = destOf(tx, ty);
    if (!dest || (fromD && fromD === dest)) return n;
    var c = centerPx(dest), wo = G.pathLen(tx, ty, c.x, c.y);
    if (!isFinite(wo)) return n;
    return Math.min(n, wo + K.hopTiles);
  }
  if (typeof G.tripTiles !== 'function') G.tripTiles = tripTiles;
  G.mod({
    id: 'travel', order: 15,
    reset: function (S) {
      S.tv = { fade: null, fares: 0, n: { train: 0, subway: 0, trip: 0 } };
    },
    update: function (S, dt) {
      var f = S.tv.fade;
      if (!f) return;
      var a = f.warped ? null : f.anchor;
      if (a) { S.player.x = a.x; S.player.y = a.y; }
      else if (f.at) { S.player.x = f.at.x; S.player.y = f.at.y; }
      S.player.path = null; S.player.goal = null; S.player.walk = 0;
      f.t += dt; f.r.t = f.t;
      if (!f.warped && f.t >= K.fade / 2) { warp(f); f.at = { x: S.player.x, y: S.player.y }; }
      if (f.t >= K.fade) finish(f);
    },
    save: function (S) {
      var tv = S.tv, f = tv.fade;
      return { fares: tv.fares, n: tv.n, arrive: f ? centerPx(f.to) : null };
    },
    load: function (S, d) {
      var tv = S.tv;
      tv.fares = d.fares || 0;
      if (d.n) Object.keys(tv.n).forEach(function (k) { tv.n[k] = d.n[k] || 0; });
      if (d.arrive && isFinite(d.arrive.x) && isFinite(d.arrive.y)) { S.player.x = d.arrive.x; S.player.y = d.arrive.y; }
    }
  });
  Sim.travel = {
    K: K,
    COLORS: DCOL,
    PAD_COLOR: LINE_COL,
    riding: riding,
    fade: fade,
    get ride() { return S.tv && S.tv.fade ? S.tv.fade.r : null; },
    goTo: goTo,
    canGo: canGo,
    fareTo: fareTo,
    openSheet: openSheet,
    plan: plan,
    tripTiles: tripTiles,
    hops: hops,
    fareHops: fareOfHops,
    fare: function (toId, fromId) { return nominal(distOf(toId), distOf(fromId)); },
    tripList: tripList,
    nextDist: nextDist,
    nextTrip: nextTrip,
    here: here,
    distAt: function (px, py) { return distAt(px, py); },
    nearDist: function (px, py) { return nearDist(px, py); },
    center: centerTile,
    centerPx: centerPx,
    arrivePt: centerPx,
    arriveAt: function (id) { return W.DIST[id] ? centerPx(id) : null; },
    condText: condText,
    shortName: function (id) { return W.DIST[id] ? shortName(W.DIST[id]) : ''; },
    pay: pay,
    canPay: canPay,
    counts: function () { return S.tv ? S.tv.n : {}; },
    fares: function () { return S.tv ? S.tv.fares : 0; },
    mode: function () { return riding() ? 'train' : 'walk'; },
    eta: function (ax, ay, bx, by) {
      var pl = plan(ax, ay, bx, by);
      return pl.train != null && pl.train < pl.walk ? pl.train : pl.walk;
    },
    trainPos: function () { return null; },
    ridePads: function () { return []; },
    hurry: function () { return false; },
    speedUp: function () { return false; },
    hurried: function () { return false; },
    hasCar: function () { return false; }
  };
})(window.QT || (window.QT = {}));
