// ============================================================
// CHARACTER BALANCE CONFIG
// Single source of truth for all character progression values.
// Edit here to tune stats, costs, and materials.
// ============================================================

type Tier = 'D' | 'C' | 'B' | 'A';

// ─── EXP MATERIALS ───────────────────────────────────────────────────────────
// Materials used to gain EXP and level up a character.
// Rarity: N (common) → R (rare) → SR (super rare)
export const EXP_MATERIALS = {
  ExpN:  { label: 'Exp Stone (N)',  expValue:  200, color: '#4ade80', rarity: 'N'  },
  ExpR:  { label: 'Exp Stone (R)',  expValue:  800, color: '#60a5fa', rarity: 'R'  },
  ExpSR: { label: 'Exp Stone (SR)', expValue: 2500, color: '#c084fc', rarity: 'SR' },
} as const;

// ─── ENLIGHTENMENT MATERIALS ──────────────────────────────────────────────────
// Materials used specifically for Enlightenment (Khai Sáng) upgrades.
// Rarity: EnMat1 (lowest) → EnMat5 (highest)
export const ENLIGHTENMENT_MATERIALS = {
  EnMat1: { label: 'Spirit Shard',   color: '#4ade80', rarity: 1 },
  EnMat2: { label: 'Soul Fragment',  color: '#60a5fa', rarity: 2 },
  EnMat3: { label: 'Mystic Core',    color: '#c084fc', rarity: 3 },
  EnMat4: { label: 'Arcane Crystal', color: '#fbbf24', rarity: 4 },
  EnMat5: { label: 'Divine Essence', color: '#f87171', rarity: 5 },
} as const;

// ─── LEVEL-UP GOLD COST PER EXP, BY ENLIGHTENMENT BRACKET ───────────────────
// Gold cost scales with the Enlightenment bracket the character is currently in.
// Formula: Gold = totalEXP × ratio  (applies to ALL En levels including En.1)
//
// En.1 (Lv.1–20):  100 Gold per 1 EXP
// En.2 (Lv.21–40): 200 Gold per 1 EXP
// En.3 (Lv.41–60): 300 Gold per 1 EXP
// En.4 (Lv.61–80): 500 Gold per 1 EXP
// En.5 (Lv.81–90): 800 Gold per 1 EXP
//
// Higher tiers cost more total Gold per level because they consume more EXP mats.
export const LEVELUP_GOLD_RATIO_BY_EN: Record<number, number> = {
  1: 100,
  2: 200,
  3: 300,
  4: 500,
  5: 800,
};

// ─── ENLIGHTENMENT LEVEL CAPS ─────────────────────────────────────────────────
// Maximum character level allowed at each Enlightenment level.
// En.1 = starting state (all characters begin here), En.5 = max for all tiers.
export const ENLIGHTENMENT_LEVEL_CAPS: Record<number, number> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 90,
};

// ─── ENLIGHTENMENT GOLD COST (fixed per En level) ─────────────────────────────
// Flat Gold cost to perform each Enlightenment upgrade. Not tied to mat count.
export const ENLIGHTENMENT_GOLD_COST: Record<number, number> = {
  2:   250_000,
  3:   700_000,
  4: 2_000_000,
  5: 5_000_000,
};

// ─── ENLIGHTENMENT COSTS ──────────────────────────────────────────────────────
// Materials needed to advance to En.N (from En.N-1).
// Gold is NOT stored here — computed via computeEnlightenmentGold(enLevel).
// Rule: 1–2 mat types for En.2–3; 2–3 mat types for En.4–6.
export interface EnlightenmentCost {
  EnMat1?: number;
  EnMat2?: number;
  EnMat3?: number;
  EnMat4?: number;
  EnMat5?: number;
}

export const ENLIGHTENMENT_COSTS: Record<number, EnlightenmentCost> = {
  2: { EnMat1: 5, EnMat2: 2                            },
  3: { EnMat1: 8, EnMat2: 5, EnMat3: 2                },
  4: {            EnMat2: 8, EnMat3: 5, EnMat4: 2      },
  5: {                       EnMat3: 8, EnMat4: 5, EnMat5: 2 },
};

// ─── TIER CAPS ────────────────────────────────────────────────────────────────
// Maximum Enlightenment level each tier can reach.
// Determines the absolute level ceiling for each tier.
export const TIER_MAX_ENLIGHTENMENT: Record<Tier, number> = {
  D: 3,  // max Lv.60
  C: 4,  // max Lv.80
  B: 5,  // max Lv.90
  A: 5,  // max Lv.90
};

// ─── BASE STATS PER TIER (at Lv.1) ───────────────────────────────────────────
// All characters of the same tier share these base stats.
// Growth per level is applied on top of these values.
export interface BaseStats { atk: number; mag: number; hp: number; }

export const TIER_BASE_STATS: Record<Tier, BaseStats> = {
  D: { atk:  40, mag:  20, hp:   800 },
  C: { atk:  55, mag:  28, hp:  1100 },
  B: { atk:  72, mag:  42, hp:  1450 },
  A: { atk:  95, mag:  58, hp:  1900 },
};

// ─── STAT GROWTH PER LEVEL (%) ────────────────────────────────────────────────
// Compounding additive growth rate applied per level above Lv.1.
// Formula: stat = base * (1 + (level - 1) * growthRate)
// Example: C ATK at Lv.40 = 55 * (1 + 39 * 0.02) = 55 * 1.78 ≈ 98
export const STAT_GROWTH_PER_LEVEL = {
  atk: 0.020,  // +2.0% per level
  mag: 0.020,  // +2.0% per level
  hp:  0.025,  // +2.5% per level
};

// ─── HELPER: compute derived stats at a given level ──────────────────────────
export function computeCharStats(tier: Tier, level: number): BaseStats {
  const base = TIER_BASE_STATS[tier];
  const lv = Math.max(1, level);
  return {
    atk: Math.round(base.atk * (1 + (lv - 1) * STAT_GROWTH_PER_LEVEL.atk)),
    mag: Math.round(base.mag * (1 + (lv - 1) * STAT_GROWTH_PER_LEVEL.mag)),
    hp:  Math.round(base.hp  * (1 + (lv - 1) * STAT_GROWTH_PER_LEVEL.hp)),
  };
}

// ─── LEVEL-UP MATERIAL COST PER TIER ─────────────────────────────────────────
// Materials consumed per single level-up within each level bracket.
// Higher tiers cost more materials overall; higher level brackets use rarer mats.
export interface LevelupCost {
  minLevel: number;
  maxLevel: number;
  expN: number;
  expR: number;
  expSR: number;
  // Gold is NOT stored here — it's derived from total EXP via EXP_TO_GOLD_RATIO.
}

export const TIER_LEVELUP_COST: Record<Tier, LevelupCost[]> = {
  D: [
    { minLevel:  1, maxLevel: 20, expN: 4, expR: 0, expSR: 0 },
    { minLevel: 21, maxLevel: 40, expN: 4, expR: 1, expSR: 0 },
    { minLevel: 41, maxLevel: 60, expN: 2, expR: 2, expSR: 0 },
  ],
  C: [
    { minLevel:  1, maxLevel: 20, expN: 5, expR: 0, expSR: 0 },
    { minLevel: 21, maxLevel: 40, expN: 5, expR: 1, expSR: 0 },
    { minLevel: 41, maxLevel: 60, expN: 3, expR: 2, expSR: 0 },
    { minLevel: 61, maxLevel: 80, expN: 0, expR: 4, expSR: 1 },
  ],
  B: [
    { minLevel:  1, maxLevel: 20, expN: 6, expR: 1, expSR: 0 },
    { minLevel: 21, maxLevel: 40, expN: 4, expR: 2, expSR: 0 },
    { minLevel: 41, maxLevel: 60, expN: 2, expR: 3, expSR: 1 },
    { minLevel: 61, maxLevel: 80, expN: 0, expR: 4, expSR: 2 },
    { minLevel: 81, maxLevel: 90, expN: 0, expR: 2, expSR: 3 },
  ],
  A: [
    { minLevel:  1, maxLevel: 20, expN: 8, expR: 1, expSR: 0 },
    { minLevel: 21, maxLevel: 40, expN: 5, expR: 3, expSR: 0 },
    { minLevel: 41, maxLevel: 60, expN: 2, expR: 4, expSR: 1 },
    { minLevel: 61, maxLevel: 80, expN: 0, expR: 5, expSR: 2 },
    { minLevel: 81, maxLevel: 90, expN: 0, expR: 3, expSR: 4 },
  ],
};

// ─── HELPER: gold cost for a given amount of EXP at a given En level ─────────
// Gold = totalEXP × LEVELUP_GOLD_RATIO_BY_EN[enLevel]. Falls back to En.1 ratio.
export function levelupGoldForEXP(totalEXP: number, enLevel: number): number {
  const ratio = LEVELUP_GOLD_RATIO_BY_EN[enLevel] ?? LEVELUP_GOLD_RATIO_BY_EN[1];
  return totalEXP * ratio;
}

// ─── HELPER: aggregate material cost for a level range ───────────────────────
// enLevel: the character's current Enlightenment level (determines gold rate).
export function aggregateLevelupCost(
  tier: Tier,
  fromLevel: number,
  toLevel: number,
  enLevel = 0,
): { expN: number; expR: number; expSR: number; gold: number } {
  let expN = 0, expR = 0, expSR = 0;
  const brackets = TIER_LEVELUP_COST[tier];
  for (let lv = fromLevel + 1; lv <= toLevel; lv++) {
    const b = brackets.find(br => lv >= br.minLevel && lv <= br.maxLevel);
    if (b) { expN += b.expN; expR += b.expR; expSR += b.expSR; }
  }
  const totalExp = expN * EXP_MATERIALS.ExpN.expValue
                 + expR * EXP_MATERIALS.ExpR.expValue
                 + expSR * EXP_MATERIALS.ExpSR.expValue;
  return { expN, expR, expSR, gold: levelupGoldForEXP(totalExp, enLevel) };
}

// ─── EXP REQUIRED PER LEVEL ──────────────────────────────────────────────────
// Each level requires more EXP than the previous — linear progression.
// Formula: expToNextLevel(lv) = LEVEL_EXP_BASE + (lv - 1) × LEVEL_EXP_GROWTH
// Applied universally across all tiers and Enlightenment brackets.
export const LEVEL_EXP_BASE   = 1000; // EXP required to advance from Lv.1
export const LEVEL_EXP_GROWTH =  200; // Additional EXP per level

export function expToNextLevel(level: number): number {
  return LEVEL_EXP_BASE + (level - 1) * LEVEL_EXP_GROWTH;
}
// Sample values:
//   Lv.1 →  2: 1,000 EXP   Lv.20 → 21: 4,800 EXP
//   Lv.40 → 41: 8,800 EXP  Lv.41 → 42: 9,000 EXP  (natural cross-bracket jump)
//   Lv.60 → 61: 12,800 EXP Lv.80 → 81: 16,800 EXP Lv.100 → 101: 20,800 EXP

// ─── HELPER: effective stat level ────────────────────────────────────────────
// Stats increase when the EXP bar fills (not on the next level-up).
// Filling Lv.N's EXP bar grants Lv.N+1 stats — this applies at ANY level
// including the tier's absolute max (e.g. A-tier Lv.90 → shows Lv.91 stats).
// computeCharStats handles any level beyond the cap naturally via the formula.
export function effectiveStatLevel(
  charLevel: number,
  expCurrent: number,
  expNextLevel: number,
): number {
  return expCurrent >= expNextLevel ? charLevel + 1 : charLevel;
}

// ─── HELPER: tier absolute max level ─────────────────────────────────────────
// The highest level a character of this tier can ever reach.
export function tierMaxLevel(tier: Tier): number {
  return ENLIGHTENMENT_LEVEL_CAPS[TIER_MAX_ENLIGHTENMENT[tier]];
}

// ─── HELPER: compute Enlightenment Gold cost ──────────────────────────────────
// Returns the flat Gold cost for the given Enlightenment level upgrade.
export function computeEnlightenmentGold(enLevel: number): number {
  return ENLIGHTENMENT_GOLD_COST[enLevel] ?? 0;
}
