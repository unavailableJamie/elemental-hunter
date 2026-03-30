// ============================================================
// TUTORIAL GAME STATE INITIALIZER
// Tạo GameState với Tutorial config (HP=300, 8 rounds, v.v.)
// Tận dụng board layout và connections của base game.
// ============================================================

import type { GameState, PlayerState } from '@/types.ts';
import { TileType } from '@/types.ts';
import { generateDefaultGameState } from '@/constants.ts';
import { ULTIMATES, CHARACTERS } from '@/config/characters.ts';
import {
  TUT_PLAYER_HP,
  TUT_MAX_ROUNDS,
  TUT_EMPTY_TILE_VISITS_PREUNLOCK,
  TUT_ACCURACY_RATE,
} from '@tutorial/config/balance.ts';

// Player1 = human (Fire affinity), Player2 = bot (Ice affinity)
// Giữ cố định để tutorial narrative có thể reference đúng màu/nguyên tố
export const TUTORIAL_PLAYER_AFFINITY = TileType.Fire;
export const TUTORIAL_BOT_AFFINITY    = TileType.Ice;

export const createTutorialGameState = (): GameState => {
  // Dùng base game generator để có đúng board + connections + token positions
  const state = generateDefaultGameState(false, 'Lv3');

  // --- Override Player1 (Human) ---
  const p1: PlayerState = {
    ...state.players.Player1,
    hp:               TUT_PLAYER_HP,
    mana:             0,
    elementAffinity:  TUTORIAL_PLAYER_AFFINITY,
    elementQueue:     [TUTORIAL_PLAYER_AFFINITY], // Start với 1 Fire
    comboCount:       0,
    comboTier:        0,
    tileGainMultiplier: 1,
    emptyTileVisits:  TUT_EMPTY_TILE_VISITS_PREUNLOCK, // Pre-unlocked: cả 3 artifacts
    kickCount:        0,
    finishedHorseCount: 0,
    manaCap:          CHARACTERS['char1'].ultimateCost.lv1,
    config: {
      maxElementQueue: 8,
      ultimateType:   'extraRoll',
      ultimateCost:   50,
      characterId:    'char1',
    },
  };

  // --- Override Player2 (Bot) ---
  const p2: PlayerState = {
    ...state.players.Player2,
    hp:               TUT_PLAYER_HP,
    mana:             0,
    elementAffinity:  TUTORIAL_BOT_AFFINITY,
    elementQueue:     [TUTORIAL_BOT_AFFINITY], // Start với 1 Ice
    comboCount:       0,
    comboTier:        0,
    tileGainMultiplier: 1,
    emptyTileVisits:  TUT_EMPTY_TILE_VISITS_PREUNLOCK,
    kickCount:        0,
    finishedHorseCount: 0,
    manaCap:          CHARACTERS['char1'].ultimateCost.lv1,
    config: {
      maxElementQueue: 8,
      ultimateType:   'extraRoll',
      ultimateCost:   50,
      characterId:    'char1',
    },
  };

  // Player3 & Player4: keep from base (no tokens → không tham gia)
  return {
    ...state,
    players: {
      ...state.players,
      Player1: p1,
      Player2: p2,
    },
    currentPlayerId: 'Player1',
    phase:           'SELECT_DICE',
    maxRounds:       TUT_MAX_ROUNDS,
    currentRound:    1,
    accuracyRate:    TUT_ACCURACY_RATE,
    winner:          null,
    dice:            [],
    selectedTokenId: null,
    ultimateExtraRolls: 0,
    logs:            ['Tutorial Ván 1 bắt đầu. Chúc bạn học tốt!'],
    matchStartTime:  null,
    matchEndTime:    null,
    totalTurns:      0,
    totalActionTime: { Player1: 0, Player2: 0, Player3: 0, Player4: 0 },
    turnStartTime:   null,
  };
};

// Tạo state mới cho Ván 2 (reset hoàn toàn, giữ board)
export const createVan2GameState = (): GameState => {
  const state = createTutorialGameState();
  return {
    ...state,
    logs: ['Tutorial Ván 2 bắt đầu. Học combo, artifact và ultimate!'],
  };
};
