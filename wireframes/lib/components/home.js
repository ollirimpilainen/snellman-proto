/* =================================================================
 * Etusivu tila B (TP2): aloituskortit (genero/quick-links) ja
 * kategoriaruudukko (genero/category-grid). Kauppakohtainen etusivu.
 * Puhelimella kortit ovat matalia rivejä (koko rivi on linkki, 64 px),
 * leveässä korkeita kortteja rinnakkain.
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, cls } = SN;

  /* ── Aloituskortit · genero/quick-links (uusi) ─────────────────────
     Kortti: { key, title, sub, subHtml, href, cta, tone: primary|outlet|"" }.
     gate: toimituspäivää ei ole valittu → jokainen kortti vie valitsimeen (gateHref).
     Tapahtuma: sn:startlink { key, gated } (sivu lähettää reorder_start ym.). */
  SN.UI.startLinks = { heading: "Aloita tästä", gate: "Valitse ensin toimituspäivä" };
  SN.register("startLinks", {
    defaults: { heading: "", headingId: "", gate: false, gateHref: "#toimituspaiva", items: [
      { key: "reorder", tone: "primary", title: "Tilaa uudelleen", sub: "Edellinen tilaus 8.9.2026, 14 riviä", href: "#", cta: "Katso ja lisää koriin" },
      { key: "categories", title: "Selaa kategorioita", sub: "Koko valikoima tuoteperheittäin", href: "#", cta: "Selaa" },
      { key: "outlet", tone: "outlet", title: "Snellman Outlet", sub: "12 erää tarjolla nyt", href: "#", cta: "Avaa Outlet" }
    ] },
    render(a) {
      const U = SN.UI.startLinks, hid = a.headingId || SN.uid("start");
      const cards = (a.items || []).map((x) =>
        '<li><a class="' + cls("start-link", x.tone && "start-link--" + x.tone) + '" href="' + esc(a.gate ? a.gateHref : x.href) + '"' +
          ' data-sn="start-link" data-key="' + esc(x.key || "") + '"' + (a.gate ? ' data-gated="1"' : "") + '>' +
          '<span class="start-link__t">' + esc(x.title) + '</span>' +
          '<span class="start-link__s">' + (a.gate ? esc(U.gate) : (x.subHtml || esc(x.sub))) + '</span>' +
          /* Koko kortti on linkki: "painike" on pelkkä ulkoasu. Puhelimella pelkkä nuoli. */
          /* Portitettuna ohje on jo alatekstissä: painikkeesta jää pelkkä nuoli, ei samaa lausetta kahdesti. */
          '<span class="start-link__go" aria-hidden="true">' + (a.gate ? "" : '<span class="start-link__cta">' + SN.cap(x.cta) + '</span>') + ico("arrow") + '</span>' +
        '</a></li>').join("");
      return '<div class="start-links"><h2 id="' + esc(hid) + '">' + esc(a.heading || U.heading) + '</h2>' +
        '<ul class="start-links__list" aria-labelledby="' + esc(hid) + '">' + cards + '</ul></div>';
    }
  });
  SN.behavior(function (root) {
    root.addEventListener("click", (e) => {
      const l = e.target.closest && e.target.closest('[data-sn="start-link"]'); if (!l) return;
      SN.emit(l, "startlink", { key: l.dataset.key, gated: l.dataset.gated === "1" });
    });
  });

  /* ── Kategoriaruudukko · genero/category-grid (uusi) ────────────────
     Nimi, ei kuvaa eikä tuotemäärää. Viimeinen kortti (all) korostettuna.
     Ryhmittely (tuoteperhe / lähtöpaikka) odottaa kategoriatietoja. */
  SN.UI.categoryGrid = { heading: "Kategoriat" };
  SN.register("categoryGrid", {
    defaults: { heading: "", headingId: "", items: [
      { label: "Tuore liha", href: "#" }, { label: "Leikkeleet", href: "#" }, { label: "Makkarat", href: "#" },
      { label: "Kokkikartanon valmisruoat", href: "#" }, { label: "Kypsät lihat", href: "#" }
    ], all: { label: "Kaikki kategoriat", href: "#" } },
    render(a) {
      const hid = a.headingId || SN.uid("cats");
      const items = (a.items || []).map((i) =>
        '<li><a class="cat-link" href="' + esc(i.href) + '" data-sn="cat-link" data-label="' + esc(i.label) + '">' +
          '<span>' + esc(i.label) + '</span>' + ico("chevronRight") + '</a></li>').join("") +
        (a.all ? '<li><a class="cat-link cat-link--all" href="' + esc(a.all.href) + '">' +
          '<span>' + esc(a.all.label) + '</span>' + ico("arrow") + '</a></li>' : "");
      return '<div class="cat-grid"><h2 id="' + esc(hid) + '">' + esc(a.heading || SN.UI.categoryGrid.heading) + '</h2>' +
        '<ul class="cat-grid__list" aria-labelledby="' + esc(hid) + '">' + items + '</ul></div>';
    }
  });
  SN.behavior(function (root) {
    root.addEventListener("click", (e) => {
      const l = e.target.closest && e.target.closest('[data-sn="cat-link"]'); if (!l) return;
      SN.emit(l, "catlink", { label: l.dataset.label });
    });
  });
})();
