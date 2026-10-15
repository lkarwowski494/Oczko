/**
 * Oczko Core — Testy silnika trenażera powtórzeń wzorów (DEC-17)
 */

import {
  TRAINER_EXERCISES,
  PatternTrainerEngine,
} from '../pattern-trainer';

describe('Oczko Core — Trenażer powtórzeń wzorów (DEC-17)', () => {
  test('Dostępne są 4 wzorcowe ćwiczenia w MVP', () => {
    expect(TRAINER_EXERCISES.length).toBe(4);
    const names = TRAINER_EXERCISES.map((e) => e.name);
    expect(names.some((n) => n.includes('Ściągacz'))).toBe(true);
    expect(names.some((n) => n.includes('ryżowy'))).toBe(true);
    expect(names.some((n) => n.includes('Warkocz'))).toBe(true);
    expect(names.some((n) => n.includes('Ażur') || n.includes('Dziurki'))).toBe(true);
  });

  test('Trenażer krok po kroku przesuwa wskaźnik sekwencji i nalicza powtórzenia', () => {
    // Ćwiczenie: Ściągacz 2x2 ([2 o.p., 2 o.l.] x 4)
    const exercise = TRAINER_EXERCISES.find((e) => e.id === 'ex_ribbing_2x2')!;
    expect(exercise).toBeDefined();

    const trainer = new PatternTrainerEngine(exercise);
    const initial = trainer.getState();
    expect(initial.currentRowNumber).toBe(1);
    expect(initial.currentStepIndex).toBe(0);
    expect(initial.currentRepeatNumber).toBe(1);
    expect(initial.currentInstruction.code).toBe('2 o.p.');

    // Krok 1: zaliczono 2 o.p. -> przejście do 2 o.l.
    trainer.nextStep();
    let s = trainer.getState();
    expect(s.currentStepIndex).toBe(1);
    expect(s.currentInstruction.code).toBe('2 o.l.');
    expect(s.currentRepeatNumber).toBe(1);

    // Krok 2: zaliczono 2 o.l. -> koniec pierwszego powtórzenia -> drugie powtórzenie, powrót do 2 o.p.
    trainer.nextStep();
    s = trainer.getState();
    expect(s.currentStepIndex).toBe(0);
    expect(s.currentInstruction.code).toBe('2 o.p.');
    expect(s.currentRepeatNumber).toBe(2);
  });

  test('Trenażer poprawnie kończy rząd i zgłasza ukończenie ćwiczenia', () => {
    const exercise = TRAINER_EXERCISES.find((e) => e.id === 'ex_ribbing_2x2')!;
    const trainer = new PatternTrainerEngine(exercise);

    // Wykonanie wszystkich 4 powtórzeń (każde ma 2 kroki -> 8 kroków)
    for (let i = 0; i < 8; i++) {
      expect(trainer.getState().isCompleted).toBe(false);
      trainer.nextStep();
    }

    const state = trainer.getState();
    expect(state.isCompleted).toBe(true);
  });

  test('Resetowanie ćwiczenia przywraca stan początkowy', () => {
    const exercise = TRAINER_EXERCISES.find((e) => e.id === 'ex_ribbing_2x2')!;
    const trainer = new PatternTrainerEngine(exercise);
    trainer.nextStep();
    trainer.nextStep();
    trainer.reset();

    const s = trainer.getState();
    expect(s.currentStepIndex).toBe(0);
    expect(s.currentRepeatNumber).toBe(1);
    expect(s.isCompleted).toBe(false);
  });

  test('Trenażer przechodzi do kolejnego rzędu w ćwiczeniu wielorzędowym', () => {
    const multiRowExercise: any = {
      id: 'ex_multi',
      name: 'Wielorzędowe',
      description: 'Ćwiczenie wielorzędowe',
      category: 'ribbing',
      totalStitches: 10,
      craftType: 'knitting' as const,
      difficulty: 'początkujący' as const,
      rows: [
        {
          rowNumber: 1,
          side: 'RS' as const,
          repeats: {
            repeatCount: 1,
            steps: [{ code: '1 o.p.', label: 'Oczko prawe' }],
          },
        },
        {
          rowNumber: 2,
          side: 'WS' as const,
          repeats: {
            repeatCount: 1,
            steps: [{ code: '1 o.l.', label: 'Oczko lewe' }],
          },
        },
      ],
    };

    const trainer = new PatternTrainerEngine(multiRowExercise);
    expect(trainer.getState().currentRowNumber).toBe(1);
    trainer.nextStep(); // Row 1 done, advances to Row 2
    expect(trainer.getState().currentRowNumber).toBe(2);
    trainer.nextStep(); // Row 2 done, complete!
    expect(trainer.getState().isCompleted).toBe(true);
  });
});
