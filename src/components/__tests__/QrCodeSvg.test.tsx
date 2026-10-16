import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QrCodeSvg, generateQrMatrix } from '../QrCodeSvg';

describe('QrCodeSvg (Wektorowy kod QR SVG — Zadanie O5, DEC-20)', () => {
  it('generateQrMatrix generuje prawidłową dwuwymiarową macierz logiczną modułów QR', () => {
    const { size, modules } = generateQrMatrix('oczko://project?test=1');
    expect(size).toBeGreaterThanOrEqual(21);
    expect(modules.length).toBe(size);
    expect(modules[0].length).toBe(size);
    expect(typeof modules[0][0]).toBe('boolean');
  });

  it('renderuje komponent wektorowy SVG z zadanymi wymiarami i kolorami', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <QrCodeSvg
          value="oczko://project?v=1&d=eyJ2IjoxfQ=="
          size={180}
          color="#1E293B"
          backgroundColor="#F8FAFC"
          testID="qr-code-svg"
        />
      );
    });

    expect(tree).toBeDefined();
    const json = tree.toJSON();
    expect(json.props.testID).toBe('qr-code-svg');
    expect(json.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 180, height: 180 })])
    );
  });

  it('obsługuje pustą wartość bez rzucania wyjątków (fallback)', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<QrCodeSvg value="" />);
    });
    expect(tree).toBeDefined();
  });
});
