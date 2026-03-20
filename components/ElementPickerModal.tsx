
import React from 'react';
import { TileType, TokenState } from '../types.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from './Icons.tsx';
import { TokenVisual } from './TokenVisual.tsx';

interface ElementPickerModalProps {
    onSelect: (type: TileType | null) => void;
    playerName: string;
    elementQueue: TileType[];
    playerTokens: TokenState[];
}

const ELEMENT_OPTIONS = [
    { type: TileType.Fire, icon: FireIcon, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { type: TileType.Ice, icon: IceIcon, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { type: TileType.Grass, icon: GrassIcon, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { type: TileType.Rock, icon: RockIcon, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

const SmallElementIcon: React.FC<{ type: TileType; className?: string }> = ({ type, className }) => {
    const props = { className: `w-6 h-6 shrink-0 ${className}` };
    switch (type) {
        case TileType.Fire: return <FireIcon {...props} className={`${props.className} text-red-500`} />;
        case TileType.Ice: return <IceIcon {...props} className={`${props.className} text-blue-500`} />;
        case TileType.Grass: return <GrassIcon {...props} className={`${props.className} text-green-500`} />;
        case TileType.Rock: return <RockIcon {...props} className={`${props.className} text-gray-500`} />;
        default: return null;
    }
};

const HorsePreview: React.FC<{ tokens: TokenState[] }> = ({ tokens }) => {
    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Your Horses Status</h4>
            <div className="flex justify-center gap-6 py-2">
                {tokens.map((token) => (
                    <TokenVisual 
                        key={token.id} 
                        playerId={token.playerId} 
                        diamonds={token.diamonds} 
                        size={48} 
                    />
                ))}
            </div>
        </div>
    );
};

const QueueDisplay: React.FC<{ queue: TileType[] }> = ({ queue }) => {
    const displaySlots = Array(4).fill(null).map((_, i) => queue[i] || null);

    return (
        <div className="space-y-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Current Element Queue</h4>
            <div className="flex justify-center gap-2 bg-gray-100 p-2 rounded-xl border border-gray-200 shadow-inner max-w-xs mx-auto">
                {displaySlots.map((type, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        {type && <SmallElementIcon type={type} />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ElementPickerModal: React.FC<ElementPickerModalProps> = ({ onSelect, playerName, elementQueue, playerTokens }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center space-y-6 border-4 border-amber-400">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Gold Deposited!</h2>
                    <p className="text-gray-600 font-medium text-sm">
                        Nice work, <span className="font-bold text-gray-900">{playerName}</span>!
                    </p>
                </div>

                <HorsePreview tokens={playerTokens} />

                <QueueDisplay queue={elementQueue} />

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {ELEMENT_OPTIONS.map((opt) => (
                            <button
                                key={opt.type}
                                onClick={() => onSelect(opt.type)}
                                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 ${opt.bgColor} ${opt.borderColor} hover:border-amber-400 transition-all transform hover:scale-105 active:scale-95 shadow-sm`}
                            >
                                <opt.icon className={`w-10 h-10 mb-2 ${opt.color} group-hover:scale-110 transition-transform`} />
                                <span className={`font-black uppercase tracking-widest text-[10px] ${opt.color}`}>
                                    {opt.type}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onSelect(null)}
                        className="w-full py-3 px-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-black uppercase tracking-widest text-xs hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Keep Queue as is (Skip)
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Choice triggers combo logic immediately.
                </p>
            </div>
        </div>
    );
};
