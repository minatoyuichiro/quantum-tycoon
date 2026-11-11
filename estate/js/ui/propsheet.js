(function (QT) {
  'use strict';
  var L = QT.L, E = QT.Data.ESTATE;
  function t(k, v) { return L.t(k, v); }
  L.add({
    ps_price:     ['値段', 'Price'],
    ps_inhAkiya:  ['両親から受け継いだ実家（いまは空き家）。貸すか売るか、空き家のままにするかは実家のシートで決める', 'The home your parents left you (empty for now). Decide to let, sell or keep it in the family-home sheet'],
    ps_inhSub:    ['両親から受け継いだ実家・駅からバスの住宅地', 'Inherited from your parents · a bus ride from the station'],
    ps_inhGo:     ['実家のシートへ', 'Family-home sheet'],
    ps_value:     ['いまの相場', 'Market value'],
    ps_rent:      ['家賃（満室）', 'Rent (full)'],
    ps_rentNow:   ['家賃（いま）', 'Rent (now)'],
    ps_rev:       ['売上の見込み（月）', 'Expected sales /mo'],
    ps_gross:     ['表面利回り', 'Gross yield'],
    ps_net:       ['実質利回り', 'Net yield'],
    ps_occ:       ['入居', 'Occupied'],
    ps_occV:      ['{a}/{b}', '{a}/{b}'],
    ps_age:       ['築{n}年・{s}・駅{w}分', '{n} yrs old · {s} · {w} min walk'],
    ps_land:      ['土地 {a}㎡', 'Land {a}m²'],
    ps_cond:      ['傷み', 'Condition'],
    ps_w:         ['木造', 'Wood'], ps_rc: ['鉄筋コンクリート', 'Concrete'], ps_eq: ['機械', 'Machines'], ps_none: ['建物なし', 'No building'],
    ps_g_gross:   ['表面利回り＝満室の家賃（年）÷値段。経費を引く前の数字', 'Gross yield = yearly rent at full ÷ price, before costs'],
    ps_g_net:     ['実質利回り＝（家賃 − 空室 − 経費）÷（値段＋諸費用7%）', 'Net yield = (rent − vacancy − costs) ÷ (price + 7% fees)'],
    ps_g_cond:    ['内見しないと傷みは分からない。傷んだ物件は安く見えるが、直すお金がかかる', 'Hidden damage shows only on inspection. Worn places look cheap but cost more to fix'],
    ps_rebuildNo: ['再建築不可: 敷地が道路に2m以上接していないので、壊すと建て直せない。安くて利回りは高いが、銀行の多くは貸さず（信用組合・ノンバンクだけ）、売るときも買い手が限られる',
                   'Cannot be rebuilt: the lot lacks 2m of road frontage. Cheap with a high yield, but most banks will not lend (only credit co-ops and non-banks) and buyers are few'],
    ps_floorOcc:  ['値段は土地で決まっている。入居者がいる（オーナーチェンジ）と住む人には売れないので、土地の{k}割ほど（都心ほど住む人の値段との開きが大きい）。空けば住む人にも土地の9割ほどで売れる',
                   'Priced by the land. With a tenant in place it sells only to investors, at about {k}/10 of the land value (the gap to home-buyer prices is widest in the city). Once empty it can sell to a home buyer at about 90%'],
    ps_floorVac:  ['値段は土地で決まっている。空いているので住む人にも売れる（土地の{k}割ほど）。貸すと利回りは低い',
                   'Priced by the land: it is empty, so home buyers can buy it (about {k}/10 of the land value). As a rental the yield is low'],
    ps_floorShop: ['値段は土地で決まっている。店舗は事業用で、買うのは利回りを見る投資家が中心なので土地の{k}割ほど。空けても高くは売れない（借り手が決まるまでの家賃のぶん、むしろ不利）',
                   'Priced by the land. A shop is business property bought mostly by yield investors, at about {k}/10 of the land value. Emptying it does not raise the price (if anything the lost rent until a new tenant counts against it)'],
    ps_floorBulk: ['値段は土地で決まっている（古くなっても、壊して土地で売れる「土地値」の物件）', 'Priced by the land (even when old, it can be demolished and sold as land)'],
    ps_pay:       ['払い方', 'How to pay'],
    ps_cash:      ['現金', 'Cash'],
    ps_amount:    ['借りる額', 'Loan amount'],
    ps_kind:      ['金利', 'Rate type'],
    ps_var:       ['変動 {r}%', 'Variable {r}%'],
    ps_fix:       ['固定 {r}%', 'Fixed {r}%'],
    ps_term:      ['期間', 'Term'],
    ps_years:     ['{n}年', '{n} yrs'],
    ps_sim:       ['毎月のシミュレーション', 'Monthly simulation'],
    ps_simRent:   ['家賃（入居の見込み {p}%）', 'Rent (expect {p}% occupied)'],
    ps_simCost:   ['経費（管理・修繕・税・保険）', 'Costs (mgmt, repairs, tax, insurance)'],
    ps_simPay:    ['ローンの返済', 'Loan payment'],
    ps_simCF:     ['手取り', 'Net cash flow'],
    ps_dscr:      ['返済比率（返済 ÷ 家賃）', 'Payment ratio (payment ÷ rent)'],
    ps_need:      ['要る現金（頭金＋諸費用＋手数料）', 'Cash needed (down + fees)'],
    ps_have:      ['手元', 'Your cash'],
    ps_buy:       ['買う', 'Buy'],
    ps_warnDscr:  ['返済比率が高い。空室や利上げで赤字になりやすい', 'High payment ratio: vacancies or rate hikes could push it negative'],
    ps_warnCF:    ['毎月の手取りがマイナス（給料から足す形）', 'Monthly cash flow is negative (your salary tops it up)'],
    ps_warnInsp:  ['まだ内見していない（傷みが分からない）', 'Not inspected yet (condition unknown)'],
    ps_st:        ['金利が上がったら（{k}）', 'If rates rise ({k})'],
    ps_stNow:     ['いま', 'Now'],
    ps_stUp:      ['+{n}%', '+{n}%'],
    ps_stPay:     ['返済（月）', 'Payment /mo'],
    ps_stCF:      ['手取り（月）', 'Net /mo'],
    ps_stDscr:    ['返済比率', 'Payment ratio'],
    ps_stSame:    ['変わらない', 'no change'],
    ps_stVar:     ['変動は金利が上がっても、返済は5年ごとの見直しまで同じ。見直しで上がる（前の1.25倍まで）', 'Variable: the payment holds until the 5-yearly reset, then rises (up to ×1.25)'],
    ps_stFix:     ['固定は借りた日の金利が最後まで続く（全期間固定）。世の中の金利が上がっても返済は変わらない。そのぶん今は変動より高い', 'Fixed: your rate holds for the whole loan, so payments never rise. In exchange it starts higher than variable'],
    ps_stLesson:  ['変動金利は上がることがある。+2% でも手取りがプラスかを見ておこう', 'Variable rates can rise. Check your cash flow is still positive at +2%'],
    ps_stCash:    ['現金で買うと、金利が上がっても返済は無い（そのかわり手元の現金が減る）', 'Paying cash means no loan payment even if rates rise (but it uses up your cash)'],
    ps_g_term:    ['期間は「法定耐用年数 − 築年」（古い建物に長く貸す銀行もある）・銀行の最長・「80歳 − 年齢」のいちばん短いもの。古い木造は短くなって返済が重い', 'Term = the shortest of (legal useful life − age; some banks stretch it for old buildings), the bank\'s maximum, and (80 − your age). Old wood buildings get short, heavy loans'],
    ps_g_rate:    ['変動は基準金利で動く（5年ごとに返済額を見直し、上がりは1.25倍まで）。固定は借りた日のまま', 'Variable follows the base rate (payment reset every 5 yrs, max ×1.25). Fixed stays as it is'],
    ps_cfNow:     ['手取り（月）', 'Net cash flow /mo'],
    ps_loanBal:   ['ローンの残り', 'Loan balance'],
    ps_loanPay:   ['返済（月）', 'Payment /mo'],
    ps_mgmt:      ['管理', 'Management'],
    ps_mgCo:      ['管理会社（5%）', 'Agent (5%)'],
    ps_mgSelf:    ['自主管理', 'Self-managed'],
    ps_mgWashCo:  ['運営を委託（10%）', 'Outsource (10%)'],
    ps_mgWashSelf:['自主運営', 'Run it yourself'],
    ps_g_self:    ['自主管理は手数料が浮くが、家賃は自分で回収しに行き、困りごと（！）にも歩いて対応する。放っておくと退去が早まる', 'Self-managing saves fees, but you collect rent in person and walk over to handle problems (!). Ignored ones drive tenants away'],
    ps_rentSet:   ['家賃の設定（入れ替わりのとき）', 'Rent setting (at turnover)'],
    ps_low:       ['相場の9割', '90% of market'], ps_mid: ['相場', 'Market'], ps_high: ['相場の1.1倍', '110% of market'],
    ps_ops:       ['運用のしかた', 'How to run it'],
    ps_corp:      ['法人契約（社宅）', 'Corporate lease'],
    ps_corpOn:    ['法人契約中（あと{n}か月）', 'Corporate lease ({n} months left)'],
    ps_corpOffer: ['申し込み: 月{v}・{y}年', 'Offer: {v}/mo for {y} yrs'],
    ps_accept:    ['受ける', 'Accept'],
    ps_decline:   ['断る', 'Decline'],
    ps_g_corp:    ['法人契約は空かず手間も無いが、満期に一度に全部空くことがある', 'Corporate leases never sit empty, but can end all at once'],
    ps_sub:       ['サブリース（月{v}を保証）', 'Sublease ({v}/mo guaranteed)'],
    ps_subOn:     ['サブリース中（月{v}）', 'Subleased ({v}/mo)'],
    ps_subGo:     ['結ぶ', 'Sign'],
    ps_subQuit:   ['解約（違約金{v}）', 'Cancel (penalty {v})'],
    ps_g_sub:     ['サブリースは空室でも決まった額が入るが、2年ごとに下がり、やめるのにお金がかかる', 'A sublease pays even when empty, but drops every 2 years and costs money to exit'],
    ps_cpLease:   ['運営会社に一括で貸す（月{v}固定）', 'Lease to an operator ({v}/mo fixed)'],
    ps_cpSelf:    ['自分で運営する', 'Run it yourself'],
    ps_repair:    ['大規模修繕（{v}）', 'Major repairs ({v})'],
    ps_repairRoom:['室内のリフォーム（専有部分）{v}', 'Refit inside your unit {v}'],
    ps_g_repairRoom:['外壁・屋上・配管などの共用部は、管理組合が修繕積立金で直す（大規模修繕）。自分で直せるのは部屋の中だけ',
                   'Common parts (walls, roof, pipes) are fixed by the owners\' association from the repair fund. You can only refit inside your unit'],
    ps_washNew:   ['機械を入れ替える（{v}）', 'Replace machines ({v})'],
    ps_build:     ['建てる・用途を変える', 'Build / change use'],
    ps_bLine:     ['工事 {c}・{m}か月 → 満で月{r}', 'Cost {c} · {m} mo → {r}/mo at full'],
    ps_bCash:     ['現金で', 'Cash'],
    ps_bLoan:     ['{l}で借りる', 'Borrow ({l})'],
    ps_bBusy:     ['店舗に借り手がいるので、このままでは変えられない', 'The shop has a tenant, so you cannot convert it yet'],
    ps_bEvict:    ['立ち退きをお願いする（立ち退き料 {v}・家賃{n}か月ぶん）', 'Ask the tenant to leave ({v}, {n} months of rent)'],
    ps_bShort:    ['手元が足りない（現金なら {c}、借りても {l} 要る）', 'Not enough cash ({c} in cash, or {l} with a loan)'],
    ps_bShortC:   ['手元が足りない（{c} 要る。借りられる銀行が無い）', 'Not enough cash ({c} needed; no bank will lend)'],
    ps_building:  ['工事中（あと{n}か月）', 'Under construction ({n} months left)'],
    ps_sell:      ['売る', 'Sell'],
    ps_sFast:     ['すぐ（{v}）', 'Fast ({v})'],
    ps_sMkt:      ['相場（{v}）', 'Market ({v})'],
    ps_sHigh:     ['高め（{v}）', 'High ({v})'],
    ps_listed:    ['売りに出しています（{v}）', 'Listed for sale ({v})'],
    ps_unlist:    ['取り下げる', 'Withdraw'],
    ps_g_sell:    ['売った年の1月1日で5年を超えていれば譲渡益の税は約20%、5年以下なら約39%', 'Gains are taxed ~20% if held over 5 years (as of Jan 1 of the sale year), ~39% if not'],
    ps_hold:      ['持って{n}年（{k}）', 'Held {n} yrs ({k})'],
    ps_long:      ['長期', 'long-term'], ps_short: ['短期', 'short-term'],
    ps_holdCo:    ['持って{n}年（会社の物件は年数で売るときの税が変わらない）', 'Held {n} yrs (company: holding time does not change sale tax)'],
    ps_recv:      ['家賃の受け取り', 'Rent collection'],
    ps_recvAuto:  ['自動（口座に入る）', 'Automatic (paid in)'],
    ps_recvMan:   ['手動（行って回収する）', 'Manual (go and collect)'],
    ps_pend:      ['未回収 {v}', 'Uncollected {v}'],
    ps_collect:   ['回収する', 'Collect'],
    ps_rec:       ['★おすすめ', '★Pick'],
    ps_noRec:     ['いまの手元では手の届く買い方がありません（貯めるか、安い物件を）', 'No affordable way to buy this right now (save up, or pick a cheaper one)'],
    ps_recTitle:  ['おすすめの買い方: {h}', 'Suggested: {h}'],
    ps_recLine:   ['要る現金 {n}・毎月の手取り {c}', 'Cash needed {n} · net {c}/mo'],
    ps_recLoan:   ['{a} を {n}年で借りる', 'Borrow {a} over {n} yrs'],
    ps_recSafe:   ['金利が2%上がっても手取り {c}・返済は家賃の{d}%', 'Even at +2%: net {c}/mo · payment {d}% of rent'],
    ps_recSafeFix:['固定なので金利が上がっても返済は同じ・返済は家賃の{d}%', 'Fixed, so rate rises do not change it · payment {d}% of rent'],
    ps_recCashWhy:['借りると、金利が2%上がったときに赤字になるか、返済が家賃の6割を超える', 'Borrowing would go negative at +2%, or take over 60% of the rent'],
    ps_noRecRisk: ['借りられても、金利が2%上がると赤字になるか、返済が家賃の6割を超える（頭金を増やすか、ほかの物件を）', 'Loans are possible, but they go negative at +2% or take over 60% of the rent (put more down, or pick another)'],
    ps_recBuy:    ['この買い方で買う', 'Buy this way'],
    ps_lux:       ['高級マンション（区分）', 'Luxury condo unit'],
    ps_stay:      ['民泊（短期の貸し出し・年180日まで）', 'Short-stay rental (up to 180 nights/yr)'],
    ps_stayEst:   ['見込み: 1泊 {n}・稼働 {o}%・売上 月{r} − 手数料と清掃 {c}', 'Estimate: {n}/night · {o}% booked · {r}/mo − fees & cleaning {c}'],
    ps_stayCmp:   ['手取りの見込み 月{s}（ふつうに貸すと 月{n}）', 'Net about {s}/mo (normal renting: {n}/mo)'],
    ps_stayGo:    ['民泊（年180日）を始める {v}', 'Start short-stay (180 nights) {v}'],
    ps_innGo:     ['簡易宿所（通年）にする {v}', 'Licensed inn (all year) {v}'],
    ps_innEst:    ['簡易宿所なら（月25泊まで）: 手取りの見込み 月{s}', 'As a licensed inn (25 nights/mo): net about {s}/mo'],
    ps_stayNow:   ['民泊中: 先月 稼働 {o}%・売上 {r}・費用 {c}', 'Short-stay: last month {o}% booked · {r} sales · {c} costs'],
    ps_stayStop:  ['やめて、ふつうに貸す', 'Back to normal renting'],
    ps_g_stay:    ['観光の多い街（上野・新宿・渋谷）ではふつうに貸すより手取りが多いが、季節でゆれ、近所の苦情もある。郊外では少ない。空いているときだけ切り替えられる',
                   'In tourist areas (Ueno, Shinjuku, Shibuya) it beats normal renting, but it swings with the seasons and neighbours may complain. Weak in the suburbs. Switch only when empty'],
    ps_ground:    ['借地（事業用定期借地・30年）', 'Ground lease (30-yr commercial)'],
    ps_groundLine:['お店や会社に土地を貸す。地代 月{v}（土地の値段の年3%）。費用も手間も無い', 'Lease the land to a shop or company: {v}/mo (3% of land value a year). No costs, no work'],
    ps_groundGo:  ['借地にする', 'Lease it'],
    ps_groundOn:  ['借地中（あと{n}年）・地代 月{v}', 'Leased ({n} yrs left) · {v}/mo'],
    ps_g_ground:  ['手間は無いが、30年は建てたり使ったりできない。売るときは底地として土地の75%', 'No work, but you cannot use the land for 30 years. Sold as leased land at 75% of land value'],
    ps_g_whole:   ['一棟オフィスビルは、会社がビルを丸ごと借りることがある（定期借家10年・相場の9割）。空かないが、満期に全部空くこともある', 'Companies may lease the whole building (10-yr fixed term at 90% of market). No vacancies, but it can all empty at once at the end'],
    ps_otherOwned:['ほかの人の物件（売りに出ていない）', "Someone else's property (not for sale)"],
    ps_nego:      ['指値（値下げの交渉）', 'Make an offer (haggle)'],
    ps_negoBtn:   ['−{p}%（{c}）', '−{p}% ({c})'],
    ps_negoEasy:  ['通りやすい', 'likely'], ps_negoHalf: ['五分五分', '50/50'], ps_negoHard: ['むずかしい', 'long shot'],
    ps_g_nego:    ['1回だけ言える。売り出しが長い物件・相場より高い物件ほど通りやすい。断られても言い値なら買える（−15%は怒らせることも）',
                   'One try. Long-listed or overpriced places say yes more often. If refused you can still pay the asking price (−15% may offend)'],
    ps_deal:      ['掘り出し物（{r}）残り {s}秒', 'Bargain ({r}) — {s}s left'],
    ps_dealHint:  ['相場より安い。でも訳ありのこともある（内見で傷みを確かめよう）', 'Below market — but some hide problems (inspect first)'],
    ps_up:        ['バリューアップ（設備・リフォーム）', 'Value-up (upgrades)'],
    ps_upRent:    ['家賃 +{v}%', 'Rent +{v}%'],
    ps_upRev:     ['売上 +{v}%', 'Sales +{v}%'],
    ps_upFill:    ['決まりやすさ +{v}%', 'Leasing +{v}%'],
    ps_upMonthly: ['月 {v}', '{v}/mo'],
    ps_upWear:    ['傷みが早まる', 'more wear'],
    ps_upDo:      ['やる {v}', 'Do it {v}'],
    ps_upDone:    ['済み', 'Done'],
    ps_g_up:      ['家賃が上がるのは次の入居者から。値段（相場）は家賃 ÷ 利回りなので、売るときも高くなる。内見のお客さんの希望にも効く',
                   'Higher rent applies from the next tenant. Price = rent ÷ yield, so the property is worth more too. Viewers\' wishes count as well'],
    ps_cdT:       ['管理費・修繕積立金（月）', 'Service & repair fees /mo'],
    ps_cdKanri:   ['管理費', 'Service charge'],
    ps_cdRes:     ['修繕積立金', 'Repair reserve'],
    ps_cdLoan:    ['うち管理組合の借入の返済（あと{n}年）', 'incl. association loan (≈{n} yrs left)'],
    ps_cdNext:    ['次の値上げ', 'Next rise'],
    ps_cdNextV:   ['{w} 月{v}（+{d}）', '{w}: {v}/mo (+{d})'],
    ps_cdNone:    ['予定なし（均等積立）', 'None planned (flat plan)'],
    ps_cdTop:     ['計画の上限まで上がった', 'At the top of the plan'],
    ps_cdBig:     ['次の大規模修繕', 'Next major repairs'],
    ps_cdBigV:    ['築{a}年（{w}）', 'At {a} yrs ({w})'],
    ps_cdFund:    ['積立金の残り', 'Repair fund'],
    ps_cdOk:      ['足りる見込み', 'Looks enough'],
    ps_cdShort:   ['足りない見込み（一時金 約{v}）', 'Looks short (levy ≈{v})'],
    ps_cdUnk:     ['？（内見で分かる）', '? (inspect to see)'],
    ps_cdYears:   ['{n}年後', 'in {n} yrs'],
    ps_cdMonths:  ['{n}か月後', 'in {n} mo'],
    ps_cdDankai:  ['段階増額: 新築のころは安く、5年ごとに上がる計画。古くなるほど毎月の経費が増える', 'Stepped plan: cheap when new, rising every 5 years, so costs grow as the building ages'],
    ps_cdKinto:   ['均等積立: はじめから同じ額を積み立てる計画。途中で上がりにくい', 'Flat plan: the same amount from the start, so it rarely jumps later'],
    ps_cdSim:     ['{w}に積立金が上がると、手取りは月{c}', 'When the fee rises {w}, net becomes {c}/mo'],
    ps_view:      ['内見の予約: {w}（残り {s}秒）', 'Viewing: {w} ({s}s left)'],
    ps_viewHow:   ['物件の前で長押しして案内しよう（決まりやすく、広告料も要らない）', 'Hold at the property to show them round (better odds, no ad fee)']
  });
  function G() { return QT.G; }
  function fmt(v) { return QT.G.fmt(v); }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + fmt(Math.abs(Math.round(v))); }
  function pct(v) { return (v * 100).toFixed(1) + '%'; }
  var plan = { lender: null, amtK: 1, kind: 'var', term: null };
  function P(S, id) { return S.props && S.props[id]; }
  var REC_UP = 0.02, REC_DSCR = 0.6;
  function ownerPick() { return QT.G.hojin && QT.G.hojin.on() && !(QT.Hojin && QT.Hojin.lastOwner === 'me') ? 'co' : null; }
  function recCheck(p, pl, cash) {
    var g = G(), sm = simulate(p, pl);
    if (!sm.q || !sm.q.ok || !(sm.amount > 0) || sm.need > cash) return null;
    var fix = sm.q.kind === 'fix', rate = sm.q.rate, n = (pl.term || sm.q.term) * 12;
    var up = fix ? sm.pay : g.loanNewPayIfUp(sm.amount, rate, n, REC_UP);
    return { ok: sm.rent - sm.costs - up >= 0 && sm.pay <= sm.rent * REC_DSCR, rate: rate, amount: sm.amount, kind: sm.q.kind, term: sm.q.term };
  }
  function recommend(id) {
    var S = QT.G.S, p = P(S, id), g = G(), out = { lender: null, amtK: 1, kind: 'var', term: null, rec: null, owner: ownerPick(), risky: false };
    if (!p || !p.sale || p.own) return out;
    var price = p.sale.price, fees = price * E.BUY_COST, keep = S.life.living * 2;
    var cash = g.cashFor ? g.cashFor(out.owner) : S.coins;
    var key = [id, S.fin.month, price, Math.round(cash / 1000), out.owner, p.insp ? 1 : 0, S.life.age].join('|');
    if (recMemo.key === key) return copyOf(recMemo.v);
    recMemo.key = key; recMemo.v = out;
    var cashOk = cash - keep >= price + fees;
    if (cashOk && S.life.retired) { out.rec = 'cash'; return copyOf(out); }
    var best = null;
    Object.keys(E.LENDERS).forEach(function (l) {
      if (l === 'nonbank') return;
      (E.LENDERS[l].fixedOnly ? ['fix'] : ['var', 'fix']).forEach(function (kind) {
        [1, 0.8, 0.5].some(function (f) {
          var r = recCheck(p, { lender: l, amtK: f, kind: kind, term: null, owner: out.owner }, cash);
          if (!r) return false;
          if (!r.ok) { out.risky = true; return false; }
          if (!best || r.rate < best.rate - 1e-9 || (Math.abs(r.rate - best.rate) < 1e-9 && r.amount > best.amount)) {
            best = { lender: l, kind: r.kind, amtK: f, term: r.term, rate: r.rate, amount: r.amount };
          }
          return true;
        });
      });
    });
    if (best) {
      out.lender = best.lender; out.kind = best.kind; out.amtK = best.amtK; out.term = best.term; out.rec = best.lender;
      return copyOf(out);
    }
    if (cashOk || cash >= price + fees) out.rec = 'cash';
    return copyOf(out);
  }
  var recMemo = { key: null, v: null };
  function copyOf(o) { var c = {}; Object.keys(o).forEach(function (x) { c[x] = o[x]; }); return c; }
  function structName(p) { var K = E.KINDS[p.kind] || {}; return t('ps_' + (K.struct || 'none')); }
  function drawNumbers(S, H, k, p, y) {
    var Es = G().estate, u = Es.useOf(p), price = p.sale ? p.sale.price : Es.value(p), yl = Es.yields(p, price);
    var C = k.C, dl = G().deals;
    if (p.sale && p.sale.deal && !p.own && dl && dl.deal() && dl.deal().p === p.id) {
      k.card(y, 46, '#ffe9f2');
      k.text(t('ps_deal', { r: L.t('dl_r_' + p.sale.deal), s: Math.ceil(dl.dealLeft()) }), k.x + 4, y + 17, 12, '#e2508a', 900);
      k.text(t('ps_dealHint'), k.x + 4, y + 35, 10, C.soft, 700);
      y += 54;
    }
    var vw = p.own && dl ? dl.viewOf(p.id) : null;
    if (vw) {
      k.card(y, 46, '#efeaff');
      k.text(t('ps_view', { w: L.t('w_' + vw.who), s: Math.ceil(dl.viewLeft(vw)) }), k.x + 4, y + 17, 12, '#6f57e0', 900);
      k.text(t('ps_viewHow'), k.x + 4, y + 35, 10, C.soft, 700);
      y += 54;
    }
    k.card(y, 112);
    var y0 = y + 16;
    var x2 = k.x + k.w / 2 + 6;
    H.txt(t(p.sale && !p.sale.mine ? 'ps_price' : 'ps_value'), k.x + 4, y0, 10, C.soft, 'left', 700);
    H.txt(yen(price), k.x + 4, y0 + 20, 20, C.ink, 'left', 900);
    var revL = u === 'cpark' || u === 'wash' || u === 'trunk' || p.ctr === 'stay' ? t('ps_rev') : p.own ? t('ps_rentNow') : t('ps_rent');
    var revV = u === 'cpark' ? Es.cparkRev(p) : u === 'wash' ? Es.washRev(p) : p.own ? Es.rev(p) : G().rentFull(p);
    H.txt(revL, x2, y0, 10, C.soft, 'left', 700);
    H.txt(u === 'land' && p.ctr !== 'ground' ? '—' : yen(revV), x2, y0 + 20, 16, C.ok, 'left', 900);
    var y1 = y0 + 44;
    H.txt(t('ps_gross') + ' ' + (yl.gross > 0 ? pct(yl.gross) : '—'), k.x + 4, y1, 11.5, C.ink, 'left', 800);
    H.txt(t('ps_net') + ' ' + (yl.gross > 0 ? pct(yl.net) : '—'), x2, y1, 11.5, yl.net >= 0.04 ? C.ok : yl.net >= 0.02 ? C.gold : C.bad, 'left', 800);
    var K = E.KINDS[p.kind] || {}, line2;
    if (K.struct && K.struct !== 'eq') line2 = t('ps_age', { n: Es.ageOf(p), s: structName(p), w: p.walk });
    else line2 = (p.landA ? t('ps_land', { a: p.landA }) : '') + ' · ' + t('ps_age', { n: 0, s: structName(p), w: p.walk }).split('・').pop();
    k.text(line2, k.x + 4, y1 + 20, 10.5, C.soft, 700);
    var occTxt = p.units && p.units.length ? t('ps_occ') + ' ' + t('ps_occV', { a: p.units.filter(function (x) { return x.occ; }).length, b: p.units.length }) : '';
    if (p.ctr === 'sub') occTxt = t('ps_subOn', { v: yen(p.subRent) });
    var condTxt = K.struct ? t('ps_cond') + ' ' + Es.cond(p) : '';
    k.text([occTxt, condTxt].filter(Boolean).join('  ·  '), k.x + 4, y1 + 38, 10.5, (p.cond || 0) > 0.6 && (p.insp || p.own) ? C.bad : C.ink, 800);
    y += 120;
    y = k.wrap(t('ps_g_gross'), k.x, y + 4, k.w, 9.5, C.soft) + 2;
    if (!p.own && !p.insp && K.struct) y = k.wrap(t('ps_g_cond'), k.x, y, k.w, 9.5, C.bad) + 2;
    if (p.rebuildNo) y = k.wrap(t('ps_rebuildNo'), k.x, y, k.w, 9.5, C.bad) + 2;
    var fb = Es.floorBy ? Es.floorBy(p) : null;
    var fk = Es.floorK ? Es.floorK(p) : 0;
    if (fb === 'occ' || fb === 'vacant' || fb === 'shop' || fb === 'bulk')
      y = k.wrap(t(fb === 'occ' ? 'ps_floorOcc' : fb === 'vacant' ? 'ps_floorVac' : fb === 'shop' ? 'ps_floorShop' : 'ps_floorBulk', { k: Math.round(fk * 100) / 10 }), k.x, y, k.w, 9.5, C.soft) + 2;
    return y + 6;
  }
  function whenTxt(mo) { return mo >= 12 ? t('ps_cdYears', { n: Math.round(mo / 12) }) : t('ps_cdMonths', { n: mo }); }
  function drawCondo(S, H, k, p, y) {
    var cd = G().condo, C = k.C;
    if (!cd || !cd.is(p)) return y;
    var ka = cd.kanri(p), rs = cd.reserve(p), la = cd.loanAdd(p), nx = cd.nextRaise(p), bg = cd.nextBig(p), pl = cd.plan(p);
    var rows = 5 + (la ? 1 : 0), ch = 38 + rows * 19;
    k.card(y, ch, '#f3f7fb');
    k.x += 4; k.w -= 8;
    var yy = k.line(t('ps_cdT'), yen(ka + rs + la), y + 16, C.ink, 12);
    yy = k.line(t('ps_cdKanri'), yen(ka), yy);
    yy = k.line(t('ps_cdRes'), yen(rs + la), yy);
    if (la) yy = k.line(t('ps_cdLoan', { n: Math.max(1, Math.ceil(cd.loanLeft(p) / 12)) }), '+' + yen(la), yy, C.bad);
    var nxTo = nx ? nx.to + (cd.loanLeft(p) > nx.months ? la : 0) : 0;
    yy = k.line(t('ps_cdNext'), nx ? t('ps_cdNextV', { w: whenTxt(nx.months), v: yen(nxTo), d: yen(nx.d) }) :
                pl.kinto ? t('ps_cdNone') : t('ps_cdTop'), yy, nx ? C.gold : C.soft);
    yy = k.line(t('ps_cdBig'), t('ps_cdBigV', { a: bg.age, w: whenTxt(bg.months) }), yy);
    var known = p.own || p.insp;
    k.line(t('ps_cdFund'), !known ? t('ps_cdUnk') : bg.short ? t('ps_cdShort', { v: yen(bg.levy) }) : t('ps_cdOk'), yy,
           !known ? C.soft : bg.short ? C.bad : C.ok);
    k.x -= 4; k.w += 8;
    y += ch + 6;
    y = k.wrap(t(pl.kinto ? 'ps_cdKinto' : 'ps_cdDankai'), k.x, y, k.w, 9.5, C.soft) + 6;
    return y;
  }
  function simulate(p, pl) {
    var g = G(), Es = g.estate, u = Es.useOf(p), yl = Es.yields(p), price = p.sale.price;
    var rent = u === 'cpark' ? Es.cparkRev(p) : u === 'wash' ? Es.washRev(p) : g.rentFull(p) * yl.occ;
    var costs = Es.fixedYear(p, price) / 12 + rent * (u === 'wash' ? E.WASH.cost : u === 'cpark' ? E.CPARK_COST : 0.09);
    var amount = 0, pay = 0, fee = 0, q = null;
    if (pl.lender) {
      q = g.loanQuote(p, pl.lender, { kind: pl.kind });
      if (q.ok) {
        amount = Math.floor(q.max * (pl.amtK || 1) / 100000) * 100000;
        var rate = pl.kind === 'fix' ? g.fixRate(pl.lender) : g.varRate(pl.lender);
        pay = amount > 0 ? g.loanPayment(amount, rate, (pl.term || q.term) * 12) : 0;
        fee = Math.round(amount * (E.LENDERS[pl.lender].fee || 0));
      }
    }
    var need = price + Math.round(price * E.BUY_COST) + fee - amount;
    var buyPlan = pl.lender && q && q.ok && amount > 0 ? { loan: { lender: pl.lender, amount: amount, kind: pl.kind, term: pl.term || q.term } } : null;
    if (pl.owner === 'co') { buyPlan = buyPlan || {}; buyPlan.owner = 'co'; }
    return { rent: rent, costs: costs, pay: pay, cf: rent - costs - pay, need: need, amount: amount, q: q, plan: buyPlan,
             ok: Es.canBuy(p, buyPlan).ok && (!pl.lender || (q && q.ok)) };
  }
  function drawRec(S, H, k, p, y) {
    var C = k.C, rp = recommend(p.id);
    if (!rp.rec) return y;
    var g = G(), sm = simulate(p, rp), how = rp.rec === 'cash' ? t('ps_cash') : L.nm(E.LENDERS[rp.rec]);
    var why = null;
    if (sm.amount && sm.q) {
      var fix = sm.q.kind === 'fix', n = (rp.term || sm.q.term) * 12;
      var up = fix ? sm.pay : g.loanNewPayIfUp(sm.amount, sm.q.rate, n, REC_UP), cf2 = sm.rent - sm.costs - up;
      why = t(fix ? 'ps_recSafeFix' : 'ps_recSafe', { c: (cf2 >= 0 ? '+' : '') + yen(cf2), d: Math.round(sm.rent > 0 ? sm.pay / sm.rent * 100 : 0) });
    } else if (rp.risky) why = t('ps_recCashWhy');
    var ch = why ? 112 : 92;
    k.card(y, ch, '#eaf7ef');
    k.text(t('ps_recTitle', { h: how }), k.x + 4, y + 18, 13, C.ok, 900);
    k.text(t('ps_recLine', { n: yen(sm.need), c: (sm.cf >= 0 ? '+' : '') + yen(sm.cf) }), k.x + 4, y + 40, 11.5, C.ink, 800);
    if (sm.amount) {
      k.text(t('ps_recLoan', { a: yen(sm.amount), n: rp.term || (sm.q && sm.q.term) }), k.x + 4, y + 60, 10.5, C.soft, 700);
      k.text(t(sm.q.kind === 'fix' ? 'ps_fix' : 'ps_var', { r: (sm.q.rate * 100).toFixed(2) }), k.x + 4, y + 77, 10.5, C.soft, 700);
    }
    k.btn({ x: k.x + k.w - 150, y: y + 50, w: 146, h: 36 }, t('ps_recBuy'), '#2fbf7a', function () {
      var r = G().estate.buy(p.id, sm.plan);
      if (r.ok && QT.Sfx) QT.Sfx.play('cash');
    }, sm.ok);
    if (why) k.text(why, k.x + 4, y + 102, 10, sm.amount ? C.ok : C.ink, 800);
    return y + ch + 8;
  }
  function drawNego(S, H, k, p, y) {
    var dl = G().deals, C = k.C;
    if (!dl || !p.sale || p.sale.mine) return y;
    var nt = dl.negoText(p);
    if (nt) {
      k.card(y, 34, nt.good ? '#eaf7ef' : '#fdecea');
      k.text(nt.s, k.x + 4, y + 18, 11.5, nt.good ? C.ok : C.bad, 900);
      return y + 42;
    }
    H.txt(t('ps_nego'), k.x, y + 8, 12, C.ink, 'left', 900);
    y += 18;
    var bw = (k.w - 12) / 3;
    [5, 10, 15].forEach(function (pc, i) {
      var ch = dl.negoChance(p, pc), lab = t(ch >= 0.6 ? 'ps_negoEasy' : ch >= 0.35 ? 'ps_negoHalf' : 'ps_negoHard');
      k.btn({ x: k.x + i * (bw + 6), y: y, w: bw, h: 36 }, t('ps_negoBtn', { p: pc, c: lab }), i === 0 ? '#2bb8d8' : i === 1 ? '#1f5fbf' : '#6f57e0', function () {
        var r = dl.nego(p.id, pc);
        if (!r) return;
        plan = recommend(p.id);
        if (QT.Sfx) QT.Sfx.play(r.res === 'ok' ? 'fanfare' : r.res === 'counter' ? 'good' : 'bad');
        if (r.res === 'ok' || r.res === 'counter') {
          var Hh = QT.Render && QT.Render.H;
          if (Hh && r.res === 'ok') Hh.confetti(30, Hh.cssW / 2, Hh.cssH * 0.3, 3);
        }
      });
    });
    y += 42;
    y = k.wrap(t('ps_g_nego'), k.x, y, k.w, 9.5, C.soft) + 6;
    return y;
  }
  function drawStress(S, H, k, y, s) {
    var g = G(), C = k.C;
    if (!s.lender || !(s.amount > 0)) {
      if (!s.lender) y = k.wrap(t('ps_stCash'), k.x, y, k.w, 9.5, C.soft) + 6;
      return y;
    }
    var cols = [0, 0.01, 0.02].map(function (d) {
      var pay = s.fix || !d ? s.pay : g.loanNewPayIfUp(s.amount, s.rate, s.n, d), cf = s.rent - s.costs - pay;
      return { d: d, pay: pay, cf: cf, dscr: s.rent > 0 ? pay / s.rent : 0 };
    });
    var kindTxt = t(s.fix ? 'ps_fix' : 'ps_var', { r: (s.rate * 100).toFixed(2) });
    k.card(y, 116, '#fff4ea');
    H.txt(t('ps_st', { k: kindTxt }), k.x + 4, y + 16, 11.5, C.ink, 'left', 900);
    var lw = Math.round(k.w * 0.32), cw = (k.w - 8 - lw) / 3;
    function cx(i) { return k.x + 4 + lw + cw * (i + 1) - 4; }
    cols.forEach(function (c, i) {
      H.txt(i ? t('ps_stUp', { n: Math.round(c.d * 100) }) : t('ps_stNow'), cx(i), y + 36, 10.5, i === 2 && !s.fix ? C.bad : C.ink, 'right', 900);
      H.txt(s.fix && i ? t('ps_stSame') : ((s.rate + (s.fix ? 0 : c.d)) * 100).toFixed(2) + '%', cx(i), y + 50, 9, C.soft, 'right', 700);
    });
    var rows = [['ps_stPay', function (c) { return ['-' + yen(c.pay), C.ink]; }],
                ['ps_stCF', function (c) { return [(c.cf >= 0 ? '+' : '') + yen(c.cf), c.cf >= 0 ? C.ok : C.bad]; }],
                ['ps_stDscr', function (c) { return [Math.round(c.dscr * 100) + '%', c.dscr > 0.7 ? C.bad : c.dscr > 0.5 ? C.gold : C.ink]; }]];
    rows.forEach(function (r, j) {
      var ry = y + 68 + j * 18;
      H.fitTxt(t(r[0]), k.x + 4, ry, 10.5, lw - 4, C.soft, 700, 7.5);
      cols.forEach(function (c, i) { var v = r[1](c); H.txt(v[0], cx(i), ry, 11, v[1], 'right', 900); });
    });
    y += 126;
    y = k.wrap(t(s.fix ? 'ps_stFix' : 'ps_stVar'), k.x, y, k.w, 9.5, C.soft) + 2;
    y = k.wrap(t('ps_stLesson'), k.x, y, k.w, 10, C.ink, 800) + 6;
    return y;
  }
  function drawBuy(S, H, k, p, y) {
    var g = G(), Es = g.estate, C = k.C, lenders = Object.keys(E.LENDERS);
    y = drawNego(S, H, k, p, y);
    if (!p.sale || p.sale.mad) return y;
    if (QT.Hojin) y = QT.Hojin.ownerChips(S, H, k, p, y, plan);
    y = drawRec(S, H, k, p, y);
    H.txt(t('ps_pay'), k.x, y + 8, 12, C.ink, 'left', 900);
    y += 20;
    var qs = {};
    lenders.forEach(function (l) { qs[l] = g.loanQuote(p, l, { kind: plan.kind }); });
    var recTag = t('ps_rec');
    var chips = [{ id: null, label: t('ps_cash') + (plan.rec === 'cash' ? ' ' + recTag : '') }].concat(lenders.map(function (l) {
      return { id: l, label: L.nm(E.LENDERS[l]) + (plan.rec === l ? ' ' + recTag : ''), col: E.LENDERS[l].color, dim: !qs[l].ok };
    }));
    y = k.chips(chips, plan.lender, y, function (id) { plan.lender = id; plan.amtK = 1; plan.term = null; plan.kind = id && E.LENDERS[id].fixedOnly ? 'fix' : plan.kind; });
    if (!plan.rec) y = k.wrap(t(plan.risky ? 'ps_noRecRisk' : 'ps_noRec'), k.x, y + 2, k.w, 10.5, C.bad, 800) + 4;
    var ld = plan.lender && E.LENDERS[plan.lender], q = plan.lender ? qs[plan.lender] : null, amount = 0;
    if (ld) {
      y = k.wrap(L.nm(ld, 'sub'), k.x, y + 2, k.w, 10, C.soft) + 4;
      if (!q.ok) {
        q.why.forEach(function (w) { k.text('× ' + w, k.x, y + 6, 10.5, C.bad, 800); y += 18; });
        if (ld.note && g.loanIncome() < ld.minIncome) y = k.wrap(L.nm(ld, 'note'), k.x, y + 4, k.w, 9.5, C.soft) + 4;
      } else {
        if (!ld.fixedOnly) {
          H.txt(t('ps_kind'), k.x, y + 8, 10.5, C.soft, 'left', 700); y += 16;
          y = k.chips([{ id: 'var', label: t('ps_var', { r: (g.varRate(plan.lender) * 100).toFixed(2) }) },
                       { id: 'fix', label: t('ps_fix', { r: (g.fixRate(plan.lender) * 100).toFixed(2) }) }], plan.kind, y,
                      function (id) { plan.kind = id; });
          y = k.wrap(t('ps_g_rate'), k.x, y, k.w, 9.5, C.soft) + 4;
        }
        q = g.loanQuote(p, plan.lender, { kind: plan.kind });
        H.txt(t('ps_amount'), k.x, y + 8, 10.5, C.soft, 'left', 700); y += 16;
        var opts = [1, 0.8, 0.5].map(function (f) { return { id: f, label: yen(Math.floor(q.max * f / 100000) * 100000) }; });
        y = k.chips(opts, plan.amtK, y, function (f) { plan.amtK = f; });
        amount = Math.floor(q.max * plan.amtK / 100000) * 100000;
        H.txt(t('ps_term'), k.x, y + 8, 10.5, C.soft, 'left', 700); y += 16;
        var terms = [q.term, 25, 20, 15, 10].filter(function (n, i, a) { return n <= q.term && n >= 5 && a.indexOf(n) === i; });
        if (plan.term == null || plan.term > q.term) plan.term = q.term;
        y = k.chips(terms.map(function (n) { return { id: n, label: t('ps_years', { n: n }) }; }), plan.term, y, function (n) { plan.term = n; });
        y = k.wrap(t('ps_g_term'), k.x, y, k.w, 9.5, C.soft) + 4;
      }
    }
    var full = g.rentFull(p), yl = Es.yields(p), u = Es.useOf(p);
    var rentExp = u === 'cpark' ? Es.cparkRev(p) : u === 'wash' ? Es.washRev(p) : full * yl.occ;
    var costs = Es.fixedYear(p, p.sale.price) / 12 + rentExp * (u === 'wash' ? E.WASH.cost : u === 'cpark' ? E.CPARK_COST : 0.09);
    var termN = (plan.term || (q && q.term) || 1) * 12, rate = q ? (plan.kind === 'fix' ? g.fixRate(plan.lender) : g.varRate(plan.lender)) : 0;
    var pay = amount > 0 ? g.loanPayment(amount, rate, termN) : 0;
    var cf = rentExp - costs - pay;
    var fee = q && amount ? Math.round(amount * (ld.fee || 0)) : 0;
    var need = p.sale.price + Math.round(p.sale.price * E.BUY_COST) + fee - amount;
    y += 4;
    k.card(y, 128, '#fbfaf3');
    var yy = y + 16;
    H.txt(t('ps_sim'), k.x + 4, yy, 11.5, C.ink, 'left', 900); yy += 20;
    k.x += 4; k.w -= 8;
    yy = k.line(t('ps_simRent', { p: Math.round((u === 'cpark' || u === 'wash' ? 1 : yl.occ) * 100) }), yen(rentExp), yy, C.ok);
    yy = k.line(t('ps_simCost'), '-' + yen(costs), yy, C.bad);
    yy = k.line(t('ps_simPay'), '-' + yen(pay), yy, C.bad);
    yy = k.line(t('ps_simCF'), yen(cf), yy, cf >= 0 ? C.ok : C.bad, 13);
    var dscr = rentExp > 0 ? pay / rentExp : 0;
    yy = k.line(t('ps_dscr'), Math.round(dscr * 100) + '%', yy, dscr > 0.7 ? C.bad : dscr > 0.5 ? C.gold : C.ink);
    k.x -= 4; k.w += 8;
    y += 136;
    var cdn = g.condo && g.condo.is(p) ? g.condo.nextRaise(p) : null;
    if (cdn && cdn.months <= 120 && cdn.d > 0) {
      var cf2 = cf - cdn.d;
      y = k.wrap(t('ps_cdSim', { w: whenTxt(cdn.months), c: (cf2 >= 0 ? '+' : '') + yen(cf2) }), k.x, y, k.w, 10, cf2 >= 0 ? C.ink : C.bad, 800) + 6;
    }
    y = drawStress(S, H, k, y, { lender: plan.lender, amount: amount, rate: rate, n: termN, pay: pay, rent: rentExp, costs: costs,
                                 fix: plan.kind === 'fix' || !!(ld && ld.fixedOnly) });
    y = drawCondo(S, H, k, p, y);
    var have = g.cashFor ? g.cashFor(plan.owner) : S.coins;
    y = k.line(t('ps_need'), yen(need), y + 4, need > have ? C.bad : C.ink);
    y = k.line(t(plan.owner === 'co' ? 'ps_haveCo' : 'ps_have'), yen(have), y, C.soft);
    if (dscr > 0.6) { k.text('! ' + t('ps_warnDscr'), k.x, y + 2, 10, C.bad, 800); y += 16; }
    if (cf < 0) { k.text('! ' + t('ps_warnCF'), k.x, y + 2, 10, C.bad, 800); y += 16; }
    if (!p.insp && (E.KINDS[p.kind] || {}).struct) { k.text('! ' + t('ps_warnInsp'), k.x, y + 2, 10, C.gold, 800); y += 16; }
    var buyPlan = plan.lender && q && q.ok && amount > 0 ? { loan: { lender: plan.lender, amount: amount, kind: plan.kind, term: plan.term } } : null;
    if (plan.owner === 'co') { buyPlan = buyPlan || {}; buyPlan.owner = 'co'; }
    var ck = Es.canBuy(p, buyPlan);
    if (plan.lender && !(q && q.ok)) ck = { ok: false, why: q && q.why[0] };
    y += 6;
    if (!ck.ok && ck.why) { k.text(ck.why, k.x, y + 6, 10.5, C.bad, 800); y += 18; }
    k.btn({ x: k.x + k.w - 150, y: y, w: 150, h: 44 }, t('ps_buy') + ' ' + yen(p.sale.price), '#2fbf7a', function () {
      var r = Es.buy(p.id, buyPlan);
      if (r.ok && QT.Sfx) QT.Sfx.play('cash');
    }, ck.ok);
    return y + 56;
  }
  function drawOwn(S, H, k, p, y) {
    var g = G(), Es = g.estate, C = k.C, u = Es.useOf(p), K = E.KINDS[p.kind] || {};
    var cf = Es.cf(p), bal = g.loanBalOf(p.id), pay = g.loanPayOf(p.id);
    y = k.line(t('ps_cfNow'), yen(cf), y + 8, cf >= 0 ? C.ok : C.bad, 13);
    if (bal > 0) { y = k.line(t('ps_loanBal'), yen(bal), y); y = k.line(t('ps_loanPay'), yen(pay), y); }
    var man = Es.manual(p);
    y = k.line(t('ps_recv'), t(man ? 'ps_recvMan' : 'ps_recvAuto'), y, man ? C.gold : C.ok);
    if (p.pend > 0) {
      k.text(t('ps_pend', { v: yen(p.pend) }), k.x, y + 6, 12, C.gold, 900);
      k.btn({ x: k.x + k.w - 120, y: y - 8, w: 120, h: 32 }, t('ps_collect'), '#f5b21c', function () { Es.collect(p.id); });
      y += 30;
    }
    var yrs = Math.floor((S.fin.month - p.buyAt) / 12), longNow = S.fin.year - p.buyYear > E.LONG_YEARS;
    if (g.hojin && g.hojin.on()) y = k.line(t('ps_ownNow'), t(p.owner === 'co' ? 'ps_ownCo' : 'ps_ownMe'), y, p.owner === 'co' ? '#2b8fb0' : C.ink);
    if (p.owner === 'co') y = k.wrap(t('ps_holdCo', { n: yrs }), k.x, y, k.w, 11, C.soft, 700) + 4;
    else y = k.line(t('ps_hold', { n: yrs, k: t(longNow ? 'ps_long' : 'ps_short') }), '', y);
    y = drawCondo(S, H, k, p, y + 4);
    y = k.hr(y + 2);
    if (p.building) {
      k.text(t('ps_building', { n: Math.max(1, p.building.until - S.fin.month) }), k.x, y + 8, 12, C.gold, 900);
      return y + 30;
    }
    if (u === 'home' || u === 'office' || u === 'wash') {
      H.txt(t('ps_mgmt'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
      if (p.ctr === 'sub' || p.ctr === 'corp') k.text('—', k.x, y + 8, 11, C.soft);
      else {
        y = k.chips([{ id: 'co', label: t(u === 'wash' ? 'ps_mgWashCo' : 'ps_mgCo') }, { id: 'self', label: t(u === 'wash' ? 'ps_mgWashSelf' : 'ps_mgSelf') }],
                    p.mgmt, y, function (m) { Es.setMgmt(p.id, m); });
        y = k.wrap(t('ps_g_self'), k.x, y, k.w, 9.5, C.soft) + 6;
      }
    }
    if (u === 'home' || u === 'office' || u === 'park') {
      if (p.ctr !== 'sub' && p.ctr !== 'corp') {
        H.txt(t('ps_rentSet'), k.x, y + 8, 11, C.ink, 'left', 800); y += 18;
        y = k.chips([{ id: 0.9, label: t('ps_low') }, { id: 1, label: t('ps_mid') }, { id: 1.1, label: t('ps_high') }], p.rentMul || 1, y,
                    function (m) { Es.setRentMul(p.id, m); });
      }
    }
    if (u === 'home' || u === 'office') {
      H.txt(t('ps_ops'), k.x, y + 10, 12, C.ink, 'left', 900); y += 22;
      var off = S.mkt.offer && S.mkt.offer.p === p.id ? S.mkt.offer : null;
      if (p.ctr === 'corp') { k.text(t('ps_corpOn', { n: Math.max(0, p.ctrUntil - S.fin.month) }), k.x, y + 8, 11.5, C.ok, 900); y += 22; }
      else if (off) {
        k.text(t('ps_corp') + ': ' + t('ps_corpOffer', { v: yen(off.rent * p.units.length), y: off.years }), k.x, y + 8, 11.5, C.blue, 900); y += 18;
        k.btn({ x: k.x + k.w - 190, y: y, w: 90, h: 36 }, t('ps_accept'), '#2fbf7a', function () { Es.acceptCorp(); });
        k.btn({ x: k.x + k.w - 92, y: y, w: 92, h: 36 }, t('ps_decline'), '#9a94ad', function () { Es.declineCorp(); });
        y += 44;
      }
      if (K.wholeLease) y = k.wrap(t('ps_g_whole'), k.x, y, k.w, 9.5, C.soft) + 4;
      else if (K.corpOk || u === 'office') y = k.wrap(t('ps_g_corp'), k.x, y, k.w, 9.5, C.soft) + 4;
      if (K.subOk) {
        if (p.ctr === 'sub') {
          k.text(t('ps_subOn', { v: yen(p.subRent) }), k.x, y + 8, 11.5, C.blue, 900); y += 18;
          k.btn({ x: k.x + k.w - 170, y: y, w: 170, h: 36 }, t('ps_subQuit', { v: yen(p.subRent * E.SUB.quitMonths) }), '#e2504a', function () { Es.quitSub(p.id); }, Es.cashFor(p) >= p.subRent * E.SUB.quitMonths);
          y += 44;
        } else if (!p.ctr) {
          k.text(t('ps_sub', { v: yen(Es.subQuote(p)) }), k.x, y + 8, 11.5, C.ink, 800); y += 18;
          k.btn({ x: k.x + k.w - 100, y: y, w: 100, h: 36 }, t('ps_subGo'), '#2bb8d8', function () { Es.startSub(p.id); });
          y += 44;
        }
        y = k.wrap(t('ps_g_sub'), k.x, y, k.w, 9.5, C.soft) + 4;
      }
    }
    if (u === 'cpark') {
      H.txt(t('ps_ops'), k.x, y + 10, 12, C.ink, 'left', 900); y += 22;
      y = k.chips([{ id: 'self', label: t('ps_cpSelf') }, { id: 'lease', label: t('ps_cpLease', { v: yen(Es.cparkRev(p) * E.CPARK_LEASE) }) }],
                  p.cparkLease ? 'lease' : 'self', y, function (m) { Es.setCparkLease(p.id, m === 'lease'); });
    }
    var dl = g.deals, ups = dl ? dl.upList(p) : [];
    if (ups.length) {
      y = k.hr(y + 2);
      H.txt(t('ps_up'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
      ups.forEach(function (id) {
        var U = dl.UPS[id], done = dl.has(p, id), c = dl.upCost(p, id), fx = [];
        if (U.rent) fx.push(t('ps_upRent', { v: +(U.rent * 100).toFixed(1) }));
        if (U.rev) fx.push(t('ps_upRev', { v: Math.round(U.rev * 100) }));
        if (U.fill) fx.push(t('ps_upFill', { v: Math.round((1 / U.fill - 1) * 100) }));
        if (U.monthly) fx.push(t('ps_upMonthly', { v: yen(U.monthly * Math.max(1, p.units.length)) }));
        if (U.wear) fx.push(t('ps_upWear'));
        k.card(y, 50, done ? '#eaf7ef' : null);
        k.text(L.t('up_' + id), k.x + 4, y + 16, 11.5, C.ink, 900);
        k.text(fx.join('・'), k.x + 4, y + 34, 9.5, C.soft, 700);
        if (done) k.text(t('ps_upDone'), k.x + k.w - 8 - 40, y + 25, 12, C.ok, 900);
        else k.btn({ x: k.x + k.w - 118, y: y + 8, w: 114, h: 34 }, t('ps_upDo', { v: yen(c) }), '#2bb8d8', function () {
          var r = dl.doUp(p.id, id);
          if (r.ok && QT.Sfx) QT.Sfx.play('buy');
        }, Es.cashFor(p) >= c);
        y += 56;
      });
      y = k.wrap(t('ps_g_up'), k.x, y, k.w, 9.5, C.soft) + 6;
    }
    var ops = g.ops;
    if (ops && (ops.stayOk(p) || p.ctr === 'stay')) {
      y = k.hr(y + 2);
      H.txt(t('ps_stay'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
      if (p.ctr === 'stay') {
        k.text(t('ps_stayNow', { o: Math.round((p.lastOcc || 0) * 100), r: yen(p.lastRev || 0), c: yen(p.lastStayCost || 0) }), k.x, y + 8, 11, '#e2508a', 900); y += 22;
        k.btn({ x: k.x + k.w - 190, y: y, w: 190, h: 34 }, t('ps_stayStop'), '#2bb8d8', function () { buildResult(ops.stopStay(p.id)); });
        y += 42;
      } else {
        var se = ops.stayEstimate(p), normal = Es.unitRent(p) * p.units.length * 0.86;
        k.text(t('ps_stayEst', { n: yen(se.night), o: Math.round(se.occ * 100), r: yen(se.rev), c: yen(se.cost) }), k.x, y + 8, 10.5, C.ink, 800); y += 18;
        k.text(t('ps_stayCmp', { s: yen(se.net), n: yen(normal) }), k.x, y + 8, 11, se.net > normal ? C.ok : C.bad, 900); y += 22;
        var inn = ops.innOk(p), ie = inn ? ops.stayEstimate(p, true) : null;
        if (ie) { k.text(t('ps_innEst', { s: yen(ie.net) }), k.x, y + 8, 11, ie.net > normal ? C.ok : C.bad, 900); y += 22; }
        var sc = ops.staySetup(p), ic = ops.staySetup(p, true), busy2 = p.units.some(function (un) { return un.occ; });
        if (busy2) { k.text(L.t('op_stayBusy'), k.x, y + 6, 10, C.bad, 800); y += 18; }
        var bw2 = inn ? (k.w - 8) / 2 : k.w;
        k.btn({ x: k.x, y: y, w: bw2, h: 36 }, t('ps_stayGo', { v: yen(sc) }), '#e2508a', function () { buildResult(ops.startStay(p.id, false)); }, !busy2 && Es.cashFor(p) >= sc);
        if (inn) k.btn({ x: k.x + bw2 + 8, y: y, w: bw2, h: 36 }, t('ps_innGo', { v: yen(ic) }), '#6f57e0', function () { buildResult(ops.startStay(p.id, true)); }, !busy2 && Es.cashFor(p) >= ic);
        y += 44;
      }
      y = k.wrap(t('ps_g_stay'), k.x, y, k.w, 9.5, C.soft) + 6;
    }
    if (ops && (ops.groundOk(p) || p.ctr === 'ground')) {
      y = k.hr(y + 2);
      H.txt(t('ps_ground'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
      if (p.ctr === 'ground') {
        k.text(t('ps_groundOn', { n: Math.max(0, Math.ceil((p.groundUntil - S.fin.month) / 12)), v: yen(ops.groundRent(p)) }), k.x, y + 8, 11.5, C.ok, 900); y += 24;
      } else {
        y = k.wrap(t('ps_groundLine', { v: yen(ops.groundRent(p)) }), k.x, y + 2, k.w, 10.5, C.ink, 800) + 2;
        k.btn({ x: k.x + k.w - 140, y: y, w: 140, h: 34 }, t('ps_groundGo'), '#2fbf7a', function () { buildResult(ops.startGround(p.id)); });
        y += 42;
      }
      y = k.wrap(t('ps_g_ground'), k.x, y, k.w, 9.5, C.soft) + 6;
    }
    if (K.struct && (p.cond || 0) > 0.3) {
      var rc = Es.repairCost(p), room = g.condo && g.condo.is(p), rw = room ? Math.min(k.w, 280) : 220;
      y += 4;
      k.btn({ x: k.x + k.w - rw, y: y, w: rw, h: 38 }, t(K.struct === 'eq' ? 'ps_washNew' : room ? 'ps_repairRoom' : 'ps_repair', { v: yen(rc) }), '#f2a63b',
            function () { Es.repair(p.id); }, Es.cashFor(p) >= rc);
      y += 48;
      if (room) y = k.wrap(t('ps_g_repairRoom'), k.x, y - 2, k.w, 9.5, C.soft) + 6;
    }
    var builds = p.ctr === 'ground' ? [] : Object.keys(E.BUILDS).filter(function (w) { return !!Es.buildPlan(p, w); });
    if (builds.length && !p.parking) {
      y = k.hr(y + 2);
      H.txt(t('ps_build'), k.x, y + 8, 12, C.ink, 'left', 900); y += 22;
      var busy = p.kind === 'shop' && p.units.some(function (un) { return un.occ; });
      if (busy) {
        var ec = Es.evictCost(p);
        y = k.wrap(t('ps_bBusy'), k.x, y + 2, k.w, 10.5, C.bad) + 4;
        k.btn({ x: k.x, y: y, w: k.w, h: 36 }, t('ps_bEvict', { v: yen(ec), n: E.EVICT_MONTHS }), '#f2a63b', function () { buildResult(Es.evict(p.id)); }, Es.cashFor(p) >= ec);
        y += 44;
      }
      builds.forEach(function (w) {
        var bq = Es.buildPlan(p, w), B = E.BUILDS[w];
        var best = null;
        Object.keys(E.LENDERS).forEach(function (l) {
          var lq = g.loanQuote(p, l, { build: w, cost: bq.cost, landNow: true });
          if (lq.ok && lq.max > 0 && (!best || lq.rate < best.rate)) best = lq;
        });
        var loanAmt = best ? Math.min(best.max, bq.cost) : 0;
        var cashOk = Es.cashFor(p) >= bq.cost, loanOk = !!best && Es.cashFor(p) + loanAmt >= bq.cost;
        var short = !busy && !cashOk && !loanOk;
        k.card(y, short ? 90 : 74);
        k.text(L.nm(B), k.x + 4, y + 16, 12, C.ink, 900);
        k.text(t('ps_bLine', { c: yen(bq.cost), m: bq.months, r: yen(bq.revFull) }), k.x + 4, y + 34, 10, C.soft, 700);
        var by = y + 44;
        k.btn({ x: k.x + k.w - 210, y: by - 2, w: 92, h: 28 }, t('ps_bCash'), '#2fbf7a', function () { buildResult(Es.startBuild(p.id, w, null)); }, cashOk && !busy);
        if (best) k.btn({ x: k.x + k.w - 114, y: by - 2, w: 114, h: 28 }, t('ps_bLoan', { l: L.nm(E.LENDERS[best.lender]) }), '#1f5fbf',
                        function () { buildResult(Es.startBuild(p.id, w, { lender: best.lender, amount: loanAmt, kind: 'var' })); }, loanOk && !busy);
        if (short) k.text(best ? t('ps_bShort', { c: yen(bq.cost), l: yen(bq.cost - loanAmt) }) : t('ps_bShortC', { c: yen(bq.cost) }),
                          k.x + 4, by + 38, 10, C.bad, 800);
        y += short ? 98 : 82;
      });
    }
    y = k.hr(y + 4);
    H.txt(t('ps_sell'), k.x, y + 8, 12, C.ink, 'left', 900); y += 20;
    if (p.sale && p.sale.mine) {
      k.text(t('ps_listed', { v: yen(p.sale.price) }), k.x, y + 8, 11.5, C.gold, 900); y += 18;
      k.btn({ x: k.x + k.w - 110, y: y, w: 110, h: 34 }, t('ps_unlist'), '#9a94ad', function () { Es.unlist(p.id); });
      y += 44;
    } else {
      var v = Es.value(p);
      var bw = (k.w - 12) / 3;
      [['fast', 0.92, 'ps_sFast'], ['market', 1, 'ps_sMkt'], ['high', 1.1, 'ps_sHigh']].forEach(function (o, i) {
        k.btn({ x: k.x + i * (bw + 6), y: y, w: bw, h: 38 }, t(o[2], { v: yen(Math.round(v * o[1] / 100000) * 100000) }),
              i === 0 ? '#e2504a' : i === 1 ? '#f2a63b' : '#c98f0f', function () { Es.list(p.id, o[0]); });
      });
      y += 48;
    }
    y = k.wrap(t(p.owner === 'co' ? 'hj_lLong' : 'ps_g_sell'), k.x, y, k.w, 9.5, C.soft) + 6;
    return y;
  }
  function buildResult(r) {
    if (!r) return;
    if (r.ok) { if (QT.Sfx) QT.Sfx.play('buy'); return; }
    var S = QT.G.S;
    if (r.why) QT.G.toast({ x: S.player.x, y: S.player.y - 30 }, r.why, '#e2504a', { big: true });
    if (QT.Sfx) QT.Sfx.play('bad');
  }
  QT.PropSheet = { recommend: recommend, simulate: simulate };
  QT.Sheet.make('propsheet', {
    height: 0.8,
    onOpen: function (id) { plan = recommend(id); },
    title: function (S, id) { var p = P(S, id); return p ? G().estate.name(p) : ''; },
    sub: function (S, id) {
      var p = P(S, id); if (!p) return '';
      if (p.inh) return t('ps_inhSub');
      var a = G().estate.areaOf(p), K = E.KINDS[p.kind];
      return (p.lux ? t('ps_lux') : L.nm(K)) + (a && a.sub ? '・' + L.nm(a, 'sub') : '');
    },
    body: function (S, H, k, id) {
      var p = P(S, id);
      if (!p) return 0;
      var y = drawNumbers(S, H, k, p, k.y);
      if (p.own && p.inh && p.inh.mode === 'akiya') {
        y = k.wrap(t('ps_inhAkiya'), k.x, y + 10, k.w, 11, k.C.ink, 800) + 6;
        k.btn({ x: k.x + k.w - 160, y: y, w: 160, h: 36 }, t('ps_inhGo'), '#8a7fb8', function () { QT.UI.show('jikka'); });
        return k.used(y + 48);
      }
      if (p.own) y = drawOwn(S, H, k, p, y);
      else if (p.sale) y = drawBuy(S, H, k, p, y);
      else { k.text(t('ps_otherOwned'), k.x, y + 10, 11, k.C.soft); y += 30; }
      return k.used(y + 56);
    }
  });
})(window.QT || (window.QT = {}));
