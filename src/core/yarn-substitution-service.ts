import {
  calculateYarnSubstitution as domainCalculateSubstitution,
  getYarnWeightCategoriesByWpi,
  YarnSubstitutionResult as DomainYarnSubstitutionResult,
} from './domain-rules';
import { YARN_WEIGHT_STANDARDS, YarnWeightInfo } from './stash-filter-service';

export interface YarnSubstitutionInput {
  patternBalls: number;
  patternBallLengthMeters: number;
  newBallLengthMeters: number;
  newBallWeightGrams?: number;
  strands?: number;
  safetyMarginPercent?: number; // 0, 5, 10, 15, 20
}

export interface DetailedYarnSubstitutionResult {
  totalRequiredMeters: number;
  baseRequiredMeters: number;
  safetyMetersAdded: number;
  exactBalls: number;
  ballsNeeded: number;
  totalEstimatedWeightGrams?: number;
  isTightMargin: boolean;
  recommendation: string;
}

export interface MultiStrandCombination {
  id: string;
  name: string;
  description: string;
  resultingCyc: number;
  resultingStandardName: string;
  recommendedNeedlesMm: string;
}

export const COMMON_MULTI_STRAND_COMBINATIONS: MultiStrandCombination[] = [
  {
    id: 'fingering_plus_mohair',
    name: 'Fingering (1) + Lace Mohair (0)',
    description: 'Klasyczne połączenie na nowoczesne swetry i kardigany.',
    resultingCyc: 3,
    resultingStandardName: 'DK / Light Worsted',
    recommendedNeedlesMm: '3.75 – 4.5 mm',
  },
  {
    id: 'double_lace',
    name: '2 nitki Lace (0)',
    description: 'Dwie nitki cieniutkiej przędzy dające grubość skarpetkową.',
    resultingCyc: 1,
    resultingStandardName: 'Fingering / Sock',
    recommendedNeedlesMm: '2.25 – 3.25 mm',
  },
  {
    id: 'double_fingering',
    name: '2 nitki Fingering (1)',
    description: 'Dwie nitki przędzy skarpetkowej dające średnią grubość.',
    resultingCyc: 3,
    resultingStandardName: 'DK / Light Worsted',
    recommendedNeedlesMm: '3.75 – 4.5 mm',
  },
  {
    id: 'double_sport',
    name: '2 nitki Sport (2)',
    description: 'Dwie nitki przędzy Sport dające mięsistą, ciepłą dzianinę.',
    resultingCyc: 4,
    resultingStandardName: 'Worsted / Aran',
    recommendedNeedlesMm: '4.5 – 5.5 mm',
  },
  {
    id: 'double_dk',
    name: '2 nitki DK (3)',
    description: 'Dwie nitki przędzy DK dające grubą dzianinę na czapki i grube swetry.',
    resultingCyc: 5,
    resultingStandardName: 'Bulky / Chunky',
    recommendedNeedlesMm: '5.5 – 8.0 mm',
  },
  {
    id: 'double_worsted',
    name: '2 nitki Worsted (4)',
    description: 'Bardzo gruba dzianina na zimowe akcesoria i koce.',
    resultingCyc: 6,
    resultingStandardName: 'Super Bulky',
    recommendedNeedlesMm: '8.0 – 12.0 mm',
  },
];

export interface WpiClassification {
  wpi: number;
  matchedCategories: number[];
  standards: YarnWeightInfo[];
  summaryText: string;
}

export class YarnSubstitutionService {
  /**
   * Wylicza zapotrzebowanie na motki zamiennika włóczki z uwzględnieniem
   * marginesu bezpieczeństwa, gramatury i liczby nitek.
   */
  static calculateSubstitution(input: YarnSubstitutionInput): DetailedYarnSubstitutionResult {
    const {
      patternBalls,
      patternBallLengthMeters,
      newBallLengthMeters,
      newBallWeightGrams,
      strands = 1,
      safetyMarginPercent = 10,
    } = input;

    if (patternBalls <= 0 || patternBallLengthMeters <= 0 || newBallLengthMeters <= 0) {
      throw new Error('Parametry ilości i metrażu muszą być większe od zera');
    }
    if (strands <= 0) {
      throw new Error('Liczba nitek musi być większa od zera');
    }
    if (safetyMarginPercent < 0) {
      throw new Error('Margines bezpieczeństwa nie może być ujemny');
    }

    const safetyMarginRatio = safetyMarginPercent / 100;
    const domainResult: DomainYarnSubstitutionResult = domainCalculateSubstitution({
      patternBalls,
      patternBallLength: patternBallLengthMeters,
      newBallLength: newBallLengthMeters,
      safetyMarginRatio,
      strands,
    });

    const baseRequiredMeters = patternBalls * patternBallLengthMeters * strands;
    const safetyMetersAdded = domainResult.totalLengthRequired - baseRequiredMeters;

    let totalEstimatedWeightGrams: number | undefined;
    if (newBallWeightGrams && newBallWeightGrams > 0) {
      const gramsPerMeter = newBallWeightGrams / newBallLengthMeters;
      totalEstimatedWeightGrams = Math.round(domainResult.totalLengthRequired * gramsPerMeter);
    }

    let recommendation: string;
    if (domainResult.isTightMargin) {
      recommendation = `⚠️ Zapas wynosi poniżej 2% ostatniego motka. Zalecamy zakup +1 motka (łącznie ${domainResult.ballsNeeded + 1}), najlepiej z tej samej partii farbowania (Dye Lot).`;
    } else if (safetyMarginPercent === 0) {
      recommendation = `ℹ️ Obliczono bez marginesu bezpieczeństwa (${domainResult.ballsNeeded} motków). Na próbki i końcówki zalecamy dodanie min. 5–10% zapasu.`;
    } else {
      recommendation = `✅ Bezpieczna kalkulacja z ${safetyMarginPercent}% marginesem: ${domainResult.ballsNeeded} motków zapewni komfort dziergania bez ryzyka gry w cykora (Yarn Chicken).`;
    }

    return {
      totalRequiredMeters: Math.round(domainResult.totalLengthRequired * 10) / 10,
      baseRequiredMeters: Math.round(baseRequiredMeters * 10) / 10,
      safetyMetersAdded: Math.round(safetyMetersAdded * 10) / 10,
      exactBalls: Math.round(domainResult.exactBalls * 100) / 100,
      ballsNeeded: domainResult.ballsNeeded,
      totalEstimatedWeightGrams,
      isTightMargin: domainResult.isTightMargin,
      recommendation,
    };
  }

  /**
   * Klasyfikuje grubość przędzy na podstawie liczby owinięć na cal (WPI - Wraps Per Inch).
   */
  static classifyByWpi(wpi: number): WpiClassification {
    if (wpi <= 0) {
      throw new Error('Liczba owinięć WPI musi być większa od zera');
    }

    const matchedCategories = getYarnWeightCategoriesByWpi(wpi);
    const standards = YARN_WEIGHT_STANDARDS.filter((s) => matchedCategories.includes(s.cycNumber));

    let summaryText: string;
    if (standards.length === 0) {
      summaryText = `Nietypowa grubość przędzy (${wpi} WPI). Może to być przędza typu Jumbo lub nieregularna przędza artystyczna.`;
    } else {
      const names = standards.map((s) => `${s.namePl} (CYC ${s.cycNumber})`).join(', ');
      summaryText = `Dopasowano standard: ${names}. Typowe druty: ${standards[0].recommendedNeedlesMm}.`;
    }

    return {
      wpi,
      matchedCategories,
      standards,
      summaryText,
    };
  }

  /**
   * Zwraca listę predefiniowanych sprawdzonych kombinacji łączenia nitek.
   */
  static getMultiStrandCombinations(): MultiStrandCombination[] {
    return [...COMMON_MULTI_STRAND_COMBINATIONS];
  }
}
