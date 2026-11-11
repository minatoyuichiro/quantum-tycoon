(function (QT) {
  'use strict';
  var stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  var keys = {};
  var RADIUS = 44;
  var DEAD = 5;
  var uiPress = null;
  function finPanel() {
    if (!(QT.UI && QT.UI.get)) return null;
    var f = QT.UI.get('finance');
    if (f && f.isOpen && f.isOpen()) return f;
    var o = QT.UI.open && QT.UI.open();
    return o ? QT.UI.get(o) : f;
  }
  function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
  function riding() {
    var tv = QT.Sim && QT.Sim.travel;
    try { return !!(tv && tv.riding && tv.riding()); } catch (e) { return false; }
  }
  function speedUp() {
    var tv = QT.Sim && QT.Sim.travel;
    if (!tv) return;
    try {
      if (typeof tv.hurry === 'function') tv.hurry();
      else if (typeof tv.speedUp === 'function') tv.speedUp();
      else if (tv.ride) tv.ride.fast = true;
    } catch (e) { console.error('[input] speedUp', e); }
    if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
  }
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
        ? (p.kind === 'store' || p.kind === 'office' ? 36 : 40) : 22;
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
  var deferTapRef = null;
  var THUMB = 2 / 3;
  function attach(canvas) {
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function capture(id) { try { if (canvas.setPointerCapture) canvas.setPointerCapture(id); } catch (err) { } }
    var pressing = null, deferred = null, TAP_SLOP = 12, TAP_MS = 1500;
    function deferTap(fn, toStick) {
      if (!pressing) return false;
      deferred = { id: pressing.id, x: pressing.x, y: pressing.y, t0: pressing.t0, fn: fn, moved: 0, toStick: !!toStick };
      return true;
    }
    deferTapRef = deferTap;
    function inThumb(p) {
      var h = canvas.getBoundingClientRect().height || window.innerHeight || 0;
      return h > 0 && p.y >= h * THUMB;
    }
    canvas.addEventListener('pointerdown', function (e) {
      var p0 = pos(e);
      deferred = null;
      pressing = { id: e.pointerId, x: p0.x, y: p0.y, t0: e.timeStamp || performance.now() };
      try { onDown(e); } finally { pressing = null; }
      if (deferred) { capture(e.pointerId); e.preventDefault(); }
    }, { passive: false });
    function onDown(e) {
      var p = pos(e);
      QT.Sfx.resume();
      if (QT.Bgm) QT.Bgm.resume();
      var S = QT.G.S;
      var fp0 = finPanel();
      if (S.showFinance && fp0 && fp0.wheel) { try { fp0.wheel(0); } catch (err) { } }
      var hs = QT.UI && QT.UI.hits ? QT.UI.hits(p) : [];
      if (hs.length) {
        uiPress = { id: e.pointerId, x: p.x, y: p.y, lx: p.x, ly: p.y };
        var sheetUp = !!(QT.UI.open && QT.UI.open()) || !!S.showFinance;
        deferTap(function () { QT.UI.run(hs, p, QT.G.S); }, !sheetUp && inThumb(p));
        capture(e.pointerId);
        e.preventDefault();
        return;
      }
      uiPress = null;
      if (S.showFinance) { S.showFinance = false; return; }
      if (S.offline) { S.offline = null; return; }
      if (S.gacha) { QT.Render.gachaTap(S); return; }
      var cardUp = !!(QT.Guide && QT.Guide.shown && QT.Guide.shown());
      var rideTap = riding() && !cardUp && !S.won;
      var taps = !rideTap && QT.Art && QT.Art.reg && QT.Art.reg.tap && QT.Art.reg.tap['*'];
      if (taps) for (var ti = 0; ti < taps.length; ti++) {
        if (taps[ti].__scope && QT.Art.disabled[taps[ti].__scope]) continue;
        try { if (taps[ti](p, S, QT.Render.H) === true) return; } catch (err) { console.error('[art] tap', err); }
      }
      if (S.won) { if (QT.Render.ipoSkip(S, p)) { S.won = false; S.seenWin = true; } return; }
      var b = QT.Render.btnRects();
      if (inRect(p.x, p.y, b.mute)) {
        deferTap(function () {
          QT.Sfx.setMuted(!QT.Sfx.isMuted());
          if (QT.Bgm) QT.Bgm.setMuted(QT.Sfx.isMuted());
          QT.G.S.muted = QT.Sfx.isMuted();
        }, true);
        return;
      }
      if (inRect(p.x, p.y, b.lang)) { deferTap(function () { QT.L.toggle(); }, true); return; }
      if (inRect(p.x, p.y, b.fin)) {
        deferTap(function () {
          var fp = finPanel();
          if (fp && fp.open) fp.open(); else QT.G.S.showFinance = true;
        }, true);
        return;
      }
      if (QT.me && QT.me() && inRect(p.x, p.y, b.acct)) {
        deferTap(function () {
          if (window.confirm(QT.L.t('acctConfirm', { e: QT.me().email || '' }))) QT.logout();
        }, true);
        return;
      }
      if (inRect(p.x, p.y, b.share)) { deferTap(function () { QT.Share.open(QT.G.shareText(), 'game'); }, true); return; }
      if (riding()) { speedUp(); e.preventDefault(); return; }
      if (stick.active) return;
      stick.active = true; stick.id = e.pointerId;
      stick.ox = p.x; stick.oy = p.y; stick.dx = 0; stick.dy = 0;
      stick.t0 = performance.now(); stick.sx = p.x; stick.sy = p.y; stick.moved = 0;
      capture(e.pointerId);
      e.preventDefault();
    }
    canvas.addEventListener('pointermove', function (e) {
      if (deferred && e.pointerId === deferred.id) {
        var q0 = pos(e);
        deferred.moved = Math.max(deferred.moved, Math.hypot(q0.x - deferred.x, q0.y - deferred.y));
        if (deferred.moved >= TAP_SLOP) {
          var d0 = deferred;
          deferred = null;
          if (d0.toStick && !stick.active && !riding()) {
            uiPress = null;
            stick.active = true; stick.id = e.pointerId;
            stick.ox = d0.x; stick.oy = d0.y; stick.dx = 0; stick.dy = 0;
            stick.t0 = d0.t0; stick.sx = d0.x; stick.sy = d0.y; stick.moved = d0.moved;
          } else if (!uiPress) {
            e.preventDefault();
            return;
          }
        } else if (!uiPress) return;
      }
      if (uiPress && e.pointerId === uiPress.id) {
        var fp = finPanel(), q = pos(e);
        if (fp && fp.drag && fp.isOpen && fp.isOpen()) {
          fp.drag(q.x - uiPress.lx, q.y - uiPress.ly, uiPress);
          e.preventDefault();
        }
        uiPress.lx = q.x; uiPress.ly = q.y;
        return;
      }
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
      if (deferred && (e.pointerId == null || e.pointerId === deferred.id)) {
        var d1 = deferred;
        deferred = null;
        if (e.type === 'pointerup' && d1.moved < TAP_SLOP && (e.timeStamp || performance.now()) - d1.t0 < TAP_MS) {
          try { d1.fn(); } catch (err) { console.error('[input] tap', err); }
        }
      }
      if (uiPress && (e.pointerId == null || e.pointerId === uiPress.id)) {
        var fp = finPanel();
        if (fp && fp.dragEnd) fp.dragEnd();
        if (e.type === 'pointerup' && QT.UI && QT.UI.swipe) {
          var q = pos(e);
          QT.UI.swipe(q.x - uiPress.x, q.y - uiPress.y, uiPress);
        }
        uiPress = null;
        return;
      }
      if (!stick.active || (e.pointerId != null && e.pointerId !== stick.id)) return;
      if (e.type === 'pointerup' && (stick.moved || 0) < 10 && performance.now() - (stick.t0 || 0) < 350 && !riding()) {
        var p = pos(e), w = tapTarget(p.x, p.y);
        QT.G.goTo(w.x, w.y);
      }
      stick.active = false; stick.id = null; stick.dx = 0; stick.dy = 0;
    }
    canvas.addEventListener('wheel', function (e) {
      var fp = finPanel();
      if (!fp || !fp.wheel || !(QT.G.S.showFinance || (fp.isOpen && fp.isOpen()))) return;
      if (fp.wheel(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)) e.preventDefault();
    }, { passive: false });
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
    if (riding()) return { x: 0, y: 0 };
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
  QT.Input = { attach: attach, dir: dir, stick: stick, tapTarget: tapTarget, riding: riding, speedUp: speedUp,
               deferTap: function (fn, toStick) { return deferTapRef ? deferTapRef(fn, toStick) : false; } };
})(window.QT || (window.QT = {}));
