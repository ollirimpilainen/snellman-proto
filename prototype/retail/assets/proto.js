/* Snellman Retail – klikattava prototyyppi.
   Pieni ajonaikainen: sivun pohja <template id="tpl"> + Component.renderVals() → #app.
   Tukee {{arvo}}-paikkoja, <sc-if>, <sc-for> ja onClick/onChange-käsittelijöitä.
   Lisäksi yhteiset vuorovaikutukset: määrävalitsimet, korin laskuri, haitarit,
   valikot ja linkit flow'n sivujen välillä. */
(function () {
  "use strict";
  window.DCLogic = function () { this.state = {}; };
  DCLogic.prototype.setState = function (p) { Object.assign(this.state, p); render(); };

  function get(scope, path) { return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope); }
  function hole(s) { var m = /^\s*\{\{\s*([\w.]+)\s*\}\}\s*$/.exec(s || ""); return m && m[1]; }
  function interp(s, scope) { return s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function (_, p) { var v = get(scope, p); return v == null ? "" : v; }); }
  function proc(node, scope) {
    Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) { if (ch.nodeValue.indexOf("{{") > -1) ch.nodeValue = interp(ch.nodeValue, scope); return; }
      if (ch.nodeType !== 1) return;
      var tag = ch.tagName.toLowerCase(), f;
      if (tag === "sc-if") {
        if (get(scope, hole(ch.getAttribute("value")))) {
          f = document.createDocumentFragment(); while (ch.firstChild) f.appendChild(ch.firstChild);
          proc(f, scope); ch.replaceWith(f);
        } else ch.remove();
        return;
      }
      if (tag === "sc-for") {
        var list = get(scope, hole(ch.getAttribute("list"))) || [], as = ch.getAttribute("as");
        f = document.createDocumentFragment();
        list.forEach(function (it) {
          var c = document.createDocumentFragment();
          Array.prototype.forEach.call(ch.childNodes, function (n) { c.appendChild(n.cloneNode(true)); });
          var sc = Object.create(scope); sc[as] = it; proc(c, sc); f.appendChild(c);
        });
        ch.replaceWith(f); return;
      }
      Array.prototype.slice.call(ch.attributes).forEach(function (a) {
        if (a.value.indexOf("{{") < 0) return;
        var p = hole(a.value), n = a.name, v;
        if (p && /^on/.test(n)) { v = get(scope, p); ch.removeAttribute(n); if (typeof v === "function") ch.addEventListener(n.slice(2), v); return; }
        if (p && /^(checked|disabled|selected|hidden)$/.test(n)) { v = get(scope, p); ch.removeAttribute(n); if (v) ch.setAttribute(n, ""); if (n === "checked") ch.checked = !!v; return; }
        ch.setAttribute(n, interp(a.value, scope));
      });
      proc(ch, scope);
    });
  }
  var comp;
  function render() {
    var tpl = document.getElementById("tpl"), app = document.getElementById("app");
    var vals = comp ? comp.renderVals() : {};
    var f = tpl.content.cloneNode(true); proc(f, vals); app.replaceChildren(f);
    syncCart();
  }

  /* ── Kori: rivimäärä säilyy sivulta toiselle ─────────────────── */
  var KEY = "snproto-cart";
  function cartN() { try { var v = parseInt(localStorage.getItem(KEY), 10); return isNaN(v) ? 7 : v; } catch (e) { return 7; } }
  function setCart(n) { try { localStorage.setItem(KEY, String(n)); } catch (e) {} syncCart(); }
  function syncCart() {
    var n = cartN();
    document.querySelectorAll(".util__count .cap").forEach(function (el) { el.textContent = n; });
    document.querySelectorAll(".util--cart .vh").forEach(function (el) { el.textContent = ", " + n + " tuotetta"; });
  }

  /* ── Ilmoitus ───────────────────────────────────────────────── */
  var toastT;
  function toast(msg) {
    var t = document.getElementById("proto-toast");
    if (!t) { t = document.createElement("div"); t.id = "proto-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("is-on"); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  /* ── Linkit, joilla ei ole kohdetta canvaksella ─────────────── */
  var MAP = {
    "lähetä tilaus": "Vahvistus.html", "vahvista tilaus": "Vahvistus.html",
    "takaisin koriin": "Ostoskori.html", "muokkaa koria": "Ostoskori.html", "takaisin etusivulle": "Main.html",
    "kirjaudu ulos": "EtusivuA.html", "lue tilausehdot": "Tilausehdot.html", "tilausehdot": "Tilausehdot.html",
    "unohtuiko salasana?": "KirjautuminenPalautus.html", "kaikki kategoriat": "Pikatilaus.html", "tuotteet": "Pikatilaus.html",
    "kategoriat": "Pikatilaus.html", "selaa": "Pikatilaus.html", "selaa kategorioita": "Pikatilaus.html",
    "jatka ostoksia": "Pikatilaus.html", "katso tilaukset": "Tilaukset.html", "avaa kategoriasivu": "Pikatilaus.html",
    "asiakaspalvelu": "Asiakaspalvelu.html", "takaisin kirjautumiseen": "EtusivuA.html", "pikatilaus": "Pikatilaus.html",
    "snellman outlet": "Outlet.html", "avaa outlet": "Outlet.html", "kaikki erät": "Outlet.html", "osoitteet": "Tilaukset.html", "tilitiedot": "Tilaukset.html",
    "vaihda tilin tiedoissa": "Tilaukset.html", "tietosuoja": "Tilausehdot.html#tietosuoja", "tietosuojaseloste": "Tilausehdot.html#tietosuoja", "yksityisyys ja evästeet": "Tilausehdot.html#tietosuoja", "vaihda": "Main.html",
    "pyydä tunnukset": "Tunnukset.html", "pyydä lisäkäyttäjä": "Tunnukset.html", "kirjaudu": "EtusivuA.html#kirjaudu", "selaa tuotteita": "Pikatilaus.html"
  };
  var LATER = { "lataa lasku (pdf)": "Lasku avautuu PDF-tiedostona.", "avaa tuotesivu": "Tuotesivu on WooCommercen vakiosivu, ei mukana prototyypissä.", "soita asiakaspalveluun": "Puhelinnumero lisätään, kun Snellman vahvistaa sen." };
  window.protoCart = function (n) { setCart(n); };
  function label(el) { return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(); }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("a, button"); if (!el) return;
    var txt = label(el);

    /* Määrävalitsin */
    var atc = el.closest(".atc");
    if (atc && el.tagName === "BUTTON") {
      e.preventDefault();
      var inp = atc.querySelector("input"), minus = atc.querySelector("button");
      var add = /^Lisää/.test(el.getAttribute("aria-label") || "");
      var v = Math.max(0, (parseInt(inp.value, 10) || 0) + (add ? 1 : -1)), was = parseInt(inp.value, 10) || 0;
      inp.value = v; minus.disabled = v === 0; atc.classList.toggle("is-empty", v === 0);
      var row = atc.closest(".pch"); if (row) row.classList.toggle("pch--in-cart", v > 0);
      if (!el.closest(".pch--cart")) {
        if (was === 0 && v > 0) { setCart(cartN() + 1); toast("Lisätty koriin: " + (atc.getAttribute("data-name") || (row && row.querySelector(".pch__title, .reco__t") || {}).textContent || "tuote")); }
        else if (was > 0 && v === 0) { setCart(Math.max(0, cartN() - 1)); toast("Poistettu korista"); }
      }
      return;
    }
    /* Korin rivin poisto */
    if (el.closest(".pch-b__remove")) { e.preventDefault(); var c = el.closest(".cell"); if (c) { c.remove(); setCart(Math.max(0, cartN() - 1)); toast("Rivi poistettu korista"); } return; }

    /* Haitari */
    if (el.classList.contains("acc__btn") || el.classList.contains("pch-x__more-text")) {
      var id = el.getAttribute("aria-controls"), p = id && document.getElementById(id);
      var open = el.getAttribute("aria-expanded") !== "true"; el.setAttribute("aria-expanded", open);
      if (p) p.hidden = !open; else if (el.classList.contains("pch-x__more-text")) toast("Tuotetiedot avautuvat tähän tuotannossa.");
      return;
    }
    /* Näytä / piilota salasana */
    if (el.classList.contains("pw-toggle")) {
      var pi = document.getElementById(el.getAttribute("aria-controls")); if (!pi) return;
      var show = pi.type === "password"; pi.type = show ? "text" : "password";
      el.setAttribute("aria-label", show ? "Piilota salasana" : "Näytä salasana");
      var cp = el.querySelector(".cap"); if (cp) cp.textContent = show ? "Piilota" : "Näytä"; return;
    }
    /* Tili-valikko headerin oikeassa reunassa */
    if (el.classList.contains("util--account")) {
      var am = document.getElementById(el.getAttribute("aria-controls")), ao = el.getAttribute("aria-expanded") !== "true";
      el.setAttribute("aria-expanded", ao); if (am) am.hidden = !ao; return;
    }
    /* Headerin Tili-valikko ja puhelimen valikko */
    if (el.classList.contains("site-nav__toggle")) {
      var sub = el.parentElement.querySelector(".site-nav__sub"), o = el.getAttribute("aria-expanded") !== "true";
      el.setAttribute("aria-expanded", o); if (sub) sub.hidden = !o; return;
    }
    if (el.classList.contains("menu-toggle")) {
      var o2 = el.getAttribute("aria-expanded") !== "true";
      el.setAttribute("aria-expanded", o2); var hd = el.closest(".site-header"); if (hd) hd.classList.toggle("is-open", o2); return;
    }
    /* Kirjautuminen */
    if (el.type === "submit" && el.closest(".login-card") && /lähetä linkki/.test(txt)) {
      e.preventDefault(); var fm = el.closest("form") || el.parentElement, fh = fm.querySelector("h1");
      fm.innerHTML = (fh ? fh.outerHTML : "") + '<p class="login-card__lead" role="status">Salasanan vaihtolinkki on lähetetty sähköpostiin. Linkki on voimassa 24 tuntia.</p><p class="login-card__lost"><a href="EtusivuA.html">Takaisin kirjautumiseen</a></p>'; return;
    }
    if (el.type === "submit" && el.closest(".login-card")) { e.preventDefault(); setCart(7); location.href = "Main.html"; return; }
    if (el.type === "submit" && el.closest(".site-search, .osearch, form[role=search]")) { e.preventDefault(); location.href = "Haku.html"; return; }

    if (el.tagName === "A") {
      var href = el.getAttribute("href") || "";
      if (href !== "#" && href !== "") return;
      e.preventDefault();
      if (el.closest(".cat-grid, .catgrid, .others, .subnav")) { location.href = "Pikatilaus.html"; return; }
      if (el.closest(".pch__title, .reco__t")) { var mb = el.closest(".pch").querySelector(".pch-x__more-text"); if (mb) mb.click(); else location.href = "Pikatilaus.html?q=" + encodeURIComponent(el.textContent.trim()); return; }
      if (el.classList.contains("start-link")) { var tt = label(el.querySelector(".start-link__t") || el); location.href = /outlet/.test(tt) ? "Outlet.html" : /tilaa uudelleen/.test(tt) ? "Tilaukset.html" : "Pikatilaus.html"; return; }
      if (el.classList.contains("card--link") && /lataa pdf/i.test(el.textContent)) { toast("Tilausehdot avautuvat PDF-tiedostona."); return; }
      if (el.classList.contains("card--link")) { location.href = /tilausehdot/i.test(el.textContent) ? "Tilausehdot.html" : "Asiakaspalvelu.html"; return; }
      if (MAP[txt]) { location.href = MAP[txt]; return; }
      if (LATER[txt]) { toast(LATER[txt]); return; }
      if (el.classList.contains("brand")) { location.href = document.querySelector(".site-header--a") ? "EtusivuA.html" : "Main.html"; return; }
      for (var k in MAP) { if (txt.indexOf(k) === 0) { location.href = MAP[k]; return; } }
      location.href = document.querySelector(".site-header--a") ? "EtusivuA.html" : "Main.html";
      return;
    }
    if (el.tagName === "BUTTON" && !el.hasAttribute("onclick")) {
      if (MAP[txt]) { e.preventDefault(); location.href = MAP[txt]; return; }
      if (LATER[txt]) { e.preventDefault(); toast(LATER[txt]); }
    }
  });
  /* Määrän kirjoittaminen kenttään: tyhjä tai 0 palauttaa plus-painikkeen */
  document.addEventListener("change", function (e) {
    var inp = e.target.closest(".atc input"); if (!inp) return;
    var atc = inp.closest(".atc"), v = Math.max(0, parseInt(inp.value, 10) || 0), mx = parseInt(inp.max, 10);
    if (mx && v > mx) v = mx;
    inp.value = v; atc.querySelector("button").disabled = v === 0; atc.classList.toggle("is-empty", v === 0);
  });
  document.addEventListener("submit", function (e) { e.preventDefault(); });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".util-menu")) return;
    document.querySelectorAll(".util--account[aria-expanded=true]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); var m = document.getElementById(b.getAttribute("aria-controls")); if (m) m.hidden = true; });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.click(); });


  /* ── Tuotteet-näkymä: kategoria, haku ja Boost-rajaus ─────────── */
  var MINE = /porsaan ulkofilee n1,3kg|naudan jauheliha 17|fileepihvi italian|kotimainen meetvursti|voileipämeetvursti|kunnon grillimakkara 400g|jauhelihakiusaus|pippurihärkää|mango-chili|vuohenjuusto|possu-pekoni/;
  function quick() { return document.querySelector(".quick-main"); }
  function sections(main) {
    var out = [];
    main.querySelectorAll(".cath").forEach(function (h) {
      var ul = h.nextElementSibling; while (ul && !ul.matches("ul.grid")) ul = ul.nextElementSibling;
      var g = h.previousElementSibling; while (g && !g.matches(".grouplabel")) g = g.previousElementSibling;
      out.push({ head: h, list: ul, id: (h.querySelector("h2") || {}).id || "", kk: !!g && /kokkikartano/i.test(g.textContent) });
    });
    return out;
  }
  function applyQuick() {
    var main = quick(); if (!main) return;
    var cat = (document.querySelector('.facet button[id^="qcat-"][aria-pressed="true"]') || {}).id || "qcat-all";
    var slug = cat.replace("qcat-", ""), q = ((document.getElementById("wf-qq") || {}).value || "").trim().toLowerCase();
    var boost = (document.getElementById("qt-boost") || {}).checked, mine = (document.getElementById("qt-mine") || {}).checked;
    var brand = ((document.querySelector('.facet button[id^="qbrand-"][aria-pressed="true"]') || {}).id || "qbrand-all").replace("qbrand-", "");
    var filtered = slug !== "all" || q || boost || mine || brand !== "all", shown = 0;
    main.classList.toggle("is-filtered", !!filtered);
    sections(main).forEach(function (sec) {
      var on = slug === "all" || sec.id === "qc-" + slug, n = 0;
      if (sec.list) sec.list.querySelectorAll(":scope > .cell").forEach(function (c) {
        var t = c.textContent.toLowerCase();
        var ok = on && (!q || t.indexOf(q) > -1) && (!boost || c.querySelector(".pch--boost")) && (!mine || MINE.test(t)) && (brand === "all" || (brand === "kokkikartano") === sec.kk);
        c.style.display = ok ? "" : "none"; if (ok) n++;
      });
      var vis = on && (n > 0 || !filtered);
      sec.head.style.display = vis ? "" : "none"; if (sec.list) sec.list.style.display = vis ? "" : "none";
      shown += n;
    });
    main.querySelectorAll(".grouplabel").forEach(function (g) { g.style.display = filtered ? "none" : ""; });
    var cnt = document.getElementById("wf-qq-count"); if (cnt) cnt.textContent = q ? shown + (shown === 1 ? " osuma" : " osumaa") : "";
    return shown;
    var h1 = document.getElementById("page-title");
    if (h1) { var b = document.getElementById(cat); h1.textContent = slug === "all" ? "Kaikki tuotteet" : b.querySelector("span").textContent; }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest('.facet button[id^="qcat-"]');
    if (b) {
      document.querySelectorAll('.facet button[id^="qcat-"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      applyQuick(); var m = quick(); if (m && m.getBoundingClientRect().top < 0) m.scrollIntoView({ block: "start" }); return;
    }
    var br = e.target.closest('.facet button[id^="qbrand-"]');
    if (br) { br.parentElement.parentElement.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === br ? "true" : "false"); }); applyQuick(); return; }
    var more = e.target.closest(".cath a");
    if (more) {
      e.preventDefault(); e.stopImmediatePropagation();
      var id = (more.closest(".cath").querySelector("h2") || {}).id || "";
      var t = document.getElementById(id.replace("qc-", "qcat-")); if (t) t.click(); return;
    }
    var st = e.target.closest("#wf-sidetoggle");
    if (st) { var pn = document.getElementById("wf-side"), op = st.getAttribute("aria-expanded") !== "true"; st.setAttribute("aria-expanded", op); if (pn) pn.classList.toggle("is-closed", !op); }
  }, true);
  document.addEventListener("input", function (e) { if (e.target.id === "wf-qq") applyQuick(); });
  document.addEventListener("change", function (e) { if (e.target.id === "qt-boost" || e.target.id === "qt-mine") applyQuick(); });

  /* Etusivun tarjousrajaus: Kaikki / Vain Boost / Vain Outlet */
  document.addEventListener("click", function (e) {
    var sb = e.target.closest(".rowfilter .selection"); if (!sb) return;
    var grp = sb.parentElement, ck = grp.querySelector(".ico");
    grp.querySelectorAll(".selection").forEach(function (x) { x.setAttribute("aria-pressed", x === sb ? "true" : "false"); });
    if (ck) sb.appendChild(ck);
    var mode = label(sb);
    var scope = grp.closest("section") || document;
    scope.querySelectorAll(".cell").forEach(function (c) {
      c.style.display = /boost/.test(mode) ? (c.querySelector(".pch--boost") ? "" : "none") : /outlet/.test(mode) ? (c.querySelector(".pch--outlet") ? "" : "none") : "";
    });
  });

  /* Haun ja Outletin rajausnapit sekä Outletin toimituspäivä */
  function applyChips() {
    var on = function (id) { var b = document.getElementById(id); return b && b.getAttribute("aria-pressed") === "true"; }, n = 0;
    document.querySelectorAll("#tuotteet .cell, .block--list .cell").forEach(function (c) {
      var p = c.querySelector(".pch") || c, ready = /Tuotenumero 2/.test(c.textContent), ok = true;
      if (on("chip-boost") || on("chip-type-boost")) ok = ok && p.classList.contains("pch--boost");
      if (on("chip-type-outlet")) ok = ok && p.classList.contains("pch--outlet");
      if (on("chip-family-meat")) ok = ok && !ready;
      if (on("chip-family-ready")) ok = ok && ready;
      c.style.display = ok ? "" : "none"; if (ok && !p.classList.contains("pch--soldout")) n++;
    });
    document.querySelectorAll(".count[aria-live]").forEach(function (el) { el.textContent = el.textContent.replace(/^\d+/, n); });
  }
  document.addEventListener("click", function (e) {
    var cb = e.target.closest(".chips .selection");
    if (cb) {
      var grp = cb.closest(".chips"), single = grp.getAttribute("role") === "group";
      if (single) grp.querySelectorAll(".selection").forEach(function (x) { x.setAttribute("aria-pressed", x === cb ? "true" : "false"); });
      else cb.setAttribute("aria-pressed", cb.getAttribute("aria-pressed") === "true" ? "false" : "true");
      grp.querySelectorAll(".selection").forEach(function (x) {
        var ic = x.querySelector(".ico"), pr = x.getAttribute("aria-pressed") === "true";
        if (pr && !ic) x.insertAdjacentHTML("beforeend", '<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>');
        if (!pr && ic) ic.remove();
      });
      applyChips(); e.stopImmediatePropagation(); return;
    }
    var wb = e.target.closest(".warehouse__button, button[aria-controls='wf-cal']");
    if (wb) {
      var cal = document.getElementById(wb.getAttribute("aria-controls"));
      if (!cal) { location.href = "Main.html"; return; }
      e.stopImmediatePropagation();
      var wo = wb.getAttribute("aria-expanded") !== "true"; wb.setAttribute("aria-expanded", wo); cal.hidden = !wo; return;
    }
    var cd = e.target.closest(".cal .cal__day");
    if (cd && cd.getAttribute("aria-disabled") !== "true") {
      var cl = cd.closest(".cal");
      cl.querySelectorAll(".cal__day").forEach(function (x) { x.setAttribute("aria-checked", x === cd ? "true" : "false"); });
      var ob = document.querySelector('[aria-controls="' + cl.id + '"]');
      var dl = cd.getAttribute("aria-label").split(",")[0] + "2026", dv = document.querySelector(".delivery__value");
      if (dv) dv.textContent = dl;
      if (ob) { var oc = ob.querySelector(".cap"); if (oc && ob.classList.contains("warehouse__button")) oc.textContent = "Toimituspäivä: " + dl; ob.setAttribute("aria-expanded", "false"); cl.hidden = true; }
      toast("Toimituspäivä vaihdettu: " + cd.getAttribute("aria-label").split(",")[0]); return;
    }
    if (cd) { toast(cd.getAttribute("aria-label")); return; }
    var om = e.target.closest(".omore button");
    if (om) { toast("Seuraavat 6 tilausta latautuvat listan jatkoksi."); return; }
  }, true);

  /* ── Prototyypin sivuvalikko ───────────────────────────────── */
  var PAGES = [["Etusivu, kirjautumaton", "EtusivuA.html"], ["Pyydä tunnukset", "Tunnukset.html"],
    ["Etusivu, kirjautunut", "Main.html"], ["Kaikki tuotteet", "Pikatilaus.html"],
    ["Hakutulokset", "Haku.html"], ["Snellman Outlet", "Outlet.html"], ["Ostoskori ja kassa", "Ostoskori.html"],
    ["Tilausvahvistus", "Vahvistus.html"], ["Tilaukset", "Tilaukset.html"], ["Reklamaatio", "Reklamaatio.html"],
    ["Asiakaspalvelu", "Asiakaspalvelu.html"], ["Tilausehdot", "Tilausehdot.html"]];
  function protoNav() {
    var here = location.pathname.split("/").pop() || "index.html";
    var d = document.createElement("details"); d.id = "proto-nav";
    d.innerHTML = "<summary>Prototyyppi · sivut</summary><ol>" + PAGES.map(function (p) {
      return '<li><a href="' + p[1] + '"' + (p[1] === here ? ' aria-current="page"' : "") + ">" + p[0] + "</a></li>";
    }).join("") + '</ol><button type="button" id="proto-reset">Palauta kori (7 tuotetta)</button>';
    document.body.appendChild(d);
    document.getElementById("proto-reset").addEventListener("click", function () { setCart(7); toast("Korin laskuri palautettu."); });
  }

  window.addEventListener("DOMContentLoaded", function () {
    if (typeof window.Component === "function") comp = new window.Component();
    render(); protoNav();
    var hb = location.hash && document.getElementById(location.hash.slice(1));
    if (hb && hb.matches('.facet button[id^="qcat-"]')) { document.querySelectorAll('.facet button[id^="qcat-"]').forEach(function (x) { x.setAttribute("aria-pressed", x === hb ? "true" : "false"); }); }
    var qp = new URLSearchParams(location.search).get("q"), qi = document.getElementById("wf-qq");
    if (qp && qi) qi.value = qp;
    var hits = applyQuick();
    while (qp && qi && hits === 0 && qi.value.indexOf(" ") > -1) { qi.value = qi.value.replace(/\s+\S+$/, ""); hits = applyQuick(); }
    if (qp && qi && hits === 0) { qi.value = ""; applyQuick(); }
    if (document.querySelector(".confirm-hero")) setCart(0);
  });
})();
