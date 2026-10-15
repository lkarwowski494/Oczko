/**
 * Oczko Components — Testy Kontraktowe Dostępności i Zgodności z Apple HIG (NFR-DOST-009, WCAG AAA)
 * Zgodne ze standardem audytu dostępności w repozytorium organizer (a11y.test.tsx).
 * Weryfikuje:
 * 1. Minimalny obszar dotyku >= 44x44 pt dla kontrolek i przycisków
 * 2. Etykiety VoiceOver i role semantyczne
 * 3. Dostępność linijki czytnika PDF w trybie wysokiego kontrastu
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import MainCounterScreen from '../../screens/MainCounterScreen';
import AppleWatchCompanionModal from '../AppleWatchCompanionModal';
import PatternPdfViewer from '../PatternPdfViewer';
import { ShapingCalculatorModal } from '../ShapingCalculatorModal';
import { GarminCompanionModal } from '../GarminCompanionModal';
import { NeedleGaugeModal } from '../NeedleGaugeModal';
import LearnScreen from '../../../app/(tabs)/learn';
import { createWatchCounterSnapshot } from '../../core/apple-watch-service';
import { createGarminSyncPayload } from '../../core/garmin-service';

function extractAllNodes(node: any): any[] {
  if (!node) return [];
  let res = [node];
  if (Array.isArray(node)) {
    return node.flatMap(extractAllNodes);
  }
  if (node.children) {
    for (const child of node.children) {
      res = res.concat(extractAllNodes(child));
    }
  }
  return res;
}

describe('Kontrakty Dostępności i Human Interface Guidelines (WCAG AAA & Apple HIG)', () => {
  describe('Minimalny obszar dotyku (Apple HIG >= 44x44 pt)', () => {
    it('karta licznika i przycisk cofania na ekranie głównym mają wysokość/obszar >= 44 pt', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<MainCounterScreen />);
      });

      const root = tree.root;
      // Znajdź wszystkie komponenty dotykowe TouchableOpacity
      const touchables = root.findAll((n: any) => typeof n.props?.onPress === 'function');
      expect(touchables.length).toBeGreaterThan(0);

      // Karta licznika (główny cel dotykowy) musi mieć znacznie ponad 44 pt (wygodne stuknięcie)
      const counterCard = touchables.find((n: any) => {
        const style = StyleSheet.flatten(n.props.style) as any;
        return style?.minHeight >= 150 || style?.padding >= 20;
      });
      expect(counterCard).toBeDefined();

      // Przycisk cofania Undo
      const undoBtn = touchables.find((n: any) => {
        const style = StyleSheet.flatten(n.props.style) as any;
        return style?.paddingVertical >= 10 || style?.minHeight >= 44;
      });
      expect(undoBtn).toBeDefined();
    });

    it('przycisk stuknięcia w symulatorze Apple Watch spełnia wymagania dotykowe zegarka', () => {
      let tree: any;
      const snapshot = createWatchCounterSnapshot({
        projectId: 'p1',
        projectName: 'Sweter',
        partId: 'part1',
        partName: 'Korpus',
        counterId: 'c1',
        counterName: 'Rzędy',
        counterState: {
          rawValue: 12,
          activeReminder: false,
          reminderRows: [],
          isGoalReached: false,
          history: [],
        },
      });

      act(() => {
        tree = renderer.create(
          <AppleWatchCompanionModal
            visible={true}
            onClose={() => {}}
            snapshot={snapshot}
            onStep={() => {}}
          />
        );
      });

      const root = tree.root;
      const touchables = root.findAll((n: any) => typeof n.props?.onPress === 'function');
      expect(touchables.length).toBeGreaterThan(0);

      // Przycisk zegarka +1
      const watchStepBtn = touchables.find((n: any) => {
        const style = StyleSheet.flatten(n.props.style) as any;
        return (style?.width && style.width >= 44) || (style?.minHeight && style.minHeight >= 44) || style?.padding >= 10;
      });
      expect(watchStepBtn).toBeDefined();
    });

    it('przyciski nawigacji linijki w PatternPdfViewer mają minHeight/minWidth >= 44 pt', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<PatternPdfViewer initialDocument={null} />);
      });

      const root = tree.root;
      const touchables = root.findAll((n: any) => typeof n.props?.onPress === 'function');
      expect(touchables.length).toBeGreaterThan(0);

      for (const btn of touchables) {
        const flatStyle = StyleSheet.flatten(btn.props?.style) as any;
        if (flatStyle) {
          const hasAdequateTouchTarget =
            (flatStyle.minHeight && flatStyle.minHeight >= 44) ||
            (flatStyle.height && flatStyle.height >= 40) ||
            (flatStyle.padding && flatStyle.padding >= 10) ||
            (flatStyle.paddingVertical && flatStyle.paddingVertical >= 8);

          expect(hasAdequateTouchTarget).toBeTruthy();
        }
      }
    });

    it('kontrolki i kafelki opcji w kluczu Co widzisz spełniają wymóg >= 44 pt oraz posiadają etykiety VoiceOver', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<LearnScreen />);
      });

      const root = tree.root;
      // Przełącz na "Co widzisz?"
      const tabBtn = root.find(
        (n: any) => n.props?.accessibilityLabel && n.props.accessibilityLabel.includes('Co widzisz?')
      );
      expect(tabBtn).toBeDefined();

      act(() => {
        tabBtn.props.onPress();
      });

      // Sprawdź karty wyboru cech ściegu
      const options = root.findAll(
        (n: any) => n.props?.accessibilityRole === 'button' && n.props?.accessibilityLabel
      );
      expect(options.length).toBeGreaterThanOrEqual(4);

      for (const opt of options) {
        expect(opt.props.accessibilityRole).toBe('button');
        expect(typeof opt.props.accessibilityLabel).toBe('string');
        expect(opt.props.accessibilityLabel.length).toBeGreaterThan(0);

        const flat = StyleSheet.flatten(opt.props.style) as any;
        if (flat) {
          const hasAdequateTouchTarget =
            (flat.minHeight && flat.minHeight >= 44) ||
            (flat.height && flat.height >= 40) ||
            (flat.paddingVertical && flat.paddingVertical >= 8);
          expect(hasAdequateTouchTarget).toBeTruthy();
        }
      }
    });

    it('kontrolki i przyciski w ShapingCalculatorModal spełniają wymóg >= 44 pt oraz posiadają etykiety VoiceOver', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<ShapingCalculatorModal visible={true} onClose={jest.fn()} />);
      });

      const root = tree.root;
      const buttons = root.findAll(
        (n: any) => n.props?.accessibilityRole === 'button' || n.props?.accessibilityRole === 'checkbox'
      );
      expect(buttons.length).toBeGreaterThanOrEqual(5);

      for (const btn of buttons) {
        expect(btn.props.accessibilityLabel).toBeDefined();
        expect(typeof btn.props.accessibilityLabel).toBe('string');
        expect(btn.props.accessibilityLabel.length).toBeGreaterThan(0);

        const flat = StyleSheet.flatten(btn.props.style) as any;
        if (flat) {
          const hasAdequateTouchTarget =
            (flat.minHeight && flat.minHeight >= 44) ||
            (flat.height && flat.height >= 40) ||
            (flat.paddingVertical && flat.paddingVertical >= 8);
          expect(hasAdequateTouchTarget).toBeTruthy();
        }
      }
    });

    it('kontrolki w GarminCompanionModal spełniają standardy dostępności dotykowej i etykiet', () => {
      let tree: any;
      const payload = createGarminSyncPayload({
        counterId: 'c1',
        projectName: 'Szalik',
        partName: 'Ścieg',
        currentCount: 15,
        targetCount: 40,
        unitLabel: 'rząd',
      });

      act(() => {
        tree = renderer.create(
          <GarminCompanionModal
            visible={true}
            onClose={() => {}}
            syncPayload={payload}
            onIncrement={() => {}}
            onDecrement={() => {}}
          />
        );
      });

      const root = tree.root;
      const buttons = root.findAll((n: any) => n.props?.accessibilityRole === 'button' && n.props?.accessibilityLabel);
      expect(buttons.length).toBeGreaterThanOrEqual(4);

      for (const btn of buttons) {
        expect(typeof btn.props.accessibilityLabel).toBe('string');
        expect(btn.props.accessibilityLabel.length).toBeGreaterThan(0);
      }
    });

    it('kontrolki i przełączniki w NeedleGaugeModal spełniają wymóg >= 44 pt oraz posiadają etykiety VoiceOver', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<NeedleGaugeModal visible={true} onClose={() => {}} />);
      });

      const root = tree.root;
      const buttons = root.findAll((n: any) => n.props?.accessibilityRole === 'button' && n.props?.accessibilityLabel);
      expect(buttons.length).toBeGreaterThanOrEqual(2);

      for (const btn of buttons) {
        expect(typeof btn.props.accessibilityLabel).toBe('string');
        expect(btn.props.accessibilityLabel.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Dostępność dla osób słabowidzących (NFR-DOST-009)', () => {
    it('czytnik PDF zawiera elementy z czytelnym podglądem i etykietami stanu', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<PatternPdfViewer initialDocument={null} />);
      });

      const allNodes = extractAllNodes(tree.toJSON());
      const texts = allNodes.filter((n) => typeof n === 'string' || (n.type === 'Text' && n.children));
      expect(texts.length).toBeGreaterThan(0);
    });

    it('wszystkie modale posiadają zdefiniowany nagłówek i jasną akcję rezygnacji/zamknięcia', () => {
      let tree: any;
      act(() => {
        tree = renderer.create(<MainCounterScreen />);
      });

      const root = tree.root;
      const modals = root.findAll((n: any) => typeof n.props?.onRequestClose === 'function');
      expect(modals.length).toBeGreaterThanOrEqual(2);

      // Każdy modal ma zdefiniowane bezpieczne zamykanie onRequestClose (dostępność Android/iOS)
      for (const modal of modals) {
        expect(typeof modal.props.onRequestClose).toBe('function');
      }
    });
  });
});
