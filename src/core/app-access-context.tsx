/**
 * Oczko — Kontekst stanu uprawnień i monetyzacji (useAppAccess)
 * Zapewnia:
 * 1. Reaktywny stan oceny uprawnień (evaluateAccess)
 * 2. Zarządzanie widocznością modalu Paywalla
 * 3. Obsługę zakupu impulsowego ($0.99/msc, $4.99/rok, $14.99 Lifetime)
 * 4. Przywracanie uprawnień (Restore Purchases)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DatabaseClient } from './database';
import {
  AppEntitlementRecord,
  AccessEvaluation,
  initOrGetEntitlements,
  evaluateAccess,
  activatePlan,
  restorePurchases,
  PRICING_TIERS,
  PricingTier,
  PlanType,
} from './app-access-service';

export interface AppAccessContextValue {
  evaluation: AccessEvaluation;
  entitlements: AppEntitlementRecord | null;
  pricingTiers: Record<'monthly' | 'annual' | 'lifetime', PricingTier>;
  isPaywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchasePlan: (tier: 'monthly' | 'annual' | 'lifetime') => Promise<void>;
  restore: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const DEFAULT_EVALUATION: AccessEvaluation = {
  hasFullAccess: true,
  canCreateNewProject: true,
  isHistoryReadOnly: false,
  isPremium: false,
  isTrial: true,
  trialDaysRemaining: 7,
  trialProjectsRemaining: 3,
  activePlan: 'trial',
  status: 'active',
};

const AppAccessContext = createContext<AppAccessContextValue | null>(null);

export interface AppAccessProviderProps {
  children: ReactNode;
  db: DatabaseClient | null;
  currentProjectsCount: number;
}

export function AppAccessProvider({
  children,
  db,
  currentProjectsCount,
}: AppAccessProviderProps) {
  const [entitlements, setEntitlements] = useState<AppEntitlementRecord | null>(null);
  const [evaluation, setEvaluation] = useState<AccessEvaluation>(DEFAULT_EVALUATION);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  const refreshAccess = useCallback(async () => {
    if (!db) return;
    try {
      const record = await initOrGetEntitlements(db);
      setEntitlements(record);
      const ev = evaluateAccess(record, currentProjectsCount);
      setEvaluation(ev);
    } catch {
      // W razie błędu bazy nie blokujemy użytkownika w trialu
      setEvaluation(DEFAULT_EVALUATION);
    }
  }, [db, currentProjectsCount]);

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

  const openPaywall = useCallback(() => {
    setIsPaywallVisible(true);
  }, []);

  const closePaywall = useCallback(() => {
    setIsPaywallVisible(false);
  }, []);

  const purchasePlan = useCallback(
    async (tier: 'monthly' | 'annual' | 'lifetime') => {
      if (!db) return;
      const updated = await activatePlan(db, tier);
      setEntitlements(updated);
      const ev = evaluateAccess(updated, currentProjectsCount);
      setEvaluation(ev);
      setIsPaywallVisible(false);
    },
    [db, currentProjectsCount]
  );

  const restore = useCallback(async () => {
    if (!db) return;
    const restored = await restorePurchases(db);
    setEntitlements(restored);
    const ev = evaluateAccess(restored, currentProjectsCount);
    setEvaluation(ev);
  }, [db, currentProjectsCount]);

  return (
    <AppAccessContext.Provider
      value={{
        evaluation,
        entitlements,
        pricingTiers: PRICING_TIERS,
        isPaywallVisible,
        openPaywall,
        closePaywall,
        purchasePlan,
        restore,
        refreshAccess,
      }}
    >
      {children}
    </AppAccessContext.Provider>
  );
}

export function useAppAccess(): AppAccessContextValue {
  const ctx = useContext(AppAccessContext);
  if (!ctx) {
    // Bezpieczny fallback gdy komponent renderowany jest poza providerem
    return {
      evaluation: DEFAULT_EVALUATION,
      entitlements: null,
      pricingTiers: PRICING_TIERS,
      isPaywallVisible: false,
      openPaywall: () => {},
      closePaywall: () => {},
      purchasePlan: async () => {},
      restore: async () => {},
      refreshAccess: async () => {},
    };
  }
  return ctx;
}
