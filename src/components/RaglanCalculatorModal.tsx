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
  RaglanCalculator,
  RaglanCastOnDivision,
  ShortRowsPlan,
  RaglanYokeResult,
} from '../core/raglan-calculator';

interface RaglanCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialCastOnStitches?: number;
  initialStitchGauge?: number;
  initialRowGauge?: number;
}

export function RaglanCalculatorModal({
  visible,
  onClose,
  initialCastOnStitches = 88,
  initialStitchGauge = 20,
  initialRowGauge = 28,
}: RaglanCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'caston' | 'yoke'>('caston');

  // Stan zakładki podziału i rzędów skróconych
  const [castOnInput, setCastOnInput] = useState<string>(String(initialCastOnStitches));
  const [raglanLineWidth, setRaglanLineWidth] = useState<number>(2);
  const [shortRowTurns, setShortRowTurns] = useState<number>(4);
  const [neckRiseInput, setNeckRiseInput] = useState<string>('3.0');

  // Stan próbki i wymiarów karczku
  const [stitchGaugeInput, setStitchGaugeInput] = useState<string>(String(initialStitchGauge));
  const [rowGaugeInput, setRowGaugeInput] = useState<string>(String(initialRowGauge));
  const [chestCircInput, setChestCircInput] = useState<string>('100');
  const [sleeveCircInput, setSleeveCircInput] = useState<string>('34');
  const [yokeDepthInput, setYokeDepthInput] = useState<string>('22');
  const [underarmStitches, setUnderarmStitches] = useState<number>(8);

  // Kalkulacja podziału dekoltu
  const divisionResult = useMemo<RaglanCastOnDivision | null>(() => {
    const total = parseInt(castOnInput, 10);
    if (isNaN(total) || total <= 0) return null;

    try {
      return RaglanCalculator.calculateCastOnDivision({
        totalCastOnStitches: total,
        raglanLineStitches: raglanLineWidth,
        shortRowTurnsPerSide: shortRowTurns,
      });
    } catch {
      return null;
    }
  }, [castOnInput, raglanLineWidth, shortRowTurns]);

  // Kalkulacja planu rzędów skróconych
  const shortRowsPlan = useMemo<ShortRowsPlan | null>(() => {
    const neckRise = parseFloat(neckRiseInput);
    const rowGauge = parseFloat(rowGaugeInput);

    if (
      isNaN(neckRise) ||
      neckRise <= 0 ||
      isNaN(rowGauge) ||
      rowGauge <= 0 ||
      !divisionResult
    ) {
      return null;
    }

    return RaglanCalculator.calculateGermanShortRows({
      neckRiseCm: neckRise,
      rowGaugePer10cm: rowGauge,
      sleeveStitches: divisionResult.initialSleeveStitches,
      frontStitches: divisionResult.initialFrontStitches,
    });
  }, [neckRiseInput, rowGaugeInput, divisionResult]);

  // Kalkulacja karczku i przyrostów
  const yokeResult = useMemo<RaglanYokeResult | null>(() => {
    const stitchGauge = parseFloat(stitchGaugeInput);
    const rowGauge = parseFloat(rowGaugeInput);
    const chest = parseFloat(chestCircInput);
    const sleeve = parseFloat(sleeveCircInput);
    const depth = parseFloat(yokeDepthInput);

    if (
      isNaN(stitchGauge) ||
      stitchGauge <= 0 ||
      isNaN(rowGauge) ||
      rowGauge <= 0 ||
      isNaN(chest) ||
      chest <= 0 ||
      isNaN(sleeve) ||
      sleeve <= 0 ||
      isNaN(depth) ||
      depth <= 0 ||
      !divisionResult
    ) {
      return null;
    }

    return RaglanCalculator.calculateYokeIncreases({
      stitchGaugePer10cm: stitchGauge,
      rowGaugePer10cm: rowGauge,
      desiredChestCircumferenceCm: chest,
      desiredSleeveCircumferenceCm: sleeve,
      yokeDepthCm: depth,
      initialBackStitches: divisionResult.initialBackStitches,
      initialFrontStitches: divisionResult.initialFrontStitches,
      initialSleeveStitches: divisionResult.initialSleeveStitches,
      raglanLineStitches: raglanLineWidth,
      underarmCastOnStitches: underarmStitches,
    });
  }, [
    stitchGaugeInput,
    rowGaugeInput,
    chestCircInput,
    sleeveCircInput,
    yokeDepthInput,
    underarmStitches,
    divisionResult,
    raglanLineWidth,
  ]);

  // Udostępnianie raportu konstrukcji
  const handleShare = async () => {
    if (activeTab === 'caston' && divisionResult) {
      const text =
        `🥋 Konstrukcja Raglanu od Góry (Oczko):\n` +
        `Nabrane oczka: ${divisionResult.totalCastOnStitches} o.\n` +
        `Podział początkowy:\n` +
        `• Tył: ${divisionResult.initialBackStitches} o.\n` +
        `• Przód: ${divisionResult.initialFrontStitches} o.\n` +
        `• Rękawy: 2 × ${divisionResult.initialSleeveStitches} o.\n` +
        `• Linie raglanu: 4 × ${divisionResult.raglanLineStitches} o.\n` +
        `Kompensacja GSR: ${divisionResult.shortRowTurnsPerSide} obrotów na stronę -> po rzędach skróconych tył i przód = ${divisionResult.finalBackAfterShortRows} o.\n\n` +
        `Wyliczone w aplikacji Oczko 🧶`;
      await Share.share({ message: text });
    } else if (activeTab === 'yoke' && yokeResult) {
      const text =
        `🥋 Karczek Raglanowy & Podkrój Pach (Oczko):\n` +
        `Głębokość: ${yokeDepthInput} cm (${yokeResult.totalYokeRounds} rzędów, ${yokeResult.increaseRounds} rz. przyrostów)\n` +
        `Podkrój pod pachami: 2 × ${yokeResult.underarmCastOnStitches} o.\n` +
        `Korpus po oddzieleniu: ${yokeResult.finalBodyStitches} o. (${yokeResult.resultingChestCircumferenceCm} cm)\n` +
        `Rękaw po oddzieleniu: ${yokeResult.finalSleeveStitches} o. (${yokeResult.resultingSleeveCircumferenceCm} cm)\n\n` +
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
              <Text style={styles.headerTitle}>Kalkulator Raglanu</Text>
              <Text style={styles.headerSubtitle}>
                Konstrukcja Top-Down i Rzędy Skrócone (GSR)
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShare}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Udostępnij raport konstrukcji raglanu"
              >
                <Text style={styles.iconButtonText}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Zamknij kalkulator raglanu"
              >
                <Text style={styles.iconButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Zakładki */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'caston' && styles.activeTab]}
              onPress={() => setActiveTab('caston')}
              accessibilityRole="tab"
              accessibilityLabel="Zakładka podział dekoltu i rzędy skrócone"
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'caston' && styles.activeTabText,
                ]}
              >
                📐 Podział Dekoltu & GSR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'yoke' && styles.activeTab]}
              onPress={() => setActiveTab('yoke')}
              accessibilityRole="tab"
              accessibilityLabel="Zakładka karczek i podkrój pach"
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'yoke' && styles.activeTabText,
                ]}
              >
                🥋 Karczek & Pachy
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {activeTab === 'caston' ? (
              <View style={styles.tabBody}>
                {/* Oczka dekoltu */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Łączna liczba oczek nabieranych na dekolt
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    value={castOnInput}
                    onChangeText={setCastOnInput}
                    placeholder="np. 88"
                    placeholderTextColor="#A1887F"
                    accessibilityLabel="Pole liczby oczek nabieranych na dekolt"
                  />
                  <Text style={styles.helperText}>
                    Oczka po ściągaczu dekoltu przed rozpoczęciem reglanu.
                  </Text>
                </View>

                {/* Szerokość linii raglanu */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Oczka na pojedynczą linię raglanu (4 linie łącznie)
                  </Text>
                  <View style={styles.chipRow}>
                    {[1, 2, 3, 4].map((width) => (
                      <TouchableOpacity
                        key={width}
                        style={[
                          styles.chip,
                          raglanLineWidth === width && styles.chipActive,
                        ]}
                        onPress={() => setRaglanLineWidth(width)}
                        accessibilityRole="button"
                        accessibilityLabel={`Wybierz szerokość linii raglanu ${width} oczek`}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            raglanLineWidth === width && styles.chipTextActive,
                          ]}
                        >
                          {width} o. (4×{width}={4 * width} o.)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Obroty rzędów skróconych */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Liczba obrotów rzędów skróconych (GSR) na stronę
                  </Text>
                  <View style={styles.chipRow}>
                    {[0, 2, 3, 4, 5, 6].map((turns) => (
                      <TouchableOpacity
                        key={turns}
                        style={[
                          styles.chip,
                          shortRowTurns === turns && styles.chipActive,
                        ]}
                        onPress={() => setShortRowTurns(turns)}
                        accessibilityRole="button"
                        accessibilityLabel={`Wybierz liczbę obrotów GSR: ${turns}`}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            shortRowTurns === turns && styles.chipTextActive,
                          ]}
                        >
                          {turns === 0 ? 'Bez GSR' : `${turns} obrotów`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.helperText}>
                    Standardowo 3–5 obrotów daje idealnie leżący dekolt bez ciągnięcia z tyłu.
                  </Text>
                </View>

                {/* Karta Wynikowa Podziału */}
                {divisionResult && (
                  <View style={styles.resultCard}>
                    <View style={styles.resultBadgeRow}>
                      <Text style={styles.resultBadge}>📐 SCHEMAT PODZIAŁU DEKOLTU</Text>
                      <Text style={styles.resultCategoryBadge}>
                        {divisionResult.isBalancedAfterShortRows
                          ? '✅ Wyrównany po GSR'
                          : 'Asymetryczny'}
                      </Text>
                    </View>

                    {/* Schemat rzemieślniczy */}
                    <View style={styles.schematicGrid}>
                      <View style={styles.schematicRow}>
                        <View style={[styles.schematicBox, styles.schematicBack]}>
                          <Text style={styles.schematicLabel}>TYŁ (Back)</Text>
                          <Text style={styles.schematicValue}>
                            {divisionResult.initialBackStitches} o.
                          </Text>
                          <Text style={styles.schematicSubtext}>
                            {`-> po GSR: ${divisionResult.finalBackAfterShortRows} o.`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.schematicMiddleRow}>
                        <View style={[styles.schematicBox, styles.schematicSleeve]}>
                          <Text style={styles.schematicLabel}>LEWY RĘKAW</Text>
                          <Text style={styles.schematicValue}>
                            {divisionResult.initialSleeveStitches} o.
                          </Text>
                        </View>
                        <View style={styles.schematicCenter}>
                          <Text style={styles.schematicCenterText}>
                            {`4 linie raglanu\npo ${divisionResult.raglanLineStitches} o.`}
                          </Text>
                        </View>
                        <View style={[styles.schematicBox, styles.schematicSleeve]}>
                          <Text style={styles.schematicLabel}>PRAWY RĘKAW</Text>
                          <Text style={styles.schematicValue}>
                            {divisionResult.initialSleeveStitches} o.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.schematicRow}>
                        <View style={[styles.schematicBox, styles.schematicFront]}>
                          <Text style={styles.schematicLabel}>PRZÓD (Front)</Text>
                          <Text style={styles.schematicValue}>
                            {divisionResult.initialFrontStitches} o.
                          </Text>
                          <Text style={styles.schematicSubtext}>
                            (dekolt głębszy z przodu)
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.resultExplanation}>
                      {divisionResult.divisionFormulaPl}
                    </Text>

                    {/* Kroki wykonania GSR */}
                    {shortRowsPlan && shortRowTurns > 0 && (
                      <View style={styles.gsrSection}>
                        <Text style={styles.gsrTitle}>
                          {`Sekwencja Rzędów Skróconych (${shortRowsPlan.totalShortRows} rz.):`}
                        </Text>
                        {shortRowsPlan.instructionStepsPl.map((step, idx) => (
                          <Text key={idx} style={styles.stepText}>
                            {step}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.tabBody}>
                {/* Wymiary docelowe i głębokość */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Głębokość karczku (cm)</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={yokeDepthInput}
                      onChangeText={setYokeDepthInput}
                      placeholder="22"
                      accessibilityLabel="Głębokość karczku w centymetrach"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Docelowy obwód klatki (cm)</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={chestCircInput}
                      onChangeText={setChestCircInput}
                      placeholder="100"
                      accessibilityLabel="Docelowy obwód klatki piersiowej w centymetrach"
                    />
                  </View>
                </View>

                {/* Obwód rękawa i pachy */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Docelowy rękaw (cm)</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={sleeveCircInput}
                      onChangeText={setSleeveCircInput}
                      placeholder="34"
                      accessibilityLabel="Docelowy obwód rękawa w centymetrach"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Oczka podkroju pachy</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={String(underarmStitches)}
                      onChangeText={(val) => setUnderarmStitches(parseInt(val, 10) || 0)}
                      placeholder="8"
                      accessibilityLabel="Liczba oczek dobieranych pod każdą pachą"
                    />
                  </View>
                </View>

                {/* Próbka ściegu */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Próbka: o. / 10 cm</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={stitchGaugeInput}
                      onChangeText={setStitchGaugeInput}
                      placeholder="20"
                      accessibilityLabel="Gęstość oczek na 10 centymetrów"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.inputLabel}>Próbka: rz. / 10 cm</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={rowGaugeInput}
                      onChangeText={setRowGaugeInput}
                      placeholder="28"
                      accessibilityLabel="Gęstość rzędów na 10 centymetrów"
                    />
                  </View>
                </View>

                {/* Karta Wynikowa Karczku */}
                {yokeResult && (
                  <View style={styles.resultCard}>
                    <View style={styles.resultBadgeRow}>
                      <Text style={styles.resultBadge}>🥋 WYNIKI KARCZKU & PODKROJU</Text>
                      <Text style={styles.resultCategoryBadge}>
                        {yokeResult.totalYokeRounds} rzędów
                      </Text>
                    </View>

                    <Text style={styles.resultMainTitle}>
                      {yokeResult.finalBodyStitches} o. korpus / {yokeResult.finalSleeveStitches} o. rękaw
                    </Text>

                    <Text style={styles.resultExplanation}>
                      {yokeResult.summaryPl}
                    </Text>

                    <View style={styles.metricsGrid}>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Rzędy z przyrostami</Text>
                        <Text style={styles.metricValue}>
                          {yokeResult.increaseRounds} rz.
                        </Text>
                      </View>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Rzędy gładkie</Text>
                        <Text style={styles.metricValue}>
                          {yokeResult.plainRounds} rz.
                        </Text>
                      </View>
                      <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Pachy (2×)</Text>
                        <Text style={styles.metricValueHighlight}>
                          +{yokeResult.underarmCastOnStitches} o.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.comparisonGrid}>
                      <View style={styles.candidateBox}>
                        <Text style={styles.candidateBoxHeader}>Obwód klatki</Text>
                        <Text style={styles.candidateBoxStitches}>
                          {yokeResult.resultingChestCircumferenceCm} cm
                        </Text>
                        <Text style={styles.candidateBoxDesc}>
                          {yokeResult.chestDifferenceCm >= 0 ? '+' : ''}
                          {yokeResult.chestDifferenceCm} cm vs cel
                        </Text>
                      </View>

                      <View style={styles.candidateBox}>
                        <Text style={styles.candidateBoxHeader}>Obwód rękawa</Text>
                        <Text style={styles.candidateBoxStitches}>
                          {yokeResult.resultingSleeveCircumferenceCm} cm
                        </Text>
                        <Text style={styles.candidateBoxDesc}>
                          {yokeResult.sleeveDifferenceCm >= 0 ? '+' : ''}
                          {yokeResult.sleeveDifferenceCm} cm vs cel
                        </Text>
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
    fontSize: 13,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#6D4C41',
    borderColor: '#5D4037',
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
    color: '#8D6E63',
    letterSpacing: 0.5,
  },
  resultCategoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#2E7D32',
  },
  schematicGrid: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D6CC',
    gap: 8,
  },
  schematicRow: {
    alignItems: 'center',
  },
  schematicMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  schematicBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  schematicBack: {
    backgroundColor: '#EFEBE9',
    borderColor: '#BCAAA4',
    minWidth: 160,
  },
  schematicFront: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
    minWidth: 160,
  },
  schematicSleeve: {
    backgroundColor: '#EDE7F6',
    borderColor: '#D1C4E9',
    flex: 1,
  },
  schematicCenter: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  schematicCenterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D6E63',
    textAlign: 'center',
  },
  schematicLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5D4037',
    textTransform: 'uppercase',
  },
  schematicValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3E2723',
    marginTop: 2,
  },
  schematicSubtext: {
    fontSize: 10,
    color: '#795548',
    marginTop: 2,
  },
  resultMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3E2723',
  },
  resultExplanation: {
    fontSize: 12,
    color: '#4E342E',
    lineHeight: 18,
  },
  gsrSection: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEBE9',
    gap: 4,
  },
  gsrTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 11,
    color: '#4E342E',
    lineHeight: 16,
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
  candidateBoxHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 6,
  },
  candidateBoxStitches: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  candidateBoxDesc: {
    fontSize: 11,
    color: '#4E342E',
    textAlign: 'center',
  },
});
