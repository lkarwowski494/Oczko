import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { t } from '../core/i18n';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
  onClear?: () => void;
}

/**
 * Normalizacja diakrytyczna (RD-ENG-07):
 * Usuwa znaki diakrytyczne oraz jawnie zamienia litery ł/Ł na l/L,
 * ponieważ standardowe Unicode NFD nie rozkłada litery ł na l + kreskę.
 */
export function normalizeSearchQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[ł]/g, 'l')
    .replace(/[Ł]/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function searchMatches(target: string, query: string): boolean {
  if (!query) return true;
  const normTarget = normalizeSearchQuery(target);
  const normQuery = normalizeSearchQuery(query);
  return normTarget.includes(normQuery);
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  testID = 'search-field',
  onClear,
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || t('Szukaj...')}
        placeholderTextColor={theme.colors.textMuted}
        testID={testID}
        maxLength={80}
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder || t('Szukaj')}
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <Pressable
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('Wyczyść wyszukiwanie')}
          testID="search-clear-button"
          hitSlop={8}
        >
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    minHeight: 44,
    paddingVertical: 8,
  },
  clearButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});
