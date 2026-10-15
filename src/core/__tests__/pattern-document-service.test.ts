/**
 * Testy jednostkowe serwisu importu i obsługi wzorów PDF z linijką postępu (BR-WZOR-001, DEC-09)
 * Zgodne z TDD (Zasada 10) i NFR-DOST-009 (dostępność).
 */

import {
  validateAndFormatPatternFile,
  calculateNextRulerPosition,
  stepPatternDocumentWithCounter,
  insertPatternDocument,
  getPatternDocument,
  getPatternDocumentForProject,
  updatePatternRuler,
  deletePatternDocument,
  PatternDocument,
} from '../pattern-document-service';
import { createInMemoryDatabase } from '../database';

describe('Pattern Document & PDF Progress Ruler (BR-WZOR-001, DEC-09)', () => {
  describe('validateAndFormatPatternFile', () => {
    it('poprawnie waliduje plik PDF ze wzorem', () => {
      const result = validateAndFormatPatternFile({
        uri: 'file:///path/to/drops_nord_sweater.pdf',
        name: 'drops_nord_sweater.pdf',
        size: 1048576,
        mimeType: 'application/pdf',
      });

      expect(result.valid).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.fileName).toBe('drops_nord_sweater.pdf');
      expect(result.document?.currentPage).toBe(1);
      expect(result.document?.rulerYPercent).toBe(20);
      expect(result.document?.autoStepEnabled).toBe(true);
    });

    it('akceptuje pliki graficzne schematów (PNG, JPG)', () => {
      const result = validateAndFormatPatternFile({
        uri: 'file:///path/to/cable_chart.png',
        name: 'cable_chart.png',
        mimeType: 'image/png',
      });

      expect(result.valid).toBe(true);
      expect(result.document?.fileName).toBe('cable_chart.png');
    });

    it('odrzuca nieobsługiwane formaty plików (np. mp3, zip)', () => {
      const result = validateAndFormatPatternFile({
        uri: 'file:///path/to/music.mp3',
        name: 'music.mp3',
        mimeType: 'audio/mpeg',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Nieobsługiwany format');
    });
  });

  describe('calculateNextRulerPosition', () => {
    it('przesuwa linijkę w dół o zadany krok', () => {
      const { newY, shouldAdvancePage } = calculateNextRulerPosition(20, 5, 'forward');
      expect(newY).toBe(25);
      expect(shouldAdvancePage).toBe(false);
    });

    it('sygnalizuje przejście do kolejnej strony po osiągnięciu dolnego marginesu (> 90%)', () => {
      const { newY, shouldAdvancePage } = calculateNextRulerPosition(88, 5, 'forward');
      expect(shouldAdvancePage).toBe(true);
      expect(newY).toBe(15); // powrót na górę nowej strony
    });

    it('cofa linijkę w górę bez wyjścia poza górny margines', () => {
      const { newY } = calculateNextRulerPosition(12, 5, 'backward');
      expect(newY).toBe(7);

      const atTop = calculateNextRulerPosition(6, 10, 'backward');
      expect(atTop.newY).toBe(5); // minimalna bezpieczna pozycja
    });
  });

  describe('stepPatternDocumentWithCounter', () => {
    const baseDoc: PatternDocument = {
      id: 'doc_1',
      projectId: 'proj_1',
      fileName: 'sweter.pdf',
      fileUri: 'file:///sweter.pdf',
      currentPage: 1,
      totalPages: 4,
      rulerYPercent: 30,
      rulerHeightPercent: 6,
      autoStepEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('automatycznie przesuwa linijkę przy kroku licznika, gdy autoStep jest włączony', () => {
      const updated = stepPatternDocumentWithCounter(baseDoc, 1);
      expect(updated.rulerYPercent).toBeGreaterThan(baseDoc.rulerYPercent);
    });

    it('nie zmienia pozycji linijki, gdy autoStep jest wyłączony', () => {
      const disabledDoc = { ...baseDoc, autoStepEnabled: false };
      const updated = stepPatternDocumentWithCounter(disabledDoc, 1);
      expect(updated.rulerYPercent).toBe(baseDoc.rulerYPercent);
    });

    it('zmienia stronę na kolejną, gdy linijka osiąga dół strony', () => {
      const nearBottom = { ...baseDoc, rulerYPercent: 89, currentPage: 1, totalPages: 3 };
      const updated = stepPatternDocumentWithCounter(nearBottom, 1);
      expect(updated.currentPage).toBe(2);
      expect(updated.rulerYPercent).toBe(15);
    });
  });

  describe('Database Persistence', () => {
    it('zapisuje, odczytuje, aktualizuje pozycję linijki i usuwa wzór w SQLite', async () => {
      const db = createInMemoryDatabase();

      const doc: PatternDocument = {
        id: 'doc_test_1',
        projectId: 'proj_test_1',
        fileName: 'wzor_czapka.pdf',
        fileUri: 'file:///wzor_czapka.pdf',
        fileSize: 524288,
        currentPage: 1,
        totalPages: 2,
        rulerYPercent: 25.0,
        rulerHeightPercent: 6.0,
        autoStepEnabled: true,
        notes: 'Wzór z Ravelry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Zapis
      await insertPatternDocument(db, doc);

      // 2. Odczyt po ID
      const fetchedById = await getPatternDocument(db, 'doc_test_1');
      expect(fetchedById).not.toBeNull();
      expect(fetchedById?.fileName).toBe('wzor_czapka.pdf');
      expect(fetchedById?.rulerYPercent).toBe(25.0);

      // 3. Odczyt po ID projektu
      const fetchedByProj = await getPatternDocumentForProject(db, 'proj_test_1');
      expect(fetchedByProj?.id).toBe('doc_test_1');

      // 4. Aktualizacja pozycji linijki i strony
      await updatePatternRuler(db, 'doc_test_1', 40.5, 2);
      const updated = await getPatternDocument(db, 'doc_test_1');
      expect(updated?.rulerYPercent).toBe(40.5);
      expect(updated?.currentPage).toBe(2);

      // 5. Usunięcie
      await deletePatternDocument(db, 'doc_test_1');
      const deleted = await getPatternDocument(db, 'doc_test_1');
      expect(deleted).toBeNull();
    });
  });
});
