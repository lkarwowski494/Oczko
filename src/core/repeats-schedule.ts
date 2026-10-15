/**
 * Oczko Core — Generator harmonogramu rzędów i powtórzeń (RD-03b, RD-07d)
 * Odpowiada za precyzyjne rozpisanie rzędów z dodawaniem/ujmowaniem oczek.
 */

export interface RepeatScheduleParams {
  startRow: number;
  totalRows: number;
  interval: number;
  repeatCount: number;
}

export interface GeneratedScheduleResult {
  rows: number[];
  finalRow: number;
}

/**
 * Generuje harmonogram rzędów dla powtarzających się operacji (np. "co 4 rzędy 6 razy").
 */
export function generateRepeatSchedule(params: RepeatScheduleParams): GeneratedScheduleResult {
  const { startRow, totalRows, interval, repeatCount } = params;
  
  if (startRow <= 0 || interval <= 0 || repeatCount < 0) {
    throw new Error('Nieprawidłowe parametry harmonogramu rzędów');
  }

  const rows: number[] = [];
  let currentRow = startRow;

  for (let i = 0; i < repeatCount; i++) {
    if (totalRows > 0 && currentRow > totalRows) {
      break;
    }
    rows.push(currentRow);
    currentRow += interval;
  }

  return {
    rows,
    finalRow: rows.length > 0 ? rows[rows.length - 1] : startRow,
  };
}
