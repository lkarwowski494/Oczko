import React from 'react';
import renderer, { act } from 'react-test-renderer';
import YarnUsageEstimatorModal from '../YarnUsageEstimatorModal';
import { StashYarnRecord } from '../../core/stash-repository';

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

const MOCK_YARNS: StashYarnRecord[] = [
  {
    id: 'yarn_1',
    brand: 'Drops',
    name: 'Nord',
    colorway: '03 Jasnoszary',
    weightCategory: 'Fingering',
    skeinsTotal: 5,
    skeinsRemaining: 4,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 170,
    composition: 'Alpaka / Wełna',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('YarnUsageEstimatorModal (BR-MAG-004)', () => {
  it('renderuje modal z domyślnym trybem postępu i obliczeniami', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <YarnUsageEstimatorModal
          visible={true}
          onClose={jest.fn()}
          availableYarns={MOCK_YARNS}
          initialCompletedRows={50}
          initialTargetRows={200}
        />
      );
    });

    expect(tree).toBeDefined();
    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Kalkulator Zużycia Włóczki');
    expect(text).toContain('W trakcie robótki');
    expect(text).toContain('Z próbki ściegu');
    expect(text).toContain('ESTYMACJA ZAPOTRZEBOWANIA');
    expect(text).toContain('Łączna waga');
    expect(text).toContain('Pozostało');
    expect(text).toContain('Wymagane motki');
  });

  it('przełącza na tryb próbki ściegu (swatch) i wyświetla formularz wymiarów', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <YarnUsageEstimatorModal
          visible={true}
          onClose={jest.fn()}
          availableYarns={MOCK_YARNS}
        />
      );
    });

    const root = tree.root;
    const swatchTab = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('Z próbki ściegu')
      );
    });

    act(() => {
      swatchTab.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('Wymiary próbki');
    expect(text).toContain('Waga próbki');
    expect(text).toContain('Docelowe wymiary wyrobu');
  });

  it('umożliwia zmianę marginesu bezpieczeństwa', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <YarnUsageEstimatorModal
          visible={true}
          onClose={jest.fn()}
          availableYarns={MOCK_YARNS}
        />
      );
    });

    const root = tree.root;
    const marginButton = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).trim() === '+15%'
      );
    });

    act(() => {
      marginButton.props.onPress();
    });

    const text = extractAllStrings(tree.toJSON());
    expect(text).toContain('15%');
  });

  it('wywołuje onClose po naciśnięciu przycisku zamknięcia', () => {
    const handleClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <YarnUsageEstimatorModal
          visible={true}
          onClose={handleClose}
          availableYarns={MOCK_YARNS}
        />
      );
    });

    const root = tree.root;
    const closeBtn = root.find((node: any) => {
      return (
        node.props?.onPress &&
        extractAllStrings(node.props?.children).includes('✕')
      );
    });

    act(() => {
      closeBtn.props.onPress();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
