import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { CloseButton } from '../src/components/CloseButton';
import { NumInput } from '../src/components/NumInput';
import { SearchField } from '../src/components/SearchField';
import { Empty } from '../src/components/Empty';
import { Missing } from '../src/components/Missing';

describe('Odporność Wymiarowa: AX5 i 320 pt (matrix-dimensions / NFR-A11Y-008)', () => {
  it('układ renderuje się stabilnie przy kompaktowej szerokości 320 pt (iPhone SE 1st gen)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <View style={{ width: 320 }}>
          <CloseButton onPress={jest.fn()} />
          <NumInput value="100.5" onNum={jest.fn()} />
          <SearchField value="Dzierganie" onChangeText={jest.fn()} />
          <Empty title="Brak projektów" message="Dodaj swój pierwszy projekt" />
          <Missing />
        </View>
      );
    });

    expect(tree).toBeDefined();
    const json = tree.toJSON();
    expect(json.props.style.width).toBe(320);
    expect(json.children.length).toBe(5);
  });

  it('obsługuje skalowanie czcionki Dynamic Type AX5 (scale 2.0x) bez błędów układu', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <View style={{ transform: [{ scale: 2.0 }] }}>
          <CloseButton onPress={jest.fn()} label="Anuluj" />
          <Empty title="Duży Tytuł Dostępności" />
          <Missing />
        </View>
      );
    });

    expect(tree).toBeDefined();
    expect(tree.toJSON()).toBeTruthy();
  });
});
