(function (QT) {
  'use strict';
  var L = QT.L;
  function t(k, v) { return L.t(k, v); }
  function G() { return QT.G; }
  function fmt(v) { return QT.G.fmt(Math.round(v)); }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + fmt(Math.abs(v)); }
  L.add({
    cc_title:   ['大規模修繕の積立金が足りない', 'The repair fund is short'],
    cc_sub:     ['{n}・築{a}年（{c}年ごとの大規模修繕）', '{n} · {a} yrs old (major repairs every {c} yrs)'],
    cc_what:    ['外壁の塗り直し・屋上の防水・給排水管などを、まとめて直す工事。お金は修繕積立金から出す', 'Repainting, roof waterproofing, pipes — all fixed at once, paid from the repair fund'],
    cc_work:    ['工事費（あなたの部屋のぶん）', 'Works (your share)'],
    cc_fund:    ['積立金の残りから', 'From the fund'],
    cc_short:   ['足りない分', 'Shortfall'],
    cc_rooms:   ['（{n}室ぶん）', '({n} units)'],
    cc_vote:    ['管理組合の総会で、足りない分の集め方を決める', 'The owners vote on how to cover the shortfall'],
    cc_lump:    ['一時金をまとめて払う {v}', 'Pay a one-off levy {v}'],
    cc_lumpL:   ['いま手元から払う。毎月の手取りは変わらない', 'Paid from cash now; your monthly net stays the same'],
    cc_loan:    ['積立金を上げて10年で返す 月+{v}', 'Raise the fee: +{v}/mo for 10 yrs'],
    cc_loanL:   ['管理組合が借りて返す。利息のぶん合計は {v} と少し多く、10年間 毎月の手取りが減る', 'The association borrows: {v} in total (interest), and your monthly net drops for 10 yrs'],
    cc_noCash:  ['手元が足りない（一時金は {v}）', 'Not enough cash (levy {v})'],
    cc_lesson:  ['新築の安い積立金は、あとで上がる前提のことが多い。買う前に積立金の残高と長期修繕計画（重要事項調査報告書）を見よう',
                 'Cheap repair fees in new buildings usually rise later. Before buying, check the fund balance and the long-term repair plan'],
    cc_due:     ['決めないと{n}か月後に一時金になる', 'If you do not decide, the levy is charged in {n} mo'],
    cc_cAsk:    ['総会: 一時金の相談', 'Owners vote: levy'],
    cc_cRaise:  ['積立金の値上げ 月+{v}', 'Repair fee up +{v}/mo'],
    cc_cBig:    ['大規模修繕（積立金で足りた）', 'Major repairs (fund was enough)'],
    cc_cLump:   ['一時金 {v} を払った', 'Paid levy {v}'],
    cc_cLoan:   ['積立金に上乗せ 月+{v}', 'Fee +{v}/mo (10 yrs)'],
    cc_months:  ['あと{n}か月', '{n} mo left'],
    cc_toastRaise:['修繕積立金 +{v}/月', 'Repair fee +{v}/mo']
  });
  function askOf(S) { var c = G().condo; return c && S.condo ? c.ask() : null; }
  var card = QT.Sheet.make('condocard', {
    height: 0.74,
    title: function () { return t('cc_title'); },
    sub: function (S) {
      var a = askOf(S), c = G().condo, ps = a ? c.askRooms(a) : [];
      return ps.length ? t('cc_sub', { n: c.bldgName(ps[0]), a: a.age, c: a.cycle }) : '';
    },
    body: function (S, H, k) {
      var a = askOf(S), c = G().condo, C = k.C, y = k.y + 4;
      var ps = a ? c.askRooms(a) : [];
      if (!a || !ps.length) { card.close(); return 0; }
      var work = 0, levy = 0, add = 0;
      ps.forEach(function (q) { work += c.workOf(q); levy += c.levyOf(q, a.n); add += c.loanPlan(q, a.n); });
      y = k.wrap(t('cc_what'), k.x, y + 8, k.w, 10.5, C.soft) + 4;
      k.card(y, 74, '#fff4ea');
      k.x += 4; k.w -= 8;
      var yy = k.line(t('cc_work') + (ps.length > 1 ? t('cc_rooms', { n: ps.length }) : ''), yen(work), y + 16);
      yy = k.line(t('cc_fund'), yen(work - levy), yy, C.ok);
      k.line(t('cc_short'), yen(levy), yy, C.bad, 13);
      k.x -= 4; k.w += 8;
      y += 82;
      y = k.wrap(t('cc_vote'), k.x, y + 4, k.w, 11, C.ink, 800) + 6;
      var can = S.coins >= levy;
      k.btn({ x: k.x, y: y, w: k.w, h: 42 }, t('cc_lump', { v: '-' + yen(levy) }), '#1f5fbf', function () { c.decide(0); card.close(); }, can);
      y += 54;
      y = k.wrap(can ? t('cc_lumpL') : t('cc_noCash', { v: yen(levy) }), k.x, y, k.w, 9.5, can ? C.soft : C.bad) + 10;
      k.btn({ x: k.x, y: y, w: k.w, h: 42 }, t('cc_loan', { v: yen(add) }), '#f2a63b', function () { c.decide(1); card.close(); });
      y += 54;
      y = k.wrap(t('cc_loanL', { v: yen(add * QT.Data.ESTATE.CONDO.loanYears * 12) }), k.x, y, k.w, 9.5, C.soft) + 8;
      y = k.wrap(t('cc_lesson'), k.x, y + 2, k.w, 10.5, C.ink, 800) + 6;
      y = k.wrap(t('cc_due', { n: Math.max(1, a.until - S.fin.month) }), k.x, y, k.w, 9.5, C.gold, 800) + 4;
      return k.used(y);
    }
  });
  QT.UI.panel('condocardWatch', { layer: 'hud', draw: function (S) {
    var a = askOf(S);
    if (!a || a.seen || card.isOpen() || (S.trb && S.trb.ask) || (QT.UI.open && QT.UI.open()) || S.won) return;
    if (!G().condo.askRooms(a).length) return;
    a.seen = true;
    card.open();
  } });
  var LIFE = 5, q = [];
  function push(kind, d) { if (d && d.p) q.push({ kind: kind, d: d, at: null }); }
  G().on('condoRaise', function (d) {
    push('raise', d);
    if (d && d.p && G().estate) G().toast(G().estate.pos(d.p), t('cc_toastRaise', { v: yen(d.to - d.from) }), '#f2a63b');
  });
  G().on('condoBig', function (d) { push('big', d); });
  G().on('condoLevy', function (d) { if (d && !d.auto) push(d.mode === 'loan' ? 'loan' : 'lump', d); });
  G().on('lifeBegin', function () { q.length = 0; });
  function current(S) {
    while (q.length) {
      var c = q[0];
      if (c.at == null || S.t < c.at) c.at = S.t;
      if (S.t - c.at <= LIFE) return c;
      q.shift();
    }
    return null;
  }
  function bldg(g, x, y, col) {
    g.fillStyle = col;
    g.fillRect(x - 6, y - 7, 12, 14);
    g.fillStyle = '#ffffff';
    for (var i = 0; i < 3; i++) { g.fillRect(x - 4, y - 5 + i * 4, 3, 2); g.fillRect(x + 1, y - 5 + i * 4, 3, 2); }
  }
  function chip(S, H, r, o) {
    var g = H.ctx;
    var pop = S.t - o.at < 0.6 ? 1 + 0.12 * Math.sin((S.t - o.at) / 0.6 * Math.PI) : 1;
    g.save();
    if (pop !== 1) { g.translate(r.x + r.w / 2, r.y + r.h / 2); g.scale(pop, pop); g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); }
    H.glass(r.x, r.y, r.w, r.h, 10);
    g.save(); H.rr(r.x, r.y, r.w, r.h, 10); g.clip();
    g.fillStyle = o.col; g.fillRect(r.x, r.y, 4, r.h);
    if (o.k != null) g.fillRect(r.x, r.y + r.h - 2.5, r.w * Math.max(0, Math.min(1, o.k)), 2.5);
    g.restore();
    bldg(g, r.x + 15, r.y + r.h / 2, o.col);
    var rt = o.rt || '';
    g.font = '800 10.5px ' + H.FONT;
    var tw = rt ? g.measureText(rt).width : 0;
    H.fitTxt(o.text, r.x + 26, r.y + r.h / 2, 11.5, r.w - 26 - tw - 14, '#2f2c46', 800, 8.5);
    if (rt) H.txt(rt, r.x + r.w - 8, r.y + r.h / 2, 10.5, o.urgent ? '#e2504a' : o.col, 'right', 800);
    g.restore();
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () { o.tap(); return true; });
  }
  function width(s, rt) { return Math.max(150, Math.min(250, 44 + s.length * 11.5 + (rt ? rt.length * 7 + 10 : 0))); }
  var askAt = {};
  if (QT.FX && QT.FX.addChip) {
    QT.FX.addChip(function (S) {
      var a = askOf(S);
      if (!a || !G().condo.askRooms(a).length) return null;
      var left = Math.max(1, a.until - S.fin.month), text = t('cc_cAsk'), rt = t('cc_months', { n: left });
      var ak = a.key + '#' + a.n, at = askAt[ak] != null && askAt[ak] <= S.t ? askAt[ak] : (askAt[ak] = S.t);
      return { k: 'fx', id: 'condoAsk', w: width(text, rt), first: true, draw: function (S2, H, r) {
        chip(S2, H, r, { at: at, col: '#e2504a', text: text, rt: rt, urgent: left <= 1, k: null, tap: function () { card.open(); } });
      } };
    });
    QT.FX.addChip(function (S) {
      var c = current(S);
      if (!c) return null;
      var d = c.d, text = c.kind === 'raise' ? t('cc_cRaise', { v: yen(d.to - d.from) }) : c.kind === 'big' ? t('cc_cBig') :
                 c.kind === 'loan' ? t('cc_cLoan', { v: yen(d.v) }) : t('cc_cLump', { v: yen(d.v) });
      var col = c.kind === 'big' ? '#2fbf7a' : '#f2a63b';
      return { k: 'fx', id: 'condo', w: width(text), first: true, draw: function (S2, H, r) {
        chip(S2, H, r, { at: c.at, col: col, text: text, k: 1 - (S2.t - c.at) / LIFE, tap: function () {
          q.length = 0;
          if (d.p && S2.props[d.p.id]) QT.UI.show('propsheet', d.p.id);
        } });
      } };
    });
  }
  QT.CondoCard = card;
})(window.QT || (window.QT = {}));
