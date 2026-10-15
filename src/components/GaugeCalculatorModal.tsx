/**
 * Oczko UI — Modal kalkulatora próbki obliczeniowej (Gauge Swatch) i szablonów projektów (DEC-01, BR-PROJ-004)
 * Zapewnia:
 * 1. Wyliczanie liczby oczek i rzędów na podstawie wymiarów próbki i wyrobu
 * 2. Analizę naprężenia i rekomendację doboru rozmiaru drutów/szydełka
 * 3. Przelicznik liczby nabieranych oczek ze wzoru
 * 4. Wybór standardowych szablonów projektowych z gotowymi wymiarami
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateTargetStitchesAndRows,
  compareGauges,
  BUILT_IN_PROJECT_TEMPLATES,
  MeasurementUnit,
  SwatchMeasurement,
  TargetDimensions,
  ProjectTemplate,
} from '../core/gauge-calculator';
import { CraftType } from '../core/project-repository';

export interface CreateProjectFromGaugeInput {
  name: string;
  craftType: CraftType;
  targetRows: number;
  targetStitches: number;
}

export interface GaugeCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateProject?: (input: CreateProjectFromGaugeInput) => void;
}

export default function GaugeCalculatorModal({
  visible,
  onClose,
  onCreateProject,
}: GaugeCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'compare' | 'templates'>('calculator');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');

  // Stan: Kalkulator wymiarów
  const [swatchStitches, setSwatchStitches] = useState('20');
  const [swatchRows, setSwatchRows] = useState('28');
  const [swatchSize, setSwatchSize] = useState('10');
  const [targetWidth, setTargetWidth] = useState('50');
  const [targetHeight, setTargetHeight] = useState('60');
  const [projectName, setProjectName] = useState('Nowy projekt');
  const [craftType, setCraftType] = useState<CraftType>('knitting');

  // Stan: Porównanie z wzorem (Tension check)
  const [patStitches, setPatStitches] = useState('20');
  const [patRows, setPatRows] = useState('28');
  const [myStitches, setMyStitches] = useState('22');
  const [myRows, setMyRows] = useState('30');
  const [exampleCastOn, setExampleCastOn] = useState('100');

  // Obliczenie docelowych oczek i rzędów
  const calculationResult = useMemo(() => {
    const sSt = parseFloat(swatchStitches);
    const sRw = parseFloat(swatchRows);
    const sSz = parseFloat(swatchSize);
    const tW = parseFloat(targetWidth);
    const tH = parseFloat(targetHeight);

    if (
      isNaN(sSt) || sSt <= 0 ||
      isNaN(sRw) || sRw <= 0 ||
      isNaN(sSz) || sSz <= 0 ||
      isNaN(tW) || tW <= 0 ||
      isNaN(tH) || tH <= 0
    ) {
      return null;
    }

    try {
      const swatch: SwatchMeasurement = {
        stitches: sSt,
        rows: sRw,
        width: sSz,
        height: sSz,
        unit,
      };
      const target: TargetDimensions = {
        width: tW,
        height: tH,
        unit,
      };
      return calculateTargetStitchesAndRows(swatch, target);
    } catch {
      return null;
    }
  }, [swatchStitches, swatchRows, swatchSize, targetWidth, targetHeight, unit]);

  // Analiza porównania próbek
  const comparisonResult = useMemo(() => {
    const pSt = parseFloat(patStitches);
    const pRw = parseFloat(patRows);
    const mSt = parseFloat(myStitches);
    const mRw = parseFloat(myRows);

    if (
      isNaN(pSt) || pSt <= 0 ||
      isNaN(pRw) || pRw <= 0 ||
      isNaN(mSt) || mSt <= 0 ||
      isNaN(mRw) || mRw <= 0
    ) {
      return null;
    }

    try {
      const patGauge: SwatchMeasurement = {
        stitches: pSt,
        rows: pRw,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      const myGauge: SwatchMeasurement = {
        stitches: mSt,
        rows: mRw,
        width: 10,
        height: 10,
        unit: 'cm',
      };
      return compareGauges(patGauge, myGauge);
    } catch {
      return null;
    }
  }, [patStitches, patRows, myStitches, myRows]);

  const handleApplyTemplate = (tpl: ProjectTemplate) => {
    setProjectName(tpl.name);
    setCraftType(tpl.defaultCraftType);
    setUnit(tpl.defaultDimensions.unit);
    setTargetWidth(String(tpl.defaultDimensions.width));
    setTargetHeight(String(tpl.defaultDimensions.height));
    setSwatchStitches(String(tpl.standardGauge.stitches));
    setSwatchRows(String(tpl.standardGauge.rows));
    setSwatchSize(String(tpl.standardGauge.width));
    setActiveTab('calculator');
  };

  const handleCreateProjectSubmit = () => {
    if (!calculationResult || !onCreateProject) return;
    onCreateProject({
      name: projectName.trim() || 'Projekt z próbki',
      craftType,
      targetRows: calculationResult.targetRows,
      targetStitches: calculationResult.targetStitches,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.modalContainer}>
        {/* Nagłówek modala */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Kalkulator Próbki & Wymiarów</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Zakładki */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calculator' && styles.tabItemActive]}
            onPress={() => setActiveTab('calculator')}
          >
            <Text style={[styles.tabText, activeTab === 'calculator' && styles.tabTextActive]}>
              📐 Przelicznik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'compare' && styles.tabItemActive]}
            onPress={() => setActiveTab('compare')}
          >
            <Text style={[styles.tabText, activeTab === 'compare' && styles.tabTextActive]}>
              ⚖️ Napięcie wzoru
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'templates' && styles.tabItemActive]}
            onPress={() => setActiveTab('templates')}
          >
            <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>
              📋 Szablony
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: KALKULATOR WYMIARÓW */}
          {activeTab === 'calculator' && (
            <View>
              {/* Przełącznik jednostek */}
              <View style={styles.unitSelector}>
                <Text style={styles.unitLabel}>Jednostka miary:</Text>
                <View style={styles.unitButtonsRow}>
                  <TouchableOpacity
                    style={[styles.unitBtn, unit === 'cm' && styles.unitBtnActive]}
                    onPress={() => setUnit('cm')}
                  >
                    <Text style={[styles.unitBtnText, unit === 'cm' && styles.unitBtnTextActive]}>
                      Centymetry (cm)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitBtn, unit === 'inch' && styles.unitBtnActive]}
                    onPress={() => setUnit('inch')}
                  >
                    <Text style={[styles.unitBtnText, unit === 'inch' && styles.unitBtnTextActive]}>
                      Cale (inch)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sekcja: Wymiary Twojej Próbki */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>1. Twoja próbka ściegu (Gauge Swatch)</Text>
                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Liczba oczek</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={swatchStitches}
                      onChangeText={setSwatchStitches}
                      placeholder="np. 20"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Liczba rzędów</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={swatchRows}
                      onChangeText={setSwatchRows}
                      placeholder="np. 28"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Wymiar ({unit})</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={swatchSize}
                      onChangeText={setSwatchSize}
                      placeholder="np. 10"
                    />
                  </View>
                </View>
              </View>

              {/* Sekcja: Docelowy Wyrób */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>2. Wymiary gotowego wyrobu</Text>
                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Szerokość ({unit})</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={targetWidth}
                      onChangeText={setTargetWidth}
                      placeholder="np. 50"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Długość/wys. ({unit})</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={targetHeight}
                      onChangeText={setTargetHeight}
                      placeholder="np. 60"
                    />
                  </View>
                </View>
              </View>

              {/* Karta Wyników */}
              {calculationResult ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>OBLICZONA PRÓBA PROJEKTU</Text>
                  <View style={styles.resultsGrid}>
                    <View style={styles.resultMetric}>
                      <Text style={styles.resultNumber}>{calculationResult.targetStitches}</Text>
                      <Text style={styles.resultLabel}>Oczek do nabrania (Cast-on)</Text>
                    </View>
                    <View style={styles.resultMetric}>
                      <Text style={styles.resultNumber}>{calculationResult.targetRows}</Text>
                      <Text style={styles.resultLabel}>Rzędów do przerobienia</Text>
                    </View>
                  </View>
                  <Text style={styles.densityText}>
                    Gęstość: {calculationResult.stitchesPerUnit} o./{unit} • {calculationResult.rowsPerUnit} rz./{unit}
                  </Text>

                  {onCreateProject && (
                    <View style={styles.projectCreationBox}>
                      <Text style={styles.inputTitle}>Nazwa tworzonego projektu:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={projectName}
                        onChangeText={setProjectName}
                        placeholder="Nazwa projektu"
                      />
                      <TouchableOpacity
                        style={styles.createProjectBtn}
                        onPress={handleCreateProjectSubmit}
                      >
                        <Text style={styles.createProjectBtnText}>
                          🚀 Utwórz robótkę ({calculationResult.targetRows} rz.)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    Wpisz poprawne wartości liczbowe większe od 0, aby obliczyć oczka i rzędy.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: PORÓWNANIE PRÓBKI Z WZOREM (TENSION CHECK) */}
          {activeTab === 'compare' && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>1. Próbka wzoru (10 x 10 cm)</Text>
                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Oczka wg wzoru</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={patStitches}
                      onChangeText={setPatStitches}
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Rzędy wg wzoru</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={patRows}
                      onChangeText={setPatRows}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardHeader}>2. Twoja wykonana próbka (10 x 10 cm)</Text>
                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Twoje oczka</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={myStitches}
                      onChangeText={setMyStitches}
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputTitle}>Twoje rzędy</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={myRows}
                      onChangeText={setMyRows}
                    />
                  </View>
                </View>
              </View>

              {comparisonResult && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>ANALIZA NAPRĘŻENIA DZIANINY</Text>
                  <View style={styles.statusBadgeRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        comparisonResult.status === 'exact' && styles.statusBadgeGreen,
                        comparisonResult.status !== 'exact' && styles.statusBadgeAmber,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {comparisonResult.status === 'exact' && '✓ IDEALNA ZGODNOŚĆ'}
                        {comparisonResult.status === 'tighter' && '⚠️ ROBÓTKA ŚCIŚLEJSZA'}
                        {comparisonResult.status === 'looser' && '⚠️ ROBÓTKA LUŹNIEJSZA'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recommendationText}>
                    {comparisonResult.needleAdjustmentRecommendation}
                  </Text>

                  <View style={styles.recalcBox}>
                    <Text style={styles.recalcTitle}>Przelicznik nabierania oczek:</Text>
                    <View style={styles.recalcRow}>
                      <Text style={styles.recalcLabel}>Gdy wzór mówi nabierz:</Text>
                      <TextInput
                        style={styles.recalcInput}
                        keyboardType="numeric"
                        value={exampleCastOn}
                        onChangeText={setExampleCastOn}
                      />
                      <Text style={styles.recalcLabel}>oczek</Text>
                    </View>
                    <Text style={styles.recalcResultText}>
                      ➡️ Ty nabierz:{' '}
                      <Text style={styles.boldScore}>
                        {comparisonResult.recalculatedCastOn(parseInt(exampleCastOn, 10) || 0)}
                      </Text>{' '}
                      oczek
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: SZABLONY PROJEKTÓW */}
          {activeTab === 'templates' && (
            <View>
              <Text style={styles.templatesHeader}>Wybierz gotowy szablon z typowymi wymiarami:</Text>
              {BUILT_IN_PROJECT_TEMPLATES.map((tpl) => (
                <View key={tpl.id} style={styles.templateCard}>
                  <View style={styles.tplHeader}>
                    <Text style={styles.tplName}>{tpl.name}</Text>
                    <Text style={styles.tplCategory}>{tpl.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.tplDesc}>{tpl.description}</Text>
                  <View style={styles.tplSpecs}>
                    <Text style={styles.tplSpecItem}>
                      Wymiary: {tpl.defaultDimensions.width} x {tpl.defaultDimensions.height} {tpl.defaultDimensions.unit}
                    </Text>
                    <Text style={styles.tplSpecItem}>
                      Włóczka: {tpl.recommendedYarnWeight}
                    </Text>
                    <Text style={styles.tplSpecItem}>
                      Próbka standardowa: {tpl.standardGauge.stitches} o. x {tpl.standardGauge.rows} rz. / 10 cm
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectTplBtn}
                    onPress={() => handleApplyTemplate(tpl)}
                  >
                    <Text style={styles.selectTplBtnText}>Zastosuj szablon do kalkulatora ▶</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#8E8E93',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#8B5E3C',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#8B5E3C',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  unitButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EFEFEF',
  },
  unitBtnActive: {
    backgroundColor: '#8B5E3C',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  inputTitle: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 4,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: '#F8F6F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DED6',
    marginTop: 4,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5E3C',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  resultMetric: {
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#8B5E3C',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    marginTop: 2,
  },
  densityText: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 12,
  },
  projectCreationBox: {
    borderTopWidth: 1,
    borderTopColor: '#E8DED6',
    paddingTop: 12,
  },
  createProjectBtn: {
    backgroundColor: '#8B5E3C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createProjectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  noticeBox: {
    padding: 16,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },
  statusBadgeRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeAmber: {
    backgroundColor: '#FFF8E1',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D32',
  },
  recommendationText: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  recalcBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  recalcTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 6,
  },
  recalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recalcLabel: {
    fontSize: 13,
    color: '#555555',
  },
  recalcInput: {
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  recalcResultText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    marginTop: 4,
  },
  boldScore: {
    color: '#8B5E3C',
    fontWeight: '800',
    fontSize: 16,
  },
  templatesHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 10,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tplHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tplName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tplCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5E3C',
    backgroundColor: '#F4ECE4',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tplDesc: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  tplSpecs: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 8,
    gap: 3,
    marginBottom: 10,
  },
  tplSpecItem: {
    fontSize: 11,
    color: '#555555',
  },
  selectTplBtn: {
    backgroundColor: '#F0ECE8',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  selectTplBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5E3C',
  },
});
