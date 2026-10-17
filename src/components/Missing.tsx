import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { t } from '../core/i18n';

interface MissingProps {
  message?: string;
  onBack?: () => void;
  testID?: string;
}

export const Missing: React.FC<MissingProps> = ({
  message,
  onBack,
  testID = 'missing-record',
}) => {
  return (
    <View style={styles.container} testID={testID} accessibilityRole="alert">
      <Text style={styles.title}>{t('Nie znaleziono')}</Text>
      <Text style={styles.message}>
        {message || t('Szukany rekord nie istnieje lub został usunięty.')}
      </Text>
      {onBack && (
        <Pressable
          style={styles.button}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('Wróć')}
          testID="missing-back-button"
        >
          <Text style={styles.buttonText}>{t('Wróć')}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minHeight: 44,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
