/* Toteutuskartta: miten kukin kirjaston komponentti toteutetaan snellmanecomissa.
   Lähteet: Oskarin vastaukset 30.9.2026 (claude.ai/artifact/Qp37tAB9LFh83ifC8kXaBU),
   service-design/data/selvitys-vk40/repo-audit.md, retail-haarat
   feat/retail-p0-fixtures (site) ja feat/delivery-date-picker-per-loading-place (plugin).

   tier:
     blog    = kauppakohtainen sisältö (FSE-sivupohja, Global Styles, navigaatio kaupan omissa tauluissa)
     filter  = filtteri Retailin site-pluginissa (snellman-retail.php). Ei voi vaikuttaa muihin kauppoihin.
     shared  = jaettu koodi (wp-gds-theme tai wp-snellman-m3). Muuttuu kaikissa kuudessa kaupassa.
     gate    = jaettu koodi Retail-kytkimen takana. Vain Retailissa, mutta jokainen myöhempi muutos kantaa kahta käytöstä.
     wf      = vain wireframessä, ei toteuteta
   events: yhteisen mittausmallin tapahtumat (Tilaajan polut › Yhteinen mittausmalli). */
window.SNL_TIERS = {
  blog:   { label: "Kauppakohtainen", desc: "Kaupan omissa tauluissa. Ei vaikuta muihin kauppoihin." },
  filter: { label: "Retail-filtteri", desc: "Retailin site-pluginissa. Halpa, ei voi rikkoa muita kauppoja." },
  shared: { label: "Jaettu", desc: "Teema tai M3-plugin. Muuttuu kaikissa kaupoissa." },
  gate:   { label: "Jaettu + Retail-kytkin", desc: "Jaetussa koodissa, päällä vain Retailissa. Kallein ylläpitää." },
  wf:     { label: "Vain wireframe", desc: "Ei toteuteta." }
};

window.SNL_IMPL = {
  perusta: {
    tier: "blog",
    where: ["THEME: theme.json (presetit)", "Kaupan Global Styles (tietokanta)"],
    note: "Värit ja fontit ovat kaupan omia Global Styles -asetuksia. Mitat ja käyttäytyminen tulevat jaetusta teemasta."
  },
  painike: {
    tier: "blog",
    where: ["core/button", "Kaupan Global Styles"],
    note: "44 px kosketusalue on jaettu korjaus (kitka K7) ja koskee myös kirjautumissivun painiketta."
  },
  merkinta: {
    tier: "filter",
    hooks: ["gds/product-card/badges"],
    where: ["Retail site-plugin"],
    branch: "feat/retail-p0-fixtures: kampanjan alennusprosentti renderöidään merkintänä.",
    note: "Boost- ja Outlet-merkinnät samaan filtteriin vaiheessa 2."
  },
  chip: {
    tier: "shared",
    where: ["FacetWP (facetwp-selections)"],
    events: [{ name: "view_item_list", when: "kun suodatus päivittää listan (item_list_id pysyy)" }]
  },
  ilmoitus: {
    tier: "blog",
    where: ["core/group + core/paragraph"],
    note: "Korin ilmoitukset (minimi, saldo, aikaraja) ovat osa korikomponenttia, eivät erillisiä lohkoja."
  },
  murupolku: { tier: "shared", where: ["genero/breadcrumb"] },
  taytto: { tier: "wf", note: "Avoimen kysymyksen merkintä wireframessä." },
  haitari: { tier: "shared", where: ["gds/accordion"], note: "Sisältö on kauppakohtainen (UKK, tilausehdot)." },
  kentta: {
    tier: "filter",
    where: ["Retail site-plugin: genero/access-request (uusi)"],
    events: [{ name: "access_request_start", when: "ensimmäinen kenttä saa fokuksen" }, { name: "form_error", when: "lähetys hylätään validoinnissa (field)" }],
    note: "Kirjautumislomakkeen kentät ovat eri asia: ne ovat WooCommercen jaetussa sivupohjassa (ks. Kirjautuminen, TP1)."
  },
  kenttarivi: { tier: "filter", where: ["Retail site-plugin: genero/access-request"] },
  valintakortit: {
    tier: "filter",
    where: ["Retail site-plugin: genero/access-request, vaihe 1"],
    events: [{ name: "access_request_start", when: "asiakastyyppi valitaan (lead_type)" }]
  },
  virheyhteenveto: {
    tier: "filter",
    where: ["Retail site-plugin: genero/access-request"],
    events: [{ name: "form_error", when: "yhteenveto näytetään (field)" }, { name: "generate_lead", when: "pyyntö lähtee (lead_type, method = form)" }]
  },
  "vain-luku": {
    tier: "shared",
    where: ["WooCommerce checkout, M3-osoite"],
    note: "Osoite tulee M3:sta. Muutokset asiakaspalvelun kautta."
  },
  askellista: { tier: "blog", where: ["core/list (järjestetty)"] },
  valintaruutu: {
    tier: "shared",
    where: ["WooCommerce checkout (ehdot)"],
    events: [{ name: "begin_checkout", when: "siirrytään yhteenvetoon" }]
  },
  tuoterivi: {
    tier: "shared",
    hooks: ["gds/product-card/meta", "gds/product-card/badges"],
    where: ["THEME: Vue ProductCard (resources/scripts/app.js)", "Retail site-plugin: filtterit"],
    branch: "feat/retail-p0-fixtures: badges-filtteri ja kampanjaprosentti. Proto seuraa haaraa (30.9.2026): alennusprosentti merkintänä, normaalihinta yliviivattuna.",
    events: [{ name: "add_to_cart", when: "määrä kasvaa (add_source: list, search, reorder)" }, { name: "remove_from_cart", when: "määrä pienenee tai rivi poistuu" }],
    note: "Rivi on jaettu kaikille kaupoille. Retailin lisätiedot (toimituspäivä, erän saldo) kulkevat meta-filtterin kautta, merkinnät badges-filtterin kautta. Toimituspäivä näytetään kortissa, ei ryhmittelemällä listaa lähtöpaikan mukaan (Oskar Q19). Jokainen kortti on oma Vue-sovelluksensa: noin 160 korttia puhelimella (TP6)."
  },
  maaravalitsin: {
    tier: "shared",
    where: ["THEME: WooAddToCart.vue", "CoCart"],
    events: [{ name: "add_to_cart", when: "kun muutos on tallentunut koriin (debounce valmis)" }, { name: "remove_from_cart", when: "kun muutos on tallentunut" }],
    note: "Muutos tallennetaan sekunnin viiveellä, ja koko kauppa lukitaan pyynnön ajaksi. Jos sivulta poistuu alle sekunnissa, muutos katoaa (TP6)."
  },
  tuotelista: {
    tier: "shared",
    hooks: ["gds/product-list/groups"],
    where: ["gds/product-list", "FacetWP"],
    events: [{ name: "view_item_list", when: "lista näytetään (item_list_id: kategoria, pikatilaus, outlet, kampanjassa)" }, { name: "search", when: "haku tehdään, viiveellä eikä jokaisesta näppäilystä (search_term, results_count)" }],
    note: "Brändisuodatin (pikatilaus): brändi on oma suodattimensa, kun se ei ole kategoria. Kysytty Oskarilta, missä brändi on tallennettu. FacetWP kirjoittaa hakusanan osoitteeseen, ja GA4 laskee jokaisen näppäilyn sivunäytöksi. search-tapahtuma korvaa sen."
  },
  "tuoterivi-layoutit": { tier: "wf", note: "Layoutien vertailu. B valittu 30.9.2026." },
  kirjautuminen: {
    tier: "shared",
    hooks: ["woocommerce_login_redirect (Retail site-plugin)", "auth_cookie_expiration"],
    where: ["THEME: woocommerce/myaccount/form-login.php (uusi ylikirjoitus)", "WGB: genero/account-content", "Kaupan asetukset: nimi ja kenelle-teksti"],
    events: [{ name: "login", when: "kirjautuminen onnistuu (method)" }, { name: "login_failed", when: "tunnus tai salasana hylätään (reason: invalid, locked)" }],
    note: "Lomake on yksi jaettu sivupohja kaikille kuudelle kaupalle, joten korjaukset tehdään tarkoituksella kaikille. Ohjaus kirjautumisen jälkeen on Retailin filtteri: syvälinkki, muuten etusivun tila B. Muissa kaupoissa väliaikaisesti /shop/. Kirjautunut tila tallennetaan käyttäjäominaisuudeksi, jotta tilisivu ja lomake erottuvat analytiikassa."
  },
  "salasanan-palautus": {
    tier: "shared",
    hooks: ["password_reset_expiration (Retail: 7 vrk)"],
    where: ["THEME: woocommerce/myaccount/form-lost-password.php (uusi ylikirjoitus)"],
    events: [{ name: "password_reset_request", when: "linkki pyydetään" }],
    note: "Palautus ohjaa aina samaan vastaukseen, eikä kerro, onko osoitteella tunnusta (gds-security-hardening)."
  },
  "salasanan-asetus": {
    tier: "shared",
    hooks: ["woocommerce_login_redirect / reset-ohjaus (Retail site-plugin): kutsusta etusivun tila B", "password_reset_expiration (Retail: 7 vrk)"],
    where: ["THEME: woocommerce/myaccount/form-reset-password.php (uusi ylikirjoitus)", "WooCommercen uuden tilin viesti (kutsu, M3_CUSTOMERS_WELCOME_EMAIL)"],
    events: [{ name: "login", when: "salasana asetettu ja käyttäjä kirjautunut (method = set_password)" },
             { name: "form_error", when: "salasana hylätään: liian lyhyt tai eivät täsmää (form = set_password, field)" },
             { name: "password_reset_request", when: "vanhentuneesta linkistä pyydetään uusi (yksi painallus, osoite linkistä)" }],
    note: "Kutsu ja palautus käyttävät samaa sivua. Kutsu lähtee vain, kun asiakas luodaan M3:sta, ja se on nyt pois päältä. TP3: käyttäjätunnus näkyy lomakkeessa (login-parametri rp-linkistä), ja kutsusta tallennus kirjaa sisään ja vie etusivun tilaan B. Oletuksena WordPress ei kirjaa sisään salasanan asetuksen jälkeen, joten automaattinen kirjautuminen on Retailin filtteri (Oskar vahvistaa koukun)."
  },
  kutsuviesti: {
    tier: "blog",
    hooks: ["password_reset_expiration (Retail: 7 vrk)", "UTM linkkiin Retailin filtterillä (utm_source=email, utm_medium=invite, utm_campaign=launch|ready)"],
    where: ["WooCommerce: emails/customer-new-account.php (ylikirjoitus)", "Kaupan WooCommerce-sähköpostiasetukset: aihe, otsikko, lisäteksti", "Asetus: Send password setup link"],
    events: [{ name: "(UTM)", when: "istunnon lähde email / invite / launch|ready, kun kutsun linkki avataan" }],
    note: "Viestin sisältö on kauppakohtainen: aihe ja teksti kaupan asetuksissa, runko ylikirjoituksena. Kaksi versiota: kutsu nykyisille asiakkaille julkaisussa ja tunnukset valmiit tunnuspyynnön jälkeen (08 R-S3, R-S4). Kutsu lähtee, kun synkka luo käyttäjän (nyt pois päältä, M3_CUSTOMERS_WELCOME_EMAIL). Avoin Snellmanille: kutsujen ajoitus ja puuttuvat sähköpostit M3:ssa."
  },
  header: {
    tier: "blog",
    where: ["THEME: parts/header.html", "core/navigation (kaupan wp_navigation)", "WGB: account_link"],
    note: "Jos kauppa ylikirjoittaa headerin sivueditorissa, se ei enää saa teeman myöhempiä korjauksia. Tili on valikko alasivuihin (Osoitteet, Tilitiedot, Kirjaudu ulos) eikä linkki /my-account/-etusivulle, koska se ohjaa kirjautuneen etusivulle (TP2). Retailissa kaupan oma wp_navigation-alavalikko (core/navigation-submenu), ei teemamuutosta. Ikonit tulevat Font Awesome -kitistä, joka estää renderöinnin puhelimella."
  },
  footer: { tier: "blog", where: ["THEME: parts/footer.html"] },
  toimituspaiva: {
    tier: "gate",
    hooks: ["m3/stock/multi_warehouse"],
    where: ["THEME: gds/warehouse (warehouse.js, easepick)", "M3-plugin: Routes"],
    branch: "feat/delivery-date-picker-per-loading-place: yksi tavoitepäivä, jokainen lähtöpaikka saa aikaisimman päivänsä sen jälkeen. Kytkin oletuksena pois, muut kaupat regressiotestattu.",
    events: [{ name: "select_delivery_date", when: "päivä vahvistetaan kalenterissa, ei nuolinäppäimellä liikuttaessa (delivery_date, days_ahead, delivery_groups, first_selection)" }],
    note: "Valitsin lataa sivun uudelleen useaan kertaan (window.location.reload)."
  },
  aloituskortit: {
    tier: "blog",
    where: ["Retailin etusivupohja (FSE, kaupan omat taulut)", "genero/quick-links (uusi lohko)", "Tilaa uudelleen: M3-plugin (ks. TP5)"],
    events: [{ name: "reorder_start", when: "Tilaa uudelleen -korttia napautetaan (source: home)" }, { name: "select_content", when: "muu kortti napautetaan (content_type: start_link, item_id)" }],
    note: "Etusivun tila B on Retailin oma sivupohja, joten kortit eivät vaikuta muihin kauppoihin. Kirjautumisen jälkeinen ohjaus tänne on Retailin filtteri (woocommerce_login_redirect). Jos toimituspäivää ei ole valittu, kortit vievät valitsimeen. Tilaa uudelleen -toiminto itsessään on jaettu (TP5)."
  },
  kategoriaruudukko: {
    tier: "blog",
    where: ["Retailin etusivupohja", "genero/category-grid (uusi) tai woocommerce/product-categories"],
    events: [{ name: "select_content", when: "kategoria napautetaan (content_type: category, item_id)" }, { name: "view_item_list", when: "kategoriasivu näytetään (item_list_id: kategoria)" }],
    note: "Kategoriat ja järjestys ovat kaupan sisältöä. Ryhmittely odottaa kategoriatietoja."
  }
};
