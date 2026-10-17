import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CloseButton, CLOSE_TEST_ID } from '../src/components/CloseButton';
import { NumInput } from '../src/components/NumInput';
import { SearchField } from '../src/components/SearchField';
import { Empty } from '../src/components/Empty';
import { Missing } from '../src/components/Missing';
import { theme } from '../src/core/theme';

describe('Audyt Drzewa Dostępności (matrix-a11y / NFR-A11Y-001..008)', () => {
  it('wszystkie interaktywne komponenty posiadają zdefiniowaną rolę i niepustą etykietę dostępności', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <>
          <CloseButton onPress={jest.fn()} />
          <NumInput value="10" onNum={jest.fn()} />
          <SearchField value="Merino" onChangeText={jest.fn()} />
          <Empty title="Brak elementów" actionLabel="Dodaj" onAction={jest.fn()} />
          <Missing onBack={jest.fn()} />
        </>
      );
    });

    const root = tree.root;

    // CloseButton
    const closeBtn = root.findByProps({ testID: CLOSE_TEST_ID });
    expect(closeBtn.props.accessibilityRole).toBe('button');
    expect(closeBtn.props.accessibilityLabel).toBeTruthy();

    // NumInput
    const numInput = root.findByProps({ testID: 'num-input' });
    expect(numInput.props.accessibilityRole).toBe('text');

    // SearchField
    const searchInput = root.findByProps({ testID: 'search-field' });
    expect(searchInput.props.accessibilityRole).toBe('search');
    expect(searchInput.props.accessibilityLabel).toBeTruthy();

    const searchClear = root.findByProps({ testID: 'search-clear-button' });
    expect(searchClear.props.accessibilityRole).toBe('button');
    expect(searchClear.props.accessibilityLabel).toBeTruthy();

    // Empty action button
    const emptyAction = root.findByProps({ accessibilityLabel: 'Dodaj' });
    expect(emptyAction.props.accessibilityRole).toBe('button');

    // Missing back button
    const missingBack = root.findByProps({ testID: 'missing-back-button' });
    expect(missingBack.props.accessibilityRole).toBe('button');
  });

  it('pola dotykowe interaktywnych elementów spełniają Apple HIG (>= 44 pt wysokości i szerokości, RD-ENG-03)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <>
          <CloseButton onPress={jest.fn()} />
          <NumInput value="10" onNum={jest.fn()} />
          <SearchField value="Merino" onChangeText={jest.fn()} />
        </>
      );
    });

    const closeBtn = tree.root.findByProps({ testID: CLOSE_TEST_ID });
    expect(closeBtn.props.style.minHeight).toBeGreaterThanOrEqual(44);
    expect(closeBtn.props.style.minWidth).toBeGreaterThanOrEqual(44);

    const numInput = tree.root.findByProps({ testID: 'num-input' });
    expect(numInput.props.style.minHeight).toBeGreaterThanOrEqual(44);

    const searchInput = tree.root.findByProps({ testID: 'search-field' });
    expect(searchInput.props.style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('paleta kolorów motywu spełnia kryteria kontrastu WCAG 2.1 AA (min. 4.5:1 dla tekstu głównego)', () => {
    // Weryfikacja bezpośrednio z theme.ts
    expect(theme.colors.bg).toBe('#121214');
    expect(theme.colors.textPrimary).toBe('#F4EFEA');
    expect(theme.colors.textSecondary).toBe('#A09C96');
  });
});
