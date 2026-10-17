import React from 'react';
import { Text, Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SwipeRow, swipeDecision, SWIPE } from '../src/components/SwipeRow';

jest.spyOn(Alert, 'alert');

describe('Wzorzec usuwania przesunięciem (SwipeRow / NFR-INT-004)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Logika decyzji gestu (swipeDecision)', () => {
    it('krótki ruch zamyka, połowa przycisku lub szybki ruch w lewo odsłania, duży ruch pyta', () => {
      const w = SWIPE.button;
      expect(swipeDecision(-10, 0)).toBe('close');
      expect(swipeDecision(-w * 0.49, 0)).toBe('close');

      // Odsłonięcie
      expect(swipeDecision(-w * 0.5, 0)).toBe('open');
      expect(swipeDecision(-20, -0.6)).toBe('open');

      // Natychmiastowe zapytanie o usunięcie przy dużym zamachu
      expect(swipeDecision(-w * 1.9, 0)).toBe('ask');
      expect(swipeDecision(-w * 1.2, -1.6)).toBe('ask');

      // Ruch w prawo zamyka
      expect(swipeDecision(30, 0)).toBe('close');
    });
  });

  describe('Komponent SwipeRow i dostępność VoiceOver', () => {
    it('dodaje akcję VoiceOver „delete” do wiersza i wywołuje potwierdzenie z Anuluj / Usuń', () => {
      const onDelete = jest.fn();
      let tree: any;
      act(() => {
        tree = renderer.create(
          <SwipeRow
            label="Usuń włóczkę: Alpaca Silk"
            title="Usunąć włóczkę?"
            message="Tej operacji nie można cofnąć."
            onDelete={onDelete}
          >
            {(a11y) => (
              <Text {...a11y} accessibilityLabel="Włóczka Alpaca Silk">
                Alpaca Silk
              </Text>
            )}
          </SwipeRow>
        );
      });

      const rowElement = tree.root.findByProps({ accessibilityLabel: 'Włóczka Alpaca Silk' });
      expect(rowElement.props.accessibilityActions).toEqual([
        { name: 'delete', label: 'Usuń włóczkę: Alpaca Silk' },
      ]);

      // Wyzwolenie akcji VoiceOver delete
      act(() => {
        rowElement.props.onAccessibilityAction({
          nativeEvent: { actionName: 'delete' },
        });
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Usunąć włóczkę?',
        'Tej operacji nie można cofnąć.',
        [
          expect.objectContaining({ text: 'Anuluj', style: 'cancel' }),
          expect.objectContaining({ text: 'Usuń', style: 'destructive' }),
        ]
      );
    });

    it('w trybie disabled nie dodaje akcji accessibility ani przycisku', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(
          <SwipeRow
            label="Usuń pozycję"
            title="Usunąć?"
            onDelete={jest.fn()}
            disabled={true}
          >
            {(a11y) => <Text {...a11y} accessibilityLabel="Zablokowana">Pozycja zablokowana</Text>}
          </SwipeRow>
        );
      });

      const row = tree.root.findByProps({ accessibilityLabel: 'Zablokowana' });
      expect(row.props.accessibilityActions).toBeUndefined();
    });
  });
});
