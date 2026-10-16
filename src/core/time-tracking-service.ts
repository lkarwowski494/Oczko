/**
 * Time Tracking & Knitting Speed Service (BR-CZAS-001..004).
 * Czysta matematyka dziewiarska i śledzenie czasu bez AI (ZP-05).
 * Mierzy tempo dziergania (rows/h), czas trwania sesji i estymowany czas do ukończenia robótki.
 */

export interface ProjectTimeSessionRecord {
  id: string;
  projectId: string;
  startedAt: string; // ISO 8601
  endedAt: string; // ISO 8601
  durationSeconds: number;
  activeRowsCount: number;
  createdAt: string;
}

export interface KnittingSpeedMetrics {
  totalSeconds: number;
  formattedDuration: string;
  rowsPerHour: number;
  averageSecondsPerRow: number;
  estimatedRemainingSeconds: number;
  formattedRemainingTime: string;
}

/**
 * Formatuje liczbę sekund do czytelnej postaci "Xh Ym" lub "Ym Zs".
 */
export function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = safeSec % 60;

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

/**
 * Sprawdza, czy sesję należy automatycznie zapauzować z powodu bezczynności (Auto-Pause).
 * Domyślny próg bezczynności to 5 minut (300 000 ms).
 */
export function shouldAutoPauseSession(
  lastActivityTimestampMs: number,
  currentTimestampMs: number,
  idleThresholdMinutes: number = 5
): boolean {
  if (lastActivityTimestampMs <= 0 || currentTimestampMs <= 0) {
    return false;
  }
  const diffMs = currentTimestampMs - lastActivityTimestampMs;
  const thresholdMs = Math.max(1, idleThresholdMinutes) * 60 * 1000;
  return diffMs >= thresholdMs;
}

/**
 * Oblicza czas trwania pojedynczej sesji w sekundach.
 */
export function calculateSessionDuration(
  startedAtMs: number,
  endedAtMs: number,
  pausedSeconds: number = 0
): number {
  if (startedAtMs <= 0 || endedAtMs <= 0 || endedAtMs < startedAtMs) {
    return 0;
  }
  const grossSeconds = Math.floor((endedAtMs - startedAtMs) / 1000);
  const netSeconds = Math.max(0, grossSeconds - Math.max(0, pausedSeconds));
  return netSeconds;
}

/**
 * Wylicza tempo dziergania (rows/h), średni czas rzędu oraz estymację pozostałego czasu.
 */
export function calculateKnittingSpeed(
  totalDurationSeconds: number,
  completedRows: number,
  targetRows?: number
): KnittingSpeedMetrics {
  const safeDuration = Math.max(0, totalDurationSeconds || 0);
  const safeRows = Math.max(0, completedRows || 0);

  let rowsPerHour = 0;
  let averageSecondsPerRow = 0;

  if (safeDuration > 0 && safeRows > 0) {
    rowsPerHour = Math.round((safeRows / (safeDuration / 3600)) * 10) / 10;
    averageSecondsPerRow = Math.round((safeDuration / safeRows) * 10) / 10;
  }

  let estimatedRemainingSeconds = 0;
  let formattedRemainingTime = 'Brak celu';

  if (targetRows && targetRows > safeRows) {
    if (averageSecondsPerRow > 0) {
      const remainingRows = targetRows - safeRows;
      estimatedRemainingSeconds = Math.round(remainingRows * averageSecondsPerRow);
      formattedRemainingTime = formatDuration(estimatedRemainingSeconds);
    } else {
      formattedRemainingTime = 'Brak danych';
    }
  } else if (targetRows && targetRows <= safeRows) {
    formattedRemainingTime = 'Cel osiągnięty';
  } else {
    formattedRemainingTime = 'Brak celu';
  }

  return {
    totalSeconds: safeDuration,
    formattedDuration: formatDuration(safeDuration),
    rowsPerHour,
    averageSecondsPerRow,
    estimatedRemainingSeconds,
    formattedRemainingTime,
  };
}
