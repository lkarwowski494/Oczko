import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../core/theme';

interface EmptyProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  testID = 'empty-state',
}) => {
  return (
    <View style={styles.container} testID={testID} accessibilityRole="summary">
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.terracotta,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
