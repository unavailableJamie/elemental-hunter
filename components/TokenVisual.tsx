
import React from 'react';
import type { PlayerID } from '../types.ts';
import { PLAYER1_TOKEN_B64, PLAYER2_TOKEN_B64 } from '../constants.ts';
import { ManagedImage } from './ManagedImage.tsx';
import { AtkPip } from './Icons.tsx';

interface TokenVisualProps {
    playerId: PlayerID;
    atk: number;
    size?: number;
    className?: string;
}

export const TokenVisual: React.FC<TokenVisualProps> = ({ playerId, atk, size = 36, className = "" }) => {
    const isP1 = playerId === 'Player1';
    const tokenImg = isP1 ? PLAYER1_TOKEN_B64 : PLAYER2_TOKEN_B64;
    
    // Team colors
    const teamBg = isP1 ? 'bg-red-600' : 'bg-green-600';
    const teamBorder = isP1 ? 'border-red-800' : 'border-green-800';
    
    return (
        <div 
            className={`relative rounded-full border-2 ${teamBg} ${teamBorder} shadow-lg flex items-center justify-center overflow-hidden ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            {/* Silhouette Icon (Subtle Background) */}
            <div className="absolute inset-0 opacity-20 flex items-center justify-center p-1">
                <ManagedImage
                    src={tokenImg}
                    alt={`Team ${playerId}`}
                    className="w-full h-full object-contain grayscale brightness-200"
                />
            </div>

            {/* Primary Detail: ATK Count */}
            <div className="relative z-20 flex flex-col items-center justify-center leading-none">
                <span className="text-[14px] font-black text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {atk}
                </span>
                <AtkPip className="w-2.5 h-2.5" />
            </div>
        </div>
    );
};
