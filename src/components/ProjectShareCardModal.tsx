/**
 * Oczko UI — Modal karty podsumowania i udostępniania robótki (DEC-01, BR-PROJ-001...005)
 * Wizualna karta projektu do dzielenia się postępem (WIP) i ukończonym dziełem (FO) na Ravelry/Instagram.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnrichedProject } from '../core/project-service';
import { ProjectStatus } from '../core/project-repository';
import {
  buildProjectSummary,
  generateShareableText,
} from '../core/project-summary';
import { encodeProjectToDeepLink } from '../core/project-share-protocol';
import { QrCodeSvg } from './QrCodeSvg';

export interface ProjectShareCardModalProps {
  visible: boolean;
  project: EnrichedProject | null;
  onClose: () => void;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  totalDurationSeconds?: number;
}

export default function ProjectShareCardModal({
  visible,
  project,
  onClose,
  onStatusChange,
  totalDurationSeconds,
}: ProjectShareCardModalProps) {
  const [yarnName, setYarnName] = useState('');
  const [toolName, setToolName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!project) return null;

  const summary = buildProjectSummary(project, [], totalDurationSeconds);
  const isFinished = project.status === 'finished';

  const deepLink = encodeProjectToDeepLink({
    v: 1,
    n: project.name,
    c: (project.craftType as any) === 'crochet' ? 'crochet' : 'knitting',
    p: summary.partsSummary.map((p) => ({
      n: p.name,
      t: p.targetRows || undefined,
      r: p.rows,
    })),
    desc: (project as any).description || undefined,
  });

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareText = generateShareableText(summary, {
        yarnName: yarnName.trim() || undefined,
        toolName: toolName.trim() || undefined,
        includeHashtags: true,
      });

      const fullMessage = `${shareText}\n\nOtwórz projekt w aplikacji Oczko:\n${deepLink}`;

      await Share.share({
        title: `Robótka w Oczko: ${project.name}`,
        message: fullMessage,
      });
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        console.error('Błąd udostępniania karty:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleFinished = async () => {
    if (!onStatusChange) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus: ProjectStatus = isFinished ? 'active' : 'finished';
      await onStatusChange(project.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.modalContainer}>
        {/* Pasek nagłówka */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Karta Robótki</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Zamknij kartę robótki"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Wizualna karta rzemieślnicza (Share Card Preview) */}
          <View style={styles.craftCard}>
            <View style={styles.cardTopRow}>
              <Text style={styles.brandingText}>OCZKO • PURLO</Text>
              <View
                style={[
                  styles.statusTag,
                  isFinished ? styles.statusTagFinished : styles.statusTagActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    isFinished ? styles.statusTagTextFinished : styles.statusTagTextActive,
                  ]}
                >
                  {isFinished ? '🎉 FO (UKOŃCZONY)' : '🧵 WIP (W TRAKCIE)'}
                </Text>
              </View>
            </View>

            <Text style={styles.projectNameText}>{project.name}</Text>
            <Text style={styles.craftTypeBadge}>
              {project.craftType === 'knitting' ? 'DRUTY (KNITTING)' : 'SZYDEŁKO (CROCHET)'}
            </Text>

            {/* Liczniki i pasek postępu */}
            <View style={styles.progressContainer}>
              <View style={styles.rowsHeaderRow}>
                <Text style={styles.totalRowsText}>
                  {summary.totalRowsKnitted}
                  {summary.totalTargetRows !== undefined && (
                    <Text style={styles.targetRowsText}>{` / ${summary.totalTargetRows} rzędów`}</Text>
                  )}
                </Text>

                {summary.progressPercent !== undefined && (
                  <Text style={styles.percentText}>{summary.progressPercent}%</Text>
                )}
              </View>

              {summary.progressPercent !== undefined && (
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${summary.progressPercent}%` },
                    ]}
                  />
                </View>
              )}

              {summary.totalDurationFormatted && (
                <Text style={styles.timeSpentText}>
                  {`⏱️ Czas robótki: ${summary.totalDurationFormatted}`}
                </Text>
              )}
            </View>

            {/* Części robótki */}
            <View style={styles.partsContainer}>
              <Text style={styles.sectionTitle}>Części robótki ({summary.partsCount}):</Text>
              {summary.partsSummary.map((part) => (
                <View key={part.id} style={styles.partItemRow}>
                  <Text style={styles.partNameText}>• {part.name}</Text>
                  <Text style={styles.partRowsText}>
                    {part.rows} {part.targetRows ? `/ ${part.targetRows} rz.` : 'rz.'}
                    {part.progressPercent !== undefined && ` (${part.progressPercent}%)`}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Opcjonalne szczegóły do udostępnienia */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Dodatkowe informacje do udostępnienia:</Text>

            <Text style={styles.inputLabel}>Użyta włóczka (np. z Magazynu)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="np. Drops Air (odcień perłowy, 4 motki)"
              placeholderTextColor="#999999"
              value={yarnName}
              onChangeText={setYarnName}
            />

            <Text style={styles.inputLabel}>Użyte druty / szydełko</Text>
            <TextInput
              style={styles.textInput}
              placeholder="np. Druty z żyłką 4.5 mm (KnitPro)"
              placeholderTextColor="#999999"
              value={toolName}
              onChangeText={setToolName}
            />
          </View>

          {/* Szybka wymiana offline: Kod QR (DEC-20, Zadanie O5) */}
          <View style={styles.qrSectionCard}>
            <Text style={styles.qrSectionTitle}>Wymiana bezprzewodowa (Offline QR):</Text>
            <View style={styles.qrWrapper}>
              <QrCodeSvg
                value={deepLink}
                size={140}
                color="#2B2D42"
                backgroundColor="#FFFFFF"
                testID="share-card-qr"
              />
            </View>
            <Text style={styles.qrHint}>Zeskanuj aparatem w Oczko na drugim telefonie, aby zaimportować projekt bez sieci.</Text>
          </View>

          {/* Przyciski akcji */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.shareBtnText}>📤 Udostępnij kartę (Share)</Text>
              )}
            </TouchableOpacity>

            {onStatusChange && (
              <TouchableOpacity
                style={[
                  styles.toggleStatusBtn,
                  isFinished && styles.resumeStatusBtn,
                ]}
                onPress={handleToggleFinished}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator color={isFinished ? '#8B5E3C' : '#2E7D32'} />
                ) : (
                  <Text
                    style={[
                      styles.toggleStatusBtnText,
                      isFinished && styles.resumeStatusBtnText,
                    ]}
                  >
                    {isFinished ? '↩️ Wznów robótkę (ustaw jako WIP)' : '🎉 Oznacz jako ukończony (FO)'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE6E2',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#8E8E93',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  craftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#3E2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECE4DE',
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5E3C',
    letterSpacing: 1.2,
  },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusTagActive: {
    backgroundColor: '#FFF4E5',
  },
  statusTagFinished: {
    backgroundColor: '#E8F5E9',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTagTextActive: {
    color: '#B26B00',
  },
  statusTagTextFinished: {
    color: '#2E7D32',
  },
  projectNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D1F17',
    marginBottom: 4,
  },
  craftTypeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#776254',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  rowsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  totalRowsText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#8B5E3C',
  },
  targetRowsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#776254',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B5E3C',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAE2DC',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5E3C',
    borderRadius: 4,
  },
  timeSpentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
    marginTop: 8,
  },
  partsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 8,
  },
  partItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  partNameText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  partRowsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#776254',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE4DE',
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2D8CE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
    marginBottom: 12,
  },
  actionsContainer: {
    gap: 10,
  },
  shareBtn: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleStatusBtn: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  toggleStatusBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  resumeStatusBtn: {
    backgroundColor: '#F7F3F0',
    borderColor: '#D8C8BE',
  },
  resumeStatusBtnText: {
    color: '#8B5E3C',
  },
  qrSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0EAE1',
  },
  qrSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5E3C',
    marginBottom: 10,
  },
  qrWrapper: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DED6',
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 15,
  },
});
