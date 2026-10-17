import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NEEDLE_SIZE_TABLE,
  NeedleSizeEntry,
  convertCraftLength,
  convertCraftWeight,
  convertGaugeTension,
} from '../core/needle-gauge-converter';

interface NeedleGaugeModalProps {
  visible: boolean;
  onClose: () => void;
  initialMetricMm?: number;
}

export function NeedleGaugeModal({
  visible,
  onClose,
  initialMetricMm = 4.0,
}: NeedleGaugeModalProps) {
  const [activeTab, setActiveTab] = useState<'needles' | 'units'>('needles');
  const [selectedEntry, setSelectedEntry] = useState<NeedleSizeEntry>(() => {
    return NEEDLE_SIZE_TABLE.find(e => e.metricMm === initialMetricMm) || NEEDLE_SIZE_TABLE[8];
  });

  // Stan dla przelicznika długości
  const [metersInput, setMetersInput] = useState<string>('100');
  const yardsOutput = useMemo(() => {
    const val = parseFloat(metersInput) || 0;
    return convertCraftLength(val, 'meters', 'yards');
  }, [metersInput]);

  // Stan dla przelicznika wagi
  const [gramsInput, setGramsInput] = useState<string>('100');
  const ouncesOutput = useMemo(() => {
    const val = parseFloat(gramsInput) || 0;
    return convertCraftWeight(val, 'grams', 'ounces');
  }, [gramsInput]);

  // Stan dla gęstości próbki
  const [tension10cmInput, setTension10cmInput] = useState<string>('20');
  const tension4inchOutput = useMemo(() => {
    const val = parseFloat(tension10cmInput) || 0;
    return convertGaugeTension(val, '10cm', '4inch');
  }, [tension10cmInput]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Pasek górny */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Miarka Drutów i Jednostek</Text>
            <Text style={styles.subtitle}>Tabela rozmiarów światowych i konwerter</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Zamknij miarkę drutów"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Zakładki */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'needles' && styles.tabItemActive]}
            onPress={() => setActiveTab('needles')}
            accessibilityLabel="Zakładka rozmiary drutów"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, activeTab === 'needles' && styles.tabTextActive]}>
              📏 Rozmiary drutów
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'units' && styles.tabItemActive]}
            onPress={() => setActiveTab('units')}
            accessibilityLabel="Zakładka przelicznik miar"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, activeTab === 'units' && styles.tabTextActive]}>
              🔄 Przelicznik jednostek
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'needles' ? (
            <>
              {/* Karta wybranego rozmiaru (Cyfrowy grzybek miarowy) */}
              <View style={styles.selectedCard}>
                <Text style={styles.cardHeader}>WYBRANY ROZMIAR DRUTU / SZYDEŁKA</Text>

                <View style={styles.primaryMetricRow}>
                  <Text style={styles.primaryMetric}>{selectedEntry.labelMetric}</Text>
                  {selectedEntry.craftYarnCouncilCategory && (
                    <Text style={styles.cycBadge}>Przędza: {selectedEntry.craftYarnCouncilCategory}</Text>
                  )}
                </View>

                <View style={styles.conversionGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>US (Amerykański):</Text>
                    <Text style={styles.gridValue}>{selectedEntry.usKnitting}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>UK (Brytyjski):</Text>
                    <Text style={styles.gridValue}>{selectedEntry.ukKnitting || '—'}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>JP (Japoński):</Text>
                    <Text style={styles.gridValue}>{selectedEntry.jpKnitting || '—'}</Text>
                  </View>

                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Szydełko (US):</Text>
                    <Text style={styles.gridValue}>{selectedEntry.crochetUs || '—'}</Text>
                  </View>
                </View>
              </View>

              {/* Tabela wszystkich rozmiarów */}
              <Text style={styles.sectionTitle}>WYBIERZ ROZMIAR Z TABELI CYC / ISO</Text>
              <View style={styles.tableList}>
                {NEEDLE_SIZE_TABLE.map((item) => (
                  <TouchableOpacity
                    key={item.metricMm}
                    style={[
                      styles.tableRow,
                      selectedEntry.metricMm === item.metricMm && styles.tableRowActive,
                    ]}
                    onPress={() => setSelectedEntry(item)}
                    accessibilityLabel={`Wybierz rozmiar ${item.labelMetric}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.rowLeft}>
                      <Text style={[styles.rowMetric, selectedEntry.metricMm === item.metricMm && styles.rowMetricActive]}>
                        {item.labelMetric}
                      </Text>
                      <Text style={styles.rowSub}>
                        {item.usKnitting} • {item.ukKnitting || '—'}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowCrochet}>🧶 Szydełko: {item.crochetUs}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Przelicznik Długości: Metry <-> Jardy */}
              <View style={styles.converterCard}>
                <Text style={styles.converterTitle}>DŁUGOŚĆ WŁÓCZKI (METRY ↔ JARDY)</Text>
                <View style={styles.converterRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Metry (m):</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={metersInput}
                      onChangeText={setMetersInput}
                      accessibilityLabel="Wartość w metrach"
                    />
                  </View>
                  <Text style={styles.equalsSign}>=</Text>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Jardy (yd):</Text>
                    <Text style={styles.calculatedValue}>{`${yardsOutput} yd`}</Text>
                  </View>
                </View>
              </View>

              {/* Przelicznik Wagi: Gramy <-> Uncje */}
              <View style={styles.converterCard}>
                <Text style={styles.converterTitle}>WAGA MOTKA (GRAMY ↔ UNCJE)</Text>
                <View style={styles.converterRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Gramy (g):</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={gramsInput}
                      onChangeText={setGramsInput}
                      accessibilityLabel="Wartość w gramach"
                    />
                  </View>
                  <Text style={styles.equalsSign}>=</Text>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Uncje (oz):</Text>
                    <Text style={styles.calculatedValue}>{`${ouncesOutput} oz`}</Text>
                  </View>
                </View>
              </View>

              {/* Przelicznik Gęstości: 10 cm <-> 4 cale */}
              <View style={styles.converterCard}>
                <Text style={styles.converterTitle}>PRÓBKA ŚCIEGU (10 CM ↔ 4 CALE)</Text>
                <View style={styles.converterRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Oczek na 10 cm:</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={tension10cmInput}
                      onChangeText={setTension10cmInput}
                      accessibilityLabel="Oczka na 10 cm"
                    />
                  </View>
                  <Text style={styles.equalsSign}>=</Text>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Oczek na 4 cale:</Text>
                    <Text style={styles.calculatedValue}>{`${tension4inchOutput} o.`}</Text>
                  </View>
                </View>
              </View>
            </>
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
  selectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5E3C',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  primaryMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryMetric: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
  },
  cycBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A6073',
    backgroundColor: '#EBF4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  conversionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  tableList: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableRowActive: {
    borderColor: '#8B5E3C',
    backgroundColor: '#FDFBF9',
    borderWidth: 1.5,
  },
  rowLeft: {
    flex: 1,
  },
  rowMetric: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  rowMetricActive: {
    color: '#8B5E3C',
  },
  rowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowCrochet: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A6073',
  },
  converterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  converterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5E3C',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  converterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  equalsSign: {
    fontSize: 20,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 18,
  },
  calculatedValue: {
    minHeight: 44,
    backgroundColor: '#EBF4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B0D0D3',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A4D54',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 42,
  },
});
