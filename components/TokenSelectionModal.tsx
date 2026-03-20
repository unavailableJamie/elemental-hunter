
import React from 'react';
import type { TokenState, GameState, TileData } from '../types.ts';
import { TileType } from '../types.ts';
import { findPath } from '../utils/pathfinding.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from './Icons.tsx';
import { TokenVisual } from './TokenVisual.tsx';

interface TokenSelectionModalProps {
    tokens: TokenState[];
    onSelectToken: (token: TokenState) => void;
    gameState: GameState;
}

const TargetElement: React.FC<{ type: TileType }> = ({ type }) => {
    const props = { className: "w-6 h-6 inline-block align-middle mr-1" };
    switch (type) {
        case TileType.Fire: return <span className="text-red-500 flex items-center"><FireIcon {...props} /> Fire</span>;
        case TileType.Ice: return <span className="text-blue-500 flex items-center"><IceIcon {...props} /> Ice</span>;
        case TileType.Grass: return <span className="text-green-500 flex items-center"><GrassIcon {...props} /> Grass</span>;
        case TileType.Rock: return <span className="text-gray-500 flex items-center"><RockIcon {...props} /> Rock</span>;
        case TileType.Ladder: return <span className="text-indigo-500 flex items-center">Ladder</span>;
        case TileType.SafeZone: return <span className="text-rose-500 flex items-center">Safe Zone</span>;
        case TileType.Center: return <span className="text-amber-500 flex items-center">Center</span>;
        default: return <span className="text-gray-400 flex items-center">Normal</span>;
    }
};

export const TokenSelectionModal: React.FC<TokenSelectionModalProps> = ({ tokens, onSelectToken, gameState }) => {
    const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);

    return (
        <div className="fixed lg:right-6 lg:top-1/2 lg:-translate-y-1/2 bottom-4 left-4 right-4 lg:left-auto lg:w-80 z-40">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-xl font-black text-gray-900">Choose Token</h2>
                    <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">
                        Dice: {diceTotal}
                    </div>
                </div>
                
                <div className="space-y-3">
                    {tokens.map(token => {
                        const path = findPath(token.tileId, diceTotal, token.playerId, gameState);
                        const targetTileId = path[path.length - 1];
                        const targetTile = gameState.board.flat().find((t: TileData | null) => t && t.id === targetTileId);
                        
                        return (
                            <button
                                key={token.id}
                                onClick={() => onSelectToken(token)}
                                className="w-full flex items-center gap-4 p-3 bg-gray-50 hover:bg-amber-50 border border-gray-200 rounded-xl text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
                            >
                                <TokenVisual 
                                    playerId={token.playerId} 
                                    diamonds={token.diamonds} 
                                    size={44}
                                    className="shrink-0"
                                />
                                <div className="flex-grow">
                                    <p className="font-black text-gray-900 group-hover:text-amber-900">Token #{token.id}</p>
                                    <div className="text-sm text-gray-700 flex flex-col">
                                        <span className="font-medium">Carrying {token.diamonds} KC</span>
                                        {targetTile && (
                                            <div className="mt-1.5 bg-white p-1 rounded-lg border border-black/5 flex items-center shadow-sm">
                                                <span className="text-[9px] uppercase font-black text-gray-400 mr-2 tracking-wider">Landed:</span>
                                                <TargetElement type={targetTile.type} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                
                <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
                    Pick a token to confirm move
                </p>
            </div>
        </div>
    );
};
