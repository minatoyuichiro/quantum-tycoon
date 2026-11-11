(function (QT) {
  'use strict';
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var dpr = 1, last = 0, running = false;
  var DPR_CAP = 2, quality = 1;
  var LITE_Q = 0.7, MIN_Q = 0.6;
  function fit() {
    dpr = Math.max(1, Math.min(DPR_CAP, window.devicePixelRatio || 1) * quality);
    var w = window.innerWidth, h = window.innerHeight;
    QT.Render.resize(canvas, w, h, dpr);
  }
  var qHold = false;
  function setQuality(q, hold) {
    if (hold != null) qHold = !!hold;
    quality = Math.max(MIN_Q, Math.min(1, +q || 1));
    fit();
    if (quality < 0.8 && QT.Bgm && QT.Bgm.setLite) QT.Bgm.setLite(true);
  }
  QT.quality = function () { return quality; };
  QT.lite = function () { return quality < 0.8; };
  QT.setQuality = setQuality;
  var ftSum = 0, ftN = 0, lastDrop = 0, bgmDuck = false;
  function adapt(ms, now) {
    if (ms > 250 || qHold) return;
    ftSum += ms; ftN++;
    if (ftN < 90) return;
    var avg = ftSum / ftN; ftSum = 0; ftN = 0;
    if (avg > 22 && quality > MIN_Q && now - lastDrop > 4000) {
      lastDrop = now;
      setQuality(quality >= 0.8 ? LITE_Q : quality - 0.1);
    }
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!running) return;
    adapt(now - last, now);
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    QT.G.update(dt, QT.Input.dir());
    if (QT.Bgm) {
      var S0 = QT.G.S, duck = S0.won || S0.gacha;
      if (duck !== bgmDuck) { bgmDuck = duck; QT.Bgm.setVolume(duck ? 0.05 : 0.16); }
      QT.Bgm.update(S0, dt);
    }
    QT.Render.draw(ctx, QT.G.S, dpr, QT.Input.stick);
  }
  function snapCam() {
    var R = QT.Render, S = QT.G && QT.G.S;
    if (!R || !S || !S.player) return;
    if (typeof R.snap === 'function') { R.snap(S); return; }
    if (R.cam && QT.Iso) {
      R.cam.x = QT.Iso.ex(S.player.x, S.player.y);
      R.cam.y = QT.Iso.ey(S.player.x, S.player.y, 0);
    }
  }
  QT.snapCam = snapCam;
  function wireTrack() {
    var G = QT.G;
    function tr(name, meta) { try { if (QT.track) QT.track(name, meta); } catch (e) { } }
    function min() { return Math.round(G.S.t / 60); }
    G.on('lifeBegin', function (e) {
      try { tr('start', { kind: (e && e.kind) || G.S.life.kind }); } catch (er) { }
    });
    G.on('objective', function (o) {
      try { if (o && o.id) tr('room', { id: o.id, min: min() }); } catch (er) { }
    });
    function nw() {
      var v = G.netWorth ? G.netWorth() : 0;
      if (!isFinite(v)) return 0;
      return Math.max(0, Math.min(10000000, Math.round(v / 10000)));
    }
    function nOwn() { return G.estate ? G.estate.owned().filter(function (q) { return !q.inh; }).length : 0; }
    function life() { return G.S.life || {}; }
    function ttl(lv) { return G.peakTitle ? String(G.peakTitle(lv) || '').slice(0, 40) : ''; }
    G.on('freedom', function () {
      try {
        var lf = life(), m = { min: min(), kind: lf.kind, age: lf.freeAge || lf.age, nw: nw() };
        if (G.peakTarget && G.netWorth) {
          var v = G.netWorth(), lv = lf.peak || 0;
          while (lv < 60 && v >= G.peakTarget(lv)) lv++;
          if (lv > 0) { m.lv = lv; m.title = ttl(lv); }
        }
        tr('free', m);
      } catch (er) { }
    });
    G.on('peak', function (e) {
      try {
        if (!e || !(e.lv > 0)) return;
        var lf = life();
        tr('peak', { lv: e.lv, title: String(e.title || '').slice(0, 40), nw: nw(), min: min(), kind: lf.kind, age: lf.age });
      } catch (er) { }
    });
    G.on('achv', function (e) {
      try { if (e && e.id) tr('achv', { id: String(e.id), min: min() }); } catch (er) { }
    });
    G.on('yearEnd', function () {
      try {
        var lf = life();
        if (!lf.chosen) return;
        var m = { nw: nw(), n: nOwn(), min: min(), kind: lf.kind, age: lf.age, lv: lf.peak || 0 };
        if (m.lv > 0) m.title = ttl(m.lv);
        tr('nw', m);
      } catch (er) { }
    });
    G.on('propBought', function (e) {
      try {
        var p = e && e.p;
        if (!p) return;
        tr('buy', { k: p.kind, n: nOwn() });
      } catch (er) { }
    });
  }
  wireTrack();
  function start() {
    snapCam();
    document.getElementById('start').classList.add('hide');
    QT.Sfx.resume();
    QT.Sfx.setMuted(!!QT.G.S.muted);
    if (QT.Bgm) { QT.Bgm.resume(); QT.Bgm.setMuted(!!QT.G.S.muted); }
    running = true;
    last = performance.now();
  }
  var STATIC = !!window.QT_STATIC;
  function pullCloud() {
    if (STATIC) return Promise.resolve(false);
  }
  function pushCloud() {
    var raw;
    try { raw = localStorage.getItem(QT.G.SAVE_KEY); } catch (e) { return Promise.resolve(); }
    if (!raw || !me || STATIC) return Promise.resolve();
  }
  var UID_KEY = 're_uid';
  var me = null;
  function whoami() {
    if (STATIC) { me = null; return Promise.resolve(); }
  }
  function logout() {
    QT.G.save();
    pushCloud().then(function () {
      QT.G.clearSave();
      try { localStorage.removeItem(UID_KEY); } catch (e) { }
    });
  }
  QT.logout = logout;
  QT.pushCloud = pushCloud;
  QT.me = function () { return me; };
  function rankingOpts() {
    var S = QT.G.S;
    return { ipo: me && S.ipo ? S.ipo : null,
             beforeSubmit: function () { QT.G.save(); return pushCloud(); } };
  }
  QT.openRanking = function () { if (QT.Ranking) QT.Ranking.open(rankingOpts()); };
  var VERSION = 'estate';
  function titleVersions() {
    var el = document.getElementById('titleVers');
    if (!el || STATIC) return;
  }
  QT.L.add({ titleDream: ['夢: 家賃収入で、安心の暮らし', 'Dream: a calm life paid for by rent'],
             titleContinueRe: ['続きから: {y}年目・家賃の手取り 月{v}', 'Continue: year {y} · net rent {v}/mo'] });
  function titleInfo(had) {
    var el = document.getElementById('titleInfo'), L = QT.L, G = QT.G, S = G.S;
    var best = G.loadBest ? G.loadBest() : null, html = '';
    if (had && S.life && S.life.chosen) {
      var cf = G.rentCF ? G.rentCF() : 0;
      html += '<div class="save">' + L.t('titleContinueRe2', { y: S.fin.year || 1, a: S.life.age, v: '<b>¥' + G.fmt(Math.max(0, cf)) + '</b>' });
    }
    if (best && best.time && G.clearTimeText) {
      html += (html ? '<br>' : '<div class="save">') + L.t('titleBestRe', { t: G.clearTimeText(best.time) });
    }
    if (best && best.peak && best.peakV) {
      html += (html ? '<br>' : '<div class="save">') + L.t('titleBestPeak', { v: '¥' + G.fmt(best.peakV), t: best.peakTitle || '' });
    }
    if (html) html += '</div>';
    html = '<div class="dream">' + L.t('titleDream') + '</div><div class="dream" style="background:rgba(201,143,15,.92)">' + L.t('titleEst') + '</div>' + html;
    if (had) html += '<button type="button" class="new">' + L.t('titleNew') + '</button>';
    el.innerHTML = html;
    if (!STATIC && QT.Ranking) {
      var rb = QT.Ranking.button(el, rankingOpts);
      el.insertBefore(rb, el.firstChild);
    }
    var acc = document.getElementById('titleAcc');
    if (me && acc) {
      acc.innerHTML = '<span></span><button type="button" class="top">' + (L.get() === 'ja' ? 'トップへ' : 'Top') +
                      '</button><button type="button" class="out">' + L.t('logout') + '</button>';
      acc.querySelector('button.top').addEventListener('click', function (e) {
        e.stopPropagation();
        try { QT.G.save(); } catch (er) { }
        pushCloud().then(function () { location.href = '/'; }, function () { location.href = '/'; });
      });
      acc.querySelector('span').textContent = me.email || '';
      acc.querySelector('button.out').addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.confirm(L.t('logoutConfirm'))) logout();
      });
      ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) {
        acc.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
      });
      acc.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    var nb = el.querySelector('.new');
    if (nb) nb.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!window.confirm(L.t('restartConfirm'))) return;
      QT.track('newgame');
      G.clearSave();
      G.reset();
      start();
    });
  }
  function boot() {
    fit();
    QT.Input.attach(canvas);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', function () { setTimeout(fit, 250); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { QT.G.save(); pushCloud(); }
    });
    window.addEventListener('pagehide', function () { QT.G.save(); pushCloud(); });
    setInterval(function () { if (running) pushCloud(); }, 30000);
    var title = document.getElementById('start');
    QT.Share.button(title, null, 'title');
    var ready = false;
    whoami().then(pullCloud).then(function () {
      var had = !!QT.G.load();
      if (!had) QT.G.reset();
      snapCam();
      titleInfo(had);
      titleVersions();
      ready = true;
      title.classList.remove('loading');
      title.addEventListener('click', function () { if (ready) start(); });
    });
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.QTDEBUG = {
    quality: function () { return { quality: quality, dpr: dpr }; },
    coins: function (n) { QT.G.S.coins += n; },
    reset: function () { QT.G.clearSave(); location.reload(); }
  };
})(window.QT || (window.QT = {}));
