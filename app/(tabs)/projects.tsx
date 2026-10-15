import React, { useState } from 'react';
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
import { CraftType } from '../../src/core/project-repository';

export default function ProjectsScreen() {
  const router = useRouter();

  let projectCtx: ProjectContextValue | null = null;
  try {
    projectCtx = useProject();
  } catch (_e) {
    projectCtx = null;
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newCraftType, setNewCraftType] = useState<CraftType>('knitting');
  const [newPartName, setNewPartName] = useState('Korpus');
  const [newTargetRows, setNewTargetRows] = useState('');

  const projects = projectCtx?.projects ?? [];
  const activeProjectId = projectCtx?.activeProject?.id ?? null;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
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
                <Text style={styles.activeTagText}>AKTYWNY</Text>
              </View>
            )}
          </View>
          <Text style={styles.categoryBadge}>
            {item.craftType === 'knitting' ? 'DRUTY' : 'SZYDEŁKO'}
          </Text>
        </View>

        <Text style={styles.partInfo}>
          Część: <Text style={styles.partName}>{primaryPart?.name ?? 'Brak części'}</Text> ({item.parts.length} części ogółem)
        </Text>

        <View style={styles.progressRow}>
          <Text style={styles.rowNumbers}>
            Rząd: <Text style={styles.rowHighlight}>{currentRow}</Text>
            {targetRow ? ` / ${targetRow}` : ''}
          </Text>
          {progressPercent !== null && (
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          )}
        </View>

        {progressPercent !== null && (
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.openCounterButton}
            onPress={() => handleOpenInCounter(item)}
          >
            <Text style={styles.openCounterText}>Otwórz w liczniku 🧶</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Twoje Robótki</Text>
        <TouchableOpacity
          style={styles.newButton}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.newButtonText}>+ Nowy projekt</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak projektów. Rozpocznij dodając pierwszy projekt!</Text>
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
            <Text style={styles.modalTitle}>Nowa Robótka</Text>

            <ScrollView>
              <Text style={styles.inputLabel}>Nazwa projektu</Text>
              <TextInput
                style={styles.textInput}
                placeholder="np. Mój Kardigan Oversize"
                placeholderTextColor="#999999"
                value={newProjectName}
                onChangeText={setNewProjectName}
              />

              <Text style={styles.inputLabel}>Typ techniki</Text>
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
                    🧶 Druty (Knitting)
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
                    🪡 Szydełko (Crochet)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nazwa pierwszej części</Text>
              <TextInput
                style={styles.textInput}
                placeholder="np. Korpus / Tył"
                placeholderTextColor="#999999"
                value={newPartName}
                onChangeText={setNewPartName}
              />

              <Text style={styles.inputLabel}>Docelowa liczba rzędów (opcjonalnie)</Text>
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
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !newProjectName.trim() && styles.submitButtonDisabled,
                ]}
                disabled={!newProjectName.trim()}
                onPress={handleCreateProject}
              >
                <Text style={styles.submitButtonText}>Utwórz projekt</Text>
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
  partInfo: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
  },
  partName: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowNumbers: {
    fontSize: 14,
    color: '#444444',
  },
  rowHighlight: {
    fontWeight: '700',
    color: '#1A1A1A',
    fontSize: 16,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
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
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
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
});
