
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CharacterSystemApp } from './character/CharacterSystemApp.tsx';
import { LobbyScene } from './character/scenes/LobbyScene.tsx';
import { TutorialFlow } from './tutorial/TutorialFlow.tsx';
import { Board } from './components/Board.tsx';
import { EditTileModal } from './components/EditTileModal.tsx';
import { AddTokenModal } from './components/AddTokenModal.tsx';
import { TestingDashboard } from './components/TestingDashboard.tsx';
import { PlayerInfo } from './components/PlayerInfo.tsx';
import { GameLog } from './components/GameLog.tsx';
import { TrophyIcon } from './components/Icons.tsx';
import { LevelSelect } from './components/LevelSelect.tsx';
import type { GameState, PlayerID, TokenState, TileData, MapData, Connection, GameLevel } from './types.ts';
import { TileType } from './types.ts';
import {  generateDefaultGameState, TILE_SIZE } from './constants.ts';
import { findPath, getStepsToGoal } from './utils/pathfinding.ts';
import { resolveMove, endTurn, addLog, hasAnyLegalMove, processCombos, awardMana } from './utils/gameLogic.ts';
import { ULTIMATES, CHARACTERS } from './config/characters.ts';
import { DOUBLE_ROLL_COOLDOWN_ROUNDS, MAX_CONSECUTIVE_ROLLS } from './config/balance.ts';
import { EmptyTilePopup } from './components/EmptyTilePopup.tsx';
import { GoalRewardPopup } from './components/GoalRewardPopup.tsx';
import { applyRoleResolution } from './utils/roleResolver.ts';
import { TILE_POSITIONS } from './boardLayout.ts';
import { FINAL_GOALS } from './boardSpec.ts';

const ANIMATION_STEP_DELAY = 60;

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
    
    // UI enhancements state
    const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
    const nextEffectIdRef = useRef(0);
    const [animateRound, setAnimateRound] = useState(false);
    const prevRoundRef = useRef(gameState.currentRound);
    const prevStateRef = useRef<GameState>(gameState);
    
    

    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationTimeoutRef = useRef<number | null>(null);

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
                        const newEffect: VisualEffect = {
                            id: nextEffectIdRef.current++,
                            type: 'atk',
                            x: pixelX,
                            y: pixelY,
                            text: `+${gained} ATK`
                        };
                        setVisualEffects(prev => [...prev, newEffect]);
                        setTimeout(() => setVisualEffects(curr => curr.filter(e => e.id !== newEffect.id)), 1500);
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
                const finalState = endTurn({ ...tempState, diceCount: count, dice: newDice, hasRolledDoubles: isDoubles });
                finalState.logs = addLog(finalState, `No legal moves for ${currentPlayer.name}. Turn passed.`);
                return finalState;
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
    }, []);

    

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

    const handleToggleTileIds = () => {
        setGameState(prev => ({ ...prev, showTileIds: !prev.showTileIds }));
    };

    const handleToggleMovePreview = () => {
        setGameState(prev => ({ ...prev, showMovePreview: !prev.showMovePreview }));
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

                {/* Top Center Round Counter */}
                {activeView === 'game' && !gameState.winner && (
                    <div className={`flex items-center gap-4 px-6 py-2 rounded-full border-2 transition-all duration-500 ${gameState.currentRound > gameState.maxRounds - 3 ? 'border-red-600 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-white/10 bg-white/5'} ${animateRound ? 'scale-110' : 'scale-100'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match Progress</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-black italic tracking-tighter ${gameState.currentRound > gameState.maxRounds - 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                ROUND {gameState.currentRound}
                            </span>
                            <span className="text-gray-600 font-black text-xl">/</span>
                            <span className="text-gray-400 font-black text-xl">{gameState.maxRounds}</span>
                        </div>
                    </div>
                )}

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
                    
                    <button onClick={handleToggleTileIds} className={`px-4 py-2 text-xs font-black rounded-lg transition-all border uppercase tracking-wider ${gameState.showTileIds ? "bg-amber-600 text-white border-amber-400" : "bg-gray-800 text-amber-300 border-amber-900/50 hover:bg-gray-700"}`}>
                        {gameState.showTileIds ? 'Hide IDs' : 'Show IDs'}
                    </button>

                    <button
                        onClick={() => setAppScene('lobby')}
                        className="px-4 py-2 text-xs font-black rounded-lg transition-all border uppercase tracking-wider bg-gray-800 text-gray-300 border-white/10 hover:bg-gray-700"
                    >
                        ← Lobby
                    </button>

                    {isEditMode && (
                        <button 
                            onClick={handleToggleMovePreview} 
                            className={`px-4 py-2 text-xs font-black rounded-lg transition-all border uppercase tracking-wider ${gameState.showMovePreview ? "bg-emerald-600 text-white border-emerald-400" : "bg-gray-800 text-emerald-300 border-emerald-900/50 hover:bg-gray-700"}`}
                        >
                            {gameState.showMovePreview ? 'Preview: ON' : 'Preview: OFF'}
                        </button>
                    )}
                    
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
            
            <main className="flex-grow flex items-center justify-between px-8 py-4 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(30,27,75,0.2)_0%,transparent_70%)]">
                {activeView === 'testing' && <TestingDashboard />}
                {activeView === 'game' && (
                    <>
                        {/* Left Side: Player 2 (Green) */}
                        <div className="shrink-0 z-20">
                            <PlayerInfo
                                key={`Player2-${gameKey}`}
                                player={gameState.players.Player2}
                                isActive={gameState.currentPlayerId === 'Player2'}
                                onAddToken={() => setIsAddingTokenForPlayer('Player2')} 
                                disabled={gameState.phase === 'ANIMATING'} 
                                onUltimateActivate={handleUltimateActivate}
                                onClearManaFeedback={handleClearManaFeedback}
                                gameState={gameState}
                                onRollDice={handleRollDice}
                                onConfirmMove={handleConfirmMove}
                                isMoveValid={isMoveValid}
                                hasLegalMoves={hasLegalMoves}
                                onDeadlockEndTurn={handleDeadlockEndTurn}
                            />
                        </div>

                        {/* Center: Board */}
                        <div className="relative flex-grow flex flex-col items-center justify-center gap-8">
                            <div className="relative shadow-[0_0_150px_rgba(0,0,0,0.8)] rounded-xl bg-gray-950/40 border border-white/5 p-10">
                                <Board 
                                    gameState={gameState} 
                                    isEditMode={isEditMode} 
                                    onTokenSelect={handleTokenSelect} 
                                    onSelectTile={setEditingTile} 
                                    onAddTile={handleAddNewTileAtPosition} 
                                    previewTileId={previewTileId} 
                                    isMoveValid={isMoveValid} 
                                    onPreviewTileClick={handleConfirmMove}
                                    onTeleportSelect={handleTeleportDestinationSelect}
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
                                
                                {/* Ultimate Activation Visual Feedback Overlay */}
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

                            {/* Game Log - Below board */}
                            <div className="w-full max-w-2xl z-20">
                                <GameLog logs={gameState.logs} />
                            </div>
                        </div>

                        {/* Right Side: Player 1 (Red) */}
                        <div className="shrink-0 z-20">
                            <PlayerInfo
                                key={`Player1-${gameKey}`}
                                player={gameState.players.Player1}
                                isActive={gameState.currentPlayerId === 'Player1'}
                                onAddToken={() => setIsAddingTokenForPlayer('Player1')} 
                                disabled={gameState.phase === 'ANIMATING'} 
                                onUltimateActivate={handleUltimateActivate}
                                onClearManaFeedback={handleClearManaFeedback}
                                gameState={gameState}
                                onRollDice={handleRollDice}
                                onConfirmMove={handleConfirmMove}
                                isMoveValid={isMoveValid}
                                hasLegalMoves={hasLegalMoves}
                                onDeadlockEndTurn={handleDeadlockEndTurn}
                            />
                        </div>
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
                    />
                )}

                {gameState.phase === 'GOAL_REWARD_SELECTION' && (
                    <GoalRewardPopup 
                        playerName={gameState.players[gameState.currentPlayerId].name}
                        elementQueue={gameState.players[gameState.currentPlayerId].elementQueue}
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
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-950 p-6 rounded-2xl border border-indigo-500 shadow-2xl z-50 flex flex-col gap-4 backdrop-blur-xl max-w-5xl">
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
                            <div className="w-px h-12 bg-white/10 self-center shrink-0" />
                            {['Player1', 'Player2'].map((pId) => (
                              <div key={pId} className="flex flex-col gap-2 shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{pId === 'Player1' ? 'Red' : 'Green'} Config</span>
                                <div className="flex gap-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] text-gray-500 font-bold uppercase">Ult Type</label>
                                    <select 
                                      value={gameState.players[pId as PlayerID].config.ultimateType}
                                      onChange={(e) => {
                                        const type = e.target.value as 'extraRoll' | 'teleport';
                                        setGameState(prev => {
                                            const fresh = generateDefaultGameState(prev.tileGoldEnabled);
                                            return {
                                                ...fresh,
                                                maxRounds: prev.maxRounds,
                                                accuracyRate: prev.accuracyRate,
                                                players: Object.keys(prev.players).reduce((acc, pKey) => {
                                                    const id = pKey as PlayerID;
                                                    const config = { ...prev.players[id].config };
                                                    if (id === pId) {
                                                        config.ultimateType = type;
                                                        const newCost = ULTIMATES[type].cost;
                                                        config.ultimateCost = newCost;
                                                        acc[id] = { ...fresh.players[id], config, manaCap: newCost };
                                                    } else {
                                                        acc[id] = { ...fresh.players[id], config };
                                                    }
                                                    return acc;
                                                }, {} as Record<PlayerID, PlayerState>),
                                                logs: [`${pId} config updated. Starting new match...`]
                                            };
                                        });
                                      }}
                                      className="bg-gray-900 border border-gray-800 text-white text-[10px] rounded p-1"
                                    >
                                      <option value="extraRoll">Extra Roll</option>
                                      <option value="teleport">Teleport</option>
                                      
                                    </select>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] text-gray-500 font-bold uppercase">Ult Cost</label>
                                    <input 
                                      type="number" 
                                      value={gameState.players[pId as PlayerID].config.ultimateCost} 
                                      onChange={(e) => {
                                        const cost = parseInt(e.target.value, 10);
                                        setGameState(prev => {
                                            const fresh = generateDefaultGameState(prev.tileGoldEnabled);
                                            return {
                                                ...fresh,
                                                maxRounds: prev.maxRounds,
                                                accuracyRate: prev.accuracyRate,
                                                players: Object.keys(prev.players).reduce((acc, pKey) => {
                                                    const id = pKey as PlayerID;
                                                    const config = { ...prev.players[id].config };
                                                    if (id === pId) config.ultimateCost = isNaN(cost) ? 0 : cost;
                                                    acc[id] = { ...fresh.players[id], config, manaCap: config.ultimateCost };
                                                    return acc;
                                                }, {} as Record<PlayerID, PlayerState>),
                                                logs: [`${pId} config updated. Starting new match...`]
                                            };
                                        });
                                      }}
                                      className="bg-gray-900 border border-gray-800 text-white text-[10px] rounded p-1 w-10"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg">Import JSON</button>
                            <input type="file" ref={fileInputRef} onChange={handleImportMap} className="hidden" accept="application/json" />
                        </div>
                    </div>
                )}
            </main>

        </div>
    );
};

export default App;