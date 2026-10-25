// Tryb awaryjny (ADR-0019, R-079), import „Zastąp” z kopią (R-068), konflikt z urządzeniem i godziną (R-050). Ekrany nienarysowane (Z07-05).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TrybAwaryjny } from '../../../src/ekrany/TrybAwaryjny';
import { Import, Konflikt } from '../../../src/ekrany/Dane';
import type { Tlumacz } from '../../../src/ekrany/wspolne';
import { tEn, tekst } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const awaryjny = () => ({ naZapiszKopie: jest.fn(), naSprobujNormalnie: jest.fn(), naZglosProblem: jest.fn() });

describe('Tryb awaryjny i dane', () => {
  test('R-079 / NFR-DAN-001: baza nowsza i uszkodzona — ten sam ekran, inny nagłówek (ADR-0019)', () => {
    const r = render(<TrybAwaryjny stan={{ powod: 'wersja_nowsza' }} t={t} {...awaryjny()} />);
    const nowsza = tekst(screen.getByRole('header'));
    r.rerender(<TrybAwaryjny stan={{ powod: 'uszkodzony' }} t={t} {...awaryjny()} />);
    const uszkodzona = tekst(screen.getByRole('header'));
    expect(nowsza.length).toBeGreaterThan(0);
    expect(uszkodzona.length).toBeGreaterThan(0);
    expect(nowsza).not.toEqual(uszkodzona);
  });

  test('R-079: trzy działania ADR-0019 — kopia, spróbuj normalnie, zgłoś (Z07-05: nazwy robocze z „Zapisz kopię danych” itd.)', () => {
    const w = awaryjny();
    render(<TrybAwaryjny stan={{ powod: 'petla-startow' }} t={t} {...w} />);
    fireEvent.press(screen.getByRole('button', { name: /copy/i }));
    fireEvent.press(screen.getByRole('button', { name: /normal/i }));
    fireEvent.press(screen.getByRole('button', { name: /report/i }));
    expect([w.naZapiszKopie, w.naSprobujNormalnie, w.naZglosProblem].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);
  });

  test('R-068: po „Zastąp” ekran mówi, gdzie leży kopia sprzed importu (P-047, dane.md:69)', () => {
    render(<Import stan={{ rodzaj: 'zastapiono', kopia: { nazwa: 'Oczko before import 2026-11-08.oczko', miejsce: 'Files › On My iPhone › Oczko' } }} t={t} naZastap={jest.fn()} naScal={jest.fn()} naAnuluj={jest.fn()} />);
    expect(screen.getByText(/Oczko before import 2026-11-08\.oczko/)).toBeTruthy();
    expect(screen.getByText(/Files › On My iPhone › Oczko/)).toBeTruthy();
  });

  test('R-050 / NFR-DAN-003: konflikt pokazuje urządzenie i godzinę każdej wersji; wybór tylko po stuknięciu', () => {
    const naWybierz = jest.fn();
    render(<Konflikt stan={{ licznik: 'Left sleeve', kandydaci: [
      { id: 'a', wartosc: 23, urzadzenie: 'iPhone', godzina: '20:14' },
      { id: 'b', wartosc: 25, urzadzenie: 'iPad', godzina: '20:31' },
    ] }} t={t} naWybierz={naWybierz} />);
    for (const s of [/iPhone/, /20:14/, /iPad/, /20:31/]) expect(screen.getAllByText(s).length).toBeGreaterThan(0);
    expect(naWybierz).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: /25.*iPad|iPad.*25/ }));
    expect(naWybierz).toHaveBeenCalledWith('b');
  });
});
