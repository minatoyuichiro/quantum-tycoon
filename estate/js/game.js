(function (QT) {
  'use strict';
  var W = QT.World, TILE = W.TILE, L = QT.L;
  var SAVE_KEY = 're_save_v1';
  var SAVE_VER = 1;
  var MAP_REV = 23;
  var MAP22 = {
    colX: [3, 32, 64], colW: [26, 29, 26], rowY: [3, 35, 64], rowH: [29, 26, 26], world: 93,
    cell: { '0,0': 'otemachi', '1,0': 'hongo', '2,0': 'inzai', '0,1': 'fab', '1,1': 'shibuya', '2,1': 'ariake',
            '0,2': 'shinjuku', '1,2': 'futako', '2,2': 'minato' }
  };
  var OLD_KEY = 're_save_old';
  var CFG = {
    startCoins: 20000,
    jobs: {
      reg:    { pay: 30000, time: 0.8 },
      stock:  { pay: 18000, time: 1.4 },
      brew:   { pay: 14000, time: 1.5 }
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
    maintRate: 0.0007,
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
    custMax: 4,
    custRate: 5.8,
    stockDecay: 2.5,
    coffeeShare: 0.4,
    coffeePay: 12000,
    cupsMax: 8,
    cupsPerBrew: 4,
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
  function nm(o, f) { return L.nm(o, f); }
  L.add({
    hintLounge: ['開発・試作 +10%', 'Dev/R&D +10%'],
    hintSphere: ['クラウド客 +15%・人気↑', 'Users +15%, buzz↑'],
    hintPop:    ['人気↑ → 企業価値↑', 'Buzz↑ → value↑'],
    hintDomain: ['クラウド客枠 +{n}', 'Cloud slots +{n}'],
    gameSaveOld:    ['新しい版です', 'NEW VERSION'],
    gameSaveOldSub: ['地図が変わったので最初から', 'The map changed, so this is a fresh start']
  });
  var S = {
    t: 0, coins: CFG.startCoins, pop: 0, users: 0, he: 6,
    bestQubits: 0, shipped: 0, svcCollected: 0, dcCollected: 0, obj: 0, objId: null, rd: 0,
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
    cafe: { cups: 0, lost: 0, served: 0, rep: 1 },
    deliv: null, delivDone: 0, delivLost: 0,
    loans: { home: 0, kin: 0, bankp: 0 },
    player: { x: 0, y: 0, dir: 0, walk: 0, carry: [] },
    p: {}, dist: {}, items: [], outputs: [], contracts: [], dc: [],
    pendSvc: 0, pendDc: 0, fx: [], toasts: []
  };
  S.rooms = S.dist;
  var G = QT.G = { S: S, CFG: CFG, SAVE_KEY: SAVE_KEY, SAVE_VER: SAVE_VER, T: T, nm: nm };
  function evOn(id) { return G.evOn(id); }
  function invest(v) { return G.invest(v); }
  function rdLevel() { return G.rdLevel(); }
  var PADDEF = {};
  function pad(type, def) {
    def = def || {};
    def.type = type;
    PADDEF[type] = def;
    return def;
  }
  function padDef(type) { return PADDEF[type] || null; }
  var MODS = [], MOD_BY = {}, modSorted = null;
  function mod(m) {
    if (!m || !m.id) return null;
    if (MOD_BY[m.id]) MODS.splice(MODS.indexOf(MOD_BY[m.id]), 1);
    m.seq = MODS.length;
    MODS.push(m); MOD_BY[m.id] = m;
    modSorted = null;
    return m;
  }
  function modsInOrder() {
    if (modSorted) return modSorted;
    var list = MODS.slice().sort(function (a, b) {
      var oa = a.order != null ? a.order : 500, ob = b.order != null ? b.order : 500;
      return oa - ob || a.seq - b.seq;
    });
    var out = [], done = {}, guard = 0;
    while (list.length && guard++ < 10000) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i], ok = true;
        (m.after || []).forEach(function (id) { if (MOD_BY[id] && !done[id]) ok = false; });
        if (ok || i === list.length - 1) {
          out.push(m); done[m.id] = true; list.splice(i, 1); break;
        }
      }
    }
    modSorted = out;
    return out;
  }
  var ALERT_HOOKS = [];
  function alertHook(fn) { ALERT_HOOKS.push(fn); }
  var HANDLERS = {};
  function on(name, fn) { (HANDLERS[name] || (HANDLERS[name] = [])).push(fn); }
  function emit(name, data) {
    var hs = HANDLERS[name];
    if (!hs) return;
    for (var i = 0; i < hs.length; i++) hs[i](data, S);
  }
  var V1_ROOM = { biz: 'otemachi', town: 'futako', sw: 'shibuya', plant: 'fab', service: 'fab',
                  outsrc: 'hongo', cryo: (W.BY_ID.helium && W.BY_ID.helium.room) || 'fab', hq: 'ariake' };
  var V1_BIZ = { plant: 'lease', service: 'lease', outsrc: 'supplier', cryo: 'heSupplier', hq: 'plot' };
  function room(id) {
    var v = S.dist[id];
    if (v !== undefined) return !!v;
    var bk = W.BLOCKS && W.BLOCKS[id];
    if (bk) return !!S.dist[bk.district] && blockOpen(id);
    var a = V1_ROOM[id];
    if (!a) return false;
    var how = V1_BIZ[id];
    if (how === 'supplier' || how === 'heSupplier') {
      var cs = supContracts();
      if (cs) return how === 'supplier' ? cs.length > 0 : cs.some(function (sid) { return supParts(sid).indexOf('he') >= 0; });
      if (!S.dist[a]) return false;
      return how === 'supplier' ? boughtIn(a) : !!(S.p.helium && S.p.helium.owned);
    }
    if (!S.dist[a]) return false;
    if (how === 'lease') return leased(a) || boughtIn(a);
    if (how === 'plot') return boughtIn(a);
    return true;
  }
  function supContracts() {
    var c = S.supply && S.supply.contracts;
    if (!c || typeof c !== 'object') return null;
    if (Array.isArray(c)) return c.map(function (x) { return typeof x === 'string' ? x : x && x.id; }).filter(Boolean);
    return Object.keys(c).filter(function (k) { var v = c[k]; return (+(v && typeof v === 'object' ? v.tier : v) || 0) > 0; });
  }
  function supParts(id) {
    var d = QT.Data && QT.Data.suppliers, s = null;
    if (Array.isArray(d)) { for (var i = 0; i < d.length; i++) if (d[i] && d[i].id === id) s = d[i]; }
    else if (d) s = d[id] || null;
    var p = s && (s.parts || s.part);
    return Array.isArray(p) ? p : p ? [p] : [];
  }
  function boughtIn(distId) {
    var ids = (W.DIST[distId] && W.DIST[distId].plots) || [];
    for (var i = 0; i < ids.length; i++) {
      var st = S.p[ids[i]], df = W.DEFS[ids[i]];
      if (st && st.owned && !df.owned && df.kind !== 'upgrade' && !isDeco(df)) return true;
    }
    return false;
  }
  function roomDef(id) {
    var r = null, a = V1_ROOM[id];
    W.ROOMS.forEach(function (x) { if (x.id === id) r = x; });
    if (!r && a) W.ROOMS.forEach(function (x) { if (x.id === a) r = x; });
    return r;
  }
  function roomName(plotId) {
    var p = W.BY_ID[plotId], r = p ? roomDef(p.room) : null;
    return r ? nm(r) : '';
  }
  function officeOn() { return !!(S.p.office && S.p.office.owned); }
  S.officeOn = officeOn;
  S.levelsTotal = function () {
    var lv = 0;
    W.PLOTS.forEach(function (p) { if (!isDeco(p)) lv += S.p[p.id].level; });
    return lv;
  };
  function costOf(p) {
    var lv = S.p[p.id].level;
    if (p.id === 'staff' && p.maxLevel) lv = Math.min(lv, p.maxLevel - 1);
    var c = (p.cost || 500000) * Math.pow(1.85, lv);
    if (p.id === 'staff' && evOn('talent')) c *= 0.5;
    if (p.id === 'staff') { var of = QT.Sim && QT.Sim.offices; if (of && of.effect) c *= of.effect('hireFee') || 1; }
    return Math.round(c);
  }
  function staffMax() {
    var base = (W.BY_ID.staff && W.BY_ID.staff.maxLevel) || 8, o = QT.Sim && QT.Sim.offices;
    return base + (o && typeof o.seats === 'function' ? o.seats() : 0);
  }
  function devStaff() {
    var base = (W.BY_ID.staff && W.BY_ID.staff.maxLevel) || 8, o = QT.Sim && QT.Sim.offices;
    return Math.min(staffCount(), base + (o && typeof o.seats === 'function' ? o.seats('general') : 0));
  }
  function canUpgrade(p) { return S.p[p.id].level < (p.id === 'staff' ? staffMax() : p.maxLevel); }
  function salesLv() { return S.p.desk.owned ? S.p.desk.level - 1 : 0; }
  function upLv(id) { var p = S.p[id]; return p ? p.level || 0 : 0; }
  function playerSpeed() { return 88 + 15 * upLv('up_speed'); }
  function carryMax() { return 2 + upLv('up_carry'); }
  function loungeMul() { var l = S.p.lounge; return l && l.owned && room('hq') ? 1 + 0.10 * l.level : 1; }
  function sphereMul() { var sp = S.p.sphere; return sp && sp.owned && room('hq') ? 1 + 0.15 * sp.level : 1; }
  function staffCount() { return S.p.staff && S.p.staff.owned ? S.p.staff.level : 0; }
  function pcLv() { return S.p.pc && S.p.pc.owned ? S.p.pc.level : 1; }
  function objList() { return (QT.Data && QT.Data.objectives) || []; }
  function objIndex(id) {
    var list = objList();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }
  var objSeen = 0;
  function syncObj() {
    var list = objList();
    if (!list.length) return 0;
    if (S.obj !== objSeen && list[S.obj]) S.objId = list[S.obj].id;
    var i = objIndex(S.objId);
    if (i < 0) { i = Math.max(0, Math.min(list.length - 1, S.obj | 0)); S.objId = list[i].id; }
    S.obj = objSeen = i;
    return i;
  }
  function objective() { var i = syncObj(); return objList()[i] || null; }
  function objText() {
    if (S.ipo || S.seenWin) {
      var mk = QT.Sim && QT.Sim.market, mt = S.ipo && mk && mk.objText ? mk.objText() : null;
      if (mt) return mt;
      var fw = QT.Sim && QT.Sim.ftworld, ft = S.ipo && fw && fw.objText ? fw.objText() : null;
      if (ft) return ft;
      return S.prime ? T('postPrime') : T('postIpo', { v: fmt(S.marketCap()), t: fmt(CFG.primeTarget) });
    }
    var o = objective();
    if (!o) return '';
    var txt0 = L.get() === 'ja' ? o.ja : o.en;
    if (o.text) { var s = o.text(S, G, txt0); if (s != null) return s; }
    return txt0;
  }
  function optPassed(list, i) {
    if (!list[i].opt) return false;
    if (list[i].off) { try { if (list[i].off(S, G)) return true; } catch (e) { return true; } }
    for (var j = i + 1; j < list.length - 1; j++) if (!list[j].opt) return !!list[j].ok(S, G);
    return false;
  }
  function advanceObjectives() {
    var list = objList();
    syncObj();
    while (S.obj < list.length - 1 && (list[S.obj].ok(S, G) || optPassed(list, S.obj))) {
      var cleared = list[S.obj], done = cleared.ok(S, G);
      S.obj++; S.objId = list[S.obj].id; objSeen = S.obj;
      if (!done) continue;
      QT.Sfx.play('good');
      banner('MISSION CLEAR!!', L.get() === 'ja' ? cleared.ja : cleared.en, '#2fbf7a', 'mission');
      emit('objective', cleared);
    }
  }
  var KIND_PADS = {
    notary:   [['notary', 0]],
    registry: [['registry', 0]],
    bank:     [['bank', -2], ['borrow', 0], ['repay', 2]],
    house:    [],
    swjob:    [['swjob', -1], ['buy', 1]],
    dc: [], dc_ops: [], substation: [], cooling: [],
    deco: [],
    staff:    [['buy', 0]], devdesk: [['buy', 0]],
    desk:     [['accept', -2], ['mission', 0], ['buy', 2]],
    acct:     [['collectSales', -1], ['buy', 1]],
    corp: function (p) {
      return [{ type: 'sales', x: p.x, y: p.padY },
              { type: 'drop', x: p.padX, y: p.padY },
              { type: p.news ? 'press2' : 'cvc', x: p.x + p.w - 1, y: p.padY }];
    },
    exchange: function (p) {
      var at = W.spot && W.spot(p.id, 'ipo');
      return [{ type: 'ipo', x: at ? at.x : p.padX, y: at ? at.y : p.padY }];
    },
    gacha:    [['gacha', 0]],
    vc: function (p) {
      var vs = (QT.Data && QT.Data.vcs) || [];
      if (!vs.length) return [{ type: 'vc', x: p.padX, y: p.padY }];
      var mine = vs.filter(function (v) { return (v.plots || []).indexOf(p.id) >= 0; });
      if (mine.length === 1) return [{ type: 'vc', vc: mine[0].id, x: p.padX, y: p.padY }];
      var out = [];
      vs.forEach(function (v, i) {
        var at = W.spot && W.spot(p.id, 'vc_' + v.id);
        if (!at && p.spots) return;
        out.push({ type: 'vc', vc: v.id, x: at ? at.x : p.x + 2 * i, y: at ? at.y : p.padY });
      });
      return out;
    },
    leisure:  [], rlab: [], station: [],
    ship:     [['ship', -1], ['buy', 1]],
    service:  [['collectSvc', -2], ['fix', 2], ['buy', 0]],
    media:    [['buy', -1], ['promo', 1]],
    seminar:  [['buy', -1], ['seminar', 1]]
  };
  function isDeco(p) { return !!p && (p.kind === 'deco' || p.deco === true); }
  var PADS = [];
  function buildPads() {
    PADS = [];
    W.PLOTS.forEach(function (p) {
      var mid = p.padX, y = p.padY;
      if (isDeco(p)) {
      } else if (p.padsLocal) {
        p.padsLocal.forEach(function (q) {
          PADS.push({ p: p, type: q.type, x: p.x + q.x, y: p.y + q.y });
        });
        if (p.cost && p.id !== 'pc') PADS.push({ p: p, type: 'buy', x: mid, y: y });
      } else {
        var k = KIND_PADS[p.kind] || [['buy', 0]];
        if (typeof k === 'function') k(p).forEach(function (e) { e.p = p; PADS.push(e); });
        else k.forEach(function (e) { PADS.push({ p: p, type: e[0], x: mid + e[1], y: y }); });
      }
      Object.keys(PADDEF).forEach(function (type) {
        var d = PADDEF[type];
        if (!d.build) return;
        (d.build(p) || []).forEach(function (e) { PADS.push({ p: p, type: type, x: e.x, y: e.y }); });
      });
    });
    W.ROOMS.forEach(function (r) {
      if (r.gatePad) PADS.push({ p: null, district: r, room: r, type: 'open', x: r.gatePad.x, y: r.gatePad.y });
      else if (r.expandPad) PADS.push({ p: null, room: r, type: 'expand', x: r.expandPad.x, y: r.expandPad.y });
      if (r.lease) PADS.push({ p: null, district: r, room: r, type: 'site', x: r.lease.x, y: r.lease.y });
    });
    Object.keys(PADDEF).forEach(function (type) {
      var d = PADDEF[type];
      if (!d.place) return;
      (d.place() || []).forEach(function (e) {
        e.type = type;
        if (e.p === undefined) e.p = null;
        PADS.push(e);
      });
    });
  }
  var OFFICE_ONLY = { swjob: 1, acct: 1, pc: 1, desk: 1, staff: 1 };
  function padActive(pad) {
    if (pad.p && !blockOpen(blockOf(pad.p))) return false;
    if (pad.p && OFFICE_ONLY[pad.p.id] && !officeOn()) return false;
    if (pad.p && pad.p.id === 'office' && !S.co.bank) return false;
    var d = PADDEF[pad.type];
    if (d && d.active) return !!d.active(pad, S);
    return !!pad.p && room(pad.p.room);
  }
  function padInfo(pad) {
    var d = PADDEF[pad.type];
    return d && d.info ? d.info(pad, S) : null;
  }
  function doPad(pad) {
    var info = padInfo(pad);
    if (S.tut < 2) S.tut = 2;
    var d = PADDEF[pad.type];
    if (d && d.act) d.act(pad, S, info);
  }
  function padPos(pad) { return { x: (pad.x + 0.5) * TILE, y: (pad.y + 0.5) * TILE }; }
  var AUTO_HINT = { swjob: 'autoSwHint', ship: 'autoShipHint' };
  var AUTO_HINT3 = { desk: 'autoDeskHint' };
  function buyHint(p) {
    if (p.kind === 'software' && W.DOMAINS[p.domain]) return T('hintDomain', { n: W.DOMAINS[p.domain].cap });
    if (p.id === 'lounge') return T('hintLounge');
    if (p.id === 'sphere') return T('hintSphere');
    if (p.pop) return T('hintPop');
    return '';
  }
  pad('buy', {
    info: function (pad) {
      var r = buyInfo(pad);
      var st = S.p[pad.p.id];
      if (r && needLease(pad.p) && !(st.owned && !canUpgrade(pad.p))) {
        var ls = W.DIST[pad.p.room].lease;
        r.cost += ls.deposit;
        r.can = S.coins >= r.cost;
        r.sub = T('gameLeaseWith', { n: nm(ls), d: fmt(ls.deposit), r: fmt(ls.rent + ls.util) }) + '  ' + r.sub;
        r.lease = true;
      }
      return r;
    },
    act: function (pad, S, info) {
      var p = pad.p, st = S.p[p.id], cpos = W.center(p);
      var cost = info.cost;
      if (info.lease && needLease(p)) cost -= signLease(p.room);
      invest(cost);
      var spent = '  -' + fmt(info.cost);
      if (!st.owned) {
        st.owned = true; st.level = 1; toast(cpos, nm(p) + spent, '#e8a800'); rebuildGrid();
        banner('NEW!!', nm(p), '#2bb8d8', 'new');
      } else {
        st.level++; toast(cpos, nm(p) + ' Lv.' + st.level + spent, '#e8a800');
        banner('LEVEL UP!!', nm(p) + '  Lv.' + st.level, '#f5b21c', 'level');
      }
      burst(cpos, '#e8a800', 26); QT.Sfx.play('levelup');
      emit('purchase', { plot: p, level: st.level });
    }
  });
  function buyInfo(pad) {
    var p = pad.p, st = S.p[p.id];
    if (p.kind === 'office')
      return { label: nm(p), sub: st.owned ? T('officeRented')
                 : T('officeSub', { r: fmt(p.rent), u: fmt(p.util) }),
               cost: st.owned ? 0 : costOf(p),
               can: !st.owned && S.co.bank && S.coins >= costOf(p), hold: 0.8 };
    var h = buyHint(p);
    var sg = room('plant') && G.specGain ? G.specGain(p) : 0;
    if (sg > 0 && canUpgrade(p)) h = (h ? h + '  ' : '') + T('specGain', { n: sg.toFixed(sg < 1 ? 2 : 1) });
    if (p.id === 'asm' && st.owned && room('plant') && G.specPlan) {
      var sp0 = G.specPlan();
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
  }
  L.add({
    gameOpenLabel:  ['{n} 開通', 'Open {n}'],
    gameOpenReady:  ['開通できます!', 'Ready to open!'],
    gameOpenFirst:  ['最初から開いている', 'Open from the start'],
    gameLeaseLabel: ['{n}（リース）', '{n} (lease)'],
    gameLeaseSub:   ['敷金 ¥{d}・家賃と光熱 ¥{r}/月', 'Deposit ¥{d}, rent+utilities ¥{r}/mo'],
    gameLeaseWith:  ['{n}も借りる（敷金¥{d}・月¥{r}）', '+{n} lease (deposit ¥{d}, ¥{r}/mo)'],
    gameLeaseDone:  ['{n}を借りた', '{n} leased']
  });
  function distReady(d) {
    if (typeof d === 'string') d = W.DIST[d] || null;
    if (!d) return false;
    if (d.open0) return true;
    try { return !!(d.req && d.req(S, G)); } catch (e) { return false; }
  }
  function openInfo(d) {
    var ready = !room(d.id) && distReady(d);
    var cond = d.open0 ? T('gameOpenFirst') : nm(d, 'reqText');
    return {
      label: T('gameOpenLabel', { n: nm(d) }),
      sub: ready ? T('gameOpenReady') + '  ' + nm(d, 'sub') : cond,
      cond: cond, cost: 0, can: ready, ready: ready, gold: ready, hold: 1.0
    };
  }
  function openAct(d) {
    if (room(d.id)) return;
    S.dist[d.id] = true;
    S.distAt[d.id] = S.t;
    rebuildGrid();
    if (QT.track) QT.track('room', { id: d.id, min: Math.round(S.t / 60) });
    var c = distMidPx(d);
    burst(c, '#e8a800', 40);
    banner('NEW AREA!!', nm(d), '#e2508a', 'area');
    if (QT.Render) QT.Render.shake(9, 0.5);
    QT.Sfx.play('fanfare');
    emit('districtOpened', d);
  }
  function distMidPx(d) {
    var c = d.center;
    if (c) return { x: (c.x + 0.5) * TILE, y: (c.y + 0.5) * TILE };
    return { x: (d.ix + d.iw / 2) * TILE, y: (d.iy + d.ih / 2) * TILE };
  }
  function openDist(id) {
    var d = typeof id === 'string' ? W.DIST[id] : id;
    if (!d) return false;
    if (room(d.id)) return true;
    if (!distReady(d)) return false;
    openAct(d);
    return true;
  }
  function blockDefs() { return W.BLOCKS || {}; }
  function blockOpen(id) {
    if (!id) return true;
    if (!blockDefs()[id]) return true;
    return !!(S.block && S.block[id]);
  }
  var BLOCK_OF = null;
  function blockOf(p) {
    if (!p) return null;
    if (p.block) return p.block;
    if (!BLOCK_OF) {
      BLOCK_OF = {};
      Object.keys(blockDefs()).forEach(function (b) { (blockDefs()[b].plots || []).forEach(function (pid) { BLOCK_OF[pid] = b; }); });
    }
    return BLOCK_OF[p.id] || null;
  }
  function blockReady(id) {
    var b = blockDefs()[id];
    if (!b) return true;
    if (b.district && !room(b.district)) return false;
    try { return !b.req || !!b.req(S, G); } catch (e) { return false; }
  }
  function blockMidPx(b) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    (b.plots || []).forEach(function (pid) {
      var p = W.BY_ID[pid];
      if (!p) return;
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x + p.w); y1 = Math.max(y1, p.y + p.h);
    });
    if (x0 > x1) { var d = W.DIST[b.district]; return d ? distMidPx(d) : { x: S.player.x, y: S.player.y }; }
    return { x: (x0 + x1) / 2 * TILE, y: (y0 + y1) / 2 * TILE };
  }
  function openBlock(id) {
    var b = blockDefs()[id];
    if (!b || blockOpen(id)) return false;
    S.block[id] = true;
    S.blockAt[id] = S.t;
    if (QT.track) QT.track('room', { id: id, min: Math.round(S.t / 60) });
    var c = blockMidPx(b);
    burst(c, '#e8a800', 30);
    banner('NEW!!', nm(b), '#e2508a', 'area');
    QT.Sfx.play('fanfare');
    emit('blockOpened', id);
    return true;
  }
  function updateBlocks() {
    var ids = Object.keys(blockDefs());
    for (var i = 0; i < ids.length; i++) if (!blockOpen(ids[i]) && blockReady(ids[i])) openBlock(ids[i]);
  }
  var HOP_TILES = 8;
  function distAtPx(px, py) {
    var id = W.roomAtPx ? W.roomAtPx(px, py) : null;
    return id && W.DIST[id] ? W.DIST[id] : null;
  }
  function tripTiles(fromPx, fromPy, toPx, toPy) {
    var tv = QT.Sim && QT.Sim.travel;
    if (tv && typeof tv.tripTiles === 'function') return tv.tripTiles(fromPx, fromPy, toPx, toPy);
    var a = distAtPx(fromPx, fromPy), b = distAtPx(toPx, toPy);
    if (!a || !b || a === b) return pathLen(fromPx, fromPy, toPx, toPy);
    var c = b.center;
    if (!c) return pathLen(fromPx, fromPy, toPx, toPy);
    return pathLen((c.x + 0.5) * TILE, (c.y + 0.5) * TILE, toPx, toPy) + HOP_TILES;
  }
  function distHops(a, b) {
    var da = typeof a === 'string' ? W.DIST[a] : a, db = typeof b === 'string' ? W.DIST[b] : b;
    if (!da || !db) return 0;
    return Math.abs(da.col - db.col) + Math.abs(da.row - db.row);
  }
  pad('expand', {
    active: function () { return false; },
    info: function (pad) { return openInfo(pad.room); },
    act: function (pad) { openAct(pad.room); }
  });
  pad('open', {
    active: function (pad) { return !room(pad.district.id) && distReady(pad.district); },
    info: function (pad) { return openInfo(pad.district); },
    act: function (pad) { openDist(pad.district); }
  });
  function researchLv() {
    var R = QT.Sim && QT.Sim.research, ms = R && R.mods ? R.mods() : [];
    if (!ms || !ms.length) return rdLevel();
    var m = 0;
    for (var i = 0; i < ms.length; i++) m = Math.max(m, R.level(ms[i]) || 0);
    return m;
  }
  function partnerAt() {
    if (S.partnerAt != null) return S.partnerAt;
    if (S.blockAt && S.blockAt.campus != null) return S.blockAt.campus;
    return S.distAt.hongo != null ? S.distAt.hongo : null;
  }
  function distOpenedAt(id) { return S.distAt[id] != null ? S.distAt[id] : null; }
  function leased(distId) { return !!(S.lease && S.lease[distId]); }
  function needLease(p) {
    if (!p) return false;
    var d = W.DIST[p.room];
    return !!(d && d.lease && !leased(d.id) && p.kind !== 'upgrade');
  }
  function signLease(distId) {
    var d = W.DIST[distId], ls = d && d.lease;
    if (!ls || leased(distId)) return 0;
    invest(ls.deposit);
    S.lease[distId] = { at: S.t };
    var c = { x: (ls.x + 0.5) * TILE, y: (ls.y + 0.5) * TILE };
    toast(c, nm(ls) + '  -' + fmt(ls.deposit), '#e8a800');
    banner(T('gameLeaseDone', { n: nm(ls) }), nm(d), '#2bb8d8', 'new');
    emit('leaseSigned', { district: d, lease: ls });
    return ls.deposit;
  }
  function leaseMonthly() {
    var t = 0;
    W.DISTRICTS.forEach(function (d) { if (d.lease && leased(d.id)) t += d.lease.rent + d.lease.util; });
    return t;
  }
  pad('site', {
    active: function (pad) { return room(pad.district.id) && !leased(pad.district.id); },
    info: function (pad) {
      var ls = pad.district.lease;
      return { label: T('gameLeaseLabel', { n: nm(ls) }),
               sub: T('gameLeaseSub', { d: fmt(ls.deposit), r: fmt(ls.rent + ls.util) }),
               cost: ls.deposit, can: S.coins >= ls.deposit, hold: 0.8 };
    },
    act: function (pad) { signLease(pad.district.id); QT.Sfx.play('levelup'); }
  });
  function resetBlocks(S) {
    S.block = {}; S.blockAt = {};
    Object.keys(blockDefs()).forEach(function (b) { S.block[b] = false; });
  }
  mod({
    id: 'districts', order: 21,
    reset: function (S) { S.distAt = {}; S.lease = {}; S.partnerAt = null; resetBlocks(S); },
    update: function (S, dt) {
      updateBlocks();
      if (S.partnerAt == null) {
        var R = QT.Sim && QT.Sim.research;
        if (R && ((R.list && R.list().length) || (R.partner && R.partner()))) S.partnerAt = S.t;
      }
      var rent = 0, util = 0;
      W.DISTRICTS.forEach(function (d) {
        if (d.lease && leased(d.id)) { rent += d.lease.rent; util += d.lease.util; }
      });
      if (rent > 0) G.spend(rent * dt / W.MONTH, 'rent');
      if (util > 0) G.spend(util * dt / W.MONTH, 'util');
    },
    save: function (S) { return { at: S.distAt, lease: S.lease, partnerAt: S.partnerAt, block: S.block, blockAt: S.blockAt }; },
    load: function (S, o) {
      resetBlocks(S);
      Object.keys(o.block || {}).forEach(function (b) { if (S.block[b] === false && o.block[b]) S.block[b] = true; });
      S.blockAt = o.blockAt || {};
      S.distAt = o.at || {};
      S.lease = o.lease || {};
      S.partnerAt = o.partnerAt != null ? o.partnerAt : null;
      if (!o.lease) W.DISTRICTS.forEach(function (d) { if (d.lease && S.dist[d.id]) S.lease[d.id] = { at: S.t }; });
      W.DISTRICTS.forEach(function (d) { if (!d.open0 && S.dist[d.id] && S.distAt[d.id] == null) S.distAt[d.id] = S.t; });
    }
  });
  var GRID = null;
  function markRect(x0, y0, w0, h0, v) {
    var w = W.WORLD_W, h = W.WORLD_H;
    for (var y = Math.max(0, y0); y < Math.min(h, y0 + h0); y++)
      for (var x = Math.max(0, x0); x < Math.min(w, x0 + w0); x++) GRID[y * w + x] = v;
  }
  function rebuildGrid() {
    var w = W.WORLD_W, h = W.WORLD_H;
    GRID = new Uint8Array(w * h);
    distCache = {}; distCount = 0;
    if (W.ROADS) {
      W.ROADS.forEach(function (rd) { markRect(rd.x, rd.y, rd.w, rd.h, 1); });
      W.ROOMS.forEach(function (r) { if (room(r.id)) markRect(r.ix, r.iy, r.iw, r.ih, 1); });
    } else {
      W.ROOMS.forEach(function (r) {
        if (!room(r.id)) return;
        for (var y = r.iy; y < r.iy + r.ih; y++)
          for (var x = r.ix; x < r.ix + r.iw; x++) GRID[y * w + x] = 1;
        var below = W.ROOMS[r.index - 1];
        if (below && room(below.id))
          for (var d = 0; d < r.door.w; d++) GRID[r.door.y * w + (r.door.x + d)] = 1;
      });
    }
    W.PLOTS.forEach(function (p) {
      if (isDeco(p)) { markRect(p.x, p.y, p.w, p.h, 0); return; }
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
  var distCache = {}, distCount = 0;
  function nearTile(tx, ty) {
    if (tileOk(tx, ty)) return { x: tx, y: ty };
    for (var r = 1; r <= 2; r++)
      for (var dy = -r; dy <= r; dy++)
        for (var dx = -r; dx <= r; dx++)
          if (tileOk(tx + dx, ty + dy)) return { x: tx + dx, y: ty + dy };
    return null;
  }
  function distTable(s0) {
    if (distCache[s0]) return distCache[s0];
    var Wd = W.WORLD_W, N = Wd * W.WORLD_H;
    var dist = new Int32Array(N).fill(-1), q = new Int32Array(N), h = 0, t = 0;
    dist[s0] = 0; q[t++] = s0;
    while (h < t) {
      var c = q[h++], cx = c % Wd, cy = (c - cx) / Wd;
      for (var k = 0; k < 4; k++) {
        var nx = cx + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = cy + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (!tileOk(nx, ny)) continue;
        var n = ny * Wd + nx;
        if (dist[n] >= 0) continue;
        dist[n] = dist[c] + 1; q[t++] = n;
      }
    }
    if (distCount >= 64) { distCache = {}; distCount = 0; }
    distCache[s0] = dist; distCount++;
    return dist;
  }
  function pathLen(ax, ay, bx, by) {
    var a = nearTile(Math.floor(ax / TILE), Math.floor(ay / TILE));
    var b = nearTile(Math.floor(bx / TILE), Math.floor(by / TILE));
    if (!a || !b) return Infinity;
    var d = distTable(a.y * W.WORLD_W + a.x)[b.y * W.WORLD_W + b.x];
    return d < 0 ? Infinity : d;
  }
  function reset() {
    S.t = 0; S.obj = 0; objSeen = 0; S.objId = objList().length ? objList()[0].id : null;
    S.tut = 0; S.tutWalk = 0;
    S.banners = []; S.coinFx = [];
    S.items = []; S.fx = []; S.toasts = []; S.offline = null;
    if (staleSave) { staleSave = false; banner(T('gameSaveOld'), T('gameSaveOldSub'), '#2bb8d8', 'new'); }
    S.p = {};
    W.PLOTS.forEach(function (p) {
      var have = !!p.owned || isDeco(p);
      S.p[p.id] = { id: p.id, level: have ? 1 : 0, owned: have, deco: isDeco(p) || undefined,
                    timer: 0, working: false, prog: 0, buf: [], cur: null, out: null };
    });
    S.dist = S.rooms = {};
    W.ROOMS.forEach(function (r) { S.dist[r.id] = !!r.open0; });
    S.distAt = {}; S.lease = {}; S.partnerAt = null; resetBlocks(S);
    S.player.x = W.START.x; S.player.y = W.START.y; S.player.carry = [];
    modsInOrder().forEach(function (m) { if (m.reset) m.reset(S); });
    buildPads();
    rebuildGrid();
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
    if (frozen()) return false;
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
      var d = PADDEF[pad.type], hit = pad.hit || (d && d.hit) || 11;
      if (Math.abs((pad.x + 0.5) * TILE - pl.x) < hit && Math.abs((pad.y + 0.5) * TILE - pl.y) < hit) return pad;
    }
    return null;
  }
  var freezeT = 0;
  function freeze(sec) {
    freezeT = Math.max(freezeT, +sec || 0);
    S.player.path = null; S.player.goal = null;
  }
  function frozen() {
    if (freezeT > 0) return true;
    var tv = QT.Sim && QT.Sim.travel;
    return !!(tv && typeof tv.riding === 'function' && tv.riding());
  }
  function warp(px, py, opt) {
    var pl = S.player;
    pl.x = px; pl.y = py;
    pl.path = null; pl.goal = null; pl.walk = 0; pl.stuckT = 0; pl.lastPx = px; pl.lastPy = py;
    unstick();
    heldPad = null; holdT = 0; S.heldPad = null; S.holdT = 0;
    spentPad = padAt(pl);
    emit('warp', { x: pl.x, y: pl.y, from: opt && opt.from, to: opt && opt.to, why: opt && opt.why });
    return { x: pl.x, y: pl.y };
  }
  function roomHere() {
    var pl = S.player;
    if (W.roomAtPx) {
      var id = W.roomAtPx(pl.x, pl.y);
      return id && id !== 'ave' && room(id) ? roomDef(id) : null;
    }
    for (var i = 0; i < W.ROOMS.length; i++) {
      var r = W.ROOMS[i];
      var ty = pl.y / TILE;
      if (ty >= r.wallTop && ty <= r.wallBottom && room(r.id)) return r;
    }
    return null;
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
    if (freezeT > 0) freezeT = Math.max(0, freezeT - dt);
    var still = frozen();
    updatePlayer(dt, still ? { x: 0, y: 0 } : dir);
    var ms = modsInOrder(), i;
    for (i = 0; i < ms.length; i++) if (ms[i].update) ms[i].update(S, dt);
    updateFx(dt);
    for (i = S.items.length - 1; i >= 0; i--) {
      var it = S.items[i];
      it.t += dt;
      if (it.t >= it.dur) { if (it.cb) it.cb(); S.items.splice(i, 1); }
    }
    var pad = still ? spentPad : padAt(S.player);
    if (pad !== spentPad) spentPad = null;
    if (pad && pad === spentPad) pad = null;
    if (pad !== heldPad) { heldPad = pad; holdT = 0; }
    if (pad) {
      var info = padInfo(pad);
      if (info && info.can) {
        holdT += dt;
        if (holdT >= (info.hold || 0)) {
          var d = PADDEF[pad.type], rep = !!(d && d.repeat);
          doPad(pad); holdT = 0; if (!rep) { heldPad = null; spentPad = pad; }
        }
      } else holdT = 0;
    }
    S.heldPad = heldPad; S.holdT = holdT;
    QT.Sfx.ambient(ambientVolume());
    advanceObjectives();
    for (i = 0; i < ms.length; i++) if (ms[i].late) ms[i].late(S, dt);
    if (S.t - S.lastSave > 5) { S.lastSave = S.t; save(); }
  }
  var COLD = ['asm', 'fridge', 'helium', 'line_1', 'line_2', 'line_3', 'line_4', 'dc'];
  function ambientVolume() {
    var pl = S.player, best = 0;
    COLD.forEach(function (id) {
      var st = S.p[id];
      if (!st || !st.owned || !W.BY_ID[id] || !room(W.BY_ID[id].room)) return;
      if (id === 'dc' && !(S.dc && S.dc.length > 0)) return;
      var p = W.BY_ID[id];
      var px = p.x * TILE, py = p.y * TILE;
      var dx = Math.max(px - pl.x, 0, pl.x - (px + p.w * TILE));
      var dy = Math.max(py - pl.y, 0, pl.y - (py + p.h * TILE));
      var v = 1 - Math.hypot(dx, dy) / 120;
      if (id === 'dc') v *= Math.min(1, 0.4 + S.dc.length * 0.15);
      if (v > best) best = v;
    });
    return Math.max(0, Math.min(0.8, best * 0.8));
  }
  function saveData() {
    syncObj();
    var d = {
      v: SAVE_VER, map: MAP_REV, savedAt: Date.now(), t: S.t,
      objId: S.objId, obj: S.obj, tut: S.tut, muted: S.muted,
      px: S.player.x, py: S.player.y,
      carry: S.player.carry,
      dist: S.dist,
      p: Object.keys(S.p).filter(function (k) { return !S.p[k].deco; })
                .map(function (k) { return [k, S.p[k].level, S.p[k].owned ? 1 : 0]; }),
      mods: {}
    };
    modsInOrder().forEach(function (m) { if (m.save) d.mods[m.id] = m.save(S); });
    return d;
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData())); } catch (e) { }
  }
  var staleSave = false;
  function dropSave(raw) {
    try { localStorage.setItem(OLD_KEY, raw); } catch (e) { }
    clearSave();
    staleSave = true;
  }
  function load() {
    var raw, d;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try { d = JSON.parse(raw); } catch (e) { d = null; }
    if (!d || d.v !== SAVE_VER) { dropSave(raw); return null; }
    try { return loadData(d); } catch (e) {
      try { console.warn('load failed', e); } catch (e2) { }
      reset();
      dropSave(raw);
      return null;
    }
  }
  function loadData(d) {
    reset();
    S.t = d.t || 0; S.muted = !!d.muted;
    S.tut = d.tut != null ? d.tut : 2;
    if (d.objId) { S.objId = d.objId; S.obj = objSeen = Math.max(0, objIndex(d.objId)); }
    if (d.px != null) { S.player.x = d.px; S.player.y = d.py; }
    (d.p || []).forEach(function (e) {
      if (!S.p[e[0]] || S.p[e[0]].deco) return;
      S.p[e[0]].level = e[1]; S.p[e[0]].owned = !!e[2];
    });
    S.player.carry = (d.carry || []).slice(0, carryMax());
    if (d.dist) W.ROOMS.forEach(function (r) { S.dist[r.id] = r.open0 ? true : !!d.dist[r.id]; });
    var away = Math.min(CFG.offlineCap, Math.max(0, (Date.now() - (d.savedAt || Date.now())) / 1000));
    var ms = d.mods || {}, ctx = { away: away, d: d };
    modsInOrder().forEach(function (m) { if (m.load) m.load(S, ms[m.id] || {}, ctx); });
    rebuildGrid();
    if (!walkable(S.player.x, S.player.y)) { S.player.x = W.START.x; S.player.y = W.START.y; }
    syncObj();
    return S;
  }
  function map22Dist(px, py) {
    if (!isFinite(px) || !isFinite(py)) return null;
    var tx = px / TILE, ty = py / TILE, M = MAP22, best = null, bd = 1e9;
    if (tx < 0 || ty < 0 || tx >= M.world || ty >= M.world) return null;
    for (var c = 0; c < 3; c++) for (var r = 0; r < 3; r++) {
      var x0 = M.colX[c], y0 = M.rowY[r];
      var dx = Math.max(x0 - tx, 0, tx - (x0 + M.colW[c]));
      var dy = Math.max(y0 - ty, 0, ty - (y0 + M.rowH[r]));
      var dd = dx + dy;
      if (dd < bd) { bd = dd; best = M.cell[c + ',' + r]; }
    }
    return bd <= 3 ? best : null;
  }
  function mapMigrate(hasPos) {
    var pl = S.player, id = hasPos ? map22Dist(pl.x, pl.y) : null;
    var dd = id && W.DIST[id] && S.dist[id] ? W.DIST[id] : null;
    var p = dd ? distMidPx(dd) : { x: W.START.x, y: W.START.y };
    pl.x = p.x; pl.y = p.y;
    pl.path = null; pl.goal = null; pl.walk = 0; pl.stuckT = 0; pl.lastPx = p.x; pl.lastPy = p.y;
    unstick();
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
  var API = {
    PADS: function () { return S.angel ? PADS.concat([ANGEL_PAD]) : PADS; },
    reset: reset, update: update, save: save, load: load, hasSave: hasSave, clearSave: clearSave,
    saveData: saveData,
    costOf: costOf, canUpgrade: canUpgrade, padInfo: padInfo, padAt: padAt, padActive: padActive, doPad: doPad,
    fmt: fmt, objText: objText, objective: objective,
    carryMax: carryMax, playerSpeed: playerSpeed, salesLv: salesLv, loungeMul: loungeMul,
    sphereMul: sphereMul, staffCount: staffCount, staffMax: staffMax, devStaff: devStaff, pcLv: pcLv,
    room: room, roomOpen: room, roomDef: roomDef, roomName: roomName, roomHere: roomHere, officeOn: officeOn,
    rebuildGrid: rebuildGrid, walkable: walkable, blocked: blocked, goTo: goTo, pathLen: pathLen,
    findPath: findPath,
    warp: warp, freeze: freeze, frozen: frozen, isDeco: isDeco,
    toast: toast, burst: burst, banner: banner, padPos: padPos,
    pad: pad, padDef: padDef, alertHook: alertHook, alertHooks: ALERT_HOOKS, mod: mod, mods: modsInOrder, on: on, emit: emit,
    OFFICE_ONLY: OFFICE_ONLY, ANGEL_PAD: ANGEL_PAD,
    distReady: distReady, researchLv: researchLv, partnerAt: partnerAt, distOpenedAt: distOpenedAt,
    openDist: openDist, blockOpen: blockOpen, blockReady: blockReady, blockOf: blockOf,
    tripTiles: tripTiles, distHops: distHops, distMidPx: distMidPx,
    leased: leased, needLease: needLease, signLease: signLease, leaseMonthly: leaseMonthly,
    supContracts: supContracts, supParts: supParts
  };
  Object.keys(API).forEach(function (k) { G[k] = API[k]; });
  Object.defineProperty(G, 'OBJECTIVES', { get: objList, enumerable: true });
})(window.QT || (window.QT = {}));
