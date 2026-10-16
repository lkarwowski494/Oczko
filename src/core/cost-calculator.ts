/**
 * Oczko — Kalkulator Ekonomii i Opłacalności Rzemiosła (Craft Economics Engine)
 * Złoty Standard Architektoniczny Apps4Brew #8
 * Wylicza:
 * 1. Koszt zużytej włóczki (gramy, motki, cena za motek)
 * 2. Koszt dodatków pasmanteryjnych (guziki, metki, zamki)
 * 3. Wycenę robocizny (stawka za roboczogodzinę)
 * 4. Porównanie: koszt własny vs cena wyrobu w butiku rzemieślniczym
 * 5. Wskaźnik zaoszczędzonych pieniędzy i koszt na 100g gotowej dzianiny
 */

export interface CraftEconomicsInput {
  usedWeightGrams: number;
  skeinWeightGrams: number;
  pricePerSkein: number;
  skeinsCount?: number;

  notionsCost?: number; // guziki, metki, zamek (domyślnie 0.0 zł)
  laborHours?: number; // czas pracy (domyślnie 0 h)
  hourlyLaborRate?: number; // stawka roboczogodziny (domyślnie 0.0 zł)
  retailBoutiquePrice?: number; // szacowana cena gotowego swetra/czapki ze 100% wełny w butiku
}

export interface CraftEconomicsMetrics {
  skeinsUsed: number;
  yarnTotalCost: number;
  notionsTotalCost: number;
  laborTotalCost: number;
  materialCost: number;
  totalCraftCost: number; // materiały + robocizna
  costPer100g: number;

  retailBoutiquePrice: number;
  materialSavings: number; // oszczędność na samych materiałach vs butik
  materialSavingsPercent: number;
}

export const DEFAULT_CRAFT_BENCHMARKS = {
  pricePerSkein: 25.0, // średnia cena motka 50g wełny/merino
  skeinWeightGrams: 50.0,
  defaultBoutiqueSweaterPrice: 550.0, // PLN za sweter handmade 100% merino w butiku
};

function roundGrosze(val: number): number {
  return Math.round(val * 100) / 100;
}

export function calculateCraftEconomics(input: CraftEconomicsInput): CraftEconomicsMetrics {
  const skeinWeight = Math.max(1, input.skeinWeightGrams || DEFAULT_CRAFT_BENCHMARKS.skeinWeightGrams);
  const priceSkein = Math.max(0, input.pricePerSkein || 0);
  const usedWeight = Math.max(0, input.usedWeightGrams || 0);

  // Liczba motków (ułamkowa i zaokrąglona w górę do pełnych motków zakupowych)
  const fractionalSkeins = usedWeight / skeinWeight;
  const skeinsUsed = input.skeinsCount ?? Math.ceil(fractionalSkeins);

  const yarnTotalCost = roundGrosze(skeinsUsed * priceSkein);
  const notionsTotalCost = roundGrosze(Math.max(0, input.notionsCost || 0));
  const materialCost = roundGrosze(yarnTotalCost + notionsTotalCost);

  const laborHours = Math.max(0, input.laborHours || 0);
  const hourlyRate = Math.max(0, input.hourlyLaborRate || 0);
  const laborTotalCost = roundGrosze(laborHours * hourlyRate);

  const totalCraftCost = roundGrosze(materialCost + laborTotalCost);
  const costPer100g = usedWeight > 0 ? roundGrosze((materialCost / usedWeight) * 100) : 0;

  const retailBoutiquePrice = Math.max(
    0,
    input.retailBoutiquePrice ?? DEFAULT_CRAFT_BENCHMARKS.defaultBoutiqueSweaterPrice
  );
  const materialSavings = roundGrosze(Math.max(0, retailBoutiquePrice - materialCost));
  const materialSavingsPercent =
    retailBoutiquePrice > 0 ? Math.round((materialSavings / retailBoutiquePrice) * 100) : 0;

  return {
    skeinsUsed,
    yarnTotalCost,
    notionsTotalCost,
    laborTotalCost,
    materialCost,
    totalCraftCost,
    costPer100g,
    retailBoutiquePrice,
    materialSavings,
    materialSavingsPercent,
  };
}
