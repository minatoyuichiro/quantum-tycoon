(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE, W = QT.World;
  function T(k, v) { return L.t(k, v); }
  function fmt(n) { return G.fmt(n); }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + fmt(Math.abs(Math.round(v))); }
  L.add({
    dl_viewNew:   ['内見の予約!', 'VIEWING BOOKED!'],
    dl_viewNewS:  ['{n} に{w}。{s}秒のうちに行って案内すると決まりやすい（広告料も要らない）', '{w} wants to see {n}. Show them round within {s}s'],
    dl_viewL:     ['内見を案内する（{w}）', 'Show {w} round'],
    dl_viewS:     ['決まりやすく、広告料も要らない', 'Better odds, no agent ad fee'],
    dl_wantHas:   ['希望の「{u}」あり', 'Has the {u} they want'],
    dl_wantNo:    ['希望は「{u}」（無い）', 'They want {u} (missing)'],
    dl_won:       ['成約!', 'SIGNED!'],
    dl_wonS:      ['{w}が{n}に決めた。広告料 {v} が浮いた', '{w} signed for {n}. Saved {v} in ad fees'],
    dl_lost:      ['「もう少し考えます」…', '"We\'ll think about it..."'],
    dl_coWon:     ['管理会社の案内で決まった', 'The agent found you a tenant'],
    dl_gone:      ['内見の人は帰ってしまった', 'The viewer left'],
    dl_dealNew:   ['掘り出し物!', 'BARGAIN!'],
    dl_dealNewS:  ['{n} が相場の約{k}割で出た（{r}）。早い者勝ち', '{n} is out at ~{k}0% of market ({r}). First come, first served'],
    dl_dealGone:  ['掘り出し物は、ほかの投資家が買っていった', 'Another investor snapped up the bargain'],
    dl_dealGot:   ['掘り出し物を手に入れた!', 'YOU GOT THE BARGAIN!'],
    dl_r_inherit: ['相続で早く現金にしたい', 'heirs want cash fast'],
    dl_r_nini:    ['ローンが払えず任意売却', 'distressed sale'],
    dl_r_move:    ['転勤で急いで売りたい', 'owner relocating'],
    dl_r_corp:    ['会社が決算の前に手放したい', 'company selling before year end'],
    dl_r_old:     ['高齢の大家さんが手放したい', 'elderly landlord retiring'],
    dl_negoOk:    ['指値が通った! {a} → {b}', 'Offer accepted! {a} → {b}'],
    dl_negoCtr:   ['売り主から返事: 「{p}%引きなら」 {a} → {b}', 'Counter-offer: {p}% off. {a} → {b}'],
    dl_negoNg:    ['指値は断られた（言い値なら買える）', 'Offer refused (you can still pay the asking price)'],
    dl_negoMad:   ['売り主が怒って、売るのをやめてしまった', 'The seller took offence and withdrew'],
    dl_upDone:    ['バリューアップ: {u}', 'Upgrade: {u}'],
    dl_upDoneS:   ['{n}。家賃は次の入居者から上がる', '{n}. Rent rises from the next tenant'],
    up_wall:      ['壁紙・床の張り替え', 'New wallpaper & floors'],
    up_water:     ['水回りの入れ替え（キッチン・浴室）', 'New kitchen & bathroom'],
    up_wifi:      ['インターネット無料', 'Free internet'],
    up_pet:       ['ペット可にする', 'Allow pets'],
    up_box:       ['宅配ボックス', 'Parcel lockers'],
    up_lock:      ['オートロック・防犯カメラ', 'Auto-lock & cameras'],
    up_cash:      ['キャッシュレス決済', 'Cashless payment'],
    w_new:        ['新社会人', 'a new graduate'],
    w_couple:     ['ご夫婦', 'a couple'],
    w_move:       ['転勤の方', 'a transferee'],
    w_student:    ['学生さん', 'a student'],
    w_remote:     ['在宅勤務の方', 'a remote worker'],
    w_pet:        ['犬を飼っている方', 'a dog owner'],
    w_single:     ['一人暮らしの女性', 'a woman living alone'],
    w_family:     ['子育ての家族', 'a young family'],
    w_corp:       ['会社の担当者', 'a company rep'],
    w_startup:    ['スタートアップの社長', 'a startup founder'],
    bk_new:       ['仲介の依頼!', 'BROKERAGE CLIENT!'],
    bk_newS:      ['{w}が {n} を見たいそうです。{s}秒のうちに案内すると、成約で手数料 約{v}', '{w} wants to see {n}. Show them round within {s}s for a fee of about {v}'],
    bk_label:     ['仲介: お客さんを案内（{w}）', 'Broker: show {w} round'],
    bk_sub:       ['成約で手数料 約{v}（{s}s）', 'Fee about {v} if they buy ({s}s)'],
    bk_won:       ['仲介 成約!', 'DEAL CLOSED!'],
    bk_wonS:      ['{w}が {n} を買った。仲介手数料 +{v}', '{w} bought {n}. Brokerage fee +{v}'],
    bk_lost:      ['「今回は見送ります」', '"We\'ll pass this time"'],
    bk_gone:      ['仲介のお客さんは帰ってしまった', 'Your client left'],
    bw_inv:       ['投資家の方', 'an investor'],
    bw_couple:    ['若いご夫婦', 'a young couple'],
    bw_boss:      ['会社の社長', 'a company owner'],
    bw_move:      ['転勤の方', 'a transferee'],
    bw_heir:      ['相続対策の方', 'an inheritance planner']
  });
  function rnd() { var d = S.deals; d.seed = (d.seed * 1103515245 + 12345) & 0x7fffffff; return d.seed / 0x7fffffff; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function Es() { return G.estate; }
  function K_(p) { return E.KINDS[p.kind] || {}; }
  function vacant(p) { return (p.units || []).filter(function (un) { return !un.occ; })[0] || null; }
  var UPS = {
    wall:  { per: 'unit', m2: 6000, rent: 0.03, fill: 0.92, cond: 0.06, exp: true, uses: ['home', 'office'] },
    water: { per: 'unit', m2: 28000, rent: 0.06, fill: 0.88, cond: 0.08, uses: ['home'] },
    wifi:  { per: 'unit', fixed: 30000, monthly: 1500, rent: 0.025, fill: 0.88, uses: ['home', 'office'] },
    pet:   { per: 'unit', fixed: 100000, rent: 0.04, fill: 0.78, wear: 1.3, kinds: ['ko', 'apa'] },
    box:   { per: 'bldg', fixed: 350000, rent: 0.01, fill: 0.9, kinds: ['apa', 'man'] },
    lock:  { per: 'bldg', fixed: 900000, perUnit: 50000, rent: 0.03, fill: 0.9, kinds: ['apa', 'man'] },
    cash:  { per: 'bldg', fixed: 600000, rev: 0.08, uses: ['cpark', 'wash'] }
  };
  var UP_IDS = ['wall', 'water', 'wifi', 'pet', 'box', 'lock', 'cash'];
  function upOk(p, id) {
    var U = UPS[id];
    if (!U || !p || !p.own || p.building) return false;
    if (p.ctr === 'sub' || p.ctr === 'corp') return false;
    if (Es().akiya(p)) return false;
    if (U.kinds) return U.kinds.indexOf(p.kind) >= 0;
    return U.uses.indexOf(Es().useOf(p)) >= 0;
  }
  function upCost(p, id) {
    var U = UPS[id], K = K_(p), n = Math.max(1, Es().unitsOf(p));
    if (U.per === 'bldg') return Math.round((U.fixed + (U.perUnit || 0) * n) / 10000) * 10000;
    var one = U.m2 ? (K.area || 25) * (p.areaMul || 1) * U.m2 : U.fixed;
    return Math.round(one * n / 10000) * 10000;
  }
  function upList(p) { return UP_IDS.filter(function (id) { return upOk(p, id); }); }
  function has(p, id) { return !!(p.ups && p.ups[id] != null); }
  function applyUps(p) {
    var r = 1, f = 1, v = 1, w = 1;
    Object.keys(p.ups || {}).forEach(function (id) {
      var U = UPS[id];
      if (!U) return;
      r *= 1 + (U.rent || 0); f *= U.fill || 1; v *= 1 + (U.rev || 0); w *= U.wear || 1;
    });
    p.upRent = r; p.upFill = f; p.upRev = v; p.upWear = w;
  }
  function doUp(pid, id) {
    var p = S.props[pid];
    if (!upOk(p, id) || has(p, id)) return { ok: false };
    var c = upCost(p, id), U = UPS[id];
    if (Es().cashFor(p) < c) return { ok: false, why: T('est_needCash', { v: yen(c) }) };
    Es().own(p, function () {
      if (U.exp) G.post(511, 100, c, { k: 'up', p: p.id });
      else {
        G.post(130, 100, c, { k: 'up', p: p.id });
        p.bCost = (p.bCost || 0) + c;
        Es().setDep(p);
      }
    });
    (p.ups || (p.ups = {}))[id] = S.fin.month;
    if (U.cond) p.cond = Math.max(0.02, (p.cond || 0) - U.cond);
    applyUps(p);
    p.units.forEach(function (un) { if (un.occ) un.sat = Math.min(1, un.sat + 0.08); });
    S.deals.n.up++;
    G.banner(T('dl_upDone', { u: T('up_' + id) }), T('dl_upDoneS', { n: Es().name(p) }), '#2bb8d8', 'good');
    G.emit('valueUp', { p: p, id: id, cost: c });
    return { ok: true };
  }
  function upMonthly() {
    Es().owned().forEach(function (p) {
      if (!p.ups) return;
      Object.keys(p.ups).forEach(function (id) {
        var U = UPS[id];
        if (U && U.monthly) Es().own(p, function () { G.post(518, 100, U.monthly * Math.max(1, Es().unitsOf(p)), false); });
      });
    });
  }
  var VIEW_SEC = 45, VIEW_P = 0.55, VIEW_MAX = 2;
  var WHO_HOME = [['new', null], ['couple', 'water'], ['move', null], ['student', 'wifi'], ['remote', 'wifi'],
                  ['pet', 'pet'], ['single', 'lock'], ['family', 'box']];
  var WHO_OFFICE = [['corp', 'wall'], ['startup', 'wifi'], ['corp', null]];
  function viewOf(id) { return S.deals.views.filter(function (v) { return v.p === id; })[0] || null; }
  function viewLeft(v) { return Math.max(0, v.until - S.t); }
  function viewInfo(p) {
    var v = viewOf(p.id);
    if (!v || !vacant(p)) return null;
    var sub = T('dl_viewS');
    if (v.want) sub = T(has(p, v.want) ? 'dl_wantHas' : 'dl_wantNo', { u: T('up_' + v.want) }) + '・' + sub;
    return { label: T('dl_viewL', { w: T('w_' + v.who) }), sub: sub + '（' + Math.ceil(viewLeft(v)) + 's）', can: true, hold: 1.0, col: '#6f57e0' };
  }
  function viewChance(p, v) {
    var c = 0.8 - 0.6 * Math.max(0, (p.cond || 0) - 0.4) - ((p.rentMul || 1) - 1) * 2.5;
    if (v.want) c += has(p, v.want) ? 0.15 : -0.2;
    if (p.stigma) c -= 0.25;
    return Math.max(0.1, Math.min(0.97, c));
  }
  function endView(v) { S.deals.views = S.deals.views.filter(function (x) { return x !== v; }); }
  function attend(id) {
    var p = S.props[id], v = viewOf(id), un = p && vacant(p);
    if (!v) return false;
    endView(v);
    if (!un) return false;
    var pos = Es().pos(p);
    if (rnd() < viewChance(p, v)) {
      var saved = Es().moveIn(p, un, { noAd: true, sat: 0.95, quiet: true });
      S.deals.n.view++;
      G.banner(T('dl_won'), T('dl_wonS', { w: T('w_' + v.who), n: Es().name(p), v: yen(saved) }), '#6f57e0', 'good');
      G.toast({ x: pos.x, y: pos.y - 26 }, T('dl_won'), '#6f57e0', { big: true });
      G.emit('dealWin', { kind: 'view', p: p, saved: saved });
      G.emit('drama', { kind: 'chance', hits: [{ p: p, v: 0 }] });
      return true;
    }
    G.toast({ x: pos.x, y: pos.y - 26 }, T('dl_lost'), '#9a94ad', { big: true });
    G.emit('dealLose', { kind: 'view', p: p });
    return false;
  }
  function viewsMonth() {
    var d = S.deals;
    d.views = d.views.filter(function (v) { var p = S.props[v.p]; return p && p.own && vacant(p); });
    if (d.views.length >= VIEW_MAX) return;
    var cands = Es().owned().filter(function (p) {
      var u = Es().useOf(p);
      return (u === 'home' || u === 'office') && !p.building && p.ctr !== 'corp' && p.ctr !== 'sub' && !Es().akiya(p) && vacant(p) && !viewOf(p.id);
    });
    cands.forEach(function (p) {
      if (d.views.length >= VIEW_MAX || rnd() > VIEW_P) return;
      var office = Es().useOf(p) === 'office';
      var whoL = (office ? WHO_OFFICE : WHO_HOME).filter(function (w) { return !w[1] || upOk(p, w[1]) || has(p, w[1]); });
      var w = pick(whoL);
      var v = { p: p.id, who: w[0], want: w[1], at: S.t, until: S.t + VIEW_SEC };
      d.views.push(v);
      d.nView = (d.nView || 0) + 1;
      var sub = T('dl_viewNewS', { n: Es().name(p), w: T('w_' + v.who), s: VIEW_SEC });
      if (d.nView <= 3) G.banner(T('dl_viewNew'), sub, '#6f57e0', 'new');
      else G.toast({ x: S.player.x, y: S.player.y - 30 }, T('dl_viewNew'), '#6f57e0', { big: true });
      G.emit('viewNew', { p: p, v: v });
    });
  }
  function viewsTick() {
    var d = S.deals;
    d.views.slice().forEach(function (v) {
      if (S.t < v.until) return;
      endView(v);
      var p = S.props[v.p], un = p && p.own && vacant(p);
      if (!un) return;
      var pos = Es().pos(p);
      if (p.mgmt === 'co' && rnd() < 0.4) {
        Es().moveIn(p, un, { quiet: true });
        G.toast({ x: pos.x, y: pos.y - 26 }, T('dl_coWon'), '#2fbf7a');
      } else G.toast({ x: pos.x, y: pos.y - 26 }, T('dl_gone'), '#9a94ad');
    });
  }
  var DEAL_SEC = 60, DEAL_P = 0.2;
  var REASONS = ['inherit', 'nini', 'move', 'corp', 'old'];
  function dealsMonth() {
    var d = S.deals;
    if (d.deal || S.fin.month < 3 || !(S.mkt.bought >= 1) || rnd() > DEAL_P * W.MONTH / 30) return;
    var reach = S.coins * 5 + 5000000;
    var cand = Es().sites().filter(function (st) {
      if (!G.roomOpen(st.room)) return false;
      if (st.condo) return true;
      var q = S.props[st.id];
      return !(q && (q.own || q.sale));
    });
    for (var tries = 0; tries < 8 && cand.length; tries++) {
      var st = cand.splice(Math.floor(rnd() * cand.length), 1)[0];
      var p = st.condo ? Es().listRoom(st) : Es().listProp(st, true);
      if (!p || p.own || !p.sale) continue;
      if (Es().useOf(p) === 'land') { if (!st.condo) delete S.props[p.id]; continue; }
      var wake = (K_(p).struct && K_(p).struct !== 'eq') && rnd() < 0.3;
      if (wake) p.cond = Math.max(p.cond || 0, 0.66 + rnd() * 0.2);
      var k = 0.7 + rnd() * 0.1, price = Math.max(500000, Math.round(Es().value(p) * k / 100000) * 100000);
      if (price * 1.07 > reach) { delete S.props[p.id]; continue; }
      var why = pick(REASONS);
      p.sale.price = price; p.sale.deal = why; p.sale.until = S.fin.month + 3;
      d.deal = { p: p.id, at: S.t, until: S.t + DEAL_SEC, why: why, k: k };
      G.banner(T('dl_dealNew'), T('dl_dealNewS', { n: Es().name(p), k: Math.round(k * 10), r: T('dl_r_' + why) }), '#e2508a', 'new');
      G.emit('drama', { kind: 'chance', hits: [{ p: p, v: 0 }] });
      G.emit('dealNew', { p: p });
      return;
    }
  }
  function dealTick() {
    var d = S.deals, o = d.deal;
    if (!o) return;
    var p = S.props[o.p];
    if (p && p.own) { d.deal = null; return; }
    if (!p || !p.sale) { d.deal = null; return; }
    if (S.t < o.until) return;
    d.deal = null;
    delete S.props[p.id];
    G.toast({ x: S.player.x, y: S.player.y - 30 }, T('dl_dealGone'), '#9a94ad', { big: true });
    G.emit('dealGone', {});
  }
  G.on('propBought', function (e) {
    var o = S.deals && S.deals.deal;
    if (!o || !e.p || e.p.id !== o.p) return;
    S.deals.deal = null; S.deals.n.deal++;
    G.banner(T('dl_dealGot'), Es().name(e.p), '#e2508a', 'record');
    G.emit('dealWin', { kind: 'deal', p: e.p });
  });
  var NEGO = { 5: 0.7, 10: 0.42, 15: 0.18 };
  function negoChance(p, pct) {
    if (!p || !p.sale || p.own || p.sale.mine) return 0;
    var c = NEGO[pct] || 0;
    var months = (S.t - (p.sale.at || S.t)) / W.MONTH;
    c += Math.min(0.25, months * 0.03);
    var v = Es().value(p);
    if (v > 0) c += Math.max(-0.2, Math.min(0.2, (p.sale.price / v - 1) * 2));
    if (p.insp && (p.cond || 0) > 0.5) c += 0.1;
    if (p.sale.deal) c *= 0.3;
    return Math.max(0.02, Math.min(0.95, c));
  }
  function nego(id, pct) {
    var p = S.props[id];
    if (!p || !p.sale || p.own || p.sale.mine || p.sale.nego) return null;
    var a = p.sale.price, r = { a: a, b: a, pct: pct };
    function cut(k) { return Math.max(500000, Math.round(a * (1 - k / 100) / 100000) * 100000); }
    if (rnd() < negoChance(p, pct)) { r.res = 'ok'; r.b = cut(pct); }
    else if (pct > 5 && rnd() < 0.5) { r.res = 'counter'; r.c = Math.floor(pct / 2); r.b = cut(r.c); }
    else if (pct >= 15 && !p.sale.starter && !p.sale.deal && rnd() < 0.25) r.res = 'mad';
    else r.res = 'ng';
    p.sale.price = r.b;
    p.sale.nego = { pct: pct, res: r.res, c: r.c || 0, a: a, b: r.b };
    S.deals.n.nego++;
    if (r.res === 'mad') {
      p.sale.until = S.fin.month;
      p.sale.mad = true;
    }
    G.emit('nego', { p: p, r: r });
    return r;
  }
  function negoText(p) {
    var n = p && p.sale && p.sale.nego;
    if (!n) return null;
    if (n.res === 'ok') return { s: T('dl_negoOk', { a: yen(n.a), b: yen(n.b) }), good: true };
    if (n.res === 'counter') return { s: T('dl_negoCtr', { p: n.c, a: yen(n.a), b: yen(n.b) }), good: true };
    if (n.res === 'mad') return { s: T('dl_negoMad'), good: false };
    return { s: T('dl_negoNg'), good: false };
  }
  var BROKER_SEC = 45, BROKER_P = 0.2, BUYERS = ['inv', 'couple', 'boss', 'move', 'heir'];
  function isBiz() { return !!(S.life && S.life.biz && !S.life.retired); }
  function brokerFee(p) { return Math.round((p.sale.price * 0.03 + 60000) / 1000) * 1000; }
  function brokerOf(id) { var b = S.deals.broker; return b && b.p === id ? b : null; }
  function brokerLeft() { var b = S.deals.broker; return b ? Math.max(0, b.until - S.t) : 0; }
  function brokerInfo(p) {
    var b = brokerOf(p.id);
    if (!b || !p.sale || p.own) return null;
    return { label: T('bk_label', { w: T('bw_' + b.who) }), sub: T('bk_sub', { v: yen(brokerFee(p)), s: Math.ceil(brokerLeft()) }), can: true, hold: 1.0, col: '#2bb8d8' };
  }
  function brokerMonth() {
    var d = S.deals;
    if (!isBiz() || d.broker || rnd() > BROKER_P * W.MONTH / 30) return;
    var list = Object.keys(S.props).map(function (k) { return S.props[k]; }).filter(function (p) {
      return p.sale && !p.own && !p.sale.mine && !p.sale.mad && !p.sale.starter && !p.sale.deal && Es().useOf(p) !== 'land' && G.roomOpen(p.dist);
    });
    if (!list.length) return;
    var p = pick(list), who = pick(BUYERS);
    d.broker = { p: p.id, at: S.t, until: S.t + BROKER_SEC, who: who };
    d.nBroker = (d.nBroker || 0) + 1;
    var sub = T('bk_newS', { w: T('bw_' + who), n: Es().name(p), s: BROKER_SEC, v: yen(brokerFee(p)) });
    if (d.nBroker <= 3) G.banner(T('bk_new'), sub, '#2bb8d8', 'new');
    else G.toast({ x: S.player.x, y: S.player.y - 30 }, T('bk_new'), '#2bb8d8', { big: true });
    G.emit('brokerNew', { p: p });
  }
  function brokerAttend(id) {
    var d = S.deals, b = brokerOf(id), p = S.props[id];
    if (!b) return false;
    d.broker = null;
    if (!p || !p.sale || p.own) return false;
    var pos = Es().pos(p);
    if (rnd() < 0.7) {
      var fee = brokerFee(p);
      G.post(100, 613, fee, { k: 'broker', p: p.id });
      G.post(150, 100, Math.round(fee * 0.2), false);
      d.n.broker = (d.n.broker || 0) + 1;
      G.banner(T('bk_won'), T('bk_wonS', { w: T('bw_' + b.who), n: Es().name(p), v: yen(fee) }), '#2bb8d8', 'good');
      G.toast({ x: pos.x, y: pos.y - 26 }, '+' + yen(fee), '#2fbf7a', { big: true });
      G.emit('rentCollect', { p: p, amount: fee, x: pos.x, y: pos.y });
      if (S.deals.deal && S.deals.deal.p === p.id) S.deals.deal = null;
      delete S.props[p.id];
      G.emit('dealWin', { kind: 'broker', p: p, fee: fee });
      return true;
    }
    G.toast({ x: pos.x, y: pos.y - 26 }, T('bk_lost'), '#9a94ad', { big: true });
    return false;
  }
  function brokerTick() {
    var b = S.deals.broker;
    if (!b) return;
    var p = S.props[b.p];
    if (!p || !p.sale || p.own) { S.deals.broker = null; return; }
    if (S.t < b.until) return;
    S.deals.broker = null;
    G.toast({ x: S.player.x, y: S.player.y - 30 }, T('bk_gone'), '#9a94ad');
  }
  G.mod({
    id: 'deals', order: 42,
    reset: function (S) { S.deals = { seed: 31337, views: [], deal: null, n: { view: 0, nego: 0, up: 0, deal: 0 }, nView: 0 }; },
    update: function (S) {
      if (!S.deals || !S.life || !S.life.chosen) return;
      viewsTick(); dealTick(); brokerTick();
      var ps = QT.UI && QT.UI.get && QT.UI.get('propsheet');
      var showing = ps && ps.isOpen && ps.isOpen() && ps.arg ? ps.arg() : null;
      Object.keys(S.props).forEach(function (k) {
        var q = S.props[k];
        if (q.sale && q.sale.mad && !q.own && k !== showing) delete S.props[k];
      });
    },
    save: function (S) { return S.deals; },
    load: function (S, o) {
      if (o && o.n) S.deals = o;
      (G.estate ? G.estate.owned() : []).forEach(function (p) { if (p.ups) applyUps(p); });
    }
  });
  G.on('monthEndPre', upMonthly);
  G.on('monthEnd', function () { if (S.life && S.life.chosen) { viewsMonth(); dealsMonth(); brokerMonth(); } });
  G.deals = {
    viewInfo: viewInfo, viewOf: viewOf, viewLeft: viewLeft, attend: attend, viewChance: viewChance,
    nego: nego, negoChance: negoChance, negoText: negoText,
    UPS: UPS, upList: upList, upOk: upOk, upCost: upCost, doUp: doUp, has: has,
    deal: function () { return S.deals && S.deals.deal; }, dealLeft: function () { var o = S.deals.deal; return o ? Math.max(0, o.until - S.t) : 0; },
    broker: function () { return S.deals && S.deals.broker; }, brokerOf: brokerOf, brokerLeft: brokerLeft, brokerInfo: brokerInfo,
    brokerAttend: brokerAttend, brokerFee: brokerFee
  };
})(window.QT);
