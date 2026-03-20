
export enum TileType {
  Normal = 'normal',
  Fire = 'fire',
  Ice = 'ice',
  Grass = 'grass',
  Rock = 'rock',
  SafeZone = 'safezone',
  Center = 'center',
  Ladder = 'ladder',
}

export enum TileRole {
  START = 'START',
  PATH = 'PATH',
  GOAL = 'GOAL',
  EMPTY = 'EMPTY',
  DISABLED = 'DISABLED'
}

export type PlayerID = 'Player1' | 'Player2' | 'Player3' | 'Player4';

export type UltimateType = 'extraRoll' | 'teleport';
export type GameLevel = 'Lv1' | 'Lv2' | 'Lv3';

export interface PlayerConfig {
  maxElementQueue: number;
  ultimateType: UltimateType;
  ultimateCost: number;
  characterId: string;
}

export interface TileData {
  id: number;
  type: TileType;
  role: TileRole;
  diamondValue?: number;
  owner?: PlayerID;
  direction?: 0 | 90 | 180 | 270;
  currentElement?: TileType | null;
}

export interface TokenState {
  id: number;
  playerId: PlayerID;
  tileId: number;
  atk: number;
  frozenRounds: number;
  justFrozen?: boolean;
}

export interface ManaFeedback {
  id: number;
  reason: string;
  amount: number;
}

export interface PlayerState {
  hp: number;
  elementAffinity?: TileType;
  id: PlayerID;
  name: string;
  color: string;
  tokenColor: string;
  tokens: TokenState[];
  mana: number;
  manaFeedbackQueue: ManaFeedback[];
  safeZoneTileId: number;
  entryTileId: number;
  armId: number;
  elementQueue: TileType[];
  comboCount: number;
  comboTier: number;
  tileGainMultiplier: number;
  manaCap: number;
  emptyTileVisits: number;
  kickCount: number;
  finishedHorseCount: number;
  doubleRollCooldown: number; // rounds remaining before this player can roll doubles again
  config: PlayerConfig;
}

export interface ConnectionCondition {
    isPlayer?: PlayerID;
    isNotPlayer?: PlayerID;
}

export interface Connection {
    to: number;
    condition?: ConnectionCondition;
}

export interface GameState {
  board: (TileData | null)[][];
  players: Record<PlayerID, PlayerState>;
  currentPlayerId: PlayerID;
  dice: number[];
  diceCount: 1 | 2;
  selectedLevel: GameLevel;
  phase: 'SELECT_DICE' | 'MOVE' | 'ANIMATING' | 'END' | 'SELECT_TELEPORT_DEST' | 'SELECT_TELEPORT_TOKEN' | 'EMPTY_TILE_INTERACTION' | 'GOAL_REWARD_SELECTION' | 'LEVEL_SELECT';
  selectedTokenId: number | null;
  isEmptyTilePopupMinimized: boolean;
  comboAnnouncement: {
    type: string;
    rewards: string[];
  } | null;
  viewerPlayerId?: PlayerID;
  winner: PlayerID | null;
  connections: Record<number, Connection[]>;
  playerStartPathIds: Record<PlayerID, number[]>;
  hasRolledDoubles: boolean;
  extraTurnActive: boolean;
  nextTokenId: number;
  logs: string[];
  tileGoldEnabled: boolean;
  showTileIds: boolean;
  showMovePreview: boolean;
  currentRound: number;
  maxRounds: number;
  accuracyRate: number; // Added for Power Roll
  animation?: {
      tokenId: number;
      path: number[];
      step: number;
  };
  // Ultimate specific state
  ultimateExtraRolls: number;
  teleportingTokenId: number | null;
  // Consecutive roll tracking: counts how many times the current player has rolled this turn sequence.
  // Resets to 0 when the turn passes to a different player.
  consecutiveRollsThisTurn: number;
  // Match Summary Metrics
  totalTurns: number;
  matchStartTime: number | null;
  matchEndTime: number | null;
  totalActionTime: Record<PlayerID, number>;
  turnStartTime: number | null;
}

export interface MapData {
    board: (TileData | null)[][];
    connections: Record<number, Connection[]>;
    playerStartPathIds: Record<PlayerID, number[]>;
    playerConfig: Record<PlayerID, {
        safeZoneTileId: number;
        entryTileId: number;
    }>;
}