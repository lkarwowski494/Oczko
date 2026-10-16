import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProject, ProjectContextValue } from '../../src/core/project-context';
import { EnrichedProject } from '../../src/core/project-service';
import {
  CraftType,
  ProjectStatus,
  updateProjectStatus,
} from '../../src/core/project-repository';
import { listStashYarns, StashYarnRecord } from '../../src/core/stash-repository';
import GaugeCalculatorModal, {
  CreateProjectFromGaugeInput,
} from '../../src/components/GaugeCalculatorModal';
import ProjectShareCardModal from '../../src/components/ProjectShareCardModal';
import YarnUsageEstimatorModal from '../../src/components/YarnUsageEstimatorModal';
import { ShapingCalculatorModal } from '../../src/components/ShapingCalculatorModal';
import { EaseCalculatorModal } from '../../src/components/EaseCalculatorModal';
import { RaglanCalculatorModal } from '../../src/components/RaglanCalculatorModal';
import { HatCalculatorModal } from '../../src/components/HatCalculatorModal';
import { useAppAccess } from '../../src/core/app-access-context';
import { useLang, t } from '../../src/core/i18n';
import { useUnitSystem } from '../../src/core/use-unit-system';
import { formatGauge } from '../../src/core/unit-converter';

export default function ProjectsScreen() {
  const router = useRouter();
  const { evaluation, openPaywall } = useAppAccess();

  let projectCtx: ProjectContextValue | null = null;
  try {
    projectCtx = useProject();
  } catch (_e) {
    projectCtx = null;
  }

  // Modal nowego projektu
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newCraftType, setNewCraftType] = useState<CraftType>('knitting');
  const [newPartName, setNewPartName] = useState('Korpus');
  const [newTargetRows, setNewTargetRows] = useState('');

  // Modal kalkulatora próbki (Gauge)
  const [gaugeModalVisible, setGaugeModalVisible] = useState(false);

  // Modal kalkulatora luzu i doboru rozmiaru (Ease)
  const [easeModalVisible, setEaseModalVisible] = useState(false);

  // Modal kalkulatora konstrukcji raglanu i GSR
  const [raglanModalVisible, setRaglanModalVisible] = useState(false);

  // Modal kalkulatora korony czapki
  const [hatModalVisible, setHatModalVisible] = useState(false);

  // Modal karty podsumowania i udostępniania robótki
  const [selectedShareProject, setSelectedShareProject] = useState<EnrichedProject | null>(null);

  // Modal dodawania nowej części do istniejącego projektu
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);
  const [addedPartName, setAddedPartName] = useState('');
  const [addedPartTarget, setAddedPartTarget] = useState('');

  // Modal estymatora zużycia włóczki i Yarn Chicken
  const [yarnEstimatorVisible, setYarnEstimatorVisible] = useState(false);
  const [shapingModalVisible, setShapingModalVisible] = useState(false);
  const [estimatorInitialRows, setEstimatorInitialRows] = useState<{ completed: number; target: number } | undefined>();
  const [stashYarns, setStashYarns] = useState<StashYarnRecord[]>([]);

  useEffect(() => {
    if (projectCtx?.db) {
      listStashYarns(projectCtx.db).then(setStashYarns).catch(() => {});
    }
  }, [projectCtx?.db]);

  const projects = projectCtx?.projects ?? [];
  const activeProjectId = projectCtx?.activeProject?.id ?? null;

  const handleProjectStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    if (projectCtx?.db) {
      await updateProjectStatus(projectCtx.db, projectId, newStatus);
      await projectCtx.refreshProjects();
      const updated = projectCtx.projects.find((p) => p.id === projectId);
      if (updated) {
        setSelectedShareProject({ ...updated, status: newStatus });
      }
    }
  };

  const handleCreateProjectFromGauge = async (input: CreateProjectFromGaugeInput) => {
    if (!evaluation.canCreateNewProject) {
      openPaywall();
      return;
    }
    if (projectCtx) {
      await projectCtx.createProject({
        name: input.name,
        craftType: input.craftType,
        parts: [
          {
            name: 'Część główna',
            targetRows: input.targetRows,
          },
        ],
      });
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    if (!evaluation.canCreateNewProject) {
      openPaywall();
      return;
    }
    const targetRowsNum = parseInt(newTargetRows, 10);

    if (projectCtx) {
      await projectCtx.createProject({
        name: newProjectName.trim(),
        craftType: newCraftType,
        parts: [
          {
            name: newPartName.trim() || 'Część główna',
            targetRows: !isNaN(targetRowsNum) && targetRowsNum > 0 ? targetRowsNum : undefined,
          },
        ],
      });
    }

    setNewProjectName('');
    setNewPartName('Korpus');
    setNewTargetRows('');
    setModalVisible(false);
  };

  const handleAddPartSubmit = async () => {
    if (!addedPartName.trim() || !targetProjectId || !projectCtx) return;
    if (!evaluation.canCreateNewProject) {
      openPaywall();
      return;
    }
    const targetRowsNum = parseInt(addedPartTarget, 10);

    await projectCtx.addPart(targetProjectId, {
      name: addedPartName.trim(),
      targetRows: !isNaN(targetRowsNum) && targetRowsNum > 0 ? targetRowsNum : undefined,
    });

    setAddedPartName('');
    setAddedPartTarget('');
    setPartModalVisible(false);
    setTargetProjectId(null);
  };

  const handleSelectProject = async (project: EnrichedProject) => {
    if (!projectCtx) return;
    const counterId = project.parts[0]?.counters[0]?.id;
    if (counterId) {
      await projectCtx.selectActiveCounter(project.id, counterId);
    }
  };

  const handleOpenInCounter = async (project: EnrichedProject) => {
    await handleSelectProject(project);
    try {
      router.navigate('/(tabs)');
    } catch (_e) {
      // nawigacja w środowisku testowym
    }
  };

  const currentLang = useLang();
  const unitSystem = useUnitSystem();

  const renderProjectItem = ({ item }: { item: EnrichedProject }) => {
    const isSelected = item.id === activeProjectId;
    const primaryPart = item.parts[0];
    const primaryCounter = primaryPart?.counters[0];
    const currentRow = primaryCounter?.currentValue ?? 0;
    const targetRow = primaryPart?.targetRows;

    const progressPercent = targetRow && targetRow > 0
      ? Math.min(100, Math.round((currentRow / targetRow) * 100))
      : null;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardActive]}
        activeOpacity={0.8}
        onPress={() => handleSelectProject(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.projectName}>{item.name}</Text>
            {isSelected && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>{t('AKTYWNY')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.categoryBadge}>
            {item.craftType === 'knitting' ? t('DRUTY') : t('SZYDEŁKO')}
          </Text>
        </View>

        {/* Szczegółowa lista części w projekcie */}
        <View style={styles.partsSummaryContainer}>
          <Text style={styles.partsHeaderTitle}>{t('Części')}:</Text>
          {item.parts.map((part) => {
            const count = part.counters[0]?.currentValue ?? 0;
            return (
              <View key={part.id} style={styles.partDetailRow}>
                <Text style={styles.partDetailName}>• {part.name}</Text>
                <Text style={styles.partDetailCount}>
                  {count} {part.targetRows ? `/ ${part.targetRows} ${t('rz.')}` : t('rz.')}
                </Text>
              </View>
            );
          })}
        </View>

        {progressPercent !== null && (
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cardShareButton}
            onPress={() => {
              const part = item.parts[0];
              if (part) {
                setEstimatorInitialRows({
                  completed: part.counters[0]?.currentValue ?? 0,
                  target: part.targetRows ?? 200,
                });
              }
              setYarnEstimatorVisible(true);
            }}
          >
            <Text style={styles.cardShareButtonText}>{t('⚖️ Zużycie')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardShareButton}
            onPress={() => setSelectedShareProject(item)}
          >
            <Text style={styles.cardShareButtonText}>{t('📊 Karta')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addPartButton}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setTargetProjectId(item.id);
                setPartModalVisible(true);
              }
            }}
          >
            <Text style={styles.addPartButtonText}>{t('+ Część')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.openCounterButton}
            onPress={() => handleOpenInCounter(item)}
          >
            <Text style={styles.openCounterText}>{t('Licznik 🧶')}</Text>
          </TouchableOpacity>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>{t('Twoje Robótki')}</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
                return;
              }
              const activePart = projectCtx?.activeProject?.parts[0];
              if (activePart) {
                setEstimatorInitialRows({
                  completed: activePart.counters[0]?.currentValue ?? 0,
                  target: activePart.targetRows ?? 200,
                });
              }
              setYarnEstimatorVisible(true);
            }}
          >
            <Text style={styles.gaugeButtonText}>{t('⚖️ Zużycie')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setGaugeModalVisible(true);
              }
            }}
          >
            <Text style={styles.gaugeButtonText}>{t('📐 Próbka')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setShapingModalVisible(true);
              }
            }}
            accessibilityLabel={t('Otwórz kalkulator kształtowania i dodawania oczek')}
            accessibilityRole="button"
          >
            <Text style={styles.gaugeButtonText}>{t('✂️ Oczka')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setEaseModalVisible(true);
              }
            }}
            accessibilityLabel={t('Otwórz kalkulator luzu odzieżowego i doboru rozmiaru')}
            accessibilityRole="button"
          >
            <Text style={styles.gaugeButtonText}>{t('👕 Luz')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setRaglanModalVisible(true);
              }
            }}
            accessibilityLabel={t('Otwórz kalkulator konstrukcji raglanu i rzędów skróconych')}
            accessibilityRole="button"
          >
            <Text style={styles.gaugeButtonText}>{t('🥋 Raglan')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gaugeButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setHatModalVisible(true);
              }
            }}
            accessibilityLabel={t('Otwórz kalkulator korony czapki i ściągacza')}
            accessibilityRole="button"
          >
            <Text style={styles.gaugeButtonText}>{t('🧢 Czapka')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
              } else {
                setModalVisible(true);
              }
            }}
          >
            <Text style={styles.newButtonText}>{t('+ Nowy projekt')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pasek statusu dostępu i monetyzacji impulsowej Apps4Brew */}
      <View style={styles.accessStatusBar}>
        {evaluation.isPremium ? (
          <Text style={styles.accessStatusTextPremium}>
            ✨ Apps4Brew Studio Pass: {evaluation.activePlan === 'lifetime' ? t('Lifetime (Na zawsze)') : t('Aktywny')}
          </Text>
        ) : evaluation.canCreateNewProject ? (
          <Text style={styles.accessStatusTextTrial}>
            ⏳ Trial: {t('Zostało')} {evaluation.trialDaysRemaining} {t('dni')} ({evaluation.trialProjectsRemaining} {t('wolne projekty')})
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.accessStatusBannerExpired}
            onPress={openPaywall}
            accessibilityRole="button"
            accessibilityLabel={t('Odblokuj pełny dostęp')}
          >
            <Text style={styles.accessStatusTextExpired}>
              🔒 {t('Historia: Tylko do odczytu • Odblokuj pełny dostęp ($4.99/rok)')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('Brak aktywnych projektów')}</Text>
          </View>
        }
      />

      {/* Modal dodawania nowego projektu */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('Nowa Robótka')}</Text>

            <ScrollView>
              <Text style={styles.inputLabel}>{t('Nazwa projektu')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('np. Mój Kardigan Oversize')}
                placeholderTextColor="#999999"
                value={newProjectName}
                onChangeText={setNewProjectName}
              />

              <Text style={styles.inputLabel}>{t('Typ techniki')}</Text>
              <View style={styles.craftSelector}>
                <TouchableOpacity
                  style={[
                    styles.craftButton,
                    newCraftType === 'knitting' && styles.craftButtonActive,
                  ]}
                  onPress={() => setNewCraftType('knitting')}
                >
                  <Text
                    style={[
                      styles.craftButtonText,
                      newCraftType === 'knitting' && styles.craftButtonTextActive,
                    ]}
                  >
                    {t('🧶 Druty (Knitting)')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.craftButton,
                    newCraftType === 'crochet' && styles.craftButtonActive,
                  ]}
                  onPress={() => setNewCraftType('crochet')}
                >
                  <Text
                    style={[
                      styles.craftButtonText,
                      newCraftType === 'crochet' && styles.craftButtonTextActive,
                    ]}
                  >
                    {t('🪡 Szydełko (Crochet)')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{t('Nazwa pierwszej części')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('np. Korpus / Tył')}
                placeholderTextColor="#999999"
                value={newPartName}
                onChangeText={setNewPartName}
              />

              <Text style={styles.inputLabel}>{t('Docelowa liczba rzędów (opcjonalnie)')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="np. 120"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                value={newTargetRows}
                onChangeText={setNewTargetRows}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !newProjectName.trim() && styles.submitButtonDisabled,
                ]}
                disabled={!newProjectName.trim()}
                onPress={handleCreateProject}
              >
                <Text style={styles.submitButtonText}>{t('Utwórz projekt')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal dodawania nowej części do istniejącego projektu */}
      <Modal
        visible={partModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('Dodaj nową część robótki')}</Text>

            <Text style={styles.inputLabel}>{t('Nazwa części (np. Rękaw lewy, Kołnierz)')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('np. Rękaw lewy')}
              placeholderTextColor="#999999"
              value={addedPartName}
              onChangeText={setAddedPartName}
            />

            <Text style={styles.inputLabel}>{t('Docelowa liczba rzędów (opcjonalnie)')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="np. 80"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              value={addedPartTarget}
              onChangeText={setAddedPartTarget}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPartModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !addedPartName.trim() && styles.submitButtonDisabled,
                ]}
                disabled={!addedPartName.trim()}
                onPress={handleAddPartSubmit}
              >
                <Text style={styles.submitButtonText}>{t('Dodaj część')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal kalkulatora próbki (Gauge) */}
      <GaugeCalculatorModal
        visible={gaugeModalVisible}
        onClose={() => setGaugeModalVisible(false)}
        onCreateProject={handleCreateProjectFromGauge}
      />

      {/* Modal karty podsumowania i udostępniania robótki */}
      <ProjectShareCardModal
        visible={selectedShareProject !== null}
        project={selectedShareProject}
        onClose={() => setSelectedShareProject(null)}
        onStatusChange={handleProjectStatusChange}
      />

      {/* Modal kalkulatora zużycia włóczki i wagi wyrobu */}
      <YarnUsageEstimatorModal
        visible={yarnEstimatorVisible}
        onClose={() => {
          setYarnEstimatorVisible(false);
          setEstimatorInitialRows(undefined);
        }}
        availableYarns={stashYarns}
        initialCompletedRows={estimatorInitialRows?.completed ?? 50}
        initialTargetRows={estimatorInitialRows?.target ?? 200}
      />

      {/* Modal kalkulatora kształtowania i oczek */}
      <ShapingCalculatorModal
        visible={shapingModalVisible}
        onClose={() => setShapingModalVisible(false)}
      />

      {/* Modal kalkulatora luzu i doboru rozmiaru */}
      <EaseCalculatorModal
        visible={easeModalVisible}
        onClose={() => setEaseModalVisible(false)}
      />

      {/* Modal kalkulatora konstrukcji raglanu i GSR */}
      <RaglanCalculatorModal
        visible={raglanModalVisible}
        onClose={() => setRaglanModalVisible(false)}
      />

      {/* Modal kalkulatora korony czapki */}
      <HatCalculatorModal
        visible={hatModalVisible}
        onClose={() => setHatModalVisible(false)}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gaugeButton: {
    backgroundColor: '#F0ECE8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  gaugeButtonText: {
    color: '#8B5E3C',
    fontWeight: '700',
    fontSize: 13,
  },
  newButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: '#8B5E3C',
    borderWidth: 1.5,
    backgroundColor: '#FFFCFA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activeTag: {
    backgroundColor: '#28A745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5E3C',
    backgroundColor: '#F5EBE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partsSummaryContainer: {
    backgroundColor: '#FAF5F0',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  partsHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5E3C',
    marginBottom: 4,
  },
  partDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  partDetailName: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  partDetailCount: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5E3C',
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  addPartButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  addPartButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444444',
  },
  openCounterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F7EFEA',
  },
  openCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FBFBFB',
  },
  craftSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  craftButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  craftButtonActive: {
    borderColor: '#8B5E3C',
    backgroundColor: '#FAF5F0',
  },
  craftButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  craftButtonTextActive: {
    color: '#8B5E3C',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#8B5E3C',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardShareButton: {
    backgroundColor: '#FAF5F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2D4C8',
  },
  cardShareButtonText: {
    color: '#8B5E3C',
    fontWeight: '700',
    fontSize: 12,
  },
  accessStatusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accessStatusTextPremium: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  accessStatusTextTrial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A5A36',
    backgroundColor: '#FFF8F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E2D6',
    textAlign: 'center',
  },
  accessStatusBannerExpired: {
    backgroundColor: '#FFF2EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0D5C7',
    minHeight: 44,
    justifyContent: 'center',
  },
  accessStatusTextExpired: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C0392B',
    textAlign: 'center',
  },
});

