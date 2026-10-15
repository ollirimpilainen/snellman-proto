/* Lomake: kenttä, kenttärivi, valintakortit, virheyhteenveto, vain luku, askellista */

SNL.add({
  id: "kentta",
  title: "Kenttä",
  group: "Lomake",
  component: "field",
  block: "genero/access-request (lomakekenttä)",
  status: "uusi",
  spec: "08-tunnukset.md",
  sources: ["08-tunnukset.html"],
  usedIn: ["08 Tunnukset", "01 Etusivu · kirjautuminen"],
  width: 520,
  description:
    "Nimiö aina näkyvissä kentän yläpuolella, ohje nimiön alla, virhe kentän alla ikonin ja tekstin kanssa (ei pelkkä väri). " +
    "Pakollisuus on oletus; valinnainen kenttä merkitään sanalla ”(valinnainen)”. 44 px korkea, reuna 3.26:1. " +
    "Korjattu kenttä vapautuu virheestä heti kirjoittaessa, uusia virheitä ei näytetä kesken kirjoituksen.",
  notes: ["Toteutus: olemassa oleva lomakeratkaisu multisitessa (esim. Gravity Forms) vai oma lohko? Avoin, 08-tunnukset.md (Oskar)."],
  argTypes: {
    label:        { control: "text" },
    type:         { control: "select", options: ["text", "email", "tel", "number", "textarea", "select"] },
    value:        { control: "text" },
    help:         { control: "text" },
    error:        { control: "text", desc: "Virheviesti. Tyhjä = ei virhettä." },
    required:     { control: "boolean" },
    short:        { control: "boolean", desc: "Kapea kenttä (y-tunnus, postinumero)." },
    readonly:     { control: "boolean" },
    rule:         { control: "select", options: ["", "email", "ytunnus", "postcode", "customer", "phone"], labels: { "": "(ei sääntöä)" }, desc: "SN.validators: kentän virhe poistuu, kun sääntö täyttyy." },
    autocomplete: { control: "text" },
    inputmode:    { control: "select", options: ["", "numeric", "tel", "email"], labels: { "": "(oletus)" } },
    placeholder:  { control: "text", if: { arg: "type", eq: "select" }, desc: "Valinnan tyhjä vaihtoehto." },
    options:      { control: "json", if: { arg: "type", eq: "select" } },
    fill:         { control: "text", desc: "TÄYTTÖ-kysymys kentän alla." }
  },
  args: { name: "company", label: "Yrityksen nimi", type: "text", value: "", help: "", error: "", required: true, short: false, readonly: false,
    rule: "", autocomplete: "organization", inputmode: "", placeholder: "Valitse", options: ["Ravintola", "Kahvila", "Kioski", "Lähikauppa", "Muu"], fill: "" },
  stories: [
    { id: "perus", name: "Perus" },
    { id: "ohje", name: "Ohjeella", args: { name: "email", label: "Sähköposti", type: "email", autocomplete: "email", rule: "email", help: "Tunnukset lähetetään tähän osoitteeseen." } },
    { id: "valinnainen", name: "Valinnainen", args: { name: "phone", label: "Puhelin", type: "tel", autocomplete: "tel", required: false } },
    { id: "virhe", name: "Virhe", args: { name: "email", label: "Sähköposti", type: "email", rule: "email", value: "jarkko@toivola", error: "Tarkista sähköpostiosoite. Esimerkiksi nimi@yritys.fi." },
      note: "Kokeile korjata osoite: virhe poistuu heti, kun sääntö täyttyy." },
    { id: "kapea", name: "Kapea, y-tunnus", args: { name: "business_id", label: "Y-tunnus", help: "Muodossa 1234567-1.", short: true, inputmode: "numeric", rule: "ytunnus" } },
    { id: "valinta", name: "Valinta", args: { name: "business_type", label: "Toimipaikka", type: "select" } },
    { id: "tekstialue", name: "Tekstialue", args: { name: "message", label: "Mitä aiot tilata?", type: "textarea", required: false, help: "Esimerkiksi valmisruokia viikoittain tai lihatuotteita grillikauteen." } },
    { id: "taytto", name: "TÄYTTÖ-kysymyksellä", args: { name: "customer_id", label: "Asiakasnumero tai y-tunnus", rule: "customer", help: "Asiakasnumero löytyy Snellmanin laskusta.", fill: "Näkyykö asiakasnumero laskulla? (Linda)" } }
  ]
});

SNL.add({
  id: "kenttarivi",
  title: "Kenttärivi",
  group: "Lomake",
  component: "fieldRow",
  block: "genero/access-request",
  status: "uusi",
  sources: ["08-tunnukset.html"],
  width: 520,
  description: "Kaksi kenttää rinnakkain (postinumero 140 px + postitoimipaikka). Puhelimessa allekkain.",
  argTypes: { cols: { control: "text", desc: "grid-template-columns" }, fields: { control: "json" } },
  args: { cols: "140px minmax(0, 1fr)", fields: [
    { name: "postcode", label: "Postinumero", inputmode: "numeric", autocomplete: "postal-code", rule: "postcode" },
    { name: "city", label: "Postitoimipaikka", autocomplete: "address-level2" }
  ] },
  stories: [ { id: "osoite", name: "Postinumero + toimipaikka" } ]
});

SNL.add({
  id: "valintakortit",
  title: "Valintakortit",
  group: "Lomake",
  component: "choiceCards",
  block: "genero/access-request, vaihe 1",
  status: "uusi",
  sources: ["08-tunnukset.html"],
  width: 792,
  description: "Radio-ryhmä kortteina, koko kortti klikattava. Kysymys legendana. Valinta vaihtaa lomakkeen kentät (sn:choice). Puhelimessa allekkain.",
  argTypes: { legend: { control: "text" }, value: { control: "select", options: ["", "nykyinen", "uusi"], labels: { "": "(ei valittu)" } }, options: { control: "json" } },
  args: { name: "asiakas", legend: "Oletko jo Snellmanin asiakas?", value: "", options: [
    { value: "nykyinen", title: "Kyllä, tilaan jo Snellmanilta", sub: "Tilaat nyt puhelimella tai sähköpostilla. Tarvitset vain tunnukset." },
    { value: "uusi", title: "En vielä", sub: "Haluat avata asiakkuuden ja tilata verkosta." }
  ] },
  stories: [ { id: "ei-valittu", name: "Ei valittu" }, { id: "valittu", name: "Valittu", args: { value: "nykyinen" } } ]
});

SNL.add({
  id: "virheyhteenveto",
  title: "Virheyhteenveto",
  group: "Lomake",
  component: "errorSummary",
  block: "genero/access-request",
  status: "uusi",
  sources: ["08-tunnukset.html"],
  width: 792,
  description: "Lähetyksen jälkeen lomakkeen yläosaan. role=alert, saa fokuksen (tabindex -1). Jokainen virhe on linkki kenttään.",
  argTypes: { title: { control: "text" }, items: { control: "json", desc: "[{ field: kentän id, label, text }]" } },
  args: { title: "Tarkista merkityt kentät.", items: [
    { field: "f-company", label: "Yrityksen nimi", text: "Täytä yrityksen nimi." },
    { field: "f-business_id", label: "Y-tunnus", text: "Y-tunnus ei täsmää. Tarkista numerot." },
    { field: "f-email", label: "Sähköposti", text: "Tarkista sähköpostiosoite. Esimerkiksi nimi@yritys.fi." }
  ] },
  stories: [ { id: "kolme", name: "Kolme virhettä" } ]
});

SNL.add({
  id: "vain-luku",
  title: "Vain luku -arvo",
  group: "Lomake",
  component: "readonlyValue",
  block: "core/group",
  status: "uusi",
  sources: ["08-tunnukset.html"],
  width: 520,
  description: "Kirjautuneelle esitäytetty tieto, jota ei kysytä uudelleen (esim. yritys lisäkäyttäjää pyydettäessä).",
  argTypes: { label: { control: "text" }, value: { control: "text" } },
  args: { label: "Yritys", value: "Ravintola Toivola, asiakasnumero 100482" },
  stories: [ { id: "yritys", name: "Yritys" } ]
});

SNL.add({
  id: "askellista",
  title: "Askellista",
  group: "Lomake",
  component: "stepList",
  block: "core/list (järjestetty)",
  status: "on",
  sources: ["08-tunnukset.html"],
  width: 420,
  description: "”Näin se etenee”: numeroidut vaiheet lomakkeen vieressä. Vaiheet vaihtuvat valinnan mukaan.",
  argTypes: { heading: { control: "text" }, items: { control: "json" } },
  args: { heading: "Näin se etenee", items: [
    "Lähetä pyyntö. Saat kuittauksen sähköpostiin heti.",
    "Asiakaspalvelu liittää tunnukset asiakkuuteesi yhden arkipäivän kuluessa.",
    "Saat sähköpostiin linkin, jolla asetat salasanan ja pääset tilaamaan."
  ] },
  stories: [ { id: "nykyinen", name: "Nykyinen asiakas" } ]
});

SNL.add({
  id: "valintaruutu",
  title: "Valintaruutu",
  group: "Lomake",
  component: "checkbox",
  block: "genero/checkout (ehdot)",
  status: "uusi",
  sources: ["07-ostoskori.html", "01-etusivu.html"],
  width: 520,
  description: "Ehtojen hyväksyntä (07 Y5, jos ehdot ruutuna) ja Muista minut (01). Koko rivi 44 px klikattava, virhe tekstinä ruudun alla.",
  argTypes: { label: { control: "text" }, checked: { control: "boolean" }, required: { control: "boolean" }, error: { control: "text" } },
  args: { name: "terms", label: "Hyväksyn tilausehdot", checked: false, required: true, error: "" },
  stories: [
    { id: "perus", name: "Perus" },
    { id: "virhe", name: "Virhe", args: { error: "Hyväksy tilausehdot ennen vahvistamista." } },
    { id: "muista", name: "Muista minut", args: { name: "remember", label: "Muista minut tällä laitteella", required: false, checked: true } }
  ]
});
