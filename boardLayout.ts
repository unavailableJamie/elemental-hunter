
export interface TilePos {
  x: number;
  y: number;
}

/**
 * AUTHORITATIVE TILE POSITIONS
 * Symmetric Cross (+) shape on an 11x11 grid (0-10).
 * Center area surrounding (5, 5).
 */
export const TILE_POSITIONS: Record<number, TilePos> = {
  // --- PLAYER 2 ARM (NORTH) ---
  // Perimeter In (West side)
  0: { x: 4, y: 0 },
  6: { x: 4, y: 1 },
  12: { x: 4, y: 2 },
  18: { x: 4, y: 3 },
  57: { x: 4, y: 4 },
  // Perimeter Out (South side of West Arm)
  21: { x: 3, y: 4 },
  15: { x: 2, y: 4 },
  9: { x: 1, y: 4 },
  3: { x: 0, y: 4 },
  4: { x: 0, y: 5 }, // Turn corner

  // --- PLAYER 4 ARM (WEST) ---
  // Perimeter In (South side)
  5: { x: 0, y: 6 },
  11: { x: 1, y: 6 },
  17: { x: 2, y: 6 },
  23: { x: 3, y: 6 },
  60: { x: 4, y: 6 },
  // Perimeter Out (East side of South Arm)
  24: { x: 4, y: 7 },
  34: { x: 4, y: 8 },
  46: { x: 4, y: 9 },
  53: { x: 4, y: 10 },
  52: { x: 5, y: 10 }, // Turn corner

  // --- PLAYER 1 ARM (SOUTH) ---
  // Perimeter In (East side)
  51: { x: 6, y: 10 },
  50: { x: 6, y: 9 },
  40: { x: 6, y: 8 },
  32: { x: 6, y: 7 },
  59: { x: 6, y: 6 },
  // Perimeter Out (North side of East Arm)
  35: { x: 7, y: 6 },
  41: { x: 8, y: 6 },
  47: { x: 9, y: 6 },
  56: { x: 10, y: 6 },
  55: { x: 10, y: 5 }, // Turn corner

  // --- PLAYER 3 ARM (EAST) ---
  // Perimeter In (North side)
  54: { x: 10, y: 4 },
  48: { x: 9, y: 4 },
  42: { x: 8, y: 4 },
  36: { x: 7, y: 4 },
  58: { x: 6, y: 4 },
  // Perimeter Out (West side of North Arm)
  20: { x: 6, y: 3 },
  14: { x: 6, y: 2 },
  8: { x: 6, y: 1 },
  2: { x: 6, y: 0 },
  1: { x: 5, y: 0 }, // Turn corner

  // --- GOAL PATHS ---
  // North Goal (P2)
  7: { x: 5, y: 1 },
  13: { x: 5, y: 2 },
  19: { x: 5, y: 3 },
  25: { x: 5, y: 4 },
  // West Goal (P4)
  10: { x: 1, y: 5 },
  16: { x: 2, y: 5 },
  22: { x: 3, y: 5 },
  27: { x: 4, y: 5 },
  // South Goal (P1)
  33: { x: 5, y: 9 },
  28: { x: 5, y: 8 },
  26: { x: 5, y: 7 },
  31: { x: 5, y: 6 },
  // East Goal (P3)
  49: { x: 9, y: 5 },
  43: { x: 8, y: 5 },
  37: { x: 7, y: 5 },
  30: { x: 6, y: 5 },
};
