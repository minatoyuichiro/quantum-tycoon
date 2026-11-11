(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.minato = {
    id: "minato",
    col: 1,
    row: 2,
    name: "品川・武蔵小杉・みなとみらい",
    name_en: "Shinagawa, Kosugi & Minato Mirai",
    short: "品川",
    short_en: "Shinagawa",
    sub: "北東は品川、西は武蔵小杉、南はみなとみらい",
    sub_en: "Shinagawa to the NE, Musashi-Kosugi to the west, Minato Mirai to the south",
    open0: true,
    theme: "biz",
    top: 2,
    size: [27, 26],
    grid: [[{"d": "apt", "w": 4, "h": 4, "a": "kosugi"}, {"d": "apt", "w": 4, "h": 4, "a": "kosugi"}, 5, {"d": "office_tower", "w": 4, "h": 4, "a": "shina"}, {"d": "hotel", "w": 4, "h": 4, "a": "shina"}], [{"d": "apt", "w": 4, "h": 4, "a": "kosugi"}, {"d": "house", "w": 3, "h": 4, "a": "kosugi"}, 5, {"d": "office_tower", "w": 4, "h": 4, "a": "shina"}, {"d": "apt", "w": 3, "h": 4, "a": "shina"}], [{"d": "apt", "w": 4, "h": 4, "a": "kosugi"}, {"d": "shop", "w": 3, "h": 4, "a": "kosugi"}, 5, {"d": "apt", "w": 3, "h": 4, "a": "mm"}, {"d": "parking", "w": 4, "h": 4, "a": "mm"}], [{"d": "apt", "w": 4, "h": 4, "a": "mm"}, {"d": "warehouse", "w": 3, "h": 4, "a": "mm"}, 5, {"d": "hotel", "w": 4, "h": 4, "a": "mm"}, {"d": "apt", "w": 3, "h": 4, "a": "mm"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
