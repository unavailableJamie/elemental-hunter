
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CharacterSystemApp } from './character/CharacterSystemApp.tsx';
import { LobbyScene } from './character/scenes/LobbyScene.tsx';
import { TutorialFlow } from './tutorial/TutorialFlow.tsx';
import { PhaserGame } from './phaser/PhaserGame.tsx';
import { EditTileModal } from './components/EditTileModal.tsx';
import { AddTokenModal } from './components/AddTokenModal.tsx';
import { TestingDashboard } from './components/TestingDashboard.tsx';
import { PlayerInfo } from './components/PlayerInfo.tsx';
import { GameLog } from './components/GameLog.tsx';
import { TrophyIcon, DiceIcon, AtkPip } from './components/Icons.tsx';
import { ElementIcon } from './components/PlayerInfo.tsx';
import { Dice } from './components/Dice.tsx';
import { LevelSelect } from './components/LevelSelect.tsx';
import type { GameState, PlayerID, TokenState, TileData, MapData, Connection, GameLevel } from './types.ts';
import { TileType } from './types.ts';
import {  generateDefaultGameState, TILE_SIZE } from './constants.ts';
import { findPath, getStepsToGoal } from './utils/pathfinding.ts';
import { resolveMove, endTurn, addLog, hasAnyLegalMove, processCombos, awardMana } from './utils/gameLogic.ts';
import { ULTIMATES, CHARACTERS } from './config/characters.ts';
import { DEFAULT_LAYOUT, type LayoutConfig } from './layoutConfig.ts';
import { LEVEL_CONFIGS } from './config/levels.ts';
import { DOUBLE_ROLL_COOLDOWN_ROUNDS, MAX_CONSECUTIVE_ROLLS } from './config/balance.ts';
import { EmptyTilePopup } from './components/EmptyTilePopup.tsx';
import { GoalRewardPopup } from './components/GoalRewardPopup.tsx';
import { applyRoleResolution } from './utils/roleResolver.ts';
import { TILE_POSITIONS } from './boardLayout.ts';
import { FINAL_GOALS } from './boardSpec.ts';

const ANIMATION_STEP_DELAY = 60;
const POWER_ROLL_CYCLE = 2625;
const POWER_RANGES: [number, number][] = [[2, 4], [5, 7], [7, 9], [10, 12]];

interface VisualEffect {
    id: number;
    type: 'kick' | 'streak' | 'atk';
    x: number;
    y: number;
    text: string;
}

const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const ss = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
};

const MatchSummary: React.FC<{ gameState: GameState, onPlayAgain: () => void }> = ({ gameState, onPlayAgain }) => {
    const p1 = gameState.players.Player1;
    const p2 = gameState.players.Player2;
    const winnerId = gameState.winner!;
    const matchTime = (gameState.matchEndTime || Date.now()) - (gameState.matchStartTime || Date.now());
    
    const isP1Winner = winnerId === 'Player1';
    const isP2Winner = winnerId === 'Player2';

    return (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[200] text-white rounded-lg backdrop-blur-md shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 p-8 text-center overflow-y-auto overflow-x-hidden">
            <h2 className="text-4xl font-black mb-1 tracking-tighter uppercase italic text-yellow-400 drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                MATCH SUMMARY
            </h2>
            
            <div className="flex gap-8 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                <div className="flex gap-2">
                    <span className="opacity-60">Total Turns:</span>
                    <span className="text-white">{gameState.totalTurns}</span>
                </div>
                <div className="w-px h-full bg-white/10"></div>
                <div className="flex gap-2">
                    <span className="opacity-60">Match Time:</span>
                    <span className="text-white">{formatDuration(matchTime)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl relative">
                {/* Winner side highlight - purely visual bg */}
                <div className={`absolute top-0 bottom-0 ${isP1Winner ? 'left-0' : 'right-0'} w-1/2 bg-yellow-400/5 blur-[100px] pointer-events-none rounded-full`}></div>

                {/* Player 1 Card */}
                <div className={`flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all duration-700 ${isP1Winner ? 'bg-red-900/30 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] scale-105 z-10' : 'bg-gray-900/40 border-white/5 opacity-50 grayscale scale-95'}`}>
                    {isP1Winner && <TrophyIcon className="w-12 h-12 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />}
                    <span className={`text-xs font-black uppercase tracking-widest mb-1 ${isP1Winner ? 'text-red-400' : 'text-gray-500'}`}>RED PLAYER</span>
                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-6 ${isP1Winner ? 'text-white' : 'text-gray-400'}`}>{p1.name}</h3>
                    
                    <div className="w-full space-y-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Total ATK</span>
                            <div className={`text-5xl font-black flex items-center gap-2 ${isP1Winner ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-gray-600'}`}>
                                {p1.tokens.reduce((acc, t) => acc + t.atk, 0)}
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                    <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 w-full text-[11px] font-black uppercase tracking-wider">
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Action Time</span>
                                <span>{formatDuration(gameState.totalActionTime.Player1)}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Returned Horses</span>
                                <span>{p1.finishedHorseCount}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Kicks Performed</span>
                                <span>{p1.kickCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Player 2 Card */}
                <div className={`flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all duration-700 ${isP2Winner ? 'bg-green-900/30 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] scale-105 z-10' : 'bg-gray-900/40 border-white/5 opacity-50 grayscale scale-95'}`}>
                    {isP2Winner && <TrophyIcon className="w-12 h-12 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />}
                    <span className={`text-xs font-black uppercase tracking-widest mb-1 ${isP2Winner ? 'text-green-400' : 'text-gray-500'}`}>GREEN PLAYER</span>
                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-6 ${isP2Winner ? 'text-white' : 'text-gray-400'}`}>{p2.name}</h3>
                    
                    <div className="w-full space-y-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Total ATK</span>
                            <div className={`text-5xl font-black flex items-center gap-2 ${isP2Winner ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-gray-600'}`}>
                                {p2.tokens.reduce((acc, t) => acc + t.atk, 0)}
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                    <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 w-full text-[11px] font-black uppercase tracking-wider">
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Action Time</span>
                                <span>{formatDuration(gameState.totalActionTime.Player2)}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Returned Horses</span>
                                <span>{p2.finishedHorseCount}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                                <span className="opacity-40">Kicks Performed</span>
                                <span>{p2.kickCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
                <button onClick={onPlayAgain} className="group relative bg-yellow-400 hover:bg-yellow-300 text-black font-black py-6 px-16 rounded-2xl text-2xl uppercase tracking-tighter shadow-[0_20px_50px_rgba(250,204,21,0.3)] transition-all hover:scale-105 active:scale-95">
                    <span className="relative z-10">Chơi lại</span>
                    <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
                <span className="mt-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Victory is temporary, skill is eternal</span>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [tileGoldEnabled, setTileGoldEnabled] = useState(true);
    const [gameKey, setGameKey] = useState(0);
    const [gameState, setGameState] = useState<GameState>(() => {
        const state = generateDefaultGameState(true, 'Lv3');
        state.phase = 'LEVEL_SELECT';
        return state;
    });
    const [appScene, setAppScene] = useState<'lobby' | 'game' | 'character'>('lobby');
    const [activeCharId, setActiveCharId] = useState<string>('pillow');
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTile, setEditingTile] = useState<TileData | null>(null);
    const [previewTileId, setPreviewTileId] = useState<number | null>(null);
    const [isAddingTokenForPlayer, setIsAddingTokenForPlayer] = useState<PlayerID | null>(null);
    const [isMoveValid, setIsMoveValid] = useState<boolean>(true);
    const [activeView, setActiveView] = useState<'game' | 'testing'>('game');
    const [showGoldDoublePopup, setShowGoldDoublePopup] = useState(false);
    
    // Ultimate Activation Feedback State
    const [ultimateActivationName, setUltimateActivationName] = useState<string | null>(null);
    const [chibiTooltip, setChibiTooltip] = useState<'Player1' | 'Player2' | null>(null);
    const [showUltTooltip, setShowUltTooltip] = useState(false);
    const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
    
    // UI enhancements state
    const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
    const nextEffectIdRef = useRef(0);
    const [animateRound, setAnimateRound] = useState(false);
    const prevRoundRef = useRef(gameState.currentRound);
    const prevStateRef = useRef<GameState>(gameState);

    // Chibi turn-flash animation
    const [newTurnFlash, setNewTurnFlash] = useState<string | null>(null);
    // No-moves banner (auto-end-turn after 2s)
    const [noMovesBannerVisible, setNoMovesBannerVisible] = useState(false);
    // MAG feedback near ult button
    const [magFeedbacks, setMagFeedbacks] = useState<Array<{ id: number; amount: number }>>([]);
    // ATK / MAG Phaser scene animation events
    const [atkAbsorbEvent, setAtkAbsorbEvent] = useState<{ tileId: number; tokenId: number; amount: number; eid: number } | undefined>();
    const [magAbsorbEvent, setMagAbsorbEvent] = useState<{ tileId: number; tokenId: number; eid: number } | undefined>();
    // Element added to queue → swirling light fly-to HUD
    const [elementAddedEvent, setElementAddedEvent] = useState<{ tileId: number; tokenId: number; element: string; playerId: string; eid: number } | undefined>();
    // Goal reward animation coordination
    const [isGoalAnimating, setIsGoalAnimating] = useState(false);
    const [goalReachedEvent, setGoalReachedEvent] = useState<{ playerId: string; eid: number } | undefined>();
    const [goalElementChosenEvent, setGoalElementChosenEvent] = useState<{ playerId: string; element: string; tokenId: number; eid: number } | undefined>();
    
    

    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationTimeoutRef = useRef<number | null>(null);

    // ── Goal reward: detect phase entry, fire glow sequence ──────────────
    const prevGoalPhaseRef = useRef<string>('');
    useEffect(() => {
        if (gameState.phase === 'GOAL_REWARD_SELECTION' && prevGoalPhaseRef.current !== 'GOAL_REWARD_SELECTION') {
            setIsGoalAnimating(true);
            setGoalReachedEvent({ playerId: gameState.currentPlayerId, eid: Date.now() });
        }
        prevGoalPhaseRef.current = gameState.phase;
    }, [gameState.phase, gameState.currentPlayerId]);

    const handleGoalAnimationDone = useCallback(() => {
        setIsGoalAnimating(false);
    }, []);

    // ── Chibi turn-flash ──────────────────────────────────────────────────
    useEffect(() => {
        setNewTurnFlash(gameState.currentPlayerId);
        const t = setTimeout(() => setNewTurnFlash(null), 700);
        return () => clearTimeout(t);
    }, [gameState.currentPlayerId]);

    // ── Tooltip auto-close 5s ─────────────────────────────────────────────
    useEffect(() => {
        if (!chibiTooltip) return;
        const t = setTimeout(() => setChibiTooltip(null), 5000);
        return () => clearTimeout(t);
    }, [chibiTooltip]);

    // ── Mana feedback queue → near ult button (delayed to sync with Phaser bubble fly) ──
    useEffect(() => {
        const queue = gameState.players[gameState.currentPlayerId].manaFeedbackQueue;
        if (queue.length === 0) return;
        const newFbs = queue.map(fb => ({ id: fb.id, amount: fb.amount }));
        handleClearManaFeedback(gameState.currentPlayerId);
        // Delay display until the MAG bubble finishes flying to the ult button (~1600ms)
        const showTimer = setTimeout(() => {
            setMagFeedbacks(prev => [...prev, ...newFbs]);
            newFbs.forEach(fb => {
                setTimeout(() => setMagFeedbacks(curr => curr.filter(f => f.id !== fb.id)), 2000);
            });
        }, 1600);
        return () => clearTimeout(showTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.players.Player1.manaFeedbackQueue.length, gameState.players.Player2.manaFeedbackQueue.length]);

    // ── Power Roll state (lifted from PlayerInfo) ──────────────────────────
    const [isRolling, setIsRolling] = useState(false);
    const [rollProgress, setRollProgress] = useState(0);
    const rollStartTimeRef = useRef<number | null>(null);
    const rollRafRef = useRef<number | null>(null);

    const tickRollProgress = () => {
        if (rollStartTimeRef.current !== null) {
            const elapsed = Date.now() - rollStartTimeRef.current;
            const t = (elapsed % POWER_ROLL_CYCLE) / POWER_ROLL_CYCLE;
            setRollProgress(1 - Math.abs(2 * t - 1));
            rollRafRef.current = requestAnimationFrame(tickRollProgress);
        }
    };

    const handleToggleRoll = () => {
        if (gameState.phase !== 'SELECT_DICE') return;
        if (!isRolling) {
            setIsRolling(true);
            rollStartTimeRef.current = Date.now();
            rollRafRef.current = requestAnimationFrame(tickRollProgress);
        } else {
            if (rollRafRef.current) cancelAnimationFrame(rollRafRef.current);
            const finalProgress = rollProgress;
            setIsRolling(false);
            rollStartTimeRef.current = null;
            setRollProgress(0);
            const rangeIdx = Math.min(Math.floor(finalProgress * POWER_RANGES.length), POWER_RANGES.length - 1);
            handleRollDice(2, POWER_RANGES[rangeIdx]);
        }
    };

    useEffect(() => {
        return () => { if (rollRafRef.current) cancelAnimationFrame(rollRafRef.current); };
    }, []);

    const hasLegalMoves = useMemo(() => {
        if (gameState.phase !== 'MOVE') return true;
        return hasAnyLegalMove(gameState, gameState.currentPlayerId);
    }, [gameState]);

    // Handle round change animation
    useEffect(() => {
        if (gameState.currentRound !== prevRoundRef.current) {
            setAnimateRound(true);
            const timer = setTimeout(() => setAnimateRound(false), 1000);
            prevRoundRef.current = gameState.currentRound;
            return () => clearTimeout(timer);
        }
    }, [gameState.currentRound]);

    // Derived effects (Kick detection)
    useEffect(() => {
        const prevState = prevStateRef.current;
        if (prevState.phase === 'ANIMATING' && gameState.phase !== 'ANIMATING') {
            const playerId = prevState.currentPlayerId;
            const pCurr = gameState.players[playerId];
            const pPrev = prevState.players[playerId];

            const lastAnim = prevState.animation;
            if (lastAnim) {
                const finalTileId = lastAnim.path[lastAnim.path.length - 1];
                const pos = TILE_POSITIONS[finalTileId];

                if (pos) {
                    const pixelX = pos.x * TILE_SIZE + TILE_SIZE / 2;
                    const pixelY = pos.y * TILE_SIZE + TILE_SIZE / 2;

                    // Kick check
                    if (pCurr.kickCount > pPrev.kickCount) {
                        const newEffect: VisualEffect = {
                            id: nextEffectIdRef.current++,
                            type: 'kick',
                            x: pixelX,
                            y: pixelY,
                            text: 'KICK!'
                        };
                        setVisualEffects(prev => [...prev, newEffect]);
                        setTimeout(() => setVisualEffects(curr => curr.filter(e => e.id !== newEffect.id)), 1000);
                    }

                    // ATK gain check (token that just moved)
                    const movedTokenId = lastAnim.tokenId;
                    const currToken = pCurr.tokens.find(t => t.id === movedTokenId);
                    const prevToken = pPrev.tokens.find(t => t.id === movedTokenId);
                    if (currToken && prevToken && currToken.atk > prevToken.atk) {
                        const gained = currToken.atk - prevToken.atk;
                        // Trigger Phaser bubble absorption animation
                        setAtkAbsorbEvent({ tileId: finalTileId, tokenId: movedTokenId, amount: gained, eid: nextEffectIdRef.current++ });
                    }

                    // MAG gain check
                    if (pCurr.mana > pPrev.mana) {
                        const finalTile = gameState.board.flat().find(td => td?.id === finalTileId);
                        const ELEMENT_TYPES = new Set([TileType.Fire, TileType.Ice, TileType.Grass, TileType.Rock]);
                        const isMagTile = finalTile && ELEMENT_TYPES.has(finalTile.type) && finalTile.type !== pCurr.elementAffinity;
                        if (isMagTile) {
                            setMagAbsorbEvent({ tileId: finalTileId, tokenId: movedTokenId, eid: nextEffectIdRef.current++ });
                        }
                    }

                    // Element queue gain check — swirling light fly-to HUD
                    if (pCurr.elementQueue.length > pPrev.elementQueue.length) {
                        const addedElement = pCurr.elementQueue[pCurr.elementQueue.length - 1];
                        setElementAddedEvent({
                            tileId: finalTileId,
                            tokenId: movedTokenId,
                            element: addedElement,
                            playerId: pCurr.id,
                            eid: nextEffectIdRef.current++,
                        });
                    }
                }
            }
        }
        prevStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        if (gameState.phase === 'MOVE' && gameState.selectedTokenId !== null) {
            const player = gameState.players[gameState.currentPlayerId];
            const token = player.tokens.find(t => t.id === gameState.selectedTokenId);
            const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);
            if (token && diceTotal > 0) {
                const path = findPath(token.tileId, diceTotal, player.id, gameState);
                const destinationId = path[path.length-1];
                setPreviewTileId(destinationId);
                const destinationTile = gameState.board.flat().find(t => t?.id === destinationId);

                const isOccupiedByFriendly = destinationTile?.type !== TileType.SafeZone && player.tokens.some(t => t.tileId === destinationId && t.id !== token.id);
                setIsMoveValid(!isOccupiedByFriendly);
            }
        } else {
            setPreviewTileId(null);
            setIsMoveValid(true);
        }
    }, [gameState.phase, gameState.selectedTokenId, gameState.dice, gameState]);

    useEffect(() => {
        if (gameState.phase !== 'ANIMATING' || !gameState.animation) {
             if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            return;
        }
        const { path, step } = gameState.animation;
        if (step >= path.length - 1) {
            setGameState(prev => resolveMove(prev));
        } else {
            animationTimeoutRef.current = window.setTimeout(() => {
                setGameState(prev => {
                    if (prev.phase !== 'ANIMATING' || !prev.animation) return prev;
                    return { ...prev, animation: { ...prev.animation, step: prev.animation.step + 1 } };
                });
            }, ANIMATION_STEP_DELAY);
        }
        return () => { if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current); };
    }, [gameState.phase, gameState.animation]);

    useEffect(() => {
        if (gameState.goldDoubleTriggered) {
            setShowGoldDoublePopup(true);
            const timer = setTimeout(() => {
                setShowGoldDoublePopup(false);
                setGameState(prev => ({ ...prev, goldDoubleTriggered: false }));
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [gameState.goldDoubleTriggered]);

    const resetGame = useCallback(() => {
        const newState = generateDefaultGameState(tileGoldEnabled, 'Lv3');
        newState.phase = 'LEVEL_SELECT';
        setGameKey(k => k + 1);
        setGameState(newState);
    }, [tileGoldEnabled]);

    const handleLevelSelect = useCallback((selectedLevel: GameLevel) => {
        const newState = generateDefaultGameState(tileGoldEnabled, selectedLevel);
        newState.phase = 'SELECT_DICE';
        setGameKey(k => k + 1);
        setGameState(newState);
    }, [tileGoldEnabled]);

    const handleChangeLevel = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            phase: 'LEVEL_SELECT'
        }));
    }, []);

    const handleCancelLevelSelect = useCallback(() => {
        // Return to the previous phase (typically SELECT_DICE)
        setGameState(prev => ({
            ...prev,
            phase: 'SELECT_DICE'
        }));
    }, []);
    
    const handleRollDice = (count: 1 | 2, targetRange?: [number, number]) => {
        if (gameState.winner || gameState.phase !== 'SELECT_DICE') return;
        
        setGameState(prev => {
            const { currentPlayerId, accuracyRate } = prev;
            
            // Clone players to avoid mutation in Strict Mode
            const players = { ...prev.players };
            const currentPlayer = { ...players[currentPlayerId] };
            // Deep clone mutable arrays
            currentPlayer.tokens = currentPlayer.tokens.map(t => ({ ...t }));
            currentPlayer.manaFeedbackQueue = [...currentPlayer.manaFeedbackQueue];
            players[currentPlayerId] = currentPlayer;
            
            // Start match timers on first ever roll
            let matchStartTime = prev.matchStartTime;
            let turnStartTime = prev.turnStartTime;
            const now = Date.now();
            if (matchStartTime === null) matchStartTime = now;
            if (turnStartTime === null) turnStartTime = now;

            let newDice: number[];
            let diceTotal: number;

            // Power Roll logic check
            const isHit = targetRange && (Math.random() * 100 < accuracyRate);
            
            if (isHit && targetRange) {
                diceTotal = Math.floor(Math.random() * (targetRange[1] - targetRange[0] + 1)) + targetRange[0];
                let d1 = Math.floor(Math.random() * 6) + 1;
                let d2 = diceTotal - d1;
                let attempts = 0;
                while ((d2 < 1 || d2 > 6) && attempts < 20) {
                    d1 = Math.floor(Math.random() * 6) + 1;
                    d2 = diceTotal - d1;
                    attempts++;
                }
                if (d2 < 1 || d2 > 6) {
                    d2 = Math.max(1, Math.min(6, d2));
                    d1 = diceTotal - d2;
                }
                newDice = [d1, d2];
            } else {
                newDice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
                diceTotal = newDice.reduce((a, b) => a + b, 0);
            }

            const isDoubles = newDice.length === 2 && newDice[0] === newDice[1];
            const isOnCooldown = currentPlayer.doubleRollCooldown > 0;
            // Cap: cannot add extra turn if it would exceed MAX_CONSECUTIVE_ROLLS total
            const isAtRollCap = (prev.consecutiveRollsThisTurn + prev.ultimateExtraRolls) >= MAX_CONSECUTIVE_ROLLS - 1;
            // Valid double roll: both dice same AND cooldown expired AND roll cap not reached
            const isValidDoubleRoll = isDoubles && !isOnCooldown && !isAtRollCap;

            // NEW RULE: Roll Double → extra turn + cooldown (replaces old +30 mana)
            if (isValidDoubleRoll) {
                currentPlayer.doubleRollCooldown = DOUBLE_ROLL_COOLDOWN_ROUNDS;
            }

            const newConsecutiveRolls = prev.consecutiveRollsThisTurn + 1;

            let updatedLogs = addLog(prev, `${currentPlayer.name} ${targetRange && isHit ? 'POWER-ROLLED' : 'rolled'} ${count} dice. Result: ${diceTotal}`);
            if (isValidDoubleRoll) {
                updatedLogs = [...updatedLogs, `${currentPlayer.name} rolled DOUBLES! Extra turn granted! (cooldown: ${DOUBLE_ROLL_COOLDOWN_ROUNDS} rounds)`].slice(-20);
            } else if (isDoubles && isOnCooldown) {
                updatedLogs = [...updatedLogs, `${currentPlayer.name} rolled doubles but is on cooldown (${currentPlayer.doubleRollCooldown} round(s) left).`].slice(-20);
            } else if (isDoubles && isAtRollCap) {
                updatedLogs = [...updatedLogs, `${currentPlayer.name} rolled doubles but has reached the max consecutive rolls limit (${MAX_CONSECUTIVE_ROLLS}).`].slice(-20);
            }
            
            const playerTokens = currentPlayer.tokens;
            const tempState = { ...prev, players, logs: updatedLogs, matchStartTime, turnStartTime, consecutiveRollsThisTurn: newConsecutiveRolls };
            
            const movableTokens = playerTokens.filter(token => 
                token.frozenRounds <= 0 && findPath(token.tileId, diceTotal, currentPlayerId, tempState).length > 1
            );

            if (movableTokens.length === 0) {
                // Go to MOVE phase with no selection — no-moves banner will auto-end turn after 2s
                return {
                    ...tempState,
                    diceCount: count,
                    dice: newDice,
                    hasRolledDoubles: isDoubles,
                    phase: 'MOVE',
                    selectedTokenId: null,
                };
            }
            
            const opponentId = currentPlayerId === 'Player1' ? 'Player2' : 'Player1';
            const opponentTokens = tempState.players[opponentId].tokens;

            const sortedTokens = [...movableTokens].map(token => {
                const path = findPath(token.tileId, diceTotal, currentPlayerId, tempState);
                const destId = path[path.length - 1];
                const destTile = tempState.board.flat().find(t => t?.id === destId);
                const canKick = destTile?.type !== TileType.SafeZone && opponentTokens.some(ot => ot.tileId === destId);
                const distToGoal = getStepsToGoal(token.tileId, currentPlayerId, tempState);
                return { token, canKick, distToGoal };
            }).sort((a, b) => {
                if (a.canKick !== b.canKick) return a.canKick ? -1 : 1;
                if (a.distToGoal !== b.distToGoal) return a.distToGoal - b.distToGoal;
                return a.token.id - b.token.id;
            });

            const defaultTokenId = sortedTokens[0].token.id;
            return {
                ...tempState,
                diceCount: count,
                dice: newDice,
                hasRolledDoubles: isDoubles,
                phase: 'MOVE',
                selectedTokenId: defaultTokenId,
                // Queue an extra turn if valid double roll (consumed by endTurn)
                ultimateExtraRolls: isValidDoubleRoll ? prev.ultimateExtraRolls + 1 : prev.ultimateExtraRolls,
            };
        });
    };

    const handleDeadlockEndTurn = useCallback(() => {
        setGameState(prev => {
            const nextState = endTurn(prev);
            return {
                ...nextState,
                logs: addLog(nextState, `${prev.players[prev.currentPlayerId].name} has no legal moves due to obstruction and passes turn.`)
            };
        });
    }, []);

    const handleConfirmMove = useCallback(() => {
        if (gameState.phase !== 'MOVE' || gameState.selectedTokenId === null || gameState.winner || !isMoveValid) return;
        setGameState(prev => {
            const player = prev.players[prev.currentPlayerId];
            const token = player.tokens.find(t => t.id === prev.selectedTokenId);
            const path = findPath(token!.tileId, prev.dice.reduce((a, b) => a + b, 0), player.id, prev);
            return path.length <= 1 ? endTurn(prev) : { ...prev, phase: 'ANIMATING', animation: { tokenId: token!.id, path, step: 0 } };
        });
    }, [gameState.phase, gameState.selectedTokenId, gameState.winner, isMoveValid]);

    const handleTokenSelect = useCallback((token: TokenState) => {
        if (gameState.phase === 'SELECT_TELEPORT_TOKEN') {
            if (token.playerId !== gameState.currentPlayerId) return;
            setGameState(prev => ({ 
                ...prev, 
                phase: 'SELECT_TELEPORT_DEST', 
                teleportingTokenId: token.id,
                logs: addLog(prev, `Selected token #${token.id} to teleport. Now select a DESTINATION tile.`)
            }));
            return;
        }
        if (gameState.phase !== 'MOVE' || gameState.currentPlayerId !== token.playerId || token.frozenRounds > 0) return;
        setGameState(prev => ({ ...prev, selectedTokenId: token.id }));
    }, [gameState.phase, gameState.currentPlayerId]);
    
    const handleConfirmAddToken = (tileId: number) => {
        if (!isAddingTokenForPlayer) return;
        setGameState(prev => {
            const player = prev.players[isAddingTokenForPlayer];
            const newToken: TokenState = { id: prev.nextTokenId, playerId: isAddingTokenForPlayer, tileId, diamonds: 0, frozenRounds: 0 };
            return { ...prev, nextTokenId: prev.nextTokenId + 1, players: { ...prev.players, [isAddingTokenForPlayer]: { ...player, tokens: [...player.tokens, newToken] } } };
        });
        setIsAddingTokenForPlayer(null);
    };

    const handleUpdateTile = (updatedTile: TileData) => {
        setGameState(prev => {
            const newBoard = prev.board.map(row => row.map(cell => (cell && cell.id === updatedTile.id) ? updatedTile : cell));
            return { ...prev, board: applyRoleResolution(newBoard) };
        });
        setEditingTile(null);
    };

    const handleUpdateConnections = (newConnections: Record<number, Connection[]>) => setGameState(prev => ({ ...prev, connections: newConnections }));
    const handleDeleteTile = (tileId: number) => {
        setGameState(prev => {
            const newBoard = prev.board.map(row => row.map(cell => (cell && cell.id === tileId) ? null : cell));
            return { ...prev, board: applyRoleResolution(newBoard), connections: prev.connections };
        });
        setEditingTile(null);
    };

    const handleExportTiles = () => {
        const tiles: { id: number; type: string }[] = [];
        for (const row of gameState.board) {
            for (const tile of row) {
                if (tile) tiles.push({ id: tile.id, type: tile.type });
            }
        }
        tiles.sort((a, b) => a.id - b.id);
        const blob = new Blob([JSON.stringify(tiles, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'tile-layout.json'; a.click();
        URL.revokeObjectURL(url);
    };

    const tileImportRef = useRef<HTMLInputElement>(null);

    const handleImportTiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported: { id: number; type: string }[] = JSON.parse(e.target?.result as string);
                const typeMap = new Map(imported.map(t => [t.id, t.type as TileType]));
                setGameState(prev => ({
                    ...prev,
                    board: prev.board.map(row =>
                        row.map(cell => cell && typeMap.has(cell.id) ? { ...cell, type: typeMap.get(cell.id)! } : cell)
                    ),
                }));
            } catch { alert('Invalid tile JSON'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleImportMap = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMap: MapData = JSON.parse(e.target?.result as string);
                setGameState(prev => ({ ...prev, board: applyRoleResolution(importedMap.board), connections: importedMap.connections }));
                alert('Map imported successfully!');
            } catch { alert('Error: Failed to parse the map file.'); }
        };
        reader.readAsText(file);
    };
    
    const handleAddNewTileAtPosition = (row: number, col: number) => {
        if (!isEditMode) return;
        setGameState(prev => {
            if (prev.board[row]?.[col] !== null) return prev;
            const maxId = prev.board.flat().reduce((max, tile) => Math.max(max, tile?.id ?? -1), -1);
            const newTile: TileData = { id: maxId + 1, type: TileType.Normal };
            const rawBoard = prev.board.map((r, rIdx) => rIdx !== row ? r : r.map((c, cIdx) => cIdx !== col ? c : newTile));
            return { ...prev, board: applyRoleResolution(rawBoard) };
        });
    };

    const handleTeleportDestinationSelect = useCallback((tileId: number) => {
        setGameState(prev => {
            if (prev.phase !== 'SELECT_TELEPORT_DEST' || prev.teleportingTokenId === null) return prev;
            const newState = { ...prev };
            const player = newState.players[newState.currentPlayerId];
            const token = player.tokens.find(t => t.id === newState.teleportingTokenId);
            if (token) {
                token.tileId = tileId;
                newState.logs = addLog(newState, `${player.name} teleported token #${token.id} to tile #${tileId}`);
            }
            newState.phase = 'SELECT_DICE';
            newState.teleportingTokenId = null;
            return newState;
        });
    }, []);

    // ── Phaser board callbacks ────────────────────────────────────────────
    const handlePhaserTileClick = useCallback((tileId: number) => {
        if (gameState.phase === 'SELECT_TELEPORT_DEST') {
            handleTeleportDestinationSelect(tileId);
            return;
        }
        if (gameState.phase !== 'MOVE') return;
        // Find which current-player token can reach this tile
        const player = gameState.players[gameState.currentPlayerId];
        const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);
        const token = player.tokens.find(t => {
            if (t.frozenRounds > 0) return false;
            const path = findPath(t.tileId, diceTotal, player.id, gameState);
            if (path.length <= 1) return false;
            const destId = path[path.length - 1];
            if (destId !== tileId) return false;
            // Block if own horse occupies a non-safezone tile
            const destTile = gameState.board.flat().find(td => td?.id === destId);
            const blockedByFriendly = destTile?.type !== TileType.SafeZone &&
                player.tokens.some(ot => ot.tileId === destId && ot.id !== t.id);
            return !blockedByFriendly;
        });
        if (!token) return;
        setGameState(prev => {
            const p = prev.players[prev.currentPlayerId];
            const tk = p.tokens.find(t => t.id === token.id)!;
            const path = findPath(tk.tileId, prev.dice.reduce((a, b) => a + b, 0), p.id, prev);
            return path.length <= 1
                ? endTurn(prev)
                : { ...prev, phase: 'ANIMATING', selectedTokenId: tk.id, animation: { tokenId: tk.id, path, step: 0 } };
        });
    }, [gameState, handleTeleportDestinationSelect]);

    const handlePhaserTokenClick = useCallback((tokenId: number) => {
        const token = Object.values(gameState.players)
            .flatMap(p => p.tokens)
            .find(t => t.id === tokenId);
        if (!token) return;
        // In MOVE phase, clicking an opponent's token treats it as clicking that tile (kick)
        if (gameState.phase === 'MOVE') {
            const currentPlayer = gameState.players[gameState.currentPlayerId];
            const isOpponent = currentPlayer.tokens.every(t => t.id !== tokenId);
            if (isOpponent) {
                handlePhaserTileClick(token.tileId);
                return;
            }
        }
        handleTokenSelect(token);
    }, [gameState, handlePhaserTileClick, handleTokenSelect]);

    // All destination tiles for every movable token — excludes friendly-blocked non-safezone tiles
    const highlightTileIds = useMemo(() => {
        if (gameState.phase !== 'MOVE') return [];
        const player = gameState.players[gameState.currentPlayerId];
        const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);
        if (diceTotal === 0) return [];
        const dests = player.tokens
            .filter(t => t.frozenRounds <= 0)
            .flatMap(t => {
                const path = findPath(t.tileId, diceTotal, player.id, gameState);
                if (path.length <= 1) return [];
                const destId = path[path.length - 1];
                const destTile = gameState.board.flat().find(td => td?.id === destId);
                const blockedByFriendly = destTile?.type !== TileType.SafeZone &&
                    player.tokens.some(ot => ot.tileId === destId && ot.id !== t.id);
                return blockedByFriendly ? [] : [destId];
            });
        return [...new Set(dests)];
    }, [gameState.phase, gameState.dice, gameState]);

    // Token IDs that can legally move (non-blocked) — used for idle-bounce animation
    const movableTokenIds = useMemo(() => {
        if (gameState.phase !== 'MOVE') return [];
        const player = gameState.players[gameState.currentPlayerId];
        const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);
        if (diceTotal === 0) return [];
        return player.tokens
            .filter(t => {
                if (t.frozenRounds > 0) return false;
                const path = findPath(t.tileId, diceTotal, player.id, gameState);
                if (path.length <= 1) return false;
                const destId = path[path.length - 1];
                const destTile = gameState.board.flat().find(td => td?.id === destId);
                return !(destTile?.type !== TileType.SafeZone && player.tokens.some(ot => ot.tileId === destId && ot.id !== t.id));
            })
            .map(t => t.id);
    }, [gameState.phase, gameState.dice, gameState]);
    // ── No-moves banner: auto-end turn after 2s ───────────────────────────
    useEffect(() => {
        if (gameState.phase !== 'MOVE' || highlightTileIds.length > 0) {
            setNoMovesBannerVisible(false);
            return;
        }
        setNoMovesBannerVisible(true);
        const t = setTimeout(() => {
            setNoMovesBannerVisible(false);
            setGameState(prev => {
                const nextState = endTurn(prev);
                nextState.logs = addLog(nextState, `No legal moves for ${prev.players[prev.currentPlayerId].name}. Turn passed.`);
                return nextState;
            });
        }, 2000);
        return () => clearTimeout(t);
    }, [gameState.phase, highlightTileIds.length]);
    // ─────────────────────────────────────────────────────────────────────

    // Ult button world coords for MAG bubble fly-to animation in Phaser
    const ultButtonWorldPos = useMemo(() => ({
        x: layout.ultButton.left + layout.ultButton.size / 2,
        y: 900 - layout.ultButton.bottom - layout.ultButton.size / 2,
    }), [layout.ultButton]);

    const handleUltimateActivate = useCallback(() => {
        const player = gameState.players[gameState.currentPlayerId];
        const ultimateDef = ULTIMATES[player.config.ultimateType];

        if (!ultimateDef || player.mana < player.manaCap) return;

        // Cap: Extra Roll ultimate cannot be activated if it would exceed MAX_CONSECUTIVE_ROLLS
        if (player.config.ultimateType === 'extraRoll' &&
            gameState.consecutiveRollsThisTurn + gameState.ultimateExtraRolls >= MAX_CONSECUTIVE_ROLLS - 1) {
            return;
        }

        // Visual feedback trigger
        setShowUltTooltip(false);
        setUltimateActivationName(ultimateDef.name.toUpperCase());
        setTimeout(() => setUltimateActivationName(null), 2000);

        setGameState(prev => {
            const p = prev.players[prev.currentPlayerId];
            const ult = ULTIMATES[p.config.ultimateType];
            if (!ult) return prev;

            const newState = ult.activate(prev, prev.currentPlayerId);
            newState.players[prev.currentPlayerId].mana = 0;
            newState.logs = addLog(newState, `${p.name} activated ULTIMATE: ${ult.name}!`);
            
            // Special case for teleport which changes phase
            if (p.config.ultimateType === 'teleport') {
                newState.phase = 'SELECT_TELEPORT_TOKEN';
            }
            
            return newState;
        });
    }, [gameState.currentPlayerId, gameState.players]);

    const handleEmptyTileResolve = useCallback((updatedQueue: TileType[]) => {
        setGameState(prev => {
            // Deep clone to prevent StrictMode double-invocation mutation bugs
            const newState = { ...prev };
            newState.players = { ...prev.players };
            const currentPlayerId = prev.currentPlayerId;
            const player = { ...newState.players[currentPlayerId] };
            player.tokens = player.tokens.map(t => ({ ...t })); // Deep clone tokens just in case
            player.elementQueue = [...updatedQueue]; // Set queue from input
            
            newState.players[currentPlayerId] = player;
            
            console.log(`[handleEmptyTileResolve] Before Process: ComboCount=${player.comboCount}`);

            // Resolve combos after item use
            processCombos(newState, player);

            console.log(`[handleEmptyTileResolve] After Process: ComboCount=${player.comboCount}`);

            newState.logs = addLog(newState, `${player.name} resolved Empty Tile interaction.`);
            return endTurn(newState);
        });
    }, []);

    const handleEmptyTileSkip = useCallback(() => {
        setGameState(prev => {
            const newState = { ...prev };
            newState.logs = addLog(newState, `${prev.players[prev.currentPlayerId].name} skipped Empty Tile interaction.`);
            return endTurn(newState);
        });
    }, []);

    const handleEmptyTileMinimize = useCallback((minimized: boolean) => {
        setGameState(prev => ({ ...prev, isEmptyTilePopupMinimized: minimized }));
    }, []);

    const handleGoalRewardResolve = useCallback((element: TileType) => {
        // Fire Phaser animations before state update (board glow + horse absorb swirl)
        const currentPlayerId = gameState.currentPlayerId;
        const goalTileId = FINAL_GOALS[currentPlayerId as keyof typeof FINAL_GOALS];
        const tokenAtGoal = gameState.players[currentPlayerId]?.tokens.find(t => t.tileId === goalTileId);
        if (tokenAtGoal) {
            setGoalElementChosenEvent({
                playerId: currentPlayerId,
                element,
                tokenId: tokenAtGoal.id,
                eid: Date.now(),
            });
        }

        setGameState(prev => {
            // Deep clone to prevent StrictMode double-invocation mutation bugs
            const newState = { ...prev };
            newState.players = { ...prev.players };
            const currentPlayerId = prev.currentPlayerId;
            const player = { ...newState.players[currentPlayerId] };
            player.tokens = player.tokens.map(t => ({ ...t }));
            player.elementQueue = [...player.elementQueue]; // Clone queue
            
            newState.players[currentPlayerId] = player;
            
            // Add element to queue
            player.elementQueue.push(element);
            if (player.elementQueue.length > player.config.maxElementQueue) {
                player.elementQueue.shift();
            }

            console.log(`[handleGoalRewardResolve] Before Process: ComboCount=${player.comboCount}`);

            // Resolve combos
            processCombos(newState, player);

            console.log(`[handleGoalRewardResolve] After Process: ComboCount=${player.comboCount}`);

            // NEW: Handle Stable Arrival Logic (Damage & Teleport)
            // This happens AFTER combo resolution so damage includes any combo buffs
            const stableTileId = FINAL_GOALS[player.id];
            const tokenAtStable = player.tokens.find(t => t.tileId === stableTileId);

            if (tokenAtStable) {
                 const opponentId = player.id === 'Player1' ? 'Player2' : 'Player1';
                 const opponent = { ...newState.players[opponentId] }; // Clone opponent
                 newState.players[opponentId] = opponent;
                 
                 const damage = tokenAtStable.atk;
                 opponent.hp -= damage;
                 newState.logs = addLog(newState, `${player.name}'s horse reached the stable and dealt ${damage} damage!`);
                 
                 // Teleport back to safe zone
                 tokenAtStable.tileId = player.safeZoneTileId;
            }

            newState.logs = addLog(newState, `${player.name} chose ${element} as goal reward.`);
            return endTurn(newState);
        });
    }, [gameState]);

    

    // Add safe clearing logic for Mana feedback queue
    useEffect(() => {
        if (gameState.comboAnnouncement) {
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, comboAnnouncement: null }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.comboAnnouncement]);

    const handleClearManaFeedback = useCallback((pId: PlayerID) => {
        setGameState(prev => {
            // Optimization: Only trigger update if there is actually something to clear
            if (prev.players[pId].manaFeedbackQueue.length === 0) return prev;
            return {
                ...prev,
                players: {
                    ...prev.players,
                    [pId]: {
                        ...prev.players[pId],
                        manaFeedbackQueue: []
                    }
                }
            };
        });
    }, []);

    useEffect(() => {
        resetGame();
    }, [tileGoldEnabled]);

    const handleUpdateMaxRounds = (val: number) => {
        const newVal = Math.max(1, val);
        setGameState(prev => {
            const fresh = generateDefaultGameState(prev.tileGoldEnabled);
            return {
                ...fresh,
                maxRounds: newVal,
                accuracyRate: prev.accuracyRate,
                players: Object.keys(prev.players).reduce((acc, pKey) => {
                    const id = pKey as PlayerID;
                    acc[id] = { ...fresh.players[id], config: { ...prev.players[id].config }, manaCap: prev.players[id].config.ultimateCost };
                    return acc;
                }, {} as Record<PlayerID, PlayerState>),
                logs: ["Global config updated. Starting new match..."]
            };
        });
    };

    const handleUpdateAccuracyRate = (val: number) => {
        const newVal = Math.max(0, Math.min(100, val));
        setGameState(prev => {
            const fresh = generateDefaultGameState(prev.tileGoldEnabled);
            return {
                ...fresh,
                maxRounds: prev.maxRounds,
                accuracyRate: newVal,
                players: Object.keys(prev.players).reduce((acc, pKey) => {
                    const id = pKey as PlayerID;
                    acc[id] = { ...fresh.players[id], config: { ...prev.players[id].config }, manaCap: prev.players[id].config.ultimateCost };
                    return acc;
                }, {} as Record<PlayerID, PlayerState>),
                logs: ["Global config updated. Starting new match..."]
            };
        });
    };

    const handleToggleTileGold = (val: boolean) => {
        setTileGoldEnabled(val);
        setGameState(prev => ({ ...prev, tileGoldEnabled: val }));
    };

    const handleToggleEditMode = () => {
        const nextEditMode = !isEditMode;
        setIsEditMode(nextEditMode);
        if (nextEditMode && !tileGoldEnabled) {
            handleToggleTileGold(true);
        }
    };

    // --- Lobby ---
    if (appScene === 'lobby') {
        return (
            <LobbyScene
                onBattle={() => setAppScene('game')}
                onOpenInventory={() => setAppScene('character')}
                activeCharId={activeCharId}
            />
        );
    }

    // --- Character system ---
    if (appScene === 'character') {
        return <CharacterSystemApp onExit={() => setAppScene('lobby')} activeCharId={activeCharId} onSetActiveChar={setActiveCharId} />;
    }

    // --- Tutorial mode: render TutorialFlow full-screen ---
    if (isTutorialMode) {
        return <TutorialFlow onExitTutorial={() => setIsTutorialMode(false)} />;
    }

    return (
        <div className="relative min-h-screen bg-gray-950 text-white flex flex-col font-sans overflow-hidden">
            <header className="bg-gray-950 shadow-2xl p-3 flex items-center justify-between px-8 z-50 sticky top-0 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-indigo-400">
                            Elemental Hunter
                        </h1>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Elemental Quest Engine v1.6</span>
                    </div>
                </div>

                {/* placeholder — round counter moved to game area */}
                <div />

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-white/5">
                        <button 
                            onClick={() => setActiveView('game')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'game' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Game
                        </button>
                        <button 
                            onClick={() => setActiveView('testing')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'testing' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Testing
                        </button>
                    </div>
                    
                    <button
                        onClick={() => setAppScene('lobby')}
                        className="px-4 py-2 text-xs font-black rounded-lg transition-all border uppercase tracking-wider bg-gray-800 text-gray-300 border-white/10 hover:bg-gray-700"
                    >
                        ← Lobby
                    </button>

                    
                    <button
                        onClick={() => setIsTutorialMode(true)}
                        className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border bg-indigo-900 text-indigo-200 border-indigo-600/50 hover:bg-indigo-800"
                    >
                        📚 Tutorial
                    </button>

                    <button
                        onClick={handleToggleEditMode}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${isEditMode ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800 text-gray-400 border-white/5 hover:bg-gray-700'}`}
                    >
                        {isEditMode ? 'Exit Editor' : 'Edit Map'}
                    </button>

                    {activeView === 'game' && gameState.phase !== 'LEVEL_SELECT' && (
                        <button
                            onClick={handleChangeLevel}
                            className="px-4 py-2 text-xs font-black rounded-lg bg-purple-900 text-purple-200 border border-purple-600/50 hover:bg-purple-800 transition-all uppercase tracking-wider"
                        >
                            Change Level
                        </button>
                    )}

                    <button onClick={resetGame} className="px-4 py-2 text-xs font-black rounded-lg bg-gray-800 text-red-400 border border-red-900/50 hover:bg-gray-700 transition-all uppercase tracking-wider">
                        Reset
                    </button>
                </div>
            </header>
            
            <main className="flex-grow relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#150d30 0%,#0a0618 60%,#0d1528 100%)' }}>
                {activeView === 'testing' && <TestingDashboard />}
                {activeView === 'game' && (
                    <>
                        {/* ── HUD P1 — top left ── */}
                        <div className="absolute z-40" style={{ left: 0, top: 0, width: 355 }}>
                            <PlayerInfo
                                key={`Player1-${gameKey}`}
                                player={gameState.players.Player1}
                                isActive={gameState.currentPlayerId === 'Player1'}
                                onAddToken={() => setIsAddingTokenForPlayer('Player1')}
                                disabled={gameState.phase === 'ANIMATING'}
                                gameState={gameState}
                            />
                        </div>

                        {/* ── HUD P2 — top right ── */}
                        <div className="absolute z-40" style={{ right: 0, top: 0, width: 355 }}>
                            <PlayerInfo
                                key={`Player2-${gameKey}`}
                                player={gameState.players.Player2}
                                isActive={gameState.currentPlayerId === 'Player2'}
                                onAddToken={() => setIsAddingTokenForPlayer('Player2')}
                                disabled={gameState.phase === 'ANIMATING'}
                                gameState={gameState}
                            />
                        </div>

                        {/* ── Chibi P1 — left area ── */}
                        <div
                            className={`absolute z-10 cursor-pointer select-none${gameState.currentPlayerId === 'Player1' ? ' animate-chibi-float' : ''}`}
                            style={{ left: layout.p1Chibi.left, top: layout.p1Chibi.top }}
                            onClick={() => setChibiTooltip(v => v === 'Player1' ? null : 'Player1')}
                        >
                            <div
                                className={newTurnFlash === 'Player1' ? 'animate-chibi-turn-flash' : ''}
                                style={{ fontSize: 90, lineHeight: 1 }}
                            >🧙</div>
                        </div>
                        {/* P1 Ult + Mastery sidebar — LEFT of chibi */}
                        {(() => {
                            const p1 = gameState.players.Player1;
                            const p1Char = CHARACTERS[p1.config.characterId];
                            const maxTiers = LEVEL_CONFIGS[gameState.selectedLevel]?.maxComboTiers ?? 3;
                            const p1UltCharged = p1.mana >= p1.manaCap;
                            const p1UltDef = ULTIMATES[p1.config.ultimateType];
                            const ORDINAL = ['1st', '2nd', '3rd'];
                            const toggleP1 = () => setChibiTooltip(v => v === 'Player1' ? null : 'Player1');
                            return (
                                <div className="absolute z-20 flex flex-col items-center gap-2 pointer-events-none"
                                     style={{ left: layout.p1Sidebar.left, top: layout.p1Sidebar.top }}>
                                    {/* Single stacked tooltip panel — right of icons, offset so nothing overlaps */}
                                    {chibiTooltip === 'Player1' && (
                                        <div style={{
                                            position: 'absolute', right: 'calc(100% + 12px)', top: 0,
                                            animation: 'slide-in-from-right .2s cubic-bezier(0.16,1,0.3,1)',
                                            width: 240, background: 'rgba(10,5,32,.97)',
                                            border: '1px solid rgba(139,92,246,.3)',
                                            borderRadius: 14, padding: '10px 12px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,.85)',
                                            zIndex: 200, pointerEvents: 'none',
                                            display: 'flex', flexDirection: 'column', gap: 8,
                                        }}>
                                            {/* Ult row */}
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                    background: '#0a0520', position: 'relative', overflow: 'hidden',
                                                    border: p1UltCharged ? '2px solid rgba(167,139,250,.9)' : '2px solid rgba(120,100,200,.4)',
                                                    boxShadow: p1UltCharged ? '0 0 12px rgba(124,58,237,.8)' : 'none',
                                                }}>
                                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(p1.mana / p1.manaCap) * 100}%`, background: 'linear-gradient(to top, #4c1d95, #7c3aed 55%, #a78bfa 90%)' }} />
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                                        <DiceIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#a78bfa', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                                                        Ultimate — {p1UltDef?.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.5, marginBottom: 4 }}>{p1UltDef?.description}</div>
                                                    <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>
                                                        {p1.mana} / {p1.manaCap} MAG{p1UltCharged && <span style={{ color: '#22c55e', marginLeft: 6 }}>● READY</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Divider */}
                                            <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
                                            {/* Tier rows */}
                                            {Array.from({ length: maxTiers }, (_, i) => i + 1).map(tier => {
                                                const unlocked = p1.comboTier >= tier;
                                                const tierInfo = tier === 1 ? p1Char?.comboRewards?.tier1 : tier === 2 ? p1Char?.comboRewards?.tier2 : p1Char?.comboRewards?.tier3;
                                                return (
                                                    <div key={tier} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                                                            background: unlocked ? '#fbbf24' : 'rgba(60,50,90,.7)',
                                                            border: unlocked ? '2px solid rgba(255,255,255,.35)' : '2px solid rgba(180,160,255,.3)',
                                                            boxShadow: unlocked ? '0 0 8px rgba(251,191,36,.5)' : 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            {tier === 1 && <AtkPip className={`w-3 h-3 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                            {tier === 2 && <span style={{ fontSize: 14 }}>🔥</span>}
                                                            {tier === 3 && <AtkPip className={`w-4 h-4 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 900, color: unlocked ? '#fbbf24' : '#6b5a94', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
                                                                Combo T{tier} — {tierInfo?.title ?? `Tier ${tier}`}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.4, marginBottom: 2 }}>{tierInfo?.description ?? '—'}</div>
                                                            <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? '#22c55e' : '#fb923c' }}>
                                                                {unlocked ? '● ACTIVE' : `Unlock at ${ORDINAL[tier - 1] ?? `${tier}th`} combo`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Ultimate icon */}
                                    <div
                                        className="relative rounded-full overflow-hidden"
                                        style={{
                                            width: 52, height: 52, pointerEvents: 'auto', cursor: 'pointer',
                                            background: '#0a0520',
                                            border: p1UltCharged ? '2px solid rgba(167,139,250,.95)' : '2px solid rgba(120,100,200,.45)',
                                            boxShadow: p1UltCharged ? '0 0 16px rgba(124,58,237,.9), 0 0 32px rgba(124,58,237,.45)' : 'none',
                                        }}
                                        onClick={toggleP1}
                                    >
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(p1.mana / p1.manaCap) * 100}%`, background: 'linear-gradient(to top, #4c1d95, #7c3aed 55%, #a78bfa 90%)', transition: 'height 1.5s ease' }} />
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <DiceIcon className="w-7 h-7 text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    {/* Mastery tiers */}
                                    {Array.from({ length: maxTiers }, (_, i) => i + 1).map(tier => {
                                        const unlocked = p1.comboTier >= tier;
                                        return (
                                            <div
                                                key={tier}
                                                style={{
                                                    width: 38, height: 38, borderRadius: 8,
                                                    background: unlocked ? '#fbbf24' : 'rgba(60,50,90,.7)',
                                                    border: unlocked ? '2px solid rgba(255,255,255,.4)' : '2px solid rgba(180,160,255,.35)',
                                                    boxShadow: unlocked ? '0 0 10px rgba(251,191,36,.5)' : '0 0 6px rgba(100,80,200,.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    opacity: unlocked ? 1 : 0.8, transition: 'all .3s',
                                                    pointerEvents: 'auto', cursor: 'pointer',
                                                }}
                                                onClick={toggleP1}
                                            >
                                                {tier === 1 && <AtkPip className={`w-4 h-4 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                {tier === 2 && <span style={{ fontSize: 16, filter: unlocked ? 'none' : 'grayscale(0.5)' }}>🔥</span>}
                                                {tier === 3 && <AtkPip className={`w-5 h-5 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        {/* ── Chibi P2 — right area ── */}
                        <div
                            className={`absolute z-10 cursor-pointer select-none${gameState.currentPlayerId === 'Player2' ? ' animate-chibi-float' : ''}`}
                            style={{ left: layout.p2Chibi.left, top: layout.p2Chibi.top }}
                            onClick={() => setChibiTooltip(v => v === 'Player2' ? null : 'Player2')}
                        >
                            <div
                                className={newTurnFlash === 'Player2' ? 'animate-chibi-turn-flash' : ''}
                                style={{ fontSize: 90, lineHeight: 1 }}
                            >🧚</div>
                        </div>
                        {/* P2 Ult + Mastery sidebar — RIGHT of chibi */}
                        {(() => {
                            const p2 = gameState.players.Player2;
                            const p2Char = CHARACTERS[p2.config.characterId];
                            const maxTiers = LEVEL_CONFIGS[gameState.selectedLevel]?.maxComboTiers ?? 3;
                            const p2UltCharged = p2.mana >= p2.manaCap;
                            const p2UltDef = ULTIMATES[p2.config.ultimateType];
                            const ORDINAL = ['1st', '2nd', '3rd'];
                            const toggleP2 = () => setChibiTooltip(v => v === 'Player2' ? null : 'Player2');
                            return (
                                <div className="absolute z-20 flex flex-col items-center gap-2 pointer-events-none"
                                     style={{ left: layout.p2Sidebar.left, top: layout.p2Sidebar.top }}>
                                    {/* Single stacked tooltip panel — left of icons */}
                                    {chibiTooltip === 'Player2' && (
                                        <div style={{
                                            position: 'absolute', left: 'calc(100% + 12px)', top: 0,
                                            animation: 'slide-in-from-left .2s cubic-bezier(0.16,1,0.3,1)',
                                            width: 240, background: 'rgba(10,5,32,.97)',
                                            border: '1px solid rgba(139,92,246,.3)',
                                            borderRadius: 14, padding: '10px 12px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,.85)',
                                            zIndex: 200, pointerEvents: 'none',
                                            display: 'flex', flexDirection: 'column', gap: 8,
                                        }}>
                                            {/* Ult row */}
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                    background: '#0a0520', position: 'relative', overflow: 'hidden',
                                                    border: p2UltCharged ? '2px solid rgba(167,139,250,.9)' : '2px solid rgba(120,100,200,.4)',
                                                    boxShadow: p2UltCharged ? '0 0 12px rgba(124,58,237,.8)' : 'none',
                                                }}>
                                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(p2.mana / p2.manaCap) * 100}%`, background: 'linear-gradient(to top, #4c1d95, #7c3aed 55%, #a78bfa 90%)' }} />
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                                        <DiceIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#a78bfa', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                                                        Ultimate — {p2UltDef?.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.5, marginBottom: 4 }}>{p2UltDef?.description}</div>
                                                    <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>
                                                        {p2.mana} / {p2.manaCap} MAG{p2UltCharged && <span style={{ color: '#22c55e', marginLeft: 6 }}>● READY</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
                                            {Array.from({ length: maxTiers }, (_, i) => i + 1).map(tier => {
                                                const unlocked = p2.comboTier >= tier;
                                                const tierInfo = tier === 1 ? p2Char?.comboRewards?.tier1 : tier === 2 ? p2Char?.comboRewards?.tier2 : p2Char?.comboRewards?.tier3;
                                                return (
                                                    <div key={tier} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                                                            background: unlocked ? '#fbbf24' : 'rgba(60,50,90,.7)',
                                                            border: unlocked ? '2px solid rgba(255,255,255,.35)' : '2px solid rgba(180,160,255,.3)',
                                                            boxShadow: unlocked ? '0 0 8px rgba(251,191,36,.5)' : 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            {tier === 1 && <AtkPip className={`w-3 h-3 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                            {tier === 2 && <span style={{ fontSize: 14 }}>🔥</span>}
                                                            {tier === 3 && <AtkPip className={`w-4 h-4 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 900, color: unlocked ? '#fbbf24' : '#6b5a94', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
                                                                Combo T{tier} — {tierInfo?.title ?? `Tier ${tier}`}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.4, marginBottom: 2 }}>{tierInfo?.description ?? '—'}</div>
                                                            <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? '#22c55e' : '#fb923c' }}>
                                                                {unlocked ? '● ACTIVE' : `Unlock at ${ORDINAL[tier - 1] ?? `${tier}th`} combo`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Ultimate icon */}
                                    <div
                                        className="relative rounded-full overflow-hidden"
                                        style={{
                                            width: 52, height: 52, pointerEvents: 'auto', cursor: 'pointer',
                                            background: '#0a0520',
                                            border: p2UltCharged ? '2px solid rgba(167,139,250,.95)' : '2px solid rgba(120,100,200,.45)',
                                            boxShadow: p2UltCharged ? '0 0 16px rgba(124,58,237,.9), 0 0 32px rgba(124,58,237,.45)' : 'none',
                                        }}
                                        onClick={toggleP2}
                                    >
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(p2.mana / p2.manaCap) * 100}%`, background: 'linear-gradient(to top, #4c1d95, #7c3aed 55%, #a78bfa 90%)', transition: 'height 1.5s ease' }} />
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <DiceIcon className="w-7 h-7 text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    {/* Mastery tiers */}
                                    {Array.from({ length: maxTiers }, (_, i) => i + 1).map(tier => {
                                        const unlocked = p2.comboTier >= tier;
                                        return (
                                            <div
                                                key={tier}
                                                style={{
                                                    width: 38, height: 38, borderRadius: 8,
                                                    background: unlocked ? '#fbbf24' : 'rgba(60,50,90,.7)',
                                                    border: unlocked ? '2px solid rgba(255,255,255,.4)' : '2px solid rgba(180,160,255,.35)',
                                                    boxShadow: unlocked ? '0 0 10px rgba(251,191,36,.5)' : '0 0 6px rgba(100,80,200,.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    opacity: unlocked ? 1 : 0.8, transition: 'all .3s',
                                                    pointerEvents: 'auto', cursor: 'pointer',
                                                }}
                                                onClick={toggleP2}
                                            >
                                                {tier === 1 && <AtkPip className={`w-4 h-4 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                                {tier === 2 && <span style={{ fontSize: 16, filter: unlocked ? 'none' : 'grayscale(0.5)' }}>🔥</span>}
                                                {tier === 3 && <AtkPip className={`w-5 h-5 ${unlocked ? 'text-amber-900' : 'text-indigo-300'}`} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        {/* ── Board — fills entire main area ── */}
                        <div className="absolute inset-0">
                            <div className="relative w-full h-full">
                                <PhaserGame
                                    gameState={gameState}
                                    onTileClick={handlePhaserTileClick}
                                    onTokenClick={handlePhaserTokenClick}
                                    highlightTileIds={highlightTileIds}
                                    movableTokenIds={movableTokenIds}
                                    boardConfig={layout.board}
                                    isEditMode={isEditMode}
                                    width={1280}
                                    height={900}
                                    atkAbsorbEvent={atkAbsorbEvent}
                                    magAbsorbEvent={magAbsorbEvent}
                                    ultButtonWorldPos={ultButtonWorldPos}
                                    elementAddedEvent={elementAddedEvent}
                                    goalReachedEvent={goalReachedEvent}
                                    goalElementChosenEvent={goalElementChosenEvent}
                                    onGoalAnimationDone={handleGoalAnimationDone}
                                />

                                <div className="absolute inset-0 pointer-events-none z-[60]">
                                    {visualEffects.map(effect => (
                                        <div
                                            key={effect.id}
                                            className={`absolute whitespace-nowrap font-black uppercase italic ${effect.type === 'kick' ? 'animate-kick-label text-4xl text-red-500' : effect.type === 'atk' ? 'animate-float-up-impact text-2xl text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'animate-float-up-impact text-4xl streak-impact'}`}
                                            style={{ left: effect.x, top: effect.y, transform: 'translate(-50%, -100%)' }}
                                        >
                                            {effect.text}
                                        </div>
                                    ))}
                                </div>

                                {/* Ultimate Activation Visual Feedback */}
                                {ultimateActivationName && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
                                        <div className="ultimate-activation-text text-6xl font-black italic tracking-tighter uppercase animate-glow-spread">
                                            {ultimateActivationName}
                                        </div>
                                    </div>
                                )}

                                {showGoldDoublePopup && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
                                        <div className="text-6xl font-black uppercase italic tracking-tighter animate-glow-spread streak-impact">
                                            x2 Gold!
                                        </div>
                                    </div>
                                )}

                                {/* Combo Announcement Overlay */}
                                {gameState.comboAnnouncement && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[150]">
                                        <div className="flex flex-col items-center animate-combo-slam">
                                            <div className="text-7xl font-black italic tracking-tighter uppercase text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] mb-4 combo-text-stroke">
                                                {gameState.comboAnnouncement.type}
                                            </div>
                                            <div className="flex flex-col gap-2 items-center">
                                                {gameState.comboAnnouncement.rewards.map((reward, i) => (
                                                    <div key={i} className="text-xl font-bold text-white bg-indigo-600/80 px-6 py-2 rounded-full border border-white/20 shadow-lg animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
                                                        {reward}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Game Log — bottom center ── */}
                        <div className="absolute z-20" style={{ bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 420 }}>
                            <GameLog logs={gameState.logs} />
                        </div>

                        {/* ── Round counter — top center, between HUDs ── */}
                        {!gameState.winner && (
                            <div className="absolute z-40 pointer-events-none flex flex-col items-center gap-1"
                                 style={{ left: '50%', top: 10, transform: 'translateX(-50%)' }}>
                                <div className={`flex items-center gap-3 px-5 py-1.5 rounded-full transition-all duration-500 ${gameState.currentRound > gameState.maxRounds - 3 ? 'bg-red-950/80 border border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.4)]' : 'border border-white/15'} ${animateRound ? 'scale-110' : 'scale-100'}`}
                                     style={{ background: gameState.currentRound > gameState.maxRounds - 3 ? undefined : 'rgba(255,255,255,.07)', backdropFilter: 'blur(8px)' }}>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Round</span>
                                    <span className={`text-xl font-black italic tracking-tighter ${gameState.currentRound > gameState.maxRounds - 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                        {gameState.currentRound}
                                    </span>
                                    <span className="text-gray-600 font-black">/</span>
                                    <span className="text-gray-300 font-black">{gameState.maxRounds}</span>
                                </div>

                                {/* Turn indicator — just below round counter */}
                                <div className="flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold whitespace-nowrap"
                                     style={{ background: 'rgba(0,0,0,.65)', border: '1px solid rgba(255,100,50,.35)', color: '#ff9060' }}>
                                    <span className="w-2 h-2 rounded-full animate-pulse"
                                          style={{ background: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,.8)' }} />
                                    {gameState.players[gameState.currentPlayerId]?.name ?? gameState.currentPlayerId}'s Turn
                                </div>
                            </div>
                        )}

                        {/* ── Dice result overlay — shown after roll, until move/end turn ── */}
                        {!gameState.winner && gameState.dice.length > 0 && gameState.phase === 'MOVE' && (
                            <div className="absolute z-50 pointer-events-none"
                                 style={{ left: '50%', top: 80, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                {/* Two dice */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {gameState.dice.map((v, i) => (
                                        <div key={i} style={{ transform: 'scale(.75)', transformOrigin: 'top center' }}>
                                            <Dice value={v} />
                                        </div>
                                    ))}
                                </div>
                                {/* Sum — below dice */}
                                <div style={{
                                    fontSize: 44, fontWeight: 900, color: '#fff',
                                    letterSpacing: '-.03em',
                                    textShadow: '0 0 24px rgba(255,255,255,.5), 0 2px 8px rgba(0,0,0,.9)',
                                    lineHeight: 1,
                                }}>
                                    {gameState.dice.reduce((a, b) => a + b, 0)}
                                </div>
                                {/* No-moves banner */}
                                {noMovesBannerVisible && (
                                    <div style={{
                                        fontSize: 13, fontWeight: 900, color: '#f87171',
                                        background: 'rgba(30,0,0,.85)', border: '1px solid rgba(248,113,113,.4)',
                                        borderRadius: 10, padding: '6px 16px',
                                        textTransform: 'uppercase', letterSpacing: '.06em',
                                        textShadow: '0 0 12px rgba(248,113,113,.7)',
                                    }}>
                                        All horses cannot move — ending turn…
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Use Ultimate — bottom left (active player's turn, always visible) ── */}
                        {!gameState.winner && (() => {
                            const ap = gameState.players[gameState.currentPlayerId];
                            const ultDef = ULTIMATES[ap?.config?.ultimateType];
                            if (!ap) return null;
                            const isCharged = ap.mana >= ap.manaCap;
                            const canActivate = isCharged && gameState.phase === 'SELECT_DICE';
                            const isAnimating = gameState.phase === 'ANIMATING';

                            // Affinity → glow color
                            const AFFINITY_GLOW: Record<string, [string, string, string]> = {
                                fire:     ['#ef4444', 'rgba(239,68,68,.8)',   'rgba(239,68,68,.45)'],
                                ice:      ['#3b82f6', 'rgba(59,130,246,.8)',  'rgba(59,130,246,.45)'],
                                grass:    ['#22c55e', 'rgba(34,197,94,.8)',   'rgba(34,197,94,.45)'],
                                rock:     ['#9ca3af', 'rgba(156,163,175,.8)','rgba(156,163,175,.45)'],
                            };
                            const aff = ap.elementAffinity as string | undefined;
                            const [, borderCol, glowCol] = (aff && AFFINITY_GLOW[aff]) || ['#a78bfa', 'rgba(167,139,250,.8)', 'rgba(124,58,237,.45)'];

                            return (
                                <>
                                    {/* Pulsing radial glow backdrop — only when canActivate */}
                                    {canActivate && (
                                        <div
                                            className="absolute rounded-full pointer-events-none z-[49]"
                                            style={{
                                                bottom: layout.ultButton.bottom - 18,
                                                left:   layout.ultButton.left   - 18,
                                                width:  layout.ultButton.size   + 36,
                                                height: layout.ultButton.size   + 36,
                                                background: `radial-gradient(circle, ${glowCol} 0%, transparent 68%)`,
                                                animation: 'ult-glow-pulse 1.2s ease-in-out infinite',
                                            }}
                                        />
                                    )}

                                    {/* Round liquid-fill ultimate button */}
                                    <button
                                        onClick={() => {
                                            if (isAnimating) return;
                                            if (canActivate) {
                                                handleUltimateActivate();
                                            } else {
                                                setShowUltTooltip(v => !v);
                                            }
                                        }}
                                        className="absolute z-50"
                                        style={{
                                            bottom: layout.ultButton.bottom, left: layout.ultButton.left,
                                            width: layout.ultButton.size, height: layout.ultButton.size,
                                            borderRadius: '50%',
                                            padding: 0,
                                            overflow: 'hidden',
                                            background: '#0a0520',
                                            border: `${canActivate ? 3 : 2}px solid ${isCharged ? borderCol : 'rgba(100,80,180,.4)'}`,
                                            boxShadow: canActivate
                                                ? `0 0 0 4px ${borderCol}55, 0 0 48px ${glowCol}, 0 0 96px ${glowCol}`
                                                : isCharged
                                                    ? `0 0 24px ${glowCol}, 0 0 48px ${glowCol}`
                                                    : '0 2px 12px rgba(0,0,0,.6)',
                                            animation: canActivate ? 'affinity-pulse 1.2s ease-in-out infinite' : 'none',
                                            transition: 'box-shadow .4s, border-color .4s',
                                            cursor: isAnimating ? 'default' : 'pointer',
                                            opacity: isAnimating ? 0.4 : 1,
                                        }}
                                    >
                                        {/* Liquid fill */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            height: `${(ap.mana / ap.manaCap) * 100}%`,
                                            background: 'linear-gradient(to top, #4c1d95, #7c3aed 55%, #a78bfa 90%)',
                                            transition: 'height 1.5s ease',
                                        }} />
                                        {/* Icon */}
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                            <DiceIcon className="w-[61px] h-[61px] text-white drop-shadow-md" style={{ opacity: isCharged ? 1 : 0.6 } as React.CSSProperties} />
                                        </div>
                                    </button>

                                    {/* MAG feedback floaters near ult button */}
                                    {magFeedbacks.map(fb => (
                                        <div
                                            key={fb.id}
                                            className="absolute pointer-events-none animate-float-up-impact sp-floating-text font-black text-xl"
                                            style={{ bottom: layout.ultButton.size + 8, left: layout.ultButton.left + layout.ultButton.size / 2, transform: 'translateX(-50%)' }}
                                        >
                                            +{fb.amount} MAG
                                        </div>
                                    ))}

                                    {/* Tooltip — shown when not charged and toggled */}
                                    {showUltTooltip && !isCharged && (
                                        <div className="absolute z-[60] pointer-events-none ultimate-tooltip"
                                             style={{
                                                 bottom: 108, left: 20,
                                                 width: 200,
                                                 background: 'rgba(10,5,32,.96)',
                                                 border: '1px solid rgba(139,92,246,.3)',
                                                 borderRadius: 12,
                                                 padding: '12px 14px',
                                                 boxShadow: '0 8px 32px rgba(0,0,0,.8)',
                                             }}>
                                            <div style={{ fontSize: 11, fontWeight: 900, color: '#e2d9f3', letterSpacing: '.04em', marginBottom: 4, textTransform: 'uppercase' }}>
                                                {ultDef?.name ?? 'Ultimate'}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.5, marginBottom: 8 }}>
                                                {ultDef?.description}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ fontWeight: 900 }}>{ap.mana}</span>
                                                <span style={{ color: '#4b3a70' }}>/</span>
                                                <span style={{ fontWeight: 900 }}>{ap.manaCap}</span>
                                                <span style={{ color: '#6b5a94', marginLeft: 2 }}>MAG</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* ── Roll / Confirm / End Turn — bottom right ── */}
                        {!gameState.winner && (() => {
                            const phase = gameState.phase;
                            const isAnimating = phase === 'ANIMATING';

                            if (phase === 'MOVE') {
                                if (!hasLegalMoves) {
                                    return (
                                        <button
                                            onClick={handleDeadlockEndTurn}
                                            className="absolute z-50 font-black uppercase text-white text-sm tracking-tighter"
                                            style={{
                                                bottom: layout.rollButton.bottom, right: layout.rollButton.right,
                                                background: '#dc2626',
                                                border: '2px solid rgba(248,113,113,.6)',
                                                borderRadius: 18,
                                                padding: '14px 20px',
                                                boxShadow: '0 4px 20px rgba(220,38,38,.5)',
                                            }}
                                        >
                                            No Moves — End Turn
                                        </button>
                                    );
                                }
                                // Player clicks destination tile directly — no confirm button needed
                                return null;
                            }

                            if (phase === 'SELECT_DICE') {
                                return (
                                    <div className="absolute z-50" style={{ bottom: layout.rollButton.bottom, right: layout.rollButton.right, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                        {/* Power Roll progress bar — shown while rolling */}
                                        {isRolling && (
                                            <div style={{ position: 'relative', width: 234, height: 36, borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
                                                <div style={{ display: 'flex', height: '100%' }}>
                                                    {POWER_RANGES.map(([lo, hi], i) => {
                                                        const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
                                                        return (
                                                            <div key={i} style={{ flex: 1, background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', borderRight: i < 3 ? '1px solid rgba(0,0,0,.2)' : 'none' }}>
                                                                {lo}–{hi}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {/* needle */}
                                                <div style={{
                                                    position: 'absolute', top: 0, bottom: 0, width: 3,
                                                    background: '#fff',
                                                    boxShadow: '0 0 8px #fff',
                                                    left: `calc(${rollProgress * 100}% - 1.5px)`,
                                                    transition: 'none',
                                                }} />
                                            </div>
                                        )}
                                        {/* Circular Roll button */}
                                        <button
                                            onClick={handleToggleRoll}
                                            disabled={isAnimating}
                                            style={{
                                                width: layout.rollButton.size, height: layout.rollButton.size,
                                                borderRadius: '50%',
                                                background: isRolling ? 'rgba(255,255,255,.15)' : '#fff',
                                                border: isRolling ? '3px solid rgba(255,255,255,.6)' : '3px solid rgba(0,0,0,.1)',
                                                boxShadow: isRolling ? '0 0 24px rgba(255,255,255,.4)' : '0 4px 20px rgba(0,0,0,.5)',
                                                color: isRolling ? '#fff' : '#111',
                                                fontSize: 22,
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '.04em',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 2,
                                                transition: 'background .15s, box-shadow .15s',
                                            }}
                                        >
                                            <span style={{ fontSize: 48, lineHeight: 1 }}>🎲</span>
                                            <span>{isRolling ? 'STOP' : 'ROLL'}</span>
                                        </button>
                                    </div>
                                );
                            }

                            return null;
                        })()}
                    </>
                )}

                {gameState.winner && <MatchSummary gameState={gameState} onPlayAgain={resetGame} />}

                {gameState.phase === 'LEVEL_SELECT' && (
                    <LevelSelect
                        onLevelSelect={handleLevelSelect}
                        onCancel={handleCancelLevelSelect}
                        showCancelButton={gameState.currentRound > 1}
                    />
                )}

                {gameState.phase === 'EMPTY_TILE_INTERACTION' && (
                    <EmptyTilePopup
                        gameState={gameState}
                        onResolve={handleEmptyTileResolve}
                        onSkip={handleEmptyTileSkip}
                        onMinimize={handleEmptyTileMinimize}
                        layout={layout}
                        isEditMode={isEditMode}
                    />
                )}

                {gameState.phase === 'GOAL_REWARD_SELECTION' && !isGoalAnimating && (
                    <GoalRewardPopup
                        playerName={gameState.players[gameState.currentPlayerId].name}
                        onSelect={handleGoalRewardResolve}
                    />
                )}

                {isAddingTokenForPlayer && (
                    <AddTokenModal safeZones={gameState.board.flat().filter(t => t?.type === TileType.SafeZone && (t.owner === isAddingTokenForPlayer || !t.owner))} onSelect={handleConfirmAddToken} onClose={() => setIsAddingTokenForPlayer(null)} />
                )}
                {isEditMode && editingTile && (
                    <EditTileModal tile={editingTile} onUpdateTile={handleUpdateTile} onClose={() => setEditingTile(null)} onDelete={handleDeleteTile} onUpdateConnections={handleUpdateConnections} connections={gameState.connections} allTileIds={gameState.board.flat().filter(Boolean).map(t => t!.id)} />
                )}
                
                {isEditMode && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        dragElastic={0}
                        className="fixed bg-gray-950 p-6 rounded-2xl border border-indigo-500 shadow-2xl z-50 flex flex-col gap-4 backdrop-blur-xl max-w-5xl cursor-grab active:cursor-grabbing"
                        style={{ bottom: 40, left: '50%', x: '-50%' }}
                    >
                        <div className="flex gap-6 items-start border-b border-white/10 pb-4 overflow-x-auto">
                            <div className="flex flex-col gap-2 shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Global Settings</span>
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] text-gray-500 font-bold uppercase">Max Rounds</label>
                                        <input type="number" value={gameState.maxRounds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateMaxRounds(parseInt(e.target.value, 10))} className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-12 text-xs" min="1"/>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] text-gray-500 font-bold uppercase">Accuracy %</label>
                                        <input type="number" value={gameState.accuracyRate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateAccuracyRate(parseInt(e.target.value, 10))} className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-12 text-xs" min="0" max="100"/>
                                    </div>
                                </div>
                            </div>

                            {/* Ultimate Button Config */}
                            <div className="flex flex-col gap-2 shrink-0 border-l border-white/10 pl-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Ult Button</span>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                    {([
                                        ['Bottom', 'bottom', 5],
                                        ['Left',   'left',   5],
                                        ['Size',   'size',   4],
                                    ] as [string, keyof typeof layout.ultButton, number][]).map(([label, axis, step]) => (
                                        <div key={axis} className="flex flex-col gap-1">
                                            <label className="text-[9px] text-gray-500 font-bold uppercase">{label}</label>
                                            <input
                                                type="number"
                                                value={layout.ultButton[axis]}
                                                step={step}
                                                min={axis === 'size' ? 40 : 0}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setLayout(l => ({ ...l, ultButton: { ...l.ultButton, [axis]: parseInt(e.target.value, 10) } }))
                                                }
                                                className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-16 text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Roll Button Config */}
                            <div className="flex flex-col gap-2 shrink-0 border-l border-white/10 pl-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Roll Button</span>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                    {([
                                        ['Bottom', 'bottom', 5],
                                        ['Right',  'right',  5],
                                        ['Size',   'size',   4],
                                    ] as [string, keyof typeof layout.rollButton, number][]).map(([label, axis, step]) => (
                                        <div key={axis} className="flex flex-col gap-1">
                                            <label className="text-[9px] text-gray-500 font-bold uppercase">{label}</label>
                                            <input
                                                type="number"
                                                value={layout.rollButton[axis]}
                                                step={step}
                                                min={axis === 'size' ? 40 : 0}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setLayout(l => ({ ...l, rollButton: { ...l.rollButton, [axis]: parseInt(e.target.value, 10) } }))
                                                }
                                                className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-16 text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setLayout(DEFAULT_LAYOUT)}
                                    className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors mt-1 text-left"
                                >
                                    Reset to default
                                </button>
                            </div>

                            {/* Tool Popup Position */}
                            <div className="flex flex-col gap-2 shrink-0 border-l border-white/10 pl-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Tool Popup</span>
                                <p className="text-[9px] text-zinc-500">Offset from bottom-center</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {(['x', 'y'] as const).map(axis => (
                                        <div key={axis} className="flex flex-col gap-1">
                                            <label className="text-[9px] text-gray-500 font-bold uppercase">{axis.toUpperCase()}</label>
                                            <input
                                                type="number"
                                                value={layout.toolPopup[axis]}
                                                step={5}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setLayout(l => ({ ...l, toolPopup: { ...l.toolPopup, [axis]: parseInt(e.target.value, 10) } }))
                                                }
                                                className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-16 text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive Queue Position */}
                            <div className="flex flex-col gap-2 shrink-0 border-l border-white/10 pl-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Queue Position</span>
                                <p className="text-[9px] text-zinc-500">Offset from bottom-center</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {(['x', 'y'] as const).map(axis => (
                                        <div key={axis} className="flex flex-col gap-1">
                                            <label className="text-[9px] text-gray-500 font-bold uppercase">{axis.toUpperCase()}</label>
                                            <input
                                                type="number"
                                                value={layout.interactiveQueue[axis]}
                                                step={5}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setLayout(l => ({ ...l, interactiveQueue: { ...l.interactiveQueue, [axis]: parseInt(e.target.value, 10) } }))
                                                }
                                                className="bg-gray-900 border border-gray-800 text-white font-bold rounded-lg px-2 py-1 w-16 text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleExportTiles} className="bg-emerald-700 hover:bg-emerald-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg">Export Tiles JSON</button>
                            <button onClick={() => tileImportRef.current?.click()} className="bg-teal-700 hover:bg-teal-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg">Import Tiles JSON</button>
                            <input type="file" ref={tileImportRef} onChange={handleImportTiles} className="hidden" accept="application/json" />
                            <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg">Import Map JSON</button>
                            <input type="file" ref={fileInputRef} onChange={handleImportMap} className="hidden" accept="application/json" />
                        </div>
                    </motion.div>
                )}
            </main>

        </div>
    );
};

export default App;