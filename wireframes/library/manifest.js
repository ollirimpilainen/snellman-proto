/* Komponenttikirjaston tiedostolista. Uusi komponentti:
   1. lib/components/<nimi>.js  (SN.register)
   2. library/stories/<nimi>.stories.js  (SNL.add)
   3. lisää molemmat tänne. */
window.SNL_MANIFEST = {
  lib: [
    "../lib/core.js",
    "../lib/components/basics.js",
    "../lib/components/product.js",
    "../lib/components/shell.js",
    "../lib/components/forms.js",
    "../lib/components/account.js",
    "../lib/components/home.js",
    "../lib/data/products.js",
    "foundations.js"
  ],
  stories: [
    "implementation.js",
    "stories/foundations.stories.js",
    "stories/basics.stories.js",
    "stories/product.stories.js",
    "stories/shell.stories.js",
    "stories/forms.stories.js",
    "stories/account.stories.js",
    "stories/home.stories.js"
  ]
};

/* Lataa skriptit järjestyksessä (ei buildia, toimii python http.serverillä). */
window.SNL_load = function (list) {
  return list.reduce((p, src) => p.then(() => new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = src + (src.includes("?") ? "&" : "?") + "v=" + (window.SNL_V || (window.SNL_V = Date.now())); s.onload = ok; s.onerror = () => fail(new Error("Ei latautunut: " + src));
    document.head.appendChild(s);
  })), Promise.resolve());
};

/* Story-rekisteri — sama molemmissa ikkunoissa. */
window.SNL = window.SNL || {
  components: [],
  add(def) { this.components.push(def); return def; },
  find(id) { return this.components.find((c) => c.id === id); },
  story(fullId) {
    const [cid, sid] = String(fullId || "").split("--");
    const comp = this.find(cid); if (!comp) return null;
    const story = comp.stories.find((s) => s.id === sid) || comp.stories[0];
    return { comp, story, id: comp.id + "--" + story.id };
  }
};
