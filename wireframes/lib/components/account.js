/* =================================================================
 * Tili: kirjautuminen, salasanan palautus, salasanan asetus, kutsuviesti.
 * TP1 ja TP3 (service-design/prototyypin-tyopaketit.md), 30.9.2026.
 *
 * Tuotannossa: WooCommercen form-login.php, form-lost-password.php ja
 * form-reset-password.php. Teemassa ei ole niille ylikirjoitusta, joten
 * nämä ovat uusia ylikirjoituksia jaettuun teemaan (kaikki kuusi kauppaa).
 * Kaupan nimi ja "kenelle" tulevat kaupan omista asetuksista.
 *
 * Kitkat, jotka tämä korjaa (service-design/selvitys-mittaus-ja-kirjautuminen.md):
 *   K1 Muista minut oletuksena päälle · K2 kaupan nimi ja polku tunnuksiin
 *   K3 kenttien teksti 16 px (ei iOS-zoomia) · K4 näytä salasana ilman jQueryä,
 *   12 merkin vaatimus näkyvissä ennen lähetystä · K5 tunnuskentän attribuutit
 *   K7 kosketusalueet ≥ 44 px · K9 kirjautunut ilman asiakkuutta saa viestin.
 * Tietoturva (gds-security-hardening): virheviesti on sama väärälle tunnukselle
 * ja salasanalle, eikä palautus kerro, onko osoitteella tunnusta.
 *
 * TP3 käyttöönotto: kutsuviesti (inviteEmail, WooCommercen customer_new_account),
 * jonka linkki avaa salasanan asetuksen käyttäjätunnus näkyvissä. Vanhentunut
 * linkki lähettää uuden samaan osoitteeseen yhdellä painalluksella, koska
 * osoite tulee linkistä (WordPressin rp-linkin login-parametri).
 *
 * Tapahtumat: sn:login { remember } · sn:lostpassword {} · sn:setpassword {}
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, t, cls, UI } = SN;

  UI.login = {
    heading: "Kirjaudu sisään",
    email: "Sähköpostiosoite",
    password: "Salasana",
    show: "Näytä", hide: "Piilota",
    showAria: "Näytä salasana", hideAria: "Piilota salasana",
    remember: "Pidä minut kirjautuneena",
    submit: "Kirjaudu",
    lost: "Unohtuiko salasana?",
    noAccount: "Ei vielä tunnuksia?",
    requestLead: "Tilaatko jo Snellmanilta puhelimella tai sähköpostilla? Pyydä tunnukset, niin ne liitetään asiakkuuteesi.",
    request: "Pyydä tunnukset",
    errors: {
      invalid: "Sähköpostiosoite tai salasana ei täsmää. Tarkista tiedot tai pyydä uusi salasana.",
      empty: "Täytä sähköpostiosoite ja salasana.",
      locked: "Liian monta kirjautumisyritystä. Yritä uudelleen {minuutit} minuutin kuluttua tai pyydä uusi salasana.",
      nocustomer: "Olet kirjautunut, mutta tunnuksellasi ei voi tilata tästä kaupasta. Tunnus voi kuulua toiseen Snellmanin kauppaan. Ota yhteyttä asiakaspalveluun, puh. {puhelin}."
    }
  };
  UI.lostPassword = {
    heading: "Uusi salasana",
    lead: "Kirjoita sähköpostiosoite, jolla kirjaudut. Lähetämme linkin, jolla voit asettaa uuden salasanan.",
    submit: "Lähetä linkki",
    sentTitle: "Tarkista sähköpostisi",
    sent: "Jos osoitteella {email} on tunnus, lähetimme siihen linkin. Linkki on voimassa {voimassa}. Tarkista myös roskaposti.",
    back: "Takaisin kirjautumiseen",
    noMail: "Eikö viestiä tule? Tunnuksesi voi olla toisella osoitteella, tai sinulla ei ole vielä tunnusta.",
    request: "Pyydä tunnukset"
  };
  UI.setPassword = {
    headingInvite: "Aseta salasana",
    headingReset: "Vaihda salasana",
    leadInvite: "Tervetuloa Snellmanin tilauskauppaan. Aseta salasana, niin pääset tilaamaan.",
    username: "Käyttäjätunnuksesi",
    nextTime: "Jatkossa kirjaudut tällä sähköpostiosoitteella ja salasanalla.",
    leadReset: "Kirjoita uusi salasana kahdesti.",
    password: "Uusi salasana",
    repeat: "Uusi salasana uudelleen",
    rule: "Vähintään {min} merkkiä.",
    ruleOk: "Vähintään {min} merkkiä. Kunnossa.",
    submitInvite: "Tallenna ja siirry tilaamaan",
    submitReset: "Tallenna salasana",
    errors: {
      short: "Salasanassa pitää olla vähintään {min} merkkiä.",
      mismatch: "Salasanat eivät täsmää."
    },
    expiredTitle: "Linkki on vanhentunut",
    expired: "Linkki on voimassa {voimassa}. Pyydä uusi linkki, niin lähetämme sen samaan osoitteeseen.",
    expiredKnown: "Linkki on voimassa {voimassa}. Lähetämme uuden linkin osoitteeseen {email}.",
    expiredCta: "Pyydä uusi linkki",
    expiredResend: "Lähetä uusi linkki",
    expiredOther: "Tunnus on toisella osoitteella?"
  };
  /* Kutsuviesti: WooCommercen uuden tilin viesti (customer_new_account), kauppakohtainen sisältö.
     launch = nykyiset asiakkaat julkaisuerässä, ready = tunnuspyynnön jälkeen. */
  UI.inviteEmail = {
    head: { from: "Lähettäjä", to: "Vastaanottaja", subject: "Aihe" },
    from: "Snellman tilauskanava",
    launch: {
      subject: "Tilaa Snellmanin tuotteet nyt verkosta",
      preheader: "Tunnuksesi ovat valmiina. Aseta salasana ja aloita.",
      heading: "Snellmanin tuotteet nyt verkosta",
      greeting: "Hei,",
      body: "Voit nyt tilata Snellmanin tuotteet yrityksellesi {company} verkosta. Tunnuksesi ovat valmiina, joten tarvitset vain salasanan.",
      points: ["Valitse toimituspäivä ja näe omat hintasi ja saatavuus.", "Lähetä tilaus silloin, kun sinulle sopii.", "Tilaa edellinen tilaus uudelleen muutamalla napautuksella."],
      phone: "Voit tilata edelleen myös puhelimella."
    },
    ready: {
      subject: "Tunnuksesi Snellmanin tilauskanavaan ovat valmiit",
      preheader: "Aseta salasana, niin pääset tilaamaan.",
      heading: "Tunnuksesi ovat valmiit",
      greeting: "Hei {name},",
      body: "tunnuksesi yritykselle {company} ovat valmiit. Aseta salasana, niin pääset tilaamaan.",
      points: [],
      phone: ""
    },
    username: "Käyttäjätunnuksesi on {email}.",
    cta: "Aseta salasana",
    valid: "Linkki on voimassa {voimassa} ({asti} asti). Jos linkki ehtii vanhentua, avaa se silti: saat uuden linkin samaan osoitteeseen yhdellä painalluksella.",
    colleague: "Tilaako yrityksessänne joku muu? Hän voi pyytää omat tunnukset osoitteessa {domain}/tunnukset/.",
    help: "Kysyttävää? Vastaa tähän viestiin tai soita {puhelin}.",
    sign: "Terveisin\nSnellmanin asiakaspalvelu"
  };

  /* Salasanakenttä: Näytä/Piilota kentän sisällä, ilman jQueryä (K4). */
  const pwToggle = (fid) =>
    '<button type="button" class="pw-toggle" data-act="pwtoggle" aria-controls="' + esc(fid) + '" aria-label="' + esc(UI.login.showAria) + '">' + SN.cap(UI.login.show) + '</button>';
  /* Tunnuskentän attribuutit (K5): iOS ei muuta isoksi alkukirjaimeksi eikä korjaa. */
  const emailAttrs = (html) => html.replace(/<input /, '<input autocapitalize="none" autocorrect="off" spellcheck="false" ');

  /* ── Kirjautuminen · form-login.php ────────────────────────────── */
  SN.register("login", {
    defaults: { context: "card", state: "idle", email: "", remember: true, storeName: "Snellman Retail",
      audience: "Tilauskauppa ravintoloille, kioskeille ja lähikaupoille.", minutes: 20, phone: "{puhelin}",
      lostHref: "?view=lost", requestHref: "08-tunnukset.html", headingLevel: "" },
    render(a) {
      const L = UI.login, page = a.context === "page";
      const h = a.headingLevel || (page ? "h1" : "h2");
      const errText = { invalid: L.errors.invalid, empty: L.errors.empty, locked: t(L.errors.locked, { minuutit: a.minutes }),
        nocustomer: t(L.errors.nocustomer, { puhelin: a.phone }) }[a.state];
      const notice = errText ? SN.render("notice", { tone: a.state === "nocustomer" ? "warn" : "error", text: errText }) : "";
      const locked = a.state === "locked";
      return '<form class="' + cls("login-card", page && "login-card--page") + '" data-sn="login" novalidate aria-labelledby="login-h">' +
        (page ? '<p class="eyebrow">' + esc(a.storeName) + '</p>' : "") +
        '<' + h + ' id="login-h" class="login-card__h">' + esc(L.heading) + '</' + h + '>' +
        (page ? '<p class="login-card__lead">' + esc(a.audience) + '</p>' : "") +
        notice +
        emailAttrs(SN.render("field", { name: "username", id: "login-user", label: L.email, type: "text", inputmode: "email",
          autocomplete: "username", value: a.email, required: true })) +
        SN.render("field", { name: "password", id: "login-pass", label: L.password, type: "password",
          autocomplete: "current-password", required: true, append: pwToggle("login-pass") }) +
        SN.render("checkbox", { name: "rememberme", id: "login-remember", label: L.remember, checked: a.remember }) +
        SN.render("button", { label: L.submit, type: "submit", block: true, disabled: locked }) +
        '<p class="login-card__lost"><a href="' + esc(a.lostHref) + '">' + esc(L.lost) + '</a></p>' +
        '<div class="login-card__request"><p>' + esc(L.noAccount) + '</p>' +
          (page ? '<p class="login-card__request-lead">' + esc(L.requestLead) + '</p>' : "") +
          SN.render("button", { label: L.request, href: a.requestHref, variant: "outline", block: true }) + '</div>' +
      '</form>';
    }
  });

  /* ── Salasanan palautus · form-lost-password.php ───────────────── */
  SN.register("lostPassword", {
    defaults: { step: "form", email: "", validFor: "7 vuorokautta", backHref: "?view=login", requestHref: "08-tunnukset.html?asiakas=nykyinen" },
    render(a) {
      const P = UI.lostPassword;
      const back = '<p class="login-card__lost"><a href="' + esc(a.backHref) + '">' + esc(P.back) + '</a></p>';
      if (a.step === "sent")
        return '<div class="login-card" data-sn="lost-password"><h1 class="login-card__h">' + esc(P.sentTitle) + '</h1>' +
          SN.render("notice", { tone: "success", text: t(P.sent, { email: a.email || "…", voimassa: a.validFor }) }) +
          /* Nykyinen asiakas ei välttämättä tiedä, millä osoitteella tunnus on (TP3): polku tunnuspyyntöön. */
          '<div class="login-card__request"><p class="login-card__request-lead">' + esc(P.noMail) + '</p>' +
            SN.render("button", { label: P.request, href: a.requestHref, variant: "outline", block: true }) + '</div>' + back + '</div>';
      return '<form class="login-card" data-sn="lost-password" novalidate aria-labelledby="lost-h"><h1 id="lost-h" class="login-card__h">' + esc(P.heading) + '</h1>' +
        '<p class="login-card__lead">' + esc(P.lead) + '</p>' +
        emailAttrs(SN.render("field", { name: "user_login", id: "lost-user", label: UI.login.email, type: "text", inputmode: "email",
          autocomplete: "username", value: a.email, required: true })) +
        SN.render("button", { label: P.submit, type: "submit", block: true }) + back + '</form>';
    }
  });

  /* ── Salasanan asetus · form-reset-password.php (kutsu tai palautus) ── */
  SN.register("setPassword", {
    defaults: { mode: "invite", state: "form", min: 12, validFor: "7 vuorokautta", lostHref: "?view=lost", email: "" },
    render(a) {
      const P = UI.setPassword, invite = a.mode === "invite";
      const userField = a.email ? '<input type="hidden" name="user_login" id="lost-user" autocomplete="username" value="' + esc(a.email) + '">' : "";
      if (a.state === "expired") {
        /* Osoite tulee linkistä: uusi linkki yhdellä painalluksella, ei lomaketta uudelleen. */
        if (a.email)
          return '<form class="login-card" data-sn="lost-password" novalidate aria-labelledby="exp-h"><h1 id="exp-h" class="login-card__h">' + esc(P.expiredTitle) + '</h1>' +
            SN.render("notice", { tone: "warn", role: "none", text: t(P.expiredKnown, { voimassa: a.validFor, email: a.email }) }) + userField +
            SN.render("button", { label: P.expiredResend, type: "submit", block: true }) +
            '<p class="login-card__lost"><a href="' + esc(a.lostHref) + '">' + esc(P.expiredOther) + '</a></p></form>';
        return '<div class="login-card" data-sn="set-password"><h1 class="login-card__h">' + esc(P.expiredTitle) + '</h1>' +
          SN.render("notice", { tone: "warn", text: t(P.expired, { voimassa: a.validFor }) }) +
          SN.render("button", { label: P.expiredCta, href: a.lostHref, block: true }) + '</div>';
      }
      const err1 = a.state === "short" ? t(P.errors.short, { min: a.min }) : "";
      const err2 = a.state === "mismatch" ? P.errors.mismatch : "";
      return '<form class="login-card" data-sn="set-password" novalidate aria-labelledby="set-h"><h1 id="set-h" class="login-card__h">' + esc(invite ? P.headingInvite : P.headingReset) + '</h1>' +
        '<p class="login-card__lead">' + esc(invite ? P.leadInvite : P.leadReset) + '</p>' +
        /* Käyttäjätunnus näkyviin: nykyinen asiakas ei tiedä tunnuksestaan (TP3). Piilokenttä salasanaohjelmille. */
        (a.email ? SN.render("readonlyValue", { label: P.username, value: a.email }) + userField.replace(' id="lost-user"', "") : "") +
        /* Vaatimus näkyy ennen lähetystä (K4) ja päivittyy kirjoittaessa. */
        SN.render("field", { name: "password_1", id: "set-pass1", label: P.password, type: "password", autocomplete: "new-password",
          required: true, help: t(P.rule, { min: a.min }), error: err1, append: pwToggle("set-pass1") })
          .replace('<input ', '<input data-minlen="' + esc(a.min) + '" ') +
        SN.render("field", { name: "password_2", id: "set-pass2", label: P.repeat, type: "password", autocomplete: "new-password",
          required: true, error: err2, append: pwToggle("set-pass2") }) +
        SN.render("button", { label: invite ? P.submitInvite : P.submitReset, type: "submit", block: true }) +
        (invite && a.email ? '<p class="login-card__next">' + esc(P.nextTime) + '</p>' : "") + '</form>';
    }
  });

  /* ── Kutsuviesti · emails/customer-new-account.php (kauppakohtainen sisältö) ──
     Esikatselu sähköpostista: otsakkeet, runko, painike salasanan asetukseen.
     href sisältää UTM-parametrit (utm_source=email, utm_medium=invite, utm_campaign=variant). */
  SN.register("inviteEmail", {
    defaults: { id: "invite-mail-h", variant: "launch", name: "Jarkko", company: "Ravintola Toivola", email: "ravintola@esimerkki.fi",
      href: "09-kirjautuminen.html?view=invite", validFor: "7 vuorokautta", until: "7.10.2026",
      domain: "retail.snellman.fi", phone: "{puhelin}", headingLevel: "h2", showHead: true },
    render(a) {
      const E = UI.inviteEmail, V = E[a.variant] || E.launch, h = a.headingLevel;
      const vars = { name: a.name, company: a.company, email: a.email, voimassa: a.validFor, asti: a.until, domain: a.domain, puhelin: a.phone };
      const p = (txt, c) => txt ? '<p' + (c ? ' class="' + c + '"' : "") + '>' + esc(t(txt, vars)).replace(/\n/g, "<br>") + '</p>' : "";
      const head = a.showHead ? '<dl class="invite-mail__head">' +
          '<dt>' + esc(E.head.from) + '</dt><dd>' + esc(E.from) + '</dd>' +
          '<dt>' + esc(E.head.to) + '</dt><dd>' + esc(a.email) + '</dd>' +
          '<dt>' + esc(E.head.subject) + '</dt><dd class="invite-mail__subj">' + esc(V.subject) + '<span class="invite-mail__pre"> · ' + esc(V.preheader) + '</span></dd></dl>' : "";
      return '<article class="invite-mail" data-sn="invite-email" aria-labelledby="' + esc(a.id) + '">' + head +
        '<div class="invite-mail__body">' +
          '<p class="eyebrow invite-mail__brand">' + esc(E.from) + '</p>' +
          '<' + h + ' id="' + esc(a.id) + '" class="invite-mail__h">' + esc(V.heading) + '</' + h + '>' +
          p(V.greeting) + p(V.body) +
          (V.points.length ? '<ul class="invite-mail__points">' + V.points.map((x) => '<li>' + ico("check") + '<span>' + esc(t(x, vars)) + '</span></li>').join("") + '</ul>' : "") +
          p(V.phone) + p(E.username, "invite-mail__user") +
          SN.render("button", { label: E.cta, href: a.href, block: true }) +
          p(E.valid, "invite-mail__small") +
          (a.variant === "launch" ? p(E.colleague, "invite-mail__small") : "") +
          p(E.help, "invite-mail__small") + p(E.sign, "invite-mail__sign") +
        '</div></article>';
    }
  });

  /* ── Käyttäytyminen: Näytä/Piilota ja pituusvaatimuksen tila ───── */
  SN.behavior((root) => {
    root.addEventListener("click", (e) => {
      const b = e.target.closest('[data-act="pwtoggle"]'); if (!b) return;
      const f = document.getElementById(b.getAttribute("aria-controls")); if (!f) return;
      const show = f.type === "password";
      f.type = show ? "text" : "password";
      /* Nimi vaihtuu (Näytä ↔ Piilota), joten aria-pressed jätetään pois: muuten ruudunlukija sanoisi ”Piilota, painettu”. */
      b.innerHTML = SN.cap(show ? UI.login.hide : UI.login.show);
      b.setAttribute("aria-label", show ? UI.login.hideAria : UI.login.showAria);
    });
    root.addEventListener("input", (e) => {
      const f = e.target.closest("[data-minlen]"); if (!f) return;
      const min = parseInt(f.dataset.minlen, 10), help = document.getElementById(f.id + "-help");
      if (!help) return;
      const ok = f.value.length >= min;
      help.textContent = t(ok ? UI.setPassword.ruleOk : UI.setPassword.rule, { min });
      help.classList.toggle("field__help--ok", ok);
    });
  });
})();
