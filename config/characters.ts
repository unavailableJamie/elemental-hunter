
import { GameState, PlayerID } from '../types.ts';
import {
  COMBO_T1_ATK_BONUS,
  COMBO_T3_ATK_MULTIPLIER,
  ULTIMATE_COST_EXTRA_ROLL,
  ULTIMATE_COST_TELEPORT,
} from './balance.ts';

export interface ComboRewardContext {
    state: GameState;
    playerId: PlayerID;
}

export type ComboRewardEffect = (ctx: ComboRewardContext) => void;

export interface UltimateDefinition {
    name: string;
    description: string;
    cost: number;
    activate: (state: GameState, playerId: PlayerID) => GameState;
}

export const ULTIMATES: Record<string, UltimateDefinition> = {
    extraRoll: {
        name: 'Extra Roll',
        description: 'Gain +1 additional dice roll immediately.',
        cost: ULTIMATE_COST_EXTRA_ROLL,
        activate: (state) => {
            const newState = { ...state };
            newState.ultimateExtraRolls += 1;
            return newState;
        }
    },
    teleport: {
        name: 'Quantum Leap',
        description: 'Teleport any of your tokens to any empty tile.',
        cost: ULTIMATE_COST_TELEPORT,
        activate: (state) => {
            const newState = { ...state };
            // Phase change is handled in App.tsx or here if we move logic
            // But for now, we just return state, App.tsx handles the phase switch
            return newState;
        }
    }
};

export interface CharacterDefinition {
    id: string;
    name: string;
    description: string;
    /** ATK stat: amount of ATK a token gains when landing on an Affinity-matching tile */
    atk: number;
    /** MAG stat: amount of MAG the player gains when landing on a non-Affinity tile */
    mag: number;
    /** HP stat: player's starting HP when using this character */
    hp: number;
    comboRewards: {
        tier1: { title: string; description: string; effect: ComboRewardEffect };
        tier2: { title: string; description: string; effect: ComboRewardEffect };
        tier3: { title: string; description: string; effect: ComboRewardEffect };
    };
    defaultUltimate: string; // Key into ULTIMATES
}

export const CHARACTERS: Record<string, CharacterDefinition> = {
    'char1': {
        id: 'char1',
        name: 'Pillow',
        description: 'A balanced fighter with strong ATK boosts.',
        atk: 30,  // ATK gained per Affinity tile landing
        mag: 10,  // MAG gained per non-Affinity tile landing
        hp: 1000, // Player starting HP
        comboRewards: {
            tier1: {
                title: 'Power Surge',
                description: `+${COMBO_T1_ATK_BONUS} ATK to all horses`,
                effect: ({ state, playerId }) => {
                    state.players[playerId].tokens.forEach(t => {
                        t.atk += COMBO_T1_ATK_BONUS;
                    });
                }
            },
            tier2: {
                title: 'Double Harvest',
                description: 'Double tile ATK/MAG gains',
                effect: ({ state, playerId }) => {
                    state.players[playerId].tileGainMultiplier = 2;
                }
            },
            tier3: {
                title: 'Absolute Might',
                description: 'x1.5 current ATK of all horses',
                effect: ({ state, playerId }) => {
                    state.players[playerId].tokens.forEach(t => {
                        t.atk = Math.floor(t.atk * COMBO_T3_ATK_MULTIPLIER);
                    });
                }
            }
        },
        defaultUltimate: 'extraRoll'
    }
};
