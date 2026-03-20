
import { TileData, TileRole } from '../types.ts';
import { resolveTileRole as specResolveRole } from '../boardSpec.ts';

/**
 * CENTRAL ROLE RESOLVER
 * Delegates to boardSpec.ts for authoritative semantics.
 */
export function resolveTileRole(tile: TileData): TileRole {
    // Map boardSpec's TileRole to our app's TileRole
    return specResolveRole(tile.id) as TileRole;
}

/**
 * Applies role resolution to the entire board.
 * MUST be called whenever board structure changes.
 */
export function applyRoleResolution(board: (TileData | null)[][]): (TileData | null)[][] {
    return board.map(row => row.map(tile => {
        if (!tile) return null;
        return {
            ...tile,
            role: resolveTileRole(tile)
        };
    }));
}
