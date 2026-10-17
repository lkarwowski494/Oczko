// ============================================================================
// Oczko (Purlo) — Theme & Visual Constants
// Apps4Craft Studio: Basalt ceramic dark aesthetic with artisan terracotta & rose gold.
// ============================================================================

export const theme = {
  colors: {
    bg: '#121214',
    bgCard: '#1C1C1F',
    bgCardSecondary: '#242428',
    border: '#2E2E34',
    borderLight: '#3E3E46',

    // Akcent rzemieślniczy Oczko (Ciepła terakota & Różowe złoto dziewiarskie)
    terracotta: '#D46A43',
    terracottaLight: '#E2825D',
    terracottaMuted: 'rgba(212, 106, 67, 0.15)',

    roseGold: '#D97B66',
    roseGoldLight: '#E89380',
    roseGoldMuted: 'rgba(217, 123, 102, 0.15)',

    // Barwy wełny i włóczek (Sage & Cream)
    sage: '#4E8D72',
    sageLight: '#62A88B',
    sageMuted: 'rgba(78, 141, 114, 0.15)',

    gold: '#D4AF37',
    goldMuted: 'rgba(212, 175, 55, 0.15)',

    // Typografia szwajcarska
    textPrimary: '#F4EFEA',
    textSecondary: '#A09C96',
    textMuted: '#686561',

    // Statusy
    success: '#4E8D72',
    successMuted: 'rgba(78, 141, 114, 0.15)',
    warning: '#D4AF37',
    warningMuted: 'rgba(212, 175, 55, 0.15)',
    danger: '#D9534F',
    dangerMuted: 'rgba(217, 83, 79, 0.15)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    full: 999,
  },
  typography: {
    title: {
      fontSize: 26,
      fontWeight: '700' as const,
      color: '#F4EFEA',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#A09C96',
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#F4EFEA',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#686561',
    },
  },
} as const;

export type Theme = typeof theme;
