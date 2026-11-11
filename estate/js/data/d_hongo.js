(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.hongo = {
    id: "hongo",
    col: 1,
    row: 0,
    name: "上野・本郷・北千住",
    name_en: "Ueno, Hongo & Kita-Senju",
    short: "上野",
    short_en: "Ueno",
    sub: "南西は本郷の学生街、真ん中は上野、北東は北千住の下町",
    sub_en: "Hongo students to the SW, Ueno in the middle, old Kita-Senju to the NE",
    open0: true,
    theme: "cryo",
    top: 2,
    size: [27, 29],
    grid: [[{"d": "shita_shop", "w": 3, "h": 3, "a": "ueno"}, {"d": "apt", "w": 4, "h": 3, "a": "ueno"}, 5, {"d": "shita_house", "w": 3, "h": 3, "a": "senju"}, {"d": "shita_house", "w": 4, "h": 3, "a": "senju"}], [{"d": "apt", "w": 4, "h": 3, "a": "ueno"}, {"d": "shop", "w": 3, "h": 3, "a": "ueno"}, 5, {"d": "shita_house", "w": 4, "h": 3, "a": "senju"}, {"d": "house", "w": 3, "h": 3, "a": "senju"}], [{"d": "shita_shop", "w": 3, "h": 3, "a": "ueno"}, {"d": "shita_shop", "w": 4, "h": 3, "a": "ueno"}, 5, {"d": "akiba_shop", "w": 3, "h": 3, "a": "ueno"}, {"d": "apt", "w": 4, "h": 3, "a": "ueno"}], [{"d": "apt", "w": 4, "h": 3, "a": "hongo"}, {"d": "apt", "w": 3, "h": 3, "a": "hongo"}, 5, {"d": "shop", "w": 3, "h": 3, "a": "ueno"}, {"d": "parking", "w": 4, "h": 3, "a": "ueno"}], [{"d": "campus", "w": 4, "h": 3, "a": "hongo"}, {"d": "apt", "w": 3, "h": 3, "a": "hongo"}, 5, {"d": "apt", "w": 3, "h": 3, "a": "hongo"}, {"d": "house", "w": 4, "h": 3, "a": "hongo"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
