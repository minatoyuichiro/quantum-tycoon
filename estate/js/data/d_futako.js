(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.futako = {
    id: "futako",
    col: 2,
    row: 0,
    name: "流山・柏",
    name_en: "Nagareyama & Kashiwa",
    short: "柏",
    short_en: "Kashiwa",
    sub: "実家のある街。西は流山おおたかの森、真ん中は柏駅前、東は我孫子",
    sub_en: "Your family home. Nagareyama to the west, Kashiwa in the middle, Abiko to the east",
    open0: true,
    theme: "town",
    top: 2,
    size: [28, 29],
    grid: [[{"d": "apt", "w": 4, "h": 3, "a": "otaka"}, {"d": "house", "w": 3, "h": 3, "a": "otaka"}, 5, {"d": "house", "w": 3, "h": 3, "a": "abiko"}, {"d": "farm", "w": 4, "h": 3, "a": "abiko"}], [{"d": "apt", "w": 4, "h": 3, "a": "otaka"}, {"d": "apt", "w": 4, "h": 3, "a": "otaka"}, 5, {"d": "house", "w": 3, "h": 3, "a": "kashiwa"}, {"d": "house", "w": 3, "h": 3, "a": "kashiwa"}], ["home", 5, {"d": "shop", "w": 3, "h": 3, "a": "kashiwa"}, {"d": "house", "w": 3, "h": 3, "a": "kashiwa"}], [{"d": "house", "w": 3, "h": 3, "a": "otaka"}, {"d": "parking", "w": 4, "h": 3, "a": "otaka"}, 5, {"d": "house", "w": 3, "h": 3, "a": "abiko"}, {"d": "woods", "w": 4, "h": 3, "a": "abiko"}], [{"d": "house", "w": 3, "h": 3, "a": "otaka"}, {"d": "apt", "w": 3, "h": 3, "a": "otaka"}, 5, {"d": "farm", "w": 4, "h": 3, "a": "abiko"}, {"d": "house", "w": 3, "h": 3, "a": "abiko"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
