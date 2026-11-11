(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE, W = QT.World;
  function T(k, v) { return L.t(k, v); }
  function fmt(v) { return G.fmt(v); }
  function yen(v) { return '¥' + fmt(Math.round(v)); }
  L.add({
    tr_flee:      ['夜逃げ', 'TENANT FLED'],
    tr_fleeSub:   ['{n}: 家賃3か月と片付けで {v}（保証で {g} 戻る）', '{n}: lost 3 months rent + clean-up {v} (guarantor covers {g})'],
    tr_kodoku:    ['孤独死', 'LONELY DEATH'],
    tr_kodokuSub: ['{n}: 特殊清掃 {v}。事故物件になった', '{n}: special cleaning {v}. Now a stigmatised property'],
    tr_kodokuQ:   ['事故物件の{n}。どうする?', 'Stigmatised: {n}. What now?'],
    tr_kodokuA:   ['告知して家賃2割引で貸す', 'Disclose and rent 20% cheaper'],
    tr_kodokuB:   ['リフォームして戻す（{v}・半分は戻らない）', 'Renovate ({v}; only half recovers)'],
    tr_termite:   ['シロアリ', 'TERMITES'],
    tr_termiteSub:['{n}: 駆除と修理 {v}', '{n}: treatment & repair {v}'],
    tr_fire:      ['火災', 'FIRE'],
    tr_fireSub:   ['{n}: 修理 {v}（火災保険で {g} 戻る）', '{n}: repairs {v} (insurance pays {g})'],
    tr_deposit:   ['原状回復で揉めた', 'DEPOSIT DISPUTE'],
    tr_depositSub:['{n}: 退去の精算で {v} 多く払った', '{n}: paid {v} extra settling the move-out'],
    tr_cut:       ['家賃の減額交渉', 'RENT CUT REQUEST'],
    tr_cutQ:      ['{n} の入居者が更新で3%下げてほしいと言っている', 'The tenant at {n} wants 3% off at renewal'],
    tr_cutA:      ['3%下げて住んでもらう', 'Accept 3% off'],
    tr_cutB:      ['断る（出ていくかも）', 'Refuse (they may leave)'],
    tr_cutLeft:   ['減額を断ったら退去した', 'They left after you refused'],
    tr_cutStay:   ['減額を断ったが住み続けてくれた', 'They stayed after all'],
    tr_noise:     ['騒音トラブル', 'NOISE TROUBLE'],
    tr_noiseSub:  ['{n}: 隣の部屋も出ていった', '{n}: the neighbour moved out too'],
    tr_mgmt:      ['管理会社が倒産', 'AGENT WENT BUST'],
    tr_mgmtSub:   ['預けていた家賃 {v} が戻らない', 'Rent held by the agent lost: {v}'],
    tr_typhoon:   ['台風・大雨', 'TYPHOON'],
    tr_typhoonSub:['{d}: 修理 {v}（保険で {g} 戻る）', '{d}: repairs {v} (insurance pays {g})'],
    tr_quake:     ['地震', 'EARTHQUAKE'],
    tr_quakeSub:  ['修理 {v}（地震保険で {g} 戻る）', 'Repairs {v} (quake insurance pays {g})'],
    tr_redev:     ['再開発・新駅', 'REDEVELOPMENT'],
    tr_redevSub:  ['{a}: 地価 +12%・家賃 +5%', '{a}: land +12%, rents +5%'],
    tr_close:     ['大学の移転・工場の閉鎖', 'BIG EMPLOYER LEAVES'],
    tr_closeSub:  ['{a}: 2年ほど空室が埋まりにくく、家賃 −5%', '{a}: harder to fill for ~2 years, rents −5%'],
    tr_audit:     ['税務調査', 'TAX AUDIT'],
    tr_auditSub:  ['帳簿はきちんとしていた。指摘なし', 'Your books were in order. No findings'],
    tr_choose:    ['選んでください', 'Choose'],
    tr_leakDown:  ['下の階へ水漏れ!', 'LEAK INTO THE FLAT BELOW!'],
    tr_leakDownSub:['{n}: 下の部屋の修理 {v}（個人賠償の保険で {g}）', '{n}: repairs below {v} (liability cover {g})'],
    tr_burglar:   ['空き巣!', 'BURGLARY!'],
    tr_burglarSub:['{n}: 鍵と窓の修理 {v}。入居者が不安がっている', '{n}: locks & window {v}. Tenants are uneasy'],
    tr_dumping:   ['不法投棄', 'FLY-TIPPING'],
    tr_dumpingSub:['{n}: ゴミの片付け {v}', '{n}: clean-up {v}'],
    tr_heat:      ['猛暑でエアコンが壊れた!', 'HEATWAVE: AIR-CONS DOWN!'],
    tr_heatSub:   ['{n}: {k}台を交換 {v}', '{n}: replaced {k} units {v}'],
    tr_renew:     ['更新料!', 'RENEWAL FEE!'],
    tr_renewSub:  ['{n}: 入居者が更新した +{v}（あと2年）', '{n}: tenant renewed +{v} (2 more years)'],
    tr_referral:  ['入居者の紹介で決まった!', 'FILLED BY REFERRAL!'],
    tr_referralSub:['{n}: 空室に知り合いが入った（広告料なし）', '{n}: a friend moved into the vacancy (no ad fee)'],
    tr_boom:      ['家賃の相場が上がった!', 'RENTS ARE UP!'],
    tr_boomSub:   ['景気がよい: 家賃 +3%・地価 +4%（どの街も）', 'Good times: rents +3%, land +4% everywhere'],
    tr_buyerQ:    ['{n} を {v} で買いたい人が現れた!', 'Someone wants to buy {n} for {v}!'],
    tr_buyerA:    ['{v} で売る', 'Sell for {v}'],
    tr_buyerB:    ['断る', 'No thanks'],
    tr_refiQ:     ['銀行から借り換えの提案: 変動の借入 {v} の金利を −0.3%（手数料 {f}）', 'Refinance offer: −0.3% on {v} of variable loans (fee {f})'],
    tr_refiA:     ['借り換える（{f}）', 'Refinance ({f})'],
    tr_refiDone:  ['借り換えた!', 'REFINANCED!'],
    tr_stayComplaint:    ['民泊に近所から苦情', 'NEIGHBOURS COMPLAIN ABOUT YOUR SHORT-STAY'],
    tr_stayComplaintSub: ['{n}: お詫びと防音・掲示 {v}。半年ほど予約が減る', '{n}: apologies & soundproofing {v}. Bookings dip for ~6 months'],
    tr_inbound:          ['訪日客が増えた!', 'TOURISTS ARE BACK!'],
    tr_comOut:      ['テナントから解約の予告', 'TENANT GIVES NOTICE'],
    tr_comOutSub:   ['{n}: {m}か月後に退去する（事業用は{m}か月前の予告がふつう）', '{n}: moving out in {m} months (the usual notice for business leases)'],
    tr_comCut:      ['賃料の減額請求（テナント）', 'RENT CUT REQUEST (TENANT)'],
    tr_comCutQ:     ['{n} のテナントが家賃を{r}%下げてほしいと言っている（業績が苦しい・近くの相場が下がった）', 'The tenant at {n} asks for {r}% off the rent (business is slow / nearby rents fell)'],
    tr_comCutA:     ['{r}%下げて続けてもらう', 'Accept {r}% off'],
    tr_comCutB:     ['断る（解約の予告が来るかも）', 'Refuse (they may give notice)'],
    tr_comCutLeft:  ['減額を断ったら解約の予告が来た', 'They gave notice after you refused'],
    tr_comArrears:  ['テナントの滞納・退去', 'TENANT DEFAULTED'],
    tr_comArrearsSub:['{n}: 家賃3か月 {v} と撤去 {c} を保証金から差し引いた（足りないぶん {g}）', '{n}: 3 months rent {v} + clear-out {c} taken from the deposit (shortfall {g})'],
    tr_comEquip:    ['設備の故障', 'EQUIPMENT FAILURE'],
    tr_comEquipSub: ['{n}: {i}の修理・交換 {v}', '{n}: {i} repair/replacement {v}'],
    tr_eq_ev:       ['エレベーター', 'lift'],
    tr_eq_ac:       ['業務用エアコン', 'commercial air-con'],
    tr_eq_pump:     ['給水ポンプ', 'water pump'],
    tr_eq_pipe:     ['給排水の配管', 'plumbing'],
    tr_comRestore:  ['原状回復の範囲で揉めた', 'RESTORATION DISPUTE'],
    tr_comRestoreSub:['{n}: 前のテナントと折り合わず、内装の撤去 {v} をこちらで負担', '{n}: could not agree with the last tenant; you paid {v} to strip the fit-out'],
    tr_comRenew:    ['更新料（事務所）!', 'OFFICE RENEWAL FEE!'],
    tr_comRenewSub: ['{n}: テナントが更新した +{v}（新しい家賃の1か月分・あと2年）', '{n}: tenant renewed +{v} (one month of rent, 2 more years)'],
    tr_washTheft:   ['ランドリーの両替機が壊された', 'LAUNDRY CHANGE MACHINE BROKEN INTO'],
    tr_washTheftSub:['{n}: 現金と修理で {v}（防犯カメラを足した）', '{n}: cash and repairs {v} (added a camera)'],
    tr_washClean:   ['ランドリーの排水・ダクトの清掃', 'LAUNDRY DRAIN & DUCT CLEANING'],
    tr_washCleanSub:['{n}: 業者に頼んだ {v}（糸くずがたまると乾燥機の火事のもと）', '{n}: paid a contractor {v} (built-up lint can start a dryer fire)'],
    tr_comUp:       ['家賃の値上げが通った!', 'RENT INCREASE AGREED!'],
    tr_comUpSub:    ['{n}: 近くの相場が上がったので更新で 月{a} → 月{b}', '{n}: nearby rents rose, so at renewal {a} → {b} /mo'],
    tr_inboundSub:       ['1年ほど民泊の予約が増える', 'Short-stay bookings up for about a year']
  });
  function rnd() { var t = S.trb; t.seed = (t.seed * 1103515245 + 12345) & 0x7fffffff; return t.seed / 0x7fffffff; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function owned() { return G.estate ? G.estate.owned().filter(function (p) { return !p.building; }) : []; }
  function homes() { return owned().filter(function (p) { var u = G.estate.useOf(p); return u === 'home' || u === 'office'; }); }
  function occUnits(p) { return (p.units || []).filter(function (u) { return u.occ; }); }
  function name(p) { return G.estate.name(p); }
  function banner(a, b, col) { G.banner(a, b, col || '#e2504a', 'warn'); }
  function drama(kind, hits, extra) { G.emit('drama', { kind: kind, hits: hits || [], extra: extra || null }); }
  function insured(cost, k) { var g = Math.round(cost * k); if (g > 0) G.post(100, 619, g, { k: 'insurance' }); return g; }
  function inOwner(p, fn) { return G.inBook ? G.inBook(p && p.owner, fn) : fn(); }
  function com(p) { return G.estate.useOf(p) === 'office'; }
  function noticeM(p) { return p.kind === 'shop' ? 3 : 6; }
  function upUnits(p) { var r = G.estate.unitRent(p); return occUnits(p).filter(function (u) { return u.rent * 1.05 <= r; }); }
  var FIRE_W = { ku: 0.018, ko: 0.04, apa: 0.075, man: 0.07, office: 0.02, shop: 0.025, ob: 0.035, wash: 0.02 };
  var PROP = [
    { id: 'flee', w: 0.5, ok: function (p) { return occUnits(p).length && G.estate.useOf(p) === 'home' && p.ctr !== 'corp' && p.ctr !== 'sub'; },
      run: function (p) {
        var u = pick(occUnits(p)), lost = u.rent * 3, clean = 150000, tot = lost + clean;
        var g = p.mgmt === 'co' ? Math.round(lost * 0.8) : 0;
        G.post(511, 100, clean, { k: 'flee', p: p.id });
        if (p.mgmt === 'co') {   }
        else G.post(519, 100, Math.round(lost * 0.3), { k: 'flee', p: p.id });
        u.occ = false; if (u.dep) { G.post(220, 619, u.dep, false); u.dep = 0; }
        banner(T('tr_flee'), T('tr_fleeSub', { n: name(p), v: yen(tot), g: yen(g) }));
        drama('flee', [{ p: p, v: -tot }]);
      } },
    { id: 'kodoku', w: 0.2, ok: function (p) { return occUnits(p).length && (p.kind === 'ku' || p.kind === 'ko' || p.kind === 'apa') && !p.stigma; },
      run: function (p) {
        var u = pick(occUnits(p)), c = 400000 + Math.round(rnd() * 600000);
        G.post(511, 100, c, { k: 'kodoku', p: p.id });
        u.occ = false;
        banner(T('tr_kodoku'), T('tr_kodokuSub', { n: name(p), v: yen(c) }), '#6f5a8a');
        drama('kodoku', [{ p: p, v: -c }]);
        ask(T('tr_kodokuQ', { n: name(p) }), [
          { label: T('tr_kodokuA'), fn: function () { p.stigma = S.fin.month + 48; p.rentMul = Math.min(p.rentMul || 1, 0.8); } },
          { label: T('tr_kodokuB', { v: yen(c * 1.5) }), cost: c * 1.5, fn: function () {
            inOwner(p, function () { G.post(511, 100, Math.round(c * 1.5), { k: 'reform', p: p.id }); }); p.stigma = S.fin.month + 24; p.rentMul = Math.min(p.rentMul || 1, 0.9); p.cond = Math.max(0, (p.cond || 0) - 0.2); } }
        ]);
      } },
    { id: 'termite', w: 0.4, ok: function (p) { var K = E.KINDS[p.kind] || {}; return K.struct === 'w' && G.estate.ageOf(p) > 15; },
      run: function (p) {
        var c = Math.round((400000 + rnd() * 900000) / 10000) * 10000;
        G.post(511, 100, c, { k: 'termite', p: p.id });
        banner(T('tr_termite'), T('tr_termiteSub', { n: name(p), v: yen(c) }));
        drama('termite', [{ p: p, v: -c }]);
      } },
    { id: 'fire', w: 0.04, wk: FIRE_W, ok: function (p) { return !!(E.KINDS[p.kind] || {}).struct; },
      run: function (p) {
        var c = Math.round((1500000 + rnd() * 4000000) / 100000) * 100000, g;
        G.post(511, 100, c, { k: 'fire', p: p.id });
        g = insured(c, 0.8);
        occUnits(p).slice(0, 1).forEach(function (u) { u.occ = false; });
        banner(T('tr_fire'), T('tr_fireSub', { n: name(p), v: yen(c), g: yen(g) }));
        drama('fire', [{ p: p, v: -(c - g) }]);
      } },
    { id: 'deposit', w: 0.8, ok: function (p) { return G.estate.useOf(p) === 'home' && p.mgmt === 'self'; },
      run: function (p) {
        var c = Math.round((50000 + rnd() * 150000) / 10000) * 10000;
        G.post(519, 100, c, { k: 'deposit', p: p.id });
        banner(T('tr_deposit'), T('tr_depositSub', { n: name(p), v: yen(c) }), '#f2a63b');
        drama('small', [{ p: p, v: -c }]);
      } },
    { id: 'cut', w: 1.0, ok: function (p) { return occUnits(p).length && G.estate.useOf(p) === 'home' && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p));
        ask(T('tr_cutQ', { n: name(p) }), [
          { label: T('tr_cutA'), fn: function () { u.rent = Math.round(u.rent * 0.97 / 500) * 500; u.sat = Math.min(1, u.sat + 0.2); } },
          { label: T('tr_cutB'), fn: function () {
            if (rnd() < 0.4) { u.until = S.fin.month; G.toast(G.estate.pos(p), T('tr_cutLeft'), '#e2504a'); }
            else G.toast(G.estate.pos(p), T('tr_cutStay'), '#2fbf7a');
          } }
        ]);
      } },
    { id: 'noise', w: 0.5, ok: function (p) { return occUnits(p).length >= 3 && (p.kind === 'apa' || p.kind === 'man') && !p.ctr; },
      run: function (p) {
        var us = occUnits(p); pick(us).until = S.fin.month;
        banner(T('tr_noise'), T('tr_noiseSub', { n: name(p) }), '#f2a63b');
        drama('small', [{ p: p, v: 0 }]);
      } },
    { id: 'leakDown', w: 0.6, ok: function (p) { return p.kind === 'ku' && occUnits(p).length; },
      run: function (p) {
        var c = Math.round((300000 + rnd() * 1200000) / 10000) * 10000, g = Math.round(c * 0.7);
        G.post(511, 100, c, { k: 'leakDown', p: p.id }); G.post(100, 619, g, { k: 'insurance' });
        banner(T('tr_leakDown'), T('tr_leakDownSub', { n: name(p), v: yen(c), g: yen(g) }));
        drama('water', [{ p: p, v: -(c - g) }]);
      } },
    { id: 'burglar', w: 0.4, ok: function (p) { return occUnits(p).length && G.estate.useOf(p) === 'home'; },
      run: function (p) {
        var c = Math.round((50000 + rnd() * 200000) / 10000) * 10000;
        G.post(511, 100, c, { k: 'burglar', p: p.id });
        occUnits(p).forEach(function (u) { u.sat = Math.max(0.2, u.sat - 0.1); });
        banner(T('tr_burglar'), T('tr_burglarSub', { n: name(p), v: yen(c) }));
        drama('alarm', [{ p: p, v: -c }]);
      } },
    { id: 'dumping', w: 0.5, akiya: true, ok: function (p) { return p.kind === 'apa' || p.kind === 'man' || p.kind === 'cpark' || p.kind === 'park' || G.estate.akiya(p); },
      run: function (p) {
        var c = Math.round((30000 + rnd() * 150000) / 10000) * 10000;
        G.post(G.estate.akiya(p) ? 625 : 519, 100, c, { k: 'dumping', p: p.id });
        banner(T('tr_dumping'), T('tr_dumpingSub', { n: name(p), v: yen(c) }), '#f2a63b');
        drama('small', [{ p: p, v: -c }]);
      } },
    { id: 'heat', w: 0.4, ok: function (p) { return (p.kind === 'apa' || p.kind === 'man') && occUnits(p).length >= 2; },
      run: function (p) {
        var n = Math.min(occUnits(p).length, 1 + Math.floor(rnd() * 3)), c = n * 90000;
        G.post(511, 100, c, { k: 'heat', p: p.id });
        banner(T('tr_heat'), T('tr_heatSub', { n: name(p), k: n, v: yen(c) }), '#ef7d2e');
        drama('heat', [{ p: p, v: -c }]);
      } },
    { id: 'stayComplaint', w: 1.2, ok: function (p) { return p.ctr === 'stay'; },
      run: function (p) {
        var c = Math.round((50000 + rnd() * 100000) / 10000) * 10000;
        G.post(519, 100, c, { k: 'stayComplaint', p: p.id });
        p.stayPen = S.fin.month + 6;
        banner(T('tr_stayComplaint'), T('tr_stayComplaintSub', { n: name(p), v: yen(c) }), '#f2a63b');
        drama('alarm', [{ p: p, v: -c }]);
      } },
    { id: 'renew', w: 1.4, ok: function (p) { return occUnits(p).length && G.estate.useOf(p) === 'home' && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p)), v = u.rent;
        G.post(100, 411, v, { k: 'renew', p: p.id });
        u.until += 24; u.sat = Math.min(1, u.sat + 0.1);
        G.banner(T('tr_renew'), T('tr_renewSub', { n: name(p), v: yen(v) }), '#2fbf7a', 'good');
        drama('renew', [{ p: p, v: v }]);
      } },
    { id: 'referral', w: 0.6, ok: function (p) { return (p.units || []).some(function (u) { return !u.occ; }) && G.estate.useOf(p) === 'home'; },
      run: function (p) {
        var u = (p.units || []).filter(function (x) { return !x.occ; })[0], r = G.estate.unitRent(p);
        u.occ = true; u.rent = r; u.sat = 0.95; u.until = S.fin.month + 48; u.dep = r; G.post(100, 220, r, false);
        G.banner(T('tr_referral'), T('tr_referralSub', { n: name(p) }), '#2fbf7a', 'good');
        drama('renew', [{ p: p, v: r }]);
      } },
    { id: 'comOut', w: 0.5, ok: function (p) { return com(p) && occUnits(p).length && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p)), m = noticeM(p);
        u.until = Math.min(u.until, S.fin.month + m);
        banner(T('tr_comOut'), T('tr_comOutSub', { n: name(p), m: m }), '#f2a63b');
        drama('small', [{ p: p, v: 0 }]);
      } },
    { id: 'comCut', w: 0.8, ok: function (p) { return com(p) && occUnits(p).length && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p)), r = 5;
        ask(T('tr_comCutQ', { n: name(p), r: r }), [
          { label: T('tr_comCutA', { r: r }), fn: function () { u.rent = Math.round(u.rent * (1 - r / 100) / 1000) * 1000; u.sat = Math.min(1, u.sat + 0.2); } },
          { label: T('tr_comCutB'), fn: function () {
            if (rnd() < 0.3) { u.until = Math.min(u.until, S.fin.month + noticeM(p)); G.toast(G.estate.pos(p), T('tr_comCutLeft'), '#e2504a'); }
            else G.toast(G.estate.pos(p), T('tr_cutStay'), '#2fbf7a');
          } }
        ]);
      } },
    { id: 'comArrears', w: 0.3, wk: { shop: 0.45 }, ok: function (p) { return com(p) && occUnits(p).length && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p)), lost = u.rent * 3;
        var c = Math.round(((p.kind === 'shop' ? 300000 : 100000) + rnd() * (p.kind === 'shop' ? 700000 : 300000)) / 10000) * 10000;
        var dep = u.dep || 0, kept = Math.min(dep, lost + c);
        G.post(519, 100, lost, { k: 'arrears', p: p.id });
        G.post(511, 100, c, { k: 'arrears', p: p.id });
        if (kept > 0) G.post(220, 619, kept, { k: 'deposit', p: p.id });
        if (dep > kept) G.post(220, 100, dep - kept, false);
        u.dep = 0; u.occ = false;
        banner(T('tr_comArrears'), T('tr_comArrearsSub', { n: name(p), v: yen(lost), c: yen(c), g: yen(Math.max(0, lost + c - kept)) }));
        drama('flee', [{ p: p, v: -Math.max(0, lost + c - kept) }]);
      } },
    { id: 'comEquip', w: 0.6, ok: function (p) { return com(p) && !!(E.KINDS[p.kind] || {}).struct; },
      run: function (p) {
        var i = p.kind === 'ob' ? pick(['ev', 'ac', 'pump']) : pick(['ac', 'pipe']);
        var R = { ev: [1500000, 3500000], ac: p.kind === 'ob' ? [1000000, 2000000] : [400000, 1100000], pump: [500000, 1000000], pipe: [200000, 600000] }[i];
        var c = Math.round((R[0] + rnd() * R[1]) / 10000) * 10000;
        G.post(511, 100, c, { k: 'equip', p: p.id });
        banner(T('tr_comEquip'), T('tr_comEquipSub', { n: name(p), i: T('tr_eq_' + i), v: yen(c) }));
        drama('alarm', [{ p: p, v: -c }]);
      } },
    { id: 'comRestore', w: 0.35, ok: function (p) { return com(p) && (p.units || []).some(function (u) { return !u.occ; }) && !p.ctr; },
      run: function (p) {
        var c = Math.round((200000 + rnd() * 1000000) / 10000) * 10000;
        G.post(519, 100, c, { k: 'restore', p: p.id });
        banner(T('tr_comRestore'), T('tr_comRestoreSub', { n: name(p), v: yen(c) }), '#f2a63b');
        drama('small', [{ p: p, v: -c }]);
      } },
    { id: 'comRenew', w: 0.7, wk: { shop: 0 }, ok: function (p) { return com(p) && p.kind !== 'shop' && occUnits(p).length && !p.ctr; },
      run: function (p) {
        var u = pick(occUnits(p)), v = u.rent;
        G.post(100, 411, v, { k: 'renew', p: p.id });
        u.until += 24; u.sat = Math.min(1, u.sat + 0.1);
        G.banner(T('tr_comRenew'), T('tr_comRenewSub', { n: name(p), v: yen(v) }), '#2fbf7a', 'good');
        drama('renew', [{ p: p, v: v }]);
      } },
    { id: 'washTheft', w: 0.5, ok: function (p) { return G.estate.useOf(p) === 'wash' && !p.building; },
      run: function (p) {
        var c = Math.round((100000 + rnd() * 300000) / 10000) * 10000;
        G.post(519, 100, c, { k: 'washTheft', p: p.id });
        banner(T('tr_washTheft'), T('tr_washTheftSub', { n: name(p), v: yen(c) }));
        drama('alarm', [{ p: p, v: -c }]);
      } },
    { id: 'washClean', w: 0.6, ok: function (p) { return G.estate.useOf(p) === 'wash' && !p.building; },
      run: function (p) {
        var c = Math.round((50000 + rnd() * 150000) / 10000) * 10000;
        G.post(511, 100, c, { k: 'washClean', p: p.id });
        banner(T('tr_washClean'), T('tr_washCleanSub', { n: name(p), v: yen(c) }), '#f2a63b');
        drama('small', [{ p: p, v: -c }]);
      } },
    { id: 'comUp', w: 0.5, ok: function (p) { return com(p) && !p.ctr && upUnits(p).length; },
      run: function (p) {
        var u = pick(upUnits(p)), a = u.rent, b = Math.round(Math.min(G.estate.unitRent(p), a * 1.05) / 1000) * 1000;
        u.rent = b;
        G.banner(T('tr_comUp'), T('tr_comUpSub', { n: name(p), a: yen(a), b: yen(b) }), '#2fbf7a', 'good');
        drama('renew', [{ p: p, v: (b - a) * 12 }]);
      } }
  ];
  var WORLD = [
    { id: 'typhoon', w: 1.0, run: function () {
        var ds = Object.keys(E.DIST).filter(function (d) { return E.DIST[d].live; }), d = pick(ds);
        var hit = owned().filter(function (p) { return p.dist === d && (E.KINDS[p.kind] || {}).struct; });
        if (!hit.length) return false;
        var c = 0, g = 0;
        hit.forEach(function (p) {
          var c1 = Math.round((100000 + rnd() * 500000) * Math.max(1, (p.units || []).length / 3) / 10000) * 10000;
          c += c1;
          inOwner(p, function () { G.post(511, 100, c1, { k: 'typhoon', p: p.id }); g += insured(c1, 0.8); });
        });
        banner(T('tr_typhoon'), T('tr_typhoonSub', { d: L.nm(W.DIST[d], 'short'), v: yen(c), g: yen(g) }));
        drama('typhoon', hit.map(function (p) { return { p: p, v: -Math.round((c - g) / hit.length) }; }), { dist: d });
      } },
    { id: 'quake', w: 0.15, run: function () {
        var hit = owned().filter(function (p) { return (E.KINDS[p.kind] || {}).struct; });
        if (!hit.length) return false;
        var c = 0, g = 0;
        hit.forEach(function (p) {
          var w = (E.KINDS[p.kind] || {}).struct === 'w' ? 1 : 0.4;
          var c1 = Math.round((200000 + rnd() * 1000000) * w * Math.max(1, (p.units || []).length / 3) / 10000) * 10000;
          c += c1;
          p.cond = Math.min(1, (p.cond || 0) + 0.06 * w);
          inOwner(p, function () { G.post(511, 100, c1, { k: 'quake', p: p.id }); g += insured(c1, 0.5); });
        });
        banner(T('tr_quake'), T('tr_quakeSub', { v: yen(c), g: yen(g) }));
        drama('quake', hit.map(function (p) { return { p: p, v: -Math.round((c - g) / hit.length) }; }));
      } },
    { id: 'redev', w: 0.6, run: function () {
        var d = pick(Object.keys(E.AREAS).filter(function (k) { return E.DIST[k].live; })), a = pick(E.AREAS[d]);
        S.mkt.idx[d] = (S.mkt.idx[d] || 1) * 1.12; S.mkt.ridx[d] = (S.mkt.ridx[d] || 1) * 1.05;
        G.banner(T('tr_redev'), T('tr_redevSub', { a: L.nm(a) }), '#2fbf7a', 'good');
        drama('redev', owned().filter(function (p) { return p.dist === d; }).map(function (p) { return { p: p, v: 0 }; }), { dist: d });
      } },
    { id: 'close', w: 0.4, run: function () {
        var d = pick(Object.keys(E.AREAS).filter(function (k) { return E.DIST[k].live; })), a = pick(E.AREAS[d]);
        S.mkt.ridx[d] = (S.mkt.ridx[d] || 1) * 0.95;
        S.trb.slow[d] = S.fin.month + 24;
        banner(T('tr_close'), T('tr_closeSub', { a: L.nm(a) }), '#f2a63b');
        drama('close', owned().filter(function (p) { return p.dist === d; }).map(function (p) { return { p: p, v: 0 }; }), { dist: d });
      } },
    { id: 'mgmt', w: 0.05, run: function () {
        var co = owned().filter(function (p) { return p.mgmt === 'co' && !p.ctr && G.estate.useOf(p) === 'home'; });
        if (!co.length) return false;
        var v = co.reduce(function (t, p) { return t + G.estate.rev(p); }, 0);
        co.forEach(function (p) { inOwner(p, function () { G.post(519, 100, Math.round(G.estate.rev(p)), { k: 'mgmtBust', p: p.id }); }); });
        banner(T('tr_mgmt'), T('tr_mgmtSub', { v: yen(v) }));
        drama('alarm', co.map(function (p) { return { p: p, v: -Math.round(G.estate.rev(p)) }; }));
      } },
    { id: 'audit', w: 0.2, run: function () {
        if (G.rentNow() * 12 < 10000000) return false;
        G.banner(T('tr_audit'), T('tr_auditSub'), '#2bb8d8', 'good');
        drama('small', []);
      } },
    { id: 'inbound', w: 0.6, run: function () {
        var st = owned().filter(function (p) { return p.ctr === 'stay'; });
        if (!st.length || !S.ops) return false;
        S.ops.boomUntil = S.fin.month + 12;
        G.banner(T('tr_inbound'), T('tr_inboundSub'), '#2fbf7a', 'good');
        drama('chance', st.map(function (p) { return { p: p, v: 0 }; }));
      } },
    { id: 'boom', w: 0.5, run: function () {
        Object.keys(S.mkt.ridx).forEach(function (d) { S.mkt.ridx[d] *= 1.03; S.mkt.idx[d] *= 1.04; });
        G.banner(T('tr_boom'), T('tr_boomSub'), '#2fbf7a', 'good');
        drama('redev', owned().map(function (p) { return { p: p, v: 0 }; }));
      } },
    { id: 'buyer', w: 0.5, run: function () {
        var list = owned().filter(function (p) { return !p.sale; });
        if (!list.length) return false;
        var p = pick(list), v = Math.round(G.estate.value(p) * (1.1 + rnd() * 0.15) / 100000) * 100000;
        ask(T('tr_buyerQ', { n: name(p), v: yen(v) }), [
          { label: T('tr_buyerA', { v: yen(v) }), fn: function () { p.sale = { price: v, at: S.t, mine: true, mode: 'fast' }; G.estate.sellNow && G.estate.sellNow(p.id); } },
          { label: T('tr_buyerB'), fn: function () { } }
        ]);
        drama('chance', [{ p: p, v: 0 }]);
      } },
    { id: 'refi', w: 0.4, run: function () {
        var vl = S.loans.filter(function (l) { return l.kind === 'var' && l.rate > S.rate.base + 0.008; });
        if (!vl.length) return false;
        var bal = vl.reduce(function (t, l) { return t + l.bal; }, 0), fee = Math.round(bal * 0.01 / 10000) * 10000;
        ask(T('tr_refiQ', { v: yen(bal), f: yen(fee) }), [
          { label: T('tr_refiA', { f: yen(fee) }), cost: fee, fn: function () {
            vl.forEach(function (l) { G.inBook(l.owner, function () { G.post(517, 100, Math.round(fee * l.bal / Math.max(1, bal)), { k: 'refi' }); }); });
            vl.forEach(function (l) { l.rate = Math.max(S.rate.base + 0.004, l.rate - 0.003); l.spreadCut = (l.spreadCut || 0) + 0.003; });
            G.banner(T('tr_refiDone'), '-0.3%', '#2fbf7a', 'good');
            G.emit('refi', { fee: fee, n: vl.length });
          } },
          { label: T('tr_buyerB'), fn: function () { } }
        ]);
        drama('chance', []);
      } }
  ];
  var pending = null;
  function ask(q, opts) {
    pending = opts;
    S.trb.ask = { q: q, opts: opts.map(function (o) { return { label: o.label, cost: o.cost || 0 }; }) };
    if (QT.UI && QT.UI.show) setTimeout(function () { QT.UI.show('askcard'); }, 600);
  }
  function answer(i) {
    var o = pending && pending[i];
    S.trb.ask = null;
    var p = pending; pending = null;
    if (o) o.fn(); else if (p && p[0]) p[0].fn();
  }
  function monthEnd() {
    if (!S.life || !S.life.chosen || S.trb.ask) return;
    if (S.fin.month < 4 || S.fin.month - (S.trb.last || -99) < 2) return;
    var own = owned();
    if (!own.length) return;
    var pr = Math.min(0.4, 0.02 * own.length + 0.05);
    if (rnd() > pr) return;
    var useWorld = rnd() < 0.35, ok = false;
    if (useWorld) {
      var ev = weighted(WORLD);
      ok = ev.run() !== false;
    } else {
      var p = pick(own), list = PROP.filter(function (e) { return e.ok(p) && (e.akiya || !G.estate.akiya(p)) && wOf(e, p) > 0; });
      if (list.length) { G.emit('trbPick', { p: p, list: list }); var ev1 = weighted(list, p); inOwner(p, function () { ev1.run(p); }); ok = true; }
    }
    if (ok) { S.trb.last = S.fin.month; S.trb.n = (S.trb.n || 0) + 1; G.emit('trouble', {}); }
  }
  function wOf(e, p) { return p && e.wk && e.wk[p.kind] != null ? e.wk[p.kind] : e.w; }
  function weighted(list, p) {
    var tot = list.reduce(function (t, e) { return t + wOf(e, p); }, 0), r = rnd() * tot;
    for (var i = 0; i < list.length; i++) { r -= wOf(list[i], p); if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  function slowMul(dist) { return S.trb && S.trb.slow[dist] > S.fin.month ? 1.8 : 1; }
  G.mod({
    id: 'troubles', order: 45,
    reset: function (S) { S.trb = { seed: 777, last: -99, n: 0, slow: {}, ask: null }; pending = null; },
    save: function (S) { return { seed: S.trb.seed, last: S.trb.last, n: S.trb.n, slow: S.trb.slow }; },
    load: function (S, o) { if (o && o.seed) { S.trb = { seed: o.seed, last: o.last, n: o.n || 0, slow: o.slow || {}, ask: null }; } }
  });
  G.on('monthEnd', monthEnd);
  G.troubles = { answer: answer, slowMul: slowMul, PROP: PROP, WORLD: WORLD, wOf: wOf };
})(window.QT);
