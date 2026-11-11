(function (QT) {
  'use strict';
  var on = QT.Art.scope('futako');
  var W = QT.World, I = QT.Iso, A = I.A, B = I.B, T = W.TILE, L = QT.L;
  var D = W.DIST.futako;
  function X(x, y) { return (x - y) * A; }
  function Y(x, y, h) { return (x + y) * B - (h || 0); }
  function sprite() { return QT.Art.tokyo.sprite.apply(null, arguments); }
  L.add({ futako_tower: ['タワマン 建設予定地', 'TOWER CONDO SITE'] });
  QT.Art.tokyo.deco.district('futako', {
    styles: {
      apt: { paint: 'apartment', want: [34, 58], min: 18, grow: true },
      shop: { paint: 'shops', want: [14, 22], min: 11, pal: { shops: ['#f2a7c3', '#8fd3c7', '#f7d36b', '#b9a7e8', '#f5a46b'] } },
      house: { paint: 'houses', want: [18, 20], min: 10, pal: { roofs: ['#c9563f', '#4f6fa8', '#6a8f4a', '#8a6a50', '#d98a3a'] } },
      park: { paint: 'riverbank', want: [24, 24], min: 2, cap: 1.5, lit: false },
      garden: { paint: 'park', want: [26, 26], min: 2 },
      plaza: { want: [24, 24], min: 2 }
    },
    pick: { s: ['house', 'shop', 'garden'], m: ['house', 'shop', 'apt'], l: ['apt', 'house', 'garden'] },
    low: ['plaza', 'garden']
  });
  QT.Art.tokyo.reserve('futako', { myhome_b: { label: 'futako_tower', crane: true } });
  var TREES = [], ITEMS = [], placedKey = '';
  function place() {
    var K = QT.Art.tokyo.keep, kd = K.data();
    if (placedKey === kd.key) return;
    placedKey = kd.key;
    TREES = [];
    for (var lx = 1.6; lx < D.iw - 1; lx += 2.4) {
      var x = (D.ix + lx) * T, y = (D.iy + 7.6) * T;
      if (!K.why(x - 5, y - 5, 10, 10, 24, { base: 3, m: 3 })) TREES.push({ x: x, y: y, v: TREES.length % 2 ? 3 : (TREES.length >> 1) % 3 });
    }
    ITEMS = TREES.map(function (tr) {
      var sx = X(tr.x, tr.y), sy = Y(tr.x, tr.y, 3);
      return { sx0: sx - 9, sx1: sx + 9, sy0: sy - 26, sy1: sy + 4,
               e: { x: tr.x - 3, y: tr.y - 3, w: 6, h: 6, draw: function () { QT.Art.tokyo.tree(curH.ctx, tr.x, tr.y, tr.v, 3); } } };
    });
    QT.Art.block('futako', TREES.map(function (tr) { return { x: tr.x - 4, y: tr.y - 4, w: 8, h: 8, top: 24 }; }), 'futako');
  }
  var curS = null, curH = null;
  on('scene', 'futako', function (r, S, H, push) {
    if (!H.G.roomOpen(r.id)) return;
    place();
    curS = S; curH = H;
    var cam = H.cam, hw = H.cssW / 2 / H.z, hh = H.cssH / 2 / H.z;
    for (var i = 0; i < ITEMS.length; i++) {
      var it = ITEMS[i];
      if (it.sx1 < cam.x - hw || it.sx0 > cam.x + hw || it.sy1 < cam.y - hh || it.sy0 > cam.y + hh) continue;
      push(it.e);
    }
  });
  var WP = W.WORLD_PX_W, RIVER = 7 * T, SEA = -9;
  var BR = { x: (D.ix + 22) * T, y0: WP - 2.2 * T, y1: WP + RIVER + 1.5 * T, w: 1.4 * T, deck: 3 };
  function bridgeDraw(g) {
    var x = BR.x, w = BR.w, k;
    g.translate(-X(x + w, BR.y1), -Y(x + w, BR.y1, 0));
    for (k = 1; k < 4; k++) {
      var py = BR.y0 + (BR.y1 - BR.y0) * k / 4;
      I.box(g, x + 3, py - 3, w - 6, 6, SEA, BR.deck - SEA, '#c9ced8', { left: '#9aa3b2', right: '#b4bcc8' });
    }
    I.box(g, x, BR.y0, w, BR.y1 - BR.y0, BR.deck, 2.5, '#9aa0a8', { left: '#6f7686', right: '#848b9a' });
    g.strokeStyle = '#5c6478'; g.lineWidth = 0.6; g.beginPath();
    [x + w * 0.35, x + w * 0.65].forEach(function (rx) { g.moveTo(X(rx, BR.y0), Y(rx, BR.y0, BR.deck + 2.6)); g.lineTo(X(rx, BR.y1), Y(rx, BR.y1, BR.deck + 2.6)); });
    g.stroke();
    g.strokeStyle = '#3f8a5a'; g.lineWidth = 0.8; g.beginPath();
    var n = 10, len = BR.y1 - BR.y0;
    for (k = 0; k < n; k++) {
      var ya = BR.y0 + len * k / n, yb = BR.y0 + len * (k + 1) / n;
      g.moveTo(X(x + w, ya), Y(x + w, ya, BR.deck + 2.5)); g.lineTo(X(x + w, (ya + yb) / 2), Y(x + w, (ya + yb) / 2, BR.deck + 9)); g.lineTo(X(x + w, yb), Y(x + w, yb, BR.deck + 2.5));
    }
    g.moveTo(X(x + w, BR.y0), Y(x + w, BR.y0, BR.deck + 9)); g.lineTo(X(x + w, BR.y1), Y(x + w, BR.y1, BR.deck + 9));
    g.stroke();
  }
  function bridgeBB() {
    var x = BR.x, w = BR.w;
    var x0 = X(x, BR.y1) - 4, x1 = X(x + w, BR.y0) + 4, y0 = Y(x, BR.y0, BR.deck + 14), y1 = Y(x + w, BR.y1, SEA) + 4;
    return [x0, y0, x1 - x0, y1 - y0];
  }
  var BBB = bridgeBB();
  function trainOn(c, S) {
    var ph = S.t % 12;
    if (ph > 4) return;
    var len = BR.y1 - BR.y0 + 60, head = BR.y0 - 30 + len * (ph / 4), x = BR.x + 3;
    for (var k = 0; k < 3; k++) {
      var y = head - k * 15;
      if (y < BR.y0 - 4 || y - 13 > BR.y1) continue;
      I.box(c, x, y - 13, BR.w - 6, 13, BR.deck + 2.6, 6, '#f2f4f7', { left: '#b9c1ce', right: '#d6dce6' });
      c.fillStyle = '#2fbf7a'; c.beginPath();
      c.moveTo(X(x + BR.w - 6, y - 13), Y(x + BR.w - 6, y - 13, BR.deck + 4.4)); c.lineTo(X(x + BR.w - 6, y), Y(x + BR.w - 6, y, BR.deck + 4.4));
      c.lineTo(X(x + BR.w - 6, y), Y(x + BR.w - 6, y, BR.deck + 5.6)); c.lineTo(X(x + BR.w - 6, y - 13), Y(x + BR.w - 6, y - 13, BR.deck + 5.6)); c.closePath(); c.fill();
    }
  }
  on('backdrop', 'futako', function (r, S, H) {
    var cam = H.cam, hw = H.cssW / 2 / H.z, hh = H.cssH / 2 / H.z;
    if (BBB[0] + BBB[2] < cam.x - hw || BBB[0] > cam.x + hw || BBB[1] + BBB[3] < cam.y - hh || BBB[1] > cam.y + hh) return;
    var c = H.ctx, fx = X(BR.x + BR.w, BR.y1), fy = Y(BR.x + BR.w, BR.y1, 0);
    sprite(c, 'ftk_bridge', BBB[0] - fx, BBB[1] - fy, BBB[2], BBB[3], bridgeDraw, fx, fy, 2);
    trainOn(c, S);
  });
  QT.Art.futako = { trees: function () { place(); return TREES; } };
})(window.QT || (window.QT = {}));
