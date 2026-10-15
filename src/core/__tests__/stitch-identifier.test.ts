/**
 * Oczko Core — Testy klucza identyfikacji ściegu „Co widzisz?” (DEC-16)
 */

import {
  getQuestionByStep,
  identifyStitch,
  STITCH_IDENTIFIER_QUESTIONS,
  STITCH_CATALOG,
} from '../stitch-identifier';

describe('Klucz Identyfikacji Ściegu — stitch-identifier (DEC-16)', () => {
  test('Pobieranie pytań po numerze kroku i obsługa zakresów brzegowych', () => {
    expect(getQuestionByStep(0)).toBe(STITCH_IDENTIFIER_QUESTIONS[0]);
    expect(getQuestionByStep(1)).toBe(STITCH_IDENTIFIER_QUESTIONS[1]);
    expect(getQuestionByStep(2)).toBe(STITCH_IDENTIFIER_QUESTIONS[2]);

    expect(getQuestionByStep(-1)).toBeNull();
    expect(getQuestionByStep(3)).toBeNull();
    expect(getQuestionByStep(100)).toBeNull();
  });

  test('Identyfikuje splot szydełkowy', () => {
    const result = identifyStitch({ surface_texture: 'crochet_knots' });
    expect(result.id).toBe('crochet_basic');
    expect(result.craftType).toBe('crochet');
    expect(result.glossaryTermQuery).toBe('słupek');
  });

  test('Identyfikuje ażur z dziurkami (narzuty i otwory)', () => {
    const resHoles = identifyStitch({ surface_texture: 'holes' });
    expect(resHoles.id).toBe('lace_eyelet');
    expect(resHoles.trainerExerciseId).toBe('ex_lace_eyelet');

    const resAiry = identifyStitch({ surface_texture: 'v_columns', edge_and_stretch: 'airy_lace' });
    expect(resAiry.id).toBe('lace_eyelet');
  });

  test('Identyfikuje warkocze dziewiarskie', () => {
    const resCables = identifyStitch({ surface_texture: 'cables' });
    expect(resCables.id).toBe('cable_c6f');
    expect(resCables.trainerExerciseId).toBe('ex_cable_c6f');

    const resBg = identifyStitch({ surface_texture: 'unknown', reversibility: 'flat_background' });
    expect(resBg.id).toBe('cable_c6f');
  });

  test('Identyfikuje ściągacz elastyczny', () => {
    const resRibs = identifyStitch({ surface_texture: 'ribs' });
    expect(resRibs.id).toBe('ribbing');
    expect(resRibs.trainerExerciseId).toBe('ex_ribbing_2x2');

    const resElastic = identifyStitch({ surface_texture: 'v_columns', edge_and_stretch: 'elastic_accordion' });
    expect(resElastic.id).toBe('ribbing');
  });

  test('Identyfikuje ścieg ryżowy / perłowy', () => {
    const resSeed = identifyStitch({
      surface_texture: 'grains',
      reversibility: 'identical',
      edge_and_stretch: 'lays_flat',
    });
    expect(resSeed.id).toBe('seed_stitch');
    expect(resSeed.trainerExerciseId).toBe('ex_moss_stitch');

    // ziarnisty fallback
    const resFallback = identifyStitch({
      surface_texture: 'grains',
      reversibility: 'different_ridges',
      edge_and_stretch: 'curls',
    });
    expect(resFallback.id).toBe('seed_stitch');
  });

  test('Identyfikuje ścieg francuski (fale po obu stronach)', () => {
    const resGarter = identifyStitch({
      surface_texture: 'ridges',
      reversibility: 'identical',
      edge_and_stretch: 'lays_flat',
    });
    expect(resGarter.id).toBe('garter');

    const resGarterByEdges = identifyStitch({
      surface_texture: 'unknown',
      reversibility: 'identical',
      edge_and_stretch: 'lays_flat',
    });
    expect(resGarterByEdges.id).toBe('garter');
  });

  test('Identyfikuje dżersej odwrócony (lewy z przodu, prawy z tyłu)', () => {
    const resRev = identifyStitch({
      surface_texture: 'ridges',
      reversibility: 'different_v',
      edge_and_stretch: 'curls',
    });
    expect(resRev.id).toBe('reverse_stockinette');
  });

  test('Identyfikuje klasyczny dżersej (ścieg gładki prawy)', () => {
    const resStock = identifyStitch({
      surface_texture: 'v_columns',
      reversibility: 'different_ridges',
      edge_and_stretch: 'curls',
    });
    expect(resStock.id).toBe('stockinette');
    expect(resStock.curlingAdvice).toBeDefined();
  });

  test('Domyślny fallback prowadzi do dżerseju', () => {
    const fallback = identifyStitch({});
    expect(fallback.id).toBe('stockinette');
  });

  test('Wszystkie profile w STITCH_CATALOG posiadają kompletne metadane', () => {
    const profiles = Object.values(STITCH_CATALOG);
    expect(profiles.length).toBeGreaterThanOrEqual(8);

    for (const p of profiles) {
      expect(p.namePl.length).toBeGreaterThan(0);
      expect(p.nameEn.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.rowCountingTip.length).toBeGreaterThan(0);
      expect(['knitting', 'crochet']).toContain(p.craftType);
    }
  });
});
