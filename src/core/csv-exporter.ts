/**
 * Oczko Core — Bezpieczny eksporter CSV przeciwko Formula Injection (RD-ENG-10, NFR-SEC-015).
 * Obsługuje eksport projektów, części, liczników oraz magazynu włóczek.
 */

export const CSV_BOM = '\uFEFF';

/**
 * RD-ENG-10: Ucieczka komórek CSV przeciw Formula Injection (CSV / Excel Formula Injection).
 * Dla wartości tekstowej s:
 * 1. Jeśli s nie jest czystą liczbą ujemną (!/^-\d+(\.\d+)?$/) i zaczyna się od znaku z ['=', '+', '-', '@', '\t', '\r'],
 *    zastąp s <- "'" + s.
 * 2. Następnie jeśli s zawiera ',', '"', '\n', '\r', zwróć '"' + s.replace(/"/g, '""') + '"'.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let s = String(value);

  // Sprawdzamy czy to czysta liczba ujemna (np. "-12.5")
  const isPureNegativeNumber = /^-?\d+(\.\d+)?$/.test(s.trim()) && !s.trim().startsWith('+');

  if (!isPureNegativeNumber && /^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }

  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }

  return s;
}

export interface CsvProjectExportRow {
  projectName: string;
  craftType: string;
  status: string;
  partName: string;
  counterName: string;
  counterValue: number;
  targetRows?: number | null;
  updatedAt: string;
}

export function buildProjectsCsv(rows: CsvProjectExportRow[]): string {
  const headers = [
    'Projekt',
    'Rękodzieło',
    'Status',
    'Część robótki',
    'Licznik',
    'Aktualna wartość',
    'Wiersze docelowe',
    'Ostatnia zmiana',
  ];

  const headerLine = headers.map(escapeCsvCell).join(',');
  const lines = rows.map((r) =>
    [
      r.projectName,
      r.craftType,
      r.status,
      r.partName,
      r.counterName,
      r.counterValue,
      r.targetRows ?? '',
      r.updatedAt,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headerLine, ...lines].join('\n') + '\n';
}

export interface CsvYarnExportRow {
  brand: string;
  name: string;
  colorway: string;
  dyeLot?: string | null;
  weightCategory: string;
  skeinsRemaining: number;
  skeinsTotal: number;
  weightGrams?: number | null;
  meters?: number | null;
  notes?: string | null;
}

export function buildStashYarnsCsv(rows: CsvYarnExportRow[]): string {
  const headers = [
    'Marka',
    'Nazwa',
    'Kolor / Odcień',
    'Partia farbowania',
    'Grubość CYC',
    'Motki na stanie',
    'Motki łącznie',
    'Masa motka (g)',
    'Długość motka (m)',
    'Notatki',
  ];

  const headerLine = headers.map(escapeCsvCell).join(',');
  const lines = rows.map((r) =>
    [
      r.brand,
      r.name,
      r.colorway,
      r.dyeLot ?? '',
      r.weightCategory,
      r.skeinsRemaining,
      r.skeinsTotal,
      r.weightGrams ?? '',
      r.meters ?? '',
      r.notes ?? '',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headerLine, ...lines].join('\n') + '\n';
}
