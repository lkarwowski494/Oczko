/**
 * Oczko Core — Testy Różnicowe i Weryfikacja Niezależnego Korpusu (Differential Testing)
 * Sprawdza zgodność implementacji TypeScript z niezależnymi obliczeniami referencyjnymi wygenerowanymi w Pythonie.
 * Zgodne ze standardem repozytorium organizer (scripts/gen-gauge-corpus.py).
 */

import corpus from './fixtures/gauge-corpus.json';
import { calculateTargetStitchesAndRows } from '../gauge-calculator';
import { calculateYarnGrist } from '../yarn-usage-estimator';

describe('Niezależny Korpus Referencyjny (Differential Testing / Python Cross-Validation)', () => {
  describe('Próbki dziewiarskie (Gauge Calculations)', () => {
    it('generuje dokładnie te same wartości oczek i rzędów co referencyjny algorytm Pythona', () => {
      expect(corpus.gaugeCases.length).toBeGreaterThan(0);

      for (const item of corpus.gaugeCases) {
        const actual = calculateTargetStitchesAndRows(item.swatch as any, item.target as any);

        expect(actual.targetStitches).toBe(item.expected.targetStitches);
        expect(actual.targetRows).toBe(item.expected.targetRows);
        expect(actual.unit).toBe(item.expected.unit);
        expect(actual.stitchesPerUnit).toBeCloseTo(item.expected.stitchesPerUnit, 2);
        expect(actual.rowsPerUnit).toBeCloseTo(item.expected.rowsPerUnit, 2);
      }
    });
  });

  describe('Grist włóczek (Yarn Grist & Metrics)', () => {
    it('obliczenia metrażu na 100g i gramów na metr są w 100% zgodne z korpusem Pythona', () => {
      expect(corpus.gristCases.length).toBeGreaterThan(0);

      for (const item of corpus.gristCases) {
        const actual = calculateYarnGrist(item.weightGrams, item.lengthMeters);

        expect(actual.metersPer100g).toBeCloseTo(item.expected.metersPer100g, 2);
        expect(actual.metersPerGram).toBeCloseTo(item.expected.metersPerGram, 3);
      }
    });
  });

  describe('Kontrasty WCAG 2.2 dla palety Oczko', () => {
    it('główny tekst spełnia wyśrubowane kryteria WCAG AAA (kontrast >= 7.0:1)', () => {
      const textMainCase = corpus.contrastCases.find(
        (c: any) => c.fgName === 'text_main' && c.bgName === 'bg_light'
      );
      expect(textMainCase).toBeDefined();
      expect(textMainCase?.wcagAaaPassed).toBe(true);
      expect(textMainCase?.ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('interfejs Apple Watch spełnia maksymalny możliwy kontrast (biel na czerni = 21:1)', () => {
      const watchCase = corpus.contrastCases.find(
        (c: any) => c.fgName === 'watch_text' && c.bgName === 'watch_bg'
      );
      expect(watchCase).toBeDefined();
      expect(watchCase?.ratio).toBe(21.0);
      expect(watchCase?.wcagAaaPassed).toBe(true);
    });
  });
});
