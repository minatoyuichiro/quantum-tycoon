(function (QT) {
  'use strict';
  var panels = [], byId = {}, rects = [], errors = {};
  function panel(id, def) {
    def = def || {};
    def.id = id;
    var old = byId[id];
    if (old) panels[panels.indexOf(old)] = def;
    else panels.push(def);
    byId[id] = def;
    return def;
  }
  function tapRect(r, fn) {
    if (!r || !fn) return;
    rects.push({ x: r.x, y: r.y, w: r.w, h: r.h, fn: fn });
  }
  function begin() { rects.length = 0; }
  function guard(tag, fn, args) {
    try { return fn.apply(null, args); }
    catch (e) {
      if (!errors[tag]) { errors[tag] = String((e && e.stack) || e); console.error('[ui] ' + tag, e); }
      return undefined;
    }
  }
  function draw(layer, S, H) {
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      if ((p.layer || 'hud') === layer && p.draw) guard(p.id + '/draw', p.draw, [S, H]);
    }
  }
  function inside(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function tap(p, S) {
    for (var i = rects.length - 1; i >= 0; i--) {
      if (!inside(p, rects[i])) continue;
      if (guard('tap', rects[i].fn, [p, S]) !== false) return true;
    }
    return false;
  }
  function hits(p) {
    var out = [];
    for (var i = rects.length - 1; i >= 0; i--) if (inside(p, rects[i])) out.push(rects[i]);
    return out;
  }
  function run(list, p, S) {
    for (var i = 0; i < list.length; i++) if (guard('tap', list[i].fn, [p, S]) !== false) return true;
    return false;
  }
  function swipe(dx, dy, p0) {
    for (var i = panels.length - 1; i >= 0; i--) {
      var p = panels[i];
      if (p.swipe && (!p.isOpen || p.isOpen()) && guard(p.id + '/swipe', p.swipe, [dx, dy, p0]) === true) return true;
    }
    return false;
  }
  function anyOpen() {
    for (var i = 0; i < panels.length; i++) if (panels[i].isOpen && panels[i].isOpen()) return panels[i].id;
    return null;
  }
  QT.UI = {
    panel: panel, get: function (id) { return byId[id] || null; },
    tapRect: tapRect, begin: begin, draw: draw, tap: tap, hits: hits, run: run, swipe: swipe,
    open: anyOpen, errors: errors,
    rects: function () { return rects; }
  };
})(window.QT || (window.QT = {}));
