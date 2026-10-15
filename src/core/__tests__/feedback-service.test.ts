/**
 * Testy jednostkowe serwisu haptyki i powiadomień interwałowych (BR-LICZ-003, BR-SYS-011)
 * Zgodne z TDD (Zasada 10).
 */

import {
  checkIntervalReminder,
  triggerHaptic,
  FeedbackSettings,
  DEFAULT_FEEDBACK_SETTINGS,
} from '../feedback-service';
import * as Haptics from 'expo-haptics';

// Mock dla expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('FeedbackService & Interval Reminders (BR-LICZ-003, BR-SYS-011)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkIntervalReminder', () => {
    it('wykrywa przypomnienie cykliczne co N rzędów', () => {
      const interval = 10;
      expect(checkIntervalReminder(5, interval).shouldRemind).toBe(false);
      expect(checkIntervalReminder(10, interval).shouldRemind).toBe(true);
      expect(checkIntervalReminder(10, interval).reason).toContain('10');
      expect(checkIntervalReminder(20, interval).shouldRemind).toBe(true);
      expect(checkIntervalReminder(23, interval).shouldRemind).toBe(false);
    });

    it('nie zgłasza przypomnienia dla rzędu 0', () => {
      expect(checkIntervalReminder(0, 10).shouldRemind).toBe(false);
    });

    it('obsługuje listę konkretnych rzędów przypomnienia (custom rows)', () => {
      const customRows = [4, 8, 16];
      expect(checkIntervalReminder(4, undefined, customRows).shouldRemind).toBe(true);
      expect(checkIntervalReminder(7, undefined, customRows).shouldRemind).toBe(false);
      expect(checkIntervalReminder(16, undefined, customRows).shouldRemind).toBe(true);
    });

    it('priorytetyzuje etykietę przypomnienia jeśli podano', () => {
      const res = checkIntervalReminder(12, 6, undefined, 'Zmiana koloru włóczki');
      expect(res.shouldRemind).toBe(true);
      expect(res.reason).toContain('Zmiana koloru włóczki');
    });
  });

  describe('triggerHaptic', () => {
    it('wywołuje odpowiednie wibracje dla kroku, cofnięcia, powtórzenia i celu', async () => {
      // Step (+1)
      await triggerHaptic('step');
      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);

      // Undo (-1)
      await triggerHaptic('undo');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

      // Cycle (koniec splotu / modulo)
      await triggerHaptic('cycle');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);

      // Goal (ukończenie robótki / części)
      await triggerHaptic('goal');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);

      // Reminder (przypomnienie interwałowe)
      await triggerHaptic('reminder');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
    });

    it('nie wywołuje wibracji, gdy haptyka jest wyłączona w ustawieniach', async () => {
      const settings: FeedbackSettings = {
        ...DEFAULT_FEEDBACK_SETTINGS,
        hapticsEnabled: false,
      };

      await triggerHaptic('step', settings);
      await triggerHaptic('goal', settings);

      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });

    it('bezpiecznie ignoruje błędy środowiska natywnego bez rzucania wyjątków', async () => {
      (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(new Error('Device does not support haptics'));

      await expect(triggerHaptic('step')).resolves.not.toThrow();
    });
  });
});
