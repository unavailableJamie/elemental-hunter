// ============================================================
// TUTORIAL BALANCE CONFIG
// Priority: GDD_Tutorial_v1_ElementalHunter values > base game values
// Edit here to tune tutorial difficulty / pacing.
// ============================================================

// --- PRACTICE MODE CONFIG (từ GDD, mục 2.2 & 3.2) ---
export const TUT_PLAYER_HP      = 300;   // GDD: 300 (vs base Lv1: 600)
export const TUT_MAX_ROUNDS     = 8;     // GDD: 8 rounds (vs base Lv1: 12)
export const TUT_MAX_COMBO_TIERS = 3;   // GDD: unlock all tiers (vs base Lv1: 1)
export const TUT_ARTIFACT_SLOTS  = 3;   // GDD: unlock all slots (vs base Lv1: 1)
export const TUT_EMPTY_TILE_VISITS_PREUNLOCK = 3; // GDD: pre-unlocked (no farming)

// --- TILE REWARDS (same as base game) ---
export const TUT_TILE_REWARD_ATK  = 30; // ATK khi đáp ô cùng Affinity
export const TUT_TILE_REWARD_MANA = 10; // Mana khi đáp ô khác Affinity

// --- COMBO REWARDS (same as base game) ---
export const TUT_COMBO_T1_ATK_BONUS      = 150; // Tier 1: +ATK all tokens
export const TUT_COMBO_T3_ATK_MULTIPLIER = 1.5; // Tier 3: ×ATK all tokens

// --- ULTIMATE (same as base game) ---
export const TUT_ULTIMATE_COST = 50; // Mana cost cho Extra Roll

// --- POWER ROLL (same as base game) ---
export const TUT_ACCURACY_RATE = 20; // % xác suất Power Roll thành công

// --- BOT TIMING ---
export const TUT_BOT_TURN_DELAY_MS = 1000; // Delay trước khi bot bắt đầu lượt
export const TUT_BOT_MOVE_DELAY_MS = 500;  // Delay giữa các bước trong lượt bot

// --- ADAPTIVE HIGHLIGHT (từ GDD, mục 4) ---
export const TUT_HIGHLIGHT_DISABLE_THRESHOLD = 3; // Số lần đúng liên tiếp để tắt highlight
export const TUT_AFK_TIMEOUT_MS  = 5000;  // AFK > 5s → bật lại highlight
export const TUT_HINT_TIER2_MS   = 3000;  // Tier 2: tooltip sau 3s idle
export const TUT_HINT_TIER3_MS   = 10000; // Tier 3: modal sau 10s idle

// --- ANIMATION ---
export const TUT_ANIMATION_STEP_DELAY = 80; // ms per tile step (slightly slower than base 60ms)
