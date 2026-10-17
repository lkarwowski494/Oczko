import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { t } from '../core/i18n';

export const CLOSE_TEST_ID = 'close-modal';

interface CloseButtonProps {
  onPress: () => void;
  label?: string;
  testID?: string;
}

/**
 * Standardowy przycisk zamknięcia modalu / okna (Apple HIG Sheets / NFR-INT-001):
 * - Zawsze po lewej stronie w nagłówku
 * - Etykieta „Anuluj” (lub Cancel w EN)
 * - Rola „button”
 * - Rozmiar dotykowy >= 44x44 pt
 * - testID="close-modal"
 */
export const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  label,
  testID = CLOSE_TEST_ID,
}) => {
  const displayLabel = label || t('Anuluj');

  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={displayLabel}
      testID={testID}
      hitSlop={8}
    >
      <Text style={styles.text}>{displayLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  text: {
    color: theme.colors.terracotta,
    fontSize: 16,
    fontWeight: '500',
  },
});
