
import React from 'react';
import { PlayerID, TileType } from '../types.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from './Icons.tsx';

interface SkillModalProps {
    playerId: PlayerID;
    playerQueue: TileType[];
    opponentQueue: TileType[];
    onAction: (elementIndex: number | null) => void;
}

const ElementButton: React.FC<{ type: TileType, onClick: () => void, isSmall?: boolean; className?: string }> = ({ type, onClick, isSmall, className }) => {
    const sizeClass = isSmall ? "w-8 h-8" : "w-14 h-14";
    const props = { className: `${sizeClass} shrink-0 ${className}` };
    let icon = null;
    switch (type) {
        case TileType.Fire: icon = <FireIcon {...props} className={`${props.className} text-red-500`} />; break;
        case TileType.Ice: icon = <IceIcon {...props} className={`${props.className} text-blue-500`} />; break;
        case TileType.Grass: icon = <GrassIcon {...props} className={`${props.className} text-green-500`} />; break;
        case TileType.Rock: icon = <RockIcon {...props} className={`${props.className} text-gray-500`} />; break;
    }
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-center rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm ${isSmall ? 'p-1' : 'p-2'}`}
        >
            {icon}
        </button>
    );
};

export const SkillModal: React.FC<SkillModalProps> = ({ 
    playerId, 
    playerQueue, 
    opponentQueue, 
    onAction 
}) => {
    const isP1 = playerId === 'Player1';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-6 border-4 border-indigo-500">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        {isP1 ? 'Purify Skill' : 'Sabotage Skill'}
                    </h2>
                </div>

                <div className="py-2 border-y border-gray-100">
                    <p className="text-gray-600 text-sm font-medium mb-4">
                        {isP1 
                            ? "Remove the last element in your queue to make room for better combos!" 
                            : "Choose one element from your opponent's queue to destroy it!"}
                    </p>

                    {isP1 ? (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Queue Preview</h4>
                            <div className="flex justify-center gap-2">
                                {playerQueue.map((type, i) => (
                                    <div key={i} className={`w-10 h-10 rounded-lg bg-gray-50 border flex items-center justify-center ${i === playerQueue.length - 1 ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200'}`}>
                                        <ElementButton type={type} onClick={() => {}} isSmall />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opponent&apos;s Queue (Pick to Delete)</h4>
                            <div className="flex justify-center gap-3">
                                {opponentQueue.map((type, i) => (
                                    <ElementButton 
                                        key={i} 
                                        type={type} 
                                        onClick={() => onAction(i)} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {isP1 && (
                        <button 
                            onClick={() => onAction(playerQueue.length - 1)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl uppercase tracking-tighter shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                            Kích hoạt (Purify Last)
                        </button>
                    )}
                    
                    <button 
                        onClick={() => onAction(null)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-3 px-6 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95"
                    >
                        Không sử dụng (Skip)
                    </button>
                </div>

                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    Skipping preserves manual activation for later this turn or next.
                </p>
            </div>
        </div>
    );
};
