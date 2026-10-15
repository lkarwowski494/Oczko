/**
 * Oczko UI — Testy komponentu symulatora Apple Watch & Smart Stack (DEC-03, BR-ZEG-003, BR-ZEG-009)
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AppleWatchCompanionModal from '../AppleWatchCompanionModal';
import { WatchCounterSnapshot } from '../../core/apple-watch-service';

function extractAllStrings(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractAllStrings).join(' ');
  }
  const childrenText = node.children ? node.children.map(extractAllStrings).join(' ') : '';
  const propsText = node.props?.children ? extractAllStrings(node.props.children) : '';
  const valueText = node.props?.value ? String(node.props.value) : '';
  return `${childrenText} ${propsText} ${valueText}`;
}

const MOCK_SNAPSHOT: WatchCounterSnapshot = {
  projectId: 'p1',
  projectName: 'Mój Sweter',
  partId: 'part_body',
  partName: 'Korpus',
  counterId: 'c1',
  counterName: 'Główny',
  currentValue: 28,
  targetValue: 80,
  progressPercent: 35,
  activeReminder: true,
  reminderReason: '🔔 Zmiana koloru włóczki',
  lastUpdatedMs: Date.now(),
};

describe('AppleWatchCompanionModal (DEC-03, BR-ZEG-003, BR-ZEG-009)', () => {
  it('renderuje tarczę Apple Watch z bieżącym rzędem i nazwą projektu', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <AppleWatchCompanionModal
          visible={true}
          onClose={jest.fn()}
          snapshot={MOCK_SNAPSHOT}
          onStep={jest.fn()}
        />
      );
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Mój Sweter');
    expect(text).toContain('Korpus');
    expect(text).toContain('28');
    expect(text).toContain('z 80');
    expect(text).toContain('+1 Rząd');
    expect(text).toContain('Zmiana koloru włóczki');
  });

  it('obsługuje kliknięcie dużego przycisku +1 na tarczy zegarka', () => {
    const onStepMock = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <AppleWatchCompanionModal
          visible={true}
          onClose={jest.fn()}
          snapshot={MOCK_SNAPSHOT}
          onStep={onStepMock}
        />
      );
    });

    const root = tree.root;
    // Znajdź główny przycisk dodawania rzędu (+1)
    const plusBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('+1 Rząd')
      );
    });

    act(() => {
      plusBtn.props.onPress();
    });

    expect(onStepMock).toHaveBeenCalledWith('increment');
  });

  it('obsługuje obrót cyfrowej koronki (Digital Crown)', () => {
    const onStepMock = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <AppleWatchCompanionModal
          visible={true}
          onClose={jest.fn()}
          snapshot={MOCK_SNAPSHOT}
          onStep={onStepMock}
        />
      );
    });

    const root = tree.root;
    const crownUpBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('▲ Koronka')
      );
    });

    act(() => {
      crownUpBtn.props.onPress();
    });

    expect(onStepMock).toHaveBeenCalledWith('increment');
  });

  it('obsługuje cofnięcie rzędu (-1) z zegarka', () => {
    const onStepMock = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <AppleWatchCompanionModal
          visible={true}
          onClose={jest.fn()}
          snapshot={MOCK_SNAPSHOT}
          onStep={onStepMock}
        />
      );
    });

    const root = tree.root;
    const undoBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node).includes('Cofnij')
      );
    });

    act(() => {
      undoBtn.props.onPress();
    });

    expect(onStepMock).toHaveBeenCalledWith('decrement');
  });
});
