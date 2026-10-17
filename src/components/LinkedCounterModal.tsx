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

export interface LinkedCounterModalProps {
  visible: boolean;
  onClose: () => void;
  partName: string;
  newLinkedName: string;
  setNewLinkedName: (v: string) => void;
  newModuloCycle: string;
  setNewModuloCycle: (v: string) => void;
  newReminderRow: string;
  setNewReminderRow: (v: string) => void;
  onCreateLinkedCounter: () => void;
}

export function LinkedCounterModal({
  visible,
  onClose,
  partName,
  newLinkedName,
  setNewLinkedName,
  newModuloCycle,
  setNewModuloCycle,
  newReminderRow,
  setNewReminderRow,
  onCreateLinkedCounter,
}: LinkedCounterModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('Dodaj powiązany licznik wzoru')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Licznik będzie automatycznie naliczał się wraz z rzędami części:')} {partName}
          </Text>

          <Text style={styles.inputLabel}>{t('Nazwa wzoru (np. Warkocz C6F, Ażur)')}</Text>
          <TextInput
            style={styles.textInput}
            value={newLinkedName}
            onChangeText={setNewLinkedName}
            placeholder={t('np. Warkocz na rękawie')}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>{t('Długość cyklu / powtórzenia (np. 6 rzędów)')}</Text>
          <TextInput
            style={styles.textInput}
            value={newModuloCycle}
            onChangeText={setNewModuloCycle}
            keyboardType="numeric"
            placeholder="np. 6"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>{t('Rząd z przypomnieniem o operacji')}</Text>
          <TextInput
            style={styles.textInput}
            value={newReminderRow}
            onChangeText={setNewReminderRow}
            keyboardType="numeric"
            placeholder="np. 6"
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
              onPress={onCreateLinkedCounter}
            >
              <Text style={styles.submitButtonText}>{t('Dodaj licznik')}</Text>
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
