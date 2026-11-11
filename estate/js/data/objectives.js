(function (QT) {
  'use strict';
  var Data = QT.Data || (QT.Data = {});
  var L = QT.L;
  function T(k, v) { return L.t(k, v); }
  L.add({
    obj_cfNow:  ['（いま 月{v}）', ' (now {v}/mo)'],
    obj_netNow: ['（いま {v}）', ' (now {v})'],
    obj_peak:   ['次の山: 純資産 {v}（いま {n}）', 'Next peak: {v} net worth (now {n})'],
    obj_peakT:  ['「{t}」・次の山: 純資産 {v}（いま {n}）', '"{t}" · next peak: {v} (now {n})']
  });
  function cf(G) { return G.rentCF ? G.rentCF() : 0; }
  function cfText(S, G, t0) { var v = cf(G); return t0 + T('obj_cfNow', { v: (v < 0 ? '-¥' : '¥') + G.fmt(Math.abs(v)) }); }
  function flag(S, k) { return !!(S.life && S.life.flags && S.life.flags[k]); }
  function triedUse(S, G) {
    return (G.estate ? G.estate.owned() : []).some(function (p) {
      return p.kind === 'park' || p.kind === 'cpark' || p.kind === 'wash' || p.kind === 'office' || p.building ||
             p.ctr === 'corp' || p.ctr === 'sub' || p.newUntil;
    });
  }
  Data.objectives = [
    { id: 'inspect', where: 'starter',
      ja: '実家の近くの売物件を見に行こう（黄色い矢印の先の丸に立つ）', en: 'Check out the property for sale near your parents\' home (stand on the circle under the yellow arrow)',
      ok: function (S) { return (S.mkt && S.mkt.inspected || 0) >= 1; } },
    { id: 'buy1', where: 'starter',
      ja: '最初の物件を買おう（物件のシートの［買う］）', en: 'Buy your first property (tap Buy in the property sheet)',
      ok: function (S) { return (S.mkt && S.mkt.bought || 0) >= 1; } },
    { id: 'rent1', where: null,
      ja: '最初の家賃が入るのを待とう（月末に入る）', en: 'Wait for your first rent (paid at month end)',
      ok: function (S) { return !!(S.mkt && S.mkt.firstRent); } },
    { id: 'agency', where: 'agency', opt: true,
      ja: '青山の不動産会社で、次の物件を探そう（未公開物件も）', en: 'Find your next property at the agency in Aoyama (off-market deals too)',
      ok: function (S) { return flag(S, 'agency'); } },
    { id: 'bank', where: 'bank', opt: true,
      ja: '大手町の銀行街で、いくら借りられるか聞いてみよう', en: 'Ask a bank in Otemachi how much you could borrow',
      ok: function (S) { return flag(S, 'bank'); } },
    { id: 'buy2', where: 'prop',
      ja: '2つ目の物件を買おう（銀行のローンで。買う前に［指値］で値下げも言える）', en: 'Buy a second property (with a bank loan; try haggling first)',
      ok: function (S, G) { return (G.estate ? G.estate.owned().filter(function (p) { return !p.inh; }).length : 0) >= 2; } },
    { id: 'tax1', where: null, opt: true,
      ja: '最初の確定申告（12月の締めで自動。税務署で中身を見られる）', en: 'Your first tax return (filed at year end; see it at the tax office)',
      ok: function (S) { return !!(S.taxes && S.taxes.hist.length); } },
    { id: 'cf10', where: 'prop',
      ja: '家賃の手取りを月10万円に', en: 'Reach ¥100k/mo net rent',
      ok: function (S, G) { return cf(G) >= 100000; }, text: cfText },
    { id: 'use', where: 'prop', opt: true,
      ja: '駐車場・ランドリー・新築・法人契約のどれかに挑戦しよう', en: 'Try a car park, laundry, new build or corporate lease',
      ok: triedUse },
    { id: 'up1', where: 'mine', opt: true,
      ja: 'バリューアップ: 自分の物件に設備を足して家賃を上げよう（物件のシートの下のほう）', en: 'Value-up: upgrade a property you own to raise rent (in its sheet)',
      ok: function (S) { return !!(S.deals && S.deals.n.up >= 1); } },
    { id: 'cf20', where: 'prop',
      ja: '家賃の手取りを月20万円に', en: 'Reach ¥200k/mo net rent',
      ok: function (S, G) { return cf(G) >= 200000; }, text: cfText },
    { id: 'free', where: 'prop',
      ja: '経済的自由: 家賃の手取りで暮らしをまかなおう', en: 'Financial freedom: let net rent pay for your life',
      ok: function (S) { return !!(S.life && S.life.free); },
      text: function (S, G, t0) { var v = cf(G); return t0 + T('obj_cfNow', { v: '¥' + G.fmt(Math.max(0, v)) + ' / ¥' + G.fmt(G.freeNeed ? G.freeNeed() : S.life.living) }); } },
    { id: 'net1', where: 'prop',
      ja: '次の山: 純資産を増やそう', en: 'Next peak: grow your net worth',
      ok: function () { return false; },
      text: function (S, G, t0) {
        if (!G.peakTarget) return t0 + T('obj_netNow', { v: '¥' + G.fmt(G.netWorth ? G.netWorth() : 0) });
        var lv = (S.life && S.life.peak) || 0, o = { v: '¥' + G.fmt(G.peakTarget(lv)), n: '¥' + G.fmt(G.netWorth()), t: G.peakTitle(lv) };
        return T(lv ? 'obj_peakT' : 'obj_peak', o);
      } }
  ];
})(window.QT || (window.QT = {}));
