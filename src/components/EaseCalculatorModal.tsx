import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EASE_PRESETS,
  EasePresetId,
  recommendPatternSize,
  findStandardSizeByBust,
  adaptStitchesWithRecommendation,
  SizeRecommendationResult,
  AdaptedStitchesResult,
} from '../core/ease-calculator-service';

interface EaseCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialBodyBustCm?: number;
  initialPatternSizes?: string;
  initialPatternStitches?: number;
  initialPatternGauge?: number;
  initialMyGauge?: number;
}

export function EaseCalculatorModal({
  visible,
  onClose,
  initialBodyBustCm = 92,
  initialPatternSizes = '85, 95, 105, 115, 125, 135',
  initialPatternStitches = 100,
  initialPatternGauge = 20,
  initialMyGauge = 22,
}: EaseCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'fit' | 'adaptation'>('fit');

  // Stan zakładki Doboru Rozmiaru i Luzu (Fit)
  const [bodyBust, setBodyBust] = useState<string>(String(initialBodyBustCm));
  const [selectedPresetId, setSelectedPresetId] = useState<EasePresetId>('classic_fit');
  const [customEase, setCustomEase] = useState<string>('7');
  const [patternSizesText, setPatternSizesText] = useState<string>(initialPatternSizes);

  // Stan zakładki Adaptacji Oczek (Gauge Adaptation)
  const [patternStitches, setPatternStitches] = useState<string>(String(initialPatternStitches));
  const [patternGauge, setPatternGauge] = useState<string>(String(initialPatternGauge));
  const [myGauge, setMyGauge] = useState<string>(String(initialMyGauge));
  const [repeatMultiple, setRepeatMultiple] = useState<string>('4');
  const [edgeStitches, setEdgeStitches] = useState<string>('2');

  // Wybrany preset luzu
  const currentPreset = useMemo(() => {
    return EASE_PRESETS.find((p) => p.id === selectedPresetId) || EASE_PRESETS[4];
  }, [selectedPresetId]);

  // Ustawienie presetu
  const handleSelectPreset = (presetId: EasePresetId) => {
    setSelectedPresetId(presetId);
    const p = EASE_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setCustomEase(String(p.recommendedEaseCm));
    }
  };

  // Rozpoznany standard sylwetki
  const standardSizeMatch = useMemo(() => {
    const val = parseFloat(bodyBust);
    if (isNaN(val) || val <= 0) return null;
    return findStandardSizeByBust(val);
  }, [bodyBust]);

  // Kalkulacja doboru rozmiaru
  const sizeRecommendation = useMemo<SizeRecommendationResult | null>(() => {
    const body = parseFloat(bodyBust);
    const ease = parseFloat(customEase);

    if (isNaN(body) || body <= 0 || isNaN(ease)) return null;

    // Parsowanie rozmiarów rozdzielonych przecinkami lub spacjami
    const sizes = patternSizesText
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item, idx) => {
        const parsed = parseFloat(item);
        return {
          name: isNaN(parsed) ? item : `Rozmiar ${idx + 1} (${parsed} cm)`,
          finishedCircumferenceCm: isNaN(parsed) ? 0 : parsed,
        };
      })
      .filter((s) => s.finishedCircumferenceCm > 0);

    if (sizes.length === 0) return null;

    try {
      return recommendPatternSize(body, ease, sizes);
    } catch {
      return null;
    }
  }, [bodyBust, customEase, patternSizesText]);

  // Kalkulacja adaptacji oczek
  const adaptationResult = useMemo<AdaptedStitchesResult | null>(() => {
    const pStitches = parseInt(patternStitches, 10);
    const pGauge = parseFloat(patternGauge);
    const mGauge = parseFloat(myGauge);
    const rep = parseInt(repeatMultiple, 10) || 1;
    const edge = parseInt(edgeStitches, 10) || 0;

    if (
      isNaN(pStitches) ||
      pStitches <= 0 ||
      isNaN(pGauge) ||
      pGauge <= 0 ||
      isNaN(mGauge) ||
      mGauge <= 0 ||
      rep <= 0 ||
      edge < 0
    ) {
      return null;
    }

    try {
      return adaptStitchesWithRecommendation({
        patternStitches: pStitches,
        patternGaugePer10cm: pGauge,
        myGaugePer10cm: mGauge,
        repeatMultiple: rep,
        edgeStitches: edge,
      });
    } catch {
      return null;
    }
  }, [patternStitches, patternGauge, myGauge, repeatMultiple, edgeStitches]);

  // Udostępnianie wyniku
  const handleShare = async () => {
    if (activeTab === 'fit' && sizeRecommendation) {
      const text =
        `👕 Dobór Rozmiaru & Luz Dziewiarski (Oczko):\n` +
        `Obwód ciała: ${bodyBust} cm\n` +
        `Pożądany luz: ${customEase} cm (${currentPreset.labelPl})\n` +
        `Zalecany rozmiar: ${sizeRecommendation.recommendedSize.name}\n` +
        `Rzeczywisty luz: ${sizeRecommendation.recommendedSize.resultingEaseCm >= 0 ? '+' : ''}${sizeRecommendation.recommendedSize.resultingEaseCm} cm (${sizeRecommendation.recommendedSize.category})\n\n` +
        `Wyliczone w aplikacji Oczko 🧶`;
      await Share.share({ message: text });
    } else if (activeTab === 'adaptation' && adaptationResult) {
      const text =
        `📐 Adaptacja Oczek do Próbki (Oczko):\n` +
        `Wzór: ${patternStitches} o. przy ${patternGauge} o./10 cm\n` +
        `Moja próbka: ${myGauge} o./10 cm\n` +
        `${adaptationResult.advicePl}\n\n` +
        `Wyliczone w aplikacji Oczko 🧶`;
      await Share.share({ message: text });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Luz i Dobór Rozmiaru</Text>
              <Text style={styles.headerSubtitle}>
                Precyzyjna konstrukcja i przeliczanie oczek
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShare}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Udostępnij raport dopasowania"
              >
                <Text style={styles.iconButtonText}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Zamknij kalkulator luzu"
              >
                <Text style={styles.iconButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Zakładki */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'fit' && styles.activeTab]}
              onPress={() => setActiveTab('fit')}
              accessibilityRole="tab"
              accessibilityLabel="Zakładka ocena luzu i dobór rozmiaru"
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'fit' && styles.activeTabText,
                ]}
              >
                👕 Rozmiar & Luz
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'adaptation' && styles.activeTab]}
              onPress={() => setActiveTab('adaptation')}
              accessibilityRole="tab"
              accessibilityLabel="Zakładka przelicznik oczek do innej próbki"
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'adaptation' && styles.activeTabText,
                ]}
              >
                📐 Przelicznik Oczek
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {activeTab === 'fit' ? (
              <View style={styles.tabBody}>
                {/* Obwód ciała */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Twój obwód biustu / klatki (cm)
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    value={bodyBust}
                    onChangeText={setBodyBust}
                    placeholder="np. 92"
                    placeholderTextColor="#A1887F"
                    accessibilityLabel="Pole obwodu biustu w centymetrach"
                  />
                  {standardSizeMatch && (
                    <Text style={styles.helperText}>
                      {`Standard CYC: Rozmiar ${standardSizeMatch.code} (typowe: ${standardSizeMatch.typicalBustCm} cm, zakres: ${standardSizeMatch.bustMinCm}–${standardSizeMatch.bustMaxCm} cm)`}
                    </Text>
                  )}
                </View>

                {/* Presety luzu */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pożądany styl i luz odzieżowy</Text>
                  <View style={styles.chipGrid}>
                    {EASE_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetChip,
                          selectedPresetId === preset.id && styles.presetChipActive,
                        ]}
                        onPress={() => handleSelectPreset(preset.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Wybierz styl luzu: ${preset.labelPl}`}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            selectedPresetId === preset.id &&
                              styles.presetChipTextActive,
                          ]}
                        >
                          {preset.labelPl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.presetDescription}>
                    💡 {currentPreset.recommendedFor}
                  </Text>
                </View>

                {/* Precyzyjna korekta luzu */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Dokładny luz w centymetrach (cm)
                  </Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => {
                        setCustomEase((prev) => String((parseFloat(prev) || 0) - 1));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Zmniejsz pożądany luz o 1 cm"
                    >
                      <Text style={styles.stepperButtonText}>-1 cm</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.inputField, styles.stepperInput]}
                      keyboardType="numeric"
                      value={customEase}
                      onChangeText={setCustomEase}
                      placeholder="0"
                      accessibilityLabel="Wartość pożądanego luzu w cm"
                    />
                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => {
                        setCustomEase((prev) => String((parseFloat(prev) || 0) + 1));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Zwiększ pożądany luz o 1 cm"
                    >
                      <Text style={styles.stepperButtonText}>+1 cm</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Dostępne obwody we wzorze */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Obwody klatki gotowego swetra we wzorze (cm, po przecinku)
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    value={patternSizesText}
                    onChangeText={setPatternSizesText}
                    placeholder="85, 95, 105, 115, 125"
                    placeholderTextColor="#A1887F"
                    accessibilityLabel="Lista obwodów gotowego wyrobu we wzorze rozdzielona przecinkami"
                  />
                  <Text style={styles.helperText}>
                    Wpisz obwody gotowego wyrobu dla kolejnych rozmiarów ze wzoru.
                  </Text>
                </View>

                {/* Karta Wynikowa Rekomendacji */}
                {sizeRecommendation && (
                  <View style={styles.resultCard}>
                    <View style={styles.resultBadgeRow}>
                      <Text style={styles.resultBadge}>
                        🎯 REKOMENDOWANY ROZMIAR
                      </Text>
                      <Text style={styles.resultCategoryBadge}>
                        {sizeRecommendation.recommendedSize.category}
                      </Text>
                    </View>

                    <Text style={styles.resultMainTitle}>
                      {sizeRecommendation.recommendedSize.name}
                    </Text>

                    <Text style={styles.resultExplanation}>
                      {sizeRecommendation.explanationPl}
                    </Text>

                    <View style={styles.metricsGrid}>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Cel z luzem</Text>
                        <Text style={styles.metricValue}>
                          {sizeRecommendation.targetGarmentCircumferenceCm} cm
                        </Text>
                      </View>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Obwód wzoru</Text>
                        <Text style={styles.metricValue}>
                          {sizeRecommendation.recommendedSize.finishedCircumferenceCm} cm
                        </Text>
                      </View>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Rzeczywisty luz</Text>
                        <Text style={styles.metricValueHighlight}>
                          {sizeRecommendation.recommendedSize.resultingEaseCm >= 0 ? '+' : ''}
                          {sizeRecommendation.recommendedSize.resultingEaseCm} cm
                        </Text>
                      </View>
                    </View>

                    {/* Tabela porównawcza rozmiarów */}
                    <Text style={styles.subtableTitle}>
                      Wszystkie rozmiary ze wzoru:
                    </Text>
                    {sizeRecommendation.allCandidates.map((cand, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.candidateRow,
                          cand.isClosest && styles.candidateRowActive,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.candidateName,
                              cand.isClosest && styles.candidateNameActive,
                            ]}
                          >
                            {cand.name}
                          </Text>
                          <Text style={styles.candidateDetails}>
                            {cand.finishedCircumferenceCm} cm ({cand.category})
                          </Text>
                        </View>
                        <View style={styles.candidateEaseBadge}>
                          <Text style={styles.candidateEaseText}>
                            {cand.resultingEaseCm >= 0 ? '+' : ''}
                            {cand.resultingEaseCm} cm
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.tabBody}>
                {/* Wzór: Oczka i Próbka */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Oczka ze wzoru</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={patternStitches}
                      onChangeText={setPatternStitches}
                      placeholder="100"
                      accessibilityLabel="Liczba oczek ze wzoru"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Wzór: o. / 10 cm</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={patternGauge}
                      onChangeText={setPatternGauge}
                      placeholder="20"
                      accessibilityLabel="Gęstość oczek ze wzoru na 10 centymetrów"
                    />
                  </View>
                </View>

                {/* Moja próbka */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Twoja rzeczywista próbka (o. / 10 cm)
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    value={myGauge}
                    onChangeText={setMyGauge}
                    placeholder="22"
                    accessibilityLabel="Twoja własna gęstość próbki na 10 centymetrów"
                  />
                  <Text style={styles.helperText}>
                    Zmierz próbkę po wypraniu i zblokowaniu.
                  </Text>
                </View>

                {/* Parametry raportu ściegu */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Raport wzoru (o.)</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={repeatMultiple}
                      onChangeText={setRepeatMultiple}
                      placeholder="4"
                      accessibilityLabel="Wielokrotność raportu wzoru np. 4 dla ściągacza 2 na 2"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Oczka brzegowe</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={edgeStitches}
                      onChangeText={setEdgeStitches}
                      placeholder="2"
                      accessibilityLabel="Liczba oczek brzegowych"
                    />
                  </View>
                </View>

                {/* Wyniki adaptacji */}
                {adaptationResult && (
                  <View style={styles.resultCard}>
                    <View style={styles.resultBadgeRow}>
                      <Text style={styles.resultBadge}>📐 ADAPTACJA OCZEK</Text>
                      <Text style={styles.resultCategoryBadge}>
                        Cel: {adaptationResult.originalTargetWidthCm} cm
                      </Text>
                    </View>

                    <Text style={styles.resultMainTitle}>
                      {adaptationResult.recommendedStitches} oczek
                    </Text>

                    <Text style={styles.resultExplanation}>
                      {adaptationResult.advicePl}
                    </Text>

                    {/* Porównanie opcji mniejszej i większej */}
                    <View style={styles.comparisonGrid}>
                      <View
                        style={[
                          styles.candidateBox,
                          adaptationResult.chosenCandidate === 'lower' &&
                            styles.candidateBoxActive,
                        ]}
                      >
                        <Text style={styles.candidateBoxHeader}>
                          {`Wariant mniejszy${adaptationResult.chosenCandidate === 'lower' ? ' ⭐' : ''}`}
                        </Text>
                        <Text style={styles.candidateBoxStitches}>
                          {adaptationResult.lowerCandidate.stitches} o.
                        </Text>
                        <Text style={styles.candidateBoxDesc}>
                          {adaptationResult.lowerCandidate.resultingWidthCm} cm
                          {adaptationResult.lowerCandidate.widthDifferenceCm > 0
                            ? ` (${adaptationResult.lowerCandidate.widthDifferenceCm} cm różnicy)`
                            : ''}
                        </Text>
                        {adaptationResult.lowerCandidate.k > 0 && (
                          <Text style={styles.candidateBoxK}>
                            k = {adaptationResult.lowerCandidate.k} powtórzeń
                          </Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.candidateBox,
                          adaptationResult.chosenCandidate === 'upper' &&
                            styles.candidateBoxActive,
                        ]}
                      >
                        <Text style={styles.candidateBoxHeader}>
                          {`Wariant większy${adaptationResult.chosenCandidate === 'upper' ? ' ⭐' : ''}`}
                        </Text>
                        <Text style={styles.candidateBoxStitches}>
                          {adaptationResult.upperCandidate.stitches} o.
                        </Text>
                        <Text style={styles.candidateBoxDesc}>
                          {adaptationResult.upperCandidate.resultingWidthCm} cm
                          {adaptationResult.upperCandidate.widthDifferenceCm > 0
                            ? ` (${adaptationResult.upperCandidate.widthDifferenceCm} cm różnicy)`
                            : ''}
                        </Text>
                        {adaptationResult.upperCandidate.k > 0 && (
                          <Text style={styles.candidateBoxK}>
                            k = {adaptationResult.upperCandidate.k} powtórzeń
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F5EFEB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D6CC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#795548',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFEBE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 16,
    color: '#5D4037',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EAE1DA',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#D7CCC8',
  },
  activeTab: {
    backgroundColor: '#6D4C41',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E342E',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabBody: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3E2723',
    minHeight: 44,
  },
  helperText: {
    fontSize: 11,
    color: '#8D6E63',
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  presetChip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#6D4C41',
    borderColor: '#5D4037',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5D4037',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  presetDescription: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6D4C41',
    marginTop: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  stepperButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    backgroundColor: '#EFEBE9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  stepperButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D4037',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0D6CC',
    marginTop: 8,
    gap: 12,
  },
  resultBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B71C1C',
    letterSpacing: 0.5,
  },
  resultCategoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#EFEBE9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#5D4037',
    textTransform: 'capitalize',
  },
  resultMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3E2723',
  },
  resultExplanation: {
    fontSize: 13,
    color: '#4E342E',
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#8D6E63',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3E2723',
  },
  metricValueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E7D32',
  },
  subtableTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5D4037',
    marginTop: 6,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FAF7F5',
    marginBottom: 4,
  },
  candidateRowActive: {
    backgroundColor: '#EFEBE9',
    borderLeftWidth: 4,
    borderLeftColor: '#6D4C41',
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E2723',
  },
  candidateNameActive: {
    fontWeight: '800',
    color: '#1B5E20',
  },
  candidateDetails: {
    fontSize: 11,
    color: '#795548',
  },
  candidateEaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0D6CC',
  },
  candidateEaseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E2723',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  candidateBox: {
    flex: 1,
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D6CC',
    alignItems: 'center',
  },
  candidateBoxActive: {
    backgroundColor: '#F1F8E9',
    borderColor: '#81C784',
    borderWidth: 2,
  },
  candidateBoxHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 6,
  },
  candidateBoxStitches: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  candidateBoxDesc: {
    fontSize: 11,
    color: '#4E342E',
    textAlign: 'center',
  },
  candidateBoxK: {
    fontSize: 10,
    color: '#795548',
    marginTop: 4,
  },
});
