(function (QT) {
  'use strict';
  var D = QT.Data || (QT.Data = {});
  var E = D.ESTATE = {};
  E.STARTS = {
    worker:  { age: 35, cash: 4000000, gross: 500000, pension: 0, living: 280000,
               retireAge: 60, retireBonus: 15000000, pensionAfter: 180000,
               name: '会社員', name_en: 'Office worker',
               sub: '35歳・年収600万・貯金400万。ローンを味方に、時間をかけて',
               sub_en: 'Age 35 · ¥6M salary · ¥4M saved. Let loans and time work for you' },
    pension: { age: 65, cash: 20000000, gross: 0, pension: 220000, living: 230000,
               retireAge: 0, retireBonus: 0, pensionAfter: 220000,
               freeNeed: 210000,
               name: '年金暮らし', name_en: 'Retiree',
               sub: '65歳・退職金2,000万・年金月22万（生活費23万）。借りにくいので現金で小さく',
               sub_en: 'Age 65 · ¥20M lump sum · ¥220k/mo pension (¥230k living). Hard to borrow, so start small in cash' }
  };
  E.STARTS.founder = { age: 25, cash: 5000000, gross: 0, pension: 0, living: 200000,
                       retireAge: 65, retireBonus: 0, pensionAfter: 65000,
                       biz: { base: 280000, grow: 0.06, max: 2.5 },
                       name: '若手起業家（不動産会社）', name_en: 'Young founder (property company)',
                       sub: '25歳・貯金500万。不動産会社を立ち上げ、仲介の手数料で稼ぎながら物件を増やす。銀行は実績を見るので、はじめは公庫から',
                       sub_en: 'Age 25 · ¥5M saved. Start a property firm and earn brokerage fees while you grow. Banks want a track record, so start with Japan Finance Corp.' };
  E.JIKKA = {
    at: { worker: [55, 60], pension: [69, 73], founder: [60, 64] },
    area: 'kashiwa', landA: 150, landK: 0.5, size: 95, built: 1979, walk: 22, cond: 0.5,
    rosen: 0.8, koteiLand: 0.7, koteiBldg: 0.5,
    savings: 2000000, funeral: 1500000, heirs: 2, basic: 30000000, perHeir: 6000000,
    reg: 0.004, scrivener: 100000, clearOut: 400000, reform: 3500000,
    acqRate: 0.05, special: 30000000, specialMax: 100000000, specialYears: 3, builtLimit: 1981,
    taxLand: 0.014, taxCity: 0.003, taxBldg: 0.017, smallLand: 1 / 6, smallCity: 1 / 3, burden: 0.7,
    svc: 8000, tidy: 300000, warn: 6, guide: 12, kankoku: 18, wearAkiya: 0.03, wearCare: 0.015,
    payMonths: 10, startYear: 2026
  };
  E.INH_TAX = [[10000000, 0.10, 0], [30000000, 0.15, 500000], [50000000, 0.20, 2000000], [100000000, 0.30, 7000000],
               [200000000, 0.40, 17000000], [300000000, 0.45, 27000000], [600000000, 0.50, 42000000], [Infinity, 0.55, 72000000]];
  E.LIFE_END = 88;
  E.SOCIAL = 0.15;
  E.CARD_RATE = 0.15;
  E.FORCE_SELL = -5000000;
  E.DIST = {
    fab:      { rent: 3800, cap: 0.042, fill: 1.4, grow: 0.008, vol: 0.03, land: 620000,  region: 'tokyo',    live: true, dense: 1.5, tour: 1.0,
                corp: 0.45, park: 28000, busy: 50000, wash: 0.75 },
    hongo:    { rent: 4000, cap: 0.043, fill: 1.8, grow: 0.006, vol: 0.02, land: 850000,  region: 'tokyo',    live: true, stud: true, dense: 1.6, tour: 1.4,
                corp: 0.3,  park: 30000, busy: 45000, wash: 1.0 },
    futako:   { rent: 2700, cap: 0.056, fill: 1.8, grow: 0.004, vol: 0.02, land: 200000,  region: 'chiba',    live: true, dense: 1.0, tour: 0.35,
                corp: 0.15, park: 10000, busy: 15000, wash: 0.9 },
    shinjuku: { rent: 4600, cap: 0.038, fill: 1.3, grow: 0.012, vol: 0.04, land: 1300000, region: 'tokyo',    live: true, dense: 2.0, tour: 1.3,
                corp: 0.8,  park: 38000, busy: 70000, wash: 0.5 },
    otemachi: { rent: 5800, cap: 0.030, fill: 1.2, grow: 0.015, vol: 0.04, land: 3500000, region: 'tokyo',    live: false, dense: 3.0, tour: 0.8,
                corp: 1.0,  park: 60000, busy: 90000, wash: 0.1 },
    inzai:    { rent: 2400, cap: 0.059, fill: 2.2, grow: -0.004, vol: 0.03, land: 140000,  region: 'chiba',    live: true, dense: 0.9, tour: 0.25,
                corp: 0.3,  park: 9000,  busy: 15000, wash: 0.85 },
    shibuya:  { rent: 5400, cap: 0.034, fill: 1.0, grow: 0.015, vol: 0.05, land: 2200000, region: 'tokyo',    live: true, dense: 2.2, tour: 1.2,
                corp: 0.7,  park: 45000, busy: 75000, wash: 0.35 },
    minato:   { rent: 4200, cap: 0.039, fill: 1.5, grow: 0.010, vol: 0.03, land: 850000,  region: 'kanagawa', live: true, dense: 1.8, tour: 0.9,
                corp: 0.75, park: 30000, busy: 45000, wash: 0.6 },
    ariake:   { rent: 4300, cap: 0.037, fill: 1.5, grow: 0.012, vol: 0.08, land: 1000000, region: 'tokyo',    live: true, dense: 2.0, tour: 0.9,
                corp: 0.5,  park: 30000, busy: 35000, wash: 0.55 }
  };
  E.AREAS = {
    fab:      [{ id: 'oizumi',  zone: 'w',  name: '大泉学園', name_en: 'Oizumi-Gakuen', rent: 0.85, land: 0.6, fill: 1.25, cap: 0.010,
                 sub: '練馬の西の住宅地。安くて戸建てが多い', sub_en: 'Western Nerima suburb; cheap, many houses' },
               { id: 'nerima',  zone: 'c',  name: '練馬', name_en: 'Nerima', rent: 0.95, land: 0.85, fill: 1.0, cap: 0.004,
                 sub: '西武線の住宅地。ファミリーと単身', sub_en: 'Seibu-line homes; families and singles' },
               { id: 'ikebukuro', zone: 'e', name: '池袋', name_en: 'Ikebukuro', rent: 1.2, land: 1.6, fill: 0.8, cap: -0.006,
                 sub: '大きな駅。ワンルームと店舗が強い', sub_en: 'Big terminal; strong for studios and shops' }],
    hongo:    [{ id: 'hongo',   zone: 'sw', name: '本郷', name_en: 'Hongo', rent: 1.05, land: 1.1, fill: 0.8, cap: -0.002,
                 sub: '大学の近く。学生向けは強いが大学しだい', sub_en: 'Near the university; student demand (while it lasts)' },
               { id: 'ueno',    zone: 'c',  name: '上野', name_en: 'Ueno', rent: 1.0, land: 1.0, fill: 1.0, cap: 0.002,
                 sub: '下町の駅前。店舗も', sub_en: 'Old-town station area; shops too' },
               { id: 'senju',   zone: 'ne', name: '北千住', name_en: 'Kita-Senju', rent: 0.85, land: 0.7, fill: 1.1, cap: 0.010,
                 sub: '安くて利回りが高い。築古の戸建て', sub_en: 'Cheap, high yields; old houses' }],
    futako:   [{ id: 'otaka',   zone: 'w',  name: '流山おおたかの森', name_en: 'Nagareyama-Otakanomori', rent: 1.15, land: 1.3, fill: 0.8, cap: -0.006,
                 sub: '子育て世帯に人気。新しい街で値上がり中', sub_en: 'Popular with young families; rising' },
               { id: 'kashiwa', zone: 'c',  name: '柏駅前', name_en: 'Kashiwa Station', rent: 1.05, land: 1.1, fill: 0.9, cap: 0,
                 sub: '常磐線の駅前。単身も家族も', sub_en: 'Joban line hub; singles and families' },
               { id: 'abiko',   zone: 'e',  name: '我孫子', name_en: 'Abiko', rent: 0.8, land: 0.6, fill: 1.4, cap: 0.012,
                 sub: '安いが空室が長引きがち', sub_en: 'Cheap, but vacancies drag on' }],
    shinjuku: [{ id: 'nakano',  zone: 'w',  name: '中野', name_en: 'Nakano', rent: 0.9, land: 0.75, fill: 1.0, cap: 0.004,
                 sub: '中央線の住宅地。ワンルームが多い', sub_en: 'Chuo-line homes; many studios' },
               { id: 'okubo',   zone: 'ne', name: '新大久保', name_en: 'Shin-Okubo', rent: 0.9, land: 0.85, fill: 1.0, cap: 0.008,
                 sub: 'にぎやか。入れ替わりが早い', sub_en: 'Lively; tenants turn over fast' },
               { id: 'nishi',   zone: 'se', name: '西新宿', name_en: 'Nishi-Shinjuku', rent: 1.1, land: 1.3, fill: 0.9, cap: -0.003,
                 sub: '高層ビル街。法人の社宅需要', sub_en: 'Skyscraper district; corporate housing demand' }],
    otemachi: [{ id: 'ote',     zone: 'c',  name: '大手町', name_en: 'Otemachi', rent: 1, land: 1, fill: 1, cap: 0 }],
    inzai:    [{ id: 'funa',    zone: 'w',  name: '市川・船橋', name_en: 'Ichikawa & Funabashi', rent: 1.3, land: 1.8, fill: 0.7, cap: -0.010,
                 sub: '総武線・東西線で都心に近い', sub_en: 'Close to central Tokyo on the Sobu & Tozai lines' },
               { id: 'chunt',   zone: 'c',  name: '千葉ニュータウン', name_en: 'Chiba New Town', rent: 1.0, land: 0.9, fill: 1.0, cap: 0,
                 sub: '家族向け。空き地も多い', sub_en: 'Family homes; plenty of vacant lots' },
               { id: 'inzai',   zone: 'e',  name: '印西牧の原', name_en: 'Inzai-Makinohara', rent: 0.8, land: 0.5, fill: 1.5, cap: 0.015,
                 sub: '土地が安い。新築アパート向きだが空室の罠', sub_en: 'Cheap land for new builds — beware the vacancy trap' }],
    shibuya:  [{ id: 'aoyama',  zone: 'ne', name: '青山・表参道', name_en: 'Aoyama & Omotesando', rent: 1.3, land: 1.6, fill: 0.8, cap: -0.006,
                 sub: '高くて空かない。事務所と店舗', sub_en: 'Pricey and rarely empty; offices and shops' },
               { id: 'shibu',   zone: 'c',  name: '渋谷駅前', name_en: 'Shibuya Station', rent: 1.1, land: 1.3, fill: 0.7, cap: 0,
                 sub: '単身者と法人の需要が強い', sub_en: 'Strong demand from singles and companies' },
               { id: 'daikan',  zone: 'sw', name: '代官山', name_en: 'Daikanyama', rent: 1.2, land: 1.3, fill: 0.85, cap: -0.004,
                 sub: 'おしゃれな住宅地。利回りは低い', sub_en: 'Chic homes; low yields' }],
    minato:   [{ id: 'kosugi',  zone: 'w',  name: '武蔵小杉', name_en: 'Musashi-Kosugi', rent: 1.0, land: 1.0, fill: 0.9, cap: 0, region: 'kanagawa',
                 sub: 'タワマンとファミリー', sub_en: 'Towers and families' },
               { id: 'shina',   zone: 'ne', name: '品川', name_en: 'Shinagawa', rent: 1.15, land: 1.3, fill: 0.8, cap: -0.004, region: 'tokyo',
                 sub: '新幹線の駅。法人の借り上げが多い', sub_en: 'Shinkansen hub; lots of corporate leases' },
               { id: 'mm',      zone: 's',  name: 'みなとみらい', name_en: 'Minato Mirai', rent: 1.05, land: 1.1, fill: 1.0, cap: 0.002, region: 'kanagawa',
                 sub: '横浜の新しい街', sub_en: "Yokohama's new waterfront" }],
    ariake:   [{ id: 'kachi',   zone: 'nw', name: '勝どき', name_en: 'Kachidoki', rent: 1.1, land: 1.2, fill: 0.85, cap: -0.002,
                 sub: '銀座に近い湾岸', sub_en: 'Bayfront near Ginza' },
               { id: 'toyosu',  zone: 'c',  name: '豊洲', name_en: 'Toyosu', rent: 1.05, land: 1.1, fill: 0.9, cap: -0.002,
                 sub: 'タワマン。値上がり狙いの人が多い', sub_en: 'Towers; many buy for price gains' },
               { id: 'ariake',  zone: 'se', name: '有明', name_en: 'Ariake', rent: 0.95, land: 0.9, fill: 1.1, cap: 0.004,
                 sub: 'まだ店が少ない。伸びしろ', sub_en: 'Few shops yet; room to grow' }]
  };
  E.KINDS = {
    ku:     { use: 'home', name: '区分マンション', name_en: 'Condo unit', short: '区分', short_en: 'Condo',
              units: 1, area: 25, landA: 0, struct: 'rc', rentK: 1.0, capAdd: 0.000, ageK: 0.82, age: [3, 35],
              fee: 12000, stay: 48, corpOk: true },
    ko:     { use: 'home', name: '中古戸建て', name_en: 'Used house', short: '戸建て', short_en: 'House',
              units: 1, area: 75, landA: 100, struct: 'w', rentK: 0.8, capAdd: 0.012, age: [15, 50],
              fee: 0, stay: 84, corpOk: true },
    apa:    { use: 'home', name: '一棟アパート', name_en: 'Wooden apartment block', short: 'アパート', short_en: 'Apartments',
              units: 6, area: 25, landA: 160, struct: 'w', rentK: 0.92, capAdd: 0.003, capSub: 0.013, ageK: 0.6, age: [2, 35],
              fee: 3000, stay: 48, subOk: true },
    man:    { use: 'home', name: '一棟マンション', name_en: 'Concrete apartment building', short: 'マンション', short_en: 'Building',
              units: 12, area: 30, landA: 150, struct: 'rc', rentK: 0.95, capAdd: 0.001, capSub: 0.010, ageK: 0.6, age: [5, 40],
              fee: 4000, stay: 60, subOk: true, corpOk: true },
    office: { use: 'office', name: '事務所（法人向け）', name_en: 'Office space (corporate)', short: '事務所', short_en: 'Office',
              units: 1, area: 80, landA: 0, struct: 'rc', rentK: 1.05, capAdd: 0.010, age: [8, 40],
              fee: 30000, stay: 110, fillMul: 2.8 },
    shop:   { use: 'office', name: '店舗', name_en: 'Shop', short: '店舗', short_en: 'Shop',
              units: 1, area: 60, landA: 70, struct: 'rc', rentK: 1.15, capAdd: 0.015, age: [10, 40],
              fee: 8000, stay: 96, fillMul: 2.5 },
    park:   { use: 'park', name: '月極駐車場', name_en: 'Monthly car park', short: '月極', short_en: 'Car park',
              units: 0, area: 0, landA: 0, struct: null, rentK: 0, capAdd: 0, age: [0, 0], fee: 500, stay: 40 },
    cpark:  { use: 'cpark', name: 'コインパーキング', name_en: 'Coin parking', short: 'コインP', short_en: 'Coin park',
              units: 0, area: 0, landA: 0, struct: null, rentK: 0, capAdd: 0, age: [0, 0], fee: 0, stay: 0 },
    wash:   { use: 'wash', name: 'コインランドリー', name_en: 'Coin laundry', short: 'ランドリー', short_en: 'Laundry',
              units: 0, area: 0, landA: 0, struct: 'eq', rentK: 0, capAdd: 0, age: [0, 0], fee: 0, stay: 0 },
    ob:     { use: 'office', name: '一棟オフィスビル', name_en: 'Office building', short: 'ビル', short_en: 'Building',
              units: 4, area: 100, landA: 130, struct: 'rc', rentK: 1.0, capAdd: 0.006, ageK: 0.6, age: [5, 45],
              fee: 15000, stay: 120, fillMul: 2.6, corpOk: true, wholeLease: true },
    trunk:  { use: 'trunk', name: 'トランクルーム', name_en: 'Self-storage', short: 'トランク', short_en: 'Storage',
              units: 0, area: 0, landA: 0, struct: null, rentK: 0, capAdd: 0, age: [0, 0], fee: 0, stay: 0 },
    land:   { use: 'land', name: '空き地', name_en: 'Vacant lot', short: '空き地', short_en: 'Lot',
              units: 0, area: 0, landA: 150, struct: null, rentK: 0, capAdd: 0, age: [0, 0], fee: 0, stay: 0 }
  };
  E.LIFE = { w: 22, rc: 47, eq: 10 };
  E.BUILD_COST = { w: 220000, rc: 330000 };
  E.BUY_COST = 0.07;
  E.SELL_FEE = 0.033;
  E.MGMT_FEE = 0.05;
  E.AD_MONTHS = 1;
  E.KEY_MONEY = 1;
  E.RESTORE_MONTHS = 0.8;
  E.EVICT_MONTHS = 24;
  E.INSURE = 0.0015;
  E.PROP_TAX = 0.017;
  E.FLOOR = { bulk: 0.9, vacant: 0.9, occ: 0.7, occOut: 0.8, occDense: 1.4, shop: 0.7, ku: 0.5 };
  E.REBUILD_NO = { p: 0.25, land: 0.5, minDense: 1.4 };
  E.BULK = {
    apa: { units: [4, 8], dnMax: 1.2, max: 10, floorK: 1.15, far: [1.0, 1.6, 0.9, 1.8] },
    man: { units: [8, 14], dnMax: 1.1, max: 16, floorK: 1.25, far: [2, 2, 1.8, 5] }
  };
  E.CONDO = {
    kanriBase: 2500, kanriM2: 140, kanriLuxM2: 380,
    resM2: 200, resLuxM2: 230,
    stepYears: 5, steps: [0.45, 0.65, 0.85, 1.0, 1.15, 1.3, 1.4],
    kintoP: 0.25, kinto: 1.0,
    cycle: [12, 15],
    shortP: { dankai: [0.25, 0.45, 0.6], kinto: [0.1, 0.2, 0.3] },
    workM2: 15000, levyM2: [5000, 12000],
    loanYears: 10, loanK: 1.06,
    decideMonths: 3,
    bigCond: 0.1, bigFloor: 0.15
  };
  E.CORP = { rentK: 0.95, years: [2, 4], renew: 0.6 };
  E.SUB = { rentK: 0.85, cutEvery: 24, cut: [0.05, 0.10], quitMonths: 6 };
  E.BUILDS = {
    apa:   { kind: 'apa', unitsPerLand: 1 / 26, months: 6, name: 'アパートを建てる（木造）', name_en: 'Build apartments (wood)' },
    ko:    { kind: 'ko', units: 1, months: 4, name: '戸建て賃貸を建てる', name_en: 'Build a rental house' },
    park:  { kind: 'park', perSpace: 15, months: 1, cost: 300000, perM2: 3000,
             name: '月極駐車場にする', name_en: 'Monthly car park' },
    cpark: { kind: 'cpark', perSpace: 18, months: 1, cost: 1500000, perM2: 8000,
             name: 'コインパーキングにする', name_en: 'Coin parking' },
    wash:  { kind: 'wash', months: 2, cost: 18000000, perM2: 0, from: ['land', 'shop'],
             name: 'コインランドリーを開く', name_en: 'Open a coin laundry' },
    ob:    { kind: 'ob', months: 10, minCorp: 0.45, name: 'オフィスビルを建てる（RC）', name_en: 'Build an office building (RC)' },
    trunk: { kind: 'trunk', perBox: 3, months: 2, cost: 1500000, boxCost: 350000,
             name: 'トランクルームにする', name_en: 'Self-storage units' }
  };
  E.TRUNK = { box: 1.8, fill: 18, max: 0.85, cost: 0.15 };
  E.STAY = { nights: 15, night: 0.11, ota: 0.15, clean: 4000, agent: 0.20, setup: 300000, setupUnit: 250000,
             innNights: 25, innSetup: 2000000, innUnit: 500000, innTour: 0.9,
             season: [-0.15, -0.12, 0.12, 0.15, 0.05, -0.1, 0.08, 0.12, 0, 0.05, 0.02, 0.05] };
  E.GROUND = { rate: 0.03, years: 30, value: 0.75 };
  E.CPARK_LEASE = 0.55;
  E.CPARK_COST = 0.15;
  E.WASH = { base: 650000, ramp: 12, cost: 0.32, mgmt: 0.10, vol: 0.18 };
  E.LENDERS = {
    mega:     { name: 'メガバンク', name_en: 'Megabank', spread: 0.006, mult: 8, ltv: 0.75, maxTerm: 35,
                minIncome: 7000000, regions: ['tokyo'], minTerm: 15, fee: 0.022, color: '#2bb8d8',
                sub: '金利は安い。年収700万から・23区・頭金25%', sub_en: 'Cheap. ¥7M income, Tokyo-23 only, 25% down',
                note: 'なぜ年収700万から: メガバンクの投資用ローンは、給料だけでも返せる人（年収700万〜1,000万以上が目安）が相手。年収600万の会社員は地方銀行・信用金庫・ネット銀行から',
                note_en: 'Why ¥7M: megabank investment loans are for people whose salary alone could repay (¥7–10M+). On ¥6M, borrow from regional, shinkin or online banks' },
    trust:    { name: '信託銀行', name_en: 'Trust bank', spread: 0.005, mult: 12, ltv: 0.6, maxTerm: 30,
                minIncome: 0, minNet: 50000000, minTerm: 10, fee: 0.01, color: '#8a6fd8',
                sub: '純資産5,000万から。金利は最安・頭金4割', sub_en: 'Needs ¥50M net worth. Lowest rate, 40% down' },
    netbank:  { name: 'ネット銀行', name_en: 'Online bank', spread: 0.009, mult: 8, ltv: 0.8, maxTerm: 35,
                minIncome: 5000000, kinds: ['ku'], regions: ['tokyo', 'kanagawa'], minTerm: 15, fee: 0.022, color: '#23a6c9',
                sub: '区分マンションだけ。手続きが早い', sub_en: 'Condo units only. Fast and simple' },
    chigin:   { name: '地方銀行', name_en: 'Regional bank', spread: 0.011, mult: 10, ltv: 0.85, maxTerm: 35,
                minIncome: 4500000, regions: ['chiba', 'tokyo'], minTerm: 10, fee: 0.022, eco: 5, color: '#2fbf7a',
                sub: '千葉の地銀。柏・船橋・印西の一棟も見てくれる', sub_en: 'Chiba regional bank; lends on suburban blocks' },
    chigin2:  { name: '第二地方銀行', name_en: 'Second-tier regional bank', spread: 0.019, mult: 14, ltv: 1.0, maxTerm: 30,
                minIncome: 4000000, minTerm: 10, fee: 0.03, eco: 15, color: '#53b36a',
                sub: 'フルローンも出る。古い物件にも長く貸す。金利は高め', sub_en: 'Will lend 100% and long on old buildings, at a higher rate' },
    shinkin:  { name: '信用金庫', name_en: 'Shinkin bank', spread: 0.016, mult: 9, ltv: 0.85, maxTerm: 30,
                minIncome: 1200000, regions: ['tokyo'], minTerm: 8, fee: 0.011, color: '#f2a63b',
                sub: '地元（23区）なら年金でも話を聞いてくれる', sub_en: 'Will hear out retirees, for Tokyo-23 property' },
    shinkumi: { name: '信用組合', name_en: 'Credit cooperative', spread: 0.023, mult: 8, ltv: 0.8, maxTerm: 25,
                minIncome: 1000000, minTerm: 5, cap: 50000000, fee: 0.011, eco: 10, rebuildOk: true, color: '#e2a04a',
                sub: '小さく・どこでも。築古にも短く貸す', sub_en: 'Small loans anywhere; short loans on old buildings' },
    koko:     { name: '日本政策金融公庫', name_en: 'Japan Finance Corp.', spread: 0, fixedRate: 0.026, mult: 5, ltv: 0.7,
                maxTerm: 15, minIncome: 1000000, minTerm: 5, cap: 30000000, fee: 0, fixedOnly: true, color: '#6f57e0',
                sub: '固定2.6%・15年・3,000万まで。はじめての小口・ランドリーにも', sub_en: 'Fixed 2.6% · 15 yrs · up to ¥30M. Good for a first loan or a laundry' },
    nonbank:  { name: 'ノンバンク', name_en: 'Non-bank lender', spread: 0.036, mult: 15, ltv: 1.0, maxTerm: 35,
                minIncome: 0, minTerm: 5, fee: 0.03, eco: 20, rebuildOk: true, color: '#e2504a',
                sub: 'ほぼ通るが金利が高い。返済比率に気をつけて', sub_en: 'Almost always says yes, but the rate is high. Watch your payments' }
  };
  E.RATE_PATH = [[1, 0.0125], [2, 0.015], [3, 0.0175], [5, 0.020], [9, 0.0175], [14, 0.0125], [20, 0.010], [30, 0.0125], [40, 0.015]];
  E.RATE_LONG_ADD = 0.009;
  E.FIXED_ADD = 0.008;
  E.CAP_RATE_BETA = 0.35;
  E.TAX_BRACKETS = [[1950000, 0.05, 0], [3300000, 0.10, 97500], [6950000, 0.20, 427500], [9000000, 0.23, 636000],
                    [18000000, 0.33, 1536000], [40000000, 0.40, 2796000], [Infinity, 0.45, 4796000]];
  E.RESIDENT = 0.10;
  E.BASIC_DED = 580000;
  E.BASIC_DED_RES = 430000;
  E.BASIC_DED_TAPER = [[23500000, 580000, 430000], [24000000, 480000, 430000], [24500000, 320000, 290000],
                       [25000000, 160000, 150000], [Infinity, 0, 0]];
  E.SALARY_DED_MIN = 650000;
  E.RES_ADJ_DIFF = 50000;
  E.RES_KINTO = 5000;
  E.RES_KINTO_FREE = 450000;
  E.BLUE_SMALL = 100000;
  E.BLUE_BIG = 650000;
  E.PENSION_DED = 1100000;
  E.LAND_INT = 0.3;
  E.GAIN_SHORT = 0.3963;
  E.GAIN_LONG = 0.20315;
  E.LONG_YEARS = 5;
  E.HOJIN = {
    kinds: {
      kk: { cost: 250000, name: '株式会社', name_en: 'Kabushiki kaisha (KK)' },
      gk: { cost: 100000, name: '合同会社', name_en: 'Godo kaisha (LLC)' }
    },
    capital: 1000000, kinto: 70000, zeirishi: 300000,
    low: 8000000, hojinLow: 0.15, hojinHigh: 0.232, chiho: 0.103, jumin: 0.07,
    jigyo: [[4000000, 0.035], [8000000, 0.053], [Infinity, 0.07]], tokubetsu: 0.37,
    lossYears: 10,
    salaries: [0, 100000, 200000, 300000, 500000],
    social: 0.15, socialOld: 0.05,
    keep: 500000, unlock: 6950000
  };
})(window.QT || (window.QT = {}));
