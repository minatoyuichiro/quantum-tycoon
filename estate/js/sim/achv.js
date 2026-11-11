(function (QT) {
  'use strict';
  var G = QT.G, S = G.S, L = QT.L, E = QT.Data.ESTATE;
  L.add({
    av_first:     ['はじめての物件', 'First property'],
    av_firstH:    ['不動産会社か、街の「売」の札の物件を1つ買う', 'Buy one property at the agency or a "Sale" sign'],
    av_firstL:    ['物件の値段のほかに、仲介手数料や登記などの諸費用（値段の7%ほど）がかかる', 'Besides the price you pay fees — brokerage, registration and so on (about 7%)'],
    av_naiken:    ['自分で内見を案内', 'Showed a viewing yourself'],
    av_naikenH:   ['空室に「内見の予約」が来たら、時間内に行って案内する', 'When a viewing is booked for a vacancy, get there in time'],
    av_naikenL:   ['自分で案内すると決まりやすく、仲介会社に払う広告料（家賃1か月ほど）も浮く', 'Showing it yourself fills it faster and saves the ad fee (about a month of rent)'],
    av_self:      ['困りごとを自分で解決', 'Fixed a problem yourself'],
    av_selfH:     ['自主管理にして、物件に出た困りごとに行って対応する', 'Self-manage and go sort out a tenant problem'],
    av_selfL:     ['自主管理なら管理料（家賃の5%ほど）が浮くが、困りごとには自分で駆けつける', 'Self-managing saves the fee (about 5% of rent), but you handle problems yourself'],
    av_ittou:     ['はじめての一棟', 'First whole building'],
    av_ittouH:    ['一棟アパート・一棟マンション・オフィスビルを買うか建てる', 'Buy or build an apartment block, building or office building'],
    av_ittouL:    ['一棟は部屋が多いので、1室空いても家賃はゼロにならない（区分は1室空くとゼロ）', 'With many units one vacancy never takes rent to zero (a single unit does)'],
    av_full10:    ['満室 10室', '10 units, all full'],
    av_full10H:   ['部屋を10室以上持って、全部に入居者がいる月末を迎える', 'Own 10+ units and end a month with every one let'],
    av_full10L:   ['空室でも管理費や税はかかる。満室を保つのが大家のいちばんの仕事', 'Empty rooms still cost fees and tax. Keeping them full is the job'],
    av_horidashi: ['掘り出し物を買った', 'Snapped up a bargain'],
    av_horidashiH:['上の帯に「掘り出し物」の札が出たら、時間内に行って買う', 'When a bargain card appears at the top, get there and buy in time'],
    av_horidashiL:['相続や転勤で急いで売る人の物件は安いことがある。傷みは内見で確かめよう', 'Rushed sellers (inheritance, transfers) sell cheap — inspect for hidden damage'],
    av_sashine15: ['指値 −15% で買えた', 'Bought at 15% off'],
    av_sashine15H:['売物件のシートの［指値］で −15% を出し、通ったら買う', 'Offer 15% off in the listing sheet, and buy if they accept'],
    av_sashine15L:['売り出しが長い物件や相場より高い物件は、値下げに応じてもらいやすい', 'Long-listed or overpriced places are the ones that take a lower offer'],
    av_valueup:   ['バリューアップ', 'Value-up'],
    av_valueupH:  ['持っている物件のシートで、設備を足す（ネット無料・宅配ボックスなど）', 'Add a feature in a property sheet (free Wi-Fi, parcel box…)'],
    av_valueupL:  ['人気の設備を足すと、次の入居者から家賃を上げられる', 'Popular features let you raise the rent for the next tenant'],
    av_lux:       ['はじめての高級マンション', 'First luxury flat'],
    av_luxH:      ['都心のタワーマンションや高級レジデンスの部屋を買う', 'Buy a unit in a downtown tower or luxury residence'],
    av_luxL:      ['高級マンションは利回りが低め（4%前後）で、家賃より値上がりをねらう物件', 'Luxury flats yield little (around 4%); you buy them for price growth'],
    av_build:     ['空き地に建てた', 'Built on a vacant lot'],
    av_buildH:    ['空き地を買って、アパート・戸建て・オフィスビルを建てる', 'Buy a lot and build apartments, a house or an office building'],
    av_buildL:    ['新築は工事のあいだ家賃が入らないが、修繕が少なく、減価償却も長く取れる', 'No rent while building, but new buildings need few repairs and depreciate longer'],
    av_cpark:     ['コインパーキング', 'Coin parking'],
    av_cparkH:    ['コインパーキングを買うか、空き地をコインパーキングにする', 'Buy coin parking, or turn a lot into one'],
    av_cparkL:    ['建物がいらず、いつでも更地に戻せる。土地の使い道を決めるまでのつなぎにも向く', 'No building, easy to clear — a good stopgap while you decide what to do with the land'],
    av_minpaku:   ['民泊を始めた', 'Opened a short-stay'],
    av_minpakuH:  ['空いている戸建てか一棟アパートを、民泊に切り替える', 'Switch an empty house or apartment block to short-stay'],
    av_minpakuL:  ['民泊（住宅宿泊事業）は年180日まで。通年で貸すには旅館業の許可（簡易宿所）が要る', 'Home-sharing is capped at 180 nights a year; all year needs an inn licence'],
    av_shakuchi:  ['借地で貸した', 'Leased out land'],
    av_shakuchiH: ['持っている空き地を、借地（事業用定期借地）で貸す', 'Lease out a lot you own on a fixed-term land lease'],
    av_shakuchiL: ['事業用定期借地は土地だけを10年以上50年未満貸す方法で、期間が終わると更地で戻ってくる', 'A business land lease runs 10–50 years and the land comes back cleared'],
    av_corp:      ['法人に貸した', 'Leased to a company'],
    av_corpH:     ['法人から借り上げの申し込みが来たら受ける（社宅・ビルの一棟貸し）', 'Accept a company lease offer (staff housing or a whole building)'],
    av_corpL:     ['会社が借りる社宅は、家賃が少し安くても長く住んでもらえて、滞納の心配が少ない', 'Company leases pay a little less but stay long and rarely miss rent'],
    av_kuriage:   ['繰上返済', 'Prepaid a loan'],
    av_kuriageH:  ['銀行のシートで、ローンを繰上返済する', 'Prepay a loan in the bank sheet'],
    av_kuriageL:  ['期間短縮型の繰上返済は、返した元金にかかるはずだった利息がまるごと浮く', 'Prepaying (shortening the term) saves all the interest that principal would have cost'],
    av_karikae:   ['借り換え', 'Refinanced'],
    av_karikaeH:  ['銀行から借り換えの提案が来たら受ける', 'Accept a refinancing offer from a bank'],
    av_karikaeL:  ['金利の高いローンは借り換えると利息が減る。手数料と比べて得かを確かめよう', 'Refinancing a pricey loan cuts interest — check it beats the fee'],
    av_jiko:      ['事故物件を乗り越えた', 'Re-let a stigmatised unit'],
    av_jikoH:     ['孤独死のあった部屋（事故物件）に、次の入居者を決める', 'Find a new tenant for a unit where someone died alone'],
    av_jikoL:     ['特殊清掃をした部屋は、賃貸ならおおむね3年、次の借り手に告げる（国のガイドライン）', 'After special cleaning, rentals must disclose it for about 3 years (national guideline)'],
    av_kinri2:    ['金利 2% でも黒字', 'In the black at 2%'],
    av_kinri2H:   ['基準金利が2%まで上がっても、変動のローンを借りたまま家賃の手取りをプラスに保つ', 'Keep net rent positive with a variable loan when the base rate hits 2%'],
    av_kinri2L:   ['変動金利は上がると返済が増える。借りる前に「+2%でも手取りがプラスか」を見ておこう', 'Variable rates raise payments. Before borrowing, check you still profit at +2%'],
    av_blue65:    ['青色申告 65万円', 'Blue return: ¥650k'],
    av_blue65H:   ['5棟10室（事業的規模）まで増やし、黒字で確定申告を迎える', 'Grow to 5 buildings / 10 units and file a profitable return'],
    av_blue65L:   ['事業的規模で複式簿記の帳簿をつけ、e-Taxで出すと、所得から65万円引ける', 'At business scale with double-entry books filed by e-Tax, you deduct ¥650k'],
    av_long:      ['5年を超えて売った', 'Sold after 5 years'],
    av_longH:     ['買ってから5年を超えた物件を、利益が出る値段で売る', 'Sell a property held over 5 years at a profit'],
    av_longL:     ['売った年の1月1日で5年を超えていると、利益にかかる税が約39%から約20%になる', 'Held over 5 years on 1 Jan of the sale year, the tax on the gain drops from ~39% to ~20%'],
    av_jiyu:      ['経済的自由', 'Financial freedom'],
    av_jiyuH:     ['家賃の手取りが、生活費を3か月続けて超える', 'Net rent beats living costs for 3 months in a row'],
    av_jiyuL:     ['家賃の手取りで暮らしをまかなえれば、働き方を自由に選べる', 'When rent pays for your life, you choose how to work'],
    av_oku:       ['億り人', 'Hundred-millionaire'],
    av_okuH:      ['純資産（物件の時価＋現金−借入）を1億円にする', 'Reach ¥100M net worth (property value + cash − debt)'],
    av_okuL:      ['借りて物件を増やしても純資産は増えない。返済と値上がりで少しずつ増える', 'Borrowing to buy does not raise net worth; repayments and rising prices do'],
    av_jikka:     ['実家を受け継いだ', 'Inherited the family home'],
    av_jikkaH:    ['両親から実家を受け継ぐ（年をとると、いつか来る）', 'Inherit the family home from your parents (it comes with age)'],
    av_jikkaL:    ['相続した家は、貸す・売る・空き家のままから選ぶ。空き家でも税と手入れがかかる', 'An inherited home can be let, sold or kept empty — empty still costs tax and upkeep'],
    av_hojin:     ['法人化', 'Incorporated'],
    av_hojinH:    ['資産管理会社をつくって、物件を会社で持つ', 'Set up a holding company to own your properties'],
    av_hojinL:    ['所得が増えると、個人より法人のほうが税率が低くなることがある', 'Once income is high, a company can pay a lower tax rate than you'],
    av_done:      ['実績「{t}」', 'Achievement: {t}']
  });
  var DEFS = [
    { id: 'first' }, { id: 'naiken' }, { id: 'self' }, { id: 'ittou' }, { id: 'full10' },
    { id: 'horidashi' }, { id: 'sashine15' }, { id: 'valueup' }, { id: 'lux' }, { id: 'build' },
    { id: 'cpark' }, { id: 'minpaku' }, { id: 'shakuchi' }, { id: 'corp' }, { id: 'kuriage' },
    { id: 'karikae' }, { id: 'jiko' }, { id: 'kinri2' }, { id: 'blue65' }, { id: 'long' },
    { id: 'jiyu' }, { id: 'oku' }, { id: 'jikka' },
    { id: 'hojin', avail: function () { return !!G.hojin; } }
  ];
  var BY = {};
  DEFS.forEach(function (d) { BY[d.id] = d; });
  var ITTOU = { apa: 1, man: 1, ob: 1 };
  var BUILD = { apa: 1, ko: 1, ob: 1 };
  var FULL_N = 10;
  var KINRI = 0.02;
  var OKU = 100000000;
  function st() { return S.achv || (S.achv = { got: {}, unseen: 0 }); }
  function has(id) { return !!st().got[id]; }
  function avail(d) { return !d.avail || d.avail(); }
  function give(id, quiet) {
    var a = st();
    if (!BY[id] || a.got[id] || !S.life || !S.life.chosen) return false;
    a.got[id] = { m: quiet ? null : S.fin.month, age: quiet ? null : S.life.age };
    if (!quiet) {
      a.unseen = (a.unseen || 0) + 1; a.last = id;
      G.emit('achv', { id: id });
    }
    return true;
  }
  G.on('propBought', function (e) {
    var p = e && e.p;
    if (!p) return;
    if (!p.inh) give('first');
    if (ITTOU[p.kind]) give('ittou');
    if (p.lux) give('lux');
    if (p.kind === 'cpark') give('cpark');
    var n = e.sale && e.sale.nego;
    if (n && n.pct >= 15 && n.res === 'ok') give('sashine15');
  });
  G.on('dealWin', function (e) {
    if (!e) return;
    if (e.kind === 'deal') give('horidashi');
    else if (e.kind === 'view') give('naiken');
  });
  G.on('troubleFixed', function () { give('self'); });
  G.on('valueUp', function () { give('valueup'); });
  G.on('built', function (e) {
    var p = e && e.p;
    if (!p) return;
    if (BUILD[p.kind]) give('build');
    if (ITTOU[p.kind]) give('ittou');
    if (p.kind === 'cpark') give('cpark');
  });
  G.on('stayStart', function () { give('minpaku'); });
  G.on('groundStart', function () { give('shakuchi'); });
  G.on('corpStart', function () { give('corp'); });
  G.on('loanPrepay', function () { give('kuriage'); });
  G.on('refi', function () { give('karikae'); });
  G.on('moveIn', function (e) { var p = e && e.p; if (p && p.own && p.stigma && p.stigma > S.fin.month) give('jiko'); });
  G.on('taxFiled', function (r) { if (r && r.blue >= E.BLUE_BIG) give('blue65'); });
  G.on('propSold', function (e) { if (e && e.long && e.gain > 0 && !e.inh && !(e.p && e.p.inh)) give('long'); });
  G.on('freedom', function () { give('jiyu'); });
  G.on('inherit', function () { give('jikka'); });
  function sweep(quiet) {
    if (!S.life || !S.life.chosen || !G.estate) return;
    var own = G.estate.owned(), rooms = 0, empty = 0;
    own.forEach(function (p) {
      if (!p.inh) give('first', quiet);
      if (p.building) return;
      if (ITTOU[p.kind]) give('ittou', quiet);
      if (p.lux) give('lux', quiet);
      if (p.kind === 'cpark') give('cpark', quiet);
      if (p.ctr === 'stay') give('minpaku', quiet);
      if (p.ctr === 'ground') give('shakuchi', quiet);
      if (p.ctr === 'corp') give('corp', quiet);
      var u = G.estate.useOf(p);
      if ((u === 'home' || u === 'office') && p.ctr !== 'stay' && p.ctr !== 'sub' && !G.estate.akiya(p)) {
        (p.units || []).forEach(function (un) { rooms++; if (!un.occ) empty++; });
      }
    });
    if (rooms >= FULL_N && !empty) give('full10', quiet);
    if (S.rate && S.rate.base >= KINRI - 1e-6 && S.loans.some(function (l) { return l.kind === 'var'; }) && G.rentCF() > 0) give('kinri2', quiet);
    if (G.netWorth() >= OKU) give('oku', quiet);
    if (S.life.free) give('jiyu', quiet);
    if (S.inh && S.inh.done) give('jikka', quiet);
    if (quiet && S.deals && S.deals.n) {
      if (S.deals.n.view > 0) give('naiken', true);
      if (S.deals.n.deal > 0) give('horidashi', true);
      if (S.deals.n.up > 0) give('valueup', true);
    }
  }
  G.on('monthEnd', function () { if (S.achv && S.achv.backfill) return; sweep(false); });
  function list() {
    var a = st();
    return DEFS.filter(avail).map(function (d) { return { id: d.id, got: a.got[d.id] || null }; });
  }
  function count() {
    var a = st(), n = 0, m = 0;
    DEFS.forEach(function (d) { if (!avail(d)) return; m++; if (a.got[d.id]) n++; });
    return { n: n, m: m };
  }
  G.mod({
    id: 'achv', order: 95,
    reset: function (S) { S.achv = { got: {}, unseen: 0, last: null }; },
    load: function (S, o) {
      if (o && o.got) { S.achv = o; S.achv.unseen = o.unseen || 0; }
      else S.achv = { got: {}, unseen: 0, last: null, backfill: true };
    },
    save: function (S) { return { got: S.achv.got, unseen: S.achv.unseen || 0, last: S.achv.last || null }; },
    update: function (S) {
      if (S.achv && S.achv.backfill && S.life && S.life.chosen && S.fin) { S.achv.backfill = false; sweep(true); }
    }
  });
  G.achv = { DEFS: DEFS, has: has, give: give, list: list, count: count, sweep: sweep };
})(window.QT);
