(function (QT) {
  'use strict';
  if (QT.L && QT.L.add) QT.L.add({
    bugStuckNear: ['近くの通れる道に出しました。', 'Moved you to the nearest open path.']
  });
  var LAST_ERRORS = [];
  var LOCAL_KEY = 're_bugs';
  function pushError(kind, msg, extra) {
    LAST_ERRORS.push({ kind: kind, msg: String(msg).slice(0, 500), extra: extra || null, t: new Date().toISOString() });
    if (LAST_ERRORS.length > 5) LAST_ERRORS.shift();
  }
  window.addEventListener('error', function (e) {
    pushError('error', e.message, (e.filename || '').split('/').pop() + ':' + e.lineno);
  });
  window.addEventListener('unhandledrejection', function (e) {
    pushError('promise', (e.reason && e.reason.message) || e.reason);
  });
  function snapshot() {
    var S, W;
    try { S = QT.G.S; W = QT.World; } catch (e) { return { note: 'state unavailable' }; }
    var plots = {};
    try {
      Object.keys(S.p).forEach(function (k) {
        if (S.p[k].owned) plots[k] = S.p[k].level;
      });
    } catch (e) {   }
    var dist = S.dist || S.rooms || {}, T = (W && W.TILE) || 16;
    return {
      t: Math.round(S.t),
      coins: Math.round(S.coins),
      dist: Object.keys(dist).filter(function (k) { return dist[k]; }),
      area: (function () { try { return W.roomAtPx(S.player.x, S.player.y); } catch (e) { return null; } })(),
      plots: plots,
      player: [Math.round(S.player.x), Math.round(S.player.y)],
      tile: [Math.floor(S.player.x / T), Math.floor(S.player.y / T)],
      walkable: (function () { try { return QT.G.walkable(S.player.x, S.player.y); } catch (e) { return null; } })(),
      carry: (S.player.carry || []).length,
      outputs: (S.outputs || []).length,
      he: Math.round((S.he || 0) * 10) / 10,
      contracts: (S.contracts || []).length,
      broken: S.brokenCount ? S.brokenCount() : 0,
      dc: (S.dc || []).length,
      users: Math.round(S.users),
      bestQubits: S.bestQubits,
      objId: S.objId,
      objText: (function () { try { return QT.G.objText(); } catch (e) { return null; } })(),
      won: S.won,
      errors: LAST_ERRORS
    };
  }
  function saveLocal(payload) {
    try {
      var list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      list.push(payload);
      if (list.length > 20) list.shift();
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) {   }
  }
  function send(text, cb) {
    var payload = {
      text: text,
      game: 'estate',
      at: new Date().toISOString(),
      ua: navigator.userAgent,
      screen: window.innerWidth + 'x' + window.innerHeight + '@' + (window.devicePixelRatio || 1),
      state: snapshot()
    };
    saveLocal(payload);
    if (window.QT_STATIC && window.QT_ISSUES) {
      var st = JSON.stringify(payload.state || {});
      var body = text + '\n\n---\n' + payload.ua + '\n' + payload.screen + '\n\n```\n' + st.slice(0, 1500) + '\n```';
      window.open(window.QT_ISSUES + '?title=' + encodeURIComponent(text.slice(0, 60)) +
                  '&body=' + encodeURIComponent(body), '_blank', 'noopener');
      cb(true, QT.L.t('bugSent'));
      return;
    }
    function local() {
      var t = JSON.stringify(payload, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () {
          cb(false, QT.L.t('bugCopied'));
        }, function () { cb(false, QT.L.t('bugSavedLocal')); });
      } else cb(false, QT.L.t('bugSavedLocal'));
    }
    if (window.QT_STATIC) { local(); return; }
  }
  function rescueSpot() {
    var G = QT.G, W = QT.World, S = G.S, T = W.TILE || 16, home = { x: W.START.x, y: W.START.y };
    if (!G.pathLen || !G.blocked) return home;
    var ok = function (x, y) { return !G.blocked(x, y) && G.pathLen(home.x, home.y, x, y) < Infinity; };
    if (ok(S.player.x, S.player.y)) return home;
    var tx = Math.floor(S.player.x / T), ty = Math.floor(S.player.y / T);
    for (var r = 1; r <= (W.WORLD_W || 104); r++)
      for (var dy = -r; dy <= r; dy++)
        for (var dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          var x = (tx + dx + 0.5) * T, y = (ty + dy + 0.5) * T;
          if (ok(x, y)) return { x: x, y: y };
        }
    return home;
  }
  function build() {
    var btn = document.createElement('button');
    btn.id = 'bugBtn';
    btn.type = 'button';
    btn.textContent = '!';
    document.body.appendChild(btn);
    setInterval(function () {
      var ui = QT.UI && QT.UI.get ? QT.UI.get('ending') : null, on = false;
      try { on = !!(ui && ui.isOpen && ui.isOpen()); } catch (e) { on = false; }
      var v = on ? 'hidden' : '';
      if (btn.style.visibility !== v) btn.style.visibility = v;
    }, 400);
    var back = document.createElement('div');
    back.id = 'bugModal';
    back.innerHTML =
      '<div class="card">' +
      '<h2 id="bugTitle"></h2>' +
      '<p id="bugHint"></p>' +
      '<textarea id="bugText" rows="4"></textarea>' +
      '<div class="row"><button type="button" id="bugStuck"></button>' +
      '<button type="button" id="bugReset" class="ghost"></button></div>' +
      '<div class="msg" id="bugMsg"></div>' +
      '<div class="row end"><button type="button" id="bugCancel" class="ghost"></button>' +
      '<button type="button" id="bugSend"></button></div>' +
      '</div>';
    document.body.appendChild(back);
    var msg = back.querySelector('#bugMsg');
    var ta = back.querySelector('#bugText');
    function relabel() {
      var L = QT.L;
      var title = L.t('bugReport');
      btn.title = title;
      btn.setAttribute('aria-label', title);
      back.querySelector('#bugTitle').textContent = title;
      back.querySelector('#bugHint').textContent = L.t('bugHint');
      ta.placeholder = L.t('bugPlaceholder');
      back.querySelector('#bugStuck').textContent = L.t('bugStuck');
      back.querySelector('#bugReset').textContent = L.t('restart');
      back.querySelector('#bugCancel').textContent = L.t('close');
      back.querySelector('#bugSend').textContent = L.t('bugSend');
    }
    relabel();
    function open() { relabel(); back.classList.add('show'); msg.textContent = ''; ta.focus(); }
    function close() { back.classList.remove('show'); }
    btn.addEventListener('click', open);
    back.querySelector('#bugCancel').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('#bugStuck').addEventListener('click', function () {
      try {
        var S = QT.G.S;
        QT.G.rebuildGrid();
        var to = rescueSpot(), W = QT.World;
        S.player.x = to.x;
        S.player.y = to.y;
        S.player.path = null; S.player.goal = null;
        if (QT.snapCam) QT.snapCam();
        msg.textContent = QT.L.t(to.x === W.START.x && to.y === W.START.y ? 'bugStuckDone' : 'bugStuckNear');
      } catch (e) { msg.textContent = e.message; }
    });
    back.querySelector('#bugReset').addEventListener('click', function () {
      if (!window.confirm(QT.L.t('restartConfirm'))) return;
      try {
        if (QT.track) QT.track('newgame');
        QT.G.clearSave();
        QT.G.reset();
        setTimeout(function () { location.reload(); }, 200);
      } catch (e) { msg.textContent = e.message; }
    });
    back.querySelector('#bugSend').addEventListener('click', function () {
      var text = ta.value.trim();
      if (!text) { msg.textContent = QT.L.t('bugWrite'); return; }
      msg.textContent = QT.L.t('bugSending');
      send(text, function (ok, m) {
        msg.textContent = m;
        if (ok) { ta.value = ''; setTimeout(close, 1200); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
  QT.Bug = { snapshot: snapshot, send: send, rescueSpot: rescueSpot, errors: function () { return LAST_ERRORS; } };
})(window.QT || (window.QT = {}));
