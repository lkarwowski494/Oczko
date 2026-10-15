/**
 * Oczko UI — Główny ekran licznika (Minimalistyczny, wolny od rozpraszaczy)
 * Integruje przełączanie części i synchroniczne liczniki powiązane (BR-PROJ-002, BR-LICZ-003, BR-LICZ-005).
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectManagerFacade } from '../core/project-facade';
import { useProject, ProjectContextValue } from '../core/project-context';
import PatternGuideViewer from '../components/PatternGuideViewer';
import { triggerHaptic, checkIntervalReminder } from '../core/feedback-service';

// Fallback dla izolowanych testów komponentu
const fallbackFacade = new ProjectManagerFacade('proj_demo', 'Mój Sweter');
fallbackFacade.registerCounter({
  id: 'counter_main',
  partId: 'part_body',
  name: 'Rzędy korpusu',
  targetValue: 100,
  reminderRows: [10, 20, 30],
});

export default function MainCounterScreen() {
  let projectCtx: ProjectContextValue | null = null;
  try {
    projectCtx = useProject();
  } catch (_e) {
    projectCtx = null;
  }

  const [localFallbackState, setLocalFallbackState] = useState(
    fallbackFacade.getCounterState('counter_main')
  );

  const [viewMode, setViewMode] = useState<'counter' | 'pattern'>('counter');
  const [modalVisible, setModalVisible] = useState(false);
  const [newLinkedName, setNewLinkedName] = useState('Warkocz');
  const [newModuloCycle, setNewModuloCycle] = useState('6');
  const [newReminderRow, setNewReminderRow] = useState('6');

  // Przypomnienia interwałowe i sygnały haptyczne (BR-LICZ-003, BR-SYS-011)
  const [intervalReminderRows, setIntervalReminderRows] = useState<number>(0);
  const [intervalReminderLabel, setIntervalReminderLabel] = useState<string>('Zmiana splotu / nitki');
  const [intervalModalVisible, setIntervalModalVisible] = useState<boolean>(false);
  const [tempIntervalInput, setTempIntervalInput] = useState<string>('6');
  const [tempLabelInput, setTempLabelInput] = useState<string>('Zmiana splotu / nitki');

  const isConnectedToContext = Boolean(projectCtx && projectCtx.activeProject);

  const projectName = isConnectedToContext
    ? projectCtx!.activeProject!.name
    : 'Mój Sweter';

  const partName = isConnectedToContext
    ? projectCtx!.activePartName ?? 'Rzędy korpusu'
    : 'Rzędy korpusu';

  const counterValue = isConnectedToContext
    ? (projectCtx!.activeCounterState?.rawValue ?? 0)
    : localFallbackState.rawValue;

  const activeReminder = isConnectedToContext
    ? (projectCtx!.activeCounterState?.activeReminder ?? false)
    : localFallbackState.activeReminder;

  const projectParts = projectCtx?.activeProject?.parts ?? [];
  const activePartId = projectCtx?.activePartId ?? null;
  const activeCounterId = projectCtx?.activeCounterId ?? null;
  const activeLinkedStates = projectCtx?.activeLinkedCounterStates ?? [];

  const intervalCheck = checkIntervalReminder(counterValue, intervalReminderRows, undefined, intervalReminderLabel);
  const showReminder = activeReminder || intervalCheck.shouldRemind;
  const reminderMessage = intervalCheck.shouldRemind
    ? (intervalCheck.reason || '🔔 Przypomnienie interwałowe!')
    : '⚠️ Ważny rząd / przypomnienie';

  const handleIncrement = () => {
    const nextValue = counterValue + 1;
    const targetRows = projectParts.find((p) => p.id === activePartId)?.targetRows;
    const isGoalReached = Boolean(targetRows && nextValue >= targetRows);
    const isIntervalHit = Boolean(intervalReminderRows > 0 && nextValue % intervalReminderRows === 0);

    if (isConnectedToContext) {
      projectCtx!.stepCounter('increment');
    } else {
      fallbackFacade.stepCounter('counter_main', 'increment', 'iphone', Date.now(), 300);
      setLocalFallbackState(fallbackFacade.getCounterState('counter_main'));
    }

    if (isGoalReached) {
      triggerHaptic('goal');
    } else if (isIntervalHit || activeReminder) {
      triggerHaptic('reminder');
    } else {
      const linkedCycleHit = activeLinkedStates.some(
        (ls) => ls.moduloCycle && ((ls.cycleStep ?? 0) + 1) % ls.moduloCycle === 0
      );
      if (linkedCycleHit) {
        triggerHaptic('cycle');
      } else {
        triggerHaptic('step');
      }
    }
  };

  const handleDecrement = () => {
    if (isConnectedToContext) {
      projectCtx!.undoCounter();
    } else {
      fallbackFacade.undoLast('counter_main', 'iphone', Date.now());
      setLocalFallbackState(fallbackFacade.getCounterState('counter_main'));
    }
    triggerHaptic('undo');
  };

  const handleCreateLinkedCounter = async () => {
    if (!newLinkedName.trim() || !activePartId || !activeCounterId || !projectCtx) return;
    const modulo = parseInt(newModuloCycle, 10);
    const reminder = parseInt(newReminderRow, 10);

    await projectCtx.addLinkedCounter(activePartId, activeCounterId, {
      name: newLinkedName.trim(),
      moduloCycle: !isNaN(modulo) && modulo > 0 ? modulo : undefined,
      reminderRows: !isNaN(reminder) && reminder > 0 ? [reminder] : undefined,
    });

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nagłówek projektu */}
      <View style={styles.header}>
        <Text style={styles.projectTitle}>{projectName}</Text>
        <Text style={styles.partTitle}>{partName}</Text>
      </View>

      {/* Przełącznik trybu: Licznik vs Schemat z linijką */}
      <View style={styles.viewModeTabs}>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'counter' && styles.viewModeTabActive]}
          onPress={() => setViewMode('counter')}
        >
          <Text
            style={[
              styles.viewModeTabText,
              viewMode === 'counter' && styles.viewModeTabTextActive,
            ]}
          >
            🔢 Licznik
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'pattern' && styles.viewModeTabActive]}
          onPress={() => setViewMode('pattern')}
        >
          <Text
            style={[
              styles.viewModeTabText,
              viewMode === 'pattern' && styles.viewModeTabTextActive,
            ]}
          >
            📜 Schemat & Linijka
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'pattern' ? (
        <PatternGuideViewer
          activeCounterRow={counterValue}
          onStepCounter={(direction) => {
            if (direction === 'increment') handleIncrement();
            else handleDecrement();
          }}
        />
      ) : (
        <>
          {/* Przełącznik części projektu (jeśli projekt ma więcej niż 1 część) */}
          {projectParts.length > 1 && (
            <View style={styles.partsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partsScroll}
              >
                {projectParts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.partChip, p.id === activePartId && styles.partChipActive]}
                    onPress={() => projectCtx?.switchActivePart(p.id)}
                  >
                    <Text
                      style={[
                        styles.partChipText,
                        p.id === activePartId && styles.partChipTextActive,
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Liczniki powiązane (np. warkocze, powtórzenia ażuru) */}
          {activeLinkedStates.length > 0 && (
            <View style={styles.linkedCountersWrapper}>
              {activeLinkedStates.map((lc) => (
                <View key={lc.counterId} style={styles.linkedCard}>
                  <View style={styles.linkedCardHeader}>
                    <Text style={styles.linkedName}>🪢 {lc.name}</Text>
                    {lc.activeReminder && (
                      <View style={styles.linkedAlert}>
                        <Text style={styles.linkedAlertText}>⚠️ Skrzyżuj / Operacja!</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.linkedValue}>
                    {lc.moduloCycle
                      ? `Rząd ${lc.cycleStep ?? 0} z ${lc.moduloCycle} (Ukończono cykli: ${lc.completedCycles ?? 0})`
                      : `Rząd: ${lc.rawValue}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Pasek szybkiej konfiguracji przypomnienia cyklicznego */}
          <TouchableOpacity
            style={styles.intervalChip}
            activeOpacity={0.8}
            onPress={() => {
              setTempIntervalInput(intervalReminderRows > 0 ? String(intervalReminderRows) : '6');
              setTempLabelInput(intervalReminderLabel);
              setIntervalModalVisible(true);
            }}
          >
            <Text style={styles.intervalChipText}>
              {intervalReminderRows > 0
                ? `🔔 Przypomnienie: co ${intervalReminderRows} rz. (${intervalReminderLabel})`
                : '🔔 Ustaw przypomnienie cykliczne'}
            </Text>
          </TouchableOpacity>

          {/* Główny obszar klikalny – duża, wolna od rozpraszaczy karta licznika */}
          <TouchableOpacity style={styles.counterCard} activeOpacity={0.9} onPress={handleIncrement}>
            <Text style={styles.counterValue}>{counterValue}</Text>
            <Text style={styles.counterHint}>Stuknij, aby dodać rząd</Text>
            {showReminder && (
              <View style={styles.reminderBadge}>
                <Text style={styles.reminderText}>{reminderMessage}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Stopka z przyciskami UNDO oraz dodawania licznika warkocza */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.undoButton} onPress={handleDecrement}>
              <Text style={styles.undoButtonText}>Cofnij ostatni (Undo)</Text>
            </TouchableOpacity>

            {isConnectedToContext && (
              <TouchableOpacity
                style={styles.addLinkedButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addLinkedButtonText}>+ Licznik wzoru (warkocz/ażur)</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}


      {/* Modal definiowania powiązanego licznika wzoru */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dodaj powiązany licznik wzoru</Text>
            <Text style={styles.modalSubtitle}>
              Licznik będzie automatycznie naliczał się wraz z rzędami części: {partName}
            </Text>

            <Text style={styles.inputLabel}>Nazwa wzoru (np. Warkocz C6F, Ażur)</Text>
            <TextInput
              style={styles.textInput}
              value={newLinkedName}
              onChangeText={setNewLinkedName}
              placeholder="np. Warkocz na rękawie"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Długość cyklu / powtórzenia (np. 6 rzędów)</Text>
            <TextInput
              style={styles.textInput}
              value={newModuloCycle}
              onChangeText={setNewModuloCycle}
              keyboardType="numeric"
              placeholder="np. 6"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Rząd z przypomnieniem o operacji</Text>
            <TextInput
              style={styles.textInput}
              value={newReminderRow}
              onChangeText={setNewReminderRow}
              keyboardType="numeric"
              placeholder="np. 6"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateLinkedCounter}
              >
                <Text style={styles.submitButtonText}>Dodaj licznik</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal konfiguracji powiadomienia interwałowego (BR-LICZ-003, BR-SYS-011) */}
      <Modal
        visible={intervalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIntervalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Przypomnienie cykliczne (Interwał)</Text>
            <Text style={styles.modalSubtitle}>
              Otrzymasz wibrację i powiadomienie na ekranie co wybraną liczbę rzędów.
            </Text>

            <Text style={styles.inputLabel}>Szybki wybór interwału:</Text>
            <View style={styles.intervalPresetsRow}>
              {[0, 4, 6, 8, 10, 12].map((cnt) => {
                const isSelected =
                  cnt === 0 ? tempIntervalInput === '0' : tempIntervalInput === String(cnt);
                return (
                  <TouchableOpacity
                    key={cnt}
                    style={[styles.presetButton, isSelected && styles.presetButtonActive]}
                    onPress={() => setTempIntervalInput(String(cnt))}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        isSelected && styles.presetButtonTextActive,
                      ]}
                    >
                      {cnt === 0 ? 'Wyłącz' : `co ${cnt}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Liczba rzędów (własna wartość):</Text>
            <TextInput
              style={styles.textInput}
              value={tempIntervalInput}
              onChangeText={setTempIntervalInput}
              keyboardType="numeric"
              placeholder="np. 6"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Etykieta powiadomienia:</Text>
            <TextInput
              style={styles.textInput}
              value={tempLabelInput}
              onChangeText={setTempLabelInput}
              placeholder="np. Zmiana splotu / nitki"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIntervalModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  const parsed = parseInt(tempIntervalInput, 10);
                  setIntervalReminderRows(!isNaN(parsed) && parsed > 0 ? parsed : 0);
                  setIntervalReminderLabel(tempLabelInput.trim() || 'Przypomnienie');
                  setIntervalModalVisible(false);
                }}
              >
                <Text style={styles.submitButtonText}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  projectTitle: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  partTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  partsWrapper: {
    marginTop: 10,
    marginBottom: 4,
  },
  partsScroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  partChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
  },
  partChipActive: {
    backgroundColor: '#8B5E3C',
  },
  partChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555555',
  },
  partChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  linkedCountersWrapper: {
    marginTop: 8,
    gap: 6,
  },
  linkedCard: {
    backgroundColor: '#FAF5F0',
    borderWidth: 1,
    borderColor: '#EFE2D6',
    borderRadius: 12,
    padding: 10,
  },
  linkedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  linkedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5E3C',
  },
  linkedValue: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  linkedAlert: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkedAlertText: {
    color: '#856404',
    fontSize: 10,
    fontWeight: '700',
  },
  counterCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    padding: 20,
  },
  counterValue: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  counterHint: {
    fontSize: 14,
    color: '#888888',
    marginTop: 10,
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
  footer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  undoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    width: '100%',
    alignItems: 'center',
  },
  undoButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  addLinkedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addLinkedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#8B5E3C',
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewModeTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: '#F0ECE8',
    borderRadius: 12,
    padding: 3,
  },
  viewModeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  viewModeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
  },
  viewModeTabTextActive: {
    color: '#8B5E3C',
    fontWeight: '700',
  },
  intervalChip: {
    alignSelf: 'center',
    backgroundColor: '#F7EFEA',
    borderWidth: 1,
    borderColor: '#D8C8BE',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  intervalChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  intervalPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0ECE8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  presetButtonActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

