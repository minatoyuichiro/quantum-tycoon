(function (QT) {
  'use strict';
  var on = QT.Art.scope('people');
  var TILE = 16;
  QT.L.add({
    people_rent: ['空室あり', 'FOR RENT'],
    people_rent2: ['事務所', 'OFFICE']
  });
  var seedG = 20260929;
  function rnd() {
    seedG = (seedG * 1664525 + 1013904223) | 0;
    return (seedG >>> 0) / 4294967296;
  }
  function pick(a) { return a[Math.floor(rnd() * a.length) % a.length]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var INK = 'rgba(38,28,70,0.78)';
  var SKIN = ['#ffd9b8', '#f7c9a0', '#eab58c', '#c98f62', '#a8744a', '#ffe6d2'];
  var HAIR = ['#3a2a1f', '#5a3a24', '#8a5a3c', '#2b2b2b', '#3a2a1f', '#f2c96b', '#e2508a', '#7fd6ff', '#b06ad8', '#ff8a3d', '#d9d9e8'];
  var HAIR_BIZ = ['#3a2a1f', '#2b2b2b', '#5a3a24', '#8a5a3c', '#c9c4d4'];
  var POP = ['#ff5a8a', '#2bb8d8', '#f5b21c', '#6f57e0', '#2fbf7a', '#ef7d2e', '#ff7eb6', '#34d6c0', '#9b6bff', '#ff6b4a'];
  var PANTS = ['#3c4767', '#2f3a55', '#5a6c9e', '#4a4060', '#6f7fa0', '#2b2b3a', '#8a6a4c'];
  var SUIT = ['#2f3a55', '#3a3550', '#4a4f63', '#6b5a48', '#253050', '#5a4a7a'];
  var SUIT_POP = ['#e2508a', '#2bb8d8', '#6f57e0', '#ef7d2e', '#2fbf7a', '#c9a227'];
  var TIE = ['#e2504a', '#f5b21c', '#2bb8d8', '#e2508a', '#2fbf7a'];
  var NEON = ['#ff3fa4', '#3ff0ff', '#b4ff3f', '#ffe93f', '#b77bff', '#ff8a3f'];
  var BALLOON = ['#ff4f6d', '#ffd23f', '#3fc7ff', '#8f6bff', '#3fe08a', '#ff8ad0'];
  var CHAIR = ['#ff4f9a', '#2bd0f0', '#8a6bff', '#ff9a3f'];
  var BB_STAND = [-12, 12, -35, 5];
  var BB_TALL = [-12, 13, -45, 5];
  var BB_MASCOT = [-16, 16, -49, 6];
  var BB_ROBOT = [-12, 12, -26, 5];
  var BB_SEAT = [-11, 11, -34, 4];
  function sub(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function frr(c, x, y, w, h, r, col) { c.beginPath(); sub(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
  function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = col; c.fill(); }
  function line(c, x0, y0, x1, y1, lw, col) {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = lw; c.strokeStyle = col; c.stroke();
  }
  function arm(c, x0, y0, x1, y1, sleeve, hand) {
    c.lineCap = 'round';
    line(c, x0, y0, x1, y1, 3.3, INK);
    line(c, x0, y0, x1, y1, 2.1, sleeve);
    dot(c, x1, y1, 1.25, hand);
  }
  var SPR_K = 8;
  var sprites = {};
  function mkCanvas(w, h) {
    var cv = document.createElement('canvas');
    cv.width = Math.ceil(w * SPR_K); cv.height = Math.ceil(h * SPR_K);
    var c = cv.getContext('2d'); c.scale(SPR_K, SPR_K);
    return { cv: cv, c: c, w: w, h: h };
  }
  function heartPath(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.3, y + s * 0.1, x - s * 0.9, y - s * 0.9, x, y - s * 0.3);
    c.bezierCurveTo(x + s * 0.9, y - s * 0.9, x + s * 1.3, y + s * 0.1, x, y + s * 0.9);
    c.closePath();
  }
  function sparkPath(c, x, y, r) {
    c.beginPath();
    c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y);
    c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y);
    c.quadraticCurveTo(x, y, x, y - r); c.closePath();
  }
  function font(sz) { return '900 ' + sz + 'px ' + (QT.Render && QT.Render.H ? QT.Render.H.FONT : 'sans-serif'); }
  function emoteSprite(kind) {
    var key = 'e_' + kind;
    if (sprites[key]) return sprites[key];
    var s = mkCanvas(13, 14), c = s.c, cx = 6.5, cy = 6.2;
    c.lineJoin = 'round';
    c.beginPath();
    c.arc(cx, cy, 5.2, 0, 6.2832);
    c.moveTo(cx - 1.6, cy + 4.6); c.lineTo(cx - 0.4, cy + 7.4); c.lineTo(cx + 1.4, cy + 4.6);
    c.fillStyle = '#ffffff'; c.strokeStyle = '#2f2c46'; c.lineWidth = 1.1; c.stroke(); c.fill();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (kind === 'heart') {
      heartPath(c, cx, cy + 0.2, 2.6); c.fillStyle = '#ff4f86'; c.fill();
      dot(c, cx - 1.2, cy - 0.8, 0.55, 'rgba(255,255,255,0.8)');
    } else if (kind === 'note') {
      c.font = font(7.5); c.fillStyle = '#8a4fd8'; c.fillText('♪', cx, cy + 0.3);
    } else if (kind === 'yen') {
      c.font = font(7); c.fillStyle = '#e8a800'; c.fillText('¥', cx, cy + 0.4);
    } else if (kind === 'excl') {
      c.font = font(7.5); c.fillStyle = '#ff5a3a'; c.fillText('!', cx, cy + 0.4);
    } else if (kind === 'dots') {
      for (var d = -1; d <= 1; d++) dot(c, cx + d * 2, cy + 0.3, 0.8, '#7d788f');
    } else if (kind === 'coffee') {
      frr(c, cx - 2.2, cy - 1, 3.6, 3.4, 0.9, '#8a5a3c');
      c.beginPath(); c.arc(cx + 1.6, cy + 0.6, 1.1, -1.4, 1.4); c.lineWidth = 0.7; c.strokeStyle = '#8a5a3c'; c.stroke();
      c.lineWidth = 0.6; c.strokeStyle = '#b8a8c8';
      c.beginPath(); c.moveTo(cx - 1, cy - 1.8); c.quadraticCurveTo(cx - 1.6, cy - 2.8, cx - 0.8, cy - 3.8); c.stroke();
      c.beginPath(); c.moveTo(cx + 0.6, cy - 1.8); c.quadraticCurveTo(cx, cy - 2.8, cx + 0.8, cy - 3.8); c.stroke();
    } else if (kind === 'bulb') {
      dot(c, cx, cy - 0.8, 2.3, '#ffd23f');
      frr(c, cx - 1.1, cy + 1.2, 2.2, 1.6, 0.4, '#8f93a8');
      dot(c, cx - 0.7, cy - 1.5, 0.6, '#ffffff');
    } else if (kind === 'star') {
      sparkPath(c, cx, cy, 3.4); c.fillStyle = '#ffc21f'; c.fill();
      dot(c, cx + 2.4, cy - 2.4, 0.6, '#ff7eb6');
    } else if (kind === 'q') {
      c.font = font(7); c.fillStyle = '#6f57e0'; c.fillText('?', cx, cy + 0.4);
    }
    sprites[key] = s;
    return s;
  }
  function zSprite() {
    if (sprites.z) return sprites.z;
    var s = mkCanvas(6, 6), c = s.c;
    c.font = font(6); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = 1.6; c.strokeStyle = '#ffffff';
    c.strokeText('Z', 3, 3.2); c.fillStyle = '#7a64d8'; c.fillText('Z', 3, 3.2);
    sprites.z = s;
    return s;
  }
  var CODE = [['</>', '#3ff0ff'], ['{ }', '#b4ff3f'], ['01', '#ff7eb6']];
  function codeSprite(k) {
    var key = 'c_' + k;
    if (sprites[key]) return sprites[key];
    var s = mkCanvas(12, 7), c = s.c;
    c.beginPath(); sub(c, 0.6, 0.6, 10.8, 5.8, 2.4);
    c.fillStyle = '#23204a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = CODE[k][1]; c.stroke();
    c.font = font(4.4); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = CODE[k][1]; c.fillText(CODE[k][0], 6, 3.7);
    sprites[key] = s;
    return s;
  }
  function glowSprite(col) {
    var key = 'g_' + col;
    if (sprites[key]) return sprites[key];
    var s = mkCanvas(16, 16), c = s.c;
    var g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, col); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.55; c.fillStyle = g; c.fillRect(0, 0, 16, 16);
    sprites[key] = s;
    return s;
  }
  function signSprite() {
    var key = 'sign_' + QT.L.get();
    if (sprites[key]) return sprites[key];
    var s = mkCanvas(26, 13), c = s.c;
    c.lineJoin = 'round';
    c.beginPath(); sub(c, 0.8, 0.8, 24.4, 11.4, 3);
    c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#ff3f8e'; c.stroke();
    c.beginPath(); sub(c, 2.2, 2.2, 21.6, 3.4, 1.4); c.fillStyle = '#ff3f8e'; c.fill();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = font(2.9); c.fillStyle = '#ffffff'; c.fillText(QT.L.t('people_rent2'), 13, 4.1);
    var t = QT.L.t('people_rent');
    c.font = font(t.length > 5 ? 3.9 : 4.6); c.fillStyle = '#2f2c46'; c.fillText(t, 13, 8.7);
    sparkPath(c, 23.4, 1.6, 1.8); c.fillStyle = '#ffd23f'; c.fill();
    sprites[key] = s;
    return s;
  }
  function blit(c, s, x, y, k, alpha) {
    k = k || 1;
    var w = s.w * k, h = s.h * k;
    if (alpha != null && alpha < 1) { c.globalAlpha = alpha; c.drawImage(s.cv, x - w / 2, y - h, w, h); c.globalAlpha = 1; }
    else c.drawImage(s.cv, x - w / 2, y - h, w, h);
  }
  function blitC(c, s, x, y, k, alpha) {
    var w = s.w * k, h = s.h * k;
    c.globalAlpha = alpha == null ? 1 : alpha; c.drawImage(s.cv, x - w / 2, y - h / 2, w, h); c.globalAlpha = 1;
  }
  function backOut(k) { k = clamp(k, 0, 1); var s = 1.9; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); }
  var lookSeq = 0;
  function makeLook(role, sd) {
    var keep = seedG; seedG = (sd * 7919 + 17) | 0; rnd(); rnd();
    var lk = {
      id: 'L' + (++lookSeq), bb: BB_STAND,
      role: role, skin: pick(SKIN), hair: pick(HAIR), hs: Math.floor(rnd() * 8),
      top: pick(POP), pants: pick(PANTS), shoe: rnd() < 0.5 ? '#2a2440' : '#ffffff',
      kind: 'tee', hat: null, hatCol: null, item: null, scale: 1, glasses: rnd() < 0.22,
      skirt: rnd() < 0.3, badge: false, headset: false, tie: pick(TIE), accent: pick(POP),
      neon: pick(NEON), ball: pick(BALLOON), shades: false, gloves: null, goggles: false
    };
    var r = rnd();
    switch (role) {
      case 'emp':
        lk.kind = r < 0.5 ? 'hoodie' : 'tee'; lk.badge = true;
        lk.item = pick(['laptop', 'coffee', 'doc', 'laptop', null, 'phone']);
        lk.headset = rnd() < 0.2;
        break;
      case 'sales':
        lk.kind = 'suit'; lk.top = pick(['#e2508a', '#2bb8d8', '#6f57e0', '#ef7d2e', '#2f3a55']); lk.pants = pick(['#2f3a55', '#3c4767', '#4a4060']);
        lk.tie = pick(TIE); lk.badge = true; lk.item = pick(['phone', 'phone', 'doc', 'brief']); lk.shoe = '#2a2440';
        break;
      case 'acct':
        lk.kind = 'cardigan'; lk.top = pick(['#f2c96b', '#9fb8d8', '#b8e0c8', '#e8b8d8']); lk.accent = pick(['#ffffff', '#f4f6ff']);
        lk.glasses = rnd() < 0.7; lk.badge = true; lk.item = pick(['doc', 'doc', 'clip', 'coffee']);
        break;
      case 'guest':
        lk.kind = 'suit'; lk.top = rnd() < 0.35 ? pick(SUIT_POP) : pick(SUIT); lk.pants = rnd() < 0.5 ? lk.top : pick(SUIT);
        lk.hair = pick(HAIR_BIZ); lk.item = pick(['brief', 'brief', 'doc', 'phone']); lk.shoe = '#2a2440';
        break;
      case 'biz':
        lk.kind = 'suit'; lk.top = rnd() < 0.3 ? pick(SUIT_POP) : pick(SUIT); lk.pants = rnd() < 0.6 ? pick(SUIT) : pick(PANTS);
        lk.hair = pick(HAIR_BIZ); lk.shoe = '#2a2440';
        lk.item = pick(['brief', 'brief', 'phone', 'coffee', 'doc']);
        break;
      case 'shop':
        lk.kind = r < 0.7 ? 'tee' : 'hoodie';
        if (rnd() < 0.3) { lk.scale = 0.78; lk.item = rnd() < 0.7 ? 'balloon' : 'icecream'; lk.hat = rnd() < 0.4 ? 'cap' : null; lk.hatCol = pick(POP); }
        else lk.item = pick(['bag', 'bag', 'icecream', 'balloon', 'coffee', null]);
        break;
      case 'worker':
        lk.kind = 'vest'; lk.top = pick(['#3c4767', '#5a6c9e', '#6b7280']); lk.accent = pick(['#ff8a1f', '#c6ff3f', '#ff8a1f']);
        lk.hat = 'hard'; lk.hatCol = pick(['#ffffff', '#ffffff', '#ff8a1f', '#3fc7ff', '#3fe08a']);
        lk.pants = '#3c4767'; lk.shoe = '#5a3a24'; lk.skirt = false;
        lk.item = pick(['box', 'wrench', null, 'box', 'clip']);
        break;
      case 'bunny':
        lk.kind = 'bunny'; lk.top = pick(['#f4f8ff', '#eaf4ff', '#fff2fa']); lk.accent = pick(['#3fc7ff', '#ff7eb6', '#8f6bff']);
        lk.pants = lk.top; lk.shoe = lk.accent; lk.skirt = false; lk.glasses = false;
        lk.item = pick(['wafer', 'wafer', null, 'clip']);
        break;
      case 'mech':
        lk.kind = 'jump'; lk.top = pick(['#2f5bd8', '#e2504a', '#2f3a55', '#ef7d2e']); lk.pants = lk.top;
        lk.hat = 'cap'; lk.hatCol = pick(['#ffd23f', '#ffffff', '#e2504a']); lk.skirt = false; lk.shoe = '#2a2440';
        lk.item = pick(['wrench', 'wrench', 'toolbox', null]);
        break;
      case 'sci':
        lk.kind = 'coat'; lk.goggles = rnd() < 0.6; lk.gloves = rnd() < 0.5 ? '#3fc7ff' : null;
        lk.item = pick(['dewar', 'clip', 'dewar', null]);
        break;
      case 'party':
        lk.kind = 'party'; lk.top = pick(NEON); lk.pants = pick(['#23204a', '#3a2a6e', '#2b2b3a']);
        lk.shades = rnd() < 0.55; lk.item = 'glow'; lk.hair = pick(HAIR); lk.glasses = false;
        break;
      case 'show':
        lk.kind = 'party'; lk.top = pick(['#ffd23f', '#ff3fa4', '#3ff0ff', '#b77bff']); lk.pants = '#23204a';
        lk.skirt = true; lk.accent = lk.top; lk.plume = pick([['#ff3fa4', '#ffd23f', '#3ff0ff'], ['#b77bff', '#ff3fa4', '#ffffff'], ['#3ff0ff', '#b4ff3f', '#ffd23f']]);
        lk.item = null; lk.shades = false; lk.glasses = false; lk.hs = 5;
        break;
      case 'mascot':
        lk.kind = 'mascot'; lk.item = 'balloons';
        break;
      case 'free':
        lk.kind = r < 0.6 ? 'hoodie' : 'tee';
        lk.item = pick(['laptop', 'coffee', 'laptop', 'phone']);
        if (rnd() < 0.45) { lk.hat = 'beanie'; lk.hatCol = pick(POP); }
        lk.headset = rnd() < 0.25;
        break;
      case 'agent':
        lk.kind = 'suit'; lk.top = '#ff5a8a'; lk.pants = '#2f3a55'; lk.tie = '#ffd23f';
        lk.hair = pick(HAIR_BIZ); lk.item = null; lk.shoe = '#2a2440'; lk.badge = true; lk.skirt = false;
        break;
      case 'rival':
      case 'rep': {
        var RVa = QT.Art.rv, rid = lk.rv || null;
        if (!rid && RVa) {
          var dom = RVa.data().filter(function (q) { return RVa.domestic(q.id); });
          if (dom.length) rid = dom[Math.floor(rnd() * dom.length) % dom.length].id;
        }
        var rc = rid && RVa ? RVa.color(rid) : '#2bb8d8';
        lk.kind = 'suit'; lk.hair = pick(HAIR_BIZ); lk.shoe = '#2a2440'; lk.skirt = rnd() < 0.25; lk.badge = false;
        if (role === 'rep') { lk.top = I_shade(rc, -8); lk.pants = '#2f3a55'; lk.tie = '#ffffff'; lk.item = 'brief'; }
        else { lk.top = pick(['#2f3a55', '#253050', '#3a3550']); lk.pants = lk.top; lk.tie = rc; lk.item = pick(['brief', 'phone', 'doc', 'coffee']); }
        lk.accent = rc; lk.rv = rid; lk.pin = rid && RVa ? RVa.flagOf(rid) : null;
        break;
      }
      case 'robot':
        lk.kind = 'robot'; lk.item = null; lk.accent = pick(['#3ff0ff', '#ff7eb6', '#b4ff3f']);
        lk.top = pick(['#ffffff', '#f4f0ff']);
        break;
    }
    if (lk.kind === 'mascot') lk.bb = BB_MASCOT;
    else if (lk.kind === 'robot') lk.bb = BB_ROBOT;
    else if (lk.item === 'balloon' || lk.plume) lk.bb = BB_TALL;
    seedG = keep;
    return lk;
  }
  function figure(c, x, y, lk, dir, o) {
    if (lk.kind === 'mascot') return mascot(c, x, y, dir, o);
    if (lk.kind === 'robot') return robot(c, x, y, lk, dir, o);
    var front = dir === 0 || dir === 1, flip = dir === 0 || dir === 3;
    var t = o.t, pose = o.pose || 'stand';
    var sw = o.moving ? Math.sin(o.walk) * 1.7 : 0;
    var bob = o.moving ? Math.abs(Math.sin(o.walk)) * 1.1 : 0;
    var sc = lk.scale || 1;
    if (pose === 'dance') bob = Math.abs(Math.sin(t * 7 + o.ph)) * 2.6;
    if (o.seat) {   }
    else if (lk.kind === 'party') {
      c.globalAlpha = 0.45 + 0.25 * Math.sin(t * 6 + o.ph);
      c.beginPath(); c.ellipse(x, y, 6.5 * sc, 2.8 * sc, 0, 0, 6.2832); c.fillStyle = lk.top; c.fill();
      c.globalAlpha = 1;
    } else {
      c.beginPath(); c.ellipse(x, y, 4.8 * sc, 2.1 * sc, 0, 0, 6.2832); c.fillStyle = 'rgba(40,30,60,0.22)'; c.fill();
    }
    c.save();
    c.translate(x, y - bob * sc);
    if (sc !== 1) c.scale(sc, sc);
    if (flip) c.scale(-1, 1);
    if (o.seat) c.translate(0, -o.seat);
    c.lineJoin = 'round'; c.lineCap = 'round';
    var bunny = lk.kind === 'bunny', coat = lk.kind === 'coat';
    var sleeve = coat ? '#f7f8fc' : lk.kind === 'vest' ? lk.top : lk.top;
    var hand = lk.gloves || (bunny ? lk.accent : lk.skin);
    var nod = pose === 'type' ? Math.sin(t * 9 + o.ph) * 0.35 : pose === 'dance' ? Math.sin(t * 7 + o.ph) * 0.5 : 0;
    var droop = o.sleep ? 1.6 : 0;
    var headY = -20.4 + nod + droop, headX = o.sleep ? 0.8 : 0;
    var nx = 4.4 + sw * 0.7, ny = -7.4, fx = -4.4 - sw * 0.7, fy = -7.4;
    if (o.seat) { nx = 5.6; ny = -9.4; fx = 4.2; fy = -9.8; }
    switch (pose) {
      case 'dance': {
        var w0 = Math.sin(t * 7 + o.ph);
        nx = 5.4; ny = -20.5 + w0 * 2.2; fx = -5.4; fy = -20.5 - w0 * 2.2;
        break;
      }
      case 'wave': nx = 5.8 + Math.sin(t * 14) * 0.9; ny = -18.5; break;
      case 'type': { var tp = Math.abs(Math.sin(t * 16 + o.ph)) * 1.1; ny = -9.6 - tp; fy = -9.8 - (1.1 - tp); break; }
      case 'sip': nx = 2.6; ny = -14.6; break;
      case 'stretch': nx = 3.6; ny = -23.5; fx = -3.4; fy = -23.5; break;
      case 'solder': nx = 5.6 + Math.sin(t * 11) * 0.3; ny = -10.4; fx = 3.8; fy = -9; break;
      case 'inspect': nx = 4.6; ny = -8.8 + Math.sin(t * 2) * 0.4; fx = 1.8; fy = -8.4; break;
      case 'read': nx = 4.2; ny = -10.6; fx = 2.6; fy = -10.2; break;
      case 'phone': nx = 2.6; ny = -16.2; break;
      case 'carry': nx = 4.4; ny = -9.6; fx = 2.4; fy = -9.8; break;
      case 'sign': nx = 4.6; ny = -12; break;
    }
    if (pose === 'stand' || (o.moving && pose !== 'dance')) {
      if (lk.item === 'box' || lk.item === 'wafer' || lk.item === 'laptop') { nx = 4.4; ny = -9.6; fx = 2.4; fy = -9.8; }
      else if (lk.item === 'phone' && !o.moving) { nx = 2.6; ny = -16.2; }
    }
    c.beginPath();
    if (o.seat) { sub(c, -1.2, -7.2, 7.6, 3.2, 1.5); sub(c, 4.2, -6, 2.8, o.seat + 6, 1.3); }
    else { sub(c, -3.2, -6.4, 2.8, 6.4 + sw, 1.3); sub(c, 0.4, -6.4, 2.8, 6.4 - sw, 1.3); }
    if (coat) sub(c, -4.6, -13.4, 9.2, 10.8, 3); else sub(c, -4.2, -13.4, 8.4, 8.8, 3.2);
    if (bunny) sub(c, -4.1 + headX, headY - 0.9, 8.2, 8.9, 3.6); else sub(c, -3.6 + headX, headY, 7.2, 7.6, 3.3);
    c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke();
    if (pose !== 'stretch' && pose !== 'dance') arm(c, -2.8, -11.6, fx, fy, sleeve, hand);
    if (pose === 'dance' || pose === 'stretch') arm(c, -3, -12, fx, fy, sleeve, hand);
    if (lk.item === 'glow' && (pose === 'dance' || o.moving)) glowStick(c, fx, fy, lk.neon, t, o.ph + 1);
    var leg = bunny ? lk.top : lk.skirt ? '#4a4060' : lk.pants;
    if (o.seat) {
      frr(c, -1.2, -7.2, 7.6, 3.2, 1.5, lk.pants);
      frr(c, 4.2, -6, 2.8, o.seat + 6, 1.3, lk.pants);
      frr(c, 4, o.seat - 1.4, 3.8, 1.8, 0.8, lk.shoe);
    } else {
      var lw2 = lk.skirt ? 2.2 : 2.8;
      frr(c, -3.2 + (2.8 - lw2) / 2, -6.4, lw2, 6.4 + sw, 1.1, leg);
      frr(c, 0.4 + (2.8 - lw2) / 2, -6.4, lw2, 6.4 - sw, 1.1, leg);
      frr(c, -3.5, sw - 1.3, 3.4, 1.7, 0.8, lk.shoe);
      frr(c, 0.2, -sw - 1.3, 3.8, 1.7, 0.8, lk.shoe);
      if (lk.skirt && !coat) {
        c.beginPath(); c.moveTo(-4, -6.6); c.lineTo(4, -6.6); c.lineTo(4.8, -3.2); c.lineTo(-4.8, -3.2); c.closePath();
        c.fillStyle = lk.accent; c.fill();
      }
    }
    body(c, lk, front, t, o);
    if (lk.plume) plume(c, lk.plume, headX, headY, t, o.ph);
    head(c, lk, front, headX, headY, t, o);
    if (pose === 'dance' || pose === 'stretch') arm(c, 3, -12, nx, ny, sleeve, hand);
    else arm(c, 2.8, -11.6, nx, ny, sleeve, hand);
    if (pose === 'wave' && lk.item !== 'balloon') item(c, lk, fx + 0.6, fy, t, o, front);
    else if (pose !== 'stretch') item(c, lk, nx, ny, t, o, front);
    if (pose === 'solder') sparks(c, nx + 2.6, ny + 1.4, t, o.ph);
    if (pose === 'inspect') chip(c, nx + 0.2, ny - 2, t);
    c.restore();
  }
  function body(c, lk, front, t, o) {
    var k = lk.kind;
    if (k === 'coat') {
      frr(c, -4.6, -13.4, 9.2, 10.8, 3, '#f7f8fc');
      if (front) {
        c.beginPath(); c.moveTo(0.2, -13.2); c.lineTo(3.4, -13.2); c.lineTo(1.8, -9.2); c.closePath();
        c.fillStyle = lk.top; c.fill();
        line(c, 1.8, -9.2, 1.8, -3.2, 0.6, '#c9cfe0');
        frr(c, -2.8, -8.2, 2.6, 2.2, 0.6, '#e6e9f3');
        line(c, -1.9, -8.6, -1.9, -7, 0.7, '#e2504a');
      }
      frr(c, -4.6, -13.4, 9.2, 2, 1, 'rgba(210,220,240,0.8)');
      return;
    }
    var col = k === 'party' ? lk.top : lk.top;
    frr(c, -4.2, -13.4, 8.4, 8.8, 3.2, col);
    if (k === 'hoodie') {
      frr(c, -4.2, -14.2, 4.6, 2.6, 1.3, I_shade(col, -34));
      if (front) {
        frr(c, -0.6, -8.4, 4.4, 2.4, 1, I_shade(col, -22));
        line(c, 1.4, -12.6, 1.4, -10.6, 0.5, '#ffffff'); line(c, 2.8, -12.6, 2.8, -10.8, 0.5, '#ffffff');
      }
    } else if (k === 'tee') {
      if (front) dot(c, 1.6, -9.6, 1.25, 'rgba(255,255,255,0.85)');
    } else if (k === 'suit') {
      if (front) {
        c.beginPath(); c.moveTo(0.2, -13.3); c.lineTo(3.6, -13.3); c.lineTo(1.9, -8.8); c.closePath();
        c.fillStyle = '#ffffff'; c.fill();
        frr(c, 1.35, -12.6, 1.1, 3.8, 0.5, lk.tie);
      }
    } else if (k === 'cardigan') {
      if (front) {
        frr(c, 0.4, -13.2, 2.8, 8.4, 1, lk.accent);
        dot(c, 3.4, -10.8, 0.45, '#ffffff'); dot(c, 3.4, -8.6, 0.45, '#ffffff');
      }
    } else if (k === 'vest') {
      frr(c, -4.2, -12.4, 8.4, 7.4, 2.6, lk.accent);
      frr(c, -4.2, -10.6, 8.4, 1, 0.4, '#f4f6ff');
      frr(c, -4.2, -7.6, 8.4, 1, 0.4, '#f4f6ff');
    } else if (k === 'jump') {
      frr(c, -4.2, -6.4, 8.4, 1, 0.4, '#2a2440');
      if (front) frr(c, 0.6, -11.6, 2.6, 1.6, 0.4, '#ffffff');
    } else if (k === 'bunny') {
      line(c, front ? 1.6 : -0.4, -13, front ? 1.6 : -0.4, -5, 0.6, lk.accent);
    } else if (k === 'party') {
      var gx = -3 + ((t * 5 + o.ph * 3) % 7);
      dot(c, gx, -10.5, 0.9, 'rgba(255,255,255,0.95)');
      dot(c, -1 + ((t * 3 + o.ph) % 5), -7.2, 0.6, 'rgba(255,255,255,0.7)');
    }
    if (lk.pin && front && QT.Art.rv) {
      QT.Art.rv.flag(c, lk.pin, -3.3, -12.2, 2.8, 1.9);
    }
    if (lk.badge && front) {
      line(c, 0.2, -13.2, 1.8, -9.6, 0.45, '#2bb8d8'); line(c, 3.4, -13.2, 1.8, -9.6, 0.45, '#2bb8d8');
      frr(c, 0.9, -9.8, 1.9, 2.3, 0.4, '#ffffff');
    }
    frr(c, -4.2, -13.4, 8.4, 2.2, 1.1, 'rgba(255,255,255,0.32)');
  }
  function I_shade(col, amt) { return QT.Iso.shade(col, amt); }
  function head(c, lk, front, hx, hy, t, o) {
    var bunny = lk.kind === 'bunny';
    if (bunny) {
      frr(c, -4.1 + hx, hy - 0.9, 8.2, 8.9, 3.6, lk.top);
      if (front) {
        frr(c, -0.4 + hx, hy + 2.6, 4.4, 2.6, 1.2, '#2a3a6e');
        frr(c, 0.4 + hx, hy + 3, 1.6, 0.8, 0.4, 'rgba(160,240,255,0.9)');
      }
      frr(c, -4.1 + hx, hy + 6.2, 8.2, 1.4, 0.6, lk.accent);
      return;
    }
    if (!front) {
      frr(c, -3.6 + hx, hy, 7.2, 7.6, 3.3, lk.hat === 'hard' || lk.hat === 'cap' ? lk.hair : lk.hair);
      frr(c, 2.4 + hx, hy + 3.2, 1.4, 2.2, 0.7, lk.skin);
      hairExtra(c, lk, false, hx, hy);
      hat(c, lk, false, hx, hy);
      if (lk.headset) { c.beginPath(); c.arc(hx, hy + 3.6, 3.9, Math.PI * 1.05, -0.05); c.lineWidth = 0.8; c.strokeStyle = '#2a2440'; c.stroke(); }
      return;
    }
    frr(c, -3.6 + hx, hy, 7.2, 7.6, 3.3, lk.skin);
    var hc = lk.hair, hs = lk.hs;
    if (!lk.hat || lk.hat === 'cap' || lk.hat === 'beanie') {
      if (hs === 6) frr(c, -3.8 + hx, hy - 0.3, 7.6, 2.4, 1.5, hc);
      else if (hs === 7) { dot(c, -1.8 + hx, hy + 0.8, 2.6, hc); dot(c, 1.2 + hx, hy + 0.2, 2.6, hc); dot(c, -3 + hx, hy + 3, 2.2, hc); }
      else {
        frr(c, -3.9 + hx, hy - 0.5, 7.8, 3.4, 2.2, hc);
        frr(c, -3.9 + hx, hy - 0.5, 2.8, 6.6, 1.3, hc);
        if (hs === 4) {
          c.beginPath(); c.moveTo(-3.4 + hx, hy + 0.2); c.lineTo(-2.4 + hx, hy - 2.4); c.lineTo(-0.8 + hx, hy - 0.2);
          c.lineTo(0.6 + hx, hy - 2.8); c.lineTo(1.8 + hx, hy - 0.2); c.lineTo(3.4 + hx, hy - 1.8); c.lineTo(3.6 + hx, hy + 1);
          c.closePath(); c.fillStyle = hc; c.fill();
        } else frr(c, 1 + hx, hy + 0.6, 2.8, 1.8, 0.9, hc);
      }
      hairExtra(c, lk, true, hx, hy);
    }
    var ey = hy + 4.2;
    if (o.sleep) {
      line(c, 0 + hx, ey, 1.3 + hx, ey, 0.6, '#3a3550'); line(c, 2.1 + hx, ey, 3.3 + hx, ey, 0.6, '#3a3550');
    } else if (lk.shades) {
      frr(c, -0.4 + hx, ey - 1.1, 4.6, 2, 0.9, '#1b1830');
      frr(c, 0 + hx, ey - 0.9, 1.4, 0.6, 0.3, lk.top);
    } else if (lk.goggles) {
      frr(c, -3.6 + hx, ey - 1.3, 7.4, 2.5, 1.1, '#3fc7ff');
      frr(c, 0 + hx, ey - 1, 1.6, 1.8, 0.7, 'rgba(255,255,255,0.75)');
      frr(c, 2.2 + hx, ey - 1, 1.6, 1.8, 0.7, 'rgba(255,255,255,0.75)');
    } else {
      var blink = Math.sin(t * 1.3 + o.ph * 5) > 0.985;
      if (blink) { line(c, 0.2 + hx, ey, 1.2 + hx, ey, 0.5, '#3a3550'); line(c, 2.3 + hx, ey, 3.3 + hx, ey, 0.5, '#3a3550'); }
      else { dot(c, 0.7 + hx, ey, 0.8, '#3a3550'); dot(c, 2.8 + hx, ey, 0.8, '#3a3550'); }
      if (lk.glasses) {
        c.lineWidth = 0.4; c.strokeStyle = '#2a1a40';
        c.beginPath(); c.rect(-0.4 + hx, ey - 0.9, 2.1, 1.7); c.rect(1.9 + hx, ey - 0.9, 2.1, 1.7); c.stroke();
      }
    }
    dot(c, 3.1 + hx, ey + 1.7, 0.75, 'rgba(255,110,140,0.45)');
    if (!lk.hat) frr(c, -2.2 + hx, hy + 0.2, 2.8, 0.9, 0.45, 'rgba(255,255,255,0.35)');
    hat(c, lk, true, hx, hy);
    if (lk.headset) {
      c.beginPath(); c.arc(hx - 0.4, hy + 3.8, 4, Math.PI * 1.02, -0.08); c.lineWidth = 0.8; c.strokeStyle = '#2a2440'; c.stroke();
      frr(c, -3.4 + hx, hy + 2.6, 2, 2.8, 0.9, '#2a2440');
      c.beginPath(); c.moveTo(-2 + hx, hy + 5); c.quadraticCurveTo(0 + hx, hy + 7.4, 2.4 + hx, hy + 6.4);
      c.lineWidth = 0.5; c.stroke();
      dot(c, 2.5 + hx, hy + 6.4, 0.5, o.pose === 'type' && Math.sin(t * 8) > 0 ? '#ff3f6a' : '#6b6b80');
    }
  }
  function hairExtra(c, lk, front, hx, hy) {
    if (lk.hat === 'hard' || lk.kind === 'bunny') return;
    var hc = lk.hair, hs = lk.hs;
    if (hs === 1) frr(c, -4.3 + hx, hy + 1, 3, 8.6, 1.4, hc);
    else if (hs === 2) { dot(c, -4.9 + hx, hy + 3, 1.8, hc); frr(c, -6 + hx, hy + 3, 2.2, 4.6, 1, hc); }
    else if (hs === 3) dot(c, -0.6 + hx, hy - 0.8, 2, hc);
    else if (hs === 5) { frr(c, -4.2 + hx, hy + 1, 2.8, 6, 1.3, hc); if (front) frr(c, 2.6 + hx, hy + 1.6, 1.4, 4, 0.7, hc); }
  }
  function hat(c, lk, front, hx, hy) {
    if (lk.hat === 'hard') {
      c.beginPath(); c.arc(hx, hy + 2.4, 4.3, Math.PI, 0); c.closePath(); c.fillStyle = lk.hatCol; c.fill();
      frr(c, -4.9 + hx, hy + 1.6, front ? 11 : 9.8, 1.6, 0.8, I_shade(lk.hatCol, -30));
      frr(c, -0.6 + hx, hy - 1.9, 1.2, 3.6, 0.6, 'rgba(255,255,255,0.6)');
    } else if (lk.hat === 'cap') {
      c.beginPath(); c.arc(hx, hy + 2.6, 3.9, Math.PI, 0); c.closePath(); c.fillStyle = lk.hatCol; c.fill();
      if (front) frr(c, 1.2 + hx, hy + 1.8, 4.6, 1.4, 0.7, I_shade(lk.hatCol, -30));
      else frr(c, -4.2 + hx, hy + 1.8, 3, 1.3, 0.6, I_shade(lk.hatCol, -30));
    } else if (lk.hat === 'beanie') {
      c.beginPath(); c.arc(hx, hy + 2.8, 4.1, Math.PI, 0); c.closePath(); c.fillStyle = lk.hatCol; c.fill();
      frr(c, -4.3 + hx, hy + 1.6, 8.6, 1.9, 0.9, I_shade(lk.hatCol, -26));
      dot(c, hx, hy - 1.6, 1.3, '#ffffff');
    }
  }
  function plume(c, cols, hx, hy, t, ph) {
    var sway = Math.sin(t * 3 + ph) * 0.12;
    for (var k = -2; k <= 2; k++) {
      var a = k * 0.42 + sway - Math.PI / 2, len = 7.5 - Math.abs(k) * 0.9;
      var px = hx + Math.cos(a) * len * 0.7, py = hy + 1 + Math.sin(a) * len * 0.8;
      c.beginPath(); c.ellipse(px, py, 1.7, len * 0.62, a + Math.PI / 2, 0, 6.2832);
      c.fillStyle = cols[(k + 2) % cols.length]; c.fill();
      c.lineWidth = 0.6; c.strokeStyle = INK; c.stroke();
    }
    frr(c, hx - 3.9, hy + 0.2, 7.8, 1.5, 0.7, '#ffd23f');
    dot(c, hx + 1.5, hy + 0.9, 0.9, '#3ff0ff');
  }
  function glowStick(c, x, y, col, t, ph) {
    var a = Math.sin(t * 5 + ph) * 0.6;
    var x1 = x + Math.cos(a - 1.3) * 4.5, y1 = y + Math.sin(a - 1.3) * 4.5;
    c.lineCap = 'round';
    c.globalAlpha = 0.35; line(c, x, y, x1, y1, 3.6, col); c.globalAlpha = 1;
    line(c, x, y, x1, y1, 1.4, '#ffffff');
    line(c, x, y, x1, y1, 0.8, col);
  }
  function sparks(c, x, y, t, ph) {
    var f = Math.floor(t * 18 + ph * 7);
    for (var k = 0; k < 4; k++) {
      var h = Math.sin((f + k * 13) * 12.9898) * 43758.5453; h -= Math.floor(h);
      var a = -Math.PI * (0.1 + h * 0.8), d = 1.5 + h * 2.8;
      line(c, x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.6, k % 2 ? '#ffe93f' : '#ffffff');
    }
    dot(c, x, y, 0.9, '#ffffff');
  }
  function chip(c, x, y, t) {
    blitC(c, glowSprite('#3ff0ff'), x, y, 1.1, 0.45 + 0.35 * Math.sin(t * 4));
    frr(c, x - 3, y - 2.4, 6, 4.8, 0.8, '#f5b21c');
    frr(c, x - 2.3, y - 1.7, 4.6, 3.4, 0.6, '#23204a');
    frr(c, x - 1.1, y - 0.8, 2.2, 1.6, 0.5, Math.sin(t * 4) > 0 ? '#9ff8ff' : '#3ff0ff');
  }
  function item(c, lk, hx, hy, t, o, front) {
    switch (lk.item) {
      case 'bag':
        c.beginPath(); c.arc(hx, hy + 1.4, 1.4, Math.PI, 0); c.lineWidth = 0.6; c.strokeStyle = '#6b4630'; c.stroke();
        frr(c, hx - 2.2, hy + 1.2, 4.4, 4.8, 0.8, lk.accent);
        frr(c, hx - 2.2, hy + 1.2, 4.4, 1.2, 0.5, 'rgba(255,255,255,0.45)');
        break;
      case 'brief':
        frr(c, hx - 2.4, hy + 0.8, 5.4, 3.8, 0.9, '#8a5a3c');
        frr(c, hx - 0.6, hy + 0.2, 1.8, 1, 0.4, '#5a3a24');
        break;
      case 'coffee':
        frr(c, hx - 0.9, hy - 3.2, 2.4, 3.4, 0.6, '#ffffff');
        frr(c, hx - 1, hy - 3.6, 2.6, 0.9, 0.4, '#6b4630');
        if (o.pose === 'sip' || !o.moving) {
          c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3 + o.ph);
          c.beginPath(); c.moveTo(hx + 0.3, hy - 4); c.quadraticCurveTo(hx - 1 + Math.sin(t * 3) * 0.8, hy - 6, hx + 0.4, hy - 8);
          c.lineWidth = 0.6; c.strokeStyle = '#ffffff'; c.stroke(); c.globalAlpha = 1;
        }
        break;
      case 'doc':
        frr(c, hx - 1.2, hy - 3, 3.4, 4.2, 0.5, '#ffffff');
        line(c, hx - 0.4, hy - 1.8, hx + 1.4, hy - 1.8, 0.4, '#9aa3bb'); line(c, hx - 0.4, hy - 0.6, hx + 1.4, hy - 0.6, 0.4, '#9aa3bb');
        break;
      case 'laptop':
        frr(c, hx - 4.4, hy - 3.4, 5.6, 3.8, 0.8, '#b8c0d4');
        frr(c, hx - 4.4, hy - 3.4, 5.6, 1, 0.5, '#e8ecf6');
        dot(c, hx - 2.4, hy - 1.2, 0.8, lk.accent);
        break;
      case 'phone':
        frr(c, hx - 0.7, hy - 1.8, 1.6, 2.8, 0.4, '#23204a');
        if (!o.moving) dot(c, hx + 0.1, hy - 0.6, 0.35, '#3ff0ff');
        break;
      case 'balloon': {
        var sway = Math.sin(t * 1.6 + o.ph) * 1.4;
        var bx = hx + 1.5 + sway, by = hy - 15;
        c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 2, hy - 7, bx, by + 3.4);
        c.lineWidth = 0.4; c.strokeStyle = 'rgba(80,70,110,0.8)'; c.stroke();
        c.beginPath(); c.ellipse(bx, by, 3.2, 3.8, 0, 0, 6.2832); c.fillStyle = lk.ball; c.fill();
        c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
        c.beginPath(); c.moveTo(bx - 0.8, by + 3.8); c.lineTo(bx + 0.8, by + 3.8); c.lineTo(bx, by + 3); c.closePath(); c.fill();
        dot(c, bx - 1.1, by - 1.4, 0.9, 'rgba(255,255,255,0.75)');
        break;
      }
      case 'icecream':
        c.beginPath(); c.moveTo(hx - 1.3, hy - 1.4); c.lineTo(hx + 1.3, hy - 1.4); c.lineTo(hx, hy + 1.8); c.closePath();
        c.fillStyle = '#e8b06a'; c.fill();
        dot(c, hx, hy - 2.2, 1.6, lk.ball === '#ffd23f' ? '#fff3c4' : '#ffc0dc');
        dot(c, hx + 0.3, hy - 3.6, 1.1, '#ffffff');
        break;
      case 'box':
        frr(c, hx - 5.4, hy - 3.8, 6.4, 5, 0.7, '#c8a070');
        frr(c, hx - 5.4, hy - 3.8, 6.4, 1.2, 0.4, '#e0bf8e');
        line(c, hx - 2.2, hy - 3.8, hx - 2.2, hy + 1.2, 0.6, '#a07a4a');
        break;
      case 'wafer':
        frr(c, hx - 5.2, hy - 3.6, 6, 4.6, 1.2, '#ffffff');
        frr(c, hx - 4.4, hy - 2.8, 4.4, 2.8, 0.8, lk.accent);
        line(c, hx - 4, hy - 1.4, hx - 0.4, hy - 1.4, 0.4, '#ffffff');
        break;
      case 'wrench':
        line(c, hx, hy, hx + 1.6, hy + 3.6, 0.9, '#9aa3bb');
        dot(c, hx + 1.8, hy + 4, 1, '#9aa3bb'); dot(c, hx + 1.8, hy + 4, 0.4, lk.top);
        break;
      case 'toolbox':
        frr(c, hx - 2.6, hy + 0.6, 5.6, 3.4, 0.7, '#e2504a');
        frr(c, hx - 1, hy - 0.2, 2.4, 1, 0.4, '#2a2440');
        break;
      case 'clip':
        frr(c, hx - 1.6, hy - 3.4, 3.8, 4.8, 0.6, '#b08050');
        frr(c, hx - 1.1, hy - 2.8, 2.8, 3.8, 0.4, '#ffffff');
        frr(c, hx - 0.4, hy - 3.8, 1.4, 1, 0.3, '#8f93a8');
        break;
      case 'dewar':
        frr(c, hx - 1.6, hy - 1, 3.4, 5.6, 1.4, '#c9d3e6');
        frr(c, hx - 1.6, hy - 1, 1, 5.6, 0.5, '#ffffff');
        frr(c, hx - 0.8, hy - 2, 1.8, 1.2, 0.4, '#3fc7ff');
        c.globalAlpha = 0.45 + 0.25 * Math.sin(t * 4 + o.ph);
        dot(c, hx + Math.sin(t * 3) * 0.6, hy - 3.6, 1.1, '#ffffff'); c.globalAlpha = 1;
        break;
      case 'glow':
        if (o.pose === 'dance' || o.moving) glowStick(c, hx, hy, lk.neon === lk.top ? '#ffffff' : lk.neon, t, o.ph);
        break;
    }
  }
  function mascot(c, x, y, dir, o) {
    var t = o.t, flip = dir === 0 || dir === 3, front = dir === 0 || dir === 1;
    var sw = o.moving ? Math.sin(o.walk) * 1.6 : 0;
    var bob = o.moving ? Math.abs(Math.sin(o.walk)) * 1.2 : Math.abs(Math.sin(t * 4)) * 0.8;
    c.beginPath(); c.ellipse(x, y, 7, 3, 0, 0, 6.2832); c.fillStyle = 'rgba(40,30,60,0.24)'; c.fill();
    c.save(); c.translate(x, y - bob); if (flip) c.scale(-1, 1);
    c.lineJoin = 'round'; c.lineCap = 'round';
    var bx = -7, by = -38;
    for (var k = 0; k < 3; k++) {
      var sx = bx + (k - 1) * 3.6 + Math.sin(t * 1.4 + k) * 1.2, sy = by - (k === 1 ? 3 : 0);
      line(c, -6, -14, sx, sy + 3.4, 0.4, 'rgba(80,70,110,0.8)');
      c.beginPath(); c.ellipse(sx, sy, 3, 3.6, 0, 0, 6.2832); c.fillStyle = BALLOON[k * 2]; c.fill();
      c.lineWidth = 0.7; c.strokeStyle = INK; c.stroke();
      dot(c, sx - 1, sy - 1.3, 0.8, 'rgba(255,255,255,0.75)');
    }
    c.beginPath(); sub(c, -4.6, -4, 3.8, 4 + sw, 1.6); sub(c, 0.8, -4, 3.8, 4 - sw, 1.6);
    sub(c, -7, -17, 14, 14, 6.5);
    c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    frr(c, -4.6, -4, 3.8, 4 + sw, 1.6, '#6f57e0'); frr(c, 0.8, -4, 3.8, 4 - sw, 1.6, '#6f57e0');
    frr(c, -7, -17, 14, 14, 6.5, '#8a6bff');
    frr(c, -4.5, -13, 9, 8, 4, '#d8ccff');
    dot(c, 0, -9, 1.6, '#ff7eb6');
    var wv = Math.sin(t * 9) * 2;
    arm(c, -6, -13, -9 + (o.moving ? sw : 0), -9, '#8a6bff', '#ffffff');
    arm(c, 6, -13, 9.5, o.moving ? -9 - sw : -18 + wv, '#8a6bff', '#ffffff');
    c.beginPath(); c.arc(0, -23, 7.4, 0, 6.2832); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#8a6bff'; c.fill();
    if (front) {
      c.beginPath(); c.ellipse(1.4, -22.2, 5.2, 4.4, 0, 0, 6.2832); c.fillStyle = '#ffffff'; c.fill();
      dot(c, -0.4, -22.8, 1.1, '#23204a'); dot(c, 3.4, -22.8, 1.1, '#23204a');
      dot(c, -0.1, -23.2, 0.4, '#ffffff'); dot(c, 3.7, -23.2, 0.4, '#ffffff');
      c.beginPath(); c.arc(1.5, -21.2, 1.2, 0.2, Math.PI - 0.2); c.lineWidth = 0.6; c.strokeStyle = '#23204a'; c.stroke();
      dot(c, -2.4, -20.8, 0.9, 'rgba(255,110,160,0.7)'); dot(c, 5.4, -20.8, 0.9, 'rgba(255,110,160,0.7)');
    }
    frr(c, -4.5, -29, 5, 2.2, 1.1, 'rgba(255,255,255,0.35)');
    line(c, 0, -30, 1.5, -34.5, 0.8, '#2a2440');
    blitC(c, glowSprite('#3ff0ff'), 1.6, -35.5, 0.7, 0.6 + 0.3 * Math.sin(t * 5));
    dot(c, 1.6, -35.5, 1.7, '#3ff0ff'); dot(c, 1.1, -36, 0.6, '#ffffff');
    c.restore();
  }
  function robot(c, x, y, lk, dir, o) {
    var front = dir === 0 || dir === 1, flip = dir === 0 || dir === 3, t = o.t;
    var hop = o.moving ? Math.abs(Math.sin(o.walk)) * 0.9 : 0;
    c.beginPath(); c.ellipse(x, y, 6, 2.4, 0, 0, 6.2832); c.fillStyle = 'rgba(40,30,60,0.24)'; c.fill();
    c.save(); c.translate(x, y - hop); if (flip) c.scale(-1, 1);
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (var k = -1; k <= 1; k += 2) {
      dot(c, k * 3.6, -2.2, 2.5, INK); dot(c, k * 3.6, -2.2, 1.9, '#3a3550');
      var a = (o.walk || 0) * 1.6 + k;
      line(c, k * 3.6 - Math.cos(a) * 1.4, -2.2 - Math.sin(a) * 1.4, k * 3.6 + Math.cos(a) * 1.4, -2.2 + Math.sin(a) * 1.4, 0.6, '#9aa3bb');
    }
    line(c, -1.5, -14, -2.6, -22.5, 1.5, INK); line(c, -1.5, -14, -2.6, -22.5, 0.7, '#8f93a8');
    var wv = Math.sin(t * 6 + (o.walk || 0)) * 0.8;
    c.beginPath(); c.moveTo(-2.6, -22.5); c.lineTo(-7.2, -21.2 + wv); c.lineTo(-2.8, -19.4); c.closePath();
    c.fillStyle = '#ff3f8e'; c.fill(); c.lineWidth = 0.5; c.strokeStyle = INK; c.stroke();
    dot(c, -2.6, -22.8, 1.2, lk.accent);
    c.beginPath(); sub(c, -6.4, -19.6, 6.8, 6.2, 1); c.lineWidth = 1.3; c.strokeStyle = INK; c.stroke();
    frr(c, -6.4, -19.6, 6.8, 6.2, 1, '#d6a86e'); frr(c, -6.4, -19.6, 6.8, 1.5, 0.6, '#ecc68e');
    line(c, -3, -19.6, -3, -13.4, 0.8, '#b0864e');
    c.beginPath(); sub(c, -5.8, -14.6, 11.6, 11.4, 4); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke();
    frr(c, -5.8, -14.6, 11.6, 11.4, 4, lk.top);
    frr(c, -5.8, -6.2, 11.6, 1.6, 0.7, lk.accent);
    frr(c, -4.6, -14, 5, 1.6, 0.8, 'rgba(255,255,255,0.9)');
    if (front) {
      frr(c, -0.6, -12.8, 5.8, 5.4, 1.8, '#23204a');
      var blink = !o.moving && Math.sin(t * 2.3) > 0.93;
      if (blink) { line(c, 0.9, -10.2, 1.9, -10.2, 0.6, lk.accent); line(c, 3, -10.2, 4, -10.2, 0.6, lk.accent); }
      else { dot(c, 1.5, -10.4, 0.85, lk.accent); dot(c, 3.6, -10.4, 0.85, lk.accent); }
      c.beginPath(); c.arc(2.5, -9.2, 1, 0.3, Math.PI - 0.3); c.lineWidth = 0.5; c.strokeStyle = lk.accent; c.stroke();
    } else {
      frr(c, -3.6, -12.4, 5.2, 3.6, 1.2, '#dcd8ec');
      dot(c, -1, -10.6, 0.7, '#2fbf7a');
    }
    c.restore();
  }
  var FC = { sc: 0, map: {}, px: 0, tick: 0, made: 0 };
  var FC_MAXPX = 10e6, FC_CAP = 3;
  function fcScale(c) {
    var m = c.getTransform();
    return Math.min(FC_CAP, Math.round(Math.sqrt(m.a * m.a + m.b * m.b) * 50) / 50);
  }
  function fcCheck(sc) {
    if (sc > 0 && sc !== FC.sc) { FC.map = {}; FC.px = 0; FC.sc = sc; }
  }
  function fcEvict(need) {
    var keys = Object.keys(FC.map);
    keys.sort(function (a, b) { return FC.map[a].u - FC.map[b].u; });
    for (var i = 0; i < keys.length && (i < keys.length / 3 || FC.px + need > FC_MAXPX * 0.7); i++) {
      FC.px -= FC.map[keys[i]].px; delete FC.map[keys[i]];
    }
  }
  var PF_LK = null, PF_DIR = 1, PF_O = null, PF_SEAT = null;
  function paintFigure(c) {
    if (PF_SEAT) chair(c, 0, 0, PF_SEAT);
    figure(c, 0, 0, PF_LK, PF_DIR, PF_O);
  }
  function fcGet(key, bb) {
    FC.tick++;
    var rec = FC.map[key];
    if (rec) { rec.u = FC.tick; return rec; }
    var sc = FC.sc || 2;
    var w = Math.ceil((bb[1] - bb[0]) * sc) + 2, h = Math.ceil((bb[3] - bb[2]) * sc) + 2;
    if (FC.px + w * h > FC_MAXPX) fcEvict(w * h);
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var c = cv.getContext('2d');
    c.setTransform(sc, 0, 0, sc, -bb[0] * sc + 1, -bb[2] * sc + 1);
    paintFigure(c);
    rec = { cv: cv, x: bb[0] - 1 / sc, y: bb[2] - 1 / sc, w: w / sc, h: h / sc, u: FC.tick, px: w * h };
    FC.map[key] = rec; FC.px += w * h; FC.made++;
    return rec;
  }
  function fcBlit(c, rec, x, y, flip) {
    if (flip) {
      c.save(); c.translate(x, y); c.scale(-1, 1);
      c.drawImage(rec.cv, rec.x, rec.y, rec.w, rec.h);
      c.restore();
    } else c.drawImage(rec.cv, x + rec.x, y + rec.y, rec.w, rec.h);
  }
  var TAU = 6.2832;
  function wrap(v, m) { v = v % m; return v < 0 ? v + m : v; }
  var FO = { t: 0, walk: 0, moving: false, pose: 'stand', ph: 0, sleep: false, seat: 0 };
  function personKey(n, S, base) {
    var lk = n.lk, f;
    FO.sleep = false; FO.seat = 0; FO.ph = 0;
    if (n.moving) {
      f = Math.floor(wrap(n.walk, TAU) / TAU * 6);
      FO.moving = true; FO.walk = (f + 0.5) / 6 * TAU; FO.t = f * 0.21;
      FO.pose = n.role === 'agent' ? 'sign' : 'walk';
      return lk.id + '|' + base + '|w' + f;
    }
    FO.moving = false; FO.walk = 0;
    if (lk.kind === 'mascot') {
      f = Math.floor(wrap(S.t * 9 + n.ph, TAU) / TAU * 4);
      FO.t = (f + 0.5) / 4 * TAU / 9; FO.pose = 'stand';
      return lk.id + '|' + base + '|m' + f;
    }
    if (lk.kind === 'robot') {
      f = Math.sin(S.t * 2.3 + n.ph) > 0.93 ? 1 : 0;
      FO.t = f ? 0.62 : 0; FO.pose = 'stand';
      return lk.id + '|' + base + '|r' + f;
    }
    if (n.pose === 'dance') {
      f = Math.floor(wrap(S.t * 7 + n.ph, TAU) / TAU * 6);
      FO.t = (f + 0.5) / 6 * TAU / 7; FO.pose = 'dance';
      return lk.id + '|' + base + '|d' + f;
    }
    if (n.pose === 'wave') {
      f = Math.floor(wrap(S.t * 14, TAU) / Math.PI) % 2;
      FO.t = (f ? 1.5 : 0.5) * Math.PI / 14; FO.pose = 'wave';
      return lk.id + '|' + base + '|v' + f;
    }
    FO.t = 0; FO.pose = n.pose === 'sign' ? 'sign' : 'stand';
    return lk.id + '|' + base + '|' + FO.pose;
  }
  function drawPerson(c, n, S, x, y, dir) {
    var base = dir === 0 || dir === 1 ? 1 : 2;
    var key = personKey(n, S, base);
    var rec = n.recKey === key ? n.rec : null;
    if (!rec || FC.map[key] !== rec) {
      rec = FC.map[key];
      if (!rec) { PF_LK = n.lk; PF_DIR = base; PF_O = FO; PF_SEAT = null; rec = fcGet(key, n.lk.bb); }
      n.rec = rec; n.recKey = key;
    }
    FC.tick++; rec.u = FC.tick;
    fcBlit(c, rec, x, y, dir === 0 || dir === 3);
  }
  var staffLooks = {};
  function staffLook(kind, i) {
    var key = kind + i;
    if (staffLooks[key]) return staffLooks[key];
    var lk;
    if (kind === 'hwlab') {
      lk = makeLook('sci', 300 + i * 11);
      lk.goggles = true; lk.gloves = '#3fc7ff'; lk.item = null; lk.glasses = false;
    } else {
      lk = makeLook('emp', 100 + i * 13);
      lk.item = null; lk.badge = true;
      lk.headset = i % 2 === 1;
      lk.top = ['#2bb8d8', '#ff5a8a', '#f5b21c', '#6f57e0'][i % 4];
      lk.kind = i % 2 ? 'hoodie' : 'tee';
      lk.hs = [0, 1, 4, 2][i % 4];
      lk.skirt = false;
    }
    staffLooks[key] = lk;
    return lk;
  }
  function swBusy(S) {
    for (var k = 0; k < S.jobs.length; k++) { var j = S.jobs[k]; if (j.kind === 'sw' && j.done < j.work) return true; }
    return false;
  }
  function chair(c, x, y, col) {
    c.beginPath(); c.ellipse(x, y, 5, 2.1, 0, 0, 6.2832); c.fillStyle = 'rgba(40,30,60,0.22)'; c.fill();
    frr(c, x - 4.4, y - 1.4, 8.8, 1.6, 0.8, '#3a3550');
    frr(c, x - 0.7, y - 5.2, 1.4, 4.2, 0.5, '#5c5470');
    c.beginPath(); sub(c, x - 7.4, y - 19.5, 5.4, 14, 2.4); sub(c, x - 5, y - 7.4, 9.6, 3, 1.4);
    c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke();
    frr(c, x - 7.4, y - 19.5, 5.4, 14, 2.4, '#2a2440');
    frr(c, x - 6.6, y - 18.4, 1.4, 11.8, 0.7, col);
    frr(c, x - 5, y - 7.4, 9.6, 3, 1.4, '#3a3550');
    frr(c, x - 5, y - 7.4, 9.6, 1, 0.5, col);
  }
  function staffRec(key, lk, dir, seatCol, bb) {
    var rec = FC.map[key];
    if (rec) { FC.tick++; rec.u = FC.tick; return rec; }
    PF_LK = lk; PF_DIR = dir; PF_O = FO; PF_SEAT = seatCol;
    rec = fcGet(key, bb);
    PF_SEAT = null;
    return rec;
  }
  function drawDevStaff(p, i, S, H) {
    var c = H.ctx, q = H.staffSeat(p, i), t = S.t;
    fcCheck(fcScale(c));
    var busy = swBusy(S), lk = staffLook('dev', i), ph = i * 1.7;
    var s = H.P(q.x - 2.5, q.y, 0);
    var mode = busy ? 'busy' : ['sleep', 'sip', 'stretch'][(i + Math.floor(t / 9)) % 3];
    FO.moving = false; FO.walk = 0; FO.ph = 0; FO.seat = 5; FO.sleep = mode === 'sleep';
    FO.pose = mode === 'busy' ? 'type' : mode === 'sip' ? 'sip' : mode === 'stretch' ? 'stretch' : 'stand';
    lk.item = mode === 'sip' ? 'coffee' : null;
    var f = 0;
    if (busy) {
      f = Math.floor(wrap(t * 16 + ph, Math.PI) / Math.PI * 3);
      FO.t = f * 0.0655;
    } else FO.t = 0.4;
    if (busy) blitC(c, glowSprite('#3ff0ff'), s.x + 4, s.y - 17, 1.1, 0.35 + 0.15 * Math.sin(t * 7 + ph));
    fcBlit(c, staffRec(lk.id + '|seat|' + mode + f, lk, 1, CHAIR[i % CHAIR.length], BB_SEAT), s.x, s.y, false);
    FO.seat = 0; FO.sleep = false;
    var top = s.y - 28;
    if (busy) {
      var k = (t * 0.9 + i * 0.37) % 1, which = Math.floor(t * 0.9 + i * 0.37) % 3;
      blit(c, codeSprite(which), s.x + 2 + k * 3, top - k * 9, 0.62 + 0.1 * backOut(k * 4), k > 0.7 ? (1 - k) / 0.3 : 1);
    } else if (mode === 'sleep') zzz(c, s.x + 4, top + 2, t, ph);
  }
  function zzz(c, x, y, t, ph) {
    var z = zSprite();
    for (var k = 0; k < 3; k++) {
      var u = (t * 0.55 + k / 3 + ph) % 1;
      blit(c, z, x + u * 5 + Math.sin(u * 6) * 0.8, y - u * 9, 0.5 + u * 0.6, u < 0.15 ? u / 0.15 : u > 0.75 ? (1 - u) / 0.25 : 1);
    }
  }
  function drawLabStaff(p, i, S, H) {
    var c = H.ctx, q = H.staffSeat(p, i), t = S.t;
    fcCheck(fcScale(c));
    var busy = S.rdLevel() < H.G.rdCap(), lk = staffLook('hwlab', i), ph = 3 + i * 2.3;
    var dir = i % 2 === 0 ? 1 : 0, flip = dir === 0;
    var s = H.P(q.x, q.y, 0);
    var pose = busy ? (i % 2 === 0 ? 'solder' : 'inspect') : (i % 2 === 0 ? 'sip' : 'read');
    lk.item = pose === 'sip' ? 'coffee' : pose === 'read' ? 'clip' : null;
    FO.moving = false; FO.walk = 0; FO.ph = 0; FO.seat = 0; FO.sleep = false; FO.pose = pose;
    var f = 0;
    if (pose === 'inspect') { f = Math.sin(t * 4) > 0 ? 0 : 1; FO.t = f ? 3 * Math.PI / 8 : Math.PI / 8; }
    else FO.t = 0;
    fcBlit(c, staffRec(lk.id + '|lab|' + pose + f, lk, 1, null, BB_STAND), s.x, s.y, flip);
    if (pose === 'solder') sparks(c, s.x + (flip ? -8.2 : 8.2), s.y - 9, t, ph);
    if (busy) {
      atom(c, s.x + (dir === 1 ? 5 : -5), s.y - 29, t + i, 1);
    } else if (i % 2 === 1) zzzOrDots(c, s.x - 4, s.y - 25, t, ph);
  }
  function zzzOrDots(c, x, y, t, ph) {
    var e = emoteSprite('dots');
    blit(c, e, x, y + Math.sin(t * 2 + ph) * 0.6, 0.8, 0.9);
  }
  function atom(c, x, y, t, a) {
    c.save(); c.translate(x, y); c.globalAlpha = a;
    blitC(c, glowSprite('#b77bff'), 0, 0, 0.9, 0.5);
    c.lineWidth = 0.7; c.strokeStyle = '#ffffff';
    for (var k = 0; k < 3; k++) {
      c.beginPath(); c.ellipse(0, 0, 4.2, 1.6, t * 1.5 + k * 1.047, 0, 6.2832); c.stroke();
    }
    dot(c, 0, 0, 1.2, '#ff7eb6');
    var th = t * 5;
    dot(c, Math.cos(th) * 4.2 * Math.cos(t * 1.5) - Math.sin(th) * 1.6 * Math.sin(t * 1.5),
        Math.cos(th) * 4.2 * Math.sin(t * 1.5) + Math.sin(th) * 1.6 * Math.cos(t * 1.5), 0.8, '#3ff0ff');
    c.restore();
  }
  on('staff', 'devdesk', drawDevStaff);
  on('staff', 'hwlab', drawLabStaff);
  var CAP = { futako: 10, shibuya: 14, otemachi: 10, hongo: 12, inzai: 5, fab: 10, ariake: 14, shinjuku: 8, minato: 9 };
  var CAP_DEFAULT = 8;
  function lvOf(S, id) { var q = S.p[id]; return q && q.owned ? (q.level || 1) : 0; }
  function ownedOf(S, ids) {
    var n = 0;
    for (var k = 0; k < ids.length; k++) if (S.p[ids[k]] && S.p[ids[k]].owned) n++;
    return n;
  }
  function swGroups(S, budget) {
    if (!S.p.office || !S.p.office.owned) {
      return [['agent', 1], ['free', Math.min(Math.max(0, budget - 2), 3 + (S.co && S.co.founded ? 1 : 0))], ['robot', budget > 4 ? 1 : 0]];
    }
    var extra = Math.min(4, Math.max(0, lvOf(S, 'staff') - 3));
    var sales = Math.ceil(lvOf(S, 'desk') / 2), acct = Math.ceil(lvOf(S, 'acct') / 2);
    var robot = lvOf(S, 'qcloud') || lvOf(S, 'supply') ? 1 : 0;
    var fixed = extra + sales + acct + robot;
    var vis = clamp(2 + Math.min(3, S.jobs.length), 0, Math.max(0, budget - fixed));
    return [['emp', extra], ['sales', sales], ['acct', acct], ['guest', vis], ['robot', robot]];
  }
  var CROWD = [
    ['office', function (S, r, b) { return swGroups(S, b); }],
    ['conveni', function (S, r, b) { return [['mascot', 1], ['shop', clamp(3 + Math.floor((S.pop || 0) / 40), 3, Math.max(3, b - 1))]]; }],
    ['c_auto', function (S, r, b) { return [['biz', clamp(5 + Math.floor((S.pop || 0) / 40), 5, b)]]; }],
    ['asm', function (S, r, b) { return [['worker', clamp(3 + ownedOf(S, ['design', 'layout', 'tapeout', 'asm', 'ship']), 3, b - 2)]]; }],
    ['svc', function (S, r, b) { return [['mech', clamp(2 + ownedOf(S, ['svc', 'up_speed', 'up_carry', 'up_bot']), 2, b)]]; }],
    ['litho', function (S, r, b) { return [['bunny', clamp(4 + Math.floor(ownedOf(S, ['litho', 'depoetch', 'implant', 'cmp', 'dice', 'bond', 'pkg', 'qa']) * 0.75), 4, b)]]; }],
    ['fridge', function (S, r, b) { return [['sci', clamp(3 + ownedOf(S, ['fridge', 'cstage', 'ctrl', 'helium']), 3, b)]]; }],
    ['seminar', function (S, r, b) {
      var sph = S.p.sphere && S.p.sphere.owned ? 2 : 0;
      var show = (S.p.lounge && S.p.lounge.owned ? 1 : 0) + (sph ? 1 : 0);
      return [['party', clamp(7 + Math.floor((S.pop || 0) / 30) + sph, 6, b - show)], ['show', show]];
    }],
    ['home', function (S, r, b) { return [['shop', Math.min(b, 4)]]; }],
    ['kin', function (S, r, b) { return [['shop', Math.min(b, 4)]]; }]
  ];
  function groupsFor(r, S) {
    var W = QT.World, cap = CAP[r.id] != null ? CAP[r.id] : CAP_DEFAULT, out = [], left = cap, any = false;
    for (var i = 0; i < CROWD.length && left > 0; i++) {
      var p = W.BY_ID[CROWD[i][0]];
      if (!p || p.room !== r.id) continue;
      any = true;
      var g = CROWD[i][1](S, r, left);
      for (var j = 0; j < g.length; j++) {
        var n = Math.max(0, Math.min(left, g[j][1] | 0));
        if (n > 0) { out.push([g[j][0], n]); left -= n; }
      }
    }
    if (r.id === 'shinjuku' && QT.Art.rv && QT.Art.rv.active(S)) return [['rival', 3], ['biz', 2]];
    if (!any) out = [['shop', Math.ceil(cap * 0.5)], ['biz', Math.floor(cap * 0.5)]];
    if (QT.lite && QT.lite()) out = out.map(function (g) { return [g[0], g[1] > 1 ? Math.ceil(g[1] / 2) : g[1]]; });
    return out;
  }
  var EMOTES = {
    emp: ['note', 'coffee', 'bulb', 'excl', 'yen', 'bulb'],
    free: ['coffee', 'bulb', 'note', 'heart'],
    agent: ['excl', 'yen', 'heart'],
    robot: ['note', 'excl', 'heart'],
    sales: ['yen', 'excl', 'yen', 'note'],
    acct: ['yen', 'coffee', 'dots'],
    guest: ['excl', 'dots', 'yen', 'heart'],
    shop: ['heart', 'note', 'yen', 'heart', 'star'],
    mascot: ['heart', 'star', 'note'],
    biz: ['yen', 'excl', 'dots', 'yen'],
    worker: ['excl', 'note', 'star', 'bulb'],
    bunny: ['excl', 'star', 'bulb', 'dots'],
    mech: ['excl', 'note', 'star'],
    sci: ['bulb', 'excl', 'q', 'star'],
    party: ['note', 'heart', 'star', 'note'],
    show: ['heart', 'star', 'note'],
    rival: ['yen', 'excl', 'dots', 'yen'],
    rep: ['excl', 'yen']
  };
  var HOT = ['conveni', 'bankp', 'vc_tower', 'home', 'kin',
             'gate', 'c_auto', 'c_it', 'c_news', 'c_pharma', 'c_gov', 'c_fin', 'c_mat',
             'tmg', 'rankvision', 'rl_auto', 'rl_mat', 'rl_pharma', 'rl_it', 'dc', 'dc_ops',
             'pc', 'desk', 'qcloud', 'gacha', 'hwlab', 'swjob', 'staff', 'supply',
             'sphere', 'lounge', 'arcade', 'seminar', 'tube',
             'asm', 'ship', 'design', 'layout', 'tapeout',
             'litho', 'qa', 'pkg', 'bond', 'implant',
             'svc', 'up_speed', 'up_carry', 'up_bot',
             'fridge', 'helium', 'cstage', 'ctrl'];
  var ROOMS = {};
  QT.Art.people = { rooms: ROOMS, figure: figure, makeLook: makeLook, chair: chair, emote: emoteSprite, blit: blit, cache: FC };
  function roomState(r) {
    var st = ROOMS[r.id];
    if (st) return st;
    var n = r.iw * r.ih;
    st = ROOMS[r.id] = {
      r: r, list: [], t: -1, maskT: -99, sig: '', inited: false,
      mask: new Uint8Array(n), stop: new Uint8Array(n), seen: new Uint8Array(n),
      vis: new Int32Array(n), par: new Int16Array(n), dep: new Int16Array(n), q: new Int16Array(n),
      gen: 0, cands: [], stopList: [], hot: [], zone: {}, entries: [], near: [],
      front: frontOf(r), frontId: {}
    };
    st.front.forEach(function (d) { st.frontId[d.id] = 1; });
    return st;
  }
  if (!QT.Art.block) {
    QT.Art.blocks = QT.Art.blocks || {};
    QT.Art.blockVer = QT.Art.blockVer || 0;
    QT.Art.block = function (id, rects, tag) {
      var b = QT.Art.blocks[id] || (QT.Art.blocks[id] = {});
      b[tag || '_'] = (rects || []).map(function (q) { return { x: q.x, y: q.y, w: q.w, h: q.h, top: q.top }; });
      QT.Art.blockVer++;
    };
  }
  var BLK_CACHE = {};
  function blockersFor(rid) {
    var e = BLK_CACHE[rid];
    if (e && e.ver === QT.Art.blockVer) return e.list;
    var list = [], b = QT.Art.blocks[rid];
    if (b) Object.keys(b).forEach(function (k) { list = list.concat(b[k]); });
    BLK_CACHE[rid] = { ver: QT.Art.blockVer, list: list };
    return list;
  }
  QT.Art.people.blockers = blockersFor;
  var VA = 0.62, VB = 0.33;
  var VM = { hb: 16, f: 0.1, a: 60, b: 6, ho: 20, hu: 32 };
  QT.Art.people.vm = VM;
  function frontOf(r) {
    var out = [];
    QT.World.DISTRICTS.forEach(function (d) {
      var dc = d.col - r.col, dr = d.row - r.row;
      if ((dc === 1 && dr === 0) || (dc === 0 && dr === 1) || (dc === 1 && dr === 1)) out.push(d);
    });
    return out;
  }
  function plotOcc(list, p, S) {
    var x0 = p.x * TILE, x1 = (p.x + p.w) * TILE, y0 = p.y * TILE, y1 = (p.y + p.h) * TILE;
    var DK = QT.Art.tokyo && QT.Art.tokyo.deco;
    if (DK && DK.isDeco(p)) {
      var dt = DK.top(p);
      list.push([x0, x1, y0, y1, dt == null ? VM.hu : dt + 3]);
      return;
    }
    if (p.open) { list.push([x0, x1, y0, y1, VM.ho]); return; }
    var sp = S.p[p.id];
    if (!sp || !sp.owned) { if (VM.hu > 0) list.push([x0, x1, y0, y1, VM.hu]); return; }
    var lv = sp.level || 1, ix = (x1 - x0) * VM.f, iy = (y1 - y0) * VM.f;
    list.push([x0, x1, y0, y1, VM.hb]);
    list.push([x0 + ix, x1 - ix, y0 + iy, y1 - iy, VM.a + VM.b * lv]);
  }
  function occluders(st, S) {
    var r = st.r, W = QT.World, G = QT.G, list = [], k;
    for (k = 0; k < W.PLOTS.length; k++) if (W.PLOTS[k].room === r.id) plotOcc(list, W.PLOTS[k], S);
    st.front.forEach(function (d) {
      if (G.roomOpen(d.id)) {
        for (var j = 0; j < W.PLOTS.length; j++) if (W.PLOTS[j].room === d.id) plotOcc(list, W.PLOTS[j], S);
        return;
      }
      W.FENCE(d).forEach(function (f) { list.push([f.x * TILE, (f.x + f.w) * TILE, f.y * TILE, (f.y + f.h) * TILE, 17]); });
      (d.signs || []).forEach(function (sg) { list.push([(sg.x - 1) * TILE, (sg.x + 2) * TILE, (sg.y - 1) * TILE, (sg.y + 2) * TILE, 46]); });
    });
    blockersFor(r.id).forEach(function (o) {
      list.push([o.x, o.x + o.w, o.y, o.y + o.h, o.top != null ? o.top : (o.w <= 14 && o.h <= 14 ? 34 : 14)]);
    });
    return list;
  }
  function screenOccluders(st) { return []; }
  var SAMP_D = [-2.5 / (2 * VA), 2.5 / (2 * VA)], SAMP_H = [3, 10, 17];
  function tileVis(px, py, occ, scr) {
    var ok = 0;
    for (var a = 0; a < 2; a++) {
      var x = px + SAMP_D[a], y = py - SAMP_D[a], X = (x - y) * VA;
      for (var b = 0; b < 3; b++) {
        var hp = SAMP_H[b], hid = false, Y = (x + y) * VB - hp;
        for (var j = 0; j < scr.length; j++) {
          var q = scr[j];
          if (X > q[0] && X < q[1] && Y > q[2] && Y < q[3]) { hid = true; break; }
        }
        for (var k = 0; k < occ.length && !hid; k++) {
          var o = occ[k];
          var slo = Math.max(o[0] - x, o[2] - y), shi = Math.min(o[1] - x, o[3] - y);
          if (slo >= shi || shi <= 0) continue;
          if (hp + 2 * VB * Math.max(slo, 0) < o[4]) { hid = true; break; }
        }
        if (!hid) ok++;
      }
    }
    return ok;
  }
  function roomSig(st, S) {
    var r = st.r, W = QT.World, G = QT.G, s = '';
    for (var k = 0; k < W.PLOTS.length; k++) {
      var p = W.PLOTS[k];
      if (p.room !== r.id && !st.frontId[p.room]) continue;
      var q = S.p[p.id];
      s += q && q.owned ? (q.level || 1) : 0;
    }
    st.front.forEach(function (d) { s += G.roomOpen(d.id) ? 'o' : 'c'; });
    return s + '|' + QT.Art.blockVer;
  }
  function rebuildMask(st, S) {
    var r = st.r, w = r.iw, h = r.ih, G = QT.G, W = QT.World, k, x, y;
    var mask = st.mask, stop = st.stop, seen = st.seen;
    for (var ty = 0; ty < h; ty++) for (var tx = 0; tx < w; tx++) {
      var gx = r.ix + tx, gy = r.iy + ty;
      mask[ty * w + tx] = G.walkable((gx + 0.5) * TILE, (gy + 0.5) * TILE) ? 1 : 0;
    }
    W.PLOTS.forEach(function (p) {
      if (p.room !== r.id) return;
      for (var y2 = p.y - r.iy; y2 < p.y - r.iy + p.h; y2++) for (var x2 = p.x - r.ix; x2 < p.x - r.ix + p.w; x2++)
        if (x2 >= 0 && y2 >= 0 && x2 < w && y2 < h) mask[y2 * w + x2] = 0;
    });
    blockersFor(r.id).forEach(function (o) {
      var x0 = Math.floor((o.x + 2) / TILE) - r.ix, x1 = Math.floor((o.x + o.w - 2) / TILE) - r.ix;
      var y0 = Math.floor((o.y + 2) / TILE) - r.iy, y1 = Math.floor((o.y + o.h - 2) / TILE) - r.iy;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < w && y < h) mask[y * w + x] = 0;
    });
    if (W.BY_ID.ship && W.BY_ID.ship.room === r.id) {
      var D = W.DOCK, ly0 = Math.floor(D.laneY / TILE - 1.6) - r.iy, ly1 = Math.floor(D.laneY / TILE + 1.6) - r.iy;
      var lx0 = Math.floor(D.outX / TILE) - 1 - r.ix, lx1 = Math.ceil(D.inX / TILE) + 1 - r.ix;
      for (y = Math.max(0, ly0); y <= Math.min(h - 1, ly1); y++)
        for (x = Math.max(0, lx0); x <= Math.min(w - 1, lx1); x++) mask[y * w + x] = 0;
      var bx0 = Math.floor((D.bay.x - 4) / TILE) - r.ix, bx1 = Math.floor((D.bay.x + D.bay.w + 4) / TILE) - r.ix;
      var by0 = Math.floor(D.bay.y / TILE) - r.iy, by1 = Math.floor((D.bay.y + D.bay.h) / TILE) - r.iy;
      for (y = Math.max(0, by0); y <= Math.min(h - 1, by1); y++) for (x = Math.max(0, bx0); x <= Math.min(w - 1, bx1); x++) mask[y * w + x] = 0;
    }
    var occ = occluders(st, S), scr = screenOccluders(st);
    for (k = 0; k < w * h; k++) {
      if (!mask[k]) { seen[k] = 0; continue; }
      var kx = k % w, ky = (k - kx) / w;
      seen[k] = tileVis((r.ix + kx + 0.5) * TILE, (r.iy + ky + 0.5) * TILE, occ, scr);
    }
    for (k = 0; k < w * h; k++) {
      var ex = k % w, ey = (k - ex) / w;
      stop[k] = mask[k] && ex > 0 && ey > 0 && ex < w - 1 && ey < h - 1 ? 1 : 0;
    }
    G.PADS().forEach(function (pad) {
      var px = Math.round(pad.x) - r.ix, py = Math.round(pad.y) - r.iy, rr = 1;
      if (px < -3 || py < -3 || px > w + 2 || py > h + 2) return;
      for (var dy = -rr; dy <= 3; dy++) for (var dx = -rr; dx <= 3; dx++) {
        var near = Math.abs(dx) <= rr && Math.abs(dy) <= rr;
        var below2 = dx >= 0 && dy >= 0 && Math.abs(dx - dy) <= 1 && dx + dy <= 5;
        if (!near && !below2) continue;
        var x2 = px + dx, y2 = py + dy;
        if (x2 >= 0 && y2 >= 0 && x2 < w && y2 < h) stop[y2 * w + x2] = 0;
      }
    });
    var CT = W.CAT;
    if (CT && CT.district === r.id) (CT.path || []).concat(CT.sit ? [CT.sit] : []).forEach(function (q) {
      var qx = Math.round(q.x) - r.ix, qy = Math.round(q.y) - r.iy;
      for (var dy1 = -1; dy1 <= 1; dy1++) for (var dx1 = -1; dx1 <= 1; dx1++) {
        var x3 = qx + dx1, y3 = qy + dy1;
        if (x3 >= 0 && y3 >= 0 && x3 < w && y3 < h) stop[y3 * w + x3] = 0;
      }
    });
    W.PLOTS.forEach(function (p) {
      if (p.room !== r.id || p.open) return;
      var c1x = p.x + p.w - r.ix, c1y = p.y - 1 - r.iy, c2x = p.x - 1 - r.ix, c2y = p.y + p.h - r.iy;
      if (c1x >= 0 && c1y >= 0 && c1x < w && c1y < h) stop[c1y * w + c1x] = 0;
      if (c2x >= 0 && c2y >= 0 && c2x < w && c2y < h) stop[c2y * w + c2x] = 0;
    });
    var good = 0, fair = 0;
    for (k = 0; k < w * h; k++) if (stop[k]) { if (seen[k] >= 6) good++; if (seen[k] >= 4) fair++; }
    var need = good >= 14 ? 6 : fair >= 10 ? 4 : 2;
    st.stopList.length = 0;
    for (k = 0; k < w * h; k++) {
      if (stop[k] && seen[k] < need) stop[k] = 0;
      if (stop[k]) st.stopList.push(k);
    }
    st.entries.length = 0; st.near.length = 0;
    var sides = [];
    if (r.row > 0) sides.push(function (i) { return i; });
    if (r.row < 2) sides.push(function (i) { return (h - 1) * w + i; });
    if (r.col > 0) sides.push(function (i) { return i * w; });
    if (r.col < 2) sides.push(function (i) { return i * w + w - 1; });
    sides.forEach(function (f) { for (var i = 1; i < w - 1; i++) { var c = f(i); if (mask[c]) st.entries.push(c); } });
    var dc = r.center;
    if (dc) {
      var cx0 = dc.x - r.ix, cy0 = dc.y - r.iy;
      for (var dy0 = -2; dy0 <= 2; dy0++) for (var dx0 = -2; dx0 <= 2; dx0++) {
        var ccx = cx0 + dx0, ccy = cy0 + dy0;
        if (ccx > 0 && ccy > 0 && ccx < w - 1 && ccy < h - 1 && mask[ccy * w + ccx]) st.near.push(ccy * w + ccx);
      }
    }
    st.hot.length = 0;
    HOT.forEach(function (id) {
      var p = W.BY_ID[id];
      if (!p || p.room !== r.id) return;
      if (!p.open && !(S.p[id] && S.p[id].owned)) return;
      st.hot.push({ x: p.padX - r.ix, y: p.padY - r.iy });
    });
    st.zone = {};
    var cv = W.BY_ID.conveni;
    if (cv && cv.room === r.id) {
      var mx0 = cv.x - 1 - r.ix, mx1 = cv.x + cv.w + 1 - r.ix;
      var my0 = cv.padY - r.iy, my1 = cv.padY + 1 - r.iy;
      st.zone.mascot = function (tx, ty) { return tx >= mx0 && tx <= mx1 && ty >= my0 && ty <= my1; };
    }
    var of = W.BY_ID.office;
    if (of && of.room === r.id) {
      var ox = of.padX - r.ix, oy = of.padY - r.iy;
      st.zone.agent = function (tx, ty) { return tx >= ox + 1 && tx <= ox + 4 && ty >= oy - 5 && ty <= oy - 1; };
    }
  }
  QT.Art.people.rebuild = function (rid) {
    var st = ROOMS[rid];
    if (st && curS) { rebuildMask(st, curS); st.sig = roomSig(st, curS); }
    return st;
  };
  function tileCenter(st, k, n) {
    var w = st.r.iw, tx = k % w, ty = (k - tx) / w;
    return { x: (st.r.ix + tx + 0.5) * TILE + n.ox, y: (st.r.iy + ty + 0.5) * TILE + n.oy };
  }
  function zoneOK(st, n, k) {
    var z = st.zone[n.role];
    if (!z) return true;
    var w = st.r.iw, tx = k % w;
    return z(tx, (k - tx) / w);
  }
  function spawn(st, role, S, atDoor) {
    var r = st.r, w = r.iw, k = -1;
    if (atDoor && (st.entries.length || st.near.length)) {
      var src = st.near.length && (rnd() < 0.5 || !st.entries.length) ? st.near : st.entries;
      k = src[Math.floor(rnd() * src.length) % src.length];
    }
    var sd = Math.floor(rnd() * 100000);
    var n = {
      role: role, lk: makeLook(role, sd), ph: rnd() * 6.28,
      ox: (rnd() - 0.5) * 6, oy: (rnd() - 0.5) * 6, dir: Math.floor(rnd() * 4),
      spd: 20 + rnd() * 10, walk: rnd() * 6, path: null, pi: 0, moving: false,
      wait: rnd() * 2.5, pose: 'stand', poseT: 0, emote: null, emoteT: 0, greetT: 0, chatT: 0,
      range: 6 + Math.floor(rnd() * 8), far: false
    };
    if (role === 'mascot' || role === 'agent') { n.spd = 16; n.ox = 0; n.oy = 0; }
    if (role === 'agent') { n.pose = 'sign'; n.wait = 2 + rnd() * 3; }
    if (role === 'robot') { n.spd = 30; n.range = 14; }
    if (role === 'party' || role === 'show') { n.spd = 24 + rnd() * 8; n.pose = 'dance'; n.wait = 1 + rnd() * 4; }
    if (n.lk.scale < 1) n.spd += 6;
    if (k < 0) {
      k = pickGoal(st, n, st.stopList, rnd() < 0.5);
      if (k < 0) return null;
    }
    var p0 = tileCenter(st, k, n);
    n.x = p0.x; n.y = p0.y;
    n.entry = { x: 0, y: 0, w: 6, h: 6, n: n, draw: drawEntry };
    return n;
  }
  var PICK = [];
  function pickGoal(st, n, cands, hot, gen) {
    var w = st.r.iw, i, k, best = -1;
    var list = PICK;
    list.length = 0;
    for (i = 0; i < cands.length; i++) if (zoneOK(st, n, cands[i])) list.push(cands[i]);
    if (!list.length) {
      if (!st.zone[n.role]) return -1;
      for (k = 0; k < st.mask.length; k++)
        if (st.mask[k] && zoneOK(st, n, k) && (!gen || st.vis[k] === gen)) list.push(k);
      if (!list.length) return -1;
    }
    if (hot && st.hot.length && !st.zone[n.role]) {
      var hp = hotNow(st), bd = 1e9;
      for (i = 0; i < list.length; i++) {
        var cx = list[i] % w, cy = (list[i] - cx) / w;
        var dd = Math.abs(cx - hp.x) + Math.abs(cy - hp.y) + rnd() * 1.6;
        if (dd < bd && !taken(st, list[i], n)) { bd = dd; best = list[i]; }
      }
      if (best >= 0 && bd < 7) return best;
    }
    best = list[Math.floor(rnd() * list.length)];
    for (var tries = 0; tries < 6 && taken(st, best, n); tries++) best = list[Math.floor(rnd() * list.length)];
    return best;
  }
  var HOTV = [];
  function hotNow(st) {
    var hot = st.hot, n = hot.length, k = Math.min(n, st.r.iw * st.r.ih > 400 ? 3 : 2);
    var shift = Math.floor((curS ? curS.t : 0) / 20), H = curH, r = st.r;
    if (!(shift >= 0)) shift = 0;
    HOTV.length = 0;
    if (H) for (var i = 0; i < n; i++) {
      var s = H.toScreen((r.ix + hot[i].x + 0.5) * TILE, (r.iy + hot[i].y + 0.5) * TILE, 0);
      if (s.x > H.cssW * 0.08 && s.x < H.cssW * 0.92 && s.y > H.cssH * 0.34 && s.y < H.cssH * 0.88) HOTV.push(hot[i]);
    }
    if (HOTV.length) return HOTV[(Math.floor(rnd() * Math.min(k, HOTV.length)) + shift) % HOTV.length];
    return hot[(Math.floor(rnd() * k) + shift) % n];
  }
  var NB = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  function plan(st, n) {
    var r = st.r, w = r.iw, h = r.ih;
    var tx = Math.floor(n.x / TILE) - r.ix, ty = Math.floor(n.y / TILE) - r.iy;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h || !st.mask[ty * w + tx]) { relocate(st, n); return; }
    var vis = st.vis, par = st.par, dep = st.dep, q = st.q, gen = ++st.gen, cands = st.cands;
    var s0 = ty * w + tx, head = 0, tail = 0, maxD = n.far ? 40 : n.range;
    vis[s0] = gen; dep[s0] = 0; par[s0] = -1; q[tail++] = s0; cands.length = 0;
    var o = Math.floor(rnd() * 4);
    while (head < tail) {
      var k = q[head++], d = dep[k];
      if (d >= 2 && st.stop[k]) cands.push(k);
      if (d >= maxD) continue;
      var kx = k % w, ky = (k - kx) / w;
      for (var m = 0; m < 4; m++) {
        var nb = NB[(m + o) & 3], x2 = kx + nb[0], y2 = ky + nb[1];
        if (x2 < 0 || y2 < 0 || x2 >= w || y2 >= h) continue;
        var k2 = y2 * w + x2;
        if (vis[k2] === gen || !st.mask[k2]) continue;
        vis[k2] = gen; dep[k2] = d + 1; par[k2] = k; q[tail++] = k2;
      }
    }
    var goal = pickGoal(st, n, cands, rnd() < 0.6, gen);
    if (goal < 0 || vis[goal] !== gen) {
      n.far = true; n.wait = 0.6 + rnd(); return;
    }
    n.far = false;
    var path = [];
    for (var g = goal; g !== -1; g = par[g]) path.push(g);
    path.reverse();
    n.path = path; n.pi = 0;
  }
  function taken(st, k, self) {
    var r = st.r, w = r.iw;
    for (var j = 0; j < st.list.length; j++) {
      var m = st.list[j];
      if (m === self) continue;
      var mk = m.path ? m.path[m.path.length - 1]
             : (Math.floor(m.y / TILE) - r.iy) * w + (Math.floor(m.x / TILE) - r.ix);
      if (mk === k) return true;
    }
    return false;
  }
  function relocate(st, n) {
    if (!st.stopList.length) return;
    var k = pickGoal(st, n, st.stopList, false);
    if (k < 0) k = st.stopList[Math.floor(rnd() * st.stopList.length)];
    var p0 = tileCenter(st, k, n);
    n.x = p0.x; n.y = p0.y; n.path = null; n.wait = 0.5;
  }
  function idlePose(n) { return n.role === 'party' || n.role === 'show' ? 'dance' : n.role === 'agent' ? 'sign' : 'stand'; }
  function step(st, n, dt, S) {
    if (n.emote) { n.emoteT += dt; if (n.emoteT > 1.8) n.emote = null; }
    if (n.greetT > 0) n.greetT -= dt;
    if (n.chatT > 0) n.chatT -= dt;
    var pl = S.player, pdx = pl.x - n.x, pdy = pl.y - n.y, near = pdx * pdx + pdy * pdy < 30 * 30;
    if (!n.path) {
      n.moving = false;
      n.wait -= dt;
      if (near && n.role !== 'party' && n.role !== 'show' && n.role !== 'robot') {
        n.dir = Math.abs(pdx) > Math.abs(pdy) ? (pdx > 0 ? 1 : 3) : (pdy > 0 ? 0 : 2);
        if (n.dir === 2 || n.dir === 3) n.dir = pdx > -pdy ? 1 : 0;
        if (n.greetT <= 0) {
          n.greetT = 9;
          if (n.role !== 'agent') { n.pose = 'wave'; n.poseT = 1.4; }
          if (!n.emote && countEmotes(st) < 3) { n.emote = n.role === 'emp' ? 'excl' : n.role === 'agent' ? 'excl' : 'heart'; n.emoteT = 0; }
        }
      }
      if (n.poseT > 0) { n.poseT -= dt; if (n.poseT <= 0) n.pose = idlePose(n); }
      if (n.wait <= 0) { n.pose = idlePose(n); n.poseT = 0; plan(st, n); }
      return;
    }
    var k = n.path[n.pi];
    if (!st.mask[k]) { n.path = null; n.wait = 0.2; return; }
    var g = tileCenter(st, k, n), dx = g.x - n.x, dy = g.y - n.y, d = Math.sqrt(dx * dx + dy * dy), sp = n.spd * dt;
    if (d > 0.01) n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2);
    if (d <= sp) {
      n.x = g.x; n.y = g.y; n.pi++;
      if (n.pi >= n.path.length) arrive(st, n);
    } else { n.x += dx / d * sp; n.y += dy / d * sp; }
    n.moving = !!n.path;
    n.walk += dt * n.spd * 0.3;
  }
  function countEmotes(st) {
    var c = 0;
    for (var k = 0; k < st.list.length; k++) if (st.list[k].emote) c++;
    return c;
  }
  function arrive(st, n) {
    n.path = null; n.moving = false;
    var party = n.role === 'party' || n.role === 'show';
    n.wait = party ? 3 + rnd() * 5 : n.role === 'agent' ? 3 + rnd() * 4 : 1.2 + rnd() * 3.5;
    n.pose = idlePose(n); n.poseT = 0;
    if (rnd() < 0.7) n.dir = rnd() < 0.5 ? 0 : 1;
    if (n.role === 'agent') n.dir = 1;
    var solo = party || n.role === 'mascot' || n.role === 'agent' || n.role === 'robot';
    if (!solo && rnd() < 0.18) { n.pose = 'wave'; n.poseT = 1.2; }
    if (!solo && !(n.chatT > 0)) {
      for (var j = 0; j < st.list.length; j++) {
        var m = st.list[j];
        if (m === n || m.path || m.chatT > 0 || m.role === 'party' || m.role === 'show' || m.role === 'mascot' || m.role === 'agent' || m.role === 'robot') continue;
        var dx = m.x - n.x, dy = m.y - n.y;
        if (dx * dx + dy * dy > 34 * 34) continue;
        n.dir = faceDir(dx, dy); m.dir = faceDir(-dx, -dy);
        n.wait = m.wait = Math.max(m.wait, 3.5 + rnd() * 2.5);
        n.chatT = m.chatT = n.wait + 10;
        n.pose = m.pose = 'stand';
        if (!m.emote && countEmotes(st) < 3) { m.emote = rnd() < 0.5 ? 'dots' : pick(EMOTES[m.role] || EMOTES.shop); m.emoteT = -0.9; }
        break;
      }
    }
    if (!n.emote && rnd() < (party ? 0.22 : 0.18) && countEmotes(st) < 3) {
      n.emote = pick(EMOTES[n.role] || EMOTES.shop); n.emoteT = 0;
    }
  }
  function faceDir(dx, dy) { return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2); }
  function syncCount(st, S) {
    var groups = groupsFor(st.r, S), list = st.list, gi, j;
    for (j = list.length - 1; j >= 0; j--) {
      var ok = false;
      for (gi = 0; gi < groups.length; gi++) if (groups[gi][0] === list[j].role && groups[gi][1] > 0) ok = true;
      if (!ok) list.splice(j, 1);
    }
    var total = 0;
    for (var g0 = 0; g0 < groups.length; g0++) total += groups[g0][1];
    var door = st.inited && total - list.length <= 2;
    for (gi = 0; gi < groups.length; gi++) {
      var role = groups[gi][0], want = groups[gi][1], have = 0, k;
      for (k = 0; k < list.length; k++) if (list[k].role === role) have++;
      while (have < want) {
        var n = spawn(st, role, S, door && role !== 'agent');
        if (!n) break;
        list.push(n); have++;
      }
      for (k = list.length - 1; k >= 0 && have > want; k--)
        if (list[k].role === role) { list.splice(k, 1); have--; }
    }
    st.inited = true;
  }
  function roomOnScreen(r, H) {
    var TL = H.toScreen(r.ix * TILE, r.iy * TILE, 0), TR = H.toScreen((r.ix + r.iw) * TILE, r.iy * TILE, 0);
    var BL = H.toScreen(r.ix * TILE, (r.iy + r.ih) * TILE, 0), BR = H.toScreen((r.ix + r.iw) * TILE, (r.iy + r.ih) * TILE, 0);
    var minY = TL.y - 50 * H.z, maxY = BR.y + 10 * H.z;
    return !(BL.x > H.cssW + 20 || TR.x < -20 || minY > H.cssH + 20 || maxY < -20);
  }
  var curS = null, curH = null;
  function drawEntry(e) {
    var n = e.n, H = curH, c = H.ctx, S = curS;
    var s = H.P(n.x, n.y, 0), dir = n.dir;
    if (!n.moving && n.pose === 'dance') dir = Math.floor(S.t * 1.7 + n.ph) % 2 ? 0 : 1;
    drawPerson(c, n, S, s.x, s.y, dir);
    if (n.role === 'agent') agentSign(c, n, S, s, dir);
    if (n.emote && n.emoteT >= 0) {
      var k = n.emoteT, sc = backOut(k / 0.22) * 0.95, a = k > 1.5 ? (1.8 - k) / 0.3 : 1;
      var tall = n.role === 'mascot' ? 40 : n.role === 'robot' ? 25 : 23 * (n.lk.scale || 1) + (n.lk.hat ? 1.5 : 0);
      if (n.lk.item === 'balloon') tall += 2;
      var ex = n.role === 'agent' ? s.x + (dir === 0 || dir === 3 ? 6 : -6) : s.x + 3.5;
      blit(c, emoteSprite(n.emote), ex, s.y - tall - Math.sin(k * 4) * 0.6, sc, a);
    }
  }
  function agentSign(c, n, S, s, dir) {
    var sg = signSprite(), side = dir === 0 || dir === 3 ? -1 : 1;
    var bob = n.moving ? Math.abs(Math.sin(n.walk)) * 1.2 : Math.sin(S.t * 2.2 + n.ph) * 0.7;
    var hx = s.x + side * 4.6, hy = s.y - 12 - bob;
    c.lineCap = 'round';
    line(c, hx, hy, hx + side * 1.5, hy - 17, 1.6, INK);
    line(c, hx, hy, hx + side * 1.5, hy - 17, 0.8, '#c9a06a');
    blit(c, sg, hx + side * 1.5, hy - 15.5, 0.82);
  }
  on('scene', '*', function (r, S, H, push) {
    if (!H.G.roomOpen(r.id)) return;
    if (H.riding) { if (ROOMS[r.id]) ROOMS[r.id].t = S.t; return; }
    var st = roomState(r);
    curS = S; curH = H;
    if (!roomOnScreen(r, H)) { st.t = S.t; return; }
    fcCheck(fcScale(H.ctx));
    if (S.t - st.maskT > 1 || S.t < st.maskT || QT.Art.blockVer !== st.blkVer) {
      st.blkVer = QT.Art.blockVer;
      st.maskT = S.t;
      var sig = roomSig(st, S);
      if (sig !== st.sig) {
        st.sig = sig; rebuildMask(st, S);
        for (var j = 0; j < st.list.length; j++) {
          var m = st.list[j], mx = Math.floor(m.x / TILE) - r.ix, my = Math.floor(m.y / TILE) - r.iy;
          if (mx < 0 || my < 0 || mx >= r.iw || my >= r.ih || !st.mask[my * r.iw + mx]) relocate(st, m);
          else if (m.path) {
            for (var q = m.pi; q < m.path.length; q++) if (!st.mask[m.path[q]]) { m.path = null; m.wait = 0.3; break; }
          }
        }
      }
      syncCount(st, S);
    }
    var dt = st.t < 0 ? 0 : clamp(S.t - st.t, 0, 0.1);
    st.t = S.t;
    var list = st.list;
    for (var k = 0; k < list.length; k++) {
      var n = list[k];
      if (dt > 0) step(st, n, dt, S);
      var sp = H.toScreen(n.x, n.y, 0);
      if (sp.x < -24 || sp.x > H.cssW + 24 || sp.y < -2 || sp.y > H.cssH + 8) continue;
      var e = n.entry;
      e.x = n.x - 3; e.y = n.y - 3; e.w = 6; e.h = 6;
      push(e);
    }
  });
  var AVE = [];
  QT.World.BUCKETS.forEach(function (b) {
    if (b.kind !== 'ave') return;
    var v = b.dir === 'v';
    var lines = v ? [b.x0 * TILE + 11, (b.x1 + 1) * TILE - 11] : [b.y0 * TILE + 11, (b.y1 + 1) * TILE - 11];
    var lo = (v ? b.y0 : b.x0) * TILE + 6, hi = ((v ? b.y1 : b.x1) + 1) * TILE - 6;
    var nb = v ? [[b.c, b.r], [b.c + 1, b.r]] : [[b.c, b.r], [b.c, b.r + 1]];
    var ids = [];
    QT.World.DISTRICTS.forEach(function (d) { nb.forEach(function (q) { if (d.col === q[0] && d.row === q[1]) ids.push(d.id); }); });
    var x0 = b.x0 * TILE, y0 = b.y0 * TILE, x1 = (b.x1 + 1) * TILE, y1 = (b.y1 + 1) * TILE;
    AVE.push({ b: b, v: v, lines: lines, lo: lo, hi: hi, ids: ids, list: [], t: -1, frame: -1,
               box: { x0: (x0 - y1) * 0.62, x1: (x1 - y0) * 0.62, y0: (x0 + y0) * 0.33 - 40, y1: (x1 + y1) * 0.33 + 4 } });
  });
  var AVE_BY = {};
  AVE.forEach(function (a) { a.ids.forEach(function (id) { (AVE_BY[id] || (AVE_BY[id] = [])).push(a); }); });
  var AVE_N = 3;
  var AVE_ROLES = ['shop', 'biz', 'shop', 'guest', 'biz'];
  var frameNo = 0;
  on('ground', function () { frameNo++; });
  function aveSpawn(a) {
    var side = a.list.length % 2, sd = Math.floor(rnd() * 100000), role = AVE_ROLES[Math.floor(rnd() * AVE_ROLES.length)];
    var n = {
      role: role, lk: makeLook(role, sd), ph: rnd() * 6.28, side: side,
      u: a.lo + rnd() * (a.hi - a.lo), dirn: rnd() < 0.5 ? 1 : -1, off: (rnd() - 0.5) * 3,
      spd: 18 + rnd() * 10, walk: rnd() * 6, moving: true, wait: 0, pose: 'stand', dir: 0, x: 0, y: 0
    };
    if (n.lk.scale < 1) n.spd += 5;
    n.entry = { x: 0, y: 0, w: 6, h: 6, n: n, draw: drawAve };
    return n;
  }
  function aveOnScreen(a, H) {
    var hw = H.cssW / 2 / H.z + 16, hh = H.cssH / 2 / H.z + 16, cam = H.cam, bx = a.box;
    return bx.x1 > cam.x - hw && bx.x0 < cam.x + hw && bx.y1 > cam.y - hh && bx.y0 < cam.y + hh;
  }
  function padNear(px, py) {
    var pads = QT.G.PADS();
    for (var i = 0; i < pads.length; i++) {
      var pd = pads[i], dx = (pd.x + 0.5) * TILE - px, dy = (pd.y + 0.5) * TILE - py;
      if (dx * dx + dy * dy < 22 * 22) return true;
    }
    return false;
  }
  function aveStep(a, n, dt) {
    if (n.wait > 0) {
      n.wait -= dt; n.moving = false;
      if (n.wait <= 0) n.dirn = -n.dirn;
      return;
    }
    n.moving = true;
    n.u += n.dirn * n.spd * dt;
    n.walk += dt * n.spd * 0.3;
    if (n.u > a.hi || n.u < a.lo) {
      n.u = n.u > a.hi ? a.hi : a.lo;
      var px = a.v ? a.lines[n.side] : n.u, py = a.v ? n.u : a.lines[n.side];
      if (padNear(px, py)) n.dirn = -n.dirn;
      else { n.wait = 0.8 + rnd() * 2.2; n.moving = false; }
    }
  }
  function drawAve(e) {
    var n = e.n, H = curH, c = H.ctx, S = curS, s = H.P(n.x, n.y, 0);
    drawPerson(c, n, S, s.x, s.y, n.dir);
  }
  function aveScene(r, S, H, push) {
    var list = AVE_BY[r.id];
    if (!list || H.riding) return;
    curS = S; curH = H;
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.frame === frameNo) continue;
      a.frame = frameNo;
      if (!aveOnScreen(a, H)) { a.t = S.t; continue; }
      fcCheck(fcScale(H.ctx));
      while (a.list.length < AVE_N) a.list.push(aveSpawn(a));
      var dt = a.t < 0 ? 0 : clamp(S.t - a.t, 0, 0.1);
      a.t = S.t;
      for (var k = 0; k < a.list.length; k++) {
        var n = a.list[k];
        if (dt > 0) aveStep(a, n, dt);
        var lx = a.lines[n.side] + n.off;
        n.x = a.v ? lx : n.u; n.y = a.v ? n.u : lx;
        n.dir = a.v ? (n.dirn > 0 ? 0 : 2) : (n.dirn > 0 ? 1 : 3);
        if (!n.moving) n.dir = a.v ? 0 : 1;
        var sp = H.toScreen(n.x, n.y, 0);
        if (sp.x < -24 || sp.x > H.cssW + 24 || sp.y < -2 || sp.y > H.cssH + 8) continue;
        var e = n.entry;
        e.x = n.x - 3; e.y = n.y - 3; e.w = 6; e.h = 6;
        push(e);
      }
    }
  }
  QT.World.DISTRICTS.forEach(function (d) { on('scene', d.id, aveScene); });
  var NPC = [];
  var npcFrame = -1;
  function npcRival(o) {
    var d = o.data || {};
    var r = o.rival || o.rv || d.rival || d.rv || d.id || null;
    return r && typeof r === 'object' ? r.id : r;
  }
  function npcHidden(o) {
    var d = o.data || {};
    return !!(o.riding || o.ride || o.onTrain || o.hidden || o.vis === false || d.riding || d.onTrain);
  }
  function npcFor(o) {
    for (var i = 0; i < NPC.length; i++) if (NPC[i].ref === o) return NPC[i].n;
    var rid = npcRival(o), sd = 777 + NPC.length * 131 + (rid ? rid.length * 17 : 0);
    var lk = makeLook('rep', sd);
    if (rid && QT.Art.rv) {
      var rc = QT.Art.rv.color(rid);
      lk.rv = rid; lk.accent = rc; lk.top = I_shade(rc, -8); lk.pin = QT.Art.rv.flagOf(rid); lk.id = lk.id + rid;
    }
    var n = { role: 'rep', lk: lk, ph: sd % 6, walk: 0, moving: false, pose: 'stand', dir: 0, x: o.x, y: o.y, px: o.x, py: o.y, rid: rid };
    n.entry = { x: 0, y: 0, w: 6, h: 6, n: n, draw: drawNpc };
    NPC.push({ ref: o, n: n });
    if (NPC.length > 24) NPC.shift();
    return n;
  }
  function raceOn() {
    var R = QT.Sim && QT.Sim.rivals;
    try { return !!(R && R.raceActive && R.raceActive()); } catch (e) { return false; }
  }
  function drawNpc(e) {
    var n = e.n, H = curH, c = H.ctx, S = curS, s = H.P(n.x, n.y, 0);
    var col = n.lk.accent || '#ff4f5f', k = raceOn() ? 0.5 + 0.5 * Math.sin(S.t * 6) : 0.35;
    c.globalAlpha = 0.35 + 0.45 * k; c.strokeStyle = col; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(s.x, s.y, 7 + 2 * k, 3.4 + k, 0, 0, TAU); c.stroke();
    c.globalAlpha = 1;
    drawPerson(c, n, S, s.x, s.y, n.dir);
    var bob = n.moving ? Math.abs(Math.sin(n.walk)) * 1.1 : 0, hx = s.x + 4.5, hy = s.y - 24 - bob;
    line(c, hx, hy + 6, hx, hy - 6, 0.8, '#3a3550');
    if (n.lk.pin && QT.Art.rv) QT.Art.rv.flag(c, n.lk.pin, hx + 0.4, hy - 6, 6, 4);
    c.beginPath(); c.moveTo(hx + 0.4, hy - 2); c.lineTo(hx + 6.5, hy - 0.5); c.lineTo(hx + 0.4, hy + 1); c.closePath(); c.fillStyle = col; c.fill();
  }
  function npcScene(r, S, H, push) {
    if (frameNo === npcFrame || H.riding) return;
    var list = S.npcs;
    if (!list || !list.length) return;
    npcFrame = frameNo;
    curS = S; curH = H;
    fcCheck(fcScale(H.ctx));
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (!o || o.kind !== 'rep' || !isFinite(o.x) || !isFinite(o.y) || npcHidden(o)) continue;
      var n = npcFor(o);
      var dx = o.x - n.px, dy = o.y - n.py, dd = Math.sqrt(dx * dx + dy * dy);
      if (dd > 0.05 && dd < 24) { n.moving = true; n.walk += dd * 0.3; n.dir = faceDir(dx, dy); }
      else n.moving = false;
      n.px = o.x; n.py = o.y; n.x = o.x; n.y = o.y;
      var sp = H.toScreen(n.x, n.y, 0);
      if (sp.x < -24 || sp.x > H.cssW + 24 || sp.y < -2 || sp.y > H.cssH + 8) continue;
      var e = n.entry;
      e.x = n.x - 3; e.y = n.y - 3; e.w = 6; e.h = 6;
      push(e);
    }
  }
  QT.World.DISTRICTS.forEach(function (d) { on('scene', d.id, npcScene); });
  on('npc', 'rep', function () { return true; });
})(window.QT || (window.QT = {}));
