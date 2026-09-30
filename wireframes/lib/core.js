/* =================================================================
 * SNELLMAN RETAIL — komponenttikirjaston ydin
 * ------------------------------------------------------------------
 * window.SN
 *   .esc .t .num .fmt   apurit
 *   .ico(name)          Font Awesome Pro -ikoni (sama kitti kuin snellmanecom)
 *   .UI                 komponenttien toistuva sanasto (ei sivun sisältöä)
 *   .c[name]            komponentit: { render(args) → html }
 *   .register(name, c)  komponentin rekisteröinti
 *   .emit(el, type, d)  tapahtuma: CustomEvent "sn:<type>" + SN.onEmit-koukku
 *   .mount(root)        käynnistää delegoidut käyttäytymiset kerran
 *
 * SÄÄNTÖ: komponentin markkupissa ei ole yhtään sanaa. Kaikki teksti
 * tulee argumenteista tai SN.UI:sta — ruotsi olisi sisältötyötä.
 * ================================================================= */
(function () {
  "use strict";
  const SN = window.SN = window.SN || {};

  /* ── Apurit ────────────────────────────────────────────────────── */
  SN.esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  SN.t = (tpl, vars) => String(tpl == null ? "" : tpl)
    .replace(/\{([\wäöå]+)\}/gi, (m, k) => (vars && vars[k] != null) ? vars[k] : m);
  SN.num = (s) => parseFloat(String(s).replace(",", "."));
  SN.fmt = (n) => (Math.round(n * 100) / 100).toFixed(2).replace(".", ",");
  SN.cls = (...parts) => parts.flat().filter(Boolean).join(" ");
  /* Yksikkö lauseen lopussa: "pakk." + "." → "pakk." (ei tuplapistettä). */
  SN.unitEnd = (u) => String(u == null ? "" : u).replace(/\.$/, "");
  /* Sivun omat attribuutit komponentille: { id, data: { k: v }, attrs: { name: v } } */
  SN.attrs = (a) => (a.id ? ' id="' + SN.esc(a.id) + '"' : "") +
    Object.keys(a.data || {}).map((k) => ' data-' + SN.esc(k) + '="' + SN.esc(a.data[k]) + '"').join("") +
    Object.keys(a.attrs || {}).map((k) => ' ' + SN.esc(k) + '="' + SN.esc(a.attrs[k]) + '"').join("");
  let seq = 0;
  SN.uid = (p) => (p || "sn") + "-" + (++seq);

  /* ── Ikonit — Font Awesome Pro 6, Snellmanin oma kitti ────────────
     Sama kitti ja samat luokat kuin generoi/snellmanecom-teemassa
     (app/setup.php: kit.fontawesome.com/ca129ff52d.js) ja GDS:n gds-iconissa.
     Tyyli on Light; "fa fa-…" repossa = Solid. `src` kertoo mistä
     käyttö on todennettu, `null` = ei repossa, valittu Light-tyylin mukaan. */
  SN.FA_KIT = "https://kit.fontawesome.com/ca129ff52d.js";
  SN.ICONS = {
    circleMinus:       { fa: "fa-light fa-circle-minus",        src: "vue/components/InputQuantity.vue" },
    circlePlus:        { fa: "fa-light fa-circle-plus",         src: "vue/components/InputQuantity.vue" },
    circleChevron:     { fa: "fa-light fa-circle-chevron-down", src: "genero-woocommerce/product-card.blade.php" },
    circleChevronLeft: { fa: "fa-light fa-circle-chevron-left", src: "blocks/slideshow.blade.php" },
    circleChevronRight:{ fa: "fa-light fa-circle-chevron-right",src: "blocks/slideshow.blade.php" },
    chevronDown:       { fa: "fa-solid fa-chevron-down",        src: "blocks/warehouse.blade.php" },
    chevronDownLight:  { fa: "fa-light fa-chevron-down",        src: null },
    sliders:           { fa: "fa-light fa-sliders",             src: null },
    chevronUp:         { fa: "fa-light fa-chevron-up",          src: "blocks/facet.blade.php" },
    exclamation:       { fa: "fa-solid fa-circle-exclamation",  src: "blocks/warehouse.blade.php" },
    trash:             { fa: "fa-light fa-trash",               src: "vue/components/WooAddToCart.vue" },
    cart:              { fa: "fa-solid fa-cart-shopping",       src: "shop.snellman.fi header (navigaatiovalikko)" },
    lock:              { fa: "fa-solid fa-lock",                src: "shop.snellman.fi header (navigaatiovalikko)" },
    arrow:             { fa: "fa-light fa-arrow-right",         src: null },
    xmark:             { fa: "fa-light fa-xmark",               src: null },
    search:            { fa: "fa-light fa-magnifying-glass",    src: null },
    calendar:          { fa: "fa-light fa-calendar",            src: null },
    check:             { fa: "fa-light fa-check",               src: null },
    info:              { fa: "fa-light fa-circle-info",         src: null },
    image:             { fa: "fa-light fa-image",               src: null },
    bars:              { fa: "fa-light fa-bars",                src: null },
    circleCheck:       { fa: "fa-light fa-circle-check",        src: null },
    chevronLeft:       { fa: "fa-light fa-chevron-left",        src: null },
    chevronRight:      { fa: "fa-light fa-chevron-right",       src: null },
    phone:             { fa: "fa-light fa-phone",               src: null },
    envelope:          { fa: "fa-light fa-envelope",            src: null },
    truck:             { fa: "fa-light fa-truck",               src: null }
  };
  /* Versaaliteksti optisesti keskelle: TheSansB:n versaalit istuvat rivilaatikossa
     ~0,17em keskikohdan yläpuolella. .cap rajaa laatikon versaalikorkeuteen (text-box),
     jolloin flex/padding keskittää itse kirjaimet eikä fontin metriikkaa. */
  SN.cap = (text) => '<span class="cap">' + SN.esc(text) + '</span>';
  SN.ico = (name) => SN.ICONS[name] ? '<span class="ico" aria-hidden="true"><i class="' + SN.ICONS[name].fa + '"></i></span>' : "";

  /* Kitti ladataan kerran. Sen MutationObserver muuttaa myöhemmin
     renderöidyt <i>-elementit SVG:iksi, joten innerHTML-päivitykset toimivat. */
  if (!document.querySelector('script[src^="https://kit.fontawesome.com/"]')) {
    const k = document.createElement("script");
    k.src = SN.FA_KIT; k.crossOrigin = "anonymous";
    document.head.appendChild(k);
  }

  /* ── Sanasto — komponenttien oma teksti ───────────────────────────
     Sivun sisältö (tuotteet, otsikot) tulee argumenteista; tämä on
     vain se mitä komponentti itse sanoo. Yhdistetty 06- ja 07-protoista. */
  SN.UI = {
    badge:        { boost: "Boost", outlet: "Outlet", campaign: "−{discount} %" },
    /* Tuoterivillä merkintä kertoo myös alennuksen (Oskarin retail-haara: gds/product-card/badges) */
    badgeDiscount: { boost: "Boost −{discount} %", outlet: "Outlet −{discount} %", campaign: "−{discount} %" },
    badgeAria:    { boost: "Boost-erä, alennus {discount} prosenttia",
                    outlet: "Outlet-erä, alennus {discount} prosenttia",
                    campaign: "Kampanjahinta, alennus {discount} prosenttia" },
    sku:          "Tuotenumero {sku}",
    skuPack:      "Tuotenumero {sku} · {pack}",
    previously:   "Tilattu aiemmin",
    bestBefore:   "Käytä viimeistään {date}",
    stockLeft:    "{stock} {unit} jäljellä",
    stockLow:     "Vain {stock} {unit} jäljellä",
    bestBeforeNote: "{date}, {note}",
    soldOutMeta:  "erä myyty loppuun",
    weightHint:   "n. {kg} kg/{unit}",
    priceUnit:    "{price} €/{unit}",
    compare:      "{regular} €",
    compareSr:    "Normaalihinta",
    noDatePrice:  "Valitse toimituspäivä",
    vatNote:      "Hinnat ilman alv:tä.",
    listEmpty:    "Ei tuotteita valitulle toimituspäivälle.",
    sum:          "{sum} €",
    sumApprox:    "n. {sum} €",
    sumNote:      "Lopullinen hinta punnitun painon mukaan",
    /* Nykyisen kaupan rivin sanasto (vertailu) */
    readmore:     "Lue lisää",
    readmoreAria: { closed: "Lue lisää: {name}", open: "Sulje: {name}" },
    /* Uusien rivien sanasto: näkyvä teksti = nimen alku (WCAG 2.5.3) */
    details:      { closed: "Lisätiedot", open: "Sulje lisätiedot",
                    ariaClosed: "Lisätiedot: {name}", ariaOpen: "Sulje lisätiedot: {name}" },
    detailsLink:  "Avaa tuotesivu",
    remove:       "Poista {name} korista",
    explain: {
      boost:  "Boost-erä: käyttöpäivä on lähellä, siksi −{discount} %. Laatu on normaali. Käytä viimeistään {date}.",
      outlet: "Outlet-erä: päiväys ei riitä kaupan hyllyyn, mutta tuote on täysin käyttökelpoinen, siksi −{discount} %. Käytä viimeistään {date}."
    },
    qty: {
      minus: "Vähennä {name}", plus: "Lisää {name}", field: "Määrä ({unit}), {name}",
      cap: "Erää on jäljellä vain {stock} {unitEnd}.",
      capped: "Erää on jäljellä vain {stock} {unitEnd}. Määrä asetettu {stock}.",
      invalid: "Syötä määrä numeroina.",
      saving: "Tallennetaan…",
      live: "{name}, {qty} {unit} korissa", liveEmpty: "{name} poistettu korista",
      restored: "{name} palautettu koriin."
    },
    state: {
      soldout:          "Erä myyty loppuun",
      unavailable:      "Ei saatavilla {date}. Kokeile toista toimituspäivää.",
      unavailableShort: "Ei saatavilla {date}.",
      changeDate:       "Vaihda päivä"
    },
    cartExcluded: "Ei mukana summassa",
    listHead: { product: "Tuote", sku: "Tuotenumero", price: "Hinta", qty: "Määrä", sum: "Yhteensä" },
    priceUp: "nousi", priceDown: "laski",
    cartNotice: {
      removed:      { text: "{name} poistettu korista.", actions: [ { act: "undo", label: "Kumoa", aria: "Kumoa: palauta {name} koriin" } ] },
      unavailable:  { text: "Ei saatavilla {date}. Vaihda toimituspäivää tai poista tuote.", tone: "error",
                      actions: [ { act: "changedate", label: "Vaihda päivä", aria: "Vaihda toimituspäivä" }, { act: "remove", label: "Poista", aria: "Poista {name} korista" } ] },
      soldout:      { text: "Erä on myyty loppuun. Tuote poistuu korista, kun jatkat.", tone: "error",
                      actions: [ { act: "remove", label: "Poista nyt", aria: "Poista {name} korista" } ] },
      reduced:      { text: "Tilasit {ordered} {unit}, erää oli jäljellä {stock} {unitEnd}. Määrä muutettu.", tone: "warn" },
      pricechanged: { text: "Hinta {direction} toimituspäivälle {date}: {price} €/{priceUnit} (oli {oldPrice} €).", tone: "info" },
      expired:      { text: "Erän käyttöpäivä {bestBefore} on ennen toimitusta. Tuote poistuu korista, kun jatkat.", tone: "error",
                      actions: [ { act: "remove", label: "Poista", aria: "Poista {name} korista" } ] }
    },
    units: { kpl: "kpl", pakk: "pakk.", kg: "kg" }
  };

  /* ── Rekisteri ─────────────────────────────────────────────────── */
  SN.c = SN.c || {};
  SN.register = (name, comp) => { SN.c[name] = comp; return comp; };
  SN.render = (name, args) => {
    const c = SN.c[name];
    if (!c) throw new Error("SN: tuntematon komponentti " + name);
    return c.render(Object.assign({}, c.defaults || {}, args || {}));
  };

  /* ── Tapahtumat ────────────────────────────────────────────────────
     Sivu kuuntelee esim. document.addEventListener("sn:qty", …) ja
     päivittää oman korinsa. Kirjasto ohjaa samat tapahtumat Toiminnot-
     välilehdelle SN.onEmit-koukun kautta. */
  SN.emit = (el, type, detail) => {
    (el || document).dispatchEvent(new CustomEvent("sn:" + type, { bubbles: true, detail }));
    if (typeof SN.onEmit === "function") SN.onEmit(type, detail);
  };

  /* ── Käyttäytymiset — delegoidut, tilattomat ───────────────────────
     Komponentit kantavat tarvitsemansa tilan data-attribuuteissa, joten
     samat käsittelijät toimivat kaikille sivulle renderöidyille riveille. */
  const behaviors = [];
  SN.behavior = (fn) => behaviors.push(fn);
  let mounted = false;
  SN.mount = (root) => {
    if (mounted) return; mounted = true;
    liveRegion();
    behaviors.forEach((fn) => fn(root || document));
  };
  /* Live-alue luodaan jo mountissa: ruudunlukija huomaa vain alueen,
     joka on olemassa ennen ensimmäistä muutosta. */
  function liveRegion() {
    let live = document.getElementById("sn-live");
    if (!live) {
      live = document.createElement("div");
      live.id = "sn-live"; live.className = "vh";
      live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    return live;
  }
  SN.announce = (text) => {
    const live = liveRegion();
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);   /* sama teksti uudelleen kuuluu myös */
    if (typeof SN.onEmit === "function") SN.onEmit("announce", { text });
  };
})();
