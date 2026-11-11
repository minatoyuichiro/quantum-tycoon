(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE;
  function T(k, v) { return L.t(k, v); }
  L.add({
    tax_title:     ['確定申告', 'TAX RETURN'],
    tax_refund:    ['還付 {v} が戻ってくる（3月）', 'Refund {v} coming in March'],
    tax_due:       ['3月に {v} を納める', 'Pay {v} in March'],
    tax_paid:      ['確定申告: {v} を納めた', 'Tax return: paid {v}'],
    tax_got:       ['確定申告: 還付 {v}!', 'Tax return: refund {v}!'],
    tax_none:      ['確定申告: 追加の税はなし', 'Tax return: nothing more to pay']
  });
  function salaryDed(x) {
    var min = E.SALARY_DED_MIN || 650000;
    if (x * 0.3 + 80000 <= min) return Math.min(x, min);
    if (x <= 3600000) return x * 0.3 + 80000;
    if (x <= 6600000) return x * 0.2 + 440000;
    if (x <= 8500000) return x * 0.1 + 1100000;
    return 1950000;
  }
  function basicDed(total) {
    var inc = E.BASIC_DED, res = E.BASIC_DED_RES != null ? E.BASIC_DED_RES : E.BASIC_DED;
    var tb = E.BASIC_DED_TAPER;
    if (tb) for (var i = 0; i < tb.length; i++) if (total <= tb[i][0]) { inc = Math.min(inc, tb[i][1]); res = Math.min(res, tb[i][2]); break; }
    return { inc: inc, res: res };
  }
  function incomeTax(base) {
    if (base <= 0) return 0;
    for (var i = 0; i < E.TAX_BRACKETS.length; i++) {
      var b = E.TAX_BRACKETS[i];
      if (base <= b[0]) return Math.max(0, base * b[1] - b[2]);
    }
    return 0;
  }
  function calc(o) {
    var r = {};
    r.salary = o.salary || 0;
    r.salaryInc = r.salary > 0 ? Math.max(0, r.salary - salaryDed(r.salary)) : 0;
    r.biz = o.biz || 0;
    r.bizInc = r.biz > 0 ? Math.max(0, r.biz - E.BLUE_BIG) : 0;
    r.pension = o.pension || 0;
    r.pensionInc = Math.max(0, r.pension - ((o.age || 65) >= 65 ? E.PENSION_DED : 600000));
    var ri = o.rentIncome || 0;
    r.blue = ri > 0 ? Math.min(ri, o.big ? E.BLUE_BIG : E.BLUE_SMALL) : 0;
    ri -= r.blue;
    if (ri < 0) ri = Math.min(0, ri + (o.interest || 0) * E.LAND_INT);
    r.rentInc = ri;
    var total = Math.max(0, r.salaryInc + r.pensionInc + r.bizInc + ri);
    r.offset = ri < 0 ? Math.min(-ri, r.salaryInc + r.pensionInc + r.bizInc) : 0;
    var social = o.social != null ? o.social : r.salary * E.SOCIAL;
    var sh = 0, lg = 0;
    (o.gains || []).forEach(function (g) { if (g.long) lg += g.gain; else sh += g.gain; });
    if (sh < 0 && lg > 0) { lg += sh; sh = 0; } else if (lg < 0 && sh > 0) { sh += lg; lg = 0; }
    r.gainShort = Math.max(0, sh); r.gainLong = Math.max(0, lg);
    var bd = basicDed(total + r.gainShort + r.gainLong);
    r.basic = bd.inc; r.basicRes = bd.res; r.social = social;
    r.taxable = Math.max(0, Math.floor((total - bd.inc - social) / 1000) * 1000);
    r.taxableRes = Math.max(0, Math.floor((total - bd.res - social) / 1000) * 1000);
    r.incomeTax = Math.round(incomeTax(r.taxable) * 1.021);
    var gross = total + r.gainShort + r.gainLong;
    r.resAdj = gross <= 25000000 && E.RES_ADJ_DIFF ? Math.round(Math.min(E.RES_ADJ_DIFF, r.taxableRes) * 0.05) : 0;
    r.resKinto = E.RES_KINTO && gross > (E.RES_KINTO_FREE || 0) ? E.RES_KINTO : 0;
    r.resident = Math.max(0, Math.round(r.taxableRes * E.RESIDENT) - r.resAdj) + r.resKinto;
    r.gainTax = Math.round(r.gainShort * E.GAIN_SHORT + r.gainLong * E.GAIN_LONG);
    r.total = r.incomeTax + r.resident + r.gainTax;
    return r;
  }
  function bigScale() {
    var rooms = 0, bld = 0;
    (G.estate ? G.estate.owned() : []).forEach(function (p) {
      if (p.owner === 'co') return;
      var n = p.units ? p.units.length : 0;
      rooms += n;
      bld += n >= 2 ? 1 : 0;
    });
    return bld >= 5 || rooms >= 10;
  }
  function yearEnd(ev) {
    var pl = ev.pl, by = pl.by;
    var o = {
      salary: (by[610] || 0) + (by[614] || 0), pension: by[611] || 0, biz: by[613] || 0, rentIncome: pl.rentIncome, interest: by[516] || 0,
      social: by[621] || 0, age: S.life.age, big: bigScale(),
      gains: S.gains.filter(function (g) { return g.y === ev.year; })
    };
    var r = calc(o);
    r.inp = { salary: o.salary, pension: o.pension, biz: o.biz, interest: o.interest, social: o.social, age: o.age, big: o.big };
    r.coPay = by[614] || 0;
    var wh = G.bal(150);
    r.withheld = wh; r.year = ev.year; r.rentRev = pl.rentRev; r.rentExp = pl.rentExp; r.dep = pl.dep;
    if (r.total >= wh) {
      if (wh > 0) G.post(700, 150, wh, false);
      if (r.total - wh > 0) G.post(700, 230, r.total - wh, { k: 'tax', y: ev.year });
      r.due = r.total - wh; r.refund = 0;
    } else {
      if (r.total > 0) G.post(700, 150, r.total, false);
      r.due = 0; r.refund = wh - r.total;
    }
    r.settleMonth = S.fin.month + 2;
    S.taxes.last = r;
    S.taxes.hist.push({ y: r.year, total: r.total, refund: r.refund, due: r.due, rentInc: r.rentInc });
    if (S.taxes.hist.length > 40) S.taxes.hist.shift();
    G.banner(T('tax_title'), r.refund > 0 ? T('tax_refund', { v: '¥' + G.fmt(r.refund) }) : r.due > 0 ? T('tax_due', { v: '¥' + G.fmt(r.due) }) : T('tax_none'),
             r.refund > 0 ? '#2fbf7a' : '#f5b21c', 'record');
    G.emit('taxFiled', r);
  }
  function settle() {
    var r = S.taxes.last;
    if (!r || r.settled || S.fin.month < r.settleMonth) return;
    r.settled = true;
    if (r.refund > 0) {
      G.post(100, 150, r.refund, { k: 'refund', y: r.year });
      G.toast({ x: S.player.x, y: S.player.y - 20 }, T('tax_got', { v: '¥' + G.fmt(r.refund) }), '#2fbf7a', { big: true });
    } else if (r.due > 0) {
      G.post(230, 100, Math.min(r.due, G.bal(230)), { k: 'taxPaid', y: r.year });
      G.toast({ x: S.player.x, y: S.player.y - 20 }, T('tax_paid', { v: '¥' + G.fmt(r.due) }), '#f2a63b');
    }
    G.emit('taxSettled', r);
  }
  G.mod({
    id: 'tax', order: 35,
    reset: function (S) { S.taxes = { last: null, hist: [] }; },
    save: function (S) { return S.taxes; },
    load: function (S, o) { if (o && o.hist) S.taxes = o; }
  });
  G.on('yearEndPre', yearEnd);
  G.on('monthEnd', settle);
  Object.assign(G, { taxCalc: calc, taxBig: bigScale, taxSalaryDed: salaryDed, taxBasicDed: basicDed });
})(window.QT);
