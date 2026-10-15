import React, { useState, useEffect, useCallback } from 'react';
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
import { useProject, ProjectContextValue } from '../../src/core/project-context';
import {
  StashYarnRecord,
  StashToolRecord,
  listStashYarns,
  listStashTools,
  insertStashYarn,
  insertStashTool,
  updateStashYarnRemaining,
  deleteStashYarn,
  deleteStashTool,
  seedDefaultStashIfEmpty,
  YarnWeightCategory,
  ToolType,
  ToolMaterial,
} from '../../src/core/stash-repository';

type StashTab = 'yarn' | 'tools';

const FALLBACK_YARNS: StashYarnRecord[] = [
  {
    id: 'yarn_1',
    brand: 'Drops',
    name: 'Nord',
    colorway: '03 Jasnoszary',
    weightCategory: 'Fingering',
    skeinsTotal: 4,
    skeinsRemaining: 4,
    weightGramsPerSkein: 50,
    composition: '45% Alpaka, 30% Poliamid, 25% Wełna',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'yarn_2',
    brand: 'Sandnes Garn',
    name: 'Sunday',
    colorway: '2511 Almond',
    weightCategory: 'Fingering',
    skeinsTotal: 2,
    skeinsRemaining: 2,
    weightGramsPerSkein: 50,
    composition: '100% Wełna Merino (non-superwash)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_TOOLS: StashToolRecord[] = [
  {
    id: 'tool_1',
    name: 'KnitPro Zing 3.5 mm',
    sizeMm: 3.5,
    toolType: 'circular',
    material: 'metal',
    cableLengthCm: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tool_2',
    name: 'ChiaoGoo Red Lace 4.0 mm',
    sizeMm: 4.0,
    toolType: 'circular',
    material: 'metal',
    cableLengthCm: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function StashScreen() {
  let projectCtx: ProjectContextValue | null = null;
  try {
    projectCtx = useProject();
  } catch (_e) {
    projectCtx = null;
  }

  const db = projectCtx?.db;

  const [activeTab, setActiveTab] = useState<StashTab>('yarn');
  const [yarns, setYarns] = useState<StashYarnRecord[]>(FALLBACK_YARNS);
  const [tools, setTools] = useState<StashToolRecord[]>(FALLBACK_TOOLS);

  // Formularz dodawania
  const [modalVisible, setModalVisible] = useState(false);
  // Pola dla włóczki
  const [yarnBrand, setYarnBrand] = useState('');
  const [yarnName, setYarnName] = useState('');
  const [yarnColorway, setYarnColorway] = useState('');
  const [yarnSkeins, setYarnSkeins] = useState('1');
  const [yarnComposition, setYarnComposition] = useState('');
  const [yarnWeightCategory, setYarnWeightCategory] = useState<YarnWeightCategory>('DK');

  // Pola dla narzędzia
  const [toolName, setToolName] = useState('');
  const [toolSizeMm, setToolSizeMm] = useState('4.0');
  const [toolType, setToolType] = useState<ToolType>('circular');
  const [toolMaterial, setToolMaterial] = useState<ToolMaterial>('metal');
  const [toolCableLength, setToolCableLength] = useState('80');

  const loadStashFromDb = useCallback(async () => {
    if (!db) return;
    try {
      await seedDefaultStashIfEmpty(db);
      const loadedYarns = await listStashYarns(db);
      const loadedTools = await listStashTools(db);
      if (loadedYarns.length > 0) setYarns(loadedYarns);
      if (loadedTools.length > 0) setTools(loadedTools);
    } catch (_e) {
      // obsługa błędów bazy
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      loadStashFromDb();
    }
  }, [db, loadStashFromDb]);

  const handleAddYarn = async () => {
    if (!yarnBrand.trim() || !yarnName.trim()) return;
    const skeins = parseFloat(yarnSkeins) || 1;
    const now = new Date().toISOString();
    const newYarn: StashYarnRecord = {
      id: `yarn_${Date.now()}`,
      brand: yarnBrand.trim(),
      name: yarnName.trim(),
      colorway: yarnColorway.trim() || 'Domyślny',
      weightCategory: yarnWeightCategory,
      composition: yarnComposition.trim() || '100% Wełna',
      skeinsTotal: skeins,
      skeinsRemaining: skeins,
      weightGramsPerSkein: 50,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await insertStashYarn(db, newYarn);
      await loadStashFromDb();
    } else {
      setYarns((prev) => [newYarn, ...prev]);
    }

    setYarnBrand('');
    setYarnName('');
    setYarnColorway('');
    setYarnSkeins('1');
    setYarnComposition('');
    setModalVisible(false);
  };

  const handleAddTool = async () => {
    if (!toolName.trim()) return;
    const size = parseFloat(toolSizeMm) || 4.0;
    const cable = parseInt(toolCableLength, 10);
    const now = new Date().toISOString();
    const newTool: StashToolRecord = {
      id: `tool_${Date.now()}`,
      name: toolName.trim(),
      toolType,
      sizeMm: size,
      material: toolMaterial,
      cableLengthCm: !isNaN(cable) && cable > 0 ? cable : undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await insertStashTool(db, newTool);
      await loadStashFromDb();
    } else {
      setTools((prev) => [newTool, ...prev]);
    }

    setToolName('');
    setModalVisible(false);
  };

  const handleUseSkein = async (yarn: StashYarnRecord) => {
    if (yarn.skeinsRemaining <= 0) return;
    const updated = Math.max(0, yarn.skeinsRemaining - 1);
    if (db) {
      await updateStashYarnRemaining(db, yarn.id, updated);
      await loadStashFromDb();
    } else {
      setYarns((prev) =>
        prev.map((y) => (y.id === yarn.id ? { ...y, skeinsRemaining: updated } : y))
      );
    }
  };

  const handleDeleteYarn = async (id: string) => {
    if (db) {
      await deleteStashYarn(db, id);
      await loadStashFromDb();
    } else {
      setYarns((prev) => prev.filter((y) => y.id !== id));
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (db) {
      await deleteStashTool(db, id);
      await loadStashFromDb();
    } else {
      setTools((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Przełącznik Włóczki / Narzędzia */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'yarn' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('yarn')}
        >
          <Text style={[styles.segmentText, activeTab === 'yarn' && styles.segmentTextActive]}>
            🧶 Włóczki ({yarns.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'tools' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('tools')}
        >
          <Text style={[styles.segmentText, activeTab === 'tools' && styles.segmentTextActive]}>
            🪡 Druty i szydełka ({tools.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'yarn' ? 'Twoje Zapasy Włóczek' : 'Twoje Narzędzia'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>
            {activeTab === 'yarn' ? '+ Dodaj włóczkę' : '+ Dodaj druty'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'yarn' ? (
        <FlatList
          data={yarns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>
                  {item.brand} {item.name}
                </Text>
                <Text style={styles.badge}>{item.weightCategory}</Text>
              </View>
              <Text style={styles.detailRow}>
                Kolor / Lot: <Text style={styles.detailBold}>{item.colorway}</Text>
                {item.dyeLot ? ` (Lot: ${item.dyeLot})` : ''}
              </Text>
              <Text style={styles.detailRow}>
                Pozostało motków:{' '}
                <Text style={styles.detailBold}>
                  {item.skeinsRemaining} z {item.skeinsTotal}
                </Text>
              </Text>
              <Text style={styles.compositionText}>{item.composition}</Text>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.useButton}
                  onPress={() => handleUseSkein(item)}
                  disabled={item.skeinsRemaining <= 0}
                >
                  <Text style={styles.useButtonText}>Zużyj 1 motek (-1)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteYarn(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={tools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.sizeBadge}>{item.sizeMm} mm</Text>
              </View>
              <Text style={styles.detailRow}>
                Typ: <Text style={styles.detailBold}>{item.toolType}</Text>
              </Text>
              <Text style={styles.detailRow}>
                Materiał: <Text style={styles.detailBold}>{item.material}</Text>
              </Text>
              {item.cableLengthCm && (
                <Text style={styles.detailRow}>
                  Długość żyłki: <Text style={styles.detailBold}>{item.cableLengthCm} cm</Text>
                </Text>
              )}

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTool(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Usuń z magazynu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal dodawania do magazynu */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeTab === 'yarn' ? 'Dodaj włóczkę do schowka' : 'Dodaj druty / szydełko'}
            </Text>

            <ScrollView>
              {activeTab === 'yarn' ? (
                <>
                  <Text style={styles.inputLabel}>Marka (Producent)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. Drops / Sandnes Garn"
                    placeholderTextColor="#999999"
                    value={yarnBrand}
                    onChangeText={setYarnBrand}
                  />

                  <Text style={styles.inputLabel}>Nazwa włóczki</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. Air / Sunday / Merino"
                    placeholderTextColor="#999999"
                    value={yarnName}
                    onChangeText={setYarnName}
                  />

                  <Text style={styles.inputLabel}>Kolor i numer partii (Lot)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 01 Biały (Lot 451)"
                    placeholderTextColor="#999999"
                    value={yarnColorway}
                    onChangeText={setYarnColorway}
                  />

                  <Text style={styles.inputLabel}>Liczba motków</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 4"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={yarnSkeins}
                    onChangeText={setYarnSkeins}
                  />

                  <Text style={styles.inputLabel}>Skład</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 100% Wełna Merino"
                    placeholderTextColor="#999999"
                    value={yarnComposition}
                    onChangeText={setYarnComposition}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Nazwa narzędzia</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. KnitPro Zing na żyłce"
                    placeholderTextColor="#999999"
                    value={toolName}
                    onChangeText={setToolName}
                  />

                  <Text style={styles.inputLabel}>Rozmiar (mm)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 4.0"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={toolSizeMm}
                    onChangeText={setToolSizeMm}
                  />

                  <Text style={styles.inputLabel}>Długość żyłki (cm, dla okrągłych)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 80"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={toolCableLength}
                    onChangeText={setToolCableLength}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={activeTab === 'yarn' ? handleAddYarn : handleAddTool}
              >
                <Text style={styles.submitButtonText}>Zapisz w magazynie</Text>
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5E3C',
    backgroundColor: '#F7EFEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizeBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2D42',
    backgroundColor: '#EDF2F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailRow: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  detailBold: {
    color: '#222222',
    fontWeight: '500',
  },
  compositionText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 10,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
    marginTop: 6,
  },
  useButton: {
    backgroundColor: '#FAF5F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  useButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC3545',
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
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
    marginTop: 10,
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
});
