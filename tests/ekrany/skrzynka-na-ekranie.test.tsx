// R2 (design-spec :775): arkusz skrzynki „dopiero na liście projektów albo ekranie projektu” — wspólny komponent kompozycji dla obu tras
// (app/projekty.tsx, app/projekt/[id].tsx): stan skrzynki, lista projektów w toku, podgląd rodzaju, wybór projektu, „Not now”, alert błędu pozycji.
import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SkrzynkaNaEkranie, type ZrodloSkrzynki } from '../../src/kompozycja/SkrzynkaNaEkranie';
import type { StanSkrzynki } from '../../src/kompozycja/wzor';
import type { ZlecenieImportu } from '../../src/domena/porty';
import type { Tlumacz } from '../../src/ekrany/wspolne';
import { tEn } from './pomoc';

let t: Tlumacz;
beforeAll(async () => { t = await tEn(); });
const ZL: ZlecenieImportu = { id: 'z1', rodzaj: 'plik', nazwa: 'Harbor.pdf', sciezki: ['Harbor.pdf'], adres: null, typ: 'com.adobe.pdf', projektId: null, utworzonoMs: 0 };
function zrodlo(s: StanSkrzynki): ZrodloSkrzynki & { ustaw(s: StanSkrzynki): void } {
  let stan = s; const sl = new Set<() => void>();
  return {
    stan: () => stan, naZmiane: (f) => { sl.add(f); return () => { sl.delete(f); }; },
    ustaw: (n) => { stan = n; sl.forEach((f) => f()); },
    wybierzProjekt: jest.fn(async () => { stan = { ...stan, doWyboru: [] }; sl.forEach((f) => f()); return { ok: true as const, wartosc: 1 }; }),
    nieTeraz: jest.fn(), potwierdzBlad: jest.fn(async () => undefined),
  };
}

test('pozycja bez projektu: arkusz z podglądem i projektami w toku; wybór → wybierzProjekt i naPoWyborze; pusta skrzynka → nic', async () => {
  const wz = zrodlo({ doWyboru: [ZL], czekaSiec: [], bledy: [] });
  const naPoWyborze = jest.fn();
  render(<SkrzynkaNaEkranie wz={wz} t={t} projekty={async () => [{ id: 'p1', nazwa: 'Harbor Sweater' }]} naPoWyborze={naPoWyborze} />);
  await waitFor(() => expect(screen.getByTestId('skrzynka-projekt')).toBeTruthy());
  expect(screen.getByText('PDF')).toBeTruthy();
  fireEvent.press(screen.getByTestId('skrzynka-projekt'));
  await waitFor(() => expect(naPoWyborze).toHaveBeenCalled());
  expect(wz.wybierzProjekt).toHaveBeenCalledWith('p1');
  expect(screen.queryByTestId('skrzynka')).toBeNull();
});

test('błąd pozycji: alert „skrzynka.nie_dodano” z przyczyną; OK → potwierdzBlad', async () => {
  const wz = zrodlo({ doWyboru: [], czekaSiec: [], bledy: [] });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  render(<SkrzynkaNaEkranie wz={wz} t={t} projekty={async () => []} naPoWyborze={jest.fn()} />);
  act(() => wz.ustaw({ doWyboru: [], czekaSiec: [], bledy: [{ zlecenie: ZL, powod: 'uszkodzony' }] }));
  await waitFor(() => expect(alert).toHaveBeenCalled());
  const [tytul, , przyciski] = alert.mock.calls[0];
  expect(tytul).toBe(t('skrzynka.nie_dodano', { plik: 'Harbor.pdf' }));
  (przyciski as { onPress(): void }[])[0].onPress();
  expect(wz.potwierdzBlad).toHaveBeenCalledWith('z1');
  alert.mockRestore();
});

test('ekran nieaktywny (pod innym w stosie): ani arkusza, ani alertu — jeden arkusz i jeden alert naraz', async () => {
  const wz = zrodlo({ doWyboru: [ZL], czekaSiec: [], bledy: [{ zlecenie: ZL, powod: 'uszkodzony' }] });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  render(<SkrzynkaNaEkranie wz={wz} t={t} aktywny={false} projekty={async () => [{ id: 'p1', nazwa: 'Harbor Sweater' }]} naPoWyborze={jest.fn()} />);
  await new Promise((r) => setTimeout(r, 20));
  expect(screen.queryByTestId('skrzynka')).toBeNull();
  expect(alert).not.toHaveBeenCalled();
  alert.mockRestore();
});
