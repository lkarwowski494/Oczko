import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../core/theme';

export interface RecoveryBannerProps {
  corruptFiles: string[];
  onRecover: () => void;
  onDismiss?: () => void;
}

export function RecoveryBanner({ corruptFiles, onRecover, onDismiss }: RecoveryBannerProps) {
  if (!corruptFiles || corruptFiles.length === 0) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.textContainer}>
        <Text style={styles.title}>Wykryto odzyskiwanie awaryjne</Text>
        <Text style={styles.subtitle}>
          Zabezpieczono {corruptFiles.length} plik(ów) uszkodzonego stanu. Możesz podjąć próbę odzyskania danych.
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.recoverButton}
          onPress={onRecover}
          accessibilityRole="button"
          accessibilityLabel="Odzyskaj stan"
        >
          <Text style={styles.recoverButtonText}>Odzyskaj stan</Text>
        </TouchableOpacity>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Zamknij powiadomienie"
          >
            <Text style={styles.dismissButtonText}>Zamknij</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3A2E1E',
    borderColor: THEME.colors.warning ?? '#E6A23C',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  textContainer: {
    marginBottom: 8,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  recoverButton: {
    backgroundColor: THEME.colors.terracotta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoverButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
});
