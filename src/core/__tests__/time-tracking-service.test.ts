import {
  formatDuration,
  shouldAutoPauseSession,
  calculateSessionDuration,
  calculateKnittingSpeed,
} from '../time-tracking-service';

describe('Time Tracking & Knitting Speed Service (src/core/time-tracking-service.ts)', () => {
  describe('formatDuration', () => {
    it('formats seconds, minutes and hours correctly', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(3665)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(-10)).toBe('0s');
    });
  });

  describe('shouldAutoPauseSession', () => {
    it('returns true when idle threshold is exceeded', () => {
      const now = 1000000;
      const lastActive = now - 6 * 60 * 1000; // 6 minutes ago
      expect(shouldAutoPauseSession(lastActive, now, 5)).toBe(true);
    });

    it('returns false when still within idle threshold', () => {
      const now = 1000000;
      const lastActive = now - 2 * 60 * 1000; // 2 minutes ago
      expect(shouldAutoPauseSession(lastActive, now, 5)).toBe(false);
    });

    it('handles invalid timestamps safely', () => {
      expect(shouldAutoPauseSession(0, 1000)).toBe(false);
      expect(shouldAutoPauseSession(1000, 0)).toBe(false);
      expect(shouldAutoPauseSession(-10, -5)).toBe(false);
    });
  });

  describe('calculateSessionDuration', () => {
    it('calculates net session duration in seconds correctly', () => {
      const start = 1000000;
      const end = 1060000; // 60 seconds
      expect(calculateSessionDuration(start, end, 10)).toBe(50);
      expect(calculateSessionDuration(start, end)).toBe(60);
    });

    it('returns 0 for invalid or reverse timestamps', () => {
      expect(calculateSessionDuration(0, 1000)).toBe(0);
      expect(calculateSessionDuration(1000, 0)).toBe(0);
      expect(calculateSessionDuration(2000, 1000)).toBe(0);
      expect(calculateSessionDuration(1000, 2000, 5000)).toBe(0);
    });
  });

  describe('calculateKnittingSpeed', () => {
    it('calculates rows per hour and estimated remaining time', () => {
      // 100 rows in 3600 seconds (1 hour) = 100 rows/h, 36s per row
      // target 150 rows -> remaining 50 rows * 36s = 1800s (30m)
      const metrics = calculateKnittingSpeed(3600, 100, 150);
      expect(metrics.rowsPerHour).toBe(100);
      expect(metrics.averageSecondsPerRow).toBe(36);
      expect(metrics.estimatedRemainingSeconds).toBe(1800);
      expect(metrics.formattedRemainingTime).toBe('30m 0s');
      expect(metrics.formattedDuration).toBe('1h 0m');
    });

    it('handles zero rows or zero duration safely', () => {
      const zeroRows = calculateKnittingSpeed(3600, 0, 100);
      expect(zeroRows.rowsPerHour).toBe(0);
      expect(zeroRows.averageSecondsPerRow).toBe(0);
      expect(zeroRows.formattedRemainingTime).toBe('Brak danych');

      const zeroDuration = calculateKnittingSpeed(0, 50, 100);
      expect(zeroDuration.rowsPerHour).toBe(0);
      expect(zeroDuration.averageSecondsPerRow).toBe(0);
    });

    it('handles goal reached or no target specified', () => {
      const reached = calculateKnittingSpeed(3600, 100, 100);
      expect(reached.formattedRemainingTime).toBe('Cel osiągnięty');
      expect(reached.estimatedRemainingSeconds).toBe(0);

      const exceeded = calculateKnittingSpeed(3600, 120, 100);
      expect(exceeded.formattedRemainingTime).toBe('Cel osiągnięty');

      const noTarget = calculateKnittingSpeed(3600, 50);
      expect(noTarget.formattedRemainingTime).toBe('Brak celu');
    });
  });

  describe('RD-ENG-06: remainingTimerSec, pauseTimer, resumeTimer (NFR-PERF-004)', () => {
    const {
      remainingTimerSec,
      pauseTimer,
      resumeTimer,
    } = require('../time-tracking-service');

    it('spełnia wektory testowe z tabeli RD-ENG-06', () => {
      // Wektor 1: Start 180s o 10:00:00 (t0 = 0), uśpienie, wybudzenie o 10:02:15 (t_now = 135s = 135 000 ms) -> 45s
      const t0 = 0;
      const endAtMs = t0 + 180 * 1000; // 180 000 ms
      const wakeAtMs = 135 * 1000;
      expect(remainingTimerSec(endAtMs, wakeAtMs)).toBe(45);

      // Wektor 2: Start 60s o 10:00:00 (t0 = 0), wybudzenie o 10:05:00 (t_now = 300s = 300 000 ms) -> 0s (zakończony)
      const endAt60 = t0 + 60 * 1000;
      const wakeAt300 = 300 * 1000;
      expect(remainingTimerSec(endAt60, wakeAt300)).toBe(0);
    });

    it('obsługuje pauzę i wznowienie timera', () => {
      // Pauza po 50s od startu (z 180s zostało 130s = 130 000 ms)
      const endAtMs = 180 * 1000;
      const pauseAtMs = 50 * 1000;
      const deltaLeft = pauseTimer(endAtMs, pauseAtMs);
      expect(deltaLeft).toBe(130000);

      // Wznowienie po 10 minutach (t_resume = 650 000 ms)
      const resumeAtMs = 650 * 1000;
      const newEndAtMs = resumeTimer(deltaLeft, resumeAtMs);
      expect(newEndAtMs).toBe(780000);

      // Pozostały czas w chwili wznowienia = 130s
      expect(remainingTimerSec(newEndAtMs, resumeAtMs)).toBe(130);
    });

    it('obsługuje przypadki brzegowe timera (endAt <= 0, delta <= 0, domyślny nowMs)', () => {
      expect(remainingTimerSec(0)).toBe(0);
      expect(remainingTimerSec(-100)).toBe(0);
      expect(pauseTimer(100, 200)).toBe(0);
      expect(resumeTimer(-50, 1000)).toBe(1000);
      expect(remainingTimerSec(Date.now() + 5000)).toBeGreaterThanOrEqual(4);
      expect(pauseTimer(Date.now() + 5000)).toBeGreaterThan(0);
      expect(resumeTimer(5000)).toBeGreaterThan(0);
    });
  });
});

