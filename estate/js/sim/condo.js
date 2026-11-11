(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE, C = E.CONDO;
  function T(k, v) { return L.t(k, v); }
  function fmt(v) { return G.fmt(Math.round(v)); }
  function yen(v) { return '¥' + fmt(v); }
  function r100(v) { return Math.round(v / 100) * 100; }
  function r10k(v) { return Math.round(v / 10000) * 10000; }
  L.add({
    cd_askBanner:  ['大規模修繕の積立金が足りない', 'NOT ENOUGH IN THE REPAIR FUND'],
    cd_askBannerSub:['{n}: 足りない分を一時金で集めるか、積立金を上げるか、総会で決める', '{n}: the owners must vote on a one-off levy or a higher monthly fee'],
    cd_autoLevy:   ['一時金 {v} を払った', 'Paid the levy {v}'],
    cd_autoLevySub:['{n}: 総会の期限までに決めなかったので、一時金に決まった', '{n}: no vote in time, so the levy was charged'],
    cd_autoLoan:   ['修繕積立金が月 +{v}（10年）', 'Repair fee +{v}/mo (10 yrs)'],
    cd_autoLoanSub:['{n}: 手元が足りないので、管理組合が借りて積立金に上乗せして返すことになった', '{n}: short of cash, so the association borrowed and raised the monthly fee']
  });
  function fnv(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0; }
    return h;
  }
  function h01(seed) {
    var x = Math.abs(Math.floor(seed)) % 2147483647 || 1;
    for (var i = 0; i < 5; i++) x = (x * 48271) % 2147483647;
    return x / 2147483647;
  }
  function u01(s) { return h01(fnv(s)); }
  function is(p) { return !!p && (p.kind === 'ku' || p.kind === 'office') && !p.inh; }
  function keyOf(p) { return p.site || p.id; }
  function m2(p) { var K = E.KINDS[p.kind] || {}; return (K.area || 25) * (p.areaMul || 1); }
  var PLAN = {};
  function planOf(p) {
    var key = keyOf(p), pl = PLAN[key];
    if (pl) return pl;
    pl = { key: key, kinto: u01(key + '|plan') < C.kintoP,
           cycle: C.cycle[0] + Math.floor(u01(key + '|cycle') * (C.cycle[1] - C.cycle[0] + 1)) };
    PLAN[key] = pl;
    return pl;
  }
  function isShort(pl, n) {
    var P = pl.kinto ? C.shortP.kinto : C.shortP.dankai;
    return n >= 1 && u01(pl.key + '|short|' + n) < P[Math.min(n, P.length) - 1];
  }
  function levyM2(pl, n) { return r100(C.levyM2[0] + u01(pl.key + '|levy|' + n) * (C.levyM2[1] - C.levyM2[0])); }
  function curYear() { return (S.fin.month - 1) / 12; }
  function ageOf(p) { return G.estate.ageOf(p); }
  function resMul(pl, age) { return pl.kinto ? C.kinto : C.steps[Math.min(C.steps.length - 1, Math.floor(age / C.stepYears))]; }
  function kanri(p) { return r100(C.kanriBase + m2(p) * (p.lux ? C.kanriLuxM2 : C.kanriM2)); }
  function reserveAt(p, age) { return r100(m2(p) * (p.lux ? C.resLuxM2 : C.resM2) * resMul(planOf(p), age)); }
  function reserve(p) { return reserveAt(p, ageOf(p)); }
  function stOf(p) { return S.condo && S.condo.b ? S.condo.b[keyOf(p)] || null : null; }
  function loanAdd(p) { var st = stOf(p); return st && st.addM2 && st.addUntil > S.fin.month ? r100(m2(p) * st.addM2) : 0; }
  function loanLeft(p) { var st = stOf(p); return st && st.addUntil > S.fin.month ? st.addUntil - S.fin.month : 0; }
  function fee(p) { return kanri(p) + reserve(p) + loanAdd(p); }
  function nextRaise(p) {
    var pl = planOf(p);
    if (pl.kinto) return null;
    var age = ageOf(p), b = Math.floor(age / C.stepYears);
    if (b >= C.steps.length - 1) return null;
    var at = (b + 1) * C.stepYears, now = reserveAt(p, age), to = reserveAt(p, at);
    return { age: at, months: Math.max(1, Math.ceil((at - (curYear() - p.built)) * 12)), from: now, to: to, d: to - now };
  }
  function nextBig(p) {
    var pl = planOf(p), n = Math.floor(ageOf(p) / pl.cycle) + 1, at = n * pl.cycle;
    return { n: n, age: at, cycle: pl.cycle, months: Math.max(1, Math.ceil((at - (curYear() - p.built)) * 12)),
             short: isShort(pl, n), levy: levyOf(p, n), work: workOf(p) };
  }
  function levyOf(p, n) { return r10k(m2(p) * levyM2(planOf(p), n)); }
  function workOf(p) { return r10k(m2(p) * C.workM2); }
  function addM2Of(pl, n) { return levyM2(pl, n) * C.loanK / (C.loanYears * 12); }
  function loanPlan(p, n) { return r100(m2(p) * addM2Of(planOf(p), n)); }
  function bldgName(p) {
    var b = p.site && S.bldg ? S.bldg[p.site] : null;
    if (b) return L.get() === 'en' ? b.name_en : b.name;
    return G.estate.name(p);
  }
  function monthEnd() {
    if (!S.condo || !G.estate || !S.fin) return;
    var mo = S.fin.month, groups = {};
    G.estate.owned().forEach(function (p) {
      if (!is(p) || p.building) return;
      var k = keyOf(p);
      (groups[k] || (groups[k] = [])).push(p);
    });
    Object.keys(groups).forEach(function (key) {
      var ps = groups[key], p = ps[0], pl = planOf(p), age = ageOf(p);
      var st = S.condo.b[key] || (S.condo.b[key] = {});
      var band = Math.floor(age / C.stepYears), cyc = Math.floor(age / pl.cycle);
      var fresh = st.m == null || st.m < mo - 1;
      if (!fresh && !pl.kinto && band > st.band && st.band < C.steps.length - 1) {
        var from = 0, to = 0;
        ps.forEach(function (q) { from += reserveAt(q, st.band * C.stepYears); to += reserveAt(q, age); });
        if (to > from) G.emit('condoRaise', { p: p, n: ps.length, from: from, to: to, age: age, name: bldgName(p) });
      }
      if (!fresh && cyc > st.cyc && cyc >= 1) bigRepair(key, ps, pl, cyc, age);
      st.band = band; st.cyc = cyc; st.m = mo;
    });
    while (S.condo.asks.length && !askRooms(S.condo.asks[0]).length) S.condo.asks.shift();
    var a = S.condo.asks[0];
    if (a && mo >= a.until) decide(0, true);
  }
  function commonWork(ps) {
    ps.forEach(function (q) { var c = q.cond || 0; q.cond = Math.max(Math.min(c, C.bigFloor), c - C.bigCond); });
  }
  function bigRepair(key, ps, pl, n, age) {
    var work = 0, levy = 0, add = 0;
    ps.forEach(function (q) { work += workOf(q); levy += levyOf(q, n); add += loanPlan(q, n); });
    if (!isShort(pl, n)) { commonWork(ps); G.emit('condoBig', { p: ps[0], n: ps.length, age: age, work: work, name: bldgName(ps[0]) }); return; }
    if (S.condo.asks.some(function (x) { return x.key === key && x.n === n; })) return;
    S.condo.asks.push({ key: key, n: n, age: age, cycle: pl.cycle, rooms: ps.map(function (q) { return q.id; }), work: work, levy: levy, add: add,
                        at: S.fin.month, until: S.fin.month + C.decideMonths, seen: false });
    G.banner(T('cd_askBanner'), T('cd_askBannerSub', { n: bldgName(ps[0]) }), '#f2a63b', 'warn');
    G.emit('condoAsk', { p: ps[0], levy: levy, name: bldgName(ps[0]) });
  }
  function ask() { return S.condo && S.condo.asks[0] || null; }
  function askRooms(a) { return (a ? a.rooms : []).map(function (id) { return S.props[id]; }).filter(function (q) { return q && q.own; }); }
  function decide(i, auto) {
    var a = ask();
    if (!a) return { ok: false };
    var ps = askRooms(a);
    S.condo.asks.shift();
    if (!ps.length) return { ok: true };
    var levy = 0;
    ps.forEach(function (q) { levy += levyOf(q, a.n); });
    var cash = G.cashFor ? G.cashFor(ps[0]) : S.gl[100];
    if (i === 0 && auto && cash < levy) i = 1;
    var nm = bldgName(ps[0]);
    commonWork(ps);
    if (i === 0) {
      ps.forEach(function (q) {
        var lv = levyOf(q, a.n);
        if (G.inBook) G.inBook(q.owner, function () { G.post(511, 100, lv, { k: 'levy', p: q.id }); });
        else G.post(511, 100, lv, { k: 'levy', p: q.id });
      });
      if (auto) G.banner(T('cd_autoLevy', { v: yen(levy) }), T('cd_autoLevySub', { n: nm }), '#f2a63b', 'warn');
      G.emit('condoLevy', { p: ps[0], mode: 'lump', v: levy, auto: !!auto, name: nm });
    } else {
      var st = S.condo.b[a.key] || (S.condo.b[a.key] = {});
      st.addM2 = addM2Of(planOf(ps[0]), a.n); st.addUntil = S.fin.month + C.loanYears * 12;
      var add = 0;
      ps.forEach(function (q) { add += loanAdd(q); });
      if (auto) G.banner(T('cd_autoLoan', { v: yen(add) }), T('cd_autoLoanSub', { n: nm }), '#f2a63b', 'warn');
      G.emit('condoLevy', { p: ps[0], mode: 'loan', v: add, auto: !!auto, name: nm });
    }
    return { ok: true };
  }
  G.mod({
    id: 'condo', order: 41,
    reset: function (S) { S.condo = { b: {}, asks: [] }; },
    save: function (S) { return { b: S.condo.b, asks: S.condo.asks }; },
    load: function (S, o) { S.condo = { b: (o && o.b) || {}, asks: (o && o.asks) || [] }; }
  });
  G.on('monthEnd', monthEnd);
  G.condo = {
    is: is, fee: fee, kanri: kanri, reserve: reserve, reserveAt: reserveAt, loanAdd: loanAdd, loanLeft: loanLeft, m2: m2,
    plan: planOf, nextRaise: nextRaise, nextBig: nextBig, levyOf: levyOf, workOf: workOf, loanPlan: loanPlan, bldgName: bldgName,
    ask: ask, askRooms: askRooms, decide: decide
  };
})(window.QT);
