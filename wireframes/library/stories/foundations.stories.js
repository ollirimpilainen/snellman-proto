/* Perusta: tokenit dokumentaationa */
[
  ["varit", "Värit", "fdColors", "Preset-kerroksen värit ja niiden kontrasti."],
  ["typografia", "Typografia", "fdType", "Taberna Serif + TheSansB."],
  ["valistys", "Välistys ja muodot", "fdSpacing", "GDS-skaala, kulmat, varjo, layout."],
  ["ikonit", "Ikonit", "fdIcons", "Font Awesome Pro 6 Light, Snellmanin kitti."]
].forEach(([id, title, component, description]) => SNL.add({
  id, title, group: "Perusta", component, description,
  kind: "page", block: "lib/tokens.css", status: "on", sources: ["../lib/tokens.css"],
  args: {}, argTypes: {},
  stories: [{ id: "sivu", name: title }]
}));
