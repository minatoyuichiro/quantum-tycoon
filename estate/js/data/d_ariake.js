(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.ariake = {
    id: "ariake",
    col: 2,
    row: 2,
    name: "豊洲・勝どき・有明",
    name_en: "Toyosu, Kachidoki & Ariake",
    short: "湾岸",
    short_en: "Bayside",
    sub: "北西は勝どき、真ん中は豊洲、南東は有明。湾岸のタワマン",
    sub_en: "Kachidoki to the NW, Toyosu in the middle, Ariake to the SE. Bayside towers",
    open0: true,
    theme: "biz",
    top: 2,
    size: [28, 26],
    grid: [[{"d": "apt", "w": 4, "h": 4, "a": "kachi"}, {"d": "apt", "w": 4, "h": 4, "a": "kachi"}, 5, {"d": "shop", "w": 3, "h": 4, "a": "toyosu"}, {"d": "apt", "w": 4, "h": 4, "a": "toyosu"}], [{"d": "apt", "w": 4, "h": 4, "a": "kachi"}, {"d": "shop", "w": 3, "h": 4, "a": "kachi"}, 5, {"d": "apt", "w": 4, "h": 4, "a": "toyosu"}, {"d": "parking", "w": 3, "h": 4, "a": "toyosu"}], [{"d": "apt", "w": 4, "h": 4, "a": "toyosu"}, {"d": "parking", "w": 4, "h": 4, "a": "toyosu"}, 5, {"d": "apt", "w": 4, "h": 4, "a": "ariake"}, {"d": "hotel", "w": 4, "h": 4, "a": "ariake"}], [{"d": "shop", "w": 3, "h": 4, "a": "toyosu"}, {"d": "apt", "w": 4, "h": 4, "a": "toyosu"}, 5, {"d": "apt", "w": 4, "h": 4, "a": "ariake"}, {"d": "park", "w": 4, "h": 4, "a": "ariake"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
