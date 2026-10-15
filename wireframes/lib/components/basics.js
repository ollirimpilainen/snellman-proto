/* =================================================================
 * Perusosat: painike, merkintä, chip, ilmoitus, murupolku, TÄYTTÖ
 * ================================================================= */
(function () {
  "use strict";
  const { esc, ico, t, cls, UI } = SN;

  /* ── Painike · core/button ─────────────────────────────────────── */
  SN.register("button", {
    defaults: { label: "Painike", variant: "primary", size: "md", icon: "", href: "", block: false, disabled: false, busy: false, busyLabel: "", iconOnly: false, as: "", type: "button", labelHtml: "" },
    render(a) {
      const text = a.variant === "text";
      const c = cls(text ? "btn-text" : "btn", !text && "btn--" + a.variant, !text && a.size === "sm" && "btn--sm", !text && a.block && "btn--block", a.iconOnly && "btn--icon");
      /* labelHtml: sivun valmis HTML (esim. muuttuja pisteviivalla). Vain luotettua sivun omaa sisältöä. */
      /* iconOnly: pelkkä ikoni, nimi aria-labelina (esim. viikkonuolet) */
      const busyText = a.busyLabel || UI.busy;
      const inner = a.iconOnly ? ico(a.icon) :
        (a.labelHtml ? '<span class="cap">' + a.labelHtml + '</span>' : SN.cap(a.busy ? busyText : a.label)) + (a.icon ? ico(a.icon) : "");
      if (a.iconOnly) a = Object.assign({}, a, { attrs: Object.assign({ "aria-label": a.label }, a.attrs || {}) });
      /* as: "span" → painikkeen ulkoasu kokonaan klikattavan kortin sisällä (ei linkkiä linkissä) */
      if (a.as === "span") return '<span class="' + c + '"' + SN.attrs(a) + '>' + inner + '</span>';
      if (a.href && !a.disabled)
        return '<a class="' + c + '" href="' + esc(a.href) + '"' + SN.attrs(a) + '>' + inner + '</a>';
      return '<button type="' + esc(a.type) + '" class="' + c + '"' + (a.disabled ? " disabled" : "") + (a.busy ? ' aria-disabled="true" aria-busy="true"' : "") +
        ' data-sn="button"' + SN.attrs(a) + '>' + inner + '</button>';
    }
  });
  UI.busy = "Lähetetään…";

  /* ── Merkintä · Boost / Outlet ─────────────────────────────────── */
  SN.register("badge", {
    defaults: { type: "boost", discount: 30, label: "", decorative: false },
    render(a) {
      const label = a.label || (UI.badge[a.type] ? t(UI.badge[a.type], { discount: a.discount }) : a.type);
      /* decorative: selitteissä ym., joissa ruudunlukija ei tarvitse alennusta */
      const aria = a.decorative ? ' aria-hidden="true"' : UI.badgeAria[a.type] ? ' role="img" aria-label="' + esc(t(UI.badgeAria[a.type], { discount: a.discount })) + '"' : "";
      return '<span class="badge badge--' + esc(a.type) + '"' + aria + '>' + esc(label) + '</span>';
    }
  });

  /* ── Valinta-chip · facetwp-selections ─────────────────────────── */
  UI.chipRemove = "{label}, poista suodatin";
  SN.register("chip", {
    defaults: { label: "Valmisruoka", mode: "remove", pressed: false },
    render(a) {
      /* link: ankkurilinkki (esim. FAQ-ryhmiin), sama ulkoasu */
      if (a.mode === "link")
        return '<a class="selection selection--link" href="' + esc(a.href || "#") + '" data-sn="chip"' + SN.attrs(a) + '>' + SN.cap(a.label) + '</a>';
      if (a.mode === "toggle")
        return '<button type="button" class="selection" aria-pressed="' + !!a.pressed + '" data-sn="chip"' + SN.attrs(a) + '>' + SN.cap(a.label) + (a.pressed ? ico("check") : "") + '</button>';
      return '<button type="button" class="selection" data-sn="chip" data-act="chip-remove" aria-label="' + esc(t(UI.chipRemove, { label: a.label })) + '"' + SN.attrs(a) + '>' + SN.cap(a.label) + ico("xmark") + '</button>';
    }
  });

  /* ── Ilmoitus · core/group ─────────────────────────────────────── */
  SN.register("notice", {
    defaults: { tone: "info", title: "", text: "Ilmoituksen teksti.", html: "", role: "", actions: [] },
    render(a) {
      const icon = { info: "info", error: "exclamation", warn: "exclamation", success: "check" }[a.tone] || "info";
      /* role: "" = oletus (virhe → alert, muut → status), "none" = staattinen merkintä */
      const role = a.role || (a.tone === "error" ? "alert" : "status");
      const acts = (a.actions || []).length
        ? '<div class="btns">' + a.actions.map((x) => SN.render("button", Object.assign({ variant: "text", icon: "arrow" }, x))).join("") + '</div>' : "";
      return '<div class="' + cls("notice", a.tone !== "info" && "notice--" + a.tone) + '"' + (role === "none" ? "" : ' role="' + role + '"') + '>' + ico(icon) +
        '<div>' + (a.title ? '<p class="notice__title">' + esc(a.title) + '</p>' : "") + '<p>' + (a.html || esc(a.text)) + '</p>' + acts + '</div></div>';
    }
  });

  /* ── Murupolku · genero/breadcrumb ─────────────────────────────── */
  SN.register("breadcrumb", {
    defaults: { label: "Murupolku", items: [ { label: "Etusivu", href: "#" }, { label: "Kategoriat", href: "#" }, { label: "Tuore liha" } ] },
    render(a) {
      const items = a.items || [];
      return '<nav class="breadcrumb" aria-label="' + esc(a.label) + '"><ol>' +
        items.map((x, i) => i === items.length - 1
          ? '<li aria-current="page">' + esc(x.label) + '</li>'
          : '<li><a href="' + esc(x.href || "#") + '">' + esc(x.label) + '</a></li>').join("") +
        '</ol></nav>';
    }
  });

  /* ── Wireframe-merkinnät ───────────────────────────────────────── */
  SN.register("fill", {
    defaults: { text: "Snellmanin juridiikka täydentää", block: false, prefix: "TÄYTTÖ: ", title: "", items: [] },
    render(a) {
      /* title + items: pidempi muistiinpano (esim. ohje sisällöntuottajalle) */
      if (a.title || (a.items || []).length)
        return '<div class="fill fill--block">' + (a.title ? '<p class="fill__title">' + esc(a.prefix + a.title) + '</p>' : "") +
          (a.text && a.title ? '<p>' + esc(a.text) + '</p>' : "") +
          ((a.items || []).length ? '<ul class="fill__list">' + a.items.map((x) => '<li>' + esc(x) + '</li>').join("") + '</ul>' : "") + '</div>';
      return '<span class="' + cls("fill", a.block && "fill--block") + '">' + esc(a.prefix + a.text) + '</span>';
    }
  });

  /* ── Kortti · gds/card ──────────────────────────────────────────────
     Staattinen tai koko kortti linkkinä. Linkkikortin cta on ulkoasu (span),
     ei sisäkkäistä linkkiä. html: sivun oma lisäsisältö (esim. merkintä). */
  SN.register("card", {
    defaults: { title: "Asiakaspalvelu ja usein kysytyt kysymykset", text: "Toimitukset, tuotteet, tunnukset.", textHtml: "",
      href: "", cta: "", headingLevel: 3, html: "", cls: "" },
    render(a) {
      const h = "h" + (parseInt(a.headingLevel, 10) || 3), tag = a.href ? "a" : "div";
      return "<" + tag + ' class="' + cls("card", a.href && "card--link", a.cls) + '"' + (a.href ? ' href="' + esc(a.href) + '"' : "") + ">" +
        (a.html || "") +
        (a.title ? "<" + h + ">" + esc(a.title) + "</" + h + ">" : "") +
        (a.textHtml ? a.textHtml : a.text ? "<p>" + esc(a.text) + "</p>" : "") +
        (a.href && a.cta ? '<span class="card__go">' + SN.render("button", { variant: "text", as: "span", label: a.cta, icon: "arrow" }) + "</span>" : "") +
        "</" + tag + ">";
    }
  });

  /* ── Osion otsikkorivi ──────────────────────────────────────────────
     Otsikko ja valinnainen ”Kaikki …” -linkki samalla rivillä, kapeassa allekkain. */
  SN.register("sectionHead", {
    defaults: { heading: "Boost-erät nyt", headingHtml: "", id: "", level: 2, link: { label: "Kaikki Boost-erät", href: "#" }, tight: false },
    render(a) {
      const h = "h" + (parseInt(a.level, 10) || 2);
      return '<div class="' + cls("section-head", a.tight && "section-head--tight") + '">' +
        "<" + h + (a.id ? ' id="' + esc(a.id) + '"' : "") + ">" + (a.headingHtml || esc(a.heading)) + "</" + h + ">" +
        (a.link && a.link.label ? SN.render("button", { variant: "text", label: a.link.label, href: a.link.href, icon: "arrow" }) : "") + "</div>";
    }
  });

  /* ── Haitari · gds/accordion ────────────────────────────────────────
     Yksi auki kerrallaan ryhmässä (single), kaikki auki (Miro-vienti),
     ankkuri #ryhmä avaa ryhmän ensimmäisen kysymyksen. a = sivun HTML. */
  SN.register("accordion", {
    defaults: { id: "", single: true, openAll: false, open: -1, hashOpen: true, items: [ { q: "Milloin tilaus pitää tehdä?", a: "Viimeistään toimitusta edeltävänä arkipäivänä klo 12." } ] },
    render(a) {
      const gid = a.id || SN.uid("acc");
      /* hashOpen: false → ankkuri osioon ei avaa (esim. sisällysluettelon hypyt 05:ssä) */
      return '<div class="acc" id="' + esc(gid) + '" data-sn="accordion"' + (a.single ? ' data-single="1"' : "") + (a.hashOpen === false ? ' data-hash-open="0"' : "") + '>' + (a.items || []).map((x, i) => {
        const open = a.openAll || i === a.open, pid = gid + "-p" + i;
        return '<div class="acc__item"><h3 class="acc__h"><button type="button" class="acc__btn" data-act="acc" aria-expanded="' + open + '" aria-controls="' + pid + '">' +
          /* qHidden: ruudunlukijan tarkenne, kun sama kysymys toistuu (esim. ”Tarkempi ehto: Minimitilaus”) */
          '<span>' + esc(x.q) + (x.qHidden ? '<span class="vh">: ' + esc(x.qHidden) + '</span>' : "") + '</span>' + ico("chevronDownLight") + '</button></h3>' +
          '<div class="acc__panel" id="' + pid + '"' + (open ? "" : ' hidden="until-found"') + '>' + (x.a || "") + '</div></div>';
      }).join("") + '</div>';
    }
  });
  SN.behavior(function (root) {
    const toggle = (btn, open) => {
      btn.setAttribute("aria-expanded", String(open));
      const p = document.getElementById(btn.getAttribute("aria-controls"));
      if (p) { if (open) p.removeAttribute("hidden"); else p.setAttribute("hidden", "until-found"); }
    };
    /* Selaimen haku avasi paneelin (beforematch): painikkeen tila samaksi */
    root.addEventListener("beforematch", (e) => {
      const p = e.target.closest && e.target.closest(".acc__panel"); if (!p) return;
      const btn = document.querySelector('[aria-controls="' + p.id + '"]'); if (btn) btn.setAttribute("aria-expanded", "true");
    }, true);
    root.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-act="acc"]'); if (!btn) return;
      const acc = btn.closest(".acc"), open = btn.getAttribute("aria-expanded") !== "true";
      if (open && acc && acc.dataset.single) acc.querySelectorAll('[data-act="acc"][aria-expanded="true"]').forEach((b) => toggle(b, false));
      toggle(btn, open);
      SN.emit(btn, "accordion", { id: acc && acc.id, open });
    });
    /* #ryhmän-id → avaa ryhmän ensimmäinen kysymys */
    const fromHash = () => {
      const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const acc = el && (el.matches(".acc") ? el : el.querySelector('.acc:not([data-hash-open="0"])'));
      if (acc && acc.dataset.hashOpen === "0") return;
      const first = acc && acc.querySelector('[data-act="acc"]');
      if (first && first.getAttribute("aria-expanded") !== "true") first.click();
    };
    window.addEventListener("hashchange", fromHash);
    setTimeout(fromHash, 0);
  });
})();
