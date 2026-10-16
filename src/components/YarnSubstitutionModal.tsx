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
import {
  YarnSubstitutionService,
  DetailedYarnSubstitutionResult,
  WpiClassification,
  COMMON_MULTI_STRAND_COMBINATIONS,
} from '../core/yarn-substitution-service';

interface YarnSubstitutionModalProps {
  visible: boolean;
  onClose: () => void;
  initialPatternBalls?: number;
  initialPatternLength?: number;
}

export function YarnSubstitutionModal({
  visible,
  onClose,
  initialPatternBalls = 6,
  initialPatternLength = 120,
}: YarnSubstitutionModalProps) {
  const [activeTab, setActiveTab] = useState<'substitution' | 'multistrand' | 'wpi'>('substitution');

  // Stan kalkulatora zamienników
  const [patternBalls, setPatternBalls] = useState<string>(String(initialPatternBalls));
  const [patternLength, setPatternLength] = useState<string>(String(initialPatternLength));
  const [newLength, setNewLength] = useState<string>('150');
  const [newWeight, setNewWeight] = useState<string>('50');
  const [strands, setStrands] = useState<number>(1);
  const [safetyMargin, setSafetyMargin] = useState<number>(10);

  // Stan kalkulatora WPI
  const [wpiInput, setWpiInput] = useState<string>('12');

  // Obliczenia zamiennika
  const substitutionResult = useMemo<DetailedYarnSubstitutionResult | null>(() => {
    const balls = parseInt(patternBalls, 10);
    const pLength = parseFloat(patternLength);
    const nLength = parseFloat(newLength);
    const nWeight = parseFloat(newWeight);

    if (isNaN(balls) || balls <= 0 || isNaN(pLength) || pLength <= 0 || isNaN(nLength) || nLength <= 0) {
      return null;
    }

    return YarnSubstitutionService.calculateSubstitution({
      patternBalls: balls,
      patternBallLengthMeters: pLength,
      newBallLengthMeters: nLength,
      newBallWeightGrams: !isNaN(nWeight) && nWeight > 0 ? nWeight : undefined,
      strands,
      safetyMarginPercent: safetyMargin,
    });
  }, [patternBalls, patternLength, newLength, newWeight, strands, safetyMargin]);

  // Obliczenia WPI
  const wpiResult = useMemo<WpiClassification | null>(() => {
    const w = parseInt(wpiInput, 10);
    if (isNaN(w) || w <= 0) return null;
    return YarnSubstitutionService.classifyByWpi(w);
  }, [wpiInput]);

  const handleShare = async () => {
    if (!substitutionResult) return;
    const shareText = `🧶 Kalkulacja zamiennika włóczki (Oczko):
Wzór: ${patternBalls} motków po ${patternLength} m (${substitutionResult.baseRequiredMeters} m)
Zamiennik: motki po ${newLength} m (${strands > 1 ? `${strands} nitki, ` : ''}margines: +${safetyMargin}%)
Łącznie wymagane: ${substitutionResult.totalRequiredMeters} m
👉 Potrzebujesz: ${substitutionResult.ballsNeeded} motków (${substitutionResult.exactBalls} dokł.)
${substitutionResult.totalEstimatedWeightGrams ? `Szacowana waga: ok. ${substitutionResult.totalEstimatedWeightGrams} g\n` : ''}${substitutionResult.recommendation}`;

    try {
      await Share.share({ message: shareText });
    } catch {
      // Ignorujemy anulowanie przez użytkownika
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Górny pasek */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Zamiennik Włóczek & WPI</Text>
            <Text style={styles.subtitle}>Kalkulator motków, marginesu i nitek</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Zamknij kalkulator zamienników"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Zakładki nawigacyjne */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'substitution' && styles.tabButtonActive]}
            onPress={() => setActiveTab('substitution')}
            accessibilityRole="tab"
            accessibilityLabel="Kalkulator zamiennika"
          >
            <Text style={[styles.tabText, activeTab === 'substitution' && styles.tabTextActive]}>
              🔄 Zamiennik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'multistrand' && styles.tabButtonActive]}
            onPress={() => setActiveTab('multistrand')}
            accessibilityRole="tab"
            accessibilityLabel="Łączenie nitek"
          >
            <Text style={[styles.tabText, activeTab === 'multistrand' && styles.tabTextActive]}>
              🧵 Łączenie nitek
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'wpi' && styles.tabButtonActive]}
            onPress={() => setActiveTab('wpi')}
            accessibilityRole="tab"
            accessibilityLabel="Kalkulator WPI"
          >
            <Text style={[styles.tabText, activeTab === 'wpi' && styles.tabTextActive]}>
              📏 WPI (Grubość)
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* TAB 1: ZAMIENNIK WŁÓCZKI */}
          {activeTab === 'substitution' && (
            <View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>📋 Wymagania z Twojego wzoru</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Liczba motków:</Text>
                    <TextInput
                      style={styles.inputField}
                      value={patternBalls}
                      onChangeText={setPatternBalls}
                      keyboardType="numeric"
                      accessibilityLabel="Liczba motków we wzorze"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Metraż motka (m):</Text>
                    <TextInput
                      style={styles.inputField}
                      value={patternLength}
                      onChangeText={setPatternLength}
                      keyboardType="numeric"
                      accessibilityLabel="Metraż motka we wzorze w metrach"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>🧶 Wybrana nowa włóczka (zamiennik)</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Metraż nowego motka (m):</Text>
                    <TextInput
                      style={styles.inputField}
                      value={newLength}
                      onChangeText={setNewLength}
                      keyboardType="numeric"
                      accessibilityLabel="Metraż nowego motka w metrach"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Waga motka (g, opcja):</Text>
                    <TextInput
                      style={styles.inputField}
                      value={newWeight}
                      onChangeText={setNewWeight}
                      keyboardType="numeric"
                      accessibilityLabel="Waga nowego motka w gramach"
                    />
                  </View>
                </View>

                {/* Liczba nitek */}
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Liczba nitek:</Text>
                <View style={styles.chipRow}>
                  {[1, 2, 3].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, strands === s && styles.chipActive]}
                      onPress={() => setStrands(s)}
                      accessibilityLabel={`Dzierganie z ${s} ${s === 1 ? 'nitki' : 'nitek'}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.chipText, strands === s && styles.chipTextActive]}>
                        {s === 1 ? '1 nitka' : `${s} nitki`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Margines bezpieczeństwa */}
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Margines bezpieczeństwa:</Text>
                <View style={styles.chipRow}>
                  {[0, 5, 10, 15, 20].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.chip, safetyMargin === m && styles.chipActive]}
                      onPress={() => setSafetyMargin(m)}
                      accessibilityLabel={`Margines bezpieczeństwa ${m} procent`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.chipText, safetyMargin === m && styles.chipTextActive]}>
                        {m === 0 ? 'Brak' : `+${m}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Karta Wynikowa */}
              {substitutionResult ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Wynik kalkulacji</Text>
                  <View style={styles.resultHeroRow}>
                    <Text style={styles.heroNumber}>{substitutionResult.ballsNeeded}</Text>
                    <View style={styles.heroLabels}>
                      <Text style={styles.heroUnit}>motków zamiennika</Text>
                      <Text style={styles.heroSubText}>
                        Dokładnie: {substitutionResult.exactBalls} motka
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Wymagany metraż ze wzoru:</Text>
                    <Text style={styles.metricValue}>{substitutionResult.baseRequiredMeters} m</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Dodany margines (+{safetyMargin}%):</Text>
                    <Text style={styles.metricValue}>+{substitutionResult.safetyMetersAdded} m</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Łączny metraż do zakupu:</Text>
                    <Text style={[styles.metricValue, { fontWeight: '700' }]}>
                      {substitutionResult.totalRequiredMeters} m
                    </Text>
                  </View>
                  {substitutionResult.totalEstimatedWeightGrams && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Szacowana waga gotowego wyrobu:</Text>
                      <Text style={styles.metricValue}>
                        ok. {substitutionResult.totalEstimatedWeightGrams} g
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.recommendationBox,
                      substitutionResult.isTightMargin
                        ? styles.recommendationTight
                        : styles.recommendationSafe,
                    ]}
                  >
                    <Text style={styles.recommendationText}>
                      {substitutionResult.recommendation}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    accessibilityLabel="Udostępnij kalkulację zamiennika"
                    accessibilityRole="button"
                  >
                    <Text style={styles.shareButtonText}>📤 Udostępnij lub skopiuj kalkulację</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.invalidCard}>
                  <Text style={styles.invalidText}>
                    Wprowadź dodatnie wartości liczbowe dla motków i metrażu.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: ŁĄCZENIE NITEK (MULTI-STRAND) */}
          {activeTab === 'multistrand' && (
            <View>
              <Text style={styles.infoParagraph}>
                Gdy dziergasz z dwóch lub trzech nitek jednocześnie, uzyskujesz grubszą dzianinę. Poniżej
                znajdziesz najpopularniejsze, sprawdzone w rzemiośle połączenia:
              </Text>

              {COMMON_MULTI_STRAND_COMBINATIONS.map((item) => (
                <View key={item.id} style={styles.comboCard}>
                  <View style={styles.comboHeaderRow}>
                    <Text style={styles.comboTitle}>{item.name}</Text>
                    <View style={styles.cycBadge}>
                      <Text style={styles.cycBadgeText}>CYC {item.resultingCyc}</Text>
                    </View>
                  </View>
                  <Text style={styles.comboStandard}>👉 Odpowiednik: {item.resultingStandardName}</Text>
                  <Text style={styles.comboDesc}>{item.description}</Text>
                  <Text style={styles.comboNeedles}>📏 Typowe druty: {item.recommendedNeedlesMm}</Text>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: WPI (WRAPS PER INCH) */}
          {activeTab === 'wpi' && (
            <View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>📏 Identyfikator WPI (Wraps Per Inch)</Text>
                <Text style={styles.wpiExplainer}>
                  Nawiń włóczkę równolegle na linijkę lub ołówek bez naciągania i policz, ile zwojów mieści
                  się na długości 1 cala (2.54 cm).
                </Text>

                <View style={styles.wpiControlRow}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => {
                      const cur = parseInt(wpiInput, 10) || 1;
                      if (cur > 1) setWpiInput(String(cur - 1));
                    }}
                    accessibilityLabel="Zmniejsz liczbę owinięć WPI o jeden"
                    accessibilityRole="button"
                  >
                    <Text style={styles.stepperText}>-</Text>
                  </TouchableOpacity>

                  <View style={styles.wpiInputWrapper}>
                    <TextInput
                      style={styles.wpiInputField}
                      value={wpiInput}
                      onChangeText={setWpiInput}
                      keyboardType="numeric"
                      accessibilityLabel="Liczba owinięć na cal WPI"
                    />
                    <Text style={styles.wpiInputSuffix}>owinięć / cal (WPI)</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => {
                      const cur = parseInt(wpiInput, 10) || 0;
                      setWpiInput(String(cur + 1));
                    }}
                    accessibilityLabel="Zwiększ liczbę owinięć WPI o jeden"
                    accessibilityRole="button"
                  >
                    <Text style={styles.stepperText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {wpiResult && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Rozpoznana grubość przędzy</Text>
                  <Text style={styles.wpiSummaryText}>{wpiResult.summaryText}</Text>

                  {wpiResult.standards.map((std) => (
                    <View key={std.category} style={styles.stdItem}>
                      <View style={styles.stdHeader}>
                        <Text style={styles.stdName}>
                          CYC {std.cycNumber}: {std.namePl}
                        </Text>
                        <Text style={styles.stdWpiBadge}>{wpiResult.wpi} WPI</Text>
                      </View>
                      <Text style={styles.stdDetail}>📏 Druty: {std.recommendedNeedlesMm}</Text>
                      <Text style={styles.stdDetail}>📐 Próbka: {std.typicalGaugeStitches}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5DF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  subtitle: {
    fontSize: 13,
    color: '#795548',
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFEBE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5EFEB',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabButtonActive: {
    backgroundColor: '#5D4037',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D4C41',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEBE9',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D4C41',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#3E2723',
    minHeight: 44,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EFEBE9',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#6D4C41',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4037',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0D6CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 10,
  },
  resultHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginVertical: 6,
  },
  heroNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#6D4C41',
  },
  heroLabels: {
    flex: 1,
  },
  heroUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E2723',
  },
  heroSubText: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEBE9',
    marginVertical: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6D4C41',
  },
  metricValue: {
    fontSize: 13,
    color: '#3E2723',
    fontWeight: '600',
  },
  recommendationBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  recommendationSafe: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationTight: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#F5EFEB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
  },
  invalidCard: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  invalidText: {
    fontSize: 13,
    color: '#C62828',
    textAlign: 'center',
  },
  infoParagraph: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5D4037',
    marginBottom: 14,
  },
  comboCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE9',
  },
  comboHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comboTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3E2723',
    flex: 1,
  },
  cycBadge: {
    backgroundColor: '#6D4C41',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cycBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  comboStandard: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8D6E63',
    marginVertical: 4,
  },
  comboDesc: {
    fontSize: 12,
    color: '#5D4037',
    marginVertical: 2,
  },
  comboNeedles: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E342E',
    marginTop: 4,
  },
  wpiExplainer: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6D4C41',
    marginBottom: 14,
  },
  wpiControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6D4C41',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  wpiInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  wpiInputField: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3E2723',
    textAlign: 'center',
    minHeight: 44,
  },
  wpiInputSuffix: {
    fontSize: 11,
    color: '#8D6E63',
  },
  wpiSummaryText: {
    fontSize: 13,
    color: '#4E342E',
    marginBottom: 12,
    fontWeight: '500',
  },
  stdItem: {
    backgroundColor: '#FDFBF7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEBE9',
  },
  stdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stdName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E2723',
  },
  stdWpiBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D4C41',
  },
  stdDetail: {
    fontSize: 12,
    color: '#5D4037',
    marginTop: 2,
  },
  stdDesc: {
    fontSize: 11,
    color: '#8D6E63',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
