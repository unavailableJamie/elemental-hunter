

import { getDiamondValue, resolveTileRole, ARM_PATHS } from '../boardSpec.ts';

/**
 * DEBUG INTERFACE
 */
export interface DiamondDebugInfo {
    tileId: number;
    armId: number | null;
    armStartTileId: number | null;
    computedOffset: number;
    diamondCount: number;
}

// Map of arms in index-based order to match PlayerState.armId from constants.ts
// Based on constants.ts: Player1 has armId 3 (starts 51), Player2 has armId 1 (starts 0).
// ARM_PATHS: Player1 (51), Player2 (0), Player3 (54), Player4 (5)
export const FULL_ARM_PATHS = [
    ARM_PATHS.Player4, // 0
    ARM_PATHS.Player2, // 1
    ARM_PATHS.Player3, // 2
    ARM_PATHS.Player1  // 3
];

/**
 * AUTHORITATIVE DIAMOND ICON PLACEMENT
 * Derived strictly from boardSpec.ts
 */
export function getDiamondIcons(tileId: number): DiamondDebugInfo {
    const role = resolveTileRole(tileId);
    const value = getDiamondValue(tileId);

    if (role !== 'PATH' || value === 0) {
        return { tileId, armId: null, armStartTileId: null, computedOffset: -1, diamondCount: 0 };
    }

    // Determine which arm this tile belongs to for debugging and start marker logic
    let foundArmId: number | null = null;
    FULL_ARM_PATHS.forEach((path, idx) => {
        if (path.includes(tileId)) {
            foundArmId = idx;
        }
    });

    return { 
        tileId, 
        armId: foundArmId, 
        armStartTileId: foundArmId !== null ? FULL_ARM_PATHS[foundArmId][0] : null, 
        computedOffset: 0, 
        diamondCount: value 
    };
}
