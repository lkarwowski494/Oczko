// ============================================================================
// Oczko (Purlo) — First Launch Onboarding Modal (Ritual Personalization)
// Apps4Craft Studio: Ceramic dark theme, artisan terracotta & rose gold.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CraftProfile } from '../core/database';
import { useLang, t } from '../core/i18n';
import { theme } from '../core/theme';
import {
  CounterIcon,
  KnittingIcon,
  CrochetIcon,
  MixedCraftIcon,
  CheckIcon,
} from './icons/CraftIcons';

export interface OnboardingModalProps {
  visible: boolean;
  onComplete: (preference: CraftProfile) => void;
  onClose?: () => void;
}

export function OnboardingModal({ visible, onComplete, onClose }: OnboardingModalProps) {
  const _lang = useLang();
  const [selectedPref, setSelectedPref] = useState<CraftProfile>('both');

  const handleStart = () => {
    onComplete(selectedPref);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      handleStart();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconStage}>
              <View style={styles.iconSquircle}>
                <CounterIcon size={44} color={theme.colors.terracotta} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.eyebrow}>{t('Apps4Craft Studio • Rzemiosło Dziewiarskie')}</Text>
            <Text style={styles.title}>{t('Witaj w Oczku')}</Text>
            <Text style={styles.subtitle}>
              {t('Spokojna, 100% offline przestrzeń do liczenia rzędów, wzorów i zarządzania włóczkami.')}
            </Text>
          </View>

          {/* Prompt wyboru profilu */}
          <Text style={styles.choosePrompt}>{t('Wybierz swoją główną dziedzinę rzemiosła:')}</Text>

          {/* 3 Karty preferencji */}
          <View style={styles.cardsContainer}>
            {/* 1. Tylko Druty */}
            <TouchableOpacity
              testID="onboarding-pref-knitting"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPref === 'knitting' }}
              style={[
                styles.prefCard,
                selectedPref === 'knitting' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedPref('knitting')}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconBox, selectedPref === 'knitting' && styles.cardIconBoxActive]}>
                <KnittingIcon
                  size={24}
                  color={selectedPref === 'knitting' ? theme.colors.terracotta : theme.colors.textMuted}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedPref === 'knitting' && styles.cardTitleActive]}>
                    {t('Tylko Druty (Knitting)')}
                  </Text>
                  {selectedPref === 'knitting' && <CheckIcon size={18} color={theme.colors.terracotta} />}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Oczka prawe/lewe, druty z żyłką, warkocze, raglan bezszwowy i kalkulator próbki.')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 2. Tylko Szydełko */}
            <TouchableOpacity
              testID="onboarding-pref-crochet"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPref === 'crochet' }}
              style={[
                styles.prefCard,
                selectedPref === 'crochet' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedPref('crochet')}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconBox, selectedPref === 'crochet' && styles.cardIconBoxActive]}>
                <CrochetIcon
                  size={24}
                  color={selectedPref === 'crochet' ? theme.colors.roseGold : theme.colors.textMuted}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedPref === 'crochet' && styles.cardTitleActive]}>
                    {t('Tylko Szydełko (Crochet)')}
                  </Text>
                  {selectedPref === 'crochet' && <CheckIcon size={18} color={theme.colors.roseGold} />}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Słupki, półsłupki, chusty, amigurumi i precyzyjne śledzenie okrążeń spiralnych.')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Oba rzemiosła (Domyślne) */}
            <TouchableOpacity
              testID="onboarding-pref-both"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPref === 'both' }}
              style={[
                styles.prefCard,
                selectedPref === 'both' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedPref('both')}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconBox, selectedPref === 'both' && styles.cardIconBoxActive]}>
                <MixedCraftIcon
                  size={24}
                  color={selectedPref === 'both' ? theme.colors.terracotta : theme.colors.textMuted}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedPref === 'both' && styles.cardTitleActive]}>
                    {t('Druty i Szydełko (Pełny warsztat)')}
                  </Text>
                  {selectedPref === 'both' && <CheckIcon size={18} color={theme.colors.terracotta} />}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Kompletny zestaw narzędzi, przeliczników miar i kalkulatorów bez ograniczeń.')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Gwarancja prywatności */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 {t('100% Offline-First. Twoje projekty i magazyn są przechowywane wyłącznie na tym urządzeniu (SQLite). Wybór możesz zmienić w każdej chwili w Ustawieniach.')}
            </Text>
          </View>

          {/* Przycisk rozpoczęcia */}
          <TouchableOpacity
            testID="onboarding-start-btn"
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>{t('Rozpocznij tworzenie')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconStage: {
    marginBottom: 16,
  },
  iconSquircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  choosePrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  prefCardActive: {
    borderColor: theme.colors.terracotta,
    backgroundColor: theme.colors.bgCardSecondary,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIconBoxActive: {
    borderColor: theme.colors.terracotta,
    backgroundColor: theme.colors.terracottaMuted,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardTitleActive: {
    color: theme.colors.terracotta,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  privacyNote: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  privacyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: theme.colors.terracotta,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
