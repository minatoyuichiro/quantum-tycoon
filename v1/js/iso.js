(function (QT) {
  'use strict';
  var A = 0.62, B = 0.33;
  function ex(x, y) { return (x - y) * A; }
  function ey(x, y, h) { return (x + y) * B - (h || 0); }
  function unproject(dsx, dsy) {
    var wx = dsx / (2 * A) + dsy / (2 * B);
    var wy = dsy / (2 * B) - dsx / (2 * A);
    var m = Math.hypot(wx, wy);
    return m > 0.0001 ? { x: wx / m, y: wy / m } : { x: 0, y: 0 };
  }
  function facePath(c, x, y, w, h, lift) {
    c.beginPath();
    c.moveTo(ex(x, y), ey(x, y, lift));
    c.lineTo(ex(x + w, y), ey(x + w, y, lift));
    c.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift));
    c.lineTo(ex(x, y + h), ey(x, y + h, lift));
    c.closePath();
  }
  function rightFacePath(c, x, y, w, h, lift, base) {
    base = base || 0;
    c.beginPath();
    c.moveTo(ex(x + w, y), ey(x + w, y, lift));
    c.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift));
    c.lineTo(ex(x + w, y + h), ey(x + w, y + h, base));
    c.lineTo(ex(x + w, y), ey(x + w, y, base));
    c.closePath();
  }
  function leftFacePath(c, x, y, w, h, lift, base) {
    base = base || 0;
    c.beginPath();
    c.moveTo(ex(x, y + h), ey(x, y + h, lift));
    c.lineTo(ex(x + w, y + h), ey(x + w, y + h, lift));
    c.lineTo(ex(x + w, y + h), ey(x + w, y + h, base));
    c.lineTo(ex(x, y + h), ey(x, y + h, base));
    c.closePath();
  }
  function shade(col, amt) {
    if (!col || col.charAt(0) !== '#') return col;
    var n = parseInt(col.slice(1), 16);
    var r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function box(c, x, y, w, h, base, hi, top, opt) {
    opt = opt || {};
    var lift = base + hi;
    c.fillStyle = opt.left || shade(top, -46);
    leftFacePath(c, x, y, w, h, lift, base);
    c.fill();
    c.fillStyle = opt.right || shade(top, -24);
    rightFacePath(c, x, y, w, h, lift, base);
    c.fill();
    c.fillStyle = opt.top || top;
    facePath(c, x, y, w, h, lift);
    c.fill();
    if (opt.stroke) {
      c.strokeStyle = opt.stroke; c.lineWidth = opt.lw || 1;
      facePath(c, x, y, w, h, lift); c.stroke();
    }
  }
  function shadow(c, x, y, w, h, alpha) {
    c.fillStyle = 'rgba(60,50,35,' + (alpha == null ? 0.16 : alpha) + ')';
    facePath(c, x + 2, y + 2, w - 2, h - 2, 0);
    c.fill();
  }
  QT.Iso = {
    A: A, B: B, ex: ex, ey: ey, unproject: unproject,
    toWorld: function (sx, sy) { return { x: (sx / A + sy / B) / 2, y: (sy / B - sx / A) / 2 }; },
    facePath: facePath, rightFacePath: rightFacePath, leftFacePath: leftFacePath,
    box: box, shadow: shadow, shade: shade,
    depth: function (x, y, w, h) { return (x + (w || 0)) + (y + (h || 0)); }
  };
})(window.QT || (window.QT = {}));
