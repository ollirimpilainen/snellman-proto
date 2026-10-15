/* =================================================================
 * Komponenttikirjaston käyttöliittymä (Storybook-tyylinen).
 * Tila elää URL-hashissa, joten jokainen näkymä on jaettava linkki:
 *   #story=tuoterivi--boost&args={"qty":3}&vp=390&bg=block
 *   #docs=tuoterivi
 *   (tyhjä) = aloitussivu
 * ================================================================= */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const ICON = {
    chev: '<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    outline: '<svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/></svg>',
    link: '<svg viewBox="0 0 16 16"><path d="M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.7.7M9 7a3 3 0 0 0-4.2 0l-2 2A3 3 0 0 0 7 13.2l.7-.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    ext: '<svg viewBox="0 0 16 16"><path d="M9 2h5v5M14 2L7 9M12 10v4H2V4h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 16 16"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const ui = (n) => '<span class="ui-ico" aria-hidden="true">' + ICON[n] + '</span>';

  const VIEWPORTS = [
    { id: "", label: "Sovita" },
    { id: "1440", label: "1440" },
    { id: "1024", label: "1024" },
    { id: "768", label: "768" },
    { id: "390", label: "390" }
  ];
  const STATUS = { on: "Olemassa", laajennus: "Laajennus", uusi: "Uusi", wireframe: "Wireframe" };
  const GROUP_ORDER = ["Perusta", "Perusosat", "Tuote", "Lomake", "Tili", "Kehys"];

  const state = {
    mode: "home", storyId: null, docsId: null, args: {}, vp: "", bg: "", outline: false,
    tab: "controls", events: [], rendered: "", open: new Set(), collapsedGroups: new Set(), q: ""
  };
  try {
    const saved = JSON.parse(localStorage.getItem("snl-ui") || "{}");
    if (saved.tab) state.tab = saved.tab;
    if (saved.panelH) document.documentElement.style.setProperty("--panel-h", saved.panelH + "px");
    if (saved.side === false || (saved.side === undefined && window.innerWidth < 800)) $("#app").classList.add("is-side-hidden");
  } catch (e) {}
  const saveUi = (patch) => { try { localStorage.setItem("snl-ui", JSON.stringify(Object.assign(JSON.parse(localStorage.getItem("snl-ui") || "{}"), patch))); } catch (e) {} };

  const comps = SNL.components.slice().sort((a, b) =>
    (GROUP_ORDER.indexOf(a.group) + 99) % 99 - (GROUP_ORDER.indexOf(b.group) + 99) % 99);
  const canvas = $("#canvas");

  /* ── URL ───────────────────────────────────────────────────────── */
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    state.vp = p.get("vp") || ""; state.bg = p.get("bg") || "";
    state.args = {};
    try { state.args = JSON.parse(p.get("args") || "{}"); } catch (e) {}
    if (p.get("story") && SNL.story(p.get("story"))) {
      const f = SNL.story(p.get("story"));
      state.mode = "canvas"; state.storyId = f.id; state.docsId = f.comp.id; state.open.add(f.comp.id);
    } else if (p.get("docs") && SNL.find(p.get("docs"))) {
      state.mode = "docs"; state.docsId = p.get("docs"); state.open.add(state.docsId);
      const c = SNL.find(state.docsId); state.storyId = c.id + "--" + c.stories[0].id;
    } else {
      state.mode = "home";
    }
  }
  function writeHash(replace) {
    const p = new URLSearchParams();
    if (state.mode === "canvas") {
      p.set("story", state.storyId);
      if (Object.keys(state.args).length) p.set("args", JSON.stringify(state.args));
    } else if (state.mode === "docs") p.set("docs", state.docsId);
    if (state.vp && state.mode === "canvas") p.set("vp", state.vp);
    if (state.bg && state.mode === "canvas") p.set("bg", state.bg);
    const h = "#" + p.toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
    if (h === location.hash) return;
    history[replace ? "replaceState" : "pushState"](null, "", h === "#" ? location.pathname : h);
  }

  /* ── Puu ───────────────────────────────────────────────────────── */
  const hl = (text) => {
    if (!state.q) return esc(text);
    const i = text.toLowerCase().indexOf(state.q.toLowerCase());
    return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + state.q.length)) + "</mark>" + esc(text.slice(i + state.q.length));
  };
  function renderTree() {
    const q = state.q.toLowerCase();
    const groups = {};
    comps.forEach((c) => {
      const compHit = !q || c.title.toLowerCase().includes(q) || (c.block || "").toLowerCase().includes(q);
      const stories = c.stories.filter((s) => compHit || s.name.toLowerCase().includes(q));
      if (!compHit && !stories.length) return;
      (groups[c.group] = groups[c.group] || []).push({ c, stories, forceOpen: !!q });
    });
    const html = Object.keys(groups).map((g) => {
      const collapsed = state.collapsedGroups.has(g) && !q;
      return '<div class="tree__group' + (collapsed ? " is-collapsed" : "") + '">' +
        '<button type="button" class="tree__group-title" data-group="' + esc(g) + '" aria-expanded="' + !collapsed + '">' + ui("down") + esc(g) + '</button>' +
        '<div class="tree__items">' + groups[g].map(({ c, stories, forceOpen }) => {
          if (c.kind === "page") {
            const cur = state.mode !== "home" && state.storyId === c.id + "--" + c.stories[0].id;
            return '<a class="tree__item tree__story tree__story--docs" href="#story=' + c.id + '--' + c.stories[0].id + '"' + (cur ? ' aria-current="true"' : "") + '><span class="tree__dot"></span>' + hl(c.title) + '</a>';
          }
          const open = forceOpen || state.open.has(c.id);
          return '<button type="button" class="tree__item tree__comp" data-comp="' + c.id + '" aria-expanded="' + open + '">' + ui("chev") + '<span>' + hl(c.title) + '</span>' +
              '<span class="tree__status status status--' + esc(c.status) + '" title="' + esc(STATUS[c.status] || "") + '">' + esc((STATUS[c.status] || "").slice(0, 1)) + '</span></button>' +
            (open ? '<div class="tree__stories">' +
              '<a class="tree__item tree__story tree__story--docs" href="#docs=' + c.id + '"' + (state.mode === "docs" && state.docsId === c.id ? ' aria-current="true"' : "") + '><span class="tree__dot"></span>Docs</a>' +
              stories.map((s) => {
                const id = c.id + "--" + s.id;
                return '<a class="tree__item tree__story" href="#story=' + id + '"' + (state.mode === "canvas" && state.storyId === id ? ' aria-current="true"' : "") + '><span class="tree__dot"></span>' + hl(s.name) + '</a>';
              }).join("") + '</div>' : "");
        }).join("") + '</div></div>';
    }).join("");
    $("#tree").innerHTML = html || '<div class="tree__empty">Ei osumia haulle ”' + esc(state.q) + '”.</div>';
  }

  /* ── Työkalupalkki ─────────────────────────────────────────────── */
  function renderBar() {
    const hasComp = state.mode !== "home";
    const f = hasComp && SNL.story(state.storyId);
    const isPage = f && f.comp.kind === "page";
    document.querySelectorAll("#modes button").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.mode === state.mode));
      b.disabled = !hasComp || (isPage && b.dataset.mode === "docs");
    });
    $("#canvas-tools").hidden = state.mode !== "canvas";
    $("#viewports").innerHTML = VIEWPORTS.map((v) =>
      '<button type="button" data-vp="' + v.id + '" aria-pressed="' + (state.vp === v.id || (!VIEWPORTS.some((x) => x.id === state.vp) && v.id === "" && !state.vp)) + '">' + v.label + '</button>').join("") +
      (state.vp && !VIEWPORTS.some((x) => x.id === state.vp) ? '<button type="button" aria-pressed="true" data-vp="' + esc(state.vp) + '">' + esc(state.vp) + '</button>' : "");
    $("#bg").value = state.bg;
    $("#outline").setAttribute("aria-pressed", String(state.outline));
    if (f) $("#open-new").href = canvasUrl(f.id, state.args, state.bg);
  }

  function canvasUrl(id, args, bg, extra) {
    const p = new URLSearchParams({ story: id, v: window.SNL_V || "" });
    if (args && Object.keys(args).length) p.set("args", JSON.stringify(args));
    if (bg) p.set("bg", bg);
    if (extra) Object.keys(extra).forEach((k) => p.set(k, extra[k]));
    return "canvas.html?" + p.toString();
  }

  /* ── Canvas ────────────────────────────────────────────────────── */
  let canvasReady = false, canvasLoaded = null;
  function showCanvas() {
    const f = SNL.story(state.storyId);
    const stage = $("#stage");
    stage.hidden = false; $("#docs").hidden = true;
    $("#app .main").classList.remove("is-docs");
    $("#app .main").classList.toggle("is-page", f.comp.kind === "page");
    const sized = !!state.vp;
    stage.classList.toggle("is-sized", sized);
    $("#frame-wrap").style.width = sized ? state.vp + "px" : "100%";
    $("#size-label").textContent = sized ? state.vp + " px" : "";
    if (canvasReady && canvasLoaded) {
      canvas.contentWindow.postMessage({ source: "sn-manager", type: "update", id: f.id, args: state.args, bg: state.bg, outline: state.outline }, "*");
    } else if (!canvasLoaded) {
      canvasLoaded = f.id;
      canvas.src = canvasUrl(f.id, state.args, state.bg, state.outline ? { outline: "1" } : null);
    }
  }

  /* ── Paneeli ───────────────────────────────────────────────────── */
  function effectiveArgs() {
    const f = SNL.story(state.storyId);
    return Object.assign({}, f.comp.args, f.story.args || {}, state.args);
  }
  function baseArgs() {
    const f = SNL.story(state.storyId);
    return Object.assign({}, f.comp.args, f.story.args || {});
  }
  function visible(def, args) {
    if (!def.if) return true;
    const v = args[def.if.arg];
    if ("eq" in def.if) return v === def.if.eq;
    if ("ne" in def.if) return v !== def.if.ne;
    return !!v;
  }
  function fmtVal(v) {
    if (v === "" || v == null) return "—";
    if (typeof v === "object") return Array.isArray(v) ? "[" + v.length + "]" : "{…}";
    return String(v);
  }

  function controlHtml(key, def, value) {
    const id = "ctl-" + key;
    const labels = def.labels || {};
    switch (def.control) {
      case "boolean":
        return '<label class="switch"><input type="checkbox" id="' + id + '" data-key="' + key + '"' + (value ? " checked" : "") + ' aria-label="' + esc(key) + '"><span></span></label>';
      case "radio":
        return '<div class="radios" role="radiogroup" aria-label="' + esc(key) + '">' + def.options.map((o) =>
          '<label><input type="radio" name="' + id + '" value="' + esc(o) + '" data-key="' + key + '"' + (String(value) === String(o) ? " checked" : "") + '><span>' + esc(labels[o] || o) + '</span></label>').join("") + '</div>';
      case "select":
        return '<select id="' + id + '" data-key="' + key + '">' + def.options.map((o) =>
          '<option value="' + esc(o) + '"' + (String(value) === String(o) ? " selected" : "") + '>' + esc(labels[o] || o) + '</option>').join("") + '</select>';
      case "number":
        return '<input type="number" id="' + id + '" data-key="' + key + '" value="' + esc(value) + '"' +
          (def.min != null ? ' min="' + def.min + '"' : "") + (def.max != null ? ' max="' + def.max + '"' : "") + ' step="' + (def.step || 1) + '">';
      case "textarea":
        return '<textarea id="' + id + '" data-key="' + key + '" rows="3">' + esc(value) + '</textarea>';
      case "json":
        return '<textarea class="json" id="' + id + '" data-key="' + key + '" data-json="1" spellcheck="false">' + esc(JSON.stringify(value, null, 2)) + '</textarea>';
      default:
        return '<input type="text" id="' + id + '" data-key="' + key + '" value="' + esc(value) + '">';
    }
  }

  function renderControls() {
    const f = SNL.story(state.storyId);
    const types = f.comp.argTypes || {};
    const keys = Object.keys(types);
    if (!keys.length) return '<div class="panel__empty">Tällä sivulla ei ole argumentteja.</div>';
    const args = effectiveArgs(), base = baseArgs();
    let lastGroup = null, rows = "";
    keys.forEach((k) => {
      const def = types[k];
      if (!visible(def, args)) return;
      if (def.group && def.group !== lastGroup) { rows += '<tr class="ctrl__group"><td colspan="3">' + esc(def.group) + '</td></tr>'; lastGroup = def.group; }
      const changed = k in state.args && JSON.stringify(state.args[k]) !== JSON.stringify(base[k]);
      rows += '<tr' + (changed ? ' class="is-changed"' : "") + '><td class="ctrl__name"><label for="ctl-' + k + '"><code>' + esc(k) + '</code></label>' +
        (def.desc ? '<div class="desc">' + esc(def.desc) + '</div>' : "") + '</td>' +
        '<td>' + controlHtml(k, def, args[k]) + '</td><td class="ctrl__default" title="Tarinan oletus">' + esc(fmtVal(base[k])) + '</td></tr>';
    });
    return '<table class="ctrl"><thead><tr><th>Nimi</th><th>Kontrolli</th><th>Tarinassa</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function renderActions() {
    if (!state.events.length) return '<div class="panel__empty">Klikkaa komponenttia canvasissa. Tapahtumat (sn:qty, sn:remove, …) ja ruudunlukijalle ilmoitetut tekstit näkyvät tässä. Tapahtumat ovat samat, joita sivut kuuntelevat.</div>';
    return '<div class="log"><div class="log__bar"><span>' + state.events.length + ' tapahtumaa</span><button type="button" class="text-btn" id="clear-log">Tyhjennä</button></div>' +
      state.events.slice().reverse().map((e) => e.event === "announce"
        ? '<div class="log__row log__row--sr"><span class="log__time">' + e.time + '</span><span class="log__type">ruudunlukija</span><span class="log__detail">”' + esc(e.detail.text) + '”</span></div>'
        : '<div class="log__row"><span class="log__time">' + e.time + '</span><span class="log__type">sn:' + esc(e.event) + '</span><span class="log__detail">' + esc(JSON.stringify(e.detail)) + '</span></div>').join("") + '</div>';
  }

  function prettyHtml(html) {
    const VOID = /^(input|img|br|hr|meta|link|source|circle|path|rect)$/i;
    let depth = 0;
    return html.replace(/>\s*</g, ">\n<").split("\n").map((line) => {
      const close = /^<\//.test(line);
      const tag = (line.match(/^<\/?([a-z0-9-]+)/i) || [])[1] || "";
      const selfClose = /\/>$/.test(line) || VOID.test(tag) || /^<([a-z0-9-]+)[^>]*>.*<\/\1>$/i.test(line);
      if (close) depth = Math.max(0, depth - 1);
      const out = "  ".repeat(depth) + line;
      if (!close && !selfClose && /^<[a-z]/i.test(line)) depth++;
      return out;
    }).join("\n");
  }
  function highlight(code) {
    return esc(code)
      .replace(/(&lt;\/?)([a-z0-9-]+)/gi, '$1<span class="tk-tag">$2</span>')
      .replace(/ ([a-z-:]+)=(&quot;.*?&quot;)/gi, ' <span class="tk-attr">$1</span>=<span class="tk-str">$2</span>');
  }
  function argsDiff(comp, args) {
    const out = {};
    Object.keys(args).forEach((k) => { if (JSON.stringify(args[k]) !== JSON.stringify((comp.args || {})[k])) out[k] = args[k]; });
    return out;
  }
  function jsSnippet(comp, args) {
    const diff = argsDiff(comp, args);
    const body = Object.keys(diff).length ? JSON.stringify(diff, null, 2).replace(/"([a-zA-Z_]\w*)":/g, "$1:") : "{}";
    return 'SN.render("' + comp.component + '", ' + body + ');';
  }
  function renderCode() {
    const f = SNL.story(state.storyId);
    const js = jsSnippet(f.comp, effectiveArgs());
    return '<div class="code"><div class="code__head"><span>Sivulla</span><button type="button" class="text-btn" data-copy="js">Kopioi</button></div><pre id="code-js">' + esc(js) + '</pre></div>' +
      '<div class="code"><div class="code__head"><span>Renderöity HTML</span><button type="button" class="text-btn" data-copy="html">Kopioi</button></div><pre id="code-html">' + highlight(prettyHtml(state.rendered || "")) + '</pre></div>';
  }
  function infoHtml(c) {
    const link = (p) => '<a href="../' + esc(p) + '" target="_blank"><code>' + esc(p) + '</code></a>';
    const rows = [
      ["Toteutus", '<code>' + esc(c.block || "—") + '</code> <span class="status status--' + esc(c.status) + '">' + esc(STATUS[c.status] || c.status) + '</span>'],
      c.component && ["Komponentti", '<code>SN.c.' + esc(c.component) + '</code>'],
      c.spec && ["Speksi", link(c.spec)],
      c.sources && ["Lähteet", c.sources.map(link).join(" ")],
      c.usedIn && ["Käytössä", esc(c.usedIn.join(" · "))]
    ].filter(Boolean);
    return '<dl class="info">' + rows.map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join("") + '</dl>' + implHtml(c);
  }
  /* Toteutuskartta (library/implementation.js): taso, koodi, kytkennät, mittaus. */
  function implOf(c) {
    const m = window.SNL_IMPL || {};
    return m[c.id] || (c.group === "Perusta" ? m.perusta : null);
  }
  function tierHtml(t) {
    const d = (window.SNL_TIERS || {})[t];
    return d ? '<span class="tier tier--' + esc(t) + '" title="' + esc(d.desc) + '">' + esc(d.label) + '</span>' : "";
  }
  function implHtml(c) {
    const im = implOf(c);
    if (!im) return "";
    const code = (xs) => xs.map((x) => '<code>' + esc(x) + '</code>').join(" ");
    const rows = [
      ["Taso", tierHtml(im.tier) + ' <span class="impl__desc">' + esc(((window.SNL_TIERS || {})[im.tier] || {}).desc || "") + '</span>'],
      im.where && ["Koodi", code(im.where)],
      im.hooks && ["Kytkentä", code(im.hooks)],
      im.branch && ["Retail-haara", esc(im.branch)],
      im.events && ["Mittaus", '<ul class="impl__events">' + im.events.map((e) => '<li><code>' + esc(e.name) + '</code> ' + esc(e.when) + '</li>').join("") + '</ul>'],
      im.note && ["Huomio", esc(im.note)]
    ].filter(Boolean);
    return '<h3 class="impl__h">Toteutus snellmanecomissa</h3><dl class="info impl">' + rows.map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join("") + '</dl>';
  }
  function implMapHtml() {
    const list = comps.filter((c) => c.kind !== "page" && implOf(c));
    if (!list.length) return "";
    return '<h2>Toteutuskartta</h2><p class="docs__lead">Millä tasolla kukin komponentti toteutetaan ja mitä se mittaa. ' +
      Object.keys(window.SNL_TIERS || {}).map((k) => tierHtml(k) + ' ' + esc(SNL_TIERS[k].desc)).join(" · ") + '</p>' +
      '<div class="impl-map"><table><thead><tr><th>Komponentti</th><th>Taso</th><th>Kytkentä</th><th>Mittaus</th></tr></thead><tbody>' +
      list.map((c) => {
        const im = implOf(c);
        return '<tr><td><a href="#docs=' + esc(c.id) + '">' + esc(c.title) + '</a></td><td>' + tierHtml(im.tier) + '</td><td>' +
          (im.hooks || []).map((h) => '<code>' + esc(h) + '</code>').join(" ") + '</td><td>' +
          (im.events || []).map((e) => '<code>' + esc(e.name) + '</code>').join(" ") + '</td></tr>';
      }).join("") + '</tbody></table></div>';
  }
  function notesHtml(c) {
    return c.notes && c.notes.length ? '<div class="notes"><b>Avoimet ja poikkeamat</b><ul>' + c.notes.map((n) => '<li>' + esc(n) + '</li>').join("") + '</ul></div>' : "";
  }
  function renderInfo() {
    const f = SNL.story(state.storyId);
    return infoHtml(f.comp) + notesHtml(f.comp);
  }

  function renderPanel() {
    document.querySelectorAll("#panel-tabs button").forEach((b) => {
      const on = b.dataset.tab === state.tab;
      b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1;
      if (on) $("#panel-body").setAttribute("aria-labelledby", b.id);
    });
    $("#actions-count").textContent = state.events.length || "";
    const body = $("#panel-body");
    const scroll = body.scrollTop;
    body.innerHTML = state.tab === "controls" ? renderControls() : state.tab === "actions" ? renderActions() : state.tab === "code" ? renderCode() : renderInfo();
    body.scrollTop = scroll;
    $("#reset").hidden = state.tab !== "controls" || !Object.keys(state.args).length;
  }

  /* ── Docs ──────────────────────────────────────────────────────── */
  function renderDocs() {
    const c = SNL.find(state.docsId);
    $("#stage").hidden = true;
    const docs = $("#docs"); docs.hidden = false;
    $("#app .main").classList.add("is-docs");
    const argRows = Object.keys(c.argTypes || {}).map((k) => {
      const d = c.argTypes[k];
      const opts = d.options ? '<div class="opts">' + d.options.map((o) => '<code>' + esc(o === "" ? '""' : o) + '</code>').join("") + '</div>' : '<code>' + esc(d.control) + '</code>';
      return '<tr><td><code><b>' + esc(k) + '</b></code></td><td>' + esc(d.desc || "") + (d.if ? '<div style="color:var(--ui-text-3)">kun <code>' + esc(d.if.arg) + ("eq" in d.if ? " = " + d.if.eq : " ≠ " + d.if.ne) + '</code></div>' : "") + '</td><td>' + opts + '</td><td><code>' + esc(fmtVal(c.args[k])) + '</code></td></tr>';
    }).join("");
    docs.innerHTML = '<div class="docs__inner">' +
      '<div class="docs__eyebrow">' + esc(c.group) + '</div><h1>' + esc(c.title) + '</h1>' +
      '<p class="docs__lead">' + esc(c.description || "") + '</p>' +
      infoHtml(c) + notesHtml(c) +
      '<h2>Tarinat (' + c.stories.length + ')</h2>' +
      c.stories.map((s, i) => {
        const id = c.id + "--" + s.id;
        return '<div class="story"><div class="story__head"><h3>' + esc(s.name) + '</h3><a href="#story=' + id + '">Avaa canvasissa →</a></div>' +
          (s.note ? '<p class="story__note">' + esc(s.note) + '</p>' : "") +
          '<div class="story__frame"><iframe loading="lazy" title="' + esc(c.title + ": " + s.name) + '" data-key="d' + i + '" src="' + canvasUrl(id, null, s.bg, { embed: "1", key: "d" + i }) + '"></iframe>' +
          '<details class="story__code"><summary>Koodi</summary><pre>' + esc(jsSnippet(c, Object.assign({}, c.args, s.args || {}))) + '</pre></details></div></div>';
      }).join("") +
      (argRows ? '<h2>Argumentit</h2><table class="argtable"><thead><tr><th>Nimi</th><th>Kuvaus</th><th>Arvot</th><th>Oletus</th></tr></thead><tbody>' + argRows + '</tbody></table>' : "") +
    '</div>';
    docs.scrollTop = 0;
  }

  /* ── Aloitus ───────────────────────────────────────────────────── */
  function renderHome() {
    $("#stage").hidden = true;
    const docs = $("#docs"); docs.hidden = false;
    $("#app .main").classList.add("is-docs");
    const byGroup = {};
    comps.forEach((c) => (byGroup[c.group] = byGroup[c.group] || []).push(c));
    const total = comps.filter((c) => c.kind !== "page").reduce((n, c) => n + c.stories.length, 0);
    docs.innerHTML = '<div class="docs__inner"><div class="docs__eyebrow">Snellman Retail · B2B</div><h1>Komponenttikirjasto</h1>' +
      '<p class="docs__lead">Jokainen komponentti kaikkine variantteineen ja tiloineen yhdessä paikassa, joten sivuprotojen ei tarvitse näyttää niitä. ' +
      'Samat tiedostot (<code>lib/</code>) renderöivät sekä nämä tarinat että wireframe-sivut. ' + total + ' tarinaa, ' + comps.filter((c) => c.kind !== "page").length + ' komponenttia.</p>' +
      '<div class="home__legend">' + Object.keys(STATUS).map((k) => '<span><span class="status status--' + k + '">' + STATUS[k] + '</span>' +
        { on: "lohko on snellmanecomissa", laajennus: "olemassa oleva lohko laajenee", uusi: "uusi lohko", wireframe: "vain wireframessä" }[k] + '</span>').join("") + '</div>' +
      Object.keys(byGroup).map((g) => '<h2>' + esc(g) + '</h2><div class="home__grid">' + byGroup[g].map((c) => {
        const href = c.kind === "page" ? "#story=" + c.id + "--" + c.stories[0].id : "#docs=" + c.id;
        return '<a class="home__card" href="' + href + '"><b>' + esc(c.title) + ' <span class="status status--' + esc(c.status) + '">' + esc(STATUS[c.status] || "") + '</span></b>' +
          '<span><code>' + esc(c.block || "") + '</code></span><span>' + (c.kind === "page" ? esc(c.description) : c.stories.length + " tarinaa") + '</span></a>';
      }).join("") + '</div>').join("") + implMapHtml() + '</div>';
  }

  /* ── Kokoaminen ────────────────────────────────────────────────── */
  function renderAll() {
    renderTree(); renderBar();
    if (state.mode === "canvas") { showCanvas(); renderPanel(); }
    else if (state.mode === "docs") renderDocs();
    else renderHome();
    const f = state.mode !== "home" && SNL.story(state.storyId);
    document.title = f ? (state.mode === "docs" ? f.comp.title + " · Docs" : f.comp.title + " · " + f.story.name) + " — Snellman Komponentit" : "Snellman Komponentit";
  }

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("is-on"), 1600);
  }
  function setArg(key, value) {
    const base = baseArgs();
    if (JSON.stringify(base[key]) === JSON.stringify(value)) delete state.args[key]; else state.args[key] = value;
    writeHash(true);
    showCanvas(); renderBar();
    /* Päivitä paneeli vain jos ehdolliset kontrollit muuttuvat, jotta fokus säilyy */
    const types = SNL.story(state.storyId).comp.argTypes || {};
    if (Object.values(types).some((d) => d.if && d.if.arg === key)) renderPanel();
    else {
      const row = document.querySelector('[data-key="' + key + '"]');
      const tr = row && row.closest("tr");
      if (tr) tr.classList.toggle("is-changed", key in state.args);
      $("#reset").hidden = !Object.keys(state.args).length;
    }
  }

  /* Canvasissa muutettu määrä päivittyy myös Kontrolleihin ja Koodiin
     (ilman canvasin uudelleenpiirtoa, jotta fokus ja tila säilyvät). */
  function syncArgFromCanvas(event, detail) {
    if (event !== "qty" || state.mode !== "canvas") return;
    const f = SNL.story(state.storyId);
    if (!f || !(f.comp.argTypes || {}).qty) return;
    const base = baseArgs();
    if (Number(base.qty) === detail.qty) delete state.args.qty; else state.args.qty = detail.qty;
    writeHash(true);
    if (state.tab === "controls") {
      const el = document.querySelector('#panel-body [data-key="qty"]');
      if (el) { el.value = detail.qty; const tr = el.closest("tr"); if (tr) tr.classList.toggle("is-changed", "qty" in state.args); }
      $("#reset").hidden = !Object.keys(state.args).length;
    } else if (state.tab === "code") renderPanel();
  }

  /* ── Tapahtumat ────────────────────────────────────────────────── */
  window.addEventListener("hashchange", () => { const prev = state.storyId; readHash(); if (prev !== state.storyId) state.rendered = ""; renderAll(); });
  window.addEventListener("popstate", () => { readHash(); renderAll(); });

  window.addEventListener("message", (e) => {
    const m = e.data; if (!m || m.source !== "sn-canvas") return;
    if (m.embedKey) {
      if (m.type === "height") {
        const fr = document.querySelector('#docs iframe[data-key="' + m.embedKey + '"]');
        if (fr) fr.style.height = Math.max(60, m.height) + "px";
      }
      return;
    }
    if (e.source !== canvas.contentWindow) return;
    if (m.type === "ready") {
      canvasReady = true;
      if (canvasLoaded !== state.storyId || state.mode === "canvas") showCanvas();
    } else if (m.type === "rendered") {
      state.rendered = m.html || "";
      if (state.tab === "code" && state.mode === "canvas") renderPanel();
    } else if (m.type === "event") {
      const d = new Date();
      state.events.push({ event: m.event, detail: m.detail, time: d.toTimeString().slice(0, 8) });
      if (state.events.length > 200) state.events.shift();
      syncArgFromCanvas(m.event, m.detail);
      if (state.mode === "canvas") {
        if (state.tab === "actions") renderPanel(); else $("#actions-count").textContent = state.events.length;
      }
    }
  });

  $("#tree").addEventListener("click", (e) => {
    const g = e.target.closest("[data-group]");
    if (g) { const k = g.dataset.group; state.collapsedGroups.has(k) ? state.collapsedGroups.delete(k) : state.collapsedGroups.add(k); renderTree(); return; }
    const c = e.target.closest("[data-comp]");
    if (c) {
      const id = c.dataset.comp;
      if (state.open.has(id) && state.docsId === id) state.open.delete(id);
      else { state.open.add(id); location.hash = "docs=" + id; }
      renderTree();
    }
  });
  $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); renderTree(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#q").focus(); }
    if (e.key === "Escape" && document.activeElement === $("#q")) { $("#q").value = ""; state.q = ""; renderTree(); }
  });

  $("#modes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]"); if (!b || b.disabled) return;
    const f = SNL.story(state.storyId);
    location.hash = b.dataset.mode === "docs" ? "docs=" + f.comp.id : "story=" + f.id;
  });
  $("#viewports").addEventListener("click", (e) => {
    const b = e.target.closest("[data-vp]"); if (!b) return;
    state.vp = b.dataset.vp; writeHash(true); renderBar(); showCanvas();
  });
  $("#bg").addEventListener("change", (e) => { state.bg = e.target.value; writeHash(true); showCanvas(); });
  $("#outline").addEventListener("click", () => { state.outline = !state.outline; renderBar(); showCanvas(); });
  $("#copy-link").addEventListener("click", () => {
    const b = $("#copy-link"), lab = b.querySelector(".icon-btn__label");
    const done = (ok) => { toast(ok ? "Linkki kopioitu" : "Kopiointi ei onnistunut. Kopioi osoiteriviltä."); if (lab) { lab.textContent = ok ? "Kopioitu" : "Ei onnistunut"; setTimeout(() => { lab.textContent = "Kopioi linkki"; }, 1800); } };
    if (!navigator.clipboard) return done(false);
    navigator.clipboard.writeText(location.href).then(() => done(true), () => done(false));
  });
  $("#toggle-side").addEventListener("click", () => {
    const hidden = $("#app").classList.toggle("is-side-hidden"); saveUi({ side: !hidden });
  });

  $("#panel-tabs").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const tabs = [...document.querySelectorAll("#panel-tabs [role=tab]")];
    let i = tabs.findIndex((b) => b.dataset.tab === state.tab);
    i = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    e.preventDefault(); tabs[i].click(); tabs[i].focus();
  });
  $("#panel-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    state.tab = b.dataset.tab; saveUi({ tab: state.tab });
    if ($("#panel").classList.contains("is-collapsed")) $("#collapse").click();
    renderPanel();
  });
  $("#reset").addEventListener("click", () => { state.args = {}; writeHash(true); showCanvas(); renderPanel(); renderBar(); });
  $("#collapse").addEventListener("click", (e) => {
    const c = $("#panel").classList.toggle("is-collapsed");
    e.currentTarget.setAttribute("aria-expanded", String(!c));
    e.currentTarget.innerHTML = c ? '<span class="ui-ico" style="transform:rotate(180deg)">' + ICON.down + '</span>' : ui("down");
  });

  const panelBody = $("#panel-body");
  function onControl(e) {
    const el = e.target.closest("[data-key]"); if (!el) return;
    const key = el.dataset.key;
    const def = SNL.story(state.storyId).comp.argTypes[key];
    let v;
    if (el.type === "checkbox") v = el.checked;
    else if (el.dataset.json) {
      try { v = JSON.parse(el.value); el.classList.remove("is-invalid"); } catch (err) { el.classList.add("is-invalid"); return; }
    } else if (def.control === "number") { v = el.value === "" ? "" : Number(el.value); }
    else v = el.value;
    setArg(key, v);
  }
  panelBody.addEventListener("input", (e) => { if (e.target.type !== "radio" && e.target.tagName !== "SELECT") onControl(e); });
  panelBody.addEventListener("change", (e) => { if (e.target.type === "radio" || e.target.tagName === "SELECT") onControl(e); });
  panelBody.addEventListener("click", (e) => {
    if (e.target.id === "clear-log") { state.events = []; renderPanel(); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const txt = cp.dataset.copy === "js" ? $("#code-js").textContent : prettyHtml(state.rendered);
      const lbl = cp.textContent;
      const done = (ok) => { toast(ok ? "Kopioitu" : "Kopiointi ei onnistunut"); cp.textContent = ok ? "Kopioitu" : "Ei onnistunut"; setTimeout(() => { cp.textContent = lbl; }, 1600); };
      if (!navigator.clipboard) done(false); else navigator.clipboard.writeText(txt).then(() => done(true), () => done(false));
    }
  });

  /* Paneelin korkeus ja canvasin leveys vetämällä */
  function drag(handle, onMove, onEnd) {
    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault(); handle.setPointerCapture(e.pointerId);
      $("#stage").classList.add("is-dragging");
      const move = (ev) => onMove(ev);
      const up = () => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); $("#stage").classList.remove("is-dragging"); onEnd && onEnd(); };
      handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", up);
    });
  }
  drag($("#panel-resize"), (ev) => {
    const h = Math.min(window.innerHeight - 160, Math.max(120, window.innerHeight - ev.clientY));
    document.documentElement.style.setProperty("--panel-h", h + "px");
  }, () => saveUi({ panelH: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--panel-h"), 10) }));
  drag($("#handle"), (ev) => {
    const r = $("#frame-wrap").getBoundingClientRect();
    const w = Math.max(320, Math.round((ev.clientX - r.left - 6) / 2 * 2 + 0));
    const centred = Math.round((ev.clientX - (r.left + r.width / 2)) * 2 + r.width);
    state.vp = String(Math.max(320, Math.min(2400, centred || w)));
    $("#frame-wrap").style.width = state.vp + "px";
    $("#size-label").textContent = state.vp + " px";
  }, () => { writeHash(true); renderBar(); });

  /* Ikonit työkalupalkkiin */
  $("#toggle-side").innerHTML = ui("menu");
  $("#outline").innerHTML = ui("outline") + '<span class="icon-btn__label">Ääriviivat</span>';
  $("#copy-link").innerHTML = ui("link") + '<span class="icon-btn__label">Kopioi linkki</span>';
  $("#open-new").innerHTML = ui("ext") + '<span class="icon-btn__label">Avaa erikseen</span>';
  $("#collapse").innerHTML = ui("down");

  readHash();
  renderAll();
})();
