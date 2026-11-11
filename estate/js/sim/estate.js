(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, W = QT.World, L = QT.L, E = QT.Data.ESTATE, TILE = W.TILE;
  function T(k, v) { return L.t(k, v); }
  function nm(o, f) { return L.nm(o, f); }
  function fmt(n) { return G.fmt(n); }
  L.add({
    est_forSale:     ['売物件', 'For sale'],
    est_mine:        ['所有', 'Yours'],
    est_soldOther:   ['ほかの人が買った', 'Someone else bought it'],
    est_bought:      ['物件を買った!', 'PROPERTY BOUGHT!'],
    est_boughtSub:   ['{n}・{p}', '{n} · {p}'],
    est_firstRent:   ['はじめての家賃!', 'FIRST RENT!'],
    est_moveIn:      ['入居が決まった', 'New tenant'],
    est_wholeOffer:  ['ビルを一棟借りたい会社!', 'A COMPANY WANTS THE WHOLE BUILDING!'],
    est_sellerMad:   ['売り主が怒って売るのをやめた（もう買えない）', 'The seller withdrew after your offer (no longer for sale)'],
    est_moveOut:     ['退去', 'Tenant left'],
    est_trouble:     ['困った', 'Problem'],
    est_tr_leak:     ['水漏れ', 'Leak'],
    est_tr_key:      ['鍵をなくした', 'Lost key'],
    est_tr_noise:    ['騒音の苦情', 'Noise complaint'],
    est_tr_weed:     ['草むしり', 'Weeding'],
    est_tr_light:    ['共用灯が切れた', 'Hall light out'],
    est_tr_aircon:   ['エアコンの故障', 'Air-con broke'],
    est_tr_late:     ['家賃の滞納', 'Late rent'],
    est_tr_coin:     ['両替機が空っぽ', 'Change machine empty'],
    est_tr_jam:      ['乾燥機が止まった', 'Dryer jammed'],
    est_tr_lint:     ['清掃（糸くず）', 'Clean the lint'],
    est_tr_ticket:   ['精算機の紙切れ', 'Ticket paper out'],
    est_fix:         ['対応する', 'Handle it'],
    est_fixed:       ['解決! 喜ばれた', 'Sorted! They are happy'],
    est_breakdown:   ['設備の故障', 'Equipment failure'],
    est_breakdownSub:['{n}: 修理 {v}', '{n}: repair {v}'],
    est_sold:        ['売れた!', 'SOLD!'],
    est_soldSub:     ['{n}・{v}（譲渡益 {g}）', '{n} · {v} (gain {g})'],
    est_built:       ['完成!', 'COMPLETED!'],
    est_builtSub:    ['{n} ができた', '{n} is ready'],
    est_forced:      ['任意売却', 'FORCED SALE'],
    est_forcedSub:   ['カードローンが膨らんだので {n} を相場の8割で売った', 'Card loan too big — sold {n} at 80% of market'],
    est_inspect:     ['内見する', 'Inspect'],
    est_inspected:   ['内見した', 'Inspected'],
    est_open:        ['くわしく', 'Details'],
    est_condGood:    ['きれい', 'Good'],
    est_condMid:     ['ふつう', 'Fair'],
    est_condBad:     ['傷みあり', 'Worn'],
    est_condAwful:   ['かなり傷んでいる', 'Badly worn'],
    est_condUnknown: ['？（内見で分かる）', '? (inspect to see)'],
    est_condoSale:   ['売 {n}室・{p}〜', '{n} for sale · from {p}'],
    est_condoMine:   ['自分の部屋 {n}', '{n} yours'],
    est_needCash:    ['手元が足りない（{v} 要る）', 'Not enough cash (needs {v})'],
    est_shopBusy:    ['店舗に借り手がいるあいだは変えられない（立ち退きをお願いするか、空くのを待つ）', 'The shop has a tenant (ask them to leave, or wait)'],
    est_evicted:     ['借り手が出ていった（立ち退き料 {v}）', 'The tenant left (paid {v} to leave)'],
    est_corpOffer:   ['法人から借り上げの申し込み', 'A company wants to lease'],
    est_corpOfferSub:['{n}: 家賃 月{v}・{y}年。受けるならシートで', '{n}: {v}/mo for {y} yrs. Accept in the sheet'],
    est_corpStart:   ['法人契約が始まった', 'Corporate lease started'],
    est_corpRenew:   ['法人契約を更新!', 'Corporate lease renewed!'],
    est_corpEnd:     ['法人契約の満了', 'Corporate lease ended'],
    est_corpEndSub:  ['{n} が一度に全部空いた', 'All of {n} is empty at once'],
    est_corpGap:     ['法人契約の解約', 'Corporate lease cancelled'],
    est_corpGapSub:  ['{n} の部屋が空いたので、会社が契約をやめた。ここからはふつうに入居者を募る', 'A unit at {n} fell empty, so the company ended the lease. Back to finding tenants yourself'],
    est_subStart:    ['サブリース契約', 'Sublease signed'],
    est_subCut:      ['サブリースの賃料見直し', 'Sublease rent cut'],
    est_subCutSub:   ['{n}: 月{a} → 月{b}', '{n}: {a} → {b} /mo'],
    est_subQuit:     ['サブリースを解約', 'Sublease cancelled'],
    est_washOpen:    ['ランドリー開店!', 'LAUNDRY OPEN!'],
    est_washMachines:['ランドリーの機械が古い', 'Laundry machines are old'],
    est_cparkLease:  ['運営会社に一括で貸した', 'Leased to a parking operator'],
    est_collect:     ['家賃を回収', 'Collect rent'],
    est_collectBox:  ['機械のお金を回収', 'Empty the machines'],
    est_collectCo:   ['会社の口座へ +¥{v}', 'To your company +¥{v}']
  });
  function rnd() {
    var m = S.mkt;
    m.seed = (m.seed * 1103515245 + 12345) & 0x7fffffff;
    return m.seed / 0x7fffffff;
  }
  function rint(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function gauss() { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }
  function inOwner(p, fn) { return G.inBook ? G.inBook(p && p.owner, fn) : fn(); }
  function cashFor(p) { return G.cashFor ? G.cashFor(p) : S.gl[100]; }
  var SITES = null;
  var DECO_OK = { apt: 1, house: 1, shita_house: 1, shop: 1, shita_shop: 1, akiba_shop: 1, hotel: 1, office_tower: 1,
                  parking: 1, farm: 1, woods: 1, dept_store: 1, old_bldg: 1, warehouse: 1 };
  function sites() {
    if (SITES) return SITES;
    var own = W.PLOTS.filter(function (p) { return p.kind === 'prop'; });
    if (!own.length) own = (W.DECO || []).filter(function (p) {
      var d = E.DIST[p.room];
      return d && d.live && DECO_OK[p.variant];
    });
    own.forEach(function (st) {
      var as = E.AREAS[st.room] || [{}], d = W.DIST[st.room];
      if (st.area != null) { var k = as.map(function (a) { return a.id; }).indexOf(st.area); st.areaIx = k < 0 ? 0 : k; return; }
      if (!d) { st.areaIx = 0; return; }
      var fx = (st.x + st.w / 2 - d.ix) / d.iw, fy = (st.y + st.h / 2 - d.iy) / d.ih, best = 0, bd = Infinity;
      as.forEach(function (a, i) {
        var z = ZONE[a.zone || 'c'] || ZONE.c, dd = (z[0] - fx) * (z[0] - fx) + (z[1] - fy) * (z[1] - fy);
        if (dd < bd) { bd = dd; best = i; }
      });
      st.areaIx = best;
    });
    own.forEach(function (st) { st.condo = isCondoSite(st) && (st.variant === 'hotel' || (st.variant === 'apt' && hashOf(st.id) % 100 < 55)); });
    SITES = own;
    return SITES;
  }
  function siteById(id) { return W.BY_ID[id] || null; }
  function hashOf(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h; }
  function siteOf(p) { return W.BY_ID[p.site || p.id] || null; }
  var LAYS = {
    '1R':   { area: 20, k: 1.02, stay: 40 }, '1K': { area: 25, k: 1.0, stay: 44 }, '1LDK': { area: 40, k: 0.9, stay: 56 },
    '2LDK': { area: 55, k: 0.84, stay: 72 }, '3LDK': { area: 70, k: 0.8, stay: 90 }, 'OF': { area: 60, k: 1.0, stay: 100 },
    'L1':   { area: 55, k: 0.95, stay: 48, lux: true, name: '1LDK' }, 'L2': { area: 80, k: 0.9, stay: 60, lux: true, name: '2LDK' },
    'L3':   { area: 110, k: 0.85, stay: 72, lux: true, name: '3LDK' }, 'PH': { area: 170, k: 0.85, stay: 72, lux: true, name: 'ペントハウス', name_en: 'Penthouse' }
  };
  var LUX_P = { shibuya: 0.5, ariake: 0.45, minato: 0.35, shinjuku: 0.3 };
  var LUX_N = { shibu: 1, shina: 1, kosugi: 1, aoyama: 1, daikan: 1 };
  var LUX = { rent: 1.25, floor: 0.012, fee: 650, fill: 1.5, cap: 0, ageK: 0.5, corp: 3 };
  var LUX_TOWER = [['ザ・タワー', 'The Tower '], ['スカイレジデンス', 'Sky Residence '], ['グランドタワー', 'Grand Tower ']];
  var LUX_BAY = [['ベイフロントタワー', 'Bayfront Tower '], ['ザ・タワー', 'The Tower '], ['スカイレジデンス', 'Sky Residence ']];
  var LUX_LOW = [['ザ・ハウス', 'The House '], ['ヒルトップレジデンス', 'Hilltop Residence '], ['グランレジデンス', 'Grand Residence ']];
  function layName(lay) { var l = LAYS[lay] || {}; return lay === 'OF' ? (L.get() === 'en' ? 'office' : '事務所') : (L.get() === 'en' ? l.name_en || l.name : l.name) || lay; }
  function feeMonth(p) {
    if (G.condo && G.condo.is(p)) return G.condo.fee(p);
    if (p.fee != null) return p.fee;
    return (K_(p).fee || 0) * unitsOf(p);
  }
  function roomFee(lay) { var l = LAYS[lay] || LAYS['1K']; return Math.max(12000, Math.round(l.area * (l.lux ? LUX.fee : 400) / 1000) * 1000); }
  var BLDG_PRE = ['レジデンス', 'メゾン', 'グランコート', 'パークサイド', 'ステーションフロント', 'サンライズ', 'コートハウス', 'ハイツ'];
  var BLDG_PRE_EN = ['Residence', 'Maison', 'Grand Court', 'Parkside', 'Station Front', 'Sunrise', 'Court House', 'Heights'];
  var BLDG_TOWER = [['タワーレジデンス', 'Tower Residence '], ['スカイコート', 'Sky Court '], ['レジデンスタワー', 'Residence Tower '], ['サンライズタワー', 'Sunrise Tower ']];
  function isCondoSite(st) {
    var v = st.variant;
    if (v === 'hotel' || v === 'office_tower') return true;
    return v === 'apt' && (st.h || 0) >= 4;
  }
  function layFor(st, office) {
    if (office) return 'OF';
    var d = st.room, r = rnd(), fam = d === 'futako' || d === 'inzai' || d === 'ariake' || (d === 'minato' && st.areaIx === 0) || (d === 'fab' && st.areaIx !== 2);
    if (fam) return r < 0.15 ? '1K' : r < 0.4 ? '1LDK' : r < 0.8 ? '2LDK' : '3LDK';
    return r < 0.35 ? '1R' : r < 0.75 ? '1K' : r < 0.92 ? '1LDK' : '2LDK';
  }
  function makeBldg(st) {
    var floors = st.variant === 'office_tower' ? rint(8, 16) : st.variant === 'hotel' ? rint(7, 14) : rint(5, 12);
    var age = rint(2, 35), k = rint(0, BLDG_PRE.length - 1);
    var a = (E.AREAS[st.room] || [{}])[st.areaIx || 0] || {};
    var b = { name: BLDG_PRE[k] + (a.name ? a.name.replace(/・.*/, '') : ''), name_en: BLDG_PRE_EN[k] + ' ' + (a.name_en ? a.name_en.split(/[ &]/)[0] : ''),
              floors: floors, built: curYear() - age, rooms: [] };
    var n = rint(8, 14), used = {}, office = st.variant === 'office_tower' && rnd() < (E.DIST[st.room] || {}).corp;
    if (!office && st.variant !== 'office_tower' && rnd() < (LUX_P[st.room] || 0)) {
      var low = a.id === 'aoyama' || a.id === 'daikan';
      var pre = low ? LUX_LOW : (st.room === 'ariake' || a.id === 'mm') ? LUX_BAY : LUX_TOWER, nm2 = pre[rint(0, pre.length - 1)];
      b.lux = true; b.floors = floors = low ? rint(4, 8) : rint(20, 52); b.built = curYear() - rint(0, 20);
      b.name = nm2[0] + (a.name ? a.name.replace(/・.*/, '') : '');
      b.name_en = nm2[1] + (a.name_en ? a.name_en.split(/[ &]/)[0] : '');
      n = rint(8, 12);
    }
    for (var i = 0; i < n * 3 && b.rooms.length < n; i++) {
      var fl = rint(2, floors), no = fl * 100 + rint(1, 6);
      if (used[no]) continue;
      used[no] = 1;
      var lay;
      if (b.lux) { var r = rnd(); lay = fl === floors ? 'PH' : r < 0.3 ? 'L1' : r < 0.72 ? 'L2' : 'L3'; }
      else lay = layFor(st, office && rnd() < 0.7);
      b.rooms.push({ no: no, floor: fl, lay: lay });
    }
    b.rooms.sort(function (x, y) { return x.no - y.no; });
    return b;
  }
  function relabel(st, b, lux) {
    var a = (E.AREAS[st.room] || [{}])[st.areaIx || 0] || {}, tn = a.name ? a.name.replace(/・.*/, '') : '', te = a.name_en ? a.name_en.split(/[ &]/)[0] : '';
    var nb = { floors: b.floors, built0: b.built, rooms: [] };
    if (lux) {
      var pre = b.floors < 20 || a.id === 'aoyama' || a.id === 'daikan' ? LUX_LOW : (st.room === 'ariake' || a.id === 'mm') ? LUX_BAY : LUX_TOWER, nm = pre[rint(0, pre.length - 1)];
      nb.lux = true; nb.name = nm[0] + tn; nb.name_en = nm[1] + te; nb.built = curYear() - rint(0, 20);
    } else {
      var k = rint(0, BLDG_PRE.length - 1), tw = b.floors >= 20 ? BLDG_TOWER[k % BLDG_TOWER.length] : null;
      nb.name = (tw ? tw[0] : BLDG_PRE[k]) + tn; nb.name_en = (tw ? tw[1] : BLDG_PRE_EN[k] + ' ') + te; nb.built = curYear() - rint(2, 35);
    }
    var ph = false;
    b.rooms.forEach(function (r) {
      var x = rnd(), lay = !lux ? layFor(st, false) : r.floor === b.floors && !ph ? 'PH' : x < 0.3 ? 'L1' : x < 0.72 ? 'L2' : 'L3';
      if (lay === 'PH') ph = true;
      nb.rooms.push({ no: r.no, floor: r.floor, lay: lay });
    });
    return nb;
  }
  function reLux() {
    var keep = S.mkt.seed, by = {};
    sites().forEach(function (st) {
      if (!st.condo) return;
      var a = (E.AREAS[st.room] || [{}])[st.areaIx || 0] || {};
      (by[st.room + '/' + a.id] || (by[st.room + '/' + a.id] = { a: a, list: [] })).list.push(st);
    });
    var H = function (st) { return hashOf('lux:' + st.id); };
    Object.keys(by).forEach(function (k) {
      var g = by[k], n = LUX_N[g.a.id] || 0, order = g.list.slice().sort(function (x, y) { return H(x) - H(y); });
      var pickd = order.filter(function (st) { return S.bldg[st.id].lux; }).concat(order.filter(function (st) { return !S.bldg[st.id].lux; })).slice(0, n);
      g.list.forEach(function (st) {
        var b = S.bldg[st.id], want = pickd.indexOf(st) >= 0;
        if (!!b.lux === want) return;
        S.mkt.seed = 1 + hashOf('bldg:' + st.id) % 0x7ffffffe;
        var nb = S.bldg[st.id] = relabel(st, b, want);
        nb.rooms.forEach(function (r) {
          var q = S.props[st.id + '#' + r.no];
          if (!q || q.own || !q.sale) return;
          var p = makeRoom(st, r);
          S.props[p.id] = p;
          priceIt(p);
          p.sale.at = q.sale.at; p.sale.until = q.sale.until;
        });
      });
    });
    S.mkt.seed = keep;
  }
  function bldgOf(st) {
    if (!S.bldg) S.bldg = {};
    return S.bldg[st.id] || (S.bldg[st.id] = makeBldg(st));
  }
  function roomsOf(st) {
    var b = bldgOf(st);
    return b.rooms.map(function (r) { return S.props[st.id + '#' + r.no] || null; });
  }
  function makeRoom(st, r) {
    var b = bldgOf(st), lay = LAYS[r.lay] || LAYS['1K'];
    var id = st.id + '#' + r.no;
    var p = { id: id, site: st.id, no: r.no, floor: r.floor, lay: r.lay, dist: st.room, area: st.areaIx || 0 };
    p.kind = r.lay === 'OF' ? 'office' : 'ku';
    p.walk = st.walk || (st.walk = rint(2, st.room === 'futako' || st.room === 'inzai' ? 15 : 10));
    p.areaMul = lay.area / E.KINDS[p.kind].area;
    p.layK = lay.k; p.stay = lay.stay; p.fee = roomFee(r.lay);
    if (lay.lux) p.lux = true;
    p.built = b.built; p.landA = 0;
    p.units = [{ occ: false, rent: 0, until: 0, sat: 0.8 }];
    var age = Math.max(0, curYear() - b.built), rc = rnd();
    p.cond = Math.max(0, Math.min(0.9, 0.06 + age * 0.011 + (rc - 0.4) * 0.3));
    p.insp = false; p.own = false; p.mgmt = 'co'; p.trouble = []; p.building = null; p.ctr = null; p.cparkLease = false;
    p.rentMul = 1; p.capAdd = (rnd() - 0.5) * 0.003; p.lastRev = null;
    var c0 = b.built0 == null ? p.cond : Math.max(0, Math.min(0.9, 0.06 + Math.max(0, curYear() - b.built0) * 0.011 + (rc - 0.4) * 0.3));
    var occP = Math.max(0.4, 0.92 - distOf(p).fill * (areaOf(p).fill || 1) * 0.05 - c0 * 0.2);
    if (rnd() < occP) { var u = p.units[0]; u.occ = true; u.rent = Math.round(unitRent(p) * (0.94 + rnd() * 0.1) / 500) * 500; u.until = S.fin.month + rint(3, lay.stay); u.sat = 0.7 + rnd() * 0.3; }
    return p;
  }
  function listRoom(st) {
    var b = bldgOf(st), free = b.rooms.filter(function (r) { var q = S.props[st.id + '#' + r.no]; return !(q && (q.own || q.sale)); });
    if (!free.length) return null;
    var r = free[rint(0, free.length - 1)], p = makeRoom(st, r);
    S.props[p.id] = p;
    priceIt(p);
    return p;
  }
  var ZONE = { n: [0.5, 0.18], s: [0.5, 0.82], w: [0.18, 0.5], e: [0.82, 0.5], c: [0.5, 0.5],
               ne: [0.8, 0.2], nw: [0.2, 0.2], se: [0.8, 0.8], sw: [0.2, 0.8] };
  function areaSpots() {
    var out = [], acc = {};
    sites().forEach(function (st) {
      var k = st.room + ':' + st.areaIx, e = acc[k] || (acc[k] = { dist: st.room, ix: st.areaIx, x: 0, y: 0, n: 0 });
      e.x += st.x + st.w / 2; e.y += st.y + st.h / 2; e.n++;
    });
    Object.keys(acc).forEach(function (k) {
      var e = acc[k], a = (E.AREAS[e.dist] || [])[e.ix];
      if (a && a.name && (E.AREAS[e.dist] || []).length > 1) out.push({ dist: e.dist, area: a, x: e.x / e.n, y: e.y / e.n });
    });
    return out;
  }
  function areaOf(p) { var as = E.AREAS[p.dist] || [{}]; return as[p.area || 0] || as[0]; }
  function distOf(p) { return E.DIST[p.dist] || E.DIST.futako; }
  function K_(p) { return E.KINDS[p.kind] || E.KINDS.land; }
  function useOf(p) { return K_(p).use; }
  function idx(dist) { return (S.mkt.idx[dist] || 1); }
  function rentIdx(dist) { return (S.mkt.ridx[dist] || 1); }
  function curYear() { return (S.fin.month - 1) / 12; }
  function ageOf(p) { return p.built == null ? 0 : Math.max(0, Math.floor(curYear() - p.built)); }
  function ageMul(age) { return Math.max(0.55, 1 - 0.011 * age); }
  function walkMul(w) { return 1.08 - 0.012 * w; }
  function unitsOf(p) { return p.units ? p.units.length : 0; }
  function spaces(p) { return Math.max(2, Math.floor((p.landA || 150) / (E.BUILDS[p.kind] ? E.BUILDS[p.kind].perSpace || 15 : 15))); }
  function unitRent(p) {
    var K = K_(p), d = distOf(p), a = areaOf(p);
    if (K.use === 'park') return Math.round(d.park * (a.rent || 1) * rentIdx(p.dist) * (p.rentMul || 1) / 500) * 500;
    if (!K.area) return 0;
    var r = K.area * (p.areaMul || 1) * d.rent * (a.rent || 1) * K.rentK * ageMul(ageOf(p)) * walkMul(p.walk || 8) *
            rentIdx(p.dist) * (p.rentMul || 1);
    if (K.use === 'office') r *= 0.6 + 0.6 * d.corp;
    if (p.layK) r *= p.layK;
    if (p.floor) r *= 1 + (p.lux ? LUX.floor : 0.008) * (p.floor - 1);
    if (p.lux) r *= LUX.rent;
    if (p.newUntil && S.fin.month < p.newUntil) r *= 1.08;
    if (p.upRent) r *= p.upRent;
    return Math.round(r / 1000) * 1000;
  }
  function cparkRev(p) { var a = areaOf(p); return Math.round(spaces(p) * distOf(p).busy * (a.rent || 1) * rentIdx(p.dist) * (p.upRev || 1)); }
  function washRev(p) { var a = areaOf(p); return Math.round(E.WASH.base * distOf(p).wash * Math.sqrt(a.rent || 1) * rentIdx(p.dist) * (p.upRev || 1)); }
  function washRamp(p) { return Math.min(1, 0.25 + 0.75 * ((S.fin.month - (p.openAt || S.fin.month)) / E.WASH.ramp)); }
  function rentFull(p, opt) {
    if (opt && opt.build) {
      var q = buildPlan(p, opt.build);
      return q ? q.revFull : 0;
    }
    var u = useOf(p);
    if (p.ctr === 'ground') return G.ops ? G.ops.groundRent(p) : 0;
    if (u === 'trunk') return G.ops ? Math.round(G.ops.trunkFull(p) * (1 - E.TRUNK.cost)) : 0;
    if (u === 'cpark') return p.cparkLease ? Math.round(cparkRev(p) * E.CPARK_LEASE) : Math.round(cparkRev(p) * (1 - E.CPARK_COST));
    if (u === 'wash') return Math.round(washRev(p) * (1 - E.WASH.cost));
    if (u === 'land') return 0;
    if (p.ctr === 'sub') return p.subRent || 0;
    return unitRent(p) * unitsOf(p);
  }
  function fixedYear(p, price) {
    var K = K_(p);
    var fee = feeMonth(p) * 12;
    var v = price != null ? price : value(p);
    var land = K.use === 'land' || K.use === 'park' || K.use === 'cpark';
    if (p.inh && G.inherit) return fee + G.inherit.propTax(p) + v * E.INSURE + G.inherit.upkeepYear(p);
    return fee + v * 0.6 * E.PROP_TAX * (land ? 1 : 0.5) + (land ? 0 : v * E.INSURE);
  }
  function capOf(p) {
    var d = distOf(p), K = K_(p), a = areaOf(p);
    var age = ageOf(p), r = S.rate ? S.rate.base - E.RATE_PATH[0][1] : 0;
    var add = K.use === 'park' || K.use === 'cpark' ? 0.01 : K.use === 'wash' ? 0.06 : K.use === 'trunk' ? 0.035 : 0;
    var sub = K.capSub ? K.capSub * Math.max(0, 1.6 - (d.dense || 1)) / 0.6 : 0;
    if (p.lux) sub += LUX.cap;
    var life = K.struct && K.struct !== 'eq' ? E.LIFE[K.struct] : 0;
    if (life) sub += age >= life ? 0.01 : age >= life - 5 ? 0.005 : 0;
    return d.cap + (a.cap || 0) + (K.capAdd || 0) + sub + add + Math.min(0.03, Math.max(0, age - 5) * 0.0011) * (p.lux ? LUX.ageK : K.ageK || 1) + r * E.CAP_RATE_BETA + (p.capAdd || 0);
  }
  function landValue(p) {
    var K = K_(p);
    var la = p.landA || K.landA || 0;
    if (p.kind === 'ku') la = K.area * (p.areaMul || 1) * 0.35;
    if (p.kind === 'office') la = K.area * 0.3;
    return la * distOf(p).land * (areaOf(p).land || 1) * (p.landK || 1) * (p.rebuildNo ? E.REBUILD_NO.land : 1) * idx(p.dist);
  }
  function floorK(p) {
    var F = E.FLOOR, k = p.kind;
    if (k === 'ku' || k === 'office') return F.ku;
    if (k === 'shop') return F.shop != null ? F.shop : F.occ;
    if (k === 'ko') {
      if (!(p.units || []).some(function (u) { return u.occ; })) return F.vacant;
      return (distOf(p).dense || 1) >= (F.occDense || 0) || F.occOut == null ? F.occ : F.occOut;
    }
    return F.bulk;
  }
  function floorBy(p) {
    var u = useOf(p);
    if (u !== 'home' && u !== 'office') return null;
    var full = rentFull(p) * 12, inc = full / capOf(p) * (1 + (idx(p.dist) - 1) * 0.5), fl = landValue(p) * floorK(p);
    if (inc >= fl) return null;
    var k = p.kind;
    if (k === 'ku' || k === 'office') return 'ku';
    if (k === 'shop') return 'shop';
    if (k === 'ko') return (p.units || []).some(function (u) { return u.occ; }) ? 'occ' : 'vacant';
    return 'bulk';
  }
  function rebuildNoSite(st) {
    var R = E.REBUILD_NO;
    return !!R && ((E.DIST[st.room] || {}).dense || 1) >= R.minDense && hashOf(st.id + ':rb') % 1000 < R.p * 1000;
  }
  function bldgValue(p) {
    var K = K_(p);
    if (!K.struct || K.struct === 'eq' || !K.area) return 0;
    var life = E.LIFE[K.struct], left = Math.max(0, 1 - ageOf(p) / life);
    return K.area * (p.areaMul || 1) * unitsOf(p) * 1.15 * E.BUILD_COST[K.struct] * left;
  }
  function value(p) {
    var u = useOf(p);
    if (u === 'land') return Math.max(500000, Math.round(landValue(p) * (p.ctr === 'ground' ? E.GROUND.value : 1) / 100000) * 100000);
    var full = rentFull(p) * 12;
    var noi = u === 'home' || u === 'office' ? full * 0.84 - feeMonth(p) * 12 : full * 0.9;
    var v = (u === 'home' || u === 'office' ? full / capOf(p) : noi / capOf(p)) * (1 + (idx(p.dist) - 1) * 0.5);
    var floor = landValue(p) * floorK(p);
    if (u === 'park' || u === 'cpark') v = Math.max(floor * 1.02, landValue(p) + noi * 2);
    if (u === 'wash') v = landValue(p) + Math.max(0, (p.bCost || 0) - (p.depDone || 0)) * 0.4 + noi * 6;
    if (u === 'trunk') v = Math.max(floor * 1.02, landValue(p) + noi * 4);
    v = Math.max(v, floor);
    if (p.insp || p.own) v -= repairEstimate(p) * 0.6;
    return Math.max(500000, Math.round(v / 100000) * 100000);
  }
  function collateral(p, opt) {
    if (opt && opt.build) {
      var q = buildPlan(p, opt.build);
      if (!q) return 0;
      return landValue(p) + q.cost * (q.kind === 'wash' || q.kind === 'cpark' || q.kind === 'trunk' ? 0.3 : 0.7);
    }
    var seki = landValue(p) + bldgValue(p);
    var sh = rentFull(p) * 12 * 0.8 / (capOf(p) + 0.01);
    return Math.round(Math.min(seki, sh || seki));
  }
  function repairEstimate(p) {
    var K = K_(p);
    if (!K.struct) return 0;
    var c = Math.max(0, (p.cond || 0) - 0.25);
    if (K.struct === 'eq') return Math.round(c * 9000000 / 10000) * 10000;
    return Math.round(c * K.area * (p.areaMul || 1) * Math.max(1, unitsOf(p)) * 60000 / 10000) * 10000;
  }
  function condLabel(p) {
    if (!K_(p).struct) return '—';
    if (!p.insp && !p.own) return T('est_condUnknown');
    var c = p.cond || 0;
    return T(c < 0.3 ? 'est_condGood' : c < 0.5 ? 'est_condMid' : c < 0.72 ? 'est_condBad' : 'est_condAwful');
  }
  function yields(p, price) {
    price = price || (p.sale ? p.sale.price : value(p));
    var u = useOf(p);
    var full = (u === 'home' || u === 'office' || u === 'park') ? rentFull(p) * 12 :
               u === 'cpark' ? cparkRev(p) * 12 : u === 'wash' ? washRev(p) * 12 :
               u === 'trunk' && G.ops ? G.ops.trunkFull(p) * 12 : p.ctr === 'ground' ? rentFull(p) * 12 : 0;
    var gross = full / price;
    var occ = u === 'cpark' || u === 'wash' ? 1 : 1 - Math.min(0.5, 0.06 * distOf(p).fill * (areaOf(p).fill || 1) * (K_(p).fillMul || 1));
    var opCost = u === 'cpark' ? full * E.CPARK_COST : u === 'wash' ? full * E.WASH.cost : full * occ * (p.mgmt === 'co' ? E.MGMT_FEE : 0) + full * 0.04;
    var cost = fixedYear(p, price) + opCost + (p.insp || p.own ? repairEstimate(p) / 5 : 0);
    var net = (full * occ - cost) / (price * (1 + E.BUY_COST));
    return { gross: gross, net: net, occ: occ };
  }
  function kindFor(site) {
    var v = site.variant || site.pv || 'apt', d = site.room, r = rnd(), D = E.DIST[d] || {};
    var big = (site.w || 3) * (site.h || 3) >= 12;
    if (site.pkind) return site.pkind;
    if (v === 'farm' || v === 'woods') return r < 0.45 ? 'land' : r < 0.8 ? 'ko' : 'apa';
    if (v === 'parking') return r < 0.4 ? 'land' : r < 0.75 ? 'park' : 'cpark';
    if (v === 'warehouse') return r < 0.5 ? 'land' : 'park';
    if (v === 'house' || v === 'shita_house') return r < 0.75 ? 'ko' : r < 0.9 ? 'apa' : 'land';
    if (v === 'shop' || v === 'shita_shop' || v === 'akiba_shop' || v === 'dept_store') return r < 0.55 ? 'shop' : r < 0.75 ? 'wash' : 'ku';
    if (v === 'office_tower') return r < 0.3 + D.corp * 0.5 ? 'ob' : r < 0.85 ? 'man' : 'office';
    if (v === 'old_bldg' || v === 'hotel') return r < D.corp * 0.6 ? 'office' : big && r < 0.75 ? 'man' : 'ku';
    if (v === 'apt' && (site.h || 0) >= 4) return r < D.corp * 0.25 ? 'ob' : r < 0.85 ? 'man' : 'apa';
    if (d === 'inzai' || d === 'futako') return r < 0.5 ? 'apa' : r < 0.75 ? 'ko' : r < 0.9 ? 'ku' : 'man';
    return r < 0.55 ? 'ku' : r < 0.82 ? 'apa' : 'man';
  }
  function makeProp(site) {
    var kind = kindFor(site), K = E.KINDS[kind];
    var p = S.props[site.id] || { id: site.id };
    p.id = site.id; p.dist = site.room; p.kind = kind; p.area = site.areaIx || 0;
    p.walk = rint(2, 15);
    if (p.dist === 'inzai' || p.dist === 'futako') p.walk = rint(5, 20);
    p.areaMul = kind === 'ku' ? pick([0.8, 1, 1, 1.2, 1.6]) : 1;
    var age = K.age[0] + Math.floor(Math.pow(rnd(), 1.2) * (K.age[1] - K.age[0] + 1));
    p.built = curYear() - age;
    var rL = K.landA ? rnd() : 0;
    p.landA = K.landA ? Math.round(K.landA * (0.8 + rL * 0.5)) : (K.use === 'park' || K.use === 'cpark' ? rint(120, 300) :
              K.use === 'wash' ? rint(80, 130) : 0);
    var dn = distOf(p).dense || 1;
    if (kind === 'ko' && dn > 1.2) p.landA = Math.round(p.landA * (dn >= 1.8 ? 0.6 : 0.8));
    if (kind === 'ko' && rebuildNoSite(site)) p.rebuildNo = true; else delete p.rebuildNo;
    var n = K.units, BK = E.BULK && E.BULK[kind];
    if (BK) {
      n = Math.min(BK.max, Math.round(rint(BK.units[0], BK.units[1]) * Math.min(BK.dnMax, dn)));
      var far = Math.max(BK.far[2], Math.min(BK.far[3], BK.far[0] + BK.far[1] * (dn - 1)));
      p.landA = Math.round(n * K.area * BK.floorK / far * (0.85 + rL * 0.3));
    }
    if (kind === 'ob') n = Math.max(3, Math.min(10, Math.round(rint(3, 5) * Math.min(2, dn))));
    if (K.use === 'park') n = spaces(p);
    p.units = [];
    for (var i = 0; i < n; i++) p.units.push({ occ: false, rent: 0, until: 0, sat: 0.8 });
    if (K.struct === 'eq') { p.machAge = rint(0, 8); p.cond = Math.min(0.9, p.machAge * 0.09 + rnd() * 0.15); p.openAt = S.fin.month - 24; }
    else if (K.struct) p.cond = Math.max(0, Math.min(0.95, 0.08 + age * 0.012 + (rnd() - 0.4) * 0.35));
    else p.cond = 0;
    p.insp = false; p.own = false; p.mgmt = 'co'; p.trouble = []; p.building = null; p.ctr = null; p.cparkLease = false;
    p.rentMul = 1; p.capAdd = (rnd() - 0.5) * 0.004; p.lastRev = null;
    var occP = Math.max(0.35, 0.92 - distOf(p).fill * (areaOf(p).fill || 1) * 0.06 * (K.fillMul || 1) - p.cond * 0.25);
    var base = unitRent(p);
    p.units.forEach(function (u) {
      if (rnd() < occP) {
        u.occ = true; u.rent = Math.round(base * (0.92 + rnd() * 0.12) / 500) * 500;
        u.until = S.fin.month + rint(3, K.stay); u.sat = 0.7 + rnd() * 0.3;
      }
    });
    return p;
  }
  function listProp(site, fresh) {
    if (site.condo) return listRoom(site) || roomsOf(site).filter(Boolean)[0] || null;
    if (S.props[site.id] && S.props[site.id].own) return S.props[site.id];
    var p = fresh || !S.props[site.id] ? makeProp(site) : S.props[site.id];
    S.props[site.id] = p;
    priceIt(p);
    return p;
  }
  function priceIt(p) {
    var v = value(p);
    var hiddenDisc = p.insp ? 0 : repairEstimate(p) * 0.35;
    var price = (v - hiddenDisc) * (0.9 + rnd() * 0.22);
    price = Math.max(500000, Math.round(price / 100000) * 100000);
    p.sale = { price: price, at: S.t, until: S.fin.month + rint(6, 14), mine: false };
    return p;
  }
  function marketMonth() {
    var m = S.mkt;
    Object.keys(E.DIST).forEach(function (d) {
      var D = E.DIST[d];
      m.idx[d] = Math.max(0.4, (m.idx[d] || 1) * (1 + D.grow / 12 + D.vol / Math.sqrt(12) * gauss() * 0.5 + (m.shock[d] || 0)));
      m.ridx[d] = Math.max(0.6, (m.ridx[d] || 1) * (1 + D.grow / 24 + 0.004 * gauss()));
      m.shock[d] = (m.shock[d] || 0) * 0.5;
    });
    var listed = 0;
    sites().forEach(function (st) {
      if (st.condo) {
        var on = 0;
        roomsOf(st).forEach(function (q) {
          if (!q || q.own || !q.sale || q.sale.mine) return;
          if (!q.sale.starter && !q.sale.deal && (S.fin.month >= q.sale.until || rnd() < 0.05)) { delete S.props[q.id]; }
          else { on++; listed++; }
        });
        if (on < 2 && rnd() < (G.roomOpen && !G.roomOpen(st.room) ? 0.05 : 0.12)) listRoom(st);
        return;
      }
      var p = S.props[st.id];
      if (p && p.own) return;
      if (p && p.sale && !p.sale.mine) {
        listed++;
        if (!p.sale.starter && !p.sale.deal && (S.fin.month >= p.sale.until || rnd() < 0.05)) {
          if (p.insp && S.fin.month < p.sale.until) G.toast(propPos(p), T('est_soldOther'), '#9a94ad');
          delete S.props[p.id];
        }
        return;
      }
      if (rnd() < (G.roomOpen && !G.roomOpen(st.room) ? 0.03 : 0.05)) listProp(st, true);
    });
    m.listed = listed;
  }
  function ownedList() { var o = []; Object.keys(S.props).forEach(function (k) { if (S.props[k].own) o.push(S.props[k]); }); return o; }
  function fillMonths(p) {
    var K = K_(p), d = distOf(p), a = areaOf(p);
    var m = d.fill * (a.fill || 1) * (K.fillMul || 1) * (1 + 1.6 * Math.max(0, (p.cond || 0) - 0.3));
    if (K.use === 'office') m /= 0.4 + d.corp;
    if (K.use === 'park') m *= 0.9;
    if (p.newUntil && S.fin.month < p.newUntil) m *= 0.5;
    if (p.mgmt === 'co') m *= 0.85;
    if (p.upFill) m *= p.upFill;
    if (p.lux) m *= LUX.fill;
    m *= Math.pow(p.rentMul || 1, 3);
    if (d.stud && S.mkt.campusGone) m *= 2.2;
    if (G.troubles) m *= G.troubles.slowMul(p.dist);
    return Math.max(0.4, m);
  }
  function propMonth(p) {
    if (p.stigma && S.fin.month >= p.stigma) { p.stigma = null; p.rentMul = 1; }
    if (p.building) { if (S.fin.month >= p.building.until) finishBuild(p); return; }
    if (p.inh && p.inh.mode === 'akiya' && G.inherit) { G.inherit.akiyaMonth(p); return; }
    var u = useOf(p);
    if (p.ctr === 'ground') { if (G.ops) G.ops.groundMonth(p); return; }
    if (u === 'land') return;
    if (u === 'cpark') cparkMonth(p);
    else if (u === 'wash') washMonth(p);
    else if (u === 'trunk') { if (G.ops) G.ops.trunkMonth(p); }
    else if (p.ctr === 'sub') subMonth(p);
    else if (p.ctr === 'stay') { if (G.ops) G.ops.stayMonth(p); }
    else unitsMonth(p);
    costsMonth(p);
    wearMonth(p);
    if (u === 'home' || u === 'office' || u === 'wash' || u === 'cpark') troubleMonth(p);
    p.got = (p.got || 0) + 1;
  }
  function unitsMonth(p) {
    var K = K_(p), rent = 0, base = unitRent(p), park = K.use === 'park';
    if (p.ctr === 'corp' && p.units.some(function (un) { return !un.occ; })) {
      p.ctr = null;
      G.banner(T('est_corpGap'), T('est_corpGapSub', { n: propName(p) }), '#e2504a', 'warn');
      G.emit('corpEnd', { p: p, gap: true });
    }
    if (p.ctr === 'corp' && S.fin.month >= p.ctrUntil) {
      if (rnd() < E.CORP.renew) {
        p.ctrUntil = S.fin.month + 12 * rint(E.CORP.years[0], E.CORP.years[1]);
        p.units.forEach(function (un) { un.until = p.ctrUntil; });
        G.banner(T('est_corpRenew'), propName(p), '#2fbf7a', 'good');
      } else {
        p.ctr = null;
        p.units.forEach(function (un) { if (un.occ) { un.occ = false; if (un.dep) { G.post(220, 100, un.dep, false); un.dep = 0; } } });
        G.post(511, 100, Math.round(base * E.RESTORE_MONTHS * 0.5 * unitsOf(p)), { k: 'restore', p: p.id });
        G.banner(T('est_corpEnd'), T('est_corpEndSub', { n: propName(p) }), '#e2504a', 'warn');
        G.emit('corpEnd', { p: p });
      }
    }
    p.units.forEach(function (un) {
      if (un.occ) {
        rent += un.rent;
        if (p.ctr === 'corp') return;
        if (S.fin.month >= un.until || rnd() < (1 - un.sat) * 0.03) {
          un.occ = false;
          if (!park) {
            var rc = Math.round(un.rent * E.RESTORE_MONTHS * (0.6 + (p.cond || 0)));
            G.post(511, 100, rc, { k: 'restore', p: p.id });
            G.toast(propPos(p), T('est_moveOut') + ' -¥' + fmt(rc), '#e2504a');
          }
          if (un.dep) { G.post(220, 100, un.dep, false); un.dep = 0; }
          G.emit('moveOut', { p: p });
        }
      } else if (p.ctr !== 'corp' && rnd() < 1 / fillMonths(p)) {
        moveIn(p, un, {});
      }
    });
    if (rent > 0) income(p, park ? 412 : 410, rent);
    if (p.mgmt === 'co' && rent > 0 && !park && p.ctr !== 'corp') G.post(510, 100, Math.round(rent * E.MGMT_FEE), false);
  }
  function moveIn(p, un, opt) { return inOwner(p, function () { return moveIn0(p, un, opt); }); }
  function moveIn0(p, un, opt) {
    var K = K_(p), park = K.use === 'park', base = unitRent(p);
    opt = opt || {};
    un.occ = true; un.rent = base; un.sat = opt.sat || 0.85;
    un.until = S.fin.month + Math.max(6, Math.round((p.stay || K.stay || 48) * (0.5 + rnd())));
    var ad = 0;
    if (!park) {
      ad = Math.round(base * E.AD_MONTHS * (K.use === 'office' ? 2 : 1));
      var key = distOf(p).fill * (areaOf(p).fill || 1) < 1.6 ? Math.round(base * E.KEY_MONEY) : 0;
      if (!opt.noAd) G.post(514, 100, ad, { k: 'ad', p: p.id });
      if (key) G.post(100, 411, key, { k: 'key', p: p.id });
      var dep = Math.round(base * (K.use === 'office' ? 6 : 1));
      un.dep = dep; G.post(100, 220, dep, false);
      if (!opt.quiet) G.toast(propPos(p), T('est_moveIn'), '#2fbf7a');
    }
    G.emit('moveIn', { p: p, self: !!opt.noAd });
    return opt.noAd ? ad : 0;
  }
  function manual(p) {
    var u = useOf(p);
    if (p.ctr === 'sub' || p.ctr === 'corp' || p.ctr === 'stay' || p.ctr === 'ground' || p.cparkLease) return false;
    if (u === 'trunk') return false;
    if (u === 'park') return false;
    if (u === 'cpark') return true;
    return p.mgmt === 'self';
  }
  function income(p, code, v) {
    if (!(v > 0)) return;
    inOwner(p, function () {
      if (manual(p)) {
        G.post(110, code, v, false);
        p.pend = (p.pend || 0) + v;
        G.emit('rentPend', { p: p, amount: v });
      } else {
        G.post(100, code, v, false);
        var q = propPos(p);
        G.emit('rentIn', { p: p, amount: v, x: q.x, y: q.y, co: p.owner === 'co' });
      }
    });
    firstRent(v);
  }
  function collect(id) {
    var p = S.props[id];
    if (!p || !(p.pend > 0)) return 0;
    var v = Math.round(p.pend);
    inOwner(p, function () { G.post(100, 110, v, { k: 'collect', p: p.id }); });
    p.pend = 0;
    S.mkt.collected = (S.mkt.collected || 0) + 1;
    var q = propPos(p);
    G.emit('rentCollect', { p: p, amount: v, x: q.x, y: q.y, co: p.owner === 'co' });
    if (p.owner === 'co') G.toast(q, T('est_collectCo', { v: fmt(v) }), '#2bb8d8');
    return v;
  }
  function firstRent(v) {
    if (S.mkt.firstRent) return;
    S.mkt.firstRent = true;
    G.banner(T('est_firstRent'), '+¥' + fmt(v), '#f5b21c', 'record');
    G.emit('firstRent', {});
  }
  function subMonth(p) {
    income(p, 410, p.subRent);
    if (S.fin.month >= p.subCutAt) {
      p.subCutAt = S.fin.month + E.SUB.cutEvery;
      var nr = Math.round(p.subRent * (1 - E.SUB.cut[0] - rnd() * (E.SUB.cut[1] - E.SUB.cut[0])) / 1000) * 1000;
      G.banner(T('est_subCut'), T('est_subCutSub', { n: propName(p), a: '¥' + fmt(p.subRent), b: '¥' + fmt(nr) }), '#e2504a', 'warn');
      p.subRent = nr;
    }
  }
  function cparkMonth(p) {
    var r;
    if (p.cparkLease) r = Math.round(cparkRev(p) * E.CPARK_LEASE);
    else {
      var ramp = Math.min(1, 0.5 + (S.fin.month - (p.openAt || 0)) / 6);
      var badTr = p.trouble.length ? 0.85 : 1;
      r = Math.round(cparkRev(p) * ramp * badTr * Math.max(0.4, 1 + gauss() * 0.15));
      G.post(518, 100, Math.round(r * E.CPARK_COST), false);
    }
    income(p, 412, r);
    p.lastRev = r;
  }
  function washMonth(p) {
    var badTr = Math.pow(0.85, p.trouble.length);
    var r = Math.round(washRev(p) * washRamp(p) * (0.65 + 0.35 * (1 - (p.cond || 0))) * badTr * Math.max(0.4, 1 + gauss() * E.WASH.vol));
    income(p, 413, r);
    G.post(518, 100, Math.round(r * E.WASH.cost), false);
    if (p.mgmt === 'co') G.post(510, 100, Math.round(r * E.WASH.mgmt), false);
    p.lastRev = r;
  }
  function costsMonth(p) {
    var K = K_(p);
    var fm = feeMonth(p);
    if (fm) G.post(p.kind === 'ku' || p.kind === 'office' ? 510 : 519, 100, fm, false);
    if (K.struct && K.struct !== 'eq') G.post(513, 100, Math.round(value(p) * E.INSURE / 12), false);
    if (p.depLeft > 0) {
      var dm = Math.min(Math.round(p.depYear / 12), (p.bCost || 0) - (p.depDone || 0) - (p.noDep || 0));
      if (dm > 0) { G.post(515, 139, dm, false); p.depDone = (p.depDone || 0) + dm; }
      p.depLeft -= 1 / 12;
    }
  }
  function wearMonth(p) {
    var K = K_(p);
    if (!K.struct) return;
    var eq = K.struct === 'eq';
    p.cond = Math.min(1, (p.cond || 0) + (eq ? 0.085 : 0.018 + ageOf(p) * 0.0004) * (p.upWear || 1) / 12);
    var n = Math.max(1, unitsOf(p) / 3);
    if (rnd() < Math.max(0, p.cond - 0.3) * (eq ? 0.10 : 0.025) * n) {
      var cost = eq ? Math.round((150000 + rnd() * 500000) * (0.5 + p.cond) / 10000) * 10000 :
                 Math.round((60000 + rnd() * 260000) * (0.5 + p.cond) * Math.max(1, unitsOf(p) / 4) / 10000) * 10000;
      G.post(511, 100, cost, { k: 'break', p: p.id });
      p.cond = Math.max(0, p.cond - 0.04);
      G.banner(T('est_breakdown'), T('est_breakdownSub', { n: propName(p), v: '¥' + fmt(cost) }), '#e2504a', 'warn');
      G.emit('breakdown', { p: p, cost: cost });
    }
    if (p.cond > 0.72 && !p.bigWarned) {
      p.bigWarned = true;
      if (eq) G.banner(T('est_washMachines'), propName(p), '#f2a63b', 'warn');
      G.emit('bigRepairDue', { p: p });
    }
  }
  var TR = {
    home:   { ko: ['leak', 'key', 'aircon', 'weed', 'late'], any: ['leak', 'key', 'noise', 'light', 'aircon', 'late'] },
    office: { any: ['leak', 'light', 'aircon', 'late'] },
    wash:   { any: ['coin', 'jam', 'lint', 'coin'] },
    cpark:  { any: ['ticket', 'weed'] },
    stay:   { any: ['key', 'noise', 'light', 'aircon'] }
  };
  var TR_COST = { leak: 30000, key: 15000, noise: 0, light: 5000, aircon: 60000, weed: 8000, late: 0, coin: 0, jam: 20000, lint: 0, ticket: 3000 };
  function troubleMonth(p) {
    var u = useOf(p);
    if (p.ctr === 'corp' || p.ctr === 'sub' || p.cparkLease) return;
    var stay = p.ctr === 'stay';
    var lists = stay ? TR.stay : TR[u] || TR.home, list = lists[p.kind] || lists.any;
    var occ = p.units.filter(function (x) { return x.occ; });
    var tries = u === 'wash' ? 2 : u === 'cpark' ? 1 : stay ? p.units.length : occ.length;
    var pr = u === 'wash' ? 0.35 : u === 'cpark' ? 0.12 : stay ? 0.15 : 0.05;
    for (var i = 0; i < tries; i++) {
      if (rnd() > pr) continue;
      var kind = pick(list), c = TR_COST[kind];
      if (p.mgmt === 'co') { if (c) G.post(511, 100, c, false); continue; }
      if (p.trouble.length < 3) p.trouble.push({ k: kind, at: S.fin.month, cost: c, u: occ.length ? p.units.indexOf(pick(occ)) : -1 });
    }
    p.trouble.forEach(function (tr) {
      if (S.fin.month - tr.at < 2) return;
      var un = p.units[tr.u];
      if (un) un.sat = Math.max(0.1, un.sat - 0.12);
      if (tr.k === 'late' && un && un.occ && !tr.lost) { tr.lost = true; G.post(511, 100, Math.round(un.rent * 0.5), { k: 'late', p: p.id }); }
    });
    p.units.forEach(function (un) { if (un.occ) un.sat = Math.min(1, un.sat + 0.01); });
  }
  function propTaxApril() {
    ownedList().forEach(function (p) { inOwner(p, function () { propTax1(p); }); });
  }
  function propTax1(p) {
    var u = useOf(p), land = u === 'land' || u === 'park' || u === 'cpark';
    var v = value(p) * 0.6 * E.PROP_TAX * (land ? 1 : 0.5);
    if (p.inh && G.inherit) { v = G.inherit.propTax(p); if (v > 0) G.post(akiya(p) ? 625 : 512, 100, Math.round(v), { k: 'propTax', p: p.id }); return; }
    if (v > 0) G.post(512, 100, Math.round(v), { k: 'propTax', p: p.id });
  }
  function akiya(p) { return !!(p && p.inh && p.inh.mode === 'akiya'); }
  function corpOffers() {
    var m = S.mkt;
    if (m.offer && S.fin.month > m.offer.until) m.offer = null;
    if (m.offer) return;
    var cands = ownedList().filter(function (p) {
      var K = K_(p);
      return !p.building && !p.ctr && !akiya(p) && (K.corpOk || K.use === 'office') &&
             rnd() < distOf(p).corp * (K.wholeLease ? 0.06 : 0.02) * (p.lux ? LUX.corp : 1);
    });
    if (!cands.length) return;
    var p = pick(cands), whole = !!K_(p).wholeLease, yrs = whole ? 10 : rint(E.CORP.years[0], E.CORP.years[1]);
    m.offer = { p: p.id, rent: Math.round(unitRent(p) * (whole ? 0.9 : E.CORP.rentK) / 1000) * 1000, years: yrs, until: S.fin.month + 2, whole: whole };
    G.banner(T(whole ? 'est_wholeOffer' : 'est_corpOffer'), T('est_corpOfferSub', { n: propName(p), v: '¥' + fmt(m.offer.rent * unitsOf(p)), y: yrs }), '#2bb8d8', 'new');
    G.emit('corpOffer', { p: p });
  }
  function acceptCorp() {
    var o = S.mkt.offer, p = o && S.props[o.p];
    if (!p || !p.own || p.ctr || akiya(p)) { S.mkt.offer = null; return false; }
    p.ctr = 'corp'; p.ctrUntil = S.fin.month + o.years * 12; p.trouble = [];
    inOwner(p, function () {
      p.units.forEach(function (un) {
        if (un.dep) { G.post(220, 100, un.dep, false); un.dep = 0; }
        un.occ = true; un.rent = o.rent; un.sat = 1; un.until = p.ctrUntil;
      });
    });
    S.mkt.offer = null;
    G.banner(T('est_corpStart'), propName(p), '#2fbf7a', 'good');
    G.emit('corpStart', { p: p });
    return true;
  }
  function declineCorp() { S.mkt.offer = null; }
  function subQuote(p) { return Math.round(unitRent(p) * unitsOf(p) * E.SUB.rentK / 1000) * 1000; }
  function startSub(id) {
    var p = S.props[id];
    if (!p || !p.own || p.ctr || !K_(p).subOk) return false;
    p.ctr = 'sub'; p.subRent = subQuote(p); p.subCutAt = S.fin.month + E.SUB.cutEvery; p.trouble = []; p.mgmt = 'co';
    G.banner(T('est_subStart'), propName(p) + ' ¥' + fmt(p.subRent), '#2bb8d8', 'good');
    G.emit('subStart', { p: p });
    return true;
  }
  function quitSub(id) {
    var p = S.props[id];
    if (!p || p.ctr !== 'sub') return false;
    var fee = p.subRent * E.SUB.quitMonths;
    if (cashFor(p) < fee) return false;
    inOwner(p, function () { G.post(517, 100, fee, { k: 'subQuit', p: p.id }); });
    p.ctr = null;
    G.banner(T('est_subQuit'), '-¥' + fmt(fee), '#f2a63b', 'warn');
    return true;
  }
  function setCparkLease(id, on) {
    var p = S.props[id];
    if (!p || p.kind !== 'cpark') return false;
    p.cparkLease = !!on; if (on) p.trouble = [];
    if (on) G.banner(T('est_cparkLease'), propName(p), '#2bb8d8', 'good');
    return true;
  }
  function revNow(p) {
    if (p.building) return 0;
    var u = useOf(p);
    if (p.ctr === 'ground') return rentFull(p);
    if (u === 'land') return 0;
    if (u === 'cpark' || u === 'wash' || u === 'trunk') return p.lastRev != null ? p.lastRev : rentFull(p);
    if (p.ctr === 'sub') return p.subRent;
    if (p.ctr === 'stay') return p.lastRev != null ? p.lastRev : 0;
    return p.units.reduce(function (a, un) { return a + (un.occ ? un.rent : 0); }, 0);
  }
  function rentNow() { return ownedList().reduce(function (t, p) { return t + revNow(p); }, 0); }
  function propCF(p) {
    var pay = G.loanPayOf ? G.loanPayOf(p.id) : 0;
    if (p.building) return -pay;
    var u = useOf(p), r = revNow(p), op = 0;
    if (u === 'cpark' && !p.cparkLease) op = r * E.CPARK_COST;
    if (u === 'wash') op = r * (E.WASH.cost + (p.mgmt === 'co' ? E.WASH.mgmt : 0));
    if (u === 'trunk') op = r * E.TRUNK.cost;
    if ((u === 'home' || u === 'office') && p.mgmt === 'co' && p.ctr !== 'sub' && p.ctr !== 'corp' && p.ctr !== 'stay') op = r * E.MGMT_FEE;
    if (p.ctr === 'stay') op = p.lastStayCost || 0;
    var rep = K_(p).struct ? r * (K_(p).struct === 'eq' ? 0.06 : 0.05) : 0;
    return r - op - rep - fixedYear(p) / 12 - pay;
  }
  function rentCF() {
    var fx = G.hojin ? G.hojin.fixedMonthly() : 0;
    return Math.round(ownedList().reduce(function (t, p) { return t + propCF(p); }, 0) - fx);
  }
  function propValue() { return ownedList().reduce(function (t, p) { return t + (p.building ? landValue(p) + p.building.cost : value(p)); }, 0); }
  function ownerOf(plan) { return plan && plan.owner === 'co' && G.hojin && G.hojin.on() ? 'co' : null; }
  function buyCost(p) { var pr = p.sale.price; return { price: pr, fees: Math.round(pr * E.BUY_COST) }; }
  function canBuy(p, plan) {
    if (!p || !p.sale || p.own) return { ok: false, why: '—' };
    if (p.sale.mad) return { ok: false, why: T('est_sellerMad') };
    var c = buyCost(p), loanAmt = plan && plan.loan ? plan.loan.amount : 0;
    if (plan && plan.loan) {
      var q = G.loanQuote(p, plan.loan.lender, { amount: loanAmt, kind: plan.loan.kind });
      if (!q.ok) return { ok: false, why: q.why[0] || '—', q: q };
      if (loanAmt > q.max) return { ok: false, why: '—', q: q };
      c.fees += q.fee;
    }
    var need = c.price + c.fees - loanAmt;
    if (cashFor(ownerOf(plan)) < need) return { ok: false, why: T('est_needCash', { v: '¥' + fmt(need) }), need: need };
    return { ok: true, need: need };
  }
  function buy(id, plan) {
    var p = S.props[id];
    var ck = canBuy(p, plan);
    if (!ck.ok) return ck;
    if (ownerOf(plan)) p.owner = 'co'; else delete p.owner;
    return inOwner(p, function () { return buy0(p, plan); });
  }
  function buy0(p, plan) {
    var c = buyCost(p), sale0 = p.sale;
    if (plan && plan.loan) G.borrow(p, plan.loan.lender, plan.loan.amount, plan.loan.kind, plan.loan.term);
    var lv = landValue(p), bv = bldgValue(p), u = useOf(p);
    var share = u === 'land' || u === 'park' || u === 'cpark' ? 0 :
                u === 'wash' ? Math.max(0.1, Math.min(0.6, 1 - lv / Math.max(1, c.price))) :
                Math.max(0.15, Math.min(0.75, bv / Math.max(1, lv + bv)));
    var tax = Math.round(c.price * 0.02), cap = c.fees - tax;
    var tot = c.price + cap;
    var bCost = Math.round(tot * share), lCost = tot - bCost;
    G.post(120, 100, lCost, { k: 'buy', p: p.id });
    if (bCost > 0) G.post(130, 100, bCost, { k: 'buy', p: p.id });
    G.post(512, 100, tax, { k: 'acqTax', p: p.id });
    p.own = true; p.sale = null; p.insp = true;
    p.buyAt = S.fin.month; p.buyYear = S.fin.year; p.buyPrice = c.price;
    p.lCost = lCost; p.bCost = bCost; p.depDone = 0;
    setDep(p);
    p.units.forEach(function (un) { if (un.occ && u !== 'park') { un.dep = un.rent; G.post(100, 220, un.rent, false); } });
    p.mgmt = 'co';
    S.mkt.bought = (S.mkt.bought || 0) + 1;
    G.banner(T('est_bought'), T('est_boughtSub', { n: propName(p), p: '¥' + fmt(c.price) }), '#2fbf7a', 'record');
    G.emit('propBought', { p: p, sale: sale0 });
    return { ok: true };
  }
  function setDep(p) {
    var K = K_(p);
    if (!K.struct || !p.bCost) { p.depYear = 0; p.depLeft = 0; return; }
    var life = E.LIFE[K.struct], age = K.struct === 'eq' ? (p.machAge || 0) : ageOf(p);
    var yrs = age >= life ? Math.floor(life * 0.2) : Math.floor(life - age + age * 0.2);
    yrs = Math.max(2, yrs);
    var left = Math.max(0, p.bCost - (p.depDone || 0) - (p.noDep || 0));
    p.depYears = yrs; p.depLeft = yrs; p.depYear = Math.round(left / yrs);
  }
  function listMine(id, mode) {
    var p = S.props[id];
    if (!p || !p.own || p.building) return false;
    var k = mode === 'fast' ? 0.92 : mode === 'high' ? 1.1 : 1;
    p.sale = { price: Math.round(value(p) * k / 100000) * 100000, at: S.t, mine: true, mode: mode || 'market' };
    G.emit('propListed', { p: p });
    return true;
  }
  function unlist(id) { var p = S.props[id]; if (p && p.own && p.sale) p.sale = null; }
  function sellNow(id) { var p = S.props[id]; if (p && p.own && p.sale) sell(p, p.sale.price); }
  function sellChance(p) { return p.sale.mode === 'fast' ? 0.9 : p.sale.mode === 'high' ? 0.18 : 0.45; }
  function sell(p, price, forced) { inOwner(p, function () { sell0(p, price, forced); }); }
  function sell0(p, price, forced) {
    collect(p.id);
    var fee = Math.round(price * E.SELL_FEE);
    var dd = p.depDone || 0, book = p.lCost + (p.bCost || 0) - dd;
    if (dd > 0) G.post(139, 130, dd, false);
    G.post(100, 120, p.lCost, false);
    if (p.bCost) G.post(100, 130, p.bCost - dd, false);
    var gain = price - fee - book;
    if (gain > 0) G.post(100, 690, gain, { k: 'sale', p: p.id });
    else if (gain < 0) G.post(691, 100, -gain, { k: 'sale', p: p.id });
    var paid = G.payOffProp ? G.payOffProp(p.id) : 0;
    p.units.forEach(function (un) { if (un.dep) { G.post(220, 100, un.dep, false); un.dep = 0; } });
    var long = S.fin.year - p.buyYear > E.LONG_YEARS, tg = gain, ti = null;
    if (p.inh && G.inherit) { ti = G.inherit.saleTax(p, price, fee); tg = ti.taxable; long = true; }
    var coSale = p.owner === 'co';
    if (coSale) long = false;
    else S.gains.push({ y: S.yr.n, gain: tg, long: long, p: p.id });
    G.banner(T(forced ? 'est_forced' : 'est_sold'), forced ? T('est_forcedSub', { n: propName(p) }) :
             ti ? T('ih_soldSub', { n: propName(p), v: '¥' + fmt(price), g: '¥' + fmt(Math.max(0, ti.taxable)), t: '¥' + fmt(ti.tax) }) :
             T('est_soldSub', { n: propName(p), v: '¥' + fmt(price), g: (gain < 0 ? '-¥' : '¥') + fmt(Math.abs(gain)) }),
             forced ? '#e2504a' : '#f5b21c', forced ? 'warn' : 'record');
    G.emit('propSold', { p: p, price: price, gain: gain, long: long, paid: paid, inh: ti, co: coSale });
    p.own = false; p.sale = null; p.insp = false; p.trouble = []; p.mgmt = 'co'; p.ctr = null; p.cparkLease = false; delete p.owner;
    if (S.mkt.offer && S.mkt.offer.p === p.id) S.mkt.offer = null;
    delete S.props[p.id];
    S.mkt.sold = (S.mkt.sold || 0) + 1;
  }
  function forceSale() {
    var all = ownedList().filter(function (p) { return !p.building; });
    var list = all.filter(function (p) { return p.owner !== 'co'; });
    if (!list.length) list = all;
    if (!list.length) return;
    list.sort(function (a, b) { return propCF(a) - propCF(b); });
    var p = list[0];
    sell(p, Math.round(value(p) * 0.8), true);
  }
  function setMgmt(id, m) { var p = S.props[id]; if (p && p.own && p.ctr !== 'sub') { p.mgmt = m === 'self' ? 'self' : 'co'; if (p.mgmt === 'co') p.trouble = []; } }
  function fixTrouble(id) {
    var p = S.props[id];
    if (!p || !p.trouble.length) return false;
    var tr = p.trouble.shift();
    if (tr.cost) inOwner(p, function () { G.post(511, 100, tr.cost, { k: 'fix', p: p.id }); });
    var un = p.units[tr.u];
    if (un) un.sat = Math.min(1, un.sat + 0.15);
    G.toast(propPos(p), T('est_fixed'), '#2fbf7a');
    G.emit('troubleFixed', { p: p, k: tr.k });
    return true;
  }
  function repairCost(p) {
    if (K_(p).struct === 'eq') return Math.round((p.cond || 0) * 9000000 / 100000) * 100000 + 1000000;
    return Math.round((repairEstimate(p) * 1.1 + 200000 * Math.max(1, unitsOf(p) / 4)) / 10000) * 10000;
  }
  function repair(id) {
    var p = S.props[id];
    if (!p || !p.own || p.building || !K_(p).struct) return false;
    var c = repairCost(p);
    if (cashFor(p) < c) return false;
    inOwner(p, function () { G.post(511, 100, c, { k: 'repair', p: p.id }); });
    p.cond = 0.15; p.bigWarned = false;
    if (K_(p).struct === 'eq') p.machAge = 0;
    p.units.forEach(function (un) { if (un.occ) un.sat = Math.min(1, un.sat + 0.1); });
    G.emit('repaired', { p: p, cost: c });
    return true;
  }
  function setRentMul(id, m) { var p = S.props[id]; if (p && p.own) p.rentMul = m; }
  function evictCost(p) {
    return p.units.reduce(function (t, un) { return t + (un.occ ? un.rent : 0); }, 0) * E.EVICT_MONTHS;
  }
  function evict(id) {
    var p = S.props[id];
    if (!p || !p.own || p.kind !== 'shop') return { ok: false };
    var c = evictCost(p);
    if (!(c > 0)) return { ok: true };
    if (cashFor(p) < c) return { ok: false, why: T('est_needCash', { v: '¥' + fmt(c) }) };
    inOwner(p, function () {
      G.post(519, 100, c, { k: 'evict', p: p.id });
      p.units.forEach(function (un) {
        if (!un.occ) return;
        un.occ = false; un.until = 0;
        if (un.dep) { G.post(220, 100, un.dep, false); un.dep = 0; }
      });
    });
    G.toast(propPos(p), T('est_evicted', { v: '¥' + fmt(c) }), '#f2a63b');
    G.emit('moveOut', { p: p });
    return { ok: true };
  }
  function buildPlan(p, what) {
    if (!p) return null;
    var B = E.BUILDS[what];
    if (!B) return null;
    var from = B.from || ['land'];
    if (from.indexOf(p.kind) < 0) return null;
    var la = p.landA || 150, d = distOf(p), a = areaOf(p);
    if (what === 'park' || what === 'cpark') {
      var n = Math.max(2, Math.floor(la / B.perSpace));
      var cost = B.cost + Math.round(la * B.perM2);
      var r1 = what === 'park' ? Math.round(d.park * (a.rent || 1) * rentIdx(p.dist) / 500) * 500 : 0;
      var rev = what === 'park' ? r1 * n : Math.round(n * d.busy * (a.rent || 1) * rentIdx(p.dist) * (1 - E.CPARK_COST));
      return { what: what, kind: B.kind, cost: cost, months: B.months, units: what === 'park' ? n : 0, spaces: n, rent: r1, revFull: rev };
    }
    if (what === 'trunk') {
      var boxes = Math.max(10, Math.floor(la / B.perBox));
      var tc = B.cost + boxes * B.boxCost;
      var tr = Math.round(boxes * E.TRUNK.box * d.rent * (a.rent || 1) * rentIdx(p.dist) / 100) * 100;
      return { what: what, kind: 'trunk', cost: tc, months: B.months, units: 0, boxes: boxes, rent: 0, revFull: Math.round(tr * E.TRUNK.max * (1 - E.TRUNK.cost)) };
    }
    if (what === 'ob') {
      if ((d.corp || 0) < (B.minCorp || 0)) return null;
      var KO = E.KINDS.ob, fl = Math.max(3, Math.min(10, Math.floor(la * (d.dense || 1) * 2.2 / KO.area)));
      var oc = Math.round(fl * KO.area * 1.15 * E.BUILD_COST.rc * 1.1 / 100000) * 100000;
      var or = Math.round(KO.area * d.rent * (a.rent || 1) * KO.rentK * walkMul(p.walk || 8) * rentIdx(p.dist) * (0.6 + 0.6 * d.corp) * 1.08 / 1000) * 1000;
      return { what: what, kind: 'ob', cost: oc, months: B.months, units: fl, rent: or, revFull: or * fl };
    }
    if (what === 'wash') {
      var wr = Math.round(E.WASH.base * d.wash * Math.sqrt(a.rent || 1) * rentIdx(p.dist) * (1 - E.WASH.cost));
      var wc = B.cost + (p.kind === 'land' ? 6000000 : 0);
      return { what: what, kind: 'wash', cost: wc, months: B.months, units: 0, rent: 0, revFull: wr };
    }
    var K = E.KINDS[B.kind];
    var units = B.units || Math.max(2, Math.min(12, Math.floor(la * B.unitsPerLand * Math.min(2, d.dense || 1))));
    var bc = Math.round(units * K.area * 1.15 * E.BUILD_COST[K.struct] * 1.05 / 100000) * 100000;
    var rent = Math.round(K.area * d.rent * (a.rent || 1) * K.rentK * walkMul(p.walk || 8) * rentIdx(p.dist) * 1.08 / 1000) * 1000;
    return { what: what, kind: B.kind, cost: bc, months: B.months, units: units, rent: rent, revFull: rent * units };
  }
  function startBuild(id, what, loan) { var p = S.props[id]; return inOwner(p, function () { return startBuild0(id, what, loan); }); }
  function startBuild0(id, what, loan) {
    var p = S.props[id];
    if (!p || !p.own || p.building) return { ok: false };
    var q = buildPlan(p, what);
    if (!q) return { ok: false };
    if (p.kind === 'shop' && p.units.some(function (un) { return un.occ; })) return { ok: false, why: T('est_shopBusy') };
    var amt = loan ? Math.min(loan.amount, q.cost) : 0;
    if (cashFor(p) + amt < q.cost) return { ok: false, why: T('est_needCash', { v: '¥' + fmt(q.cost - amt) }) };
    if (amt > 0) {
      var bo = { build: what, cost: q.cost, landNow: true };
      var qq = G.loanQuote(p, loan.lender, { amount: amt, kind: loan.kind, build: what, cost: q.cost, landNow: true });
      if (!qq.ok) return { ok: false, why: qq.why[0] };
      G.borrow(p, loan.lender, amt, loan.kind, loan.term, bo);
    }
    if (what === 'park') {
      G.post(511, 100, q.cost, { k: 'park', p: p.id });
      p.kind = 'park'; p.units = [];
      for (var i = 0; i < q.units; i++) p.units.push({ occ: false, rent: 0, until: 0, sat: 0.9 });
      p.newUntil = 0;
      G.banner(T('est_built'), T('est_builtSub', { n: propName(p) }), '#2fbf7a', 'record');
      G.emit('built', { p: p });
      return { ok: true };
    }
    G.post(160, 100, q.cost, { k: 'build', p: p.id });
    p.building = { what: what, kind: q.kind, until: S.fin.month + q.months, cost: q.cost, units: q.units, boxes: q.boxes || 0, at: S.fin.month };
    G.emit('buildStart', { p: p });
    return { ok: true };
  }
  function finishBuild(p) {
    var b = p.building;
    G.post(130, 160, b.cost, { k: 'built', p: p.id });
    p.kind = b.kind; p.units = [];
    var K = K_(p);
    if (K.struct === 'eq') { p.machAge = 0; p.openAt = S.fin.month; }
    else if (K.struct) p.built = curYear();
    p.cond = 0.02;
    for (var i = 0; i < b.units; i++) p.units.push({ occ: false, rent: 0, until: 0, sat: 0.9 });
    if (b.kind === 'cpark' || b.kind === 'trunk') p.openAt = S.fin.month;
    if (b.kind === 'trunk') p.boxes = b.boxes;
    p.bCost = (p.bCost || 0) + b.cost;
    p.newUntil = K.use === 'home' ? S.fin.month + 8 : 0;
    p.building = null;
    p.depDone = p.depDone || 0;
    setDep(p);
    G.banner(T(b.kind === 'wash' ? 'est_washOpen' : 'est_built'), T('est_builtSub', { n: propName(p) }), '#2fbf7a', 'record');
    G.emit('built', { p: p });
  }
  function propName(p) {
    var K = K_(p), a = areaOf(p);
    if (p.inh) return T('ih_name');
    if (p.site && S.bldg && S.bldg[p.site]) {
      var b = S.bldg[p.site];
      return (L.get() === 'en' ? b.name_en + ' #' + p.no : b.name + ' ' + p.no + '号室') + '（' + layName(p.lay) + '）';
    }
    var place = a && a.name ? nm(a) : '';
    return place + (L.get() === 'en' ? ' ' : 'の') + nm(K, 'short');
  }
  function propPos(p) {
    var st = siteOf(p);
    if (!st) return { x: S.player.x, y: S.player.y - 20 };
    return { x: (st.x + st.w / 2) * TILE, y: (st.y + st.h / 2) * TILE };
  }
  function occRate(p) {
    if (p.ctr === 'sub') return 1;
    if (!p.units || !p.units.length) return useOf(p) === 'land' ? 0 : 1;
    return p.units.filter(function (un) { return un.occ; }).length / p.units.length;
  }
  G.pad('prop', {
    build: function (pl) {
      if (sites().indexOf(pl) < 0) return [];
      return [{ x: pl.padX, y: pl.padY }];
    },
    active: function (pad, S) {
      if (pad.p.condo) return G.roomOpen(pad.p.room) && roomsOf(pad.p).some(function (q) { return q && (q.own || q.sale); });
      var p = S.props[pad.p.id];
      return !!(p && (p.own || p.sale)) && G.roomOpen(pad.p.room);
    },
    info: function (pad, S) {
      if (pad.p.condo) return condoInfo(pad.p);
      var p = S.props[pad.p.id];
      if (!p) return null;
      if (p.own && p.trouble.length) {
        var tr = p.trouble[0];
        return { label: T('est_tr_' + tr.k), sub: T('est_fix') + (tr.cost ? ' -¥' + fmt(tr.cost) : ''), can: true, hold: 0.9, col: '#e2504a' };
      }
      var vw = p.own && G.deals ? G.deals.viewInfo(p) : null;
      if (vw) return vw;
      if (p.own && p.pend > 0) return { label: T(useOf(p) === 'wash' || useOf(p) === 'cpark' ? 'est_collectBox' : 'est_collect'),
                                          sub: '+¥' + fmt(p.pend), gain: p.pend, can: true, hold: 0.5, col: '#f5b21c' };
      if (p.own) return { label: propName(p), sub: T('est_open'), can: true, hold: 0.3, quiet: true };
      var bk = G.deals ? G.deals.brokerInfo(p) : null;
      if (bk) return bk;
      var y = yields(p);
      var sub = '¥' + fmt(p.sale.price) + (y.gross > 0 ? '・' + (y.gross * 100).toFixed(1) + '%' : '');
      if (!p.insp) return { label: T('est_inspect'), sub: sub, can: true, hold: 1.0 };
      return { label: propName(p), sub: sub, can: true, hold: 0.3, quiet: true };
    },
    act: function (pad, S) {
      if (pad.p.condo) { condoAct(pad.p); return; }
      var p = S.props[pad.p.id];
      if (!p) return;
      if (p.own && p.trouble.length) { fixTrouble(p.id); return; }
      if (p.own && G.deals && G.deals.viewInfo(p)) { G.deals.attend(p.id); return; }
      if (p.own && p.pend > 0) { collect(p.id); return; }
      if (!p.own && G.deals && G.deals.brokerOf(p.id)) { G.deals.brokerAttend(p.id); return; }
      if (!p.own && !p.insp) {
        p.insp = true;
        S.mkt.inspected = (S.mkt.inspected || 0) + 1;
        G.toast(propPos(p), T('est_inspected'), '#6f57e0');
        G.emit('inspected', { p: p });
      }
      if (QT.UI && QT.UI.show) QT.UI.show('propsheet', p.id);
    }
  });
  function condoInfo(st) {
    var rs = roomsOf(st).filter(Boolean), mine = rs.filter(function (q) { return q.own; }), sale = rs.filter(function (q) { return q.sale && !q.own; });
    var tr = mine.filter(function (q) { return q.trouble.length; })[0];
    if (tr) return { label: T('est_tr_' + tr.trouble[0].k), sub: T('est_fix') + (tr.trouble[0].cost ? ' -¥' + fmt(tr.trouble[0].cost) : ''), can: true, hold: 0.9, col: '#e2504a' };
    for (var i = 0; i < mine.length && G.deals; i++) { var vw = G.deals.viewInfo(mine[i]); if (vw) return vw; }
    for (var j = 0; j < sale.length && G.deals; j++) { var bk = G.deals.brokerInfo(sale[j]); if (bk) return bk; }
    var pend = mine.reduce(function (t, q) { return t + (q.pend || 0); }, 0);
    if (pend > 0) return { label: T('est_collect'), sub: '+¥' + fmt(pend), gain: pend, can: true, hold: 0.5, col: '#f5b21c' };
    var b = bldgOf(st), sub = sale.length ? T('est_condoSale', { n: sale.length, p: '¥' + fmt(Math.min.apply(null, sale.map(function (q) { return q.sale.price; }))) }) :
              T('est_condoMine', { n: mine.length });
    var fresh = sale.some(function (q) { return !q.insp; });
    return { label: L.get() === 'en' ? b.name_en : b.name, sub: sub, can: true, hold: fresh ? 1.0 : 0.3, quiet: !fresh };
  }
  function condoAct(st) {
    var rs = roomsOf(st).filter(Boolean);
    var tr = rs.filter(function (q) { return q.own && q.trouble.length; })[0];
    if (tr) { fixTrouble(tr.id); return; }
    var vq = G.deals ? rs.filter(function (q) { return q.own && G.deals.viewInfo(q); })[0] : null;
    if (vq) { G.deals.attend(vq.id); return; }
    var bq = G.deals ? rs.filter(function (q) { return q.sale && !q.own && G.deals.brokerOf(q.id); })[0] : null;
    if (bq) { G.deals.brokerAttend(bq.id); return; }
    var got = 0;
    rs.forEach(function (q) { if (q.own && q.pend > 0) got += collect(q.id); });
    if (got) return;
    var seen = false;
    rs.forEach(function (q) { if (q.sale && !q.own && !q.insp) { q.insp = true; seen = true; } });
    if (seen) { S.mkt.inspected = (S.mkt.inspected || 0) + 1; G.toast(propPos(rs[0]), T('est_inspected'), '#6f57e0'); G.emit('inspected', {}); }
    if (QT.UI && QT.UI.show) QT.UI.show('bldgsheet', st.id);
  }
  G.alertHook(function (S, add) {
    ownedList().forEach(function (p) {
      var at = p.site || p.id;
      if (p.trouble.length) add(at, T('est_tr_' + p.trouble[0].k), '#e2504a', 'prop');
      else if (p.pend > 0) add(at, '+¥' + fmt(p.pend), '#f5b21c', 'prop');
    });
  });
  function ensureStarter() {
    if ((S.mkt.bought || 0) > 0) return;
    var cur = S.mkt.starter && S.props[S.mkt.starter];
    if (cur && cur.sale && !cur.own) return;
    var sx = W.START.x / TILE, sy = W.START.y / TILE, best = null, bd = Infinity;
    sites().forEach(function (st) {
      if (st.room !== 'futako') return;
      var q = S.props[st.id];
      if (q && q.own) return;
      if (st.condo && !roomsOf(st).some(function (x) { return !x || !x.own; })) return;
      var v = st.variant;
      if (v !== 'apt' && v !== 'house') return;
      var d = Math.abs(st.padX - sx) + Math.abs(st.padY - sy);
      if (d < bd) { bd = d; best = st; }
    });
    if (!best) return;
    var p = listProp(best, true);
    if (!p || p.own) return;
    if (best.condo) { p.lay = '1LDK'; p.layK = LAYS['1LDK'].k; p.areaMul = 1.6; p.stay = LAYS['1LDK'].stay; p.fee = roomFee('1LDK'); p.lux = false; }
    else p.areaMul = 1.3;
    p.kind = 'ku'; p.built = curYear() - 18; p.cond = 0.28; p.landA = 0; p.walk = 6;
    p.units = [{ occ: true, rent: 0, until: S.fin.month + 40, sat: 0.95 }];
    p.units[0].rent = unitRent(p);
    p.sale.price = Math.max(8000000, Math.min(10000000, Math.round(value(p) * 0.85 / 100000) * 100000));
    p.sale.until = S.fin.month + 9999; p.sale.starter = true;
    S.mkt.starter = p.id;
  }
  G.mod({
    id: 'estate', order: 40,
    reset: function (S) {
      S.props = {}; S.gains = []; S.bldg = {};
      S.mkt = { seed: 4242, idx: {}, ridx: {}, shock: {}, listed: 0, firstRent: false, bought: 0, sold: 0, inspected: 0, offer: null };
      Object.keys(E.DIST).forEach(function (d) { S.mkt.idx[d] = 1; S.mkt.ridx[d] = 1; });
      sites().forEach(function (st) {
        if (st.condo) { bldgOf(st); for (var i = rint(1, 2); i > 0; i--) listRoom(st); }
        else if (rnd() < 0.45) listProp(st, true);
      });
      reLux();
      ensureStarter();
    },
    update: function (S, dt) {
      ownedList().forEach(function (p) {
        if (p.sale && p.sale.mine && rnd() < sellChance(p) * dt / W.MONTH) sell(p, p.sale.price);
      });
    },
    save: function (S) { return { props: S.props, gains: S.gains, mkt: S.mkt, bldg: S.bldg }; },
    load: function (S, o) {
      if (o.props) S.props = o.props;
      S.bldg = o.bldg || {};
      S.gains = o.gains || [];
      if (o.mkt) S.mkt = o.mkt;
    }
  });
  G.on('monthEndPre', function () {
    ownedList().forEach(function (p) { inOwner(p, function () { propMonth(p); }); });
    if (((S.fin.month - 1) % 12) + 1 === 4) propTaxApril();
  });
  G.on('monthEnd', function () { marketMonth(); corpOffers(); ensureStarter(); });
  G.on('forceSale', forceSale);
  Object.assign(G, {
    rentNow: rentNow, rentCF: rentCF, rentFull: rentFull, propValue: propValue, collateral: collateral,
    estate: {
      sites: sites, owned: ownedList, value: value, unitRent: unitRent, yields: yields, capOf: capOf, cond: condLabel,
      repairEstimate: repairEstimate, repairCost: repairCost, repair: repair, buy: buy, canBuy: canBuy, buyCost: buyCost,
      list: listMine, unlist: unlist, setMgmt: setMgmt, fixTrouble: fixTrouble, setRentMul: setRentMul,
      buildPlan: buildPlan, startBuild: startBuild, name: propName, pos: propPos, occ: occRate, cf: propCF, rev: revNow,
      landValue: landValue, fixedYear: fixedYear, ageOf: ageOf, fillMonths: fillMonths, forceSale: forceSale,
      areaOf: areaOf, areaSpots: areaSpots, useOf: useOf, spaces: spaces, cparkRev: cparkRev, washRev: washRev,
      acceptCorp: acceptCorp, declineCorp: declineCorp, subQuote: subQuote, startSub: startSub, quitSub: quitSub,
      setCparkLease: setCparkLease, listProp: listProp, rnd: rnd, collect: collect, manual: manual,
      bldgOf: bldgOf, roomsOf: roomsOf, siteOf: siteOf, LAYS: LAYS, sellNow: sellNow,
      moveIn: moveIn, setDep: setDep, listRoom: listRoom, priceIt: priceIt, unitsOf: unitsOf, layName: layName, feeMonth: feeMonth,
      evict: evict, evictCost: evictCost, income: income, rentIdx: rentIdx, distOf: distOf, fillMonths: fillMonths,
      akiya: akiya, sellChance: sellChance, own: inOwner, cashFor: cashFor, floorK: floorK, floorBy: floorBy, reLux: reLux
    }
  });
})(window.QT);
