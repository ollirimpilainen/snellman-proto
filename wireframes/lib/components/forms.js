/* =================================================================
 * Lomake: kenttä, kenttärivi, valintakortit, virheyhteenveto,
 * vain luku -arvo, askellista, piilokenttä ja validaattorit.
 * Lähde: 08-tunnukset.html (genero/access-request), 30.9.2026.
 * Toteutus tuotannossa: olemassa oleva lomakeratkaisu (esim. Gravity Forms)
 * tai oma lohko — avoin kysymys, ks. 08-tunnukset.md.
 *
 * Tapahtumat: sn:choice { name, value } · sn:fieldvalid { name }
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, cls, UI } = SN;

  UI.form = { optional: "(valinnainen)", honeypot: "Jätä tämä kenttä tyhjäksi" };

  /* ── Validaattorit ─────────────────────────────────────────────────
     Palauttavat true, kun arvo kelpaa. Viestit ovat sivun (PAGE), koska ne
     riippuvat kentästä. Tyhjä arvo on aina "ok" — pakollisuus erikseen. */
  const ytunnus = (v) => {
    const m = /^(\d{7})-(\d)$/.exec(String(v).trim());
    if (!m) return false;
    const w = [7, 9, 10, 5, 8, 4, 2];
    const r = m[1].split("").reduce((s, d, i) => s + d * w[i], 0) % 11;
    if (r === 1) return false;
    return (r === 0 ? 0 : 11 - r) === Number(m[2]);
  };
  SN.validators = {
    email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    ytunnus,
    ytunnusFormat: (v) => /^\d{7}-\d$/.test(String(v).trim()),
    postcode: (v) => /^\d{5}$/.test(v),
    customer: (v) => /^\d{3,10}$/.test(v) || ytunnus(v),     /* asiakasnumero tai y-tunnus */
    phone:    (v) => /^[+\d][\d\s-]{5,}$/.test(v)
  };
  /* Tarkista kentät: fields = [{ name, required, rule, type }], values = { name: arvo }.
     Palauttaa { name: "required" | säännön nimi } virheellisille. */
  SN.checkFields = (fields, values) => {
    const out = {};
    fields.forEach((f) => {
      const v = String(values[f.name] == null ? "" : values[f.name]).trim();
      if (!v) { if (f.required) out[f.name] = "required"; return; }
      if (f.rule && SN.validators[f.rule] && !SN.validators[f.rule](v)) out[f.name] = f.rule;
    });
    return out;
  };

  /* ── Kenttä · text | email | tel | number | textarea | select ────── */
  SN.register("field", {
    defaults: { name: "company", label: "Yrityksen nimi", type: "text", value: "", help: "", error: "", required: true,
      short: false, autocomplete: "", inputmode: "", placeholder: "", options: [], readonly: false, rule: "", fill: "", rows: 3,
      maxlength: "", describedby: "", append: "" },
    render(a) {
      const id = a.id || "f-" + a.name;
      /* describedby: sivun omat kuvaukset (esim. merkkilaskuri); append: sivun HTML kentän perään (esim. Näytä-painike) */
      const desc = [a.help ? id + "-help" : "", a.error ? id + "-err" : "", a.describedby].filter(Boolean).join(" ");
      const common = ' id="' + esc(id) + '" name="' + esc(a.name) + '"' +
        (desc ? ' aria-describedby="' + desc + '"' : "") + (a.error ? ' aria-invalid="true"' : "") +
        (a.required ? " required" : "") + (a.readonly ? " readonly" : "") +
        (a.autocomplete ? ' autocomplete="' + esc(a.autocomplete) + '"' : "") + (a.inputmode ? ' inputmode="' + esc(a.inputmode) + '"' : "") +
        (a.maxlength ? ' maxlength="' + esc(a.maxlength) + '"' : "");
      let input;
      if (a.type === "select") {
        input = '<select' + common + '><option value="">' + esc(a.placeholder) + '</option>' +
          (a.options || []).map((o) => { const v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o;
            return '<option value="' + esc(v) + '"' + (String(a.value) === String(v) ? " selected" : "") + '>' + esc(l) + '</option>'; }).join("") + '</select>';
      } else if (a.type === "textarea") {
        input = '<textarea' + common + ' rows="' + esc(a.rows) + '"' + (a.placeholder ? ' placeholder="' + esc(a.placeholder) + '"' : "") + '>' + esc(a.value) + '</textarea>';
      } else {
        input = '<input' + common + ' type="' + esc(a.type) + '" value="' + esc(a.value) + '"' + (a.placeholder ? ' placeholder="' + esc(a.placeholder) + '"' : "") + '>';
      }
      return '<div class="' + cls("field", a.short && "field--short", a.type === "select" && "field--select") + '" data-sn="field"' +
          (a.error ? " data-invalid" : "") + (a.rule ? ' data-rule="' + esc(a.rule) + '"' : "") + (a.required ? " data-required" : "") + '>' +
        '<label class="field__label" for="' + esc(id) + '">' + esc(a.label) + (a.required ? "" : ' <span class="field__opt">' + esc(UI.form.optional) + '</span>') + '</label>' +
        (a.help ? '<span class="field__help" id="' + esc(id) + '-help">' + esc(a.help) + '</span>' : "") +
        (a.append ? '<div class="field__control">' + input + a.append + '</div>' : input) +
        '<p class="field__err" id="' + esc(id) + '-err"' + (a.error ? "" : " hidden") + '>' + (a.error ? ico("exclamation") + '<span>' + esc(a.error) + '</span>' : "") + '</p>' +
        (a.fill ? SN.render("fill", { text: a.fill, block: true }) : "") +
      '</div>';
    }
  });

  /* ── Valintaruutu · ehdot, muista minut ─────────────────────────── */
  SN.register("checkbox", {
    defaults: { name: "terms", label: "Hyväksyn tilausehdot", labelHtml: "", checked: false, required: false, error: "" },
    render(a) {
      const id = a.id || "f-" + a.name;
      return '<div class="checkfield" data-sn="checkbox"' + (a.error ? " data-invalid" : "") + '><label class="checkfield__label" for="' + esc(id) + '">' +
        '<input type="checkbox" id="' + esc(id) + '" name="' + esc(a.name) + '"' + (a.checked ? " checked" : "") + (a.required ? " required" : "") +
          (a.error ? ' aria-invalid="true" aria-describedby="' + esc(id) + '-err"' : "") + '><span>' + (a.labelHtml || esc(a.label)) + '</span></label>' +
        '<p class="field__err" id="' + esc(id) + '-err"' + (a.error ? "" : " hidden") + '>' + (a.error ? ico("exclamation") + '<span>' + esc(a.error) + '</span>' : "") + '</p></div>';
    }
  });

  /* ── Kenttärivi · esim. postinumero + postitoimipaikka ─────────── */
  SN.register("fieldRow", {
    defaults: { cols: "140px minmax(0, 1fr)", fields: [] },
    render(a) {
      return '<div class="field-row" style="--field-cols:' + esc(a.cols) + '">' + (a.fields || []).map((f) => SN.render("field", f)).join("") + '</div>';
    }
  });

  /* ── Valintakortit · radio-ryhmä, koko kortti klikattava ────────── */
  SN.register("choiceCards", {
    defaults: { name: "asiakas", legend: "Oletko jo Snellmanin asiakas?", value: "", cols: 2, options: [] },
    render(a) {
      return '<fieldset class="choices" data-sn="choice-cards"><legend class="choices__legend">' + esc(a.legend) + '</legend>' +
        '<div class="choices__opts" style="--choice-cols:' + (parseInt(a.cols, 10) || 2) + '">' + (a.options || []).map((o) =>
          '<label class="choice-card"><input type="radio" name="' + esc(a.name) + '" value="' + esc(o.value) + '"' + (String(a.value) === String(o.value) ? " checked" : "") + '>' +
          '<span class="choice-card__t">' + esc(o.title) + '</span>' + (o.sub ? '<span class="choice-card__s">' + esc(o.sub) + '</span>' : "") + '</label>').join("") +
        '</div></fieldset>';
    }
  });

  /* ── Virheyhteenveto · alert, linkit kenttiin, fokuskohde ───────── */
  SN.register("errorSummary", {
    defaults: { id: "errsum", title: "Tarkista merkityt kentät.", items: [] },
    render(a) {
      if (!(a.items || []).length) return "";
      return '<div class="notice notice--error error-summary" id="' + esc(a.id) + '" tabindex="-1" role="alert" aria-labelledby="' + esc(a.id) + '-title">' + ico("exclamation") +
        '<div><h2 class="notice__title error-summary__title" id="' + esc(a.id) + '-title">' + esc(a.title) + '</h2><ul class="error-summary__list">' +
        a.items.map((x) => '<li><a href="#' + esc(x.field) + '">' + esc(x.label ? x.label + ": " + x.text : x.text) + '</a></li>').join("") + '</ul></div></div>';
    }
  });

  /* ── Vain luku -arvo · esitäytetty tieto (kirjautunut) ──────────── */
  SN.register("readonlyValue", {
    defaults: { label: "Yritys", value: "Ravintola Toivola, asiakasnumero 100482", valueHtml: "" },
    render(a) {
      return '<div class="readonly-value"><span class="readonly-value__label">' + esc(a.label) + '</span><b>' + (a.valueHtml || esc(a.value)) + '</b></div>';
    }
  });

  /* ── Askellista · "Näin se etenee" ──────────────────────────────── */
  SN.register("stepList", {
    defaults: { id: "", heading: "Näin se etenee", items: [ "Lähetä pyyntö.", "Asiakaspalvelu käsittelee pyynnön.", "Saat linkin sähköpostiin." ], itemsHtml: [] },
    render(a) {
      const hid = a.id || SN.uid("steps");
      const items = (a.itemsHtml || []).length ? a.itemsHtml : (a.items || []).map(esc);
      return '<div class="step-list"><h2 class="step-list__h" id="' + esc(hid) + '">' + esc(a.heading) + '</h2><ol>' +
        items.map((x) => '<li><span>' + x + '</span></li>').join("") + '</ol></div>';
    }
  });

  /* ── Piilokenttä · roskapostisuoja ilman CAPTCHAa ───────────────── */
  SN.register("honeypot", {
    defaults: { name: "website" },
    render(a) {
      return '<div class="honeypot" aria-hidden="true"><label for="f-' + esc(a.name) + '">' + esc(UI.form.honeypot) + '</label>' +
        '<input id="f-' + esc(a.name) + '" name="' + esc(a.name) + '" tabindex="-1" autocomplete="off"></div>';
    }
  });

  /* ── Käyttäytyminen ────────────────────────────────────────────────
     Korjattu kenttä vapautuu virheestä heti kirjoittaessa. Uusia virheitä
     ei näytetä kesken kirjoituksen (vasta lähetyksessä, sivun päätös). */
  SN.clearFieldError = (box) => {
    box.removeAttribute("data-invalid");
    const el = box.querySelector("input, select, textarea"); if (el) el.removeAttribute("aria-invalid");
    const er = box.querySelector(".field__err"); if (er) { er.hidden = true; er.innerHTML = ""; }
  };
  SN.behavior(function (root) {
    const onEdit = (e) => {
      const el = e.target, box = el.closest && el.closest('.field[data-invalid]'); if (!box) return;
      const v = String(el.value).trim();
      const ok = (!box.hasAttribute("data-required") || v) && (!v || !box.dataset.rule || !SN.validators[box.dataset.rule] || SN.validators[box.dataset.rule](v));
      if (ok) { SN.clearFieldError(box); SN.emit(box, "fieldvalid", { name: el.name }); }
    };
    root.addEventListener("input", onEdit);
    root.addEventListener("change", (e) => {
      onEdit(e);
      const r = e.target.closest && e.target.closest(".choice-card input[type=radio]");
      if (r) SN.emit(r, "choice", { name: r.name, value: r.value });
    });
  });
})();
