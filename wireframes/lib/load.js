/* =================================================================
 * Kirjaston lataus sivulle, välimuistin ohi.
 *
 *   <script src="lib/load.js" data-with="forms account data/products"></script>
 *
 * Laitetaan <head>iin sivun omien tyylien EDELLE. Kirjoittaa tokens.css:n,
 * components.css:n, core.js:n ja perusosat (basics, product, shell) sekä
 * data-with-listan lisäosat (forms, account) versiokyselyllä ?v=<aika>, joten
 * kirjastomuutos näkyy heti ilman kovaa uudelleenlatausta — myös GitHub
 * Pagesissa. Järjestys säilyy (document.write jäsennyksen aikana), joten
 * sivun omat skriptit voivat käyttää SN:ää kuten ennenkin.
 * ================================================================= */
(function () {
  var me = document.currentScript;
  var base = me.src.replace(/lib\/load\.js(\?.*)?$/, "");
  var v = "?v=" + Date.now();
  var extra = (me.getAttribute("data-with") || "").split(/\s+/).filter(Boolean);
  var css = ["lib/tokens.css", "lib/components.css"];
  /* Lisäosa ilman kauttaviivaa = komponentti (forms → lib/components/forms.js),
     kauttaviivalla polku lib/-kansiosta (data/products → lib/data/products.js). */
  var js = ["lib/core.js", "lib/components/basics.js", "lib/components/product.js", "lib/components/shell.js"]
    .concat(extra.map(function (x) { return "lib/" + (x.indexOf("/") < 0 ? "components/" : "") + x + ".js"; }));
  document.write(
    css.map(function (h) { return '<link rel="stylesheet" href="' + base + h + v + '">'; }).join("") +
    js.map(function (s) { return '<script src="' + base + s + v + '"><\/script>'; }).join("")
  );
})();
