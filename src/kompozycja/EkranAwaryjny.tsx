// Ekran trybu awaryjnego w kompozycji (ADR-0019): „Zapisz kopię danych” (archiwum bez migracji, liczności, arkusz udostępniania poza E2E),
// „Spróbuj normalnie”, „Zgłoś problem” (diagnostyka ADR-0018 — następny krok). Panel `e2e-sha-bazy` (bez t()) tylko w buildzie E2E.
import React, { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { TrybAwaryjny, type PowodTrybuAwaryjnego } from '../ekrany/TrybAwaryjny';
import type { Tlumacz } from '../ekrany/wspolne';
import { E2E } from '../platforma/tryb-e2e';
import { udostepnijPlik } from '../platforma/system-plikow-uzytkownika';
import { licznosciTekst } from './dane';
import { sprobujNormalnieTeraz, trybAwaryjny } from './start-aplikacji';

export function EkranAwaryjny({ powod, t, naNormalnie }: { powod: PowodTrybuAwaryjnego; t: Tlumacz; naNormalnie(): void }): React.ReactElement {
  const a = useMemo(() => trybAwaryjny(), []);
  const [licznosci, ustawLicznosci] = useState<string | null>(null);
  const [sha, ustawSha] = useState('');
  useEffect(() => { if (E2E) void a.kopia.then(() => a.sha()).then(ustawSha); }, [a]);
  return (
    <TrybAwaryjny
      stan={{ powod, licznosciKopii: licznosci }}
      t={t}
      naZapiszKopie={() => void a.zapiszKopie().then((k) => {
        if (!k) return;
        ustawLicznosci(licznosciTekst(k.licznosci, t));
        if (E2E) void a.sha().then(ustawSha); else void udostepnijPlik(k.sciezka);
      })}
      naSprobujNormalnie={() => void sprobujNormalnieTeraz().then(naNormalnie)}
      naZglosProblem={() => undefined}
      panelE2e={E2E ? <Text testID="e2e-sha-bazy" selectable>{sha}</Text> : null}
    />
  );
}
