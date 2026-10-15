/**
 * Oczko Core — Serwis haptyki dotykowej i powiadomień interwałowych (BR-LICZ-003, BR-SYS-011)
 * Zapewnia natywny feedback dotykowy dla licznika oraz wykrywanie progów powtórzeń i interwałów.
 */

import * as Haptics from 'expo-haptics';

export type FeedbackType = 'step' | 'undo' | 'cycle' | 'goal' | 'reminder';

export interface FeedbackSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  intervalReminderRows?: number;
  intervalReminderLabel?: string;
}

export const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  hapticIntensity: 'light',
};

export interface ReminderCheckResult {
  shouldRemind: boolean;
  reason?: string;
}

/**
 * Sprawdza, czy bieżący rząd spełnia kryteria przypomnienia interwałowego lub listy zdefiniowanych rzędów.
 */
export function checkIntervalReminder(
  currentRow: number,
  interval?: number,
  customReminderRows?: number[],
  label?: string
): ReminderCheckResult {
  if (currentRow <= 0) {
    return { shouldRemind: false };
  }

  // Sprawdzenie listy konkretnych rzędów zdefiniowanych przez użytkownika
  if (customReminderRows && customReminderRows.length > 0 && customReminderRows.includes(currentRow)) {
    return {
      shouldRemind: true,
      reason: label ? `${label} (Rząd ${currentRow})` : `Wyznaczony rząd przypomnienia (${currentRow})`,
    };
  }

  // Sprawdzenie powtarzalnego interwału co N rzędów
  if (interval && interval > 0 && currentRow % interval === 0) {
    return {
      shouldRemind: true,
      reason: label ? `${label} (Rząd ${currentRow})` : `Osiągnięto interwał ${interval} rzędów (${currentRow})`,
    };
  }

  return { shouldRemind: false };
}

/**
 * Wyzwala odpowiedni natywny impuls haptyczny w zależności od typu zdarzenia.
 * Bezpiecznie ignoruje błędy na urządzeniach i środowiskach bez wsparcia silnika haptycznego.
 */
export async function triggerHaptic(
  type: FeedbackType,
  settings: Partial<FeedbackSettings> = DEFAULT_FEEDBACK_SETTINGS
): Promise<void> {
  const isEnabled = settings.hapticsEnabled ?? true;
  if (!isEnabled) {
    return;
  }

  try {
    switch (type) {
      case 'step':
        await Haptics.selectionAsync();
        break;
      case 'undo':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'cycle':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'goal':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'reminder':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch (_err) {
    // Środowisko testowe, przeglądarkowe lub urządzenie bez silnika Taptic Engine
  }
}
