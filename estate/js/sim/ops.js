(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE;
  function T(k, v) { return L.t(k, v); }
  function fmt(n) { return G.fmt(n); }
  function Es() { return G.estate; }
  function K_(p) { return E.KINDS[p.kind] || {}; }
  L.add({
    op_stayOn:     ['民泊を始めた!', 'SHORT-STAY RENTAL OPEN!'],
    op_stayOnS:    ['{n}（家具・家電・届出 {v}）', '{n} (furniture & permits {v})'],
    op_stayOff:    ['民泊をやめて、ふつうに貸す', 'Back to normal renting'],
    op_stayBusy:   ['入居者がいるあいだは民泊にできない（空いてから）', 'You can only switch when the units are empty'],
    op_groundOn:   ['借地にした!', 'LAND LEASED!'],
    op_groundOnS:  ['{n}: 地代 月{v}・{y}年', '{n}: ground rent {v}/mo for {y} yrs'],
    op_groundEnd:  ['借地の期間が終わり、土地が戻ってきた', 'The land lease ended; the land is yours again']
  });
  function rnd() { var o = S.ops; o.seed = (o.seed * 1103515245 + 12345) & 0x7fffffff; return o.seed / 0x7fffffff; }
  function gauss() { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }
  function stayOk(p) { return !!p && p.own && !p.building && (p.kind === 'ko' || p.kind === 'apa') && p.ctr !== 'corp' && p.ctr !== 'sub'; }
  function staySetup(p, inn) {
    var n = Math.max(1, p.units.length);
    return E.STAY.setup + E.STAY.setupUnit * n + (inn ? E.STAY.innSetup + E.STAY.innUnit * n : 0);
  }
  function innOk(p) { return stayOk(p) && tourOf(p) >= E.STAY.innTour; }
  function nightsCap(p, inn) { return (inn != null ? inn : p.stayInn) ? E.STAY.innNights : E.STAY.nights; }
  function tourOf(p) { return Es().distOf(p).tour || 0.5; }
  function seasonNow() { return E.STAY.season[((S.fin.month - 1) % 12 + 12) % 12] || 0; }
  function stayEstimate(p, inn) {
    var t = tourOf(p), night = Math.round(Es().unitRent(p) / (p.rentMul || 1) * E.STAY.night * t / 100) * 100;
    var occ = Math.max(0.15, Math.min(0.95, 0.55 + 0.35 * (t - 1)));
    var nights = nightsCap(p, inn) * occ * p.units.length;
    var rev = Math.round(night * nights);
    var cost = Math.round(rev * (E.STAY.ota + (p.mgmt === 'co' ? E.STAY.agent : 0)) + nights * E.STAY.clean);
    return { night: night, occ: occ, rev: rev, cost: cost, net: rev - cost };
  }
  function stayMonth(p) {
    var t = tourOf(p);
    var night = Math.round(Es().unitRent(p) / (p.rentMul || 1) * E.STAY.night * t / 100) * 100;
    var pen = p.stayPen && S.fin.month < p.stayPen ? 0.2 : 0;
    var boom = S.ops.boomUntil && S.fin.month < S.ops.boomUntil ? 0.1 : 0;
    var occ = Math.max(0.1, Math.min(0.95, 0.55 + 0.35 * (t - 1) + seasonNow() + boom - pen + gauss() * 0.08));
    var nights = Math.round(nightsCap(p) * occ * p.units.length);
    var rev = night * nights;
    var ota = Math.round(rev * E.STAY.ota), clean = nights * E.STAY.clean, agent = p.mgmt === 'co' ? Math.round(rev * E.STAY.agent) : 0;
    if (rev > 0) Es().income(p, 415, rev);
    if (ota) G.post(517, 100, ota, false);
    if (clean) G.post(518, 100, clean, false);
    if (agent) G.post(510, 100, agent, false);
    p.lastRev = rev; p.lastStayCost = ota + clean + agent; p.lastOcc = occ;
  }
  function startStay(id, inn) {
    var p = S.props[id];
    if (!stayOk(p) || p.ctr === 'stay') return { ok: false };
    if (inn && !innOk(p)) return { ok: false };
    if (p.units.some(function (un) { return un.occ; })) return { ok: false, why: T('op_stayBusy') };
    var c = staySetup(p, inn);
    if (Es().cashFor(p) < c) return { ok: false, why: T('est_needCash', { v: '¥' + fmt(c) }) };
    Es().own(p, function () { G.post(130, 100, c, { k: 'staySetup', p: p.id }); });
    p.bCost = (p.bCost || 0) + c; Es().setDep(p);
    p.ctr = 'stay'; p.stayInn = !!inn; p.lastRev = 0; p.lastStayCost = 0; p.trouble = [];
    G.banner(T('op_stayOn'), T('op_stayOnS', { n: Es().name(p), v: '¥' + fmt(c) }), '#e2508a', 'good');
    G.emit('stayStart', { p: p });
    return { ok: true };
  }
  function stopStay(id) {
    var p = S.props[id];
    if (!p || p.ctr !== 'stay') return { ok: false };
    p.ctr = null; p.stayInn = false; p.lastRev = null; p.lastStayCost = 0;
    G.toast(Es().pos(p), T('op_stayOff'), '#2bb8d8');
    return { ok: true };
  }
  function trunkFull(p) {
    var d = Es().distOf(p), a = Es().areaOf(p);
    return Math.round((p.boxes || 0) * E.TRUNK.box * d.rent * (a.rent || 1) * Es().rentIdx(p.dist) * E.TRUNK.max / 100) * 100;
  }
  function trunkMonth(p) {
    var ramp = Math.min(1, 0.3 + 0.7 * (S.fin.month - (p.openAt || S.fin.month)) / E.TRUNK.fill);
    var rev = Math.round(trunkFull(p) * ramp * Math.max(0.6, 1 + gauss() * 0.05));
    if (rev > 0) Es().income(p, 414, rev);
    G.post(518, 100, Math.round(rev * E.TRUNK.cost), false);
    p.lastRev = rev;
  }
  function groundRent(p) { return Math.round(Es().landValue(p) * E.GROUND.rate / 12 / 1000) * 1000; }
  function groundOk(p) { return !!p && p.own && p.kind === 'land' && !p.building && !p.ctr; }
  function startGround(id) {
    var p = S.props[id];
    if (!groundOk(p)) return { ok: false };
    p.ctr = 'ground'; p.groundUntil = S.fin.month + E.GROUND.years * 12;
    G.banner(T('op_groundOn'), T('op_groundOnS', { n: Es().name(p), v: '¥' + fmt(groundRent(p)), y: E.GROUND.years }), '#2fbf7a', 'good');
    G.emit('groundStart', { p: p });
    return { ok: true };
  }
  function groundMonth(p) {
    if (S.fin.month >= (p.groundUntil || Infinity)) {
      p.ctr = null; p.groundUntil = null;
      G.banner(T('op_groundEnd'), Es().name(p), '#2bb8d8', 'good');
      return;
    }
    Es().income(p, 414, groundRent(p));
  }
  G.mod({
    id: 'ops', order: 41,
    reset: function (S) { S.ops = { seed: 90210, boomUntil: 0 }; },
    save: function (S) { return S.ops; },
    load: function (S, o) { if (o && o.seed) S.ops = o; }
  });
  G.ops = {
    stayOk: stayOk, innOk: innOk, staySetup: staySetup, stayEstimate: stayEstimate, stayMonth: stayMonth, startStay: startStay, stopStay: stopStay,
    trunkFull: trunkFull, trunkMonth: trunkMonth,
    groundOk: groundOk, groundRent: groundRent, startGround: startGround, groundMonth: groundMonth
  };
})(window.QT);
