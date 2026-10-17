/**
 * Oczko Core — Repozytorium magazynu włóczek i narzędzi w SQLite (BR-MAG-001...005)
 * Zapewnia trwały zapis inwentarza offline z pełną integralnością danych (ZP-06).
 */

import { DatabaseClient } from './database';

export type YarnWeightCategory =
  | 'Lace'
  | 'Fingering'
  | 'Sport'
  | 'DK'
  | 'Worsted'
  | 'Aran'
  | 'Bulky'
  | 'Super Bulky';

export type ToolType =
  | 'circular'
  | 'straight'
  | 'dpn'
  | 'crochet_hook'
  | 'interchangeable_cable'
  | 'interchangeable_tip'
  | 'accessory'
  | 'notion'
  | 'custom';

export type ToolMaterial = 'bamboo' | 'wood' | 'metal' | 'plastic' | 'carbon' | 'other';

export interface StashYarnRecord {
  id: string;
  brand: string;
  name: string;
  colorway: string;
  dyeLot?: string;
  weightCategory: YarnWeightCategory;
  composition: string;
  skeinsTotal: number;
  skeinsRemaining: number;
  weightGramsPerSkein?: number;
  lengthMetersPerSkein?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StashToolRecord {
  id: string;
  name: string;
  toolType: ToolType;
  sizeMm: number;
  usSize?: string;
  material: ToolMaterial;
  cableLengthCm?: number;
  brand?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function insertStashYarn(db: DatabaseClient, yarn: StashYarnRecord): Promise<void> {
  await db.runAsync(
    `INSERT INTO stash_yarns (
      id, brand, name, colorway, dye_lot, weight_category, composition, skeins_total, skeins_remaining, weight_grams_per_skein, length_meters_per_skein, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    yarn.id,
    yarn.brand,
    yarn.name,
    yarn.colorway,
    yarn.dyeLot ?? null,
    yarn.weightCategory,
    yarn.composition,
    yarn.skeinsTotal,
    yarn.skeinsRemaining,
    yarn.weightGramsPerSkein ?? null,
    yarn.lengthMetersPerSkein ?? null,
    yarn.notes ?? null,
    yarn.createdAt,
    yarn.updatedAt
  );
}

export async function listStashYarns(db: DatabaseClient): Promise<StashYarnRecord[]> {
  interface Row {
    id: string;
    brand: string;
    name: string;
    colorway: string;
    dye_lot: string | null;
    weight_category: YarnWeightCategory;
    composition: string;
    skeins_total: number;
    skeins_remaining: number;
    weight_grams_per_skein: number | null;
    length_meters_per_skein: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM stash_yarns`);
  return rows.map((r) => ({
    id: r.id,
    brand: r.brand,
    name: r.name,
    colorway: r.colorway,
    dyeLot: r.dye_lot ?? undefined,
    weightCategory: r.weight_category,
    composition: r.composition,
    skeinsTotal: r.skeins_total,
    skeinsRemaining: r.skeins_remaining,
    weightGramsPerSkein: r.weight_grams_per_skein ?? undefined,
    lengthMetersPerSkein: r.length_meters_per_skein ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getStashYarn(db: DatabaseClient, id: string): Promise<StashYarnRecord | null> {
  const all = await listStashYarns(db);
  return all.find((y) => y.id === id) ?? null;
}

export async function updateStashYarnRemaining(
  db: DatabaseClient,
  id: string,
  remaining: number
): Promise<void> {
  await db.runAsync(
    `UPDATE stash_yarns SET skeins_remaining = ?, updated_at = ? WHERE id = ?`,
    remaining,
    new Date().toISOString(),
    id
  );
}

export async function deleteStashYarn(db: DatabaseClient, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM stash_yarns WHERE id = ?`, id);
}

export async function insertStashTool(db: DatabaseClient, tool: StashToolRecord): Promise<void> {
  await db.runAsync(
    `INSERT INTO stash_tools (
      id, name, tool_type, size_mm, us_size, material, cable_length_cm, brand, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tool.id,
    tool.name,
    tool.toolType,
    tool.sizeMm,
    tool.usSize ?? null,
    tool.material,
    tool.cableLengthCm ?? null,
    tool.brand ?? null,
    tool.notes ?? null,
    tool.createdAt,
    tool.updatedAt
  );
}

export async function listStashTools(db: DatabaseClient): Promise<StashToolRecord[]> {
  interface Row {
    id: string;
    name: string;
    tool_type: ToolType;
    size_mm: number;
    us_size: string | null;
    material: ToolMaterial;
    cable_length_cm: number | null;
    brand: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }
  const rows = await db.getAllAsync<Row>(`SELECT * FROM stash_tools`);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    toolType: r.tool_type,
    sizeMm: r.size_mm,
    usSize: r.us_size ?? undefined,
    material: r.material,
    cableLengthCm: r.cable_length_cm ?? undefined,
    brand: r.brand ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getStashTool(db: DatabaseClient, id: string): Promise<StashToolRecord | null> {
  const all = await listStashTools(db);
  return all.find((t) => t.id === id) ?? null;
}

export async function deleteStashTool(db: DatabaseClient, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM stash_tools WHERE id = ?`, id);
}

/**
 * Jeśli magazyn jest pusty, wstawia pozycje początkowe.
 */
export async function seedDefaultStashIfEmpty(db: DatabaseClient): Promise<void> {
  const yarns = await listStashYarns(db);
  const now = new Date().toISOString();

  if (yarns.length === 0) {
    await insertStashYarn(db, {
      id: 'yarn_drops_nord',
      brand: 'Drops',
      name: 'Nord',
      colorway: '03 Jasnoszary',
      dyeLot: '1240',
      weightCategory: 'Fingering',
      composition: '45% Alpaka, 30% Poliamid, 25% Wełna',
      skeinsTotal: 4,
      skeinsRemaining: 4,
      weightGramsPerSkein: 50,
      lengthMetersPerSkein: 170,
      createdAt: now,
      updatedAt: now,
    });

    await insertStashYarn(db, {
      id: 'yarn_sandnes_sunday',
      brand: 'Sandnes Garn',
      name: 'Sunday',
      colorway: '2511 Almond',
      dyeLot: '8910',
      weightCategory: 'Fingering',
      composition: '100% Wełna Merino (non-superwash)',
      skeinsTotal: 2,
      skeinsRemaining: 2,
      weightGramsPerSkein: 50,
      lengthMetersPerSkein: 235,
      createdAt: now,
      updatedAt: now,
    });
  }

  const tools = await listStashTools(db);
  if (tools.length === 0) {
    await insertStashTool(db, {
      id: 'tool_knitpro_3_5',
      name: 'KnitPro Zing 3.5 mm',
      toolType: 'circular',
      sizeMm: 3.5,
      material: 'metal',
      cableLengthCm: 80,
      brand: 'KnitPro',
      createdAt: now,
      updatedAt: now,
    });

    await insertStashTool(db, {
      id: 'tool_chiaogoo_4_0',
      name: 'ChiaoGoo Red Lace 4.0 mm',
      toolType: 'circular',
      sizeMm: 4.0,
      material: 'metal',
      cableLengthCm: 100,
      brand: 'ChiaoGoo',
      createdAt: now,
      updatedAt: now,
    });

    await insertStashTool(db, {
      id: 'tool_clover_3_0',
      name: 'Clover Amour Szydełko 3.0 mm',
      toolType: 'crochet_hook',
      sizeMm: 3.0,
      material: 'metal',
      brand: 'Clover',
      createdAt: now,
      updatedAt: now,
    });
  }
}
