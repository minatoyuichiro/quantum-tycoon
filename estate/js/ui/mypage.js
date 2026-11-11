(function (QT) {
  'use strict';
  var L = QT.L, E = QT.Data.ESTATE;
  function t(k, v) { return L.t(k, v); }
  L.add({
    mp_title:   ['マイページ', 'My page'],
    mp_sub:     ['{y}年目 {m}月・{a}歳・手元 {c}', 'Year {y} M{m} · age {a} · cash {c}'],
    mp_subCo:   ['{y}年目 {m}月・{a}歳・手元 {c}・会社 {d}', 'Year {y} M{m} · age {a} · cash {c} · company {d}'],
    mp_coTag:   ['会社', 'company'],
    mp_tabProps:['物件', 'Properties'],
    mp_tabLoans:['ローン', 'Loans'],
    mp_tabMkt:  ['相場', 'Market'],
    mp_noProps: ['まだ物件を持っていません。青山の不動産会社で相談しよう', 'No properties yet. Ask the property agency in Aoyama'],
    mp_total:   ['合計: 家賃 {r}・手取り {c}・時価 {v}', 'Total: rent {r} · net {c} · value {v}'],
    mp_row:     ['手取り {c}・{o}', 'net {c} · {o}'],
    mp_trouble: ['困りごと {n}', '{n} problems'],
    mp_build:   ['工事中', 'Building'],
    mp_sale:    ['売出中', 'Listed'],
    mp_noLoans: ['借入はありません', 'No loans'],
    mp_loanSum: ['借入 {b}・返済 月{m}', 'Debt {b} · {m}/mo'],
    mp_loanRow: ['{l}・{p}', '{l} · {p}'],
    mp_loanRow2:['残り{b}・月{m}・{r}%（{k}）・あと{n}年', '{b} left · {m}/mo · {r}% ({k}) · {n} yrs'],
    mp_card:    ['カードローン {v}（年15%）', 'Card loan {v} (15%/yr)'],
    mp_rate:    ['基準金利 {b}%・長期 {l}%', 'Base rate {b}% · long {l}%'],
    mp_distRow: ['地価 {i}・家賃 {r}', 'land {i} · rent {r}'],
    mp_g_mkt:   ['地価・家賃は始めたときを 100 とした数。金利が上がると利回りが上がり、物件の値段は下がりやすい', 'Land & rent indexes start at 100. Higher rates push yields up and prices down'],
    fi_title:   ['帳簿（青色申告）', 'Books (blue-form)'],
    fi_sub:     ['複式簿記。不動産の収支と、家計の出入りを1冊に', 'Double-entry: property income and household money in one book'],
    fi_tabPL:   ['損益', 'P&L'],
    fi_tabBS:   ['貸借', 'Balance'],
    fi_tabJR:   ['仕訳', 'Journal'],
    fi_thisYear:['{y}年目（今年）', 'Year {y} (this year)'],
    fi_lastYear:['{y}年目（去年）', 'Year {y} (last year)'],
    fi_rentRev: ['不動産の収入', 'Property income'],
    fi_rentExp: ['不動産の経費', 'Property expenses'],
    fi_rentInc: ['不動産所得', 'Property profit'],
    fi_home:    ['給料・年金', 'Salary & pension'],
    fi_homeOut: ['生活費・社会保険', 'Living & insurance'],
    fi_gain:    ['売った物件の損益', 'Gains on sales'],
    fi_tax:     ['所得税・住民税', 'Income taxes'],
    fi_net:     ['手元に残ったお金の増減（目安）', 'Net change (approx.)'],
    fi_assets:  ['資産', 'Assets'],
    fi_liab:    ['負債', 'Liabilities'],
    fi_equity:  ['元入金と今年の利益', 'Capital & this year'],
    fi_diff:    ['貸借の差（0 なら合っている）', 'Difference (0 = balanced)'],
    fi_noJr:    ['まだ仕訳がありません', 'No entries yet'],
    sc_title:   ['どこから始める?', 'Where do you start?'],
    sc_sub:     ['目的は安定収益。無理なく、家賃で暮らせるように', 'The goal is steady income — live off rent, without overreaching'],
    sc_pick:    ['この暮らしで始める', 'Start this life'],
    ht_title:   ['遊び方', 'How to play'],
    ht_sub:     ['家賃で暮らしをまかなえたら「経済的自由」', 'Reach financial freedom: let rent pay for your life'],
    ht_tab:     ['遊び方', 'How to'],
    ht_1t:      ['物件を見る', 'Look at a property'],
    ht_1:       ['街の黄色い「売」の札が売物件。前の光る丸に立つと内見できて、隠れた傷みが分かる', 'Yellow "Sale" signs mark properties for sale. Stand on the glowing circle in front to inspect and see hidden damage'],
    ht_2t:      ['買う', 'Buy'],
    ht_2:       ['物件のシートで払い方（現金か銀行のローン）を選んで［買う］。毎月の手取りがプラスになる物件を選ぼう', 'In the property sheet choose cash or a bank loan, then tap Buy. Pick places whose monthly net is positive'],
    ht_3t:      ['家賃が入る', 'Collect rent'],
    ht_3:       ['月末に家賃が入る。管理会社に任せれば自動でコインが飛んでくる。自主管理なら手数料が浮くけど、回収と困りごとに歩いて行く', 'Rent arrives at month end. With an agent it flies in automatically; self-managing saves fees but you walk over to collect and fix problems'],
    ht_4t:      ['増やす', 'Grow'],
    ht_4:       ['給料と家賃を貯めて次の物件へ。家賃の手取りが生活費を超えたら経済的自由（上のメーター）', 'Save salary and rent for the next property. When net rent beats living costs, you are free (the meter at the top)'],
    ht_5t:      ['チャンスを取りに行く', 'Grab your chances'],
    ht_5:       ['上の帯の札（内見の予約・掘り出し物）は時間内に行くと得をする。買う前に［指値］で値下げを、持っている物件は［バリューアップ］で家賃を上げよう', 'Timed cards at the top (viewings, bargains) pay off if you get there in time. Haggle before you buy, and upgrade what you own to raise rent'],
    ht_tip:     ['目標の帯を押すと、そこへ歩きます（別の地区なら電車で）。右下の電車で地区を移動、スマホで持っている物件と借入、グラフのボタンで帳簿', 'Tap the goal bar to walk there (by train if it is in another district). Train button: travel. Phone: your properties and loans. Chart button: your books'],
    ht_ok:      ['はじめる', "Let's go"]
  });
  function G() { return QT.G; }
  function yen(v) { return (v < 0 ? '-¥' : '¥') + QT.G.fmt(Math.abs(Math.round(v))); }
  QT.UI.panel('phone', {
    layer: 'btn',
    draw: function (S, H) {
      var r = H.btnRects().phone, c = H.ctx;
      c.save(); c.shadowColor = 'rgba(50,40,80,0.2)'; c.shadowBlur = 8; c.shadowOffsetY = 3;
      H.fillRR(r.x, r.y, r.w, r.h, 15, '#ffffff'); c.restore();
      H.strokeRR(r.x, r.y, r.w, r.h, 15, 'rgba(120,110,160,0.18)', 1);
      var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      H.fillRR(cx - 8, cy - 12, 16, 24, 4, '#6f57e0');
      H.fillRR(cx - 6, cy - 9, 12, 16, 2, '#ffffff');
      var tr = (G().estate ? G().estate.owned() : []).some(function (p) { return p.trouble && p.trouble.length; }) || (S.mkt && S.mkt.offer);
      if (tr) { c.fillStyle = '#e2504a'; c.beginPath(); c.arc(r.x + r.w - 6, r.y + 6, 5, 0, 7); c.fill(); }
      if (S.achv && S.achv.unseen > 0) { c.fillStyle = '#d39a12'; c.beginPath(); c.arc(r.x + 6, r.y + 6, 5, 0, 7); c.fill(); }
      QT.UI.tapRect(r, function () { QT.UI.show('mypage'); return true; });
    }
  });
  function tabsOf(list) {
    return list.map(function (e) { return { id: e[0], get label() { return t(e[1]); }, get label_en() { return t(e[1]); } }; });
  }
  QT.Sheet.make('mypage', {
    height: 0.8,
    tabs: tabsOf([['props', 'mp_tabProps'], ['trend', 'tr_tab'], ['loans', 'mp_tabLoans'], ['mkt', 'mp_tabMkt'], ['achv', 'av_tab'], ['howto', 'ht_tab']]),
    onOpen: function (arg, st) { if (arg && arg.tab) st.tab = arg.tab; },
    title: function () { return t('mp_title'); },
    sub: function (S) {
      var h = G().hudInfo(), hj = G().hojin;
      if (hj && hj.on()) return t('mp_subCo', { y: h.year, m: h.mon, a: h.age, c: yen(S.coins), d: yen(hj.cash()) });
      return t('mp_sub', { y: h.year, m: h.mon, a: h.age, c: yen(S.coins) });
    },
    body: function (S, H, k, arg, tab) {
      var g = G(), Es = g.estate, C = k.C, y = k.y + 4;
      if (tab === 'howto') return k.used(howtoBody(S, H, k));
      if (tab === 'trend') return k.used(QT.Trend ? QT.Trend.draw(S, H, k) : y);
      if (tab === 'achv') return k.used(QT.Achv ? QT.Achv.draw(S, H, k, arg) : y);
      if (tab === 'props') {
        var own = Es.owned();
        if (!own.length) { y = k.wrap(t('mp_noProps'), k.x, y + 10, k.w, 11.5, C.soft) + 6; return k.used(y); }
        var tv = 0; own.forEach(function (p) { tv += Es.value(p); });
        k.text(t('mp_total', { r: yen(g.rentNow()), c: yen(g.rentCF()), v: yen(tv) }), k.x, y + 8, 11, C.ink, 800);
        y += 24;
        own.forEach(function (p) {
          var cf = Es.cf(p), occ = p.units && p.units.length ? p.units.filter(function (x) { return x.occ; }).length + '/' + p.units.length : '';
          if (p.ctr === 'sub') occ = t('ps_subOn', { v: yen(p.subRent) });
          var tag = p.building ? t('mp_build') : p.sale ? t('mp_sale') : p.trouble.length ? t('mp_trouble', { n: p.trouble.length }) : '';
          if (p.owner === 'co') tag = t('mp_coTag') + (tag ? '・' + tag : '');
          k.card(y, 50, p.trouble.length ? '#fff1f0' : null);
          k.text(Es.name(p), k.x + 2, y + 15, 12, C.ink, 900);
          k.text(t('mp_row', { c: yen(cf), o: occ }) + (tag ? '・' + tag : ''), k.x + 2, y + 34, 10.5, cf >= 0 ? C.ok : C.bad, 800);
          k.btn({ x: k.x + k.w - 62, y: y + 9, w: 60, h: 32 }, t('ag_go'), '#1f5fbf', function () { QT.UI.show('propsheet', p.id); });
          y += 56;
        });
        return k.used(y);
      }
      if (tab === 'loans') {
        if (!S.loans.length && !g.bal(215)) { k.text(t('mp_noLoans'), k.x, y + 10, 11.5, C.soft); return k.used(y + 30); }
        k.text(t('mp_loanSum', { b: yen(g.loanDebt ? g.loanDebt() : g.bal(210)), m: yen(g.loanPayNow()) }), k.x, y + 8, 12, C.ink, 900); y += 26;
        if (g.bal(215) > 0) { k.text(t('mp_card', { v: yen(g.bal(215)) }), k.x, y + 4, 11, C.bad, 900); y += 20; }
        S.loans.forEach(function (ln) {
          var p = S.props[ln.prop];
          k.card(y, 50);
          k.text(t('mp_loanRow', { l: L.nm(E.LENDERS[ln.lender]), p: (p ? Es.name(p) : '—') + (ln.owner === 'co' ? t('bk_coLoan') : '') }), k.x + 2, y + 15, 11.5, C.ink, 900);
          k.text(t('mp_loanRow2', { b: yen(ln.bal), m: yen(ln.pay), r: (ln.rate * 100).toFixed(2), k: t(ln.kind === 'fix' ? 'bk_fix' : 'bk_var'), n: Math.ceil(ln.left / 12) }),
                 k.x + 2, y + 34, 10, C.soft, 700);
          y += 56;
        });
        return k.used(y);
      }
      k.text(t('mp_rate', { b: (S.rate.base * 100).toFixed(2), l: (S.rate.long * 100).toFixed(2) }), k.x, y + 8, 12, C.ink, 900);
      y += 26;
      QT.World.DISTRICTS.forEach(function (d) {
        var D = E.DIST[d.id]; if (!D) return;
        var i = Math.round((S.mkt.idx[d.id] || 1) * 100), r = Math.round((S.mkt.ridx[d.id] || 1) * 100);
        k.text(L.nm(d), k.x, y + 8, 11, C.ink, 800);
        H.txt(t('mp_distRow', { i: i, r: r }), k.x + k.w, y + 8, 10.5, i >= 100 ? C.ok : C.bad, 'right', 800);
        y += 20;
      });
      y = k.wrap(t('mp_g_mkt'), k.x, y + 6, k.w, 9.5, C.soft) + 4;
      return k.used(y);
    }
  });
  QT.Sheet.make('finance', {
    height: 0.8,
    tabs: tabsOf([['pl', 'fi_tabPL'], ['bs', 'fi_tabBS'], ['jr', 'fi_tabJR'], ['co', 'fi_tabCo']]).map(function (tb) {
      if (tb.id === 'co') tb.show = function (S) { return !!(S.hojin && S.hojin.gl); };
      return tb;
    }),
    onOpen: function (arg, st) { if (arg && arg.tab) st.tab = arg.tab; },
    title: function () { return t('fi_title'); },
    sub: function () { return t('fi_sub'); },
    body: function (S, H, k, arg, tab) {
      var g = G(), B = g.books, C = k.C, y = k.y + 4;
      if (tab === 'co') return k.used(QT.Hojin ? QT.Hojin.drawBooks(S, H, k) : y);
      if (tab === 'pl') {
        [[B.yearPL(), t('fi_thisYear', { y: S.yr.n })], [B.prevPL(), S.yr.n > 1 ? t('fi_lastYear', { y: S.yr.n - 1 }) : null]].forEach(function (e) {
          var pl = e[0]; if (!pl || !e[1]) return;
          H.txt(e[1], k.x, y + 8, 12.5, C.ink, 'left', 900); y += 24;
          y = k.line(t('fi_rentRev'), yen(pl.rentRev), y, C.ok);
          y = k.line(t('fi_rentExp'), '-' + yen(pl.rentExp), y, C.bad);
          y = k.line(t('fi_rentInc'), yen(pl.rentIncome), y, pl.rentIncome >= 0 ? C.ok : C.bad, 12.5);
          y = k.line(t('fi_home'), yen(pl.home), y);
          y = k.line(t('fi_homeOut'), '-' + yen(pl.homeOut), y, C.bad);
          if (pl.gain) y = k.line(t('fi_gain'), yen(pl.gain), y, pl.gain >= 0 ? C.ok : C.bad);
          if (pl.tax) y = k.line(t('fi_tax'), '-' + yen(pl.tax), y, C.bad);
          y = k.line(t('fi_net'), yen(pl.net), y, pl.net >= 0 ? C.ok : C.bad, 12.5);
          Object.keys(pl.by).map(Number).sort(function (a, b) { return a - b; }).forEach(function (c) {
            if (!pl.by[c]) return;
            H.txt(B.name(c), k.x + 12, y, 10, C.soft, 'left', 700);
            H.txt(yen(pl.by[c]), k.x + k.w, y, 10, C.soft, 'right', 700);
            y += 15;
          });
          y = k.hr(y + 4);
        });
        return k.used(y);
      }
      if (tab === 'bs') {
        var bs = B.bs();
        [['A', 'fi_assets'], ['L', 'fi_liab']].forEach(function (grp) {
          H.txt(t(grp[1]), k.x, y + 8, 12.5, C.ink, 'left', 900); y += 22;
          B.CODES.forEach(function (c) {
            var ty = B.type(c), v = S.gl[c];
            if (!v) return;
            if (grp[0] === 'A' ? ty !== 'A' && ty !== 'XA' : ty !== 'L') return;
            y = k.line(B.name(c), (ty === 'XA' ? '-' : '') + yen(v), y);
          });
          y = k.line(t(grp[1]), yen(grp[0] === 'A' ? bs.assets : bs.liab), y, C.ink, 12.5);
          y = k.hr(y + 2);
        });
        y = k.line(t('fi_equity'), yen(bs.equity), y, C.ink, 12.5);
        y = k.line(t('fi_diff'), yen(bs.diff), y, bs.diff === 0 ? C.ok : C.bad);
        return k.used(y);
      }
      var jr = S.jr.slice(-40).reverse();
      if (!jr.length) { k.text(t('fi_noJr'), k.x, y + 10, 11, C.soft); return k.used(y + 30); }
      jr.forEach(function (e) {
        H.txt(e.mo + '', k.x, y + 8, 9.5, C.soft, 'left', 700);
        k.text(B.name(e.dr) + ' / ' + B.name(e.cr), k.x + 26, y + 8, 10.5, C.ink, 700);
        H.txt(yen(e.v), k.x + k.w, y + 8, 10.5, C.ink, 'right', 800);
        y += 20;
      });
      return k.used(y);
    }
  });
  var COLS = ['#f2a63b', '#2fbf7a', '#f5b21c', '#1f5fbf', '#e2508a'];
  function howtoBody(S, H, k) {
    var C = k.C, y = k.y + 4;
    [1, 2, 3, 4, 5].forEach(function (n) {
      k.card(y, 0);
      H.ctx.fillStyle = COLS[n - 1]; H.ctx.beginPath(); H.ctx.arc(k.x + 14, y + 16, 13, 0, 7); H.ctx.fill();
      H.txt(String(n), k.x + 14, y + 16, 14, '#ffffff', 'center', 900);
      k.text(t('ht_' + n + 't'), k.x + 36, y + 16, 14, C.ink, 900);
      y = k.wrap(t('ht_' + n), k.x + 36, y + 36, k.w - 36, 11, C.soft, 700) + 12;
    });
    y = k.hr(y);
    y = k.wrap(t('ht_tip'), k.x, y + 6, k.w, 10.5, C.blue, 700) + 8;
    return y;
  }
  var htPanel = QT.Sheet.make('howto', {
    height: 0.82,
    title: function () { return t('ht_title'); },
    sub: function () { return t('ht_sub'); },
    body: function (S, H, k) {
      var y = howtoBody(S, H, k);
      k.btn({ x: k.x + k.w - 160, y: y, w: 160, h: 42 }, t('ht_ok'), '#2fbf7a', function () { htPanel.close(); });
      return k.used(y + 54);
    }
  });
  var SC_COL = { worker: ['#eef5ff', '#1f5fbf'], pension: ['#fff6ea', '#e2a04a'], founder: ['#eaf7ef', '#2a9d63'] };
  var scPanel = QT.Sheet.make('startcard', {
    height: 0.8,
    title: function () { return t('sc_title'); },
    sub: function () { return t('sc_sub'); },
    body: function (S, H, k) {
      var C = k.C, y = k.y + 4;
      Object.keys(E.STARTS).forEach(function (id) {
        var st = E.STARTS[id];
        var col = SC_COL[id] || SC_COL.pension;
        k.card(y, 118, col[0]);
        k.text(L.nm(st), k.x + 4, y + 20, 16, C.ink, 900);
        var yy = k.wrap(L.nm(st, 'sub'), k.x + 4, y + 42, k.w - 8, 11, C.soft, 700);
        k.btn({ x: k.x + k.w - 180, y: Math.max(yy + 4, y + 70), w: 176, h: 38 }, t('sc_pick'), col[1], function () {
          QT.G.lifeBegin(id);
          scPanel.close();
          setTimeout(function () { QT.UI.show('howto'); }, 260);
        });
        y += 128;
      });
      return k.used(y);
    }
  });
  QT.UI.panel('startcardWatch', {
    layer: 'hud',
    draw: function (S) {
      if (S.life && !S.life.chosen && !scPanel.isOpen() && !S.won) scPanel.open();
      else if (S.life && S.life.chosen && scPanel.isOpen()) scPanel.close();
    }
  });
})(window.QT || (window.QT = {}));
