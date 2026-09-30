/* =================================================================
 * Tuote: määrävalitsin (genero/add-to-cart), tuoterivi
 * (genero/product-card) ja tuotelista (gds/product-list).
 * Speksi: 06-tuoterivi.md, korivariantti 07-ostoskori.md.
 *
 * Tuoterivin layout on B Kortti (päätös 30.9.2026) sekä listassa että
 * korissa. "kauppa", "a" ja "c" jäävät vertailuun (Tuoterivin layoutit).
 *
 * Tapahtumat:  sn:qty     { name, sku, qty, prev }
 *              sn:details { name, open }
 *              sn:remove  { name, sku, qty }  ·  sn:undo { name, sku, qty }
 *              sn:rowaction { act, name, sku }   (esim. changedate)
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, t, cls, num, fmt, UI } = SN;

  const unitLabel = (u) => UI.units[u] || u;
  const intOrNull = (v) => (v === "" || v == null || isNaN(parseInt(v, 10))) ? null : parseInt(v, 10);
  const isBatch = (v) => v === "boost" || v === "outlet";
  const BLOCKING = ["soldout", "unavailable", "expired"];   /* korin rivi ei ole mukana summassa */

  /* ── Määrävalitsin ─────────────────────────────────────────────────
     Ei "n kpl korissa" -tekstiä (päätös 30.9.2026): määrä näkyy kentässä.
     Katto näkyy pysyvästi, kun määrä = saldo (päätös 30.9.2026). */
  function noteHtml(qty, stock, unit) {
    if (stock != null && stock > 0 && qty >= stock) return '<span class="atc__note--cap">' + esc(t(UI.qty.cap, { stock, unit, unitEnd: SN.unitEnd(unit) })) + '</span>';
    return "";
  }

  SN.register("quantity", {
    defaults: { name: "Broileririsotto 360g", qty: 0, stock: "", unit: "kpl", disabled: false, busy: false, showUnit: false, showNote: true, mode: "ok" },
    render(a) {
      const stock = intOrNull(a.stock), qty = Math.max(0, parseInt(a.qty, 10) || 0), u = unitLabel(a.unit);
      const dis = a.disabled || a.busy || a.mode === "nodate";
      const atCap = stock != null && qty >= stock;
      const nid = SN.uid("qn");
      return '<div class="atc-wrap">' +
        '<div class="atc" data-sn="quantity" data-qty="' + qty + '" data-name="' + esc(a.name) + '" data-unit="' + esc(u) + '"' +
          (stock != null ? ' data-stock="' + stock + '"' : "") + (a.sku ? ' data-sku="' + esc(a.sku) + '"' : "") +
          (a.busy ? ' aria-busy="true"' : "") + '>' +
          '<button type="button" data-act="minus" aria-label="' + esc(t(UI.qty.minus, { name: a.name })) + '"' + (dis || qty <= 0 ? " disabled" : "") + '>' + ico("circleMinus") + '</button>' +
          '<input type="number" inputmode="numeric" min="0" step="1" value="' + qty + '"' + (stock != null ? ' max="' + stock + '"' : "") +
            ' aria-label="' + esc(t(UI.qty.field, { name: a.name, unit: u })) + '"' + (a.showNote ? ' aria-describedby="' + nid + '"' : "") + (dis ? " disabled" : "") + '>' +
          '<button type="button" data-act="plus" aria-label="' + esc(t(UI.qty.plus, { name: a.name })) + '"' + (a.showNote ? ' aria-describedby="' + nid + '"' : "") + (dis || atCap ? " disabled" : "") + '>' + ico("circlePlus") + '</button>' +
        '</div>' +
        (a.showUnit ? '<div class="atc__unit" aria-hidden="true">' + esc(u) + '</div>' : "") +
        (a.showNote ? '<div class="atc__note" id="' + nid + '">' + (a.busy ? '<span class="atc__note--muted">' + esc(UI.qty.saving) + '</span>' : noteHtml(qty, stock, u)) + '</div>' : "") +
      '</div>';
    }
  });

  /* ── Tuoterivin osat ───────────────────────────────────────────── */
  function discountOf(a) {
    if (!a.regular || !a.price) return null;
    return Math.round((1 - num(a.price) / num(a.regular)) * 100);
  }
  /* Merkintä kertoo alennuksen: Boost/Outlet-erä ja kampanja (retail-haara, gds/product-card/badges). */
  function badge(a, d) {
    const type = isBatch(a.variant) ? a.variant : (a.variant === "campaign" && d != null ? "campaign" : "");
    return type ? SN.render("badge", { type, discount: d, label: d != null ? t(UI.badgeDiscount[type], { discount: d }) : "" }) : "";
  }
  /* Kuva on koriste: nimi on näkyvissä vieressä, joten kuvapaikka ei puhu. */
  /* Tuotekuva (img = b2bshopin kuva-URL, lib/data/products.js) tai paikkamerkki.
     alt tyhjä: nimi on heti vieressä linkkinä, kuva ei tuo lisätietoa. */
  /* Ilman img-argumenttia kuva haetaan tuotedatasta SKU:lla, jos data on ladattu
     (load.js data-with="data/products"). img: false = aina paikkamerkki. */
  /* WordPressin 150 × 150 -versio (alkuperäinen jopa 3,8 Mt; rivillä kuva on 64–72 px) */
  const thumbUrl = (u) => /\/app\/uploads\//.test(u) && !/-\d+x\d+\.\w+$/.test(u)
    ? u.replace(/-scaled(\.\w+)$/, "$1").replace(/(\.\w+)$/, "-150x150$1") : u;
  const imgOf = (a) => thumbUrl(a.img === false ? "" : a.img || (SN.product && (SN.product(a.sku) || {}).img) || "");
  const media = (a) => imgOf(a)
    ? '<img class="pch-img" src="' + esc(imgOf(a)) + '" alt="" loading="lazy" decoding="async">'
    : '<div class="ph" aria-hidden="true">' + ico("image") + '</div>';
  function thumb(a, d) {
    return '<div class="pch-media">' + media(a) + badge(a, d) + '</div>';
  }
  function changeDateBtn(label) {
    return '<button type="button" class="link" data-act="changedate" aria-haspopup="dialog">' + esc(label) + '</button>';
  }
  function price(a, d) {
    if (a.state === "nodate") return '<ul class="pch__price"><li class="pch__price-empty">' + changeDateBtn(UI.noDatePrice) + '</li></ul>';
    return '<ul class="pch__price"><li class="pch__price-value">' + esc(t(UI.priceUnit, { price: a.price, unit: unitLabel(a.priceUnit) })) + '</li>' +
      /* Normaalihinta yliviivattuna kuten WooCommercen alennushinta; ruudunlukijalle sana "Normaalihinta". */
      (a.regular && d != null ? '<li class="pch__price-compare"><span class="vh">' + esc(UI.compareSr) + ' </span><del>' + esc(t(UI.compare, { regular: a.regular, discount: d })) + '</del></li>' : "") + '</ul>';
  }
  function rowSum(a, qty) {
    const p = num(a.price) || 0;
    return a.priceUnit === "kg" ? qty * (num(a.kgPerUnit) || 1) * p : qty * p;
  }
  /* Arvio vain painotuotteelle: €/kg ja variableWeight ei ole false (kiinteäpainoinen kg-tuote = tarkka summa). */
  const isApprox = (a) => a.priceUnit === "kg" && a.variableWeight !== false && a.variableWeight !== "false";
  function sumHtml(a, qty) {
    const v = fmt(rowSum(a, qty));
    return isApprox(a) ? esc(t(UI.sumApprox, { sum: v })) + '<small>' + esc(UI.sumNote) + '</small>' : esc(t(UI.sum, { sum: v }));
  }
  function shortSum(a, qty) { return qty > 0 ? (isApprox(a) ? "n. " : "") + fmt(rowSum(a, qty)) + " €" : "–"; }
  function dataAttrs(a) {
    return ' data-sn="product-row" data-name="' + esc(a.name) + '" data-sku="' + esc(a.sku) + '" data-price="' + esc(a.price) + '"' +
      ' data-price-unit="' + esc(a.priceUnit) + '" data-kg="' + esc(a.kgPerUnit) + '"' + (a.variableWeight === false ? ' data-fixed="1"' : "");
  }
  /* Lisätiedot rivillä: tuotenumero, erän syy + päiväys + saldo, painotuotteen arvio. */
  function metaLines(a, stock, u, withStock) {
    const lines = [esc(t(a.pack ? UI.skuPack : UI.sku, { sku: a.sku, pack: a.pack }))];
    if (isBatch(a.variant)) {
      const p = [];
      /* bestBeforeNote: esim. "2 päivää toimituksesta" (käyttöpäivä ≤ 2 pv toimituksesta, 03-spec) */
      if (a.bestBefore) p.push(esc(t(UI.bestBefore, { date: a.bestBeforeNote ? t(UI.bestBeforeNote, { date: a.bestBefore, note: a.bestBeforeNote }) : a.bestBefore })));
      if (withStock && stock != null && stock > 0) {
        /* Vähissä: alle 10 tai sivun oma sääntö (lowStock, esim. < 20 % erästä) */
        const low = a.lowStock === true || stock < 10;
        const txt = esc(t(low ? UI.stockLow : UI.stockLeft, { stock, unit: u }));
        p.push(low ? '<b>' + txt + '</b>' : txt);
      }
      if (p.length) lines.push(p.join(" · "));
    }
    if (a.priceUnit === "kg" && a.kgPerUnit && !a.pack && a.variableWeight !== false) lines.push(esc(t(UI.weightHint, { kg: String(a.kgPerUnit).replace(".", ","), unit: u })));
    return lines;
  }
  function detailsBtn(a, pid, open, withLabel) {
    const D = UI.details;
    return '<button type="button" class="' + (withLabel ? "pch-x__more-text" : "pch-x__more") + '" data-act="details" data-labels="details" aria-expanded="' + open + '" aria-controls="' + pid + '"' +
      ' aria-label="' + esc(t(open ? D.ariaOpen : D.ariaClosed, { name: a.name })) + '">' +
      (withLabel ? '<span class="cap">' + esc(open ? D.open : D.closed) + '</span>' : "") + ico(withLabel ? "chevronDownLight" : "circleChevron") + '</button>';
  }
  /* Paneeli ei toista riviltä näkyvää päiväystä ja saldoa. */
  function panel(a, pid, open) {
    return '<div class="' + cls("pch__content pch-x__panel", open && "is-active") + '" id="' + pid + '"' + (open ? "" : " hidden") + '>' +
      (a.desc ? '<p>' + esc(a.desc) + '</p>' : "") +
      (UI.explain[a.variant] ? '<p class="explain">' + esc(t(UI.explain[a.variant], { date: a.bestBefore, discount: discountOf(a) })) + '</p>' : "") +
      '<p><a href="' + esc(a.href || "#") + '">' + esc(UI.detailsLink) + '</a></p></div>';
  }
  function buyBox(a, stock, qty) {
    if (a.state === "soldout") return '<p class="pch-x__state"><b>' + esc(UI.state.soldout) + '</b></p>';
    if (a.state === "unavailable") return '<p class="pch-x__state">' + esc(t(UI.state.unavailableShort, { date: a.date })) + ' ' + changeDateBtn(UI.state.changeDate) + '</p>';
    return SN.render("quantity", { name: a.name, sku: a.sku, qty, stock: stock == null ? "" : stock, unit: a.unit, mode: a.state,
      showUnit: a.showUnit !== false, showNote: true });   /* yksikkö aina kentän alla (06-spec) */
  }

  /* ── Nykyinen kaupan rivi (vertailu) ───────────────────────────── */
  function renderShop(a, id) {
    const d = discountOf(a), u = unitLabel(a.unit), stock = intOrNull(a.stock);
    const qty = Math.max(0, parseInt(a.qty, 10) || 0), pid = id + "-content", open = !!a.open;
    let action;
    if (a.state === "soldout") action = '<ul class="pch__summary"><li><b>' + esc(UI.state.soldout) + '</b></li></ul>';
    else if (a.state === "unavailable") action = '<ul class="pch__summary"><li>' + esc(t(UI.state.unavailable, { date: a.date })) + '</li></ul>';
    else action = '<div class="pch__add-to-cart">' + SN.render("quantity", { name: a.name, sku: a.sku, qty, stock: stock == null ? "" : stock, unit: a.unit, mode: a.state, showUnit: a.unit === "pakk", showNote: true }) + '</div>';
    const meta = [];
    if (a.bestBefore) meta.push(t(UI.bestBefore, { date: a.bestBefore }));
    if (stock != null) meta.push(a.state === "soldout" ? UI.soldOutMeta : t(UI.stockLeft, { stock, unit: u }));
    const content = (a.desc ? '<p>' + esc(a.desc) + '</p>' : "") +
      (meta.length ? '<p class="pch__content-meta">' + meta.map(esc).join(" · ") + '</p>' : "") +
      (UI.explain[a.variant] ? '<p class="explain">' + esc(t(UI.explain[a.variant], { date: a.bestBefore, discount: d })) + '</p>' : "") +
      '<p><a href="' + esc(a.href || "#") + '">' + esc(UI.detailsLink) + '</a></p>';
    return '<div class="' + cls("genero-product-card pch pch-k", "pch--" + a.variant, a.state !== "ok" && "pch--" + a.state) + '"' + dataAttrs(a) + '>' +
      '<div class="gds-card"><div class="pch__inner">' +
        '<div class="pch__readmore"><button type="button" class="pch__readmore-button" data-act="details" aria-expanded="' + open + '" aria-controls="' + pid + '"' +
          ' aria-label="' + esc(t(open ? UI.readmoreAria.open : UI.readmoreAria.closed, { name: a.name })) + '">' + ico("circleChevron") +
          '<span class="pch__readmore-label">' + esc(UI.readmore) + '</span></button></div>' +
        '<div class="pch__image pch-media">' + media(a) + badge(a, d) + '</div>' +
        '<div class="pch__title-container"><h3 class="pch__title"><a href="' + esc(a.href || "#") + '">' + esc(a.name) + '</a></h3></div>' +
        '<ul class="pch__meta"><li>' + esc(t(UI.sku, { sku: a.sku })) + '</li></ul>' +
        '<div class="pch__helper" aria-hidden="true"></div>' +
        price(a, d) + action +
        '<div class="' + cls("pch__content", open && "is-active") + '" id="' + pid + '"' + (open ? "" : " hidden") + '>' + content + '</div>' +
      '</div></div></div>';
  }

  /* ── Layoutit A / B / C ────────────────────────────────────────── */
  function renderLayout(a, id) {
    const L = a.layout, d = discountOf(a), u = unitLabel(a.unit), stock = intOrNull(a.stock);
    const qty = Math.max(0, parseInt(a.qty, 10) || 0), pid = id + "-content", open = !!a.open;
    const title = (a.previously ? '<p class="pch-x__tag">' + esc(UI.previously) + '</p>' : "") + '<h3 class="pch__title"><a href="' + esc(a.href || "#") + '">' + esc(a.name) + '</a></h3>';
    const rootCls = cls("genero-product-card pch pch-" + L, "pch--" + a.variant, a.state !== "ok" && "pch--" + a.state, qty > 0 && "pch--in-cart");
    const open_ = '<div class="' + rootCls + '"' + dataAttrs(a) + '>';
    const lines = metaLines(a, stock, u, a.state !== "soldout");

    if (L === "a") {
      return open_ + '<div class="pch-a__row">' +
        '<div class="pch-a__img">' + thumb(a, d) + '</div>' +
        '<div class="pch-a__main">' + title + '<p class="pch-x__meta">' + lines.join(" · ") + '</p></div>' +
        '<div class="pch-a__price">' + price(a, d) + '</div>' +
        '<div class="pch-a__buy">' + buyBox(a, stock, qty) + '</div>' +
        '<div class="pch-a__more">' + detailsBtn(a, pid, open, false) + '</div>' +
      '</div>' + panel(a, pid, open) + '</div>';
    }
    if (L === "c") {
      const rest = lines.slice(1);
      return open_ + '<div class="pch-c__row">' +
        '<div class="pch-c__prod"><div class="pch-c__img">' + thumb(a, d) + '</div><div class="pch-c__name">' + title +
          '<p class="pch-x__meta pch-c__sku-inline">' + lines.join(" · ") + '</p>' +
          (rest.length ? '<p class="pch-x__meta pch-c__batch">' + rest.join(" · ") + '</p>' : "") + '</div></div>' +
        '<div class="pch-c__sku">' + esc(a.sku) + '</div>' +
        '<div class="pch-c__price">' + price(a, d) + '</div>' +
        '<div class="pch-c__buy">' + buyBox(a, stock, qty) + '</div>' +
        '<div class="pch-c__sum" data-sum="short">' + (a.state === "ok" ? shortSum(a, qty) : "–") + '</div>' +
        '<div class="pch-c__more">' + detailsBtn(a, pid, open, false) + '</div>' +
      '</div>' + panel(a, pid, open) + '</div>';
    }
    /* B — Kortti */
    return open_ + '<div class="pch-b__card">' +
      '<div class="pch-b__img">' + thumb(a, d) + '</div>' +
      '<div class="pch-b__info">' + title + lines.map((m) => '<p class="pch-x__meta">' + m + '</p>').join("") + detailsBtn(a, pid, open, true) + '</div>' +
      '<div class="pch-b__buy"><div class="pch-b__price">' + price(a, d) + '</div>' + buyBox(a, stock, qty) + '</div>' +
      panel(a, pid, open) +
    '</div></div>';
  }

  /* ── Kori: B-kortti + rivisumma, poisto ja rivi-ilmoitus ───────────
     Ongelmarivi on johdonmukainen: jos rivi ei ole mukana tilauksessa
     (loppu, ei saatavilla, vanhentunut), määrä lukitaan, saldo ei näy
     ja summan tilalla lukee "Ei mukana summassa". */
  function renderCart(a) {
    const d = discountOf(a), u = unitLabel(a.unit), stock = intOrNull(a.stock);
    const qty = Math.max(0, parseInt(a.qty, 10) || 0);
    const issue = a.issue && a.issue !== "none" ? a.issue : "";
    const removed = issue === "removed", blocking = BLOCKING.includes(issue);
    const n = issue && !removed ? UI.cartNotice[issue] : null;
    const pn = num(a.price), po = num(a.oldPrice);
    const vars = { name: a.name, date: a.date, stock, unit: u, unitEnd: SN.unitEnd(u), ordered: a.ordered, price: a.price, priceUnit: a.priceUnit, oldPrice: a.oldPrice,
      bestBefore: a.bestBefore, direction: pn > po ? UI.priceUp : UI.priceDown };
    const lines = metaLines(a, stock, u, !blocking);
    const notice = n
      ? '<span>' + esc(t(n.text, vars)) + '</span>' + (n.actions || []).map((x) =>
          '<button type="button" class="link" data-act="' + esc(x.act) + '" aria-label="' + esc(t(x.aria || x.label, vars)) + '"' + (x.act === "changedate" ? ' aria-haspopup="dialog"' : "") + '>' + esc(x.label) + '</button>').join("")
      : "";
    const rm = UI.cartNotice.removed;

    return '<div class="' + cls("genero-product-card pch pch-b pch--cart", "pch--" + a.variant, issue && !removed && "pch--" + issue) + '"' + dataAttrs(a) + (removed ? " hidden" : "") + '>' +
      '<div class="pch-b__card">' +
        '<div class="pch-b__img">' + thumb(a, d) + '</div>' +
        '<div class="pch-b__info"><h3 class="pch__title"><a href="' + esc(a.href || "#") + '">' + esc(a.name) + '</a></h3>' + lines.map((m) => '<p class="pch-x__meta">' + m + '</p>').join("") + '</div>' +
        '<div class="pch-b__buy">' +
          '<div class="pch-b__price">' + price(a, d) + '</div>' +
          '<div class="pch-b__qty">' + SN.render("quantity", { name: a.name, sku: a.sku, qty, stock: stock == null ? "" : stock, unit: a.unit,
            disabled: blocking, showUnit: true, showNote: !blocking && issue !== "reduced" }) + '</div>' +
          '<div class="pch-b__sum' + (blocking ? " is-excluded" : "") + '"' + (blocking ? "" : " data-sum") + '>' + (blocking ? esc(UI.cartExcluded) : sumHtml(a, qty)) + '</div>' +
          '<div class="pch-b__remove"><button type="button" data-act="remove" aria-label="' + esc(t(UI.remove, { name: a.name })) + '">' + ico("trash") + '</button></div>' +
        '</div>' +
        '<div class="' + cls("pch__notice", n && n.tone && "pch__notice--" + n.tone) + '" aria-live="polite">' + notice + '</div>' +
      '</div></div>' +
      '<div class="row-removed" role="status"' + (removed ? "" : " hidden") + '><span>' + esc(t(rm.text, { name: a.name })) + '</span>' +
        rm.actions.map((x) => '<button type="button" class="link" data-act="' + x.act + '" aria-label="' + esc(t(x.aria, { name: a.name })) + '">' + esc(x.label) + '</button>').join("") + '</div>';
  }

  SN.register("productRow", {
    defaults: {
      context: "list", layout: "b", variant: "normal", state: "ok", issue: "none",
      name: "Broileririsotto ja papuja 360g", sku: "20550", img: "", pack: "", previously: false, lowStock: false, bestBeforeNote: "", price: "3,54", priceUnit: "kpl", regular: "", oldPrice: "", ordered: "",
      unit: "kpl", kgPerUnit: "", variableWeight: "", href: "", showUnit: true, bestBefore: "", stock: "", qty: 0, open: false, date: "ke 17.9.2026",
      desc: "Sitruunainen risotto arborio-riisistä, broilerin sisäfilettä ja basilikalla maustettuja vihreitä papuja."
    },
    render(a) {
      const id = SN.uid("row");
      if (a.context === "cart") return renderCart(a);
      return ["a", "b", "c"].includes(a.layout) ? renderLayout(a, id) : renderShop(a, id);
    },
    sum: rowSum
  });

  /* ── Tuotelista · gds/product-list ─────────────────────────────── */
  SN.register("productList", {
    defaults: { heading: "Annosateriat", context: "list", layout: "b", vatNote: true, empty: "", rows: [] },
    render(a) {
      const hid = SN.uid("pl"), L = a.context === "cart" ? "b" : a.layout, rows = a.rows || [];
      const row = (r) => SN.render("productRow", Object.assign({ context: a.context, layout: L, variant: a.variant || "normal" }, r));
      const items = rows.map((r) => '<li class="cell">' + row(r) + '</li>').join("");
      const H = UI.listHead;
      let body;
      if (!rows.length) body = '<p class="product-list__empty">' + esc(a.empty || UI.listEmpty) + '</p>';
      else if (L === "a") body = '<ul class="pl-rows pl-rows--a">' + items + '</ul>';
      else if (L === "c") body = '<div class="pl-rows pl-rows--c"><div class="pl-c__head" aria-hidden="true"><span>' + esc(H.product) + '</span><span>' + esc(H.sku) +
        '</span><span>' + esc(H.price) + '</span><span>' + esc(H.qty) + '</span><span>' + esc(H.sum) + '</span><span></span></div><ul>' + items + '</ul></div>';
      else body = '<ul class="' + cls("grid", L === "b" && "grid--b") + '">' + items + '</ul>';
      return '<section class="product-list" aria-labelledby="' + hid + '">' +
        '<div class="product-list__head">' + (a.heading ? '<h2 class="product-list__subheading" id="' + hid + '">' + esc(a.heading) + '</h2>' : "") +
          (a.vatNote && a.context !== "cart" && rows.length ? '<p class="product-list__note">' + esc(UI.vatNote) + '</p>' : "") + '</div>' +
        body + '</section>';
    }
  });

  /* ── Käyttäytyminen ────────────────────────────────────────────── */
  function note(atc, html) {
    const n = atc.closest(".atc-wrap") && atc.closest(".atc-wrap").querySelector(".atc__note");
    if (n) n.innerHTML = html;
  }
  function paintQty(atc, v) {
    const stock = intOrNull(atc.dataset.stock);
    atc.querySelector("input").value = v; atc.dataset.qty = v;
    atc.querySelector('[data-act="minus"]').disabled = v <= 0;
    atc.querySelector('[data-act="plus"]').disabled = stock != null && v >= stock;
    note(atc, noteHtml(v, stock, atc.dataset.unit));
    const row = atc.closest(".pch");
    if (row) {
      const sum = row.querySelector("[data-sum]");
      const ra = { price: row.dataset.price, priceUnit: row.dataset.priceUnit, kgPerUnit: row.dataset.kg, variableWeight: row.dataset.fixed ? false : "" };
      if (sum) sum.innerHTML = sum.dataset.sum === "short" ? shortSum(ra, v) : sumHtml(ra, v);
      if (/\bpch-[abc]\b/.test(row.className) && !row.classList.contains("pch--cart")) row.classList.toggle("pch--in-cart", v > 0);
    }
  }
  function setQty(atc, value) {
    const stock = intOrNull(atc.dataset.stock);
    const prev = parseInt(atc.dataset.qty, 10) || 0;
    const name = atc.dataset.name, unit = atc.dataset.unit;
    let v = Math.max(0, Math.floor(value));
    const capped = stock != null && v > stock;
    if (capped) v = stock;
    const row = atc.closest(".pch");
    /* Korissa 0 = sama kuin roskakori: rivi piiloon, Kumoa palauttaa edellisen määrän. */
    if (v === 0 && prev > 0 && row && row.classList.contains("pch--cart")) { paintQty(atc, prev); removeRow(row); return; }
    paintQty(atc, v);
    if (capped) SN.announce(t(UI.qty.capped, { stock, unit, unitEnd: SN.unitEnd(unit) }));
    else if (v !== prev) SN.announce(v > 0 ? t(UI.qty.live, { name, qty: v, unit }) : t(UI.qty.liveEmpty, { name }));
    if (v !== prev) SN.emit(atc, "qty", { name, sku: atc.dataset.sku || "", qty: v, prev });
  }
  /* Kentän arvo: vain kokonaisluku ≥ 0 kelpaa. Tyhjä, miinus tai kirjain
     palauttaa edellisen määrän eikä koskaan poista riviä huomaamatta. */
  function commit(input) {
    const atc = input.closest(".atc");
    const raw = String(input.value).trim();
    if (!/^\d+$/.test(raw)) {
      const prev = parseInt(atc.dataset.qty, 10) || 0;
      input.value = prev;
      note(atc, '<span class="atc__note--error">' + esc(UI.qty.invalid) + '</span>');
      SN.announce(UI.qty.invalid);
      return;
    }
    setQty(atc, parseInt(raw, 10));
  }
  function removeRow(row) {
    const name = row.dataset.name, undo = row.nextElementSibling;
    const qty = parseInt((row.querySelector(".atc") || {}).dataset?.qty, 10) || 0;
    if (undo && undo.classList.contains("row-removed")) { row.hidden = true; undo.hidden = false; undo.querySelector("button").focus(); }
    SN.announce(t(UI.cartNotice.removed.text, { name }));
    SN.emit(row, "remove", { name, sku: row.dataset.sku, qty });
  }

  SN.behavior(function (root) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]"); if (!btn) return;
      const act = btn.dataset.act;
      const atc = btn.closest(".atc");
      if (atc && (act === "plus" || act === "minus")) {
        const cur = parseInt(atc.dataset.qty, 10) || 0;
        setQty(atc, cur + (act === "plus" ? 1 : -1));
        return;
      }
      const removedBox = btn.closest(".row-removed");
      const row = btn.closest(".pch") || (removedBox && removedBox.previousElementSibling);
      if (!row) return;
      const name = row.dataset.name;
      if (act === "details") {
        const open = btn.getAttribute("aria-expanded") === "true";
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        const D = btn.dataset.labels === "details" ? UI.details : null;
        btn.setAttribute("aria-expanded", String(!open));
        btn.setAttribute("aria-label", D ? t(open ? D.ariaClosed : D.ariaOpen, { name }) : t(open ? UI.readmoreAria.closed : UI.readmoreAria.open, { name }));
        const label = btn.querySelector("span:not(.ico)");
        if (D && label) label.textContent = open ? D.closed : D.open;
        if (panel) { panel.hidden = open; panel.classList.toggle("is-active", !open); }
        SN.emit(row, "details", { name, open: !open });
      } else if (act === "remove") {
        removeRow(row);
      } else if (act === "undo") {
        row.hidden = false; if (removedBox) removedBox.hidden = true;
        const input = row.querySelector(".atc input:not(:disabled)");
        (input || row.querySelector(".pch__title a")).focus();
        SN.announce(t(UI.qty.restored, { name }));
        SN.emit(row, "undo", { name, sku: row.dataset.sku, qty: parseInt((row.querySelector(".atc") || {}).dataset?.qty, 10) || 0 });
      } else {
        SN.emit(row, "rowaction", { act, name, sku: row.dataset.sku });
      }
    });
    root.addEventListener("change", (e) => {
      const input = e.target.closest(".atc input"); if (input) commit(input);
    });
    /* Enter vahvistaa ja fokus jää kenttään. */
    root.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const input = e.target.closest(".atc input"); if (!input) return;
      e.preventDefault(); commit(input); input.select();
    });
  });
})();
