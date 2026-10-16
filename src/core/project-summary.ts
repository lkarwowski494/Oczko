/**
 * Oczko Core — Generowanie podsumowań robótki i kart udostępniania (DEC-01, BR-PROJ-001...005)
 * Zapewnia:
 * 1. Zliczanie łącznych metryk robótki (rzędy, postęp, części, czas pracy)
 * 2. Formatowanie kart społecznościowych (Instagram, Ravelry, schowek)
 * 3. Oznaczanie projektów jako ukończonych (FO - Finished Object)
 */

import { EnrichedProject } from './project-service';
import { CounterEvent } from './counter-engine';
import { formatDuration } from './time-tracking-service';

export interface PartSummaryItem {
  id: string;
  name: string;
  rows: number;
  targetRows?: number;
  progressPercent?: number;
}

export interface ProjectSummaryStats {
  projectId: string;
  projectName: string;
  craftType: 'knitting' | 'crochet';
  status: 'active' | 'hibernated' | 'finished' | 'frogged';
  totalRowsKnitted: number;
  totalTargetRows?: number;
  progressPercent?: number;
  totalDurationSeconds?: number;
  totalDurationFormatted?: string;
  partsCount: number;
  countersCount: number;
  eventsCount: number;
  firstEventDate?: string;
  lastEventDate?: string;
  partsSummary: PartSummaryItem[];
}

export interface ShareTextOptions {
  yarnName?: string;
  toolName?: string;
  includeHashtags?: boolean;
}

/**
 * Wylicza statystyki podsumowania robótki na podstawie encji projektu i dziennika zdarzeń.
 */
export function buildProjectSummary(
  project: EnrichedProject,
  events: CounterEvent[] = [],
  totalDurationSeconds?: number
): ProjectSummaryStats {
  let totalRowsKnitted = 0;
  let totalTargetRows = 0;
  let hasAnyTarget = false;
  let totalCounters = 0;

  const partsSummary: PartSummaryItem[] = project.parts.map((part) => {
    // Główny licznik części to pierwszy licznik w części
    const primaryCounter = part.counters[0];
    const rows = primaryCounter?.currentValue ?? 0;
    totalRowsKnitted += rows;
    totalCounters += part.counters.length;

    let partProgress: number | undefined = undefined;
    if (part.targetRows && part.targetRows > 0) {
      hasAnyTarget = true;
      totalTargetRows += part.targetRows;
      partProgress = Math.min(100, Math.round((rows / part.targetRows) * 100));
    }

    return {
      id: part.id,
      name: part.name,
      rows,
      targetRows: part.targetRows,
      progressPercent: partProgress,
    };
  });

  const progressPercent =
    hasAnyTarget && totalTargetRows > 0
      ? Math.min(100, Math.round((totalRowsKnitted / totalTargetRows) * 100))
      : undefined;

  let firstEventDate: string | undefined = undefined;
  let lastEventDate: string | undefined = undefined;

  if (events.length > 0) {
    const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs);
    firstEventDate = new Date(sorted[0].timestampMs).toISOString().split('T')[0];
    lastEventDate = new Date(sorted[sorted.length - 1].timestampMs).toISOString().split('T')[0];
  }

  const formattedDuration =
    totalDurationSeconds !== undefined && totalDurationSeconds > 0
      ? formatDuration(totalDurationSeconds)
      : undefined;

  return {
    projectId: project.id,
    projectName: project.name,
    craftType: project.craftType,
    status: project.status,
    totalRowsKnitted,
    totalTargetRows: hasAnyTarget ? totalTargetRows : undefined,
    progressPercent,
    totalDurationSeconds,
    totalDurationFormatted: formattedDuration,
    partsCount: project.parts.length,
    countersCount: totalCounters,
    eventsCount: events.length,
    firstEventDate,
    lastEventDate,
    partsSummary,
  };
}

/**
 * Generuje sformatowany tekst podsumowania projektu gotowy do udostępnienia lub skopiowania.
 */
export function generateShareableText(
  summary: ProjectSummaryStats,
  options: ShareTextOptions = {}
): string {
  const craftName = summary.craftType === 'knitting' ? 'Druty' : 'Szydełko';
  const statusEmoji = summary.status === 'finished' ? '🎉 Ukończony (FO)' : '🧵 W trakcie (WIP)';

  const lines: string[] = [
    `🧶 Robótka w Oczko: ${summary.projectName} (${craftName})`,
    `📊 Status: ${statusEmoji}${summary.progressPercent !== undefined ? ` • Postęp: ${summary.progressPercent}%` : ''}`,
  ];

  if (summary.totalTargetRows !== undefined) {
    lines.push(`📏 Przerobione rzędy: ${summary.totalRowsKnitted} / ${summary.totalTargetRows} rz.`);
  } else {
    lines.push(`📏 Przerobione rzędy: ${summary.totalRowsKnitted} rz.`);
  }

  if (summary.totalDurationFormatted) {
    lines.push(`⏱️ Czas robótki: ${summary.totalDurationFormatted}`);
  }

  if (options.yarnName) {
    lines.push(`🧵 Włóczka: ${options.yarnName}`);
  }

  if (options.toolName) {
    lines.push(`🪢 Narzędzia: ${options.toolName}`);
  }

  if (summary.partsSummary.length > 1) {
    lines.push('\nCzęści projektu:');
    for (const part of summary.partsSummary) {
      const partRowInfo = part.targetRows
        ? `${part.rows} / ${part.targetRows} rz. (${part.progressPercent ?? 0}%)`
        : `${part.rows} rz.`;
      lines.push(`• ${part.name}: ${partRowInfo}`);
    }
  }

  lines.push('\n✨ Śledzone z aplikacją Oczko (Purlo)');

  if (options.includeHashtags !== false) {
    lines.push('#oczko #knitting #crochet #handmade #slowfashion #recznierobione');
  }

  return lines.join('\n');
}
