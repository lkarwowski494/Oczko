/**
 * Oczko UI — Główny ekran licznika (Minimalistyczny, wolny od rozpraszaczy)
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { ProjectManagerFacade } from '../core/project-facade';

// Inicjalizacja fasady projektu dla widoku
const facade = new ProjectManagerFacade('proj_demo', 'Mój Sweter');
facade.registerCounter({
  id: 'counter_main',
  partId: 'part_body',
  name: 'Rzędy korpusu',
  targetValue: 100,
  reminderRows: [10, 20, 30],
});

export default function MainCounterScreen() {
  const [counterState, setCounterState] = useState(facade.getCounterState('counter_main'));

  const handleIncrement = () => {
    facade.stepCounter('counter_main', 'increment', 'iphone', Date.now(), 300);
    setCounterState(facade.getCounterState('counter_main'));
  };

  const handleDecrement = () => {
    facade.undoLast('counter_main', 'iphone', Date.now());
    setCounterState(facade.getCounterState('counter_main'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.projectTitle}>Mój Sweter</Text>
        <Text style={styles.partTitle}>Rzędy korpusu</Text>
      </View>

      {/* Główny obszar klikalny – cały ekran lub duży panel */}
      <TouchableOpacity style={styles.counterCard} activeOpacity={0.9} onPress={handleIncrement}>
        <Text style={styles.counterValue}>{counterState.rawValue}</Text>
        <Text style={styles.counterHint}>Stuknij, aby dodać rząd</Text>
        {counterState.activeReminder && (
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderText}>⚠️ Ważny rząd / przypomnienie</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.undoButton} onPress={handleDecrement}>
          <Text style={styles.undoButtonText}>Cofnij ostatni (Undo)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  projectTitle: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  partTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  counterCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    padding: 20,
  },
  counterValue: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  counterHint: {
    fontSize: 14,
    color: '#888888',
    marginTop: 10,
  },
  reminderBadge: {
    marginTop: 20,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reminderText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  undoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },
  undoButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
});
