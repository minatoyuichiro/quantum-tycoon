(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, W = QT.World, L = QT.L, E = QT.Data.ESTATE;
  function T(k, v) { return L.t(k, v); }
  function nm(o, f) { return L.nm(o, f); }
  L.add({
    loan_rateUp:     ['利上げ', 'RATE HIKE'],
    loan_rateUpSub:  ['基準金利 {a}% → {b}%。変動で借りていると返済が増える', 'Base rate {a}% → {b}%. Variable-rate payments will rise'],
    loan_rateDown:   ['利下げ', 'RATE CUT'],
    loan_rateDownSub:['基準金利 {a}% → {b}%', 'Base rate {a}% → {b}%'],
    loan_rateWatchUp:  ['利上げ観測!', 'RATE HIKE EXPECTED!'],
    loan_rateWatchDown:['利下げ観測', 'RATE CUT EXPECTED'],
    loan_rateWatchSub: ['来月の会合で金利が動きそう。固定にするなら今のうち', 'Rates likely to move next month — lock in fixed now if you want'],
    loan_reset:      ['返済額の見直し（5年ごと）', 'Payment reset (every 5 years)'],
    loan_resetSub:   ['{l}: 月{a} → 月{b}', '{l}: {a} → {b} /mo'],
    loan_why_income: ['年収が足りない（{v}から）', 'Income too low (needs {v})'],
    loan_why_region: ['地元の物件だけ', 'Only lends in its home area'],
    loan_why_kind:   ['この種類の物件には貸さない', 'Does not lend on this type'],
    loan_why_net:    ['純資産が足りない（{v}から）', 'Net worth too low (needs {v})'],
    loan_why_term:   ['期間が{n}年しか取れない（築年と年齢）', 'Only {n} years possible (building age & your age)'],
    loan_why_limit:  ['借入が年収の{m}倍に届いている', 'Your loans already reach {m}× income'],
    loan_why_land:   ['土地だけには貸さない（建てるときに）', 'No loans on bare land (borrow when you build)'],
    loan_why_dscr:   ['家賃で返済をまかなえない', 'Rent cannot cover the payments'],
    loan_why_age:    ['完済が80歳を越える', 'Repayment would run past age 80'],
    loan_why_rebuild:['再建築不可には貸さない（担保にならない）', 'No loans on a lot that cannot be rebuilt (no collateral value)'],
    loan_borrow:     ['借入: {l}', 'Borrowed: {l}'],
    loan_repay:      ['返済: {l}', 'Repaid: {l}'],
    loan_prepay:     ['繰り上げ返済: {l}', 'Prepayment: {l}']
  });
  function yearsNow() { return (S.fin.month - 1) / 12 + 1; }
  function pathAt(y) {
    var P = E.RATE_PATH;
    if (y <= P[0][0]) return P[0][1];
    for (var i = 1; i < P.length; i++) {
      if (y <= P[i][0]) {
        var a = P[i - 1], b = P[i], k = (y - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * k;
      }
    }
    return P[P.length - 1][1];
  }
  function rnd() {
    var r = S.rate;
    r.seed = (r.seed * 1103515245 + 12345) & 0x7fffffff;
    return r.seed / 0x7fffffff;
  }
  function rateMonth() {
    var r = S.rate, tgt = pathAt(yearsNow()) + r.drift;
    r.drift = Math.max(-0.004, Math.min(0.004, r.drift + (rnd() - 0.5) * 0.0006));
    var before = r.base, step = 0.0025;
    if (r.pend) {
      r.base = Math.max(0.001, Math.round((r.base + r.pend * step) * 10000) / 10000);
      r.pend = 0;
    } else if (tgt - r.base > 0.0018 && rnd() < 0.22) { r.pend = 1; G.banner(T('loan_rateWatchUp'), T('loan_rateWatchSub'), '#f2a63b', 'warn'); G.emit('rateWatch', { dir: 1 }); }
    else if (r.base - tgt > 0.0018 && rnd() < 0.22) { r.pend = -1; G.banner(T('loan_rateWatchDown'), T('loan_rateWatchSub'), '#2bb8d8', 'good'); G.emit('rateWatch', { dir: -1 }); }
    r.long = r.base + E.RATE_LONG_ADD * (1 - Math.min(0.5, r.base * 15));
    if (r.base !== before) {
      r.dir = r.base > before ? 1 : -1; r.dirAt = S.t;
      var up = r.base > before;
      G.banner(T(up ? 'loan_rateUp' : 'loan_rateDown'),
               T(up ? 'loan_rateUpSub' : 'loan_rateDownSub', { a: (before * 100).toFixed(2), b: (r.base * 100).toFixed(2) }),
               up ? '#e2504a' : '#2fbf7a', up ? 'warn' : 'good');
      G.emit('rateChange', { from: before, to: r.base });
      S.loans.forEach(function (ln) { if (ln.kind === 'var') ln.rate = varRate(ln.lender) - (ln.spreadCut || 0); });
    } else if (S.t - (r.dirAt || 0) > W.MONTH * 12) r.dir = 0;
  }
  function varRate(lender) { var ld = E.LENDERS[lender]; return S.rate.base + (ld ? ld.spread : 0.02); }
  function fixRate(lender) {
    var ld = E.LENDERS[lender];
    if (ld && ld.fixedRate != null) return ld.fixedRate;
    return S.rate.long + E.FIXED_ADD + (ld ? ld.spread : 0.02) * 0.6;
  }
  function rateInfo() { var r = S.rate; return { base: r.base, long: r.long, dir: r.dir || 0 }; }
  function payment(P, rate, n) {
    if (n <= 0) return P;
    var i = rate / 12;
    if (i <= 0) return P / n;
    return P * i / (1 - Math.pow(1 + i, -n));
  }
  function payIfUp(bal, pay, rate, left, until, d) {
    if (!(d > 0) || bal <= 0 || left <= 0) return pay;
    var r = rate + d, i = r / 12, m = Math.max(0, Math.min(until, left));
    if (m >= left) return Math.max(pay, Math.round(payment(bal, r, left)));
    var g = Math.pow(1 + i, m), b = bal * g - pay * (g - 1) / i;
    if (b <= 0) return pay;
    var np = Math.round(payment(b, r, left - m));
    np = Math.min(np, Math.round(pay * 1.25));
    return Math.max(np, Math.round(b * r / 12) + 1000);
  }
  function newPayIfUp(amount, rate, n, d) {
    return payIfUp(amount, Math.round(payment(amount, rate, n)), rate, n, 60, d);
  }
  function loanIfUp(ln, d) {
    if (ln.kind !== 'var') return { pay: ln.pay, until: 0 };
    var until = Math.max(0, ln.reset - S.fin.month);
    return { pay: payIfUp(ln.bal, ln.pay, ln.rate, ln.left, until, d), until: until < ln.left ? until : 0 };
  }
  function income() {
    var lf = S.life;
    if (lf.biz && !lf.retired) return Math.max(2400000, (G.bizMonthly ? G.bizMonthly() : 0) * 12 - 650000);
    if (!lf.retired) return lf.gross * 12;
    return lf.pension * 12 * 0.5;
  }
  function incomeWithRent() { return income() + (G.rentNow ? G.rentNow() * 12 * 0.7 : 0); }
  function debtTotal() { return G.bal(210) + (G.coBal ? G.coBal(210) : 0); }
  function inLoanBook(ln, fn) { return G.inBook ? G.inBook(ln && ln.owner, fn) : fn(); }
  function regionOf(prop) {
    var a = prop && G.estate && G.estate.areaOf ? G.estate.areaOf(prop) : null;
    return (a && a.region) || ((prop && E.DIST[prop.dist]) || {}).region;
  }
  function quote(prop, lender, opt) {
    opt = opt || {};
    var ld = E.LENDERS[lender], why = [];
    if (!ld) return { ok: false, why: ['?'] };
    var K = E.KINDS[prop.kind];
    var inc = incomeWithRent();
    if (income() < ld.minIncome) why.push(T('loan_why_income', { v: '¥' + G.fmt(ld.minIncome) }));
    if (ld.regions && ld.regions.indexOf(regionOf(prop)) < 0) why.push(T('loan_why_region'));
    if (ld.kinds && ld.kinds.indexOf(opt.build || prop.kind) < 0) why.push(T('loan_why_kind'));
    if (ld.minNet && (G.netWorth ? G.netWorth() : 0) < ld.minNet) why.push(T('loan_why_net', { v: '¥' + G.fmt(ld.minNet) }));
    if (prop.kind === 'land' && !opt.build) why.push(T('loan_why_land'));
    if (prop.rebuildNo && !ld.rebuildOk) why.push(T('loan_why_rebuild'));
    var bk = opt.build ? (E.BUILDS[opt.build] || {}).kind : null;
    var struct = opt.build ? (E.KINDS[bk] || {}).struct || 'w' : K.struct || 'w';
    if (struct === 'eq') struct = 'eq';
    var age = opt.build ? 0 : (G.estate ? G.estate.ageOf(prop) : 0);
    var life = E.LIFE[struct] || 22;
    var legal = Math.max(0, life - age);
    var bldYears = Math.max(Math.round(life * 0.2), legal);
    if (ld.eco) bldYears = Math.max(bldYears, Math.min(30, legal + ld.eco));
    var term = Math.min(ld.maxTerm, bldYears, 80 - S.life.age);
    if (80 - S.life.age < ld.minTerm) why.push(T('loan_why_age'));
    else if (term < ld.minTerm) why.push(T('loan_why_term', { n: Math.max(0, term) }));
    var list = prop.sale ? prop.sale.price : (G.estate ? G.estate.value(prop) : 0);
    var price = opt.build ? (opt.cost || 0) + (opt.landNow ? 0 : list) : list;
    var coll = G.collateral ? G.collateral(prop, opt) : price * 0.7;
    var room = Math.max(0, inc * ld.mult - debtTotal());
    if (room <= 0) why.push(T('loan_why_limit', { m: ld.mult }));
    var max = Math.min(price * ld.ltv, Math.max(coll, price * 0.5) * ld.ltv * 1.15, room, ld.cap || Infinity);
    max = Math.max(0, Math.floor(max / 100000) * 100000);
    var kind = ld.fixedOnly ? 'fix' : (opt.kind || 'var');
    var rate = kind === 'fix' ? fixRate(lender) : varRate(lender);
    var n = Math.max(1, term) * 12;
    var amt = Math.min(opt.amount != null ? opt.amount : max, max);
    var pay = payment(amt, rate, n);
    var rent = G.rentFull ? G.rentFull(prop, opt) : 0;
    if (lender !== 'nonbank' && rent > 0 && pay > rent * 0.8 && amt > 0) why.push(T('loan_why_dscr'));
    return { ok: !why.length && max > 0, why: why, max: max, term: term, rate: rate, kind: kind, pay: Math.round(pay),
             amount: amt, fee: Math.round(amt * (ld.fee || 0)), lender: lender, n: n };
  }
  function borrow(prop, lender, amount, kind, termYears, qopt) {
    var o = qopt || {};
    o.amount = amount; o.kind = kind;
    var q = quote(prop, lender, o);
    var n = Math.max(12, Math.min(q.term, termYears || q.term) * 12);
    var rate = q.rate;
    var ln = { id: 'L' + (++S.loanSeq), prop: prop.id, lender: lender, kind: q.kind, rate: rate, n: n, left: n,
               bal: Math.round(amount), pay: Math.round(payment(amount, rate, n)), at: S.t, start: S.fin.month,
               reset: S.fin.month + 60 };
    if (prop.owner === 'co') ln.owner = 'co';
    S.loans.push(ln);
    inLoanBook(ln, function () {
      G.post(100, 210, ln.bal, { k: 'borrow', l: lender });
      if (q.fee > 0) G.post(517, 100, q.fee, { k: 'loanFee', l: lender });
    });
    G.emit('loanTaken', { loan: ln });
    return ln;
  }
  function monthEndPre() {
    rateMonth();
    for (var i = S.loans.length - 1; i >= 0; i--) {
      var ln = S.loans[i];
      if (ln.kind === 'var' && S.fin.month >= ln.reset) {
        ln.reset = S.fin.month + 60;
        var np = Math.round(payment(ln.bal, ln.rate, ln.left));
        np = Math.min(np, Math.round(ln.pay * 1.25));
        var minPay = Math.round(ln.bal * ln.rate / 12) + 1000;
        np = Math.max(np, minPay);
        if (np !== ln.pay) {
          if (np > ln.pay * 1.02) G.banner(T('loan_reset'), T('loan_resetSub', { l: nm(E.LENDERS[ln.lender]), a: '¥' + G.fmt(ln.pay), b: '¥' + G.fmt(np) }), '#e2504a', 'warn');
          ln.pay = np;
        }
      }
      var int = Math.round(ln.bal * ln.rate / 12);
      var pr = Math.min(ln.bal, Math.max(0, ln.pay - int));
      if (ln.left <= 1) pr = ln.bal;
      inLoanBook(ln, function () {
        if (int > 0) G.post(516, 100, int, false);
        if (pr > 0) G.post(210, 100, pr, false);
      });
      ln.bal -= pr; ln.left--;
      ln.paidInt = (ln.paidInt || 0) + int;
      if (ln.bal <= 0) { S.loans.splice(i, 1); G.emit('loanDone', { loan: ln }); }
    }
  }
  function prepay(id, v) {
    var ln = loanById(id);
    if (!ln) return 0;
    v = Math.floor(Math.min(v, ln.bal, G.cashFor ? G.cashFor(ln.owner || null) : S.gl[100]));
    if (v <= 0) return 0;
    inLoanBook(ln, function () { G.post(210, 100, v, { k: 'prepay', l: ln.lender }); });
    ln.bal -= v;
    if (ln.bal <= 0) { S.loans.splice(S.loans.indexOf(ln), 1); G.emit('loanPrepay', { loan: ln, v: v, done: true }); G.emit('loanDone', { loan: ln }); return v; }
    var i = ln.rate / 12;
    ln.left = i > 0 ? Math.max(1, Math.ceil(-Math.log(1 - ln.bal * i / ln.pay) / Math.log(1 + i))) : Math.ceil(ln.bal / ln.pay);
    if (!isFinite(ln.left)) ln.left = ln.n;
    G.emit('loanPrepay', { loan: ln, v: v });
    return v;
  }
  function payOffProp(propId) {
    var tot = 0;
    for (var i = S.loans.length - 1; i >= 0; i--) {
      var ln = S.loans[i];
      if (ln.prop !== propId) continue;
      inLoanBook(ln, function () { G.post(210, 100, ln.bal, { k: 'repay', l: ln.lender }); });
      tot += ln.bal;
      S.loans.splice(i, 1);
      G.emit('loanDone', { loan: ln });
    }
    return tot;
  }
  function loanById(id) { for (var i = 0; i < S.loans.length; i++) if (S.loans[i].id === id) return S.loans[i]; return null; }
  function loansOf(propId) { return S.loans.filter(function (l) { return l.prop === propId; }); }
  function loanPayNow() { return S.loans.reduce(function (t, l) { return t + l.pay; }, 0); }
  function loanPayOf(propId) { return loansOf(propId).reduce(function (t, l) { return t + l.pay; }, 0); }
  function loanBalOf(propId) { return loansOf(propId).reduce(function (t, l) { return t + l.bal; }, 0); }
  G.mod({
    id: 'loan', order: 25,
    reset: function (S) {
      S.rate = { base: E.RATE_PATH[0][1], long: E.RATE_PATH[0][1] + E.RATE_LONG_ADD, drift: 0, dir: 0, dirAt: 0,
                 seed: 20261016 };
      S.loans = []; S.loanSeq = 0;
    },
    save: function (S) { return { rate: S.rate, loans: S.loans, seq: S.loanSeq }; },
    load: function (S, o) {
      if (o.rate) S.rate = o.rate;
      S.loans = o.loans || []; S.loanSeq = o.seq || S.loans.length;
    }
  });
  G.on('monthEndPre', monthEndPre);
  Object.assign(G, {
    rateInfo: rateInfo, varRate: varRate, fixRate: fixRate, loanQuote: quote, borrow: borrow, prepay: prepay,
    payOffProp: payOffProp, loansOf: loansOf, loanDebt: debtTotal, loanPayNow: loanPayNow, loanPayOf: loanPayOf, loanBalOf: loanBalOf,
    loanPayment: payment, loanIncome: income, ratePath: pathAt, loanNewPayIfUp: newPayIfUp, loanIfUp: loanIfUp,
    regionOf: regionOf
  });
})(window.QT);
