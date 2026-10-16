import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Share,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOptionalProject } from '../../src/core/project-context';
import { useAppAccess } from '../../src/core/app-access-context';
import { useLang, setLang, t } from '../../src/core/i18n';
import {
  getUnitSystem,
  setUnitSystem,
  subscribeUnitSystem,
  UnitSystem,
} from '../../src/core/unit-converter';
import {
  getDatabaseStats,
  exportBackupToJson,
  importDatabaseBackup,
  validateBackupData,
  OczkoBackupMetadata,
} from '../../src/core/backup-service';
import { triggerHaptic } from '../../src/core/feedback-service';
import AppleWatchCompanionModal from '../../src/components/AppleWatchCompanionModal';
import { GarminCompanionModal } from '../../src/components/GarminCompanionModal';
import { createWatchCounterSnapshot } from '../../src/core/apple-watch-service';
import { createGarminSyncPayload } from '../../src/core/garmin-service';

function useUnitSystem(): UnitSystem {
  const [sys, setSys] = useState<UnitSystem>(getUnitSystem());
  useEffect(() => {
    return subscribeUnitSystem(setSys);
  }, []);
  return sys;
}

export default function SettingsScreen() {
  const projectContext = useOptionalProject();
  const db = projectContext?.db ?? null;
  const refreshProjects = projectContext?.refreshProjects;

  const [debounceMs, setDebounceMs] = useState(300);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [defaultInterval, setDefaultInterval] = useState(0);
  const [iCloudBackup, setICloudBackup] = useState(true);
  const [isWatchModalVisible, setIsWatchModalVisible] = useState(false);
  const [isGarminModalVisible, setIsGarminModalVisible] = useState(false);
  const [garminTestCount, setGarminTestCount] = useState(24);

  // Stan bazy danych i kopii zapasowych (DEC-10, BR-DANE-002)
  const [stats, setStats] = useState<OczkoBackupMetadata['itemCounts'] | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal przywracania kopii
  const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const debounceOptions = [200, 300, 400, 500];

  const appAccess = useAppAccess();
  const currentLang = useLang();
  const currentUnitSystem = useUnitSystem();

  const handleRestorePurchases = async () => {
    try {
      await appAccess.restore();
      setStatusMessage(t('Przywrócono poprzednie zakupy.'));
      Alert.alert(t('Sukces'), t('Przywrócono poprzednie zakupy.'));
    } catch (err: any) {
      Alert.alert(t('Błąd'), err?.message || t('Nie udało się przywrócić zakupów.'));
    }
  };

  const loadStats = useCallback(async () => {
    if (!db) return;
    try {
      const data = await getDatabaseStats(db);
      setStats(data);
    } catch (err) {
      console.error('Błąd odczytu statystyk bazy:', err);
    }
  }, [db]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleExportBackup = async () => {
    if (!db) {
      Alert.alert('Błąd', 'Baza danych nie jest jeszcze zainicjalizowana.');
      return;
    }
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const json = await exportBackupToJson(db, true);
      await Share.share({
        title: 'Kopia zapasowa Oczko (Purlo)',
        message: json,
      });
      setStatusMessage('Wyeksportowano kopię bazy danych.');
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        Alert.alert('Błąd eksportu', err?.message || 'Nie udało się wyeksportować kopii.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!db) {
      setRestoreError('Baza danych nie jest dostępna.');
      return;
    }

    const validation = validateBackupData(restoreJsonInput);
    if (!validation.valid) {
      setRestoreError(validation.error);
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);

    try {
      const result = await importDatabaseBackup(db, validation.data);
      if (result.success) {
        if (refreshProjects) {
          await refreshProjects();
        }
        await loadStats();
        setIsRestoreModalVisible(false);
        setRestoreJsonInput('');
        setStatusMessage(
          `Przywrócono bazę pomyślnie (${result.importedCounts.projects} projektów, ${result.importedCounts.yarns} włóczek).`
        );
        Alert.alert(
          'Sukces',
          `Baza została przywrócona! Odtworzono: ${result.importedCounts.projects} projektów, ${result.importedCounts.events} zdarzeń, ${result.importedCounts.yarns} pozycji włóczek.`
        );
      }
    } catch (err: any) {
      setRestoreError(err?.message || 'Wystąpił błąd podczas odtwarzania danych.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {statusMessage && (
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>✓ {statusMessage}</Text>
          </View>
        )}

        {/* Sekcja: Apps4Brew Studio Pass & Monetyzacja */}
        <Text style={styles.sectionHeader}>{t('APPS4BREW STUDIO PASS & SUBSKRYPCJA')}</Text>
        <View style={styles.card}>
          <View style={styles.passHeaderRow}>
            <View
              style={[
                styles.passBadge,
                appAccess.evaluation.isPremium
                  ? styles.passBadgePremium
                  : appAccess.evaluation.isTrial
                  ? styles.passBadgeTrial
                  : styles.passBadgeReadOnly,
              ]}
            >
              <Text style={styles.passBadgeText}>
                {appAccess.evaluation.isPremium
                  ? '★ PRO'
                  : appAccess.evaluation.isTrial
                  ? '⏳ TRIAL'
                  : '🔒 READ-ONLY'}
              </Text>
            </View>
            <Text style={styles.passStatusTitle}>
              {appAccess.evaluation.isPremium
                ? t('Dostęp Pełny Aktywny')
                : appAccess.evaluation.isTrial
                ? t('Aktywny okres próbny')
                : t('Historia (Tylko do odczytu)')}
            </Text>
          </View>

          <Text style={styles.passDescription}>
            {appAccess.evaluation.isPremium
              ? t('Plan: {plan}', {
                  plan:
                    appAccess.evaluation.activePlan === 'lifetime'
                      ? t('Dostęp Dożywotni (Lifetime)')
                      : appAccess.evaluation.activePlan === 'annual'
                      ? t('Abonament Roczny')
                      : t('Plan Miesięczny'),
                })
              : appAccess.evaluation.isTrial
              ? t('Pozostało dni: {days} | Dostępne nowe projekty: {projects}', {
                  days: appAccess.evaluation.trialDaysRemaining,
                  projects: appAccess.evaluation.trialProjectsRemaining,
                })
              : t('Okres próbny dobiegł końca. Wszystkie Twoje dotychczasowe robótki są bezpieczne. Aby tworzyć nowe, odblokuj Pass.')}
          </Text>

          <View style={styles.passButtonsRow}>
            <TouchableOpacity
              style={styles.passMainBtn}
              onPress={appAccess.openPaywall}
              accessibilityRole="button"
            >
              <Text style={styles.passMainBtnText}>
                {appAccess.evaluation.isPremium
                  ? t('Zarządzaj subskrypcją')
                  : t('Odblokuj pełny dostęp ($0.99 / $4.99 / $14.99)')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passRestoreBtn}
              onPress={handleRestorePurchases}
              accessibilityRole="button"
            >
              <Text style={styles.passRestoreBtnText}>{t('Przywróć zakupy')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sekcja: Język & System jednostek */}
        <Text style={styles.sectionHeader}>{t('JĘZYK & SYSTEM JEDNOSTEK')}</Text>
        <View style={styles.card}>
          <Text style={styles.settingTitle}>{t('Język')}</Text>
          <Text style={styles.settingDesc}>{t('Wybierz język interfejsu aplikacji')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionChip,
                currentLang === 'pl' && styles.optionChipActive,
              ]}
              onPress={() => setLang('pl')}
            >
              <Text
                style={[
                  styles.optionChipText,
                  currentLang === 'pl' && styles.optionChipTextActive,
                ]}
              >
                🇵🇱 {t('Polski')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionChip,
                currentLang === 'en' && styles.optionChipActive,
              ]}
              onPress={() => setLang('en')}
            >
              <Text
                style={[
                  styles.optionChipText,
                  currentLang === 'en' && styles.optionChipTextActive,
                ]}
              >
                🇬🇧 {t('Angielski')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.unitSection, styles.borderTop]}>
            <Text style={styles.settingTitle}>{t('System jednostek')}</Text>
            <Text style={styles.settingDesc}>
              {t('Przeliczanie centymetrów, jardów, uncji i standardu US wg Craft Yarn Council')}
            </Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionChip,
                  currentUnitSystem === 'metric' && styles.optionChipActive,
                ]}
                onPress={() => setUnitSystem('metric')}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    currentUnitSystem === 'metric' && styles.optionChipTextActive,
                  ]}
                >
                  {t('Metryczny (cm, m, g)')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionChip,
                  currentUnitSystem === 'imperial' && styles.optionChipActive,
                ]}
                onPress={() => setUnitSystem('imperial')}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    currentUnitSystem === 'imperial' && styles.optionChipTextActive,
                  ]}
                >
                  {t('Imperialny (cale, yd, oz)')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sekcja: Licznik & Interakcja */}
        <Text style={styles.sectionHeader}>LICZNIK & STUKNIĘCIA</Text>
        <View style={styles.card}>
          <Text style={styles.settingTitle}>Czas blokady szybkich stuknięć (Debounce)</Text>
          <Text style={styles.settingDesc}>
            Zapobiega przypadkowemu podwójnemu naliczeniu oczka/rzędu (BR-LICZ-008).
          </Text>
          <View style={styles.optionsRow}>
            {debounceOptions.map((ms) => (
              <TouchableOpacity
                key={ms}
                style={[
                  styles.optionChip,
                  debounceMs === ms && styles.optionChipActive,
                ]}
                onPress={() => setDebounceMs(ms)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    debounceMs === ms && styles.optionChipTextActive,
                  ]}
                >
                  {ms} ms
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.settingTitle}>Wibracje haptyczne (Haptics)</Text>
              <Text style={styles.settingDesc}>Subtelne potwierdzenie każdego dodanego rzędu</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                setHapticsEnabled(val);
                if (val) triggerHaptic('step', { hapticsEnabled: true });
              }}
              trackColor={{ false: '#E5E5EA', true: '#8B5E3C' }}
            />
          </View>

          {hapticsEnabled && (
            <View style={[styles.testHapticsContainer, styles.borderTop]}>
              <Text style={styles.testHapticsTitle}>Przetestuj profile wibracji:</Text>
              <View style={styles.testChipsRow}>
                <TouchableOpacity
                  style={styles.testChip}
                  onPress={() => triggerHaptic('step', { hapticsEnabled: true })}
                >
                  <Text style={styles.testChipText}>👆 Krok (+1)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testChip}
                  onPress={() => triggerHaptic('undo', { hapticsEnabled: true })}
                >
                  <Text style={styles.testChipText}>↩️ Cofnięcie (-1)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testChip}
                  onPress={() => triggerHaptic('cycle', { hapticsEnabled: true })}
                >
                  <Text style={styles.testChipText}>🪢 Cykl wzoru</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testChip}
                  onPress={() => triggerHaptic('goal', { hapticsEnabled: true })}
                >
                  <Text style={styles.testChipText}>🏆 Cel robótki</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.testChip}
                  onPress={() => triggerHaptic('reminder', { hapticsEnabled: true })}
                >
                  <Text style={styles.testChipText}>🔔 Przypomnienie</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={[styles.toggleRow, styles.borderTop]}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.settingTitle}>Dźwięk kliknięcia</Text>
              <Text style={styles.settingDesc}>Dyskretny dźwięk przy zliczaniu</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E5E5EA', true: '#8B5E3C' }}
            />
          </View>
        </View>

        {/* Przypomnienia interwałowe */}
        <View style={styles.card}>
          <Text style={styles.settingTitle}>Domyślne przypomnienie interwałowe</Text>
          <Text style={styles.settingDesc}>
            Automatyczny sygnał wibracyjny i powiadomienie co N rzędów (BR-LICZ-003).
          </Text>
          <View style={styles.optionsRow}>
            {[0, 4, 6, 8, 10, 12].map((cnt) => (
              <TouchableOpacity
                key={cnt}
                style={[
                  styles.optionChip,
                  defaultInterval === cnt && styles.optionChipActive,
                ]}
                onPress={() => setDefaultInterval(cnt)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    defaultInterval === cnt && styles.optionChipTextActive,
                  ]}
                >
                  {cnt === 0 ? 'Wyłącz' : `co ${cnt}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sekcja: Kopia i Synchronizacja */}
        <Text style={styles.sectionHeader}>DANE & SYNCHRONIZACJA (DEC-10)</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.settingTitle}>Automatyczny backup iCloud Drive</Text>
              <Text style={styles.settingDesc}>Kopia bazy SQLite w prywatnym iCloud (DEC-10)</Text>
            </View>
            <Switch
              value={iCloudBackup}
              onValueChange={setICloudBackup}
              trackColor={{ false: '#E5E5EA', true: '#8B5E3C' }}
            />
          </View>

          {/* Statystyki lokalnej bazy danych */}
          <View style={[styles.statsBox, styles.borderTop]}>
            <Text style={styles.statsHeader}>Stan lokalnej bazy SQLite (Local-first):</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats ? stats.projects : '—'}</Text>
                <Text style={styles.statLabel}>Projekty</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats ? stats.events : '—'}</Text>
                <Text style={styles.statLabel}>Zdarzenia</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats ? stats.yarns : '—'}</Text>
                <Text style={styles.statLabel}>Włóczki</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats ? stats.tools : '—'}</Text>
                <Text style={styles.statLabel}>Narzędzia</Text>
              </View>
            </View>
          </View>

          {/* Przyciski Eksportu i Importu */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.exportBtn]}
              onPress={handleExportBackup}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionBtnText}>📤 Eksportuj kopię</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.restoreBtn]}
              onPress={() => {
                setRestoreError(null);
                setIsRestoreModalVisible(true);
              }}
            >
              <Text style={[styles.actionBtnText, styles.restoreBtnText]}>📥 Przywróć kopię</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statusRow, styles.borderTop]}>
            <Text style={styles.statusLabel}>Apple Watch (watchOS 11):</Text>
            <View style={styles.watchStatusGroup}>
              <Text style={styles.statusActive}>Gotowy</Text>
              <TouchableOpacity
                style={styles.watchTestBtn}
                onPress={() => setIsWatchModalVisible(true)}
              >
                <Text style={styles.watchTestBtnText}>⌚ Testuj</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Garmin Connect IQ (DEC-02):</Text>
            <View style={styles.watchStatusGroup}>
              <Text style={styles.statusActive}>Prototyp</Text>
              <TouchableOpacity
                style={styles.watchTestBtn}
                onPress={() => setIsGarminModalVisible(true)}
              >
                <Text style={styles.watchTestBtnText}>🛰️ Testuj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Informacje o aplikacji */}
        <Text style={styles.sectionHeader}>O APLIKACJI</Text>
        <View style={styles.card}>
          <Text style={styles.appTitle}>Oczko (Purlo)</Text>
          <Text style={styles.appMeta}>Wersja: 0.1.0 MVP (b+)</Text>
          <Text style={styles.appMeta}>Identyfikator: com.apps4brew.knitting</Text>
          <Text style={styles.appMeta}>Wydawca: Apps4Brew</Text>
        </View>
      </ScrollView>

      {/* Modal przywracania kopii JSON */}
      <Modal
        visible={isRestoreModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsRestoreModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Przywróć z kopii zapasowej</Text>
            <TouchableOpacity
              onPress={() => setIsRestoreModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalDesc}>
              Wklej zawartość pliku JSON z kopią zapasową aplikacji Oczko.
              {'\n\n'}
              <Text style={styles.warningText}>
                ⚠️ UWAGA: Przywrócenie kopii zastąpi aktualne projekty i wpisy magazynu danymi z pliku.
              </Text>
            </Text>

            {restoreError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{restoreError}</Text>
              </View>
            )}

            <TextInput
              style={styles.jsonInput}
              multiline
              numberOfLines={10}
              placeholder='Wklej tutaj kod JSON kopii zapasowej (rozpoczynający się od {"metadata": ...})'
              placeholderTextColor="#999"
              value={restoreJsonInput}
              onChangeText={setRestoreJsonInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[
                styles.executeRestoreBtn,
                (!restoreJsonInput.trim() || isRestoring) && styles.disabledBtn,
              ]}
              onPress={handleExecuteRestore}
              disabled={!restoreJsonInput.trim() || isRestoring}
            >
              {isRestoring ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.executeRestoreBtnText}>Zatwierdź i przywróć dane</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setIsRestoreModalVisible(false)}
              disabled={isRestoring}
            >
              <Text style={styles.cancelModalBtnText}>Anuluj</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal testowy Apple Watch & Smart Stack (DEC-03) */}
      <AppleWatchCompanionModal
        visible={isWatchModalVisible}
        onClose={() => setIsWatchModalVisible(false)}
        snapshot={createWatchCounterSnapshot({
          projectId: 'proj_settings_test',
          projectName: 'Mój Projekt',
          partId: 'part_test',
          partName: 'Korpus',
          counterId: 'c1',
          counterName: 'Rzędy',
          counterState: {
            rawValue: 24,
            targetValue: 60,
            activeReminder: true,
            reminderRows: [24],
            isGoalReached: false,
            history: [],
          },
          reminderReason: '🔔 Przypomnienie interwałowe',
        })}
      />

      {/* Modal testowy Garmin ConnectIQ (DEC-02) */}
      <GarminCompanionModal
        visible={isGarminModalVisible}
        onClose={() => setIsGarminModalVisible(false)}
        syncPayload={createGarminSyncPayload({
          counterId: 'c1',
          projectName: 'Mój Projekt',
          partName: 'Korpus',
          currentCount: garminTestCount,
          targetCount: 60,
          unitLabel: 'rząd',
        })}
        onIncrement={() => setGarminTestCount((c) => c + 1)}
        onDecrement={() => setGarminTestCount((c) => Math.max(0, c - 1))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bannerContainer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  optionChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  optionChipActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
    paddingTop: 12,
  },
  statsBox: {
    marginVertical: 4,
  },
  statsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6F4',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5E3C',
  },
  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtn: {
    backgroundColor: '#8B5E3C',
  },
  restoreBtn: {
    backgroundColor: '#F0ECE8',
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreBtnText: {
    color: '#8B5E3C',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 13,
    color: '#555555',
  },
  statusActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28A745',
  },
  statusPlanned: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6C757D',
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  appMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#8E8E93',
  },
  modalBody: {
    padding: 16,
  },
  modalDesc: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 12,
  },
  warningText: {
    color: '#D9534F',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
  },
  jsonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 10,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1A1A1A',
    minHeight: 180,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  executeRestoreBtn: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  executeRestoreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelModalBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '600',
  },
  testHapticsContainer: {
    paddingTop: 12,
    marginTop: 4,
  },
  testHapticsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 8,
  },
  testChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  testChip: {
    backgroundColor: '#F4ECE4',
    borderWidth: 1,
    borderColor: '#D8C8BE',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  testChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C3E26',
  },
  watchStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchTestBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  watchTestBtnText: {
    color: '#FF9F0A',
    fontSize: 11,
    fontWeight: '700',
  },
  passHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  passBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passBadgePremium: {
    backgroundColor: '#D4AF37',
  },
  passBadgeTrial: {
    backgroundColor: '#8B5E3C',
  },
  passBadgeReadOnly: {
    backgroundColor: '#7A1C1C',
  },
  passBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  passDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 12,
  },
  passButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  passMainBtn: {
    flex: 2,
    backgroundColor: '#8B5E3C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passMainBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  passRestoreBtn: {
    flex: 1,
    backgroundColor: '#F0EAE1',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passRestoreBtnText: {
    color: '#5C3E26',
    fontWeight: '600',
    fontSize: 12,
  },
  unitSection: {
    marginTop: 12,
  },
});
