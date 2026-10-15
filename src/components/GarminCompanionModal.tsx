import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  GarminSyncPayload,
  GarminWatchEvent,
  GarminOfflineQueue,
  handleGarminWatchEvent,
  GarminWatchModel,
} from '../core/garmin-service';

interface GarminCompanionModalProps {
  visible: boolean;
  onClose: () => void;
  syncPayload: GarminSyncPayload;
  onIncrement: () => void;
  onDecrement: () => void;
  onNextPart?: () => void;
  onPreviousPart?: () => void;
}

export function GarminCompanionModal({
  visible,
  onClose,
  syncPayload,
  onIncrement,
  onDecrement,
  onNextPart,
  onPreviousPart,
}: GarminCompanionModalProps) {
  const [watchModel, setWatchModel] = useState<GarminWatchModel>('forerunner_965');
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue] = useState(() => new GarminOfflineQueue(50));
  const [queuedCount, setQueuedCount] = useState(0);
  const [batteryPercent] = useState(88);

  const handleButtonPress = (button: GarminWatchEvent['button']) => {
    const event: GarminWatchEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      source: 'garmin_connectiq',
      button,
      counterId: syncPayload.counterId,
      timestamp: Date.now(),
      batteryLevelPercent: batteryPercent,
    };

    if (isOffline) {
      offlineQueue.enqueue(event);
      setQueuedCount(offlineQueue.size());
    } else {
      handleGarminWatchEvent(event, {
        onIncrement,
        onDecrement,
        onNextPart,
        onPreviousPart,
      });
    }
  };

  const handleFlushOffline = () => {
    const events = offlineQueue.flush();
    for (const evt of events) {
      handleGarminWatchEvent(evt, {
        onIncrement,
        onDecrement,
        onNextPart,
        onPreviousPart,
      });
    }
    setQueuedCount(0);
  };

  const modelLabels: Record<GarminWatchModel, string> = {
    forerunner_965: 'Garmin Forerunner 965',
    fenix_7: 'Garmin Fēnix 7 Solar',
    venu_3: 'Garmin Venu 3',
    epix_pro: 'Garmin Epix Pro (Gen 2)',
    generic_ciq: 'Garmin ConnectIQ Generic',
  };

  const percentProgress = syncPayload.targetCount > 0
    ? Math.min(100, Math.round((syncPayload.currentCount / syncPayload.targetCount) * 100))
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Pasek górny */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Garmin ConnectIQ</Text>
            <Text style={styles.subtitle}>Prototyp integracji z zegarkami Garmin (DEC-02)</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Zamknij symulator Garmin"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Wybór modelu Garmin */}
          <Text style={styles.sectionHeader}>MODEL ZEGARKA GARMIN</Text>
          <View style={styles.modelChips}>
            {(['forerunner_965', 'fenix_7', 'venu_3'] as GarminWatchModel[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modelChip, watchModel === m && styles.modelChipActive]}
                onPress={() => setWatchModel(m)}
                accessibilityLabel={`Wybierz model ${modelLabels[m]}`}
                accessibilityRole="button"
              >
                <Text style={[styles.modelChipText, watchModel === m && styles.modelChipTextActive]}>
                  {m === 'forerunner_965' ? 'Forerunner 965' : m === 'fenix_7' ? 'Fēnix 7' : 'Venu 3'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Symulacja zegarka - okrągła tarcza z fizycznymi przyciskami */}
          <View style={styles.watchBezelWrapper}>
            {/* Lewe przyciski (UP / DOWN) */}
            <View style={styles.leftButtonsCol}>
              <TouchableOpacity
                style={styles.hardwareButton}
                onPress={() => handleButtonPress('KEY_UP')}
                accessibilityLabel="Przycisk UP zegarka Garmin"
                accessibilityRole="button"
              >
                <Text style={styles.hardwareButtonText}>▲ UP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hardwareButton}
                onPress={() => handleButtonPress('KEY_DOWN')}
                accessibilityLabel="Przycisk DOWN zegarka Garmin"
                accessibilityRole="button"
              >
                <Text style={styles.hardwareButtonText}>▼ DOWN</Text>
              </TouchableOpacity>
            </View>

            {/* Centralna tarcza */}
            <TouchableOpacity
              style={styles.watchDial}
              activeOpacity={0.9}
              onPress={() => handleButtonPress('TOUCH_TAP')}
              accessibilityLabel="Dotknij ekran zegarka Garmin aby naliczyć rząd"
              accessibilityRole="button"
            >
              {/* Status bar zegarka */}
              <View style={styles.watchStatusBar}>
                <Text style={styles.watchStatusText}>
                  {isOffline ? '⚠️ BLE Offline' : '🛰️ BLE Połączono'}
                </Text>
                <Text style={styles.watchBatteryText}>{batteryPercent}% 🔋</Text>
              </View>

              {/* Informacje o robótce */}
              <Text style={styles.watchProjectName} numberOfLines={1}>
                {syncPayload.projectName}
              </Text>
              <Text style={styles.watchPartName} numberOfLines={1}>
                {syncPayload.partName}
              </Text>

              {/* Główny licznik rzędów */}
              <View style={styles.counterCircle}>
                <Text style={styles.watchCounterValue}>{syncPayload.currentCount}</Text>
                <Text style={styles.watchUnitText}>{syncPayload.unitLabel}</Text>
              </View>

              {/* Pasek postępu */}
              {syncPayload.targetCount > 0 && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Cel: {syncPayload.targetCount} ({percentProgress}%)
                  </Text>
                </View>
              )}

              {/* Warkocz / cykl powiązany */}
              {syncPayload.linkedPatternName && (
                <View style={styles.linkedBadge}>
                  <Text style={styles.linkedBadgeText}>
                    🪢 {syncPayload.linkedPatternName}
                    {syncPayload.linkedPatternCycle
                      ? ` (${syncPayload.linkedPatternStep ?? 0}/${syncPayload.linkedPatternCycle})`
                      : ''}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Prawe przyciski (START/STOP / BACK/LAP) */}
            <View style={styles.rightButtonsCol}>
              <TouchableOpacity
                style={[styles.hardwareButton, styles.startButton]}
                onPress={() => handleButtonPress('KEY_START_STOP')}
                accessibilityLabel="Przycisk START STOP zegarka Garmin (+1 rząd)"
                accessibilityRole="button"
              >
                <Text style={styles.startButtonText}>START (+1)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.hardwareButton, styles.lapButton]}
                onPress={() => handleButtonPress('KEY_LAP')}
                accessibilityLabel="Przycisk LAP BACK zegarka Garmin (Cofnij)"
                accessibilityRole="button"
              >
                <Text style={styles.lapButtonText}>BACK (-1)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Panel testowania trybu Offline BLE i kolejki zdarzeń */}
          <View style={styles.offlineCard}>
            <View style={styles.offlineHeaderRow}>
              <Text style={styles.offlineTitle}>Kolejka Zdarzeń Offline (Garmin BLE)</Text>
              <TouchableOpacity
                style={[styles.offlineToggle, isOffline && styles.offlineToggleActive]}
                onPress={() => setIsOffline(!isOffline)}
                accessibilityLabel="Przełącz tryb offline Garmin"
                accessibilityRole="button"
              >
                <Text style={[styles.offlineToggleText, isOffline && styles.offlineToggleTextActive]}>
                  {isOffline ? 'Tryb Offline: WŁ' : 'Tryb Offline: WYŁ'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.offlineHint}>
              Gdy zegarek straci zasięg Bluetooth, zdarzenia przycisków trafiają do kolejki offline
              ConnectIQ. Po ponownym połączeniu zostają wysłane paczką.
            </Text>

            {queuedCount > 0 && (
              <TouchableOpacity
                style={styles.flushButton}
                onPress={handleFlushOffline}
                accessibilityLabel="Zsynchronizuj zdarzenia z kolejki offline"
                accessibilityRole="button"
              >
                <Text style={styles.flushButtonText}>
                  🔄 Wyślij zbuforowane zdarzenia ({queuedCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Ciemny motyw Garmin MIP / AMOLED
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38BDF8', // Garmin blue / cyan
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 22,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  modelChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  modelChip: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  modelChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  modelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  modelChipTextActive: {
    color: '#FFFFFF',
  },
  watchBezelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  leftButtonsCol: {
    gap: 20,
    marginRight: 8,
  },
  rightButtonsCol: {
    gap: 20,
    marginLeft: 8,
  },
  hardwareButton: {
    minHeight: 48,
    minWidth: 54,
    paddingHorizontal: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hardwareButtonText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  startButton: {
    backgroundColor: '#059669', // Zielony akcent start Garmin
    borderColor: '#10B981',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  lapButton: {
    backgroundColor: '#DC2626', // Czerwony powrót
    borderColor: '#EF4444',
  },
  lapButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  watchDial: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#020617',
    borderWidth: 4,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    elevation: 8,
  },
  watchStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginBottom: 6,
  },
  watchStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  watchBatteryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  watchProjectName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  watchPartName: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  counterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  watchCounterValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  watchUnitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  linkedBadge: {
    marginTop: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkedBadgeText: {
    fontSize: 10,
    color: '#FCD34D',
    fontWeight: '700',
  },
  offlineCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  offlineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  offlineToggle: {
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineToggleActive: {
    backgroundColor: '#F59E0B',
  },
  offlineToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  offlineToggleTextActive: {
    color: '#0F172A',
  },
  offlineHint: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  flushButton: {
    marginTop: 12,
    minHeight: 44,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flushButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
