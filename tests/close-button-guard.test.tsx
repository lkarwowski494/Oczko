import React from 'react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import renderer, { act } from 'react-test-renderer';
import { CloseButton, CLOSE_TEST_ID } from '../src/components/CloseButton';

const ROOT = join(__dirname, '..');
const MODALS_DIR = join(ROOT, 'src', 'components');

describe('Strażnik zamykania okien i modali (close-button-guard / NFR-INT-001, S1)', () => {
  describe('Komponent CloseButton (Apple HIG Sheets)', () => {
    it('renderuje przycisk o testID close-modal, roli button, etykiecie Anuluj i wymiarach >= 44 pt', () => {
      const onPress = jest.fn();
      let tree: any;
      act(() => {
        tree = renderer.create(<CloseButton onPress={onPress} />);
      });

      const button = tree.root.findByProps({ testID: CLOSE_TEST_ID });
      expect(button).toBeDefined();
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Anuluj');

      // Apple HIG: pole dotyku >= 44 pt
      const flatStyle = button.props.style;
      expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);

      // Wywołanie akcji
      act(() => {
        button.props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('obsługuje niestandardową etykietę (np. Gotowe lub Zamknij)', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<CloseButton onPress={jest.fn()} label="Gotowe" />);
      });

      const button = tree.root.findByProps({ testID: CLOSE_TEST_ID });
      expect(button.props.accessibilityLabel).toBe('Gotowe');
    });
  });

  describe('Skan statyczny modali (Każdy modal posiada mechanizm zamknięcia)', () => {
    it('wszystkie komponenty modalne w src/components/ posiadają bezpieczne zamykanie (onRequestClose lub onClose)', () => {
      const files = readdirSync(MODALS_DIR)
        .filter((f) => f.endsWith('Modal.tsx'))
        .map((f) => join(MODALS_DIR, f));

      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        // Każdy modal musi obsługiwać onRequestClose lub przekazywać onClose / visible
        const hasCloseHandling =
          /onRequestClose/i.test(content) ||
          /onClose/i.test(content) ||
          /close-modal/i.test(content) ||
          /Anuluj/i.test(content);

        expect(hasCloseHandling).toBe(true);
      }
    });
  });
});
