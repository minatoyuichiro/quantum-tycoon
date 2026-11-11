(function (QT) {
  'use strict';
  var stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  var keys = {};
  var RADIUS = 44;
  var DEAD = 5;
  function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
  function tapTarget(sx, sy) {
    var G = QT.G, R = QT.Render, W = QT.World, S = G.S, TILE = 16;
    var g = R.toWorld(sx, sy);
    var pads = G.PADS(), i, pd;
    if (S.angel && Math.hypot(S.angel.x - g.x, S.angel.y - g.y) < 20) return g;
    for (i = 0; i < pads.length; i++) {
      pd = pads[i];
      if (!G.padActive(pd)) continue;
      if (Math.hypot((pd.x + 0.5) * TILE - g.x, (pd.y + 0.5) * TILE - g.y) < 12) return g;
    }
    var zz = R.H.toScreen(0, 0, 0).y - R.H.toScreen(0, 0, 1).y;
    var hit = null, hitDepth = -1, hitW = null;
    for (i = 0; i < W.PLOTS.length; i++) {
      var p = W.PLOTS[i];
      if (!G.roomOpen(p.room)) continue;
      var st = S.p[p.id];
      var top = (st && st.owned)
        ? (p.kind === 'store' || p.kind === 'cafe' || p.kind === 'office' ? 36 : 40) : 22;
      top += 8;
      for (var h = 0; h <= top; h += 2) {
        var w = R.toWorld(sx, sy + h * zz);
        if (w.x >= p.x * TILE && w.x < (p.x + p.w) * TILE && w.y >= p.y * TILE && w.y < (p.y + p.h) * TILE) {
          var depth = p.x + p.w + p.y + p.h;
          if (depth > hitDepth) { hitDepth = depth; hit = p; hitW = w; }
          break;
        }
      }
    }
    if (!hit) return g;
    var best = null, bd = 1e9;
    for (i = 0; i < pads.length; i++) {
      pd = pads[i];
      if (pd.p !== hit || !G.padActive(pd)) continue;
      var d = Math.hypot((pd.x + 0.5) * TILE - hitW.x, (pd.y + 0.5) * TILE - hitW.y);
      if (d < bd) { bd = d; best = pd; }
    }
    if (best) return { x: (best.x + 0.5) * TILE, y: (best.y + 0.5) * TILE };
    return { x: (hit.padX + 0.5) * TILE, y: (hit.padY + 0.5) * TILE };
  }
  function attach(canvas) {
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener('pointerdown', function (e) {
      var p = pos(e);
      QT.Sfx.resume();
      if (QT.Bgm) QT.Bgm.resume();
      var S = QT.G.S;
      if (S.showFinance) {
        var ft = QT.Render.finTabs;
        for (var k in ft) if (inRect(p.x, p.y, ft[k])) { S.finTab = k; return; }
        var rk = QT.Render.finBtns.ranking;
        if (rk && inRect(p.x, p.y, rk)) { if (QT.openRanking) QT.openRanking(); return; }
        var lo = QT.Render.finBtns.logout;
        if (lo && inRect(p.x, p.y, lo)) {
          if (window.confirm(QT.L.t('logoutConfirm'))) QT.logout();
          return;
        }
        S.showFinance = false; return;
      }
      if (S.offline) { S.offline = null; return; }
      if (S.gacha) { QT.Render.gachaTap(S); return; }
      var taps = QT.Art && QT.Art.reg && QT.Art.reg.tap && QT.Art.reg.tap['*'];
      if (taps) for (var ti = 0; ti < taps.length; ti++) {
        if (taps[ti].__scope && QT.Art.disabled[taps[ti].__scope]) continue;
        try { if (taps[ti](p, S, QT.Render.H) === true) return; } catch (err) { console.error('[art] tap', err); }
      }
      if (S.won) { if (QT.Render.ipoSkip(S, p)) { S.won = false; S.seenWin = true; } return; }
      var b = QT.Render.btnRects();
      if (inRect(p.x, p.y, b.mute)) {
        QT.Sfx.setMuted(!QT.Sfx.isMuted());
        if (QT.Bgm) QT.Bgm.setMuted(QT.Sfx.isMuted());
        S.muted = QT.Sfx.isMuted();
        return;
      }
      if (inRect(p.x, p.y, b.lang)) { QT.L.toggle(); return; }
      if (inRect(p.x, p.y, b.fin)) { S.showFinance = true; return; }
      if (QT.me && QT.me() && inRect(p.x, p.y, b.acct)) {
        if (window.confirm(QT.L.t('acctConfirm', { e: QT.me().email || '' }))) QT.logout();
        return;
      }
      if (inRect(p.x, p.y, b.share)) { QT.Share.open(QT.G.shareText(), 'game'); return; }
      if (stick.active) return;
      stick.active = true; stick.id = e.pointerId;
      stick.ox = p.x; stick.oy = p.y; stick.dx = 0; stick.dy = 0;
      stick.t0 = performance.now(); stick.sx = p.x; stick.sy = p.y; stick.moved = 0;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('pointermove', function (e) {
      if (!stick.active || e.pointerId !== stick.id) return;
      var p = pos(e);
      stick.moved = Math.max(stick.moved || 0, Math.hypot(p.x - stick.sx, p.y - stick.sy));
      var dx = p.x - stick.ox, dy = p.y - stick.oy;
      var len = Math.hypot(dx, dy);
      if (len < DEAD) { stick.dx = 0; stick.dy = 0; return; }
      var k = Math.min(1, len / RADIUS) / len;
      stick.dx = dx * k; stick.dy = dy * k;
      if (len > RADIUS * 1.6) {
        stick.ox = p.x - stick.dx * RADIUS;
        stick.oy = p.y - stick.dy * RADIUS;
      }
      e.preventDefault();
    }, { passive: false });
    function end(e) {
      if (!stick.active || (e.pointerId != null && e.pointerId !== stick.id)) return;
      if (e.type === 'pointerup' && (stick.moved || 0) < 10 && performance.now() - (stick.t0 || 0) < 350) {
        var p = pos(e), w = tapTarget(p.x, p.y);
        QT.G.goTo(w.x, w.y);
      }
      stick.active = false; stick.id = null; stick.dx = 0; stick.dy = 0;
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    window.addEventListener('keydown', function (e) {
      keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  }
  function dir() {
    var x = stick.dx, y = stick.dy;
    if (keys.arrowleft || keys.a) x -= 1;
    if (keys.arrowright || keys.d) x += 1;
    if (keys.arrowup || keys.w) y -= 1;
    if (keys.arrowdown || keys.s) y += 1;
    var m = Math.hypot(x, y);
    if (m < 0.02) return { x: 0, y: 0 };
    if (m > 1) { x /= m; y /= m; m = 1; }
    var w = QT.Iso.unproject(x, y);
    return { x: w.x * m, y: w.y * m };
  }
  QT.Input = { attach: attach, dir: dir, stick: stick, tapTarget: tapTarget };
})(window.QT || (window.QT = {}));
