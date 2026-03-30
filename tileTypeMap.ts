
/**
 * TILE TYPE MAP — authoritative source for element tile assignment.
 *
 * Edit the type string for each tile ID.
 * Valid types: 'fire' | 'waterice' | 'grasswood' | 'earth' | 'normal'
 *
 * 'normal' = empty/tool tile (hammer icon, triggers tool popup when landed on).
 * All three names (normal / empty / tool) refer to the same tile kind.
 *
 * NOTE: Start tiles (0,5,51,54) and goal-path tiles (7,10,13,16,19,22,25,26,27,28,30,31,33,37,43,49)
 * are visually overridden to SafeZone / Ladder / Center automatically — their type here only
 * affects game logic (element pickup) if you explicitly want that.
 *
 * Board grid reference (col→, row↓):
 *
 *  col:  0     1     2     3     4     5     6     7     8     9    10
 *  r0:                           [0]   [1]   [2]
 *  r1:                           [6]   [7]   [8]
 *  r2:                           [12]  [13]  [14]
 *  r3:                           [18]  [19]  [20]
 *  r4:  [3]   [9]  [15]  [21]  [57]  [25]  [58]  [36]  [42]  [48]  [54]
 *  r5:  [4]  [10]  [16]  [22]  [27]   ---  [30]  [37]  [43]  [49]  [55]
 *  r6:  [5]  [11]  [17]  [23]  [60]  [31]  [59]  [35]  [41]  [47]  [56]
 *  r7:                           [24]  [26]  [32]
 *  r8:                           [34]  [28]  [40]
 *  r9:                           [46]  [33]  [50]
 * r10:                           [53]  [52]  [51]
 */

export type TileTypeLabel = 'fire' | 'waterice' | 'grasswood' | 'earth' | 'normal';

export const TILE_TYPE_MAP: Record<number, TileTypeLabel> = {
  // ── col 4-6, rows 0-3  (P2 arm in + P3 arm out) ──────────────────
  0:  'normal',    // (4,0)  P2 START → auto SafeZone
  1:  'earth',    // (5,0)  P3 arm turn corner
  2:  'waterice',  // (6,0)
  6:  'grasswood',      // (4,1)
  7:  'normal',  // (5,1)  P2 goal[0] → auto Ladder
  8:  'fire',    // (6,1)
  12: 'normal', // (4,2)
  13: 'normal',      // (5,2)  P2 goal[1] → auto Ladder
  14: 'normal',  // (6,2)
  18: 'fire',      // (4,3)
  19: 'normal',  // (5,3)  P2 goal[2] → auto Ladder
  20: 'grasswood',     // (6,3)

  // ── row 4  (full horizontal strip) ───────────────────────────────
  3:  'fire',    // (0,4)
  9:  'normal',     // (1,4)
  15: 'grasswood',     // (2,4)
  21: 'earth',    // (3,4)
  57: 'waterice',    // (4,4)  P2↔P3 junction
  25: 'normal',  // (5,4)  P2 goal[3] → auto Center
  58: 'earth',    // (6,4)  P3↔P2 junction
  36: 'waterice',  // (7,4)
  42: 'fire',    // (8,4)
  48: 'grasswood',    // (9,4)
  54: 'normal',    // (10,4) P3 START → auto SafeZone

  // ── row 5  (full horizontal strip) ───────────────────────────────
  4:  'normal',     // (0,5)  P2 arm turn corner
  10: 'normal',    // (1,5)  P4 goal[0] → auto Ladder
  16: 'normal', // (2,5)  P4 goal[1] → auto Ladder
  22: 'normal', // (3,5)  P4 goal[2] → auto Ladder
  27: 'normal', // (4,5)  P4 goal[3] → auto Center
  // (5,5) = empty center, no tile
  30: 'normal',    // (6,5)  P3 goal[3] → auto Center
  37: 'normal',    // (7,5)  P3 goal[2] → auto Ladder
  43: 'normal',    // (8,5)  P3 goal[1] → auto Ladder
  49: 'normal',    // (9,5)  P3 goal[0] → auto Ladder
  55: 'normal',    // (10,5) P1 arm turn corner

  // ── row 6  (full horizontal strip) ───────────────────────────────
  5:  'normal',    // (0,6)  P4 START → auto SafeZone
  11: 'waterice',    // (1,6)
  17: 'earth',    // (2,6)
  23: 'grasswood',    // (3,6)
  60: 'fire',    // (4,6)  P4↔P1 junction
  31: 'normal',    // (5,6)  P1 goal[3] → auto Center
  59: 'grasswood',    // (6,6)  P1↔P4 junction
  35: 'fire',      // (7,6)
  41: 'waterice',    // (8,6)
  47: 'normal',    // (9,6)
  56: 'earth',    // (10,6)

  // ── col 4-6, rows 7-10  (P4 arm out + P1 arm in) ─────────────────
  24: 'waterice',      // (4,7)
  26: 'normal',     // (5,7)  P1 goal[2] → auto Ladder
  32: 'earth',  // (6,7)
  34: 'normal', // (4,8)
  28: 'normal',    // (5,8)  P1 goal[1] → auto Ladder
  40: 'normal',      // (6,8)
  46: 'earth',    // (4,9)
  33: 'normal',     // (5,9)  P1 goal[0] → auto Ladder
  50: 'waterice',    // (6,9)
  53: 'grasswood',    // (4,10)
  52: 'fire',    // (5,10) P4 arm turn corner
  51: 'normal',    // (6,10) P1 START → auto SafeZone
};
