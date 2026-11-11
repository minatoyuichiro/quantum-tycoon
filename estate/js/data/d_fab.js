(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.fab = {
    id: "fab",
    col: 0,
    row: 0,
    name: "池袋・練馬",
    name_en: "Ikebukuro & Nerima",
    short: "池袋",
    short_en: "Ikebukuro",
    sub: "西は大泉学園・練馬の住宅地、東は池袋の駅前",
    sub_en: "Oizumi & Nerima homes to the west, Ikebukuro to the east",
    open0: true,
    theme: "town",
    top: 2,
    size: [26, 29],
    grid: [[{"d": "house", "w": 3, "h": 3, "a": "oizumi"}, {"d": "farm", "w": 4, "h": 3, "a": "oizumi"}, 5, {"d": "office_tower", "w": 4, "h": 3, "a": "ikebukuro"}, {"d": "hotel", "w": 3, "h": 3, "a": "ikebukuro"}], [{"d": "house", "w": 3, "h": 3, "a": "oizumi"}, {"d": "house", "w": 4, "h": 3, "a": "oizumi"}, 5, {"d": "apt", "w": 4, "h": 3, "a": "ikebukuro"}, {"d": "shop", "w": 3, "h": 3, "a": "ikebukuro"}], [{"d": "house", "w": 4, "h": 3, "a": "nerima"}, {"d": "apt", "w": 3, "h": 3, "a": "nerima"}, 5, {"d": "dept_store", "w": 4, "h": 3, "a": "nerima"}, {"d": "office_tower", "w": 3, "h": 3, "a": "nerima"}], [{"d": "farm", "w": 4, "h": 3, "a": "oizumi"}, {"d": "house", "w": 3, "h": 3, "a": "oizumi"}, 5, {"d": "apt", "w": 3, "h": 3, "a": "nerima"}, {"d": "shop", "w": 4, "h": 3, "a": "nerima"}], [{"d": "house", "w": 3, "h": 3, "a": "nerima"}, {"d": "parking", "w": 4, "h": 3, "a": "nerima"}, 5, {"d": "apt", "w": 4, "h": 3, "a": "nerima"}, {"d": "parking", "w": 3, "h": 3, "a": "nerima"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
