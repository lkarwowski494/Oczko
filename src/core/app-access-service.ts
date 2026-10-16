/**
 * Oczko — Serwis Monetyzacji Impulsowej i Kontroli Dostępu (Apps4Brew Studio Pass)
 * Standard Biznesowy: "Cheaper than Espresso" ($0.99/msc, $4.99/rok, $14.99 Lifetime).
 * 
 * Zasady Architektoniczne:
 * 1. 100% OFFLINE-FIRST: Stan uprawnień zapisywany i weryfikowany w lokalnym SQLite.
 * 2. ZERO PODZIAŁU FREE / PRO: Pełny dostęp do 100% funkcji w okresie próbnym (7 dni lub do 3 projektów).
 * 3. HISTORIA ZAWSZE READ-ONLY: Po wygaśnięciu trialu blokowane jest jedynie tworzenie nowych wpisów
 *    (nowy projekt, nowy motek). Cała historia, liczniki, wzory i notatki pozostają w pełni czytelne (ochrona 4.9★).
 */

import { DatabaseClient } from './database';

export type PlanType = 'trial' | 'monthly' | 'annual' | 'lifetime';
export type EntitlementStatus = 'active' | 'expired';

export interface PricingTier {
  id: PlanType;
  priceUsd: number;
  pricePln: number;
  period: 'month' | 'year' | 'lifetime';
  labelEn: string;
  labelPl: string;
  sublabelEn: string;
  sublabelPl: string;
  badgeEn?: string;
  badgePl?: string;
  isPopular?: boolean;
}

export const PRICING_TIERS: Record<'monthly' | 'annual' | 'lifetime', PricingTier> = {
  monthly: {
    id: 'monthly',
    priceUsd: 0.99,
    pricePln: 4.49,
    period: 'month',
    labelEn: '$0.99 / month',
    labelPl: '4,49 zł / miesiąc',
    sublabelEn: 'Impulse pass, cancel anytime',
    sublabelPl: 'Mikro-subskrypcja, anuluj kiedy chcesz',
  },
  annual: {
    id: 'annual',
    priceUsd: 4.99,
    pricePln: 22.99,
    period: 'year',
    labelEn: '$4.99 / year',
    labelPl: '22,99 zł / rok',
    sublabelEn: '< $0.42 / month — Cheaper than espresso',
    sublabelPl: '< 1,92 zł / miesiąc — Taniej niż espresso',
    badgeEn: 'BEST VALUE (70% OFF)',
    badgePl: 'NAJPOPULARNIEJSZY (-70%)',
    isPopular: true,
  },
  lifetime: {
    id: 'lifetime',
    priceUsd: 14.99,
    pricePln: 69.99,
    period: 'lifetime',
    labelEn: '$14.99 once',
    labelPl: '69,99 zł jednorazowo',
    sublabelEn: 'Pay once, craft forever',
    sublabelPl: 'Płacisz raz, dziergasz na zawsze',
  },
};

export const TRIAL_CONFIG = {
  durationDays: 7,
  maxProjects: 3,
};

export interface AppEntitlementRecord {
  id: string;
  plan_type: PlanType;
  status: EntitlementStatus;
  trial_started_at: string;
  purchased_at: string | null;
  expires_at: string | null;
  updated_at: string;
}

export interface AccessEvaluation {
  hasFullAccess: boolean;
  canCreateNewProject: boolean;
  isHistoryReadOnly: boolean;
  isPremium: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  trialProjectsRemaining: number;
  activePlan: PlanType;
  status: EntitlementStatus;
  reason?: string;
}

const ENTITLEMENTS_SINGLETON_ID = 'entitlements_primary';

/**
 * Czysta funkcja oceny stanu uprawnień użytkownika.
 */
export function evaluateAccess(
  record: AppEntitlementRecord,
  currentProjectsCount: number,
  nowMs: number = Date.now()
): AccessEvaluation {
  const isPremium =
    record.plan_type === 'monthly' ||
    record.plan_type === 'annual' ||
    record.plan_type === 'lifetime';

  if (isPremium) {
    // Sprawdzamy ewentualną datę wygaśnięcia subskrypcji okresowej
    if (record.expires_at) {
      const expiresMs = new Date(record.expires_at).getTime();
      if (nowMs > expiresMs) {
        return {
          hasFullAccess: false,
          canCreateNewProject: false,
          isHistoryReadOnly: true,
          isPremium: false,
          isTrial: false,
          trialDaysRemaining: 0,
          trialProjectsRemaining: 0,
          activePlan: record.plan_type,
          status: 'expired',
          reason: 'Subskrypcja wygasła. Dotychczasowa historia pozostaje dostępna w trybie tylko do odczytu.',
        };
      }
    }

    return {
      hasFullAccess: true,
      canCreateNewProject: true,
      isHistoryReadOnly: false,
      isPremium: true,
      isTrial: false,
      trialDaysRemaining: 0,
      trialProjectsRemaining: 999,
      activePlan: record.plan_type,
      status: 'active',
    };
  }

  // Jesteśmy w trybie trial
  const trialStartMs = new Date(record.trial_started_at).getTime();
  const elapsedDays = Math.floor((nowMs - trialStartMs) / (1000 * 60 * 60 * 24));
  const trialDaysRemaining = Math.max(0, TRIAL_CONFIG.durationDays - elapsedDays);
  const trialProjectsRemaining = Math.max(0, TRIAL_CONFIG.maxProjects - currentProjectsCount);

  const isTimeExpired = elapsedDays >= TRIAL_CONFIG.durationDays;
  const isProjectsLimitReached = currentProjectsCount >= TRIAL_CONFIG.maxProjects;

  if (isTimeExpired || isProjectsLimitReached) {
    const reason = isTimeExpired
      ? `Upłynął ${TRIAL_CONFIG.durationDays}-dniowy okres próbny. Historia Twoich robótek jest w 100% bezpieczna.`
      : `Osiągnięto limit ${TRIAL_CONFIG.maxProjects} projektów w okresie próbnym.`;

    return {
      hasFullAccess: false,
      canCreateNewProject: false,
      isHistoryReadOnly: true,
      isPremium: false,
      isTrial: true,
      trialDaysRemaining: 0,
      trialProjectsRemaining: 0,
      activePlan: 'trial',
      status: 'expired',
      reason,
    };
  }

  return {
    hasFullAccess: true,
    canCreateNewProject: true,
    isHistoryReadOnly: false,
    isPremium: false,
    isTrial: true,
    trialDaysRemaining,
    trialProjectsRemaining,
    activePlan: 'trial',
    status: 'active',
  };
}

/**
 * Inicjalizuje rekord uprawnień przy pierwszym uruchomieniu lub zwraca istniejący.
 */
export async function initOrGetEntitlements(
  db: DatabaseClient,
  nowMs: number = Date.now()
): Promise<AppEntitlementRecord> {
  const existing = await db.getFirstAsync<AppEntitlementRecord>(
    'SELECT * FROM app_entitlements WHERE id = ?',
    ENTITLEMENTS_SINGLETON_ID
  );

  if (existing) {
    return existing;
  }

  const nowIso = new Date(nowMs).toISOString();
  const initial: AppEntitlementRecord = {
    id: ENTITLEMENTS_SINGLETON_ID,
    plan_type: 'trial',
    status: 'active',
    trial_started_at: nowIso,
    purchased_at: null,
    expires_at: null,
    updated_at: nowIso,
  };

  await db.runAsync(
    `INSERT INTO app_entitlements (id, plan_type, status, trial_started_at, purchased_at, expires_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    initial.id,
    initial.plan_type,
    initial.status,
    initial.trial_started_at,
    initial.purchased_at,
    initial.expires_at,
    initial.updated_at
  );

  return initial;
}

/**
 * Aktywuje plan subskrypcyjny lub zakup dożywotni (Offline-First).
 */
export async function activatePlan(
  db: DatabaseClient,
  planType: 'monthly' | 'annual' | 'lifetime',
  nowMs: number = Date.now()
): Promise<AppEntitlementRecord> {
  const current = await initOrGetEntitlements(db, nowMs);
  const nowIso = new Date(nowMs).toISOString();

  let expiresAtIso: string | null = null;
  if (planType === 'monthly') {
    const nextMonth = new Date(nowMs);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    expiresAtIso = nextMonth.toISOString();
  } else if (planType === 'annual') {
    const nextYear = new Date(nowMs);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    expiresAtIso = nextYear.toISOString();
  }

  await db.runAsync(
    `UPDATE app_entitlements
     SET plan_type = ?, status = 'active', purchased_at = ?, expires_at = ?, updated_at = ?
     WHERE id = ?`,
    planType,
    nowIso,
    expiresAtIso,
    nowIso,
    current.id
  );

  return {
    ...current,
    plan_type: planType,
    status: 'active',
    purchased_at: nowIso,
    expires_at: expiresAtIso,
    updated_at: nowIso,
  };
}

/**
 * Przywracanie zakupów (w środowisku local-first weryfikuje lokalną historię zakupu).
 */
export async function restorePurchases(
  db: DatabaseClient
): Promise<AppEntitlementRecord> {
  const current = await initOrGetEntitlements(db);
  if (current.purchased_at && current.plan_type !== 'trial') {
    return current;
  }
  return current;
}

/**
 * Resetuje datę startu trialu (używane w testach regresyjnych i symulacjach upływu czasu).
 */
export async function resetTrialForTesting(
  db: DatabaseClient,
  trialStartDate: Date
): Promise<AppEntitlementRecord> {
  const current = await initOrGetEntitlements(db);
  const nowIso = new Date().toISOString();
  const trialIso = trialStartDate.toISOString();

  await db.runAsync(
    `UPDATE app_entitlements
     SET plan_type = 'trial', status = 'active', trial_started_at = ?, purchased_at = NULL, expires_at = NULL, updated_at = ?
     WHERE id = ?`,
    trialIso,
    nowIso,
    current.id
  );

  return {
    ...current,
    plan_type: 'trial',
    status: 'active',
    trial_started_at: trialIso,
    purchased_at: null,
    expires_at: null,
    updated_at: nowIso,
  };
}
