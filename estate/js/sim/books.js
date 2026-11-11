(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, W = QT.World, L = QT.L;
  function T(k, v) { return L.t(k, v); }
  var ACCTS = {
    100: ['A', '現金・預金', 'Cash'],
    110: ['A', '未収の家賃・売上', 'Uncollected rent & sales'],
    120: ['A', '土地', 'Land'],
    130: ['A', '建物', 'Buildings'],
    139: ['XA', '減価償却累計額', 'Accumulated depreciation'],
    150: ['A', '仮払税金（源泉）', 'Tax withheld'],
    160: ['A', '建設仮勘定', 'Construction in progress'],
    210: ['L', '借入金（不動産ローン）', 'Property loans'],
    215: ['L', 'カードローン', 'Card loan'],
    220: ['L', '預り敷金', 'Tenant deposits'],
    230: ['L', '未払税金', 'Taxes payable'],
    240: ['L', 'きょうだいへの代償金（未払い）', 'Owed to sibling (inheritance)'],
    300: ['E', '元入金', "Owner's capital"],
    410: ['R', '賃貸料', 'Rent'],
    411: ['R', '礼金・更新料', 'Key money & renewals'],
    412: ['R', '駐車場収入', 'Parking income'],
    413: ['R', 'ランドリー売上', 'Laundry sales'],
    414: ['R', 'トランクルーム・地代', 'Storage & ground rent'],
    415: ['R', '民泊の売上', 'Short-stay sales'],
    510: ['X', '管理費・管理委託料', 'Management fees'],
    511: ['X', '修繕費', 'Repairs'],
    512: ['X', '租税公課', 'Property taxes'],
    513: ['X', '損害保険料', 'Insurance'],
    514: ['X', '広告料（AD）', 'Leasing ads'],
    515: ['X', '減価償却費', 'Depreciation'],
    516: ['X', '支払利息', 'Loan interest'],
    517: ['X', '支払手数料', 'Fees'],
    518: ['X', '水道光熱・消耗品', 'Utilities & supplies'],
    519: ['X', '雑費', 'Miscellaneous'],
    610: ['P', '給料（額面）', 'Salary (gross)'],
    611: ['P', '年金', 'Pension'],
    612: ['P', '退職金', 'Retirement bonus'],
    613: ['P', '事業の利益（仲介・管理）', 'Business income (brokerage & management)'],
    619: ['P', '雑収入', 'Other income'],
    620: ['Q', '生活費', 'Living costs'],
    621: ['Q', '社会保険料', 'Social insurance'],
    622: ['Q', 'カードローンの利息', 'Card loan interest'],
    623: ['Q', '交通費', 'Travel'],
    624: ['Q', '相続の手続き（登記・遺品整理）', 'Inheritance costs (registration, clearing)'],
    625: ['Q', '空き家の税と管理', 'Empty house: tax & upkeep'],
    690: ['SI', '譲渡益', 'Gain on sale'],
    691: ['SL', '譲渡損', 'Loss on sale'],
    700: ['TX', '所得税・住民税', 'Income & resident tax'],
    701: ['TX', '相続税', 'Inheritance tax'],
    170: ['A', '自分の会社の株（出資）', 'Shares in your company'],
    175: ['A', '自分の会社への貸付金', 'Loan to your company'],
    614: ['P', '役員報酬（自分の会社から）', "Director's pay (your company)"]
  };
  var CO_ACCTS = {
    100: ['A', '会社の預金', 'Company cash'],
    110: ['A', '未収の家賃・売上', 'Uncollected rent & sales'],
    120: ['A', '土地', 'Land'],
    130: ['A', '建物', 'Buildings'],
    139: ['XA', '減価償却累計額', 'Accumulated depreciation'],
    160: ['A', '建設仮勘定', 'Construction in progress'],
    210: ['L', '借入金（銀行）', 'Bank loans'],
    220: ['L', '預り敷金', 'Tenant deposits'],
    230: ['L', '未払法人税等', 'Corporate tax payable'],
    250: ['L', '役員借入金（社長から）', 'Loan from the director (you)'],
    300: ['E', '資本金', 'Share capital'],
    310: ['E', '繰越利益剰余金', 'Retained earnings'],
    410: ['R', '賃貸料', 'Rent'],
    411: ['R', '礼金・更新料', 'Key money & renewals'],
    412: ['R', '駐車場収入', 'Parking income'],
    413: ['R', 'ランドリー売上', 'Laundry sales'],
    414: ['R', 'トランクルーム・地代', 'Storage & ground rent'],
    415: ['R', '民泊の売上', 'Short-stay sales'],
    619: ['R', '雑収入（保険金など）', 'Other income (insurance etc.)'],
    510: ['X', '管理費・管理委託料', 'Management fees'],
    511: ['X', '修繕費', 'Repairs'],
    512: ['X', '租税公課', 'Property taxes'],
    513: ['X', '損害保険料', 'Insurance'],
    514: ['X', '広告料（AD）', 'Leasing ads'],
    515: ['X', '減価償却費', 'Depreciation'],
    516: ['X', '支払利息', 'Loan interest'],
    517: ['X', '支払手数料', 'Fees'],
    518: ['X', '水道光熱・消耗品', 'Utilities & supplies'],
    519: ['X', '雑費', 'Miscellaneous'],
    520: ['X', '役員報酬', "Director's pay"],
    521: ['X', '法定福利費（社会保険の会社の分）', 'Social insurance (company share)'],
    530: ['X', '税理士の報酬', 'Accountant fees'],
    531: ['X', '創立費（設立の費用）', 'Formation costs'],
    690: ['SI', '固定資産売却益', 'Gain on sale of property'],
    691: ['SL', '固定資産売却損', 'Loss on sale of property'],
    700: ['TX', '法人税・住民税・事業税', 'Corporate taxes']
  };
  var CODES = Object.keys(ACCTS).map(Number).sort(function (a, b) { return a - b; });
  var CO_CODES = Object.keys(CO_ACCTS).map(Number).sort(function (a, b) { return a - b; });
  var DEBIT = { A: 1, X: 1, Q: 1, SL: 1, TX: 1 };
  var PL = { R: 1, X: 1, P: 1, Q: 1, SI: 1, SL: 1, TX: 1 };
  function type(c, ch) { ch = ch || ACCTS; return ch[c] ? ch[c][0] : null; }
  function isDebit(c, ch) { return !!DEBIT[type(c, ch)]; }
  function isPL(c, ch) { return !!PL[type(c, ch)]; }
  function acctName(c, ch) { var a = (ch || ACCTS)[c]; return a ? (L.get() === 'en' ? a[2] : a[1]) : String(c); }
  L.add({
    books_monthBanner: ['{y}年目が終わった', 'YEAR {y} DONE'],
    books_adjust:      ['残高の調整（道具）', 'Balance adjustment (tools)'],
    books_close:       ['{y}年目の締め（損益を元入金へ）', 'Year {y} close (P&L to capital)']
  });
  function blankGl() { var g = {}; CODES.forEach(function (c) { g[c] = 0; }); return g; }
  var JR_MAX = 120;
  var closing = false;
  var cur = null;
  var lending = false;
  function post(dr, cr, v, memo) {
    if (cur === 'co' && S.hojin && S.hojin.gl) return postCo(dr, cr, v, memo);
    v = Math.round(v);
    if (!(v > 0) || !ACCTS[dr] || !ACCTS[cr]) return 0;
    var g = S.gl;
    g[dr] += isDebit(dr) ? v : -v;
    g[cr] += isDebit(cr) ? -v : v;
    var y = closing ? null : S.yr;
    if (y) {
      if (isPL(dr)) y.acc[dr] = (y.acc[dr] || 0) + (isDebit(dr) ? v : -v);
      if (isPL(cr)) y.acc[cr] = (y.acc[cr] || 0) + (isDebit(cr) ? -v : v);
    }
    var f = closing ? null : S.fin;
    if (f) {
      if (isPL(dr)) f.mAcc[dr] = (f.mAcc[dr] || 0) + (isDebit(dr) ? v : -v);
      if (isPL(cr)) f.mAcc[cr] = (f.mAcc[cr] || 0) + (isDebit(cr) ? -v : v);
    }
    if (memo !== false) {
      S.jr.push({ t: Math.round(S.t), mo: f ? f.month : 0, dr: dr, cr: cr, v: v, m: memo || '' });
      if (S.jr.length > JR_MAX) S.jr.splice(0, S.jr.length - JR_MAX);
    }
    return v;
  }
  var CO_JR_MAX = 60;
  function postCo(dr, cr, v, memo) {
    var c = S.hojin, g = c.gl;
    v = Math.round(v);
    if (!(v > 0)) return 0;
    if (!CO_ACCTS[dr] || !CO_ACCTS[cr]) { c.miss = (c.miss || 0) + 1; return 0; }
    g[dr] = (g[dr] || 0) + (isDebit(dr, CO_ACCTS) ? v : -v);
    g[cr] = (g[cr] || 0) + (isDebit(cr, CO_ACCTS) ? -v : v);
    if (!closing) {
      [c.yr.acc, c.mAcc].forEach(function (a) {
        if (isPL(dr, CO_ACCTS)) a[dr] = (a[dr] || 0) + (isDebit(dr, CO_ACCTS) ? v : -v);
        if (isPL(cr, CO_ACCTS)) a[cr] = (a[cr] || 0) + (isDebit(cr, CO_ACCTS) ? -v : v);
      });
    }
    if (memo !== false) {
      c.jr.push({ mo: S.fin ? S.fin.month : 0, dr: dr, cr: cr, v: v, m: memo || '' });
      if (c.jr.length > CO_JR_MAX) c.jr.splice(0, c.jr.length - CO_JR_MAX);
    }
    if (g[100] < 0 && !lending) lend(-g[100]);
    return v;
  }
  function lend(v) {
    var prev = cur;
    lending = true;
    try {
      cur = null; post(175, 100, v, { k: 'coLend' });
      cur = 'co'; postCo(100, 250, v, { k: 'coLend' });
    } finally { cur = prev; lending = false; }
  }
  function repayOwner(v) {
    var c = S.hojin;
    if (!c || !c.gl) return 0;
    v = Math.round(Math.min(v, c.gl[250] || 0, c.gl[100] || 0));
    if (!(v > 0)) return 0;
    var prev = cur;
    try {
      cur = 'co'; postCo(250, 100, v, { k: 'coRepay' });
      cur = null; post(100, 175, v, { k: 'coRepay' });
    } finally { cur = prev; }
    return v;
  }
  function inBook(owner, fn) {
    var prev = cur;
    cur = owner === 'co' && S.hojin && S.hojin.gl ? 'co' : null;
    try { return fn(); } finally { cur = prev; }
  }
  function coBal(c) { return S.hojin && S.hojin.gl ? S.hojin.gl[c] || 0 : 0; }
  function cashFor(p) {
    var own = typeof p === 'string' ? p : p && p.owner;
    return bal(100) + (own === 'co' ? Math.max(0, coBal(100)) : 0);
  }
  var accBuf = {};
  function accrue(dr, cr, v) {
    var k = dr + '|' + cr;
    accBuf[k] = (accBuf[k] || 0) + v;
    var n = Math.floor(accBuf[k]);
    if (n >= 1) { accBuf[k] -= n; post(dr, cr, n, false); }
  }
  function bal(c) { return S.gl[c] || 0; }
  var SPEND_ALIAS = { travel: 623, rent: 519, util: 519 };
  function earn(v, code, memo) { return post(100, code || 619, v, memo); }
  function spend(v, code, memo) {
    if (typeof code === 'string') code = SPEND_ALIAS[code] || 519;
    return post(code || 519, 100, v, memo);
  }
  function plOf(acc, ch) {
    var o = { rentRev: 0, rentExp: 0, dep: 0, interest: 0, home: 0, homeOut: 0, gain: 0, tax: 0, by: {} };
    Object.keys(acc || {}).forEach(function (k) {
      var c = +k, v = acc[k] || 0, t = type(c, ch);
      o.by[c] = v;
      if (t === 'R') o.rentRev += v;
      else if (t === 'X') { o.rentExp += v; if (c === 515) o.dep += v; if (c === 516) o.interest += v; }
      else if (t === 'P') o.home += v;
      else if (t === 'Q') o.homeOut += v;
      else if (t === 'SI') o.gain += v;
      else if (t === 'SL') o.gain -= v;
      else if (t === 'TX') o.tax += v;
    });
    o.rentIncome = o.rentRev - o.rentExp;
    o.net = o.rentIncome + o.home - o.homeOut + o.gain - o.tax;
    return o;
  }
  function bsOf(gl, codes, ch) {
    var a = 0, l = 0, e = 0, pl = 0;
    codes.forEach(function (c) {
      var t = type(c, ch), v = gl[c] || 0;
      if (t === 'A') a += v; else if (t === 'XA') a -= v;
      else if (t === 'L') l += v; else if (t === 'E') e += v;
      else if (isPL(c, ch)) pl += isDebit(c, ch) ? -v : v;
    });
    return { assets: a, liab: l, equity: e + pl, diff: a - l - e - pl };
  }
  function bs() { return bsOf(S.gl, CODES); }
  function coBs() { return S.hojin && S.hojin.gl ? bsOf(S.hojin.gl, CO_CODES, CO_ACCTS) : { assets: 0, liab: 0, equity: 0, diff: 0 }; }
  function update(dt) {
    var f = S.fin;
    if (S.life && !S.life.chosen) return;
    f.tMonth += dt;
    if (f.tMonth >= W.MONTH) { f.tMonth -= W.MONTH; monthEnd(); }
  }
  function monthEnd() {
    var f = S.fin;
    G.emit('monthEndPre', { month: f.month });
    f.lastAcc = f.mAcc; f.mAcc = {};
    if (S.hojin && S.hojin.gl) { S.hojin.lastAcc = S.hojin.mAcc; S.hojin.mAcc = {}; }
    var p = plOf(f.lastAcc);
    histPush(f);
    f.series = (f.series || []).concat([{ r: Math.round(p.rentRev), e: Math.round(p.rentExp), p: Math.round(p.rentIncome),
                                          cf: Math.round(G.monthCF ? G.monthCF() : 0), net: Math.round(G.netWorth ? G.netWorth() : 0) }]).slice(-36);
    f.month++;
    var yearEnd = (f.month - 1) % 12 === 0;
    closeMo = f.month - 1;
    try {
      G.emit('monthEnd', { month: f.month - 1 });
      if (yearEnd) {
        G.emit('yearEndPre', { year: S.yr.n, pl: plOf(S.yr.acc) });
        f.year++;
        closeYear();
      }
    } finally { closeMo = 0; }
  }
  var HIST_MAX = 1200;
  var closeMo = 0;
  function k1000(v) { return v == null || !isFinite(v) ? null : Math.round(v / 1000); }
  function histNew(f) {
    var se = f.series || [], h = { m0: f.month - se.length, cf: [], net: [], debt: [], cash: [], ev: [] };
    se.forEach(function (e) {
      h.cf.push(e.cf != null ? k1000(e.cf) : null); h.net.push(e.net != null ? k1000(e.net) : null);
      h.debt.push(null); h.cash.push(null);
    });
    return h;
  }
  function histPush(f) {
    var h = f.hist || (f.hist = histNew(f));
    while (h.m0 + h.cf.length < f.month) { h.cf.push(null); h.net.push(null); h.debt.push(null); h.cash.push(null); }
    if (h.m0 + h.cf.length > f.month) return;
    h.cf.push(k1000(G.rentCF ? G.rentCF() : 0));
    h.net.push(k1000(G.netWorth ? G.netWorth() : 0));
    h.debt.push(k1000(bal(210) + bal(215) + coBal(210)));
    h.cash.push(k1000(bal(100) + coBal(100)));
    var cut = h.cf.length - HIST_MAX;
    if (cut > 0) { ['cf', 'net', 'debt', 'cash'].forEach(function (n) { h[n].splice(0, cut); }); h.m0 += cut; }
  }
  function histMark(k, v) {
    var f = S.fin; if (!f || (S.life && !S.life.chosen)) return;
    var h = f.hist || (f.hist = histNew(f));
    var e = { m: closeMo || f.month, k: k };
    if (v != null) e.v = v;
    h.ev.push(e);
    if (h.ev.length > 80) h.ev.splice(0, h.ev.length - 80);
  }
  G.on('freedom', function () { histMark('free'); });
  G.on('peak', function (d) { histMark('peak', d && d.target); });
  G.on('retired', function () { histMark('retire'); });
  G.on('inherit', function () { histMark('inherit'); });
  function closeYear() {
    var y = S.yr, prevCur = cur;
    cur = null;
    y.prev = { n: y.n, acc: y.acc };
    y.hist.push({ n: y.n, pl: plOf(y.acc) });
    if (y.hist.length > 40) y.hist.shift();
    closing = true;
    CODES.forEach(function (c) {
      if (!isPL(c) || !S.gl[c]) return;
      var v = S.gl[c];
      if (isDebit(c)) { if (v > 0) post(300, c, v, false); else post(c, 300, -v, false); }
      else { if (v > 0) post(c, 300, v, false); else post(300, c, -v, false); }
    });
    closeCoYear();
    closing = false;
    cur = prevCur;
    y.n++; y.acc = {};
    G.emit('yearEnd', { year: y.n - 1, pl: plOf(y.prev.acc) });
  }
  function closeCoYear() {
    var c = S.hojin;
    if (!c || !c.gl) return;
    var y = c.yr, g = c.gl;
    y.prev = { n: y.n, acc: y.acc };
    y.hist.push({ n: y.n, pl: plOf(y.acc, CO_ACCTS) });
    if (y.hist.length > 40) y.hist.shift();
    CO_CODES.forEach(function (k) {
      if (!isPL(k, CO_ACCTS) || !g[k]) return;
      g[310] = (g[310] || 0) + (isDebit(k, CO_ACCTS) ? -g[k] : g[k]);
      g[k] = 0;
    });
    y.n++; y.acc = {};
  }
  Object.defineProperty(S, 'coins', {
    configurable: true,
    get: function () { return S.gl ? S.gl[100] : 0; },
    set: function (v) {
      if (!S.gl) return;
      var d = Math.round(v - S.gl[100]);
      if (!d) return;
      S.booksAdj = (S.booksAdj || 0) + 1;
      if (d > 0) post(100, 619, d, 'adjust'); else post(519, 100, -d, 'adjust');
    }
  });
  function freshFin() {
    return { month: 1, year: 1, tMonth: 0, mAcc: {}, lastAcc: {}, series: [], hist: null };
  }
  function reset(S) {
    S.gl = blankGl(); S.jr = []; S.booksAdj = 0;
    S.yr = { n: 1, acc: {}, prev: null, hist: [] };
    S.fin = freshFin();
    accBuf = {};
  }
  G.mod({
    id: 'books', order: 20,
    reset: reset,
    update: function (S, dt) { update(dt); },
    save: function (S) { return { gl: S.gl, jr: S.jr, yr: S.yr, fin: S.fin }; },
    load: function (S, o) {
      reset(S);
      if (o.gl) Object.keys(o.gl).forEach(function (k) { if (ACCTS[k]) S.gl[k] = o.gl[k] || 0; });
      S.jr = o.jr || [];
      if (o.yr) S.yr = o.yr;
      var f0 = freshFin();
      S.fin = o.fin || f0;
      Object.keys(f0).forEach(function (k) { if (S.fin[k] == null) S.fin[k] = f0[k]; });
    }
  });
  Object.assign(G, {
    post: post, accrue: accrue, bal: bal, earn: earn, spend: spend,
    invest: function (v) { return spend(v, 519, 'invest'); },
    books: { ACCTS: ACCTS, CODES: CODES, type: type, isDebit: isDebit, isPL: isPL, name: acctName, plOf: plOf, bs: bs,
             yearPL: function () { return plOf(S.yr.acc); }, prevPL: function () { return S.yr.prev ? plOf(S.yr.prev.acc) : null; },
             monthPL: function (last) { return plOf(last ? S.fin.lastAcc : S.fin.mAcc); },
             CO_ACCTS: CO_ACCTS, CO_CODES: CO_CODES, coBs: coBs,
             coName: function (c) { return acctName(c, CO_ACCTS); }, coType: function (c) { return type(c, CO_ACCTS); },
             coYearPL: function () { return S.hojin && S.hojin.yr ? plOf(S.hojin.yr.acc, CO_ACCTS) : null; },
             coPrevPL: function () { return S.hojin && S.hojin.yr && S.hojin.yr.prev ? plOf(S.hojin.yr.prev.acc, CO_ACCTS) : null; } },
    inBook: inBook, coBal: coBal, cashFor: cashFor, coRepayOwner: repayOwner,
    bookNow: function () { return cur; }
  });
})(window.QT);
