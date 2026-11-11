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
  function isSup() { return !!(QT.supporter && QT.supporter()); }
  function sparkle(x, y, r, col) {
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fillStyle = col; ctx.fill();
  }
  function crown(x, y, k) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(-4.4, 0); ctx.lineTo(-5, -5.2); ctx.lineTo(-2.3, -2.6); ctx.lineTo(0, -6.6);
    ctx.lineTo(2.3, -2.6); ctx.lineTo(5, -5.2); ctx.lineTo(4.4, 0); ctx.closePath();
    ctx.fillStyle = '#ffe066'; ctx.fill();
    ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.strokeStyle = '#a86f00'; ctx.stroke();
    ctx.fillStyle = '#e2508a';
    ctx.beginPath(); ctx.arc(0, -1.8, 1, 0, 7); ctx.fill();
    ctx.restore();
  }
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
  function txt(c, s, x, y, size, color, align, weight, halo) {
    c.font = (weight || 700) + ' ' + size + 'px ' + FONT;
    c.textAlign = align || 'left';
    c.textBaseline = 'middle';
    if (halo) { c.lineWidth = Math.max(2.5, size / 3.5); c.strokeStyle = halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color; c.fillText(s, x, y);
  }
  function fitTxt(c, s, x, y, size, maxW, color, weight, min) {
    var fs = size;
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
  function updateCamera(S) {
    cam.x += (ex(S.player.x, S.player.y) - cam.x) * 0.16;
    cam.y += (ey(S.player.x, S.player.y, 0) - cam.y) * 0.16;
  }
  var SKY = [
    ['#bfe4ff', '#eaf6ff', '#fdf7ec'],
    ['#bfe4ff', '#eaf6ff', '#fdf7ec'],
    ['#a9d8ff', '#e3f2ff', '#fff4e0'],
    ['#8fc3f5', '#ffe3c2', '#ffd6a8'],
    ['#7aa7e8', '#ffc9a3', '#ffb38a'],
    ['#5a74c8', '#f59aa0', '#ffb38a'],
    ['#34407e', '#7d5fb0', '#e88fa8'],
    ['#0d1030', '#23195a', '#4a2a6e']
  ];
  function mixCol(a, b, k) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = ((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * k;
    var g = ((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k;
    var bl = (pa & 255) + ((pb & 255) - (pa & 255)) * k;
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(bl) + ')';
  }
  function altitude(S) {
    var y = S.player.y / TILE;
    for (var i = 0; i < W.ROOMS.length; i++) {
      var r = W.ROOMS[i];
      if (y >= r.wallTop && y <= r.wallBottom + 1) {
        var k = 1 - (y - r.wallTop) / Math.max(1, r.wallBottom + 1 - r.wallTop);
        return Math.min(W.ROOMS.length - 1, i + Math.max(0, k - 0.5) * 2 * 0.999);
      }
    }
    return 0;
  }
  var skyAlt = 0, starsArr = null;
  function drawSky(S) {
    var alt = altitude(S);
    skyAlt = Math.abs(alt - skyAlt) > 1.5 ? alt : skyAlt + (alt - skyAlt) * 0.05;
    var i0 = Math.floor(skyAlt), i1 = Math.min(SKY.length - 1, i0 + 1), k = skyAlt - i0;
    var g = ctx.createLinearGradient(0, 0, 0, cssH);
    g.addColorStop(0, mixCol(SKY[i0][0], SKY[i1][0], k));
    g.addColorStop(0.55, mixCol(SKY[i0][1], SKY[i1][1], k));
    g.addColorStop(1, mixCol(SKY[i0][2], SKY[i1][2], k));
    ctx.fillStyle = g; ctx.fillRect(0, 0, cssW, cssH);
    var night = Math.max(0, Math.min(1, (skyAlt - 5.2) / 1.6));
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
      ctx.fillStyle = mixCol('#c9d8ea', '#2a2160', Math.min(1, skyAlt / 7));
      ctx.globalAlpha = 0.28;
      ctx.fillRect(bx, base - bh, bw, bh);
      var lit = Math.max(0, Math.min(1, (skyAlt - 3.5) / 2.5));
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
  function drawRoom(r, S) {
    var open = QT.G.roomOpen(r.id);
    var ox = (r.ix - 1) * TILE, oy = (r.iy - 1) * TILE;
    var ow = (r.iw + 2) * TILE, oh = (r.ih + 2) * TILE;
    if (!open) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([8, 7]); ctx.lineDashOffset = -(S.t * 9) % 15;
      I.facePath(ctx, ox, oy, ow, oh, 0);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.14; ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
      return;
    }
    I.shadow(ctx, ox, oy, ow, oh, 0.14);
    if (r.outdoor) {
      I.box(ctx, ox, oy, ow, oh, 0, 3, '#cfd9c6');
      floorSlab(r.ix * TILE, r.iy * TILE, r.iw * TILE, r.ih * TILE, 3, '#eceadf', '#e4e1d3', false);
      function road(ry, rh) {
        I.box(ctx, ox, ry, ow, rh, 3, 0.6, '#9aa0a6');
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (var lx = ox + 6; lx < ox + ow - 10; lx += 22) {
          I.facePath(ctx, lx, ry + rh / 2 - 1, 10, 2, 3.7); ctx.fill();
        }
      }
      road(oy + TILE * 0.8, TILE * 2.4);
      road(oy + oh - TILE * 2.2, TILE * 2.2);
      (r.roads || []).forEach(function (rd) { road(rd.y * TILE, rd.h * TILE); });
      for (var gi = 0; gi < 4; gi++) {
        var gx = ox + 8 + gi * ((ow - 20) / 3);
        I.box(ctx, gx, oy + 3, 7, 7, 3, 4, '#b7cf9a');
        I.box(ctx, gx + 1.5, oy + 4.5, 4, 4, 7, 7, '#7fb069');
      }
      drawGate(r, S, 3);
      return;
    }
    var th = THEME[r.id] || {};
    I.box(ctx, ox, oy, ow, oh, 0, 4, th.base || '#e6d3b2');
    floorSlab(r.ix * TILE, r.iy * TILE, r.iw * TILE, r.ih * TILE, 4, th.floor || C.floor, th.floor2 || C.floor2, true);
    drawFloorDeco(r, S, th);
    var up = W.ROOMS[r.index + 1];
    if (up) {
      var gx0 = (up.door.x - 1) * TILE, gx1 = (up.door.x + up.door.w + 1) * TILE;
      I.box(ctx, ox, oy, gx0 - ox, TILE, 4, H_WALL, th.wall || C.wall);
      I.box(ctx, gx1, oy, ox + ow - gx1, TILE, 4, H_WALL, th.wall || C.wall);
    } else I.box(ctx, ox, oy, ow, TILE, 4, H_WALL, th.wall || C.wall);
    I.box(ctx, ox, oy + TILE, TILE, oh - TILE, 4, H_WALL, th.wall || C.wall);
    drawWallDeco(r, S, th, ox, oy, ow, oh);
    drawGate(r, S, 4);
    var below = W.ROOMS[r.index - 1];
    if (below && QT.G.roomOpen(below.id)) {
      var dx = r.door.x * TILE, dy = r.door.y * TILE;
      floorSlab(dx, dy - 5, r.door.w * TILE, TILE + 10, 4, C.floor, null, false);
    }
  }
  var THEME = {
    sw:      { floor: '#fbf3e4', floor2: '#f1e3c8', wall: '#f4e0bd', neon: 'QUANTUM', neonCol: '#e2508a', plants: true },
    plant:   { floor: '#e2e5ea', floor2: '#d6dae1', wall: '#c3c9d3', base: '#b8bec8', hazard: true, neon: 'FACTORY', neonCol: '#f2a63b' },
    service: { floor: '#e7eef7', floor2: '#dae4f0', wall: '#c9d8ea', base: '#bccbe0', led: '#2fbf7a' },
    outsrc:  { floor: '#f6f9ff', floor2: '#e9f0fb', wall: '#dde8f7', base: '#c8d6ec', led: '#2bb8d8', clean: true },
    cryo:    { floor: '#e2f6ff', floor2: '#cdeefc', wall: '#b7e1f5', base: '#9fd0ea', led: '#7fd6ff', frost: true },
    hq:      { floor: '#221c42', floor2: '#2b2456', wall: '#2f2760', base: '#1a1533',
               night: true, spots: true, rainbowLed: true }
  };
  function drawFloorDeco(r, S, th) {
    var x = r.ix * TILE, y = r.iy * TILE, w = r.iw * TILE, h = r.ih * TILE;
    if (th.hazard) {
      ctx.save(); I.facePath(ctx, x, y + h - 6, w, 6, 4.2); ctx.clip();
      for (var i = -2; i < w / 8 + 2; i++) {
        I.facePath(ctx, x + i * 8, y + h - 6, 4, 6, 4.2); ctx.fillStyle = i % 2 ? '#2f2c46' : '#f5b21c'; ctx.fill();
      }
      ctx.restore();
    }
    if (th.spots) {
      ctx.save();
      I.facePath(ctx, x, y, w, h, 4.2); ctx.clip();
      var cols = ['rgba(255,80,160,0.22)', 'rgba(80,200,255,0.22)', 'rgba(255,210,60,0.2)', 'rgba(140,90,255,0.22)'];
      for (var k = 0; k < 4; k++) {
        var px = x + w * (0.5 + 0.4 * Math.sin(S.t * (0.4 + k * 0.13) + k * 2));
        var py = y + h * (0.5 + 0.4 * Math.cos(S.t * (0.33 + k * 0.1) + k));
        var c = P(px, py, 4.3);
        ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.ellipse(c.x, c.y, 42, 22, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    if (th.frost) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (var f = 0; f < 26; f++) {
        var fx = x + ((f * 97 + S.t * 9) % w), fy = y + ((f * 53 + S.t * 14) % h);
        var fc = P(fx, fy, 6 + (f % 5) * 5 + Math.sin(S.t * 2 + f) * 3);
        ctx.fillRect(fc.x - 1, fc.y - 1, 2.2, 2.2);
      }
    }
  }
  function drawWallDeco(r, S, th, ox, oy, ow, oh) {
    if (th.led || th.rainbowLed) {
      var n = Math.floor(ow / 6);
      for (var i = 0; i < n; i++) {
        var p = P(ox + i * 6 + 3, oy + TILE - 1, 4 + H_WALL - 2);
        ctx.fillStyle = th.rainbowLed ? 'hsl(' + Math.round((i * 12 - S.t * 120) % 360 + 360) % 360 + ',95%,62%)'
                      : (Math.floor(i - S.t * 8) % 6 === 0 ? '#ffffff' : th.led);
        ctx.fillRect(p.x - 1.4, p.y - 1, 2.8, 2.2);
      }
    }
    if (th.neon) {
      var np = P(ox + TILE * 3.5, oy + TILE - 0.5, 4 + H_WALL * 0.55);
      var on = Math.sin(S.t * 7) > -0.92;
      ctx.save();
      ctx.font = '900 11px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      if (on) { ctx.shadowColor = th.neonCol; ctx.shadowBlur = 8; }
      ctx.fillStyle = on ? th.neonCol : 'rgba(120,110,140,0.5)';
      ctx.fillText(th.neon, np.x, np.y);
      ctx.restore();
    }
    if (th.plants) {
      [[ox + TILE * 1.2, oy + TILE * 1.2], [ox + ow - TILE * 1.4, oy + TILE * 1.2]].forEach(function (q) {
        I.box(ctx, q[0], q[1], 7, 7, 4, 6, '#d9c2a0');
        var c = P(q[0] + 3.5, q[1] + 3.5, 16);
        ctx.fillStyle = '#4fae6b'; ctx.beginPath(); ctx.arc(c.x, c.y, 6.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#6fcf87'; ctx.beginPath(); ctx.arc(c.x - 2, c.y - 2, 3.5, 0, 7); ctx.fill();
      });
    }
  }
  var gateRects = [];
  function gateSign(cx, cy, lines, col, glow) {
    ctx.font = '800 8.5px ' + FONT;
    var w = 0;
    lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l[0]).width); });
    w += 12;
    var h = 5 + lines.length * 10.5;
    gateRects.push({ l: (cx - w / 2 - 3 - cam.x) * z + cssW / 2, r: (cx + w / 2 + 3 - cam.x) * z + cssW / 2,
                     t: (cy - h - 3 - cam.y) * z + cssH / 2, b: (cy + 3 - cam.y) * z + cssH / 2 });
    if (glow) {
      ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = col;
      rr(ctx, cx - w / 2 - 3, cy - h - 3, w + 6, h + 6, 6); ctx.fill(); ctx.restore();
    }
    fillRR(ctx, cx - w / 2, cy - h, w, h, 4, '#ffffff');
    strokeRR(ctx, cx - w / 2, cy - h, w, h, 4, col, 1.4);
    lines.forEach(function (l, i) {
      txt(ctx, l[0], cx, cy - h + 8 + i * 10.5, 8.5, l[1] || C.ink, 'center', 800);
    });
    ctx.fillStyle = col; ctx.fillRect(cx - 0.8, cy, 1.6, 3);
  }
  var gateSignQ = null;
  function flushGateSign() {
    if (!gateSignQ) return;
    var q = gateSignQ; gateSignQ = null;
    gateSign(q[0], q[1], q[2], q[3], q[4]);
  }
  var gateAlpha = {};
  function drawGate(L, S, base) {
    var up = W.ROOMS[L.index + 1];
    if (!up || !QT.G.roomOpen(L.id)) return;
    var open = QT.G.roomOpen(up.id);
    var dx = up.door.x * TILE, dy = up.door.y * TILE, dw = up.door.w * TILE;
    var H = 34, gold = '#e8a800';
    floorSlab(dx - TILE, dy, dw + 2 * TILE, TILE, base, open ? C.floor : '#e9e2d2', null, false);
    if (open) {
      ctx.save();
      I.facePath(ctx, dx, dy - 4, dw, TILE + 22, base + 0.3); ctx.clip();
      ctx.strokeStyle = 'rgba(232,168,0,0.75)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (var i = 0; i < 4; i++) {
        var yy = dy + 24 - ((S.t * 18 + i * 8) % 32);
        var a1 = P(dx + 4, yy + 5, base + 0.4), b1 = P(dx + dw / 2, yy, base + 0.4), c1 = P(dx + dw - 4, yy + 5, base + 0.4);
        ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();
      }
      ctx.restore();
    } else {
      I.box(ctx, dx, dy + TILE / 2 - 1, dw, 2, base, H - 6, '#f2c230',
            { left: '#e0ac12', right: '#d39c0a' });
      ctx.save();
      I.leftFacePath(ctx, dx, dy + TILE / 2 - 1, dw, 2, base + H - 6, base); ctx.clip();
      ctx.strokeStyle = 'rgba(40,35,50,0.55)'; ctx.lineWidth = 3;
      for (var k = -3; k < 8; k++) {
        var p1 = P(dx + k * 7, dy + TILE / 2 + 1, base), p2 = P(dx + k * 7 + 14, dy + TILE / 2 + 1, base + H);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      ctx.restore();
      var lk = P(dx + dw / 2, dy + TILE / 2 + 1, base + 12);
      ctx.strokeStyle = '#6b5a2a'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(lk.x, lk.y - 3, 2.6, Math.PI, 0); ctx.stroke();
      fillRR(ctx, lk.x - 3.6, lk.y - 3, 7.2, 6, 1.4, '#8a6d1f');
      ctx.fillStyle = '#f6d36b'; ctx.fillRect(lk.x - 0.6, lk.y - 1.2, 1.2, 2.4);
    }
    var pl = S.player, pcol = (pl.x - pl.y) / TILE;
    var behind = open && roomIdOfY(pl.y) === up.id && pl.y > dy - 5 * TILE &&
                 pcol > (dx - 7 - dy - TILE) / TILE - 0.6 && pcol < (dx + dw + 7 - dy) / TILE + 0.6;
    var ga = gateAlpha[up.id] == null ? 1 : gateAlpha[up.id];
    ga += ((behind ? 0.3 : 1) - ga) * 0.2;
    gateAlpha[up.id] = ga;
    var pc = open ? '#ffe7a8' : '#e7dcc4';
    ctx.save(); ctx.globalAlpha *= ga;
    I.box(ctx, dx - 6, dy + 2, 6, TILE - 4, base, H, pc);
    I.box(ctx, dx + dw, dy + 2, 6, TILE - 4, base, H, pc);
    I.box(ctx, dx - 7, dy + 1, dw + 14, TILE - 2, base + H, 5, open ? gold : '#b9ad94');
    ctx.restore();
    var sp = P(dx + dw / 2, dy + TILE / 2, base + H + 7);
    if (open && roomIdOfY(S.player.y) === up.id) {   }
    else if (open) {
      gateSignQ = [sp.x, sp.y, [['▲ ' + L_nm(up), C.ink]], gold, 0];
    } else {
      var afford = S.coins >= up.cost, glow = afford ? 0.25 + 0.25 * Math.sin(S.t * 5) : 0;
      gateSignQ = [sp.x, sp.y, [[L_nm(up), C.ink], ['¥' + QT.G.fmt(up.cost), afford ? '#c98f0f' : C.red]],
                   afford ? gold : '#b9b3c8', glow];
    }
  }
  function L_nm(r) { return L.nm(r); }
  function drawDoor(r, S) {
    var below = W.ROOMS[r.index - 1];
    if (!below || !QT.G.roomOpen(r.id) || !QT.G.roomOpen(below.id)) return;
    var dx = r.door.x * TILE, dy = r.door.y * TILE, dw = r.door.w * TILE;
    var base = r.outdoor || below.outdoor ? 3 : 4;
    I.box(ctx, dx - 2, dy - 6, dw + 4, TILE + 12, base, 0.8, '#f0c96a');
    ctx.save();
    I.facePath(ctx, dx - 2, dy - 6, dw + 4, TILE + 12, base + 0.8);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      var yy = dy - 2 + i * 8 + ((S.t * 14) % 8);
      var a = P(dx + 3, yy, base + 0.9), b = P(dx + dw / 2, yy - 5, base + 0.9), c2 = P(dx + dw - 3, yy, base + 0.9);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();
    }
    ctx.restore();
    I.box(ctx, dx - 4, dy - 1, 4, TILE + 2, base, 26, '#f6d089');
    I.box(ctx, dx + dw, dy - 1, 4, TILE + 2, base, 26, '#f6d089');
    I.box(ctx, dx - 4, dy - 1, dw + 8, TILE + 2, base + 26, 4, '#e0a94e');
  }
  function drawRoomFront(r) {
    if (!QT.G.roomOpen(r.id) || r.outdoor) return;
    var ox = (r.ix - 1) * TILE, oy = (r.iy - 1) * TILE;
    var ow = (r.iw + 2) * TILE, oh = (r.ih + 2) * TILE;
    I.box(ctx, ox + ow - TILE, oy + TILE, TILE, oh - TILE * 2, 4, 5, shade(C.wall, -10));
    I.box(ctx, ox + TILE, oy + oh - TILE, ow - TILE, TILE, 4, 5, shade(C.wall, -10));
    var below = W.ROOMS[r.index - 1];
    if (below && QT.G.roomOpen(below.id)) {
      var dx = r.door.x * TILE, dy = r.door.y * TILE;
      floorSlab(dx, dy - 5, r.door.w * TILE, TILE + 10, 4, C.floor, null, false);
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
    if (p.kind === 'cafe') return drawCafeBase(p, S);
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
    if (p.kind === 'cafe') return drawCafeFixture(p, i, S);
    var b = p.blocks[i];
    var x = (p.x + b[0]) * TILE, y = (p.y + b[1]) * TILE;
    var w = b[2] * TILE, h = b[3] * TILE;
    var isParcel = p.parcelAt && b[0] === p.parcelAt[0] && b[1] === p.parcelAt[1];
    var isCounter = p.counterAt && b[0] === p.counterAt[0] && b[1] === p.counterAt[1];
    var sv = S.store;
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
  function drawCafeBase(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.16);
    I.box(ctx, x, y, w, h, 0, 2, '#fffaf2');
    floorSlab(x + 1, y + 1, w - 2, h - 2, 2, '#f0e4d2', '#e7d8c2', false);
    I.box(ctx, x, y, w, 3, 2, H_LOW + 8, '#e7dccb', { top: '#f6efe3' });
    I.box(ctx, x, y + 3, 3, h - 3, 2, H_LOW + 8, '#e7dccb', { top: '#f6efe3' });
    I.box(ctx, x, y - 1, w, 3, 2 + H_LOW + 8, 4, '#6b4630');
    I.box(ctx, x, y - 1, w, 3, 2 + H_LOW + 12, 3, '#c89b6a');
  }
  function drawCafeFixture(p, i, S) {
    var b = p.blocks[i];
    var x = (p.x + b[0]) * TILE, y = (p.y + b[1]) * TILE;
    var w = b[2] * TILE, h = b[3] * TILE;
    var cf = S.cafe;
    var isCounter = p.counterAt && b[1] === p.counterAt[1];
    if (!isCounter) {
      I.box(ctx, x + 2, y + 4, w - 4, h - 8, 2, 6, '#8a5a3c');
      I.box(ctx, x + 3, y + 3.5, 13, 5, 8, 12, '#d7dbe4');
      I.box(ctx, x + 4, y + 4.5, 11, 3, 19, 1.2, ((Math.floor(S.t * 2)) % 2) ? '#e2504a' : '#f6c27a');
      I.box(ctx, x + 6, y + 8, 3, 1.5, 8, 4, '#5c5470');
      for (var k = 0; k < 3; k++)
        I.box(ctx, x + 22 + k * 8, y + 4.5, 5, 3, 8, 6, ['#6b4630', '#a5764f', '#8a5a3c'][k]);
      return;
    }
    var TOP = 10;
    I.box(ctx, x + 2, y + 5, w - 4, h - 10, 2, TOP, '#7a4f36');
    I.box(ctx, x + 1.2, y + 4.2, w - 2.4, h - 8.4, 2 + TOP, 1.6, '#a5764f');
    var n = Math.min(QT.G.CFG.cupsMax, cf.cups);
    for (var c = 0; c < n; c++) {
      var cx = x + 5 + c * 9, cy = y + 5.5;
      I.box(ctx, cx - 1, cy - 1, 7, 5, TOP + 1.6, 0.6, '#e8ded0');
      I.box(ctx, cx, cy, 5, 3, TOP + 2.2, 7, '#ffffff');
      I.box(ctx, cx + 0.6, cy + 0.4, 3.8, 2.2, TOP + 9.2, 0.6, '#5a3b24');
      var s = P(cx + 2.5, cy + 1.5, TOP + 10);
      ctx.globalAlpha = 0.45 + 0.25 * Math.sin(S.t * 3 + c);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.x, s.y - 1); ctx.lineTo(s.x + Math.sin(S.t * 3 + c) * 2, s.y - 7);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
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
    var seed = cu.k, wait = p.kind === 'cafe' ? QT.G.CFG.cafeWait : QT.G.CFG.custWait;
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
  function drawOffice(p, S) {
    var x = p.x * TILE, y = p.y * TILE, w = p.w * TILE, h = p.h * TILE;
    I.shadow(ctx, x, y, w, h, 0.18);
    I.box(ctx, x, y, w, h, 0, 3, '#ffffff');
    floorSlab(x + 2, y + 2, w - 4, h - 4, 3, '#f5f4fb', null, false);
    I.box(ctx, x + 3, y + 3, w - 6, h * 0.42, 3, H_PLOT, '#e8ecf7');
    for (var i = 0; i < 4; i++)
      I.box(ctx, x + 6 + i * ((w - 16) / 3), y + h * 0.42 + 2, 3.5, 3.5, 3, H_PLOT - 5, '#ffffff');
    I.box(ctx, x + 2, y + 2, w - 4, h * 0.42 + 2, 3 + H_PLOT, 4, '#7d8fc4');
    I.box(ctx, x + 8, y + h - 14, w - 20, 6, 3, 9, '#e8dcc6');
    var st = S.co;
    var done = (st.certified ? 1 : 0) + (st.founded ? 1 : 0) + (st.bank ? 1 : 0);
    for (var s = 0; s < 3; s++)
      I.box(ctx, x + 12 + s * 9, y + h - 13, 4.5, 3.5, 12, 3, s < done ? '#2fbf7a' : '#cfd0dc');
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
    if (p.kind === 'helium') {
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
  function drawPlot(p, S) {
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
      var text = 'QTYC ', cols = text.length * 6;
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
    expand: '#f5b21c', buy: '#e2508a', reg: '#2bb8d8', stock: '#f2a63b', rd: '#ef7d2e',
    brew: '#c89b6a', cserve: '#8a5a3c', pickup: '#f2a63b', drop: '#f2a63b',
    borrow: '#2fbf7a', repay: '#f2a63b',
    found: '#7d8fc4', accept: '#2fbf7a', skip: '#b9b3c8',
    ship: '#2fbf7a', dcdrop: '#6f57e0', collectDc: '#f5b21c', collectSvc: '#f5b21c',
    angel: '#f5b21c', sales: '#f2a63b', cvc: '#6f57e0', mission: '#f2a63b', collectSales: '#f5b21c', press2: '#e2508a', fix: '#e2504a', promo: '#e2508a', seminar: '#2fbf7a', vc: '#6f57e0', ipo: '#f5b21c', gacha: '#e2508a'
  };
  function padRoom(pad) {
    if (pad.type === 'angel') return pad.room;
    if (pad.type === 'expand') return W.ROOMS[pad.room.index - 1].id;
    return pad.p.room;
  }
  function drawPads(S, roomId) {
    QT.G.PADS().forEach(function (pad) {
      if (!QT.G.padActive(pad)) return;
      if (roomId && padRoom(pad) !== roomId) return;
      var info = QT.G.padInfo(pad);
      if (!info) return;
      var base = (pad.type === 'buy' && S.p[pad.p.id].owned) ? '#9aa3c4' : (PAD_COL[pad.type] || C.violet);
      var x = pad.x * TILE, y = pad.y * TILE;
      ctx.save();
      if (info.can) {
        var pl = 0.5 + 0.5 * Math.sin(S.t * 4);
        ctx.globalAlpha = 0.20 + 0.30 * pl;
        I.facePath(ctx, x - 5 - pl * 3, y - 5 - pl * 3, TILE + 10 + pl * 6, TILE + 10 + pl * 6, 4.5);
        ctx.fillStyle = base; ctx.fill();
      }
      ctx.globalAlpha = info.can ? 1 : 0.35;
      I.facePath(ctx, x - 1, y - 1, TILE + 2, TILE + 2, 4.5);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      I.facePath(ctx, x + 1, y + 1, TILE - 2, TILE - 2, 4.6);
      ctx.fillStyle = base; ctx.fill();
      I.facePath(ctx, x + 4.5, y + 4.5, TILE - 9, TILE - 9, 4.8);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
      ctx.restore();
      padRing(pad, info, S, 0);
    });
  }
  function padRing(pad, info, S, lift) {
    var cxw = (pad.x + 0.5) * TILE, cyw = (pad.y + 0.5) * TILE;
    if (info.can) {
      var rc = P(cxw, cyw, lift);
      ctx.save();
      ctx.strokeStyle = PAD_COL[pad.type] || C.violet; ctx.lineWidth = 2.2 / z;
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
    ctx.fillStyle = (m && m.q < 55) ? C.red : C.green;
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
    if (isSup()) {
      crown(0, -24.2, 0.95);
      for (var sk = 0; sk < 3; sk++) {
        var sa = S.t * 1.7 + sk * 2.094, tw = 0.5 + 0.5 * Math.sin(S.t * 5.3 + sk * 1.9);
        var sx2 = Math.cos(sa) * 11, sy2 = -11 + Math.sin(sa) * 4.5 - sk * 2.5;
        sparkle(sx2, sy2, 1.6 + tw * 1.8, 'rgba(245,178,28,' + (0.45 + 0.55 * tw).toFixed(2) + ')');
        sparkle(sx2, sy2, 0.7 + tw * 0.8, 'rgba(255,255,255,' + (0.5 + 0.5 * tw).toFixed(2) + ')');
      }
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
  var sceneList = [];
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
  function roomIdOfY(wy) {
    var t = wy / TILE;
    for (var i = 0; i < W.ROOMS.length; i++) {
      var r = W.ROOMS[i];
      if (t >= r.wallTop && t <= r.wallBottom) return r.id;
    }
    return null;
  }
  function drawBeltIn(r, S) {
    var pts = [];
    W.PIPELINE.forEach(function (id) {
      if (S.p[id].owned && QT.G.roomOpen(W.BY_ID[id].room)) pts.push(W.center(W.BY_ID[id]));
    });
    if (QT.G.roomOpen('plant')) pts.push(W.center(W.BY_ID.asm));
    if (pts.length < 2) return;
    ctx.save();
    I.facePath(ctx, r.ix * TILE, r.iy * TILE, r.iw * TILE, r.ih * TILE, 4);
    ctx.clip();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    var p0 = P(pts[0].x, pts[0].y, 4);
    ctx.moveTo(p0.x, p0.y);
    for (var k = 1; k < pts.length; k++) { var pk = P(pts[k].x, pts[k].y, 4); ctx.lineTo(pk.x, pk.y); }
    ctx.strokeStyle = '#e0d2b6'; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = '#fbf3e4'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(150,120,80,0.45)'; ctx.lineWidth = 2;
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = -(S.t * 26) % 12;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function pushScene(e) { if (e && e.draw) sceneList.push(e); }
  function drawScene(S) {
    var playerRoom = roomIdOfY(S.player.y);
    gateRects.length = 0;
    gateSignQ = null;
    for (var i = W.ROOMS.length - 1; i >= 0; i--) {
      var r = W.ROOMS[i];
      artRun('backdrop', r.id, [r, S, H]);
      artRun('backdrop', '*', [r, S, H]);
      drawRoom(r, S);
      if (!QT.G.roomOpen(r.id)) continue;
      drawBeltIn(r, S);
      if (r.id === 'plant') drawYard(S);
      artRun('floor', r.id, [r, S, H]);
      flushGateSign();
      drawPads(S, r.id);
      sceneList.length = 0;
      W.PLOTS.forEach(function (p) {
        if (p.room !== r.id) return;
        if (p.open) {
          sceneList.push({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: p.h * TILE, base: p });
          (p.blocks || []).forEach(function (b, bi) {
            sceneList.push({ x: (p.x + b[0]) * TILE, y: (p.y + b[1]) * TILE,
                             w: b[2] * TILE, h: b[3] * TILE, fixture: p, fi: bi });
          });
          if (p.kind === 'store' || p.kind === 'cafe') {
            (p.kind === 'cafe' ? S.cafe : S.store).cust.forEach(function (cu, ci) {
              var q = custPos(p, ci);
              sceneList.push({ x: q.x - 4, y: q.y - 4, w: 8, h: 8, cust: cu, ci: ci, plot: p });
            });
          }
          if (p.kind === 'devdesk' || p.kind === 'hwlab') {
            var seats = (p.padsLocal || []).length, first = p.kind === 'devdesk' ? 1 : 0;
            var n = p.kind === 'hwlab' ? Math.min(seats, QT.G.S.rdStaff())
                  : (S.p.staff.owned ? Math.min(S.p.staff.level, seats - first) : 0);
            for (var si = 0; si < n; si++) {
              var q2 = staffSeat(p, si + first);
              sceneList.push({ x: q2.x - 4, y: q2.y - 4, w: 8, h: 8, staff: si + first, plot: p });
            }
          }
          return;
        }
        sceneList.push({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: p.h * TILE, p: p });
      });
      if (playerRoom === r.id)
        sceneList.push({ x: S.player.x - 4, y: S.player.y - 4, w: 8, h: 8, pl: true });
      if (S.angel && S.angel.room === r.id)
        sceneList.push({ x: S.angel.x - 4, y: S.angel.y - 4, w: 8, h: 8, angel: true });
      if (r.id === 'plant') {
        var tp = truckPos(S);
        if (tp) { var tb = truckBox(tp); tb.truck = true; sceneList.push(tb); }
      }
      S.outputs.forEach(function (o) {
        if (roomIdOfY(o.y) !== r.id) return;
        sceneList.push({ x: o.x - 5, y: o.y - 5, w: 10, h: 10, o: o });
      });
      S.items.forEach(function (it) {
        var k = Math.max(0, Math.min(1, it.t / it.dur));
        var wx = it.x0 + (it.x1 - it.x0) * k, wy = it.y0 + (it.y1 - it.y0) * k;
        if (roomIdOfY(wy) !== r.id) return;
        sceneList.push({ x: wx - 4, y: wy - 4, w: 8, h: 8, it: it, wx: wx, wy: wy });
      });
      artRun('scene', r.id, [r, S, H, pushScene]);
      artRun('scene', '*', [r, S, H, pushScene]);
      sortByDepth(sceneList);
      for (var j = 0; j < sceneList.length; j++) {
        var e = sceneList[j];
        if (e.draw) artCall('scene-item', e.draw, [e]);
        else if (e.p) drawPlot(e.p, S);
        else if (e.base) drawStoreBase(e.base, S);
        else if (e.fixture) drawFixture(e.fixture, e.fi, S);
        else if (e.cust) drawCustomer(e.plot, e.ci, e.cust, S);
        else if (e.staff != null) drawStaff(e.plot, e.staff, S);
        else if (e.pl) drawPlayer(S);
        else if (e.angel) drawAngel(S);
        else if (e.truck) drawTruck(S);
        else if (e.o) { var s = P(e.o.x, e.o.y, 0); machineIcon(s.x, s.y - 8, e.o.m); }
        else if (e.it) drawItem(e.it, e.wx, e.wy);
      }
      drawRoomFront(r);
    }
    drawFx(S);
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
  var HUD_H = 84, OBJ_H = 24, EV_H = 38;
  function evActive() { var S = QT.G.S; return !!(S.ev && S.ev.until > S.t && S.ev.until - S.ev.at > 7); }
  var HUD_MAXW = 420;
  function hudW() { return Math.min(cssW - 20, HUD_MAXW); }
  function evSideW() { var r = cssW - 20 - hudW() - 8; return r >= 200 ? Math.min(320, r) : 0; }
  function hudBottom() { return 8 + HUD_H + 6 + OBJ_H + 6 + (evActive() && !evSideW() ? EV_H + 6 : 0); }
  function currentRoom(S) {
    var y = S.player.y / TILE;
    for (var i = 0; i < W.ROOMS.length; i++) {
      var r = W.ROOMS[i];
      if (y >= r.wallTop && y <= r.wallBottom) return r.id;
    }
    return null;
  }
  function clearOfGates(x, y, hw, hb) {
    for (var i = 0; i < gateRects.length; i++) {
      var g = gateRects[i];
      if (x + hw - 4 > g.l && x - hw + 4 < g.r && y + hb - 3 > g.t && y - hb + 3 < g.b) y = g.t - hb - 2;
    }
    return y;
  }
  function hitsGate(x, y, hw, hb, m) {
    for (var i = 0; i < gateRects.length; i++) {
      var g = gateRects[i];
      if (x + hw > g.l - m && x - hw < g.r + m && y + hb > g.t - m && y - hb < g.b + m) return g;
    }
    return null;
  }
  var labelBoxes = [];
  function drawWorldLabels(S) {
    var top = hudBottom(), here = currentRoom(S);
    labelBoxes.length = 0;
    gateRects.forEach(function (g) { labelBoxes.push({ x0: g.l, x1: g.r, y0: g.t, y1: g.b }); });
    W.ROOMS.forEach(function (r) {
      if (!QT.G.roomOpen(r.id) || r.id !== here) return;
      var fs = Math.max(11, Math.min(16, 4.4 * z));
      ctx.font = '800 ' + fs + 'px ' + FONT;
      var hw = ctx.measureText(L.nm(r)).width / 2, hb = fs * 0.65;
      var fx = r.ix + r.iw * 0.22;
      var s = toScreen(fx * TILE, (r.iy - 1) * TILE, H_WALL + 12);
      while (hitsGate(s.x, s.y, hw, hb, 2) && fx > r.ix + 0.5) {
        fx -= 0.25;
        s = toScreen(fx * TILE, (r.iy - 1) * TILE, H_WALL + 12);
      }
      var g = hitsGate(s.x, s.y, hw, hb, 2);
      if (g) s.y = g.t - hb - 4;
      if (s.y < top || s.y > cssH || s.x < -160 || s.x > cssW + 160) return;
      labelBoxes.push({ x0: s.x - hw - 3, x1: s.x + hw + 3, y0: s.y - hb, y1: s.y + hb });
      txt(ctx, L.nm(r), s.x, s.y, fs, '#8a6a3a', 'center', 800, 'rgba(255,255,255,0.92)');
    });
    W.PLOTS.forEach(function (p) {
      if (!QT.G.roomOpen(p.room)) return;
      var st = S.p[p.id];
      var fs = Math.max(10, Math.min(14, 3.9 * z));
      var hh = st.owned ? (p.kind === 'store' || p.kind === 'cafe' || p.kind === 'office'
                           ? H_PLOT + 14 : H_PLOT + 18) : 22;
      var s = toScreen((p.x + p.w / 2) * TILE, (p.y + p.h / 2) * TILE, hh);
      var two = !st.owned && p.cost;
      var name = st.owned ? L.nm(p, 'short') + (p.cost && st.level ? '  Lv.' + st.level : '') : L.nm(p, 'short');
      var cost = two ? QT.G.costOf(p) : 0;
      ctx.font = '800 ' + fs + 'px ' + FONT;
      var lw = ctx.measureText(name).width;
      if (two) lw = Math.max(lw, ctx.measureText('-¥' + QT.G.fmt(cost)).width);
      var hb = two ? fs * 0.75 + fs * 0.65 : fs * 0.65;
      s.y = clearOfGates(s.x, s.y, lw / 2 + 3, hb);
      if (s.y < top || s.y > cssH || s.x < -130 || s.x > cssW + 130) return;
      labelBoxes.push({ x0: s.x - lw / 2 - 3, x1: s.x + lw / 2 + 3,
                        y0: s.y - (two ? fs * 1.4 : fs * 0.65), y1: s.y + (two ? fs * 1.4 : fs * 0.65) });
      if (!two) {
        txt(ctx, name, s.x, s.y, fs, '#3b3757', 'center', 800, 'rgba(255,255,255,0.95)');
      } else {
        var ok = S.coins >= cost;
        txt(ctx, name, s.x, s.y - fs * 0.75, fs, ok ? '#3b3757' : '#9a94ad', 'center', 800, 'rgba(255,255,255,0.95)');
        txt(ctx, '-¥' + QT.G.fmt(cost), s.x, s.y + fs * 0.75, fs, ok ? '#c98f0f' : '#c07a86', 'center', 800, 'rgba(255,255,255,0.95)');
      }
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
                 gx: tp ? (tp.x + 0.5) * TILE : e.x, gy: tp ? (tp.y + 0.5) * TILE : e.y });
      if (e.pad) alerted.push(e.pad);
    });
    var pads = [], held = null, seen = {};
    var hp = S.heldPad, hk = hp && hp.p && hp.p.padsLocal ? hp.p.id + '|' + hp.type : null;
    QT.G.PADS().forEach(function (pad) {
      if (!QT.G.padActive(pad)) return;
      var info = QT.G.padInfo(pad);
      if (!info || !info.can) return;
      if (S.heldPad !== pad && (pad.type === 'collectSvc' || pad.type === 'collectDc')) return;
      var wx = (pad.x + 0.5) * TILE, wy = (pad.y + 0.5) * TILE;
      var e = {
        wx: wx, wy: wy, h: 4, text: info.label, col: PAD_COL[pad.type] || C.violet, pri: 1,
        sub: info.gain ? '+¥' + QT.G.fmt(info.gain) : (info.cost ? '-¥' + QT.G.fmt(info.cost) : null),
        d: Math.hypot(wx - S.player.x, wy - S.player.y), gx: wx, gy: wy
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
          e.h = (pp.kind === 'store' || pp.kind === 'cafe' || pp.kind === 'office') ? H_PLOT + 14 : H_PLOT + 18;
        }
        pads.push(e);
      }
    });
    pads.sort(function (a, b) { return a.d - b.d; });
    var list = (held ? [held] : []).concat(out).concat(pads.slice(0, 5));
    return list.slice(0, 8);
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
      if (moved) {
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
      if (e.gx != null) bubHits.push({ x: e.bx - bw / 2, y: e.by - e.hh, w: bw, h: e.hh, gx: e.gx, gy: e.gy });
    });
  }
  function spotFree(e, y, used, band0, band1) {
    if (y - e.hh < band0 - 0.5 || y > band1 + 0.5) return false;
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
    QT.G.goTo(best.gx, best.gy);
    if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
    return true;
  });
  function alertList(S) {
    var a = [];
    function add(id, text, col, tapType) {
      var p = W.BY_ID[id];
      if (!p || !QT.G.roomOpen(p.room)) return;
      a.push({ x: (p.x + p.w / 2) * TILE, y: (p.y + p.h / 2) * TILE, h: H_PLOT + 26, text: text, col: col,
               tap: tapType ? findPad(tapType, id) : null });
    }
    function addPad(type, text, col) {
      var pad = findPad(type);
      if (!pad || !QT.G.roomOpen(pad.p.room)) return;
      a.push({ x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE, h: 4, text: text, col: col, pad: pad });
    }
    if (S.store.cust.length) addPad('reg', L.t('waiting', { n: S.store.cust.length }), C.red);
    if (S.cafe.cust.length)
      addPad(S.cafe.cups ? 'cserve' : 'brew', S.cafe.cups ? L.t('cafeWaiting', { n: S.cafe.cust.length }) : L.t('needCups'),
        S.cafe.cups ? '#8a5a3c' : C.red);
    if (S.deliv) add(S.deliv.corp, L.t('delivHere'), '#f2a63b', 'drop');
    else if (!S.officeOn()) addPad('pickup', L.t('delivTake'), '#f2a63b');
    if (S.offer) add('desk', L.t('newOrder'), C.green, 'accept');
    if (S.mission) add(S.mission.corp, L.t('missionTake'), '#f2a63b', 'sales');
    if (S.t < S.pressUntil) add('desk', L.t('pressActive'), '#e2508a');
    if (S.angel && Math.hypot(S.angel.x - S.player.x, S.angel.y - S.player.y) > 16)
      a.push({ x: S.angel.x, y: S.angel.y, h: 34, text: L.t('angelAlert'), col: '#f5b21c' });
    if (S.brokenCount()) add('svc', L.t('nBroken', { n: S.brokenCount() }), C.red, 'fix');
    if (S.he <= 0 && QT.G.roomOpen('plant')) add('asm', L.t('helium') + ' 0', C.red);
    if (S.pendSvc >= 1) add('svc', '+¥' + QT.G.fmt(S.pendSvc), C.gold, 'collectSvc');
    if (S.pendDc >= 1) add('qcloud', '+¥' + QT.G.fmt(S.pendDc), C.gold, 'collectDc');
    return a;
  }
  function popTxt(c, s, x, y, size, fill, stroke, lw) {
    c.font = '900 ' + size + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = lw || Math.max(3, size / 4.2); c.strokeStyle = stroke || '#2a1a40'; c.strokeText(s, x, y);
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  function drawToasts(S) {
    S.toasts.forEach(function (t) {
      var k = t.t / t.life;
      var pop = k < 0.12 ? 0.4 + (k / 0.12) * 0.95 : k < 0.25 ? 1.35 - ((k - 0.12) / 0.13) * 0.35 : 1;
      var s = toScreen(t.x, t.y, 24);
      var money = /^\+/.test(t.text);
      var size = Math.max(13, 4.4 * z) * (t.crit ? 1.7 : t.big ? 1.35 : money ? 1.15 : 1);
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
    var tx = 10 + 22, ty = 8 + 22;
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
    var s = { x: cssW - 86, y: S.jobs.length ? orderRowY(S, S.jobs.length - 1) + 35 + 40 : hudBottom() + 46 };
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
  function drawHUD(S) {
    var G = QT.G, pad = 10, top = 8, w = hudW(), RX = pad + w;
    shownCash += (S.coins - shownCash) * 0.18;
    shownValue += (S.marketCap() - shownValue) * 0.12;
    glass(pad, top, w, HUD_H, 18);
    if (isSup()) strokeRR(ctx, pad + 1, top + 1, w - 2, HUD_H - 2, 17, 'rgba(245,178,28,0.8)', 2);
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.arc(pad + 22, top + 22, 10.5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(160,110,0,0.45)';
    ctx.beginPath(); ctx.arc(pad + 22, top + 22, 6, 0, 7); ctx.fill();
    if (isSup()) crown(pad + 22, top + 12.5, 0.85);
    ctx.save();
    ctx.translate(pad + 38, top + 22); ctx.scale(1 + hudBump * 0.18, 1 + hudBump * 0.18);
    txt(ctx, '¥' + G.fmt(shownCash), 0, 0, 19, hudBump > 0.3 ? '#c98f0f' : C.ink, 'left', 800);
    ctx.restore();
    var eqs = L.t('equity') + ' ' + Math.round(S.equity * 100) + '%';
    if (S.ipo) {
      var sp = S.sharePrice();
      eqs = 'QTYC ¥' + String(sp).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (sp >= S.ipo.price ? ' ▲' : ' ▼') + '  ' + eqs;
    }
    txt(ctx, eqs, RX - 12, top + 15, 11,
      S.co.founded ? C.violet : '#b9b3c8', 'right');
    txt(ctx, L.t('carry') + ' ' + S.player.carry.length + '/' + G.carryMax(), RX - 12, top + 31, 11,
      S.player.carry.length ? C.green : C.inkSoft, 'right');
    var v = shownValue, tgt = S.ipo ? G.CFG.primeTarget : G.CFG.ipoTarget;
    txt(ctx, L.t(S.ipo ? 'ipoCap' : 'value'), pad + 12, top + 46, 10, C.inkSoft);
    txt(ctx, G.fmt(v) + ' / ' + G.fmt(tgt), RX - 12, top + 46, 10, '#c98f0f', 'right');
    bar(pad + 12, top + 53, w - 24, 6, v / tgt, C.gold);
    var f = S.fin, profit = f.rev - f.exp;
    var ms = L.t('month', { n: f.month });
    txt(ctx, ms, pad + 12, top + 70, 10, C.inkSoft);
    var px = Math.max(pad + 62, pad + 12 + ctx.measureText(ms).width + 7);
    txt(ctx, L.t('profit') + ' ' + (profit >= 0 ? '+' : '') + G.fmt(profit), px, top + 70, 10.5,
      profit >= 0 ? C.green : C.red, 'left', 800);
    if (QT.G.roomOpen('plant')) {
      var low = S.he <= 0, hm = S.heMax();
      if (shownHeMax > 0 && hm > shownHeMax + 0.5) heGrow = 1;
      if (!shownHeMax || Math.abs(hm - shownHeMax) < 0.5) shownHeMax = hm;
      else shownHeMax += (hm - shownHeMax) * 0.06;
      heGrow = Math.max(0, heGrow - 0.02);
      var hcol = low ? C.red : heGrow > 0 ? C.green : C.inkSoft;
      ctx.save();
      if (heGrow > 0) {
        var hs = 1 + 0.15 * heGrow * Math.abs(Math.sin(S.t * 8));
        ctx.translate(RX - 56, top + 70); ctx.scale(hs, hs); ctx.translate(-(RX - 56), -(top + 70));
      }
      txt(ctx, L.t('helium') + ' ' + Math.floor(S.he) + '/' + Math.round(shownHeMax), RX - 56, top + 70, 9.5,
        hcol, 'right', 700);
      ctx.restore();
      bar(RX - 52, top + 66, 40, 7, S.he / Math.max(1, shownHeMax), low ? C.red : C.green);
    }
    if (HUD_H > 84) drawPerf(S, pad + 12, top + 82, w - 24, 26);
    if (S.t < (S.feverUntil || 0)) {
      ctx.save();
      ctx.lineWidth = 3; ctx.strokeStyle = rainbow(S.t, 0);
      rr(ctx, pad - 1, top - 1, w + 2, HUD_H + 2, 19); ctx.stroke();
      ctx.restore();
      var fl = Math.ceil(S.feverUntil - S.t);
      fillRR(ctx, pad + w / 2 - 62, top + HUD_H - 10, 124, 20, 10, rainbow(S.t, 2));
      popTxt(ctx, L.t('fever') + ' ' + fl + 's', pad + w / 2, top + HUD_H, 11, '#ffffff', '#2a1a40', 3);
    }
    var oy = top + HUD_H + 6;
    glass(pad, oy, w, OBJ_H, 11);
    ctx.save(); rr(ctx, pad, oy, w, OBJ_H, 11); ctx.clip();
    ctx.fillStyle = C.gold; ctx.fillRect(pad, oy, 5, OBJ_H);
    ctx.restore();
    var warn = G.cashWarn();
    if (warn && Math.floor(S.t / 4) % 2 === 0) {
      ctx.save(); rr(ctx, pad, oy, w, OBJ_H, 11); ctx.clip();
      ctx.fillStyle = 'rgba(226,80,74,0.12)'; ctx.fillRect(pad, oy, w, OBJ_H);
      ctx.fillStyle = C.red; ctx.fillRect(pad, oy, 5, OBJ_H);
      ctx.restore();
      fitTxt(ctx, warn, pad + 16, oy + OBJ_H / 2, 11.5, w - 26, C.red, 800);
    } else fitTxt(ctx, G.objText(), pad + 16, oy + OBJ_H / 2, 11.5, w - 26, C.ink, 700);
    if (evActive()) {
      var ev = S.ev, good = ev.id !== 'parts' && ev.id !== 'helium';
      var left = Math.max(0, ev.until - S.t);
      var col = good ? C.green : C.red;
      var sw = evSideW(), ex2 = sw ? RX + 8 : pad, ew = sw || w, ey2 = sw ? top : oy + OBJ_H + 6;
      glass(ex2, ey2, ew, EV_H, 12);
      ctx.save(); rr(ctx, ex2, ey2, ew, EV_H, 12); ctx.clip();
      ctx.fillStyle = good ? 'rgba(47,191,122,0.10)' : 'rgba(226,80,74,0.10)';
      ctx.fillRect(ex2, ey2, ew * left / (ev.until - ev.at), EV_H);
      ctx.restore();
      fitTxt(ctx, (good ? '▲ ' : '▼ ') + L.t('ev_' + ev.id), ex2 + 12, ey2 + 12, 11.5, ew - 60, col, 800);
      fitTxt(ctx, L.t('evd_' + ev.id), ex2 + 26, ey2 + 27, 10, ew - 38, C.inkSoft, 700);
      txt(ctx, Math.ceil(left) + 's', ex2 + ew - 12, ey2 + 12, 10.5, col, 'right', 800);
    }
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
  var REPORT_LIFE = 4.2;
  function drawReport(S) {
    var r = S.report, G = QT.G;
    if (!r) return;
    var e = S.t - r.at;
    if (e > REPORT_LIFE) { S.report = null; return; }
    var w = Math.min(cssW - 60, 230), h = 104, x0 = cssW - w - 10;
    var slide = e < 0.3 ? 1 - ease(e / 0.3) : e > REPORT_LIFE - 0.35 ? ease((e - (REPORT_LIFE - 0.35)) / 0.35) : 0;
    var x = x0 + slide * (w + 20), y = cssH - h - 130;
    var k = ease(Math.min(1, (e - 0.2) / 0.9));
    glass(x, y, w, h, 16);
    ctx.save(); rr(ctx, x, y, w, h, 16); ctx.clip();
    ctx.fillStyle = r.profit >= 0 ? C.green : C.red; ctx.fillRect(x, y, 6, h);
    ctx.restore();
    txt(ctx, L.t('monthReport', { n: r.month }), x + 16, y + 17, 12, C.violet, 'left', 900);
    var rows = [[L.t('revenue'), r.rev, C.ink], [L.t('expenses'), -r.exp, C.red]];
    rows.forEach(function (row, i) {
      txt(ctx, row[0], x + 16, y + 38 + i * 17, 10.5, C.inkSoft, 'left', 700);
      txt(ctx, (row[1] < 0 ? '-¥' : '¥') + G.fmt(Math.abs(row[1]) * k), x + w - 14, y + 38 + i * 17, 11.5, row[2], 'right', 800);
    });
    txt(ctx, L.t('profit'), x + 16, y + 80, 12, C.ink, 'left', 900);
    var right = x + w - 14, sign = r.profit >= 0 ? '+¥' : '-¥';
    var pcol = r.profit >= 0 ? '#2fbf7a' : '#e2504a';
    var ps = sign + G.fmt(Math.abs(r.profit) * k);
    ctx.font = '900 17px ' + FONT;
    var pw = ctx.measureText(ps).width, pwF = ctx.measureText(sign + G.fmt(Math.abs(r.profit))).width;
    popTxt(ctx, ps, right - pw / 2, y + 80, 17, pcol, '#ffffff', 4);
    var mo = e > 1.0 ? momLabel(r.profit, r.prevProfit) : null;
    if (mo) {
      ctx.font = '900 12px ' + FONT;
      var lw = ctx.measureText(L.t('profit')).width, bw = ctx.measureText(mo.s).width;
      var bx = x + 16 + lw + 8;
      if (bx + bw + 6 <= right - pwF)
        popTxt(ctx, mo.s, bx + bw / 2, y + 80, 12, mo.up ? '#2fbf7a' : '#e2504a', '#ffffff', 3);
    }
    uiCovers.push({ x: x, y: y, w: w, h: h });
  }
  function orderRowY(S, i) {
    var y = hudBottom(), w = Math.min(cssW - 20, 240), x = cssW - 10 - w;
    var ow = Math.min(cssW - 40, 300), ox = (cssW - ow) / 2;
    if (S.offer && i > 0 && ox + ow > x) return y + 34 + 76 + 6 + (i - 1) * 35;
    return y + i * 35;
  }
  function drawOrders(S) {
    if (!S.jobs.length) return;
    var pad = 10, w = Math.min(cssW - 20, 240), x = cssW - pad - w;
    S.jobs.forEach(function (j, i) {
      var h = 30, yy = orderRowY(S, i);
      uiCovers.push({ x: x, y: yy, w: w, h: h });
      glass(x, yy, w, h, 11);
      ctx.save(); rr(ctx, x, yy, w, h, 11); ctx.clip();
      ctx.fillStyle = j.client.color; ctx.fillRect(x, yy, 5, h);
      ctx.restore();
      txt(ctx, L.nm(j.client), x + 14, yy + 10, 10.5, C.ink, 'left', 800);
      txt(ctx, j.kind === 'sw' ? L.t('swSpec', { n: j.work - j.done })
        : L.t('needSpec', { q: j.qubits, n: j.left }), x + 14, yy + 22, 10, C.inkSoft);
      var left = Math.max(0, j.due - S.t);
      txt(ctx, '¥' + QT.G.fmt(j.reward), x + w - 10, yy + 10, 10.5, '#c98f0f', 'right', 800);
      txt(ctx, Math.ceil(left) + 's', x + w - 10, yy + 22, 10, left < 30 ? C.red : C.inkSoft, 'right');
    });
  }
  function drawOffer(S) {
    if (!S.offer) return;
    var o = S.offer, w = Math.min(cssW - 40, 300), x = (cssW - w) / 2, h = 76, y = hudBottom() + 34;
    uiCovers.push({ x: x, y: y, w: w, h: h });
    glass(x, y, w, h, 16);
    ctx.save(); rr(ctx, x, y, w, h, 16); ctx.clip();
    ctx.fillStyle = o.client.color; ctx.fillRect(x, y, w, 6);
    ctx.restore();
    txt(ctx, (o.big ? '★' + L.t('bigOrder') + ' ' : L.t('newOrder') + ' — ') + L.nm(o.client), x + 15, y + 22, 12,
        o.big ? '#c98f0f' : C.ink, 'left', 800);
    txt(ctx, o.kind === 'sw' ? L.t('swSpec', { n: o.work })
      : L.t('needSpec', { q: o.qubits, n: o.count }), x + 15, y + 42, 12, C.inkSoft);
    txt(ctx, '¥' + QT.G.fmt(o.reward), x + w - 15, y + 42, 16, '#c98f0f', 'right', 800);
    var rem = Math.max(0, Math.ceil(o.life || 0));
    txt(ctx, L.t('replyIn', { n: rem }), x + 15, y + 62, 10.5, rem < 8 ? C.red : C.violet);
    txt(ctx, L.t('deadline') + ' ' + Math.round(o.deadline) + 's', x + w - 15, y + 62, 10.5, C.inkSoft, 'right');
    bar(x + 15, y + h - 7, w - 30, 3, rem / (o.big ? 39 : 26), rem < 8 ? C.red : C.violet);
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
  function btnRects() {
    var s = 42, g = 9, y = cssH - s - 12;
    return {
      mute: { x: cssW - 12 - s, y: y, w: s, h: s },
      lang: { x: cssW - 12 - s * 2 - g, y: y, w: s, h: s },
      fin: { x: cssW - 12 - s * 3 - g * 2, y: y, w: s, h: s },
      share: { x: cssW - 12 - s * 4 - g * 3, y: y, w: s, h: s },
      acct: { x: cssW - 12 - s * 5 - g * 4, y: y, w: s, h: s }
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
    base(b.lang);
    txt(ctx, L.get() === 'ja' ? 'あ' : 'A', b.lang.x + b.lang.w / 2, b.lang.y + b.lang.h / 2, 17, C.violet, 'center', 800);
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
  var VP_LABEL = {
    profit: ['利益（3か月平均）', 'Profit (3-mo avg)'],
    rev: ['売上（年商×4）', 'Revenue (annual ×4)'],
    cash: ['現金（借入を除く）', 'Net cash'],
    tech: ['技術（最高性能）', 'Technology'],
    users: ['クラウド利用者', 'Cloud users'],
    contracts: ['保守契約', 'Service contracts'],
    assets: ['設備投資', 'Capital invested'],
    buzz: ['知名度', 'Brand awareness']
  };
  var SRC_LABEL = {
    job: ['バイト・宅配', 'Shifts & parcels'], sw: ['ソフト受託', 'Software'], hw: ['ハード販売', 'Hardware'],
    svc: ['保守', 'Service'], cloud: ['量子クラウド', 'Quantum cloud'], other: ['その他', 'Other']
  };
  function lbl(pair) { return L.get() === 'ja' ? pair[0] : pair[1]; }
  var finTabs = {};
  var finBtns = {};
  function S0() { return QT.G.S; }
  function drawFinLogout(x, y, w, h) {
    if (S0().finTab !== 'ipo') finBtns.ranking = null;
    finBtns.logout = null;
    if (!QT.me || !QT.me()) return;
    var r = { x: x + w - 12 - 96, y: y + h - 34, w: 96, h: 30 };
    finBtns.logout = r;
    txt(ctx, L.t('logout'), r.x + r.w - 8, r.y + r.h / 2, 11.5, C.red, 'right', 800);
  }
  function drawFinTabs(S, x, y, w) {
    var tw = (w - 36) / 2;
    ['pl', 'ipo'].forEach(function (k, i) {
      var r = { x: x + 18 + i * tw, y: y, w: tw, h: 28 };
      finTabs[k] = r;
      var on = (S.finTab || 'pl') === k;
      fillRR(ctx, r.x + 2, r.y, r.w - 4, r.h, 10, on ? C.violet : '#f0eef6');
      txt(ctx, L.t(k === 'pl' ? 'tabPL' : (S.ipo ? 'ipoCap' : 'tabIPO')), r.x + r.w / 2, r.y + r.h / 2, 12, on ? '#fff' : C.inkSoft, 'center', 800);
    });
  }
  var RANK_COL = { S: '#e8a800', A: C.pink, B: C.blue, C: C.green };
  function ipoTopH(S) {
    if (S.ipo) return 20 + 18 + (S.prime ? 0 : 18) + 18 * 4;
    return 20 + 20 * QT.G.ipoChecks().length;
  }
  function ipoTabH(S) {
    var src = S.fin.src || {}, nk = Object.keys(src).filter(function (k) { return src[k] > 0; }).length;
    return ipoTopH(S) + 98 + 16 * S.valueParts().length + 16 * Math.max(1, nk);
  }
  function drawIpoTab(S, x, y, w, h) {
    var G = QT.G, L0 = x + 18, R0 = x + w - 18, yy = y;
    if (S.ipo) {
      var r = S.ipo, cap = S.marketCap();
      fitTxt(ctx, L.t(S.prime ? 'postPrime' : 'listedOn'), L0, yy, 12, R0 - L0, C.violet, 800); yy += 20;
      txt(ctx, L.t('ipoCap'), L0, yy, 11, C.inkSoft, 'left', 700);
      txt(ctx, yen(cap), R0, yy, 12, '#c98f0f', 'right', 800);
      bar(L0 + 150, yy - 2.5, R0 - L0 - 230, 5, Math.min(1, cap / G.CFG.primeTarget), C.gold);
      yy += 18;
      if (!S.prime) {
        fitTxt(ctx, L.t('postIpo', { t: G.fmt(G.CFG.primeTarget), v: G.fmt(cap) }), L0, yy, 10.5, R0 - L0, C.inkSoft, 700);
        yy += 18;
      }
      var rc = RANK_COL[r.rank] || C.violet;
      ctx.beginPath(); ctx.arc(L0 + 8, yy, 8, 0, 7); ctx.fillStyle = rc; ctx.fill();
      txt(ctx, r.rank, L0 + 8, yy + 0.5, 10.5, '#ffffff', 'center', 900);
      txt(ctx, L.t('ipoTimeLbl'), L0 + 22, yy, 11, C.inkSoft, 'left', 700);
      txt(ctx, mmss(r.time), R0, yy, 11.5, C.ink, 'right', 800);
      yy += 18;
      [[L.t('ipoOpenLbl'), '¥' + comma(r.open), C.ink], [L.t('ipoStake'), Math.round(r.equity * 100) + '%', C.ink],
       [L.t('ipoWealth'), yen(r.wealth), '#c98f0f']].forEach(function (row) {
        txt(ctx, row[0], L0, yy, 11, C.inkSoft, 'left', 700);
        txt(ctx, row[1], R0, yy, 11.5, row[2], 'right', 800);
        yy += 18;
      });
    } else {
      txt(ctx, L.t('ipoChecklist'), L0, yy, 12, C.violet, 'left', 800); yy += 20;
      G.ipoChecks().forEach(function (c) {
        fillRR(ctx, L0, yy - 8, 16, 16, 5, c[1] ? C.green : '#e3dff0');
        if (c[1]) txt(ctx, '✓', L0 + 8, yy, 11, '#fff', 'center', 900);
        txt(ctx, c[0], L0 + 24, yy, 11.5, c[1] ? C.ink : C.inkSoft, 'left', c[1] ? 800 : 700);
        yy += 20;
      });
    }
    yy += 8;
    txt(ctx, L.t('breakdown'), L0, yy, 12, C.violet, 'left', 800); yy += 18;
    var parts = S.valueParts(), tot = Math.max(1, S.value());
    parts.forEach(function (p) {
      txt(ctx, lbl(VP_LABEL[p[0]]), L0, yy, 10.5, C.inkSoft, 'left', 700);
      txt(ctx, '¥' + G.fmt(p[1]), R0, yy, 11, C.ink, 'right', 800);
      bar(L0 + 150, yy - 2.5, R0 - L0 - 230, 5, p[1] / tot, C.gold);
      yy += 16;
    });
    yy += 8;
    txt(ctx, L.t('revBySrc'), L0, yy, 12, C.violet, 'left', 800); yy += 18;
    var src = S.fin.src || {}, keys = Object.keys(src).filter(function (k) { return src[k] > 0; });
    var st = 0; keys.forEach(function (k) { st += src[k]; });
    if (!keys.length) { txt(ctx, L.t('arNone'), L0, yy, 10.5, C.inkSoft); yy += 16; }
    keys.sort(function (a, b) { return src[b] - src[a]; }).forEach(function (k) {
      txt(ctx, lbl(SRC_LABEL[k] || SRC_LABEL.other), L0, yy, 10.5, C.inkSoft, 'left', 700);
      txt(ctx, '¥' + G.fmt(src[k]) + '  ' + Math.round(src[k] / Math.max(1, st) * 100) + '%', R0, yy, 11, C.ink, 'right', 800);
      yy += 16;
    });
    yy += 8;
    var m = Math.floor(S.t / 60), sec = Math.floor(S.t % 60);
    txt(ctx, L.t('playTimeLbl'), L0, yy, 11, C.inkSoft, 'left', 700);
    txt(ctx, L.t('playTime', { m: m, s: (sec < 10 ? '0' : '') + sec }), R0, yy, 11.5, C.ink, 'right', 800);
    if (window.QT_STATIC) return;
    yy += 22;
    finBtns.ranking = { x: L0, y: yy - 14, w: R0 - L0, h: 30 };
    fillRR(ctx, L0, yy - 14, R0 - L0, 30, 10, '#fff4cc');
    txt(ctx, L.t('ipoRankView'), (L0 + R0) / 2, yy + 1, 12.5, '#a86f00', 'center', 900);
  }
  var FIN_HEAD = 88, FIN_FOOT = 40;
  function finPLH(S) { return FIN_HEAD + 55 + 199 + (S.fin.year > 1 ? 16 : 0) + 113 + 93 + FIN_FOOT; }
  function drawFinance(S) {
    var G = QT.G, f = S.fin, bs = S.bs();
    ctx.fillStyle = 'rgba(35,28,60,0.5)'; ctx.fillRect(0, 0, cssW, cssH);
    var w = Math.min(cssW - 20, 380), h = Math.max(finPLH(S), FIN_HEAD + ipoTabH(S) + FIN_FOOT);
    var sc = Math.min(1, (cssH - 24) / h, (cssW - 20) / w);
    var ox = cssW / 2 - w * sc / 2, oy = cssH / 2 - h * sc / 2;
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(sc, sc);
    var x = 0, y = 0;
    glass(x, y, w, h, 22);
    var L0 = x + 18, R0 = x + w - 18, yy = y + 26;
    txt(ctx, L.t('finance'), L0, yy, 17, C.ink, 'left', 800);
    txt(ctx, L.t('term', { n: f.year }) + '  ' + L.t('month', { n: f.month }), R0, yy, 11.5, C.inkSoft, 'right');
    yy += 18;
    drawFinTabs(S, x, yy, w);
    yy += 44;
    function done() {
      ctx.restore();
      function conv(r) { return r ? { x: ox + r.x * sc, y: oy + r.y * sc, w: r.w * sc, h: r.h * sc } : r; }
      finTabs.pl = conv(finTabs.pl); finTabs.ipo = conv(finTabs.ipo);
      finBtns.ranking = conv(finBtns.ranking); finBtns.logout = conv(finBtns.logout);
    }
    if (S.finTab === 'ipo') {
      drawIpoTab(S, x, yy, w, h);
      txt(ctx, L.t('close'), x + w / 2, y + h - 18, 12, C.violet, 'center', 800);
      drawFinLogout(x, y, w, h);
      done();
      return;
    }
    function money(v, always) {
      return (v > 0 && always ? '+' : v < 0 ? '-' : '') + '¥' + G.fmt(Math.abs(v));
    }
    function head(t) {
      ctx.strokeStyle = '#ece8f2'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(L0, yy - 5); ctx.lineTo(R0, yy - 5); ctx.stroke();
      yy += 9;
      txt(ctx, t, L0, yy, 12, C.violet, 'left', 800);
      yy += 17;
    }
    function row(label, value, col, big) {
      txt(ctx, label, L0, yy, big ? 12 : 11, big ? C.ink : C.inkSoft, 'left', big ? 800 : 400);
      txt(ctx, value, R0, yy, big ? 13 : 11.5, col || C.ink, 'right', big ? 800 : 700);
      yy += big ? 19 : 16;
    }
    function pair(l1, v1, c1, l2, v2, c2, big) {
      var mid = x + w / 2, wt = big ? 800 : 400;
      ctx.font = (big ? 800 : 700) + ' 11.5px ' + FONT;
      var vw1 = ctx.measureText(v1).width, vw2 = ctx.measureText(v2).width;
      if (l1) fitTxt(ctx, l1, L0, yy, 11, (mid - 10) - L0 - vw1 - 6, big ? C.ink : C.inkSoft, wt);
      txt(ctx, v1, mid - 10, yy, 11.5, c1 || C.ink, 'right', big ? 800 : 700);
      if (l2) fitTxt(ctx, l2, mid + 10, yy, 11, R0 - (mid + 10) - vw2 - 6, big ? C.ink : C.inkSoft, wt);
      txt(ctx, v2, R0, yy, 11.5, c2 || C.ink, 'right', big ? 800 : 700);
      yy += big ? 19 : 16;
    }
    var prof = f.yRev - f.yExp;
    pair(L.t('cash'), '¥' + G.fmt(S.coins), C.ink,
         L.t('value'), '¥' + G.fmt(S.value()), '#c98f0f', true);
    pair(L.t('founder'), Math.round(S.equity * 100) + '%', C.violet,
         L.t('users'), G.fmt(Math.floor(S.users)), C.ink);
    pair(L.t('thisMonth') + ' ' + L.t('profit'), money(Math.round(f.rev - f.exp), true),
         f.rev - f.exp >= 0 ? C.green : C.red,
         L.t('popularity'), String(Math.round(S.pop)), C.ink);
    yy += 4;
    head(L.t('plYear'));
    row(L.t('revenue'), money(Math.round(f.yRev), true), C.green, true);
    row('　' + L.t('rent'), money(-Math.round(f.yRent)), C.red);
    row('　' + L.t('outsourcing'), money(-Math.round(f.yOut)), C.red);
    row('　' + L.t('cloudLbl'), money(-Math.round(f.yCloud)), C.red);
    row('　' + L.t('salaryLbl') + ' (' + L.t('staffCount', { n: S.p.staff.owned ? S.p.staff.level : 0 }) + ')',
        money(-Math.round(f.yPay)), C.red);
    row('　' + L.t('utilLbl'), money(-Math.round(f.yUtil)), C.red);
    row('　' + L.t('heliumCost'), money(-Math.round(f.yHe)), C.red);
    row('　' + L.t('interestLbl'), money(-Math.round(f.yInt || 0)), C.red);
    row(L.t('expenses'), money(-Math.round(f.yExp)), C.red, true);
    row(L.t('profit'), money(Math.round(prof), true), prof >= 0 ? C.green : C.red, true);
    if (f.year > 1)
      row(L.t('prevTerm'), money(Math.round(f.pRev - f.pExp), true),
          f.pRev - f.pExp >= 0 ? C.green : C.red);
    yy += 4;
    head(L.t('balance'));
    pair(L.t('cash'), '¥' + G.fmt(bs.a.cash), C.ink,
         L.t('payables'), '¥' + G.fmt(bs.unpaid), bs.unpaid > 0 ? C.red : C.inkSoft);
    pair(L.t('receivables2'), '¥' + G.fmt(bs.a.ar), C.gold,
         L.t('borrowings'), '¥' + G.fmt(bs.debt), bs.debt > 0 ? C.red : C.inkSoft);
    pair(L.t('equipment'), '¥' + G.fmt(bs.a.equip), C.ink,
         L.t('capital'), '¥' + G.fmt(bs.paidIn), C.violet);
    pair('', '', C.ink,
         L.t('retained'), money(Math.round(bs.retained), true), bs.retained >= 0 ? C.green : C.red);
    pair(L.t('assets'), '¥' + G.fmt(bs.total), C.ink,
         L.t('liabEquity'), '¥' + G.fmt(bs.liab + bs.equity), C.ink, true);
    yy += 4;
    head(L.t('cashflow'));
    row(L.t('cfOp'), money(Math.round(f.cfOp), true), f.cfOp >= 0 ? C.green : C.red);
    row(L.t('cfInv'), money(Math.round(f.cfInv), true), f.cfInv >= 0 ? C.green : C.red);
    row(L.t('cfFin'), money(Math.round(f.cfFin), true), f.cfFin >= 0 ? C.green : C.red);
    var net = f.cfOp + f.cfInv + f.cfFin;
    row(L.t('cfNet'), money(Math.round(net), true), net >= 0 ? C.green : C.red, true);
    txt(ctx, L.t('close'), x + w / 2, y + h - 18, 12, C.violet, 'center', 800);
    drawFinLogout(x, y, w, h);
    done();
  }
  var IPO_BELLS = [1.8, 2.4, 3.0, 3.6, 4.2], IPO_OPEN = 5.0, IPO_CARD = 9.0;
  var ipoFx = { key: null, fired: {}, conf: [], last: 0 };
  function ipoElapsed(S) { return S.ipo ? S.t - S.ipo.at : 99; }
  var ipoBtns = {};
  function ipoText(r) {
    return L.t('ipoShareText', { t: mmss(r.time), c: yen(r.cap), w: yen(r.wealth), r: r.rank });
  }
  function ipoSkip(S, p) {
    if (!S.ipo) return true;
    var e = ipoElapsed(S);
    function hit(b) { return b && p && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
    if (e >= IPO_CARD + 0.4 && hit(ipoBtns.rank)) {
      if (QT.openRanking) QT.openRanking();
      return false;
    }
    if (e >= IPO_CARD + 0.4 && hit(ipoBtns.share)) {
      QT.Share.open(ipoText(S.ipo), 'ipo');
      return false;
    }
    if (e >= IPO_CARD) {
      if (e >= IPO_CARD + 0.6 && hit(ipoBtns.go)) return true;
      if (e >= IPO_CARD + 1.5 && ipoBtns.card && !hit(ipoBtns.card)) return true;
      return false;
    }
    ipoFx.fired.stamp = 1;
    IPO_BELLS.forEach(function (b, i) { ipoFx.fired['bell' + i] = 1; });
    if (e < IPO_OPEN) { S.ipo.at = S.t - IPO_OPEN; return false; }
    S.ipo.at = S.t - IPO_CARD;
    return false;
  }
  function ipoOnce(k, fn) { if (!ipoFx.fired[k]) { ipoFx.fired[k] = 1; fn(); } }
  function confettiBurst(n, x, y, spread) {
    var cols = [C.gold, C.pink, C.blue, C.green, C.violet, C.orange, '#ffffff'];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      var sp = 160 + Math.random() * 320;
      ipoFx.conf.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                        r: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
                        w: 4 + Math.random() * 5, h: 7 + Math.random() * 6,
                        c: cols[i % cols.length], life: 3.5 + Math.random() * 2, t: 0 });
    }
  }
  function drawConfetti(dt) {
    for (var i = ipoFx.conf.length - 1; i >= 0; i--) {
      var p = ipoFx.conf[i];
      p.t += dt;
      p.vy += 420 * dt; p.vx *= Math.pow(0.35, dt); p.vy = Math.min(p.vy, 170);
      p.x += p.vx * dt + Math.sin(p.t * 5 + i) * 0.6; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.t > p.life || p.y > cssH + 20) { ipoFx.conf.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.scale(1, Math.abs(Math.cos(p.t * 7 + i)) * 0.8 + 0.2);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
  var supFw = { key: null, seed: 0, next: 0, shells: [], sparks: [] };
  var SUP_FW_COLS = ['#ffe066', '#fff3b0', '#ffb800', '#ffffff', '#ffd54a'];
  function supRand() {
    var t = (supFw.seed = (supFw.seed + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function drawSupFireworks(S, e, dt) {
    if (supFw.key !== S.ipo.time) supFw = { key: S.ipo.time, seed: 0x51C0FFEE, next: IPO_OPEN, shells: [], sparks: [] };
    if (e - supFw.next > 1) supFw.next = e;
    while (e >= supFw.next && supFw.next < IPO_CARD + 2.5) {
      supFw.shells.push({ x: cssW * (0.12 + supRand() * 0.76), y: cssH + 8, ty: cssH * (0.1 + supRand() * 0.22),
                          t: 0, life: 0.75 + supRand() * 0.3, c: SUP_FW_COLS[Math.floor(supRand() * SUP_FW_COLS.length)] });
      supFw.next += 0.42;
    }
    var i, p;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (i = supFw.shells.length - 1; i >= 0; i--) {
      p = supFw.shells[i];
      p.t += dt;
      var k = Math.min(1, p.t / p.life), y0 = p.y + (p.ty - p.y) * (1 - Math.pow(1 - k, 2));
      if (k >= 1) {
        var n = 32, sp0 = 110 + supRand() * 60;
        for (var j = 0; j < n; j++) {
          var a = j / n * Math.PI * 2 + supRand() * 0.12;
          supFw.sparks.push({ x: p.x, y: p.ty, vx: Math.cos(a) * sp0, vy: Math.sin(a) * sp0, t: 0,
                              life: 1.2 + supRand() * 0.5, c: j % 3 ? p.c : '#ffffff' });
        }
        supFw.sparks.push({ flash: true, x: p.x, y: p.ty, t: 0, life: 0.3, c: p.c });
        supFw.shells.splice(i, 1);
        continue;
      }
      ctx.fillStyle = 'rgba(255,224,102,0.9)';
      ctx.beginPath(); ctx.arc(p.x, y0, 2.2, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,224,102,0.35)';
      ctx.fillRect(p.x - 0.8, y0 + 2, 1.6, 12);
    }
    for (i = supFw.sparks.length - 1; i >= 0; i--) {
      p = supFw.sparks[i];
      p.t += dt;
      if (p.t > p.life) { supFw.sparks.splice(i, 1); continue; }
      var fa = Math.max(0, 1 - p.t / p.life);
      if (p.flash) {
        ctx.globalAlpha = fa * 0.8; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8 + 22 * (1 - fa), 0, 7); ctx.fill();
        continue;
      }
      p.vx *= Math.pow(0.25, dt); p.vy = p.vy * Math.pow(0.25, dt) + 60 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = fa * 0.6; ctx.strokeStyle = p.c; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.07, p.y - p.vy * 0.07); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.globalAlpha = fa;
      sparkle(p.x, p.y, 1.8 + 2.2 * fa, p.c);
    }
    ctx.restore();
  }
  function ease(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  function yen(v) { return '¥' + QT.G.fmt(v); }
  function comma(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function mmss(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return L.t('playTime', { m: m, s: (s < 10 ? '0' : '') + s });
  }
  var ipoBg = null, ipoBgKey = '';
  function drawIpo(S) {
    var r = S.ipo;
    if (!r) return;
    if (ipoFx.key !== r.time) { ipoFx = { key: r.time, fired: {}, conf: [], last: S.t }; }
    var e = ipoElapsed(S), dt = Math.max(0, Math.min(0.05, S.t - ipoFx.last));
    ipoFx.last = S.t;
    var cx = cssW / 2, cy = cssH / 2;
    var bk = cssW + 'x' + cssH;
    if (bk !== ipoBgKey) {
      ipoBg = ctx.createLinearGradient(0, 0, 0, cssH);
      ipoBg.addColorStop(0, '#0e1a3a'); ipoBg.addColorStop(0.6, '#1d2459'); ipoBg.addColorStop(1, '#3a1f55');
      ipoBgKey = bk;
    }
    ctx.save();
    ctx.globalAlpha = ease(e / 0.8) * 0.94;
    ctx.fillStyle = ipoBg; ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.10 * ease(e / 1.2);
    for (var sl = 0; sl < 4; sl++) {
      var sa = Math.sin(S.t * 0.7 + sl * 1.7) * 0.35;
      ctx.beginPath();
      ctx.moveTo(cssW * (0.15 + sl * 0.23), -10);
      ctx.lineTo(cx + Math.sin(sa) * cssW * 0.6 - 60, cssH);
      ctx.lineTo(cx + Math.sin(sa) * cssW * 0.6 + 60, cssH);
      ctx.closePath(); ctx.fillStyle = '#fff6c8'; ctx.fill();
    }
    ctx.restore();
    drawConfetti(dt);
    if (isSup() && e >= IPO_OPEN) drawSupFireworks(S, e, dt);
    if (e < IPO_CARD) {
      var sk = e < 0.5 ? 2.4 - 1.4 * ease(e / 0.5) : 1;
      var stampY = e < IPO_OPEN ? cy - 190 : cy - 250 - 40 * ease((e - IPO_OPEN) / 0.6);
      if (e >= 0.15) {
        ipoOnce('stamp', function () { QT.Sfx.play('bad'); QT.Sfx.play('buy'); });
        ctx.save();
        ctx.translate(cx, stampY); ctx.rotate(-0.08); ctx.scale(sk, sk);
        ctx.globalAlpha = Math.min(1, e / 0.3);
        var sfs = L.get() === 'ja' ? 26 : 20;
        ctx.font = '900 ' + sfs + 'px ' + FONT;
        var sw2 = ctx.measureText(L.t('ipoApproved')).width + 44;
        strokeRR(ctx, -sw2 / 2, -28, sw2, 56, 8, '#ff5a52', 4);
        txt(ctx, L.t('ipoApproved'), 0, 1, sfs, '#ff5a52', 'center', 900);
        ctx.restore();
      }
      txt(ctx, L.t('ipoMarket'), cx, stampY + 44, 12, 'rgba(255,255,255,0.8)', 'center', 700);
    }
    if (e >= 1.2 && e < IPO_OPEN + 0.6) {
      var ba = e < IPO_OPEN ? 1 : 1 - (e - IPO_OPEN) / 0.6;
      var hit = -1;
      IPO_BELLS.forEach(function (bt, i) {
        if (e >= bt) { hit = i; ipoOnce('bell' + i, function () { QT.Sfx.bell(1 + i * 0.0); }); }
      });
      var since = hit >= 0 ? e - IPO_BELLS[hit] : 9;
      var swing = hit >= 0 ? Math.sin(since * 14) * Math.exp(-since * 4) * 0.35 : 0;
      ctx.save();
      ctx.globalAlpha = ba;
      for (var w = 0; w <= hit; w++) {
        var ws = e - IPO_BELLS[w];
        if (ws > 1.6) continue;
        ctx.save();
        ctx.globalAlpha = ba * Math.max(0, 0.7 - ws * 0.45);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy - 30, 40 + ws * 160, 0, 7); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#6b4a2b'; ctx.fillRect(cx - 70, cy - 122, 140, 9);
      ctx.translate(cx, cy - 113); ctx.rotate(swing);
      ctx.fillStyle = '#b0892c'; ctx.fillRect(-3, 0, 6, 14);
      var bg = ctx.createLinearGradient(-44, 0, 44, 0);
      bg.addColorStop(0, '#b8860b'); bg.addColorStop(0.35, '#ffe07a'); bg.addColorStop(1, '#a8740a');
      ctx.beginPath();
      ctx.moveTo(-18, 14); ctx.quadraticCurveTo(-26, 16, -30, 50);
      ctx.quadraticCurveTo(-34, 78, -48, 86); ctx.lineTo(48, 86);
      ctx.quadraticCurveTo(34, 78, 30, 50); ctx.quadraticCurveTo(26, 16, 18, 14);
      ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
      ctx.fillStyle = '#8a6208'; ctx.fillRect(-48, 82, 96, 6);
      ctx.beginPath(); ctx.arc(0, 94, 8, 0, 7); ctx.fillStyle = '#8a6208'; ctx.fill();
      ctx.restore();
      for (var d = 0; d < 5; d++) {
        ctx.beginPath(); ctx.arc(cx - 40 + d * 20, cy + 22, 5.5, 0, 7);
        ctx.fillStyle = d <= hit ? C.gold : 'rgba(255,255,255,0.18)';
        ctx.globalAlpha = ba; ctx.fill(); ctx.globalAlpha = 1;
      }
      txt(ctx, L.t('ipoBell'), cx, cy + 50, 12.5, 'rgba(255,255,255,' + (0.85 * ba) + ')', 'center', 700);
    }
    if (e >= IPO_OPEN) {
      ipoOnce('open', function () {
        QT.Sfx.play('ipo');
        confettiBurst(90, cssW * 0.2, cssH * 0.95, 1.0);
        confettiBurst(90, cssW * 0.8, cssH * 0.95, 1.0);
      });
      ipoOnce('rain', function () { confettiBurst(70, cx, -20, 0.1); });
      if (e > 6.2) ipoOnce('burst2', function () { confettiBurst(60, cx, cssH * 0.9, 1.2); QT.Sfx.play('fanfare'); });
    }
    if (e >= IPO_OPEN && e < IPO_CARD + 0.4) {
      var ka = e < IPO_CARD ? 1 : 1 - (e - IPO_CARD) / 0.4;
      var k = ease((e - IPO_OPEN) / 2.2);
      var bw = Math.min(cssW - 32, 360), bx0 = cx - bw / 2, by0 = cy - 190;
      ctx.save();
      ctx.globalAlpha = ka;
      fillRR(ctx, bx0, by0, bw, 250, 16, '#0b0f1e');
      strokeRR(ctx, bx0, by0, bw, 250, 16, 'rgba(245,178,28,0.55)', 2);
      txt(ctx, L.t('ipoTicker'), bx0 + 16, by0 + 22, 12, C.gold, 'left', 800);
      txt(ctx, L.t('ipoFirstTrade'), bx0 + bw - 16, by0 + 22, 11, 'rgba(255,255,255,0.6)', 'right', 700);
      var shown = Math.round(r.price + (r.open - r.price) * k);
      if (k < 1 && Math.floor(e * 20) % 2 === 0) ipoOnce('t' + Math.floor(e * 10), function () { QT.Sfx.play('tick'); });
      txt(ctx, '¥' + comma(shown), bx0 + 16, by0 + 62, 38, '#4dff9a', 'left', 900);
      var up = Math.round((shown / r.price - 1) * 100);
      txt(ctx, '▲ +' + up + '%', bx0 + bw - 16, by0 + 62, 18, '#4dff9a', 'right', 900);
      txt(ctx, L.t('ipoOffer', { v: '¥' + comma(r.price) }), bx0 + 16, by0 + 94, 11, 'rgba(255,255,255,0.6)', 'left', 700);
      var gx = bx0 + 16, gy = by0 + 112, gw = bw - 32, gh = 100;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      for (var gl = 0; gl <= 4; gl++) { ctx.beginPath(); ctx.moveTo(gx, gy + gl * gh / 4); ctx.lineTo(gx + gw, gy + gl * gh / 4); ctx.stroke(); }
      var pts = 40, lo = r.price * 0.9, hi = r.open * 1.08;
      ctx.beginPath();
      for (var pi = 0; pi <= pts * k; pi++) {
        var f = pi / pts;
        var pv = r.price + (r.open - r.price) * (1 - Math.pow(1 - f, 2)) + Math.sin(pi * 1.9) * (r.open - r.price) * 0.05 * f;
        var px = gx + f * gw, py = gy + gh - (pv - lo) / (hi - lo) * gh;
        if (pi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#4dff9a'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
      txt(ctx, L.t('ipoCap') + '  ' + yen(shown * 1e7), bx0 + 16, by0 + 234, 12, '#ffffff', 'left', 800);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = ka;
      fillRR(ctx, 0, cy + 78, cssW, 26, 0, 'rgba(0,0,0,0.55)');
      var tape = L.t('ipoTape', { p: '¥' + comma(shown), u: up }) + '　　';
      ctx.font = '800 13px ' + FONT;
      var tw = ctx.measureText(tape).width;
      for (var tx = -((S.t * 80) % tw); tx < cssW; tx += tw) txt(ctx, tape, tx, cy + 91, 13, C.gold, 'left', 800);
      ctx.restore();
      txt(ctx, L.t('ipoCongrats'), cx, cy + 140, 22, '#ffffff', 'center', 900, 'rgba(0,0,0,0.3)');
      if (isSup() && cy + 168 < cssH - 44) {
        ctx.save(); ctx.globalAlpha = ka;
        txt(ctx, L.t('supThanks'), cx, cy + 168, 13, '#ffe066', 'center', 800, 'rgba(0,0,0,0.35)');
        ctx.restore();
      }
    }
    if (e < IPO_CARD) ipoBtns = {};
    if (e >= IPO_CARD) {
      var ck = ease((e - IPO_CARD) / 0.6);
      var cw = Math.min(cssW - 28, 360), ch = window.QT_STATIC ? 452 : 504;
      var ks = Math.min(1, (cssH - 16) / ch);
      var cxx = cx - cw / 2, cyy = cy - ch / 2 + (1 - ck) * 80;
      var scr = function (b) { return { x: cx + (b.x - cx) * ks, y: cy + (b.y - cy) * ks, w: b.w * ks, h: b.h * ks }; };
      ipoBtns.card = scr({ x: cxx, y: cyy, w: cw, h: ch });
      ctx.save();
      ctx.globalAlpha = ck;
      ctx.translate(cx, cy); ctx.scale(ks, ks); ctx.translate(-cx, -cy);
      glass(cxx, cyy, cw, ch, 24);
      if (isSup()) {
        var spT = L.t('supRibbon');
        ctx.font = '900 9.5px ' + FONT;
        var spW = ctx.measureText(spT).width + 16, spX = cxx + cw - 14 - spW;
        var spG = ctx.createLinearGradient(spX, 0, spX + spW, 0);
        spG.addColorStop(0, '#fff3b0'); spG.addColorStop(0.55, '#ffd54a'); spG.addColorStop(1, '#f5b21c');
        fillRR(ctx, spX, cyy + 7, spW, 16, 8, '#c98f0f');
        fillRR(ctx, spX, cyy + 5, spW, 16, 8, spG);
        txt(ctx, spT, spX + spW / 2, cyy + 13.5, 9.5, '#5a3a00', 'center', 900);
      }
      var rc = RANK_COL[r.rank] || C.violet;
      ctx.beginPath(); ctx.arc(cxx + 58, cyy + 64, 38, 0, 7); ctx.fillStyle = rc; ctx.fill();
      ctx.beginPath(); ctx.arc(cxx + 58, cyy + 64, 31, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      txt(ctx, r.rank, cxx + 58, cyy + 66, 40, '#ffffff', 'center', 900);
      txt(ctx, L.t('ipoAchieved'), cxx + 110, cyy + 44, 22, '#c98f0f', 'left', 900);
      var nmax = cw - 110 - 16;
      fitTxt(ctx, L.t(S.prime ? 'listedPrime' : 'listedOn'), cxx + 110, cyy + 70, 11.5, nmax, S.prime ? '#c98f0f' : C.pink, 700);
      var note = L.t('rankNote_' + r.rank);
      ctx.font = '700 10.5px ' + FONT;
      if (ctx.measureText(note).width <= nmax) txt(ctx, note, cxx + 110, cyy + 90, 10.5, C.inkSoft, 'left', 700);
      else {
        var nl = noteLines(note, nmax);
        txt(ctx, nl[0], cxx + 110, cyy + 86, 10.5, C.inkSoft, 'left', 700);
        fitTxt(ctx, nl[1], cxx + 110, cyy + 99, 10.5, nmax, C.inkSoft, 700);
      }
      var rows = [
        [L.t('ipoTimeLbl'), mmss(r.time), r.newTime ? L.t('newRecord') : ''],
        [L.t('ipoOpenLbl'), '¥' + comma(r.open) + '（+' + Math.round((r.open / r.price - 1) * 100) + '%）', ''],
        [L.t('ipoCap'), yen(r.cap), ''],
        [L.t('ipoStake'), Math.round(r.equity * 100) + '%', ''],
        [L.t('ipoWealth'), yen(r.wealth), r.newWealth ? L.t('newRecord') : ''],
        [L.t('cumRevenue'), yen(r.rev), ''],
        [L.t('bestSpec'), r.qubits + ' qubit', ''],
        [L.t('users'), comma(r.users), '']
      ];
      var ry = cyy + 128;
      rows.forEach(function (row, i) {
        var big = i === 4;
        if (i === 4) fillRR(ctx, cxx + 12, ry - 14, cw - 24, 28, 10, 'rgba(245,178,28,0.13)');
        txt(ctx, row[0], cxx + 22, ry, big ? 13 : 12, big ? C.ink : C.inkSoft, 'left', big ? 800 : 700);
        txt(ctx, row[1], cxx + cw - 22, ry, big ? 17 : 13.5, big ? '#c98f0f' : C.ink, 'right', 800);
        if (row[2]) txt(ctx, row[2], cxx + cw - 22, ry - 13, 9.5, C.red, 'right', 900);
        ry += big ? 36 : 32;
      });
      if (!window.QT_STATIC) {
        var rbY = cyy + ch - 108;
        ipoBtns.rank = scr({ x: cxx + 12, y: rbY, w: cw - 24, h: 42 });
        var rg = ctx.createLinearGradient(cxx, 0, cxx + cw, 0);
        rg.addColorStop(0, '#ffe066'); rg.addColorStop(1, '#f5b21c');
        fillRR(ctx, cxx + 12, rbY + 3, cw - 24, 42, 14, '#c98f0f');
        fillRR(ctx, cxx + 12, rbY, cw - 24, 42, 14, rg);
        txt(ctx, L.t('ipoRankBtn'), cx, rbY + 21, 14, '#5a3a00', 'center', 900);
      }
      var bw2 = (cw - 36) / 2, by2 = cyy + ch - 58, shx = cxx + 12, gox = cxx + 24 + bw2;
      ipoBtns.share = scr({ x: shx, y: by2, w: bw2, h: 40 });
      ipoBtns.go = scr({ x: gox, y: by2, w: bw2, h: 40 });
      fillRR(ctx, shx, by2, bw2, 40, 14, '#f0eef6');
      txt(ctx, L.t('ipoShare'), shx + bw2 / 2, by2 + 20, 13, C.violet, 'center', 800);
      fillRR(ctx, gox, by2, bw2, 40, 14, C.gold);
      txt(ctx, L.t('ipoKeepGoing'), gox + bw2 / 2, by2 + 20, 13, '#ffffff', 'center', 900);
      ctx.restore();
    }
    if (e > IPO_OPEN && e < IPO_CARD + 3 && Math.random() < 0.25) confettiBurst(2, Math.random() * cssW, -10, 0.2);
    if (e < IPO_CARD) txt(ctx, L.t('tapToSkip'), cx, cssH - 24, 10.5, 'rgba(255,255,255,0.55)', 'center', 700);
  }
  function noteLines(s, maxW) {
    function fits(t) { return ctx.measureText(t).width <= maxW; }
    if (s.indexOf(' ') >= 0) {
      var ws = s.split(' '), l1 = ws[0], n = 1;
      while (n < ws.length && fits(l1 + ' ' + ws[n])) { l1 += ' ' + ws[n]; n++; }
      if (n < ws.length) return [l1, ws.slice(n).join(' ')];
    }
    var q = s.indexOf('。');
    if (q > 0 && q < s.length - 1 && fits(s.slice(0, q + 1))) return [s.slice(0, q + 1), s.slice(q + 1)];
    var c = s.length;
    while (c > 1 && !fits(s.slice(0, c))) c--;
    return [s.slice(0, c), s.slice(c)];
  }
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
        if (!info || !info.can) return;
        var d = Math.hypot((pad.x + 0.5) * TILE - S.player.x, (pad.y + 0.5) * TILE - S.player.y);
        if (d < bd) { bd = d; tutPick.pad = pad; }
      });
    }
    var pd = tutPick.pad;
    if (pd) {
      var s = toScreen((pd.x + 0.5) * TILE, (pd.y + 0.5) * TILE, 0);
      if (s.x > 24 && s.x < cssW - 24 && s.y > hudBottom() + 30 && s.y < cardY - 20) return s;
    }
    return { x: cssW / 2, y: cardY - 70 };
  }
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
    var w = Math.min(cssW - 40, 300), h = 64, x = (cssW - w) / 2, y = cssH - h - 150;
    ctx.save();
    ctx.globalAlpha = 0.9 + 0.1 * Math.sin(S.t * 4);
    glass(x, y, w, h, 18);
    ctx.restore();
    txt(ctx, L.t(step ? 'tut2' : 'tut1'), x + w / 2, y + 22, 14, C.ink, 'center', 800);
    txt(ctx, L.t(step ? 'tut2b' : 'tut1b'), x + w / 2, y + 44, 11, C.inkSoft, 'center', 700);
    var pt = tutTarget(S, y), k = (S.t % 1.3) / 1.3;
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
      if (lines[1]) txt(ctx, lines[1], cx, cyy + 136, 22, '#c98f0f', 'center', 900);
      txt(ctx, L.t('gachaTap'), cx, cyy + ch - 20, 11, C.inkSoft, 'center', 700);
      ctx.restore();
    }
    if (!gaFx.drawn) drawConfetti(Math.max(0, Math.min(0.05, S.t - gaFx.last)));
    gaFx.drawn = false;
    gaFx.last = S.t;
  }
  function ipoOnceG(k, fn) { if (!gaFx.fired[k]) { gaFx.fired[k] = 1; fn(); } }
  var shakeFx = { amp: 0, until: 0, dur: 1 };
  function shakeScreen(amp, sec) { shakeFx = { amp: amp, until: performance.now() + sec * 1000, dur: sec * 1000 }; }
  var vigGrad = null, vigKey = '', lastFrameT = 0;
  function draw(c, S, d, stick) {
    ctx = c; dpr = d;
    HUD_H = S.co.founded && cssH >= 500 ? 116 : 84;
    if (!cam.lock) updateCamera(S);
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
    var vk = cssW + 'x' + cssH;
    if (vk !== vigKey) {
      vigGrad = ctx.createRadialGradient(cssW / 2, cssH * 0.45, cssH * 0.35, cssW / 2, cssH * 0.45, cssH * 0.85);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)'); vigGrad.addColorStop(1, 'rgba(35,25,60,0.15)');
      vigKey = vk;
    }
    ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, cssW, cssH);
    if (cam.bare) { if (S.won) drawIpo(S); return; }
    uiCovers = [];
    drawWorldLabels(S);
    artRun('labels', '*', [S, H]);
    drawGoal(S);
    drawToasts(S);
    drawCombo(S);
    drawBubbles(S);
    artRun('ui', '*', [S, H]);
    drawHUD(S);
    drawOrders(S);
    drawOffer(S);
    drawPadPrompt(S);
    if (!S.showFinance && !S.won && !S.gacha) drawReport(S);
    drawButtons(S);
    artRun('uiTop', '*', [S, H]);
    if (stick && stick.active) {
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
    if (!S.won && !S.gacha && !cardUp) { drawConfetti(fdt); drawBanner(S, fdt); }
    if (S.tut < 2 && !S.won && !S.showFinance && !S.gacha) drawTutorial(S);
    if (S.gacha) drawGacha(S);
    if (S.showFinance) drawFinance(S);
    if (S.offline) drawOffline(S);
    if (S.won) drawIpo(S);
  }
  var H = {
    get ctx() { return ctx; }, get z() { return z; }, get dpr() { return dpr; },
    get cssW() { return cssW; }, get cssH() { return cssH; },
    get cam() { return cam; }, get skyAlt() { return skyAlt; },
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
    finTabs: finTabs, finBtns: finBtns,
    resize: resize, draw: draw, cam: cam,
    zoom: function (v) { if (v) z = v; return z; },
    gachaTap: gachaTap, shake: shakeScreen,
    toWorld: function (sx, sy) { return I.toWorld((sx - cssW / 2) / z + cam.x, (sy - cssH / 2) / z + cam.y); }, btnRects: btnRects, ipoSkip: ipoSkip,
    size: function () { return { w: cssW, h: cssH }; }
  };
})(window.QT || (window.QT = {}));
