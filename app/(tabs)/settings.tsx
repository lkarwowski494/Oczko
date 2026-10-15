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
import {
  getDatabaseStats,
  exportBackupToJson,
  importDatabaseBackup,
  validateBackupData,
  OczkoBackupMetadata,
} from '../../src/core/backup-service';

export default function SettingsScreen() {
  const projectContext = useOptionalProject();
  const db = projectContext?.db ?? null;
  const refreshProjects = projectContext?.refreshProjects;

  const [debounceMs, setDebounceMs] = useState(300);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [iCloudBackup, setICloudBackup] = useState(true);

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
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#E5E5EA', true: '#8B5E3C' }}
            />
          </View>

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
            <Text style={styles.statusActive}>Gotowy do synchronizacji</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Garmin Connect IQ:</Text>
            <Text style={styles.statusPlanned}>Planowany w v1.1 (DEC-02)</Text>
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
});
