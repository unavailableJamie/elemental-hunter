
// =====================================
// CORE TYPES
// =====================================

export type PlayerID = 'Player1' | 'Player2' | 'Player3' | 'Player4';

export enum TileRole {
  START = 'START',
  PATH = 'PATH',
  GOAL = 'GOAL',
  DISABLED = 'DISABLED',
}

export enum ElementType {
  Fire = 'Fire',
  WaterIce = 'WaterIce',
  GrassWood = 'GrassWood',
  Earth = 'Earth',
}

// =====================================
// START TILES
// =====================================

export const START_TILES: Record<PlayerID, number> = {
  Player1: 51,
  Player2: 0,
  Player3: 54,
  Player4: 5,
};

// =====================================
// GOAL / CHUỒNG PATHS (INWARD ONLY)
// =====================================

export const GOAL_PATHS: Record<PlayerID, number[]> = {
  Player1: [33, 28, 26, 31],
  Player2: [7, 13, 19, 25],
  Player3: [49, 43, 37, 30],
  Player4: [10, 16, 22, 27],
};

// The actual scoring tile at the end of the goal path
export const FINAL_GOALS: Record<PlayerID, number> = {
  Player1: 31,
  Player2: 25,
  Player3: 30,
  Player4: 27,
};

// =====================================
// ARM PATHS (ORDERED, EXPLICIT)
// includes START tile as index 0
// =====================================

export const ARM_PATHS: Record<PlayerID, number[]> = {
  Player1: [51, 50, 40, 32, 59, 35, 41, 47, 56, 55],
  Player2: [0, 6, 12, 18, 57, 21, 15, 9, 3, 4],
  Player3: [54, 48, 42, 36, 58, 20, 14, 8, 2, 1],
  Player4: [5, 11, 17, 23, 60, 24, 34, 46, 53, 52],
};

// =====================================
// MAIN LOOP ORDER (CLOCKWISE)
// =====================================

export const MAIN_LOOP_ORDER: PlayerID[] = [
  'Player1', // top-right
  'Player3', // top-left 
  'Player2', // bottom-left
  'Player4', // bottom-right 
];

// =====================================
// BRANCH RULES (CONDITIONAL NEXT)
// =====================================

export interface BranchRule {
  from: number;
  toGoal: number;
  toLoop: number;
  owner: PlayerID;
}

export const BRANCH_RULES: BranchRule[] = [
  {
    owner: 'Player1',
    from: 52,
    toGoal: 33,
    toLoop: 51,
  },
  {
    owner: 'Player2',
    from: 1,
    toGoal: 7,
    toLoop: 0,
  },
  {
    owner: 'Player3',
    from: 55,
    toGoal: 49,
    toLoop: 54,
  },
  {
    owner: 'Player4',
    from: 4,
    toGoal: 10,
    toLoop: 5,
  },
];

// =====================================
// ELEMENT ASSIGNMENT
// =====================================

export const TILE_ELEMENTS: Record<number, ElementType> = {
  // Fire
  6:  ElementType.Fire,
  13: ElementType.Fire,
  18: ElementType.Fire,
  24: ElementType.Fire,
  29: ElementType.Fire,
  35: ElementType.Fire,
  40: ElementType.Fire,

  // Water / Ice
  2:  ElementType.WaterIce,
  7:  ElementType.WaterIce,
  14: ElementType.WaterIce,
  19: ElementType.WaterIce,
  25: ElementType.WaterIce,
  32: ElementType.WaterIce,
  36: ElementType.WaterIce,

  // Grass / Wood
  5:  ElementType.GrassWood,
  12: ElementType.GrassWood,
  16: ElementType.GrassWood,
  22: ElementType.GrassWood,
  27: ElementType.GrassWood,
  34: ElementType.GrassWood,
  39: ElementType.GrassWood,

  // Earth
  4:  ElementType.Earth,
  9: ElementType.Earth,
  15: ElementType.Earth,
  20: ElementType.Earth,
  26: ElementType.Earth,
  33: ElementType.Earth,
  38: ElementType.Earth,
};

// =====================================
// DIAMOND DISTRIBUTION
// =====================================

export const DIAMOND_30: number[] = [
  50, 41, 48, 14, 6, 15, 11, 34,
];

export const DIAMOND_20: number[] = [
  32, 47, 36, 8, 18, 9, 23, 46,
];

export const DIAMOND_10: number[] = [
  59, 55, 58, 1, 57, 4, 60, 52,
];

// Helper
export function getDiamondValue(tileId: number): number {
  if (DIAMOND_30.includes(tileId)) return 30;
  if (DIAMOND_20.includes(tileId)) return 20;
  if (DIAMOND_10.includes(tileId)) return 10;
  return 0;
}

// =====================================
// ROLE RESOLUTION (PURE, DATA-DRIVEN)
// =====================================

export function resolveTileRole(tileId: number): TileRole {
  if (Object.values(START_TILES).includes(tileId)) return TileRole.START;

  for (const goals of Object.values(GOAL_PATHS)) {
    if (goals.includes(tileId)) return TileRole.GOAL;
  }

  for (const arm of Object.values(ARM_PATHS)) {
    if (arm.includes(tileId)) return TileRole.PATH;
  }

  return TileRole.DISABLED;
}
