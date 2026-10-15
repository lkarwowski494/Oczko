/**
 * Oczko Core — Testy bazy wiedzy dziewiarskiej (DEC-17, DEC-18, DEC-24)
 */

import {
  KNITTING_GLOSSARY,
  getGlossaryByCategory,
  searchGlossary,
} from '../glossary-data';

describe('Oczko Core — Baza terminologii dziewiarskiej (DEC-17, DEC-18)', () => {
  test('Baza zawiera co najmniej 40 zweryfikowanych haseł dziewiarskich i szydełkowych', () => {
    expect(KNITTING_GLOSSARY.length).toBeGreaterThanOrEqual(40);
  });

  test('Każde hasło posiada skróty PL i EN, opis oraz kategorię', () => {
    for (const term of KNITTING_GLOSSARY) {
      expect(term.id).toBeDefined();
      expect(term.abbreviationPL).toBeTruthy();
      expect(term.abbreviationEN).toBeTruthy();
      expect(term.namePL).toBeTruthy();
      expect(term.nameEN).toBeTruthy();
      expect(term.description.length).toBeGreaterThan(10);
      expect(['basic', 'decrease', 'increase', 'cable', 'short_rows', 'crochet']).toContain(term.category);
    }
  });

  test('Wyszukiwarka znajduje hasła po skrócie PL, EN oraz nazwie', () => {
    const k2togResults = searchGlossary('k2tog');
    expect(k2togResults.length).toBeGreaterThanOrEqual(1);
    expect(k2togResults[0].abbreviationEN.toLowerCase()).toContain('k2tog');

    const opResults = searchGlossary('o.p.');
    expect(opResults.length).toBeGreaterThanOrEqual(1);
    expect(opResults[0].abbreviationPL).toContain('o.p.');

    const warkoczResults = searchGlossary('warkocz');
    expect(warkoczResults.length).toBeGreaterThanOrEqual(1);
  });

  test('Filtrowanie według kategorii działa bezbłędnie', () => {
    const decreases = getGlossaryByCategory('decrease');
    expect(decreases.length).toBeGreaterThanOrEqual(4);
    for (const d of decreases) {
      expect(d.category).toBe('decrease');
    }
  });
});
