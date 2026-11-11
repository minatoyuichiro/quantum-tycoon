(function (QT) {
  'use strict';
  var TILE = 16;
  var PW = 4, PH = 3;
  var GAP = 1;
  var MONTH = 60;
  var PIPELINE = ['design', 'layout', 'tapeout',
                  'litho', 'depoetch', 'implant', 'cmp',
                  'dice', 'bond', 'pkg',
                  'qa'];
  var FEEDERS = ['fridge', 'cstage', 'ctrl'];
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
                pw: 9, ph: 6, open: true,
                blocks: [[1, 1, 3, 1], [1, 3, 3, 1], [5, 3, 3, 1], [6, 1, 2, 1], [2, 5, 5, 1]],
                shelves: [[1, 1, 3, 1], [1, 3, 3, 1], [5, 3, 3, 1]],
                parcelAt: [6, 1, 2, 1], counterAt: [2, 5, 5, 1],
                padsLocal: [
                  { type: 'reg',    x: 4, y: 4 },
                  { type: 'stock',  x: 2, y: 0 },
                  { type: 'pickup', x: 6, y: 2 }
                ] },
    cafe:     { kind: 'cafe', owned: true, name: 'コーヒーショップ', name_en: 'Coffee shop',
                short: 'カフェ', short_en: 'Cafe', color: '#8a5a3c',
                pw: 6, ph: 5, open: true,
                blocks: [[1, 1, 4, 1], [1, 3, 4, 1]],
                barAt: [1, 1, 4, 1], counterAt: [1, 3, 4, 1],
                padsLocal: [
                  { type: 'brew',   x: 1, y: 2 },
                  { type: 'cserve', x: 3, y: 2 }
                ] },
    notary:   { kind: 'notary', owned: true, name: '公証人役場', name_en: 'Notary office',
                short: '公証人役場', short_en: 'Notary', pw: 3, ph: 3, color: '#7d8fc4' },
    registry: { kind: 'registry', owned: true, name: '法務局', name_en: 'Legal bureau',
                short: '法務局', short_en: 'Registry', pw: 3, ph: 3, color: '#6f57e0' },
    bankp:    { kind: 'bank', owned: true, name: '銀行', name_en: 'Bank',
                short: '銀行', short_en: 'Bank', pw: 5, ph: 3, color: '#2fbf7a' },
    home:     { kind: 'house', owned: true, name: '実家', name_en: 'Family home',
                short: '実家', short_en: 'Home', pw: 5, ph: 4,
                color: '#e2a04a', roof: '#c76b3a' },
    kin:      { kind: 'house', owned: true, name: '親戚の家', name_en: 'Relatives',
                short: '親戚', short_en: 'Relatives', pw: 5, ph: 4,
                color: '#9fb8d8', roof: '#5a6c9e' },
    c_auto:  { kind: 'corp', owned: true, name: '自動車メーカー', name_en: 'Automotive maker',
               short: '自動車', short_en: 'Auto', pw: 5, ph: 4, color: '#ef7d2e', domain: 'cae',
               cvc: '大手自動車CVC', cvc_en: 'Automotive CVC' },
    c_mat:   { kind: 'corp', owned: true, name: '素材メーカー', name_en: 'Materials maker',
               short: '素材', short_en: 'Materials', pw: 5, ph: 4, color: '#2fbf7a', domain: 'pharma',
               cvc: '素材系CVC', cvc_en: 'Materials CVC' },
    c_it:    { kind: 'corp', owned: true, name: 'IT・通信企業', name_en: 'IT & telecom',
               short: 'IT企業', short_en: 'IT', pw: 5, ph: 4, color: '#2bb8d8', domain: 'opt',
               cvc: 'IT系CVC', cvc_en: 'IT CVC' },
    c_news:  { kind: 'corp', owned: true, news: true, name: '新聞社', name_en: 'Newspaper',
               short: '新聞社', short_en: 'Press', pw: 5, ph: 4, color: '#e2508a', domain: 'crypto',
               cvc: '新聞社', cvc_en: 'Newspaper' },
    c_pharma:{ kind: 'corp', owned: true, name: '製薬メーカー', name_en: 'Pharmaceutical maker',
               short: '製薬', short_en: 'Pharma', pw: 5, ph: 4, color: '#8fd14f', domain: 'pharma',
               cvc: '製薬系CVC', cvc_en: 'Pharma CVC' },
    c_gov:   { kind: 'corp', owned: true, name: '官公庁・研究機関', name_en: 'Government & institutes',
               short: '官公庁', short_en: 'Gov', pw: 5, ph: 4, color: '#7d8fc4', domain: 'opt',
               cvc: '官民ファンド', cvc_en: 'Public fund' },
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
               ], color: '#2bb8d8' },
    acct:    { kind: 'acct', owned: true, name: '経理', name_en: 'Accounting',
               short: '経理', short_en: 'Accounting', verb: '増員', verb_en: 'Hire',
               cost: 800000, maxLevel: 6, pw: 5, ph: 3, color: '#7d8fc4' },
    office:  { kind: 'office', name: '事務所', name_en: 'Office lease',
               short: '事務所', short_en: 'Office', verb: '借りる', verb_en: 'Rent',
               cost: 250000, maxLevel: 1, pw: 4, ph: 3, rent: 90000, util: 30000, color: '#f2a63b' },
    swjob:   { kind: 'swjob', name: 'ソフト受託', name_en: 'Software delivery',
               short: 'ソフト受託', short_en: 'SW delivery', verb: '増強', verb_en: 'Upgrade',
               owned: true, cost: 600000, maxLevel: 6, color: '#2fbf7a' },
    hwasm:   { kind: 'hwasm', name: 'ハード組立', name_en: 'Hardware assembly',
               short: 'ハード組立', short_en: 'HW assembly', verb: '増強', verb_en: 'Upgrade',
               cost: 1400000, maxLevel: 6, color: '#e2508a' },
    supply:  { kind: 'supply', name: '仕入れ', name_en: 'Procurement',
               short: '仕入れ', short_en: 'Supply', verb: '拡張', verb_en: 'Expand',
               owned: true, cost: 500000, maxLevel: 6, pw: 5, ph: 3, color: '#8a6a3c' },
    hwlab:   { kind: 'hwlab', name: 'ハードウェア研究開発', name_en: 'Hardware R&D',
               short: 'ハード研究', short_en: 'HW R&D', verb: '設置', verb_en: 'Set up',
               cost: 700000, maxLevel: 6, pw: 6, ph: 4, open: true,
               blocks: [[1, 1, 4, 1], [1, 3, 1, 1], [4, 3, 1, 1]],
               padsLocal: [{ type: 'rd', x: 2, y: 3 }, { type: 'rd', x: 3, y: 3 }],
               color: '#ef7d2e' },
    qcloud:  { kind: 'qcloud', name: '量子クラウド／DC', name_en: 'Quantum cloud & DC',
               short: '量子クラウド', short_en: 'Q-cloud',
               owned: true, pw: 8, ph: 5, maxLevel: 6, color: '#6f57e0' },
    gacha:   { kind: 'gacha', owned: true, name: '量子ガチャ', name_en: 'Quantum Gacha',
               short: '量子ガチャ', short_en: 'Gacha', pw: 3, ph: 3, color: '#e2508a' },
    staff:   { kind: 'staff', name: '採用', name_en: 'Hiring', short: '採用', short_en: 'Hire',
               verb: '採用', verb_en: 'Hire', cost: 300000, maxLevel: 8, color: '#2fbf7a' },
    design:  { kind: 'stage', name: '回路設計 (EDA)',   name_en: 'Circuit design (EDA)', short: '回路設計', short_en: 'Design',
               verb: '増強', verb_en: 'Upgrade', owned: true, cost: 80000, rate: 2.2, q: 3, color: '#2bb8d8' },
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
    qa:      { kind: 'stage', name: '品質保証テスト',   name_en: 'QA testing', short: 'QAテスト', short_en: 'QA',
               verb: '増強', verb_en: 'Upgrade', cost: 6200000, rate: 2.6, q: 9, color: '#2fbf7a' },
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
    ship:    { kind: 'ship', name: 'トラック搬出口', name_en: 'Truck loading dock', short: '搬出口', short_en: 'Dock',
               verb: '拡張', verb_en: 'Expand', owned: true, cost: 600000,
               pw: 6, ph: 3, color: '#2fbf7a' },
    svc:     { kind: 'service', name: '保守センター', name_en: 'Service center', short: '保守', short_en: 'Service',
               verb: '拡張', verb_en: 'Expand', cost: 1800000, color: '#ef7d2e' },
    seminar: { kind: 'seminar', name: 'セミナー会場', name_en: 'Seminar hall', short: 'セミナー', short_en: 'Seminar',
               verb: '設置', verb_en: 'Build', cost: 6000000, color: '#2fbf7a' },
    sns:     { kind: 'media', name: 'SNS運用', name_en: 'Social media', short: 'SNS', short_en: 'Social',
               verb: '開始', verb_en: 'Start', cost: 2600000, pop: 0.25, promo: 300000, color: '#2bb8d8' },
    tube:    { kind: 'media', name: '動画チャンネル', name_en: 'Video channel', short: '動画', short_en: 'Video',
               verb: '開設', verb_en: 'Start', cost: 6000000, pop: 0.45, promo: 800000, color: '#e2504a' },
    press:   { kind: 'media', name: 'メディア露出', name_en: 'Press coverage', short: 'メディア', short_en: 'Press',
               verb: '開始', verb_en: 'Start', cost: 14000000, pop: 0.8, promo: 2200000, color: '#e2508a' },
    lounge:  { kind: 'lounge', name: '社員ラウンジ', name_en: 'Staff lounge', short: 'ラウンジ', short_en: 'Lounge',
               verb: '改装', verb_en: 'Remodel', cost: 8000000, maxLevel: 5, pw: 5, ph: 4, color: '#8a4fd8' },
    arcade:  { kind: 'arcade', name: 'ゲームセンター', name_en: 'Game center', short: 'ゲーセン', short_en: 'Arcade',
               verb: '増設', verb_en: 'Expand', cost: 12000000, maxLevel: 5, pw: 5, ph: 4, pop: 0.35, color: '#2bb8d8' },
    sphere:  { kind: 'sphere', name: 'LEDスフィア', name_en: 'LED Sphere', short: 'LEDスフィア', short_en: 'Sphere',
               verb: '建設', verb_en: 'Build', cost: 40000000, maxLevel: 3, pw: 7, ph: 6, pop: 1.4, color: '#e2508a' },
    vc:      { kind: 'vc', name: 'ベンチャーキャピタル', name_en: 'Venture capital',
               short: 'VC', short_en: 'VC', verb: '面談', verb_en: 'Pitch',
               owned: true, pw: 4, ph: 3, color: '#6f57e0' },
    pharma:  { kind: 'software', name: '創薬・材料シミュ', name_en: 'Drug & materials sim', short: '創薬・材料', short_en: 'Pharma',
               verb: '進出', verb_en: 'Enter', cost: 9000000, domain: 'pharma' },
    fin:     { kind: 'software', name: '金融・リスク計算', name_en: 'Finance & risk', short: '金融', short_en: 'Finance',
               verb: '進出', verb_en: 'Enter', cost: 13000000, domain: 'fin' },
    cae:     { kind: 'software', name: 'CAE・自動車設計', name_en: 'CAE & automotive', short: 'CAE・自動車', short_en: 'CAE',
               verb: '進出', verb_en: 'Enter', cost: 19000000, domain: 'cae' },
    opt:     { kind: 'software', name: '最適化・AI', name_en: 'Optimization & AI', short: '最適化・AI', short_en: 'Optim.',
               verb: '進出', verb_en: 'Enter', cost: 26000000, domain: 'opt' },
    crypto:  { kind: 'software', name: '暗号・銀行', name_en: 'Crypto & banking', short: '暗号・銀行', short_en: 'Crypto',
               verb: '進出', verb_en: 'Enter', cost: 34000000, domain: 'crypto' },
    up_speed: { kind: 'upgrade', name: '移動速度', name_en: 'Walk speed', short: '移動速度', short_en: 'Speed',
                verb: '強化', verb_en: 'Upgrade', cost: 500000, up: 'speed', maxLevel: 6 },
    up_carry: { kind: 'upgrade', name: '運搬台数', name_en: 'Carry capacity', short: '運搬台数', short_en: 'Carry',
                verb: '強化', verb_en: 'Upgrade', cost: 1500000, up: 'carry', maxLevel: 5 },
    up_bot:   { kind: 'upgrade', name: '保守ロボット', name_en: 'Service robot', short: '保守ロボ', short_en: 'Robot',
                verb: '導入', verb_en: 'Deploy', cost: 9000000, up: 'bot', maxLevel: 4 },
    gate:    { kind: 'exchange', owned: true, name: '証券取引所', name_en: 'Stock exchange',
               short: '証券取引所', short_en: 'Exchange', pw: 11, ph: 9, color: '#e8a800' }
  };
  var ROOMS = [
    { id: 'biz', name: '企業街', name_en: 'Corporate district', outdoor: true, open0: true,
      sub: '顧客6社とCVC。宅配の届け先で、左の証券取引所で上場審査',
      sub_en: 'Six clients and their CVCs \u2014 parcel drop-offs, and the exchange on the left',
      cost: 0, rent: 0, leftCol: 'gate',
      grid: [['c_auto', 'c_mat', 'c_it'], ['c_news', 'c_pharma', 'c_gov']] },
    { id: 'town', open0: true, name: '商店街', name_en: 'Town', outdoor: true,
      sub: 'バイトと宅配、会社の手続き、そして実家・親戚・銀行からの借入',
      sub_en: 'Part-time work, parcels, paperwork — and money to borrow',
      cost: 0, rent: 0,
      grid: [['notary', 'registry', 'bankp', 'vc'],
             ['conveni', 'cafe'],
             ['home', 'kin']] },
    { id: 'sw', name: 'スタートアップオフィス', name_en: 'Startup office', open0: true,
      sub: '事務所を借りてソフトの受託開発へ',
      sub_en: 'Rent the office and start building software',
      cost: 0, rent: 0, util: 0,
      grid: [['swjob', 'acct', 'hwasm'],
             ['pc', 'desk', 'hwlab'],
             ['staff', 'qcloud', 'supply'],
             ['office', 'gacha']] },
    { id: 'plant', name: 'ハードウェア工場', name_en: 'Hardware plant',
      sub: '設計から組立、トラックへの搬出まで', sub_en: 'Design, assembly and truck loading',
      cost: 2500000, rent: 200000, util: 60000, bottomPad: 5,
      grid: [['design', 'layout', 'tapeout'], ['asm', 'ship']] },
    { id: 'service', name: '保守センター', name_en: 'Service center',
      sub: '保守収益の回収と不具合対応、設備の強化',
      sub_en: 'Collect service revenue, fix defects, upgrade yourself',
      cost: 2200000, rent: 200000,
      grid: [['svc', 'up_speed'], ['up_carry', 'up_bot']] },
    { id: 'outsrc', name: '外注（前工程・後工程）', name_en: 'Foundry & OSAT',
      sub: '露光からパッケージ、品質保証まで', sub_en: 'Litho through packaging and QA',
      cost: 6000000, rent: 400000,
      grid: [['litho', 'depoetch', 'implant', 'cmp'], ['dice', 'bond', 'pkg', 'qa']] },
    { id: 'cryo', name: '部材・冷却棟', name_en: 'Parts & cryogenics',
      sub: '冷凍機・ステージ・制御・ヘリウム', sub_en: 'Fridge, stage, control, helium',
      cost: 10000000, rent: 700000,
      grid: [['fridge', 'cstage'], ['ctrl', 'helium']] },
    { id: 'hq', name: '本社・応用研究棟', name_en: 'HQ & applications lab',
      sub: '広報と営業、顧客分野の開拓', sub_en: 'PR, sales and new customer domains',
      cost: 30000000, rent: 1500000,
      grid: [['seminar', 'sns', 'tube', 'press'], ['pharma', 'fin', 'cae', 'lounge'], ['opt', 'crypto', 'arcade'],
             ['sphere']] }
  ];
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
  function sizeOf(id) {
    var d = DEFS[id] || {};
    return { w: d.pw || PW, h: d.ph || PH };
  }
  function rowW(row) {
    var t = 0;
    row.forEach(function (id, i) { t += sizeOf(id).w + (i ? GAP + 1 : 0); });
    return t;
  }
  function rowH(row) {
    var m = 0;
    row.forEach(function (id) { m = Math.max(m, sizeOf(id).h); });
    return m;
  }
  var MARGIN = 2;
  function leftW(d) { return d.leftCol ? sizeOf(d.leftCol).w + GAP + 2 : 0; }
  function interiorW(d) {
    var m = 0;
    d.grid.forEach(function (row) { m = Math.max(m, rowW(row)); });
    return m + MARGIN * 2 + leftW(d);
  }
  function gridH(d) {
    var t = 0;
    d.grid.forEach(function (row, i) { t += rowH(row) + (i ? GAP + 1 : 0); });
    return t;
  }
  function interiorH(d) {
    var h = gridH(d);
    if (d.leftCol) h = Math.max(h, sizeOf(d.leftCol).h);
    return h + MARGIN * 2 + (d.bottomPad || 0);
  }
  var maxIW = 0;
  ROOMS.forEach(function (r) { maxIW = Math.max(maxIW, interiorW(r)); });
  var WORLD_W = maxIW + 6;
  var CX = Math.floor(WORLD_W / 2);
  var cur = 0;
  for (var i = ROOMS.length - 1; i >= 0; i--) {
    var r = ROOMS[i];
    var ih = interiorH(r), iw = interiorW(r);
    r.wallTop = cur;
    r.iy = cur + 1;
    r.ih = ih;
    r.iw = iw;
    r.ix = CX - Math.floor(iw / 2);
    r.wallBottom = cur + 1 + ih;
    r.index = i;
    cur += ih + 1;
  }
  var WORLD_H = cur + 1;
  ROOMS.forEach(function (r) { if (r.util == null) r.util = Math.round(r.rent * 0.3); });
  var PLOTS = [];
  var BY_ID = {};
  function place(room, id, px, py) {
    var d = DEFS[id];
    if (!d) return null;
    var sz = sizeOf(id);
    var p = Object.assign({}, d, {
      id: id, room: room.id, roomIndex: room.index,
      x: px, y: py, w: sz.w, h: sz.h
    });
    p.maxLevel = d.maxLevel || 6;
    p.level = d.owned ? 1 : 0;
    p.owned = !!d.owned;
    p.verb = d.verb || '建設';
    p.verb_en = d.verb_en || 'Build';
    p.padX = p.x + Math.floor(sz.w / 2);
    p.padY = p.y + sz.h;
    PLOTS.push(p);
    BY_ID[id] = p;
    room.plots.push(id);
    return p;
  }
  ROOMS.forEach(function (room) {
    room.plots = [];
    var lw = leftW(room);
    if (room.leftCol) {
      var lz = sizeOf(room.leftCol);
      place(room, room.leftCol, room.ix + MARGIN - 1,
            room.iy + MARGIN + Math.max(0, Math.round((gridH(room) - lz.h) / 2)));
    }
    var cy = room.iy + MARGIN;
    room.grid.forEach(function (row, ri) {
      var total = rowW(row);
      var x0 = room.ix + lw + Math.round((room.iw - lw - total) / 2);
      var rh = rowH(row);
      var cx = x0;
      row.forEach(function (id) {
        var sz = sizeOf(id);
        place(room, id, cx, cy + (rh - sz.h));
        cx += sz.w + GAP + 1;
      });
      var gapY = cy + rh;
      cy += rh + GAP + 1;
      if (ri < room.grid.length - 1) {
        room.roads = room.roads || [];
        room.roads.push({ y: gapY, h: cy - gapY });
      }
    });
    if (room.index > 0) room.expandPad = { x: CX - 1, y: ROOMS[room.index - 1].iy };
    room.door = { x: CX - 1, y: room.wallBottom, w: 2 };
  });
  var ASM = BY_ID.asm;
  var OUT_SLOTS = [0, 1, 2, 3].map(function (i) {
    return { x: (ASM.x + PW + 0.5) * TILE, y: (ASM.y + 0.6 + i * 0.9) * TILE };
  });
  var START = { x: (BY_ID.conveni.x + BY_ID.conveni.w + 1.5) * TILE,
                y: (BY_ID.conveni.y + BY_ID.conveni.h - 1.5) * TILE };
  var SHIP = BY_ID.ship;
  var DOCK = {
    bayX:  (SHIP.x + SHIP.w / 2) * TILE,
    bayY:  (SHIP.y + SHIP.h + 2.1) * TILE,
    laneY: (SHIP.y + SHIP.h + 5.2) * TILE,
    inX:   (SHIP.x + SHIP.w + 9) * TILE,
    outX:  (SHIP.x - 8) * TILE,
    bay:   { x: (SHIP.x + SHIP.w / 2) * TILE - 13, y: (SHIP.y + SHIP.h + 0.2) * TILE,
             w: 26, h: 60 }
  };
  QT.World = {
    TILE: TILE, PW: PW, PH: PH, CX: CX, MONTH: MONTH,
    WORLD_W: WORLD_W, WORLD_H: WORLD_H,
    WORLD_PX_W: WORLD_W * TILE, WORLD_PX_H: WORLD_H * TILE,
    ROOMS: ROOMS, PLOTS: PLOTS, BY_ID: BY_ID, CLIENTS: CLIENTS,
    CORPS: ['c_auto', 'c_mat', 'c_it', 'c_news', 'c_pharma', 'c_gov'],
    PIPELINE: PIPELINE, FEEDERS: FEEDERS, DOMAINS: DOMAINS,
    OUT_SLOTS: OUT_SLOTS, START: START, DOCK: DOCK,
    center: function (p) { return { x: (p.x + p.w / 2) * TILE, y: (p.y + p.h / 2) * TILE }; },
    padPos: function (p) { return { x: (p.padX + 0.5) * TILE, y: (p.padY + 0.5) * TILE }; }
  };
})(window.QT || (window.QT = {}));
