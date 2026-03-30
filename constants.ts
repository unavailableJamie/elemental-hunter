
/**
 * ⚠️ WARNING FOR AI & DEVELOPERS ⚠️
 *
 * Board topology is fixed.
 */

import type { GameState, TileData, PlayerState, PlayerID, Connection } from './types.ts';
import { DEFAULT_ACCURACY_RATE } from './config/balance.ts';
import { TileType, TileRole } from './types.ts';
import { applyRoleResolution } from './utils/roleResolver.ts';
import {
    START_TILES,
    GOAL_PATHS,
    ARM_PATHS,
    BRANCH_RULES,
} from './boardSpec.ts';
import { TILE_TYPE_MAP } from './tileTypeMap.ts';
import { TILE_POSITIONS } from './boardLayout.ts';
import { ULTIMATES, CHARACTERS } from './config/characters.ts';
import { LEVEL_CONFIGS, DEFAULT_LEVEL, GameLevel } from './config/levels.ts';

// --- UI & Display Constants ---
export const TILE_SIZE = 64; 
export const TOKEN_IMAGE_SIZE = 36;
export const MAX_TOKENS_PER_PLAYER = 3;

export const DEFAULT_MAX_ROUNDS = 15;
export const DEFAULT_PLAYER_HP = 1000;
export const DEFAULT_MAX_ELEMENT_QUEUE = 8;

export const ELEMENTAL_TILES = [TileType.Fire, TileType.Ice, TileType.Grass, TileType.Rock];
const _startIds  = new Set(Object.values(START_TILES));
const _goalIds   = new Set(Object.values(GOAL_PATHS).flat());
export const EMPTY_TILE_IDS = Object.entries(TILE_TYPE_MAP)
    .filter(([id, t]) => t === 'normal' && !_startIds.has(parseInt(id)) && !_goalIds.has(parseInt(id)))
    .map(([id]) => parseInt(id));

// Added horse token assets (Placeholder base64)
export const PLAYER1_TOKEN_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
export const PLAYER2_TOKEN_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

export const TILE_COLORS: Record<TileType, string> = {
    [TileType.Normal]: '#F3F4F6',
    [TileType.Fire]: '#FFACAC',
    [TileType.Ice]: '#97DFFF',
    [TileType.Grass]: '#7FDE9D', 
    [TileType.Rock]: '#767676', 
    [TileType.SafeZone]: '#FCA5A5',
    [TileType.Center]: '#FCD34D',
    [TileType.Ladder]: '#E5E7EB',
};

export const PLAYER_COLORS: Record<PlayerID, { bg: string, token: string }> = {
    'Player1': { bg: 'bg-red-600', token: '#F87171' }, 
    'Player2': { bg: 'bg-green-600', token: '#4ADE80' },
    'Player3': { bg: 'bg-blue-600', token: '#60A5FA' },
    'Player4': { bg: 'bg-yellow-600', token: '#FBBF24' },
};

const LABEL_TO_TILE_TYPE: Record<string, TileType> = {
    fire:      TileType.Fire,
    waterice:  TileType.Ice,
    grasswood: TileType.Grass,
    earth:     TileType.Rock,
};



const createConnections = (): Record<number, Connection[]> => {
    const connections: Record<number, Connection[]> = {};
    const playersInOrder: PlayerID[] = ['Player2', 'Player4', 'Player1', 'Player3'];
    for (let i = 0; i < playersInOrder.length; i++) {
        const pId = playersInOrder[i];
        const nextPId = playersInOrder[(i + 1) % playersInOrder.length];
        const path = ARM_PATHS[pId];
        for (let j = 0; j < path.length - 1; j++) {
            connections[path[j]] = [{ to: path[j + 1] }];
        }
        connections[path[path.length - 1]] = [{ to: ARM_PATHS[nextPId][0] }];
    }
    BRANCH_RULES.forEach(rule => {
        connections[rule.from] = [
            { to: rule.toLoop },
            { to: rule.toGoal, condition: { isPlayer: rule.owner } }
        ];
    });
    Object.entries(GOAL_PATHS).forEach(([, path]) => {
        for (let i = 0; i < path.length - 1; i++) {
            connections[path[i]] = [{ to: path[i + 1] }];
        }
    });
    return connections;
};

export const generateDefaultGameState = (
    tileGoldEnabled: boolean = true,
    level: GameLevel = DEFAULT_LEVEL
): GameState => {
    const levelConfig = LEVEL_CONFIGS[level];
    // HP is now character-based, not level-based
    const defaultCharacter = CHARACTERS['char1'];
    const playerHP = defaultCharacter?.hp ?? DEFAULT_PLAYER_HP;
    const affinities = [...ELEMENTAL_TILES].sort(() => 0.5 - Math.random());
    const board: (TileData | null)[][] = Array.from({ length: 11 }, () => 
        Array.from({ length: 11 }, () => null)
    );

    Object.entries(TILE_POSITIONS).forEach(([idStr, pos]) => {
        const id = parseInt(idStr);
        const label = TILE_TYPE_MAP[id];
        let type: TileType = LABEL_TO_TILE_TYPE[label ?? ''] ?? TileType.Normal;
        if (Object.values(START_TILES).includes(id)) {
            type = TileType.SafeZone;
        }
        for (const [, path] of Object.entries(GOAL_PATHS)) {
            if (path.includes(id)) {
                if (id === path[path.length - 1]) type = TileType.Center;
                else type = TileType.Ladder;
            }
        }
        board[pos.y][pos.x] = {
            id,
            type,
            role: TileRole.PATH,
            currentElement: ELEMENTAL_TILES.includes(type) ? type : undefined,
            owner: Object.keys(START_TILES).find(p => START_TILES[p as PlayerID] === id) as PlayerID || 
                   Object.keys(GOAL_PATHS).find(p => GOAL_PATHS[p as PlayerID].includes(id)) as PlayerID ||
                   undefined
        };
    });

    const players: Record<PlayerID, PlayerState> = {
        'Player1': {
            id: 'Player1', name: 'Red Player', color: 'bg-red-600', tokenColor: '#F87171', mana: 0, manaFeedbackQueue: [], hp: playerHP, elementAffinity: affinities[0],
            tokens: [
              { id: 1, playerId: 'Player1', tileId: ARM_PATHS.Player1[0], atk: 0, frozenRounds: 0, justFrozen: false },
              { id: 2, playerId: 'Player1', tileId: ARM_PATHS.Player1[1], atk: 0, frozenRounds: 0, justFrozen: false },
              { id: 3, playerId: 'Player1', tileId: ARM_PATHS.Player1[2], atk: 0, frozenRounds: 0, justFrozen: false },
            ],
            safeZoneTileId: START_TILES.Player1, entryTileId: START_TILES.Player1, armId: 3, elementQueue: [affinities[0]],
            comboCount: 0,
            comboTier: 0,
            tileGainMultiplier: 1,
            manaCap: CHARACTERS['char1'].ultimateCost.lv1,
            emptyTileVisits: 0,
            kickCount: 0, finishedHorseCount: 0,
            doubleRollCooldown: 0,
            config: {
              maxElementQueue: DEFAULT_MAX_ELEMENT_QUEUE,
              ultimateType: 'extraRoll',
              ultimateCost: CHARACTERS['char1'].ultimateCost.lv1,
              characterId: 'char1'
            }
        },
        'Player2': {
            id: 'Player2', name: 'Green Player', color: 'bg-green-600', tokenColor: '#4ADE80', mana: 0, manaFeedbackQueue: [], hp: playerHP, elementAffinity: affinities[1],
            tokens: [
              { id: 4, playerId: 'Player2', tileId: ARM_PATHS.Player2[0], atk: 0, frozenRounds: 0, justFrozen: false },
              { id: 5, playerId: 'Player2', tileId: ARM_PATHS.Player2[1], atk: 0, frozenRounds: 0, justFrozen: false },
              { id: 6, playerId: 'Player2', tileId: ARM_PATHS.Player2[2], atk: 0, frozenRounds: 0, justFrozen: false },
            ],
            safeZoneTileId: START_TILES.Player2, entryTileId: START_TILES.Player2, armId: 1, elementQueue: [affinities[1]],
            comboCount: 0,
            comboTier: 0,
            tileGainMultiplier: 1,
            manaCap: CHARACTERS['char1'].ultimateCost.lv1,
            emptyTileVisits: 0,
            kickCount: 0, finishedHorseCount: 0,
            doubleRollCooldown: 0,
            config: {
              maxElementQueue: DEFAULT_MAX_ELEMENT_QUEUE,
              ultimateType: 'extraRoll',
              ultimateCost: CHARACTERS['char1'].ultimateCost.lv1,
              characterId: 'char1'
            }
        },
        'Player3': {
            id: 'Player3', name: 'Blue Player', color: 'bg-blue-600', tokenColor: '#60A5FA', mana: 0, manaFeedbackQueue: [], hp: playerHP, elementAffinity: affinities[2],
            tokens: [], safeZoneTileId: START_TILES.Player3, entryTileId: START_TILES.Player3, armId: 2, elementQueue: [affinities[2]],
            comboCount: 0,
            comboTier: 0,
            tileGainMultiplier: 1,
            manaCap: CHARACTERS['char1'].ultimateCost.lv1,
            emptyTileVisits: 0,
            kickCount: 0, finishedHorseCount: 0,
            doubleRollCooldown: 0,
            config: {
              maxElementQueue: DEFAULT_MAX_ELEMENT_QUEUE,
              ultimateType: 'extraRoll',
              ultimateCost: CHARACTERS['char1'].ultimateCost.lv1,
              characterId: 'char1'
            }
        },
        'Player4': {
            id: 'Player4', name: 'Yellow Player', color: 'bg-yellow-600', tokenColor: '#FBBF24', mana: 0, manaFeedbackQueue: [], hp: playerHP, elementAffinity: affinities[3],
            tokens: [], safeZoneTileId: START_TILES.Player4, entryTileId: START_TILES.Player4, armId: 0, elementQueue: [affinities[3]],
            comboCount: 0,
            comboTier: 0,
            tileGainMultiplier: 1,
            manaCap: CHARACTERS['char1'].ultimateCost.lv1,
            emptyTileVisits: 0,
            kickCount: 0, finishedHorseCount: 0,
            doubleRollCooldown: 0,
            config: {
              maxElementQueue: DEFAULT_MAX_ELEMENT_QUEUE,
              ultimateType: 'extraRoll',
              ultimateCost: CHARACTERS['char1'].ultimateCost.lv1,
              characterId: 'char1'
            }
        }
    };

    return {
        board: applyRoleResolution(board),
        players,
        currentPlayerId: 'Player1',
        dice: [],
        diceCount: 2,
        selectedLevel: level,
        phase: 'SELECT_DICE',
        selectedTokenId: null,
        isEmptyTilePopupMinimized: false,
        comboAnnouncement: null,
        winner: null,
        connections: createConnections(),
        playerStartPathIds: {
            Player1: ARM_PATHS.Player1,
            Player2: ARM_PATHS.Player2,
            Player3: ARM_PATHS.Player3,
            Player4: ARM_PATHS.Player4,
        },
        hasRolledDoubles: false,
        extraTurnActive: false,
        nextTokenId: 7,
        logs: ["Match started. Good luck!"],
        tileGoldEnabled,
        showTileIds: false,
        showMovePreview: true,
        currentRound: 1,
        maxRounds: levelConfig.maxRounds,
        accuracyRate: DEFAULT_ACCURACY_RATE,
        // Ultimate state
        ultimateExtraRolls: 0,
        teleportingTokenId: null,
        consecutiveRollsThisTurn: 0,
        // Summary Metrics Initialization
        totalTurns: 0,
        matchStartTime: null, // Timer starts after first roll
        matchEndTime: null,
        totalActionTime: {
            'Player1': 0,
            'Player2': 0,
            'Player3': 0,
            'Player4': 0
        },
        turnStartTime: null // Starts after first roll
    };
};