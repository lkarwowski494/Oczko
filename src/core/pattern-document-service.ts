/**
 * Oczko Core — Serwis obsługi dokumentów wzorów PDF i pływającej linijki (BR-WZOR-001, DEC-09)
 * Umożliwia import plików PDF i grafik schematów, powiązanie z projektem,
 * precyzyjne pozycjonowanie linijki postępu oraz automatyczny krok z licznikiem (NFR-DOST-009).
 */

import { DatabaseClient } from './database';

export interface PatternDocument {
  id: string;
  projectId?: string;
  fileName: string;
  fileUri: string;
  fileSize?: number;
  currentPage: number;
  totalPages: number;
  rulerYPercent: number; // 0..100 (%)
  rulerHeightPercent: number; // 2..20 (%)
  autoStepEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatternFileInput {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface PatternValidationResult {
  valid: boolean;
  error?: string;
  document?: Partial<PatternDocument>;
}

export interface NextRulerPositionResult {
  newY: number;
  shouldAdvancePage: boolean;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
const SUPPORTED_MIME_PREFIXES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

/**
 * Weryfikuje i przygotowuje plik wzoru wybrany przez użytkownika.
 */
export function validateAndFormatPatternFile(file: PatternFileInput): PatternValidationResult {
  const fileName = file.name || 'wzor.pdf';
  const lowerName = fileName.toLowerCase();
  const lowerMime = (file.mimeType || '').toLowerCase();

  const hasSupportedExt = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasSupportedMime = SUPPORTED_MIME_PREFIXES.some((m) => lowerMime.startsWith(m));

  if (!hasSupportedExt && !hasSupportedMime) {
    return {
      valid: false,
      error: 'Nieobsługiwany format pliku. Wybierz plik PDF lub grafikę wzoru (.pdf, .png, .jpg).',
    };
  }

  return {
    valid: true,
    document: {
      fileName,
      fileUri: file.uri,
      fileSize: file.size,
      currentPage: 1,
      totalPages: 1,
      rulerYPercent: 20.0,
      rulerHeightPercent: 6.0,
      autoStepEnabled: true,
    },
  };
}

/**
 * Oblicza nową pozycję linijki po wykonaniu kroku rzędu (w przód lub w tył).
 */
export function calculateNextRulerPosition(
  currentY: number,
  stepPercent: number = 4,
  direction: 'forward' | 'backward' = 'forward'
): NextRulerPositionResult {
  if (direction === 'forward') {
    const nextY = currentY + stepPercent;
    if (nextY > 90) {
      return {
        newY: 15, // powrót na górę nowej strony
        shouldAdvancePage: true,
      };
    }
    return {
      newY: Math.round(nextY * 10) / 10,
      shouldAdvancePage: false,
    };
  } else {
    const prevY = currentY - stepPercent;
    return {
      newY: Math.max(5, Math.round(prevY * 10) / 10),
      shouldAdvancePage: false,
    };
  }
}

/**
 * Automatycznie synchronizuje pozycję linijki z bieżącym krokiem licznika.
 */
export function stepPatternDocumentWithCounter(
  doc: PatternDocument,
  stepDelta: number = 1
): PatternDocument {
  if (!doc.autoStepEnabled) {
    return doc;
  }

  if (stepDelta > 0) {
    const { newY, shouldAdvancePage } = calculateNextRulerPosition(doc.rulerYPercent, 4, 'forward');
    const nextPage = shouldAdvancePage && doc.currentPage < doc.totalPages
      ? doc.currentPage + 1
      : doc.currentPage;

    return {
      ...doc,
      rulerYPercent: newY,
      currentPage: nextPage,
      updatedAt: new Date().toISOString(),
    };
  } else if (stepDelta < 0) {
    const { newY } = calculateNextRulerPosition(doc.rulerYPercent, 4, 'backward');
    return {
      ...doc,
      rulerYPercent: newY,
      updatedAt: new Date().toISOString(),
    };
  }

  return doc;
}

/**
 * Zapisuje nowy rekord dokumentu wzoru w bazie danych SQLite.
 */
export async function insertPatternDocument(
  db: DatabaseClient,
  doc: PatternDocument
): Promise<void> {
  await db.runAsync(
    `INSERT INTO pattern_documents (
      id, project_id, file_name, file_uri, file_size, current_page, total_pages,
      ruler_y_percent, ruler_height_percent, auto_step_enabled, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    doc.id,
    doc.projectId ?? null,
    doc.fileName,
    doc.fileUri,
    doc.fileSize ?? null,
    doc.currentPage,
    doc.totalPages,
    doc.rulerYPercent,
    doc.rulerHeightPercent,
    doc.autoStepEnabled ? 1 : 0,
    doc.notes ?? null,
    doc.createdAt,
    doc.updatedAt
  );
}

interface PatternDocumentRow {
  id: string;
  project_id: string | null;
  file_name: string;
  file_uri: string;
  file_size: number | null;
  current_page: number;
  total_pages: number;
  ruler_y_percent: number;
  ruler_height_percent: number;
  auto_step_enabled: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToDocument(row: PatternDocumentRow): PatternDocument {
  return {
    id: row.id,
    projectId: row.project_id ?? undefined,
    fileName: row.file_name,
    fileUri: row.file_uri,
    fileSize: row.file_size ?? undefined,
    currentPage: row.current_page,
    totalPages: row.total_pages,
    rulerYPercent: row.ruler_y_percent,
    rulerHeightPercent: row.ruler_height_percent,
    autoStepEnabled: Boolean(row.auto_step_enabled),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Pobiera dokument wzoru po jego ID.
 */
export async function getPatternDocument(
  db: DatabaseClient,
  id: string
): Promise<PatternDocument | null> {
  const row = await db.getFirstAsync<PatternDocumentRow>(
    `SELECT * FROM pattern_documents WHERE id = ?`,
    id
  );
  return row ? mapRowToDocument(row) : null;
}

/**
 * Pobiera dokument wzoru powiązany z danym projektem.
 */
export async function getPatternDocumentForProject(
  db: DatabaseClient,
  projectId: string
): Promise<PatternDocument | null> {
  const row = await db.getFirstAsync<PatternDocumentRow>(
    `SELECT * FROM pattern_documents WHERE project_id = ?`,
    projectId
  );
  return row ? mapRowToDocument(row) : null;
}

/**
 * Zwraca listę wszystkich zaimportowanych dokumentów wzorów.
 */
export async function listPatternDocuments(db: DatabaseClient): Promise<PatternDocument[]> {
  const rows = await db.getAllAsync<PatternDocumentRow>(
    `SELECT * FROM pattern_documents ORDER BY updated_at DESC`
  );
  return rows.map(mapRowToDocument);
}

/**
 * Aktualizuje pozycję linijki oraz bieżącą stronę dokumentu w SQLite.
 */
export async function updatePatternRuler(
  db: DatabaseClient,
  id: string,
  rulerYPercent: number,
  currentPage?: number
): Promise<void> {
  const now = new Date().toISOString();
  if (currentPage !== undefined) {
    await db.runAsync(
      `UPDATE pattern_documents SET ruler_y_percent = ?, current_page = ?, updated_at = ? WHERE id = ?`,
      rulerYPercent,
      currentPage,
      now,
      id
    );
  } else {
    await db.runAsync(
      `UPDATE pattern_documents SET ruler_y_percent = ?, updated_at = ? WHERE id = ?`,
      rulerYPercent,
      now,
      id
    );
  }
}

/**
 * Usuwa dokument wzoru z bazy danych.
 */
export async function deletePatternDocument(db: DatabaseClient, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM pattern_documents WHERE id = ?`, id);
}
