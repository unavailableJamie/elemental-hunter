
import React, { useState, useEffect } from 'react';
import { TileType, PlayerID } from '../types.ts';
import type { GameState } from '../types.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from './Icons.tsx';
import { MAX_TOKENS_PER_PLAYER } from '../constants.ts';
import { CHARACTERS } from '../config/characters.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';

export const ElementIcon: React.FC<{ type: TileType, sizeOverride?: string }> = ({ type, sizeOverride }) => {
    const sizeClass = sizeOverride || "w-5 h-5 shrink-0";
    switch (type) {
        case TileType.Fire:  return <FireIcon  className={`${sizeClass} text-red-600`} />;
        case TileType.Ice:   return <IceIcon   className={`${sizeClass} text-blue-500`} />;
        case TileType.Grass: return <GrassIcon className={`${sizeClass} text-green-600`} />;
        case TileType.Rock:  return <RockIcon  className={`${sizeClass} text-gray-600`} />;
        default: return null;
    }
};

interface PlayerInfoProps {
    player: GameState['players'][keyof GameState['players']];
    isActive: boolean;
    onAddToken: () => void;
    disabled: boolean;
    gameState: GameState;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
    player,
    isActive,
    onAddToken,
    disabled,
    gameState,
}) => {
    const character = CHARACTERS[player.config.characterId];
    const maxHp = character?.hp ?? LEVEL_CONFIGS[gameState.selectedLevel]?.playerHP ?? 1000;
    const canAddToken = player.tokens.length < MAX_TOKENS_PER_PLAYER;
    const animationStyle = isActive ? { animation: 'panel-zoom 3s ease-in-out infinite' } : {};

    // HP damage feedback
    const [damageFeedbacks, setDamageFeedbacks] = useState<{ id: string; amount: number }[]>([]);
    const [isShaking, setIsShaking] = useState(false);
    const prevHpRef = React.useRef(player.hp);

    useEffect(() => {
        if (player.hp < prevHpRef.current) {
            const damage = prevHpRef.current - player.hp;
            const id = Math.random().toString(36).substring(7);
            setDamageFeedbacks(prev => [...prev, { id, amount: damage }]);
            setIsShaking(true);
            setTimeout(() => setDamageFeedbacks(curr => curr.filter(item => item.id !== id)), 1500);
            setTimeout(() => setIsShaking(false), 500);
        }
        prevHpRef.current = player.hp;
    }, [player.hp]);

    // Mana gain feedback is now handled in App.tsx (displayed near Ult button)

    return (
        <div
            className={`relative p-4 rounded-xl transition-all duration-300 w-80 ${
                isActive
                    ? `${player.color} text-white shadow-2xl ring-4 ring-white/20`
                    : 'bg-gray-200 text-gray-800 opacity-90'
            } space-y-3`}
            style={isShaking ? { animation: 'panel-shake 0.5s ease-out' } : animationStyle}
        >
            {/* Element Queue — top */}
            <div className="border-b border-black/10 pb-2">
                <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider opacity-60">Element Queue</h4>
                    <span className="text-[10px] font-black">
                        <span className={
                            player.elementQueue.length >= player.config.maxElementQueue
                                ? (isActive ? 'text-red-300' : 'text-red-500')
                                : (isActive ? 'text-white/80' : 'text-gray-600')
                        }>
                            {player.elementQueue.length}
                        </span>
                        <span className={isActive ? 'text-white/40' : 'text-gray-400'}>
                            /{player.config.maxElementQueue}
                        </span>
                    </span>
                </div>
                <div className="flex items-center flex-wrap gap-2 bg-white rounded-xl p-2 overflow-hidden shadow-inner min-h-[36px]">
                    {player.elementQueue.length > 0 ? (
                        player.elementQueue.map((type, i) => (
                            <ElementIcon key={i} type={type} sizeOverride="w-5 h-5" />
                        ))
                    ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Empty</span>
                    )}
                </div>
            </div>

            {/* Name + HP */}
            <div className="flex-grow">
                <h3 className="font-black text-2xl leading-none tracking-tighter uppercase italic">
                    {player.name}
                </h3>

                {/* HP bar */}
                <div className="flex items-center gap-2 mt-2 relative">
                    <span className="text-[10px] font-black uppercase opacity-60">HP:</span>
                    <div className="w-full bg-black/20 rounded-full h-5 border border-white/10 overflow-hidden">
                        <div
                            className="bg-green-500 h-full transition-all duration-500"
                            style={{ width: `${(player.hp / maxHp) * 100}%` }}
                        />
                    </div>
                    <span className="font-black text-base leading-none w-10 text-right">{player.hp}</span>

                    {damageFeedbacks.map(fb => (
                        <div
                            key={fb.id}
                            className="absolute right-0 -top-6 text-red-500 font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-floating-damage pointer-events-none combo-text-stroke"
                        >
                            -{fb.amount}
                        </div>
                    ))}
                </div>

                {/* Affinity row */}
                <div className="flex items-center gap-2 mt-1 border-t border-black/5 pt-1 min-h-[28px]">
                    {player.elementAffinity ? (
                        <>
                            <span className="text-xs font-black uppercase opacity-60">Affinity:</span>
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md">
                                <ElementIcon type={player.elementAffinity} sizeOverride="w-4 h-4" />
                            </div>
                        </>
                    ) : (
                        <span className="text-xs font-black uppercase opacity-30">No Affinity</span>
                    )}

                </div>
            </div>

            {/* Add Token button */}
            {isActive && canAddToken && (
                <button
                    onClick={onAddToken}
                    disabled={disabled}
                    className="bg-white/30 hover:bg-white/50 rounded-full px-3 py-1 text-xs font-black uppercase shadow-md transition-colors"
                >
                    + New Horse
                </button>
            )}
        </div>
    );
};
