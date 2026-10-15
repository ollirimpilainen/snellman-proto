/* Tili-ryhmä: kirjautuminen, salasanan palautus, salasanan asetus (TP1), kutsuviesti ja käyttöönotto (TP3) */

const LOGIN_NOTES = [
  "Sama sivupohja kaikille kuudelle kaupalle (WooCommercen form-login.php, teemassa ei nyt ylikirjoitusta). Kaupan nimi ja kenelle-teksti ovat kaupan omia asetuksia.",
  "Virheviesti on sama väärälle tunnukselle ja väärälle salasanalle (gds-security-hardening). Siksi ei ole erillistä ”tuntematon tunnus” -tilaa.",
  "Suljettu asiakkuus (M3 status 90) ei ole kirjautumisvirhe: asiakas pääsee sisään, ja ilmoitus näkyy jokaisella sivulla.",
  "Lukittu: kirjautumisyritysten rajoitin lukitsee yhteyden osoitteen mukaan. Oskar tarkistaa lokista, osuuko lukitus puhelinliittymiin (monella sama osoite).",
  "Kirjautumisen jälkeen: syvälinkin kohde, muuten etusivun tila B (01-etusivu.md › Kirjautumisen jälkeinen ohjaus)."
];

SNL.add({
  id: "kirjautuminen",
  title: "Kirjautuminen",
  group: "Tili",
  component: "login",
  block: "woocommerce/myaccount/form-login.php (ylikirjoitus)",
  status: "laajennus",
  spec: "01-etusivu.md",
  sources: ["09-kirjautuminen.html", "01-etusivu.html", "../service-design/selvitys-mittaus-ja-kirjautuminen.md"],
  usedIn: ["01 Etusivu · A1", "09 Kirjautuminen · /my-account/"],
  width: 480,
  description:
    "Kirjautumislomake kortissa (etusivu A1) tai omana sivunaan (/my-account/). Korjaa kitkat K1–K5, K7 ja K9: " +
    "Pidä minut kirjautuneena on oletuksena päällä, sivulla kerrotaan kauppa ja polku tunnuksiin, kenttien teksti on 16 px, " +
    "salasanan voi näyttää ilman jQueryä, tunnuskenttä ei muuta isoja kirjaimia eikä korjaa sanaa, ja kosketusalueet ovat vähintään 44 px.",
  notes: LOGIN_NOTES,
  argTypes: {
    context:  { control: "radio", group: "Rakenne", options: ["card", "page"], labels: { card: "Kortti (etusivu A1)", page: "Sivu (/my-account/)" } },
    state:    { control: "select", group: "Tila", options: ["idle", "empty", "invalid", "locked", "nocustomer"],
                labels: { idle: "Normaali", empty: "Tyhjä kenttä", invalid: "Väärä tunnus tai salasana", locked: "Lukittu", nocustomer: "Kirjautunut ilman asiakkuutta (K9)" } },
    email:    { control: "text", group: "Sisältö" },
    remember: { control: "boolean", group: "Tila", desc: "Oletuksena päällä (K1)." },
    storeName:{ control: "text", group: "Sisältö", if: { arg: "context", eq: "page" }, desc: "Kaupan nimi, kaupan omista asetuksista." },
    audience: { control: "text", group: "Sisältö", if: { arg: "context", eq: "page" }, desc: "Kenelle kauppa on (K2)." },
    minutes:  { control: "number", group: "Sisältö", if: { arg: "state", eq: "locked" }, desc: "Rajoittimen lukitusaika." }
  },
  args: { context: "card", state: "idle", email: "", remember: true, storeName: "Snellman Retail",
    audience: "Tilauskauppa ravintoloille, kioskeille ja lähikaupoille.", minutes: 20 },
  stories: [
    { id: "kortti", name: "Kortti (etusivu A1)" },
    { id: "sivu", name: "Sivu (/my-account/)", args: { context: "page" } },
    { id: "vaara", name: "Väärä tunnus tai salasana", args: { context: "page", state: "invalid", email: "ravintola@esimerkki.fi" } },
    { id: "tyhja", name: "Tyhjä kenttä", args: { context: "page", state: "empty" } },
    { id: "lukittu", name: "Lukittu", args: { context: "page", state: "locked", email: "ravintola@esimerkki.fi" } },
    { id: "ei-asiakkuutta", name: "Kirjautunut ilman asiakkuutta", args: { context: "page", state: "nocustomer" } }
  ]
});

SNL.add({
  id: "salasanan-palautus",
  title: "Salasanan palautus",
  group: "Tili",
  component: "lostPassword",
  block: "woocommerce/myaccount/form-lost-password.php (ylikirjoitus)",
  status: "laajennus",
  sources: ["09-kirjautuminen.html"],
  usedIn: ["09 Kirjautuminen · /my-account/lost-password/"],
  width: 480,
  description: "Pyydä linkki uuden salasanan asettamiseen. Lähetetty-tila ei kerro, onko osoitteella tunnusta (tietoturva), mutta kertoo linkin voimassaolon ja roskapostin, ja tarjoaa polun tunnuspyyntöön, jos viestiä ei tule.",
  argTypes: {
    step:     { control: "radio", options: ["form", "sent"], labels: { form: "Lomake", sent: "Lähetetty" } },
    email:    { control: "text" },
    validFor: { control: "text", desc: "Linkin voimassaolo. Oletus WordPressissä 24 h, ehdotus 7 vrk (Oskar Q12)." },
    requestHref: { control: "text", if: { arg: "step", eq: "sent" }, desc: "Lähetetty-tilan polku tunnuspyyntöön (TP3): nykyinen asiakas ei välttämättä tiedä, millä osoitteella tunnus on." }
  },
  args: { step: "form", email: "", validFor: "7 vuorokautta", requestHref: "08-tunnukset.html?asiakas=nykyinen" },
  stories: [
    { id: "lomake", name: "Lomake" },
    { id: "lahetetty", name: "Lähetetty", args: { step: "sent", email: "ravintola@esimerkki.fi" } }
  ]
});

SNL.add({
  id: "salasanan-asetus",
  title: "Salasanan asetus",
  group: "Tili",
  component: "setPassword",
  block: "woocommerce/myaccount/form-reset-password.php (ylikirjoitus)",
  status: "laajennus",
  sources: ["09-kirjautuminen.html"],
  usedIn: ["09 Kirjautuminen · kutsun ja palautuksen linkki"],
  width: 480,
  description:
    "Kutsun tai palautuksen linkistä. Käyttäjätunnus näkyy lomakkeessa, koska nykyinen asiakas ei tiedä, millä osoitteella tunnus on (TP3). " +
    "Vähintään 12 merkin vaatimus näkyy ennen lähetystä ja päivittyy kirjoittaessa (K4). " +
    "Kutsussa tallennus vie suoraan tilaamaan (etusivun tila B), ei tilisivulle. Vanhentunut linkki lähettää uuden samaan osoitteeseen yhdellä painalluksella.",
  notes: [
    "12 merkin minimi tulee gds-security-hardeningista, ja palvelin tarkistaa sen joka tapauksessa.",
    "Salasanan vaihto kirjaa käyttäjän ulos kaikista kaupoista, koska tunnus on yhteinen koko verkostolle.",
    "Osoite tulee linkin login-parametrista (WordPressin rp-linkki). Piilokenttä autocomplete=username auttaa salasanaohjelmaa tallentamaan oikean tunnuksen.",
    "Vanhentunut linkki ilman osoitetta (esim. katkennut linkki) näyttää Pyydä uusi linkki -painikkeen palautuslomakkeeseen."
  ],
  argTypes: {
    mode:  { control: "radio", options: ["invite", "reset"], labels: { invite: "Kutsu", reset: "Palautus" } },
    state: { control: "select", options: ["form", "short", "mismatch", "expired"], labels: { form: "Lomake", short: "Liian lyhyt", mismatch: "Eivät täsmää", expired: "Linkki vanhentunut" } },
    min:   { control: "number" },
    validFor: { control: "text" },
    email: { control: "text", desc: "Käyttäjätunnus linkistä. Tyhjä = ei näytetä, ja vanhentunut linkki ohjaa palautuslomakkeeseen." }
  },
  args: { mode: "invite", state: "form", min: 12, validFor: "7 vuorokautta", email: "ravintola@esimerkki.fi" },
  stories: [
    { id: "kutsu", name: "Kutsu" },
    { id: "palautus", name: "Palautus", args: { mode: "reset" } },
    { id: "lyhyt", name: "Liian lyhyt", args: { state: "short" } },
    { id: "eivat-tasmaa", name: "Eivät täsmää", args: { state: "mismatch" } },
    { id: "vanhentunut", name: "Linkki vanhentunut: uusi linkki yhdellä painalluksella", args: { state: "expired" } },
    { id: "vanhentunut-ei-osoitetta", name: "Linkki vanhentunut, osoite ei tiedossa", args: { state: "expired", email: "" } }
  ]
});

SNL.add({
  id: "kutsuviesti",
  title: "Kutsuviesti",
  group: "Tili",
  component: "inviteEmail",
  block: "WooCommerce emails/customer-new-account.php (kauppakohtainen sisältö)",
  status: "uusi",
  spec: "08-tunnukset.md",
  sources: ["09-kirjautuminen.html", "08-tunnukset.md", "../service-design/prototyypin-tyopaketit.md"],
  usedIn: ["09 Kirjautuminen · ?view=mail", "Sähköposti: julkaisun kutsu ja tunnukset valmiit"],
  width: 640,
  description:
    "WooCommercen uuden tilin viesti, jonka painike avaa salasanan asetuksen. Kaksi versiota: kutsu nykyisille asiakkaille julkaisussa ja tunnukset valmiit tunnuspyynnön jälkeen. " +
    "Viesti kertoo käyttäjätunnuksen, koska nykyinen asiakas ei tiedä, millä osoitteella tunnus on, ja kertoo linkin voimassaolon päivämääränä.",
  notes: [
    "Linkki on voimassa viikon (password_reset_expiration, vain Retail). Vanhentuneesta linkistä saa uuden yhdellä painalluksella.",
    "Linkissä UTM: utm_source=email, utm_medium=invite, utm_campaign=launch tai ready. Näin kutsusta tulleet erottuvat analytiikassa.",
    "Kutsu lähtee, kun synkka luo käyttäjän. Nyt pois päältä (M3_CUSTOMERS_WELCOME_EMAIL).",
    "Avoin Snellmanille: milloin nykyiset asiakkaat kutsutaan, ja täydennetäänkö puuttuvat sähköpostit M3:een ennen sitä."
  ],
  argTypes: {
    variant: { control: "radio", options: ["launch", "ready"], labels: { launch: "Kutsu julkaisussa (nykyiset asiakkaat)", ready: "Tunnukset valmiit (pyynnön jälkeen)" } },
    name:    { control: "text", group: "Sisältö", if: { arg: "variant", eq: "ready" } },
    company: { control: "text", group: "Sisältö" },
    email:   { control: "text", group: "Sisältö", desc: "Vastaanottaja ja käyttäjätunnus." },
    validFor:{ control: "text", group: "Sisältö" },
    until:   { control: "text", group: "Sisältö", desc: "Linkin viimeinen voimassaolopäivä." },
    domain:  { control: "text", group: "Sisältö", if: { arg: "variant", eq: "launch" } },
    showHead:{ control: "boolean", group: "Rakenne", desc: "Sähköpostin otsakkeet (lähettäjä, vastaanottaja, aihe)." }
  },
  args: { variant: "launch", name: "Jarkko", company: "Ravintola Toivola", email: "ravintola@esimerkki.fi", validFor: "7 vuorokautta",
    until: "7.10.2026", domain: "{kaupan osoite}", showHead: true, href: "09-kirjautuminen.html?view=invite&login=ravintola%40esimerkki.fi&utm_source=email&utm_medium=invite&utm_campaign=launch" },
  stories: [
    { id: "julkaisu", name: "Kutsu julkaisussa" },
    { id: "valmiit", name: "Tunnukset valmiit", args: { variant: "ready", href: "09-kirjautuminen.html?view=invite&login=ravintola%40esimerkki.fi&utm_source=email&utm_medium=invite&utm_campaign=ready" } }
  ]
});
