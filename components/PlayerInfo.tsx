
import React, { useState, useEffect } from 'react';
import { TileType, ManaFeedback, PlayerID } from '../types.ts';
import type { GameState } from '../types.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon, DiceIcon, AtkPip, ManaPip } from './Icons.tsx';
import { MAX_TOKENS_PER_PLAYER } from '../constants.ts';
import { Dice } from './Dice.tsx';
import { CHARACTERS, ULTIMATES } from '../config/characters.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';

const POWER_RANGES: [number, number][] = [
    [2, 4],
    [5, 7],
    [7, 9],
    [10, 12]
];

const CYCLE_DURATION = 2100;


export const ElementIcon: React.FC<{ type: TileType, sizeOverride?: string }> = ({ type, sizeOverride }) => {
    const sizeClass = sizeOverride || "w-5 h-5 shrink-0"; 
    
    switch (type) {
        case TileType.Fire: 
            return <FireIcon className={`${sizeClass} text-red-600`} />;
        case TileType.Ice: 
            return <IceIcon className={`${sizeClass} text-blue-500`} />;
        case TileType.Grass: 
            return <GrassIcon className={`${sizeClass} text-green-600`} />;
        case TileType.Rock: 
            return <RockIcon className={`${sizeClass} text-gray-600`} />;
        default: 
            return null;
    }
};

interface PlayerInfoProps {
    player: GameState['players'][keyof GameState['players']];
    isActive: boolean;
    onAddToken: () => void;
    disabled: boolean;
    
    onUltimateActivate?: () => void;
    onClearManaFeedback: (pId: PlayerID) => void;
    
    // New Control Props
    gameState: GameState;
    onRollDice: (count: 1 | 2, targetRange?: [number, number]) => void;
    onConfirmMove: () => void;
    isMoveValid: boolean;
    hasLegalMoves: boolean;
    onDeadlockEndTurn: () => void;
}


export const PlayerInfo: React.FC<PlayerInfoProps> = ({ 
    player, 
    isActive, 
    onAddToken, 
    disabled, 
    onUltimateActivate,
    onClearManaFeedback,
    gameState,
    onRollDice,
    onConfirmMove,
    isMoveValid,
    hasLegalMoves,
    onDeadlockEndTurn
}) => {
    const { phase, dice, selectedTokenId } = gameState;
    const character = CHARACTERS[player.config.characterId];
    const ultimate = ULTIMATES[player.config.ultimateType];
    const maxHp = character?.hp ?? LEVEL_CONFIGS[gameState.selectedLevel].playerHP;
    const canAddToken = player.tokens.length < MAX_TOKENS_PER_PLAYER;
    const isUltimateCharged = player.mana >= player.manaCap;
    const canUseUltimate = isUltimateCharged && isActive;

    // One-time slam animation when it becomes the player's turn with ultimate ready
    const [isUltimateSlamming, setIsUltimateSlamming] = useState(false);
    const prevCanUseRef = React.useRef(false);
    useEffect(() => {
        if (canUseUltimate && !prevCanUseRef.current) {
            setIsUltimateSlamming(true);
            const timer = setTimeout(() => setIsUltimateSlamming(false), 700);
            return () => clearTimeout(timer);
        }
        prevCanUseRef.current = canUseUltimate;
    }, [canUseUltimate]);
    const animationStyle = isActive ? { animation: 'panel-zoom 3s ease-in-out infinite' } : {};
    const isUIDisabled = phase === 'ANIMATING' || !isActive;
    
    // Power Roll State
    const [isRolling, setIsRolling] = useState(false);
    const [progress, setProgress] = useState(0);
    const rollStartTimeRef = React.useRef<number | null>(null);
    const animationFrameRef = React.useRef<number | null>(null);

    const updateProgress = () => {
        if (rollStartTimeRef.current !== null) {
            const elapsed = Date.now() - rollStartTimeRef.current;
            const t = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
            const pingPongProgress = 1 - Math.abs(2 * t - 1);
            setProgress(pingPongProgress);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
    };

    const handleToggleRoll = () => {
        if (isUIDisabled || phase !== 'SELECT_DICE') return;
        
        if (!isRolling) {
            setIsRolling(true);
            rollStartTimeRef.current = Date.now();
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            const finalProgress = progress;
            setIsRolling(false);
            rollStartTimeRef.current = null;
            setProgress(0);
            const rangeIndex = Math.min(Math.floor(finalProgress * POWER_RANGES.length), POWER_RANGES.length - 1);
            const targetRange = POWER_RANGES[rangeIndex];
            onRollDice(2, targetRange);
        }
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // DECLARATIVE SIMULTANEOUS FEEDBACK LOGIC
    const [activeFeedbacks, setActiveFeedbacks] = useState<ManaFeedback[]>([]);
    const [damageFeedbacks, setDamageFeedbacks] = useState<{ id: string; amount: number }[]>([]);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const prevHpRef = React.useRef(player.hp);

    // Track HP changes for floating damage text + shake animation
    useEffect(() => {
        if (player.hp < prevHpRef.current) {
            const damage = prevHpRef.current - player.hp;
            const id = Math.random().toString(36).substring(7);
            setDamageFeedbacks(prev => [...prev, { id, amount: damage }]);
            setIsShaking(true);

            setTimeout(() => {
                setDamageFeedbacks(current => current.filter(item => item.id !== id));
            }, 1500);
            setTimeout(() => setIsShaking(false), 500);
        }
        prevHpRef.current = player.hp;
    }, [player.hp]);

    // Sync global queue to local buffer and clear global queue via callback (no mutation)
    useEffect(() => {
        if (player.manaFeedbackQueue.length > 0) {
            const newGains = [...player.manaFeedbackQueue];
            setActiveFeedbacks(prev => [...prev, ...newGains]);
            onClearManaFeedback(player.id);

            // Cleanup: each item removes itself after 3 seconds (increased from 2s)
            newGains.forEach(gain => {
                setTimeout(() => {
                    setActiveFeedbacks(current => current.filter(item => item.id !== gain.id));
                }, 3000);
            });
        }
    }, [player.manaFeedbackQueue.length, player.id, onClearManaFeedback]);

    const UltimateIcon = DiceIcon;
    

    return (
        <div 
            className={`relative p-4 rounded-xl transition-all duration-300 w-80 ${isActive ? `${player.color} text-white shadow-2xl ring-4 ring-white/20` : 'bg-gray-200 text-gray-800 opacity-90'} space-y-3`}
            style={isShaking ? { animation: 'panel-shake 0.5s ease-out' } : animationStyle}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <h3 className="font-black text-2xl leading-none tracking-tighter uppercase italic">{player.name}</h3>
                    <div className="flex items-center gap-2 mt-2 relative">
                        <span className="text-[10px] font-black uppercase opacity-60">HP:</span>
                        <div className="w-full bg-black/20 rounded-full h-5 border border-white/10 overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(player.hp / maxHp) * 100}%` }}></div>
                        </div>
                        <span className="font-black text-base leading-none w-10 text-right">{player.hp}</span>
                        
                        {/* Floating Damage Feedback */}
                        {damageFeedbacks.map(feedback => (
                            <div 
                                key={feedback.id}
                                className="absolute right-0 -top-6 text-red-500 font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-floating-damage pointer-events-none combo-text-stroke"
                            >
                                -{feedback.amount}
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 border-t border-black/5 pt-1">
                        <span className="text-xs font-black uppercase opacity-60">Total ATK:</span>
                        <span className="font-black text-amber-500 text-lg leading-none">
                            {player.tokens.reduce((acc, t) => acc + t.atk, 0)}
                        </span>
                        <AtkPip className="w-4 h-4" />
                    </div>
                </div>

                {/* Ultimate UI Section */}
                <div
                    className="relative flex flex-col items-center ml-3"
                    onMouseEnter={() => setIsTooltipVisible(true)}
                    onMouseLeave={() => setIsTooltipVisible(false)}
                >
                    {/* Outer glow ring when charged */}
                    {isUltimateCharged && (
                        <div className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500/30 pointer-events-none" style={{ animationDuration: '1.5s' }} />
                    )}
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                        isUltimateCharged
                            ? `bg-indigo-600 border-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.9),0_0_60px_rgba(99,102,241,0.4)] ${isUltimateSlamming ? 'animate-ultimate-slam' : 'animate-ultimate-ready scale-110'}`
                            : 'bg-black/30 border-white/5 opacity-70'
                    }`}>
                        <UltimateIcon className="w-10 h-10 text-white drop-shadow-md" />
                    </div>

                    <div className="mt-2 w-full min-h-[1.5rem] flex flex-col items-center relative">
                        {isUltimateCharged ? (
                            canUseUltimate ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUltimateActivate?.(); }}
                                    disabled={disabled}
                                    className="bg-white text-indigo-700 text-xs font-black uppercase px-4 py-1.5 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 transition-all transform z-10 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                                >
                                    Use
                                </button>
                            ) : (
                                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-widest opacity-80">READY</span>
                            )
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <ManaPip className="w-3.5 h-3.5 shrink-0" />
                                <div className="relative w-16 h-5 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                    <div
                                        className="absolute inset-0 bg-[#057ED5] transition-all duration-500 rounded-full"
                                        style={{ width: `${(player.mana / player.manaCap) * 100}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                        {player.mana}/{player.manaCap}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* Simultaneous Stacked Feedback Container */}
                        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center z-20 pointer-events-none">
                            {activeFeedbacks.map(fb => (
                                <div 
                                    key={fb.id}
                                    className="text-xl font-black sp-floating-text whitespace-nowrap animate-float-up-impact"
                                >
                                    +{fb.amount} MAG
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hover Tooltip */}
                    {isTooltipVisible && ultimate && (
                        <div className={`absolute top-0 ${player.id === 'Player2' ? 'left-full ml-6' : 'right-full mr-6'} w-64 bg-gray-950 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl z-[100] ultimate-tooltip pointer-events-none`}>
                            <h4 className="text-indigo-400 font-black uppercase italic tracking-tighter text-xl mb-2">
                                {ultimate.name}
                            </h4>
                            <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4">
                                {ultimate.description}
                            </p>
                            
                            <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-4">
                                <span className="text-xs font-black uppercase text-gray-500 tracking-wider">MAG Status</span>
                                <span className="text-sm font-black text-indigo-300">{player.mana} / {player.manaCap} MAG</span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest block mb-2">How to earn MAG:</span>
                                <div className="grid grid-cols-1 gap-2 text-xs font-bold text-gray-400">
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                        <span className="opacity-60">Non-Affinity Element</span>
                                        <span className="text-emerald-400 font-black">+{(character?.mag ?? 10) * (player.tileGainMultiplier || 1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                        <span className="opacity-60">Double Roll</span>
                                        <span className="text-yellow-400 font-black">Extra Turn</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center min-h-[32px]">
                 {player.elementAffinity && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase opacity-60">Affinity:</span>
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                            <ElementIcon type={player.elementAffinity} sizeOverride="w-5 h-5" />
                        </div>
                    </div>
                )}
                 {isActive && canAddToken && (
                    <button onClick={onAddToken} disabled={disabled} className="bg-white/30 hover:bg-white/50 rounded-full px-3 py-1 text-xs font-black uppercase shadow-md transition-colors">
                        + New Horse
                    </button>
                )}
            </div>

            <div className="pt-2 border-t border-black/5">
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 opacity-60">Combo Mastery</h4>
                <div className="grid grid-cols-1 gap-1.5">
                    {(() => {
                        const levelConfig = LEVEL_CONFIGS[gameState.selectedLevel];
                        const maxTiers = levelConfig.maxComboTiers;
                        return Array.from({ length: maxTiers }, (_, i) => i + 1).map((tier) => {
                            const isUnlocked = player.comboTier >= tier;
                            const tierInfo = tier === 1 ? character?.comboRewards.tier1 : tier === 2 ? character?.comboRewards.tier2 : character?.comboRewards.tier3;
                            const tierTitle = tierInfo?.title || `Tier ${tier}`;
                            const tierDesc = tierInfo?.description || "";

                            return (
                                <div
                                    key={tier}
                                    className={`group relative p-2 rounded-lg border transition-all duration-500 ${
                                        isUnlocked
                                            ? 'bg-white/20 border-white/40 shadow-md'
                                            : 'bg-black/5 border-transparent'
                                    }`}
                                >
                                    <div className={`flex items-center gap-3 transition-all duration-500 ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
                                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-amber-400 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20 text-white'}`}>
                                            {tier === 1 && <AtkPip className="w-6 h-6" />}
                                            {tier === 2 && (
                                                <div className="relative">
                                                    <ElementIcon type={TileType.Fire} sizeOverride="w-5 h-5" />
                                                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black bg-black text-white px-1 rounded">x2</span>
                                                </div>
                                            )}
                                            {tier === 3 && (
                                                <div className="relative flex">
                                                    <AtkPip className="w-5 h-5 -mr-2" />
                                                    <AtkPip className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-black uppercase leading-none truncate">{tierTitle}</span>
                                            <span className="text-[10px] font-bold leading-tight mt-1">{tierDesc}</span>
                                        </div>
                                        {isUnlocked && (
                                            <div className="ml-auto">
                                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-400">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Zoom Description - Outside the opacity-wrapped div */}
                                    <div className="absolute left-0 right-0 -top-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-full pointer-events-none transition-all duration-300 z-50">
                                        <div className="bg-gray-950 text-white p-3 rounded-xl border border-white/20 shadow-2xl scale-90 group-hover:scale-110 origin-bottom">
                                            <p className="text-xs font-black uppercase text-amber-400 mb-1">{tierTitle}</p>
                                            <p className="text-[11px] font-medium leading-relaxed">{tierDesc}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            <div className="pt-2 border-t border-black/5">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider opacity-60">Element Queue</h4>
                    <span className="text-xs font-black">
                        <span className={
                            player.elementQueue.length >= player.config.maxElementQueue
                                ? (isActive ? 'text-red-300' : 'text-red-500')
                                : (isActive ? 'text-white/80' : 'text-gray-600')
                        }>{player.elementQueue.length}</span>
                        <span className={isActive ? 'text-white/40' : 'text-gray-400'}>/{player.config.maxElementQueue}</span>
                    </span>
                </div>
                <div className="flex items-center flex-wrap gap-2 h-auto bg-white rounded-xl p-2.5 overflow-hidden relative shadow-inner">
                    {player.elementQueue.length > 0 ? (
                        player.elementQueue.map((type, i) => (
                            <ElementIcon key={i} type={type} sizeOverride="w-6 h-6" />
                        ))
                    ) : (
                        <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Empty</span>
                    )}
                </div>
            </div>

            {/* Integrated Controls Section */}
            {isActive && (
                <div className="pt-3 border-t border-black/10 space-y-3">
                    <div className="flex justify-center items-center gap-3 h-16 bg-black/10 rounded-xl border border-white/10 shadow-inner">
                        {dice.length > 0 ? (
                            dice.map((value, index) => (
                                <div key={index} className="scale-90 origin-center">
                                    <Dice value={value} />
                                </div>
                            ))
                        ) : (
                            <div className="text-white/40 italic text-[10px] uppercase tracking-widest font-black animate-pulse">Awaiting Roll</div>
                        )}
                    </div>

                    <div className="min-h-[60px]">
                        {(() => {
                            switch (phase) {
                                case 'SELECT_DICE':
                                    return (
                                        <button 
                                            onClick={handleToggleRoll}
                                            disabled={isUIDisabled} 
                                            className={`relative w-full overflow-hidden font-black h-14 rounded-xl shadow-lg transition-all transform active:scale-95 bg-white text-gray-900 uppercase tracking-tighter text-sm disabled:opacity-50 disabled:cursor-not-allowed select-none touch-none`}
                                        >
                                            {isRolling ? (
                                                <div className="absolute inset-0 flex flex-col">
                                                    <div className="flex-grow flex w-full">
                                                        <div className="h-full w-1/4 bg-red-500/80 flex items-center justify-center text-[10px] font-black border-r border-black/10">2-4</div>
                                                        <div className="h-full w-1/4 bg-orange-500/80 flex items-center justify-center text-[10px] font-black border-r border-black/10">5-7</div>
                                                        <div className="h-full w-1/4 bg-yellow-500/80 flex items-center justify-center text-[10px] font-black border-r border-black/10">7-9</div>
                                                        <div className="h-full w-1/4 bg-green-500/80 flex items-center justify-center text-[10px] font-black">10-12</div>
                                                    </div>
                                                    <div 
                                                        className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_20px_white] z-10 transition-none"
                                                        style={{ left: `calc(${progress * 100}% - 4px)` }}
                                                    />
                                                    <div className="h-4 bg-black/80 text-white flex items-center justify-center text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                        Click to Stop & Roll
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="relative z-10">Click for Power Roll</span>
                                            )}
                                        </button>
                                    );
                                case 'MOVE':
                                    if (!hasLegalMoves) {
                                        return (
                                            <button 
                                                onClick={onDeadlockEndTurn}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-3 rounded-xl shadow-xl transition-all transform hover:scale-[1.02] uppercase tracking-tighter text-xs"
                                            >
                                                No Moves - End Turn
                                            </button>
                                        );
                                    }
                                    return (
                                        <button 
                                            onClick={onConfirmMove}
                                            disabled={selectedTokenId === null || !isMoveValid || isUIDisabled} 
                                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-black py-4 px-3 rounded-xl shadow-xl transition-all transform hover:scale-[1.02] disabled:cursor-not-allowed text-sm uppercase tracking-tighter">
                                            Confirm Move
                                        </button>
                                    );
                                case 'SELECT_TELEPORT_TOKEN':
                                case 'SELECT_TELEPORT_DEST':
                                    return (
                                        <div className="text-center p-3 bg-white/20 border border-white/30 rounded-xl">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                                                {phase === 'SELECT_TELEPORT_TOKEN' ? 'Select a Horse' : 'Select Destination'}
                                            </p>
                                        </div>
                                    );
                                case 'ANIMATING':
                                    return (
                                         <div className="text-center font-black text-white/60 animate-pulse text-xs uppercase tracking-[0.3em] py-4">
                                            MOVING...
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};
