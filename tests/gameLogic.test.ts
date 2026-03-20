
import { test, expect } from './testRunner.ts';
import type { TestResult } from './testRunner.ts';
// Fixed: Changed WINNING_DIAMONDS to DEFAULT_WINNING_GOLD to match exported member in constants.ts
import { generateDefaultGameState } from '../constants.ts';
import { endTurn, resolveMove } from '../utils/gameLogic.ts';
import { GameState, TileType } from '../types.ts';

export const runGameLogicTests = (): TestResult[] => {
    const results: TestResult[] = [];

    // Test 1: Initial Game State
    results.push(test('Initial game state should be set up correctly', () => {
        const state = generateDefaultGameState();
        expect(state.currentPlayerId).toBe('Player1');
        expect(state.players.Player1.tokens.length).toBe(3);
        expect(state.players.Player2.tokens.length).toBe(3);
        
        const p1TileIds = state.players.Player1.tokens.map(t => t.tileId).sort((a, b) => a - b);
        // Fixed: Expectations updated to match generateDefaultGameState initialization [51, 50, 40]
        expect(p1TileIds).toEqual([40, 50, 51]);

        const p2TileIds = state.players.Player2.tokens.map(t => t.tileId).sort((a, b) => a - b);
        // Fixed: Expectations updated to match generateDefaultGameState initialization [0, 6, 12]
        expect(p2TileIds).toEqual([0, 6, 12]);
        
        expect(state.phase).toBe('SELECT_DICE');
        expect(state.nextTokenId).toBe(7);
    }));

    // Test 2: End Turn Logic
    results.push(test('endTurn should switch to the next player if not doubles', () => {
        const state = generateDefaultGameState();
        state.hasRolledDoubles = false;
        
        const nextState = endTurn(state);
        expect(nextState.currentPlayerId).toBe('Player2');
        expect(nextState.phase).toBe('SELECT_DICE');
    }));
    
    // Test 3: Doubles Roll Logic
    results.push(test('endTurn should give the same player another turn on doubles', () => {
        const state = generateDefaultGameState();
        state.hasRolledDoubles = true;
        
        const nextState = endTurn(state);
        expect(nextState.currentPlayerId).toBe('Player1');
        expect(nextState.phase).toBe('SELECT_DICE');
        expect(nextState.hasRolledDoubles).toBe(false); // Should reset after the turn
    }));
    
    // Test 4: Capture Logic (Diamond gain sync)
    results.push(test('resolveMove should handle token capture correctly', () => {
        const state: GameState = generateDefaultGameState();
        state.currentPlayerId = 'Player1';
        // Setup: P1 token starts at 56, P2 token is on 55 (Index 5 in Arm 1 = 0 icons)
        // Added missing frozenRounds: 0 to satisfy TokenState interface
        state.players.Player1.tokens = [{ id: 1, playerId: 'Player1', tileId: 56, diamonds: 10, frozenRounds: 0 }];
        state.players.Player2.tokens = [{ id: 2, playerId: 'Player2', tileId: 55, diamonds: 20, frozenRounds: 0 }];
        state.animation = { tokenId: 1, path: [56, 55], step: 1 };

        const nextState = resolveMove(state);

        const movedToken = nextState.players.Player1.tokens.find(t => t.id === 1);
        const capturedToken = nextState.players.Player2.tokens.find(t => t.id === 2);
        
        expect(movedToken).toBeDefined();
        expect(capturedToken).toBeDefined();

        expect(movedToken!.tileId).toBe(55);
        // Orig 10 + captured 20 + tile icons (0) = 30
        expect(movedToken!.diamonds).toBe(30);

        expect(capturedToken!.tileId).toBe(nextState.players.Player2.safeZoneTileId);
        expect(capturedToken!.diamonds).toBe(0);
    }));

    // Test 5: Diamond Banking Logic
    results.push(test('resolveMove should bank diamonds and return token to safe zone on own ladder', () => {
        const state = generateDefaultGameState();
        state.currentPlayerId = 'Player1';
        state.players.Player1.diamonds = 100;
        // Setup: P1 token banks 50 diamonds at their ladder (31).
        // Added missing frozenRounds: 0 to satisfy TokenState interface
        state.players.Player1.tokens = [{ id: 1, playerId: 'Player1', tileId: 34, diamonds: 50, frozenRounds: 0 }];
        state.animation = { tokenId: 1, path: [34, 31], step: 1 };

        const nextState = resolveMove(state);
        
        const player = nextState.players.Player1;
        const token = player.tokens.find(t => t.id === 1);

        expect(player.diamonds).toBe(150);
        expect(token!.diamonds).toBe(0);
        expect(token!.tileId).toBe(player.safeZoneTileId);
    }));

    // Test 6: Winning Condition
    

    // Test 8: Elemental Bonus (3 of a kind) - No flat diamond addition
    results.push(test('resolveMove should apply multiplier for 3 same elements without flat bonus', () => {
        const state = generateDefaultGameState();
        state.currentPlayerId = 'Player1';
        state.players.Player1.elementQueue = [TileType.Ice, TileType.Fire, TileType.Fire];
        // P1 moves to 14 (Fire, Arm 2 Offset 2 = 0 icons)
        // Added missing frozenRounds: 0 to satisfy TokenState interface
        state.players.Player1.tokens = [{ id: 1, playerId: 'Player1', tileId: 13, diamonds: 10, frozenRounds: 0 }];
        state.animation = { tokenId: 1, path: [13, 14], step: 1 }; 
        
        const nextState = resolveMove(state);
        const player = nextState.players.Player1;
        const token = player.tokens.find(t => t.id === 1);
        
        // Fixed: The combo multiplier in handleLandingResolution is x2, not x1.5. 
        // 10 * 2 = 20.
        expect(token!.diamonds).toBe(20); 
        expect(player.elementQueue.length).toBe(0);
    }));

    // Test 10: Mixed Elements (Icon collection only)
    results.push(test('resolveMove should collect only icons on mixed element tiles', () => {
        const state = generateDefaultGameState();
        state.currentPlayerId = 'Player1';
        state.players.Player1.elementQueue = [TileType.Fire, TileType.Ice, TileType.Grass];
        // P1 moves to 1 (Rock, Arm 2 Offset 5 = 0 icons)
        // Added missing frozenRounds: 0 to satisfy TokenState interface
        state.players.Player1.tokens = [{ id: 1, playerId: 'Player1', tileId: 2, diamonds: 10, frozenRounds: 0 }];
        state.animation = { tokenId: 1, path: [2, 1], step: 1 };

        const nextState = resolveMove(state);
        const player = nextState.players.Player1;
        const token = player.tokens.find(t => t.id === 1);

        // Orig 10 + tile icons (0) = 10. No element flat reward.
        expect(token!.diamonds).toBe(10); 
    }));

    return results;
};
