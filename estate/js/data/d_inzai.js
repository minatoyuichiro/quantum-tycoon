(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.inzai = {
    id: "inzai",
    col: 2,
    row: 1,
    name: "船橋・市川・印西",
    name_en: "Funabashi, Ichikawa & Inzai",
    short: "船橋",
    short_en: "Funabashi",
    sub: "西は都心に近い市川・船橋、真ん中は千葉ニュータウン、東は土地の安い印西",
    sub_en: "Ichikawa & Funabashi near Tokyo to the west, Chiba New Town in the middle, cheap Inzai to the east",
    open0: true,
    theme: "service",
    top: 2,
    size: [28, 26],
    grid: [[{"d": "apt", "w": 4, "h": 4, "a": "funa"}, {"d": "shop", "w": 3, "h": 4, "a": "funa"}, 5, {"d": "house", "w": 3, "h": 4, "a": "chunt"}, {"d": "farm", "w": 4, "h": 4, "a": "chunt"}], [{"d": "office_tower", "w": 4, "h": 4, "a": "funa"}, {"d": "apt", "w": 4, "h": 4, "a": "funa"}, 5, {"d": "apt", "w": 4, "h": 4, "a": "chunt"}, {"d": "woods", "w": 4, "h": 4, "a": "chunt"}], [{"d": "shop", "w": 3, "h": 4, "a": "funa"}, {"d": "apt", "w": 4, "h": 4, "a": "funa"}, 5, {"d": "parking", "w": 4, "h": 4, "a": "inzai"}, {"d": "house", "w": 3, "h": 4, "a": "inzai"}], [{"d": "warehouse", "w": 4, "h": 4, "a": "chunt"}, {"d": "parking", "w": 3, "h": 4, "a": "chunt"}, 5, {"d": "farm", "w": 4, "h": 4, "a": "inzai"}, {"d": "house", "w": 3, "h": 4, "a": "inzai"}]],
    defs: {}
  };
})(window.QT || (window.QT = {}));
