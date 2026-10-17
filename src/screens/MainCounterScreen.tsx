/**
 * Oczko UI — Główny ekran licznika (Minimalistyczny, wolny od rozpraszaczy)
 * Integruje przełączanie części i synchroniczne liczniki powiązane (BR-PROJ-002, BR-LICZ-003, BR-LICZ-005).
 */

import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
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
import { LinkedCounterModal } from '../components/LinkedCounterModal';
import { IntervalConfigModal } from '../components/IntervalConfigModal';
import { KnitProofOverlay } from '../components/KnitProofOverlay';
import { styles } from './MainCounterScreen.styles';
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
        <KnitProofOverlay
          projectName={projectName}
          partName={partName}
          counterValue={counterValue}
          targetRows={projectParts.find((p) => p.id === activePartId)?.targetRows}
          activeLinkedStates={activeLinkedStates}
          showReminder={showReminder}
          reminderMessage={reminderMessage}
          onExit={() => setIsKnitProof(false)}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      ) : (
        <>
          {/* Baner odzyskiwania uszkodzonego stanu (BR-TEST-023) */}
          {projectCtx?.recovery && (
            <View
              testID="recovery-banner"
              accessibilityRole="alert"
              style={{
                backgroundColor: '#FEF3C7',
                borderColor: '#F59E0B',
                borderWidth: 1,
                padding: 12,
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: '#92400E', fontWeight: 'bold', fontSize: 13 }}>
                  ⚠️ Odzyskiwanie stanu
                </Text>
                <Text style={{ color: '#B45309', fontSize: 12 }}>
                  Wykryto uszkodzone dane przy starcie. Zachowano kopię awaryjną.
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Zamknij baner odzyskiwania"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 6, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => projectCtx?.dismissRecoveryBanner()}
              >
                <Text style={{ color: '#92400E', fontWeight: '600' }}>Zamknij</Text>
              </TouchableOpacity>
            </View>
          )}

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
      <LinkedCounterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        partName={partName}
        newLinkedName={newLinkedName}
        setNewLinkedName={setNewLinkedName}
        newModuloCycle={newModuloCycle}
        setNewModuloCycle={setNewModuloCycle}
        newReminderRow={newReminderRow}
        setNewReminderRow={setNewReminderRow}
        onCreateLinkedCounter={handleCreateLinkedCounter}
      />

      {/* Modal konfiguracji powiadomienia interwałowego (BR-LICZ-003, BR-SYS-011) */}
      <IntervalConfigModal
        visible={intervalModalVisible}
        onClose={() => setIntervalModalVisible(false)}
        tempIntervalInput={tempIntervalInput}
        setTempIntervalInput={setTempIntervalInput}
        tempLabelInput={tempLabelInput}
        setTempLabelInput={setTempLabelInput}
        onSave={() => {
          const parsed = parseInt(tempIntervalInput, 10);
          setIntervalReminderRows(!isNaN(parsed) && parsed > 0 ? parsed : 0);
          setIntervalReminderLabel(tempLabelInput.trim() || t('Przypomnienie'));
          setIntervalModalVisible(false);
        }}
      />

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


