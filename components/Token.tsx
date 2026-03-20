
import React from 'react';
import type { TokenState } from '../types.ts';
import { TOKEN_IMAGE_SIZE } from '../constants.ts';
import { TokenVisual } from './TokenVisual.tsx';

interface TokenProps {
    token: TokenState;
    position: { x: number; y: number };
    isSelected: boolean;
    isSelectable: boolean;
    isCurrentPlayerToken: boolean;
    onClick: (token: TokenState) => void;
}

export const Token: React.FC<TokenProps> = ({ 
    token, 
    position, 
    isSelected, 
    isSelectable, 
    isCurrentPlayerToken, 
    onClick
}) => {
    const isFrozen = token.frozenRounds > 0;
    const zoomStyle = isCurrentPlayerToken && !isFrozen ? { animation: 'token-zoom 2.0s ease-in-out infinite' } : {};
    
    return (
        <div
            className={`absolute transition-all duration-100 group`}
            style={{
                width: `${TOKEN_IMAGE_SIZE}px`,
                height: `${TOKEN_IMAGE_SIZE}px`,
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
                cursor: isFrozen ? 'not-allowed' : 'pointer',
                zIndex: isSelected ? 20 : 10,
            }}
            onClick={() => !isFrozen && onClick(token)}
        >
            {/* Selection/Selectable Highlighting */}
            {isSelected && (
                <div className="absolute -inset-2 rounded-full border-4 border-[#8F0694] z-0 animate-pulse"></div>
            )}
             {isSelectable && !isSelected && (
                <div className="absolute -inset-1 rounded-full bg-white opacity-40 blur-sm animate-pulse z-0"></div>
            )}
            
            {/* Token Base Container using shared visual with zoom animation */}
            <div 
                className="relative z-10 rounded-full" 
                style={zoomStyle}
            >
                <TokenVisual 
                    playerId={token.playerId} 
                    atk={token.atk} 
                    size={TOKEN_IMAGE_SIZE} 
                />
                
                {/* Frozen Overlay */}
                {isFrozen && (
                    <div className="absolute inset-0 bg-blue-400/50 rounded-full flex items-center justify-center border-2 border-white/50 animate-pulse">
                        <svg className="w-4 h-4 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L6 8L8 14L12 22L16 14L18 8L12 2Z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Tooltip-style Token ID */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/80 text-[8px] text-white px-1 rounded">#{token.id} {isFrozen ? '(Frozen)' : ''}</span>
            </div>
        </div>
    );
};
