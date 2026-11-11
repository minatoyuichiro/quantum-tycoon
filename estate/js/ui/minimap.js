(function (QT) {
  'use strict';
  var W = QT.World, L = QT.L, I = QT.Iso, TILE = W.TILE;
  var A = I.A, B = I.B, WPX = W.WORLD_PX_W;
  var DIAG_W = 2 * WPX * A, DIAG_H = 2 * WPX * B;
  var MAP_W = 72, MAP_H = 40;
  L.add({
    mmAve: ['大通り', 'Avenue'],
    mapTitle: ['東京', 'Tokyo'],
    mapWalk: ['ここへ歩く', 'Walk here'],
    mapWalkSec: ['歩いて 約{n}秒', 'About {n}s on foot'],
    mapHere: ['いまここ', 'You are here'],
    mapNoWay: ['いまは歩いて行けません', 'No walking route right now'],
    mapOpenSt: ['開通ずみ', 'Open'],
    mapHint: ['地区をタップするとすぐ行けます', 'Tap a district to go there instantly'],
    mapHintFare: ['地区をタップするとすぐ行けます  ¥{a}〜¥{b}', 'Tap a district to go there instantly  ¥{a}–¥{b}'],
    mapFare: ['¥{f}', '¥{f}'],
    mapReady: ['開通できます! タップで開通して行く', 'Ready! Tap to open it and go'],
    mapGoOpen: ['開通して行く', 'Open & go'],
    mapGo: ['行く', 'Go'],
    mapLegYou: ['自分', 'You'],
    mapLegNext: ['次の目標', 'Next goal'],
    mapLegDeliv: ['宅配先', 'Delivery'],
    mapLegRival: ['ライバルの営業', 'Rival sales rep']
  });
  var MAP_COL = { town: '#f7d9a9', biz: '#cdd7f3', sw: '#f9e3bd', plant: '#d3d9e2', service: '#d4e2f3',
                  outsrc: '#d8e4f8', cryo: '#c9e9f7', hq: '#bcaae8' };
  var COL = { rim: '#c8e1b3', water: '#9fd3ef', ave: '#efece4', locked: '#d6d2de', rail: '#2fbf7a',
              you: '#2bb8d8', next: '#f5b21c', deliv: '#ef7d2e', rival: '#e2504a', ink: '#2f2c46', soft: '#7d788f' };
  function mk(sc, ox, oy) {
    return function (px, py) { return { x: ox + (px - py) * A * sc, y: oy + (px + py) * B * sc }; };
  }
  function quad(c, pr, x, y, w, h) {
    var a = pr(x * TILE, y * TILE), b = pr((x + w) * TILE, y * TILE),
        d = pr((x + w) * TILE, (y + h) * TILE), e = pr(x * TILE, (y + h) * TILE);
    c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(d.x, d.y); c.lineTo(e.x, e.y); c.closePath();
  }
  function isDeco(p) { return p.kind === 'deco' || p.deco === true || typeof p.deco === 'string'; }
  function sigOf(S) {
    var s = '';
    W.DISTRICTS.forEach(function (d) { s += QT.G.roomOpen(d.id) ? '1' : '0'; });
    s += ':';
    for (var i = 0; i < W.PLOTS.length; i++) s += S.p[W.PLOTS[i].id] && S.p[W.PLOTS[i].id].owned ? '1' : '0';
    return s;
  }
  function bake(cache, w, h, dpr, detail, S) {
    var key = w + 'x' + h + '@' + dpr + (detail ? 'd' : ''), sig = sigOf(S);
    if (cache.cv && cache.key === key && cache.sig === sig) return cache;
    var cv = cache.cv || (cache.cv = document.createElement('canvas'));
    cv.width = Math.ceil(w * dpr); cv.height = Math.ceil(h * dpr);
    var c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sc = Math.min(w / DIAG_W, h / DIAG_H), ox = w / 2, oy = (h - DIAG_H * sc) / 2;
    var pr = mk(sc, ox, oy);
    cache.sc = sc; cache.ox = ox; cache.oy = oy; cache.pr = pr;
    var WT = W.WORLD_W, RIM = W.RIM;
    c.fillStyle = COL.rim; c.beginPath(); quad(c, pr, 0, 0, WT, WT); c.fill();
    var bay = W.DIST.ariake, by0 = bay ? Math.max(0, bay.iy - 2) : 0;
    c.fillStyle = COL.water; c.beginPath();
    quad(c, pr, WT - RIM, by0, RIM, WT - by0); quad(c, pr, 0, WT - RIM, WT - RIM, RIM); c.fill();
    c.fillStyle = COL.ave; c.beginPath();
    W.ROADS.forEach(function (r) { quad(c, pr, r.x, r.y, r.w, r.h); }); c.fill();
    W.DISTRICTS.forEach(function (d) {
      var open = QT.G.roomOpen(d.id);
      c.fillStyle = open ? (MAP_COL[d.theme] || MAP_COL.town) : COL.locked;
      c.beginPath(); quad(c, pr, d.ix, d.iy, d.iw, d.ih); c.fill();
      if (!open && detail) {
        c.save(); c.beginPath(); quad(c, pr, d.ix, d.iy, d.iw, d.ih); c.clip();
        var t = pr(d.ix * TILE, d.iy * TILE), wd = d.iw * TILE * A * sc * 2, ht = d.ih * TILE * B * sc * 2;
        c.strokeStyle = 'rgba(120,110,140,0.22)'; c.lineWidth = 1.2; c.beginPath();
        for (var k = -ht; k < wd; k += 7) { c.moveTo(t.x - wd / 2 + k, t.y + ht); c.lineTo(t.x - wd / 2 + k + ht, t.y); }
        c.stroke(); c.restore();
      }
    });
    if (detail) {
      c.fillStyle = 'rgba(120,115,140,0.16)'; c.beginPath();
      W.PLOTS.forEach(function (p) { if (isDeco(p) && QT.G.roomOpen(p.room)) quad(c, pr, p.x, p.y, p.w, p.h); });
      c.fill();
    }
    c.fillStyle = 'rgba(70,60,110,0.42)'; c.beginPath();
    W.PLOTS.forEach(function (p) {
      if (isDeco(p) || !QT.G.roomOpen(p.room) || !(S.p[p.id] && S.p[p.id].owned)) return;
      quad(c, pr, p.x, p.y, p.w, p.h);
    });
    c.fill();
    if (detail) {
      c.strokeStyle = COL.rail; c.lineWidth = Math.max(2, 3 * sc * 16); c.lineJoin = 'round';
      c.globalAlpha = 0.55;
      c.beginPath();
      W.RAIL.loop.forEach(function (q, i) {
        var p = pr(q[0] * TILE, q[1] * TILE);
        if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y);
      });
      c.closePath(); c.stroke();
      c.globalAlpha = 1;
    }
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = detail ? 1.2 : 0.7;
    W.DISTRICTS.forEach(function (d) { c.beginPath(); quad(c, pr, d.ix, d.iy, d.iw, d.ih); c.stroke(); });
    cache.key = key; cache.sig = sig;
    return cache;
  }
  function nextPoint() {
    var n = QT.Guide && QT.Guide.next ? QT.Guide.next() : null;
    if (!n) return null;
    if (n.pt) return n.pt;
    if (n.pad) return { x: (n.pad.x + 0.5) * TILE, y: (n.pad.y + 0.5) * TILE };
    return null;
  }
  function delivPoint(S) {
    if (!S.deliv) return null;
    var p = W.BY_ID[S.deliv.corp];
    return p ? W.center(p) : null;
  }
  function dot(c, p, r, col, ring) {
    c.beginPath(); c.arc(p.x, p.y, r + (ring || 1.5), 0, 7); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fillStyle = col; c.fill();
  }
  function liveDots(c, pr, S, big, racePart) {
    var t = S.t, d = delivPoint(S), n = nextPoint();
    if (d) dot(c, pr(d.x, d.y), big ? 4 : 2.2, COL.deliv);
    if (n) {
      var q = pr(n.x, n.y), k = 0.5 + 0.5 * Math.sin(t * 6);
      c.beginPath(); c.arc(q.x, q.y, (big ? 7 : 4) + k * (big ? 3 : 1.5), 0, 7);
      c.strokeStyle = 'rgba(245,178,28,' + (0.9 - k * 0.5).toFixed(2) + ')'; c.lineWidth = big ? 2 : 1.2; c.stroke();
      dot(c, q, big ? 4 : 2.2, COL.next);
    }
    raceDots(c, pr, S, big, racePart);
    var me = pr(S.player.x, S.player.y);
    dot(c, me, big ? 5 : 2.8, COL.you, big ? 2 : 1.4);
  }
  function raceDots(c, pr, S, big, part) {
    var rc = QT.FX && QT.FX.race ? QT.FX.race() : null;
    if (!rc) return;
    var k = 0.5 + 0.5 * Math.sin(S.t * 8);
    if (rc.target && part !== 'runner') {
      var q = pr(rc.target.x, rc.target.y);
      c.beginPath(); c.arc(q.x, q.y, (big ? 7 : 3.6) + k * (big ? 2 : 1), 0, 7);
      c.strokeStyle = 'rgba(226,80,74,' + (0.95 - k * 0.4).toFixed(2) + ')'; c.lineWidth = big ? 2.2 : 1.3; c.stroke();
    }
    if (rc.pos && part !== 'target') {
      var p = pr(rc.pos.x, rc.pos.y);
      dot(c, p, big ? 4.5 : 2.6, COL.rival, big ? 2 : 1.3);
      if (big && rc.target) {
        var q2 = pr(rc.target.x, rc.target.y);
        c.save(); c.setLineDash([3, 3]); c.strokeStyle = 'rgba(226,80,74,0.6)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q2.x, q2.y); c.stroke(); c.restore();
      }
    }
  }
  var lastDist = null;
  function hereName(S) {
    var id = W.roomAtPx(S.player.x, S.player.y);
    if (id && id !== 'ave') lastDist = id;
    var d = lastDist && W.DIST[lastDist];
    if (!id || id === 'ave') return (d ? L.nm(d) + ' · ' : '') + L.t('mmAve');
    return d ? L.nm(d) : '';
  }
  var mini = {};
  function shortHere(S) {
    hereName(S);
    var d = lastDist && W.DIST[lastDist];
    return d ? String(L.nm(d, 'short') || L.nm(d)).split(/[・·\/&,]| and /)[0].trim() : '';
  }
  function drawMini(S, H) {
    if (S.won) return;
    var c = H.ctx, r = H.minimapRect(), mx = r.x + (r.w - MAP_W) / 2, my = r.y + (r.h - MAP_H) / 2;
    H.fillRR(r.x, r.y, r.w, r.h, 9, 'rgba(255,255,255,0.78)');
    H.strokeRR(r.x, r.y, r.w, r.h, 9, 'rgba(120,110,160,0.22)', 1);
    var m = bake(mini, MAP_W, MAP_H, Math.min(2, H.dpr || 1), false, S);
    c.save(); c.globalAlpha = 0.92;
    c.drawImage(m.cv, mx, my, MAP_W, MAP_H);
    c.restore();
    var pr = mk(m.sc, mx + m.ox, my + m.oy);
    liveDots(c, pr, S, false);
    var nm = shortHere(S);
    if (nm) {
      c.save();
      var s0 = nm, mw = r.w * 0.62, fs = 8;
      c.font = '800 ' + fs + 'px ' + H.FONT;
      while (fs > 6 && c.measureText(s0).width > mw) { fs -= 0.5; c.font = '800 ' + fs + 'px ' + H.FONT; }
      if (c.measureText(s0).width > mw && /[-\s]/.test(s0)) s0 = s0.split(/[-\s]/)[0];
      while (s0.length > 1 && c.measureText(s0).width > mw) s0 = s0.slice(0, -1);
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineJoin = 'round';
      c.strokeText(s0, r.x + 5, r.y + 7); c.fillStyle = COL.ink; c.fillText(s0, r.x + 5, r.y + 7);
      c.restore();
    }
    QT.UI.tapRect({ x: r.x, y: r.y - 2, w: r.w, h: Math.max(44, r.h + 4) }, function () {
      var ph = QT.UI.get('phone');
      if (ph && ph.open) ph.open('map');
      else if (QT.Render && QT.Render.H && QT.Render.H.tripOpen) QT.Render.H.tripOpen('map');
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      return true;
    });
  }
  function overlap(a, list) {
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
      var b = list[i], w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (w > 0 && h > 0) sum += w * h;
    }
    return sum;
  }
  var full = {}, sel = null, selInfo = null, selAt = -9;
  var trips = { at: -9, by: {}, lo: null, hi: null };
  function tripFares(S, H) {
    if (S.t >= trips.at && S.t - trips.at < 1) return trips;
    trips.at = S.t; trips.by = {}; trips.lo = null; trips.hi = null;
    if (!H.tripCan) return trips;
    W.DISTRICTS.forEach(function (d) {
      var c = H.tripCan(d.id);
      if (!c) return;
      trips.by[d.id] = c;
      if (c.ok && c.fare > 0) {
        trips.lo = trips.lo == null ? c.fare : Math.min(trips.lo, c.fare);
        trips.hi = trips.hi == null ? c.fare : Math.max(trips.hi, c.fare);
      }
    });
    return trips;
  }
  function districtAt(R, m, p) {
    var w = I.toWorld((p.x - R.x - m.ox) / m.sc, (p.y - R.y - m.oy) / m.sc);
    var id = W.roomAtPx(w.x, w.y);
    return id && id !== 'ave' ? W.DIST[id] : null;
  }
  function walkTarget(d) {
    var G = QT.G;
    if (!G.roomOpen(d.id) && d.gatePad) return { x: (d.gatePad.x + 0.5) * TILE, y: (d.gatePad.y + 0.5) * TILE };
    var cx = d.ix + Math.floor(d.iw / 2), cy = d.iy + Math.floor(d.ih / 2);
    for (var rr = 0; rr <= 14; rr++)
      for (var dy = -rr; dy <= rr; dy++)
        for (var dx = -rr; dx <= rr; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== rr) continue;
          var px = (cx + dx + 0.5) * TILE, py = (cy + dy + 0.5) * TILE;
          if (G.walkable(px, py)) return { x: px, y: py };
        }
    return d.gatePad ? { x: (d.gatePad.x + 0.5) * TILE, y: (d.gatePad.y + 0.5) * TILE } : null;
  }
  function routeInfo(S, d) {
    if (selInfo && selInfo.id === d.id && S.t - selAt < 1) return selInfo;
    var G = QT.G, tg = walkTarget(d), tiles = tg ? G.pathLen(S.player.x, S.player.y, tg.x, tg.y) : Infinity;
    selAt = S.t;
    selInfo = { id: d.id, tg: tg, sec: isFinite(tiles) ? Math.max(1, Math.round(tiles * TILE / G.playerSpeed())) : null };
    return selInfo;
  }
  function drawFull(S, H, R, close) {
    var c = H.ctx, C = H.C, G = QT.G;
    var wide = R.w > R.h * 1.5, infoH = 92;
    var mapR = wide ? { x: R.x, y: R.y, w: Math.floor(R.w * 0.6), h: R.h }
                    : { x: R.x, y: R.y + infoH + 8, w: R.w, h: Math.max(80, R.h - infoH - 8) };
    var m = bake(full, Math.floor(mapR.w), Math.floor(mapR.h), Math.min(2, H.dpr || 1), true, S);
    c.drawImage(m.cv, mapR.x, mapR.y, Math.floor(mapR.w), Math.floor(mapR.h));
    var pr = mk(m.sc, mapR.x + m.ox, mapR.y + m.oy);
    if (sel) {
      c.save(); c.beginPath(); quad(c, pr, sel.ix, sel.iy, sel.iw, sel.ih);
      c.strokeStyle = '#e8a800'; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); c.restore();
    }
    var fs = Math.max(9, Math.min(13, m.sc * 16 * 30 * A * 0.17));
    var occ = [], tf = tripFares(S, H);
    var marks = [];
    function mark(p, r) { if (p) marks.push({ x0: p.x - r, x1: p.x + r, y0: p.y - r, y1: p.y + r }); }
    mark(pr(S.player.x, S.player.y), 8);
    var np = nextPoint(), dp = delivPoint(S);
    if (np) mark(pr(np.x, np.y), 11);
    if (dp) mark(pr(dp.x, dp.y), 6.5);
    var rc0 = QT.FX && QT.FX.race ? QT.FX.race() : null;
    if (rc0 && rc0.target) mark(pr(rc0.target.x, rc0.target.y), 10);
    raceDots(c, pr, S, true, 'runner');
    W.DISTRICTS.forEach(function (d) {
      var ctr0 = pr((d.ix + d.iw / 2) * TILE, (d.iy + d.ih / 2) * TILE);
      var open = G.roomOpen(d.id), maxW = d.iw * TILE * A * m.sc * 1.5;
      c.save();
      c.font = '800 ' + fs + 'px ' + H.FONT;
      var dnm = L.nm(d);
      if (c.measureText(dnm).width > maxW) dnm = String(L.nm(d, 'short') || dnm).split(/[・·\/&,]| and /)[0].trim() || dnm;
      var nw = Math.min(maxW, c.measureText(dnm).width);
      c.restore();
      var tc = tf.by[d.id], ft = '', ffs = Math.max(8, fs - 3.5), fw = 0;
      if (open && tc && tc.ok && tc.fare > 0) {
        ft = L.t('mapFare', { f: G.fmt(tc.fare) });
        c.save(); c.font = '800 ' + ffs + 'px ' + H.FONT; fw = c.measureText(ft).width; c.restore();
      }
      var sg = null, ln = null, sfs = Math.max(8, fs - 3), cw = 0, rdy = false;
      if (!open) {
        sg = H.distSign(d); ln = sg.lines[1] || ['', C.inkSoft];
        c.save(); c.font = '700 ' + sfs + 'px ' + H.FONT;
        cw = Math.min(maxW, c.measureText(ln[0]).width);
        c.restore();
        rdy = sg.ready || !!(tc && tc.ready);
        if (rdy && !sg.ready) {
          ln = [L.t('distCanOpen')];
          c.save(); c.font = '700 ' + sfs + 'px ' + H.FONT; cw = Math.min(maxW, c.measureText(ln[0]).width); c.restore();
        }
      }
      var bw = Math.max(nw, fw, cw) + 2;
      var up = fs * 0.6 + (open ? 0 : fs * 0.55);
      var dn = open ? (ft ? fs * 0.6 + ffs + 2 : fs * 0.6) : fs * 0.6 + sfs;
      var lim = (d.iw + d.ih) * TILE * B * m.sc * 0.4, stp = fs * 0.5, best = null;
      var dxs = [0, -bw * 0.25, bw * 0.25, -bw * 0.5, bw * 0.5];
      for (var si = 0; si <= 16; si++) {
        var dy = (si % 2 ? -1 : 1) * Math.ceil(si / 2) * stp;
        if (Math.abs(dy) > lim) continue;
        for (var xi = 0; xi < dxs.length; xi++) {
          var q = { x: ctr0.x + dxs[xi], y: ctr0.y + dy };
          var box = { x0: q.x - bw / 2, x1: q.x + bw / 2, y0: q.y - up, y1: q.y + dn };
          var cost = 3 * overlap(box, marks) + overlap(box, occ) + (Math.abs(dy) + Math.abs(dxs[xi])) * 0.01;
          if (!best || cost < best.cost) best = { q: q, box: box, cost: cost };
        }
        if (best.cost < 1) break;
      }
      var ctr = best.q;
      occ.push(best.box);
      H.fitTxt(dnm, ctr.x - nw / 2, ctr.y - (open ? 0 : fs * 0.55), fs, maxW, open ? C.ink : '#6d6880', 800, 8);
      if (ft) H.txt(ft, ctr.x, ctr.y + fs * 0.6 + ffs / 2 + 1, ffs, '#2a9d63', 'center', 800, 'rgba(255,255,255,0.9)');
      if (!open) H.fitTxt(ln[0], ctr.x - cw / 2, ctr.y + fs * 0.6, sfs, maxW, rdy ? '#c98f0f' : '#7d788f', 700, 7);
    });
    liveDots(c, pr, S, true, 'target');
    var lg = [[COL.you, 'mapLegYou'], [COL.next, 'mapLegNext'], [COL.deliv, 'mapLegDeliv']];
    if (QT.FX && QT.FX.race && QT.FX.race()) lg.push([COL.rival, 'mapLegRival']);
    lg.forEach(function (e, i) {
      var ly = mapR.y + 10 + i * 15;
      dot(c, { x: mapR.x + 10, y: ly }, 4, e[0]);
      H.txt(L.t(e[1]), mapR.x + 19, ly, 10, COL.soft, 'left', 700);
    });
    QT.UI.tapRect(mapR, function (p) {
      var d = districtAt(mapR, m, p);
      sel = d; selInfo = null;
      if (!d) return true;
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      var c = H.tripCan ? H.tripCan(d.id) : null;
      if (c && (c.ok || c.ready) && H.tripGo(d.id, 'map')) { sel = null; trips.at = -9; if (close) close(); }
      return true;
    });
    var iy = R.y, ix = wide ? mapR.x + mapR.w + 8 : R.x + 6, iw = wide ? R.x + R.w - ix - 6 : R.w - 12;
    H.fillRR(ix, iy, iw, infoH, 14, '#f6f4fb');
    if (!sel) {
      var hint = tf.lo != null ? L.t('mapHintFare', { a: G.fmt(tf.lo), b: G.fmt(tf.hi) }) : L.t('mapHint');
      H.fitTxt(hint, ix + 14, iy + infoH / 2, 11.5, iw - 28, COL.soft, 700, 8);
      return;
    }
    var here = H.tripHere ? H.tripHere() === sel.id : W.roomAtPx(S.player.x, S.player.y) === sel.id, open = G.roomOpen(sel.id);
    H.fitTxt(L.nm(sel), ix + 14, iy + 18, 15, iw - 28, C.ink, 800);
    H.fitTxt(L.nm(sel, 'sub') || '', ix + 14, iy + 38, 10.5, iw - 28, COL.soft, 700, 8.5);
    var sg2 = open ? null : H.distSign(sel), cs = H.tripCan ? H.tripCan(sel.id) : null;
    var status = open ? L.t('mapOpenSt') : cs && cs.ready ? L.t('mapReady') : (sg2.lines[1] || [''])[0];
    H.fitTxt(status, ix + 14, iy + 58, 10.5, iw * 0.55, open ? C.green : (sg2.ready || (cs && cs.ready) ? '#c98f0f' : C.red), 800, 8);
    if (here) { H.txt(L.t('mapHere'), ix + iw - 14, iy + infoH - 22, 12, COL.you, 'right', 800); return; }
    var bw = Math.min(150, iw * 0.42), bh = 40, bx = ix + iw - bw - 10, by = iy + infoH - bh - 8;
    if (cs && (cs.ok || cs.ready) && H.tripGo) {
      var lab = cs.ready ? L.t('mapGoOpen') : L.t('mapGo') + (cs.fare ? '  ¥' + G.fmt(cs.fare) : '');
      H.fillRR(bx, by, bw, bh, 13, cs.ready ? '#e8a800' : C.green);
      H.txt(lab, bx + bw / 2, by + bh / 2, 13, '#ffffff', 'center', 900);
      QT.UI.tapRect({ x: bx - 4, y: by - 4, w: bw + 8, h: bh + 8 }, function () {
        if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
        if (H.tripGo(sel.id, 'map')) { sel = null; trips.at = -9; if (close) close(); }
        return true;
      });
      return;
    }
    if (!open) return;
    var ri = routeInfo(S, sel);
    if (ri.sec == null || !ri.tg) { H.txt(L.t('mapNoWay'), ix + iw - 14, iy + infoH - 22, 11, C.red, 'right', 700); return; }
    H.txt(L.t('mapWalkSec', { n: ri.sec }), ix + 14, iy + infoH - 16, 11, C.ink, 'left', 700);
    H.fillRR(bx, by, bw, bh, 13, C.gold);
    H.txt(L.t('mapWalk'), bx + bw / 2, by + bh / 2, 13.5, '#ffffff', 'center', 900);
    QT.UI.tapRect({ x: bx - 4, y: by - 4, w: bw + 8, h: bh + 8 }, function () {
      G.goTo(ri.tg.x, ri.tg.y);
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
      if (close) close();
      return true;
    });
  }
  QT.UI.panel('minimap', {
    layer: 'hud', draw: drawMini, drawFull: drawFull,
    drawsRep: true,
    select: function (id) { sel = id ? W.DIST[id] || null : null; selInfo = null; },
    selected: function () { return sel; }
  });
})(window.QT || (window.QT = {}));
