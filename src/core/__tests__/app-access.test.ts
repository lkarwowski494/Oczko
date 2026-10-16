import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createInMemoryDatabase } from '../database';
import {
  initOrGetEntitlements,
  evaluateAccess,
  activatePlan,
  restorePurchases,
  resetTrialForTesting,
  PRICING_TIERS,
  TRIAL_CONFIG,
} from '../app-access-service';
import { AppAccessProvider, useAppAccess } from '../app-access-context';

describe('Oczko — Monetyzacja Impulsowa i Kontrola Dostępu (app-access-service)', () => {
  test('cennik impulsowy zawiera poprawne poziomy cenowe $0.99 / $4.99 / $14.99', () => {
    expect(PRICING_TIERS.monthly.priceUsd).toBe(0.99);
    expect(PRICING_TIERS.monthly.pricePln).toBe(4.49);

    expect(PRICING_TIERS.annual.priceUsd).toBe(4.99);
    expect(PRICING_TIERS.annual.pricePln).toBe(22.99);
    expect(PRICING_TIERS.annual.isPopular).toBe(true);

    expect(PRICING_TIERS.lifetime.priceUsd).toBe(14.99);
    expect(PRICING_TIERS.lifetime.pricePln).toBe(69.99);
  });

  test('nowy użytkownik otrzymuje 100% dostępu w trialu (7 dni i limit 3 projektów)', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    const entitlement = await initOrGetEntitlements(db, baseDate.getTime());

    expect(entitlement.plan_type).toBe('trial');
    expect(entitlement.status).toBe('active');
    expect(entitlement.purchased_at).toBeNull();

    // 0 projektów
    const eval0 = evaluateAccess(entitlement, 0, baseDate.getTime());
    expect(eval0.hasFullAccess).toBe(true);
    expect(eval0.canCreateNewProject).toBe(true);
    expect(eval0.isHistoryReadOnly).toBe(false);
    expect(eval0.isTrial).toBe(true);
    expect(eval0.trialDaysRemaining).toBe(7);
    expect(eval0.trialProjectsRemaining).toBe(3);

    // 2 projekty (został 1)
    const eval2 = evaluateAccess(entitlement, 2, baseDate.getTime());
    expect(eval2.canCreateNewProject).toBe(true);
    expect(eval2.trialProjectsRemaining).toBe(1);
  });

  test('upływ czasu zmniejsza liczbę dni trialu', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    const entitlement = await initOrGetEntitlements(db, baseDate.getTime());

    // Po 3 dniach
    const day3Ms = baseDate.getTime() + 3 * 24 * 60 * 60 * 1000;
    const evalDay3 = evaluateAccess(entitlement, 1, day3Ms);
    expect(evalDay3.canCreateNewProject).toBe(true);
    expect(evalDay3.trialDaysRemaining).toBe(4);
  });

  test('osiągnięcie limitu 3 projektów w trialu blokuje tworzenie, ale historia pozostaje czytelna (Read-Only)', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    const entitlement = await initOrGetEntitlements(db, baseDate.getTime());

    // 3 projekty osiągnięte w 2. dniu trialu
    const day2Ms = baseDate.getTime() + 2 * 24 * 60 * 60 * 1000;
    const eval3 = evaluateAccess(entitlement, 3, day2Ms);

    expect(eval3.canCreateNewProject).toBe(false);
    expect(eval3.isHistoryReadOnly).toBe(true);
    expect(eval3.hasFullAccess).toBe(false);
    expect(eval3.status).toBe('expired');
    expect(eval3.reason).toContain('limit 3 projektów');
  });

  test('upływ 7 dni kończy trial i przełącza aplikację w tryb Read-Only dla historii', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    const entitlement = await initOrGetEntitlements(db, baseDate.getTime());

    // Dzień 8 (upłynęło 7 dni)
    const day8Ms = baseDate.getTime() + 8 * 24 * 60 * 60 * 1000;
    const evalExpired = evaluateAccess(entitlement, 1, day8Ms);

    expect(evalExpired.canCreateNewProject).toBe(false);
    expect(evalExpired.isHistoryReadOnly).toBe(true);
    expect(evalExpired.trialDaysRemaining).toBe(0);
    expect(evalExpired.status).toBe('expired');
    expect(evalExpired.reason).toContain('Upłynął 7-dniowy okres próbny');
  });

  test('aktywacja planu rocznego ($4.99) odblokowuje pełny dostęp bez limitów na 1 rok', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    await initOrGetEntitlements(db, baseDate.getTime());

    const updated = await activatePlan(db, 'annual', baseDate.getTime());
    expect(updated.plan_type).toBe('annual');
    expect(updated.status).toBe('active');
    expect(updated.expires_at).toBeDefined();

    const evalAnnual = evaluateAccess(updated, 50, baseDate.getTime() + 100 * 24 * 60 * 60 * 1000);
    expect(evalAnnual.hasFullAccess).toBe(true);
    expect(evalAnnual.canCreateNewProject).toBe(true);
    expect(evalAnnual.isHistoryReadOnly).toBe(false);
    expect(evalAnnual.isPremium).toBe(true);

    // Po roku subskrypcja wygasa i wraca do Read-Only
    const afterYearMs = baseDate.getTime() + 370 * 24 * 60 * 60 * 1000;
    const evalExpired = evaluateAccess(updated, 50, afterYearMs);
    expect(evalExpired.canCreateNewProject).toBe(false);
    expect(evalExpired.isHistoryReadOnly).toBe(true);
    expect(evalExpired.status).toBe('expired');
  });

  test('zakup dożywotni ($14.99 Lifetime) gwarantuje niegasnący dostęp na zawsze', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    await initOrGetEntitlements(db, baseDate.getTime());

    const updated = await activatePlan(db, 'lifetime', baseDate.getTime());
    expect(updated.plan_type).toBe('lifetime');
    expect(updated.expires_at).toBeNull();

    // 10 lat później
    const tenYearsLaterMs = baseDate.getTime() + 3650 * 24 * 60 * 60 * 1000;
    const evalLifetime = evaluateAccess(updated, 150, tenYearsLaterMs);
    expect(evalLifetime.hasFullAccess).toBe(true);
    expect(evalLifetime.canCreateNewProject).toBe(true);
    expect(evalLifetime.isHistoryReadOnly).toBe(false);
  });

  test('aktywacja planu miesięcznego ($0.99) i przywrócenie zakupów', async () => {
    const db = createInMemoryDatabase();
    const baseDate = new Date('2026-10-16T12:00:00.000Z');
    await initOrGetEntitlements(db, baseDate.getTime());

    await activatePlan(db, 'monthly', baseDate.getTime());
    const restored = await restorePurchases(db);

    expect(restored.plan_type).toBe('monthly');
    expect(restored.status).toBe('active');

    // Przywracanie w czystym trialu
    const freshDb = createInMemoryDatabase();
    await initOrGetEntitlements(freshDb);
    const freshRestored = await restorePurchases(freshDb);
    expect(freshRestored.plan_type).toBe('trial');
  });

  test('resetTrialForTesting symuluje dowolną datę startu trialu', async () => {
    const db = createInMemoryDatabase();
    const oldDate = new Date('2026-09-01T10:00:00.000Z');
    await initOrGetEntitlements(db);

    const reset = await resetTrialForTesting(db, oldDate);
    expect(reset.plan_type).toBe('trial');
    expect(reset.trial_started_at).toBe(oldDate.toISOString());

    const evalPast = evaluateAccess(reset, 0, new Date('2026-10-16T12:00:00.000Z').getTime());
    expect(evalPast.status).toBe('expired');
    expect(evalPast.isHistoryReadOnly).toBe(true);
  });

  test('AppAccessProvider obsługuje błąd inicjalizacji bazy i bezpiecznie przechodzi do DEFAULT_EVALUATION', async () => {
    const errorDb: any = {
      runAsync: jest.fn().mockRejectedValue(new Error('DB Error')),
      getFirstAsync: jest.fn().mockRejectedValue(new Error('DB Error')),
      getAllAsync: jest.fn().mockRejectedValue(new Error('DB Error')),
    };

    function TestConsumer() {
      const { evaluation } = useAppAccess();
      return React.createElement(React.Fragment, null, evaluation.status);
    }

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        React.createElement(AppAccessProvider, {
          db: errorDb,
          currentProjectsCount: 0,
          children: React.createElement(TestConsumer, null),
        })
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(tree.toJSON()).toBe('active');
  });
});
