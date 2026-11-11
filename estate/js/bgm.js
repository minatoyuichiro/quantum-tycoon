(function (QT) {
  'use strict';
  var TILE = 16;
  var LOOKAHEAD = 0.12;
  var TICK_MS = 25;
  var DEFAULT_VOL = 0.16;
  var FADE_OUT = 1.8, FADE_IN = 1.6;
  var SWITCH_DELAY = 0.6;
  var FADE_TAIL = 0.5;
  var RESUME_WINDOW = 120;
  var AREA = { futako: 'home', shibuya: 'town', otemachi: 'finance', hongo: 'campus', minato: 'office',
               fab: 'factory', inzai: 'cryo', shinjuku: 'hq', ariake: 'bay' };
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function pcOf(s) { return (PC[s.charAt(0)] + (s.charAt(1) === '#' ? 1 : s.charAt(1) === 'b' ? -1 : 0) + 12) % 12; }
  function noteNum(s) {
    var m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
    if (!m) throw new Error('bgm: 音名が読めない ' + s);
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  var QUAL = {
    '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11],
    '9': [0, 4, 7, 10, 14], 'm9': [0, 3, 7, 10, 14], 'maj9': [0, 4, 7, 11, 14], 'add9': [0, 4, 7, 14],
    'sus4': [0, 5, 7], '7sus4': [0, 5, 7, 10], 'sus2': [0, 2, 7], 'dim': [0, 3, 6], 'm7b5': [0, 3, 6, 10],
    '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], '5': [0, 7]
  };
  var chordCache = {};
  function chord(sym) {
    if (chordCache[sym]) return chordCache[sym];
    var m = /^([A-G][#b]?)([^\/]*)(?:\/([A-G][#b]?))?$/.exec(sym);
    if (!m || !QUAL[m[2]]) throw new Error('bgm: コード名が読めない ' + sym);
    var root = pcOf(m[1]);
    return (chordCache[sym] = { sym: sym, root: root, iv: QUAL[m[2]], bass: m[3] ? pcOf(m[3]) : root });
  }
  function place(pc, lo) { return lo + ((pc - lo) % 12 + 12) % 12; }
  function voicing(ch, center, max, prev, triad) {
    var iv = ch.iv.slice();
    if (triad) iv = iv.filter(function (x) { return x < 12; }).slice(0, 3);
    while (iv.length > max) {
      var k = iv[iv.length - 1] >= 12 && iv[0] === 0 ? 0 : iv.indexOf(7);
      iv.splice(k < 0 ? 0 : k, 1);
    }
    var pcs = iv.map(function (x) { return (ch.root + x) % 12; })
      .sort(function (a, b) { return (a - ch.root + 12) % 12 - (b - ch.root + 12) % 12; });
    var best = null, bestCost = 1e9;
    for (var r = 0; r < pcs.length; r++) {
      var v = [place(pcs[r], 0)];
      for (var k2 = 1; k2 < pcs.length; k2++) v.push(place(pcs[(r + k2) % pcs.length], v[k2 - 1] + 1));
      var sh = Math.round((center - mean(v)) / 12) * 12, w = v.map(function (x) { return x + sh; });
      var cost = Math.abs(mean(w) - center) * 0.5;
      if (prev) {
        if (prev.length === w.length) for (var j = 0; j < w.length; j++) cost += Math.abs(w[j] - prev[j]);
        else cost += Math.abs(mean(w) - mean(prev)) * 2 + Math.abs(w[w.length - 1] - prev[prev.length - 1]);
      }
      for (var j2 = 1; j2 < w.length; j2++) if (w[j2] - w[j2 - 1] === 1) cost += w[j2 - 1] < 72 ? 40 : 3;
      if (cost < bestCost) { bestCost = cost; best = w; }
    }
    return best;
  }
  function powerChord(ch, center, prev) {
    var ref = prev ? prev[0] : center, best = null;
    for (var n = center - 7; n <= center + 7; n++) {
      if ((n % 12 + 12) % 12 !== ch.root) continue;
      if (best == null || Math.abs(n - ref) < Math.abs(best - ref)) best = n;
    }
    return [best, best + 7, best + 12];
  }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  var VEL = { X: 1, x: 0.8, g: 0.45, o: 0.8 };
  var DRUM = { k: 'kick', s: 'snare', c: 'clap', h: 'hat', o: 'ohat', m: 'metal', y: 'crash', t: 'tomH', u: 'tomL' };
  function bars(p, name) {
    if (p == null || p === '') return null;
    if (typeof p === 'string') {
      p = p.replace(/\s+/g, '');
      if (p.length % 16) throw new Error('bgm: 型の長さが16の倍数でない ' + name + ' (' + p.length + ')');
      var out = [];
      for (var i = 0; i < p.length; i += 16) out.push(p.substr(i, 16));
      return out;
    }
    return p.map(function (b) {
      b = (b || '').replace(/\s+/g, '');
      if (b && b.length !== 16) throw new Error('bgm: 1小節が16でない ' + name + ' "' + b + '"');
      return b;
    });
  }
  function section(D, name) {
    var s = D.sections[name];
    if (!s) throw new Error('bgm: 段が無い ' + name);
    if (!s.from) return s;
    var b = section(D, s.from), r = {}, k;
    for (k in b) r[k] = b[k];
    for (k in s) if (k !== 'from') r[k] = s[k];
    r.parts = merge(b.parts, s.parts);
    r.notes = merge(b.notes, s.notes);
    return r;
  }
  function merge(a, b) {
    var r = {}, k;
    for (k in a || {}) r[k] = a[k];
    for (k in b || {}) r[k] = b[k];
    return r;
  }
  var songCache = {};
  function song(id) {
    if (songCache[id]) return songCache[id];
    var D = SONGS[id] || JINGLES[id];
    if (!D) throw new Error('bgm: 曲が無い ' + id);
    var secs = D.form.map(function (n) { return { name: n, s: section(D, n) }; });
    var chordAt = [], bar = 0;
    secs.forEach(function (x) {
      var bs = x.s.chords.split('|');
      x.bar = bar; x.bars = bs.length; x.step = bar * 16;
      bs.forEach(function (b) {
        var cs = b.trim().split(/\s+/), len = 16 / cs.length;
        if (len !== Math.floor(len)) throw new Error('bgm: 1小節のコード数 ' + b);
        for (var i = 0; i < 16; i++) chordAt.push(chord(cs[Math.floor(i / len)]));
      });
      bar += bs.length;
    });
    var total = bar * 16, loop = secs[D.loop || 0].step;
    var ev = new Array(total);
    function add(st, e) { (ev[st] || (ev[st] = [])).push(e); }
    function nextChord(st) {
      var c = chordAt[st];
      for (var i = st + 1; i < total; i++) if (chordAt[i] !== c) return chordAt[i];
      return chordAt[loop];
    }
    function splitAtChanges(st, len) {
      var out = [], s0 = st;
      for (var i = st + 1; i < st + len; i++) {
        if (chordAt[i] !== chordAt[i - 1]) { out.push([s0, i - s0]); s0 = i; }
      }
      out.push([s0, st + len - s0]);
      return out;
    }
    var prevVoice = {};
    secs.forEach(function (x) {
      var s = x.s, parts = s.parts || {}, notes = s.notes || {};
      add(x.step, s.sweep ? { i: 'tone', f0: s.sweep[0], f1: s.sweep[1], d: x.bars * 16 } : { i: 'tone', f1: 20000 });
      if (s.crash) add(x.step, { i: 'crash', v: s.crash === true ? 1 : s.crash });
      if (s.riser) add(x.step + (x.bars - s.riser) * 16, { i: 'riser', d: s.riser * 16 });
      if (s.pump) for (var pb = 0; pb < x.bars * 16; pb += 4) add(x.step + pb, { i: 'pump', ch: s.pump });
      Object.keys(D.inst).forEach(function (name) {
        var I = D.inst[name];
        if (I.role === 'line') {
          var lb = notes[name];
          if (typeof lb === 'string') lb = D.lines[lb];
          if (lb) line(name, I, lb, x);
          return;
        }
        var pn = parts[name];
        if (!pn) return;
        var pb2 = bars(D.pat && D.pat[pn] != null ? D.pat[pn] : pn, name + ':' + pn);
        for (var b = 0; b < x.bars; b++) {
          var row = pb2[b % pb2.length];
          if (!row) continue;
          for (var i = 0; i < 16; i++) {
            var c = row.charAt(i);
            if (c === '.' || c === '-') continue;
            var len = 1;
            while (i + len < 16 && row.charAt(i + len) === '-') len++;
            var st = x.step + b * 16 + i;
            splitAtChanges(st, len).forEach(function (seg, si) {
              var ch = chordAt[seg[0]], n, v = VEL[c] || (i % 4 === 0 ? 0.9 : 0.75);
              if (si > 0) v *= 0.85;
              if (I.role === 'bass') n = bassNote(ch, c, I.lo || 36, seg[0]);
              else if (I.role === 'chord') {
                n = I.power ? powerChord(ch, I.center || 55, prevVoice[name])
                            : voicing(ch, I.center || 64, I.voices || 3, prevVoice[name], I.triad);
                prevVoice[name] = n;
              } else if (I.role === 'arp') n = arpNote(ch, +c, I.center || 72);
              if (n != null) add(seg[0], { i: name, n: n, d: seg[1], v: v });
            });
          }
        }
      });
      var dk = parts.drums && D.drums[parts.drums], fill = s.fill && D.drums[s.fill];
      for (var b2 = 0; b2 < x.bars; b2++) {
        var kit = (fill && b2 === x.bars - 1) ? fill : dk;
        if (!kit) continue;
        Object.keys(kit).forEach(function (key) {
          if (!DRUM[key]) throw new Error('bgm: ドラムの記号 ' + key);
          var rows = bars(kit[key], 'drum ' + key);
          var row = rows && rows[b2 % rows.length];
          if (!row) return;
          for (var i = 0; i < 16; i++) {
            var c = row.charAt(i);
            if (VEL[c]) add(x.step + b2 * 16 + i, { i: DRUM[key], v: VEL[c] });
          }
        });
      }
    });
    function bassNote(ch, c, lo, st) {
      var r = place(ch.bass, lo);
      switch (c) {
        case 'R': return r;
        case '8': return r + 12;
        case '5': return place((ch.root + 7) % 12, r + 1);
        case '3': return place((ch.root + ch.iv[1]) % 12, r + 1);
        case '7': return ch.iv.length > 3 ? place((ch.root + ch.iv[3]) % 12, r + 1) : r + 12;
        case 'L': return place((ch.root + 7) % 12, r - 12);
        case 'A': return place((nextChord(st).bass + 11) % 12, r - 6);
      }
      throw new Error('bgm: ベースの記号 ' + c);
    }
    function arpNote(ch, k, center) {
      var lo = center - 6;
      var t = ch.iv.map(function (x) { return place((ch.root + x) % 12, lo); }).sort(function (a, b) { return a - b; });
      return t[k % t.length] + 12 * Math.floor(k / t.length);
    }
    function line(name, I, lb, x) {
      var seq = [];
      lb.forEach(function (b, bi) {
        if (bi >= x.bars) throw new Error('bgm: メロディが段より長い ' + name + ' ' + x.name);
        var tk = b ? b.trim().split(/\s+/) : ['.'];
        var len = 16 / tk.length;
        if (len !== Math.floor(len)) throw new Error('bgm: 1小節の音の数 ' + name + ' ' + x.name + ' "' + b + '"');
        tk.forEach(function (t, ti) { seq.push({ t: t, st: x.step + bi * 16 + ti * len, len: len }); });
      });
      for (var i = 0; i < seq.length; i++) {
        var t = seq[i].t;
        if (t === '.' || t === '-') continue;
        var d = seq[i].len, j = i + 1;
        while (j < seq.length && seq[j].t === '-') { d += seq[j].len; j++; }
        var st = seq[i].st, v = st % 4 === 0 ? 0.9 : 0.78;
        add(st, { i: name, n: noteNum(t), d: d, v: v });
      }
    }
    var sd = 60 / D.bpm / 4;
    return (songCache[id] = {
      id: id, def: D, ev: ev, total: total, loop: loop, sd: sd, swing: D.swing || 0,
      secs: secs.map(function (x) { return { name: x.name, bar: x.bar, bars: x.bars, t: x.step * sd }; })
    });
  }
  function vca(c) { var g = c.createGain(); g.gain.value = 0; return g; }
  function krate(p) { try { p.automationRate = 'k-rate'; } catch (e) { } return p; }
  function adsr(p, t, dur, a, d, s, r, peak) {
    var z = 0.0001, tr = t + Math.max(dur, 0.01), vr;
    a = Math.max(0.002, a || 0);
    r = Math.max(0.01, r || 0);
    p.setValueAtTime(0, t);
    if (tr <= t + a) {
      vr = peak * (tr - t) / a;
      p.linearRampToValueAtTime(vr, tr);
    } else {
      p.linearRampToValueAtTime(peak, t + a);
      var sus = Math.max(z, peak * (s == null ? 1 : s));
      if (d > 0 && sus < peak) {
        if (tr < t + a + d) {
          vr = peak * Math.pow(sus / peak, (tr - t - a) / d);
          p.exponentialRampToValueAtTime(Math.max(z, vr), tr);
        } else {
          p.exponentialRampToValueAtTime(sus, t + a + d);
          p.setValueAtTime(sus, tr);
          vr = sus;
        }
      } else { p.setValueAtTime(peak, tr); vr = peak; }
    }
    vr = Math.max(z * 2, vr);
    p.exponentialRampToValueAtTime(Math.min(z, vr / 2), tr + r);
    p.linearRampToValueAtTime(0, tr + r + 0.01);
    return tr + r + 0.03;
  }
  function vibrato(osc, t, len, cents, base) {
    var dl = 0.16;
    if (len < 0.3) return;
    var n = Math.max(8, Math.ceil((len - dl) * 60)), cv = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var tt = i / (n - 1) * (len - dl);
      cv[i] = (base || 0) + cents * Math.min(1, tt / 0.3) * Math.sin(2 * Math.PI * 5.4 * tt);
    }
    try { krate(osc.detune).setValueCurveAtTime(cv, t + dl, len - dl); } catch (e) { }
  }
  function pulseWave(ctx, duty) {
    var N = 48, re = new Float32Array(N), im = new Float32Array(N);
    for (var n = 1; n < N; n++) {
      re[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
      im[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n);
    }
    return ctx.createPeriodicWave(re, im);
  }
  function setWave(E, o, w) {
    if (w === 'pulse25' || w === 'pulse12') {
      var k = w, duty = w === 'pulse25' ? 0.25 : 0.125;
      if (!E.waves[k]) E.waves[k] = pulseWave(E.ctx, duty);
      o.setPeriodicWave(E.waves[k]);
    } else o.type = w;
  }
  function tone(P, I, n, t, dur, v) {
    var c = P.ctx, E = P.E, f = hz(n + 12 * (I.oct || 0)), peak = (I.gain || 0.1) * v;
    var g = vca(c), into = g, oscs = [], end, fl = null;
    if (I.cut) {
      fl = c.createBiquadFilter();
      fl.type = 'lowpass'; fl.Q.value = I.q || 1;
      krate(fl.frequency);
      fl.frequency.setValueAtTime(I.cut + (I.cutEnv || 0) * v, t);
      fl.frequency.exponentialRampToValueAtTime(I.cut, t + (I.cutDec || 0.2));
      fl.connect(g); into = fl;
    }
    if (I.fm) {
      var car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain();
      car.frequency.value = f; mod.frequency.value = f * I.fm;
      var fm0 = f * I.fm * (I.idx || 1) * (0.6 + 0.4 * v), fm1 = Math.max(0.01, fm0 * (I.idxEnd == null ? 0.1 : I.idxEnd));
      mg.gain.setValueAtTime(fm0, t);
      mg.gain.exponentialRampToValueAtTime(fm1, t + (I.idxDec || 0.3));
      mod.connect(mg); mg.connect(car.frequency); car.connect(into);
      oscs.push(car, mod);
    } else {
      var uni = I.uni || 1;
      if (E.lite && uni > 1) { peak *= Math.sqrt(uni); uni = 1; }
      for (var u = 0; u < uni; u++) {
        var o = c.createOscillator();
        setWave(E, o, I.wave || 'triangle');
        o.frequency.value = f;
        var det = uni > 1 ? (u / (uni - 1) * 2 - 1) * (I.det || 8) : 0;
        o.detune.value = det;
        o.connect(into);
        oscs.push(o);
        if (I.vib) vibrato(o, t, dur + (I.r || 0), I.vib, det);
      }
      if (I.sub) {
        var so = c.createOscillator(), sg = c.createGain();
        so.type = 'sine'; so.frequency.value = f; sg.gain.value = I.sub;
        so.connect(sg); sg.connect(g);
        oscs.push(so);
      }
    }
    g.connect(P.chan[I.name].input);
    end = adsr(g.gain, t, dur, I.a, I.d, I.s, I.r, peak);
    for (var k = 0; k < oscs.length; k++) { oscs[k].start(t); oscs[k].stop(end); }
    if (fl) oscs[0].onended = function () { try { fl.disconnect(); g.disconnect(); } catch (e) { } };
  }
  var KIT = {
    kick:  { gain: 0.8, f0: 170, f1: 50, pdec: 0.07, dec: 0.32 },
    snare: { gain: 0.3, dec: 0.16, tone: 190, toneGain: 0.45, hp: 1100, off: 0.7 },
    clap:  { gain: 0.3, dec: 0.16, bp: 1150, off: 0.9 },
    hat:   { gain: 0.09, dec: 0.045, hp: 7500, off: 0.1, pan: 0.15 },
    ohat:  { gain: 0.07, dec: 0.26, off: 0.4 },
    crash: { gain: 0.08, dec: 1.6, hp: 4200, off: 0, pan: -0.1 },
    metal: { gain: 0.05, dec: 0.16, f: [540, 800], bp: 1900, pan: -0.2 },
    tomH:  { gain: 0.35, f0: 240, f1: 165, dec: 0.22 },
    tomL:  { gain: 0.35, f0: 160, f1: 105, dec: 0.28 },
    riser: { gain: 0.05, f0: 350, f1: 7000 }
  };
  function noiseHit(P, bus, t, peak, dec, off, loop) {
    var c = P.ctx, src = c.createBufferSource(), g = vca(c);
    src.buffer = P.E.noise; if (loop) src.loop = true;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.0015);
    g.gain.exponentialRampToValueAtTime(peak * 0.001, t + dec);
    g.gain.linearRampToValueAtTime(0, t + dec + 0.01);
    src.connect(g); g.connect(bus);
    src.start(t, off || 0); src.stop(t + dec + 0.03);
    return g;
  }
  function thump(P, bus, t, K, v) {
    var c = P.ctx, o = c.createOscillator(), g = vca(c);
    o.type = 'sine';
    o.frequency.setValueAtTime(K.f0, t);
    o.frequency.exponentialRampToValueAtTime(K.f1, t + (K.pdec || 0.08));
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(K.gain * v, t + 0.002);
    g.gain.exponentialRampToValueAtTime(K.gain * v * 0.001, t + K.dec);
    g.gain.linearRampToValueAtTime(0, t + K.dec + 0.01);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + K.dec + 0.03);
  }
  function drum(P, name, t, v) {
    var K = P.kit[name], d = P.dch, c = P.ctx;
    switch (name) {
      case 'kick': case 'tomH': case 'tomL': thump(P, d.kick, t, K, v); break;
      case 'snare': {
        noiseHit(P, d.snare, t, K.gain * v, K.dec, K.off);
        var o = c.createOscillator(), g = vca(c);
        o.type = 'triangle';
        o.frequency.setValueAtTime(K.tone * 1.3, t);
        o.frequency.exponentialRampToValueAtTime(K.tone, t + 0.03);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(K.gain * K.toneGain * v, t + 0.002);
        g.gain.exponentialRampToValueAtTime(K.gain * K.toneGain * v * 0.001, t + 0.1);
        g.gain.linearRampToValueAtTime(0, t + 0.11);
        o.connect(g); g.connect(d.kick);
        o.start(t); o.stop(t + 0.13);
        break;
      }
      case 'clap': {
        var src = c.createBufferSource(), gg = vca(c), p = K.gain * v;
        src.buffer = P.E.noise;
        gg.gain.setValueAtTime(0, t);
        for (var i = 0; i < 3; i++) {
          var tt = t + i * 0.011;
          gg.gain.linearRampToValueAtTime(p, tt + 0.001);
          gg.gain.exponentialRampToValueAtTime(p * 0.25, tt + 0.01);
        }
        gg.gain.exponentialRampToValueAtTime(p * 0.001, t + 0.033 + K.dec);
        gg.gain.linearRampToValueAtTime(0, t + 0.043 + K.dec);
        src.connect(gg); gg.connect(d.clap);
        src.start(t, K.off); src.stop(t + 0.06 + K.dec);
        break;
      }
      case 'hat': noiseHit(P, d.hat, t, K.gain * v, K.dec, K.off); break;
      case 'ohat': noiseHit(P, d.hat, t, K.gain * v, K.dec, K.off); break;
      case 'crash': noiseHit(P, d.crash, t, K.gain * v, K.dec, K.off); break;
      case 'metal': {
        var mg = vca(c);
        mg.gain.setValueAtTime(0, t);
        mg.gain.linearRampToValueAtTime(K.gain * v, t + 0.002);
        mg.gain.exponentialRampToValueAtTime(K.gain * v * 0.001, t + K.dec);
        mg.gain.linearRampToValueAtTime(0, t + K.dec + 0.01);
        mg.connect(d.metal);
        K.f.forEach(function (f) {
          var mo = c.createOscillator();
          setWave(P.E, mo, 'square'); mo.frequency.value = f;
          mo.connect(mg); mo.start(t); mo.stop(t + K.dec + 0.03);
        });
        break;
      }
    }
  }
  function riser(P, t, len) {
    var c = P.ctx, K = P.kit.riser, src = c.createBufferSource(), f = c.createBiquadFilter(), g = vca(c);
    src.buffer = P.E.noise; src.loop = true;
    f.type = 'bandpass'; f.Q.value = 2.5;
    krate(f.frequency);
    f.frequency.setValueAtTime(K.f0, t);
    f.frequency.exponentialRampToValueAtTime(K.f1, t + len);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(K.gain, t + len * 0.97);
    g.gain.linearRampToValueAtTime(0, t + len + 0.02);
    src.connect(f); f.connect(g); g.connect(P.tone);
    src.start(t); src.stop(t + len + 0.05);
    src.onended = function () { try { f.disconnect(); g.disconnect(); } catch (e) { } };
  }
  function Player(E, id, bus) {
    var c = E.ctx, S = song(id), D = S.def;
    this.E = E; this.ctx = c; this.id = id; this.song = S;
    this.step = 0; this.t = 0; this.on = false; this.fadeEnd = 0;
    this.once = !!D.once;
    this.full = Math.pow(10, (D.level || 0) / 20);
    this.lv = { v0: 0, v1: 0, t0: 0, t1: 0 };
    this.out = c.createGain(); this.out.gain.value = 0;
    this.out.connect(bus || E.music);
    this.tone = c.createBiquadFilter();
    this.tone.type = 'lowpass'; this.tone.frequency.value = 20000; this.tone.Q.value = 0;
    krate(this.tone.frequency);
    this.tone.connect(this.out);
    var dl = D.delay || {};
    this.dIn = c.createGain();
    var dly = c.createDelay(2), fb = c.createBiquadFilter(), fbg = c.createGain(), wet = c.createGain();
    dly.delayTime.value = (dl.beats || 0.75) * 60 / D.bpm;
    fb.type = 'lowpass'; fb.frequency.value = dl.lp || 3000; fb.Q.value = 0;
    fbg.gain.value = dl.fb == null ? 0.35 : dl.fb;
    wet.gain.value = dl.wet == null ? 0.6 : dl.wet;
    this.dIn.connect(dly); dly.connect(fb); fb.connect(fbg); fbg.connect(dly); fb.connect(wet); wet.connect(this.tone);
    this.fbg = fbg;
    var self = this;
    this.chan = {};
    Object.keys(D.inst).forEach(function (n) { D.inst[n].name = n; self.chan[n] = chan(self, D.inst[n]); });
    this.kit = {};
    Object.keys(KIT).forEach(function (k) { self.kit[k] = merge(KIT[k], D.kit && D.kit[k]); });
    var K = this.kit;
    this.dch = {
      kick:  chan(this, {}).input,
      snare: chan(this, { hp: K.snare.hp, send: K.snare.send }).input,
      clap:  chan(this, { bp: K.clap.bp, send: K.clap.send || 0.12 }).input,
      hat:   chan(this, { hp: K.hat.hp, pan: K.hat.pan }).input,
      crash: chan(this, { hp: K.crash.hp, pan: K.crash.pan }).input,
      metal: chan(this, { bp: K.metal.bp, pan: K.metal.pan, send: 0.15 }).input
    };
  }
  function chan(P, I) {
    var c = P.ctx, inp = c.createGain(), last = inp, f;
    if (I.lp) { f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = I.lp; f.Q.value = I.lpq || 0; last.connect(f); last = f; }
    if (I.hp) { f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = I.hp; f.Q.value = 0; last.connect(f); last = f; }
    if (I.bp) { f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = I.bp; f.Q.value = 1.2; last.connect(f); last = f; }
    if (I.pan && c.createStereoPanner) { f = c.createStereoPanner(); f.pan.value = I.pan; last.connect(f); last = f; }
    last.connect(P.tone);
    if (I.send) { var s = c.createGain(); s.gain.value = I.send; last.connect(s); s.connect(P.dIn); }
    return { input: inp };
  }
  Player.prototype.begin = function (t, step) { this.t = t; this.step = step || 0; this.on = true; };
  Player.prototype.fill = function (until) {
    var S = this.song, sd = S.sd, now = this.ctx.currentTime;
    while (this.on && this.t < until) {
      var list = S.ev[this.step], ts = this.t + ((this.step & 1) ? S.swing * sd : 0);
      if (list && ts >= now - 0.01) for (var i = 0; i < list.length; i++) this.fire(list[i], ts);
      this.t += sd;
      if (++this.step >= S.total) {
        if (this.once) { this.on = false; break; }
        this.step = S.loop;
      }
    }
  };
  Player.prototype.fire = function (e, t) {
    if (this.mute && this.mute[e.i]) return;
    var S = this.song, D = S.def, I = D.inst[e.i];
    if (I) {
      var dur = e.d * S.sd * (I.gate || 0.92), ns = typeof e.n === 'number' ? [e.n] : e.n;
      for (var k = 0; k < ns.length; k++) tone(this, I, ns[k], t, dur, e.v);
      return;
    }
    switch (e.i) {
      case 'tone': {
        var fr = this.tone.frequency;
        if (e.f0) { fr.setValueAtTime(e.f0, t); fr.exponentialRampToValueAtTime(e.f1, t + e.d * S.sd); }
        else fr.setValueAtTime(e.f1, t);
        break;
      }
      case 'riser': riser(this, t, e.d * S.sd); break;
      case 'pump': {
        var beat = S.sd * 4, low = D.pumpDepth || 0.35;
        for (var j = 0; j < e.ch.length; j++) {
          var gp = this.chan[e.ch[j]].input.gain;
          gp.setValueAtTime(1, t);
          gp.linearRampToValueAtTime(low, t + 0.012);
          gp.linearRampToValueAtTime(1, t + beat * 0.62);
        }
        break;
      }
      default: drum(this, e.i, t, e.v);
    }
  };
  Player.prototype.level = function (now) {
    var L = this.lv;
    if (now >= L.t1) return L.v1;
    if (now <= L.t0) return L.v0;
    return L.v0 + (L.v1 - L.v0) * (now - L.t0) / (L.t1 - L.t0);
  };
  Player.prototype.fade = function (to, now, dur) {
    var g = this.out.gain, v = this.level(now);
    if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now);
    else g.cancelScheduledValues(now);
    g.setValueAtTime(v, now);
    g.linearRampToValueAtTime(to, now + dur);
    this.lv = { v0: v, v1: to, t0: now, t1: now + dur };
  };
  Player.prototype.kill = function () {
    this.on = false;
    try { this.out.disconnect(); } catch (e) { }
    try { this.fbg.disconnect(); } catch (e2) { }
  };
  function Engine(ctx) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    var cp = ctx.createDynamicsCompressor();
    cp.threshold.value = -20; cp.knee.value = 12; cp.ratio.value = 3;
    cp.attack.value = 0.01; cp.release.value = 0.25;
    this.master.connect(cp); cp.connect(ctx.destination);
    this.comp = cp;
    this.music = ctx.createGain();
    this.music.connect(this.master);
    this.jp = null;
    this.waves = {};
    this.lite = lite;
    this.noise = makeNoise(ctx);
    this.cur = null; this.old = []; this.pos = {};
  }
  function makeNoise(ctx) {
    var len = Math.floor(ctx.sampleRate * 3), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), x = 22222;
    for (var i = 0; i < len; i++) {
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      d[i] = (x >>> 0) / 2147483648 - 1;
    }
    return b;
  }
  Engine.prototype.tick = function (ahead) {
    var now = this.ctx.currentTime, until = now + ahead;
    if (this.cur) this.cur.fill(until);
    for (var i = this.old.length - 1; i >= 0; i--) {
      var p = this.old[i];
      if (now < p.fadeEnd) p.fill(Math.min(until, p.fadeEnd - FADE_TAIL));
      else if (now > p.fadeEnd + 0.4) { p.kill(); this.old.splice(i, 1); }
    }
  };
  Engine.prototype.switchTo = function (id, fadeIn) {
    var now = this.ctx.currentTime, cur = this.cur;
    if (cur && cur.id === id) return;
    if (cur) {
      cur.fade(0, now, FADE_OUT);
      cur.fadeEnd = now + FADE_OUT;
      this.pos[cur.id] = { step: cur.step, at: now };
      this.old.push(cur);
    }
    for (var i = 0; i < this.old.length; i++) {
      var p = this.old[i];
      if (p.id === id && p !== cur && p.on) {
        this.old.splice(i, 1);
        while (p.t < now + 0.05) {
          p.t += p.song.sd;
          if (++p.step >= p.song.total) p.step = p.song.loop;
        }
        p.fade(p.full, now, fadeIn == null ? FADE_IN : fadeIn);
        p.fadeEnd = 0;
        this.cur = p;
        return;
      }
    }
    var np = new Player(this, id);
    np.begin(now + 0.06, this.resumeStep(id, now));
    np.fade(np.full, now, fadeIn == null ? FADE_IN : fadeIn);
    this.cur = np;
  };
  Engine.prototype.resumeStep = function (id, now) {
    var r = this.pos[id];
    if (!r) return 0;
    if (now - r.at > RESUME_WINDOW) return song(id).loop;
    return r.step - r.step % 64;
  };
  Engine.prototype.rewind = function () {
    var now = this.ctx.currentTime;
    this.old.forEach(function (p) { p.kill(); });
    this.old = [];
    var p = this.cur;
    if (p && p.t < now + 0.02) {
      p.step -= p.step % 16;
      p.t = now + 0.1;
    }
  };
  Engine.prototype.setMaster = function (v, tc) {
    var g = this.master.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(v, now, tc || 0.08);
  };
  Engine.prototype.stopAll = function () {
    var now = this.ctx.currentTime;
    if (this.cur) { this.cur.fade(0, now, 0.5); this.cur.fadeEnd = now + 0.5; this.old.push(this.cur); }
    this.cur = null;
  };
  var DUCK = 0.28, DUCK_IN = 0.05, DUCK_BACK = 0.35, JINGLE_TAIL = 2.5;
  Engine.prototype.jingle = function (id, delay) {
    var c = this.ctx, now = c.currentTime, t0 = now + 0.04 + Math.max(0, delay || 0);
    var prev = this.jp;
    if (prev) {
      prev.fade(0, now, 0.15); prev.on = false;
      setTimeout(function () { prev.kill(); }, 400);
    }
    var p = new Player(this, id, this.master), S = p.song;
    p.out.gain.setValueAtTime(p.full, now);
    p.lv = { v0: p.full, v1: p.full, t0: 0, t1: 0 };
    p.begin(t0, 0);
    p.fill(t0 + S.total * S.sd + 1);
    this.jp = p;
    var end = t0 + S.total * S.sd, back = end - S.sd * 8, g = this.music.gain, self = this;
    if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now); else g.cancelScheduledValues(now);
    g.setTargetAtTime(DUCK, now, DUCK_IN);
    g.setTargetAtTime(1, Math.max(now + 0.2, back), DUCK_BACK);
    setTimeout(function () { p.kill(); if (self.jp === p) self.jp = null; }, (end - now + JINGLE_TAIL) * 1000);
    return end - now;
  };
  var eng = null, own = null, vol = DEFAULT_VOL, mutedFlag = false, stopped = false;
  var timer = null, active = false, want = null, wantT = 0, warmed = false, listening = false;
  var lite = !!(typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 2);
  function sharedCtx() {
    try {
      if (QT.Sfx && typeof QT.Sfx.ctx === 'function') { var c = QT.Sfx.ctx(); if (c) return c; }
    } catch (e) { }
    if (!own) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) own = new AC();
      } catch (e2) { own = null; }
    }
    return own;
  }
  function resume() {
    stopped = false;
    if (!eng) {
      var c = sharedCtx();
      if (!c) return;
      eng = new Engine(c);
    }
    var ctx = eng.ctx;
    if (ctx.state !== 'running' && ctx.resume) { try { ctx.resume(); } catch (e) { } }
    if (!warmed) {
      warmed = true;
      var ids = Object.keys(SONGS).concat(Object.keys(JINGLES)), wi = 0;
      var warm = function () { if (wi < ids.length) { try { song(ids[wi++]); } catch (e) { } setTimeout(warm, 250); } };
      setTimeout(warm, 50);
    }
    kick(ctx);
    if (!listening && typeof document !== 'undefined' && document.addEventListener) {
      listening = true;
      ['touchend', 'pointerup', 'mouseup', 'click', 'keydown'].forEach(function (ev) {
        document.addEventListener(ev, unlock, true);
      });
    }
  }
  function kick(ctx) {
    try {
      var b = ctx.createBuffer(1, 1, ctx.sampleRate), s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
    } catch (e) { }
  }
  function unlock() {
    if (!eng || stopped) return;
    var ctx = eng.ctx;
    if (ctx.state === 'running' || ctx.state === 'closed' || !ctx.resume) return;
    try { ctx.resume(); } catch (e) { }
    kick(ctx);
  }
  function isMuted() {
    return mutedFlag || !!(QT.Sfx && QT.Sfx.isMuted && QT.Sfx.isMuted());
  }
  function tick() { if (eng && active) eng.tick(LOOKAHEAD); }
  function startTimer() { if (!timer) timer = setInterval(tick, TICK_MS); }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function pause() {
    if (!active) return;
    active = false;
    stopTimer();
    if (eng) eng.setMaster(0, 0.05);
  }
  function unpause() {
    if (active) return;
    active = true;
    eng.rewind();
    eng.setMaster(vol, 0.12);
    startTimer();
  }
  function areaOf(S) {
    var W = QT.World;
    if (!W || !W.roomAtPx || !S.player) return null;
    var id = W.roomAtPx(S.player.x, S.player.y);
    return id === 'ave' ? null : id;
  }
  var NEAR = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function nearSong(S) {
    var W = QT.World, T = (W && W.TILE) || TILE, G = QT.G, closed = null;
    if (!W || !W.roomAtPx || !S.player) return null;
    for (var r = 1; r <= 5; r++) {
      for (var k = 0; k < NEAR.length; k++) {
        var id = W.roomAtPx(S.player.x + NEAR[k][0] * r * T, S.player.y + NEAR[k][1] * r * T);
        if (!AREA[id]) continue;
        if (!G || !G.roomOpen || G.roomOpen(id)) return AREA[id];
        if (!closed) closed = AREA[id];
      }
    }
    return closed;
  }
  var hooked = false;
  function hook() {
    var G = QT.G;
    if (hooked || !G || typeof G.on !== 'function') return;
    hooked = true;
    G.on('rideStart', function (r) { if (isRail(r)) playStation(r.from, 0); });
    G.on('rideEnd', function (r) { if (isRail(r)) playStation(r.to, 0.55); });
  }
  function isRail(r) { return !!r && (r.mode === 'train' || r.mode === 'subway' || r.mode === 'metro'); }
  function riding() {
    var T = QT.Sim && QT.Sim.travel;
    try { return !!(T && T.riding && T.riding()); } catch (e) { return false; }
  }
  var OLD_ST = { st_shibuya: 'shibuya', st_futako: 'futako', st_ueno: 'hongo', st_ariake: 'ariake', st_fab: 'fab',
                 st_shinagawa: 'minato', st_inzai: 'inzai', st_shinjuku: 'shinjuku', st_otemachi: 'otemachi' };
  function jingleOf(x) {
    if (!x) return null;
    if (typeof x === 'object') return jingleOf(x.id || x.dist || x.district);
    if (typeof x !== 'string') return null;
    if (OLD_ST[x]) x = OLD_ST[x];
    return JINGLES[x] ? x : null;
  }
  function playStation(x, delay) {
    var id = jingleOf(x);
    if (!id || !eng || stopped || isMuted() || !active || eng.ctx.state !== 'running') return 0;
    return eng.jingle(id, delay);
  }
  var retryAt = 0;
  function update(S, dt) {
    hook();
    if (QT.Sfx && QT.Sfx.hook) QT.Sfx.hook();
    if (!eng || stopped || !S) return;
    var hidden = typeof document !== 'undefined' && document.hidden, st = eng.ctx.state;
    if (st !== 'running' && st !== 'closed' && !hidden && !isMuted() && eng.ctx.resume) {
      var nowMs = Date.now();
      if (nowMs > retryAt) { retryAt = nowMs + 1000; try { eng.ctx.resume(); } catch (e) { } }
    }
    var ok = !isMuted() && !hidden && st === 'running';
    if (!ok) { pause(); return; }
    var id = AREA[areaOf(S)] || (eng.cur ? eng.cur.id : (nearSong(S) || 'town'));
    if (eng.cur && riding()) id = eng.cur.id;
    if (!eng.cur || (!active && id !== eng.cur.id)) {
      eng.switchTo(id);
      want = null;
    } else if (id !== eng.cur.id) {
      if (id === want) wantT += dt || 0; else { want = id; wantT = 0; }
      if (wantT >= SWITCH_DELAY) { eng.switchTo(id); want = null; }
    } else want = null;
    unpause();
    tick();
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  }
  function renderOffline(id, seconds, opts) {
    opts = opts || {};
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.reject(new Error('OfflineAudioContext が無い'));
    try {
      var sr = opts.sampleRate || 44100;
      var c = new OAC(2, Math.ceil(seconds * sr), sr), E = new Engine(c), p = new Player(E, id);
      E.master.gain.value = opts.volume == null ? DEFAULT_VOL : opts.volume;
      E.lite = !!opts.lite;
      p.out.gain.value = p.full; p.lv = { v0: p.full, v1: p.full, t0: 0, t1: 0 };
      if (opts.mute) { p.mute = {}; opts.mute.forEach(function (k) { p.mute[k] = true; }); }
      p.begin(0, opts.step || 0);
      var AH = 1.0, ST = 0.5;
      p.fill(Math.min(seconds, AH));
      if (c.suspend && seconds > AH + ST) {
        for (var ts = ST; ts < seconds - ST; ts += ST) (function (ts) {
          c.suspend(ts).then(function () { p.fill(Math.min(seconds, ts + AH)); c.resume(); });
        })(ts);
      } else p.fill(seconds);
    } catch (e) { return Promise.reject(e); }
    return new Promise(function (res, rej) {
      c.oncomplete = function (ev) { res(ev.renderedBuffer); };
      var r = c.startRendering();
      if (r && r.then) r.then(res, rej);
    });
  }
  function info(id) {
    var S = song(id), D = S.def;
    return { id: id, title: D.title, bpm: D.bpm, key: D.key, bars: S.total / 16,
             loopStart: S.loop * S.sd, loopEnd: S.total * S.sd, sections: S.secs };
  }
  var SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function tr(lines, k) {
    return lines.map(function (b) {
      return b && b.replace(/[A-G][#b]?-?\d/g, function (t) {
        var n = noteNum(t) + k;
        return SHARP[n % 12] + (Math.floor(n / 12) - 1);
      });
    });
  }
  var TOWN_A = [
    'C5 - - E5 G5 - - E5 C6 - - - G5 - - -',
    'B4 - - D5 G5 - - D5 B5 - - - A5 - G5 -',
    'A4 - - C5 E5 - - C5 A5 - - - G5 - E5 -',
    'G5 - - - E5 - - - D5 - - - . . D5 E5',
    'F5 - - A5 C6 - - A5 G5 - - - F5 - E5 -',
    'E5 - - G5 C6 - - G5 E5 - - - C5 - - -',
    'D5 - - F5 A5 - - F5 C6 - - - A5 - F5 -',
    'G5 - - - B5 - - - D6 - - - . . . .'];
  var TOWN_B = [
    'A5 - A5 - C6 - - A5 - - G5 - A5 - - -',
    'B5 - B5 - D6 - - B5 - - A5 - B5 - - -',
    'G5 - G5 - B5 - - D6 - - C6 - B5 - - -',
    'C6 - - - B5 - - - A5 - - - . . . .',
    'A5 - A5 - C6 - - A5 - - G5 - F5 - - -',
    'B5 - B5 - D6 - - B5 - - D6 - F6 - - -',
    'E6 - - - D6 - - C6 - - - - D6 - - -',
    'C6 - - - - - - - . . . . . . . .'];
  var TOWN = {
    title: '商店街の昼', key: 'C major', bpm: 124, swing: 0, level: -0.3,
    delay: { beats: 0.75, fb: 0.3, wet: 0.5, lp: 3500 },
    inst: {
      lead: { role: 'line', wave: 'pulse25', gain: 0.13, a: 0.004, d: 0.25, s: 0.6, r: 0.07, vib: 12, send: 0.16, lp: 6000 },
      comp: { role: 'chord', wave: 'pulse25', gain: 0.065, a: 0.003, d: 0.5, s: 0, r: 0.03, center: 67, voices: 3, pan: -0.25, lp: 4500 },
      arp:  { role: 'arp', wave: 'pulse25', gain: 0.07, a: 0.003, d: 0.45, s: 0, r: 0.03, center: 62, pan: 0.3, send: 0.2, lp: 5000 },
      pad:  { role: 'chord', wave: 'triangle', gain: 0.05, a: 0.2, d: 0.6, s: 0.7, r: 0.5, center: 64, voices: 3, pan: -0.1 },
      bass: { role: 'bass', wave: 'square', gain: 0.1, a: 0.004, d: 0.18, s: 0.5, r: 0.04, lo: 36, lp: 1100, gate: 0.8 }
    },
    kit: { kick: { gain: 0.75 }, snare: { gain: 0.26 }, hat: { gain: 0.07 } },
    pat: {
      bI: ['', '', 'R.8.R.8.R.8.R.8.', 'R.8.R.8.R.8.5.A.'],
      bA: 'R.8.R.8.R.8.R.5.',
      bB: 'R.R.8.R.R.R.8.5.',
      bC: 'R-------5-------',
      cA: '..x...x...x...x.',
      cB: '..x...x...x..xx.',
      aI: '0.2.4.2.1.3.5.3.',
      aB: '0123432101234321',
      pC: 'x---------------'
    },
    drums: {
      dI: { h: ['x.x.x.x.x.x.x.x.'], k: ['', '', 'x...x...x...x...', 'x...x...x...x...'] },
      fI: { k: 'x...x...x...x...', s: '............gxxX', h: 'x.x.x.x.x.x.....' },
      dA: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.xgx.x.x.xgx.x.' },
      fA: { k: 'x.......x.......', s: '....x.....x.xgxX', h: 'x.x.x.x.x.......' },
      dB: { k: 'x...x...x...x...', s: '....x.......x...', h: 'xgxgxgxgxgxgxgxg', o: '..............x.' },
      fB: { k: 'x...x...x...x...', s: '....x...xgxgxxXX', h: 'xgxgxgxg........' },
      dC: { k: 'x.........x.....', s: '........x.......', h: 'x...x...x...x...' },
      fC: { k: 'x.........x.....', s: '........xxxxXXXX', h: 'x...x...........' }
    },
    sections: {
      I: { chords: 'C | Am | F | G7', parts: { arp: 'aI', bass: 'bI', drums: 'dI' }, fill: 'fI',
           notes: { lead: [null, null, null, '. . . . G4 A4 B4 D5'] } },
      A: { chords: 'C | G/B | Am | Em/G | F | C/E | Dm7 | G7', crash: true,
           parts: { comp: 'cA', bass: 'bA', drums: 'dA' }, fill: 'fA', notes: { lead: TOWN_A } },
      B: { chords: 'F | G | Em7 | Am | Dm7 | G | C | C', crash: true,
           parts: { comp: 'cB', arp: 'aB', bass: 'bB', drums: 'dB' }, fill: 'fB', notes: { lead: TOWN_B } },
      C: { chords: 'Am | F | C | G | Am | F | Dm7 | G7',
           parts: { pad: 'pC', bass: 'bC', drums: 'dC' }, fill: 'fC', riser: 1,
           notes: { lead: [
             'E5 - A5 B5', 'C6 - A5 -', 'G5 - E5 G5', 'D5 - - -',
             'E5 - A5 B5', 'C6 - D6 E6', 'D6 - C6 A5', 'G5 A5 B5 C6 D6 E6 F6 G6'] } },
      A2: { from: 'A', chords: 'C | G/B | Am | Em/G | F | C/E | Dm7 | Em7 A7', parts: { arp: 'aI' },
            notes: { lead: TOWN_A.slice(0, 7).concat(['G5 - - - B5 - - - C#6 - - - E6 - - -']) } },
      B2: { from: 'B', chords: 'G | A | F#m7 | Bm | Em7 | A | D | G7',
            notes: { lead: tr(TOWN_B.slice(0, 7), 2).concat(['D6 - - - B5 - - - G5 - - - F5 - D5 -']) } }
    },
    form: ['I', 'A', 'B', 'C', 'A2', 'B2'], loop: 1
  };
  var OFFICE = {
    title: 'スタートアップ・グルーヴ', key: 'F major', bpm: 114, swing: 0.2, level: 0.4,
    delay: { beats: 0.75, fb: 0.35, wet: 0.55, lp: 2800 },
    inst: {
      lead:  { role: 'line', wave: 'square', gain: 0.11, a: 0.005, d: 0.5, s: 0.35, r: 0.12, cut: 900, cutEnv: 2600, cutDec: 0.18, q: 2, send: 0.28, vib: 8 },
      ep:    { role: 'chord', fm: 1, idx: 1.6, idxEnd: 0.15, idxDec: 0.35, gain: 0.048, a: 0.004, d: 1.6, s: 0.25, r: 0.25, center: 64, voices: 4, pan: -0.15, send: 0.1, hp: 40 },
      bleep: { role: 'arp', wave: 'pulse25', gain: 0.14, a: 0.002, d: 0.3, s: 0, r: 0.02, center: 79, pan: 0.35, send: 0.4, gate: 0.5 },
      bass:  { role: 'bass', wave: 'sawtooth', gain: 0.085, a: 0.006, d: 0.3, s: 0.6, r: 0.06, lo: 36, cut: 420, cutEnv: 700, cutDec: 0.12, q: 1.5, sub: 0.9 }
    },
    kit: { kick: { gain: 0.65, f0: 140, dec: 0.28 }, snare: { gain: 0.2, hp: 1800, dec: 0.1, tone: 330, toneGain: 0.3 },
           hat: { gain: 0.06 }, ohat: { gain: 0.05, dec: 0.2 } },
    pat: {
      bI: ['R-------5-------', 'R-------5-------', 'R--..R-.5--..87.', 'R--..R-.5--..87.'],
      bA: ['R--..R-.5--..85.', 'R--..R-.5--..87.', 'R--..R-.5--..87.', 'R--..R-.5--..87.'],
      bB: 'R-.R..R.5-.5..8.',
      bC: 'R-------R-------',
      eA: 'X-----x-------x-',
      eB: 'X-----x-X-----x-',
      eC: 'X---------------',
      pA2: ['0.1.............', '', '', '............2.3.', '0.1.............', '', '', '........0.1.2.3.'],
      pB2: ['', '', '', '........3.2.1.0.', '', '', '', ''],
      pC: '0.4.2.5.3.6.4.7.'
    },
    drums: {
      dI: { h: 'x.gxx.gxx.gxx.gx', k: ['', '', 'x.....x...x.....', 'x.....x...x.....'], s: ['', '', '....x.......x...', '....x.......x...'] },
      dA: { k: 'x.....x...x.....', s: '....x.......x...', h: 'x.gxx.gxx.gxx.gx' },
      fA: { k: 'x.....x...x.....', s: '....x.......x.gx', h: 'x.gxx.gxx.gx....', o: '............x...' },
      dB: { k: 'x.....x.x.x.....', s: '....x.......x...', h: 'xgxgxgxgxgxgxgxg', o: '..............x.' },
      fB: { k: 'x.....x.x.......', s: '....x.......xgxX', h: 'xgxgxgxgxgxg....' },
      dC: { k: 'x...............', s: '........x.......', h: 'x.gxx.gxx.gxx.gx' },
      fC: { k: 'x.....x.x.x.x.x.', s: '....x...x.xgxxXX', h: 'xgxgxgxg........' }
    },
    sections: {
      I: { chords: 'Bbmaj7 | A7 | Dm7 | Cm7 F7', parts: { ep: 'eA', bass: 'bI', drums: 'dI' } },
      A: { chords: 'Bbmaj7 | A7 | Dm7 | Cm7 F7 | Bbmaj7 | A7 | Dm7 | Dm7', crash: 0.6,
           parts: { ep: 'eA', bass: 'bA', drums: 'dA' }, fill: 'fA',
           notes: { lead: [
             '. . . . A5 - - C6 - - A5 - G5 - F5 -',
             'E5 - - - - - . . C#5 - E5 - G5 - - -',
             'F5 - - - - - . . A5 - C6 - D6 - - -',
             'Eb6 - - - D6 - C6 - A5 - - - . . . .',
             '. . . . A5 - - C6 - - A5 - G5 - F5 -',
             'E5 - - - G5 - - - A5 - C#6 - E6 - - -',
             'D6 - - - C6 - - - A5 - - - F5 - - -',
             'D5 - - - - - - - . . . . . . . .'] } },
      B: { chords: 'Gm7 | C7 | Am7 | Dm7 | Gm7 | C7 | Fmaj7 | F7', crash: 0.7,
           parts: { ep: 'eB', bass: 'bB', drums: 'dB' }, fill: 'fB',
           notes: { lead: [
             'D6 - - C6 - - Bb5 - A5 - - - G5 - - -',
             'E5 - - - G5 - - - Bb5 - - - A5 - G5 -',
             'C6 - - - - - E6 - - - D6 - C6 - - -',
             'A5 - - - - - - - . . . . . . . .',
             'D6 - - C6 - - Bb5 - A5 - - - G5 - - -',
             'E6 - - - D6 - - - C6 - - - Bb5 - - -',
             'A5 - - - - - - - C6 - - - E6 - - -',
             'F6 - - - - - - - Eb6 - - - C6 - - -'] } },
      C: { chords: 'Dm9 | Bbmaj7 | Gm9 | A7 | Dm9 | Bbmaj7 | Gm7 | C7sus4 C7',
           parts: { ep: 'eC', bass: 'bC', bleep: 'pC', drums: 'dC' }, fill: 'fC', riser: 1 },
      A2: { from: 'A', parts: { bleep: 'pA2' } },
      B2: { from: 'B', parts: { bleep: 'pB2' } }
    },
    form: ['I', 'A', 'B', 'C', 'A2', 'B2'], loop: 1
  };
  var RIFF = [
    'E5 - . E5 G5 - . E5 B5 - . A5 G5 - E5 -',
    'E5 - . E5 G5 - . E5 D6 - . B5 A5 - G5 -',
    'E5 - . E5 G5 - . E5 C6 - . B5 G5 - E5 -',
    'F#5 - . F#5 A5 - . F#5 D6 - . C6 B5 - A5 -'];
  var FACTORY_B = [
    'E6 - - - - - D6 - - - B5 - - - - -',
    'A5 - - - - - B5 - - - D6 - - - - -',
    'E6 - - - - - D6 - - - B5 - - - G5 -',
    'B5 - - - - - - - . . . . E5 G5 A5 B5',
    'E6 - - - - - D6 - - - E6 - - - G6 -',
    'F#6 - - - - - E6 - - - D6 - - - A5 -',
    'B5 - - - - - D#6 - - - F#6 - - - A6 -',
    'F#6 - - - - - - - D#6 - - - B5 - - -'];
  var FACTORY = {
    title: '組立ライン', key: 'E minor', bpm: 126, swing: 0, level: -1,
    delay: { beats: 0.75, fb: 0.3, wet: 0.45, lp: 3000 },
    pumpDepth: 0.3,
    inst: {
      lead: { role: 'line', wave: 'sawtooth', uni: 2, det: 9, gain: 0.085, a: 0.004, d: 0.25, s: 0.55, r: 0.07, lp: 2800, lpq: 2, send: 0.18, vib: 10 },
      pad:  { role: 'chord', wave: 'sawtooth', uni: 2, det: 14, gain: 0.03, a: 0.04, d: 0.5, s: 0.8, r: 0.25, center: 62, voices: 3, lp: 1900, pan: -0.15 },
      stab: { role: 'chord', power: true, wave: 'square', gain: 0.04, a: 0.003, d: 0.45, s: 0, r: 0.03, center: 55, lp: 1600, pan: 0.2 },
      bass: { role: 'bass', wave: 'sawtooth', gain: 0.1, a: 0.003, d: 0.12, s: 0.4, r: 0.03, lo: 33, cut: 300, cutEnv: 1800, cutDec: 0.09, q: 3, sub: 0.7, gate: 0.85 }
    },
    kit: { kick: { gain: 0.85, f0: 180, f1: 48, dec: 0.3 }, clap: { gain: 0.26 }, snare: { gain: 0.24 },
           hat: { gain: 0.065 }, ohat: { gain: 0.06, dec: 0.2 }, metal: { gain: 0.05 } },
    pat: {
      bI: ['R-------R-------', 'R-------R-------', '.RRR.RRR.RRR.RRR', '.RRR.RRR.R8R.5R5'],
      bA: '.RRR.RRR.RRR.R8R',
      bB: '.R8R.R8R.R8R.R8R',
      bC: ['R---------------', 'R---------------', 'R---------------', 'R-------R-------',
           '.RRR.RRR.RRR.R8R', '.RRR.RRR.RRR.R8R', '.RRR.RRR.RRR.R8R', '.R8R.R8R.R8R.R8R'],
      pB: 'x---------------',
      pC: 'x---------------',
      sA: ['', '', '', 'x..x..x.........'],
      sA2: ['x..x..x.........', '', 'x..x..x.........', 'x..x..x...x.x...']
    },
    drums: {
      dI: { k: 'x...x...x...x...', h: '..x...x...x...x.', m: ['', '', 'x..x..x.........', 'x..x..x...x.x...'] },
      dA: { k: 'x...x...x...x...', c: '....x.......x...', h: 'gxgxgxgxgxgxgxgx', m: 'x..x..x...x..x..' },
      fA: { k: 'x...x...x...x...', c: '....x.......x...', s: '..........g.xxXX', h: 'gxgxgxgxgxgx....', m: 'x..x..x.........' },
      dB: { k: 'x...x...x...x...', c: '....x.......x...', h: 'gxgxgxgxgxgxgxgx', o: '..x...x...x...x.', m: 'x..x..x...x..x..' },
      fB: { k: 'x...x...x...x...', c: '....x.......x...', s: '........gxgxxxXX', h: 'gxgxgxgx........', o: '..x...x.........' },
      dC: { k: ['x...............', 'x...............', 'x...............', 'x.......x.......',
                'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...'],
            h: ['', '', '', '', 'gxgxgxgxgxgxgxgx', 'gxgxgxgxgxgxgxgx', 'gxgxgxgxgxgxgxgx', 'gxgxgxgxgxgxgxgx'],
            c: ['', '', '', '', '....x.......x...', '....x.......x...', '', ''],
            s: ['', '', '', '', '', '', 'g.g.g.g.x.x.x.x.', 'xxxxxxxxXXXXXXXX'],
            m: ['x..x..x.........', 'x..x..x.........', 'x..x..x.........', 'x..x..x.........', '', '', '', ''] }
    },
    sections: {
      I: { chords: 'Em | Em | C | D', parts: { bass: 'bI', drums: 'dI' }, riser: 2 },
      A: { chords: 'Em | Em | C | D | Em | Em | C | D', crash: true,
           parts: { bass: 'bA', stab: 'sA', drums: 'dA' }, fill: 'fA',
           notes: { lead: RIFF.concat([RIFF[0], RIFF[1],
             'G5 - . G5 C6 - . G5 E6 - . D6 C6 - G5 -',
             'A5 - . A5 D6 - . A5 F#6 - . E6 D6 - . .']) } },
      B: { chords: 'C | D | Em | Em | C | D | B7 | B7', crash: true, pump: ['pad'],
           parts: { pad: 'pB', bass: 'bB', drums: 'dB' }, fill: 'fB', notes: { lead: FACTORY_B } },
      C: { chords: 'Am | Em | C | D | Am | Em | C | D', sweep: [600, 20000], riser: 2,
           parts: { pad: 'pC', bass: 'bC', drums: 'dC' },
           notes: { lead: [null, null, null, null,
             'E5 - . E5 G5 - . E5 B5 - . A5 G5 - E5 -', RIFF[1], RIFF[2], RIFF[3]] } },
      A2: { from: 'A', parts: { stab: 'sA2' } },
      B2: { from: 'B', chords: 'D | E | F#m | F#m | D | E | C#7 | F#m7 B7', parts: { stab: 'x..x..x...x..x..' },
            notes: { lead: tr(FACTORY_B.slice(0, 7), 2).concat(['A6 - - - - - F#6 - - - D#6 - - - B5 -']) } }
    },
    form: ['I', 'A', 'B', 'C', 'A2', 'B2'], loop: 1
  };
  var CRYO_B = [
    'D6 - B5 - D6 - E6 -', 'E6 - C#6 - - - A5 -', 'A5 - C#6 - E6 - F#6 -', 'D6 - - - C#6 - B5 -',
    'D6 - B5 - D6 - E6 -', 'E6 - C#6 - E6 - A6 -', 'F#6 - - - E6 - D6 -', 'E6 - - - - - - -'];
  var CRYO = {
    title: '絶対零度のきらめき', key: 'D major (lydian)', bpm: 100, swing: 0, level: 3.5,
    delay: { beats: 0.75, fb: 0.4, wet: 0.65, lp: 4200 },
    lines: { B: CRYO_B },
    inst: {
      lead:  { role: 'line', fm: 4, idx: 1.4, idxEnd: 0.08, idxDec: 0.25, gain: 0.1, a: 0.004, d: 1.4, s: 0.12, r: 0.4, send: 0.4, pan: 0.05 },
      bell:  { role: 'line', fm: 2, idx: 0.8, idxEnd: 0.1, idxDec: 0.4, oct: -1, gain: 0.05, a: 0.006, d: 1.6, s: 0.15, r: 0.5, send: 0.3, pan: -0.2 },
      glass: { role: 'arp', fm: 3.5, idx: 0.9, idxEnd: 0.1, idxDec: 0.15, gain: 0.042, a: 0.003, d: 0.9, s: 0, r: 0.3, center: 68, pan: 0.3, send: 0.4 },
      pad:   { role: 'chord', wave: 'sawtooth', uni: 2, det: 12, gain: 0.022, a: 0.7, d: 1.2, s: 0.8, r: 1.0, center: 62, voices: 4, lp: 1300, pan: -0.25 },
      bass:  { role: 'bass', wave: 'triangle', gain: 0.07, a: 0.03, d: 0.8, s: 0.7, r: 0.3, lo: 38, sub: 0.4 }
    },
    kit: { kick: { gain: 0.5, f0: 120, f1: 45, dec: 0.35 }, clap: { gain: 0.14, dec: 0.25 },
           hat: { gain: 0.045, dec: 0.035, hp: 9000 }, crash: { gain: 0.05, dec: 2.2 }, riser: { gain: 0.035 } },
    pat: {
      bI: 'R---------------',
      bA: 'R-------------5-',
      bB: 'R-------R---5---',
      bC: 'R---------------',
      aI: '0.2.4.5.6.5.4.2.',
      aA: '0124542101245421',
      aB: '0246542313576431',
      aC: '5.3.4.2.3.1.2.0.',
      pP: 'x---------------'
    },
    drums: {
      dI: { h: ['', '', 'g.g.g.g.g.g.g.g.', 'g.g.g.g.g.g.x.x.'] },
      dA: { k: 'x.......x.......', h: 'g.xgg.xgg.xgg.xg' },
      dA2: { k: 'x.......x.......', c: '............g...', h: 'g.xgg.xgg.xgg.xg' },
      dB: { k: 'x.....x.x.......', c: '....x.......x...', h: 'gxgxgxgxgxgxgxgx' },
      fB: { k: 'x.....x.x.......', c: '....x.......x...', h: 'gxgxgxgxgxgx....', t: '............x...', u: '..............x.' },
      dC: { h: 'g...g...g...g...' }
    },
    sections: {
      I: { chords: 'Dmaj7 | E/D | Dmaj7 | E/D', parts: { pad: 'pP', glass: 'aI', bass: 'bI', drums: 'dI' }, riser: 1 },
      A: { chords: 'Dmaj7 | E/D | C#m7 | F#m7 | Bm7 | E | Gmaj7 | Asus4 A', crash: 0.7,
           parts: { pad: 'pP', glass: 'aA', bass: 'bA', drums: 'dA' }, riser: 1,
           notes: { lead: [
             'F#5 - A5 - C#6 - - -', 'B5 - G#5 - E5 - - -', 'E5 - G#5 - B5 - C#6 -', 'A5 - - - - - - -',
             'D6 - C#6 - B5 - F#5 -', 'G#5 - - - B5 - E6 -', 'F#6 - - - D6 - B5 -', 'D6 - - - C#6 - - -'] } },
      B: { chords: 'Gmaj7 | A | F#m7 | Bm7 | Gmaj7 | A | Bm7 | Asus4 A', crash: 0.8,
           parts: { pad: 'pP', glass: 'aB', bass: 'bB', drums: 'dB' }, fill: 'fB', notes: { lead: 'B' } },
      C: { chords: 'Bm9 | Gmaj7 | Dmaj7 | A/C# | Bm9 | Gmaj7 | Em9 | Asus4 A', riser: 1,
           parts: { pad: 'pP', glass: 'aC', bass: 'bC', drums: 'dC' },
           notes: { lead: ['C#6 - - -', 'B5 - F#6 -', 'A5 - - -', 'E6 - C#6 -',
                           'D6 - C#6 -', 'B5 - D6 -', 'G6 - F#6 -', 'E6 - - -'] } },
      A2: { from: 'A', parts: { glass: 'aB', drums: 'dA2' } },
      B2: { from: 'B', notes: { lead: 'B', bell: 'B' } }
    },
    form: ['I', 'A', 'B', 'C', 'A2', 'B2'], loop: 1
  };
  var HQ_A = [
    'E5 - - G5 - - A5 - - - C6 - A5 - G5 -',
    'F#5 - - - E5 - - - D5 - - - . . . .',
    'E5 - - G5 - - A5 - - - C6 - D6 - E6 -',
    'F#6 - - - E6 - - - C6 - - - A5 - - -',
    'A5 - - - C6 - - E6 - - - C6 - - A5 -',
    'B5 - - - D6 - - G6 - - - D6 - - B5 -',
    'A5 - - - B5 - - - A5 - - - . . . .',
    'G#5 - - - B5 - - - D6 - - - E6 - - -'];
  var HQ_B = [
    'E6 - E6 - E6 - D6 - - - C6 - - - A5 -',
    'D6 - D6 - D6 - C6 - - - B5 - - - G5 -',
    'B5 - B5 - B5 - C6 - - - D6 - - - E6 -',
    'C6 - - - - - - - . . . . C6 - D6 -',
    'F6 - F6 - F6 - E6 - - - D6 - - - C6 -',
    'D6 - D6 - D6 - E6 - - - F6 - - - G6 -',
    'E6 - - - - - - - B5 - - - C6 - D6 -',
    'E6 - - - - - - - D6 - - - B5 - G#5 -'];
  var HQ = {
    title: 'ネオン・カジノ', key: 'A minor / C major', bpm: 128, swing: 0, level: -0.6,
    delay: { beats: 0.75, fb: 0.35, wet: 0.55, lp: 3800 },
    pumpDepth: 0.3,
    lines: { A: HQ_A, B: HQ_B },
    inst: {
      lead:    { role: 'line', wave: 'sawtooth', uni: 2, det: 11, gain: 0.08, a: 0.008, d: 0.35, s: 0.7, r: 0.12, lp: 3600, lpq: 1, vib: 14, send: 0.22 },
      chip:    { role: 'line', wave: 'pulse25', oct: 1, gain: 0.04, a: 0.004, d: 0.2, s: 0.5, r: 0.06, pan: 0.25, send: 0.2, lp: 5000 },
      strings: { role: 'chord', wave: 'sawtooth', uni: 2, det: 14, gain: 0.024, a: 0.1, d: 0.6, s: 0.85, r: 0.35, center: 67, voices: 4, lp: 3000, pan: -0.2 },
      brass:   { role: 'chord', wave: 'sawtooth', uni: 2, det: 7, gain: 0.034, a: 0.012, d: 0.3, s: 0.35, r: 0.08, center: 63, voices: 3, triad: true, cut: 800, cutEnv: 2600, cutDec: 0.22, q: 1.5, pan: 0.1 },
      keys:    { role: 'chord', wave: 'pulse25', gain: 0.05, a: 0.002, d: 0.35, s: 0, r: 0.03, center: 64, voices: 3, lp: 2600, pan: -0.3, gate: 0.7 },
      glitter: { role: 'arp', wave: 'triangle', gain: 0.035, a: 0.002, d: 0.5, s: 0, r: 0.03, center: 97, pan: 0.35, send: 0.35, gate: 0.6, lp: 6000 },
      bass:    { role: 'bass', wave: 'sawtooth', gain: 0.1, a: 0.003, d: 0.14, s: 0.45, r: 0.03, lo: 33, cut: 380, cutEnv: 1600, cutDec: 0.12, q: 4, sub: 0.7, gate: 0.8 }
    },
    kit: { kick: { gain: 0.85, f0: 170, f1: 48, dec: 0.3 }, clap: { gain: 0.3, send: 0.15 }, snare: { gain: 0.22 },
           hat: { gain: 0.06 }, ohat: { gain: 0.07, dec: 0.22 }, crash: { gain: 0.09 }, metal: { gain: 0.035 } },
    pat: {
      bA: 'R.8.R.8.R.8.R.8.',
      bB: 'R.8.R.8.R.8.R.85',
      bC: ['R---------------', 'R---------------', 'R---------------', 'R---------------',
           'R.8.R.8.R.8.R.8.', 'R.8.R.8.R.8.R.8.', 'R.8.R.8.R.8.R.8.', 'R.8.R.8.R.8.R.85'],
      kA: '..x..x....x..x.x',
      sB: 'x-------x-------',
      sC: 'x---------------',
      rA: ['', '', '', '', 'X..x..x...x.....', 'X..x..x...x.....', 'X-------........', 'X..x..x.X.......'],
      rB: 'X.........x.....',
      gA2: '0123432101234321',
      gB: '0213243102132431',
      gC: '0.2.4.3.1.3.2.1.'
    },
    drums: {
      dI: { k: 'x...x...x...x...', h: 'xg.gxg.gxg.gxg.g', o: ['', '', '..x...x...x...x.', '..x...x...x...x.'] },
      dA: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xg.gxg.gxg.gxg.g', o: '..x...x...x...x.' },
      fA: { k: 'x...x...x...x...', c: '....x.......x...', s: '............xxXX', h: 'xg.gxg.gxg.g....', o: '..x...x...x.....' },
      dB: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xg.gxg.gxg.gxg.g', o: '..x...x...x...x.', m: '..x..x....x..x..' },
      dB2: { k: 'x...x...x...x...', c: '....x.......x...', h: 'xgxgxgxgxgxgxgxg', o: '..x...x...x...x.', m: '..x..x....x..x..' },
      fB: { k: 'x...x...x...x...', c: '....x.......x...', s: '........gxgxxxXX', h: 'xg.gxg.g........', o: '..x...x.........' },
      dC: { k: ['x...............', '', 'x...............', '', 'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...'],
            h: ['g.g.g.g.g.g.g.g.', 'g.g.g.g.g.g.g.g.', 'g.g.g.g.g.g.g.g.', 'g.g.g.g.g.g.g.g.',
                'xg.gxg.gxg.gxg.g', 'xg.gxg.gxg.gxg.g', 'xg.gxg.gxg.gxg.g', 'xg.gxg.gxg.gxg.g'],
            o: ['', '', '', '', '..x...x...x...x.', '..x...x...x...x.', '', ''],
            c: ['', '', '', '', '....x.......x...', '....x.......x...', '....x.......x...', ''],
            s: ['', '', '', '', '', '', 'g.g.g.g.x.x.x.x.', 'xxxxxxxxXXXXXXXX'] }
    },
    sections: {
      I: { chords: 'Am7 | D9 | Am7 | D9', sweep: [350, 20000], riser: 2, parts: { bass: 'bA', drums: 'dI' } },
      A: { chords: 'Am7 | D9 | Am7 | D9 | Fmaj7 | G | E7sus4 | E7', crash: true,
           parts: { bass: 'bA', keys: 'kA', brass: 'rA', drums: 'dA' }, fill: 'fA', notes: { lead: 'A' } },
      B: { chords: 'Fmaj7 | G | Em7 | Am7 | Dm7 | G | Cmaj7 | E7', crash: true, pump: ['strings'],
           parts: { bass: 'bB', strings: 'sB', brass: 'rB', glitter: 'gB', drums: 'dB' }, fill: 'fB',
           notes: { lead: 'B' } },
      C: { chords: 'Fmaj7 | G | Am7 | Am7 | Fmaj7 | G | E7sus4 | E7', riser: 2, pump: ['strings'],
           parts: { bass: 'bC', strings: 'sC', glitter: 'gC', drums: 'dC' } },
      A2: { from: 'A', parts: { glitter: 'gA2' } },
      B2: { from: 'B', parts: { glitter: '', drums: 'dB2' }, notes: { lead: 'B', chip: 'B' } }
    },
    form: ['I', 'A', 'B', 'C', 'A2', 'B2'], loop: 1
  };
  var SHITA_A = [
    'D6 D6 E6 D6 B5 - D6 -',
    'E6 G6 E6 D6 E6 - - -',
    'G6 G6 A6 G6 E6 - D6 -',
    'B5 D6 E6 D6 A5 - - -',
    'D6 D6 E6 D6 B5 - D6 -',
    'E6 - G6 E6 D6 - E6 G6',
    'A6 - G6 E6 G6 - E6 -',
    'D6 - - - . . B5 D6'];
  var SHITA_B = [
    'E6 - E6 - D6 - E6 G6',
    'A6 - G6 - E6 - D6 -',
    'D6 - B5 - D6 - E6 -',
    'B5 - - - . . D6 -',
    'E6 - E6 - D6 - E6 G6',
    'A6 - B6 - A6 - G6 -',
    'E6 - D6 - B5 - D6 E6',
    'G6 - - - - - - -'];
  var SHITAMACHI = {
    title: '下町の祭り', key: 'G major pentatonic', bpm: 116, swing: 0.18, level: -1.6,
    delay: { beats: 0.75, fb: 0.28, wet: 0.45, lp: 3200 },
    inst: {
      lead:  { role: 'line', wave: 'triangle', gain: 0.15, a: 0.025, d: 0.3, s: 0.75, r: 0.12, vib: 20, send: 0.22, pan: 0.05 },
      shami: { role: 'arp', wave: 'pulse12', gain: 0.07, a: 0.002, d: 0.25, s: 0, r: 0.03, cut: 1000, cutEnv: 3400, cutDec: 0.05, q: 3, center: 62, pan: -0.3, gate: 0.6 },
      koto:  { role: 'arp', fm: 1, idx: 2.2, idxEnd: 0.1, idxDec: 0.12, gain: 0.05, a: 0.002, d: 1.1, s: 0, r: 0.25, center: 67, pan: 0.3, send: 0.35, hp: 40 },
      pad:   { role: 'chord', wave: 'sawtooth', uni: 2, det: 9, gain: 0.02, a: 0.5, d: 1.0, s: 0.85, r: 0.6, center: 69, voices: 4, lp: 1700, pan: -0.1 },
      bass:  { role: 'bass', wave: 'square', gain: 0.09, a: 0.004, d: 0.25, s: 0.5, r: 0.05, lo: 36, lp: 800, gate: 0.75, sub: 0.6 }
    },
    kit: { kick: { gain: 0.8, f0: 120, f1: 52, pdec: 0.1, dec: 0.5 }, tomL: { gain: 0.45, f0: 165, f1: 100, pdec: 0.06, dec: 0.32 },
           tomH: { gain: 0.26, f0: 330, f1: 260, pdec: 0.03, dec: 0.1 }, metal: { gain: 0.045, dec: 0.1, f: [760, 1140], bp: 2600 },
           clap: { gain: 0.24 }, hat: { gain: 0.05, dec: 0.04 } },
    pat: {
      bI: ['', '', 'R.......5.......', 'R.......5...5.R.'],
      bA: 'R...5...R...5...',
      bB: 'R.R.5...R.R.5.8.',
      bC: 'R-------R-------',
      sI: ['', '', '0.2.1.2.0.2.1.2.', '0.2.1.2.0.2.3.2.'],
      sA: '0.2.1.2.0.2.1.2.',
      sB: '0.1.2.1.3.2.1.2.',
      kI: ['01234567........', '', '01234567........', ''],
      kB: ['', '', '', '........76543210', '', '', '', '........01234567'],
      kC: '0.2.4.3.1.3.2.1.',
      pC: 'x---------------'
    },
    drums: {
      dI: { k: ['x...............', 'x.......x.......', 'x.......x.......', 'x.....x.x.......'],
            t: ['', 'x.g.x.g.x.g.x.g.', 'x.g.x.gxx.g.x.gx', 'x.gxx.gxxxxxXXXX'],
            m: ['', '', 'x..xx...x..xx...', 'x..xx...x..xx...'] },
      dA: { k: 'x.......x.......', u: '....x.......x.x.', t: 'x.g.x.gxx.g.x.gx', m: 'x..xx...x..xx...', h: '..g...g...g...g.' },
      fA: { k: 'x.......x.......', u: '....x.......xxXX', t: 'x.g.x.gxx.gxx...', m: 'x..xx...........' },
      dB: { k: 'x.....x.x.......', u: '....x.......x...', c: '....x.......x...', t: 'x.gxx.gxx.gxx.gx',
            m: 'x..xx...x..xx...', h: 'g.g.g.g.g.g.g.g.' },
      dB2: { k: 'x.....x.x.......', u: '....x.......x...', c: '....x..x....x.x.', t: 'x.gxx.gxx.gxx.gx',
             m: 'x..xx...x..xx...', h: 'gxgxgxgxgxgxgxgx' },
      fB: { k: 'x.....x.x.......', u: '....x...x.x.xxXX', c: '....x...........', t: 'x.gxx.gx........', m: 'x..xx...........' },
      dC: { k: ['x...............', '', 'x...............', '', 'x.......x.......', 'x.....x.x.......', 'x.....x.x.......', 'x.....x.x.......'],
            u: ['', '..........g.g...', '', '..........g.g...', '....x.......x...', '....x.......x...', '....x.x.....x.x.', 'xxxxxxxxXXXXXXXX'],
            t: ['', '', '', '', 'x.g.x.g.x.g.x.g.', 'x.g.x.g.x.g.x.g.', 'x.gxx.gxx.gxx.gx', 'xxxxxxxxxxxxxxxx'],
            m: ['x...............', '', 'x...............', '', 'x..xx...x..xx...', 'x..xx...x..xx...', 'x..xx...x..xx...', ''] }
    },
    sections: {
      I: { chords: 'G | G | C | D', parts: { koto: 'kI', shami: 'sI', bass: 'bI', drums: 'dI' },
           notes: { lead: [null, null, null, '. . . . A5 - B5 -'] } },
      A: { chords: 'G | C | G | D | Em7 | C | Am7 | D', crash: true,
           parts: { shami: 'sA', bass: 'bA', drums: 'dA' }, fill: 'fA', notes: { lead: SHITA_A } },
      B: { chords: 'C | D | Bm7 | Em7 | C | D | G | G', crash: true,
           parts: { shami: 'sB', koto: 'kB', bass: 'bB', drums: 'dB' }, fill: 'fB', notes: { lead: SHITA_B } },
      C: { chords: 'Em7 | C | G | D | Em7 | C | Am7 | D', riser: 1,
           parts: { koto: 'kC', bass: 'bC', drums: 'dC' },
           notes: { lead: ['B5 - D6 -', 'E6 - - -', 'D6 - B5 -', 'A5 - - -',
                           'B5 - D6 -', 'E6 - G6 -', 'A6 - G6 E6', 'D6 E6 G6 A6 G6 E6 D6 B5'] } },
      B2: { from: 'B', chords: 'C | D | Bm7 | Em7 | C | D | Am7 | D7sus4', crash: true,
            parts: { pad: 'pC', drums: 'dB2' },
            notes: { lead: SHITA_B.slice(0, 6).concat(['E6 - D6 - E6 - G6 -', 'A6 - - - G6 - E6 -']) } }
    },
    form: ['I', 'A', 'B', 'C', 'B2'], loop: 1
  };
  var SHARP_PC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function trName(n, k) { return SHARP_PC[(pcOf(n) + k + 120) % 12]; }
  function trChords(str, k) {
    if (!k || !str) return str;
    return str.split('|').map(function (bar) {
      return bar.trim().split(/\s+/).map(function (sym) {
        var m = /^([A-G][#b]?)([^\/]*)(?:\/([A-G][#b]?))?$/.exec(sym);
        if (!m) return sym;
        return trName(m[1], k) + m[2] + (m[3] ? '/' + trName(m[3], k) : '');
      }).join(' ');
    }).join(' | ');
  }
  function trNotes(v, k) {
    if (!k || v == null) return v;
    if (typeof v === 'string') return v;
    return tr(v, k);
  }
  function variant(B, o) {
    var D = {}, k, sh = o.shift || 0;
    for (k in B) D[k] = B[k];
    for (k in o) if (k !== 'inst' && k !== 'kit' && k !== 'drums' && k !== 'shift') D[k] = o[k];
    D.inst = {};
    for (k in B.inst) {
      var ov = o.inst && o.inst[k];
      D.inst[k] = ov && ov.role ? merge(ov, null) : merge(B.inst[k], ov);
    }
    for (k in o.inst || {}) if (!D.inst[k]) D.inst[k] = merge(o.inst[k], null);
    D.kit = {};
    for (k in B.kit || {}) D.kit[k] = merge(B.kit[k], o.kit && o.kit[k]);
    for (k in o.kit || {}) if (!D.kit[k]) D.kit[k] = merge(o.kit[k], null);
    D.drums = {};
    for (k in B.drums || {}) D.drums[k] = merge(B.drums[k], o.drums && o.drums[k]);
    for (k in o.drums || {}) if (!D.drums[k]) D.drums[k] = merge(o.drums[k], null);
    if (B.lines) { D.lines = {}; for (k in B.lines) D.lines[k] = trNotes(B.lines[k], sh); }
    D.sections = {};
    for (k in B.sections) {
      var s0 = B.sections[k], s = {}, q;
      for (q in s0) s[q] = s0[q];
      if (s0.chords) s.chords = trChords(s0.chords, sh);
      if (s0.notes) { s.notes = {}; for (q in s0.notes) s.notes[q] = trNotes(s0.notes[q], sh); }
      D.sections[k] = s;
    }
    return D;
  }
  var FINANCE = variant(TOWN, {
    title: '丸の内ファンファーレ', key: 'Bb major', bpm: 116, level: 0.4, shift: -2,
    delay: { beats: 0.75, fb: 0.25, wet: 0.4, lp: 3000 },
    inst: {
      lead: { role: 'line', wave: 'sawtooth', uni: 2, det: 7, gain: 0.075, a: 0.012, d: 0.3, s: 0.65, r: 0.14, cut: 1200, cutEnv: 2200, cutDec: 0.25, q: 1.5, vib: 12, send: 0.2 },
      comp: { role: 'chord', wave: 'sawtooth', uni: 2, det: 7, gain: 0.03, a: 0.012, d: 0.3, s: 0.35, r: 0.08, center: 62, voices: 3, triad: true, cut: 800, cutEnv: 2400, cutDec: 0.22, q: 1.5, pan: -0.2 },
      arp:  { role: 'arp', fm: 4, idx: 1.0, idxEnd: 0.08, idxDec: 0.2, gain: 0.05, a: 0.003, d: 0.9, s: 0, r: 0.3, center: 74, pan: 0.3, send: 0.3 },
      pad:  { role: 'chord', wave: 'sawtooth', uni: 2, det: 14, gain: 0.022, a: 0.12, d: 0.6, s: 0.85, r: 0.4, center: 66, voices: 4, lp: 2600, pan: -0.1 },
      bass: { lp: 900, sub: 0.6 }
    },
    kit: { kick: { gain: 0.6 }, tomL: { gain: 0.42, f0: 110, f1: 82, pdec: 0.12, dec: 0.5 }, crash: { gain: 0.06 } },
    drums: {
      dA: { u: 'x...............' },
      dB: { u: 'x.......x.......' },
      fB: { u: '........x...x.x.' }
    }
  });
  var CAMPUS = variant(OFFICE, {
    title: '赤門のスケッチ', key: 'F major', bpm: 104, swing: 0.26, level: 1.2,
    delay: { beats: 0.75, fb: 0.38, wet: 0.6, lp: 3000 },
    inst: {
      lead:  { role: 'line', fm: 4, idx: 1.2, idxEnd: 0.08, idxDec: 0.25, gain: 0.12, a: 0.003, d: 1.3, s: 0.15, r: 0.45, send: 0.35 },
      bleep: { role: 'arp', fm: 1, idx: 1.1, idxEnd: 0.05, idxDec: 0.07, gain: 0.11, a: 0.002, d: 0.8, s: 0, r: 0.2, center: 74, pan: 0.35, send: 0.3, hp: 40 },
      bass:  { role: 'bass', wave: 'triangle', gain: 0.09, a: 0.008, d: 0.5, s: 0.55, r: 0.12, lo: 36, sub: 0.6 }
    },
    kit: { kick: { gain: 0.5 }, snare: { gain: 0.14, toneGain: 0.2 }, hat: { gain: 0.045 } }
  });
  var BAY = variant(HQ, {
    title: '湾岸シティポップ', key: 'C minor / Eb major', bpm: 118, level: 0.8, shift: 3,
    delay: { beats: 0.75, fb: 0.35, wet: 0.55, lp: 3200 },
    inst: {
      lead:    { role: 'line', wave: 'triangle', gain: 0.13, a: 0.02, d: 0.3, s: 0.75, r: 0.16, vib: 16, send: 0.26 },
      chip:    { role: 'line', fm: 1, idx: 1.1, idxEnd: 0.05, idxDec: 0.07, gain: 0.05, a: 0.002, d: 0.8, s: 0, r: 0.2, oct: 0, pan: 0.25, send: 0.25, hp: 40 },
      strings: { role: 'chord', wave: 'sawtooth', uni: 2, det: 10, gain: 0.022, a: 0.12, d: 0.6, s: 0.8, r: 0.5, center: 64, voices: 4, lp: 1700, pan: -0.15 },
      keys:    { role: 'chord', fm: 1, idx: 1.6, idxEnd: 0.15, idxDec: 0.35, gain: 0.045, a: 0.004, d: 1.2, s: 0.2, r: 0.2, center: 64, voices: 4, pan: -0.3, send: 0.1, hp: 40 },
      glitter: { role: 'arp', fm: 1, idx: 1.0, idxEnd: 0.05, idxDec: 0.07, gain: 0.04, a: 0.002, d: 0.6, s: 0, r: 0.15, center: 84, pan: 0.35, send: 0.35, hp: 40 },
      bass:    { cut: 300, cutEnv: 900, q: 2 }
    },
    kit: { kick: { gain: 0.6 }, clap: { gain: 0.18 }, metal: { gain: 0.02 } }
  });
  var SONGS = { town: TOWN, office: OFFICE, factory: FACTORY, cryo: CRYO, hq: HQ, home: SHITAMACHI,
                finance: FINANCE, campus: CAMPUS, bay: BAY };
  function jingle(D) {
    D.once = true; D.form = ['A']; D.loop = 0;
    D.sections = { A: { chords: D.chords, parts: D.parts || {}, notes: { lead: D.lead } } };
    return D;
  }
  var JINGLES = {
    shibuya: jingle({
      title: 'ハチ公前ポップ', key: 'C major', bpm: 156, level: 1.2,
      delay: { beats: 0.75, fb: 0.25, wet: 0.45, lp: 3500 },
      inst: {
        lead: { role: 'line', wave: 'pulse25', gain: 0.13, a: 0.004, d: 0.25, s: 0.6, r: 0.18, vib: 10, send: 0.2, lp: 6000 },
        comp: { role: 'chord', wave: 'pulse25', gain: 0.06, a: 0.003, d: 0.4, s: 0, r: 0.03, center: 64, voices: 3, pan: -0.25, lp: 4500 },
        bass: { role: 'bass', wave: 'square', gain: 0.1, a: 0.004, d: 0.18, s: 0.5, r: 0.1, lo: 36, lp: 1100, gate: 0.8 }
      },
      kit: { kick: { gain: 0.6 }, hat: { gain: 0.06 } },
      chords: 'C Am | F G C C',
      lead: ['G5 C6 E6 C6 E6 - D6 C6', 'A5 C6 B5 D6 C6 - - -'],
      parts: { comp: ['..x...x...x...x.', '..x...x.X-------'], bass: ['R.8.R.8.R.8.R.8.', 'R.8.R.8.R-------'], drums: 'd' },
      drums: { d: { k: ['x...x...x...x...', 'x...x...x.......'], h: ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.......'] } }
    }),
    futako: jingle({
      title: '多摩川ばやし', key: 'D yo scale', bpm: 138, level: 1.6,
      delay: { beats: 0.75, fb: 0.25, wet: 0.4, lp: 3200 },
      inst: {
        lead:  { role: 'line', wave: 'triangle', gain: 0.16, a: 0.02, d: 0.3, s: 0.75, r: 0.2, vib: 22, send: 0.22 },
        shami: { role: 'arp', wave: 'pulse12', gain: 0.06, a: 0.002, d: 0.25, s: 0, r: 0.03, cut: 1000, cutEnv: 3400, cutDec: 0.05, q: 3, center: 62, pan: -0.3, gate: 0.6 },
        koto:  { role: 'arp', fm: 1, idx: 2.2, idxEnd: 0.1, idxDec: 0.12, gain: 0.05, a: 0.002, d: 1.1, s: 0, r: 0.25, center: 67, pan: 0.3, send: 0.35, hp: 40 },
        bass:  { role: 'bass', wave: 'square', gain: 0.085, a: 0.004, d: 0.25, s: 0.5, r: 0.1, lo: 36, lp: 800, gate: 0.75, sub: 0.6 }
      },
      kit: { tomL: { gain: 0.42, f0: 165, f1: 100, pdec: 0.06, dec: 0.32 }, metal: { gain: 0.04, dec: 0.1, f: [760, 1140], bp: 2600 } },
      chords: 'D Em7 | G A7sus4 D D',
      lead: ['A5 B5 D6 - B5 A5 E5 -', 'D6 B5 A5 E5 D5 - - -'],
      parts: { shami: ['0.2.1.2.0.2.1.2.', '0.2.1.2.0.......'], koto: ['', '........01234567'],
               bass: ['R.....5.R.....5.', 'R...5...R-------'], drums: 'd' },
      drums: { d: { u: ['x.....x.x.......', 'x...x...X.......'], m: ['x..x....x..x....', 'x..x....x.......'] } }
    }),
    hongo: jingle({
      title: '上野の森', key: 'F major', bpm: 144, level: 1.9,
      delay: { beats: 0.75, fb: 0.35, wet: 0.55, lp: 3000 },
      inst: {
        lead: { role: 'line', fm: 4, idx: 1.2, idxEnd: 0.08, idxDec: 0.25, gain: 0.13, a: 0.003, d: 1.3, s: 0.15, r: 0.5, send: 0.35 },
        ep:   { role: 'chord', fm: 1, idx: 1.6, idxEnd: 0.15, idxDec: 0.35, gain: 0.05, a: 0.004, d: 1.6, s: 0.25, r: 0.3, center: 62, voices: 4, pan: -0.15, send: 0.1, hp: 40 },
        bass: { role: 'bass', wave: 'triangle', gain: 0.08, a: 0.01, d: 0.6, s: 0.6, r: 0.2, lo: 38, sub: 0.4 }
      },
      chords: 'F C/E | Bb C7 F F',
      lead: ['C6 A5 G5 C6', 'D6 - E6 C6 F6 - - -'],
      parts: { ep: ['X-------x-------', 'X---x---X-------'], bass: ['R-------R-------', 'R---R---R-------'] }
    }),
    ariake: jingle({
      title: '湾岸の風', key: 'Eb major', bpm: 152, level: 3.0,
      delay: { beats: 0.75, fb: 0.3, wet: 0.5, lp: 3200 },
      inst: {
        lead: { role: 'line', fm: 1, idx: 1.1, idxEnd: 0.05, idxDec: 0.07, gain: 0.15, a: 0.002, d: 1.4, s: 0, r: 0.3, send: 0.3, hp: 40 },
        pad:  { role: 'chord', wave: 'sawtooth', uni: 2, det: 10, gain: 0.024, a: 0.08, d: 0.6, s: 0.8, r: 0.5, center: 64, voices: 4, lp: 1600, pan: -0.15 },
        bass: { role: 'bass', wave: 'triangle', gain: 0.085, a: 0.006, d: 0.3, s: 0.6, r: 0.12, lo: 36, sub: 0.5 }
      },
      kit: { kick: { gain: 0.45 }, hat: { gain: 0.05, dec: 0.035 } },
      chords: 'Ebmaj7 Cm7 | Abmaj7 Bb7 Eb Eb',
      lead: ['Bb5 G5 Eb6 D6 C6 G5 Bb5 -', 'C6 Eb6 D6 F6 Eb6 - - -'],
      parts: { pad: ['x-------x-------', 'x---x---x-------'], bass: ['R..R..5.R..R..5.', 'R...R...R-------'], drums: 'd' },
      drums: { d: { k: ['x.....x.x.......', 'x.......x.......'], h: ['x.xgx.xgx.xgx.xg', 'x.xgx.xg........'] } }
    }),
    fab: jingle({
      title: 'テクノパーク・ライン', key: 'D minor', bpm: 150, level: 1.2,
      delay: { beats: 0.75, fb: 0.25, wet: 0.4, lp: 2600 },
      inst: {
        lead: { role: 'line', wave: 'sawtooth', uni: 2, det: 9, gain: 0.085, a: 0.004, d: 0.25, s: 0.6, r: 0.18, lp: 2800, lpq: 2, send: 0.18, vib: 10 },
        stab: { role: 'chord', power: true, wave: 'square', gain: 0.04, a: 0.003, d: 0.45, s: 0, r: 0.05, center: 52, lp: 1600, pan: 0.2 },
        bass: { role: 'bass', wave: 'sawtooth', gain: 0.095, a: 0.003, d: 0.12, s: 0.4, r: 0.08, lo: 33, cut: 300, cutEnv: 1800, cutDec: 0.09, q: 3, sub: 0.7, gate: 0.85 }
      },
      kit: { kick: { gain: 0.65 }, snare: { gain: 0.22 }, hat: { gain: 0.05 }, crash: { gain: 0.06 } },
      chords: 'Dm Bb | C A7 Dm Dm',
      lead: ['D5 - A5 - F5 D5 Bb5 -', 'G5 E5 C#6 A5 D6 - - -'],
      parts: { stab: ['X..X..X.X..X..X.', 'X...X...X-------'], bass: ['R.R.R.R.R.R.R.R.', 'R.R.R.R.R-------'], drums: 'd' },
      drums: { d: { k: ['x...x...x...x...', 'x...x...X.......'], s: ['....x.......x...', '....x...........'],
                    h: ['x.x.x.x.x.x.x.x.', 'x.x.x.x.........'], y: ['', '........x.......'] } }
    }),
    minato: jingle({
      title: 'みなとみらいの朝', key: 'G major', bpm: 148, level: 2.0,
      delay: { beats: 0.75, fb: 0.32, wet: 0.5, lp: 3400 },
      inst: {
        lead:  { role: 'line', fm: 4, idx: 1.1, idxEnd: 0.08, idxDec: 0.22, gain: 0.13, a: 0.003, d: 1.2, s: 0.15, r: 0.45, send: 0.3 },
        ep:    { role: 'chord', fm: 1, idx: 1.6, idxEnd: 0.15, idxDec: 0.35, gain: 0.048, a: 0.004, d: 1.5, s: 0.25, r: 0.3, center: 62, voices: 4, pan: -0.15, send: 0.1, hp: 40 },
        bleep: { role: 'arp', wave: 'pulse25', gain: 0.1, a: 0.002, d: 0.3, s: 0, r: 0.02, center: 79, pan: 0.35, send: 0.4, gate: 0.5 },
        bass:  { role: 'bass', wave: 'triangle', gain: 0.085, a: 0.006, d: 0.35, s: 0.6, r: 0.15, lo: 36, sub: 0.5 }
      },
      kit: { kick: { gain: 0.45 }, hat: { gain: 0.045, dec: 0.035 } },
      chords: 'G D/F# | C D7 G G',
      lead: ['D5 B5 A5 G5 E5 - D5 G5', 'E5 G5 F#5 A5 G5 - - -'],
      parts: { ep: ['x-------x-------', 'x---x---X-------'], bleep: ['0.2.1.3.0.2.1.3.', '0.2.1.3.0.......'],
               bass: ['R...5...R...5...', 'R...R...R-------'], drums: 'd' },
      drums: { d: { k: ['x.......x.......', 'x.......x.......'], h: ['..x...x...x...x.', '..x...x.........'] } }
    }),
    inzai: jingle({
      title: '冷たい光', key: 'A minor', bpm: 136, level: 4.6,
      delay: { beats: 0.75, fb: 0.4, wet: 0.6, lp: 3500 },
      inst: {
        lead:  { role: 'line', fm: 3.5, idx: 1.0, idxEnd: 0.08, idxDec: 0.2, gain: 0.12, a: 0.003, d: 1.4, s: 0.12, r: 0.5, send: 0.4, pan: 0.05 },
        glass: { role: 'arp', fm: 3.5, idx: 0.9, idxEnd: 0.1, idxDec: 0.15, gain: 0.035, a: 0.003, d: 0.9, s: 0, r: 0.3, center: 76, pan: 0.3, send: 0.4 },
        pad:   { role: 'chord', wave: 'sawtooth', uni: 2, det: 12, gain: 0.024, a: 0.25, d: 1.0, s: 0.8, r: 0.8, center: 62, voices: 4, lp: 1300, pan: -0.25 },
        bass:  { role: 'bass', wave: 'triangle', gain: 0.075, a: 0.03, d: 0.8, s: 0.7, r: 0.3, lo: 38, sub: 0.4 }
      },
      chords: 'Am9 Fmaj7 | Dm9 E7sus4 Am9 Am9',
      lead: ['E6 - B5 - C6 A5 E5 -', 'F5 A5 B5 E6 B5 - - -'],
      parts: { glass: ['..2...4...2...3.', '..2...3.........'], pad: ['x-------x-------', 'x---x---x-------'], bass: ['R-------R-------', 'R---R---R-------'] }
    }),
    shinjuku: jingle({
      title: '摩天楼ナイト', key: 'G minor', bpm: 144, swing: 0.15, level: 1.9,
      delay: { beats: 0.75, fb: 0.3, wet: 0.5, lp: 3000 },
      inst: {
        lead:    { role: 'line', wave: 'sawtooth', uni: 2, det: 11, gain: 0.08, a: 0.008, d: 0.35, s: 0.7, r: 0.2, lp: 3600, lpq: 1, vib: 14, send: 0.22 },
        strings: { role: 'chord', wave: 'sawtooth', uni: 2, det: 14, gain: 0.022, a: 0.08, d: 0.6, s: 0.85, r: 0.4, center: 67, voices: 4, lp: 3000, pan: -0.2 },
        brass:   { role: 'chord', wave: 'sawtooth', uni: 2, det: 7, gain: 0.032, a: 0.012, d: 0.3, s: 0.35, r: 0.08, center: 60, voices: 3, triad: true, cut: 800, cutEnv: 2600, cutDec: 0.22, q: 1.5, pan: 0.1 },
        bass:    { role: 'bass', wave: 'sawtooth', gain: 0.09, a: 0.003, d: 0.14, s: 0.45, r: 0.08, lo: 33, cut: 380, cutEnv: 1600, cutDec: 0.12, q: 4, sub: 0.7, gate: 0.8 }
      },
      kit: { kick: { gain: 0.6 }, snare: { gain: 0.2 }, hat: { gain: 0.05 }, crash: { gain: 0.05 } },
      chords: 'Gm9 C9 | Ebmaj7 D7 Gm9 Gm9',
      lead: ['D6 Bb5 A5 F5 E5 G5 Bb5 -', 'Bb5 D6 C6 A5 D6 - - -'],
      parts: { strings: ['x-------x-------', 'x---x---x-------'], brass: ['..X...X...X...X.', 'X.....X.X-------'],
               bass: ['R.8.R.8.R.8.R.8.', 'R.8.R.8.R-------'], drums: 'd' },
      drums: { d: { k: ['x.....x...x.....', 'x.....x.x.......'], s: ['....x.......x...', '....x...x.......'],
                    h: ['xgxgxgxgxgxgxgxg', 'xgxgxgxg........'], y: ['', '........x.......'] } }
    }),
    otemachi: jingle({
      title: '大手町ファンファーレ', key: 'Bb major', bpm: 140, level: 2.8,
      delay: { beats: 0.75, fb: 0.25, wet: 0.4, lp: 3000 },
      inst: {
        lead:  { role: 'line', wave: 'sawtooth', uni: 2, det: 7, gain: 0.085, a: 0.012, d: 0.3, s: 0.65, r: 0.2, cut: 1200, cutEnv: 2400, cutDec: 0.25, q: 1.5, vib: 12, send: 0.2 },
        brass: { role: 'chord', wave: 'sawtooth', uni: 2, det: 7, gain: 0.032, a: 0.012, d: 0.3, s: 0.4, r: 0.1, center: 60, voices: 3, triad: true, cut: 800, cutEnv: 2400, cutDec: 0.22, q: 1.5, pan: -0.15 },
        bass:  { role: 'bass', wave: 'square', gain: 0.085, a: 0.004, d: 0.25, s: 0.5, r: 0.1, lo: 34, lp: 900, gate: 0.8, sub: 0.6 }
      },
      kit: { tomL: { gain: 0.45, f0: 110, f1: 82, pdec: 0.12, dec: 0.5 }, crash: { gain: 0.06 } },
      chords: 'Bb Gm | Eb F7 Bb Bb',
      lead: ['F5 - Bb5 - D6 - Bb5 G5', 'G5 Bb5 A5 C6 Bb5 - - -'],
      parts: { brass: ['X.....X.X.....X.', 'X...X...X-------'], bass: ['R.......5.......', 'R...R...R-------'], drums: 'd' },
      drums: { d: { u: ['x...........x.x.', 'x...x...X.......'], y: ['', '........x.......'] } }
    })
  };
  QT.Bgm = {
    update: update,
    resume: resume,
    setMuted: function (m) { mutedFlag = !!m; if (mutedFlag) pause(); },
    setVolume: function (v) {
      vol = Math.max(0, Math.min(1, +v || 0));
      if (eng && active) eng.setMaster(vol, 0.1);
    },
    stop: function () {
      stopped = true;
      if (eng) { eng.stopAll(); eng.tick(LOOKAHEAD); }
      setTimeout(function () { if (stopped) pause(); }, 700);
      want = null;
    },
    setLite: function (b) { lite = !!b; if (eng) eng.lite = lite; },
    renderOffline: renderOffline,
    info: info,
    tracks: Object.keys(SONGS),
    jingles: Object.keys(JINGLES),
    jingle: function (x, delay) { hook(); return playStation(x, delay); },
    jingleOf: jingleOf,
    hook: hook,
    trackFor: function (S) { return AREA[areaOf(S)] || null; },
    nearFor: function (S) { return nearSong(S); },
    AREA: AREA,
    _Engine: Engine, _song: song, _ctx: function () { return eng && eng.ctx; },
    _state: function () {
      return eng ? { cur: eng.cur && eng.cur.id, step: eng.cur && eng.cur.step, old: eng.old.map(function (p) { return p.id; }),
                     active: active, ctx: eng.ctx.state, master: eng.master.gain.value,
                     jingle: eng.jp && eng.jp.id, music: eng.music.gain.value } : null;
    }
  };
})(window.QT || (window.QT = {}));
