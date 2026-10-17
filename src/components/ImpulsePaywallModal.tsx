/**
 * Oczko — Komponent Paywalla Impulsowego „Cheaper than Espresso” (Złoty Standard Monetyzacji)
 * Oferuje:
 * - $0.99 USD / miesiąc (~4,49 zł)
 * - $4.99 USD / rok (~22,99 zł) — OFERTA GŁÓWNA (Best Value)
 * - $14.99 USD Lifetime (~69,99 zł) — zakup na zawsze
 * 
 * Spełnia rygorystyczne wytyczne Apple HIG i a11y:
 * - Dotyk min. 44x44 pt
 * - Etykiety accessibilityLabel i accessibilityRole
 * - Gwarancja nienaruszalności historii w trybie Read-Only
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAccess } from '../core/app-access-context';
import { PRICING_TIERS, PlanType } from '../core/app-access-service';
import { useLang, t } from '../core/i18n';

export interface ImpulsePaywallModalProps {
  visible?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ImpulsePaywallModal({
  visible,
  onClose,
  onSuccess,
}: ImpulsePaywallModalProps) {
  const lang = useLang();
  const { isPaywallVisible, closePaywall, purchasePlan, restore, evaluation } = useAppAccess();
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const isModalOpen = visible !== undefined ? visible : isPaywallVisible;
  const handleClose = onClose || closePaywall;

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await purchasePlan(selectedTier);
      if (onSuccess) onSuccess();
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      await restore();
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const isPl = lang === 'pl';
  const activePricing = PRICING_TIERS[selectedTier];

  return (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t('Zamknij')}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Ikona i Tytuł */}
          <View style={styles.heroSection}>
            <Text style={styles.heroBadge}>🧶 APPS4BREW STUDIO PASS</Text>
            <Text style={styles.heroTitle}>
              {isPl ? 'Dziergaj bez limitów' : 'Unleash Your Craft'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isPl
                ? 'Taniej niż jedno espresso — wspieraj niezależne rzemiosło i twórz bez ograniczeń.'
                : 'Cheaper than espresso — support independent craft and knit without limits.'}
            </Text>
            {evaluation.reason && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{evaluation.reason}</Text>
              </View>
            )}
          </View>

          {/* Lista Wartości / Korzyści */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🛡️</Text>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>
                  {isPl ? '100% Offline-First i Bezpieczeństwo' : '100% Offline-First & Private'}
                </Text>
                <Text style={styles.benefitDesc}>
                  {isPl
                    ? 'Zero reklam, zero śledzenia. Twoja historia robótek nigdy nie zostanie zablokowana.'
                    : 'Zero ads, zero trackers. Your finished objects and history stay read-only forever.'}
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📐</Text>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>
                  {isPl ? 'Wszystkie Zaawansowane Kalkulatory' : 'All Advanced Craft Calculators'}
                </Text>
                <Text style={styles.benefitDesc}>
                  {isPl
                    ? 'Konstrukcja raglanu GSR, korona czapki, euklidesowe kształtowanie oczek i próbki.'
                    : 'Top-down seamless raglan, hat crown decreases, euclidean shaping and gauge.'}
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>⌚</Text>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>
                  {isPl ? 'Apple Watch & Garmin Connect IQ' : 'Apple Watch & Garmin Companions'}
                </Text>
                <Text style={styles.benefitDesc}>
                  {isPl
                    ? 'Zliczaj rzędy koronką i przyciskami bez odkładania drutów i motka.'
                    : 'Count rows with Digital Crown and watch buttons without dropping needles.'}
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📑</Text>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>
                  {isPl ? 'Wzory PDF z Magnetyczną Linijką' : 'PDF Reader with Magnetic Ruler'}
                </Text>
                <Text style={styles.benefitDesc}>
                  {isPl
                    ? 'Importuj wzory z Ravelry, linijka podąża automatycznie za każdym rzędem.'
                    : 'Import patterns with auto-stepping optical progress ruler for tired eyes.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Opcje Cenowe */}
          <Text style={styles.sectionHeader}>
            {isPl ? 'Wybierz plan dla siebie:' : 'Select your pass:'}
          </Text>

          {/* 1. Roczny (Najpopularniejszy) */}
          <TouchableOpacity
            style={[
              styles.tierCard,
              selectedTier === 'annual' && styles.tierCardSelected,
              styles.tierCardPopular,
            ]}
            onPress={() => setSelectedTier('annual')}
            accessibilityRole="button"
            accessibilityLabel={`${PRICING_TIERS.annual.labelPl} — Najpopularniejszy`}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>
                {isPl ? PRICING_TIERS.annual.badgePl : PRICING_TIERS.annual.badgeEn}
              </Text>
            </View>
            <View style={styles.tierHeaderRow}>
              <View>
                <Text style={styles.tierTitle}>
                  {isPl ? 'Abonament Roczny' : 'Annual Pass'}
                </Text>
                <Text style={styles.tierSubtitle}>
                  {isPl ? PRICING_TIERS.annual.sublabelPl : PRICING_TIERS.annual.sublabelEn}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceMain}>
                  {isPl ? PRICING_TIERS.annual.labelPl : PRICING_TIERS.annual.labelEn}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 2. Miesięczny */}
          <TouchableOpacity
            style={[
              styles.tierCard,
              selectedTier === 'monthly' && styles.tierCardSelected,
            ]}
            onPress={() => setSelectedTier('monthly')}
            accessibilityRole="button"
            accessibilityLabel={PRICING_TIERS.monthly.labelPl}
          >
            <View style={styles.tierHeaderRow}>
              <View>
                <Text style={styles.tierTitle}>
                  {isPl ? 'Plan Miesięczny' : 'Monthly Pass'}
                </Text>
                <Text style={styles.tierSubtitle}>
                  {isPl ? PRICING_TIERS.monthly.sublabelPl : PRICING_TIERS.monthly.sublabelEn}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceMain}>
                  {isPl ? PRICING_TIERS.monthly.labelPl : PRICING_TIERS.monthly.labelEn}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 3. Lifetime */}
          <TouchableOpacity
            style={[
              styles.tierCard,
              selectedTier === 'lifetime' && styles.tierCardSelected,
            ]}
            onPress={() => setSelectedTier('lifetime')}
            accessibilityRole="button"
            accessibilityLabel={PRICING_TIERS.lifetime.labelPl}
          >
            <View style={styles.tierHeaderRow}>
              <View>
                <Text style={styles.tierTitle}>
                  {isPl ? 'Dostęp Dożywotni (Lifetime)' : 'Lifetime Access'}
                </Text>
                <Text style={styles.tierSubtitle}>
                  {isPl ? PRICING_TIERS.lifetime.sublabelPl : PRICING_TIERS.lifetime.sublabelEn}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceMain}>
                  {isPl ? PRICING_TIERS.lifetime.labelPl : PRICING_TIERS.lifetime.labelEn}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Główny Przycisk Zakupu */}
          <TouchableOpacity
            style={[styles.primaryCta, isProcessing && styles.primaryCtaDisabled]}
            onPress={handlePurchase}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel={`Odblokuj z planem: ${isPl ? activePricing.labelPl : activePricing.labelEn}`}
          >
            <Text style={styles.primaryCtaText}>
              {isProcessing
                ? (isPl ? 'Aktywowanie...' : 'Activating...')
                : isPl
                ? `Odblokuj pełny dostęp (${activePricing.labelPl})`
                : `Unlock Full Access (${activePricing.labelEn})`}
            </Text>
          </TouchableOpacity>

          {/* Dolne Linki: Restore i Ochrona Danych */}
          <View style={styles.footerLinks}>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              accessibilityRole="button"
              accessibilityLabel={isPl ? 'Przywróć poprzednie zakupy' : 'Restore Purchases'}
            >
              <Text style={styles.restoreButtonText}>
                {isPl ? 'Przywróć zakupy' : 'Restore Purchases'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerGuarantee}>
              {isPl
                ? '🔒 Gwarancja 4.9★: Twoje zakończone projekty i notatki pozostają zawsze dostępne w trybie tylko do odczytu.'
                : '🔒 4.9★ Promise: Your past projects and notes remain safely accessible in read-only mode forever.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBE5DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3B32',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A5A36',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C1810',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B5E55',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  reasonBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#F0D5C7',
  },
  reasonText: {
    fontSize: 13,
    color: '#A04218',
    textAlign: 'center',
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: '#7A6E65',
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 12,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E6DDD5',
    minHeight: 56,
  },
  tierCardPopular: {
    borderColor: '#8A5A36',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: '#8A5A36',
    backgroundColor: '#FFFBF7',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#8A5A36',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 2,
  },
  tierSubtitle: {
    fontSize: 12,
    color: '#8A7D74',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceMain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8A5A36',
  },
  primaryCta: {
    backgroundColor: '#8A5A36',
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  primaryCtaDisabled: {
    opacity: 0.6,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerLinks: {
    alignItems: 'center',
  },
  restoreButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  restoreButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7D74',
    textDecorationLine: 'underline',
  },
  footerGuarantee: {
    fontSize: 11,
    color: '#A0958C',
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
