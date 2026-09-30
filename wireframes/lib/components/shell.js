/* =================================================================
 * Kehys ja toimituspäivä: header (parts/header.html), footer
 * (parts/footer.html), toimituspäivä (gds/warehouse).
 * Header-tilat 01-etusivu.md:n mukaan: A = kirjautumaton, B = kirjautunut.
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, t, cls } = SN;

  /* Wireframe-juuren polku kuvia varten. Sivut: "", kirjasto: "../". */
  SN.base = SN.base || "";

  /* Linkit osoittavat wireframe-sivuille, jotta tehtävät voi kulkea protossa päästä päähän
     (katselmointi 30.9.2026: tuotantopolut antoivat 404:n). Tuotannon osoitteet: speksit. */
  SN.SHELL = {
    home: "01-etusivu.html",
    logo: { src: "snellman-logo.svg", alt: "Snellman, etusivu" },
    navLabel: "Päävalikko",
    menu: { open: "Valikko", close: "Sulje valikko" },
    a: {
      nav: [ { key: "asiakaspalvelu", label: "Asiakaspalvelu", href: "04-asiakaspalvelu.html" }, { key: "tilausehdot", label: "Tilausehdot", href: "05-tilausehdot.html" } ],
      cta: { label: "Kirjaudu", href: "09-kirjautuminen.html" }
    },
    b: {
      nav: [
        { key: "kategoriat", label: "Kategoriat", href: "02-kategoriat.html" },
        { key: "pikatilaus", label: "Pikatilaus", href: "02-kategoriat.html?view=quick" },
        { key: "outlet",     label: "Snellman Outlet", href: "03-snellman-outlet.html", requires: "outlet" },
        { key: "tilaukset",  label: "Tilaukset", href: "#" },
        /* children: kohde avautuu alavalikoksi (leveässä pudotus, kapeassa Valikon sisällä).
           01-etusivu.md B0: ei linkkiä /my-account/-etusivulle (ohjaa kirjautuneen etusivulle). */
        { key: "tili",       label: "Tili", href: "#", children: [
          { key: "osoitteet",     label: "Osoitteet",    href: "#" },
          { key: "tilitiedot",    label: "Tilitiedot",   href: "#" },
          { key: "kirjaudu-ulos", label: "Kirjaudu ulos", href: "01-etusivu.html?view=a" }
        ] }
      ],
      cart: { label: "Kori", href: "07-ostoskori.html", count: "{n} tuotetta" },
      /* Haku vie 02:n hakutulosnäkymään: ?view=search&q=… */
      search: { label: "Hae tuotteita", placeholder: "Hae nimellä tai tuotenumerolla", submit: "Hae", href: "02-kategoriat.html", params: { view: "search" } }
    },
    footer: {
      company: "Snellmanin Lihanjalostus Oy",
      links: [
        { label: "Tietosuoja", href: "#" }, { label: "Yksityisyys ja evästeet", href: "#" },
        { label: "Tilausehdot", href: "05-tilausehdot.html" }, { label: "Asiakaspalvelu", href: "04-asiakaspalvelu.html" }
      ],
      logout: { label: "Kirjaudu ulos", href: "01-etusivu.html?view=a" }
    }
  };

  /* Alavalikkojen oletukset avaimen mukaan: sivut, jotka antavat oman nav-listansa ilman
     children-kenttää, saavat silti kirjaston alavalikon. children: [] = tavallinen linkki. */
  const DEFAULT_CHILDREN = {};
  SN.SHELL.b.nav.forEach((n) => { if (n.children) DEFAULT_CHILDREN[n.key] = n.children; });

  /* Header. Leveässä: logo, navi, haku, kori. Kapeassa (B < 64em, A < 37.5em):
     logo + kori + Valikko samalla rivillä, haku täysleveänä alla, navi
     Valikko-painikkeen takana (tuotannossa core/navigation overlay). */
  SN.register("header", {
    defaults: { state: "b", current: "kategoriat", outlet: true, search: true, cartCount: 3, menuOpen: false, submenuOpen: "", query: "" },
    render(a) {
      const S = SN.SHELL, b = a.state === "b", nid = SN.uid("nav"), open = !!a.menuOpen;
      const nav = (b ? S.b.nav : S.a.nav)
        .filter((n) => !n.requires || a[n.requires])
        .map((n) => {
          if (b && n.children === undefined && DEFAULT_CHILDREN[n.key]) n = Object.assign({}, n, { children: DEFAULT_CHILDREN[n.key] });
          if (!(n.children && n.children.length))
            return '<li><a href="' + esc(n.href) + '"' + (n.key && n.key === a.current ? ' aria-current="page"' : "") + '>' + SN.cap(n.label) + '</a></li>';
          /* Disclosure-painike (ei menu-roolia): navigaatiolinkit pysyvät linkkeinä ja Tab kulkee niissä */
          const sub = SN.uid("sub"), here = n.key === a.current || n.children.some((c) => c.key && c.key === a.current);
          const isOpen = a.submenuOpen === n.key;
          return '<li class="' + cls("site-nav__group", here && "is-current") + '">' +
            '<button type="button" class="site-nav__toggle" data-act="submenu" data-menu="' + esc(n.key || "") + '" aria-expanded="' + isOpen + '" aria-controls="' + sub + '">' +
            SN.cap(n.label) + ico("chevronDownLight") + '</button>' +
            '<ul class="site-nav__sub" id="' + sub + '"' + (isOpen ? "" : " hidden") + '>' +
            n.children.map((c) => '<li><a href="' + esc(c.href) + '"' + (c.key && c.key === a.current ? ' aria-current="page"' : "") + '>' + esc(c.label) + '</a></li>').join("") +
            '</ul></li>';
        }).join("");
      let search = "", utils;
      if (b) {
        const n = parseInt(a.cartCount, 10) || 0, sc = S.b.search, sid = SN.uid("search");
        if (a.search) search = '<form class="site-search" role="search" action="' + esc(sc.href) + '">' +
          '<label class="vh" for="' + sid + '">' + esc(sc.label) + '</label>' +
          Object.keys(sc.params || {}).map((k) => '<input type="hidden" name="' + esc(k) + '" value="' + esc(sc.params[k]) + '">').join("") +
          /* query: nykyinen hakusana näkyy kentässä hakutulossivulla */
          '<input id="' + sid + '" type="search" name="q" placeholder="' + esc(sc.placeholder) + '" value="' + esc(a.query || "") + '" enterkeyhint="search">' +
          '<button type="submit" aria-label="' + esc(sc.submit) + '">' + ico("search") + '</button></form>';
        utils = '<a class="util util--cart" href="' + esc(S.b.cart.href) + '"' + (a.current === "cart" ? ' aria-current="page"' : "") + '>' + ico("cart") + SN.cap(S.b.cart.label) +
          (n ? '<span class="util__count" aria-hidden="true">' + SN.cap(n) + '</span><span class="vh">, ' + esc(t(S.b.cart.count, { n })) + '</span>' : "") + '</a>';
      } else {
        utils = SN.render("button", { label: S.a.cta.label, href: S.a.cta.href, variant: "on-dark", size: "sm" });
      }
      const menuBtn = '<button type="button" class="menu-toggle" data-act="menu" aria-expanded="' + open + '" aria-controls="' + nid + '">' +
        ico(open ? "xmark" : "bars") + SN.cap(open ? S.menu.close : S.menu.open) + '</button>';
      return '<header class="' + cls("site-header", "site-header--" + (b ? "b" : "a"), open && "is-open") + '"><div class="container site-header__inner">' +
        '<a class="brand" href="' + esc(S.home || "#") + '"><img src="' + esc(SN.base + S.logo.src) + '" alt="' + esc(S.logo.alt) + '"></a>' +
        '<nav class="site-nav" id="' + nid + '" aria-label="' + esc(S.navLabel) + '"><ul>' + nav + '</ul></nav>' +
        search + '<div class="site-utils">' + utils + menuBtn + '</div>' +
      '</div></header>';
    }
  });

  /* Alavalikko (Tili): painike avaa/sulkee, Esc sulkee ja palauttaa fokuksen painikkeelle,
     klikkaus tai fokus valikon ulkopuolelle sulkee. Yksi auki kerrallaan. */
  function setSub(btn, open, why) {
    const list = document.getElementById(btn.getAttribute("aria-controls")); if (!list) return;
    if ((btn.getAttribute("aria-expanded") === "true") === open) return;
    btn.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
    SN.emit(btn, "menu", { menu: btn.getAttribute("data-menu"), open, via: why });
  }
  function closeSubs(root, except, why) {
    root.querySelectorAll('[data-act="submenu"][aria-expanded="true"]').forEach((b) => { if (b !== except) setSub(b, false, why); });
  }
  SN.behavior(function (root) {
    root.addEventListener("click", (e) => {
      const sb = e.target.closest('[data-act="submenu"]');
      if (sb) { closeSubs(root, sb, "other"); setSub(sb, sb.getAttribute("aria-expanded") !== "true", "click"); return; }
      if (!e.target.closest(".site-nav__group")) closeSubs(root, null, "outside");
    });
    root.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const g = e.target.closest && e.target.closest(".site-nav__group"); if (!g) return;
      const b = g.querySelector('[data-act="submenu"]');
      if (b.getAttribute("aria-expanded") === "true") { setSub(b, false, "escape"); b.focus(); e.preventDefault(); }
    });
    root.addEventListener("focusout", (e) => {
      const g = e.target.closest && e.target.closest(".site-nav__group"); if (!g) return;
      /* Leveässä pudotus sulkeutuu, kun fokus lähtee; kapeassa alalista on osa Valikkoa, joten jää auki */
      if (e.relatedTarget && !g.contains(e.relatedTarget) && !g.closest(".site-header.is-open"))
        setSub(g.querySelector('[data-act="submenu"]'), false, "blur");
    });
  });

  SN.behavior(function (root) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-act="menu"]'); if (!btn) return;
      const header = btn.closest(".site-header"), M = SN.SHELL.menu;
      const open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.innerHTML = ico(open ? "xmark" : "bars") + SN.cap(open ? M.close : M.open);
      SN.emit(btn, "menu", { menu: "main", open });
    });
  });

  SN.register("footer", {
    defaults: { loggedIn: true },
    render(a) {
      const f = SN.SHELL.footer;
      const links = f.links.concat(a.loggedIn ? [f.logout] : []);
      return '<footer class="site-footer"><div class="container"><span>' + esc(f.company) + '</span><ul>' +
        links.map((l) => '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>').join("") + '</ul></div></footer>';
    }
  });

  /* ── Toimituspäivä · gds/warehouse ─────────────────────────────────
     button = listan yläpuolella (06), panel = korin tavoitepäivä (07 K2). */
  SN.UI.delivery = {
    button: "Toimituspäivä: {date}",
    empty: "Valitse toimituspäivä",
    why: "Hinnat ja saatavuus näkyvät, kun päivä on valittu.",
    label: "Toimituspäivä",
    change: "Vaihda",
    changeAria: "Vaihda toimituspäivä",
    emptyValue: "Ei valittu"
  };
  SN.register("delivery", {
    defaults: { variant: "button", date: "ke 17.9.2026", note: "", result: "", resultHtml: "", body: "", controls: "", expanded: false, id: "", dateHtml: "", labels: {} },
    render(a) {
      /* labels: sivukohtaiset tekstit (label, change, empty, why, button) ilman SN.UI:n muuttamista; dateHtml: päiväys muuttujamerkinnällä */
      const U = Object.assign({}, SN.UI.delivery, a.labels || {}), has = !!(a.date || a.dateHtml);
      /* Valitsin on joko dialogi (oletus) tai sivun oma inline-kalenteri (controls = sen id) */
      /* popup: false → painike toimii suoraan (esim. wireframen "aseta päivä"), ei aria-haspopupia */
      const pop = a.controls ? ' aria-controls="' + esc(a.controls) + '" aria-expanded="' + !!a.expanded + '"' : a.popup === false ? "" : ' aria-haspopup="dialog"';
      const bid = a.id ? ' id="' + esc(a.id) + '"' : "";
      const pick = '<button type="button" class="btn btn--primary btn--sm"' + pop + bid + ' data-sn="delivery">' + ico("calendar") + SN.cap(U.empty) + '</button>';
      if (a.variant === "panel") {
        return '<div class="' + cls("delivery", !has && "delivery--empty") + '"><div class="delivery__row">' +
          '<span class="delivery__label">' + esc(U.label) + '</span>' +
          '<span class="' + cls("delivery__value", !has && "delivery__value--empty") + '">' + (has ? (a.dateHtml || esc(a.date)) : esc(U.emptyValue)) + '</span>' +
          (has ? '<button type="button" class="btn-text"' + pop + bid + ' aria-label="' + esc(U.changeAria) + '" data-sn="delivery">' + ico("calendar") + SN.cap(U.change) + '</button>' : pick) +
          /* resultHtml ja body: sivun oma HTML (esim. kaksi toimitusriviä, inline-kalenteri) */
          '</div><p class="delivery__result">' + (has ? (a.resultHtml || esc(a.result || a.note)) : esc(U.why)) + '</p>' + (a.body || "") + '</div>';
      }
      /* body: esim. kirjaston calendar painikkeen alle (listan yläpuolinen valitsin) */
      if (!has) return '<div class="warehouse">' + pick + '<span class="warehouse__note">' + esc(U.why) + '</span></div>' + (a.body || "");
      return '<div class="warehouse">' +
        '<button type="button" class="warehouse__button"' + pop + bid + ' data-sn="delivery">' + SN.cap(t(U.button, { date: a.date })) + ico("chevronDown") + '</button>' +
        (a.note ? '<span class="warehouse__note">' + esc(a.note) + '</span>' : "") + '</div>' + (a.body || "");
    }
  });

  /* ── Kalenteri · gds/warehouse, datepicker-popup ───────────────────
     Tuotannossa (wp-gds-theme blocks/warehouse.blade.php) painike avaa popupin,
     jossa on kalenteri: valittavissa vain reitin toimituspäivät (data-routes),
     otsikko "Valitse päivä" ja huomautus saatavuudesta. Wireframessä sama
     sisältö inline-päiväriviksi (viikko kerrallaan), koska tilaaja valitsee
     lähes aina lähimmistä päivistä.
     Päivä: { iso, wd, n, selected, disabled, reason, cutoff }.
     Tapahtumat: sn:date { calendar, iso, label } · sn:week { calendar, dir } */
  SN.UI.calendar = {
    heading: "Valitse toimituspäivä",
    prev: "Edellinen viikko", next: "Seuraava viikko",
    dayAria: "{wd} {n}",
    dayAriaDisabled: "{wd} {n}, {reason}",
    cutoff: "Tilaa viimeistään {cutoff}",
    note: "Toimituspäivän vaihto voi vaikuttaa tuotteiden saatavuuteen.",
    noDays: "Tälle viikolle ei ole toimituspäiviä. Valitse toinen viikko."
  };
  SN.register("calendar", {
    defaults: { id: "", heading: "", headingLevel: 3, weekLabel: "Viikko 38", weekNav: true, prevDisabled: false, nextDisabled: false,
      note: true, hidden: false, labels: {}, days: [
        { iso: "2026-09-14", wd: "ma", n: "14.9.", disabled: true, reason: "ei toimitusta" },
        { iso: "2026-09-15", wd: "ti", n: "15.9.", disabled: true, reason: "tilausaika päättynyt" },
        { iso: "2026-09-16", wd: "ke", n: "16.9.", cutoff: "ma 14.9. klo 14" },
        { iso: "2026-09-17", wd: "to", n: "17.9.", selected: true, cutoff: "ti 15.9. klo 14" },
        { iso: "2026-09-18", wd: "pe", n: "18.9.", cutoff: "ke 16.9. klo 14" }
      ] },
    render(a) {
      const U = Object.assign({}, SN.UI.calendar, a.labels || {});
      const id = a.id || SN.uid("cal"), hid = id + "-h", lvl = Math.min(6, Math.max(2, parseInt(a.headingLevel, 10) || 3));
      const days = a.days || [];
      const sel = days.find((d) => d.selected && !d.disabled);
      const nav = a.weekNav
        ? '<div class="cal__week">' +
            SN.render("button", { variant: "outline", size: "sm", iconOnly: true, icon: "chevronLeft", label: U.prev, disabled: a.prevDisabled, data: { week: "-1" } }) +
            '<span class="cal__week-label" aria-live="polite">' + esc(a.weekLabel) + '</span>' +
            SN.render("button", { variant: "outline", size: "sm", iconOnly: true, icon: "chevronRight", label: U.next, disabled: a.nextDisabled, data: { week: "1" } }) +
          '</div>'
        : "";
      const list = days.some((d) => !d.disabled)
        ? '<div class="cal__days" role="radiogroup" aria-labelledby="' + hid + '">' + days.map((d) => {
            const on = !!d.selected && !d.disabled;
            return '<button type="button" class="cal__day" role="radio" aria-checked="' + on + '"' + (d.disabled ? ' aria-disabled="true"' : "") +
              ' tabindex="' + (on || (!sel && d === days.find((x) => !x.disabled)) ? 0 : -1) + '" data-iso="' + esc(d.iso || "") + '"' +
              ' aria-label="' + esc(t(d.disabled ? U.dayAriaDisabled : U.dayAria, d)) + '">' +
              '<span class="cal__wd">' + esc(d.wd) + '</span><span class="cal__n">' + esc(d.n) + '</span>' +
              (d.disabled && d.reason ? '<span class="cal__reason" aria-hidden="true">' + esc(d.reason) + '</span>' : "") + '</button>';
          }).join("") + '</div>'
        : '<p class="cal__empty">' + esc(U.noDays) + '</p>';
      const cutoff = sel && sel.cutoff ? '<p class="cal__cutoff" aria-live="polite">' + esc(t(U.cutoff, sel)) + '</p>' : '<p class="cal__cutoff" aria-live="polite"></p>';
      return '<div class="cal" id="' + esc(id) + '" data-sn="calendar"' + (a.hidden ? " hidden" : "") + '>' +
        '<h' + lvl + ' class="cal__h" id="' + hid + '">' + esc(a.heading || U.heading) + '</h' + lvl + '>' +
        nav + list + cutoff + (a.note ? '<p class="cal__note">' + ico("info") + '<span>' + esc(U.note) + '</span></p>' : "") + '</div>';
    }
  });
  SN.behavior(function (root) {
    /* via: "click" (klikkaus, Enter, välilyönti = vahvistus) tai "key" (nuolinäppäin = liikkuminen radioryhmässä).
       Sivu vaihtaa päivän ja sulkee kalenterin vain vahvistuksesta. */
    const pick = (btn, via) => {
      const cal = btn.closest(".cal"); if (!cal || btn.getAttribute("aria-disabled") === "true") return;
      cal.querySelectorAll(".cal__day").forEach((b) => { const on = b === btn; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
      const label = btn.querySelector(".cal__wd").textContent + " " + btn.querySelector(".cal__n").textContent;
      SN.emit(btn, "date", { calendar: cal.id, iso: btn.dataset.iso, label, via: via || "click" });
    };
    root.addEventListener("click", (e) => {
      const day = e.target.closest(".cal__day"); if (day) { pick(day); return; }
      const wk = e.target.closest(".cal [data-week]");
      if (wk && !wk.disabled) SN.emit(wk, "week", { calendar: wk.closest(".cal").id, dir: parseInt(wk.dataset.week, 10) });
    });
    /* Nuolinäppäimet siirtyvät valittavissa olevien päivien välillä (radioryhmä) */
    root.addEventListener("keydown", (e) => {
      const day = e.target.closest && e.target.closest(".cal__day"); if (!day) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
      const all = [...day.closest(".cal__days").querySelectorAll('.cal__day:not([aria-disabled="true"])')];
      let i = all.indexOf(day);
      i = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
      e.preventDefault(); all[i].focus(); pick(all[i], "key");
    });
  });

  /* ── Ryhmän toimituspäivä · gds/cart/groups ────────────────────────
     Tuotannossa (retail-haara, wp-snellman-m3 feat/delivery-date-picker-per-loading-place)
     jokainen lastauspaikka saa ensimmäisen päivän, jonka se ehtii korin tavoitepäivänä
     tai sen jälkeen. Asiakas voi siirtää yhden ryhmän myöhemmäksi muita siirtämättä:
     valinta on <select>, vaihtoehtoina ne päivät, jotka lastauspaikka voi toimittaa
     (DeliveryDate::availableFor). Muutos hinnoittelee ja tarkistaa vain sen ryhmän.
     Tapahtuma: sn:groupdate { group, value } */
  SN.UI.groupDate = { label: "Toimituspäivä", note: "Muut toimitukset eivät muutu." };
  SN.register("groupDate", {
    defaults: { group: "800", label: "", value: "2026-09-17", note: true, options: [
      { value: "2026-09-17", label: "to 17.9." }, { value: "2026-09-18", label: "pe 18.9." }, { value: "2026-09-21", label: "ma 21.9." }
    ] },
    render(a) {
      const id = "gd-" + a.group;
      return '<div class="group-date" data-sn="group-date"><label class="group-date__label" for="' + esc(id) + '">' + esc(a.label || SN.UI.groupDate.label) + '</label>' +
        '<select id="' + esc(id) + '" name="m3_delivery_date_' + esc(a.group) + '" data-group="' + esc(a.group) + '"' + (a.note ? ' aria-describedby="' + esc(id) + '-note"' : "") + '>' +
        (a.options || []).map((o) => '<option value="' + esc(o.value) + '"' + (String(o.value) === String(a.value) ? " selected" : "") + '>' + esc(o.label) + '</option>').join("") + '</select>' +
        (a.note ? '<span class="group-date__note" id="' + esc(id) + '-note">' + esc(SN.UI.groupDate.note) + '</span>' : "") + '</div>';
    }
  });
  SN.behavior(function (root) {
    root.addEventListener("change", (e) => {
      const s = e.target.closest && e.target.closest(".group-date select"); if (!s) return;
      SN.emit(s, "groupdate", { group: s.dataset.group, value: s.value, label: s.options[s.selectedIndex].text });
    });
  });
})();
