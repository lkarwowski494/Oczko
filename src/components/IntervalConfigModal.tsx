import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { t } from '../core/i18n';

export interface IntervalConfigModalProps {
  visible: boolean;
  onClose: () => void;
  tempIntervalInput: string;
  setTempIntervalInput: (v: string) => void;
  tempLabelInput: string;
  setTempLabelInput: (v: string) => void;
  onSave: () => void;
}

export function IntervalConfigModal({
  visible,
  onClose,
  tempIntervalInput,
  setTempIntervalInput,
  tempLabelInput,
  setTempLabelInput,
  onSave,
}: IntervalConfigModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('Przypomnienie cykliczne (Interwał)')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Otrzymasz wibrację i powiadomienie na ekranie co wybraną liczbę rzędów.')}
          </Text>

          <Text style={styles.inputLabel}>{t('Szybki wybór interwału:')}</Text>
          <View style={styles.intervalPresetsRow}>
            {[0, 4, 6, 8, 10, 12].map((cnt) => {
              const isSelected =
                cnt === 0 ? tempIntervalInput === '0' : tempIntervalInput === String(cnt);
              return (
                <TouchableOpacity
                  key={cnt}
                  style={[styles.presetButton, isSelected && styles.presetButtonActive]}
                  onPress={() => setTempIntervalInput(String(cnt))}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      isSelected && styles.presetButtonTextActive,
                    ]}
                  >
                    {cnt === 0 ? t('Wyłącz') : `${t('co')} ${cnt}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>{t('Liczba rzędów (własna wartość):')}</Text>
          <TextInput
            style={styles.textInput}
            value={tempIntervalInput}
            onChangeText={setTempIntervalInput}
            keyboardType="numeric"
            placeholder="np. 6"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>{t('Etykieta powiadomienia:')}</Text>
          <TextInput
            style={styles.textInput}
            value={tempLabelInput}
            onChangeText={setTempLabelInput}
            placeholder={t('np. Zmiana splotu / nitki')}
            placeholderTextColor="#999"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={t('Anuluj')}
            >
              <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSave}
            >
              <Text style={styles.submitButtonText}>{t('Zapisz')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
  },
  intervalPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0ECE8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  presetButtonActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#8B5E3C',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
