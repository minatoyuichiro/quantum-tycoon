(function (QT) {
  'use strict';
  var on = QT.Art.scope('drama');
  var G = QT.G, L = QT.L;
  function now() { return performance.now() / 1000; }
  function fmt(v) { return G.fmt(v); }
  function snd(n, p, d) { if (QT.Sfx && QT.Sfx.play) QT.Sfx.play(n, p, d); }
  var fx = [];
  var parts = [];
  var rateFx = null;
  function posOf(p) { return G.estate ? G.estate.pos(p) : { x: G.S.player.x, y: G.S.player.y }; }
  function popMoney(h, i) {
    if (!h.v) return;
    var q = posOf(h.p);
    setTimeout(function () {
      G.toast({ x: q.x, y: q.y - 30 }, (h.v < 0 ? '-¥' : '+¥') + fmt(Math.abs(h.v)), h.v < 0 ? '#e2504a' : '#2fbf7a', { big: true });
    }, 250 + i * 220);
  }
  function burst(p, n, col, kind, spd) {
    var q = posOf(p);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, s = (spd || 40) * (0.4 + Math.random());
      parts.push({ x: q.x + (Math.random() - 0.5) * 30, y: q.y + (Math.random() - 0.5) * 30, h: 10 + Math.random() * 30,
                   vx: Math.cos(a) * s, vy: Math.sin(a) * s, vh: 20 + Math.random() * 60, life: 0, max: 1.2 + Math.random(), col: col, kind: kind });
    }
  }
  G.on('drama', function (d) {
    var k = d.kind, H = QT.Render && QT.Render.H;
    var e = { kind: k, t0: now(), dur: 2.5, hits: d.hits || [], extra: d.extra };
    if (k === 'quake') {
      e.dur = 3; snd('quake'); snd('alarm', 1, 0.5);
      if (QT.Render) QT.Render.shake(16, 2.4);
      e.hits.forEach(function (h) { burst(h.p, 26, '#b9a98f', 'dust', 50); });
    } else if (k === 'typhoon') {
      e.dur = 5; snd('whoosh'); snd('whoosh', 1, 1.4); snd('whoosh', 1, 2.8);
      if (QT.Render) QT.Render.shake(4, 3);
      e.hits.forEach(function (h) { burst(h.p, 12, '#9fc4e8', 'drop', 30); });
    } else if (k === 'fire') {
      e.dur = 7; snd('siren'); snd('alarm', 1, 1.9);
      if (QT.Render) QT.Render.shake(6, 0.8);
    } else if (k === 'water') {
      e.dur = 3.5; snd('alarm');
      e.hits.forEach(function (h) { burst(h.p, 30, '#4aa8e8', 'drop', 20); });
    } else if (k === 'redev' || k === 'renew' || k === 'chance') {
      e.dur = 2.6; snd(k === 'renew' ? 'cash' : 'fanfare');
      e.hits.forEach(function (h) { burst(h.p, k === 'renew' ? 14 : 22, '#f5b21c', 'spark', 45); });
      if (H && k !== 'renew') H.confetti(40, H.cssW / 2, H.cssH * 0.32, 4);
    } else if (k === 'close') {
      e.dur = 2.5; snd('bad');
      e.hits.forEach(function (h) { burst(h.p, 14, '#9a94ad', 'dust', 25); });
    } else {
      e.dur = 2.2; snd('alarm');
      if (QT.Render && (k === 'flee' || k === 'kodoku' || k === 'alarm')) QT.Render.shake(5, 0.5);
    }
    e.hits.forEach(popMoney);
    fx.push(e);
  });
  G.on('rateChange', function (d) {
    var up = d.to > d.from;
    rateFx = { dir: up ? 1 : -1, t0: now() };
    snd(up ? 'rumble' : 'good');
    if (up && QT.Render) QT.Render.shake(7, 0.7);
    if (up) (G.S.loans || []).filter(function (l) { return l.kind === 'var'; }).slice(0, 6).forEach(function (l, i) {
      var p = G.S.props[l.prop]; if (!p) return;
      var q = posOf(p);
      setTimeout(function () { G.toast({ x: q.x, y: q.y - 30 }, '金利 ↑', '#e2504a', { big: true }); }, 300 + i * 200);
    });
  });
  G.on('rateWatch', function (d) { rateFx = { dir: d.dir, t0: now(), watch: true }; snd('alarm', d.dir > 0 ? 1 : 1.3); });
  function stepParts(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt;
      if (p.life > p.max) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.h += p.vh * dt;
      p.vh -= (p.kind === 'drop' ? 160 : p.kind === 'spark' ? 40 : 60) * dt;
      if (p.h < 0) { p.h = 0; p.vh = 0; p.vx *= 0.5; p.vy *= 0.5; }
    }
  }
  var lastT = now();
  on('uiTop', '*', function (S, H) {
    var t = now(), dt = Math.min(0.05, t - lastT); lastT = t;
    stepParts(dt);
    var c = H.ctx, W = H.cssW, Ht = H.cssH;
    for (var i = fx.length - 1; i >= 0; i--) {
      var e = fx[i], k = (t - e.t0) / e.dur;
      if (k >= 1) { fx.splice(i, 1); continue; }
      if (e.kind === 'quake' || e.kind === 'fire' || e.kind === 'flee' || e.kind === 'alarm' || e.kind === 'termite' || e.kind === 'heat' || e.kind === 'water' || e.kind === 'kodoku') {
        var col = e.kind === 'kodoku' ? '106,80,150' : e.kind === 'water' ? '60,140,220' : e.kind === 'heat' ? '239,125,46' : '226,80,74';
        var blink = (Math.sin((t - e.t0) * (e.kind === 'quake' ? 18 : 12)) * 0.5 + 0.5) * (1 - k);
        var g = c.createRadialGradient(W / 2, Ht / 2, Math.min(W, Ht) * 0.35, W / 2, Ht / 2, Math.max(W, Ht) * 0.75);
        g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(1, 'rgba(' + col + ',' + (0.55 * blink).toFixed(3) + ')');
        c.fillStyle = g; c.fillRect(0, 0, W, Ht);
      }
      if (e.kind === 'typhoon') {
        var a = Math.min(1, k * 6, (1 - k) * 4);
        c.save();
        c.fillStyle = 'rgba(30,50,90,' + (0.22 * a).toFixed(3) + ')'; c.fillRect(0, 0, W, Ht);
        c.strokeStyle = 'rgba(210,230,255,' + (0.55 * a).toFixed(3) + ')'; c.lineWidth = 1.4;
        c.beginPath();
        for (var r = 0; r < 120; r++) {
          var sx = ((r * 97.3 + (t - e.t0) * 900) % (W + 200)) - 100, sy = ((r * 53.7 + (t - e.t0) * 1300 + r * 17) % (Ht + 100)) - 50;
          c.moveTo(sx, sy); c.lineTo(sx - 18, sy + 34);
        }
        c.stroke(); c.restore();
      }
      e.hits.forEach(function (h, j) {
        var q = posOf(h.p), s = H.toScreen(q.x, q.y, H.H_PLOT + 30);
        if (s.x < -60 || s.x > W + 60 || s.y < -60 || s.y > Ht + 60) return;
        var bob = Math.sin((t - e.t0) * 8 + j) * 3, fade = Math.min(1, (1 - k) * 4);
        c.save(); c.globalAlpha = fade;
        if (e.kind === 'fire') {
          for (var f = 0; f < 5; f++) {
            var fh = 26 + Math.sin(t * 14 + f * 1.7) * 9, fx0 = s.x - 20 + f * 10;
            c.fillStyle = f % 2 ? '#ffb02e' : '#ff5a2e';
            c.beginPath(); c.moveTo(fx0 - 7, s.y + 20); c.quadraticCurveTo(fx0 - 6, s.y + 20 - fh * 0.6, fx0, s.y + 20 - fh);
            c.quadraticCurveTo(fx0 + 6, s.y + 20 - fh * 0.6, fx0 + 7, s.y + 20); c.closePath(); c.fill();
          }
          c.fillStyle = 'rgba(80,80,90,0.35)';
          c.beginPath(); c.arc(s.x + Math.sin(t * 2) * 6, s.y - 40 - ((t - e.t0) * 20 % 30), 14, 0, 7); c.fill();
        } else if (e.kind === 'redev' || e.kind === 'renew' || e.kind === 'chance') {
          H.star(s.x, s.y - 10 + bob, 11 + Math.sin(t * 9) * 3, "#f5b21c");
        } else if (e.kind !== 'typhoon' && e.kind !== 'quake' && e.kind !== 'close') {
          var col2 = e.kind === 'kodoku' ? '#6f5a8a' : e.kind === 'water' ? '#2b7fd8' : '#e2504a';
          c.fillStyle = col2; c.strokeStyle = '#ffffff'; c.lineWidth = 3;
          c.beginPath(); c.arc(s.x, s.y - 6 + bob, 16, 0, 7); c.fill(); c.stroke();
          H.txt(e.kind === 'heat' ? '暑' : e.kind === 'water' ? '水' : '!', s.x, s.y - 6 + bob, 17, '#ffffff', 'center', 900);
        }
        c.restore();
      });
    }
    parts.forEach(function (p) {
      var s = H.toScreen(p.x, p.y, p.h), a = Math.max(0, 1 - p.life / p.max);
      c.globalAlpha = a; c.fillStyle = p.col;
      if (p.kind === "spark") H.star(s.x, s.y, 4 + 3 * a, p.col);
      else { c.beginPath(); c.arc(s.x, s.y, p.kind === 'drop' ? 2.4 : 4 + 4 * (1 - a), 0, 7); c.fill(); }
    });
    c.globalAlpha = 1;
    if (rateFx) {
      var re = t - rateFx.t0, dur = rateFx.watch ? 3 : 4;
      if (re > dur) rateFx = null;
      else {
        var x = 70, y = 128 + 8, col3 = rateFx.watch ? '#f2a63b' : rateFx.dir > 0 ? '#e2504a' : '#2fbf7a';
        var sc = re < 0.25 ? 0.4 + re * 3.2 : 1 + Math.sin(re * 10) * 0.08, al = Math.min(1, (dur - re) * 2);
        c.save(); c.globalAlpha = al; c.translate(x, y + (rateFx.dir > 0 ? -Math.abs(Math.sin(re * 7)) * 6 : Math.abs(Math.sin(re * 7)) * 6)); c.scale(sc, sc);
        c.fillStyle = col3; c.strokeStyle = '#2a1a40'; c.lineWidth = 3; c.lineJoin = 'round';
        c.beginPath();
        if (rateFx.watch) { c.arc(0, 0, 18, 0, 7); c.fill(); c.stroke(); H.txt('?', 0, 1, 22, '#ffffff', 'center', 900); }
        else {
          var d0 = rateFx.dir;
          c.moveTo(0, -22 * d0); c.lineTo(18, -2 * d0); c.lineTo(7, -2 * d0); c.lineTo(7, 20 * d0); c.lineTo(-7, 20 * d0); c.lineTo(-7, -2 * d0); c.lineTo(-18, -2 * d0); c.closePath();
          c.fill(); c.stroke();
        }
        c.restore();
      }
    }
  });
})(window.QT || (window.QT = {}));
