(function (QT) {
  'use strict';
  var L = QT.L, E = QT.Data.ESTATE;
  function t(k, v) { return L.t(k, v); }
  function G() { return QT.G; }
  function HJ() { return QT.G.hojin; }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + QT.G.fmt(Math.abs(Math.round(v))); }
  function man(v) { return QT.G.fmt(Math.round(v / 10000) * 10000); }
  L.add({
    hj_tab:       ['会社（法人化）', 'Company'],
    hj_tabRet:    ['確定申告', 'Tax return'],
    hj_title:     ['資産管理会社（法人化）', 'Holding company (incorporate)'],
    hj_what:      ['会社をつくって物件を会社で持つと、その利益には会社の税（法人税など。所得800万円までは約22〜25%）がかかる。個人の税（所得税＋住民税）は所得が増えるほど上がり、最高55%',
                   'If a company you set up owns the property, its profit pays company tax (about 22–25% up to ¥8M). Personal income + resident tax rises with income, up to 55%'],
    hj_cmpT:      ['個人と会社、どちらが安い?', 'Personal or company: which is cheaper?'],
    hj_cmpNow:    ['去年の不動産所得（個人） {v}', "Last year's property profit (personal) {v}"],
    hj_cmpMe:     ['個人で持つと、税が年 {v} 増える', 'Owned personally: tax rises {v}/yr'],
    hj_cmpCo:     ['会社で持ち、お金を会社に残すなら、税と固定費で年 {v}', 'Company, keeping the money in it: {v}/yr in tax and fixed costs'],
    hj_cmpOut:    ['会社で持ち、全部を役員報酬で受け取るなら、社会保険と税で年 {v}', 'Company, paying it all out as your salary: {v}/yr in social insurance and tax'],
    hj_cmpCoWin:  ['→ 会社に残せるなら、会社のほうが年 {v} 安い', '→ If the money can stay in the company, it saves {v} a year'],
    hj_cmpOutLose:['（暮らしに使うぶんを給料で受け取ると、そのぶん社会保険と税がまたかかる）', '(Money you take out to live on pays social insurance and tax again)'],
    hj_cmpMeWin:  ['→ 個人のほうが年 {v} 安い（まだ会社にしなくてよい）', '→ Personal is {v} a year cheaper (no need yet)'],
    hj_cmpNoRet:  ['去年の不動産所得が無い（黒字の年に比べられる）。下の表は いまの給料・年金で計算', 'No property profit last year yet. The table uses your current salary/pension'],
    hj_colInc:    ['不動産所得（年）', 'Property profit /yr'],
    hj_colMe:     ['個人の税', 'Personal tax'],
    hj_colCo:     ['会社に残す', 'Co., kept'],
    hj_colCo2:    ['（税＋固定費）', '(tax + fixed)'],
    hj_colOut:    ['給料で受取', 'Co., paid out'],
    hj_colOut2:   ['（＋社会保険）', '(+ social ins.)'],
    hj_be:        ['いまの給料・年金のままなら、お金を会社に残しておけるとき、不動産所得が 約{v}円 を超えると会社のほうが安い。暮らしに使うなら、もっと上',
                   'With your current salary/pension, a company wins above about ¥{v} of property profit if the money stays in it. If you live on it, the line is higher'],
    hj_beShort:   ['会社に残しておけるなら、不動産所得 約{v}円 から会社のほうが安い', 'If the money stays in it, a company wins from about ¥{v}'],
    hj_beNone:    ['いまの所得では、5,000万円まで会社のほうが安くならない', 'At your income, a company does not win below ¥50M'],
    hj_beOut:     ['全部を役員報酬で受け取るなら、約{v}円 から会社のほうが安い', 'Paying it all out as salary, a company wins from about ¥{v}'],
    hj_beOutNone: ['全部を役員報酬で受け取るなら、5,000万円まで個人のほうが安い（社会保険が会社と本人の両方にかかるため）', 'Paying it all out as salary, owning personally stays cheaper up to ¥50M (social insurance is charged on both sides)'],
    hj_lMix:      ['会社にするかは「暮らしに使わず会社に残せる利益」がどれだけあるかで決まる。暮らしのぶんは役員報酬、残りは会社で次の物件へ',
                   'Whether to incorporate depends on how much profit can stay in the company. Take what you live on as salary; let the rest buy the next property'],
    hj_fixed:     ['会社の固定費: 均等割 年{k}（赤字でもかかる）＋ 税理士 年{z}ほど', 'Fixed costs: flat levy {k}/yr (even at a loss) + accountant about {z}/yr'],
    hj_lOut:      ['会社に残ったお金は会社のもの。自分で使うには役員報酬や配当にして、また税がかかる', "Money left in the company is the company's. To use it yourself, pay it out as salary or dividends, which are taxed again"],
    hj_kindT:     ['会社の種類', 'Company type'],
    hj_kindCost:  ['{n}（設立 約{v}）', '{n} (setup ~{v})'],
    hj_gkL:       ['合同会社: 設立が安く、決算の公告も要らない。資産管理会社によく使われる', 'Godo kaisha (LLC): cheap to set up, no public notice of accounts. Common for holding companies'],
    hj_kkL:       ['株式会社: よく知られた形で信用が高い。設立の費用は高め', 'Kabushiki kaisha: the familiar, trusted form. Costs more to set up'],
    hj_capital:   ['資本金（あなたの手元から会社の預金へ）', 'Capital (from your cash to the company account)'],
    hj_keepMine:  ['いまある物件は個人のまま（会社に移すと売ることになり、譲渡の税・登記の費用・不動産取得税がかかる）', 'Your current properties stay in your name (moving them is a sale, with gains tax, registration and acquisition tax)'],
    hj_bizNote:   ['仲介の事業（事業所得）は個人のまま。会社が持つのは、これから会社で買う物件だけ', 'Your brokerage stays a sole business. The company only holds properties it buys from now on'],
    hj_foundBtn:  ['会社をつくる（設立 {v}）', 'Set up the company (setup {v})'],
    hj_after:     ['つくったら、物件のシートの［名義］で「会社」を選んで買う', 'Once set up, choose "Company" under Owner in a property sheet when buying'],
    hj_coT:       ['{k}（資産管理会社）', '{k} (holding company)'],
    hj_coSince:   ['{y}年目 {m}月につくった', 'Set up in year {y}, month {m}'],
    hj_coCash:    ['会社の預金', 'Company cash'],
    hj_coProps:   ['会社の物件 {n}件（時価）', 'Company properties: {n} (market value)'],
    hj_coDebt:    ['会社の借入（銀行）', 'Company bank loans'],
    hj_coOwe:     ['あなたが会社に貸しているお金（役員借入金）', 'You have lent the company (director loan)'],
    hj_coNet:     ['会社の純資産（相場で）', 'Company net worth (at market)'],
    hj_coPL:      ['今年の利益（税の前・ここまで）', 'Profit so far this year (before tax)'],
    hj_lOwe:      ['会社の預金が足りないときは、あなたが会社に貸す。預金が{v}を超えたら月末に返してもらう（給料ではないので税はかからない）', 'When the company is short, you lend to it. Above {v} in its account, it repays you at month end (not pay, so no tax)'],
    hj_salT:      ['役員報酬（月）', "Director's pay /mo"],
    hj_salNone:   ['なし', 'None'],
    hj_salNow:    ['いま 月{a}', 'Now {a}/mo'],
    hj_salNext:   ['いま 月{a} → 次の1月から 月{b}', 'Now {a}/mo → from January {b}/mo'],
    hj_lSal:      ['役員報酬は会社の経費になり、あなたには給料として入る（給与所得控除が使える）。社会保険料は会社とあなたがそれぞれ払う（合わせて約3割）', 'Director pay is a company expense and reaches you as salary (with the employment deduction). Social insurance is paid by both sides (about 30% in all)'],
    hj_lSal2:     ['額を変えられるのは年に一度（1月から。つくって3か月のうちは、すぐ）。途中で変えると会社の経費にならない（定期同額給与）', 'You can change it once a year (from January; at once in the first 3 months). Mid-year changes are not deductible (fixed monthly pay rule)'],
    hj_retT:      ['{y}年目の決算（会社）', 'Year {y} company accounts'],
    hj_rProfit:   ['利益（税の前）', 'Profit (before tax)'],
    hj_rDed:      ['去年の事業税（今年の経費）', "Last year's enterprise tax (deductible)"],
    hj_rLoss:     ['繰り越した赤字を使った', 'Losses carried forward used'],
    hj_rTaxable:  ['課税所得', 'Taxable income'],
    hj_rHojin:    ['法人税（800万までは15%）', 'Corporate tax (15% up to ¥8M)'],
    hj_rChiho:    ['地方法人税', 'Local corporate tax'],
    hj_rJumin:    ['法人住民税（法人税割）', 'Corporate inhabitant tax'],
    hj_rKinto:    ['均等割（{m}か月）', 'Flat levy ({m} mo)'],
    hj_rJigyo:    ['事業税・特別法人事業税', 'Enterprise taxes'],
    hj_rTotal:    ['合計', 'Total'],
    hj_rDue:      ['2月に納める', 'Due in February'],
    hj_rPaid:     ['納めた', 'Paid'],
    hj_rLeft:     ['繰り越している赤字（10年まで）', 'Losses carried forward (up to 10 yrs)'],
    hj_lLong:     ['会社の物件は、持った年数で売るときの税が変わらない（個人の「5年の壁」は無い）。売った益は会社のふつうの利益に入る', 'For a company, holding time does not change the tax on a sale (no 5-year rule). Gains join ordinary profit'],
    hj_lLoss:     ['赤字の年は均等割だけ。赤字は10年まで繰り越して、黒字の年の所得から引ける', 'In a loss year only the flat levy is due. Losses carry forward up to 10 years against later profit'],
    hj_noRetCo:   ['まだ決算が無い（12月の締めで）', 'No accounts yet (closed each December)'],
    hj_go:        ['会社のことを見る', 'See company options'],
    hj_books:     ['会社の帳簿を見る', "See the company's books"],
    hj_short:     ['所得が増えたら: 個人と会社の税を比べる', 'If your income grows: compare personal vs company tax'],
    ps_owner:     ['名義（だれが買うか）', 'Owner (who buys)'],
    ps_ownMe:     ['個人', 'You'],
    ps_ownCo:     ['会社（資産管理会社）', 'Your company'],
    ps_ownCoCash: ['会社の預金 {v}（足りないぶんはあなたが会社に貸す）', 'Company cash {v} (you lend any shortfall)'],
    ps_ownL:      ['会社で持つと、この物件の利益には会社の税（約22〜34%）がかかる。個人の物件とは帳簿も税も別', "Owned by the company, this property's profit pays company tax (~22–34%). Its books and tax are separate from yours"],
    ps_ownNow:    ['名義', 'Owner'],
    ps_haveCo:    ['手元（あなた＋会社）', 'Cash (you + company)'],
    fi_tabCo:     ['会社', 'Company'],
    fi_coThis:    ['{y}年目（今年・会社）', 'Year {y} (this year, company)'],
    fi_coLast:    ['{y}年目（去年・会社）', 'Year {y} (last year, company)'],
    fi_coRev:     ['売上（家賃など）', 'Revenue (rent etc.)'],
    fi_coExp:     ['経費（役員報酬・税理士を含む）', 'Expenses (incl. director pay & accountant)'],
    fi_coGain:    ['物件を売った益', 'Gains on sales'],
    fi_coTax:     ['法人税など', 'Corporate taxes'],
    fi_coNetI:    ['税引き後の利益', 'Profit after tax'],
    fi_coEq:      ['資本金と利益の積み上げ', 'Capital & retained earnings'],
    fi_coNone:    ['会社がまだ無い（税務署のシートの［会社］でつくれる）', 'No company yet (set one up in the tax office sheet)']
  });
  var memo = { key: null, v: null };
  function cmp(S) {
    var r = S.taxes && S.taxes.last, key = [S.fin.month, r ? r.year : 0, S.hojin ? S.hojin.salary : -1, S.life.age].join('|');
    if (memo.key !== key) { memo.key = key; memo.v = HJ().compare(); }
    return memo.v;
  }
  function rFit(H, s, x, y, size, maxW, col, w, min) {
    var g = H.ctx, fs = size;
    g.font = w + ' ' + fs + 'px ' + H.FONT;
    while (fs > min && g.measureText(s).width > maxW) { fs -= 0.5; g.font = w + ' ' + fs + 'px ' + H.FONT; }
    H.txt(s, x, y, fs, col, 'right', w);
  }
  function drawCompare(S, H, k, y, full) {
    var C = k.C, c = cmp(S), hj = HJ();
    if (!full) {
      k.card(y, c.now ? 74 : 52, '#eef5ff');
      k.text(t('hj_cmpT'), k.x + 4, y + 16, 12, C.navy, 900);
      if (c.now) {
        k.text(t('hj_cmpNow', { v: yen(c.now.x) }), k.x + 4, y + 36, 10.5, C.ink, 800);
        k.text(c.now.d > 0 ? t('hj_cmpCoWin', { v: yen(c.now.d) }) : t('hj_cmpMeWin', { v: yen(-c.now.d) }), k.x + 4, y + 56, 10.5, c.now.d > 0 ? C.ok : C.soft, 800);
      } else k.text(c.be ? t('hj_beShort', { v: man(c.be) }) : t('hj_beNone'), k.x + 4, y + 36, 10, C.soft, 700);
      y += c.now ? 80 : 58;
      k.btn({ x: k.x + k.w - 170, y: y, w: 170, h: 34 }, t('hj_go'), '#1f5fbf', function () { QT.UI.show('taxsheet', { tab: 'co' }); });
      return y + 44;
    }
    H.txt(t('hj_cmpT'), k.x, y + 8, 12.5, C.ink, 'left', 900); y += 24;
    if (c.now) {
      var outLose = c.now.d > 0 && c.now.dOut <= 0;
      k.card(y, outLose ? 114 : 96, c.now.d > 0 ? '#eaf7ef' : '#f7f5fc');
      k.text(t('hj_cmpNow', { v: yen(c.now.x) }), k.x + 4, y + 16, 11, C.ink, 900);
      k.text(t('hj_cmpMe', { v: yen(c.now.me) }), k.x + 4, y + 35, 10.5, C.ink, 700);
      k.text(t('hj_cmpCo', { v: yen(c.now.co) }), k.x + 4, y + 52, 10.5, C.ink, 700);
      k.text(t('hj_cmpOut', { v: yen(c.now.out) }), k.x + 4, y + 69, 10.5, C.ink, 700);
      k.text(c.now.d > 0 ? t('hj_cmpCoWin', { v: yen(c.now.d) }) : t('hj_cmpMeWin', { v: yen(-c.now.d) }), k.x + 4, y + 87, 11, c.now.d > 0 ? C.ok : C.soft, 900);
      if (outLose) k.text(t('hj_cmpOutLose'), k.x + 4, y + 104, 9.5, C.soft, 700);
      y += (outLose ? 114 : 96) + 8;
    } else { y = k.wrap(t('hj_cmpNoRet'), k.x, y + 4, k.w, 10, C.soft) + 4; }
    var c0 = k.w * 0.25, cw = (k.w - c0) / 3;
    function cx(i) { return k.x + c0 + cw * (i + 1); }
    H.fitTxt(t('hj_colInc'), k.x, y + 8, 9.5, c0 - 4, C.soft, 800, 6.5);
    [['hj_colMe', null], ['hj_colCo', 'hj_colCo2'], ['hj_colOut', 'hj_colOut2']].forEach(function (h, i) {
      rFit(H, t(h[0]), cx(i), y + 8, 9.5, cw - 4, C.soft, 800, 6.5);
      if (h[1]) rFit(H, t(h[1]), cx(i), y + 21, 8.5, cw - 4, C.soft, 700, 6);
    });
    y += 32;
    c.rows.forEach(function (r) {
      var lo = Math.min(r.me, r.co, r.out);
      H.txt(yen(r.x), k.x, y + 6, 11, C.ink, 'left', 800);
      [r.me, r.co, r.out].forEach(function (v, i) { H.txt(yen(v), cx(i), y + 6, 11, v === lo ? C.ok : C.ink, 'right', 900); });
      y += 19;
    });
    y = k.wrap(c.be ? t('hj_be', { v: man(c.be) }) : t('hj_beNone'), k.x, y + 6, k.w, 10.5, C.navy, 800) + 2;
    y = k.wrap(c.beOut ? t('hj_beOut', { v: man(c.beOut) }) : t('hj_beOutNone'), k.x, y + 2, k.w, 10, C.ink, 800) + 2;
    y = k.wrap(t('hj_fixed', { k: yen(hj.H.kinto), z: yen(hj.H.zeirishi) }), k.x, y + 2, k.w, 9.5, C.soft) + 2;
    y = k.wrap(t('hj_lOut'), k.x, y, k.w, 9.5, C.soft) + 2;
    y = k.wrap(t('hj_lMix'), k.x, y, k.w, 10, C.ink, 800) + 6;
    return y;
  }
  var pickKind = 'gk';
  function drawTab(S, H, k) {
    var C = k.C, y = k.y + 4, hj = HJ(), HH = hj.H;
    if (!hj.on()) {
      H.txt(t('hj_title'), k.x, y + 10, 14, C.ink, 'left', 900); y += 26;
      y = k.wrap(t('hj_what'), k.x, y, k.w, 10.5, C.soft) + 8;
      y = drawCompare(S, H, k, y, true);
      y = k.hr(y);
      H.txt(t('hj_kindT'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
      y = k.chips(['gk', 'kk'].map(function (id) { return { id: id, label: t('hj_kindCost', { n: L.nm(HH.kinds[id]), v: yen(HH.kinds[id].cost) }) }; }),
                  pickKind, y, function (id) { pickKind = id; });
      y = k.wrap(t(pickKind === 'gk' ? 'hj_gkL' : 'hj_kkL'), k.x, y, k.w, 10, C.soft) + 4;
      y = k.line(t('hj_capital'), yen(HH.capital), y + 4);
      y = k.wrap(t('hj_keepMine'), k.x, y + 2, k.w, 10, C.ink, 800) + 2;
      if (S.life.biz) y = k.wrap(t('hj_bizNote'), k.x, y + 2, k.w, 10, C.ink, 800) + 2;
      var ck = hj.canFound(pickKind);
      if (!ck.ok && ck.why) { y = k.wrap(ck.why, k.x, y + 4, k.w, 10.5, C.bad, 800) + 2; }
      y += 6;
      k.btn({ x: k.x + k.w - 220, y: y, w: 220, h: 44 }, t('hj_foundBtn', { v: yen(HH.kinds[pickKind].cost) }), '#2bb8d8', function () {
        var r = hj.found(pickKind);
        if (r && r.ok && QT.Sfx) QT.Sfx.play('buy');
      }, ck.ok);
      y += 52;
      y = k.wrap(t('hj_after'), k.x, y, k.w, 10, C.blue) + 6;
      return y + 50;
    }
    var co = S.hojin, own = hj.owned(), Es = G().estate, pv = 0, pl = G().books.coYearPL();
    own.forEach(function (p) { pv += p.building ? Es.landValue(p) + p.building.cost : Es.value(p); });
    H.txt(t('hj_coT', { k: L.nm(HH.kinds[co.kind] || HH.kinds.gk) }), k.x, y + 10, 14, C.ink, 'left', 900); y += 22;
    k.text(t('hj_coSince', { y: Math.floor((co.at - 1) / 12) + 1, m: ((co.at - 1) % 12) + 1 }), k.x, y + 6, 10, C.soft, 700); y += 18;
    k.card(y, 128, '#eef9fc');
    k.x += 4; k.w -= 8;
    var yy = k.line(t('hj_coCash'), yen(G().coBal(100)), y + 16, C.ink, 12);
    yy = k.line(t('hj_coProps', { n: own.length }), yen(pv), yy);
    yy = k.line(t('hj_coDebt'), yen(G().coBal(210)), yy);
    yy = k.line(t('hj_coOwe'), yen(G().coBal(250)), yy, G().coBal(250) > 0 ? C.gold : C.ink);
    yy = k.line(t('hj_coNet'), yen(hj.netOf()), yy, C.ink, 12);
    var prof = pl ? pl.rentRev - pl.rentExp + pl.gain : 0;
    k.line(t('hj_coPL'), yen(prof), yy, prof >= 0 ? C.ok : C.bad);
    k.x -= 4; k.w += 8;
    y += 136;
    y = k.wrap(t('hj_lOwe', { v: yen(HH.keep) }), k.x, y, k.w, 9.5, C.soft) + 6;
    k.btn({ x: k.x + k.w - 170, y: y, w: 170, h: 34 }, t('hj_books'), '#1f5fbf', function () { QT.UI.show('finance', { tab: 'co' }); });
    y += 44;
    y = k.hr(y);
    H.txt(t('hj_salT'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
    var sel = co.salaryNext != null ? co.salaryNext : co.salary;
    y = k.chips(HH.salaries.map(function (v) { return { id: v, label: v ? yen(v) : t('hj_salNone') }; }), sel, y, function (v) { hj.setSalary(v); });
    k.text(co.salaryNext != null ? t('hj_salNext', { a: yen(co.salary), b: yen(co.salaryNext) }) : t('hj_salNow', { a: yen(co.salary) }),
           k.x, y + 4, 11, co.salaryNext != null ? C.gold : C.ink, 800);
    y += 18;
    y = k.wrap(t('hj_lSal'), k.x, y + 2, k.w, 9.5, C.soft) + 2;
    y = k.wrap(t('hj_lSal2'), k.x, y, k.w, 9.5, C.soft) + 6;
    y = k.hr(y);
    var r = co.tax.last;
    if (!r) { k.text(t('hj_noRetCo'), k.x, y + 8, 11, C.soft); y += 26; }
    else {
      H.txt(t('hj_retT', { y: r.year }), k.x, y + 8, 12.5, C.ink, 'left', 900); y += 24;
      y = k.line(t('hj_rProfit'), yen(r.profit), y, r.profit >= 0 ? C.ok : C.bad);
      if (r.ded) y = k.line(t('hj_rDed'), '-' + yen(r.ded), y);
      if (r.used) y = k.line(t('hj_rLoss'), '-' + yen(r.used), y, C.ok);
      y = k.line(t('hj_rTaxable'), yen(r.taxable), y);
      y = k.line(t('hj_rHojin'), yen(r.hojin), y);
      y = k.line(t('hj_rChiho'), yen(r.chiho), y);
      y = k.line(t('hj_rJumin'), yen(r.jumin), y);
      y = k.line(t('hj_rKinto', { m: r.months }), yen(r.kinto), y);
      y = k.line(t('hj_rJigyo'), yen(r.jigyo + r.toku), y);
      y = k.line(t('hj_rTotal') + '（' + t(r.settled ? 'hj_rPaid' : 'hj_rDue') + '）', yen(r.total), y, C.ink, 13);
      if (r.lossLeft) y = k.line(t('hj_rLeft'), yen(r.lossLeft), y, C.soft);
      y = k.wrap(t(r.taxable > 0 ? 'hj_lLong' : 'hj_lLoss'), k.x, y + 4, k.w, 9.5, C.soft) + 6;
    }
    y = k.hr(y);
    y = drawCompare(S, H, k, y, true);
    return y + 50;
  }
  function ownerChips(S, H, k, p, y, plan) {
    var hj = HJ(), C = k.C;
    if (!hj || !hj.on()) { plan.owner = null; return y; }
    H.txt(t('ps_owner'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
    y = k.chips([{ id: 'me', label: t('ps_ownMe') }, { id: 'co', label: t('ps_ownCo'), col: '#2bb8d8' }], plan.owner === 'co' ? 'co' : 'me', y,
                function (id) { plan.owner = id === 'co' ? 'co' : null; QT.Hojin.lastOwner = id; });
    if (plan.owner === 'co') { k.text(t('ps_ownCoCash', { v: yen(hj.cash()) }), k.x, y + 2, 10.5, C.ink, 800); y += 16; }
    y = k.wrap(t('ps_ownL'), k.x, y + 2, k.w, 9.5, C.soft) + 6;
    return y;
  }
  function drawBooks(S, H, k) {
    var g = G(), B = g.books, C = k.C, y = k.y + 4;
    if (!S.hojin || !S.hojin.gl) { k.text(t('fi_coNone'), k.x, y + 10, 11, C.soft); return y + 30; }
    [[B.coYearPL(), t('fi_coThis', { y: S.hojin.yr.n })], [B.coPrevPL(), S.hojin.yr.prev ? t('fi_coLast', { y: S.hojin.yr.prev.n }) : null]].forEach(function (e) {
      var pl = e[0]; if (!pl || !e[1]) return;
      H.txt(e[1], k.x, y + 8, 12.5, C.ink, 'left', 900); y += 24;
      y = k.line(t('fi_coRev'), yen(pl.rentRev), y, C.ok);
      y = k.line(t('fi_coExp'), '-' + yen(pl.rentExp), y, C.bad);
      if (pl.gain) y = k.line(t('fi_coGain'), yen(pl.gain), y, pl.gain >= 0 ? C.ok : C.bad);
      if (pl.tax) y = k.line(t('fi_coTax'), '-' + yen(pl.tax), y, C.bad);
      var ni = pl.rentRev - pl.rentExp + pl.gain - pl.tax;
      y = k.line(t('fi_coNetI'), yen(ni), y, ni >= 0 ? C.ok : C.bad, 12.5);
      Object.keys(pl.by).map(Number).sort(function (a, b) { return a - b; }).forEach(function (c) {
        if (!pl.by[c]) return;
        H.txt(B.coName(c), k.x + 12, y, 10, C.soft, 'left', 700);
        H.txt(yen(pl.by[c]), k.x + k.w, y, 10, C.soft, 'right', 700);
        y += 15;
      });
      y = k.hr(y + 4);
    });
    var bs = B.coBs(), gl = S.hojin.gl;
    [['A', 'fi_assets'], ['L', 'fi_liab']].forEach(function (grp) {
      H.txt(t(grp[1]), k.x, y + 8, 12.5, C.ink, 'left', 900); y += 22;
      B.CO_CODES.forEach(function (c) {
        var ty = B.coType(c), v = gl[c];
        if (!v) return;
        if (grp[0] === 'A' ? ty !== 'A' && ty !== 'XA' : ty !== 'L') return;
        y = k.line(B.coName(c), (ty === 'XA' ? '-' : '') + yen(v), y);
      });
      y = k.line(t(grp[1]), yen(grp[0] === 'A' ? bs.assets : bs.liab), y, C.ink, 12.5);
      y = k.hr(y + 2);
    });
    y = k.line(t('fi_coEq'), yen(bs.equity), y, C.ink, 12.5);
    y = k.line(t('fi_diff'), yen(bs.diff), y, bs.diff === 0 ? C.ok : C.bad);
    return y + 50;
  }
  QT.Hojin = { drawTab: drawTab, drawCompare: drawCompare, ownerChips: ownerChips, drawBooks: drawBooks, lastOwner: null };
  QT.G.on('hojinFounded', function () { QT.Hojin.lastOwner = 'co'; });
})(window.QT || (window.QT = {}));
