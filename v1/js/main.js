(function (QT) {
  'use strict';
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var dpr = 1, last = 0, running = false;
  var DPR_CAP = 2, quality = 1;
  function fit() {
    dpr = Math.max(1, Math.min(DPR_CAP, window.devicePixelRatio || 1) * quality);
    var w = window.innerWidth, h = window.innerHeight;
    QT.Render.resize(canvas, w, h, dpr);
  }
  var ftSum = 0, ftN = 0, lastDrop = 0, bgmDuck = false;
  function adapt(ms, now) {
    if (ms > 250) return;
    ftSum += ms; ftN++;
    if (ftN < 90) return;
    var avg = ftSum / ftN; ftSum = 0; ftN = 0;
    if (avg > 22 && quality > 0.6 && now - lastDrop > 4000) {
      quality = Math.max(0.6, quality - 0.15); lastDrop = now;
      fit();
      if (quality < 0.8 && QT.Bgm && QT.Bgm.setLite) QT.Bgm.setLite(true);
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
  function start() {
    QT.track('start', { month: QT.G.S.fin.month });
    document.getElementById('start').classList.add('hide');
    noteDone();
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
  var UID_KEY = 'quantum_tycoon_uid';
  var me = null, ownLocal = false;
  function whoami() {
    if (STATIC) { me = null; return Promise.resolve(); }
  }
  function logout() {
    QT.G.save();
    pushCloud().then(function () {
    });
  }
  QT.logout = logout;
  QT.pushCloud = pushCloud;
  function rankingOpts() {
    var S = QT.G.S;
    return { ipo: me && S.ipo ? S.ipo : null,
             beforeSubmit: function () { QT.G.save(); return pushCloud(); } };
  }
  QT.openRanking = function () { if (QT.Ranking) QT.Ranking.open(rankingOpts()); };
  QT.me = function () { return me; };
  QT.supporter = function () { return !STATIC && !!(me && me.supporter === true); };
  function supporterEntry() { return !STATIC && !!(me && (me.supporter === true || me.supporter_open === true)); }
  var NOTE_KEY = 'quantum_tycoon_nologin_note';
  function noteSeen() { try { return localStorage.getItem(NOTE_KEY) === '1'; } catch (e) { return true; } }
  function noteDone() {
    var n = document.getElementById('qtMoveNote');
    if (!n) return;
    try { localStorage.setItem(NOTE_KEY, '1'); } catch (e) { }
    n.parentNode.removeChild(n);
  }
  function moveNote() {
    var title = document.getElementById('start');
    if (STATIC || !me || !title || noteSeen() || document.getElementById('qtMoveNote')) return;
    var d = document.createElement('div');
    d.id = 'qtMoveNote';
    d.setAttribute('role', 'note');
    d.style.cssText = 'position:absolute;left:50%;top:calc(70px + env(safe-area-inset-top));transform:translateX(-50%);z-index:32;' +
      'width:max-content;max-width:min(92%,440px);display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 14px;' +
      'border-radius:14px;background:rgba(255,255,255,.96);color:#33304a;font-size:12.5px;font-weight:700;line-height:1.55;' +
      'box-shadow:0 4px 14px rgba(40,40,90,.22);text-align:left';
    d.innerHTML = '<span></span><button type="button" aria-label="close" style="flex:none;border:none;background:#f0eef6;' +
      'color:#7a7590;border-radius:999px;width:26px;height:26px;font-size:15px;font-weight:900;cursor:pointer">×</button>';
    d.querySelector('span').textContent = QT.L.t('noLoginSoon');
    ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(function (ev) {
      d.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    d.querySelector('button').addEventListener('click', noteDone);
    title.appendChild(d);
  }
  var VERSION = 'v1';
  function titleVersions() {
    var el = document.getElementById('titleVers');
    if (!el || STATIC) return;
  }
  function titleInfo(had) {
    var el = document.getElementById('titleInfo'), L = QT.L, G = QT.G, S = G.S;
    var best = G.loadBest(), html = '';
    if (had && S.co.founded) {
      html += '<div class="save">' + L.t('titleContinue', { m: S.fin.month, v: '<b>¥' + G.fmt(S.value()) + '</b>' });
    } else if (had) {
      html += '<div class="save">' + L.t('titleContinue0', { m: S.fin.month });
    }
    if (best && best.time) {
      var m = Math.floor(best.time / 60), sec = Math.floor(best.time % 60);
      html += (html ? '<br>' : '<div class="save">') +
              L.t('titleBest', { t: L.t('playTime', { m: m, s: (sec < 10 ? '0' : '') + sec }) });
    }
    if (html) html += '</div>';
    if (had) html += '<button type="button" class="new">' + L.t('titleNew') + '</button>';
    el.innerHTML = html;
    if (!STATIC) {
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
    QT.Sfx.ambInit('assets/reito.mp3');
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
      titleInfo(had);
      titleVersions();
      moveNote();
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
