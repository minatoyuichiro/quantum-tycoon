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
    levelup: [[523, 0.06, 'square', 0.08], [784, 0.06, 'square', 0.08], [1046, 0.14, 'square', 0.09]]
  };
  function init() {
    if (ctx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { ctx = null; }
  }
  function play(name, pitch) {
    if (muted || !ctx || ctx.state === 'suspended') return;
    var seq = NOTES[name];
    if (!seq) return;
    var t = ctx.currentTime;
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
  function ambient(vol) {
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
