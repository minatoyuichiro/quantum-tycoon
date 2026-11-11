(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE, W = QT.World;
  var J = E.JIKKA;
  function T(k, v) { return L.t(k, v); }
  function fmt(v) { return G.fmt(Math.round(v)); }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + fmt(Math.abs(v)); }
  function r10k(v) { return Math.round(v / 10000) * 10000; }
  L.add({
    ih_name:       ['実家', "Parents' home"],
    ih_banner:     ['実家を受け継ぐことになった', 'YOU INHERIT THE FAMILY HOME'],
    ih_bannerSub:  ['両親から流山・柏の実家を受け継ぐことになった。実家に寄って、これからのことを決めよう', 'Your parents have left you the family home in Kashiwa. Stop by and decide what to do with it'],
    ih_taxBanner:  ['相続税の申告', 'INHERITANCE TAX'],
    ih_taxBannerSub:['相続税 {v} を10か月以内に納める', 'Pay {v} within 10 months'],
    ih_taxPaid:    ['相続税 {v} を納めた', 'Paid inheritance tax {v}'],
    ih_soldSub:    ['{n}・{v}（譲渡所得 {g}・税 {t}）', '{n} · {v} (taxable gain {g}, tax {t})'],
    ih_rentStart:  ['実家を貸しに出した', 'THE FAMILY HOME IS UP FOR RENT'],
    ih_rentStartSub:['遺品整理とリフォーム {v}。入居者を募集中', 'Clear-out and renovation {v}. Looking for a tenant'],
    ih_listed:     ['実家を売りに出した', 'THE FAMILY HOME IS ON THE MARKET'],
    ih_listedSub:  ['{v}・取り壊しは買い主がする（古家付きの土地）', '{v} · the buyer will demolish (land with an old house)'],
    ih_care:       ['換気と草むしりをした', 'Aired the house and pulled the weeds'],
    ih_tidy:       ['空き家を片付けた（勧告が外れた）', 'Tidied the house (the notice was lifted)'],
    ih_warn1:      ['空き家: 近所から「草が伸びている」と連絡', 'Empty house: neighbours say the weeds are getting tall'],
    ih_warn1Sub:   ['実家に寄って手入れしよう（長押し）。管理サービスに頼むこともできる', 'Stop by and tidy up (hold), or hire a caretaker'],
    ih_warn2:      ['空き家: 市から助言・指導', 'Empty house: the city has written to you'],
    ih_warn2Sub:   ['このままだと「管理不全空家」の勧告になる', 'Leave it and it will be declared a neglected empty house'],
    ih_warn3:      ['空き家: 管理不全空家の勧告', 'EMPTY HOUSE: OFFICIAL NOTICE'],
    ih_warn3Sub:   ['住宅用地の特例が外れ、土地の税が{x}倍に（年{v}）', 'Residential land relief removed: land tax ×{x} ({v}/yr)'],
    ih_dl12:       ['空き家の特例: あと1年', 'Empty-house relief: 1 year left'],
    ih_dl3:        ['空き家の特例: あと3か月', 'Empty-house relief: 3 months left'],
    ih_dlSub:      ['相続から3年目の年末までに売れば、譲渡所得から3,000万円を引ける', 'Sell by the end of the 3rd year after inheriting to deduct ¥30M from the gain'],
    ih_needCash:   ['手元が足りない（{v} 要る）', 'Not enough cash (needs {v})'],
    ih_onSale:     ['売りに出しているあいだは貸せない（取り下げてから）', 'Cannot let it while it is on the market (withdraw first)'],
    ih_owePaid:    ['きょうだいに代償金 {v} を渡した', 'Paid your sibling their share {v}'],
    ih_padNew:     ['受け継いだ実家', 'The family home'],
    ih_padNewS:    ['これからのことを決める', 'Decide what to do'],
    ih_padCare:    ['空き家の手入れ', 'Tidy the empty house'],
    ih_padCareS:   ['換気・草むしり（{n}か月ぶり）', 'Air it & weed ({n} months since)'],
    ih_padTidy:    ['空き家を片付ける', 'Clean up the empty house'],
    ih_padTidyS:   ['草刈り・修繕 {v}（勧告を外す）', 'Mowing & repairs {v} (lift the notice)'],
    ih_padAkiya:   ['実家（空き家）', 'Family home (empty)'],
    ih_padRent:    ['実家（貸している）', 'Family home (let)'],
    ih_padSold:    ['これまでのこと', 'Looking back'],
    ih_padOpen:    ['くわしく', 'Details']
  });
  function h01(seed) {
    var x = Math.abs(Math.floor(seed)) % 2147483647 || 1;
    for (var i = 0; i < 5; i++) x = (x * 48271) % 2147483647;
    return x / 2147483647;
  }
  function schedule() {
    var lf = S.life;
    if (!lf || !lf.chosen || S.props.home) return;
    var r = J.at[lf.kind] || J.at.worker;
    var seed = ((S.mkt && S.mkt.seed) || 1) + Math.floor((S.t || 0) * 7);
    var age = r[0] + Math.floor(h01(seed) * (r[1] - r[0] + 1)), mo = Math.floor(h01(seed + 17) * 12);
    var at = S.fin.month + (age - lf.age) * 12 - ((lf.months || 0) % 12) + mo;
    if (at <= S.fin.month) at = S.fin.month + 6 + mo;
    S.inh = { at: at, age: age, done: false };
  }
  function areaIx() { var as = E.AREAS.futako || []; for (var i = 0; i < as.length; i++) if (as[i].id === J.area) return i; return 0; }
  function bldgEval() { return r10k(J.size * E.BUILD_COST.w * J.koteiBldg * 0.2); }
  function inhTaxOf(v) {
    if (v <= 0) return 0;
    for (var i = 0; i < E.INH_TAX.length; i++) { var b = E.INH_TAX[i]; if (v <= b[0]) return Math.max(0, v * b[1] - b[2]); }
    return 0;
  }
  function calc(p) {
    var mk = G.estate.landValue(p), house = G.estate.value(p);
    var c = { market: r10k(mk), house: house, land: r10k(mk * J.rosen), kLand: r10k(mk * J.koteiLand), bldg: bldgEval(), savings: J.savings, funeral: J.funeral };
    c.total = c.land + c.bldg + c.savings - c.funeral;
    c.basic = J.basic + J.perHeir * J.heirs;
    c.taxable = Math.max(0, c.total - c.basic);
    c.owe = Math.max(0, Math.round((house - (house + c.savings - c.funeral) / J.heirs) / 100000) * 100000);
    c.taxTotal = Math.round(inhTaxOf(c.taxable / J.heirs) * J.heirs / 100) * 100;
    c.mineV = c.land + c.bldg;
    var oweEval = house > 0 ? c.owe * c.mineV / house : 0;
    c.share = Math.max(0, Math.min(1, (c.mineV - oweEval) / Math.max(1, c.total)));
    c.mine = Math.round(c.taxTotal * c.share / 100) * 100;
    return c;
  }
  function propTax(p, relief) {
    var ev = G.estate.landValue(p) * J.koteiLand;
    var off = !relief && p && p.inh && p.inh.kankoku;
    var land = off ? ev * J.burden * (J.taxLand + J.taxCity) : ev * (J.taxLand * J.smallLand + J.taxCity * J.smallCity);
    var b = (S.inh && S.inh.calc ? S.inh.calc.bldg : bldgEval()) * J.taxBldg;
    return Math.round((land + b) / 100) * 100;
  }
  function upkeepYear(p) { return p && p.inh && p.inh.mode === 'akiya' && p.inh.svc ? J.svc * 12 : 0; }
  function deadline(m0) { return 12 * (Math.ceil(m0 / 12) + J.specialYears); }
  function inherit() {
    var site = W.BY_ID.home;
    if (!site || S.props.home) { S.inh.done = true; return null; }
    var K = E.KINDS.ko;
    var p = { id: 'home', dist: site.room, kind: 'ko', area: areaIx(), walk: J.walk, areaMul: J.size / K.area,
              built: J.built - J.startYear, landA: J.landA, landK: J.landK,
              units: [{ occ: false, rent: 0, until: 0, sat: 0.8 }], cond: J.cond, insp: true, own: true, mgmt: 'co', trouble: [],
              building: null, ctr: null, cparkLease: false, rentMul: 1, capAdd: 0, lastRev: null };
    var c = calc(p);
    G.post(120, 300, c.land, { k: 'inherit', p: 'home' });
    G.post(130, 300, c.bldg, { k: 'inherit', p: 'home' });
    if (c.owe > 0) G.post(300, 240, c.owe, { k: 'inhOwe' });
    p.lCost = c.land; p.bCost = c.bldg; p.noDep = c.bldg; p.depDone = 0; p.depLeft = 0; p.depYear = 0;
    p.buyAt = S.fin.month; p.buyYear = 1 - (J.startYear - J.built); p.buyPrice = 0;
    p.inh = { mode: 'akiya', rented: false, cleared: false, neglect: 0, stage: 0, svc: false, kankoku: false };
    S.props.home = p;
    var reg = Math.round((c.kLand + c.bldg) * J.reg / 100) * 100 + J.scrivener;
    G.post(624, 100, reg, { k: 'inhReg' });
    var h = S.inh;
    h.done = true; h.month = S.fin.month; h.age = S.life.age; h.calc = c; h.regFee = reg; h.deadline = deadline(S.fin.month); h.seen = false;
    if (c.mine > 0) {
      G.post(701, 230, c.mine, { k: 'inhTax' });
      h.taxLeft = c.mine; h.taxDue = S.fin.month + J.payMonths;
    }
    G.banner(T('ih_banner'), T('ih_bannerSub'), '#8a7fb8', 'new');
    if (c.mine > 0) G.banner(T('ih_taxBanner'), T('ih_taxBannerSub', { v: yen(c.mine) }), '#8a7fb8', 'warn');
    G.emit('inherit', { p: p, calc: c });
    return p;
  }
  function akiyaMonth(p) {
    var h = p.inh;
    var cared = h.svc || h.neglect === 0;
    p.cond = Math.min(1, (p.cond || 0) + (cared ? J.wearCare : J.wearAkiya) / 12);
    G.post(625, 100, Math.round(G.estate.value(p) * E.INSURE / 12), false);
    if (h.svc) G.post(625, 100, J.svc, false);
    if (h.svc) { h.neglect = 0; h.stage = 0; return; }
    h.neglect = (h.neglect || 0) + 1;
    if (h.stage < 1 && h.neglect >= J.warn) { h.stage = 1; G.banner(T('ih_warn1'), T('ih_warn1Sub'), '#f2a63b', 'warn'); }
    else if (h.stage < 2 && h.neglect >= J.guide) { h.stage = 2; G.banner(T('ih_warn2'), T('ih_warn2Sub'), '#e2504a', 'warn'); }
    else if (h.stage < 3 && h.neglect >= J.kankoku) {
      h.stage = 3; h.kankoku = true;
      var a = propTax(p, true), b = propTax(p);
      G.banner(T('ih_warn3'), T('ih_warn3Sub', { x: (landTax(p, false) / Math.max(1, landTax(p, true))).toFixed(1), v: yen(b) }), '#e2504a', 'warn');
      G.emit('akiyaKankoku', { before: a, after: b });
    }
  }
  function landTax(p, relief) {
    var ev = G.estate.landValue(p) * J.koteiLand;
    return relief ? ev * (J.taxLand * J.smallLand + J.taxCity * J.smallCity) : ev * J.burden * (J.taxLand + J.taxCity);
  }
  function care() {
    var p = home();
    if (!p || p.inh.mode !== 'akiya') return { ok: false };
    var h = p.inh;
    if (h.kankoku) {
      if (S.gl[100] < J.tidy) return { ok: false, why: T('ih_needCash', { v: yen(J.tidy) }) };
      G.post(625, 100, J.tidy, { k: 'akiyaTidy' });
      h.kankoku = false;
      p.cond = Math.max(0, (p.cond || 0) - 0.03);
      G.toast(G.estate.pos(p), T('ih_tidy'), '#2fbf7a', { big: true });
    } else G.toast(G.estate.pos(p), T('ih_care'), '#2fbf7a');
    h.neglect = 0; h.stage = 0;
    G.emit('akiyaCare', {});
    return { ok: true };
  }
  function setSvc(on) { var p = home(); if (p && p.inh.mode === 'akiya') { p.inh.svc = !!on; if (on) { p.inh.neglect = 0; p.inh.stage = Math.min(p.inh.stage, 2); } } }
  function home() { var p = S.props && S.props.home; return p && p.own && p.inh ? p : null; }
  function clearCost(p) { return p.inh.cleared ? 0 : J.clearOut; }
  function owed() { return G.bal(240); }
  function rentCost(p) { return clearCost(p) + J.reform; }
  function payOwe(memo) {
    var v = owed();
    if (memo === 'inhOwePaid' && S.gl[100] < v) return 0;
    if (v > 0) {
      G.post(240, 100, v, { k: memo || 'inhOwePaid' });
      G.toast({ x: S.player.x, y: S.player.y - 34 }, T('ih_owePaid', { v: yen(v) }), '#8a7fb8', { big: true });
    }
    return v;
  }
  function clearOut(p) {
    if (p.inh.cleared) return;
    p.inh.cleared = true;
    G.post(624, 100, J.clearOut, { k: 'inhClear' });
  }
  function startRent() {
    var p = home();
    if (!p || p.inh.mode !== 'akiya') return { ok: false };
    if (p.sale) return { ok: false, why: T('ih_onSale') };
    var c = rentCost(p);
    if (S.gl[100] < c) return { ok: false, why: T('ih_needCash', { v: yen(c) }) };
    clearOut(p);
    G.post(130, 100, J.reform, { k: 'inhReform', p: 'home' });
    p.bCost = (p.bCost || 0) + J.reform;
    G.estate.setDep(p);
    p.cond = 0.15; p.bigWarned = false; p.mgmt = 'co';
    p.inh.mode = 'rent'; p.inh.rented = true; p.inh.kankoku = false; p.inh.neglect = 0; p.inh.stage = 0; p.inh.svc = false;
    G.banner(T('ih_rentStart'), T('ih_rentStartSub', { v: yen(c) }), '#2fbf7a', 'good');
    G.emit('inhRent', { p: p });
    return { ok: true };
  }
  function startSell(mode) {
    var p = home();
    if (!p || p.sale) return { ok: false };
    var c = clearCost(p);
    if (S.gl[100] < c) return { ok: false, why: T('ih_needCash', { v: yen(c) }) };
    clearOut(p);
    G.estate.list('home', mode || 'market');
    if (p.sale) G.banner(T('ih_listed'), T('ih_listedSub', { v: yen(p.sale.price) }), '#f5b21c', 'good');
    return { ok: true };
  }
  function specialOk(p, price) {
    var h = p.inh || {}, m = S.fin.month, dl = S.inh && S.inh.deadline || 0;
    var rows = [
      { k: 'built', ok: J.built < J.builtLimit },
      { k: 'alone', ok: true },
      { k: 'time', ok: m <= dl, left: Math.max(0, dl - m) },
      { k: 'price', ok: price <= J.specialMax },
      { k: 'unused', ok: !h.rented },
      { k: 'demolish', ok: true }
    ];
    return { ok: rows.every(function (r) { return r.ok; }), rows: rows };
  }
  function saleTax(p, price, fee) {
    var improve = Math.max(0, (p.bCost || 0) - (p.noDep || 0) - (p.depDone || 0));
    var acq = Math.max(Math.round(price * J.acqRate), improve);
    var base = price - acq - fee, sp = specialOk(p, price);
    var ded = sp.ok ? Math.min(Math.max(0, base), J.special) : 0;
    var taxable = base - ded;
    return { price: price, fee: fee, acq: acq, base: base, ded: ded, taxable: taxable, special: sp,
             tax: Math.round(Math.max(0, taxable) * E.GAIN_LONG), taxNo: Math.round(Math.max(0, base) * E.GAIN_LONG) };
  }
  function salePreview(p, mode) {
    var price = Math.round(G.estate.value(p) * (mode === 'fast' ? 0.92 : 1) / 100000) * 100000;
    var fee = Math.round(price * E.SELL_FEE), st = saleTax(p, price, fee);
    st.owe = owed();
    st.net = price - fee - st.tax - clearCost(p) - st.owe;
    return st;
  }
  function rentPreview(p) {
    var Es = G.estate, rent = Es.unitRent(p), occ = Es.yields(p).occ;
    var fixed = (propTax(p, true) + Es.value(p) * E.INSURE) / 12;
    return { rent: rent, cost: rentCost(p), cf: Math.round(rent * occ * (1 - E.MGMT_FEE) - rent * 0.05 - fixed) };
  }
  function padInfo() {
    var h = S.inh;
    if (!h || !h.done) return null;
    var p = S.props.home;
    if (!p || !p.own) return { label: T('pl_home'), sub: T('ih_padSold'), can: true, hold: 0.4, quiet: true };
    if (p.inh.mode === 'akiya') {
      if (!h.seen) return { label: T('ih_padNew'), sub: T('ih_padNewS'), can: true, hold: 0.4, col: '#8a7fb8' };
      if (p.inh.kankoku) return { label: T('ih_padTidy'), sub: T('ih_padTidyS', { v: '-' + yen(J.tidy) }), can: S.gl[100] >= J.tidy, hold: 1.2, col: '#e2504a' };
      if (!p.inh.svc && p.inh.neglect >= 2) return { label: T('ih_padCare'), sub: T('ih_padCareS', { n: p.inh.neglect }), can: true, hold: 1.2, col: '#f2a63b' };
      return { label: T('ih_padAkiya'), sub: T('ih_padNewS'), can: true, hold: 0.4, quiet: true };
    }
    if (p.trouble.length) {
      var tr = p.trouble[0];
      return { label: T('est_tr_' + tr.k), sub: T('est_fix') + (tr.cost ? ' -¥' + fmt(tr.cost) : ''), can: true, hold: 0.9, col: '#e2504a' };
    }
    var vw = G.deals ? G.deals.viewInfo(p) : null;
    if (vw) return vw;
    if (p.pend > 0) return { label: T('est_collect'), sub: '+¥' + fmt(p.pend), gain: p.pend, can: true, hold: 0.5, col: '#f5b21c' };
    return { label: T('ih_padRent'), sub: T('ih_padOpen'), can: true, hold: 0.4, quiet: true };
  }
  function padAct() {
    var h = S.inh, p = S.props.home;
    if (!h || !h.done || !p || !p.own) return false;
    if (p.inh.mode === 'akiya') {
      if (h.seen && (p.inh.kankoku || (!p.inh.svc && p.inh.neglect >= 2))) {
        var r = care();
        if (!r.ok && r.why) G.toast(G.estate.pos(p), r.why, '#e2504a', { big: true });
      }
      return false;
    }
    if (p.trouble.length) { G.estate.fixTrouble(p.id); return true; }
    if (G.deals && G.deals.viewInfo(p)) { G.deals.attend(p.id); return true; }
    if (p.pend > 0) { G.estate.collect(p.id); return true; }
    return false;
  }
  function needVisit() {
    var h = S.inh, p = S.props && S.props.home;
    return !!(h && h.done && p && p.own && p.inh.mode === 'akiya' && (!h.seen || p.inh.kankoku));
  }
  function monthEnd() {
    if (!S.life || !S.life.chosen) return;
    if (!S.inh) { if (!S.props.home) schedule(); return; }
    var h = S.inh;
    if (!h.done && S.fin.month >= h.at) inherit();
    if (h.taxLeft > 0 && S.fin.month >= h.taxDue) {
      var v = Math.min(h.taxLeft, G.bal(230));
      if (v > 0) G.post(230, 100, v, { k: 'inhTaxPaid' });
      G.toast({ x: S.player.x, y: S.player.y - 20 }, T('ih_taxPaid', { v: yen(h.taxLeft) }), '#f2a63b');
      h.taxLeft = 0;
    }
    var p = home();
    if (p && p.inh.mode === 'akiya' && !p.sale && h.deadline) {
      var left = h.deadline - S.fin.month;
      if (left === 12) G.banner(T('ih_dl12'), T('ih_dlSub'), '#f5b21c', 'new');
      else if (left === 3) G.banner(T('ih_dl3'), T('ih_dlSub'), '#e2504a', 'warn');
    }
  }
  G.on('lifeBegin', function () { S.inh = null; if (!S.props.home) schedule(); });
  G.on('monthEnd', monthEnd);
  G.on('propSold', function (d) {
    if (!d || !d.p || d.p.id !== 'home' || !d.inh || !S.inh) return;
    if (d.p.inh && !d.p.inh.cleared) clearOut(d.p);
    var owe = payOwe('inhOweSale');
    S.inh.sold = { price: d.price, taxable: d.inh.taxable, tax: d.inh.tax, ded: d.inh.ded, taxNo: d.inh.taxNo, acq: d.inh.acq,
                   fee: d.inh.fee, month: S.fin.month, rented: !!(d.p.inh && d.p.inh.rented), owe: owe };
  });
  G.alertHook(function (S, add) {
    var p = home(), h = S.inh;
    if (!p || !h || p.inh.mode !== 'akiya') return;
    if (!h.seen) add('home', T('ih_padNew'), '#8a7fb8');
    else if (p.inh.kankoku) add('home', T('ih_padTidy'), '#e2504a');
    else if (p.inh.stage >= 1 && !p.inh.svc) add('home', T('ih_padCare'), '#f2a63b');
  });
  G.mod({
    id: 'inherit', order: 42,
    reset: function (S) { S.inh = null; },
    save: function (S) { return { inh: S.inh }; },
    load: function (S, o) { S.inh = o && o.inh && o.inh.at != null ? o.inh : null; }
  });
  G.inherit = {
    calc: calc, propTax: propTax, landTax: landTax, upkeepYear: upkeepYear, akiyaMonth: akiyaMonth, saleTax: saleTax, specialOk: specialOk,
    salePreview: salePreview, rentPreview: rentPreview, rentCost: rentCost, clearCost: clearCost, owed: owed,
    payOwe: function () { return payOwe('inhOwePaid') > 0 ? { ok: true } : { ok: false, why: T('ih_needCash', { v: yen(owed()) }) }; },
    rent: startRent, sell: startSell, care: care, setSvc: setSvc, home: home,
    padInfo: padInfo, padAct: padAct, needVisit: needVisit, inherit: inherit, schedule: schedule
  };
})(window.QT);
