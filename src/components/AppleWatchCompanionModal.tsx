/**
 * Oczko UI — Symulator tarczy Apple Watch & Smart Stack Widget (DEC-03, BR-ZEG-003, BR-ZEG-009)
 * Umożliwia podgląd i testowanie synchronizacji stanu licznika z inteligentnym zegarkiem
 * oraz widżetami Live Activity na iOS 18 i watchOS 11.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  WatchCounterSnapshot,
  processDigitalCrownDelta,
  generateLiveActivityAttributes,
} from '../core/apple-watch-service';
import { triggerHaptic } from '../core/feedback-service';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface AppleWatchCompanionModalProps {
  visible: boolean;
  onClose: () => void;
  snapshot: WatchCounterSnapshot;
  onStep?: (direction: 'increment' | 'decrement') => void;
}

export default function AppleWatchCompanionModal({
  visible,
  onClose,
  snapshot,
  onStep,
}: AppleWatchCompanionModalProps) {
  const [crownAccumulator, setCrownAccumulator] = useState(0);

  const handleTapIncrement = () => {
    triggerHaptic('step');
    onStep?.('increment');
  };

  const handleTapDecrement = () => {
    triggerHaptic('undo');
    onStep?.('decrement');
  };

  const handleCrownRotate = (delta: number) => {
    const result = processDigitalCrownDelta(crownAccumulator, delta);
    setCrownAccumulator(result.remainingAccumulator);

    if (result.stepDelta > 0) {
      triggerHaptic('step');
      onStep?.('increment');
    } else if (result.stepDelta < 0) {
      triggerHaptic('undo');
      onStep?.('decrement');
    }
  };

  const liveActivity = generateLiveActivityAttributes(snapshot);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
        <View style={styles.modalContent}>
          {/* Nagłówek modala */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Apple Watch & Smart Stack</Text>
              <Text style={styles.modalSubtitle}>watchOS 11 • ActivityKit iOS 18 (DEC-03)</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Zamknij"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* OBUDOWA ZEGARKA Z CYFROWĄ KORONKĄ (BR-ZEG-003) */}
            <View style={styles.watchChassisRow}>
              {/* Koperta Apple Watch (45 mm OLED) */}
              <View style={styles.watchCase}>
                <View style={styles.watchScreen}>
                  {/* Pasek statusu zegarka */}
                  <View style={styles.watchStatusBar}>
                    <Text style={styles.watchTimeText}>10:09</Text>
                    <View style={styles.connectionBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.connectionText}>WCSession</Text>
                    </View>
                  </View>

                  {/* Informacja o robótce */}
                  <View style={styles.watchProjectHeader}>
                    <Text style={styles.watchProjectName} numberOfLines={1}>
                      {snapshot.projectName}
                    </Text>
                    <Text style={styles.watchPartName} numberOfLines={1}>
                      {snapshot.partName}
                    </Text>
                  </View>

                  {/* Główny licznik rzędu */}
                  <View style={styles.watchCounterArea}>
                    <Text style={styles.watchBigNumber}>{snapshot.currentValue}</Text>
                    {snapshot.targetValue && (
                      <Text style={styles.watchTargetText}>
                        {`z ${snapshot.targetValue} rz.`}
                      </Text>
                    )}
                  </View>

                  {/* Pasek postępu */}
                  {snapshot.progressPercent !== undefined && (
                    <View style={styles.watchProgressBar}>
                      <View
                        style={[
                          styles.watchProgressFill,
                          { width: `${Math.min(100, snapshot.progressPercent)}%` },
                        ]}
                      />
                    </View>
                  )}

                  {/* Baner przypomnienia (np. zmiana włóczki) */}
                  {snapshot.activeReminder && (
                    <View style={styles.watchReminderBadge}>
                      <Text style={styles.watchReminderText} numberOfLines={1}>
                        {snapshot.reminderReason || '⚠️ Ważny rząd'}
                      </Text>
                    </View>
                  )}

                  {/* Duży przycisk dotykowy +1 (Hands-free / Knitting Friendly) */}
                  <TouchableOpacity
                    style={styles.watchPrimaryBtn}
                    activeOpacity={0.8}
                    onPress={handleTapIncrement}
                    accessibilityRole="button"
                    accessibilityLabel="+1 Rząd"
                  >
                    <Text style={styles.watchPrimaryBtnText}>+1 Rząd</Text>
                  </TouchableOpacity>

                  {/* Pasek akcji dolnych */}
                  <View style={styles.watchBottomRow}>
                    <TouchableOpacity
                      style={styles.watchUndoBtn}
                      activeOpacity={0.7}
                      onPress={handleTapDecrement}
                    >
                      <Text style={styles.watchUndoBtnText}>↺ Cofnij (-1)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* SYMULACJA CYFROWEJ KORONKI (Digital Crown) */}
              <View style={styles.crownControlArea}>
                <Text style={styles.crownTitle}>KORONKA</Text>
                <TouchableOpacity
                  style={styles.crownBtn}
                  onPress={() => handleCrownRotate(1.0)}
                  accessibilityLabel="Obrót koronki w przód (+1)"
                >
                  <Text style={styles.crownBtnText}>▲ Koronka</Text>
                  <Text style={styles.crownSubText}>+1 rząd</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.crownBtn, styles.crownBtnDown]}
                  onPress={() => handleCrownRotate(-1.0)}
                  accessibilityLabel="Obrót koronki w tył (-1)"
                >
                  <Text style={styles.crownBtnText}>▼ Koronka</Text>
                  <Text style={styles.crownSubText}>-1 rząd</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SEKCJA WIDŻETU SMART STACK & LIVE ACTIVITY (BR-ZEG-009) */}
            <View style={styles.widgetSection}>
              <Text style={styles.sectionHeader}>PODGLĄD SMART STACK & DYNAMIC ISLAND</Text>

              {/* Widżet Smart Stack / Live Activity */}
              <View style={styles.smartStackCard}>
                <View style={styles.smartStackHeader}>
                  <Text style={styles.smartStackAppTitle}>🧶 OCZKO • LIVE</Text>
                  {snapshot.progressPercent !== undefined && (
                    <Text style={styles.smartStackProgress}>{`${snapshot.progressPercent}%`}</Text>
                  )}
                </View>

                <View style={styles.smartStackBody}>
                  <View style={styles.smartStackLeft}>
                    <Text style={styles.smartStackHeadline}>
                      {liveActivity.content.state.headline}
                    </Text>
                    <Text style={styles.smartStackValueText}>
                      {`Rząd ${snapshot.currentValue}`}
                      {snapshot.targetValue ? ` / ${snapshot.targetValue}` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.smartStackQuickPlusBtn}
                    onPress={handleTapIncrement}
                    activeOpacity={0.8}
                    accessibilityLabel="Szybki krok +1 z widżetu"
                  >
                    <Text style={styles.smartStackQuickPlusText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2A29',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8A8684',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#F5F3F0',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6E6A67',
  },
  scrollBody: {
    alignItems: 'center',
  },
  watchChassisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 12,
  },
  watchCase: {
    width: 210,
    height: 250,
    backgroundColor: '#1E1E1E',
    borderRadius: 44,
    padding: 9,
    borderWidth: 3,
    borderColor: '#3A3A3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  watchScreen: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 36,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchStatusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchTimeText: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#30D158',
  },
  connectionText: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '500',
  },
  watchProjectHeader: {
    alignItems: 'center',
    width: '100%',
    marginTop: -2,
  },
  watchProjectName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  watchPartName: {
    color: '#B8860B',
    fontSize: 10,
    fontWeight: '600',
  },
  watchCounterArea: {
    alignItems: 'center',
    marginVertical: -2,
  },
  watchBigNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  watchTargetText: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: -4,
  },
  watchProgressBar: {
    width: '90%',
    height: 3,
    backgroundColor: '#2C2C2E',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  watchProgressFill: {
    height: '100%',
    backgroundColor: '#F5A623',
  },
  watchReminderBadge: {
    backgroundColor: '#4A3B00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD60A',
    width: '95%',
    alignItems: 'center',
  },
  watchReminderText: {
    color: '#FFD60A',
    fontSize: 9,
    fontWeight: '700',
  },
  watchPrimaryBtn: {
    backgroundColor: '#8B5E3C',
    width: '100%',
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
  },
  watchPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  watchBottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  watchUndoBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  watchUndoBtnText: {
    color: '#A09D9A',
    fontSize: 9,
    fontWeight: '600',
  },
  crownControlArea: {
    alignItems: 'center',
    gap: 6,
  },
  crownTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8684',
    letterSpacing: 0.5,
  },
  crownBtn: {
    backgroundColor: '#F0ECE8',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 84,
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  crownBtnDown: {
    backgroundColor: '#FAF7F4',
  },
  crownBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C2A29',
  },
  crownSubText: {
    fontSize: 9,
    color: '#8A8684',
    marginTop: 2,
  },
  widgetSection: {
    width: '100%',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8684',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  smartStackCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    width: '100%',
  },
  smartStackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  smartStackAppTitle: {
    color: '#FF9F0A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  smartStackProgress: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
  },
  smartStackBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smartStackLeft: {
    flex: 1,
  },
  smartStackHeadline: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  smartStackValueText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  smartStackQuickPlusBtn: {
    backgroundColor: '#FF9F0A',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  smartStackQuickPlusText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
