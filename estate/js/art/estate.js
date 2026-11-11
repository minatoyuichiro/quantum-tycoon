(function (QT) {
  'use strict';
  var on = QT.Art.scope('estate');
  var L = QT.L;
  function t(k, v) { return L.t(k, v); }
  L.add({
    ae_sale:   ['売 {p}', 'Sale {p}'],
    ae_mine:   ['自分の {c}', 'Mine {c}'],
    ae_build:  ['工事中', 'Building'],
    ae_pend:   ['回収 {v}', 'Collect {v}'],
    ae_view:   ['内見 {w} {s}s', 'Viewing: {w} {s}s'],
    ae_deal:   ['掘り出し物 {p}・{s}s', 'Bargain {p} · {s}s'],
    ae_broker: ['仲介 {w} {s}s', 'Broker: {w} {s}s'],
    ae_rooms:  ['自分の部屋 {n}', '{n} yours'],
    ae_roomsSale: ['売 {n}室 {p}〜', '{n} rooms from {p}'],
    ae_next:   ['NEXT', 'NEXT']
  });
  var NEAR = 11;
  var nextRes = null, nextAt = -9;
  function padsOf(type) { return QT.G.PADS().filter(function (p) { return p.type === type; }); }
  function dist2(S, pad) { var dx = (pad.x + 0.5) * 16 - S.player.x, dy = (pad.y + 0.5) * 16 - S.player.y; return dx * dx + dy * dy; }
  function nearest(S, list) {
    var best = null, bd = Infinity;
    list.forEach(function (p) { var d = dist2(S, p); if (d < bd) { bd = d; best = p; } });
    return best;
  }
  function propsAt(S, pd) {
    if (pd.p && pd.p.condo && QT.G.estate) return QT.G.estate.roomsOf(pd.p).filter(Boolean);
    var p = S.props[pd.p.id]; return p ? [p] : [];
  }
  function anyAt(S, pd, f) { return propsAt(S, pd).some(f); }
  function saleAt(S, pd) {
    var best = null, Es = QT.G.estate;
    propsAt(S, pd).forEach(function (p) { if (p.sale && !p.own && (!best || Es.yields(p).net > Es.yields(best).net)) best = p; });
    return best;
  }
  function computeNext(S, G) {
    if (!S.life || !S.life.chosen) return null;
    var props = padsOf('prop');
    var tr = props.filter(function (pd) { return anyAt(S, pd, function (p) { return p.own && p.trouble.length; }); });
    if (tr.length) return { pad: nearest(S, tr) };
    if (G.inherit && G.inherit.needVisit()) { var jk = padsOf('jikka')[0]; if (jk) return { pad: jk }; }
    var here1 = QT.World.roomAtPx(S.player.x, S.player.y);
    var vw = props.filter(function (pd) { return pd.p.room === here1 && anyAt(S, pd, function (p) { return viewOf(p) || brokerOf(p); }); });
    if (vw.length) return { pad: nearest(S, vw) };
    var here0 = QT.World.roomAtPx(S.player.x, S.player.y);
    var pend = props.filter(function (pd) { return pd.p.room === here0 && anyAt(S, pd, function (p) { return p.own && p.pend > 0; }); });
    if (pend.length) return { pad: nearest(S, pend) };
    var o = G.objective && G.objective();
    var w = o && o.where;
    if (!w) return null;
    if (w === 'agency') return { pad: padsOf('agency')[0] };
    if (w === 'starter') {
      var st0 = S.mkt.starter;
      var stp = S.props[st0], sid0 = stp ? (stp.site || stp.id) : st0;
      var sp = props.filter(function (pd) { return pd.p.id === sid0; })[0];
      if (sp) return { pad: sp };
      w = 'prop';
    }
    if (w === 'tax') return { pad: padsOf('taxoffice')[0] };
    if (w === 'mine') {
      var mine = props.filter(function (pd) { return anyAt(S, pd, function (p) { return p.own; }); });
      var mh = mine.filter(function (pd) { return pd.p.room === here0; });
      return { pad: nearest(S, mh.length ? mh : mine) };
    }
    if (w === 'bank') {
      var want = S.life.biz && !S.life.retired ? 'koko' : S.life.retired ? 'shinkin' : 'chigin';
      return { pad: padsOf('bank').filter(function (pd) { return pd.p.lender === want; })[0] };
    }
    if (w === 'prop') {
      var Es = G.estate, sale = props.filter(function (pd) { return saleAt(S, pd) && G.padActive(pd); });
      if (!sale.length) return null;
      if (o.id === 'inspect') return { pad: nearest(S, sale.filter(function (pd) { return !saleAt(S, pd).insp; })) || nearest(S, sale) };
      var reach = S.coins * 4 + 3000000;
      var ok = sale.filter(function (pd) { var p = saleAt(S, pd); return p.sale.price <= reach && Es.useOf(p) !== 'land'; });
      if (!ok.length) return { pad: nearest(S, sale) };
      ok.sort(function (a, b) { return Es.yields(saleAt(S, b)).net - Es.yields(saleAt(S, a)).net; });
      var here = QT.World.roomAtPx(S.player.x, S.player.y);
      var top = ok.slice(0, 4), same = top.filter(function (pd) { return pd.p.room === here; });
      return { pad: same[0] || top[0] };
    }
    return null;
  }
  function next() {
    var S = QT.G.S;
    if (Math.abs(S.t - nextAt) > 0.5) {
      nextAt = S.t;
      try { nextRes = computeNext(S, QT.G); } catch (e) { nextRes = null; }
      if (nextRes && !nextRes.pad) nextRes = null;
    }
    return nextRes;
  }
  QT.Guide = {
    next: next, goal: next, shown: function () { return null; }, hits: function () { return null; },
    rideDest: function () { return null; }, tripDest: function () { return null; }, lever: function () { return null; },
    err: function () { return null; }
  };
  var offAuto = 0, onCount = 0;
  QT.G.on('rentIn', function (d) {
    var F = QT.FX;
    if (!F || !F.fly || d.co) return;
    if (onCount < 6 && F.fly(d.amount, d.x, d.y, { small: true, quiet: onCount > 0 })) { onCount++; return; }
    offAuto += d.amount;
  });
  QT.G.on('monthEnd', function () {
    if (offAuto > 0 && QT.FX && QT.FX.flyAuto) QT.FX.flyAuto(offAuto);
    offAuto = 0; onCount = 0;
  });
  QT.G.on('rentCollect', function (d) {
    var F = QT.FX;
    if (!F || !F.fly || d.co) return;
    if (!F.fly(d.amount, d.x, d.y, { small: false })) F.flyAuto(d.amount);
  });
  function pill(H, x, y, s, bg, fg) {
    var c = H.ctx; c.save(); c.font = '900 10px ' + H.FONT;
    var w = c.measureText(H.plain ? H.plain(s) : s).width + 14; c.restore();
    H.fillRR(x - w / 2, y - 9, w, 18, 9, bg);
    H.txt(s, x, y, 10, fg, 'center', 900);
    return w;
  }
  function viewOf(p) { var d = QT.G.deals; return d && p && p.own ? d.viewOf(p.id) : null; }
  function isDeal(p) { var d = QT.G.deals, o = d && d.deal(); return !!(o && p && o.p === p.id && p.sale && !p.own); }
  function brokerOf(p) { var d = QT.G.deals; return d && d.brokerOf && p && !p.own ? d.brokerOf(p.id) : null; }
  function brokerPill(H, x, y, b) {
    var k = Math.abs(Math.sin(performance.now() / 220)) * 4;
    pill(H, x, y - k, t('ae_broker', { w: L.t('bw_' + b.who), s: Math.ceil(QT.G.deals.brokerLeft()) }), '#2bb8d8', '#ffffff');
  }
  function viewPill(H, x, y, v) {
    var b = Math.abs(Math.sin(performance.now() / 220)) * 4;
    pill(H, x, y - b, t('ae_view', { w: L.t('w_' + v.who), s: Math.ceil(QT.G.deals.viewLeft(v)) }), '#6f57e0', '#ffffff');
  }
  function dealPill(H, x, y, p) {
    var b = Math.abs(Math.sin(performance.now() / 200)) * 5;
    var w = pill(H, x, y - b, t('ae_deal', { p: '¥' + QT.G.fmt(p.sale.price), s: Math.ceil(QT.G.deals.dealLeft()) }), '#e2508a', '#ffffff');
    H.star(x + w / 2 + 6, y - b - 8, 6 + Math.sin(performance.now() / 120) * 2, '#ffd23f');
  }
  var SPOTS = null;
  function drawAreas(S, H) {
    var Es = QT.G.estate;
    if (!SPOTS) SPOTS = Es.areaSpots();
    var here = QT.World.roomAtPx(S.player.x, S.player.y), c = H.ctx;
    SPOTS.forEach(function (e) {
      if (e.dist !== here) return;
      var sc = H.toScreen(e.x * 16, e.y * 16, 2);
      if (sc.x < -60 || sc.x > H.cssW + 60 || sc.y < 0 || sc.y > H.cssH) return;
      var s = L.nm(e.area);
      c.save(); c.globalAlpha = 0.82;
      c.font = '900 13px ' + H.FONT;
      var w = c.measureText(s).width + 20;
      H.fillRR(sc.x - w / 2, sc.y - 12, w, 24, 12, 'rgba(31,95,191,0.78)');
      H.txt(s, sc.x, sc.y, 13, '#ffffff', 'center', 900);
      c.restore();
    });
  }
  on('labels', '*', function (S, H) {
    if (!S.props || !QT.G.estate) return;
    drawAreas(S, H);
    var Es = QT.G.estate, px = S.player.x / 16, py = S.player.y / 16, sites = Es.sites();
    for (var i = 0; i < sites.length; i++) {
      var st = sites[i], p = S.props[st.id];
      var cx = st.x + st.w / 2, cy = st.y + st.h / 2;
      if (Math.abs(cx - px) + Math.abs(cy - py) > NEAR * 1.6) continue;
      var sc = H.toScreen(cx * 16, cy * 16, H.H_PLOT + (st.tall ? 40 : 22));
      if (sc.x < -40 || sc.x > H.cssW + 40 || sc.y < 0 || sc.y > H.cssH) continue;
      if (st.condo) {
        var rs = Es.roomsOf(st).filter(Boolean), mine = rs.filter(function (q) { return q.own; }), sale = rs.filter(function (q) { return q.sale && !q.own; });
        var pend = mine.reduce(function (t0, q) { return t0 + (q.pend || 0); }, 0);
        var vq = mine.filter(function (q) { return viewOf(q); })[0];
        if (vq) { viewPill(H, sc.x, sc.y, viewOf(vq)); continue; }
        var dq = sale.filter(function (q) { return isDeal(q); })[0];
        if (dq) { dealPill(H, sc.x, sc.y, dq); continue; }
        var bq = sale.filter(function (q) { return brokerOf(q); })[0];
        if (bq) { brokerPill(H, sc.x, sc.y, brokerOf(bq)); continue; }
        if (pend > 0) { pill(H, sc.x, sc.y, t('ae_pend', { v: '+¥' + QT.G.fmt(Math.round(pend)) }), '#f5b21c', '#3a2a00'); continue; }
        var parts = [];
        if (mine.length) parts.push(t('ae_rooms', { n: mine.length }));
        if (sale.length) parts.push(t('ae_roomsSale', { n: sale.length, p: '¥' + QT.G.fmt(Math.min.apply(null, sale.map(function (q) { return q.sale.price; }))) }));
        if (parts.length) pill(H, sc.x, sc.y, parts.join('・'), mine.length ? '#2fbf7a' : '#fff3c4', mine.length ? '#ffffff' : '#8a5a00');
        continue;
      }
      if (!p || !(p.own || p.sale)) continue;
      if (p.own && viewOf(p)) { viewPill(H, sc.x, sc.y, viewOf(p)); continue; }
      if (isDeal(p)) { dealPill(H, sc.x, sc.y, p); continue; }
      if (brokerOf(p)) { brokerPill(H, sc.x, sc.y, brokerOf(p)); continue; }
      if (p.own && p.pend > 0) {
        var w0 = pill(H, sc.x, sc.y, t('ae_pend', { v: '+¥' + QT.G.fmt(Math.round(p.pend)) }), '#f5b21c', '#3a2a00');
        var bounce = Math.abs(Math.sin(performance.now() / 260 + i)) * 6;
        if (QT.FX && QT.FX.coinSprite) QT.FX.coinSprite(H.ctx, p.pend >= 1000000 ? 2 : 1, 0, sc.x - w0 / 2 - 9, sc.y - bounce, 0.9);
        continue;
      }
      if (p.own) {
        var cf = Es.cf(p);
        var s = p.building ? t('ae_build') : t('ae_mine', { c: (cf < 0 ? '-¥' : '+¥') + QT.G.fmt(Math.abs(Math.round(cf))) });
        pill(H, sc.x, sc.y, s, p.building ? '#f2a63b' : '#2fbf7a', '#ffffff');
      } else if (p.sale) {
        var y = Es.yields(p);
        var s2 = t('ae_sale', { p: '¥' + QT.G.fmt(p.sale.price) }) + (y.gross > 0 ? '・' + (y.gross * 100).toFixed(1) + '%' : '');
        pill(H, sc.x, sc.y, s2, p.sale.priv ? '#1f5fbf' : '#fff3c4', p.sale.priv ? '#ffffff' : '#8a5a00');
      }
    }
    QT.World.PLOTS.forEach(function (pl) {
      if (pl.kind !== 'agency' && pl.kind !== 'bank' && pl.kind !== 'taxoffice') return;
      var cx = pl.x + pl.w / 2, cy = pl.y + pl.h / 2;
      if (Math.abs(cx - px) + Math.abs(cy - py) > NEAR * 2) return;
      var sc = H.toScreen(cx * 16, cy * 16, H.H_PLOT + 30);
      if (sc.x < -40 || sc.x > H.cssW + 40 || sc.y < 0 || sc.y > H.cssH) return;
      pill(H, sc.x, sc.y, L.nm(pl, 'short'), pl.kind === 'agency' ? '#1f5fbf' : pl.kind === 'bank' ? '#ffffff' : '#6f57e0',
           pl.kind === 'bank' ? '#2f2c46' : '#ffffff');
    });
  });
  on('ui', '*', function (S, H) {
    var n = next();
    if (!n || !n.pad || H.riding) return;
    var wx = (n.pad.x + 0.5) * 16, wy = (n.pad.y + 0.5) * 16;
    if (QT.World.roomAtPx(wx, wy) !== QT.World.roomAtPx(S.player.x, S.player.y)) return;
    var s = H.toScreen(wx, wy, 0), c = H.ctx, k = Math.sin(performance.now() / 180) * 4;
    var band = H.uiBand(), m = 26;
    var inView = s.x > m && s.x < H.cssW - m && s.y > band.top + m && s.y < band.bottom - m;
    c.save();
    if (inView) {
      var y0 = s.y - 46 + k;
      c.fillStyle = '#f5b21c'; c.strokeStyle = '#2a1a40'; c.lineWidth = 2.5; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(s.x - 11, y0); c.lineTo(s.x + 11, y0); c.lineTo(s.x + 11, y0 + 10); c.lineTo(s.x + 18, y0 + 10);
      c.lineTo(s.x, y0 + 26); c.lineTo(s.x - 18, y0 + 10); c.lineTo(s.x - 11, y0 + 10); c.closePath();
      c.stroke(); c.fill();
    } else {
      var cx = H.cssW / 2, cy = (band.top + band.bottom) / 2, dx = s.x - cx, dy = s.y - cy;
      var sx = Math.abs(dx) > 1 ? (H.cssW / 2 - m) / Math.abs(dx) : Infinity, sy = Math.abs(dy) > 1 ? ((band.bottom - band.top) / 2 - m) / Math.abs(dy) : Infinity;
      var f = Math.min(sx, sy), ex = cx + dx * f, ey = cy + dy * f, a = Math.atan2(dy, dx);
      c.translate(ex, ey); c.rotate(a);
      c.fillStyle = '#f5b21c'; c.strokeStyle = '#2a1a40'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, 0, 15, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#2a1a40';
      c.beginPath(); c.moveTo(9, 0); c.lineTo(-4, -7); c.lineTo(-4, 7); c.closePath(); c.fill();
    }
    c.restore();
  });
})(window.QT || (window.QT = {}));
