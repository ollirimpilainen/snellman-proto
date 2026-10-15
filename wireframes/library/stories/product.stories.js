/* Tuote-ryhmä: tuoterivi, määrävalitsin, tuotelista */

const LAYOUT_LABELS = { b: "B Kortti (valittu)", kauppa: "Nykyinen (kauppa)", a: "A Tiivis lista", c: "C Tilauslista" };

const ROW_DESC = "Sitruunainen risotto aidosta arborio-riisistä, broilerin sisäfilettä ja basilikalla maustettuja vihreitä papuja.";

SNL.add({
  id: "tuoterivi",
  title: "Tuoterivi",
  group: "Tuote",
  component: "productRow",
  block: "genero/product-card",
  status: "laajennus",
  spec: "06-tuoterivi.md",
  sources: ["06-tuoterivi.html", "07-ostoskori.html"],
  usedIn: ["01 Etusivu · B3 Nyt tarjolla", "02 Kategoriat · kaikki neljä näkymää", "03 Outlet", "07 Ostoskori · K3"],
  decorator: "cell",
  width: 900,
  description:
    "Järjestelmän tärkein komponentti. Layout B Kortti (valittu 30.9.2026): kuva, nimi ja tiedot vasemmalla, hinta ja määrä oikealla; kapeassa palstassa ostolaatikko kortin alareunaan. " +
    "Sama rivi joka kontekstissa: listassa, Outletissa ja korissa. " +
    "Määrä muuttuu suoraan riviltä ilman erillistä Lisää koriin -painiketta. " +
    "Kolme varianttia (normaali, Boost, Outlet) ja kampanjahinta; rivin tilat loppuunmyyty, ei saatavilla ja ei toimituspäivää. " +
    "Korikontekstissa rivillä on rivisumma, poisto ja rivi-ilmoitus, Lue lisää -paneeli jää pois.",
  notes: [
    "Avoin kysymys: loppuunmyyty erä näkyy harmaana 24 h ja poistuu sitten. Jos Snellman haluaa toisin, rivi katoaa listasta heti.",
    "Avoin kysymys: käyttöpäivä rivillä. B:ssä erän käyttöpäivä ja saldo ovat rivillä nimen alla; Lisätiedot-paneeli ei toista niitä.",
    "Avoin kysymys: hinnat ilman alv:tä. Alv sanotaan kerran listan yläpuolella, ei joka rivillä.",
    "Boost-merkinnän teksti #7a5800, ei speksin #af7e04 (2.68:1 ei täytä AA:ta)."
  ],
  argTypes: {
    context:    { control: "radio",  group: "Rakenne", options: ["list", "cart"], labels: { list: "Lista", cart: "Kori" }, desc: "Missä rivi on. Kori lisää rivisumman ja poiston." },
    layout:     { control: "radio",  group: "Rakenne", options: ["b", "kauppa", "a", "c"], labels: LAYOUT_LABELS, if: { arg: "context", eq: "list" }, desc: "B valittu 30.9.2026. Muut jäävät vertailuun." },
    variant:    { control: "radio",  group: "Rakenne", options: ["normal", "campaign", "boost", "outlet"], labels: { normal: "Normaali", campaign: "Kampanja", boost: "Boost", outlet: "Outlet" }, desc: "Boost ≈ −30 % lähellä päiväystä, Outlet ≈ −50 % (sisäisesti 2-laatu; termiä ei näytetä asiakkaalle)." },
    state:      { control: "select", group: "Tila", options: ["ok", "soldout", "unavailable", "nodate"], labels: { ok: "Normaali", soldout: "Erä myyty loppuun", unavailable: "Ei saatavilla päivälle", nodate: "Ei toimituspäivää" }, if: { arg: "context", eq: "list" }, desc: "Listan rivitila." },
    issue:      { control: "select", group: "Tila", options: ["none", "unavailable", "soldout", "reduced", "pricechanged", "expired", "removed"], labels: { none: "Ei ilmoitusta", unavailable: "Ei saatavilla", soldout: "Erä loppu", reduced: "Saldo pienempi", pricechanged: "Hinta muuttui", expired: "Käyttöpäivä ennen toimitusta", removed: "Poistettu (kumoa)" }, if: { arg: "context", eq: "cart" }, desc: "Korin rivi-ilmoitus (07 K3)." },
    qty:        { control: "number", group: "Tila", min: 0, desc: "Määrä korissa." },
    open:       { control: "boolean", group: "Tila", if: { arg: "context", eq: "list" }, desc: "Lue lisää -paneeli auki." },
    name:       { control: "text",   group: "Sisältö" },
    sku:        { control: "text",   group: "Sisältö" },
    img:        { control: "text",   group: "Sisältö", desc: "Kuvan URL. Tyhjä = haetaan tuotedatasta SKU:lla (lib/data/products.js), muuten paikkamerkki." },
    href:       { control: "text",   group: "Sisältö", desc: "Tuotesivun osoite (nimi ja Avaa tuotesivu)." },
    variableWeight: { control: "boolean", group: "Sisältö", if: { arg: "priceUnit", eq: "kg" }, desc: "Vaihteleva paino → summa on arvio. Pois = kiinteäpainoinen kg-tuote." },
    pack:       { control: "text",   group: "Sisältö", desc: "Pakkauskoko tuotenumeron perään, esim. 2,5 kg tai 10 × 360 g." },
    previously: { control: "boolean", group: "Tila", desc: "Asiakas on tilannut tuotetta aiemmin (Suosituimmat-järjestys, pikatilaus)." },
    price:      { control: "text",   group: "Sisältö", desc: "Hinta pilkulla, esim. 3,54." },
    priceUnit:  { control: "radio",  group: "Sisältö", options: ["kpl", "kg"], desc: "kg = painotuote, rivisumma on arvio." },
    regular:    { control: "text",   group: "Sisältö", desc: "Normaalihinta. Tyhjä = ei vertailuhintaa." },
    unit:       { control: "radio",  group: "Sisältö", options: ["kpl", "pakk"], desc: "Tilausyksikkö." },
    kgPerUnit:  { control: "number", group: "Sisältö", step: 0.05, desc: "Painotuotteen arvio kg/yksikkö." },
    stock:      { control: "text",   group: "Sisältö", desc: "Erän saldo. Tyhjä = ei kattoa (normaalivarasto)." },
    bestBefore: { control: "text",   group: "Sisältö", desc: "Käytä viimeistään." },
    bestBeforeNote: { control: "text", group: "Sisältö", desc: "Lisäys käyttöpäivään, esim. ”2 päivää toimituksesta” (≤ 2 pv, 03-spec)." },
    lowStock:   { control: "boolean", group: "Tila", desc: "Sivun oma vähissä-sääntö (esim. < 20 % erästä). Alle 10 lihavoidaan aina." },
    date:       { control: "text",   group: "Sisältö", desc: "Valittu toimituspäivä ilmoituksia varten." },
    oldPrice:   { control: "text",   group: "Sisältö", if: { arg: "issue", eq: "pricechanged" } },
    ordered:    { control: "text",   group: "Sisältö", if: { arg: "issue", eq: "reduced" }, desc: "Alun perin tilattu määrä." },
    desc:       { control: "textarea", group: "Sisältö", if: { arg: "context", eq: "list" } }
  },
  args: {
    context: "list", layout: "b", variant: "normal", state: "ok", issue: "none", qty: 0, open: false,
    name: "Broileririsotto ja papuja 360g", sku: "20550", price: "3,54", priceUnit: "kpl", regular: "",
    unit: "kpl", kgPerUnit: 0.36, stock: "", bestBefore: "", date: "ke 17.9.2026", oldPrice: "", ordered: "", desc: ROW_DESC
  },
  stories: [
    { id: "normaali", name: "Normaali" },
    { id: "tuotekuva", name: "Tuotekuvalla (tuotedata)", args: { name: "Aura grillimakkara 300g", sku: "13289", price: "3,45" },
      note: "Kuva tulee tuotedatasta SKU:lla (b2bshop). 328/379 tuotteella on kuva, muilla paikkamerkki." },
    { id: "korissa", name: "Korissa jo", args: { qty: 4, name: "Kotimainen meetvursti 220g", sku: "12348", price: "3,10", priceUnit: "kpl" },
      note: "Kentässä korin määrä, ei nolla, ja kortilla vihreä kehys. Ei erillistä ”4 kpl korissa” -tekstiä, koska se toistaisi kentän. Painotuotteella arvio n. kg/kpl rivillä ja yksikkö kentän alla." },
    { id: "nykyinen", name: "Nykyinen kaupan rivi (vertailu)", args: { layout: "kauppa" }, note: "Henkilöstökaupan /shop/-rivi lähtötilanteena." },
    { id: "tilattu-aiemmin", name: "Tilattu aiemmin + pakkaus", args: { previously: true, pack: "10 × 360 g", qty: 0 } },
    { id: "kampanja", name: "Kampanjahinta", args: { variant: "campaign", name: "Possu-pekonikast. muusilla 300g", sku: "22262", price: "2,28", regular: "2,68" } },
    { id: "boost", name: "Boost-erä", args: { variant: "boost", name: "Mango-chilibroileri riisiä 300g", sku: "22268", price: "1,65", regular: "2,36", bestBefore: "22.9.2026", stock: "34" },
      note: "M3 merkitsee Boost-eräksi (order type WOW), normaalivarasto." },
    { id: "outlet", name: "Outlet-erä", args: { variant: "outlet", name: "Pippurihärkää riisillä 300g", sku: "22264", price: "1,21", regular: "2,41", bestBefore: "18.9.2026", stock: "3" },
      note: "Oma varasto, order type GD, vain Outlet-oikeudellisille." },
    { id: "katto", name: "Erä katossa", args: { variant: "outlet", name: "Pippurihärkää riisillä 300g", sku: "22264", price: "1,21", regular: "2,41", bestBefore: "18.9.2026", stock: "3", qty: 3 },
      note: "Määrä = saldo: plus estetty ja syy näkyy pysyvästi kentän alla (”Erää on jäljellä vain 3 kpl.”), plus-painike viittaa siihen aria-describedbyllä. Kokeile kirjoittaa kenttään 99: määrä asettuu 3:een ja ruudunlukija kuulee syyn." },
    { id: "paneeli", name: "Lue lisää auki", args: { variant: "boost", name: "Mango-chilibroileri riisiä 300g", sku: "22268", price: "1,65", regular: "2,36", bestBefore: "22.9.2026", stock: "34", open: true } },
    { id: "painotuote", name: "Painotuote, pakkaus", args: { name: "Porsaan ulkofilee n1,3kg", sku: "15611", unit: "pakk", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3 } },
    { id: "loppu", name: "Erä myyty loppuun", args: { variant: "boost", name: "Kanapasta pestolla 300g", sku: "22271", price: "1,68", regular: "2,40", bestBefore: "19.9.2026", stock: "0", state: "soldout" } },
    { id: "ei-saatavilla", name: "Ei saatavilla päivälle", args: { name: "Porsaan ulkofilee n1,3kg", sku: "15611", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3, state: "unavailable" } },
    { id: "ei-paivaa", name: "Ei toimituspäivää", args: { name: "Jauhelihakastike 2,5 kg", sku: "208540", price: "4,15", state: "nodate" },
      note: "Toimituspäivä on portinvartija: ilman valintaa ei hintaa eikä määrää." },
    { id: "kori", name: "Kori · normaali", args: { context: "cart", qty: 6 } },
    { id: "kori-paino", name: "Kori · painotuote", args: { context: "cart", qty: 2, name: "Porsaan ulkofilee n1,3kg", sku: "15611", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3 } },
    { id: "kori-outlet", name: "Kori · Outlet-erä", args: { context: "cart", variant: "outlet", qty: 2, name: "Pippurihärkää riisillä 300g", sku: "22264", price: "1,21", regular: "2,41", bestBefore: "18.9.2026", stock: "3" } },
    { id: "kori-saldo", name: "Kori · saldo pienempi", args: { context: "cart", variant: "boost", issue: "reduced", qty: 8, ordered: "12", name: "Lihapullapastaa kastikkeessa 300g", sku: "22269", price: "1,73", regular: "2,47", bestBefore: "20.9.2026", stock: "8" } },
    { id: "kori-hinta", name: "Kori · hinta muuttui", args: { context: "cart", issue: "pricechanged", qty: 6, oldPrice: "3,29" } },
    { id: "kori-ei-saatavilla", name: "Kori · ei saatavilla", args: { context: "cart", issue: "unavailable", qty: 3, name: "Porsaan ulkofilee n1,3kg", sku: "15611", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3 } },
    { id: "kori-vanhentunut", name: "Kori · käyttöpäivä ennen toimitusta", args: { context: "cart", variant: "outlet", issue: "expired", qty: 2, name: "Tomaatti-vuohenjuustopasta 300g", sku: "22332", price: "1,33", regular: "2,65", bestBefore: "16.9.2026", stock: "12" } },
    { id: "kori-poistettu", name: "Kori · poistettu, kumoa", args: { context: "cart", issue: "removed", qty: 6 } }
  ]
});

SNL.add({
  id: "maaravalitsin",
  title: "Määrävalitsin",
  group: "Tuote",
  component: "quantity",
  block: "genero/add-to-cart",
  status: "on",
  spec: "06-tuoterivi.md",
  sources: ["06-tuoterivi.html", "07-ostoskori.html"],
  usedIn: ["Tuoterivi (lista ja kori)"],
  layout: "centered",
  description:
    "[−] [n] [+]. Ikoni 27px kuten kaupassa, osuma-alue 44 × 44 ja kentällä näkyvä reuna. " +
    "Kenttään voi kirjoittaa suoraan; Enter vahvistaa ja fokus jää kenttään. Tyhjä, miinus tai kirjain palauttaa edellisen määrän ja sanoo ”Syötä määrä numeroina.”, eikä koskaan poista riviä huomaamatta. " +
    "Katto = erän saldo, syy näkyy pysyvästi kentän alla. Korissa 0 = sama kuin poisto (Kumoa palauttaa). Muutos ilmoitetaan aria-live-alueella.",
  argTypes: {
    qty:      { control: "number", min: 0 },
    stock:    { control: "text", desc: "Tyhjä = ei kattoa." },
    unit:     { control: "radio", options: ["kpl", "pakk"] },
    mode:     { control: "radio", options: ["ok", "nodate"], labels: { ok: "Normaali", nodate: "Ei toimituspäivää" } },
    disabled: { control: "boolean" },
    busy:     { control: "boolean", desc: "Tallentaa (tuotannossa API-kutsu korin päivitykseen)." },
    showUnit: { control: "boolean", desc: "Yksikkö kentän alla (kori, pakkaustuotteet)." },
    showNote: { control: "boolean", desc: "Katto- tai toimituspäivätieto alla. Ei ”n kpl korissa” -tekstiä (toistoa)." },
    name:     { control: "text", desc: "Tuotteen nimi aria-labeleihin." }
  },
  args: { qty: 0, stock: "", unit: "kpl", mode: "ok", disabled: false, busy: false, showUnit: false, showNote: true, name: "Broileririsotto 360g" },
  stories: [
    { id: "tyhja", name: "Tyhjä" },
    { id: "korissa", name: "Korissa", args: { qty: 4 } },
    { id: "katto", name: "Katossa", args: { qty: 3, stock: "3" } },
    { id: "pakkaus", name: "Pakkausyksikkö", args: { qty: 2, unit: "pakk", showUnit: true } },
    { id: "ei-paivaa", name: "Ei toimituspäivää", args: { mode: "nodate" } },
    { id: "estetty", name: "Estetty", args: { qty: 2, disabled: true, showNote: false } },
    { id: "tallentaa", name: "Tallentaa", args: { qty: 4, busy: true } },
    { id: "kolminumeroinen", name: "Iso määrä", args: { qty: 240, unit: "pakk", showUnit: true }, note: "Kenttään mahtuu neljä numeroa." }
  ]
});

SNL.add({
  id: "tuotelista",
  title: "Tuotelista",
  group: "Tuote",
  component: "productList",
  block: "gds/product-list",
  status: "on",
  spec: "06-tuoterivi.md",
  sources: ["06-tuoterivi.html"],
  usedIn: ["02 Kategoriat", "03 Outlet", "06 Tuoterivi"],
  width: 900,
  description: "Ryhmäotsikko (28px TheSansB 700), alv-huomio kerran listaa kohden ja rivit (B Kortti, 12 px välein). Tyhjä lista kertoo miksi.",
  argTypes: {
    heading: { control: "text" },
    context: { control: "radio", options: ["list", "cart"], labels: { list: "Lista", cart: "Kori" } },
    layout:  { control: "radio", options: ["b", "kauppa", "a", "c"], labels: LAYOUT_LABELS, if: { arg: "context", eq: "list" } },
    vatNote: { control: "boolean", desc: "”Hinnat ilman alv:tä.” otsikon vieressä (avoin: hinnat alv 0 vai sis. alv)." },
    empty:   { control: "text", desc: "Tyhjän listan teksti. Tyhjä = sanaston oletus." },
    rows:    { control: "json", desc: "Rivien argumentit (ks. Tuoterivi)." }
  },
  args: {
    heading: "Annosateriat", context: "list", layout: "b", vatNote: true, empty: "",
    rows: [
      { name: "Broileririsotto ja papuja 360g", sku: "20550", price: "3,54", kgPerUnit: 0.36 },
      { name: "Tomaatti-vuohenjuustopasta 300g", sku: "22332", price: "2,65", kgPerUnit: 0.3 },
      { name: "Possu-pekonikast. muusilla 300g", sku: "22262", price: "2,28", regular: "2,68", variant: "campaign" },
      { name: "Kotimainen meetvursti 220g", sku: "12348", price: "3,10", priceUnit: "kpl", qty: 4 }
    ]
  },
  stories: [
    { id: "normaali", name: "Annosateriat" },
    { id: "erat", name: "Boost- ja Outlet-erät", args: { heading: "Nyt tarjolla", rows: [
      { variant: "boost", name: "Mango-chilibroileri riisiä 300g", sku: "22268", price: "1,65", regular: "2,36", bestBefore: "22.9.2026", stock: "34" },
      { variant: "boost", name: "Lihapullapastaa kastikkeessa 300g", sku: "22269", price: "1,73", regular: "2,47", bestBefore: "20.9.2026", stock: "8" },
      { variant: "outlet", name: "Tomaatti-vuohenjuustopasta 300g", sku: "22332", price: "1,33", regular: "2,65", bestBefore: "19.9.2026", stock: "12" },
      { variant: "outlet", name: "Pippurihärkää riisillä 300g", sku: "22264", price: "1,21", regular: "2,41", bestBefore: "18.9.2026", stock: "3", qty: 3 }
    ] } },
    { id: "tyhja", name: "Tyhjä lista", args: { rows: [] }, note: "Kategoriassa ei tuotteita valitulle päivälle." },
    { id: "kori", name: "Korin ryhmä", args: { heading: "Kokkikartanon valmisruoat", context: "cart", rows: [
      { name: "Broileririsotto ja papuja 360g", sku: "20550", price: "3,54", qty: 12 },
      { name: "Lihamakaronilaatikko 4 × 2 kg", sku: "208902", price: "2,20", qty: 20 },
      { variant: "boost", name: "Mango-chilibroileri riisiä 300g", sku: "22268", price: "1,65", regular: "2,36", bestBefore: "22.9.2026", stock: "34", qty: 10 }
    ] } }
  ]
});


/* Layout-vertailu: sama sekalainen lista jokaisella layoutilla */
const MIXED_ROWS = [
  { name: "Broileririsotto ja papuja 360g", sku: "20550", price: "3,54", kgPerUnit: 0.36 },
  { name: "Kotimainen meetvursti 220g", sku: "12348", price: "3,10", priceUnit: "kpl", qty: 4 },
  { variant: "campaign", name: "Possu-pekonikast. muusilla 300g", sku: "22262", price: "2,28", regular: "2,68" },
  { variant: "boost", name: "Mango-chilibroileri riisiä 300g", sku: "22268", price: "1,65", regular: "2,36", bestBefore: "22.9.2026", stock: "34" },
  { variant: "outlet", name: "Pippurihärkää riisillä 300g", sku: "22264", price: "1,21", regular: "2,41", bestBefore: "18.9.2026", stock: "3", qty: 3 },
  { name: "Porsaan ulkofilee n1,3kg", sku: "15611", unit: "pakk", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3 },
  { variant: "boost", name: "Kanapasta pestolla 300g", sku: "22271", price: "1,68", regular: "2,40", bestBefore: "19.9.2026", stock: "0", state: "soldout" },
  { name: "Porsaan ulkofilee n1,3kg", sku: "15611", price: "11,90", priceUnit: "kg", kgPerUnit: 1.3, state: "unavailable" }
];

SNL.add({
  id: "tuoterivi-layoutit",
  title: "Tuoterivin layoutit",
  group: "Tuote",
  component: "productList",
  block: "genero/product-card",
  status: "wireframe",
  spec: "06-tuoterivi.md",
  width: 900,
  description:
    "Kolme vaihtoehtoa Henkilöstökaupan nykyiselle riville, samoilla riveillä ja tiloilla: normaali, korissa, kampanja, Boost, Outlet katossa, painotuote, loppuunmyyty, ei saatavilla. " +
    "Uudet layoutit reagoivat palstan leveyteen (container query), joten ne toimivat sellaisenaan 900 px:n pääpalstassa, sivupalkissa ja 390 px:n puhelimessa. Kokeile leveyksiä Canvasissa. " +
    "Kaikissa kolmessa Boost/Outlet-erän päiväys ja saldo on nostettu riville (nykyisessä ne ovat Lue lisää -paneelissa); alle 10 kpl saldo lihavoituna.",
  notes: [
    "PÄÄTÖS 30.9.2026: B Kortti valittu tuoterivin layoutiksi (toimii myös mobiilissa). ”n kpl korissa” -teksti poistettu kaikista layouteista toistona. Kori käyttää toistaiseksi nykyistä riviä.",
    "EXTRA, jos budjettia jää: A Tiivis lista leveässä palstassa (desktop) + B kapeassa. Ei työn alla.",
    "C:n rivisumma on uusi tieto listanäkymässä. Painotuotteilla se on arvio (n.)."
  ],
  argTypes: {
    layout:  { control: "radio", options: ["kauppa", "a", "b", "c"], labels: LAYOUT_LABELS },
    heading: { control: "text" },
    rows:    { control: "json", desc: "Rivien argumentit (ks. Tuoterivi)." }
  },
  args: { layout: "kauppa", heading: "Annosateriat", context: "list", rows: MIXED_ROWS },
  stories: [
    { id: "nykyinen", name: "Nykyinen (kauppa)", note: "Lähtötilanne: Henkilöstökaupan /shop/-lista. Alle 1024 px ikkunassa rivi hajoaa kahteen kerrokseen vihreän viivan ympärille." },
    { id: "a", name: "A · Tiivis lista", args: { layout: "a" },
      note: "Rivit yhdessä pinnassa hiusviivoin, 48 px kuva, kaikki yhdellä rivillä. Eniten rivejä ruudulle: toistuvaan tilaamiseen, kun tuotteet ovat tuttuja. Korissa oleva rivi saa vaalean vihreän pohjan. Kapeassa: nimi ylös, hinta ja määrä alle." },
    { id: "b", name: "B · Kortti (valittu)", args: { layout: "b" },
      note: "Jokainen rivi oma korttinsa, 88 px kuva, isompi hinta ja ostolaatikko oikealla. Tuote ja hinta erottuvat parhaiten: selaamiseen ja uusiin tuotteisiin. Korissa oleva kortti saa vihreän kehyksen, määrän alla ei toistoa. Kapeassa ostolaatikko kortin alareunaan." },
    { id: "c", name: "C · Tilauslista", args: { layout: "c" },
      note: "Taulukko sarakeotsikoin: tuote, tuotenumero, hinta, määrä, rivisumma. Numerot tasattu sarakkeisiin, summa päivittyy heti. Tukkuostajan tuttu tilauslomake: pikatilaukseen ja isoihin tilauksiin. Kapeassa sarakkeet pinotaan." }
  ]
});
