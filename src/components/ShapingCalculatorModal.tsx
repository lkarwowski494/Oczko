import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateEvenIncreases,
  calculateEvenDecreases,
  calculateMultiRowShaping,
  IncreaseMethod,
  DecreaseMethod,
} from '../core/shaping-calculator';

interface ShapingCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialStitches?: number;
}

export function ShapingCalculatorModal({
  visible,
  onClose,
  initialStitches = 80,
}: ShapingCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'increase' | 'decrease' | 'multirow'>('increase');

  // Stan dla dodawania (increase)
  const [incCurrent, setIncCurrent] = useState<string>(String(initialStitches));
  const [incTarget, setIncTarget] = useState<string>(String(initialStitches + 16));
  const [incEdge, setIncEdge] = useState<string>('2');
  const [incMethod, setIncMethod] = useState<IncreaseMethod>('M1L');

  // Stan dla odejmowania (decrease)
  const [decCurrent, setDecCurrent] = useState<string>(String(initialStitches));
  const [decTarget, setDecTarget] = useState<string>(String(Math.max(10, initialStitches - 12)));
  const [decEdge, setDecEdge] = useState<string>('2');
  const [decMethod, setDecMethod] = useState<DecreaseMethod>('k2tog');

  // Stan dla wielorzędowego (multirow)
  const [multiStart, setMultiStart] = useState<string>('44');
  const [multiEnd, setMultiEnd] = useState<string>('64');
  const [multiRows, setMultiRows] = useState<string>('40');
  const [multiPlacement, setMultiPlacement] = useState<'both_edges' | 'single_edge'>('both_edges');
  const [multiRightSideOnly, setMultiRightSideOnly] = useState<boolean>(true);

  // Kalkulacja dodawania
  const increaseResult = useMemo(() => {
    const cur = parseInt(incCurrent, 10) || 0;
    const tgt = parseInt(incTarget, 10) || 0;
    const edg = parseInt(incEdge, 10) || 0;
    return calculateEvenIncreases(cur, tgt, edg, incMethod);
  }, [incCurrent, incTarget, incEdge, incMethod]);

  // Kalkulacja odejmowania
  const decreaseResult = useMemo(() => {
    const cur = parseInt(decCurrent, 10) || 0;
    const tgt = parseInt(decTarget, 10) || 0;
    const edg = parseInt(decEdge, 10) || 0;
    return calculateEvenDecreases(cur, tgt, edg, decMethod);
  }, [decCurrent, decTarget, decEdge, decMethod]);

  // Kalkulacja wielorzędowego
  const multiRowResult = useMemo(() => {
    const start = parseInt(multiStart, 10) || 0;
    const end = parseInt(multiEnd, 10) || 0;
    const rows = parseInt(multiRows, 10) || 0;
    return calculateMultiRowShaping({
      startStitches: start,
      endStitches: end,
      totalRows: rows,
      shapingPlacement: multiPlacement,
      workSidePreference: multiRightSideOnly ? 'right_side_only' : 'any_row',
    });
  }, [multiStart, multiEnd, multiRows, multiPlacement, multiRightSideOnly]);

  const handleShareInstruction = async (text: string) => {
    try {
      await Share.share({
        message: `🧶 Instrukcja kształtowania z Oczko:\n\n${text}`,
      });
    } catch {
      // Ignorujemy błędy zamknięcia okna udostępniania
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Nagłówek */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Kształtowanie Oczek</Text>
            <Text style={styles.subtitle}>Równomierne dodawanie, odejmowanie i rękawy</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Zamknij kalkulator kształtowania"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Pasek zakładek */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'increase' && styles.tabItemActive]}
            onPress={() => setActiveTab('increase')}
            accessibilityLabel="Dodawanie oczek"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, activeTab === 'increase' && styles.tabTextActive]}>
              ➕ Dodawanie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'decrease' && styles.tabItemActive]}
            onPress={() => setActiveTab('decrease')}
            accessibilityLabel="Odejmowanie oczek"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, activeTab === 'decrease' && styles.tabTextActive]}>
              ➖ Odejmowanie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'multirow' && styles.tabItemActive]}
            onPress={() => setActiveTab('multirow')}
            accessibilityLabel="Kształtowanie wielorzędowe"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, activeTab === 'multirow' && styles.tabTextActive]}>
              📐 Wielorzędowe
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Widok: Dodawanie oczek */}
          {activeTab === 'increase' && (
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeader}>DODAWANIE W JEDNYM RZĘDZIE</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Mam oczek:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={incCurrent}
                    onChangeText={setIncCurrent}
                    accessibilityLabel="Początkowa liczba oczek do dodawania"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Chcę oczek:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={incTarget}
                    onChangeText={setIncTarget}
                    accessibilityLabel="Docelowa liczba oczek po dodaniu"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Brzegi (o.):</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={incEdge}
                    onChangeText={setIncEdge}
                    accessibilityLabel="Oczka brzegowe"
                  />
                </View>
              </View>

              <Text style={styles.subLabel}>Metoda dodawania:</Text>
              <View style={styles.methodChips}>
                {(['M1L', 'M1R', 'kfb', 'yo'] as IncreaseMethod[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodChip, incMethod === m && styles.methodChipActive]}
                    onPress={() => setIncMethod(m)}
                    accessibilityLabel={`Wybierz metodę dodawania ${m}`}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.methodChipText, incMethod === m && styles.methodChipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Wynik */}
              {increaseResult.isValid ? (
                <View style={styles.resultBox}>
                  <View style={styles.resultBadgeRow}>
                    <Text style={styles.resultBadge}>+ {increaseResult.difference} oczek</Text>
                    <Text style={styles.resultTargetBadge}>Razem: {increaseResult.targetStitches} o.</Text>
                  </View>

                  <Text style={styles.resultNotation}>{increaseResult.shortNotation}</Text>
                  <Text style={styles.resultDescription}>{increaseResult.summaryPL}</Text>

                  <TouchableOpacity
                    style={styles.shareRowButton}
                    onPress={() => handleShareInstruction(increaseResult.summaryPL)}
                    accessibilityLabel="Udostępnij instrukcję dodawania"
                    accessibilityRole="button"
                  >
                    <Text style={styles.shareRowButtonText}>📤 Udostępnij instrukcję</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{increaseResult.summaryPL}</Text>
                </View>
              )}
            </View>
          )}

          {/* Widok: Odejmowanie oczek */}
          {activeTab === 'decrease' && (
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeader}>ODEJMOWANIE W JEDNYM RZĘDZIE</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Mam oczek:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={decCurrent}
                    onChangeText={setDecCurrent}
                    accessibilityLabel="Początkowa liczba oczek do odjęcia"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Chcę oczek:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={decTarget}
                    onChangeText={setDecTarget}
                    accessibilityLabel="Docelowa liczba oczek po odjęciu"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Brzegi (o.):</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={decEdge}
                    onChangeText={setDecEdge}
                    accessibilityLabel="Oczka brzegowe"
                  />
                </View>
              </View>

              <Text style={styles.subLabel}>Metoda odejmowania:</Text>
              <View style={styles.methodChips}>
                {(['k2tog', 'ssk', 'p2tog'] as DecreaseMethod[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodChip, decMethod === m && styles.methodChipActive]}
                    onPress={() => setDecMethod(m)}
                    accessibilityLabel={`Wybierz metodę odejmowania ${m}`}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.methodChipText, decMethod === m && styles.methodChipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Wynik */}
              {decreaseResult.isValid ? (
                <View style={styles.resultBox}>
                  <View style={styles.resultBadgeRow}>
                    <Text style={[styles.resultBadge, styles.resultBadgeRed]}>
                      - {decreaseResult.difference} oczek
                    </Text>
                    <Text style={styles.resultTargetBadge}>Razem: {decreaseResult.targetStitches} o.</Text>
                  </View>

                  <Text style={styles.resultNotation}>{decreaseResult.shortNotation}</Text>
                  <Text style={styles.resultDescription}>{decreaseResult.summaryPL}</Text>

                  <TouchableOpacity
                    style={styles.shareRowButton}
                    onPress={() => handleShareInstruction(decreaseResult.summaryPL)}
                    accessibilityLabel="Udostępnij instrukcję odejmowania"
                    accessibilityRole="button"
                  >
                    <Text style={styles.shareRowButtonText}>📤 Udostępnij instrukcję</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{decreaseResult.summaryPL}</Text>
                </View>
              )}
            </View>
          )}

          {/* Widok: Kształtowanie wielorzędowe (rękaw, raglan, dekolt) */}
          {activeTab === 'multirow' && (
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeader}>KSZTAŁTOWANIE WIELORZĘDOWE (RĘKAW / DEKOLT)</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Oczek start:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={multiStart}
                    onChangeText={setMultiStart}
                    accessibilityLabel="Oczka początkowe w kształtowaniu wielorzędowym"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Oczek koniec:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={multiEnd}
                    onChangeText={setMultiEnd}
                    accessibilityLabel="Oczka końcowe w kształtowaniu wielorzędowym"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>W rzędach:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={multiRows}
                    onChangeText={setMultiRows}
                    accessibilityLabel="Łączna liczba rzędów na kształtowanie"
                  />
                </View>
              </View>

              <Text style={styles.subLabel}>Rozmieszczenie modyfikacji:</Text>
              <View style={styles.placementButtons}>
                <TouchableOpacity
                  style={[
                    styles.placementButton,
                    multiPlacement === 'both_edges' && styles.placementButtonActive,
                  ]}
                  onPress={() => setMultiPlacement('both_edges')}
                  accessibilityLabel="Kształtuj po obu brzegach symetrycznie"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.placementButtonText,
                      multiPlacement === 'both_edges' && styles.placementButtonTextActive,
                    ]}
                  >
                    Oba brzegi (rękaw / raglan)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.placementButton,
                    multiPlacement === 'single_edge' && styles.placementButtonActive,
                  ]}
                  onPress={() => setMultiPlacement('single_edge')}
                  accessibilityLabel="Kształtuj na jednym brzegu"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.placementButtonText,
                      multiPlacement === 'single_edge' && styles.placementButtonTextActive,
                    ]}
                  >
                    Jeden brzeg (dekolt / klin)
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setMultiRightSideOnly(!multiRightSideOnly)}
                accessibilityLabel="Modyfikacje tylko w rzędach prawych"
                accessibilityRole="checkbox"
              >
                <View style={[styles.checkbox, multiRightSideOnly && styles.checkboxActive]}>
                  {multiRightSideOnly && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Tylko w rzędach prawych (RS / parzyste odstępy)</Text>
              </TouchableOpacity>

              {/* Wynik wielorzędowy */}
              {multiRowResult.isValid ? (
                <View style={styles.resultBox}>
                  <View style={styles.resultBadgeRow}>
                    <Text style={styles.resultBadge}>
                      {multiRowResult.mode === 'increase' ? '+ ' : '- '}
                      {multiRowResult.totalStitchDiff} oczek w {multiRowResult.totalRows} rzędach
                    </Text>
                    <Text style={styles.resultTargetBadge}>Koniec: {multiRowResult.endStitches} o.</Text>
                  </View>

                  <Text style={styles.resultDescription}>{multiRowResult.summaryPL}</Text>

                  <TouchableOpacity
                    style={styles.shareRowButton}
                    onPress={() => handleShareInstruction(multiRowResult.summaryPL)}
                    accessibilityLabel="Udostępnij rozpiskę kształtowania"
                    accessibilityRole="button"
                  >
                    <Text style={styles.shareRowButtonText}>📤 Udostępnij rozpiskę</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{multiRowResult.summaryPL}</Text>
                </View>
              )}
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
    backgroundColor: '#F7F6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5E3C',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: '#8B5E3C',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5E3C',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  methodChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodChip: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  methodChipActive: {
    backgroundColor: '#3A6073',
    borderColor: '#3A6073',
  },
  methodChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A6073',
  },
  methodChipTextActive: {
    color: '#FFFFFF',
  },
  placementButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  placementButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placementButtonActive: {
    backgroundColor: '#3A6073',
    borderColor: '#3A6073',
  },
  placementButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A6073',
    textAlign: 'center',
  },
  placementButtonTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  resultBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  resultBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  resultBadgeRed: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  resultTargetBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  resultNotation: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  resultDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 10,
  },
  shareRowButton: {
    minHeight: 44,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareRowButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
});
