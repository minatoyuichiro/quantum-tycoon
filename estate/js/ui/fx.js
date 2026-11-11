(function (QT) {
  'use strict';
  var L = QT.L;
  L.add({
    fx_bneckSub: ['ボトルネック: {a} → {b}', 'Bottleneck: {a} → {b}'],
    fx_bneckRate: ['生産 {a} → {b}台/分', 'Output {a} → {b}/min'],
    fx_saved: ['冗長化がラインを救った!!', 'Redundancy saved the line!!'],
    fx_savedSub: ['{e}でも止まらなかった · N-1 {n}%', 'Kept running through the {e} · N-1 {n}%'],
    fx_savedSub0: ['{e}でも止まらなかった', 'Kept running through the {e}'],
    fx_stop: ['ライン停止: 単一障害点!', 'Line down: single point of failure!'],
    fx_stopFix: ['2社目と契約しよう', 'Contract a 2nd supplier'],
    fx_stopSpot: ['緊急スポットが出ています', 'Emergency spot is open'],
    fx_lineN: ['ライン{n}', 'Line {n}'],
    fx_warnIn: ['{e}まで {n}s', '{e} in {n}s'],
    fx_warnBig: ['大地震まで {n}s', 'BIG QUAKE in {n}s'],
    fx_onNow: ['{e} 発生中', '{e} now'],
    fx_perMin: ['{n}台/分', '{n}/min'],
    fx_line: ['ライン', 'Line'],
    fx_ev_quake: ['地震', 'Earthquake'],
    fx_ev_bigquake: ['大地震', 'Big earthquake'],
    fx_ev_export: ['輸出規制', 'Export controls'],
    fx_ev_helium: ['ヘリウム不足', 'Helium shortage'],
    fx_ev_chip: ['チップ不足', 'Chip shortage'],
    fx_ev_supply: ['供給停止', 'Supply outage'],
    fx_p_chip: ['チップ', 'Chips'],
    fx_p_trap: ['トラップ', 'Traps'],
    fx_p_fridge: ['冷凍機', 'Fridges'],
    fx_p_ctrl: ['制御装置', 'Control'],
    fx_p_laser: ['レーザー', 'Lasers'],
    fx_p_optics: ['光学部品', 'Optics'],
    fx_p_vac: ['真空部品', 'Vacuum'],
    fx_p_he: ['ヘリウム', 'Helium'],
    fx_app: ['サプライ', 'Supply'],
    fx_appLocked: ['テクノパークに工場（ライン）を建てると使えます', 'Build a factory line in the Technopark to use this'],
    fx_appHead: ['生産 {r} | ボトルネック: {b} | N-1 {n}% | BCP {g}', 'Output {r} | Bottleneck: {b} | N-1 {n}% | BCP {g}'],
    fx_appSpof: ['⚠ 単一障害点: {s}', '⚠ Single points of failure: {s}'],
    fx_appNoSpof: ['単一障害点はありません', 'No single point of failure'],
    fx_appContracts: ['契約している仕入先', 'Contracted suppliers'],
    fx_appNone: ['まだ契約していません（本郷の秋葉原電気街で店のマスに乗る）', 'No contracts yet (step on a shop pad in Akihabara Electric Town, Hongo)'],
    fx_tier: ['{n}段', 'T{n}']
  });
  var errs = {};
  function SP() { return QT.Sim && QT.Sim.supply; }
  function call(o, name, args) {
    if (!o || typeof o[name] !== 'function') return undefined;
    try { return o[name].apply(o, args || []); }
    catch (e) { if (!errs[name]) { errs[name] = 1; console.error('[fx] ' + name, e); } return undefined; }
  }
  function lines() {
    var f = QT.Sim && QT.Sim.factory, r = call(f, 'lines');
    return r && r.length ? r : [];
  }
  function lineNo(id) { var m = /(\d+)$/.exec(String(id)); return m ? m[1] : id; }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  function S0() { return QT.G && QT.G.S; }
  function partName(id) {
    if (!id) return '—';
    if (id === 'line') return L.t('fx_line');
    var D = QT.Data && QT.Data.parts, d = D && (D[id] || findIn(D, id));
    if (d && d.name) return L.nm(d);
    var k = 'fx_p_' + id, s = L.t(k);
    return s && s !== k ? s : String(id);
  }
  function findIn(list, id) {
    if (!list || typeof list !== 'object') return null;
    if (list.length != null) { for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i]; return null; }
    return list[id] || null;
  }
  function supName(id) {
    var d = findIn(QT.Data && QT.Data.suppliers, id);
    return d && d.name ? L.nm(d) : String(id);
  }
  function bneck() {
    var r = call(SP(), 'bottleneck');
    if (!r) return null;
    if (typeof r === 'string') return { part: r, cut: null };
    var p = r.part || r.id || r.c || r.node || (r.kind === 'line' || r.line ? 'line' : null);
    return { part: p, cut: num(r.cut != null ? r.cut : r.value != null ? r.value : r.T) };
  }
  function grade() {
    var g = call(SP(), 'bcp');
    if (g && typeof g === 'object') g = g.grade || g.g || g.bcp;
    return typeof g === 'string' && /^[A-E]/i.test(g) ? g.charAt(0).toUpperCase() : null;
  }
  function n1pct() {
    var v = call(SP(), 'n1');
    if (v && typeof v === 'object') v = v.pct != null ? v.pct : v.ratio != null ? v.ratio : v.min;
    v = num(v);
    if (v == null) return null;
    return Math.round(v <= 1.0001 ? v * 100 : v);
  }
  function spofList() { var r = call(SP(), 'spof'); return r && r.length ? r : []; }
  function contracts() {
    var S = S0(), c = S && S.supply && S.supply.contracts;
    return c && typeof c === 'object' ? c : {};
  }
  function contractSig() {
    var c = contracts();
    return Object.keys(c).sort().map(function (k) { return k + ':' + c[k]; }).join(',');
  }
  function downIds() {
    var r = call(SP(), 'down');
    return r && r.length ? r : [];
  }
  var WARN = 15;
  function evKind(e) {
    var k = String(e.kind || e.type || e.id || 'supply').toLowerCase();
    if (/big|great|mega/.test(k) || e.big) return 'bigquake';
    if (/quake|^eq$|jishin/.test(k)) return 'quake';
    if (/export|ban|kisei/.test(k)) return 'export';
    if (/^he$|helium/.test(k)) return 'helium';
    if (/chip|fab|semi/.test(k)) return 'chip';
    return 'supply';
  }
  function evName(kind) { return L.t('fx_ev_' + kind); }
  function evOne(e, t) {
    if (!e || typeof e !== 'object') return null;
    if (e.phase === 'warn' || e.phase === 'on') {
      return { kind: evKind(e), phase: e.phase, left: Math.max(0, num(e.left) || 0), dur: num(e.dur) || (e.phase === 'warn' ? WARN : 90), src: e };
    }
    var at = num(e.at != null ? e.at : e.start != null ? e.start : e.t0);
    if (at == null) return null;
    var end = num(e.until != null ? e.until : e.end);
    if (end == null) end = at + (num(e.dur) || 90);
    if (t < at && t >= at - WARN - 0.5) return { kind: evKind(e), phase: 'warn', left: at - t, dur: WARN, src: e };
    if (t >= at && t < end) return { kind: evKind(e), phase: 'on', left: end - t, dur: Math.max(1, end - at), src: e };
    return null;
  }
  function evState() {
    var S = S0();
    if (!S) return null;
    var n = call(SP(), 'notice');
    if (n) { var a = evOne(n, S.t); if (a) return a; }
    var ss = S.supply;
    if (!ss) return null;
    var cand = [], evs = ss.events;
    if (evs && typeof evs === 'object') {
      if (evs.length != null) cand = cand.concat(evs);
      else {
        ['cur', 'active', 'now', 'next', 'pending'].forEach(function (k) { if (evs[k]) cand.push(evs[k]); });
        if (evs.kind || evs.at != null) cand.push(evs);
      }
    }
    ['event', 'ev', 'next'].forEach(function (k) { if (ss[k] && typeof ss[k] === 'object') cand.push(ss[k]); });
    var best = null;
    for (var i = 0; i < cand.length; i++) {
      var o = evOne(cand[i], S.t);
      if (o && (!best || (o.phase === 'on' && best.phase !== 'on'))) best = o;
    }
    return best;
  }
  var snap = { at: -9, fac: false, rate: 0, T: 0, grade: null, lines: {}, running: [], stopped: [], bn: null, sig: '', down: false };
  var epi = null;
  var stopSince = {};
  var last = { bneck: -99, saved: -99, alarm: -99, up: -99, sig: -99, evPhase: null, evKind: null };
  var shieldUntil = 0, shieldLines = [];
  var broken = null;
  function sfx(n, p) { if (QT.Sfx && QT.Sfx.play) QT.Sfx.play(n, p); }
  function onScreen(H, s, m) { return s.x >= -m && s.x <= H.cssW + m && s.y >= -m && s.y <= H.cssH + m; }
  function banner(text, sub, col, kind) {
    var G = QT.G, S = S0();
    if (!G || !S) return;
    var q = S.banners || [];
    for (var i = 0; i < q.length; i++) if (q[i].text === text) return;
    if (G.banner) G.banner(text, sub, col, kind);
  }
  function fmt1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  function poll(S) {
    if (S.t - snap.at < 1 && S.t >= snap.at) return;
    var prev = snap, ls = lines();
    var al = call(SP(), 'alloc') || null, ax = al && al.lines || {};
    var cur = { at: S.t, fac: ls.length > 0, rate: 0, T: 0, grade: null, lines: {}, running: [], stopped: [], bn: null, sig: '', down: false };
    ls.forEach(function (ln) {
      var x = num(ax[ln.id]);
      if (x == null) x = num(ln.rate) || 0;
      cur.lines[ln.id] = x;
      cur.rate += num(ln.rate) != null ? ln.rate : x;
      if (x > 0.01) cur.running.push(ln.id); else cur.stopped.push(ln.id);
    });
    cur.T = num(al && al.T) != null ? al.T : cur.rate;
    if (cur.fac) { cur.grade = grade(); cur.bn = bneck(); }
    cur.sig = contractSig();
    var dn = downIds(), ev = evState();
    cur.down = dn.length > 0 || !!(ev && ev.phase === 'on');
    snap = cur;
    if (prev.at < 0) return;
    if (cur.sig !== prev.sig) last.sig = S.t;
    if (cur.fac && prev.bn && cur.bn && prev.bn.part && prev.bn.part !== 'line' && cur.bn.part !== prev.bn.part &&
        prev.T > 0.01 && cur.T > prev.T + 0.01 && S.t - last.sig < 3 && S.t - last.up > 3)
      showBroken({ from: prev.bn.part, to: cur.bn.part, T0: prev.T, T1: cur.T });
    if (cur.down && !epi) startEpisode(S, prev);
    if (epi) {
      epi.minT = Math.min(epi.minT, cur.T);
      if (dn.length) epi.hit = true;
      epi.running.forEach(function (id) {
        if (!(cur.lines[id] > 0.01) && !epi.stopped) { epi.stopped = true; alarm(S); }
      });
      if (!cur.down && S.t - epi.at >= 1) endEpisode(S, cur);
    }
    var keep = {};
    cur.stopped.forEach(function (id) { keep[id] = stopSince[id] != null ? stopSince[id] : S.t; });
    stopSince = keep;
  }
  function startEpisode(S, prev) {
    epi = { at: S.t, running: prev.running.slice(), preT: prev.T, minT: prev.T, hit: false, stopped: false, done: false };
  }
  function endEpisode(S, cur) {
    var e = epi;
    epi = null;
    if (e.done || e.stopped || !e.running.length) return;
    if (!e.hit && !(e.minT < e.preT * 0.999)) return;
    showSaved(e.running, last.evKind);
  }
  function alarm(S) {
    if (S.t - last.alarm < 8) return;
    last.alarm = S.t;
    sfx('alarm');
  }
  function showBroken(d) {
    var S = S0();
    if (!S || S.t - last.bneck < 4) return;
    last.bneck = S.t;
    d = d || {};
    var from = d.from || d.prev || (d.old && d.old.part), to = d.to || d.next || d.part || (d.now && d.now.part);
    broken = { at: S.t, from: from || null, to: to || null };
    var sub = from && from !== (to || 'line') ? L.t('fx_bneckSub', { a: partName(from), b: partName(to || 'line') }) : '';
    var T0 = num(d.T0 != null ? d.T0 : d.before), T1 = num(d.T1 != null ? d.T1 : d.after);
    if (T0 != null && T1 != null) sub = (sub ? sub + '   ' : '') + L.t('fx_bneckRate', { a: fmt1(T0), b: fmt1(T1) });
    banner('BOTTLENECK BROKEN!!', sub, '#19a7d6', 'bneck');
    sfx('zap');
  }
  function showSaved(ids, kind) {
    var S = S0();
    if (!S || S.t - last.saved < 10) return;
    last.saved = S.t;
    if (epi) epi.done = true;
    shieldLines = (ids && ids.length ? ids : snap.running).slice();
    shieldUntil = S.t + 4;
    var n = n1pct(), e = evName(kind || 'supply');
    banner(L.t('fx_saved'), n != null ? L.t('fx_savedSub', { e: e, n: n }) : L.t('fx_savedSub0', { e: e }), '#2fbf7a', 'redund');
    sfx('shield');
  }
  function watchEvent(S) {
    var ev = evState(), ph = ev ? ev.phase : null, kd = ev ? ev.kind : null;
    if (ph !== last.evPhase || (ph && kd !== last.evKind)) {
      if (ph === 'warn') sfx('notice');
      else if (ph === 'on') {
        if (kd === 'quake' || kd === 'bigquake') {
          sfx('rumble', kd === 'bigquake' ? 0.8 : 1);
          if (QT.Render && QT.Render.shake) QT.Render.shake(kd === 'bigquake' ? 9 : 5, kd === 'bigquake' ? 1.6 : 0.9);
        } else sfx('bad');
      }
      last.evPhase = ph;
      if (kd) last.evKind = kd;
    }
    return ev;
  }
  if (QT.G && typeof QT.G.on === 'function') {
    QT.G.on('bottleneckBroken', function (d) { showBroken(d); });
    QT.G.on('redundancySaved', function (d) { showSaved(d && (d.lines || d.ids), d && d.kind); });
    QT.G.on('supplyDown', function () { var S = S0(); if (S && !epi) startEpisode(S, snap); if (epi) epi.hit = true; });
    QT.G.on('supplyUp', function () { var S = S0(); if (S) last.up = S.t; });
    QT.G.on('blockOpened', function (id) {
      var bid = id && typeof id === 'object' ? id.id : id, W = QT.World, bl = W && W.BLOCKS ? W.BLOCKS[bid] : null;
      banner(L.t('fx_blockNew', { n: bl ? L.nm(bl) : '' }), L.t('fx_blockNewSub'), '#e2508a', 'block');
      sfx('fanfare');
    });
  }
  L.add({
    fx_blockNew: ['NEW! {n}', 'NEW! {n}'],
    fx_blockNewSub: ['シャッターが上がりました。新しいお店に行ってみよう', 'The shutters are up. Go check out the new spots']
  });
  function phoneOpen(app) {
    var ph = QT.UI && QT.UI.get('phone');
    if (ph && ph.open) ph.open(app);
    sfx('click');
    return true;
  }
  var GRADE_COL = { A: '#2fbf7a', B: '#8cc63f', C: '#f2b01e', D: '#ef7d2e', E: '#e2504a' };
  function hudChip(S, H, slot) {
    if (!snap.fac || !slot) return false;
    var c = H.ctx, room = slot.x1 - slot.x0;
    if (room < 34) return false;
    var g = snap.grade, rs = L.t('fx_perMin', { n: fmt1(snap.rate) });
    c.font = '800 10px ' + H.FONT;
    var rw = c.measureText(rs).width, gw = g ? 38 : 0, showRate = room >= rw + gw + 22;
    var w = (showRate ? rw + 18 : 0) + gw + (showRate && g ? 4 : 0);
    if (!w) return false;
    var x = slot.x1 - w, h = 18, y = slot.cy - h / 2;
    var stop = snap.stopped.length > 0 && snap.down;
    H.fillRR(x, y, w, h, 9, stop ? 'rgba(226,80,74,0.14)' : 'rgba(111,87,224,0.09)');
    if (showRate) {
      var col = stop ? (Math.floor(S.t * 3) % 2 ? '#e2504a' : '#b8322d') : '#6f57e0';
      c.fillStyle = col;
      c.beginPath(); c.moveTo(x + 7, y + 5); c.lineTo(x + 13, y + 9); c.lineTo(x + 7, y + 13); c.closePath(); c.fill();
      H.txt(rs, x + 15, slot.cy, 10, stop ? '#e2504a' : '#4b3fa8', 'left', 800);
    }
    if (g) {
      var bx = x + w - gw, gc = GRADE_COL[g] || '#7d788f';
      H.fillRR(bx, y + 1, gw, h - 2, 8, gc);
      H.txt('BCP ' + g, bx + gw / 2, slot.cy, 9.5, '#ffffff', 'center', 900);
    }
    if (QT.UI) QT.UI.tapRect({ x: x - 4, y: slot.cy - 22, w: w + 8, h: 44 }, function () { return phoneOpen('supply'); });
    return true;
  }
  var chipCache = { t: -1, list: [] }, extra = [];
  function chips(S) {
    if (chipCache.t === S.t) return chipCache.list;
    var out = [];
    if (!S.won && race(S)) out.push({ k: 'fx', id: 'race', w: L.get && L.get() === 'en' ? 176 : 164, first: true, draw: drawRaceChip });
    if (snap.fac && snap.down && snap.stopped.length && !S.won) out.push({ k: 'fx', id: 'stop', w: 200, full: true, first: true, draw: drawStop });
    var ev = snap.fac && !S.won ? evState() : null;
    if (ev && S.ev && (S.ev.warn || S.ev.sup)) ev = null;
    if (ev) out.push({ k: 'fx', id: 'sev', w: L.get && L.get() === 'en' ? 182 : 158, ev: ev, draw: drawEvChip });
    for (var i = 0; i < extra.length; i++) {
      var xc = null;
      try { xc = S.won ? null : extra[i](S); } catch (e) { xc = null; }
      if (xc) out.push(xc);
    }
    chipCache = { t: S.t, list: out };
    return out;
  }
  function stripes(c, x, y, w, h, col, off) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = col;
    for (var sx = x - h + (off % 14); sx < x + w; sx += 14) {
      c.beginPath(); c.moveTo(sx, y + h); c.lineTo(sx + 7, y + h); c.lineTo(sx + 7 + h, y); c.lineTo(sx + h, y); c.closePath(); c.fill();
    }
    c.restore();
  }
  function hazard(c, x, y, s, fill, ink) {
    c.fillStyle = fill;
    c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 1.1, y + s * 0.8); c.lineTo(x - s * 1.1, y + s * 0.8); c.closePath(); c.fill();
    c.fillStyle = ink;
    c.fillRect(x - 0.9, y - s * 0.45, 1.8, s * 0.7); c.fillRect(x - 0.9, y + s * 0.38, 1.8, 1.8);
  }
  function drawStop(S, H, r) {
    var c = H.ctx, k = 0.5 + 0.5 * Math.sin(S.t * 6);
    c.save();
    H.rr(r.x, r.y, r.w, r.h, 9); c.clip();
    c.fillStyle = '#d63a34'; c.fillRect(r.x, r.y, r.w, r.h);
    stripes(c, r.x, r.y, r.w, r.h, 'rgba(120,10,10,0.28)', S.t * 30);
    c.fillStyle = 'rgba(255,255,255,' + (0.12 * k).toFixed(3) + ')'; c.fillRect(r.x, r.y, r.w, r.h);
    c.restore();
    H.strokeRR(r.x, r.y, r.w, r.h, 9, 'rgba(90,0,0,0.5)', 1.2);
    hazard(c, r.x + 15, r.y + r.h / 2, 7, '#ffd23f', '#2a1a40');
    var ids = snap.stopped, longest = 0;
    ids.forEach(function (id) { if (stopSince[id] != null) longest = Math.max(longest, S.t - stopSince[id]); });
    var rt = ids.map(function (id) { return L.t('fx_lineN', { n: lineNo(id) }); }).join('·') + ' ' + Math.floor(longest) + 's';
    c.font = '800 10px ' + H.FONT;
    var rw = Math.min(r.w * 0.38, c.measureText(rt).width);
    H.fitTxt(rt, r.x + r.w - 9 - rw, r.y + r.h / 2 + 0.5, 10, rw, '#ffe9e6', 800, 8);
    var main = L.t('fx_stop');
    if (Math.floor(S.t / 2.5) % 2 === 1) main = longest >= 60 ? L.t('fx_stopSpot') : L.t('fx_stopFix');
    H.fitTxt(main, r.x + 28, r.y + r.h / 2 + 0.5, 12, r.w - 28 - rw - 16, '#ffffff', 900, 8.5);
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () { return phoneOpen('supply'); });
  }
  function drawEvChip(S, H, r) {
    var c = H.ctx, ev = evState() || r.ev, warn = ev.phase === 'warn';
    var left = Math.max(0, Math.ceil(ev.left)), hot = warn && ev.left < 5;
    H.glass(r.x, r.y, r.w, r.h, 10);
    c.save();
    H.rr(r.x, r.y, r.w, r.h, 10); c.clip();
    if (warn) {
      c.fillStyle = '#ffd23f'; c.fillRect(r.x, r.y, 10, r.h);
      stripes(c, r.x, r.y, 10, r.h, '#2a1a40', S.t * 12);
      if (hot && Math.floor(S.t * 4) % 2 === 0) { c.fillStyle = 'rgba(226,80,74,0.16)'; c.fillRect(r.x, r.y, r.w, r.h); }
    } else {
      c.fillStyle = 'rgba(226,80,74,0.12)'; c.fillRect(r.x, r.y, r.w * Math.min(1, ev.left / ev.dur), r.h);
      c.fillStyle = '#e2504a'; c.fillRect(r.x, r.y, 5, r.h);
    }
    if (warn) { c.fillStyle = hot ? '#e2504a' : '#f2a63b'; c.fillRect(r.x, r.y + r.h - 2.5, r.w * Math.min(1, ev.left / WARN), 2.5); }
    c.restore();
    var col = warn ? (hot ? '#e2504a' : '#c46a00') : '#e2504a';
    hazard(c, r.x + (warn ? 21 : 16), r.y + r.h / 2, 6, warn ? '#ffd23f' : '#e2504a', warn ? '#2a1a40' : '#ffffff');
    var s = warn ? (ev.kind === 'bigquake' ? L.t('fx_warnBig', { n: left }) : L.t('fx_warnIn', { e: evName(ev.kind), n: left }))
                 : L.t('fx_onNow', { e: evName(ev.kind) });
    var ts = warn ? '' : left + 's', tw = 0;
    if (ts) { c.font = '800 10.5px ' + H.FONT; tw = c.measureText(ts).width; H.txt(ts, r.x + r.w - 8, r.y + r.h / 2, 10.5, col, 'right', 800); }
    var x0 = r.x + (warn ? 31 : 26);
    var sc = hot ? 1 + 0.06 * Math.abs(Math.sin(S.t * 8)) : 1;
    c.save(); c.translate(x0, r.y + r.h / 2); c.scale(sc, sc);
    H.fitTxt(s, 0, 0, 11, r.w - (x0 - r.x) - tw - 14, col, 800, 8.5);
    c.restore();
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () { return phoneOpen('supply'); });
  }
  function bannerDeco(b, e, H, cx, cy) {
    var c = H.ctx;
    if (b.kind === 'bneck') {
      if (e > 1.0 || Math.floor(e * 20) % 3 === 2) return;
      c.save();
      c.lineJoin = 'round'; c.lineCap = 'round';
      for (var j = 0; j < 4; j++) {
        var side = j % 2 ? 1 : -1, x0 = cx + (j - 1.5) * H.cssW * 0.26, y0 = cy + side * 36;
        c.beginPath(); c.moveTo(x0, y0);
        var x = x0, y = y0;
        for (var s = 0; s < 4; s++) {
          x += (Math.random() - 0.5) * 22; y += side * (8 + Math.random() * 7);
          c.lineTo(x, y);
        }
        c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 4; c.stroke();
        c.strokeStyle = '#7ff0ff'; c.lineWidth = 2; c.stroke();
      }
      c.restore();
    } else if (b.kind === 'harvest') {
      if (!b._gold) { b._gold = true; goldConfetti(cx, cy - 20, 70); }
    } else if (b.kind === 'redund') {
      var k = Math.min(1, e / 0.25), sc = k < 1 ? 0.3 + 0.9 * k : 1 + 0.04 * Math.sin(e * 6);
      shield(c, cx - Math.min(150, H.cssW * 0.38), cy - 50, 22 * sc);
    }
  }
  function shield(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.beginPath();
    c.moveTo(0, -s); c.quadraticCurveTo(s * 0.9, -s * 0.85, s * 0.95, -s * 0.6);
    c.quadraticCurveTo(s * 0.9, s * 0.45, 0, s); c.quadraticCurveTo(-s * 0.9, s * 0.45, -s * 0.95, -s * 0.6);
    c.quadraticCurveTo(-s * 0.9, -s * 0.85, 0, -s); c.closePath();
    c.fillStyle = '#2a1a40'; c.lineWidth = Math.max(2, s * 0.22); c.strokeStyle = '#2a1a40'; c.stroke();
    c.fillStyle = '#2fbf7a'; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.beginPath(); c.moveTo(0, -s * 0.8); c.lineTo(0, s * 0.8); c.quadraticCurveTo(-s * 0.75, s * 0.35, -s * 0.78, -s * 0.5); c.closePath(); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(2, s * 0.16); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-s * 0.38, 0); c.lineTo(-s * 0.08, s * 0.3); c.lineTo(s * 0.42, -s * 0.3); c.stroke();
    c.restore();
  }
  QT.UI.panel('fx', {
    layer: 'hud',
    draw: function (S, H) {
      poll(S);
      if (snap.fac) watchEvent(S);
    }
  });
  if (QT.Art && QT.Art.on) QT.Art.on('ui', '*', function (S, H) {
    if (S.t >= shieldUntil || !shieldLines.length) return;
    var W = QT.World, left = shieldUntil - S.t, a = Math.min(1, left / 0.6);
    shieldLines.forEach(function (id, i) {
      var p = W.BY_ID && W.BY_ID[id];
      if (!p) return;
      var s = H.toScreen((p.x + p.w / 2) * H.TILE, (p.y + p.h / 2) * H.TILE, H.H_PLOT + 30);
      if (!onScreen(H, s, 40)) return;
      var age = 4 - left - i * 0.12, k = Math.max(0, Math.min(1, age / 0.3));
      if (k <= 0) return;
      var c = H.ctx;
      c.save(); c.globalAlpha = a;
      c.strokeStyle = 'rgba(47,191,122,' + (0.6 * (1 - (age % 1))).toFixed(3) + ')'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(s.x, s.y + 4, 18 + 26 * (age % 1), 9 + 13 * (age % 1), 0, 0, 7); c.stroke();
      shield(c, s.x, s.y - 6 * Math.sin(Math.min(1, k) * Math.PI / 2) + Math.sin(S.t * 3 + i) * 2, Math.max(4, 13 * Math.min(1.15, k * 1.15)));
      c.restore();
    });
  });
  function drawAppFallback(S, H, R) {
    var c = H.ctx, x = R.x + 6, w = R.w - 12, y = R.y + 6, C = H.C;
    if (!snap.fac) { H.fitTxt(L.t('fx_appLocked'), x + 4, y + 14, 11.5, w - 8, '#9a94ad', 700, 8); return; }
    var bn = snap.bn, n = n1pct(), g = snap.grade || '—';
    H.fillRR(x, y, w, 30, 10, '#f6f4fb');
    H.fitTxt(L.t('fx_appHead', { r: L.t('fx_perMin', { n: fmt1(snap.rate) }), b: bn ? partName(bn.part) : '—', n: n != null ? n : '—', g: g }),
             x + 10, y + 15, 11, w - 20, C.ink, 800, 7.5);
    y += 40;
    var sp = spofList();
    H.fitTxt(sp.length ? L.t('fx_appSpof', { s: sp.map(supName).join('・') }) : L.t('fx_appNoSpof'), x + 4, y, 11, w - 8, sp.length ? C.red : C.green, 800, 8);
    y += 22;
    H.txt(L.t('fx_appContracts'), x + 4, y, 11, C.inkSoft, 'left', 800);
    y += 18;
    var cs = contracts(), ids = Object.keys(cs), dn = downIds();
    if (!ids.length) { H.fitTxt(L.t('fx_appNone'), x + 4, y, 10.5, w - 8, '#9a94ad', 700, 8); return; }
    ids.forEach(function (id) {
      if (y > R.y + R.h - 40) return;
      var off = dn.indexOf(id) >= 0;
      H.fillRR(x, y - 11, w, 24, 8, off ? 'rgba(226,80,74,0.1)' : '#ffffff');
      H.fitTxt(supName(id), x + 10, y + 1, 11, w - 90, off ? C.red : C.ink, 700, 8);
      H.txt(L.t('fx_tier', { n: cs[id] }), x + w - 10, y + 1, 10.5, C.violet, 'right', 800);
      y += 28;
    });
  }
  function webGlyph(c, x, y, col) {
    c.save();
    c.strokeStyle = col; c.lineWidth = 1.4;
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 9); c.stroke();
    }
    [4, 7.5].forEach(function (rad) {
      c.beginPath();
      for (var j = 0; j <= 6; j++) { var b = j * Math.PI / 3; c.lineTo(x + Math.cos(b) * rad, y + Math.sin(b) * rad * 0.9); }
      c.stroke();
    });
    c.fillStyle = col; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
    c.restore();
  }
  L.add({
    fx_rankN: ['{n}位', '#{n}'],
    fx_kindQP: ['量子ランキング', 'Quantum ranking'],
    fx_kindCap: ['時価総額ランキング', 'Market-cap ranking'],
    fx_rankMove: ['{k} {a}位→{b}位!', '{k} #{a} → #{b}!'],
    fx_passed: ['{n}を抜いた!!', 'You passed {n}!!'],
    fx_you: ['あなた', 'You'],
    fx_overtaken: ['{n}位 ← {r}', '#{n} ← {r}'],
    fx_raceLost: ['商談負け ← {r}', 'Deal lost ← {r}'],
    fx_raceChip: ['商談 {c}', 'Pitch {c}'],
    fx_vsDeal: ['{c}の商談を勝ち取った!', 'You won the {c} deal!'],
    fx_vsFirst: ['{r}を初めて抜いた!', 'Ahead of {r} for the first time!'],
    fx_rkTabQP: ['量子', 'Quantum'],
    fx_rkTabCap: ['時価総額', 'Market cap'],
    fx_rkNone: ['ランキングはまだありません', 'No rankings yet'],
    fx_rkGhost: ['あなた（未上場・推定）', 'You (unlisted, est.)'],
    fx_rkGhostTo: ['上場すれば{n}位', '#{n} if listed'],
    fx_rkMonthly: ['順位は月の変わり目に確定します（いまは暫定）', 'Ranks are confirmed at each month end (provisional now)']
  });
  function RV() { return QT.Sim && QT.Sim.rivals; }
  function rivalDef(id) { return id && id !== 'me' ? findIn(QT.Data && QT.Data.rivals, id) : null; }
  function rivalName(id) {
    if (!id) return '';
    if (id === 'me') return L.t('fx_you');
    var d = rivalDef(id);
    return d && d.name ? L.nm(d) : String(id);
  }
  function rivalCol(id) { var d = rivalDef(id); return (d && d.color) || '#e2504a'; }
  function rowId(r) { return r && (r.id != null ? r.id : r.me ? 'me' : null); }
  function ranksOf(kind) {
    var r = call(RV(), kind === 'cap' ? 'ranksCap' : 'ranksQP');
    return r && r.length ? r : [];
  }
  function myIndex(list) { for (var i = 0; i < list.length; i++) if (rowId(list[i]) === 'me') return i; return -1; }
  function rowVal(r, kind) {
    if (!r) return null;
    var v = kind === 'cap' ? (r.cap != null ? r.cap : r.v != null ? r.v : r.value) : (r.qp != null ? r.qp : r.v != null ? r.v : r.value);
    return num(v);
  }
  function fmtVal(v, kind) {
    if (v == null) return '';
    return kind === 'cap' ? '¥' + QT.G.fmt(v) : 'QP ' + Math.round(v);
  }
  var frozen = null;
  function wall() { return frozen != null ? frozen : performance.now() / 1000; }
  function flag(c, x, y, w, h, code) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    code = String(code || '').toUpperCase();
    function band(cols, vert) {
      cols.forEach(function (col, i) {
        c.fillStyle = col;
        if (vert) c.fillRect(x + w * i / cols.length, y, w / cols.length + 0.5, h);
        else c.fillRect(x, y + h * i / cols.length, w, h / cols.length + 0.5);
      });
    }
    if (code === 'JP') {
      c.fillStyle = '#ffffff'; c.fillRect(x, y, w, h);
      c.fillStyle = '#d7263d'; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.3, 0, 7); c.fill();
    } else if (code === 'US') {
      for (var i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#c8283c'; c.fillRect(x, y + h * i / 7, w, h / 7 + 0.5); }
      c.fillStyle = '#2b3f8c'; c.fillRect(x, y, w * 0.45, h * 4 / 7);
    } else if (code === 'FR') band(['#2b4ea2', '#ffffff', '#e0333c'], true);
    else if (code === 'NL') band(['#c8283c', '#ffffff', '#2b4ea2']);
    else if (code === 'CA') {
      band(['#d7263d', '#ffffff', '#ffffff', '#d7263d'], true);
      c.fillStyle = '#d7263d'; c.beginPath();
      c.moveTo(x + w / 2, y + h * 0.18); c.lineTo(x + w * 0.62, y + h * 0.55); c.lineTo(x + w / 2, y + h * 0.82); c.lineTo(x + w * 0.38, y + h * 0.55);
      c.closePath(); c.fill();
    } else if (code === 'CN' || code === 'HK') {
      c.fillStyle = '#d7263d'; c.fillRect(x, y, w, h);
      c.fillStyle = '#ffd23f'; starPath(c, x + w * 0.24, y + h * 0.32, h * 0.2); c.fill();
    } else if (code === 'AU') {
      c.fillStyle = '#23347a'; c.fillRect(x, y, w, h);
      c.fillStyle = '#ffffff'; c.fillRect(x + w * 0.2, y, w * 0.08, h * 0.5); c.fillRect(x, y + h * 0.21, w * 0.48, h * 0.08);
      c.fillStyle = '#c8283c'; c.fillRect(x + w * 0.215, y, w * 0.05, h * 0.5); c.fillRect(x, y + h * 0.225, w * 0.48, h * 0.05);
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + w * 0.74, y + h * 0.66, h * 0.09, 0, 7); c.arc(x + w * 0.24, y + h * 0.74, h * 0.1, 0, 7); c.fill();
    } else {
      c.fillStyle = '#d6d2de'; c.fillRect(x, y, w, h);
    }
    c.restore();
    c.strokeStyle = 'rgba(40,30,70,0.35)'; c.lineWidth = 0.8; c.strokeRect(x + 0.4, y + 0.4, w - 0.8, h - 0.8);
  }
  function starPath(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function atomGlyph(c, x, y, col, s) {
    s = s || 6;
    c.save();
    c.strokeStyle = col; c.lineWidth = Math.max(1, s * 0.2);
    for (var i = 0; i < 3; i++) {
      c.beginPath(); c.ellipse(x, y, s, s * 0.38, i * Math.PI / 3, 0, 7); c.stroke();
    }
    c.fillStyle = col; c.beginPath(); c.arc(x, y, s * 0.24, 0, 7); c.fill();
    c.restore();
  }
  function chartGlyph(c, x, y, col, s) {
    s = s || 6;
    c.save();
    c.strokeStyle = col; c.lineWidth = Math.max(1.2, s * 0.24); c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s, y + s * 0.7); c.lineTo(x - s * 0.3, y); c.lineTo(x + s * 0.15, y + s * 0.35); c.lineTo(x + s, y - s * 0.6); c.stroke();
    c.fillStyle = col; c.beginPath(); c.moveTo(x + s * 1.05, y - s * 0.9); c.lineTo(x + s * 0.45, y - s * 0.75); c.lineTo(x + s * 0.95, y - s * 0.25); c.closePath(); c.fill();
    c.restore();
  }
  function trophyGlyph(c, x, y, col) {
    c.save();
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x - 6, y - 8); c.lineTo(x + 6, y - 8); c.quadraticCurveTo(x + 6, y + 1, x, y + 2); c.quadraticCurveTo(x - 6, y + 1, x - 6, y - 8); c.fill();
    c.beginPath(); c.arc(x - 6.5, y - 4.5, 3, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(x + 6.5, y - 4.5, 3, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    c.fillRect(x - 1.2, y + 1, 2.4, 4); c.fillRect(x - 5, y + 5, 10, 3);
    c.restore();
  }
  function myEmblem(c, x, y, r) {
    c.save();
    c.fillStyle = '#2a1a40'; c.beginPath(); c.arc(x, y, r + 2.5, 0, 7); c.fill();
    c.fillStyle = '#6f57e0'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.restore();
    atomGlyph(c, x, y, '#ffffff', r * 0.62);
  }
  var rk = { init: false, lastT: -1, qp: null, cap: null, d: { qp: 0, cap: 0 }, at: { qp: -99, cap: -99 }, checkAt: null, fresh: false, passed: {} };
  function readRank(kind) {
    var v = num(call(RV(), kind === 'cap' ? 'myRankCap' : 'myRankQP'));
    return v != null && v > 0 ? Math.round(v) : null;
  }
  function syncRanks(S) {
    if (S.t < rk.lastT - 1 || S.t > rk.lastT + 5) rk.init = false;
    rk.lastT = S.t;
    if (!rk.init) {
      rk.init = true; rk.qp = readRank('qp'); rk.cap = readRank('cap'); rk.checkAt = null;
      rk.d = { qp: 0, cap: 0 }; rk.at = { qp: -99, cap: -99 }; rk.fresh = false;
      return;
    }
    if (rk.qp == null) rk.qp = readRank('qp');
    if (rk.cap == null) rk.cap = readRank('cap');
    if (rk.checkAt != null && S.t >= rk.checkAt) {
      rk.checkAt = null;
      confirmRank(S, 'qp', readRank('qp'), null, null);
      confirmRank(S, 'cap', readRank('cap'), null, null);
    }
  }
  function confirmRank(S, kind, to, from, extra) {
    if (to == null || (kind !== 'qp' && kind !== 'cap')) return;
    var prev = rk[kind];
    if (prev === to) return;
    rk[kind] = to;
    var a = from != null ? from : prev;
    if (a == null || a === to) return;
    rk.d[kind] = a - to; rk.at[kind] = S.t; rk.fresh = true;
    if (to < a) queueRankUp(S, kind, a, to, extra);
    else showOvertaken(S, kind, a, to, extra);
  }
  function ranksVisible(S) {
    if (S.won || rk.qp == null) return false;
    var R = QT.Sim && QT.Sim.research, qp = num(call(R, 'companyQP'));
    return (qp != null && qp > 0) || !!S.ipo || rk.cap != null || !!race(S);
  }
  function rankChips(S, H, slot) {
    syncRanks(S);
    if (!slot || !ranksVisible(S)) return 0;
    var c = H.ctx, x = slot.x, cy = slot.cy, h = 16, gap = 4, used = 0, maxW = slot.maxW || 999;
    var items = [
      { kind: 'qp', s: L.t('fx_rankN', { n: rk.qp }), glyph: atomGlyph },
      { kind: 'cap', s: rk.cap != null ? L.t('fx_rankN', { n: rk.cap }) : '—', glyph: chartGlyph }
    ];
    var t = S.t;
    items.forEach(function (it) {
      c.font = '900 10px ' + H.FONT;
      var tw = c.measureText(it.s).width, dd = rk.d[it.kind], showD = dd && t - rk.at[it.kind] < 60;
      var ds = showD ? (dd > 0 ? '▲' + dd : '▼' + (-dd)) : '';
      c.font = '900 8px ' + H.FONT;
      var dw = ds ? c.measureText(ds).width + 3 : 0, w = 19 + tw + dw + 6;
      if (used + w > maxW) { ds = ''; w = 19 + tw + 6; }
      if (used + w > maxW) return;
      var cx = x + used, flash = t - rk.at[it.kind] < 4 ? 0.5 + 0.5 * Math.sin(t * 9) : 0, up = dd > 0, none = it.kind === 'cap' && rk.cap == null;
      var bg = flash ? (up ? 'rgba(245,178,28,' + (0.18 + 0.3 * flash).toFixed(3) + ')' : 'rgba(226,80,74,' + (0.14 + 0.25 * flash).toFixed(3) + ')')
                     : 'rgba(111,87,224,0.10)';
      H.fillRR(cx, cy - h / 2, w, h, 8, bg);
      it.glyph(c, cx + 9.5, cy, none ? '#a7a1b8' : '#6f57e0', 5);
      H.txt(it.s, cx + 17, cy + 0.5, 10, none ? '#9a94ad' : '#2f2c46', 'left', 900);
      if (ds) H.txt(ds, cx + 17 + tw + 2, cy + 0.5, 8, up ? '#2a9d63' : '#e2504a', 'left', 900);
      used += w + gap;
    });
    if (!used) return 0;
    used -= gap;
    if (QT.UI) QT.UI.tapRect({ x: x - 4, y: cy - 22, w: used + 8, h: 44 }, function () { rk.fresh = false; return phoneOpen('ranks'); });
    return used;
  }
  var raceC = { t: -1, v: null }, lastRace = null;
  function race(S) {
    if (raceC.t === S.t) return raceC.v;
    raceC.t = S.t; raceC.v = null;
    var a = call(RV(), 'raceActive');
    if (!a) return null;
    var r = typeof a === 'object' ? a : (S.race || (S.rivals && (S.rivals.race || S.rivals._race)) || {});
    var corp = r.corp != null ? r.corp : r.corpId != null ? r.corpId : r.job && r.job.corp != null ? r.job.corp : r.offer && r.offer.client ? r.offer.client : null;
    if (corp && typeof corp === 'object') corp = corp.id || null;
    var riv = r.rival != null ? r.rival : r.rivalId != null ? r.rivalId : r.by;
    if (riv && typeof riv === 'object') riv = riv.id || null;
    var left = null, abs = num(r.arrive != null ? r.arrive : r.until != null ? r.until : r.arriveAt);
    if (abs != null) left = abs - S.t;
    else if (num(r.left) != null) left = r.left;
    else if (num(r.eta) != null) left = r.eta >= S.t - 2 && S.t > 60 ? r.eta - S.t : r.eta;
    var total = num(r.total != null ? r.total : r.dur != null ? r.dur : r.etaTotal);
    if (total == null && num(r.at) != null && abs != null) total = abs - r.at;
    var known = !(r.scouted === false || r.known === false || r.etaKnown === false || r.hidden === true);
    var n = r.npc || r.pos || (num(r.x) != null ? r : null), pos = null;
    if (n && num(n.x) != null && num(n.y) != null) {
      pos = { x: n.x, y: n.y };
      if (pos.x <= QT.World.WORLD_W && pos.y <= QT.World.WORLD_W) { pos.x = (pos.x + 0.5) * QT.World.TILE; pos.y = (pos.y + 0.5) * QT.World.TILE; }
    }
    var plot = corp && QT.World.BY_ID && QT.World.BY_ID[corp];
    raceC.v = lastRace = {
      corp: corp, corpName: plot ? L.nm(plot, 'short') || L.nm(plot) : (corp ? String(corp) : ''),
      rival: riv || null, left: left != null ? Math.max(0, left) : null, total: total, known: known && left != null,
      pos: pos, target: plot ? QT.World.center(plot) : null, room: plot ? plot.room : null,
      hold: num(r.hold), src: r
    };
    return raceC.v;
  }
  var raceSeenAt = -99;
  function drawRaceChip(S, H, r) {
    var c = H.ctx, rc = race(S);
    if (!rc) return;
    var hot = rc.known && rc.left < 8, col = rivalCol(rc.rival);
    var age = S.t - raceSeenAt, pop = age >= 0 && age < 0.6 ? 1 + 0.12 * Math.sin(age / 0.6 * Math.PI) : 1;
    c.save();
    if (pop !== 1) { c.translate(r.x + r.w / 2, r.y + r.h / 2); c.scale(pop, pop); c.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); }
    H.glass(r.x, r.y, r.w, r.h, 10);
    c.save(); H.rr(r.x, r.y, r.w, r.h, 10); c.clip();
    if (hot && Math.floor(S.t * 4) % 2 === 0) { c.fillStyle = 'rgba(226,80,74,0.14)'; c.fillRect(r.x, r.y, r.w, r.h); }
    c.fillStyle = col; c.fillRect(r.x, r.y, 5, r.h);
    if (rc.known && rc.total) { c.fillStyle = hot ? '#e2504a' : '#f2a63b'; c.fillRect(r.x, r.y + r.h - 2.5, r.w * Math.min(1, rc.left / rc.total), 2.5); }
    if (rc.hold != null && rc.hold > 0) { c.fillStyle = '#2fbf7a'; c.fillRect(r.x, r.y, r.w * Math.min(1, rc.hold > 1 ? rc.hold / 2 : rc.hold), 2.5); }
    c.restore();
    var d = rivalDef(rc.rival);
    flag(c, r.x + 11, r.y + r.h / 2 - 5, 14, 10, d && d.flag);
    var ts = rc.known ? Math.ceil(rc.left) + 's' : '??s';
    c.font = '900 11px ' + H.FONT;
    var tw = c.measureText(ts).width;
    var tx = r.x + r.w - 8 - tw, tcol = hot ? '#e2504a' : rc.known ? '#c46a00' : '#9a94ad', ccy = r.y + r.h / 2;
    c.save(); c.strokeStyle = tcol; c.lineWidth = 1.4;
    c.beginPath(); c.arc(tx - 8, ccy, 4.5, 0, 7); c.moveTo(tx - 8, ccy - 2.6); c.lineTo(tx - 8, ccy); c.lineTo(tx - 6.3, ccy + 1.2); c.stroke();
    c.restore();
    H.txt(ts, r.x + r.w - 8, ccy, 11, tcol, 'right', 900);
    H.fitTxt(L.t('fx_raceChip', { c: rc.corpName }), r.x + 30, ccy + 0.5, 11.5, r.w - 30 - tw - 26, '#2f2c46', 800, 8.5);
    c.restore();
    if (QT.UI) QT.UI.tapRect({ x: r.x, y: r.y - 6, w: r.w, h: r.h + 12 }, function () {
      var mm = QT.UI.get('minimap');
      if (mm && mm.select && rc.room) mm.select(rc.room);
      return phoneOpen('map');
    });
  }
  var fxq = [], cur = null, lastRankUp = -99, slides = [], slideCur = null;
  function blocked(S) {
    if (S.won || S.gacha || S.showFinance || S.offline) return true;
    if (topCur || topq.length) return true;
    if (S.banners && S.banners.length) return true;
    if (paperBusy()) return true;
    if (QT.UI && QT.UI.open && QT.UI.open()) return true;
    return !!(QT.Guide && QT.Guide.shown && QT.Guide.shown());
  }
  function queueRankUp(S, kind, from, to, extra) {
    var list = ranksOf(kind), i = myIndex(list), passed = (extra && (extra.passed || extra.rival)) || null, mine = null, theirs = null;
    if (Array.isArray(passed)) passed = passed[0] || null;
    if (passed && typeof passed === 'object') passed = passed.id || null;
    if (i >= 0) {
      mine = rowVal(list[i], kind);
      if (!passed && list[i + 1]) passed = rowId(list[i + 1]);
      for (var j = 0; j < list.length; j++) if (rowId(list[j]) === passed) theirs = rowVal(list[j], kind);
    }
    if (passed === 'me') passed = null;
    for (var q = 0; q < fxq.length; q++) if (fxq[q].type === 'rankup' && fxq[q].kind === kind) { from = Math.max(from, fxq[q].from); fxq.splice(q, 1); q--; }
    fxq.push({ type: 'rankup', kind: kind, from: from, to: to, passed: passed, mine: mine, theirs: theirs });
    if (passed && !rk.passed[passed]) { rk.passed[passed] = true; fxq.push({ type: 'vs', rival: passed, first: true }); }
  }
  function showOvertaken(S, kind, from, to, extra) {
    var list = ranksOf(kind), i = myIndex(list), by = (extra && (extra.by || extra.rival)) || null;
    if (Array.isArray(by)) by = by[by.length - 1] || null;
    if (by && typeof by === 'object') by = by.id || null;
    if (!by && i > 0) by = rowId(list[i - 1]);
    if (by === 'me') by = null;
    pushSlide({ kind: kind, text: by ? L.t('fx_overtaken', { n: to, r: rivalName(by) }) : L.t('fx_rankN', { n: to }), rival: by });
  }
  function pushSlide(s) {
    if (slides.length >= 3) slides.shift();
    slides.push(s);
  }
  function onRaceStart() {
    var S = S0();
    if (!S) return;
    raceSeenAt = S.t; raceC.t = -1;
    sfx('notice');
  }
  function onRaceEnd(d) {
    var S = S0();
    if (!S) return;
    d = d || {};
    var lr = lastRace || {}, riv = d.rival != null ? d.rival : d.rivalId != null ? d.rivalId : d.by != null ? d.by : lr.rival;
    if (riv && typeof riv === 'object') riv = riv.id || null;
    var corp = d.corp != null ? d.corp : lr.corp, plot = corp && QT.World.BY_ID && QT.World.BY_ID[typeof corp === 'object' ? corp.id : corp];
    var cname = plot ? L.nm(plot, 'short') || L.nm(plot) : lr.corpName || '';
    raceC.t = -1;
    if (d.win) fxq.unshift({ type: 'vs', rival: riv, corp: cname });
    else pushSlide({ kind: 'race', text: L.t('fx_raceLost', { r: rivalName(riv) || '?' }), rival: riv });
  }
  if (QT.G && typeof QT.G.on === 'function') {
    QT.G.on('rankChanged', function (d) {
      var S = S0();
      if (!S || !d) return;
      syncRanks(S);
      confirmRank(S, d.kind, num(d.to), num(d.from), d);
    });
    QT.G.on('monthEnd', function () { var S = S0(); if (S) rk.checkAt = S.t + 0.6; });
    QT.G.on('raceStart', onRaceStart);
    QT.G.on('raceEnd', onRaceEnd);
  }
  var sparks = [];
  var FW_COL = ['#ffd23f', '#ff6b9a', '#7ff0ff', '#9bff7a', '#ffffff', '#b59bff'];
  function firework(x, y, n) {
    var col = FW_COL[Math.floor(Math.random() * FW_COL.length)];
    for (var i = 0; i < n && sparks.length < 160; i++) {
      var a = (i / n) * Math.PI * 2 + Math.random() * 0.2, sp = 90 + Math.random() * 70;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.9 + Math.random() * 0.4, col: i % 5 ? col : '#ffffff' });
    }
  }
  function drawSparks(c, dt) {
    c.save();
    c.lineWidth = 2; c.lineCap = 'round';
    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.life += dt;
      if (p.life >= p.max) { sparks.splice(i, 1); continue; }
      p.vx *= 1 - 1.6 * dt; p.vy = p.vy * (1 - 1.6 * dt) + 140 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      c.globalAlpha = 1 - p.life / p.max;
      c.strokeStyle = p.col;
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); c.stroke();
    }
    c.restore();
  }
  var RANKUP_LIFE = 3.8, VS_LIFE = 1.7;
  function easeOutBack(k) { k = Math.max(0, Math.min(1, k)); var s = 1.6; k -= 1; return k * k * ((s + 1) * k + s) + 1; }
  function easeIO(k) { k = Math.max(0, Math.min(1, k)); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function rankRow(H, x0, cw, y, me, rankTxt, name, val, fl, glow, scale) {
    var c = H.ctx, rw = cw - 16, rx = x0 + 8;
    c.save();
    c.translate(rx + rw / 2, y + 21); c.scale(scale, scale); c.translate(-(rx + rw / 2), -(y + 21));
    if (glow > 0) { c.save(); c.globalAlpha *= glow; H.fillRR(rx - 3, y - 3, rw + 6, 48, 13, '#ffd23f'); c.restore(); }
    H.fillRR(rx, y, rw, 42, 11, me ? '#f1ecff' : '#f6f4fb');
    H.txt(rankTxt, rx + 28, y + 21, 18, me ? '#6f57e0' : '#7d788f', 'center', 900);
    if (me) myEmblem(c, rx + 66, y + 21, 9);
    else flag(c, rx + 55, y + 14, 21, 14, fl);
    H.fitTxt(name, rx + 84, y + 21, 13, rw - 84 - 74, me ? '#2f2c46' : '#4d4866', 900, 9);
    if (val) H.txt(val, rx + rw - 10, y + 21, 11, me ? '#6f57e0' : '#7d788f', 'right', 800);
    c.restore();
  }
  function drawRankUp(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, cx = W2 / 2, out = e > RANKUP_LIFE - 0.4 ? (e - (RANKUP_LIFE - 0.4)) / 0.4 : 0;
    var top = Math.max(H.hudBottom() + 8, H.cssH * 0.16);
    var cw = Math.min(320, W2 - 32), ch = 104, slide = easeOutBack(e / 0.38), x0 = W2 + 10 + (cx - cw / 2 - W2 - 10) * slide;
    c.save();
    c.globalAlpha = 1 - out;
    c.fillStyle = 'rgba(20,12,40,' + (0.28 * Math.min(1, e / 0.25)).toFixed(3) + ')'; c.fillRect(0, 0, W2, H.cssH);
    var sc = e < 0.12 ? 2.2 - (e / 0.12) * 1.3 : e < 0.24 ? 0.9 + ((e - 0.12) / 0.12) * 0.1 : 1;
    c.save(); c.translate(cx, top + 20); c.rotate(-0.05); c.scale(sc, sc);
    H.popTxt('RANK UP!!', 0, 0, Math.min(40, W2 / 9), '#ffd23f', '#2a1a40', 7);
    c.restore();
    var ks = it.kind === 'cap' ? L.t('fx_kindCap') : L.t('fx_kindQP');
    var sub = L.t('fx_rankMove', { k: ks, a: it.from, b: it.to });
    c.font = '900 13px ' + H.FONT;
    var sw = c.measureText(sub).width, ss = sw > W2 - 40 ? 13 * (W2 - 40) / sw : 13;
    H.popTxt(sub, cx, top + 50, ss, '#ffffff', '#2a1a40', 4);
    var y0 = top + 66;
    c.save(); c.fillStyle = 'rgba(42,26,64,0.9)'; H.rr(x0 - 3, y0 - 3, cw + 6, ch + 6, 18); c.fill(); c.restore();
    H.fillRR(x0, y0, cw, ch, 15, '#ffffff');
    var rowA = y0 + 8, rowB = y0 + 54, k = easeIO((e - 0.7) / 0.5);
    var d = rivalDef(it.passed);
    var myRank = it.from;
    if (e >= 0.7 && e < 1.3) myRank = Math.max(1, it.to + Math.floor(Math.random() * (it.from - it.to + 3)));
    else if (e >= 1.3) myRank = it.to;
    if (e >= 1.3 && !it.locked) { it.locked = true; sfx('tick', 1.5); }
    var bump = e >= 1.3 && e < 1.5 ? 1 + 0.25 * Math.sin((e - 1.3) / 0.2 * Math.PI) : 1;
    var glow = e > 0.6 ? 0.5 + 0.5 * Math.sin(e * 7) : 0;
    if (it.passed) {
      var ry = rowA + (rowB - rowA) * k;
      rankRow(H, x0, cw, ry, false, '#' + (k > 0.5 ? it.to + 1 : it.to), rivalName(it.passed), fmtVal(it.theirs, it.kind), d && d.flag, 0, 1 - 0.04 * k);
      if (k > 0.15) {
        var sx = x0 + cw - 18, sy = ry + 6 + ((e * 2.2) % 1) * 12;
        c.save(); c.globalAlpha *= Math.min(1, (k - 0.15) * 3);
        c.fillStyle = '#7fc8ff'; c.strokeStyle = '#2a1a40'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(sx, sy - 6); c.quadraticCurveTo(sx + 5, sy + 1, sx, sy + 3); c.quadraticCurveTo(sx - 5, sy + 1, sx, sy - 6); c.fill(); c.stroke();
        c.restore();
      }
      var my = rowB + (rowA - rowB) * k - Math.sin(k * Math.PI) * 10;
      c.save(); c.translate(x0 + cw / 2, my + 21); c.scale(bump, bump); c.translate(-(x0 + cw / 2), -(my + 21));
      rankRow(H, x0, cw, my, true, '#' + myRank, L.t('fx_you'), fmtVal(it.mine, it.kind), null, glow, 1 + 0.05 * Math.sin(k * Math.PI));
      c.restore();
    } else {
      var yy = y0 + ch / 2 - 21;
      c.save(); c.translate(x0 + cw / 2, yy + 21); c.scale(bump, bump); c.translate(-(x0 + cw / 2), -(yy + 21));
      rankRow(H, x0, cw, yy, true, '#' + myRank, L.t('fx_you'), fmtVal(it.mine, it.kind), null, glow, 1);
      c.restore();
    }
    if (e >= 1.3) {
      var rk2 = Math.min(1, (e - 1.3) / 0.2), rs = rk2 < 1 ? 0.4 + 0.8 * rk2 : 1 + 0.03 * Math.sin(e * 6);
      var rt = it.passed ? L.t('fx_passed', { n: rivalName(it.passed) }) : L.t('fx_rankN', { n: it.to }) + '!!';
      var ry2 = y0 + ch + 20;
      c.font = '900 15px ' + H.FONT;
      var rtw = Math.min(W2 - 60, c.measureText(rt).width + 36);
      c.save(); c.translate(cx, ry2); c.rotate(-0.03); c.scale(rs, rs);
      c.fillStyle = '#a01e2c';
      c.beginPath(); c.moveTo(-rtw / 2 - 16, -10); c.lineTo(-rtw / 2 + 4, -10); c.lineTo(-rtw / 2 + 4, 14); c.lineTo(-rtw / 2 - 16, 14); c.lineTo(-rtw / 2 - 8, 2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(rtw / 2 + 16, -10); c.lineTo(rtw / 2 - 4, -10); c.lineTo(rtw / 2 - 4, 14); c.lineTo(rtw / 2 + 16, 14); c.lineTo(rtw / 2 + 8, 2); c.closePath(); c.fill();
      c.fillStyle = '#e2504a'; c.fillRect(-rtw / 2, -14, rtw, 26);
      c.strokeStyle = '#2a1a40'; c.lineWidth = 2; c.strokeRect(-rtw / 2, -14, rtw, 26);
      c.font = '900 15px ' + H.FONT;
      var rtx = Math.min(rtw - 32, c.measureText(rt).width);
      H.fitTxt(rt, -rtx / 2, -1, 15, rtw - 32, '#ffffff', 900, 9);
      c.restore();
    }
    c.restore();
    if (e >= 1.3 && !it.boom) {
      it.boom = true;
      if (H.confetti) H.confetti(70, cx, y0 + ch, 6.3);
    }
    [1.3, 1.65, 2.0, 2.4].forEach(function (tt, i) {
      if (e >= tt && !it['fw' + i]) {
        it['fw' + i] = true;
        firework(cx + (i % 2 ? 1 : -1) * (40 + Math.random() * W2 * 0.25), top + 10 + Math.random() * 60, 26);
        if (i) sfx('tick', 0.6 + i * 0.15);
      }
    });
    var tr = { x: 0, y: top - 10, w: W2, h: Math.min(ch + 120, H.cssH / 3 - (top - 10)) };
    if (QT.UI && tr.h > 20) QT.UI.tapRect(tr, function () { if (e > 0.5) it.end = true; return true; });
  }
  function drawVS(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, cx = W2 / 2, cy = Math.max(H.hudBottom() + 90, H.cssH * 0.38), hh = 76;
    var prv = H.playerRect ? H.playerRect() : null;
    if (prv) cy = Math.max(H.hudBottom() + hh + 4, Math.min(cy, prv.y0 - hh - 8));
    var out = e > VS_LIFE - 0.3 ? (e - (VS_LIFE - 0.3)) / 0.3 : 0, inK = easeOutBack(e / 0.22), d = rivalDef(it.rival), rcol = rivalCol(it.rival);
    c.save();
    c.globalAlpha = 1 - out;
    c.fillStyle = 'rgba(20,12,40,' + (0.35 * Math.min(1, e / 0.15)).toFixed(3) + ')'; c.fillRect(0, 0, W2, H.cssH);
    var y0 = cy - hh, y1 = cy + hh, sl = 34;
    var lx = -W2 * (1 - inK), rx = W2 * (1 - inK);
    c.save(); c.translate(lx, 0);
    c.beginPath(); c.moveTo(-8, y0); c.lineTo(cx + sl, y0); c.lineTo(cx - sl, y1); c.lineTo(-8, y1); c.closePath();
    c.fillStyle = '#6f57e0'; c.fill(); c.strokeStyle = '#2a1a40'; c.lineWidth = 4; c.stroke();
    myEmblem(c, cx * 0.45, cy - 10, 26);
    H.popTxt(L.t('fx_you'), cx * 0.45, cy + 38, 15, '#ffffff', '#2a1a40', 4);
    c.restore();
    var cut = e >= 0.5, fall = cut ? Math.max(0, e - 0.62) : 0;
    function rivalHalf(upper) {
      c.save();
      if (cut) {
        var dy = fall * fall * 900 * (upper ? 0.6 : 1), rot = fall * (upper ? -0.35 : 0.5);
        c.translate(cx + W2 * 0.3, cy); c.rotate(rot); c.translate(-(cx + W2 * 0.3), -cy); c.translate(upper ? -fall * 60 : fall * 40, dy);
        c.beginPath();
        if (upper) { c.moveTo(cx - sl - 40, y0 - 40); c.lineTo(W2 + 40, y0 - 40); c.lineTo(W2 + 40, cy - 40); c.lineTo(cx - sl - 40, cy + 46); }
        else { c.moveTo(cx - sl - 40, cy + 46); c.lineTo(W2 + 40, cy - 40); c.lineTo(W2 + 40, y1 + 40); c.lineTo(cx - sl - 40, y1 + 40); }
        c.closePath(); c.clip();
      } else if (!upper) { c.restore(); return; }
      c.translate(rx, 0);
      c.beginPath(); c.moveTo(cx + sl, y0); c.lineTo(W2 + 8, y0); c.lineTo(W2 + 8, y1); c.lineTo(cx - sl, y1); c.closePath();
      c.fillStyle = rcol; c.fill(); c.strokeStyle = '#2a1a40'; c.lineWidth = 4; c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill();
      var fx0 = cx + (W2 - cx) * 0.55;
      flag(c, fx0 - 24, cy - 26, 48, 32, d && d.flag);
      c.font = '900 15px ' + H.FONT;
      var nm = rivalName(it.rival) || '?', nw = c.measureText(nm).width, ns = nw > W2 * 0.4 ? 15 * W2 * 0.4 / nw : 15;
      H.popTxt(nm, fx0, cy + 38, ns, '#ffffff', '#2a1a40', 4);
      c.restore();
    }
    rivalHalf(true); rivalHalf(false);
    if (e < 0.5) {
      var vk = Math.min(1, Math.max(0, (e - 0.12) / 0.12)), vs = vk < 1 ? 2.4 - 1.4 * vk : 1;
      if (e >= 0.12) { c.save(); c.translate(cx, cy); c.scale(vs, vs); H.popTxt('VS', 0, 0, 40, '#ffd23f', '#2a1a40', 7); c.restore(); }
    } else {
      if (e < 0.72) {
        var sk = (e - 0.5) / 0.22;
        c.save(); c.globalAlpha *= 1 - sk;
        c.strokeStyle = '#ffffff'; c.lineWidth = 10 * (1 - sk) + 2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(W2 + 20, cy - 40); c.lineTo(cx - sl - 30, cy + 46); c.stroke();
        c.strokeStyle = '#7ff0ff'; c.lineWidth = 3; c.stroke();
        c.restore();
      }
      var wk = Math.min(1, (e - 0.55) / 0.14), ws = e < 0.55 ? 0 : wk < 1 ? 2.6 - 1.6 * wk : 1 + 0.03 * Math.sin(e * 9);
      if (ws > 0) { c.save(); c.translate(cx, cy - 4); c.rotate(-0.08); c.scale(ws, ws); H.popTxt('WIN!!', 0, 0, Math.min(56, W2 / 6.5), '#ffd23f', '#2a1a40', 8); c.restore(); }
    }
    var cap = it.first ? L.t('fx_vsFirst', { r: rivalName(it.rival) || '?' }) : it.corp ? L.t('fx_vsDeal', { c: it.corp }) : '';
    if (cap && e > 0.6) {
      c.font = '900 13px ' + H.FONT;
      var cpw = c.measureText(cap).width, cps = cpw > W2 - 40 ? 13 * (W2 - 40) / cpw : 13;
      H.popTxt(cap, cx, y1 + 22, cps, '#ffffff', '#2a1a40', 4);
    }
    c.restore();
    if (e >= 0.5 && !it.hit) {
      it.hit = true;
      if (QT.Render && QT.Render.shake) QT.Render.shake(7, 0.35);
      for (var i = 0; i < 3; i++) firework(cx + (Math.random() - 0.5) * W2 * 0.6, cy - hh - 10 + Math.random() * 30, 18);
    }
  }
  var SLIDE_LIFE = 1.8;
  function drawSlide(S, H, s, e) {
    var c = H.ctx, W2 = H.cssW, w = Math.min(250, W2 - 24), h = 30;
    var k = e < 0.2 ? easeOutBack(e / 0.2) : e > SLIDE_LIFE - 0.25 ? 1 - easeIO((e - (SLIDE_LIFE - 0.25)) / 0.25) : 1;
    var x = W2 + 4 - (w + 14) * k, y = H.hudBottom() + 4;
    c.save();
    c.fillStyle = 'rgba(90,0,0,0.35)'; H.rr(x, y + 2, w, h, 10); c.fill();
    H.fillRR(x, y, w, h, 10, '#d63a34');
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 6, y + 3, w - 12, 2);
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(x + 9, y + 11); c.lineTo(x + 19, y + 11); c.lineTo(x + 14, y + 19); c.closePath(); c.fill();
    var gx = x + 31;
    if (s.kind === 'qp') atomGlyph(c, gx, y + h / 2, '#ffe1de', 5.5);
    else if (s.kind === 'cap') chartGlyph(c, gx, y + h / 2, '#ffe1de', 5.5);
    else gx = x + 22;
    var d = rivalDef(s.rival), fx0 = x + w - 26;
    if (s.rival) flag(c, fx0, y + h / 2 - 6, 18, 12, d && d.flag);
    H.fitTxt(s.text, gx + 10, y + h / 2 + 0.5, 12.5, (s.rival ? fx0 - 6 : x + w - 10) - (gx + 10), '#ffffff', 900, 9);
    c.restore();
  }
  var lastWall = 0;
  if (QT.Art && QT.Art.on) QT.Art.on('uiTop', '*', function (S, H) {
    var t = wall(), dt = Math.max(0, Math.min(0.05, t - (lastWall || t)));
    lastWall = t;
    syncRanks(S);
    var c = H.ctx, blk = blocked(S);
    if (!slideCur && slides.length && !blk) { slideCur = slides.shift(); slideCur.at = t; sfx('overtaken'); }
    if (slideCur) {
      var se = t - slideCur.at;
      if (se > SLIDE_LIFE || S.won) slideCur = null; else drawSlide(S, H, slideCur, se);
    }
    if (!cur && fxq.length && !blk) {
      if (fxq[0].type !== 'rankup' || t - lastRankUp >= 6) {
        cur = fxq.shift(); cur.at = t;
        if (cur.type === 'rankup') { lastRankUp = t; sfx('rankup'); }
        else sfx('vs', 1, 0.45);
      }
    }
    if (cur) {
      var e = t - cur.at, life = cur.type === 'rankup' ? RANKUP_LIFE : VS_LIFE;
      if (e > life || cur.end || S.won || S.gacha) cur = null;
      else if (cur.type === 'rankup') drawRankUp(S, H, cur, e);
      else drawVS(S, H, cur, e);
    }
    if (sparks.length) drawSparks(c, dt);
  });
  var rkTab = 'qp';
  function drawRanksFallback(S, H, R) {
    var c = H.ctx, x = R.x + 4, w = R.w - 8, y = R.y + 2;
    [['qp', 'fx_rkTabQP', atomGlyph], ['cap', 'fx_rkTabCap', chartGlyph]].forEach(function (tb, i) {
      var tw = (w - 8) / 2, tx = x + i * (tw + 8), sel = rkTab === tb[0];
      H.fillRR(tx, y, tw, 30, 10, sel ? '#efeafd' : '#f6f4fb');
      tb[2](c, tx + 18, y + 15, sel ? '#6f57e0' : '#9a94ad', 6);
      H.fitTxt(L.t(tb[1]), tx + 32, y + 15, 12, tw - 40, sel ? '#6f57e0' : '#7d788f', 800, 9);
      if (QT.UI) QT.UI.tapRect({ x: tx, y: y - 7, w: tw, h: 44 }, function () { rkTab = tb[0]; sfx('click'); return true; });
    });
    y += 40;
    var kind = rkTab, list = ranksOf(kind).slice(), i0 = myIndex(list), ghost = null;
    if (kind === 'cap' && i0 < 0 && list.length) {
      var v = S.marketCap ? num(S.marketCap()) : null, pos = list.length;
      if (v != null) for (var j = 0; j < list.length; j++) if ((rowVal(list[j], 'cap') || 0) < v) { pos = j; break; }
      ghost = { id: 'me', ghost: true, cap: v, at: pos };
      list.splice(pos, 0, ghost);
      i0 = pos;
    }
    if (!list.length) { H.fitTxt(L.t('fx_rkNone'), x + 6, y + 12, 11.5, w - 12, '#9a94ad', 700, 8); return; }
    H.fitTxt(L.t('fx_rkMonthly'), x + 4, y + 6, 10, w - 8, '#9a94ad', 700, 7.5);
    y += 18;
    var rowH = 30, maxRows = Math.max(3, Math.floor((R.y + R.h - 34 - y) / rowH)), show = [];
    for (var k = 0; k < list.length && show.length < maxRows; k++) show.push(k);
    if (i0 >= 0 && show.indexOf(i0) < 0) show[show.length - 1] = i0;
    show.forEach(function (idx) {
      var r = list[idx], id = rowId(r), me = id === 'me', gh = !!r.ghost;
      var rank = idx + 1 - (ghost && idx > ghost.at ? 1 : 0);
      H.fillRR(x, y, w, rowH - 4, 9, me ? (gh ? '#f1f0f4' : '#f1ecff') : '#ffffff');
      H.txt(gh ? '—' : '#' + rank, x + 20, y + 13, 12, me ? '#6f57e0' : '#7d788f', 'center', 900);
      if (me) myEmblem(c, x + 46, y + 13, 7);
      else flag(c, x + 37, y + 7, 18, 12, (rivalDef(id) || {}).flag);
      var md = (rivalDef(id) || {}).mod, mdd = md && QT.Data && QT.Data.mods && QT.Data.mods[md];
      if (mdd) { c.fillStyle = mdd.color; c.beginPath(); c.arc(x + 64, y + 13, 3.5, 0, 7); c.fill(); }
      var nm = gh ? L.t('fx_rkGhost') : rivalName(id);
      H.fitTxt(nm, x + 72, y + 13, 11.5, w - 72 - 96, gh ? '#9a94ad' : '#2f2c46', me ? 900 : 700, 8);
      var vs = gh ? L.t('fx_rkGhostTo', { n: ghost.at + 1 }) : fmtVal(rowVal(r, kind), kind);
      H.fitTxt(vs, x + w - 92, y + 13, 11, 84, gh ? '#9a94ad' : '#6f57e0', 800, 8);
      y += rowH;
    });
  }
  L.add({
    fx_bigHarvest: ['大収穫!!', 'BIG HARVEST!!'],
    fx_jackpot: ['JACKPOT!!', 'JACKPOT!!'],
    fx_full: ['FULL!', 'FULL!']
  });
  var COIN_MAX = 160, CONF_MAX = 120, LAG = 2.0, GRAV = 900, REST = 0.45;
  var SMALL_MIN = 1e6;
  var JACKPOT_AT = 1e8, JACKPOT_GAP = 30;
  function DC() { return QT.Sim && QT.Sim.dc; }
  function RH() { return QT.Render && QT.Render.H; }
  function quality() {
    try { var q = window.QTDEBUG && window.QTDEBUG.quality && window.QTDEBUG.quality(); return q && typeof q.quality === 'number' ? q.quality : 1; }
    catch (e) { return 1; }
  }
  function poolCap() { return quality() < 0.8 ? COIN_MAX / 2 : COIN_MAX; }
  var jt = { frozen: false, hidden: false, last: 0 };
  function jnow() { return performance.now() / 1000; }
  var CELL = 20, SC = 2;
  var TIER = [
    { edge: '#7a4520', face: '#c97a3c', hi: '#f3b47e', ring: '#9c5626', mark: '#7a4520', r: 6 },
    { edge: '#5f6778', face: '#cfd6e2', hi: '#ffffff', ring: '#9aa3b3', mark: '#6c7486', r: 6.5 },
    { edge: '#9a6400', face: '#ffc928', hi: '#fff3ad', ring: '#d99a00', mark: '#a86e00', r: 7 },
    { edge: '#4b2fa8', face: null, hi: '#ffffff', ring: 'rgba(255,255,255,0.75)', mark: '#ffffff', r: 7.5 }
  ];
  var strip = null;
  function buildStrip() {
    var n = CELL * SC, cv = document.createElement('canvas');
    cv.width = 8 * n; cv.height = 5 * n;
    var c = cv.getContext('2d');
    for (var ti = 0; ti < 4; ti++) for (var f = 0; f < 8; f++) {
      var T = TIER[ti], k = Math.cos(f / 8 * Math.PI), w = Math.max(0.16, Math.abs(k)), R = T.r;
      c.save();
      c.translate((f + 0.5) * n, (ti + 0.5) * n); c.scale(SC, SC);
      var th = (1 - w) * 1.8 * (k >= 0 ? 1 : -1);
      c.fillStyle = T.edge;
      c.beginPath(); c.ellipse(th, 0.6, R * w + 0.4, R + 0.3, 0, 0, 7); c.fill();
      if (T.face) c.fillStyle = T.face;
      else {
        var g = c.createLinearGradient(-R, -R, R, R), h0 = f * 45;
        for (var s = 0; s <= 4; s++) g.addColorStop(s / 4, 'hsl(' + ((h0 + s * 72) % 360) + ',95%,62%)');
        c.fillStyle = g;
      }
      c.beginPath(); c.ellipse(0, 0, R * w, R, 0, 0, 7); c.fill();
      if (w > 0.3) {
        c.strokeStyle = T.ring; c.lineWidth = 0.9;
        c.beginPath(); c.ellipse(0, 0, R * 0.68 * w, R * 0.68, 0, 0, 7); c.stroke();
        c.save(); c.scale(w, 1);
        if (ti === 3) {
          c.strokeStyle = T.mark; c.lineWidth = 0.8;
          c.beginPath(); c.ellipse(0, 0, R * 0.45, R * 0.18, 0.6, 0, 7); c.stroke();
          c.beginPath(); c.ellipse(0, 0, R * 0.45, R * 0.18, -0.6, 0, 7); c.stroke();
          c.fillStyle = T.mark; c.beginPath(); c.arc(0, 0, 0.9, 0, 7); c.fill();
        } else {
          c.fillStyle = T.mark; c.font = '900 ' + (R * 1.05) + 'px sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('¥', 0, 0.4);
        }
        c.restore();
      }
      c.fillStyle = T.hi; c.globalAlpha = 0.9;
      c.beginPath(); c.ellipse(-R * 0.38 * w, -R * 0.42, Math.max(0.5, 1.4 * w), 1.1, 0, 0, 7); c.fill();
      c.restore();
    }
    for (var b = 0; b < 8; b++) {
      var a = b / 8 * Math.PI * 2, sy = 0.35 + 0.65 * Math.abs(Math.cos(a / 2)), sk = Math.sin(a) * 0.35;
      c.save();
      c.translate((b + 0.5) * n, 4.5 * n); c.scale(SC, SC);
      c.transform(1, sk * 0.3, sk, sy, 0, 0);
      c.fillStyle = '#4f7a3c'; c.fillRect(-8.6, -4.6, 17.2, 9.2);
      c.fillStyle = '#d8ecc0'; c.fillRect(-8, -4, 16, 8);
      c.strokeStyle = '#8fb873'; c.lineWidth = 0.7; c.strokeRect(-6.6, -2.8, 13.2, 5.6);
      c.fillStyle = '#b9d79b'; c.beginPath(); c.arc(3.2, 0, 2.2, 0, 7); c.fill();
      c.fillStyle = '#4f7a3c'; c.font = '900 5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('¥', -3.2, 0.3);
      c.restore();
    }
    strip = cv;
  }
  function blit(c, tier, f, x, y, s) {
    if (!strip) buildStrip();
    var n = CELL * SC, d = CELL * (s || 1);
    c.drawImage(strip, (f & 7) * n, tier * n, n, n, x - d / 2, y - d / 2, d, d);
  }
  var parts = [];
  var entries = [];
  var confs = [];
  var pops = [];
  var jp = null, lastJackpot = -99;
  var bump = 0, lastTick = -1, tickN = 0, lastJara = -99;
  var M7 = { S: null, coins: null, t: 0, at: -1, claim: 0, claimAt: -99 };
  var tank = { full: false, artAt: -99, checkAt: -99 };
  function hudTarget() {
    var H = RH(), p = H && H.hudCoin ? H.hudCoin() : null;
    return p ? p : { x: 30, y: 25 };
  }
  function tierOf(a) { return a < 1e5 ? 0 : a < 1e6 ? 1 : 2; }
  function coinCount(a) { return Math.round(Math.max(6, Math.min(120, 6 + 10 * Math.log(a / 1e4) / Math.LN10))); }
  function jara(amount, o) {
    o = o || {};
    if (!(amount > 0)) return null;
    var H = RH(), W2 = H ? H.cssW : 390, H2 = H ? H.cssH : 844, t = jnow();
    var n = coinCount(amount);
    if (o.small) n = Math.max(6, Math.round(n / 2));
    if (o.auto) n = Math.min(n, 10);
    n = Math.max(0, Math.min(n, poolCap() - parts.length));
    var dl = Math.max(0, +o.delay || 0);
    var e = { amt: amount, n: n, landed: 0, at: t + dl, small: !!o.small, auto: !!o.auto, released: n <= 0, popped: !!o.auto };
    entries.push(e);
    lastJara = t;
    if (!n) { if (!e.popped) addPop(amount); e.popped = true; return e; }
    var tier = tierOf(amount), rainbow = amount >= JACKPOT_AT && !o.small, bills = amount >= 1e7;
    var stag = Math.min(0.02, 0.6 / n);
    var ox = o.x != null ? o.x : W2 / 2, oy = o.y != null ? o.y : H2 * 0.55;
    var floorY = oy + 12, sp = o.small ? 0.8 : 1;
    for (var i = 0; i < n; i++) {
      var p = { e: e, ph: 0, d: dl + i * stag, t: 0, b: 0, seed: Math.random(), sc: o.small ? 0.85 : 1 };
      p.tier = rainbow ? (i % 5 < 2 ? 3 : 2) : tier;
      p.bill = bills && (o.small ? i % 6 === 5 : i % 4 === 3);
      if (o.swirl) {
        p.x = ox + (Math.random() - 0.5) * 16; p.y = oy - 6 + (Math.random() - 0.5) * 10;
        p.sx = p.x; p.sy = p.y; p.ph = 3; p.d = i * Math.min(0.045, 0.5 / n); p.t3 = 0;
        p.ang = Math.random() * 6.283; p.bill = false;
      } else if (o.auto) {
        p.x = W2 + 8; p.y = H2 * (0.35 + 0.1 * Math.random()); p.d = i * 0.06; p.direct = true; p.bill = false;
      } else {
        p.x = ox + (Math.random() - 0.5) * 12; p.y = oy - 4;
        var a = (Math.random() * 2 - 1);
        p.vx = a * (50 + 100 * Math.random()) * sp;
        p.vy = -(160 + 80 * Math.random()) * sp;
        if (p.bill) { p.vy *= 1.25; p.vx *= 1.3; }
        p.floor = floorY + Math.random() * 8;
      }
      parts.push(p);
    }
    if (!o.auto && !o.quiet) sfx('jara', o.small ? 1.1 : 1);
    if (rainbow && t - lastJackpot >= JACKPOT_GAP) {
      lastJackpot = t;
      jp = { at: t, x: ox, y: oy };
      sfx('jackpot');
      firework(ox, Math.max(90, oy - 110), 30);
      firework(ox - 70, Math.max(80, oy - 70), 22);
      firework(ox + 70, Math.max(80, oy - 70), 22);
    }
    return e;
  }
  function addPop(a) {
    var t = jnow(), last = pops[pops.length - 1];
    if (last && t - last.at < 0.5) { last.amt += a; last.at = t; return; }
    pops.push({ amt: a, at: t });
    if (pops.length > 2) pops.shift();
  }
  function playerC() {
    var H = RH(), pr = H && H.playerRect ? H.playerRect() : null;
    return pr ? { x: pr.cx, y: (pr.y0 + pr.y1) / 2 } : { x: H ? H.cssW / 2 : 195, y: H ? H.cssH * 0.55 : 460 };
  }
  function startFly(p) {
    var tg = hudTarget();
    p.ph = 2; p.ft = 0;
    p.fx0 = p.x; p.fy0 = p.y;
    p.cx = p.x + (tg.x - p.x) * 0.25 + (p.seed - 0.5) * 120;
    p.cy = Math.min(p.y, tg.y) - 40 - p.seed * 80;
    if (p.cy < 4) p.cy = 4 + p.seed * 20;
    p.fdur = 0.3 + p.seed * 0.12;
  }
  function land(p) {
    var e = p.e;
    e.landed++;
    if (!e.popped) { e.popped = true; addPop(e.amt); }
    bump = 1;
    var t = jnow();
    if (t - lastTick >= 1 / 30 && (!e.auto || e.landed % 3 === 1)) {
      lastTick = t;
      sfx('tick', Math.pow(2, Math.floor(tickN / 8) / 12) * (e.small ? 0.9 : 1));
      tickN = (tickN + 1) % 96;
    }
    if (e.landed >= e.n && !e.auto) { tickN = 0; sfx(e.small ? 'cash' : 'register'); }
  }
  function step(dt) {
    if (dt <= 0) return;
    var tg = hudTarget();
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.ph === 0) {
        p.d -= dt;
        if (p.d > 0) continue;
        if (p.direct) startFly(p); else p.ph = 1;
      }
      if (p.ph === 3) {
        if (p.d > 0) { p.d -= dt; continue; }
        p.t += dt; p.t3 += dt;
        var pc = playerC(), T1 = 0.42, T2 = 1.05;
        p.ang += dt * (7 + p.seed * 4);
        var rad = p.t3 < T1 ? 30 : 30 - 16 * Math.min(1, (p.t3 - T1) / (T2 - T1));
        var lift = p.t3 < T1 ? 0 : -26 * Math.min(1, (p.t3 - T1) / (T2 - T1));
        var tx = pc.x + Math.cos(p.ang) * rad, ty = pc.y + lift + Math.sin(p.ang) * rad * 0.55;
        if (p.t3 < T1) {
          var k1 = p.t3 / T1, e1 = 1 - (1 - k1) * (1 - k1);
          p.x = p.sx + (tx - p.sx) * e1; p.y = p.sy + (ty - p.sy) * e1 - Math.sin(k1 * Math.PI) * 30;
        } else { p.x = tx; p.y = ty; }
        if (p.t3 >= T2) startFly(p);
        continue;
      }
      p.t += dt;
      if (p.ph === 1) {
        if (p.bill) {
          p.vy = Math.min(120, p.vy + GRAV * 0.35 * dt);
          p.vx *= 1 - 1.5 * dt;
          p.x += (p.vx + Math.sin(p.t * 5 + p.seed * 9) * 40) * dt; p.y += p.vy * dt;
          if (p.t > 0.95 || p.y >= p.floor) startFly(p);
        } else {
          p.vy += GRAV * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y >= p.floor && p.vy > 0) {
            p.y = p.floor;
            if (p.b < 2) { p.vy = -p.vy * REST; p.vx *= 0.7; p.b++; }
            else startFly(p);
          } else if (p.b === 2 && p.vy >= 0) startFly(p);
          if (p.ph === 1 && p.t > 1.5) startFly(p);
        }
      }
      if (p.ph === 2) {
        p.ft += dt;
        var k = Math.min(1, p.ft / p.fdur);
        if (k >= 1) { parts.splice(i, 1); land(p); continue; }
        var u = k * k, v = 1 - u;
        p.x = v * v * p.fx0 + 2 * v * u * p.cx + u * u * tg.x;
        p.y = v * v * p.fy0 + 2 * v * u * p.cy + u * u * tg.y;
      }
    }
    for (var q = confs.length - 1; q >= 0; q--) {
      var cf = confs[q];
      cf.life += dt;
      if (cf.life > cf.max) { confs.splice(q, 1); continue; }
      cf.vy = Math.min(140, cf.vy + 260 * dt); cf.vx *= 1 - 1.2 * dt;
      cf.x += (cf.vx + Math.sin(cf.life * 6 + cf.ph) * 30) * dt; cf.y += cf.vy * dt; cf.rot += cf.vr * dt;
    }
    bump = Math.max(0, bump - dt * 4);
  }
  function expire() {
    var t = jnow();
    for (var j = entries.length - 1; j >= 0; j--) {
      var e = entries[j];
      if (e.landed >= e.n) e.released = true;
      if (!e.released && t - e.at >= LAG) { e.released = true; if (!e.popped) { e.popped = true; addPop(e.amt); } }
      if (e.released) entries.splice(j, 1);
    }
  }
  function held() {
    var h = 0;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e.released && e.n > 0) h += e.amt * (1 - e.landed / e.n);
    }
    return h;
  }
  function sync(S) {
    var t = jnow();
    if (t - M7.at < 0.004) return;
    M7.at = t;
    expire();
    var c = S.coins;
    if (typeof c !== 'number' || !isFinite(c)) return;
    var Rn = QT.Render, locked = !!(Rn && Rn.cam && Rn.cam.lock);
    if (locked && M7.S === S) { M7.coins = c; M7.t = S.t; M7.claim = 0; return; }
    if (M7.S !== S || M7.coins == null || Math.abs(S.t - M7.t) > 5 || S.offline) {
      M7.S = S; M7.coins = c; M7.t = S.t; M7.claim = 0;
      entries.length = 0; parts.length = 0;
      return;
    }
    var d = c - M7.coins;
    M7.coins = c; M7.t = S.t;
    if (M7.claim > 0 && d > 0) { var u = Math.min(d, M7.claim); d -= u; M7.claim -= u; }
    if (t - M7.claimAt > 0.6) M7.claim = 0;
    if (d >= SMALL_MIN && !S.won) {
      var H = RH(), pr = H && H.playerRect ? H.playerRect() : null;
      jara(d, { small: true, x: pr ? pr.cx : null, y: pr ? pr.y0 - 18 : null });
    }
  }
  var lastDisp = null;
  function cash(S) {
    if (!S) return 0;
    sync(S);
    var h = held(), v = S.coins - h;
    if (h > 0 && lastDisp != null && v < lastDisp) v = Math.min(S.coins, lastDisp);
    lastDisp = v;
    return v;
  }
  function originFor(S, d) {
    var H = RH();
    if (!H) return {};
    if (d && typeof d.x === 'number' && typeof d.y === 'number') {
      var s = H.toScreen(d.x, d.y, 30);
      if (onScreen(H, s, 0)) return { x: s.x, y: s.y };
    }
    var pr = H.playerRect ? H.playerRect() : null;
    return pr ? { x: pr.cx, y: pr.y0 - 18 } : { x: H.cssW / 2, y: H.cssH * 0.55 };
  }
  function onHarvest(d) {
    var S = S0();
    if (!S || !d) return;
    var a = +d.amount || 0;
    if (!(a > 0)) return;
    M7.claim += a; M7.claimAt = jnow();
    var o = originFor(S, d);
    jara(a, { auto: !!d.auto, x: o.x, y: o.y });
    if (d.big && !d.auto) banner(L.t('fx_bigHarvest'), '+¥' + QT.G.fmt(a), '#f5b21c', 'harvest');
  }
  if (QT.G && typeof QT.G.on === 'function') QT.G.on('harvest', onHarvest);
  function goldConfetti(x, y, n) {
    var COL = ['#ffd23f', '#f5b21c', '#fff3ad', '#e09a00', '#ffffff'], cap = quality() < 0.8 ? CONF_MAX / 2 : CONF_MAX;
    for (var i = 0; i < n && confs.length < cap; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 120 + Math.random() * 220;
      confs.push({ x: x + (Math.random() - 0.5) * 60, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6,
                   vr: (Math.random() - 0.5) * 14, w: 4 + Math.random() * 4, h: 2.5 + Math.random() * 2.5,
                   col: COL[i % COL.length], life: 0, max: 1.6 + Math.random() * 0.9, ph: Math.random() * 6 });
    }
  }
  function tankFull(c, x, y, s) {
    tank.artAt = jnow();
    drawTank(c, x, y, s);
  }
  function drawTank(c, x, y, s) {
    s = s || 1;
    var t = jnow();
    c.save();
    for (var i = 0; i < 12; i++) {
      var ph = (t * 0.8 + i / 12) % 1, side = i % 2 ? 1 : -1, spread = 0.6 + (i % 3) * 0.25;
      var px = x + side * (5 + ph * 20 * spread) * s, py = y + (-8 * ph + 52 * ph * ph) * s;
      c.globalAlpha = Math.min(1, (1 - ph) * 1.6);
      blit(c, 2, (i + Math.floor(t * 14)) & 7, px, py, 0.62 * s);
    }
    c.globalAlpha = 1;
    var on = Math.floor(t * 4) % 2 === 0, fs = 11 * s, H = RH();
    c.font = '900 ' + fs + 'px ' + (H ? H.FONT : 'sans-serif');
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = Math.max(2, fs / 3.6); c.strokeStyle = '#2a1a40'; c.strokeText(L.t('fx_full'), x, y - 14 * s);
    c.fillStyle = on ? '#ffd23f' : '#ffffff'; c.fillText(L.t('fx_full'), x, y - 14 * s);
    c.restore();
  }
  function readFull() {
    var t = jnow();
    if (t - tank.checkAt < 0.25) return tank.full;
    tank.checkAt = t;
    var tr = num(call(DC(), 'tray')), mx = num(call(DC(), 'trayMax'));
    var full = tr != null && mx != null && mx > 0 && tr >= mx * 0.999;
    if (full && !tank.full) sfx('chirin');
    tank.full = full;
    return full;
  }
  function tankFallback(S, H) {
    if (!readFull()) return;
    if (jnow() - tank.artAt < 0.25) return;
    var W = QT.World, B = W.BY_ID || {}, p = B.dc || B.qcloud || B.dc_ops;
    if (!p || (S.p && S.p[p.id] && S.p[p.id].owned === false)) return;
    var s = H.toScreen((p.x + p.w / 2) * H.TILE, (p.y + p.h / 2) * H.TILE, H.H_PLOT + 14);
    if (!onScreen(H, s, 30)) return;
    drawTank(H.ctx, s.x, s.y, Math.max(0.9, H.z * 0.9));
  }
  if (QT.Art && QT.Art.on) QT.Art.on('ui', '*', function (S, H) { tankFallback(S, H); });
  function drawParts(c) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.ph === 0 || (p.ph === 3 && p.d > 0)) continue;
      var s = p.sc;
      if (p.ph === 2) s *= 1 - 0.3 * Math.min(1, p.ft / p.fdur);
      var f = Math.floor(p.t * (p.ph === 2 ? 26 : 16) + p.seed * 8) & 7;
      if (p.bill) blit(c, 4, f, p.x, p.y, s * 1.15);
      else blit(c, p.tier, f, p.x, p.y, s);
    }
  }
  function drawConfs(c) {
    for (var i = 0; i < confs.length; i++) {
      var cf = confs[i];
      c.save();
      c.globalAlpha = Math.max(0, Math.min(1, (cf.max - cf.life) / 0.4));
      c.translate(cf.x, cf.y); c.rotate(cf.rot); c.scale(1, Math.abs(Math.cos(cf.rot * 1.7)) * 0.8 + 0.2);
      c.fillStyle = cf.col; c.fillRect(-cf.w / 2, -cf.h / 2, cf.w, cf.h);
      c.restore();
    }
  }
  function drawJackpot(S, H, t) {
    var e = t - jp.at;
    if (e > 2.2) { jp = null; return; }
    var c = H.ctx, k = e < 0.3 ? easeOutBack(e / 0.3) : 1, out = e > 1.8 ? (e - 1.8) / 0.4 : 0;
    var fs = Math.min(46, H.cssW / 6.2), x = H.cssW / 2, y = H.hudBottom() + 14 + fs / 2;
    if (y + fs / 2 > H.cssH * 0.33 - 40) y = H.cssH * 0.33 + 84 + fs / 2;
    c.save();
    c.globalAlpha = Math.max(0, 1 - out);
    c.translate(x, y); c.rotate(-0.08 + Math.sin(e * 9) * 0.02); c.scale(k, k);
    var s = L.t('fx_jackpot');
    c.font = '900 ' + fs + 'px ' + H.FONT;
    var tw = c.measureText(s).width, cx = -tw / 2;
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), w = c.measureText(ch).width, dy = Math.sin(e * 10 + i * 0.7) * 3;
      c.lineWidth = fs / 4; c.strokeStyle = '#2a1a40'; c.strokeText(ch, cx, dy);
      c.fillStyle = H.rainbow ? H.rainbow(e, i) : '#ffd23f'; c.fillText(ch, cx, dy);
      cx += w;
    }
    c.restore();
  }
  function popW(H) {
    var t = jnow(), p = pops[pops.length - 1];
    if (!p || t - p.at > 1.4) return 0;
    var c = H.ctx;
    c.save(); c.font = '900 13px ' + H.FONT;
    var w = c.measureText('+¥' + QT.G.fmt(p.amt)).width + 10;
    c.restore();
    return w;
  }
  function drawPop(H, x, y) {
    var t = jnow();
    for (var i = pops.length - 1; i >= 0; i--) if (t - pops[i].at > 1.4) pops.splice(i, 1);
    if (!pops.length) return;
    var p = pops[pops.length - 1], e = t - p.at, k = e < 0.15 ? easeOutBack(e / 0.15) : 1;
    var a = e > 1.0 ? 1 - (e - 1.0) / 0.4 : 1, c = H.ctx;
    c.save();
    c.globalAlpha = Math.max(0, a);
    c.translate(x, y - Math.min(1, e / 1.4) * 8); c.scale(k, k);
    var s = '+¥' + QT.G.fmt(p.amt);
    c.font = '900 13px ' + H.FONT; c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    var bw = c.measureText(s).width + 10;
    c.beginPath();
    if (c.roundRect) c.roundRect(-5, -10, bw, 20, 10); else c.rect(-5, -10, bw, 20);
    c.fillStyle = 'rgba(255,255,255,0.96)'; c.fill();
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(224,154,0,0.55)'; c.stroke();
    c.lineWidth = 3.5; c.strokeStyle = '#ffffff'; c.strokeText(s, 0, 0);
    c.fillStyle = '#e09a00'; c.fillText(s, 0, 0);
    c.restore();
  }
  if (QT.Art && QT.Art.on) QT.Art.on('uiTop', '*', function (S, H) {
    sync(S);
    var t = jnow(), dt = jt.frozen ? 0 : Math.max(0, Math.min(0.05, t - (jt.last || t)));
    jt.last = t;
    step(dt);
    expire();
    readFull();
    if (S.won || S.gacha || jt.hidden) return;
    var c = H.ctx;
    if (topCur && topCur.type === 'raise') return;
    if (confs.length) drawConfs(c);
    if (parts.length) drawParts(c);
    if (jp) drawJackpot(S, H, t);
  });
  L.add({
    fx_buzz: ['バズった!', 'Gone viral!'],
    fx_buzzSub: ['+{n} フォロワー', '+{n} followers'],
    fx_raised: ['{r} {v} 調達!', '{r}: {v} raised!'],
    fx_valuation: ['評価額 {v}', 'Valuation {v}'],
    fx_prePost: ['プレ {a} + {b} → ポスト {c}', 'Pre {a} + {b} → Post {c}'],
    fx_from: ['{n} から', 'from {n}'],
    fx_stake: ['あなた {a}% → {b}%', 'You {a}% → {b}%'],
    fx_newHolder: ['{n} +{p}%', '{n} +{p}%'],
    fx_down: ['DOWN ROUND', 'DOWN ROUND'],
    fx_downSub: ['前回のポストを下回った', 'Below the last post-money'],
    fx_rdSeed: ['シード', 'Seed'],
    fx_rdSeries: ['シリーズ{x}', 'Series {x}'],
    fx_rdAngel: ['エンジェル', 'Angel'],
    fx_rdCvc: ['CVC', 'CVC'],
    fx_rdFamily: ['身内ラウンド', 'Friends & family'],
    fx_rdRound: ['ラウンド', 'Round'],
    fx_war: ['BIDDING WAR!!', 'BIDDING WAR!!'],
    fx_warHint: ['評価の高いほうに署名しよう（60秒）', 'Sign the better term sheet (60s)'],
    fx_warPre: ['プレマネー', 'Pre-money'],
    fx_capYou: ['あなた', 'You'],
    fx_capFamily: ['家族・親戚', 'Family'],
    fx_capEsop: ['ストックオプション', 'Stock options'],
    fx_capPublic: ['一般株主', 'Public'],
    fx_capAngel: ['エンジェル', 'Angels'],
    fx_capOther: ['ほかの株主', 'Others']
  });
  function CT() { return QT.Sim && QT.Sim.captable; }
  function SNS() { return QT.Sim && QT.Sim.sns; }
  function frac(v) { v = num(v); if (v == null) return null; return v > 1.0001 ? v / 100 : v; }
  function followers(S) {
    var v = num(call(SNS(), 'followers'));
    if (v == null && S && S.sns) v = num(S.sns.followers);
    return v == null ? 0 : Math.max(0, v);
  }
  function snsCards(S) {
    var r = call(SNS(), 'cards');
    if (!(r && r.length != null) && S && S.sns) r = S.sns.cards;
    return r && r.length != null ? r : [];
  }
  function snsOn(S) { return followers(S) > 0 || snsCards(S).length > 0; }
  function founderFrac(S) {
    var v = frac(call(CT(), 'founderPct'));
    if (v == null && S && S.cap && S.cap.h && num(S.cap.total)) v = (num(S.cap.h.founder) || 0) / S.cap.total;
    if (v == null && S) v = num(S.equity);
    return v == null ? 1 : Math.max(0, Math.min(1, v));
  }
  function listFind(list, id) {
    if (!list || id == null) return null;
    if (list.length != null) { for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i]; return null; }
    return list[id] || null;
  }
  function vcDef(id) {
    if (id == null) return null;
    if (typeof id === 'object') return id;
    var k = String(id).replace(/^vc_/, '');
    return listFind(QT.Data && QT.Data.vcs, k) || listFind(QT.Data && QT.Data.vcs, String(id));
  }
  function corpOf(k) {
    var id = String(k).replace(/^cvc_/, ''), W = QT.World;
    return (W && W.BY_ID && W.BY_ID[id]) || listFind(W && W.CORPS, id) || null;
  }
  var HOLD_PAL = ['#e2508a', '#2bb8d8', '#ef7d2e', '#8cc63f', '#d94bd0', '#3d8bfd', '#c98f0f', '#17a589'];
  function hashIdx(s) { s = String(s); var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function holderKind(k) {
    k = String(k);
    if (k === 'founder' || k === 'family' || k === 'esop' || k === 'public' || k === 'other') return k;
    if (/^cvc_/.test(k)) return 'cvc';
    if (/^angel/.test(k)) return 'angel';
    return 'vc';
  }
  function holderName(k) {
    var kd = holderKind(k);
    if (kd === 'founder') return L.t('fx_capYou');
    if (kd === 'family') return L.t('fx_capFamily');
    if (kd === 'esop') return L.t('fx_capEsop');
    if (kd === 'public') return L.t('fx_capPublic');
    if (kd === 'other') return L.t('fx_capOther');
    if (kd === 'angel') {
      var S = S0(), id = String(k).replace(/^angel_?/, ''), np = S && S.npcs && listFind(S.npcs, id);
      return np && np.name ? L.nm(np) : L.t('fx_capAngel');
    }
    if (kd === 'cvc') { var p = corpOf(k); return p ? (L.nm(p, 'short') || L.nm(p)) : String(k); }
    var d = vcDef(k);
    return d && d.name ? L.nm(d) : String(k);
  }
  function holderCol(k) {
    var kd = holderKind(k);
    if (kd === 'founder') return '#6f57e0';
    if (kd === 'family') return '#f5b21c';
    if (kd === 'esop') return '#2fbf7a';
    if (kd === 'public') return '#9a94ad';
    if (kd === 'other') return '#c8c2d8';
    if (kd === 'cvc') { var p = corpOf(k); if (p && p.color) return p.color; }
    if (kd === 'vc') { var d = vcDef(k); if (d && d.color) return d.color; }
    return HOLD_PAL[hashIdx(k) % HOLD_PAL.length];
  }
  function holderEmblem(c, x, y, r, k) {
    if (holderKind(k) === 'founder') { myEmblem(c, x, y, r); return; }
    var d = holderKind(k) === 'vc' ? vcDef(k) : null, col = holderCol(k);
    var s = (d && (L.get && L.get() === 'en' ? d.mark_en || d.mark : d.mark)) || holderName(k).replace(/^[\s「（(]+/, '').charAt(0);
    var RHh = RH();
    c.save();
    c.fillStyle = '#2a1a40'; c.beginPath(); c.arc(x, y, r + 2.5, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = Math.max(1, r * 0.08);
    c.beginPath(); c.arc(x, y, r * 0.78, 0, 7); c.stroke();
    c.font = '900 ' + Math.round(r * 0.95) + 'px ' + (RHh ? RHh.FONT : 'sans-serif');
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff';
    c.fillText(String(s).toUpperCase(), x, y + r * 0.04);
    c.restore();
  }
  function capParts(S) {
    var out = [];
    if (S && S.cap && S.cap.h && num(S.cap.total) > 0) {
      var tot = S.cap.total;
      Object.keys(S.cap.h).forEach(function (k) {
        var sh = num(S.cap.h[k]) || 0;
        if (sh > 0) out.push({ k: k, sh: sh, f: sh / tot, col: holderCol(k) });
      });
      out.sort(function (a, b) { return a.k === 'founder' ? -1 : b.k === 'founder' ? 1 : b.sh - a.sh; });
      return out;
    }
    var f = founderFrac(S);
    out.push({ k: 'founder', sh: null, f: f, col: holderCol('founder') });
    if (f < 0.9999) out.push({ k: 'other', sh: null, f: 1 - f, col: holderCol('other') });
    return out;
  }
  function donut(c, cx, cy, r, parts, rot, hole) {
    var a = -Math.PI / 2 + (rot || 0), tot = 0, ri = r * (hole || 0.58);
    parts.forEach(function (p) { tot += Math.max(0, p.f); });
    if (!(tot > 0)) return;
    parts.forEach(function (p) {
      var da = Math.max(0, p.f) / tot * Math.PI * 2;
      if (da <= 0.0005) return;
      c.beginPath(); c.arc(cx, cy, r, a, a + da); c.arc(cx, cy, ri, a + da, a, true); c.closePath();
      c.fillStyle = p.col; c.fill();
      a += da;
    });
    if (parts.length > 1) {
      a = -Math.PI / 2 + (rot || 0);
      c.save(); c.strokeStyle = '#ffffff'; c.lineWidth = 1.5;
      parts.forEach(function (p) {
        var da = Math.max(0, p.f) / tot * Math.PI * 2;
        if (da > 0.0005) { c.beginPath(); c.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke(); }
        a += da;
      });
      c.restore();
    }
  }
  function pct(f) { var v = f * 100; return v >= 9.95 || v === 0 ? String(Math.round(v)) : v.toFixed(1); }
  function yen(v) { return '¥' + QT.G.fmt(Math.max(0, v || 0)); }
  var HEART_MAX = 80;
  var hearts = [], hEntries = [], buzzTxt = null, heartBump = 0, heartImg = null;
  var heartAt = { x: 40, y: 52, at: -99 };
  var fol = { S: null, v: null, t: 0, claim: 0, claimAt: -99, disp: null, pend: null, pendAt: -99, lastBuzz: -99 };
  function heartPath(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.92);
    c.bezierCurveTo(x - s * 1.3, y + s * 0.05, x - s * 0.95, y - s * 1.12, x, y - s * 0.42);
    c.bezierCurveTo(x + s * 0.95, y - s * 1.12, x + s * 1.3, y + s * 0.05, x, y + s * 0.92);
    c.closePath();
  }
  function buildHeart() {
    var n = 44, cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    var c = cv.getContext('2d');
    heartPath(c, n / 2, n / 2 + 1.5, n * 0.42); c.fillStyle = '#7d1440'; c.fill();
    heartPath(c, n / 2, n / 2, n * 0.38); c.fillStyle = '#ff4f8b'; c.fill();
    c.save(); heartPath(c, n / 2, n / 2, n * 0.38); c.clip();
    c.fillStyle = 'rgba(160,20,70,0.35)'; c.beginPath(); c.arc(n * 0.72, n * 0.78, n * 0.36, 0, 7); c.fill();
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.ellipse(n * 0.34, n * 0.36, n * 0.075, n * 0.05, -0.6, 0, 7); c.fill();
    heartImg = cv;
  }
  function blitHeart(c, x, y, s, flip) {
    if (!heartImg) buildHeart();
    var d = 22 * s, w = d * (flip == null ? 1 : flip);
    c.drawImage(heartImg, x - w / 2, y - d / 2, w, d);
  }
  function heartGlyph(c, x, y, s, col) {
    heartPath(c, x, y, s); c.fillStyle = col || '#e2508a'; c.fill();
  }
  function heartRain(gain, o) {
    o = o || {};
    var H = RH(), W2 = H ? H.cssW : 390, H2 = H ? H.cssH : 844, t = jnow();
    var cap = quality() < 0.8 ? HEART_MAX / 2 : HEART_MAX;
    var n = o.buzz ? cap : Math.round(Math.max(5, Math.min(16, 4 + 3 * Math.log(Math.max(1, gain)) / Math.LN10)));
    n = Math.max(0, Math.min(n, cap - hearts.length));
    var e = { amt: Math.max(0, gain || 0), n: n, landed: 0, at: t, lag: o.buzz ? 3.4 : 2.0, released: n <= 0 };
    hEntries.push(e);
    var ox = o.x != null ? o.x : W2 / 2, oy = o.y != null ? o.y : H2 * 0.6;
    var pr = H && H.playerRect ? H.playerRect() : null, stopLo = H2 * 0.28, stopHi = H2 * 0.64;
    if (pr) stopHi = Math.max(stopLo + 30, Math.min(stopHi, pr.y0 - 12));
    for (var i = 0; i < n; i++) {
      var p = { e: e, ph: 0, t: 0, seed: Math.random(), s: 0.65 + Math.random() * 0.55 };
      if (o.buzz) {
        p.x = 12 + Math.random() * (W2 - 24); p.y = -16 - Math.random() * 30;
        p.vx = (Math.random() - 0.5) * 30; p.vy = 160 + Math.random() * 170;
        p.stop = stopLo + Math.random() * (stopHi - stopLo); p.d = Math.random() * 0.9; p.rain = true;
      } else {
        p.x = ox + (Math.random() - 0.5) * 28; p.y = oy;
        p.vx = (Math.random() - 0.5) * 170; p.vy = -(240 + Math.random() * 170); p.d = i * 0.04;
      }
      hearts.push(p);
    }
    if (o.buzz) { buzzTxt = { at: wall(), gain: gain || 0, e: e }; fol.lastBuzz = t; sfx('winSR'); }
    else if (n) sfx('good', 1.3);
    return e;
  }
  function heartFly(p) {
    var tg = heartAt;
    p.ph = 2; p.ft = 0; p.fx0 = p.x; p.fy0 = p.y;
    p.cx = p.x + (tg.x - p.x) * 0.3 + (p.seed - 0.5) * 140;
    p.cy = Math.min(p.y, tg.y) - 20 - p.seed * 60;
    if (p.cy < 4) p.cy = 4 + p.seed * 16;
    p.fdur = 0.34 + p.seed * 0.16;
  }
  var hTick = -1;
  function heartLand(p) {
    var e = p.e, t = jnow();
    e.landed++;
    heartBump = 1;
    if (t - hTick >= 1 / 30) { hTick = t; sfx('tick', 1.7 + (e.landed % 8) * 0.05); }
    if (e.landed >= e.n) sfx('chirin');
  }
  function heartStep(dt) {
    if (dt <= 0) return;
    for (var i = hearts.length - 1; i >= 0; i--) {
      var p = hearts[i];
      if (p.ph === 0) { p.d -= dt; if (p.d > 0) continue; p.ph = 1; }
      p.t += dt;
      if (p.ph === 1) {
        if (p.rain) {
          p.vy = Math.min(380, p.vy + 90 * dt);
          p.x += (p.vx + Math.sin(p.t * 4 + p.seed * 9) * 55) * dt; p.y += p.vy * dt;
          if (p.y >= p.stop || p.t > 2.2) heartFly(p);
        } else {
          p.vy += 760 * dt; p.vx *= 1 - 1.4 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if ((p.vy > -40 && p.t > 0.25) || p.t > 1.2) heartFly(p);
        }
      }
      if (p.ph === 2) {
        p.ft += dt;
        var k = Math.min(1, p.ft / p.fdur);
        if (k >= 1) { hearts.splice(i, 1); heartLand(p); continue; }
        var u = k * k, v = 1 - u, tg = heartAt;
        p.x = v * v * p.fx0 + 2 * v * u * p.cx + u * u * tg.x;
        p.y = v * v * p.fy0 + 2 * v * u * p.cy + u * u * tg.y;
      }
    }
    heartBump = Math.max(0, heartBump - dt * 4);
  }
  function heartExpire() {
    var t = jnow();
    for (var j = hEntries.length - 1; j >= 0; j--) {
      var e = hEntries[j];
      if (e.landed >= e.n || t - e.at >= e.lag) e.released = true;
      if (e.released) hEntries.splice(j, 1);
    }
  }
  function heartHeld() {
    var h = 0;
    for (var i = 0; i < hEntries.length; i++) { var e = hEntries[i]; if (!e.released && e.n > 0) h += e.amt * (1 - e.landed / e.n); }
    return h;
  }
  function camLocked() { var Rn = QT.Render; return !!(Rn && Rn.cam && Rn.cam.lock); }
  function folSync(S) {
    var F = followers(S), t = jnow();
    if (fol.S !== S || fol.v == null || Math.abs(S.t - fol.t) > 5 || S.offline) {
      fol.S = S; fol.v = F; fol.t = S.t; fol.claim = 0; fol.disp = F; fol.pend = null;
      hearts.length = 0; hEntries.length = 0;
      return;
    }
    var d = F - fol.v;
    fol.v = F; fol.t = S.t;
    if (fol.claim > 0 && d > 0) { var u = Math.min(d, fol.claim); d -= u; fol.claim -= u; }
    if (t - fol.claimAt > 0.8) fol.claim = 0;
    if (d > 0 && fol.pend && t - fol.pendAt < 0.8) { fol.pend.amt += d; if (buzzTxt) buzzTxt.gain += d; d = 0; }
    if (t - fol.pendAt >= 0.8) fol.pend = null;
    if (d >= Math.max(30, F * 0.01) && !S.won && !camLocked()) heartRain(d, {});
  }
  function folDisp(S) {
    var F = followers(S), h = heartHeld(), v = F - h;
    if (h > 0 && fol.disp != null && v < fol.disp) v = Math.min(F, fol.disp);
    fol.disp = v;
    return v;
  }
  function onPost(d) {
    var S = S0();
    if (!S) return;
    d = d || {};
    var gain = num(d.gain);
    if (gain == null) gain = num(d.followers);
    if (gain == null) gain = num(d.add);
    if (gain == null) gain = num(d.n);
    var m = num(d.meter);
    if (m == null) m = num(d.m);
    var buzz = !!(d.buzz || (m != null && m >= 0.9));
    var t = jnow();
    if (buzz && t - fol.lastBuzz < 0.6) return;
    if (gain != null && gain > 0) {
      fol.claim += gain; fol.claimAt = t;
      heartRain(gain, { buzz: buzz, x: num(d.sx), y: num(d.sy) });
    } else if (buzz) {
      fol.pend = heartRain(0, { buzz: true }); fol.pendAt = t;
    }
  }
  if (QT.G && typeof QT.G.on === 'function') {
    QT.G.on('post', function (d) { if (!d || d.kind !== 'press' || d.gain != null) onPost(d); });
    QT.G.on('buzz', function (d) { d = d || {}; d.buzz = true; onPost(d); });
  }
  var snsSeen = {};
  function cardKey(cd, i) { return cd && (cd.id != null ? cd.id : (cd.at != null ? 'a' + cd.at : 'i' + i)); }
  function snsFresh(S) {
    var cs = snsCards(S);
    for (var i = 0; i < cs.length; i++) if (!snsSeen[cardKey(cs[i], i)]) return true;
    return false;
  }
  function snsMarkSeen(S) { snsCards(S).forEach(function (cd, i) { snsSeen[cardKey(cd, i)] = true; }); }
  function fmtF(v) { return QT.G.fmt(Math.max(0, Math.floor(v))); }
  function heartChip(S, H, slot) {
    if (!slot || !snsOn(S)) return 0;
    var c = H.ctx, v = folDisp(S), s = fmtF(v);
    c.font = '800 10px ' + H.FONT;
    var tw = c.measureText(s).width, w = Math.ceil(tw + 25), h = 18;
    if (slot.maxW != null && w > slot.maxW) return 0;
    var x = slot.x, y = slot.cy - h / 2, sc = 1 + heartBump * 0.22;
    H.fillRR(x, y, w, h, 9, heartBump > 0.05 ? 'rgba(226,80,138,0.22)' : 'rgba(226,80,138,0.11)');
    c.save(); c.translate(x + 10, slot.cy); c.scale(sc, sc);
    heartGlyph(c, 0, 0.5, 5.6, '#e2508a');
    c.restore();
    H.txt(s, x + 19, slot.cy, 10, heartBump > 0.3 ? '#e2508a' : '#b02a66', 'left', 800);
    if (snsFresh(S)) {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + w - 2, y + 2, 4.2, 0, 7); c.fill();
      c.fillStyle = '#e2504a'; c.beginPath(); c.arc(x + w - 2, y + 2, 3, 0, 7); c.fill();
    }
    heartAt.x = x + 10; heartAt.y = slot.cy; heartAt.at = jnow();
    if (QT.UI) QT.UI.tapRect({ x: x - 4, y: slot.cy - 22, w: w + 8, h: 44 }, function () { return phoneOpen('sns'); });
    return w;
  }
  var topq = [], topCur = null, capSnap = { at: -99, parts: null, f: 1 }, RAISE_LIFE = 3.9, WAR_LIFE = 3.1;
  function paperBusy() { return !!(QT.PaperFx && QT.PaperFx.busy && QT.PaperFx.busy()); }
  function topBlocked(S) { return !!(S.won || S.gacha || S.showFinance || S.offline || (S.banners && S.banners.length) || paperBusy()); }
  function snapCap(S) {
    var t = jnow();
    if (t - capSnap.at < 0.5) return;
    capSnap = { at: t, parts: capParts(S), f: founderFrac(S) };
  }
  function lastRound(S) {
    var r = call(CT(), 'lastRound');
    if (!r && S && S.cap && S.cap.rounds && S.cap.rounds.length) r = S.cap.rounds[S.cap.rounds.length - 1];
    return r && typeof r === 'object' ? r : null;
  }
  function roundLabel(kind, nm) {
    if (kind === 'angel') return L.t('fx_rdAngel');
    if (kind === 'cvc') return L.t('fx_rdCvc');
    if (kind === 'family') return L.t('fx_rdFamily');
    if (typeof nm === 'number') nm = ['seed', 'A', 'B', 'C', 'D'][nm - 1] || nm;
    var k = String(nm == null ? '' : nm).trim(), lk = k.toLowerCase().replace(/^series\s*/, '');
    if (lk === 'seed') return L.t('fx_rdSeed');
    if (/^[a-f]$/.test(lk)) return L.t('fx_rdSeries', { x: lk.toUpperCase() });
    if (/^(angel|cvc|family)$/.test(lk)) return roundLabel(lk, null);
    return k || L.t('fx_rdRound');
  }
  function raiseLay(H) {
    var W2 = H.cssW, H2 = H.cssH, top = Math.max(H.hudBottom() + 6, H2 * 0.12);
    var u = Math.max(0.62, Math.min(1, (H2 - top - 16) / 410, W2 / 360));
    return { cx: W2 / 2, top: top, u: u, caseY: top + 92 * u };
  }
  function onRound(d) {
    var S = S0();
    if (!S) return;
    d = d || {};
    var r = lastRound(S), amt = num(d.amount);
    if (r && amt != null && num(r.amount) != null && Math.abs(num(r.amount) - amt) > Math.max(1, amt * 0.02)) r = null;
    if (amt == null && r) amt = num(r.amount);
    if (!(amt > 0)) return;
    var inv = d.investor || d.vc || d.holder || (r && (r.investor || r.holder)) || (d.corp ? 'cvc_' + (typeof d.corp === 'object' ? d.corp.id : d.corp) : null);
    if (inv && typeof inv === 'object') inv = inv.id || null;
    var kind = d.kind || (r && r.kind) || (inv && holderKind(inv) === 'cvc' ? 'cvc' : 'vc');
    var pre = num(d.pre), post = num(d.post);
    if (pre == null && r) pre = num(r.pre);
    if (post == null && r) post = num(r.post);
    if (post == null && pre != null) post = pre + amt;
    var down = !!(d.down || (r && r.down));
    if (!down && pre != null && r && S.cap && S.cap.rounds && S.cap.rounds.length >= 2 && r === S.cap.rounds[S.cap.rounds.length - 1]) {
      var pv = S.cap.rounds[S.cap.rounds.length - 2];
      if (num(pv.post) && pre < num(pv.post) * 0.999) down = true;
    }
    var it = { type: 'raise', kind: kind, amount: amt, name: roundLabel(kind, (r && r.name) || d.name || d.round), investor: inv,
               pre: pre, post: post, down: down, before: capSnap.parts || capParts(S), beforeF: capSnap.parts ? capSnap.f : founderFrac(S) };
    M7.claim += amt; M7.claimAt = jnow();
    var H = RH();
    if (H && !topCur && !topq.length && !topBlocked(S)) {
      var lay = raiseLay(H);
      it.coins = jara(amt, { x: lay.cx, y: lay.caseY - 10 * lay.u, delay: 0.62, quiet: true });
    }
    topq.push(it);
  }
  var lastWar = -99;
  function onWar(d) {
    var S = S0(), t = jnow();
    if (!S || !d || t - lastWar < 3) return;
    var a = d.a || d.holder || d.old, b = d.b || d.vc || d.rival;
    if (a && typeof a === 'object') a = a.id || a.vc;
    if (b && typeof b === 'object') b = b.id || b.vc;
    var from = num(d.from != null ? d.from : d.pre0), to = num(d.to != null ? d.to : d.pre);
    if (from == null || to == null) return;
    lastWar = t;
    topq.push({ type: 'war', a: a, b: b, from: from, to: Math.max(from, to) });
  }
  var sh = { S: null, seen: {}, at: -99 };
  function sheetsOf() { var r = call(CT(), 'sheets'); return r && r.length != null ? r : []; }
  function sheetVc(s) { var v = s && (s.vc || s.investor || s.firm || s.holder || s.by); return v && typeof v === 'object' ? v.id : v; }
  function sheetPre(s) { return num(s && (s.pre != null ? s.pre : s.preMoney)); }
  function sheetLive(s) { return s && !s.dead && !s.expired && !s.signed && !s.declined; }
  function sheetId(s, i) { return s.id != null ? s.id : sheetVc(s) + ':' + i; }
  function pollSheets(S) {
    var t = jnow();
    if (t - sh.at < 0.25) return;
    sh.at = t;
    var list = sheetsOf();
    if (sh.S !== S) { sh.S = S; sh.seen = {}; list.forEach(function (s, i) { sh.seen[sheetId(s, i)] = true; }); return; }
    list.forEach(function (s, i) {
      var id = sheetId(s, i);
      if (sh.seen[id]) return;
      sh.seen[id] = true;
      if (!sheetLive(s)) return;
      var old = null;
      list.forEach(function (o) { if (!old && o !== s && sheetLive(o) && sheetVc(o) !== sheetVc(s)) old = o; });
      var from = old ? sheetPre(old) : num(s.from != null ? s.from : s.pre0), to = sheetPre(s);
      if ((old || s.war || s.bidding) && from != null && to != null && to >= from) onWar({ a: old ? sheetVc(old) : s.rival, b: sheetVc(s), from: from, to: to });
    });
  }
  if (QT.G && typeof QT.G.on === 'function') {
    QT.G.on('roundClosed', onRound);
    QT.G.on('biddingWar', onWar);
    QT.G.on('bidWar', onWar);
  }
  function briefcase(H, x, y, w, h, k, t) {
    var c = H.ctx, lidH = h * 0.3, bodyY = y - h / 2 + lidH;
    if (k > 0) {
      c.save();
      c.globalAlpha *= Math.min(1, k * 1.6) * 0.55;
      c.translate(x, bodyY);
      c.rotate(t * 0.6);
      c.fillStyle = '#ffe58a';
      for (var i = 0; i < 12; i++) {
        c.rotate(Math.PI / 6);
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-w * 0.09, -w * 0.95); c.lineTo(w * 0.09, -w * 0.95); c.closePath(); c.fill();
      }
      c.restore();
    }
    if (k < 0.5) {
      c.save(); c.globalAlpha *= 1 - k * 2;
      c.strokeStyle = '#3d220c'; c.lineWidth = Math.max(3, w * 0.05); c.lineCap = 'round';
      c.beginPath(); c.moveTo(x - w * 0.16, y - h / 2 + 1); c.lineTo(x - w * 0.16, y - h / 2 - h * 0.14);
      c.lineTo(x + w * 0.16, y - h / 2 - h * 0.14); c.lineTo(x + w * 0.16, y - h / 2 + 1); c.stroke();
      c.restore();
    }
    if (k > 0) {
      var lh = h * 0.62 * Math.min(1, k);
      H.fillRR(x - w / 2, bodyY - lh - 2, w, lh + 6, 7, '#6b3e17');
      H.fillRR(x - w / 2 + 5, bodyY - lh + 3, w - 10, Math.max(0, lh - 4), 4, '#b8322d');
      for (var j = 0; j < 4; j++) {
        var bx = x - w / 2 + 10 + j * (w - 20) / 4, bw = (w - 20) / 4 - 4;
        H.fillRR(bx, bodyY - 9, bw, 14, 2, '#4f7a3c');
        H.fillRR(bx + 1, bodyY - 10, bw - 2, 11, 2, '#cfe7b4');
        c.fillStyle = '#c9a227'; c.fillRect(bx + bw / 2 - 2, bodyY - 10, 4, 11);
      }
    }
    H.fillRR(x - w / 2, bodyY - 2, w, h - lidH + 2, 7, '#5e3714');
    H.fillRR(x - w / 2 + 2, bodyY, w - 4, h - lidH - 3, 6, '#8a5526');
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - w / 2 + 6, bodyY + 5, w - 12, 3);
    H.fillRR(x - w / 2 + 3, y + h / 2 - 12, 12, 10, 3, '#d9b44a');
    H.fillRR(x + w / 2 - 15, y + h / 2 - 12, 12, 10, 3, '#d9b44a');
    if (k <= 0) {
      H.fillRR(x - w / 2, y - h / 2, w, lidH + 4, 7, '#6b3e17');
      H.fillRR(x - w / 2 + 2, y - h / 2 + 2, w - 4, lidH, 6, '#9a5f2b');
      c.fillStyle = '#4a2a0e'; c.fillRect(x - w / 2 + 2, bodyY - 1, w - 4, 2);
      H.fillRR(x - w * 0.3 - 7, bodyY - 6, 14, 11, 3, '#e8c45a');
      H.fillRR(x + w * 0.3 - 7, bodyY - 6, 14, 11, 3, '#e8c45a');
    } else {
      c.fillStyle = '#4a2a0e'; c.fillRect(x - w / 2 + 2, bodyY - 1, w - 4, 3);
      H.fillRR(x - w * 0.3 - 7, bodyY + 1, 14, 8, 3, '#e8c45a');
      H.fillRR(x + w * 0.3 - 7, bodyY + 1, 14, 8, 3, '#e8c45a');
    }
  }
  function billBurst(it, x, y) {
    it.bills = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 180 + Math.random() * 160;
      it.bills.push({ x: x + (Math.random() - 0.5) * 30, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, seed: Math.random() });
    }
  }
  function stepBills(it, dt) {
    if (!it || !it.bills || dt <= 0) return;
    for (var i = 0; i < it.bills.length; i++) {
      var b = it.bills[i];
      b.t += dt;
      b.vy = Math.min(90, b.vy + 520 * dt); b.vx *= 1 - 1.6 * dt;
      b.x += (b.vx + Math.sin(b.t * 5 + b.seed * 9) * 36) * dt; b.y += b.vy * dt;
    }
  }
  function drawBills(c, it) {
    if (!it.bills) return;
    var a0 = c.globalAlpha;
    for (var i = 0; i < it.bills.length; i++) {
      var b = it.bills[i];
      c.globalAlpha = a0 * Math.max(0, Math.min(1, (2.6 - b.t) / 0.5));
      blit(c, 4, Math.floor(b.t * 12 + b.seed * 8) & 7, b.x, b.y, 1.5);
    }
    c.globalAlpha = a0;
  }
  function popFit(H, s, x, y, size, maxW, fill, stroke, lw) {
    var c = H.ctx;
    c.font = '900 ' + size + 'px ' + H.FONT;
    var w = c.measureText(s).width, fs = w > maxW ? size * maxW / w : size;
    H.popTxt(s, x, y, fs, fill, stroke, lw);
  }
  function mixParts(a, b, k) {
    var map = {}, keys = [], out = [];
    (a || []).forEach(function (p) { map[p.k] = { k: p.k, f0: p.f, f1: 0, col: p.col }; keys.push(p.k); });
    (b || []).forEach(function (p) {
      if (map[p.k]) { map[p.k].f1 = p.f; map[p.k].col = p.col; }
      else { map[p.k] = { k: p.k, f0: 0, f1: p.f, col: p.col }; keys.push(p.k); }
    });
    keys.forEach(function (key) { var m = map[key]; out.push({ k: m.k, f: m.f0 + (m.f1 - m.f0) * k, col: m.col }); });
    return out;
  }
  function fracOf(parts, k) { for (var i = 0; parts && i < parts.length; i++) if (parts[i].k === k) return parts[i].f; return 0; }
  function drawRaise(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, lay = raiseLay(H), u = lay.u, cx = lay.cx, top = lay.top;
    var out = e > RAISE_LIFE - 0.4 ? (e - (RAISE_LIFE - 0.4)) / 0.4 : 0;
    c.save();
    c.globalAlpha = 1 - out;
    c.fillStyle = 'rgba(20,12,40,' + (0.42 * Math.min(1, e / 0.25)).toFixed(3) + ')'; c.fillRect(0, 0, W2, H.cssH);
    var drop = easeOutBack(e / 0.35), cy = lay.caseY - (1 - drop) * 160 * u;
    var shake = e > 0.35 && e < 0.6 ? Math.sin(e * 80) * 2.2 * u : 0;
    var open = Math.max(0, Math.min(1, (e - 0.6) / 0.22));
    c.save(); c.translate(cx + shake, cy); c.scale(u, u);
    briefcase(H, 0, 0, 132, 92, open, e);
    c.restore();
    if (open > 0 && !it.opened) {
      it.opened = true;
      sfx('jara'); sfx('fanfare');
      billBurst(it, cx, cy - 16 * u);
      if (H.confetti) H.confetti(50, cx, cy - 20 * u, 6.3);
      if (!it.coins) it.coins = jara(it.amount, { x: cx, y: cy - 10 * u, quiet: true });
    }
    drawBills(c, it);
    if (e >= 0.75) {
      var bk = Math.min(1, (e - 0.75) / 0.2), bs = bk < 1 ? 0.5 + 0.5 * easeOutBack(bk) : 1 + 0.02 * Math.sin(e * 6);
      var by = top + 186 * u, uu = Math.max(0.85, u);
      c.save(); c.translate(cx, by); c.rotate(-0.03); c.scale(bs, bs);
      var bw = Math.min(W2 - 24, 340), bh = 44 * uu;
      c.fillStyle = 'rgba(42,26,64,0.9)'; H.rr(-bw / 2 - 3, -bh / 2 - 3, bw + 6, bh + 6, 14); c.fill();
      H.fillRR(-bw / 2, -bh / 2, bw, bh, 12, it.down ? '#d63a34' : '#6f57e0');
      c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(-bw / 2 + 8, -bh / 2 + 4, bw - 16, 3);
      popFit(H, L.t('fx_raised', { r: it.name, v: yen(it.amount) }), 0, 1, 20, bw - 24, '#ffd23f', '#2a1a40', 5);
      c.restore();
      var sy = by + 36 * uu;
      if (it.post != null) popFit(H, L.t('fx_valuation', { v: yen(it.post) }), cx, sy, 17, W2 - 40, '#ffffff', '#2a1a40', 4);
      var ly = sy + 23 * uu;
      if (it.pre != null && it.post != null) popFit(H, L.t('fx_prePost', { a: yen(it.pre), b: yen(it.amount), c: yen(it.post) }), cx, ly, 11.5, W2 - 40, '#e9e3ff', '#2a1a40', 3);
      if (it.investor) popFit(H, L.t('fx_from', { n: holderName(it.investor) }), cx, ly + 18 * uu, 11.5, W2 - 40, '#ffd9ea', '#2a1a40', 3);
    }
    if (e >= 1.15) {
      if (!it.after) it.after = capParts(S);
      var dk = easeIO((e - 1.3) / 1.0), spin = (1 - easeOutBack(Math.min(1, (e - 1.15) / 0.7))) * Math.PI * 2.5;
      var dy = top + 336 * u, r = 40 * u, bw2 = Math.min(340, W2 - 24), bx2 = cx - bw2 / 2, dx = bx2 + 16 + r;
      var appear = Math.min(1, (e - 1.15) / 0.2);
      var parts = mixParts(it.before, it.after, dk);
      c.save(); c.globalAlpha *= appear;
      H.fillRR(bx2, dy - r - 12, bw2, r * 2 + 24, 16, 'rgba(255,255,255,0.95)');
      donut(c, dx, dy, r, parts, spin);
      var f0 = it.beforeF, f1 = it.after && it.after.length ? fracOf(it.after, 'founder') : founderFrac(S), fNow = f0 + (f1 - f0) * dk;
      H.txt(pct(fNow) + '%', dx, dy, 14 * Math.max(0.85, u), '#6f57e0', 'center', 900);
      var tx = dx + r + 14, tw = bx2 + bw2 - tx - 10;
      H.fitTxt(L.t('fx_stake', { a: pct(f0), b: pct(f1) }), tx, dy - 12 * u, 13, tw, '#2f2c46', 900, 9);
      if (it.investor) {
        var nf = fracOf(it.after, it.investor) - fracOf(it.before, it.investor);
        if (nf > 0.0005) {
          c.fillStyle = holderCol(it.investor); c.beginPath(); c.arc(tx + 5, dy + 12 * u, 5, 0, 7); c.fill();
          H.fitTxt(L.t('fx_newHolder', { n: holderName(it.investor), p: pct(nf) }), tx + 14, dy + 12 * u, 11.5, tw - 14, '#5b5670', 800, 8.5);
        }
      }
      c.restore();
    }
    if (it.down && e >= 1.6) {
      var sk = Math.min(1, (e - 1.6) / 0.16), ss = sk < 1 ? 2.2 - 1.2 * sk : 1;
      if (sk >= 1 && !it.stamped) { it.stamped = true; sfx('crack'); if (QT.Render && QT.Render.shake) QT.Render.shake(5, 0.25); }
      c.save(); c.translate(cx + 62 * u, lay.caseY - 6 * u); c.rotate(-0.22); c.scale(ss, ss);
      c.strokeStyle = '#e2504a'; c.lineWidth = 4; c.fillStyle = 'rgba(255,255,255,0.9)';
      H.rr(-86, -22, 172, 44, 8); c.fill(); c.stroke();
      H.txt(L.t('fx_down'), 0, -5, 20, '#e2504a', 'center', 900);
      H.fitTxt(L.t('fx_downSub'), -78, 13, 9.5, 156, '#e2504a', 800, 7.5);
      c.restore();
    }
    c.restore();
    if (QT.UI) QT.UI.tapRect({ x: 0, y: top - 10, w: W2, h: 390 * u + 40 }, function () { if (e > 1.2) it.end = true; return true; });
  }
  function drawWar(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, cx = W2 / 2, top = Math.max(H.hudBottom() + 8, H.cssH * 0.14);
    var out = e > WAR_LIFE - 0.35 ? (e - (WAR_LIFE - 0.35)) / 0.35 : 0;
    c.save();
    c.globalAlpha = 1 - out;
    c.fillStyle = 'rgba(20,12,40,' + (0.5 * Math.min(1, e / 0.2)).toFixed(3) + ')'; c.fillRect(0, 0, W2, H.cssH);
    var ly = top + 128, bandH = 136, bk = Math.min(1, e / 0.18);
    c.save(); c.translate(cx, ly); c.rotate(-0.06); c.scale(1, bk);
    c.fillStyle = '#2a1a40'; c.fillRect(-W2, -bandH / 2 - 4, W2 * 2, bandH + 8);
    c.fillStyle = '#ffd23f'; c.fillRect(-W2, -bandH / 2, W2 * 2, bandH);
    stripes(c, -W2, -bandH / 2, W2 * 2, 9, '#2a1a40', e * 60);
    stripes(c, -W2, bandH / 2 - 9, W2 * 2, 9, '#2a1a40', -e * 60);
    c.restore();
    var ink = easeOutBack(e / 0.3), r = Math.min(32, W2 * 0.082), side = Math.min(W2 * 0.33, 140);
    var STEPS = 8, k = Math.max(0, Math.min(1, (e - 0.55) / 1.5)), step = Math.min(STEPS, Math.floor(k * STEPS + 0.0001));
    if (step !== it.step) {
      it.step = step;
      if (step > 0) sfx('tick', 1 + step * 0.08);
      if (step >= STEPS) { sfx('fanfare'); for (var f = 0; f < 3; f++) firework(cx + (f - 1) * W2 * 0.3, top + 60 + Math.random() * 40, 22); }
    }
    var bidder = step >= STEPS ? 'b' : step % 2 === 1 ? 'b' : 'a';
    [['a', -1], ['b', 1]].forEach(function (q) {
      var x = cx + q[1] * (side + (1 - ink) * W2 * 0.6), y = ly - 10, hot = bidder === q[0] && k > 0 && step < STEPS;
      var win = step >= STEPS && q[0] === 'b';
      var bump = hot ? 1 + 0.12 * Math.abs(Math.sin((k * STEPS - step) * Math.PI)) : win ? 1.08 + 0.04 * Math.sin(e * 8) : 1;
      if (win) { c.save(); c.globalAlpha *= 0.45 + 0.3 * Math.sin(e * 9); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r * 1.45, 0, 7); c.fill(); c.restore(); }
      c.save(); c.translate(x, y); c.scale(bump, bump);
      holderEmblem(c, 0, 0, r, it[q[0]] || (q[0] === 'a' ? 'other' : 'vc'));
      c.restore();
      if (hot) H.txt('▲', x + q[1] * (r + 6), y - r + 2, 13, '#e2504a', 'center', 900);
      popFit(H, it[q[0]] ? holderName(it[q[0]]) : '?', x, y + r + 17, 12, side * 0.95, '#2a1a40', '#ffffff', 3);
    });
    var v = it.from + (it.to - it.from) * (step / STEPS);
    if (k > 0 && step < STEPS) v += (it.to - it.from) / STEPS * Math.random() * 0.6;
    var vsz = Math.min(28, W2 / 11);
    c.save(); c.translate(cx, ly - 16);
    var vb = step >= STEPS ? 1.12 + 0.03 * Math.sin(e * 10) : 1 + 0.06 * Math.abs(Math.sin(k * STEPS * Math.PI));
    c.scale(vb, vb);
    popFit(H, yen(v), 0, 0, vsz, side * 2 - r * 2 - 34, step >= STEPS ? '#ffd23f' : '#ffffff', '#2a1a40', 6);
    c.restore();
    H.txt(L.t('fx_warPre'), cx, ly + 14, 10.5, '#2a1a40', 'center', 900);
    var tk = Math.min(1, Math.max(0, (e - 0.15) / 0.18)), ts = e < 0.15 ? 0 : tk < 1 ? 2.6 - 1.6 * tk : 1 + 0.025 * Math.sin(e * 9);
    if (ts > 0) {
      if (!it.slam) { it.slam = true; if (QT.Render && QT.Render.shake) QT.Render.shake(6, 0.3); sfx('crack'); }
      c.save(); c.translate(cx, top + 30); c.rotate(-0.07); c.scale(ts, ts);
      H.popTxt(L.t('fx_war'), 0, 0, Math.min(40, W2 / 9.6), '#ff5a5a', '#2a1a40', 8);
      c.restore();
    }
    if (step >= STEPS) {
      popFit(H, yen(it.from) + '  →  ' + yen(it.to), cx, ly + bandH / 2 + 28, 17, W2 - 40, '#ffffff', '#2a1a40', 4);
      popFit(H, L.t('fx_warHint'), cx, ly + bandH / 2 + 52, 12, W2 - 40, '#ffe58a', '#2a1a40', 3);
    }
    c.restore();
    if (QT.UI) QT.UI.tapRect({ x: 0, y: top - 10, w: W2, h: bandH + 190 }, function () { if (e > 0.8) it.end = true; return true; });
  }
  function drawBuzz(S, H, t) {
    var e = t - buzzTxt.at;
    if (e > 2.4) { buzzTxt = null; return; }
    var c = H.ctx, W2 = H.cssW, k = e < 0.28 ? easeOutBack(e / 0.28) : 1, out = e > 2.0 ? (e - 2.0) / 0.4 : 0;
    var y = Math.max(H.hudBottom() + 40, H.cssH * 0.2), fs = Math.min(50, W2 / 6.4);
    c.save();
    c.globalAlpha = Math.max(0, 1 - out);
    c.translate(W2 / 2, y); c.rotate(-0.07 + Math.sin(e * 8) * 0.02); c.scale(k, k);
    var s = L.t('fx_buzz');
    c.font = '900 ' + fs + 'px ' + H.FONT;
    var tw = c.measureText(s).width, x0 = -tw / 2;
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), w = c.measureText(ch).width, dy = Math.sin(e * 11 + i * 0.8) * 3.5;
      c.lineWidth = fs / 4; c.strokeStyle = '#7d1440'; c.strokeText(ch, x0, dy);
      c.fillStyle = i % 2 ? '#ff7aa8' : '#ff4f8b'; c.fillText(ch, x0, dy);
      x0 += w;
    }
    c.restore();
    var g = buzzTxt.gain;
    if (g > 0 && e > 0.3) {
      c.save(); c.globalAlpha = Math.max(0, 1 - out);
      popFit(H, L.t('fx_buzzSub', { n: fmtF(g) }), W2 / 2, y + fs * 0.78, 15, W2 - 40, '#ffffff', '#7d1440', 4);
      c.restore();
    }
  }
  function drawHearts(c) {
    for (var i = 0; i < hearts.length; i++) {
      var p = hearts[i];
      if (p.ph === 0) continue;
      var s = p.s * (p.ph === 2 ? 1 - 0.4 * Math.min(1, p.ft / p.fdur) : 1);
      blitHeart(c, p.x, p.y, s, 0.55 + 0.45 * Math.abs(Math.cos(p.t * 3 + p.seed * 6)));
    }
  }
  var topLast = 0;
  QT.UI.panel('fxTop', {
    layer: 'sheet',
    draw: function (S, H) {
      var t = wall(), dt = Math.max(0, Math.min(0.05, t - (topLast || t)));
      topLast = t;
      if (!S) return;
      folSync(S);
      heartStep(dt);
      if (topCur) stepBills(topCur, dt);
      heartExpire();
      pollSheets(S);
      if (!topCur) snapCap(S);
      var c = H.ctx;
      if (!topCur && topq.length && !topBlocked(S)) {
        topCur = topq.shift(); topCur.at = t;
        if (topCur.type === 'war') sfx('notice');
        else if (!topCur.coins) {
          var lay = raiseLay(H);
          topCur.coins = jara(topCur.amount, { x: lay.cx, y: lay.caseY - 10 * lay.u, delay: 0.62, quiet: true });
        }
      }
      if (topCur) {
        var e = t - topCur.at, life = topCur.type === 'war' ? WAR_LIFE : RAISE_LIFE;
        if (e > life || topCur.end || S.won || S.gacha) topCur = null;
        else if (topCur.type === 'war') drawWar(S, H, topCur, e);
        else {
          drawRaise(S, H, topCur, e);
          if (confs.length) drawConfs(c);
          if (parts.length) drawParts(c);
        }
      }
      if (S.won || S.gacha) return;
      if (hearts.length) drawHearts(c);
      if (buzzTxt) drawBuzz(S, H, t);
    }
  });
  L.add({
    fx_moved: ['お引っ越し!', 'Moving day!'],
    fx_movedDown: ['住み替え…', 'Downsizing…'],
    fx_movedSub: ['{a} → {b}', '{a} → {b}'],
    fx_trophy: ['棚に飾りました', 'Added to your shelf'],
    fx_trophyMore: ['ほか {n} 個', '+{n} more']
  });
  var lifeq = [], lifeCur = null, MOVE_LIFE = 3.2, TROPHY_LIFE = 2.4;
  function tierName(i) {
    var hs = QT.Sim && QT.Sim.home, d = hs && hs.tiers ? hs.tiers()[i] : null;
    return d ? (L.nm(d, 'short') || L.nm(d)) : 'T' + i;
  }
  function houseGlyph(c, tier, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k, k);
    c.lineJoin = 'round'; c.strokeStyle = '#2a1a40'; c.lineWidth = 1.6;
    function box(bx, by, w, h, col) { c.fillStyle = col; c.fillRect(bx, by, w, h); c.strokeRect(bx, by, w, h); }
    function win(bx, by, w, h) { c.fillStyle = '#ffe28a'; c.fillRect(bx, by, w, h); }
    if (tier <= 0) {
      box(-14, -18, 28, 18, '#f6ecd8');
      c.beginPath(); c.moveTo(-18, -17); c.lineTo(0, -31); c.lineTo(18, -17); c.closePath(); c.fillStyle = '#d8503a'; c.fill(); c.stroke();
      win(-9, -13, 6, 5); win(3, -13, 6, 5);
    } else if (tier === 1) {
      box(-15, -30, 26, 30, '#efdcb8');
      c.beginPath(); c.moveTo(-15, -15); c.lineTo(11, -15); c.stroke();
      c.fillStyle = '#7c6f73'; c.fillRect(-17, -33, 30, 4);
      win(-2, -25, 5, 5); c.fillStyle = '#5a6a80'; c.fillRect(-11, -25, 5, 5); c.fillRect(-11, -10, 5, 5); c.fillRect(-2, -10, 5, 5);
      c.strokeStyle = '#6f6658'; c.beginPath(); c.moveTo(11, 0); c.lineTo(17, -15); c.stroke();
    } else if (tier === 2) {
      box(-15, -36, 30, 36, '#f2f1ec');
      for (var f = 0; f < 4; f++) { c.fillStyle = f === 2 ? '#ffe28a' : '#7fb6e0'; c.fillRect(-11, -32 + f * 8, 22, 4); }
    } else if (tier === 3) {
      box(-9, -46, 18, 46, '#9fc6e6');
      c.strokeStyle = 'rgba(42,26,64,0.35)'; c.lineWidth = 0.8;
      for (var g = -40; g < 0; g += 6) { c.beginPath(); c.moveTo(-9, g); c.lineTo(9, g); c.stroke(); }
      win(-7, -34, 14, 3);
    } else if (tier === 4) {
      box(-9, -46, 18, 46, '#9fc6e6');
      c.fillStyle = '#4fd0f0'; c.fillRect(-8, -49, 16, 3);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(-7, -50); c.lineTo(-4, -56); c.lineTo(0, -51); c.lineTo(4, -56); c.lineTo(7, -50); c.closePath(); c.fill(); c.stroke();
      win(-7, -44, 14, 3);
    } else {
      box(-17, -20, 34, 20, '#f6efe2');
      c.beginPath(); c.moveTo(-21, -19); c.lineTo(-10, -30); c.lineTo(10, -30); c.lineTo(21, -19); c.closePath(); c.fillStyle = '#3a3550'; c.fill(); c.stroke();
      win(-12, -14, 7, 6); win(5, -14, 7, 6);
      c.fillStyle = '#2f8a45'; c.beginPath(); c.ellipse(22, -12, 6, 4, 0, 0, 7); c.fill();
    }
    c.restore();
  }
  function truckGlyph(c, x, y, k, t) {
    c.save(); c.translate(x, y); c.scale(k, k);
    var bob = Math.abs(Math.sin(t * 14)) * 1.2;
    c.lineJoin = 'round'; c.strokeStyle = '#2a1a40'; c.lineWidth = 1.5;
    c.fillStyle = '#d8a866';
    c.fillRect(-15, -22 - bob, 8, 7); c.strokeRect(-15, -22 - bob, 8, 7);
    c.fillRect(-6, -20 - bob * 0.6, 7, 5); c.strokeRect(-6, -20 - bob * 0.6, 7, 5);
    c.fillStyle = '#ffffff'; c.fillRect(-17, -15, 20, 11); c.strokeRect(-17, -15, 20, 11);
    c.fillStyle = '#2bb8d8'; c.fillRect(3, -13, 10, 9); c.strokeRect(3, -13, 10, 9);
    c.fillStyle = '#cfeaf7'; c.fillRect(7, -11, 5, 4);
    c.fillStyle = '#e2508a'; c.fillRect(-15, -11, 16, 3);
    c.fillStyle = '#2a1a40'; c.beginPath(); c.arc(-11, -3, 2.6, 0, 7); c.arc(8, -3, 2.6, 0, 7); c.fill();
    c.restore();
  }
  function bandBottom(H) {
    var b = H.hudBottom() + 8, gh = QT.Guide && QT.Guide.hits ? QT.Guide.hits() : null;
    if (gh && gh.next) b = Math.max(b, gh.next.y + gh.next.h + 6);
    else b += 44;
    return b;
  }
  function lifeY(H, h) {
    var y = bandBottom(H), pr = H.playerRect ? H.playerRect() : null;
    if (pr && y + h > pr.y0 - 4) y = Math.max(H.hudBottom() + 4, pr.y0 - 4 - h);
    return y;
  }
  function drawMove(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, w = Math.min(320, W2 - 24), h = 96, x = (W2 - w) / 2;
    var y = lifeY(H, h);
    var inK = e < 0.25 ? easeOutBack(e / 0.25) : 1, out = e > MOVE_LIFE - 0.3 ? (e - (MOVE_LIFE - 0.3)) / 0.3 : 0;
    var down = it.why === 'rent';
    c.save();
    c.globalAlpha = Math.max(0, 1 - out);
    c.translate(W2 / 2, y + h / 2); c.scale(inK, inK); c.translate(-W2 / 2, -(y + h / 2));
    c.fillStyle = 'rgba(42,26,64,0.3)'; H.rr(x, y + 3, w, h, 14); c.fill();
    H.fillRR(x, y, w, h, 14, down ? '#fff3e6' : '#fff5fb');
    H.strokeRR(x + 1, y + 1, w - 2, h - 2, 13, down ? '#f2a63b' : '#e2508a', 2.5);
    H.popTxt(L.t(down ? 'fx_movedDown' : 'fx_moved'), W2 / 2, y + 16, 17, down ? '#f2a63b' : '#e2508a', '#ffffff', 4);
    var gy = y + h - 22, lx = x + 34, rx = x + w - 34;
    c.fillStyle = '#d6d2e0'; c.fillRect(lx, gy - 1, rx - lx, 3);
    c.globalAlpha *= 0.55; houseGlyph(c, it.from, lx, gy, 1.05); c.globalAlpha = Math.max(0, 1 - out);
    var arrive = Math.max(0, Math.min(1, (e - 2.0) / 0.35));
    houseGlyph(c, it.tier, rx, gy, 1.05 + 0.12 * easeOutBack(arrive));
    var k = easeIO(Math.max(0, Math.min(1, (e - 0.4) / 1.8)));
    truckGlyph(c, lx + 18 + (rx - lx - 42) * k, gy + 1, 1.15, e);
    if (arrive > 0 && !down) {
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2 + e * 2, r = 10 + arrive * 14;
        c.fillStyle = FW_COL[i % FW_COL.length];
        c.fillRect(rx + Math.cos(a) * r - 1.5, gy - 30 + Math.sin(a) * r * 0.6 - 1.5, 3, 3);
      }
    }
    H.fitTxt(L.t('fx_movedSub', { a: tierName(it.from), b: tierName(it.tier) }), W2 / 2 - (w - 110) / 2, y + 36, 12, w - 110, '#2a1a40', 800, 8);
    c.restore();
  }
  function drawTrophyToast(S, H, it, e) {
    var c = H.ctx, W2 = H.cssW, w = Math.min(270, W2 - 24), h = 44;
    var y = lifeY(H, h);
    var k = e < 0.22 ? easeOutBack(e / 0.22) : e > TROPHY_LIFE - 0.25 ? 1 - easeIO((e - (TROPHY_LIFE - 0.25)) / 0.25) : 1;
    var x = -w - 8 + (w + 20) * k;
    var hs = QT.Sim && QT.Sim.home, d = hs && hs.trophyDef ? hs.trophyDef(it.id) : null;
    if (!d) return;
    c.save();
    c.fillStyle = 'rgba(42,26,64,0.3)'; H.rr(x, y + 2, w, h, 12); c.fill();
    H.fillRR(x, y, w, h, 12, '#2f2c46');
    H.strokeRR(x + 1, y + 1, w - 2, h - 2, 11, '#f5b21c', 2);
    var hsUi = QT.UI && QT.UI.get && QT.UI.get('homesheet');
    c.save(); c.translate(x + 24, y + h / 2); c.rotate(e * 2);
    c.fillStyle = 'rgba(245,178,28,0.35)';
    for (var r = 0; r < 8; r++) { c.rotate(Math.PI / 4); c.fillRect(-1.2, 12, 2.4, 5); }
    c.restore();
    if (hsUi && hsUi.icon) hsUi.icon(c, d.cat, d.color, x + 10, y + h / 2 - 14, 28, d.id);
    H.fitTxt(L.t('fx_trophy') + (it.more ? '  ' + L.t('fx_trophyMore', { n: it.more }) : ''), x + 44, y + 13, 10, w - 52, '#f5b21c', 800, 8);
    H.fitTxt(L.nm(d), x + 44, y + 29, 12.5, w - 52, '#ffffff', 900, 8);
    c.restore();
  }
  function onMoved(d) {
    if (!d) return;
    for (var i = lifeq.length - 1; i >= 0; i--) if (lifeq[i].type === 'move') lifeq.splice(i, 1);
    lifeq.unshift({ type: 'move', tier: +d.tier || 0, from: +d.from || 0, why: d.why });
  }
  function onTrophy(d) {
    if (!d || !d.id) return;
    var n = 0, last = null;
    for (var i = 0; i < lifeq.length; i++) if (lifeq[i].type === 'trophy') { n++; last = lifeq[i]; }
    if (n >= 3 && last) { last.more = (last.more || 0) + 1; return; }
    lifeq.push({ type: 'trophy', id: d.id });
  }
  if (QT.G && typeof QT.G.on === 'function') { QT.G.on('moved', onMoved); QT.G.on('trophy', onTrophy); }
  QT.UI.panel('fxLife', {
    layer: 'sheet',
    draw: function (S, H) {
      var t = wall();
      if (!S) return;
      if (camLocked() && frozen == null) { lifeq.length = 0; lifeCur = null; return; }
      if (frozen == null && (S.won || S.gacha || topCur || (S.banners && S.banners.length))) { if (lifeCur) lifeCur.at = t - Math.min(t - lifeCur.at, 0.3); return; }
      if (!lifeCur && lifeq.length) { lifeCur = lifeq.shift(); lifeCur.at = t; if (lifeCur.type === 'trophy') sfx('trophy'); }
      if (!lifeCur) return;
      var e = t - lifeCur.at, life = lifeCur.type === 'move' ? MOVE_LIFE : TROPHY_LIFE;
      if (e > life) { lifeCur = null; return; }
      if (lifeCur.type === 'move') drawMove(S, H, lifeCur, e);
      else drawTrophyToast(S, H, lifeCur, e);
    }
  });
  QT.FX = {
    hudChip: hudChip, chips: chips, bannerDeco: bannerDeco,
    busy: function () { return !!(cur || topCur); },
    addChip: function (fn) { if (typeof fn === 'function') extra.push(fn); },
    broken: function () { return broken; },
    snap: function () { return snap; },
    evState: evState,
    stopped: function () { return snap.down ? snap.stopped.slice() : []; },
    appFallback: drawAppFallback, webGlyph: webGlyph, partName: partName,
    rankChips: rankChips, race: function () { var S = S0(); return S ? race(S) : null; },
    ranks: function () { return { qp: rk.qp, cap: rk.cap }; },
    rankNew: function () { return rk.fresh; }, rankSeen: function () { rk.fresh = false; },
    ranksFallback: drawRanksFallback, flag: flag, atomGlyph: atomGlyph, chartGlyph: chartGlyph,
    trophyGlyph: trophyGlyph, myEmblem: myEmblem, rivalName: rivalName,
    cash: cash, hudBump: function () { return bump; }, drawCashPop: drawPop, cashPopW: popW,
    jaraRecent: function () { return jnow() - lastJara < 0.3; },
    jara: function (amount, o) { return jara(amount, o); },
    fly: function (amount, wx, wy, o) {
      var S = S0(), H = RH();
      if (!S || !H || !(amount > 0)) return null;
      var s = H.toScreen(wx, wy, 34);
      if (!onScreen(H, s, 0)) return null;
      M7.claim += amount; M7.claimAt = jnow();
      o = o || {};
      return jara(amount, { small: !!o.small, quiet: !!o.quiet, swirl: o.swirl !== false, x: s.x, y: s.y });
    },
    flyAuto: function (amount) {
      if (!(amount > 0)) return null;
      M7.claim += amount; M7.claimAt = jnow();
      return jara(amount, { auto: true });
    },
    tankFull: tankFull, trayFull: function () { return readFull(); },
    coinSprite: function (c, tier, f, x, y, s) { blit(c, tier, f, x, y, s); },
    heartChip: heartChip, busy: function () { return !!topCur || topq.length > 0; },
    snsChipNative: true,
    heartGlyph: heartGlyph, heartSprite: blitHeart, heartAt: function () { return { x: heartAt.x, y: heartAt.y }; },
    followersShown: function (S) { return folDisp(S || S0()); }, snsFresh: function (S) { return snsFresh(S || S0()); },
    snsSeen: function (S) { snsMarkSeen(S || S0()); }, snsOn: function (S) { return snsOn(S || S0()); },
    heartRain: function (gain, o) { return heartRain(gain, o); },
    cap: { parts: capParts, name: holderName, col: holderCol, kind: holderKind, emblem: holderEmblem, donut: donut,
           founder: founderFrac, vc: vcDef, label: roundLabel, pct: pct },
    test: {
            jara: function (amount, o, sec) {
              var e = o && o.harvest ? (onHarvest({ amount: amount, big: !!o.big, auto: !!o.auto }), entries[entries.length - 1]) : jara(amount, o);
              jt.frozen = sec != null;
              for (var k = 0; sec != null && k < Math.round(sec * 60); k++) step(1 / 60);
              return e ? { n: e.n, landed: e.landed, held: Math.round(held()) } : null;
            },
            jaraStats: function () { return { parts: parts.length, entries: entries.length, held: held(), confs: confs.length, cap: poolCap() }; },
            jaraFreeze: function (on) { jt.frozen = !!on; },
            jaraStep: function (sec) { for (var k = 0; k < Math.round(sec * 60); k++) step(1 / 60); },
            jaraHide: function (on) { jt.hidden = !!on; },
            jaraClear: function () { parts.length = 0; entries.length = 0; confs.length = 0; pops.length = 0; jp = null; lastJackpot = -99; jt.frozen = false; jt.hidden = false; }, broken: showBroken, saved: showSaved, reset: function () { snap.at = -9; epi = null; shieldUntil = 0; last.bneck = last.saved = last.alarm = -99; },
            rank: function (kind, from, to, extra) { var S = S0(); if (S) { syncRanks(S); rk[kind] = from; confirmRank(S, kind, to, from, extra); } },
            vs: function (rival, corp) { fxq.unshift({ type: 'vs', rival: rival, corp: corp || '' }); },
            raceEnd: onRaceEnd, raceStart: onRaceStart,
            freeze: function (t) { frozen = t == null ? null : t; },
            raise: function (d) { onRound(d); }, war: function (d) { lastWar = -99; onWar(d); },
            post: function (d) { fol.lastBuzz = -99; onPost(d); },
            m8: function () { return { hearts: hearts.length, held: heartHeld(), topq: topq.length, cur: topCur ? topCur.type : null, cap: HEART_MAX }; },
            m8Frame: function (e) {
              frozen = performance.now() / 1000;
              if (!topCur && topq.length) { topCur = topq.shift(); }
              if (!topCur) return null;
              topCur.at = frozen - e;
              var H = RH();
              if (topCur.type === 'raise' && H && e > 0.6) {
                var lay = raiseLay(H);
                topCur.opened = true; billBurst(topCur, lay.cx, lay.caseY - 16 * lay.u);
                for (var k = 0; k < Math.round((e - 0.6) * 60); k++) stepBills(topCur, 1 / 60);
                jt.frozen = true;
                for (k = 0; k < Math.round(e * 60); k++) step(1 / 60);
              }
              return topCur.type;
            },
            m8Step: function (sec) { for (var k = 0; k < Math.round(sec * 60); k++) heartStep(1 / 60); if (frozen != null) frozen += sec; },
            m8Clear: function () { hearts.length = 0; hEntries.length = 0; buzzTxt = null; topq.length = 0; topCur = null; },
            life: function (d, e) {
              lifeq.length = 0; lifeCur = null;
              if (d.type === 'move') onMoved(d); else onTrophy(d);
              lifeCur = lifeq.shift(); frozen = performance.now() / 1000; lifeCur.at = frozen - (e || 0);
              return lifeCur.type;
            },
            clear: function () { fxq.length = 0; cur = null; slides.length = 0; slideCur = null; lastRankUp = -99; sparks.length = 0; } }
  };
})(window.QT || (window.QT = {}));
