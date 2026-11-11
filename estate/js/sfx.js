(function (QT) {
  'use strict';
  var ctx = null, muted = false;
  var NOTES = {
    click: [[440, 0.05, 'square', 0.05]],
    pick: [[660, 0.05, 'square', 0.06], [880, 0.06, 'square', 0.05]],
    buy: [[523, 0.07, 'triangle', 0.10], [659, 0.07, 'triangle', 0.10], [784, 0.12, 'triangle', 0.10]],
    cash: [[784, 0.05, 'square', 0.08], [1046, 0.10, 'square', 0.07]],
    good: [[659, 0.06, 'triangle', 0.09], [880, 0.10, 'triangle', 0.09]],
    bad: [[220, 0.10, 'sawtooth', 0.08], [160, 0.16, 'sawtooth', 0.07]],
    fanfare: [[523, 0.10, 'square', 0.10], [659, 0.10, 'square', 0.10],
              [784, 0.10, 'square', 0.10], [1046, 0.30, 'square', 0.11]],
    ipo: [[523, 0.12, 'square', 0.09], [523, 0.12, 'square', 0.09], [523, 0.12, 'square', 0.09],
          [698, 0.34, 'square', 0.10], [880, 0.34, 'square', 0.10], [784, 0.14, 'square', 0.09],
          [880, 0.14, 'square', 0.09], [1046, 0.8, 'square', 0.11]],
    tick: [[1320, 0.025, 'square', 0.03]],
    drum: [[392, 0.06, 'square', 0.05], [440, 0.06, 'square', 0.05], [494, 0.06, 'square', 0.05],
           [523, 0.06, 'square', 0.05], [587, 0.06, 'square', 0.05], [659, 0.06, 'square', 0.05],
           [698, 0.06, 'square', 0.05], [784, 0.08, 'square', 0.06]],
    crack: [[180, 0.05, 'sawtooth', 0.08], [1200, 0.04, 'square', 0.05]],
    winN:  [[659, 0.08, 'triangle', 0.08], [784, 0.12, 'triangle', 0.08]],
    winR:  [[659, 0.07, 'square', 0.08], [880, 0.07, 'square', 0.08], [1046, 0.16, 'square', 0.09]],
    winSR: [[523, 0.07, 'square', 0.09], [659, 0.07, 'square', 0.09], [784, 0.07, 'square', 0.09],
            [1046, 0.07, 'square', 0.09], [1318, 0.3, 'square', 0.1]],
    levelup: [[523, 0.06, 'square', 0.08], [784, 0.06, 'square', 0.08], [1046, 0.14, 'square', 0.09]],
    jara: [[2093, 0.03, 'triangle', 0.05], [2637, 0.03, 'triangle', 0.05], [2349, 0.03, 'triangle', 0.05],
           [3136, 0.03, 'triangle', 0.05], [2794, 0.03, 'triangle', 0.05], [3520, 0.14, 'triangle', 0.06]],
    announce: [[880, 0.28, 'sine', 0.1], [698, 0.28, 'sine', 0.1], [784, 0.28, 'sine', 0.1], [523, 0.6, 'sine', 0.1]],
    notice: [[1175, 0.09, 'sine', 0.09], [880, 0.16, 'sine', 0.08], [1175, 0.09, 'sine', 0.09], [880, 0.22, 'sine', 0.08]],
    alarm: [[988, 0.13, 'square', 0.07], [698, 0.13, 'square', 0.07], [988, 0.13, 'square', 0.07],
            [698, 0.13, 'square', 0.07], [988, 0.13, 'square', 0.07], [698, 0.2, 'square', 0.06]],
    chirin: [[2637, 0.05, 'sine', 0.045], [3520, 0.2, 'sine', 0.035]],
    trophy: [[1046, 0.06, 'triangle', 0.06], [1319, 0.06, 'triangle', 0.06], [1568, 0.16, 'sine', 0.06]]
  };
  function init() {
    if (ctx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { ctx = null; }
  }
  function ok() { return !muted && ctx && ctx.state !== 'suspended'; }
  var lastAt = {};
  function play(name, pitch, delay) {
    if (!ok()) return;
    var t = ctx.currentTime + Math.max(0, delay || 0), key = name + '@' + (pitch || 1);
    if (lastAt[key] != null && Math.abs(t - lastAt[key]) < 0.03) return;
    lastAt[key] = t;
    if (SPECIAL[name]) { SPECIAL[name](pitch || 1, t); return; }
    var seq = NOTES[name];
    if (!seq) return;
    seq.forEach(function (n) {
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = n[2]; osc.frequency.value = n[0] * (pitch || 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(n[3], t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + n[1] + 0.02);
      t += n[1] * 0.85;
    });
  }
  function bell(k) {
    if (muted || !ctx || ctx.state === 'suspended') return;
    var t = ctx.currentTime, base = 523 * (k || 1);
    [[1, 0.16, 3.2], [2.76, 0.07, 1.6], [5.4, 0.04, 0.9], [0.5, 0.06, 3.8]].forEach(function (h) {
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = base * h[0];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(h[1], t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + h[2]);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + h[2] + 0.05);
    });
  }
  function door(k, t) {
    [[1319, 0, 0.55], [1047, 0.2, 1.1]].forEach(function (n) {
      [[1, 0.11, 1], [2, 0.03, 0.45], [3, 0.012, 0.25]].forEach(function (h) {
        var osc = ctx.createOscillator(), g = ctx.createGain(), t0 = t + n[1], len = n[2] * h[2];
        osc.type = 'sine'; osc.frequency.value = n[0] * h[0] * k;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(h[1], t0 + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t0); osc.stop(t0 + len + 0.02);
      });
    });
  }
  function engine(k, t, pts, peak) {
    var osc = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    var lfo = ctx.createOscillator(), lg = ctx.createGain(), end = t + pts[pts.length - 1][0];
    osc.type = 'sawtooth';
    lp.type = 'lowpass'; lp.Q.value = 2;
    osc.frequency.setValueAtTime(pts[0][1] * k, t);
    lp.frequency.setValueAtTime(pts[0][1] * k * 5, t);
    for (var i = 1; i < pts.length; i++) {
      osc.frequency.exponentialRampToValueAtTime(pts[i][1] * k, t + pts[i][0]);
      lp.frequency.exponentialRampToValueAtTime(pts[i][1] * k * 5, t + pts[i][0]);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.05);
    g.gain.setValueAtTime(peak, end - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    lfo.type = 'square'; lfo.frequency.value = 24;
    lg.gain.value = peak * 0.35;
    lfo.connect(lg); lg.connect(g.gain);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(t); lfo.start(t); osc.stop(end + 0.03); lfo.stop(end + 0.03);
    osc.onended = function () { try { lg.disconnect(); g.disconnect(); lp.disconnect(); } catch (e) { } };
  }
  var noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    var len = Math.floor(ctx.sampleRate * 1.6), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), x = 9871;
    for (var i = 0; i < len; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; d[i] = (x >>> 0) / 2147483648 - 1; }
    return (noiseBuf = b);
  }
  function whoosh(len, t) {
    len = Math.max(0.5, Math.min(1.5, len || 1.3));
    [['bandpass', 0.9, [220, 1500, 260], 0.22], ['lowpass', 0.5, [160, 200, 120], 0.22]].forEach(function (L) {
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), mid = t + len * 0.45;
      src.buffer = noise();
      f.type = L[0]; f.Q.value = L[1];
      f.frequency.setValueAtTime(L[2][0], t);
      f.frequency.exponentialRampToValueAtTime(L[2][1], mid);
      f.frequency.exponentialRampToValueAtTime(L[2][2], t + len);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(L[3], mid);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + len + 0.03);
    });
  }
  function zap(k, t) {
    for (var i = 0; i < 6; i++) {
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = t + i * 0.045 + Math.random() * 0.02;
      src.buffer = noise();
      f.type = 'highpass'; f.frequency.value = 2200 + Math.random() * 1800;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t0, Math.random() * 1.2); src.stop(t0 + 0.05);
    }
    var o = ctx.createOscillator(), og = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 3200;
    o.frequency.setValueAtTime(110 * k, t);
    o.frequency.exponentialRampToValueAtTime(1760 * k, t + 0.28);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(lp); lp.connect(og); og.connect(ctx.destination);
    o.start(t); o.stop(t + 0.34);
    [[1046, 0.30], [1318, 0.30], [1568, 0.42], [2093, 0.5]].forEach(function (n, j) {
      var s = ctx.createOscillator(), g2 = ctx.createGain(), t1 = t + 0.3 + j * 0.03;
      s.type = j === 3 ? 'triangle' : 'square'; s.frequency.value = n[0] * k;
      g2.gain.setValueAtTime(0.0001, t1);
      g2.gain.exponentialRampToValueAtTime(0.045, t1 + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, t1 + n[1]);
      s.connect(g2); g2.connect(ctx.destination);
      s.start(t1); s.stop(t1 + n[1] + 0.02);
    });
  }
  function shieldSnd(k, t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(520 * k, t);
    o.frequency.exponentialRampToValueAtTime(1560 * k, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.32);
    [[1, 0.08, 1.4], [2.76, 0.035, 0.8], [4.1, 0.02, 0.5]].forEach(function (h) {
      var s = ctx.createOscillator(), g2 = ctx.createGain(), t1 = t + 0.16;
      s.type = 'sine'; s.frequency.value = 1046 * k * h[0];
      g2.gain.setValueAtTime(0.0001, t1);
      g2.gain.exponentialRampToValueAtTime(h[1], t1 + 0.006);
      g2.gain.exponentialRampToValueAtTime(0.0001, t1 + h[2]);
      s.connect(g2); g2.connect(ctx.destination);
      s.start(t1); s.stop(t1 + h[2] + 0.03);
    });
  }
  function rumble(k, t) {
    var len = 1.4 / Math.max(0.5, k), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    src.buffer = noise(); src.loop = true;
    f.type = 'lowpass'; f.frequency.value = 140 * k; f.Q.value = 1.5;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.12);
    g.gain.setValueAtTime(0.32, t + len * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    lfo.type = 'sine'; lfo.frequency.value = 7; lg.gain.value = 0.12;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); lfo.start(t); src.stop(t + len + 0.03); lfo.stop(t + len + 0.03);
    src.onended = function () { try { lg.disconnect(); g.disconnect(); f.disconnect(); } catch (e) { } };
  }
  function swish(t, len, f0, f1, vol, q) {
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise();
    f.type = 'bandpass'; f.Q.value = q || 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + len);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + len * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t, Math.random() * 0.8); src.stop(t + len + 0.03);
  }
  function tone(t, hz, len, type, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = hz;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + len + 0.02);
  }
  function rankupSnd(k, t) {
    swish(t, 0.22, 900 * k, 4200 * k, 0.16, 1.4);
    [[523, 0.09], [659, 0.09], [784, 0.09]].forEach(function (n, i) { tone(t + 0.2 + i * 0.08, n[0] * k, n[1] + 0.03, 'square', 0.07); });
    [1046, 1318, 1568].forEach(function (hz) { tone(t + 0.44, hz * k, 0.55, 'triangle', 0.07); });
    tone(t + 0.44, 2093 * k, 0.4, 'square', 0.035);
  }
  function vsSnd(k, t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(160 * k, t);
    o.frequency.exponentialRampToValueAtTime(42 * k, t + 0.22);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.32);
    swish(t, 0.09, 500, 260, 0.22, 0.8);
    swish(t + 0.02, 0.16, 6000 * k, 2400 * k, 0.12, 2);
    [[900, 1.6, 0.07], [1700, 1.3, 0.05]].forEach(function (c) {
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), cg = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      var t0 = t + 0.18, len = c[1];
      src.buffer = noise(); src.loop = true;
      f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.value = c[0] * k;
      cg.gain.setValueAtTime(0.0001, t0);
      cg.gain.exponentialRampToValueAtTime(c[2], t0 + 0.25);
      cg.gain.setValueAtTime(c[2], t0 + len * 0.5);
      cg.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      lfo.type = 'sine'; lfo.frequency.value = 5 + Math.random() * 3; lg.gain.value = c[2] * 0.4;
      lfo.connect(lg); lg.connect(cg.gain);
      src.connect(f); f.connect(cg); cg.connect(ctx.destination);
      src.start(t0, Math.random() * 0.5); lfo.start(t0); src.stop(t0 + len + 0.03); lfo.stop(t0 + len + 0.03);
      src.onended = function () { try { lg.disconnect(); cg.disconnect(); f.disconnect(); } catch (e) { } };
    });
    [1046, 1568].forEach(function (hz, i) { tone(t + 0.12 + i * 0.07, hz * k, 0.3, 'square', 0.05); });
  }
  function overtakenSnd(k, t) {
    var o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 600;
    o.frequency.setValueAtTime(130 * k, t);
    o.frequency.exponentialRampToValueAtTime(70 * k, t + 0.24);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
    g.gain.setValueAtTime(0.13, t + 0.16);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o.connect(lp); lp.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.28);
  }
  function registerSnd(k, t) {
    swish(t, 0.07, 1800 * k, 900 * k, 0.12, 0.7);
    swish(t + 0.05, 0.05, 3000 * k, 2000 * k, 0.06, 1.5);
    [[1568, 0.05], [2093, 0.13]].forEach(function (n) {
      [[1, 0.09, 1.1], [2.76, 0.03, 0.5], [5.4, 0.012, 0.25]].forEach(function (h) {
        var o = ctx.createOscillator(), g = ctx.createGain(), t0 = t + n[1];
        o.type = 'sine'; o.frequency.value = n[0] * k * h[0];
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(h[1], t0 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + h[2]);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0); o.stop(t0 + h[2] + 0.03);
      });
    });
  }
  function jackpotSnd(k, t) {
    [523, 587, 659, 784, 880, 1046, 1175, 1318, 1568, 1760, 2093, 2349].forEach(function (hz, i) {
      tone(t + i * 0.035, hz * k, 0.06, 'square', 0.045);
    });
    var t1 = t + 12 * 0.035;
    [1046, 1318, 1568, 2093].forEach(function (hz) { tone(t1, hz * k, 0.9, 'triangle', 0.06); });
    registerSnd(k * 1.5, t1 + 0.05);
  }
  function siren(k, t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    for (var i = 0; i < 3; i++) {
      o.frequency.setValueAtTime(620 * k, t + i * 0.6);
      o.frequency.linearRampToValueAtTime(940 * k, t + i * 0.6 + 0.3);
      o.frequency.linearRampToValueAtTime(620 * k, t + i * 0.6 + 0.6);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.05);
    g.gain.setValueAtTime(0.07, t + 1.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.85);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.9);
  }
  function quakeSnd(k, t) {
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise(); src.loop = true;
    f.type = 'lowpass'; f.frequency.value = 95 * k; f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    for (var i = 0; i < 8; i++) g.gain.linearRampToValueAtTime(i % 2 ? 0.12 : 0.35, t + 0.1 + i * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + 2.4);
  }
  function alarm(k, t) {
    for (var i = 0; i < 4; i++) {
      var o = ctx.createOscillator(), g = ctx.createGain(), t0 = t + i * 0.16 + (i > 1 ? 0.18 : 0);
      o.type = 'square'; o.frequency.value = (i % 2 ? 1175 : 988) * k;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 0.15);
    }
  }
  var SPECIAL = {
    siren: siren,
    quake: quakeSnd,
    alarm: alarm,
    register: registerSnd,
    jackpot: jackpotSnd,
    zap: zap,
    shield: shieldSnd,
    rumble: rumble,
    rankup: rankupSnd,
    vs: vsSnd,
    overtaken: overtakenSnd,
    chime: door,
    vroom: function (k, t) { engine(k, t, [[0, 55], [0.42, 150], [0.52, 112], [0.9, 175]], 0.07); },
    brake: function (k, t) { engine(k, t, [[0, 150], [0.55, 52]], 0.055); },
    whoosh: function (k, t) { whoosh(1.3, t); }
  };
  var hooked = false;
  function isSub(m) { return m === 'subway' || m === 'metro'; }
  function hook() {
    var G = QT.G;
    if (hooked || !G || typeof G.on !== 'function') return;
    hooked = true;
    G.on('rideStart', function (r) {
      if (!r) return;
      if (r.mode === 'taxi' || r.mode === 'car') play('vroom', r.mode === 'car' ? 1.12 : 1);
    });
    G.on('rideEnd', function (r) {
      if (!r) return;
      if (r.mode === 'taxi' || r.mode === 'car') play('brake', r.mode === 'car' ? 1.12 : 1);
      else if (r.mode === 'train' || isSub(r.mode)) play('chime');
    });
  }
  var amb = null, ambReady = false, ambWant = 0;
  function ambInit(src) {
    if (amb) return;
    amb = new Audio(src);
    amb.loop = true;
    amb.preload = 'auto';
    amb.volume = 0;
    amb.addEventListener('canplaythrough', function () { ambReady = true; });
    amb.load();
  }
  var legRide = null, legIdx = -1;
  function watchLegs() {
    var T = QT.Sim && QT.Sim.travel, r = T && T.ride;
    if (!r || !r.legs || !r.legs.length) { legRide = null; legIdx = -1; return; }
    if (r !== legRide) { legRide = r; legIdx = -1; }
    var t = r.t || 0, acc = 0, i = 0, k, l;
    for (k = 0; k < r.legs.length; k++) {
      var t0 = r.legs[k].t0 != null ? r.legs[k].t0 : acc;
      if (t >= t0) i = k;
      acc = t0 + (r.legs[k].dur || 0);
    }
    if (i === legIdx) return;
    legIdx = i; l = r.legs[i];
    if (isSub(l.line || l.mode) && ok()) whoosh(Math.min(1.5, (l.dur || 1.3) / (r.speed || 1)), ctx.currentTime);
  }
  function ambient(vol) {
    if (!hooked) hook();
    watchLegs();
    if (!amb) return;
    ambWant = muted ? 0 : Math.max(0, Math.min(1, vol));
    amb.volume = amb.volume + (ambWant - amb.volume) * 0.12;
    if (ambWant > 0.01 && amb.paused) {
      var pr = amb.play();
      if (pr && pr.catch) pr.catch(function () { });
    } else if (ambWant <= 0.01 && !amb.paused && amb.volume < 0.02) {
      amb.pause();
    }
  }
  QT.Sfx = {
    init: init,
    ctx: function () { init(); return ctx; },
    play: play,
    bell: bell,
    whoosh: function (len, delay) { if (ok()) whoosh(len, ctx.currentTime + Math.max(0, delay || 0)); },
    hook: hook,
    has: function (name) { return !!(NOTES[name] || SPECIAL[name]); },
    resume: function () {
      init();
      if (ctx && ctx.resume) ctx.resume();
      if (amb && amb.paused && !muted) { var pr = amb.play(); if (pr && pr.catch) pr.catch(function () { }); }
    },
    ambInit: ambInit,
    ambient: ambient,
    ambEl: function () { return amb; },
    setMuted: function (m) {
      muted = m;
      if (m && amb && !amb.paused) { amb.volume = 0; amb.pause(); }
    },
    isMuted: function () { return muted; }
  };
})(window.QT || (window.QT = {}));
