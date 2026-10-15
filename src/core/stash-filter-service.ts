/**
 * Oczko Core — Serwis filtrów i klasyfikacji magazynu włóczek (BR-MAG-002, BR-MAG-003)
 * Obsługuje standard grubości CYC (Craft Yarn Council), wykrywanie składów surowcowych,
 * wyszukiwanie po partii farbowania (Dye Lot) oraz sumowanie metryk magazynu.
 */

import { StashYarnRecord, YarnWeightCategory } from './stash-repository';

export interface YarnWeightInfo {
  category: YarnWeightCategory;
  cycNumber: number;
  namePl: string;
  recommendedNeedlesMm: string;
  typicalGaugeStitches: string;
}

/**
 * Standardy grubości przędzy wg Craft Yarn Council (CYC) (BR-MAG-002).
 */
export const YARN_WEIGHT_STANDARDS: YarnWeightInfo[] = [
  {
    category: 'Lace',
    cycNumber: 0,
    namePl: 'Koronkowa (Lace / 0)',
    recommendedNeedlesMm: '1.5 - 2.25 mm',
    typicalGaugeStitches: '33-40 o. na 10 cm',
  },
  {
    category: 'Fingering',
    cycNumber: 1,
    namePl: 'Skarpetkowa (Super Fine / 1)',
    recommendedNeedlesMm: '2.25 - 3.25 mm',
    typicalGaugeStitches: '27-32 o. na 10 cm',
  },
  {
    category: 'Sport',
    cycNumber: 2,
    namePl: 'Sport / Baby (Fine / 2)',
    recommendedNeedlesMm: '3.25 - 3.75 mm',
    typicalGaugeStitches: '23-26 o. na 10 cm',
  },
  {
    category: 'DK',
    cycNumber: 3,
    namePl: 'DK (Light / 3)',
    recommendedNeedlesMm: '3.75 - 4.5 mm',
    typicalGaugeStitches: '21-24 o. na 10 cm',
  },
  {
    category: 'Worsted',
    cycNumber: 4,
    namePl: 'Worsted (Medium / 4)',
    recommendedNeedlesMm: '4.5 - 5.5 mm',
    typicalGaugeStitches: '16-20 o. na 10 cm',
  },
  {
    category: 'Aran',
    cycNumber: 4,
    namePl: 'Aran (Medium / 4)',
    recommendedNeedlesMm: '5.0 - 6.0 mm',
    typicalGaugeStitches: '16-18 o. na 10 cm',
  },
  {
    category: 'Bulky',
    cycNumber: 5,
    namePl: 'Gruba (Bulky / 5)',
    recommendedNeedlesMm: '5.5 - 8.0 mm',
    typicalGaugeStitches: '12-15 o. na 10 cm',
  },
  {
    category: 'Super Bulky',
    cycNumber: 6,
    namePl: 'Bardzo gruba (Super Bulky / 6)',
    recommendedNeedlesMm: '8.0 - 12.0 mm',
    typicalGaugeStitches: '7-11 o. na 10 cm',
  },
];

export interface FiberTagDefinition {
  id: string;
  label: string;
  keywords: string[];
}

export const FIBER_FILTER_TAGS: FiberTagDefinition[] = [
  {
    id: 'wool',
    label: 'Wełna / Merino',
    keywords: ['wełna', 'wool', 'merino', 'owcza'],
  },
  {
    id: 'alpaca',
    label: 'Alpaka',
    keywords: ['alpaka', 'alpaca', 'baby alpaca'],
  },
  {
    id: 'cotton',
    label: 'Bawełna',
    keywords: ['bawełna', 'cotton'],
  },
  {
    id: 'silk',
    label: 'Jedwab',
    keywords: ['jedwab', 'silk'],
  },
  {
    id: 'mohair',
    label: 'Mohair',
    keywords: ['mohair', 'kid mohair'],
  },
  {
    id: 'linen',
    label: 'Len',
    keywords: ['len', 'linen', 'flax'],
  },
  {
    id: 'synthetic',
    label: 'Syntetyki (Poliamid/Akryl)',
    keywords: ['poliamid', 'polyamide', 'nylon', 'akryl', 'acrylic', 'poliester', 'polyester'],
  },
];

/**
 * Automatycznie wykrywa tagi surowcowe w tekście składu włóczki.
 */
export function detectFiberTags(composition: string): string[] {
  if (!composition) return [];
  const lower = composition.toLowerCase();
  const matchedTags: string[] = [];

  for (const tag of FIBER_FILTER_TAGS) {
    if (tag.keywords.some((kw) => lower.includes(kw))) {
      matchedTags.push(tag.id);
    }
  }

  return matchedTags;
}

export interface StashFilterCriteria {
  query?: string;
  weightCategory?: YarnWeightCategory | 'ALL';
  fiberTag?: string; // id tagu surowcowego lub 'all' / 'ALL'
  inStockOnly?: boolean;
}

export interface StashMetrics {
  totalItems: number;
  totalSkeins: number;
  totalGrams: number;
  totalMeters: number;
}

/**
 * Filtruje kolekcję włóczek według kryteriów wyszukiwarki i kategorii (BR-MAG-003).
 */
export function filterStashYarns(
  yarns: StashYarnRecord[],
  criteria: StashFilterCriteria
): StashYarnRecord[] {
  return yarns.filter((yarn) => {
    // 1. Filtr dostępności (tylko na stanie)
    if (criteria.inStockOnly && yarn.skeinsRemaining <= 0) {
      return false;
    }

    // 2. Filtr grubości przędzy
    if (
      criteria.weightCategory &&
      criteria.weightCategory !== 'ALL' &&
      yarn.weightCategory !== criteria.weightCategory
    ) {
      return false;
    }

    // 3. Filtr surowcowy
    if (criteria.fiberTag && criteria.fiberTag.toUpperCase() !== 'ALL') {
      const tags = detectFiberTags(yarn.composition);
      if (!tags.includes(criteria.fiberTag.toLowerCase())) {
        return false;
      }
    }

    // 4. Wyszukiwarka tekstowa (marka, nazwa, kolor, lot farbowania, notatki)
    if (criteria.query && criteria.query.trim().length > 0) {
      const q = criteria.query.trim().toLowerCase();
      const matchBrand = yarn.brand.toLowerCase().includes(q);
      const matchName = yarn.name.toLowerCase().includes(q);
      const matchColorway = yarn.colorway.toLowerCase().includes(q);
      const matchDyeLot = (yarn.dyeLot || '').toLowerCase().includes(q);
      const matchComposition = yarn.composition.toLowerCase().includes(q);
      const matchNotes = (yarn.notes || '').toLowerCase().includes(q);

      if (!matchBrand && !matchName && !matchColorway && !matchDyeLot && !matchComposition && !matchNotes) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sumuje metryki przefiltrowanego magazynu włóczek.
 */
export function calculateStashMetrics(yarns: StashYarnRecord[]): StashMetrics {
  let totalSkeins = 0;
  let totalGrams = 0;
  let totalMeters = 0;

  for (const y of yarns) {
    const remaining = Math.max(0, y.skeinsRemaining);
    totalSkeins += remaining;
    if (y.weightGramsPerSkein) {
      totalGrams += remaining * y.weightGramsPerSkein;
    }
    if (y.lengthMetersPerSkein) {
      totalMeters += remaining * y.lengthMetersPerSkein;
    }
  }

  return {
    totalItems: yarns.length,
    totalSkeins: Math.round(totalSkeins * 10) / 10,
    totalGrams: Math.round(totalGrams),
    totalMeters: Math.round(totalMeters),
  };
}
