/* Perusta-sivut: värit, typografia, välistys ja muodot, ikonit.
   Vain kirjastossa — sivut eivät lataa tätä. Arvot luetaan tokens.css:stä
   laskettuina (getComputedStyle), joten sivu näyttää sen mitä oikeasti piirretään. */
(function () {
  "use strict";
  const { esc, ico } = SN;

  const css = `
  .fd { font-size: 14px; line-height: 1.5; }
  .fd h2 { font-size: 24px; margin: 0 0 16px; }
  .fd h2:not(:first-child) { margin-top: 40px; }
  .fd-intro { color: var(--c-text-2); max-width: 70ch; margin-bottom: 24px; }
  .fd-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .fd-sw { background: #fff; border: 1px solid var(--c-border); border-radius: 8px; overflow: hidden; }
  .fd-sw__chip { height: 72px; display: flex; align-items: flex-end; justify-content: space-between; padding: 8px 10px; font-weight: 700; font-size: 13px; }
  .fd-sw__body { padding: 10px 12px; }
  .fd-sw__name { font-weight: 700; }
  .fd-sw__var, .fd-sw__hex { font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--c-meta); }
  .fd-sw__role { margin-top: 4px; color: var(--c-text-2); }
  .fd-aa { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 11px; background: rgba(255,255,255,.85); color: #000; }
  .fd-aa--fail { background: #bd0a0a; color: #fff; }
  .fd-table { width: 100%; border-collapse: collapse; }
  .fd-table th, .fd-table td { text-align: left; padding: 12px 8px; border-bottom: 1px solid var(--c-border); vertical-align: middle; }
  .fd-table th { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: var(--c-meta); }
  .fd-table code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--c-text-2); }
  .fd-bar { height: 16px; background: var(--c-primary); }
  .fd-box { width: 96px; height: 64px; background: #fff; border: 1px solid var(--c-border); }
  .fd-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  .fd-icon { background: #fff; border: 1px solid var(--c-border); border-radius: 8px; padding: 16px 8px; text-align: center; }
  .fd-icon .ico { display: flex; justify-content: center; width: auto; font-size: 28px; color: var(--c-primary); margin: 0 auto 8px; }
  .fd-icon code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 700; }
  .fd-icon__fa { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: var(--c-text-2); margin-top: 4px; word-break: break-word; }
  .fd-icon__src { font-size: 11px; color: var(--c-meta); margin-top: 4px; word-break: break-word; }
  .fd-icon--chosen { border-style: dashed; }`;
  if (!document.getElementById("fd-css")) {
    const s = document.createElement("style"); s.id = "fd-css"; s.textContent = css; document.head.appendChild(s);
  }

  /* WCAG-kontrasti */
  function lum(hex) {
    const m = hex.replace("#", "").match(/.{2}/g); if (!m) return 1;
    const [r, g, b] = m.slice(0, 3).map((x) => { const c = parseInt(x, 16) / 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); });
    return .2126 * r + .7152 * g + .0722 * b;
  }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function toHex(v) {
    v = v.trim(); if (v.startsWith("#")) return v.length === 4 ? "#" + [...v.slice(1)].map((c) => c + c).join("") : v.slice(0, 7);
    const m = v.match(/\d+(\.\d+)?/g); if (!m) return v;
    return "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
  }
  const val = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const COLORS = [
    { group: "Brändi ja pinnat", items: [
      ["--c-primary", "Primary", "Header, painikkeet, otsikot"],
      ["--c-bg", "Sivun pohja", "body"],
      ["--c-bg-block", "Pellava", "Lohkotausta, chip, yhteenveto"],
      ["--c-bg-accent", "Minttu", "Sivupalkit, toimituspäivä, hover"],
      ["--c-surface", "Kortti", "gds-card"],
      ["--c-dark", "Antrasiitti", "Footer, tummat lohkot"] ] },
    { group: "Teksti", items: [
      ["--c-text", "Teksti", "Leipä. Kauppa piirtää tuotelistan #000 — ero on tietoinen."],
      ["--c-text-2", "Toissijainen", "Ingressit, selitteet"],
      ["--c-meta", "Lisätiedot", "Tuotenumero, normaalihinta"],
      ["--c-disabled", "Estetty", "Estetyt painikkeet (ei tekstille)"] ] },
    { group: "Viivat", items: [
      ["--c-border", "Reuna", "Koristeellinen reuna"],
      ["--c-border-strong", "Vahva reuna", "Lomakekentät, 3:1 (WCAG 1.4.11)"] ] },
    { group: "Merkinnät ja tilat", items: [
      ["--c-boost-bg", "Boost", "Merkinnän tausta", "--c-boost-text"],
      ["--c-outlet-bg", "Outlet", "Merkinnän tausta", "--c-outlet-text"],
      ["--c-error", "Virhe", "Virheteksti, minimi"],
      ["--c-error-bg", "Virhepinta", "Virheilmoitus", "--c-error"],
      ["--c-warn-bg", "Varoituspinta", "Varoitus, Outlet-pinta", "--c-warn-text"],
      ["--c-fill-bg", "TÄYTTÖ", "Wireframe-merkintä, ei tuotantoon", "--c-fill-text"] ] }
  ];

  SN.register("fdColors", {
    render() {
      return '<div class="fd"><p class="fd-intro">theme.json-presetit, jotka piirtävät sivun. --gds-*-värit jäävät tuotannossa käyttämättä, joten niitä ei ole tässä. Kontrasti laskettu pinnan omaa tekstiväriä vasten; AA = 4.5:1.</p>' +
        COLORS.map((g) => '<h2>' + esc(g.group) + '</h2><div class="fd-swatches">' + g.items.map(([v, name, role, fgVar]) => {
          const hex = toHex(val(v));
          /* Näytteen teksti piirretään samalla värillä, jota vasten kontrasti lasketaan. */
          const fg = fgVar ? toHex(val(fgVar)) : (lum(hex) > .4 ? toHex(val("--c-text")) : "#ffffff");
          const r = ratio(hex, fg);
          return '<div class="fd-sw"><div class="fd-sw__chip" style="background:' + hex + ';color:' + fg + '">' +
            '<span>' + (fgVar ? "Aa" : "") + '</span><span class="fd-aa' + (r < 4.5 ? " fd-aa--fail" : "") + '">' + r.toFixed(2) + ':1</span></div>' +
            '<div class="fd-sw__body"><div class="fd-sw__name">' + esc(name) + '</div><div class="fd-sw__var">' + esc(v) + (fgVar ? " / " + esc(fgVar) : "") + '</div>' +
            '<div class="fd-sw__hex">' + esc(hex) + (fgVar ? " · " + esc(fg) : "") + '</div><div class="fd-sw__role">' + esc(role) + '</div></div></div>';
        }).join("") + '</div>').join("") + '</div>';
    }
  });

  const TYPE = [
    ["h1", "Otsikko 1", "Taberna Serif 400 · clamp 32–48px · ls 0.02em", "Tilaa tukusta suoraan"],
    ["h2", "Otsikko 2", "Taberna Serif 400 · clamp 28–34px", "Nyt tarjolla"],
    ["h3", "Otsikko 3", "TheSansB 500 · 24px", "Kokkikartano, Kerava"],
    ["h4", "Otsikko 4", "TheSansB 500 · 20px", "Toimituspäivä"],
    ["p", "Leipä", "TheSansB 400 · 16px / 1.75", "Tilaa viimeistään toimitusta edeltävänä arkipäivänä klo 12."],
    ["small", "Pieni", "TheSansB 400 · 14px", "Tuotenumero: 20550"],
    ["label", "Painike / navi", "TheSansB 700 · UPPERCASE · 1.28px", "Jatka yhteenvetoon"],
    ["micro", "Lisätieto", "11px · UPPERCASE · merkinnät", "Boost"]
  ];
  SN.register("fdType", {
    render() {
      const sample = (tag, text) => {
        if (tag === "p") return '<p style="margin:0">' + esc(text) + '</p>';
        if (tag === "small") return '<span style="font-size:var(--fs-small)">' + esc(text) + '</span>';
        if (tag === "label") return '<span style="font-weight:700;text-transform:uppercase;letter-spacing:var(--ls-button);color:var(--c-primary)">' + esc(text) + '</span>';
        if (tag === "micro") return '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">' + esc(text) + '</span>';
        return '<' + tag + ' style="margin:0">' + esc(text) + '</' + tag + '>';
      };
      return '<div class="fd"><p class="fd-intro">Kaksi perhettä, selvä raja: Taberna Serif vain H1–H2 (renderöi gemenat kapiteeleina — brändin ilme, ei bugi), kaikki muu TheSansB. Fontit ladataan shop.snellman.fi:stä, joten kirjasto vaatii http-palvelimen.</p>' +
        '<table class="fd-table"><thead><tr><th style="width:55%">Näyte</th><th>Rooli</th><th>Määritys</th></tr></thead><tbody>' +
        TYPE.map(([tag, name, spec, text]) => '<tr><td>' + sample(tag, text) + '</td><td><b>' + esc(name) + '</b></td><td><code>' + esc(spec) + '</code></td></tr>').join("") +
        '</tbody></table></div>';
    }
  });

  SN.register("fdSpacing", {
    render() {
      const gaps = [4, 8, 12, 16, 24, 32, 40, 48, 60, 80];
      const shapes = [
        ["--r-none", "0", "Painike, input — terävä kulma on brändi", "border-radius:0"],
        ["--r-card", "8px", "Kortti (korissa), toimituspäivä, ilmoitus", "border-radius:8px"],
        ["--r-tag", "10px", "Merkintä", "border-radius:10px"],
        ["--shadow-card", "2px 3px 8px #0000001f", "Kortin varjo — ainoa varjo", "box-shadow:var(--shadow-card);border:0"]
      ];
      const layout = [["--container", "1200px", "alignwide"], ["--container-text", "792px", "contentSize"], ["--pad", "24px / 15px", "sivun reunus (mobiili < 37.5em)"],
        ["--touch", "44px", "kosketuskohteen minimi"], ["breakpoint", "64em / 37.5em", "kaupan breakpointit (1024 / 600px)"]];
      return '<div class="fd"><h2>Välistys — GDS-skaala</h2><table class="fd-table"><tbody>' +
        gaps.map((g) => '<tr><td style="width:120px"><code>--gap-' + g + '</code></td><td style="width:60px">' + g + 'px</td><td><div class="fd-bar" style="width:' + g + 'px"></div></td></tr>').join("") +
        '</tbody></table><h2>Muodot</h2><table class="fd-table"><tbody>' +
        shapes.map(([v, x, role, style]) => '<tr><td style="width:120px"><div class="fd-box" style="' + style + '"></div></td><td><code>' + v + '</code><br>' + esc(x) + '</td><td>' + esc(role) + '</td></tr>').join("") +
        '</tbody></table><h2>Layout</h2><table class="fd-table"><tbody>' +
        layout.map(([v, x, role]) => '<tr><td style="width:180px"><code>' + v + '</code></td><td style="width:140px">' + esc(x) + '</td><td>' + esc(role) + '</td></tr>').join("") +
        '</tbody></table></div>';
    }
  });

  SN.register("fdIcons", {
    render() {
      const all = Object.keys(SN.ICONS);
      const card = (k) => { const i = SN.ICONS[k];
        return '<div class="fd-icon' + (i.src ? "" : " fd-icon--chosen") + '">' + ico(k) + '<code>' + esc(k) + '</code><div class="fd-icon__fa">' + esc(i.fa) + '</div>' +
          '<div class="fd-icon__src">' + esc(i.src || "ei repossa — valittu Light") + '</div></div>'; };
      return '<div class="fd"><p class="fd-intro">Font Awesome Pro 6 Snellmanin omasta kitistä — sama kuin <code>generoi/snellmanecom</code>-teemassa ' +
        '(<code>app/setup.php</code>) ja GDS:n <code>gds-icon</code>issa. Tyyli on Light; teeman <code>fa fa-…</code> = Solid. ' +
        '<code>SN.ico("nimi")</code> renderöi <code>&lt;i class="fa-light fa-…"&gt;</code> kuten Blade- ja Vue-pohjat. Ikoni on aina aria-hidden; merkitys tulee tekstistä tai aria-labelista.</p>' +
        '<h2>Todennettu repossa tai kaupassa</h2><div class="fd-icons">' + all.filter((k) => SN.ICONS[k].src).map(card).join("") + '</div>' +
        '<h2>Ei vielä repossa</h2><p class="fd-intro">Wireframen tarvitsemat, valittu samasta Light-tyylistä. Vahvistettava toteutuksessa.</p><div class="fd-icons">' +
        all.filter((k) => !SN.ICONS[k].src).map(card).join("") + '</div></div>';
    }
  });
})();
