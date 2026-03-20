import { GameState, PlayerID } from '../types.ts';
import {
  LEVEL_PLAYER_HP,
  LEVEL_MAX_ROUNDS,
  LEVEL_MAX_COMBO_TIERS,
  LEVEL_ARTIFACT_SLOTS,
} from './balance.ts';

export type GameLevel = 'Lv1' | 'Lv2' | 'Lv3';

export interface LevelConfig {
  name: string;
  description: string;
  playerHP: number;
  maxRounds: number;
  maxComboTiers: number; // Max combo tier achievable (1, 2, or 3)
  artifactSlots: number; // Number of artifact slots available
  tileGainMultiplier: number; // Default tile gain multiplier
}

export const LEVEL_CONFIGS: Record<GameLevel, LevelConfig> = {
  'Lv1': {
    name: 'Level 1 - Beginner',
    description: 'Simplified mechanics: 1 combo tier, 1 artifact slot. 7-8 rounds gameplay.',
    playerHP: LEVEL_PLAYER_HP['Lv1'],
    maxRounds: LEVEL_MAX_ROUNDS['Lv1'],
    maxComboTiers: LEVEL_MAX_COMBO_TIERS['Lv1'],
    artifactSlots: LEVEL_ARTIFACT_SLOTS['Lv1'],
    tileGainMultiplier: 1,
  },
  'Lv2': {
    name: 'Level 2 - Intermediate',
    description: 'Balanced gameplay: 2 combo tiers, 2 artifact slots. 15 rounds.',
    playerHP: LEVEL_PLAYER_HP['Lv2'],
    maxRounds: LEVEL_MAX_ROUNDS['Lv2'],
    maxComboTiers: LEVEL_MAX_COMBO_TIERS['Lv2'],
    artifactSlots: LEVEL_ARTIFACT_SLOTS['Lv2'],
    tileGainMultiplier: 1,
  },
  'Lv3': {
    name: 'Level 3 - Master',
    description: 'Full features: 3 combo tiers, 3 artifact slots. Maximum complexity!',
    playerHP: LEVEL_PLAYER_HP['Lv3'],
    maxRounds: LEVEL_MAX_ROUNDS['Lv3'],
    maxComboTiers: LEVEL_MAX_COMBO_TIERS['Lv3'],
    artifactSlots: LEVEL_ARTIFACT_SLOTS['Lv3'],
    tileGainMultiplier: 1,
  },
};

export const DEFAULT_LEVEL: GameLevel = 'Lv3';
