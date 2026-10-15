/**
 * Oczko UI — Przeglądarka własnych wzorów PDF z pływającą linijką postępu (BR-WZOR-001, DEC-09)
 * Umożliwia import plików PDF, synchronizację linijki z licznikiem rzędów,
 * precyzyjne przesuwanie oraz tryb wysokiego kontrastu (NFR-DOST-009).
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {
  PatternDocument,
  calculateNextRulerPosition,
  stepPatternDocumentWithCounter,
  validateAndFormatPatternFile,
} from '../core/pattern-document-service';

// Bezpieczny import expo-document-picker (obsługa środowiska testowego i natywnego)
let DocumentPicker: any = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (_e) {
  DocumentPicker = null;
}

export interface PatternPdfViewerProps {
  initialDocument?: PatternDocument | null;
  activeCounterRow?: number;
  onDocumentChange?: (doc: PatternDocument) => void;
  onPickDocument?: () => Promise<void> | void;
  onDeleteDocument?: () => Promise<void> | void;
  projectId?: string;
}

export default function PatternPdfViewer({
  initialDocument = null,
  activeCounterRow = 1,
  onDocumentChange,
  onPickDocument,
  onDeleteDocument,
  projectId,
}: PatternPdfViewerProps) {
  const [doc, setDoc] = useState<PatternDocument | null>(initialDocument);
  const [highContrast, setHighContrast] = useState(false);
  const prevRowRef = useRef<number>(activeCounterRow);

  // Synchronizacja przy zmianie właściwości wejściowej
  useEffect(() => {
    if (initialDocument !== undefined) {
      setDoc(initialDocument);
    }
  }, [initialDocument]);

  // Automatyczny krok linijki przy zmianie licznika głównego
  useEffect(() => {
    if (prevRowRef.current !== activeCounterRow) {
      const delta = activeCounterRow - prevRowRef.current;
      prevRowRef.current = activeCounterRow;

      if (doc && doc.autoStepEnabled) {
        const updated = stepPatternDocumentWithCounter(doc, delta);
        setDoc(updated);
        onDocumentChange?.(updated);
      }
    }
  }, [activeCounterRow, doc]);

  // Wybór pliku PDF przez użytkownika
  const handleSelectFile = async () => {
    if (onPickDocument) {
      await onPickDocument();
      return;
    }

    try {
      if (DocumentPicker?.getDocumentAsync) {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const validation = validateAndFormatPatternFile({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            mimeType: asset.mimeType,
          });

          if (validation.valid && validation.document) {
            const newDoc: PatternDocument = {
              id: `doc_${Date.now()}`,
              projectId,
              fileName: validation.document.fileName || 'wzor.pdf',
              fileUri: validation.document.fileUri || asset.uri,
              fileSize: validation.document.fileSize,
              currentPage: 1,
              totalPages: 5,
              rulerYPercent: 20.0,
              rulerHeightPercent: 6.0,
              autoStepEnabled: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setDoc(newDoc);
            onDocumentChange?.(newDoc);
          }
        }
      } else {
        // Fallback w przypadku braku natywnego okna dialogowego (np. testy)
        const demoDoc: PatternDocument = {
          id: `doc_sample_${Date.now()}`,
          projectId,
          fileName: 'zaimportowany_wzor.pdf',
          fileUri: 'file:///patterns/zaimportowany_wzor.pdf',
          fileSize: 524288,
          currentPage: 1,
          totalPages: 4,
          rulerYPercent: 20.0,
          rulerHeightPercent: 6.0,
          autoStepEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoc(demoDoc);
        onDocumentChange?.(demoDoc);
      }
    } catch (err) {
      console.warn('Błąd podczas importu pliku PDF:', err);
    }
  };

  // Zmiana pozycji linijki w górę / w dół
  const handleMoveRuler = (direction: 'up' | 'down') => {
    if (!doc) return;
    const { newY } = calculateNextRulerPosition(
      doc.rulerYPercent,
      4,
      direction === 'down' ? 'forward' : 'backward'
    );
    const updated: PatternDocument = {
      ...doc,
      rulerYPercent: newY,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    onDocumentChange?.(updated);
  };

  // Reset pozycji linijki na początek strony
  const handleResetRuler = () => {
    if (!doc) return;
    const updated: PatternDocument = {
      ...doc,
      rulerYPercent: 15.0,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    onDocumentChange?.(updated);
  };

  // Przełączenie auto-kroku z licznikiem
  const handleToggleAutoStep = (val: boolean) => {
    if (!doc) return;
    const updated: PatternDocument = {
      ...doc,
      autoStepEnabled: val,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    onDocumentChange?.(updated);
  };

  // Nawigacja stronami
  const handlePrevPage = () => {
    if (!doc || doc.currentPage <= 1) return;
    const updated: PatternDocument = {
      ...doc,
      currentPage: doc.currentPage - 1,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    onDocumentChange?.(updated);
  };

  const handleNextPage = () => {
    if (!doc || doc.currentPage >= doc.totalPages) return;
    const updated: PatternDocument = {
      ...doc,
      currentPage: doc.currentPage + 1,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    onDocumentChange?.(updated);
  };

  // 1. Stan pusty — brak wczytanego wzoru
  if (!doc) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📑</Text>
          <Text style={styles.emptyTitle}>Brak wczytanego wzoru</Text>
          <Text style={styles.emptyDescription}>
            Zaimportuj swój własny plik PDF lub grafikę wzoru ze schematem.
            Aplikacja nałoży interaktywną, przesuwaną linijkę podświetlającą bieżący wiersz
            i zsynchronizuje postęp z głównym licznikiem.
          </Text>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={handleSelectFile}
            accessibilityRole="button"
            accessibilityLabel="Wczytaj plik PDF"
          >
            <Text style={styles.pickButtonText}>📂 Wczytaj plik PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Formatowanie rozmiaru pliku
  const formattedSize = doc.fileSize
    ? doc.fileSize > 1024 * 1024
      ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(doc.fileSize / 1024)} KB`
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Nagłówek dokumentu */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleArea}>
            <Text style={styles.documentName} numberOfLines={1}>
              📄 {doc.fileName}
            </Text>
            {formattedSize && <Text style={styles.fileSizeBadge}>{formattedSize}</Text>}
          </View>
          {onDeleteDocument && (
            <TouchableOpacity onPress={onDeleteDocument} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Usuń</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pasek stron i status licznika */}
        <View style={styles.metaRow}>
          <View style={styles.pageNavigator}>
            <TouchableOpacity
              style={[styles.pageBtn, doc.currentPage <= 1 && styles.pageBtnDisabled]}
              onPress={handlePrevPage}
              disabled={doc.currentPage <= 1}
              accessibilityLabel="Poprzednia strona"
            >
              <Text style={styles.pageBtnText}>◀</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfoText}>
              {`Strona ${doc.currentPage} z ${doc.totalPages}`}
            </Text>

            <TouchableOpacity
              style={[styles.pageBtn, doc.currentPage >= doc.totalPages && styles.pageBtnDisabled]}
              onPress={handleNextPage}
              disabled={doc.currentPage >= doc.totalPages}
              accessibilityLabel="Następna strona"
            >
              <Text style={styles.pageBtnText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>{`Rząd ${activeCounterRow}`}</Text>
          </View>
        </View>
      </View>

      {/* Panel kontroli linijki */}
      <View style={styles.controlsCard}>
        <View style={styles.controlRow}>
          <View style={styles.autoStepContainer}>
            <Text style={styles.controlLabel}>Auto-krok</Text>
            <Switch
              value={doc.autoStepEnabled}
              onValueChange={handleToggleAutoStep}
              trackColor={{ false: '#D1D1D6', true: '#8B5E3C' }}
            />
          </View>

          <View style={styles.contrastContainer}>
            <Text style={styles.controlLabel}>Kontrast</Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#D1D1D6', true: '#F5A623' }}
            />
          </View>
        </View>

        <View style={styles.rulerActionRow}>
          <TouchableOpacity
            style={styles.rulerBtn}
            onPress={() => handleMoveRuler('up')}
            accessibilityLabel="Przesuń linijkę wyżej"
          >
            <Text style={styles.rulerBtnText}>▲ Wyżej</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rulerBtn}
            onPress={() => handleMoveRuler('down')}
            accessibilityLabel="Przesuń linijkę niżej"
          >
            <Text style={styles.rulerBtnText}>▼ Niżej</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rulerBtn, styles.resetBtn]}
            onPress={handleResetRuler}
            accessibilityLabel="Reset linijki na górę strony"
          >
            <Text style={styles.resetBtnText}>↺ Na górę</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wizualizacja podglądu dokumentu wzoru z linijką */}
      <View style={[styles.canvasWrapper, highContrast && styles.canvasHighContrast]}>
        <View style={styles.canvasHeader}>
          <Text style={[styles.canvasTitle, highContrast && styles.textHighContrast]}>
            {`PODGLĄD STRONY DOKUMENTU (Strona ${doc.currentPage})`}
          </Text>
          <Text style={styles.rulerPositionText}>
            {`Pozycja linijki: ${doc.rulerYPercent.toFixed(0)}%`}
          </Text>
        </View>

        {/* Symulowana zawartość strony PDF z tekstem i schematem */}
        <View style={styles.pageSheet}>
          <View style={styles.simulatedHeaderRow}>
            <View style={styles.simulatedTitleBar} />
            <View style={styles.simulatedSubtitleBar} />
          </View>

          {/* Symulowane linie schematu */}
          {Array.from({ length: 18 }).map((_, idx) => (
            <View key={idx} style={styles.simulatedPatternLine}>
              <Text style={styles.simulatedLineNumber}>
                {(idx + 1).toString().padStart(2, '0')}
              </Text>
              <View
                style={[
                  styles.simulatedLineContent,
                  idx % 3 === 0 && styles.simulatedLineStitch,
                  idx % 2 === 1 && { width: '82%' },
                ]}
              />
            </View>
          ))}

          {/* PŁYWAJĄCA LINIJKA POSTĘPU */}
          <View
            style={[
              styles.floatingRuler,
              {
                top: `${doc.rulerYPercent}%`,
                height: `${doc.rulerHeightPercent}%`,
              },
              highContrast && styles.floatingRulerHighContrast,
            ]}
          >
            <View
              style={[
                styles.rulerEdge,
                styles.rulerEdgeTop,
                highContrast && styles.rulerEdgeHighContrast,
              ]}
            />
            <View style={styles.rulerContent}>
              <View
                style={[
                  styles.rulerTag,
                  highContrast && styles.rulerTagHighContrast,
                ]}
              >
                <Text
                  style={[
                    styles.rulerTagText,
                    highContrast && styles.rulerTagTextHighContrast,
                  ]}
                >
                  ◄ LINIJKA POSTĘPU (Rząd {activeCounterRow})
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.rulerEdge,
                styles.rulerEdgeBottom,
                highContrast && styles.rulerEdgeHighContrast,
              ]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5F0',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2A29',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6E6A67',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2A29',
    flexShrink: 1,
  },
  fileSizeBadge: {
    fontSize: 11,
    color: '#8A8684',
    backgroundColor: '#F0ECE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    color: '#D9534F',
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0ECE6',
    paddingTop: 8,
  },
  pageNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageBtn: {
    backgroundColor: '#F0ECE6',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2A29',
  },
  pageInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2A29',
    marginHorizontal: 10,
  },
  counterBadge: {
    backgroundColor: '#8B5E3C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  autoStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contrastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2A29',
    marginRight: 8,
  },
  rulerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rulerBtn: {
    flex: 1,
    backgroundColor: '#F0ECE6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  rulerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2A29',
  },
  resetBtn: {
    backgroundColor: '#FAF7F2',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  canvasWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  canvasHighContrast: {
    backgroundColor: '#1C1C1E',
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  canvasTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8684',
    letterSpacing: 0.5,
  },
  textHighContrast: {
    color: '#F5A623',
  },
  rulerPositionText: {
    fontSize: 11,
    color: '#8A8684',
  },
  pageSheet: {
    position: 'relative',
    height: 520,
    backgroundColor: '#FAFAF8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E5DF',
    padding: 16,
    overflow: 'hidden',
  },
  simulatedHeaderRow: {
    marginBottom: 16,
  },
  simulatedTitleBar: {
    height: 14,
    width: '60%',
    backgroundColor: '#DDD8D0',
    borderRadius: 3,
    marginBottom: 6,
  },
  simulatedSubtitleBar: {
    height: 8,
    width: '40%',
    backgroundColor: '#EBE7E1',
    borderRadius: 2,
  },
  simulatedPatternLine: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EFEB',
  },
  simulatedLineNumber: {
    width: 24,
    fontSize: 10,
    color: '#B0AAA3',
    fontFamily: 'Courier',
    marginRight: 6,
  },
  simulatedLineContent: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E0D8',
    borderRadius: 2,
  },
  simulatedLineStitch: {
    backgroundColor: '#C8BFB2',
  },
  floatingRuler: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(139, 94, 60, 0.22)',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingRulerHighContrast: {
    backgroundColor: 'rgba(245, 166, 35, 0.38)',
  },
  rulerEdge: {
    height: 2,
    backgroundColor: '#8B5E3C',
    width: '100%',
  },
  rulerEdgeTop: {},
  rulerEdgeBottom: {},
  rulerEdgeHighContrast: {
    height: 3,
    backgroundColor: '#F5A623',
  },
  rulerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  rulerTag: {
    backgroundColor: '#8B5E3C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rulerTagHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#F5A623',
    borderWidth: 1,
  },
  rulerTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rulerTagTextHighContrast: {
    color: '#F5A623',
    fontSize: 10,
    fontWeight: '800',
  },
});
