(function (QT) {
  'use strict';
  var G = QT.G, L = QT.L, W = QT.World;
  function t(k, v) { return L.t(k, v); }
  L.add({
    dc_view: ['内見 {w}', 'Viewing: {w}'],
    dc_deal: ['掘り出し物 {p}', 'Bargain {p}'],
    dc_broker: ['仲介 手数料{v}', 'Broker fee {v}'],
    dc_inhNew:  ['実家を受け継いだ', 'You inherited the home'],
    dc_inhKan:  ['空き家: 勧告', 'Empty house: notice'],
    dc_inhCare: ['空き家の手入れ', 'Tidy the empty house'],
    dc_inhDl:   ['空き家の特例', 'Empty-house relief'],
    dc_months:  ['あと{n}か月', '{n} mo left']
  });
  function padOf(p) {
    var sid = p.site || p.id;
    return G.PADS().filter(function (pd) { return (pd.type === 'prop' || pd.type === 'jikka') && pd.p.id === sid; })[0] || null;
  }
  var after = null;
  var inhChipAt = {};
  function go(p) {
    var pad = padOf(p), H = QT.Render && QT.Render.H;
    if (!pad || !H) return true;
    var gx = (pad.x + 0.5) * W.TILE, gy = (pad.y + 0.5) * W.TILE, did = W.roomAtPx(gx, gy);
    if (did && did !== 'ave' && did !== H.tripHere()) { after = { x: gx, y: gy }; H.tripGo(did, 'next'); }
    else G.goTo(gx, gy);
    if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
    return true;
  }
  G.on('rideEnd', function () {
    if (!after) return;
    var a = after; after = null;
    setTimeout(function () { G.goTo(a.x, a.y); }, 300);
  });
  function person(c, x, y, col) {
    c.fillStyle = col;
    c.beginPath(); c.arc(x, y - 4, 3.6, 0, 7); c.fill();
    c.beginPath(); c.moveTo(x - 6, y + 7); c.quadraticCurveTo(x, y - 3, x + 6, y + 7); c.closePath(); c.fill();
  }
  function tag(c, x, y, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - 7, y - 5); c.lineTo(x + 3, y - 5); c.lineTo(x + 8, y); c.lineTo(x + 3, y + 5); c.lineTo(x - 7, y + 5); c.closePath(); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + 2.5, y, 1.6, 0, 7); c.fill();
  }
  function house(c, x, y, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - 7, y - 1); c.lineTo(x, y - 7); c.lineTo(x + 7, y - 1); c.closePath(); c.fill();
    c.fillRect(x - 5, y - 1, 10, 7);
    c.fillStyle = '#ffffff'; c.fillRect(x - 1.5, y + 2, 3, 4);
  }
  function draw(S, H, r, o) {
    var c = H.ctx, left = o.left(), k = Math.max(0, Math.min(1, left / o.total));
    var urgent = o.rt != null ? !!o.urgent : left < 10;
    var hot = urgent && Math.floor(S.t * 4) % 2 === 0;
    var pop = S.t - o.at < 0.6 ? 1 + 0.12 * Math.sin((S.t - o.at) / 0.6 * Math.PI) : 1;
    c.save();
    if (pop !== 1) { c.translate(r.x + r.w / 2, r.y + r.h / 2); c.scale(pop, pop); c.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); }
    H.glass(r.x, r.y, r.w, r.h, 10);
    c.save(); H.rr(r.x, r.y, r.w, r.h, 10); c.clip();
    c.fillStyle = o.col; c.fillRect(r.x, r.y, 4, r.h);
    if (hot) { c.fillStyle = 'rgba(226,80,74,0.14)'; c.fillRect(r.x, r.y, r.w, r.h); }
    c.fillStyle = urgent ? '#e2504a' : o.col;
    c.fillRect(r.x, r.y + r.h - 2.5, r.w * k, 2.5);
    c.restore();
    if (o.icon === 'view') person(c, r.x + 15, r.y + r.h / 2, o.col);
    else if (o.icon === 'home') house(c, r.x + 15, r.y + r.h / 2, o.col);
    else tag(c, r.x + 15, r.y + r.h / 2, o.col);
    var ts = o.rt != null ? o.rt : Math.ceil(left) + 's';
    c.font = '800 10.5px ' + H.FONT;
    var tw = ts ? c.measureText(ts).width : 0;
    H.fitTxt(o.text, r.x + 26, r.y + r.h / 2, 11.5, r.w - 26 - tw - 14, '#2f2c46', 800, 8.5);
    if (ts) H.txt(ts, r.x + r.w - 8, r.y + r.h / 2, 10.5, urgent ? '#e2504a' : o.col, 'right', 800);
    c.restore();
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () { return go(o.p); });
  }
  function add() {
    if (!QT.FX || !QT.FX.addChip) return;
    QT.FX.addChip(function (S) {
      var dl = G.deals;
      if (!dl || !S.deals || !S.deals.views.length) return null;
      var v = S.deals.views.slice().sort(function (a, b) { return a.until - b.until; })[0], p = S.props[v.p];
      if (!p || !p.own) return null;
      return { k: 'fx', id: 'view', w: 158, first: true, draw: function (S2, H, r) {
        draw(S2, H, r, { p: p, at: v.at, total: v.until - v.at, left: function () { return dl.viewLeft(v); },
                         col: '#6f57e0', icon: 'view', text: t('dc_view', { w: L.t('w_' + v.who) }) });
      } };
    });
    QT.FX.addChip(function (S) {
      var dl = G.deals, o = dl && dl.broker && dl.broker(), p = o && S.props[o.p];
      if (!p || !p.sale || p.own) return null;
      return { k: 'fx', id: 'broker', w: 168, first: true, draw: function (S2, H, r) {
        draw(S2, H, r, { p: p, at: o.at, total: o.until - o.at, left: function () { return dl.brokerLeft(); },
                         col: '#2bb8d8', icon: 'view', text: t('dc_broker', { v: '¥' + G.fmt(dl.brokerFee(p)) }) });
      } };
    });
    QT.FX.addChip(function (S) {
      var dl = G.deals, o = dl && dl.deal(), p = o && S.props[o.p];
      if (!p || !p.sale || p.own) return null;
      return { k: 'fx', id: 'deal', w: 176, first: true, draw: function (S2, H, r) {
        draw(S2, H, r, { p: p, at: o.at, total: o.until - o.at, left: function () { return dl.dealLeft(); },
                         col: '#e2508a', icon: 'deal', text: t('dc_deal', { p: '¥' + G.fmt(p.sale.price) }) });
      } };
    });
    QT.FX.addChip(function (S) {
      var ih = G.inherit, h = S.inh, p = ih && ih.home();
      if (!p || !h || p.inh.mode !== 'akiya') return null;
      var left = (h.deadline || 0) - S.fin.month, o = null;
      if (!h.seen) o = { text: t('dc_inhNew'), col: '#8a7fb8', rt: '' };
      else if (p.inh.kankoku) o = { text: t('dc_inhKan'), col: '#e2504a', rt: '', urgent: true };
      else if (p.inh.stage >= 1 && !p.inh.svc) o = { text: t('dc_inhCare'), col: '#f2a63b', rt: '' };
      else if (!p.sale && left >= 0 && left <= 12 && ih.specialOk(p, 0).ok) o = { text: t('dc_inhDl'), col: '#c98f0f', rt: t('dc_months', { n: left }), urgent: left <= 3, k: left / 12 };
      if (!o) return null;
      var at = inhChipAt[o.text] || (inhChipAt[o.text] = S.t);
      return { k: 'fx', id: 'inherit', w: 168, first: true, draw: function (S2, H, r) {
        draw(S2, H, r, { p: p, at: at, total: 1, left: function () { return o.k != null ? o.k : 1; }, col: o.col, icon: 'home', text: o.text, rt: o.rt, urgent: o.urgent });
      } };
    });
  }
  add();
  QT.DealChips = { go: go, padOf: padOf };
})(window.QT || (window.QT = {}));
