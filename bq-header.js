(function () {
  function pops() { return document.querySelectorAll(".bqh__pop[open]"); }
  function outside(e) {
    var open = pops(), hit = false;
    open.forEach(function (d) { if (!d.contains(e.target)) { d.removeAttribute("open"); hit = true; } });
    var onMenu = e.target.closest && e.target.closest(".bqh__pop");
    if (hit && !onMenu) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  document.addEventListener("click", outside, true);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") pops().forEach(function (d) { d.removeAttribute("open"); });
  });
  document.querySelectorAll(".bqh__pop").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) pops().forEach(function (o) { if (o !== d) o.removeAttribute("open"); });
    });
  });
})();
