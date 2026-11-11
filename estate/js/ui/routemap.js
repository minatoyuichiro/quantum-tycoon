(function (QT) {
  'use strict';
  var W = QT.World, L = QT.L;
  L.add({
    routemapTitle:  ['運賃', 'Fares'],
    routemapFrom:   ['{n}から', 'From {n}'],
    routemapHere:   ['いまここ', 'You are here'],
    routemapRead:   ['地区を押すと、すぐその真ん中に着きます', 'Tap a district to be at its heart at once'],
    routemapReadF:  ['地区を押すと、すぐその真ん中に着きます  ¥{a}〜¥{b}', 'Tap a district to be at its heart at once  ¥{a}–¥{b}'],
    routemapFare:   ['¥{f}', '¥{f}'],
    tripsheetTitle: ['どこへ行く？', 'Where to?'],
    tripsheetSub:   ['押すとすぐ、その地区の真ん中に着きます', 'Tap to arrive at the heart of the district'],
    tripsheetReady: ['開通できます!', 'Ready to open!'],
    tripsheetOpenGo:['押すと開通して、そのまま行けます', 'Tap to open it and go there'],
    tripsheetLocked:['まだ開いていません', 'Not open yet'],
    tripsheetFree:  ['おまけ ¥0', 'Free ¥0'],
    tripsheetPass:  ['定期 ¥0', 'Pass ¥0'],
    tripsheetFare:  ['-¥{f}', '-¥{f}'],
    tripsheetNext:  ['NEXT', 'NEXT']
  });
  var COL = { line: '#2fbf7a', gold: '#f5b21c', ink: '#2f2c46', soft: '#7d788f', lock: '#cfcadb', here: '#2bb8d8', ave: '#e7e3ef' };
  function TV() { return QT.Sim && QT.Sim.travel; }
  function dcol(id) { var tv = TV(); return (tv && tv.COLORS && tv.COLORS[id]) || COL.line; }
  var st = { open: false, closing: false, t: 0, pick: null, msg: '', msgT: -9 };
  function now() { return performance.now() / 1000; }
  function open() {
    st.pick = null; st.msg = '';
    if (!st.open || st.closing) { st.open = true; st.closing = false; st.t = now(); }
    var ph = QT.UI.get('phone');
    if (ph && ph.isOpen && ph.isOpen()) ph.close();
    closeSheets();
  }
  function close() { if (st.open && !st.closing) { st.closing = true; st.t = now(); } }
  function isOpen() { return st.open && !st.closing; }
  function ease(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  function glyph(c, id, x, y, s, col) {
    c.save();
    c.translate(x, y); c.scale(s / 10, s / 10);
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.6; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    if (id === 'shibuya') {
      for (var i = -2; i <= 2; i++) { c.moveTo(-6 + i * 2.6, 5); c.lineTo(-2 + i * 2.6, -5); }
      c.stroke();
    } else if (id === 'otemachi') {
      c.moveTo(-7, -2); c.lineTo(0, -7); c.lineTo(7, -2); c.closePath(); c.fill();
      c.fillRect(-6, -1, 2, 6); c.fillRect(-1, -1, 2, 6); c.fillRect(4, -1, 2, 6); c.fillRect(-7, 5, 14, 2);
    } else if (id === 'futako') {
      c.moveTo(-7, 0); c.lineTo(0, -7); c.lineTo(7, 0); c.lineTo(5, 0); c.lineTo(5, 7); c.lineTo(-5, 7); c.lineTo(-5, 0); c.closePath(); c.fill();
    } else if (id === 'fab') {
      c.fillRect(1, -9, 6, 17);
      c.moveTo(-9, 1); c.lineTo(-4, -4); c.lineTo(1, 1); c.lineTo(-0.5, 1); c.lineTo(-0.5, 8); c.lineTo(-7.5, 8); c.lineTo(-7.5, 1); c.closePath(); c.fill();
    } else if (id === 'hongo') {
      c.moveTo(-9, -2); c.lineTo(0, -6); c.lineTo(9, -2); c.lineTo(0, 2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-5, 0); c.lineTo(-5, 4); c.quadraticCurveTo(0, 7, 5, 4); c.lineTo(5, 0); c.fill();
      c.beginPath(); c.moveTo(8, -2); c.lineTo(8, 4); c.stroke();
    } else if (id === 'shinjuku') {
      c.fillRect(-7, -6, 6, 14); c.fillRect(1, -9, 6, 17);
    } else if (id === 'ariake') {
      c.arc(0, -1, 7, 0, 7); c.stroke();
      c.beginPath();
      for (var a = 0; a < 6; a++) { c.moveTo(0, -1); c.lineTo(Math.cos(a * 1.047) * 7, -1 + Math.sin(a * 1.047) * 7); }
      c.moveTo(-4, 8); c.lineTo(0, -1); c.lineTo(4, 8); c.stroke();
    } else if (id === 'inzai') {
      c.fillRect(-8, -4, 11, 9);
      c.moveTo(-9, -4); c.lineTo(-2.5, -9); c.lineTo(4, -4); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillRect(-6.5, -2, 2.5, 2); c.fillRect(-1.5, -2, 2.5, 2); c.fillRect(-6.5, 1.5, 2.5, 2); c.fillRect(-1.5, 1.5, 2.5, 2);
      c.fillStyle = col;
      c.fillRect(5, 1, 4, 1.4); c.fillRect(5, 4, 4, 1.4); c.fillRect(5, 7, 4, 1.4);
    } else if (id === 'minato') {
      c.moveTo(-3.5, 5); c.lineTo(-2, -9); c.lineTo(2, -9); c.lineTo(3.5, 5); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-9, 8); c.quadraticCurveTo(-6, 5.5, -3, 8); c.quadraticCurveTo(0, 10.5, 3, 8); c.quadraticCurveTo(6, 5.5, 9, 8); c.stroke();
    } else if (id === 'lock') {
      c.arc(0, -2, 4, Math.PI, 0); c.stroke();
      c.fillRect(-6, -2, 12, 9);
    }
    c.restore();
  }
  function layout(R) {
    var nc = 1, nr = 1;
    W.DISTRICTS.forEach(function (d) { nc = Math.max(nc, d.col + 1); nr = Math.max(nr, d.row + 1); });
    var span = (nc - 1) + (nr - 1) || 1;
    var dx = Math.max(34, Math.min((R.w - 112) / span, 120)), dy = Math.max(30, Math.min((R.h - 70) / span, dx * 0.9));
    var cx = R.x + R.w / 2, top = R.y + 26;
    function at(c, r) { return { x: cx + (c - r) * dx, y: top + (c + r) * dy }; }
    return { dx: dx, dy: dy, at: at, nc: nc, nr: nr };
  }
  function condLine(H, d) {
    if (H.distSign) { var sg = H.distSign(d); if (sg && sg.lines && sg.lines[1]) return sg.lines[1][0]; }
    var tv = TV();
    return tv && tv.condText ? tv.condText(d.id) : '';
  }
  function drawMap(S, H, R, close0) {
    var c = H.ctx, C = H.C, tv = TV(), Lo = layout(R), here = H.tripHere ? H.tripHere() : null;
    c.save();
    c.strokeStyle = COL.ave; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath();
    W.DISTRICTS.forEach(function (d) {
      var p = Lo.at(d.col, d.row);
      W.DISTRICTS.forEach(function (e) {
        if (!((e.col === d.col + 1 && e.row === d.row) || (e.row === d.row + 1 && e.col === d.col))) return;
        var q = Lo.at(e.col, e.row);
        c.moveTo(p.x, p.y); c.lineTo(q.x, q.y);
      });
    });
    c.stroke();
    c.restore();
    var lo = null, hi = null;
    W.DISTRICTS.forEach(function (d) {
      var p = Lo.at(d.col, d.row), cs = H.tripCan ? H.tripCan(d.id) : null, opn = QT.G.roomOpen(d.id);
      var isHere = d.id === here, isPick = st.pick === d.id, rdy = !opn && !!(cs && cs.ready);
      var r = Math.max(15, Math.min(22, Lo.dy * 0.42));
      if (isPick || rdy) {
        c.save(); c.beginPath(); c.arc(p.x, p.y, r + 5, 0, 7);
        c.strokeStyle = COL.gold; c.lineWidth = 3; c.stroke(); c.restore();
      }
      c.beginPath(); c.arc(p.x, p.y, r, 0, 7);
      c.fillStyle = opn ? dcol(d.id) : COL.lock; c.fill();
      c.lineWidth = isHere ? 4 : 2.5;
      c.strokeStyle = isHere ? COL.here : (opn ? '#ffffff' : '#b9b3c8');
      c.stroke();
      glyph(c, opn ? d.id : 'lock', p.x, p.y, opn ? r * 0.46 : r * 0.39, opn ? '#ffffff' : '#8f89a3');
      var name = H.shortDist ? H.shortDist(d) : L.nm(d), line2 = '', c2 = COL.soft;
      if (isHere) { line2 = L.t('routemapHere'); c2 = COL.here; }
      else if (opn && cs && cs.fare > 0) {
        line2 = L.t('routemapFare', { f: QT.G.fmt(cs.fare) }); c2 = '#1f9d63';
        lo = lo == null ? cs.fare : Math.min(lo, cs.fare); hi = hi == null ? cs.fare : Math.max(hi, cs.fare);
      } else if (opn && cs && cs.pass) { line2 = L.t('tripsheetPass'); c2 = '#1f9d63'; }
      else if (rdy) { line2 = L.t('tripsheetReady'); c2 = '#b07a00'; }
      else if (!opn) { line2 = L.t('tripsheetLocked'); c2 = '#9a94ad'; }
      var mw = Math.max(48, Lo.dx * 1.8 - 6);
      txtIn(H, c, name, p.x, p.y + r + 10, 11.5, mw, opn ? COL.ink : '#8f89a3', 800, 'center');
      if (line2) txtIn(H, c, line2, p.x, p.y + r + 24, 10, mw, c2, 800, 'center');
      QT.UI.tapRect({ x: p.x - Math.min(mw / 2, Lo.dx - 3), y: p.y - r - 4, w: Math.min(mw, 2 * Lo.dx - 6), h: 2 * r + 34 }, function () {
        st.pick = d.id; st.msgT = now();
        if (isHere) { st.msg = ''; return true; }
        var cs2 = H.tripCan ? H.tripCan(d.id) : null;
        if (QT.Sfx) QT.Sfx.play(cs2 && (cs2.ok || cs2.ready) ? 'click' : 'error');
        if (cs2 && (cs2.ok || cs2.ready) && H.tripGo && H.tripGo(d.id, 'map')) {
          st.pick = null; st.msg = '';
          if (close0) close0();
          return true;
        }
        st.msg = L.nm(d) + '  ' + (condLine(H, d) || L.t('travelBusy'));
        return true;
      });
    });
    var fh = 36, fy = R.y - fh - 6;
    H.fillRR(R.x + 4, fy, R.w - 8, fh, 12, '#f6f4fb');
    var msg = now() - st.msgT < 2.5 ? st.msg : '';
    if (msg) txtIn(H, c, msg, R.x + R.w / 2, fy + fh / 2, 11.5, R.w - 28, C.red, 800, 'center');
    else {
      var hint = lo != null ? L.t('routemapReadF', { a: QT.G.fmt(lo), b: QT.G.fmt(hi) }) : L.t('routemapRead');
      txtIn(H, c, hint, R.x + R.w / 2, fy + fh / 2, 11.5, R.w - 28, COL.soft, 700, 'center');
    }
  }
  function txtIn(H, c, s, x, y, size, maxW, col, w, al) {
    if (al === 'left' || !al) { H.fitTxt(s, x, y, size, maxW, col, w, 8); return; }
    c.save(); c.font = (w || 700) + ' ' + size + 'px ' + H.FONT;
    var tw = Math.min(maxW, c.measureText(s).width); c.restore();
    H.fitTxt(s, al === 'center' ? x - tw / 2 : x - tw, y, size, maxW, col, w, 8);
  }
  QT.UI.panel('routemap', {
    layer: 'sheet', open: open, close: close, isOpen: isOpen, drawMap: drawMap,
    mode: function () { return 'train'; },
    swipe: function (dx, dy) {
      if (!isOpen() || dy < 50 || Math.abs(dy) < Math.abs(dx) * 1.2) return false;
      close();
      return true;
    },
    draw: function (S, H) {
      if (!st.open) return;
      var tv = TV();
      if (S.won || S.gacha || S.showFinance || !tv) { st.open = false; st.closing = false; return; }
      if (isOpen() && tv.riding()) close();
      var c = H.ctx, cssW = H.cssW, cssH = H.cssH;
      var k = ease((now() - st.t) / 0.22);
      if (st.closing) {
        k = 1 - k;
        if (k <= 0) { st.open = false; st.closing = false; return; }
      }
      var sw = Math.min(cssW, 560), sx = (cssW - sw) / 2, sh = Math.round(cssH * 0.7), sy = cssH - sh * k;
      c.save(); c.globalAlpha = 0.22 * k; c.fillStyle = '#1e1438'; c.fillRect(0, 0, cssW, cssH); c.restore();
      QT.UI.tapRect({ x: 0, y: 0, w: cssW, h: cssH }, function () { close(); return true; });
      c.beginPath();
      c.moveTo(sx, sy + 20); c.arcTo(sx, sy, sx + 20, sy, 20); c.lineTo(sx + sw - 20, sy);
      c.arcTo(sx + sw, sy, sx + sw, sy + 20, 20); c.lineTo(sx + sw, cssH + 4); c.lineTo(sx, cssH + 4); c.closePath();
      c.fillStyle = '#ffffff'; c.fill();
      QT.UI.tapRect({ x: sx, y: sy, w: sw, h: sh }, function () { return true; });
      H.fillRR(sx + sw / 2 - 20, sy + 7, 40, 4, 2, '#ddd8ea');
      var hd = H.tripHere ? H.tripHere() : null;
      var from = hd && W.DIST[hd] ? L.t('routemapFrom', { n: L.nm(W.DIST[hd]) }) : '';
      H.fitTxt(L.t('routemapTitle') + (from ? '  ·  ' + from : ''), sx + 20, sy + 30, 14, sw - 90, COL.ink, 800, 9);
      var xb = { x: sx + sw - 50, y: sy + 8, w: 44, h: 44 };
      H.fillRR(xb.x + 8, xb.y + 8, 28, 28, 14, '#f0eef6');
      c.save(); c.strokeStyle = '#7d788f'; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(xb.x + 17, xb.y + 17); c.lineTo(xb.x + 27, xb.y + 27);
      c.moveTo(xb.x + 27, xb.y + 17); c.lineTo(xb.x + 17, xb.y + 27); c.stroke(); c.restore();
      QT.UI.tapRect(xb, function () { close(); return true; });
      var R = { x: sx + 8, y: sy + 56 + 42, w: sw - 16, h: sh - 56 - 42 - 48 };
      if (R.h < 120) return;
      drawMap(S, H, R, close);
    }
  });
  var rs = { open: false, closing: false, t: 0, why: 'hud', flash: '', flashT: -9 };
  function rsOpen(why) {
    rs.why = typeof why === 'string' ? why : 'hud';
    rs.flash = '';
    if (!rs.open || rs.closing) { rs.open = true; rs.closing = false; rs.t = now(); }
    ['phone', 'routemap', 'labsheet'].forEach(function (id) {
      var p = QT.UI.get(id);
      if (p && p.isOpen && p.isOpen() && p.close) p.close();
    });
    closeSheets();
  }
  function closeSheets() {
    var all = QT.Sheet && QT.Sheet.all;
    if (all) Object.keys(all).forEach(function (id) { if (all[id].isOpen()) all[id].close(); });
  }
  function rsClose() { if (rs.open && !rs.closing) { rs.closing = true; rs.t = now(); } }
  function rsIsOpen() { return rs.open && !rs.closing; }
  function starPath(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      if (i) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function trainGlyph(c, x, y, s, col, bg) {
    c.save(); c.translate(x, y); c.scale(s / 10, s / 10);
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-6, 5); c.lineTo(-6, -5); c.quadraticCurveTo(-6, -8, -3, -8); c.lineTo(3, -8);
    c.quadraticCurveTo(6, -8, 6, -5); c.lineTo(6, 5); c.closePath(); c.fill();
    c.fillStyle = bg;
    c.fillRect(-4.2, -5.6, 8.4, 4.4);
    c.beginPath(); c.arc(-3.2, 2.2, 1.2, 0, 7); c.arc(3.2, 2.2, 1.2, 0, 7); c.fill();
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, 6); c.lineTo(-6.5, 9.5); c.moveTo(4, 6); c.lineTo(6.5, 9.5); c.stroke();
    c.restore();
  }
  function pill(H, c, txt, xr, cy, h, bg, line, col) {
    c.save(); c.font = '900 12px ' + H.FONT; var w = Math.ceil(c.measureText(txt).width) + 18; c.restore();
    H.fillRR(xr - w, cy - h / 2, w, h, h / 2, bg);
    if (line) H.strokeRR(xr - w, cy - h / 2, w, h, h / 2, line, 1);
    H.txt(txt, xr - w / 2, cy + 0.5, 12, col, 'center', 900);
    return w;
  }
  function rsDraw(S, H) {
    if (!rs.open) return;
    var tv = TV();
    if (!tv || !tv.tripList || S.won || S.gacha || S.showFinance) { rs.open = false; rs.closing = false; return; }
    if (rsIsOpen() && tv.riding()) rsClose();
    var c = H.ctx, C = H.C, cssW = H.cssW, cssH = H.cssH;
    var k = ease((now() - rs.t) / 0.2);
    if (rs.closing) {
      k = 1 - k;
      if (k <= 0) { rs.open = false; rs.closing = false; return; }
    }
    var list = tv.tripList();
    var head = 70, foot = 52, gap = 5, n = Math.max(1, list.length);
    var rowH = Math.max(38, Math.min(56, Math.floor((cssH * 0.86 - head - foot) / n) - gap));
    var sw = Math.min(cssW, 560), sx = (cssW - sw) / 2, sh = head + n * (rowH + gap) + foot, sy = cssH - sh * k;
    c.save(); c.globalAlpha = 0.22 * k; c.fillStyle = '#1e1438'; c.fillRect(0, 0, cssW, cssH); c.restore();
    QT.UI.tapRect({ x: 0, y: 0, w: cssW, h: cssH }, function () { rsClose(); return true; });
    c.beginPath();
    c.moveTo(sx, sy + 20); c.arcTo(sx, sy, sx + 20, sy, 20); c.lineTo(sx + sw - 20, sy);
    c.arcTo(sx + sw, sy, sx + sw, sy + 20, 20); c.lineTo(sx + sw, cssH + 4); c.lineTo(sx, cssH + 4); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    QT.UI.tapRect({ x: sx, y: sy, w: sw, h: sh }, function () { return true; });
    H.fillRR(sx + sw / 2 - 20, sy + 7, 40, 4, 2, '#ddd8ea');
    c.save(); c.beginPath(); c.arc(sx + 32, sy + 38, 18, 0, 7); c.fillStyle = COL.line; c.fill(); c.restore();
    trainGlyph(c, sx + 32, sy + 37, 11, '#ffffff', COL.line);
    H.fitTxt(L.t('tripsheetTitle'), sx + 60, sy + 31, 17, sw - 124, COL.ink, 900, 11);
    H.fitTxt(L.t('tripsheetSub'), sx + 60, sy + 51, 11, sw - 124, COL.soft, 700, 8);
    var xb = { x: sx + sw - 52, y: sy + 14, w: 44, h: 44 };
    H.fillRR(xb.x + 8, xb.y + 8, 28, 28, 14, '#f0eef6');
    c.save(); c.strokeStyle = '#7d788f'; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(xb.x + 17, xb.y + 17); c.lineTo(xb.x + 27, xb.y + 27);
    c.moveTo(xb.x + 27, xb.y + 17); c.lineTo(xb.x + 17, xb.y + 27); c.stroke(); c.restore();
    QT.UI.tapRect(xb, function () { rsClose(); return true; });
    var x = sx + 12, w = sw - 24, y0 = sy + head;
    var flashOn = now() - rs.flashT < 2.2;
    list.forEach(function (d, i) {
      var y = y0 + i * (rowH + gap), h = rowH, cy = y + h / 2;
      var locked = !d.open && !d.ready, gold = d.ready, star = d.next;
      var bg = d.here ? '#eefaff' : gold ? '#fff6dc' : star ? '#fffaf0' : locked ? '#f3f1f6' : '#f6f4fb';
      H.fillRR(x, y, w, h, 14, bg);
      if (d.here) H.strokeRR(x + 1, y + 1, w - 2, h - 2, 13, COL.here, 2);
      else if (gold || star) H.strokeRR(x + 1, y + 1, w - 2, h - 2, 13, COL.gold, gold ? 3 : 2.5);
      var r = h * 0.34, cx = x + 10 + r;
      c.save();
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = locked ? COL.lock : d.color; c.fill();
      glyph(c, locked ? 'lock' : d.dist, cx, cy, r * (locked ? 0.5 : 0.6), locked ? '#8f89a3' : '#ffffff');
      c.restore();
      var right = x + w - 10, ph = Math.min(28, h - 14);
      if (d.here) right -= pill(H, c, L.t('routemapHere'), right, cy, ph, '#ffffff', '#bfe9f5', COL.here) + 6;
      else if (gold) right -= pill(H, c, L.t('tripsheetReady'), right, cy, ph, COL.gold, null, '#ffffff') + 6;
      else if (!locked) {
        var ft = d.pass ? L.t('tripsheetPass') : d.free || !(d.fare > 0) ? L.t('tripsheetFree') : L.t('tripsheetFare', { f: QT.G.fmt(d.fare) });
        right -= pill(H, c, ft, right, cy, ph, '#ffffff', '#e3dfec', d.free || d.pass ? '#1f9d63' : COL.ink) + 6;
      }
      if (star && !d.here) {
        var nt = L.t('tripsheetNext');
        c.save(); c.font = '900 10px ' + H.FONT; var nw = Math.ceil(c.measureText(nt).width) + 24; c.restore();
        var nx = right - nw, nh = 20;
        H.fillRR(nx, cy - nh / 2, nw, nh, nh / 2, COL.gold);
        starPath(c, nx + 10, cy, 5.2); c.fillStyle = '#ffffff'; c.fill();
        H.txt(nt, nx + 17, cy + 0.5, 10, '#ffffff', 'left', 900);
        right = nx - 6;
      }
      var tx = cx + r + 10, tw = Math.max(40, right - tx), sub = '', subCol = COL.soft;
      if (locked) { sub = d.cond || L.t('tripsheetLocked'); subCol = '#9a94ad'; }
      else if (gold) { sub = L.t('tripsheetOpenGo'); subCol = '#b07a00'; }
      if (flashOn && rs.flash === d.dist) { sub = locked ? (d.cond || L.t('tripsheetLocked')) : L.t('travelBusy'); subCol = C.red; }
      H.fitTxt(d.name, tx, sub ? cy - 8 : cy, 15, tw, locked ? '#8f89a3' : COL.ink, 900, 10);
      if (sub) H.fitTxt(sub, tx, cy + 10, 10.5, tw, subCol, 700, 8);
      QT.UI.tapRect({ x: x, y: y, w: w, h: h }, function () {
        if (!rsIsOpen() || d.here) return true;
        if (QT.Sfx) QT.Sfx.play(locked ? 'error' : 'click');
        if (tv.goTo(d.dist, rs.why === 'map' ? 'map' : 'hud')) rsClose();
        else { rs.flash = d.dist; rs.flashT = now(); }
        return true;
      });
    });
  }
  QT.UI.panel('tripsheet', {
    layer: 'sheet', open: rsOpen, close: rsClose, isOpen: rsIsOpen, draw: rsDraw,
    swipe: function (dx, dy) {
      if (!rsIsOpen() || dy < 50 || Math.abs(dy) < Math.abs(dx) * 1.2) return false;
      rsClose();
      return true;
    }
  });
  function fadeDraw(S, H) {
    var tv = TV(), f = tv && tv.fade ? tv.fade() : 0;
    if (!(f > 0)) return;
    QT.UI.tapRect({ x: 0, y: 0, w: H.cssW, h: H.cssH }, function () { return true; });
    if (QT.Render && QT.Render.drawsRideFade) return;
    var c = H.ctx, r = tv.ride, d = r && W.DIST[r.dist];
    c.save(); c.globalAlpha = f; c.fillStyle = '#141026'; c.fillRect(0, 0, H.cssW, H.cssH); c.restore();
    if (!d || f < 0.35) return;
    var a = Math.min(1, (f - 0.35) / 0.4), cx = H.cssW / 2, cy = H.cssH * 0.44;
    c.save(); c.globalAlpha = a;
    c.beginPath(); c.arc(cx, cy - 36, 21, 0, 7); c.fillStyle = dcol(d.id); c.fill();
    glyph(c, d.id, cx, cy - 36, 12, '#ffffff');
    txtIn(H, c, L.nm(d), cx, cy + 4, 20, H.cssW - 40, '#ffffff', 900, 'center');
    c.restore();
  }
  function regFade() { QT.UI.panel('rideFade', { layer: 'sheet', draw: fadeDraw }); }
  if (document.readyState === 'complete') regFade();
  else window.addEventListener('load', regFade);
})(window.QT || (window.QT = {}));
