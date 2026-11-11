(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, W = QT.World, L = QT.L, E = QT.Data.ESTATE;
  function T(k, v) { return L.t(k, v); }
  L.add({
    life_cardBanner: ['カードローンで生活費を埋めた', 'Card loan covered your bills'],
    life_cardSub:    ['年15%。手元が足りません（家賃より返済と生活費が多い）', '15%/yr. You are short — payments + living cost exceed income'],
    life_cardWarn:   ['カードローン {v}（年15%）— 手元が足りない', 'Card loan {v} (15%/yr) — you are short of cash'],
    life_lowWarn:    ['手元が生活費1か月を切りそう', 'Cash is below one month of living costs'],
    life_retire:     ['定年退職!', 'RETIRED!'],
    life_retireSub:  ['退職金 {v} が入った。これからは年金 月{p}', 'Retirement bonus {v}. Pension from now: {p}/mo'],
    life_birthday:   ['{a}歳になった', 'You turned {a}'],
    life_free:       ['経済的自由!!', 'FINANCIAL FREEDOM!!'],
    life_freeSub:    ['家賃の手取りで生活費をまかなえるようになった', 'Your net rent now pays for your living costs'],
    life_salary:     ['給料', 'Salary'],
    life_pension:    ['年金', 'Pension'],
    life_living:     ['生活費', 'Living costs'],
    life_social:     ['社会保険料', 'Social insurance'],
    life_withhold:   ['源泉徴収', 'Tax withheld'],
    life_card:       ['カードローン', 'Card loan'],
    life_cardRepay:  ['カードローンの返済', 'Card loan repaid'],
    life_bonus:      ['退職金', 'Retirement bonus'],
    life_biz:        ['事業の利益', 'Business income'],
    life_bizRetire:  ['会社をたたんだ', 'YOU CLOSED THE FIRM'],
    life_bizRetireSub:['65歳。これからは国民年金 月{p}', 'Age 65. National pension from now: {p}/mo'],
    peak_banner:     ['純資産 {v} 達成!!', 'NET WORTH {v}!!'],
    peak_bannerSub:  ['称号「{t}」。次の山は {n}', 'Title: {t}. Next peak: {n}'],
    peak_t1:        ['駆け出しの大家', "Rookie landlord"],
    peak_t2:        ['一人前の大家', "Seasoned landlord"],
    peak_t3:        ['ベテラン大家', "Veteran landlord"],
    peak_t4:        ['街の大家さん', "Neighbourhood landlord"],
    peak_t5:        ['億り人', "Hundred-millionaire"],
    peak_t6:        ['街の地主', "Local landowner"],
    peak_t7:        ['駅前の大家', "Station-front landlord"],
    peak_t8:        ['不動産の達人', "Property expert"],
    peak_t9:        ['東京の大家', "Landlord of Tokyo"],
    peak_t10:       ['不動産の名人', "Property master"],
    peak_t11:       ['不動産王', "Property king"],
    peak_t12:       ['大不動産王', "Property emperor"],
    peak_t13:       ['伝説の大家', "Legendary landlord"],
    peak_t14:       ['日本一の大家', "Japan's top landlord"],
    peak_tMore:      ['日本一の大家 ★{n}', "Japan's top landlord ★{n}"],
    sharePeak:       ['不動産タイクーンで純資産 ¥{v}・称号「{t}」に!', 'Reached ¥{v} net worth in ESTATE TYCOON: "{t}"!']
  });
  function withholdMonthly(gross) {
    var tax = G.taxCalc ? G.taxCalc({ salary: gross * 12, pension: 0, rentIncome: 0, age: S.life.age }).total : gross * 12 * 0.06;
    return Math.round(tax / 12);
  }
  function begin(kind) {
    var st = E.STARTS[kind] || E.STARTS.worker;
    var lf = S.life;
    lf.kind = kind in E.STARTS ? kind : 'worker';
    lf.age = st.age; lf.months = 0;
    lf.gross = st.gross; lf.pension = st.pension; lf.living = st.living;
    lf.retired = !st.gross && !st.biz;
    lf.biz = !!st.biz;
    lf.need = st.freeNeed || st.living;
    lf.chosen = true; lf.startT = S.t;
    var cur = S.gl[100];
    if (cur) G.post(300, 100, cur, false);
    G.post(100, 300, st.cash, 'start');
    G.emit('lifeBegin', { kind: lf.kind });
  }
  function monthEndPre() {
    var lf = S.life;
    if (!lf.chosen) return;
    if (lf.gross > 0 && !lf.retired) {
      G.post(100, 610, lf.gross, 'salary');
      G.post(621, 100, Math.round(lf.gross * E.SOCIAL), 'social');
      var w = withholdMonthly(lf.gross);
      if (w > 0) G.post(150, 100, w, 'withhold');
    }
    if (lf.biz && !lf.retired) {
      var bz = bizMonthly();
      G.post(100, 613, bz, 'biz');
      G.post(621, 100, Math.round(bz * E.SOCIAL), 'social');
      var wb = G.taxCalc ? Math.round(G.taxCalc({ biz: bz * 12, social: bz * 12 * E.SOCIAL, age: lf.age }).total / 12) : 0;
      if (wb > 0) G.post(150, 100, wb, 'withhold');
    }
    if (lf.pension > 0 && lf.retired) G.post(100, 611, lf.pension, 'pension');
    G.post(620, 100, lf.living, 'living');
    var card = G.bal(215);
    if (card > 0) G.post(622, 100, Math.round(card * E.CARD_RATE / 12), 'cardInt');
    lf.months++;
    if (lf.months % 12 === 0) {
      lf.age++;
      G.emit('birthday', { age: lf.age });
      var st = E.STARTS[lf.kind];
      if (!lf.retired && st.retireAge && lf.age >= st.retireAge) {
        lf.retired = true;
        if (st.retireBonus > 0) G.post(100, 612, st.retireBonus, 'bonus');
        lf.pension = st.pensionAfter;
        G.banner(T(st.biz ? 'life_bizRetire' : 'life_retire'), T(st.biz ? 'life_bizRetireSub' : 'life_retireSub', { v: '¥' + G.fmt(st.retireBonus), p: '¥' + G.fmt(lf.pension) }), '#f5b21c', 'record');
        G.emit('retired', {});
      }
    }
  }
  function cashGuard() {
    var c = S.gl[100];
    if (c < 0) {
      var need = -c + 1;
      var first = G.bal(215) <= 0;
      G.post(100, 215, need, 'card');
      if (first) G.banner(T('life_cardBanner'), T('life_cardSub'), '#e2504a', 'warn');
    } else {
      var card = G.bal(215), keep = S.life.living * 2;
      if (card > 0 && c > keep + 10000) G.post(215, 100, Math.min(card, c - keep), 'cardRepay');
    }
    if (G.bal(215) > -E.FORCE_SELL && !S.life.forcing) {
      S.life.forcing = true;
      G.emit('forceSale', {});
    } else if (G.bal(215) <= 0) S.life.forcing = false;
  }
  function checkFree() {
    var lf = S.life;
    var cf = G.rentCF ? G.rentCF() : 0;
    lf.freeRun = cf >= freeNeed() ? (lf.freeRun || 0) + 1 : 0;
    if (!lf.free && lf.freeRun >= 3) {
      lf.free = true; lf.freeAt = S.t; lf.freeAge = lf.age;
      G.banner(T('life_free'), T('life_freeSub'), '#f5b21c', 'record');
      G.emit('freedom', {});
    }
  }
  var PEAK_M = [1, 1.5, 2, 3, 5, 7];
  function peakTarget(i) { return Math.round(PEAK_M[i % 6] * Math.pow(10, Math.floor(i / 6)) * 10000000); }
  var TITLE_OF = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14];
  function peakTitle(lv) {
    if (!(lv > 0)) return '';
    return lv <= TITLE_OF.length ? T('peak_t' + TITLE_OF[lv - 1]) : T('peak_tMore', { n: lv - TITLE_OF.length });
  }
  function checkPeak() {
    var lf = S.life;
    if (!lf.free) return;
    var net = netWorth(), lv = lf.peak || 0;
    while (net >= peakTarget(lv)) lv++;
    if (lf.peak == null) { lf.peak = lv; return; }
    if (lv <= lf.peak) return;
    lf.peak = lv;
    G.banner(T('peak_banner', { v: '¥' + G.fmt(peakTarget(lv - 1)) }),
             T('peak_bannerSub', { t: peakTitle(lv), n: '¥' + G.fmt(peakTarget(lv)) }), '#f5b21c', 'record');
    G.emit('drama', { kind: 'redev', hits: [] });
    G.emit('peak', { lv: lv, title: peakTitle(lv), target: peakTarget(lv - 1) });
  }
  function freeNeed() { return S.life.need || S.life.living; }
  function bizMonthly() {
    var lf = S.life, st = E.STARTS[lf.kind] || {}, b = st.biz;
    if (!b || !lf.biz || lf.retired) return 0;
    return Math.round(b.base * Math.min(b.max, Math.pow(1 + b.grow, lf.months / 12)) / 1000) * 1000;
  }
  function hudInfo() {
    var lf = S.life, cf = G.rentCF ? G.rentCF() : 0, need = Math.max(1, freeNeed());
    var rt = G.rateInfo ? G.rateInfo() : { base: 0, dir: 0 };
    return {
      cf: cf, need: need, ratio: cf / need, age: lf.age, year: S.fin.year, mon: ((S.fin.month - 1) % 12) + 1,
      rate: rt.base, rateDir: rt.dir, net: netWorth(), debt: G.bal(210) + G.bal(215) + (G.coBal ? G.coBal(210) : 0),
      rent: G.rentNow ? G.rentNow() : 0, pay: G.loanPayNow ? G.loanPayNow() : 0
    };
  }
  function netWorth() {
    var v = S.gl[100] + (G.propValue ? G.propValue() : 0) + G.bal(150) + G.bal(160);
    v -= G.bal(210) + G.bal(215) + G.bal(220) + G.bal(230) + G.bal(240);
    if (G.coBal && S.hojin && S.hojin.gl) v += G.coBal(100) + G.coBal(160) - G.coBal(210) - G.coBal(220) - G.coBal(230);
    return v;
  }
  function cashWarn() {
    var card = G.bal(215);
    if (card > 0) return T('life_cardWarn', { v: '¥' + G.fmt(card) });
    if (S.life.chosen && S.gl[100] < S.life.living && S.fin.month > 1) return T('life_lowWarn');
    return null;
  }
  function monthCF() { return G.rentCF ? G.rentCF() : 0; }
  function shareText() {
    if (S.life.free && S.life.peak) return T('sharePeak', { v: G.fmt(peakTarget(S.life.peak - 1)), t: peakTitle(S.life.peak) });
    if (S.life.free) return T('shareIpo');
    if (G.estate && G.estate.owned().length) return T('shareMid', { m: S.fin.month, v: G.fmt(netWorth()) });
    return T('shareStart');
  }
  G.mod({
    id: 'life', order: 30,
    reset: function (S) {
      S.life = { kind: null, chosen: false, age: 35, months: 0, gross: 0, pension: 0, living: 300000,
                 retired: false, free: false, freeRun: 0, freeAt: null, forcing: false, flags: {} };
    },
    update: function () { if (S.life.chosen) cashGuard(); },
    save: function (S) { return S.life; },
    load: function (S, o) { if (o && o.kind) { S.life = o; S.life.flags = o.flags || {}; } }
  });
  G.on('monthEndPre', monthEndPre);
  G.on('monthEnd', function () { if (S.life.chosen) { checkFree(); checkPeak(); } });
  Object.assign(G, { lifeBegin: begin, hudInfo: hudInfo, netWorth: netWorth, cashWarn: cashWarn, monthCF: monthCF, shareText: shareText, freeNeed: freeNeed,
                     peakTarget: peakTarget, peakTitle: peakTitle, bizMonthly: bizMonthly });
})(window.QT);
