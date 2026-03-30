
// ============================================================
// BALANCE CONFIG — Single source of truth for all tunable values
// Edit here; Vite HMR will apply changes instantly in dev mode.
// ============================================================

// --- PER-TILE REWARDS ---
// Applied each time a token lands on an elemental tile.
// Affinity match → ATK; Non-affinity → MAG. Values are now CHARACTER-BASED:
//   actual reward = character.atk (ATK) or character.mag (MAG) × tileGainMultiplier
// The constants below serve as default fallbacks only.
export const TILE_REWARD_ATK = 30; // Default ATK tile reward (override by character.atk)
export const TILE_REWARD_MAG = 10; // Default MAG tile reward (override by character.mag)
/** @deprecated use TILE_REWARD_MAG */
export const TILE_REWARD_MANA = TILE_REWARD_MAG;

// --- DOUBLE ROLL COOLDOWN ---
// After a successful Roll Double, this player cannot roll doubles again for N rounds.
// Applied per-player independently.
export const DOUBLE_ROLL_COOLDOWN_ROUNDS = 2;

// --- CONSECUTIVE ROLL CAP ---
// Maximum number of consecutive dice rolls a player can make in a single turn sequence.
// Includes the initial roll + any extra turns (from Roll Double or Ultimate Extra Roll).
// e.g. MAX_CONSECUTIVE_ROLLS = 3 → 1 normal roll + at most 2 extra turns.
export const MAX_CONSECUTIVE_ROLLS = 3;

// --- COMBO REWARDS ---
// Tier 1: flat ATK bonus added to ALL tokens, triggered on every combo.
export const COMBO_T1_ATK_BONUS = 150;
// Tier 3: multiplier applied to all tokens' current ATK (milestone: 3rd combo).
export const COMBO_T3_ATK_MULTIPLIER = 1.5;


// --- POWER ROLL ACCURACY ---
// % chance a Power Roll succeeds (used in App.tsx accuracyRate).
export const DEFAULT_ACCURACY_RATE = 20; // was 30

// --- ARTIFACT UNLOCK THRESHOLDS (empty tile visits) ---
export const ARTIFACT_SWAP_THRESHOLD   = 1;
export const ARTIFACT_CHANGE_THRESHOLD = 2;
export const ARTIFACT_CHARGE_THRESHOLD = 3;

// --- LEVEL CONFIGS ---
// Indexed by GameLevel key ('Lv1' | 'Lv2' | 'Lv3').
export const LEVEL_PLAYER_HP: Record<string, number> = {
  Lv1: 600,  // was 1000
  Lv2: 800,  // was 1500
  Lv3: 1000,
};

export const LEVEL_MAX_ROUNDS: Record<string, number> = {
  Lv1: 12,  // was 15
  Lv2: 15,
  Lv3: 15,
};

export const LEVEL_MAX_COMBO_TIERS: Record<string, number> = {
  Lv1: 1,
  Lv2: 2,
  Lv3: 3,
};

export const LEVEL_ARTIFACT_SLOTS: Record<string, number> = {
  Lv1: 1,
  Lv2: 2,
  Lv3: 3,
};
