// ============================================================
// TUTORIAL-SPECIFIC TYPES
// Base game types (GameState, PlayerState, etc.) are reused from ../types.ts
// ============================================================

export type TutorialStage = 'VAN_1' | 'VAN_2';

export type TutorialPhase =
  | 'WELCOME'       // Welcome modal shown
  | 'PLAYING'       // In-game (Ván 1 or Ván 2)
  | 'TRANSITION'    // Fade animation between Ván 1 → Ván 2
  | 'COMPLETE';     // Completion modal shown

export type BotMode = 'SCRIPTED' | 'RANDOM';

// Actions that the adaptive highlight system tracks
export type ActionType =
  | 'rollDice'
  | 'selectToken'
  | 'useArtifact'
  | 'activateUltimate';

export interface ActionProgress {
  consecutiveCorrect: number;
}

// Tier of the hint shown to the player
// 0 = none, 1 = highlight only, 2 = tooltip (+3s), 3 = modal (+10s, "Làm hộ tôi")
export type HintTier = 0 | 1 | 2 | 3;

export interface TutorialMeta {
  stage: TutorialStage;
  tutorialPhase: TutorialPhase;
  botMode: BotMode;
  botScriptStep: number;      // Index into current bot script array
  powerRollFirstUse: boolean; // Ván 2: force success on first Power Roll
  narrativeSeen: Set<string>; // One-time narrative event IDs already shown
}

export interface AdaptiveHighlightState {
  actionProgress: Record<ActionType, ActionProgress>;
  highlightDisabled: Record<ActionType, boolean>;
  currentAction: ActionType;
  hintTier: HintTier;
}

// Narrative event IDs (used in narrativeSeen set)
export const NARRATIVE_IDS = {
  // Ván 1
  FIRST_ELEMENT_AFFINITY:  'v1_first_element_affinity',
  FIRST_ELEMENT_OTHER:     'v1_first_element_other',
  FIRST_KICK_RECEIVED:     'v1_first_kick_received',
  FIRST_KICK_DEALT:        'v1_first_kick_dealt',
  SAFE_ZONE_EXPLAINED:     'v1_safe_zone',
  // Ván 2
  FIRST_COMBO:             'v2_first_combo',
  FIRST_ARTIFACT:          'v2_first_artifact',
  ULTIMATE_HINT:           'v2_ultimate_hint',
  POWER_ROLL_HINT:         'v2_power_roll_hint',
  BOT_COMBO_C3:            'v2_bot_combo_c3',
  BOT_ULTIMATE:            'v2_bot_ultimate',
} as const;

export type NarrativeId = typeof NARRATIVE_IDS[keyof typeof NARRATIVE_IDS];
