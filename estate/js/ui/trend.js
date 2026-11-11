(function (QT) {
  'use strict';
  var L = QT.L;
  function t(k, v) { return L.t(k, v); }
  L.add({
    tr_tab:      ['推移', 'Trends'],
    tr_r2:       ['2年', '2 yrs'],
    tr_r10:      ['10年', '10 yrs'],
    tr_all:      ['ぜんぶ', 'All'],
    tr_empty:    ['最初の月末から線が引かれます（1か月は10秒）', 'Lines start at the first month end (a month is 10 s)'],
    tr_hint:     ['図を押すと、その月の数が出ます', 'Tap a chart to see that month'],
    tr_pickHd:   ['{y}年目 {m}月（{a}歳）の数・もう一度押すと消える', 'Year {y} M{m} (age {a}) · tap again to clear'],
    tr_noOld:    ['借入と現金は、この画面ができてからの記録です', 'Debt and cash are recorded from this version on'],
    tr_cf:       ['家賃の手取り（毎月）', 'Net rent (monthly)'],
    tr_net:      ['純資産', 'Net worth'],
    tr_debt:     ['借入の残高', 'Debt'],
    tr_cash:     ['現金', 'Cash'],
    tr_l_cf:     ['家賃から管理費・修繕・返済などを引いて、毎月手元に残るお金。点線を3か月続けて越えたら経済的自由',
                  'Rent minus fees, repairs and loan payments — what you keep each month. Stay above the dotted line for 3 months to be free'],
    tr_l_net:    ['純資産＝物件を今売った値段＋現金−借入。返済で借入が減ると増え、建物が古くなると下がる',
                  'Net worth = what your properties would sell for + cash − debt. Repaying lifts it; ageing buildings pull it down'],
    tr_l_debt:   ['ローンは毎月の返済で減っていく。はじめは返済のうち利息が多いので、元金はゆっくり減る',
                  'Each payment shrinks the loan. Early payments are mostly interest, so the principal falls slowly at first'],
    tr_l_cash:   ['手元のお金。急な修繕や空室に備えて、生活費の数か月ぶんは残そう',
                  'Cash on hand. Keep a few months of living costs for sudden repairs and empty rooms'],
    tr_need:     ['経済的自由の線 {v}', 'Freedom line {v}'],
    tr_peakNext: ['次の山 {v}', 'Next peak {v}'],
    tr_free:     ['経済的自由', 'Free'],
    tr_retire:   ['定年', 'Retired'],
    tr_bizEnd:   ['引退', 'Retired'],
    tr_inherit:  ['相続', 'Inherited'],
    tr_age:      ['{a}歳', 'age {a}']
  });
  function G() { return QT.G; }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + G().fmt(Math.abs(Math.round(v))); }
  function axis(v) {
    if (!v) return '0';
    return G().fmt(v).replace(/(\.\d*?)0+(?=\D*$)/, '$1').replace(/\.(?=\D*$)/, '');
  }
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  var st = { range: 'y10', pick: null };
  var RANGES = { y2: 24, y10: 120, all: 0 };
  var COL = { cf: '#2a9d63', net: '#6f57e0', debt: '#d0603a', cash: '#2b7fd8' };
  var GOLD = '#d39a12', MARK = '#a29cb5';
  function monthInfo(S, m) {
    var lf = S.life, a0 = (lf.age || 0) - Math.floor((lf.months || 0) / 12);
    return { y: Math.floor((m - 1) / 12) + 1, mo: ((m - 1) % 12) + 1, age: a0 + Math.floor(m / 12) };
  }
  function draw(S, H, k) {
    var C = k.C, y = k.y + 4, h = S.fin && S.fin.hist;
    y = k.chips([{ id: 'y2', label: t('tr_r2') }, { id: 'y10', label: t('tr_r10') }, { id: 'all', label: t('tr_all') }], st.range, y,
                function (id) { st.range = id; st.pick = null; });
    if (!h || h.cf.length < 2) return k.wrap(t('tr_empty'), k.x, y + 6, k.w, 11, C.soft) + 8;
    var n = h.cf.length, mEnd = h.m0 + n - 1, want = RANGES[st.range] || n;
    var span = Math.max(12, Math.min(want, n));
    var dom = n >= span ? { m1: mEnd - span + 1, m2: mEnd } : { m1: h.m0, m2: h.m0 + span - 1 };
    dom.end = mEnd;
    if (st.pick != null && (st.pick < Math.max(dom.m1, h.m0) || st.pick > mEnd)) st.pick = null;
    if (st.pick != null) {
      var mi = monthInfo(S, st.pick);
      y = k.wrap(t('tr_pickHd', { y: mi.y, m: mi.mo, a: mi.age }), k.x, y + 4, k.w, 10.5, C.ink, 800) + 4;
    } else y = k.wrap(t('tr_hint'), k.x, y + 4, k.w, 10.5, C.soft, 700) + 4;
    if (h.debt[0] == null && h.m0 >= dom.m1) y = k.wrap(t('tr_noOld'), k.x, y, k.w, 9.5, C.soft, 700) + 4;
    var lf = S.life, g = G();
    var ev = (h.ev || []).filter(function (e) { return e.m >= dom.m1 && e.m <= dom.m2; });
    function evOf(kinds, label) {
      return ev.filter(function (e) { return kinds.indexOf(e.k) >= 0; }).map(function (e) {
        var lb = !label ? '' : e.k === 'free' ? t('tr_free') : e.k === 'retire' ? t(lf.kind === 'founder' ? 'tr_bizEnd' : 'tr_retire')
               : e.k === 'inherit' ? t('tr_inherit') : e.k === 'peak' ? axis(e.v || 0) : '';
        return { m: e.m, k: e.k, label: lb };
      });
    }
    var refsCf = [{ v: g.freeNeed ? g.freeNeed() : lf.living, label: t('tr_need', { v: yen(g.freeNeed ? g.freeNeed() : lf.living) }) }];
    var refsNet = [];
    if (lf.free && g.peakTarget) { var pt = g.peakTarget(lf.peak || 0); refsNet.push({ v: pt, label: t('tr_peakNext', { v: yen(pt) }) }); }
    y = chart(S, H, k, y + 2, h, dom, { key: 'cf', title: t('tr_cf'), lesson: t('tr_l_cf'), refs: refsCf,
                                        marks: evOf(['free'], true) });
    y = chart(S, H, k, y, h, dom, { key: 'net', title: t('tr_net'), lesson: t('tr_l_net'), refs: refsNet,
                                    marks: evOf(['free', 'retire', 'inherit'], true), dots: evOf(['peak'], true) });
    y = chart(S, H, k, y, h, dom, { key: 'debt', title: t('tr_debt'), lesson: t('tr_l_debt'), refs: [],
                                    marks: evOf(['free'], false) });
    y = chart(S, H, k, y, h, dom, { key: 'cash', title: t('tr_cash'), lesson: t('tr_l_cash'), refs: [],
                                    marks: evOf(['free'], false).concat(evOf(['retire', 'inherit'], true)) });
    return y + 56;
  }
  function chart(S, H, k, y, h, dom, o) {
    var C = k.C, c = H.ctx, arr = h[o.key], col = COL[o.key];
    var top = y, px = k.x, pw = k.w - 6, ph = 92;
    function val(m) { var i = m - h.m0; return i >= 0 && i < arr.length && arr[i] != null ? arr[i] * 1000 : null; }
    var mNow = st.pick != null ? st.pick : dom.end, vNow = val(mNow);
    function X(m) { return px + (m - dom.m1) / Math.max(1, dom.m2 - dom.m1) * pw; }
    var lay = [], rows = 0;
    var lbls = (o.marks || []).filter(function (e) { return e.label; }).concat((o.dots || []).slice().reverse());
    lbls.sort(function (a, b) { return pri(a) - pri(b); });
    c.save(); c.font = '800 9.5px ' + H.FONT;
    lbls.forEach(function (e) {
      var w = c.measureText(e.label).width + 4, cx = Math.max(px + w / 2, Math.min(px + pw - w / 2, X(e.m)));
      var a = cx - w / 2, b = cx + w / 2;
      for (var r = 0; r < 2; r++) {
        if (lay.some(function (u) { return u.r === r && a < u.b + 3 && b > u.a - 3; })) continue;
        lay.push({ e: e, cx: cx, a: a, b: b, r: r }); rows = Math.max(rows, r + 1); return;
      }
    });
    c.restore();
    var nLines = wrapLines(c, H.FONT, o.lesson, k.w - 4, 10, 700);
    k.card(top, 30 + rows * 12 + ph + 26 + nLines * 15 + 6);
    H.txt(o.title, k.x + 2, y + 14, 12.5, C.ink, 'left', 900);
    H.txt(vNow == null ? '—' : yen(vNow), k.x + k.w - 2, y + 14, 13, vNow != null && vNow < 0 ? C.bad : C.ink, 'right', 900);
    y += 30 + rows * 12;
    var py = y;
    var lo = 0, hi = 0, any = false;
    for (var m = Math.max(dom.m1, h.m0); m <= dom.m2; m++) { var v = val(m); if (v == null) continue; any = true; if (v < lo) lo = v; if (v > hi) hi = v; }
    (o.refs || []).forEach(function (r) { if (r.v > hi) hi = r.v; if (r.v < lo) lo = r.v; });
    if (hi - lo <= 0) hi = lo + 100000;
    var step = niceStep((hi - lo) / 3);
    hi = Math.ceil(hi / step - 1e-9) * step; lo = Math.floor(lo / step + 1e-9) * step;
    if (hi === lo) hi = lo + step;
    function Y(v) { return py + ph - (v - lo) / (hi - lo) * ph; }
    c.save();
    for (var gv = lo; gv <= hi + step * 0.01; gv += step) {
      c.fillStyle = Math.abs(gv) < step * 0.01 ? '#cfc9dc' : '#ebe7f2';
      c.fillRect(px, Math.round(Y(gv)), pw, 1);
    }
    c.restore();
    var mS = Math.max(dom.m1, h.m0), every = Math.max(1, Math.ceil((dom.end - mS + 1) / 320));
    var pts = [];
    for (m = mS; m <= dom.end; m++) {
      if ((m - mS) % every && m !== dom.end) continue;
      pts.push([m, val(m)]);
    }
    c.save();
    c.beginPath(); c.rect(px - 1, py - 2, pw + 2, ph + 4); c.clip();
    var y0 = Y(Math.max(lo, Math.min(hi, 0)));
    function runs(fn) {
      var run = [];
      pts.forEach(function (p) { if (p[1] == null) { if (run.length) fn(run); run = []; } else run.push(p); });
      if (run.length) fn(run);
    }
    runs(function (run) {
      c.beginPath(); c.moveTo(X(run[0][0]), y0);
      run.forEach(function (p) { c.lineTo(X(p[0]), Y(p[1])); });
      c.lineTo(X(run[run.length - 1][0]), y0); c.closePath();
      c.globalAlpha = 0.10; c.fillStyle = col; c.fill(); c.globalAlpha = 1;
    });
    c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = col;
    runs(function (run) {
      c.beginPath();
      run.forEach(function (p, i) { if (i) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); });
      if (run.length === 1) c.lineTo(X(run[0][0]) + 0.5, Y(run[0][1]));
      c.stroke();
    });
    (o.refs || []).forEach(function (r) {
      var ry = Math.round(Y(r.v)) + 0.5;
      c.setLineDash([5, 4]); c.lineWidth = 1.5; c.strokeStyle = GOLD;
      c.beginPath(); c.moveTo(px, ry); c.lineTo(px + pw, ry); c.stroke(); c.setLineDash([]);
    });
    (o.marks || []).forEach(function (e) {
      var mx = Math.round(X(e.m)) + 0.5;
      c.setLineDash([3, 3]); c.lineWidth = e.k === 'free' ? 1.5 : 1; c.strokeStyle = e.k === 'free' ? GOLD : MARK;
      c.beginPath(); c.moveTo(mx, py); c.lineTo(mx, py + ph); c.stroke(); c.setLineDash([]);
    });
    if (st.pick != null) {
      var kx = Math.round(X(st.pick)) + 0.5;
      c.lineWidth = 1; c.strokeStyle = 'rgba(47,44,70,0.55)';
      c.beginPath(); c.moveTo(kx, py); c.lineTo(kx, py + ph); c.stroke();
    }
    c.restore();
    (o.dots || []).forEach(function (e) {
      var v = val(e.m); if (v == null) return;
      dot(c, X(e.m), Y(v), GOLD, 4);
    });
    if (vNow != null) dot(c, X(mNow), Y(vNow), col, 4);
    var marks = [hi]; if (lo < 0) marks.push(0, lo); else marks.push(lo);
    marks.forEach(function (gv) { H.txt(axis(gv), px + 2, Y(gv) + (gv === hi ? 7 : -7), 9, C.soft, 'left', 800, '#ffffff'); });
    (o.refs || []).forEach(function (r) {
      var ry = Y(r.v); H.txt(r.label, px + pw - 2, ry < py + 10 ? ry + 8 : ry - 7, 9.5, C.ink, 'right', 800, '#ffffff');
    });
    lay.forEach(function (u) {
      H.txt(u.e.label, u.cx, py - 8 - u.r * 12, 9.5, u.e.k === 'free' || u.e.k === 'peak' ? '#9a6b00' : C.soft, 'center', 800);
    });
    var lf = S.life, yrs = (dom.m2 - dom.m1) / 12, ys = [1, 2, 5, 10, 20].filter(function (s) { return yrs / s <= 5; })[0] || 20;
    var ty = py + ph + 9;
    for (m = dom.m1; m <= dom.m2; m++) {
      if (m % 12) continue;
      var ag = monthInfo(S, m).age;
      if (ag % ys) continue;
      var tx = X(m);
      c.fillStyle = '#cfc9dc'; c.fillRect(Math.round(tx), py + ph, 1, 4);
      H.txt(t('tr_age', { a: ag }), Math.max(px + 12, Math.min(px + pw - 14, tx)), ty, 9, C.soft, 'center', 700);
    }
    k.tap({ x: px, y: py - 4, w: pw, h: ph + 16 }, function (p) {
      var mm = Math.round(dom.m1 + (p.x - px) / pw * (dom.m2 - dom.m1));
      mm = Math.max(Math.max(dom.m1, h.m0), Math.min(dom.end, mm));
      st.pick = st.pick === mm ? null : mm;
      if (QT.Sfx) QT.Sfx.play('click');
      return true;
    });
    y = py + ph + 26;
    y = k.wrap(o.lesson, k.x + 2, y, k.w - 4, 10, C.soft, 700);
    return y + 6 + 14;
  }
  function wrapLines(c, font, s, w, size, weight) {
    c.save(); c.font = weight + ' ' + size + 'px ' + font;
    var parts = String(s).match(/[\x21-\x7e¥]+|\s+|[^\s]/g) || [], cur = '', n = 0;
    parts.forEach(function (p0) {
      var tt = cur + p0;
      if (cur && c.measureText(tt).width > w) { n++; cur = p0.replace(/^\s+/, ''); }
      else cur = tt;
    });
    c.restore();
    return n + (cur ? 1 : 0);
  }
  function pri(e) { return e.k === 'free' ? 0 : e.k === 'retire' || e.k === 'inherit' ? 1 : 2; }
  function dot(c, x, y, col, r) {
    c.beginPath(); c.arc(x, y, r + 2, 0, 7); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill();
  }
  QT.Trend = { draw: draw, state: st };
})(window.QT || (window.QT = {}));
