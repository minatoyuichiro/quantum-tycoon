(function (QT) {
  'use strict';
  var TILE = 16;
  var PW = 4, PH = 3;
  var MONTH = 10;
  var V1_PIPELINE = ['design', 'layout', 'tapeout',
                     'litho', 'depoetch', 'implant', 'cmp',
                     'dice', 'bond', 'pkg',
                     'qa'];
  var V1_FEEDERS = ['fridge', 'cstage', 'ctrl'];
  var DOMAINS = {
    pharma: { name: '創薬・材料', name_en: 'Drug & materials', cap: 900,  arpu: 22,  color: '#2fbf7a' },
    fin:    { name: '金融・リスク', name_en: 'Finance & risk',  cap: 700,  arpu: 30,  color: '#e8a800' },
    cae:    { name: 'CAE・自動車',  name_en: 'CAE & automotive', cap: 1100, arpu: 18,  color: '#ef7d2e' },
    opt:    { name: '最適化・AI',   name_en: 'Optimization & AI', cap: 1800, arpu: 14, color: '#6f57e0' },
    crypto: { name: '暗号・銀行',   name_en: 'Crypto & banking',  cap: 600,  arpu: 44, color: '#e2508a' }
  };
  var DEFS = {
    conveni:  { kind: 'store', owned: true, name: 'コンビニ', name_en: 'Convenience store',
                short: 'コンビニ', short_en: 'Store', color: '#2fbf7a',
                pw: 10, ph: 6, open: true,
                blocks: [[1, 1, 3, 1], [1, 3, 3, 1], [5, 3, 3, 1], [7, 1, 2, 1], [2, 5, 5, 1], [7, 5, 2, 1]],
                shelves: [[1, 1, 3, 1], [1, 3, 3, 1], [5, 3, 3, 1]],
                parcelAt: [7, 1, 2, 1], counterAt: [2, 5, 5, 1], brewAt: [7, 5, 2, 1],
                padsLocal: [
                  { type: 'reg',    x: 4, y: 4 },
                  { type: 'stock',  x: 2, y: 0 },
                  { type: 'brew',   x: 8, y: 4 },
                  { type: 'pickup', x: 8, y: 2 }
                ] },
    notary:   { kind: 'notary', owned: true, name: '公証人役場', name_en: 'Notary office',
                short: '公証人役場', short_en: 'Notary', pw: 3, ph: 3, color: '#7d8fc4' },
    registry: { kind: 'registry', owned: true, name: '法務局', name_en: 'Legal bureau',
                short: '法務局', short_en: 'Registry', pw: 3, ph: 3, color: '#6f57e0' },
    bankp:    { kind: 'bank', owned: true, name: '銀行', name_en: 'Bank',
                short: '銀行', short_en: 'Bank', pw: 5, ph: 3, color: '#2fbf7a' },
    home:     { kind: 'house', owned: true, name: '実家', name_en: 'Family home',
                short: '実家', short_en: "Parents' home", pw: 5, ph: 4,
                color: '#e2a04a', roof: '#c76b3a', spots: { myhome: [7, 4], rest: [9, 4] } },
    kin:      { kind: 'house', owned: true, name: '親戚の家', name_en: 'Relatives',
                short: '親戚', short_en: 'Relatives', pw: 5, ph: 4,
                color: '#9fb8d8', roof: '#5a6c9e', spots: { familyRound: [5, 4] } },
    c_auto:  { kind: 'corp', owned: true, name: '自動車メーカー', name_en: 'Automotive maker',
               short: '自動車', short_en: 'Auto', pw: 5, ph: 4, color: '#ef7d2e', domain: 'cae',
               cvc: '大手自動車CVC', cvc_en: 'Automotive CVC',
               spots: { pitch: [0, 4] } },
    c_mat:   { kind: 'corp', owned: true, name: '素材メーカー', name_en: 'Materials maker',
               short: '素材', short_en: 'Materials', pw: 5, ph: 4, color: '#2fbf7a', domain: 'pharma',
               cvc: '素材系CVC', cvc_en: 'Materials CVC',
               spots: { pitch: [0, 4] } },
    c_it:    { kind: 'corp', owned: true, name: 'IT・通信企業', name_en: 'IT & telecom',
               short: 'IT企業', short_en: 'IT', pw: 5, ph: 4, color: '#2bb8d8', domain: 'opt',
               cvc: 'IT系CVC', cvc_en: 'IT CVC',
               spots: { pitch: [0, 4] } },
    c_news:  { kind: 'corp', owned: true, news: true, name: '新聞社', name_en: 'Newspaper',
               short: '新聞社', short_en: 'Press', pw: 5, ph: 4, color: '#e2508a', domain: 'crypto',
               cvc: '新聞社', cvc_en: 'Newspaper' },
    c_pharma:{ kind: 'corp', owned: true, name: '製薬メーカー', name_en: 'Pharmaceutical maker',
               short: '製薬', short_en: 'Pharma', pw: 5, ph: 4, color: '#8fd14f', domain: 'pharma',
               cvc: '製薬系CVC', cvc_en: 'Pharma CVC',
               spots: { pitch: [0, 4] } },
    c_gov:   { kind: 'corp', owned: true, name: '官公庁・研究機関', name_en: 'Government & institutes',
               short: '官公庁', short_en: 'Gov', pw: 5, ph: 4, color: '#7d8fc4', domain: 'opt',
               cvc: '官民ファンド', cvc_en: 'Public fund',
               spots: { pitch: [0, 4] } },
    c_fin:   { kind: 'corp', owned: true, name: 'メガバンク', name_en: 'Major bank',
               short: 'メガバンク', short_en: 'Bank', pw: 5, ph: 4, color: '#e8a800', domain: 'fin',
               cvc: 'メガバンク系CVC', cvc_en: 'Bank CVC',
               padsLocal: [{ type: 'sales', x: 0, y: 4 }, { type: 'drop', x: 2, y: 4 }, { type: 'cvc', x: 4, y: 4 },
                           { type: 'borrow', x: 5, y: 0 }, { type: 'repay', x: 5, y: 2 }],
               spots: { pitch: [0, 4], borrow: [5, 0], repay: [5, 2] } },
    desk:    { kind: 'desk', owned: true, name: '営業部（受注デスク）', name_en: 'Sales & orders',
               short: '営業部', short_en: 'Sales', verb: '増員', verb_en: 'Hire',
               cost: 1200000, maxLevel: 6, color: '#f2a63b' },
    pc:      { kind: 'devdesk', owned: true, name: 'ソフトウェア開発', name_en: 'Software development',
               short: 'ソフト開発', short_en: 'Software', verb: '増設', verb_en: 'Add desk',
               cost: 180000, maxLevel: 6, pw: 6, ph: 4, open: true,
               blocks: [[1, 1, 2, 1], [4, 1, 2, 1], [1, 3, 2, 1], [4, 3, 2, 1]],
               padsLocal: [
                 { type: 'dev', x: 0, y: 1 }, { type: 'dev', x: 3, y: 1 },
                 { type: 'dev', x: 0, y: 3 }, { type: 'dev', x: 3, y: 3 }
               ],
               spots: { algo: [5, 4], buyPC: [1, 4] },
               color: '#2bb8d8' },
    acct:    { kind: 'acct', owned: true, name: '経理', name_en: 'Accounting',
               short: '経理', short_en: 'Accounting', verb: '増員', verb_en: 'Hire',
               cost: 800000, maxLevel: 6, pw: 5, ph: 3, color: '#7d8fc4' },
    office:  { kind: 'office', name: '事務所', name_en: 'Office lease',
               short: '事務所', short_en: 'Office', verb: '借りる', verb_en: 'Rent',
               cost: 250000, maxLevel: 1, pw: 4, ph: 3, rent: 90000, util: 30000, color: '#f2a63b' },
    swjob:   { kind: 'swjob', name: 'ソフト受託', name_en: 'Software delivery',
               short: 'ソフト受託', short_en: 'SW delivery', verb: '増強', verb_en: 'Upgrade',
               owned: true, cost: 600000, maxLevel: 6, color: '#2fbf7a' },
    gacha:   { kind: 'gacha', owned: true, name: '量子ガチャ', name_en: 'Quantum Gacha',
               short: '量子ガチャ', short_en: 'Gacha', pw: 3, ph: 3, color: '#e2508a' },
    staff:   { kind: 'staff', name: '採用', name_en: 'Hiring', short: '採用', short_en: 'Hire',
               verb: '採用', verb_en: 'Hire', cost: 300000, maxLevel: 8, color: '#2fbf7a' },
    sns:     { kind: 'media', name: 'SNSマーケティング', name_en: 'Social media marketing', short: 'SNS広告', short_en: 'Social ads',
               verb: '開始', verb_en: 'Start', cost: 2600000, pop: 0.25, promo: 300000, color: '#2bb8d8' },
    design:  { kind: 'stage', name: '回路設計 (EDA)',   name_en: 'Circuit design (EDA)', short: '回路設計', short_en: 'Design',
               verb: '増強', verb_en: 'Upgrade', owned: true, cost: 80000, rate: 2.2, q: 3, color: '#2bb8d8' },
    qa:      { kind: 'stage', name: '品質保証テスト',   name_en: 'QA testing', short: 'QAテスト', short_en: 'QA',
               verb: '増強', verb_en: 'Upgrade', cost: 6200000, rate: 2.6, q: 9, color: '#2fbf7a' },
    ship:    { kind: 'ship', name: 'トラック搬出口', name_en: 'Truck loading dock', short: '搬出口', short_en: 'Dock',
               verb: '拡張', verb_en: 'Expand', owned: true, cost: 600000,
               pw: 6, ph: 3, color: '#2fbf7a' },
    svc:     { kind: 'service', name: '保守センター', name_en: 'Service center', short: '保守', short_en: 'Service',
               verb: '拡張', verb_en: 'Expand', cost: 1800000, color: '#ef7d2e' },
    sh_ctrl:   shop('hongo', 'アキバ制御', 'Akiba Controls', '制御', 'Controls', '#ef7d2e', 3, 3),
    sh_laser:  shop('hongo', '電気街レーザー', 'Denkigai Lasers', 'レーザー', 'Lasers', '#e2508a', 3, 3),
    sh_optics: shop('hongo', '光学パーツ館', 'Optics Parts Hall', '光学', 'Optics', '#2bb8d8', 3, 3),
    sh_vac:    shop('hongo', '真空ショップ', 'Vacuum Shop', '真空', 'Vacuum', '#7d8fc4', 3, 3),
    sh_fridge: shop('hongo', '冷凍機ディーラー', 'Fridge Dealer', '冷凍機', 'Fridges', '#6f9fd8', 3, 3),
    sh_gpu:    { kind: 'gpushop', owned: true, home: 'hongo', name: 'GPU問屋', name_en: 'GPU Wholesaler',
                 short: 'GPU問屋', short_en: 'GPUs', pw: 4, ph: 3, color: '#8fd14f', padsLocal: [] },
    scm:       { kind: 'scm', owned: true, home: 'hongo', name: 'サプライ本部', name_en: 'Supply HQ',
                 short: 'サプライ', short_en: 'Supply', pw: 5, ph: 3, color: '#2fbf7a', padsLocal: [],
                 spots: { scm: [1, 3], spot: [3, 3] } },
    foundry:   shop('fab', '京浜ファウンドリ', 'Keihin Foundry', 'ファウンドリ', 'Foundry', '#e8a800', 5, 3),
    helium:    shop('fab', '京浜ガス', 'Keihin Gas', 'ヘリウム', 'Helium', '#2fbf7a'),
    clean:     { kind: 'clean', home: 'fab', name: '自社クリーンルーム', name_en: 'Own clean room',
                 short: 'クリーンルーム', short_en: 'Clean room', verb: '建設', verb_en: 'Build',
                 cost: 12000000, maxLevel: 1, pw: 5, ph: 4, color: '#7fd0ff',
                 asset: { cls: 'building', life: 180 }, spots: { contract: [0, 4] } },
    recv:      { kind: 'recv', owned: true, home: 'fab', name: '受け入れ口', name_en: 'Receiving dock',
                 short: '受入', short_en: 'Receiving', pw: 5, ph: 3, color: '#7d8fc4', padsLocal: [],
                 spots: { site: [1, 3], spot: [3, 3] } },
    haneda:    { kind: 'haneda', owned: true, home: 'minato', name: '羽田ゲート', name_en: 'Haneda Gate',
                 short: '羽田', short_en: 'Haneda', pw: 4, ph: 3, color: '#2b7fe0', padsLocal: [] },
    gate:    { kind: 'exchange', owned: true, name: '証券取引所', name_en: 'Stock exchange',
               short: '証券取引所', short_en: 'Exchange', pw: 11, ph: 8, color: '#e8a800',
               spots: { ipo: [3, 8], mna: [8, 8] } }
  };
  function shop(home, name, nameEn, short, shortEn, color, pw, ph) {
    pw = pw || 4; ph = ph || 3;
    return { kind: 'supplier', owned: true, home: home, name: name, name_en: nameEn, short: short, short_en: shortEn,
             pw: pw, ph: ph, color: color, padsLocal: [], spots: { contract: [Math.floor(pw / 2), ph] } };
  }
  var V1_LEFT = {
    layout:  { kind: 'stage', name: 'レイアウト・検証', name_en: 'Layout & verification', short: 'レイアウト', short_en: 'Layout',
               verb: '増強', verb_en: 'Upgrade', cost: 260000, rate: 2.6, q: 5, color: '#6f57e0' },
    tapeout: { kind: 'stage', name: 'テープアウト',     name_en: 'Tape-out', short: 'テープアウト', short_en: 'Tape-out',
               verb: '発注', verb_en: 'Order', cost: 420000, rate: 3.4, q: 2, color: '#e8a800' },
    litho:   { kind: 'stage', name: '露光 (EUV/DUV)',   name_en: 'Lithography (EUV/DUV)', short: '露光', short_en: 'Litho',
               verb: '契約', verb_en: 'Contract', cost: 900000, rate: 3.8, q: 4, color: '#e2508a', out: true, fee: 2000 },
    depoetch:{ kind: 'stage', name: 'エッチング・成膜', name_en: 'Etch & deposition', short: 'エッチ・成膜', short_en: 'Etch',
               verb: '契約', verb_en: 'Contract', cost: 1200000, rate: 3.6, q: 3, color: '#2fbf7a', out: true, fee: 2600 },
    implant: { kind: 'stage', name: 'イオン注入',       name_en: 'Ion implantation', short: 'イオン注入', short_en: 'Implant',
               verb: '契約', verb_en: 'Contract', cost: 1600000, rate: 3.2, q: 3, color: '#ef7d2e', out: true, fee: 3400 },
    cmp:     { kind: 'stage', name: 'CMP・ウェハ検査',  name_en: 'CMP & wafer test', short: 'CMP・検査', short_en: 'CMP',
               verb: '契約', verb_en: 'Contract', cost: 2100000, rate: 3.0, q: 4, color: '#7d8fc4', out: true, fee: 4400 },
    dice:    { kind: 'stage', name: 'ダイシング',       name_en: 'Dicing', short: 'ダイシング', short_en: 'Dicing',
               verb: '契約', verb_en: 'Contract', cost: 3200000, rate: 2.8, q: 2, color: '#e8a800', out: true, fee: 6000 },
    bond:    { kind: 'stage', name: 'ボンディング',     name_en: 'Bonding', short: 'ボンディング', short_en: 'Bonding',
               verb: '契約', verb_en: 'Contract', cost: 4000000, rate: 3.0, q: 3, color: '#ef7d2e', out: true, fee: 7600 },
    pkg:     { kind: 'stage', name: 'パッケージング',   name_en: 'Packaging', short: 'パッケージ', short_en: 'Packaging',
               verb: '契約', verb_en: 'Contract', cost: 5000000, rate: 3.2, q: 3, color: '#e2508a', out: true, fee: 9400 },
    fridge:  { kind: 'feeder', name: '希釈冷凍機',       name_en: 'Dilution fridge', short: '冷凍機', short_en: 'Fridge',
               verb: '契約', verb_en: 'Contract', cost: 2600000, rate: 6.0, fee: 9000, color: '#7d8fc4' },
    cstage:  { kind: 'feeder', name: 'クライオステージ', name_en: 'Cryo stage', short: 'ステージ', short_en: 'Stage',
               verb: '契約', verb_en: 'Contract', cost: 3000000, rate: 6.2, fee: 7000, color: '#2bb8d8' },
    ctrl:    { kind: 'feeder', name: '制御装置',         name_en: 'Control electronics', short: '制御装置', short_en: 'Control',
               verb: '契約', verb_en: 'Contract', cost: 3600000, rate: 6.6, fee: 11000, color: '#ef7d2e' },
    helium:  { kind: 'helium', name: '液体ヘリウム供給', name_en: 'Liquid helium supply', short: 'ヘリウム', short_en: 'Helium',
               verb: '契約', verb_en: 'Contract', cost: 1400000, rate: 2.4, color: '#2fbf7a' },
    asm:     { kind: 'assembly', name: '本体組立・冷却', name_en: 'Assembly & cooling', short: '組立・冷却', short_en: 'Assembly',
               verb: '増強', verb_en: 'Upgrade', owned: true, cost: 500000, color: '#2bb8d8' },
    seminar: { kind: 'seminar', name: 'セミナー会場', name_en: 'Seminar hall', short: 'セミナー', short_en: 'Seminar',
               verb: '設置', verb_en: 'Build', cost: 6000000, color: '#2fbf7a' },
    tube:    { kind: 'media', name: '動画チャンネル', name_en: 'Video channel', short: '動画', short_en: 'Video',
               verb: '開設', verb_en: 'Start', cost: 6000000, pop: 0.45, promo: 800000, color: '#e2504a' },
    press:   { kind: 'media', name: 'メディア露出', name_en: 'Press coverage', short: 'メディア', short_en: 'Press',
               verb: '開始', verb_en: 'Start', cost: 14000000, pop: 0.8, promo: 2200000, color: '#e2508a' },
    lounge:  { kind: 'lounge', name: '社員ラウンジ', name_en: 'Staff lounge', short: 'ラウンジ', short_en: 'Lounge',
               verb: '改装', verb_en: 'Remodel', cost: 8000000, maxLevel: 5, pw: 5, ph: 4, color: '#8a4fd8' },
    sphere:  { kind: 'sphere', name: 'LEDスフィア', name_en: 'LED Sphere', short: 'LEDスフィア', short_en: 'Sphere',
               verb: '建設', verb_en: 'Build', cost: 40000000, maxLevel: 3, pw: 7, ph: 6, pop: 1.4, color: '#e2508a' },
    up_speed: { kind: 'upgrade', name: '移動速度', name_en: 'Walk speed', short: '移動速度', short_en: 'Speed',
                verb: '強化', verb_en: 'Upgrade', cost: 500000, up: 'speed', maxLevel: 6, pw: 3, ph: 3 },
    up_carry: { kind: 'upgrade', name: '運搬台数', name_en: 'Carry capacity', short: '運搬台数', short_en: 'Carry',
                verb: '強化', verb_en: 'Upgrade', cost: 1500000, up: 'carry', maxLevel: 5 },
    up_bot:   { kind: 'upgrade', name: '保守ロボット', name_en: 'Service robot', short: '保守ロボ', short_en: 'Robot',
                verb: '導入', verb_en: 'Deploy', cost: 9000000, up: 'bot', maxLevel: 4 }
  };
  var CLIENTS = [
    { name: '大学の量子研究室', name_en: 'University quantum lab', color: '#2bb8d8' },
    { name: '国立研究所',       name_en: 'National laboratory',    color: '#6f57e0' },
    { name: '製薬メーカー',     name_en: 'Pharmaceutical maker',   color: '#2fbf7a', domain: 'pharma' },
    { name: '自動車メーカー',   name_en: 'Automotive maker',       color: '#ef7d2e', domain: 'cae' },
    { name: '証券会社',         name_en: 'Securities firm',        color: '#e8a800', domain: 'fin' },
    { name: 'メガバンク',       name_en: 'Major bank',             color: '#e2508a', domain: 'crypto' },
    { name: '物流企業',         name_en: 'Logistics company',      color: '#7d8fc4', domain: 'opt' },
    { name: '素材メーカー',     name_en: 'Materials company',      color: '#2fbf7a', domain: 'pharma' }
  ];
  var CELL = 26, AVE = 3, RIM = 3, MARGIN = 1;
  var COLGAP = 1, ROWGAP = 2;
  var USE = CELL - MARGIN * 2;
  var ORDER = ['futako', 'shibuya', 'otemachi', 'hongo', 'shinjuku', 'fab', 'inzai', 'minato', 'ariake'];
  var LAYOUT_ERRORS = [];
  function bad(msg) {
    LAYOUT_ERRORS.push(msg);
    if (window.console && console.warn) console.warn('[world] ' + msg);
  }
  function sizeOf(id, distId) {
    var d = (distId ? defFor(id, distId) : DEFS[id] || V1_LEFT[id]) || {};
    return { w: d.pw || PW, h: d.ph || PH };
  }
  function defFor(id, distId) {
    var f = DEFS[id], v = V1_LEFT[id];
    if (f && v) return f.home && f.home !== distId ? v : f;
    return f || v || null;
  }
  function itemOf(it, size) {
    if (typeof it === 'string') { var s = size(it); return { id: it, w: s.w, h: s.h, kind: 'plot' }; }
    if (it && it.r) return { id: it.r, w: it.w, h: it.h, kind: 'reserve' };
    if (it && it.d) return { id: it.d, w: it.w, h: it.h, kind: 'deco', area: it.a || null };
    return null;
  }
  function rowSlots(row, size) {
    var c = 0, out = [], last = 0;
    row.forEach(function (it) {
      if (typeof it === 'number') { c += it; last = 0; return; }
      var o = itemOf(it, size);
      if (!o) return;
      o.lx = c;
      out.push(o);
      c += o.w + COLGAP; last = COLGAP;
    });
    return { items: out, w: c - last };
  }
  function rowH(row, size) {
    var m = 0;
    row.forEach(function (it) { var o = typeof it === 'number' ? null : itemOf(it, size); if (o) m = Math.max(m, o.h); });
    return m;
  }
  function packRows(grid, size, opt) {
    opt = opt || {};
    var FW = opt.w || CELL, FH = opt.h || CELL, UW = FW - MARGIN * 2, UH = FH - MARGIN * 2;
    var tot = 0;
    grid.forEach(function (row, i) { tot += rowH(row, size) + (i ? ROWGAP : 0); });
    var foot = (opt.bottomPad || 0) || (grid.length ? 1 : 0);
    var top = opt.top != null ? opt.top
            : opt.bottom != null ? opt.bottom - tot - foot + 1
            : opt.pack === 'back' ? MARGIN
            : opt.pack === 'front' ? FH - MARGIN - tot - foot
            : MARGIN + Math.round((UH - tot - foot) / 2);
    var out = [], roads = [], errs = [], cy = top;
    if (top < MARGIN || top + tot + foot > FH - MARGIN)
      errs.push('行のかたまり（ローカル y ' + top + '〜' + (top + tot + foot - 1) + '）が 1〜' + (FH - MARGIN - 1) + ' に収まらない');
    grid.forEach(function (row, ri) {
      var rs = rowSlots(row, size), rh = rowH(row, size);
      if (rs.w > UW) errs.push((ri + 1) + '行目の幅 ' + rs.w + ' が ' + UW + ' を超えています');
      var x0 = MARGIN + Math.round((UW - rs.w) / 2);
      rs.items.forEach(function (it) {
        out.push({ id: it.id, lx: x0 + it.lx, ly: cy + (rh - it.h), w: it.w, h: it.h, kind: it.kind, area: it.area || null });
      });
      var gapY = cy + rh;
      cy += rh + ROWGAP;
      if (ri < grid.length - 1) roads.push({ y: gapY, h: ROWGAP });
    });
    return { items: out, roads: roads, errs: errs, top: top, bottom: top + tot + foot - 1 };
  }
  var DATA = (QT.Data && QT.Data.districts) || {};
  var DEF_FROM = {};
  Object.keys(DATA).forEach(function (id) {
    var dd = DATA[id].defs || {};
    Object.keys(dd).forEach(function (k) {
      if (DEF_FROM[k]) { bad('区画の定義が ' + DEF_FROM[k] + ' と ' + id + ' の2か所にあります: ' + k); return; }
      DEF_FROM[k] = id;
      var base = DEFS[k];
      if (!base && V1_LEFT[k]) { base = V1_LEFT[k]; delete V1_LEFT[k]; }
      DEFS[k] = base ? Object.assign({}, base, dd[k]) : dd[k];
    });
  });
  var CLAIMED = {};
  Object.keys(DATA).forEach(function (id) {
    (DATA[id].grid || []).forEach(function (row) {
      row.forEach(function (it) { if (typeof it === 'string' && it.charAt(0) !== '?') CLAIMED[it] = id; });
    });
    Object.keys(DATA[id].at || {}).forEach(function (k) { if (k.charAt(0) !== '?') CLAIMED[k] = id; });
  });
  function resolveGrid(grid) {
    var out = [];
    (grid || []).forEach(function (row) {
      var had = false, r = [];
      row.forEach(function (it) {
        if (typeof it === 'string' && it.charAt(0) === '?') {
          had = true;
          var k = it.slice(1);
          if (!CLAIMED[k] && (DEFS[k] || V1_LEFT[k])) { r.push(k); CLAIMED[k] = true; }
          return;
        }
        r.push(it);
      });
      if (had && !r.some(function (it) { return typeof it === 'string'; })) return;
      out.push(r);
    });
    return out;
  }
  var COL_W = [0, 0, 0], ROW_H = [0, 0, 0];
  ORDER.forEach(function (id) {
    var s = DATA[id] && DATA[id].size || [CELL, CELL];
    if (!DATA[id]) return;
    COL_W[DATA[id].col] = Math.max(COL_W[DATA[id].col], s[0]);
    ROW_H[DATA[id].row] = Math.max(ROW_H[DATA[id].row], s[1]);
  });
  (function () {
    var sw = COL_W[0] + COL_W[1] + COL_W[2], sh = ROW_H[0] + ROW_H[1] + ROW_H[2];
    if (sw > sh) ROW_H[0] += sw - sh; else if (sh > sw) COL_W[0] += sh - sw;
  })();
  var COL_X = [RIM], ROW_Y = [RIM];
  for (var k0 = 1; k0 < 3; k0++) { COL_X[k0] = COL_X[k0 - 1] + COL_W[k0 - 1] + AVE; ROW_Y[k0] = ROW_Y[k0 - 1] + ROW_H[k0 - 1] + AVE; }
  var WORLD_W = COL_X[2] + COL_W[2] + RIM;
  var WORLD_H = ROW_Y[2] + ROW_H[2] + RIM;
  var CX = Math.floor(WORLD_W / 2), CY = Math.floor(WORLD_H / 2);
  var STATIONS = [], STATION_BY_ID = {};
  var DECO_KINDS = {
    office_tower: { name: 'オフィスビル', name_en: 'Office tower', color: '#8fa6c8', tall: true },
    old_bldg:     { name: '石造りのビル', name_en: 'Stone building', color: '#c9b48f' },
    dept_store:   { name: 'デパート', name_en: 'Department store', color: '#e2508a', tall: true },
    shop:         { name: '商店', name_en: 'Shop', color: '#f2a63b' },
    apt:          { name: 'マンション', name_en: 'Apartments', color: '#b9a7d8', tall: true },
    house:        { name: '住宅', name_en: 'House', color: '#e2a04a' },
    park:         { name: '小さな公園', name_en: 'Pocket park', color: '#7fc46a', flat: true },
    parking:      { name: '駐車場', name_en: 'Parking', color: '#9aa0a8', flat: true },
    shrine:       { name: '神社', name_en: 'Shrine', color: '#d8503a' },
    akiba_bldg:   { name: '電気街のビル', name_en: 'Electric Town building', color: '#6f57e0', tall: true },
    akiba_shop:   { name: 'パーツ屋', name_en: 'Parts shop', color: '#2bb8d8' },
    shita_shop:   { name: '下町の商店', name_en: 'Old-town shop', color: '#c76b3a' },
    shita_house:  { name: '長屋', name_en: 'Row houses', color: '#a8865c' },
    campus:       { name: '大学の校舎', name_en: 'University building', color: '#b5653f' },
    museum:       { name: '博物館', name_en: 'Museum', color: '#c9b48f' },
    hotel:        { name: 'ホテル', name_en: 'Hotel', color: '#8fb8d8', tall: true },
    warehouse:    { name: '倉庫', name_en: 'Warehouse', color: '#9fb0a0' },
    gas_tank:     { name: 'ガスタンク', name_en: 'Gas holder', color: '#d8d0c0' },
    works:        { name: '小さな工場', name_en: 'Small works', color: '#a0a8b8' },
    farm:         { name: '畑', name_en: 'Vegetable field', color: '#8fbf5c', flat: true },
    woods:        { name: '雑木林', name_en: 'Woods', color: '#4f9f5a' },
    dc_shed:      { name: 'データセンター', name_en: 'Data centre', color: '#e4e8ee' }
  };
  var DECO_DEFS = {};
  Object.keys(DECO_KINDS).forEach(function (v) {
    var k = DECO_KINDS[v];
    DECO_DEFS[v] = { kind: 'deco', deco: true, variant: v, owned: true, maxLevel: 1, padsLocal: [],
                     name: k.name, name_en: k.name_en, short: k.name, short_en: k.name_en,
                     color: k.color, tall: !!k.tall, flat: !!k.flat };
  });
  var DISTRICTS = [], DIST = {};
  ORDER.forEach(function (id, i) {
    var src = DATA[id];
    if (!src) throw new Error('[world] 地区データがありません: data/d_' + id + '.js');
    var d = Object.assign({}, src);
    d.id = id;
    d.index = i;
    d.ix = COL_X[d.col]; d.iy = ROW_Y[d.row]; d.iw = COL_W[d.col]; d.ih = ROW_H[d.row];
    var fs = src.size || [CELL, CELL];
    d.fw = fs[0]; d.fh = fs[1];
    d.ox = 0; d.oy = 0;
    d.fx = d.ix + d.ox; d.fy = d.iy + d.oy;
    d.center = { x: d.ix + Math.floor(d.iw / 2), y: d.iy + Math.floor(d.ih / 2) };
    d.outdoor = true;
    d.open0 = !!d.open0;
    if (d.cost || d.rent || d.util) bad(id + ': 地区の開通に費用・家賃がある（M2 からタダ。中の設備に移す）');
    d.cost = 0; d.rent = 0; d.util = 0;
    if (!d.open0 && typeof d.req !== 'function') bad(id + ': 開通の条件 req(S, G) がない');
    if (!d.open0 && (!d.reqText || !d.reqText_en)) bad(id + ': 開通の条件の文 reqText / reqText_en がない');
    d.grid = resolveGrid(d.grid);
    d.at = d.at || {};
    d.bottomPad = d.bottomPad || 0;
    if (d.lease) {
      d.lease = Object.assign({}, d.lease);
      d.lease.x = d.fx + d.lease.pad[0]; d.lease.y = d.fy + d.lease.pad[1];
    }
    DISTRICTS.push(d);
    DIST[id] = d;
  });
  var GRID_AT = [];
  DISTRICTS.forEach(function (d) { (GRID_AT[d.col] || (GRID_AT[d.col] = []))[d.row] = d; });
  var PLOTS = [];
  var BY_ID = {};
  var USED = {};
  function place(dist, id, px, py, def) {
    var d = def || defFor(id, dist.id);
    if (!d) { bad('区画の定義がありません: ' + id + '（' + dist.id + '）'); return null; }
    if (BY_ID[id]) { bad('区画が2回置かれています: ' + id); return null; }
    USED[id] = d;
    var sz = def ? { w: def.pw, h: def.ph } : sizeOf(id, dist.id);
    var p = Object.assign({}, d, {
      id: id, room: dist.id, roomIndex: dist.index,
      x: px, y: py, w: sz.w, h: sz.h
    });
    p.maxLevel = d.maxLevel || 6;
    p.level = d.owned ? 1 : 0;
    p.owned = !!d.owned;
    p.verb = d.verb || '建設';
    p.verb_en = d.verb_en || 'Build';
    p.padX = p.x + Math.floor(sz.w / 2);
    p.padY = p.y + sz.h;
    if (d.spots) {
      p.spots = {};
      Object.keys(d.spots).forEach(function (k) { p.spots[k] = { x: px + d.spots[k][0], y: py + d.spots[k][1] }; });
    }
    PLOTS.push(p);
    BY_ID[id] = p;
    dist.plots.push(id);
    return p;
  }
  function over(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function inFrame(dist, r) {
    return r.x >= dist.fx + MARGIN && r.y >= dist.fy + MARGIN &&
           r.x + r.w <= dist.fx + dist.fw - MARGIN && r.y + r.h <= dist.fy + dist.fh - MARGIN;
  }
  var RESERVES = [], DECO_LIST = [], DECO_DROPPED = [];
  var PENDING_DECO = [];
  DISTRICTS.forEach(function (dist) {
    dist.plots = [];
    dist.reserves = [];
    if (dist.fw > dist.iw || dist.fh > dist.ih) bad(dist.id + ': 地区の枠 ' + dist.fw + '×' + dist.fh + ' が列・行 ' + dist.iw + '×' + dist.ih + ' より大きい');
    var pk = packRows(dist.grid, function (id) { return sizeOf(id, dist.id); },
                      { top: dist.top, bottom: dist.bottom, pack: dist.pack, bottomPad: dist.bottomPad, w: dist.fw, h: dist.fh });
    pk.errs.forEach(function (m) { bad(dist.id + ': ' + m); });
    pk.items.forEach(function (it) {
      var x = dist.fx + it.lx, y = dist.fy + it.ly;
      if (it.kind === 'plot') place(dist, it.id, x, y);
      else if (it.kind === 'reserve') dist.reserves.push({ id: it.id, district: dist.id, x: x, y: y, w: it.w, h: it.h });
      else PENDING_DECO.push({ dist: dist, variant: it.id, x: x, y: y, w: it.w, h: it.h, row: true, area: it.area });
    });
    dist.roads = pk.roads.map(function (r) { return { y: dist.fy + r.y, h: r.h }; });
    Object.keys(dist.at).forEach(function (key) {
      var a = dist.at[key], id = key;
      if (key.charAt(0) === '?') {
        id = key.slice(1);
        if (CLAIMED[id] || !(DEFS[id] || V1_LEFT[id])) return;
        CLAIMED[id] = true;
        (dist.temp || (dist.temp = [])).push(id);
      }
      place(dist, id, dist.fx + a[0], dist.fy + a[1]);
    });
    if (dist.station || dist.plaza) bad(dist.id + ': 地区データに駅の名残（station / plaza）がある（§23.2 で駅をやめた）');
    Object.keys(dist.reserve || {}).forEach(function (id) {
      var r = dist.reserve[id];
      dist.reserves.push({ id: id, district: dist.id, x: dist.fx + r[0], y: dist.fy + r[1], w: r[2], h: r[3] });
    });
    (dist.deco || []).forEach(function (e) {
      PENDING_DECO.push({ dist: dist, variant: e[0], x: dist.fx + e[1], y: dist.fy + e[2], w: e[3], h: e[4] });
    });
    dist.plots.forEach(function (id) {
      var p = BY_ID[id];
      if (!inFrame(dist, p)) bad(id + ' が ' + dist.id + ' の内側 ' + (dist.fw - 2) + '×' + (dist.fh - 2) + ' からはみ出しています');
    });
  });
  DISTRICTS.forEach(function (dist) {
    dist.reserves = dist.reserves.filter(function (r) { return !BY_ID[r.id]; });
    dist.reserves.forEach(function (r) {
      if (!inFrame(dist, r)) bad(dist.id + ': 場所取り ' + r.id + ' が枠の内側からはみ出している');
      dist.plots.forEach(function (id) {
        var p = BY_ID[id];
        var temp = USED[id] === V1_LEFT[id] || (dist.temp || []).indexOf(id) >= 0;
        if (over(p, r) && !temp) bad(dist.id + ': 場所取り ' + r.id + ' に区画 ' + id + ' が重なっている');
      });
      RESERVES.push(r);
    });
  });
  var BLOCKS = {};
  DISTRICTS.forEach(function (d) {
    Object.keys(d.blocks || {}).forEach(function (bid) {
      var b = d.blocks[bid];
      if (BLOCKS[bid]) { bad('街区 ' + bid + ' が2つの地区にある: ' + BLOCKS[bid].district + ' と ' + d.id); return; }
      if (typeof b.req !== 'function') bad(d.id + ': 街区 ' + bid + ' に開く条件 req(S, G) がない');
      if (!b.name || !b.name_en || !b.reqText || !b.reqText_en) bad(d.id + ': 街区 ' + bid + ' の name / reqText の日英がそろっていない');
      var e = Object.assign({}, b, { id: bid, district: d.id, plots: (b.plots || []).slice() });
      e.plots.forEach(function (pid) {
        var p = BY_ID[pid], r = null;
        d.reserves.forEach(function (q) { if (q.id === pid) r = q; });
        if (p) {
          if (p.room !== d.id) bad('街区 ' + bid + ' の区画 ' + pid + ' が ' + d.id + ' ではなく ' + p.room + ' にある');
          else if (p.block && p.block !== bid) bad('区画 ' + pid + ' が2つの街区 ' + p.block + ' と ' + bid + ' にある');
          else p.block = bid;
        } else if (r) r.block = bid;
        else bad('街区 ' + bid + ' の ' + pid + ' が ' + d.id + ' の区画にも場所取りにも無い');
      });
      BLOCKS[bid] = e;
    });
  });
  (function () {
    var KEEP = {};
    function keep(x, y, r) { for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) KEEP[(x + dx) + ',' + (y + dy)] = 1; }
    PLOTS.concat(RESERVES).forEach(function (p) {
      for (var x = p.x - 1; x <= p.x + p.w; x++) { KEEP[x + ',' + (p.y + p.h)] = 1; KEEP[x + ',' + (p.y + p.h + 1)] = 1; }
      Object.keys(p.spots || {}).forEach(function (k) { keep(p.spots[k].x, p.spots[k].y, 1); });
      (p.padsLocal || []).forEach(function (q) { keep(p.x + q.x, p.y + q.y, 1); });
    });
    DISTRICTS.forEach(function (d) {
      keep(d.center.x, d.center.y, 1);
      if (d.lease) keep(d.lease.x, d.lease.y, 1);
    });
    var n = {};
    PENDING_DECO.forEach(function (e) {
      var dist = e.dist, why = null, r = { x: e.x, y: e.y, w: e.w, h: e.h };
      if (!DECO_DEFS[e.variant]) why = '知らない種類 ' + e.variant;
      else if (!inFrame(dist, r) || r.x + r.w > dist.ix + dist.iw - MARGIN || r.y + r.h > dist.iy + dist.ih - MARGIN) why = '地区の内側からはみ出す';
      else {
        for (var i = 0; i < PLOTS.length && !why; i++) if (over(PLOTS[i], r)) why = '区画 ' + PLOTS[i].id + ' に重なる';
        for (i = 0; i < RESERVES.length && !why; i++) if (over(RESERVES[i], r)) why = '場所取り ' + RESERVES[i].id + ' に重なる';
        for (var y = r.y; y < r.y + r.h && !why; y++) for (var x = r.x; x < r.x + r.w && !why; x++)
          if (KEEP[x + ',' + y]) why = 'パッドの来るマス (' + x + ',' + y + ') のそば';
      }
      if (why) { DECO_DROPPED.push(dist.id + ' ' + e.variant + ' (' + (e.x - dist.fx) + ',' + (e.y - dist.fy) + ' ' + e.w + '×' + e.h + '): ' + why); return; }
      n[dist.id] = (n[dist.id] || 0) + 1;
      var id = 'deco_' + dist.id + '_' + n[dist.id];
      var def = Object.assign({}, DECO_DEFS[e.variant], { pw: e.w, ph: e.h }, e.area ? { area: e.area } : {});
      DEFS[id] = def;
      var p = place(dist, id, e.x, e.y, def);
      if (p) { p.vi = n[dist.id]; DECO_LIST.push(p); }
    });
    if (DECO_DROPPED.length && window.console && console.warn) console.warn('[world] 置けなかった街並み: ' + DECO_DROPPED.join(' / '));
  })();
  var PENDING = {};
  Object.keys(DEFS).forEach(function (id) {
    if (BY_ID[id]) return;
    if (DEFS[id].home) PENDING[id] = DEFS[id];
  });
  var V1_LEFT_PLACED = Object.keys(USED).filter(function (id) { return USED[id] === V1_LEFT[id]; });
  Object.keys(DEFS).forEach(function (id) { if (!USED[id]) delete DEFS[id]; });
  V1_LEFT_PLACED.forEach(function (id) { DEFS[id] = V1_LEFT[id]; });
  var PIPELINE = V1_PIPELINE.filter(function (id) { return !!BY_ID[id]; });
  var FEEDERS = V1_FEEDERS.filter(function (id) { return !!BY_ID[id]; });
  var ROADS = [];
  [0, 1].forEach(function (k) {
    ROADS.push({ x: COL_X[k] + COL_W[k], y: RIM, w: AVE, h: WORLD_H - RIM * 2, dir: 'v' });
  });
  [0, 1].forEach(function (k) {
    ROADS.push({ x: RIM, y: ROW_Y[k] + ROW_H[k], w: WORLD_W - RIM * 2, h: AVE, dir: 'h' });
  });
  function axisCell(t, O, S, N) {
    if (t < RIM || t >= N - RIM) return -1;
    for (var k = 0; k < 3; k++) {
      if (t < O[k]) return -2;
      if (t < O[k] + S[k]) return k;
    }
    return -1;
  }
  function colAt(tx) { return axisCell(Math.floor(tx), COL_X, COL_W, WORLD_W); }
  function rowAt(ty) { return axisCell(Math.floor(ty), ROW_Y, ROW_H, WORLD_H); }
  function roomAt(tx, ty) {
    var cx = colAt(tx), cy = rowAt(ty);
    if (cx === -1 || cy === -1) return null;
    if (cx === -2 || cy === -2) return 'ave';
    return GRID_AT[cx][cy].id;
  }
  function roomAtPx(px, py) { return roomAt(px / TILE, py / TILE); }
  var BUCKETS = [];
  DISTRICTS.forEach(function (d) {
    BUCKETS.push({ key: 2 * (d.col + d.row), kind: 'district', id: d.id, c: d.col, r: d.row,
                   x0: d.ix, y0: d.iy, x1: d.ix + d.iw - 1, y1: d.iy + d.ih - 1 });
  });
  var c, r;
  for (c = 0; c < 3; c++) for (r = 0; r < 3; r++) {
    var ox = COL_X[c], oy = ROW_Y[r], cw = COL_W[c], rh = ROW_H[r];
    if (c < 2)
      BUCKETS.push({ key: 2 * (c + r) + 1, kind: 'ave', id: null, c: c, r: r, dir: 'v',
                     x0: ox + cw, y0: oy, x1: ox + cw + AVE - 1, y1: oy + rh - 1 });
    if (r < 2)
      BUCKETS.push({ key: 2 * (c + r) + 1, kind: 'ave', id: null, c: c, r: r, dir: 'h',
                     x0: ox, y0: oy + rh, x1: ox + cw - 1, y1: oy + rh + AVE - 1 });
    if (c < 2 && r < 2)
      BUCKETS.push({ key: 2 * (c + r) + 2.5, kind: 'cross', id: null, c: c, r: r,
                     x0: ox + cw, y0: oy + rh, x1: ox + cw + AVE - 1, y1: oy + rh + AVE - 1 });
  }
  BUCKETS.sort(function (a, b) { return a.key - b.key || a.c - b.c || a.x0 - b.x0; });
  var BUCKET = new Uint8Array(WORLD_W * WORLD_H);
  for (var bi = 0; bi < BUCKET.length; bi++) BUCKET[bi] = 255;
  BUCKETS.forEach(function (b, i) {
    b.i = i;
    for (var y = b.y0; y <= b.y1; y++)
      for (var x = b.x0; x <= b.x1; x++) BUCKET[y * WORLD_W + x] = i;
  });
  function bucketAt(px, py) {
    var x = Math.floor(px / TILE), y = Math.floor(py / TILE);
    if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return 255;
    return BUCKET[y * WORLD_W + x];
  }
  var RX0 = COL_X[0] + COL_W[0] + AVE / 2, RX1 = COL_X[1] + COL_W[1] + AVE / 2;
  var RY0 = ROW_Y[0] + ROW_H[0] + AVE / 2, RY1 = ROW_Y[1] + ROW_H[1] + AVE / 2;
  var RAIL = { loop: [[RX0, RY0], [RX1, RY0], [RX1, RY1], [RX0, RY1]], len: 2 * ((RX1 - RX0) + (RY1 - RY0)) };
  var REDGE = [];
  (function () {
    var s = 0;
    for (var i = 0; i < 4; i++) {
      var a = RAIL.loop[i], b = RAIL.loop[(i + 1) % 4], len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      REDGE.push({ s0: s, len: len, a: a, b: b });
      s += len;
    }
  })();
  function railPoint(s) {
    s = ((s % RAIL.len) + RAIL.len) % RAIL.len;
    var e = REDGE[0];
    for (var i = 3; i >= 0; i--) if (s >= REDGE[i].s0) { e = REDGE[i]; break; }
    var u = e.len ? (s - e.s0) / e.len : 0;
    return { x: e.a[0] + (e.b[0] - e.a[0]) * u, y: e.a[1] + (e.b[1] - e.a[1]) * u };
  }
  function fence(d) {
    return [{ x: d.ix, y: d.iy, w: d.iw, h: 1 },
            { x: d.ix, y: d.iy + d.ih - 1, w: d.iw, h: 1 },
            { x: d.ix, y: d.iy + 1, w: 1, h: d.ih - 2 },
            { x: d.ix + d.iw - 1, y: d.iy + 1, w: 1, h: d.ih - 2 }];
  }
  DISTRICTS.forEach(function (d) {
    var gp = d.gatePad || [0, -1];
    var gx = gp[0] < 0 ? d.ix - 1 : gp[0] >= d.fw ? d.ix + d.iw : d.fx + gp[0];
    var gy = gp[1] < 0 ? d.iy - 1 : gp[1] >= d.fh ? d.iy + d.ih : d.fy + gp[1];
    d.gatePad = { x: gx, y: gy };
    var mx = Math.floor(d.iw / 2), my = Math.floor(d.ih / 2);
    d.signs = [];
    if (d.row > 0) d.signs.push({ x: d.ix + mx, y: d.iy, side: 'N' });
    if (d.col < 2) d.signs.push({ x: d.ix + d.iw - 1, y: d.iy + my, side: 'E' });
    if (d.row < 2) d.signs.push({ x: d.ix + mx, y: d.iy + d.ih - 1, side: 'S' });
    if (d.col > 0) d.signs.push({ x: d.ix, y: d.iy + my, side: 'W' });
    if (!d.open0) d.expandPad = { x: d.gatePad.x, y: d.gatePad.y };
    d.door = { x: d.gatePad.x, y: d.gatePad.y, w: 1 };
    d.wallTop = d.iy - 1;
    d.wallBottom = d.iy + d.ih;
  });
  var FTK = DIST.futako;
  var START = { x: (FTK.center.x + 0.5) * TILE, y: (FTK.center.y + 0.5) * TILE };
  var LIMBO = { x: (FTK.ix + Math.floor(FTK.iw / 2) + 0.5) * TILE, y: (FTK.iy + FTK.ih - 0.5) * TILE };
  function dockOf(sx, sy, sw, sh, d) {
    return {
      bayX:  (sx + sw / 2) * TILE,
      bayY:  (sy + sh + 2.1) * TILE,
      laneY: Math.min(sy + sh + 5.2, d.iy + d.ih - 1.5) * TILE,
      inX:   Math.min(sx + sw + 9, d.ix + d.iw - 2) * TILE,
      outX:  Math.max(sx - 8, d.ix + 1) * TILE,
      bay:   { x: (sx + sw / 2) * TILE - 13, y: (sy + sh + 0.2) * TILE, w: 26, h: 60 }
    };
  }
  var OUT_N = 8;
  function yardSlots(sx, sy, sw, sh, d) {
    var dk = dockOf(sx, sy, sw, sh, d), out = [];
    var lane = Math.floor(dk.laneY / TILE);
    var bx0 = Math.floor(dk.bay.x / TILE), bx1 = Math.floor((dk.bay.x + dk.bay.w - 1) / TILE);
    var x0 = d.ix + MARGIN, x1 = d.ix + d.iw - 1 - MARGIN, x, y;
    for (y = sy + sh + 2; y < lane - 1 && out.length < OUT_N; y += 2) {
      for (x = bx0 - 2; x >= x0 && out.length < OUT_N; x -= 2) out.push({ x: x, y: y });
      for (x = bx1 + 2; x <= x1 && out.length < OUT_N; x += 2) out.push({ x: x, y: y });
    }
    return out;
  }
  var SHIP = BY_ID.ship, KD = SHIP ? DIST[SHIP.room] : null;
  var DOCK = SHIP ? dockOf(SHIP.x, SHIP.y, SHIP.w, SHIP.h, KD) : null;
  var OUT_SLOTS = SHIP ? yardSlots(SHIP.x, SHIP.y, SHIP.w, SHIP.h, KD).map(function (t) {
    return { x: (t.x + 0.5) * TILE, y: (t.y + 0.5) * TILE };
  }) : [];
  var ROAD_CACHE = {}, FOOT_MASK = null;
  function plotPoint(id) {
    var p = BY_ID[id];
    if (!p) return null;
    var s = (p.spots && (p.spots.contract || p.spots.spot)) || { x: p.padX, y: p.padY };
    return { x: s.x, y: s.y };
  }
  function roadDist(fromId, toId) {
    var a = plotPoint(fromId), b = plotPoint(toId), Gr = QT.Graph;
    if (!a || !b || !Gr || !Gr.gridDist) return -1;
    if (!FOOT_MASK) {
      FOOT_MASK = new Uint8Array(WORLD_W * WORLD_H);
      PLOTS.forEach(function (p) {
        for (var y = p.y; y < p.y + p.h; y++) for (var x = p.x; x < p.x + p.w; x++) FOOT_MASK[y * WORLD_W + x] = 1;
      });
    }
    var k = b.x + ',' + b.y, d = ROAD_CACHE[k];
    if (!d) d = ROAD_CACHE[k] = Gr.gridDist(function (x, y) {
      return roomAt(x, y) !== null && !FOOT_MASK[y * WORLD_W + x];
    }, WORLD_W, WORLD_H, b.x, b.y);
    return d[a.y * WORLD_W + a.x];
  }
  var BOOTHS = [];
  DISTRICTS.forEach(function (d) {
    var b = d.booths;
    if (!b) return;
    d.boothHall = { x: d.fx + b.hall[0], y: d.fy + b.hall[1], w: b.hall[2], h: b.hall[3] };
    Object.keys(b.at || {}).forEach(function (sid) {
      BOOTHS.push({ supplier: sid, district: d.id, x: d.fx + b.at[sid][0], y: d.fy + b.at[sid][1] });
    });
  });
  var VC_OFFICES = {};
  PLOTS.forEach(function (p) {
    if (p.kind !== 'vc') return;
    var fs = p.vcs || (p.vc ? [p.vc] : []);
    if (!fs.length) bad('VC の区画 ' + p.id + ' にファームの id（def.vc か def.vcs）が無い');
    fs.forEach(function (f) {
      if (VC_OFFICES[f]) bad('VC のファーム ' + f + ' の事務所が2つ: ' + VC_OFFICES[f] + ' と ' + p.id);
      else VC_OFFICES[f] = p.id;
      if (p.vcs && !(p.spots && p.spots['vc_' + f])) bad(p.id + ': ファーム ' + f + ' の窓口の置き場 spots.vc_' + f + ' が無い');
    });
  });
  var CAT = null;
  DISTRICTS.forEach(function (d) {
    var c = d.cat;
    if (!c) return;
    if (CAT) { bad('猫の路地が2つの地区にある: ' + CAT.district + ' と ' + d.id); return; }
    var pts = (c.path || []).map(function (q) { return { x: d.fx + q[0], y: d.fy + q[1] }; });
    for (var i = 1; i < pts.length; i++)
      if (pts[i].x !== pts[i - 1].x && pts[i].y !== pts[i - 1].y) bad(d.id + ': 猫の路地の ' + i + ' 本目が縦でも横でもない');
    CAT = { district: d.id, path: pts, sit: c.sit ? { x: d.fx + c.sit[0], y: d.fy + c.sit[1] } : pts[0] || null };
    if (pts.length < 2) bad(d.id + ': 猫の路地 path は2点以上');
  });
  QT.World = {
    TILE: TILE, PW: PW, PH: PH, GAP: COLGAP, COLGAP: COLGAP, ROWGAP: ROWGAP, MONTH: MONTH,
    CELL: CELL, AVE: AVE, RIM: RIM, MARGIN: MARGIN, USE: USE, CX: CX, CY: CY,
    WORLD_W: WORLD_W, WORLD_H: WORLD_H,
    COL_W: COL_W, ROW_H: ROW_H, COL_X: COL_X, ROW_Y: ROW_Y, colAt: colAt, rowAt: rowAt,
    WORLD_PX_W: WORLD_W * TILE, WORLD_PX_H: WORLD_H * TILE,
    DISTRICTS: DISTRICTS, ROOMS: DISTRICTS, DIST: DIST,
    ROADS: ROADS, roomAt: roomAt, roomAtPx: roomAtPx,
    BUCKETS: BUCKETS, BUCKET: BUCKET, bucketAt: bucketAt,
    STATIONS: STATIONS, STATION_BY_ID: STATION_BY_ID, RAIL: RAIL, railPoint: railPoint, FENCE: fence,
    ORDER: ORDER.slice(), BLOCKS: BLOCKS,
    packRows: packRows, sizeOf: sizeOf,
    PLOTS: PLOTS, BY_ID: BY_ID, DEFS: DEFS, CLIENTS: CLIENTS,
    CORPS: ['c_auto', 'c_mat', 'c_it', 'c_news', 'c_pharma', 'c_gov', 'c_fin'],
    PIPELINE: PIPELINE, FEEDERS: FEEDERS, DOMAINS: DOMAINS,
    OUT_SLOTS: OUT_SLOTS, START: START, LIMBO: LIMBO, DOCK: DOCK,
    dockOf: dockOf, yardSlots: yardSlots,
    roadDist: roadDist, plotPoint: plotPoint,
    PENDING: PENDING, V1_LEFT_PLACED: V1_LEFT_PLACED, BOOTHS: BOOTHS, DEF_FROM: DEF_FROM,
    LAYOUT_ERRORS: LAYOUT_ERRORS,
    RESERVES: RESERVES, DECO: DECO_LIST, DECO_KINDS: DECO_KINDS, DECO_DROPPED: DECO_DROPPED,
    VC_OFFICES: VC_OFFICES, CAT: CAT,
    center: function (p) { return { x: (p.x + p.w / 2) * TILE, y: (p.y + p.h / 2) * TILE }; },
    padPos: function (p) { return { x: (p.padX + 0.5) * TILE, y: (p.padY + 0.5) * TILE }; },
    spot: function (id, name) {
      var p = BY_ID[id], s = p && p.spots && p.spots[name];
      return s ? { x: s.x, y: s.y } : null;
    },
    frontSpot: function (p, taken) {
      var y = p.y + p.h, bad = {}, i, best = null;
      function mark(x, yy) { bad[x + ',' + yy] = 1; bad[(x - 1) + ',' + yy] = 1; bad[(x + 1) + ',' + yy] = 1; }
      (p.padsLocal || []).forEach(function (q) {
        if (p.y + q.y === y - 1) bad[(p.x + q.x) + ',' + y] = 1;
        if (p.y + q.y === y) mark(p.x + q.x, y);
      });
      (taken || []).forEach(function (t) { if (t.y === y) mark(t.x, y); else if (t.y === y - 1 || t.y === y + 1) bad[t.x + ',' + y] = 1; });
      for (i = p.x; i < p.x + p.w; i++) {
        if (bad[i + ',' + y]) continue;
        var d = Math.abs(i - p.padX) * 2 + (i < p.padX ? 1 : 0);
        if (!best || d < best.d) best = { x: i, y: y, d: d };
      }
      return best ? { x: best.x, y: best.y } : { x: p.padX, y: p.padY };
    }
  };
})(window.QT || (window.QT = {}));
