/**
 * Oczko UI — Główny ekran licznika (Minimalistyczny, wolny od rozpraszaczy)
 * Integruje przełączanie części i synchroniczne liczniki powiązane (BR-PROJ-002, BR-LICZ-003, BR-LICZ-005).
 */

import React, { useState, useEffect } from 'react';
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
import { useLang, t } from '../core/i18n';
import PatternGuideViewer from '../components/PatternGuideViewer';
import PatternPdfViewer from '../components/PatternPdfViewer';
import AppleWatchCompanionModal from '../components/AppleWatchCompanionModal';
import { GarminCompanionModal } from '../components/GarminCompanionModal';
import KnittingTimeTracker from '../components/KnittingTimeTracker';
import { triggerHaptic, checkIntervalReminder } from '../core/feedback-service';
import { createWatchCounterSnapshot } from '../core/apple-watch-service';
import { createGarminSyncPayload } from '../core/garmin-service';
import {
  PatternDocument,
  getPatternDocumentForProject,
  insertPatternDocument,
  updatePatternRuler,
  deletePatternDocument,
} from '../core/pattern-document-service';
import { useAppAccess } from '../core/app-access-context';
import { ImpulsePaywallModal } from '../components/ImpulsePaywallModal';
import { autoBackup } from '../core/backup-service';
import { OnboardingModal } from '../components/OnboardingModal';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
  CraftProfile,
  setCraftProfile,
} from '../core/database';

let KeepAwakeModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  KeepAwakeModule = require('expo-keep-awake');
} catch (_e) {
  KeepAwakeModule = null;
}

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

  const {
    evaluation,
    openPaywall,
    closePaywall,
    isPaywallVisible,
    purchasePlan,
    restore,
  } = useAppAccess();

  const [localFallbackState, setLocalFallbackState] = useState(
    fallbackFacade.getCounterState('counter_main')
  );

  const _lang = useLang();
  const [isKnitProof, setIsKnitProof] = useState<boolean>(false);

  useEffect(() => {
    if (isKnitProof) {
      if (KeepAwakeModule?.activateKeepAwakeAsync) {
        KeepAwakeModule.activateKeepAwakeAsync().catch(() => {});
      }
    } else {
      if (KeepAwakeModule?.deactivateKeepAwake) {
        KeepAwakeModule.deactivateKeepAwake();
      }
    }
    return () => {
      if (KeepAwakeModule?.deactivateKeepAwake) {
        KeepAwakeModule.deactivateKeepAwake();
      }
    };
  }, [isKnitProof]);

  const [viewMode, setViewMode] = useState<'counter' | 'pattern' | 'pdf'>('counter');
  const [patternDoc, setPatternDoc] = useState<PatternDocument | null>(null);
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

  // Apple Watch & Live Activities (DEC-03, BR-SYS-003)
  const [watchModalVisible, setWatchModalVisible] = useState<boolean>(false);
  const [garminModalVisible, setGarminModalVisible] = useState<boolean>(false);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState<boolean>(false);

  useEffect(() => {
    if (projectCtx?.db) {
      isOnboardingCompleted(projectCtx.db)
        .then((completed) => {
          if (!completed) {
            setIsOnboardingVisible(true);
          }
        })
        .catch(() => {});
    }
  }, [projectCtx?.db]);

  const handleOnboardingComplete = async (profile: CraftProfile) => {
    setIsOnboardingVisible(false);
    if (projectCtx?.db) {
      try {
        await setCraftProfile(projectCtx.db, profile);
        await setOnboardingCompleted(projectCtx.db, true);
      } catch (err) {
        console.error('Błąd zapisu profilu onboarding:', err);
      }
    }
  };

  // Ładowanie zaimportowanego wzoru PDF dla aktywnego projektu (BR-WZOR-001, DEC-09)
  useEffect(() => {
    if (projectCtx?.db && projectCtx?.activeProject?.id) {
      getPatternDocumentForProject(projectCtx.db, projectCtx.activeProject.id)
        .then((loaded) => setPatternDoc(loaded))
        .catch(() => {});
    }
  }, [projectCtx?.db, projectCtx?.activeProject?.id]);

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

  // Zrzut stanu dla Apple Watch & Smart Stack (DEC-03, BR-SYS-003)
  const watchSnapshot = createWatchCounterSnapshot({
    projectId: isConnectedToContext ? projectCtx!.activeProject!.id : 'proj_demo',
    projectName,
    partId: activePartId || 'part_main',
    partName,
    counterId: activeCounterId || 'counter_main',
    counterName: 'Rzędy',
    counterState: {
      rawValue: counterValue,
      targetValue: projectParts.find((p) => p.id === activePartId)?.targetRows,
      activeReminder: showReminder,
      reminderRows: intervalReminderRows > 0 ? [intervalReminderRows] : [],
      isGoalReached: false,
      history: [],
    },
    reminderReason: showReminder ? reminderMessage : undefined,
  });

  // Ładunek synchronizacji dla Garmin ConnectIQ Companion (DEC-02)
  const garminPayload = createGarminSyncPayload({
    counterId: activeCounterId || 'counter_main',
    projectName,
    partName,
    currentCount: counterValue,
    targetCount: (projectParts.find((p) => p.id === activePartId)?.targetRows) ?? 0,
    unitLabel: 'rząd',
    linkedPatternName: activeLinkedStates[0]?.name,
    linkedPatternCycle: activeLinkedStates[0]?.moduloCycle ?? undefined,
    linkedPatternStep: activeLinkedStates[0]?.cycleStep != null ? activeLinkedStates[0].cycleStep : undefined,
  });

  const activePartIndex = projectParts.findIndex((p) => p.id === activePartId);
  const handleNextPart = () => {
    if (activePartIndex >= 0 && activePartIndex < projectParts.length - 1) {
      projectCtx?.switchActivePart(projectParts[activePartIndex + 1].id);
    }
  };
  const handlePreviousPart = () => {
    if (activePartIndex > 0) {
      projectCtx?.switchActivePart(projectParts[activePartIndex - 1].id);
    }
  };

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
    if (!evaluation.canCreateNewProject) {
      setModalVisible(false);
      openPaywall();
      return;
    }
    const modulo = parseInt(newModuloCycle, 10);
    const reminder = parseInt(newReminderRow, 10);

    await projectCtx.addLinkedCounter(activePartId, activeCounterId, {
      name: newLinkedName.trim(),
      moduloCycle: !isNaN(modulo) && modulo > 0 ? modulo : undefined,
      reminderRows: !isNaN(reminder) && reminder > 0 ? [reminder] : undefined,
    });

    setModalVisible(false);
  };

  const handleDocumentChange = async (updatedDoc: PatternDocument) => {
    setPatternDoc(updatedDoc);
    if (projectCtx?.db) {
      try {
        const existing = await getPatternDocumentForProject(
          projectCtx.db,
          projectCtx.activeProject?.id ?? ''
        );
        if (existing) {
          await updatePatternRuler(
            projectCtx.db,
            updatedDoc.id,
            updatedDoc.rulerYPercent,
            updatedDoc.currentPage
          );
        } else {
          if (!evaluation.canCreateNewProject) {
            openPaywall();
            return;
          }
          await insertPatternDocument(projectCtx.db, updatedDoc);
          autoBackup(projectCtx.db).catch(() => {});
        }
      } catch (_err) {
        // błąd zapisu do bazy (np. mock)
      }
    }
  };

  const handleDeleteDocument = async () => {
    if (patternDoc && projectCtx?.db) {
      try {
        await deletePatternDocument(projectCtx.db, patternDoc.id);
        autoBackup(projectCtx.db).catch(() => {});
      } catch (_err) {}
    }
    setPatternDoc(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isKnitProof ? (
        <View style={styles.knitProofContainer}>
          <View style={styles.knitProofTopBar}>
            <View>
              <Text style={styles.knitProofProjectName}>{projectName}</Text>
              <Text style={styles.knitProofPartName}>{partName}</Text>
            </View>
            <TouchableOpacity
              style={styles.exitKnitProofBtn}
              onPress={() => setIsKnitProof(false)}
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
              <Text style={styles.sacredNumberValue}>
                {projectParts.find((p) => p.id === activePartId)?.targetRows
                  ? `${Math.min(100, Math.round((counterValue / (projectParts.find((p) => p.id === activePartId)?.targetRows || 1)) * 100))}%`
                  : '—'}
              </Text>
            </View>
            <View style={styles.sacredDivider} />
            <View style={styles.sacredNumberItem}>
              <Text style={styles.sacredNumberLabel}>{t('Wzór / Krok')}</Text>
              <Text style={styles.sacredNumberValue}>
                {activeLinkedStates.length > 0 && activeLinkedStates[0].moduloCycle
                  ? `${activeLinkedStates[0].cycleStep ?? 0}/${activeLinkedStates[0].moduloCycle}`
                  : (activeLinkedStates.length > 0 ? `${activeLinkedStates[0].rawValue}` : '—')}
              </Text>
            </View>
            <View style={styles.sacredDivider} />
            <View style={styles.sacredNumberItem}>
              <Text style={styles.sacredNumberLabel}>{t('Pozostało')}</Text>
              <Text style={styles.sacredNumberValue}>
                {projectParts.find((p) => p.id === activePartId)?.targetRows
                  ? `${Math.max(0, (projectParts.find((p) => p.id === activePartId)?.targetRows || 0) - counterValue)}`
                  : '∞'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.knitProofTapArea}
            activeOpacity={0.9}
            onPress={handleIncrement}
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
              style={styles.knitProofUndoBtn}
              onPress={handleDecrement}
              onLongPress={handleDecrement}
              delayLongPress={500}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={t('Cofnij ostatni (Undo)')}
            >
              <Text style={styles.knitProofUndoBtnText}>↩️ {t('Cofnij ostatni (Undo)')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Nagłówek projektu */}
          <View style={styles.header}>
            <Text style={styles.projectTitle}>{projectName}</Text>
            <Text style={styles.partTitle}>{partName}</Text>
          </View>

          {/* Przełącznik trybu: Licznik vs Schemat z linijką vs Wzór PDF */}
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
                🔢 {t('Licznik')}
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
                📜 {t('Schemat & Linijka')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeTab, viewMode === 'pdf' && styles.viewModeTabActive]}
              onPress={() => setViewMode('pdf')}
            >
              <Text
                style={[
                  styles.viewModeTabText,
                  viewMode === 'pdf' && styles.viewModeTabTextActive,
                ]}
              >
                📑 {t('Wzór PDF')}
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
          ) : viewMode === 'pdf' ? (
            <PatternPdfViewer
              initialDocument={patternDoc}
              activeCounterRow={counterValue}
              projectId={projectCtx?.activeProject?.id}
              canImport={evaluation.canCreateNewProject}
              onRestrictedAction={openPaywall}
              onDocumentChange={handleDocumentChange}
              onDeleteDocument={handleDeleteDocument}
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
                            <Text style={styles.linkedAlertText}>{t('⚠️ Skrzyżuj / Operacja!')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.linkedValue}>
                        {lc.moduloCycle
                          ? `${t('Rząd')} ${lc.cycleStep ?? 0} ${t('z')} ${lc.moduloCycle} (${t('Ukończono cykli:')} ${lc.completedCycles ?? 0})`
                          : `${t('Rząd:')} ${lc.rawValue}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stoper sesji robótki i pomiar tempa na żywo (BR-CZAS-001..004) */}
              <KnittingTimeTracker
                projectId={projectCtx?.activeProject?.id ?? 'proj_demo'}
                targetRows={projectParts.find((p) => p.id === activePartId)?.targetRows}
                currentRows={counterValue}
                db={projectCtx?.db}
              />

              {/* Pasek szybkiej konfiguracji przypomnienia cyklicznego oraz Apple Watch (DEC-03) */}
              <View style={styles.accessoryChipsRow}>
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
                      ? `🔔 ${t('Przypomnienie: co')} ${intervalReminderRows} ${t('rz.')} (${intervalReminderLabel})`
                      : `🔔 ${t('Ustaw przypomnienie cykliczne')}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.watchChip}
                  activeOpacity={0.8}
                  onPress={() => setWatchModalVisible(true)}
                >
                  <Text style={styles.watchChipText}>⌚ Apple Watch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.garminChip}
                  activeOpacity={0.8}
                  onPress={() => setGarminModalVisible(true)}
                  accessibilityLabel={t('Otwórz symulator zegarka Garmin')}
                  accessibilityRole="button"
                >
                  <Text style={styles.garminChipText}>🛰️ Garmin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.knitProofChip}
                  activeOpacity={0.8}
                  onPress={() => setIsKnitProof(true)}
                  accessibilityLabel={t('Tryb Knit-Proof')}
                  accessibilityRole="button"
                >
                  <Text style={styles.knitProofChipText}>🧶 {t('Tryb Knit-Proof')}</Text>
                </TouchableOpacity>
              </View>

              {/* Główny obszar klikalny – duża, wolna od rozpraszaczy karta licznika */}
              <TouchableOpacity style={styles.counterCard} activeOpacity={0.9} onPress={handleIncrement}>
                <Text style={styles.counterValue}>{counterValue}</Text>
                <Text style={styles.counterHint}>{t('Stuknij, aby dodać rząd')}</Text>
                {showReminder && (
                  <View style={styles.reminderBadge}>
                    <Text style={styles.reminderText}>{reminderMessage}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Stopka z przyciskami UNDO oraz dodawania licznika warkocza */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.undoButton} onPress={handleDecrement}>
                  <Text style={styles.undoButtonText}>{t('Cofnij ostatni (Undo)')}</Text>
                </TouchableOpacity>

                {isConnectedToContext && (
                  <TouchableOpacity
                    style={styles.addLinkedButton}
                    onPress={() => {
                      if (!evaluation.canCreateNewProject) {
                        openPaywall();
                        return;
                      }
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.addLinkedButtonText}>{t('+ Licznik wzoru (warkocz/ażur)')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
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
            <Text style={styles.modalTitle}>{t('Dodaj powiązany licznik wzoru')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('Licznik będzie automatycznie naliczał się wraz z rzędami części:')} {partName}
            </Text>

            <Text style={styles.inputLabel}>{t('Nazwa wzoru (np. Warkocz C6F, Ażur)')}</Text>
            <TextInput
              style={styles.textInput}
              value={newLinkedName}
              onChangeText={setNewLinkedName}
              placeholder={t('np. Warkocz na rękawie')}
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>{t('Długość cyklu / powtórzenia (np. 6 rzędów)')}</Text>
            <TextInput
              style={styles.textInput}
              value={newModuloCycle}
              onChangeText={setNewModuloCycle}
              keyboardType="numeric"
              placeholder="np. 6"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>{t('Rząd z przypomnieniem o operacji')}</Text>
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
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={t('Anuluj')}
              >
                <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateLinkedCounter}
              >
                <Text style={styles.submitButtonText}>{t('Dodaj licznik')}</Text>
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
            <Text style={styles.modalTitle}>{t('Przypomnienie cykliczne (Interwał)')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('Otrzymasz wibrację i powiadomienie na ekranie co wybraną liczbę rzędów.')}
            </Text>

            <Text style={styles.inputLabel}>{t('Szybki wybór interwału:')}</Text>
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
                      {cnt === 0 ? t('Wyłącz') : `${t('co')} ${cnt}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>{t('Liczba rzędów (własna wartość):')}</Text>
            <TextInput
              style={styles.textInput}
              value={tempIntervalInput}
              onChangeText={setTempIntervalInput}
              keyboardType="numeric"
              placeholder="np. 6"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>{t('Etykieta powiadomienia:')}</Text>
            <TextInput
              style={styles.textInput}
              value={tempLabelInput}
              onChangeText={setTempLabelInput}
              placeholder={t('np. Zmiana splotu / nitki')}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIntervalModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={t('Anuluj')}
              >
                <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  const parsed = parseInt(tempIntervalInput, 10);
                  setIntervalReminderRows(!isNaN(parsed) && parsed > 0 ? parsed : 0);
                  setIntervalReminderLabel(tempLabelInput.trim() || t('Przypomnienie'));
                  setIntervalModalVisible(false);
                }}
              >
                <Text style={styles.submitButtonText}>{t('Zapisz')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Apple Watch & Live Activities (DEC-03) */}
      <AppleWatchCompanionModal
        visible={watchModalVisible}
        onClose={() => setWatchModalVisible(false)}
        snapshot={watchSnapshot}
        onStep={(direction) => {
          if (direction === 'increment') handleIncrement();
          else handleDecrement();
        }}
      />

      {/* Modal Garmin ConnectIQ Companion (DEC-02) */}
      <GarminCompanionModal
        visible={garminModalVisible}
        onClose={() => setGarminModalVisible(false)}
        syncPayload={garminPayload}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onNextPart={handleNextPart}
        onPreviousPart={handlePreviousPart}
      />

      {/* Paywall impulsowy Apps4Brew Studio */}
      <ImpulsePaywallModal
        visible={isPaywallVisible}
        onClose={closePaywall}
      />

      {/* Modal powitalny personalizacji rzemiosła (First Launch Onboarding) */}
      <OnboardingModal
        visible={isOnboardingVisible}
        onComplete={handleOnboardingComplete}
      />
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#8B5E3C',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  accessoryChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  watchChip: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  watchChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9F0A',
  },
  garminChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  garminChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
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
  knitProofChip: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  knitProofChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

