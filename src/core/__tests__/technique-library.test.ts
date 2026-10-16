import {
  TECHNIQUE_CARDS,
  getAllTechniqueCards,
  getTechniqueCardById,
  filterTechniqueCards,
  getTechniqueSteps,
  countTechniquesByDiscipline,
  TechniqueCard,
} from '../technique-library';

describe('Moduł 16: Biblioteka Technik i Karty Rzemieślnicze (Technique Library)', () => {
  test('rejestr zawiera dokładnie 21 kart technik zgodnie z DEC-20 (12 drutowych, 9 szydełkowych)', () => {
    const counts = countTechniquesByDiscipline();
    expect(counts.total).toBe(21);
    expect(counts.knitting).toBe(12);
    expect(counts.crochet).toBe(9);
    expect(TECHNIQUE_CARDS.length).toBe(21);
  });

  test('każda karta posiada kompletne metadane, unikalne ID oraz rzetelne instrukcje dla prawo- i leworęcznych (DEC-19)', () => {
    const ids = new Set<string>();

    TECHNIQUE_CARDS.forEach((card: TechniqueCard) => {
      expect(ids.has(card.id)).toBe(false);
      ids.add(card.id);

      expect(card.titlePl.length).toBeGreaterThan(0);
      expect(card.titleEn.length).toBeGreaterThan(0);
      expect(card.abbreviation.length).toBeGreaterThan(0);
      expect(card.summary.length).toBeGreaterThan(10);
      expect(card.proTip.length).toBeGreaterThan(10);
      expect(card.commonMistakes.length).toBeGreaterThan(0);

      // Instrukcje dla praworęcznych
      expect(card.rightHandedSteps.length).toBeGreaterThanOrEqual(3);
      card.rightHandedSteps.forEach((s, idx) => {
        expect(s.stepNumber).toBe(idx + 1);
        expect(s.instruction.length).toBeGreaterThan(5);
      });

      // Instrukcje dla leworęcznych (DEC-19)
      expect(card.leftHandedSteps.length).toBeGreaterThanOrEqual(3);
      card.leftHandedSteps.forEach((s, idx) => {
        expect(s.stepNumber).toBe(idx + 1);
        expect(s.instruction.length).toBeGreaterThan(5);
      });

      // Schemat wektorowy rysowany kodem (DEC-13)
      expect(card.visualSchema).toBeDefined();
      expect(card.visualSchema.primaryShape).toBeDefined();
      expect(card.visualSchema.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(card.visualSchema.yarnPath.length).toBeGreaterThan(0);
    });
  });

  test('getAllTechniqueCards zwraca kopię tablicy wszystkich kart', () => {
    const all = getAllTechniqueCards();
    expect(all.length).toBe(21);
    expect(all).toEqual(TECHNIQUE_CARDS);
    expect(all).not.toBe(TECHNIQUE_CARDS);
  });

  test('getTechniqueCardById wyszukuje poprawnie istniejące oraz nieistniejące ID', () => {
    const knitCard = getTechniqueCardById('knit_stitch');
    expect(knitCard).toBeDefined();
    expect(knitCard?.titlePl).toBe('Oczko prawe');

    const chainCard = getTechniqueCardById('slip_knot_and_chain');
    expect(chainCard).toBeDefined();
    expect(chainCard?.discipline).toBe('crochet');

    expect(getTechniqueCardById('unknown_technique_id')).toBeUndefined();
    expect(getTechniqueCardById('')).toBeUndefined();
  });

  test('filterTechniqueCards filtruje poprawnie bez opcji oraz z opcjami all', () => {
    const defaultList = filterTechniqueCards();
    expect(defaultList.length).toBe(21);

    const allList = filterTechniqueCards({ discipline: 'all', level: 'all', query: '' });
    expect(allList.length).toBe(21);
  });

  test('filterTechniqueCards filtruje poprawnie po dyscyplinie (knitting / crochet)', () => {
    const knittingOnly = filterTechniqueCards({ discipline: 'knitting' });
    expect(knittingOnly.length).toBe(12);
    expect(knittingOnly.every((c) => c.discipline === 'knitting')).toBe(true);

    const crochetOnly = filterTechniqueCards({ discipline: 'crochet' });
    expect(crochetOnly.length).toBe(9);
    expect(crochetOnly.every((c) => c.discipline === 'crochet')).toBe(true);
  });

  test('filterTechniqueCards filtruje poprawnie po poziomie zaawansowania', () => {
    const beginners = filterTechniqueCards({ level: 'beginner' });
    expect(beginners.length).toBeGreaterThan(0);
    expect(beginners.every((c) => c.level === 'beginner')).toBe(true);

    const advanced = filterTechniqueCards({ level: 'advanced' });
    expect(advanced.length).toBeGreaterThan(0);
    expect(advanced.every((c) => c.level === 'advanced')).toBe(true);
  });

  test('filterTechniqueCards wyszukuje po tytule PL, EN, skrócie i opisie', () => {
    const k2togMatches = filterTechniqueCards({ query: 'k2tog' });
    expect(k2togMatches.length).toBeGreaterThanOrEqual(1);
    expect(k2togMatches.some((c) => c.id === 'k2tog')).toBe(true);

    const gsrMatches = filterTechniqueCards({ query: 'skrócone' });
    expect(gsrMatches.length).toBeGreaterThanOrEqual(1);

    const crochetMatches = filterTechniqueCards({ query: 'Treble' });
    expect(crochetMatches.length).toBeGreaterThanOrEqual(1);

    const nonExistent = filterTechniqueCards({ query: 'nieistniejące-hasło-xyz' });
    expect(nonExistent.length).toBe(0);
  });

  test('getTechniqueSteps zwraca właściwy zestaw kroków w zależności od ręczności', () => {
    const card = getTechniqueCardById('long_tail_cast_on')!;

    const rightSteps = getTechniqueSteps(card, 'right');
    expect(rightSteps).toEqual(card.rightHandedSteps);
    expect(rightSteps[0].instruction).toContain('prawym drucie');

    const leftSteps = getTechniqueSteps(card, 'left');
    expect(leftSteps).toEqual(card.leftHandedSteps);
    expect(leftSteps[0].instruction).toContain('lewym drucie');
  });
});
