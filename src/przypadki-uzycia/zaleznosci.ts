// Zależności przypadków użycia jako obiekt portów (sygnatura: propozycja 07, zatwierdzona w fix 05 2026-10-25 (Z07-22)). Tylko typy.
import type { CzasWTle, DziennikPlus, Identyfikatory, MagazynPlikow, PortBazy, Synchronizacja, Zegar } from '../domena/porty';
import type { Katalogi, Migruj, PortArchiwum } from '../domena/porty';

export type Zaleznosci = {
  baza: PortBazy;
  zegar: Zegar;
  id: Identyfikatory;
  urzadzenie: string;             // zdarzenie.urzadzenie
  pro: () => boolean;             // bieżące uprawnienie (ADR-0010); wejście `pro` funkcji startDnia
  synchronizacja?: Synchronizacja;
};
export type ZaleznosciPlikow = Zaleznosci & { magazyn: MagazynPlikow; katalogi: Katalogi };
export type ZaleznosciDziennika = Zaleznosci & { dziennik: DziennikPlus };
export type ZaleznosciStartu = ZaleznosciPlikow & { dziennik: DziennikPlus; migruj: Migruj };
export type ZaleznosciArchiwum = ZaleznosciPlikow & { dziennik: DziennikPlus; archiwum: PortArchiwum; czasWTle: CzasWTle };
