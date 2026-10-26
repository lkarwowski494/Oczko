// Cel widget (@bacons/apple-targets 5.0.0, ADR-0007): Live Activity sesji z +1/−1 z ekranu blokady (F-11, F-21; ADR-0008).
// Kolory = tokeny kolor.jasny / kolor.ciemny z docs/design/tokeny.json (zasada 15: wygląd tylko z systemu 04); czytane z pliku, nie przepisane.
const tokeny = require('../../docs/design/tokeny.json');
const kolor = (n) => ({ light: tokeny.kolor.jasny[n], dark: tokeny.kolor.ciemny[n] });
const czarny = (n) => ({ light: tokeny.kolor.systemCzarny[n], dark: tokeny.kolor.systemCzarny[n] }); // rozwinięta Dynamic Island: tło zawsze czarne

/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'OczkoWidget',
  displayName: 'Oczko',
  bundleIdentifier: '.widget',
  deploymentTarget: '18.0', // ADR-0006
  frameworks: ['SwiftUI', 'WidgetKit', 'ActivityKit', 'AppIntents'],
  colors: {
    $accent: kolor('grafit'),
    papier: kolor('papier'),
    grafit: kolor('grafit'),
    olowek: kolor('olowek'),
    przyciskTlo: kolor('przyciskTlo'),
    przyciskTekst: kolor('przyciskTekst'),
    zakreslacz: kolor('zakreslacz'), // pas przypomnienia (RD-13, P-158)
    tekstNaZakreslaczu: kolor('tekstNaZakreslaczu'),
    zakreslaczKrawedz: kolor('zakreslaczKrawedz'),
    wyspazakreslacz: czarny('zakreslacz'),
    wyspatekstNaZakreslaczu: czarny('tekstNaZakreslaczu'),
    wyspazakreslaczKrawedz: czarny('zakreslaczKrawedz'),
  },
};
