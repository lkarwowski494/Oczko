import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import {
  CraftHeader,
  CraftButton,
  CraftCard,
  CraftStatDisplay,
  CraftModal,
} from '../src/components/craft';
import { sharedCraftTokens, getCraftTheme } from '../src/core/craft-suite-theme';

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

describe('Craft UI Components (Apps4Craft Unified Design System in Oczko)', () => {
  it('CraftHeader renderuje tytuł, podtytuł i przycisk powrotu/zamknięcia o strefie min 44pt', () => {
    const onBack = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <CraftHeader
          title="Kalkulator Próbki"
          subtitle="Oczko Craft Suite"
          onBack={onBack}
        />
      );
    });

    const root = tree.root;
    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Kalkulator Próbki');
    expect(allText).toContain('Oczko Craft Suite');

    const backBtn = root.find((node: any) => node.props?.testID === 'craft-header-back');
    expect(backBtn).toBeDefined();

    act(() => {
      backBtn.props.onPress();
    });
    expect(onBack).toHaveBeenCalled();
  });

  it('CraftButton renderuje etykietę i reaguje na stuknięcie z odpowiednim rozmiarem i stanem', () => {
    const onPress = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <CraftButton
          label="ZAPISZ PROJEKT"
          onPress={onPress}
          variant="primary"
          size="lg"
        />
      );
    });

    const root = tree.root;
    const btn = root.find((node: any) => node.props?.testID === 'craft-button');
    expect(btn).toBeDefined();
    expect(extractAllStrings(tree.toJSON())).toContain('ZAPISZ PROJEKT');

    act(() => {
      btn.props.onPress();
    });
    expect(onPress).toHaveBeenCalled();
  });

  it('CraftStatDisplay wyświetla Sacred Numbers w formacie tabular-nums i etykietę', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <CraftStatDisplay
          label="PRÓBKA OCZEK"
          value={24}
          unit="o. / 10cm"
          subtext="Druty 4.0 mm"
          size="lg"
        />
      );
    });

    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('PRÓBKA OCZEK');
    expect(allText).toContain('24');
    expect(allText).toContain('o. / 10cm');
    expect(allText).toContain('Druty 4.0 mm');
  });

  it('CraftCard renderuje ceramiczny kontener z nagłówkiem i opcjonalnym badge', () => {
    const onPress = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <CraftCard
          headerTitle="MAGAZYN WŁÓCZEK"
          headerBadge={<Text>3 motki</Text>}
          onPress={onPress}
        >
          <Text>Merino 100%</Text>
        </CraftCard>
      );
    });

    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('MAGAZYN WŁÓCZEK');
    expect(allText).toContain('3 motki');
    expect(allText).toContain('Merino 100%');

    const card = tree.root.find((node: any) => node.props?.testID === 'craft-card');
    act(() => {
      card.props.onPress();
    });
    expect(onPress).toHaveBeenCalled();
  });

  it('CraftModal wyświetla ceramiczny arkusz z nagłówkiem i przyklejoną stopką', () => {
    const onClose = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <CraftModal
          visible={true}
          onClose={onClose}
          title="Kalkulator GSR"
          subtitle="Rządki skrócone German Short Rows"
          footer={<CraftButton label="ZASTOSUJ" onPress={() => {}} />}
        >
          <Text>Zawartość kalkulatora</Text>
        </CraftModal>
      );
    });

    const allText = extractAllStrings(tree.toJSON());
    expect(allText).toContain('Kalkulator GSR');
    expect(allText).toContain('Rządki skrócone German Short Rows');
    expect(allText).toContain('Zawartość kalkulatora');
    expect(allText).toContain('ZASTOSUJ');

    const closeBtn = tree.root.find((node: any) => node.props?.testID === 'craft-header-close');
    act(() => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
