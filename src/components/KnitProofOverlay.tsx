import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { t } from '../core/i18n';
import { LinkedCounterDisplayState } from '../core/project-context';

export interface KnitProofOverlayProps {
  projectName: string;
  partName: string;
  counterValue: number;
  targetRows?: number;
  activeLinkedStates: LinkedCounterDisplayState[];
  showReminder: boolean;
  reminderMessage: string;
  onExit: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function KnitProofOverlay({
  projectName,
  partName,
  counterValue,
  targetRows,
  activeLinkedStates,
  showReminder,
  reminderMessage,
  onExit,
  onIncrement,
  onDecrement,
}: KnitProofOverlayProps) {
  const progressText = targetRows
    ? `${Math.min(100, Math.round((counterValue / (targetRows || 1)) * 100))}%`
    : '—';

  const patternStepText = activeLinkedStates.length > 0 && activeLinkedStates[0].moduloCycle
    ? `${activeLinkedStates[0].cycleStep ?? 0}/${activeLinkedStates[0].moduloCycle}`
    : activeLinkedStates.length > 0
    ? `${activeLinkedStates[0].rawValue}`
    : '—';

  const remainingText = targetRows
    ? `${Math.max(0, targetRows - counterValue)}`
    : '∞';

  return (
    <View style={styles.knitProofContainer}>
      <View style={styles.knitProofTopBar}>
        <View>
          <Text style={styles.knitProofProjectName}>{projectName}</Text>
          <Text style={styles.knitProofPartName}>{partName}</Text>
        </View>
        <TouchableOpacity
          testID="exit-knit-proof-btn"
          style={styles.exitKnitProofBtn}
          onPress={onExit}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t('Wyjdź z trybu Knit-Proof')}
        >
          <Text style={styles.exitKnitProofBtnText}>✕ {t('Wyjdź z trybu Knit-Proof')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sacred Numbers HUD (Ergonomia blatu rzemieślniczego) */}
      <View style={styles.sacredNumbersBar}>
        <View style={styles.sacredNumberItem}>
          <Text style={styles.sacredNumberLabel}>{t('Bieżący')}</Text>
          <Text style={styles.sacredNumberValue}>{counterValue}</Text>
        </View>
        <View style={styles.sacredDivider} />
        <View style={styles.sacredNumberItem}>
          <Text style={styles.sacredNumberLabel}>{t('Cel / Postęp')}</Text>
          <Text style={styles.sacredNumberValue}>{progressText}</Text>
        </View>
        <View style={styles.sacredDivider} />
        <View style={styles.sacredNumberItem}>
          <Text style={styles.sacredNumberLabel}>{t('Wzór / Krok')}</Text>
          <Text style={styles.sacredNumberValue}>{patternStepText}</Text>
        </View>
        <View style={styles.sacredDivider} />
        <View style={styles.sacredNumberItem}>
          <Text style={styles.sacredNumberLabel}>{t('Pozostało')}</Text>
          <Text style={styles.sacredNumberValue}>{remainingText}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.knitProofTapArea}
        activeOpacity={0.9}
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={t('Stuknij, aby dodać rząd')}
      >
        <Text style={styles.knitProofBigValue}>{counterValue}</Text>
        <Text style={styles.knitProofHint}>{t('Dotknij w dowolnym miejscu')}</Text>
        {showReminder && (
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderText}>{reminderMessage}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.knitProofFooter}>
        <TouchableOpacity
          testID="knit-proof-undo-btn"
          style={styles.knitProofUndoBtn}
          onPress={onDecrement}
          onLongPress={onDecrement}
          delayLongPress={500}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t('Cofnij ostatni (Undo)')}
        >
          <Text style={styles.knitProofUndoBtnText}>↩️ {t('Cofnij ostatni (Undo)')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  knitProofContainer: {
    flex: 1,
    backgroundColor: '#F5EFEB',
    padding: 16,
    justifyContent: 'space-between',
  },
  knitProofTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  knitProofProjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C2A1E',
  },
  knitProofPartName: {
    fontSize: 13,
    color: '#8B5E3C',
    fontWeight: '500',
  },
  exitKnitProofBtn: {
    backgroundColor: '#E6D7CD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitKnitProofBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C3E26',
  },
  sacredNumbersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8DCD5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  sacredNumberItem: {
    flex: 1,
    alignItems: 'center',
  },
  sacredNumberLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A7D74',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sacredNumberValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3C2A1E',
  },
  sacredDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8DCD5',
  },
  knitProofTapArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E8DCD5',
  },
  knitProofBigValue: {
    fontSize: 110,
    fontWeight: '800',
    color: '#8B5E3C',
    fontVariant: ['tabular-nums'],
  },
  knitProofHint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0806E',
    marginTop: 8,
  },
  knitProofFooter: {
    paddingBottom: 8,
  },
  knitProofUndoBtn: {
    backgroundColor: '#FFF4EE',
    borderWidth: 1.5,
    borderColor: '#D4A373',
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knitProofUndoBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5E3C',
  },
  reminderBadge: {
    marginTop: 20,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reminderText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '500',
  },
});
