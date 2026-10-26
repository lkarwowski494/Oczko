// Trasa „/probka”: kalkulator „Swatch” (F-38; BR-KAL-001, BR-KAL-003; design-spec „Kalkulator Swatch”). Jednostka szerokości i domyślna podstawa
// próbki z układu miar urządzenia (R-131, P-075 (4a); wiersza „Units” w Ustawieniach jeszcze nie ma — zgłoszenie partii 5).
import React from 'react';
import { Probka } from '../src/ekrany/Narzedzia';
import { useAplikacja } from '../src/kompozycja/Kontekst';
import { Bezpieczny } from '../src/kompozycja/Bezpieczny';
import { stanProbki } from '../src/kompozycja/probka';
import { imperialny } from '../src/kompozycja/miary';

export default function EkranProbki(): React.ReactElement {
  const { kontener } = useAplikacja();
  const cm = !imperialny();
  return (
    <Bezpieczny>
      <Probka t={kontener.j.t} jednostka={cm ? 'cm' : 'in'} poczatek={{ oczka: '', na: cm ? '10cm' : '4in' }} licz={(w) => stanProbki(w, kontener.j)} />
    </Bezpieczny>
  );
}
