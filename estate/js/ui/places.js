(function (QT) {
  'use strict';
  var L = QT.L, E = QT.Data.ESTATE;
  function t(k, v) { return L.t(k, v); }
  L.add({
    ag_title:    ['不動産会社 本社（青山）', 'Property agency HQ (Aoyama)'],
    ag_sub:      ['物件の紹介と相談。月に2件の未公開物件も', 'Listings and advice, plus two off-market deals a month'],
    ag_tabPick:  ['おすすめ', 'Picks'],
    ag_tabAll:   ['売物件', 'All listings'],
    ag_tabTips:  ['相談', 'Advice'],
    ag_private:  ['未公開', 'Off-market'],
    ag_deal:     ['掘り出し物', 'Bargain'],
    ag_budget:   ['手元 {c}・借りられる目安 {l}', 'Cash {c} · borrowing room ~{l}'],
    ag_none:     ['いま紹介できる物件がありません。月が替わると増えます', 'Nothing to show right now. New listings come each month'],
    ag_row:      ['{p}・表面{g}・{o}', '{p} · gross {g} · {o}'],
    ag_rebuildNo:['・再建築不可', ' · cannot rebuild'],
    ag_go:       ['見る', 'View'],
    ag_tip1:     ['最初は小さく。区分マンションや築古の戸建てなら、手元の現金と公庫の小口で始められます', 'Start small. A condo unit or an old house can be bought with cash plus a small JFC loan'],
    ag_tip2:     ['表面利回りだけで選ばないで。駅から遠い・古い・空室の多い街は、実質の手取りが薄くなります', 'Do not pick on gross yield alone. Far, old or high-vacancy areas leave thin net cash flow'],
    ag_tip3:     ['必ず内見を。物件の前の丸に立つと、隠れた傷みと周りの空室の様子が分かります', 'Always inspect. Stand on the circle in front to see hidden damage and local vacancies'],
    ag_tip4:     ['会社員のうちは銀行が貸してくれます。年金になると借りにくいので、借りるなら早めに', 'Banks lend while you are employed; retirees struggle, so borrow early if you plan to'],
    ag_tip5:     ['返済比率（返済 ÷ 家賃）は5割まで。金利が上がっても赤字にならない形に', 'Keep payments under half of rent, so a rate rise does not push you into the red'],
    ag_tip6:     ['空き地は建てる・駐車場・ランドリーにできます。郊外の安い土地に新築すると長いローンが出ます', 'Vacant lots can host a new build, a car park or a laundry. New builds on cheap suburban land get long loans'],
    ag_tip7:     ['法人の多い街（西新宿・品川・渋谷）では、会社が社宅として借り上げてくれることがあります', 'In company-heavy areas (Nishi-Shinjuku, Shinagawa, Shibuya) firms may lease whole units as staff housing'],
    ag_tip8:     ['持って5年を超えてから売ると、譲渡益の税がほぼ半分になります', 'Selling after 5+ years roughly halves the tax on your gain'],
    ag_tip9:     ['いまは金利が上がりはじめた時代（政策金利 1.25%・投資ローン 2〜5%）。表面利回りと借りる金利の差（イールドギャップ）が 3〜4% ないと、手取りはほとんど残りません。都心は値上がり、郊外は手取り、と役割を分けて考えよう', 'Rates are rising (policy rate 1.25%, investment loans 2–5%). Without a 3–4% gap between gross yield and your loan rate, little cash is left. Think of central Tokyo for growth and the suburbs for cash flow'],
    bk_sub:      ['{s}', '{s}'],
    bk_room:     ['借りられる目安（あと）', 'Borrowing room (left)'],
    bk_income:   ['年収として見る額', 'Income they count'],
    bk_rateV:    ['変動の金利', 'Variable rate'],
    bk_rateF:    ['固定の金利', 'Fixed rate'],
    bk_base:     ['基準金利（いま）', 'Base rate (now)'],
    bk_terms:    ['頭金 {d}%・最長{n}年・年収の{m}倍まで', '{d}% down · up to {n} yrs · up to {m}× income'],
    bk_mine:     ['この銀行のローン', 'Your loans here'],
    bk_noLoan:   ['まだ借りていません', 'No loans yet'],
    bk_loanRow:  ['{p}: 残り{b}・月{m}・{r}%（{k}）', '{p}: {b} left · {m}/mo · {r}% ({k})'],
    bk_var:      ['変動', 'var'], bk_fix: ['固定', 'fixed'],
    bk_prepay:   ['繰り上げ返済 {v}', 'Prepay {v}'],
    bk_stVar:    ['+1%で 月{a}・+2%で 月{b}（見直しは{n}か月後）', '+1%: {a}/mo · +2%: {b}/mo (reset in {n} mo)'],
    bk_stVarEnd: ['+1%で 月{a}・+2%で 月{b}（終わりまで見直しなし）', '+1%: {a}/mo · +2%: {b}/mo (no reset before the end)'],
    bk_stFix:    ['固定なので、金利が上がっても月{a}のまま', 'Fixed: stays {a}/mo even if rates rise'],
    bk_stG:      ['変動は、金利が上がると5年ごとの見直しで返済が増える（前の1.25倍まで）。繰り上げ返済で残りを減らしておくと軽く済む', 'Variable payments rise at the 5-yearly reset when rates go up (up to ×1.25). Prepaying shrinks the hit'],
    bk_how:      ['借りるときは、物件のシートの「払い方」でこの銀行を選びます', 'To borrow, pick this bank under "How to pay" in a property sheet'],
    bk_why:      ['審査で見ること: 年収（年金は半分）・物件の場所と種類・担保評価・期間（耐用年数と年齢）・家賃で返せるか', 'They check: income (pensions count half), location & type, collateral, term (useful life & age), and whether rent covers payments'],
    tx_title:    ['税務署（確定申告）', 'Tax office (tax return)'],
    tx_sub:      ['毎年12月の締めで自動で申告。3月に精算', 'Filed automatically at year end; settled in March'],
    tx_none:     ['まだ申告していません（1年目の12月の締めで）', 'No return yet (filed at the end of year 1)'],
    tx_year:     ['{y}年目の申告', 'Return for year {y}'],
    tx_rentRev:  ['不動産の収入', 'Property income'],
    tx_rentExp:  ['経費（減価償却 {d} を含む）', 'Expenses (incl. depreciation {d})'],
    tx_rentInc:  ['不動産所得（青色の控除 {b} の後）', 'Property profit (after blue-form deduction {b})'],
    tx_salary:   ['給与所得', 'Employment income'],
    tx_pension:  ['年金の所得', 'Pension income'],
    tx_offset:   ['損益通算で消えた所得', 'Offset by property losses'],
    tx_basic:    ['基礎控除（住民税は {r}）', 'Basic allowance (resident tax {r})'],
    tx_social:   ['社会保険料控除', 'Social insurance deduction'],
    tx_taxable:  ['課税所得', 'Taxable income'],
    tx_income:   ['所得税（復興税込み）', 'Income tax'],
    tx_resident: ['住民税', 'Resident tax'],
    tx_gain:     ['譲渡所得の税', 'Capital gains tax'],
    tx_total:    ['税の合計', 'Total tax'],
    tx_withheld: ['給料から引かれていた分（源泉）', 'Withheld from salary'],
    tx_refund:   ['還付（戻ってくる）', 'Refund'],
    tx_due:      ['追加で納める', 'To pay'],
    tx_g1:       ['減価償却は「お金は出ていかないのに経費になる」。不動産所得が赤字なら給料の税が戻る（損益通算）', 'Depreciation is a cost with no cash out. A property loss reduces tax on your salary (loss offset)'],
    tx_g2:       ['ただし土地を買うための利息のぶんの赤字は通算できない', 'But losses from interest on the land portion cannot be offset'],
    tx_coPay:    ['うち役員報酬（自分の会社から）', "incl. director's pay (your company)"],
    ag_tip10:    ['所得が増えたら、資産管理会社をつくって物件を会社で持つと、税が安くなることがある。どこから得かは税務署で比べられる', 'Once your income grows, owning property through a holding company can cut your tax. Compare where it pays off at the tax office'],
    ag_goTax:    ['個人と会社の税を比べる', 'Compare personal vs company tax'],
    bk_coLoan:   ['（会社）', ' (company)'],
    jk_title:    ['実家（流山・柏）', "Parents' home (Kashiwa)"],
    jk_sub:      ['父と母に今の暮らしを話す', 'Talk to your parents about how things are going'],
    jk_life:     ['{k}・{a}歳', '{k} · age {a}'],
    jk_in:       ['毎月の入り（給料の手取り・年金）', 'Monthly income (take-home pay, pension)'],
    jk_living:   ['生活費', 'Living costs'],
    jk_cf:       ['家賃の手取り', 'Net rent'],
    jk_free:     ['経済的自由まで', 'To financial freedom'],
    jk_free2:    ['達成!（{a}歳で）', 'Achieved! (at {a})'],
    jk_say1:     ['父「家賃で生活費がまかなえたら、仕事は好きなだけ続ければいい」', 'Dad: "Once rent covers your living, you can work as long as you like."'],
    jk_say2:     ['母「借りすぎだけは気をつけてね。金利は上がることもあるのよ」', 'Mum: "Just do not over-borrow. Rates can go up, you know."'],
    jk_say3:     ['父「古い家は安いが、屋根と水回りはお金がかかるぞ」', 'Dad: "Old houses are cheap, but roofs and plumbing cost money."'],
    jk_say4:     ['母「柏の駅前も、おおたかの森も、子育ての家族が増えたわね」', 'Mum: "So many young families in Kashiwa and Otakanomori now."']
  });
  function G() { return QT.G; }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + QT.G.fmt(Math.abs(Math.round(v))); }
  function pct(v) { return (v * 100).toFixed(1) + '%'; }
  function roomLeft() {
    var g = G(), inc = g.loanIncome() + g.rentNow() * 12 * 0.7, best = 0;
    Object.keys(E.LENDERS).forEach(function (l) {
      var ld = E.LENDERS[l];
      if (g.loanIncome() < ld.minIncome) return;
      best = Math.max(best, inc * ld.mult - (g.loanDebt ? g.loanDebt() : g.bal(210)));
    });
    return Math.max(0, best);
  }
  function listings(S) {
    return Object.keys(S.props).map(function (k) { return S.props[k]; })
      .filter(function (p) { return p.sale && !p.sale.mine && !p.own && !p.sale.mad; });
  }
  function refreshPrivate(S) {
    var m = S.mkt, Es = G().estate;
    if (m.privMonth === S.fin.month) return;
    m.privMonth = S.fin.month;
    var cand = Es.sites().filter(function (st) {
      var p = S.props[st.id];
      if (st.condo) return G().roomOpen(st.room);
      return !(p && (p.own || p.sale)) && G().roomOpen(st.room);
    });
    for (var i = 0; i < 2 && cand.length; i++) {
      var k = Math.floor(Es.rnd() * cand.length), st = cand.splice(k, 1)[0];
      var p = Es.listProp(st, true);
      if (!p || !p.sale) continue;
      p.sale.price = Math.round(Es.value(p) * 0.95 / 100000) * 100000;
      p.sale.priv = true;
    }
  }
  function drawList(S, H, k, list, y) {
    var Es = G().estate, C = k.C;
    if (!list.length) { k.text(t('ag_none'), k.x, y + 10, 11, C.soft); return y + 30; }
    list.forEach(function (p) {
      var yl = Es.yields(p), u = Es.useOf(p);
      var deal = !!p.sale.deal;
      k.card(y, 52, deal ? '#ffe9f2' : p.sale.priv ? '#eef5ff' : null);
      var nm = Es.name(p), tagW = 0;
      if (deal) { tagW = 60; H.fillRR(k.x, y + 7, 56, 16, 8, '#e2508a'); H.txt(t('ag_deal'), k.x + 28, y + 15, 9, '#ffffff', 'center', 900); }
      else if (p.sale.priv) { tagW = 50; H.fillRR(k.x, y + 7, 44, 16, 8, '#1f5fbf'); H.txt(t('ag_private'), k.x + 22, y + 15, 9, '#ffffff', 'center', 900); }
      k.text(nm, k.x + (tagW || 2), y + 15, 12, C.ink, 900);
      var occ = p.units && p.units.length ? p.units.filter(function (x) { return x.occ; }).length + '/' + p.units.length : L.nm(E.KINDS[p.kind], 'short');
      k.text(t('ag_row', { p: yen(p.sale.price), g: yl.gross > 0 ? pct(yl.gross) : '—', o: occ }) + (p.rebuildNo ? t('ag_rebuildNo') : ''), k.x + 2, y + 35, 10.5, p.rebuildNo ? C.bad : C.soft, 700);
      k.btn({ x: k.x + k.w - 64, y: y + 10, w: 62, h: 32 }, t('ag_go'), '#1f5fbf', function () { QT.UI.show('propsheet', p.id); });
      y += 58;
    });
    return y;
  }
  QT.Sheet.make('agency', {
    height: 0.8,
    tabs: [{ id: 'pick', label: '', label_en: '' }, { id: 'all' }, { id: 'tips' }].map(function (tb) {
      var key = { pick: 'ag_tabPick', all: 'ag_tabAll', tips: 'ag_tabTips' }[tb.id];
      return { id: tb.id, get label() { return t(key); }, get label_en() { return t(key); } };
    }),
    onOpen: function () { refreshPrivate(G().S); },
    title: function () { return t('ag_title'); },
    sub: function () { return t('ag_sub'); },
    body: function (S, H, k, arg, tab) {
      var y = k.y, C = k.C, Es = G().estate;
      if (tab === 'tips') {
        for (var i = 1; i <= 10; i++) { k.card(y, 0); y = k.wrap((i) + '. ' + t('ag_tip' + i), k.x, y + 10, k.w, 11, C.ink, 700) + 8; }
        if (G().hojin) { k.btn({ x: k.x + k.w - 200, y: y + 2, w: 200, h: 36 }, t('ag_goTax'), '#2bb8d8', function () { QT.UI.show('taxsheet', { tab: 'co' }); }); y += 46; }
        return k.used(y + 40);
      }
      k.text(t('ag_budget', { c: yen(S.coins), l: yen(roomLeft()) }), k.x, y + 8, 11, C.soft, 800);
      y += 22;
      var list = listings(S);
      if (tab === 'pick') {
        var reach = S.coins + roomLeft();
        list = list.filter(function (p) { return p.sale.price * 1.07 <= reach * 1.05 && G().roomOpen(p.dist); });
        list.sort(function (a, b) { return (b.sale.deal ? 2 : b.sale.priv ? 1 : 0) - (a.sale.deal ? 2 : a.sale.priv ? 1 : 0) || Es.yields(b).net - Es.yields(a).net; });
        list = list.slice(0, 6);
      } else {
        list.sort(function (a, b) { return a.dist < b.dist ? -1 : a.dist > b.dist ? 1 : a.sale.price - b.sale.price; });
      }
      y = drawList(S, H, k, list, y);
      return k.used(y);
    }
  });
  QT.Sheet.make('banksheet', {
    height: 0.74,
    title: function (S, l) { return L.nm(E.LENDERS[l] || {}); },
    sub: function (S, l) { return L.nm(E.LENDERS[l] || {}, 'sub'); },
    body: function (S, H, k, l) {
      var g = G(), ld = E.LENDERS[l], C = k.C, y = k.y + 6;
      if (!ld) return 0;
      var inc = g.loanIncome() + g.rentNow() * 12 * 0.7;
      var room = g.loanIncome() >= ld.minIncome ? Math.max(0, inc * ld.mult - (g.loanDebt ? g.loanDebt() : g.bal(210))) : 0;
      if (ld.cap) room = Math.min(room, ld.cap);
      y = k.line(t('bk_room'), yen(room), y + 6, room > 0 ? C.ok : C.bad, 14);
      y = k.line(t('bk_income'), yen(inc), y);
      if (!ld.fixedOnly) y = k.line(t('bk_rateV'), (g.varRate(l) * 100).toFixed(2) + '%', y);
      y = k.line(t('bk_rateF'), (g.fixRate(l) * 100).toFixed(2) + '%', y);
      y = k.line(t('bk_base'), (S.rate.base * 100).toFixed(2) + '%', y, C.soft);
      k.text(t('bk_terms', { d: Math.round((1 - ld.ltv) * 100), n: ld.maxTerm, m: ld.mult }), k.x, y + 4, 10.5, C.soft, 800);
      y += 20;
      if (ld.note) y = k.wrap(L.nm(ld, 'note'), k.x, y + 2, k.w, 10, g.loanIncome() < ld.minIncome ? C.bad : C.soft, 800) + 4;
      y = k.wrap(t('bk_how'), k.x, y + 4, k.w, 10, C.blue) + 4;
      y = k.wrap(t('bk_why'), k.x, y, k.w, 9.5, C.soft) + 6;
      y = k.hr(y);
      H.txt(t('bk_mine'), k.x, y + 8, 12, C.ink, 'left', 900); y += 22;
      var mine = S.loans.filter(function (ln) { return ln.lender === l; });
      if (!mine.length) { k.text(t('bk_noLoan'), k.x, y + 6, 11, C.soft); y += 22; }
      mine.forEach(function (ln) {
        var p = S.props[ln.prop];
        k.card(y, 82);
        k.text(t('bk_loanRow', { p: (p ? g.estate.name(p) : '—') + (ln.owner === 'co' ? t('bk_coLoan') : ''), b: yen(ln.bal), m: yen(ln.pay), r: (ln.rate * 100).toFixed(2), k: t(ln.kind === 'fix' ? 'bk_fix' : 'bk_var') }),
               k.x + 2, y + 16, 10.5, C.ink, 800);
        var v = Math.min(ln.bal, 1000000);
        k.btn({ x: k.x + k.w - 160, y: y + 28, w: 158, h: 30 }, t('bk_prepay', { v: yen(v) }), '#2fbf7a', function () { g.prepay(ln.id, v); }, (g.cashFor ? g.cashFor(ln.owner || null) : S.coins) >= v);
        var u1 = g.loanIfUp(ln, 0.01), u2 = g.loanIfUp(ln, 0.02);
        if (ln.kind === 'fix') k.text(t('bk_stFix', { a: yen(ln.pay) }), k.x + 2, y + 72, 10, C.ok, 800);
        else k.text(t(u2.until ? 'bk_stVar' : 'bk_stVarEnd', { a: yen(u1.pay), b: yen(u2.pay), n: u2.until }), k.x + 2, y + 72, 10,
                    u2.pay > ln.pay * 1.15 ? C.bad : C.gold, 800);
        y += 88;
      });
      if (mine.some(function (ln) { return ln.kind === 'var'; })) y = k.wrap(t('bk_stG'), k.x, y + 2, k.w, 9.5, C.soft) + 6;
      return k.used(y);
    }
  });
  function tabsOf(list) { return list.map(function (e) { return { id: e[0], get label() { return t(e[1]); }, get label_en() { return t(e[1]); } }; }); }
  QT.Sheet.make('taxsheet', {
    height: 0.78,
    tabs: tabsOf([['ret', 'hj_tabRet'], ['co', 'hj_tab']]),
    onOpen: function (arg, st) { if (arg && arg.tab) st.tab = arg.tab; },
    title: function () { return t('tx_title'); },
    sub: function () { return t('tx_sub'); },
    body: function (S, H, k, arg, tab) {
      var r = S.taxes && S.taxes.last, C = k.C, y = k.y + 6;
      if (tab === 'co' && QT.Hojin) return k.used(QT.Hojin.drawTab(S, H, k));
      if (!r) { k.text(t('tx_none'), k.x, y + 10, 11, C.soft); y += 30; y = k.wrap(t('tx_g1'), k.x, y, k.w, 10, C.soft); return k.used(y); }
      H.txt(t('tx_year', { y: r.year }), k.x, y + 8, 13, C.ink, 'left', 900); y += 26;
      y = k.line(t('tx_rentRev'), yen(r.rentRev), y);
      y = k.line(t('tx_rentExp', { d: yen(r.dep) }), '-' + yen(r.rentExp), y, C.bad);
      y = k.line(t('tx_rentInc', { b: yen(r.blue) }), yen(r.rentInc), y, r.rentInc < 0 ? C.bad : C.ok);
      if (r.salary) y = k.line(t('tx_salary'), yen(r.salaryInc), y);
      if (r.coPay) y = k.line(t('tx_coPay'), yen(r.coPay), y, C.soft, 10);
      if (r.pension) y = k.line(t('tx_pension'), yen(r.pensionInc), y);
      if (r.offset) y = k.line(t('tx_offset'), '-' + yen(r.offset), y, C.ok);
      if (r.basic != null) y = k.line(t('tx_basic', { r: yen(r.basicRes) }), '-' + yen(r.basic), y, C.soft, 10);
      if (r.social > 0) y = k.line(t('tx_social'), '-' + yen(r.social), y, C.soft, 10);
      y = k.line(t('tx_taxable'), yen(r.taxable), y);
      y = k.hr(y);
      y = k.line(t('tx_income'), yen(r.incomeTax), y);
      y = k.line(t('tx_resident'), yen(r.resident), y);
      if (r.gainTax) y = k.line(t('tx_gain'), yen(r.gainTax), y);
      y = k.line(t('tx_total'), yen(r.total), y, C.ink, 13);
      if (r.withheld) y = k.line(t('tx_withheld'), '-' + yen(r.withheld), y, C.soft);
      if (r.refund > 0) y = k.line(t('tx_refund'), '+' + yen(r.refund), y, C.ok, 14);
      else y = k.line(t('tx_due'), yen(r.due), y, r.due > 0 ? C.bad : C.ink, 14);
      y = k.wrap(t('tx_g1'), k.x, y + 6, k.w, 10, C.soft) + 2;
      y = k.wrap(t('tx_g2'), k.x, y, k.w, 10, C.soft) + 4;
      var hj = G().hojin;
      if (QT.Hojin && hj && (hj.on() || hj.unlocked() || (r.rentRev || 0) - (r.rentExp || 0) >= 3000000)) y = QT.Hojin.drawCompare(S, H, k, y + 6, false);
      return k.used(y + 40);
    }
  });
  L.add({
    bd_tower:    ['タワーマンション（高級）', 'Luxury tower'],
    bd_luxLow:   ['低層の高級レジデンス', 'Low-rise luxury residence'],
    bd_sub:    ['{a}・築{y}年・{f}階建て・駅{w}分', '{a} · {y} yrs old · {f} floors · {w} min walk'],
    bd_sale:   ['売り出し中の部屋', 'Rooms for sale'],
    bd_mine:   ['自分の部屋', 'Your rooms'],
    bd_others: ['ほかの部屋（売りに出ていない）', 'Other rooms (not for sale)'],
    bd_none:   ['いま売りに出ている部屋はありません（月が替わると出ることがあります）', 'No rooms for sale right now (more may come next month)'],
    bd_row:    ['{f}階・{l}・{m}㎡', 'Floor {f} · {l} · {m} m²'],
    bd_rowS:   ['{p}・表面{g}%', '{p} · gross {g}%'],
    bd_rowM:   ['手取り {c}・{o}', 'net {c} · {o}'],
    bd_occ:    ['入居中', 'Let'],
    bd_vac:    ['空室', 'Vacant'],
    bd_see:    ['見る', 'View']
  });
  QT.Sheet.make('bldgsheet', {
    height: 0.8,
    title: function (S, sid) { var st = QT.World.BY_ID[sid], b = st && G().estate.bldgOf(st); return b ? (L.get() === 'en' ? b.name_en : b.name) : ''; },
    sub: function (S, sid) {
      var st = QT.World.BY_ID[sid], Es = G().estate; if (!st) return '';
      var b = Es.bldgOf(st), a = (E.AREAS[st.room] || [])[st.areaIx || 0] || {};
      return (b.lux ? t(b.floors >= 20 ? 'bd_tower' : 'bd_luxLow') + '・' : '') +
             t('bd_sub', { a: L.nm(a), y: Math.max(0, Math.floor((S.fin.month - 1) / 12 - b.built)), f: b.floors, w: st.walk || 5 });
    },
    body: function (S, H, k, sid) {
      var st = QT.World.BY_ID[sid], g = G(), Es = g.estate, C = k.C, y = k.y + 4;
      if (!st) return 0;
      var b = Es.bldgOf(st), rows = b.rooms.map(function (r) { return { r: r, p: S.props[st.id + '#' + r.no] || null }; });
      function row(e, kind) {
        var r = e.r, p = e.p, lay = Es.LAYS[r.lay] || {};
        var lb = Es.layName ? Es.layName(r.lay) : r.lay;
        k.card(y, 50, kind === 'mine' ? '#eaf7ef' : kind === 'sale' ? (p.sale.priv ? '#eef5ff' : '#fffbea') : '#f6f5f9');
        H.txt(r.no + (L.get() === 'en' ? '' : '号室'), k.x + 4, y + 16, 13, kind === 'other' ? C.soft : C.ink, 'left', 900);
        k.text(t('bd_row', { f: r.floor, l: lb, m: Math.round(lay.area || 25) }), k.x + 74, y + 16, 10.5, C.soft, 700);
        if (kind === 'sale') {
          var yl = Es.yields(p);
          k.text(t('bd_rowS', { p: '¥' + g.fmt(p.sale.price), g: (yl.gross * 100).toFixed(1) }) + '・' + t(p.units[0].occ ? 'bd_occ' : 'bd_vac'), k.x + 4, y + 36, 11, C.ink, 800);
        } else if (kind === 'mine') {
          var cf = Es.cf(p);
          k.text(t('bd_rowM', { c: (cf < 0 ? '-¥' : '+¥') + g.fmt(Math.abs(Math.round(cf))), o: t(p.units[0].occ ? 'bd_occ' : 'bd_vac') }), k.x + 4, y + 36, 11, cf >= 0 ? C.ok : C.bad, 800);
        }
        if (kind !== 'other') k.btn({ x: k.x + k.w - 62, y: y + 9, w: 60, h: 32 }, t('bd_see'), '#1f5fbf', function () { QT.UI.show('propsheet', p.id); });
        y += 56;
      }
      var sale = rows.filter(function (e) { return e.p && e.p.sale && !e.p.own; });
      var mine = rows.filter(function (e) { return e.p && e.p.own; });
      var other = rows.filter(function (e) { return !(e.p && (e.p.own || e.p.sale)); });
      H.txt(t('bd_sale'), k.x, y + 8, 12, C.ink, 'left', 900); y += 22;
      if (!sale.length) { k.text(t('bd_none'), k.x, y + 6, 10.5, C.soft); y += 24; }
      sale.forEach(function (e) { row(e, 'sale'); });
      if (mine.length) { H.txt(t('bd_mine'), k.x, y + 10, 12, C.ink, 'left', 900); y += 24; mine.forEach(function (e) { row(e, 'mine'); }); }
      if (other.length) {
        H.txt(t('bd_others'), k.x, y + 10, 12, C.soft, 'left', 900); y += 24;
        other.forEach(function (e) { row(e, 'other'); });
      }
      return k.used(y);
    }
  });
  var askP = QT.Sheet.make('askcard', {
    height: 0.5,
    title: function (S) { return S.trb && S.trb.ask ? S.trb.ask.q : ''; },
    sub: function () { return t('tr_choose'); },
    body: function (S, H, k) {
      var a = S.trb && S.trb.ask, y = k.y + 10;
      if (!a) { askP.close(); return 0; }
      a.opts.forEach(function (o, i) {
        k.btn({ x: k.x, y: y, w: k.w, h: 46 }, o.label, i === 0 ? '#1f5fbf' : '#f2a63b', function () { G().troubles.answer(i); askP.close(); },
              !o.cost || S.coins >= o.cost);
        y += 56;
      });
      return k.used(y);
    }
  });
  QT.UI.panel('askcardWatch', { layer: 'hud', draw: function (S) {
    if (S.trb && S.trb.ask && !askP.isOpen() && !(QT.UI.open && QT.UI.open())) askP.open();
  } });
  L.add({
    jk_subInh:    ['両親から受け継いだ家。これからのことを決めよう', 'The home your parents left you. Decide what comes next'],
    jk_subRent:   ['両親から受け継いだ家。いまは貸している', 'The home your parents left you, now let to a tenant'],
    jk_subSold:   ['両親が長く暮らした家は、次の持ち主へ', 'The home your parents lived in has passed to its next owners'],
    jh_what:      ['土地 {l}㎡・木造 {s}㎡（4LDK）・{b}年築（築{a}年）・駅からバス', 'Land {l}m² · wooden {s}m² (4LDK) · built {b} ({a} yrs) · bus to the station'],
    jh_value:     ['いまの相場（古家付きの土地）', 'Market value (land with an old house)'],
    jh_cond:      ['傷み', 'Condition'],
    jh_lNotIncome:['受け継いだ家は所得ではないので、所得税はかからない。帳簿では元入金が増える', 'An inheritance is not income, so no income tax. In the books, owner\'s capital goes up'],
    jh_choose:    ['どうする？', 'What will you do?'],
    jh_rentT:     ['貸す（戸建て賃貸）', 'Let it (house rental)'],
    jh_rentCost:  ['遺品整理とリフォーム', 'Clear-out and renovation'],
    jh_rentRent:  ['家賃の見込み（月）', 'Expected rent /mo'],
    jh_rentCF:    ['手取りの見込み（月）', 'Expected net /mo'],
    jh_lRent:     ['貸すと毎月家賃が入る。そのかわり、売るときの「空き家の3,000万円控除」は使えなくなる', 'Letting brings rent every month, but you lose the ¥30M empty-house relief if you sell later'],
    jh_rentBtn:   ['リフォームして貸す {v}', 'Renovate and let {v}'],
    jh_owe:       ['きょうだいへの代償金', "Your sibling's share"],
    jh_oweSale:   ['きょうだいへの代償金（代金から）', "Your sibling's share (from the sale)"],
    jh_splitT:    ['遺産の分け方', 'Splitting the estate'],
    jh_sHouse:    ['実家の相場（受け継いだとき）', 'Home at market (when inherited)'],
    jh_sSav:      ['親の預金（葬式の費用を引いたあと）', "Parents' savings (after the funeral)"],
    jh_sHalf:     ['1人分（2人で半分ずつ）', 'Each share (half each)'],
    jh_sOweLeft:  ['（まだ払っていない）', ' (still owed)'],
    jh_sOwePaid:  ['（払った）', ' (paid)'],
    jh_lSplit:    ['家を受け継ぐ人が、ほかの相続人にお金を払って釣り合わせることを「代償分割」という。売るなら代金から払う。持ち続けるなら、いつ払うかは話し合いで', 'When the heir who takes the house pays the others to even things out, it is called a compensation split. A sale pays it; if you keep the house, you agree when to pay'],
    jh_payOwe:    ['代償金を払う {v}', 'Pay your sibling {v}'],
    jh_sellT:     ['売る（古家付きの土地）', 'Sell it (land with an old house)'],
    jh_sellPrice: ['売値の見込み（相場）', 'Expected price (market)'],
    jh_sellAcq:   ['取得費（分からないので売値の5%）', 'Acquisition cost (unknown, so 5% of price)'],
    jh_sellFee:   ['仲介手数料', 'Agent fee'],
    jh_sellDed:   ['空き家の3,000万円控除', '¥30M empty-house relief'],
    jh_sellDedNo: ['空き家の3,000万円控除（使えない）', '¥30M empty-house relief (not available)'],
    jh_sellGain:  ['譲渡所得', 'Taxable gain'],
    jh_sellTax:   ['譲渡所得の税（長期 20.315%）', 'Capital gains tax (long-term 20.315%)'],
    jh_sellNoDed: ['控除が無ければ税は {v}', 'Without the relief the tax would be {v}'],
    jh_sellClear: ['遺品整理（売る前に）', 'Clear-out (before selling)'],
    jh_sellNet:   ['手元に残る', 'You keep'],
    jh_cBuilt:    ['1981年5月31日以前の建物（{b}年築）', 'Built on or before 31 May 1981 ({b})'],
    jh_cAlone:    ['亡くなる前、親が一人で住んでいた家', 'Your parent lived there alone until the end'],
    jh_cTime:     ['相続から3年目の年末までに売る（あと{n}か月）', 'Sold by the end of the 3rd year after inheriting ({n} months left)'],
    jh_cTimeOver: ['相続から3年目の年末までに売る（過ぎた）', 'Sold by the end of the 3rd year after inheriting (missed)'],
    jh_cPrice:    ['売値1億円以下', 'Price ¥100M or less'],
    jh_cUnused:   ['受け継いでから貸していない', 'Not let out since you inherited it'],
    jh_cDemolish: ['取り壊しは買い主がしてもよい（2024年から）', 'The buyer may do the demolition (since 2024)'],
    jh_lAcq:      ['親が買った値段が分からないときは、売値の5%を取得費とみなす。古い家ほど譲渡所得が大きくなりやすい', 'If the original price is unknown, 5% of the sale price counts as the cost, so old homes show big gains'],
    jh_lSpecial:  ['条件がそろえば、譲渡所得から3,000万円を引ける。ふつうの実家なら税は0になる', 'If every condition is met, ¥30M comes off the gain; for an ordinary home the tax drops to zero'],
    jh_sellFast:  ['すぐ売る {v}', 'Sell now {v}'],
    jh_sellMkt:   ['相場で売りに出す {v}', 'List at market {v}'],
    jh_onSale:    ['売りに出している {v}（1〜3か月で決まる）', 'On the market at {v} (sells in 1–3 months)'],
    jh_unlist:    ['取り下げる', 'Withdraw'],
    jh_keepT:     ['空き家のまま', 'Leave it empty'],
    jh_keepTax:   ['固定資産税・都市計画税（年）', 'Property & city-planning tax /yr'],
    jh_keepTaxOff:['固定資産税・都市計画税（年・特例なし）', 'Property & city-planning tax /yr (no relief)'],
    jh_keepIns:   ['火災保険（年）', 'Fire insurance /yr'],
    jh_keepCare:  ['手入れ', 'Upkeep'],
    jh_keepCareN: ['最後の手入れから{n}か月', '{n} months since you last tidied'],
    jh_keepCare0: ['手入れしてある', 'Tidy'],
    jh_svcSelf:   ['自分で手入れ（実家で長押し）', 'Do it yourself (hold at the home)'],
    jh_svc:       ['管理サービス 月{v}', 'Caretaker {v}/mo'],
    jh_lKeep:     ['空き家でも固定資産税はかかる。いまは住宅用地の特例で、土地の税が1/6になっている', 'Empty homes still pay property tax; residential land relief cuts the land part to 1/6'],
    jh_lKeepOff:  ['勧告で住宅用地の特例が外れた。土地の税は3〜4倍になる（片付けて勧告が外れれば、特例も戻る）', 'The notice removed the residential land relief: land tax is 3–4× (tidy up to lift the notice and get it back)'],
    jh_lKankoku:  ['手入れしないと市から「管理不全空家」の勧告を受け、特例が外れて土地の税が3〜4倍になる', 'Neglect it and the city issues a notice; the relief goes and land tax jumps 3–4×'],
    jh_kankoku:   ['勧告を受けた: 特例が外れている。実家で片付けると外れる（{v}）', 'Notice issued: no relief. Tidy up at the home to lift it ({v})'],
    jh_taxT:      ['相続税の計算', 'Inheritance tax'],
    jh_tLand:     ['実家の土地（路線価で評価）', 'Land (at the road price)'],
    jh_tBldg:     ['実家の建物（固定資産税評価額）', 'House (assessed value)'],
    jh_tSav:      ['親の預金（きょうだいが受け継いだ）', "Parents' savings (to your sibling)"],
    jh_tFun:      ['葬式の費用', 'Funeral costs'],
    jh_tTotal:    ['遺産の合計', 'Total estate'],
    jh_tBasic:    ['基礎控除（3,000万＋600万×{n}人）', 'Basic allowance (¥30M + ¥6M × {n})'],
    jh_tTaxable:  ['課税される遺産', 'Taxable estate'],
    jh_tTotalTax: ['相続税の総額（{n}人分）', 'Total inheritance tax ({n} heirs)'],
    jh_tMine:     ['相続税（あなたの分）', 'Your inheritance tax'],
    jh_tZero:     ['遺産の合計が基礎控除より少ないので、相続税はかからない（申告も要らない）', 'The estate is below the allowance, so no inheritance tax (and no return to file)'],
    jh_tSome:     ['10か月以内に申告して納める。実家を受け継いだ割合（{p}%）のぶんがあなたの税', 'File and pay within 10 months; your share follows what you received ({p}%)'],
    jh_lRosen:    ['土地は「路線価」で評価する。道ごとに国税庁が決める値段で、相場の8割ほど', 'Land is valued at the "road price" set by the tax agency, about 80% of market'],
    jh_lShokibo:  ['「小規模宅地等の特例」（土地の評価を8割下げる）は、同居の家族や持ち家の無い子だけ。自分の家があるので使えない', 'The small-plot relief (−80% on land) is for a spouse, a live-in family member or a child with no home of their own. You own a home, so it does not apply'],
    jh_lReg:      ['相続登記（名義の書き換え）は3年以内にする決まり（2024年から義務）。登録免許税と司法書士で {v} 払った', 'Registering the inheritance is required within 3 years (since 2024). You paid {v} in fees'],
    jh_rentNow:   ['貸している（戸建て賃貸）', 'Let (house rental)'],
    jh_rentNowRent:['家賃（いま）', 'Rent now'],
    jh_rentVac:   ['空室（募集中）', 'Vacant (advertising)'],
    jh_rentNowCF: ['手取り（月）', 'Net /mo'],
    jh_detail:    ['くわしく（物件のシート）', 'Details (property sheet)'],
    jh_lRented:   ['貸したので、空き家の3,000万円控除は使えない。売るときの取得費は、売値の5%かリフォーム代の残りの大きいほう', 'Because it was let, the ¥30M relief is gone. When sold, the cost is 5% of price or what is left of the renovation, whichever is larger'],
    jh_soldT:     ['実家は売った', 'You sold the family home'],
    jh_soldPrice: ['売値', 'Price'],
    jh_soldTax:   ['譲渡所得の税', 'Capital gains tax'],
    jh_memT:      ['思い出', 'Memories'],
    jh_mem1:      ['父がよく言っていた「家賃で生活費がまかなえたら、仕事は好きなだけ続ければいい」', 'Dad used to say: "Once rent covers your living, work as long as you like."'],
    jh_mem2:      ['母の口ぐせ「借りすぎだけは気をつけてね。金利は上がることもあるのよ」', 'Mum always said: "Just do not over-borrow. Rates can go up."'],
    jh_mem3:      ['父「古い家は安いが、屋根と水回りはお金がかかるぞ」。この家の屋根も何度も直していた', 'Dad: "Old houses are cheap, but roofs and plumbing cost money." He fixed this roof more than once'],
    jh_mem4:      ['母「柏の駅前も、おおたかの森も、子育ての家族が増えたわね」', 'Mum: "So many young families in Kashiwa and Otakanomori now."']
  });
  function res(r) {
    var g = G(), S = g.S;
    if (r && r.ok) { if (QT.Sfx) QT.Sfx.play('buy'); return; }
    if (r && r.why) g.toast({ x: S.player.x, y: S.player.y - 30 }, r.why, '#e2504a', { big: true });
    if (QT.Sfx) QT.Sfx.play('bad');
  }
  function sec(H, k, s, y, col) {
    H.fillRR(k.x, y + 2, 4, 15, 2, col);
    H.txt(s, k.x + 10, y + 10, 12.5, k.C.ink, 'left', 900);
    return y + 24;
  }
  function lesson(k, s, y) { return k.wrap(s, k.x, y, k.w, 9.5, k.C.soft) + 4; }
  function drawAkiya(S, H, k, p, y) {
    var g = G(), ih = g.inherit, Es = g.estate, C = k.C, J = E.JIKKA;
    y = k.wrap(t('jh_what', { l: J.landA, s: J.size, b: J.built, a: Es.ageOf(p) }), k.x, y + 4, k.w, 10.5, C.ink, 800) + 4;
    y = k.line(t('jh_value'), yen(Es.value(p)), y + 4, C.ink, 12);
    y = k.line(t('jh_cond'), Es.cond(p), y);
    y = lesson(k, t('jh_lNotIncome'), y) + 2;
    y = k.hr(y);
    H.txt(t('jh_choose'), k.x, y + 9, 14, C.ink, 'left', 900); y += 28;
    var rp = ih.rentPreview(p);
    y = sec(H, k, t('jh_rentT'), y, '#2fbf7a');
    y = k.line(t('jh_rentCost'), '-' + yen(rp.cost), y, C.bad);
    y = k.line(t('jh_rentRent'), yen(rp.rent), y);
    y = k.line(t('jh_rentCF'), (rp.cf >= 0 ? '+' : '') + yen(rp.cf), y, rp.cf >= 0 ? C.ok : C.bad);
    y = lesson(k, t('jh_lRent'), y);
    k.btn({ x: k.x + k.w - 210, y: y, w: 210, h: 36 }, t('jh_rentBtn', { v: yen(rp.cost) }), '#2fbf7a', function () { res(ih.rent()); },
          S.coins >= rp.cost && !p.sale);
    y += 48;
    y = sec(H, k, t('jh_sellT'), y, '#f2a63b');
    if (p.sale && p.sale.mine) {
      k.text(t('jh_onSale', { v: yen(p.sale.price) }), k.x, y + 6, 11.5, C.gold, 900); y += 22;
      k.btn({ x: k.x + k.w - 120, y: y, w: 120, h: 34 }, t('jh_unlist'), '#9a94ad', function () { Es.unlist('home'); });
      y += 44;
    } else {
      var sp = ih.salePreview(p, 'market'), sf = ih.salePreview(p, 'fast'), cl = ih.clearCost(p);
      y = k.line(t('jh_sellPrice'), yen(sp.price), y);
      y = k.line(t('jh_sellAcq'), '-' + yen(sp.acq), y, C.soft);
      y = k.line(t('jh_sellFee'), '-' + yen(sp.fee), y, C.soft);
      y = k.line(t(sp.special.ok ? 'jh_sellDed' : 'jh_sellDedNo'), sp.special.ok ? '-' + yen(sp.ded) : '—', y, sp.special.ok ? C.ok : C.soft);
      y = k.line(t('jh_sellGain'), yen(Math.max(0, sp.taxable)), y);
      y = k.line(t('jh_sellTax'), yen(sp.tax), y, sp.tax > 0 ? C.bad : C.ok, 12);
      if (sp.special.ok && sp.taxNo > 0) { k.text(t('jh_sellNoDed', { v: yen(sp.taxNo) }), k.x, y + 2, 10, C.soft, 800); y += 18; }
      if (cl > 0) y = k.line(t('jh_sellClear'), '-' + yen(cl), y, C.soft);
      if (sp.owe > 0) y = k.line(t('jh_oweSale'), '-' + yen(sp.owe), y, C.soft);
      y = k.line(t('jh_sellNet'), yen(sp.net), y, C.ink, 12);
      y += 2;
      sp.special.rows.forEach(function (r) {
        var s0 = r.k === 'built' ? t('jh_cBuilt', { b: J.built }) : r.k === 'alone' ? t('jh_cAlone') :
                 r.k === 'time' ? (r.ok ? t('jh_cTime', { n: r.left }) : t('jh_cTimeOver')) : r.k === 'price' ? t('jh_cPrice') :
                 r.k === 'unused' ? t('jh_cUnused') : t('jh_cDemolish');
        k.text((r.ok ? '○ ' : '× ') + s0, k.x + 4, y + 6, 10, r.ok ? C.ok : C.bad, 800);
        y += 16;
      });
      y = lesson(k, t('jh_lAcq'), y + 4);
      y = lesson(k, t('jh_lSpecial'), y);
      var bw = (k.w - 8) / 2;
      k.btn({ x: k.x, y: y, w: bw, h: 36 }, t('jh_sellFast', { v: yen(sf.price) }), '#e2504a', function () { res(ih.sell('fast')); }, S.coins >= cl);
      k.btn({ x: k.x + bw + 8, y: y, w: bw, h: 36 }, t('jh_sellMkt', { v: yen(sp.price) }), '#f2a63b', function () { res(ih.sell('market')); }, S.coins >= cl);
      y += 48;
    }
    y = sec(H, k, t('jh_keepT'), y, '#8a7fb8');
    var tax = ih.propTax(p), ins = Math.round(Es.value(p) * E.INSURE / 100) * 100;
    y = k.line(t(p.inh.kankoku ? 'jh_keepTaxOff' : 'jh_keepTax'), '-' + yen(tax), y, p.inh.kankoku ? C.bad : C.ink);
    y = k.line(t('jh_keepIns'), '-' + yen(ins), y, C.soft);
    y = k.line(t('jh_keepCare'), p.inh.svc ? t('jh_svc', { v: yen(J.svc) }) : p.inh.neglect > 0 ? t('jh_keepCareN', { n: p.inh.neglect }) : t('jh_keepCare0'), y,
               p.inh.stage >= 2 ? C.bad : p.inh.stage >= 1 ? C.gold : C.ink);
    if (p.inh.kankoku) y = k.wrap(t('jh_kankoku', { v: yen(J.tidy) }), k.x, y, k.w, 10.5, C.bad, 800) + 4;
    y = k.chips([{ id: 'self', label: t('jh_svcSelf') }, { id: 'svc', label: t('jh_svc', { v: yen(J.svc) }) }], p.inh.svc ? 'svc' : 'self', y + 2,
                function (id) { ih.setSvc(id === 'svc'); });
    y = lesson(k, t(p.inh.kankoku ? 'jh_lKeepOff' : 'jh_lKeep'), y);
    if (!p.inh.kankoku) y = lesson(k, t('jh_lKankoku'), y);
    return y;
  }
  function drawRented(S, H, k, p, y) {
    var g = G(), Es = g.estate, C = k.C, un = p.units[0];
    y = sec(H, k, t('jh_rentNow'), y + 4, '#2fbf7a');
    y = k.line(t('jh_rentNowRent'), un && un.occ ? yen(un.rent) : t('jh_rentVac'), y, un && un.occ ? C.ink : C.gold);
    var cf = Es.cf(p);
    y = k.line(t('jh_rentNowCF'), (cf >= 0 ? '+' : '') + yen(cf), y, cf >= 0 ? C.ok : C.bad, 12);
    k.btn({ x: k.x + k.w - 210, y: y + 2, w: 210, h: 36 }, t('jh_detail'), '#1f5fbf', function () { QT.UI.show('propsheet', 'home'); });
    y += 48;
    return lesson(k, t('jh_lRented'), y);
  }
  function drawSold(S, H, k, so, y) {
    var C = k.C;
    y = sec(H, k, t('jh_soldT'), y + 4, '#f5b21c');
    y = k.line(t('jh_soldPrice'), yen(so.price), y);
    y = k.line(t('jh_sellAcq'), '-' + yen(so.acq), y, C.soft);
    y = k.line(t('jh_sellFee'), '-' + yen(so.fee), y, C.soft);
    if (so.ded > 0) y = k.line(t('jh_sellDed'), '-' + yen(so.ded), y, C.ok);
    y = k.line(t('jh_sellGain'), yen(Math.max(0, so.taxable)), y);
    y = k.line(t('jh_soldTax'), yen(so.tax), y, so.tax > 0 ? C.bad : C.ok, 12);
    if (so.ded > 0 && so.taxNo > 0) { k.text(t('jh_sellNoDed', { v: yen(so.taxNo) }), k.x, y + 2, 10, C.soft, 800); y += 18; }
    return y;
  }
  function drawSplit(S, H, k, h, y) {
    var c = h.calc, C = k.C;
    if (!c || c.house == null) return y;
    H.txt(t('jh_splitT'), k.x, y + 9, 13, C.ink, 'left', 900); y += 26;
    y = k.line(t('jh_sHouse'), yen(c.house), y);
    y = k.line(t('jh_sSav'), yen(c.savings - c.funeral), y);
    y = k.line(t('jh_sHalf'), yen((c.house + c.savings - c.funeral) / E.JIKKA.heirs), y);
    var g = G(), left = g.bal(240);
    y = k.line(t('jh_owe') + t(left > 0 ? 'jh_sOweLeft' : 'jh_sOwePaid'), yen(c.owe), y, left > 0 ? C.gold : C.ok, 12);
    y = lesson(k, t('jh_lSplit'), y + 2);
    if (left > 0 && S.props.home && S.props.home.own) {
      k.btn({ x: k.x + k.w - 190, y: y + 2, w: 190, h: 34 }, t('jh_payOwe', { v: yen(left) }), '#8a7fb8', function () { res(g.inherit.payOwe()); }, S.coins >= left);
      y += 44;
    }
    return y;
  }
  function drawInhTax(S, H, k, h, y) {
    var c = h.calc, C = k.C, n = E.JIKKA.heirs;
    if (!c) return y;
    H.txt(t('jh_taxT'), k.x, y + 9, 13, C.ink, 'left', 900); y += 26;
    y = k.line(t('jh_tLand'), yen(c.land), y);
    y = k.line(t('jh_tBldg'), yen(c.bldg), y);
    y = k.line(t('jh_tSav'), yen(c.savings), y);
    y = k.line(t('jh_tFun'), '-' + yen(c.funeral), y, C.soft);
    y = k.line(t('jh_tTotal'), yen(c.total), y, C.ink);
    y = k.line(t('jh_tBasic', { n: n }), '-' + yen(c.basic), y, C.ok);
    y = k.line(t('jh_tTaxable'), yen(c.taxable), y);
    if (c.taxTotal > 0) y = k.line(t('jh_tTotalTax', { n: n }), yen(c.taxTotal), y);
    y = k.line(t('jh_tMine'), yen(c.mine), y, c.mine > 0 ? C.bad : C.ok, 12);
    y = lesson(k, t(c.mine > 0 ? 'jh_tSome' : 'jh_tZero', { p: Math.round(c.share * 100) }), y + 2);
    y = lesson(k, t('jh_lRosen'), y);
    y = lesson(k, t('jh_lShokibo'), y);
    y = lesson(k, t('jh_lReg', { v: yen(h.regFee || 0) }), y);
    return y;
  }
  QT.Sheet.make('jikka', {
    get height() { var S = G().S; return S.inh && S.inh.done ? 0.84 : 0.66; },
    onOpen: function () { var S = G().S; if (S.inh && S.inh.done) S.inh.seen = true; },
    title: function () { return t('jk_title'); },
    sub: function (S) {
      var h = S.inh, p = S.props && S.props.home;
      if (!h || !h.done) return t('jk_sub');
      if (p && p.own && p.inh) return t(p.inh.mode === 'rent' ? 'jk_subRent' : 'jk_subInh');
      return t('jk_subSold');
    },
    body: function (S, H, k) {
      var g = G(), lf = S.life, C = k.C, y = k.y + 6, st = E.STARTS[lf.kind] || {};
      k.text(t('jk_life', { k: L.nm(st), a: lf.age }), k.x, y + 8, 13, C.ink, 900); y += 28;
      var inc = lf.biz && !lf.retired ? Math.round((G().bizMonthly ? G().bizMonthly() : 0) * (1 - E.SOCIAL) * 0.92) :
                lf.retired ? lf.pension : Math.round(lf.gross * (1 - E.SOCIAL) * 0.92);
      y = k.line(t('jk_in'), yen(inc), y);
      y = k.line(t('jk_living'), '-' + yen(lf.living), y, C.bad);
      var cf = g.rentCF();
      y = k.line(t('jk_cf'), yen(cf), y, cf >= 0 ? C.ok : C.bad);
      y = k.line(t('jk_free'), lf.free ? t('jk_free2', { a: lf.freeAge }) : Math.round(Math.max(0, cf) / g.freeNeed() * 100) + '%', y, '#c98f0f', 13);
      y = k.hr(y + 4);
      var n = (Math.floor(S.fin.month / 3) % 4) + 1, h = S.inh;
      if (h && h.done) {
        var p = S.props.home;
        if (p && p.own && p.inh) y = p.inh.mode === 'akiya' ? drawAkiya(S, H, k, p, y) : drawRented(S, H, k, p, y);
        else if (h.sold) y = drawSold(S, H, k, h.sold, y);
        y = k.hr(y + 4);
        y = drawSplit(S, H, k, h, y);
        y = k.hr(y + 4);
        y = drawInhTax(S, H, k, h, y);
        y = k.hr(y + 4);
        H.txt(t('jh_memT'), k.x, y + 9, 12, C.soft, 'left', 900); y += 22;
        y = k.wrap(t('jh_mem' + n), k.x, y + 4, k.w, 11, C.ink, 800) + 4;
        return k.used(y + 56);
      }
      y = k.wrap(t('jk_say' + n), k.x, y + 8, k.w, 11.5, C.ink, 800) + 4;
      y = k.wrap(t('jk_say' + ((n % 4) + 1)), k.x, y + 4, k.w, 11.5, C.ink, 800) + 4;
      return k.used(y);
    }
  });
})(window.QT || (window.QT = {}));
