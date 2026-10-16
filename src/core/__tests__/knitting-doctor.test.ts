import {
  DOCTOR_PROCEDURES,
  diagnoseEmergency,
  getProcedureById,
  listAllProcedures,
} from '../knitting-doctor';

describe('Knitting Doctor Service (BR-BIB-010..015)', () => {
  it('contains all 6 fundamental emergency rescue procedures', () => {
    expect(DOCTOR_PROCEDURES).toHaveLength(6);
    const ids = DOCTOR_PROCEDURES.map((p) => p.id);
    expect(ids).toContain('dropped_stitch');
    expect(ids).toContain('twisted_stitch');
    expect(ids).toContain('accidental_yarnover');
    expect(ids).toContain('tink_unknitting');
    expect(ids).toContain('lifeline_insertion');
    expect(ids).toContain('crochet_escaped_loop');
  });

  it('each procedure has valid title, steps, tools, and non-empty symptoms', () => {
    for (const proc of DOCTOR_PROCEDURES) {
      expect(proc.title.length).toBeGreaterThan(0);
      expect(proc.summary.length).toBeGreaterThan(0);
      expect(proc.steps.length).toBeGreaterThanOrEqual(3);
      expect(proc.toolsNeeded.length).toBeGreaterThanOrEqual(1);
      expect(proc.symptoms.length).toBeGreaterThanOrEqual(1);
      expect(proc.preventionTip.length).toBeGreaterThan(0);
      expect(['critical', 'moderate', 'low']).toContain(proc.dangerLevel);
      expect(['knitting', 'crochet', 'both']).toContain(proc.craftType);

      // Sprawdzenie kolejności kroków
      proc.steps.forEach((step, idx) => {
        expect(step.stepNumber).toBe(idx + 1);
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.instruction.length).toBeGreaterThan(0);
      });
    }
  });

  it('retrieves procedure by ID correctly', () => {
    const dropped = getProcedureById('dropped_stitch');
    expect(dropped).toBeDefined();
    expect(dropped?.title).toContain('Spuszczone oczko');

    const unknown = getProcedureById('unknown_id' as any);
    expect(unknown).toBeUndefined();
  });

  it('lists procedures filtered by craft discipline', () => {
    const all = listAllProcedures();
    expect(all).toHaveLength(6);

    const both = listAllProcedures('both');
    expect(both).toHaveLength(6);

    const knittingOnly = listAllProcedures('knitting');
    expect(knittingOnly.length).toBeGreaterThan(0);
    expect(knittingOnly.every((p) => p.craftType === 'knitting' || p.craftType === 'both')).toBe(true);

    const crochetOnly = listAllProcedures('crochet');
    expect(crochetOnly.length).toBeGreaterThan(0);
    expect(crochetOnly.every((p) => p.craftType === 'crochet' || p.craftType === 'both')).toBe(true);
  });

  it('diagnoses emergency by keyword, symptom and discipline', () => {
    // 1. Puste zapytanie zwraca wszystkie pasujące do dyscypliny
    const emptyQuery = diagnoseEmergency('');
    expect(emptyQuery).toHaveLength(6);

    // 2. Zapytanie dopasowane do objawu
    const symptomMatch = diagnoseEmergency('drabinka');
    expect(symptomMatch).toHaveLength(1);
    expect(symptomMatch[0].id).toBe('dropped_stitch');

    // 3. Zapytanie dopasowane do tytułu
    const titleMatch = diagnoseEmergency('Tink');
    expect(titleMatch).toHaveLength(1);
    expect(titleMatch[0].id).toBe('tink_unknitting');

    // 4. Zapytanie dopasowane do podsumowania
    const summaryMatch = diagnoseEmergency('polisa ubezpieczeniowa');
    expect(summaryMatch).toHaveLength(1);
    expect(summaryMatch[0].id).toBe('lifeline_insertion');

    // 5. Filtrowanie z jednoczesnym ograniczeniem techniki (craftType)
    const crochetQuery = diagnoseEmergency('pętla', 'crochet');
    expect(crochetQuery).toHaveLength(1);
    expect(crochetQuery[0].id).toBe('crochet_escaped_loop');

    // 6. Niedopasowana dyscyplina
    const mismatchDiscipline = diagnoseEmergency('drabinka', 'crochet');
    expect(mismatchDiscipline).toHaveLength(0);

    // 7. Brak wyników dla nieistniejącego problemu
    const none = diagnoseEmergency('promieniowanie kosmiczne');
    expect(none).toHaveLength(0);
  });
});
