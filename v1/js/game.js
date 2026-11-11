(function (QT) {
  'use strict';
  var W = QT.World, TILE = W.TILE, L = QT.L;
  var SAVE_KEY = 'quantum_tycoon_v15';
  var CFG = {
    startCoins: 20000,
    jobs: {
      reg:    { pay: 30000, time: 0.8 },
      stock:  { pay: 18000, time: 1.4 },
      brew:   { pay: 14000, time: 1.5 },
      cserve: { pay: 26000, time: 0.7 }
    },
    swBase: 80000,
    cloudFee: 12000,
    salary: 220000,
    staffDevTime: 9,
    devTime: 1.0,
    rdCost: 40000,
    rdTime: 1.4,
    rdPerLevel: 8,
    rdLevelPerLab: 1,
    rdStaffPay: 0.10,
    hwSpot: 0.12,
    hwasmQCap: 64,
    maintRate: 0.0012,
    defectRate: 0.0035,
    glutK: 10,
    glutDecay: 0.02,
    partCost: 90000,
    partsPerBuy: 4,
    stockCap: 12,
    cloudStep: 10,
    angelEvery: [150, 260],
    angelStay: 48,
    angelKeep: 0.96,
    angelBoost: 1.9,
    relMax: 10,
    visitCool: 40,
    cvcCool: 4,
    cvcRelMin: 3,
    pressCool: 90,
    pressLife: 100,
    missionTime: 150,
    missionCool: 15,
    payTermMin: 70,
    payTermMax: 130,
    custWait: 15,
    custMax: 3,
    custRate: 11,
    stockDecay: 2.5,
    cupsMax: 6,
    cupsPerBrew: 3,
    cafeWait: 14,
    cafeMax: 3,
    cafeRate: 9,
    cafeRepDrop: 0.05,
    cafeRepGain: 0.035,
    cafeRepMin: 0.35,
    delivPay: 60000,
    delivTime: 75,
    delivRush: 0.6,
    delivRelMax: 3,
    loans: {
      home:  { max: 300000,   step: 100000,  rate: 0.00 },
      kin:   { max: 2000000,  step: 400000,  rate: 0.03 },
      bankp: { max: 3000000,  step: 1000000, rate: 0.05, growth: 0.6, needRev: 1000000 }
    },
    notaryFee: 52000,
    registryFee: 150000,
    ipoTarget: 10000000000,
    primeTarget: 100000000000,
    priceEase: 240,
    bufCap: 6,
    outCap: 4,
    itemSpeed: 200,
    hePerBuild: 2,
    partsPerBuild: 2,
    truckGap: 20,
    truckStay: 40,
    heRunPerSec: 0.014,
    heCloudPerSec: 0.02,
    heSpotCost: 4000,
    heContractCost: 1200,
    userSmooth: 0.10,
    cloudBaseUsers: 150,
    cloudBaseArpu: 10,
    popDecay: 0.010,
    offlineCap: 4 * 3600,
    maxRounds: 5
  };
  function T(k, v) { return L.t(k, v); }
  L.add({
    qcGoal:     ['量子クラウドをLv{n}に：{sw}・{hw}', 'Q-cloud to Lv{n}: {sw}, {hw}'],
    qcSwLeft:   ['開発あと{n}', 'code {n} more'],
    qcSwOk:     ['開発OK', 'code OK'],
    qcHwLeft:   ['試作あと{n}', 'prototype {n} more'],
    qcHwOk:     ['試作OK', 'prototypes OK'],
    hintLounge: ['開発・試作 +10%', 'Dev/R&D +10%'],
    hintSphere: ['クラウド客 +15%・人気↑', 'Users +15%, buzz↑'],
    hintPop:    ['人気↑ → 企業価値↑', 'Buzz↑ → value↑'],
    hintDomain: ['クラウド客枠 +{n}', 'Cloud slots +{n}']
  });
  function nm(o, f) { return L.nm(o, f); }
  var GRADES = [['試作機', 'Prototype'], ['実験機', 'Lab unit'], ['製品機', 'Product'], ['商用機', 'Commercial']];
  function hwUnit(q) { return 400000 * Math.pow(Math.max(1, q) / 16, 0.55); }
  var QMAX = 1024;
  function tierQubits(tier) { return Math.min(QMAX, Math.pow(2, 3 + Math.floor(tier / 3.5))); }
  var SPEC_STEP = 3.5;
  function specPlan() {
    var rd = rdLevel(), pts = { rd: rd * 1.2, st: 0, lv: 0, fd: 0 }, nSt = 0, nF = 0;
    W.PIPELINE.forEach(function (id) {
      var st = S.p[id];
      if (!st.owned || !room(W.BY_ID[id].room)) return;
      nSt++; pts.st += 1 + rd * 0.12; pts.lv += (st.level - 1) * 0.35;
    });
    W.FEEDERS.forEach(function (id) {
      var st = S.p[id];
      if (!st.owned || !room(W.BY_ID[id].room)) return;
      nF++; pts.fd += 1 + (st.level - 1) * 0.3;
    });
    var tier = pts.rd + pts.st + pts.lv + pts.fd, q = tierQubits(tier);
    var max = q >= QMAX;
    return { tier: tier, q: q, next: max ? 0 : q * 2,
             need: max ? 0 : (Math.floor(tier / SPEC_STEP) + 1) * SPEC_STEP - tier,
             goal: SPEC_STEP * 7, pts: pts, nSt: nSt, nF: nF, rd: rd,
             rdGain: 1.2 + 0.12 * nSt };
  }
  function specGain(p) {
    var st = S.p[p.id];
    if (p.kind === 'stage') return st.owned ? 0.35 : 1 + rdLevel() * 0.12;
    if (p.kind === 'feeder') return st.owned ? 0.3 : 1;
    return 0;
  }
  function makeMachine(tier, q, parts, stagesOwned) {
    var qubits = tierQubits(tier);
    var qq = Math.max(20, Math.min(99, q));
    var price = Math.round(hwUnit(qubits) * (1 + 0.05 * stagesOwned) * (1 + 0.12 * parts) * rdMul());
    return {
      tier: tier, q: qq, qubits: qubits, price: price, parts: parts,
      gradeIdx: Math.min(3, parts),
      maint: price * CFG.maintRate,
      defect: (1 - qq / 100) * CFG.defectRate
    };
  }
  function gradeName(m) { var g = GRADES[m.gradeIdx || 0]; return L.get() === 'ja' ? g[0] : g[1]; }
  var S = {
    t: 0, coins: CFG.startCoins, pop: 0, users: 0, he: 6,
    bestQubits: 0, shipped: 0, svcCollected: 0, dcCollected: 0, obj: 0, rd: 0,
    swStock: 0, parts: 0, pendSales: 0, ar: [], vcAt: -9999, swDev: 0,
    angel: null, angelT: 120, angelDeals: 0, corps: {}, mission: null, missionAt: -9999,
    pressUntil: -9999, pressAt: -9999,
    truck: { state: 'away', t: 8, k: 0, load: 0 },
    won: false, seenWin: false, lastSave: 0, muted: false,
    co: { certified: false, founded: false, bank: false, shifts: 0 },
    equity: 1.0, rounds: 0,
    fin: { month: 1, year: 1, tMonth: 0, tYear: 0, rev: 0, exp: 0, lastRev: 0, lastExp: 0,
           totRev: 0, totExp: 0, bRent: 0, bOut: 0, bHe: 0, bCloud: 0, bPay: 0, bUtil: 0, bInt: 0,
           lastProfit: 0,
           yRev: 0, yExp: 0, yRent: 0, yOut: 0, yHe: 0, yCloud: 0, yPay: 0, yUtil: 0, yInt: 0,
           pRev: 0, pExp: 0,
           paidIn: 0, equip: 0, unpaid: 0,
           cfOp: 0, cfInv: 0, cfFin: 0, pOp: 0, pInv: 0, pFin: 0 },
    jobs: [], offer: null, offerT: 12, jobsDone: 0, jobsFailed: 0,
    store: { cust: [], stock: 100, spawnT: 2, lost: 0, served: 0 },
    cafe: { cust: [], cups: 0, spawnT: 3, lost: 0, served: 0, rep: 1 },
    deliv: null, delivDone: 0, delivLost: 0,
    loans: { home: 0, kin: 0, bankp: 0 },
    player: { x: 0, y: 0, dir: 0, walk: 0, carry: [] },
    p: {}, rooms: {}, items: [], outputs: [], contracts: [], dc: [],
    pendSvc: 0, pendDc: 0, fx: [], toasts: []
  };
  function room(id) { return !!S.rooms[id]; }
  function officeOn() { return !!(S.p.office && S.p.office.owned); }
  S.officeOn = officeOn;
  S.ownedStages = function () { return W.PIPELINE.filter(function (id) { return S.p[id].owned; }); };
  S.domainCount = function () {
    var n = 0;
    W.PLOTS.forEach(function (p) { if (p.kind === 'software' && S.p[p.id].owned) n++; });
    return n;
  };
  S.brokenCount = function () {
    var n = 0;
    for (var i = 0; i < S.contracts.length; i++) if (S.contracts[i].broken) n++;
    return n;
  };
  S.dcCapacity = function () { return 2 + qcLv() * 2; };
  S.heMax = function () { var h = S.p.helium; return h.owned ? 20 + h.level * 20 : 12; };
  S.levelsTotal = function () {
    var lv = 0;
    W.PLOTS.forEach(function (p) { lv += S.p[p.id].level; });
    return lv;
  };
  S.annualRev = function () {
    var f = S.fin;
    if (f.year > 1) return Math.max(f.yRev, f.pRev);
    var m = Math.max(1, f.month - 1);
    return f.yRev * (12 / Math.min(12, m));
  };
  S.netCash = function () { return Math.max(0, S.coins - debtTotal()); };
  S.avgProfit = function () {
    var h = S.fin.hist;
    if (!h || !h.length) return S.fin.lastProfit;
    var t = 0;
    for (var i = 0; i < h.length; i++) t += h[i];
    return t / h.length;
  };
  var VALUE_W = { profit: 12 * 10, rev: 4, cash: 0.5, tech: 900000, users: 40000,
                  contracts: 1500000, equip: 1.5, buzz: 2000000 };
  S.valueParts = function () {
    var w = VALUE_W;
    return [
      ['profit', Math.floor(Math.max(0, S.avgProfit()) * w.profit)],
      ['rev', Math.floor(S.annualRev() * w.rev)],
      ['cash', Math.floor(S.netCash() * w.cash)],
      ['tech', S.bestQubits * w.tech],
      ['users', Math.floor(S.users) * w.users],
      ['contracts', S.contracts.length * w.contracts],
      ['assets', Math.floor(S.fin.equip * w.equip)],
      ['buzz', Math.floor(S.pop * w.buzz)]
    ];
  };
  S.value = function () {
    if (!S.co.founded) return 0;
    var v = 0;
    S.valueParts().forEach(function (e) { v += e[1]; });
    return Math.floor(v);
  };
  function ipoChecks() {
    return [
      [T('value') + ' ' + fmt(S.value()) + '/' + fmt(CFG.ipoTarget), S.value() >= CFG.ipoTarget],
      [T('users') + ' ' + Math.floor(S.users) + '/3000', S.users >= 3000],
      [T('contracts') + ' ' + S.contracts.length + '/10', S.contracts.length >= 10],
      ['128 qubit', S.bestQubits >= 128]
    ];
  }
  var IPO_SHARES = 10000000;
  function ipoResult() {
    var v = S.value();
    var price = Math.max(100, Math.round(v / IPO_SHARES));
    var heat = Math.min(1.4, S.pop / 150) + (pressOn() ? 0.2 : 0) + Math.random() * 0.15;
    var open = Math.round(price * (1.05 + heat));
    var cap = open * IPO_SHARES;
    var wealth = Math.round(cap * S.equity);
    var min = S.t / 60;
    var rank = min <= 45 && wealth >= 150e8 ? 'S'
             : min <= 60 && wealth >= 80e8 ? 'A'
             : min <= 90 || wealth >= 40e8 ? 'B' : 'C';
    return { at: S.t, time: S.t, value: v, price: price, base: price, open: open, cap: cap,
             wealth: wealth, equity: S.equity, rank: rank,
             rev: S.fin.totRev, qubits: S.bestQubits, users: Math.floor(S.users),
             contracts: S.contracts.length, month: S.fin.month };
  }
  S.sharePrice = function () {
    var r = S.ipo;
    if (!r) return 0;
    var prem = (r.open / r.price - 1) * Math.exp(-Math.max(0, S.t - r.at) / 600);
    var base = r.base != null ? r.base : S.value() / IPO_SHARES;
    return Math.max(1, Math.round(base * (1 + prem)));
  };
  S.marketCap = function () { return S.ipo ? S.sharePrice() * IPO_SHARES : S.value(); };
  function shareText() {
    if (S.ipo) return T('shareIpo', { v: fmt(S.marketCap()) });
    if (S.co.founded) return T('shareMid', { m: S.fin.month, v: fmt(S.value()) });
    return T('shareStart');
  }
  var BEST_KEY = 'quantum_tycoon_best';
  function loadBest() {
    try { return JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveBest(r) {
    var b = loadBest() || {};
    r.newTime = !b.time || r.time < b.time;
    r.newWealth = !b.wealth || r.wealth > b.wealth;
    if (r.newTime) b.time = r.time;
    if (r.newWealth) b.wealth = r.wealth;
    b.clears = (b.clears || 0) + 1;
    try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { }
  }
  S.assets = function () {
    return { cash: S.coins, ar: arTotal() + S.pendSales, equip: S.fin.equip };
  };
  S.bs = function () {
    var a = S.assets();
    var total = a.cash + a.ar + a.equip;
    var retained = S.fin.totRev - S.fin.totExp;
    var debt = debtTotal();
    return { a: a, total: total, liab: S.fin.unpaid + debt,
             unpaid: S.fin.unpaid, debt: debt,
             paidIn: S.fin.paidIn, retained: retained,
             equity: S.fin.paidIn + retained };
  };
  S.debt = function () { return debtTotal(); };
  S.canIPO = function () { return ipoChecks().every(function (c) { return c[1]; }); };
  var OBJECTIVES = [
    { ja: 'バイトか実家からの借入で資本金を作ろう', en: 'Earn or borrow from home to raise your first capital',
      ok: function () { return S.coins >= CFG.notaryFee; } },
    { ja: 'コンビニで宅配を受けて、企業街まで届けよう', en: 'Take a parcel at the store and deliver it downtown',
      ok: function () { return S.delivDone >= 1; } },
    { ja: '公証人役場で定款の認証を受けよう', en: 'Get your articles certified at the notary',
      ok: function () { return S.co.certified; } },
    { ja: '法務局で登記して会社を設立しよう', en: 'Register at the legal bureau and incorporate',
      ok: function () { return S.co.founded; } },
    { ja: '銀行で法人口座をひらこう', en: 'Open a corporate bank account',
      ok: function () { return S.co.bank; } },
    { ja: '事務所を借りてソフト事業を始めよう', en: 'Rent an office and start the software business',
      ok: function () { return officeOn(); } },
    { ja: '受注デスクでソフトの依頼を受けよう', en: 'Take a software commission',
      ok: function () { return S.jobs.length > 0 || S.jobsDone >= 1; } },
    { ja: 'ソフト開発で成果を積み、受託デスクで納品しよう', en: 'Build output at dev, then deliver',
      ok: function () { return S.jobsDone >= 1; } },
    { ja: '経理で入金を受け取ろう（納品から少し遅れて入金）', en: 'Collect the payment at accounting (it arrives after the terms)',
      ok: function () { return !!S.collectedOnce; } },
    { ja: '社員を採用して開発を回そう', en: 'Hire staff to keep development running',
      ok: function () { return S.p.staff.owned; } },
    { ja: 'ハードウェア研究開発を設置して試作を進めよう', en: 'Set up hardware R&D and build prototypes',
      ok: function () { return S.rdLevel() >= 1; } },
    { ja: 'ソフトとハードの両方を進めて量子クラウドを育てよう',
      en: 'Advance both software and hardware to grow the quantum cloud',
      ok: function () { return S.qcLv() >= 2; } },
    { ja: 'ハードウェア工場を立ち上げよう', en: 'Open the hardware plant',
      ok: function () { return room('plant'); } },
    { ja: '本体を組み立てて出荷しよう', en: 'Assemble a unit and ship it',
      ok: function () { return S.shipped >= 1; } },
    { ja: '「保守センター」を増築して保守収益を得よう', en: 'Expand into the service center',
      ok: function () { return S.svcCollected > 0; } },
    { ja: '「外注（前工程・後工程）」を増築しよう', en: 'Expand into foundry & OSAT',
      ok: function () { return room('outsrc'); } },
    { ja: '「部材・冷却棟」を増築しよう', en: 'Expand into parts & cryogenics',
      ok: function () { return room('cryo'); } },
    { ja: '冷凍機・ステージ・制御装置を揃えよう', en: 'Contract fridge, stage and control',
      ok: function () { return W.FEEDERS.every(function (f) { return S.p[f].owned; }); } },
    { ja: '量子クラウドで本体を動かそう（出来た本体が自動で配備される）', en: 'Run units in the quantum cloud (they deploy automatically)',
      ok: function () { return S.dc.length >= 1; } },
    { ja: '「本社・応用研究棟」を増築してSNSを始めよう', en: 'Expand into HQ and start social media',
      ok: function () { return S.p.sns.owned; } },
    { ja: '顧客分野に進出しよう', en: 'Open a customer domain',
      ok: function () { return S.domainCount() >= 1; } },
    { ja: '128量子ビットの本体をつくろう', en: 'Build a 128-qubit unit',
      ok: function () { return S.bestQubits >= 128; } },
    { ja: 'クラウド利用者を3,000人まで増やそう', en: 'Grow to 3,000 cloud users',
      ok: function () { return S.users >= 3000; } },
    { ja: '企業街の証券取引所で上場審査を受けよう', en: 'Get listed at the stock exchange',
      ok: function () { return S.canIPO(); } }
  ];
  function objText() {
    if (S.ipo || S.seenWin) {
      return S.prime ? T('postPrime') : T('postIpo', { v: fmt(S.marketCap()), t: fmt(CFG.primeTarget) });
    }
    if (S.obj >= OBJECTIVES.length - 1 && S.canIPO() && !S.ipo) return T('ipoGoNow');
    if (S.obj >= OBJECTIVES.length - 1 && !S.canIPO() && !S.ipo) {
      return T('ipoLeft') + ipoChecks().filter(function (c) { return !c[1]; })
        .map(function (c) { return c[0]; }).join('　');
    }
    if (S.obj === 11) {
      var nd = qcNeed();
      return T('qcGoal', {
        n: qcLv() + 1,
        sw: nd.sw > 0 ? T('qcSwLeft', { n: nd.sw }) : T('qcSwOk'),
        hw: nd.hw > 0 ? T('qcHwLeft', { n: nd.hw }) : T('qcHwOk')
      });
    }
    var o = OBJECTIVES[S.obj];
    if (!o) return '';
    var txt0 = L.get() === 'ja' ? o.ja : o.en;
    if (S.obj === 12) {
      var pr = null;
      W.ROOMS.forEach(function (r) { if (r.id === 'plant') pr = r; });
      if (rdLevel() < 1) return txt0 + T('objNeedRd');
      if (S.coins < pr.cost) return txt0 + T('objLeftYen', { v: fmt(pr.cost - S.coins) });
    }
    if (S.obj === 21 && room('plant')) {
      var sp = specPlan(), n128 = SPEC_STEP * 4 - sp.tier;
      return txt0 + (n128 > 0 ? T('objSpec', { q: sp.q, n: n128.toFixed(1) }) : T('objSpecWait', { q: sp.q }));
    }
    return txt0;
  }
  function costOf(p) {
    var c = (p.cost || 500000) * Math.pow(1.85, S.p[p.id].level);
    if (p.id === 'staff' && evOn('talent')) c *= 0.5;
    return Math.round(c);
  }
  function canUpgrade(p) { return S.p[p.id].level < p.maxLevel; }
  function stageRate(p) { return p.rate / (1 + 0.22 * (S.p[p.id].level - 1)); }
  function stageQ(p) { return p.q * (1 + 0.28 * (S.p[p.id].level - 1)); }
  function stageScrap(p) { return Math.max(0, 0.016 - 0.005 * (S.p[p.id].level - 1)); }
  function asmTime() { return 4.2 / (1 + 0.3 * (S.p.asm.level - 1)); }
  function salesLv() { return S.p.desk.owned ? S.p.desk.level - 1 : 0; }
  function shipMul() { return (1 + 0.10 * (S.p.ship.level - 1)) * (1 + 0.13 * salesLv()); }
  function svcMul() { return (1 + 0.14 * (S.p.svc.level - 1)) * (1 + 0.08 * salesLv()); }
  function botLevel() { return S.p.up_bot.level; }
  function playerSpeed() { return 88 + 15 * S.p.up_speed.level; }
  function carryMax() { return 2 + S.p.up_carry.level; }
  function contractLife() { return 300 + 45 * (S.p.svc.level - 1); }
  function partsCap() { return CFG.stockCap + (S.p.supply.level - 1) * 4; }
  function loungeMul() { var l = S.p.lounge; return l && l.owned && room('hq') ? 1 + 0.10 * l.level : 1; }
  function sphereMul() { var sp = S.p.sphere; return sp && sp.owned && room('hq') ? 1 + 0.15 * sp.level : 1; }
  function staffCount() { return S.p.staff && S.p.staff.owned ? S.p.staff.level : 0; }
  function pcLv() { return S.p.pc && S.p.pc.owned ? S.p.pc.level : 1; }
  function qcLv() {
    var lv = 1 + Math.min(Math.floor(S.swDev / CFG.cloudStep), Math.floor(S.rd / CFG.cloudStep));
    lv = Math.min(6, lv);
    if (S.p.qcloud) S.p.qcloud.level = lv;
    return lv;
  }
  S.qcLv = qcLv;
  function qcNeed() {
    var lv = qcLv();
    return { sw: Math.max(0, lv * CFG.cloudStep - S.swDev), hw: Math.max(0, lv * CFG.cloudStep - S.rd) };
  }
  function swUnit() { return Math.round(CFG.swBase * (1 + 0.25 * (pcLv() - 1)) * (1 + 0.22 * (qcLv() - 1))); }
  function cloudFee() { return Math.round(CFG.cloudFee / (1 + 0.15 * (qcLv() - 1))); }
  function devTime() { return CFG.devTime / (1 + 0.12 * (pcLv() - 1)); }
  function hwlabLv() { var h = S.p.hwlab; return h && h.owned ? h.level : 0; }
  function rdCap() { return hwlabLv() ? Math.min(6, hwlabLv() + CFG.rdLevelPerLab) : 0; }
  function rdLevel() { return Math.min(rdCap(), Math.floor(S.rd / CFG.rdPerLevel)); }
  function rdStaff() { return Math.min(hwlabLv(), Math.max(0, staffCount() - 1)); }
  function rdMul() { return 1 + CFG.rdStaffPay * rdStaff(); }
  S.rdLevel = rdLevel;
  S.rdStaff = rdStaff;
  function userTarget() {
    var cap = 0, arpuSum = 0, wsum = 0;
    W.PLOTS.forEach(function (p) {
      if (p.kind !== 'software') return;
      var st = S.p[p.id];
      if (!st.owned) return;
      var d = W.DOMAINS[p.domain];
      var c = d.cap * st.level;
      cap += c;
      arpuSum += d.arpu * (1 + 0.06 * (st.level - 1)) * c;
      wsum += c;
    });
    cap *= (1 + S.pop / 100 + 0.10 * salesLv()) * (evOn('cloud') ? 1.3 : 1) * sphereMul();
    var base = CFG.cloudBaseUsers * qcLv();
    cap += base; arpuSum += CFG.cloudBaseArpu * base; wsum += base;
    var serve = 0;
    S.dc.forEach(function (m) { serve += m.qubits * 11; });
    return { cap: Math.min(cap, serve), arpu: wsum > 0 ? arpuSum / wsum : 0 };
  }
  function tally(v, src) {
    var t = S.fin.src || (S.fin.src = {});
    t[src || 'other'] = (t[src || 'other'] || 0) + v;
  }
  function revMul() {
    return (S.t < (S.feverUntil || 0) ? 2 : 1) * (1 + 0.10 * (S.genius || 0));
  }
  S.revMul = revMul;
  function earn(v, src) {
    v = Math.max(0, Math.round(v * revMul()));
    S.coins += v; S.fin.rev += v; S.fin.totRev += v; S.fin.yRev += v; S.fin.cfOp += v;
    tally(v, src);
    return v;
  }
  function collect(v) {
    v = Math.max(0, Math.round(v));
    S.coins += v; S.fin.cfOp += v;
    return v;
  }
  function spend(v, kind) {
    v = Math.max(0, v);
    var paid = Math.min(v, S.coins);
    S.coins -= paid;
    S.fin.unpaid += v - paid;
    S.fin.cfOp -= paid;
    S.fin.exp += v; S.fin.totExp += v; S.fin.yExp += v;
    if (kind === 'rent') { S.fin.bRent += v; S.fin.yRent += v; }
    else if (kind === 'out') { S.fin.bOut += v; S.fin.yOut += v; }
    else if (kind === 'he') { S.fin.bHe += v; S.fin.yHe += v; }
    else if (kind === 'cloud') { S.fin.bCloud += v; S.fin.yCloud += v; }
    else if (kind === 'pay') { S.fin.bPay += v; S.fin.yPay += v; }
    else if (kind === 'util') { S.fin.bUtil += v; S.fin.yUtil += v; }
    else if (kind === 'int') { S.fin.bInt += v; S.fin.yInt += v; }
  }
  function invest(v) {
    v = Math.max(0, Math.round(v));
    var paid = Math.min(v, S.coins);
    S.coins -= paid;
    S.fin.unpaid += v - paid;
    S.fin.equip += v; S.fin.cfInv -= paid;
  }
  function raise(v) {
    v = Math.max(0, Math.round(v));
    S.coins += v; S.fin.paidIn += v; S.fin.cfFin += v;
    return v;
  }
  function loanMax(id) {
    var c = CFG.loans[id];
    if (!c) return 0;
    return c.growth ? Math.round(Math.max(c.max, S.fin.totRev * c.growth)) : c.max;
  }
  function loanStep(id) {
    var c = CFG.loans[id];
    if (!c.growth) return c.step;
    var v = loanMax(id) / 10;
    if (!(v > c.step)) return c.step;
    var e = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), m = v / e;
    return Math.max(c.step, (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e);
  }
  function loanBal(id) { return S.loans[id] || 0; }
  function loanRoom(id) { return Math.max(0, loanMax(id) - loanBal(id)); }
  function debtTotal() {
    var t = 0;
    Object.keys(CFG.loans).forEach(function (id) { t += loanBal(id); });
    return t;
  }
  function loanBlock(id) {
    var c = CFG.loans[id];
    if (id === 'kin' && !S.co.founded) return T('loanNeedCo');
    if (id === 'bankp' && !S.co.bank) return T('loanNeedBank');
    if (c.needRev && S.fin.totRev < c.needRev) return T('loanNeedRev', { v: fmt(c.needRev) });
    return null;
  }
  function borrow(id, v) {
    v = Math.min(Math.round(v), loanRoom(id));
    if (v <= 0) return 0;
    S.loans[id] = loanBal(id) + v;
    S.coins += v; S.fin.cfFin += v;
    return v;
  }
  function repayLoan(id, v) {
    v = Math.min(Math.round(v), loanBal(id), Math.floor(S.coins));
    if (v <= 0) return 0;
    S.loans[id] = loanBal(id) - v;
    S.coins -= v; S.fin.cfFin -= v;
    return v;
  }
  function interestPerYear() {
    var t = 0;
    Object.keys(CFG.loans).forEach(function (id) { t += loanBal(id) * CFG.loans[id].rate; });
    return t;
  }
  function fixedMonthly() {
    var t = 0;
    W.ROOMS.forEach(function (r) { if (room(r.id)) t += r.rent + (r.util || 0); });
    if (officeOn()) t += W.BY_ID.office.rent + W.BY_ID.office.util;
    return t + staffCount() * CFG.salary + interestPerYear() / 12;
  }
  function cashWarn() {
    if (!officeOn()) return null;
    var fm = fixedMonthly();
    var losing = S.fin.month > 1 ? S.fin.lastProfit <= 0 : S.fin.rev - S.fin.exp < 0;
    if (S.fin.unpaid <= 0 && (S.coins > fm * 0.35 || !losing)) return null;
    if (S.pendSales >= fm * 0.3) return T('warnCollect');
    if (loanRoom('kin') > 0 && !loanBlock('kin')) return T('warnBorrow', { n: nm(W.BY_ID.kin) });
    if (loanRoom('bankp') > 0 && !loanBlock('bankp')) return T('warnBorrow', { n: nm(W.BY_ID.bankp) });
    return T('warnWork');
  }
  function updateFinance(dt) {
    var f = S.fin;
    var rent = 0, util = 0;
    W.ROOMS.forEach(function (r) { if (room(r.id)) { rent += r.rent; util += r.util || 0; } });
    if (officeOn()) { rent += W.BY_ID.office.rent; util += W.BY_ID.office.util; }
    if (rent > 0) spend(rent * dt / W.MONTH, 'rent');
    if (util > 0) spend(util * dt / W.MONTH, 'util');
    var pay = staffCount() * CFG.salary;
    if (pay > 0) spend(pay * dt / W.MONTH, 'pay');
    var interest = interestPerYear();
    if (interest > 0) spend(interest * dt / (W.MONTH * 12), 'int');
    if (f.unpaid > 0) {
      var settle = Math.min(f.unpaid, S.coins - fixedMonthly() * 0.5);
      if (settle > 0) {
        S.coins -= settle; f.unpaid -= settle; f.cfOp -= settle;
        if (f.unpaid < 1e-6) f.unpaid = 0;
      }
    }
    f.tMonth += dt;
    if (f.tMonth >= W.MONTH) {
      f.tMonth -= W.MONTH;
      f.lastRev = f.rev; f.lastExp = f.exp;
      f.lastProfit = f.rev - f.exp;
      f.hist = (f.hist || []).concat([f.lastProfit]).slice(-3);
      var prevBest = (f.series || []).reduce(function (m, e) { return Math.max(m, e.p); }, 0);
      f.series = (f.series || []).concat([{ r: Math.round(f.rev), e: Math.round(f.exp), p: Math.round(f.lastProfit), v: S.value() }]).slice(-24);
      if (S.co.founded && (f.rev > 0 || f.exp > 0)) {
        var prev = f.series.length > 1 ? f.series[f.series.length - 2] : null;
        S.report = { month: f.month, rev: f.rev, exp: f.exp, profit: f.lastProfit,
                     prevProfit: prev ? prev.p : null, at: S.t,
                     best: f.lastProfit > 0 && f.lastProfit > prevBest && f.series.length > 2 };
        if (S.report.best) banner(T('recordProfit'), '+¥' + fmt(f.lastProfit), '#f5b21c', 'record');
      }
      f.rev = 0; f.exp = 0; f.bRent = 0; f.bOut = 0; f.bHe = 0;
      f.bCloud = 0; f.bPay = 0; f.bUtil = 0; f.bInt = 0;
      f.month++;
      if ((f.month - 1) % 12 === 0) {
        f.pRev = f.yRev; f.pExp = f.yExp;
        f.pOp = f.cfOp; f.pInv = f.cfInv; f.pFin = f.cfFin;
        f.yRev = 0; f.yExp = 0; f.yRent = 0; f.yOut = 0; f.yHe = 0;
        f.yCloud = 0; f.yPay = 0; f.yUtil = 0; f.yInt = 0;
        f.cfOp = 0; f.cfInv = 0; f.cfFin = 0;
        f.year++;
      }
    }
  }
  function storePay(kind) {
    var sv = S.store, j = CFG.jobs[kind];
    if (kind === 'reg') {
      var basket = 0.65 + 0.55 * (sv.stock / 100);
      var rush = 1 + 0.25 * Math.max(0, sv.cust.length - 1);
      return Math.round(j.pay * basket * rush);
    }
    return Math.round(j.pay * (0.55 + 1.05 * (1 - sv.stock / 100)));
  }
  function updateStore(dt) {
    var st = S.store;
    st.stock = Math.max(0, st.stock - CFG.stockDecay * dt);
    var rate = CFG.custRate / (0.45 + 0.55 * (st.stock / 100));
    st.spawnT -= dt;
    if (st.spawnT <= 0) {
      st.spawnT = rate * (0.7 + Math.random() * 0.7);
      if (st.stock > 8 && st.cust.length < CFG.custMax) st.cust.push({ t: 0, k: Math.random() });
    }
    for (var i = st.cust.length - 1; i >= 0; i--) {
      st.cust[i].t += dt;
      if (st.cust[i].t > CFG.custWait) { st.cust.splice(i, 1); st.lost++; }
    }
  }
  function cafePay(kind) {
    var cf = S.cafe, j = CFG.jobs[kind];
    if (kind === 'brew') return Math.round(j.pay * (0.6 + 1.0 * (1 - cf.cups / CFG.cupsMax)));
    var rush = 1 + 0.25 * Math.max(0, cf.cust.length - 1);
    return Math.round(j.pay * rush);
  }
  function updateCafe(dt) {
    var cf = S.cafe;
    var rate = CFG.cafeRate / (0.5 + 0.5 * Math.min(1, cf.cups / 2)) / cf.rep;
    cf.spawnT -= dt;
    if (cf.spawnT <= 0) {
      cf.spawnT = rate * (0.7 + Math.random() * 0.7);
      if (cf.cust.length < CFG.cafeMax) cf.cust.push({ t: 0, k: Math.random() });
    }
    for (var i = cf.cust.length - 1; i >= 0; i--) {
      cf.cust[i].t += dt;
      if (cf.cust[i].t > CFG.cafeWait) {
        cf.cust.splice(i, 1); cf.lost++;
        cf.rep = Math.max(CFG.cafeRepMin, cf.rep - CFG.cafeRepDrop);
      }
    }
  }
  function delivPay(id) { return Math.round(CFG.delivPay * (1 + 0.06 * corp(id).rel)); }
  function delivLeft() { return S.deliv ? Math.max(0, S.deliv.due - S.t) : 0; }
  function delivReward() {
    if (!S.deliv) return 0;
    return Math.round(S.deliv.pay * (1 + CFG.delivRush * (delivLeft() / CFG.delivTime)));
  }
  function takeDeliv() {
    var id = W.CORPS[Math.floor(Math.random() * W.CORPS.length)];
    S.deliv = { corp: id, due: S.t + CFG.delivTime, pay: delivPay(id) };
  }
  function updateDeliv(dt) {
    if (!S.deliv || S.t <= S.deliv.due) return;
    toast(W.center(W.BY_ID[S.deliv.corp]), T('delivFail'), '#b9b3c8');
    S.deliv = null; S.delivLost++;
    QT.Sfx.play('bad');
  }
  function invoice(amount, who, src) {
    if (amount <= 0) return;
    var term = CFG.payTermMin + Math.random() * (CFG.payTermMax - CFG.payTermMin);
    term /= 1 + 0.12 * (S.p.acct.level - 1);
    amount = Math.round(amount * revMul());
    S.fin.rev += amount; S.fin.totRev += amount; S.fin.yRev += amount;
    tally(amount, src);
    S.ar.push({ a: amount, due: S.t + term, who: who || null });
  }
  function arTotal() {
    var t = 0;
    for (var i = 0; i < S.ar.length; i++) t += S.ar[i].a;
    return t;
  }
  function arNext() {
    var m = -1;
    for (var i = 0; i < S.ar.length; i++) if (m < 0 || S.ar[i].due < m) m = S.ar[i].due;
    return m < 0 ? 0 : Math.max(0, m - S.t);
  }
  function updateAR(dt) {
    for (var i = S.ar.length - 1; i >= 0; i--) {
      if (S.t < S.ar[i].due) continue;
      S.pendSales += S.ar[i].a;
      S.ar.splice(i, 1);
      QT.Sfx.play('click');
    }
  }
  function corp(id) {
    if (!S.corps[id]) S.corps[id] = { rel: 0, jobs: 0, visitAt: -9999, fundAt: -9999 };
    return S.corps[id];
  }
  function missionCool() { return Math.max(0, S.missionAt + CFG.missionCool - S.t); }
  function missionLeft() { return S.mission ? Math.max(0, S.mission.due - S.t) : 0; }
  function pickMissionCorp() {
    var best = [], lo = 1e9;
    W.CORPS.forEach(function (id) {
      var r = corp(id).rel + Math.random() * 1.5;
      if (r < lo - 0.001) { lo = r; best = [id]; }
      else if (r < lo + 0.001) best.push(id);
    });
    return best[Math.floor(Math.random() * best.length)];
  }
  function takeMission() {
    var id = pickMissionCorp();
    S.mission = { corp: id, due: S.t + CFG.missionTime };
    toast(W.center(W.BY_ID.desk), T('missionGo', { n: nm(W.BY_ID[id]) }), '#f2a63b');
    QT.Sfx.play('good');
  }
  function updateMission(dt) {
    if (!S.mission) return;
    if (S.t > S.mission.due) {
      toast(W.center(W.BY_ID[S.mission.corp]), T('missionFail'), '#b9b3c8');
      S.mission = null; S.missionAt = S.t;
      QT.Sfx.play('bad');
    }
  }
  function cvcCool(id)   { return Math.max(0, corp(id).fundAt + CFG.cvcCool * W.MONTH - S.t); }
  function relBonus(id) { return 1 + corp(id).rel * 0.05; }
  function cvcAmount(id) {
    var c = corp(id);
    var base = Math.max(600000 + c.jobs * 500000, S.value() * (0.008 + 0.003 * c.rel));
    return Math.round(base * (1 + c.jobs * 0.10));
  }
  function cvcKeep(id) { return Math.min(0.96, 0.90 + 0.006 * corp(id).rel); }
  function salesPay(id) { return Math.round(30000 * (1 + corp(id).rel * 0.35) * (1 + 0.15 * (salesLv() - 1))); }
  function pickCorp() {
    var ids = W.CORPS.filter(function (id) { return corp(id).rel > 0; });
    if (!ids.length || Math.random() < 0.35) return null;
    var tot = 0, i;
    for (i = 0; i < ids.length; i++) tot += corp(ids[i]).rel;
    var r = Math.random() * tot;
    for (i = 0; i < ids.length; i++) { r -= corp(ids[i]).rel; if (r <= 0) return ids[i]; }
    return ids[0];
  }
  function creditCorp(job) {
    if (!job || !job.corp) return;
    var c = corp(job.corp);
    c.jobs++;
    if (c.rel < CFG.relMax) c.rel = Math.min(CFG.relMax, c.rel + 0.5);
  }
  var TRUCK_LEG = { arrive: 2.0, back: 1.5, pull: 1.1, leave: 1.8 };
  function truckHere() { return S.truck.state === 'dock'; }
  function truckWait() {
    var tk = S.truck;
    if (tk.state === 'away') return Math.max(0, tk.t);
    if (tk.state === 'arrive') return Math.max(0, tk.t) + TRUCK_LEG.back;
    if (tk.state === 'back') return Math.max(0, tk.t);
    if (tk.state === 'pull')  return Math.max(0, tk.t) + TRUCK_LEG.leave + CFG.truckGap;
    if (tk.state === 'leave') return Math.max(0, tk.t) + CFG.truckGap;
    return 0;
  }
  function updateTruck(dt) {
    if (!room('plant') || !S.p.ship.owned) {
      S.truck.state = 'away'; S.truck.t = 4; S.truck.k = 0; S.truck.load = 0;
      return;
    }
    var tk = S.truck;
    tk.t -= dt;
    if (tk.t > 0) {
      var leg = TRUCK_LEG[tk.state];
      if (leg) tk.k = Math.max(0, Math.min(1, 1 - tk.t / leg));
      return;
    }
    tk.k = 1;
    switch (tk.state) {
      case 'away':   tk.state = 'arrive'; tk.t = TRUCK_LEG.arrive; tk.k = 0; tk.load = 0; break;
      case 'arrive': tk.state = 'back';   tk.t = TRUCK_LEG.back;   tk.k = 0;
                     QT.Sfx.play('click'); break;
      case 'back':   tk.state = 'dock';   tk.t = CFG.truckStay;    tk.k = 1;
                     QT.Sfx.play('click'); break;
      case 'dock':   tk.state = 'pull';   tk.t = TRUCK_LEG.pull;   tk.k = 0; break;
      case 'pull':   tk.state = 'leave';  tk.t = TRUCK_LEG.leave;  tk.k = 0; break;
      default:       tk.state = 'away';   tk.t = CFG.truckGap;     tk.k = 0; tk.load = 0;
    }
  }
  function techScore() {
    var q = S.bestQubits > 0 ? Math.log(S.bestQubits) / Math.LN2 : 0;
    return qcLv() + rdLevel() + Math.floor(q / 2);
  }
  function pressOn() { return S.t < S.pressUntil; }
  function pressCool() { return Math.max(0, S.pressAt + CFG.pressCool - S.t); }
  function pressCost() { return Math.round((120000 + 90000 * techScore()) * (evOn('conf') ? 0.5 : 1)); }
  function pressLife() { return CFG.pressLife + corp('c_news').rel * 8; }
  function pressPop() { return Math.round((4 + techScore() * 3 + corp('c_news').rel * 1.5) * (evOn('conf') ? 2 : 1)); }
  var GACHA_COOL = 30;
  var GACHA_PITY = 10;
  function nice(v) {
    if (v < 100) return Math.round(v);
    var e = Math.pow(10, Math.floor(Math.log(v) / Math.LN10) - 1);
    return Math.round(v / e) * e;
  }
  function gachaCost() {
    return nice(Math.max(10000, fixedMonthly() * 0.4, (S.fin.lastRev || 0) * 0.05));
  }
  function gachaCool() { return Math.max(0, (S.gachaAt || -999) + GACHA_COOL - S.t); }
  function pick(list) {
    var t = 0, i, r;
    for (i = 0; i < list.length; i++) t += list[i].w;
    r = Math.random() * t;
    for (i = 0; i < list.length; i++) { r -= list[i].w; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  function upgradable() {
    return W.PLOTS.filter(function (p) {
      var st = S.p[p.id];
      return st && st.owned && p.cost && canUpgrade(p) && room(p.room) &&
             !(OFFICE_ONLY[p.id] && !officeOn()) && p.kind !== 'office';
    });
  }
  function pullGacha() {
    var cost = gachaCost();
    spend(cost, 'other');
    S.gachaAt = S.t;
    S.gachaN = (S.gachaN || 0) + 1;
    S.gachaDry = (S.gachaDry || 0) + 1;
    var rar = S.gachaDry >= GACHA_PITY ? pick([{ r: 'SR', w: 76 }, { r: 'SSR', w: 24 }])
            : pick([{ r: 'N', w: 62 }, { r: 'R', w: 26 }, { r: 'SR', w: 9 }, { r: 'SSR', w: 3 }]);
    rar = rar.r;
    if (rar === 'SR' || rar === 'SSR') S.gachaDry = 0;
    var res = { rar: rar, cost: cost, at: S.t };
    function cash(k) { var v = Math.round(cost * k); raiseCash(v); res.kind = 'cash'; res.v = v; }
    if (rar === 'N') {
      cash(0.2 + Math.random() * 0.5);
    } else if (rar === 'R') {
      if (Math.random() < 0.5) cash(1.5);
      else { res.kind = 'fever'; res.sec = 30; }
    } else if (rar === 'SR') {
      var ups = upgradable(), k = Math.random();
      if (k < 0.34) { res.kind = 'fever'; res.sec = 60; }
      else if (k < 0.67 && ups.length) {
        var pp = ups[Math.floor(Math.random() * ups.length)];
        S.p[pp.id].level++;
        res.kind = 'level'; res.name = nm(pp); res.lv = S.p[pp.id].level;
        rebuildGrid();
      } else cash(3);
    } else {
      if ((S.genius || 0) < 3 && Math.random() < 0.5) { S.genius = (S.genius || 0) + 1; res.kind = 'genius'; res.n = S.genius; }
      else cash(8);
    }
    if (res.kind === 'fever') S.feverUntil = Math.max(S.t, S.feverUntil || 0) + res.sec;
    S.gacha = res;
    if (QT.track) QT.track('gacha', { rar: rar, kind: res.kind });
    return res;
  }
  function raiseCash(v) {
    v = Math.max(0, Math.round(v));
    S.coins += v; S.fin.rev += v; S.fin.totRev += v; S.fin.yRev += v; S.fin.cfOp += v;
    tally(v, 'other');
  }
  var EVENTS = [
    { id: 'boom', good: true, dur: 90, when: function () { return officeOn(); } },
    { id: 'big', good: true, dur: 0, when: function () { return officeOn() && !S.offer && S.jobsDone >= 2; },
      start: function () {
        var o = makeOffer();
        o.reward = Math.round(o.reward * 2.5); o.deadline = Math.round(o.deadline * 1.5);
        o.big = true; o.life = OFFER_LIFE * 1.5;
        S.offer = o;
      } },
    { id: 'talent', good: true, dur: 90, when: function () { return officeOn() && canUpgrade(W.BY_ID.staff); } },
    { id: 'parts', good: false, dur: 75, when: function () { return S.p.hwlab.owned && !room('outsrc'); } },
    { id: 'helium', good: false, dur: 75, when: function () { return room('plant'); } },
    { id: 'hot', good: true, dur: 90, when: function () { return room('plant'); },
      start: function () { S.glut = 0; } },
    { id: 'conf', good: true, dur: 100, when: function () { return S.co.founded && officeOn() && S.jobsDone >= 3; } },
    { id: 'cloud', good: true, dur: 100, when: function () { return S.dc.length > 0 && S.domainCount() > 0; } }
  ];
  var EV_BY = {};
  EVENTS.forEach(function (e) { EV_BY[e.id] = e; });
  function evOn(id) { return !!(S.ev && S.ev.id === id && S.t < S.ev.until); }
  S.evOn = evOn;
  function updateEvents(dt) {
    if (!officeOn()) return;
    if (S.ev && S.t >= S.ev.until) S.ev = null;
    if (S.ev) return;
    S.evT = (S.evT == null ? 120 : S.evT) - dt;
    if (S.evT > 0) return;
    S.evT = 150 + Math.random() * 90;
    var cand = EVENTS.filter(function (e) { return e.when() && (!S.evLast || e.id !== S.evLast); });
    if (!cand.length) return;
    var e = cand[Math.floor(Math.random() * cand.length)];
    S.evLast = e.id;
    S.ev = { id: e.id, until: S.t + (e.dur || 6), at: S.t };
    if (e.start) e.start();
    toast({ x: S.player.x, y: S.player.y - 20 }, T('ev_' + e.id), e.good ? '#2fbf7a' : '#e2504a');
    QT.Sfx.play(e.good ? 'good' : 'bad');
  }
  var ANGELS = [
    { name: 'エンジェル投資家',  name_en: 'Angel investor',        color: '#f5b21c' },
    { name: '海外ファンドの代表', name_en: 'Overseas fund partner', color: '#6f57e0' },
    { name: '連続起業家',        name_en: 'Serial entrepreneur',   color: '#2fbf7a' }
  ];
  function angelChance() {
    var c = 0.32 + Math.min(0.30, S.jobsDone * 0.02) + (S.fin.lastProfit > 0 ? 0.16 : 0);
    return Math.min(0.9, c + qcLv() * 0.03);
  }
  function angelAmount() { return Math.round(vcAmount() * CFG.angelBoost); }
  function spawnAngel() {
    var here = null;
    for (var i = 0; i < W.ROOMS.length; i++) {
      var r = W.ROOMS[i];
      var ty = S.player.y / TILE;
      if (ty >= r.wallTop && ty <= r.wallBottom && room(r.id)) { here = r; break; }
    }
    if (!here) return;
    for (var tries = 0; tries < 60; tries++) {
      var x = (here.ix + Math.random() * here.iw) * TILE;
      var y = (here.iy + Math.random() * here.ih) * TILE;
      if (!blocked(x, y)) {
        var a = ANGELS[Math.floor(Math.random() * ANGELS.length)];
        S.angel = { x: x, y: y, vx: 0, vy: 0, t: 0, life: CFG.angelStay,
                    who: a, room: here.id, talked: false, walk: 0, dir: 0 };
        ANGEL_PAD.x = x / TILE - 0.5; ANGEL_PAD.y = y / TILE - 0.5; ANGEL_PAD.room = here.id;
        toast({ x: x, y: y }, T('angelHere'), a.color);
        QT.Sfx.play('good');
        return;
      }
    }
  }
  function updateAngel(dt) {
    if (!S.co.founded) return;
    if (!S.angel) {
      S.angelT -= dt;
      if (S.angelT <= 0) {
        S.angelT = CFG.angelEvery[0] + Math.random() * (CFG.angelEvery[1] - CFG.angelEvery[0]);
        spawnAngel();
      }
      return;
    }
    var a = S.angel;
    a.life -= dt;
    if (a.life <= 0 || a.talked) { S.angel = null; return; }
    a.t -= dt;
    if (a.t <= 0) {
      a.t = 0.8 + Math.random() * 1.6;
      var th = Math.random() * Math.PI * 2;
      a.vx = Math.cos(th) * 26; a.vy = Math.sin(th) * 26;
    }
    var nx = a.x + a.vx * dt, ny = a.y + a.vy * dt;
    if (!blocked(nx, a.y)) a.x = nx; else a.vx = -a.vx;
    if (!blocked(a.x, ny)) a.y = ny; else a.vy = -a.vy;
    a.walk += dt * 7;
    a.dir = Math.abs(a.vx) > Math.abs(a.vy) ? (a.vx > 0 ? 1 : 3) : (a.vy > 0 ? 0 : 2);
    ANGEL_PAD.x = a.x / TILE - 0.5; ANGEL_PAD.y = a.y / TILE - 0.5; ANGEL_PAD.room = a.room;
  }
  function jobQubitTarget() {
    var b = Math.max(2, S.bestQubits);
    var r = Math.random();
    if (r < 0.5) return b;
    if (r < 0.85) return Math.max(2, b / 2);
    return Math.min(QMAX, b * 2);
  }
  var OFFER_LIFE = 26;
  function makeOffer() {
    var cid = pickCorp();
    var c = cid ? W.BY_ID[cid] : W.CLIENTS[Math.floor(Math.random() * W.CLIENTS.length)];
    var rb = (cid ? relBonus(cid) : 1) * (pressOn() ? 1 + techScore() * 0.02 : 1) * (evOn('boom') ? 1.4 : 1);
    var hw = room('plant');
    if (!hw || Math.random() < 0.5) {
      var work = 3 + Math.floor(Math.random() * 6);
      return { kind: 'sw', client: c, corp: cid, work: work,
               reward: Math.round(work * swUnit() * 1.25 * (1 + 0.1 * salesLv()) * rb),
               deadline: 90 + work * 34 };
    }
    var q = jobQubitTarget();
    var count = 1 + Math.floor(Math.random() * 3);
    var unit = Math.round(hwUnit(q) * (1 + 0.05 * S.ownedStages().length) * rdMul());
    return { kind: 'hw', client: c, corp: cid, qubits: q, count: count,
             reward: Math.round(unit * count * (1.5 + (q > S.bestQubits ? 0.6 : 0)) * rb),
             deadline: 150 + count * 60 + (q > S.bestQubits ? 90 : 0) };
  }
  function acceptOffer() {
    var o = S.offer;
    if (!o) return;
    S.jobs.push({ kind: o.kind || 'hw', client: o.client, corp: o.corp,
                  qubits: o.qubits, count: o.count, left: o.count,
                  work: o.work, done: 0,
                  reward: o.reward, due: S.t + o.deadline });
    S.offer = null; S.offerT = (12 + Math.random() * 10) * (pressOn() ? 0.45 : 1) * (evOn('boom') ? 0.6 : 1);
    toast(W.center(W.BY_ID.desk), T('accept'), '#2fbf7a');
    QT.Sfx.play('good');
  }
  function updateJobs(dt) {
    if (!officeOn()) return;
    var n = staffCount();
    if (n > 0) {
      var st = S.p.staff;
      st.timer -= dt;
      if (st.timer <= 0) {
        st.timer = CFG.staffDevTime / (1 + 0.12 * (pcLv() - 1)) / n / loungeMul();
        devWork();
      }
      var rs = rdStaff();
      if (S.p.hwlab.owned && rs > 0) {
        var hl = S.p.hwlab;
        hl.timer = (hl.timer || 0) - dt;
        if (hl.timer <= 0) {
          hl.timer = 26 / (1 + 0.15 * (hwlabLv() - 1)) / rs / loungeMul();
          if (rdLevel() < rdCap() && S.parts > 0 && S.coins >= CFG.rdCost) {
            spend(CFG.rdCost, 'out'); S.parts--; S.rd++;
          }
        }
      }
    }
    if (!S.offer && S.jobs.length < (pressOn() ? 5 : 3)) {
      S.offerT -= dt;
      if (S.offerT <= 0) {
        S.offer = makeOffer();
        S.offer.life = OFFER_LIFE;
        QT.Sfx.play('click');
      }
    } else if (S.offer) {
      S.offer.life -= dt;
      if (S.offer.life <= 0) {
        toast(W.center(W.BY_ID.desk), T('offerLost'), '#b9b3c8');
        S.offer = null;
        S.offerT = (8 + Math.random() * 10) * (pressOn() ? 0.45 : 1);
      }
    }
    for (var i = S.jobs.length - 1; i >= 0; i--) {
      var j = S.jobs[i];
      if (S.t > j.due) {
        var pen = Math.round(j.reward * 0.3);
        spend(pen, 'other');
        S.pop = Math.max(0, S.pop - 8);
        S.jobsFailed++;
        S.jobs.splice(i, 1);
        toast({ x: S.player.x, y: S.player.y - 20 }, T('orderFailed') + '  -¥' + fmt(pen), '#e2504a', { big: true });
        if (QT.Render) QT.Render.shake(4, 0.25);
        QT.Sfx.play('bad');
      }
    }
  }
  function devWork() {
    if (S.swStock >= CFG.stockCap) return null;
    spend(cloudFee(), 'cloud');
    S.swStock += 1 + Math.floor((pcLv() - 1) / 2);
    if (S.swStock > CFG.stockCap) S.swStock = CFG.stockCap;
    S.swDev++;
    return { stock: S.swStock };
  }
  function nextJob(kind) {
    var best = -1;
    for (var i = 0; i < S.jobs.length; i++) {
      var j = S.jobs[i];
      if (j.kind !== kind) continue;
      if (kind === 'sw' && j.done >= j.work) continue;
      if (kind === 'hw' && j.left <= 0) continue;
      if (best < 0 || S.jobs[best].due > j.due) best = i;
    }
    return best;
  }
  function swDeliver() {
    var bi = nextJob('sw');
    if (bi < 0 || S.swStock <= 0) return null;
    S.swStock--;
    var job = S.jobs[bi];
    job.done++;
    if (job.done >= job.work) {
      invoice(job.reward, job.corp, 'sw');
      S.pop += 4; S.jobsDone++;
      creditCorp(job);
      S.jobs.splice(bi, 1);
      return { done: true, amount: job.reward };
    }
    return { done: false, job: job };
  }
  function hwasmQ() {
    return Math.min(CFG.hwasmQCap, Math.pow(2, 1 + Math.floor(2 + rdLevel() * 0.9)));
  }
  function hwBuild() {
    if (S.parts < CFG.partsPerBuild || rdLevel() < 1) return null;
    S.parts -= CFG.partsPerBuild;
    var q = hwasmQ();
    S.bestQubits = Math.max(S.bestQubits, q);
    var bi = nextJob('hw');
    if (bi >= 0 && S.jobs[bi].qubits <= q) {
      var job = S.jobs[bi];
      job.left--;
      if (job.left <= 0) {
        invoice(job.reward, job.corp, 'hw');
        S.pop += 5; S.jobsDone++;
        creditCorp(job);
        S.jobs.splice(bi, 1);
        return { done: true, amount: job.reward, q: q };
      }
      return { done: false, job: job, q: q };
    }
    var spot = Math.max(Math.round(hwUnit(q) * CFG.hwSpot * shipMul() * rdMul() * spotMul()),
                        Math.round(CFG.partCost / CFG.partsPerBuy * CFG.partsPerBuild));
    invoice(spot, null, 'hw');
    S.glut = (S.glut || 0) + 1;
    return { done: true, amount: spot, spot: true, q: q };
  }
  function spotMul() { return (evOn('hot') ? 1.3 : 1) / (1 + (S.glut || 0) / CFG.glutK); }
  S.spotMul = spotMul;
  function deliver(list) {
    var gained = 0, done = 0, spot = 0, own = !list;
    list = list || S.player.carry;
    list.forEach(function (m) {
      var best = -1;
      for (var i = 0; i < S.jobs.length; i++) {
        var j = S.jobs[i];
        if (j.kind === 'hw' && j.left > 0 && m.qubits >= j.qubits &&
            (best < 0 || S.jobs[best].due > j.due)) best = i;
      }
      if (best >= 0) {
        var job = S.jobs[best];
        job.left--;
        if (job.left === 0) {
          gained += earn(job.reward, 'hw');
          S.pop += 6; S.jobsDone++; done++;
          creditCorp(job);
          S.jobs.splice(best, 1);
        }
      } else {
        gained += earn(Math.round(m.price * shipMul() * 0.7 * spotMul()), 'hw');
        S.glut = (S.glut || 0) + 1;
        spot++;
      }
      if (S.p.svc.owned) {
        S.contracts.push({ price: Math.round(m.price * shipMul()), maint: m.maint,
                           defect: m.defect, broken: false, life: contractLife() });
      }
    });
    if (own) S.player.carry = [];
    S.shipped++;
    return { gained: gained, done: done, spot: spot };
  }
  function swAutoRate() { var l = S.p.swjob.level; return l >= 2 ? 6 / (l - 1) : 0; }
  function shipAutoRate() { var l = S.p.ship.owned ? S.p.ship.level : 0; return l >= 2 ? 3.2 / (l - 1) : 0; }
  function canFulfill(o) {
    if (o.kind === 'sw') return officeOn();
    return o.qubits <= Math.max(room('plant') ? S.bestQubits : 0, rdLevel() >= 1 && S.p.hwasm.owned ? hwasmQ() : 0);
  }
  function autoAccept() { return S.p.desk.level >= 3; }
  function updateDcAuto(dt) {
    if (!room('cryo') || !S.p.qcloud.owned || !S.outputs.length) return;
    S.dcT = (S.dcT || 0) - dt;
    if (S.dcT > 0) return;
    S.dcT = 1.2;
    var bi = 0;
    for (var i = 1; i < S.outputs.length; i++) if (S.outputs[i].m.qubits > S.outputs[bi].m.qubits) bi = i;
    var o = S.outputs[bi], to = W.center(W.BY_ID.qcloud);
    if (S.dc.length < S.dcCapacity()) {
      S.outputs.splice(bi, 1);
      S.dc.push(o.m);
    } else {
      var wi = 0;
      for (var j = 1; j < S.dc.length; j++) if (S.dc[j].qubits < S.dc[wi].qubits) wi = j;
      if (!S.dc.length || o.m.qubits <= S.dc[wi].qubits) return;
      S.outputs.splice(bi, 1);
      earn(Math.round(S.dc[wi].price * 0.3), 'hw');
      S.dc[wi] = o.m;
    }
    S.items.push({ x0: o.x, y0: o.y, x1: to.x, y1: to.y, t: 0, dur: 0.9, color: '#6f57e0' });
    toast(to, T('dcAuto', { q: o.m.qubits }), '#6f57e0');
    QT.Sfx.play('buy');
  }
  function updateAuto(dt) {
    if (S.glut) S.glut *= Math.exp(-CFG.glutDecay * dt);
    updateDcAuto(dt);
    if (S.offer && autoAccept() && S.offer.life < OFFER_LIFE - 3 && canFulfill(S.offer)) acceptOffer();
    var r = swAutoRate();
    if (r > 0 && officeOn()) {
      var sj = S.p.swjob;
      sj.timer -= dt;
      if (sj.timer <= 0) {
        sj.timer = r;
        var res = swDeliver();
        if (res && res.done) {
          toast(W.center(W.BY_ID.swjob), T('invoiced') + ' ' + fmt(res.amount), '#2fbf7a');
          QT.Sfx.play('good');
        }
      }
    }
    var sr = shipAutoRate();
    if (sr > 0 && truckHere() && S.outputs.length) {
      var sh = S.p.ship;
      sh.timer -= dt;
      if (sh.timer <= 0) {
        sh.timer = sr;
        var o = S.outputs.shift();
        var got = deliver([o.m]);
        S.truck.load = (S.truck.load || 0) + 1;
        S.items.push({ x0: o.x, y0: o.y, x1: W.DOCK.bayX, y1: W.DOCK.bayY - 6,
                       t: 0, dur: 0.7, color: '#f2a63b' });
        if (got.gained) toast({ x: W.DOCK.bayX, y: W.DOCK.bayY }, '+' + fmt(got.gained), '#2fbf7a');
        QT.Sfx.play('cash');
      }
    }
  }
  var PADS = [];
  function buildPads() {
    PADS = [];
    W.PLOTS.forEach(function (p) {
      var mid = p.padX, y = p.padY;
      if (p.padsLocal) {
        p.padsLocal.forEach(function (q) {
          PADS.push({ p: p, type: q.type, x: p.x + q.x, y: p.y + q.y });
        });
        if (p.cost && p.id !== 'pc') PADS.push({ p: p, type: 'buy', x: mid, y: y });
        return;
      }
      switch (p.kind) {
        case 'notary':   PADS.push({ p: p, type: 'notary', x: mid, y: y }); break;
        case 'registry': PADS.push({ p: p, type: 'registry', x: mid, y: y }); break;
        case 'bank':     PADS.push({ p: p, type: 'bank', x: mid - 2, y: y });
                         PADS.push({ p: p, type: 'borrow', x: mid, y: y });
                         PADS.push({ p: p, type: 'repay', x: mid + 2, y: y }); break;
        case 'house':    PADS.push({ p: p, type: 'borrow', x: mid - 1, y: y });
                         PADS.push({ p: p, type: 'repay', x: mid + 1, y: y }); break;
        case 'swjob':  PADS.push({ p: p, type: 'swjob', x: mid - 1, y: y });
                       PADS.push({ p: p, type: 'buy', x: mid + 1, y: y }); break;
        case 'hwasm':  PADS.push({ p: p, type: 'hwasm', x: mid - 1, y: y });
                       PADS.push({ p: p, type: 'buy', x: mid + 1, y: y }); break;
        case 'supply': PADS.push({ p: p, type: 'buyPC', x: mid - 2, y: y });
                       PADS.push({ p: p, type: 'supply', x: mid, y: y });
                       PADS.push({ p: p, type: 'buy', x: mid + 2, y: y }); break;
        case 'qcloud':
          PADS.push({ p: p, type: 'dcdrop', x: mid + 2, y: y });
          PADS.push({ p: p, type: 'collectDc', x: mid + 4, y: y }); break;
        case 'staff': case 'devdesk': case 'hwlab':
          PADS.push({ p: p, type: 'buy', x: mid, y: y }); break;
        case 'desk':
          PADS.push({ p: p, type: 'accept', x: mid - 2, y: y });
          PADS.push({ p: p, type: 'mission', x: mid, y: y });
          PADS.push({ p: p, type: 'buy', x: mid + 2, y: y }); break;
        case 'acct':
          PADS.push({ p: p, type: 'collectSales', x: mid - 1, y: y });
          PADS.push({ p: p, type: 'buy', x: mid + 1, y: y }); break;
        case 'corp':
          PADS.push({ p: p, type: 'sales', x: p.x, y: y });
          PADS.push({ p: p, type: 'drop', x: mid, y: y });
          PADS.push({ p: p, type: p.news ? 'press2' : 'cvc', x: p.x + p.w - 1, y: y }); break;
        case 'exchange': PADS.push({ p: p, type: 'ipo', x: mid, y: y }); break;
        case 'gacha':    PADS.push({ p: p, type: 'gacha', x: mid, y: y }); break;
        case 'vc':       PADS.push({ p: p, type: 'vc', x: mid, y: y }); break;
        case 'ship':
          PADS.push({ p: p, type: 'ship', x: mid - 1, y: y });
          PADS.push({ p: p, type: 'buy', x: mid + 1, y: y }); break;
        case 'service':
          PADS.push({ p: p, type: 'collectSvc', x: mid - 2, y: y });
          PADS.push({ p: p, type: 'fix', x: mid + 2, y: y });
          PADS.push({ p: p, type: 'buy', x: mid, y: y }); break;
        case 'media':
          PADS.push({ p: p, type: 'buy', x: mid - 1, y: y });
          PADS.push({ p: p, type: 'promo', x: mid + 1, y: y }); break;
        case 'seminar':
          PADS.push({ p: p, type: 'buy', x: mid - 1, y: y });
          PADS.push({ p: p, type: 'seminar', x: mid + 1, y: y }); break;
        default:
          PADS.push({ p: p, type: 'buy', x: mid, y: y });
      }
    });
    W.ROOMS.forEach(function (r) {
      if (!r.expandPad) return;
      PADS.push({ p: null, room: r, type: 'expand', x: r.expandPad.x, y: r.expandPad.y });
    });
  }
  var OFFICE_ONLY = { swjob: 1, acct: 1, hwasm: 1, pc: 1, desk: 1, hwlab: 1,
                      staff: 1, qcloud: 1, supply: 1 };
  function padActive(pad) {
    if (pad.p && OFFICE_ONLY[pad.p.id] && !officeOn()) return false;
    if (pad.p && pad.p.id === 'office' && !S.co.bank) return false;
    if (pad.type === 'angel') return !!S.angel;
    if (pad.type === 'mission') return S.co.founded && officeOn();
    if (pad.type === 'sales') return !!S.mission && S.mission.corp === pad.p.id;
    if (pad.type === 'drop')  return !!S.deliv && S.deliv.corp === pad.p.id;
    if (pad.type === 'bank')  return !S.co.bank;
    if (pad.type === 'repay') return loanBal(pad.p.id) > 0;
    if (S.ipo && (pad.type === 'vc' || pad.type === 'cvc')) return false;
    if (pad.type === 'cvc')   return S.co.founded && !corp(pad.p.id).funded;
    if (pad.type === 'press2') return S.co.founded && officeOn();
    if (pad.type === 'expand') {
      if (!room(W.ROOMS[pad.room.index - 1].id) || room(pad.room.id)) return false;
      if (pad.room.id === 'plant' && (!S.co.bank || rdLevel() < 1 || !officeOn())) return false;
      return true;
    }
    if (!room(pad.p.room)) return false;
    if (pad.type === 'accept') return !!S.offer;
    if (pad.type === 'dev') return officeOn();
    return true;
  }
  var GRID = null;
  function rebuildGrid() {
    var w = W.WORLD_W, h = W.WORLD_H;
    GRID = new Uint8Array(w * h);
    W.ROOMS.forEach(function (r) {
      if (!room(r.id)) return;
      for (var y = r.iy; y < r.iy + r.ih; y++)
        for (var x = r.ix; x < r.ix + r.iw; x++) GRID[y * w + x] = 1;
      var below = W.ROOMS[r.index - 1];
      if (below && room(below.id))
        for (var d = 0; d < r.door.w; d++) GRID[r.door.y * w + (r.door.x + d)] = 1;
    });
    W.PLOTS.forEach(function (p) {
      if (!S.p[p.id] || !S.p[p.id].owned) return;
      if (p.open) {
        (p.blocks || []).forEach(function (b) {
          for (var by = 0; by < b[3]; by++)
            for (var bx = 0; bx < b[2]; bx++)
              GRID[(p.y + b[1] + by) * w + (p.x + b[0] + bx)] = 0;
        });
        return;
      }
      for (var y = p.y; y < p.y + p.h; y++)
        for (var x = p.x; x < p.x + p.w; x++) GRID[y * w + x] = 0;
    });
  }
  function walkable(px, py) {
    var x = Math.floor(px / TILE), y = Math.floor(py / TILE);
    if (x < 0 || y < 0 || x >= W.WORLD_W || y >= W.WORLD_H) return false;
    return GRID[y * W.WORLD_W + x] === 1;
  }
  function blocked(x, y) {
    var r = 3.5;
    return !(walkable(x - r, y - r) && walkable(x + r, y - r) &&
             walkable(x - r, y + r) && walkable(x + r, y + r));
  }
  function reset() {
    S.t = 0; S.coins = CFG.startCoins; S.pop = 0; S.users = 0; S.he = 6;
    S.bestQubits = 0; S.shipped = 0; S.svcCollected = 0; S.dcCollected = 0; S.rd = 0;
    S.swStock = 0; S.parts = 0; S.pendSales = 0; S.ar = []; S.vcAt = -9999; S.swDev = 0;
    S.angel = null; S.angelT = 120; S.angelDeals = 0;
    S.corps = {};
    W.CORPS.forEach(function (id) { S.corps[id] = { rel: 0, jobs: 0, visitAt: -9999, fundAt: -9999 }; });
    S.mission = null; S.missionAt = -9999; S.pressUntil = -9999; S.pressAt = -9999;
    S.truck = { state: 'away', t: 8, k: 0, load: 0 };
    S.obj = 0; S.won = false; S.seenWin = false; S.ipo = null; S.glut = 0;
    S.ev = null; S.evT = 120; S.evLast = null; S.prime = false; S.tut = 0; S.tutWalk = 0;
    S.gachaAt = -999; S.gachaN = 0; S.gachaDry = 0; S.genius = 0; S.feverUntil = 0; S.gacha = null;
    S.banners = []; S.coinFx = []; S.combo = 0; S.comboAt = -99; S.collectedOnce = false;
    S.co = { certified: false, founded: false, bank: false, shifts: 0 };
    S.equity = 1.0; S.rounds = 0;
    S.fin = { month: 1, year: 1, tMonth: 0, tYear: 0, rev: 0, exp: 0, lastRev: 0, lastExp: 0,
           totRev: 0, totExp: 0, bRent: 0, bOut: 0, bHe: 0, bCloud: 0, bPay: 0, bUtil: 0, bInt: 0,
           lastProfit: 0,
           yRev: 0, yExp: 0, yRent: 0, yOut: 0, yHe: 0, yCloud: 0, yPay: 0, yUtil: 0, yInt: 0,
           pRev: 0, pExp: 0,
           paidIn: 0, equip: 0, unpaid: 0,
           cfOp: 0, cfInv: 0, cfFin: 0, pOp: 0, pInv: 0, pFin: 0 };
    S.fin.paidIn = CFG.startCoins;
    S.jobs = []; S.offer = null; S.offerT = 12; S.jobsDone = 0; S.jobsFailed = 0;
    S.store = { cust: [], stock: 100, spawnT: 2, lost: 0, served: 0 };
    S.cafe = { cust: [], cups: 0, spawnT: 3, lost: 0, served: 0, rep: 1 };
    S.deliv = null; S.delivDone = 0; S.delivLost = 0;
    S.loans = { home: 0, kin: 0, bankp: 0 };
    S.items = []; S.outputs = []; S.contracts = []; S.dc = [];
    S.pendSvc = 0; S.pendDc = 0; S.fx = []; S.toasts = []; S.offline = null;
    S.p = {};
    W.PLOTS.forEach(function (p) {
      S.p[p.id] = { id: p.id, level: p.owned ? 1 : 0, owned: !!p.owned,
                    timer: 0, working: false, prog: 0, buf: [], cur: null, out: null };
    });
    S.rooms = {};
    W.ROOMS.forEach(function (r) { S.rooms[r.id] = !!r.open0; });
    S.player.x = W.START.x; S.player.y = W.START.y; S.player.carry = [];
    buildPads();
    rebuildGrid();
  }
  function spawnItem(from, to, color) {
    var dur = Math.max(0.3, Math.hypot(to.x - from.x, to.y - from.y) / CFG.itemSpeed);
    var it = { x0: from.x, y0: from.y, x1: to.x, y1: to.y, t: 0, dur: dur, color: color, cb: null };
    S.items.push(it);
    return it;
  }
  function nextOwnedStage(id) {
    var i = W.PIPELINE.indexOf(id);
    for (var j = i + 1; j < W.PIPELINE.length; j++)
      if (S.p[W.PIPELINE[j]].owned) return W.BY_ID[W.PIPELINE[j]];
    return null;
  }
  function firstOwnedStage() {
    for (var i = 0; i < W.PIPELINE.length; i++)
      if (S.p[W.PIPELINE[i]].owned) return W.BY_ID[W.PIPELINE[i]];
    return null;
  }
  function deliverItem(p, st) {
    var nx = nextOwnedStage(p.id);
    var target = nx || W.BY_ID.asm;
    var tst = nx ? S.p[nx.id] : S.p.asm;
    if (tst.buf.length >= CFG.bufCap) return false;
    var item = st.out;
    st.out = null;
    var it = spawnItem(W.center(p), W.center(target), nx ? p.color : '#2bb8d8');
    it.cb = function () { tst.buf.push(item); };
    return true;
  }
  function updateStages(dt) {
    if (!room('plant')) return;
    var first = firstOwnedStage();
    W.PLOTS.forEach(function (p) {
      if (p.kind !== 'stage') return;
      var st = S.p[p.id];
      if (!st.owned || !room(p.room)) return;
      if (st.out) { deliverItem(p, st); if (st.out) return; }
      if (!st.working) {
        if (st.buf.length > 0) { st.cur = st.buf.shift(); st.working = true; st.prog = 0; }
        else if (first && first.id === p.id) { st.cur = { q: 28, tier: rdLevel() * 1.2 }; st.working = true; st.prog = 0; }
        else return;
        if (p.fee) spend(p.fee, 'out');
      }
      st.prog += dt / stageRate(p);
      if (st.prog < 1) return;
      st.working = false; st.prog = 0;
      var item = st.cur; st.cur = null;
      if (Math.random() < stageScrap(p)) {
        burst(W.center(p), '#e2504a', 6);
        toast(W.center(p), L.get() === 'ja' ? '歩留まり不良' : 'Yield loss', '#e2504a');
        return;
      }
      item.q += stageQ(p);
      item.tier += 1.0 + (st.level - 1) * 0.35 + rdLevel() * 0.12;
      st.out = item;
      deliverItem(p, st);
    });
  }
  function updateFeeders(dt) {
    W.FEEDERS.forEach(function (id) {
      var p = W.BY_ID[id], st = S.p[id];
      if (!st.owned || !room(p.room)) return;
      st.timer -= dt;
      if (st.timer <= 0) {
        st.timer = p.rate / (1 + 0.24 * (st.level - 1));
        if (st.buf.length < 4) {
          st.buf.push(1);
          if (p.fee) spend(p.fee, 'out');
          spawnItem(W.center(p), W.center(W.BY_ID.asm), p.color);
        }
      }
    });
  }
  function updateHelium(dt) {
    if (!officeOn()) return;
    var p = W.BY_ID.helium, st = S.p.helium;
    st.timer -= dt;
    if (st.timer <= 0) {
      st.timer = st.owned ? p.rate / (1 + 0.3 * (st.level - 1)) : 3.5;
      var target = st.owned ? S.heMax() : 6;
      if (S.he < target) {
        var c = (st.owned ? CFG.heContractCost : CFG.heSpotCost) * (evOn('helium') ? 3 : 1);
        if (S.coins >= c) { spend(c, 'he'); S.he = Math.min(S.heMax(), S.he + 1); }
      }
    }
    S.he -= (S.dc.length * CFG.heRunPerSec + qcLv() * CFG.heCloudPerSec) * dt;
    if (S.he < 0) S.he = 0;
  }
  function updateAssembly(dt) {
    var st = S.p.asm;
    if (!st.owned || !room('plant')) return;
    if (!st.working) {
      if (st.buf.length > 0 && S.outputs.length < CFG.outCap && S.he >= CFG.hePerBuild) {
        st.working = true; st.prog = 0; st.cur = st.buf.shift();
      }
    }
    if (!st.working) return;
    st.prog += dt / asmTime();
    if (st.prog < 1) return;
    st.working = false; st.prog = 0;
    var chip = st.cur; st.cur = null;
    if (S.he < CFG.hePerBuild) { st.buf.unshift(chip); return; }
    S.he -= CFG.hePerBuild;
    var tier = chip.tier, q = chip.q, parts = 0;
    W.FEEDERS.forEach(function (id) {
      var f = S.p[id];
      if (f.owned && f.buf.length > 0) { f.buf.pop(); tier += 1 + (f.level - 1) * 0.3; q += 2 + f.level; parts++; }
    });
    var m = makeMachine(tier, q, parts, S.ownedStages().length);
    S.bestQubits = Math.max(S.bestQubits, m.qubits);
    var slot = W.OUT_SLOTS[S.outputs.length];
    S.outputs.push({ m: m, x: slot.x, y: slot.y });
    burst({ x: slot.x, y: slot.y }, '#e8a800', 8);
  }
  function dcSwap() {
    if (!S.dc.length || !S.player.carry.length) return null;
    var wi = 0, best = null;
    for (var i = 1; i < S.dc.length; i++) if (S.dc[i].qubits < S.dc[wi].qubits) wi = i;
    S.player.carry.forEach(function (m) { if (!best || m.qubits > best.qubits) best = m; });
    if (best.qubits <= S.dc[wi].qubits) return null;
    return { i: wi, old: S.dc[wi], m: best };
  }
  function updateContracts(dt) {
    var mul = svcMul(), drain = 0;
    for (var i = S.contracts.length - 1; i >= 0; i--) {
      var c = S.contracts[i];
      c.life -= dt;
      if (c.life <= 0) { S.contracts.splice(i, 1); continue; }
      if (c.broken) { drain += c.maint * 2.2; continue; }
      S.pendSvc += c.maint * mul * dt;
      if (Math.random() < c.defect * dt) {
        c.broken = true;
        toast(W.center(W.BY_ID.svc), L.get() === 'ja' ? '不具合発生！' : 'Defect!', '#e2504a');
        QT.Sfx.play('bad');
      }
    }
    if (drain > 0) {
      var d = drain * dt;
      var fromPend = Math.min(S.pendSvc, d);
      S.pendSvc -= fromPend;
      spend(d - fromPend, 'other');
    }
    if (botLevel() > 0) {
      var st = S.p.up_bot;
      st.timer -= dt;
      if (st.timer <= 0) {
        st.timer = Math.max(4, 20 - botLevel() * 4);
        for (var j = 0; j < S.contracts.length; j++)
          if (S.contracts[j].broken) { S.contracts[j].broken = false; break; }
      }
    }
  }
  function updateCloud(dt) {
    var t = userTarget();
    S.users += (t.cap - S.users) * Math.min(1, CFG.userSmooth * dt * 3);
    if (Math.abs(t.cap - S.users) < 0.5) S.users = t.cap;
    if (S.he > 0) S.pendDc += S.users * t.arpu * dt;
    S.arpu = t.arpu;
  }
  function updatePopularity(dt) {
    var gain = 0;
    W.PLOTS.forEach(function (p) {
      if (!p.pop) return;
      var st = S.p[p.id];
      if (st.owned && room(p.room)) gain += p.pop * st.level;
    });
    S.pop += gain * dt;
    S.pop -= S.pop * CFG.popDecay * dt;
    if (S.pop > 260) S.pop = 260;
  }
  function unstick() {
    var pl = S.player;
    if (!blocked(pl.x, pl.y)) return;
    for (var r = 1; r <= 30; r++)
      for (var a = 0; a < 16; a++) {
        var th = a * Math.PI / 8;
        var x = pl.x + Math.cos(th) * r * 4, y = pl.y + Math.sin(th) * r * 4;
        if (!blocked(x, y)) { pl.x = x; pl.y = y; return; }
      }
    pl.x = W.START.x; pl.y = W.START.y;
  }
  function tileOf(px, py) { return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) }; }
  function tileOk(x, y) { return x >= 0 && y >= 0 && x < W.WORLD_W && y < W.WORLD_H && GRID[y * W.WORLD_W + x] === 1; }
  function nearPad(wx, wy, maxD) {
    var best = null, bd = maxD;
    for (var i = 0; i < PADS.length; i++) {
      var pad = PADS[i];
      if (!padActive(pad)) continue;
      var d = Math.hypot((pad.x + 0.5) * TILE - wx, (pad.y + 0.5) * TILE - wy);
      if (d < bd) { bd = d; best = pad; }
    }
    if (S.angel && Math.hypot(S.angel.x - wx, S.angel.y - wy) < Math.min(bd, 20)) return { angel: true };
    return best;
  }
  function findPath(from, to) {
    var Wd = W.WORLD_W, N = Wd * W.WORLD_H;
    var prev = new Int32Array(N).fill(-1), q = new Int32Array(N), h = 0, t = 0;
    var s0 = from.y * Wd + from.x, g = to.y * Wd + to.x;
    prev[s0] = s0; q[t++] = s0;
    while (h < t) {
      var c = q[h++];
      if (c === g) break;
      var cx = c % Wd, cy = (c - cx) / Wd;
      var nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var k = 0; k < 4; k++) {
        var nx = cx + nb[k][0], ny = cy + nb[k][1];
        if (!tileOk(nx, ny)) continue;
        var n = ny * Wd + nx;
        if (prev[n] >= 0) continue;
        prev[n] = c; q[t++] = n;
      }
    }
    if (prev[g] < 0) return null;
    var path = [];
    for (var v = g; v !== s0; v = prev[v]) path.push({ x: (v % Wd + 0.5) * TILE, y: (Math.floor(v / Wd) + 0.5) * TILE });
    return path.reverse();
  }
  function goTo(wx, wy) {
    var pl = S.player;
    var pad = nearPad(wx, wy, 22);
    if (pad && pad.angel) { wx = S.angel.x; wy = S.angel.y; }
    else if (pad) { wx = (pad.x + 0.5) * TILE; wy = (pad.y + 0.5) * TILE; }
    var tt = tileOf(wx, wy);
    if (!tileOk(tt.x, tt.y)) {
      var p2 = nearPad(wx, wy, 3.5 * TILE);
      if (p2 && !p2.angel) { wx = (p2.x + 0.5) * TILE; wy = (p2.y + 0.5) * TILE; tt = tileOf(wx, wy); }
    }
    if (!tileOk(tt.x, tt.y)) {
      var found = null;
      for (var r = 1; r <= 3 && !found; r++)
        for (var dy = -r; dy <= r && !found; dy++)
          for (var dx = -r; dx <= r; dx++)
            if (tileOk(tt.x + dx, tt.y + dy)) { found = { x: tt.x + dx, y: tt.y + dy }; break; }
      if (!found) return false;
      tt = found; wx = (tt.x + 0.5) * TILE; wy = (tt.y + 0.5) * TILE;
    }
    var path = findPath(tileOf(pl.x, pl.y), tt);
    if (!path) return false;
    if (path.length) path[path.length - 1] = { x: wx, y: wy };
    else path = [{ x: wx, y: wy }];
    pl.path = path; pl.goal = { x: wx, y: wy }; pl.stuckT = 0;
    if (!S.tut) S.tut = 1;
    return true;
  }
  function updatePlayer(dt, dir) {
    unstick();
    var pl = S.player, sp = playerSpeed();
    if (Math.hypot(dir.x, dir.y) > 0.05) { pl.path = null; pl.goal = null; }
    else if (pl.path && pl.path.length) {
      var wp = pl.path[0], ddx = wp.x - pl.x, ddy = wp.y - pl.y, dd = Math.hypot(ddx, ddy);
      if (dd < 3) {
        pl.path.shift();
        if (!pl.path.length) { pl.path = null; pl.goal = null; }
        dir = { x: 0, y: 0 };
      } else {
        var k = Math.min(1, dd / (sp * dt)) / dd;
        dir = { x: ddx * k, y: ddy * k };
        pl.stuckT = (pl.stuckT || 0) + dt;
        if (pl.lastPx != null && Math.hypot(pl.x - pl.lastPx, pl.y - pl.lastPy) > 0.5) pl.stuckT = 0;
        if (pl.stuckT > 0.8) { pl.path = null; pl.goal = null; }
      }
    }
    pl.lastPx = pl.x; pl.lastPy = pl.y;
    var mag = Math.hypot(dir.x, dir.y);
    if (mag > 1) { dir.x /= mag; dir.y /= mag; mag = 1; }
    var nx = pl.x + dir.x * sp * dt, ny = pl.y + dir.y * sp * dt;
    if (!blocked(nx, pl.y)) pl.x = nx;
    if (!blocked(pl.x, ny)) pl.y = ny;
    if (mag > 0.05) {
      if (!S.tut) { S.tutWalk = (S.tutWalk || 0) + sp * dt * mag; if (S.tutWalk > 60) S.tut = 1; }
      pl.walk += dt * 9;
      if (Math.abs(dir.x) > Math.abs(dir.y)) pl.dir = dir.x > 0 ? 1 : 3;
      else pl.dir = dir.y > 0 ? 0 : 2;
    } else pl.walk = 0;
    for (var i = S.outputs.length - 1; i >= 0; i--) {
      if (pl.carry.length >= carryMax()) break;
      var o = S.outputs[i];
      if (Math.hypot(o.x - pl.x, o.y - pl.y) < 15) {
        pl.carry.push(o.m); S.outputs.splice(i, 1); QT.Sfx.play('pick');
      }
    }
    S.outputs.forEach(function (o, i) { o.x = W.OUT_SLOTS[i].x; o.y = W.OUT_SLOTS[i].y; });
  }
  var ANGEL_PAD = { p: null, type: 'angel', room: null, x: 0, y: 0 };
  function padAt(pl) {
    if (S.angel && Math.hypot(S.angel.x - pl.x, S.angel.y - pl.y) < 16) {
      ANGEL_PAD.x = S.angel.x / TILE - 0.5;
      ANGEL_PAD.y = S.angel.y / TILE - 0.5;
      return ANGEL_PAD;
    }
    for (var i = 0; i < PADS.length; i++) {
      var pad = PADS[i];
      if (!padActive(pad)) continue;
      if (Math.abs((pad.x + 0.5) * TILE - pl.x) < 11 && Math.abs((pad.y + 0.5) * TILE - pl.y) < 11) return pad;
    }
    return null;
  }
  function fixFee() {
    var f = 0;
    S.contracts.forEach(function (c) { if (c.broken) f += c.price * 0.06; });
    return Math.round(f * Math.max(0.4, 1 - 0.12 * (S.p.svc.level - 1)));
  }
  function vcProfit() { return Math.max(0, S.fin.lastProfit) * 12; }
  var VC_SCALE = [1, 1.6, 2.4, 3.4, 4.5];
  function vcAmount() {
    var base = Math.max(1500000, S.value() * 0.02);
    return Math.round(base * (VC_SCALE[S.rounds] || 1));
  }
  function vcKeep() {
    var p = S.fin.lastProfit;
    if (p > 2000000) return 0.93;
    if (p > 0) return 0.88;
    return 0.82;
  }
  function vcCool() { return Math.max(0, (S.vcAt || 0) + 3 * W.MONTH - S.t); }
  var VC_GATE = [
    function () { return S.jobsDone >= 1; },
    function () { return room('plant'); },
    function () { return room('outsrc'); },
    function () { return room('cryo'); },
    function () { return room('hq'); }
  ];
  function vcGateOk() { var g = VC_GATE[S.rounds]; return !g || g(); }
  function vcReady() {
    if (!S.co.founded) return false;
    if (vcCool() > 0) return false;
    return vcGateOk();
  }
  function foundStep() {
    if (!S.co.certified) return { id: 'certify', key: 'stepCertify', cost: CFG.notaryFee, hold: 0.9 };
    if (!S.co.founded)   return { id: 'register', key: 'stepRegister', cost: CFG.registryFee, hold: 1.2 };
    if (!S.co.bank)      return { id: 'bank', key: 'stepBank', cost: 0, hold: 0.9 };
    return null;
  }
  var AUTO_HINT = { swjob: 'autoSwHint', ship: 'autoShipHint' };
  var AUTO_HINT3 = { desk: 'autoDeskHint' };
  function buyHint(p) {
    if (p.kind === 'software' && W.DOMAINS[p.domain]) return T('hintDomain', { n: W.DOMAINS[p.domain].cap });
    if (p.id === 'lounge') return T('hintLounge');
    if (p.id === 'sphere') return T('hintSphere');
    if (p.pop) return T('hintPop');
    return '';
  }
  function padInfo(pad) {
    if (pad.type === 'expand') {
      var r = pad.room;
      var isRent = r.rent > 0;
      return {
        label: T(isRent ? 'rentRoom' : 'expandRoom', { n: nm(r) }),
        sub: nm(r, 'sub') + (isRent ? '   ' + T('monthlyRent', { v: fmt(r.rent) }) : ''),
        cost: r.cost, can: S.coins >= r.cost, hold: 0.8
      };
    }
    if (pad.type === 'mission') {
      var mc = missionCool();
      return { label: S.mission ? T('missionNow', { n: nm(W.BY_ID[S.mission.corp]) }) : T('missionTake'),
               sub: S.mission ? T('missionLeft', { n: Math.ceil(missionLeft()) })
                    : mc > 0 ? T('missionWait', { n: Math.ceil(mc) }) : T('missionSub'),
               cost: 0, can: !S.mission && mc <= 0, hold: 0.8 };
    }
    if (pad.type === 'sales') {
      var cs = corp(pad.p.id);
      return { label: T('salesVisit', { n: nm(pad.p) }),
               sub: T('relInfo', { r: cs.rel.toFixed(1), j: cs.jobs }) + '　' +
                    T('missionLeft', { n: Math.ceil(missionLeft()) }),
               cost: 0, gain: salesPay(pad.p.id), can: true, hold: 1.0 };
    }
    if (pad.type === 'press2') {
      var pc = pressCool(), pcost = pressCost();
      return { label: T('pressRelease'),
               sub: pc > 0 ? T('pressCool', { n: Math.ceil(pc) })
                    : T('pressSub', { t: techScore(), p: pressPop(), n: Math.round(pressLife()) }),
               cost: pcost, can: pc <= 0 && S.coins >= pcost, hold: 0.9 };
    }
    if (pad.type === 'cvc') {
      var cc = corp(pad.p.id), cd = cvcCool(pad.p.id);
      var okRel = cc.rel >= CFG.cvcRelMin;
      return { label: T('cvcRaise', { n: nm(pad.p, 'cvc') }),
               sub: !S.co.founded ? T('needCompany')
                    : !okRel ? T('needRel', { n: CFG.cvcRelMin })
                    : cd > 0 ? T('cvcCool', { n: Math.ceil(cd) })
                    : T('cvcTerms', { p: Math.round((1 - cvcKeep(pad.p.id)) * 100), j: cc.jobs }),
               cost: 0, gain: cvcAmount(pad.p.id),
               can: S.co.founded && okRel && cd <= 0, hold: 1.3 };
    }
    if (pad.type === 'angel') {
      var ang = S.angel;
      if (!ang) return null;
      return { label: nm(ang.who) + T('angelTalk'),
               sub: T('angelSub', { p: Math.round(angelChance() * 100), n: Math.ceil(ang.life) }),
               cost: 0, gain: angelAmount(), can: true, hold: 1.6 };
    }
    var p = pad.p, st = S.p[p.id];
    switch (pad.type) {
      case 'reg': {
        var sv = S.store;
        return { label: T('work_reg'),
                 sub: sv.cust.length
                   ? T('waiting', { n: sv.cust.length }) + '   ' + T('shelf', { n: Math.round(sv.stock) })
                   : T('noCustomer'),
                 cost: 0, gain: storePay('reg'), can: sv.cust.length > 0, hold: CFG.jobs.reg.time };
      }
      case 'stock': {
        var sv2 = S.store;
        return { label: T('work_stock'), sub: T('shelf', { n: Math.round(sv2.stock) }),
                 cost: 0, gain: storePay('stock'), can: sv2.stock < 95, hold: CFG.jobs.stock.time };
      }
      case 'brew': {
        var cf = S.cafe;
        return { label: T('work_brew'), sub: T('cups', { n: cf.cups, m: CFG.cupsMax }),
                 cost: 0, gain: cafePay('brew'), can: cf.cups < CFG.cupsMax, hold: CFG.jobs.brew.time };
      }
      case 'cserve': {
        var cf2 = S.cafe;
        return { label: T('work_serve'),
                 sub: (!cf2.cust.length ? T('noCustomer')
                       : !cf2.cups ? T('needCups')
                       : T('waiting', { n: cf2.cust.length }) + '   ' + T('cups', { n: cf2.cups, m: CFG.cupsMax }))
                      + '   ' + T('cafeRep', { n: Math.round(cf2.rep * 100) }),
                 cost: 0, gain: cafePay('cserve'),
                 can: cf2.cust.length > 0 && cf2.cups > 0, hold: CFG.jobs.cserve.time };
      }
      case 'pickup': {
        if (S.deliv)
          return { label: T('delivCarry', { n: nm(W.BY_ID[S.deliv.corp]) }),
                   sub: T('delivLeft', { n: Math.ceil(delivLeft()) }),
                   cost: 0, gain: delivReward(), can: false, hold: 0 };
        return { label: T('delivTake'), sub: T('delivSub', { n: CFG.delivTime }),
                 cost: 0, can: true, hold: 0.6 };
      }
      case 'drop':
        return { label: T('delivDrop', { n: nm(p) }),
                 sub: T('delivLeft', { n: Math.ceil(delivLeft()) }),
                 cost: 0, gain: delivReward(), can: true, hold: 0.5 };
      case 'swjob': {
        var bi2 = nextJob('sw');
        if (bi2 < 0) return { label: T('swDeliver'), sub: T('noSwJob'), cost: 0, can: false, hold: 0 };
        if (S.swStock <= 0) return { label: T('swDeliver'), sub: T('needSwStock'), cost: 0, can: false, hold: 0 };
        var jb2 = S.jobs[bi2];
        return { label: T('swDeliver'),
                 sub: T('devProgress2', { a: jb2.done, b: jb2.work, s: S.swStock }),
                 cost: 0, gain: jb2.done + 1 >= jb2.work ? jb2.reward : 0,
                 can: true, hold: 0.9 / (1 + 0.12 * (S.p.swjob.level - 1)) };
      }
      case 'hwasm': {
        if (!S.p.hwasm.owned) return { label: T('hwBuild'), sub: nm(pad.p, 'verb'), cost: 0, can: false, hold: 0 };
        if (rdLevel() < 1) return { label: T('hwBuild'), sub: T('needRd'), cost: 0, can: false, hold: 0 };
        if (S.parts < CFG.partsPerBuild)
          return { label: T('hwBuild'), sub: T('needParts'), cost: 0, can: false, hold: 0 };
        var hq = hwasmQ();
        var pq = room('plant') ? Math.max(S.bestQubits, specPlan().q) : 0;
        var hsub = hq >= CFG.hwasmQCap ? (!room('plant') ? T('hwCapped', { q: hq })
                                          : pq > hq ? T('hwCappedPlant', { q: hq, b: pq }) : T('hwCappedGrow', { q: hq }))
                 : T('hwSpec', { q: hq }) + '   ' + T('partsLeft', { n: S.parts });
        return { label: T('hwBuild'), sub: hsub,
                 cost: 0, can: true, hold: 1.3 / (1 + 0.12 * (S.p.hwasm.level - 1)) };
      }
      case 'supply': {
        var pc2 = Math.round(CFG.partCost * (1 - 0.06 * (S.p.supply.level - 1)) * (evOn('parts') ? 1.8 : 1));
        return { label: T('buyParts'), sub: T('partsLeft', { n: S.parts }),
                 cost: pc2, can: S.coins >= pc2 && S.parts + CFG.partsPerBuy <= partsCap(), hold: 0.9 };
      }
      case 'buyPC': {
        var pcp = W.BY_ID.pc, pst = S.p.pc;
        if (pst.level >= pcp.maxLevel)
          return { label: T('buyPC'), sub: T('maxLevel', { n: pst.level }), cost: 0, can: false, hold: 0 };
        var c3 = costOf(pcp);
        return { label: T('buyPC'), sub: T('pcSub', { a: pst.level, b: pst.level + 1 }),
                 cost: c3, can: S.coins >= c3, hold: 0.7 };
      }
      case 'collectSales': {
        var ar = arTotal();
        return { label: T('acctCollect'),
                 sub: ar > 0 ? T('arPending', { v: fmt(ar), n: Math.ceil(arNext()) })
                             : (S.pendSales >= 1 ? T('arReady') : T('arNone')),
                 cost: 0, gain: Math.floor(S.pendSales), can: S.pendSales >= 1, hold: 0 };
      }
      case 'dev': {
        var swj = null;
        for (var i2 = 0; i2 < S.jobs.length; i2++)
          if (S.jobs[i2].kind === 'sw' && S.jobs[i2].done < S.jobs[i2].work &&
              (!swj || swj.due > S.jobs[i2].due)) swj = S.jobs[i2];
        return { label: T('devWork'),
                 sub: T('devStock', { s: S.swStock, m: CFG.stockCap, c: fmt(cloudFee()) }),
                 cost: cloudFee(), can: S.swStock < CFG.stockCap && S.coins >= cloudFee(),
                 hold: devTime() };
      }
      case 'rd': {
        var rlv = rdLevel(), rnext = (rlv + 1) * CFG.rdPerLevel;
        if (S.p.hwlab.owned && rlv >= rdCap())
          return { label: T('rdWork'),
                   sub: canUpgrade(W.BY_ID.hwlab) ? T('rdCapped', { lv: rlv, n: hwlabLv() })
                                                  : T('rdMaxed', { lv: rlv }),
                   cost: 0, can: false, hold: 0 };
        if (S.p.hwlab.owned && S.parts <= 0)
          return { label: T('rdWork'), sub: T('needParts'), cost: 0, can: false, hold: 0 };
        return { label: T('rdWork'),
                 sub: T('rdProgress', { a: S.rd, b: rnext, lv: rlv, c: fmt(CFG.rdCost) }) +
                      '   ' + T('rdTeam', { n: rdStaff() }),
                 cost: CFG.rdCost, can: S.p.hwlab.owned && S.parts > 0 && S.coins >= CFG.rdCost,
                 hold: CFG.rdTime };
      }
      case 'notary':
        if (S.co.certified) return { label: T('notary'), sub: T('notaryDone'), cost: 0, can: false, hold: 0 };
        return { label: T('notary'), sub: T('notarySub'), cost: CFG.notaryFee,
                 can: S.coins >= CFG.notaryFee, hold: 0.9 };
      case 'registry':
        if (S.co.founded) return { label: T('registry'), sub: T('registryDone'), cost: 0, can: false, hold: 0 };
        if (!S.co.certified) return { label: T('registry'), sub: T('registryNeed'), cost: 0, can: false, hold: 0 };
        return { label: T('registry'), sub: T('registrySub'), cost: CFG.registryFee,
                 can: S.coins >= CFG.registryFee, hold: 1.2 };
      case 'bank':
        if (S.co.bank) return { label: T('bank'), sub: T('bankDone'), cost: 0, can: false, hold: 0 };
        if (!S.co.founded) return { label: T('bank'), sub: T('bankNeed'), cost: 0, can: false, hold: 0 };
        return { label: T('bank'), sub: T('bankSub'), cost: 0, can: true, hold: 0.9 };
      case 'borrow': {
        var lc = CFG.loans[p.id], blk = loanBlock(p.id);
        var take = Math.min(loanStep(p.id), loanRoom(p.id));
        var rate = lc.rate > 0 ? T('loanRate', { r: (lc.rate * 100).toFixed(0) }) : T('loanFree');
        return { label: T('borrowFrom', { n: nm(p) }),
                 sub: blk ? blk
                      : take <= 0 ? T('loanFull', { v: fmt(loanMax(p.id)) })
                      : T('loanState', { b: fmt(loanBal(p.id)), m: fmt(loanMax(p.id)) }) + '　' + rate,
                 cost: 0, gain: take, can: !blk && take > 0, hold: 0.9 };
      }
      case 'repay': {
        var bal = loanBal(p.id);
        var back = Math.min(loanStep(p.id), bal, Math.floor(S.coins));
        return { label: T('repayTo', { n: nm(p) }),
                 sub: back <= 0 ? T('notEnough') : T('loanLeft', { v: fmt(bal) }),
                 cost: back, can: back > 0, hold: 0.6 };
      }
      case 'accept': {
        var o = S.offer;
        if (!o) return { label: T('orders'), sub: T('noOrder'), cost: 0, can: false, hold: 0 };
        return { label: T(o.kind === 'sw' ? 'acceptSw' : 'acceptHw') + ' — ' + nm(o.client),
                 sub: (o.kind === 'sw' ? T('swSpec', { n: o.work }) : T('needSpec', { q: o.qubits, n: o.count })) +
                      (o.kind === 'hw' && !canFulfill(o) ? '  ' + T('specCant', { q: Math.max(S.bestQubits, room('plant') ? specPlan().q : hwasmQ()) })
                                                         : '   ' + T('deadline') + ' ' + Math.round(o.deadline) + 's'),
                 cost: 0, gain: o.reward, can: true, hold: 0.5 };
      }
      case 'buy':
        if (p.kind === 'office')
          return { label: nm(p), sub: st.owned ? T('officeRented')
                     : T('officeSub', { r: fmt(p.rent), u: fmt(p.util) }),
                   cost: st.owned ? 0 : costOf(p),
                   can: !st.owned && S.co.bank && S.coins >= costOf(p), hold: 0.8 };
        var h = buyHint(p);
        var sg = room('plant') ? specGain(p) : 0;
        if (sg > 0 && canUpgrade(p)) h = (h ? h + '  ' : '') + T('specGain', { n: sg.toFixed(sg < 1 ? 2 : 1) });
        if (p.id === 'asm' && st.owned && room('plant')) {
          var sp0 = specPlan();
          h = (h ? h + '  ' : '') + (sp0.next ? T('specNow', { q: sp0.q, n: sp0.need.toFixed(1), q2: sp0.next })
                                              : T('specMax', { q: sp0.q }));
        }
        if (!st.owned) return { label: nm(p), sub: nm(p, 'verb') + (h ? '  ' + h : ''), cost: costOf(p),
                                can: S.coins >= costOf(p), hold: 0.45 };
        if (!canUpgrade(p)) return { label: nm(p), sub: T('maxLevel', { n: st.level }), cost: 0, can: false, hold: 0 };
        return { label: nm(p), sub: nm(p, 'verb') + '  ' + T('upgradeTo', { a: st.level, b: st.level + 1 }) +
                                     (h ? '  ' + h : '') +
                                     (AUTO_HINT[p.id] && st.level === 1 ? '  ' + T(AUTO_HINT[p.id]) : '') +
                                     (AUTO_HINT3[p.id] && st.level === 2 ? '  ' + T(AUTO_HINT3[p.id]) : ''),
                 cost: costOf(p), can: S.coins >= costOf(p), hold: 0.45 };
      case 'ship': {
        var n = S.player.carry.length, sum = 0;
        S.player.carry.forEach(function (m) { sum += Math.round(m.price * shipMul() * 0.7 * spotMul()); });
        var sub = S.truck.state === 'back' ? T('truckBacking')
                : !truckHere() ? T('truckComing', { n: Math.ceil(truckWait()) })
                : n ? (S.jobs.length ? T('activeOrders') + ' ' + S.jobs.length : T('spotSale', { n: n }))
                : T('bringUnits');
        if (spotMul() < 0.95) sub += '   ' + T('market', { n: Math.round(spotMul() * 100) });
        return { label: T('shipDock'), sub: sub, cost: 0, gain: n ? sum : 0,
                 can: n > 0 && truckHere(), hold: 0.25 };
      }
      case 'dcdrop': {
        var free = S.dcCapacity() - S.dc.length, sw0 = dcSwap();
        return { label: T('deployDC'),
                 sub: !st.owned ? T('dcNotBuilt')
                      : free <= 0 && sw0 ? T('dcSwap', { a: sw0.old.qubits, b: sw0.m.qubits })
                      : T('dcRunning', { a: S.dc.length, b: S.dcCapacity() }),
                 cost: 0, can: st.owned && S.player.carry.length > 0 && (free > 0 || !!sw0), hold: 0.25 };
      }
      case 'collectDc':
        return { label: T('cloudRevenue'),
                 sub: 'Lv.' + qcLv() + '  ' + T('usersUsing', { n: Math.floor(S.users) }) + (S.he <= 0 ? T('heliumOut') : ''),
                 cost: 0, gain: Math.floor(S.pendDc), can: S.pendDc >= 1, hold: 0 };
      case 'collectSvc':
        return { label: T('svcRevenue'), sub: T('nContracts', { n: S.contracts.length }),
                 cost: 0, gain: Math.floor(S.pendSvc), can: S.pendSvc >= 1, hold: 0 };
      case 'fix': {
        var b = S.brokenCount(), fee = fixFee();
        return { label: T('fixDefects'), sub: b ? T('nBroken', { n: b }) : T('noDefects'),
                 cost: fee, can: b > 0 && S.coins >= fee, hold: 0.5 };
      }
      case 'promo': {
        var c1 = Math.round(p.promo * Math.pow(1.5, st.level - 1));
        return { label: T('promotion'), sub: T('buzzUp', { n: Math.round(10 * st.level) }),
                 cost: c1, can: st.owned && S.coins >= c1, hold: 0.4 };
      }
      case 'seminar': {
        var c2 = Math.round(900000 * Math.pow(1.6, st.level - 1));
        return { label: T('seminarRun'), sub: T('seminarSub', { u: 60 * st.level, p: 4 * st.level }),
                 cost: c2, can: st.owned && S.coins >= c2, hold: 0.4 };
      }
      case 'vc': {
        if (!S.co.founded) return { label: T('vcRound'), sub: T('registryNeed'), cost: 0, can: false, hold: 0 };
        if (S.rounds >= CFG.maxRounds)
          return { label: T('vcRound'), sub: T('vcDone', { n: S.rounds }), cost: 0, can: false, hold: 0 };
        var amt = vcAmount(), keep = vcKeep();
        var round = T('vcName' + S.rounds);
        if (vcCool() > 0)
          return { label: round,
                   sub: T('vcCool', { n: Math.ceil(vcCool()) }), cost: 0, can: false, hold: 0 };
        if (!vcReady())
          return { label: round, sub: T('vcNeed' + S.rounds), cost: 0, can: false, hold: 0 };
        return { label: round,
                 sub: T('vcSub', { v: fmt(amt), a: Math.round(S.equity * 100),
                                   b: Math.round(S.equity * keep * 100) }) +
                      '   ' + T('vcBasis', { v: fmt(S.value()), p: fmt(S.fin.lastProfit) }),
                 cost: 0, gain: amt, can: true, hold: 1.2 };
      }
      case 'gacha': {
        var gc = gachaCool(), gcost = gachaCost();
        return { label: T('gachaPull'),
                 sub: gc > 0 ? T('gachaCool', { n: Math.ceil(gc) })
                      : T('gachaSub', { n: GACHA_PITY - (S.gachaDry || 0) }),
                 cost: gcost, can: gc <= 0 && S.coins >= gcost && !S.gacha, hold: 0.6 };
      }
      case 'ipo': {
        if (S.ipo) return { label: T(S.prime ? 'exPrime' : 'exListed'),
                            sub: T('exSub', { p: String(S.sharePrice()).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                              v: fmt(S.marketCap()) }),
                            cost: 0, can: true, hold: 0.8 };
        if (S.seenWin) return { label: T('ipoGate'), sub: T('ipoDone'), cost: 0, can: false, hold: 0 };
        var ng = ipoChecks().filter(function (c) { return !c[1]; });
        return { label: T('ipoGate'),
                 sub: ng.length ? T('ipoUnmet') + ng.map(function (c) { return c[0]; }).join('  ') : T('ipoReady'),
                 cost: 0, can: ng.length === 0, hold: 1.2 };
      }
    }
    return null;
  }
  function doPad(pad) {
    var info = padInfo(pad);
    if (S.tut < 2) S.tut = 2;
    if (pad.type === 'expand') {
      var r = pad.room;
      invest(r.cost);
      S.rooms[r.id] = true;
      rebuildGrid();
      if (QT.track) QT.track('room', { id: r.id, min: Math.round(S.t / 60) });
      var c = { x: (r.ix + r.iw / 2) * TILE, y: (r.iy + r.ih / 2) * TILE };
      toast(c, nm(r) + '  -' + fmt(r.cost), '#e8a800');
      burst(c, '#e8a800', 40);
      banner('NEW AREA!!', nm(r), '#e2508a', 'area');
      if (QT.Render) QT.Render.shake(9, 0.5);
      QT.Sfx.play('fanfare');
      return;
    }
    if (pad.type === 'mission') { takeMission(); return; }
    if (pad.type === 'sales') {
      var sp2 = corp(pad.p.id);
      sp2.visitAt = S.t;
      sp2.rel = Math.min(CFG.relMax, sp2.rel + 1);
      S.pop += 2;
      invoice(salesPay(pad.p.id), pad.p.id, 'sw');
      S.mission = null; S.missionAt = S.t;
      toast(W.center(pad.p), T('relUp', { r: sp2.rel.toFixed(1) }), '#2fbf7a');
      burst(W.center(pad.p), '#2fbf7a', 16); QT.Sfx.play('cash');
      if (!S.offer && S.offerT > 4) S.offerT = 3;
      return;
    }
    if (pad.type === 'press2') {
      spend(pressCost(), 'other');
      S.pressAt = S.t; S.pressUntil = S.t + pressLife();
      S.pop += pressPop();
      S.users += pressPop() * 4;
      if (S.offerT > 3) S.offerT = 2.5;
      toast(W.center(pad.p), T('pressOut', { n: pressPop() }), '#e2508a');
      burst(W.center(pad.p), '#e2508a', 22); QT.Sfx.play('fanfare');
      return;
    }
    if (pad.type === 'cvc') {
      var cv = corp(pad.p.id), amt2 = cvcAmount(pad.p.id);
      cv.fundAt = S.t; cv.funded = true;
      raise(amt2);
      S.equity *= cvcKeep(pad.p.id);
      toast(W.center(pad.p), T('cvcDone') + ' +' + fmt(amt2), '#6f57e0');
      burst(W.center(pad.p), '#6f57e0', 28); QT.Sfx.play('fanfare');
      return;
    }
    if (pad.type === 'angel') {
      var ag = S.angel;
      if (!ag) return;
      var pos = { x: ag.x, y: ag.y };
      ag.talked = true;
      if (Math.random() < angelChance()) {
        var amt = angelAmount();
        raise(amt);
        S.equity *= CFG.angelKeep;
        S.angelDeals++;
        toast(pos, T('angelDeal') + ' +' + fmt(amt), '#f5b21c');
        burst(pos, '#f5b21c', 34); QT.Sfx.play('fanfare');
      } else {
        toast(pos, T('angelPass'), '#b9b3c8');
        burst(pos, '#b9b3c8', 10); QT.Sfx.play('bad');
      }
      return;
    }
    var p = pad.p, st = S.p[p.id], cpos = W.center(p);
    switch (pad.type) {
      case 'reg': case 'stock': {
        comboHit();
        var sv = S.store, crit = critRoll(), got = Math.round(storePay(pad.type) * comboMul() * (crit ? 3 : 1));
        var wp = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (pad.type === 'reg') {
          sv.cust.shift(); sv.served++;
          sv.stock = Math.max(0, sv.stock - 7);
        } else sv.stock = Math.min(100, sv.stock + 24);
        got = earn(got, 'job'); S.co.shifts++;
        toast(wp, '+¥' + fmt(got), '#2fbf7a', { crit: crit });
        burst(wp, crit ? '#f5b21c' : '#2fbf7a', crit ? 24 : 8); QT.Sfx.play('cash', 1 + Math.min(0.6, 0.06 * (S.combo - 1)));
        if (crit) { QT.Sfx.play('winR'); if (QT.Render) QT.Render.shake(5, 0.3); }
        break;
      }
      case 'brew': case 'cserve': {
        comboHit();
        var cf = S.cafe, crit2 = critRoll(), got2 = Math.round(cafePay(pad.type) * comboMul() * (crit2 ? 3 : 1));
        var wp0 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (pad.type === 'brew') {
          cf.cups = Math.min(CFG.cupsMax, cf.cups + CFG.cupsPerBrew);
        } else {
          cf.cust.shift(); cf.served++;
          cf.cups = Math.max(0, cf.cups - 1);
          cf.rep = Math.min(1, cf.rep + CFG.cafeRepGain);
        }
        got2 = earn(got2, 'job'); S.co.shifts++;
        toast(wp0, '+¥' + fmt(got2), '#8a5a3c', { crit: crit2 });
        burst(wp0, crit2 ? '#f5b21c' : pad.type === 'brew' ? '#c89b6a' : '#8a5a3c', crit2 ? 24 : 8);
        QT.Sfx.play('cash', 1 + Math.min(0.6, 0.06 * (S.combo - 1)));
        if (crit2) { QT.Sfx.play('winR'); if (QT.Render) QT.Render.shake(5, 0.3); }
        break;
      }
      case 'pickup': {
        takeDeliv();
        var wp7 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        toast(wp7, T('delivGo', { n: nm(W.BY_ID[S.deliv.corp]) }), '#f2a63b');
        burst(wp7, '#f2a63b', 10); QT.Sfx.play('good');
        break;
      }
      case 'drop': {
        comboHit();
        var crit3 = critRoll(), got3 = Math.round(delivReward() * (crit3 ? 3 : 1));
        got3 = earn(got3, 'job'); S.delivDone++;
        if (crit3) { QT.Sfx.play('winR'); if (QT.Render) QT.Render.shake(5, 0.3); }
        var cd = corp(p.id);
        if (cd.rel < CFG.delivRelMax) cd.rel = Math.min(CFG.delivRelMax, cd.rel + 0.15);
        S.deliv = null;
        toast(cpos, '+¥' + fmt(got3), '#2fbf7a', { big: true, crit: crit3 });
        burst(cpos, '#f2a63b', 16); QT.Sfx.play('cash');
        break;
      }
      case 'notary':
        spend(CFG.notaryFee, 'other'); S.co.certified = true;
        toast(cpos, T('notaryDone'), '#2bb8d8'); burst(cpos, '#7d8fc4', 14); QT.Sfx.play('buy');
        break;
      case 'registry':
        spend(CFG.registryFee, 'other'); S.co.founded = true; S.equity = 1.0;
        toast(cpos, T('incorporated'), '#e8a800'); burst(cpos, '#e8a800', 30); QT.Sfx.play('fanfare');
        break;
      case 'bank':
        S.co.bank = true;
        toast(cpos, T('bankDone'), '#2fbf7a'); burst(cpos, '#2fbf7a', 16); QT.Sfx.play('buy');
        break;
      case 'borrow': {
        var got0 = borrow(p.id, loanStep(p.id));
        toast(cpos, T('borrowed') + ' +' + fmt(got0), '#2fbf7a');
        burst(cpos, '#2fbf7a', 14); QT.Sfx.play('cash');
        break;
      }
      case 'repay': {
        var back0 = repayLoan(p.id, loanStep(p.id)), rest = loanBal(p.id);
        toast(cpos, (rest ? T('loanLeft', { v: fmt(rest) }) : T('loanCleared')) + '  -' + fmt(back0),
              rest ? '#f2a63b' : '#2fbf7a');
        burst(cpos, rest ? '#f2a63b' : '#2fbf7a', rest ? 12 : 24);
        QT.Sfx.play(rest ? 'buy' : 'fanfare');
        break;
      }
      case 'dev': {
        var r2 = devWork();
        var wp2 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (r2) { toast(wp2, '成果 ' + r2.stock, '#2bb8d8'); QT.Sfx.play('click'); burst(wp2, '#2bb8d8', 6); }
        break;
      }
      case 'swjob': {
        var r3 = swDeliver();
        var wp4 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (r3 && r3.done) { toast(wp4, T('invoiced') + ' ' + fmt(r3.amount), '#2fbf7a'); QT.Sfx.play('good'); }
        else if (r3) { toast(wp4, r3.job.done + '/' + r3.job.work, '#2fbf7a'); QT.Sfx.play('click'); }
        burst(wp4, '#2fbf7a', 8);
        break;
      }
      case 'hwasm': {
        var r4 = hwBuild();
        var wp5 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (r4 && r4.done) { toast(wp5, T('invoiced') + ' ' + fmt(r4.amount), '#e2508a'); QT.Sfx.play('good'); }
        else if (r4) { toast(wp5, r4.q + 'qubit', '#e2508a'); QT.Sfx.play('click'); }
        burst(wp5, '#e2508a', 8);
        break;
      }
      case 'buyPC': {
        invest(info.cost);
        S.p.pc.level++;
        toast(cpos, T('buyPC') + ' Lv.' + S.p.pc.level + '  -' + fmt(info.cost), '#2bb8d8');
        burst(cpos, '#2bb8d8', 12); QT.Sfx.play('buy');
        break;
      }
      case 'supply': {
        spend(info.cost, 'out');
        S.parts = Math.min(partsCap(), S.parts + CFG.partsPerBuy);
        var wp6 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        toast(wp6, T('partsLeft', { n: S.parts }) + '  -' + fmt(info.cost), '#8a6a3c');
        burst(wp6, '#8a6a3c', 8); QT.Sfx.play('buy');
        break;
      }
      case 'collectSales':
        S.collectedOnce = true;
        collect(S.pendSales);
        toast(cpos, '+¥' + fmt(S.pendSales), '#f2a63b', { big: true });
        S.pendSales = 0; QT.Sfx.play('cash');
        break;
      case 'rd': {
        spend(CFG.rdCost, 'out');
        S.parts = Math.max(0, S.parts - 1);
        var before = rdLevel();
        S.rd++;
        var wp3 = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        if (rdLevel() > before) {
          toast(wp3, T('rdUp', { lv: rdLevel() }), '#ef7d2e');
          burst(wp3, '#ef7d2e', 18); QT.Sfx.play('good');
        } else { toast(wp3, S.rd + '/' + ((before + 1) * CFG.rdPerLevel), '#ef7d2e'); QT.Sfx.play('click'); }
        break;
      }
      case 'accept': acceptOffer(); break;
      case 'buy':
        invest(info.cost);
        var spent = '  -' + fmt(info.cost);
        if (!st.owned) {
          st.owned = true; st.level = 1; toast(cpos, nm(p) + spent, '#e8a800'); rebuildGrid();
          banner('NEW!!', nm(p), '#2bb8d8', 'new');
        } else {
          st.level++; toast(cpos, nm(p) + ' Lv.' + st.level + spent, '#e8a800');
          banner('LEVEL UP!!', nm(p) + '  Lv.' + st.level, '#f5b21c', 'level');
        }
        burst(cpos, '#e8a800', 26); QT.Sfx.play('levelup');
        break;
      case 'ship': {
        var n0 = S.player.carry.length;
        var res = deliver();
        S.truck.load = (S.truck.load || 0) + n0;
        var msg = res.done ? T('delivered') + ' +' + fmt(res.gained)
                : res.gained > 0 ? '+' + fmt(res.gained)
                : (L.get() === 'ja' ? n0 + '台 積込' : n0 + ' loaded');
        var dk = W.DOCK, from = { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE };
        for (var li = 0; li < n0; li++)
          S.items.push({ x0: from.x, y0: from.y, x1: dk.bayX, y1: dk.bayY - 6,
                         t: -li * 0.12, dur: 0.42, color: '#f2a63b' });
        toast(cpos, msg, '#2fbf7a');
        burst(cpos, '#2fbf7a', 16); QT.Sfx.play('cash');
        break;
      }
      case 'dcdrop': {
        var free = S.dcCapacity() - S.dc.length, moved = 0, sw1;
        while (S.player.carry.length > 0 && free > 0) { S.dc.push(S.player.carry.pop()); free--; moved++; }
        while (S.player.carry.length > 0 && (sw1 = dcSwap())) {
          S.player.carry.splice(S.player.carry.indexOf(sw1.m), 1);
          S.dc[sw1.i] = sw1.m;
          earn(Math.round(sw1.old.price * 0.3), 'hw');
          moved++;
        }
        if (moved) { toast(cpos, '+' + moved, '#6f57e0'); burst(cpos, '#6f57e0', 12); QT.Sfx.play('buy'); }
        break;
      }
      case 'collectDc':
        var gdc = earn(S.pendDc, 'cloud'); S.dcCollected += gdc;
        toast(cpos, '+¥' + fmt(gdc), '#2bb8d8', { big: true }); S.pendDc = 0; QT.Sfx.play('cash');
        break;
      case 'collectSvc':
        var gsv = earn(S.pendSvc, 'svc'); S.svcCollected += gsv;
        toast(cpos, '+¥' + fmt(gsv), '#ef7d2e', { big: true }); S.pendSvc = 0; QT.Sfx.play('cash');
        break;
      case 'fix':
        spend(info.cost, 'other');
        S.contracts.forEach(function (c) { c.broken = false; });
        toast(cpos, T('fixDefects'), '#2fbf7a'); burst(cpos, '#2fbf7a', 14); QT.Sfx.play('buy');
        break;
      case 'promo':
        spend(info.cost, 'other'); S.pop += 10 * st.level;
        toast(cpos, T('buzzUp', { n: Math.round(10 * st.level) }), '#e2508a');
        burst(cpos, '#e2508a', 18); QT.Sfx.play('good');
        break;
      case 'seminar':
        spend(info.cost, 'other'); S.users += 60 * st.level; S.pop += 4 * st.level;
        toast(cpos, T('seminarRun'), '#2fbf7a'); burst(cpos, '#2fbf7a', 18); QT.Sfx.play('good');
        break;
      case 'vc': {
        var amt = vcAmount();
        raise(amt);
        S.equity *= vcKeep(); S.rounds++; S.vcAt = S.t;
        toast(cpos, '+' + fmt(amt) + '  ' + Math.round(S.equity * 100) + '%', '#6f57e0');
        burst(cpos, '#6f57e0', 24); QT.Sfx.play('fanfare');
        break;
      }
      case 'gacha':
        pullGacha();
        QT.Sfx.play('drum');
        break;
      case 'ipo':
        if (S.ipo) {
          S.ipo.at = S.t - 9.6; S.won = true;
          QT.Sfx.play('good');
          break;
        }
        S.ipo = ipoResult();
        S.won = true; QT.Sfx.play('fanfare');
        if (QT.track) QT.track('ipo', { min: Math.round(S.ipo.time / 60), rank: S.ipo.rank, month: S.ipo.month,
                                        equity: Math.round(S.ipo.equity * 100) });
        saveBest(S.ipo);
        break;
    }
  }
  function burst(pos, color, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = 18 + Math.random() * 46;
      S.fx.push({ x: pos.x, y: pos.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20,
                  life: 0.5 + Math.random() * 0.4, t: 0, c: color });
    }
  }
  function toast(pos, txt, color, opt) {
    opt = opt || {};
    S.toasts.push({ x: pos.x, y: pos.y, text: txt, c: color, t: 0, life: opt.crit ? 2.0 : 1.6,
                    big: !!opt.big, crit: !!opt.crit, rot: (Math.random() - 0.5) * 0.18 });
    if (/^\+/.test(txt) && /[0-9]/.test(txt)) (S.coinFx || (S.coinFx = [])).push({ x: pos.x, y: pos.y, n: opt.crit ? 14 : opt.big ? 9 : 5 });
  }
  function banner(text, sub, color, kind) {
    var q = S.banners || (S.banners = []);
    if (q.length > 3) q.splice(1, q.length - 3);
    q.push({ text: text, sub: sub || '', c: color || '#f5b21c', kind: kind || '', at: null });
  }
  S.banner = banner;
  var COMBO_GAP = 3.0;
  function comboHit() {
    S.combo = (S.t - (S.comboAt || -99) < COMBO_GAP) ? (S.combo || 0) + 1 : 1;
    S.comboAt = S.t;
    return S.combo;
  }
  function comboMul() { return 1 + Math.min(0.5, 0.05 * Math.max(0, (S.combo || 1) - 1)); }
  function critRoll() { return Math.random() < 0.08; }
  function updateFx(dt) {
    for (var i = S.fx.length - 1; i >= 0; i--) {
      var f = S.fx[i];
      f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 150 * dt;
      if (f.t > f.life) S.fx.splice(i, 1);
    }
    for (var j = S.toasts.length - 1; j >= 0; j--) {
      var t = S.toasts[j];
      t.t += dt; t.y -= 16 * dt;
      if (t.t > t.life) S.toasts.splice(j, 1);
    }
  }
  function fmt(n) {
    n = Math.floor(n);
    var s = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (L.get() === 'en') {
      if (n >= 1e9) return s + (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return s + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
      if (n >= 1e4) return s + Math.round(n / 1e3) + 'k';
      return s + String(n);
    }
    if (n >= 1e8) return s + (n / 1e8).toFixed(n >= 1e10 ? 0 : 2) + '億';
    if (n >= 1e4) return s + (n / 1e4).toFixed(n >= 1e6 ? 0 : 1) + '万';
    return s + String(n);
  }
  var heldPad = null, holdT = 0, spentPad = null;
  function update(dt, dir) {
    S.t += dt;
    updatePlayer(dt, dir);
    updateFinance(dt);
    updateStore(dt);
    updateCafe(dt);
    updateDeliv(dt);
    updateAngel(dt);
    updateEvents(dt);
    updateMission(dt);
    updateAR(dt);
    updateTruck(dt);
    updateJobs(dt);
    updateAuto(dt);
    updateStages(dt);
    updateFeeders(dt);
    updateHelium(dt);
    updateAssembly(dt);
    updateContracts(dt);
    updateCloud(dt);
    updatePopularity(dt);
    updateFx(dt);
    for (var i = S.items.length - 1; i >= 0; i--) {
      var it = S.items[i];
      it.t += dt;
      if (it.t >= it.dur) { if (it.cb) it.cb(); S.items.splice(i, 1); }
    }
    var pad = padAt(S.player);
    if (pad !== spentPad) spentPad = null;
    if (pad && pad === spentPad) pad = null;
    if (pad !== heldPad) { heldPad = pad; holdT = 0; }
    if (pad) {
      var info = padInfo(pad);
      if (info && info.can) {
        holdT += dt;
        if (holdT >= (info.hold || 0)) { var rep = (pad.type === 'reg' || pad.type === 'stock' ||
            pad.type === 'brew' || pad.type === 'cserve' ||
            pad.type === 'dev' || pad.type === 'rd' ||
            pad.type === 'swjob' || pad.type === 'hwasm' || pad.type === 'supply' ||
            pad.type === 'borrow' || pad.type === 'repay');
          doPad(pad); holdT = 0; if (!rep) { heldPad = null; spentPad = pad; } }
      } else holdT = 0;
    }
    S.heldPad = heldPad; S.holdT = holdT;
    QT.Sfx.ambient(ambientVolume());
    while (S.obj < OBJECTIVES.length - 1 && OBJECTIVES[S.obj].ok()) {
      var cleared = OBJECTIVES[S.obj];
      S.obj++; QT.Sfx.play('good');
      banner('MISSION CLEAR!!', L.get() === 'ja' ? cleared.ja : cleared.en, '#2fbf7a', 'mission');
    }
    if (!S.ipo && S.canIPO()) {
      if (!S.ipoReady) {
        S.ipoReady = true;
        toast({ x: S.player.x, y: S.player.y - 20 }, T('ipoReadyToast'), '#e8a800');
        burst({ x: S.player.x, y: S.player.y }, '#e8a800', 24);
        QT.Sfx.play('fanfare');
      }
    } else S.ipoReady = false;
    if (S.ipo) {
      var tv = S.value() / IPO_SHARES;
      if (S.ipo.base == null) S.ipo.base = tv;
      S.ipo.base += (tv - S.ipo.base) * (1 - Math.exp(-dt / CFG.priceEase));
    }
    if (S.ipo && !S.prime && S.marketCap() >= CFG.primeTarget) {
      S.prime = true;
      if (QT.track) QT.track('prime', { min: Math.round(S.t / 60) });
      banner('PRIME!!', T('primeDone') + '  ' + T('ipoCap') + ' ¥' + fmt(S.marketCap()), '#e8a800', 'area');
      burst({ x: S.player.x, y: S.player.y }, '#e8a800', 40);
      QT.Sfx.play('ipo');
    }
    if (S.t - S.lastSave > 5) { S.lastSave = S.t; save(); }
  }
  var COLD = ['asm', 'fridge', 'helium', 'qcloud'];
  function ambientVolume() {
    var pl = S.player, best = 0;
    COLD.forEach(function (id) {
      var st = S.p[id];
      if (!st || !st.owned || !room(W.BY_ID[id].room)) return;
      if (id === 'qcloud' && S.dc.length === 0) return;
      var p = W.BY_ID[id];
      var px = p.x * TILE, py = p.y * TILE;
      var dx = Math.max(px - pl.x, 0, pl.x - (px + p.w * TILE));
      var dy = Math.max(py - pl.y, 0, pl.y - (py + p.h * TILE));
      var v = 1 - Math.hypot(dx, dy) / 120;
      if (id === 'qcloud') v *= Math.min(1, 0.4 + S.dc.length * 0.15);
      if (v > best) best = v;
    });
    return Math.max(0, Math.min(0.8, best * 0.8));
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 15, corps: S.corps, mission: S.mission, missionAt: S.missionAt, coins: S.coins, pop: S.pop, users: S.users, he: S.he,
        cafe: S.cafe, store: S.store, deliv: S.deliv, delivDone: S.delivDone, delivLost: S.delivLost,
        loans: S.loans,
        bestQubits: S.bestQubits, shipped: S.shipped, svcCollected: S.svcCollected,
        dcCollected: S.dcCollected, obj: S.obj, rd: S.rd, swStock: S.swStock, parts: S.parts,
        pendSales: S.pendSales, ar: S.ar, swDev: S.swDev, pendSvc: S.pendSvc, pendDc: S.pendDc,
        contracts: S.contracts, dc: S.dc, seenWin: S.seenWin, muted: S.muted, ipo: S.ipo || null, glut: S.glut || 0, ev: S.ev, evT: S.evT, prime: !!S.prime, tut: S.tut, collectedOnce: !!S.collectedOnce,
        gachaAt: S.gachaAt, gachaN: S.gachaN || 0, gachaDry: S.gachaDry || 0, genius: S.genius || 0, feverUntil: S.feverUntil || 0,
        co: S.co, equity: S.equity, rounds: S.rounds, vcAt: S.vcAt, fin: S.fin,
        jobs: S.jobs, jobsDone: S.jobsDone, jobsFailed: S.jobsFailed,
        rooms: S.rooms, savedAt: Date.now(), t: S.t,
        px: S.player.x, py: S.player.y,
        carry: S.player.carry, outs: S.outputs.map(function (o) { return o.m; }),
        asmBuf: S.p.asm.cur ? [S.p.asm.cur].concat(S.p.asm.buf) : S.p.asm.buf,
        p: Object.keys(S.p).map(function (k) { return [k, S.p[k].level, S.p[k].owned ? 1 : 0]; })
      }));
    } catch (e) { }
  }
  function load() {
    var raw, d;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try { d = JSON.parse(raw); } catch (e) { return null; }
    if (!d || d.v !== 15) return null;
    reset();
    S.coins = d.coins || 0; S.pop = d.pop || 0; S.users = d.users || 0;
    S.he = d.he != null ? d.he : 6; S.bestQubits = d.bestQubits || 0;
    S.shipped = d.shipped || 0; S.svcCollected = d.svcCollected || 0;
    S.dcCollected = d.dcCollected || 0; S.obj = d.obj || 0; S.rd = d.rd || 0;
    S.swStock = d.swStock || 0; S.parts = d.parts || 0; S.pendSales = d.pendSales || 0; S.ar = d.ar || [];
    S.swDev = d.swDev || 0;
    S.pendSvc = d.pendSvc || 0; S.pendDc = d.pendDc || 0;
    S.contracts = d.contracts || []; S.dc = d.dc || [];
    S.seenWin = !!d.seenWin; S.muted = !!d.muted; S.ipo = d.ipo || null; S.glut = d.glut || 0;
    S.ev = d.ev || null; S.evT = d.evT != null ? d.evT : 120; S.prime = !!d.prime;
    S.tut = d.tut != null ? d.tut : 2;
    S.collectedOnce = d.collectedOnce != null ? !!d.collectedOnce : (S.fin.totRev > 0 && (d.obj || 0) > 8);
    S.gachaAt = d.gachaAt != null ? d.gachaAt : -999; S.gachaN = d.gachaN || 0; S.gachaDry = d.gachaDry || 0;
    S.genius = d.genius || 0; S.feverUntil = d.feverUntil || 0;
    if (d.store) S.store = d.store;
    if (d.cafe) S.cafe = d.cafe;
    if (typeof S.cafe.rep !== 'number' || !isFinite(S.cafe.rep)) S.cafe.rep = 1;
    S.deliv = d.deliv || null;
    S.delivDone = d.delivDone || 0; S.delivLost = d.delivLost || 0;
    Object.keys(CFG.loans).forEach(function (id) { S.loans[id] = (d.loans && d.loans[id]) || 0; });
    if (d.co) S.co = d.co;
    S.equity = d.equity != null ? d.equity : 1; S.rounds = d.rounds || 0;
    S.corps = d.corps || {};
    S.mission = d.mission || null; S.missionAt = d.missionAt != null ? d.missionAt : -9999;
    W.CORPS.forEach(function (id) {
      var c = S.corps[id] || (S.corps[id] = {});
      c.rel = c.rel || 0; c.jobs = c.jobs || 0;
      c.visitAt = c.visitAt != null ? c.visitAt : -9999;
      c.fundAt = c.fundAt != null ? c.fundAt : -9999;
    });
    S.vcAt = d.vcAt != null ? d.vcAt : -9999;
    if (d.fin) S.fin = d.fin;
    S.jobs = d.jobs || [];
    S.jobsDone = d.jobsDone || 0; S.jobsFailed = d.jobsFailed || 0;
    S.jobs.forEach(function (j) { if (j.kind === 'hw' && j.qubits > QMAX) j.qubits = QMAX; });
    S.t = d.t || 0;
    if (d.px != null) { S.player.x = d.px; S.player.y = d.py; }
    (d.p || []).forEach(function (e) {
      if (!S.p[e[0]]) return;
      S.p[e[0]].level = e[1]; S.p[e[0]].owned = !!e[2];
    });
    S.player.carry = (d.carry || []).slice(0, carryMax());
    S.outputs = (d.outs || []).slice(0, CFG.outCap).map(function (m, i) {
      var s = W.OUT_SLOTS[i]; return { m: m, x: s.x, y: s.y };
    });
    S.p.asm.buf = (d.asmBuf || []).slice(0, CFG.bufCap);
    if (d.rooms) W.ROOMS.forEach(function (r) { S.rooms[r.id] = r.open0 ? true : !!d.rooms[r.id]; });
    var away = Math.min(CFG.offlineCap, Math.max(0, (Date.now() - (d.savedAt || Date.now())) / 1000));
    S.jobs.forEach(function (j) { j.due += away; });
    S.ar.forEach(function (v) { v.due += away; });
    if (S.deliv) S.deliv.due += away;
    rebuildGrid();
    if (!walkable(S.player.x, S.player.y)) { S.player.x = W.START.x; S.player.y = W.START.y; }
    if (away > 60) {
      var mr = 0;
      S.contracts.forEach(function (c) { if (!c.broken) mr += c.maint * svcMul(); });
      var cr = S.users * userTarget().arpu;
      var amt = (mr + cr) * away * 0.5;
      S.pendSvc += mr * away * 0.5;
      S.pendDc += cr * away * 0.5;
      if (amt >= 1) S.offline = { sec: away, amount: amt };
    }
    return S;
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
  QT.G = {
    truckHere: truckHere, S: S, CFG: CFG, OBJECTIVES: OBJECTIVES, SAVE_KEY: SAVE_KEY,
    PADS: function () { return S.angel ? PADS.concat([ANGEL_PAD]) : PADS; },
    reset: reset, update: update, save: save, load: load, hasSave: hasSave, clearSave: clearSave,
    costOf: costOf, padInfo: padInfo, padAt: padAt, fmt: fmt, objText: objText,
    carryMax: carryMax, userTarget: userTarget, fixFee: fixFee, gradeName: gradeName,
    shipMul: shipMul, svcMul: svcMul, playerSpeed: playerSpeed, ipoChecks: ipoChecks,
    arTotal: arTotal, roomOpen: room, padActive: padActive, rebuildGrid: rebuildGrid, walkable: walkable,
    loanMax: loanMax, loanBal: loanBal, debtTotal: debtTotal,
    rdCap: rdCap, rdStaff: rdStaff, rdMul: rdMul, hwasmQ: hwasmQ, specPlan: specPlan, specGain: specGain,
    swAutoRate: swAutoRate, shipAutoRate: shipAutoRate, EVENTS: EVENTS, goTo: goTo,
    cashWarn: cashWarn, fixedMonthly: fixedMonthly, shareText: shareText, gachaCost: gachaCost, pullGacha: pullGacha,
    loadBest: loadBest, ipoResult: ipoResult, truckWait: truckWait
  };
})(window.QT || (window.QT = {}));
