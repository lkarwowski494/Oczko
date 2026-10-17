/**
 * Oczko UI — Modal kalkulatora zużycia włóczki i estymatora wagi wyrobu (BR-MAG-004)
 * Zapewnia:
 * 1. Estymację wagi wyrobu i liczby motków na podstawie postępu w rzędach
 * 2. Estymację z próbki ściegu (swatch) przed rozpoczęciem pracy
 * 3. Wykrywanie ryzyka "Yarn Chicken" (brak motków / zapas na styk)
 * 4. Integrację z inwentarzem magazynu włóczek (stash)
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
  estimateYarnFromProgress,
  estimateYarnFromSwatch,
  YarnEstimateResult,
} from '../core/yarn-usage-estimator';
import { StashYarnRecord } from '../core/stash-repository';

export interface YarnUsageEstimatorModalProps {
  visible: boolean;
  onClose: () => void;
  availableYarns?: StashYarnRecord[];
  initialCompletedRows?: number;
  initialTargetRows?: number;
}

export default function YarnUsageEstimatorModal({
  visible,
  onClose,
  availableYarns = [],
  initialCompletedRows = 50,
  initialTargetRows = 200,
}: YarnUsageEstimatorModalProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'swatch'>('progress');
  const [safetyMargin, setSafetyMargin] = useState<number>(10);

  // Wybrana włóczka z magazynu lub tryb ręczny ('custom')
  const [selectedYarnId, setSelectedYarnId] = useState<string>(
    availableYarns.length > 0 ? availableYarns[0].id : 'custom'
  );

  // Parametry motka (edytowalne lub zsynchronizowane z magazynem)
  const selectedYarn = useMemo(
    () => availableYarns.find((y) => y.id === selectedYarnId),
    [availableYarns, selectedYarnId]
  );

  const [skeinWeight, setSkeinWeight] = useState<string>(
    selectedYarn?.weightGramsPerSkein ? String(selectedYarn.weightGramsPerSkein) : '50'
  );
  const [skeinLength, setSkeinLength] = useState<string>(
    selectedYarn?.lengthMetersPerSkein ? String(selectedYarn.lengthMetersPerSkein) : '175'
  );
  const [availableSkeins, setAvailableSkeins] = useState<string>(
    selectedYarn?.skeinsRemaining !== undefined ? String(selectedYarn.skeinsRemaining) : '4'
  );

  // Stan dla trybu: W trakcie robótki (Progress)
  const [completedRows, setCompletedRows] = useState<string>(String(initialCompletedRows));
  const [targetRows, setTargetRows] = useState<string>(String(initialTargetRows));
  const [usedWeight, setUsedWeight] = useState<string>('40');

  // Stan dla trybu: Z próbki ściegu (Swatch)
  const [swatchWidth, setSwatchWidth] = useState<string>('10');
  const [swatchHeight, setSwatchHeight] = useState<string>('10');
  const [swatchWeight, setSwatchWeight] = useState<string>('8');
  const [finishedWidth, setFinishedWidth] = useState<string>('50');
  const [finishedHeight, setFinishedHeight] = useState<string>('160');
  const [pieceCount, setPieceCount] = useState<string>('1');

  // Zmiana wybranej włóczki
  const handleSelectYarn = (yarnId: string) => {
    setSelectedYarnId(yarnId);
    if (yarnId === 'custom') {
      return;
    }
    const yarn = availableYarns.find((y) => y.id === yarnId);
    if (yarn) {
      if (yarn.weightGramsPerSkein) setSkeinWeight(String(yarn.weightGramsPerSkein));
      if (yarn.lengthMetersPerSkein) setSkeinLength(String(yarn.lengthMetersPerSkein));
      setAvailableSkeins(String(yarn.skeinsRemaining));
    }
  };

  // Obliczenia na bieżąco
  const result: YarnEstimateResult | null = useMemo(() => {
    const sWeight = parseFloat(skeinWeight);
    const sLength = parseFloat(skeinLength);
    const sAvail = parseFloat(availableSkeins);

    if (isNaN(sWeight) || sWeight <= 0) return null;

    try {
      if (activeTab === 'progress') {
        const cRows = parseFloat(completedRows);
        const tRows = parseFloat(targetRows);
        const uWeight = parseFloat(usedWeight);

        if (isNaN(cRows) || cRows <= 0 || isNaN(tRows) || tRows <= 0 || isNaN(uWeight) || uWeight <= 0) {
          return null;
        }

        return estimateYarnFromProgress({
          completedRows: cRows,
          targetRows: tRows,
          usedWeightGrams: uWeight,
          skeinWeightGrams: sWeight,
          skeinLengthMeters: !isNaN(sLength) && sLength > 0 ? sLength : undefined,
          availableSkeins: !isNaN(sAvail) && sAvail >= 0 ? sAvail : undefined,
          safetyMarginPercent: safetyMargin,
        });
      } else {
        const swW = parseFloat(swatchWidth);
        const swH = parseFloat(swatchHeight);
        const swWt = parseFloat(swatchWeight);
        const finW = parseFloat(finishedWidth);
        const finH = parseFloat(finishedHeight);
        const pCnt = parseFloat(pieceCount);

        if (
          isNaN(swW) || swW <= 0 ||
          isNaN(swH) || swH <= 0 ||
          isNaN(swWt) || swWt <= 0 ||
          isNaN(finW) || finW <= 0 ||
          isNaN(finH) || finH <= 0
        ) {
          return null;
        }

        return estimateYarnFromSwatch({
          swatchWidthCm: swW,
          swatchHeightCm: swH,
          swatchWeightGrams: swWt,
          finishedWidthCm: finW,
          finishedHeightCm: finH,
          pieceCount: !isNaN(pCnt) && pCnt > 0 ? pCnt : 1,
          skeinWeightGrams: sWeight,
          skeinLengthMeters: !isNaN(sLength) && sLength > 0 ? sLength : undefined,
          availableSkeins: !isNaN(sAvail) && sAvail >= 0 ? sAvail : undefined,
          safetyMarginPercent: safetyMargin,
        });
      }
    } catch (_err) {
      return null;
    }
  }, [
    activeTab,
    safetyMargin,
    skeinWeight,
    skeinLength,
    availableSkeins,
    completedRows,
    targetRows,
    usedWeight,
    swatchWidth,
    swatchHeight,
    swatchWeight,
    finishedWidth,
    finishedHeight,
    pieceCount,
  ]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Nagłówek */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>⚖️ Kalkulator Zużycia Włóczki</Text>
            <Text style={styles.headerSubtitle}>Estymator wagi wyrobu i kontrola Yarn Chicken</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Zamknij kalkulator zużycia"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Zakładki trybów */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'progress' && styles.tabButtonActive]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
              📊 W trakcie robótki
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'swatch' && styles.tabButtonActive]}
            onPress={() => setActiveTab('swatch')}
          >
            <Text style={[styles.tabText, activeTab === 'swatch' && styles.tabTextActive]}>
              📐 Z próbki ściegu
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Wybór włóczki i parametry motka */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>🧶 Parametry Włóczki & Zapas</Text>
            
            {availableYarns.length > 0 && (
              <View style={styles.yarnPickerContainer}>
                <Text style={styles.inputLabel}>Wybierz włóczkę z magazynu (stash):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yarnChipsRow}>
                  {availableYarns.map((yarn) => {
                    const isSelected = selectedYarnId === yarn.id;
                    return (
                      <TouchableOpacity
                        key={yarn.id}
                        style={[styles.yarnChip, isSelected && styles.yarnChipActive]}
                        onPress={() => handleSelectYarn(yarn.id)}
                      >
                        <Text style={[styles.yarnChipText, isSelected && styles.yarnChipTextActive]}>
                          {yarn.brand} {yarn.name} ({yarn.skeinsRemaining} motków)
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={[styles.yarnChip, selectedYarnId === 'custom' && styles.yarnChipActive]}
                    onPress={() => handleSelectYarn('custom')}
                  >
                    <Text style={[styles.yarnChipText, selectedYarnId === 'custom' && styles.yarnChipTextActive]}>
                      ✍️ Wpisz ręcznie
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            <View style={styles.rowInputs}>
              <View style={styles.colInput}>
                <Text style={styles.inputLabel}>Waga motka (g)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={skeinWeight}
                  onChangeText={setSkeinWeight}
                  placeholder="50"
                />
              </View>
              <View style={styles.colInput}>
                <Text style={styles.inputLabel}>Metraż (m/motek)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={skeinLength}
                  onChangeText={setSkeinLength}
                  placeholder="175"
                />
              </View>
              <View style={styles.colInput}>
                <Text style={styles.inputLabel}>Motków w zapasie</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={availableSkeins}
                  onChangeText={setAvailableSkeins}
                  placeholder="4"
                />
              </View>
            </View>

            {/* Margines bezpieczeństwa */}
            <View style={styles.marginRow}>
              <Text style={styles.inputLabel}>Margines bezpieczeństwa:</Text>
              <View style={styles.marginChips}>
                {[0, 5, 10, 15, 20].map((marginVal) => {
                  const isSel = safetyMargin === marginVal;
                  return (
                    <TouchableOpacity
                      key={marginVal}
                      style={[styles.marginChip, isSel && styles.marginChipActive]}
                      onPress={() => setSafetyMargin(marginVal)}
                    >
                      <Text style={[styles.marginChipText, isSel && styles.marginChipTextActive]}>
                        {marginVal === 0 ? '0%' : `+${marginVal}%`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Formularz dla trybu: W trakcie robótki */}
          {activeTab === 'progress' ? (
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>📊 Postęp w rzędach i aktualna waga</Text>
              <Text style={styles.cardHeaderDesc}>
                Zważ robótkę na wadze kuchennej lub jubilerskiej, aby wyliczyć tempo zużycia włóczki na rząd.
              </Text>
              <View style={styles.rowInputs}>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Ukończone rzędy</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={completedRows}
                    onChangeText={setCompletedRows}
                    placeholder="50"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Docelowe rzędy</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={targetRows}
                    onChangeText={setTargetRows}
                    placeholder="200"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Zużyta waga (g)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={usedWeight}
                    onChangeText={setUsedWeight}
                    placeholder="40"
                  />
                </View>
              </View>
            </View>
          ) : (
            /* Formularz dla trybu: Z próbki ściegu */
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>📐 Wymiary próbki i gotowego wyrobu</Text>
              
              <Text style={styles.subCardTitle}>Wymiary próbki ściegu:</Text>
              <View style={styles.rowInputs}>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Szerokość (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={swatchWidth}
                    onChangeText={setSwatchWidth}
                    placeholder="10"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Wysokość (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={swatchHeight}
                    onChangeText={setSwatchHeight}
                    placeholder="10"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Waga próbki (g)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={swatchWeight}
                    onChangeText={setSwatchWeight}
                    placeholder="8"
                  />
                </View>
              </View>

              <Text style={[styles.subCardTitle, { marginTop: 12 }]}>Docelowe wymiary wyrobu:</Text>
              <View style={styles.rowInputs}>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Szerokość (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={finishedWidth}
                    onChangeText={setFinishedWidth}
                    placeholder="50"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Długość/wys. (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={finishedHeight}
                    onChangeText={setFinishedHeight}
                    placeholder="160"
                  />
                </View>
                <View style={styles.colInput}>
                  <Text style={styles.inputLabel}>Liczba części (szt)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={pieceCount}
                    onChangeText={setPieceCount}
                    placeholder="1"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Wynik estymacji */}
          {result ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderRow}>
                <Text style={styles.resultSectionTitle}>ESTYMACJA ZAPOTRZEBOWANIA</Text>
                {/* Plakietka ryzyka Yarn Chicken */}
                <View
                  style={[
                    styles.riskBadge,
                    result.yarnChickenRisk === 'safe' && styles.riskBadgeSafe,
                    result.yarnChickenRisk === 'warning' && styles.riskBadgeWarning,
                    result.yarnChickenRisk === 'danger' && styles.riskBadgeDanger,
                  ]}
                >
                  <Text
                    style={[
                      styles.riskBadgeText,
                      result.yarnChickenRisk === 'safe' && styles.riskBadgeTextSafe,
                      result.yarnChickenRisk === 'warning' && styles.riskBadgeTextWarning,
                      result.yarnChickenRisk === 'danger' && styles.riskBadgeTextDanger,
                    ]}
                  >
                    {result.yarnChickenRisk === 'safe' && '🟢 Bezpiecznie'}
                    {result.yarnChickenRisk === 'warning' && '🟡 Zapas na styk'}
                    {result.yarnChickenRisk === 'danger' && '🚨 Yarn Chicken!'}
                  </Text>
                </View>
              </View>

              {/* Siatka wskaźników KPI */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Łączna waga</Text>
                  <Text style={styles.kpiValue}>{Math.round(result.estimatedTotalWeightGrams)} g</Text>
                  <Text style={styles.kpiSub}>z marginesem {safetyMargin}%</Text>
                </View>

                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Pozostało</Text>
                  <Text style={styles.kpiValue}>{Math.round(result.remainingWeightGrams)} g</Text>
                  <Text style={styles.kpiSub}>do ukończenia</Text>
                </View>

                <View style={styles.kpiItem}>
                  <Text style={styles.kpiLabel}>Wymagane motki</Text>
                  <Text style={styles.kpiValue}>
                    {result.requiredSkeins}{' '}
                    <Text style={styles.kpiValueSmall}>
                      {result.availableSkeins !== undefined ? `/ ${result.availableSkeins} w zapasie` : 'szt.'}
                    </Text>
                  </Text>
                  <Text style={styles.kpiSub}>
                    {result.isSufficient ? 'Wystarczy' : `Brakuje ${result.missingSkeins ?? 0} szt.`}
                  </Text>
                </View>

                {result.gramsPerRow !== undefined ? (
                  <View style={styles.kpiItem}>
                    <Text style={styles.kpiLabel}>Średnio na rząd</Text>
                    <Text style={styles.kpiValue}>{result.gramsPerRow.toFixed(2)} g</Text>
                    <Text style={styles.kpiSub}>zużycie / rząd</Text>
                  </View>
                ) : result.gramsPerCm2 !== undefined ? (
                  <View style={styles.kpiItem}>
                    <Text style={styles.kpiLabel}>Gramatura dzianiny</Text>
                    <Text style={styles.kpiValue}>{(result.gramsPerCm2 * 10000).toFixed(0)} g/m²</Text>
                    <Text style={styles.kpiSub}>gęstość powierzchniowa</Text>
                  </View>
                ) : null}

                {result.estimatedTotalLengthMeters !== undefined && (
                  <View style={[styles.kpiItem, styles.kpiFullWidth]}>
                    <Text style={styles.kpiLabel}>Szacowany metraż</Text>
                    <Text style={styles.kpiValue}>
                      {Math.round(result.estimatedTotalLengthMeters)} m
                      {result.remainingLengthMeters !== undefined && (
                        <Text style={styles.kpiValueSmall}>
                          {' '}
                          (pozostało ok. {Math.round(result.remainingLengthMeters)} m)
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </View>

              {/* Porada / podsumowanie tekstowe */}
              <View style={styles.adviceBox}>
                <Text style={styles.adviceIcon}>💡</Text>
                <Text style={styles.adviceText}>{result.advice}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPrompt}>
              <Text style={styles.emptyPromptText}>
                Wprowadź poprawne dane powyżej, aby wyliczyć zapotrzebowanie na włóczkę.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0ECE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#555555',
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F0ECE8',
  },
  tabButtonActive: {
    backgroundColor: '#8B5E3C',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardHeaderDesc: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 16,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 6,
  },
  yarnPickerContainer: {
    marginBottom: 12,
  },
  yarnChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  yarnChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F4ECE4',
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  yarnChipActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  yarnChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C3E26',
  },
  yarnChipTextActive: {
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  colInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  marginRow: {
    marginTop: 14,
  },
  marginChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  marginChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F0ECE8',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  marginChipActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  marginChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
  },
  marginChipTextActive: {
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5E3C',
    letterSpacing: 1,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeSafe: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  riskBadgeWarning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  riskBadgeDanger: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  riskBadgeTextSafe: {
    color: '#2E7D32',
  },
  riskBadgeTextWarning: {
    color: '#E65100',
  },
  riskBadgeTextDanger: {
    color: '#C62828',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiItem: {
    flexBasis: '48%',
    backgroundColor: '#F8F6F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE2',
  },
  kpiFullWidth: {
    flexBasis: '100%',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777777',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  kpiValueSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  kpiSub: {
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  adviceBox: {
    flexDirection: 'row',
    backgroundColor: '#F4ECE4',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  adviceIcon: {
    fontSize: 16,
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    color: '#5C3E26',
    lineHeight: 17,
    fontWeight: '500',
  },
  emptyPrompt: {
    padding: 24,
    alignItems: 'center',
  },
  emptyPromptText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },
});
