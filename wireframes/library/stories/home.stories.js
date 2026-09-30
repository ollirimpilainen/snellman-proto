/* Etusivu-ryhmä: tila B:n aloituskortit ja kategoriaruudukko (TP2) */

const START_REORDER = { key: "reorder", tone: "primary", title: "Tilaa uudelleen", sub: "Edellinen tilaus 8.9.2026, 14 riviä", href: "#", cta: "Katso ja lisää koriin" };
const START_QUICK = { key: "quick", title: "Pikatilaus", sub: "Koko valikoima yhdellä sivulla", href: "#", cta: "Avaa pikatilaus" };
const START_CATS = { key: "categories", title: "Selaa kategorioita", sub: "Koko valikoima tuoteperheittäin", href: "#", cta: "Selaa" };
const START_OUTLET = { key: "outlet", tone: "outlet", title: "Snellman Outlet", sub: "12 erää tarjolla nyt", href: "#", cta: "Avaa Outlet" };

SNL.add({
  id: "aloituskortit",
  title: "Aloituskortit",
  group: "Etusivu",
  component: "startLinks",
  block: "genero/quick-links (uusi)",
  status: "uusi",
  spec: "01-etusivu.md",
  sources: ["01-etusivu.html", "02-kategoriat.html"],
  usedIn: ["01 Etusivu · B2 Aloita tästä", "02 Kategoriat · pikapolut"],
  description:
    "Kirjautumisen jälkeisen etusivun tärkein kohta: ensimmäinen kortti on Tilaa uudelleen (tai Pikatilaus, jos tilauksia ei ole), sitten kategoriat ja Outlet. " +
    "Puhelimella kortit ovat 64 px:n rivejä peukalon alueella, ja koko rivi on linkki. 768 px:stä ylöspäin korkeita kortteja rinnakkain.",
  notes: [
    "Jos toimituspäivää ei ole valittu, jokainen kortti vie ensin valitsimeen ja kertoo sen (01-etusivu.md B1). Sivu avaa kalenterin ja siirtää fokuksen siihen.",
    "Tilaa uudelleen lataa edellisen tilauksen rivit koriin valitulle toimituspäivälle. Puuttuvat pudotetaan ja niistä ilmoitetaan korissa (07 ?reorder=partial).",
    "Outlet-kortti vain Outlet-oikeudelliselle. Ilman oikeutta kortteja on kaksi, ja rivi tasataan.",
    "Tapahtuma sn:startlink { key, gated }. Sivu lähettää reorder_start, kun key = reorder."
  ],
  argTypes: {
    gate:  { control: "boolean", group: "Tila", desc: "Toimituspäivää ei ole valittu." }
  },
  args: { gate: false, items: [START_REORDER, START_CATS, START_OUTLET] },
  stories: [
    { id: "oletus", name: "Tilauksia ja Outlet-oikeus" },
    { id: "ei-tilauksia", name: "Ei aiempia tilauksia", args: { items: [Object.assign({}, START_QUICK, { tone: "primary" }), START_CATS, START_OUTLET] } },
    { id: "ei-outlet", name: "Ei Outlet-oikeutta", args: { items: [START_REORDER, START_CATS] } },
    { id: "ei-paivaa", name: "Toimituspäivä valitsematta", args: { gate: true } },
    { id: "mobiili", name: "Puhelin", note: "Katso 375 px:n leveydellä: matalat rivit, pelkkä nuoli." }
  ]
});

SNL.add({
  id: "kategoriaruudukko",
  title: "Kategoriaruudukko",
  group: "Etusivu",
  component: "categoryGrid",
  block: "genero/category-grid (uusi) tai woocommerce/product-categories",
  status: "uusi",
  spec: "01-etusivu.md",
  sources: ["01-etusivu.html"],
  usedIn: ["01 Etusivu · B4 Kategoriat"],
  description:
    "Viisi pääkategoriaa ja Kaikki kategoriat. Nimi, ei kuvaa eikä tuotemäärää. Puhelimella kaksi saraketta 56 px, leveässä kolme saraketta 96 px, joten kuudes kortti ei jää yksin.",
  notes: [
    "Kategoriat ja järjestys vahvistetaan Snellmanilta. Ryhmittely (tuoteperhe tai lähtöpaikka) odottaa kategoriatietoja.",
    "Tapahtuma sn:catlink { label }. Kategoriasivu lähettää view_item_list (item_list_id = kategoria)."
  ],
  argTypes: { heading: { control: "text", group: "Sisältö" } },
  args: { heading: "Kategoriat" },
  stories: [
    { id: "oletus", name: "Oletus" },
    { id: "mobiili", name: "Puhelin", note: "Katso 375 px:n leveydellä." }
  ]
});
