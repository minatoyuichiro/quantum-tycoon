(function (QT) {
  'use strict';
  var L = QT.L;
  var INK = '#2f2c46', SOFT = '#7d788f', LINE = '#ece8f4';
  var C = { ink: INK, soft: SOFT, line: LINE, ok: '#2a8a5a', bad: '#c0504a', blue: '#2b7fd8', gold: '#c98f0f',
            violet: '#6f57e0', card: '#f7f5fc', navy: '#1f5fbf' };
  function now() { return performance.now() / 1000; }
  function ease(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  var ALL = {};
  function make(id, def) {
    var st = { open: false, closing: false, t: 0, arg: null, scroll: 0, maxScroll: 0, tab: def.tabs ? def.tabs[0].id : null };
    function open(arg) {
      st.arg = arg; st.scroll = 0;
      if (def.tabs && (!st.open || st.closing)) st.tab = def.tabs[0].id;
      if (!st.open || st.closing) { st.open = true; st.closing = false; st.t = now(); }
      Object.keys(ALL).forEach(function (o) { if (o !== id && ALL[o].isOpen()) ALL[o].close(); });
      ['phone', 'routemap', 'tripsheet'].forEach(function (o) {
        var p = QT.UI.get(o);
        if (o !== id && p && p.isOpen && p.isOpen() && p.close) p.close();
      });
      if (def.onOpen) def.onOpen(arg, st);
      if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('click');
    }
    function close() { if (st.open && !st.closing) { st.closing = true; st.t = now(); } }
    function isOpen() { return st.open && !st.closing; }
    function draw(S, H) {
      if (!st.open) return;
      if (S.won || S.showFinance && id !== 'finance') { st.open = false; st.closing = false; return; }
      var c = H.ctx, cssW = H.cssW, cssH = H.cssH;
      var k0 = ease((now() - st.t) / 0.22);
      if (st.closing) { k0 = 1 - k0; if (k0 <= 0) { st.open = false; st.closing = false; return; } }
      var sw = Math.min(cssW, 560), sx = (cssW - sw) / 2, sh = Math.round(cssH * (def.height || 0.74)), sy = cssH - sh * k0;
      c.save(); c.globalAlpha = 0.22 * k0; c.fillStyle = '#1e1438'; c.fillRect(0, 0, cssW, cssH); c.restore();
      QT.UI.tapRect({ x: 0, y: 0, w: cssW, h: cssH }, function () { close(); return true; });
      function sheetPath(oy) {
        c.beginPath();
        c.moveTo(sx, sy + oy + 20); c.arcTo(sx, sy + oy, sx + 20, sy + oy, 20); c.lineTo(sx + sw - 20, sy + oy);
        c.arcTo(sx + sw, sy + oy, sx + sw, sy + oy + 20, 20);
        c.lineTo(sx + sw, cssH + 4); c.lineTo(sx, cssH + 4); c.closePath();
      }
      sheetPath(-3); c.fillStyle = 'rgba(40,30,70,0.10)'; c.fill();
      sheetPath(0); c.fillStyle = '#ffffff'; c.fill();
      QT.UI.tapRect({ x: sx, y: sy, w: sw, h: sh }, function () { return true; });
      H.fillRR(sx + sw / 2 - 20, sy + 7, 40, 4, 2, '#ddd8ea');
      var title = def.title ? def.title(S, st.arg) : '', sub = def.sub ? def.sub(S, st.arg) : '';
      H.fitTxt(title, sx + 18, sy + 30, 16, sw - 80, INK, 900, 10);
      if (sub) H.fitTxt(sub, sx + 18, sy + 50, 10.5, sw - 40, SOFT, 700, 8);
      var xb = { x: sx + sw - 50, y: sy + 8, w: 44, h: 44 };
      H.fillRR(xb.x + 8, xb.y + 8, 28, 28, 14, '#f0eef6');
      c.save(); c.strokeStyle = SOFT; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(xb.x + 17, xb.y + 17); c.lineTo(xb.x + 27, xb.y + 27);
      c.moveTo(xb.x + 27, xb.y + 17); c.lineTo(xb.x + 17, xb.y + 27); c.stroke(); c.restore();
      QT.UI.tapRect(xb, function () { close(); return true; });
      var top = sy + 62;
      if (def.tabs) {
        var tabs = def.tabs.filter(function (tb) { return !tb.show || tb.show(S, st.arg); });
        var tw = (sw - 28) / tabs.length;
        tabs.forEach(function (tb, i) {
          var r = { x: sx + 14 + i * tw, y: top, w: tw - 4, h: 30 }, on = st.tab === tb.id;
          H.fillRR(r.x, r.y, r.w, r.h, 10, on ? C.navy : '#f0eef6');
          H.txt(L.nm(tb, 'label'), r.x + r.w / 2, r.y + 15, tabs.length > 3 ? 10.5 : 11.5, on ? '#ffffff' : SOFT, 'center', 800);
          QT.UI.tapRect(r, function () { st.tab = tb.id; st.scroll = 0; if (QT.Sfx) QT.Sfx.play('click'); return true; });
        });
        top += 38;
      } else {
        c.fillStyle = LINE; c.fillRect(sx + 14, top - 2, sw - 28, 1);
      }
      var area = { x: sx, y: top, w: sw, h: sy + sh - top - 8 };
      c.save(); c.beginPath(); c.rect(area.x, area.y, area.w, area.h); c.clip();
      var k = kit(H, area, st);
      var used = 0;
      try { used = def.body(S, H, k, st.arg, st.tab) || 0; } catch (e) { if (!st.err) { st.err = 1; console.error('[sheet] ' + id, e); } }
      c.restore();
      st.maxScroll = Math.max(0, used - area.h + 12);
      if (st.scroll > st.maxScroll) st.scroll = st.maxScroll;
      if (st.maxScroll > 0) {
        var bh = area.h * area.h / (used + 12), by = area.y + (area.h - bh) * (st.scroll / st.maxScroll);
        H.fillRR(sx + sw - 6, by, 3, bh, 1.5, '#d6d2e0');
      }
    }
    function kit(H, area, st) {
      var off = -st.scroll;
      function vis(r) { return r.y + r.h > area.y && r.y < area.y + area.h; }
      var k = {
        x: area.x + 16, y: area.y + 6 + off, w: area.w - 32, h: area.h, C: C,
        text: function (s, x, y, size, col, weight, min) { H.fitTxt(s, x, y, size || 11, k.x + k.w - x, col || INK, weight || 700, min || 7.5); },
        rtext: function (s, x, y, size, col, weight) { H.txt(s, x, y, size || 11, col || INK, 'right', weight || 800); },
        line: function (label, value, y, col, size) {
          H.fitTxt(label, k.x, y, size || 11, k.w * 0.55, SOFT, 700, 7.5);
          H.txt(value, k.x + k.w, y, size || 11.5, col || INK, 'right', 800);
          return y + (size ? size + 8 : 19);
        },
        card: function (y, h, col, x, w) { H.fillRR(x != null ? x : k.x - 6, y, w != null ? w : k.w + 12, h, 12, col || C.card); },
        btn: function (r, label, col, fn, enabled) {
          var en = enabled !== false;
          H.fillRR(r.x, r.y + 2, r.w, r.h, 12, en ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.04)');
          H.fillRR(r.x, r.y, r.w, r.h, 12, en ? (col || C.navy) : '#d6d2e0');
          var ctx = H.ctx; ctx.save(); ctx.font = '900 12px ' + H.FONT;
          var tw = ctx.measureText(label).width; ctx.restore();
          var sz = tw > r.w - 12 ? Math.max(8, 12 * (r.w - 12) / tw) : 12;
          H.txt(label, r.x + r.w / 2, r.y + r.h / 2, sz, '#ffffff', 'center', 900);
          if (vis(r)) QT.UI.tapRect(r, function () {
            if (!en) { if (QT.Sfx) QT.Sfx.play('bad'); return true; }
            if (QT.Sfx) QT.Sfx.play('click');
            fn(); return true;
          });
        },
        chips: function (list, sel, y, fn, h) {
          var x = k.x, hh = h || 28;
          list.forEach(function (it) {
            var ctx = H.ctx; ctx.save(); ctx.font = '800 11px ' + H.FONT;
            var w = Math.max(44, ctx.measureText(it.label).width + 20); ctx.restore();
            if (x + w > k.x + k.w) { x = k.x; y += hh + 6; }
            var r = { x: x, y: y, w: w, h: hh }, on = sel === it.id;
            H.fillRR(r.x, r.y, r.w, r.h, hh / 2, on ? (it.col || C.navy) : '#f0eef6');
            if (it.dim && !on) H.fillRR(r.x, r.y, r.w, r.h, hh / 2, 'rgba(255,255,255,0.5)');
            H.txt(it.label, r.x + w / 2, r.y + hh / 2, 11, on ? '#ffffff' : it.dim ? '#b5b0c6' : INK, 'center', 800);
            if (vis(r)) QT.UI.tapRect(r, function () { fn(it.id); if (QT.Sfx) QT.Sfx.play('click'); return true; });
            x += w + 6;
          });
          return y + hh + 8;
        },
        wrap: function (s, x, y, w, size, col, weight) {
          var ctx = H.ctx; ctx.save(); ctx.font = (weight || 700) + ' ' + (size || 10.5) + 'px ' + H.FONT;
          var parts = String(s).match(/[\x21-\x7e¥]+|\s+|[^\s]/g) || [], cur = '', lines = [];
          parts.forEach(function (p0) {
            var t = cur + p0;
            if (cur && ctx.measureText(t).width > w) { lines.push(cur.replace(/\s+$/, '')); cur = p0.replace(/^\s+/, ''); }
            else cur = t;
          });
          if (cur) lines.push(cur);
          ctx.restore();
          lines.forEach(function (ln, i) { H.txt(ln, x, y + i * ((size || 10.5) + 5), size || 10.5, col || SOFT, 'left', weight || 700); });
          return y + lines.length * ((size || 10.5) + 5);
        },
        hr: function (y) { H.ctx.fillStyle = LINE; H.ctx.fillRect(k.x, y, k.w, 1); return y + 8; },
        tap: function (r, fn) {
          var y0 = Math.max(r.y, area.y), y1 = Math.min(r.y + r.h, area.y + area.h);
          if (y1 > y0) QT.UI.tapRect({ x: r.x, y: y0, w: r.w, h: y1 - y0 }, fn);
        },
        used: function (y) { return y - (area.y + off); },
        close: close
      };
      return k;
    }
    var panel = QT.UI.panel(id, {
      layer: 'sheet', open: open, close: close, isOpen: isOpen, draw: draw,
      arg: function () { return st.arg; },
      drag: function (dx, dy) { if (!isOpen()) return; st.dragged = (st.dragged || 0) + Math.abs(dy); st.scroll = Math.max(0, Math.min(st.maxScroll, st.scroll - dy)); },
      wheel: function (dy) { if (!isOpen() || !dy) return false; st.scroll = Math.max(0, Math.min(st.maxScroll, st.scroll + dy)); return true; },
      dragEnd: function () { },
      swipe: function (dx, dy) {
        var moved = st.dragged || 0; st.dragged = 0;
        if (!isOpen()) return false;
        if (dy > 60 && Math.abs(dy) > Math.abs(dx) * 1.2 && (st.maxScroll <= 0 || st.scroll <= 0 && moved < 8)) { close(); return true; }
        return false;
      }
    });
    ALL[id] = panel;
    return panel;
  }
  QT.UI.show = function (id, arg) { var p = QT.UI.get(id); if (p && p.open) p.open(arg); };
  QT.Sheet = { make: make, C: C, all: ALL };
})(window.QT || (window.QT = {}));
