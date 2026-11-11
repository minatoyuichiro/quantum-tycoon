(function (QT) {
  'use strict';
  var L = QT.L;
  function t(k, v) { return L.t(k, v); }
  L.add({
    av_tab:    ['実績', 'Awards'],
    av_count:  ['実績 {n} / {m}', 'Achievements {n} / {m}'],
    av_intro:  ['1つ取るたびに、不動産の決まりが1つ分かる。灰色はまだのもの', 'Each one teaches a real-estate rule. Grey ones are still to come'],
    av_new:    ['いま取った実績', 'Just earned'],
    av_when:   ['{y}年目 {m}月・{a}歳', 'Y{y} M{m} · age {a}'],
    av_before: ['実績ができる前', 'Before achievements'],
    av_hint:   ['ヒント: {h}', 'Hint: {h}'],
    av_more:   ['ほか{n}個', '+{n} more']
  });
  function G() { return QT.G; }
  var GOLD = '#d39a12', GREY = '#cfcadb';
  function glyph(c, x, y, col) {
    if (QT.FX && QT.FX.trophyGlyph) { QT.FX.trophyGlyph(c, x, y, col); return; }
    c.fillStyle = col; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
  }
  var LIFE = 4.5, q = [];
  G().on('achv', function (d) { if (d && d.id) q.push({ id: d.id, at: null, more: 0 }); });
  G().on('lifeBegin', function () { q.length = 0; });
  function current(S) {
    while (q.length) {
      var c = q[0];
      if (c.at == null || S.t < c.at) {
        c.at = S.t;
        if (q.length > 2) { c.more = q.length - 1; q.length = 1; }
        if (QT.Sfx && QT.Sfx.play) QT.Sfx.play('trophy');
      }
      if (S.t - c.at <= LIFE) return c;
      q.shift();
    }
    return null;
  }
  function chipText(c) {
    return t('av_done', { t: t('av_' + c.id) }) + (c.more ? '  ' + t('av_more', { n: c.more }) : '');
  }
  function drawChip(S, H, r, c) {
    var g = H.ctx, e = S.t - c.at, k = Math.max(0, 1 - e / LIFE);
    var pop = e < 0.6 ? 1 + 0.14 * Math.sin(e / 0.6 * Math.PI) : 1;
    g.save();
    if (pop !== 1) { g.translate(r.x + r.w / 2, r.y + r.h / 2); g.scale(pop, pop); g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); }
    H.glass(r.x, r.y, r.w, r.h, 10);
    g.save(); H.rr(r.x, r.y, r.w, r.h, 10); g.clip();
    g.fillStyle = '#fff4d6'; g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = GOLD; g.fillRect(r.x, r.y, 4, r.h);
    g.fillRect(r.x, r.y + r.h - 2.5, r.w * k, 2.5);
    g.restore();
    glyph(g, r.x + 16, r.y + r.h / 2 + 1, GOLD);
    H.fitTxt(chipText(c), r.x + 28, r.y + r.h / 2, 11.5, r.w - 34, '#5a4310', 900, 8.5);
    g.restore();
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () {
      q.length = 0;
      QT.UI.show('mypage', { tab: 'achv', hl: c.id });
      return true;
    });
  }
  if (QT.FX && QT.FX.addChip) QT.FX.addChip(function (S) {
    var c = current(S);
    if (!c) return null;
    var n = chipText(c).length;
    return { k: 'fx', id: 'achv', w: Math.max(150, Math.min(250, 40 + n * 11.5)), first: true,
             draw: function (S2, H, r) { drawChip(S2, H, r, c); } };
  });
  function lines(H, s, w, size, weight) {
    var c = H.ctx; c.save(); c.font = (weight || 700) + ' ' + size + 'px ' + H.FONT;
    var parts = String(s).match(/[\x21-\x7e¥]+|\s+|[^\s]/g) || [], cur = '', n = 0;
    parts.forEach(function (p0) {
      var tt = cur + p0;
      if (cur && c.measureText(tt).width > w) { n++; cur = p0.replace(/^\s+/, ''); }
      else cur = tt;
    });
    if (cur) n++;
    c.restore();
    return n;
  }
  function when(got) {
    if (!got || got.m == null) return t('av_before');
    return t('av_when', { y: Math.floor((got.m - 1) / 12) + 1, m: ((got.m - 1) % 12) + 1, a: got.age });
  }
  function item(S, H, k, it, y, hl) {
    var C = k.C, on = !!it.got, x = k.x + 26, w = k.w - 30;
    var body = on ? t('av_' + it.id + 'L') : t('av_hint', { h: t('av_' + it.id + 'H') });
    var bs = on ? 10.5 : 10, h = 30 + lines(H, body, w, bs, 700) * (bs + 5) + 6;
    k.card(y, h, hl ? '#ffefc2' : on ? '#fff8e6' : '#f5f4f8');
    glyph(H.ctx, k.x + 10, y + 17, on ? GOLD : GREY);
    var dt = on ? when(it.got) : '';
    H.ctx.save(); H.ctx.font = '700 10px ' + H.FONT;
    var dw = dt ? H.ctx.measureText(dt).width + 8 : 0; H.ctx.restore();
    H.fitTxt(t('av_' + it.id), x, y + 16, 12.5, k.w - 26 - dw, on ? C.ink : '#a19cb2', on ? 900 : 800, 8);
    if (dt) H.txt(dt, k.x + k.w, y + 16, 10, on ? '#a07a12' : C.soft, 'right', 700);
    k.wrap(body, x, y + 35, w, bs, on ? '#6d6880' : '#aaa5bb', 700);
    return y + h + 6;
  }
  function draw(S, H, k, arg) {
    var C = k.C, y = k.y + 4, A = G().achv;
    if (!A || !S.achv) return y;
    S.achv.unseen = 0;
    var cn = A.count(), all = A.list();
    k.text(t('av_count', { n: cn.n, m: cn.m }), k.x, y + 10, 13.5, C.ink, 900);
    H.fillRR(k.x, y + 24, k.w, 6, 3, '#eeeaf6');
    if (cn.n) H.fillRR(k.x, y + 24, Math.max(6, k.w * cn.n / Math.max(1, cn.m)), 6, 3, GOLD);
    y = k.wrap(t('av_intro'), k.x, y + 46, k.w, 10.5, C.soft, 700) + 6;
    var hl = arg && arg.hl && S.achv.got[arg.hl] ? arg.hl : null;
    if (hl) {
      H.txt(t('av_new'), k.x, y + 6, 10.5, '#a07a12', 'left', 900);
      y = item(S, H, k, { id: hl, got: S.achv.got[hl] }, y + 14, true) + 6;
      y = k.hr(y);
    }
    var got = all.filter(function (it) { return it.got; }).sort(function (a, b) {
      return (a.got.m == null ? -1 : a.got.m) - (b.got.m == null ? -1 : b.got.m);
    });
    got.concat(all.filter(function (it) { return !it.got; })).forEach(function (it) { y = item(S, H, k, it, y, false); });
    return y + 56;
  }
  QT.Achv = { draw: draw };
})(window.QT || (window.QT = {}));
