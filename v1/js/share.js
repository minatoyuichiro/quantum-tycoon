(function (QT) {
  'use strict';
  var URL = window.QT_SHARE_URL ? String(window.QT_SHARE_URL) : window.QT_STATIC ? location.origin + location.pathname.replace(/index\.html$/, '')
                             : 'https://tycoon.blueqat.app/v1/';
  var TXT = {
    title:  ['友だちにシェア', 'Share with friends'],
    x:      ['Xでポスト', 'Post on X'],
    line:   ['LINEで送る', 'Send on LINE'],
    fb:     ['Facebook', 'Facebook'],
    copy:   ['リンクをコピー', 'Copy link'],
    copied: ['コピーしました！', 'Copied!'],
    more:   ['ほかのアプリ', 'More apps'],
    close:  ['閉じる', 'Close'],
    def:    ['量子コンピュータの会社をつくって上場をめざす経営ゲーム『QUANTUM TYCOON』',
             'QUANTUM TYCOON — build a quantum computer company and take it public']
  };
  function lang() {
    if (QT.L) return QT.L.get();
    return (navigator.language || '').indexOf('ja') === 0 ? 'ja' : 'en';
  }
  function t(k) { return TXT[k][lang() === 'ja' ? 0 : 1]; }
  var CSS =
    '#qtShare{position:fixed;inset:0;z-index:40;display:none;align-items:flex-end;justify-content:center;' +
    '  background:rgba(30,25,55,.45);font-family:"Hiragino Maru Gothic ProN","Hiragino Sans","Noto Sans CJK JP",system-ui,sans-serif}' +
    '#qtShare.show{display:flex}' +
    '#qtShare .sheet{width:min(100%,420px);margin:0 10px calc(10px + env(safe-area-inset-bottom));background:#fff;' +
    '  border-radius:22px;padding:18px 16px 14px;box-shadow:0 20px 50px rgba(30,25,60,.35)}' +
    '#qtShare h3{margin:0 0 4px;font-size:16px;color:#33304a;text-align:center}' +
    '#qtShare .msg{margin:0 0 14px;font-size:12px;line-height:1.6;color:#7a7590;text-align:center}' +
    '#qtShare .grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}' +
    '#qtShare button{appearance:none;border:none;border-radius:14px;padding:13px 8px;font:inherit;font-weight:800;' +
    '  font-size:14px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}' +
    '#qtShare .x{background:#111}#qtShare .line{background:#06c755}#qtShare .fb{background:#1877f2}' +
    '#qtShare .copy{background:#6f57e0}#qtShare .more{background:#f2a63b;grid-column:1/3}' +
    '#qtShare .close{margin-top:10px;width:100%;background:#f0eef6;color:#7a7590}' +
    '.qtShareBtn{position:fixed;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:31;' +
    '  display:flex;align-items:center;gap:7px;padding:11px 18px 11px 14px;border:none;border-radius:999px;' +
    '  background:linear-gradient(135deg,#ff6a88,#e2508a);color:#fff;font:inherit;font-weight:900;font-size:15px;' +
    '  font-family:"Hiragino Maru Gothic ProN","Hiragino Sans","Noto Sans CJK JP",system-ui,sans-serif;' +
    '  box-shadow:0 5px 0 #b3336a,0 10px 22px rgba(120,30,70,.3);cursor:pointer;animation:qtBob 2.4s ease-in-out infinite}' +
    '.qtShareBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #b3336a}' +
    '.qtShareBtn svg{width:18px;height:18px}' +
    '@media (min-width:900px){.qtShareBtn{top:20px;right:22px;padding:14px 26px 14px 20px;font-size:19px}' +
    '  .qtShareBtn svg{width:22px;height:22px}}' +
    '@keyframes qtBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}';
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">' +
             '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
             '<path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
  var root = null, cur = { text: '', url: URL };
  function track(name, meta) {
    try {
      if (!/^https?:/.test(location.protocol) || /^(localhost|127\.)/.test(location.hostname)) return;
      if (window.QT_STATIC) return;
      var body = JSON.stringify({ name: name, meta: meta == null ? null : meta });
    } catch (e) { }
  }
  function build() {
    if (root) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    root = document.createElement('div');
    root.id = 'qtShare';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) {
      root.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
  }
  function render() {
    var more = navigator.share ? '<button class="more" data-k="more">' + t('more') + '</button>' : '';
    root.innerHTML =
      '<div class="sheet"><h3>' + t('title') + '</h3><p class="msg"></p>' +
      '<div class="grid">' +
      '<button class="x" data-k="x">𝕏 ' + t('x') + '</button>' +
      '<button class="line" data-k="line">' + t('line') + '</button>' +
      '<button class="fb" data-k="fb">' + t('fb') + '</button>' +
      '<button class="copy" data-k="copy">' + t('copy') + '</button>' + more +
      '</div><button class="close" data-k="close">' + t('close') + '</button></div>';
    root.querySelector('.msg').textContent = cur.text;
    Array.prototype.forEach.call(root.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); act(b.getAttribute('data-k'), b); });
    });
  }
  function popup(u) { window.open(u, '_blank', 'noopener,noreferrer'); }
  var SHARE_EV = { x: 'share_x', line: 'share_line', fb: 'share_fb', copy: 'share_copy', more: 'share_more' };
  function act(k, btn) {
    if (SHARE_EV[k]) track(SHARE_EV[k], { from: cur.from });
    var tx = encodeURIComponent(cur.text), u = encodeURIComponent(cur.url);
    if (k === 'x') popup('https://twitter.com/intent/tweet?text=' + tx + '&url=' + u);
    else if (k === 'line') popup('https://social-plugins.line.me/lineit/share?url=' + u + '&text=' + tx);
    else if (k === 'fb') popup('https://www.facebook.com/sharer/sharer.php?u=' + u);
    else if (k === 'copy') {
      var all = cur.text + ' ' + cur.url;
      var done = function () { btn.textContent = t('copied'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(done, function () { fallbackCopy(all); done(); });
      else { fallbackCopy(all); done(); }
      return;
    } else if (k === 'more') {
      navigator.share({ title: cur.title || 'QUANTUM TYCOON', text: cur.text, url: cur.url }).catch(function () { });
    }
    close();
  }
  function fallbackCopy(s) {
    var ta = document.createElement('textarea');
    ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { }
    document.body.removeChild(ta);
  }
  function open(text, from, url, title) {
    build();
    cur = { text: text || t('def'), url: url || URL, from: from || 'game', title: title };
    track('share_open', { from: cur.from });
    render();
    root.classList.add('show');
  }
  function close() { if (root) root.classList.remove('show'); }
  function isOpen() { return !!(root && root.classList.contains('show')); }
  function button(parent, text, from, url, title) {
    build();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'qtShareBtn';
    b.innerHTML = ICON + '<span>' + (lang() === 'ja' ? 'シェア' : 'Share') + '</span>';
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) {
      b.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      open(typeof text === 'function' ? text() : text, from, url, title);
    });
    (parent || document.body).appendChild(b);
    return b;
  }
  QT.Share = { open: open, close: close, isOpen: isOpen, button: button, URL: URL };
  QT.track = track;
})(window.QT || (window.QT = {}));
