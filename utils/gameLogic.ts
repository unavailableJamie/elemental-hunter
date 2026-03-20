
import type { GameState, TokenState, TileData, PlayerState, PlayerID } from '../types.ts';
import { TileType } from '../types.ts';
import { getStepsToGoal, findPath } from './pathfinding.ts';
import { FINAL_GOALS } from '../boardSpec.ts';
import { ELEMENTAL_TILES, EMPTY_TILE_IDS } from '../constants.ts';
import { TILE_REWARD_ATK, TILE_REWARD_MAG } from '../config/balance.ts';
import { CHARACTERS } from '../config/characters.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';




export const awardMana = (player: PlayerState, amount: number, reason: string) => {
    const prevMana = player.mana || 0;
    player.mana = Math.min(player.manaCap, prevMana + amount);
    
    const actualGained = player.mana - prevMana;
    
    if (actualGained > 0) {
        player.manaFeedbackQueue.push({
            id: Date.now() + Math.random(),
            reason: reason,
            amount: actualGained
        });
    }
};

// --- ULTIMATE CORE LOGIC ---

interface ElementGenStats {
    total: number;
    fire: number;
    ice: number;
    grass: number;
    rock: number;
}

declare global {
    interface Window {
        ELEMENT_GEN_STATS: ElementGenStats;
    }
}

// --- INSTRUMENTATION ---
if (typeof window !== 'undefined') {
    window.ELEMENT_GEN_STATS = { total: 0, fire: 0, ice: 0, grass: 0, rock: 0 };
}

const updateStats = (type: TileType) => {
    if (typeof window === 'undefined') return;
    const stats = window.ELEMENT_GEN_STATS;
    stats.total++;
    if (type === TileType.Fire) stats.fire++;
    if (type === TileType.Ice) stats.ice++;
    if (type === TileType.Grass) stats.grass++;
    if (type === TileType.Rock) stats.rock++;
};

export const addLog = (state: GameState, message: string): string[] => {
    const newLogs = [...state.logs, message];
    return newLogs.slice(-20);
};

export const getRandomElement = (): TileType => {
    const index = Math.floor(Math.random() * ELEMENTAL_TILES.length);
    const chosen = ELEMENTAL_TILES[index];
    updateStats(chosen);
    return chosen;
};

export const hasAnyLegalMove = (state: GameState, playerId: PlayerID): boolean => {
    const player = state.players[playerId];
    const diceTotal = state.dice.reduce((a, b) => a + b, 0);
    if (diceTotal === 0) return true; 

    return player.tokens.some(token => {
        if (token.frozenRounds > 0) return false;
        const path = findPath(token.tileId, diceTotal, playerId, state);
        if (path.length <= 1) return false;
        const destinationId = path[path.length - 1];
        const destinationTile = state.board.flat().find(t => t?.id === destinationId);
        const isOccupiedByFriendly = destinationTile?.type !== TileType.SafeZone && 
                                   player.tokens.some(t => t.tileId === destinationId && t.id !== token.id);
        return !isOccupiedByFriendly;
    });
};

export const endTurn = (currentState: GameState): GameState => {
    const nextState = { ...currentState };
    if (nextState.winner) return nextState;

    // RULE ADJUSTMENT: Double roll SP is now awarded immediately in App.tsx
    // Removed awardSP call from here.

    // Track metrics: Total turns and Action time for the player who just finished
    nextState.totalTurns += 1;
    const currentTime = Date.now();
    if (nextState.turnStartTime) {
        const delta = currentTime - nextState.turnStartTime;
        nextState.totalActionTime[nextState.currentPlayerId] += delta;
    }
    nextState.turnStartTime = currentTime;

    // Ultimate Extra Rolls check: Consume 1 count to loop back to SELECT_DICE
    const hasUltimateExtra = nextState.ultimateExtraRolls > 0;

    if (hasUltimateExtra) {
        nextState.ultimateExtraRolls -= 1;

        return {
            ...nextState,
            phase: 'SELECT_DICE',
            dice: [],
            diceCount: 2,
            hasRolledDoubles: false, 
            extraTurnActive: true,   
            selectedTokenId: null,
            animation: undefined,
        };
    }

    const currentPlayerId = nextState.currentPlayerId;
    const currentPlayer = nextState.players[currentPlayerId];
    
    currentPlayer.tokens.forEach(t => {
        if (t.frozenRounds > 0) {
            if (t.justFrozen) t.justFrozen = false;
            else t.frozenRounds -= 1;
        }
    });

        // HP-based win condition check
    const opponentId = currentPlayerId === 'Player1' ? 'Player2' : 'Player1';
    const opponent = nextState.players[opponentId];
    if (opponent.hp <= 0) {
        nextState.winner = currentPlayerId;
        nextState.phase = 'END';
        nextState.matchEndTime = Date.now();
        nextState.logs = addLog(nextState, `Game Over! ${currentPlayer.name} wins by knockout!`);
        return nextState;
    }

    if (currentPlayerId === 'Player2') {
        if (nextState.currentRound >= nextState.maxRounds) {
            const p1 = nextState.players.Player1;
            const p2 = nextState.players.Player2;
            let winnerId: PlayerID = 'Player2';
            let reason = 'Highest HP';

            if (p1.hp > p2.hp) {
                winnerId = 'Player1';
            } else if (p2.hp > p1.hp) {
                winnerId = 'Player2';
            } else {
                winnerId = 'Player2'; reason = 'Tie-break: Last Mover Advantage';
            }
            nextState.winner = winnerId;
            nextState.phase = 'END';
            nextState.matchEndTime = Date.now(); // Record match end time
            nextState.logs = addLog(nextState, `Game Over! ${nextState.players[winnerId].name} wins. (${reason})`);
            return nextState;
        }
        nextState.currentRound += 1;
        // Decrement double roll cooldown for all active players at round boundary
        (['Player1', 'Player2'] as PlayerID[]).forEach(pId => {
            if (nextState.players[pId].doubleRollCooldown > 0) {
                nextState.players[pId].doubleRollCooldown -= 1;
            }
        });
        nextState.currentPlayerId = 'Player1';
    } else {
        nextState.currentPlayerId = 'Player2';
    }

    // Reset ultimate counts for the new turn
    nextState.ultimateExtraRolls = 0;

    return {
        ...nextState,
        phase: 'SELECT_DICE',
        dice: [],
        diceCount: 2,
        hasRolledDoubles: false,
        extraTurnActive: false,
        selectedTokenId: null,
        animation: undefined,
        consecutiveRollsThisTurn: 0,
    };
};

export const processCombos = (state: GameState, player: PlayerState) => {
    let queue = player.elementQueue;
    let comboType = '';
    let foundCombo = true;

    // Loop until no more combos are found (Cascading)
    while (foundCombo) {
        foundCombo = false;
        if (queue.length < 3) break;

        // Scan the entire queue for patterns
        for (let i = 0; i < queue.length; i++) {
            // Priority 1: C3 (Triple Identical)
            if (i + 2 < queue.length) {
                const slice3 = queue.slice(i, i + 3);
                if (slice3.every(el => el === slice3[0])) {
                    foundCombo = true;
                    comboType = 'C3 (Triple Threat)';
                    
                    // Remove the 3 elements
                    const newQueue = [...queue];
                    newQueue.splice(i, 3);
                    queue = newQueue;
                    player.elementQueue = queue; // Update player state immediately
                    break; // Restart scan from beginning of new queue
                }
            }

            // Priority 2: C4 (Quad Unique)
            if (i + 3 < queue.length) {
                const slice4 = queue.slice(i, i + 4);
                const uniqueElements = new Set(slice4);
                if (uniqueElements.size === 4) {
                    foundCombo = true;
                    comboType = 'C4 (Elemental Master)';
                    
                    // Remove the 4 elements
                    const newQueue = [...queue];
                    newQueue.splice(i, 4);
                    queue = newQueue;
                    player.elementQueue = queue; // Update player state immediately
                    break; // Restart scan from beginning of new queue
                }
            }
        }

        // If a combo was found in this pass, apply rewards immediately
        if (foundCombo) {
            player.comboCount += 1;
            const maxTier = LEVEL_CONFIGS[state.selectedLevel].maxComboTiers;
            player.comboTier = Math.min(maxTier, player.comboTier + 1);
            state.logs = addLog(state, `COMBO #${player.comboCount} ACHIEVED: ${comboType}!`);

            const character = CHARACTERS[player.config.characterId];
            const rewards: string[] = [];

            if (character) {
                // 1. Always apply Base Reward (Tier 1 Effect: +150 ATK) for EVERY combo
                character.comboRewards.tier1.effect({ state, playerId: player.id });
                state.logs = addLog(state, `COMBO REWARD: ${character.comboRewards.tier1.title} applied!`);
                rewards.push(character.comboRewards.tier1.description);

                // 2. Check for Tier 2 Unlock (Milestone: 2nd Combo) - only if level supports it
                if (maxTier >= 2 && player.comboCount === 2) {
                    character.comboRewards.tier2.effect({ state, playerId: player.id });
                    state.logs = addLog(state, `TIER 2 UNLOCKED: ${character.comboRewards.tier2.title}!`);
                    rewards.push(character.comboRewards.tier2.description);
                }

                // 3. Check for Tier 3 Unlock (Milestone: 3rd Combo) - only if level supports it
                if (maxTier >= 3 && player.comboCount === 3) {
                    character.comboRewards.tier3.effect({ state, playerId: player.id });
                    state.logs = addLog(state, `TIER 3 UNLOCKED: ${character.comboRewards.tier3.title}!`);
                    rewards.push(character.comboRewards.tier3.description);
                }
            }

            // Update announcement (will show the latest combo if multiple trigger in one turn)
            state.comboAnnouncement = {
                type: comboType,
                rewards: rewards
            };
        }
    }
};

const handleLandingResolution = (state: GameState, token: TokenState, tile: TileData, player: PlayerState): { didDeposit: boolean, needsEmptyTilePopup?: boolean, needsGoalRewardPopup?: boolean } => {
    const opponentId = player.id === 'Player1' ? 'Player2' : 'Player1';
    const opponent = state.players[opponentId];

    const isStableTile = tile.id === FINAL_GOALS[player.id];
    if (isStableTile) {
        player.finishedHorseCount += 1;
        
        // Damage and Teleport logic moved to App.tsx handleGoalRewardResolve
        // to ensure combo bonuses are applied BEFORE damage calculation.

        return { didDeposit: true, needsGoalRewardPopup: true };
    }

    const capturedTokenIndex = opponent.tokens.findIndex((t: TokenState) => t.tileId === tile.id);
    const kickOccurred = capturedTokenIndex !== -1 && tile.type !== TileType.SafeZone;

    if (kickOccurred) {
        const capturedToken = opponent.tokens[capturedTokenIndex];
        
        // NEW RULE: Damage = Horse A's ATK
        const damage = token.atk;
        player.kickCount += 1;

        if (damage > 0) {
            opponent.hp -= damage;
            state.logs = addLog(state, `${player.name} kicked ${opponent.name} for ${damage} damage!`);
        } else {
            state.logs = addLog(state, `${player.name} kicked ${opponent.name} but dealt no damage.`);
        }

        // NEW RULE: Horse B sent to nearest safe zone behind its current position
        const opponentPath = findPath(opponent.safeZoneTileId, 100, opponentId, state);
        const currentIndex = opponentPath.indexOf(capturedToken.tileId);
        
        let targetTileId = opponent.safeZoneTileId;
        if (currentIndex !== -1) {
            // Search backwards for SafeZone
            for (let i = currentIndex - 1; i >= 0; i--) {
                const tileId = opponentPath[i];
                const tile = state.board.flat().find(t => t?.id === tileId);
                if (tile && tile.type === TileType.SafeZone) {
                    targetTileId = tileId;
                    break;
                }
            }
        }

        capturedToken.tileId = targetTileId;
        
        return { didDeposit: false };
    }

    // Check for empty tile
    if (EMPTY_TILE_IDS.includes(tile.id)) {
        player.emptyTileVisits += 1;
        state.logs = addLog(state, `${player.name} landed on an EMPTY TILE!`);
        return { didDeposit: false, needsEmptyTilePopup: true };
    }

    const pickedElement = tile.currentElement;
    if (pickedElement) {
        const multiplier = player.tileGainMultiplier || 1;

        if (pickedElement === player.elementAffinity) {
            const character = CHARACTERS[player.config.characterId];
            const atkReward = (character?.atk ?? TILE_REWARD_ATK) * multiplier;
            token.atk += atkReward;
            state.logs = addLog(state, `${player.name}'s horse gained ${atkReward} ATK (Affinity Match).`);
        } else {
            const character = CHARACTERS[player.config.characterId];
            const magReward = (character?.mag ?? TILE_REWARD_MAG) * multiplier;
            awardMana(player, magReward, 'Non-Affinity');
            state.logs = addLog(state, `${player.name} gained ${magReward} MAG.`);
        }

        player.elementQueue.push(pickedElement);
        if (player.elementQueue.length > player.config.maxElementQueue) player.elementQueue.shift();
        
        // Check for combos after adding element
        processCombos(state, player);
        
        tile.currentElement = null;
    }

    return { didDeposit: false };
};

export const resolveMove = (currentState: GameState): GameState => {
    const newState: GameState = JSON.parse(JSON.stringify(currentState));
    const { animation, currentPlayerId } = newState;
    if (!animation) return currentState;

    const sourceTileId = animation.path[0];
    const player = newState.players[currentPlayerId];
    const tokenToMove = player.tokens.find((t: TokenState) => t.id === animation.tokenId);
    if (!tokenToMove) return currentState;

    const diceTotal = newState.dice.reduce((a, b) => a + b, 0);
    const stepsToGoal = getStepsToGoal(animation.path[0], player.id, newState);

    let finalTileId: number;
    let needsPopup = false;
    let needsGoalPopup = false;

    if (diceTotal >= stepsToGoal) {
        finalTileId = FINAL_GOALS[player.id];
        tokenToMove.tileId = finalTileId;
        const landedTile = newState.board.flat().find((tile: TileData | null) => tile && tile.id === finalTileId);
        if (landedTile) {
            const res = handleLandingResolution(newState, tokenToMove, landedTile, player);
            if (res.needsEmptyTilePopup) needsPopup = true;
            if (res.needsGoalRewardPopup) needsGoalPopup = true;
        }
    } else {
        finalTileId = animation.path[animation.path.length - 1];
        tokenToMove.tileId = finalTileId;
        const landedTile = newState.board.flat().find((tile: TileData | null) => tile && tile.id === finalTileId);
        if (landedTile) {
            const res = handleLandingResolution(newState, tokenToMove, landedTile, player);
            if (res.needsEmptyTilePopup) needsPopup = true;
            if (res.needsGoalRewardPopup) needsGoalPopup = true;
        }
    }

    const sourceTile = newState.board.flat().find(t => t?.id === sourceTileId);
    if (sourceTile && ELEMENTAL_TILES.includes(sourceTile.type) && sourceTile.currentElement === null) {
        sourceTile.currentElement = sourceTile.type;
    }

    if (needsPopup) {
        newState.phase = 'EMPTY_TILE_INTERACTION';
        newState.isEmptyTilePopupMinimized = false;
        newState.animation = undefined;
        return newState;
    }

    if (needsGoalPopup) {
        newState.phase = 'GOAL_REWARD_SELECTION';
        newState.animation = undefined;
        return newState;
    }

    return endTurn(newState);
};
