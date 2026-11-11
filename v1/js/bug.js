(function (QT) {
  'use strict';
  var LAST_ERRORS = [];
  var LOCAL_KEY = 'quantum_tycoon_bugs';
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
    return {
      t: Math.round(S.t),
      coins: Math.round(S.coins),
      rooms: Object.keys(S.rooms || {}).filter(function (k) { return S.rooms[k]; }),
      plots: plots,
      player: [Math.round(S.player.x), Math.round(S.player.y)],
      walkable: (function () { try { return QT.G.walkable(S.player.x, S.player.y); } catch (e) { return null; } })(),
      carry: S.player.carry.length,
      outputs: S.outputs.length,
      he: Math.round(S.he * 10) / 10,
      contracts: S.contracts.length,
      broken: S.brokenCount(),
      dc: S.dc.length,
      users: Math.round(S.users),
      bestQubits: S.bestQubits,
      obj: S.obj,
      objText: (QT.G.OBJECTIVES[S.obj] || {}).text,
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
  }
  function build() {
    var btn = document.createElement('button');
    btn.id = 'bugBtn';
    btn.type = 'button';
    btn.textContent = '!';
    document.body.appendChild(btn);
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
        S.player.x = QT.World.START.x;
        S.player.y = QT.World.START.y;
        QT.G.rebuildGrid();
        msg.textContent = QT.L.t('bugStuckDone');
      } catch (e) { msg.textContent = e.message; }
    });
    back.querySelector('#bugReset').addEventListener('click', function () {
      if (!window.confirm(QT.L.t('restartConfirm'))) return;
      try {
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
  QT.Bug = { snapshot: snapshot, send: send, errors: function () { return LAST_ERRORS; } };
})(window.QT || (window.QT = {}));
