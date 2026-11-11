(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE, H = E.HOJIN;
  function T(k, v) { return L.t(k, v); }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + G.fmt(Math.abs(Math.round(v))); }
  L.add({
    hj_founded:    ['会社をつくった!', 'COMPANY FOUNDED!'],
    hj_foundedSub: ['{k}（資産管理会社）。これから買う物件は会社でも持てる', '{k} (property holding company). New purchases can be owned by it'],
    hj_filed:      ['会社の決算', 'COMPANY YEAR-END'],
    hj_filedSub:   ['法人税など {v}（2月に納める）', 'Corporate taxes {v} (due in February)'],
    hj_filedLoss:  ['赤字でも均等割 {v} はかかる（赤字は10年繰り越せる）', 'Even at a loss the flat levy {v} is due (losses carry forward 10 yrs)'],
    hj_paid:       ['会社の税を納めた {v}', 'Your company paid {v} in tax'],
    hj_repaid:     ['会社から {v} 返してもらった（貸していたぶん）', 'Your company repaid {v} of your loan'],
    hj_whyLock:    ['経済的自由のあと、か去年の課税所得が {v} を超えたらつくれる', 'Available after financial freedom, or once last year\'s taxable income tops {v}'],
    hj_whyHave:    ['もう会社がある', 'You already have a company'],
    hj_whyCash:    ['手元が足りない（資本金 {v} 要る）', 'Not enough cash (capital {v} needed)']
  });
  function on() { return !!(S.hojin && S.hojin.gl); }
  function coBal(c) { return G.coBal(c); }
  function fresh(kind) {
    var gl = {};
    G.books.CO_CODES.forEach(function (c) { gl[c] = 0; });
    return { gl: gl, yr: { n: S.yr.n, acc: {}, prev: null, hist: [] }, mAcc: {}, lastAcc: {}, jr: [],
             kind: kind, at: S.fin.month, age: S.life.age, salary: 0, salaryNext: null,
             loss: [], jigyoPrev: 0, tax: { last: null, hist: [] }, bought: 0, repaid: 0, miss: 0 };
  }
  function unlocked() {
    var r = S.taxes && S.taxes.last;
    return !!(S.life && S.life.chosen && (S.life.free || (r && r.taxable >= H.unlock)));
  }
  function canFound(kind) {
    if (on()) return { ok: false, why: T('hj_whyHave') };
    if (!H.kinds[kind]) return { ok: false, why: '—' };
    if (!unlocked()) return { ok: false, why: T('hj_whyLock', { v: yen(H.unlock) }) };
    if (G.bal(100) < H.capital) return { ok: false, why: T('hj_whyCash', { v: yen(H.capital) }) };
    return { ok: true };
  }
  function found(kind) {
    var ck = canFound(kind);
    if (!ck.ok) return ck;
    var K = H.kinds[kind];
    S.hojin = fresh(kind);
    G.inBook(null, function () { G.post(170, 100, H.capital, { k: 'coCapital' }); });
    G.inBook('co', function () {
      G.post(100, 300, H.capital, { k: 'coCapital' });
      G.post(531, 100, K.cost, { k: 'coFound' });
    });
    G.banner(T('hj_founded'), T('hj_foundedSub', { k: L.nm(K) }), '#2bb8d8', 'record');
    G.emit('hojinFounded', { kind: kind });
    return { ok: true };
  }
  function socialRate(age) { return age >= 75 ? 0 : age >= 70 ? H.socialOld : H.social; }
  function baseInp() {
    var lf = S.life, r = S.taxes && S.taxes.last;
    if (r && r.inp) return r.inp;
    var sal = lf.retired ? 0 : (lf.gross || 0) * 12, bz = G.bizMonthly ? G.bizMonthly() * 12 : 0;
    return { salary: sal, pension: lf.retired ? (lf.pension || 0) * 12 : 0, biz: bz, social: (sal + bz) * E.SOCIAL, age: lf.age, big: false, interest: 0 };
  }
  function withhold(s) {
    if (!G.taxCalc || !(s > 0)) return 0;
    var lf = S.life, sal = lf.retired ? 0 : (lf.gross || 0) * 12, bz = G.bizMonthly ? G.bizMonthly() * 12 : 0;
    var base = { salary: sal, pension: lf.retired ? (lf.pension || 0) * 12 : 0, biz: bz, social: (sal + bz) * E.SOCIAL, age: lf.age };
    var add = Object.assign({}, base, { salary: sal + s * 12, social: base.social + s * 12 * socialRate(lf.age) });
    return Math.max(0, Math.round((G.taxCalc(add).total - G.taxCalc(base).total) / 12));
  }
  function setSalary(v) {
    if (!on() || H.salaries.indexOf(v) < 0) return false;
    var c = S.hojin;
    if (S.fin.month - c.at < 3) { c.salary = v; c.salaryNext = null; }
    else c.salaryNext = v === c.salary ? null : v;
    return true;
  }
  function salaryNow() { return on() ? S.hojin.salary : 0; }
  function salaryNextOf() { return on() ? S.hojin.salaryNext : null; }
  function canChangeNow() { return on() && S.fin.month - S.hojin.at < 3; }
  function r100(v) { return Math.floor(v / 100) * 100; }
  function corpTax(x) {
    x = Math.max(0, Math.floor(x / 1000) * 1000);
    var hojin = r100(Math.min(x, H.low) * H.hojinLow + Math.max(0, x - H.low) * H.hojinHigh);
    var chiho = r100(hojin * H.chiho), jumin = r100(hojin * H.jumin);
    var jigyo = 0, prev = 0;
    H.jigyo.forEach(function (b) { if (x > prev) jigyo += (Math.min(x, b[0]) - prev) * b[1]; prev = b[0]; });
    jigyo = r100(jigyo);
    var toku = r100(jigyo * H.tokubetsu);
    return { taxable: x, hojin: hojin, chiho: chiho, jumin: jumin, jigyo: jigyo, toku: toku, total: hojin + chiho + jumin + jigyo + toku };
  }
  function coCost(x) {
    var base = x - H.zeirishi, jig = 0, b = null;
    for (var i = 0; i < 4; i++) { b = corpTax(base - jig); jig = b.jigyo + b.toku; }
    b = corpTax(base - jig);
    return { tax: b.total, kinto: H.kinto, zeirishi: H.zeirishi, total: b.total + H.kinto + H.zeirishi, b: b };
  }
  function personalExtra(inp, x) {
    if (!G.taxCalc) return 0;
    var a = Object.assign({}, inp, { rentIncome: x, gains: [] }), b = Object.assign({}, inp, { rentIncome: 0, gains: [] });
    return Math.max(0, G.taxCalc(a).total - G.taxCalc(b).total);
  }
  function payoutCost(inp, x) {
    var rate = socialRate(inp.age != null ? inp.age : S.life.age);
    var pool = Math.max(0, x - H.zeirishi - H.kinto), sal = pool / (1 + rate), soc = sal * rate;
    var tax = 0;
    if (G.taxCalc && sal > 0) {
      var a = Object.assign({}, inp, { salary: (inp.salary || 0) + sal, social: (inp.social || 0) + soc, rentIncome: 0, gains: [] });
      var b = Object.assign({}, inp, { rentIncome: 0, gains: [] });
      tax = Math.max(0, G.taxCalc(a).total - G.taxCalc(b).total);
    }
    return { salary: sal, social: soc * 2, tax: tax, total: H.zeirishi + H.kinto + soc * 2 + tax };
  }
  function breakEven(inp) {
    for (var x = 1000000; x <= 50000000; x += 100000) if (coCost(x).total < personalExtra(inp, x)) return x;
    return null;
  }
  function breakEvenOut(inp) {
    for (var x = 1000000; x <= 50000000; x += 100000) if (payoutCost(inp, x).total < personalExtra(inp, x)) return x;
    return null;
  }
  function compare() {
    var inp = baseInp(), r = S.taxes && S.taxes.last;
    var now = r ? (r.rentRev || 0) - (r.rentExp || 0) : 0;
    function row(x) {
      var p = personalExtra(inp, x), c = coCost(x).total, o = payoutCost(inp, x).total;
      return { x: x, me: p, co: c, out: o, d: p - c, dOut: p - o };
    }
    return { inp: inp, now: now > 0 ? row(now) : null, rows: [3000000, 6000000, 10000000, 20000000].map(row),
             be: breakEven(inp), beOut: breakEvenOut(inp) };
  }
  function monthEndPre() {
    if (!on()) return;
    var c = S.hojin, s = c.salary;
    G.inBook('co', function () { G.post(530, 100, Math.round(H.zeirishi / 12), false); });
    if (s > 0) {
      var rate = socialRate(S.life.age);
      G.inBook('co', function () {
        G.post(520, 100, s, { k: 'coSalary' });
        if (rate) G.post(521, 100, Math.round(s * rate), false);
      });
      G.inBook(null, function () {
        G.post(100, 614, s, 'coSalary');
        if (rate) G.post(621, 100, Math.round(s * rate), 'social');
        var w = withhold(s);
        if (w > 0) G.post(150, 100, w, 'withhold');
      });
    }
  }
  function monthEnd() {
    if (!on()) return;
    var c = S.hojin, r = c.tax.last;
    if (r && !r.settled && S.fin.month >= r.settleMonth) {
      r.settled = true;
      var v = Math.min(r.total, coBal(230));
      if (v > 0) {
        G.inBook('co', function () { G.post(230, 100, v, { k: 'coTaxPaid', y: r.year }); });
        G.toast({ x: S.player.x, y: S.player.y - 20 }, T('hj_paid', { v: yen(v) }), '#f2a63b');
      }
    }
    var extra = coBal(100) - H.keep - coBal(230);
    if (extra > 10000 && coBal(250) > 0) {
      var got = G.coRepayOwner(extra);
      if (got > 0) {
        c.repaid += got;
        if (got >= 1000000) G.toast({ x: S.player.x, y: S.player.y - 20 }, T('hj_repaid', { v: yen(got) }), '#2bb8d8');
        G.emit('hojinRepaid', { v: got });
      }
    }
  }
  function yearEnd(ev) {
    if (!on()) return;
    var c = S.hojin, pl = G.books.coYearPL(), year = ev.year;
    var profit = Math.round(pl.rentRev - pl.rentExp + pl.gain);
    var ded = c.jigyoPrev || 0;
    var inc = profit - ded, used = 0;
    c.loss = (c.loss || []).filter(function (l) { return year - l.y < H.lossYears && l.v > 0; });
    if (inc > 0) {
      c.loss.forEach(function (l) { var u = Math.min(l.v, inc - used); l.v -= u; used += u; });
      c.loss = c.loss.filter(function (l) { return l.v > 0; });
    } else if (inc < 0) c.loss.push({ y: year, v: -inc });
    var b = corpTax(inc - used);
    var months = Math.max(1, Math.min(12, year * 12 - c.at + 1));
    var kinto = r100(H.kinto * months / 12);
    var total = b.total + kinto;
    G.inBook('co', function () { G.post(700, 230, total, { k: 'coTax', y: year }); });
    c.jigyoPrev = b.jigyo + b.toku;
    var rec = { year: year, profit: profit, ded: ded, used: used, lossLeft: c.loss.reduce(function (t, l) { return t + l.v; }, 0),
                taxable: b.taxable, hojin: b.hojin, chiho: b.chiho, jumin: b.jumin, jigyo: b.jigyo, toku: b.toku, kinto: kinto,
                months: months, total: total, settleMonth: S.fin.month + 2, salary: pl.by[520] || 0 };
    c.tax.last = rec;
    c.tax.hist.push({ y: year, profit: profit, total: total });
    if (c.tax.hist.length > 40) c.tax.hist.shift();
    G.banner(T('hj_filed'), b.total > 0 ? T('hj_filedSub', { v: yen(total) }) : T('hj_filedLoss', { v: yen(kinto) }), '#2bb8d8', 'record');
    G.emit('hojinFiled', rec);
  }
  function newYear() {
    if (!on()) return;
    var c = S.hojin;
    if (c.salaryNext != null) { c.salary = c.salaryNext; c.salaryNext = null; }
  }
  function owned() { return G.estate ? G.estate.owned().filter(function (p) { return p.owner === 'co'; }) : []; }
  function fixedMonthly() { return on() ? Math.round((H.zeirishi + H.kinto) / 12) : 0; }
  function netOf() {
    if (!on()) return 0;
    var v = owned().reduce(function (t, p) { return t + (p.building ? G.estate.landValue(p) + p.building.cost : G.estate.value(p)); }, 0);
    return v + coBal(100) + coBal(160) - coBal(210) - coBal(220) - coBal(230) - coBal(250);
  }
  G.mod({
    id: 'hojin', order: 46,
    reset: function (S) { S.hojin = null; },
    save: function (S) { return S.hojin; },
    load: function (S, o) {
      if (!o || !o.gl) { S.hojin = null; return; }
      var f = fresh(o.kind || 'gk');
      Object.keys(f).forEach(function (k) { if (o[k] == null) o[k] = f[k]; });
      G.books.CO_CODES.forEach(function (c) { if (o.gl[c] == null) o.gl[c] = 0; });
      S.hojin = o;
    }
  });
  G.on('monthEndPre', monthEndPre);
  G.on('monthEnd', monthEnd);
  G.on('yearEndPre', yearEnd);
  G.on('yearEnd', newYear);
  G.on('propBought', function (e) {
    if (!e || !e.p || e.p.owner !== 'co' || !on()) return;
    S.hojin.bought = (S.hojin.bought || 0) + 1;
    if (G.achv && G.achv.give) G.achv.give('hojin');
  });
  G.hojin = {
    on: on, unlocked: unlocked, canFound: canFound, found: found, setSalary: setSalary, salaryNow: salaryNow, salaryNext: salaryNextOf,
    canChangeNow: canChangeNow, socialRate: socialRate, withhold: withhold, corpTax: corpTax, coCost: coCost, personalExtra: personalExtra,
    payoutCost: payoutCost, breakEven: breakEven, breakEvenOut: breakEvenOut, compare: compare, baseInp: baseInp, owned: owned, fixedMonthly: fixedMonthly, netOf: netOf,
    cash: function () { return coBal(100); }, owe: function () { return coBal(250); }, H: H
  };
})(window.QT);
