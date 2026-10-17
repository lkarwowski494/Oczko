/**
 * Oczko UI — NumInput z obsługą przecinka i kropki oraz zapobieganiem dryfowi jednostek (NFR-INT-003, BR-TEST-005).
 * Zapewnia:
 * 1. Zgodność z polską klawiaturą (przecinek ",") oraz kropką (".")
 * 2. Prop `stored` przekazywany do `onNum(val, keep)` dla bezstratnej konwersji `wInKeep`
 * 3. Zgodność z Apple HIG (min. 44x44 pt pole dotyku, minHeight 44)
 * 4. Prawidłowe etykiety dostępności VoiceOver
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputEndEditingEventData,
} from 'react-native';

export interface NumInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number | string | undefined | null;
  onNum: (value: number | '', keep?: number | '') => void;
  decimal?: boolean;
  allowNegative?: boolean;
  /** Zapisana wartość bazowa (np. w cm lub g) sprzed edycji; gdy wpis pasuje do wyświetlanej wartości, onNum otrzymuje ją jako keep */
  stored?: number | '';
  min?: number;
  max?: number;
}

export function parseRawNumInput(text: string): number | '' | null {
  const trimmed = text.trim();
  if (trimmed === '') return '';
  const normalized = trimmed.replace(',', '.');
  const num = parseFloat(normalized);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
}

export function NumInput({
  value,
  onNum,
  decimal = true,
  allowNegative = false,
  stored,
  min,
  max,
  style,
  onEndEditing,
  ...rest
}: NumInputProps) {
  // Formatowanie wartości początkowej: zamiana '.' na ',' dla spójności językowej
  const formatInitial = (v: number | string | undefined | null): string => {
    if (v === '' || v === null || v === undefined) return '';
    return String(v).replace('.', ',');
  };

  const [text, setText] = useState<string>(() => formatInitial(value));
  const startRef = useRef<{ shown: number | string | undefined | null; stored: number | '' | undefined } | null>(null);

  // Synchronizacja z zewnętrzną zmianą wartości, jeśli użytkownik nie jest w trakcie pisania niepełnej liczby
  useEffect(() => {
    const parsed = parseRawNumInput(text);
    const numVal = typeof value === 'number' ? value : parseRawNumInput(String(value ?? ''));

    if (parsed !== numVal && numVal !== null) {
      setText(formatInitial(value));
    }
  }, [value]);

  const handleChangeText = (newText: string) => {
    setText(newText);

    if (!startRef.current) {
      startRef.current = { shown: value, stored };
    }

    const parsed = parseRawNumInput(newText);
    if (parsed !== null) {
      let finalVal: number | '' = parsed;
      if (typeof parsed === 'number') {
        if (min !== undefined && parsed < min) finalVal = min;
        if (max !== undefined && parsed > max) finalVal = max;
      }

      const isSameAsStart =
        stored !== undefined &&
        typeof parsed === 'number' &&
        startRef.current?.shown !== undefined &&
        parsed === (typeof startRef.current.shown === 'number' ? startRef.current.shown : parseFloat(String(startRef.current.shown).replace(',', '.')));

      onNum(finalVal, isSameAsStart ? startRef.current.stored : undefined);
    }
  };

  const handleEndEditing = (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
    startRef.current = null;
    const parsed = parseRawNumInput(text);
    if (parsed === null) {
      setText(formatInitial(value));
    } else {
      setText(formatInitial(parsed));
    }
    if (onEndEditing) {
      onEndEditing(e);
    }
  };

  const flatStyle = StyleSheet.flatten([styles.input, style]);

  return (
    <TextInput
      testID={rest.testID ?? 'num-input'}
      accessibilityLabel={rest.accessibilityLabel ?? 'Pole liczbowe'}
      keyboardType={
        allowNegative
          ? 'numbers-and-punctuation'
          : decimal
          ? 'decimal-pad'
          : 'number-pad'
      }
      value={text}
      onChangeText={handleChangeText}
      onEndEditing={handleEndEditing}
      accessibilityRole="text"
      style={flatStyle}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
});

export default NumInput;
