import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [debounceMs, setDebounceMs] = useState(300);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [iCloudBackup, setICloudBackup] = useState(true);

  const debounceOptions = [200, 300, 400, 500];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
        <Text style={styles.sectionHeader}>DANE & SYNCHRONIZACJA</Text>
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
});
