import { Alert } from 'react-native';
import { t } from '../src/core/i18n';

export type CancelBtn = { text: string; style: 'cancel'; onPress?: () => void };

/**
 * Wzorzec „potwierdzanie” (Apple HIG Alerts / NFR-INT-001..016):
 * Przycisk rezygnacji w oknach potwierdzenia ma ZAWSZE jedno słowo — „Anuluj” (styl cancel).
 * Jedyny wyjątek: pytanie „Odrzucić zmiany?” po „Anuluj” w edytorze — tam przycisk to „Wróć do edycji”.
 * Żaden plik widoku nie wpisuje `style: 'cancel'` ręcznie.
 */
export const cancelButton = (onPress?: () => void): CancelBtn => ({
  text: t('Anuluj'),
  style: 'cancel',
  ...(onPress ? { onPress } : {}),
});

export const backToEditButton = (): CancelBtn => ({
  text: t('Wróć do edycji'),
  style: 'cancel',
});

export const okButton = (): CancelBtn => ({
  text: t('OK'),
  style: 'cancel',
});

export function confirm({
  title,
  message,
  action,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  action: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}): void {
  Alert.alert(title, message, [
    cancelButton(onCancel),
    {
      text: action,
      ...(destructive ? { style: 'destructive' as const } : {}),
      onPress: onConfirm,
    },
  ]);
}
