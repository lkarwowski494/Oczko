import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { setLang, t } from '../src/core/i18n';
import { Empty } from '../src/components/Empty';
import { Missing } from '../src/components/Missing';
import { CloseButton } from '../src/components/CloseButton';
import { SearchField } from '../src/components/SearchField';
import { NumInput } from '../src/components/NumInput';

describe('Macierz trasy x języki (matrix-dim-langs-routes / NFR-I18N-005)', () => {
  afterEach(() => {
    setLang('pl');
  });

  const LANGS = ['pl', 'en'] as const;

  test.each(LANGS)('renderuje podstawowe komponenty widoków w języku %s bez wyjątków', (lang) => {
    setLang(lang);

    let tree: any;
    act(() => {
      tree = renderer.create(
        <>
          <CloseButton onPress={jest.fn()} />
          <Empty title={t('Brak projektów')} message={t('Utwórz swój pierwszy projekt')} />
          <Missing />
          <SearchField value="" onChangeText={jest.fn()} />
          <NumInput value="12.5" onNum={jest.fn()} />
        </>
      );
    });

    expect(tree).toBeDefined();
    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
