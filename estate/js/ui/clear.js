(function (QT) {
  'use strict';
  var L = QT.L, BEST_KEY = 're_best';
  function t(k, v) { return L.t(k, v); }
  L.add({
    cl_title:   ['経済的自由 達成!! クリア', 'FINANCIAL FREEDOM — CLEAR!!'],
    cl_sub:     ['家賃の手取りで暮らしをまかなえるようになった', 'Your net rent now pays for your life'],
    cl_age:     ['達成した年齢', 'Age reached'],
    cl_ageV:    ['{a}歳（{k}から{y}年）', '{a} ({y} yrs as {k})'],
    cl_time:    ['プレイ時間', 'Play time'],
    cl_props:   ['持っている物件', 'Properties'],
    cl_cf:      ['家賃の手取り（月）', 'Net rent /mo'],
    cl_net:     ['純資産', 'Net worth'],
    cl_debt:    ['借入の残り', 'Loans left'],
    cl_moves:   ['腕前', 'Skills'],
    cl_movesV:  ['内見 {v}・指値 {n}・設備 {u}・掘り出し物 {d}', 'Viewings {v} · offers {n} · upgrades {u} · bargains {d}'],
    cl_achv:    ['実績', 'Achievements'],
    cl_best:    ['自己ベスト更新!', 'NEW PERSONAL BEST!'],
    cl_bestV:   ['自己ベスト {t}', 'Best {t}'],
    cl_go:      ['続けて遊ぶ（次の山へ）', 'Keep playing (next peak)'],
    cl_next:    ['この先は終わりなし。純資産の山（3,000万・5,000万・1億・2億・5億・10億 …）を越えるたびに称号', 'No end from here: a new title at every net-worth peak (¥30M, ¥50M, ¥100M, ¥200M, ¥500M, ¥1B …)'],
    cl_share:   ['シェア', 'Share'],
    cl_hm:      ['{h}時間{m}分', '{h}h {m}m'],
    cl_m:       ['{m}分', '{m}m'],
    titleEst:   ['クリアの目安 30分〜1時間・その先は行けるところまで', 'Clear in 30–60 min, then go as far as you can'],
    titleBestPeak: ['最高到達　純資産 {v}「{t}」', 'Highest peak: {v} net worth ("{t}")'],
    titleBestRe:['自己ベスト　クリアまで {t}', 'Best time to clear: {t}'],
    titleContinueRe2: ['続きから: {y}年目・{a}歳・家賃の手取り 月{v}', 'Continue: year {y}, age {a}, net rent {v}/mo']
  });
  function hm(sec) {
    var m = Math.round(sec / 60), h = Math.floor(m / 60);
    return h ? t('cl_hm', { h: h, m: m % 60 }) : t('cl_m', { m: m });
  }
  function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch (e) { return null; } }
  function saveBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { } }
  QT.G.loadBest = loadBest;
  QT.G.clearTimeText = hm;
  var conf = false;
  var card = QT.Sheet.make('clearcard', {
    height: 0.86,
    onOpen: function () { conf = true; },
    title: function () { return t('cl_title'); },
    sub: function () { return t('cl_sub'); },
    body: function (S, H, k) {
      var C = k.C, y = k.y + 6, c = S.life && S.life.clear;
      if (!c) return 0;
      if (conf) { conf = false; H.confetti(90, H.cssW / 2, H.cssH * 0.3, 1.2); }
      k.card(y, 74, '#fff6d6');
      H.txt(t('cl_title'), k.x + k.w / 2, y + 26, 20, '#c98f0f', 'center', 900);
      H.txt(hm(c.time), k.x + k.w / 2, y + 54, 14, C.ink, 'center', 800);
      y += 86;
      var st = QT.Data.ESTATE.STARTS[c.kind] || {};
      y = k.line(t('cl_age'), t('cl_ageV', { a: c.age, k: L.nm(st), y: c.years }), y + 4, C.ink, 13);
      y = k.line(t('cl_time'), hm(c.time), y, C.ink, 13);
      y = k.line(t('cl_props'), String(c.props), y, C.ink, 13);
      y = k.line(t('cl_cf'), '¥' + QT.G.fmt(c.cf), y, C.ok, 13);
      y = k.line(t('cl_net'), '¥' + QT.G.fmt(c.net), y, C.ink, 13);
      y = k.line(t('cl_debt'), '¥' + QT.G.fmt(c.debt), y, C.soft, 13);
      if (c.moves) y = k.line(t('cl_moves'), t('cl_movesV', c.moves), y, C.blue, 12);
      if (QT.G.achv) { var an = QT.G.achv.count(); y = k.line(t('cl_achv'), an.n + ' / ' + an.m, y, '#a07a12', 12); }
      y = k.wrap(t('cl_next'), k.x, y + 6, k.w, 11, C.soft, 700) + 2;
      if (c.best) { k.text(t('cl_best'), k.x, y + 8, 14, '#e2508a', 900); y += 26; }
      else if (c.bestTime) { k.text(t('cl_bestV', { t: hm(c.bestTime) }), k.x, y + 8, 11, C.soft, 800); y += 22; }
      y += 8;
      k.btn({ x: k.x, y: y, w: k.w * 0.32, h: 44 }, t('cl_share'), '#e2508a', function () {
        if (QT.Share && QT.Share.open) QT.Share.open(QT.G.shareText ? QT.G.shareText() : '', 'clear');
      });
      k.btn({ x: k.x + k.w * 0.35, y: y, w: k.w * 0.65, h: 44 }, t('cl_go'), '#2fbf7a', function () { card.close(); });
      return k.used(y + 56);
    }
  });
  QT.G.on('peak', function (d) {
    var best = loadBest() || {};
    if ((best.peak || 0) >= d.lv) return;
    best.peak = d.lv; best.peakTitle = d.title; best.peakV = d.target;
    saveBest(best);
  });
  QT.G.on('freedom', function () {
    var S = QT.G.S, lf = S.life, g = QT.G;
    var time = Math.round(S.t - (lf.startT || 0));
    var best = loadBest(), isBest = !best || !best.time || time < best.time;
    if (isBest) saveBest({ time: time, age: lf.age, kind: lf.kind, peak: best && best.peak || 0, peakTitle: best && best.peakTitle || '' });
    lf.clear = { time: time, age: lf.age, years: Math.floor(lf.months / 12), kind: lf.kind,
                props: g.estate ? g.estate.owned().length : 0, cf: g.rentCF(), net: Math.round(g.netWorth()),
                debt: g.bal(210) + g.bal(215), best: isBest && !!best, bestTime: best ? best.time : null,
                moves: S.deals ? { v: S.deals.n.view, n: S.deals.n.nego, u: S.deals.n.up, d: S.deals.n.deal } : null };
    setTimeout(function () { if (QT.UI && QT.UI.show) QT.UI.show('clearcard'); }, 2600);
  });
})(window.QT || (window.QT = {}));
