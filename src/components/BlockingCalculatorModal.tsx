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
  calculateBlockingAnalysis,
  Unit,
  RawSwatch,
  BlockedSwatch,
  TargetGarmentDimensions,
  BlockingAnalysisResult,
} from '../core/blocking-calculator';
import { theme } from '../core/theme';
import { useLang, t } from '../core/i18n';

export interface BlockingCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialUnit?: Unit;
  initialRawStitches?: number;
  initialRawRows?: number;
  initialRawWidth?: number;
  initialRawHeight?: number;
}

export function BlockingCalculatorModal({
  visible,
  onClose,
  initialUnit = 'cm',
  initialRawStitches = 20,
  initialRawRows = 28,
  initialRawWidth = 10,
  initialRawHeight = 10,
}: BlockingCalculatorModalProps) {
  const _lang = useLang();
  const [unit, setUnit] = useState<Unit>(initialUnit);

  // Dane próbki przed praniem
  const [rawStitches, setRawStitches] = useState(String(initialRawStitches));
  const [rawRows, setRawRows] = useState(String(initialRawRows));
  const [rawWidth, setRawWidth] = useState(String(initialRawWidth));
  const [rawHeight, setRawHeight] = useState(String(initialRawHeight));

  // Wymiary tej samej próbki po praniu i wysuszeniu
  const [blockedWidth, setBlockedWidth] = useState(String(initialRawWidth * 1.08)); // domyślnie +8%
  const [blockedHeight, setBlockedHeight] = useState(String(initialRawHeight * 1.02)); // domyślnie +2%

  // Docelowe wymiary gotowego wyrobu (opcjonalne)
  const [targetWidth, setTargetWidth] = useState('52');
  const [targetHeight, setTargetHeight] = useState('60');

  const analysis = useMemo<BlockingAnalysisResult | null>(() => {
    const st = parseFloat(rawStitches);
    const rws = parseFloat(rawRows);
    const rw = parseFloat(rawWidth);
    const rh = parseFloat(rawHeight);
    const bw = parseFloat(blockedWidth);
    const bh = parseFloat(blockedHeight);
    const tw = parseFloat(targetWidth);
    const th = parseFloat(targetHeight);

    if (
      isNaN(st) || st <= 0 ||
      isNaN(rws) || rws <= 0 ||
      isNaN(rw) || rw <= 0 ||
      isNaN(rh) || rh <= 0 ||
      isNaN(bw) || bw <= 0 ||
      isNaN(bh) || bh <= 0
    ) {
      return null;
    }

    const raw: RawSwatch = { stitches: st, rows: rws, width: rw, height: rh, unit };
    const blocked: BlockedSwatch = { width: bw, height: bh, unit };
    const target: TargetGarmentDimensions | undefined =
      !isNaN(tw) && tw > 0 && !isNaN(th) && th > 0
        ? { targetWidth: tw, targetHeight: th, unit }
        : undefined;

    try {
      return calculateBlockingAnalysis(raw, blocked, target);
    } catch {
      return null;
    }
  }, [rawStitches, rawRows, rawWidth, rawHeight, blockedWidth, blockedHeight, targetWidth, targetHeight, unit]);

  const handleShare = async () => {
    if (!analysis) return;
    const signW = analysis.widthChangePct >= 0 ? '+' : '';
    const signH = analysis.heightChangePct >= 0 ? '+' : '';
    const message = [
      `🧶 Oczko — Raport Blokowania Próbki (${unit})`,
      `• Zmiana szerokości: ${signW}${analysis.widthChangePct}% (${analysis.widthBehavior})`,
      `• Zmiana wysokości: ${signH}${analysis.heightChangePct}% (${analysis.heightBehavior})`,
      analysis.requiredCastOnStitches > 0
        ? `• Oczka do nabrania na druty: ${analysis.requiredCastOnStitches} o.`
        : '',
      analysis.requiredTotalRows > 0
        ? `• Rzędy do wykonania: ${analysis.requiredTotalRows} rz.`
        : '',
      analysis.onNeedlesWidth > 0
        ? `• Wymiary na drutach (przed praniem): ${analysis.onNeedlesWidth} x ${analysis.onNeedlesHeight} ${unit}`
        : '',
      `\nWskazówka: ${analysis.fiberTips.join(' ')}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({ message });
    } catch {
      // Błąd udostępniania ignorowany
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('Kalkulator Blokowania')}</Text>
            <Text style={styles.subtitle}>{t('Kompensacja wymiarów dzianiny po praniu')}</Text>
          </View>
          <TouchableOpacity
            testID="close-blocking-modal-btn"
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Zamknij"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Przełącznik jednostek */}
          <View style={styles.unitRow}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'cm' && styles.unitBtnActive]}
              onPress={() => setUnit('cm')}
              accessibilityRole="button"
              accessibilityLabel="Jednostki metryczne (cm)"
            >
              <Text style={[styles.unitBtnText, unit === 'cm' && styles.unitBtnTextActive]}>cm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'inch' && styles.unitBtnActive]}
              onPress={() => setUnit('inch')}
              accessibilityRole="button"
              accessibilityLabel="Jednostki imperialne (cale)"
            >
              <Text style={[styles.unitBtnText, unit === 'inch' && styles.unitBtnTextActive]}>inch</Text>
            </TouchableOpacity>
          </View>

          {/* Sekcja 1: Próbka przed praniem */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t('1. Próbka na surowo (na drutach)')}</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Liczba oczek')}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rawStitches}
                  onChangeText={setRawStitches}
                  testID="raw-stitches-input"
                  accessibilityLabel="Liczba oczek próbki na surowo"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Liczba rzędów')}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rawRows}
                  onChangeText={setRawRows}
                  testID="raw-rows-input"
                  accessibilityLabel="Liczba rzędów próbki na surowo"
                />
              </View>
            </View>
            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Szerokość')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rawWidth}
                  onChangeText={setRawWidth}
                  testID="raw-width-input"
                  accessibilityLabel="Szerokość próbki na surowo"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Wysokość')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rawHeight}
                  onChangeText={setRawHeight}
                  testID="raw-height-input"
                  accessibilityLabel="Wysokość próbki na surowo"
                />
              </View>
            </View>
          </View>

          {/* Sekcja 2: Próbka po blokowaniu */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t('2. Ta sama próbka po praniu i wysuszeniu')}</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Szerokość po blokowaniu')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={blockedWidth}
                  onChangeText={setBlockedWidth}
                  testID="blocked-width-input"
                  accessibilityLabel="Szerokość próbki po praniu"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Wysokość po blokowaniu')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={blockedHeight}
                  onChangeText={setBlockedHeight}
                  testID="blocked-height-input"
                  accessibilityLabel="Wysokość próbki po praniu"
                />
              </View>
            </View>
          </View>

          {/* Sekcja 3: Wymiary docelowe wyrobu */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t('3. Wymiary docelowe gotowego wyrobu (opcjonalne)')}</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Szerokość gotowa')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={targetWidth}
                  onChangeText={setTargetWidth}
                  testID="target-width-input"
                  accessibilityLabel="Docelowa szerokość wyrobu"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>{t('Długość gotowa')} ({unit})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={targetHeight}
                  onChangeText={setTargetHeight}
                  testID="target-height-input"
                  accessibilityLabel="Docelowa długość wyrobu"
                />
              </View>
            </View>
          </View>

          {/* Wyniki analizy */}
          {analysis && (
            <View style={styles.resultCard} testID="blocking-result-card">
              <Text style={styles.resultTitle}>{t('Wyniki blokowania & Kompensacja')}</Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('Zmiana szerokości')}</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      analysis.widthChangePct > 2 && styles.metricGrowth,
                      analysis.widthChangePct < -2 && styles.metricShrinkage,
                    ]}
                  >
                    {analysis.widthChangePct >= 0 ? '+' : ''}
                    {analysis.widthChangePct}%
                  </Text>
                  <Text style={styles.metricSub}>
                    {analysis.widthBehavior === 'growth'
                      ? t('Rozciągnięcie')
                      : analysis.widthBehavior === 'shrinkage'
                      ? t('Skurcz')
                      : t('Stabilna')}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('Zmiana wysokości')}</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      analysis.heightChangePct > 2 && styles.metricGrowth,
                      analysis.heightChangePct < -2 && styles.metricShrinkage,
                    ]}
                  >
                    {analysis.heightChangePct >= 0 ? '+' : ''}
                    {analysis.heightChangePct}%
                  </Text>
                  <Text style={styles.metricSub}>
                    {analysis.heightBehavior === 'growth'
                      ? t('Rozciągnięcie')
                      : analysis.heightBehavior === 'shrinkage'
                      ? t('Skurcz')
                      : t('Stabilna')}
                  </Text>
                </View>
              </View>

              {analysis.requiredCastOnStitches > 0 && (
                <View style={styles.compensationBox}>
                  <Text style={styles.compHeader}>🎯 {t('Kompensacja na drutach')}:</Text>
                  <Text style={styles.compText}>
                    • {t('Oczka do nabrania')}:{' '}
                    <Text style={styles.compHighlight}>{analysis.requiredCastOnStitches} {t('oczek')}</Text>
                  </Text>
                  <Text style={styles.compText}>
                    • {t('Rzędy do wykonania')}:{' '}
                    <Text style={styles.compHighlight}>{analysis.requiredTotalRows} {t('rzędów')}</Text>
                  </Text>
                  <Text style={styles.compText}>
                    • {t('Dziergaj do wymiarów')}:{' '}
                    <Text style={styles.compHighlight}>
                      {analysis.onNeedlesWidth} × {analysis.onNeedlesHeight} {unit}
                    </Text>
                  </Text>
                  <Text style={styles.compNote}>
                    {t('Po praniu i wysuszeniu dzianina osiągnie zamierzone')} {targetWidth} × {targetHeight} {unit}!
                  </Text>
                </View>
              )}

              <View style={styles.tipsBox}>
                <Text style={styles.tipsHeader}>💡 {t('Porada technologiczna')}:</Text>
                {analysis.fiberTips.map((tip, idx) => (
                  <Text key={idx} style={styles.tipText}>
                    • {tip}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                testID="share-blocking-report-btn"
                accessibilityRole="button"
                accessibilityLabel="Udostępnij raport blokowania"
              >
                <Text style={styles.shareBtnText}>📤 {t('Udostępnij raport blokowania')}</Text>
              </TouchableOpacity>
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
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgCardSecondary,
  },
  closeBtnText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  unitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitBtnActive: {
    backgroundColor: theme.colors.terracotta,
    borderColor: theme.colors.terracotta,
  },
  unitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.bgCardSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.terracotta,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.terracotta,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    backgroundColor: theme.colors.bgCardSecondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  metricGrowth: {
    color: '#E06C75',
  },
  metricShrinkage: {
    color: '#61AFEF',
  },
  metricSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  compensationBox: {
    backgroundColor: theme.colors.bgCardSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.terracotta,
  },
  compHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  compText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  compHighlight: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  compNote: {
    fontSize: 12,
    color: theme.colors.terracotta,
    fontStyle: 'italic',
    marginTop: 6,
  },
  tipsBox: {
    backgroundColor: theme.colors.bgCardSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  tipsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  shareBtn: {
    backgroundColor: theme.colors.terracotta,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
