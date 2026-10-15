/**
 * Oczko Core — Silnik trenażera powtórzeń wzorów (DEC-17)
 * Obsługuje 4 standardowe wzorce dziewiarskie i interaktywny postęp powtórzeń krok po kroku.
 */

export interface TrainerStep {
  code: string;
  description: string;
  stitchesCount: number;
  glyph?: string;
}

export interface TrainerRow {
  rowNumber: number;
  side: 'RS' | 'WS'; // RS = Prawa strona robótki, WS = Lewa strona robótki
  repeats: {
    steps: TrainerStep[];
    repeatCount: number;
  };
}

export interface TrainerExercise {
  id: string;
  name: string;
  description: string;
  category: 'ribbing' | 'texture' | 'cable' | 'lace';
  totalStitches: number;
  rows: TrainerRow[];
}

export interface TrainerState {
  exerciseId: string;
  currentRowNumber: number;
  currentSide: 'RS' | 'WS';
  currentStepIndex: number;
  currentRepeatNumber: number;
  totalRepeatsInRow: number;
  currentInstruction: TrainerStep;
  isCompleted: boolean;
  totalStepsCompleted: number;
}

export const TRAINER_EXERCISES: TrainerExercise[] = [
  {
    id: 'ex_ribbing_2x2',
    name: 'Ściągacz elastyczny 2x2',
    description: 'Klasyczny ściągacz na mankiety i doły swetrów: naprzemiennie dwa oczka prawe i dwa lewe.',
    category: 'ribbing',
    totalStitches: 16,
    rows: [
      {
        rowNumber: 1,
        side: 'RS',
        repeats: {
          steps: [
            { code: '2 o.p.', description: 'Przerób 2 oczka na prawo', stitchesCount: 2, glyph: '||' },
            { code: '2 o.l.', description: 'Przerób 2 oczka na lewo', stitchesCount: 2, glyph: '——' },
          ],
          repeatCount: 4,
        },
      },
    ],
  },
  {
    id: 'ex_moss_stitch',
    name: 'Ścieg ryżowy drobny',
    description: 'Elegancka, ziarnista faktura: oczka prawe i lewe z przesunięciem w kolejnym rzędzie.',
    category: 'texture',
    totalStitches: 16,
    rows: [
      {
        rowNumber: 1,
        side: 'RS',
        repeats: {
          steps: [
            { code: '1 o.p.', description: 'Przerób 1 oczko na prawo', stitchesCount: 1, glyph: '|' },
            { code: '1 o.l.', description: 'Przerób 1 oczko na lewo', stitchesCount: 1, glyph: '—' },
          ],
          repeatCount: 8,
        },
      },
      {
        rowNumber: 2,
        side: 'WS',
        repeats: {
          steps: [
            { code: '1 o.l.', description: 'Przerób 1 oczko na lewo (nad o.p.)', stitchesCount: 1, glyph: '—' },
            { code: '1 o.p.', description: 'Przerób 1 oczko na prawo (nad o.l.)', stitchesCount: 1, glyph: '|' },
          ],
          repeatCount: 8,
        },
      },
    ],
  },
  {
    id: 'ex_cable_c6f',
    name: 'Warkocz klasyczny 6-oczkowy (C6F)',
    description: 'Skrzyżowanie 6 oczek za pomocą drutu pomocniczego z przodu robótki, tworzące skręt w lewo.',
    category: 'cable',
    totalStitches: 12,
    rows: [
      {
        rowNumber: 1,
        side: 'RS',
        repeats: {
          steps: [
            { code: '3 o.l.', description: 'Tło warkocza: 3 oczka lewe', stitchesCount: 3, glyph: '———' },
            { code: 'C6F (W6P)', description: '3 o. na drut pomocniczy z przodu, 3 o.p., 3 o.p. z pomocniczego', stitchesCount: 6, glyph: '⤱' },
            { code: '3 o.l.', description: 'Tło warkocza: 3 oczka lewe', stitchesCount: 3, glyph: '———' },
          ],
          repeatCount: 1,
        },
      },
    ],
  },
  {
    id: 'ex_lace_eyelet',
    name: 'Ażur / Dziurki ozdobne (Lace)',
    description: 'Para narzutu i redukcji k2tog tworząca dekoracyjny rząd ażurowy o stałej liczbie oczek.',
    category: 'lace',
    totalStitches: 16,
    rows: [
      {
        rowNumber: 1,
        side: 'RS',
        repeats: {
          steps: [
            { code: '2 o.p.', description: 'Dojście: 2 oczka prawe', stitchesCount: 2, glyph: '||' },
            { code: 'narz.', description: 'Narzut nitki na drut (dodaje 1 oczko / dziurka)', stitchesCount: 1, glyph: '○' },
            { code: '2orazem p.', description: 'Dwa oczka razem na prawo (redukuje 1 oczko)', stitchesCount: 2, glyph: '/' },
          ],
          repeatCount: 4,
        },
      },
    ],
  },
];

export class PatternTrainerEngine {
  private exercise: TrainerExercise;
  private currentRowIdx: number = 0;
  private currentRepeatIdx: number = 0;
  private currentStepIdx: number = 0;
  private isDone: boolean = false;
  private stepsCompletedCount: number = 0;

  constructor(exercise: TrainerExercise) {
    this.exercise = exercise;
  }

  public getState(): TrainerState {
    const currentRow = this.exercise.rows[this.currentRowIdx] ?? this.exercise.rows[0];
    const steps = currentRow.repeats.steps;
    const currentInstruction = steps[this.currentStepIdx] ?? steps[0];

    return {
      exerciseId: this.exercise.id,
      currentRowNumber: currentRow.rowNumber,
      currentSide: currentRow.side,
      currentStepIndex: this.currentStepIdx,
      currentRepeatNumber: this.currentRepeatIdx + 1,
      totalRepeatsInRow: currentRow.repeats.repeatCount,
      currentInstruction,
      isCompleted: this.isDone,
      totalStepsCompleted: this.stepsCompletedCount,
    };
  }

  public nextStep(): void {
    if (this.isDone) return;

    const currentRow = this.exercise.rows[this.currentRowIdx];
    const steps = currentRow.repeats.steps;

    this.stepsCompletedCount++;

    if (this.currentStepIdx + 1 < steps.length) {
      // Następny krok w bieżącym powtórzeniu
      this.currentStepIdx++;
    } else {
      // Koniec kroków w bieżącym powtórzeniu
      this.currentStepIdx = 0;
      if (this.currentRepeatIdx + 1 < currentRow.repeats.repeatCount) {
        // Następne powtórzenie w tym samym rzędzie
        this.currentRepeatIdx++;
      } else {
        // Wszystkie powtórzenia w rzędzie ukończone
        this.currentRepeatIdx = 0;
        if (this.currentRowIdx + 1 < this.exercise.rows.length) {
          // Następny rząd
          this.currentRowIdx++;
        } else {
          // Ukończono wszystkie rzędy i powtórzenia ćwiczenia
          this.isDone = true;
        }
      }
    }
  }

  public reset(): void {
    this.currentRowIdx = 0;
    this.currentRepeatIdx = 0;
    this.currentStepIdx = 0;
    this.isDone = false;
    this.stepsCompletedCount = 0;
  }
}
