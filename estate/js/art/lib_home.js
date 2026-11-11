(function (QT) {
  'use strict';
  var on = QT.Art.scope('home');
  var I = QT.Iso, TILE = 16, TAU = Math.PI * 2, INK = '#3a3550';
  function X(x, y) { return I.ex(x, y); }
  function Y(x, y, h) { return I.ey(x, y, h); }
  function hs() { return QT.Sim && QT.Sim.home; }
  QT.L.add({
    home_art_vacant:  ['入居者募集', 'FOR RENT'],
    home_art_sakura:  ['さくら荘', 'SAKURA-SO'],
    home_art_river:   ['リバーサイド多摩川', 'RIVERSIDE TAMAGAWA']
  });
  var SPR = {}, SPR_CAP = 3;
  function sprite(ctx, id, key, b, draw) {
    var ws = ctx.getTransform ? Math.abs(ctx.getTransform().a) : 2;
    var sc = Math.min(SPR_CAP, Math.max(2, Math.ceil(ws * 2) / 2));
    var s = SPR[id];
    if (!s || s.key !== key || s.sc !== sc) {
      var w = Math.max(1, Math.ceil((b[2] - b[0]) * sc)), h = Math.max(1, Math.ceil((b[3] - b[1]) * sc));
      var cv = s ? s.cv : document.createElement('canvas');
      cv.width = w; cv.height = h;
      var c = cv.getContext('2d');
      c.setTransform(sc, 0, 0, sc, -b[0] * sc, -b[1] * sc);
      c.lineJoin = 'round'; c.lineCap = 'round';
      draw(c);
      s = SPR[id] = { cv: cv, key: key, sc: sc, x: b[0], y: b[1], w: w / sc, h: h / sc };
    }
    ctx.drawImage(s.cv, s.x, s.y, s.w, s.h);
  }
  function bbox(x, y, w, d, hTop, m) {
    return [X(x, y + d) - m, Y(x, y, hTop) - m, X(x + w, y) + m, Y(x + w, y + d, 0) + m];
  }
  function seen(H, b) {
    var z = H.z, cam = H.cam, w2 = H.cssW / 2, h2 = H.cssH / 2;
    return (b[2] - cam.x) * z + w2 > -8 && (b[0] - cam.x) * z + w2 < H.cssW + 8 &&
           (b[3] - cam.y) * z + h2 > -8 && (b[1] - cam.y) * z + h2 < H.cssH + 8;
  }
  function quadL(c, yy, xa, xb, h0, h1) {
    c.beginPath(); c.moveTo(X(xa, yy), Y(xa, yy, h0)); c.lineTo(X(xb, yy), Y(xb, yy, h0));
    c.lineTo(X(xb, yy), Y(xb, yy, h1)); c.lineTo(X(xa, yy), Y(xa, yy, h1)); c.closePath();
  }
  function quadR(c, xx, ya, yb, h0, h1) {
    c.beginPath(); c.moveTo(X(xx, ya), Y(xx, ya, h0)); c.lineTo(X(xx, yb), Y(xx, yb, h0));
    c.lineTo(X(xx, yb), Y(xx, yb, h1)); c.lineTo(X(xx, ya), Y(xx, ya, h1)); c.closePath();
  }
  function fill(c, col) { c.fillStyle = col; c.fill(); }
  function line(c, x0, y0, h0, x1, y1, h1, col, lw) {
    c.beginPath(); c.moveTo(X(x0, y0), Y(x0, y0, h0)); c.lineTo(X(x1, y1), Y(x1, y1, h1));
    c.strokeStyle = col; c.lineWidth = lw || 0.8; c.stroke();
  }
  function blob(c, x, y, h, r, col) { c.beginPath(); c.arc(X(x, y), Y(x, y, h), r, 0, TAU); c.fillStyle = col; c.fill(); }
  function siteBox(id) {
    var h = hs(), r = h && h.siteRect ? h.siteRect(id) : null;
    if (!r) return null;
    return { x: r.x * TILE, y: r.y * TILE, w: r.w * TILE, d: r.h * TILE, room: r.room };
  }
  function nightK(H) { return Math.max(0, Math.min(1, +H.night || 0)); }
  function sakuraStatic(c, x, y, w, d, vacant, lang) {
    I.shadow(c, x, y, w, d, 0.18);
    I.box(c, x + 1, y + 1, w - 2, d - 2, 0, 1, '#d8cfbd', { left: '#b9ae98', right: '#c8bea8' });
    var bx = x + 8, by = y + 6, bw = w - 22, bd = d - 22, i;
    I.box(c, bx, by, bw, bd, 1, 15, '#efdcb8', { left: '#d8b47e', right: '#c79f66' });
    I.box(c, bx, by, bw, bd, 16, 15, '#efdcb8', { left: '#dcb985', right: '#cba56c' });
    c.strokeStyle = 'rgba(120,80,40,0.28)'; c.lineWidth = 0.5;
    for (i = 3; i < 30; i += 3) { if (i === 15 || i === 16) continue; line(c, bx, by + bd, 1 + i, bx + bw, by + bd, 1 + i, 'rgba(120,80,40,0.28)', 0.5); }
    I.box(c, bx - 1, by + bd, bw + 2, 4, 15, 1.4, '#a99d8a', { left: '#8d8270', right: '#9b907d' });
    for (i = 0; i <= bw; i += 4) line(c, bx + i, by + bd + 4, 16.4, bx + i, by + bd + 4, 22, '#6f6658', 0.6);
    line(c, bx - 1, by + bd + 4, 22, bx + bw + 1, by + bd + 4, 22, '#6f6658', 1);
    var doors = [4, 4 + (bw - 12) / 2, bw - 8];
    doors.forEach(function (u) {
      quadL(c, by + bd, bx + u, bx + u + 6, 1, 12); fill(c, '#8a5a3a');
      quadL(c, by + bd, bx + u, bx + u + 6, 17, 28); fill(c, '#8a5a3a');
      quadL(c, by + bd, bx + u + 7.5, bx + u + 11, 5, 10); fill(c, '#5a6a80');
      quadL(c, by + bd, bx + u + 7.5, bx + u + 11, 21, 26); fill(c, '#5a6a80');
    });
    [[6, 4], [bd - 14, 4]].forEach(function (q) {
      quadR(c, bx + bw, by + q[0], by + q[0] + 8, 5, 11); fill(c, '#5a6a80');
      quadR(c, bx + bw, by + q[0], by + q[0] + 8, 20, 26); fill(c, '#5a6a80');
    });
    I.box(c, bx - 2, by - 2, bw + 4, bd + 6, 31, 2.5, '#7c6f73', { left: '#5e5357', right: '#6c6064' });
    for (i = 2; i < bw + 4; i += 3) line(c, bx - 2 + i, by - 2, 33.5, bx - 2 + i, by + bd + 4, 33.5, 'rgba(255,255,255,0.18)', 0.5);
    var sx = bx + bw + 1.5;
    for (i = 0; i < 8; i++) I.box(c, sx, by + bd - 2 - i * 3, 5, 3, i * 2, 1.2, '#8f8a84', { left: '#6f6a64', right: '#7d7872' });
    line(c, sx + 5, by + bd + 1, 6, sx + 5, by + bd - 24, 22, '#5a5550', 0.8);
    line(c, bx + 2, by + bd + 4, 26, bx + 18, by + bd + 4, 26, '#9a9488', 0.6);
    ['#ff8fb1', '#8fd0ff', '#ffffff', '#ffd25a'].forEach(function (col, k) {
      quadL(c, by + bd + 4, bx + 3 + k * 4, bx + 6 + k * 4, 21.5, 26); fill(c, col);
    });
    var tx = x + 6, ty = y + d - 6;
    I.box(c, tx - 1, ty - 1, 2, 2, 0, 8, '#7a5236');
    [[0, 0, 5.2], [-3, 1, 3.6], [3, -1, 3.6], [0, -2, 3.4]].forEach(function (q) {
      c.beginPath(); c.arc(X(tx, ty) + q[0], Y(tx, ty, 11) + q[1], q[2], 0, TAU); c.fillStyle = '#ffb7cf'; c.fill();
    });
    c.beginPath(); c.arc(X(tx, ty) - 1, Y(tx, ty, 12) - 1, 1.6, 0, TAU); c.fillStyle = '#fff0f5'; c.fill();
    var px = X(bx + 2, by + bd), py = Y(bx + 2, by + bd, 34);
    c.fillStyle = '#fff8ea'; c.fillRect(px - 2, py - 7, 30, 7); c.strokeStyle = INK; c.lineWidth = 0.6; c.strokeRect(px - 2, py - 7, 30, 7);
    c.fillStyle = '#8a3a2a'; c.font = '900 5px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(QT.L.t('home_art_sakura'), px, py - 3.4);
    if (vacant) {
      var fx = x + w - 10, fy = y + d - 4;
      line(c, fx, fy, 0, fx, fy, 14, '#6f5a40', 1.1);
      var qx = X(fx, fy), qy = Y(fx, fy, 14);
      c.fillStyle = '#ffffff'; c.fillRect(qx - 13, qy - 9, 26, 10); c.strokeStyle = '#e2403a'; c.lineWidth = 1; c.strokeRect(qx - 13, qy - 9, 26, 10);
      c.fillStyle = '#e2403a'; c.font = '900 ' + (lang === 'ja' ? 5.4 : 5) + 'px sans-serif'; c.textAlign = 'center';
      c.fillText(QT.L.t('home_art_vacant'), qx, qy - 3.8);
    }
  }
  function sakuraLight(c, x, y, w, d, k) {
    var bx = x + 8, by = y + 6, bw = w - 22, bd = d - 22, u = 4 + (bw - 12) / 2;
    quadL(c, by + bd, bx + u + 7.5, bx + u + 11, 21, 26);
    c.fillStyle = 'rgba(255,214,110,' + (0.55 + 0.45 * k) + ')'; c.fill();
    if (k > 0.2) {
      c.globalAlpha = 0.25 * k; c.beginPath(); c.arc(X(bx + u + 9, by + bd), Y(bx + u + 9, by + bd, 23.5), 7, 0, TAU);
      c.fillStyle = '#ffd66e'; c.fill(); c.globalAlpha = 1;
    }
  }
  var RV_FLOORS = 4, RV_FH = 12;
  function riverStatic(c, x, y, w, d) {
    I.shadow(c, x, y, w, d, 0.2);
    I.box(c, x + 1, y + 1, w - 2, d - 2, 0, 1, '#d6d8dc', { left: '#b2b6bc', right: '#c4c8ce' });
    var bx = x + 7, by = y + 5, bw = w - 16, bd = d - 18, H0 = 1, i, f;
    var top = H0 + RV_FLOORS * RV_FH;
    I.box(c, bx, by, bw, bd, H0, RV_FLOORS * RV_FH, '#f2f1ec', { left: '#d9d6cc', right: '#c7c3b8' });
    for (f = 1; f <= RV_FLOORS; f++) {
      var h0 = H0 + (f - 1) * RV_FH;
      quadR(c, bx + bw, by + 3, by + bd - 3, h0 + 3, h0 + 10); fill(c, '#7fb6e0');
      line(c, bx + bw, by + bd / 2, h0 + 3, bx + bw, by + bd / 2, h0 + 10, '#e8f2fb', 0.6);
      if (f === 1) continue;
      I.box(c, bx + 2, by + bd, bw - 4, 4, h0, 1.2, '#c9c6bd', { left: '#aeaba2', right: '#bbb8af' });
      quadL(c, by + bd + 4, bx + 2, bx + bw - 2, h0 + 1.2, h0 + 6); c.fillStyle = 'rgba(170,215,240,0.55)'; c.fill();
      quadL(c, by + bd, bx + 5, bx + bw - 5, h0 + 2, h0 + 10); fill(c, '#6c8fae');
      for (i = 0; i < 3; i++) blob(c, bx + 6 + i * (bw - 12) / 2, by + bd + 2, h0 + 4.5, 2.2, ['#3f9a52', '#52b060', '#2f8a45'][(i + f) % 3]);
    }
    quadL(c, by + bd, bx + bw / 2 - 6, bx + bw / 2 + 6, H0, H0 + 9); fill(c, '#9fd0ee');
    line(c, bx + bw / 2, by + bd, H0, bx + bw / 2, by + bd, H0 + 9, '#ffffff', 0.6);
    I.box(c, bx + bw / 2 - 8, by + bd, 16, 5, H0 + 10, 1.2, '#8a7a6a');
    I.box(c, bx, by, bw, bd, top, 1.5, '#e6e4dc', { left: '#cfccc2', right: '#bfbcb2' });
    I.box(c, bx + bw - 14, by + 4, 9, 8, top + 1.5, 7, '#9aa6b2', { left: '#7c8894', right: '#8a96a2' });
    for (i = 0; i < 4; i++) blob(c, x + 4 + i * 4, y + d - 4, 3, 3, i % 2 ? '#4aa35a' : '#5fbb6a');
    var px = X(bx + 3, by + bd), py = Y(bx + 3, by + bd, top + 8);
    c.fillStyle = '#2f3a4a'; c.fillRect(px - 2, py - 6, 46, 7);
    c.fillStyle = '#ffffff'; c.font = '900 4.6px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(QT.L.t('home_art_river'), px, py - 2.4);
  }
  function riverLight(c, x, y, w, d, k) {
    var bx = x + 7, by = y + 5, bw = w - 16, bd = d - 18, h0 = 1 + 2 * RV_FH;
    quadL(c, by + bd, bx + 5, bx + bw - 5, h0 + 2, h0 + 10);
    c.fillStyle = 'rgba(255,214,110,' + (0.5 + 0.5 * k) + ')'; c.fill();
    if (k > 0.3) {
      [[0, 1], [1, 3]].forEach(function (q) {
        var hh = 1 + q[1] * RV_FH - RV_FH;
        quadR(c, bx + bw, by + 3 + q[0] * (bd / 2), by + bd / 2 - 3 + q[0] * (bd / 2), hh + 3, hh + 10);
        c.fillStyle = 'rgba(255,220,130,' + 0.6 * k + ')'; c.fill();
      });
    }
  }
  function gardenStatic(c, g, yd) {
    var i, j;
    if (g) {
      I.box(c, g.x + 1, g.y + 1, g.w - 2, g.d - 2, 0, 1.5, '#8a6a48', { left: '#6f5236', right: '#7d5e40' });
      for (i = 0; i < 4; i++) {
        var ry = g.y + 6 + i * (g.d - 12) / 3;
        I.box(c, g.x + 4, ry - 2, g.w - 8, 4, 1.5, 1.5, '#a07a52', { left: '#80603e', right: '#8e6c48' });
        for (j = 0; j < 3; j++) blob(c, g.x + 7 + j * (g.w - 14) / 2, ry, 4.5, 1.9, ['#3f9a52', '#6cc04a', '#2f8a45'][(i + j) % 3]);
        if (i === 1) blob(c, g.x + g.w / 2, ry, 6.5, 1.1, '#e2403a');
      }
      var sx = g.x + g.w - 5, sy = g.y + 4;
      line(c, sx, sy, 0, sx, sy, 14, '#6f5a40', 1);
      line(c, sx - 4, sy + 4, 10, sx + 4, sy - 4, 10, '#6f5a40', 1);
      blob(c, sx, sy, 15.5, 2.4, '#f2d6a8');
      c.beginPath(); c.ellipse(X(sx, sy), Y(sx, sy, 17.5), 4, 1.4, 0, 0, TAU); c.fillStyle = '#e8c06a'; c.fill();
    }
    if (yd) {
      I.box(c, yd.x + 1, yd.y + 2, yd.w - 2, yd.d - 6, 0, 6, '#3f8a46', { left: '#2f6f36', right: '#367c3e' });
      for (i = 0; i < yd.w; i += 7) blob(c, yd.x + 4 + i, yd.y + yd.d / 2 - 1, 6.5, 2.4, '#4fa055');
    }
  }
  function truck(c, px, py, k) {
    I.box(c, px - 10, py - 4, 13, 9, 1.5, 9, '#ffffff', { left: '#d8dce4', right: '#c4c8d2' });
    I.box(c, px + 3, py - 4, 6, 9, 1.5, 6, '#2bb8d8', { left: '#1f8aa8', right: '#2599b8' });
    quadL(c, py + 5, px - 8, px + 1, 4, 8); c.fillStyle = '#e2508a'; c.fill();
    [[-7, 5], [6, 5]].forEach(function (q) { blob(c, px + q[0], py + q[1], 1.5, 1.6, '#2f2c46'); });
  }
  function drawCat(c, px, py, walk, moving, dir, alpha, t) {
    var sx = X(px, py), sy = Y(px, py, 0), f = dir < 0 ? -1 : 1;
    c.save(); c.globalAlpha = alpha; c.translate(sx, sy); c.scale(f, 1);
    c.fillStyle = 'rgba(40,30,60,0.18)'; c.beginPath(); c.ellipse(0, 0.5, 5, 1.6, 0, 0, TAU); c.fill();
    var ph = Math.floor(walk) % 4;
    if (moving) {
      var lg = [[-3, 1.5], [3, -1.5], [-3, -1.5], [3, 1.5]][ph];
      c.strokeStyle = '#f7f2ea'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-2.5, -3); c.lineTo(-2.5 + lg[1] * 0.4, 0); c.moveTo(2.5, -3); c.lineTo(2.5 + lg[0] * 0.3, 0); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, -4.2, 4.6, 2.4, 0, 0, TAU); c.fill();
      c.fillStyle = '#e8902e'; c.beginPath(); c.ellipse(-1.6, -5, 1.8, 1.3, 0, 0, TAU); c.fill();
      c.fillStyle = '#2f2c46'; c.beginPath(); c.ellipse(1.8, -4.6, 1.3, 1, 0, 0, TAU); c.fill();
      c.strokeStyle = '#e8902e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4.4, -4.6); c.quadraticCurveTo(-7, -8 + Math.sin(t * 6), -6, -9); c.stroke();
      c.translate(4.4, -6);
    } else {
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, -3.5, 3, 3.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#e8902e'; c.beginPath(); c.ellipse(-1.2, -4.5, 1.6, 1.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#2f2c46'; c.beginPath(); c.ellipse(1.4, -2.6, 1.1, 1.2, 0, 0, TAU); c.fill();
      c.strokeStyle = '#e8902e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-2.5, -0.6); c.quadraticCurveTo(0, 1.4, 3.2, -0.2); c.stroke();
      c.translate(0.6, -7.4);
    }
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 2.5, 0, TAU); c.fill();
    c.fillStyle = '#e8902e'; c.beginPath(); c.moveTo(-2.4, -1); c.lineTo(-1.8, -3.6); c.lineTo(-0.4, -1.8); c.closePath(); c.fill();
    c.fillStyle = '#2f2c46'; c.beginPath(); c.moveTo(2.4, -1); c.lineTo(1.8, -3.6); c.lineTo(0.4, -1.8); c.closePath(); c.fill();
    c.fillStyle = '#2f2c46'; c.fillRect(0.6, -0.4, 0.7, 0.9); c.fillRect(-1.2, -0.4, 0.7, 0.9);
    c.restore();
  }
  function drawCatSleep(c, px, py, dir, alpha, t) {
    var sx = X(px, py), sy = Y(px, py, 0), f = dir < 0 ? -1 : 1, br = 1 + 0.06 * Math.sin(t * 2.2);
    c.save(); c.globalAlpha = alpha; c.translate(sx, sy); c.scale(f, 1);
    c.fillStyle = 'rgba(40,30,60,0.18)'; c.beginPath(); c.ellipse(0, 0.4, 5.4, 1.6, 0, 0, TAU); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, -2.4, 5 * br, 2.8 * br, 0, 0, TAU); c.fill();
    c.fillStyle = '#e8902e'; c.beginPath(); c.ellipse(-1.8, -3.2, 2, 1.4, 0, 0, TAU); c.fill();
    c.fillStyle = '#2f2c46'; c.beginPath(); c.ellipse(1.6, -3, 1.4, 1.1, 0, 0, TAU); c.fill();
    c.strokeStyle = '#e8902e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4.6, -1.6); c.quadraticCurveTo(-2, 1.2, 3.6, -0.4); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(3.8, -3.4, 2.2, 0, TAU); c.fill();
    c.fillStyle = '#e8902e'; c.beginPath(); c.moveTo(2.4, -4.6); c.lineTo(2.8, -6.6); c.lineTo(3.9, -5.2); c.closePath(); c.fill();
    c.strokeStyle = '#2f2c46'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(3.6, -3.4); c.lineTo(4.6, -3.2); c.stroke();
    c.restore();
  }
  var CAT_OBS = {}, CAT_NEAR = 40;
  QT.L.add({ home_catObs: ['観測!', 'Observed!'] });
  function drawCatHome(c, px, py, t, seed) {
    var S2 = curS || QT.G.S, o = CAT_OBS[seed] || (CAT_OBS[seed] = { on: false, pose: 0, at: -99 });
    var pl = S2 && S2.player, near = !!pl && Math.abs(pl.x - px) + Math.abs(pl.y - py) < CAT_NEAR;
    if (near && !o.on) { o.on = true; o.at = t; o.pose = ((Math.floor(t * 7.3) + seed) % 2); }
    else if (!near && o.on && t - o.at > 1.5) o.on = false;
    if (t < o.at) o.at = t;
    var dir = seed % 2 ? 1 : -1, col = 0;
    if (o.on) {
      var e = t - o.at, pop = e < 0.25 ? 1 + 0.25 * Math.sin(e / 0.25 * Math.PI) : 1;
      c.save(); c.translate(X(px, py), Y(px, py, 0)); c.scale(pop, pop); c.translate(-X(px, py), -Y(px, py, 0));
      if (o.pose) drawCatSleep(c, px, py, dir, 1, t); else drawCat(c, px, py, 0, false, dir, 1, t);
      c.restore();
      col = o.pose ? -6.2 + 3.4 : -6.2;
      if (e < 1.2) {
        var sx = X(px, py), sy = Y(px, py, 14) - e * 6, k = Math.min(1, (1.2 - e) / 0.4);
        c.save(); c.globalAlpha = k;
        c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); c.arc(X(px, py), Y(px, py, 4), 3 + e * 14, 0, TAU); c.stroke();
        c.font = '900 5.6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
        c.lineWidth = 1.6; c.strokeStyle = '#ffffff'; c.strokeText(QT.L.t('home_catObs'), sx, sy);
        c.fillStyle = '#6f57e0'; c.fillText(QT.L.t('home_catObs'), sx, sy);
        c.restore();
      }
    } else {
      var w1 = 0.5 + 0.5 * Math.sin(t * 2.1 + seed), a1 = 0.18 + 0.42 * w1, a2 = 0.18 + 0.42 * (1 - w1);
      drawCat(c, px - 3, py + 3, 0, false, dir, a1, t);
      drawCatSleep(c, px + 3, py - 3, dir, a2, t);
      col = -6.2;
    }
    if (o.on && !o.pose) {
      c.save(); c.fillStyle = '#e2403a';
      c.fillRect(X(px, py) - 1.6 + (seed % 2 ? 0.6 : -0.6), Y(px, py, 0) + col, 3.2, 0.9); c.restore();
    }
  }
  function curTier() { var h = hs(); return h ? h.tier() : 0; }
  var curS = null, curH = null;
  function drawShitaSite(b, S2, H2) {
    var c = H2.ctx, t = curTier(), lang = QT.L.get(), rebuilt = t >= 2 || !!(S2.home && S2.home.seen && S2.home.seen.t2);
    var bb = bbox(b.x, b.y, b.w, b.d, rebuilt ? 66 : 48, 6);
    if (!seen(H2, bb)) return;
    var k = nightK(H2), home = S2.home && S2.home.site === 'myhome_s';
    if (rebuilt) {
      sprite(c, 'home_river', 'v1', bb, function (g) { riverStatic(g, b.x, b.y, b.w, b.d); });
      if (home) riverLight(c, b.x, b.y, b.w, b.d, k);
    } else {
      var vac = !home;
      sprite(c, 'home_sakura', 'v1' + (vac ? 'v' : 'o') + lang, bb, function (g) { sakuraStatic(g, b.x, b.y, b.w, b.d, vac, lang); });
      if (home) sakuraLight(c, b.x, b.y, b.w, b.d, k);
    }
    var LT = QT.Art.lit;
    if (home && k > 0.05 && LT && LT.k() > 0) {
      LT.fn(function (g) { if (rebuilt) riverLight(g, b.x, b.y, b.w, b.d, 1); else sakuraLight(g, b.x, b.y, b.w, b.d, 1); }, 1, [b.x, b.y, b.w, b.d]);
    }
    if (home && S2.home.cat && S2.home.cat.at != null) drawCatHome(c, b.x + 10, b.y + b.d - 3, S2.t, 1);
  }
  on('plot', 'myhome_s', function (p, S, H) { drawShitaSite({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, d: p.h * TILE }, S, H); return true; });
  function sceneFutako(d, S, H, push) {
    curS = S; curH = H;
    var b = siteBox('myhome_s');
    if (b && !QT.World.BY_ID.myhome_s) push({ x: b.x, y: b.y, w: b.w, h: b.d, draw: function () { drawShitaSite(b, curS, curH); } });
    var g = siteBox('home_garden'), yd = siteBox('home_yard');
    [[g, null], [null, yd]].forEach(function (pr) {
      var r = pr[0] || pr[1];
      if (!r) return;
      push({ x: r.x, y: r.y, w: r.w, h: r.d, draw: function () {
        var c = curH.ctx, bb = bbox(r.x, r.y, r.w, r.d, 20, 4);
        if (!seen(curH, bb)) return;
        sprite(c, pr[0] ? 'home_garden' : 'home_yard', 'v1', bb, function (q) { gardenStatic(q, pr[0], pr[1]); });
      } });
    });
    var hp = QT.World.BY_ID.home;
    if (hp && S.home && S.home.tier === 0 && S.home.cat && S.home.cat.at != null) {
      var cx = (hp.x + 0.6) * TILE, cy = (hp.y + hp.h - 0.3) * TILE;
      push({ x: cx - 4, y: cy - 4, w: 8, h: 8, draw: function () { drawCatHome(curH.ctx, cx, cy, curS.t, 1); } });
    }
    pushTruck(S, H, push, 'myhome_s');
    pushTruck(S, H, push, 'home');
  }
  function sceneHongo(d, S, H, push) {
    curS = S; curH = H;
    pushCatNpc(S, H, push);
  }
  function sceneShibuya(d, S, H, push) {
    curS = S; curH = H;
    var op = QT.World.BY_ID.office;
    if (!op || !S.home || !S.home.cat || S.home.cat.at == null) return;
    var cx = (op.x + op.w + 0.35) * TILE, cy = (op.y + op.h - 0.6) * TILE;
    push({ x: cx - 4, y: cy - 4, w: 8, h: 8, draw: function () { drawCatHome(curH.ctx, cx, cy, curS.t, 2); } });
  }
  function pushTruck(S, H, push, site) {
    var tr = S.home && S.home.truck;
    if (!tr || tr.site !== site || S.t - tr.at > 2.4 || S.t < tr.at) return;
    var r = hs() && hs().siteRect(site);
    if (!r) return;
    var k = Math.min(1, (S.t - tr.at) / 1.4), x1 = (r.x + r.w / 2) * TILE, y1 = (r.y + r.h + 1.5) * TILE;
    var px = x1 - (1 - k * (2 - k)) * 6 * TILE, py = y1;
    push({ x: px - 10, y: py - 4, w: 20, h: 9, draw: function () { truck(curH.ctx, px, py, k); } });
  }
  function pushCatNpc(S, H, push) {
    var list = S.npcs;
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (!o || o.kind !== 'cat' || !isFinite(o.x)) continue;
      (function (n) {
        push({ x: n.x - 4, y: n.y - 4, w: 8, h: 8, draw: function () {
          var c = curH.ctx;
          drawCat(c, n.x, n.y, n.walk || 0, !!n.moving, n.dir || 1, 1, curS.t);
          var dd = Math.hypot(curS.player.x - n.x, curS.player.y - n.y), h = hs(), R0 = (h && h.catR) || 22;
          if (dd < 48) {
            var sx = X(n.x, n.y), sy = Y(n.x, n.y, 16);
            if (dd < R0) {
              var tx = QT.L.t('home_catAsk');
              c.font = '900 5.5px sans-serif'; var tw = c.measureText(tx).width + 8;
              c.fillStyle = '#ffffff'; c.fillRect(sx - tw / 2, sy - 9, tw, 9); c.strokeStyle = INK; c.lineWidth = 0.6; c.strokeRect(sx - tw / 2, sy - 9, tw, 9);
              c.fillStyle = '#e2508a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tx, sx, sy - 4.4);
              var k = Math.min(1, (n.meet || 0) / ((h && h.catHold) || 1));
              c.beginPath(); c.arc(sx, sy + 3.5, 2.6, -Math.PI / 2, -Math.PI / 2 + TAU * k); c.strokeStyle = '#f5b21c'; c.lineWidth = 1.2; c.stroke();
            } else {
              c.fillStyle = '#ffffff'; c.beginPath(); c.arc(sx, sy, 4.6, 0, TAU); c.fill();
              c.strokeStyle = INK; c.lineWidth = 0.7; c.stroke();
              c.fillStyle = '#e2508a'; c.font = '900 6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', sx, sy + 0.3);
            }
          }
        } });
      })(o);
    }
  }
  on('scene', 'futako', sceneFutako);
  on('scene', 'hongo', sceneHongo);
  on('scene', 'shibuya', sceneShibuya);
  on('npc', 'cat', function () { return true; });
  var ROOM = {};
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function roomStatic(c, tier, w, h) {
    var i, fl = h * 0.7;
    c.save(); rr(c, 0, 0, w, h, 12); c.clip();
    var wall = ['#dbeeff', '#f6ead6', '#f4f1ea'][tier] || '#f4f1ea';
    c.fillStyle = wall; c.fillRect(0, 0, w, fl);
    c.fillStyle = ['#c79a64', '#cdb780', '#b98a5a'][tier] || '#b98a5a'; c.fillRect(0, fl, w, h - fl);
    c.strokeStyle = 'rgba(80,50,20,0.18)'; c.lineWidth = 1;
    for (i = 0; i < w; i += (tier === 1 ? 30 : 18)) { c.beginPath(); c.moveTo(i, fl); c.lineTo(i - 14, h); c.stroke(); }
    if (tier === 1) { c.beginPath(); c.moveTo(0, fl + (h - fl) / 2); c.lineTo(w, fl + (h - fl) / 2); c.stroke(); }
    var wx = w * 0.56, wy = h * 0.1, ww = w * 0.36, wh = h * 0.42;
    c.fillStyle = ['#bfe6ff', '#ffd9a8', '#9fd6ff'][tier] || '#9fd6ff'; c.fillRect(wx, wy, ww, wh);
    if (tier === 0) {
      for (i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#5fae5a' : '#4a9a4a'; c.beginPath(); c.arc(wx + 8 + i * ww / 5, wy + wh - 6, 10, 0, TAU); c.fill(); }
    } else if (tier === 1) {
      c.fillStyle = '#9ab0d8'; c.fillRect(wx + ww * 0.62, wy + 6, 4, wh - 6);
      c.fillRect(wx + ww * 0.62 - 3, wy + wh * 0.35, 10, 3);
      c.fillStyle = '#c9a28a'; for (i = 0; i < 6; i++) c.fillRect(wx + i * ww / 6, wy + wh - 10 - (i % 3) * 4, ww / 6 - 2, 10 + (i % 3) * 4);
    } else {
      c.fillStyle = '#4a8ac8'; c.fillRect(wx, wy + wh * 0.62, ww, wh * 0.38);
      c.strokeStyle = '#e2403a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(wx, wy + wh * 0.6); c.quadraticCurveTo(wx + ww / 2, wy + wh * 0.38, wx + ww, wy + wh * 0.6); c.stroke();
      c.fillStyle = '#e8e2d6'; for (i = 0; i < 4; i++) c.fillRect(wx + 4 + i * ww / 4, wy + 8 + (i % 2) * 5, ww / 5, wh * 0.4);
    }
    c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(wx, wy, ww, wh);
    c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.stroke();
    if (tier === 0) {
      c.fillStyle = '#a8784a'; c.fillRect(w * 0.06, fl - 30, 70, 8); c.fillRect(w * 0.06 + 4, fl - 22, 6, 22); c.fillRect(w * 0.06 + 60, fl - 22, 6, 22);
      c.fillStyle = '#e6e2d6'; c.fillRect(w * 0.06 + 18, fl - 52, 30, 22); c.fillStyle = '#3a6a8a'; c.fillRect(w * 0.06 + 21, fl - 49, 24, 15);
      c.fillStyle = '#ffffff'; c.fillRect(w * 0.06 + 8, h * 0.08, 26, 34);
      c.fillStyle = '#e2403a'; c.beginPath(); c.moveTo(w * 0.06 + 21, h * 0.08 + 6); c.lineTo(w * 0.06 + 26, h * 0.08 + 24); c.lineTo(w * 0.06 + 16, h * 0.08 + 24); c.closePath(); c.fill();
      c.fillStyle = '#6f8fc8'; c.fillRect(w * 0.3, fl - 50, 70, 8); c.fillRect(w * 0.3, fl - 16, 70, 8);
      c.fillStyle = '#8a5a3a'; c.fillRect(w * 0.3 - 4, fl - 60, 5, 60); c.fillRect(w * 0.3 + 69, fl - 60, 5, 60);
    } else if (tier === 1) {
      c.fillStyle = '#ffffff'; rr(c, w * 0.05, fl + 6, 80, 22, 6); c.fill();
      c.fillStyle = '#7fb0e0'; rr(c, w * 0.05 + 22, fl + 8, 56, 18, 5); c.fill();
      c.fillStyle = '#c0503a'; c.fillRect(w * 0.36, fl - 4, 76, 18);
      c.fillStyle = '#8a5a3a'; c.fillRect(w * 0.36 - 3, fl - 8, 82, 5);
      c.fillStyle = '#d6d8de'; c.fillRect(w * 0.36 + 26, fl - 20, 26, 12); c.fillStyle = '#4a8ac8'; c.fillRect(w * 0.36 + 28, fl - 18, 22, 8);
      c.fillStyle = '#e8e8ee'; c.fillRect(w * 0.06, fl - 46, 56, 46); c.fillStyle = '#9aa0aa'; c.fillRect(w * 0.06 + 6, fl - 40, 20, 4);
      c.fillStyle = '#5a6a80'; c.beginPath(); c.arc(w * 0.06 + 40, fl - 38, 5, 0, TAU); c.fill();
    } else {
      c.fillStyle = '#6f57e0'; rr(c, w * 0.05, fl - 22, 110, 30, 10); c.fill();
      c.fillStyle = '#8a74f0'; rr(c, w * 0.05 + 6, fl - 34, 98, 16, 8); c.fill();
      c.fillStyle = '#2f2c46'; c.fillRect(w * 0.36, fl - 60, 64, 38); c.fillStyle = '#4ab8e8'; c.fillRect(w * 0.36 + 3, fl - 57, 58, 32);
      c.fillStyle = '#8a5a3a'; c.fillRect(w * 0.36 - 6, fl - 20, 76, 8);
      c.fillStyle = '#b86a3a'; c.fillRect(w * 0.94 - 14, fl - 16, 14, 16);
      for (i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#3f9a52' : '#5fbb6a'; c.beginPath(); c.ellipse(w * 0.94 - 7 + (i - 2) * 4, fl - 26 - (i % 3) * 6, 5, 9, (i - 2) * 0.4, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  QT.Art.homeRoom = function (c, tier, x, y, w, h, S, H) {
    var dpr = (H && H.dpr) || window.devicePixelRatio || 1, key = tier + ':' + Math.round(w) + 'x' + Math.round(h) + '@' + dpr;
    var e = ROOM[key];
    if (!e) {
      var cv = document.createElement('canvas');
      cv.width = Math.ceil(w * dpr); cv.height = Math.ceil(h * dpr);
      var g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      roomStatic(g, Math.max(0, Math.min(2, tier)), w, h);
      e = ROOM[key] = cv;
    }
    c.drawImage(e, x, y, w, h);
    if (S && S.home && S.home.cat && S.home.cat.at != null) {
      c.save(); c.translate(x + w * 0.82, y + h * 0.9); c.scale(2.4, 2.4);
      c.globalAlpha = 0.6 + 0.2 * Math.sin((S.t || 0) * 2);
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, 0, 6, 3.4, 0, 0, TAU); c.fill();
      c.fillStyle = '#e8902e'; c.beginPath(); c.ellipse(-2.4, -1, 2.4, 1.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#2f2c46'; c.beginPath(); c.ellipse(2.4, -0.6, 1.6, 1.2, 0, 0, TAU); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(5, -2, 2.4, 0, TAU); c.fill();
      c.fillStyle = '#e8902e'; c.beginPath(); c.moveTo(4, -3.6); c.lineTo(4.4, -5.6); c.lineTo(5.4, -4); c.closePath(); c.fill();
      c.fillStyle = '#e2403a'; c.fillRect(3, -0.6, 3.6, 0.8);
      c.restore();
    }
  };
  QT.Art.homeCat = drawCat;
})(window.QT || (window.QT = {}));
