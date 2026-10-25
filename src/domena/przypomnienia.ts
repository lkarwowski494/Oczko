// Przypomnienie „co N rzędów, M razy, od rzędu s” (RD-13, F-06): rząd r wyzwala, gdy r ≥ s, (r − s) mod N = 0 i (r − s) / N < M.
import type { Wynik } from './bledy';

export type PlanPrzypomnienia = { od: number; co: number; razy: number };

const zlyPlan = (p: PlanPrzypomnienia): boolean => !Number.isInteger(p.od) || !Number.isInteger(p.co) || !Number.isInteger(p.razy) || p.co < 1; // RD-13-W5: N < 1
const wyzwala = (r: number, p: PlanPrzypomnienia): boolean => r >= p.od && (r - p.od) % p.co === 0 && (r - p.od) / p.co < p.razy;

export function czyPrzypomnienie(rzad: number, plan: PlanPrzypomnienia): Wynik<boolean> {
  if (zlyPlan(plan) || !Number.isInteger(rzad)) return { ok: false, powod: 'bledne_dane' };
  return { ok: true, wartosc: wyzwala(rzad, plan) };
}
/** RD-13, zmiana wartości z a na b (P-097 (3.2a)): rząd jednego przypomnienia (największy wyzwalający w (a, b]) albo null przy spadku. Sygnatura 08 (P-114 Q2a). */
export function przypomnienieWpisania(a: number, b: number, plan: PlanPrzypomnienia): Wynik<number | null> {
  if (zlyPlan(plan) || !Number.isInteger(a) || !Number.isInteger(b)) return { ok: false, powod: 'bledne_dane' };
  if (b <= a) return { ok: true, wartosc: null }; // spadek albo bez zmiany: bez przypomnienia
  const ostatni = plan.od + (plan.razy - 1) * plan.co; // RD-13 „Granica”
  const gorny = Math.min(b, ostatni);
  if (plan.razy < 1 || gorny < plan.od) return { ok: true, wartosc: null };
  const rzad = gorny - ((gorny - plan.od) % plan.co); // największy rząd planu ≤ gorny
  return { ok: true, wartosc: rzad > a ? rzad : null };
}
/** F-06 (U-3): lista rzędów z przypomnieniem przed zapisem (rachunek z 0.1.0, bez ucięcia do celu: RD-13 go nie ma). Sygnatura 08 (P-114 Q5). */
export function planPrzypomnien(plan: PlanPrzypomnienia): Wynik<number[]> {
  if (zlyPlan(plan)) return { ok: false, powod: 'bledne_dane' };
  return { ok: true, wartosc: Array.from({ length: Math.max(0, plan.razy) }, (_, k) => plan.od + k * plan.co) };
}
