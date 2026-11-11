(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.shinjuku = {
    id: "shinjuku",
    col: 0,
    row: 1,
    name: "新宿・中野",
    name_en: "Shinjuku & Nakano",
    short: "新宿",
    short_en: "Shinjuku",
    sub: "西は中野、北東は新大久保、南東は西新宿の高層ビル街",
    sub_en: "Nakano to the west, Shin-Okubo to the NE, Nishi-Shinjuku towers to the SE",
    open0: true,
    theme: "biz",
    top: 2,
    size: [26, 26],
    grid: [[{"d": "apt", "w": 4, "h": 4, "a": "nakano"}, {"d": "house", "w": 3, "h": 4, "a": "nakano"}, 5, {"d": "shop", "w": 3, "h": 4, "a": "okubo"}, {"d": "apt", "w": 4, "h": 4, "a": "okubo"}], [{"d": "apt", "w": 4, "h": 4, "a": "nakano"}, {"d": "shop", "w": 3, "h": 4, "a": "nakano"}, 5, {"d": "apt", "w": 3, "h": 4, "a": "okubo"}, {"d": "shop", "w": 4, "h": 4, "a": "okubo"}], [{"d": "house", "w": 3, "h": 4, "a": "nakano"}, {"d": "apt", "w": 4, "h": 4, "a": "nakano"}, 5, {"d": "office_tower", "w": 4, "h": 4, "a": "nishi"}, {"d": "hotel", "w": 3, "h": 4, "a": "nishi"}], [{"d": "apt", "w": 3, "h": 4, "a": "nakano"}, {"d": "parking", "w": 4, "h": 4, "a": "nakano"}, 5, {"d": "office_tower", "w": 4, "h": 4, "a": "nishi"}, {"d": "dept_store", "w": 3, "h": 4, "a": "nishi"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
