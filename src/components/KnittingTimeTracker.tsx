/**
 * Oczko UI — Komponent śledzenia czasu robótki i prędkości dziergania (BR-CZAS-001..004)
 * Zapewnia:
 * 1. Stoper sesji dziergania (Start / Pauza / Autozapis w SQLite)
 * 2. Pomiar tempa dziergania na żywo (rows/h oraz s/rząd)
 * 3. Estymację pozostałego czasu robótki (ETA na podstawie targetRows)
 * 4. Wykrywanie bezczynności (Auto-Pause po 5 minutach braku kliknięcia w licznik)
 * 5. Spełnienie wymogów Apple HIG (min. 44x44 pt cele dotykowe, etykiety accessibility)
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { DatabaseClient } from '../core/database';
import {
  formatDuration,
  shouldAutoPauseSession,
  calculateKnittingSpeed,
} from '../core/time-tracking-service';
import {
  saveTimeSession,
  getTotalProjectDurationSeconds,
} from '../core/project-repository';

export interface KnittingTimeTrackerProps {
  projectId: string;
  targetRows?: number;
  currentRows: number;
  db?: DatabaseClient | null;
  initialTrackingActive?: boolean;
}

export default function KnittingTimeTracker({
  projectId,
  targetRows,
  currentRows,
  db,
  initialTrackingActive = false,
}: KnittingTimeTrackerProps) {
  const [isTracking, setIsTracking] = useState<boolean>(initialTrackingActive);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionRows, setSessionRows] = useState<number>(0);
  const [totalSavedSeconds, setTotalSavedSeconds] = useState<number>(0);
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const prevRowsRef = useRef<number>(currentRows);
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());

  // 1. Wczytanie skumulowanego czasu z bazy danych
  useEffect(() => {
    let isMounted = true;
    if (db && projectId) {
      getTotalProjectDurationSeconds(db, projectId)
        .then((sec) => {
          if (isMounted) {
            setTotalSavedSeconds(sec);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [db, projectId]);

  // 2. Reakcja na przyrost rzędów — wznawia stoper i aktualizuje aktywność
  useEffect(() => {
    if (currentRows > prevRowsRef.current) {
      const added = currentRows - prevRowsRef.current;
      setSessionRows((prev) => prev + added);
      lastActivityRef.current = Date.now();
      if (!isTracking) {
        setIsTracking(true);
        sessionStartTimeRef.current = new Date().toISOString();
      }
      if (isAutoPaused) {
        setIsAutoPaused(false);
      }
    }
    prevRowsRef.current = currentRows;
  }, [currentRows, isAutoPaused, isTracking]);

  // 3. Pętla stopera (co 1 sekundę) z mechanizmem wykrywania bezczynności (Auto-Pause)
  useEffect(() => {
    if (!isTracking || isAutoPaused) return;

    const timer = setInterval(() => {
      const now = Date.now();
      if (shouldAutoPauseSession(lastActivityRef.current, now, 5)) {
        setIsAutoPaused(true);
      } else {
        setSessionSeconds((prev) => prev + 1);
      }
    }, 1000);

    if (typeof (timer as any)?.unref === 'function') {
      (timer as any).unref();
    }

    return () => clearInterval(timer);
  }, [isTracking, isAutoPaused]);

  // 4. Bezpieczny zapis ukończonej sesji do SQLite
  const commitSessionToDatabase = async (durationSec: number, rowsCount: number) => {
    if (durationSec <= 0 || !db || !projectId) return;

    const endedAt = new Date().toISOString();
    const sessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      startedAt: sessionStartTimeRef.current,
      endedAt,
      durationSeconds: durationSec,
      activeRowsCount: rowsCount,
      createdAt: endedAt,
    };

    try {
      await saveTimeSession(db, sessionRecord);
      setTotalSavedSeconds((prev) => prev + durationSec);
    } catch {
      // Ignorujemy błędy SQLite w testach bez bazy
    }
  };

  const handleToggleTracking = async () => {
    if (isTracking) {
      // Pauza — zapisujemy dotychczasową sesję
      const durationToSave = sessionSeconds;
      const rowsToSave = sessionRows;
      setSessionSeconds(0);
      setSessionRows(0);
      setIsTracking(false);
      setIsAutoPaused(false);
      await commitSessionToDatabase(durationToSave, rowsToSave);
    } else {
      // Start / Wznowienie
      sessionStartTimeRef.current = new Date().toISOString();
      lastActivityRef.current = Date.now();
      setIsTracking(true);
      setIsAutoPaused(false);
    }
  };

  const speedMetrics = calculateKnittingSpeed(
    sessionSeconds,
    sessionRows,
    targetRows
  );

  const cumulativeTotalSeconds = totalSavedSeconds + sessionSeconds;
  const formattedTotalTime = formatDuration(cumulativeTotalSeconds);
  const formattedSessionTime = formatDuration(sessionSeconds);

  return (
    <View style={styles.container} testID="knitting-time-tracker">
      <View style={styles.headerRow}>
        <View style={styles.statusIndicatorWrapper}>
          <View
            style={[
              styles.statusDot,
              isTracking && !isAutoPaused
                ? styles.statusDotActive
                : styles.statusDotPaused,
            ]}
          />
          <Text style={styles.timeLabel}>
            {isAutoPaused
              ? 'Wstrzymano (brak ruchu)'
              : isTracking
              ? 'Sesja dziergania'
              : 'Stoper zatrzymany'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleToggleTracking}
          accessibilityRole="button"
          accessibilityLabel={
            isTracking ? 'Wstrzymaj stoper sesji' : 'Rozpocznij stoper sesji'
          }
        >
          <Text style={styles.controlButtonText}>
            {isTracking ? '⏸️ Pauza' : '▶️ Wznów'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricSubLabel}>Czas w tej sesji</Text>
          <Text style={styles.metricPrimaryValue}>{formattedSessionTime}</Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.metricSubLabel}>Tempo robótki</Text>
          <Text style={styles.metricPrimaryValue}>
            {speedMetrics.rowsPerHour > 0
              ? `${speedMetrics.rowsPerHour} rz./h`
              : '— rz./h'}
          </Text>
        </View>

        {targetRows !== undefined && targetRows > 0 && (
          <View style={styles.metricBlock}>
            <Text style={styles.metricSubLabel}>Estymacja (ETA)</Text>
            <Text style={styles.metricPrimaryValue}>
              {speedMetrics.formattedRemainingTime}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.detailsToggle}
        onPress={() => setShowDetails(!showDetails)}
        accessibilityRole="button"
        accessibilityLabel="Pokaż szczegóły czasu robótki"
      >
        <Text style={styles.detailsToggleText}>
          {showDetails ? 'Ukryj szczegóły ▲' : 'Łączny czas robótki ▼'}
        </Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailTitle}>Łączny czas projektu:</Text>
            <Text style={styles.detailVal}>{formattedTotalTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailTitle}>Rzędy w bieżącej sesji:</Text>
            <Text style={styles.detailVal}>{sessionRows} rz.</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailTitle}>Średni czas na rząd:</Text>
            <Text style={styles.detailVal}>
              {speedMetrics.averageSecondsPerRow > 0
                ? `${Math.round(speedMetrics.averageSecondsPerRow)} s/rząd`
                : '—'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotPaused: {
    backgroundColor: '#F59E0B',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlButton: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricSubLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  metricPrimaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailsToggle: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  detailsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  detailsCard: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
});
