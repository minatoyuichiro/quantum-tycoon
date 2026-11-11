(function (QT) {
  'use strict';
  var G = QT.G, L = QT.L, E = QT.Data.ESTATE;
  function T(k, v) { return L.t(k, v); }
  L.add({
    pl_agency:  ['不動産会社', 'Property agency'],
    pl_agencyS: ['物件の相談・紹介', 'Advice & listings'],
    pl_bank:    ['融資の相談', 'Ask about a loan'],
    pl_tax:     ['税務署', 'Tax office'],
    pl_taxS:    ['確定申告を見る', 'See your tax return'],
    pl_home:    ['実家', "Parents' home"],
    pl_homeS:   ['親に相談する', 'Talk to your parents']
  });
  function front(pl) { return [{ x: pl.padX, y: pl.padY }]; }
  function flag(k) { var f = G.S.life.flags || (G.S.life.flags = {}); if (!f[k]) { f[k] = true; G.emit('flag', { k: k }); } }
  G.pad('agency', {
    build: function (pl) { return pl.kind === 'agency' ? front(pl) : []; },
    active: function () { return true; },
    info: function () { return { label: T('pl_agency'), sub: T('pl_agencyS'), can: true, hold: 0.4 }; },
    act: function () { flag('agency'); QT.UI.show('agency'); }
  });
  G.pad('bank', {
    build: function (pl) { return pl.kind === 'bank' ? front(pl) : []; },
    active: function () { return true; },
    info: function (pad) { var ld = E.LENDERS[pad.p.lender]; return { label: L.nm(ld), sub: T('pl_bank'), can: true, hold: 0.4 }; },
    act: function (pad) { flag('bank'); QT.UI.show('banksheet', pad.p.lender); }
  });
  G.pad('taxoffice', {
    build: function (pl) { return pl.kind === 'taxoffice' ? front(pl) : []; },
    active: function () { return true; },
    info: function () { return { label: T('pl_tax'), sub: T('pl_taxS'), can: true, hold: 0.4, quiet: true }; },
    act: function () { flag('tax'); QT.UI.show('taxsheet'); }
  });
  G.pad('jikka', {
    build: function (pl) { return pl.id === 'home' ? front(pl) : []; },
    active: function () { return true; },
    info: function () {
      var o = G.inherit && G.inherit.padInfo();
      return o || { label: T('pl_home'), sub: T('pl_homeS'), can: true, hold: 0.4, quiet: true };
    },
    act: function () { flag('home'); if (G.inherit && G.inherit.padAct()) return; QT.UI.show('jikka'); }
  });
})(window.QT);
