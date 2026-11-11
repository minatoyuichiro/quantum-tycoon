(function (QT) {
  'use strict';
  var on = QT.Art.scope('guide');
  QT.L.add({
    guide_next:        ['NEXT!', 'NEXT!'],
    guide_n_accept:    ['依頼を受ける', 'Take the order'],
    guide_n_wait:      ['依頼を待つ あと{n}秒', 'Wait for an order ({n}s)'],
    guide_n_dev:       ['あなたの席で開発', 'Code at your desk'],
    guide_n_devn:      ['あと{n}つ開発', 'Code {n} more'],
    guide_n_prebuild:  ['先に開発しておく', 'Code ahead'],
    guide_n_swjob:     ['ソフトを納品', 'Deliver the software'],
    guide_n_collect:   ['入金を受け取る', 'Collect payment'],
    guide_n_paywait:   ['入金まで あと{n}秒', 'Payment in {n}s'],
    guide_n_supply:    ['部材を仕入れる', 'Buy parts'],
    guide_n_rd:        ['試作する', 'Build a prototype'],
    guide_n_hwasm:     ['本体を組み立てる', 'Assemble a unit'],
    guide_n_hwlab:     ['研究室をつくる', 'Set up the R&D lab'],
    guide_n_labup:     ['研究室をLvアップ', 'Level up the lab'],
    guide_n_staff:     ['社員を採用', 'Hire staff'],
    guide_n_work:      ['バイトで稼ぐ', 'Work a shift'],
    guide_n_earn:      ['まずはバイトで稼ごう', 'Earn some cash first'],
    guide_n_earnfor:   ['あと¥{n} バイトで稼ごう', 'Earn ¥{n} more'],
    guide_n_borrow:    ['{n}で借りる', 'Borrow from {n}'],
    guide_n_swauto:    ['受託チームに任せる', 'Let the delivery team take over'],
    guide_n_svcbuy:    ['保守窓口を契約', 'Open the service desk'],
    guide_n_svcpay:    ['保守収益を受け取る', 'Collect service revenue'],
    guide_n_fix:       ['不具合を直す', 'Fix the defect'],
    guide_n_svcwait:   ['保守収益がたまるのを待つ', 'Wait for service revenue'],
    guide_n_ipo:       ['上場審査を受ける！', 'Go public!'],
    guide_n_pickup:    ['荷物を受け取る', 'Pick up a parcel'],
    guide_n_drop:      ['荷物を届ける', 'Deliver the parcel'],
    guide_n_notary:    ['定款を認証', 'Certify the articles'],
    guide_n_registry:  ['会社を設立', 'Incorporate'],
    guide_n_bank:      ['法人口座をひらく', 'Open an account'],
    guide_n_office:    ['事務所を借りる', 'Rent the office'],
    guide_n_expand:    ['「{n}」を開く', 'Open {n}'],
    guide_n_buy:       ['{n}を{v}', '{v}: {n}'],
    guide_n_ship:      ['トラックに積む', 'Load the truck'],
    guide_n_truckwait: ['トラック待ち あと{n}秒', 'Truck in {n}s'],
    guide_n_grab:      ['できた本体を持つ', 'Pick up the unit'],
    guide_n_asmwait:   ['本体ができるのを待つ', 'Wait for the unit'],
    guide_sw_title:   ['ソフトウェアのつくり方', 'How to make software'],
    guide_hw_title:   ['ハードウェアのつくり方', 'How to make hardware'],
    guide_pl_title:   ['工場のしくみ', 'How the plant works'],
    guide_sw1:        ['依頼を受ける', 'Take an order'],
    guide_sw1s:       ['営業部の前\n声がかかったら早めに', 'At Sales\nanswer before it expires'],
    guide_sw2:        ['コードを書く', 'Write code'],
    guide_sw2s:       ['ソフト開発のあなたの席\n工数ぶんまとめて書く', 'Your desk in Software\ncode the whole order'],
    guide_sw3:        ['納品する', 'Deliver'],
    guide_sw3s:       ['ソフト受託で\n書いたぶんを依頼へ', 'At SW delivery\ncode goes into the order'],
    guide_pay:        ['入金を受け取る', 'Get paid'],
    guide_pays:       ['経理で受け取る\n納品から少し遅れて届く', 'At Accounting\narrives a bit later'],
    guide_hw1:        ['部材を仕入れる', 'Buy parts'],
    guide_hw1s:       ['仕入れで買う\n試作にも組立にも使う', 'At Procurement\nused by both next steps'],
    guide_hw2:        ['試作で研究Lvを上げる', 'Prototype, raise R&D'],
    guide_hw2s:       ['ハード研究で試作\n上限は研究室のLv+1', 'In HW R&D\ncapped at lab Lv + 1'],
    guide_hw3:        ['本体を組み立てる', 'Assemble a unit'],
    guide_hw3s:       ['ハード組立を設置して\n本体の依頼に充てる', 'Set up HW assembly,\nthen fill hardware orders'],
    guide_pl1:        ['回路を設計', 'Design the chip'],
    guide_pl1s:       ['札1〜3：設計・レイアウト・\nテープアウト（自動）', 'Signs 1–3: design, layout,\ntape-out (automatic)'],
    guide_pl2:        ['チップを製造', 'Make the chip'],
    guide_pl2s:       ['札4〜11：外注の工程\n増やすほど高性能に', 'Signs 4–11: foundry steps,\nmore = better chips'],
    guide_pl3:        ['本体を組み立てる', 'Assemble the unit'],
    guide_pl3s:       ['札12：ヘリウムで冷やして完成\n本体は組立の右に出てくる', 'Sign 12: cooled with helium,\nunits pop out on its right'],
    guide_pl4:        ['トラックで出荷', 'Ship by truck'],
    guide_pl4s:       ['本体を拾って搬出口へ\nトラックが来たら積む', 'Grab units, go to the dock\nload when the truck is in'],
    guide_sw_tip:     ['床の青い線と ①〜④ の札が順路。\n依頼 → 開発 → 納品 → 入金 をくり返そう',
                       'Follow the blue line and ①–④ on the floor:\norder → code → deliver → get paid, repeat'],
    guide_hw_tip:     ['本体の依頼は工場を建ててから届く。それまでは\n②の試作で研究Lvを上げてクラウドを育てよう',
                       'Hardware orders start once you build the plant.\nUntil then, prototype (②) to grow R&D and the cloud'],
    guide_pl_tip:     ['番号札の順に自動で流れる。あなたの仕事は\nできた本体を床のオレンジの線でトラックへ',
                       'Stations run by themselves in sign order.\nYour job: carry units along the orange line'],
    guide_sp_title:   ['本体の性能（qubit）の上げ方', 'How to get more qubits'],
    guide_sp1:        ['研究Lvを上げる', 'Raise R&D level'],
    guide_sp1s:       ['事務所で試作・研究室を増設\n1Lvごとに +{rd}点（いちばん効く）', 'Prototype, upgrade the lab\n+{rd} pts per level (biggest)'],
    guide_sp2:        ['工程を増やす', 'Add process steps'],
    guide_sp2s:       ['外注の工程を契約\n1つ +{st}点（いま{ns}/11）', 'Contract foundry steps\n+{st} pts each ({ns}/11)'],
    guide_sp3:        ['工程を増強する', 'Upgrade the steps'],
    guide_sp3s:       ['設計〜QAの各工程\n1段ごとに +0.35点', 'Each step from design to QA\n+0.35 pts per level'],
    guide_sp4:        ['部材をそろえる', 'Add components'],
    guide_sp4s:       ['冷凍機・ステージ・制御装置\n1つ +1点（いま{nf}/3）', 'Fridge, stage, control\n+1 pt each ({nf}/3)'],
    guide_sp_tip:     ['いま{t}点で{q}qubit。{s}点ごとに倍、{g}点で1024qubit\n次の{q2}qubitまで あと{n}点',
                       'Now {t} pts = {q} qubits. Doubles every {s} pts; 1024 at {g}\n{n} pts to go for {q2} qubits'],
    guide_sp_tipmax:  ['いま{t}点で1024qubit。最高の性能に届いている！\nあとは数をつくって売ろう',
                       'Now {t} pts = 1024 qubits — top spec!\nNow build lots and sell them'],
    guide_close:      ['タップで閉じる', 'Tap to close'],
    guide_more:       ['タップで次へ', 'Tap for next'],
    guide_again:      ['左上の「?」でいつでも見られる', 'Reopen anytime with the ? button'],
    guide_loop:       ['くり返し', 'repeat']
  });
  var SW = '#2bb8d8', HW = '#ef7d2e', PAY = '#f5b21c', HOT = '#e2508a', INK = '#2a1a40';
  var FLOW_COL = { sw: SW, hw: HW, pay: PAY, plant: HW };
  var DARK = { sw: '#17799a', hw: '#b4521a', pay: '#b98100', plant: '#b4521a' };
  var TILE = 16, IA = 0.62, IB = 0.33;
  var KEY = 'quantum_tycoon_guide';
  var LEARNED = 3;
  function now() { return (window.performance && performance.now ? performance.now() : Date.now()) / 1000; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function inRect(p, r) { return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function owned(S, id) { return !!(S.p[id] && S.p[id].owned); }
  function lvOf(S, id) { return owned(S, id) ? S.p[id].level : 0; }
  function officeOn(S) { return owned(S, 'office'); }
  function busy(S) { return S.tut < 2 || S.won || S.gacha || S.showFinance || S.offline; }
  var seen = {};
  try { seen = JSON.parse(window.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { seen = {}; }
  if (!seen.n || typeof seen.n !== 'object') seen.n = {};
  function saveSeen() { try { window.localStorage.setItem(KEY, JSON.stringify(seen)); } catch (e) { } }
  function learned(key) { return (seen.n[key] || 0) >= LEARNED; }
  function findPad(G, type, pid) {
    var list = G.PADS();
    for (var i = 0; i < list.length; i++) {
      var pd = list[i];
      if (pd.type === type && (!pid || (pd.p && pd.p.id === pid))) return pd;
    }
    return null;
  }
  function findExpand(G, roomId) {
    var list = G.PADS();
    for (var i = 0; i < list.length; i++)
      if (list[i].type === 'expand' && list[i].room && list[i].room.id === roomId) return list[i];
    return null;
  }
  function canDo(G, pad) {
    if (!pad || !pad.type || !G.padActive(pad)) return false;
    var info = G.padInfo(pad);
    return !!(info && info.can);
  }
  function nextJob(S, kind) {
    var best = null;
    for (var i = 0; i < S.jobs.length; i++) {
      var j = S.jobs[i];
      if (j.kind !== kind) continue;
      if (kind === 'sw' && j.done >= j.work) continue;
      if (kind === 'hw' && j.left <= 0) continue;
      if (!best || best.due > j.due) best = j;
    }
    return best;
  }
  function fulfillable(S, G, o) {
    if (o.kind !== 'hw') return true;
    var best = Math.max(G.roomOpen('plant') ? S.bestQubits : 0,
                        S.rdLevel() >= 1 && owned(S, 'hwasm') ? G.hwasmQ() : 0);
    return o.qubits <= best;
  }
  function arNext(S) {
    var m = -1;
    for (var i = 0; i < S.ar.length; i++) if (m < 0 || S.ar[i].due < m) m = S.ar[i].due;
    return m < 0 ? 0 : Math.max(0, m - S.t);
  }
  function truckWait(S, G) {
    var tk = S.truck, gap = (G.CFG && G.CFG.truckGap) || 20, w = 0;
    if (tk.state === 'away') w = tk.t;
    else if (tk.state === 'arrive') w = tk.t + 1.5;
    else if (tk.state === 'back') w = tk.t;
    else if (tk.state === 'pull') w = tk.t + 1.8 + gap;
    else if (tk.state === 'leave') w = tk.t + gap;
    return Math.max(1, Math.ceil(w));
  }
  var OPEN = null;
  function insideOpen(S, x, y) {
    if (!OPEN) OPEN = QT.World.PLOTS.filter(function (p) { return p.open; });
    for (var i = 0; i < OPEN.length; i++) {
      var p = OPEN[i];
      if (!owned(S, p.id)) continue;
      if (x >= p.x * TILE && x < (p.x + p.w) * TILE && y >= p.y * TILE && y < (p.y + p.h) * TILE) return true;
    }
    return false;
  }
  function roomAt(y) {
    var R = QT.World.ROOMS;
    for (var i = 0; i < R.length; i++) if (y >= R[i].iy * TILE && y < (R[i].iy + R[i].ih) * TILE) return R[i].id;
    return null;
  }
  function pick(G, type, pid, key, flow, step) {
    var pad = findPad(G, type, pid);
    if (!canDo(G, pad)) return null;
    return { pad: pad, key: key, flow: flow || null, step: step || 0 };
  }
  function waitAt(pad, key, flow, step, vars) {
    return pad ? { pad: pad, key: key, flow: flow || null, step: step || 0, vars: vars || null, wait: true } : null;
  }
  function workPick(S, G) {
    return pick(G, 'reg', 'conveni', 'guide_n_work') ||
           pick(G, 'cserve', 'cafe', 'guide_n_work') ||
           (S.cafe.cups < 3 ? pick(G, 'brew', 'cafe', 'guide_n_work') : null) ||
           pick(G, 'stock', 'conveni', 'guide_n_work') ||
           pick(G, 'brew', 'cafe', 'guide_n_work');
  }
  function buyPick(G, id, key) {
    var r = pick(G, 'buy', id, key || 'guide_n_buy');
    if (r) r.plot = r.pad.p;
    return r;
  }
  function expandPick(G, roomId) {
    var pad = findExpand(G, roomId);
    if (!canDo(G, pad)) return null;
    return { pad: pad, key: 'guide_n_expand', room: pad.room, flow: null, step: 0 };
  }
  function hwResearch(S, G) {
    if (!owned(S, 'hwlab')) return pick(G, 'buy', 'hwlab', 'guide_n_hwlab', 'hw', 2);
    if (S.rdLevel() >= G.rdCap()) return pick(G, 'buy', 'hwlab', 'guide_n_labup', 'hw', 2);
    if (S.parts <= 0) return pick(G, 'supply', 'supply', 'guide_n_supply', 'hw', 1);
    return pick(G, 'rd', 'hwlab', 'guide_n_rd', 'hw', 2);
  }
  function plantNext(S, G, must) {
    if (!G.roomOpen('plant')) return null;
    var r, W = QT.World, carry = S.player.carry.length;
    if (carry) {
      if (G.truckHere()) { r = pick(G, 'ship', 'ship', 'guide_n_ship', 'plant', 4); if (r) { r.ico = 'truck'; return r; } }
      r = must ? waitAt(findPad(G, 'ship', 'ship'), 'guide_n_truckwait', 'plant', 4, { n: truckWait(S, G) }) : null;
      if (r) r.ico = 'truck';
      return r;
    }
    if (!must) return null;
    var need = [['design', 1], ['asm', 3], ['ship', 4]];
    for (var i = 0; i < need.length; i++) {
      if (owned(S, need[i][0])) continue;
      r = buyPick(G, need[i][0]);
      if (r) { r.flow = 'plant'; return r; }
    }
    if (G.shipAutoRate() > 0) return null;
    var o = W.OUT_SLOTS[0];
    return { pt: { x: o.x, y: o.y }, plot: W.BY_ID.asm, flow: 'plant', step: 3, ico: 'grab',
             key: S.outputs.length ? 'guide_n_grab' : 'guide_n_asmwait', wait: !S.outputs.length };
  }
  function devShort(S, G) {
    var dp = findPad(G, 'dev', 'pc');
    if (!dp || !G.padActive(dp)) return false;
    var di = G.padInfo(dp);
    return !!(di && !di.can && di.cost > S.coins);
  }
  function cashBlocked(S, G) {
    if (S.swStock > 0 || !nextJob(S, 'sw')) return false;
    if (G.swAutoRate() > 0 && lvOf(S, 'staff') > 0) return false;
    return devShort(S, G);
  }
  function loanPick(G) {
    var ids = ['kin', 'bankp', 'home'];
    for (var i = 0; i < ids.length; i++) {
      var r = pick(G, 'borrow', ids[i], 'guide_n_borrow');
      if (r) { r.vars = { n: QT.L.nm(r.pad.p) }; r.plot = r.pad.p; return r; }
    }
    return null;
  }
  function cashPick(S, G, waitMax) {
    var r;
    if (S.pendSales >= 1) { r = pick(G, 'collectSales', 'acct', 'guide_n_collect', 'pay', 4); if (r) return r; }
    var ar = arNext(S);
    if (ar > 0 && ar <= (waitMax || 10))
      return waitAt(findPad(G, 'collectSales', 'acct'), 'guide_n_paywait', 'pay', 4, { n: Math.ceil(ar) });
    return loanPick(G) || workPick(S, G);
  }
  function stagePick(S, G) {
    var PL = QT.World.PIPELINE;
    for (var i = 0; i < PL.length; i++) {
      var pp = QT.World.BY_ID[PL[i]];
      if (owned(S, pp.id) || !G.roomOpen(pp.room)) continue;
      var pd = findPad(G, 'buy', pp.id);
      if (!canDo(G, pd)) return null;
      if (S.coins < G.padInfo(pd).cost + G.fixedMonthly() * 0.5) return null;
      return buyPick(G, pp.id);
    }
    return null;
  }
  function svcPick(S, G) {
    var r;
    if (!G.roomOpen('service')) return expandPick(G, 'service');
    if (S.pendSvc >= 1) { r = pick(G, 'collectSvc', 'svc', 'guide_n_svcpay'); if (r) return r; }
    if (S.brokenCount() > 0) { r = pick(G, 'fix', 'svc', 'guide_n_fix'); if (r) return r; }
    if (!owned(S, 'svc')) { r = buyPick(G, 'svc', 'guide_n_svcbuy'); if (r) return r; }
    r = plantNext(S, G, true); if (r) return r;
    return S.contracts.length ? waitAt(findPad(G, 'collectSvc', 'svc'), 'guide_n_svcwait') : null;
  }
  function objPick(S, G, ob) {
    var r, i;
    if (ob === 10) return hwResearch(S, G);
    if (ob === 11) {
      var cneed = S.qcLv() * G.CFG.cloudStep;
      if (S.rd < cneed) return hwResearch(S, G);
      if (S.swDev < cneed) return pick(G, 'dev', 'pc', 'guide_n_dev', 'sw', 2);
      return null;
    }
    if (ob === 12) return expandPick(G, 'plant') || (S.rdLevel() < 1 ? hwResearch(S, G) : null);
    if (ob === 14) return svcPick(S, G);
    if (ob === 15) return expandPick(G, 'outsrc');
    if (ob === 16) return expandPick(G, 'cryo');
    if (ob === 17) {
      var F = QT.World.FEEDERS;
      for (i = 0; i < F.length; i++) if (!owned(S, F[i])) return buyPick(G, F[i]);
      return null;
    }
    if (ob === 19) return G.roomOpen('hq') ? buyPick(G, 'sns') : expandPick(G, 'hq');
    if (ob === 20) {
      var D = Object.keys(QT.World.DOMAINS);
      for (i = 0; i < D.length; i++) if (!owned(S, D[i])) { r = buyPick(G, D[i]); if (r) return r; }
      return null;
    }
    if (ob === 21) return stagePick(S, G);
    return null;
  }
  function computeNext(S, G) {
    var r, i;
    if (S.deliv) { r = pick(G, 'drop', S.deliv.corp, 'guide_n_drop'); if (r) return r; }
    if (!S.ipo && !S.seenWin && S.canIPO()) { r = pick(G, 'ipo', 'gate', 'guide_n_ipo'); if (r) return r; }
    if (!officeOn(S)) {
      var o = S.obj;
      if (o <= 0) return workPick(S, G);
      if (o === 1) return pick(G, 'pickup', 'conveni', 'guide_n_pickup') || workPick(S, G);
      var seq = { 2: ['notary', null, 'guide_n_notary'], 3: ['registry', null, 'guide_n_registry'],
                  4: ['bank', null, 'guide_n_bank'], 5: ['buy', 'office', 'guide_n_office'] }[o];
      if (!seq) return null;
      r = pick(G, seq[0], seq[1], seq[2]);
      if (r) return r;
      var tp = findPad(G, seq[0], seq[1]);
      var ti = tp && G.padActive(tp) ? G.padInfo(tp) : null;
      var lack = ti && ti.cost ? ti.cost - S.coins : 0;
      r = workPick(S, G);
      if (r) {
        if (lack > 0) { r.key = 'guide_n_earnfor'; r.vars = { n: G.fmt(Math.ceil(lack)) }; }
        else r.key = 'guide_n_earn';
      }
      return r;
    }
    var ob = S.obj, deskAuto = lvOf(S, 'desk') >= 3;
    var fm = G.fixedMonthly(), pendMin = Math.max(1, fm * 0.1);
    var carryN = S.player.carry.length;
    if (G.roomOpen('plant') && G.truckHere()) {
      var hwOffer = S.offer && S.offer.kind === 'hw' && !deskAuto && fulfillable(S, G, S.offer), hwFit = false;
      if (hwOffer) for (i = 0; i < carryN; i++) if (S.player.carry[i].qubits >= S.offer.qubits) hwFit = true;
      if (carryN && !hwFit) { r = pick(G, 'ship', 'ship', 'guide_n_ship', 'plant', 4); if (r) { r.ico = 'truck'; return r; } }
      if (!carryN && !hwOffer && S.outputs.length && G.shipAutoRate() <= 0 && roomAt(S.player.y) === 'plant') {
        r = plantNext(S, G, true); if (r) return r;
      }
    }
    if (cashBlocked(S, G)) { r = cashPick(S, G); if (r) return r; }
    if (S.offer && !deskAuto && fulfillable(S, G, S.offer)) {
      r = pick(G, 'accept', 'desk', 'guide_n_accept', S.offer.kind === 'hw' ? 'hw' : 'sw', 1);
      if (r) return r;
    }
    if (!S.offer && !S.jobs.length && S.jobsDone === 0 && ob <= 7 && !deskAuto) {
      if (devShort(S, G)) { r = cashPick(S, G); if (r) return r; }
      return waitAt(findPad(G, 'accept', 'desk'), 'guide_n_wait', 'sw', 1,
                    { n: Math.max(1, Math.ceil(S.offerT)) });
    }
    if (S.pendSales >= pendMin && (ob <= 9 || S.coins < fm)) {
      r = pick(G, 'collectSales', 'acct', 'guide_n_collect', 'pay', 4); if (r) return r;
    }
    var rushSw = false;
    for (i = 0; i < S.jobs.length; i++) {
      var jj = S.jobs[i];
      if (jj.kind === 'sw' && jj.done < jj.work && jj.due - S.t < 45) rushSw = true;
    }
    if (!rushSw) {
      if (ob === 9) { r = buyPick(G, 'staff', 'guide_n_staff'); if (r) return r; }
      if (ob === 10) { r = hwResearch(S, G); if (r) return r; }
      if (ob === 11 && S.rd < S.qcLv() * G.CFG.cloudStep) { r = hwResearch(S, G); if (r) return r; }
    }
    var sj = nextJob(S, 'sw');
    var swAuto = G.swAutoRate() > 0 && lvOf(S, 'staff') > 0;
    if (sj && !swAuto && lvOf(S, 'staff') > 0 && !rushSw) {
      r = pick(G, 'buy', 'swjob', 'guide_n_swauto'); if (r) { r.plot = r.pad.p; return r; }
    }
    if (sj && !swAuto) {
      var need = sj.work - sj.done, rush = sj.due - S.t < 30, full = S.swStock >= G.CFG.stockCap;
      if (S.swStock > 0 && (S.swStock >= need || rush || full)) {
        r = pick(G, 'swjob', 'swjob', 'guide_n_swjob', 'sw', 3); if (r) return r;
      }
      r = pick(G, 'dev', 'pc', 'guide_n_devn', 'sw', 2);
      if (r) { r.vars = { n: Math.max(1, need - S.swStock) }; return r; }
      if (S.swStock > 0) { r = pick(G, 'swjob', 'swjob', 'guide_n_swjob', 'sw', 3); if (r) return r; }
    }
    if (ob === 13) { r = plantNext(S, G, true); if (r) return r; }
    var hj = nextJob(S, 'hw');
    if (hj && owned(S, 'hwasm') && S.rdLevel() >= 1 && hj.qubits <= G.hwasmQ()) {
      r = S.parts >= G.CFG.partsPerBuild ? pick(G, 'hwasm', 'hwasm', 'guide_n_hwasm', 'hw', 3)
                                         : pick(G, 'supply', 'supply', 'guide_n_supply', 'hw', 1);
      if (r) return r;
    }
    r = plantNext(S, G, false);
    if (r) return r;
    if (ob <= 8) {
      if (S.jobsDone < 1) return null;
      var arN = arNext(S);
      if (arN > 0 && (arN <= 10 || S.swStock >= 3))
        return waitAt(findPad(G, 'collectSales', 'acct'), 'guide_n_paywait', 'pay', 4, { n: Math.ceil(arN) });
      if (S.swStock >= 3) return null;
      return pick(G, 'dev', 'pc', 'guide_n_prebuild', 'sw', 2) ||
             (arN > 0 ? waitAt(findPad(G, 'collectSales', 'acct'), 'guide_n_paywait', 'pay', 4, { n: Math.ceil(arN) })
                      : devShort(S, G) ? cashPick(S, G) : null);
    }
    if (ob === 9) {
      r = buyPick(G, 'staff', 'guide_n_staff');
      if (r) return r;
      var arN9 = arNext(S);
      if (arN9 > 0 && arN9 <= 12)
        return waitAt(findPad(G, 'collectSales', 'acct'), 'guide_n_paywait', 'pay', 4, { n: Math.ceil(arN9) });
    } else {
      r = objPick(S, G, ob);
      if (r) return r;
    }
    if (S.pendSales >= pendMin) { r = pick(G, 'collectSales', 'acct', 'guide_n_collect', 'pay', 4); if (r) return r; }
    if (ob >= 16) { r = stagePick(S, G); if (r) return r; }
    if (G.roomOpen('plant') && (S.outputs.length || S.player.carry.length)) {
      r = plantNext(S, G, true); if (r) return r;
    }
    if (devShort(S, G)) return cashPick(S, G, 30);
    return null;
  }
  var nextRes = null, nextAt = -1, holdSeen = 0;
  function currentNext(S, G) {
    var t = now();
    if (t - nextAt > 0.35 || t < nextAt) {
      var prev = nextRes, res = null;
      try { res = computeNext(S, G); } catch (e) { res = null; }
      if (prev && res && prev.pad && res.pad && prev.key === res.key && prev.pad !== res.pad && canDo(G, prev.pad)) {
        prev.vars = res.vars; res = prev;
      }
      var hT = S.holdT || 0;
      if (prev && res !== prev && prev.pad && !prev.wait && hT > 0 && hT >= holdSeen &&
          standingOn(S, prev) && canDo(G, prev.pad) && !(res && res.key === 'guide_n_drop')) res = prev;
      holdSeen = hT;
      nextRes = res; nextAt = t;
    }
    return nextRes;
  }
  function tgtPt(res) {
    return res.pt || { x: (res.pad.x + 0.5) * TILE, y: (res.pad.y + 0.5) * TILE };
  }
  function tgtPlot(res) { return res.plot || (res.pad && res.pad.p) || null; }
  function standingOn(S, res) {
    if (!res) return false;
    if (res.pt || res.wait) {
      var q = tgtPt(res);
      return Math.abs(S.player.x - q.x) + Math.abs(S.player.y - q.y) < 16;
    }
    var h = S.heldPad;
    if (!h) return false;
    if (h === res.pad) return true;
    return h.type === res.pad.type && h.p && h.p === res.pad.p;
  }
  function labelOf(res, H) {
    var L = H.L;
    if (res.key === 'guide_n_expand') return L.t(res.key, { n: L.nm(res.room) });
    if (res.key === 'guide_n_buy') return L.t(res.key, { n: L.nm(res.plot, 'short'), v: L.nm(res.plot, 'verb') });
    return L.t(res.key, res.vars || undefined);
  }
  function findRoute(G, r, a, b) {
    var x0 = r.ix, y0 = r.iy, w = r.iw, h = r.ih, N = w * h, i, k;
    var ax = a.x - x0, ay = a.y - y0, bx = b.x - x0, by = b.y - y0;
    if (ax < 0 || ay < 0 || ax >= w || ay >= h || bx < 0 || by < 0 || bx >= w || by >= h) return null;
    var free = new Uint8Array(N), hug = new Uint8Array(N);
    for (var yy = 0; yy < h; yy++)
      for (var xx = 0; xx < w; xx++)
        free[yy * w + xx] = G.walkable((x0 + xx + 0.5) * TILE, (y0 + yy + 0.5) * TILE) ? 1 : 0;
    free[ay * w + ax] = 1; free[by * w + bx] = 1;
    var DX = [1, -1, 0, 0], DY = [0, 0, 1, -1];
    for (i = 0; i < N; i++) {
      var tx0 = i % w, ty0 = (i - tx0) / w;
      for (k = 0; k < 4; k++) {
        var qx = tx0 + DX[k], qy = ty0 + DY[k];
        if (qx < 0 || qy < 0 || qx >= w || qy >= h || !free[qy * w + qx]) { hug[i] = 1; break; }
      }
    }
    var INF = 1e9, dist = new Int32Array(N * 4), prev = new Int32Array(N * 4);
    for (i = 0; i < N * 4; i++) { dist[i] = INF; prev[i] = -1; }
    var buckets = [];
    function push(s, d, from) {
      if (d >= dist[s]) return;
      dist[s] = d; prev[s] = from;
      (buckets[d] || (buckets[d] = [])).push(s);
    }
    var s0 = ay * w + ax, g = by * w + bx, goal = -1;
    for (k = 0; k < 4; k++) push(s0 * 4 + k, 0, -1);
    for (var d = 0; d < buckets.length && goal < 0; d++) {
      var bk = buckets[d];
      if (!bk) continue;
      while (bk.length) {
        var s = bk.pop();
        if (dist[s] !== d) continue;
        var t = (s / 4) | 0, dir = s % 4;
        if (t === g) { goal = s; break; }
        var tx = t % w, ty = (t - tx) / w;
        for (k = 0; k < 4; k++) {
          var nx = tx + DX[k], ny = ty + DY[k];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          var n = ny * w + nx;
          if (!free[n]) continue;
          push(n * 4 + k, d + 2 + (k !== dir ? 5 : 0) + hug[n], s);
        }
      }
    }
    if (goal < 0) return null;
    var tiles = [];
    for (var v = goal; v >= 0; v = prev[v]) tiles.push((v / 4) | 0);
    tiles.reverse();
    var pts = [], last = -1;
    for (i = 0; i < tiles.length; i++) {
      var ti = tiles[i], dd = -1;
      if (i + 1 < tiles.length) dd = tiles[i + 1] - ti;
      if (i === 0 || i === tiles.length - 1 || dd !== last)
        pts.push({ x: (x0 + ti % w + 0.5) * TILE, y: (y0 + ((ti / w) | 0) + 0.5) * TILE });
      last = dd;
    }
    return legOf(pts);
  }
  function legOf(pts) {
    var len = 0, segs = [];
    for (var i = 0; i + 1 < pts.length; i++) {
      var l = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
      segs.push(l); len += l;
    }
    return { pts: pts, segs: segs, len: len };
  }
  function pointAt(leg, s) {
    var p = leg.pts;
    for (var i = 0; i < leg.segs.length; i++) {
      var l = leg.segs[i];
      if (s <= l || i === leg.segs.length - 1) {
        var k = l > 0 ? Math.min(1, s / l) : 0;
        var dx = p[i + 1].x - p[i].x, dy = p[i + 1].y - p[i].y, m = Math.abs(dx) + Math.abs(dy) || 1;
        return { x: p[i].x + dx * k, y: p[i].y + dy * k, dx: dx / m, dy: dy / m };
      }
      s -= l;
    }
    return { x: p[0].x, y: p[0].y, dx: 1, dy: 0 };
  }
  function badgeSpot(S, legs, i) {
    var lg, s, q;
    if (i === 0) {
      lg = legs[0];
      if (!lg || lg.len <= 0) return null;
      s = Math.min(17, lg.len * 0.4); q = pointAt(lg, s);
      while (s < lg.len * 0.6 && insideOpen(S, q.x, q.y)) { s += 4; q = pointAt(lg, s); }
      return q;
    }
    lg = legs[i - 1];
    if (!lg || lg.len <= 0) return null;
    s = Math.max(lg.len * 0.45, lg.len - 17); q = pointAt(lg, s);
    while (s > 6 && insideOpen(S, q.x, q.y)) { s -= 4; q = pointAt(lg, s); }
    return q;
  }
  var office = { key: null, flows: null };
  function officeStations(S, G) {
    return {
      sw: [findPad(G, 'accept', 'desk'), findPad(G, 'dev', 'pc'), findPad(G, 'swjob', 'swjob'),
           findPad(G, 'collectSales', 'acct')],
      hw: [findPad(G, 'supply', 'supply'),
           owned(S, 'hwlab') ? findPad(G, 'rd', 'hwlab') : findPad(G, 'buy', 'hwlab'),
           findPad(G, 'hwasm', 'hwasm'), findPad(G, 'collectSales', 'acct')]
    };
  }
  function routeKey(S, r) {
    var k = '';
    for (var i = 0; i < r.plots.length; i++) k += owned(S, r.plots[i]) ? '1' : '0';
    return k;
  }
  function ensureOffice(S, G, r) {
    var key = routeKey(S, r);
    if (office.key === key && office.flows) return office;
    var st = officeStations(S, G), flows = {};
    ['sw', 'hw'].forEach(function (f) {
      var legs = [], spots = [];
      for (var i = 0; i < 3; i++) {
        var a = st[f][i], b = st[f][i + 1];
        legs.push(a && b ? findRoute(G, r, a, b) : null);
      }
      for (var j = 0; j < 4; j++) spots.push(st[f][j] ? badgeSpot(S, legs, j) : null);
      flows[f] = { st: st[f], legs: legs, spots: spots };
    });
    office.key = key; office.flows = flows;
    return office;
  }
  var plant = null;
  function ensurePlant(S, G) {
    if (plant) return plant;
    var W = QT.World, B = W.BY_ID, O = W.OUT_SLOTS, ship = findPad(G, 'ship', 'ship');
    if (!ship) return null;
    var ya = (B.design.padY + 0.5) * TILE, yb = (B.design.padY + 1.45) * TILE;
    var x0 = (B.design.padX + 0.5) * TILE, x1 = (B.tapeout.padX + 0.5) * TILE;
    var xo = O[0].x + 9.5, yo = O[1].y, yf = (ship.y + 0.5) * TILE, xs = (ship.x + 0.5) * TILE;
    var legs = [legOf([{ x: x0, y: ya }, { x: x1, y: ya }]),
                legOf([{ x: x1, y: ya }, { x: x1, y: yb }, { x: xo, y: yb }, { x: xo, y: yo }]),
                legOf([{ x: xo, y: yo }, { x: xo, y: yf }, { x: xs, y: yf }])];
    var spots = [pointAt(legs[0], 17), pointAt(legs[0], legs[0].len - 17),
                 pointAt(legs[1], legs[1].len - 15), pointAt(legs[2], Math.max(8, legs[2].len - 30))];
    plant = { legs: legs, spots: spots, ship: ship };
    return plant;
  }
  function flowStep(S, G, f) {
    if (f === 'sw') {
      if (S.offer && S.offer.kind !== 'hw') return 1;
      var sj = nextJob(S, 'sw');
      if (sj) return S.swStock > 0 && (S.swStock >= sj.work - sj.done || sj.due - S.t < 30) ? 3 : 2;
      return S.pendSales >= 1 ? 4 : 1;
    }
    if (f === 'plant') return S.player.carry.length ? 4 : S.outputs.length ? 3 : 2;
    if (!owned(S, 'hwlab')) return 2;
    if (S.parts <= 0) return 1;
    if (S.rdLevel() < 1 || (S.rdLevel() < G.rdCap() && S.parts < G.CFG.partsPerBuild)) return 2;
    if (owned(S, 'hwasm') && S.parts >= G.CFG.partsPerBuild) return 3;
    return 2;
  }
  function stepOf(S, G, f, res) {
    if (res && res.flow === f) return res.step;
    if (res && res.flow === 'pay' && f !== 'plant') return 4;
    return flowStep(S, G, f);
  }
  function showHW(S) { return owned(S, 'hwlab') || S.obj >= 10; }
  var lastFocus = 'sw';
  function focusFlow(S, G, res) {
    if (res && (res.flow === 'sw' || res.flow === 'hw')) lastFocus = res.flow;
    else if (!res || res.flow !== 'pay') {
      var swBusy = !!nextJob(S, 'sw') || (S.offer && S.offer.kind !== 'hw');
      var hwBusy = showHW(S) && ((S.obj >= 10 && S.obj <= 12) || (nextJob(S, 'hw') && owned(S, 'hwasm')));
      lastFocus = hwBusy && !swBusy ? 'hw' : swBusy ? 'sw' : lastFocus;
    }
    if (lastFocus === 'hw' && !showHW(S)) lastFocus = 'sw';
    return lastFocus;
  }
  function flowFade(S, G, f) {
    if (f === 'sw') {
      if (G.swAutoRate() > 0 && lvOf(S, 'staff') > 0) return 0.35;
      return S.jobsDone >= 8 ? 0.55 : S.jobsDone >= 4 ? 0.75 : 1;
    }
    if (f === 'hw') return G.roomOpen('plant') ? 0.45 : 1;
    if (G.shipAutoRate() > 0) return 0.35;
    return S.shipped >= 6 ? 0.55 : S.shipped >= 2 ? 0.75 : 1;
  }
  function addBand(c, H, pts, hw) {
    for (var i = 0; i + 1 < pts.length; i++) {
      var a = pts[i], b = pts[i + 1];
      var x0 = Math.min(a.x, b.x) - hw, x1 = Math.max(a.x, b.x) + hw;
      var y0 = Math.min(a.y, b.y) - hw, y1 = Math.max(a.y, b.y) + hw;
      var p0 = H.P(x0, y0, 0.2), p1 = H.P(x1, y0, 0.2), p2 = H.P(x1, y1, 0.2), p3 = H.P(x0, y1, 0.2);
      c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y); c.closePath();
    }
  }
  function addChev(c, H, leg, off, gap, sz) {
    sz = sz || 1;
    for (var s = off; s < leg.len - 5; s += gap) {
      if (s < 6) continue;
      var q = pointAt(leg, s), dx = q.dx * sz, dy = q.dy * sz, px = -dy, py = dx;
      var a = H.P(q.x + dx * 2.6, q.y + dy * 2.6, 0.3);
      var b = H.P(q.x - dx * 1.4 + px * 2.3, q.y - dy * 1.4 + py * 2.3, 0.3);
      var m = H.P(q.x - dx * 0.2, q.y - dy * 0.2, 0.3);
      var e = H.P(q.x - dx * 1.4 - px * 2.3, q.y - dy * 1.4 - py * 2.3, 0.3);
      c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(m.x, m.y); c.lineTo(e.x, e.y); c.closePath();
    }
  }
  function addCube(side, top, H, x, y, r, b, h) {
    var x0 = x - r, x1 = x + r, y0 = y - r, y1 = y + r, t = b + h;
    var a = H.P(x0, y0, t), bb = H.P(x1, y0, t), c2 = H.P(x1, y1, t), d = H.P(x0, y1, t);
    var e = H.P(x1, y0, b), f = H.P(x1, y1, b), g = H.P(x0, y1, b);
    side.push(a, bb, e, f, g, d);
    top.push(a, bb, c2, d);
  }
  function fillPolys(c, list, n, col) {
    if (!list.length) return;
    c.beginPath();
    for (var i = 0; i < list.length; i += n) {
      c.moveTo(list[i].x, list[i].y);
      for (var k = 1; k < n; k++) c.lineTo(list[i + k].x, list[i + k].y);
      c.closePath();
    }
    c.fillStyle = col; c.fill();
  }
  function paintFlow(c, H, t, legs, f, opt) {
    var col = FLOW_COL[f], dark = DARK[f], hot = opt.hot, i, leg;
    c.beginPath();
    for (i = 0; i < legs.length; i++) {
      leg = legs[i];
      if (leg && leg.len > 0 && leg !== hot) addBand(c, H, leg.pts, opt.thin && opt.thin[i] ? 3.0 : 4.1);
    }
    c.globalAlpha = opt.base * 0.85; c.fillStyle = dark; c.fill();
    c.beginPath();
    for (i = 0; i < legs.length; i++) {
      leg = legs[i];
      if (leg && leg.len > 0 && leg !== hot) addBand(c, H, leg.pts, opt.thin && opt.thin[i] ? 2.0 : 3.0);
    }
    c.globalAlpha = opt.base; c.fillStyle = col; c.fill();
    if (hot) {
      c.globalAlpha = Math.min(1, opt.base + 0.15); c.fillStyle = dark;
      c.beginPath(); addBand(c, H, hot.pts, 4.9); c.fill();
      c.globalAlpha = Math.min(1, opt.base + 0.25); c.fillStyle = col;
      c.beginPath(); addBand(c, H, hot.pts, 3.7); c.fill();
    }
    if (opt.chev) {
      c.fillStyle = '#ffffff';
      c.beginPath();
      for (i = 0; i < legs.length; i++) {
        leg = legs[i];
        if (!leg || leg.len <= 0 || leg === hot) continue;
        if (opt.thin && opt.thin[i]) addChev(c, H, leg, (t * 8) % 18, 18, 0.7);
        else addChev(c, H, leg, (t * 12) % 14, 14);
      }
      c.globalAlpha = Math.min(1, opt.base * 1.1); c.fill();
      if (hot) { c.beginPath(); addChev(c, H, hot, (t * 26) % 14, 14); c.globalAlpha = 1; c.fill(); }
    }
    if (opt.cubes) {
      var side = [], top = [];
      for (var j = 0; j < legs.length; j++) {
        var lg = legs[j];
        if (!lg || lg.len < 20 || (opt.cubeOn && !opt.cubeOn[j])) continue;
        var n = Math.max(1, Math.round(lg.len / 110));
        for (var m = 0; m < n; m++) {
          var q = pointAt(lg, (t * 22 + m * lg.len / n + j * 37) % lg.len);
          addCube(side, top, H, q.x, q.y, 2.4, 0.6 + Math.abs(Math.sin(t * 6 + m + j)) * 1.6, 1.8);
        }
      }
      c.globalAlpha = Math.min(1, opt.base + 0.2);
      fillPolys(c, side, 6, opt.cubes[0]);
      fillPolys(c, top, 4, opt.cubes[1]);
    }
    c.globalAlpha = 1;
  }
  function worldScale(H) { var m = H.ctx.getTransform ? H.ctx.getTransform() : null; return m && m.a > 0 ? Math.round(m.a * 4) / 4 : 2; }
  function floorBadge(c, H, k, q, n, col, a, hot, t) {
    var p0 = H.P(q.x, q.y, 0.3);
    var R = Math.max(5.6, 8.5 / H.z);
    c.globalAlpha = a;
    c.beginPath(); c.ellipse(p0.x, p0.y, R * 1.1, R * 0.6, 0, 0, 7);
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    c.lineWidth = Math.max(1, R * 0.2); c.strokeStyle = col; c.stroke();
    if (hot) {
      var e = (t * 1.2) % 1;
      c.globalAlpha = a * (1 - e) * 0.9; c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(p0.x, p0.y, R * (1.2 + e * 1.6), R * (0.66 + e * 0.9), 0, 0, 7); c.stroke();
      c.globalAlpha = a;
    }
    var lift = R * 1.15 + (hot ? Math.abs(Math.sin(t * 4.2)) * R * 0.35 : 0);
    c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p0.x, p0.y - lift);
    c.lineWidth = Math.max(0.8, R * 0.18); c.strokeStyle = INK; c.stroke();
    var sp = wBadgeSprite(k, R, col, n), sc = hot ? 1.18 + 0.06 * Math.sin(t * 7) : 1;
    var bw = sp.w * sc, bh = sp.h * sc;
    c.drawImage(sp.cv, p0.x - bw / 2, p0.y - lift - R * sc - bh / 2, bw, bh);
    c.globalAlpha = 1;
  }
  var badgeQ = {}, badgeRects = [], shownBadges = [];
  function pushBadges(r, S, H, push) {
    var b = badgeQ[r.id];
    if (!b || now() - b.at > 0.2) return;
    var t = S.t, R = Math.max(5.6, 8.5 / H.z);
    b.list.forEach(function (e) {
      var dx = S.player.x - e.q.x, dy = S.player.y - e.q.y, d = Math.sqrt(dx * dx + dy * dy);
      var a = e.a * Math.max(0.22, Math.min(1, (d - 10) / 16));
      push({ x: e.q.x - 3, y: e.q.y - 3, w: 6, h: 6, draw: function () {
        floorBadge(H.ctx, H, worldScale(H), e.q, e.n, e.col, a, e.hot, t);
      } });
      var sc = H.toScreen(e.q.x, e.q.y, R * 2.2), rr = R * 1.3 * H.z;
      badgeRects.push({ x: sc.x - rr, y: sc.y - rr, w: rr * 2, h: rr * 2 + R * H.z });
    });
  }
  function drawOfficeFloor(r, S, H, res, t) {
    var G = H.G, c = H.ctx;
    var R0 = ensureOffice(S, G, r);
    var focus = focusFlow(S, G, res);
    var flows = showHW(S) ? (focus === 'hw' ? ['sw', 'hw'] : ['hw', 'sw']) : ['sw'];
    var k = worldScale(H);
    c.save();
    for (var fi = 0; fi < flows.length; fi++) {
      var f = flows[fi], fl = R0.flows[f], isF = f === focus, fade = flowFade(S, G, f);
      var preview = f === 'hw' && !owned(S, 'hwlab');
      var cur = stepOf(S, G, f, res);
      var hot = isF && !preview && cur >= 2 ? fl.legs[cur - 2] : null;
      paintFlow(c, H, t, fl.legs, f, {
        base: isF ? (preview ? 0.5 : 0.8) * fade : 0.24 * Math.max(0.6, fade),
        hot: hot, chev: isF && !preview, cubes: isF && !preview ? (f === 'sw' ? ['#7cc9e0', '#ffffff'] : ['#d7641f', '#ffd23f']) : null
      });
    }
    c.restore();
    var fl2 = R0.flows[focus], cur2 = stepOf(S, G, focus, res), fade2 = flowFade(S, G, focus);
    var prev2 = focus === 'hw' && !owned(S, 'hwlab'), list = [];
    for (var i = 0; i < 4; i++) {
      var q = fl2.spots[i], pad = fl2.st[i];
      if (!q || !pad) continue;
      var isNext = res && res.pad && res.pad.p === pad.p && res.pad.type === pad.type;
      var hotB = isNext || cur2 === i + 1;
      var act = hotB || canDo(G, pad);
      var a = (hotB ? 1 : act ? 0.92 : (i === 0 || i === 3) ? 0.35 : 0.6) * (prev2 ? 0.7 : 0.55 + 0.45 * fade2);
      list.push({ q: q, n: i + 1, col: i === 3 ? PAY : FLOW_COL[focus], a: a, hot: hotB && !prev2 });
    }
    badgeQ[r.id] = { list: list, at: now() };
  }
  function drawPlantFloor(r, S, H, res, t) {
    var G = H.G, c = H.ctx, R0 = ensurePlant(S, G);
    if (!R0) return;
    var fade = flowFade(S, G, 'plant'), cur = stepOf(S, G, 'plant', res), k = worldScale(H);
    c.save();
    paintFlow(c, H, t, R0.legs, 'plant', {
      base: 0.78 * fade, hot: cur === 4 ? R0.legs[2] : null, chev: true,
      thin: [true, true, false],
      cubes: ['#d7641f', '#ffd23f'], cubeOn: [true, true, false]
    });
    c.restore();
    var act = [S.outputs.length > 0, S.player.carry.length > 0 && G.truckHere()], list = [];
    for (var i = 0; i < 2; i++) {
      var hotB = cur === i + 3;
      var a = (hotB ? 1 : act[i] ? 0.92 : 0.55) * (0.55 + 0.45 * fade);
      list.push({ q: R0.spots[i + 2], n: i ? 'truck' : 'grab', col: i ? PAY : HW, a: a, hot: hotB });
    }
    badgeQ[r.id] = { list: list, at: now() };
  }
  function floorSpot(c, H, q, a, t) {
    var p0 = H.P(q.x, q.y, 0.25), rx = 13.2, ry = 7.1, pl = 0.5 + 0.5 * Math.sin(t * 5);
    c.save();
    c.globalAlpha = a * (0.22 + 0.14 * pl);
    c.beginPath(); c.ellipse(p0.x, p0.y, rx * 1.15, ry * 1.15, 0, 0, 7); c.fillStyle = '#ffd23f'; c.fill();
    c.globalAlpha = a;
    c.beginPath(); c.ellipse(p0.x, p0.y, rx, ry, 0, 0, 7);
    c.lineWidth = 1.8; c.strokeStyle = '#ffc21c'; c.stroke();
    var e = (t * 1.3) % 1;
    c.globalAlpha = a * (1 - e);
    c.beginPath(); c.ellipse(p0.x, p0.y, rx * (1 + e * 0.8), ry * (1 + e * 0.8), 0, 0, 7);
    c.lineWidth = 1.5; c.strokeStyle = '#ffffff'; c.stroke();
    c.restore();
  }
  var vis = null;
  function floorFor(r, S, H) {
    if (S.tut < 2) { badgeQ[r.id] = null; return; }
    var ctr = H.toScreen((r.ix + r.iw / 2) * TILE, (r.iy + r.ih / 2) * TILE, 0);
    var span = (r.iw + r.ih) * TILE * 0.7 * H.z;
    badgeQ[r.id] = null;
    if (ctr.y < -span || ctr.y > H.cssH + span || ctr.x < -span || ctr.x > H.cssW + span) return;
    var G = H.G, t = S.t;
    var res = busy(S) ? null : currentNext(S, G);
    if (r.id === 'sw' && officeOn(S)) drawOfficeFloor(r, S, H, res, t);
    if (r.id === 'plant' && G.roomOpen('plant')) drawPlantFloor(r, S, H, res, t);
    if (vis && now() - vis.at < 0.3 && vis.room === r.id && !vis.inside) floorSpot(H.ctx, H, vis.q, vis.a, t);
  }
  QT.World.ROOMS.forEach(function (room) {
    on('floor', room.id, function (r, S, H) { floorFor(r, S, H); });
  });
  on('scene', 'sw', function (r, S, H, push) { pushBadges(r, S, H, push); });
  on('scene', 'plant', function (r, S, H, push) { pushBadges(r, S, H, push); });
  var hits = { q: null, next: null, nextA: null, at: 0 };
  var FONT = 'sans-serif';
  function rrP(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function popT(c, s, x, y, size, fill, stroke, lw) {
    c.font = '900 ' + size + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = lw || Math.max(3, size / 4.2); c.strokeStyle = stroke || INK; c.strokeText(s, x, y);
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  function txtT(c, s, x, y, size, color, weight) {
    c.font = (weight || 800) + ' ' + size + 'px ' + FONT;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = color; c.fillText(s, x, y);
  }
  var measureCv = null;
  function mctx() {
    if (!measureCv) measureCv = document.createElement('canvas').getContext('2d');
    return measureCv;
  }
  var widths = {}, widthN = 0;
  function textW(str, font) {
    var k = font + '|' + str, v = widths[k];
    if (v != null) return v;
    if (widthN > 400) { widths = {}; widthN = 0; }
    var m = mctx(); m.font = font;
    v = widths[k] = m.measureText(str).width; widthN++;
    return v;
  }
  var sprites = {}, spriteN = 0;
  function sprite(key, w, h, dpr, draw) {
    var k = key + '@' + dpr, sp = sprites[k];
    if (sp) return sp;
    if (spriteN > 90) { sprites = {}; spriteN = 0; }
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w * dpr)); cv.height = Math.max(1, Math.ceil(h * dpr));
    var c = cv.getContext('2d');
    c.scale(dpr, dpr);
    draw(c);
    sp = sprites[k] = { cv: cv, w: w, h: h };
    spriteN++;
    return sp;
  }
  function blit(c, sp, x, y) { c.drawImage(sp.cv, x, y, sp.w, sp.h); }
  function dprOf(H) { var m = H.ctx.getTransform ? H.ctx.getTransform() : null; return m && m.a > 0 ? Math.round(m.a * 4) / 4 : 2; }
  var AW = 34, AH = 38, AM = 14;
  function arrowSprite(dpr) {
    return sprite('arrow', AW + AM * 2, AH + AM * 2, dpr, function (c) {
      c.translate(AM + AW / 2, AM + AH);
      var hw = AW / 2, sw = AW * 0.23, hh = AH * 0.52;
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(hw, -hh); c.lineTo(sw, -hh); c.lineTo(sw, -AH);
      c.lineTo(-sw, -AH); c.lineTo(-sw, -hh); c.lineTo(-hw, -hh); c.closePath();
      var g = c.createLinearGradient(0, -AH, 0, 0);
      g.addColorStop(0, '#fff27a'); g.addColorStop(0.55, '#ffc21c'); g.addColorStop(1, '#ff7a2e');
      c.save();
      c.shadowColor = 'rgba(255,190,40,0.95)'; c.shadowBlur = 12;
      c.fillStyle = g; c.fill();
      c.restore();
      c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.moveTo(-AW * 0.12, -AH + 4); c.lineTo(-AW * 0.12, -AH * 0.58);
      c.lineWidth = 2.4; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.85)'; c.stroke();
    });
  }
  function drawArrow(c, dpr, x, y, rot, sc) {
    var sp = arrowSprite(dpr);
    c.save();
    c.translate(x, y); if (rot) c.rotate(rot); if (sc !== 1) c.scale(sc, sc);
    blit(c, sp, -(AM + AW / 2), -(AM + AH));
    c.restore();
  }
  function badgeSprite(dpr, r, col, n) {
    var s = (r + 4) * 2;
    return sprite('b' + r + col + n, s, s, dpr, function (c) {
      var x = s / 2, y = s / 2;
      c.beginPath(); c.arc(x, y, r + 2, 0, 7); c.fillStyle = '#ffffff'; c.fill();
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill();
      c.lineWidth = 2; c.strokeStyle = INK;
      c.beginPath(); c.arc(x, y, r + 2, 0, 7); c.stroke();
      popT(c, String(n), x, y + 0.5, Math.round(r * 1.3), '#ffffff', INK, Math.max(2.5, r * 0.3));
    });
  }
  function numBadge(c, dpr, x, y, r, col, n, sc) {
    var sp = badgeSprite(dpr, Math.round(r), col, n);
    if (sc && sc !== 1) {
      c.save(); c.translate(x, y); c.scale(sc, sc); blit(c, sp, -sp.w / 2, -sp.h / 2); c.restore();
    } else blit(c, sp, x - sp.w / 2, y - sp.h / 2);
  }
  function glyph(c, kind, x, y, r) {
    c.save();
    c.translate(x, y); c.scale(r / 10, r / 10);
    c.lineJoin = 'round'; c.lineWidth = 1.6; c.strokeStyle = INK; c.fillStyle = '#ffffff';
    if (kind === 'grab') {
      c.beginPath(); c.moveTo(-6, -1); c.lineTo(0, -4); c.lineTo(6, -1); c.lineTo(0, 2); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-6, -1); c.lineTo(0, 2); c.lineTo(0, 8); c.lineTo(-6, 5); c.closePath();
      c.fillStyle = '#e4e0f0'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(6, -1); c.lineTo(0, 2); c.lineTo(0, 8); c.lineTo(6, 5); c.closePath();
      c.fillStyle = '#c9c3dc'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -11); c.lineTo(3.5, -7.5); c.lineTo(-3.5, -7.5); c.closePath();
      c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.2; c.stroke();
    } else if (kind === 'truck') {
      c.beginPath(); c.rect(-8, -5, 10, 8); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(2, -2); c.lineTo(6, -2); c.lineTo(8.5, 1); c.lineTo(8.5, 3); c.lineTo(2, 3); c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = INK;
      c.beginPath(); c.arc(-4.5, 4.5, 2.2, 0, 7); c.fill();
      c.beginPath(); c.arc(5, 4.5, 2.2, 0, 7); c.fill();
    }
    c.restore();
  }
  function tagBadge(c, x, y, col, tag) {
    c.save();
    c.font = '900 11px ' + FONT;
    var w = tag === 'truck' ? 24 : Math.max(24, c.measureText(tag).width + 14), h = 24;
    rrP(c, x - 12, y - h / 2, w, h, h / 2); c.fillStyle = '#ffffff'; c.fill();
    rrP(c, x - 10, y - h / 2 + 2, w - 4, h - 4, h / 2 - 2); c.fillStyle = col; c.fill();
    rrP(c, x - 12, y - h / 2, w, h, h / 2); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    if (tag === 'truck') glyph(c, 'truck', x, y, 8.5);
    else popT(c, tag, x - 12 + w / 2, y + 0.5, 11, '#ffffff', INK, 3);
    c.restore();
  }
  function wBadgeSprite(k, R, col, n) {
    var s = R * 2 + 3;
    return sprite('wb' + R.toFixed(2) + col + n, s, s, k, function (c) {
      var x = s / 2, y = s / 2;
      c.beginPath(); c.arc(x, y, R + 0.9, 0, 7); c.fillStyle = '#ffffff'; c.fill();
      c.beginPath(); c.arc(x, y, R - 0.2, 0, 7); c.fillStyle = col; c.fill();
      c.beginPath(); c.arc(x - R * 0.25, y - R * 0.3, R * 0.55, 3.3, 4.6);
      c.lineWidth = R * 0.14; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
      c.beginPath(); c.arc(x, y, R + 0.9, 0, 7); c.lineWidth = R * 0.2; c.strokeStyle = INK; c.stroke();
      if (typeof n === 'number') popT(c, String(n), x, y + R * 0.06, R * 1.35, '#ffffff', INK, R * 0.34);
      else glyph(c, n, x, y + R * 0.05, R * 0.78);
    });
  }
  var PH = 28, PM = 6;
  function moneyOf(H, info) {
    if (!info) return null;
    if (info.gain) return { s: '+¥' + H.G.fmt(info.gain), c: '#1f9a5e' };
    if (info.cost) return { s: '-¥' + H.G.fmt(info.cost), c: '#c0392b' };
    return null;
  }
  function pillSprite(H, dpr, res, info) {
    var label = labelOf(res, H), money = res.wait ? null : moneyOf(H, info), col = FLOW_COL[res.flow] || HOT;
    var tw = textW(label, '900 12.5px ' + FONT), mw = money ? textW(money.s, '800 11px ' + FONT) + 8 : 0;
    var w = Math.ceil(50 + (res.step || res.ico ? 24 : 6) + tw + mw + 12);
    var key = 'p|' + label + '|' + (money ? money.s : '') + '|' + res.step + '|' + (res.ico || '') + '|' + col + '|' + (res.wait ? 1 : 0);
    var sp = sprite(key, w + PM * 2, PH + PM * 2 + 3, dpr, function (c) {
      c.translate(PM, PM);
      rrP(c, 0, 3, w, PH, PH / 2); c.fillStyle = 'rgba(40,20,70,0.28)'; c.fill();
      rrP(c, 0, 0, w, PH, PH / 2); c.fillStyle = '#ffffff'; c.fill();
      c.save();
      rrP(c, 0, 0, w, PH, PH / 2); c.clip();
      var g = c.createLinearGradient(0, 0, 50, PH);
      if (res.wait) { g.addColorStop(0, '#8a7cf0'); g.addColorStop(1, '#4fb6e8'); }
      else { g.addColorStop(0, '#ff4fa0'); g.addColorStop(1, '#ff9a3c'); }
      c.fillStyle = g; c.fillRect(0, 0, 50, PH);
      c.restore();
      popT(c, 'NEXT!', 26, PH / 2 + 0.5, 12, '#ffffff', INK, 3.5);
      var x = 56;
      if (res.step || res.ico) {
        c.beginPath(); c.arc(x + 8, PH / 2, 10, 0, 7); c.fillStyle = '#ffffff'; c.fill();
        c.beginPath(); c.arc(x + 8, PH / 2, 8, 0, 7); c.fillStyle = res.step === 4 ? PAY : col; c.fill();
        c.lineWidth = 1.8; c.strokeStyle = INK; c.beginPath(); c.arc(x + 8, PH / 2, 10, 0, 7); c.stroke();
        if (res.ico) glyph(c, res.ico, x + 8, PH / 2, 7);
        else popT(c, String(res.step), x + 8, PH / 2 + 0.5, 10.5, '#ffffff', INK, 2.6);
        x += 22;
      }
      txtT(c, label, x, PH / 2 + 0.5, 12.5, INK, 900);
      if (money) txtT(c, money.s, x + tw + 8, PH / 2 + 0.5, 11, money.c, 800);
      rrP(c, 0, 0, w, PH, PH / 2); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
    });
    sp.pw = w;
    return sp;
  }
  function drawPill(c, sp, x, y, t, wait) {
    blit(c, sp, x - PM, y - PM);
    if (wait) return;
    var k = (t % 2.4) / 0.7;
    if (k < 1) {
      c.save();
      rrP(c, x, y, sp.pw, PH, PH / 2); c.clip();
      var sx = x - 30 + k * (sp.pw + 60);
      c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + 14, y); c.lineTo(sx + 2, y + PH); c.lineTo(sx - 12, y + PH); c.closePath();
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
      c.restore();
    }
  }
  function uiBand(S, H) {
    return { top: H.hudBottom() + 4, bottom: H.cssH - 62 };
  }
  function blockers(S, H) {
    var out = [], hb = H.hudBottom();
    if (S.jobs.length) {
      var w = Math.min(H.cssW - 20, 240);
      out.push({ x: H.cssW - 10 - w, y: hb, w: w, h: S.jobs.length * 35 });
    }
    if (S.offer) {
      var ow = Math.min(H.cssW - 40, 300);
      out.push({ x: (H.cssW - ow) / 2, y: hb + 34, w: ow, h: 76 });
    }
    if (S.heldPad) {
      var pw = Math.min(H.cssW - 24, 340);
      out.push({ x: (H.cssW - pw) / 2, y: H.cssH - 126, w: pw, h: 58 });
    }
    if (S.report) {
      var rw = Math.min(H.cssW - 60, 230);
      out.push({ x: H.cssW - rw - 10, y: H.cssH - 234, w: rw, h: 104 });
    }
    if (S.heldPad && S.heldPad.x != null) {
      var hp = S.heldPad, hs = H.toScreen((hp.x + 0.5) * TILE, (hp.y + 0.5) * TILE, 4);
      var bx = clamp(hs.x, 70, H.cssW - 70);
      out.push({ x: bx - 85, y: hs.y - 20 - 48, w: 170, h: 54 });
    }
    if (hits.q) out.push(hits.q);
    for (var i = 0; i < shownBadges.length; i++) out.push(shownBadges[i]);
    return out;
  }
  function labelRect(S, H, p) {
    if (!p || !S.p[p.id]) return null;
    var st = S.p[p.id], z = H.z, fs = Math.max(10, Math.min(14, 3.9 * z));
    var hh = st.owned ? (p.kind === 'store' || p.kind === 'cafe' || p.kind === 'office' ? H.H_PLOT + 14 : H.H_PLOT + 18) : 22;
    var s = H.toScreen((p.x + p.w / 2) * TILE, (p.y + p.h / 2) * TILE, hh);
    var name = H.L.nm(p, 'short') + (p.cost && st.level ? '  Lv.' + st.level : '');
    var w = textW(name, '800 ' + fs + 'px ' + FONT) + 10, h = st.owned ? fs + 8 : fs * 2.8;
    return { x: s.x - w / 2, y: s.y - h / 2, w: w, h: h, cx: s.x };
  }
  function overlapArea(r, list) {
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var ox = Math.min(r.x + r.w, b.x + b.w) - Math.max(r.x, b.x);
      var oy = Math.min(r.y + r.h, b.y + b.h) - Math.max(r.y, b.y);
      if (ox > 0 && oy > 0) sum += ox * oy;
    }
    return sum;
  }
  function overlaps(r, list) { return overlapArea(r, list) > 0; }
  function edgeSprite(dpr, col) {
    var R = 19, s = (R + 6) * 2;
    return sprite('e' + col, s, s + 3, dpr, function (c) {
      c.beginPath(); c.arc(s / 2, s / 2 + 3, R, 0, 7); c.fillStyle = 'rgba(40,20,70,0.28)'; c.fill();
      c.beginPath(); c.arc(s / 2, s / 2, R, 0, 7); c.fillStyle = col; c.fill();
      c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(s / 2, s / 2, R - 4, 3.6, 4.6); c.lineWidth = 2.2; c.lineCap = 'round';
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    });
  }
  var BOUNCE = 8;
  function arrowGeo(s, H, a, side, pw) {
    var hh = TILE * IB * H.z, hw = TILE * IA * H.z;
    var ang = a === 2 ? Math.PI : a * 0.55;
    var ux = Math.sin(ang), uy = -Math.cos(ang);
    var tip = a === 2 ? { x: s.x, y: s.y + hh + 3 }
            : { x: s.x + ux * hw * 0.5, y: s.y - (a === 0 ? hh : hh * 0.55) - 3 };
    var L = AH + BOUNCE;
    var tail = { x: tip.x + ux * L, y: tip.y + uy * L };
    var ax0 = Math.min(tip.x, tail.x) - AW / 2 - 2, ax1 = Math.max(tip.x, tail.x) + AW / 2 + 2;
    var ay0 = Math.min(tip.y, tail.y) - 2, ay1 = Math.max(tip.y, tail.y) + 2;
    var arrow = { x: ax0, y: ay0, w: ax1 - ax0, h: ay1 - ay0 };
    var px, py;
    if (side === 0) {
      px = tail.x - pw / 2;
      py = a === 2 ? tail.y + 4 : tail.y - PH - 4;
    } else {
      var gap = AW * 0.5 + Math.abs(ux) * BOUNCE + 10;
      px = side > 0 ? tail.x + gap : tail.x - gap - pw;
      py = a === 2 ? tail.y - PH + 2 : tail.y - 2;
    }
    return { ang: ang, ux: ux, uy: uy, tip: tip, tail: tail, arrow: arrow, side: side,
             pill: { x: px, y: py, w: pw, h: PH } };
  }
  function roomLabels(S, H, roomId, skip) {
    var out = [], P = QT.World.PLOTS;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (p.room !== roomId || p === skip) continue;
      var r = labelRect(S, H, p);
      if (r && r.x < H.cssW && r.x + r.w > 0 && r.y < H.cssH && r.y + r.h > 0) out.push(r);
    }
    return out;
  }
  function drawNext(S, H, res, alpha) {
    var c = H.ctx, t = S.t, band = uiBand(S, H), dpr = dprOf(H);
    var info = res.pad && res.pad.type ? H.G.padInfo(res.pad) : null;
    var q = tgtPt(res), s = H.toScreen(q.x, q.y, 0);
    var sp = pillSprite(H, dpr, res, info), pw = sp.pw, bl = blockers(S, H);
    var bounce = Math.abs(Math.sin(t * 4.2)) * 8;
    var onScreen = s.x > 14 && s.x < H.cssW - 14 && s.y > band.top + 20 && s.y < band.bottom;
    c.save();
    c.globalAlpha = alpha;
    if (onScreen) {
      var plot = tgtPlot(res), lab = labelRect(S, H, plot);
      var all = lab ? bl.concat([lab]) : bl;
      var soft = roomLabels(S, H, plot ? plot.room : roomAt(q.y), plot);
      var away = lab && lab.cx > s.x ? -1 : 1;
      var cands = [[0, away], [0, -away], [away, away], [0, 0], [-away, -away], [2, away], [2, -away], [2, 0]];
      var best = null, bestCost = 1e9;
      for (var i = 0; i < cands.length; i++) {
        var g = arrowGeo(s, H, cands[i][0], cands[i][1], pw), p = g.pill;
        var over = Math.max(0, 6 - p.x) + Math.max(0, p.x + p.w - (H.cssW - 6));
        p.x = clamp(p.x, 6, H.cssW - 6 - pw);
        var cost = overlapArea(g.arrow, all) + overlapArea(p, all) + overlapArea(p, soft) * 0.35 +
                   overlapArea(p, [g.arrow]) * 3 + over * 2 + i * 25;
        var top = Math.min(p.y, g.arrow.y), bot = Math.max(p.y + p.h, g.arrow.y + g.arrow.h);
        if (top < band.top) cost += (band.top - top) * 400;
        if (bot > band.bottom) cost += (bot - band.bottom) * 400;
        if (cost < bestCost) { bestCost = cost; best = g; }
        if (cost <= i * 25) break;
      }
      var gm = best, pl = gm.pill;
      if (vis && vis.inside) {
        var rx = TILE * 0.82 * H.z, ry = TILE * 0.44 * H.z, k = (t * 1.3) % 1;
        c.lineWidth = 2.6; c.strokeStyle = '#ffd23f';
        c.beginPath(); c.ellipse(s.x, s.y, rx, ry, 0, 0, 7); c.stroke();
        c.globalAlpha = alpha * (1 - k); c.lineWidth = 2; c.strokeStyle = '#ffffff';
        c.beginPath(); c.ellipse(s.x, s.y, rx * (1 + k * 0.7), ry * (1 + k * 0.7), 0, 0, 7); c.stroke();
        c.globalAlpha = alpha;
      }
      c.beginPath();
      if (gm.side === 0) {
        var nx = clamp(gm.tail.x, pl.x + 18, pl.x + pw - 18), dn = gm.uy < 0;
        var ny = dn ? pl.y + PH - 1 : pl.y + 1;
        c.moveTo(nx - 7, ny); c.lineTo(nx, ny + (dn ? 8 : -8)); c.lineTo(nx + 7, ny);
      } else {
        var ey0 = pl.y + PH / 2, ex0 = gm.side > 0 ? pl.x + 1 : pl.x + pw - 1;
        c.moveTo(ex0, ey0 - 6); c.lineTo(ex0 - gm.side * 9, ey0); c.lineTo(ex0, ey0 + 6);
      }
      c.closePath();
      c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke();
      var tx = gm.tip.x + gm.ux * bounce, ty = gm.tip.y + gm.uy * bounce;
      drawArrow(c, dpr, tx, ty, gm.ang, 1 + 0.06 * Math.sin(t * 8.4));
      drawPill(c, sp, pl.x, pl.y, t, res.wait);
      for (var j = 0; j < 3; j++) {
        var a2 = t * 2.2 + j * 2.1, rr0 = 20 + 4 * Math.sin(t * 3 + j);
        var tw = 0.5 + 0.5 * Math.sin(t * 7 + j * 2);
        if (tw > 0.3) H.star(gm.tail.x + Math.cos(a2) * rr0 * 0.8, gm.tail.y - gm.uy * 6 + Math.sin(a2) * rr0 * 0.5,
                             2.2 + tw * 2.3, j % 2 ? '#ffffff' : '#ffd23f');
      }
      hits.next = { x: pl.x - 4, y: pl.y - 4, w: pw + 8, h: PH + 8 };
      hits.nextA = gm.arrow;
      c.restore();
      return;
    }
    var cx0 = H.cssW / 2, cy0 = (band.top + band.bottom) / 2;
    var dx = s.x - cx0, dy = s.y - cy0;
    var L0 = 30, R0 = H.cssW - 30, T0 = band.top + 44, B0 = band.bottom - 26;
    var kx = dx > 0 ? (R0 - cx0) / dx : dx < 0 ? (L0 - cx0) / dx : 1e9;
    var ky = dy > 0 ? (B0 - cy0) / dy : dy < 0 ? (T0 - cy0) / dy : 1e9;
    var kk = Math.min(kx, ky);
    var ex = cx0 + dx * kk, ey = cy0 + dy * kk;
    for (var b = 0; b < bl.length; b++) {
      var o = bl[b];
      if (ex > o.x - 26 && ex < o.x + o.w + 26 && ey > o.y - 26 && ey < o.y + o.h + 26 && o.y < cy0)
        ey = o.y + o.h + 28;
    }
    var ang = Math.atan2(s.y - ey, s.x - ex), col = FLOW_COL[res.flow] || HOT, rad = 19;
    var pulse = (t * 1.4) % 1;
    c.globalAlpha = alpha * (1 - pulse); c.strokeStyle = col; c.lineWidth = 3;
    c.beginPath(); c.arc(ex, ey, rad + 4 + pulse * 12, 0, 7); c.stroke();
    c.globalAlpha = alpha;
    var es = edgeSprite(dpr, col);
    blit(c, es, ex - es.w / 2, ey - (es.h - 3) / 2);
    var nud = Math.sin(t * 8) * 2;
    drawArrow(c, dpr, ex + Math.cos(ang) * (12 + nud), ey + Math.sin(ang) * (12 + nud), ang - Math.PI / 2, 0.62);
    var lx = ex > cx0 ? ex - rad - 8 - pw : ex + rad + 8;
    lx = clamp(lx, 6, H.cssW - 6 - pw);
    var ly = clamp(ey - PH / 2, band.top, band.bottom - PH);
    if (Math.abs(ex - cx0) < H.cssW * 0.25) {
      lx = clamp(ex - pw / 2, 6, H.cssW - 6 - pw);
      ly = ey < cy0 ? ey + rad + 8 : ey - rad - 8 - PH;
    }
    drawPill(c, sp, lx, ly, t, res.wait);
    hits.next = { x: lx - 4, y: ly - 4, w: pw + 8, h: PH + 8 };
    hits.nextA = { x: ex - rad - 4, y: ey - rad - 4, w: rad * 2 + 8, h: rad * 2 + 8 };
    c.restore();
  }
  function qRect(S, H) {
    var s = 34, x = 10, y = H.hudBottom() + 2;
    var r = { x: x, y: y, w: s, h: s };
    if (S.offer) {
      var ow = Math.min(H.cssW - 40, 300), ox = (H.cssW - ow) / 2;
      if (ox < x + s + 4) r.y = H.hudBottom() + 34 + 76 + 6;
    }
    return r;
  }
  function qSprite(dpr) {
    var s = 34;
    return sprite('q', s + 8, s + 11, dpr, function (c) {
      c.translate(4, 4);
      rrP(c, 0, 3, s, s, 12); c.fillStyle = 'rgba(50,40,80,0.2)'; c.fill();
      c.save();
      rrP(c, 0, 0, s, s, 12); c.clip();
      c.fillStyle = SW; c.fillRect(0, 0, s / 2, s);
      c.fillStyle = HW; c.fillRect(s / 2, 0, s / 2, s);
      c.restore();
      rrP(c, 4, 4, s - 8, s - 8, 8); c.fillStyle = '#ffffff'; c.fill();
      popT(c, '?', s / 2, s / 2 + 1, 19, '#6f57e0', '#ffffff', 3);
      rrP(c, 0, 0, s, s, 12); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    });
  }
  function drawQ(S, H) {
    var r = qRect(S, H);
    var b = !seen.q ? Math.abs(Math.sin(S.t * 3)) * 2 : 0;
    blit(H.ctx, qSprite(dprOf(H)), r.x - 4, r.y - 4 - b);
    hits.q = r;
  }
  var CARDS = {
    sw: { col: SW, dark: '#1b86a6', tint: '#eaf8fd', title: 'guide_sw_title', tip: 'guide_sw_tip',
          steps: [['order', 'guide_sw1', 'guide_sw1s'], ['code', 'guide_sw2', 'guide_sw2s'],
                  ['box', 'guide_sw3', 'guide_sw3s'], ['coin', 'guide_pay', 'guide_pays']] },
    hw: { col: HW, dark: '#c2571a', tint: '#fff3e9', title: 'guide_hw_title', tip: 'guide_hw_tip',
          steps: [['parts', 'guide_hw1', 'guide_hw1s'], ['proto', 'guide_hw2', 'guide_hw2s'],
                  ['machine', 'guide_hw3', 'guide_hw3s'], ['coin', 'guide_pay', 'guide_pays']] },
    plant: { col: HW, dark: '#c2571a', tint: '#fff3e9', title: 'guide_pl_title', tip: 'guide_pl_tip',
             tags: ['1-3', '4-11', '12', 'truck'],
             steps: [['design', 'guide_pl1', 'guide_pl1s'], ['wafer', 'guide_pl2', 'guide_pl2s'],
                     ['machine', 'guide_pl3', 'guide_pl3s'], ['truck', 'guide_pl4', 'guide_pl4s']] },
    spec: { col: '#7a5af5', dark: '#5236c9', tint: '#f3efff', title: 'guide_sp_title', sum: true,
            tip: function (S, G) { return G.specPlan().next ? 'guide_sp_tip' : 'guide_sp_tipmax'; },
            tags: function (S, G) {
              var sp = G.specPlan();
              return ['Lv' + sp.rd, sp.nSt + '/11', '+0.35', sp.nF + '/3'];
            },
            vars: function (S, G) {
              var sp = G.specPlan();
              return { rd: sp.rdGain.toFixed(1), st: (1 + sp.rd * 0.12).toFixed(1), ns: sp.nSt, nf: sp.nF,
                       t: sp.tier.toFixed(1), q: sp.q, s: 3.5, g: sp.goal.toFixed(1), q2: sp.next, n: sp.need.toFixed(1) };
            },
            steps: [['proto', 'guide_sp1', 'guide_sp1s'], ['wafer', 'guide_sp2', 'guide_sp2s'],
                    ['design', 'guide_sp3', 'guide_sp3s'], ['parts', 'guide_sp4', 'guide_sp4s']] }
  };
  var card = null, pending = null;
  function openCards(list) {
    if (!list.length) return;
    card = { list: list, i: 0, t0: now() };
    list.forEach(function (k) { seen[k] = 1; });
    saveSeen();
  }
  function advanceCard() {
    if (now() - card.t0 < 0.5) return;
    card.i++;
    if (card.i >= card.list.length) card = null; else card.t0 = now();
  }
  function easeBack(k) { var s = 1.9; k -= 1; return 1 + k * k * ((s + 1) * k + s); }
  function icon(H, kind, col, t) {
    var c = H.ctx;
    c.save();
    c.lineJoin = 'round'; c.lineCap = 'round';
    function stroke(lw) { c.lineWidth = lw || 2; c.strokeStyle = INK; c.stroke(); }
    function check(x, y, r) {
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = '#2fbf7a'; c.fill(); stroke(2);
      c.beginPath(); c.moveTo(x - r * 0.45, y); c.lineTo(x - r * 0.1, y + r * 0.38); c.lineTo(x + r * 0.5, y - r * 0.35);
      c.lineWidth = 2.6; c.strokeStyle = '#ffffff'; c.stroke();
    }
    var i, k;
    switch (kind) {
      case 'order':
        c.save(); c.rotate(-0.12);
        H.rr(-14, -19, 28, 36, 4); c.fillStyle = '#ffffff'; c.fill(); stroke(2.2);
        c.save(); H.rr(-14, -19, 28, 36, 4); c.clip(); c.fillStyle = col; c.fillRect(-14, -19, 28, 8); c.restore();
        H.rr(-14, -19, 28, 36, 4); stroke(2.2);
        for (i = 0; i < 3; i++) H.fillRR(-9, -5 + i * 7, [18, 13, 16][i], 3, 1.5, '#c9c3d8');
        c.restore();
        k = 1 + 0.12 * Math.max(0, Math.sin(t * 5));
        c.save(); c.translate(12, 11); c.scale(k, k); check(0, 0, 9); c.restore();
        break;
      case 'code':
        H.rr(-21, -17, 42, 29, 5); c.fillStyle = '#3a3550'; c.fill(); stroke(2.2);
        H.fillRR(-17, -13, 34, 21, 3, '#1c2340');
        var rows = [[-14, 11, '#7fd6ff'], [-10, 15, '#ff8fc8'], [-10, 9, '#ffd23f'], [-14, 13, '#7fd6ff']];
        var shown = Math.floor(t * 2.5) % 6;
        for (i = 0; i < rows.length && i < Math.max(1, shown); i++) H.fillRR(rows[i][0], -10 + i * 4.6, rows[i][1], 2.6, 1.3, rows[i][2]);
        if (Math.floor(t * 3) % 2) H.fillRR(-14 + (shown % 4) * 3 + 10, -10 + Math.min(3, shown) * 4.6, 2, 3, 0.5, '#ffffff');
        c.fillStyle = '#8f93a8'; c.fillRect(-4, 12, 8, 5);
        H.rr(-11, 16, 22, 4, 2); c.fillStyle = '#b9bdd0'; c.fill(); stroke(1.8);
        c.save(); c.translate(15, -18); H.star(0, 0, 4.5 + Math.sin(t * 6), '#ffd23f'); c.restore();
        break;
      case 'box':
        c.beginPath(); c.moveTo(-16, -4); c.lineTo(-8, -13); c.lineTo(15, -13); c.lineTo(7, -4); c.closePath();
        c.fillStyle = '#f8dcb4'; c.fill(); stroke(2);
        c.beginPath(); c.moveTo(7, -4); c.lineTo(15, -13); c.lineTo(15, 8); c.lineTo(7, 17); c.closePath();
        c.fillStyle = '#d9a66b'; c.fill(); stroke(2);
        H.rr(-16, -4, 23, 21, 1.5); c.fillStyle = '#f2c48d'; c.fill(); stroke(2);
        c.fillStyle = col; c.fillRect(-7, -4, 5, 21);
        c.beginPath(); c.moveTo(-7, -4); c.lineTo(1, -13); c.lineTo(6, -13); c.lineTo(-2, -4); c.closePath(); c.fill();
        k = Math.sin(t * 4) * 2;
        c.save(); c.translate(0, k);
        c.beginPath(); c.moveTo(12, -17); c.lineTo(20, -24); c.moveTo(20, -24); c.lineTo(14, -24); c.moveTo(20, -24); c.lineTo(20, -18);
        c.lineWidth = 2.6; c.strokeStyle = '#2fbf7a'; c.stroke();
        c.restore();
        check(14, 12, 8);
        break;
      case 'coin':
        for (i = 0; i < 3; i++) {
          var cy = 14 - i * 5.5;
          c.beginPath(); c.ellipse(-8, cy + 2.5, 11, 4.6, 0, 0, 7); c.fillStyle = '#d99a0a'; c.fill(); stroke(1.8);
          c.beginPath(); c.ellipse(-8, cy, 11, 4.6, 0, 0, 7); c.fillStyle = '#ffd23f'; c.fill(); stroke(1.8);
        }
        k = Math.sin(t * 5) * 1.5;
        c.beginPath(); c.arc(9, -4 + k, 12.5, 0, 7); c.fillStyle = '#ffd23f'; c.fill(); stroke(2.2);
        c.beginPath(); c.arc(9, -4 + k, 8.6, 0, 7); c.lineWidth = 1.6; c.strokeStyle = '#d99a0a'; c.stroke();
        H.txt('¥', 9, -3.5 + k, 12, '#a86f00', 'center', 900);
        H.star(-17, -12, 3.5 + Math.sin(t * 7) * 1.2, '#ffffff');
        H.star(21, -17, 3 + Math.cos(t * 6) * 1.2, '#ffd23f');
        break;
      case 'parts':
        c.save(); c.rotate(-0.25);
        H.rr(-10, -20, 15, 13, 2); c.fillStyle = '#2fbf7a'; c.fill(); stroke(1.8);
        for (i = 0; i < 3; i++) H.fillRR(-7 + i * 4, -18, 2.4, 3, 0.8, '#ffd23f');
        H.fillRR(-6, -13, 7, 4, 1, '#3a3550');
        c.restore();
        c.beginPath();
        for (i = 0; i < 6; i++) { var a6 = i * Math.PI / 3; c.lineTo(10 + Math.cos(a6) * 5, -12 + Math.sin(a6) * 5); }
        c.closePath(); c.fillStyle = '#b9bdd0'; c.fill(); stroke(1.8);
        c.beginPath(); c.arc(10, -12, 1.8, 0, 7); c.fillStyle = '#6d6785'; c.fill();
        H.rr(-19, -6, 38, 23, 3); c.fillStyle = '#c8945a'; c.fill(); stroke(2.2);
        c.beginPath(); c.moveTo(-19, 2); c.lineTo(19, 2); c.moveTo(-19, 10); c.lineTo(19, 10);
        c.lineWidth = 1.5; c.strokeStyle = '#8a5a2c'; c.stroke();
        c.beginPath(); c.moveTo(-13, -6); c.lineTo(-13, 17); c.moveTo(13, -6); c.lineTo(13, 17);
        c.lineWidth = 2.4; c.strokeStyle = '#8a5a2c'; c.stroke();
        break;
      case 'proto':
        H.rr(-18, -13, 24, 24, 3); c.fillStyle = '#3a3550'; c.fill(); stroke(2);
        H.fillRR(-12, -7, 12, 12, 2, '#8f93a8');
        c.fillStyle = '#ffd23f';
        for (i = 0; i < 4; i++) {
          c.fillRect(-23, -9 + i * 5.5, 5, 2); c.fillRect(6, -9 + i * 5.5, 5, 2);
          c.fillRect(-15 + i * 5.5, -18, 2, 5); c.fillRect(-15 + i * 5.5, 11, 2, 5);
        }
        k = Math.sin(t * 3) * 2;
        c.save(); c.translate(k, 0);
        c.beginPath(); c.moveTo(12, 10); c.lineTo(19, 18); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
        c.beginPath(); c.arc(6, 3, 9.5, 0, 7); c.fillStyle = 'rgba(191,239,255,0.65)'; c.fill(); stroke(2.6);
        c.beginPath(); c.arc(3, 0, 3.5, 3.4, 4.8); c.lineWidth = 1.8; c.strokeStyle = '#ffffff'; c.stroke();
        c.restore();
        var up = Math.abs(Math.sin(t * 4)) * 3;
        c.save(); c.translate(15, -13 - up);
        c.beginPath(); c.moveTo(0, -8); c.lineTo(6, -1); c.lineTo(2.5, -1); c.lineTo(2.5, 5); c.lineTo(-2.5, 5); c.lineTo(-2.5, -1); c.lineTo(-6, -1); c.closePath();
        c.fillStyle = '#2fbf7a'; c.fill(); stroke(1.8);
        c.restore();
        break;
      case 'machine':
        H.fillRR(-18, -22, 36, 4.5, 2, '#b9bdd0'); H.rr(-18, -22, 36, 4.5, 2); stroke(1.8);
        var tiers = [[-12, 15], [-2, 12.5], [8, 9.5]];
        c.lineWidth = 2; c.strokeStyle = '#c98f0f';
        c.beginPath();
        for (i = -1; i <= 1; i++) { c.moveTo(i * 9, -18); c.lineTo(i * 6.5, 8); }
        c.stroke();
        c.beginPath();
        for (i = 0; i < 2; i++) {
          var xo = i ? 4 : -4;
          c.moveTo(xo, -18);
          c.bezierCurveTo(xo + 7 * Math.sin(t * 2 + i), -8, xo - 6, 0, xo * 0.6, 8);
        }
        c.lineWidth = 1.6; c.strokeStyle = '#e07a3a'; c.stroke();
        for (i = 0; i < tiers.length; i++) {
          c.beginPath(); c.ellipse(0, tiers[i][0] + 2, tiers[i][1], 3.6, 0, 0, 7); c.fillStyle = '#d99a0a'; c.fill(); stroke(1.6);
          c.beginPath(); c.ellipse(0, tiers[i][0], tiers[i][1], 3.6, 0, 0, 7); c.fillStyle = '#ffd23f'; c.fill(); stroke(1.6);
        }
        var gl = 0.6 + 0.4 * Math.sin(t * 6);
        c.beginPath(); c.arc(0, 16.5, 7 + gl * 3, 0, 7); c.fillStyle = 'rgba(185,156,255,' + (0.25 + gl * 0.3) + ')'; c.fill();
        H.fillRR(-5, 13, 10, 7, 2, '#6f57e0');
        H.rr(-5, 13, 10, 7, 2); stroke(1.6);
        H.star(17, 12, 3 + gl * 1.5, '#ffffff');
        break;
      case 'design':
        H.rr(-21, -17, 42, 29, 5); c.fillStyle = '#3a3550'; c.fill(); stroke(2.2);
        H.fillRR(-17, -13, 34, 21, 3, '#1f5fa8');
        c.beginPath();
        for (i = 1; i < 6; i++) { c.moveTo(-17 + i * 5.67, -13); c.lineTo(-17 + i * 5.67, 8); }
        for (i = 1; i < 4; i++) { c.moveTo(-17, -13 + i * 5.25); c.lineTo(17, -13 + i * 5.25); }
        c.lineWidth = 0.6; c.strokeStyle = 'rgba(255,255,255,0.22)'; c.stroke();
        H.rr(-5, -8, 10, 10, 1.5); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill();
        c.lineWidth = 1.5; c.strokeStyle = '#ffffff'; c.stroke();
        c.beginPath();
        c.moveTo(-5, -5); c.lineTo(-13, -5); c.lineTo(-13, -10);
        c.moveTo(5, -1); c.lineTo(13, -1); c.lineTo(13, 5);
        c.moveTo(0, 2); c.lineTo(0, 5); c.lineTo(-10, 5);
        c.lineWidth = 1.3; c.strokeStyle = '#7fe3ff'; c.stroke();
        c.fillStyle = '#ffd23f';
        c.fillRect(-14.5, -11.5, 3, 3); c.fillRect(11.5, 3.5, 3, 3); c.fillRect(-11.5, 3.5, 3, 3);
        k = (t * 0.8) % 1;
        c.beginPath(); c.arc(5 + k * 8, -1, 1.8, 0, 7); c.fillStyle = '#ffffff'; c.fill();
        c.fillStyle = '#8f93a8'; c.fillRect(-4, 12, 8, 5);
        H.rr(-11, 16, 22, 4, 2); c.fillStyle = '#b9bdd0'; c.fill(); stroke(1.8);
        c.save(); c.translate(16, -18); H.star(0, 0, 4.2 + Math.sin(t * 6), '#ffd23f'); c.restore();
        break;
      case 'wafer':
        c.beginPath(); c.arc(0, 0, 19, Math.PI / 2 + 0.38, Math.PI / 2 - 0.38 + Math.PI * 2); c.closePath();
        c.fillStyle = '#d9dcea'; c.fill(); stroke(2.2);
        c.save();
        c.beginPath(); c.arc(0, 0, 16.5, 0, 7); c.clip();
        for (var gy = -3; gy <= 2; gy++) for (var gx = -3; gx <= 2; gx++) {
          var on2 = ((gx + gy + Math.floor(t * 3)) % 3 + 3) % 3 === 0;
          c.fillStyle = on2 ? '#ffd23f' : (gx + gy) % 2 ? '#8fd3ff' : '#b8a6ff';
          c.fillRect(gx * 5.6 + 0.6, gy * 5.6 + 0.6, 4.4, 4.4);
        }
        k = ((t * 0.6) % 1.4) - 0.2;
        c.globalAlpha = 0.55; c.fillStyle = '#ffffff';
        c.beginPath(); c.moveTo(-20 + k * 40, -20); c.lineTo(-12 + k * 40, -20); c.lineTo(-24 + k * 40, 20); c.lineTo(-32 + k * 40, 20);
        c.closePath(); c.fill();
        c.restore();
        H.star(17, -15, 3.5 + Math.sin(t * 6) * 1.2, '#ffd23f');
        break;
      case 'truck':
        c.beginPath();
        for (i = 0; i < 3; i++) { var ly = -4 + i * 6, lo = ((t * 30 + i * 7) % 12); c.moveTo(-30 + lo, ly); c.lineTo(-24 + lo, ly); }
        c.lineWidth = 1.8; c.strokeStyle = '#b9b3c8'; c.stroke();
        H.rr(-21, -12, 26, 20, 3); c.fillStyle = '#ffffff'; c.fill(); stroke(2.2);
        c.fillStyle = col; c.fillRect(-20, -3, 24, 4);
        c.beginPath(); c.moveTo(7, -6); c.lineTo(14, -6); c.lineTo(20, 1); c.lineTo(20, 8); c.lineTo(7, 8); c.closePath();
        c.fillStyle = SW; c.fill(); stroke(2.2);
        c.beginPath(); c.moveTo(10, -3); c.lineTo(13.5, -3); c.lineTo(17, 1.5); c.lineTo(10, 1.5); c.closePath();
        c.fillStyle = '#d6f4ff'; c.fill(); stroke(1.4);
        for (i = 0; i < 2; i++) {
          var wx = i ? 13 : -13;
          c.beginPath(); c.arc(wx, 10, 4.6, 0, 7); c.fillStyle = INK; c.fill();
          c.beginPath(); c.arc(wx, 10, 1.8, 0, 7); c.fillStyle = '#b9bdd0'; c.fill();
        }
        k = Math.abs(Math.sin(t * 3.2)) * 4;
        c.beginPath(); c.arc(-6, -20 - k, 6.5, 0, 7); c.fillStyle = '#ffd23f'; c.fill(); stroke(1.8);
        H.txt('¥', -6, -19.6 - k, 8, '#a86f00', 'center', 900);
        H.star(8, -20, 3 + Math.cos(t * 6) * 1.1, '#ffffff');
        break;
    }
    c.restore();
  }
  function fitTxt(H, s, x, y, size, maxW, col, weight) {
    var c = H.ctx, fs = size;
    c.font = weight + ' ' + fs + 'px ' + H.FONT;
    while (fs > 8 && c.measureText(s).width > maxW) { fs -= 0.5; c.font = weight + ' ' + fs + 'px ' + H.FONT; }
    H.txt(s, x, y, fs, col, 'center', weight);
  }
  function cardArrow(H, x, y, rot, col) {
    var c = H.ctx;
    c.save();
    c.translate(x, y); c.rotate(rot);
    c.beginPath();
    c.moveTo(9, 0); c.lineTo(0, -9); c.lineTo(0, -4.5); c.lineTo(-9, -4.5); c.lineTo(-9, 4.5); c.lineTo(0, 4.5); c.lineTo(0, 9);
    c.closePath();
    c.fillStyle = col; c.fill(); c.lineJoin = 'round'; c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    c.restore();
  }
  function drawCard(S, H) {
    var c = H.ctx, def = CARDS[card.list[card.i]], t = now(), e = t - card.t0, L = H.L, dpr = dprOf(H);
    var V = def.vars ? def.vars(S, H.G) : undefined;
    var tags = typeof def.tags === 'function' ? def.tags(S, H.G) : def.tags;
    var tipKey = typeof def.tip === 'function' ? def.tip(S, H.G) : def.tip;
    var W0 = H.cssW, H0 = H.cssH;
    c.save();
    c.globalAlpha = Math.min(1, e / 0.2) * 0.55; c.fillStyle = '#1a1030'; c.fillRect(0, 0, W0, H0);
    c.restore();
    var cw = Math.min(W0 - 24, 380), ch = 436;
    var sc = Math.min(1, (H0 - 24) / ch) * (0.55 + 0.45 * easeBack(Math.min(1, e / 0.38)));
    c.save();
    c.translate(W0 / 2, H0 / 2); c.scale(sc, sc); c.translate(-cw / 2, -ch / 2);
    H.fillRR(3, 8, cw, ch, 22, 'rgba(20,10,40,0.35)');
    H.fillRR(0, 0, cw, ch, 22, '#ffffff');
    c.save();
    H.rr(0, 0, cw, ch, 22); c.clip();
    c.fillStyle = def.col; c.fillRect(0, 0, cw, 58);
    c.fillStyle = 'rgba(255,255,255,0.18)';
    var so = (t * 14) % 28;
    for (var x = -60 + so; x < cw + 60; x += 28) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 14, 0); c.lineTo(x - 6, 58); c.lineTo(x - 20, 58); c.closePath(); c.fill();
    }
    c.fillStyle = def.dark; c.fillRect(0, 56, cw, 3);
    c.restore();
    H.popTxt(L.t(def.title), cw / 2, 30, Math.min(21, (cw - 70) / (L.t(def.title).length * 0.62)), '#ffffff', INK, 5);
    H.star(22, 18, 5 + Math.sin(t * 5), '#ffd23f');
    H.star(cw - 24, 40, 4 + Math.cos(t * 4), '#ffffff');
    if (card.list.length > 1) H.txt((card.i + 1) + '/' + card.list.length, cw - 16, 16, 11, '#ffffff', 'right', 900, INK);
    var pad = 14, gap = 18, top = 72;
    var pw = (cw - pad * 2 - gap) / 2, ph = 124;
    var cells = def.sum ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (var i = 0; i < 4; i++) {
      var st = def.steps[i];
      var px = pad + cells[i][0] * (pw + gap), py = top + cells[i][1] * (ph + gap);
      var col = i === 3 && !def.sum ? PAY : def.col;
      var pop = easeBack(clamp((e - 0.15 - i * 0.12) / 0.3, 0, 1));
      c.save();
      c.translate(px + pw / 2, py + ph / 2); c.scale(pop, pop); c.translate(-pw / 2, -ph / 2);
      H.fillRR(0, 0, pw, ph, 14, i === 3 && !def.sum ? '#fff8e1' : def.tint);
      H.strokeRR(0, 0, pw, ph, 14, INK, 2.2);
      c.save(); c.translate(pw / 2, 45); icon(H, st[0], def.col, t + i * 0.7); c.restore();
      if (tags) tagBadge(c, 17, 17, col, tags[i]);
      else numBadge(c, dpr, 17, 17, 11, col, i + 1);
      fitTxt(H, L.t(st[1], V), pw / 2, 82, 13, pw - 12, INK, 900);
      var sub = L.t(st[2], V).split('\n');
      for (var j = 0; j < sub.length && j < 2; j++) fitTxt(H, sub[j], pw / 2, 100 + j * 14, 10.5, pw - 10, '#6d6785', 700);
      c.restore();
    }
    var mx = pad + pw + gap / 2, my1 = top + ph / 2, my2 = top + ph + gap + ph / 2;
    var arrK = clamp((e - 0.6) / 0.3, 0, 1);
    if (arrK > 0 && def.sum) {
      c.save(); c.globalAlpha = arrK;
      var pk = 1 + 0.08 * Math.sin(t * 5);
      [[mx, my1], [mx, my2], [pad + pw / 2, top + ph + gap / 2], [pad + pw + gap + pw / 2, top + ph + gap / 2]].forEach(function (pp) {
        popT(c, '+', pp[0], pp[1] + 1, 22 * pk, '#ffffff', def.dark, 5);
      });
      c.restore();
    } else if (arrK > 0) {
      c.save(); c.globalAlpha = arrK;
      var wig = Math.sin(t * 6) * 1.5;
      cardArrow(H, mx + wig, my1, 0, def.col);
      cardArrow(H, pad + pw + gap + pw / 2, top + ph + gap / 2 + wig, Math.PI / 2, def.col);
      cardArrow(H, mx - wig, my2, Math.PI, PAY);
      cardArrow(H, pad + pw / 2, top + ph + gap / 2 - wig, -Math.PI / 2, '#ffffff');
      c.restore();
    }
    var ty = top + ph * 2 + gap + 12, th = 50;
    H.fillRR(pad, ty, cw - pad * 2, th, 12, '#f5f3fa');
    c.save();
    c.translate(pad + 26, ty + th / 2);
    c.beginPath(); c.moveTo(-14, 5); c.lineTo(-2, -1); c.lineTo(14, -1); c.lineTo(2, 5); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.moveTo(-12, 4); c.lineTo(-2, 0); c.lineTo(12, 0); c.lineTo(2, 4); c.closePath();
    c.fillStyle = def.col; c.fill();
    H.star(0, -10, 4 + Math.sin(t * 5), '#ffd23f');
    c.restore();
    var tip = L.t(tipKey, V).split('\n');
    c.font = '800 10.5px ' + H.FONT;
    for (var k = 0; k < tip.length && k < 2; k++) {
      var s = tip[k], mw = cw - pad * 2 - 58;
      var fs = 10.5;
      while (fs > 8 && c.measureText(s).width > mw) { fs -= 0.5; c.font = '800 ' + fs + 'px ' + H.FONT; }
      H.txt(s, pad + 50, ty + th / 2 + (k - (tip.length - 1) / 2) * 15, fs, INK, 'left', 800);
      c.font = '800 10.5px ' + H.FONT;
    }
    var last = card.i >= card.list.length - 1;
    c.save();
    c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4);
    H.txt(L.t(last ? 'guide_close' : 'guide_more'), cw / 2, ch - 30, 12.5, '#6f57e0', 'center', 900);
    c.restore();
    H.txt(L.t('guide_again'), cw / 2, ch - 13, 9.5, '#9a94ad', 'center', 700);
    H.strokeRR(0, 0, cw, ch, 22, INK, 3);
    c.restore();
  }
  var act = { x: 0, y: 0, t: null, stand: null };
  function trackActivity(S) {
    var pl = S.player;
    var moved = Math.abs(pl.x - act.x) + Math.abs(pl.y - act.y) > 0.3;
    act.x = pl.x; act.y = pl.y;
    if (moved || S.heldPad || act.t == null || S.t < act.t - 10) act.t = S.t;
  }
  function allCards(S, G) {
    var l = ['sw'];
    if (owned(S, 'hwlab') || S.obj >= 10) l.push('hw');
    if (G.roomOpen('plant')) l.push('plant', 'spec');
    return l;
  }
  on('ui', function (S, H) {
    FONT = H.FONT;
    hits.q = null; hits.next = null; hits.nextA = null; hits.at = now();
    shownBadges = badgeRects; badgeRects = [];
    trackActivity(S);
    if (busy(S) || card) { vis = null; return; }
    var G = H.G;
    if (!H.cam.lock) {
      var want = [];
      if (officeOn(S) && !seen.sw) want.push('sw');
      if (owned(S, 'hwlab') && !seen.hw) want.push('hw');
      if (G.roomOpen('plant') && !seen.plant) want.push('plant');
      if (G.roomOpen('outsrc') && !seen.spec) want.push('spec');
      if (want.length && !(S.banners && S.banners.length)) {
        if (!pending) pending = now();
        if (now() - pending > 0.6) { pending = null; vis = null; openCards(want); return; }
      } else pending = null;
    }
    var res = currentNext(S, G);
    var standKey = res && standingOn(S, res) && !res.wait ? res.key : null;
    if (standKey && standKey !== act.stand) { seen.n[standKey] = (seen.n[standKey] || 0) + 1; saveSeen(); }
    act.stand = standKey;
    if (res && standingOn(S, res)) res = null;
    if (officeOn(S)) drawQ(S, H);
    var alpha = 0;
    if (res && !(S.banners && S.banners.length)) {
      alpha = 1;
      if (learned(res.key)) alpha = clamp((S.t - act.t - 2.5) / 0.4, 0, 1);
    }
    if (alpha > 0) {
      var q = tgtPt(res);
      vis = { res: res, q: q, a: alpha, at: now(), room: roomAt(q.y), inside: insideOpen(S, q.x, q.y) };
      drawNext(S, H, res, alpha);
    } else vis = null;
  });
  on('uiTop', function (S, H) {
    if (!card) return;
    if (S.won || S.gacha || S.showFinance) return;
    drawCard(S, H);
  });
  on('tap', function (p, S, H) {
    if (S.won) return false;
    if (card) { advanceCard(); return true; }
    if (now() - hits.at > 0.5) return false;
    if (hits.q && inRect(p, hits.q)) {
      seen.q = 1;
      openCards(allCards(S, H.G));
      QT.Sfx && QT.Sfx.play && QT.Sfx.play('click');
      return true;
    }
    if (vis && vis.res && (inRect(p, hits.next) || inRect(p, hits.nextA))) {
      H.G.goTo(vis.q.x, vis.q.y);
      return true;
    }
    return false;
  });
  QT.Guide = {
    open: function (k) { openCards(k ? [].concat(k) : ['sw', 'hw', 'plant']); if (card) card.t0 -= 2; },
    next: function () { return nextRes; },
    hits: function () { return hits; },
    shown: function () { return card ? card.list[card.i] : null; },
    reset: function () { seen = { n: {} }; saveSeen(); },
    routes: function () { return { office: office, plant: plant }; },
    seen: function () { return seen; },
    idle: function (sec) { act.t = QT.G.S.t - sec; },
    calc: function () { return computeNext(QT.G.S, QT.G); }
  };
})(window.QT || (window.QT = {}));
