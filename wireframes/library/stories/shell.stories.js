/* Kehys: header, footer, toimituspäivä */

SNL.add({
  id: "header",
  title: "Header",
  group: "Kehys",
  component: "header",
  block: "parts/header.html + core/navigation",
  status: "on",
  spec: "01-etusivu.md",
  sources: ["01-etusivu.html"],
  usedIn: ["Kaikki sivut"],
  layout: "fullscreen",
  description:
    "Täysleveä tumma vihreä palkki (#00522c). Tila A = kirjautumaton: vain Asiakaspalvelu, Tilausehdot ja Kirjaudu. " +
    "Tila B = kirjautunut: tilausnavigaatio, haku ja kori tuotemääränä. Snellman Outlet näkyy vain Outlet-oikeudelliselle.",
  notes: [
    "Haku ei ole speksin B0-navigaatiossa. Lisätty ehdotuksena: Sari-persona hakee tuotteita nimellä.",
    "Kapeassa header ei ole sticky. Navi on Valikko-painikkeen takana (tuotannossa core/navigation overlay), jotta Tilaukset ja Snellman Outlet eivät jää ruudun ulkopuolelle.",
    "Fokusrengas on tummalla pohjalla valkoinen (--c-focus-on-dark). Vihreä vihreällä oli 1:1.",
    "Tili on alavalikko (01-etusivu.md B0: Osoitteet, Tilitiedot, Kirjaudu ulos; ei linkkiä /my-account/-etusivulle). Navi-kohteen children tekee siitä disclosure-painikkeen, ei ARIA-menua: linkit pysyvät linkkeinä ja Tab kulkee niissä. Esc sulkee ja palauttaa fokuksen painikkeelle, klikkaus tai fokus ulos sulkee. Kapeassa alalista avautuu Valikon sisällä. Tapahtuma sn:menu { menu, open, via }."
  ],
  argTypes: {
    state:     { control: "radio", options: ["a", "b"], labels: { a: "A kirjautumaton", b: "B kirjautunut" } },
    current:   { control: "select", options: ["", "kategoriat", "pikatilaus", "outlet", "tilaukset", "tili", "osoitteet", "tilitiedot", "cart"], labels: { "": "(ei mikään)" }, desc: "Alavalikon kohde (osoitteet, tilitiedot) merkitsee myös Tili-painikkeen.", if: { arg: "state", eq: "b" } },
    outlet:    { control: "boolean", desc: "Outlet-oikeus.", if: { arg: "state", eq: "b" } },
    search:    { control: "boolean", if: { arg: "state", eq: "b" } },
    cartCount: { control: "number", min: 0, desc: "Tuotteita korissa. 0 = ei laskuria. Ruudunlukija kuulee ”Kori, 3 tuotetta”.", if: { arg: "state", eq: "b" } },
    menuOpen:  { control: "boolean", desc: "Valikko auki (näkyy kapeassa: B alle 1024 px, A alle 600 px)." },
    submenuOpen: { control: "select", options: ["", "tili"], labels: { "": "(kiinni)" }, desc: "Alavalikko auki alussa.", if: { arg: "state", eq: "b" } }
  },
  args: { state: "b", current: "kategoriat", outlet: true, search: true, cartCount: 3, menuOpen: false, submenuOpen: "" },
  stories: [
    { id: "kirjautunut", name: "B · kirjautunut" },
    { id: "ei-outlet", name: "B · ei Outlet-oikeutta", args: { outlet: false } },
    { id: "tyhja-kori", name: "B · tyhjä kori", args: { cartCount: 0 } },
    { id: "tili-valikko", name: "B · Tili-valikko auki", args: { submenuOpen: "tili", current: "tilitiedot" },
      note: "Pudotusvalikko leveässä. Kokeile Esc ja Tab ulos." },
    { id: "kirjautumaton", name: "A · kirjautumaton", args: { state: "a" } },
    { id: "mobiili-valikko", name: "Mobiili · valikko auki", args: { menuOpen: true },
      note: "Katso 390 px:n leveydellä. Logo, kori ja Valikko samalla rivillä, haku täysleveänä, navi valikon takana 48 px:n riveinä." },
    { id: "mobiili-tili", name: "Mobiili · Tili auki valikossa", args: { menuOpen: true, submenuOpen: "tili" },
      note: "Katso 390 px:n leveydellä. Alalista avautuu Valikon sisällä sisennettynä." }
  ]
});

SNL.add({
  id: "footer",
  title: "Footer",
  group: "Kehys",
  component: "footer",
  block: "parts/footer.html",
  status: "on",
  layout: "fullscreen",
  description: "Tumma antrasiitti. Kirjautuneelle lisätään Kirjaudu ulos.",
  argTypes: { loggedIn: { control: "boolean" } },
  args: { loggedIn: true },
  stories: [
    { id: "kirjautunut", name: "Kirjautunut" },
    { id: "kirjautumaton", name: "Kirjautumaton", args: { loggedIn: false } }
  ]
});

SNL.add({
  id: "toimituspaiva",
  title: "Toimituspäivä",
  group: "Kehys",
  component: "delivery",
  block: "gds/warehouse",
  status: "laajennus",
  spec: "07-ostoskori.md",
  sources: ["06-tuoterivi.html", "07-ostoskori.html"],
  usedIn: ["02 Kategoriat", "03 Outlet", "06 Tuoterivi", "07 Ostoskori · K2"],
  width: 792,
  description:
    "Sivun portinvartija: ilman valittua päivää ei hintoja eikä määriä. Kun päivää ei ole, sekä listassa että korissa on sama ensisijainen painike ja perustelu. " +
    "Ryhmät nimetään asiakkaan kielellä (Kokkikartanon valmisruoat, lihatuotteet), ei varastokaupungeilla. " +
    "Painike listan yläpuolella (kaupan nykyinen gds/warehouse), paneeli korissa (tavoitepäivä + toteutuva päivä per ryhmä).",
  argTypes: {
    variant: { control: "radio", options: ["button", "panel"], labels: { button: "Painike (lista)", panel: "Paneeli (kori)" } },
    date:    { control: "text", desc: "Tyhjä = ei valittu." },
    note:    { control: "text" },
    result:  { control: "text", if: { arg: "variant", eq: "panel" }, desc: "Paneelin tulosrivi." }
  },
  args: { variant: "button", date: "ke 17.9.2026", note: "Tilaa viimeistään ti 16.9. klo 14", result: "" },
  stories: [
    { id: "valittu", name: "Valittu" },
    { id: "ei-valittu", name: "Ei valittu", args: { date: "" } },
    { id: "paneeli", name: "Korin paneeli", args: { variant: "panel", result: "Toimitetaan kahdessa osassa: Kokkikartanon valmisruoat ke 17.9., lihatuotteet to 18.9." } },
    { id: "paneeli-tyhja", name: "Korin paneeli, ei päivää", args: { variant: "panel", date: "", note: "" } }
  ]
});

SNL.add({
  id: "kalenteri",
  title: "Kalenteri",
  group: "Kehys",
  component: "calendar",
  block: "gds/warehouse (datepicker-popup)",
  status: "laajennus",
  sources: ["01-etusivu.html", "03-snellman-outlet.html", "07-ostoskori.html"],
  usedIn: ["01 Etusivu · B1", "03 Outlet · O1", "07 Ostoskori · K2"],
  width: 792,
  description:
    "Toimituspäivän valinta. Tuotannossa toimituspäivä-painike avaa popupin, jossa kalenteri näyttää vain reitin toimituspäivät; " +
    "wireframessä sama sisältö päivärivinä viikko kerrallaan. Päivät ovat radioryhmä: nuolinäppäimet siirtyvät valittavien päivien välillä. " +
    "Estetty päivä kertoo syyn tekstinä. Valitun päivän tilausaika näkyy alla, ja huomautus saatavuudesta on tuotannon oma teksti.",
  notes: ["Tuotannon kalenteri on kuukausinäkymä (easepick). Viikkorivi on wireframen yksinkertaistus: tilaaja valitsee lähes aina lähimmistä päivistä."],
  argTypes: {
    heading:      { control: "text", desc: "Tyhjä = ”Valitse toimituspäivä”." },
    headingLevel: { control: "radio", options: [2, 3, 4] },
    weekNav:      { control: "boolean" },
    weekLabel:    { control: "text", if: { arg: "weekNav", eq: true } },
    prevDisabled: { control: "boolean", if: { arg: "weekNav", eq: true }, desc: "Kuluva viikko: taaksepäin ei voi mennä." },
    note:         { control: "boolean", desc: "Huomautus saatavuudesta." },
    days:         { control: "json", desc: "[{ iso, wd, n, selected, disabled, reason, cutoff }]" }
  },
  args: { heading: "", headingLevel: 3, weekNav: true, weekLabel: "Viikko 38", prevDisabled: true, note: true, days: [
    { iso: "2026-09-14", wd: "ma", n: "14.9.", disabled: true, reason: "ei toimitusta" },
    { iso: "2026-09-15", wd: "ti", n: "15.9.", disabled: true, reason: "tilausaika päättynyt" },
    { iso: "2026-09-16", wd: "ke", n: "16.9.", cutoff: "ma 14.9. klo 14" },
    { iso: "2026-09-17", wd: "to", n: "17.9.", selected: true, cutoff: "ti 15.9. klo 14" },
    { iso: "2026-09-18", wd: "pe", n: "18.9.", cutoff: "ke 16.9. klo 14" }
  ] },
  stories: [
    { id: "valittu", name: "Päivä valittu" },
    { id: "ei-valittu", name: "Ei vielä valittu", args: { days: [
      { iso: "2026-09-16", wd: "ke", n: "16.9.", cutoff: "ma 14.9. klo 14" },
      { iso: "2026-09-17", wd: "to", n: "17.9.", cutoff: "ti 15.9. klo 14" },
      { iso: "2026-09-18", wd: "pe", n: "18.9.", cutoff: "ke 16.9. klo 14" }
    ] } },
    { id: "ei-paivia", name: "Viikolla ei toimituspäiviä", args: { weekLabel: "Viikko 52", prevDisabled: false, days: [
      { iso: "2026-12-24", wd: "to", n: "24.12.", disabled: true, reason: "pyhäpäivä" },
      { iso: "2026-12-25", wd: "pe", n: "25.12.", disabled: true, reason: "pyhäpäivä" }
    ] } },
    { id: "ilman-viikkoja", name: "Ilman viikkonavigointia", args: { weekNav: false, note: false } }
  ]
});

SNL.add({
  id: "ryhman-paiva",
  title: "Ryhmän toimituspäivä",
  group: "Kehys",
  component: "groupDate",
  block: "gds/cart/groups (retail-filtteri)",
  status: "uusi",
  sources: ["07-ostoskori.html"],
  usedIn: ["07 Ostoskori · toimitusryhmä"],
  width: 520,
  description:
    "Korin toimitusryhmän oma päivä. Jokainen lastauspaikka saa ensimmäisen päivän, jonka se ehtii tavoitepäivänä tai sen jälkeen; " +
    "asiakas voi siirtää yhden ryhmän myöhemmäksi muita siirtämättä. Vaihtoehtoina vain päivät, jotka lastauspaikka voi toimittaa. " +
    "Muutos hinnoittelee ja tarkistaa vain sen ryhmän (sn:groupdate).",
  notes: ["Toteutettu retail-haaroihin: wp-snellman-m3 feat/delivery-date-picker-per-loading-place, snellmanecom feat/retail-p0-fixtures (kentän nimi m3_delivery_date_<lastauspaikka>)."],
  argTypes: { label: { control: "text" }, value: { control: "text" }, note: { control: "boolean" }, options: { control: "json" } },
  args: { group: "800", label: "", value: "2026-09-17", note: true, options: [
    { value: "2026-09-17", label: "to 17.9." }, { value: "2026-09-18", label: "pe 18.9." }, { value: "2026-09-21", label: "ma 21.9." }
  ] },
  stories: [ { id: "oletus", name: "Tavoitepäivä" }, { id: "siirretty", name: "Siirretty myöhemmäksi", args: { value: "2026-09-21" } } ]
});
