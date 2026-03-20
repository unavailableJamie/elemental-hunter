
import type { GameState, PlayerID } from '../types.ts';

import { BRANCH_RULES, GOAL_PATHS } from '../boardSpec.ts';

/**
 * Standard path traversal for the board.
 * Simple traversal without truncation.
 */
export const findPath = (
    startTileId: number, 
    steps: number, 
    playerId: PlayerID, 
    gameState: GameState
): number[] => {
    const path: number[] = [startTileId];
    let currentTileId = startTileId;
    const { connections } = gameState;

    for (let i = 0; i < steps; i++) {
        let nextTileId: number | null = null;
        
        // Check for branching points (Goal entry)
        const branchRule = BRANCH_RULES.find(b => b.from === currentTileId);
        
        if (branchRule) {
            const canEnterGoal = branchRule.owner === playerId;
            nextTileId = canEnterGoal ? branchRule.toGoal : branchRule.toLoop;
        } 
        
        // Follow standard connections if no branch was taken
        if (nextTileId === null) {
            const possibleConns = connections[currentTileId];
            if (possibleConns) {
                const validConns = possibleConns.filter(c => {
                    if (!c.condition) return true;
                    if (c.condition.isPlayer && c.condition.isPlayer !== playerId) return false;
                    if (c.condition.isNotPlayer && c.condition.isNotPlayer === playerId) return false;
                    return true;
                });
                
                if (validConns.length > 0) {
                    nextTileId = validConns[0].to;
                }
            }
        }

        if (nextTileId === null) break;

        currentTileId = nextTileId;
        path.push(currentTileId);
    }
    return path;
};

/**
 * Calculates the exact number of steps required to reach the nearest stable tile.
 * A horse is considered returned to stable if it can reach or pass ANY tile in the goal set.
 */
export const getStepsToGoal = (startTileId: number, playerId: PlayerID, gameState: GameState): number => {
    const stableTiles = GOAL_PATHS[playerId] || [];
    const path = findPath(startTileId, 100, playerId, gameState);
    
    // We traverse the projected path and find the first index that hits any stable tile ID.
    for (let i = 0; i < path.length; i++) {
        if (stableTiles.includes(path[i])) {
            return i;
        }
    }
    return 999;
};

export const getDerivedDiamondValue = (): number => {
    // In the new system, value is state-dependent. 
    // This helper is kept for compatibility but should use dynamic calculation if called from UI.
    return 0; 
};
