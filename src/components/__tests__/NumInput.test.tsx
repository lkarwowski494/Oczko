import React from 'react';
import renderer, { act } from 'react-test-renderer';
import NumInput, { parseRawNumInput } from '../NumInput';

describe('NumInput — Kontrolka liczbowa (NFR-INT-003, BR-TEST-005, RD-ENG-03)', () => {
  it('parseRawNumInput parsuje liczby z przecinkiem i kropką', () => {
    expect(parseRawNumInput('12.5')).toBe(12.5);
    expect(parseRawNumInput('12,5')).toBe(12.5);
    expect(parseRawNumInput('0')).toBe(0);
    expect(parseRawNumInput('-5,2')).toBe(-5.2);
    expect(parseRawNumInput('')).toBe('');
    expect(parseRawNumInput('  ')).toBe('');
    expect(parseRawNumInput('abc')).toBeNull();
  });

  it('obsługuje wpisywanie z przecinkiem i wywołuje onNum', () => {
    const onNum = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<NumInput value={10} onNum={onNum} />);
    });

    const input = tree.root.findByType('TextInput');
    expect(input.props.value).toBe('10');

    // Wpisanie "12,5"
    act(() => {
      input.props.onChangeText('12,5');
    });

    expect(onNum).toHaveBeenCalledWith(12.5, undefined);
  });

  it('przekazuje prop stored jako keep, gdy wpisana wartość odpowiada wartości początkowej', () => {
    const onNum = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<NumInput value="135" stored={61.23} onNum={onNum} />);
    });

    const input = tree.root.findByType('TextInput');

    // Użytkownik wpisuje "135" (ta sama wartość co na początku)
    act(() => {
      input.props.onChangeText('135');
    });

    expect(onNum).toHaveBeenCalledWith(135, 61.23);

    // Użytkownik zmienia na inną liczbę "140"
    act(() => {
      input.props.onChangeText('140');
    });

    expect(onNum).toHaveBeenCalledWith(140, undefined);
  });

  it('respektuje min i max wartości liczbowej', () => {
    const onNum = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<NumInput value={5} onNum={onNum} min={1} max={10} />);
    });

    const input = tree.root.findByType('TextInput');

    act(() => {
      input.props.onChangeText('0.5');
    });
    expect(onNum).toHaveBeenCalledWith(1, undefined);

    act(() => {
      input.props.onChangeText('15');
    });
    expect(onNum).toHaveBeenCalledWith(10, undefined);
  });

  it('spełnia wymiary Apple HIG (min. 44x44 pt pole dotyku)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<NumInput value={1} onNum={jest.fn()} />);
    });

    const input = tree.root.findByType('TextInput');
    const flatStyle = Array.isArray(input.props.style)
      ? Object.assign({}, ...input.props.style.filter(Boolean))
      : input.props.style;

    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
  });

  it('obsługuje onEndEditing przywracając poprawną wartość dla śmieci', () => {
    const onNum = jest.fn();
    let tree: any;
    act(() => {
      tree = renderer.create(<NumInput value={42} onNum={onNum} />);
    });

    const input = tree.root.findByType('TextInput');

    act(() => {
      input.props.onChangeText('nie-liczba');
    });

    act(() => {
      input.props.onEndEditing({ nativeEvent: {} });
    });

    expect(input.props.value).toBe('42');
  });
});
