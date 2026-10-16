import {
  calculateCraftEconomics,
  DEFAULT_CRAFT_BENCHMARKS,
} from '../cost-calculator';

describe('Apps4Brew Core: Craft Economics Engine (cost-calculator.ts — Złoty Standard #8)', () => {
  it('wylicza koszt materiałów i oszczędności dla swetra z merino', () => {
    const res = calculateCraftEconomics({
      usedWeightGrams: 450,
      skeinWeightGrams: 50,
      pricePerSkein: 25.0, // 9 motków * 25 = 225 zł
      notionsCost: 15.0, // 5 guzików
      retailBoutiquePrice: 650.0,
    });

    expect(res.skeinsUsed).toBe(9);
    expect(res.yarnTotalCost).toBe(225.0);
    expect(res.notionsTotalCost).toBe(15.0);
    expect(res.materialCost).toBe(240.0);
    expect(res.costPer100g).toBeCloseTo(53.33, 1);
    expect(res.materialSavings).toBe(410.0);
    expect(res.materialSavingsPercent).toBe(63);
  });

  it('uwzględnia stawkę roboczogodziny, gdy zdefiniowana', () => {
    const res = calculateCraftEconomics({
      usedWeightGrams: 100,
      skeinWeightGrams: 100,
      pricePerSkein: 40.0,
      laborHours: 10,
      hourlyLaborRate: 35.0, // 350 zł robocizny
      retailBoutiquePrice: 500.0,
    });

    expect(res.skeinsUsed).toBe(1);
    expect(res.materialCost).toBe(40.0);
    expect(res.laborTotalCost).toBe(350.0);
    expect(res.totalCraftCost).toBe(390.0);
  });

  it('obsługuje zerowe wagi i brakujące parametry z domyślnymi wartościami bazowymi', () => {
    const res = calculateCraftEconomics({
      usedWeightGrams: 0,
      skeinWeightGrams: 0,
      pricePerSkein: 0,
    });

    expect(res.skeinsUsed).toBe(0);
    expect(res.materialCost).toBe(0);
    expect(res.costPer100g).toBe(0);
    expect(res.retailBoutiquePrice).toBe(DEFAULT_CRAFT_BENCHMARKS.defaultBoutiqueSweaterPrice);
  });
});
