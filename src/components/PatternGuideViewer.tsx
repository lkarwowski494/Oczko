/**
 * Oczko UI — Przeglądarka schematów dziewiarskich z linijką przypiętą do wiersza (DEC-09, NFR-DOST-009)
 * Spełnia wymagania dostępności i wysokiego kontrastu dla osób przerabiających skomplikowane wzory.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { BUILT_IN_PATTERNS, PatternGuideChart, ChartRow } from '../core/pattern-guide-data';

export interface PatternGuideViewerProps {
  activeCounterRow?: number;
  onStepCounter?: (direction: 'increment' | 'decrement') => void;
}

export default function PatternGuideViewer({
  activeCounterRow = 1,
  onStepCounter,
}: PatternGuideViewerProps) {
  const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
  const [isPinnedToCounter, setIsPinnedToCounter] = useState(true);
  const [manualRow, setManualRow] = useState(1);

  const pattern: PatternGuideChart = BUILT_IN_PATTERNS[selectedPatternIndex] || BUILT_IN_PATTERNS[0];

  // Wyliczenie aktualnego rzędu we wzorze (z uwzględnieniem powtórzeń cyklu wzoru)
  const normalizedCounterRow = activeCounterRow <= 0 ? 1 : activeCounterRow;
  const effectiveRowNumber = isPinnedToCounter
    ? ((normalizedCounterRow - 1) % pattern.totalRows) + 1
    : manualRow;

  // Zsynchronizowanie manualnego rzędu, gdy użytkownik odepnie linijkę
  useEffect(() => {
    if (isPinnedToCounter) {
      setManualRow(((normalizedCounterRow - 1) % pattern.totalRows) + 1);
    }
  }, [normalizedCounterRow, isPinnedToCounter, pattern.totalRows]);

  const activeRowData: ChartRow | undefined = pattern.rows.find(
    (r) => r.rowNumber === effectiveRowNumber
  );

  const handleNextRow = () => {
    if (isPinnedToCounter && onStepCounter) {
      onStepCounter('increment');
    } else {
      setManualRow((prev) => (prev >= pattern.totalRows ? 1 : prev + 1));
    }
  };

  const handlePrevRow = () => {
    if (isPinnedToCounter && onStepCounter) {
      onStepCounter('decrement');
    } else {
      setManualRow((prev) => (prev <= 1 ? pattern.totalRows : prev - 1));
    }
  };

  return (
    <View style={styles.container}>
      {/* Przełącznik wzorów */}
      <View style={styles.patternSelector}>
        {BUILT_IN_PATTERNS.map((p, idx) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.patternChip,
              selectedPatternIndex === idx && styles.patternChipActive,
            ]}
            onPress={() => {
              setSelectedPatternIndex(idx);
              setManualRow(1);
            }}
          >
            <Text
              style={[
                styles.patternChipText,
                selectedPatternIndex === idx && styles.patternChipTextActive,
              ]}
            >
              {p.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pasek kontrolny linijki */}
      <View style={styles.rulerControlsCard}>
        <View style={styles.rulerStatusRow}>
          <View>
            <Text style={styles.activeRowHeader}>
              {`Rząd ${effectiveRowNumber} z ${pattern.totalRows}`}
              {activeRowData && (
                <Text style={styles.sideBadge}>
                  {` (${activeRowData.side === 'RS' ? 'Prawa strona / RS' : 'Lewa strona / WS'})`}
                </Text>
              )}
            </Text>
            <Text style={styles.rulerSubtext}>
              {isPinnedToCounter
                ? '📌 Linijka zsynchronizowana z licznikiem głównym'
                : '🔓 Linijka przesuwana niezależnie'}
            </Text>
          </View>

          <View style={styles.pinToggleContainer}>
            <Text style={styles.pinToggleLabel}>Auto-krok</Text>
            <Switch
              value={isPinnedToCounter}
              onValueChange={setIsPinnedToCounter}
              trackColor={{ false: '#E5E5EA', true: '#8B5E3C' }}
            />
          </View>
        </View>

        {/* Instrukcja aktywnego rzędu w powiększeniu */}
        {activeRowData && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionTitle}>Instrukcja bieżącego rzędu:</Text>
            <Text style={styles.instructionText}>{activeRowData.instruction}</Text>
          </View>
        )}

        {/* Przyciski nawigacji linijki */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={handlePrevRow}>
            <Text style={styles.navBtnText}>◀ Poprzedni rząd</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={handleNextRow}>
            <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>Następny rząd ▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Diagram / Siatka schematu z Linijką */}
      <ScrollView contentContainerStyle={styles.chartContainer}>
        <Text style={styles.chartHeader}>DIAGRAM DZIEWIARSKI (Od dołu do góry)</Text>

        {pattern.rows.map((row) => {
          const isRowActive = row.rowNumber === effectiveRowNumber;

          return (
            <TouchableOpacity
              key={row.rowNumber}
              activeOpacity={0.8}
              onPress={() => {
                setIsPinnedToCounter(false);
                setManualRow(row.rowNumber);
              }}
              style={[
                styles.chartRowWrapper,
                isRowActive && styles.chartRowActiveHighlight,
              ]}
            >
              {/* Lewa etykieta rzędu i strony */}
              <View style={styles.rowLabelContainer}>
                <Text style={[styles.rowNumberText, isRowActive && styles.rowNumberActive]}>
                  R{row.rowNumber}
                </Text>
                <Text style={styles.sideText}>{row.side}</Text>
              </View>

              {/* Siatka oczek (glify CYC) */}
              <View style={styles.stitchesRow}>
                {row.stitches.map((symbol, stitchIdx) => (
                  <View
                    key={stitchIdx}
                    style={[
                      styles.stitchCell,
                      isRowActive && styles.stitchCellActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stitchSymbol,
                        isRowActive && styles.stitchSymbolActive,
                      ]}
                    >
                      {symbol}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Wskaźnik linijki */}
              {isRowActive && (
                <View style={styles.rulerMarkerBadge}>
                  <Text style={styles.rulerMarkerText}>◄ LINIJKA</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Legenda symboli */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legenda symboli CYC:</Text>
          <View style={styles.legendGrid}>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>|</Text> = Oczko prawe
            </Text>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>-</Text> = Oczko lewe
            </Text>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>o</Text> = Narzut (YO)
            </Text>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>/</Text> = 2 razem w prawo
            </Text>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>\</Text> = Przeciągnięcie (ssk)
            </Text>
            <Text style={styles.legendItem}>
              <Text style={styles.bold}>⚡</Text> = Warkocz (C6F)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  patternSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  patternChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  patternChipActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  patternChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  patternChipTextActive: {
    color: '#FFFFFF',
  },
  rulerControlsCard: {
    margin: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rulerStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRowHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sideBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  rulerSubtext: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  pinToggleContainer: {
    alignItems: 'center',
  },
  pinToggleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 2,
  },
  instructionBanner: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#F5A623',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  instructionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B26B00',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  navBtnPrimary: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  chartHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  chartRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  chartRowActiveHighlight: {
    backgroundColor: '#FFF8E1',
    borderColor: '#F5A623',
    borderWidth: 2,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rowLabelContainer: {
    width: 48,
    alignItems: 'center',
  },
  rowNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555555',
  },
  rowNumberActive: {
    color: '#B26B00',
    fontWeight: '800',
  },
  sideText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#999999',
  },
  stitchesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  stitchCell: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F8F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EC',
  },
  stitchCellActive: {
    backgroundColor: '#FFE082',
    borderColor: '#D48806',
  },
  stitchSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444444',
  },
  stitchSymbolActive: {
    color: '#663C00',
  },
  rulerMarkerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#D48806',
    borderRadius: 4,
    marginLeft: 4,
  },
  rulerMarkerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 6,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    fontSize: 11,
    color: '#666666',
    width: '47%',
  },
  bold: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
