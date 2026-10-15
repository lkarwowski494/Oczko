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

  const handleIncrement = () => {
    if (isConnectedToContext) {
      projectCtx!.stepCounter('increment');
    } else {
      fallbackFacade.stepCounter('counter_main', 'increment', 'iphone', Date.now(), 300);
      setLocalFallbackState(fallbackFacade.getCounterState('counter_main'));
    }
  };

  const handleDecrement = () => {
    if (isConnectedToContext) {
      projectCtx!.undoCounter();
    } else {
      fallbackFacade.undoLast('counter_main', 'iphone', Date.now());
      setLocalFallbackState(fallbackFacade.getCounterState('counter_main'));
    }
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

          {/* Główny obszar klikalny – duża, wolna od rozpraszaczy karta licznika */}
          <TouchableOpacity style={styles.counterCard} activeOpacity={0.9} onPress={handleIncrement}>
            <Text style={styles.counterValue}>{counterValue}</Text>
            <Text style={styles.counterHint}>Stuknij, aby dodać rząd</Text>
            {activeReminder && (
              <View style={styles.reminderBadge}>
                <Text style={styles.reminderText}>⚠️ Ważny rząd / przypomnienie</Text>
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
});

