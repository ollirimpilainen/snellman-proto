/* Perusosat: painike, merkintä, chip, ilmoitus, murupolku, TÄYTTÖ */

const ICONS = ["", "arrow", "cart", "calendar", "chevronDown", "check", "search", "xmark", "lock", "trash"];

SNL.add({
  id: "painike",
  title: "Painike",
  group: "Perusosat",
  component: "button",
  block: "core/button",
  status: "on",
  sources: ["01-etusivu.html", "07-ostoskori.html"],
  layout: "centered",
  description:
    "Terävä kulma (radius 0) on brändi. UPPERCASE, TheSansB 700, letter-spacing 1.28px. " +
    "Hover lisää valkoisen 20 % kerroksen, väri ei vaihdu. Tekstipainikkeen nuoli liikkuu 6px hoverissa. Minimikorkeus 44px.",
  notes: ["Letter-spacing 1.28px on speksin ja GDS-tokenin arvo. Henkilöstökaupassa mitattu arvo on normal."],
  argTypes: {
    label:    { control: "text" },
    variant:  { control: "radio", options: ["primary", "outline", "on-dark", "outline-on-dark", "text"], labels: { primary: "Ensisijainen", outline: "Ääriviiva", "on-dark": "Tummalla", "outline-on-dark": "Ääriviiva tummalla", text: "Tekstipainike" } },
    busy:     { control: "boolean", desc: "Lähetetään… (aria-busy)." },
    as:       { control: "radio", options: ["", "span"], labels: { "": "button / a", span: "span (kortin sisällä)" }, desc: "span: painikkeen ulkoasu kokonaan klikattavan kortin sisällä, ei linkkiä linkissä." },
    size:     { control: "radio", options: ["md", "sm"], if: { arg: "variant", ne: "text" } },
    icon:     { control: "select", options: ICONS, labels: { "": "(ei ikonia)" } },
    block:    { control: "boolean", desc: "Koko leveys.", if: { arg: "variant", ne: "text" } },
    disabled: { control: "boolean" },
    href:     { control: "text", desc: "Linkki → renderöityy <a>-elementtinä." }
  },
  args: { label: "Jatka yhteenvetoon", variant: "primary", size: "md", icon: "", block: false, disabled: false, busy: false, as: "", href: "" },
  stories: [
    { id: "ensisijainen", name: "Ensisijainen" },
    { id: "aariviiva", name: "Ääriviiva", args: { variant: "outline", label: "Jatka ostoksia" } },
    { id: "tummalla", name: "Tummalla pohjalla", args: { variant: "on-dark", label: "Kirjaudu", size: "sm" }, bg: "green" },
    { id: "aariviiva-tummalla", name: "Ääriviiva tummalla", args: { variant: "outline-on-dark", label: "Soita asiakaspalveluun" }, bg: "green" },
    { id: "lahettaa", name: "Lähettää", args: { busy: true, label: "Lähetä pyyntö" } },
    { id: "teksti", name: "Tekstipainike", args: { variant: "text", label: "Selaa kategorioita", icon: "arrow" } },
    { id: "pieni", name: "Pieni", args: { size: "sm", label: "Vaihda" } },
    { id: "estetty", name: "Estetty", args: { disabled: true, label: "Jatka yhteenvetoon" },
      note: "Esim. minimitilaus ei täyty. Syy kerrotaan aina painikkeen vieressä." }
  ]
});

SNL.add({
  id: "merkinta",
  title: "Merkintä",
  group: "Perusosat",
  component: "badge",
  block: "uusi lohko",
  status: "uusi",
  spec: "06-tuoterivi.md",
  layout: "centered",
  description: "Boost- ja Outlet-erän merkintä tuotekuvan päällä (tarra kuvan alareunassa). Aina teksti, ei pelkkä väri. Ruudunlukija kuulee alennuksen.",
  notes: ["Boost: tausta #ffdc4a, teksti #7a5800 (4.84:1). Speksin #af7e04 on 2.68:1."],
  argTypes: {
    type:     { control: "radio", options: ["boost", "outlet", "neutral"] },
    discount: { control: "number", min: 0, max: 100, desc: "Prosentti aria-labeliin." },
    label:    { control: "text", desc: "Tyhjä = sanaston oletus." },
    decorative: { control: "boolean", desc: "Selitteissä: ruudunlukija ohittaa (ei alennusta)." }
  },
  args: { type: "boost", discount: 30, label: "", decorative: false },
  stories: [
    { id: "boost", name: "Boost" },
    { id: "outlet", name: "Outlet", args: { type: "outlet", discount: 50 } },
    { id: "neutraali", name: "Neutraali", args: { type: "neutral", label: "Tilattu aiemmin" } }
  ]
});

SNL.add({
  id: "chip",
  title: "Valinta-chip",
  group: "Perusosat",
  component: "chip",
  block: "facetwp-selections",
  status: "on",
  sources: ["06-tuoterivi.html", "02-kategoriat.html"],
  layout: "centered",
  description: "Aktiivinen suodatin (poistettava) tai päälle/pois-suodatin, esim. alikategoriat ja Boost-suodatin. Poistettava chip on painike, jonka nimi on ”Valmisruoka, poista suodatin”.",
  argTypes: {
    label:   { control: "text" },
    mode:    { control: "radio", options: ["remove", "toggle", "link"], labels: { remove: "Poistettava", toggle: "Päälle/pois", link: "Ankkurilinkki" } },
    href:    { control: "text", if: { arg: "mode", eq: "link" } },
    pressed: { control: "boolean", if: { arg: "mode", eq: "toggle" } }
  },
  args: { label: "Valmisruoka", mode: "remove", pressed: false },
  stories: [
    { id: "poistettava", name: "Aktiivinen suodatin" },
    { id: "pois", name: "Suodatin pois", args: { mode: "toggle", label: "Boost-erät" } },
    { id: "paalla", name: "Suodatin päällä", args: { mode: "toggle", label: "Boost-erät", pressed: true } },
    { id: "linkki", name: "Ankkurilinkki", args: { mode: "link", label: "Toimitukset", href: "#toimitukset" }, note: "04 Asiakaspalvelun S2: hyppy FAQ-ryhmään." }
  ]
});

SNL.add({
  id: "ilmoitus",
  title: "Ilmoitus",
  group: "Perusosat",
  component: "notice",
  block: "core/group + core/paragraph",
  status: "on",
  sources: ["07-ostoskori.html"],
  width: 792,
  description: "Sivutason ilmoitus: Tilaa uudelleen -tuonti, virhetilat, tiedoksi-huomiot. Täysi reuna, ei sivuraitaa.",
  argTypes: {
    tone:    { control: "radio", options: ["info", "success", "warn", "error"] },
    title:   { control: "text" },
    text:    { control: "textarea" },
    actions: { control: "json", desc: "Tekstipainikkeet: [{ label, href }]" }
  },
  args: { tone: "info", title: "", text: "Edellinen tilauksesi on tuotu koriin. Tarkista määrät ennen jatkamista.", actions: [] },
  stories: [
    { id: "info", name: "Tiedoksi" },
    { id: "toiminto", name: "Toiminnolla", args: { text: "Osa tuotteista oli Boost- ja Outlet-eriä, joita ei voi tilata uudelleen.", actions: [ { label: "Katso nykyiset erät", href: "#" } ] } },
    { id: "varoitus", name: "Varoitus", args: { tone: "warn", text: "Kahdella rivillä saldo on pienempi kuin tilasit. Määrät päivitettiin." } },
    { id: "virhe", name: "Virhe", args: { tone: "error", title: "Tilausta ei voitu vahvistaa", text: "Yhteys katkesi. Korisi on tallessa, yritä uudelleen." } },
    { id: "onnistui", name: "Onnistui", args: { tone: "success", text: "Tilaus 100482 vastaanotettu." } }
  ]
});

SNL.add({
  id: "murupolku",
  title: "Murupolku",
  group: "Perusosat",
  component: "breadcrumb",
  block: "genero/breadcrumb",
  status: "on",
  description: "Viimeinen taso lihavoituna ilman linkkiä (aria-current=\"page\").",
  argTypes: { items: { control: "json", desc: "[{ label, href }]. Viimeinen on nykyinen sivu." } },
  args: { items: [ { label: "Etusivu", href: "#" }, { label: "Kategoriat", href: "#" }, { label: "Tuore liha" } ] },
  stories: [
    { id: "kolme", name: "Kolme tasoa" },
    { id: "kaksi", name: "Kaksi tasoa", args: { items: [ { label: "Etusivu", href: "#" }, { label: "Tilausehdot" } ] } }
  ]
});

SNL.add({
  id: "taytto",
  title: "TÄYTTÖ-merkintä",
  group: "Perusosat",
  component: "fill",
  block: "wireframe-merkintä",
  status: "wireframe",
  description: "Keltainen laatikko = sisältö, jonka Snellman täydentää (juridiikka, yhteystiedot, avoimet kysymykset). Ei tuotanto-UI:ta.",
  argTypes: { text: { control: "text" }, block: { control: "boolean" }, prefix: { control: "text" },
    title: { control: "text", desc: "Pidempi muistiinpano: otsikko." }, items: { control: "json", desc: "Pidempi muistiinpano: lista." } },
  args: { text: "Snellmanin juridiikka täydentää tarkemman ehdon", block: false, prefix: "TÄYTTÖ: ", title: "", items: [] },
  stories: [
    { id: "rivi", name: "Rivin sisällä" },
    { id: "lista", name: "Ohje listana", args: { prefix: "", title: "Ohje sisällöntuottajalle", text: "", items: ["Vastaus alkaa suoraan asiasta.", "Enintään kolme lausetta.", "Muuttujat pisteviivalla."] } },
    { id: "lohko", name: "Lohkona", args: { block: true, prefix: "⚠ ", text: "Avoin kysymys: minimi per toimitus vai per tilaus? Oletus per toimitusryhmä." } }
  ]
});

SNL.add({
  id: "haitari",
  title: "Haitari",
  group: "Perusosat",
  component: "accordion",
  block: "gds/accordion",
  status: "on",
  sources: ["04-asiakaspalvelu.html", "05-tilausehdot.html"],
  usedIn: ["04 Asiakaspalvelu · FAQ", "05 Tilausehdot · Tarkempi ehto", "03 Outlet · Näin se toimii"],
  width: 792,
  description: "Yksi auki kerrallaan ryhmässä (single) tai vapaasti. Ankkuri #ryhmä avaa ryhmän ensimmäisen kysymyksen. openAll avaa kaikki (Miro-vienti, tulostus). Vastaus on sivun HTML:ää.",
  argTypes: {
    single:  { control: "boolean", desc: "Yksi auki kerrallaan." },
    openAll: { control: "boolean", desc: "Kaikki auki (Miro-vienti)." },
    open:    { control: "number", min: -1, desc: "Avoimen indeksi, -1 = kaikki kiinni." },
    items:   { control: "json", desc: "[{ q, a }], a = HTML." }
  },
  args: { single: true, openAll: false, open: -1, items: [
    { q: "Milloin tilaus pitää tehdä?", a: "<p>Viimeistään toimitusta edeltävänä arkipäivänä klo 12.</p>" },
    { q: "Voinko muuttaa tilausta?", a: "<p>Kyllä, tilausajan loppuun asti Tilaukset-sivulla.</p>" },
    { q: "Mitä Outlet-erät ovat?", a: "<p>Tuotteita, joiden päiväys ei riitä kaupan hyllyyn. Ne ovat täysin käyttökelpoisia ja noin −50 %.</p>" }
  ] },
  stories: [
    { id: "kiinni", name: "Kiinni" },
    { id: "yksi-auki", name: "Yksi auki", args: { open: 0 } },
    { id: "kaikki-auki", name: "Kaikki auki", args: { openAll: true } }
  ]
});

SNL.add({
  id: "kortti",
  title: "Kortti",
  group: "Perusosat",
  component: "card",
  block: "gds/card",
  status: "on",
  sources: ["01-etusivu.html", "02-kategoriat.html", "03-snellman-outlet.html", "04-asiakaspalvelu.html", "05-tilausehdot.html"],
  width: 480,
  description: "Valkoinen kortti, 8 px kulmat ja varjo. Linkkinä koko kortti on klikattava; ”Siirry”-teksti on ulkoasu, ei toinen linkki.",
  notes: ["Korvaa sivujen omat .card-kopiot (01–05)."],
  argTypes: {
    title: { control: "text" }, text: { control: "textarea" },
    href:  { control: "text", desc: "Tyhjä = staattinen kortti." },
    cta:   { control: "text", desc: "Linkkikortin tekstipainike (ulkoasu)." },
    headingLevel: { control: "radio", options: [2, 3, 4] }
  },
  args: { title: "Asiakaspalvelu ja usein kysytyt kysymykset", text: "Toimitukset, tuotteet, tunnukset. Vastaukset yleisimpiin kysymyksiin ja yhteystiedot.",
    href: "04-asiakaspalvelu.html", cta: "Siirry", headingLevel: 3 },
  stories: [
    { id: "linkki", name: "Linkkikortti" },
    { id: "staattinen", name: "Staattinen", args: { href: "", cta: "", title: "Boost-erät, noin −30 %", text: "Tuote on lähellä parasta ennen -päivää ja myydään siksi alennettuun hintaan." } }
  ]
});

SNL.add({
  id: "osion-otsikko",
  title: "Osion otsikkorivi",
  group: "Perusosat",
  component: "sectionHead",
  block: "core/group → core/heading + core/buttons",
  status: "on",
  sources: ["01-etusivu.html", "02-kategoriat.html"],
  width: 792,
  description: "Osion otsikko ja valinnainen ”Kaikki …” -linkki samalla rivillä. Kapeassa linkki rivittyy otsikon alle.",
  argTypes: {
    heading: { control: "text" }, id: { control: "text" },
    level:   { control: "radio", options: [2, 3] },
    link:    { control: "json", desc: "{ label, href } tai null" },
    tight:   { control: "boolean", desc: "Pienempi väli sisältöön (kun alla on alaotsikko)." }
  },
  args: { heading: "Boost-erät nyt", id: "", level: 2, link: { label: "Kaikki Boost-erät", href: "#" }, tight: false },
  stories: [
    { id: "linkilla", name: "Linkillä" },
    { id: "ilman", name: "Ilman linkkiä", args: { heading: "Muut lihatuotteet", link: null } }
  ]
});
