import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import {
  calculateHatCrown,
  HAT_STANDARD_SIZES,
  HatBrimStyle,
  HatFitStyle,
  CrownDecreaseWedges,
} from '../core/hat-calculator';

export interface HatCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  defaultGaugeStitches?: number;
  defaultGaugeRows?: number;
}

export const HatCalculatorModal: React.FC<HatCalculatorModalProps> = ({
  visible,
  onClose,
  defaultGaugeStitches = 22,
  defaultGaugeRows = 30,
}) => {
  const [activeTab, setActiveTab] = useState<'fit' | 'crown'>('fit');

  // Parameters
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<number>(56);
  const [negativeEaseCm, setNegativeEaseCm] = useState<number>(5);
  const [gaugeStitches, setGaugeStitches] = useState<number>(defaultGaugeStitches);
  const [gaugeRows, setGaugeRows] = useState<number>(defaultGaugeRows);
  const [brimStyle, setBrimStyle] = useState<HatBrimStyle>('single');
  const [brimHeightCm, setBrimHeightCm] = useState<number>(5);
  const [fitStyle, setFitStyle] = useState<HatFitStyle>('beanie');
  const [slouchExtraCm, setSlouchExtraCm] = useState<number>(4);
  const [wedges, setWedges] = useState<CrownDecreaseWedges>(6);

  // Calculation Result
  const result = useMemo(() => {
    return calculateHatCrown({
      headCircumferenceCm,
      negativeEaseCm,
      gaugeStitchesPer10Cm: gaugeStitches,
      gaugeRowsPer10Cm: gaugeRows,
      brimStyle,
      brimHeightCm,
      fitStyle,
      slouchExtraCm,
      wedges,
    });
  }, [
    headCircumferenceCm,
    negativeEaseCm,
    gaugeStitches,
    gaugeRows,
    brimStyle,
    brimHeightCm,
    fitStyle,
    slouchExtraCm,
    wedges,
  ]);

  const handleShare = async () => {
    try {
      const roundsText = result.rounds
        .map((r) => `Rząd ${r.roundNumber}: ${r.description}`)
        .join('\n');
      const text = `🧶 Purlo — Rozpiska Korony Czapki:\n\n` +
        `${result.summaryText}\n\n` +
        `Obwód głowy: ${headCircumferenceCm} cm (Luz: -${negativeEaseCm} cm -> ${result.targetCircumferenceCm} cm)\n` +
        `Próbka: ${gaugeStitches} o. x ${gaugeRows} rz. / 10 cm\n` +
        `Ściągacz: ${result.brimHeightCm} cm (${result.brimRows} rz.)\n` +
        `Korpus: ${result.bodyHeightCm} cm (${result.bodyRows} rz.)\n` +
        `Korona: ${result.crownHeightCm} cm (${result.crownRoundsCount} okrążeń w ${result.wedges} klinach)\n\n` +
        `Sekwencja Korony:\n${roundsText}\n\n` +
        `Pozostaje ${result.finalRemainingStitches} o. Odetnij nitkę, przewlecz igłą przez pozostałe oczka, ściągnij mocno i zabezpiecz.`;

      await Share.share({ message: text });
    } catch {
      // ignore
    }
  };

  const handleSelectStandardSize = (circ: number) => {
    setHeadCircumferenceCm(circ);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>🧢 Kalkulator Czapki</Text>
            <Text style={styles.subtitle}>Obwód, ściągacz i zmniejszanie korony</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Zamknij kalkulator czapki"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'fit' && styles.tabButtonActive]}
            onPress={() => setActiveTab('fit')}
            accessibilityRole="tab"
            accessibilityLabel="Zakładka Wymiary i Ściągacz"
          >
            <Text style={[styles.tabButtonText, activeTab === 'fit' && styles.tabButtonTextActive]}>
              📏 Wymiary & Ściągacz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'crown' && styles.tabButtonActive]}
            onPress={() => setActiveTab('crown')}
            accessibilityRole="tab"
            accessibilityLabel="Zakładka Korona i Rozpiska"
          >
            <Text style={[styles.tabButtonText, activeTab === 'crown' && styles.tabButtonTextActive]}>
              👑 Korona & Rozpiska
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'fit' && (
            <View>
              {/* Presets row */}
              <Text style={styles.sectionTitle}>Standardowe obwody głowy (CYC):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {HAT_STANDARD_SIZES.map((sz) => {
                  const isSelected = headCircumferenceCm === sz.headCircumferenceCm;
                  return (
                    <TouchableOpacity
                      key={sz.id}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                      onPress={() => handleSelectStandardSize(sz.headCircumferenceCm)}
                      accessibilityRole="button"
                      accessibilityLabel={`Wybierz rozmiar ${sz.name}, obwód ${sz.headCircumferenceCm} cm`}
                    >
                      <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                        {sz.name}
                      </Text>
                      <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubActive]}>
                        {sz.headCircumferenceCm} cm
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Head circumference stepper */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Obwód głowy (rzeczywisty):</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setHeadCircumferenceCm((c) => Math.max(30, c - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Zmniejsz obwód głowy o 1 cm"
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{`${headCircumferenceCm} cm`}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setHeadCircumferenceCm((c) => Math.min(65, c + 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Zwiększ obwód głowy o 1 cm"
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Negative ease stepper */}
                <Text style={[styles.cardLabel, { marginTop: 14 }]}>Luz ujemny (ściągający):</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setNegativeEaseCm((e) => Math.max(0, e - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Zmniejsz luz ujemny o 1 cm"
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{`-${negativeEaseCm} cm`}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setNegativeEaseCm((e) => Math.min(10, e + 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Zwiększ luz ujemny o 1 cm"
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardHint}>
                  {`Docelowy obwód czapki: ${result.targetCircumferenceCm} cm (idealne dopasowanie bez zsuwania).`}
                </Text>
              </View>

              {/* Gauge Settings */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Gęstość próbki (na 10 cm):</Text>
                <View style={styles.stepperRow}>
                  <Text style={styles.gaugeLabel}>Oczka:</Text>
                  <TouchableOpacity
                    style={styles.stepperSmallBtn}
                    onPress={() => setGaugeStitches((s) => Math.max(10, s - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Odejmij 1 oczko próbki"
                  >
                    <Text style={styles.stepperSmallBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.gaugeValText}>{gaugeStitches}</Text>
                  <TouchableOpacity
                    style={styles.stepperSmallBtn}
                    onPress={() => setGaugeStitches((s) => Math.min(40, s + 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Dodaj 1 oczko próbki"
                  >
                    <Text style={styles.stepperSmallBtnText}>+</Text>
                  </TouchableOpacity>

                  <Text style={[styles.gaugeLabel, { marginLeft: 16 }]}>Rzędy:</Text>
                  <TouchableOpacity
                    style={styles.stepperSmallBtn}
                    onPress={() => setGaugeRows((r) => Math.max(10, r - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Odejmij 1 rząd próbki"
                  >
                    <Text style={styles.stepperSmallBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.gaugeValText}>{gaugeRows}</Text>
                  <TouchableOpacity
                    style={styles.stepperSmallBtn}
                    onPress={() => setGaugeRows((r) => Math.min(50, r + 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Dodaj 1 rząd próbki"
                  >
                    <Text style={styles.stepperSmallBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Brim and Style configuration */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Ściągacz (Brim):</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, brimStyle === 'single' && styles.toggleBtnActive]}
                    onPress={() => setBrimStyle('single')}
                    accessibilityRole="button"
                    accessibilityLabel="Pojedynczy ściągacz"
                  >
                    <Text style={[styles.toggleBtnText, brimStyle === 'single' && styles.toggleBtnTextActive]}>
                      Pojedynczy (np. 5 cm)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, brimStyle === 'folded' && styles.toggleBtnActive]}
                    onPress={() => setBrimStyle('folded')}
                    accessibilityRole="button"
                    accessibilityLabel="Wywijany ściągacz"
                  >
                    <Text style={[styles.toggleBtnText, brimStyle === 'folded' && styles.toggleBtnTextActive]}>
                      Wywijany (np. 10 cm)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.cardLabel, { marginTop: 14 }]}>Styl czapki:</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, fitStyle === 'beanie' && styles.toggleBtnActive]}
                    onPress={() => setFitStyle('beanie')}
                    accessibilityRole="button"
                    accessibilityLabel="Klasyczny dopasowany beanie"
                  >
                    <Text style={[styles.toggleBtnText, fitStyle === 'beanie' && styles.toggleBtnTextActive]}>
                      Klasyczny Beanie
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, fitStyle === 'slouchy' && styles.toggleBtnActive]}
                    onPress={() => setFitStyle('slouchy')}
                    accessibilityRole="button"
                    accessibilityLabel="Opadający slouchy"
                  >
                    <Text style={[styles.toggleBtnText, fitStyle === 'slouchy' && styles.toggleBtnTextActive]}>
                      Opadający (Slouchy)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cast on badge */}
              <View style={styles.highlightBadge}>
                <Text style={styles.highlightTitle}>🧶 Oczka do nabrania (Cast-on):</Text>
                <Text style={styles.highlightNumber}>{`${result.castOnStitches} oczek`}</Text>
                <Text style={styles.highlightSub}>
                  {`Podzielne przez ${result.wedges} klinów korony.`}
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'crown' && (
            <View>
              {/* Wedge Selector */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Liczba klinów korony (Crown Wedges):</Text>
                <View style={styles.wedgeSelectorRow}>
                  {([4, 6, 8] as CrownDecreaseWedges[]).map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.wedgeBtn, wedges === w && styles.wedgeBtnActive]}
                      onPress={() => setWedges(w)}
                      accessibilityRole="button"
                      accessibilityLabel={`${w} klinów korony`}
                    >
                      <Text style={[styles.wedgeBtnText, wedges === w && styles.wedgeBtnTextActive]}>
                        {`${w} klinów`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.cardHint}>
                  {wedges === 6
                    ? 'Najpopularniejszy, harmonijny wierzchołek kopułowy.'
                    : wedges === 4
                    ? 'Mocno zarysowane 4 linie (krzyżak).'
                    : 'Płaski, gęsty wierzchołek wieloboczny.'}
                </Text>
              </View>

              {/* Geometry Overview */}
              <View style={styles.geoCard}>
                <Text style={styles.geoTitle}>📐 Podział pionowy czapki:</Text>
                <View style={styles.geoRow}>
                  <Text style={styles.geoText}>• Ściągacz:</Text>
                  <Text style={styles.geoVal}>{`${result.brimHeightCm} cm (${result.brimRows} rz.)`}</Text>
                </View>
                <View style={styles.geoRow}>
                  <Text style={styles.geoText}>• Korpus (prosto):</Text>
                  <Text style={styles.geoVal}>{`${result.bodyHeightCm} cm (${result.bodyRows} rz.)`}</Text>
                </View>
                <View style={styles.geoRow}>
                  <Text style={styles.geoText}>• Korona (zmniejszanie):</Text>
                  <Text style={styles.geoVal}>{`${result.crownHeightCm} cm (${result.crownRoundsCount} rz.)`}</Text>
                </View>
                <View style={[styles.geoRow, styles.geoTotalRow]}>
                  <Text style={styles.geoTotalText}>Łączna wysokość:</Text>
                  <Text style={styles.geoTotalVal}>{`${result.totalHeightCm} cm`}</Text>
                </View>
              </View>

              {/* Rounds List */}
              <Text style={styles.sectionTitle}>
                {`Rozpiska okrążeń korony (${result.crownRoundsCount} okrążenia):`}
              </Text>
              {result.rounds.map((r) => (
                <View
                  key={r.roundNumber}
                  style={[styles.roundRow, r.isDecreaseRound ? styles.roundRowDecrease : styles.roundRowPlain]}
                >
                  <View style={styles.roundNumberBadge}>
                    <Text style={styles.roundNumberText}>{`Rz ${r.roundNumber}`}</Text>
                  </View>
                  <View style={styles.roundDescContainer}>
                    <Text style={styles.roundDescText}>{r.description}</Text>
                  </View>
                  <View style={styles.roundStitchesBadge}>
                    <Text style={styles.roundStitchesText}>{`${r.totalStitchesAfter} o.`}</Text>
                  </View>
                </View>
              ))}

              {/* Final instruction */}
              <View style={styles.finishCard}>
                <Text style={styles.finishTitle}>🏁 Wykończenie czapki:</Text>
                <Text style={styles.finishText}>
                  {`Pozostało ${result.finalRemainingStitches} oczek. Odetnij nić z zapasem ok. 20 cm, ` +
                    `nawlecz igłę dziewiarską, zbierz wszystkie oczka z drutów, ściągnij mocno wierzchołek i zabezpiecz nitkę od lewej strony.`}
                </Text>
              </View>
            </View>
          )}

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Udostępnij wzór i rozpiskę czapki"
          >
            <Text style={styles.shareButtonText}>📤 Udostępnij wzór czapki</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },
  presetScroll: {
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
    justifyContent: 'center',
  },
  presetChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  presetChipTextActive: {
    color: '#1D4ED8',
  },
  presetChipSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  presetChipSubActive: {
    color: '#3B82F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  gaugeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  gaugeValText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    minWidth: 26,
    textAlign: 'center',
  },
  stepperSmallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperSmallBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  toggleBtnTextActive: {
    color: '#1D4ED8',
  },
  highlightBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  highlightNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D4ED8',
    marginVertical: 4,
  },
  highlightSub: {
    fontSize: 12,
    color: '#3B82F6',
  },
  wedgeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  wedgeBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wedgeBtnActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  wedgeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  wedgeBtnTextActive: {
    color: '#1D4ED8',
  },
  geoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  geoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  geoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  geoText: {
    fontSize: 13,
    color: '#4B5563',
  },
  geoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  geoTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  geoTotalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  geoTotalVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    minHeight: 44,
  },
  roundRowDecrease: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  roundRowPlain: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderLeftColor: '#D1D5DB',
  },
  roundNumberBadge: {
    width: 50,
  },
  roundNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  roundDescContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  roundDescText: {
    fontSize: 12,
    color: '#1F2937',
  },
  roundStitchesBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roundStitchesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  finishCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  finishTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  finishText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  shareButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
