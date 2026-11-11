(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.shibuya = {
    id: "shibuya",
    col: 0,
    row: 2,
    name: "渋谷・青山・代官山",
    name_en: "Shibuya, Aoyama & Daikanyama",
    short: "渋谷",
    short_en: "Shibuya",
    sub: "北東は青山・表参道（不動産会社の本社）、真ん中は渋谷駅前、南西は代官山",
    sub_en: "Aoyama to the NE (the agency HQ), Shibuya Station in the middle, Daikanyama to the SW",
    open0: true,
    theme: "town",
    top: 2,
    size: [26, 26],
    grid: [[{"d": "apt", "w": 4, "h": 4, "a": "shibu"}, {"d": "shop", "w": 3, "h": 4, "a": "shibu"}, 5, "aoyama_hq"], [{"d": "apt", "w": 4, "h": 4, "a": "shibu"}, {"d": "hotel", "w": 3, "h": 4, "a": "shibu"}, 5, {"d": "office_tower", "w": 4, "h": 4, "a": "aoyama"}, {"d": "shop", "w": 3, "h": 4, "a": "aoyama"}], [{"d": "house", "w": 3, "h": 4, "a": "daikan"}, {"d": "apt", "w": 4, "h": 4, "a": "daikan"}, 5, {"d": "shop", "w": 3, "h": 4, "a": "shibu"}, {"d": "office_tower", "w": 4, "h": 4, "a": "shibu"}], [{"d": "house", "w": 3, "h": 4, "a": "daikan"}, {"d": "house", "w": 4, "h": 4, "a": "daikan"}, 5, {"d": "apt", "w": 3, "h": 4, "a": "shibu"}, {"d": "parking", "w": 4, "h": 4, "a": "shibu"}]],
    defs: {"aoyama_hq": {"kind": "agency", "deco": true, "variant": "office_tower", "owned": true, "maxLevel": 1, "name": "不動産会社 本社（青山）", "name_en": "Property agency HQ (Aoyama)", "short": "不動産会社", "short_en": "Agency", "pw": 5, "ph": 4, "padsLocal": [], "color": "#1f5fbf"}}
  };
})(window.QT || (window.QT = {}));
