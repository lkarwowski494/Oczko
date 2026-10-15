import { ProjectManagerFacade } from '../project-facade';

describe('Oczko Core — Fasada projektu (Test integracyjny rdzenia)', () => {
  test('Integruje liczniki, zdarzenia, matematykę próbek i parser w jeden spójny system', () => {
    const manager = new ProjectManagerFacade('proj_sweter', 'Sweter Jesienny');

    manager.registerCounter({
      id: 'cnt_rows',
      partId: 'part_body',
      name: 'Główny licznik rzędów',
      targetValue: 120,
    });

    // Wykonujemy kroki licznika
    manager.stepCounter('cnt_rows', 'increment', 'iphone', 1000);
    manager.stepCounter('cnt_rows', 'increment', 'apple_watch', 1100);

    let state = manager.getCounterState('cnt_rows');
    expect(state.rawValue).toBe(2);

    // Testujemy cofanie
    manager.undoLast('cnt_rows', 'iphone', 1200);
    state = manager.getCounterState('cnt_rows');
    expect(state.rawValue).toBe(1);

    // Testujemy moduł matematyczny i parser wbudowany w fasadę
    const design = manager.evaluateDesign(22, 10, 50, 92, 96);
    expect(design.gaugeRes.exact).toBe(110);
    expect(design.easeRes.easeCm).toBe(4);

    const parsed = manager.parseInstructionLine('k2tog, yo, k');
    expect(parsed.isRecognized).toBe(true);
    expect(parsed.tokens).toHaveLength(3);
  });
});
