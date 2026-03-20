// ============================================================
// BOT SCRIPTS — Scripted moves for Ván 1 & Ván 2 (Rounds 1–5)
// Từ GDD mục 2.3 và 3.3. Round 6+ → RANDOM mode.
// ============================================================

export interface BotScriptStep {
  round: number;
  diceValues: [number, number]; // [die1, die2], sum = movement steps
  tokenIdx: number;             // 0 or 1 (index into bot.tokens array)
  avoidKick?: boolean;          // True → bot avoids landing on player tokens
  forceKick?: boolean;          // True → bot tries to land on a player token (Ván 1 Round 5)
  preSetQueue?: string[];       // Pre-set bot elementQueue before this round (for forceCombo)
  useArtifact?: 'Swap' | 'Change' | 'Charge'; // Ván 2 Round 3: use artifact on empty tile
  useUltimate?: boolean;        // Ván 2 Round 5: activate ultimate if mana ≥ 50
}

// --- VÁN 1 SCRIPT (từ GDD mục 2.3) ---
// Mục tiêu: Demo Movement → Element → Kick theo thứ tự
// Round 1-4: thu thập nguyên tố, KHÔNG kick player
// Round 5: Bot kick player 1 lần (scripted)
// Round 6+: RANDOM
export const VAN1_BOT_SCRIPT: BotScriptStep[] = [
  { round: 1, diceValues: [2, 3], tokenIdx: 0, avoidKick: true },
  { round: 2, diceValues: [4, 1], tokenIdx: 1, avoidKick: true },
  { round: 3, diceValues: [3, 2], tokenIdx: 0, avoidKick: true },
  { round: 4, diceValues: [2, 4], tokenIdx: 1, avoidKick: true },
  { round: 5, diceValues: [3, 3], tokenIdx: 0, forceKick: true },
  // Round 6+ → handled by RANDOM mode in useTutorialBot
];

// --- VÁN 2 SCRIPT (từ GDD mục 3.3) ---
// Mục tiêu: Demo Combo C3 → Artifact → Tier 2 Combo → Ultimate
// Round 2: Bot trigger Combo C3 (preSetQueue có sẵn 2 Fire, land thêm Fire = C3)
// Round 3: Bot đáp Empty Tile, dùng Artifact Swap
// Round 4: Bot setup combo Tier 2
// Round 5: Bot activate Ultimate (nếu đủ mana)
// Round 6+: RANDOM
export const VAN2_BOT_SCRIPT: BotScriptStep[] = [
  { round: 1, diceValues: [2, 2], tokenIdx: 0, avoidKick: true },
  {
    round: 2,
    diceValues: [1, 4],
    tokenIdx: 1,
    // preSetQueue: pre-load 2 Fire trước → land thêm Fire → queue = [Fire, Fire, Fire] → C3
    // Actual TileType strings are set in useTutorialBot using TileType enum
    preSetQueue: ['fire', 'fire'],
    avoidKick: true,
  },
  {
    round: 3,
    diceValues: [2, 2],
    tokenIdx: 0,
    useArtifact: 'Swap',
    avoidKick: true,
  },
  { round: 4, diceValues: [3, 3], tokenIdx: 1, avoidKick: true },
  { round: 5, diceValues: [4, 2], tokenIdx: 0, useUltimate: true, avoidKick: true },
  // Round 6+ → RANDOM
];

// Scripted phase ends after round 5; bot switches to RANDOM
export const SCRIPTED_PHASE_END_ROUND = 5;
