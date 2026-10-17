import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { t, setLang, lang, useLang } from '../i18n';

function LangTestComponent() {
  const l = useLang();
  return React.createElement(React.Fragment, null, l);
}

describe('Apps4Brew i18n Standard (src/core/i18n.ts)', () => {
  beforeEach(() => {
    setLang('pl');
  });

  it('zwraca polski tekst jako domyślny język', () => {
    expect(lang()).toBe('pl');
    expect(t('Licznik')).toBe('Licznik');
    expect(t('Mój Sweter')).toBe('Mój Sweter');
  });

  it('przełącza język na angielski i zwraca tłumaczenie ze słownika EN', () => {
    setLang('en');
    expect(lang()).toBe('en');
    expect(t('Licznik')).toBe('Counter');
    expect(t('Magazyn')).toBe('Stash');
    expect(t('Stuknij, aby dodać rząd')).toBe('Tap to count row');
  });

  it('jeśli brak tłumaczenia w EN, zwraca oryginalny polski klucz jako fallback', () => {
    setLang('en');
    expect(t('Nieznany tekst bez tłumaczenia')).toBe('Nieznany tekst bez tłumaczenia');
  });

  it('obsługuje interpolację parametrów {klucz}', () => {
    expect(t('Witaj {name}!', { name: 'Kasia' })).toBe('Witaj Kasia!');
    expect(t('Plan: {plan}', { plan: 'Roczny' })).toBe('Plan: Roczny');
    setLang('en');
    expect(t('Plan: {plan}', { plan: 'Annual' })).toBe('Plan: Annual');
  });

  it('useLang reaguje na zmiany języka i odmontowuje listener', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(React.createElement(LangTestComponent));
    });
    expect(tree.toJSON()).toBe('pl');

    act(() => {
      setLang('en');
    });
    expect(tree.toJSON()).toBe('en');

    act(() => {
      tree.unmount();
    });

    act(() => {
      setLang('pl');
    });
    expect(lang()).toBe('pl');
  });
});
