(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var DD = D.districts || (D.districts = {});
  DD.otemachi = {
    id: "otemachi",
    col: 1,
    row: 1,
    name: "大手町（銀行街）",
    name_en: "Otemachi (bank street)",
    short: "大手町",
    short_en: "Otemachi",
    sub: "東京の真ん中。銀行の窓口が並ぶ。メガバンクから信金・公庫・ノンバンクまで。税務署も",
    sub_en: "The centre of Tokyo. Bank counters from megabanks to credit unions, JFC and non-banks. Tax office too",
    open0: true,
    theme: "biz",
    top: 2,
    size: [27, 26],
    grid: [["bk_mega", "bk_trust", 5, "bk_net", "bk_chigin"], ["bk_chigin2", "bk_shinkin", 5, "bk_shinkumi", "bk_koko"], [{"d": "office_tower", "w": 4, "h": 3}, {"d": "old_bldg", "w": 4, "h": 3}, 5, "bk_nonbank", "zeimusho"], [{"d": "old_bldg", "w": 4, "h": 3}, {"d": "office_tower", "w": 4, "h": 3}, 5, {"d": "office_tower", "w": 4, "h": 3}, {"d": "woods", "w": 4, "h": 3}]],
    defs: {"bk_mega": {"kind": "bank", "lender": "mega", "deco": true, "variant": "office_tower", "owned": true, "maxLevel": 1, "name": "メガバンク", "name_en": "Megabank", "short": "メガバンク", "short_en": "Megabank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_trust": {"kind": "bank", "lender": "trust", "deco": true, "variant": "old_bldg", "owned": true, "maxLevel": 1, "name": "信託銀行", "name_en": "Trust bank", "short": "信託銀行", "short_en": "Trust bank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_net": {"kind": "bank", "lender": "netbank", "deco": true, "variant": "office_tower", "owned": true, "maxLevel": 1, "name": "ネット銀行", "name_en": "Online bank", "short": "ネット銀行", "short_en": "Online bank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_chigin": {"kind": "bank", "lender": "chigin", "deco": true, "variant": "old_bldg", "owned": true, "maxLevel": 1, "name": "地方銀行", "name_en": "Regional bank", "short": "地方銀行", "short_en": "Regional bank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_chigin2": {"kind": "bank", "lender": "chigin2", "deco": true, "variant": "office_tower", "owned": true, "maxLevel": 1, "name": "第二地方銀行", "name_en": "2nd-tier bank", "short": "第二地方銀行", "short_en": "2nd-tier bank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_shinkin": {"kind": "bank", "lender": "shinkin", "deco": true, "variant": "old_bldg", "owned": true, "maxLevel": 1, "name": "信用金庫", "name_en": "Shinkin bank", "short": "信用金庫", "short_en": "Shinkin bank", "pw": 4, "ph": 3, "padsLocal": []}, "bk_shinkumi": {"kind": "bank", "lender": "shinkumi", "deco": true, "variant": "shop", "owned": true, "maxLevel": 1, "name": "信用組合", "name_en": "Credit co-op", "short": "信用組合", "short_en": "Credit co-op", "pw": 4, "ph": 3, "padsLocal": []}, "bk_koko": {"kind": "bank", "lender": "koko", "deco": true, "variant": "old_bldg", "owned": true, "maxLevel": 1, "name": "日本政策金融公庫", "name_en": "Japan Finance Corp.", "short": "日本政策金融公庫", "short_en": "Japan Finance Corp.", "pw": 4, "ph": 3, "padsLocal": []}, "bk_nonbank": {"kind": "bank", "lender": "nonbank", "deco": true, "variant": "shop", "owned": true, "maxLevel": 1, "name": "ノンバンク", "name_en": "Non-bank", "short": "ノンバンク", "short_en": "Non-bank", "pw": 4, "ph": 3, "padsLocal": []}, "zeimusho": {"kind": "taxoffice", "deco": true, "variant": "old_bldg", "owned": true, "maxLevel": 1, "name": "税務署", "name_en": "Tax office", "short": "税務署", "short_en": "Tax office", "pw": 4, "ph": 3, "padsLocal": []}}
  };
})(window.QT || (window.QT = {}));
